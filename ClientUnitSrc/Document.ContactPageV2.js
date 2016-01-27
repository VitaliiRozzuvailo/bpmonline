define("ContactPageV2", [],
	function() {
		return {
			entitySchemaName: "Contact",
			details: /**SCHEMA_DETAILS*/{
				Documents: {
					schemaName: "DocumentDetailV2",
					defaultValues: {
						Account: { masterColumn: "Account" }
					},
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
					"name": "Documents",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
