Ext.define("Terrasoft.Configuration.MobileActivityActionsUtilities", {
	alternateClassName: "Terrasoft.MobileActivityActionsUtilities",

	singleton: true,

	doSeparateActivity: function(selectedRecord, callback, scope) {
		if (!selectedRecord) {
			Terrasoft.MessageBox.showMessage(LocalizableStrings["MobileActivityActionsUtilities_ChooseAction"]);
			return;
		}
		Terrasoft.Mask.show();
		var activityModelName = "Activity";
		var todayActivities = Ext.create("Terrasoft.store.BaseStore", {
			model: activityModelName
		});
		var todayActivitiesQueryConfig = Ext.create("Terrasoft.QueryConfig", {
			columns: this.getIntersectionActivityColumns(),
			modelName: activityModelName,
			orderByColumns: [{
				column: "StartDate",
				orderType: Terrasoft.OrderTypes.ASC
			}]
		});
		todayActivities.loadPage(1, {
			queryConfig: todayActivitiesQueryConfig,
			filters: this.getIntersectionFilter(selectedRecord, scope),
			callback: function(records, operation, success) {
				var intersectedRecords = records;
				if (intersectedRecords.length > 0) {
					this.processIntersectedActivities(intersectedRecords, selectedRecord, callback, scope);
				} else {
					Terrasoft.Mask.hide();
					Terrasoft.MessageBox.showMessage(LocalizableStrings["MobileActivityActionsUtilities_NoPeriodsToSeparate"]);
				}
			},
			scope: this
		});
	},

	getIntersectionActivityColumns: function() {
		return ["StartDate", "DueDate", "Type", "Status", "Title", "Owner", "Account", "Contact", "ShowInScheduler"];
	},

	getIntersectionFilter: function(targetRecord, scope) {
		var currentStartDate = targetRecord.get("StartDate");
		var currentDueDate = targetRecord.get("DueDate");
		var currentFilters = scope.getFilters();
		return Ext.create("Terrasoft.Filter", {
			type: Terrasoft.FilterTypes.Group,
			logicalOperation: Terrasoft.FilterLogicalOperations.And,
			subfilters: [
				{
					isNot: true,
					property: "Id",
					value: targetRecord.getId()
				},
				{
					property: "StartDate",
					funcType: Terrasoft.FilterFunctions.Day,
					value: currentStartDate.getDate()
				},
				currentFilters,
				{
					type: Terrasoft.FilterTypes.Group,
					logicalOperation: Terrasoft.FilterLogicalOperations.Or,
					subfilters: [
						{
							type: Terrasoft.FilterTypes.Group,
							logicalOperation: Terrasoft.FilterLogicalOperations.And,
							subfilters: [
								{
									property: "StartDate",
									compareType: Terrasoft.ComparisonTypes.Greater,
									value: currentStartDate
								},
								{
									property: "StartDate",
									compareType: Terrasoft.ComparisonTypes.Less,
									value: currentDueDate
								}
							]
						},
						{
							type: Terrasoft.FilterTypes.Group,
							logicalOperation: Terrasoft.FilterLogicalOperations.And,
							subfilters: [
								{
									property: "DueDate",
									compareType: Terrasoft.ComparisonTypes.Greater,
									value: currentStartDate
								},
								{
									property: "DueDate",
									compareType: Terrasoft.ComparisonTypes.Less,
									value: currentDueDate
								}
							]
						}
					]
				}
			]
		});
	},

	getIntersectionPeriods: function(intersectedRecords, selectedRecord) {
		var startDate = selectedRecord.get("StartDate");
		var dueDate = selectedRecord.get("DueDate");
		var periods = [];
		for (var i = 0, ln = intersectedRecords.length; i < ln; i++) {
			var record = intersectedRecords[i];
			var recordStartDate = record.get("StartDate");
			var recordDueDate = record.get("DueDate");
			if (recordStartDate <= startDate) {
				if (recordDueDate > startDate) {
					startDate = recordDueDate;
				}
			} else {
				periods.push([startDate, recordStartDate]);
				startDate = recordDueDate;
			}
		}
		if (startDate < dueDate) {
			periods.push([startDate, dueDate]);
		}
		return periods;
	},

	updateCurrentActivityDates: function(record, periods, saveQueryConfig, callback, scope) {
		var periodsCount = periods.length - 1;
		var startDate = periods[periodsCount][0];
		var dueDate = periods[periodsCount][1];
		this.updateActivityDates(record, startDate, dueDate);
		record.save({
			queryConfig: saveQueryConfig,
			success: function() {
				Ext.callback(callback, scope);
			}
		}, this);
	},

	updateActivityDates: function(record, startDate, dueDate) {
		record.set("StartDate", startDate);
		record.set("DueDate", dueDate);
		record.modified.StartDate = null;
		record.modified.DueDate = null;
	},

	processIntersectedActivities: function(intersectedRecords, selectedRecord, callback, scope) {
		var copyRecord;
		var startDate;
		var dueDate;
		var periods = this.getIntersectionPeriods(intersectedRecords, selectedRecord);
		var periodsCount = periods.length -  1;
		var saveQueryConfig = Ext.create("Terrasoft.QueryConfig", {
			columns: this.getIntersectionActivityColumns(),
			modelName: "Activity"
		});
		if (periodsCount < 0) {
			Terrasoft.Mask.hide();
			Terrasoft.MessageBox.showMessage(LocalizableStrings["MobileActivityActionsUtilities_NoPeriodsToSeparate"]);
		} else if  (periodsCount === 0) {
			this.updateCurrentActivityDates(selectedRecord, periods, saveQueryConfig, callback, scope);
		} else {
			var processedPeriods = 0;
			for (var i = 0; i < periodsCount; i++) {
				startDate = periods[i][0];
				dueDate = periods[i][1];
				copyRecord = selectedRecord.copy();
				copyRecord.phantom = true;
				this.updateActivityDates(copyRecord, startDate, dueDate);
				copyRecord.save({
					queryConfig: saveQueryConfig,
					success: function() {
						processedPeriods++;
						if (processedPeriods === periodsCount) {
							this.updateCurrentActivityDates(selectedRecord, periods, saveQueryConfig, callback, scope);
						}
					}
				}, this);
			}
		}
	},

	doCopyActivityAction: function(selectedRecord, callback, scope) {
		if (!selectedRecord) {
			Terrasoft.MessageBox.showMessage(LocalizableStrings["MobileActivityActionsUtilities_ChooseAction"]);
			return;
		}
		var copyQueryConfig = Ext.create("Terrasoft.QueryConfig", {
			columns: this.getIntersectionActivityColumns(),
			modelName: "Activity"
		});
		var copyRecord = selectedRecord.copy();
		copyRecord.phantom = true;
		Terrasoft.Mask.show();
		var newActivityId = copyRecord.getId();
		copyRecord.save({
			queryConfig: copyQueryConfig,
			success: function() {
				this.copyParticipants(newActivityId, selectedRecord, callback, scope);
			},
			failure: function() {
				Terrasoft.Mask.hide();
			}
		}, this);
	},

	copyParticipants: function(newActivityId, selectedRecord, callback, scope) {
		var contact = selectedRecord.get("Contact");
		var owner = selectedRecord.get("Owner");
		var parentRecordFilter = Ext.create("Terrasoft.Filter", {
			type: Terrasoft.FilterTypes.Group,
			logicalOperation: Terrasoft.FilterLogicalOperations.And,
			subfilters: [{
				property: "Activity",
				value: selectedRecord.getId()
			}]
		});
		if (contact) {
			parentRecordFilter.addFilter(Ext.create("Terrasoft.Filter", {
				isNot: true,
				property: "Participant",
				value: contact.getId()
			}));
		}
		if (owner) {
			parentRecordFilter.addFilter(Ext.create("Terrasoft.Filter", {
				isNot: true,
				property: "Participant",
				value: owner.getId()
			}));
		}
		var participantsModelName = "ActivityParticipant";
		var participants = Ext.create("Terrasoft.store.BaseStore", {
			model: participantsModelName
		});
		var participantsQueryConfig = Ext.create("Terrasoft.QueryConfig", {
			columns: ["Activity", "Participant"],
			modelName: participantsModelName
		});
		participants.setPageSize(Terrasoft.AllRecords);
		participants.loadPage(1, {
			queryConfig: participantsQueryConfig,
			filters: parentRecordFilter,
			callback: function(records, operation, success) {
				var count = records.length;
				if (count <= 0) {
					Ext.callback(callback, scope);
					return;
				}
				var copiedRecords = 0;
				for (var i = 0; i < count; i++) {
					var record = records[i];
					var copyRecord = record.copy();
					copyRecord.phantom = true;
					copyRecord.set("Activity", newActivityId);
					copyRecord.save({
						queryConfig: participantsQueryConfig,
						success: function() {
							copiedRecords++;
							if (copiedRecords === count) {
								Ext.callback(callback, scope);
							}
						},
						failure: function() {
							Terrasoft.Mask.hide();
						}
					}, this);
				}
			},
			scope: this
		});
	},

	doDeleteActivityAction: function(selectedRecord, callback, scope) {
		if (!selectedRecord) {
			Terrasoft.MessageBox.showMessage(LocalizableStrings["MobileActivityActionsUtilities_ChooseAction"]);
			return;
		}
		var actionManager = Ext.create("Terrasoft.ActionManager");
		actionManager.add({
			name: "ActivityActionDelete",
			actionClassName: "Terrasoft.ActionDelete"
		});
		actionManager.on("executionend", callback, scope);
		actionManager.execute("ActivityActionDelete", selectedRecord, {});
	}

});

