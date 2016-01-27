Terrasoft.sdk.Model.addBusinessRule('ActivityParticipant', {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ['Participant']
});

Terrasoft.sdk.Model.setAlternativePrimaryDisplayColumnValueFunc('ActivityParticipant', function(record) {
	return record.get('Participant').getPrimaryDisplayColumnValue();
});