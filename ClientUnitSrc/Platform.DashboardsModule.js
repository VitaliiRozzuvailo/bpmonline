define("DashboardsModule", ["BaseSchemaModuleV2", "DashboardBuilder"],
	function() {

		/**
		 * @class Terrasoft.configuration.DashboardModule
		 * Класс визуального модуля итогов.
		 */
		return Ext.define("Terrasoft.configuration.DashboardsModule", {
			extend: "Terrasoft.BaseSchemaModule",
			alternateClassName: "Terrasoft.DashboardsModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			viewModelClassName: "Terrasoft.BaseDashboardsViewModel",

			builderClassName: "Terrasoft.DashboardBuilder",

			viewConfigClass: "Terrasoft.DashboardsViewConfig",

			/**
			 * Генерирует ключ профиля для модуля итогов.
			 * @overridden
			 * @protected
			 * @return {String} Возращает ключ профиля для модуля итогов.
			 */
			getProfileKey: function() {
				return "DashboardId";
			},

			/**
			 * Убирает инициализацию имени схемы модуля.
			 * @overridden
			 * @protected
			 */
			initSchemaName: Terrasoft.emptyFn,

			/**
			 * Создает модель представления для модуля итогов.
			 * @param {Object} viewModelClass Класс модели представления.
			 * @return {Terrasoft.BaseViewModel} Возвращает созданную модель представления для модуля итогов.
			 */
			createViewModel: function(viewModelClass) {
				return this.Ext.create(viewModelClass, {
					Ext: this.Ext,
					sandbox: this.sandbox,
					Terrasoft: this.Terrasoft
				});
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseSchemaModule#generateSchemaStructure
			 * @overridden
			 */
			generateSchemaStructure: function(callback, scope) {
				var builder = Ext.create(this.builderClassName, {
					viewModelClass: this.viewModelClassName,
					viewConfigClass: this.viewConfigClass
				});
				var config = {};
				builder.build(config, function(viewModelClass, view) {
					callback.call(scope, viewModelClass, view);
				}, this);
			},

			/**
			 * Обнуляет внутрение параметры.
			 * @overridden
			 */
			destroy: function() {
				this.callParent(arguments);
				this.renderContainer = null;
			}

		});

	});
