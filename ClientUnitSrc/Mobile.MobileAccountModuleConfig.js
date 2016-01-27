Terrasoft.sdk.RecordPage.setTitle("Account", "create", "AccountEditPage_navigationPanel_title_create");

Terrasoft.sdk.GridPage.setSecondaryColumn("Account", {
	columns: ["PrimaryContact", "GPSN", "GPSE", "Address"],
	convertFunction: function(values) {
		return values.PrimaryContact;
	}
});

Terrasoft.sdk.RecordPage.configureColumn("Account", "primaryColumnSet", "Name", {
	isMultiline: true
});

Terrasoft.sdk.RecordPage.configureColumn("Account", "primaryColumnSet", "PrimaryContact", {
	viewType: Terrasoft.ViewTypes.Preview
});

Terrasoft.sdk.GridPage.setOrderByColumns("Account",	{
	column: "Name",
	orderType: Terrasoft.OrderTypes.ASC
});

Terrasoft.sdk.RecordPage.configureEmbeddedDetail("Account", "AccountCommunicationDetailEmbeddedDetail", {
	title: "AccountRecordPage_accountCommunicationsDetail_title",
	displaySeparator: false,
	orderByColumns: [
		{
			column: "CommunicationType",
			orderType: Terrasoft.OrderTypes.ASC
		}
	],
	isCollapsed: false
});

Terrasoft.sdk.RecordPage.configureColumn("Account", "AccountCommunicationDetailEmbeddedDetail", "CommunicationType", {
	useAsLabel: true,
	label: {
		emptyText: "AccountRecordPage_accountCommunicationsDetail_CommunicationType_emptyText",
		pickerTitle: "AccountRecordPage_accountCommunicationsDetail_CommunicationType_label"
	}
});

Terrasoft.sdk.RecordPage.configureColumn("Account", "AccountCommunicationDetailEmbeddedDetail", "Number", {
	hideLabel: true,
	viewType: {
		typeColumn: "CommunicationType"
	}
});

Terrasoft.sdk.RecordPage.configureEmbeddedDetail("Account", "AccountAddressDetailV2EmbeddedDetail", {
	title: "AccountRecordPage_accountAddressesDetail_title",
	displaySeparator: true,
	orderByColumns: [
		{
			column: "Primary",
			orderType: Terrasoft.OrderTypes.DESC
		}
	]
});

Terrasoft.sdk.RecordPage.configureColumn("Account", "AccountAddressDetailV2EmbeddedDetail", "Address", {
	viewType: Terrasoft.ViewTypes.Map,
	typeConfig: {
		additionalMapColumns: ["City", "Region", "Country"]
	}
});

Terrasoft.sdk.RecordPage.addColumn("Account", {
	name: "Primary",
	hidden: true
}, "AccountAddressDetailV2EmbeddedDetail");

Terrasoft.sdk.RecordPage.configureEmbeddedDetail("Account", "AccountAnniversaryDetailV2EmbeddedDetail", {
	title: "AccountRecordPage_accountAnniversariesDetail_title",
	orderByColumns: [
		{
			column: "Date",
			orderType: Terrasoft.OrderTypes.ASC
		}
	],
	displaySeparator: false
});

Terrasoft.sdk.RecordPage.configureColumn("Account", "AccountAnniversaryDetailV2EmbeddedDetail", "AnniversaryType", {
	useAsLabel: true,
	label: {
		emptyText: "AccountRecordPage_accountAnniversariesDetail_AnniversaryType_emptyText",
		pickerTitle: "AccountRecordPage_accountAnniversariesDetail_AnniversaryType_label"
	}
});

Terrasoft.sdk.RecordPage.configureColumn("Account", "AccountAnniversaryDetailV2EmbeddedDetail", "Date", {
	hideLabel: true,
	viewType: {
		typeColumn: "AnniversaryType"
	}
});

Terrasoft.sdk.Actions.add("Account", {
	name: "Meeting",
	isVisibleInGrid: true,
	isDisplayTitle: true,
	actionClassName: "Terrasoft.ActionMeeting",
	title: "AccountActionMeeting_title",
	defineTitle: function() {
		return null;
	},
	modelName: "Activity",
	sourceModelColumnNames: ["Id"],
	destinationModelColumnNames: ["Account"],
	evaluateModelColumnConfig: [
		{
			column: "Owner",
			value: {
				isMacros: true,
				value: Terrasoft.ValueMacros.CurrentUserContact
			}
		},
		{
			column: "Author",
			value: {
				isMacros: true,
				value: Terrasoft.ValueMacros.CurrentUserContact
			}
		},
		{
			column: "ActivityCategory",
			value: "f51c4643-58e6-df11-971b-001d60e938c6"
		},
		{
			column: "Priority",
			value: "ab96fa02-7fe6-df11-971b-001d60e938c6"
		},
		{
			column: "Status",
			value: "384d4b84-58e6-df11-971b-001d60e938c6"
		},
		{
			column: "Type",
			value: "fbe0acdc-cfc0-df11-b00f-001d60e938c6"
		}
	]
});

Terrasoft.sdk.Details.configure("Account", "AccountContactsDetailV2StandartDetail", {
	position: 0
});

Terrasoft.sdk.Details.configure("Account", "ActivityDetailV2StandartDetail", {
	position: 1
});

Terrasoft.sdk.Actions.setOrder("Account", {
	"Meeting": 0,
	"Terrasoft.ActionCopy": 1,
	"Terrasoft.ActionDelete": 2
});