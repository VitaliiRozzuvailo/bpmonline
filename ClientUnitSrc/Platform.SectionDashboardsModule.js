define("SectionDashboardsModule", ["DashboardsModule", "SectionDashboardsViewModel", "SectionDashboardBuilder",
	"HistoryStateUtilities"],
function() {
	/**
	 * @class Terrasoft.configuration.SectionDashboardsModule
	 * Класс визуального модуля итогов.
	 */
	return Ext.define("Terrasoft.configuration.SectionDashboardsModule", {
		extend: "Terrasoft.DashboardsModule",
		alternateClassName: "Terrasoft.SectionDashboardsModule",
		viewModelClassName: "Terrasoft.SectionDashboardsViewModel",
		builderClassName: "Terrasoft.SectionDashboardBuilder",

		/**
		 *
		 */
		mixins: {
			/**
			 * Миксин, реализующий работу с HistoryState
			 */
			HistoryStateUtilities: "Terrasoft.HistoryStateUtilities"
		},

		/**
		 * Перекрывает инициализацию состояния, так как в разделе используется как вложенный модуль.
		 * @overridden
		 * @protected
		 */
		initHistoryState: Terrasoft.emptyFn,

		/**
		 * Функция рендеринга модуля.
		 */
		render: function() {
			this.callParent(arguments);
			this.sandbox.publish("NeedHeaderCaption");
		},

		/**
		 * @inheritDoc Terrasoft.configuration.BaseSchemaModule#generateSchemaStructure
		 * @overridden
		 */
		generateSchemaStructure: function(callback, scope) {
			var builder = this.Ext.create(this.builderClassName, {
				viewModelClass: this.viewModelClassName,
				viewConfigClass: this.viewConfigClass
			});
			var sectionInfo = this.getSectionInfo();
			var config = {
				sectionId: sectionInfo.moduleId || Terrasoft.GUID_EMPTY
			};
			builder.build(config, function(viewModelClass, view) {
				callback.call(scope, viewModelClass, view);
			}, this);
		}

	});

});
