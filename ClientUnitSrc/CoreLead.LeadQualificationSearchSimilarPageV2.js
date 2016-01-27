define("LeadQualificationSearchSimilarPageV2", ["BusinessRuleModule", "terrasoft",
		"LeadQualificationSearchSimilarPageV2Resources", "LookupUtilities", "ConfigurationConstants",
		"ConfigurationEnums", "CustomProcessPageV2Utilities", "css!InfoButtonStyles",
		"css!LeadQualificationModuleStyles"],
	function(BusinessRuleModule, Terrasoft, resources, LookupUtilities, ConfigurationConstants, enums) {
		/** @enum
		 * Связь с контрагентом. */
		Terrasoft.AccountRelationship = {
			/** Создать новый. */
			NEW: "NEW",
			/** Связать с выбранным. */
			EXIST: "EXIST",
			/** Не связывать. */
			BREAK: "BREAK"
		};
		return {
			entitySchemaName: "LeadQualification",
			messages: {
				/**
				 * @message DetailActiveRowChanged
				 * Уведомляет о изменении активной записи на детали.
				 * @param {Object} Конфигурация открываемой карточки.
				 */
				"DetailActiveRowChanged": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message SetAccountsSearchResultDetailEnabled
				 * Уведомляет о необходимости изменить признак enabled детали.
				 * @param {Object} Объект, содержащий устанавливаемое значение.
				 */
				"SetAccountsSearchResultDetailEnabled": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message SetSearchButtonEnabled
				 * Уведомляет о необходимости изменить признак enabled кнопки поиска.
				 * @param {Object} Объект, содержащий устанавливаемое значение.
				 */
				"SetSearchButtonEnabled": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message GetSearchButtonEnabled
				 * Получает признак о необходимости изменить свойство enabled кнопки поиска.
				 * @param {Object} Объект, содержащий текущее значение связи с контрагентом.
				 */
				"GetSearchButtonEnabled": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			mixins: {
				BaseProcessViewModel: "Terrasoft.CustomProcessPageV2Utilities"
			},
			attributes: {
				"LeadContact": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					caption: {bindTo: "Resources.Strings.LeadContactCaption"},
					referenceSchemaName: "Contact",
					lookupListConfig: {
						columns: ["Account"]
					},
					dependencies: [
						{
							columns: ["LeadContact"],
							methodName: "onLeadContactChanged"
						}
					]
				},
				"LeadAccount": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					caption: {bindTo: "Resources.Strings.LeadAccountCaption"},
					referenceSchemaName: "Account",
					dependencies: [
						{
							columns: ["LeadAccount"],
							methodName: "onLeadAccountChanged"
						}
					]
				},
				"IsContactSearchByName": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},
				"ContactSearchValueName": {
					caption: {bindTo: "Resources.Strings.SearchContactNameCaption"},
					dataValueType: Terrasoft.DataValueType.TEXT
				},
				"IsContactSearchByEmail": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},
				"ContactSearchValueEmail": {
					caption: {bindTo: "Resources.Strings.SearchEmailCaption"},
					dataValueType: Terrasoft.DataValueType.TEXT
				},
				"IsContactSearchByPhone": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},
				"ContactSearchValuePhone": {
					caption: {bindTo: "Resources.Strings.SearchPhoneCaption"},
					dataValueType: Terrasoft.DataValueType.TEXT
				},
				"IsContactSearchByWeb": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},
				"ContactSearchValueWeb": {
					caption: {bindTo: "Resources.Strings.SearchWebCaption"},
					dataValueType: Terrasoft.DataValueType.TEXT
				},
				"IsAccountSearchByName": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},
				"AccountSearchValueName": {
					caption: {bindTo: "Resources.Strings.SearchAccountNameCaption"},
					dataValueType: Terrasoft.DataValueType.TEXT
				},
				"IsAccountSearchByEmail": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},
				"AccountSearchValueEmail": {
					caption: {bindTo: "Resources.Strings.SearchEmailCaption"},
					dataValueType: Terrasoft.DataValueType.TEXT
				},
				"IsAccountSearchByPhone": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},
				"AccountSearchValuePhone": {
					caption: {bindTo: "Resources.Strings.SearchPhoneCaption"},
					dataValueType: Terrasoft.DataValueType.TEXT
				},
				"IsAccountSearchByWeb": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},
				"AccountSearchValueWeb": {
					caption: {bindTo: "Resources.Strings.SearchWebCaption"},
					dataValueType: Terrasoft.DataValueType.TEXT
				},
				"AccountRelationship": {
					dataValueType: Terrasoft.DataValueType.TEXT
				},
				"IsAccountNew": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},
				"IsAccountSearchEnabled": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},
				"IsAccountDataFieldsEnabled": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: true
				},
				"IsLeadAccountNameRequired": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: true
				},
				"IsLeadAccountRequired": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: true
				},
				"IsInitializedValues": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: false
				}
			},
			details: /**SCHEMA_DETAILS*/{
				SimilarContacts: {
					schemaName: "ContactsSearchResultDetailV2",
					filterMethod: "similarContactsDetailFilter"
				},
				SimilarAccounts: {
					schemaName: "AccountsSearchResultDetailV2",
					filterMethod: "similarAccountsDetailFilter"
				},
				Leads: {
					schemaName: "LeadDetailV2",
					filter: {
						masterColumn: "LeadContact",
						detailColumn: "QualifiedContact"
					},
					filterMethod: "getLeadFilters",
					captionName: "ContactLeadDetailCaption"
				}
			}/**SCHEMA_DETAILS*/,
			methods: {

				/**
				 * Выполняет проверку обязательности заполнения средств связи контакта.
				 * @protected
				 * @param {String} columnName Имя колонки.
				 * @return {Boolean} Признак обязательности заполнения полей.
				 */
				setIsContactCommunicationRequired: function(columnName) {
					var isRequired = Ext.isEmpty(this.get("ContactEmail")) &&
						Ext.isEmpty(this.get("ContactMobilePhone")) && Ext.isEmpty(this.get("ContactBusinessPhone"));
					var column = this.columns[columnName];
					if (column) {
						column.isRequired = isRequired;
						this.validateColumn(columnName);
					}
					return isRequired;
				},

				/**
				 * Метод фильтрации детали похожих контактов.
				 * @protected
				 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
				 */
				similarContactsDetailFilter: function() {
					if (!this.get("IsInitializedValues")) {
						return null;
					}
					var config = {};
					config.existsFilterPath = "[ContactCommunication:Contact:Id].Id";
					if (this.get("IsContactSearchByName")) {
						config.name = this.get("ContactSearchValueName");
					}
					if (this.get("IsContactSearchByEmail")) {
						config.email = this.get("ContactSearchValueEmail");
					}
					if (this.get("IsContactSearchByPhone")) {
						config.phone = this.get("ContactSearchValuePhone");
					}
					if (this.get("IsContactSearchByWeb")) {
						config.web = this.get("ContactSearchValueWeb");
					}
					return this.getSimilarRecordsDetailFilter(config);
				},

				/**
				 * Метод фильтрации детали похожих контактов.
				 * @protected
				 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
				 */
				similarAccountsDetailFilter: function() {
					if (!this.get("IsInitializedValues")) {
						return null;
					}
					var config = {};
					config.existsFilterPath = "[AccountCommunication:Account:Id].Id";
					if (this.get("IsAccountSearchByName")) {
						config.name = this.get("AccountSearchValueName");
					}
					if (this.get("IsAccountSearchByEmail")) {
						config.email = this.get("AccountSearchValueEmail");
					}
					if (this.get("IsAccountSearchByPhone")) {
						config.phone = this.get("AccountSearchValuePhone");
					}
					if (this.get("IsAccountSearchByWeb")) {
						config.web = this.get("AccountSearchValueWeb");
					}
					return this.getSimilarRecordsDetailFilter(config);
				},

				/**
				 * Метод фильтрации детали похожих записей по Средствам связи.
				 * @protected
				 * @param {Object} config Объект с параметрами поиска.
				 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
				 */
				getSimilarRecordsDetailFilter: function(config) {
					var filterGroup = Terrasoft.createFilterGroup();
					var fiterConfig = null;
					if (config.name) {
						fiterConfig = this.getFilterComparisonType(config.name);
						var nameFilter = Terrasoft.createColumnFilterWithParameter(
							fiterConfig.comparisonType, "Name", fiterConfig.searchValue);
						filterGroup.addItem(nameFilter);
					}
					if (config.phone) {
						fiterConfig = this.getFilterComparisonType(this.formatPhoneNumber(config.phone));
						if (fiterConfig.searchValue) {
							var existsSubPhoneFilters = Terrasoft.createFilterGroup();
							existsSubPhoneFilters.addItem(Terrasoft.createColumnFilterWithParameter(
								fiterConfig.comparisonType, "SearchNumber", fiterConfig.searchValue));
							var existsPhoneFilters = Terrasoft.createExistsFilter(config.existsFilterPath,
								existsSubPhoneFilters);
							filterGroup.addItem(existsPhoneFilters);
						}
					}
					if (config.email) {
						fiterConfig = this.getFilterComparisonType(config.email);
						var existsSubEmailFilters = Terrasoft.createFilterGroup();
						existsSubEmailFilters.addItem(Terrasoft.createColumnFilterWithParameter(
							fiterConfig.comparisonType, "Number", fiterConfig.searchValue));
						existsSubEmailFilters.addItem(Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "CommunicationType",
							ConfigurationConstants.CommunicationType.Email));
						var existsEmailFilters = Terrasoft.createExistsFilter(config.existsFilterPath,
							existsSubEmailFilters);
						filterGroup.addItem(existsEmailFilters);
					}
					if (config.web) {
						fiterConfig = this.getFilterComparisonType(config.web);
						var existsSubWebFilters = Terrasoft.createFilterGroup();
						existsSubWebFilters.addItem(Terrasoft.createColumnFilterWithParameter(
							fiterConfig.comparisonType, "Number", fiterConfig.searchValue));
						existsSubWebFilters.addItem(Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "CommunicationType",
							ConfigurationConstants.CommunicationTypes.Web));
						var existsWebFilters = Terrasoft.createExistsFilter(config.existsFilterPath,
							existsSubWebFilters);
						filterGroup.addItem(existsWebFilters);
					}
					return filterGroup;
				},

				/**
				 * Подбирает тип фильтра сравнения для искомой строки.
				 * @protected
				 * @param {String} searchValue Строка для поиска.
				 * @return {Object} Возвращает тип фильтра и значение для поиска.
				 */
				getFilterComparisonType: function(searchValue) {
					var config = {};
					var startsWithAny = searchValue.charAt(0) === "%";
					if (searchValue.length === 1 && startsWithAny) {
						config.comparisonType = this.Terrasoft.ComparisonType.CONTAIN;
						config.searchValue = "";
						return config;
					}
					if (!startsWithAny) {
						config.comparisonType = this.Terrasoft.ComparisonType.START_WITH;
						config.searchValue = searchValue;
					} else {
						config.comparisonType = this.Terrasoft.ComparisonType.CONTAIN;
						searchValue = searchValue.substring(1, searchValue.length);
						config.searchValue = searchValue;
					}
					return config;
				},

				/**
				 * Удаляет не цифровые символы и меняет порядок символов на обратный.
				 * @protected
				 * @param {String} value Строка для форматирования.
				 * @return {String} Отформатированная строка.
				 */
				formatPhoneNumber: function(value) {
					value = value || "";
					var clearedNumber = value.replace(/\D/g, "");
					var arrayNumber = clearedNumber.split("");
					var reversedNumber = arrayNumber.reverse();
					return reversedNumber.join("");
				},

				/**
				 * Метод фильтрации детали лидов по Контакту.
				 * @private
				 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
				 */
				getLeadFilters: function() {
					var contact = this.get("LeadContact");
					var contactId = this.Terrasoft.GUID_EMPTY;
					if (contact && contact.value) {
						contactId = contact.value;
					}
					var leadId = this.get("LeadId");
					var filters = this.Terrasoft.createFilterGroup();
					filters.logicalOperation = this.Terrasoft.LogicalOperatorType.AND;
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "QualifiedContact", contactId));
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.NOT_EQUAL, "Id", leadId));
					return filters;
				},

				/**
				 * @inheritDoc Terrasoft.Configuration.BasePageV2#subscribeSandboxEvents
				 * @overridden
				 */
				subscribeSandboxEvents: function() {
					this.callParent(arguments);
					var subscribersIds = this.getSaveRecordMessagePublishers();
					this.sandbox.subscribe("GetCardState", function() {
						return {state: enums.CardStateV2.edit};
					}, this, subscribersIds);
					this.sandbox.subscribe("GetSearchButtonEnabled", function() {
						return {value: this.get("AccountRelationship")};
					}, this, subscribersIds);
				},

				/**
				 * @overridden
				 * @return {string}
				 */
				getHeader: function() {
					return this.get("Resources.Strings.QualificationPageCaption");
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
				 * @param {Object} args Параметры
				 * @param {Object} tag Тег
				 */
				loadVocabulary: function(args, tag) {
					args.schemaName = this.columns[tag].referenceSchemaName;
					this.callParent(arguments);
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
				 * Инициализирует начальные значения модели.
				 * @protected
				 * @virtual
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.setInitialValues();
						this.initDisqualifyReasonsMenu();
						var subscribersIds = this.getSaveRecordMessagePublishers();
						this.sandbox.subscribe("DetailActiveRowChanged", function(config) {
							return this.onDetailActiveRowChanged(config);
						}, this, subscribersIds);
						this.on("change:LeadContact", function() {
							this.updateDetail({detail: "Leads"});
						}, this);
						this.on("change:IsContactSearchByName change:IsContactSearchByEmail " +
						"change:IsContactSearchByPhone change:IsContactSearchByWeb", function() {
							this.onContactSearchOptionsChanged();
						}, this);
						this.on("change:IsAccountSearchByName change:IsAccountSearchByEmail " +
						"change:IsAccountSearchByPhone change:IsAccountSearchByWeb", function() {
							this.onAccountSearchOptionsChanged();
						}, this);
						callback.call(scope || this);
					}, this]);
				},

				/**
				 * Обработчик сообщения обновления активной записи на детали
				 * @protected
				 * @param {Object} config Параметры сообщения
				 */
				onDetailActiveRowChanged: function(config) {
					var schemaName = config.entitySchemaName;
					var activeRow = config.activeRow;
					var activeRowValue = {
						value: activeRow.get(activeRow.primaryColumnName),
						displayValue: activeRow.get(activeRow.primaryDisplayColumnName)
					};
					var leadId = this.get("LeadId");
					var contactId = null;
					var accountId = null;
					this.set("IsEntityInitialized", false);
					if (schemaName === "Contact") {
						this.set("LeadContact", activeRowValue);
						contactId = activeRowValue.value;
						var account = activeRow.get("Account") || null;
						this.set("LeadAccount", account);
						var accountRelationship = this.get("AccountRelationship");
						if (!this.Ext.isEmpty(account) &&
							(accountRelationship === Terrasoft.AccountRelationship.EXIST)) {

							accountId = account.value;
						}
					} else if (schemaName === "Account") {
						this.set("LeadAccount", activeRowValue);
						accountId = activeRowValue.value;
					}
					this.set("IsEntityInitialized", true);
					this.loadInitialData(leadId, contactId, accountId);
				},

				/**
				 * Обработчик изменения поля "контагент"
				 * @protected
				 */
				onLeadContactChanged: function() {
					var leadId = this.get("LeadId");
					var accountId = null;
					var contactId = null;
					var contact = this.get("LeadContact");
					if (!Ext.isEmpty(contact)) {
						contactId = contact.value;
						var account = contact.Account;
						this.set("LeadAccount", account);
						var accountRelationship = this.get("AccountRelationship");
						if (!this.Ext.isEmpty(account) &&
								(accountRelationship === Terrasoft.AccountRelationship.EXIST)) {

							accountId = account.value;
						}
					}

					this.set("IsEntityInitialized", true);
					this.loadInitialData(leadId, contactId, accountId);
				},

				/**
				 * Обработчик изменения поля "контакт"
				 * @protected
				 */
				onLeadAccountChanged: function() {
					var leadId = this.get("LeadId");
					var accountId = null;
					var contactId = null;
					var contact = this.get("LeadContact");
					if (!Ext.isEmpty(contact)) {
						contactId = contact.value;
					}
					var account = this.get("LeadAccount");
					var accountRelationship = this.get("AccountRelationship");
					if (!this.Ext.isEmpty(account) &&
							(accountRelationship === Terrasoft.AccountRelationship.EXIST)) {
						accountId = account.value;
					}
					this.set("IsEntityInitialized", true);
					this.loadInitialData(leadId, contactId, accountId);
				},
				/**
				 * Устанавливает значения атрибутов по параметрам процесса.
				 * @protected
				 * @virtual
				 */
				setInitialValues: function() {
					var parameters = this.get("ProcessData").parameters;
					this.processParameters.push({key: "Result", value: ""});
					this.loadInitialData(parameters.LeadId, null, null, function(entity) {
						var businessPhone = entity.get("BusinesPhone");
						var mobilePhone = entity.get("MobilePhone");
						var email = entity.get("Email");
						var webSite = entity.get("Website");
						var qualifiedContact = entity.get("QualifiedContact");
						var qualifiedAccount = entity.get("QualifiedAccount");
						this.set("ContactSearchValueEmail", email);
						this.set("AccountSearchValueEmail", email);
						this.set("LeadType", entity.get("LeadType"));
						this.set("LeadTypeRipeness", entity.get("LeadTypeStatus"));
						this.set("ContactSearchValuePhone", mobilePhone || businessPhone);
						this.set("AccountSearchValuePhone", businessPhone || mobilePhone);
						this.set("IsContactSearchByEmail", true);
						this.set("AccountSearchValueWeb", webSite);
						this.set("ContactSearchValueWeb", webSite);
						this.set("LeadSource", entity.get("LeadSource"));
						this.set("CreatedOn", entity.get("CreatedOn"));
						if (!this.Ext.isEmpty(qualifiedContact)) {
							this.set("LeadContact", qualifiedContact);
						}
						if (!this.Ext.isEmpty(qualifiedAccount)) {
							this.set("LeadAccount", qualifiedAccount);
						} else {
							this.set("AccountRelationship", Terrasoft.AccountRelationship.EXIST);
							this.set("IsAccountSearchByWeb", true);
							this.set("IsAccountSearchEnabled", true);
						}
						var addressType = entity.get("AddressType");
						var city = entity.get("City");
						var region = entity.get("Region");
						var country = entity.get("Country");
						var zip = entity.get("Zip");
						var address = entity.get("Address");
						var forContact = true;
						var forAccount = false;
						if (addressType) {
							forContact = entity.get("AddressType.ForContact");
							forAccount = entity.get("AddressType.ForAccount");
						}
						if (forContact) {
							this.set("LeadContactAddressType", addressType);
							this.set("LeadContactCountry", country);
							this.set("LeadContactRegion", region);
							this.set("LeadContactCity", city);
							this.set("LeadContactZip", zip);
							this.set("LeadContactAddress", address);
						}
						if (forAccount) {
							this.set("LeadAccountAddressType", addressType);
							this.set("LeadAccountCountry", country);
							this.set("LeadAccountRegion", region);
							this.set("LeadAccountCity", city);
							this.set("LeadAccountZip", zip);
							this.set("LeadAccountAddress", address);
						}
						this.set("AccountSearchValueName", entity.get("Account"));
						this.set("ContactSearchValueName", entity.get("Contact"));
						this.set("IsInitializedValues", true);
						this.updateDetail({detail: "SimilarContacts"});
						this.updateDetail({detail: "SimilarAccounts"});
					});
				},

				/**
				 * Выполняет инициализацию полей карточки значениями объектов загруженных
				 * по переданым идентификаторам.
				 * @param {String} leadId Уникальный идентификатор объекта "Лид".
				 * @param {String} contactId Уникальный идентификатор объекта "Контакт".
				 * @param {String} accountId Уникальный идентификатор объекта "Контрагент".
				 * @param {Function} callback Функция обратного вызова.
				 */
				loadInitialData: function(leadId, contactId, accountId, callback) {
					this.readLead(leadId, function(entity) {
						var lead = entity;
						contactId = contactId || lead.get("QualifiedContact").value;
						if (contactId) {
							this.readContact(contactId, function(entity) {
								this.syncContact(lead, entity);
							});
						} else {
							this.syncContact(lead);
						}
						accountId = accountId || lead.get("QualifiedAccount").value;
						if (accountId) {
							this.readAccount(accountId, function(entity) {
								this.syncAccount(lead, entity);
							});
						} else {
							this.syncAccount(lead);
						}
						if (callback) {
							callback.call(this, lead);
						}
					});
				},

				/**
				 * Выполняет синхронизацию свойств страницы между значениями полей объектов "Лид" и "Контакт".
				 * @param {Object} lead Объект синхронизации "Лид".
				 * @param {Object} contact Объект синхронизации "Контакт".
				 */
				syncContact: function(lead, contact) {
					this.syncColumn("Gender", lead, contact, "Gender", "Gender");
					this.syncColumn("Dear", lead, contact, "Dear", "Dear");
					this.syncColumn("FullJobTitle", lead, contact, "FullJobTitle", "JobTitle");
					this.syncColumn("LeadContactName", lead, contact, "Contact", "Name");
					this.syncColumn("Salutation", lead, contact, "Title", "SalutationType");
					this.syncColumn("Job", lead, contact, "Job", "Job");
					this.syncColumn("Department", lead, contact, "Department", "Department");
					this.syncColumn("DecisionRole", lead, contact, "DecisionRole", "DecisionRole");
					this.syncColumn("ContactBusinessPhone", lead, contact, "BusinesPhone", "Phone");
					this.syncColumn("ContactMobilePhone", lead, contact, "MobilePhone", "MobilePhone");
					this.syncColumn("ContactEmail", lead, contact, "Email", "Email");
				},

				/**
				 * Выполняет синхронизацию свойств страницы между значениями полей объектов "Лид" и "Контрагент".
				 * @param {Object} lead Объект синхронизации "Лид".
				 * @param {Object} account Объект синхронизации "Контрагент".
				 */
				syncAccount: function(lead, account) {
					this.syncColumn("LeadAccountName", lead, account, "Account", "Name");
					this.syncColumn("Ownership", lead, account, "AccountOwnership", "Ownership");
					this.syncColumn("Industry", lead, account, "Industry", "Industry");
					this.syncColumn("AccountCategory", lead, account, "AccountCategory", "AccountCategory");
					this.syncColumn("EmployeesNumber", lead, account, "EmployeesNumber", "EmployeesNumber");
					this.syncColumn("AnnualRevenue", lead, account, "AnnualRevenue", "AnnualRevenue");
					this.syncColumn("AccountBusinessPhone", lead, account, "BusinesPhone", "Phone");
					this.syncColumn("AccountFax", lead, account, "Fax", "Fax");
					this.syncColumn("AccountWebsite", lead, account, "Website", "Web");
				},

				/**
				 * Выполняет синхронизацию свойства страницы со значением основного объекта, если у основного
				 * объекта значение не указано, выполняется синхронизация с дополнительным объектом.
				 * @param {String} pageAttributeName Имя свойства страницы.
				 * @param {Object} primaryEntity Основной объект синхронизации.
				 * @param {Object} secondaryEntity Дополнительный объект синхронизации.
				 * @param {String} primaryEntityColumnName Имя колонки основного объекта.
				 * @param {String} secondaryEntityColumnName Имя колонки дополнительного объекта.
				 */
				syncColumn: function(pageAttributeName, primaryEntity, secondaryEntity,
										primaryEntityColumnName, secondaryEntityColumnName) {
					var value = primaryEntity && primaryEntity.get(primaryEntityColumnName);
					if (!value) {
						value = secondaryEntity && secondaryEntity.get(secondaryEntityColumnName);
					}
					this.set(pageAttributeName, value);
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
				 * Выполняет чтение объекта "Лид".
				 * @param {String} leadId Уникальный идентификатор.
				 * @param {Function} callback Функция обратного вызова.
				 */
				readLead: function(leadId, callback) {
					this.readEntity("Lead", leadId, ["Account", "AccountOwnership", "Website", "AccountCategory",
						"Fax", "EmployeesNumber", "AnnualRevenue", "Gender", "Dear", "FullJobTitle", "Contact",
						"Title", "Zip", "Job", "Department", "DecisionRole", "LeadType", "LeadTypeStatus",
						"BusinesPhone", "Address", "MobilePhone", "Email", "AddressType", "Country", "Region",
						"City", "Industry", "CreatedOn", "LeadSource", "AddressType.ForContact",
						"AddressType.ForAccount", "QualifiedContact", "QualifiedAccount"], callback);
				},

				/**
				 * Выполняет чтение объекта "Контакт".
				 * @param {String} contactId Уникальный идентификатор.
				 * @param {Function} callback Функция обратного вызова.
				 */
				readContact: function(contactId, callback) {
					this.readEntity("Contact", contactId,
						["Name", "Dear", "JobTitle", "Gender", "SalutationType", "Job", "Department",
							"DecisionRole", "Phone", "MobilePhone", "Email"], callback);
				},

				/**
				 * Выполняет чтение объекта "Контрагент".
				 * @param {String} accountId Уникальный идентификатор.
				 * @param {Function} callback Функция обратного вызова.
				 */
				readAccount: function(accountId, callback) {
					this.readEntity("Account", accountId, ["Name", "Ownership", "Industry", "AccountCategory",
						"EmployeesNumber", "AnnualRevenue", "Phone", "Fax", "Web"], callback);
				},

				/**
				 * Инициализирует меню дисквалификации.
				 * @protected
				 */
				initDisqualifyReasonsMenu: function() {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "LeadDisqualifyReason"
					});
					var disqualifyReasonsMenu = Ext.create("Terrasoft.BaseViewModelCollection");
					var nameColumn = esq.addColumn("Name");
					nameColumn.orderDirection = Terrasoft.OrderDirection.ASC;
					nameColumn.orderPosition = 1;
					esq.getEntityCollection(function(response) {
						var collection = response.collection;
						collection.each(function(item) {
							var itemId = item.get("Id");
							disqualifyReasonsMenu.add(itemId, Ext.create("Terrasoft.BaseViewModel", {
								values: {
									Id: itemId,
									Caption: item.get("Name"),
									Tag: itemId,
									Click: {bindTo: "disqualifyLead"}
								}
							}));
						}, this);
					}, this);
					this.set("DisqualifyReasonsMenu", disqualifyReasonsMenu);
				},

				/**
				 * Дисквалифицирует Лида.
				 * @protected
				 */
				disqualifyLead: function(tag) {
					if (this.Ext.isEmpty(tag)) {
						return;
					}
					this.processParameters.push({
						key: "Result",
						value: "Disqualify"
					}, {
						key: "DisqualifyReasonId",
						value: tag
					});
					this.completeProcess(false);
				},

				/**
				 * Квалифицирует Лида.
				 * @protected
				 */
				qualifyLead: function() {
					this.processParameters.push({
						key: "Result",
						value: "Qualify"
					});
					this.completeProcess(true);
				},

				/**
				 * Сохраняет состояние квалификации Лида.
				 * @protected
				 */
				saveLead: function() {
					this.processParameters.push({
						key: "Result",
						value: "Save"
					});
					this.completeProcess(true);
				},

				/**
				 * Инициирует завершение работы карточки и передачу параметров в процесс.
				 * @param {Boolean} validate Призак, следует ли выполнять валидацию.
				 */
				completeProcess: function(validate) {
					var leadContact = this.get("LeadContact");
					var leadAccount = this.get("LeadAccount");
					if (validate) {
						var resultObject = {
							success: this.validate()
						};
						if (!resultObject.success) {
							resultObject.message = this.getValidationMessage();
							this.validateResponse(resultObject);
							return;
						}
						var isAccountRequired = this.get("IsLeadAccountRequired");
						if (isAccountRequired && Ext.isEmpty(leadAccount)) {
							this.showInformationDialog(this.get("Resources.Strings.AccountRequiredMessage"));
							return;
						}
						var isAccountNameRequired = this.get("IsLeadAccountNameRequired");
						var leadAccountName = this.get("LeadAccountName");
						if (isAccountNameRequired && Ext.isEmpty(leadAccountName)) {
							this.showInformationDialog(this.get("Resources.Strings.AccountNameRequiredMessage"));
							return;
						}
					}
					this.processParameters.push({
						key: "ContactId",
						value: leadContact ? leadContact.value : null
					}, {
						key: "AccountId",
						value: leadAccount ? leadAccount.value : null
					});
					this.pushProcessParameter("LeadType");
					this.pushProcessParameter("LeadTypeRipeness");
					this.pushProcessParameter("ContactBusinessPhone");
					this.pushProcessParameter("ContactMobilePhone");
					this.pushProcessParameter("ContactEmail");
					this.pushProcessParameter("AccountBusinessPhone");
					this.pushProcessParameter("AccountFax");
					this.pushProcessParameter("AccountWebsite");
					this.pushProcessParameter("LeadSource");
					this.pushProcessParameter("CreatedOn");
					this.pushProcessParameter("LeadContactAddressType");
					this.pushProcessParameter("LeadContactCity");
					this.pushProcessParameter("LeadContactRegion");
					this.pushProcessParameter("LeadContactCountry");
					this.pushProcessParameter("LeadContactZip");
					this.pushProcessParameter("LeadContactAddress");
					this.pushProcessParameter("LeadAccountAddressType");
					this.pushProcessParameter("LeadAccountCity");
					this.pushProcessParameter("LeadAccountRegion");
					this.pushProcessParameter("LeadAccountCountry");
					this.pushProcessParameter("LeadAccountZip");
					this.pushProcessParameter("LeadAccountAddress");
					this.pushProcessParameter("LeadAccountName");
					this.pushProcessParameter("Ownership");
					this.pushProcessParameter("Industry");
					this.pushProcessParameter("AccountCategory");
					this.pushProcessParameter("EmployeesNumber");
					this.pushProcessParameter("AnnualRevenue");
					this.pushProcessParameter("Gender");
					this.pushProcessParameter("Dear");
					this.pushProcessParameter("FullJobTitle");
					this.pushProcessParameter("LeadContactName");
					this.pushProcessParameter("Salutation");
					this.pushProcessParameter("Job");
					this.pushProcessParameter("Department");
					this.pushProcessParameter("DecisionRole");
					this.pushProcessParameter("IsAccountNew");
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
				},

				/**
				 * Обработчик группы переключателей связи контрагента.
				 * @protected
				 * @param {Boolean} checked Текущее значение радиокнопки.
				 * @param {String} value Текущее значение группы радиокнопок.
				 */
				onAccountRelationshipChanged: function(checked, value) {
					if (checked) {
						var detailId = this.getDetailId("SimilarAccounts");
						var config = {value: true};
						if (value === Terrasoft.AccountRelationship.EXIST) {
							this.onAccountSearchOptionsChanged();
						} else {
							config.value = false;
							this.sandbox.publish("SetSearchButtonEnabled", config, [detailId]);
						}
						this.sandbox.publish("SetAccountsSearchResultDetailEnabled", config, [detailId]);
						this.updateAccountAttributes(value);
					}
				},

				/**
				 * Обработчик группы переключателей условий поиска контакта.
				 * @protected
				 */
				onContactSearchOptionsChanged: function() {
					var detailId = this.getDetailId("SimilarContacts");
					var config = {};
					config.value = this.isSearchOptiinsEnabled("Contact");
					this.sandbox.publish("SetSearchButtonEnabled", config, [detailId]);
				},

				/**
				 * Обработчик группы переключателей условий поиска контрагента.
				 * @protected
				 */
				onAccountSearchOptionsChanged: function() {
					var detailId = this.getDetailId("SimilarAccounts");
					var config = {};
					config.value = this.isSearchOptiinsEnabled("Account");
					this.sandbox.publish("SetSearchButtonEnabled", config, [detailId]);
				},

				/**
				 * Выполняет проверку что вслючено одно из условий поиска.
				 * @protected
				 * @param {String} objectName Имя объекта, для которого выполняется проверка (Contact | Account).
				 * @return {Boolean} Возвращает признак, что влючено одно из условий поска.
				 */
				isSearchOptiinsEnabled: function(objectName) {
					return (this.get("Is" + objectName + "SearchByName") || false) ||
						(this.get("Is" + objectName + "SearchByEmail") || false) ||
						(this.get("Is" + objectName + "SearchByPhone") || false) ||
						(this.get("Is" + objectName + "SearchByWeb") || false);
				},

				/**
				 * Изменяет значения атрибутов в соответствии с бизнес логикой.
				 * @protected
				 * @param {String} value Текущее значение связи с Контрагентом (NEW | EXIST | BREAK).
				 */
				updateAccountAttributes: function(value) {
					var isNew = (value === Terrasoft.AccountRelationship.NEW);
					var isExist = (value === Terrasoft.AccountRelationship.EXIST);
					var isBreak = (value === Terrasoft.AccountRelationship.BREAK);
					this.set("IsAccountNew", isNew);
					this.set("IsAccountSearchEnabled", isExist);
					this.set("IsLeadAccountRequired", isExist);
					this.set("IsLeadAccountNameRequired", (isNew || isExist));
					this.set("IsAccountDataFieldsEnabled", (isNew || isExist));
					if (isNew) {
						this.set("LeadAccount", null);
						this.readLead(this.get("LeadId"), this.syncAccount);
					} else if (isBreak) {
						this.clearFields(["LeadAccount", "AccountBusinessPhone", "AccountFax", "AccountWebsite",
							"LeadAccountName", "AccountCategory", "Industry", "EmployeesNumber", "AnnualRevenue",
							"Ownership", "LeadAccountAddressType", "LeadAccountCity", "LeadAccountRegion",
							"LeadAccountCountry", "LeadAccountZip", "LeadAccountAddress"]);
					} else if (isExist) {
						this.updateDetail({detail: "SimilarAccounts"});
					}
				},

				/**
				 * Выполняет очистку текущих значение в полях редактирования.
				 * @protected
				 * @param {Array} fields Массив с именами полей.
				 */
				clearFields: function(fields) {
					Terrasoft.each(fields, function(item) {
						this.set(item, null);
					}, this);
				},

				/**
				 * Метод обработчик нажатия кнопки подсказки для группы "ContactAdress".
				 * @protected
				 */
				showContactAdressInfoToolTip: function() {
					this.showInformationDialog(this.get("Resources.Strings.ContactAdressInfoMessage"));
				},

				/**
				 * Метод обработчик нажатия кнопки подсказки для группы "ContactCommunications".
				 * @protected
				 */
				showContactCommunicationsInfoToolTip: function() {
					this.showInformationDialog(this.get("Resources.Strings.ContactCommunicationsInfoMessage"));
				},

				/**
				 * Метод обработчик нажатия кнопки подсказки для группы "AccountAdress".
				 * @protected
				 */
				showAccountAdressInfoToolTip: function() {
					this.showInformationDialog(this.get("Resources.Strings.AccountAdressInfoMessage"));
				},

				/**
				 * Метод обработчик нажатия кнопки подсказки для группы "AccountCommunications".
				 * @protected
				 */
				showAccountCommunicationsInfoToolTip: function() {
					this.showInformationDialog(this.get("Resources.Strings.AccountCommunicationsInfoMessage"));
				}

			},

			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "LeadContact",
					"values": {
						"layout": {"column": 0, "row": 0}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "LeadAccount",
					"values": {
						"layout": {"column": 12, "row": 0},
						"isRequired": {"bindTo": "IsLeadAccountRequired"},
						"controlConfig": {
							"enabled": {
								"bindTo": "AccountRelationship",
								"bindConfig": {
									converter: function(value) {
										return (value && value === Terrasoft.AccountRelationship.EXIST);
									}
								}
							}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "LeadType",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 0, "row": 1}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "LeadTypeRipeness",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 12, "row": 1}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "LeadSource",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 0, "row": 2},
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "CreatedOn",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 12, "row": 2},
						"controlConfig": {"enabled": false}
					}
				},
				{
					"operation": "insert",
					"name": "SearchSimilarTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.SearchSimilarTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ContactDataTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.ContactDataTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "AccountDataTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AccountDataTabCaption"},
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
					"name": "ContactDataContainer",
					"parentName": "ContactDataTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "AccountDataContainer",
					"parentName": "AccountDataTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ContactCommunicationsBlock",
					"parentName": "ContactDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.CommunicationsGroupCaption"},
						"items": [],
						"tools": []
					}
				},
				{
					"operation": "insert",
					"name": "ContactDataBlock",
					"parentName": "ContactDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.DataGroupCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ContactAdressBlock",
					"parentName": "ContactDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.AddressGroupCaption"},
						"items": [],
						"tools": []
					}
				},
				{
					"operation": "insert",
					"name": "ContactAdressInfoTooltipButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.InfoSpriteImage"},
						"classes": {
							"wrapperClass": "info-button-lead-group",
							"imageClass": "info-button-lead-group-image"
						},
						"showTooltip": false,
						"click": {"bindTo": "showContactAdressInfoToolTip"}
					},
					"parentName": "ContactAdressBlock",
					"propertyName": "tools",
					"index": 1
				},
				{
					"operation": "insert",
					"name": "ContactAdressGridLayout",
					"parentName": "ContactAdressBlock",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "LeadContactAddressType",
					"parentName": "ContactAdressGridLayout",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 0, "row": 0}
					}
				},
				{
					"operation": "insert",
					"name": "LeadContactCountry",
					"parentName": "ContactAdressGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 0}
					}
				},
				{
					"operation": "insert",
					"name": "LeadContactRegion",
					"parentName": "ContactAdressGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 1}
					}
				},
				{
					"operation": "insert",
					"name": "LeadContactCity",
					"parentName": "ContactAdressGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 1}
					}
				},
				{
					"operation": "insert",
					"name": "LeadContactZip",
					"parentName": "ContactAdressGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 2}
					}
				},
				{
					"operation": "insert",
					"name": "LeadContactAddress",
					"parentName": "ContactAdressGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 2}
					}
				},
				{
					"operation": "insert",
					"name": "ContactCommunicationsInfoTooltipButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.InfoSpriteImage"},
						"classes": {
							"wrapperClass": "info-button-lead-group",
							"imageClass": "info-button-lead-group-image"
						},
						"showTooltip": false,
						"click": {"bindTo": "showContactCommunicationsInfoToolTip"}
					},
					"parentName": "ContactCommunicationsBlock",
					"propertyName": "tools",
					"index": 1
				},
				{
					"operation": "insert",
					"name": "ContactCommunicationsGridLayout",
					"parentName": "ContactCommunicationsBlock",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ContactBusinessPhone",
					"parentName": "ContactCommunicationsGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 0},
						"isRequired": {"bindTo": "setIsContactCommunicationRequired"}
					}
				},
				{
					"operation": "insert",
					"name": "ContactMobilePhone",
					"parentName": "ContactCommunicationsGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 0},
						"isRequired": {"bindTo": "setIsContactCommunicationRequired"}
					}
				},
				{
					"operation": "insert",
					"name": "ContactEmail",
					"parentName": "ContactCommunicationsGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 1},
						"isRequired": {"bindTo": "setIsContactCommunicationRequired"}
					}
				},
				{
					"operation": "insert",
					"name": "ContactDataGridLayout",
					"parentName": "ContactDataBlock",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "LeadContactName",
					"parentName": "ContactDataGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 0}
					}
				},
				{
					"operation": "insert",
					"name": "Dear",
					"parentName": "ContactDataGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 0}
					}
				},
				{
					"operation": "insert",
					"name": "Gender",
					"parentName": "ContactDataGridLayout",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 0, "row": 1}
					}
				},
				{
					"operation": "insert",
					"name": "Salutation",
					"parentName": "ContactDataGridLayout",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 12, "row": 1}
					}
				},
				{
					"operation": "insert",
					"name": "Job",
					"parentName": "ContactDataGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 2}
					}
				},
				{
					"operation": "insert",
					"name": "FullJobTitle",
					"parentName": "ContactDataGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 2}
					}
				},
				{
					"operation": "insert",
					"name": "Department",
					"parentName": "ContactDataGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 3}
					}
				},
				{
					"operation": "insert",
					"name": "DecisionRole",
					"parentName": "ContactDataGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 3}
					}
				},
				{
					"operation": "insert",
					"name": "AccountCommunicationsBlock",
					"parentName": "AccountDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.CommunicationsGroupCaption"},
						"items": [],
						"tools": []
					}
				},
				{
					"operation": "insert",
					"name": "AccountDataBlock",
					"parentName": "AccountDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.DataGroupCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "AccountAdressBlock",
					"parentName": "AccountDataContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.AddressGroupCaption"},
						"items": [],
						"tools": []
					}
				},
				{
					"operation": "insert",
					"name": "AccountAdressInfoTooltipButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.InfoSpriteImage"},
						"classes": {
							"wrapperClass": "info-button-lead-group",
							"imageClass": "info-button-lead-group-image"
						},
						"showTooltip": false,
						"click": {"bindTo": "showAccountAdressInfoToolTip"}
					},
					"parentName": "AccountAdressBlock",
					"propertyName": "tools",
					"index": 1
				},
				{
					"operation": "insert",
					"name": "AccountAdressGridLayout",
					"parentName": "AccountAdressBlock",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "LeadAccountAddressType",
					"parentName": "AccountAdressGridLayout",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 0, "row": 0},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "LeadAccountCountry",
					"parentName": "AccountAdressGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 0},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "LeadAccountRegion",
					"parentName": "AccountAdressGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 1},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "LeadAccountCity",
					"parentName": "AccountAdressGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 1},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "LeadAccountZip",
					"parentName": "AccountAdressGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 2},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "LeadAccountAddress",
					"parentName": "AccountAdressGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 2},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "AccountCommunicationsInfoTooltipButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.InfoSpriteImage"},
						"classes": {
							"wrapperClass": "info-button-lead-group",
							"imageClass": "info-button-lead-group-image"
						},
						"showTooltip": false,
						"click": {"bindTo": "showAccountCommunicationsInfoToolTip"}
					},
					"parentName": "AccountCommunicationsBlock",
					"propertyName": "tools",
					"index": 1
				},
				{
					"operation": "insert",
					"name": "AccountCommunicationsGridLayout",
					"parentName": "AccountCommunicationsBlock",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "AccountBusinessPhone",
					"parentName": "AccountCommunicationsGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 0},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "AccountFax",
					"parentName": "AccountCommunicationsGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 0},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "AccountWebsite",
					"parentName": "AccountCommunicationsGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 1},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "AccountDataGridLayout",
					"parentName": "AccountDataBlock",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "LeadAccountName",
					"parentName": "AccountDataGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 0},
						"isRequired": {"bindTo": "IsLeadAccountNameRequired"},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "AccountCategory",
					"parentName": "AccountDataGridLayout",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 12, "row": 0},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "Industry",
					"parentName": "AccountDataGridLayout",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 0, "row": 1},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "EmployeesNumber",
					"parentName": "AccountDataGridLayout",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 12, "row": 1},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "AnnualRevenue",
					"parentName": "AccountDataGridLayout",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 0, "row": 2},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "Ownership",
					"parentName": "AccountDataGridLayout",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 12, "row": 2},
						"enabled": {"bindTo": "IsAccountDataFieldsEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "SearchSimilarContainer",
					"parentName": "SearchSimilarTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
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
						"imageConfig": {"bindTo": "Resources.Images.InfoSpriteImage"},
						"classes": {
							"wrapperClass": "info-button",
							"imageClass": "info-button-image"
						},
						"showTooltip": true,
						"tooltipText": {"bindTo": "Resources.Strings.QualificationInfoTip"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "QualifyButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {bindTo: "Resources.Strings.QualifyButtonCaption"},
						"classes": {textClass: "actions-button-margin-right"},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"click": {bindTo: "qualifyLead"}
					},
					"index": 0
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "DisqualifyButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {bindTo: "Resources.Strings.DisqualifyButtonCaption"},
						"classes": {
							textClass: "actions-button-margin-right",
							"wrapperClass": ["actions-button-margin-right"]
						},
						"controlConfig": {
							"menu": {
								"items": {
									"bindTo": "DisqualifyReasonsMenu"
								}
							}
						},
						"layout": {column: 0, row: 0, colSpan: 2}
					},
					"index": 1
				},
				{
					"operation": "merge",
					"name": "SaveButton",
					"values": {
						"click": {"bindTo": "saveLead"},
						"style": Terrasoft.controls.ButtonEnums.style.BLUE
					},
					"index": 2
				},
				{
					"operation": "insert",
					"name": "ContactSearchConditionsGroup",
					"parentName": "SearchSimilarContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"caption": {"bindTo": "Resources.Strings.ContactSearchConditionsGroupCaption"},
						"controlConfig": {
							"collapsed": false
						}
					}
				},
				{
					"operation": "insert",
					"name": "ContactSearchSetting",
					"parentName": "ContactSearchConditionsGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": [
						]
					}
				},
				{
					"operation": "insert",
					"name": "IsContactSearchByName",
					"values": {
						"labelConfig": {"visible": false},
						"layout": {"column": 0, "row": 0, "colSpan": 1},
						"dataValueType": Terrasoft.DataValueType.BOOLEAN,
						"checked": {bindTo: "IsContactSearchByName"},
						"classes": {"wrapClass": ["search-option"]}
					},
					"parentName": "ContactSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "ContactSearchValueName",
					"values": {
						"layout": {"column": 1, "row": 0, "colSpan": 10},
						"labelWrapConfig": {"classes": {"wrapClassName": ["search-narrow-label"]}},
						"controlWrapConfig": {"classes": {"wrapClassName": ["search-narrow-control"]}}
					},
					"parentName": "ContactSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "IsContactSearchByEmail",
					"values": {
						"labelConfig": {"visible": false},
						"layout": {"column": 0, "row": 1, "colSpan": 1},
						"dataValueType": Terrasoft.DataValueType.BOOLEAN,
						"classes": {"wrapClass": ["search-option"]}
					},
					"parentName": "ContactSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "ContactSearchValueEmail",
					"values": {
						"layout": {"column": 1, "row": 1, "colSpan": 10},
						"labelWrapConfig": {"classes": {"wrapClassName": ["search-narrow-label"]}},
						"controlWrapConfig": {"classes": {"wrapClassName": ["search-narrow-control"]}}
					},
					"parentName": "ContactSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "IsContactSearchByPhone",
					"values": {
						"labelConfig": {"visible": false},
						"layout": {"column": 12, "row": 0, "colSpan": 1},
						"classes": {"wrapClass": ["search-option"]}
					},
					"parentName": "ContactSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "ContactSearchValuePhone",
					"values": {
						"layout": {"column": 13, "row": 0, "colSpan": 11},
						"labelWrapConfig": {"classes": {"wrapClassName": ["search-narrow-label"]}},
						"controlWrapConfig": {"classes": {"wrapClassName": ["search-narrow-control"]}}
					},
					"parentName": "ContactSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "IsContactSearchByWeb",
					"values": {
						"labelConfig": {"visible": false},
						"layout": {"column": 12, "row": 1, "colSpan": 1},
						"classes": {"wrapClass": ["search-option"]}
					},
					"parentName": "ContactSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "ContactSearchValueWeb",
					"values": {
						"layout": {"column": 13, "row": 1, "colSpan": 11},
						"labelWrapConfig": {"classes": {"wrapClassName": ["search-narrow-label"]}},
						"controlWrapConfig": {"classes": {"wrapClassName": ["search-narrow-control"]}}
					},
					"parentName": "ContactSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"parentName": "ContactSearchConditionsGroup",
					"propertyName": "items",
					"name": "SimilarContacts",
					"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
				},
				{
					"operation": "insert",
					"name": "AccountSearchConditionsGroup",
					"parentName": "SearchSimilarContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"caption": {"bindTo": "Resources.Strings.AccountSearchConditionsGroupCaption"},
						"controlConfig": {"collapsed": false}
					}
				},
				{
					"operation": "insert",
					"name": "AccountRelationship",
					"values": {
						"caption": " ",
						"layout": {"column": 0, "row": 3, "colSpan": 23},
						"itemType": Terrasoft.ViewItemType.RADIO_GROUP,
						"value": {"bindTo": "AccountRelationship"},
						"items": [
							{
								"name": "NEW",
								"caption": {"bindTo": "Resources.Strings.AccountRelationshipNew"},
								"value": Terrasoft.AccountRelationship.NEW,
								"controlConfig": {
									"checkedchanged": {"bindTo": "onAccountRelationshipChanged"}
								}
							},
							{
								"name": "EXIST",
								"caption": {"bindTo": "Resources.Strings.AccountRelationshipExist"},
								"value": Terrasoft.AccountRelationship.EXIST,
								"controlConfig": {
									"checkedchanged": {"bindTo": "onAccountRelationshipChanged"}
								}
							},
							{
								"name": "BREAK",
								"caption": {"bindTo": "Resources.Strings.AccountRelationshipBreak"},
								"value": Terrasoft.AccountRelationship.BREAK,
								"controlConfig": {
									"checkedchanged": {"bindTo": "onAccountRelationshipChanged"}
								}
							}
						]
					},
					"parentName": "AccountSearchConditionsGroup",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "AccountSearchSetting",
					"parentName": "AccountSearchConditionsGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "IsAccountSearchByName",
					"values": {
						"labelConfig": {"visible": false},
						"layout": {"column": 0, "row": 0, "colSpan": 1},
						"dataValueType": Terrasoft.DataValueType.BOOLEAN,
						"enabled": {"bindTo": "IsAccountSearchEnabled"},
						"classes": {"wrapClass": ["search-option"]}
					},
					"parentName": "AccountSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "AccountSearchValueName",
					"values": {
						"layout": {"column": 1, "row": 0, "colSpan": 10},
						"enabled": {"bindTo": "IsAccountSearchEnabled"},
						"labelWrapConfig": {"classes": {"wrapClassName": ["search-narrow-label"]}},
						"controlWrapConfig": {"classes": {"wrapClassName": ["search-narrow-control"]}}
					},
					"parentName": "AccountSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "IsAccountSearchByEmail",
					"values": {
						"labelConfig": {"visible": false},
						"layout": {"column": 0, "row": 1, "colSpan": 1},
						"dataValueType": Terrasoft.DataValueType.BOOLEAN,
						"enabled": {"bindTo": "IsAccountSearchEnabled"},
						"classes": {"wrapClass": ["search-option"]}
					},
					"parentName": "AccountSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "AccountSearchValueEmail",
					"values": {
						"layout": {"column": 1, "row": 1, "colSpan": 10},
						"enabled": {"bindTo": "IsAccountSearchEnabled"},
						"labelWrapConfig": {"classes": {"wrapClassName": ["search-narrow-label"]}},
						"controlWrapConfig": {"classes": {"wrapClassName": ["search-narrow-control"]}}
					},
					"parentName": "AccountSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "IsAccountSearchByPhone",
					"values": {
						"labelConfig": {"visible": false},
						"layout": {"column": 12, "row": 0, "colSpan": 1},
						"enabled": {"bindTo": "IsAccountSearchEnabled"},
						"classes": {"wrapClass": ["search-option"]}
					},
					"parentName": "AccountSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "AccountSearchValuePhone",
					"values": {
						"layout": {"column": 13, "row": 0, "colSpan": 11},
						"enabled": {"bindTo": "IsAccountSearchEnabled"},
						"labelWrapConfig": {"classes": {"wrapClassName": ["search-narrow-label"]}},
						"controlWrapConfig": {"classes": {"wrapClassName": ["search-narrow-control"]}}
					},
					"parentName": "AccountSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "IsAccountSearchByWeb",
					"values": {
						"labelConfig": {"visible": false},
						"layout": {"column": 12, "row": 1, "colSpan": 1},
						"enabled": {"bindTo": "IsAccountSearchEnabled"},
						"classes": {"wrapClass": ["search-option"]}
					},
					"parentName": "AccountSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"name": "AccountSearchValueWeb",
					"values": {
						"layout": {"column": 13, "row": 1, "colSpan": 11},
						"enabled": {"bindTo": "IsAccountSearchEnabled"},
						"labelWrapConfig": {"classes": {"wrapClassName": ["search-narrow-label"]}},
						"controlWrapConfig": {"classes": {"wrapClassName": ["search-narrow-control"]}}
					},
					"parentName": "AccountSearchSetting",
					"propertyName": "items"
				},
				{
					"operation": "insert",
					"parentName": "AccountSearchConditionsGroup",
					"propertyName": "items",
					"name": "SimilarAccounts",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL,
						"enabled": {"bindTo": "IsAccountSearchByEmail"}
					}
				}
			]/**SCHEMA_DIFF*/,
			rules: {
				"LeadAccountAddressType": {
					"FiltrationByForAccount": {
						ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
						autocomplete: true,
						autoClean: true,
						baseAttributePatch: "ForAccount",
						comparisonType: Terrasoft.ComparisonType.EQUAL,
						type: BusinessRuleModule.enums.ValueType.CONSTANT,
						value: true
					}
				},
				"LeadAccountRegion": {
					"FiltrationRegionByCountry": {
						ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
						autocomplete: true,
						autoClean: true,
						baseAttributePatch: "Country",
						comparisonType: Terrasoft.ComparisonType.EQUAL,
						type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						attribute: "LeadAccountCountry"
					}
				},
				"LeadAccountCity": {
					"FiltrationCityByCountry": {
						ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
						autocomplete: true,
						autoClean: true,
						baseAttributePatch: "Country",
						comparisonType: Terrasoft.ComparisonType.EQUAL,
						type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						attribute: "LeadAccountCountry"
					},
					"FiltrationCityByRegion": {
						ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
						autocomplete: true,
						autoClean: true,
						baseAttributePatch: "Region",
						comparisonType: Terrasoft.ComparisonType.EQUAL,
						type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						attribute: "LeadAccountRegion"
					}
				},
				"LeadContactAddressType": {
					"FiltrationByForContact": {
						ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
						autocomplete: true,
						autoClean: true,
						baseAttributePatch: "ForContact",
						comparisonType: Terrasoft.ComparisonType.EQUAL,
						type: BusinessRuleModule.enums.ValueType.CONSTANT,
						value: true
					}
				},
				"LeadContactRegion": {
					"FiltrationRegionByCountry": {
						ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
						autocomplete: true,
						autoClean: true,
						baseAttributePatch: "Country",
						comparisonType: Terrasoft.ComparisonType.EQUAL,
						type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						attribute: "LeadContactCountry"
					}
				},
				"LeadContactCity": {
					"FiltrationCityByCountry": {
						ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
						autocomplete: true,
						autoClean: true,
						baseAttributePatch: "Country",
						comparisonType: Terrasoft.ComparisonType.EQUAL,
						type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						attribute: "LeadContactCountry"
					},
					"FiltrationCityByRegion": {
						ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
						autocomplete: true,
						autoClean: true,
						baseAttributePatch: "Region",
						comparisonType: Terrasoft.ComparisonType.EQUAL,
						type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						attribute: "LeadContactRegion"
					}
				}
			}
		};
	});
