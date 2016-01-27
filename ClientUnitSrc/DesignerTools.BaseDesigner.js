/**
 * @class BaseDesigner
 * @public
 * Модуль базового класса дизайнера.
 */
define("BaseDesigner", ["terrasoft", "BaseDesignerResources"],
	function(Terrasoft, resources) {
		return {
			messages: {

				/**
				 * Публикация сообщения изменения заголовка модуля дизайнера.
				 */
				"ChangeHeaderCaption": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				"OnDesignerSaved": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				"OnDesignerCanceled": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				"BackHistoryState": {
					"mode": Terrasoft.MessageMode.BROADCAST,
					"direction": Terrasoft.MessageDirectionType.PUBLISH
				}

			},
			attributes: {

				"SectionCaption": {
					dataValueType: Terrasoft.DataValueType.TEXT
				}

			},
			methods: {

				/**
				 * Инициализирует начальные значения модели.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				init: function(callback, scope) {
					this.initSectionCaption();
					this.callParent([function() {
						this.changeDesignerCaption();
						callback.call(scope);
					}, this]);
				},

				/**
				 * Инициализирует заголовок раздела.
				 * @protected
				 * @virtual
				 */
				initSectionCaption: function() {
					var history = this.sandbox.publish("GetHistoryState");
					if (history) {
						var historyState = history.state;
						this.settings = historyState.settings;
						var title = historyState.title;
						if (title) {
							this.set("SectionCaption", title);
						}
					}
				},

				/**
				 * Устанавливает заголовок модуля дизайнера.
				 * @protected
				 * @virtual
				 * @param caption Заголовок страницы дизайнера
				 */
				changeDesignerCaption: function() {
					var designerCaption = this.get("Resources.Strings.DesignerCaption");
					var sectionCaption = this.get("SectionCaption");
					if (!Ext.isEmpty(sectionCaption)) {
						designerCaption += Ext.String.format(' "{0}"', sectionCaption);
					}
					this.sandbox.publish("ChangeHeaderCaption", {
						caption: designerCaption,
						moduleName: this.name
					});
				},

				/**
				 * Сохраняет изменения в дизайнере.
				 * @protected
				 * @virtual
				 */
				save: function() {
					var config = this.getDesignerConfig();
					this.sandbox.publish("OnDesignerSaved", config);
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * Закрывает страницу дизайнера.
				 * @protected
				 * @virtual
				 */
				cancel: function() {
					this.sandbox.publish("OnDesignerCanceled");
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * Возвращает результат настройки дизайнера.
				 * @protected
				 * @virtual
				 */
				getDesignerConfig: Ext.emptyFn,

				/**
				 * Возвращает массив актуальных значений элементов в сетке.
				 * @param collection Коллекция элементов
				 * @return {Array} Массив свойств элементов
				 */
				getItemConfigsByCollection: function(collection) {
					var result = [];
					collection.eachKey(function(itemId, item) {
						var itemConfig = {};
						var values = item.values;
						for (var propertyKey in values) {
							itemConfig[propertyKey] = item.get(propertyKey);
						}
						result.push(itemConfig);
					}, this);
					return result;
				}

			},
			diff: [
				{
					"operation": "insert",
					"name": "BaseDesignerContainer",
					"values": {
						"id": "BaseDesignerContainer",
						"selectors": {
							"wrapEl": "#BaseDesignerContainer"
						},
						"classes": {
							"textClass": "center-panel"
						},
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "BaseDesignerHeaderContainer",
					"parentName": "BaseDesignerContainer",
					"propertyName": "items",
					"values": {
						"id": "BaseDesignerHeaderContainer",
						"selectors": {
							"wrapEl": "#BaseDesignerHeaderContainer"
						},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 24
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "BaseDesignerHeaderContainer",
					"propertyName": "items",
					"name": "SaveButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {
							"bindTo": "Resources.Strings.SaveButtonCaption"
						},
						"classes": {
							"textClass": "actions-button-margin-right"
						},
						"click": {
							"bindTo": "save"
						},
						"style": "green",
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 2
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "BaseDesignerHeaderContainer",
					"propertyName": "items",
					"name": "CancelButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {
							"bindTo": "Resources.Strings.CancelButtonCaption"
						},
						"classes": {
							"textClass": "actions-button-margin-right"
						},
						"click": {
							"bindTo": "cancel"
						},
						"style": "default",
						"layout": {
							"column": 4,
							"row": 0,
							"colSpan": 2
						}
					}
				},
				{
					"operation": "insert",
					"name": "BaseDesignerFooterContainer",
					"parentName": "BaseDesignerContainer",
					"propertyName": "items",
					"values": {
						"id": "BaseDesignerFooterContainer",
						"selectors": {
							"wrapEl": "#BaseDesignerFooterContainer"
						},
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 24
						},
						"items": []
					}
				}
			]
		};
	});