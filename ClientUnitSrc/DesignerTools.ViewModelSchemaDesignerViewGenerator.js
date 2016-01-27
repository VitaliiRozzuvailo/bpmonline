define("ViewModelSchemaDesignerViewGenerator", ["ext-base", "terrasoft", "ViewGeneratorV2"],
	function(Ext, Terrasoft) {

		/**
		 * @class Terrasoft.configuration.ViewModelSchemaDesignerViewGenerator
		 * Класс, генерирующий представление клиентской схемы в режиме дизайна.
		 */
		var viewGenerator = Ext.define("Terrasoft.configuration.ViewModelSchemaDesignerViewGenerator", {
			extend: "Terrasoft.ViewGenerator",
			alternateClassName: "Terrasoft.ViewModelSchemaDesignerViewGenerator",

			/**
			 * @inheritDoc Terrasoft.configuration.ViewGenerator#generateItem
			 * @overridden
			 */
			generateItem: function() {
				var result = this.callParent(arguments);
				result.safeBind = true;
				return result;
			},

			/**
			 * @inheritDoc Terrasoft.configuration.ViewGenerator#generateEditControl
			 * @overridden
			 */
			generateEditControl: function() {
				var result = this.callParent(arguments);
				result.safeBind = true;
				return result;
			},

			/**
			 * Добавляет в элемент управления вкладок кнопку настройки.
			 * @inheritDoc Terrasoft.configuration.ViewGenerator#generateTabPanelControl
			 * @overridden
			 */
			generateTabPanelControl: function(config) {
				var result = this.callParent(arguments);
				result.items = result.items || [];
				var settingsConfig = {
					name: "settings",
					imageConfig: { bindTo: "Resources.Images.DesignerSettingsImage" },
					tag: config.name,
					click: { bindTo: "openTabSettingWindow" },
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT
				};
				var settings = this.generateButton(settingsConfig);
				result.items.push(settings);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления модуля для дизайнера.
			 * @overridden
			 * @param {Object} config Конфигурация модуля.
			 * @return {Object} Сгенерированное представление модуля для дизайнера.
			 */
			generateModule: function(config) {
				config.caption = {
					bindTo: config.name + "_page_designer_module_caption"
				};
				var result = this.getConfigWithoutServiceProperties(config,
					["afterrender", "afterrerender", "moduleName"]
				);
				result = this.generateControlGroup(result);
				result.collapsed = true;
				return result;
			},

			/**
			 * Перекрывает базовую логику загрузки пользовательских генераторов для представления дизайнера.
			 * @overridden
			 */
			requireCustomGenerators: function(viewConfig, callback, scope) {
				callback.call(scope);
			},

			/**
			 * Генерирует нестандартный элемент как подпись с именем элемента.
			 * @overridden
			 */
			generateCustomItem: function(config) {
				return this.generateLabel({
					caption: config.name
				});
			},

			/**
			 * Генерирует конфигурацию представления для сетки {Terrasoft.ViewItemType.GRID_LAYOUT}.
			 * @protected
			 * @overridden
			 * @param {Object} config Конфигурация сетки.
			 * @return {Object} Сгенерированное представление сетки.
			 */
			generateGridLayout: function(config) {
				var controlId = config.name;
				var result = {
					className: "Terrasoft.GridLayoutEdit",
					id: controlId,
					selectors: { wrapEl: "#" + controlId },
					items: { bindTo: config.name + "Collection" },
					selection: { bindTo: config.name + "Selection" },
					selectedItems: { bindTo: config.name + "SelectedItems" },
					tag: config.name,
					autoHeight: true,
					autoWidth: false,
					multipleSelection: false,
					allowItemsIntersection: false,
					columns: 24,
					itemActions: this.getModelItemTools(config),
					itemActionClick: { bindTo: "onItemActionClick" },
					useManualSelection: false,
					itemBindingConfig: {
						itemId: { bindTo: "itemId" },
						content: { bindTo: "content" },
						column: { bindTo: "column" },
						colSpan: { bindTo: "colSpan" },
						row: { bindTo: "row" },
						rowSpan: { bindTo: "rowSpan" },
						imageConfig: { bindTo: "getImageConfig" },
						dragActionsCode: { bindTo: "DragActionsCode" }
					}
				};
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, []));
				this.applyControlConfig(result, config);
				return result;
			},

			/**
			 * Генерирует конфигурацию элементов настройки элемента в сетке.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация группы элементов.
			 * @return {Object[]} Сгенерированное представление элементов настройки.
			 */
			getModelItemTools: function(config) {
				var configurationButton = this.generateButton({
					name: config.name + "ConfigurationButton",
					imageConfig: { bindTo: "Resources.Images.SettingsImage" },
					visible: { bindTo: "getConfigurationButtonVisible" },
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					tag: "openModelItemSettingWindow"
				});
				var removeButton = this.generateButton({
					name: config.name + "removeButton",
					imageConfig: { bindTo: "Resources.Images.RemoveImage" },
					visible: { bindTo: "getRemoveButtonVisible" },
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					tag: "removeModelItem"
				});
				var result = [configurationButton, removeButton];
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для детали {Terrasoft.ViewItemType.DETAIL}.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация детали.
			 * @return {Object} Сгенерированную конфигурацию представление детали.
			 */
			generateDetail: function(config) {
				config.caption = {
					bindTo: config.name + "DetailCaption"
				};
				delete config.detail;
				var result = this.generateControlGroup(config);
				result.collapsed = true;
				result.tools = [];//this.generateDetailTools(config);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для группы элементов {Terrasoft.ViewItemType.CONTROL_GROUP}.
			 * @overridden
			 * @param {Object} config Конфигурация группы элементов.
			 * @return {Object} Возвращает сгенерированное представление группы элементов.
			 */
			generateControlGroup: function(config) {
				var result = this.callParent(arguments);
				result.caption = result.caption || " ";
				result.tools = result.tools.concat(this.generateGroupTools(config));
				return result;
			},

			/**
			 * Генерирует конфигурацию элементов настройки для группы элементов.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация группы элементов.
			 * @return {Object[]} Сгенерированное представление элементов настройки.
			 */
			generateGroupTools: function(config) {
				var configurationButton = this.generateButton({
					name: config.name + "ConfigurationButton",
					caption: { bindTo: "Resources.Strings.DesignerSettingsButtonCaption" },
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					classes: {
						textClass: ["designer-group-settings-button"],
						wrapperClass: ["designer-group-settings-button"]
					},
					tag: config.name,
					click: { bindTo: "openGroupSettingWindow" }
				});
				var removeButton = this.generateButton({
					name: config.name + "removeButton",
					caption: { bindTo: "Resources.Strings.DesignerRemoveButtonCaption" },
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					classes: {
						textClass: ["designer-group-settings-button"],
						wrapperClass: ["designer-group-settings-button"]
					},
					tag: config.name,
					click: { bindTo: "removeGroup" }
				});
				var result = [configurationButton, removeButton];
				return result;
			},

			/**
			 * Генерирует конфигурацию элементов настройки для детали.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация группы элементов.
			 * @return {Object[]} Сгенерированное представление элементов настройки.
			 */
			generateDetailTools: function(config) {
				var configurationButton = this.generateButton({
					name: config.name + "ConfigurationButton",
					caption: { bindTo: "Resources.Strings.DesignerSettingsButtonCaption" },
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					classes: {
						textClass: ["designer-group-settings-button"],
						wrapperClass: ["designer-group-settings-button"]
					},
					tag: config.name,
					click: { bindTo: "openDetailSettingWindow" }
				});
				var removeButton = this.generateButton({
					name: config.name + "removeButton",
					caption: { bindTo: "Resources.Strings.DesignerRemoveButtonCaption" },
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					classes: {
						textClass: ["designer-group-settings-button"],
						wrapperClass: ["designer-group-settings-button"]
					},
					tag: config.name,
					click: { bindTo: "removeDetail" }
				});
				var result = [configurationButton, removeButton];
				return result;
			},

			/**
			 * @inheritDoc Terrasoft.configuration.ViewGenerator#generateTabContent
			 * @overridden
			 */
			generateTabContent: function(config) {
				var result = this.callParent(arguments);
				var tabTools = this.generateTabTools(config);
				result.items = result.items.concat(tabTools);
				return result;
			},

			/**
			 * Генерирует конфигурацию элементов настройки для одной вкладок.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация вкладки.
			 * @return {Object[]} Сгенерированное представление элементов настройки.
			 */
			generateTabTools: function(config) {
				var addButton = this.generateButton({
					name: config.name + "AddButton",
					caption: { bindTo: "Resources.Strings.DesignerAddGroupItemCaption" },
					tag: config.name,
					click: { bindTo: "addGroup" },
					style: Terrasoft.controls.ButtonEnums.style.BLUE,
					classes: {
						wrapperClass: ["add-detail-button"],
						textClass: ["add-detail-button"]
					}
				});
				var result = [addButton];
				return result;
			}
		});

		return Ext.create(viewGenerator);
	});