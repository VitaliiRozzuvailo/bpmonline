define("ContextHelpMixin", [], function() {
	Ext.define("Terrasoft.configuration.mixins.ContextHelpMixin", {
		alternateClassName: "Terrasoft.ContextHelpMixin",

		/**
		 * Инициализирует контекстную справку.
		 * @protected
		 * @virtual
		 */
		initContextHelp: function() {
			var contextHelpConfig = this.getContextHelpConfig();
			this.sandbox.publish("InitContextHelp", contextHelpConfig);
		},

		/**
		 * Возвращает обьект конфигурации контекстной справки.
		 * @protected
		 * @virtual
		 * @return {Object} Обьект конфигурации контекстной справки.
		 */
		getContextHelpConfig: function() {
			return {
				contextHelpId: this.getContextHelpId(),
				contextHelpCode: this.getContextHelpCode()
			};
		},

		/**
		 * Возвращает код контекстной справки.
		 * @protected
		 * @virtual
		 * @return {String} Идентификатор страницы контекстной справки.
		 */
		getContextHelpId: Terrasoft.emptyFn,

		/**
		 * Возвращает код контекстной справки.
		 * @protected
		 * @virtual
		 * @return {String} Код контекстной справки.
		 */
		getContextHelpCode: function() {
			return this.Terrasoft.moduleName;
		}
	});

	return Terrasoft.ContextHelpMixin;
});
