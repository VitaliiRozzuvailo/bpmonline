/**
 * Модуль настроек по умолчанию для разных типов графиков в формате API Highсhart:
 * http://api.highcharts.com/highcharts.
 */
define('HighchartsTypedConfig', ['ext-base', 'terrasoft', 'ConfigurationEnumsResources'],
	function() {

		/**
		 * Стиль подписей осей по умолчанию.
		 * @type {Object}
		 */
		var defaultLabelStyle = {
			font: "13px 'Segoe UI'",
			color: "#999999"
		};

		/**
		 * Стиль заголовков осей по умолчанию.
		 * @type {Object}
		 */
		var defaultTitleStyle = {
			font: "13px 'Segoe UI Light', Verdana, sans-serif",
			color: "#444444"
		};

		/**
		 * Стиль подписей данных по умолчанию.
		 * @type {Object}
		 */
		var defaultDataLabelsStyle = {
			font: "14px 'Segoe UI'",
			color: "#444444"
		};

		/**
		 * Отступ заголовка по умолчанию.
		 * @type {Number}
		 */
		var defaultTitleMargin = 24;

		/**
		 * Цвет линии сетки графика по умолчанию.
		 * @type {String}
		 */
		var defaultGridLineColor = "#c3c3c3";

		/**
		 * Цвет линии графика по умолчанию.
		 * @type {String}
		 */
		var defaultLineColor = "#c8c8c8";

		/**
		 * Объект настроек по умолчанию для типа диаграммы: "Гистограма".
		 * @type {Object}
		 */
		var	bar = {
			plotOptions: {
				bar: {
					dataLabels: {
						enabled: true,
						x: 5,
						style: defaultDataLabelsStyle
					}
				}
			},
			xAxis: {
				title: {
					enabled: false
				},
				labels: {
					enabled: true,
					x: -10,
					style: defaultLabelStyle
				},
				offset: 0,
				lineWidth: 1,
				lineColor: defaultLineColor,
				minorGridLineWidth: 0,
				minorTickLength: 0,
				tickLength: 0
			},
			yAxis: {
				title: {
					enabled: false
				},
				labels: {
					enabled: false
				},
				minorTickLength: 0,
				minorGridLineWidth: 0,
				lineWidth: 0,
				lineColor: 'transparent',
				tickLength: 0,
				gridLineColor: 'transparent',
				gridLineWidth: 0,
				tickInterval: null,
				tickColor: '#C0D0E0'
			},
			legend: {
				enabled: false
			}
		};

		/**
		 * Объект настроек по умолчанию для типа диаграммы: "Колонка".
		 * @type {Object}
		 */
		var	column = {
			plotOptions: {
				column: {
					dataLabels: {
						enabled: true,
						y: -5,
						style: defaultDataLabelsStyle
					}
				}
			},
			title: {
				margin: 25
			},
			xAxis: {
				title: {
					enabled: false
				},
				labels: {
					enabled: true,
					y: 20,
					x: 0,
					style: defaultLabelStyle
				},
				offset: 0,
				lineWidth: 1,
				lineColor: defaultLineColor,
				minorGridLineWidth: 0,
				minorTickLength: 0,
				tickLength: 0
			},
			yAxis: {
				title: {
					enabled: false
				},
				labels: {
					enabled: false
				},
				minorTickLength: 0,
				minorGridLineWidth: 0,
				lineWidth: 0,
				lineColor: 'transparent',
				tickLength: 0,
				gridLineColor: 'transparent',
				gridLineWidth: 0,
				tickInterval: null,
				tickColor: '#C0D0E0'
			},
			legend: {
				enabled: false
			}
		};

		/**
		 * Объект настроек по умолчанию для типа диаграммы: "Сплайн".
		 * @type {Object}
		 */
		var	spline = {
			plotOptions: {
				spline: {
					dataLabels: {
						enabled: false
					}
				},
				series: {
					marker: {
						enabled: false
					}
				}
			},
			xAxis: {
				title: {
					enabled: true,
					style: defaultTitleStyle,
					margin: defaultTitleMargin
				},
				labels: {
					enabled: true,
					y: 20,
					x: 0,
					style: defaultLabelStyle
				},
				offset: 0,
				lineWidth: 1,
				lineColor: defaultLineColor,
				minorGridLineWidth: 0,
				minorTickLength: 0,
				tickLength: 0
			},
			yAxis: {
				title: {
					enabled: true,
					style: defaultTitleStyle,
					margin: defaultTitleMargin
				},
				labels: {
					enabled: true,
					y: 5,
					x: -10,
					style: defaultLabelStyle
				},
				offset: 0,
				minorTickLength: 0,
				minorGridLineWidth: 0,
				lineWidth: 1,
				lineColor: defaultLineColor,
				tickLength: 0,
				gridLineColor: defaultGridLineColor,
				gridLineWidth: 1,
				tickInterval: null,
				tickColor: '#C0D0E0'
			},
			legend: {
				enabled: false
			}
		};

		/**
		 * Объект настроек по умолчанию для типа диаграммы: "Линия".
		 * @type {Object}
		 */
		var	line = {
			plotOptions: {
				line: {
					dataLabels: {
						enabled: false
					}
				},
				series: {
					marker: {
						enabled: true,
						radius: 3.5,
						symbol: 'circle'
					}
				}
			},
			xAxis: {
				title: {
					enabled: true,
					style: defaultTitleStyle,
					margin: defaultTitleMargin
				},
				labels: {
					enabled: true,
					y: 20,
					x: 0,
					style: defaultLabelStyle
				},
				offset: 0,
				lineWidth: 1,
				lineColor: defaultLineColor,
				minorGridLineWidth: 0,
				minorTickLength: 0,
				tickLength: 0
			},
			yAxis: {
				title: {
					enabled: true,
					style: defaultTitleStyle,
					margin: defaultTitleMargin
				},
				labels: {
					enabled: true,
					y: 5,
					x: -10,
					style: defaultLabelStyle
				},
				offset: 0,
				minorTickLength: 0,
				minorGridLineWidth: 0,
				lineWidth: 1,
				lineColor: defaultLineColor,
				tickLength: 0,
				gridLineColor: defaultGridLineColor,
				gridLineWidth: 1,
				tickInterval: null,
				tickColor: '#C0D0E0'
			},
			legend: {
				enabled: false
			}
		};

		/**
		 * Объект настроек по умолчанию для типа диаграммы: "Точечная".
		 * @type {Object}
		 */
		var	scatter = {
			plotOptions: {
				scatter: {
					dataLabels: {
						enabled: false
					}
				},
				series: {
					marker: {
						enabled: true,
						radius: 3.5,
						symbol: 'circle'
					}
				}
			},
			xAxis: {
				title: {
					enabled: true,
					style: defaultTitleStyle,
					margin: defaultTitleMargin
				},
				labels: {
					enabled: true,
					y: 20,
					x: 0,
					style: defaultLabelStyle
				},
				offset: 0,
				lineWidth: 1,
				lineColor: defaultLineColor,
				minorGridLineWidth: 0,
				minorTickLength: 0,
				tickLength: 0
			},
			yAxis: {
				title: {
					enabled: true,
					style: defaultTitleStyle,
					margin: defaultTitleMargin
				},
				labels: {
					enabled: true,
					y: 5,
					x: -10,
					style: defaultLabelStyle
				},
				offset: 0,
				minorTickLength: 0,
				minorGridLineWidth: 0,
				lineWidth: 1,
				lineColor: defaultLineColor,
				tickLength: 0,
				gridLineColor: defaultGridLineColor,
				gridLineWidth: 1,
				tickInterval: null,
				tickColor: '#C0D0E0'
			},
			legend: {
				enabled: false
			}
		};

		/**
		 * Объект настроек по умолчанию для типа диаграммы: "С областями".
		 * @type {Object}
		 */
		var	areaspline = {
			plotOptions: {
				areaspline: {
					dataLabels: {
						enabled: false
					}
				},
				series: {
					marker: {
						enabled: false
					}
				}
			},
			xAxis: {
				title: {
					enabled: true,
					style: defaultTitleStyle,
					margin: defaultTitleMargin
				},
				labels: {
					enabled: true,
					y: 20,
					x: 0,
					style: defaultLabelStyle
				},
				offset: 0,
				lineWidth: 1,
				lineColor: defaultLineColor,
				minorGridLineWidth: 0,
				minorTickLength: 0,
				tickLength: 0
			},
			yAxis: {
				title: {
					enabled: true,
					style: defaultTitleStyle,
					margin: defaultTitleMargin
				},
				labels: {
					enabled: true,
					y: 5,
					x: -10,
					style: defaultLabelStyle
				},
				offset: 0,
				minorTickLength: 0,
				minorGridLineWidth: 0,
				lineWidth: 1,
				lineColor: defaultLineColor,
				gridLineWidth: 1,
				gridLineColor: defaultGridLineColor,
				tickInterval: null,
				tickColor: '#C0D0E0'
			},
			legend: {
				enabled: false
			}
		};

		/**
		 * Объект настроек по умолчанию для типа диаграммы: "Круговая".
		 * @type {Object}
		 */
		var	pie = {
			plotOptions: {
				pie: {
					dataLabels: {
						enabled: false,
						connectorWidth: 0.3,
						connectorColor: '#999999'
					},
					showInLegend: false,
					innerSize: "0%"
				},
				series: {
					marker: {
						enabled: true
					},
					dataLabels: {
						enabled: true,
						format: '{point.name} ({point.y})',
						style: {
							width: '100%',
							margin: "20px"
						}
					}
				}
			},
			xAxis: {
				title: {
					enabled: true,
					style: defaultTitleStyle,
					margin: defaultTitleMargin
				},
				labels: {
					enabled: true,
					y: 20,
					x: 0,
					style: {
						fontFamily: "Segoe UI",
						fontSize: '16px',
						color: '#444'
					}
				},
				showEmpty: false,
				offset: 0,
				lineWidth: 1,
				lineColor: defaultLineColor,
				minorGridLineWidth: 0,
				minorTickLength: 0,
				tickLength: 0
			},
			yAxis: {
				title: {
					enabled: true,
					style: defaultTitleStyle,
					margin: defaultTitleMargin
				},
				labels: {
					enabled: true,
					y: 5,
					x: 0,
					style: {
						fontFamily: "Segoe UI",
						fontSize: '16px',
						color: '#444'
					}
				},
				offset: 4,
				minorTickLength: 0,
				minorGridLineWidth: 0,
				lineWidth: 0,
				lineColor: 'transparent',
				tickLength: 0,
				gridLineColor: defaultGridLineColor,
				gridLineWidth: 1,
				tickInterval: null,
				tickColor: '#C0D0E0'
			},
			legend: {
				enabled: true,
				borderWidth: 0,
				backgroundColor: 'transparent',
				itemStyle: {
					fontFamily: "Segoe UI Light",
					fontSize: '13px',
					color: '#777777',
					borderRadius: 0
				}
			}
		};

		/**
		 * Объект настроек по умолчанию для типа диаграммы: "Измеритель".
		 * @type {Object}
		 */
		var gauge = {
			pane: {
				background: null,
				startAngle: -120,
				endAngle: 120
			},
			yAxis: {
				labels: {
					enabled: true,
					style: {
						fontSize: '18',
						fontFamily: 'Segoe UI Light'
					}
				},
				offset: 40,
				minorTickLength: 0,
				minorGridLineWidth: 0,
				lineWidth: 0,
				lineColor: 'transparent',
				tickLength: 0,
				gridLineColor: 'transparent',
				gridLineWidth: 0,
				tickInterval: 1,
				tickColor: '#666'
			},
			legend: {
				enabled: false
			}
		};

		/**
		 * Объект настроек по умолчанию для типа диаграммы: "Воронка".
		 * @type {Object}
		 */
		var funnel = {
			chart: {
				marginRight: 120
			},
			plotOptions: {
				series: {
					dataLabels: {
						enabled: true,
						format: '{point.name} ({point.y})',
						style: {
							width: '100%'
						}
					},
					neckWidth: '35%',
					neckHeight: '0%',
					width: '70%',
					height: '95%'
				}
			}
		};

		return {
			bar: bar,
			spline: spline,
			pie: pie,
			line: line,
			areaspline: areaspline,
			column: column,
			scatter: scatter,
			gauge: gauge,
			funnel: funnel
		};
	});