Ext.define('Terrasoft.Configuration.ActionEmployeeEfficiency', {

	execute: function(config) {
		Terrasoft.Mask.show();
		var store = Ext.create("Terrasoft.store.BaseStore", {
			model: "Activity"
		});
		var queryConfig = Ext.create('Terrasoft.QueryConfig', {
			modelName: "Activity",
			expandLookupColumns: false,
			columns: ["Status", "Status.Finish", "DurationInMinutes"]
		});
		store.setPageSize(Terrasoft.AllRecords);
		store.setFilters(config.filters);
		store.load({
			queryConfig: queryConfig,
			callback: function(records, operation, success) {
				if (success) {
					var finishedActivities = Ext.Array.filter(records, function(record) {
						return record.get("Status.Finish") === true;
					});
					var totalDuration = 0;
					Ext.Array.each(finishedActivities, function(finishedActivity) {
						totalDuration += finishedActivity.get("DurationInMinutes")
					});
					var totalHours = parseInt(totalDuration / 60);
					var minutesLeft = totalDuration - totalHours * 60;
					Terrasoft.Mask.hide();
					var message = Ext.String.format(LocalizableStrings["ActionEmployeeEfficiencyMessageFormat"], totalHours, minutesLeft);
					Terrasoft.MessageBox.showMessage(message);
				} else {
					Terrasoft.Mask.hide();
					Terrasoft.MessageBox.showException(operation.getError());
				}
			}
		});
	}

});