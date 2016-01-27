define("ConfigurationModuleV2", ["BusinessRulesApplierV2", "BaseSchemaModuleV2"], function(BusinessRulesApplier) {

	/**
	 * @class Terrasoft.configuration.ConfigurationModule
	 * Класс модуля настройки элементов итога.
	 */
	Ext.define("Terrasoft.configuration.ConfigurationModule", {
		alternateClassName: "Terrasoft.ConfigurationModule",
		extend: "Terrasoft.BaseSchemaModule",

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#createViewModel
		 * Метод для схем карточек, применяет зависимости колонок
		 * (см. {@link Terrasoft.BusinessRulesApplier.applyDependencies}).
		 * @protected
		 * @overridden
		 * @param {Object} viewModelClass Класс модели представления схемы.
		 * @return {Object} Возвращает экземпляр модели представления схемы.
		 */
		createViewModel: function() {
			var viewModel = this.callParent(arguments);
			BusinessRulesApplier.applyDependencies(viewModel);
			return viewModel;
		},


		/**
		 * Подготавливает новое состояние страницы
		 * @protected
		 * @overridden
		 * @return {Object} Возвращает новое состояние страницы
		 */
		prepareHistorySate: function() {
			var newState = this.callParent(arguments);
			this.schemaName = newState.designerSchemaName;
			delete newState.designerSchemaName;
			return newState;
		},

		/**
		 * Инициализирует название схемы.
		 * @protected
		 * @overridden
		 */
		initSchemaName: function() {
			var historyState = this.sandbox.publish("GetHistoryState");
			var hash = historyState.hash;
			var state = historyState.state;
			this.schemaName = this.schemaName || hash.entityName || "";
		}

	});
	return Terrasoft.ConfigurationModule;

});