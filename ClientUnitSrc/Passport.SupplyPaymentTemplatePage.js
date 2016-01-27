define("SupplyPaymentTemplatePage", ["SupplyPaymentTemplatePageResources", "GeneralDetails"],
	function() {
		return {
			entitySchemaName: "SupplyPaymentTemplate",
			details: /**SCHEMA_DETAILS*/{
				SupplyPaymentTemplate: {
					schemaName: "SupplyPaymentTemplateItemDetailV2",
					entitySchemaName: "SupplyPaymentTemplateItem",
					filter: {
						masterColumn: "Id",
						detailColumn: "SupplyPaymentTemplate"
					}
				}
			}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "remove",
					"name": "ESNTab"
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Name",
					"values": {"layout": {"column": 0, "row": 0, "colSpan": 24}}
				},
				{
					"operation": "insert",
					"name": "GeneralInfoTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 0,
					"values": {
						"caption": {"bindTo": "Resources.Strings.GeneralInfoTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoTab",
					"name": "SupplyPaymentTemplatePageGeneralTabContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "SupplyPaymentTemplatePageGeneralTabContainer",
					"propertyName": "items",
					"name": "SupplyPaymentTemplate",
					"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
				}
			]/**SCHEMA_DIFF*/,
			attributes: {},
			methods: {
				/**
				 * @inheritdoc Terrasoft.BasePageV2#initActionButtonMenu
				 * @overridden
				 */
				initActionButtonMenu: this.Terrasoft.emptyFn
			}
		};
	});
