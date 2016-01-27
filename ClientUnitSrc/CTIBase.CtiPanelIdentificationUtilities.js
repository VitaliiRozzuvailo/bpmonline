define("CtiPanelIdentificationUtilities", ["CtiPanelResources", "ProcessModuleUtilities", "CtiConstants",
		"ConfigurationConstants"],
	function(resources, ProcessModuleUtilities, CtiConstants, ConfigurationConstants) {

		/**
		 * @class Terrasoft.configuration.mixins.CtiPanelIdentificationUtilities
		 * Миксин идентификации абонента CTI панели.
		 * @type {Terrasoft.BaseObject}
		 */
		Ext.define("Terrasoft.configuration.mixins.CtiPanelIdentificationUtilities", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.CtiPanelIdentificationUtilities",

			//region Methods: Private

			/**
			 * Заполняет коллекцию идентифицированных по номеру абонентов данными, полученных при выборке из базы
			 * данных. Если до выборки был установлен желаемый абонент, то он будет установлен идентифицированным
			 * (если будет присутствовать в выборке).
			 * @private
			 * @param {Object[]} queryResultSubscribers Массив идентифицированных абонентов, полученных при выборке из
			 * базы данных.
			 * @param {String} collectionName (optional) Название коллекции идентифицируемых абонентов, которую следует
			 * заполнить.
			 * @param {String} subscriberKeyName (optional) Название свойства с ключом идентифицированного абонента.
			 */
			fillSubscribersCollection: function(queryResultSubscribers, collectionName, subscriberKeyName) {
				var number = this.get("CurrentCallNumber");
				if (Ext.isEmpty(number)) {
					return;
				}
				var tempCollection = this.Ext.create("Terrasoft.Collection");
				var panelCollection = this.get(collectionName || "IdentifiedSubscriberPanelCollection");
				panelCollection.clear();
				Terrasoft.each(queryResultSubscribers, function(queryResultSubscriber) {
					if (tempCollection.contains(queryResultSubscriber.SubscriberId)) {
						return;
					}
					var panelConfig = this.getIdentifiedSubscriberPanelConfig(queryResultSubscriber);
					var subscriberPanel = this.createPanelViewModel(panelConfig,
						this.identifiedSubscriberPanelViewModelClass);
					tempCollection.add(queryResultSubscriber.SubscriberId, subscriberPanel);
				}, this);
				panelCollection.loadAll(tempCollection);
				this.setIdentifiedSubscriberOnTheAdvise(panelCollection,
					subscriberKeyName || "IdentifiedSubscriberKey");
			},

			/**
			 * Собирает данные поиска абонентов и заполняет коллекцию панелей результатов поиска.
			 * @private
			 * @param {Object[]} querySearchResults Массив с результатами поиска абонентов, полученными при выборке из
			 * базы данных.
			 */
			fillSearchResultCollection: function(querySearchResults) {
				var searchResultCollection = new Terrasoft.Collection();
				Terrasoft.each(querySearchResults, function(querySearchResultItem) {
					this.updateSearchResultCollection(searchResultCollection, querySearchResultItem);
				}, this);
				var searchResultPanelCollection = this.get("SearchResultPanelCollection");
				var tempCollection = this.Ext.create("Terrasoft.Collection");
				var viewClass = this.searchResultPanelViewModelClass;
				searchResultPanelCollection.clear();
				searchResultCollection.each(function(searchResultItemConfig) {
					var searchResultPanel = this.createPanelViewModel(searchResultItemConfig, viewClass);
					tempCollection.add(searchResultItemConfig.Id, searchResultPanel);
				}.bind(this));
				searchResultPanelCollection.loadAll(tempCollection);
			},

			/**
			 * Обновляет коллекцию с данными по найденным абонентам. Функция группирует данные, полученные при выборке с
			 * таблиц средств связи по абонентам таким образом, что у одного абонента будет коллекция с одним или
			 * несколькими средствами связи.
			 * @private
			 * @param {Terrasoft.Collection} searchResultCollection Коллекция с данными по найденым абонентам, которую
			 * следует обновить.
			 * @param {Object} queryResultSubscriber Данные абонента из базы данных.
			 */
			updateSearchResultCollection: function(searchResultCollection, queryResultSubscriber) {
				var searchResultPanelConfig = searchResultCollection.find(queryResultSubscriber.SubscriberId);
				var communicationPanelKey = queryResultSubscriber.CommunicationId;
				var communicationPanelConfig = this.getCommunicationPanelConfig(queryResultSubscriber);
				var communicationPanel = this.createPanelViewModel(communicationPanelConfig,
					this.сommunicationPanelViewModelClass);
				if (!searchResultPanelConfig) {
					searchResultPanelConfig = this.getSearchResultPanelConfig(queryResultSubscriber);
					searchResultCollection.add(queryResultSubscriber.SubscriberId, searchResultPanelConfig);
				}
				if (!searchResultPanelConfig.SubscriberCommunications.contains(communicationPanelKey)) {
					searchResultPanelConfig.SubscriberCommunications.add(communicationPanelKey, communicationPanel);
				}
			},

			/**
			 * Устанавливает идентифицированным абонента, если его идентификатор был сохранен как желаемый.
			 * @private
			 * @param {Terrasoft.Collection} subscribers Коллекция идентифицированных абонентов.
			 * @param {String} identifiedSubscriberKeyName Название свойства с ключом идентифицированного абонента.
			 */
			setIdentifiedSubscriberOnTheAdvise: function(subscribers, identifiedSubscriberKeyName) {
				var adviseIdentifiedSubscriber = this.get("AdvisedIdentifiedSubscriber");
				if (adviseIdentifiedSubscriber) {
					this.set("AdvisedIdentifiedSubscriber", "");
					var identifiedSubscriber = subscribers.find(adviseIdentifiedSubscriber);
					if (identifiedSubscriber) {
						this.set(identifiedSubscriberKeyName, adviseIdentifiedSubscriber);
					}
				}
			},

			/**
			 * Возвращает звонок, соответствующий названию коллекции идентифицируемых абонентов.
			 * @private
			 * @param {String} subscribersCollectionName Название коллекции идентифицируемых абонентов.
			 * @return {Terrasoft.integration.telephony.Call} Звонок.
			 */
			getCallBySubscriberCollectionName: function(subscribersCollectionName) {
				var call;
				if (subscribersCollectionName === "IdentifiedSubscriberPanelCollection") {
					call = this.get("CurrentCall");
					if (call) {
						call = this.activeCalls.find(call.id);
					}
				}
				if (subscribersCollectionName === "IdentifiedConsultSubscriberPanelCollection") {
					call = this.findConsultCall();
				}
				return call;
			},

			/**
			 * Обновляет идентификационную информацию абонента звонка.
			 * @private
			 * @param {String} collectionName Название коллекции идентифицируемых абонентов.
			 * @param {String} subscriberId Идентификатор абонента.
			 * @param {Boolean} isManualClear (optional) Признак очистки идентификатора абонента вручную.
			 */
			updateCallByIdentifiedSubscriber: function(collectionName, subscriberId, isManualClear) {
				if (!subscriberId && !isManualClear) {
					return;
				}
				var call = this.getCallBySubscriberCollectionName(collectionName);
				if (call) {
					call.identificationFieldsData = this.getCallFieldValuesBySubscriber(collectionName, subscriberId);
					call.needSaveIdentificationData = true;
					this.updateCallByIdentificationData(call);
				}
			},

			/**
			 * Обновляет идентификационную информацию абонента звонка.
			 * @private
			 * @param call {Terrasoft.integration.telephony.Call} Звонок.
			 */
			updateCallByIdentificationData: function(call) {
				var databaseId = call.databaseUId;
				var updateFields = call.identificationFieldsData;
				var isStopUpdating = !call.needSaveIdentificationData || Ext.isEmpty(databaseId) ||
					Ext.isEmpty(updateFields) || updateFields.isEmpty();
				if (isStopUpdating) {
					return;
				}
				var logMessage = Ext.String.format(this.getResourceString("IdentificationSavingMessage"), call.id);
				var update = this.Ext.create("Terrasoft.UpdateQuery", {
					rootSchemaName: "Call"
				});
				var filters = update.filters;
				var idFilter = update.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					"Id", databaseId);
				filters.add("IdFilter", idFilter);
				var fieldSavingMessageTemplate = this.getResourceString("IdentificationFieldSavingMessage");
				updateFields.each(function(item) {
					var name = item.name;
					var value = item.value;
					update.setParameterValue(name, value, item.type);
					logMessage = logMessage + "\n\t" + Ext.String.format(fieldSavingMessageTemplate, name, value);
				});
				var updateCallback = function(result) {
					if (result.success) {
						logMessage += "\n" + this.getResourceString("IdentificationSavedSuccessfullyMessage");
						this.log(logMessage);
						call.needSaveIdentificationData = false;
					} else {
						logMessage += "\n" + this.getResourceString("IdentificationSavedFailedMessage");
						this.error(logMessage);
					}
				}.bind(this);
				update.execute(updateCallback);
			},

			//endregion

			//region Methods: Protected

			/**
			 * Возвращает конфигурационный объект с типичными свойствами для создания моделей представления панелей
			 * идентификации и поиска абонентов.
			 * @protected
			 * @param {Object} queryResultSubscriber Информация по идентификационному абоненту, полученная из
			 * базы данных.
			 * @returns {Object} Конфигурационный объект с типичными свойствами для создания моделей представления
			 * панелей идентификации и поиска абонентов.
			 */
			getSubscriberPanelCommonConfig: function(queryResultSubscriber) {
				var panelConfig = {
					Id: queryResultSubscriber.SubscriberId,
					Name: queryResultSubscriber.Name,
					Photo: queryResultSubscriber.Photo.value,
					Number: queryResultSubscriber.Number
				};
				switch (queryResultSubscriber.SubscriberType) {
					case CtiConstants.SubscriberTypes.Contact:
						this.fillContactIdentificationData(panelConfig, queryResultSubscriber);
						break;
					case CtiConstants.SubscriberTypes.Account:
						this.fillAccountIdentificationData(panelConfig, queryResultSubscriber);
						break;
					default:
						break;
				}
				return panelConfig;
			},

			/**
			 * Возвращает конфигурационный объект для создания модели представления панели идентифицированного абонента.
			 * @protected
			 * @param {Object} queryResultSubscriber Информация по идентификационному абоненту, полученная из
			 * базы данных.
			 * @returns {Object} Конфигурационный объект для создания модели представления панели идентифицированного
			 * абонента.
			 */
			getIdentifiedSubscriberPanelConfig: function(queryResultSubscriber) {
				var panelConfig = this.getSubscriberPanelCommonConfig(queryResultSubscriber);
				Ext.apply(panelConfig, {CommunicationType: queryResultSubscriber.CommunicationType.displayValue});
				return panelConfig;
			},

			/**
			 * Возвращает конфигурационный объект для создания модели представления панели поиска абонента.
			 * @protected
			 * @param {Object} queryResultSubscriber Информация по идентификационному абоненту, полученная из
			 * базы данных.
			 * @returns {Object} Конфигурационный объект для создания модели представления панели поиска абонента.
			 */
			getSearchResultPanelConfig: function(queryResultSubscriber) {
				var panelConfig = this.getSubscriberPanelCommonConfig(queryResultSubscriber);
				Ext.apply(panelConfig, {
					Type: queryResultSubscriber.SubscriberType,
					SubscriberCommunications: new Terrasoft.Collection(),
					CtiModel: this
				});
				return panelConfig;
			},

			/**
			 * Возвращает конфигурационный объект для создания модели представления панели средства связи абонента.
			 * @protected
			 * @param {Object} queryResultSubscriber Информация по идентификационному абоненту, полученная из
			 * базы данных.
			 * @returns {Object} Конфигурационный объект для создания модели представления панели средства связи
			 * абонента.
			 */
			getCommunicationPanelConfig: function(queryResultSubscriber) {
				return {
					Id: queryResultSubscriber.Id,
					Type: queryResultSubscriber.CommunicationType.displayValue,
					Number: queryResultSubscriber.Number,
					SubscriberId: queryResultSubscriber.SubscriberId,
					CtiModel: this
				};
			},

			/**
			 * Возвращает тип операции сравнения при идентификации абонента по номеру телефона. Если количество цифр в
			 * номере не соответствует внутреннему номеру - то тип сравнения "начинается с", в противном случае тип
			 * сравнения "равно".
			 * @protected
			 * @param {String} searchNumber Номер телефона.
			 * @returns {Terrasoft.ComparisonType} Тип операции сравнения.
			 */
			getSearchNumberComparisonType: function(searchNumber) {
				var ctiSettings = this.get("CtiSettings");
				var internalNumberLength = ctiSettings.internalNumberLength;
				if (Ext.isEmpty(searchNumber)) {
					throw new Terrasoft.NullOrEmptyException(
						resources.localizableStrings.PhoneNumberCantBeEmptyMessage);
				}
				return (searchNumber.length > internalNumberLength)
					? Terrasoft.ComparisonType.START_WITH
					: Terrasoft.ComparisonType.EQUAL;
			},

			/**
			 * Формирует запрос идентификации контактов по звонку.
			 * @protected
			 * @param {String} searchNumber Номер телефона абонента.
			 * @returns {Terrasoft.EntitySchemaQuery}
			 */
			getContactIdentificationQuery: function(searchNumber) {
				var comparisonType = this.getSearchNumberComparisonType(searchNumber);
				return this.getContactQuery("SearchNumber", searchNumber, comparisonType);
			},

			/**
			 * Формирует запрос поиска контактов по имени.
			 * @protected
			 * @param {String} searchName Имя абонента.
			 * @returns {Terrasoft.EntitySchemaQuery}
			 */
			getContactSearchQuery: function(searchName) {
				return this.getContactQuery("Contact.Name", searchName);
			},

			/**
			 * Формирует запрос идентификации контрагентов по звонку.
			 * @protected
			 * @param {String} searchNumber Номер телефона абонента.
			 * @returns {Terrasoft.EntitySchemaQuery}
			 */
			getAccountIdentificationQuery: function(searchNumber) {
				var comparisonType = this.getSearchNumberComparisonType(searchNumber);
				return this.getAccountQuery("SearchNumber", searchNumber, comparisonType);
			},

			/**
			 * Формирует запрос идентификации контрагентов по звонку.
			 * @protected
			 * @param {String} searchName Название контрагента.
			 * @returns {Terrasoft.EntitySchemaQuery}
			 */
			getAccountSearchQuery: function(searchName) {
				return this.getAccountQuery("Account.Name", searchName);
			},

			/**
			 * Возвращает запрос для выборки контактов.
			 * @protected
			 * @param {String} searchFieldName Имя поля для фильтрации.
			 * @param {String} searchValue Ключ фильтрации.
			 * @param {Terrasoft.ComparisonType} comparisonType (optional) Тип сравнения. По умолчанию
			 * {@link Terrasoft.ComparisonType.START_WITH}.
			 * @returns {Terrasoft.EntitySchemaQuery}
			 */
			getContactQuery: function(searchFieldName, searchValue, comparisonType) {
				comparisonType = comparisonType || Terrasoft.ComparisonType.START_WITH;
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "ContactCommunication"});
				esq.rowCount = CtiConstants.IdentificationMaxRowCount;
				esq.addColumn("Id");
				var contactNameColumn = esq.addColumn("Contact.Name", "Name");
				contactNameColumn.orderPosition = 0;
				contactNameColumn.orderDirection = Terrasoft.OrderDirection.ASC;
				var contactIdColumn = esq.addColumn("Contact.Id", "SubscriberId");
				contactIdColumn.orderPosition = 1;
				contactIdColumn.orderDirection = Terrasoft.OrderDirection.ASC;
				var communicationTypeNameColumn = esq.addColumn("CommunicationType", "CommunicationType");
				communicationTypeNameColumn.orderPosition = 2;
				communicationTypeNameColumn.orderDirection = Terrasoft.OrderDirection.ASC;
				esq.addColumn("Contact.Type", "Type");
				esq.addColumn("Contact.Account", "Account");
				esq.addColumn("Contact.Job", "Job");
				esq.addColumn("Contact.Department", "Department");
				esq.addColumn("Contact.Photo", "Photo");
				esq.addColumn("Number");
				esq.addParameterColumn(CtiConstants.SubscriberTypes.Contact, Terrasoft.DataValueType.TEXT,
					"SubscriberType");
				esq.filters.addItem(Terrasoft.createIsNotNullFilter(
					Ext.create("Terrasoft.ColumnExpression", {columnPath: "Contact.Id"})));
				esq.filters.add("Search", Terrasoft.createColumnFilterWithParameter(
					comparisonType, searchFieldName, searchValue));
				esq.filters.add("CommunicationCode", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"[ComTypebyCommunication:CommunicationType:CommunicationType].Communication.Code",
					CtiConstants.CommunicationCodes.Phone));
				return esq;
			},

			/**
			 * Возвращает запрос для выборки контрагентов.
			 * @protected
			 * @param {String} searchFieldName Имя поля для фильтрации.
			 * @param {String} searchValue Ключ фильтрации.
			 * @param {Terrasoft.ComparisonType} comparisonType (optional) Тип сравнения. По умолчанию
			 * {@link Terrasoft.ComparisonType.START_WITH}.
			 * @returns {Terrasoft.EntitySchemaQuery}
			 */
			getAccountQuery: function(searchFieldName, searchValue, comparisonType) {
				comparisonType = comparisonType || Terrasoft.ComparisonType.START_WITH;
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "AccountCommunication"});
				esq.rowCount = CtiConstants.IdentificationMaxRowCount;
				esq.addColumn("Id");
				var accountNameColumn = esq.addColumn("Account.Name", "Name");
				accountNameColumn.orderPosition = 0;
				accountNameColumn.orderDirection = Terrasoft.OrderDirection.ASC;
				var accountIdColumn = esq.addColumn("Account.Id", "SubscriberId");
				accountIdColumn.orderPosition = 1;
				accountIdColumn.orderDirection = Terrasoft.OrderDirection.ASC;
				var communicationTypeNameColumn = esq.addColumn("CommunicationType", "CommunicationType");
				communicationTypeNameColumn.orderPosition = 2;
				communicationTypeNameColumn.orderDirection = Terrasoft.OrderDirection.ASC;
				esq.addColumn("Account.Type", "Type");
				esq.addColumn("Account.City", "City");
				esq.addColumn("Account.Logo", "Photo");
				esq.addColumn("Number");
				esq.addParameterColumn(CtiConstants.SubscriberTypes.Account, Terrasoft.DataValueType.TEXT,
					"SubscriberType");
				esq.filters.addItem(Terrasoft.createIsNotNullFilter(
					Ext.create("Terrasoft.ColumnExpression", {columnPath: "Account.Id"})));
				esq.filters.add("Search", Terrasoft.createColumnFilterWithParameter(
					comparisonType, searchFieldName, searchValue));
				esq.filters.add("CommunicationCode", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"[ComTypebyCommunication:CommunicationType:CommunicationType].Communication.Code",
					CtiConstants.CommunicationCodes.Phone));
				return esq;
			},

			/**
			 * Заполняет свойства конфигурационного объекта идентифицированного абонента на основе данных о контакте,
			 * полученных из базы данных.
			 * @protected
			 * @param {Object} panelConfig Конфигурация идентифицированного абонента для создания компонента панели.
			 * @param {Object} queryResultSubscriber Данные контакта, полученные из базы данных.
			 */
			fillContactIdentificationData: function(panelConfig, queryResultSubscriber) {
				var contactType = queryResultSubscriber.Type.value;
				var isEmployee = (contactType === ConfigurationConstants.ContactType.Employee);
				Ext.apply(panelConfig, {
					Type: (isEmployee)
						? CtiConstants.SubscriberTypes.Employee
						: CtiConstants.SubscriberTypes.Contact,
					AccountName: queryResultSubscriber.Account.displayValue
				});
				if (isEmployee) {
					Ext.apply(panelConfig, {Department: queryResultSubscriber.Department.displayValue});
				} else {
					Ext.apply(panelConfig, {Job: queryResultSubscriber.Job.displayValue});
				}
			},

			/**
			 * Заполняет свойства конфигурационного объекта идентифицированного абонента на основе данных о контрагенте,
			 * полученных из базы данных.
			 * @protected
			 * @param {Object} panelConfig Конфигурация идентифицированного абонента для создания компонента панели.
			 * @param {Object} queryResultSubscriber Данные контрагента, полученные из базы данных.
			 */
			fillAccountIdentificationData: function(panelConfig, queryResultSubscriber) {
				Ext.apply(panelConfig, {
					Type: CtiConstants.SubscriberTypes.Account,
					AccountType: queryResultSubscriber.Type.displayValue,
					City: queryResultSubscriber.City.displayValue
				});
			},

			/**
			 * Идентифицирует абонента по звонку.
			 * @protected
			 * @param {String} number Номер текущего звонка.
			 * @param {String} collectionName (optional) Название коллекции идентифицируемых абонентов.
			 * @param {String} subscriberKeyName (optional) Название свойства с ключом идентифицированного абонента.
			 */
			identifySubscriber: function(number, collectionName, subscriberKeyName) {
				if (Ext.isEmpty(number)) {
					return;
				}
				var reverseNumber = Terrasoft.utils.common.reverseStr(number);
				var ctiSettings = this.get("CtiSettings");
				var searchNumberLength = ctiSettings.searchNumberLength;
				var internalNumberLength = ctiSettings.internalNumberLength;
				if (internalNumberLength > 0 && searchNumberLength > internalNumberLength) {
					reverseNumber = reverseNumber.substring(0, searchNumberLength);
				}
				this.querySubscribersByPhoneNumber(reverseNumber, function(response) {
					if (!(response && response.success)) {
						return;
					}
					var queryResultSubscribers = [];
					Terrasoft.each(response.queryResults, function(queryResult) {
						queryResultSubscribers = queryResultSubscribers.concat(queryResult.rows);
					});
					this.fillSubscribersCollection(queryResultSubscribers, collectionName, subscriberKeyName);
				}.bind(this));
			},

			/**
			 * Поиск абонентов по первичному полю для отображения.
			 * @protected
			 * @param {String} searchString Строка для поиска.
			 */
			searchSubscriberByPrimaryColumnValue: function(searchString) {
				if (Ext.isEmpty(searchString)) {
					this.fillSearchResultCollection([], searchString);
					return;
				}
				var phoneNumberEdit = Ext.getCmp("PhoneNumber");
				var maskId = Terrasoft.Mask.show({
					selector: phoneNumberEdit.selectors.rightIconEl,
					frameVisible: false,
					caption: ""
				});
				this.querySubscribersBySearchName(searchString, function(response) {
					Terrasoft.Mask.hide(maskId);
					if (!(response && response.success)) {
						var searchResultPanelCollection = this.get("SearchResultPanelCollection");
						this.set("IsSearchFinishedAndResultEmpty", searchResultPanelCollection.isEmpty());
						return;
					}
					var currentPhoneNumberValue = phoneNumberEdit.getTypedValue();
					if (currentPhoneNumberValue !== searchString) {
						this.set("IsSearchFinishedAndResultEmpty", false);
						return;
					}
					if (!this.isSearchValueValid(currentPhoneNumberValue)) {
						this.clearSearchSubscriber();
						this.set("IsSearchFinishedAndResultEmpty", false);
						return;
					}
					var querySearchResult = [];
					Terrasoft.each(response.queryResults, function(queryResult) {
						querySearchResult = querySearchResult.concat(queryResult.rows);
					});
					this.fillSearchResultCollection(querySearchResult, searchString);
					this.set("IsSearchFinishedAndResultEmpty", (querySearchResult.length === 0));
				}.bind(this));
			},

			/**
			 * Очищает коллекцию панелей результатов поиска абонента по первичному полю для отображения.
			 * @protected
			 */
			clearSearchSubscriber: function() {
				var searchResultPanelCollection = this.get("SearchResultPanelCollection");
				searchResultPanelCollection.clear();
			},

			/**
			 * Запрашивает из БД данные об абонентах по номеру телефона.
			 * @protected
			 * @param {String} searchNumber Номер телефона абонента.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} callback.response Результат выборки данных.
			 */
			querySubscribersByPhoneNumber: function(searchNumber, callback) {
				var bq = Ext.create("Terrasoft.BatchQuery");
				this.getIdentificationQueries(bq, searchNumber);
				bq.execute(callback);
			},

			/**
			 * Запрашивает из БД данные об абонентах по ключу поиска.
			 * @protected
			 * @param {String} searchName Значение ключа для поиска абонентов.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} callback.response Результат выборки данных.
			 */
			querySubscribersBySearchName: function(searchName, callback) {
				var bq = Ext.create("Terrasoft.BatchQuery");
				this.getSearchQueries(bq, searchName);
				bq.execute(callback);
			},

			/**
			 * Формирует пакет запросов для выборки данных об абонентах при поиске по номеру телефона.
			 * @private
			 * @param {Terrasoft.BatchQuery} bq Пакет запросов.
			 * @param {String} searchNumber Номер телефона абонента.
			 */
			getIdentificationQueries: function(bq, searchNumber) {
				bq.add(this.getContactIdentificationQuery(searchNumber));
				bq.add(this.getAccountIdentificationQuery(searchNumber));
			},

			/**
			 * Формирует пакет запросов для выборки данных об абонентах при поиске по имени.
			 * @private
			 * @param {Terrasoft.BatchQuery} bq Пакет запросов.
			 * @param {String} searchName Значение ключа для поиска абонентов.
			 */
			getSearchQueries: function(bq, searchName) {
				bq.add(this.getContactSearchQuery(searchName));
				bq.add(this.getAccountSearchQuery(searchName));
			},

			/**
			 * Принудительно устанавливает указанного абонента идентифицированным.
			 * @param {String} subscriberId Идентификатор панели абонента.
			 * @throws {Terrasoft.ItemNotFoundException} Бросает исключение, если в коллекции идентифицированных
			 * абонентов не была найденна панель абонента.
			 */
			setIdentifiedSubscriber: function(subscriberId) {
				var isConsulting = this.get("IsConsulting");
				var identifiedSubscriberKeyPropertyName = isConsulting
					? "IdentifiedConsultSubscriberKey"
					: "IdentifiedSubscriberKey";
				var panelCollection = isConsulting
					? this.get("IdentifiedConsultSubscriberPanelCollection")
					: this.get("IdentifiedSubscriberPanelCollection");
				var subscriberExists = panelCollection.contains(subscriberId);
				if (!subscriberExists) {
					var errorMessage = Ext.String.format(
						resources.localizableStrings.SubscriberPanelNotFoundExceptionMessage, subscriberId);
					throw new Terrasoft.ItemNotFoundException({message: errorMessage});
				}
				this.set(identifiedSubscriberKeyPropertyName, subscriberId);
			},

			/**
			 * Сбрасывает идентифицированного абонента основного звонка и отображает для пользователя список ранее
			 * идентифицированных абонентов.
			 * @private
			 */
			clearSubscriber: function() {
				this.set("IdentifiedSubscriberKey", null);
				this.updateCallByIdentifiedSubscriber("IdentifiedSubscriberPanelCollection", null, true);
			},

			/**
			 * Сбрасывает идентифицированного абонента консультационного звонка и отображает для пользователя список
			 * ранее идентифицированных абонентов.
			 * @private
			 */
			clearConsultSubscriber: function() {
				this.set("IdentifiedConsultSubscriberKey", null);
				this.updateCallByIdentifiedSubscriber("IdentifiedConsultSubscriberPanelCollection", null, true);
			},

			/**
			 * Определяет, отображаются ли группирующий контейнер с результатами идентификации абонента. Группирующий
			 * контейнер содержит контейнеры с результатами идентификации по основному и консультационному звонку, и
			 * должен быть видим, если видим хотя бы один из них.
			 * @protected
			 * @return {Boolean} Группирующий контейнер с результатами идентификации абонента видимы.
			 */
			getIsIdentificationGroupContainerVisible: function() {
				var isConsult = this.get("IsConsulting");
				var keyPropertyName = (isConsult) ? "IdentifiedConsultSubscriberKey" : "IdentifiedSubscriberKey";
				var countPropertyName = (isConsult)
					? "IdentifiedConsultSubscribersCount"
					: "IdentifiedSubscribersCount";
				return this.isIdentificationContainerVisible(countPropertyName, keyPropertyName);
			},

			/**
			 * Определяет, отображаются ли результаты идентификации абонента основного звонка.
			 * @protected
			 * @return {Boolean} Результаты идентификации абонента видимы.
			 */
			getIsCurrentCallIdentificationContainerVisible: function() {
				var isConsult = this.get("IsConsulting");
				if (isConsult === true) {
					return false;
				}
				return this.isIdentificationContainerVisible("IdentifiedSubscribersCount", "IdentifiedSubscriberKey");
			},

			/**
			 * Определяет, отображаются ли результаты идентификации абонента консультационного звонка.
			 * @protected
			 * @return {Boolean} Результаты идентификации абонента видимы.
			 */
			getIsConsultCallIdentificationContainerVisible: function() {
				var isConsult = this.get("IsConsulting");
				if (isConsult !== true) {
					return false;
				}
				return this.isIdentificationContainerVisible("IdentifiedConsultSubscribersCount",
					"IdentifiedConsultSubscriberKey");
			},

			/**
			 * Определяет, отображаются ли результаты идентификации абонента в зависимости от количества найденных по
			 * номеру абонентов и есть ли среди них идентифицированный абонент.
			 * @protected
			 * @param {String} subscribersCountPropertyName Название свойства, где хранится количество
			 * идентифицированных абонентов.
			 * @param {String} subscriberKeyPropertyName Название свойства, где хранится идентификатор
			 * идентифицированного абонента.
			 * @returns {Boolean} Результаты идентификации абонента видимы.
			 */
			isIdentificationContainerVisible: function(subscribersCountPropertyName, subscriberKeyPropertyName) {
				var identifiedSubscriberKey = this.get(subscriberKeyPropertyName);
				if (identifiedSubscriberKey) {
					return false;
				}
				var subscribersCount = this.get(subscribersCountPropertyName);
				var canNotMakeAnyCalls = !this.getCanMakeCallOrMakeConsultCall();
				return (subscribersCount > 0) && canNotMakeAnyCalls;
			},

			/**
			 * Определяет, является ли строка поиска валидной для процесса поиска абонентов по первичному полю
			 * для отображения.
			 * @param {String} searchString Строка поиска.
			 * @return {Boolean} Строка поиска валидна.
			 * @protected
			 */
			isSearchValueValid: function(searchString) {
				if (searchString.replace(/_|%/g, "").length < CtiConstants.IdentificationMinSymbolCount) {
					return false;
				}
				var regExp = /[^&]+/;
				var match = searchString.match(regExp);
				var isValid = !Ext.isEmpty(match) && (match.length === 1) && (match[0] === searchString);
				return isValid;
			},

			/**
			 * Определяет, является ли значение корректным номером телефона.
			 * @param {String} value Значение для проверки.
			 * @returns {Boolean} true, если значение ялвяется корректным номером телефона, иначе - false.
			 */
			isPhoneNumberValid: function(value) {
				if (!value) {
					return false;
				}
				var regExp = /[\d\s\(\)\+\-\*#]+/;
				var match = value.match(regExp);
				return match && (match.length === 1) && (match[0] === value);
			},

			/**
			 * Находит и возвращает панель идентифицированного абонента из коллекции идентифицированных абонентов.
			 * @param {String} collectionName (optional) Название коллекции идентифицированных абонентов.
			 * @param {String} subscriberKeyName (optional) Название свойства с ключом идентифицированного абонента.
			 * @returns {Object} Модель представления панели идентифицированного абонента.
			 */
			getIdentifiedSubscriberPanel: function(collectionName, subscriberKeyName) {
				var identifiedSubscriberKey = this.get(subscriberKeyName || "IdentifiedSubscriberKey");
				if (!identifiedSubscriberKey) {
					return null;
				}
				var panelCollection = this.get(collectionName || "IdentifiedSubscriberPanelCollection");
				return panelCollection.find(identifiedSubscriberKey);
			},

			/**
			 * Возвращает коллекцию полей для обновления звонка по идентифицированному абоненту.
			 * @param {String} subscribersCollectionName Название коллекции панелей идентифицированных абонентов.
			 * @param {String} subscriberId Идентификатор абонента.
			 * @returns {Terrasoft.Collection} Коллекция полей для обновления.
			 */
			getCallFieldValuesBySubscriber: function(subscribersCollectionName, subscriberId) {
				var updateFields = new Terrasoft.Collection();
				var contactId, accountId;
				var subscriberPanelCollection = this.get(subscribersCollectionName);
				var subscriberPanel = subscriberPanelCollection.find(subscriberId);
				if (subscriberPanel) {
					var subscriberType = subscriberPanel.get("Type");
					switch (subscriberType) {
						case CtiConstants.SubscriberTypes.Account:
							accountId = subscriberId;
							break;
						case CtiConstants.SubscriberTypes.Contact:
						case CtiConstants.SubscriberTypes.Employee:
							contactId = subscriberId;
							break;
						default:
							return updateFields;
					}
				}
				updateFields.add("Account", {
					name: "Account",
					value: accountId,
					type: Terrasoft.DataValueType.GUID
				});
				updateFields.add("Contact", {
					name: "Contact",
					value: contactId,
					type: Terrasoft.DataValueType.GUID
				});
				return updateFields;
			}

			//endregion

		});
	});
