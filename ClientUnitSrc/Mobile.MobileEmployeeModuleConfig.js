Terrasoft.sdk.RecordPage.setTitle('Employee', 'preview', 'EmployeePreviewPage_navigationPanel_title');

Terrasoft.sdk.RecordPage.setTitle('Employee', 'update', 'EmployeeEditPage_navigationPanel_title_update');

Terrasoft.sdk.RecordPage.setTitle('Employee', 'create', 'EmployeeEditPage_navigationPanel_title_create');

Terrasoft.sdk.RecordPage.addColumnSet('Employee', {
	name: 'primaryColumnset',
	isPrimary: true,
	position: 0
});

Terrasoft.sdk.RecordPage.addEmbeddedDetail('Employee', {
	name: 'EmployeeCommunicationsDetail',
	position: 1,
	title: 'EmployeeRecordPage_EmployeeCommunicationsDetail_title',
	modelName: 'ContactCommunication',
	primaryKey: 'Id',
	foreignKey: 'Contact',
	displaySeparator: false
});

Terrasoft.sdk.RecordPage.addEmbeddedDetail('Employee', {
	name: 'EmployeeAddressesDetail',
	position: 2,
	title: 'EmployeeRecordPage_EmployeeAddressesDetail_title',
	modelName: 'ContactAddress',
	primaryKey: 'Id',
	foreignKey: 'Contact',
	orderByColumns: [
		{
			column: 'Primary',
			orderType: Terrasoft.OrderTypes.DESC
		}
	],
	displaySeparator: true
});

Terrasoft.sdk.RecordPage.addColumnSet('Employee', {
	name: 'jobColumnset',
	position: 3,
	title: 'EmployeeRecordPage_jobColumnset_title'
});

Terrasoft.sdk.RecordPage.addEmbeddedDetail('Employee', {
	name: 'EmployeeAnniversariesDetail',
	position: 4,
	title: 'EmployeeRecordPage_EmployeeAnniversariesDetail_title',
	modelName: 'ContactAnniversary',
	primaryKey: 'Id',
	foreignKey: 'Contact',
	orderByColumns: [
		{
			column: 'Date',
			orderType: Terrasoft.OrderTypes.ASC
		}
	],
	displaySeparator: false
});

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'Name',
	position: 0,
	isMultiline: true,
	label: 'EmployeeRecordPage_primaryColumnset_Name_label'
}, 'primaryColumnset');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'Account',
	position: 1,
	viewType: Terrasoft.ViewTypes.Preview,
	label: 'EmployeeRecordPage_primaryColumnset_Account_label'
}, 'primaryColumnset');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'CommunicationType',
	position: 0,
	isRelated: true,
	label: {
		emptyText: 'EmployeeRecordPage_EmployeeCommunicationsDetail_CommunicationType_emptyText',
		pickerTitle: 'EmployeeRecordPage_EmployeeCommunicationsDetail_CommunicationType_label'
	}
}, 'EmployeeCommunicationsDetail');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'Number',
	position: 1,
	relation: 'CommunicationType'
}, 'EmployeeCommunicationsDetail');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'AddressType',
	position: 0,
	label: 'EmployeeRecordPage_EmployeeAddressesDetail_AddressType_label'
}, 'EmployeeAddressesDetail');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'Address',
	position: 1,
	viewType: Terrasoft.ViewTypes.Map,
	additionalMapColumns: ['City', 'Region', 'Country'],
	label: 'EmployeeRecordPage_EmployeeAddressesDetail_Address_label'
}, 'EmployeeAddressesDetail');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'City',
	position: 2,
	label: 'EmployeeRecordPage_EmployeeAddressesDetail_City_label'
}, 'EmployeeAddressesDetail');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'Region',
	position: 3,
	label: 'EmployeeRecordPage_EmployeeAddressesDetail_Region_label'
}, 'EmployeeAddressesDetail');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'Country',
	position: 4,
	label: 'EmployeeRecordPage_EmployeeAddressesDetail_Country_label'
}, 'EmployeeAddressesDetail');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'Zip',
	position: 5,
	label: 'EmployeeRecordPage_EmployeeAddressesDetail_Zip_label'
}, 'EmployeeAddressesDetail');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'Primary',
	position: 6,
	label: 'EmployeeRecordPage_EmployeeAddressesDetail_Primary_label'
}, 'EmployeeAddressesDetail');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'Department',
	position: 0,
	label: 'EmployeeRecordPage_jobColumnset_Department_label'
}, 'jobColumnset');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'JobTitle',
	position: 1,
	label: 'EmployeeRecordPage_jobColumnset_JobTitle_label'
}, 'jobColumnset');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'AnniversaryType',
	position: 0,
	isRelated: true,
	label: {
		emptyText: 'EmployeeRecordPage_EmployeeAnniversariesDetail_AnniversaryType_emptyText',
		pickerTitle: 'EmployeeRecordPage_EmployeeAnniversariesDetail_AnniversaryType_label'
	}
}, 'EmployeeAnniversariesDetail');

