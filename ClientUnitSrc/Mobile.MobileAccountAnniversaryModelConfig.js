Terrasoft.sdk.Model.addBusinessRule("AccountAnniversary", {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ["AnniversaryType"]
});

Terrasoft.sdk.Model.addBusinessRule("AccountAnniversary", {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ["Date"]
});

Terrasoft.sdk.Model.setAlternativePrimaryDisplayColumnValueFunc("AccountAnniversary", function(record) {
	return record.get("Date");
});