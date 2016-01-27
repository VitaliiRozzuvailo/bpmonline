Terrasoft.sdk.RecordPage.setTitle("Activity", "create", "ActivityEditPageNewActivityTitle");

Terrasoft.sdk.RecordPage.configureColumn("Activity", "primaryColumnSet", "Title", {
	isMultiline: true
});

Terrasoft.sdk.RecordPage.addColumn("Activity", {
	name: "ShowInScheduler",
	readOnly: true,
	disabled: true,
	hidden: true
}, "primaryColumnSet");

Terrasoft.sdk.RecordPage.addColumn("Activity", {
	name: "Type",
	readOnly: true,
	disabled: true,
	hidden: true
}, "primaryColumnSet");

Terrasoft.sdk.RecordPage.configureColumn("Activity", "relationsColumnSet", "Account", {
	viewType: Terrasoft.ViewTypes.Preview
});

Terrasoft.sdk.RecordPage.configureColumn("Activity", "relationsColumnSet", "Contact", {
	viewType: Terrasoft.ViewTypes.Preview
});

Terrasoft.sdk.RecordPage.configureEmbeddedDetail("Activity", "ActivityParticipantDetailV2EmbeddedDetail", {
	title: "ActivityRecordPageParticipantsDetailTitle"
});

Terrasoft.sdk.RecordPage.configureColumn("Activity", "ActivityParticipantDetailV2EmbeddedDetail", "Participant", {
	viewType: Terrasoft.ViewTypes.Preview
});

Terrasoft.sdk.RecordPage.addColumn("Activity", {
	name: "Role",
	readOnly: true,
	disabled: true,
	hidden: true
}, "ActivityParticipantDetailV2EmbeddedDetail");

Terrasoft.sdk.GridPage.setSecondaryColumn("Activity", {
	columns: ["StartDate", "DueDate", "Status.Finish", "Owner",
		"Contact", "ShowInScheduler", "Type", "Status"],
	convertFunction: function(values) {
		var format = "d.m.y H:i";
		var startDate = new Date(values.StartDate);
		var dueDate = new Date(values.DueDate);
		if (Terrasoft.util.compareDate(startDate, dueDate)) {
			return Ext.Date.format(startDate, format) + " - " + Ext.Date.format(dueDate, "H:i");
		} else {
			return Ext.Date.format(startDate, format) + " - " + Ext.Date.format(dueDate, format);
		}
	}
});

Terrasoft.sdk.GridPage.setSearchColumns("Activity", []);

Terrasoft.sdk.GridPage.setOrderByColumns("Activity", [{
	column: "StartDate",
	orderType: Terrasoft.OrderTypes.ASC
}]);

Terrasoft.sdk.GridPage.setAdditionalFilterModule("Activity", {
	type: Terrasoft.FilterModuleTypes.Period,
	name: "ActivityPeriodFilter",
	startDateColumnName: "StartDate",
	endDateColumnName: "DueDate",
	isVisibleInDetail: false
});

Terrasoft.sdk.Module.addFilter("Activity", Ext.create("Terrasoft.Filter", {
	compareType: Terrasoft.ComparisonTypes.NotEqual,
	property: "Type",
	value: Terrasoft.GUID.ActivityTypeEmail
}));

Terrasoft.sdk.Actions.configure("Activity", "Terrasoft.ActionCopy", {
	isVisibleInGrid: true,
	isDisplayTitle: true
});