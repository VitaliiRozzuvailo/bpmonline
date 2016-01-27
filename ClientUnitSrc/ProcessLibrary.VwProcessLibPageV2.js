define("VwProcessLibPageV2", ["VwProcessLibPageV2Resources"],
	function(resources) {
		return {
			entitySchemaName: "VwProcessLib",
			messages: {},
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "Caption",
					"values": {
						"enabled": false
					}
				},
				{
					"operation": "merge",
					"name": "Name",
					"values": {
						"enabled": false
					}
				},
				{
					"operation": "merge",
					"name": "Enabled",
					"values": {
						"enabled": false
					}
				},
				{
					"operation": "merge",
					"name": "SysPackage",
					"values": {
						"enabled": false
					}
				},
				{
					"operation": "insert",
					"name": "Version",
					"values": {
						"layout": {
							"column": 0,
							"row": 3,
							"colSpan": 24,
							"rowSpan": 1
						},
						"bindTo": "Version",
						"textSize": "Default",
						"enabled": false
					},
					"parentName": "Header",
					"propertyName": "items",
					"index": 5
				},
				{
					"operation": "insert",
					"name": "AddToRunButton",
					"values": {
						"layout": {
							"column": 0,
							"row": 4,
							"colSpan": 24,
							"rowSpan": 1
						},
						"bindTo": "AddToRunButton",
						"textSize": "Default"
					},
					"parentName": "Header",
					"propertyName": "items",
					"index": 6
				}
			]/**SCHEMA_DIFF*/,
			methods: {},
			rules: {},
			userCode: {}
		};
	});
