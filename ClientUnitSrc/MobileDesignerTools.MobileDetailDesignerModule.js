define("MobileDetailDesignerModule", ["ext-base", "MobileDetailDesignerModuleResources", "PageDesignerUtilities",
		"MobileBaseDesignerModule", "MobileRecordDesignerSettings", "css!MobileDetailDesignerModule"],
	function(Ext, resources, PageDesignerUtilities) {

		/**
		 * @class Terrasoft.configuration.MobileDetailDesignerViewConfig
		 * Класс, генерурующий конфигурацию представления для модуля дизайнера детали.
		 */
		Ext.define("Terrasoft.configuration.MobileDetailDesignerViewConfig", {
			extend: "Terrasoft.MobileBaseDesignerViewConfig",
			alternateClassName: "Terrasoft.MobileDetailDesignerViewConfig",

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewConfig#generate
			 * @overridden
			 */
			generate: function() {
				var viewConfig = this.callParent(arguments);
				viewConfig.push({
					name: "AddDetailButton",
					itemType: Terrasoft.ViewItemType.BUTTON,
					caption: { "bindTo": "Resources.Strings.AddDetailButtonCaption" },
					style: Terrasoft.controls.ButtonEnums.style.BLUE,
					click: { "bindTo": "onAddDetailClick" }
				});
				return viewConfig;
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewConfig#getDesignerItemsView
			 * @overridden
			 */
			getDesignerItemsView: function() {
				var designerSettings = this.designerSettings;
				var details = designerSettings.details;
				var detailsLength = details.length;
				if (!detailsLength) {
					return [this.getEmptyDataView()];
				}
				var result = [];
				for (var i = 0; i < detailsLength; i++) {
					var detailView = this.getDetailViewConfig(details[i]);
					result.push(detailView);
				}
				return result;
			},

			/**
			 * Возвращает конфигурацию представления элемента детали.
			 * @protected
			 * @virtual
			 * @param {Object} detailConfig Конфигурационный объект редактируемой детали.
			 * @returns {Object} Конфигурация представления элемента детали.
			 */
			getDetailViewConfig: function(detailConfig) {
				var caption = this.getCaptionByName(detailConfig.caption);
				var config = {
					caption: caption,
					name: detailConfig.name,
					itemType: Terrasoft.ViewItemType.CONTROL_GROUP,
					wrapClass: ["designer-standart-detail"]
				};
				return config;
			},

			/**
			 * Возвращает конфигурацию представления при отсутствии данных.
			 * @protected
			 * @virtual
			 * @returns {Object} Конфигурация представления при отсутствии данных.
			 */
			getEmptyDataView: function() {
				return {
					labelConfig: {
						classes: ["information", "recommendation"]
					},
					caption: { "bindTo": "Resources.Strings.AddDetailLabelCaption" },
					itemType: Terrasoft.ViewItemType.LABEL
				};
			}

		});

		/**
		 * @class Terrasoft.configuration.MobileDetailDesignerViewModel
		 * Класс модели представления модуля дизайнера детали.
		 */
		Ext.define("Terrasoft.configuration.MobileDetailDesignerViewModel", {
			extend: "Terrasoft.MobileBaseDesignerViewModel",
			alternateClassName: "Terrasoft.MobileDetailDesignerViewModel",

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#constructor
			 * @overridden
			 */
			constructor: function() {
				this.callParent(arguments);
				this.initResourcesValues(resources);
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#onConfigureControlGroupButtonClick
			 * @overridden
			 */
			onConfigureControlGroupButtonClick: function() {
				var tag = arguments[3];
				var designerSettings = this.designerSettings;
				var detailItem = designerSettings.findDetailItemByName(tag);
				var detailCaption = designerSettings.getLocalizableStringByKey(detailItem.caption);
				var editDetailConfig = {
					detailSchemaName: detailItem.detailSchemaName,
					entitySchemaName: detailItem.entitySchemaName,
					detailColumn: detailItem.filter.detailColumn,
					masterColumn: detailItem.filter.masterColumn,
					detailCaption: detailCaption
				};
				var me = this;
				PageDesignerUtilities.showEditDetailWindow(this, function(windowDetailConfig) {
					me.editDetailWindowCallback(windowDetailConfig, detailItem);
				}, editDetailConfig, {isCaptionEditable: true});
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#onRemoveControlGroupButtonClick
			 * @overridden
			 */
			onRemoveControlGroupButtonClick: function() {
				var tag = arguments[3];
				var designerSettings = this.designerSettings;
				var detailItem = designerSettings.findDetailItemByName(tag);
				designerSettings.removeDetailItem(detailItem);
				this.reRender();
			},

			/**
			 * Обрабатывает нажатие кнопки добавления детали.
			 * @protected
			 * @virtual
			 */
			onAddDetailClick: function() {
				PageDesignerUtilities.showEditDetailWindow(this, this.addDetailWindowCallback, null,
					{isCaptionEditable: true});
			},

			/**
			 * Обрабатывает добавление детали.
			 * @protected
			 * @virtual
			 * @param {Object} windowDetailConfig Конфигурационный объект детали из окна редактирования детали.
			 */
			addDetailWindowCallback: function(windowDetailConfig) {
				var designerSettings = this.designerSettings;
				var newDetailItem = this.createDetailItemFromWindowConfig(windowDetailConfig);
				var foundDetailItem = designerSettings.findDetailItemBySchemaName(windowDetailConfig.name);
				if (foundDetailItem) {
					designerSettings.applyDetailItem(foundDetailItem, newDetailItem);
				} else {
					designerSettings.addDetailItem(newDetailItem);
				}
				this.reRender();
			},

			/**
			 * Обрабатывает редактирование детали.
			 * @protected
			 * @virtual
			 * @param {Object} windowDetailConfig Конфигурационный объект детали из окна редактирования детали.
			 * @param {Object} detailItem Конфигурационный объект редактируемой детали.
			 */
			editDetailWindowCallback: function(windowDetailConfig, detailItem) {
				var designerSettings = this.designerSettings;
				var newDetailItem = this.createDetailItemFromWindowConfig(windowDetailConfig);
				designerSettings.applyDetailItem(detailItem, newDetailItem);
				this.reRender();
			},

			/**
			 * Возвращает конфигурационный объект детали на основании конфига из окна редактирования детали.
			 * @protected
			 * @virtual
			 * @param {Object} windowDetailConfig Конфигурационный объект детали из окна редактирования детали.
			 * @returns {Object} Конфигурационный объект детали.
			 */
			createDetailItemFromWindowConfig: function(windowDetailConfig) {
				var detailItem = this.designerSettings.createDetailItem({
					caption: windowDetailConfig.caption,
					entitySchemaName: windowDetailConfig.entitySchema,
					filter: windowDetailConfig.filter,
					name: windowDetailConfig.name
				});
				return detailItem;
			}

		});

		/**
		 * @class Terrasoft.configuration.MobileDetailDesignerModule
		 * Класс модуля дизайнера детали мобильного приложения.
		 */
		var designerModule = Ext.define("Terrasoft.configuration.MobileDetailDesignerModule", {
			extend: "Terrasoft.MobileBaseDesignerModule",
			alternateClassName: "Terrasoft.MobileDetailDesignerModule",

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerModule#viewModelClassName
			 * @overridden
			 */
			viewModelClassName: "Terrasoft.MobileDetailDesignerViewModel",

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerModule#viewModelConfigClassName
			 * @overridden
			 */
			viewModelConfigClassName: "Terrasoft.MobileDetailDesignerViewConfig",

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerModule#designerSettingsClassName
			 * @overridden
			 */
			designerSettingsClassName: "Terrasoft.MobileRecordDesignerSettings"

		});
		return designerModule;

	});