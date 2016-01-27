define("LeadPageV2", ["LeadPageV2Resources", "BusinessRuleModule", "LeadConfigurationConst"],
	function(resources, BusinessRuleModule, LeadConfigurationConst) {
		return {
			entitySchemaName: "Lead",
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "Order",
					"values": {
						"layout": {
							"column": 12,
							"row": 2,
							"colSpan": 12,
							"rowSpan": 1
						},
						"bindTo": "Order"
					},
					"parentName": "LeadPageTransferToSaleInfoBlock",
					"propertyName": "items",
					"index": 5
				}
			]/**SCHEMA_DIFF*/,
			attributes: {},
			methods: {},
			rules: {
				"Order": {
					"FilterOrderByAccount": {
						ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
						autocomplete: true,
						baseAttributePatch: "Account",
						comparisonType: Terrasoft.ComparisonType.EQUAL,
						type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						attribute: "QualifiedAccount",
						attributePath: "",
						value: ""
					},
					"EnabledOrderForQualifyStatus": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "QualifyStatus"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: LeadConfigurationConst.LeadConst.QualifyStatus.WaitingForSale
							}
						}]
					}
				}
			},
			userCode: {}
		};
	});
