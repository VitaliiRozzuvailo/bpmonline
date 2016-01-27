define("ConfigurationEnumsV2", ["ConfigurationEnumsV2Resources"], function(resources) {

	Ext.ns("Terrasoft.ConfigurationEnums");

	Terrasoft.ConfigurationEnums.CardOperation = {
		ADD: "add",
		EDIT: "edit",
		COPY: "copy"
	};

	Ext.ns("Terrasoft.RightsEnums");

	Terrasoft.RightsEnums.operationTypes = {
		"read": 0,
		"edit": 1,
		"delete": 2
	};
	Terrasoft.RightsEnums.rightLevels = {
		allow: {
			Value: 1,
			Name: resources.localizableStrings.AllowRightCaption
		},
		allowAndGrant: {
			Value: 2,
			Name: resources.localizableStrings.AllowAndGrantRightCaption
		},
		deny: {
			Value: 0,
			Name: resources.localizableStrings.DenyRightCaption
		}
	};
	Terrasoft.RightsEnums.sysAdminUnitType = {
		"0": "DF93DCB9-6BD7-DF11-9B2A-001D60E938C6",
		"1": "B659F1C0-6BD7-DF11-9B2A-001D60E938C6",
		"2": "B759F1C0-6BD7-DF11-9B2A-001D60E938C6",
		"3": "462E97C7-6BD7-DF11-9B2A-001D60E938C6",
		"4": "472E97C7-6BD7-DF11-9B2A-001D60E938C6",
		"5": "F4044C41-DF2B-E111-851E-00155D04C01D"
	};

	/** @enum
	 * Шаблон тела схемы.
	 */
	Ext.ns("Terrasoft.ClientUnitSchemaBodyTemplate");
	Terrasoft.ClientUnitSchemaBodyTemplate[Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA] =
		"define(\"{0}\", [], function() {\n" +
		"\treturn {\n" +
		"\t\tentitySchemaName: \"{1}\",\n" +
		"\t\tdetails: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,\n" +
		"\t\tdiff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/,\n" +
		"\t\tmethods: {},\n" +
		"\t\trules: {}\n" +
		"\t};\n" +
		"});\n";
	Terrasoft.ClientUnitSchemaBodyTemplate[Terrasoft.SchemaType.MODULE_VIEW_MODEL_SCHEMA] =
	Terrasoft.ClientUnitSchemaBodyTemplate[Terrasoft.SchemaType.DETAIL_VIEW_MODEL_SCHEMA] =
	Terrasoft.ClientUnitSchemaBodyTemplate[Terrasoft.SchemaType.GRID_DETAIL_VIEW_MODEL_SCHEMA] =
		"define(\"{0}\", [], function() {\n" +
		"\treturn {\n" +
		"\t\tentitySchemaName: \"{1}\",\n" +
		"\t\tdetails: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,\n" +
		"\t\tdiff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/,\n" +
		"\t\tmethods: {}\n" +
		"\t};\n" +
		"});\n";

});
