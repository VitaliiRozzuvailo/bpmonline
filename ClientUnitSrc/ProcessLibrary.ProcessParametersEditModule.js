define("ProcessParametersEditModule", ["BaseProcessParametersEditModule"], function(ModalBox) {
	/**
	 * @class Terrasoft.configuration.ProcessParametersEditModule
	 * Класс ProcessParametersEditModule предназначен для создания экземпляра
	 */
	Ext.define("Terrasoft.configuration.ProcessParametersEditModule", {
		alternateClassName: "Terrasoft.ProcessParametersEditModule",
		extend: "Terrasoft.BaseProcessParametersEditModule",
		/**
		 * @overriden
		 */
		initSchemaName: function() {
			this.schemaName = "ProcessParametersEditPage";
		},
		/**
		 * @overridden
		 */
		initParametersInfo: function() {
			this.parametersInfo = this.sandbox.publish("GetParametersInfo", null, [this.sandbox.id]) || {};
		}
	});
	return Terrasoft.ProcessParametersEditModule;
});
