define("BaseProcessParametersEditModule", ["ModalBox", "BaseSchemaModuleV2"], function(ModalBox) {
	/**
	 * @class Terrasoft.configuration.BaseProcessParametersEditModule
	 * Класс BaseProcessParametersEditModule предназначен для создания экземпляра
	 */
	Ext.define("Terrasoft.configuration.BaseProcessParametersEditModule", {
		alternateClassName: "Terrasoft.BaseProcessParametersEditModule",
		extend: "Terrasoft.BaseSchemaModule",
		/**
		 * Информация о параметрах
		 */
		parametersInfo: null,
		/**
		 * Заменяет последний элемент в цепочке состояний, если его идентификатор модуля отличается от текущего
		 * @protected
		 * @overriden
		 */
		initHistoryState: Ext.emptyFn,
		/**
		 * Инициализирует данные о параметрах
		 * @private
		 */
		initParametersInfo: Ext.emptyFn,
		/**
		 * Инициализация состояние, названия схемы, генерирует класс модели представления и представление.
		 * После этого создает и инициализирует экземпляр представления
		 * @overriden
		 */
		init: function() {
			this.initParametersInfo();
			this.callParent(arguments);
		},
		/**
		 * Возвращает объект настроек модели представления.
		 * @return {Object} Возвращает объект настроек модели представления.
		 */
		getViewModelConfig: function() {
			var viewModelConfig = this.callParent(arguments);
			var values = {
				modalBoxCaption: this.parametersInfo.modalBoxCaption
			};
			values = Ext.apply(values, this.parametersInfo.parameters);
			Ext.apply(viewModelConfig, {
				values: values
			});
			return viewModelConfig;
		},
		/**
		 * @overridden
		 * @protected
		 */
		generateSchemaStructure: function(callback, scope) {
			var config = {
				schemaName: this.schemaName,
				profileKey: this.getProfileKey(),
				useCache: false
			};
			this.schemaBuilder.build(config, function(viewModelClass, viewConfig) {
				callback.call(scope, viewModelClass, viewConfig);
			}, this);
		}
	});
	return Terrasoft.BaseProcessParametersEditModule;
});
