define("BaseGeneratorV2", ["ext-base"], function(Ext) {
	var baseGenerator = Ext.define("Terrasoft.configuration.BaseGenerator", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.BaseGenerator",

		/**
		 * Имя генерируемой схемы.
		 * @protected
		 * @type {String}
		 */
		schemaName: "",

		/**
		 * Тип генерируемой схемы.
		 * @protected
		 * @type {Terrasoft.SchemaType}
		 */
		schemaType: null,

		/**
		 * Конфигурация построения схемы.
		 * @protected
		 * @type {Object}
		 */
		generateConfig: null,

		/**
		 * Генерирует имя колонки модели c коллекцией вкладок.
		 * @protected
		 * @virtual
		 * @param {Object} config Конфигурация элемента представления схемы.
		 * @return {String} Возвращает сгенерированное имя колонки модели.
		 */
		getTabsCollectionName: function(config) {
			return config.collection && config.collection.bindTo;
		},

		/**
		 * Инициализирует внутренние параметры генератора.
		 * @protected
		 * @virtual
		 * @param {Object} config Конфигурация построения схемы.
		 */
		init: function(config) {
			var schema = config.schema;
			this.generateConfig = config;
			this.schemaName = config.schemaName || (schema && schema.schemaName) || "";
			this.schemaType = config.schemaType || (schema && schema.type);
		},

		/**
		 * Очищает внутренние параметры генератора.
		 * @protected
		 * @virtual
		 */
		clear: function() {
			this.generateConfig = null;
			this.schemaName = null;
			this.schemaType = null;
		},

		/**
		 * Базовый метод генерации.
		 * @protected
		 * @virtual
		 * @param {Object} config Конфигурация построения схемы.
		 * @param {Function} callback Функция-callback.
		 * @param {Object} scope Контекст выполнения функции callback.
		 */
		generate: function(config, callback, scope) {
			this.init(config);
			callback.call(scope || this);
		}

	});
	return baseGenerator;
});
