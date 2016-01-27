define("MacrosModule", ["BaseSchemaModuleV2"], function() {
	Ext.define("Terrasoft.configuration.MacrosModule", {
		extend: "Terrasoft.BaseSchemaModule",
		alternateClassName: "Terrasoft.MacrosModule",

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#generateViewContainerId
		 * @overridden
		 */
		generateViewContainerId: false,

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#initSchemaName
		 * @overridden
		 */
		initSchemaName: function() {
			this.schemaName = "MacrosPage";
		},

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#initHistoryState
		 * @overridden
		 */
		initHistoryState: Terrasoft.emptyFn
	});
	return Terrasoft.MacrosModule;
});
