define("ContactPageV2", [],
	function() {
		return {
			entitySchemaName: "Contact",
			details: /**SCHEMA_DETAILS*/{
				Order: {
					schemaName: "OrderDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "Contact"
					}
				}
			}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "HistoryTab",
					"propertyName": "items",
					"name": "Order",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});