Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ["Title"]
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ["StartDate"]
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ["DueDate"]
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ["Status"]
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ["ActivityCategory"]
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ["Priority"]
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Requirement,
	triggeredByColumns: ["Owner"]
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Activation,
	triggeredByColumns: ["Status"],
	conditionalColumns: [
		{name: "Status.Finish", value: true}
	],
	dependentColumnNames: ["Result", "DetailedResult"]
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.MutualFiltration,
	triggeredByColumns: ["Type", "ActivityCategory"],
	connections: [
		{
			parent: "Type",
			child: "ActivityCategory",
			connectedBy: "ActivityType"
		}
	]
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.MutualFiltration,
	triggeredByColumns: ["Account", "Contact"],
	connections: [
		{
			parent: "Account",
			child: "Contact"
		}
	]
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Filtration,
	triggeredByColumns: ["ActivityCategory"],
	filters: Ext.create("Terrasoft.Filter", {
		compareType: Terrasoft.ComparisonTypes.NotEqual,
		property: "ActivityType",
		value: Terrasoft.GUID.ActivityTypeEmail,
		name: "81d05412-d90c-440a-831a-03fc52489fa5"
	})
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Filtration,
	triggeredByColumns: ["ActivityCategory"],
	filteredColumn: "Result",
	filters: Ext.create("Terrasoft.Filter", {
		property: "ActivityCategory",
		modelName: "ActivityCategoryResultEntry",
		assocProperty: "ActivityResult",
		operation: Terrasoft.FilterOperations.Any,
		name: "0c685faa-26ca-4a55-a6fa-3147b9b5009e"
	})
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Filtration,
	events: [Terrasoft.BusinessRuleEvents.Load],
	triggeredByColumns: ["Owner"],
	filters: Ext.create("Terrasoft.Filter", {
		property: "Active",
		modelName: "SysAdminUnit",
		assocProperty: "Contact",
		operation: Terrasoft.FilterOperations.Any,
		name: "ActivityContact_SysAdminUnit_Filtration",
		value: true
	})
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Comparison,
	triggeredByColumns: ["StartDate"],
	leftColumn: "DueDate",
	comparisonOperation: Terrasoft.ComparisonTypes.GreaterOrEqual,
	rightColumn: "StartDate"
});

Terrasoft.sdk.Model.addBusinessRule("Activity", {
	ruleType: Terrasoft.RuleTypes.Comparison,
	triggeredByColumns: ["DueDate"],
	leftColumn: "StartDate",
	comparisonOperation: Terrasoft.ComparisonTypes.LessOrEqual,
	rightColumn: "DueDate"
});

Terrasoft.sdk.Model.setDefaultValuesFunc("Activity", function(config) {
	var coeff = 1000 * 60 * 5;
	var currentDate = new Date();
	var startDate = new Date(Math.round(currentDate.getTime() / coeff) * coeff);
	var dueDate = new Date(startDate.getTime() + 30 * 60000);
	config.record.set("StartDate", startDate);
	config.record.set("DueDate", dueDate);
	config.record.set("ShowInScheduler", true);
	Ext.callback(config.success, config.scope);
});

Terrasoft.updateParticipant = function(changedColumnName, oldValue, newValue, record, config, mode, toCallback) {
	var successFn = config.success;
	var callbackScope = config.scope;
	var filter = Ext.create("Terrasoft.Filter", {
		type: "Terrasoft.FilterTypes.Group",
		logicalOperation: "Terrasoft.FilterLogicalOperations.And",
		subfilters: [
			{
				compareType: Terrasoft.ComparisonTypes.Equal,
				property: "Activity",
				value: record.get("Id")
			},
			{
				compareType: Terrasoft.ComparisonTypes.Equal,
				property: "Participant",
				value: oldValue
			}
		]
	});
	var queryConfig = Ext.create("Terrasoft.QueryConfig", {
		columns: ["Activity", "Participant"],
		modelName: "ActivityParticipant"
	});
	if (mode === "insert") {
		var newRecord = ActivityParticipant.create({
			"Activity": record,
			"Participant": newValue
		});
		newRecord.save({
			queryConfig: queryConfig
		});
		if (toCallback) {
			Ext.callback(successFn, callbackScope);
		}
	} else {
		var store = Ext.create("Ext.data.Store", {
			model: "ActivityParticipant"
		});
		store.loadPage(1, {
			filters: filter,
			callback: function(data, operation, success) {
				if (success === true && data.length > 0) {
					var participant = data[0];
					if (mode === "delete") {
						participant.erase();
					} else {
						participant.set("Participant", newValue, true);
						participant.save({
							queryConfig: queryConfig
						});
					}
				} else if (success === true && data.length === 0) {
					var newRecord = ActivityParticipant.create({
						"Activity": record,
						"Participant": newValue
					});
					newRecord.save({
						queryConfig: queryConfig
					});
				}
				if (toCallback) {
					Ext.callback(successFn, callbackScope);
				}
			},
			queryConfig: queryConfig
		});
	}
};

Terrasoft.processActivityColumnForUpdateActivityParticipantDetail = function(config, record, columnName, toCallback) {
	var successFn = config.success;
	var callbackScope = config.scope;
	var mode = "";
	var oldValue = record.modified[columnName];
	var newValue = record.get(columnName);
	if ((record.phantom && !Ext.isEmpty(newValue)) || (oldValue === null && !Ext.isEmpty(newValue))) {
		mode = "insert";
	} else if (Ext.isEmpty(newValue) && !Ext.isEmpty(oldValue)) {
		mode = "delete";
	} else if (!Ext.isEmpty(newValue) && !Ext.isEmpty(oldValue) && (oldValue !== newValue)) {
		mode = "update";
	}
	if (!Ext.isEmpty(mode)) {
		Terrasoft.updateParticipant(columnName, oldValue, newValue, record, config, mode, toCallback);
	} else {
		if (toCallback) {
			Ext.callback(successFn, callbackScope);
		}
	}
};

Terrasoft.updateActivityParticipant = function(config) {
	var contact = this.get("Contact");
	var owner = this.get("Owner");
	if (contact && owner && (contact.getId() === owner.getId())) {
		Terrasoft.processActivityColumnForUpdateActivityParticipantDetail(config, this, "Contact", true);
	} else {
		Terrasoft.processActivityColumnForUpdateActivityParticipantDetail(config, this, "Contact", false);
		Terrasoft.processActivityColumnForUpdateActivityParticipantDetail(config, this, "Owner", true);
	}
};

if (!Terrasoft.CurrentUserInfo.isOnlineMode) {
	Terrasoft.sdk.Model.setModelEventHandler("Activity", Terrasoft.ModelEvents[Terrasoft.ModelEventKinds.After].insert,
		Terrasoft.updateActivityParticipant);
	Terrasoft.sdk.Model.setModelEventHandler("Activity", Terrasoft.ModelEvents[Terrasoft.ModelEventKinds.Before].update,
		Terrasoft.updateActivityParticipant);
}