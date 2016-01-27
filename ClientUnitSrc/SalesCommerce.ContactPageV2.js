define("ContactPageV2", [],
		function() {
			return {
				entitySchemaName: "Contact",
				details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "move",
						"parentName": "HistoryTab",
						"propertyName": "items",
						"name": "Activities",
						"index": 0
					},
					{
						"operation": "move",
						"parentName": "HistoryTab",
						"propertyName": "items",
						"name": "Contract",
						"index": 1
					},
					{
						"operation": "move",
						"parentName": "HistoryTab",
						"propertyName": "items",
						"name": "Documents",
						"index": 4
					}
				]/**SCHEMA_DIFF*/
			};
		});