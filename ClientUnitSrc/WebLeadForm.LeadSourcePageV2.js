define("LeadSourcePageV2", [], function() {
	return {
		entitySchemaName: "LeadSource",
		details: /**SCHEMA_DETAILS*/{
			LeadSourceCode: {
				schemaName: "LeadSourceCodeDetailV2",
				entitySchemaName: "LeadSourceCode",
				filter: {
					masterColumn: "Id",
					detailColumn: "LeadSource"
				}
			}
		}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "remove",
				"name": "ESNTab"
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"name": "Name",
				"values": {"layout": {"column": 0, "row": 0, "colSpan": 24}}
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"name": "Description",
				"values": {"layout": {"column": 0, "row": 1, "colSpan": 24}}
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"name": "LeadMedium",
				"values": {
					"layout": {"column": 0, "row": 2, "colSpan": 24},
					"contentType": Terrasoft.ContentType.ENUM
				}
			},
			{
				"operation": "insert",
				"name": "GeneralInfoTab",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 0,
				"values": {
					"caption": {"bindTo": "Resources.Strings.GeneralInfoTabCaption"},
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "GeneralInfoTab",
				"name": "LeadSourceCodeTabContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "LeadSourceCodeTabContainer",
				"propertyName": "items",
				"name": "LeadSourceCode",
				"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
			},
			{
				"operation": "remove",
				"name": "actions"
			}
		]/**SCHEMA_DIFF*/,
		methods: {},
		rules: {}
	};
});
