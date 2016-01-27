define("ContactPageV2", [],
	function() {
		return {
			entitySchemaName: "Contact",
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Confirmed",
					"values": {
						"caption": {
							"bindTo": "Resources.Strings.ConfirmedCaption"
						},
						"enabled": false,
						"layout": {"column": 2, "row": 3, "colSpan": 8}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});