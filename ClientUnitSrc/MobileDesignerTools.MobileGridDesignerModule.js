define("MobileGridDesignerModule", ["ext-base", "MobileGridDesignerModuleResources", "MobileBaseDesignerModule",
		"MobileGridDesignerSettings"],
	function(Ext, resources) {

		/**
		 * @class Terrasoft.configuration.MobileGridDesignerViewConfig
		 * Класс, генерурующий конфигурацию представления для модуля дизайнера реестра.
		 */
		Ext.define("Terrasoft.configuration.MobileGridDesignerViewConfig", {
			extend: "Terrasoft.MobileBaseDesignerViewConfig",
			alternateClassName: "Terrasoft.MobileGridDesignerViewConfig",

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewConfig#getDesignerItemsView
			 * @overridden
			 */
			getDesignerItemsView: function() {
				var gridViewConfig = this.getGridViewConfig();
				return [gridViewConfig];
			},

			/**
			 * Возвращает конфигурацию представления элемента реестра.
			 * @protected
			 * @virtual
			 * @returns {Object} Конфигурация представления элемента реестра.
			 */
			getGridViewConfig: function() {
				var designerSettings = this.designerSettings;
				var itemsViewConfig = this.getGridLayoutEditItemsViewConfig({
					name: designerSettings.name,
					maxRows: 2
				});
				var config = {
					caption: { "bindTo": "Resources.Strings.GridColumnsLabelCaption" },
					disableTools: true,
					name: designerSettings.name,
					itemType: Terrasoft.ViewItemType.CONTROL_GROUP,
					items: itemsViewConfig
				};
				return config;
			}

		});

		/**
		 * @class Terrasoft.configuration.MobileGridDesignerViewModel
		 * Класс модели представления модуля дизайнера реестра.
		 */
		Ext.define("Terrasoft.configuration.MobileGridDesignerViewModel", {
			extend: "Terrasoft.MobileBaseDesignerViewModel",
			alternateClassName: "Terrasoft.MobileGridDesignerViewModel",

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#constructor
			 * @overridden
			 */
			constructor: function() {
				this.callParent(arguments);
				this.initResourcesValues(resources);
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#init
			 * @overridden
			 */
			init: function() {
				var designerSettings = this.designerSettings;
				var name = designerSettings.name;
				this.generateGridLayoutEditViewBindingData(name, designerSettings.items);
				this.generateControlGroupBindingData(name);
				this.callParent(arguments);
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#onAddGridLayoutItemButtonClick
			 * @overridden
			 */
			onAddGridLayoutItemButtonClick: function() {
				this.openStructureExplorer({
					entitySchemaName: this.designerSettings.entitySchemaName,
					callback: Ext.bind(this.gridLayoutItemAddedCallback, this)
				});
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#onRemoveGridLayoutItemButtonClick
			 * @overridden
			 */
			onRemoveGridLayoutItemButtonClick: function() {
				this.removeSelectedItemsFromCollection(this.designerSettings.name);
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#onCollectionChange
			 * @overridden
			 */
			onCollectionChange: function(collection, name) {
				this.callParent(arguments);
				var count = collection.getCount();
				var enableAddPropertyName = this.getEnableAddPropertyName(name);
				var enableAdd = (count < 2);
				this.set(enableAddPropertyName, enableAdd)
			},

			/**
			 * Обрабатывает результат выбора из окна настройки колонки.
			 * @protected
			 * @virtual
			 * @param {Object} explorerColumnConfig Конфигурация колонки.
			 */
			gridLayoutItemAddedCallback: function(explorerColumnConfig) {
				var columnConfig = this.getColumnConfigFromStructureExplorer(explorerColumnConfig);
				var designerSettings = this.designerSettings;
				var columnItem = designerSettings.createColumnItem(columnConfig);
				this.addColumnItemToGridLayoutCollection(designerSettings.name, columnItem);
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#generateDesignerSettingsConfig
			 * @overridden
			 */
			generateDesignerSettingsConfig: function() {
				var designerSettingsConfig = this.callParent(arguments);
				var name = this.designerSettings.name;
				var itemsCollection = this.getItemsCollectionByName(name);
				designerSettingsConfig.items = this.generateSettingsConfigCollectionItems(itemsCollection);
				return designerSettingsConfig;
			}

		});

		/**
		 * @class Terrasoft.configuration.MobileGridDesignerModule
		 * Класс модуля дизайнера реестра мобильного приложения.
		 */
		var designerModule = Ext.define("Terrasoft.configuration.MobileGridDesignerModule", {
			extend: "Terrasoft.MobileBaseDesignerModule",
			alternateClassName: "Terrasoft.MobileGridDesignerModule",

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerModule#viewModelClassName
			 * @overridden
			 */
			viewModelClassName: "Terrasoft.MobileGridDesignerViewModel",

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerModule#viewModelConfigClassName
			 * @overridden
			 */
			viewModelConfigClassName: "Terrasoft.MobileGridDesignerViewConfig",

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerModule#designerSettingsClassName
			 * @overridden
			 */
			designerSettingsClassName: "Terrasoft.MobileGridDesignerSettings"

		});
		return designerModule;

	});