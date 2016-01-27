define("CtiPanelCommunicationHistoryUtilities", ["CtiPanelResources", "CtiConstants", "ConfigurationConstants"],
	function(resources, CtiConstants, ConfigurationConstants) {

		/**
		 * @class Terrasoft.configuration.mixins.CtiPanelCommunicationHistoryUtilities
		 * Миксин истории звонков.
		 * @type {Terrasoft.BaseObject}
		 */
		Ext.define("Terrasoft.configuration.mixins.CtiPanelCommunicationHistoryUtilities", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.CtiPanelCommunicationHistoryUtilities",

			//region Methods: Private

			/**
			 * Загружает коллекцию панелей истории звонков.
			 * @private
			 */
			loadCommunicationHistory: function() {
				this.queryCommunicationHistory(function(response) {
					if (!(response && response.success)) {
						var panelCollection = this.get("CommunicationHistoryPanelCollection");
						panelCollection.clear();
						return;
					}
					this.fillCommunicationHistoryPanelCollection(response.collection);
				}.bind(this));
			},

			/**
			 * Формирует коллекцию панелей истории звонков.
			 * @private
			 * @param {Function} callback Функция обратного вызова.
			 */
			queryCommunicationHistory: function(callback) {
				var esq = this.getCommunicationHistoryQuery();
				esq.execute(callback);
			},

			/**
			 * Возвращает запрос истории звонков.
			 * @private
			 * @returns {Terrasoft.EntitySchemaQuery} Запрос истории звонков.
			 */
			getCommunicationHistoryQuery: function() {
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "VwRecentCall"});
				var ctiSettings = this.get("CtiSettings");
				esq.rowCount = ctiSettings.communicationHistoryRowCount;
				esq.addColumn("Id");
				var dateColumn = esq.addColumn("CallDate");
				dateColumn.orderPosition = 0;
				dateColumn.orderDirection = Terrasoft.OrderDirection.DESC;
				esq.addColumn("Contact");
				esq.addColumn("ContactPhoto");
				esq.addColumn("ContactAccount");
				esq.addColumn("ContactDepartment");
				esq.addColumn("ContactJob");
				esq.addColumn("ContactType");
				esq.addColumn("Account");
				esq.addColumn("AccountType");
				esq.addColumn("AccountCity");
				esq.addColumn("Direction");
				esq.addColumn("CallerId");
				esq.addColumn("CalledId");
				esq.addColumn("TalkTime");
				esq.addColumn("EndDate");
				esq.filters.add("CurrentUserFilter", esq.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "CreatedBy", Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
				return esq;
			},

			/**
			 * Заполняет коллекцию истории звонков.
			 * @private
			 * @param {Object[]} queryResultHistorySubscribers Массив объектов истории звонков.
			 */
			fillCommunicationHistoryPanelCollection: function(queryResultHistorySubscribers) {
				var tempCollection = this.Ext.create("Terrasoft.Collection");
				queryResultHistorySubscribers.each(function(queryResultHistorySubscriber) {
					var panelConfig = this.getHistoryPanelConfig(queryResultHistorySubscriber);
					var subscriberPanel = this.createPanelViewModel(panelConfig,
							this.communicationHistoryPanelViewModelClass);
					tempCollection.add(queryResultHistorySubscriber.get("Id"), subscriberPanel);
				}, this);
				var panelCollection = this.get("CommunicationHistoryPanelCollection");
				panelCollection.clear();
				panelCollection.loadAll(tempCollection);
			},

			/**
			 * Возвращает конфигурационный объект для создания модели представления панели истории звонков.
			 * @protected
			 * @param {Object} historySubscriber Информация по абоненту.
			 * @returns {Object} Конфигурационный объект для создания модели представления панели истории звонков.
			 */
			getHistoryPanelConfig: function(historySubscriber) {
				var callDirection = historySubscriber.get("Direction").value;
				var isOutgoingCall = (callDirection === Terrasoft.CallDirection.OUT);
				var number = isOutgoingCall ? historySubscriber.get("CalledId") : historySubscriber.get("CallerId");
				var callType;
				if (isOutgoingCall) {
					callType = CtiConstants.CallType.OUTGOING;
				} else {
					callType = historySubscriber.get("EndDate") && (historySubscriber.get("TalkTime") === 0)
						? CtiConstants.CallType.MISSED
						: CtiConstants.CallType.INCOMING;
				}
				var panelConfig = {
					CallDate: this.getCallDateString(historySubscriber.get("CallDate")),
					Number: number,
					CallType: callType
				};
				var queryResultContact = historySubscriber.get("Contact");
				var queryResultAccount = historySubscriber.get("Account");
				if (queryResultContact) {
					Ext.apply(panelConfig, {
						Id: queryResultContact.value,
						Name: queryResultContact.displayValue,
						Photo: historySubscriber.get("ContactPhoto").value
					});
					var contactType = historySubscriber.get("ContactType").value;
					var isEmployee = (contactType === ConfigurationConstants.ContactType.Employee);
					if (isEmployee) {
						this.applyEmployeeHistoryPanelConfig(panelConfig, historySubscriber);
					} else {
						this.applyContactHistoryPanelConfig(panelConfig, historySubscriber);
					}
				} else if (queryResultAccount) {
					this.applyAccountHistoryPanelConfig(panelConfig, historySubscriber, queryResultAccount);
				} else {
					this.applyUndefinedSubscriberValues(panelConfig, historySubscriber, number);
				}
				return panelConfig;
			},

			/**
			 * Формирует конфигурационный объект абонента с типом "Контакт".
			 * @protected
			 * @param {Object} panelConfig Конфигурационный объект для создания модели представления панели истории
			 * звонков.
			 * @param {Object} historySubscriber Информация по абоненту.
			 * */
			applyContactHistoryPanelConfig: function(panelConfig, historySubscriber) {
				Ext.apply(panelConfig, {
					Type: CtiConstants.SubscriberTypes.Contact
				});
				var fields = ["ContactAccount", "ContactJob"];
				this.applyHistoryPanelConfig(panelConfig, historySubscriber, fields);
			},

			/**
			 * Формирует конфигурационный объект абонента с типом "Сотрудник".
			 * @protected
			 * @param {Object} panelConfig Конфигурационный объект для создания модели представления панели истории
			 * звонков.
			 * @param {Object} historySubscriber Информация по абоненту.
			 * */
			applyEmployeeHistoryPanelConfig: function(panelConfig, historySubscriber) {
				Ext.apply(panelConfig, {
					Type: CtiConstants.SubscriberTypes.Employee
				});
				var fields = ["ContactDepartment", "ContactJob"];
				this.applyHistoryPanelConfig(panelConfig, historySubscriber, fields);
			},

			/**
			 * Формирует конфигурационный объект абонента с типом "Контрагент".
			 * @protected
			 * @param {Object} panelConfig Конфигурационный объект для создания модели представления панели истории
			 * звонков.
			 * @param {Object} historySubscriber Информация по абоненту.
			 * @param {Object} queryResultAccount Информация по контрагенту.
			 */
			applyAccountHistoryPanelConfig: function(panelConfig, historySubscriber, queryResultAccount) {
				Ext.apply(panelConfig, {
					Id: queryResultAccount.value,
					Name: queryResultAccount.displayValue,
					Type: CtiConstants.SubscriberTypes.Account
				});
				var fields = ["AccountType", "AccountCity"];
				this.applyHistoryPanelConfig(panelConfig, historySubscriber, fields);
			},

			/**
			 * Применяет поля абонента к конфигурационному объекту для создания модели представления панели истории
			 * звонков.
			 * @protected
			 * @param {Object} panelConfig Конфигурационный объект для создания модели представления панели истории
			 * звонков.
			 * @param {Object} historySubscriber Информация по абоненту.
			 * @param {String[]} fields Поля абонента.
			 */
			applyHistoryPanelConfig: function(panelConfig, historySubscriber, fields) {
				var subscriberData = "";
				fields.forEach(function(field) {
					var fieldValue = historySubscriber.get(field);
					if (!fieldValue || !fieldValue.displayValue) {
						return true;
					}
					subscriberData += ", " + fieldValue.displayValue;
				});
				if (subscriberData) {
					Ext.apply(panelConfig, {
						SubscriberData: subscriberData.substring(2, subscriberData.length)
					});
				}
			},

			/**
			 * Применяет свойства неопределенного абонента к модели представления.
			 * @protected
			 * @param {Object} panelConfig Конфигурационный объект для создания модели представления панели истории
			 * звонков.
			 * @param {Object} historySubscriber Информация по абоненту.
			 * @param {String} number Номер абонента.
			 */
			applyUndefinedSubscriberValues: function(panelConfig, historySubscriber, number) {
				Ext.apply(panelConfig, {
					Id: historySubscriber.get("Id"),
					Name: number
				});
			},

			//endregion

			//region Methods: Private

			/**
			 * Формирует отображаемое значение даты звонка.
			 * @private
			 * @param {Date} callDate Дата звонка.
			 * @returns {String} Отображаемое значение даты звонка.
			 */
			getCallDateString: function(callDate) {
				if (Ext.isEmpty(callDate)) {
					return "";
				}
				var isTodayDate = (new Date().toDateString() === callDate.toDateString());
				var dateType = (isTodayDate) ? Terrasoft.DataValueType.TIME : Terrasoft.DataValueType.DATE_TIME;
				return Terrasoft.getTypedStringValue(callDate, dateType);
			}

			//endregion

		});
	});
