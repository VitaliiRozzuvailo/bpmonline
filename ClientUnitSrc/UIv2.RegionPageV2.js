define("RegionPageV2", ["terrasoft", "BusinessRuleModule", "ext-base", "sandbox"],
		function(Terrasoft, BusinessRuleModule, Ext, sandbox) {
			return {
				entitySchemaName: "Region",
				attributes: {},
				details: /**SCHEMA_DETAILS*/{
				}/**SCHEMA_DETAILS*/,
				methods: {},
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "insert",
						"parentName": "GeneralInfoBlock",
						"propertyName": "items",
						"name": "Country",
						"values": {
							"bindTo": "Country",
							"layout": {"column": 0, "row": 1, "colSpan": 12}
						}
					}, {
						"operation": "merge",
						"name": "Description",
						"values": {
							"bindTo": "Description",
							"layout": {"column": 0, "row": 2, "colSpan": 12}
						}
					}
				]/**SCHEMA_DIFF*/,
				rules: {},
				userCode: {}
			};
		});