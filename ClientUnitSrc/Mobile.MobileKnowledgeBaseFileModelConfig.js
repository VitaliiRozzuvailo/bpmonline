Terrasoft.sdk.Model.setDefaultValuesFunc("KnowledgeBaseFile", function(model, record) {
	FileType.load(Terrasoft.Configuration.FileTypeGUID.File, {
		success: function(loadedRecord) {
			record.set("Type", loadedRecord);
		}
	});
});

Terrasoft.Configuration.FileTypeGUID.KnowledgeBaseLink = "549bc2f8-0ee0-df11-971b-001d60e938c6";
Terrasoft.sdk.Model.addBusinessRule("KnowledgeBaseFile", {
	ruleType: Terrasoft.RuleTypes.Visibility,
	name: "KnowledgeBaseFileVisibleFileRule",
	conditionalColumns: [
		{name: "Type", value: Terrasoft.Configuration.FileTypeGUID.File}
	],
	events: [Terrasoft.BusinessRuleEvents.Load],
	dependentColumnNames: ["Data"]
});
Terrasoft.sdk.Model.addBusinessRule("KnowledgeBaseFile", {
	ruleType: Terrasoft.RuleTypes.Visibility,
	name: "KnowledgeBaseFileVisibleLinkRule",
	conditionalColumns: [
		{name: "Type", value: Terrasoft.Configuration.FileTypeGUID.Link}
	],
	events: [Terrasoft.BusinessRuleEvents.Load],
	dependentColumnNames: ["Name"]
});
Terrasoft.sdk.Model.addBusinessRule("KnowledgeBaseFile", {
	ruleType: Terrasoft.RuleTypes.Visibility,
	name: "KnowledgeBaseFileVisibleKnowledgeBaseLinkRule",
	conditionalColumns: [
		{name: "Type", value: Terrasoft.Configuration.FileTypeGUID.KnowledgeBaseLink}
	],
	events: [Terrasoft.BusinessRuleEvents.Load],
	dependentColumnNames: ["Name"]
});
