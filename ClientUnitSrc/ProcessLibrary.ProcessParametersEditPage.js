define("ProcessParametersEditPage", ["ProcessParametersEditPageResources", "ModalBox", "ProcessModuleUtilities"],
	function(resources, ModalBox, ProcessModuleUtilities) {
		return {
			attributes: {
				"SysPackage": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					caption: resources.localizableStrings.SysPackageCaption
				},
				/**
				 * Список пакетов, отображаемый при выборе значения из справочника
				 */
				"SysPackageList": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isCollection: true,
					value: Ext.create("Terrasoft.Collection")
				},
				"Description": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.TEXT,
					caption: resources.localizableStrings.DescriptionCaption,
					isRequired: false,
					dependencies: [{
						columns: ["Description"]
					}]
				},
				"Name": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.TEXT,
					isRequired: true,
					caption: resources.localizableStrings.NameCaption
				},
				"Start": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.TEXT,
					caption: resources.localizableStrings.StartCaption,
					dependencies: [{
						columns: ["Start"]
					}]
				},
				"End": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.TEXT,
					caption: resources.localizableStrings.EndCaption,
					dependencies: [{
						columns: ["End"]
					}]
				},
				"Enabled": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					caption: resources.localizableStrings.EnabledCaption,
					dependencies: [{
						columns: ["Enabled"]
					}]
				},
				"AddToRunButton": {
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"caption": resources.localizableStrings.AddToRunButtonCaption
				}
			},
			entitySchemaName: null,
			messages: {
				/**
				 * @message SetParametersInfo
				 * Указывает значения параметров
				 */
				"SetParametersInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			details: /**SCHEMA_DETAILS*/{
			}/**SCHEMA_DETAILS*/,
			methods: {
				/**
				 * @overridden
				 */
				init: function() {
					this.callParent(arguments);
					var hasNoRunningProcess = this.get("HasNoRunningProcess");
					this.set("IsSaveButtonEnabled", hasNoRunningProcess);
					this.on("change:AddToRunButton", this.onAddToRunButtonChanged, this);
				},
				/**
				 * Просматривает информацию валидации и возвращает на ее основе сообщение для пользователя
				 * @private
				 * @return {String} Возвращает сообщения для пользователя
				 */
				getValidationMessage: function() {
					var messageTemplate = this.get("Resources.Strings.FieldValidationError");
					var invalidMessage = "";
					var invalidColumnName = null;
					Terrasoft.each(this.validationInfo.attributes, function(attribute, attributeName) {
						if (!attribute.isValid) {
							invalidColumnName = attributeName;
							invalidMessage = attribute.invalidMessage;
							return false;
						}
					});
					if (invalidColumnName) {
						var invalidColumn = this.getColumnByName(invalidColumnName);
						var columnCaption =
							invalidColumn && invalidColumn.caption ? invalidColumn.caption : invalidColumnName;
						invalidMessage = this.Ext.String.format(messageTemplate, columnCaption, invalidMessage);
					}
					return invalidMessage;
				},
				/**
				 * Обработчик события подготовки данных для выпадающего списка пакетов
				 * @filter {Object} Фильры для подготовки данных
				 * @list {Terrasoft.Collection} Данные для выпадающего списка
				 * @protected
				 */
				onPrepareSysPackageList: function(filter, list) {
					ProcessModuleUtilities.onPrepareSysPackageList(filter, list);
				},
				/**
				 * Сохранить указанные значения свойств
				 * @private
				 */
				save: function() {
					if (!this.validate()) {
						var validationMessage = this.getValidationMessage();
						this.showInformationDialog(validationMessage);
						return;
					}
					var processProperties = {
						Name: this.get("Name"),
						Description: this.get("Description"),
						SysPackage: this.get("SysPackage"),
						Enabled: this.get("Enabled"),
						Start: this.get("Start"),
						End: this.get("End"),
						AddToRunButton: this.get("AddToRunButton")
					};
					this.sandbox.publish("SetParametersInfo", processProperties, [this.sandbox.id]);
				},
				/**
				 * Закрыть модальное окно
				 * @private
				 */
				close: function() {
					ModalBox.close();
				},
				/**
				 * Обработать изменение значения признака "Показывать в глобальной кнопке запуска"
				 * @private
				 */
				onAddToRunButtonChanged: function() {
					this.set("IsSaveButtonEnabled", true);
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "fixed-area-container",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["container-modal-page", "container-modal-page-fixed"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "fixed-area-container",
					"propertyName": "items",
					"name": "headContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["header"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "headContainer",
					"propertyName": "items",
					"name": "header-name-container",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["header-name-container", "header-name-container-full"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "header-name-container",
					"propertyName": "items",
					"name": "headerLabel",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": { "bindTo": "modalBoxCaption" }
					}
				},
				{
					"operation": "insert",
					"parentName": "headContainer",
					"propertyName": "items",
					"name": "close-icon-container",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["header-name-container", "header-name-container-full"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "close-icon-container",
					"propertyName": "items",
					"name": "close-icon",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": { "bindTo": "Resources.Images.CloseIcon" },
						"classes": { "wrapperClass": ["close-btn-user-class"] },
						"click": { "bindTo": "close" }
					}
				},
				{
					"operation": "insert",
					"parentName": "fixed-area-container",
					"propertyName": "items",
					"name": "center-area-editPage",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["controls-container-modal-page"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "center-area-controlGroup",
					"parentName": "center-area-editPage",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "center-area-controlGroup",
					"propertyName": "items",
					"name": "Name",
					"values": {
						"bindTo": "Name",
						"enabled": { "bindTo": "HasNoRunningProcess" },
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 23,
							"rowSpan": 0
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "center-area-controlGroup",
					"propertyName": "items",
					"name": "Description",
					"values": {
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"enabled": { "bindTo": "HasNoRunningProcess" },
						"bindTo": "Description",
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 23,
							"rowSpan": 2
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "center-area-controlGroup",
					"propertyName": "items",
					"name": "Start",
					"values": {
						"bindTo": "Start",
						"enabled": { "bindTo": "HasNoRunningProcess" },
						"layout": {
							"column": 0,
							"row": 3,
							"colSpan": 23,
							"rowSpan": 1
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "center-area-controlGroup",
					"propertyName": "items",
					"name": "End",
					"values": {
						"bindTo": "End",
						"enabled": { "bindTo": "HasNoRunningProcess" },
						"layout": {
							"column": 0,
							"row": 4,
							"colSpan": 23,
							"rowSpan": 1
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "center-area-controlGroup",
					"propertyName": "items",
					"name": "SysPackage",
					"values": {
						"enabled": { "bindTo": "HasNoRunningProcess" },
						"controlConfig": {
							"prepareList": {
								"bindTo": "onPrepareSysPackageList"
							}
						},
						"layout": {
							"column": 0,
							"row": 5,
							"colSpan": 23,
							"rowSpan": 1
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "center-area-controlGroup",
					"propertyName": "items",
					"name": "Enabled",
					"values": {
						"enabled": { "bindTo": "HasNoRunningProcess" },
						"bindTo": "Enabled",
						"layout": {
							"column": 0,
							"row": 6,
							"colSpan": 23,
							"rowSpan": 1
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "center-area-controlGroup",
					"propertyName": "items",
					"name": "AddToRunButton",
					"values": {
						"bindTo": "AddToRunButton",
						"layout": {
							"column": 0,
							"row": 7,
							"colSpan": 23,
							"rowSpan": 1
						},
						"textSize": "Default"
					}
				},
				{
					"operation": "insert",
					"parentName": "fixed-area-container",
					"propertyName": "items",
					"name": "utils-area-editPage",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["controls-container-modal-page"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "utils-area-editPage",
					"propertyName": "items",
					"name": "SaveButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": { "bindTo": "Resources.Strings.SaveButtonCaption" },
						"click": { "bindTo": "save" },
						"classes": { "textClass": ["utils-buttons"] },
						"enabled": { "bindTo": "IsSaveButtonEnabled" }
					}
				},
				{
					"operation": "insert",
					"parentName": "utils-area-editPage",
					"propertyName": "items",
					"name": "CancelButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": { "bindTo": "Resources.Strings.CancelButtonCaption" },
						"click": { "bindTo": "close" },
						"classes": { "textClass": ["utils-buttons"] }
					}
				}
			]/**SCHEMA_DIFF*/,
			userCode: {}
		};
	});