define("ServiceHelper", ["ext-base", "terrasoft"], function(Ext, Terrasoft) {

	/**
	 * Вызывает метод веб-сервиса.
	 * @param {String|Object} config Имя сервиса или параметры вызова сервиса.
	 * @param {String} methodName Имя метода.
	 * @param {Function} callback (optional) Функция обратного вызова.
	 * @param {Object} data (optional) Объект с данными запроса.
	 * @param {Object} scope (optional) Контекст вызова.
	 * @returns {Object} Экземпляр запроса.
	 */
	function internalCallService(config, methodName, callback, data, scope) {
		var serviceName;
		if (config && Ext.isObject(config)) {
			serviceName = config.serviceName;
			methodName = config.methodName;
			callback = config.callback;
			data = config.data;
			scope = config.scope;
		} else {
			serviceName = config;
		}
		var dataSend = data || {};
		var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/" + serviceName + "/" + methodName;
		var requestConfig = {
			url: requestUrl,
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			method: "POST",
			jsonData: Ext.encode(dataSend),
			callback: function(request, success, response) {
				if (!callback) {
					return;
				}
				var responseObject = response;
				if (success) {
					responseObject = Terrasoft.decode(response.responseText);
				}
				callback.call(this, responseObject, success);
			},
			scope: scope || this
		};
		if (config && config.timeout) {
			requestConfig.timeout = config.timeout;
		}
		return Terrasoft.AjaxProvider.request(requestConfig);
	}

	return {
		callService: internalCallService
	};
});