Terrasoft.sdk.RecordPage.addEmbeddedDetail("KnowledgeBase", {
		name: "KnowledgeBaseFilesDetail",
		position: 0,
		title: "KnowledgeBase_FilesDetail_title",
		modelName: "KnowledgeBaseFile",
		primaryKey: "Id",
		foreignKey: "KnowledgeBase",
		displaySeparator: false
	},
	[
		{
			name: "Data",
			displayColumn: "Name",
			label: "KnowledgeBaseRecordPage_FilesDetail_Data",
			viewType: Terrasoft.ViewTypes.File
		},
		{
			name: "Type",
			hidden: true
		},
		{
			name: "Name",
			label: "KnowledgeBaseRecordPage_FilesDetail_Name",
			viewType: Terrasoft.ViewTypes.Url
		}
	]);