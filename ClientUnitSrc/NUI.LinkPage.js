define("LinkPage", ["ext-base", "terrasoft", "LinkPageStructure", "LinkPageResources",
	"ConfigurationConstants", "ConfigurationEnums"],
	function(Ext, Terrasoft, structure, resources, ConfigurationConstants, ConfigurationEnums) {
	structure.userCode = function() {

		var valuePairs = this.entityInfo.valuePairs || [];
		var baseEntitySchemaName;
		Terrasoft.each(valuePairs, function(item) {
			if (item.name === "EntitySchemaName") {
				this.entitySchema = Terrasoft[item.value];
			}
		}, this);

		this.canChangeStructure = false;
		this.name = "LinkPageViewModel";
		this.schema.rightPanel = [];
		this.schema.leftPanel = [{
			type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
			name: "Id",
			columnPath: "Id",
			visible: false,
			viewVisible: false
		}, {
			type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
			name: "Type",
			columnPath: "Type",
			dataValueType: Terrasoft.DataValueType.ENUM,
			visible: false
		}, {
			type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
			name: baseEntitySchemaName,
			columnPath: baseEntitySchemaName,
			dataValueType: Terrasoft.DataValueType.LOOKUP,
			visible: false
		}, {
			type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
			isRequired: true,
			name: "Name",
			columnPath: "Name",
			caption: resources.localizableStrings.LinkCaption,
			dataValueType: Terrasoft.DataValueType.TEXT,
			visible: true
		}, {
			type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
			name: "Notes",
			columnPath: "Notes",
			dataValueType: Terrasoft.DataValueType.TEXT,
			visible: true,
			customConfig: {
				className: "Terrasoft.controls.MemoEdit",
				height: "100px"
			}
		}];

		this.methods.getHeader = function() {
			return resources.localizableStrings.LinkCaption;
		};

		this.methods.init = function() {
			if (this.action === ConfigurationEnums.CardState.Add) {
				this.set("Type", {value: ConfigurationConstants.FileType.Link});
			}
		};
	};
	return structure;
});
