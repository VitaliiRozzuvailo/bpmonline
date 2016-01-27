define("UserPageV2", ["UserPageV2Resources", "ConfigurationConstants", "WebitelConfigurationConstants",
		"WebitelModuleHelper"],
	function(resources, ConfigurationConstants, WebitelConfigurationConstants, WebitelModuleHelper) {
		return {
			attributes: {
				/**
				 * Номер пользователя Webitel.
				 * @type {String}
				 */
				"WebitelNumber": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Признак сохранения пользователя Webitel.
				 * @type {Boolean}
				 */
				"IsWebitelUserCreated": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				}
			},
			methods: {

				/**
				 * Выполняет постобработку сохранения записи.
				 * @overridden
				 * @param {Object} response Объектное проедставление ответа сервера.
				 * @param {Object} config Конфигурационный объект.
				 * @param {Boolean} callParentOnSaved Признак выполнения постобработки сохранения записи
				 * только в родительской странице.
				 */
				onSaved: function(response, config, callParentOnSaved) {
					var connectionType = this.get("ConnectionType");
					var isConnected = Terrasoft.CtiModel.get("IsConnected");
					if (!this.isNewMode() || Ext.isEmpty(Ext.global.webitel) || callParentOnSaved || !isConnected ||
							connectionType !== ConfigurationConstants.SysAdminUnit.ConnectionType.AllEmployees) {
						this.callParent(arguments);
						return;
					}
					this.setWebitelNumber(this.onSaved.bind(this, response, config, true));
				},

				/**
				 * Формирует номер учетной записи Webitel.
				 * @private
				 * @param {Function} callback Функция обратного вызова.
				 */
				setWebitelNumber: function(callback) {
					var query = this.getContactInnerPhoneQuery();
					query.getEntityCollection(function(response) {
						if (!response.success) {
							callback();
							return;
						}
						if (!response.collection.isEmpty()) {
							var contactCommunication = response.collection.getByIndex(0);
							this.set("WebitelNumber", contactCommunication.get("Number"));
							this.createWebitelAccount(callback);
						} else {
							this.setLastWebitelNumber(callback);
						}
					}, this);
				},

				/**
				 * Формирует запрос для выборки номера средства связи контакта с типом "Внутренний телефон".
				 * @private
				 * @returns {Terrasoft.EntitySchemaQuery} Возвращает экземпляр EntitySchemaQuery.
				 */
				getContactInnerPhoneQuery: function() {
					var query = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "ContactCommunication"});
					query.addColumn("Number");
					query.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Contact", this.get("Contact").value));
					query.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"CommunicationType", ConfigurationConstants.CommunicationTypes.InnerPhone));
					return query;
				},

				/**
				 * Создает учетную запись Webitel.
				 * @private
				 * @param {Function} callback Функция обратного вызова.
				 */
				createWebitelAccount: function(callback) {
					var webitelNumber = this.get("WebitelNumber");
					Ext.global.webitel.userCreate("admin", webitelNumber, webitelNumber,
						WebitelModuleHelper.getHostName(), this.onWebitelAccountCreated.bind(this, callback));
				},

				/**
				 * Создает средство связи для созданного контакта.
				 * @private
				 * @param {Function} callback Функция обратного вызова.
				 */
				createContactCommunication: function(callback) {
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "ContactCommunication"
					});
					insert.setParameterValue("Contact", this.get("Contact").value, Terrasoft.DataValueType.GUID);
					var webitelNumber = this.get("WebitelNumber");
					insert.setParameterValue("Number", webitelNumber, Terrasoft.DataValueType.TEXT);
					insert.setParameterValue("CommunicationType", ConfigurationConstants.CommunicationTypes.InnerPhone,
						Terrasoft.DataValueType.GUID);
					insert.execute(callback, this);
				},

				/**
				 * Формирует новый номер учетной записи Webitel.
				 * @private
				 * @param {Function} callback Функция обратного вызова.
				 */
				setLastWebitelNumber: function(callback) {
					var requestConfig = {
						serviceName: "SysSettingsService",
						methodName: "GetIncrementValueVsMask",
						data: {
							sysSettingName: "WSysAccountLastNumber",
							sysSettingMaskName: "WSysAccountCodeMask"
						}
					};
					this.callService(requestConfig, function(response) {
						this.set("WebitelNumber", response.GetIncrementValueVsMaskResult);
						this.createContactCommunication(this.createWebitelAccount.bind(this, callback));
					}, this);
				},

				/**
				 * Проверяет результат добавления учетной записи Webitel.
				 * @private
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} result Результат добавления учетной записи Webitel.
				 */
				onWebitelAccountCreated: function(callback, result) {
					if (result.status !== Ext.global.WebitelCommandResponseTypes.Success) {
						var response = result.response;
						this.error(response);
						if (!response || (response.response !==
								WebitelConfigurationConstants.WebitelErrorCode.UserAlreadyExists)) {
							Terrasoft.utils.showInformation(resources.localizableStrings
								.WebitelUserErrorCreationMessage, callback);
							return;
						}
					}
					this.createWebitelUser(callback);
				},

				/**
				 * Создает в bpmonline пользователя Webitel.
				 * @param {Function} callback Функция обратного вызова.
				 * @private
				 */
				createWebitelUser: function(callback) {
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "WSysAccount"
					});
					insert.setParameterValue("Contact", this.get("Contact").value, Terrasoft.DataValueType.GUID);
					var webitelNumber = this.get("WebitelNumber");
					insert.setParameterValue("Login", webitelNumber, Terrasoft.DataValueType.TEXT);
					insert.setParameterValue("Password", webitelNumber, Terrasoft.DataValueType.TEXT);
					insert.setParameterValue("Role", WebitelConfigurationConstants.WSysAccountRole.Administrator,
						Terrasoft.DataValueType.GUID);
					insert.execute(callback, this);
				}
			},
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
		};
	});
