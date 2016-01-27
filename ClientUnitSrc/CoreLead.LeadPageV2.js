define("LeadPageV2", ["LeadPageV2Resources", "BaseFiltersGenerateModule", "ProcessModuleUtilities",
		"LeadConfigurationConst", "BusinessRuleModule", "ConfigurationEnums",
		"BaseProgressBarModule", "EntityHelper", "css!BaseProgressBarModule"],
	function(resources, BaseFiltersGenerateModule, ProcessModuleUtilities, LeadConfigurationConst, BusinessRuleModule,
			enums) {
		return {
			entitySchemaName: "Lead",
			mixins: {
				EntityHelper: "Terrasoft.EntityHelper"
			},
			attributes: {
				"LeadType": {
					isRequired: true
				},
				"LeadTypeStatus": {
					isRequired: true
				},
				"QualifyStatus": {
					lookupListConfig: {
						columns: ["Name", "StageNumber"]
					}
				},
				"Owner": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					lookupListConfig: {filter: BaseFiltersGenerateModule.OwnerFilter}
				},
				"SalesOwner": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					lookupListConfig: {filter: BaseFiltersGenerateModule.OwnerFilter}
				},
				"UseProcessLeadManagement": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				}
			},
			details: /**SCHEMA_DETAILS*/{
				LeadProduct: {
					schemaName: "LeadProductDetailV2",
					entitySchemaName: "LeadProduct",
					filter: {
						masterColumn: "Id",
						detailColumn: "Lead"
					}
				}
			}/**SCHEMA_DETAILS*/,
			methods: {

				/**
				 * Инициализирует начальные значения модели.
				 * @overridden
				 * @param {Function} callback Функция обратного вызова.
				 */
				init: function(callback) {
					this.callParent([function() {
						Terrasoft.SysSettings.querySysSettingsItem("UseProcessLeadManagement", function(value) {
							this.set("UseProcessLeadManagement", value);
							callback.call(this);
						}, this);
					}, this]);
				},

				/**
				 * Инициализирует контекстную справку
				 * @overridden
				 */
				initContextHelp: function() {
					this.set("ContextHelpId", 1009);
					this.callParent(arguments);
				},

				/**
				 * Инициализирует значение по умолчанию для поля QualifyStatus.
				 * @protected
				 */
				initDefQualifyStatus: function() {
					var operation = this.get("Operation");
					if (operation === enums.CardStateV2.EDIT) {
						return;
					}
					var qualifyStatusId = this.getQualifyStatus();
					if (qualifyStatusId !== LeadConfigurationConst.LeadConst.QualifyStatus.Qualification) {
						return;
					}
					var qualifiedContact = this.get("QualifiedContact");
					if (qualifiedContact && qualifiedContact.value !== Terrasoft.GUID_EMPTY) {
						this.set("QualifyStatus",
							{"value": LeadConfigurationConst.LeadConst.QualifyStatus.Distribution});
					}
				},

				/**
				 * Метод, срабатывающий после инициализации объекта.
				 * @overridden
				 */
				onEntityInitialized: function() {
					var qualifyStatusId = this.getQualifyStatus();
					var qualifyStatus = LeadConfigurationConst.LeadConst.QualifyStatus;
					var sourceDataEditable = (qualifyStatusId === qualifyStatus.Qualification ||
						qualifyStatusId === qualifyStatus.Distribution ||
						qualifyStatusId === qualifyStatus.TransferForSale ||
						qualifyStatusId === qualifyStatus.WaitingForSale);
					this.set("SourceDataEditable", sourceDataEditable);
					if (this.isNew) {
						var qualifiedContact = this.get("QualifiedContact");
						var qualifiedAccount = this.get("QualifiedAccount");
						if (qualifiedContact && !qualifiedAccount) {
							var qualifiedContactId = qualifiedContact.value;
							this.readEntity("Contact", qualifiedContactId, ["Account"], function(result) {
								var account = result.get("Account");
								if (account) {
									this.set("QualifiedAccount", account);
								}
							});
						}
					}
					this.callParent(arguments);
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#save
				 * @overridden
				 */
				save: function() {
					this.initDefQualifyStatus();
					this.callParent(arguments);
				},

				/**
				 * Проверка обязательных для выполнения действий колонок.
				 * Заглушка для отмены валидации ФИО и Названия контрагента.
				 * @overridden
				 */
				checkRequiredActionColumns: function() {
					return true;
				},

				/**
				 * Обработчик нажатия на кнопку процесса управления лидом.
				 */
				onQualificationProcessButtonClick: function() {
					var config = {
						callback: this.continueLeadManagementExecuting,
						isSilent: true
					};
					this.save(config);
				},

				/**
				 * Выполняет запуск процесса упарвления лидом с точки его последней активности.
				 */
				continueLeadManagementExecuting: function() {
					var qualificationProcessId = this.get("QualificationProcessId");
					if (qualificationProcessId) {
						ProcessModuleUtilities.continueExecuting(qualificationProcessId, this);
					} else {
						if (!qualificationProcessId) {
							this.refreshColumns(["QualificationProcessId"], this.executeQualificationProcess);
						} else {
							this.executeQualificationProcess();
						}
					}
				},

				/**
				 * Выполняет запуск процесса упарвления лидом с точки его последней активности.
				 */
				executeQualificationProcess: function() {
					var qualificationProcessId = this.get("QualificationProcessId");
					if (qualificationProcessId) {
						ProcessModuleUtilities.continueExecuting(qualificationProcessId, this);
					} else {
						Terrasoft.SysSettings.querySysSettingsItem("LeadManagementProcess", function(sysSetting) {
							var processName = "";
							if (!sysSetting) {
								processName = "LeadManagement";
							}
							var processId = sysSetting.value;
							ProcessModuleUtilities.executeProcess({
								"sysProcessName": processName,
								"sysProcessId": processId,
								"parameters": {
									"LeadId": this.getPrimaryColumnValue(),
									"ManualLaunch": true
								}
							});
						}, this);
					}
				},

				/**
				 * Возвращает состояние квалификации лида.
				 * @return {String}
				 */
				getQualifyStatus: function() {
					var qualifyStatus = this.get("QualifyStatus");
					return (qualifyStatus) ? qualifyStatus.value : null;
				},

				/**
				 * Метод-конвертор для проверки отображения причины дисквалификации.
				 * @param {Object} qualifyStatus Значение стадии Лида.
				 * @return {bool} Возвращает соответствие состоянию дисквалификации.
				 */
				getIsDisqualifiedStatus: function(qualifyStatus) {
					return (qualifyStatus && (qualifyStatus.value ===
						LeadConfigurationConst.LeadConst.QualifyStatus.Disqualified));
				},

				/**
				 * Возвращает заголовок кнопки запуска процесса квалификации.
				 * @return {String}
				 */
				getQualificationProcessButtonCaption: function() {
					var qualifyStatusId = this.getQualifyStatus();
					var qualifyStatus = LeadConfigurationConst.LeadConst.QualifyStatus;
					if (qualifyStatusId === qualifyStatus.Qualification) {
						return this.get("Resources.Strings.QualifyStatusQualificationCaption");
					}
					if (qualifyStatusId === qualifyStatus.Distribution) {
						return this.get("Resources.Strings.QualifyStatusDistributionCaption");
					}
					if (qualifyStatusId === qualifyStatus.TransferForSale) {
						return this.get("Resources.Strings.QualifyStatusTranslationForSaleCaption");
					}
				},

				/**
				 * Возвращает признак активности стадии квалификации.
				 * @return {Boolean}
				 */
				getIsQualificationStageActive: function() {
					if (this.isNewMode() || !this.get("UseProcessLeadManagement")) {
						return false;
					}
					var qualifyStatusId = this.getQualifyStatus();
					var qualifyStatus = LeadConfigurationConst.LeadConst.QualifyStatus;
					return (qualifyStatusId === qualifyStatus.Qualification ||
						qualifyStatusId === qualifyStatus.Distribution ||
						qualifyStatusId === qualifyStatus.TransferForSale);
				},

				/**
				 * Метод-конвертор для преобразования значения для индикатора стадий.
				 * @param {Object} qualifyStatus Значение стадии Лида.
				 * @return {Object} Возвращает значение для индикатора стадий.
				 */
				getQualifyStatusValue: function(qualifyStatus) {
					if (!qualifyStatus || this.isNewMode()) {
						return null;
					} else {
						return {
							value: qualifyStatus.StageNumber,
							displayValue: qualifyStatus.Name
						};
					}
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "QualificationProcessButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "getQualificationProcessButtonCaption"},
						"markerValue": {"bindTo": "getQualificationProcessButtonCaption"},
						"classes": {"textClass": "actions-button-margin-right"},
						"iconAlign": Terrasoft.controls.ButtonEnums.iconAlign.RIGHT,
						"imageConfig": resources.localizableImages.QualificationProcessButtonImage,
						"click": {"bindTo": "onQualificationProcessButtonClick"},
						"layout": {"column": 6, "row": 0, "colSpan": 2},
						"visible": {"bindTo": "getIsQualificationStageActive"}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "LeadType",
					"values": {
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"isRequired": true
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "LeadTypeStatus",
					"values": {
						"layout": {"column": 0, "row": 1, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "CreatedOn",
					"values": {
						"layout": {"column": 0, "row": 2, "colSpan": 12},
						"enabled": false
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "QualifiedContact",
					"values": {
						"caption": {bindTo: "Resources.Strings.QualifiedContactCaption"},
						"layout": {"column": 12, "row": 1, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "QualifiedAccount",
					"values": {
						"caption": {bindTo: "Resources.Strings.QualifiedAccountCaption"},
						"layout": {"column": 12, "row": 2, "colSpan": 12}
					}
				},
				{
					"operation": "remove",
					"name": "Status"
				},
				{
					"operation": "insert",
					"name": "QualifyStatus",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"layout": {
							"column": 12,
							"row": 0,
							"colSpan": 12,
							"rowSpan": 0
						},
						"controlConfig": {
							"width": "158px",
							"value": {
								"bindTo": "QualifyStatus",
								"bindConfig": {"converter": "getQualifyStatusValue"}
							},
							"maxValue": 5
						},
						"dataValueType": Terrasoft.DataValueType.STAGE_INDICATOR
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "LeadDisqualifyReason",
					"values": {
						"layout": {"column": 12, "row": 3, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": false,
						"visible": {
							"bindTo": "QualifyStatus",
							"bindConfig": {"converter": "getIsDisqualifiedStatus"}
						}
					}
				},
				{
					"operation": "remove",
					"name": "LeadPageCategorizationContainer"
				},
				{
					"operation": "remove",
					"name": "LeadPageCategorizationBlock"
				},
				{
					"operation": "remove",
					"name": "Campaign"
				},
				{
					"operation": "remove",
					"name": "Commentary"
				},
				{
					"operation": "insert",
					"parentName": "LeadPageGeneralTabContainer",
					"propertyName": "items",
					"index": 0,
					"name": "LeadPageContactInfo",
					"values": {
						"caption": {bindTo: "Resources.Strings.LeadPageContactInfoCaption"},
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"controlConfig": {"collapsed": false}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageContactInfo",
					"propertyName": "items",
					"name": "LeadPageContactInfoBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": [],
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "remove",
					"name": "Contact"
				},
				{
					"operation": "insert",
					"parentName": "LeadPageContactInfoBlock",
					"propertyName": "items",
					"name": "Contact",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.ContactCaption"},
						"caption": {"bindTo": "Resources.Strings.ContactCaption"},
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"isRequired": false,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageContactInfoBlock",
					"propertyName": "items",
					"name": "Dear",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.DearCaption"},
						"caption": {"bindTo": "Resources.Strings.DearCaption"},
						"layout": {"column": 12, "row": 0, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageContactInfoBlock",
					"propertyName": "items",
					"name": "Gender",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.GenderCaption"},
						"caption": {"bindTo": "Resources.Strings.GenderCaption"},
						"layout": {"column": 0, "row": 1, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "remove",
					"name": "Title"
				},
				{
					"operation": "remove",
					"name": "Job"
				},
				{
					"operation": "remove",
					"name": "FullJobTitle"
				},
				{
					"operation": "insert",
					"parentName": "LeadPageContactInfoBlock",
					"propertyName": "items",
					"name": "Title",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.TitleCaption"},
						"caption": {"bindTo": "Resources.Strings.TitleCaption"},
						"layout": {"column": 12, "row": 1, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageContactInfoBlock",
					"propertyName": "items",
					"name": "Job",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.JobCaption"},
						"caption": {"bindTo": "Resources.Strings.JobCaption"},
						"layout": {"column": 0, "row": 2, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageContactInfoBlock",
					"propertyName": "items",
					"name": "FullJobTitle",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.FullJobTitleCaption"},
						"caption": {"bindTo": "Resources.Strings.FullJobTitleCaption"},
						"layout": {"column": 12, "row": 2, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageContactInfoBlock",
					"propertyName": "items",
					"name": "Department",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.DepartmentCaption"},
						"caption": {"bindTo": "Resources.Strings.DepartmentCaption"},
						"layout": {"column": 0, "row": 3, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageContactInfoBlock",
					"propertyName": "items",
					"name": "DecisionRole",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.DecisionRoleCaption"},
						"caption": {"bindTo": "Resources.Strings.DecisionRoleCaption"},
						"layout": {"column": 12, "row": 3, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageGeneralTabContainer",
					"propertyName": "items",
					"name": "LeadPageAccountInfo",
					"index": 1,
					"values": {
						"caption": {bindTo: "Resources.Strings.LeadPageAccountInfoCaption"},
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"controlConfig": {"collapsed": false}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageAccountInfo",
					"propertyName": "items",
					"name": "LeadPageAccountInfoBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "remove",
					"name": "Account"
				},
				{
					"operation": "remove",
					"name": "Industry"
				},
				{
					"operation": "remove",
					"name": "EmployeesNumber"
				},
				{
					"operation": "remove",
					"name": "AnnualRevenue"
				},
				{
					"operation": "insert",
					"parentName": "LeadPageAccountInfoBlock",
					"propertyName": "items",
					"name": "Account",
					"values": {
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"isRequired": false,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageAccountInfoBlock",
					"propertyName": "items",
					"name": "AccountCategory",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.AccountCategoryCaption"},
						"caption": {"bindTo": "Resources.Strings.AccountCategoryCaption"},
						"layout": {"column": 0, "row": 2, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageAccountInfoBlock",
					"propertyName": "items",
					"name": "Industry",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.IndustryCaption"},
						"caption": {"bindTo": "Resources.Strings.IndustryCaption"},
						"layout": {"column": 0, "row": 1, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageAccountInfoBlock",
					"propertyName": "items",
					"name": "EmployeesNumber",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.EmployeesNumberCaption"},
						"caption": {"bindTo": "Resources.Strings.EmployeesNumberCaption"},
						"layout": {"column": 12, "row": 1, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageAccountInfoBlock",
					"propertyName": "items",
					"name": "AnnualRevenue",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.AnnualRevenueCaption"},
						"caption": {"bindTo": "Resources.Strings.AnnualRevenueCaption"},
						"layout": {"column": 12, "row": 0, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageAccountInfoBlock",
					"propertyName": "items",
					"name": "AccountOwnership",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.AccountOwnershipCaption"},
						"caption": {"bindTo": "Resources.Strings.AccountOwnershipCaption"},
						"layout": {"column": 12, "row": 2, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "merge",
					"name": "Country",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.CountryCaption"},
						"caption": {"bindTo": "Resources.Strings.CountryCaption"},
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "merge",
					"name": "Address",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.AddressCaption"},
						"caption": {"bindTo": "Resources.Strings.AddressCaption"},
						"layout": {"column": 12, "row": 0, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "merge",
					"name": "City",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.CityCaption"},
						"caption": {"bindTo": "Resources.Strings.CityCaption"},
						"layout": {"column": 0, "row": 1, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "merge",
					"name": "AddressType",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.AddressTypeCaption"},
						"caption": {"bindTo": "Resources.Strings.AddressTypeCaption"},
						"layout": {"column": 12, "row": 1, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "merge",
					"name": "Region",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.RegionCaption"},
						"caption": {"bindTo": "Resources.Strings.RegionCaption"},
						"layout": {"column": 0, "row": 2, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "merge",
					"name": "Zip",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.ZipCaption"},
						"caption": {"bindTo": "Resources.Strings.ZipCaption"},
						"layout": {"column": 0, "row": 3, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "remove",
					"name": "DoNotUsePhone"
				},
				{
					"operation": "remove",
					"name": "DoNotUseSMS"
				},
				{
					"operation": "remove",
					"name": "DoNotUseFax"
				},
				{
					"operation": "remove",
					"name": "DoNotUseEmail"
				},
				{
					"operation": "merge",
					"name": "Email",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.EmailCaption"},
						"caption": {"bindTo": "Resources.Strings.EmailCaption"},
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "merge",
					"name": "Website",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.WebsiteCaption"},
						"caption": {"bindTo": "Resources.Strings.WebsiteCaption"},
						"layout": {"column": 12, "row": 0, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "merge",
					"name": "MobilePhone",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.MobilePhoneCaption"},
						"caption": {"bindTo": "Resources.Strings.MobilePhoneCaption"},
						"layout": {"column": 0, "row": 1, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "merge",
					"name": "BusinesPhone",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.BusinesPhoneCaption"},
						"caption": {"bindTo": "Resources.Strings.BusinesPhoneCaption"},
						"layout": {"column": 12, "row": 1, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "merge",
					"name": "Fax",
					"values": {
						"markerValue": {"bindTo": "Resources.Strings.FaxCaption"},
						"caption": {"bindTo": "Resources.Strings.FaxCaption"},
						"layout": {"column": 0, "row": 2, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadHistoryTabContainer",
					"propertyName": "items",
					"index": 0,
					"name": "LeadPageDistributionInfo",
					"values": {
						"caption": {bindTo: "Resources.Strings.LeadPageDistributionInfoCaption"},
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"controlConfig": {"collapsed": false}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageDistributionInfo",
					"propertyName": "items",
					"name": "LeadPageDistributionInfoBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": [],
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageDistributionInfoBlock",
					"propertyName": "items",
					"name": "Owner",
					"values": {
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"contentType": Terrasoft.ContentType.LOOKUP,
						"enabled": {"bindTo": "SourceDataEditable"},
						"bindTo": "Owner"
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageDistributionInfoBlock",
					"propertyName": "items",
					"name": "OpportunityDepartment",
					"values": {
						"layout": {"column": 12, "row": 0, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadHistoryTabContainer",
					"propertyName": "items",
					"index": 1,
					"name": "LeadPageTransferToSaleInfo",
					"values": {
						"caption": {bindTo: "Resources.Strings.LeadPageTransferToSaleInfoCaption"},
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"controlConfig": {"collapsed": false}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageTransferToSaleInfo",
					"propertyName": "items",
					"name": "LeadPageTransferToSaleInfoBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": [],
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageTransferToSaleInfoBlock",
					"propertyName": "items",
					"name": "SalesOwner",
					"values": {
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"contentType": Terrasoft.ContentType.LOOKUP,
						"enabled": {"bindTo": "SourceDataEditable"},
						"bindTo": "SalesOwner"
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageTransferToSaleInfoBlock",
					"propertyName": "items",
					"name": "MeetingDate",
					"values": {
						"layout": {"column": 12, "row": 0, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageTransferToSaleInfoBlock",
					"propertyName": "items",
					"name": "Budget",
					"values": {
						"layout": {"column": 0, "row": 1, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadPageTransferToSaleInfoBlock",
					"propertyName": "items",
					"name": "DecisionDate",
					"values": {
						"layout": {"column": 12, "row": 1, "colSpan": 12},
						"enabled": {"bindTo": "SourceDataEditable"}
					}
				},
				{
					"operation": "insert",
					"parentName": "NeedInfoTabContainer",
					"propertyName": "items",
					"name": "LeadProduct",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"name": "NeedInfoTabContainer",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 2,
					"values": {
						"caption": {"bindTo": "Resources.Strings.NeedInfoTabCaption"},
						"items": []
					}
				}
			]/**SCHEMA_DIFF*/,
			rules: {
				"Region": {
					"EnabledRegion": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"City": {
					"EnabledCity": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"Contact": {
					"EnabledContact": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"Account": {
					"EnabledAccount": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"Title": {
					"EnabledTitle": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"FullJobTitle": {
					"EnabledFullJobTitle": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"Industry": {
					"EnabledIndustry": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"AnnualRevenue": {
					"EnabledAnnualRevenue": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"EmployeesNumber": {
					"EnabledEmployeesNumber": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"BusinesPhone": {
					"EnabledBusinesPhone": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"MobilePhone": {
					"EnabledMobilePhone": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"Fax": {
					"EnabledFax": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"Email": {
					"EnabledEmail": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"Website": {
					"EnabledWebsite": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"AddressType": {
					"EnabledAddressType": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"Country": {
					"EnabledCountry": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"Zip": {
					"EnabledZip": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"Address": {
					"EnabledAddress": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"Notes": {
					"EnabledNotes": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "SourceDataEditable"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				}
			}
		};
	});
