define("NavigateToSysLogoSettingsTile", ["NavigateToSysLogoSettingsTileResources", "MaskHelper", "RightUtilities"],
	function(resources, MaskHelper, RightUtilities) {

		/**
		 * @class Terrasoft.configuration.NavigateToSysLogoSettingsTileViewModel
		 * Класс модели представления модуля.
		 */
		Ext.define("Terrasoft.configuration.NavigateToSysLogoSettingsTileViewModel", {
			extend: "Terrasoft.SystemDesignerTileViewModel",
			alternateClassName: "Terrasoft.NavigateToSysLogoSettingsTileViewModel",
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
				if (this.get("CanManageLogo") != null) {
					this.navigateToSysWorkPlaceSection();
				} else {
					RightUtilities.checkCanExecuteOperation({
						operation: "CanManageLogo"
					}, function(result) {
						this.set("CanManageLogo", result);
						this.navigateToSysWorkPlaceSection();
					}, this);
				}
			},

			/**
			 * Открывает раздел Настройка корпоративной символики или показывает сообщение об ошибке.
			 * @private
			 */
			navigateToSysWorkPlaceSection: function() {
				if (this.get("CanManageLogo") === true) {
					MaskHelper.ShowBodyMask();
					this.sandbox.publish("PushHistoryState", {
						hash: "SysLogoSettingsModule"
					});
				} else {
					var message = this.get("Resources.Strings.RightsErrorMessage");
					this.Terrasoft.utils.showInformation(message);
				}
			}
		});
	});