define("SectionDashboardBuilder", ["ext-base", "SectionDashboardBuilderResources", "DashboardBuilder"],
function(Ext) {

	/**
	 * @class Terrasoft.configuration.DashboardBuilder
	 * Класс инкапсулирующий в себе логику генерации представления и класса модели представления для модуля итогов.
	 */
	Ext.define("Terrasoft.configuration.SectionDashboardBuilder", {
		extend: "Terrasoft.DashboardBuilder",
		alternateClassName: "Terrasoft.SectionDashboardBuilder",

		/**
		 * Имя базовой модели представления для модуля итогов.
		 * @type {String}
		 */
		viewModelClass: "Terrasoft.SectionDashboardsViewModel",

		/**
		 * Имя базового класа генератога конфигурации представления итогов.
		 * @type {String}
		 */
		viewConfigClass: "Terrasoft.DashboardViewConfig"

	});

	return Terrasoft.SectionDashboardBuilder;

});
