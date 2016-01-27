define("LeadPageV2", ["BusinessRuleModule", "ConfigurationConstants"],
		function(BusinessRuleModule, ConfigurationConstants) {
			return {
				entitySchemaName: "Lead",
				attributes: {
					"EmployeesNumber": {
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						lookupListConfig: {
							orders: [{columnPath: "Position"}]
						}
					}
				},
				details: /**SCHEMA_DETAILS*/{
					Activities: {
						schemaName: "ActivityDetailV2",
						filter: {
							detailColumn: "Lead"
						},
						defaultValues: {
							Lead: {
								masterColumn: "Id"
							}
						}
					},
					Files: {
						schemaName: "FileDetailV2",
						entitySchemaName: "FileLead",
						filter: {
							detailColumn: "Lead"
						}
					}
				}/**SCHEMA_DETAILS*/,
				methods: {

					/**
					 * Возвращает коллекцию действий карточки
					 * @protected
					 * @overridden
					 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий карточки
					 */
					getActions: function() {
						var actionMenuItems = this.callParent(arguments);
						var disqualifyMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
						disqualifyMenuItems.addItem(this.getActionsMenuItem({
							Caption: {bindTo: "Resources.Strings.DisqualifyLeadLost"},
							Tag: "disqualifyLost"
						}));
						disqualifyMenuItems.addItem(this.getActionsMenuItem({
							Caption: {bindTo: "Resources.Strings.DisqualifyLeadNoConnection"},
							Tag: "disqualifyNoConnection"
						}));
						disqualifyMenuItems.addItem(this.getActionsMenuItem({
							Caption: {bindTo: "Resources.Strings.DisqualifyLeadNotInterested"},
							Tag: "disqualifyNotInterested"
						}));
						return actionMenuItems;
					},

					/**
					 * Сохранение записи
					 * @overridden
					 */
					save: function() {
						if (!this.checkRequiredActionColumns()) {
							return;
						}
						return this.callParent(arguments);
					},

					/**
					 * Callback-функция действия "Квалификация лида"
					 */
					qualifyLead: function() {
						var recordId = this.get("Id");
						var token = "CardModuleV2/LeadQualificationPageV2/edit/" + recordId;
						this.sandbox.publish("PushHistoryState", {hash: token});
//						var moduleId = this.sandbox.id + "_" + "LeadQualificationPageV2";
//						this.openCardInChain({
//							schemaName: "LeadQualificationPageV2",
//							action: "edit",
//							id: recordId,
//							moduleId: moduleId
//						});
					},

					/**
					 * Проверка обязательных для выполнения действий колонок
					 * @private
					 */
					checkRequiredActionColumns: function() {
						var account = this.get("Account");
						var contact = this.get("Contact");
						if (!account && !contact) {
							this.showInformationDialog(this.get("Resources.Strings.RequiredFieldsMessage"));
							return false;
						}
						return true;
					},

					/**
					 * Действие "Квалифицировать"
					 */
					saveLead: function() {
						this.showBodyMask();
						if (!this.checkRequiredActionColumns()) {
							this.hideBodyMask();
							return;
						}
						this.saveEntity(this.qualifyLead, this);
					},

					/**
					 * Действие "Дисквалифицировать"
					 */
					disqualifyLead: function(statusId) {
						if (!this.checkRequiredActionColumns()) {
							return;
						}
						this.showConfirmationDialog(this.get("Resources.Strings.DisqualifyLeadActionMessage"),
							function(returnCode) {
								if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
									this.loadLookupDisplayValue("Status", statusId);
								}
							}, ["yes", "no"]);
					},

					/**
					 * Действие "Дисквалифицировать - Утрачен"
					 */
					disqualifyLost: function() {
						this.disqualifyLead(ConfigurationConstants.Lead.Status.QualifiedAsLost);
					},

					/**
					 * Действие "Дисквалифицировать - Невозможно связаться"
					 */
					disqualifyNoConnection: function() {
						this.disqualifyLead(ConfigurationConstants.Lead.Status.QualifiedAsNoConnection);
					},

					/**
					 * Действие "Дисквалифицировать - Более не заинтересован"
					 */
					disqualifyNotInterested: function() {
						this.disqualifyLead(ConfigurationConstants.Lead.Status.QualifiedAsNotInterested);
					},

					/**
					 * Перепривязка ссылок в активностях
					 */
					updateActivitiesLink: function(linkColumnName, recordId) {
						var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "Activity"
						});
						esq.addColumn("Id");
						esq.filters.add("LeadFilter",
							esq.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "Lead", this.get("Id")));
						esq.getEntityCollection(function(result) {
							var batchQuery = Ext.create("Terrasoft.BatchQuery");
							var collection = result.collection;
							collection.each(function(item) {
								var activityId = item.get("Id");
								var update = Ext.create("Terrasoft.UpdateQuery", {
									rootSchemaName: "Activity"
								});
								update.enablePrimaryColumnFilter(activityId);
								update.setParameterValue(linkColumnName, recordId, this.Terrasoft.DataValueType.GUID);
								batchQuery.add(update);
							});
							batchQuery.execute();
						}, this);
					},

					/**
					 * Метод, срабатывающий после инициализации объекта
					 * @overridden
					 */
					onEntityInitialized: function() {
						var account = this.get("Account");
						if (this.Terrasoft.isGUID(account)) {
							this.set("Account", null);
							this.loadLookupDisplayValue("Account", account);
						}
						var contact = this.get("Contact");
						if (this.Terrasoft.isGUID(contact)) {
							this.set("Contact", null);
							this.loadLookupDisplayValue("Contact", contact);
						}
						var queryParams = this.sandbox.publish("GetHistoryState");
						var createdmessage = "";
						var queryParamsState = queryParams.state;
						if (queryParamsState.Qualified) {
							if (queryParamsState.contactName && queryParamsState.isContactQualifyAsNew) {
								createdmessage += Ext.String.format(this.get("Resources.Strings.CreatedContactMessage"),
									queryParamsState.contactName);
								queryParamsState.contactName = null;
							}
							if (queryParamsState.accountName && queryParamsState.isAccountQualifyAsNew) {
								if (createdmessage) {
									createdmessage += " ";
								}
								createdmessage += Ext.String.format(this.get("Resources.Strings.CreatedAccountMessage"),
									queryParamsState.accountName);
								queryParamsState.accountName = null;
							}
							if (createdmessage) {
								this.showInformationDialog(createdmessage);
							}
							if (queryParamsState.contactId) {
								this.updateActivitiesLink("Contact", queryParamsState.contactId);
							}
							if (queryParamsState.accountId) {
								this.updateActivitiesLink("Account", queryParamsState.accountId);
							}
							queryParamsState.Qualified = false;
							var currentHash = queryParams.hash;
							var newState = this.Terrasoft.deepClone(queryParams);
							this.sandbox.publish("ReplaceHistoryState", {
								stateObj: newState,
								pageTitle: null,
								hash: currentHash.historyState,
								silent: true
							});
						}
						this.callParent(arguments);
					},

					/**
					 * @inheritdoc Terrasoft.BaseModulePageV2#getFileEntitySchemaName
					 * @overridden
					 */
					getFileEntitySchemaName: function() {
						return "FileLead";
					}
				},
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "insert",
						"name": "GeneralInfoTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.GeneralInfoTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "HistoryTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.HistoryTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "NotesTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.NotesTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "Contact",
						"values": {
							"layout": {"column": 0, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "Account",
						"values": {
							"layout": {"column": 12, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "Status",
						"values": {
							"layout": {"column": 0, "row": 1, "colSpan": 12},
							"contentType": Terrasoft.ContentType.ENUM,
							"controlConfig": {"enabled": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "GeneralInfoTab",
						"name": "LeadPageGeneralTabContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageGeneralTabContainer",
						"propertyName": "items",
						"name": "LeadPageGeneralTabContentGroup",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageGeneralTabContentGroup",
						"propertyName": "items",
						"name": "LeadPageGeneralBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "HistoryTab",
						"name": "LeadHistoryTabContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadHistoryTabContainer",
						"propertyName": "items",
						"name": "LeadPageSourceInfo",
						"values": {
							"caption": {bindTo: "Resources.Strings.SourceGroupCaption"},
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": []
						},
						"index": 0
					},
					{
						"operation": "insert",
						"parentName": "LeadPageSourceInfo",
						"propertyName": "items",
						"name": "LeadPageSourceInfoBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageSourceInfoBlock",
						"propertyName": "items",
						"name": "LeadMedium",
						"values": {
							"layout": {"column": 0, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageSourceInfoBlock",
						"propertyName": "items",
						"name": "LeadSource",
						"values": {
							"layout": {"column": 0, "row": 1, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadHistoryTabContainer",
						"name": "LeadHistoryTabBlock",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "NotesTab",
						"name": "LeadNotesTabContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadNotesTabContainer",
						"propertyName": "items",
						"name": "LeadNotesTabBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "FeedTab",
						"name": "LeadFeedTabContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadFeedTabContainer",
						"propertyName": "items",
						"name": "LeadFeedTabBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageGeneralBlock",
						"propertyName": "items",
						"name": "Title",
						"values": {
							"layout": {"column": 0, "row": 0, "colSpan": 12},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageGeneralBlock",
						"propertyName": "items",
						"name": "FullJobTitle",
						"values": {
							"layout": {"column": 12, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageGeneralBlock",
						"propertyName": "items",
						"name": "Commentary",
						"values": {
							"contentType": Terrasoft.ContentType.LONG_TEXT,
							"layout": {"column": 0, "row": 1, "colSpan": 24}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageGeneralTabContainer",
						"propertyName": "items",
						"name": "LeadPageCategorizationContainer",
						"values": {
							"caption": {"bindTo": "Resources.Strings.LeadPageCategorizationBlockCaption"},
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadHistoryTabContainer",
						"propertyName": "items",
						"name": "Activities",
						"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCategorizationContainer",
						"propertyName": "items",
						"name": "LeadPageCategorizationBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCategorizationBlock",
						"propertyName": "items",
						"name": "Industry",
						"values": {
							"layout": {"column": 0, "row": 1, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCategorizationBlock",
						"propertyName": "items",
						"name": "AnnualRevenue",
						"values": {
							"layout": {"column": 12, "row": 1, "colSpan": 12},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCategorizationBlock",
						"propertyName": "items",
						"name": "EmployeesNumber",
						"values": {
							"layout": {"column": 0, "row": 2, "colSpan": 12},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageGeneralTabContainer",
						"propertyName": "items",
						"name": "LeadPageCommunicationContainer",
						"values": {
							"caption": {bindTo: "Resources.Strings.LeadPageCommunicationBlockCaption"},
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCommunicationContainer",
						"propertyName": "items",
						"name": "LeadPageCommunicationBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCommunicationBlock",
						"propertyName": "items",
						"name": "BusinesPhone",
						"values": {
							"layout": {"column": 0, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCommunicationBlock",
						"propertyName": "items",
						"name": "DoNotUsePhone",
						"values": {
							"layout": {"column": 12, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCommunicationBlock",
						"propertyName": "items",
						"name": "MobilePhone",
						"values": {
							"layout": {"column": 0, "row": 1, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCommunicationBlock",
						"propertyName": "items",
						"name": "DoNotUseSMS",
						"values": {
							"layout": {"column": 12, "row": 1, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCommunicationBlock",
						"propertyName": "items",
						"name": "Fax",
						"values": {
							"layout": {"column": 0, "row": 2, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCommunicationBlock",
						"propertyName": "items",
						"name": "DoNotUseFax",
						"values": {
							"layout": {"column": 12, "row": 2, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCommunicationBlock",
						"propertyName": "items",
						"name": "Email",
						"values": {
							"layout": {"column": 0, "row": 3, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCommunicationBlock",
						"propertyName": "items",
						"name": "DoNotUseEmail",
						"values": {
							"layout": {"column": 12, "row": 3, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageCommunicationBlock",
						"propertyName": "items",
						"name": "Website",
						"values": {
							"layout": {"column": 0, "row": 4, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageGeneralTabContainer",
						"propertyName": "items",
						"name": "LeadPageAddressContainer",
						"values": {
							"caption": {"bindTo": "Resources.Strings.LeadPageAddressBlockCaption"},
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageAddressContainer",
						"propertyName": "items",
						"name": "LeadPageAddressBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageAddressBlock",
						"propertyName": "items",
						"name": "AddressType",
						"values": {
							"layout": {"column": 0, "row": 0, "colSpan": 12},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageAddressBlock",
						"propertyName": "items",
						"name": "Country",
						"values": {
							"layout": {"column": 12, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageAddressBlock",
						"propertyName": "items",
						"name": "Region",
						"values": {
							"layout": {"column": 0, "row": 1, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageAddressBlock",
						"propertyName": "items",
						"name": "City",
						"values": {
							"layout": {"column": 12, "row": 1, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageAddressBlock",
						"propertyName": "items",
						"name": "Zip",
						"values": {
							"layout": {"column": 0, "row": 2, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadPageAddressBlock",
						"propertyName": "items",
						"name": "Address",
						"values": {
							"layout": {"column": 12, "row": 2, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "NotesTab",
						"propertyName": "items",
						"name": "Files",
						"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
					},
					{
						"operation": "insert",
						"name": "LeadNotesControlGroup",
						"parentName": "NotesTab",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"caption": {"bindTo": "Resources.Strings.NotesGroupCaption"},
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "LeadNotesControlGroup",
						"propertyName": "items",
						"name": "Notes",
						"values": {
							"contentType": Terrasoft.ContentType.RICH_TEXT,
							"layout": {"column": 0, "row": 0, "colSpan": 24},
							"labelConfig": {"visible": false},
							"controlConfig": {
								"imageLoaded": {"bindTo": "insertImagesToNotes"},
								"images": {"bindTo": "NotesImagesCollection"}
							}
						}
					}
				]/**SCHEMA_DIFF*/,
				rules: {
					"Region": {
						"FiltrationRegionByCountry": {
							ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
							autocomplete: true,
							autoClean: true,
							baseAttributePatch: "Country",
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							attribute: "Country"
						},
						"EnabledRegion": {
							ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
							property: BusinessRuleModule.enums.Property.ENABLED,
							conditions: [{
								leftExpression: {
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
								}
							}]
						}
					},
					"City": {
						"FiltrationCityByCountry": {
							ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
							autocomplete: true,
							autoClean: true,
							baseAttributePatch: "Country",
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							attribute: "Country"
						},
						"FiltrationCityByRegion": {
							ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
							autocomplete: true,
							autoClean: true,
							baseAttributePatch: "Region",
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							attribute: "Region"
						},
						"EnabledCity": {
							ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
							property: BusinessRuleModule.enums.Property.ENABLED,
							conditions: [{
								leftExpression: {
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
								}
							}]
						}
					},
					"Commentary": {
						"EnabledCommentary": {
							ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
							property: BusinessRuleModule.enums.Property.ENABLED,
							conditions: [{
								leftExpression: {
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
								}
							}]
						}
					},
					"DoNotUsePhone": {
						"EnabledDoNotUsePhone": {
							ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
							property: BusinessRuleModule.enums.Property.ENABLED,
							conditions: [{
								leftExpression: {
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
								}
							}]
						}
					},
					"DoNotUseSMS": {
						"EnabledDoNotUseSMS": {
							ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
							property: BusinessRuleModule.enums.Property.ENABLED,
							conditions: [{
								leftExpression: {
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
								}
							}]
						}
					},
					"DoNotUseFax": {
						"EnabledDoNotUseFax": {
							ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
							property: BusinessRuleModule.enums.Property.ENABLED,
							conditions: [{
								leftExpression: {
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
								}
							}]
						}
					},
					"DoNotUseEmail": {
						"EnabledDoNotUseEmail": {
							ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
							property: BusinessRuleModule.enums.Property.ENABLED,
							conditions: [{
								leftExpression: {
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
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
									attribute: "Status"
								},
								comparisonType: Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: ConfigurationConstants.Lead.Status.New
								}
							}]
						}
					}
				}
			};
		});
