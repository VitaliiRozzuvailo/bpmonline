define('ResponseExceptionHelper', ['ext-base', 'ResponseExceptionHelperResources'],
	function(Ext, resources) {
		function converterToLocalizableString(message) {
			if (Ext.isEmpty(message)) {
				return;
			}
			if (message.indexOf("@") === 0) {
				var parameters = [];
				var stringValue = message;
				var startParametersIndex = message.indexOf("~");
				if (startParametersIndex !== -1) {
					parameters = message.substring(startParametersIndex + 1).split('~');
					stringValue = message.substring(0, startParametersIndex);
				}
				var stringValues = stringValue.split(',');
				var stringName = stringValues[1].split('.').join("");
				if (parameters != null) {
					return Ext.String.format(resources.localizableStrings[stringName], parameters);
				}
				return resources.localizableStrings[stringName];
			}
			return message;
		}
		function getExceptionMessage(ex) {
			return converterToLocalizableString(ex.message);
		}
		return {
			GetExceptionMessage: getExceptionMessage
		};
	});