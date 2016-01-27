/**
 * Parent: BaseUserTaskPropertiesPage
 */
define("OpenEditPageUserTaskPropertiesPage", ["terrasoft", "OpenEditPageUserTaskPropertiesPageResources"],
		function(Terrasoft, resources) {
		return {
			messages: {},
			mixins: {},
			attributes: {
				/**
				 * Текст подписи на схеме.
				 */
				"SignatureScheme": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					caption: resources.localizableStrings.SignatureSchemeCaption
				},
				/**
				 * Признак выбора пункта: "Выбрать существующую страницу"
				 */
				"IsSelectExistPage": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: true
				},
				/**
				 * Признак отображения элементов "Первой страницы"
				 */
				"ShowFirstPage": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: true
				},
				/**
				 * Признак отображения элементов "Новой страницы"
				 */
				"ShowNewPage": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: false
				},
				/**
				 * Признак отображения "Существующей страницы"
				 */
				"ShowEntityPage": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: false
				},
				/**
				 * Выбранная страница
				 */
				"Page": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					caption: resources.localizableStrings.PageCaption
				},
				/**
				 * Список страниц, отображаемый при выборе значения из справочника
				 */
				"PagesList": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isCollection: true,
					value: Ext.create("Terrasoft.Collection")
				},
				/**
				 * Признак выбора пункта: "Выбрать новую запись"
				 */
				"IsSelectNewEntity": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: true
				},
				/**
				 * Выбор записи.
				 */
				"SelectEntity": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					caption: resources.localizableStrings.SelectEntityCaption
				}
			},
			methods: {
				/**
				 * @protected
				 */
				onNextButtonClick: function() {
					var isSelectExistPage = this.get("IsSelectExistPage");
					this.set("ShowFirstPage", false);
					if (!isSelectExistPage) {
						this.set("ShowNewPage", true);
					} else {
						this.set("ShowEntityPage", true);
					}
				},
				/**
				 * @protected
				 */
				onSettingsPageButtonClick: function() {
				},
				/**
				 * Показать список выбора страницы
				 * @protected
				 */
				isShowPageList: function() {
					return !(this.get("ShowFirstPage") || this.get("ShowNewPage"));
				},
				/**
				 * Показать элемент выбора записи
				 * @protected
				 */
				isShowSelectEntity: function() {
					return this.get("ShowEntityPage") && !this.get("IsSelectNewEntity");
				}
			},
			diff: [
				{
					"operation": "remove",
					"name": "ActionButtonsContainer"
				},
				{
					"operation": "remove",
					"name": "Title"
				},
				{
					"operation": "remove",
					"name": "InformationOnStepGridContainer"
				},
				{
					"operation": "insert",
					"parentName": "HeaderUserTaskParametersContainer",
					"propertyName": "items",
					"name": "SignatureScheme",
					"index": 0
				},
				{
					"operation": "merge",
					"name": "RecommendationGridContainer",
					"values": {
						"visible": {
							"bindTo": "ShowFirstPage",
							"bindConfig": {
								"converter":  function(value) {
									return !value;
								}
							}
						}
					}
				},
				{
					"operation": "insert",
					"name": "FirstStepParametersContainer",
					"parentName": "EditorsContainer",
					"propertyName": "items",
					"index": 1,
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"visible": {
							"bindTo": "ShowFirstPage"
						}
					}
				},
				{
					"operation": "insert",
					"name": "FirstStepParametersGridContainer",
					"parentName": "FirstStepParametersContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "FirstStepParametersGridContainer",
					"name": "IsSelectExistPage",
					"propertyName": "items",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.RADIO_GROUP,
						"value": {
							"bindTo": "IsSelectExistPage"
						},
						"items": [],
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 24
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "IsSelectExistPage",
					"propertyName": "items",
					"name": "SelectExistPage",
					"values": {
						"caption": {
							"bindTo": "Resources.Strings.SelectExistPageCaption"
						},
						"value": true
					}
				},
				{
					"operation": "insert",
					"parentName": "IsSelectExistPage",
					"propertyName": "items",
					"name": "CreateNewPage",
					"values": {
						"caption": {
							"bindTo": "Resources.Strings.CreateNewPageCaption"
						},
						"value": false
					}
				},
				{
					"operation": "insert",
					"parentName": "FirstStepParametersGridContainer",
					"propertyName": "items",
					"name": "NextButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {
							"bindTo": "Resources.Strings.NextButtonCaption"
						},
						"click": {
							"bindTo": "onNextButtonClick"
						},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"markerValue": "NextButton",
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 24
						}
					}
				},
				{
					"operation": "insert",
					"name": "NewPageParametersContainer",
					"parentName": "HeaderUserTaskParametersContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"visible": {
							"bindTo": "ShowNewPage"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "NewPageParametersContainer",
					"propertyName": "items",
					"name": "SettingsPageButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {
							"bindTo": "Resources.Strings.SettingsPageButtonCaption"
						},
						"click": {
							"bindTo": "onSettingsPageButtonClick"
						},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"markerValue": "SettingsPageButton"
					}
				},
				{
					"operation": "merge",
					"name": "UserTaskParametersContainer",
					"values": {
						"visible": {
							"bindTo": "ShowFirstPage",
							"bindConfig": {
								"converter":  function(value) {
									return !value;
								}
							}
						}
					}
				},
				{
					"operation": "merge",
					"name": "UserTaskLinksContainer",
					"values": {
						"visible": {
							"bindTo": "ShowFirstPage",
							"bindConfig": {
								"converter":  function(value) {
									return !value;
								}
							}
						}
					}
				},
				{
					"operation": "insert",
					"name": "EntityPageParametersContainer",
					"parentName": "HeaderUserTaskParametersContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"visible": {
							"bindTo": "ShowEntityPage"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderUserTaskParametersContainer",
					"propertyName": "items",
					"index": 2,
					"name": "Page",
					"values": {
							//"controlConfig": {
							//	"prepareList": {
							//		"bindTo": "onPreparePageList"
							//	}
							//},
						"visible": {
							"bindTo": "isShowPageList"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "EntityPageParametersContainer",
					"name": "IsSelectNewEntity",
					"propertyName": "items",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.RADIO_GROUP,
						"value": {
							"bindTo": "IsSelectNewEntity"
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "IsSelectNewEntity",
					"propertyName": "items",
					"name": "SelectNewEntity",
					"values": {
						"caption": {
							"bindTo": "Resources.Strings.NewEntityCaption"
						},
						"value": true
					}
				},
				{
					"operation": "insert",
					"parentName": "IsSelectNewEntity",
					"propertyName": "items",
					"name": "SelectExistEntity",
					"values": {
						"caption": {
							"bindTo": "Resources.Strings.ExistEntityCaption"
						},
						"value": false
					}
				},
				{
					"operation": "insert",
					"parentName": "EntityPageParametersContainer",
					"propertyName": "items",
					"name": "SelectEntity",
					"values": {
						"visible": {
							"bindTo": "isShowSelectEntity"
						}
					}
				}
			]
		};
	}
);
