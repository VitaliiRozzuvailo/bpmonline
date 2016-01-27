define("BaseAnniversaryPageV2", [], function() {
	return {
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "actions",
				"values": {
					"visible": false
				}
			},
			{
				"operation": "merge",
				"name": "Tabs",
				"values": {
					"visible": false
				}
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"name": "AnniversaryType",
				"values": {
					"contentType": Terrasoft.ContentType.ENUM,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"name": "Date",
				"values": {
					"layout": {
						"column": 0,
						"row": 1,
						"colSpan": 12
					}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});