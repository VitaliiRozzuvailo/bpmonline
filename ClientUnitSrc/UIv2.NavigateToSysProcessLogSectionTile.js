define("NavigateToSysProcessLogSectionTile", ["NavigateToSysProcessLogSectionTileResources", "MaskHelper"],
	function(resources, MaskHelper) {

		/**
		 * @class Terrasoft.configuration.NavigateToSysProcessLogSectionTileViewModel
		 * Класс модели представления модуля.
		 */
		Ext.define("Terrasoft.configuration.NavigateToSysProcessLogSectionTileViewModel", {
			extend: "Terrasoft.SystemDesignerTileViewModel",
			alternateClassName: "Terrasoft.NavigateToSysProcessLogSectionTileViewModel",
			Ext: null,
			sandbox: null,
			Terrasoft: null,

			constructor: function() {
				this.callParent(arguments);
				this.initResourcesValues(resources);
			},

			/**
			 * Открывает раздел "Журнал процесов".
			 * @inheritDoc Terrasoft.configuration.SystemDesignerTileViewModel#onClick
			 * @overridden
			 */
			onClick: function() {
				MaskHelper.ShowBodyMask();
				this.sandbox.publish("PushHistoryState", {
					hash: "SectionModuleV2/SysProcessLogSectionV2/"
				});
			}
		});
	});