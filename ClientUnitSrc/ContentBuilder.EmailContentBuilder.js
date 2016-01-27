define("EmailContentBuilder", ["ContentBuilderHelper", "ContentBuilderEnums", "css!ContentBuilderCSS"],
	function(ContentBuilderHelper, ContentBuilderEnums) {
		return {
			attributes: {
				/**
				 * Уникальный идентификатор редактируемой записи.
				 */
				RecordId: {
					dataValueType: Terrasoft.DataValueType.GUID,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: null
				},

				/**
				 * Параметры дизайнера контента.
				 */
				ContentBuilderConfig: {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: null
				},

				/**
				 * Режим дизайнера контента.
				 */
				ContentBuilderMode: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: null
				}
			},
			methods: {

				/**
				 * @inheritdoc Terrasoft.ContentBuilder#init
				 * @overriden
				 */
				init: function() {
					this.initParameters();
					this.callParent(arguments);
				},

				/**
				 * @inheritdoc Terrasoft.ContentBuilder#getContentSheetConfig
				 * @overriden
				 */
				getContentSheetConfig: function(callback, scope) {
					var recordId = this.get("RecordId");
					var contentBuilderConfig = this.get("ContentBuilderConfig");
					if (Ext.isEmpty(recordId)) {
						return;
					}
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: contentBuilderConfig.EntitySchemaName
					});
					esq.addColumn(contentBuilderConfig.TemplateConfigColumnName);
					esq.addColumn(contentBuilderConfig.TemplateBodyColumnName);
					esq.getEntity(recordId, function(result) {
						if (result.success) {
							var configJson = result.entity.get(contentBuilderConfig.TemplateConfigColumnName);
							var html = result.entity.get(contentBuilderConfig.TemplateBodyColumnName);
							var config = this.prepareConfig(configJson, html);
							if (callback) {
								callback.call(scope, config);
							}
						}
					}, this);
				},

				/**
				 * @inheritdoc Terrasoft.ContentBuilder#save
				 * @overriden
				 */
				save: function() {
					var scope = this;
					var config = this.getContentBuilderConfig();
					if (Ext.isEmpty(config.Items)) {
						var emptyTemplateMessage = this.get("Resources.Strings.EmptyTemplateMessage");
						Terrasoft.utils.showInformation(emptyTemplateMessage);
						return;
					}
					Terrasoft.utils.showMessage({
						caption: this.get("Resources.Strings.SaveMessage"),
						buttons: ["yes", "no"],
						defaultButton: 0,
						style: Terrasoft.MessageBoxStyles.BLUE,
						handler: function(buttonCode) {
							if (buttonCode === "yes") {
								scope.onSave.call(scope);
							}
						}
					});
				},

				/**
				 * @inheritdoc Terrasoft.ContentBuilder#cancel
				 * @overriden
				 */
				cancel: function() {
					Terrasoft.utils.showMessage({
						caption: this.get("Resources.Strings.ExitMessage"),
						buttons: ["yes", "no"],
						defaultButton: 0,
						style: Terrasoft.MessageBoxStyles.BLUE,
						handler: function(buttonCode) {
							if (buttonCode === "yes") {
								window.close();
							}
						}
					});
				},

				/**
				 * Обновляет параметры шаблона и html-разметку шаблона в базе данных.
				 * @protected
				 */
				onSave: function() {
					this.showBodyMask();
					var recordId = this.get("RecordId");
					var contentBuilderConfig = this.get("ContentBuilderConfig");
					var emailContentExporter = Ext.create("Terrasoft.EmailContentExporter");
					var config = this.getContentBuilderConfig();
					var configText = Terrasoft.encode(config);
					var displayHtml = emailContentExporter.exportData(config);
					var update = Ext.create("Terrasoft.UpdateQuery", {
						rootSchemaName: contentBuilderConfig.EntitySchemaName
					});
					update.enablePrimaryColumnFilter(recordId);
					update.setParameterValue(contentBuilderConfig.TemplateConfigColumnName, configText,
						Terrasoft.DataValueType.TEXT);
					update.setParameterValue(contentBuilderConfig.TemplateBodyColumnName, displayHtml,
						Terrasoft.DataValueType.TEXT);
					update.execute(function(response) {
						this.hideBodyMask();
						if (response.success) {
							this.reloadContent(function() {
								window.close();
							}, this);
						}
					}, this);
				},

				/**
				 * Получает параметры из url-адреса и параметры дизайнера контента.
				 * @protected
				 */
				initParameters: function() {
					var anchor = window.location.href.split("#")[1];
					var parameters = anchor.split("/");
					var recordId = Terrasoft.isGUID(parameters[2]) ? parameters[2] : null;
					var contentBuilderMode = parameters[3];
					var contentBuilderConfig = ContentBuilderEnums.GetContentBuilderConfig(contentBuilderMode);
					this.set("RecordId", recordId);
					this.set("ContentBuilderConfig", contentBuilderConfig);
					this.set("ContentBuilderMode", contentBuilderMode);
				},

				/**
				 * Проверяет объект параметров шаблона, html-разметку и
				 * подготавливает кoнфигурационный элемент контента.
				 * @protected
				 * @param {String} configText Конфиг шаблона.
				 * @param {String} html Html-разметка шаблона.
				 * @return {Object} Кoнфигурация элемента контента.
				 */
				prepareConfig: function(configText, html) {
					var config = null;
					if (Ext.isEmpty(configText) && !Ext.isEmpty(html)) {
						var item = {
							"ItemType": "html",
							"Column": 0,
							"Row": 0,
							"ColSpan": 24,
							"RowSpan": 0,
							"Content": html
						};
						var block = {
							"ItemType": "block",
							"Items": [item]
						};
						config = {
							"ItemType": "sheet",
							"Items": [block]
						};
					} else if (!Ext.isEmpty(configText)) {
						config = Terrasoft.decode(configText);
					} else {
						config = {
							"ItemType": "sheet",
							"Items": []
						};
					}
					return config;
				},

				/**
				 * Отправляет сообщение в канал используя websocket о изменении шаблона.
				 * @param {Object} callback Функция обратного вызова.
				 * @param {Object} scope Контекст выполения функции обратного вызова.
				 * @protected
				 */
				reloadContent: function(callback, scope) {
					var dataSend = {
						recordId: this.get("RecordId"),
						senderName: this.get("ContentBuilderMode")
					};
					var config = {
						serviceName: "ContentBuilderServirce",
						methodName: "ReloadContent",
						data: dataSend
					};
					this.callService(config, function() {
						if (callback) {
							callback.call(scope);
						}
					}, this);
				},

				/**
				 * Возвращает конфигурацию контента холста.
				 * @protected
				 * @return {Object} Кoнфигурация элемента контента.
				 */
				getContentBuilderConfig: function() {
					var contentBuilderHelper = Ext.create("Terrasoft.ContentBuilderHelper");
					return contentBuilderHelper.toJSON(this);
				}
			}
		};
	});
