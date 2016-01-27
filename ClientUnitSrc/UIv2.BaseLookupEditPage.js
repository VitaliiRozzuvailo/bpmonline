define("BaseLookupEditPage", [],
	function() {
		return {
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			attributes: {},
			methods: {},
			rules: {},
			userCode: {},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "Name",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"layout": {
							"colSpan": 24,
							"column": 0,
							"row": 0
						}
					}
				},
				{
					"operation": "insert",
					"name": "Description",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"layout": {
							"colSpan": 24,
							"column": 0,
							"row": 1
						}
					}
				}
			]/**SCHEMA_DIFF*/

		};
	});
