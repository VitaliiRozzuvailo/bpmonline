define('PreconfiguredPageViewGenerator', ['ext-base', 'terrasoft', 'PreconfiguredPageViewGeneratorResources',
	'ViewUtilities'],
	function(Ext, Terrasoft, resources, ViewUtilities) {
		function getViewConfig(schemaConfig) {
			var config = Terrasoft.deepClone(schemaConfig);
			updateUtilsButtonsConfig(config);
			return ViewUtilities.getPageConfig(config);
		}
		function updateUtilsButtonsConfig(config) {
			Terrasoft.each(config.utils, function(buttonConfig) {
				if (Ext.isEmpty(buttonConfig.validate) || buttonConfig.validate) {
					buttonConfig.methodName = 'doUtilsActionForceProcess';
				} else {
					buttonConfig.methodName = 'doUtilsActionCancelProcess';
				}
			});
		}
		return {
			generate: getViewConfig
		};
	});