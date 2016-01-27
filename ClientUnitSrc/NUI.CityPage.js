define('CityPage', ['ext-base', 'terrasoft', 'sandbox',
	'City', 'CityPageStructure', 'CityPageResources', 'GeneralDetails', 'LookupUtilities', 'BusinessRuleModule'],
	function(Ext, Terrasoft, sandbox, entitySchema, structure, resources, GeneralDetails, LookupUtilities,
		BusinessRuleModule) {
	structure.userCode = function() {
		this.entitySchema = entitySchema;
		this.name = 'CityCardViewModel';
		this.schema.leftPanel = LookupUtilities.GetBaseLookupPageStructure();
	};
	structure.finalizeStructure = function() {
		var baseElementsControlGroup = this.find('baseElementsControlGroup');
		if (baseElementsControlGroup) {
			var items = baseElementsControlGroup.items;
			items.splice(2, 0, {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: 'Country',
				columnPath: 'Country',
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: true
			});
			items.splice(3, 0, {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: 'Region',
				columnPath: 'Region',
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: true,
				rules: [{
					ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
					autocomplete: true,
					baseAttributePatch: 'Country',
					comparisonType: Terrasoft.ComparisonType.EQUAL,
					type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
					attribute: 'Country',
					attributePath: '',
					value: ''
				}]
			});
			items.splice(4, 0, {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: 'TimeZone',
				columnPath: 'TimeZone',
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: true
			});
			baseElementsControlGroup.items = items;
		}
	};
	return structure;
});