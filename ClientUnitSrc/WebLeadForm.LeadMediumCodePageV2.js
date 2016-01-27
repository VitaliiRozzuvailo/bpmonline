define("LeadMediumCodePageV2", function() {
	return {
		entitySchemaName: "LeadMediumCode",
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "Code",
				"values": {
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 12,
						"rowSpan": 1,
						"layoutName": "Header"
					}
				},
				"parentName": "Header",
				"propertyName": "items"
			}
		]/**SCHEMA_DIFF*/,
		methods: {},
		rules: {}
	};
});
