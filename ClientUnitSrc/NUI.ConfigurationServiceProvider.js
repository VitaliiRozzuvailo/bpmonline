define([], function() {
	Ext.define("Terrasoft.configuration.ConfigurationServiceProvider", {
		extend: "Terrasoft.BaseServiceProvider",
		alternateClassName: "Terrasoft.ConfigurationServiceProvider",
		singleton: true,

		/**
		 * @inheritdoc Terrasoft.BaseServiceProvider#prepareResponse
		 * @overridden
		 */
		prepareResponse: function(requestConfig, response) {
			var responseClassName = requestConfig.responseClassName;
			var resultPropertyName = requestConfig.resultPropertyName;
			if (responseClassName && resultPropertyName) {
				var resultPropertyValue = response[resultPropertyName];
				return Ext.create(responseClassName, resultPropertyValue);
			}
			return this.callParent(arguments);
		}
	});
});
