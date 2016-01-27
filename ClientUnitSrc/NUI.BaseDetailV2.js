define("BaseDetailV2", ["terrasoft"],
	function(Terrasoft) {
		return {
			messages: {
				/**
				 * @message GetCardState
				 * Возвращает состояние карточки
				 */
				"GetCardState": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message SaveRecord
				 * Сообщает карточке о необходимости сохраниться
				 */
				"SaveRecord": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message DetailChanged
				 * Сообщает карточке об изменении данных детали
				 */
				"DetailChanged": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message UpdateDetail
				 * Срабатывает, когда изменилась карточка
				 */
				"UpdateDetail": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message OpenCard
				 * Открывает карточку.
				 * @param {Object} Конфигурация открываемой карточки.
				 */
				"OpenCard": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			/**
			 * Атрибуты модели представления детали
			 * @type {Object}
			 */
			attributes: {
				/**
				 * Признак возможности добавления данных
				 * @type {Boolean}
				 */
				CanAdd: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Признак возможности редактирования данных
				 * @type {Boolean}
				 */
				CanEdit: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Признак возможности удаления данных
				 * @type {Boolean}
				 */
				CanDelete: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Коллекция данных
				 * @type {Terrasoft.BaseViewModelCollection}
				 */
				Collection: {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Фильтр детали
				 * @type {Terrasoft.BaseFilter}
				 */
				Filter: {dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT},

				/**
				 * Имя колонки, по которой выполняется фильтрация
				 * @type {String}
				 */
				DetailColumnName: {dataValueType: Terrasoft.DataValueType.STRING},

				/**
				 * Значение ключа родительской записи
				 * @type {Guid}
				 */
				MasterRecordId: {dataValueType: Terrasoft.DataValueType.GUID},

				/**
				 *
				 */
				IsDetailCollapsed: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Значения колонок по умолчанию
				 */
				DefaultValues: {dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT},

				/**
				 * Заголовок детали
				 */
				Caption: {dataValueType: Terrasoft.DataValueType.STRING}
			},

			/**
			 * Методы модели представления детали
			 * @type {Object}
			 */
			methods: {
				init: function(callback, scope) {
					this.initEditPages();
					this.callParent([function() {
						this.initDetailOptions();
						this.initData(function() {
							this.initProfile();
							this.initDefaultCaption();
							this.subscribeSandboxEvents();
							callback.call(scope);
						}, this);
					}, this]);
				},

				/**
				 * Инициализирует профиль схемы.
				 * @protected
				 */
				initProfile: Terrasoft.emptyFn,

				/**
				 * Проставляет заголовок детали по умолчанию
				 * @protected
				 * @virtual
				 */
				initDefaultCaption: function() {
					if (Ext.isEmpty(this.get("Caption"))) {
						this.set("Caption", this.get("Resources.Strings.Caption"));
					}
				},

				/**
				 * Инициализирует коллекцию данных представления рееестра
				 * @protected
				 */
				initDetailOptions: function() {
					var profile = this.getProfile();
					var isCollapsed = !Ext.isEmpty(profile.isCollapsed) ? profile.isCollapsed : true;
					this.set("IsDetailCollapsed", isCollapsed);
				},

				/**
				 * Подписывается на сообщения, необходимые для работы детали
				 * @protected
				 * @virtual
				 */
				subscribeSandboxEvents: function() {
					this.sandbox.subscribe("UpdateDetail", function(config) {
						if (this.destroyed) {
							return;
						}
						this.updateDetail(config);
					}, this, this.getUpdateDetailSandboxTags());
				},

				/**
				 * Генерирует массив тэгов для сообщения UpdateDetail
				 * @protected
				 * @virtual
				 * @return {String[]} Возвращает массив тэгов для сообщения UpdateDetail
				 */
				getUpdateDetailSandboxTags: function() {
					return [this.sandbox.id];
				},

				/**
				 * Обновляет деталь согласно переданным параметрам
				 * @protected
				 * @virtual
				 * @param {Object} config конфигурация обновления детали
				 */
				updateDetail: Terrasoft.emptyFn,

				/**
				 * Инициализирует коллекцию данных представления рееестра
				 * @protected
				 */
				initData: function(callback, scope) {
					this.set("Collection", this.Ext.create("Terrasoft.BaseViewModelCollection"));
					callback.call(scope);
				},

				/**
				 * Возвращает имя карточки редактирования в зависимости от типа выбранной записи (при редактировании)
				 * или от выбранного типа записи для добавления (при добавлении)
				 * @protected
				 * @virtual
				 * @return {String}
				 */
				getEditPageName: function() {
					return "";
				},

				/**
				 * Обрабатывает сворачивание или разворачивание детали.
				 * @protected
				 * @virtual
				 * @param {Boolean} isCollapsed Признак свернутости/развернутости детали.
				 */
				onDetailCollapsedChanged: function(isCollapsed) {
					var profile = this.getProfile();
					var key = this.getProfileKey();
					if (profile && key) {
						profile.isCollapsed = isCollapsed;
						this.Terrasoft.utils.saveUserProfile(key, profile, false);
					}
					this.set("IsDetailCollapsed", isCollapsed);
				},

				/**
				 * Возвращает значение свернутости детали.
				 * @protected
				 * @return {Boolean} Значение свернутости детали.
				 */
				getToolsVisible: function() {
					return !this.get("IsDetailCollapsed");
				},

				/**
				 * Публикует сообщение для получения информации о детали
				 * @protected
				 * @return {Object} Информация о детали
				 */
				getDetailInfo: function() {
					var detailInfo = this.sandbox.publish("GetDetailInfo", null, [this.sandbox.id]) || {};
					var defaultValues = this.get("DefaultValues") || [];
					if (!this.Ext.isEmpty(detailInfo.defaultValues)) {
						var cardDefaultValues = detailInfo.defaultValues;
						var keys = [];
						this.Terrasoft.each(cardDefaultValues, function(valuePair) {
							keys.push(valuePair.name);
						}, this);
						var result = this.Ext.Array.filter(defaultValues, function(item) {
							return (keys.indexOf(item.name) === -1);
						}, this);
						detailInfo.defaultValues = this.Ext.Array.merge(result, cardDefaultValues);
					} else {
						detailInfo.defaultValues = defaultValues;
					}
					return detailInfo;
				}
			},

			/**
			 * Представление детали
			 * @type {Object[]}
			 */
			diff: /**SCHEMA_DIFF*/[
				// DetailControlGroup
				{
					"operation": "insert",
					"name": "Detail",
					"values": {
						itemType: Terrasoft.ViewItemType.CONTROL_GROUP,
						caption: {
							bindTo: "Caption"
						},
						classes: {
							wrapClass: ["detail"]
						},
						tools: [],
						items: [],
						controlConfig: {
							collapsedchanged: {
								bindTo: "onDetailCollapsedChanged"
							},
							collapsed: {
								bindTo: "IsDetailCollapsed"
							}
						}
					}
				}
				//TODO CRM-3911 Реализация класса базового визарда (BaseWizard)
				/*,
				{
					"operation": "insert",
					"name": "ViewButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": "Вид",
						"visible": true,
						"menu": []
					}
				},
				{
					"operation": "insert",
					"name": "DetailSetup",
					"parentName": "ViewButton",
					"propertyName": "menu",
					"values": {
						"caption": "Настройка детали",
						"click": { "bindTo": "openDetailWizard" }
					}
				}*/
			]/**SCHEMA_DIFF*/
		};
	}
);
