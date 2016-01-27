define("PreconfiguredEntityPageV2", ["CustomProcessPageV2Utilities"],
	/**
	 * @class Terrasoft.configuration.PreconfiguredEntityPageV2
	 * Пример преднастроенной страницы c EntitySchema по процессу
	 */
	function() {
		return {
			mixins: {
				BaseProcessViewModel: "Terrasoft.CustomProcessPageV2Utilities"
			},
			attributes: {
				"SomeCalcField": {
					name: "CalcField",
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"TextParameter1": { dataValueType: Terrasoft.DataValueType.TEXT },
				"LookupParameter1": { dataValueType: Terrasoft.DataValueType.LOOKUP }
			},
			rules: {},
			details: /**SCHEMA_DETAILS*/{
				Activities: {
					schemaName: "ActivityDetailV2",
					filter: {
						masterColumn: "LookupParameter1",
						detailColumn: "Contact"
					},
					subscriber: function() {
					}
				}
			}/**SCHEMA_DETAILS*/,
			methods: {
				/**
				 * @overridden
				 */
				onEntityInitialized: function() {
					this.callParent();
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
				 * @param {Object} args Параметры
				 * @param {Object} tag Тег
				 */
				loadVocabulary: function(args, tag) {
					args.schemaName = this.model.attributes[tag].referenceSchemaName;
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
				}
			},
			diff: /**SCHEMA_DIFF*/[
/*				{
					"operation": "remove",
					"name": "Tabs"
				},*/
				{
					"operation": "merge",
					"name": "ActionButtonsContainer",
					"values": {
						visible: true
					}
				},
				{
					"operation": "merge",
					"name": "actions",
					"values": {
						visible: false
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "NextButton",
					"values": {
						caption: "NextButton",
						itemType: Terrasoft.ViewItemType.BUTTON,
						classes: {textClass: "actions-button-margin-right"},
						style: Terrasoft.controls.ButtonEnums.style.GREEN,
						click: {bindTo: "onNextButtonClick"}
					}
				},
				/*{
					"operation": "insert",
					"name": "GeneralInfoTab",
					"parentName": "CardContentContainer",
					"propertyName": "items",
					"values": {
						itemType: Terrasoft.ViewItemType.CONTAINER,
						items: []
					}
				},*/
				{
					"operation": "insert",
					"parentName": "GeneralInfoTab",
					"name": "GeneralInfoControlGroup",
					"propertyName": "items",
					"values": {
						itemType: Terrasoft.ViewItemType.CONTROL_GROUP,
						items: [],
						controlConfig: {
							collapsed: false
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoControlGroup",
					"propertyName": "items",
					"name": "GeneralInfoBlock",
					"values": {
						itemType: Terrasoft.ViewItemType.GRID_LAYOUT,
						items: []
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoBlock",
					"propertyName": "items",
					"name": "TextParameter1",
					"values": {
						caption: "TextParameter1",
						contentType: Terrasoft.ContentType.TEXT,
						bindTo: "TextParameter1",
						layout: {column: 0, row: 0, colSpan: 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoBlock",
					"propertyName": "items",
					"name": "LookupParameter1",
					"values": {
						caption: "LookupParameter1",
						contentType: Terrasoft.ContentType.LOOKUP,
						bindTo: "LookupParameter1",
						layout: {column: 0, row: 1, colSpan: 12}
					}
				}
			]/**SCHEMA_DIFF*/,
			userCode: {}
		};
	});