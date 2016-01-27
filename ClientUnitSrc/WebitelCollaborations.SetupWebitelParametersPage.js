define("SetupWebitelParametersPage", ["terrasoft"],
	function(Terrasoft) {
		return {
			attributes: {

				/**
				 * Автоподключение.
				 * @type {Boolean}
				 */
				"IsAutoLogin": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * Использователь Webitel CTI.
				 * @type {Boolean}
				 */
				"UseWebitelCti": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * Использовать Web телефон.
				 * @type {Boolean}
				 */
				"UseWebPhone": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": true
				},

				/**
				 * Использовать видео.
				 * @type {Boolean}
				 */
				"UseVideo": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				}
			},
			methods: {

				/**
				 * @inheritdoc BaseSetupTelephonyParametersPage#init
				 * @overridden
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.on("change:UseWebPhone", this.onUseWebPhoneChanged);
						callback.call(scope || this);
					}, this]);
				},

				/**
				 * Обрабатывает изменение значения поля "Использовать Web телефон".
				 * @param {Backbone.Model} model Модель.
				 * @param {Boolean} useWebPhone Значение поля "Использовать Web телефон".
				 */
				onUseWebPhoneChanged: function(model, useWebPhone) {
					if (!useWebPhone) {
						this.set("UseVideo", false);
					}
				},

				/**
				 * @inheritdoc BaseSetupTelephonyParametersPage#getConnectionParamsConfig
				 * @overridden
				 */
				getConnectionParamsConfig: function() {
					var baseConnectionParams = this.callParent();
					return Ext.merge(baseConnectionParams, {
						"IsAutoLogin": "isAutoLogin",
						"UseWebitelCti": "useWebitelCti",
						"UseWebPhone": "useWebPhone",
						"UseVideo": "useVideo"
					});
				}
			},
			diff: [
				{
					"operation": "insert",
					"parentName": "controlsContainerBottom",
					"propertyName": "items",
					"name": "IsAutoLogin",
					"values": {
						"generator": "SetupCallCenterUtilities.generateBottomCheckBoxControl"
					}
				},
				{
					"operation": "insert",
					"parentName": "controlsContainerBottom",
					"propertyName": "items",
					"name": "UseWebitelCti",
					"values": {
						"generator": "SetupCallCenterUtilities.generateBottomCheckBoxControl",
						"visible": false
					}
				},
				{
					"operation": "insert",
					"parentName": "controlsContainerBottom",
					"propertyName": "items",
					"name": "UseWebPhone",
					"values": {
						"generator": "SetupCallCenterUtilities.generateBottomCheckBoxControl"
					}
				},
				{
					"operation": "insert",
					"parentName": "controlsContainerBottom",
					"propertyName": "items",
					"name": "UseVideo",
					"values": {
						"generator": "SetupCallCenterUtilities.generateBottomCheckBoxControl",
						"visible": true,
						"enabled": {"bindTo": "UseWebPhone"}
					}
				}
			]
		};
	});