define("ChartDesigner", ["terrasoft", "ChartDesignerResources", "ChartModuleHelper"],
function(Terrasoft, resources, ChartModuleHelper) {
	var localizableStrings = resources.localizableStrings;
	return {
		messages: {

			/**
			 * Публикация сообщения переотрисовки модуля графиков.
			 */
			"RerenderModule": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Подписка на сообщение подготовки параметров для модуля графика.
			 */
			"GetChartConfig": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * Публикация сообщения для получения параметров инициализации модуля дизайнера графиков.
			 */
			"GetModuleConfig": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Публикация сообщения для отдачи параметров настройки модуля дизайнера графиков.
			 */
			"PostModuleConfig": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Публикация сообщения для генерации графика.
			 */
			"GenerateChart": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Публикация сообщения изменения заголовка модуля графика.
			 */
			"ChangeHeaderCaption": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Публикация сообщения для возвращения предидущего состояния.
			 */
			"BackHistoryState": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Подписка на сообщение получения названия схемы.
			 */
			"GetSectionSchemaName": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * Подписка на сообщение StructureExplorer.
			 */
			"StructureExplorerInfo": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * Подписка на сообщение выбора колонки в StructureExplorer.
			 */
			"ColumnSelected": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * Подписка на получение конфигурациооного объекта модуля фильтров.
			 */
			"GetFilterModuleConfig": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * Публикация сообщения устновки модуля фильтров.
			 */
			"SetFilterModuleConfig": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			}

		},
		attributes: {
			/**
			 * Заголовок графика.
			 */
			caption: {
				value: localizableStrings.NewChartCaption
			},
			/**
			 * Данные серий.
			 */
			SeriesConfig: {
				dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},
			/**
			 * Признак режима процентов.
			 */
			IsPercentageMode: {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: false
			},
			/**
			 * Поле сортировки.
			 */
			OrderBy: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: {
					value: Terrasoft.DashboardEnums.ChartOrderBy.GROUP_BY_FIELD,
					displayValue: localizableStrings.OrderByGroupByField
				}
			},
			/**
			 * Направление сортировки.
			 */
			OrderDirection: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: {
					value: "Ascending",
					displayValue: localizableStrings.OrderDirectionASC
				}
			},
			/**
			 * Тип графика.
			 */
			ChartType: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: true,
				value: ChartModuleHelper.ChartSeriesKind.line
			},
			/**
			 * Название колонки по Х.
			 */
			XAxisColumn: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: true,
				isLookup: true,
				entityStructureConfig: {
					useBackwards: true,
					summaryColumnsOnly: false,
					schemaColumnName: "entitySchemaName"
				}
			},
			/**
			 * Признак видимости колонки по У.
			 */
			YAxisColumnVisible: {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},
			/**
			 * Текст подписи оси Х.
			 */
			XAxisCaption: {
				dataValueType: Terrasoft.DataValueType.TEXT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				dependencies: [
					{
						columns: ["ChartType"],
						methodName: "onChartTypeChange"
					}
				]
			},
			/**
			 * Текст подписи оси У.
			 */
			YAxisCaption: {
				dataValueType: Terrasoft.DataValueType.TEXT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},
			/**
			 * Формат даты.
			 */
			DateTimeFormat: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},
			/**
			 * Стиль графика.
			 */
			StyleColor: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: true,
				value: Terrasoft.DashboardEnums.WidgetColor["widget-green"]
			},
			/**
			 * Коллекция серий.
			 */
			SeriesCollection: {
				dataValueType: Terrasoft.DataValueType.COLLECTION,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: false
			},
			/**
			 * Название вкладки активной серии.
			 */
			ActiveSeriesName: {
				dataValueType: Terrasoft.DataValueType.TEXT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: false
			},
			/**
			 * Минимальное отображаемое значение подписи оси У.
			 */
			YAxisMinValue: {
				dataValueType: Terrasoft.DataValueType.INTEGER,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: false
			},
			/**
			 * Максимальное отображаемое значение подписи оси У.
			 */
			YAxisMaxValue: {
				dataValueType: Terrasoft.DataValueType.INTEGER,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: false
			},
			/**
			 * Положение подписи оси У .
			 */
			YAxisPosition: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: {
					value: Terrasoft.DashboardEnums.ChartAxisPosition.NONE,
					displayValue: localizableStrings.ChartAxisPositionNone
				}
			}
		},
		methods: {

			/**
			 * Объект соотношения свойств модели графика к объекту настроек графика.
			 * @private
			 * @type {Object}
			 */
			chartProperties: {
				"OrderBy": "orderBy",
				"OrderDirection": "orderDirection",
				"DateTimeFormat": "dateTimeFormat",
				"caption": "caption",
				"sectionId": "sectionId"
			},

			/**
			 * Объект соотношения свойств модели серии графика к объекту настроек графика
			 * @private
			 * @type {Object}
			 */
			seriesProperties: {
				"entitySchemaName": "schemaName",
				"sectionBindingColumn": "sectionBindingColumn",
				"aggregationType": "func",
				"IsPercentageMode": "isPercentageMode",
				"ChartType": "type",
				"XAxisColumn": "xAxisColumn",
				"aggregationColumn": "yAxisColumn",
				"XAxisCaption": "XAxisCaption",
				"YAxisCaption": "YAxisCaption",
				"StyleColor": "styleColor",
				"filterData": "filterData",
				"YAxisMinValue": "min",
				"YAxisMaxValue": "max",
				"YAxisPosition": "position"
			},

			/**
			 * Массив названий свойств модели подписи оси У серии графика.
			 * @private
			 * @type {String[]}
			 */
			yAxisConfigProperties: ["YAxisMinValue", "YAxisMaxValue", "YAxisPosition"],

			/**
			 * Поле привязки заголовка вкладки.
			 * @private
			 * @type {String}
			 */
			tabCaptionProperty: "YAxisCaption",

			/**
			 * @inheritdoc Terrasoft.BaseWidgetDesigner#getWidgetModulePropertiesTranslator
			 * @protected
			 * @overridden
			 */
			getWidgetModulePropertiesTranslator: function() {
				var widgetModulePropertiesTranslator = Ext.apply({}, this.chartProperties);
				return Ext.apply(widgetModulePropertiesTranslator, this.seriesProperties);
			},

			/**
			 * Возвращает объект значений свойств серии по умолчанию.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект значений свойств серии по умолчанию..
			 */
			getDefaultSeriesPropertiesValues: function() {
				var result = {
					Name: Terrasoft.generateGUID(),
					Caption: this.getSeriesTabCaption()
				};
				for (var viewModelPropertyName in this.seriesProperties) {
					result[viewModelPropertyName] = this.columns[viewModelPropertyName].value;
				}
				return result;
			},

			/**
			 * Производит преобразование объекта настроек графика.
			 * @protected
			 * @virtual
			 * @param {Object} chartConfig Объекта настроек графика.
			 * @return {Object} Возвращает преобразованный объект настроек графика.
			 */
			convertChartConfig: function(chartConfig) {
				var config = {
					caption: chartConfig.caption,
					orderBy: chartConfig.orderBy,
					orderDirection: chartConfig.orderDirection,
					dateTimeFormat: chartConfig.dateTimeFormat,
					seriesConfig: [{
						primaryColumnName: chartConfig.primaryColumnName,
						filterData: chartConfig.filterData,
						func: chartConfig.func,
						schemaName: chartConfig.schemaName,
						type: chartConfig.type,
						xAxisColumn: chartConfig.xAxisColumn,
						XAxisCaption: chartConfig.XAxisCaption,
						yAxisColumn: chartConfig.yAxisColumn,
						YAxisCaption: chartConfig.YAxisCaption,
						styleColor: chartConfig.styleColor,
						yAxisConfig: chartConfig.yAxisConfig,
						sectionBindingColumn: chartConfig.sectionBindingColumn,
						sectionId: chartConfig.sectionId
					}],
					isNew: !chartConfig.hasOwnProperty("func")
				};
				Terrasoft.each(chartConfig.seriesConfig, function(seriesConfigItem) {
					config.seriesConfig.push({
						primaryColumnName: seriesConfigItem.primaryColumnName,
						filterData: seriesConfigItem.filterData,
						func: seriesConfigItem.func,
						schemaName: seriesConfigItem.schemaName,
						type: seriesConfigItem.type,
						xAxisColumn: seriesConfigItem.xAxisColumn,
						XAxisCaption: seriesConfigItem.XAxisCaption,
						yAxisColumn: seriesConfigItem.yAxisColumn,
						YAxisCaption: seriesConfigItem.YAxisCaption,
						styleColor: seriesConfigItem.styleColor,
						yAxisConfig: seriesConfigItem.yAxisConfig,
						sectionBindingColumn: seriesConfigItem.sectionBindingColumn
					});
				}, this);
				return config;
			},

			/**
			 * Возвращает значение свойства.
			 * @private
			 * @param {Mixed} value Сложное значение.
			 * @return {Mixed} Возвращает значение свойства.
			 */
			getPropertyValue: function(value) {
				return Ext.isObject(value) ? (value.Name || value.value) : value;
			},

			/**
			 * Возвращает объект значений объекта настроек модели представления серии.
			 * @private
			 * @param {Terrasoft.BaseViewModel} seriesItemViewModel Объект модели представления серии.
			 * @return {Object} Возвращает объект значений объекта настроек модели представления серии.
			 */
			getSeriesConfigItem: function(seriesItemViewModel) {
				var seriesConfigItem = {
					primaryColumnName: "Id",
					yAxisConfig: {
						position: Terrasoft.DashboardEnums.ChartAxisPosition.NONE
					}
				};
				Terrasoft.each(this.seriesProperties, function(chartConfigPropertyName, seriesItemPropertyName) {
					var value = seriesItemViewModel.get(seriesItemPropertyName);
					if (Terrasoft.contains(this.yAxisConfigProperties, seriesItemPropertyName)) {
						if (!Ext.isEmpty(value)) {
							seriesConfigItem.yAxisConfig[chartConfigPropertyName] = this.getPropertyValue(value);
						}
					} else {
						seriesConfigItem[chartConfigPropertyName] = this.getPropertyValue(value);
					}
				}, this);
				return seriesConfigItem;
			},

			/**
			 * @inheritdoc Terrasoft.BaseWidgetDesigner#getWidgetConfig
			 * @protected
			 * @overridden
			 */
			getWidgetConfig: function() {
				var chartConfig = {
					seriesConfig: []
				};
				Terrasoft.each(this.chartProperties, function(chartConfigPropetyName, viewModelPropertyName) {
					var value = this.get(viewModelPropertyName);
					chartConfig[chartConfigPropetyName] = this.getPropertyValue(value);
				}, this);
				var seriesCollection = this.get("SeriesCollection");
				seriesCollection.each(function(seriesItemViewModel, seriesItemViewModelIndex) {
					var seriesConfigItem = this.getSeriesConfigItem(seriesItemViewModel);
					if (seriesItemViewModelIndex === 0) {
						Ext.apply(chartConfig, seriesConfigItem);
					} else {
						chartConfig.seriesConfig.push(seriesConfigItem);
					}
				}, this);
				return chartConfig;
			},

			/**
			 * Выполняет загрузку entity схем серий.
			 * @protected
			 * @virtual
			 * @param {Object} seriesConfig Объект настройки серии.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст выполнения функции обратного вызова.
			 */
			loadSeriesEntitySchema: function(seriesConfig, callback, scope) {
				var entitySchemaNames = [];
				Terrasoft.each(seriesConfig, function(seriesConfigItem) {
					this.Ext.Array.include(entitySchemaNames, seriesConfigItem.schemaName);
				}, this);
				Terrasoft.require(entitySchemaNames, callback, scope);
			},

			/**
			 * Возвращает ключ колонки схемы.
			 * @private
			 * @param {String} schemaName Название entity схемы.
			 * @param {String} columnPath Путь колонки.
			 * @return {String} Возвращает ключ колонки схемы.
			 */
			getColumnKey: function(schemaName, columnPath) {
				return Ext.String.format("{0}_{1}", schemaName, columnPath);
			},

			/**
			 * Возвращает объект параметра функции запроса свойств колонки.
			 * @private
			 * @param {String} schemaName Название entity схемы.
			 * @param {String} columnPath Путь колонки.
			 * @return {Object} Возвращает объект параметра функции запроса свойств колонки.
			 */
			getColumnPathCaptionParameterConfig: function(schemaName, columnPath) {
				return {
					schemaName: schemaName,
					columnPath: columnPath,
					key: this.getColumnKey(schemaName, columnPath)
				};
			},

			/**
			 * Выполняет загрузку ифнормации о колонках entity схем серий.
			 * @protected
			 * @virtual
			 * @param {Object} seriesConfig Объект настройки серии.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст выполнения функции обратного вызова.
			 */
			loadSeriesColumnCaptions: function(seriesConfig, callback, scope) {
				var serviceParameters = [];
				Terrasoft.each(seriesConfig, function(seriesConfigItem) {
					var schemaName = seriesConfigItem.schemaName;
					var xAxisColumn = seriesConfigItem.xAxisColumn;
					serviceParameters.push(this.getColumnPathCaptionParameterConfig(schemaName, xAxisColumn));
					var yAxisColumn = seriesConfigItem.yAxisColumn;
					if (yAxisColumn) {
						serviceParameters.push(this.getColumnPathCaptionParameterConfig(schemaName, yAxisColumn));
					}
					var sectionBindingColumn = seriesConfigItem.sectionBindingColumn;
					if (sectionBindingColumn) {
						serviceParameters.push(this.getColumnPathCaptionParameterConfig(schemaName,
							sectionBindingColumn));
					}
				}, this);
				this.getColumnPathCaption(this.Ext.JSON.encode(serviceParameters), function(response) {
					response.forEach(function(columnInfo) {
						this.set(columnInfo.key, {
							dataValueType: columnInfo.dataValueType,
							displayValue: columnInfo.columnCaption,
							referenceSchemaName: columnInfo.referenceSchemaName
						});
					}, this);
					callback.call(scope);
				}, this);
			},

			/**
			 * Создает объект модели представления по объекту настроек серии.
			 * @protected
			 * @virtual
			 * @param {Object} propertyValues Объект настройки серии.
			 * @return {Terrasoft.BaseViewModel} Объект модели представления по объекту настроек серии.
			 */
			createSeriesViewModel: function(propertyValues) {
				var columns = {};
				for (var seriesProperty in this.seriesProperties) {
					columns[seriesProperty] = this.columns[seriesProperty] || {};
				}
				return this.Ext.create("Terrasoft.BaseViewModel", {
					columns: columns,
					values: propertyValues
				});
			},

			/**
			 * Возвращает объект значения колнки схемы серии.
			 * @private
			 * @param {String} entitySchemaName Название entity схемы.
			 * @param {String} columnPath Путь колонки.
			 * @return {Object} Возвращает объект значения колнки схемы серии.
			 */
			getSeriesColumnValue: function(entitySchemaName, columnPath) {
				var columnLookupValue;
				if (columnPath) {
					var columnKey = this.getColumnKey(entitySchemaName, columnPath);
					columnLookupValue = Ext.apply(this.get(columnKey), {
						value: columnPath
					});
				}
				return columnLookupValue;
			},

			/**
			 * Выполняет загрузку коллекции серий графика.
			 * @protected
			 * @virtual
			 */
			loadSeriesCollection: function() {
				var seriesCollection = this.get("SeriesCollection");
				seriesCollection.clear();
				var convertedChartConfig = this.get("ConvertedChartConfig");
				var activeSeriesName;
				Terrasoft.each(convertedChartConfig.seriesConfig, function(seriesConfigItem) {
					var seriesTabTplConfig = this.getDefaultSeriesPropertiesValues();
					var seriesName = seriesTabTplConfig.Name;
					if (!activeSeriesName) {
						activeSeriesName = seriesName;
					}
					if (!convertedChartConfig.isNew) {
						var seriesConfigItemYAxisConfig = seriesConfigItem.yAxisConfig || {};
						var aggregationTypes = this.getAggregationTypeDefaultConfig();
						var chartTypes = this.getChartTypeDefaultConfig();
						var styleColors = this.getStyleColorDefaultConfig();
						var yAxisPositions = this.getYAxisPositionDefaultConfig();
						var entitySchemaName = seriesConfigItem.schemaName;
						var entitySchemaNameLookupValue;
						if (entitySchemaName) {
							entitySchemaNameLookupValue = {
								value: entitySchemaName,
								Name: entitySchemaName,
								displayValue: Terrasoft[entitySchemaName].caption
							};
						}
						var xAxisColumn = seriesConfigItem.xAxisColumn;
						var xAxisColumnLookupValue = this.getSeriesColumnValue(entitySchemaName, xAxisColumn);
						var yAxisColumn = seriesConfigItem.yAxisColumn;
						var yAxisColumnLookupValue = this.getSeriesColumnValue(entitySchemaName, yAxisColumn);
						var sectionBindingColumn = seriesConfigItem.sectionBindingColumn;
						var sectionBindingColumnLookupValue = this.getSeriesColumnValue(entitySchemaName,
							sectionBindingColumn);
						var seriesTabViewModelConfig = {
							entitySchemaName: entitySchemaNameLookupValue,
							aggregationType: aggregationTypes[seriesConfigItem.func],
							IsPercentageMode: seriesConfigItem.isPercentageMode,
							ChartType: chartTypes[seriesConfigItem.type],
							XAxisColumn: xAxisColumnLookupValue,
							aggregationColumn: yAxisColumnLookupValue,
							sectionBindingColumn: sectionBindingColumnLookupValue,
							XAxisCaption: seriesConfigItem.XAxisCaption,
							YAxisCaption: seriesConfigItem.YAxisCaption,
							StyleColor: styleColors[seriesConfigItem.styleColor],
							filterData: seriesConfigItem.filterData,
							Name: seriesName,
							Caption: seriesConfigItem.YAxisCaption || this.getSeriesTabCaption(),
							YAxisMinValue: seriesConfigItemYAxisConfig.min,
							YAxisMaxValue: seriesConfigItemYAxisConfig.max,
							YAxisPosition: yAxisPositions[seriesConfigItemYAxisConfig.position]
						};
						seriesTabTplConfig = Ext.apply(seriesTabTplConfig, seriesTabViewModelConfig);
					}
					var seriesTab = this.createSeriesViewModel(seriesTabTplConfig);
					seriesCollection.add(seriesName, seriesTab);
				}, this);
				this.set("ActiveSeriesName", activeSeriesName);
			},

			/**
			 * Выполняет обновление свойств модели представления дизайнера графиков свойствами модели
			 * представления серии.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.BaseViewModel} seriesItem Модель представления серии
			 */
			updateViewModelBySeriesItem: function(seriesItem) {
				this.set("ActiveSeriesTabIsChanging", true);
				this.set("entitySchemaName", null);
				var dateTimeFormat = this.get("DateTimeFormat");
				for (var propertyName in this.seriesProperties) {
					this.set(propertyName, null);
					this.set(propertyName, seriesItem.get(propertyName));
				}
				this.set("DateTimeFormat", dateTimeFormat);
				this.set("ActiveSeriesTabIsChanging", false);
			},

			/**
			 * Выполняет инициализацию дизайнера графиков.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст выполнения функции обратного вызова.
			 */
			initChartDesigner: function(callback, scope) {
				var chartConfig = this.sandbox.publish("GetModuleConfig", null, [this.sandbox.id]);
				var convertedChartConfig = this.convertChartConfig(chartConfig);
				var seriesConfig = convertedChartConfig.seriesConfig;
				this.set("ConvertedChartConfig", this.convertChartConfig(chartConfig));
				Terrasoft.chain(
					function(next) {
						this.loadSeriesEntitySchema(seriesConfig, function() {
							next();
						}, this);
					},
					function() {
						this.loadSeriesColumnCaptions(seriesConfig, function() {
							callback.call(scope);
						}, this);
						this.loadSeriesCollection();
					},
					this
				);
			},

			/**
			 * @inheritdoc Terrasoft.BaseWidgetDesigner#init
			 * @protected
			 * @overridden
			 */
			init: function(callback, scope) {
				if (!this.get("callParentInit")) {
					this.initChartDesigner(function() {
						this.set("callParentInit", true);
						this.init(callback, scope);
					}, this);
				} else {
					this.callParent([function() {
						this.chartDesignerParentInitCallback(callback, scope);
					}, this]);
				}
			},

			/**
			 * Обрабатывает событие функции обратного вызова базового метода инициализации.
			 * @private
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст выполнения функции обратного вызова.
			 */
			chartDesignerParentInitCallback: function(callback, scope) {
				this.on("change:ActiveSeriesName", function() {
					this.set("moduleLoaded", true);
				}, this);
				this.on("change:XAxisColumn", this.onXAxisColumnChange, this);
				this.loadSeriesCollection();
				callback.call(scope);
			},

			/**
			 * Возвращает массив представлений не валидных серий.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.BaseViewModel[]} scope Контекст выполнения функции обратного вызова.
			 */
			getInvalidSeries: function() {
				var seriesCollection = this.get("SeriesCollection");
				var invalidSeriesCollection = seriesCollection.filterByFn(function(item) {
					return !item.validate();
				});
				return invalidSeriesCollection.getItems();
			},

			/**
			 * @inheritdoc Terrasoft.BaseWidgetDesigner#validate
			 * @protected
			 * @overridden
			 */
			validate: function() {
				var isValid = this.callParent(arguments);
				var invalidSeries = this.getInvalidSeries();
				return isValid && (invalidSeries.length === 0);
			},

			/**
			 * Обрабатывает событие изменение колнки x.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.BaseViewModel} viewModel Выбранная вкладка.
			 */
			onXAxisColumnChange: function(viewModel, changedColumn) {
				if (!this.get("ActiveSeriesTabIsChanging")) {
					var showWarning = false;
					if (changedColumn) {
						var activeSeriesName = this.get("ActiveSeriesName");
						var seriesCollection = this.get("SeriesCollection");
						var changedSeries = seriesCollection.get(activeSeriesName);
						var changedSeriesEntitySchema = changedSeries.get("entitySchemaName") || {};
						var changedSeriesEntitySchemaName = changedSeriesEntitySchema.Name;
						var changedColumnDataValueType = changedColumn.dataValueType;
						var changedColumnIsLookup = (changedColumn.dataValueType === Terrasoft.DataValueType.LOOKUP);
						seriesCollection.each(function(item) {
							if (activeSeriesName !== item.get("Name")) {
								var itemXAxisColumn = item.get("XAxisColumn") || {};
								var itemEntitySchema = item.get("entitySchemaName") || {};
								var itemEntitySchemaName = itemEntitySchema.Name;
								var itemXAxisColumnDataValueType = itemXAxisColumn.dataValueType;
								var diffTypes = changedColumnDataValueType !== itemXAxisColumnDataValueType;
								var dateTimeDataValueTypes =
									Terrasoft.isDateDataValueType(changedColumnDataValueType) &&
									Terrasoft.isDateDataValueType(itemXAxisColumnDataValueType);
								var sameSchema = (itemEntitySchemaName === changedSeriesEntitySchemaName);
								var diffReferenceSchema =
									itemXAxisColumn.referenceSchemaName !== changedColumn.referenceSchemaName;
								var changeColumnCondition = (diffTypes || diffReferenceSchema) &&
									!dateTimeDataValueTypes;
								if (sameSchema) {
									if (changeColumnCondition) {
										item.set("XAxisColumn", changedColumn, { silent: true });
									}
								} else {
									if (changeColumnCondition) {
										item.set("XAxisColumn", null, { silent: true });
										showWarning = true;
									} else if (changedColumnIsLookup) {
										if (diffReferenceSchema) {
											item.set("XAxisColumn", null, { silent: true });
											showWarning = true;
										}
									}
								}
							}
						});
					}
					if (showWarning) {
						var message = this.get("Resources.Strings.UpdatedXAxisColumns");
						Terrasoft.utils.showInformation(message, null, null, { buttons: ["ok"] });
					}
				}
				if (changedColumn && changedColumn.dataValueType &&
						!Terrasoft.isDateDataValueType(changedColumn.dataValueType)) {
					this.set("DateTimeFormat", null);
				}
			},

			/**
			 * Обрабатывает событие изменение вкладки.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.BaseViewModel} seriesItem Выбранная вкладка.
			 */
			onActiveSeriesChange: function(seriesItem) {
				this.set("moduleLoaded", false);
				this.updateViewModelBySeriesItem(seriesItem);
			},

			/**
			 * Проверяет доступность кнопки удаления серии.
			 * @protected
			 * @virtual
			 * @return {Boolean} Доступность кнопки удаления серии.
			 */
			getIsDeleteSeriesButtonEnabled: function() {
				var seriesCollection = this.get("SeriesCollection");
				return seriesCollection.getCount() > 1;
			},

			/**
			 * Функция добавления новой серии.
			 * @protected
			 * @virtual
			 */
			addSeries: function() {
				var seriesCollection = this.get("SeriesCollection");
				var newSeriesItemConfig = this.getDefaultSeriesPropertiesValues();
				var newSeriesItemName = newSeriesItemConfig.Name;
				var newSeriesViewModel = this.createSeriesViewModel(newSeriesItemConfig);
				seriesCollection.add(newSeriesItemName, newSeriesViewModel);
				this.set("ActiveSeriesName", newSeriesItemName);
				this.set("moduleLoaded", true);
			},

			/**
			 * Функция удаления активной серии.
			 * @protected
			 * @virtual
			 */
			deleteActiveSeries: function() {
				var activeSeriesName = this.get("ActiveSeriesName");
				var seriesCollection = this.get("SeriesCollection");
				seriesCollection.removeByKey(activeSeriesName);
				var firstItem = seriesCollection.getByIndex(0);
				this.set("ActiveSeriesName", firstItem.get("Name"));
				var orderByConfig = this.getOrderByDefaultConfig();
				this.set("OrderBy", orderByConfig[Terrasoft.DashboardEnums.ChartOrderBy.CHART_ENTITY_COLUMN + ":0"]);
				this.set("moduleLoaded", true);
			},

			/**
			 * Возвращает заголовок вкладки серии.
			 * @protected
			 * @virtual
			 * @return {String} Возвращает заголовок вкладки серии.
			 */
			getSeriesTabCaption: function() {
				var tabIndex = 1;
				var seriesTabCaptionTpl = this.get("Resources.Strings.SeriesTabCaption");
				var tabCaption = Ext.String.format(seriesTabCaptionTpl, tabIndex);
				var findTabCaptionFunction = function(item) {
					return item.get("Caption") === tabCaption;
				};
				var seriesCollection = this.get("SeriesCollection");
				var captionExists = seriesCollection.getCount() > 0;
				while (captionExists) {
					tabCaption = Ext.String.format(seriesTabCaptionTpl, tabIndex);
					var foundItemsCollection = seriesCollection.filterByFn(findTabCaptionFunction);
					captionExists = foundItemsCollection.getCount() > 0;
					tabIndex += 1;
				}
				return tabCaption;
			},

			/**
			 * @inheritdoc Terrasoft.BaseWidgetDesigner#onDataChange
			 * @protected
			 * @overridden
			 */
			onDataChange: function(viewModel) {
				if (!this.get("ActiveSeriesTabIsChanging")) {
					var activeSeriesName = this.get("ActiveSeriesName");
					if (activeSeriesName) {
						var seriesCollection = this.get("SeriesCollection");
						var activeSeries = seriesCollection.get(activeSeriesName);
						var changedValues = viewModel.changed;
						Terrasoft.each(changedValues, function(changedPropertyValue, changedPropertyName) {
							if (this.seriesProperties[changedPropertyName]) {
								activeSeries.set(changedPropertyName, changedPropertyValue);
								if (changedPropertyName === this.tabCaptionProperty) {
									activeSeries.set("Caption", changedPropertyValue ||
										this.getSeriesTabCaption());
								}
							}
						}, this);
					}
				}
				this.callParent(arguments);
			},

			/**
			 * @inheritdoc Terrasoft.BaseWidgetDesigner#getWidgetModuleName
			 * @protected
			 * @overridden
			 */
			getWidgetModuleName: function() {
				return "ChartModule";
			},

			/**
			 * @inheritdoc Terrasoft.BaseWidgetDesigner#getWidgetConfigMessage
			 * @protected
			 * @overridden
			 */
			getWidgetConfigMessage: function() {
				return "GetChartConfig";
			},

			/**
			 * @inheritdoc Terrasoft.BaseWidgetDesigner#getWidgetRefreshMessage
			 * @protected
			 * @overridden
			 */
			getWidgetRefreshMessage: function() {
				return "GenerateChart";
			},

			/**
			 * Возвращает объект типов графика.
			 * @private
			 * @return {Object} Возвращает объект типов графика.
			 */
			getChartTypeDefaultConfig: function() {
				var chartTypeDefaultConfig = {};
				Terrasoft.each(ChartModuleHelper.ChartSeriesKind, function(seriesKind) {
					chartTypeDefaultConfig[seriesKind.value] = {
						value: seriesKind.value,
						displayValue: seriesKind.displayValue,
						imageConfig: seriesKind.imageConfig
					};
				});
				return chartTypeDefaultConfig;
			},

			/**
			 * Наполняет коллекцию типов графиков.
			 * @protected
			 * @virtual
			 * @param {String} filter Строка фильтрации.
			 * @param {Terrasoft.Collection} list Список.
			 */
			prepareChartTypesList: function(filter, list) {
				if (list === null) {
					return;
				}
				list.clear();
				list.loadAll(this.getChartTypeDefaultConfig());
			},

			/**
			 * Возвращает объект типов сортировки.
			 * @private
			 * @return {Object} Возвращает объект типов сортировки.
			 */
			getOrderByDefaultConfig: function() {
				var orderByDefaultConfig = {
					GroupByField: {
						value: Terrasoft.DashboardEnums.ChartOrderBy.GROUP_BY_FIELD,
						displayValue: this.get("Resources.Strings.OrderByGroupByField")
					}
				};
				var valueTemplate = Terrasoft.DashboardEnums.ChartOrderBy.CHART_ENTITY_COLUMN + ":{0}";
				var displaValueTpl = this.get("Resources.Strings.OrderByChartEntityColumnSeries");
				var seriesCollection = this.get("SeriesCollection");
				seriesCollection.each(function(seriesItemViewModel, seriesItemViewModelIndex) {
					var value = Ext.String.format(valueTemplate, seriesItemViewModelIndex);
					var displayValue = Ext.String.format(displaValueTpl, seriesItemViewModel.get("Caption"));
					orderByDefaultConfig[value] = {
						value: value,
						displayValue: displayValue
					};
				}, this);
				return orderByDefaultConfig;
			},

			/**
			 * Наполняет коллекцию колонок сортировки.
			 * @protected
			 * @virtual
			 * @param {String} filter Строка фильтрации.
			 * @param {Terrasoft.Collection} list Список.
			 */
			prepareOrderByList: function(filter, list) {
				if (list === null) {
					return;
				}
				list.clear();
				list.loadAll(this.getOrderByDefaultConfig());
			},

			/**
			 * Возвращает объект направлений сортировки.
			 * @private
			 * @return {Object} Возвращает объект направлений сортировки.
			 */
			getOrderDirectionDefaultConfig: function() {
				var orderByDefaultConfig = {
					Ascending: {
						value: "Ascending",
						displayValue: this.get("Resources.Strings.OrderDirectionASC")
					},
					Descending:  {
						value: "Descending",
						displayValue: this.get("Resources.Strings.OrderDirectionDESC")
					}
				};
				return orderByDefaultConfig;
			},

			/**
			 * Наполняет коллекцию направлений сортировки.
			 * @protected
			 * @virtual
			 * @param {String} filter Строка фильтрации.
			 * @param {Terrasoft.Collection} list Список.
			 */
			prepareOrderDirectionList: function(filter, list) {
				if (list === null) {
					return;
				}
				list.clear();
				list.loadAll(this.getOrderDirectionDefaultConfig());
			},

			/**
			 * Возвращает объект типов формата даты.
			 * @private
			 * @return {Object} Возвращает объект типов формата даты.
			 */
			getDateTimeFormatDefaultConfig: function() {
				var dateTimeFormatDefaultConfig = {
					"Year": {
						value: "Year",
						displayValue: this.get("Resources.Strings.DateTimeFormatYear")
					},
					"Month;Year": {
						value: "Month;Year",
						displayValue: this.get("Resources.Strings.DateTimeFormatMonthYear")
					},
					"Month": {
						value: "Month",
						displayValue: this.get("Resources.Strings.DateTimeFormatMonth")
					},
					"Week": {
						value: "Week",
						displayValue: this.get("Resources.Strings.DateTimeFormatWeek")
					},
					"Day;Month;Year": {
						value: "Day;Month;Year",
						displayValue: this.get("Resources.Strings.DateTimeFormatDayMonthYear")
					},
					"Day;Month": {
						value: "Day;Month",
						displayValue: this.get("Resources.Strings.DateTimeFormatDayMonth")
					},
					"Day": {
						value: "Day",
						displayValue: this.get("Resources.Strings.DateTimeFormatDay")
					},
					"Hour": {
						value: "Hour",
						displayValue: this.get("Resources.Strings.DateTimeFormatHour")
					}
				};
				return dateTimeFormatDefaultConfig;
			},

			/**
			 * Наполняет коллекцию типов форматов даты.
			 * @protected
			 * @virtual
			 * @param {String} filter Строка фильтрации.
			 * @param {Terrasoft.Collection} list Список.
			 */
			prepareDateTimeFormatList: function(filter, list) {
				if (list === null) {
					return;
				}
				list.clear();
				list.loadAll(this.getDateTimeFormatDefaultConfig());
			},

			/**
			 * Возвращает объект позиций подписи оси У.
			 * @private
			 * @return {Object} Возвращает объект позиций подписи оси У.
			 */
			getYAxisPositionDefaultConfig: function() {
				var yAxisPositionDefaultConfig = {};
				yAxisPositionDefaultConfig[Terrasoft.DashboardEnums.ChartAxisPosition.NONE] = {
					value: Terrasoft.DashboardEnums.ChartAxisPosition.NONE,
					displayValue: this.get("Resource.Strings.ChartAxisPositionNone")
				};
				yAxisPositionDefaultConfig[Terrasoft.DashboardEnums.ChartAxisPosition.LEFT] = {
					value: Terrasoft.DashboardEnums.ChartAxisPosition.LEFT,
					displayValue: this.get("Resource.Strings.ChartAxisPositionLeft")
				};
				yAxisPositionDefaultConfig[Terrasoft.DashboardEnums.ChartAxisPosition.RIGHT] = {
					value: Terrasoft.DashboardEnums.ChartAxisPosition.RIGHT,
					displayValue: this.get("Resource.Strings.ChartAxisPositionRight")
				};
				return yAxisPositionDefaultConfig;
			},

			/**
			 * Наполняет коллекцию колонок сортировки.
			 * @protected
			 * @virtual
			 * @param {String} filter Строка фильтрации.
			 * @param {Terrasoft.Collection} list Список.
			 */
			prepareYAxisPositionList: function(filter, list) {
				if (list === null) {
					return;
				}
				list.clear();
				list.loadAll(this.getYAxisPositionDefaultConfig());
			},

			/**
			 * Метод обработки события изменения названия схемы.
			 * @protected
			 * @virtual
			 */
			onEntitySchemaNameChange: function() {
				if (this.get("moduleLoaded")) {
					this.set("XAxisColumn", null);
				}
				this.callParent(arguments);
			},

			/**
			 * Метод обработки события изменения типа агрегации.
			 * @private
			 */
			onChartTypeChange: function() {
				var oldValue = arguments[2];
				if (oldValue) {
					this.set("XAxisCaption", null);
					this.set("YAxisCaption", null);
				}
			},

			/**
			 * Метод опредиления видимости типа формата даты.
			 * @private
			 * @param {Terrasoft.DataValueType} value Значение.
			 * @return {Boolean} Признак видимости типа формата даты.
			 */
			dateTimeFormatVisibilityConverter: function(value) {
				return value && Terrasoft.isDateDataValueType(value.dataValueType);
			},

			/**
			 * Метод опредиления видимости типа формата даты.
			 * @private
			 * @param {Terrasoft.DataValueType} value Значение.
			 * @return {Boolean} Признак видимости типа формата даты.
			 */
			xAxisCaptionVisibilityConverter: function(value) {
				var allowedChartTypes = ["spline", "line", "areaspline", "scatter"];
				return value && Terrasoft.contains(allowedChartTypes, value.value);
			},

			/**
			 * Метод опредиления заголовка подписи оси У.
			 * @private
			 * @param {Terrasoft.DataValueType} value Значение.
			 * @return {String} Признак видимости типа формата даты.
			 */
			yAxisCaptionLabelConverter: function(value) {
				var allowedChartTypes = ["spline", "line", "areaspline", "scatter"];
				var testCondition =  value && value.value && Terrasoft.contains(allowedChartTypes, value.value);
				var result = (testCondition)
					? this.get("Resources.Strings.YAxisCaption")
					: this.get("Resources.Strings.YAxisCaption2");
				return result;
			},

			/**
			 * Метод опредиления видимости колонки по X.
			 * @private
			 * @param {Object} value Значение.
			 * @return {Boolean} Признак видимости колонки по X.
			 */
			XAxisColumnVisibilityConverter: function(value) {
				return !!value;
			},

			/**
			 * @inheritdoc Terrasoft.BaseWidgetDesigner#setAttributeDisplayValue
			 * @protected
			 * @overridden
			 */
			setAttributeDisplayValue: function(propertyName, propertyValue) {
				switch (propertyName) {
					case "ChartType":
						propertyValue = this.getChartTypeDefaultConfig()[propertyValue];
						break;
					case "OrderDirection":
						propertyValue = this.getOrderDirectionDefaultConfig()[propertyValue];
						break;
					case "OrderBy":
						propertyValue = this.getOrderByDefaultConfig()[propertyValue];
						break;
					case "DateTimeFormat":
						propertyValue = this.getDateTimeFormatDefaultConfig()[propertyValue];
						break;
					case "StyleColor":
						propertyValue = this.getStyleColorDefaultConfig()[propertyValue];
						break;
					default:
						this.callParent(arguments);
						return;
				}
				this.set(propertyName, propertyValue);
			},

			/**
			 * Метод установки настроек валидации.
			 * @private
			 */
			setValidationConfig: function() {
				this.callParent(arguments);
				this.addColumnValidator("DateTimeFormat", function(value) {
					var invalidMessage = "";
					if (this.dateTimeFormatVisibilityConverter(this.get("XAxisColumn")) &&
							(!value || (value && !value.value))) {
						invalidMessage = Terrasoft.Resources.BaseViewModel.columnRequiredValidationMessage;
					}
					return {
						fullInvalidMessage: invalidMessage,
						invalidMessage: invalidMessage
					};
				});
			},

			/**
			 * Возвращает объект стилей.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект стилей.
			 */
			getStyleColorDefaultConfig: function() {
				return Terrasoft.DashboardEnums.WidgetColor;
			},

			/**
			 * Наполняет коллекцию стилей.
			 * @protected
			 * @virtual
			 * @param {String} filter Строка фильтрации.
			 * @param {Terrasoft.Collection} list Список.
			 */
			prepareStyleColorList: function(filter, list) {
				if (list === null) {
					return;
				}
				list.clear();
				list.loadAll(this.getStyleColorDefaultConfig());
			},

			/**
			 * @inheritdoc Terrasoft.BaseWidgetDesigner#save
			 * @protected
			 * @overridden
			 */
			save: function() {
				var invalidSeries = this.getInvalidSeries();
				if (invalidSeries.length > 0) {
					var message = Ext.String.format(this.get("Resources.Strings.InvalidSeriesConfig"),
						invalidSeries[0].get("Caption"));
					Terrasoft.utils.showInformation(message, null, null, { buttons: ["ok"] });
				} else {
					this.callParent(arguments);
				}
			}

		},
		diff: [
			{
				"operation": "insert",
				"name": "type",
				"parentName": "QueryProperties",
				"propertyName": "items",
				"values": {
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"bindTo": "ChartType",
					"layout": {
						"column": 0,
						"row": 6,
						"colSpan": 24
					},
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.ChartTypeCaption"
						}
					},
					"controlConfig": {
						"className": "Terrasoft.ComboBoxEdit",
						"prepareList": {
							"bindTo": "prepareChartTypesList"
						},
						"list": {
							"bindTo": "ChartTypeList"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "XAxisProperties",
				"parentName": "WidgetProperties",
				"index": "3",
				"propertyName": "items",
				"values": {
					"id": "XAxisProperties",
					"selectors": {
						"wrapEl": "#XAxisProperties"
					},
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"controlConfig": {
						"collapsed": false,
						"caption": {
							"bindTo": "Resources.Strings.XAxisPropertiesCaption"
						}
					},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "XAxisColumn",
				"parentName": "XAxisProperties",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.MODEL_ITEM,
					"generator": "ColumnEditGenerator.generatePartial",
					"labelConfig": {
						"visible": true,
						"caption": { "bindTo": "Resources.Strings.AggregationColumnLabel" },
						"isRequired": true
					},
					"visible": {
						"bindTo": "entitySchemaName",
						"bindConfig": { "converter": "XAxisColumnVisibilityConverter"}
					}
				}
			},
			{
				"operation": "insert",
				"name": "dateTimeFormat",
				"parentName": "XAxisProperties",
				"propertyName": "items",
				"values": {
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"bindTo": "DateTimeFormat",
					"visible": {
						"bindTo": "XAxisColumn",
						"bindConfig": { "converter": "dateTimeFormatVisibilityConverter"}
					},

					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.DateFormatCaption"
						}
					},
					"controlConfig": {
						"placeholder": {
							"bindTo": "Resources.Strings.DateFormatPlaceholder"
						},
						"className": "Terrasoft.ComboBoxEdit",
						"prepareList": {
							"bindTo": "prepareDateTimeFormatList"
						},
						"list": {
							"bindTo": "DateTimeFormatList"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "OrderProperties",
				"parentName": "WidgetProperties",
				"propertyName": "items",
				"index": 4,
				"values": {
					"id": "OrderProperties",
					"selectors": {
						"wrapEl": "#OrderProperties"
					},
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"controlConfig": {
						"collapsed": false,
						"caption": {
							"bindTo": "Resources.Strings.OrderPropertiesGroupLabel"
						}
					},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "orderBy",
				"parentName": "OrderProperties",
				"propertyName": "items",
				"values": {
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"bindTo": "OrderBy",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.SortCaption"
						}
					},
					"controlConfig": {
						"className": "Terrasoft.ComboBoxEdit",
						"prepareList": {
							"bindTo": "prepareOrderByList"
						},
						"list": {
							"bindTo": "OrderByList"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "orderDirection",
				"parentName": "OrderProperties",
				"propertyName": "items",
				"values": {
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"bindTo": "OrderDirection",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.OrderDirectionCaption"
						}
					},
					"controlConfig": {
						"className": "Terrasoft.ComboBoxEdit",
						"prepareList": {
							"bindTo": "prepareOrderDirectionList"
						},
						"list": {
							"bindTo": "OrderDirectionList"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "StyleColor",
				"parentName": "FormatProperties",
				"propertyName": "items",
				"values": {
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"bindTo": "StyleColor",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.StyleLabel"
						}
					},
					"controlConfig": {
						"className": "Terrasoft.ComboBoxEdit",
						"prepareList": {
							"bindTo": "prepareStyleColorList"
						},
						"list": {
							"bindTo": "StyleColorList"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "isPercentageMode",
				"parentName": "FormatProperties",
				"propertyName": "items",
				"values": {
					"visible": false,
					"bindTo": "IsPercentageMode",
					"layout": {
						"column": 12,
						"row": 4,
						"colSpan": 12
					},
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.IsPercentageModeCaption"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "XAxisCaption",
				"parentName": "FormatProperties",
				"propertyName": "items",
				"values": {
					"bindTo": "XAxisCaption",
					"contentType": 1,
					"visible": {
						bindTo: "ChartType",
						bindConfig: {
							converter: "xAxisCaptionVisibilityConverter"
						}
					},
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.XAxisCaption"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "YAxisCaption",
				"parentName": "FormatProperties",
				"propertyName": "items",
				"values": {
					"bindTo": "YAxisCaption",
					"contentType": 1,
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "ChartType",
							"bindConfig": {
								"converter": "yAxisCaptionLabelConverter"
							}
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "YAxisMin",
				"parentName": "FormatProperties",
				"propertyName": "items",
				"values": {
					"visible": false,
					"bindTo": "YAxisMinValue",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.YAxisMinValueLabel"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "YAxisMax",
				"parentName": "FormatProperties",
				"propertyName": "items",
				"values": {
					"visible": false,
					"bindTo": "YAxisMaxValue",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.YAxisMaxValueLabel"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "YAxisPosition",
				"parentName": "FormatProperties",
				"propertyName": "items",
				"values": {
					"visible": false,
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"bindTo": "YAxisPosition",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.YAxisPositionLabel"
						}
					},
					"controlConfig": {
						"className": "Terrasoft.ComboBoxEdit",
						"prepareList": {
							"bindTo": "prepareYAxisPositionList"
						},
						"list": {
							"bindTo": "YAxisPositionList"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "SeriesTabPanelContainer",
				"parentName": "WidgetProperties",
				"propertyName": "items",
				"index": 1,
				"values": {
					"id": "SeriesTabPanelContainer",
					"selectors": {
						"wrapEl": "#SeriesTabPanelContainer"
					},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": { wrapClassName: ["chart-designer-series-tab-panel"] },
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "Series",
				"parentName": "SeriesTabPanelContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.TAB_PANEL,
					"activeTabChange": { "bindTo": "onActiveSeriesChange" },
					"activeTabName": { "bindTo": "ActiveSeriesName" },
					"collection": { "bindTo": "SeriesCollection" },
					"tabs": [],
					"controlConfig": {
						"items": [{
							"className": "Terrasoft.Button",
							"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"imageConfig": { "bindTo": "Resources.Images.Settings" },
							"markerValue": "SettingsButton",
							"menu": {
								items: [{
									"caption": { "bindTo": "Resources.Strings.AddSeriesButtonCaption" },
									"click": { "bindTo": "addSeries" },
									"markerValue": "AddSeriesButton"
								}, {
									"caption": { "bindTo": "Resources.Strings.DeleteSeriesButtonCaption" },
									"click": { "bindTo": "deleteActiveSeries" },
									"markerValue": "DeleteSeriesButton",
									"enabled": {
										"bindTo": "ActiveSeriesName",
										"bindConfig": { "converter": "getIsDeleteSeriesButtonEnabled"}
									}
								}]
							}
						}]
					}
				}
			}
		]
	};
});