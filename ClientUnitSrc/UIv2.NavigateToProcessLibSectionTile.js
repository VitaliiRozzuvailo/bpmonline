define("NavigateToProcessLibSectionTile", ["NavigateToProcessLibSectionTileResources", "MaskHelper", "RightUtilities"],
	function(resources, MaskHelper, RightUtilities) {

		/**
		 * @class Terrasoft.configuration.NavigateToProcessLibSectionTileViewModel
		 * Класс модели представления модуля.
		 */
		Ext.define("Terrasoft.configuration.NavigateToProcessLibSectionTileViewModel", {
			extend: "Terrasoft.SystemDesignerTileViewModel",
			alternateClassName: "Terrasoft.NavigateToProcessLibSectionTileViewModel",
			Ext: null,
			sandbox: null,
			Terrasoft: null,

			constructor: function() {
				this.callParent(arguments);
				this.initResourcesValues(resources);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.SystemDesignerTileViewModel#onClick
			 * @overridden
			 */
			onClick: function() {
				if (this.get("CanManageProcessDesign") != null) {
					this.navigateToProcessLibSection();
				} else {
					RightUtilities.checkCanExecuteOperation({
						operation: "CanManageProcessDesign"
					}, function(result) {
						this.set("CanManageProcessDesign", result);
						this.navigateToProcessLibSection();
					}, this);
				}
			},

			/**
			 * Открывает раздел "Библиотека процесов" или показывает сообщение о ошибке.
			 * @private
			 */
			navigateToProcessLibSection: function() {
				if (this.get("CanManageProcessDesign") === true) {
					MaskHelper.ShowBodyMask();
					this.sandbox.publish("PushHistoryState", {
						hash: "SectionModuleV2/VwProcessLibSection/"
					});
				} else {
					var message = this.get("Resources.Strings.RightsErrorMessage");
					this.Terrasoft.utils.showInformation(message);
				}
			}
		});
	});