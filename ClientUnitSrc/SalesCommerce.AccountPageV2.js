define("AccountPageV2", [],
		function() {
			return {
				entitySchemaName: "Account",
				details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "move",
						"parentName": "HistoryTabContainer",
						"propertyName": "items",
						"name": "Activities",
						"index": 0
					},
					{
						"operation": "move",
						"parentName": "HistoryTabContainer",
						"propertyName": "items",
						"name": "Contract",
						"index": 1
					},
					{
						"operation": "move",
						"parentName": "HistoryTabContainer",
						"propertyName": "items",
						"name": "Documents",
						"index": 4
					}
				]/**SCHEMA_DIFF*/
			}
		});

