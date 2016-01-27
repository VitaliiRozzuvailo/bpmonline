define("SectionDashboardsViewModel", ["ext-base", "DashboardBuilder"],
function() {

	/**
	 * @class Terrasoft.configuration.SectionDashboardsViewModel
	 * Класс модели представления модуля итога.
	 */
	return Ext.define("Terrasoft.configuration.SectionDashboardsViewModel", {
		extend: "Terrasoft.BaseDashboardsViewModel",
		alternateClassName: "Terrasoft.SectionDashboardsViewModel",

		/**
		 * Инициализирует заголовок страницы.
		 * @protected
		 * @virtual
		 */
		initHeader: Ext.emptyFn

	});

});
