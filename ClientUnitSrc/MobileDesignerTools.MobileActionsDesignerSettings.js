define("MobileActionsDesignerSettings", ["ext-base", "MobileBaseDesignerSettings"],
	function(Ext) {

		/**
		 * @class Terrasoft.configuration.MobileActionsDesignerSettings
		 * Класс настройки действий.
		 */
		var module = Ext.define("Terrasoft.configuration.MobileActionsDesignerSettings", {
			alternateClassName: "Terrasoft.MobileActionsDesignerSettings",
			extend: "Terrasoft.MobileBaseDesignerSettings",

			/**
			 * Массив конфигураций действий.
			 * @type {Object[]}
			 */
			items: null,

			/**
			 * @private
			 */
			getDefaultItems: function() {
				return [
					{
						name: "Terrasoft.ActionCopy",
						title: "Sys.Action.Copy.Caption"
					},
					{
						name: "Terrasoft.ActionDelete",
						title: "Sys.Action.Delete.Caption"
					}
				];
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerSettings#initializeDefaultValues
			 * @overridden
			 */
			initializeDefaultValues: function() {
				this.callParent(arguments);
				if (!this.items) {
					this.items = this.getDefaultItems();
				}
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerSettings#getSettingsConfig
			 * @overridden
			 */
			getSettingsConfig: function() {
				var settingsConfig = this.callParent(arguments);
				settingsConfig.items = this.items;
				return settingsConfig;
			}

		});
		return module;

	});
