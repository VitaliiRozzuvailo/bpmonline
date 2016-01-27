Terrasoft.sdk.Model.addBusinessRule('ContactCommunication', {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ['Number'],
	position: 0
});

Terrasoft.sdk.Model.addBusinessRule('ContactCommunication', {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ['CommunicationType'],
	position: 1
});

Terrasoft.sdk.Model.addBusinessRule('ContactCommunication', {
	ruleType: Terrasoft.RuleTypes.Filtration,
	triggeredByColumns: ['CommunicationType'],
	position: 2,
	filters: Ext.create('Terrasoft.Filter', {
		type: Terrasoft.FilterTypes.Group,
		subfilters: [
			Ext.create('Terrasoft.Filter', {
				property: 'UseforContacts',
				value: true
			}),
			Ext.create('Terrasoft.Filter', {
				property: 'Id',
				funcType: Terrasoft.FilterFunctions.NotIn,
				funcArgs: [Terrasoft.GUID.Twitter, Terrasoft.GUID.Facebook, Terrasoft.GUID.LinkedIn]
			})
		],
		name: 'a4265c53-b393-4e16-be5f-ee0e5a7faa8c'
	})
});

Terrasoft.sdk.Model.setAlternativePrimaryDisplayColumnValueFunc('ContactCommunication', function(record) {
	return record.get('Number');
});