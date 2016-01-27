define("SetupOktellParametersPage", ["terrasoft", "SetupCallCenterUtilities"],
	function(Terrasoft, SetupCallCenterUtilities) {
		return {
			attributes: {

				/**
				 * Адрес сервера Oktell.
				 * @type {String}
				 */
				"OktellServerAddress": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"isRequired": true,
					"value": ""
				},

				/**
				 * Логин.
				 * @type {String}
				 */
				"Login": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"isRequired": true,
					"value": ""
				},

				/**
				 * Пароль.
				 * @type {String}
				 */
				"Password": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"isRequired": true,
					"value": ""
				},

				/**
				 * Признак, определяющий отключена ли постобработка звонков.
				 * @type {Boolean}
				 */
				"IsSipAutoAnswerHeaderSupported": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				}
			},
			methods: {

				/**
				 * Возвращает объект конфигурации параметров телефонии.
				 * Ключи - названия атрибутов схемы, значения - параметры подключения.
				 * @protected
				 * @overridden
				 * @returns {Object} Объект конфигурации параметров телефонии.
				 */
				getConnectionParamsConfig: function() {
					var baseConnectionParams = this.callParent();
					return Ext.merge(baseConnectionParams, {
						"OktellServerAddress": "url",
						"Login": "login",
						"Password": "password",
						"IsSipAutoAnswerHeaderSupported": "isSipAutoAnswerHeaderSupported"
					});
				}
			},
			diff: [
				{
					"operation": "insert",
					"index": 1,
					"parentName": "controlsContainerBottom",
					"propertyName": "items",
					"name": "IsSipAutoAnswerHeaderSupported",
					"values": {
						"hint": "Resources.Strings.IsSipAutoAnswerHeaderSupportedHint",
						"generator": "SetupCallCenterUtilities.generateBottomCheckBoxControl"
					}
				},
				{
					"operation": "insert",
					"parentName": "controlsContainer",
					"propertyName": "items",
					"name": "OktellServerAddress",
					"values": {
						"isRequired": true,
						"generator": "SetupCallCenterUtilities.generateTextEdit"
					}
				},
				{
					"operation": "insert",
					"parentName": "controlsContainer",
					"propertyName": "items",
					"name": "Login",
					"values": {
						"isRequired": true,
						"generator": "SetupCallCenterUtilities.generateTextEdit"
					}
				},
				{
					"operation": "insert",
					"parentName": "controlsContainer",
					"propertyName": "items",
					"name": "Password",
					"values": {
						"protect": true,
						"isRequired": true,
						"generator": "SetupCallCenterUtilities.generateTextEdit"
					}
				}
			]
		};
	});