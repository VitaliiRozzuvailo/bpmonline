define("BaseSystemDesignerSectionV2", ["terrasoft", "SystemDesignerDashboardsModule", "SystemDesignerDashboardBuilder",
		"SystemDesignerDashboardsViewModel"],
	function(Terrasoft) {
		return {
			/**
			 * Сообщения, добавленные или измененные относительно родительской схемы
			 * @type {Object}
			 */
			messages: {
				/**
				 * @message NeedHeaderCaption
				 * Сообщение о необходимости установки заголовка страницы.
				 */
				"NeedHeaderCaption": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message ChangeHeaderCaption
				 * Сообщение для обновления заголовка страницы.
				 * @param {Object} config Конфигурационный объект заголовка.
				 * @param {String} config.caption Заголовок страницы.
				 * @param {Terrasoft.Collection} config.dataViews Коллекция представлений.
				 * @param {String} config.moduleName Название модуля.
				 */
				"ChangeHeaderCaption": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message RerenderModule
				 * Публикация сообщения переотрисовки модуля итогов.
				 * @return {Boolean} Состояние модуля итогов.
				 */
				"RerenderModule": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},

			/**
			 * Методы модели представления раздела
			 * @type {Object}
			 */
			methods: {
				/**
				 * Инициализирует начальное состояние модели представления.
				 * @protected
				 * @overridden
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст.
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.subscribeSandboxEvents();
						this.initDashboardEnums();
						this.initMainHeaderCaption();
						callback.call(scope);
					}, this]);
				},

				/**
				 * Инициирует загрузку сторонних модулей.
				 * @protected
				 */
				onRender: function() {
					this.loadDashboardModule();
				},

				/**
				 * Производит подписку на сообщения sandbox.
				 * @protected
				 */
				subscribeSandboxEvents: function() {
					this.sandbox.subscribe("NeedHeaderCaption", this.initMainHeaderCaption, this);
				},

				/**
				 * Выполняет установку заголовка страницы.
				 * @protected
				 */
				initMainHeaderCaption: function() {
					var dataViews = this.Ext.create("Terrasoft.Collection");
					var caption = this.getCaption();
					this.sandbox.publish("ChangeHeaderCaption", {
						caption: caption,
						dataViews: dataViews,
						moduleName: this.name
					});
				},

				/**
				 * Загружает модуль итогов для отображения плиток.
				 * @protected
				 */
				loadDashboardModule: function() {
					var moduleId = this.sandbox.id + "_SystemDesignerDashboards";
					var renderTo = "SectionItemsContainer";
					var rendered = this.sandbox.publish("RerenderModule", {
						renderTo: renderTo
					}, [moduleId]);
					if (!rendered) {
						this.sandbox.loadModule("SystemDesignerDashboardsModule", {
							renderTo: renderTo,
							id: moduleId
						});
					}
				},

				/**
				 * Возвращает заголовок раздела.
				 * @virtual
				 * @return {String} Заголовок раздела.
				 */
				getCaption: function() {
					return this.get("Resources.Strings.SectionCaption");
				},

				/**
				 * Формирует необходимые для отрисовки модуля раздела элементы перечисления.
				 * @private
				 */
				initDashboardEnums: function() {
					var tileWidgetType = {
						"view": {
							"moduleName": "SystemDesignerTileModule",
							"configurationMessage": "GetSystemDesignerTileConfig"
						},
						"design": {
							"moduleName": "ConfigurationModuleV2",
							"configurationMessage": "GetSystemDesignerTileConfig",
							"resultMessage": "PostModuleConfig",
							"stateConfig": {
								"stateObj": {
									"designerSchemaName": "SystemDesignerTileConfigEdit"
								}
							}
						}
					};
					var wigetType = Terrasoft.DashboardEnums.WidgetType;
					if (!wigetType.hasOwnProperty("SystemDesignerTile")) {
						wigetType.SystemDesignerTile = tileWidgetType;
					}
				},

				/**
				 * @protected
				 * @overridden
				 */
				destroy: function() {
					var wigetType = Terrasoft.DashboardEnums.WidgetType;
					var historyState = this.sandbox.publish("GetHistoryState");
					var state = historyState.state;
					var moduleId = state.moduleId ? state.moduleId : "";
					if (wigetType.hasOwnProperty("SystemDesignerTile") && moduleId.indexOf("SystemDesigner") === -1) {
						delete wigetType.SystemDesignerTile;
					}
					this.callParent(arguments);
					this.destroyed = true;
				}
			},

			/**
			 * Представление раздела
			 * @type {Object[]}
			 */
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "SectionItemsContainer",
					"values": {
						"id": "SectionItemsContainer",
						"selectors": {"wrapEl": "#SectionItemsContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["system-designer-section-container-wrapClass"],
						"items": []
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});