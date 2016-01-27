define("DesignViewGeneratorV2", ["ext-base", "terrasoft", "DesignViewGeneratorV2Resources", "PageDesignerUtilities",
	"ViewGeneratorV2", "DesignerGridLayoutItem"],
	function(Ext, Terrasoft, resources, PageDesignerUtilities) {
		var viewGenerator = Ext.define("Terrasoft.configuration.DesignViewGenerator", {
			extend: "Terrasoft.ViewGenerator",
			alternateClassName: "Terrasoft.DesignViewGenerator",

			selectedItemName: null,

			/**
			 * Генерирует конфигурацию представления для элементов сетки с учетом их положения.
			 * @overridden
			 * @param {Object} config Конфигурация элемента представления схемы.
			 * @return {Object[]} Возвращает сгенерированные представления элементов сетки.
			 */
			generateGridLayoutItem: function(config) {
				var result = [];
				this.applyLayoutItemDefaults(config);
				var layoutItem = this.getGridLayoutItem(config);
				var itemContainerConfig = {
					name: config.name + "-itemContainer",
					itemType: Terrasoft.ViewItemType.CONTAINER,
					wrapClass: ["column-item-container", "dragdrop-element"],
					tag: config.name + "-itemContainer",
					items: []
				};
				var itemContainer =  this.generateContainer(itemContainerConfig);
				var items = itemContainer.items;
				items.push(layoutItem);
				result.push(Ext.apply({item: itemContainer}, config.layout));
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для элемента в сетки.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы.
			 * @return {Object[]} Возвращает сгенерированные представления элементов сетки.
			 */
			getGridLayoutItem: function(config) {
				var id = Terrasoft.Component.generateId();
				var caption = this.getLabelCaption(config);
				var designerGridLayoutItemClasses = "designerGridLayoutItem-wrap";
				if (config.name === this.selectedItemName) {
					designerGridLayoutItemClasses += " designerGridLayoutItem-pressed";
				}
				var itemName =  resources.localizableStrings.ElementPrefix + config.name;
				caption = (!caption) ? itemName : caption;
				var designerGridLayoutItemConfig = {
					className: "Terrasoft.DesignerGridLayoutItem",
					id: id,
					click: {
						bindTo: "selectItem"
					},
					dblclick: {
						bindTo: "editItem"
					},
					caption: caption,
					isRequired: this.isItemRequired(config),
					tag: config.name,
					designerGridLayoutItemClasses: designerGridLayoutItemClasses
				};
				return designerGridLayoutItemConfig;
			},

			/**
			 * Генерирует элементы меню для кнопки добавления в сетке.
			 * @virtual
			 * @protected
			 * @param {Number} column Номер колонки в сетке.
			 * @param {Number} row Номер строки в сетке.
			 * @param {Object} config Конфигурация сетки.
			 * @return {Object} Возвращает элементы меню для кнопки добавления в сетке.
			 */
			generateAddButtonItems: function(column, row, config) {
				var newColumnsTypes = [{
					caption: resources.localizableStrings.String,
					type: Terrasoft.DataValueType.TEXT
				}, {
					caption: resources.localizableStrings.Integer,
					type: Terrasoft.DataValueType.INTEGER
				}, {
					caption: resources.localizableStrings.Fractional,
					type: Terrasoft.DataValueType.FLOAT
				}, {
					caption: resources.localizableStrings.Date,
					type: Terrasoft.DataValueType.DATE
				}, {
					caption: resources.localizableStrings.Directory,
					type: Terrasoft.DataValueType.LOOKUP
				}, {
					caption: resources.localizableStrings.Logical,
					type: Terrasoft.DataValueType.BOOLEAN
				}];
				var newColumnItems = [];
				Terrasoft.each(newColumnsTypes, function(columnType) {
					newColumnItems.push({
						caption: columnType.caption,
						click: {bindTo: "addNewColumn"},
						markerValue: columnType.caption,
						tag: columnType.type + ":" + config.name + ":"  + column + ":" + row
					});
				}, this);
				return [{
						caption: resources.localizableStrings.ExistingColumn,
						click: {bindTo: "addExistingColumn"},
						markerValue: resources.localizableStrings.ExistingColumn,
						tag: config.name + ":"  + column + ":" + row
					}, {
						caption: resources.localizableStrings.NewColumn,
						markerValue: resources.localizableStrings.NewColumn,
						menu: {items: newColumnItems}
					}
				];
			},

			/**
			 * Генерирует кнопку добавления для сетки.
			 * @param {Number} column Номер колонки в сетке.
			 * @param {Number} row Номер строки в сетке.
			 * @param {Object} config Конфигурация сетки.
			 * @return {Object} Возвращает кнопку добавления для сетки.
			 */
			generateAddButton: function(column, row, config) {
				var buttonName = Ext.String.format(config.name + "plus_{0}_{1}", row, column);
				var addButtonHtmlTemplate = [
					"<div id='{0}' class='t-btn-wrapper full-size custom-button {1}'>",
					"<div class='custom-btn-table-el full-size'>",
					"<div class='custom-btn-inner-el'>",
					"<div class='custom-btn-center-text-el'>",
					"<span class='t-btn-text'>{2}</span>",
					"</div>",
					"</div>",
					"</div>",
					"</div>"
				].join("");
				var buttonHtml = Terrasoft.getFormattedString(addButtonHtmlTemplate, buttonName + "-wrap",
					"add-button", "+");
				var addItems = this.generateAddButtonItems(column, row, config);
				var buttonWithMenuConfig = {
					className: "Terrasoft.Button",
					name: buttonName,
					id: buttonName,
					html: buttonHtml,
					markerValue: Ext.String.format("plus_{0}", row),
					selectors: {
						wrapEl: "#" + buttonName + "-wrap",
						menuWrapEl: "#" + buttonName + "-wrap"
					},
					menu: {items: addItems}
				};
				return Ext.apply({item: buttonWithMenuConfig}, {column: column, row: row, colSpan: 2});
			},

			/**
			 * Генерирует конфигурацию представления для сетки {Terrasoft.ViewItemType.GRID_LAYOUT}.
			 * @override
			 * @param {Object} config Конфигурация сетки.
			 * @return {Object} Возвращает сгенерированное представление сетки.
			 */
			generateGridLayout: function(config) {
				var result = [];
				var gridLayout = this.callParent(arguments);
				var addButtons = this.getAddGridLayoutButtons(config);
				gridLayout.rowHeight = "69px";
				gridLayout.items = gridLayout.items.concat(addButtons);
				gridLayout.classes = {
					itemCell: "item-cell"
				};
				gridLayout.tag = config.name;
				gridLayout.markerValue = config.name;
				gridLayout.safeBind = true;
				result.push(gridLayout);
				if (this.isGridLayoutActive(config)) {
					var changeColumnPanel = this.getGridLayoutChangePanel(config);
					result.push(changeColumnPanel);
				}
				return result;
			},

			/**
			 * Проверяет является ли сетка контейнером для выбранного элемента.
			 * @override
			 * @param {Object} config Конфигурация сетки.
			 * @return {Object} Возвращает true если выбраный элемент пренадлежит сетке
			 * false в противном случае.
			 */
			isGridLayoutActive: function(config) {
				var result = false;
				Terrasoft.each(config.items, function(item) {
					return !(result = item.name === this.selectedItemName);
				}, this);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для детали {Terrasoft.ViewItemType.DETAIL}.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация детали.
			 * @return {Object} Возвращает сгенерированную конфигурацию представление детали.
			 */
			generateDetail: function(config) {
				var caption = resources.localizableStrings.Detail + " " +  config.caption;
				if (Ext.isObject(config.caption)) {
					config.caption = Ext.apply(config.caption, {
						bindConfig: {converter: function(caption) {
							return resources.localizableStrings.Detail + " " + caption;
						}
						}
					});
				} else if (!config.caption) {
					config.caption = {
						bindTo: config.name + "_page_designer_detail_caption"
					};
				}
				if (Ext.isString(config.caption)) {
					config.caption = caption;
				}
				delete config.detail;
				var result = this.generateControlGroup(config);
				result.collapsed = true;
				this.applyDetailTools(result, config);
				return result;
			},

			/**
			 * Добавляет в деталь элементы управления для настройки.
			 * @overridden
			 * @param {Object} detail Элемент управления детали.
			 * @param {Object} config Конфигурация детали.
			 */
			applyDetailTools: function(detail, config) {
				var tools = detail.tools;
				var configurationButton = this.generateButton({
					name: config.name + "ConfigurationButton",
					caption: resources.localizableStrings.ConfigurationButtonCaption,
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					tag: config.name,
					click: {
						bindTo: "configureDetail"
					}
				});
				var removeButton = this.generateButton({
					name: config.name + "removeButton",
					imageConfig: resources.localizableImages.RemoveIcon,
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					tag: config.name,
					click: {
						bindTo: "removeDetail"
					}
				});
				tools.push(configurationButton);
				tools.push(removeButton);
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
				result.collapsed = {
					bindTo: config.name + "_page_designer_collapsed"
				};
				this.applyGroupTools(result, config);
				return result;
			},

			/**
			 * Добавляет в группу элементы управления для настройки.
			 * @overridden
			 * @param {Object} group Элемент управления группы.
			 * @param {Object} config Конфигурация группы элементов.
			 */
			applyGroupTools: function(group, config) {
				var tools = group.tools;
				var configurationButton = this.generateButton({
					name: config.name + "ConfigurationButton",
					caption: resources.localizableStrings.ConfigurationButtonCaption,
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					tag: config.name,
					click: {
						bindTo: "configureGroup"
					}
				});
				var removeButton = this.generateButton({
					name: config.name + "removeButton",
					imageConfig: resources.localizableImages.RemoveIcon,
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					tag: config.name,
					click: {
						bindTo: "removeGroup"
					}
				});
				tools.push(configurationButton);
				tools.push(removeButton);
			},

			/**
			 * Генерирует массив объектов в сетке с кнопками добавления.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация сетки.
			 * @return {Object[]} Возвращает сгенерированный массив объектов в сетке с кнопками добавления.
			 */
			getAddGridLayoutButtons: function(config) {
				var matrix = PageDesignerUtilities.getFillingGridMatrix(config);
				var result = [];
				matrix.push(new Array(24));
				for (var rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
					var row = matrix[rowIndex];
					for (var columnIndex = 0; columnIndex < row.length; columnIndex++) {
						if (!row[columnIndex] && !row[columnIndex + 1] && (row[columnIndex - 1] || columnIndex === 0) &&
							columnIndex < 23) {
							result.push(this.generateAddButton(columnIndex, rowIndex, config));
							columnIndex++;
						} else if (!row[columnIndex]) {
							result.push(this.generateEmptyElement(columnIndex, rowIndex));
						}
					}
				}
				return result;
			},

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
			 * Генерирует пустой елемент для ячейки сетки.
			 * @param {Number} column Колонка положения элемента в сетке.
			 * @param {Number} row Столбец положения элемента в сетке.
			 * @return {Object} Возвращает пустой елемент для ячейки сетки
			 */
			generateEmptyElement: function(column, row) {
				var emptyElementConfig = {
					id: Terrasoft.Component.generateId(),
					className: "Terrasoft.HtmlControl",
					html: "<div class='empty-element-class' ></div>",
					selectors: {
						wrapEl: ".empty-element-class"
					},
					tag: "emptyElement"
				};
				return Ext.apply({item: emptyElementConfig}, {column: column, row: row, rowSpan: 1, colSpan: 1});
			},

			/**
			 * Формирует конфигурацию панели редактирования колонок.
			 * @param {Object} config Конфигурация сетки.
			 * @return {Object} Возвращает конфигурацию панели редактирования колонок.
			 */
			getGridLayoutChangePanelConfig: function(config) {
				var gridLayoutName = config.name;
				var panelConfig = {
					name: "changeColumnContainer",
					wrapClass: ["change-column-container"],
					itemType: Terrasoft.ViewItemType.CONTAINER,
					items: [{
						name: gridLayoutName + "change",
						itemType: Terrasoft.ViewItemType.BUTTON,
						caption: resources.localizableStrings.Change,
						visible: {bindTo: "getIsCurrentItemColumn"},
						tag: gridLayoutName,
						click: {bindTo: "editColumn"}
					}, {
						name: gridLayoutName + "remove",
						classes: {textClass: ["remove-button"]},
						itemType: Terrasoft.ViewItemType.BUTTON,
						caption: resources.localizableStrings.Remove,
						tag: gridLayoutName,
						click: {bindTo: "removeItem"}
					}, {
						name: gridLayoutName + "changeWidth",
						itemType: Terrasoft.ViewItemType.LABEL,
						caption: resources.localizableStrings.ChangeWidth
					}, {
						name: gridLayoutName + "decrementWidth",
						itemType: Terrasoft.ViewItemType.BUTTON,
						tag: gridLayoutName,
						markerValue: "decrementWidth",
						caption: resources.localizableStrings.MinusButtonCaption,
						click: {bindTo: "decrementWidth"}
					}, {
						name: gridLayoutName + "incrementWidth",
						itemType: Terrasoft.ViewItemType.BUTTON,
						tag: gridLayoutName,
						markerValue: "incrementWidth",
						caption: resources.localizableStrings.PlusButtonCaption,
						classes: {textClass: ["plus-button"]},
						click: {bindTo: "incrementWidth"}
					}, {
						name: gridLayoutName + "stretch",
						itemType: Terrasoft.ViewItemType.BUTTON,
						tag: gridLayoutName,
						markerValue: "stretch",
						caption: resources.localizableStrings.Stretch,
						classes: {textClass: ["stretch-button"]},
						click: {bindTo: "stretch"}
					}, {
						name: gridLayoutName + "changeHeight",
						itemType: Terrasoft.ViewItemType.LABEL,
						caption: resources.localizableStrings.ChangeHeight
					},  {
						name: gridLayoutName + "decrementHeight",
						tag: gridLayoutName,
						itemType: Terrasoft.ViewItemType.BUTTON,
						markerValue: "decrementHeight",
						caption: resources.localizableStrings.MinusButtonCaption,
						click: {bindTo: "decrementHeight"}
					}, {
						name: gridLayoutName + "incrementHeight",
						itemType: Terrasoft.ViewItemType.BUTTON,
						tag: gridLayoutName,
						markerValue: "incrementHeight",
						caption: resources.localizableStrings.PlusButtonCaption,
						classes: {textClass: ["plus-button"]},
						click: {bindTo: "incrementHeight"}
					}]
				};
				return panelConfig;
			},

			/**
			 * Формирует панель редактирования колонок.
			 * @param {object} config Конфига представления.
			 * @return {Object} Возвращает панель редактирования колонок.
			 */
			getGridLayoutChangePanel: function(config) {
				var panelConfig = this.getGridLayoutChangePanelConfig(config);
				return this.generateStandardItem(panelConfig);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.ViewGenerator#generateTabPanelControl
			 * @overridden
			 */
			generateTabPanelControl: function() {
				var result = this.callParent(arguments);
				result.items = result.items || [];
				var settingsConfig = {
					name: "settings",
					visible: true,
					caption: resources.localizableStrings.ConfigurationButtonCaption,
					click: {bindTo: "customizeTabs"},
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
			 * @return {Object} Возвращает сгенерированное представление модуля для дизайнера.
			 */
			generateModule: function(config) {
				//config.caption = "Module: " + config.name;
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
			 * Инициализирует внутренние параметры выбранного элемента генератора.
			 * @protected
			 * @overridden
			 * @param {Object} config Конфигурация построения схемы.
			 */
			init: function(config) {
				this.callParent(arguments);
				this.selectedItemName = config.selectedItemName;
			},

			/**
			 * Очищает внутренний параметр выбранного элемента генератора.
			 * @protected
			 * @overridden
			 */
			clear: function() {
				this.callParent(arguments);
				this.selectedItemName = null;
			}

		});

		return Ext.create(viewGenerator);
	});
