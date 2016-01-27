define("XORParametersEditModule", ["BaseProcessParametersEditModule"], function() {
	/**
	 * @class Terrasoft.configuration.ProcessXORParametersEditModule
	 * Класс ProcessXORParametersEditModule предназначен для создания экземпляра
	 */
	Ext.define("Terrasoft.configuration.XORParametersEditModule", {
		alternateClassName: "Terrasoft.XORParametersEditModule",
		extend: "Terrasoft.BaseProcessParametersEditModule",
		/**
		 * @overriden
		 */
		initSchemaName: function() {
			this.schemaName = "ProcessXORParametersEditPage";
		},
		/**
		 * @overridden
		 */
		initParametersInfo: function() {
			this.parametersInfo = this.sandbox.publish("GetParametersInfo", null, [this.sandbox.id]) || {};
		}
	});
	return Terrasoft.XORParametersEditModule;
});
