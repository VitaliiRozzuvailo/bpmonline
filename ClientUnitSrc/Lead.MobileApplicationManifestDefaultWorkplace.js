{
	"Icons": [
		{
			"ImageListId": "69c7829d-37c2-449b-a24b-bcd7bf38a8be",
			"ImageId": "fe669099-69b4-479b-89bf-fdae8e245e4d"
		}
	],
	"SyncOptions": {
		"ModelDataImportConfig": [
			{
				"Name": "Lead",
				"SyncColumns": [
					"Account",
					"Contact",
					"LeadName",
					"FullJobTitle",
					"Industry",
					"BusinesPhone",
					"MobilePhone",
					"Email",
					"Fax",
					"Website",
					"Address",
					"City",
					"Region",
					"Country",
					"Zip",
					"AddressType",
					"InformationSource",
					"Commentary",
					"Status"
				]
			},
			{
				"Name": "Contact",
				"SyncColumns": []
			},
			{
				"Name": "Account",
				"SyncColumns": []
			},
			{
				"Name": "LeadStatus",
				"SyncColumns": [
					"Active"
				]
			},
			{
				"Name": "Activity",
				"SyncColumns": [
					"Lead"
				]
			},
			{
				"Name": "ActivityParticipant",
				"SyncColumns": [
					"Activity",
					"Participant"
				]
			},
			{
				"Name": "ActivityParticipantRole",
				"SyncColumns": []
			},
			{
				"Name": "InformationSource",
				"SyncColumns": []
			},
			{
				"Name": "AccountIndustry",
				"SyncColumns": []
			},
			{
				"Name": "AddressType",
				"SyncColumns": []
			},
			{
				"Name": "Country",
				"SyncColumns": []
			},
			{
				"Name": "Region",
				"SyncColumns": []
			},
			{
				"Name": "City",
				"SyncColumns": []
			},
			{
				"Name": "LeadTypeStatus",
				"SyncColumns": []
			},
			{
				"Name": "QualifyStatus",
				"SyncColumns": []
			},
			{
				"Name": "ActivityPriority",
				"SyncColumns": []
			},
			{
				"Name": "ActivityType",
				"SyncColumns": []
			},
			{
				"Name": "ActivityCategory",
				"SyncColumns": []
			},
			{
				"Name": "ActivityStatus",
				"SyncColumns": []
			}
		]
	},
	"Modules": {
		"Lead": {
			"Group": "main",
			"Model": "Lead",
			"Position": 3,
			"isStartPage": false,
			"Title": "LeadSectionTitle",
			"Icon": {
				"ImageId": "fe669099-69b4-479b-89bf-fdae8e245e4d"
			},
			"Hidden": false
		}
	},
	"Models": {
		"Account": {
			"RequiredModels": [
				"Lead"
			]
		},
		"Activity": {
			"RequiredModels": [
				"Lead",
				"Activity",
				"ActivityPriority",
				"ActivityType",
				"ActivityCategory",
				"ActivityStatus",
				"ActivityParticipant",
				"Contact",
				"ActivityParticipantRole"
			],
			"PagesExtensions": [
				"MobileActivityRecordPageSettingsDefaultWorkplace",
				"MobileActivityLeadModuleConfig"
			],
			"ModelExtensions": []
		},
		"Lead": {
			"RequiredModels": [
				"Lead",
				"InformationSource",
				"AccountIndustry",
				"AddressType",
				"Country",
				"Region",
				"City",
				"Contact",
				"Account",
				"LeadTypeStatus",
				"QualifyStatus",
				"LeadRegisterMethod",
				"Activity",
				"Department",
				"LeadStatus",
				"ActivityType",
				"ActivityStatus",
				"ActivityResult",
				"ActivityCategory",
				"ActivityPriority",
				"ActivityParticipant",
				"ActivityCategoryResultEntry",
				"SysImage"
			],
			"ModelExtensions": [
				"MobileLeadModelConfig"
			],
			"PagesExtensions": [
				"MobileLeadRecordPageSettingsDefaultWorkplace",
				"MobileLeadGridPageSettingsDefaultWorkplace",
				"MobileLeadActionsSettingsDefaultWorkplace",
				"MobileLeadModuleConfig"
			]
		}
	}
}