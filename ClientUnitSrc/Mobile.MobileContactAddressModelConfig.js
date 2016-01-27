Terrasoft.sdk.Model.addBusinessRule("ContactAddress", {
	name: "ContactAddressRequirementRule",
	ruleType: Terrasoft.RuleTypes.Requirement,
	requireType: Terrasoft.RequirementTypes.OneOf,
	triggeredByColumns: ["Address", "City", "Country"],
	position: 3
});

Terrasoft.sdk.Model.addBusinessRule("ContactAddress", {
	name: "ContactAddressMutualFiltrationRule",
	ruleType: Terrasoft.RuleTypes.MutualFiltration,
	triggeredByColumns: ["Country", "Region", "City"],
	connections: [
		{
			parent: "Country",
			child: "City"
		},
		{
			parent: "Country",
			child: "Region"
		},
		{
			parent: "Region",
			child: "City"
		}
	]
});

/* Начиная с версии 7.2 колонка "Основной адрес" не используется. */
/*Terrasoft.sdk.Model.addBusinessRule("ContactAddress", {
	ruleType: Terrasoft.RuleTypes.Custom,
	triggeredByColumns: ["Primary"],
	events: [Terrasoft.BusinessRuleEvents.ValueChanged],
	executeFn: function(model, rule, column, customData, callbackConfig) {
		var stores = model.stores[0];
		if (!model.get("Primary")) {
			Ext.callback(callbackConfig.success, callbackConfig.scope);
			return;
		}
		var currentRecordId = model.get("Id");
		for (var i = 0, ln = stores.getCount(); i < ln; i++) {
			var item = stores.getData().items[i];
			var id = item.get("Id");
			if (id !== currentRecordId) {
				item.set("Primary", false, true);
			}
		}
		Ext.callback(callbackConfig.success, callbackConfig.scope);
	}
});
*/

Terrasoft.sdk.Model.setAlternativePrimaryDisplayColumnValueFunc("ContactAddress", function(record) {
	var country = record.get("Country");
	var countryValue = (!Ext.isEmpty(country)) ? country.getPrimaryDisplayColumnValue() : "";
	var city = record.get("City");
	var cityValue = (!Ext.isEmpty(city)) ? city.getPrimaryDisplayColumnValue() : "";
	var address = record.get("Address");
	var value = (!Ext.isEmpty(countryValue)) ? countryValue + ", " : "";
	value += (!Ext.isEmpty(cityValue)) ? cityValue + ", " : "";
	value += (!Ext.isEmpty(address)) ? address + ", " : "";
	return value.substring(0, value.length - 2);
});

Terrasoft.sdk.Model.addBusinessRule("ContactAddress", {
	name: "ContactAddressFiltrationRule",
	ruleType: Terrasoft.RuleTypes.Filtration,
	triggeredByColumns: ["AddressType"],
	position: 2,
	filters: Ext.create("Terrasoft.Filter", {
		type: Terrasoft.FilterTypes.Group,
		subfilters: [
			Ext.create("Terrasoft.Filter", {
				property: "ForContact",
				value: true
			})
		],
		name: "a4365c55-b393-4e26-be5f-ee0e6a7faa8c"
	})
});