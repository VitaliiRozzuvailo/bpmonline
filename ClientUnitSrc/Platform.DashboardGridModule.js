define("DashboardGridModule", ["terrasoft", "ext-base", "DashboardGridModuleResources", "MaskHelper",
	"BaseNestedModule", "GridUtilitiesV2", "ContainerListGenerator", "ContainerList"],
	function(Terrasoft, Ext, resources, MaskHelper) {

		/**
		 * @class Terrasoft.configuration.DashboardGridViewConfig
		 * Класс генерурующий конфигурацию представления модуля реестра в итогах.
		 */
		Ext.define("Terrasoft.configuration.DashboardGridViewConfig", {
			extend: "Terrasoft.BaseModel",
			alternateClassName: "Terrasoft.DashboardGridViewConfig",

			/**
			 * Генерурует набор конфигураций представлений элементов для сетки на основе конфигурации реестра.
			 * @protected
			 * @virtual
			 * @param {Object} config Объект конфигурации.
			 * @param {Terrasoft.BaseEntitySchema} config.entitySchema Cхема объекта.
			 * @param {String} config.gridConfig Объект настройки колонок.
			 * @return {Object[]} Возвращает набор конфигураций представлений элементов для сетки.
			 */
			getColumnsConfig: function(config) {
				var gridConfig = config.gridConfig;
				if (!gridConfig) {
					return null;
				}
				var entitySchema = config.entitySchema;
				var result = [];
				Terrasoft.each(gridConfig.items, function(item) {
					if (item.position.row) {
						item.position.row--;//в настройке колонок индексация начинается с 1 а не с 0
					}
					var columnConfig = this.getColumnConfig(item, entitySchema);
					result.push(columnConfig);
				}, this);
				return result;
			},

			/**
			 * Возвращает конфигурацию представления элемента сетки.
			 * @protected
			 * @virtual
			 * @param {Object} gridConfigItem Содержит информацию о колонке.
			 * @param {Terrasoft.BaseEntitySchema} entitySchema Cхема сущности.
			 * @return {Object} columnConfig Возвращает конфигурацию представления элемента сетки.
			 */
			getColumnConfig: function(gridConfigItem, entitySchema) {
				var labelClass = [];
				var columnConfig = {};
				var column = entitySchema.getColumnByName(gridConfigItem.bindTo);
				var columnDataValueType = gridConfigItem.dataValueType || (column && column.dataValueType);
				if (Terrasoft.isNumberDataValueType(columnDataValueType)) {
					labelClass.push("grid-number");
				}
				if (Terrasoft.isDateDataValueType(columnDataValueType)) {
					labelClass.push("grid-date");
				}
				if (this.isLink(gridConfigItem, entitySchema)) {
					labelClass.push("label-link");
					columnConfig.tag = gridConfigItem.bindTo;
					columnConfig.click = {bindTo: "onLinkClick"};
				}
				if (gridConfigItem.type === Terrasoft.GridCellType.TITLE) {
					labelClass.push("grid-header");
				}
				Ext.apply(columnConfig, {
					"name": Terrasoft.Component.generateId(),
					"itemType": Terrasoft.ViewItemType.LABEL,
					"classes": {"labelClass": labelClass},
					"caption": {
						bindTo: gridConfigItem.bindTo,
						bindConfig: {converter: "valueConverter"}
					},
					"layout": gridConfigItem.position
				});
				return columnConfig;
			},

			/**
			 * Определяет является ли данная колонка ссылкой.
			 * @private
			 * @param {Object} item Содержит информацию о колонке.
			 * @param {Terrasoft.BaseEntitySchema} entitySchema Cхема сущности.
			 * @return {Boolean} Возвращает признак, является ли данная колонка ссылкой.
			 */
			isLink: function(item, entitySchema) {
				var column = entitySchema.getColumnByName(item.bindTo);
				var linkType = item.type === Terrasoft.GridCellType.LINK;
				if (!column || !column.dataValueType) {
					return false;
				}
				var isLookup = Terrasoft.isLookupDataValueType(column.dataValueType);
				var isSchemaModule = Terrasoft.configuration.ModuleStructure[entitySchema.name];
				if (!entitySchema.primaryDisplayColumn) {
					return false;
				}
				var isPrimaryDisplayColumn = (column.name === entitySchema.primaryDisplayColumn.name) &&
					isSchemaModule;
				return linkType || isLookup || isPrimaryDisplayColumn;
			},

			/**
			 * Генерирует конфигурацию представления модуля реестра в итогах.
			 * @protected
			 * @virtual
			 * @param {Object} config Объект конфигурации.
			 * @param {Terrasoft.BaseEntitySchema} config.entitySchema Cхема объекта.
			 * @param {String} config.style Стиль отображения.
			 * @return {Object[]} Возвращает конфигурацию представления модуля реестра в итогах.
			 */
			generate: function(config) {
				var columnsConfig = this.getColumnsConfig(config) || [];
				var entitySchema = config.entitySchema;
				var primaryColumnName = (entitySchema) ? entitySchema.primaryColumnName : "Id";
				var moduleId = Terrasoft.Component.generateId();
				return {
					"name": "gridContainer" + moduleId,
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {wrapClassName: ["dashboard-grid-container", config.style]},
					"items": [{
						"name": "gridCaptionContainer" + moduleId,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {"wrapClassName": ["default-widget-header", config.style]},
						"items": [{
							"name": "dashboard-grid-caption" + moduleId,
							"itemType": Terrasoft.ViewItemType.LABEL,
							"caption": {"bindTo": "caption"},
							"labelClass": "default-widget-header-label"
						}]
					}, {
						"name": "DataGrid" + moduleId,
						"idProperty": primaryColumnName,
						"collection": {"bindTo": "GridData"},
						"classes": {wrapClassName: ["dashboard-grid-list"]},
						"generator": "ContainerListGenerator.generatePartial",
						"itemType": Terrasoft.ViewItemType.GRID,
						"itemConfig": [{
							itemType: Terrasoft.ViewItemType.GRID_LAYOUT,
							name: "itemGridLayout",
							items: columnsConfig
						}]
					}]
				};
			}
		});

		/**
		 * @class Terrasoft.configuration.DashboardGridViewModel
		 * Класс модели представления модуля реестра в итогах.
		 */
		Ext.define("Terrasoft.configuration.DashboardGridViewModel", {
			extend: "Terrasoft.BaseViewModel",
			alternateClassName: "Terrasoft.DashboardGridViewModel",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Классы-миксины (примеси), расширяющие функциональность данного класа.
			 */
			mixins: {
				/**
				 * @class GridUtilities реализующий базовые методы работы с реестром.
				 */
				GridUtilities: "Terrasoft.GridUtilities"
			},

			constructor: function() {
				this.callParent(arguments);
				this.initResourcesValues(resources);
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
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				this.initGridData();
				this.mixins.GridUtilities.init.call(this);
				if (this.get("entitySchemaName")) {
					this.loadGridData();
				}
				callback.call(scope);
			},

			/**
			 * Возвращает фильтры.
			 * @protected
			 * @overridden
			 * @returns {Terrasoft.FilterGroup} Примененные фильтры.
			 */
			getFilters: function() {
				var filters = this.Ext.create("Terrasoft.FilterGroup");
				var filterData = this.get("filterData");
				if (Ext.isString(filterData)) {
					filters.addItem(Terrasoft.deserialize(filterData));
				}
				var column = this.get("sectionBindingColumn");
				if (!Ext.isEmpty(this.get("sectionId")) && !Ext.isEmpty(column)) {
					var quickFilter = this.sandbox.publish("GetFiltersCollection", null);
					if (quickFilter && !quickFilter.isEmpty()) {
						column = column.replace(/\.[iI]d$|^[iI]d$/, "");
						if (!Ext.isEmpty(column)) {
							this.updateModuleFilter(quickFilter, column);
						}
						filters.addItem(quickFilter);
					}
				}
				return filters;
			},

			/**
			 * Получает коллекцию колонок.
			 * @protected
			 * @overridden
			 * @return {Object} Объект коллекции колонок.
			 */
			getProfileColumns: function() {
				var profileColumns = {};
				var profile = this.get("gridConfig");
				this.convertProfileColumns(profileColumns, profile);
				return profileColumns;
			},

			/**
			 * Обрабатывает объект настройки колонок, генеририрует на его основе коллекцию колонок.
			 * @protected
			 * @overridden
			 * @param {Object} profileColumns Коллекция колонок.
			 * @param {Object} columnsConfig Объект настройки колонок.
			 */
			convertProfileColumns: function(profileColumns, columnsConfig) {
				this.Terrasoft.each(columnsConfig.items, function(item) {
					var metaPath = item.bindTo;
					if (metaPath && !profileColumns[metaPath]) {
						profileColumns[metaPath] = {
							aggregationType: item.aggregationType,
							caption: item.caption,
							dataValueType: item.dataValueType,
							path: metaPath,
							subFilters: this.Terrasoft.deserialize(item.serializedFilter),
							type: this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN
						};
					}
				}, this);
			},

			/**
			 * Инициализирует колонки сортировки.
			 * @protected
			 * @overridden
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будут инициализорованы опции сортировки.
			 */
			initQuerySorting: function(esq) {
				var columnsConfig = this.get("gridConfig");
				Terrasoft.each(columnsConfig.items, function(cell) {
					var columnPath = cell.bindTo;
					if (cell.orderDirection && cell.orderDirection !== "") {
						var sortedColumn = esq.columns.collection.get(columnPath);
						sortedColumn.orderPosition = cell.orderPosition;
						sortedColumn.orderDirection = cell.orderDirection;
					}
				}, this);
				var gridDataColumns = this.getGridDataColumns();
				this.Terrasoft.each(gridDataColumns, function(column) {
					if (!this.Ext.isEmpty(column.orderPosition)) {
						var sortedColumn = esq.columns.collection.get(column.path);
						sortedColumn.orderPosition = column.orderPosition;
						sortedColumn.orderDirection = column.orderDirection;
					}
				}, this);
			},

			/**
			 * Добавляет подзапрос, который вычисляет количество активных точек входа по процессу.
			 * Необходим необходим для миксина GridUtilities.
			 * @protected
			 * @virtual
			 */
			addProcessEntryPointColumn: Terrasoft.emptyFn,

			/**
			 * Добавляет метод обработки нажатия на ссылку.
			 * @protected
			 * @overridden
			 * @param {Terrasoft.BaseViewModel} item Элемент реестра.
			 * @param {Object} column Колонка элемента реестра.
			 */
			addColumnLink: Terrasoft.emptyFn,

			/**
			 * Метод обработки нажатия на ссылку в списке. Прокидывается в модель представления элемента списка.
			 * @protected
			 * @param {String} columnPath Имя колонки.
			 */
			onLinkClick: function(columnPath) {
				if (this.isDesigned) {
					return false;
				}
				var entitySchemaName, columnName, columnValue;
				var column = this.getColumnByName(columnPath);
				if (column.isLookup) {
					entitySchemaName = column.referenceSchemaName;
					columnName = this.get(columnPath);
					columnValue = columnName.value;
					if (!columnValue) {
						return;
					}
				} else if (column.columnPath === this.primaryDisplayColumnName) {
					entitySchemaName = this.entitySchema.name;
					columnName = this.primaryColumnName;
					columnValue = this.get(columnName);
				}
				var entitySchemaConfig = Terrasoft.configuration.ModuleStructure[entitySchemaName];
				if (entitySchemaConfig) {
					var cardSchema = entitySchemaConfig.cardSchema;
					if (entitySchemaConfig.attribute) {
						var typeId = this.get(columnPath + "." + entitySchemaConfig.attribute) ||
							this.get(entitySchemaConfig.attribute);
						Terrasoft.each(entitySchemaConfig.pages, function(item) {
							if (typeId && item.UId === typeId.value && item.cardSchema) {
								cardSchema = item.cardSchema;
							}
						}, this);
					}
					MaskHelper.ShowBodyMask();
					var hash = Terrasoft.combinePath(entitySchemaConfig.cardModule, cardSchema, "edit", columnValue);
					this.sandbox.publish("PushHistoryState", {hash: hash});
				}
			},

			/**
			 * Возвращает количество загружаемых строк.
			 * @protected
			 * @overridden
			 * @return {Number} Количество загружаемых строк реестра.
			 */
			getRowCount: function() {
				return this.get("rowCount");
			},

			/**
			 * Модификация коллекции данных перед загрузкой в реестр.
			 * @protected
			 * @overridden
			 * @param {Terrasoft.Collection} collection Коллекция элементов реестра.
			 */
			prepareResponseCollection: function(collection) {
				this.mixins.GridUtilities.prepareResponseCollection.apply(this, arguments);
				collection.each(function(item) {
					item.sandbox = this.sandbox;
					item.valueConverter = this.valueConverter;
					item.onLinkClick = this.onLinkClick;
					item.isDesigned = this.get("isDesigned");
				}, this);
			},

			/**
			 * Генерирует строковое представление value.
			 * @protected
			 * @virtual
			 * @param {Object|String|Number} value Значение в модели представлении.
			 * @param {Terrasoft.DataValueType} dataValueType Тип данных.
			 * @returns {String} Возвращает строковое представление value.
			 */
			valueConverter: function(value, dataValueType) {
				return Terrasoft.getTypedStringValue(value, dataValueType);
			},

			/**
			 * Получает коллекцию строк реестра.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.Collection} Возвращает коллекцию строк реестра.
			 */
			getGridData: function() {
				return this.get("GridData");
			},

			/**
			 * Инициализирует коллекцию данных представления рееестра.
			 * @protected
			 * @virtual
			 */
			initGridData: function() {
				this.set("IsPageable", false);
				this.set("IsGridEmpty", false);
				this.set("isLoading", false);
				this.set("GridData", this.Ext.create("Terrasoft.BaseViewModelCollection"));
			},

			onRender: Ext.emptyFn,

			/**
			 * Обновляет фильтры раздела в зависимости от настройки связи с разделом.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.FilterGroup} quickFilter Объект фильтров раздела.
			 * @param {String} column Колонка связи с разделом.
			 */
			updateModuleFilter: function(quickFilter, column) {
				var leftExpression = quickFilter.leftExpression;
				if (!Ext.isEmpty(leftExpression)) {
					leftExpression.columnPath = column + "." + leftExpression.columnPath;
				} else {
					quickFilter.each(function(item) {
						this.updateModuleFilter(item, column);
					}, this);
				}
			}
		});

		/**
		 * @class Terrasoft.configuration.DashboardGridModule
		 * Класс модуля реестра в итогах.
		 */
		Ext.define("Terrasoft.configuration.DashboardGridModule", {
			extend: "Terrasoft.BaseNestedModule",
			alternateClassName: "Terrasoft.DashboardGridModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,
			showMask: true,

			/**
			 * Объект конфигурации модуля.
			 * @type {Object}
			 */
			moduleConfig: null,

			/**
			 * Объект схемы сущности.
			 * @type {Terrasoft.BaseEntitySchema}
			 */
			entitySchema: null,

			/**
			 * Имя класса модели представления для вложенного модуля.
			 * @type {String}
			 */
			viewModelClassName: "Terrasoft.DashboardGridViewModel",

			/**
			 * Имя класа генератога конфигурации представления вложенного модуля.
			 * @type {String}
			 */
			viewConfigClassName: "Terrasoft.DashboardGridViewConfig",

			/**
			 * Имя класа генератога представления.
			 * @type {String}
			 */
			viewGeneratorClass: "Terrasoft.ViewGenerator",

			/**
			 * Создает экземпляр класса Terrasoft.ViewGenerator.
			 * @return {Terrasoft.ViewGenerator} Возвращает объект Terrasoft.ViewGenerator.
			 */
			createViewGenerator: function() {
				return this.Ext.create(this.viewGeneratorClass);
			},

			/**
			 * Создает конфигурацию представления вложенного модуля.
			 * @protected
			 * @virtual
			 * param {Object} config Объект конфигурации.
			 * param {Function} callback Функция обратного вызова.
			 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
			 * @return {Object[]} Возвращает конфигурацию представления вложенного модуля.
			 */
			buildView: function(config, callback, scope) {
				var viewGenerator = this.createViewGenerator();
				var viewClass = this.Ext.create(this.viewConfigClassName);
				var schema = {
					viewConfig: [viewClass.generate(config)]
				};
				var viewConfig = Ext.apply({
					schema: schema
				}, config);
				viewGenerator.generate(viewConfig, callback, scope);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewConfig
			 * @overridden
			 */
			initViewConfig: function(callback, scope) {
				var generatorConfig = Terrasoft.deepClone(this.moduleConfig);
				generatorConfig.viewModelClass = this.viewModelClass;
				generatorConfig.entitySchema = this.entitySchema;
				this.buildView(generatorConfig, function(view) {
					this.viewConfig = view[0];
					callback.call(scope);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewModelClass
			 * @overridden
			 */
			initViewModelClass: function(callback, scope) {
				var moduleConfig = this.moduleConfig;
				Terrasoft.require([moduleConfig.entitySchemaName], function(entitySchema) {
					this.entitySchema = entitySchema;
					this.viewModelClass = Ext.ClassManager.get(this.viewModelClassName);
					callback.call(scope);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#getViewModelConfig
			 * @overridden
			 */
			getViewModelConfig: function() {
				var config = this.callParent(arguments);
				config.values = this.moduleConfig;
				config.entitySchema = this.entitySchema;
				return config;
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#init
			 * @overridden
			 */
			init: function() {
				if (!this.viewModel) {
					this.initConfig();
					var sandbox = this.sandbox;
					var sectionFilterModuleId = sandbox.publish("GetSectionFilterModuleId");
					sandbox.subscribe("GenerateDashboardGrid", this.onGenerateDashboardGrid, this, [sandbox.id]);
					sandbox.subscribe("UpdateFilter", function() {
						if (!Ext.isEmpty(this.moduleConfig.sectionId) &&
							!Ext.isEmpty(this.moduleConfig.sectionBindingColumn)) {
							this.onGenerateDashboardGrid();
						}
					}, this, [sectionFilterModuleId]);
				}
				this.callParent(arguments);
			},

			/**
			 * Инициализирует объект конфигурации модуля.
			 * @protected
			 * @virtual
			 */
			initConfig: function() {
				this.moduleConfig = this.sandbox.publish("GetDashboardGridConfig", null, [this.sandbox.id]);
			},

			/**
			 * Метод обработки сообщения генерации списка.
			 * @protected
			 * @virtual
			 */
			onGenerateDashboardGrid: function() {
				if (this.view && !this.view.destroyed) {
					this.view.destroy();
				}
				this.view = null;
				if (!this.viewModel) {
					return true;
				}
				var renderTo = Ext.get(this.viewModel.renderTo);
				if (this.viewModel && !this.viewModel.destroyed) {
					this.viewModel.destroy();
				}
				this.viewModel = null;
				this.initConfig();
				this.initViewModelClass(function() {
					if (this.destroyed) {
						return;
					}
					this.initViewConfig(function() {
						if (this.destroyed) {
							return;
						}
						var viewModel = this.viewModel = this.createViewModel();
						viewModel.init(function() {
							if (!this.destroyed && renderTo) {
								this.render(renderTo);
							}
						}, this);
					}, this);
				}, this);

				return true;
			}
		});

		return Terrasoft.DashboardGridModule;
	});
