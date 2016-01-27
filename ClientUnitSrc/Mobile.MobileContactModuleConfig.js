Terrasoft.sdk.RecordPage.setTitle("Contact", "create", "ContactEditPage_navigationPanel_title_create");

Terrasoft.sdk.RecordPage.configureColumn("Contact", "primaryColumnSet", "Name", {
	isMultiline: true
});

Terrasoft.sdk.RecordPage.configureColumn("Contact", "primaryColumnSet", "Account", {
	viewType: Terrasoft.ViewTypes.Preview
});

Terrasoft.sdk.RecordPage.configureColumn("Contact", "ContactCommunicationDetailEmbeddedDetail", "Number", {
	hideLabel: true,
	viewType: {
		typeColumn: "CommunicationType"
	}
});

Terrasoft.sdk.RecordPage.configureEmbeddedDetail("Contact", "ContactCommunicationDetailEmbeddedDetail", {
	title: "ContactRecordPage_contactCommunicationsDetail_title",
	displaySeparator: false,
	isCollapsed: false
});

Terrasoft.sdk.RecordPage.configureColumn("Contact", "ContactCommunicationDetailEmbeddedDetail", "CommunicationType", {
	useAsLabel: true,
	label: {
		emptyText: "ContactRecordPage_contactCommunicationsDetail_CommunicationType_emptyText",
		pickerTitle: "ContactRecordPage_contactCommunicationsDetail_CommunicationType_label"
	}
});

Terrasoft.sdk.RecordPage.configureEmbeddedDetail("Contact", "ContactAddressDetailV2EmbeddedDetail", {
	title: "ContactRecordPage_contactAddressesDetail_title",
	orderByColumns: [
		{
			column: "Primary",
			orderType: Terrasoft.OrderTypes.DESC
		}
	]
});

Terrasoft.sdk.RecordPage.configureColumn("Contact", "ContactAddressDetailV2EmbeddedDetail", "Address", {
	viewType: Terrasoft.ViewTypes.Map,
	typeConfig: {
		additionalMapColumns: ["City", "Region", "Country"]
	}
});

Terrasoft.sdk.RecordPage.addColumn("Contact", {
	name: "Primary",
	hidden: true
}, "ContactAddressDetailV2EmbeddedDetail");

Terrasoft.sdk.RecordPage.configureEmbeddedDetail("Contact", "ContactAnniversaryDetailV2EmbeddedDetail", {
	title: "ContactRecordPage_contactAnniversariesDetail_title",
	orderByColumns: [
		{
			column: "Date",
			orderType: Terrasoft.OrderTypes.ASC
		}
	],
	displaySeparator: false
});

Terrasoft.sdk.RecordPage.configureColumn("Contact", "ContactAnniversaryDetailV2EmbeddedDetail", "AnniversaryType", {
	useAsLabel: true,
	label: {
		emptyText: "ContactRecordPage_contactAnniversariesDetail_AnniversaryType_emptyText",
		pickerTitle: "ContactRecordPage_contactAnniversariesDetail_AnniversaryType_label"
	}
});

Terrasoft.sdk.RecordPage.configureColumn("Contact", "ContactAnniversaryDetailV2EmbeddedDetail", "Date", {
	hideLabel: true,
	viewType: {
		typeColumn: "AnniversaryType"
	}
});

Terrasoft.sdk.GridPage.setImageColumn("Contact", "Photo.PreviewData", "e9f90b9c-4788-4853-a318-6e2f48d4157d");

Terrasoft.sdk.RecordPage.setImageConfig("Contact", {
	column: "Photo",
	imageDataColumnName: "PreviewData",
	imageDisplayColumnName: "Name",
	defaultImageId: "5d16c363-a9b4-41a5-80c8-95b24e737441"
});

Terrasoft.sdk.GridPage.setOrderByColumns("Contact",	{
	column: "Name",
	orderType: Terrasoft.OrderTypes.ASC
});

Terrasoft.sdk.Actions.add("Contact", {
	name: "Phone",
	isVisibleInGrid: true,
	actionClassName: "Terrasoft.ActionPhone",
	title: "Sys.Action.Phone.Caption",
	labelColumn: "CommunicationType",
	valueColumn: "Number",
	communication: {
		model: "ContactCommunication",
		filterColumn: "Contact"
	}
});

Terrasoft.sdk.Actions.add("Contact", {
	name: "Email",
	isVisibleInGrid: true,
	actionClassName: "Terrasoft.ActionEmail",
	title: "Sys.Action.Email.Caption",
	labelColumn: "CommunicationType",
	valueColumn: "Number",
	communication: {
		model: "ContactCommunication",
		filterColumn: "Contact"
	}
});

Terrasoft.sdk.Actions.add("Contact", {
	name: "Meeting",
	isVisibleInGrid: true,
	isDisplayTitle: true,
	actionClassName: "Terrasoft.ActionMeeting",
	title: "Sys.Action.Meeting.Caption",
	defineTitle: "Sys.Action.Meeting.Title",
	modelName: "Activity",
	sourceModelColumnNames: ["Id"],
	destinationModelColumnNames: ["Contact"],
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
			value: "42c74c49-58e6-df11-971b-001d60e938c6"
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

Terrasoft.sdk.Details.configure("Contact", "ActivityDetailV2StandartDetail", {
	filters: Ext.create("Terrasoft.Filter", {
		type: Terrasoft.FilterTypes.Group,
		subfilters: [
			Ext.create("Terrasoft.Filter", {
				compareType: Terrasoft.ComparisonTypes.NotEqual,
				property: "Type",
				value: Terrasoft.GUID.ActivityTypeEmail
			}),
			Ext.create("Terrasoft.Filter", {
				property: "Status.Finish",
				value: false
			})
		]
	})
});

Terrasoft.sdk.Actions.setOrder("Contact", {
	"Phone": 0,
	"Email": 1,
	"Meeting": 2,
	"Terrasoft.ActionCopy": 3,
	"Terrasoft.ActionDelete": 4
});