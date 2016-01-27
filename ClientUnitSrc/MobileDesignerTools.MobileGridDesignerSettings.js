define("MobileGridDesignerSettings", ["ext-base", "MobileDesignerUtils", "MobileBaseDesignerSettings"],
	function(Ext, MobileDesignerUtils) {

		/**
		 * @class Terrasoft.configuration.MobileGridDesignerSettings
		 * Класс настройки реестра дизайнера.
		 */
		var module = Ext.define("Terrasoft.configuration.MobileGridDesignerSettings", {
			alternateClassName: "Terrasoft.MobileGridDesignerSettings",
			extend: "Terrasoft.MobileBaseDesignerSettings",

			/**
			 * Колонки реестра.
			 * @type {Object[]}
			 */
			items: null,

			/**
			 * @private
			 */
			getDefaultItems: function() {
				var entitySchema = this.entitySchema;
				var primaryColumn = entitySchema.primaryDisplayColumn;
				if (!primaryColumn) {
					primaryColumn = entitySchema.primaryColumn;
				}
				var columnItem = this.createColumnItem({
					row: 0,
					caption: primaryColumn.caption,
					columnName: primaryColumn.name,
					dataValueType: primaryColumn.dataValueType
				});
				return [columnItem];
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
			 * @inheritDoc Terrasoft.MobileBaseDesignerSettings#initializeCaptionValues
			 * @overridden
			 */
			initializeCaptionValues: function(config) {
				var items = this.items || [];
				MobileDesignerUtils.setColumnsContentByPath({
					modelName: this.entitySchema.name,
					items: items,
					callback: config.callback,
					scope: config.scope
				});
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
