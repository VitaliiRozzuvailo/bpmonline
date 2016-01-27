define("UserPageV2", ["UserPageV2Resources", "BusinessRuleModule", "ConfigurationConstants", "ViewUtilities",
		"RightUtilities", "css!AdministrationCSSV2"],
	function(resources, BusinessRuleModule, ConfigurationConstants, ViewUtilities, RightUtilities) {
		return {
			entitySchemaName: "VwSysAdminUnit",
			messages: {

				/**
				 * Сообщает разделу о необходимости вывода сообщения об актуализации ролей.
				 */
				"NeedActualizeRoles": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetChiefId
				 * Используется для передачи идентификатора текущей роли руководителя.
				 */
				"GetChiefId": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message SetRecordInformation
				 * Возвращает объект, состоящий из текущей выбранной в вертикальном реестре записи и
				 * типа добавляемой записи.
				 */
				"SetRecordInformation": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message UpdateSectionGrid
				 * Сообщает разделу о необходимости перезагрузить реестр, после закрытия карточки.
				 * редактирования записей деталей
				 */
				"UpdateSectionGrid": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				}

			},
			details: /**SCHEMA_DETAILS*/{
				SysAdminUnitIPRangeDetailV2: {
					schemaName: "SysAdminUnitIPRangeDetailV2",
					filter: {
						masterColumn: "Id"
					}
				},
				SessionDetailV2: {
					schemaName: "SessionDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "SysUser"
					}
				},
				SysFuncRoleInUserDetailV2: {
					schemaName: "SysFuncRoleInUserDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "SysUser"
					}
				},
				SysOrgRoleInUserDetailV2: {
					schemaName: "SysOrgRoleInUserDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "SysUser"
					}
				},
				SysAdminUnitGrantedRightDetailV2: {
					schemaName: "SysAdminUnitGrantedRightDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "GrantorSysAdminUnit"
					},
					filterMethod: "getSysAdminUnitGrantedRightDetailV2Filters"
				}
			}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "CardContentContainer",
					"values": {
						"wrapClass": ["UserPageV2", "card-content-container"]
					}
				},
				{
					"operation": "remove",
					"name": "ESNTab"
				},
				{
					"operation": "remove",
					"name": "actions"
				},
				{
					"operation": "remove",
					"name": "ViewOptionsButton"
				},
				{
					"operation": "insert",
					"name": "DeleteButton",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.DeleteButtonCaption"},
						"classes": {"textClass": "actions-button-margin-right"},
						"click": {"bindTo": "onDeleteClick"}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "PhotoContainer",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["image-edit-container"],
						"layout": {"column": 0, "row": 0, "rowSpan": 3, "colSpan": 1},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "PhotoContainer",
					"propertyName": "items",
					"name": "Photo",
					"values": {
						"getSrcMethod": "getSrcMethod",
						"onPhotoChange": "onPhotoChange",
						"beforeFileSelected": "beforeFileSelected",
						"readonly": true,
						"defaultImage": this.Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.DefaultPhoto),
						"generator": "ImageCustomGeneratorV2.generateCustomImageControl"
					}
				},
				{
					"operation": "insert",
					"name": "GeneralInfoTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 0,
					"values": {
						"caption": {"bindTo": "Resources.Strings.GeneralInfoTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 1,
					"name": "RolesTab",
					"values": {
						"caption": {"bindTo": "Resources.Strings.RolesTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "RolesTab",
					"propertyName": "items",
					"name": "SysOrgRoleInUserDetailV2",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "RolesTab",
					"propertyName": "items",
					"name": "SysFuncRoleInUserDetailV2",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 2,
					"name": "LicenseTab",
					"values": {
						"caption": {"bindTo": "Resources.Strings.SysLicUserTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 3,
					"name": "GrantedRightsTab",
					"values": {
						"caption": {"bindTo": "Resources.Strings.GrantedRightsTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "GrantedRightsTab",
					"propertyName": "items",
					"name": "SysAdminUnitGrantedRightDetailV2",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 4,
					"name": "AccessRulesTab",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AccessRulesTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "AccessRulesTab",
					"propertyName": "items",
					"name": "SysAdminUnitIPRangeDetailV2",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "AccessRulesTab",
					"propertyName": "items",
					"name": "SessionDetailV2",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"name": "Contact",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"dataValueType": this.Terrasoft.DataValueType.LOOKUP,
						"value": {"bindTo": "Contact"},
						"layout": {"column": 1, "row": 0, "colSpan": 11}
					}
				},
				{
					"operation": "insert",
					"name": "SysCulture",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"dataValueType": this.Terrasoft.DataValueType.ENUM,
						"value": {"bindTo": "SysCulture"},
						"layout": {"column": 13, "row": 0, "colSpan": 8}
					}
				},
				{
					"operation": "insert",
					"name": "Type",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"dataValueType": this.Terrasoft.DataValueType.ENUM,
						"caption": {"bindTo": "Resources.Strings.TypeCaption"},
						"value": {"bindTo": "UserConnectionTypeValue"},
						"enabled": false,
						"layout": {"column": 1, "row": 1, "colSpan": 11}
					}
				},
				{
					"operation": "insert",
					"name": "Active",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"layout": {"column": 1, "row": 2, "colSpan": 11}
					}
				},
				{
					"operation": "insert",
					"name": "HomePage",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"dataValueType": this.Terrasoft.DataValueType.LOOKUP,
						"value": {"bindTo": "HomePage"},
						"layout": {"column": 13, "row": 1, "colSpan": 8}
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoTab",
					"name": "AuthControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.AuthControlGroupCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "LicenseTab",
					"name": "LicenseControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.SysLicUserTabCaption"},
						"items": [],
						"tools": [],
						"controlConfig": {
							"collapsed": false
						}
					}
				},
				{
					"operation": "insert",
					"name": "ToolsButton",
					"parentName": "LicenseControlGroup",
					"propertyName": "tools",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "Resources.Images.ToolsButtonImage"},
						"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"classes": {
							"wrapperClass": ["license-tools-button-wrapper", "license-t-btn-wrapper"],
							"menuClass": ["license-tools-button-menu"]
						},
						"menu": []
					}
				},
				{
					"operation": "insert",
					"name": "CheckAllLicenses",
					"parentName": "ToolsButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.CheckLicensesCaption"},
						"click": {"bindTo": "onCheckAllLicenses"},
						"enabled": {"bindTo": "Active"}
					}
				},
				{
					"operation": "insert",
					"name": "UncheckAllLicenses",
					"parentName": "ToolsButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.UncheckLicensesCaption"},
						"click": {"bindTo": "onUncheckAllLicenses"},
						"enabled": {"bindTo": "Active"}
					}
				},
				{
					"operation": "insert",
					"name": "LicenseList",
					"parentName": "LicenseControlGroup",
					"propertyName": "items",
					"values": {
						"generator": "ConfigurationItemGenerator.generateContainerList",
						"idProperty": "Id",
						"collection": "LicenseCollection",
						"observableRowNumber": 15,
						"onGetItemConfig": "getItemViewConfig",
						"dataItemIdPrefix": "lic-item"
					}
				},

				{
					"operation": "insert",
					"parentName": "AuthControlGroup",
					"name": "FormAuthGridLayout",
					"propertyName": "items",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Name",
					"parentName": "FormAuthGridLayout",
					"propertyName": "items",
					"values": {
						"dataValueType": this.Terrasoft.DataValueType.TEXT,
						"caption": {"bindTo": "Resources.Strings.UserNameCaption"},
						"value": {"bindTo": "Name"},
						"layout": {"column": 0, "row": 0, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"name": "UserPassword",
					"parentName": "FormAuthGridLayout",
					"propertyName": "items",
					"values": {
						"id": "new-password",
						"selectors": {"wrapEl": "#new-password"},
						"caption": {"bindTo": "Resources.Strings.PasswordCaption"},
						"value": {"bindTo": "UserPassword"},
						"layout": {"column": 0, "row": 1, "colSpan": 12},
						"controlConfig": {
							"protect": true,
							"keyup": {
								"bindTo": "onNewPasswordKeypress"
							},
							"isRequired" : {bindTo: "isRequiredFieldsVisible"}
						}
					}
				},
				{
					"operation": "insert",
					"name": "PasswordConfirmation",
					"parentName": "FormAuthGridLayout",
					"propertyName": "items",
					"values": {
						"id": "new-password-confirmation",
						"selectors": {"wrapEl": "#new-password-confirmation"},
						"value": {"bindTo": "PasswordConfirmation"},
						"caption": {"bindTo": "Resources.Strings.PasswordConfirmationCaption"},
						"layout": {"column": 0, "row": 2, "colSpan": 12},
						"controlConfig": {
							"protect": true,
							"keyup": {
								"bindTo": "onNewPasswordConfirmationKeypress"
							}
						},
						"isRequired" : {bindTo: "isRequiredFieldsVisible"}
					}
				},
				{
					"operation": "insert",
					"name": "PasswordExpireDate",
					"parentName": "FormAuthGridLayout",
					"propertyName": "items",
					"values": {
						"dataValueType": this.Terrasoft.DataValueType.DATE,
						"value": {"bindTo": "PasswordExpireDate"},
						"layout": {"column": 0, "row": 3, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"name": "ForceChangePassword",
					"parentName": "FormAuthGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 4, "colSpan": 12}
					}
				}
			]/**SCHEMA_DIFF*/,
			attributes: {
				/**
				 * Пользовательский пароль.
				 */
				"UserPassword": {
					dataValueType: this.Terrasoft.DataValueType.TEXT
				},
				/**
				 * Подтверждение пароля.
				 */
				"PasswordConfirmation": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					caption: resources.localizableStrings.PasswordConfirmationCaption
				},
				/**
				 * Хранит значение системной настройки "Срок действия пароля, дней".
				 */
				"PasswordDuration": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Контакт текущего пользователя.
				 */
				"Contact": {
					lookupListConfig: {
						columns: ["Photo"],
						orders: [{columnPath: "Name"}],
						filter: function() {
							var filterGroup = this.Terrasoft.createFilterGroup();
							var notExistsFilter = this.Terrasoft.createNotExistsFilter("[SysAdminUnit:Contact].Id");
							filterGroup.addItem(notExistsFilter);
							return filterGroup;
						}
					},
					isRequired: true
				},
				/**
				 * Домашняя страница.
				 */
				"HomePage": {
					lookupListConfig: {
						filter: function() {
							var filterGroup = this.Terrasoft.createFilterGroup();
							var existFilter = this.Terrasoft.createExistsFilter(
								"[SysModuleInSysModuleFolder:SysModule].Id");
							var isNotNullFilter = this.Terrasoft.createColumnIsNotNullFilter(
								"SectionModuleSchemaUId");
							filterGroup.addItem(existFilter);
							filterGroup.addItem(isNotNullFilter);
							return filterGroup;
						}
					}
				},
				/**
				 * Дата окончания действия пароля.
				 */
				"PasswordExpireDate": {
					dependencies: [{
						columns: ["PasswordConfirmation"],
						methodName: "onPasswordConfirmationChanged"
					}]
				},
				/**
				 * Тип объекта администрирования.
				 */
				"SysAdminUnitType": {
					dataValueType: this.Terrasoft.DataValueType.LOOKUP
				},
				/**
				 * Культура пользователя.
				 */
				"SysCulture": {
					dataValueType: this.Terrasoft.DataValueType.LOOKUP,
					isRequired: true
				},
				/**
				 * Коллекция лицензий.
				 */
				"LicenseCollection": {
					dataValueType: this.Terrasoft.DataValueType.COLLECTION
				},
				/**
				 * Признак, что пользователь активен.
				 */
				"Active": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					dependencies: [
						{
							columns: ["Active"],
							methodName: "onActiveChanged"
						}
					]
				},
				/**
				 * Признак, есть ли у пользователя право на управление лицензиями.
				 */
				"CanManageLicUsers": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Признак, что лицензии уже загружены.
				 */
				"IsLicenseDataLoaded": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Значение ConnectionType у записи, выбранной в вертикальном реестре.
				 */
				"CurrentFolderConnectionType": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Тип пользователя - пользователь портала или сотрудник компании.
				 */
				"UserConnectionTypeValue": {
					dataValueType: this.Terrasoft.DataValueType.ENUM,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}
			},
			rules: {
				"Contact": {
					"BindParameterEnabledContact": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"logical": this.Terrasoft.LogicalOperatorType.OR,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "Operation"
								},
								"comparisonType": this.Terrasoft.core.enums.ComparisonType.EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": this.Terrasoft.ConfigurationEnums.CardOperation.ADD
								}
							},
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "CurrentFolderConnectionType"
								},
								"comparisonType": this.Terrasoft.core.enums.ComparisonType.EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": ConfigurationConstants.UserType.SSP
								}
							}
						]
					}
				},
				"PasswordExpireDate": {
					"BindParameterEnabledPasswordExpireDate": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "PasswordDuration"
								},
								"comparisonType": this.Terrasoft.ComparisonType.GREATER,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": 0
								}
							}
						]
					}
				}
			},
			methods: {

				/**
				 * Метод фильтрации детали SysAdminUnitGrantedRightDetailV2.
				 * @protected
				 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
				 */
				getSysAdminUnitGrantedRightDetailV2Filters: function() {
					var filters = this.Terrasoft.createFilterGroup();
					filters.logicalOperation = this.Terrasoft.LogicalOperatorType.OR;
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "GrantorSysAdminUnit.Id", this.get("Id")));
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "GranteeSysAdminUnit.Id", this.get("Id")));
					return filters;
				},

				/**
				 * @inheritDoc BasePageV2#onEntityInitialized
				 * @protected
				 * @overridden
				 */
				onEntityInitialized: function() {
					this.setUserDefaultValues();
					this.changeColumnCaption("Name", this.get("Resources.Strings.UserNameCaption"));
					this.callParent(arguments);
				},

				/**
				 * Устанавливает для колонки новое значение заголовка.
				 * @param {String} columnName Название колонки объекта.
				 * @param {String} columnCaption Заголовок колонки объекта.
				 */
				changeColumnCaption: function(columnName, columnCaption) {
					var column = this.getColumnByName(columnName);
					column.caption = columnCaption;
				},

				/**
				 * Устанавливает тип пользователя.
				 * @protected
				 */
				setSysAdminUnitType: function() {
					this.set("SysAdminUnitType", {
						value: ConfigurationConstants.SysAdminUnit.TypeGuid.User
					});
				},

				/**
				 * Устанавливает значения по умолчанию для полей viewModel.
				 * @protected
				 */
				setUserDefaultValues: function() {
					var currentConnectionType = this.get("ConnectionType");
					var connectionType = this.Ext.isEmpty(currentConnectionType)
						? this.get("CurrentFolderConnectionType")
						: currentConnectionType;
					var connectionTypeCaption = connectionType
						? this.get("Resources.Strings.PortalUserCaption")
						: this.get("Resources.Strings.OurCompanyUserCaption");
					this.set("UserConnectionTypeValue", {
						value: connectionType,
						displayValue: connectionTypeCaption
					});
					if (this.isAddMode()) {
						this.setSysAdminUnitType();
					} else {
						var passwordMask = this.get("Resources.Strings.PasswordMask");
						this.set("UserPassword", passwordMask);
						this.set("PasswordConfirmation", passwordMask);
						this.changedValues = {};
					}
				},

				/**
				 * Создает элемент коллекции продуктов лицензирования.
				 * @protected
				 * @param {Object} config Конфиг модели продукта лицензирования.
				 * @return {Terrasoft.BaseViewModel} Элемент коллекции продуктов лицензирования.
				 */
				getLicenseCollectionItem: function(config) {
					var licText;
					if (config.Type === ConfigurationConstants.SysAdminUnit.SysLicType.Server) {
						licText = this.Ext.String.format(
								this.get("Resources.Strings.ServerLicAvailableCountCaption"), config.UsedCount);
					} else {
						licText = this.Ext.String.format(
								this.get("Resources.Strings.LicAvailableCountCaption"),
								config.AvailableCount, config.PaidCount);
					}
					var collectionItem = this.Ext.create("Terrasoft.BaseViewModel", {
						values: {
							Id: config.Id,
							Name: config.Caption,
							Checked: config.Checked,
							Enabled: config.Enabled,
							AvailableCount: config.AvailableCount,
							PaidCount: config.PaidCount,
							AvailableCountCaption: licText
						}
					});
					collectionItem.sandbox = this.sandbox;
					return collectionItem;
				},

				/**
				 * Обработчик изменения значения чекбокса в списке лицензий.
				 * @private
				 */
				onCheckChange: function() {
					if (this.get("IsLicenseDataLoaded")) {
						if (this.get("ModifyAllLicenses")) {
							this.updateButtonsVisibility(true);
							this.set("IsChanged", true, {silent: true});
							this.set("Restored", true, {silent: true});
						} else if (this.isEditMode()) {
							this.save({isSilent: true});
						}
					}
				},

				/**
				 * Выбирает все лицензии.
				 * @protected
				 */
				onCheckAllLicenses: function() {
					this.modifyAllLicenses(true);
				},

				/**
				 * Убирает все лицензии.
				 * @protected
				 */
				onUncheckAllLicenses: function() {
					this.modifyAllLicenses(false);
				},

				/**
				 * Обработчик изменения признака "Активен" у пользователя.
				 * @protected
				 */
				onActiveChanged: function() {
					var active = this.get("Active");
					if (active) {
						var enable = this.get("CanManageLicUsers");
						this.modifyAllLicenses(active, enable);
					} else {
						this.modifyAllLicenses(active, false);
					}
				},

				/**
				 * Инцициализирует коллекцию продуктов лицензирования.
				 * @private
				 */
				initCollection: function() {
					var collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
					collection.on("itemChanged", this.onCheckChange, this);
					this.set("LicenseCollection", collection);
				},

				/**
				 * Изменяет свойства элементов коллекции LicenseCollection.
				 * @param {Boolean} checked Признак выбора.
				 * @param {Boolean=} enabled Признак доступности элемента управления.
				 */
				modifyAllLicenses: function(checked, enabled) {
					var collection = this.get("LicenseCollection");
					this.set("ModifyAllLicenses", true);
					collection.each(function(model) {
						model.set("Checked", checked);
						if (!this.Ext.isEmpty(enabled)) {
							model.set("Enabled", enabled);
						}
					}, this);
					this.set("ModifyAllLicenses", false);
				},

				/**
				 * Получает список продуктов лицензирования, сформированный на сервере.
				 * @protected
				 * @param {Function=} callback Функция обратного вызова.
				 * @param {Object=} scope Контекст функции обратного вызова.
				 */
				getAvailableLicenses: function(callback, scope) {
					var userId = this.isAddMode()
						? this.Terrasoft.GUID_EMPTY
						: (this.get("PrimaryColumnValue") || this.get(this.entitySchema.primaryColumnName));
					var dataSend = {
						userId: userId
					};
					var config = {
						serviceName: "AdministrationService",
						methodName: "GetAvailableLicPackages",
						data: dataSend
					};
					this.set("IsLicenseDataLoaded", false);
					this.showMaskOnLicenses();
					this.callService(config, function(response) {
						this.onGetAvailableLicenses(response, callback, scope);
					}, this);
				},

				/**
				 * Заполняет коллекцию элементов лицензирования.
				 * @protected
				 * @param {Object} response Ответ сервера.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Terrasoft.BaseViewModel} scope Контекст функции обратного вызова.
				 */
				onGetAvailableLicenses: function(response, callback, scope) {
					var collection = this.get("LicenseCollection");
					collection.clear();
					if (response && response.GetAvailableLicPackagesResult) {
						var items = this.Ext.decode(response.GetAvailableLicPackagesResult);
						this.Terrasoft.each(items, function(item) {
							var licenseItem = this.getLicenseCollectionItem(item);
							collection.add(item.Id, licenseItem);
						}, this);
					}
					this.set("IsLicenseDataLoaded", true);
					this.hideMaskOnLicenses();
					if (this.Ext.isFunction(callback)) {
						callback.call(scope);
					}
				},

				/**
				 * Отображает маску для списка лицензий.
				 * @private
				 */
				showMaskOnLicenses: function() {
					var maskConfig = {
						selector: "#LicenseListContainerList",
						timeout: 0
					};
					var elements = this.Ext.select(maskConfig.selector);
					if (elements.item(0)) {
						this.licenseListMaskId = this.Terrasoft.Mask.show(maskConfig);
					}
				},

				/**
				 * Скрывает маску для списка лицензий.
				 * @private
				 */
				hideMaskOnLicenses: function() {
					this.Terrasoft.Mask.hide(this.licenseListMaskId);
				},

				/**
				 * Формирует viewConfig для элемента списка продуктов лицензирования.
				 * @param {Object} itemConfig viewConfig элемента управления.
				 * @param {Terrasoft.BaseViewModel} item Элемент списка продуктов лицензирования.
				 */
				getItemViewConfig: function(itemConfig, item) {
					var labelClass = ["license-label"];
					if (!item.get("Enabled")) {
						labelClass.push("disabled-label");
					}
					var config = ViewUtilities.getContainerConfig("license-view");
					var labelConfig = {
						className: "Terrasoft.Label",
						caption: {bindTo: "Name"},
						classes: {labelClass: labelClass},
						inputId: item.get("Id") + "-el"
					};
					var editConfig = {
						className: "Terrasoft.CheckBoxEdit",
						id: item.get("Id"),
						checked: {bindTo: "Checked"},
						enabled: {bindTo: "Enabled"}
					};
					var countConfig = {
						className: "Terrasoft.Label",
						caption: {bindTo: "AvailableCountCaption"},
						classes: {labelClass: labelClass.concat(["count-label"])}
					};
					config.items.push(labelConfig, editConfig, countConfig);
					itemConfig.config = config;
				},

				/**
				 * @inheritDoc BasePageV2#getHeader
				 * @protected
				 * @overridden
				 */
				getHeader: function() {
					return this.get("Resources.Strings.UserPageHeader");
				},

				/**
				 * Обработчик изменения и загрузки изображения.
				 * @protected
				 */
				onPhotoChange: this.Terrasoft.emptyFn,

				/**
				 * Вызывается перед вызовом диалогового окна выбора файла.
				 * @protected
				 */
				beforeFileSelected: this.Terrasoft.emptyFn,

				/**
				 * Получает ссылку на изображение.
				 * @protected
				 * @return {String|*} Url изображения.
				 */
				getSrcMethod: function() {
					var contact = this.get("Contact");
					if (contact && contact.Photo) {
						var imageConfig = {
							source: this.Terrasoft.ImageSources.SYS_IMAGE,
							params: {
								primaryColumnValue: contact.Photo.value
							}
						};
						return this.Terrasoft.ImageUrlBuilder.getUrl(imageConfig);
					}
					return this.Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.DefaultPhoto);
				},

				/**
				 * Обработчик изменения поля "Подтверждение пароля".
				 * Если задана системная настройка "Срок действия пароля", выставляет полю "Дата окончания
				 * действия пароля" значение, равное текущей дате + количество дней, указанное в системной
				 * настройке.
				 * @protected
				 */
				onPasswordConfirmationChanged: function() {
					var password = this.get("UserPassword");
					var passwordDuration = this.get("PasswordDuration");
					if (!this.Ext.isEmpty(password) && password === this.get("PasswordConfirmation") &&
						passwordDuration > 0) {
						var passwordExpireDate = this.Ext.Date.add(new Date(), this.Ext.Date.DAY, passwordDuration);
						passwordExpireDate = this.Ext.Date.clearTime(passwordExpireDate);
						this.set("PasswordExpireDate", passwordExpireDate);
					}
				},

				/**
				 * Инициализирует пользовательский валидатор для поля "Подтверждение пароля".
				 * @inheritDoc BaseSchemaViewModel#setValidationConfig
				 * @protected
				 * @overridden
				 */
				setValidationConfig: function() {
					this.callParent(arguments);
					this.addColumnValidator("PasswordConfirmation", function(newPasswordConfirmation) {
						var password = this.get("UserPassword");
						var invalidMessage = "";
						if (!this.Ext.isEmpty(password)) {
							if (password !== newPasswordConfirmation) {
								invalidMessage = this.get("Resources.Strings.PasswordMissMatchMessageCaption");
							}
						}
						return {
							fullInvalidMessage: invalidMessage,
							invalidMessage: invalidMessage
						};
					});
				},

				/**
				 * Получает значение системной настройки PasswordDuration.
				 * @protected
				 * @param {String} settingCode Код системной настройки.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				initSysSettingsValue: function(settingCode, callback, scope) {
					this.Terrasoft.SysSettings.querySysSettingsItem(settingCode,
						function(value) {
							this.set(settingCode, value);
							if (this.Ext.isFunction(callback)) {
								callback.call(scope);
							}
						},
						this);
				},

				/**
				 * Выполняет подписку на события GetChiefId и SetRecordInformation.
				 * @protected
				 */
				publishMessages: function() {
					var result = this.sandbox.publish("GetChiefId", {}, [this.sandbox.id]);
					if (this.Ext.isEmpty(result)) {
						result = this.sandbox.publish("SetRecordInformation", {}, [this.sandbox.id]);
					}
					if (!this.Ext.isEmpty(result)) {
						this.set("Parent", result.parent);
						var connectionType = this.getConnectionType(result.defaultValues);
						this.set("CurrentFolderConnectionType", this.Ext.isEmpty(connectionType)
							? null
							: connectionType.value);
					}
				},

				/**
				 * Из массива значений по умолчанию возвращает значение с именем "ConnectionType" или null.
				 * @param {Array} defaultValues Коллекция значений по умолчанию детали "Пользователи".
				 * @return {Object} Тип пользователя или null, если тип пользователя не найден среди значений
				 * по умолчанию.
				 */
				getConnectionType: function(defaultValues) {
					var result = null;
					this.Terrasoft.each(defaultValues, function(value) {
						if (value.name === "ConnectionType") {
							result = value;
						}
					});
					return result;
				},

				/**
				 * Публикует сообщение о необходимости обновить древовидный реестр раздела.
				 * @protected
				 */
				publishUpdateSectionGrid: function() {
					if (this.isAddMode()) {
						this.sandbox.publish("UpdateSectionGrid");
					}
				},

				/**
				 * Проверяет, есть ли у пользователя право на управление лицензиями согласно
				 * операции CanManageLicUsers.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				checkCanManageLicUsers: function(callback, scope) {
					RightUtilities.checkCanExecuteOperation({
						operation: "CanManageLicUsers"
					}, function(result) {
						this.set("CanManageLicUsers", result);
						if (this.Ext.isFunction(callback)) {
							callback.call(scope);
						}
					}, this);
				},

				/**
				 * @inheritDoc BasePageV2#init
				 * @protected
				 * @overridden
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				init: function(callback, scope) {
					this.callParent([
						function() {
							this.publishMessages();
							this.initCollection();
							this.Terrasoft.chain(
								function(next) {
									this.getAvailableLicenses(function() {
										next();
									}, this);
								},
								function(next) {
									this.initSysSettingsValue("PasswordDuration", function() {
										next();
									}, this);
								},
								function(next) {
									this.initSysSettingsValue("AccountTypeForOurCompany", function() {
										next();
									}, this);
								},
								function(next) {
									this.checkCanManageLicUsers(function() {
										next();
									}, this);
								},
								function(next) {
									callback.call(scope);
									next();
								},
								this);
						}, this
					]);
				},

				/**
				 * @inheritDoc BasePageV2#updateDetails
				 * @overridden
				 */
				updateDetails: function() {
					this.callParent(arguments);
					this.getAvailableLicenses();
				},

				/**
				 * @inheritDoc BasePageV2#fireDiscardChangesEvent
				 * @protected
				 * @overridden
				 */
				fireDiscardChangesEvent: function() {
					var entityInfo = this.onGetEntityInfo();
					this.sandbox.publish("DiscardChanges", entityInfo);
				},

				/**
				 * @inheritDoc BasePageV2#onDiscardChangesClick
				 * @protected
				 * @overridden
				 */
				onDiscardChangesClick: function() {
					if (this.isNew) {
						this.sandbox.publish("BackHistoryState");
						return;
					}

					this.set("IsEntityInitialized", false);
					this.loadEntity(this.get("Id"), function() {
						this.discardPasswordChanges();
						this.resetLicensesCollection();
						this.updateButtonsVisibility(false, {
							force: true
						});
						this.set("IsEntityInitialized", true);
						this.discardDetailChange();
					}, this);
					if (this.get("ForceUpdate")) {
						this.set("ForceUpdate", false);
					}
				},

				/**
				 * Сбрасывает поля "Пароль" и "Подтверждение пароля" к их значениям по-умолчанию.
				 */
				discardPasswordChanges: function() {
					var info = {
						invalidMessage: "",
						isValid: true
					};
					this.set("UserPassword", this.get("Resources.Strings.PasswordMask"),
						{preventValidation: true});
					this.set("PasswordConfirmation", this.get("UserPassword"),
						{preventValidation: true});
					this.validationInfo.set("UserPassword", info);
					this.validationInfo.set("PasswordConfirmation", info);
					this.changedValues = {};
				},

				/**
				 * Восстанавливает значения по умолчанию для коллекции лицензий.
				 * @private
				 */
				resetLicensesCollection: function() {
					var collection = this.get("LicenseCollection");
					this.set("ModifyAllLicenses", true);
					collection.each(function(model) {
						if (model.getIsChanged()) {
							model.set("Checked", model.values.Checked);
							model.set("Enabled", model.values.Enabled);
						}
					}, this);
					this.set("ModifyAllLicenses", false);
				},

				/**
				 * Проверяет, изменились ли поля объекта страницы, включая виртуальное поле "Подтверждение пароля".
				 * Базовая реализация метода не проверяет виртуальные поля.
				 * @protected
				 * @overridden
				 * @return {Boolean} Возвращает true если есть изменения в значениях колонок схемы страницы,
				 * false - в обратном случае
				 */
				isChanged: function() {
					var result = this.callParent(arguments);
					return result || !this.Ext.isEmpty(this.changedValues.PasswordConfirmation);
				},

				/**
				 * Если был изменен пароль, метод выполняет валидацию пароля на сервере через вызов
				 * метода ValidatePassword в Terrasoft.Core.PasswordUtilities.
				 * @protected
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				validatePassword: function(callback, scope) {
					var result = {
						success: true
					};
					if (!this.changedValues || this.Ext.isEmpty(this.changedValues.UserPassword)) {
						callback.call(scope || this, result);
					} else {
						var dataSend = {
							userName: this.get("Name"),
							password: this.get("UserPassword")
						};
						var config = {
							serviceName: "AdministrationService",
							methodName: "ValidatePassword",
							data: dataSend
						};
						this.callService(config, function(response) {
							if (response) {
								if (!this.Ext.isEmpty(response.ValidatePasswordResult)) {
									result.message = response.ValidatePasswordResult;
									result.success = false;
								}
								callback.call(scope || this, result);
							}
						});
					}
				},

				/**
				 * Вызывает конфигурационный сервис AdministrationService
				 * для сохранения пользовательских лицензий.
				 * @param {Function} next
				 */
				saveLicenses: function(next) {
					var licenseItems = {};
					var collection = this.get("LicenseCollection");
					collection.each(function(model) {
						if (this.isAddMode() || model.getIsChanged()) {
							licenseItems[model.get("Id")] = model.get("Checked");
						}
					}, this);
					if (this.Terrasoft.isEmptyObject(licenseItems)) {
						this.cardSaveResponse = {success: true};
						next();
					} else {
						var dataSend = {
							userId: this.get("Id"),
							licenseItems: this.Ext.encode(licenseItems)
						};
						var config = {
							serviceName: "AdministrationService",
							methodName: "UpdateLicenseInfo",
							data: dataSend
						};
						this.callService(config, function(response) {
							this.onSaveLicenses(response, next);
						}, this);
					}
				},

				/**
				 * Выполняет постобработку сохранения лицензий пользователя.
				 * @param {Object} response Ответ сервера.
				 * @param {Function} next Следующий метод в цепочке.
				 */
				onSaveLicenses: function(response, next) {
					if (response) {
						response.message = response.UpdateLicenseInfoResult;
						response.success = this.Ext.isEmpty(response.message);
						if (this.validateResponse(response)) {
							this.cardSaveResponse = response;
							next();
						} else {
							this.getAvailableLicenses();
						}
					}
				},

				/**
				 * Вызывает конфигурационный сервис AdministrtionService для сохранения пользователя.
				 * @param {Function} next
				 */
				saveUser: function(next) {
					var changedColumns = {};
					this.Terrasoft.each(this.entitySchema.columns,
						function(column) {
							if (!this.Ext.isEmpty(this.changedValues[column.name])) {
								changedColumns[column.name] = this.get(column.name).value || this.get(column.name);
							}
						}, this);
					if (this.Terrasoft.isEmptyObject(changedColumns)) {
						this.cardSaveResponse = {success: true};
						next();
					} else {
						if (this.Ext.isEmpty(changedColumns.Id)) {
							changedColumns.Id = this.get("Id");
						}
						var dataSend = {
							jsonObject: this.Ext.encode(changedColumns),
							roleId: this.get("Parent")
						};
						var config = {
							serviceName: "AdministrationService",
							methodName: "UpdateOrCreateUser",
							data: dataSend
						};
						this.callService(config, function(response) {
							this.onSaveUser(response, next);
						}, this);
					}
				},

				/**
				 * Выполняет постобработку сохранения.
				 * @param {Object} response Ответ сервера.
				 * @param {Function} next Следующий метод в цепочке.
				 */
				onSaveUser: function(response, next) {
					if (response) {
						response.message = response.UpdateOrCreateUserResult;
						response.success = this.Ext.isEmpty(response.message);
						if (this.validateResponse(response)) {
							this.isNew = false;
							this.changedValues = null;
							this.cardSaveResponse = response;
							next();
						}
					}
				},

				/**
				 * Выполняет сохранение пользователя.
				 * @overridden
				 * @param {Object} config
				 */
				save: function(config) {
					this.showBodyMask();
					this.Terrasoft.chain(
						this.saveCheckCanEditRight,
						this.saveAsyncValidate,
						this.saveUser,
						this.saveLicenses,
						function(next) {
							this.saveDetails(function(response) {
								if (this.validateResponse(response)) {
									next();
								}
							}, this);
						},
						function() {
							this.onSaved(this.cardSaveResponse, config);
							this.cardSaveResponse = null;
							delete this.cardSaveResponse;
						},
						this);
				},

				/**
				 * @inheritDoc BasePageV2#onSaved
				 * @overridden
				 */
				onSaved: function() {
					this.callParent(arguments);
					if (this.isEditMode()) {
						this.getAvailableLicenses();
					}
				},

				/**
				 * Публикует сообщение о необходимости выполнить актуализацию ролей.
				 */
				publishNeedActualizeRolesMessage: function() {
					this.sandbox.publish("NeedActualizeRoles");
				},

				/**
				 * Выполняет проверку имени пользователя на уникальность.
				 * @protected
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				validateUniqueUserName: function(callback, scope) {
					var result = {
						success: true
					};
					if (!this.changedValues || this.Ext.isEmpty(this.changedValues.Name)) {
						callback.call(scope || this, result);
					} else {
						var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: this.entitySchemaName
						});
						esq.addColumn("Id");
						esq.filters.add("primaryColumnFilter", this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.NOT_EQUAL, "Id", this.get("PrimaryColumnValue")));
						esq.filters.add("nameFilter", this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "Name", this.get("Name")));
						esq.getEntityCollection(function(response) {
							if (response && response.success) {
								if (response.collection.getCount() > 0) {
									result.message = this.get("Resources.Strings.UserNameNotUnique");
									result.success = false;
								}
								callback.call(scope || this, result);
							}
						}, this);
					}
				},

				/**
				 * @inhericDoc BasePageV2#asyncValidate
				 * @protected
				 * @overridden
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				asyncValidate: function(callback, scope) {
					this.callParent([function(response) {
						if (!this.validateResponse(response)) {
							return;
						}
						this.Terrasoft.chain(
							function(next) {
								this.validatePassword(function(response) {
									if (this.validateResponse(response)) {
										next();
									}
								}, this);
							},
							function(next) {
								this.validateUniqueUserName(function(response) {
									if (this.validateResponse(response)) {
										next();
									}
								}, this);
							},
							function(next) {
								callback.call(scope, response);
								next();
							}, this);
					}, this]);
				},

				/**
				 * Обработчик ввода в поле "Пароль".
				 * Введенное значение сразу же записывается в переменную UserPassword.
				 * Это необходимо для того, чтобы валидация пароля происходила посимвольно,
				 * а не только при потере фокуса.
				 * @private
				 */
				onNewPasswordKeypress: function() {
					var newPasswordTextEdit = this.Ext.getCmp("new-password");
					var newPasswordInputValue = newPasswordTextEdit.getTypedValue();
					this.set("UserPassword", newPasswordInputValue);
					this.validate();
				},

				/**
				 * Вызывается, когда поле "Пароль" получает фокус.
				 * Очищает значения в полях "Пароль" и "Подтверждение пароля".
				 * @private
				 */
				onPasswordGetFocus: function() {
					this.set("UserPassword", null);
					this.set("PasswordConfirmation", null, {preventValidation: true});
				},

				/**
				 * Обработчик ввода в поле "Подтверждение пароля".
				 * Введенное значение сразу же записывается в переменную PasswordConfirmation.
				 * Это необходимо для того, чтобы валидация пароля происходила посимвольно,
				 * а не только при потере фокуса.
				 * @private
				 */
				onNewPasswordConfirmationKeypress: function() {
					var newPasswordConfirmationTextEdit = this.Ext.getCmp("new-password-confirmation");
					var newPasswordConfirmationInputValue = newPasswordConfirmationTextEdit.getTypedValue();
					this.set("PasswordConfirmation", newPasswordConfirmationInputValue);
				},

				/**
				 * Утанавливает значение свойства isRequired.
				 * @protected
				 * @virtual
				 */
				isRequiredFieldsVisible: function() {
					return true;
				},

				/**
				 * Оповещает детали о необходимости обновить содержимое.
				 * @protected
				 * @param {Object} args Информация об необходимом изменении детали {action: "", rows: []}
				 */
				fireUpdateDetail: function(args) {
					this.sandbox.publish("UpdateDetail", args, [this.sandbox.id]);
				},

				/**
				 * @inheritDoc BasePageV2#onCloseCardButtonClick
				 * @protected
				 * @overridden
				 */
				onCloseCardButtonClick: function() {
					this.callParent(arguments);
					this.publishUpdateSectionGrid();
				},

				/**
				 * Проверяет ответ сервиса и оповещает пользователя в случае наличия ошибок.
				 * @protected
				 * @param {String} response валидируемый ответ сервиса
				 * @param {String} message сообщение в случае ошибки
				 * @param {Function} callback Функция обратного вызова в случае отсутствия ошиибок.
				 * @param {Object} scope  Контекст функции обратного вызова.
				 */
				validateServiceResponse: function(response, message, callback, scope) {
					this.hideBodyMask();
					var result = this.Ext.decode(response);
					var isSuccess = result && result.Success;
					if (isSuccess) {
						callback.call(scope);
					} else if (result.IsSecurityException) {
						this.showInformationDialog(result.ExceptionMessage);
					} else {
						this.showInformationDialog(message);
					}
				},

				/**
				 * Действия необходимые после удаления пользователя.
				 * @protected
				 */
				afterUserDeleted: function() {
					this.publishNeedActualizeRolesMessage();
					this.fireUpdateDetail({reloadAll: true});
					this.onCloseCardButtonClick();
				},

				/**
				 * Оповещает о результате удаления пользователя в случае ошибки,
				 * оповещает деталь "Пользователи" о необходимости обновления реестра
				 * и закрывает страницу при успешном удалении.
				 * @param {Object} response ответ сервиса.
				 * @protected
				 */
				onDeleteUserResponseHandler: function(response) {
					var message = this.get("Resources.Strings.DeleteErrorMessage");
					this.validateServiceResponse(response.DeleteUserResult, message, this.afterUserDeleted, this);
				},

				/**
				 * Вызывает сервис удаления пользователей и закрывает страницу при успешном удалении.
				 * @protected
				 * @virtual
				 */
				onDeleteCurrentUserClick: function() {
					this.showConfirmationDialog(this.get("Resources.Strings.DeleteUserMessage"),
						function(returnCode) {
							if (returnCode === this.Terrasoft.MessageBoxButtons.NO.returnCode) {
								return;
							}
							var dataSend = {userId: this.get("Id")};
							var config = {
								serviceName: "AdministrationService",
								methodName: "DeleteUser",
								data: dataSend
							};
							this.showBodyMask();
							this.callService(config, this.onDeleteUserResponseHandler, this);
						},
						[
							this.Terrasoft.MessageBoxButtons.YES.returnCode,
							this.Terrasoft.MessageBoxButtons.NO.returnCode
						],
						null
					);
				},

				/**
				 * Обработчик кнопки "DeleteButton".
				 * @protected
				 * @virtual
				 */
				onDeleteClick: function() {
					this.onDeleteCurrentUserClick();
				}
			}
		};
	});
