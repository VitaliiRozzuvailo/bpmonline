define("TagModule", ["BaseSchemaModuleV2"], function() {
	Ext.define("Terrasoft.configuration.TagModule", {
		extend: "Terrasoft.BaseSchemaModule",
		alternateClassName: "Terrasoft.TagModule",

		/**
		 * @inheritDoc Terrasoft.BaseSchemaModule#generateViewContainerId
		 * @overridden
		 */
		generateViewContainerId: false,

		/**
		 * @inheritDoc Terrasoft.BaseSchemaModule#initSchemaName
		 * @overridden
		 */
		initSchemaName: function () {
			this.schemaName = "TagModuleSchema";
		},

		/**
		 * @inheritDoc Terrasoft.BaseSchemaModule#initHistoryState
		 * @overridden
		 */
		initHistoryState: Ext.emptyFn,

		/**
		 * Создает модель и инциализирует ее параметрами модуля.
		 * @overridden
		 */
		createViewModel: function() {
			var viewModel = this.callParent(arguments);
			var parameters = this.parameters;
			if (parameters) {
				viewModel.set("TagSchemaName", parameters.TagSchemaName);
				viewModel.set("InTagSchemaName", parameters.InTagSchemaName);
				viewModel.set("RecordId", parameters.RecordId);
			}
			return viewModel;
		}
	});
	return Terrasoft.TagModule;
});