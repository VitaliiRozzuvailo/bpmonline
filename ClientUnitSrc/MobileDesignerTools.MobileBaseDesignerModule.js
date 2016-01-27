define("MobileBaseDesignerModule", ["ext-base", "MobileBaseDesignerModuleResources", "SectionDesignDataModule",
		"StructureExplorerUtilities", "BaseSchemaModuleV2", "css!MobileBaseDesignerModule", "css!DetailModuleV2"],
	function(Ext, resources, SectionDesignDataModule, StructureExplorerUtilities) {

		/**
		 * @class Terrasoft.configuration.MobileDesignerGridLayoutItemViewModel
		 * Класс модели элемента сетки для дизайнера.
		 */
		Ext.define("Terrasoft.configuration.MobileDesignerGridLayoutItemViewModel", {
			extend: "Terrasoft.BaseViewModel",
			alternateClassName: "Terrasoft.MobileDesignerGridLayoutItemViewModel",

			/**
			 * @private
			 */
			designerColumns: ["row", "name", "content", "columnName", "dataValueType"],

			/**
			 * @private
			 */
			applyValues: function(values) {
				var defaultValues = this.getDefaultValues();
				values.markerValue = values.content;
				Ext.applyIf(values, defaultValues);
			},

			/**
			 * @private
			 */
			getDefaultValues: function() {
				var itemId = Terrasoft.generateGUID();
				return {
					itemId: itemId,
					colSpan: 1,
					column: 0,
					rowSpan: 1,
					dragActionsCode: 1
				};
			},

			/**
			 * @inheritDoc Terrasoft.BaseViewModel#constructor
			 * @overridden
			 */
			constructor: function(config) {
				this.applyValues(config.values);
				this.callParent(arguments);
			},

			/**
			 * Получает конфигурацию элемента дизайнера.
			 * @virtual
			 * @returns {Object} Конфигурация элемента дизайнера.
			 */
			getDesignerValues: function() {
				var designerValues = {};
				var designerColumns = this.designerColumns;
				for (var i = 0, ln = designerColumns.length; i < ln; i++) {
					var designerColum = designerColumns[i];
					designerValues[designerColum] = this.get(designerColum);
				}
				return designerValues;
			}

		});

		/**
		 * @class Terrasoft.configuration.MobileBaseDesignerViewConfig
		 * Базовый класс, генерурующий конфигурацию представления для модуля дизайнера.
		 */
		Ext.define("Terrasoft.configuration.MobileBaseDesignerViewConfig", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.MobileBaseDesignerViewConfig",

			/**
			 * Генерирует конфигурацию представления модуля.
			 * @protected
			 * @virtual
			 * @param {Object} designerSettings Экземпляр класса настройки дизайнера.
			 * @returns {Object[]} Возвращает конфигурацию представления модуля.
			 */
			generate: function(designerSettings) {
				this.designerSettings = designerSettings;
				var viewConfig = [
					{
						"name": "MobileDesignerView",
						"generator": "MobileDesignerViewGenerator.generatePartial",
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": this.getDesignerItemsView()
					}
				];
				return viewConfig;
			},

			/**
			 * Возвращает конфигурацию представления элементов модуля.
			 * @protected
			 * @virtual
			 * @returns {Object[]} Конфигурация представления элементов модуля.
			 */
			getDesignerItemsView: function() {
				return [];
			},

			/**
			 * Возвращает конфигурацию представления настройки элементов в сетке.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурационный объект.
			 * @returns {Object} Конфигурация представления настройки элементов в сетке.
			 */
			getGridLayoutEditItemsViewConfig: function(config) {
				return [
					{
						name: config.name,
						itemType: Terrasoft.ViewItemType.GRID_LAYOUT,
						maxRows: config.maxRows
					},
					{
						name: config.name + "GridLayoutTools",
						itemType: Terrasoft.ViewItemType.CONTAINER,
						items: [
							{
								name: config.name + "GridLayoutAddItem",
								caption: { "bindTo": "Resources.Strings.AddGridLayoutItemButtonCaption" },
								itemType: Terrasoft.ViewItemType.BUTTON,
								style: Terrasoft.controls.ButtonEnums.style.BLUE,
								tag: config.name,
								click: { bindTo: "onAddGridLayoutItemButtonClick" },
								enabled: { bindTo: config.name + "EnableAdd" },
								classes: {
									textClass: "actions-button-margin-right"
								}
							},
							{
								name: config.name + "GridLayoutRemoveItem",
								caption: { "bindTo": "Resources.Strings.RemoveGridLayoutItemButtonCaption" },
								itemType: Terrasoft.ViewItemType.BUTTON,
								tag: config.name,
								click: { bindTo: "onRemoveGridLayoutItemButtonClick" },
								enabled: { bindTo: config.name + "EnableRemove" }
							}
						]
					}
				];
			},

			/**
			 * Возвращает заголовок.
			 * @protected
			 * @virtual
			 * @param {String} name Имя локализированной строки.
			 * @returns {String} Заголовок.
			 */
			getCaptionByName: function(name) {
				return this.designerSettings.getLocalizableStringByKey(name);
			}

		});

		/**
		 * @class Terrasoft.configuration.MobileBaseDesignerViewModel
		 * Базовый класс модели представления модуля дизайнера.
		 */
		Ext.define("Terrasoft.configuration.MobileBaseDesignerViewModel", {
			extend: "Terrasoft.BaseViewModel",
			alternateClassName: "Terrasoft.MobileBaseDesignerViewModel",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Экземпляр класса настройки дизайнера
			 * @protected
			 * @type {Terrasoft.MobileBaseDesignerSettings}
			 */
			designerSettings: null,

			/**
			 * @inheritDoc Terrasoft.BaseViewModel#constructor
			 * @overridden
			 */
			constructor: function() {
				this.callParent(arguments);
				this.initResourcesValues(resources);
			},

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			init: function(callback, scope) {
				Ext.callback(callback, scope);
			},

			/**
			 * Выполняет необходимые операции после отображения представления.
			 * @protected
			 * @virtual
			 */
			onRender: function() {
			},

			/**
			 * Инициализирует модель значениями ресурсов из объекта ресурсов.
			 * @protected
			 * @virtual
			 * @param {Object} resourcesObj Объект ресурсов.
			 */
			initResourcesValues: function(resourcesObj) {
				var resourcesSuffix = "Resources";
				Terrasoft.each(resourcesObj, function(resourceGroup, resourceGroupName) {
					resourceGroupName = resourceGroupName.replace("localizable", "");
					Terrasoft.each(resourceGroup, function(resourceValue, resourceName) {
						var viewModelResourceName = [resourcesSuffix, resourceGroupName, resourceName].join(".");
						this.set(viewModelResourceName, resourceValue);
					}, this);
				}, this);
			},

			/**
			 * Обрабатывает нажатие кнопки добавления элементов {Terrasoft.GridLayoutEdit}
			 * @protected
			 * @virtual
			 */
			onAddGridLayoutItemButtonClick: function() {
			},

			/**
			 * Обрабатывает нажатие кнопки удаления элементов {Terrasoft.GridLayoutEdit}
			 * @protected
			 * @virtual
			 */
			onRemoveGridLayoutItemButtonClick: function() {
			},

			/**
			 * Обрабатывает действие настройки группы колонок.
			 * @protected
			 * @virtual
			 */
			onConfigureControlGroup: function() {
			},

			/**
			 * Обрабатывает действие удаления группы колонок.
			 * @protected
			 * @virtual
			 */
			onRemoveControlGroup: function() {
			},

			/**
			 * Обрабатывает выделение элементов сетки.
			 * @protected
			 * @virtual
			 * @param {Array} selectedItems Массив идентификаторов выделенных элементов.
			 * @param {String} name Имя элемента.
			 */
			onSelectedItemsChange: function(selectedItems, name) {
				var propertyName = this.getSelectedItemsPropertyName(name);
				this.set(propertyName, selectedItems);
				var enableRemove = (selectedItems.length > 0);
				var enableRemovePropertyName = this.getEnableRemovePropertyName(name);
				this.set(enableRemovePropertyName, enableRemove);
			},

			/**
			 * Обрабатывает изменения диапазона выделения.
			 * @protected
			 * @virtual
			 * @param {Object} selection Диапазон выделения.
			 * @param {String} name Имя элемента.
			 */
			onSelectionChanged: function(selection, name) {
				var propertyName = this.getSelectionPropertyName(name);
				this.set(propertyName, selection);
			},

			/**
			 * Обрабатывает изменения количества строк коллекции.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.BaseViewModelCollection} collection Коллекция элементов.
			 * @param {String} name Имя элемента.
			 */
			onCollectionChange: function(collection, name) {
				var rowsPropertyName = this.getRowsPropertyName(name);
				var count = collection.getCount();
				this.set(rowsPropertyName, count + 1);
			},

			/**
			 * Обрабатывает изменения свойста, отвечающего за свернутость элемента {Terrasoft.ControlGroup}.
			 * @protected
			 * @virtual
			 * @param {Boolean} isCollapsed Значение свойства.
			 * @param {String} name Имя элемента.
			 */
			onControlGroupCollapseChange: function(isCollapsed, name) {
				var visiblePropertyName = this.getVisiblePropertyName(name);
				this.set(visiblePropertyName, !isCollapsed);
			},

			/**
			 * Генерирует свойства и методы модели для представления {Terrasoft.GridLayoutEdit}.
			 * @protected
			 * @virtual
			 * @param {String} name Имя коллекции.
			 * @param {Object[]} items Элементы коллекции.
			 */
			generateGridLayoutEditViewBindingData: function(name, items) {
				items = items || [];
				var collection = this.createGridLayoutItemsViewModelCollection();
				for (var i = 0, ln = items.length; i < ln; i++) {
					var item = this.createGridLayoutItemViewModel(items[i]);
					collection.add(item.get("itemId"), item);
				}
				collection.on("add", Ext.bind(this.onCollectionChange, this, [collection, name]));
				collection.on("remove", Ext.bind(this.onCollectionChange, this, [collection, name]));
				var enableRemovePropertyName = this.getEnableRemovePropertyName(name);
				this.set(enableRemovePropertyName, false);
				var enableAddPropertyName = this.getEnableAddPropertyName(name);
				this.set(enableAddPropertyName, true);
				this.onCollectionChange(collection, name);
				this[name + "SelectedItemsChange"] = Ext.bind(this.onSelectedItemsChange, this, [name], true);
				this[name + "SelectionChanged"] = Ext.bind(this.onSelectionChanged, this, [name], true);
				var collectionPropertyName = this.getItemCollectionPropertyName(name);
				this.set(collectionPropertyName, collection);
			},

			/**
			 * Генерирует свойства и методы модели для представления {Terrasoft.ControlGroup}.
			 * @protected
			 * @virtual
			 * @param {String} name Имя коллекции.
			 */
			generateControlGroupBindingData: function(name) {
				var isCollapsed = false;
				this.set(name + "Collapsed", isCollapsed);
				var visiblePropertyName = this.getVisiblePropertyName(name);
				this.set(visiblePropertyName, !isCollapsed);
				this[name + "CollapseChange"] = Ext.bind(this.onControlGroupCollapseChange, this, [name],
					true);
			},

			/**
			 * Создает экземпляр модели представления элемента {Terrasoft.GridLayoutEdit}.
			 * @protected
			 * @virtual
			 * @param {Object} values Значения модели представления.
			 * @returns {Terrasoft.BaseViewModel} Экземпляр модели представления.
			 */
			createGridLayoutItemViewModel: function(values) {
				return Ext.create("Terrasoft.MobileDesignerGridLayoutItemViewModel", {
					values: values
				});
			},

			/**
			 * Создает коллекцию элементов для {Terrasoft.GridLayoutEdit}.
			 * @protected
			 * @virtual
			 * @returns {Terrasoft.BaseViewModelCollection} Коллекция элементов.
			 */
			createGridLayoutItemsViewModelCollection: function() {
				return Ext.create("Terrasoft.BaseViewModelCollection");
			},

			/**
			 * Удаляет коллекцию элементов для {Terrasoft.GridLayoutEdit}.
			 * @protected
			 * @virtual
			 * @param {String} name Имя коллекции.
			 */
			removeGridLayoutItemsCollection: function(name) {
				var collectionAttributeName = this.getItemCollectionPropertyName(name);
				this.set(collectionAttributeName, null);
			},

			/**
			 * Возвращает коллекцию элементов для {Terrasoft.GridLayoutEdit}.
			 * @protected
			 * @virtual
			 * @param {String} name Имя коллекции.
			 * @returns {Terrasoft.BaseViewModelCollection} Коллекция элементов.
			 */
			getItemsCollectionByName: function(name) {
				var collectionAttributeName = this.getItemCollectionPropertyName(name);
				return this.get(collectionAttributeName);
			},

			/**
			 * Возвращает имя свойства коллекции элементов для {Terrasoft.GridLayoutEdit}.
			 * @protected
			 * @virtual
			 * @param {String} name Имя коллекции.
			 * @returns {String} Имя свойства коллекции.
			 */
			getItemCollectionPropertyName: function(name) {
				return name + "ItemsCollection";
			},

			/**
			 * Возвращает имя свойства выбранных элементов.
			 * @protected
			 * @virtual
			 * @param {String} name Имя элемента.
			 * @returns {String} Имя свойства выбранных элементов.
			 */
			getSelectedItemsPropertyName: function(name) {
				return name + "SelectedItems";
			},

			/**
			 * Возвращает выбранные элементы.
			 * @protected
			 * @virtual
			 * @param {String} name Имя элемента.
			 * @returns {String} Выбранные элементы.
			 */
			getSelectedItemsByName: function(name) {
				var propertyName = this.getSelectedItemsPropertyName(name);
				return this.get(propertyName) || [];
			},

			/**
			 * Возвращает имя свойства диапазона выделения.
			 * @protected
			 * @virtual
			 * @param {String} name Имя элемента.
			 * @returns {String} Имя свойства диапазона выделения.
			 */
			getSelectionPropertyName: function(name) {
				return name + "Selection";
			},

			/**
			 * Возвращает диапазон выделения.
			 * @protected
			 * @virtual
			 * @param {String} name Имя элемента.
			 * @returns {String} Диапазон выделения.
			 */
			getSelectionByName: function(name) {
				var propertyName = this.getSelectionPropertyName(name);
				return this.get(propertyName);
			},

			/**
			 * Возвращает имя свойства количества строк.
			 * @protected
			 * @virtual
			 * @param {String} name Имя элемента.
			 * @returns {String} Имя свойства количества строк.
			 */
			getRowsPropertyName: function(name) {
				return name + "Rows";
			},

			/**
			 * Возвращает количество строк.
			 * @protected
			 * @virtual
			 * @param {String} name Имя элемента.
			 * @returns {String} Количество строк.
			 */
			getRowsByName: function(name) {
				var propertyName = this.getRowsPropertyName(name);
				return this.get(propertyName);
			},

			/**
			 * Возвращает имя свойства, указывающее на возможность добавлять элементы в коллекцию.
			 * @protected
			 * @virtual
			 * @param {String} name Имя элемента.
			 * @returns {String} Имя свойства.
			 */
			getEnableAddPropertyName: function(name) {
				return name + "EnableAdd";
			},

			/**
			 * Возвращает имя свойства, указывающее на возможность удалять элементы из коллекции.
			 * @protected
			 * @virtual
			 * @param {String} name Имя элемента.
			 * @returns {String} Имя свойства.
			 */
			getEnableRemovePropertyName: function(name) {
				return name + "EnableRemove";
			},

			/**
			 * Возвращает имя свойства, указывающее на видимость компонента {Terrasoft.GridLayoutEdit}.
			 * @protected
			 * @virtual
			 * @param {String} name Имя элемента.
			 * @returns {String} Имя свойства.
			 */
			getVisiblePropertyName: function(name) {
				return name + "Visible";
			},

			/**
			 * Генерирует конфигурацию коллекции элементов дизайнера на основании измененных данных.
			 * @protected
			 * @virtual
			 * @returns {Object} Конфигурация коллекции элементов дизайнера.
			 */
			generateSettingsConfigCollectionItems: function(collection) {
				var items = [];
				collection.each(function(item) {
					var itemConfig = item.getDesignerValues();
					items.push(itemConfig);
				});
				return items;
			},

			/**
			 * Удаляет выбранные элементы из коллекции.
			 * @protected
			 * @virtual
			 * @param {String} name Имя коллекции.
			 */
			removeSelectedItemsFromCollection: function(name) {
				var collection = this.getItemsCollectionByName(name);
				var selectedItems = this.getSelectedItemsByName(name);
				var selectedItemsLength = selectedItems.length;
				if (selectedItemsLength === 0) {
					return;
				}
				for (var i = 0; i < selectedItemsLength; i++) {
					var item = selectedItems[i];
					collection.removeByKey(item);
				}
				this.reRender();
			},

			/**
			 * Добавляет конфигурацию колонки в коллекцию.
			 * @protected
			 * @virtual
			 * @param {String} name Имя коллекции.
			 * @param {Object} columnItem Конфигурацию колонки.
			 */
			addColumnItemToGridLayoutCollection: function(name, columnItem) {
				var selection = this.getSelectionByName(name);
				if (Ext.isObject(selection) && Ext.isNumber(selection.row)) {
					columnItem.row = selection.row;
				} else {
					columnItem.row = this.getRowsByName(name) - 1;
				}
				var collection = this.getItemsCollectionByName(name);
				var gridLayoutItemViewModel = this.createGridLayoutItemViewModel(columnItem);
				collection.add(gridLayoutItemViewModel.get("itemId"), gridLayoutItemViewModel);
			},

			/**
			 * Возвращает конфигурацию колонки на основании конфигурации из окна настройки колонки.
			 * @param {Object} config Конфигурации из окна настройки колонки.
			 * @returns {Object} Конфигурация колонки.
			 */
			getColumnConfigFromStructureExplorer: function(config) {
				var caption = config.caption.join(".");
				return {
					caption: caption,
					columnName: config.leftExpressionColumnPath,
					dataValueType: config.dataValueType
				};
			},

			/**
			 * Открывает окно выбора колонки.
			 * @param config Конфигурация выбора колонки.
			 * @param {String} config.callback Имя метода-обработчика результата выбора.
			 * @param {String} config.entitySchemaName Название схемы.
			 */
			openStructureExplorer: function(config) {
				var structureExplorerConfig = {
					schemaName: config.entitySchemaName,
					excludeDataValueTypes: [Terrasoft.DataValueType.IMAGELOOKUP],
					useBackwards: false
				};
				StructureExplorerUtilities.Open(this.sandbox, structureExplorerConfig, config.callback,
					this.renderTo, this);
			},

			/**
			 * Перегенерирует и перерисовывает представление схемы.
			 */
			reRender: function() {
			},

			/**
			 * Генерирует конфигурацию дизайнера на основании измененных данных.
			 * @returns {Object} Конфигурация дизайнера.
			 */
			generateDesignerSettingsConfig: function() {
				return this.designerSettings.getSettingsConfig();
			}

		});

		/**
		 * @class Terrasoft.configuration.MobileDesignerBuilder
		 * Базовый класс по работе с представлением дизайнера.
		 */
		Ext.define("Terrasoft.configuration.MobileDesignerBuilder", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.MobileDesignerBuilder",

			/**
			 * Имя класа модели представления.
			 * @type {String}
			 */
			viewModelClassName: null,

			/**
			 * Имя класа генерации конфигурации представления.
			 * @type {String}
			 */
			viewModelConfigClassName: null,

			/**
			 * Имя класа генератора представления.
			 * @type {String}
			 */
			viewGeneratorClass: "Terrasoft.ViewGenerator",

			/**
			 * Создает экземпляр класса генератора представления.
			 * @private
			 * @returns {Terrasoft.ViewGenerator} Экземпляр класса генератора представления.
			 */
			createViewGenerator: function() {
				return Ext.create(this.viewGeneratorClass);
			},

			/**
			 * Генерирует представления.
			 * @private
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			buildView: function(callback, scope) {
				var viewGenerator = this.createViewGenerator();
				var schema = {
					viewConfig: this.getViewConfig()
				};
				var viewConfig = {
					schema: schema,
					viewModelClass: this.viewModelClassName
				};
				viewGenerator.generate(viewConfig, callback, scope);
			},

			/**
			 * Возвращает сгенерированную конфигурации представления.
			 * @private
			 * @returns {Object[]} Сгенерированная конфигурация представления.
			 */
			getViewConfig: function() {
				var designerSettings = this.designerSettings;
				var viewConfig = Ext.create(this.viewModelConfigClassName);
				return viewConfig.generate(designerSettings);
			},

			/**
			 * Запускает генерацию представления.
			 * @param {Object} designerSettings Экземпляр класса настройки дизайнера.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			build: function(designerSettings, callback, scope) {
				this.designerSettings = designerSettings;
				var viewModelClass = this.viewModelClassName;
				this.buildView(function(view) {
					Ext.callback(callback, scope, [viewModelClass, view]);
				}, this);
			},

			/**
			 * Запускает перегенерацию представления.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			reBuildView: function(callback, scope) {
				this.buildView(callback, scope);
			}

		});

		/**
		 * @class Terrasoft.configuration.MobileBaseDesignerModule
		 * Базовый класс модуля дизайнера мобильного приложения.
		 */
		var designerModule = Ext.define("Terrasoft.configuration.MobileBaseDesignerModule", {
			extend: "Terrasoft.BaseSchemaModule",
			alternateClassName: "Terrasoft.MobileBaseDesignerModule",

			/**
			 * Имя класа модели представления.
			 * @type {String}
			 */
			viewModelClassName: null,

			/**
			 * Имя класа генерации конфигурации представления.
			 * @type {String}
			 */
			viewModelConfigClassName: null,

			/**
			 * Имя класса настройки.
			 * @type {String}
			 */
			designerSettingsClassName: null,

			mixins: {
				HistoryStateUtilities: "Terrasoft.HistoryStateUtilities"
			},

			/**
			 * Создает экземпляр класса по работе с представлением.
			 * @private
			 * @returns {Terrasoft.MobileDesignerBuilder} Экземпляр класса по работе с представлением.
			 */
			createBuilder: function() {
				this.builder = Ext.create("Terrasoft.MobileDesignerBuilder", {
					viewModelClassName: this.viewModelClassName,
					viewModelConfigClassName: this.viewModelConfigClassName
				});
				return this.builder;
			},

			/**
			 * Запускает генерацию представления.
			 * @private
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			build: function(callback, scope) {
				var builder = this.createBuilder();
				var designerSettings = this.getDesignerSettings();
				builder.build(designerSettings, function(viewModelClass, view) {
					callback.call(scope, viewModelClass, view);
				}, this);
			},

			/**
			 * @private
			 */
			getDesignerSettings: function() {
				if (!this.designerSettings) {
					var settingsConfig = this.getSettingsConfig();
					this.designerSettings = this.createDesignerSettings(settingsConfig);
				}
				return this.designerSettings;
			},

			/**
			 * Перерисовывает представление.
			 * @private
			 * @param {Object} viewConfig Перегенерированная конфигурация представления.
			 */
			reRender: function(viewConfig) {
				this.viewConfig = viewConfig;
				var view = this.view;
				if (view) {
					view.destroy();
				}
				var renderTo = Ext.get(this.renderToId);
				this.render(renderTo);
			},

			/**
			 * @inheritDoc Terrasoft.BaseSchemaModule#init
			 * @overridden
			 */
			init: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("PostDesignerSettings", function() {
					return this.viewModel.generateDesignerSettingsConfig();
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.BaseSchemaModule#generateSchemaStructure
			 * @overridden
			 */
			generateSchemaStructure: function(callback, scope) {
				var designerSettings = this.getDesignerSettings();
				designerSettings.initialize(function() {
					var buildBoundFn = Ext.bind(this.build, this, [callback, scope]);
					SectionDesignDataModule.init(this.sandbox, buildBoundFn);
				}, this);
			},

			/**
			 * Создает экземпляр класса настройки дизайнера.
			 * @protected
			 * @virtual
			 * @param {Object} settingsConfig Конфигурация настройки дизайнера.
			 * @returns {Terrasoft.MobileBaseDesignerSettings} Экземпляр класса настройки дизайнера.
			 */
			createDesignerSettings: function(settingsConfig) {
				return Ext.create(this.designerSettingsClassName, {
					sandbox: this.sandbox,
					settingsConfig: settingsConfig
				});
			},

			/**
			 * Возвращает конфигурационный объект модели представления.
			 * @protected
			 * @virtual
			 * @returns {Object} Конфигурационный объект модели представления.
			 */
			getViewModelConfig: function() {
				var designerSettings = this.getDesignerSettings();
				var schema = {
					entitySchema: designerSettings.entitySchema,
					entitySchemaName: designerSettings.entitySchemaName
				};
				return {
					values: {
						schema: schema
					},
					designerSettings: designerSettings,
					sandbox: this.sandbox,
					reRender: Ext.bind(function() {
						this.builder.reBuildView(this.reRender, this);
					}, this)
				};
			},

			/**
			 * Возвращает конфигурацию настройки дизайнера.
			 * @protected
			 * @virtual
			 * @returns {Object} Конфигурация настройки дизайнера.
			 */
			getSettingsConfig: function() {
				var settingsConfig = this.sandbox.publish("GetDesignerSettings");
				return settingsConfig;
			}
		});
		return designerModule;

	});
