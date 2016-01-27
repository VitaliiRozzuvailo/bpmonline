define("OrderPageV2", ["OrderPageV2Resources"],
	function() {
		return {
			entitySchemaName: "Order",
			details: /**SCHEMA_DETAILS*/{
				"Lead": {
					"schemaName": "LeadDetailV2",
					"entitySchemaName": "Lead",
					"filter": {
						"detailColumn": "Order",
						"masterColumn": "Id"
					},
					defaultValues: {
						QualifiedAccount: { masterColumn: "Account" },
						QualifiedContact: { masterColumn: "Contact" }
					}
				}
			}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "Lead",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					},
					"parentName": "OrderPageHistoryTabContainer",
					"propertyName": "items",
					"index": 0
				}
			]/**SCHEMA_DIFF*/,
			attributes: {},
			methods: {},
			rules: {},
			userCode: {}
		};
	});
