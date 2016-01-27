define("DashboardEnums", ["DashboardEnumsResources"], function(resources) {

	Ext.ns("Terrasoft.DashboardEnums");

	Terrasoft.DashboardEnums.WidgetType = {
		"Chart": {
			"view": {
				"moduleName": "ChartModule",
				"configurationMessage": "GetChartConfig"
			},
			"design": {
				"moduleName": "ConfigurationModuleV2",
				"configurationMessage": "GetModuleConfig",
				"resultMessage": "PostModuleConfig",
				"stateConfig": {
					"stateObj": {
						"designerSchemaName": "ChartDesigner"
					}
				}
			}
		},
		"Indicator": {
			"view": {
				"moduleName": "IndicatorModule",
				"configurationMessage": "GetIndicatorConfig"
			},
			"design": {
				"moduleName": "ConfigurationModuleV2",
				"configurationMessage": "GetModuleConfig",
				"resultMessage": "PostModuleConfig",
				"stateConfig": {
					"stateObj": {
						"designerSchemaName": "IndicatorDesigner"
					}
				}
			}
		},
		"Gauge": {
			"view": {
				"moduleName": "GaugeModule",
				"configurationMessage": "GetGaugeConfig"
			},
			"design": {
				"moduleName": "ConfigurationModuleV2",
				"configurationMessage": "GetModuleConfig",
				"resultMessage": "PostModuleConfig",
				"stateConfig": {
					"stateObj": {
						"designerSchemaName": "GaugeDesigner"
					}
				}
			}
		},
		"DashboardGrid": {
			"view": {
				"moduleName": "DashboardGridModule",
				"configurationMessage": "GetDashboardGridConfig"
			},
			"design": {
				"moduleName": "ConfigurationModuleV2",
				"configurationMessage": "GetModuleConfig",
				"resultMessage": "PostModuleConfig",
				"stateConfig": {
					"stateObj": {
						"designerSchemaName": "DashboardGridDesigner"
					}
				}
			}
		},
		"Module": {
			"view": {},
			"design": {
				"moduleName": "ConfigurationModuleV2",
				"configurationMessage": "GetModuleConfig",
				"resultMessage": "PostModuleConfig",
				"stateConfig": {
					"stateObj": {
						"designerSchemaName": "ModuleConfigEdit"
					}
				}
			}
		},
		"WebPage": {
			"view": {
				"moduleName": "WebPageModule",
				"configurationMessage": "GetWebPageConfig"
			},
			"design": {
				"moduleName": "ConfigurationModuleV2",
				"configurationMessage": "GetModuleConfig",
				"resultMessage": "PostModuleConfig",
				"stateConfig": {
					"stateObj": {
						"designerSchemaName": "WebPageDesigner"
					}
				}
			}
		}
	};

	/** @enum
	 *  Перечисление режимов представления в модуле графиков */
	Terrasoft.DashboardEnums.ChartDisplayMode = {
		/** Режим графика */
		CHART: 0,
		/** Режим списка */
		GRID: 1
	};

	/** @enum
	 *  Перечисление режимов отображения подписи оси графика
	 **/
	Terrasoft.DashboardEnums.ChartAxisPosition = {
		/** Не отображать */
		NONE: 0,
		/** Слева */
		LEFT: 1,
		/** Справа */
		RIGHT: 2
	};

	/** @enum
	 *  Перечисление типов сортироки графика
	 **/
	Terrasoft.DashboardEnums.ChartOrderBy = {
		/** По полую группировки */
		GROUP_BY_FIELD: "GroupByField",
		/** По результату выборки */
		CHART_ENTITY_COLUMN: "ChartEntityColumn"
	};

	/** @enum
	 *  Перечисление направлений сортироки графика
	 **/
	Terrasoft.DashboardEnums.ChartOrderDirection = {
		/** По возрастанию */
		ASCENDING: "Ascending",
		/** По убыванию */
		DESCENDING: "Descending"
	};

	/** @enum
	 * Набор цветов виджетов.
	 */
	Terrasoft.DashboardEnums.WidgetColorSet = [
	/** 0: Голубой */
		"#64b8df",
	/** 1: Зеленый */
		"#8ecb60",
	/** 2: Горчичный */
		"#e7cc61",
	/** 3: Оранжевый */
		"#eeaf4b",
	/** 4: Коралловый */
		"#ef7e63",
	/** 5: Фиолетовый */
		"#8e8eb7",
	/** 6: Синий */
		"#6483c3",
	/** 7: Бирюзовый */
		"#5bc8c4",
	/** 8: Темно-бирюзовый */
		"#4ca6a3"
	];

	/** @enum
	 * Объект соотношения стилей и цветов серий.
	 */
	Terrasoft.DashboardEnums.StyleColors = {
		/** Зеленый */
		"widget-green": Terrasoft.DashboardEnums.WidgetColorSet[1],
		/** Горчичный */
		"widget-mustard": Terrasoft.DashboardEnums.WidgetColorSet[2],
		/** Оранжевый */
		"widget-orange": Terrasoft.DashboardEnums.WidgetColorSet[3],
		/** Коралловый */
		"widget-coral": Terrasoft.DashboardEnums.WidgetColorSet[4],
		/** Фиолетовый */
		"widget-violet": Terrasoft.DashboardEnums.WidgetColorSet[5],
		/** Синий */
		"widget-navy": Terrasoft.DashboardEnums.WidgetColorSet[6],
		/** Голубой */
		"widget-blue": Terrasoft.DashboardEnums.WidgetColorSet[0],
		/** Бирюзовый */
		"widget-turquoise": Terrasoft.DashboardEnums.WidgetColorSet[7],
		/** Темно-бирюзовый */
		"widget-dark-turquoise": Terrasoft.DashboardEnums.WidgetColorSet[8]
	};

	/** @enum
	 * Перечисления стилей виджетов вместе с их заголовками и изображениями.
	 */
	Terrasoft.DashboardEnums.WidgetColor = {
		/** Зеленый */
		"widget-green": {
			value: "widget-green",
			displayValue: resources.localizableStrings.StyleGreen,
			imageConfig: resources.localizableImages.ImageGreen
		},
		/** Горчичный */
		"widget-mustard": {
			value: "widget-mustard",
			displayValue: resources.localizableStrings.StyleMustard,
			imageConfig: resources.localizableImages.ImageMustard
		},
		/** Оранжевый */
		"widget-orange": {
			value: "widget-orange",
			displayValue: resources.localizableStrings.StyleOrange,
			imageConfig: resources.localizableImages.ImageOrange
		},
		/** Коралловый */
		"widget-coral": {
			value: "widget-coral",
			displayValue: resources.localizableStrings.StyleCoral,
			imageConfig: resources.localizableImages.ImageCoral
		},
		/** Фиолетовый */
		"widget-violet": {
			value: "widget-violet",
			displayValue: resources.localizableStrings.StyleViolet,
			imageConfig: resources.localizableImages.ImageViolet
		},
		/** Синий */
		"widget-navy": {
			value: "widget-navy",
			displayValue: resources.localizableStrings.StyleNavy,
			imageConfig: resources.localizableImages.ImageNavy
		},
		/** Голубой */
		"widget-blue": {
			value: "widget-blue",
			displayValue: resources.localizableStrings.StyleBlue,
			imageConfig: resources.localizableImages.ImageBlue
		},
		/** Темно-бирюзовый */
		"widget-dark-turquoise": {
			value: "widget-dark-turquoise",
			displayValue: resources.localizableStrings.StyleDarkTurquoise,
			imageConfig: resources.localizableImages.ImageDarkTurquoise
		},
		/** Бирюзовый */
		"widget-turquoise": {
			value: "widget-turquoise",
			displayValue: resources.localizableStrings.StyleTurquoise,
			imageConfig: resources.localizableImages.ImageTurquoise
		}
	};
});
