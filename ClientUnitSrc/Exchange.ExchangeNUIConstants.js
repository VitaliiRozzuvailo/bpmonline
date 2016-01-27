define("ExchangeNUIConstants", ["terrasoft", "ExchangeNUIConstantsResources", "ConfigurationConstants"],
	function(Terrasoft, resources, ConfigurationConstants) {

		var mailServer = {
			Type: {
				Imap: "844f0837-eaa0-4f40-b965-71f5db9eae6e",
				Exchange: "3490bd45-4f4d-4613-aa06-454546f3342a"
			}
		};
		var exchangeFolder = {
			NoteClass: {
				Name: "IPF.Note"
			},
			AppointmentClass: {
				Name: "IPF.Appointment"
			},
			ContactClass: {
				Name: "IPF.Contact"
			},
			TaskClass: {
				Name: "IPF.Task"
			},
			BPMContact: {
				Name: "BPM.ContactFolder",
				SchemaName: "ContactFolder",
				SchemaFilters: [
					Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "FolderType",
						ConfigurationConstants.Folder.Type.Search)
				]
			},
			BPMActivity: {
				Name: "BPM.ActivityFolder",
				SchemaName: "ActivityFolder",
				SchemaFilters: [
					Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "FolderType",
						ConfigurationConstants.Folder.Type.Search)
				]
			}
		};

		return {
			MailServer: mailServer,
			ExchangeFolder: exchangeFolder
		};
	});