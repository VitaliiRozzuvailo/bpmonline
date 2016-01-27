define("CtiPanelModule", ["BaseSchemaModuleV2"], function() {
	/**
	 * @class Terrasoft.configuration.CtiPanelModule
	 * Класс страницы CTI панели, для работы со звонками.
	 */
	Ext.define("Terrasoft.configuration.CtiPanelModule", {
		alternateClassName: "Terrasoft.CtiPanelModule",
		extend: "Terrasoft.BaseSchemaModule",

		/**
		 * Инициализирует название схемы.
		 * @protected
		 * @overridden
		 */
		initSchemaName: function() {
			this.schemaName = "CtiPanel";
		},

		/**
		 * Создает модель представления. Расширяет модель {@link Terrasoft.CtiModel} моделью текущего класса.
		 * @protected
		 * @overridden
		 */
		createViewModel: function() {
			var viewModel = this.callParent(arguments);
			var model = Ext.merge(Terrasoft.CtiModel.model, viewModel.model);
			Ext.merge(viewModel, Terrasoft.CtiModel, {
				init: viewModel.init
			});
			viewModel.model = model;
			Terrasoft.CtiModel = Terrasoft.integration.telephony.CtiModel = viewModel;
			return viewModel;
		},

		/**
		 * Заменяет последний элемент в цепочке состояний, если его идентификатор модуля отличается от текущего.
		 * @protected
		 * @overridden
		 */
		initHistoryState: Ext.emptyFn

	});
	return Terrasoft.CtiPanelModule;
});