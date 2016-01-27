define("SubscriberCommunicationItem", ["terrasoft"],
	function(Terrasoft) {
		return {
			attributes: {

				/**
				 * Идентификатор средства связи.
				 * @private
				 * @type {String}
				 */
				"Id": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Тип средства связи.
				 * @private
				 * @type {String}
				 */
				"Type": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Номер абонента.
				 * @private
				 * @type {String}
				 */
				"Number": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Идентификатор абонента.
				 * @private
				 * @type {String}
				 */
				"SubscriberId": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Объект CTI модели.
				 * @private
				 * @type {Terrasoft.CtiModel}
				 */
				"CtiModel": {
					"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": null
				}

			},
			methods: {

				/**
				 * Совершает звонок по данному средству связи.
				 * @protected
				 */
				makeCall: function() {
					var ctiModel = this.get("CtiModel");
					ctiModel.set("AdvisedIdentifiedSubscriber", this.get("SubscriberId"));
					var number = this.get("Number");
					ctiModel.callByNumber(number);
				}

			},
			diff: [
				{
					"operation": "insert",
					"name": "CommunicationContainer",
					"values": {
						"id": "CommunicationContainer",
						"selectors": {"wrapEl": "#CommunicationContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"markerValue": {"bindTo": "Type"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "CommunicationTypeLabel",
					"parentName": "CommunicationContainer",
					"propertyName": "items",
					"values": {
						"id": "CommunicationTypeLabel",
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["label-caption"]},
						"markerValue": {"bindTo": "Type"},
						"caption": {"bindTo": "Type"}
					}
				},
				{
					"operation": "insert",
					"name": "Number",
					"parentName": "CommunicationContainer",
					"propertyName": "items",
					"values": {
						"id": "Number",
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {"labelClass": ["communication-number"]},
						"markerValue": {"bindTo": "Number"},
						"caption": {"bindTo": "Number"}
					}
				},
				{
					"operation": "insert",
					"name": "CallButton",
					"parentName": "CommunicationContainer",
					"propertyName": "items",
					"values": {
						"id": "CallButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "Resources.Images.MakeCallButtonIcon"},
						"classes": {"wrapperClass": "communication-call-button"},
						"markerValue": {"bindTo": "Number"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"click": {"bindTo": "makeCall"}
					}
				}
			]
		};
	});