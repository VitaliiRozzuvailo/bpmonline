define([],
	function() {
		return {
			/**
			 * Сообщения, добавленные или измененные относительно родительской схемы
			 * @type {Object}
			 */
			messages: {
				/**
				 * Инициирует генерацию события ChangeHeaderCaption
				 */
				"NeedHeaderCaption": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"ChangeHeaderCaption": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 *
				 */
				"BackHistoryState": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 *
				 */
				"SetInitialisationData": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message ResultSelectedRows
				 * Возвращает выбранные строки в справочнике.
				 */
				"ResultSelectedRows": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message SearchResultBySocialNetworks
				 * Возвращает выбранные данные из социальных сетей.
				 */
				"SearchResultBySocialNetworks": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},

			/**
			 * Атрибуты модели представления раздела
			 * @type {Object}
			 */
			attributes: {
				/**
				 * Коллекция данных для представления списка.
				 */
				"GridData": {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Признак видимости действия "Настроить итоги".
				 */
				"IsSummarySettingsVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: false
				},

				/**
				 * Идентификатор активной записи в реестре.
				 */
				"ActiveRow": {
					dataValueType: Terrasoft.DataValueType.STRING,
					value: null
				},

				/**
				 * Массив идентификаторов выбранных записей в реестре.
				 */
				"SelectedRows": {
					dataValueType: Terrasoft.DataValueType.COLLECTION
				}
			},

			/**
			 * Классы-миксины (примеси), расширяющие функциональность данного класа
			 */
			mixins: {},

			methods: {
				/**
				 * @inheritdoc Terrasoft.BaseSchemaModule#init
				 * @overridden
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.subscribeSandboxEvents();
						callback.call(scope);
					}, this]);
					this.initSelectedRows();
				},

				/**
				 * Инициализирует выбранные записи в реестре.
				 * @protected
				 */
				initSelectedRows: function() {
					this.set("SelectedRows", []);
				},

				/**
				 * Инициализирует заголовок страницы.
				 * @protected
				 */
				initMainHeaderCaption: function() {
					var caption = this.get("Resources.Strings.HeaderCaption");
					this.sandbox.publish("ChangeHeaderCaption", {
						caption: caption,
						dataViews: new Terrasoft.Collection(),
						moduleName: this.name
					});
				},

				/**
				 * @inheritdoc Terrasoft.BasePage#subscribeSandboxEvents
				 * @overridden
				 */
				subscribeSandboxEvents: function() {
					this.sandbox.subscribe("NeedHeaderCaption", function() {
						this.initMainHeaderCaption();
					}, this);
				},

				/**
				 * Обработчик события нажатия на кнопку Отмена.
				 */
				onCloseButtonClick: function() {
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * @inheritdoc Terrasoft.BasePage#onRender
				 * @overridden
				 */
				onRender: function() {
					this.initMainHeaderCaption();
				},

				search: Terrasoft.emptyFn,

				clear: Terrasoft.emptyFn,

				/**
				 * Обработчик нажатия кнопки Выбрать.
				 */
				onSelectButtonClick: function() {
					var selectedItems = this.getSelectedItems();
					var config = {
						selectedItems: selectedItems
					};
					this.sandbox.publish("SearchResultBySocialNetworks", config);
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * Возвращает выбранные / активную запись в реестре.
				 * @protected
				 * @return {Object} Список записей.
				 */
				getSelectedItems: Terrasoft.emptyFn,

				/**
				 * Возвращает доступность кнопки Выбрать.
				 * @protected
				 * @return {Boolean} Доступность кнопки Выбрать.
				 */
				getSelectButtonEnabled: Terrasoft.emptyFn
			},

			diff: /**SCHEMA_DIFF*/[
//				SectionWrapContainer
				{
					"operation": "insert",
					"name": "SectionWrapContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["section-wrap"],
						"items": []
					}
				},
//				ActionButtonsContainer
				{
					"operation": "insert",
					"name": "ActionButtonsContainer",
					"parentName": "SectionWrapContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"id": "ActionButtonsContainer",
						"selectors": {"wrapEl": "#ActionButtonsContainer"},
						"wrapClass": ["action-buttons-container-wrapClass", "actions-container"],
						"items": []
					}
				},
//				ActionButtonsLeftContainer
				{
					"operation": "insert",
					"name": "ActionButtonsLeftContainer",
					"parentName": "ActionButtonsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["action-buttons-left-container-wrapClass"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "SelectButton",
					"parentName": "ActionButtonsLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.SelectButtonCaption"},
						"click": {"bindTo": "onSelectButtonClick"},
						"enabled": {"bindTo": "getSelectButtonEnabled"},
						"classes": {
							"textClass": ["actions-button-margin-right", "t-btn-style-green"]
						}
					}
				},
				{
					"operation": "insert",
					"name": "CloseButton",
					"parentName": "ActionButtonsLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.CloseButtonCaption"},
						"click": {"bindTo": "onCloseButtonClick"},
						"classes": {
							"textClass": ["actions-button-margin-right"]
						}
					}
				},
