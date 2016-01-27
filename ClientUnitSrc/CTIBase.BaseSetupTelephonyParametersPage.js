define("BaseSetupTelephonyParametersPage", ["terrasoft", "ServiceHelper", "SetupCallCenterUtilities"],
	function(Terrasoft, ServiceHelper) {
		return {
			messages: {
				"BackHistoryState": {
					"mode": Terrasoft.MessageMode.BROADCAST,
					"direction": Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			attributes: {

				/**
				 * Объект конфигурации параметров телефонии.
				 * Ключи - названия атрибутов схемы, значения - параметры подключения.
				 * @protected
				 * @type {Object}
				 */
				"connectionParamsConfig": {
					"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": null
				},

				/**
				 * Уникальный идентификатор текущей библиотеки обмена сообщениями.
				 * @type {String}
				 */
				"sysMsgLibId": {
					"dataValueType": Terrasoft.DataValueType.GUID,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": Terrasoft.SysValue.CTI.sysMsgLibId
				},

				/**
				 * Уникальный идентификатор текущих настроек пользователя.
				 * @type {String}
				 */
				"sysMsgUserSettingsId": {
					"dataValueType": Terrasoft.DataValueType.GUID,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Признак, определяющий включен ли режим отладки.
				 * @type {Boolean}
				 */
				"DebugMode": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * Признак, определяющий отключена ли телефония.
				 * @type {Boolean}
				 */
				"DisableCallCentre": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * Признак, определяющий зашифрован ли пароль.
				 * @type {Boolean}
				 */
				"IsPasswordEncrypted": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": true
				},

				/**
				 * Название колонки пароля настроек подключения телефонии.
				 * @type {Boolean}
				 */
				"PasswordColumnName": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				}
			},
			methods: {

				/**
				 * Инициализирует начальные значения модели.
				 * @protected
				 * @overridden
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.set("connectionParamsConfig", this.getConnectionParamsConfig());
						this.loadConnectionParams(function() {
							this.subscribePasswordChanged();
							callback.call(scope || this);
						}.bind(this), this);
					}.bind(this), this]);
				},

				/**
				 * Подписывается на изменение пароля настроек подключения телефонии.
				 * @private
				 */
				subscribePasswordChanged: function() {
					var passwordColumnName = this.get("PasswordColumnName");
					if (!Ext.isEmpty(passwordColumnName)) {
						this.on("change:" + passwordColumnName, function() {
							this.set("IsPasswordEncrypted", false);
							this.un("change:" + passwordColumnName, null, this);
						}, this);
					}
				},

				/**
				 * Шифрует пароль подключения телефонии пользователя.
				 * @param {String} password Пароль подключения телефонии пользователя.
				 * @param {Function} callback Функция обратного вызова.
				 * @private
				 */
				encryptPassword: function(password, callback) {
					var serviceOptions = {
						password: password
					};
					ServiceHelper.callService("CryptographicService", "GetConvertedPasswordValue", function(response) {
						callback.call(this, response.GetConvertedPasswordValueResult);
					}, serviceOptions);
				},

				/**
				 * Загружает параметры телефонии в соответствующие поля схемы.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope (optional) Контекст вызова функции обратного вызова.
				 * @private
				 */
				loadConnectionParams: function(callback, scope) {
					var sysMsgLibId = this.get("sysMsgLibId");
					if (Ext.isEmpty(sysMsgLibId)) {
						callback(scope || this);
						return;
					}
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "SysMsgUserSettings"});
					esq.addColumn("ConnectionParams");
					esq.filters.add("filterCurrentUserParams", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "User", Terrasoft.SysValue.CURRENT_USER.value));
					esq.filters.add("filterCurrentCallCentre", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "SysMsgLib", sysMsgLibId));
					esq.getEntityCollection(function(result) {
						if (!result.success) {
							callback(scope || this);
							return;
						}
						var entities = result.collection;
						if (entities.isEmpty()) {
							callback(scope || this);
							return;
						}
						var entity = entities.getByIndex(0);
						this.set("sysMsgUserSettingsId", entity.get("Id"));
						var entityConnectionParams = entity.get("ConnectionParams");
						if (!Ext.isEmpty(entityConnectionParams)) {
							try {
								var connectionParams = Terrasoft.decode(entityConnectionParams);
							} catch (e) {
								this.error(e);
							}
							if (!Ext.isEmpty(connectionParams)) {
								var connectionParamsConfig = this.get("connectionParamsConfig");
								Terrasoft.each(connectionParamsConfig, function(paramName, attributeName) {
									var paramValue = connectionParams[paramName];
									if (Ext.isEmpty(paramValue)) {
										return;
									}
									this.set(attributeName, paramValue);
								}.bind(this));
							}
						}
						callback(scope || this);
					}.bind(this));
				},

				/**
				 * Возвращает объект конфигурации параметров телефонии.
				 * Ключи - названия атрибутов схемы, значения - параметры подключения.
				 * @protected
				 * @returns {Object} Объект конфигурации параметров телефонии.
				 */
				getConnectionParamsConfig: function() {
					return {
						"DebugMode": "debugMode",
						"DisableCallCentre": "disableCallCentre"
					};
				},

				/**
				 * Обрабатывает нажатие на кнопку "Сохранить"
				 * @private
				 */
				saveButtonClick: function() {
					var isPasswordEncrypted = this.get("IsPasswordEncrypted");
					var passwordColumnName = this.get("PasswordColumnName");
					if (!isPasswordEncrypted && !Ext.isEmpty(passwordColumnName)) {
						var password = this.get(passwordColumnName);
						this.encryptPassword(password, function(encryptedPassword) {
							this.set(passwordColumnName, encryptedPassword);
							this.saveSysMsgUserSettings();
						}.bind(this));
					} else {
						this.saveSysMsgUserSettings();
					}
				},

				/**
				 * Сохраняет настройки подключения телефонии пользователя.
				 * @private
				 */
				saveSysMsgUserSettings: function() {
					if (!this.get("DisableCallCentre") && !this.validate()) {
						this.showInformationDialog(this.getValidationMessage());
						return;
					}
					var query;
					var settingsId = this.get("sysMsgUserSettingsId");
					var sysMsgLibId = this.get("sysMsgLibId");
					if (!Ext.isEmpty(settingsId)) {
						query = Ext.create("Terrasoft.UpdateQuery", {rootSchemaName: "SysMsgUserSettings"});
						query.enablePrimaryColumnFilter(settingsId);
					} else {
						query = Ext.create("Terrasoft.InsertQuery", {rootSchemaName: "SysMsgUserSettings"});
						query.setParameterValue("User", Terrasoft.SysValue.CURRENT_USER.value,
							Terrasoft.DataValueType.GUID);
					}
					query.setParameterValue("SysMsgLib", sysMsgLibId, Terrasoft.DataValueType.GUID);
					var connectionParams = {};
					var connectionParamsConfig = this.get("connectionParamsConfig");
					Terrasoft.each(connectionParamsConfig, function(paramName, attributeName) {
						var attributeValue = this.get(attributeName);
						connectionParams[paramName] = Ext.isEmpty(attributeValue) ? "" : attributeValue;
					}.bind(this));
					query.setParameterValue("ConnectionParams", Terrasoft.encode(connectionParams),
						Terrasoft.DataValueType.TEXT);
					query.execute(this.goBack, this);
				},

				/**
				 * Обрабатывает нажатие на кнопку "Отмена".
				 * @private
				 */
				cancelButtonClick: function() {
					this.goBack();
				},

				/**
				 * Возвращает пользователя на предыдущий модуль.
				 * @private
				 */
				goBack: function() {
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * Просматривает информацию валидации и возвращает на ее основе сообщение для пользователя.
				 * @private
				 * @return {String} Сообщения для пользователя.
				 */
				getValidationMessage: function() {
					var invalidColumns = [];
					var messageTemplate = this.get("Resources.Strings.FieldValidationError");
					var invalidMessage = "";
					Terrasoft.each(this.validationInfo.attributes, function(attribute, attributeName) {
						if (!attribute.isValid) {
							invalidColumns.push(attributeName);
							invalidMessage = attribute.invalidMessage;
							return false;
						}
					});
					if (invalidColumns.length) {
						var columnName = invalidColumns[0];
						var invalidColumn = this.getColumnByName(columnName);
						var invalidColumnCaption = this.get("Resources.Strings." + columnName + "Caption");
						var columnCaption = invalidColumn && invalidColumnCaption
							? invalidColumnCaption
							: columnName;
						return Ext.String.format(messageTemplate, columnCaption, invalidMessage);
					}
				}
			},
			diff: [
				{
					"operation": "insert",
					"name": "setupCallCentreParametersContainer",
					"propertyName": "items",
					"values": {
						"id": "setupCallCentreParametersContainer",
						"selectors": {
							"el": "#setupCallCentreParametersContainer",
							"wrapEl": "#setupCallCentreParametersContainer"
						},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["setup-call-centre-parameters-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "topSettings",
					"parentName": "setupCallCentreParametersContainer",
					"propertyName": "items",
					"values": {
						"id": "topSettings",
						"selectors": {"wrapEl": "#topSettings"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["top-settings-container"],
						"items": [
							{
								"id": "SaveButton",
								"markerValue": "SaveButton",
								"itemType": Terrasoft.ViewItemType.BUTTON,
								"click": {"bindTo": "saveButtonClick"},
								"caption": {"bindTo": "Resources.Strings.SaveButtonCaption"},
								"selectors": {"wrapEl": "#rightPanelCloseButton"},
								"style": Terrasoft.controls.ButtonEnums.style.GREEN,
								"tag": "save"
							},
							{
								"id": "CancelButton",
								"markerValue": "CancelButton",
								"itemType": Terrasoft.ViewItemType.BUTTON,
								"click": {"bindTo": "cancelButtonClick"},
								"caption": {"bindTo": "Resources.Strings.CancelButtonCaption"},
								"classes": {"textClass": ["cancel-button"]},
								"selectors": {"wrapEl": "#rightPanelCloseButton"},
								"style": Terrasoft.controls.ButtonEnums.style.DEFAULT,
								"tag": "CancelButton"
							}
						]
					}
				},
				{
					"operation": "insert",
					"name": "controlsContainerTop",
					"parentName": "setupCallCentreParametersContainer",
					"propertyName": "items",
					"values": {
						"id": "controlsContainerTop",
						"selectors": {"wrapEl": "#controlsContainerTop"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["controls-container-top"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "controlsContainer",
					"parentName": "setupCallCentreParametersContainer",
					"propertyName": "items",
					"values": {
						"id": "controlsContainer",
						"selectors": {"wrapEl": "#controlsContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["controls-block-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "controlsContainerRight",
					"parentName": "setupCallCentreParametersContainer",
					"propertyName": "items",
					"values": {
						"id": "controlsContainerRight",
						"selectors": {"wrapEl": "#controlsContainerRight"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["controls-container-right"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "controlsContainerBottom",
					"parentName": "setupCallCentreParametersContainer",
					"propertyName": "items",
					"values": {
						"id": "controlsContainerBottom",
						"selectors": {"wrapEl": "#controlsContainerBottom"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["controls-container-bottom"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "controlsContainerTop",
					"propertyName": "items",
					"name": "DisableCallCentre",
					"values": {
						"generator": "SetupCallCenterUtilities.generateBottomCheckBoxControl"
					}
				},
				{
					"operation": "insert",
					"parentName": "controlsContainerBottom",
					"propertyName": "items",
					"name": "DebugMode",
					"values": {
						"generator": "SetupCallCenterUtilities.generateBottomCheckBoxControl"
					}
				}
			]
		};
	});
