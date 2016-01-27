define("ChartDrillDownProvider", ["ChartModuleHelper", "DashboardEnums", "EntityStructureHelperMixin"],
	function(chartModuleHelper) {

		/**
		 * @class Terrasoft.configuration.ChartDrillDownProvider
		 * Класс провайдера разворачивания графика.
		 */
		Ext.define("Terrasoft.configuration.ChartDrillDownProvider", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.ChartDrillDownProvider",

			mixins: {
				EntityStructureHelper: "Terrasoft.EntityStructureHelperMixin"
			},

			Ext: null,

			sandbox: null,

			/**
			 * Ограничение запроса данных графика.
			 * @type {Number}
			 */
			queryDataLimit: null,

			/**
			 * Признак игнорирования ограничение запроса данных графика.
			 * @type {Boolean}
			 */
			ignoreQueryDataLimit: false,

			/**
			 * Локализированые значения.
			 * @type {Object}
			 */
			localizableValues: null,

			/**
			 * Тег сообщения фильтрации.
			 * @type {String}
			 */
			filterMessageTag: null,

			/**
			 * Хранилище типов данных загруженных колонок.
			 * @type {Object}
			 */
			columnDataValueType: null,

			/**
			 * Хранилище заголовков загруженных колонок.
			 * @type {Object}
			 */
			columnsCaptions: null,

			/**
			 * Сериализированные фильтры.
			 * @type {String}
			 */
			serializedFilterData: null,

			/**
			 * История разворачивания данных графика.
			 * @type {Object[]}
			 */
			drillDownHistory: null,

			/**
			 * Текущее состояние всех параметров графика.
			 * @type {Object}
			 */
			historyState: null,

			constructor: function() {
				this.callParent(arguments);
				this.columnDataValueType = this.columnDataValueType || {};
				this.columnsCaptions = this.columnsCaptions || {};
				this.drillDownHistory = this.drillDownHistory || [];
				this.historyState = this.historyState || {};
				this.addEvents(
					"historyChanged"
				);
			},

			/**
			 * Возвращает entity схему по названию.
			 * @param {String} entitySchemaName Название entity схемы.
			 * @return {Terrasoft.BaseEntitySchema} Возвращает entity схему по названию.
			 */
			getEntitySchemaByName: function(entitySchemaName) {
				return Terrasoft[entitySchemaName];
			},

			/**
			 * Возвращает ключ колонки entity схемы.
			 * @param {String} entitySchemaName Название entity схемы.
			 * @param {String} columnPath Путь колонки.
			 * @return {String} Возвращает ключ колонки entity схемы.
			 */
			getEntitySchemaColumnKey: function(entitySchemaName, columnPath) {
				var keyTpl = "{0}_{1}";
				return Ext.String.format(keyTpl, entitySchemaName, columnPath);
			},

			/**
			 * Возвращает заголовок колонки entity схемы.
			 * @param {String} entitySchemaName Название entity схемы.
			 * @param {String} columnPath Путь колонки.
			 * @return {String} Возвращает заголовок колонки entity схемы.
			 */
			getEntitySchemaColumnCaption: function(entitySchemaName, columnPath) {
				var columnKey = this.getEntitySchemaColumnKey(entitySchemaName, columnPath);
				return this.columnsCaptions[columnKey];
			},

			/**
			 * Возвращает тип данных колонки entity схемы.
			 * @param {String} entitySchemaName Название entity схемы.
			 * @param {String} columnPath Путь колонки.
			 * @return {Terrasoft.DataValueType} Возвращает тип данных колонки entity схемы.
			 */
			getEntitySchemaColumnDataValueType: function(entitySchemaName, columnPath) {
				var columnKey = this.getEntitySchemaColumnKey(entitySchemaName, columnPath);
				return this.columnDataValueType[columnKey];
			},

			/**
			 * Обрабатывает результат выбора колонки.
			 * @param {Object} selectedColumnInfo Объект конфигурации выбранной колонки.
			 * @param {Object} categoryItem Элемент по которому происходит разворачивание.
			 */
			onStructureExplorerResult: function(selectedColumnInfo, categoryItem) {
				this.addItemFilter(categoryItem);
				var entitySchemaName = categoryItem.entitySchemaName;
				var xAxisColumnPath = selectedColumnInfo.leftExpressionColumnPath;
				this.changeCurrentHistory({
					xAxisColumn: xAxisColumnPath,
					entitySchemaName: entitySchemaName,
					yAxis: this.yAxis,
					YAxisCaption: "",
					categoryItem: categoryItem
				});
				var entitySchemaColumnKey = this.getEntitySchemaColumnKey(entitySchemaName, xAxisColumnPath);
				this.columnDataValueType[entitySchemaColumnKey] = selectedColumnInfo.dataValueType;
				this.columnsCaptions[entitySchemaColumnKey] = selectedColumnInfo.leftExpressionCaption;
			},

			/**
			 * Возвращает путь колонки X выбранного элемента графика.
			 * @param {Object} categoryItem Элемент по которому происходит разворачивание.
			 * @return {String} Возвращает путь колонки X выбранного элемента графика.
			 */
			getCategoryItemXAxisColumnPath: function(categoryItem) {
				var rowConfig = Terrasoft.deepClone(categoryItem.rowConfig);
				delete rowConfig.yAxis;
				var columnNames = Object.keys(rowConfig);
				var xAxisColumnPath = rowConfig[columnNames[0]].columnPath;
				return xAxisColumnPath;
			},

			/**
			 * Возвращает путь колонки Y выбранного элемента графика.
			 * @param {Object} categoryItem Элемент по которому происходит разворачивание.
			 * @return {String} Возвращает путь колонки X выбранного элемента графика.
			 */
			getCategoryItemYAxisColumnPath: function(categoryItem) {
				var rowConfig = Terrasoft.deepClone(categoryItem.rowConfig);
				return rowConfig.yAxis.columnPath;
			},

			/**
			 * Добавляет фильтрацию по выбраному элементу.
			 * @private
			 * @param {Object} categoryItem Элемент по которому происходит разворачивание.
			 */
			addItemFilter: function(categoryItem) {
				var xAxisColumnPath = this.getCategoryItemXAxisColumnPath(categoryItem);
				var dataValueType = this.getEntitySchemaColumnDataValueType(categoryItem.entitySchemaName, xAxisColumnPath);
				var categoryValue = null;
				if (!Terrasoft.isDateDataValueType(dataValueType)) {
					categoryValue = categoryItem.get("xAxis");
				} else {
					var categoryItems = this.getDateTimeFormat();
					categoryValue = {
						datePart: {}
					};
					Terrasoft.each(categoryItems, function(category) {
						categoryValue.datePart[category] = categoryItem.get(category);
					}, this);
				}
				var filter = {};
				filter[xAxisColumnPath] = categoryValue;
				this.pushHistory({
					filter: filter
				});
			},

			/**
			 * Сворачивает график.
			 * @virtual
			 */
			drillUp: function() {
				if (this.drillDownHistory.length === 1) {
					return;
				}
				this.drillDownHistory.pop();
				this.updateHistoryState();
				this.fireEvent("historyChanged");
			},

			/**
			 * Отменяет всю историю, возвращает график к исходному состоянию.
			 * @virtual
			 */
			cancelDrill: function() {
				if (this.drillDownHistory.length === 1) {
					return;
				}
				this.drillDownHistory = this.drillDownHistory.splice(0, 1);
				this.updateHistoryState();
				this.fireEvent("historyChanged");
			},

			/**
			 * Добавляет состояние в историю.
			 * @param {Object} history Объект состояния истории.
			 */
			pushHistory: function(history) {
				this.drillDownHistory.push(history);
				Ext.apply(this.historyState, history);
				this.fireEvent("historyChanged");
			},

			/**
			 * Изменяет последний шаг в истории.
			 * @param {object} history Объект состояния истории.
			 */
			changeCurrentHistory: function(history) {
				var currentStateIndex = this.drillDownHistory.length - 1;
				Ext.apply(this.drillDownHistory[currentStateIndex], history);
				Ext.apply(this.historyState, history);
				this.fireEvent("historyChanged");
			},

			/**
			 * Возвращает текущий тип представления.
			 * @return {Terrasoft.DashboardEnums.ChartDisplayMode} Возвращает текущий тип представления.
			 */
			getDisplayMode: function() {
				return this.historyState.displayMode;
			},

			/**
			 * Возвращает текущую колонку связи с разделом.
			 * @return {String} Возвращает текущую колонку связи с разделом.
			 */
			getSectionBindingColumn: function() {
				return this.historyState.sectionBindingColumn;
			},

			/**
			 * Возвращает текущую колонку для оси X.
			 * @return {String} Возвращает текущую колонку для оси X.
			 */
			getXAxisColumn: function() {
				return this.historyState.xAxisColumn;
			},

			/**
			 * Возвращает массив серий графика.
			 * @return {Object[]} Возвращает массив серий графика.
			 */
			getSeriesConfig: function() {
				return this.historyState.seriesConfig;
			},

			/**
			 * Возвращает путь текущей колонки для оси Y.
			 * @return {String} Возвращает текущую колонку для оси Y.
			 */
			getYAxisColumn: function() {
				return this.historyState.yAxisColumn || "Id";
			},

			/**
			 * Возвращает объект элемента категории фрагмента графика.
			 * @return {Object} Возвращает объект элемента категории фрагмента графика.
			 */
			getCategoryItem: function() {
				return this.historyState.categoryItem;
			},

			/**
			 * Возвращает формат даты.
			 * @return {String[]} Возвращает формат даты.
			 */
			getDateTimeFormat: function() {
				return this.historyState.dateTimeFormat.split(";");
			},

			/**
			 * Возвращает название схемы графика.
			 * @return {String} Возвращает название схемы графика.
			 */
			getEntitySchemaName: function() {
				return this.historyState.entitySchemaName;
			},

			/**
			 * Возвращает заголовок колонки Y.
			 * @return {String} Возвращает название схемы графика.
			 */
			getYAxisCation: function() {
				return this.historyState.YAxisCaption;
			},

			/**
			 * Возвращает массив объектов настроек подписей оси Y.
			 * @return {Object[]} Возвращает массив объектов настроек подписей оси Y.
			 */
			getYAxisConfig: function() {
				return this.historyState.yAxisConfig;
			},

			/**
			 * Возвращает название стиля графика.
			 * @return {String} Возвращает название стиля графика.
			 */
			getStyleColor: function() {
				return this.historyState.styleColor;
			},

			/**
			 * Возвращает текущую колонку сортировки и индекс серии по результату выборки которой будет проводиться
			 * сортировка.
			 * @return {Object} Возвращает текущую колонку сортировки и индекс серии по результату выборки которой будет
			 * проводиться сортировка.
			 */
			getOrderBy: function() {
				var result = {
					orderBy: "",
					seriesOrderIndex: 0
				};
				var orderBy = this.historyState.orderBy;
				if (orderBy) {
					var splittedValue = orderBy.split(":");
					result.orderBy = splittedValue[0];
					result.seriesOrderIndex = parseInt(splittedValue[1], 10) || 0;
				}
				return result;
			},

			/**
			 * Признак сортировки по колонке группировки.
			 * @return {Boolean} Признак сортировки по колонке группировки.
			 */
			isOrderedByGroupColumn: function() {
				var orderBy = this.getOrderBy();
				return (orderBy.orderBy === Terrasoft.DashboardEnums.ChartOrderBy.GROUP_BY_FIELD);
			},

			/**
			 * Возвращает текущий порядок сортировки.
			 * @return {String} Возвращает текущий порядок сортировки.
			 */
			getOrderDirection: function() {
				return this.historyState.orderDirection;
			},

			/**
			 * Возвращает индекс серии по результату выборки которой необходимо провести сортировку.
			 * @virtual
			 * @return {Number} Возвращает индекс серии по результату выборки которой необходимо провести сортировку.
			 */
			getSeriesOrderIndex: function() {
				var result = 0;
				if (this.drillDownHistory.length === 1) {
					var orderBy = this.getOrderBy();
					result = orderBy.seriesOrderIndex;
				}
				return result;
			},

			/**
			 * Возвращает текущий тип графика.
			 * @return {String} Возвращает текущий тип графика.
			 */
			getSeriesKind: function() {
				return this.historyState.seriesKind;
			},

			/**
			 * Возвращает текущий тип агрегации.
			 * @return {String} Возвращает текущий тип агрегации.
			 */
			getAggregationType: function() {
				var aggregationTypeValue = this.historyState.func;
				return (Ext.isNumber(aggregationTypeValue) || aggregationTypeValue.match(/\d+/g))
					? aggregationTypeValue
					: Terrasoft.AggregationType[aggregationTypeValue.toUpperCase()];
			},

			/**
			 * Генерирует объект фильтров по колонкам.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект фильтров по колонкам.
			 */
			getDrillDownFilters: function() {
				var filters = {};
				Terrasoft.each(this.drillDownHistory, function(history) {
					Ext.apply(filters, history.filter);
				}, this);
				return filters;
			},

			/**
			 * Обновляет текущее состояние с учетом истории.
			 * @protected
			 * @virtual
			 */
			updateHistoryState: function() {
				this.historyState = {};
				Terrasoft.each(this.drillDownHistory, function(historyState) {
					Ext.apply(this.historyState, historyState);
				}, this);
			},

			/**
			 * Обработчик разворачивания в графике.
			 * @virtual
			 * @param {Object} categoryItem Элемент по которому происходит разворачивание.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			drillDownChart: function(categoryItem, callback, scope) {
				Terrasoft.StructureExplorerUtilities.open({
					scope: this,
					handlerMethod: function(selectedColumnInfo) {
						this.onStructureExplorerResult(selectedColumnInfo, categoryItem);
						callback.call(scope);
					},
					moduleConfig: {
						useBackwards: false,
						schemaName: categoryItem.entitySchemaName
					}
				});
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
			 * Возвращает группу быстрых фильтров.
			 * @virtual
			 * @param {String} sectionBindingColumn Путь колонки связи с разделом
			 * @return {Terrasoft.FilterGroup} Возвращает группу быстрых фильтров.
			 */
			getQuickFilters: function(sectionBindingColumn) {
				sectionBindingColumn = sectionBindingColumn || this.getSectionBindingColumn();
				if (Ext.isEmpty(sectionBindingColumn)) {
					return this.Ext.create("Terrasoft.FilterGroup");
				}
				sectionBindingColumn = sectionBindingColumn.replace(/\.[iI]d$|^[iI]d$/, "");
				var quickFilter = this.sandbox.publish("GetFiltersCollection", this.filterMessageTag || null);
				if (quickFilter && !quickFilter.isEmpty() && !Ext.isEmpty(sectionBindingColumn)) {
					this.updateModuleFilter(quickFilter, sectionBindingColumn);
				}
				return quickFilter || this.Ext.create("Terrasoft.FilterGroup");
			},

			/**
			 * Возвращает группу фильтров графика.
			 * @virtual
			 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров графика.
			 */
			getChartFilters: function() {
				var chartFilter = this.sandbox.publish("GetChartFilter", this.sandbox.id, [this.sandbox.id]);
				return chartFilter;
			},

			/**
			 * Возвращает группу фильтров графика.
			 * @virtual
			 * @protected
			 * @param {String} serializedFilterData Сериализированные данныке фильтра
			 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров графика.
			 */
			getSerializedFilters: function(serializedFilterData) {
				var filters = serializedFilterData || this.serializedFilterData;
				if (filters) {
					if (Ext.isString(filters)) {
						filters = Terrasoft.deserialize(filters);
					}
				}
				return filters;
			},

			/**
			 * Добавляет в запрос фильтры.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.EntitySchemaQuery} entitySchemaQuery Запрос данных для графика.
			 */
			addFilters: function(entitySchemaQuery) {
				var categoryItem = this.getCategoryItem();
				var serializedFilters, xAxis;
				if (categoryItem) {
					serializedFilters = categoryItem.serializedFilters;
					xAxis = categoryItem.xAxis;
				} else {
					serializedFilters = this.getSerializedFilters();
					xAxis = {
						column: this.getXAxisColumn()
					};
				}
				var addFiltersConfig = {
					entitySchemaQuery: entitySchemaQuery,
					filters: {
						quickFilters: this.getQuickFilters(),
						chartFilters: this.getChartFilters(),
						serializedFilters: serializedFilters,
						drillDownFilters: this.getDrillDownFilters()
					},
					xAxis: xAxis
				};
				chartModuleHelper.addFilters(addFiltersConfig);
			},

			initColumnsInfo: function(config, callback, scope) {
				var callParameters = [];
				Terrasoft.each(config, function(configItem) {
					var entitySchemaName = configItem.entitySchemaName;
					var columnPath = configItem.columnPath;
					var columnKey = this.getEntitySchemaColumnKey(entitySchemaName, columnPath);
					var callParemeter = {
						schemaName: configItem.entitySchemaName,
						columnPath: configItem.columnPath,
						key: columnKey
					};
					callParameters.push(callParemeter);
				}, this);
				this.getColumnPathCaption(Ext.JSON.encode(callParameters),	function(responseObject) {
					if (responseObject && responseObject[0]) {
						Terrasoft.each(responseObject, function(responseItem) {
							var storeKey = responseItem.key;
							this.columnDataValueType[storeKey] = responseItem.dataValueType;
							this.columnsCaptions[storeKey] = responseItem.columnCaption;
						}, this);
					}
					callback.call(scope);
				}, this);
			},

			/**
			 * Генерирует массив заголовков для уровней вложености графика.
			 * @return {String[]} Возвращает массив заголовков для уровней вложености графика.
			 */
			getDrillDownCaptions: function() {
				var result = [];
				var filters = this.getDrillDownFilters();
				var entitySchemaName = this.getEntitySchemaName();
				Terrasoft.each(filters, function(filterValue, filterColumn) {
					var columnCaption = this.getEntitySchemaColumnCaption(entitySchemaName, filterColumn);
					var columnValue = filterValue;
					if (filterValue && filterValue.datePart) {
						columnValue = [];
						Terrasoft.each(filterValue.datePart, function(value) { columnValue.push(value); }, this);
						columnValue = columnValue.join("-");
					}
					var displayValue = columnValue.displayValue || columnValue;
					displayValue = this.prepareDisplayValue(displayValue);
					result.push({
						caption: columnCaption,
						value: displayValue
					});
				}, this);
				return result;
			},

			/**
			 * Запрашивает данные для графика по текущему состоянию.
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			getChartSeriesData: function(callback, scope) {
				var seriesData = [];
				this.yAxis = [];
				Terrasoft.chain(
					function(next) {
						var initColumnsInfoConfig = [{
							columnPath: this.getXAxisColumn(),
							entitySchemaName: this.getEntitySchemaName()
						}, {
							columnPath: this.getYAxisColumn(),
							entitySchemaName: this.getEntitySchemaName()
						}];
						if (this.drillDownHistory.length === 1) {
							var seriesConfig = this.getSeriesConfig();
							Terrasoft.each(seriesConfig, function(seriesConfigItem) {
								var seriesConfigItemEntitySchemaName = seriesConfigItem.schemaName;
								initColumnsInfoConfig.push({
									columnPath: seriesConfigItem.xAxisColumn,
									entitySchemaName: seriesConfigItemEntitySchemaName
								});
								initColumnsInfoConfig.push({
									columnPath: seriesConfigItem.yAxisColumn,
									entitySchemaName: seriesConfigItemEntitySchemaName
								});
							}, this);
						}
						this.initColumnsInfo(initColumnsInfoConfig, function() {
							next();
						}, this);
					},
					function(next) {
						this.getMainSeriesData(function(series) {
							Ext.Array.insert(seriesData, seriesData.length, series);
							next();
						}, this);
					},
					function(next) {
						this.getAdditionalSeriesData(function(series) {
							Ext.Array.insert(seriesData, seriesData.length, series);
							next();
						}, this);
					},
					function() {
						seriesData = this.convertSeriesDataToSingleCategory(seriesData);
						callback.call(scope, seriesData, this.yAxis);
					},
					this
				);
			},

			/**
			 * Возвращает число для сортировки данных типа дата/время.
			 * @virtual
			 * @param {Object} datePartValues Объект содержащий значения частей даты/времени.
			 * @return {Number}  Возвращает число для сортировки данных типа дата/время.
			 */
			getDateTimeOrderValue: function(datePartValues) {
				var orderValue = new Date(0);
				if (datePartValues.Year) {
					orderValue.setYear(datePartValues.Year);
				}
				if (datePartValues.Month) {
					orderValue.setMonth(datePartValues.Month);
				}
				if (datePartValues.Week) {
					orderValue = Ext.Date.add(orderValue, Ext.Date.DAY, (datePartValues.Week) * 7);
				}
				if (datePartValues.Day) {
					orderValue.setDate(datePartValues.Day);
				}
				orderValue = orderValue.setHours(datePartValues.Hour || 0);
				return orderValue;
			},

			/**
			 * Возвращает массив объединенных категорий всех серий.
			 * @virtual
			 * @param {Object[]} seriesData Первичные данные серий.
			 * @return {Object[]} Возвращает массив объединенных категорий всех серий.
			 */
			getUnitedCategories: function(seriesData) {
				var categoryItems = [];
				var existingValues = [];
				Terrasoft.each(seriesData, function(seriesDataItem) {
					var seriesCategoryItems = seriesDataItem.data.map(function(item) {
						var orderValue = item.name;
						if (this.isOrderedByGroupColumn()) {
							var categoryItem = item.categoryItem;
							var categoryItemValues = Terrasoft.deepClone(categoryItem.values);
							if (!categoryItemValues.hasOwnProperty("xAxis")) {
								orderValue = this.getDateTimeOrderValue(categoryItemValues);
							}
						}
						return {
							value: item.value,
							name: item.name,
							orderValue: orderValue
						};
					}, this);
					Terrasoft.each(seriesCategoryItems, function(seriesCategoryItem) {
						if (!Terrasoft.contains(existingValues, seriesCategoryItem.value)) {
							if (this.isOrderedByGroupColumn()) {
								var insertInto = Terrasoft.sortedIndex(categoryItems, seriesCategoryItem, function(item) {
									var orderValue = item.orderValue;
									return (Ext.isNumber(orderValue)) ? orderValue : orderValue.toLowerCase();
								});
								categoryItems = Ext.Array.insert(categoryItems, insertInto, [seriesCategoryItem]);
							} else {
								categoryItems.push(seriesCategoryItem);
							}
							existingValues.push(seriesCategoryItem.value);
						}
					}, this);
				}, this);
				var orderDirection = this.getOrderDirection();
				if (orderDirection === Terrasoft.DashboardEnums.ChartOrderDirection.DESCENDING) {
					categoryItems = categoryItems.reverse();
				}
				return categoryItems;
			},

			/**
			 * Выполняет сортироку данных серий по результату выборки серии.
			 * @virtual
			 * @param {Object[]} seriesData Первинные данные серий.
			 * @return {Object[]} Возвращает отсортированные данные серий по результату выборки серии.
			 */
			sortSeriesData: function(seriesData) {
				var result = [];
				if (this.isOrderedByChartEntityColumn()) {
					var orderDirectionIndex =
						(this.getOrderDirection() === Terrasoft.DashboardEnums.ChartOrderDirection.ASCENDING) ? 1 : -1;
					var seriesOrderIndex = this.getSeriesOrderIndex();
					var orderSeriesItem = seriesData[seriesOrderIndex];
					var orderSeriesItemData = orderSeriesItem.data;
					orderSeriesItemData = Ext.Array.sort(orderSeriesItemData, function(first, second) {
						return (first.y > second.y) ? orderDirectionIndex : (orderDirectionIndex * -1);
					});
					Terrasoft.each(orderSeriesItemData, function(item, index) {
						item.x = index;
					});
					result[seriesOrderIndex] = orderSeriesItem;
					Terrasoft.each(seriesData, function(seriesItem, seriesIndex) {
						var seriesItemData = seriesItem.data;
						if (seriesIndex !== seriesOrderIndex) {
							result[seriesIndex] = seriesItem;
							var orderedData = [];
							Terrasoft.each(orderSeriesItemData, function(orderDataItem) {
								var value = orderDataItem.value;
								var searchDataItem = Ext.Array.findBy(seriesItemData, function(item) {
									return item.value === value;
								}, this);
								orderedData.push(searchDataItem);
								searchDataItem.x = orderedData.length - 1;
							}, this);
							result[seriesIndex].data = orderedData;
						}
					}, this);
				} else {
					result = seriesData;
				}
				return result;
			},

			/**
			 * Переформировует массив данных с учетом переданных категорий.
			 * @virtual
			 * @protected
			 * @param {Object[]} data Исходный массив данных.
			 * @param {Object[]} categories Массив категорий.
			 * @return {Object[]} Переформированный массив данных.
			 */
			mapSerieDataToCategories: function(data, categories) {
				var dataByCategories = {};
				Terrasoft.each(data, function(dataItem) {
					dataByCategories[dataItem.value] = dataItem;
				}, this);
				var dataItemTpl = data[0];
				return categories.map(function(categoryItem, categoryIndex) {
					var categoryValue = categoryItem.value;
					var categoryName = categoryItem.name;
					var dataItem = dataByCategories[categoryValue];
					if (dataItem) {
						dataItem.x = categoryIndex;
					} else {
						dataItem = Ext.apply({}, {
							name: categoryName,
							value: categoryValue,
							y: 0,
							x: categoryIndex
						}, dataItemTpl);
					}
					return dataItem;
				}, this);
			},

			/**
			 * Приводит данные серии к единой шкале категорий.
			 * @virtual
			 * @param {Object[]} seriesData Первинные данные серий.
			 * @return {Object[]} Преобазованные данные серий.
			 */
			convertSeriesDataToSingleCategory: function(seriesData) {
				var categoryItems = this.getUnitedCategories(seriesData);
				for (var i = 0, iterations = seriesData.length; i < iterations; i++) {
					var data = seriesData[i].data;
					seriesData[i].data = this.mapSerieDataToCategories(data, categoryItems);
				}
				return this.sortSeriesData(seriesData);
			},

			/**
			 * Возвращает объект настройки подписи оси Y для серии.
			 * @virtual
			 * @return {Object} Возвращает объект настройки подписи оси Y для серии.
			 */
			getSeriesYAxis: function(seriesConfig) {
				var yAxisConfig = seriesConfig.yAxisConfig || {};
				var textStyle =	{
					"color": Terrasoft.DashboardEnums.StyleColors[seriesConfig.styleColor] || "#999999",
					"font-family": "Segoe UI",
					"font-size": "13px",
					"line-height": "14px",
					"width": "100%",
					"fill": "#999999"
				};
				var yAxisItemTpl = {
					gridLineWidth: 0,
					title: {
						text: seriesConfig.YAxisCaption || "",
						style: textStyle
					},
					labels: {
						rotation: 0,
						style: textStyle
					},
					min: yAxisConfig.min,
					max: yAxisConfig.max,
					opposite: yAxisConfig.position === Terrasoft.DashboardEnums.ChartAxisPosition.RIGHT
				};
				return yAxisItemTpl;
			},

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
			getSeriesQuery: function(config) {
				var esq = chartModuleHelper.getSeriesQuery(config);
				this.applyQueryDataLimit(esq);
				return esq;
			},

			/**
			 * Возвращает признак необходимости проверки ограничения запроса данных графика.
			 * @return {Boolean} Признак необходимости проверки ограничения запроса данных графика.
			 */
			checkQueryDataLimit: function() {
				return !this.ignoreQueryDataLimit && this.queryDataLimit > -1;
			},

			/**
			 * Применяет ограничение запроса данных графика.
			 * @protected
			 * @virtual
			 */
			applyQueryDataLimit: function(esq) {
				esq.rowCount = this.checkQueryDataLimit() ? this.queryDataLimit + 1 : -1;
			},

			/**
			 * Возвращает признак превышения ограничения запроса данных графика.
			 * @protected
			 * @virtual
			 * @return {Boolean} Признак превышения ограничения запроса данных графика.
			 */
			excessQueryDataLimit: function(seriesDataCount) {
				return this.checkQueryDataLimit() ? this.queryDataLimit < seriesDataCount : false;
			},

			/**
			 * Возвращает массив функций для получения данных серии.
			 * @virtual
			 * @param {Object} seriesQueryConfig Объект параметров запроса серии.
			 * @param {Object} seriesConfig Объект параметров серии.
			 * @param {Object[]} resultSeriesData Массив данных серий диаграммы.
			 * @param {Object} yAxis Массив настроек данных подписей оси У диаграммы.
			 * @return {Function[]} Возвращает массив функций для получения данных серии.
			 */
			getSeriesDataChain: function(seriesQueryConfig, seriesConfig, resultSeriesData, yAxis) {
				var chain = [];
				var schemaName = seriesQueryConfig.entitySchemaName;
				var getEntitySchema = function(next) {
					this.getEntitySchema(schemaName, function() {
						next();
					}, this);
				};
				chain.push(getEntitySchema);
				var getSeriesDataFunction = function(next) {
					var query = this.getSeriesQuery(seriesQueryConfig);
					query.getEntityCollection(function(response) {
						var entitySchema = this.getEntitySchemaByName(seriesConfig.schemaName);
						var seriesData = {
							name: seriesConfig.YAxisCaption || entitySchema.caption,
							data: this.prepareSeriesPoint(response, seriesQueryConfig)
						};
						seriesData.excessQueryDataLimit = this.excessQueryDataLimit(seriesData.data.length);
						if (seriesConfig.yAxisConfig &&
							seriesConfig.yAxisConfig.position !== Terrasoft.DashboardEnums.ChartAxisPosition.NONE) {
							seriesData.yAxis = yAxis.length;
							yAxis.push(this.getSeriesYAxis(seriesConfig));
						}
						if (seriesConfig.type) {
							seriesData.type = seriesConfig.type;
						}
						if (seriesConfig.styleColor) {
							var color = Terrasoft.DashboardEnums.StyleColors[seriesConfig.styleColor];
							seriesData._colorIndex = Terrasoft.DashboardEnums.WidgetColorSet.indexOf(color);
						}
						resultSeriesData.push(seriesData);
						next();
					}, this);
				};
				chain.push(getSeriesDataFunction);
				return chain;
			},

			/**
			 * Признак сортировки по результату выборки.
			 * @return {Boolean} Признак сортировки по результату выборки.
			 */
			isOrderedByChartEntityColumn: function() {
				var orderBy = this.getOrderBy();
				return (orderBy.orderBy === Terrasoft.DashboardEnums.ChartOrderBy.CHART_ENTITY_COLUMN);
			},

			/**
			 * Настройки сортировки.
			 * @return {Object} Настройки сортировки.
			 */
			getOrderByConfig: function() {
				var orderBy = this.getOrderBy();
				var orderByValue = orderBy.orderBy;
				if (orderByValue === Terrasoft.DashboardEnums.ChartOrderBy.GROUP_BY_FIELD ||
					orderByValue === Terrasoft.DashboardEnums.ChartOrderBy.CHART_ENTITY_COLUMN) {
					return null;
				}
				var direction = this.getOrderDirection();
				if (direction === Terrasoft.DashboardEnums.ChartOrderDirection.ASCENDING) {
					direction = Terrasoft.OrderDirection.ASC;
				} else if (direction === Terrasoft.DashboardEnums.ChartOrderDirection.DESCENDING) {
					direction = Terrasoft.OrderDirection.DESC;
				} else {
					direction = Terrasoft.OrderDirection.NONE;
				}
				return {
					column: this.historyState.orderBy,
					direction: direction
				};
			},

			/**
			 * Возвращает массив данных основной серии.
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст выполнения функции обратного вызова.
			 * @return {Object[]} Возвращает массив данных основной серии.
			 */
			getMainSeriesData: function(callback, scope) {
				var xAxisColumn = this.getXAxisColumn();
				var yAxisColumn = this.getYAxisColumn();
				var orderBy = this.getOrderByConfig();
				var entitySchemaName = this.getEntitySchemaName();
				var categoryItem = this.getCategoryItem();
				var serializedFilters = (categoryItem) ? categoryItem.serializedFilters : null;
				var getSeriesQueryConfig = {
					entitySchemaName: entitySchemaName,
					func: this.getAggregationType(),
					xAxis: {
						column: xAxisColumn,
						dataValueType: this.getEntitySchemaColumnDataValueType(entitySchemaName, xAxisColumn),
						dateTimeFormat: this.getDateTimeFormat()
					},
					yAxis: {
						column: yAxisColumn
					},
					filters: {
						quickFilters: this.getQuickFilters(),
						chartFilters: this.getChartFilters(),
						serializedFilters: serializedFilters || this.getSerializedFilters(),
						drillDownFilters: this.getDrillDownFilters()
					},
					orderBy: orderBy
				};
				var seriesConfig = {
					schemaName: entitySchemaName,
					YAxisCaption: this.getYAxisCation(),
					yAxisConfig: this.getYAxisConfig(),
					styleColor: this.getStyleColor(),
					xAxisColumn: xAxisColumn
				};
				var resultSeriesData = [];
				var chainParameters = this.getSeriesDataChain(getSeriesQueryConfig, seriesConfig, resultSeriesData,
					this.yAxis);
				chainParameters.push(function() {
					callback.call(scope, resultSeriesData);
				});
				chainParameters.push(this);
				Terrasoft.chain.apply(this, chainParameters);
			},

			/**
			 * Возвращает массив данных дополнительных серий.
			 * @virtual
			 * @return {Object[]} Возвращает массив данных дополнительных серий.
			 */
			getAdditionalSeriesData: function(callback, scope) {
				var self = this;
				var resultSeriesData = [];
				var seriesConfig = this.getSeriesConfig() || [];
				var chainParameters = [];
				if (this.drillDownHistory.length === 1) {
					Terrasoft.each(seriesConfig, function(config) {
						var entitySchemaName = config.schemaName;
						var xAxisColumn = config.xAxisColumn;
						var getSeriesQueryConfig = {
							entitySchemaName: config.schemaName,
							func: (chartModuleHelper.getAggregationType(config.func) || config.func),
							xAxis: {
								column: config.xAxisColumn,
								dataValueType: self.getEntitySchemaColumnDataValueType(entitySchemaName, xAxisColumn),
								dateTimeFormat: self.getDateTimeFormat()
							},
							yAxis: {
								column: config.yAxisColumn || config.primaryColumnName
							},
							filters: {
								quickFilters: self.getQuickFilters(config.sectionBindingColumn),
								chartFilters: self.getChartFilters(),
								serializedFilters: self.getSerializedFilters(config.filterData),
								drillDownFilters: self.getDrillDownFilters()
							}
						};
						var seriesDataChain = self.getSeriesDataChain(getSeriesQueryConfig, config, resultSeriesData,
							self.yAxis);
						Ext.Array.insert(chainParameters, chainParameters.length, seriesDataChain);
					}, this);
				}
				chainParameters.push(function() {
					callback.call(scope, resultSeriesData);
				});
				chainParameters.push(this);
				Terrasoft.chain.apply(this, chainParameters);
			},

			/**
			 * Возвращает набор серий запроса.
			 * @protected
			 * @virtual
			 * @param {Object} response Ответ от сервера.
			 * @param {Object} seriesQueryConfig Конфигурацыя запроса.
			 * @return {Object[]} Возвращает набор серий запроса.
			 */
			prepareSeriesPoint: function(response, seriesQueryConfig) {
				var entitySchemaName = seriesQueryConfig.entitySchemaName;
				var xAxisColumnPath = seriesQueryConfig.xAxis.column;
				var seriesData = [];
				var i = 0;
				var dataValueType = this.getEntitySchemaColumnDataValueType(entitySchemaName, xAxisColumnPath);
				var categoryItems = Terrasoft.isDateDataValueType(dataValueType) ? this.getDateTimeFormat() : ["xAxis"];
				response.collection.each(function(item) {
					item.entitySchemaName = entitySchemaName;
					item.serializedFilters = seriesQueryConfig.filters.serializedFilters;
					item.xAxis = seriesQueryConfig.xAxis;
					var categoryName = [];
					var categoryValue = [];
					Terrasoft.each(categoryItems, function(category) {
						var categoryItem = item.get(category);
						if (!Ext.isEmpty(categoryItem)) {
							var displayValue = categoryItem.displayValue || categoryItem;
							displayValue = this.prepareDisplayValue(displayValue);
							var value = categoryItem.value || categoryItem;
							categoryName.push(displayValue);
							categoryValue.push(value);
						}
					}, this);
					seriesData.push({
						name: categoryName.join("-"),
						value: categoryValue.join("-"),
						categoryItem: item,
						x: i++,
						y: item.get("yAxis"),
						drilldown: true
					});
				}, this);
				return seriesData;
			},

			/**
			 * Подготавливает отображаемые значения серии.
			 * @protected
			 * @virtual
			 * @param {String|Boolean|Number} value Отображаемое значение.
			 * @return {String} Подготовленное отображаемое значение.
			 */
			prepareDisplayValue: function(value) {
				if (Ext.isBoolean(value)) {
					var localizableValues = this.localizableValues;
					if (localizableValues) {
						return value
							? localizableValues.BooleanFieldTrueCaption
							: localizableValues.BooleanFieldFalseCaption;
					} else {
						return value.toString();
					}
				}
				return value;
			},

			/**
			 * Проверяет было ли хотя бы одно разворачивание графика.
			 * @return {boolean} Возвращает true если график разворачивали, false - в обратном случае.
			 */
			isDrilledDown: function() {
				return this.drillDownHistory.length > 1;
			}

		});
	});
