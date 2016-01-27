Terrasoft.sdk.Model.addBusinessRule("AccountCommunication", {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ["Number"]
});

Terrasoft.sdk.Model.addBusinessRule("AccountCommunication", {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ["CommunicationType"]
});

Terrasoft.sdk.Model.addBusinessRule("AccountCommunication", {
	ruleType: Terrasoft.RuleTypes.Filtration,
	triggeredByColumns: ["CommunicationType"],
	filters: Ext.create("Terrasoft.Filter", {
		type: Terrasoft.FilterTypes.Group,
		subfilters: [
			Ext.create("Terrasoft.Filter", {
				property: "UseforAccounts",
				value: true
			}),
			Ext.create("Terrasoft.Filter", {
				property: "Id",
				funcType: Terrasoft.FilterFunctions.NotIn,
				funcArgs: [Terrasoft.GUID.Twitter, Terrasoft.GUID.Facebook, Terrasoft.GUID.LinkedIn]
			})
		],
		name: "a4265c53-b393-4e16-be5f-ee0e5a7faa8c"
	})
});

Terrasoft.sdk.Model.setAlternativePrimaryDisplayColumnValueFunc("AccountCommunication", function(record) {
	return record.get("Number");
});