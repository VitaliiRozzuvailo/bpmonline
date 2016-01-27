define('SxVwOrderContPage', ['SxVwOrderContPageResources', 'GeneralDetails'],
function(resources, GeneralDetails) {
	return {
		entitySchemaName: 'SxVwOrderCont',
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[
	{
		"operation": "insert",
		"parentName": "Header",
		"propertyName": "items",
		"name": "SxName",
		"values": {
			"layout": {
				"column": 0,
				"row": 0,
				"colSpan": 24
			}
		}
	},
	{
		"operation": "insert",
		"name": "GeneralInfoTab",
		"parentName": "Tabs",
		"propertyName": "tabs",
		"index": 0,
		"values": {
			"caption": {
				"bindTo": "Resources.Strings.GeneralInfoTabCaption"
			},
			"items": []
		}
	}
]/**SCHEMA_DIFF*/,
		attributes: {},
		methods: {},
		rules: {},
		userCode: {}
	};
});
