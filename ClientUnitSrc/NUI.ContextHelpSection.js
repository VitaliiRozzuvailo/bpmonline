define("ContextHelpSection", [], function() {
	return {
		entitySchemaName: "ContextHelp",
		methods: {
			/**
			 * @inheritDoc Terrasoft.BaseSchemaViewModel#getEntityStructure
			 * @overridden
			 */
			getEntityStructure: function() {
				var entityStructure = this.callParent(arguments);
				if (this.Ext.isEmpty(entityStructure)) {
					entityStructure = {
						ObjectentitySchemaName: "ContextHelp",
						pages: [
							{
								caption: this.get("Resources.Strings.AddRecordButtonCaption"),
								captionLcz: this.get("Resources.Strings.HeaderCaption"),
								cardSchema: "ContextHelpPage"
							}
						]
					};
				}
				return entityStructure;
			},

			/**
			 * @inheritDoc Terrasoft.BaseSchemaViewModel#getModuleStructure
			 * @overridden
			 */
			getModuleStructure: function() {
				var moduleStructure = this.callParent(arguments);
				if (this.Ext.isEmpty(moduleStructure)) {
					moduleStructure = {
						cardSchema: "ContextHelpPage",
						entitySchemaName: "ContextHelp",
						moduleCaption: this.get("Resources.Strings.HeaderCaption"),
						moduleHeader: this.get("Resources.Strings.SchemaCaption"),
						sectionSchema: "ContextHelpSection"
					};
				}
				return moduleStructure;
			}
		},
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
	};
});
