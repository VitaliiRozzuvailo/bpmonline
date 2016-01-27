define("SystemDesignerDashboardsModule", ["ext-base", "DashboardsModule", "SectionDashboardsViewModel",
		"SectionDashboardBuilder", "HistoryStateUtilities"],
	function() {

		/**
		 * @class Terrasoft.configuration.SystemDesignerDashboardsModule
		 * Класс визуального модуля итогов для раздела дизайнера системы.
		 */
		return Ext.define("Terrasoft.configuration.SystemDesignerDashboardsModule", {
			extend: "Terrasoft.DashboardsModule",
			alternateClassName: "Terrasoft.SystemDesignerDashboardsModule",
			viewModelClassName: "Terrasoft.SystemDesignerDashboardsViewModel",
			viewConfigClass: "Terrasoft.SystemDesignerDashboardsViewConfig",
			builderClassName: "Terrasoft.SystemDesignerDashboardBuilder",

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
			 * @inheritDoc Terrasoft.configuration.BaseSchemaModule#generateSchemaStructure
			 * @overridden
			 */
			generateSchemaStructure: function(callback, scope) {
				var builder = this.Ext.create(this.builderClassName, {
					viewModelClass: this.viewModelClassName,
					viewConfigClass: this.viewConfigClass
				});
				var sectionInfo = this.getSectionInfo();
				sectionInfo = sectionInfo || {};
				var config = {
					sectionId: sectionInfo.moduleId || Terrasoft.GUID_EMPTY
				};
				builder.build(config, function(viewModelClass, view) {
					callback.call(scope, viewModelClass, view);
				}, this);
			}
		});
	});