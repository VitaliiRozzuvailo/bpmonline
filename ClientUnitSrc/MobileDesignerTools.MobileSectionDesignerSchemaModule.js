define("MobileSectionDesignerSchemaModule", ["BaseSchemaModuleV2"], function() {
	/**
	 * @class Terrasoft.configuration.MobileSectionDesignerSchemaModule
	 * Класс страницы дизайнера мобильного приложения.
	 */
	Ext.define("Terrasoft.configuration.MobileSectionDesignerSchemaModule", {
		alternateClassName: "Terrasoft.MobileSectionDesignerSchemaModule",
		extend: "Terrasoft.BaseSchemaModule",

		/**
		 * Код текущего рабочего места мобильного приложения
		 * @public
		 * @type {String}
		 */
		workplace: "",

		/**
		 * Инициализирует название схемы.
		 * @protected
		 * @overridden
		 */
		initSchemaName: function() {
			this.schemaName = "MobileSectionDesignerModule";
		},

		/**
		 * Создает модель представления
		 * @protected
		 * @overridden
		 * @param {Object} viewModelClass Класс модели представления схемы
		 * @return {Object} Возвращает экземпляр модели представления схемы
		 */
		createViewModel: function() {
			var viewModel = this.callParent(arguments);
			viewModel.set("Workplace", this.workplace);
			return viewModel;
		}

	});
	return Terrasoft.MobileSectionDesignerSchemaModule;
});