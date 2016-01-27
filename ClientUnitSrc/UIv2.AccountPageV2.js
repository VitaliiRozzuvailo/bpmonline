define("AccountPageV2", ["BaseFiltersGenerateModule", "ConfigurationEnums", "ConfigurationConstants",
			"DuplicatesSearchUtilitiesV2"],
		function(BaseFiltersGenerateModule, Enums, ConfigurationConstants) {
			return {
				entitySchemaName: "Account",
				messages: {
					/**
					 * @message UpdateRelationshipDiagram
					* Перезагружает диаграмму взаимосвязей.
					*/
					"UpdateRelationshipDiagram": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					},

					/**
					 * @message GetDuplicateSearchConfig
					 * Отправляет параметры для модуля поиска дублей.
					 * @return {Object} Параметры для модуля поиска дублей.
					 */
					"GetDuplicateSearchConfig": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},

					/**
					 *@message FindDuplicatesResult
					 * Обрабатывает результаты поиска дублей.
					 * @param {Object} Результат работы модуля поиска дублей.
					 */
					"FindDuplicatesResult": {
						mode: Terrasoft.MessageMode.BROADCAST,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},

					/**
					 * @message SetInitialisationData
					 * Устанавливает изначальные параметры поиска в социальных сетях.
					 */
					"SetInitialisationData": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},

					/**
					 * @message ResultSelectedRows
					 * Возвращает выбранные строки в справочнике.
					 */
					"ResultSelectedRows": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},

					/**
					 * @message GetCommunicationsList
					 * Запрашивает список средств связи.
					 */
					"GetCommunicationsList": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					}
				},
				attributes: {
					"Owner": {
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						lookupListConfig: {filter: BaseFiltersGenerateModule.OwnerFilter}
					},
					"AnnualRevenue": {
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						lookupListConfig: {
							orders: [{columnPath: "FromBaseCurrency"}]
						}
					},
					"EmployeesNumber": {
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						lookupListConfig: {
							orders: [{columnPath: "Position"}]
						}
					},
					"canUseSocialFeaturesByBuildType": {
						dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
						value: false
					}
				},
				details: /**SCHEMA_DETAILS*/{
					Communications: {
						schemaName: "AccountCommunicationDetail",
						filter: {
							masterColumn: "Id",
							detailColumn: "Account"
						}
					},
					Activities: {
						schemaName: "ActivityDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Account"
						},
						useRelationship: true

					},
					AccountBillingInfo: {
						schemaName: "AccountBillingInfoDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Account"
						}
					},
					AccountOrganizationChart: {
						schemaName: "AccountOrganizationChartDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Account"
						}
					},
					AccountContacts: {
						schemaName: "AccountContactsDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Account"
						},
						useRelationship: true
					},
					Files: {
						schemaName: "FileDetailV2",
						entitySchemaName: "AccountFile",
						filter: {
							masterColumn: "Id",
							detailColumn: "Account"
						}
					},
					AccountAddress: {
						schemaName: "AccountAddressDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Account"
						}
					},
					AccountAnniversary: {
						schemaName: "AccountAnniversaryDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Account"
						}
					},
					Relationships: {
						schemaName: "AccountRelationshipDetailV2",
						filterMethod: "relationshipDetailFilter",
						defaultValues: {
							AccountA: {
								masterColumn: "Id"
							}
						}
					},
					EmailDetailV2: {
						schemaName: "EmailDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Account"
						},
						filterMethod: "emailDetailFilter"
					}
				}/**SCHEMA_DETAILS*/,
				/**
				 * Классы-миксины (примеси) расширяющие функциональность данного класа
				 */
				mixins: {
					DuplicatesSearchUtilitiesV2: "Terrasoft.DuplicatesSearchUtilitiesV2"
				},
				methods: {

					/**
					 * Инициализирует начальные значения модели
					 * @protected
					 * @virtual
					 */
					init: function() {
						this.callParent(arguments);
						this.mixins.DuplicatesSearchUtilitiesV2.init.call(this);
						var sysSettings = ["BuildType"];
						Terrasoft.SysSettings.querySysSettings(sysSettings, function() {
							var buildType = Terrasoft.SysSettings.cachedSettings.BuildType &&
									Terrasoft.SysSettings.cachedSettings.BuildType.value;
							this.set("canUseSocialFeaturesByBuildType", buildType !==
							ConfigurationConstants.BuildType.Public);
						}, this);
					},

					/**
					 * @obsolete
					 */
					findContactsInSocialNetworks: function() {
						var activeRowId = this.get("Id");
						if (activeRowId !== undefined) {
							var recordName = this.get("Name");
							var config = {
								entitySchemaName: "Account",
								mode: "search",
								recordId: activeRowId,
								recordName: recordName
							};
							var historyState = this.sandbox.publish("GetHistoryState");
							this.sandbox.publish("PushHistoryState", {
								hash: historyState.hash.historyState,
								silent: true
							}, this);
							this.sandbox.loadModule("FindContactsInSocialNetworksModule", {
								renderTo: "centerPanel",
								id: this.sandbox.id + "_FindContactsInSocialNetworksModule",
								keepAlive: true
							});
							this.sandbox.subscribe("ResultSelectedRows", function(args) {
								this.set("Number", args.name);
								this.set("SocialMediaId", args.id);
							}, this, [this.sandbox.id + "_FindContactsInSocialNetworksModule"]);
							this.sandbox.subscribe("SetInitialisationData", function() {
								return config;
							}, [this.sandbox.id + "_FindContactsInSocialNetworksModule"]);
						}
					},

					/**
					 * Функция создания фильтров детали relationship
					 * @protected
					 * @returns {createFilterGroup}
					 */
					relationshipDetailFilter: function() {
						var recordId = this.get("Id");
						var filterGroup = new this.Terrasoft.createFilterGroup();
						filterGroup.logicalOperation = Terrasoft.LogicalOperatorType.OR;
						filterGroup.add("AccountAFilter", this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "Account", recordId));
						return filterGroup;
					},

					/**
					 * Функция создания фильтров детали email
					 * @protected
					 * @returns {createFilterGroup}
					 */
					emailDetailFilter: function() {
						var recordId = this.get("Id");
						var filterGroup = new this.Terrasoft.createFilterGroup();
						filterGroup.add("AccountNotNull", this.Terrasoft.createColumnIsNotNullFilter("Account"));
						filterGroup.add("AccountConnection", this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "Account", recordId));
						filterGroup.add("ActivityType", this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "Type", ConfigurationConstants.Activity.Type.Email));
						return filterGroup;
					},

					/**
					 * Функция создания фильтров детали history
					 * @protected
					 * @returns {createFilterGroup}
					 */
					historyDetailFilter: function() {
						var filterGroup = new this.Terrasoft.createFilterGroup();
						filterGroup.add("AccountFilter", this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL,
								"Account", this.get("Id")));
						filterGroup.add("sysWorkspacedetailFilter", this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL,
								"SysEntity.SysWorkspace", this.Terrasoft.SysValue.CURRENT_WORKSPACE.value));
						return filterGroup;
					},

					/**
					 * Получает имя метода поиска дублей
					 * @protected
					 * @returns {String}
					 */
					getFindDuplicatesMethodName: function() {
						return "FindAccountDuplicates";
					},

					/**
					 * Получает имя метода установки дублей контрагентов
					 * @protected
					 * @returns {String}
					 */
					getSetDuplicatesMethodName: function() {
						return "SetAccountDuplicates";
					},

					/**
					 * Валидирует значения модели представления.
					 * Если присутствуют некорректные значения, выводит сообщение о необходимости заполнения первого.
					 * Иначе вызывается callback-функция. В данном случае проверяет включен ли режим поиск дублей.
					 * Если так, то выполнить поиск дублей
					 * @protected
					 * @overridden
					 * @param {Function} callback callback-функция
					 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции
					 */
					asyncValidate: function(callback, scope) {
						if (this.changedValues && this.changedValues.PrimaryContact) {
							this.set("PrimaryContactChanged", true);
						}
						this.callParent([function(result) {
							if (!result.success || !this.get("PerformSearchOnSave")) {
								callback.call(scope, result);
							} else {
								this.findOnSave(callback, scope);
							}
						}, this]);
					},

					/**
					 * Дополнительная обработка после сохранения сущности.
					 * @protected
					 * @overridden
					 * @param {Object} response Результат выполнения сохранения.
					 * @param {Object} config Параметры.
					 */
					onSaved: function(response, config) {
						if ((config && config.isSilent) || this.get("PrimaryContactAdded") ||
								(!this.isAddMode() && Ext.isEmpty(this.get("PrimaryContact"))) ||
								(config && config.callParent === true)) {
							this.callParent(arguments);
							if (!this.get("IsInChain")) {
								this.updateDetail({detail: "Relationships"});
							} else {
								this.sandbox.publish("UpdateRelationshipDiagram", null, [this.sandbox.id]);
							}
						} else if (this.isAddMode() && Ext.isEmpty(this.get("PrimaryContact"))) {
							this.showConfirmationDialog(this.get("Resources.Strings.AddPrimaryContact"), function(result) {
								if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
									this.addPrimaryContact();
									this.set("Operation", Enums.CardStateV2.EDIT);
									this.set("IsChanged", this.isChanged());
									this.updateButtonsVisibility(false);
								} else {
									config = config || {};
									config.callParent = true;
									this.onSaved(response, config);
								}
							}, ["yes", "no"]);
						} else {
							this.onUpdateContactAccount(function() {
								config = config || {};
								config.callParent = true;
								this.onSaved(response, config);
							}, this);
						}
					},

					/**
					 * Дополнительная обработка при отрисовке
					 * @overridden
					 * @protected
					 */
					onRender: function() {
						this.callParent(arguments);
						if (this.get("Restored") && this.get("PrimaryContactAdded")) {
							this.onSaved({
								success: true
							});
						}
					},

					/**
					 * Обновляет карьеру основного контакта
					 * @protected
					 * @param {Function} callback Callback функция
					 * @param {Object} scope Контекст выполнения функции callback
					 */
					onUpdateContactAccount: function(callback, scope) {
						if (!this.get("PrimaryContactChanged")) {
							callback.call(scope);
							return;
						}
						this.set("PrimaryContactChanged", false);
						var recordId = this.get("Id");
						var accountName = this.get("Name");
						var primaryContact = this.get("PrimaryContact");
						var careerConfig = {
							contactId: primaryContact.value,
							isPrimary: true,
							isCurrent: true
						};
						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "ContactCareer"
						});
						select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
						select.addColumn("Account");
						select.addColumn("Primary");
						select.addColumn("Current");
						var filters = Ext.create("Terrasoft.FilterGroup");
						filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Contact",
								primaryContact.value));
						filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Current",
								1));
						select.filters = filters;
						select.execute(function(response) {
							if (response.success) {
								if (response.collection.getCount() > 0) {
									var isPrimary = false;
									response.collection.each(function(career) {
										if (career.get("Account") === recordId) {
											callback.call(scope, response);
											return;
										}
										if (career.get("Primary")) {
											isPrimary = true;
										}
									});
									var setMsg = this.Ext.String.format(
											this.get("Resources.Strings.SetAccountPrimaryCareer"),
											accountName, primaryContact.displayValue);
									this.showConfirmationDialog(setMsg, function(result) {
										if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
											if (isPrimary) {
												var updateCareerConfig = {
													contactId: primaryContact.value,
													isPrimary: false,
													dueDate: new Date()
												};
												this.updateContactCareer(function() {
													this.addContactCareer(callback, careerConfig);
												}, updateCareerConfig);
											} else {
												this.addContactCareer(callback, careerConfig);
											}
										} else {
											careerConfig.isPrimary = false;
											this.addContactCareer(callback, careerConfig);
										}
									}, ["yes", "no"]);
								} else {
									this.updateContactAccount(function() {
										this.addContactCareer(callback, careerConfig);
									}, primaryContact.value);
								}
							}
						}, this);
					},

					/**
					 * Добавляет запись в карьеру контакта
					 * @protected
					 * @param {Function} callback Callback функция
					 * @param {Object} data Параметры новой записи в каръере контакта
					 */
					addContactCareer: function(callback, data) {
						var recordId = this.get("Id");
						var insert = this.Ext.create("Terrasoft.InsertQuery", {
							rootSchemaName: "ContactCareer"
						});
						insert.setParameterValue("Contact", data.contactId, Terrasoft.DataValueType.GUID);
						insert.setParameterValue("Account", recordId, Terrasoft.DataValueType.GUID);
						insert.setParameterValue("Primary", data.isPrimary, Terrasoft.DataValueType.BOOLEAN);
						insert.setParameterValue("Current", data.isCurrent, Terrasoft.DataValueType.BOOLEAN);
						insert.execute(function(result) {
							if (result.success) {
								callback.call(this, result);
							}
						}, this);
					},

					/**
					 * Устанавливает значения для записей каръеры контакта.
					 * @protected
					 * @param {Function} callback Callback функция.
					 * @param {Object} data Параметры для обновления.
					 */
					updateContactCareer: function(callback, data) {
						var update = Ext.create("Terrasoft.UpdateQuery", {
							rootSchemaName: "ContactCareer"
						});
						var filters = update.filters;
						var contactIdFilter = update.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"Contact", data.contactId);
						var isCurrentFilter = update.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"Current", true);
						var isPrimaryFilter = update.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"Primary", true);
						filters.add("contactIdFilter", contactIdFilter);
						filters.add("isCurrentFilter", isCurrentFilter);
						filters.add("isPrimaryFilter", isPrimaryFilter);
						if (data.hasOwnProperty("isPrimary")) {
							update.setParameterValue("Primary", data.isPrimary, Terrasoft.DataValueType.BOOLEAN);
						}
						if (data.hasOwnProperty("isCurrent")) {
							update.setParameterValue("Current", data.isPrimary, Terrasoft.DataValueType.BOOLEAN);
						}
						if (data.hasOwnProperty("dueDate")) {
							update.setParameterValue("DueDate", data.dueDate, Terrasoft.DataValueType.DATE);
						}
						update.execute(function(result) {
							callback.call(this, result);
						}, this);
					},

					/**
					 * Обновляет идентификатор контарагента для контакта
					 * @protected
					 * @param {Function} callback Callback функция
					 * @param {Guid} contactId Идентификатор контакта для обновления
					 */
					updateContactAccount: function(callback, contactId) {
						var recordId = this.get("Id");
						var update = Ext.create("Terrasoft.UpdateQuery", {
							rootSchemaName: "Contact"
						});
						var filters = update.filters;
						var contactIdFilter = update.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"Id", contactId);
						filters.add("contactIdFilter", contactIdFilter);
						update.setParameterValue("Account", recordId, Terrasoft.DataValueType.GUID);
						update.execute(function(result) {
							callback.call(this, result);
						}, this);
					},

					/**
					 * Добавляет основного контакта для контрагента
					 * @protected
					 */
					addPrimaryContact: function() {
						var recordId = this.get("Id");
						this.set("PrimaryContactAdded", true);
						var config = Terrasoft.configuration.ModuleStructure.Contact;
						this.openCardInChain({
							schemaName: config.cardSchema,
							operation: "add",
							primaryColumnValue: null,
							moduleId: this.sandbox.id + "_AddPrimaryContact",
							defaultValues: [{
								name: ["Account", "PrimaryContactAdd"],
								value: [recordId, true]
							}]
						});
					},

					/**
					 * Возвращает массив средств связи контрагента.
					 * @overridden
					 * @return {Array} Массив средств связи.
					 */
					getCommunications: function() {
						var accountCommunicationDetailId = this.getDetailId("Communications");
						var communications = this.sandbox.publish("GetCommunicationsList", null,
								[accountCommunicationDetailId]);
						var result = [];
						this.Terrasoft.each(communications, function(item) {
							result.push({
								"Id": item.Id,
								"Number": item.Number
							});
						}, this);
						return result;
					},

					/**
					 * Возвращает значения по умолчанию, передаваемые в новую запись справочной колонки.
					 * @overridden
					 * @param {String} columnName Имя колонки.
					 * @return {Array} Массив значений по умолчанию.
					 */
					getLookupValuePairs: function(columnName) {
						var valuePairs = [];
						var column = this.getColumnByName(columnName);
						if (!this.Ext.isEmpty(column) && !this.Ext.isEmpty(column.referenceSchemaName) &&
							column.referenceSchemaName === "Contact") {
							var accountId = this.get("Id");
							if (this.isEditMode()) {
								valuePairs.push({
									name: "Account",
									value: accountId
								});
							}
						}
						return valuePairs;
					},

					/**
					 * @inheritdoc Terrasoft.BasePageV2#subscribeDetailEvents
					 */
					subscribeDetailEvents: function(detailConfig, detailName) {
						this.callParent(arguments);
						var detailId = this.getDetailId(detailName);
						this.sandbox.subscribe("GetLookupValuePairs", this.getLookupValuePairs, this, [detailId]);
					}
				},
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "insert",
						"name": "AccountPageGeneralTabContainer",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.GeneralInfoTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "ContactsAndStructureTabContainer",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.ContactsAndStructureTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "RelationshipTabContainer",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.RelationshipTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "HistoryTabContainer",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.HistoryTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "NotesTabContainer",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.NotesTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "CommonControlGroup",
						"parentName": "AccountPageGeneralTabContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "AccountPageGeneralInfoBlock",
						"parentName": "CommonControlGroup",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "Name",
						"parentName": "Header",
						"propertyName": "items",
						"values": {
							"bindTo": "Name",
							"layout": {
								"column": 0,
								"row": 0,
								"colSpan": 12
							}
						}
					},
					{
						"operation": "insert",
						"name": "Type",
						"parentName": "Header",
						"propertyName": "items",
						"values": {
							"bindTo": "Type",
							"layout": {
								"column": 12,
								"row": 0,
								"colSpan": 11
							},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"name": "Owner",
						"parentName": "Header",
						"propertyName": "items",
						"values": {
							"bindTo": "Owner",
							"layout": {
								"column": 0,
								"row": 1,
								"colSpan": 12
							}
						}
					},
					{
						"operation": "insert",
						"name": "AlternativeName",
						"parentName": "AccountPageGeneralInfoBlock",
						"propertyName": "items",
						"values": {
							"bindTo": "AlternativeName",
							"layout": {
								"column": 0,
								"row": 0,
								"colSpan": 12
							}
						}
					},
					{
						"operation": "insert",
						"name": "Code",
						"parentName": "AccountPageGeneralInfoBlock",
						"propertyName": "items",
						"values": {
							"bindTo": "Code",
							"layout": {
								"column": 12,
								"row": 0,
								"colSpan": 12
							}
						}
					},
					{
						"operation": "insert",
						"name": "PrimaryContact",
						"parentName": "AccountPageGeneralInfoBlock",
						"propertyName": "items",
						"values": {
							"bindTo": "PrimaryContact",
							"layout": {
								"column": 0,
								"row": 1,
								"colSpan": 12
							}
						}
					},
					{
						"operation": "insert",
						"name": "CategoriesControlGroup",
						"parentName": "AccountPageGeneralTabContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"caption": {"bindTo": "Resources.Strings.CategoriesGroupCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "AccountPageGeneralTabContainer",
						"propertyName": "items",
						"name": "Communications",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "AccountPageGeneralTabContainer",
						"propertyName": "items",
						"name": "AccountAddress",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "RelationshipTabContainer",
						"propertyName": "items",
						"name": "Relationships",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"name": "CategoriesControlGroupContainer",
						"parentName": "CategoriesControlGroup",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "AccountCategory",
						"parentName": "CategoriesControlGroupContainer",
						"propertyName": "items",
						"values": {
							"bindTo": "AccountCategory",
							"layout": {
								"column": 0,
								"row": 0,
								"colSpan": 12
							},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"name": "EmployeesNumber",
						"parentName": "CategoriesControlGroupContainer",
						"propertyName": "items",
						"values": {
							"bindTo": "EmployeesNumber",
							"layout": {
								"column": 12,
								"row": 0,
								"colSpan": 12
							},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"name": "Ownership",
						"parentName": "CategoriesControlGroupContainer",
						"propertyName": "items",
						"values": {
							"bindTo": "Ownership",
							"layout": {
								"column": 0,
								"row": 1,
								"colSpan": 12
							},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"name": "AnnualRevenue",
						"parentName": "CategoriesControlGroupContainer",
						"propertyName": "items",
						"values": {
							"bindTo": "AnnualRevenue",
							"layout": {
								"column": 12,
								"row": 1,
								"colSpan": 12
							},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"name": "Industry",
						"parentName": "CategoriesControlGroupContainer",
						"propertyName": "items",
						"values": {
							"bindTo": "Industry",
							"layout": {
								"column": 0,
								"row": 2,
								"colSpan": 12
							}
						}
					},
					{
						"operation": "insert",
						"parentName": "HistoryTabContainer",
						"propertyName": "items",
						"name": "Activities",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "HistoryTabContainer",
						"propertyName": "items",
						"name": "EmailDetailV2",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "AccountPageGeneralTabContainer",
						"propertyName": "items",
						"name": "AccountBillingInfo",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "AccountPageGeneralTabContainer",
						"propertyName": "items",
						"name": "AccountAnniversary",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "ContactsAndStructureTabContainer",
						"propertyName": "items",
						"name": "AccountOrganizationChart",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "ContactsAndStructureTabContainer",
						"propertyName": "items",
						"name": "AccountContacts",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "NotesTabContainer",
						"propertyName": "items",
						"name": "Files",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"name": "NotesControlGroup",
						"parentName": "NotesTabContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"caption": {"bindTo": "Resources.Strings.NotesGroupCaption"}
						}
					},
					{
						"operation": "insert",
						"parentName": "NotesControlGroup",
						"propertyName": "items",
						"name": "Notes",
						"values": {
							"contentType": Terrasoft.ContentType.RICH_TEXT,
							"layout": {"column": 0, "row": 0, "colSpan": 24},
							"labelConfig": {
								"visible": false
							},
							"controlConfig": {
								"imageLoaded": {
									"bindTo": "insertImagesToNotes"
								},
								"images": {
									"bindTo": "NotesImagesCollection"
								}
							}
						}
					}
				]/**SCHEMA_DIFF*/
			};
		});
