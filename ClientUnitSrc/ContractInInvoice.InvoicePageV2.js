define("InvoicePageV2", ["BusinessRuleModule"],
		function(BusinessRuleModule) {
			return {
				entitySchemaName: "Invoice",
				attributes: {},
				details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
				methods: {},
				rules: {
					"Contract": {
						"FiltrationContractByAccount": {
							"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
							"autocomplete": true,
							"autoClean": true,
							"baseAttributePatch": "Account",
							"comparisonType": Terrasoft.ComparisonType.EQUAL,
							"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							"attribute": "Account"
						},
						"FiltrationContractByContact": {
							"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
							"autocomplete": true,
							"autoClean": true,
							"baseAttributePatch": "Contact",
							"comparisonType": Terrasoft.ComparisonType.EQUAL,
							"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							"attribute": "Contact"
						}
					}
				},
				diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
			};
		});