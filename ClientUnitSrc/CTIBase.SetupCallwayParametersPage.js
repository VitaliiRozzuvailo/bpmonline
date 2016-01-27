define("SetupCallwayParametersPage", ["terrasoft", "SetupCallCenterUtilities"],
	function(Terrasoft, SetupCallCenterUtilities) {
		return {
			attributes: {

				/**
				 * Внутренний номер оператора.
				 * @type {String}
				 */
				"OperatorId": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"isRequired": true,
					"value": ""
				},

				/**
				 * Признак, определяющий использовать ли внутренний клиент CallWay.
				 * @type {Boolean}
				 */
				"IsCallwayClient": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * Правило исходящего набора.
				 * @type {String}
				 */
				"RoutingRule": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
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
						"OperatorId": "operatorId",
						"IsCallwayClient": "isCallwayClient",
						"RoutingRule": "routingRule"
					});
				}
			},
			diff: [
				{
					"operation": "insert",
					"parentName": "controlsContainer",
					"propertyName": "items",
					"name": "OperatorId",
					"values": {
						"isRequired": true,
						"generator": "SetupCallCenterUtilities.generateTextEdit"
					}
				},
				{
					"operation": "insert",
					"index": 0,
					"parentName": "controlsContainerBottom",
					"propertyName": "items",
					"name": "IsCallwayClient",
					"values": {
						"generator": "SetupCallCenterUtilities.generateBottomCheckBoxControl"
					}
				},
				{
					"operation": "insert",
					"parentName": "controlsContainer",
					"propertyName": "items",
					"name": "RoutingRule",
					"values": {
						"generator": "SetupCallCenterUtilities.generateTextEdit"
					}
				}
			]
		};
	});