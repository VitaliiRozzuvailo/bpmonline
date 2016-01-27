define("EmailItemSchema", ["BusinessRuleModule", "EmailConstants"], function(BusinessRuleModule, EmailConstants) {
    return {
        entitySchemaName: EmailConstants.entitySchemaName,
        methods: {},
        diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/,
        rules: {
            "Invoice": {
                "FiltrationInvoiceByAccount": {
                    "ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
                    "autocomplete": true,
                    "autoClean": true,
                    "baseAttributePatch": "Account",
                    "comparisonType": Terrasoft.ComparisonType.EQUAL,
                    "type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                    "attribute": "Account"
                },
                "FiltrationInvoiceByContact": {
                    "ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
                    "autocomplete": true,
                    "autoClean": true,
                    "baseAttributePatch": "Contact",
                    "comparisonType": Terrasoft.ComparisonType.EQUAL,
                    "type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                    "attribute": "Contact"
                }
            }
        }
    };
});
