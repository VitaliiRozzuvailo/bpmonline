define("ChartModuleHelper", ["terrasoft", "ChartModuleHelperResources"],
function(Terrasoft, resources) {

	var localizableImages = resources.localizableImages;
	var localizableStrings = resources.localizableStrings;

	function getChartType(kind) {
		switch (kind) {
			case "0":
				return "area";
			case "1":
				return "line";
			case "2":
				return "bar";
			case "3":
				return "pie";
			case "4":
				return "column";
			case "5":
				return "scatter";
			default:
				return "line";
		}
	}

	function getAggregationType(name) {
		switch (name) {
			case "Count":
				return Terrasoft.AggregationType.COUNT;
			case "Max":
				return Terrasoft.AggregationType.MAX;
			case "Min":
				return Terrasoft.AggregationType.MIN;
			case "Avg":
				return Terrasoft.AggregationType.AVG;
			case "Sum":
				return Terrasoft.AggregationType.SUM;
		}
		return Terrasoft.AggregationType.NONE;
	}

	function getDatePartType(name) {
		switch (name) {
			case "Year":
				return Terrasoft.DatePartType.YEAR;
			case "Month":
				return Terrasoft.DatePartType.MONTH;
			case "Week":
				return Terrasoft.DatePartType.WEEK;
			case "Day":
				return Terrasoft.DatePartType.DAY;
			case "Hour":
				return Terrasoft.DatePartType.HOUR;
		}
		return Terrasoft.DatePartType.NONE;
	}

	var chartSeriesKind = {
		spline: {
			value: "spline",
			displayValue: localizableStrings.SplineCaption,
			imageConfig: localizableImages.SplineImage
		},
		line:  {
			value: "line",
			displayValue: localizableStrings.LineCaption,
			imageConfig: localizableImages.LineImage
		},
		bar:  {
			value: "bar",
			displayValue: localizableStrings.BarCaption,
			imageConfig: localizableImages.BarImage
		},
		pie:  {
			value: "pie",
			displayValue: localizableStrings.PieCaption,
			imageConfig: localizableImages.PieImage
		},
		areaspline:  {
			value: "areaspline",
			displayValue: localizableStrings.AreasplineCaption,
			imageConfig: localizableImages.AreasplineImage
		},
		funnel:  {
			value: "funnel",
			displayValue: localizableStrings.FunnelCaption,
			imageConfig: localizableImages.FunnelImage
		},
		column:  {
			value: "column",
			displayValue: localizableStrings.ColumnCaption,
			imageConfig: localizableImages.ColumnImage
		},
		scatter:  {
			value: "scatter",
			displayValue: localizableStrings.ScatterCaption,
			imageConfig: localizableImages.ScatterImage
		}
	};

	/**
	 * Возвращает запрос данных серии диаграммы.
	 * @protected
	 * @virtual
	 * @param {Object} config Объект параметров запроса.
	 * @param {String} config.entitySchemaName Название схемы запроса.
	 * @param {String} config.func Название функции агрегации.
	 * @param {Object} config.xAxis Объект параметров колонки оси Х.
	 * @param {String} config.xAxis.column Колонка оси Х.
	 * @param {Terrasoft.DataValueType} config.xAxis.dataValueType Тип данных колонки оси Х.
	 * @param {String[]} config.xAxis.dateTimeFormat Формат даты колонки оси Х.
	 * @param {String} config.yAxis.column Колонка оси У.
	 * @param {Object} config.filters Объект параметров фильтров.
	 * @param {Terrasoft.BaseFilter} config.filters.quickFilters Объект быстрого фильтра раздела.
	 * @param {Terrasoft.BaseFilter} config.filters.сhartFilters Объект фильтров графика.
	 * @param {Terrasoft.BaseFilter} config.filters.serializedFilters Объект сериализированного фильтра.
	 * @param {Terrasoft.BaseFilter} config.filters.drillDownFilters Объект фильтра drill down.
	 * @return {Terrasoft.EntitySchemaQuery} Запрос данных для графика.
	 */
	function getSeriesQuery(config) {
		var entitySchemaName = config.entitySchemaName;
		if (!entitySchemaName) {
			return null;
		}
		var entitySchemaQuery = config.entitySchemaQuery = Ext.create("Terrasoft.EntitySchemaQuery", {
			rootSchemaName: entitySchemaName
		});
		addGroupColumn(config);
		addAggregationColumn(config);
		addFilters(config);
		addOrderBy(config);
		return entitySchemaQuery;
	}

	/**
	 * Добавляет в запрос колонку для сортировки.
	 * @param {Object} config Объект параметров функции.
	 */
	function addOrderBy(config) {
		var entitySchemaQuery = config.entitySchemaQuery;
		var orderBy = config.orderBy;
		if (orderBy) {
			var orderByColumn = entitySchemaQuery.addColumn(orderBy.column);
			orderByColumn.orderDirection = orderBy.direction;
			orderByColumn.orderPosition = 0;
		}
	}

	/**
	 * Добавляет в запрос колоку групировки.
	 * @protected
	 * @virtual
	 * @param {Object} config Объект параметров функции.
	 * @param {Terrasoft.EntitySchemaQuery} config.entitySchemaQuery Запрос данных для графика.
	 * @param {String} config.xAxis.column Колонка оси Х.
	 * @param {String} config.xAxis.dataValueType Тип данных колонки оси Х.
	 * @param {String} config.xAxis.dateTimeFormat Формат даты колонки оси Х.
	 * @param {String} config.order.by Поле сортировки.
	 * @param {String} config.order.direction Направление сортировки.
	 */
	function addGroupColumn(config) {
		var groupByColumns = [];
		var entitySchemaQuery = config.entitySchemaQuery;
		var xAxisColumn = config.xAxis.column;
		var xAxisColumnDataValueType = config.xAxis.dataValueType;
		if (!Terrasoft.isDateDataValueType(xAxisColumnDataValueType)) {
			groupByColumns.push(entitySchemaQuery.addColumn(xAxisColumn, "xAxis"));
		} else {
			var datePartOrderSequence = ["Year", "Month", "Week", "Day", "Hour"];
			var xAxisColumnDateTimeFormat = config.xAxis.dateTimeFormat;
			Terrasoft.each(datePartOrderSequence, function(datePart) {
				if (Terrasoft.contains(xAxisColumnDateTimeFormat, datePart)) {
					groupByColumns.push(entitySchemaQuery.addDatePartFunctionColumn(xAxisColumn,
						getDatePartType(datePart), datePart));
				}
			}, this);
		}
	}

	/**
	 * Добавляет в запрос агрегирующую колоку.
	 * @protected
	 * @virtual
	 * @param {Object} config Объект параметров функции.
	 * @param {Terrasoft.EntitySchemaQuery} config.entitySchemaQuery Запрос данных для графика.
	 * @param {String} config.func Название функции агрегации.
	 * @param {String} config.yAxis.column Колонка оси У.
	 * @param {String} config.order.by Поле сортировки.
	 * @param {String} config.order.direction Направление сортировки.
	 */
	function addAggregationColumn(config) {
		var entitySchemaQuery = config.entitySchemaQuery;
		var aggregationType = config.func;
		var aggregationColumnName = config.yAxis.column;
		entitySchemaQuery.addAggregationSchemaColumn(aggregationColumnName, aggregationType, "yAxis");
	}

	/**
	 * Добавляет в запрос фильтры.
	 * @protected
	 * @virtual
	 * @param {Object} config Объект параметров функции.
	 * @param {Terrasoft.EntitySchemaQuery} config.entitySchemaQuery Запрос данных для графика.
	 * @param {String} config.xAxis.column Колонка оси X.
	 * @param {Terrasoft.BaseFilter} config.filters.quickFilters Объект быстрого фильтра раздела.
	 * @param {Terrasoft.BaseFilter} config.filters.сhartFilters Объект фильтров графика.
	 * @param {Terrasoft.BaseFilter} config.filters.serializedFilters Объект сериализированного фильтра.
	 * @param {Terrasoft.BaseFilter} config.filters.drillDownFilters Объект фильтра drill down.
	 */
	function addFilters(config) {
		var entitySchemaQuery = config.entitySchemaQuery;
		var filters = config.filters;
		var quickFilters = filters.quickFilters;
		if (quickFilters && !quickFilters.isEmpty()) {
			entitySchemaQuery.filters.addItem(quickFilters);
		}
		var сhartFilters = filters.сhartFilters;
		if (сhartFilters && !сhartFilters.isEmpty()) {
			entitySchemaQuery.filters.addItem(сhartFilters);
		}
		var serializedFilters = filters.serializedFilters;
		if (serializedFilters && !serializedFilters.isEmpty()) {
			entitySchemaQuery.filters.addItem(serializedFilters);
		}
		addDrillDownFilters(entitySchemaQuery, filters.drillDownFilters);
		var xAxisColumnIsNotNullFilter = Terrasoft.createColumnIsNotNullFilter(config.xAxis.column);
		entitySchemaQuery.filters.addItem(xAxisColumnIsNotNullFilter);
	}

	/**
	 * Добавляет в запрос фильтры разворачивания графика.
	 * @protected
	 * @virtual
	 * @param {Terrasoft.EntitySchemaQuery} entitySchemaQuery Запрос данных для графика.
	 */
	function addDrillDownFilters(entitySchemaQuery, filters) {
		Terrasoft.each(filters, function(filter, columnName) {
			if (!filter.datePart) {
				var filterValue = filter && (filter.value || filter);
				var esqfilter = Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, columnName, filterValue);
				entitySchemaQuery.filters.addItem(esqfilter);
			} else {
				Terrasoft.each(filter.datePart, function(value, name) {
					var esqfilter = Terrasoft.createDatePartColumnFilter(Terrasoft.ComparisonType.EQUAL,
							columnName, getDatePartType(name), value);
					entitySchemaQuery.filters.addItem(esqfilter);
				}, this);
			}
		}, this);
	}

	return {
		getChartType: getChartType,
		getAggregationType: getAggregationType,
		getDatePartType: getDatePartType,
		ChartSeriesKind: chartSeriesKind,
		getSeriesQuery: getSeriesQuery,
		addFilters: addFilters
	};

});
