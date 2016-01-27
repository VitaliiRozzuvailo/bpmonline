define("HighchartsWrapper", ["ext-base", "terrasoft", "HighchartsTypedConfig", "Highcharts", "HighchartsMore", "jQuery",
	"DashboardEnums"],
		function(Ext, Terrasoft, highchartsTypedConfig) {

			Ext.define("Terrasoft.controls.Chart", {
				extend: "Terrasoft.Container",
				alternateClassName: "Terrasoft.Chart",

				items: null,

				/**
				 * Название стиля цвета для графика.
				 * @type {String}
				 */
				styleColor: null,

				/**
				 * Серии графика.
				 * @type {Object[]}
				 */
				series: null,

				/**
				 * Категории графика.
				 * @type {String[]}
				 */
				categories: null,

				/**
				 * Заголовок оси X.
				 * @type {String}
				 */
				xAxisCaption: null,

				/**
				 * Заголовок оси Y.
				 * @type {String}
				 */
				yAxisCaption: null,

				/**
				 * Тип серии графика.
				 * @type {String}
				 */
				type: null,

				/**
				 * Текущая точка с которой работает пользователь.
				 * @type {object}
				 */
				currentPoint: null,

				/**
				 * Массив объектов настроек подписей осей Y.
				 * @type {Object[]}
				 */
				yAxis: null,

				/**
				 * Меню элемента управления при углублении.
				 * @type {Object} инициализированноие или неинициализированное меню.
				 */
				drilldownMenu: null,

				/**
				 * Массив цветов используемых для стилей показателей.
				 * @type {String[]}
				 */
				colorSet: Terrasoft.DashboardEnums.WidgetColorSet,

				/**
				 * Экземпляр графика.
				 * @type {Chart}
				 */
				chart: null,

				/**
				 * Настройки стилей по умолчанию
				 * @type {Object}
				 */
				defaultTextStyle: {
					"color": "#999999",
					"font-family": "Segoe UI",
					"font-size": "13px",
					"line-height": "14px",
					"width": "100%",
					"fill": "#999999"
				},

				/**
				 * Конфигурационный объект настроек графика.
				 * @type {Object}
				 */
				chartConfig: null,

				/**
				 * @inheritDoc Terrasoft.Component#tpl
				 * @type {String[]}
				 */
				tpl: [
					/*jshint white:false */
					'<div class="highcharts-wrapper" id="chart-{id}"></div>'
					/*jshint white:true */
				],

				constructor: function() {
					this.addEvents(
							"drillDownChart"
					);

					this.callParent(arguments);
				},

				/**
				 * @inheritDoc Terrasoft.Component#getTplData
				 * @overridden
				 */
				getTplData: function() {
					var tplData = this.callParent(arguments);
					this.selectors = this.getSelectors();
					return tplData;
				},

				/**
				 * Инициализация компонента меню.
				 * @protected
				 * @override
				 */
				init: function() {
					this.callParent(arguments);
					var defaultConfig = {};
					defaultConfig.colors = this.colorSet;
					defaultConfig.title = {
						style: {
							color: "#4e7bd8",
							font: "22px 'Segoe UI Light', Verdana, sans-serif"
						},
						align: "center",
						margin: 50
					};
					Highcharts.setOptions(this.defaultConfig);
					this.initMenu();
				},

				/**
				 * Инициализировать меню.
				 * @protected
				 */
				initMenu: function() {
					var drilldownMenu = this.drilldownMenu;
					if (!drilldownMenu) {
						return;
					}
					var isMenuInitialized = drilldownMenu instanceof Terrasoft.Menu;
					if (!isMenuInitialized) {
						var config = Ext.apply({
							markerValue: this.markerValue,
							adjustPosition: function() {
								var box = this.buttonBox;
								if (!box) {
									return;
								}
								var wrapEl = this.getWrapEl();
								var wrapElBox = wrapEl.getBox();
								var body = Ext.getBody();
								var bodyViewSize = body.getViewSize();
								var scrollBarSize = Ext.getScrollbarSize();
								var wrapElRightBorderPosition = box.x + wrapElBox.width + scrollBarSize.width;
								var offsetX = (wrapElRightBorderPosition < bodyViewSize.width) ? 0 :
										bodyViewSize.width - wrapElRightBorderPosition;
								var wrapElBottomBorderPosition = box.y + wrapElBox.height;
								var offsetY = (wrapElBottomBorderPosition < bodyViewSize.height) ? 0 : -wrapElBox.height;
								wrapEl.moveTo(box.x + offsetX, box.y + offsetY);
							}
						}, drilldownMenu);
						this.drilldownMenu = Ext.create("Terrasoft.Menu", config);
					}
				},

				/**
				 * @inheritDoc Terrasoft.Component#getSelectors
				 * @overridden
				 */
				getSelectors: function() {
					return {
						wrapEl: "#chart-" + this.id,
						el: "#chart-" + this.id
					};
				},

				/**
				 * Создает экземпляр графика. Отображает его в созданный контейнер.
				 * @overridden
				 */
				onAfterRender: function() {
					this.callParent(arguments);
					this.initChart();
				},

				/**
				 * Создает экземпляр графика. Отображает его в созданный контейнер.
				 * @overridden
				 */
				onAfterReRender: function() {
					this.callParent(arguments);
					this.initChart();
				},

				/**
				 * Возвращает объект настроек по умолчанию для отображения осей.
				 * @protected
				 * @virtual
				 * @returns {Object}
				 */
				getDefaultAxisConfig: function() {
					return  Ext.clone({
						labels: {
							rotation: 0,
							style: this.defaultTextStyle
						},
						title: {
							style: this.defaultTextStyle
						}
					});
				},

				/**
				 * Возвращает конфигурационный объект базовых настроек по умолчанию для графика.
				 * @protected
				 * @virtual
				 * @returns {Object}
				 */
				getDefaultChartConfig: function() {
					return {
						chart: {
							renderTo: "chart-" + this.id
						},
						xAxis: (this.getDefaultAxisConfig()),
						yAxis: (this.getDefaultAxisConfig())
					};
				},

				/**
				 * Возвращает объект настроек инициализации графика.
				 * @protected
				 * @virtual
				 * @returns {Object}
				 */
				getInitConfig: function() {
					var colorSet = Terrasoft.deepClone(this.colorSet);
					var yAxisItemTpl = Ext.merge(this.getDefaultAxisConfig(), {
						gridLineWidth: 0,
						title: {
							text: this.yAxisCaption || ""
						},
						labels: {
							rotation: 0
						},
						opposite: false
					});
					var autoGeneratedOptions = Ext.merge(this.getDefaultChartConfig(), {
						chart: {
							type: this.type,
							reflow: false,
							zoomType: "xy",
							resetZoomButton: {
								theme: {
									fill: "white",
									stroke: "silver",
									r: 0,
									states: {
										hover: {
											fill: "#41739D",
											style: {
												color: "white"
											}
										}
									}
								}
							}
						},
						colors: colorSet,
						title: {
							text: "",
							floating: true
						},
						xAxis: {
							title: { text: this.xAxisCaption },
							categories: this.categories
						},
						yAxis: (this.yAxis && this.yAxis.length > 0) ? this.yAxis : [yAxisItemTpl],
						credits: { enabled: false },
						series: this.series
					});
					this.initDrillDown(autoGeneratedOptions);
					return autoGeneratedOptions;
				},

				/**
				 * Инициализирует график.
				 * @protected
				 * @virtual
				 */
				initChart: function() {
					var chartType = this.chartConfig ? this.chartConfig.chart.type : this.type;
					var typeOptionsConfig = Ext.clone(highchartsTypedConfig[chartType]);
					var defaultChartConfig = Ext.merge(typeOptionsConfig, this.getDefaultChartConfig());
					var initConfig = Ext.merge(defaultChartConfig, this.chartConfig || this.getInitConfig());
					this.chart = new Highcharts.Chart(initConfig);
				},

				/**
				 * Инициализирует drilldown графика.
				 * @protected
				 * @virtual
				 */
				initDrillDown: function(config) {
					var events = config.chart.events = {};
					config.chart.drilldown = { series: [], yAxis: [] };
					var me = this;
					events.drilldown = function(e) {
						me.onChartDrillDown(e, this);
					};
				},

				/**
				 * Обработчик разворачивания в графике.
				 * @protected
				 * @virtual
				 * @param {Object} e Объект события.
				 */
				onChartDrillDown: function(e) {
					if (e.seriesOptions) {
						return;
					}
					var showMenu = this.drilldownMenu && this.drilldownMenu.items && this.drilldownMenu.items.getCount() > 0;
					if (showMenu) {
						this.showMenu(e);
					}
					this.currentPoint = e.point;
					this.fireEvent("changeCurrentPoint", this.currentPoint, this);
					this.fireEvent("drillDownChart", this, e.point);
				},

				/**
				 * Показать меню.
				 * @protected
				 * @virtual
				 */
				showMenu: function(e) {
					var menu = this.drilldownMenu;
					var event = e.point.clickEvent;
					var box =
					{ width: 0, height: 0, x: event.pageX, y: event.pageY, right: 0, bottom: 0 };
					menu.show(box, null, null);
				},

				/**
				 * Удалить меню.
				 * @protected
				 * @virtual
				 */
				removeMenu: function() {
					var menu = this.drilldownMenu;
					if (menu) {
						menu.destroy();
						this.drilldownMenu = null;
					}
				},

				/**
				 * @inheritDoc Terrasoft.Component#initDomEvents
				 * @overridden
				 */
				initDomEvents: function() {
					this.callParent(arguments);
					this.debounceWindowResize = this.debounceWindowResize || Terrasoft.debounce(this.updateSize, 500);
					Ext.EventManager.addListener(window, "resize", this.debounceWindowResize, this);
				},

				/**
				 * Выполняет привязку menu к модели.
				 * @overridden
				 * @param {Terrasoft.data.modules.BaseViewModel} model Модель данных.
				 */
				bind: function(model) {
					this.callParent(arguments);
					if (this.drilldownMenu) {
						this.drilldownMenu.bind(model);
					}
				},

				/**
				 * Возвращает конфигурацию привязки к модели. Реализует интерфейс миксина {@link Terrasoft.Bindable}.
				 * @overridden
				 */
				getBindConfig: function() {
					var bindConfig = this.callParent(arguments);

					var chartBindConfig = {
						type: {
							changeMethod: "setType"
						},
						xAxisCaption: {
							changeMethod: "setXAxisCaption"
						},
						yAxisCaption: {
							changeMethod: "setYAxisCaption"
						},
						yAxis: {
							changeMethod: "setYAxis"
						},
						series: {
							changeMethod: "setSeries"
						},
						categories: {
							changeMethod: "setCategories"
						},
						currentPoint: {
							changeEvent: "changeCurrentPoint",
							changeMethod: "setCurrentPoint"
						},
						styleColor: {
							changeMethod: "setStyleColor"
						}
					};
					Ext.apply(chartBindConfig, bindConfig);
					return chartBindConfig;
				},

				/**
				 * Обрабатывает изменения цвета графика.
				 * @protected
				 * @virtual
				 * @param {String} styleColor Название стиля цвета графика.
				 */
				setStyleColor: function(styleColor) {
					if (this.styleColor === styleColor) {
						return;
					}
					this.styleColor = styleColor;
					if (this.allowRerender() && this.chart) {
						this.chart.series[0].update({
							color: styleColor
						});
					}
				},

				/**
				 * Обрабатывает изменения текущей точки.
				 * @protected
				 * @virtual
				 * @param {Object} currentPoint Новая текущая точка.
				 */
				setCurrentPoint: function(currentPoint) {
					if (this.currentPoint === currentPoint) {
						return;
					}
					this.currentPoint = currentPoint;
				},

				/**
				 * Обрабатывает изменения категорий.
				 * @protected
				 * @virtual
				 * @param {String[]} categories Новые категории.
				 */
				setCategories: function(categories) {
					if (this.categories === categories) {
						return;
					}
					this.categories = categories;
					if (this.allowRerender() && this.chart) {
						this.chart.xAxis[0].setCategories(categories);
					}
				},

				/**
				 * Обрабатывает изменения серий.
				 * @protected
				 * @virtual
				 * @param {Object[]} series Новые серии.
				 */
				setSeries: function(series) {
					if (this.series === series) {
						return;
					}
					this.series = series;
					this.reRender();
				},

				/**
				 * Устанавливает массив объектов настроек подписей осей Y.
				 * @protected
				 * @virtual
				 * @param {Object[]} Массив объектов настроек подписей осей Y.
				 */
				setYAxis: function(yAxis) {
					if (this.yAxis === yAxis) {
						return;
					}
					this.yAxis = yAxis;
				},

				/**
				 * Обрабатывает изменения подписи оси Y.
				 * @protected
				 * @virtual
				 * @param {string} yAxisCaption Новая подпись оси Y.
				 */
				setYAxisCaption: function(yAxisCaption) {
					if (this.yAxisCaption === yAxisCaption) {
						return;
					}
					this.yAxisCaption = yAxisCaption;
					if (this.allowRerender()) {
						this.chart.yAxis[0].update({ title: { text: yAxisCaption } });
					}
				},

				/**
				 * Обрабатывает изменения подписи оси X.
				 * @protected
				 * @virtual
				 * @param {string} xAxisCaption Новая подпись оси X.
				 */
				setXAxisCaption: function(xAxisCaption) {
					if (this.xAxisCaption === xAxisCaption) {
						return;
					}
					this.xAxisCaption = xAxisCaption;
					if (this.allowRerender()) {
						this.chart.xAxis[0].update({ title: { text: xAxisCaption } });
					}
				},

				/**
				 * Обрабатывает изменения типа графика.
				 * @protected
				 * @virtual
				 * @param {string} type Новый тип графика.
				 */
				setType: function(type) {
					if (this.type === type) {
						return;
					}
					this.type = type;
					if (this.allowRerender() && this.chart) {
						this.reRender();
					}
				},

				/**
				 * @inheritDoc Terrasoft.Component#reRender
				 * @overridden
				 */
				reRender: function() {
					if (this.allowRerender()) {
						this.callParent(arguments);
					}
				},

				/**
				 * Уничтожение график и его компонентов.
				 * @overridden
				 */
				onDestroy: function() {
					if (this.debounceWindowResize) {
						Ext.EventManager.removeListener(window, "resize", this.debounceWindowResize, this);
					}
					this.removeMenu();
					if (this.chart) {
						this.chart.destroy();
					}
					this.callParent(arguments);
				},

				/**
				 * Обновляет размер графика, по размеру контейнера.
				 * @protected
				 * @virtual
				 */
				updateSize: function() {
					if (!this.rendered || !this.chart) {
						return;
					}
					var chart = this.chart;
					chart.getChartSize();
					this.chart.setSize(chart.chartWidth, chart.chartHeight, true);
				},

				/**
				 * Устанавливает конфигурационный объект настроек для графика.
				 * @protected
				 * @virtual
				 * @param {Object} config Конфигурационный объект настроек.
				 */
				setChartConfig: function(config) {
					this.chartConfig = config;
					this.reRender();
				}

			});
		}
);