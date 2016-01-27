define("LeadMediumPageV2", function() {
	return {
		entitySchemaName: "LeadMedium",
		details: /**SCHEMA_DETAILS*/{
			LeadMediumCode: {
				schemaName: "LeadMediumCodeDetailV2",
				entitySchemaName: "LeadMediumCode",
				filter: {
					masterColumn: "Id",
					detailColumn: "LeadMedium"
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
				"name": "LeadMediumCodeTabContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "LeadMediumCodeTabContainer",
				"propertyName": "items",
				"name": "LeadMediumCode",
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
