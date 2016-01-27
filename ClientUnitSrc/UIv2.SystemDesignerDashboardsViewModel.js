define("SystemDesignerDashboardsViewModel", ["SystemDesignerDashboardsViewModelResources",
		"ext-base", "DashboardBuilder"],
	function(resources) {
		/**
		 * @class Terrasoft.configuration.SystemDesignerDashboardsViewModel
		 * Класс модели представления модуля итога для раздела дизайнера системы.
		 */
		return Ext.define("Terrasoft.configuration.SystemDesignerDashboardsViewModel", {
			extend: "Terrasoft.BaseDashboardsViewModel",
			alternateClassName: "Terrasoft.SystemDesignerDashboardsViewModel",

			/**
			 * Инициализирует заголовок страницы.
			 * @protected
			 * @virtual
			 */
			initHeader: Ext.emptyFn,

			/**
			 * Возвращает значение из профиля по ключу.
			 * @private
			 * @overridden
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст выполнения функции обратного вызова.
			 */
			getActiveTabNameFromProfile: function(callback, scope) {
				if (callback) {
					callback.call(scope);
				}
			},

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @overridden
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст.
			 */
			init: function(callback, scope) {
				this.initResourcesValues(resources);
				this.callParent([function() {
					Terrasoft.SysSettings.querySysSettingsItem("SystemDesignerSectionEditMode", function(value) {
						this.set("EditMode", value);
						callback.call(scope || this);
					}, this);
				}, this]);
			}
		});
	});