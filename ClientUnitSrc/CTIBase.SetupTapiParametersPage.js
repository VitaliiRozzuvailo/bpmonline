define("SetupTapiParametersPage", ["terrasoft", "SetupCallCenterUtilities"],
	function(Terrasoft, SetupCallCenterUtilities) {
		return {
			attributes: {

				/**
				 * Имя линии TAPI.
				 * @type {String}
				 */
				"Line": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"isRequired": true,
					"value": ""
				}
			},
			methods: {

				/**
				 * Возвращает объект конфигурации параметров телефонии.
				 * Ключи - названия атрибутов схемы, значения - параметры подключения.
				 * @private
				 * @returns {Object} Объект конфигурации параметров телефонии.
				 */
				getConnectionParamsConfig: function() {
					var baseConnectionParams = this.callParent();
					return Ext.merge(baseConnectionParams, {
						"Line": "Line"
					});
				}
			},
			diff: [
				{
					"operation": "insert",
					"parentName": "controlsContainer",
					"propertyName": "items",
					"name": "Line",
					"values": {
						"isRequired": true,
						"generator": "SetupCallCenterUtilities.generateTextEdit"
					}
				}
			]
		};
	});