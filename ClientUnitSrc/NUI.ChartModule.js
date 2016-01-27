define("ChartModule", ["ChartModuleHelper", "LocalizationUtilities", "ChartModuleResources", "DataUtilities",
	"BaseNestedModule", "HighchartsWrapper", "EntityStructureHelperMixin", "GridUtilitiesV2", "DashboardEnums",
	"ChartDrillDownProvider", "ContainerList"],
function(chartModuleHelper, LocalizationUtilities, resources, DataUtilities) {

	/**
	 * @class Terrasoft.configuration.ChartViewModel
	 * Класс модели представления модуля графика.
	 */
	Ext.define("Terrasoft.configuration.ChartViewModel", {
		extend: "Terrasoft.BaseViewModel",
		alternateClassName: "Terrasoft.ChartViewModel",

		"mixins": {
			"GridUtilities": "Terrasoft.GridUtilities"
		},

		Ext: null,
		sandbox: null,
		Terrasoft: null,

		/**
		 * Схема объекта для модели представления модуля.
		 * @type {Terrasoft.BaseEntitySchema}
		 */
		entitySchema: Ext.create("Terrasoft.BaseEntitySchema", {
			columns: {},
			primaryColumnName: "Id"
		}),

		/**
		 * Тег сообщения фильтрации.
		 * {String}
		 */
		filterMessageTag: null,

		/**
		 * Объект развязки значений названия параметров и колонок модели представления.
		 * @type {Object}
		 */
		chartModulePropertiesTranslator: {
			"Caption": "caption",
			"hideCaption": "hideCaption",
			"EntitySchemaName": "schemaName",
			"sectionBindingColumn": "sectionBindingColumn",
			"Func": "func",
			"SeriesKind": "type",
			"XAxisCaption": "XAxisCaption",
			"YAxisCaption": "YAxisCaption",
			"XAxisColumn": "xAxisColumn",
			"YAxisColumn": "yAxisColumn",
			"DateTimeFormat": "dateTimeFormat",
			"OrderByAxis": "orderBy",
			"OrderDirection": "orderDirection",
			"IsPercentageMode": "isPercentageMode",
			"primaryColumnName": "primaryColumnName",
			"SerializedFilterData": "filterData",
			"styleColor": "styleColor",
			"SeriesConfig": "seriesConfig",
			"YAxisConfig": "yAxisConfig"
		},

		/**
		 * Объект свойств модели.
		 * type {Object}
		 */
		columns: {
			"NonLocalizedCaption": {
				columnPath: "Caption",
				type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			"SeriesKind": {
				columnPath: "SysChartSeriesKind.Code",
				type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			"Func": {
				columnPath: "SysAggregationType.Code",
				type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			},
			"DateTimeFormat": {
				columnPath: "SysDateTimeFormat.Code",
				type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN
			}
		},

		/**
		 * Префикс ключа профиля.
		 * @type {String}
		 */
		profilePrefix: "profile!",

		/**
		 * Код системной настройки ограничения запроса данных графика.
		 * @protected
		 * @virtual
		 * @type {String}
		 */
		queryDataLimitSysSettingCode: "ChartQueryDataLimit",

		constructor: function() {
			this.callParent(arguments);
			this.initResourcesValues(resources);
			var entityColumns = Terrasoft.deepClone(this.entitySchema.columns);
			var skipColumns = ["Caption", "SeriesKind", "EntitySchema", "YAxisColumnCaption", "XAxisColumnCaption",
				"ModuleSchemaColumnNameCaption", "Order"];
			Terrasoft.each(entityColumns, function(column, columnName) {
				if (skipColumns.indexOf(columnName) !== -1) {
					return;
				}
				column.type = Terrasoft.ViewModelColumnType.ENTITY_COLUMN;
				column.columnPath = columnName;
			}, this);
			Ext.apply(entityColumns, this.columns);
			this.columns = entityColumns;
		},

		/**
		 * Возвращает структуру раздела.
		 * @protected
		 * @param {String} moduleName Название объекта.
		 * @return {Object} Структура раздела.
		 */
		getModuleStructure: function(moduleName) {
			return this.Terrasoft.configuration.ModuleStructure[moduleName];
		},

		/**
		 * Обрабатывает событие отображения представления модуля.
		 * @virtual
		 */
		onRender: function() {
			if (!this.get("Restored")) {
				return;
			}
			if (this.get("GridSettingsChanged") === true) {
				this.reloadGridData();
			} else {
				this.reloadGridColumnsConfig(true);
			}
		},

		/**
		 * Преобразует стиль виджета в цвет.
		 * @param {String} value Название стиля.
		 * @returns {String} Возвращает цвет, соответствующий названию стиля.
		 */
		styleColorConverter: function(value) {
			return Terrasoft.DashboardEnums.StyleColors[value];
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
		 * Возвращает клиентский запрос с локализированной колонкой заголовка.
		 * @overridden
		 * @return {Terrasoft.EntitySchemaQuery} Возвращает клиентский запрос с локализированной колонкой заголовка.
		 */
		getEntitySchemaQuery: function() {
			var entitySchemaQuery = this.callParent(arguments);
			LocalizationUtilities.addLocalizableColumn(entitySchemaQuery, "Caption");
			return entitySchemaQuery;
		},

		/**
		 * Создает график на основании объекта настроек.
		 * @protected
		 * @virtual
		 * @param {Object} config Конфигурационный объект настроек.
		 */
		createChartByConfig: function(config) {
			Terrasoft.each(this.chartModulePropertiesTranslator, function(configName, viewModelName) {
				var value = config[configName];
				if (value) {
					this.set(viewModelName, value);
				}
			}, this);
		},

		/**
		 * Возвращает массив категорий для текущего набора данных.
		 * @protected
		 * @virtual
		 * @return {String[]} Возвращает массив категорий для текущего набора данных.
		 */
		getCategories: function() {
			var seriesData = this.get("SeriesData");
			var categories = seriesData && seriesData[0].data.map(function(item) {
				return item.name;
			});
			return categories || [];
		},

		/**
		 * Пересчитывает набор данных в процентное соотношение.
		 * @protected
		 * @virtual
		 * @param {Object} seriesData Данные серии.
		 * @return {String[]} Возвращает пересчитанный набор данных.
		 */
		parseToPercentage: function(seriesData) {
			var countY = 0;
			Terrasoft.each(seriesData, function(item) {
				countY += item.y;
			});
			countY = (100 / countY);
			Terrasoft.each(seriesData, function(item) {
				item.y = parseFloat((item.y * countY).toFixed(2));
			});
			return seriesData;
		},

		/**
		 * Сворачивает график.
		 * @protected
		 * @virtual
		 */
		drillUp: function() {
			this.drillDownProvider.drillUp();
			this.refresh();
		},

		/**
		 * Возвращает состояние графика к исходному.
		 * @protected
		 * @virtual
		 */
		cancelDrill: function() {
			this.drillDownProvider.cancelDrill();
			this.refresh();
		},

		/**
		 * Разворачивает график по выбранной точке.
		 * @protected
		 * @virtual
		 * @param {string} tag Тип для разворачиваемого графика.
		 */
		drillDownChart: function(tag) {
			var categoryItem = this.get("CurrentPoint").categoryItem;
			this.drillDownProvider.drillDownChart(categoryItem, function() {
				this.drillDownProvider.changeCurrentHistory({
					seriesKind: tag
				}, this);
				this.refresh();
			}, this);
		},

		/**
		 * Изменяет тип графика.
		 * @protected
		 * @virtual
		 * @param {String} seriesKind Новый тип графика.
		 */
		changeChartType: function(seriesKind) {
			this.drillDownProvider.changeCurrentHistory({
				seriesKind: seriesKind
			}, this);
			this.set("SeriesKind", seriesKind);
		},

		/**
		 * Производит разворачивание графика по выбранной точке с переходом в реестр данных.
		 * @protected
		 * @virtual
		 */
		showDrillDownData: function() {
			var currentPoint = this.get("CurrentPoint");
			var categoryItem = currentPoint.categoryItem;
			this.drillDownProvider.addItemFilter(categoryItem);
			this.drillDownProvider.changeCurrentHistory({
				displayMode: Terrasoft.DashboardEnums.ChartDisplayMode.GRID,
				entitySchemaName: categoryItem.entitySchemaName,
				categoryItem: categoryItem,
				xAxisColumn: this.drillDownProvider.getCategoryItemXAxisColumnPath(categoryItem),
				yAxisColumn: this.drillDownProvider.getCategoryItemYAxisColumnPath(categoryItem)
			});
			this.refresh();
		},

		/**
		 * Перезагружает данные для текущего состояния.
		 * @protected
		 * @virtual
		 * param {Function} callback Функция обратного вызова.
		 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
		 */
		refresh: function(callback, scope) {
			var displayMode = this.drillDownProvider.getDisplayMode();
			this.set("displayMode", displayMode);
			switch (displayMode) {
				case Terrasoft.DashboardEnums.ChartDisplayMode.CHART:
					this.getChartSeriesData(function() {
						this.set("SeriesKind", this.drillDownProvider.getSeriesKind());
						this.updateChartSize();
						if (callback) {
							callback.call(scope);
						}
					}, this);
					break;
				case Terrasoft.DashboardEnums.ChartDisplayMode.GRID:
					this.set("IsClearGridData", true);
					this.prepareProfile();
					this.initSortActionItems();
					this.loadGridData();
					if (callback) {
						callback.call(scope);
					}
					break;
			}
		},

		/**
		 * Возвращает шаблонный объект элемента настройки реестра.
		 * @protected
		 * @virtual
		 * @param {String} entitySchemaName Объект entity схемы.
		 * @param {String} columnPath Путь колонки.
		 * @return {Object} Возвращает шаблонный объект элемента настройки реестра.
		 */
		getGridItemTemplateConfig: function(entitySchemaName, columnPath) {
			var caption = this.drillDownProvider.getEntitySchemaColumnCaption(entitySchemaName, columnPath);
			if (!caption) {
				var entitySchema = this.drillDownProvider.getEntitySchemaByName(entitySchemaName);
				var columns = entitySchema.columns;
				caption = columns[columnPath].caption;
			}
			return {
				"bindTo": columnPath,
				"caption": caption,
				"captionConfig": {
					"visible": true
				}
			};
		},

		/**
		 * Формирует объект настройки списка в профиле, если его нет для конкретной связки полей.
		 * @protected
		 * @virtual
		 */
		prepareProfile: function() {
			var profile = this.get("Profile");
			this.set("GridSettingsChanged", true);
			profile = (profile && Terrasoft.deepClone(profile)) || {};
			var gridName = this.getDataGridName();
			if (profile[gridName]) {
				return;
			}
			var gridProfile = profile[gridName] = {
				"isTiled": false,
				"type": "listed",
				"key": this.getProfileKey()
			};
			var listedConfig = {};
			var listedConfigItems = (listedConfig.items = []);
			var entitySchemaName = this.drillDownProvider.getEntitySchemaName();
			var entitySchema = this.drillDownProvider.getEntitySchemaByName(entitySchemaName);
			listedConfigItems.push(this.getGridItemTemplateConfig(entitySchemaName, entitySchema.primaryDisplayColumnName));
			listedConfigItems.push(this.getGridItemTemplateConfig(entitySchemaName, this.drillDownProvider.getXAxisColumn()));
			var yAxisColumn = this.drillDownProvider.getYAxisColumn();
			if (yAxisColumn !== entitySchema.primaryColumnName) {
				listedConfigItems.push(this.getGridItemTemplateConfig(entitySchemaName, yAxisColumn));
			}
			var columnsCount = listedConfigItems.length;
			var columnWidth = 24 / columnsCount;
			Terrasoft.each(listedConfigItems, function(columnConfig, index) {
				Ext.apply(columnConfig, {
					"position": {
						"column": columnWidth * index,
						"colSpan": columnWidth,
						"row": 1
					}
				});
			}, this);
			gridProfile.listedConfig = Terrasoft.encode(listedConfig);
			var tiledConfig = {
				"grid": {
					"rows": 1,
					"columns": 24
				},
				"items": listedConfigItems
			};
			gridProfile.tiledConfig = Terrasoft.encode(tiledConfig);
			this.set("Profile", profile);
		},

		/**
		 * Переводит модуль в режим реестра.
		 * @protected
		 * @virtual
		 */
		showChartData: function() {
			this.drillDownProvider.pushHistory({
				displayMode: Terrasoft.DashboardEnums.ChartDisplayMode.GRID
			}, this);
			this.refresh();
		},

		/**
		 * @inheritDoc Terrasoft.configuration.mixins.GridUtilities#getGridDataESQ
		 * @overridden
		 */
		getGridDataESQ: function() {
			var entitySchemaName = this.drillDownProvider.getEntitySchemaName();
			var entitySchema = this.drillDownProvider.getEntitySchemaByName(entitySchemaName);
			return this.Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchema: entitySchema,
				rowViewModelClassName: this.getGridRowViewModelClassName()
			});
		},

		/**
		 * @inheritDoc Terrasoft.configuration.mixins.GridUtilities#initQueryFilters
		 * @overridden
		 */
		initQueryFilters: function(esq) {
			this.drillDownProvider.addFilters(esq);
		},

		/**
		 * @inheritDoc Terrasoft.configuration.mixins.GridUtilities#getGridDataColumns
		 * @overridden
		 */
		getGridDataColumns: function() {
			var defColumnsConfig = {};
			var entitySchemaName = this.drillDownProvider.getEntitySchemaName();
			var entitySchema = this.drillDownProvider.getEntitySchemaByName(entitySchemaName);
			if (entitySchema) {
				var primaryColumnName = entitySchema.primaryColumnName;
				var primaryDisplayColumnName = entitySchema.primaryDisplayColumnName;
				defColumnsConfig[primaryColumnName] = {
					path: primaryColumnName
				};
				if (primaryDisplayColumnName) {
					defColumnsConfig[primaryDisplayColumnName] = {
						path: primaryDisplayColumnName
					};
				}
			}
			return defColumnsConfig;
		},

		/**
		 * Добавляет подзапрос, который вычисляет количество активных точек входа по процессу
		 * @param esq
		 */
		addProcessEntryPointColumn: Terrasoft.emptyFn,

		/**
		 * Производит инициализацию параметров модели представления из параметров, переданных при генерации модуля.
		 * @protected
		 * @virtual
		 */
		initParameters: function() {
			Terrasoft.each(this.chartModulePropertiesTranslator, function(configName, viewModelName) {
				var value = this.get(configName);
				if (value) {
					this.set(viewModelName, value);
				}
			}, this);
		},

		/**
		 * Производит инициализацию параметра навигационной цепочки.
		 * @protected
		 * @virtual
		 */
		initBreadCrumbs: function() {
			var collection = this.Ext.create("Terrasoft.Collection");
			collection.on("dataLoaded", this.onBreadCrumbsChanged, this);
			collection.on("add", this.onBreadCrumbsChanged, this);
			collection.on("remove", this.onBreadCrumbsChanged, this);
			collection.on("clear", this.onBreadCrumbsChanged, this);
			this.set("BreadCrumbs", collection);
		},

		/**
		 * Обработчик события изменения коллекции навигационной цепочки.
		 * @protected
		 * @virtual
		 */
		onBreadCrumbsChanged: function() {
			this.set("isBreadCrumbsVisible", !this.get("BreadCrumbs").isEmpty());
		},

		/**
		 * Создает провайдер разворачивания графика.
		 * @protected
		 * @virtual
		 * param {Function} callback Функция обратного вызова.
		 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
		 */
		initDrillDownProvider: function(callback, scope) {
			Terrasoft.chain(
				function(next) {
					if (!this.get("EntitySchemaName") || !this.get("OrderByAxis")) {
						this.drillDownProvider = null;
						next();
					}
					var drillDownProviderLocalizableValues = {
						BooleanFieldTrueCaption: this.get("Resources.Strings.BooleanFieldTrueCaption"),
						BooleanFieldFalseCaption: this.get("Resources.Strings.BooleanFieldFalseCaption")
					};
					this.drillDownProvider = this.Ext.create("Terrasoft.ChartDrillDownProvider", {
						Ext: this.Ext,
						sandbox: this.sandbox,
						serializedFilterData: this.get("SerializedFilterData"),
						filterMessageTag: this.filterMessageTag,
						localizableValues: drillDownProviderLocalizableValues
					});
					this.drillDownProvider.pushHistory({
						entitySchemaName: this.get("EntitySchemaName"),
						sectionBindingColumn: this.get("sectionBindingColumn"),
						dateTimeFormat: this.get("DateTimeFormat") || "Year;Month",
						xAxisColumn: this.get("XAxisColumn"),
						orderBy: this.get("OrderByAxis"),
						orderDirection: this.get("OrderDirection"),
						func: this.get("Func"),
						seriesKind: this.get("SeriesKind"),
						yAxisColumn: this.get("YAxisColumn"),
						displayMode: this.get("displayMode"),
						seriesConfig: this.get("SeriesConfig"),
						yAxis: this.get("yAxis"),
						YAxisCaption: this.get("YAxisCaption"),
						yAxisConfig: this.get("YAxisConfig"),
						styleColor: this.get("styleColor")
					});
					this.drillDownProvider.on("historyChanged", this.historyChanged, this);
					this.drillDownProvider.getEntitySchema(this.get("EntitySchemaName"), function() {
						next();
					}, this);
				},
				function() {
					if (this.drillDownProvider && Ext.isEmpty(this.drillDownProvider.queryDataLimit)) {
						Terrasoft.SysSettings.querySysSettingsItem(this.queryDataLimitSysSettingCode,
							function(value) {
								this.drillDownProvider.queryDataLimit = value ? value : -1;
								callback.call(scope);
							}, this);
					} else {
						callback.call(scope);
					}
				},
				this
			);
		},

		/**
		 * Обновляет параметры, зависящие от состояния истории.
		 * @protected
		 * @virtual
		 */
		historyChanged: function() {
			this.set("isDrilledDown", this.drillDownProvider && this.drillDownProvider.isDrilledDown());
			this.setBreadCrumbs();
		},

		/**
		 * Устанавливает параметр навигационной цепочки.
		 * @protected
		 * @virtual
		 */
		setBreadCrumbs: function() {
			if (!this.drillDownProvider) {
				return;
			}
			var drillDownCaptions = this.drillDownProvider.getDrillDownCaptions();
			if (drillDownCaptions.length > 0 || this.get("BreadCrumbs").getCount() > 0) {
				var breadCrumbs = new Terrasoft.Collection();
				Terrasoft.each(drillDownCaptions, function(item, index) {
					var columnCaption = item.caption + ":";
					var columnCaptionViewModel = this.getItemViewModel(columnCaption);
					breadCrumbs.add(columnCaptionViewModel);
					var separator = ",";
					if (drillDownCaptions.length === index + 1) {
						separator = "";
					}
					var columnValue = item.value + separator;
					var columnValueViewModel = this.getItemViewModel(columnValue);
					breadCrumbs.add(columnValueViewModel);
				}, this);
				var breadCrumbsParameter = this.get("BreadCrumbs");
				breadCrumbsParameter.clear();
				breadCrumbsParameter.loadAll(breadCrumbs);
			}
		},

		/**
		 * Возвращает модель представления элемента навигационной цепочки.
		 * @protected
		 * @virtual
		 * @param {String} caption Заголовок элемента навигационной цепочки.
		 * @return {Terrasoft.BaseViewModel} Возвращает модель представления элемента навигационной цепочки.
		 */
		getItemViewModel: function(caption) {
			var itemViewModel = this.Ext.create("Terrasoft.BaseViewModel", {
				values: {
					id: Terrasoft.generateGUID(),
					caption: caption
				}
			});
			itemViewModel.sandbox = this.sandbox;
			itemViewModel.Terrasoft = Terrasoft;
			itemViewModel.parrentViewModel = this;
			return itemViewModel;
		},

		/**
		 * Проверяет является ли переданный тип представления, типом представления графика.
		 * @param {Terrasoft.DashboardEnums.ChartDisplayMode} value Тип представления модуля графика.
		 * @returns {boolean} Возвращает true - если является, false в обратном случае.
		 */
		isChartDisplayMode: function(value) {
			return value === Terrasoft.DashboardEnums.ChartDisplayMode.CHART;
		},

		/**
		 * Проверяет является ли переданный тип представления, типом представления списка.
		 * @param {Terrasoft.DashboardEnums.ChartDisplayMode} value Тип представления модуля графика.
		 * @returns {boolean} Возвращает true - если является, false в обратном случае.
		 */
		isGridDisplayMode: function(value) {
			return value === Terrasoft.DashboardEnums.ChartDisplayMode.GRID;
		},

		/**
		 * Возвращает видимость кнопки "Настроить колонки".
		 * @param {Terrasoft.DashboardEnums.ChartDisplayMode} value Тип представления модуля графика.
		 * @returns {boolean} Возвращает true - если является, false в обратном случае.
		 */
		getOpenGridSettingsVisible: function(value) {
			return this.isGridDisplayMode(value);
		},

		/**
		 * Догружает данные в реестр с постраничной загрузкой данных.
		 * @protected
		 */
		loadMore: function() {
			this.loadGridData();
		},

		/**
		 * Возвращает коллекцию реестра.
		 * @return {Object} Возвращает коллекцию реестра.
		 */
		getGridData: function() {
			return this.get("GridData");
		},

		/**
		 * Возвращает ключ профиля.
		 * @return {String} Возвращает ключ профиля.
		 */
		getProfileKey: function() {
			return "Chart_" + this.drillDownProvider.getEntitySchemaName();
		},

		/**
		 * Запрашивает набор данных для графика в зависимости от текущей вложености.
		 * @protected
		 * @virtual
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
		 */
		getChartSeriesData: function(callback, scope) {
			if (!this.drillDownProvider) {
				if (callback) {
					callback.call(scope);
				}
				return;
			}
			this.drillDownProvider.getChartSeriesData(function(seriesData, yAxis) {
				/*
				// TODO: multiple series
				if (this.get("IsPercentageMode")) {
					seriesData = this.parseToPercentage(seriesData);
				}
				*/
				this.set("yAxis", yAxis);
				this.set("SeriesData", seriesData);
				this.checkQueryDataLimit(seriesData);
				if (callback) {
					callback.call(scope);
				}
			}, this);
		},

		/**
		 * Возвращает сообщение ограничения запроса данных графика.
		 * @protected
		 * @virtual
		 * @param {Object} seriesData Набор данных графика.
		 * @return {String} Сообщение ограничения запроса данных графика.
		 */
		getQueryDataLimitMessage: function(seriesData) {
			var seriesExcessQueryDataLimit = [];
			Terrasoft.each(seriesData, function(seriesDataItem) {
				if (seriesDataItem.excessQueryDataLimit) {
					seriesExcessQueryDataLimit.push("\"" + seriesDataItem.name + "\"");
				}
			}, this);
			var queryDataLimitMessageTpl = this.get("Resources.Strings.QueryDataLimitMessage");
			return Ext.String.format(queryDataLimitMessageTpl, seriesExcessQueryDataLimit.join(", "),
				this.drillDownProvider.queryDataLimit);
		},

		/**
		 * Выполняет проверку на превышение ограничения запроса данных графика.
		 * @protected
		 * @virtual
		 * @param {Object} seriesData Набор данных графика.
		 */
		checkQueryDataLimit: function(seriesData) {
			this.set("excessQueryDataLimit", false);
			if (this.drillDownProvider.checkQueryDataLimit()) {
				Terrasoft.each(seriesData, function(seriesDataItem) {
					if (seriesDataItem.excessQueryDataLimit) {
						this.set("excessQueryDataLimit", true);
						return false;
					}
				}, this);
			}
		},

		/**
		 * Возвращает пункт меню для drilldown-а.
		 * @protected
		 * @virtual
		 * param {Object} currentPoint Выбранный элемент.
		 * @returns {String} Пункт меню для drilldown-а.
		 */
		getDrillDownMenuCaption: function(currentPoint) {
			var drillDownCaption = this.get("Resources.Strings.DrillDownCaption");
			return Ext.String.format("{0} '{1}'", drillDownCaption, (currentPoint && currentPoint.name));
		},

		/**
		 * Инициализирует начальные значения модели.
		 * @protected
		 * @virtual
		 * @param {Function} callback Функция, которая будет вызвана по завершению.
		 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
		 */
		init: function(callback, scope) {
			this.initParameters();
			this.initBreadCrumbs();
			this.subscribeMessages();
			this.set("displayMode", Terrasoft.DashboardEnums.ChartDisplayMode.CHART);
			this.set("excessQueryDataLimit", false);
			this.set("GridSettingsChanged", true);
			this.initGridData();
			this.mixins.GridUtilities.init.call(this);
			this.initDrillDownProvider(function() {
				if (!this.drillDownProvider) {
					callback.call(scope);
					return;
				}
				this.initEntitySchema();
				this.initProfile(function() {
					this.getChartSeriesData(callback, scope);
				}, this);
			}, this);
		},

		/**
		 * Выполняет инициализацию значений по умолчанию для работы со списком.
		 * @protected
		 * @virtual
		 */
		initGridData: function() {
			var gridData = this.Ext.create("Terrasoft.BaseViewModelCollection");
			this.set("GridData", gridData);
			this.set("ActiveRow", "");
			if (Ext.isEmpty(this.get("IsPageable"))) {
				this.set("IsPageable", true);
			}
			this.set("IsClearGridData", false);
			if (!Ext.isNumber(this.get("RowCount"))) {
				this.set("RowCount", 5);
			}
		},

		/**
		 * Выполняет инициализацию схемы объекта.
		 * @protected
		 * @virtual
		 */
		initEntitySchema: function() {
			var entitySchema = this.entitySchema;
			var entitySchemaName = this.get("EntitySchemaName");
			if (entitySchema.name !== entitySchemaName) {
				this.entitySchema = this.drillDownProvider.getEntitySchemaByName(entitySchemaName);
				this.entitySchemaName = entitySchemaName;
			}
		},

		/**
		 * Возвращает колличество загружаемых строк для данного представления реестра.
		 * @overridden
		 * @return {Number} Количество загружаемых строк реестра для данного представления.
		 */
		getRowCount: function() {
			return this.get("RowCount");
		},

		/**
		 * Подписывается на сообщения родительского модуля.
		 * @protected
		 * @virtual
		 */
		subscribeMessages: function() {
			var sandbox = this.sandbox;
			sandbox.subscribe("GenerateChart", function(args) {
				if (args.hasOwnProperty("schemaName")) {
					this.createChartByConfig(args);
					this.initDrillDownProvider(function() {
						if (!this.drillDownProvider) {
							return;
						}
						this.initProfile(function() {
							this.refresh();
						}, this);
					}, this);
				}
			}, this, [sandbox.id]);
		},

		/**
		 * Открывает модуль настройки колонок реестра.
		 * @protected
		 */
		openGridSettings: function() {
			var gridSettingsId = this.sandbox.id + "_GridSettingsV2";
			var entitySchemaName = this.drillDownProvider.getEntitySchemaName();
			var profileKey = this.getProfileKey();
			var propertyName = this.getDataGridName();
			this.sandbox.subscribe("GetGridSettingsInfo", function() {
				var gridSettingsInfo = {};
				gridSettingsInfo.entitySchemaName = entitySchemaName;
				gridSettingsInfo.profileKey = profileKey;
				gridSettingsInfo.propertyName = propertyName;
				return gridSettingsInfo;
			}, [gridSettingsId]);
			var params = this.sandbox.publish("GetHistoryState");
			this.sandbox.publish("PushHistoryState", {hash: params.hash.historyState, silent: true});
			this.sandbox.loadModule("GridSettingsV2", {
				renderTo: "centerPanel",
				id: gridSettingsId,
				keepAlive: true
			});
			this.sandbox.subscribe("GridSettingsChanged", function(args) {
				var gridData = this.getGridData();
				gridData.clear();
				if (args && args.newProfileData) {
					this.setColumnsProfile(args.newProfileData, true);
				}
				this.set("GridSettingsChanged", true);
				this.initSortActionItems();
			}, this, [gridSettingsId]);
		},

		/**
		 * Выполняет инициализацию профиля.
		 * param {Function} callback Функция обратного вызова.
		 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
		 */
		initProfile: function(callback, scope) {
			var profileKey = this.getProfileKey();
			Terrasoft.require([this.profilePrefix + profileKey], function(profile) {
				this.set("Profile", profile);
				callback.call(scope);
			}, this);
		},

		/**
		 * Генерирует имя текущего списка в профиле.
		 * @protected
		 * @virtual
		 * @return {string} Возвращает имя текущего списка в профиле.
		 */
		getDataGridName: function() {
			var entitySchemaName = this.drillDownProvider.getEntitySchemaName();
			var xAxisColumn = this.drillDownProvider.getXAxisColumn();
			var yAxisColumn = this.drillDownProvider.getYAxisColumn();
			var dataGridName = Ext.String.format("{0}_{1}_{2}", entitySchemaName, xAxisColumn, yAxisColumn);
			return dataGridName;
		},

		/**
		 * Возвращает реестр графика.
		 * @protected
		 * @virtual
		 * @return {Component}
		 */
		getCurrentGrid: function() {
			var gridName = "Chart_" + this.sandbox.id + "_DataGrid";
			return this.Ext.getCmp(gridName + "Grid");
		},

		/**
		 * Обновляет размер графика.
		 * @protected
		 * @virtual
		 */
		updateChartSize: function() {
			var chartName = "Chart_" + this.sandbox.id;
			var chart = this.Ext.getCmp(chartName);
			if (chart) {
				chart.updateSize();
			}
		},

		/**
		 * Заполняет меню сортировки.
		 * @protected
		 * @virtual
		 */
		initSortActionItems: function() {
			var collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
			var gridColumns = this.mixins.GridUtilities.getProfileColumns.call(this);
			Terrasoft.each(gridColumns, function(column, columnName) {
				collection.add(columnName, this.Ext.create("Terrasoft.BaseViewModel", {
					values: {
						Caption: {bindTo: this.name + columnName + "_SortedColumnCaption"},
						Tag: columnName,
						Click: {bindTo: "sortGrid"}
					}
				}));
			}, this);
			this.updateSortColumnsCaptions(this.get("Profile"));
			var sortColumns = this.get("SortColumns");
			if (sortColumns) {
				sortColumns.clear();
				sortColumns.loadAll(collection);
			} else {
				this.set("SortColumns", collection);
			}
		},

		/**
		 * Экспортирует содержимое реестра в файл
		 * @protected
		 */
		exportToFile: function() {
			if (!this.drillDownProvider) {
				return;
			}
			var filterContainer = {
				filters: this.Ext.create("Terrasoft.FilterGroup")
			};
			this.drillDownProvider.addFilters(filterContainer);
			var visibleColumns = this.Ext.create("Terrasoft.Collection");
			var profileColumns = this.getProfileColumns();
			this.Terrasoft.each(profileColumns, function(column) {
				visibleColumns.add(column);
			});
			DataUtilities.exportToCsvFile(
				this.drillDownProvider.getEntitySchemaName(),
				filterContainer.filters,
				visibleColumns
			);
		},

		/**
		 * Проверяет пустое ли переданное значение.
		 * @param {*} value Передаваемое значение.
		 * @return {boolean} Возвращает true если значение пустое, false в обратном случае.
		 */
		isEmptyConverter: function(value) {
			return !value;
		},

		/**
		 * Метод для подписки по умалчанию для afterrender и afterrerender.
		 */
		loadModule: this.Terrasoft.emptyFn,

		/**
		 * Загружает график без ограничения запроса данных графика.
		 * @protected
		 * @virtual
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст выполнения функции обратного вызова.
		 */
		loadChartWithoutQueryDataLimit: function(callback, scope) {
			this.drillDownProvider.ignoreQueryDataLimit = true;
			this.refresh(function() {
				this.drillDownProvider.ignoreQueryDataLimit = false;
				callback.call(scope);
			}, this);
		},

		/**
		 * Обрабатывает нажатие кнопки оповищения ограничения запроса данных графика.
		 * @protected
		 * @virtual
		 */
		onQueryDataLimitWarningButtonClick: function() {
			var seriesData = this.get("SeriesData");
			Terrasoft.utils.showMessage({
				caption: this.getQueryDataLimitMessage(seriesData),
				handler: function(code) {
					if (code === "yes") {
						this.loadChartWithoutQueryDataLimit(Terrasoft.emptyFn, this);
					}
				},
				buttons: ["yes", "no"],
				defaultButton: 0,
				scope: this
			});
		}

	});

	/**
	 * @class Terrasoft.configuration.ChartViewConfig
	 * Класс генерирующий конфигурацию представления модуля графика.
	 */
	Ext.define("Terrasoft.configuration.ChartViewConfig", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.ChartViewConfig",

		/**
		 * Возвращает массив объектов элементов меню типов графиков.
		 * @private
		 * @param {Object} separatorCaption Объект, настроек для заголовка.
		 * @param {Function} clickHandler Функция обработки нажатия.
		 * @return {Object} result Возвращает массив объектов элементов меню типов графиков.
		 */
		getChartTypeMenuItems: function(separatorCaption, clickHandler) {
			var result = [];
			var separatorConfig = {
				"className": "Terrasoft.MenuSeparator",
				"caption": separatorCaption,
				"visible": {
					"bindTo": "displayMode",
					"bindConfig": {"converter": "isChartDisplayMode"}
				}
			};
			result.push(separatorConfig);
			Terrasoft.each(chartModuleHelper.ChartSeriesKind, function(seriesKind) {
				var chartTypeItem = {
					"imageConfig": seriesKind.imageConfig,
					"caption": seriesKind.displayValue,
					"tag": seriesKind.value,
					"visible": {
						"bindTo": "displayMode",
						"bindConfig": {"converter": "isChartDisplayMode"}
					},
					"click": clickHandler
				};
				result.push(chartTypeItem);
			});
			return result;
		},

		/**
		 * Возвращает массив операций для вставки элементов меню типов графиков в основное меню графика.
		 * @private
		 * @param {String} chartId Идентификатор элемента для которого нужно совершить вставку данных.
		 * @return {Object[]} operations Возвращает массив операций для вставки элементов меню типов графиков в
		 *  основное меню графика.
		 */
		getChartTypesMenuConfig:  function(chartId) {
			var operationTpl = {
				operation: "insert",
				name: "",
				parentName: chartId + "-settings-button",
				propertyName: "menu",
				values: {}
			};
			var operations = [];
			var chartTypeMenuItems = this.getChartTypeMenuItems(
				{"bindTo": "Resources.Strings.ChartChangeTypeCaption"},
				{"bindTo": "changeChartType"}
			);
			Terrasoft.each(chartTypeMenuItems, function(chartTypeMenuItem) {
				var insertChartTypeOperation = Ext.apply(Terrasoft.deepClone(operationTpl), {
					values: chartTypeMenuItem
				});
				operations.push(insertChartTypeOperation);
			}, this);
			return operations;
		},

		/**
		 * Применяет изменения в меню выбора типов графиков в заголовке графика.
		 * @private
		 * @param {String} chartId Идентификатор графика.
		 * @param {Object[]} viewConfig Конфигурационный объект настроек меню.
		 * @return {Object[]} viewConfig Возвращает конфигурационный объект с примененными изменениями.
		 */
		applyChangeChartTypeMenuConfig: function(chartId, viewConfig) {
			var chartTypesMenuConfig = this.getChartTypesMenuConfig(chartId);
			viewConfig = Terrasoft.JsonApplier.applyDiff(viewConfig, chartTypesMenuConfig);
			return viewConfig;
		},

		/**
		 * Применяет изменения к элементам меню для выбора drillDown.
		 * @private
		 * @param {String} chartId Идентификатор графика.
		 * @param {Object[]} viewConfig Конфигурационный объект настроек меню.
		 * @return {Object[]} viewConfig Возвращает конфигурационный объект с примененными изменениями.
		 */
		applyDrillDownMenuConfig: function(chartId, viewConfig) {
			var chartTypeMenuItems = this.getChartTypeMenuItems(
					{"bindTo": "CurrentPoint",	"bindConfig": {"converter": "getDrillDownMenuCaption"}},
					{bindTo: "drillDownChart"}
			);
			var drillDownConfig = {
				"items": [{
					"caption": {"bindTo": "Resources.Strings.ShowDataCaption"},
					"markerValue": "ShowDataButton",
					"click": {"bindTo": "showDrillDownData"}
				}]
			};
			Ext.Array.insert(drillDownConfig.items, drillDownConfig.items.length, chartTypeMenuItems);
			var drillDownMenuUpdateOperation = [{
				operation: "merge",
				name: chartId + "-drilldownMenu",
				values: {
					drilldownMenu: drillDownConfig
				}
			}];
			viewConfig = Terrasoft.JsonApplier.applyDiff(viewConfig, drillDownMenuUpdateOperation);
			return viewConfig;
		},

		/**
		 * Генерирует конфигурацию представления графика.
		 * @param {Object} config Конфигурационный объект модуля.
		 * @return {Object[]} Возвращает конфигурацию представления графика.
		 */
		generate: function(config) {
			var chartId = "Chart_" + config.sandboxId;
			var viewConfig = [{
				"name": "chart-wrapper-" + chartId,
				"itemType": Terrasoft.ViewItemType.CONTAINER,
				"styles": {
					"display": "block",
					"float": "left",
					"width": "100%",
					"height": "100%",
					"background": "white"
				},
				"items": [{
					"name": "chart-header-wrapper-" + chartId,
					"wrapClass": ["default-widget-header", config.styleColor],
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": [{
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"name": chartId + "-query-data-limit-button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.QueryDataLimitImage"},
						"classes": {
							"wrapperClass": ["query-data-limit-button"],
							"imageClass": ["query-data-limit-button-image"]
						},
						"markerValue": "QueryDataLimitButton",
						"visible": {"bindTo": "excessQueryDataLimit"},
						"click": {"bindTo": "onQueryDataLimitWarningButtonClick"}
					}, {
						"name": "caption-" + chartId,
						"labelConfig": {
							"classes": ["default-widget-header-label"],
							"labelClass": ""
						},
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {"bindTo": "Caption"}
					}, {
						"name": chartId + "-tools",
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["highchart-tools"],
						"items": [{
							"name": chartId + "_drill-home-button",
							"itemType": Terrasoft.ViewItemType.BUTTON,
							"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"imageConfig": {"bindTo": "Resources.Images.DrillHome"},
							"markerValue": "DrillHomeButton",
							"click": {"bindTo": "cancelDrill"},
							"visible": false
						}, {
							"name": chartId + "_drill-up-button",
							"itemType": Terrasoft.ViewItemType.BUTTON,
							"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"imageConfig": {"bindTo": "Resources.Images.DrillUp"},
							"markerValue": "DrillUpButton",
							"click": {"bindTo": "drillUp"},
							"visible": {"bindTo": "isDrilledDown"}
						}, {
							"name": chartId + "-settings-button",
							"itemType": Terrasoft.ViewItemType.BUTTON,
							"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"imageConfig": {"bindTo": "Resources.Images.Settings"},
							"markerValue": "SettingsButton",
							"menu": [{
								"name": "ViewSortMenu",
								"caption": {"bindTo": "Resources.Strings.SortMenuCaption"},
								"visible": {
									"bindTo": "displayMode",
									"bindConfig": {"converter": "isGridDisplayMode"}
								},
								"controlConfig": {
									"menu": {
										"items": {"bindTo": "SortColumns"}
									}
								}
							}, {
								"name": "exportToFile",
								"caption": {"bindTo": "Resources.Strings.ExportListToFileButtonCaption"},
								"click": {"bindTo": "exportToFile"},
								"visible": {
									"bindTo": "displayMode",
									"bindConfig": {"converter": "isGridDisplayMode"}
								}
							}, {
								"caption": {"bindTo": "Resources.Strings.SetupGridMenuCaption"},
								"visible": {
									"bindTo": "displayMode",
									"bindConfig": {"converter": "getOpenGridSettingsVisible"}
								},
								"name": "OpenGridSettings",
								"click": {"bindTo": "openGridSettings"}
							}, {
								"name": "menuSeparator",
								"itemType": Terrasoft.ViewItemType.MENU_SEPARATOR
							}, {
								"caption": {"bindTo": "Resources.Strings.ShowDataCaption"},
								"markerValue": "ShowDataButton",
								"click": {"bindTo": "showChartData"},
								"visible": {
									"bindTo": "displayMode",
									"bindConfig": {"converter": "isChartDisplayMode"}
								}
							}, {
								"caption": {"bindTo": "Resources.Strings.ShowChartCaption"},
								"markerValue": "ShowChartButton",
								"click": {"bindTo": "drillUp"},
								"visible": {
									"bindTo": "displayMode",
									"bindConfig": {"converter": "isGridDisplayMode"}
								}
							}]
						}]
					}]
				}, {
					"className": "Terrasoft.ContainerList",
					"itemType": Terrasoft.ViewItemType.MODULE,
					"id": "breadcrumbs-module-container" + chartId,
					"idProperty": "id",
					"selectors": {wrapEl: "#breadcrumbs-module-container" + chartId},
					"classes": {
						wrapClassName: ["breadcrumbs-module-container"]
					},
					"isAsync": false,
					"collection": {
						"bindTo": "BreadCrumbs"
					},
					"visible": {
						"bindTo": "isBreadCrumbsVisible"
					},
					"defaultItemConfig": {
						"className": "Terrasoft.Container",
						id: "chart-breadcrumbs-wrapper-" + chartId,
						items: [
							{
								className: "Terrasoft.Label",
								caption: {
									bindTo: "caption"
								}
							}
						]
					}
				}, {
					"name": chartId + "-drilldownMenu",
					"itemType": Terrasoft.ViewItemType.MODULE,
					"className": "Terrasoft.Chart",
					"type": {"bindTo": "SeriesKind"},
					"xAxisCaption": {"bindTo": "XAxisCaption"},
					"yAxisCaption": {"bindTo": "YAxisCaption"},
					"currentPoint": {"bindTo": "CurrentPoint"},
					"drilldownMenu": {},
					"styleColor": {
						"bindTo": "styleColor",
						"bindConfig": {"converter": "styleColorConverter"}
					},
					"series": {"bindTo": "SeriesData"},
					"yAxis": {"bindTo": "yAxis"},
					"categories": {"bindTo": "getCategories"},
					"visible": {
						"bindTo": "displayMode",
						"bindConfig": {"converter": "isChartDisplayMode"}
					}
				}, {
					"name": "grid-wrapper-" + chartId,
					"wrapClass": ["chart-grid-wrapper"],
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"visible": {
						"bindTo": "displayMode",
						"bindConfig": {"converter": "isGridDisplayMode"}
					},
					"items": [{
						"name": chartId + "_DataGrid",
						"type": {"bindTo": "GridType"},
						"itemType": Terrasoft.ViewItemType.GRID,
						"activeRow": {"bindTo": "ActiveRow"},
						"collection": {"bindTo": "GridData"},
						"isEmpty": {"bindTo": "IsGridEmpty"},
						"isLoading": {"bindTo": "IsGridLoading"},
						"multiSelect": false,
						"primaryColumnName": "Id",
						"sortColumn": {"bindTo": "sortColumn"},
						"sortColumnDirection": {"bindTo": "GridSortDirection"},
						"sortColumnIndex": {"bindTo": "SortColumnIndex"},
						"linkClick": {"bindTo": "linkClicked"},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": {
								"columns": 24,
								"rows": 1
							},
							"items": [{
								"name": chartId +  "xAxisGridColumn",
								"bindTo": "xAxis",
								"position": {
									"row": 1,
									"column": 1,
									"colSpan": 12
								},
								"type": Terrasoft.GridCellType.TITLE
							}, {
								"name": chartId +  "yAxisGridColumn",
								"bindTo": "yAxis",
								"position": {
									"row": 1,
									"column": 12,
									"colSpan": 12
								}
							}]
						},
						"listedConfig": {
							"name": "DataGridListedConfig",
							"items": [{
								caption: "xAxis",
								"name": chartId +  "CaptionGridColumn",
								"bindTo": "xAxis",
								"position": {
									"column": 1,
									"colSpan": 12
								},
								"type": Terrasoft.GridCellType.TITLE
							}, {
								caption: "yAxis",
								"name": chartId +  "yAxisGridColumn",
								"bindTo": "yAxis",
								"position": {
									"column": 12,
									"colSpan": 12
								}
							}]
						}
					}, {
						"name": chartId + "_loadMore",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.LoadMoreButtonCaption"},
						"click": {"bindTo": "loadMore"},
						"controlConfig": {
							"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"imageConfig":  {"bindTo": "Resources.Images.LoadMoreIcon"}
						},
						"classes": {"wrapperClass": ["load-more-button-class"]},
						"visible": {"bindTo": "CanLoadMoreData"}
					}]
				}]
			}];
			viewConfig = this.applyChangeChartTypeMenuConfig(chartId, viewConfig);
			viewConfig = this.applyDrillDownMenuConfig(chartId, viewConfig);
			return viewConfig;
		}

	});

	/**
	 * @class Terrasoft.configuration.ChartModule
	 * Класс модуля графика.
	 */
	Ext.define("Terrasoft.configuration.ChartModule", {
		alternateClassName: "Terrasoft.ChartModule",
		extend: "Terrasoft.BaseNestedModule",

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
		 * Имя класса модели представления для вложенного модуля.
		 * @type {String}
		 */
		viewModelClassName: "Terrasoft.ChartViewModel",

		/**
		 * Имя класа генератога конфигурации представления вложенного модуля.
		 * @type {String}
		 */
		viewConfigClassName: "Terrasoft.ChartViewConfig",

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
		 * @param {Object} config Объект конфигурации.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
		 * @return {Object[]} Возвращает конфигурацию представления вложенного модуля.
		 */
		buildView: function(config, callback, scope) {
			var viewGenerator = this.createViewGenerator();
			var viewClass = this.Ext.create(this.viewConfigClassName);
			var schema = {
				viewConfig: viewClass.generate(config)
			};
			var viewConfig = Ext.apply({
				schema: schema
			}, config);
			viewConfig.schemaName = "";
			viewGenerator.generate(viewConfig, callback, scope);
		},

		/**
		 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewConfig
		 * @overridden
		 */
		initViewConfig: function(callback, scope) {
			var generatorConfig = Terrasoft.deepClone(this.moduleConfig) || {};
			generatorConfig.viewModelClass = this.viewModelClass;
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
			this.viewModelClass = this.Ext.ClassManager.get(this.viewModelClassName);
			callback.call(scope);
		},

		/**
		 * @inheritDoc Terrasoft.configuration.BaseNestedModule#getViewModelConfig
		 * @overridden
		 */
		getViewModelConfig: function() {
			var config = this.callParent(arguments);
			config.values = Ext.apply({}, this.moduleConfig);
			return config;
		},

		/**
		 * @inheritDoc Terrasoft.configuration.BaseNestedModule#init
		 * @overridden
		 */
		init: function() {
			if (!this.viewModel) {
				this.subscribeMessages();
				this.initConfig();
			}
			this.callParent(arguments);
		},

		/**
		 * Инициализирует объект конфигурации модуля.
		 * @protected
		 * @virtual
		 */
		initConfig: function() {
			var sandbox = this.sandbox;
			this.moduleConfig = sandbox.publish("GetChartConfig", sandbox.id, [sandbox.id]) || {};
			var chartParameters = sandbox.publish("GetChartParameters", sandbox.id, [sandbox.id]);
			Ext.apply(this.moduleConfig, chartParameters);
			Ext.apply(this.moduleConfig, {
				sandboxId: sandbox.id
			});
		},

		/**
		 * Подписывается на сообщения родительского модуля.
		 * @protected
		 * @virtual
		 */
		subscribeMessages: function() {
			var sandbox = this.sandbox;
			var sectionFiltersModuleId = sandbox.publish("GetSectionFilterModuleId");
			sandbox.subscribe("UpdateFilter", function() {
				var viewModel = this.viewModel;
				if (!Ext.isEmpty(this.moduleConfig.sectionId) &&
					!Ext.isEmpty(this.moduleConfig.sectionBindingColumn) &&
					viewModel) {
					viewModel.refresh();
				}
			}, this, [sectionFiltersModuleId]);
		}
	});

	return Terrasoft.ChartModule;

});