Terrasoft.sdk.RecordPage.addColumn('Employee', {
	name: 'Date',
	position: 1
}, 'EmployeeAnniversariesDetail');

Terrasoft.sdk.GridPage.setPrimaryColumn('Employee', 'Name');

Terrasoft.sdk.GridPage.setSecondaryColumn('Employee', 'Account');

Terrasoft.sdk.GridPage.setSearchColumn('Employee', 'Name');

Terrasoft.sdk.GridPage.setOrderByColumns('Employee',	{
	column: 'Name',
	orderType: Terrasoft.OrderTypes.ASC
});

Terrasoft.sdk.GridPage.setTitle('Employee', 'EmployeeGridPage_navigationPanel_title');

Terrasoft.sdk.Actions.add('Employee', {
	name: 'Phone',
	isVisibleInGrid: true,
	actionClassName: 'Terrasoft.ActionPhone',
	title: Terrasoft.util.getLocalizedString('Sys.Action.Phone.Caption'),
	labelColumn: 'CommunicationType',
	valueColumn: 'Number',
	communication: {
		model: 'ContactCommunication',
		filterColumn: 'Contact'
	}
});

Terrasoft.sdk.Actions.add('Employee', {
	name: 'Email',
	isVisibleInGrid: true,
	actionClassName: 'Terrasoft.ActionEmail',
	title: Terrasoft.util.getLocalizedString('Sys.Action.Email.Caption'),
	labelColumn: 'CommunicationType',
	valueColumn: 'Number',
	communication: {
		model: 'ContactCommunication',
		filterColumn: 'Contact'
	}
});

Terrasoft.sdk.Actions.add('Employee', {
	name: 'Meeting',
	isVisibleInGrid: true,
	actionClassName: 'Terrasoft.ActionMeeting',
	title: Terrasoft.util.getLocalizedString('Sys.Action.Meeting.Caption'),
	defineTitle: Terrasoft.util.getLocalizedString('Sys.Action.Meeting.Title'),
	modelName: 'Activity',
	sourceModelColumnNames: ['Id'],
	destinationModelColumnNames: ['Contact'],
	evaluateModelColumnConfig: [
		{
			column: 'Owner',
			value: {
				isMacros: true,
				value: Terrasoft.ValueMacros.CurrentUserContact
			}
		},
		{
			column: 'Author',
			value: {
				isMacros: true,
				value: Terrasoft.ValueMacros.CurrentUserContact
			}
		},
		{
			column: 'ActivityCategory',
			value: '42c74c49-58e6-df11-971b-001d60e938c6'
		},
		{
			column: 'StartDate',
			value: {
				isMacros: true,
				value: Terrasoft.ValueMacros.CurrentDateTime
			}
		},
		{
			column: 'DueDate',
			value: {
				value: Terrasoft.ValueMacros.CurrentDateTime,
				param: {
					datePart: 'm',
					value: 30
				},
				isMacros: true
			}
		},
		{
			column: 'Priority',
			value: 'ab96fa02-7fe6-df11-971b-001d60e938c6'
		},
		{
			column: 'Status',
			value: '384d4b84-58e6-df11-971b-001d60e938c6'
		},
		{
			column: 'Type',
			value: 'fbe0acdc-cfc0-df11-b00f-001d60e938c6'
		}
	]
});

Terrasoft.sdk.Actions.add('Employee', {
	name: 'Delete',
	actionClassName: 'Terrasoft.ActionDelete',
	title: Terrasoft.util.getLocalizedString('Sys.Action.Delete.Caption')
});

Terrasoft.sdk.Details.add('Employee', {
	name: 'EmployeeActivities',
	title: Terrasoft.util.getLocalizedString('EmployeePreviewPage_EmployeeActivitiesDetailGridPage_label'),
	model: 'Activity',
	parentColumnName: 'Contact',
	isReadOnly: false,
	parentFilter: Ext.create('Terrasoft.Filter', {
		property: 'Participant',
		modelName: 'ActivityParticipant',
		assocProperty: 'Activity',
		operation: Terrasoft.FilterOperations.Any
	}),
	filters: Ext.create('Terrasoft.Filter', {
		type: Terrasoft.FilterTypes.Group,
		subfilters: [
			Ext.create('Terrasoft.Filter', {
				compareType: Terrasoft.ComparisonTypes.NotEqual,
				property: 'Type',
				value: Terrasoft.GUID.ActivityTypeEmail
			}),
			Ext.create('Terrasoft.Filter', {
				property: 'Status.Finish',
				value: false
			})
		]
	})
});

Terrasoft.sdk.Details.add('Employee', {
	name: 'EmployeeOpportunities',
	title: Terrasoft.util.getLocalizedString('EmployeePreviewPage_EmployeeOpportunitiesDetailGridPage_label'),
	model: 'Opportunity',
	parentColumnName: 'Contact',
	isReadOnly: false,
	parentFilter: Ext.create('Terrasoft.Filter', {
		property: 'Contact'
	})
});