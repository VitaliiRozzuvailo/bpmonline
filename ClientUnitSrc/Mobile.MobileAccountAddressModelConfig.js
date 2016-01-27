Terrasoft.sdk.Model.addBusinessRule("AccountAddress", {
	name: "AccountAddressMutualFiltrationRule",
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

Terrasoft.sdk.Model.addBusinessRule("AccountAddress", {
	name: "AccountAddressRequirementRule",
	ruleType: Terrasoft.RuleTypes.Requirement,
	requireType: Terrasoft.RequirementTypes.OneOf,
	triggeredByColumns: ["Address", "City", "Country"],
	position: 3
});

/*
Terrasoft.sdk.Model.addBusinessRule("AccountAddress", {
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

Terrasoft.sdk.Model.setAlternativePrimaryDisplayColumnValueFunc("AccountAddress", function(record) {
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

Terrasoft.sdk.Model.addBusinessRule("AccountAddress", {
	name: "AccountAddressTypeFiltrationRule",
	ruleType: Terrasoft.RuleTypes.Filtration,
	triggeredByColumns: ["AddressType"],
	position: 2,
	filters: Ext.create("Terrasoft.Filter", {
		type: Terrasoft.FilterTypes.Group,
		subfilters: [
			Ext.create("Terrasoft.Filter", {
				property: "ForAccount",
				value: true
			})
		],
		name: "a4365c55-b393-4e16-be5f-ee0e6a7faa8c"
	})
});
