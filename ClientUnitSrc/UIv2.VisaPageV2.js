define("VisaPageV2", ["terrasoft", "BusinessRuleModule", "ext-base", "sandbox"],
function() {
	return {
		entitySchemaName: "BaseVisa",
		columns: {},
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		methods: {},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "GeneralInfoTab",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"values": {
					"caption": { "bindTo": "Resources.Strings.GeneralInfoTabCaption"},
					"items": []
				}
			}, {
				"operation": "insert",
				"parentName": "GeneralInfoTab",
				"propertyName": "items",
				"name": "VisaGridLayout",
				"values": {
					"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
					"items": []
				}
			}, {
				"operation": "insert",
				"parentName": "VisaGridLayout",
				"propertyName": "items",
				"name": "VisaOwner",
				"values": {
					"bindTo": "VisaOwner",
					"layout": {"column": 0, "row": 0, "colSpan": 12},
					"enabled": false
				}
			}, {
				"operation": "insert",
				"parentName": "VisaGridLayout",
				"propertyName": "items",
				"name": "IsAllowedToDelegate",
				"values": {
					"bindTo": "IsAllowedToDelegate",
					"layout": {"column": 12, "row": 0, "colSpan": 12},
					"enabled": false
				}
			}, {
				"operation": "insert",
				"parentName": "VisaGridLayout",
				"propertyName": "items",
				"name": "Status",
				"values": {
					"bindTo": "Status",
					"layout": {"column": 0, "row": 1, "colSpan": 12},
					"enabled": false
				}
			}, {
				"operation": "insert",
				"parentName": "VisaGridLayout",
				"propertyName": "items",
				"name": "IsCanceled",
				"values": {
					"bindTo": "IsCanceled",
					"layout": {"column": 12, "row": 1, "colSpan": 12},
					"enabled": false
				}
			}, {
				"operation": "insert",
				"parentName": "VisaGridLayout",
				"propertyName": "items",
				"name": "SetBy",
				"values": {
					"bindTo": "SetBy",
					"layout": {"column": 0, "row": 2, "colSpan": 12},
					"enabled": false
				}
			}, {
				"operation": "insert",
				"parentName": "VisaGridLayout",
				"propertyName": "items",
				"name": "SetDate",
				"values": {
					"bindTo": "SetDate",
					"layout": {"column": 12, "row": 2, "colSpan": 12},
					"enabled": false
				}
			}, {
				"operation": "insert",
				"parentName": "VisaGridLayout",
				"propertyName": "items",
				"name": "Comment",
				"values": {
					"bindTo": "Comment",
					"layout": {"column": 0, "row": 3, "colSpan": 24},
					"enabled": false
				}
			}
		]/**SCHEMA_DIFF*/,
		rules: {},
		userCode: {}
	};
});