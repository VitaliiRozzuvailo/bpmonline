define("LookupActivityConnectionModule", ["BaseProcessParametersEditModule"], function() {
	/**
	 * @class Terrasoft.configuration.LookupActivityConnectionModule
	 * Класс LookupActivityConnectionModule предназначен для создания экземпляра
	 */
	Ext.define("Terrasoft.configuration.LookupActivityConnectionModule", {
		alternateClassName: "Terrasoft.LookupActivityConnectionModule",
		extend: "Terrasoft.BaseProcessParametersEditModule",
		/**
		 * @overriden
		 */
		initSchemaName: function() {
			this.schemaName = "LookupActivityConnectionPage";
		},
		/**
		 * @overridden
		 */
		initParametersInfo: function() {
			this.parametersInfo = this.sandbox.publish("GetParametersInfo", null, [this.sandbox.id]) || {};
		}
	});
	return Terrasoft.LookupActivityConnectionModule;
});
