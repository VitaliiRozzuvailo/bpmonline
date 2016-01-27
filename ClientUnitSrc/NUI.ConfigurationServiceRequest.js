define(["ConfigurationServiceProvider"], function() {
	Ext.define("Terrasoft.configuration.ConfigurationServiceRequest", {
		extend: "Terrasoft.BaseRequest",
		alternateClassName: "Terrasoft.ConfigurationServiceRequest",

		/**
		 * Путь к сервису.
		 * @protected
		 * @type {String}
		 */
		serviceUrl: "../rest",

		/**
		 * Название сервиса.
		 * @protected
		 * @type {String}
		 */
		serviceName: "",

		/**
		 * Название свойства объекта ответа, которое хранит результат выполнения запроса.
		 * @protected
		 * @type {String}
		 */
		resultPropertyName: "",

		/**
		 * Суффикс названия свойства объекта ответа, которое хранит результат выполнения запроса.
		 * @private
		 * @type {String}
		 */
		resultPropertyNameSuffix: "Result",

		/**
		 * @inheritdoc Terrasoft.BaseRequest#constructor
		 * @overridden
		 */
		constructor: function() {
			this.callParent(arguments);
			this.serviceProvider = Terrasoft.ConfigurationServiceProvider;
		},

		/**
		 * Получает URL для запроса к веб-сервису.
		 * @protected
		 * @return {String} URL для запроса к веб-сервису.
		 */
		getRequestUrl: function() {
			return Terrasoft.combinePath(this.serviceUrl, this.serviceName, this.contractName);
		},

		/**
		 * Возвращает название свойства объекта ответа, которое хранит результат выполнения запроса.
		 * @param {Object} config Конфигурация запроса.
		 * @return {String} Название свойства объекта ответа, которое хранит результат выполнения запроса.
		 */
		getResultPropertyName: function(config) {
			var resultPropertyName = this.resultPropertyName;
			if (resultPropertyName) {
				return resultPropertyName;
			}
			var contractName = config.contractName || this.contractName;
			return (contractName + this.resultPropertyNameSuffix);
		},

		/**
		 * @inheritdoc Terrasoft.BaseRequest#getRequestConfig
		 * @overridden
		 */
		getRequestConfig: function() {
			var config = this.callParent(arguments);
			return Ext.apply({}, config, {
				url: this.getRequestUrl(),
				resultPropertyName: this.getResultPropertyName(config)
			});
		},

		/**
		 * @inheritdoc Terrasoft.BaseRequest#validate
		 * @overridden
		 */
		validate: function() {
			this.callParent(arguments);
			if (!this.serviceName) {
				throw new Terrasoft.NullOrEmptyException({
					message: "serviceName"
				});
			}
		}
	});
});
