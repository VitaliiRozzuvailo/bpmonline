define("ContactAddressPageV2", ["BusinessRuleModule"], function(BusinessRuleModule) {
	return {
		entitySchemaName: "ContactAddress",
		details: /**SCHEMA_DETAILS*/{
		}/**SCHEMA_DETAILS*/,
		rules: {
			"AddressType": {
				"FiltrationAddressTypeByOwner": {
					ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
					autocomplete: true,
					baseAttributePatch: "ForContact",
					comparisonType: Terrasoft.ComparisonType.EQUAL,
					type: BusinessRuleModule.enums.ValueType.CONSTANT,
					value: true
				}
			}
		},
		diff: /**SCHEMA_DIFF*/[
		]/**SCHEMA_DIFF*/
	};
});