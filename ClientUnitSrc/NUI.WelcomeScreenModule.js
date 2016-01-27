define("WelcomeScreenModule", ["BaseSchemaModuleV2"/*"css!WelcomeScreenModule"*/],
		function() {
	Ext.define("Terrasoft.configuration.WelcomeScreenModule", {

		extend: "Terrasoft.BaseSchemaModule",
		alternateClassName: "Terrasoft.WelcomeScreenModule",

		/**
		 * @inheritDoc Terrasoft.BaseSchemaModule#generateViewContainerId
		 * @overridden
		 */
		generateViewContainerId: false,

		/**
		 * @inheritDoc Terrasoft.BaseSchemaModule#initSchemaName
		 * @overridden
		 */
		initSchemaName: function() {
			this.schemaName = "WelcomeScreen";
		},

		/**
		 * @inheritDoc Terrasoft.BaseSchemaModule#initHistoryState
		 * @overridden
		 */
		initHistoryState: Terrasoft.emptyFn

	});
	return Terrasoft.WelcomeScreenModule;
});