//				ContentContainer
				{
					"operation": "insert",
					"name": "ContentContainer",
					"parentName": "SectionWrapContainer",
					"propertyName": "items",
					"values": {
						"id": "ContentContainer",
						"selectors": {"wrapEl": "#ContentContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["content-container-wrapClass", "content-container"],
						"items": []
					}
				},
//				SocialSearchContainer
				{
					"operation": "insert",
					"name": "SocialSearchContainer",
					"parentName": "ContentContainer",
					"propertyName": "items",
					"values": {
						"id": "SocialSearchContainer",
						"selectors": {"wrapEl": "#SocialSearchContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["social-search-wrapClass"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "QueryContainer",
					"parentName": "SocialSearchContainer",
					"propertyName": "items",
					"values": {
						"id": "QueryContainer",
						"selectors": {"wrapEl": "#QueryContainer"},
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"wrapClass": ["social-search-query-container"],
						"isHeaderVisible": false,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "QueryInputContainer",
					"parentName": "QueryContainer",
					"propertyName": "items",
					"values": {
						"id": "QueryInputContainer",
						"selectors": {"wrapEl": "#QueryInputContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["social-search-query-input-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Query",
					"parentName": "QueryInputContainer",
					"propertyName": "items",
					"values": {
						"dataValueType": Terrasoft.DataValueType.TEXT,
						"labelConfig": {
							"caption": "Query",
							"visible": false
						},
						"markerValue": "SocialSearchQuery",
						"classes": {
							"wrapClass": ["social-search-query-input"]
						},
						"controlConfig": {
							"className": "Terrasoft.TextEdit",
							"enterkeypressed": {"bindTo": "search"}
						}
					}
				},
				{
					"operation": "insert",
					"name": "SearchTooltipButton",
					"parentName": "QueryContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.InfoSpriteImage"},
						"classes": {
							"wrapperClass": "info-button",
							"imageClass": "info-button-image"
						},
						"showTooltip": true,
						"tooltipText": {"bindTo": "Resources.Strings.SearchTooltip"}
					}
				},
				{
					"operation": "insert",
					"name": "SearchButton",
					"parentName": "QueryContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.BLUE,
						"caption": {"bindTo": "Resources.Strings.SearchButtonCaption"},
						"click": {bindTo: "search"},
						"classes": {
							"textClass": ["actions-button-margin-right", "search-button"]
						}
					}
				},
//				SocialSearchResultContainer
				{
					"operation": "insert",
					"name": "SocialSearchResultContainer",
					"parentName": "SocialSearchContainer",
					"propertyName": "items",
					"values": {
						"id": "SocialSearchResultContainer",
						"selectors": {"wrapEl": "#SocialSearchResultContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["social-search-result-container-wrapClass"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "SocialSearchResultControlGroup",
					"parentName": "SocialSearchResultContainer",
					"propertyName": "items",
					"values": {
						"id": "SocialSearchResultControlGroup",
						"selectors": {"wrapEl": "#SocialSearchResultControlGroup"},
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {bindTo: "Resources.Strings.SearchResultContainerCaption"},
						"wrapClass": ["detail"],
						"items": [],
						"tools": []
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
