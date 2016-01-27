define("GaugeModule", ["GaugeModuleResources", "BaseNestedModule", "HighchartsWrapper"],
	function(resources) {

		/**
		 * @class Terrasoft.controls.GaugeChart
		 * Класс, реализующий компонент графика типа индикатор.
		 */
		Ext.define("Terrasoft.controls.GaugeChart", {
			extend: "Terrasoft.Chart",
			alternateClassName: "Terrasoft.GaugeChart",

			/**
			 * Коэффициенты соотношений величин к высоте графика индикатора.
			 * @type {Object}
			 */
			chartRatio: {
				height: 0.69,
				yAxisOffset: 0.049,
				yAxisDistance: 0.0138,
				yAxisLabelsPosition: 0.03,
				yAxisLabelsFont: 0.065,
				primaryLabelFont: 0.8,
				primaryLabelHeightMax: 0.27,
				primaryLabelHeightMin: 0.1,
				seriesDataLabelsYPosition: 0.6,
				seriesDialWidth: 0.046
			},

			/**
			 * Высота заголовка графика.
			 * @type {Number}
			 */
			headerHeight: 35,

			/**
			 * Угол начала и окончания оси Y относительно вертикали.
			 * @type {Number}
			 */
			angle: 125,

			/**
			 * Массив значений границ секций индикатора.
			 * @type {Number[]}
			 */
			sectorsBounds: null,

			/**
			 * Массив значений используемых цветов секций индикатора.
			 * @type {String[]}
			 */
			sectorsColors: null,

			/**
			 * Обратный порядок секторов.
			 * @type {Boolean}
			 */
			reverseSectors: false,

			/**
			 * Значение индикатора.
			 * @type {Number}
			 */
			value: 0,

			/**
			 * Возвращает признак корректности типов данных для построения индикатора.
			 * @private
			 * @returns {Boolean} Признак корректности типов данных.
			 */
			validateTypes: function() {
				return Ext.isArray(this.sectorsColors) && Ext.isArray(this.sectorsBounds);
			},

			/**
			 * Возвращает признак корректности данных для построения индикатора.
			 * Данные считаются корректыми, если заполнены границы и цвета для секторов.
			 * @protected
			 * @virtual
			 * @returns {Boolean} Признак корректности данных.
			 */
			validateData: function() {
				if (!this.validateTypes()) {
					return false;
				}
				var dataValid = !((this.sectorsBounds.length < 2) ||
					(this.sectorsColors.length + 1 !== this.sectorsBounds.length));
				if (!dataValid) {
					return false;
				}
				Terrasoft.each(this.sectorsBounds, function(bound) {
					if (Ext.isEmpty(bound)) {
						dataValid = false;
						return false;
					}
				});
				return dataValid;
			},

			/**
			 * Возвращает актуальные значения используемых цветов секций в зависимости от порядка.
			 * @private
			 * @returns {String[]} Значения используемых цветов секций.
			 */
			getSectorsColors: function() {
				if (!this.validateTypes()) {
					return null;
				}
				var sectorsColors = this.sectorsColors.slice(0);
				if (this.reverseSectors) {
					sectorsColors = sectorsColors.reverse();
				}
				return sectorsColors;
			},

			/**
			 * Возвращает основной цвет индикатора.
			 * @protected
			 * @virtual
			 * @returns {String} Основной цвет индикатора.
			 */
			getPrimaryColor: function() {
				var sectorsColors = this.getSectorsColors();
				if (!this.validateTypes()) {
					return null;
				}
				for (var i = this.sectorsBounds.length - 1; i >= 0; i--) {
					var bound = this.sectorsBounds[i];
					if ((this.value < bound) && (i !== 0)) {
						continue;
					}
					var colorIndex = (i === this.sectorsBounds.length - 1) ? sectorsColors.length - 1 : i;
					return sectorsColors[colorIndex];
				}
				return null;
			},

			/**
			 * Возвращает массив конфигураций секций индикатора.
			 * @protected
			 * @virtual
			 * @returns {Object[]} Массив конфигурации секций индикатора.
			 */
			getPlotBandsConfig: function() {
				var plotBands = [];
				var sectorsColors = this.getSectorsColors();
				for (var i = 0; i < this.sectorsBounds.length - 1; i++) {
					plotBands.push({
						"from": this.sectorsBounds[i],
						"to": this.sectorsBounds[i + 1],
						"innerRadius": "95,7%",
						"outerRadius": "100%",
						"color": sectorsColors[i]
					});
				}
				return plotBands;
			},

			/**
			 * @inheritdoc Terrasoft.Chart#getDefaultChartConfig
			 * @overridden
			 */
			getDefaultChartConfig: function() {
				return {
					"chart": {
						"renderTo": "chart-" + this.id,
						"type": "gauge"
					},
					"title": {"text": ""},
					"tooltip": {"enabled": false},
					"credits": {"enabled": false},
					"plotOptions": {
						"gauge": {"wrap": false}
					}
				};
			},

			/**
			 * Формирует массив округленных границ индикатора.
			 * @protected
			 * @virtual
			 * @param {Number[]} bounds Массив границ индикатора.
			 * @param {Number} tickInterval Интервал шага индикатора.
			 * @return {Number[]} Массив округленных границ индикатора.
			 */
			getRoundedBounds: function(bounds, tickInterval) {
				if (bounds.length < 2) {
					return [];
				}
				var roundedBounds = [];
				roundedBounds.push(Math.ceil(bounds[0] / tickInterval) * tickInterval);
				Terrasoft.each(bounds.slice(1, bounds.length - 1), function(bound) {
					var roundedBound = Math.round(bound / tickInterval) * tickInterval;
					roundedBounds.push(roundedBound);
				}, this);
				roundedBounds.push(Math.floor(bounds[bounds.length - 1] / tickInterval) * tickInterval);
				return roundedBounds;
			},

			/**
			 * @inheritdoc Terrasoft.Chart#getInitConfig
			 * @overridden
			 */
			getInitConfig: function() {
				if (!this.validateData()) {
					return null;
				}
				var bounds = this.sectorsBounds;
				var primeColor = this.getPrimaryColor();
				var plotBands = this.getPlotBandsConfig();
				var minValue = this.sectorsBounds[0];
				var maxValue = this.sectorsBounds[this.sectorsBounds.length - 1];
				var height = this.wrapEl.getHeight();
				var width = this.wrapEl.getWidth();
				var displayValueLength = !Ext.isEmpty(this.value) ? Math.max(2, this.value.toString().length) : 0;
				var gaugeSize = Math.min(height - this.headerHeight, width);
				var fontHeightRatio = (gaugeSize < 100)
					? this.chartRatio.primaryLabelHeightMin
					: this.chartRatio.primaryLabelHeightMax;
				var primaryFontSize = Math.min(this.chartRatio.primaryLabelFont * gaugeSize / displayValueLength,
					gaugeSize * fontHeightRatio);
				var tickIntervalDigitCount = Math.round(maxValue / 100).toString().length;
				var tickInterval = Math.pow(10, tickIntervalDigitCount - 1);
				var roundedBounds = this.getRoundedBounds(bounds, tickInterval);
				return {
					"chart": {
						"borderWidth": 0,
						"height": height
					},
					"pane": {
						"startAngle": -this.angle,
						"endAngle": this.angle,
						"background": [
							{
								"backgroundColor": "#FFF",
								"outerRadius": 0
							},
							{
								"backgroundColor": primeColor,
								"borderWidth": 0,
								"outerRadius": "75.7%",
								"innerRadius": 0
							}
						]
					},
					"yAxis": [
						{
							"min": minValue,
							"max": maxValue,
							"offset": this.chartRatio.yAxisOffset * height,
							"minorTickWidth": 0,
							"tickInterval": tickInterval,
							"tickWidth": 0,
							"lineWidth": 0,
							"labels": {
								"distance": this.chartRatio.yAxisDistance * height,
								"padding": 0,
								"y": this.chartRatio.yAxisLabelsPosition * height,
								"style": {
									"fontFamily": "Segoe UI Light",
									"fontSize": Ext.String.format("{0}px", this.chartRatio.yAxisLabelsFont * height),
									"fontWeight": "normal",
									"color": "#999"
								},
								formatter: function() {
									var displayedValue = null;
									var value = this.value;
									$.each(roundedBounds, function(i, roundedBound) {
										if (value === roundedBound) {
											displayedValue = bounds[i];
											return false;
										}
									});
									return displayedValue;
								}
							},
							"plotBands": plotBands
						}
					],
					"series": [
						{
							"name": "Value",
							"data": [this.value],
							"pivot": {"radius": 0},
							"dataLabels": {
								"color": "#FFF",
								"borderWidth": 0,
								"y": -primaryFontSize * this.chartRatio.seriesDataLabelsYPosition - 5,
								"style": {
									"fontSize": Ext.String.format("{0}px", primaryFontSize),
									"fontFamily": "Segoe UI Light",
									"textShadow": 0,
									"fontWeight": "normal"
								},
								"format": "{y}"
							},
							"dial": {
								"backgroundColor": "#444444",
								"baseLength": "81%",
								"baseWidth": this.chartRatio.seriesDialWidth * height,
								"radius": "94.5%",
								"topWidth": 0,
								"rearLength": "-81%",
								"borderWidth": 0
							}
						}
					]
				};
			},

			/**
			 * @inheritdoc Terrasoft.Chart#initChart
			 * @overridden
			 */
			initChart: function() {
				var defaultChartConfig = this.getDefaultChartConfig();
				var initConfig = Ext.merge(defaultChartConfig, this.chartConfig || this.getInitConfig());
				this.chart = new window.Highcharts.Chart(initConfig);
			},

			/**
			 * @inheritdoc Terrasoft.Bindable#getBindConfig.
			 * @overridden
			 */
			getBindConfig: function() {
				var bindConfig = this.callParent(arguments);
				var chartBindConfig = {
					value: {
						changeMethod: "setValue"
					},
					sectorsBounds: {
						changeMethod: "setSectorsBounds"
					},
					sectorsColors: {
						changeMethod: "setSectorsColors"
					},
					reverseSectors: {
						changeMethod: "setReverseSectors"
					}
				};
				Ext.apply(chartBindConfig, bindConfig);
				return chartBindConfig;
			},

			/**
			 * Устанавливает значение индикатора.
			 * @protected
			 * @virtual
			 * @param {Number} value Значение.
			 */
			setValue: function(value) {
				this.value = value;
			},

			/**
			 * Устанавливает значения границ секций индикатора.
			 * @protected
			 * @virtual
			 * @param {Number[]} sectorsBounds Массив значений раздерения секций.
			 */
			setSectorsBounds: function(sectorsBounds) {
				this.sectorsBounds = sectorsBounds;
			},

			/**
			 * Устанавливает значения используемых цветов секций индикатора.
			 * @protected
			 * @virtual
			 * @param {String[]} sectorsColors Массив значений используемых цветов секций.
			 */
			setSectorsColors: function(sectorsColors) {
				this.sectorsColors = sectorsColors;
			},

			/**
			 * Устанавливает обратный порядок секторов индикатора.
			 * @protected
			 * @virtual
			 * @param {Boolean} reverseSectors Обратный порядок.
			 */
			setReverseSectors: function(reverseSectors) {
				this.reverseSectors = reverseSectors;
			}
		});

		/**
		 * @class Terrasoft.configuration.GaugeViewConfig
		 * Класс генерурующий конфигурацию представления модуля индикатора.
		 */
		Ext.define("Terrasoft.configuration.GaugeViewConfig", {
			extend: "Terrasoft.BaseModel",
			alternateClassName: "Terrasoft.GaugeViewConfig",

			/**
			 * Генерирует конфигурацию представления модуля индикатора.
			 * @protected
			 * @virtual
			 * @param {Object} config Объект конфигурации.
			 * @param {Terrasoft.BaseEntitySchema} config.entitySchema Cхема объекта.
			 * @param {String} config.style Стиль отображения.
			 * @return {Object} Возвращает конфигурацию представления модуля индикатора.
			 */
			generate: function(config) {
				var style = config.style || "";
				var wrapClassName = Ext.String.format("{0}", style);
				var chartId = Terrasoft.Component.generateId();
				return {
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
						"name": "chart-wrapper-" + chartId,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {wrapClassName: [wrapClassName, "default-widget-header"]},
						"items": [{
							"name": "caption-" + chartId,
							"labelConfig": {
								"classes": ["default-widget-header-label"],
								"labelClass": ""
							},
							"itemType": Terrasoft.ViewItemType.LABEL,
							"caption": {"bindTo": "caption"}
						}]
					}, {
						"name": "gaugeChart-" + chartId,
						"itemType": Terrasoft.ViewItemType.MODULE,
						"className": "Terrasoft.GaugeChart",
						"value": {"bindTo": "value"},
						"sectorsBounds": {"bindTo": "getSectorsBounds"},
						"sectorsColors": ["#6CB039", "#F8C065", "#EA7356"],
						"reverseSectors": {"bindTo": "getReverseSectors"}
					}]
				};
			}
		});

		/**
		 * @class Terrasoft.configuration.GaugeViewModel
		 * Класс модели представления индикатора.
		 */
		Ext.define("Terrasoft.configuration.GaugeViewModel", {
			extend: "Terrasoft.BaseModel",
			alternateClassName: "Terrasoft.GaugeViewModel",
			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Описание колонок модели.
			 * {Object}
			 */
			columns: {

				/**
				 * Заголовок индикатора.
				 * @type {String}
				 */
				caption: {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					dataValueType: Terrasoft.DataValueType.Text,
					value: null
				},

				/**
				 * Значение индикатора.
				 * @type {Number}
				 */
				value: {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					dataValueType: Terrasoft.DataValueType.FLOAT,
					value: 0
				},

				/**
				 * Минимальное значение шкалы индикатора.
				 * @type {Number}
				 */
				min: {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					dataValueType: Terrasoft.DataValueType.FLOAT,
					value: 0
				},

				/**
				 * Среднее значение шкалы индикатора "От".
				 * @type {Number}
				 */
				middleFrom: {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					dataValueType: Terrasoft.DataValueType.FLOAT,
					value: 0
				},

				/**
				 * Среднее значение шкалы индикатора "До".
				 * @type {Number}
				 */
				middleTo: {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					dataValueType: Terrasoft.DataValueType.FLOAT,
					value: 0
				},

				/**
				 * Максимальное значение шкалы индикатора.
				 * @type {Number}
				 */
				max: {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					dataValueType: Terrasoft.DataValueType.FLOAT,
					value: 0
				},

				/**
				 * Обратный порядок отображения секторов.
				 * @type {Boolean}
				 */
				orderDirection: {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					dataValueType: Terrasoft.DataValueType.INTEGER
				}
			},

			/**
			 * Метод обработки события отрисовки.
			 * @type {Function}
			 */
			onRender: Ext.emptyFn,

			/**
			 * Метод для подписки по умолчанию для afterrender и afterrerender.
			 * @type {Function}
			 */
			loadModule: Ext.emptyFn,

			/**
			 * @inheritDoc Terrasoft.configuration.BaseModel#constructor
			 * @overridden
			 */
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
			 * Выполняет подготовку параметров индикатора.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			prepareGauge: function(callback, scope) {
				var select = this.createSelect();
				if (select) {
					select.getEntityCollection(function(response) {
						if (!response.success || this.destroyed) {
							return;
						}
						var resultEntity = response.collection.getByIndex(0);
						var resultValue = resultEntity.get("value");
						this.set("value", resultValue);
						callback.call(scope);
					}, this);
				} else {
					callback.call(scope);
				}
			},

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				this.prepareGauge(callback, scope);
			},

			/**
			 * Выполняет выборку данных.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.EntitySchemaQuery} select Cодержит выбранные и отфильтрованные данные.
			 */
			createSelect: function() {
				var entitySchemaName = this.get("entitySchemaName");
				if (!entitySchemaName) {
					return null;
				}
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: entitySchemaName,
					rowCount: 1
				});
				this.addAggregationColumn(select);
				var filterData = this.get("filterData");
				var filters = filterData ? Terrasoft.deserialize(filterData) : Ext.create("Terrasoft.FilterGroup");
				select.filters.addItem(filters);
				var quickFilters = this.getQuickFilters();
				if (!Ext.isEmpty(quickFilters)) {
					select.filters.addItem(quickFilters);
				}
				return select;
			},

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
			},

			/**
			 * Возвращает фильтры с учетом фильтров разделов.
			 * @returns {Object} quickFilter Фильтры с учетом фильтров разделов.
			 */
			getQuickFilters: function() {
				var column = this.get("sectionBindingColumn");
				if (Ext.isEmpty(this.get("sectionId")) || Ext.isEmpty(column)) {
					return this.Ext.create("Terrasoft.FilterGroup");
				}
				column = column.replace(/\.[iI]d$|^[iI]d$/, "");
				var quickFilter = this.sandbox.publish("GetFiltersCollection", null);
				if (quickFilter && !quickFilter.isEmpty() && !Ext.isEmpty(column)) {
					this.updateModuleFilter(quickFilter, column);
				}
				return quickFilter;
			},

			/**
			 * Добавляет агрегирующую колонку основываясь на типе агрегации из конфига.
			 * @protected
			 * @virtual
			 * @param {Object} select Выборка данных.
			 */
			addAggregationColumn: function(select) {
				var aggregationType = this.get("aggregationType");
				var aggregationColumnName = this.get("aggregationColumn") || "Id";
				select.addAggregationSchemaColumn(aggregationColumnName, aggregationType, "value");
			},

			/**
			 * Возращает массив значений границ секций индикатора.
			 * @protected
			 * @virtual
			 * @returns {Number[]} массив значений границ секций индикатора.
			 */
			getSectorsBounds: function() {
				return [
					this.get("min"),
					this.get("middleFrom"),
					this.get("middleTo"),
					this.get("max")
				];
			},

			/**
			 * Возвращает признак обратного порядка секторов.
			 * @returns {boolean}
			 */
			getReverseSectors: function() {
				return this.get("orderDirection") === Terrasoft.OrderDirection.ASC;
			}
		});

		/**
		 * @class Terrasoft.configuration.GaugeModule
		 * Класс, реализующий работу с компонентом графика типа индикатор.
		 */
		Ext.define("Terrasoft.configuration.GaugeModule", {
			extend: "Terrasoft.BaseNestedModule",
			alternateClassName: "Terrasoft.GaugeModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,
			showMask: true,

			/**
			 * Используемые сообщения.
			 * @protected
			 */
			messages: {
				/**
				 * @message GetSectionFilterModuleId
				 * Для подписки на UpdateFilter.
				 */
				"GetSectionFilterModuleId": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},

			/**
			 * Имя класса модели представления для модуля индикатора.
			 * @type {String}
			 */
			viewModelClassName: "Terrasoft.GaugeViewModel",

			/**
			 * Имя класа генератога конфигурации представления модуля индикатора.
			 * @type {String}
			 */
			viewConfigClassName: "Terrasoft.GaugeViewConfig",

			/**
			 * Имя класа генератора представления.
			 * @type {String}
			 */
			viewGeneratorClass: "Terrasoft.ViewGenerator",

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewConfig
			 * @overridden
			 */
			initViewConfig: function(callback, scope) {
				var generatorConfig = Terrasoft.deepClone(this.moduleConfig);
				generatorConfig.viewModelClass = this.viewModelClass;
				this.buildView(generatorConfig, function(view) {
					this.viewConfig = view[0];
					callback.call(scope);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#init
			 * @overridden
			 */
			init: function() {
				if (!this.viewModel) {
					this.initConfig();
					this.registerMessages();
					this.subscribeMessages();
				}
				this.callParent(arguments);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewModelClass
			 * @overridden
			 */
			initViewModelClass: function(callback, scope) {
				this.viewModelClass = Ext.ClassManager.get(this.viewModelClassName);
				callback.call(scope);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#getViewModelConfig
			 * @overridden
			 */
			getViewModelConfig: function() {
				var config = this.callParent(arguments);
				config.values = this.moduleConfig;
				return config;
			},

			/**
			 * Создает экземпляр класса Terrasoft.ViewGenerator.
			 * @protected
			 * @virtual
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
			 * Инициализирует объект конфигурации модуля.
			 * @protected
			 * @virtual
			 */
			initConfig: function() {
				var sandbox = this.sandbox;
				this.moduleConfig = sandbox.publish("GetGaugeConfig", null, [sandbox.id]);
			},

			/**
			 * Подписывается на сообщения родительского модуля.
			 * @protected
			 * @virtual
			 */
			subscribeMessages: function() {
				var sandbox = this.sandbox;
				var sectionFilterModuleId = sandbox.publish("GetSectionFilterModuleId");
				sandbox.subscribe("GenerateGauge", this.onGenerateGauge, this, [sandbox.id]);
				sandbox.subscribe("UpdateFilter", function() {
					if (!Ext.isEmpty(this.moduleConfig.sectionId) &&
							!Ext.isEmpty(this.moduleConfig.sectionBindingColumn)) {
						this.onGenerateGauge();
					}
				}, this, [sectionFilterModuleId]);
			},

			/**
			 * Метод обработки сообщения генерации индикатора.
			 * @protected
			 * @virtual
			 */
			onGenerateGauge: function() {
				var viewModel = this.viewModel;
				this.initConfig();
				viewModel.loadFromColumnValues(this.moduleConfig);
				viewModel.prepareGauge(function() {
					var view = this.view;
					if (view && !view.destroyed) {
						view.destroy();
					}
					this.initViewConfig(function() {
						var renderTo = Ext.get(viewModel.renderTo);
						if (renderTo) {
							this.render(renderTo);
						}
					}, this);
				}, this);
			},

			/**
			 * Расширяет конфигурацию сообщений модуля, сообщениями описанными в модуле.
			 * @protected
			 */
			registerMessages: function() {
				this.sandbox.registerMessages(this.messages);
			}
		});

		return Terrasoft.GaugeModule;

	});
