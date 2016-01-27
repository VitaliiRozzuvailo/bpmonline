define("NavigateToConfigurationSettingsTile", ["NavigateToConfigurationSettingsTileResources", "MaskHelper",
		"ServiceHelper"],
	function(resources, MaskHelper, ServiceHelper) {

		/**
		 * @class Terrasoft.configuration.NavigateToConfigurationSettingsTileViewModel
		 * Класс модели представления модуля.
		 */
		Ext.define("Terrasoft.configuration.NavigateToConfigurationSettingsTileViewModel", {
			extend: "Terrasoft.SystemDesignerTileViewModel",
			alternateClassName: "Terrasoft.NavigateToConfigurationSettingsTileViewModel",
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
				if (this.get("CanAccessConfigurationSettings") != null) {
					this.navigateToConfigurationSettings();
				} else {
					ServiceHelper.callService("MainMenuService", "GetCanAccessConfigurationSettings",
						function(response) {
							if (response) {
								var result = response.GetCanAccessConfigurationSettingsResult;
								var value = false;
								if (result && Ext.isBoolean(result)) {
									value = true;
								}
								this.set("CanAccessConfigurationSettings", value);
								this.navigateToConfigurationSettings();
							}
						}, {}, this);
				}
			},

			/**
			 * Открывает Управление конфигурацией или показывает сообщение о ошибке.
			 * @private
			 */
			navigateToConfigurationSettings: function() {
				if (this.get("CanAccessConfigurationSettings") === true) {
					window.open("../ViewPage.aspx?Id=5e5f9a9e-aa7d-407d-9e1e-1c24c3f9b59a");
				} else {
					var message = this.get("Resources.Strings.RightsErrorMessage");
					this.Terrasoft.utils.showInformation(message);
				}
			}
		});
	});