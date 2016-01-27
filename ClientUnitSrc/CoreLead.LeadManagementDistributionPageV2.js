define("LeadManagementDistributionPageV2", ["BaseFiltersGenerateModule", "BusinessRuleModule", "terrasoft",
		"LeadManagementDistributionPageV2Resources", "LookupUtilities", "ConfigurationConstants",
		"ConfigurationEnums", "CustomProcessPageV2Utilities", "css!InfoButtonStyles"],
	function(BaseFiltersGenerateModule, BusinessRuleModule, Terrasoft, resources, LookupUtilities,
			ConfigurationConstants, Enums) {
		return {
			entitySchemaName: "Lead",
			mixins: {
				BaseProcessViewModel: "Terrasoft.CustomProcessPageV2Utilities"
			},
			attributes: {
				"Owner": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					lookupListConfig: {filter: BaseFiltersGenerateModule.OwnerFilter}
				},
				"ContactName": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					caption: { bindTo: "Resources.Strings.ContactNameCaption" }
				},
				"ContactDepartment": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					caption: { bindTo: "Resources.Strings.ContactDepartmentCaption" },
					referenceSchemaName: "Department"
				},
				"ContactJob": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					caption: { bindTo: "Resources.Strings.ContactJobCaption" }
				},
				"ContactGender": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					caption: { bindTo: "Resources.Strings.ContactGenderCaption" }
				},
				"ContactJobTitle": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					caption: { bindTo: "Resources.Strings.ContactJobTitleCaption" }
				},
				"ContactDecisionRole": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					caption: { bindTo: "Resources.Strings.ContactDecisionRoleCaption" }
				},
				"AccountName": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					caption: { bindTo: "Resources.Strings.AccountNameCaption" }
				},
				"Category": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					caption: { bindTo: "Resources.Strings.AccountCategoryCaption" }
				},
				"Ownership": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					caption: { bindTo: "Resources.Strings.AccountOwnershipCaption" }
				},
				"AccountEmployeesNumber": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					caption: { bindTo: "Resources.Strings.AccountEmployeesNumberCaption" }
				},
				"AccountIndustry": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					caption: { bindTo: "Resources.Strings.AccountIndustryCaption" }
				},
				"AccountAnnualRevenue": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					caption: { bindTo: "Resources.Strings.AccountAnualRevenueCaption" }
				}
			},
			details: /**SCHEMA_DETAILS*/{
				Leads: {
					schemaName: "LeadDetailV2",
					filter: {
						masterColumn: "QualifiedContact",
						detailColumn: "QualifiedContact"
					},
					filterMethod: "getLeadFilters",
					captionName: "ContactLeadDetailCaption"
				},
				ContactsInFolder: {
					schemaName: "LeadContactsInFolderDetailV2",
					filter: {
						masterColumn: "QualifiedContact",
						detailColumn: "Contact"
					},
					filterMethod: "getContactFolderFilters",
					captionName: "ContactsInFolderDetailCaption"
				}
			}/**SCHEMA_DETAILS*/,
			methods: {

				/**
				 * Проверка заполнености поля.
				 * @private
				 * @return {Boolean}
				 */
				isNotEmptyValue: function(value) {
					return !Ext.isEmpty(value);
				},

				/**
				 * Инициализация данных карточки.
				 * @private
				 */
				setInitialData: function() {
					var parameters = this.get("ProcessData").parameters;
					this.set("Operation",  Enums.CardStateV2.EDIT);
					this.set("PrimaryColumnValue", parameters.LeadId);
					this.processParameters.push({ key: "Result", value: "" });
				},

				/**
				 * Устанавливает состояние страницы.
				 * @private
				 * @overridden
				 */
				initEntity: function(callback) {
					this.setInitialData();
					this.callParent(
						[function() {
							this.loadReferencedSchemas(callback);
						}, this]
					);
				},

				/**
				 * Устанавливает значения атрибутов из схем {Contact} и {Account}.
				 * @protected
				 * @virtual
				 */
				loadReferencedSchemas: function(callback) {
					var contact = this.get("QualifiedContact") || { value: Terrasoft.GUID_EMPTY };
					var account = this.get("QualifiedAccount") || { value: Terrasoft.GUID_EMPTY };
					this.readContact(contact.value, function(entity) {
						if (entity) {
							this.set("ContactName", entity.get("Name"));
							this.set("ContactDepartment", entity.get("Department"));
							this.set("ContactDecisionRole", entity.get("DecisionRole"));
							this.set("ContactJobTitle", entity.get("JobTitle"));
							this.set("ContactGender", entity.get("Gender"));
							this.set("ContactJob", entity.get("Job"));
						}
						this.readAccount(account.value, function(entity) {
							if (entity) {
								this.set("AccountName", entity.get("Name"));
								this.set("Ownership", entity.get("Ownership"));
								this.set("AccountIndustry", entity.get("Industry"));
								this.set("Category", entity.get("AccountCategory"));
								this.set("AccountEmployeesNumber", entity.get("EmployeesNumber"));
								this.set("AccountAnnualRevenue", entity.get("AnnualRevenue"));
							}
							if (callback) {
								callback.call(this);
							}
						});
					});
				},

				/**
				 * Выполняет чтение колонок из объекта по идентификатору
				 * с передачей считанного объекта в функцию обратного вызова.
				 * @param {String} schemaName Имя схемы.
				 * @param {String} recordId Уникальный идентификатор.
				 * @param {Array} columns Перечень названий колонок для считывания.
				 * @param {Function} callback Функция обратного вызова.
				 */
				readEntity: function(schemaName, recordId, columns, callback) {
					if (recordId === Terrasoft.GUID_EMPTY) {
						if (callback) {
							callback.call(this);
						}
						return;
					}
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: schemaName
					});
					Terrasoft.each(columns, function(columnName) {
						esq.addColumn(columnName);
					});
					esq.getEntity(recordId, function(result) {
						if (callback) {
							callback.call(this, result.entity);
						}
					}, this);
				},

				/**
				 * Выполняет чтение объекта "Контакт".
				 * @param {String} contactId Уникальный идентификатор.
				 * @param {Function} callback Функция обратного вызова.
				 */
				readContact: function(contactId, callback) {
					this.readEntity("Contact", contactId,
						["Name", "Department", "DecisionRole", "JobTitle", "Gender", "Job"], callback);
				},

				/**
				 * Выполняет чтение объекта "Контрагент".
				 * @param {String} accountId Уникальный идентификатор.
				 * @param {Function} callback Функция обратного вызова.
				 */
				readAccount: function(accountId, callback) {
					this.readEntity("Account", accountId, ["Name", "Ownership", "Industry", "AccountCategory",
						"EmployeesNumber", "AnnualRevenue"], callback);
				},

				/**
				 * Метод фильтрации детали лидов по Контакту.
				 * @private
				 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
				 */
				getLeadFilters: function() {
					var contact = this.get("QualifiedContact");
					var contactId = (contact && contact.value) ? contact.value : this.Terrasoft.GUID_EMPTY;
					var leadId = this.get("Id");
					var filters = this.Terrasoft.createFilterGroup();
					filters.logicalOperation = this.Terrasoft.LogicalOperatorType.AND;
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "QualifiedContact", contactId));
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.NOT_EQUAL, "Id", leadId));
					return filters;
				},

				/**
				 * Метод фильтрации детали "Входит в группы" по Контакту.
				 * @private
				 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
				 */
				getContactFolderFilters: function() {
					var contact = this.get("QualifiedContact");
					var contactId = this.Terrasoft.GUID_EMPTY;
					if (contact && contact.value) {
						contactId = contact.value;
					}
					var filters = this.Terrasoft.createFilterGroup();
					filters.logicalOperation = this.Terrasoft.LogicalOperatorType.AND;
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Contact", contactId));
					return filters;
				},

				/**
				 * Перевод лида в продажу.
				 * @protected
				 */
				setTransferToSale: function() {
					this.processParameters.push({
						key: "Result",
						value: "TransferToSale"
					});
					this.completeProcess(true);
				},

				/**
				 * Распределить позднее.
				 * @protected
				 */
				setDistributeLater: function() {
					this.processParameters.push({
						key: "Result",
						value: "DistributeLater"
					});
					this.completeProcess(false);
				},

				/**
				 * Интерес отсутствует
				 * @protected
				 */
				setNotInteresting: function() {
					this.processParameters.push({
						key: "Result",
						value: "NotInteresting"
					});
					this.completeProcess(false);
				},

				/**
				 * @inheritDoc Terrasoft.Configuration.BasePageV2#subscribeSandboxEvents
				 * @overridden
				 */
				subscribeSandboxEvents: function() {
					this.callParent(arguments);
					var subscribersIds = this.getSaveRecordMessagePublishers();
					this.sandbox.subscribe("GetCardState", function() {
						return { state: Enums.CardStateV2.EDIT };
					}, this, subscribersIds);
				},

				/**
				 * @overridden
				 * @return {string}
				 */
				getHeader: function() {
					return this.get("Resources.Strings.DistributionPageCaption");
				},

				/**
				 * @overridden
				 */
				initHeaderCaption: Ext.emptyFn,

				/**
				 * @protected
				 * @overridden
				 */
				initPrintButtonMenu: Ext.emptyFn,

				/**
				 * @overridden
				 */
				updateButtonsVisibility: function() {
					this.callParent(arguments);
					this.set("ShowCloseButton", true);
				},

				/**
				 * @overridden
				 */
				onCloseCardButtonClick: function() {
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * @protected
				 */
				onNextButtonClick: function() {
					this.acceptProcessElement("NextButton");
				},

				/**
				 * Инициирует завершение работы карточки и передачу параметров в процесс.
				 * @param {Boolean} validate Признак, следует ли выполнять валидацию.
				 */
				completeProcess: function(validate) {
					if (validate) {
						var resultObject = {
							success: this.validate()
						};
						if (!resultObject.success) {
							resultObject.message = this.getValidationMessage();
							this.validateResponse(resultObject);
							return;
						}
					}
					var owner = this.get("Owner");
					this.processParameters.push(
						{
							key: "LeadOwnerId",
							value:  (owner && owner.value) ? owner.value : null
						}
					);
					this.pushProcessParameter("RemindToOwner");
					this.pushProcessParameter("OpportunityDepartment");
					this.completeExecution(arguments);
				},

				/**
				 * Добавляет значение параметра карточки в параметры процесса.
				 * @param {String} name Название параметра.
				 * @private
				 */
				pushProcessParameter: function(name) {
					var parameter = this.get(name) || null;
					this.processParameters.push(
						{
							key: name,
							value: (parameter && parameter.value) ? parameter.value : parameter
						}
					);
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "QualifiedContact",
					"values": {
						"layout": {"column": 0, "row": 0},
						"controlConfig": {"enabled": false},
						"caption": {"bindTo": "Resources.Strings.ContactCaption"},
						"isRequired": true,
						"enabled": {
							"bindTo": "QualifiedContact",
							"bindConfig": {converter: "isNotEmptyValue"}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "QualifiedAccount",
					"values": {
						"layout": {"column": 12, "row": 0},
						"caption": {"bindTo": "Resources.Strings.AccountCaption"},
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "LeadType",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 0, "row": 1},
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"name": "TransferToSaleTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.TransferToSaleTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "LeadTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.LeadTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "LeadTab",
					"propertyName": "items",
					"name": "Leads",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"name": "ContactInFolderTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.ContactInFolderTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "ContactInFolderTab",
					"propertyName": "items",
					"name": "ContactsInFolder",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"name": "TransferToSaleDataContainer",
					"parentName": "TransferToSaleTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "TransferToSaleBlock",
					"parentName": "TransferToSaleDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ContactDataBlock",
					"parentName": "TransferToSaleDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"caption": {"bindTo": "Resources.Strings.ContactDataBlockCaption"}
					}
				},
				{
					"operation": "insert",
					"name": "AccountDataBlock",
					"parentName": "TransferToSaleDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"caption": {"bindTo": "Resources.Strings.AccountDataBlockCaption"}
					}
				},
				{
					"operation": "insert",
					"name": "ContactDataBlockGridLayout",
					"parentName": "ContactDataBlock",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "AccountDataBlockGridLayout",
					"parentName": "AccountDataBlock",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "TransferToSaleBlockGridLayout",
					"parentName": "TransferToSaleBlock",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Owner",
					"parentName": "TransferToSaleBlockGridLayout",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.LOOKUP,
						"layout": {"column": 0, "row": 0},
						"bindTo": "Owner"
					}
				},
				{
					"operation": "insert",
					"name": "RemindToOwner",
					"parentName": "TransferToSaleBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 0},
						"enabled": {
							"bindTo": "Owner",
							"bindConfig": {converter: "isNotEmptyValue"}
						}
					}
				},
				{
					"operation": "insert",
					"name": "OpportunityDepartment",
					"parentName": "TransferToSaleBlockGridLayout",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 0, "row": 1}
					}
				},
				{
					"operation": "insert",
					"name": "ContactName",
					"parentName": "ContactDataBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 0},
						"bindTo": "ContactName",
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"name": "ContactDepartment",
					"parentName": "ContactDataBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 0},
						"bindTo": "ContactDepartment",
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"name": "ContactJob",
					"parentName": "ContactDataBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 1},
						"bindTo": "ContactJob",
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"name": "ContactGender",
					"parentName": "ContactDataBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 1},
						"bindTo": "ContactGender",
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"name": "ContactJobTitle",
					"parentName": "ContactDataBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 2},
						"bindTo": "ContactJobTitle",
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"name": "ContactDecisionRole",
					"parentName": "ContactDataBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 2},
						"bindTo": "ContactDecisionRole",
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"name": "AccountName",
					"parentName": "AccountDataBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 0},
						"bindTo": "AccountName",
						"controlConfig": {"enabled": false}

					}
				},
				{
					"operation": "insert",
					"name": "Category",
					"parentName": "AccountDataBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 0},
						"bindTo": "Category",
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"name": "Ownership",
					"parentName": "AccountDataBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 1},
						"bindTo": "Ownership",
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"name": "AccountEmployeesNumber",
					"parentName": "AccountDataBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 1},
						"bindTo": "AccountEmployeesNumber",
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"name": "AccountIndustry",
					"parentName": "AccountDataBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 2},
						"bindTo": "AccountIndustry",
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"name": "AccountAnnualRevenue",
					"parentName": "AccountDataBlockGridLayout",
					"propertyName": "items",
					"values": {
						"layout": { "column": 12, "row": 2 },
						"bindTo": "AccountAnnualRevenue",
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "merge",
					"name": "actions",
					"values": {
						"visible": false
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "DistributionButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": { "bindTo": "Resources.Strings.DistributeButtonCaption" },
						"classes": {
							textClass: "actions-button-margin-right",
							"wrapperClass": ["actions-button-margin-right"]
						},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"controlConfig": {
							"menu": {
								"items":  [
									{
										"caption": { "bindTo": "Resources.Strings.TransferToSaleMenuCaption" },
										"click": { "bindTo": "setTransferToSale" },
										"imageConfig":  resources.localizableImages.TransferToSaleImage
									},
									{
										"caption": { "bindTo": "Resources.Strings.DistributeLaterMenuCaption" },
										"click": { "bindTo": "setDistributeLater" },
										"imageConfig":  resources.localizableImages.DistributeLaterImage
									},
									{
										"caption": { "bindTo": "Resources.Strings.NotInterestingMenuCaption" },
										"click": { "bindTo": "setNotInteresting" },
										"imageConfig":  resources.localizableImages.NotInterestingImage
									}
								]
							}
						},
						"layout": {column: 0, row: 0, colSpan: 2}
					},
					"index": 0
				},
				{
					"operation": "merge",
					"name": "SaveButton",
					"values": {
						"visible": false
					}
				},
				{
					"operation": "merge",
					"name": "DelayExecutionButton",
					"values": {
						"visible": false
					}
				},
				{
					"operation": "merge",
					"name": "DiscardChangesButton",
					"values": {
						"visible": false
					}
				},
				{
					"operation": "merge",
					"name": "ViewOptionsButton",
					"values": {
						"visible": false
					}
				},
				{
					"operation": "insert",
					"parentName": "RightContainer",
					"propertyName": "items",
					"name": "InformationTooltipButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": { "bindTo": "Resources.Images.InfoSpriteImage" },
						"classes": {
							"wrapperClass": "info-button",
							"imageClass": "info-button-image"
						},
						"showTooltip": true,
						"tooltipText": { "bindTo": "Resources.Strings.DistributionInfoTip" }
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});