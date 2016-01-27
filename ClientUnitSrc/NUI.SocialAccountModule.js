define("SocialAccountModule", [], function() {
	Ext.define("Terrasoft.configuration.SocialAccountModule", {
		extend: "Terrasoft.BaseSchemaModule",
		alternateClassName: "Terrasoft.SocialAccountModule",

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
			this.schemaName = "SocialAccountModuleSchema";
		}
	});
	return Terrasoft.SocialAccountModule;
});