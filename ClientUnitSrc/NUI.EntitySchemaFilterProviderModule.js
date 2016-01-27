define("EntitySchemaFilterProviderModule", [
	"ext-base", "terrasoft", "sandbox", "EntitySchemaFilterProviderModuleResources", "StructureExplorerUtilities",
	"LookupUtilities"
],
	function(Ext, Terrasoft, sandbox, resources, StructureExplorerUtilities, LookupUtilities) {

		/**
		 * Локализированные строки ресурсов
		 * @private
		 * @type {Object}
		 */
		var localizableStrings = resources.localizableStrings;

		/**
		 * @class Terrasoft.data.filters.EntitySchemaFilterProvider
		 * Провайдер фильтрации схем объектов
		 */
		Ext.define("Terrasoft.data.filters.EntitySchemaFilterProvider", {
			extend: "Terrasoft.BaseFilterProvider",
			alternateClassName: "Terrasoft.EntitySchemaFilterProvider",

			/**
			 * Указывает ссылку на {@link Ext.Element} в который будет рендериться элемент управления.
			 * Если свойство указано - то компонент начнет рендериться сразу же по завершении иницализации.
			 * Если свойство не указано - то нужно самостоятельно вызывать метод {@link #render render()}
			 * @type {Ext.Element}
			 */
			renderTo: null,

			/**
			 * Корневая схема объекта
			 */
			rootSchemaName: "",

			/**
			 * Идентификатор модуля выбора колонок
			 * @type {String}
			 */
			structureExplorerId: "",

			/**
			 * Идентификатор модуля выбора справочных значений
			 * @type {String}
			 */
			selectDataId: "",

			/**
			 * Разрешенные типы фильтров
			 * @type {Terrasoft.FilterType[]}
			 */
			allowedFilterTypes: [
				Terrasoft.FilterType.COMPARE,
				Terrasoft.FilterType.IS_NULL,
				Terrasoft.FilterType.IN,
				Terrasoft.FilterType.EXISTS
			],

			leftExpressionTypes: [
				"ColumnExpression"
			],

			/**
			 * Создает экземпляр коллекции
			 * @param {Object} config Конфигурационный объект
			 * @return {Terrasoft.Collection} Возвращает созданный экземпляр коллекции
			 */
			constructor: function() {
				this.callParent(arguments);
				this.initDateMacrosTypes();
				var structureExplorerId = this.structureExplorerId = sandbox.id + "_StructureExplorerPage";
				sandbox.subscribe("StructureExplorerInfo", function() {
					return {
						useBackwards: true,
						useExists: true,
						summaryColumnsOnly: false
					};
				}, [structureExplorerId]);
				this.selectDataId = sandbox.id + "_LookupPage";
				var entitySchemaFilterProvider = this;
				sandbox.subscribe("GetStructureExplorerSchemaName", function() {
					return entitySchemaFilterProvider.rootSchemaName;
				}, [structureExplorerId]);
			},

			/**
			 * Обработка события выбора колонки
			 * @private
			 */
			onColumnSelected: function(leftExpressionResult, callback, scope) {
				callback.call(scope || this, leftExpressionResult);
			},

			/**
			 * Получает тип агрегации по умолчанию по типу значения dataValueType
			 * @param {Terrasoft.DataValueType} dataValueType Тип значения
			 * @return {Terrasoft.AggregationType} Возвращает тип агрегации
			 */
			getAggregationTypeByDataValueType: function(dataValueType) {
				var result;
				switch (dataValueType) {
					case Terrasoft.DataValueType.INTEGER:
					case Terrasoft.DataValueType.FLOAT:
					case Terrasoft.DataValueType.MONEY:
						result = Terrasoft.AggregationType.SUM;
						break;
					case Terrasoft.DataValueType.DATE:
					case Terrasoft.DataValueType.DATE_TIME:
					case Terrasoft.DataValueType.TIME:
						result = Terrasoft.AggregationType.MAX;
						break;
					default:
						throw new Terrasoft.UnsupportedTypeException();
				}
				return result;
			},

			/**
			 * Получает левую часть выражения и вызывает функцию callback в контексте scope
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана при получении леовой части выражения
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback
			 * @param {Terrasoft.BaseFilter} oldFilter Существующий фильтр, который нужно заменить созданным
			 */
			getLeftExpression: function(callback, scope, oldFilter) {
				var entitySchemaFilterProvider = this;
				var config = {
					excludeDataValueTypes: [Terrasoft.DataValueType.IMAGELOOKUP],
					useBackwards: true
				};
				if (oldFilter) {
					var oldFilterConfig = {
						columnPath: oldFilter.leftExpression.columnPath
					};
					Ext.apply(config, oldFilterConfig);
				}
				var handler = function(args) {
					entitySchemaFilterProvider.onColumnSelected(args, callback, scope);
				};
				StructureExplorerUtilities.Open(sandbox, config, handler, this.renderTo, this);
			},

			/**
			 * Создает простой фильтр по заданной конфигурации
			 * @param {Object} filterConfig Конфигурация фильтра
			 * @return {Terrasoft.BaseFilter} Возвращает созданный экземпляр фильтра
			 */
			createSimpleFilter: function(filterConfig) {
				var leftExpression = Ext.create("Terrasoft.ColumnExpression", {
					columnPath: filterConfig.leftExpressionColumnPath
				});
				var dataValueType = filterConfig.dataValueType;
				var config = {
					dataValueType: dataValueType,
					leftExpressionCaption: filterConfig.leftExpressionCaption,
					leftExpression: leftExpression,
					comparisonType: this.defaultComparisonType
				};
				var filterClassName;
				switch (dataValueType) {
					case Terrasoft.DataValueType.LOOKUP:
						filterClassName = "Terrasoft.InFilter";
						Ext.apply(config, {
							referenceSchemaName: filterConfig.referenceSchemaName
						});
						break;
					case Terrasoft.DataValueType.IMAGELOOKUP:
						filterClassName = "Terrasoft.IsNullFilter";
						Ext.apply(config, {
							comparisonType: this.defaultImageLookupComparisonType
						});
						break;
					default:
						filterClassName = "Terrasoft.CompareFilter";
						Ext.apply(config, {
							rightExpression: Ext.create("Terrasoft.ParameterExpression", {
								parameterDataType: dataValueType,
								parameterValue: (dataValueType === Terrasoft.DataValueType.BOOLEAN) ? true : null
							})
						});
						break;
				}
				return Ext.create(filterClassName, config);
			},

			/**
			 * Создает аггрегирующий фильтр по заданной конфигурации
			 * @param {Object} filterConfig Конфигурация фильтра
			 * @return {Terrasoft.BaseFilter} Возвращает созданный экземпляр фильтра
			 */
			createAggregativeFilter: function(filterConfig) {
				var config = {
					isAggregative: true,
					leftExpressionCaption: filterConfig.leftExpressionCaption
				};
				var referenceSchemaName = filterConfig.referenceSchemaName;
				var subFilters = Ext.create("Terrasoft.FilterGroup", {
					rootSchemaName: referenceSchemaName,
					key: Terrasoft.generateGUID()
				});
				var filterClassName = "Terrasoft.CompareFilter";
				var leftExpressionClassName = "Terrasoft.AggregationQueryExpression";
				var dataValueType = filterConfig.dataValueType;
				if (!dataValueType) {
					dataValueType = Terrasoft.DataValueType.INTEGER;
				}
				var useAggregativeFunction = filterConfig.isAggregative;
				var aggregationType = this.getAggregationTypeByDataValueType(dataValueType);
				if (useAggregativeFunction) {
					switch (filterConfig.aggregationFunction) {
						case "exists":
							filterClassName = "Terrasoft.ExistsFilter";
							leftExpressionClassName = "Terrasoft.ColumnExpression";
							break;
						case "count":
							dataValueType = Terrasoft.DataValueType.INTEGER;
							aggregationType = Terrasoft.AggregationType.COUNT;
							break;
					}
				}
				Ext.apply(config, {
					leftExpression: Ext.create(leftExpressionClassName, {
						columnPath: filterConfig.leftExpressionColumnPath
					})
				});
				if (filterClassName === "Terrasoft.CompareFilter") {
					Ext.apply(config, {
						comparisonType: this.defaultAggregationComparisonType,
						dataValueType: dataValueType,
						rightExpression: Ext.create("Terrasoft.ParameterExpression", {
							parameterDataType: dataValueType,
							parameterValue: null
						})
					});
					Ext.apply(config.leftExpression, {
						subFilters: subFilters,
						aggregationType: aggregationType
					});
				} else {
					config.subFilters = subFilters;
				}
				return Ext.create(filterClassName, config);
			},

			/**
			 * Создает фильтр по умолчанию по заданной конфигурации
			 * @param {Object} filterConfig Конфигурация фильтра
			 * @return {Terrasoft.BaseFilter} Возвращает созданный экземпляр фильтра
			 */
			createDefaultFilter: function(filterConfig) {
				var defaultFilter;
				if (filterConfig.isBackward) {
					defaultFilter = this.createAggregativeFilter(filterConfig);
				} else {
					defaultFilter = this.createSimpleFilter(filterConfig);
				}
				return defaultFilter;
			},

			/**
			 * Создает подписку на получение названия схемы фильтра
			 * @param {String} schemaName название схемы фильтра
			 */
			subscribeForFilterSchemaName: function(schemaName) {
				var structureExplorerId = this.structureExplorerId = sandbox.id + "_StructureExplorerPage";
				sandbox.subscribe("GetStructureExplorerSchemaName", function() {
					return schemaName;
				}, [structureExplorerId]);
			},

			/**
			 * Получает значение для справочной колонки и выполняет функцию callback в контексте scope
			 * @virtual
			 * @param {Terrasoft.BaseFilter} filter Фильтр по справочной колонке
			 */
			getLookupFilterValue: function(filter) {
				var selectDataId = this.selectDataId;
				sandbox.subscribe("LookupInfo", function() {
					return {
						entitySchemaName: filter.referenceSchemaName,
						multiSelect: true
					};
				}, [selectDataId]);
				var entitySchemaFilterProvider = this;
				var handler = function(lookupValueResult) {
					var selectedValues = lookupValueResult.selectedRows.getItems();
					entitySchemaFilterProvider.setRightExpressionsValues(filter, selectedValues);
				};
				var selectedIds = this.getRightExpressionSelectedItemsIds(filter);
				var config = {
					entitySchemaName: filter.referenceSchemaName,
					multiSelect: true,
					selectedValues: selectedIds
				};
				LookupUtilities.Open(sandbox, config, handler, this, this.renderTo, false);
			},
			/**
			 * Объект соответствия типов макросов типу данных
			 * @private
			 * @type {Object}
			 */
			dataValueTypeFilterMacrosType: {},

			/**
			 * Инициализирует объект соответствия типов макросов типу данных
			 * @private
			 */
			initDateMacrosTypes: function() {
				this.dataValueTypeFilterMacrosType[Terrasoft.DataValueType.TIME] = [
					Terrasoft.FilterMacrosType.HOUR_PREVIOUS,
					Terrasoft.FilterMacrosType.HOUR_CURRENT,
					Terrasoft.FilterMacrosType.HOUR_NEXT,
					Terrasoft.FilterMacrosType.HOUR_EXACT,
					Terrasoft.FilterMacrosType.HOUR_PREVIOUS_N,
					Terrasoft.FilterMacrosType.HOUR_NEXT_N
				];
				this.dataValueTypeFilterMacrosType[Terrasoft.DataValueType.DATE] = [
					Terrasoft.FilterMacrosType.DAY_YESTERDAY,
					Terrasoft.FilterMacrosType.DAY_TODAY,
					Terrasoft.FilterMacrosType.DAY_TOMORROW,
					Terrasoft.FilterMacrosType.DAY_OF_MONTH,
					Terrasoft.FilterMacrosType.DAY_OF_WEEK,
					Terrasoft.FilterMacrosType.DAY_PREVIOUS_N,
					Terrasoft.FilterMacrosType.DAY_NEXT_N,
					Terrasoft.FilterMacrosType.WEEK_PREVIOUS,
					Terrasoft.FilterMacrosType.WEEK_CURRENT,
					Terrasoft.FilterMacrosType.WEEK_NEXT,
					Terrasoft.FilterMacrosType.MONTH_PREVIOUS,
					Terrasoft.FilterMacrosType.MONTH_CURRENT,
					Terrasoft.FilterMacrosType.MONTH_NEXT,
					Terrasoft.FilterMacrosType.MONTH_EXACT,
					Terrasoft.FilterMacrosType.QUARTER_PREVIOUS,
					Terrasoft.FilterMacrosType.QUARTER_CURRENT,
					Terrasoft.FilterMacrosType.QUARTER_NEXT,
					Terrasoft.FilterMacrosType.HALF_YEAR_PREVIOUS,
					Terrasoft.FilterMacrosType.HALF_YEAR_CURRENT,
					Terrasoft.FilterMacrosType.HALF_YEAR_NEXT,
					Terrasoft.FilterMacrosType.YEAR_PREVIOUS,
					Terrasoft.FilterMacrosType.YEAR_CURRENT,
					Terrasoft.FilterMacrosType.YEAR_NEXT,
					Terrasoft.FilterMacrosType.YEAR_EXACT
				];
				this.dataValueTypeFilterMacrosType[Terrasoft.DataValueType.DATE_TIME] =
						this.dataValueTypeFilterMacrosType[Terrasoft.DataValueType.TIME].concat(
								this.dataValueTypeFilterMacrosType[Terrasoft.DataValueType.DATE]
						);
			},

			/**
			 * Возвращает массив допустимых макросов для указанного типа данных
			 * @param {Terrasoft.core.enums.DataValueType} dataValueType тип данных
			 * @return {Terrasoft.FilterMacrosType[]} массив допустимых макросов
			 */
			getDataValueTypeMacrosType: function(dataValueType) {
				return this.dataValueTypeFilterMacrosType[dataValueType];
			},

			/**
			 * Возвращает объект настроек для указанного типа макроса
			 * @throws {Terrasoft.UnsupportedTypeException}
			 * Если для указанного типа макроса не найден объект настроек
			 * @param {Terrasoft.FilterMacrosType} macrosType тип макроса
			 * @return {Object} объект настроек
			 */
			getMacrosTypeConfig: function(macrosType) {
				var result = Terrasoft.MacrosTypeConfig[macrosType];
				if (Ext.isEmpty(result)) {
					throw new Terrasoft.UnsupportedTypeException({
						message: localizableStrings.getMacrosTypeConfigException
					});
				}
				return result;
			},

			/**
			 * Возвращает массив доступных макросов для указанного фильтра
			 * @param {Terrasoft.BaseFilter} filter
			 * @return {Terrasoft.FilterMacrosType[]}
			 */
			getAllowedMacrosTypes: function(filter) {
				var filterDataValueType = filter.dataValueType;
				var macrosTypes = [];
				if (Terrasoft.isDateDataValueType(filterDataValueType)) {
					macrosTypes = Terrasoft.deepClone(this.getDataValueTypeMacrosType(filterDataValueType));
				} else if (filter.referenceSchemaName === "Contact") {
					macrosTypes.push(Terrasoft.FilterMacrosType.CONTACT_CURRENT);
				} else if (filter.referenceSchemaName === "SysAdminUnit")  {
					macrosTypes.push(Terrasoft.FilterMacrosType.USER_CURRENT);
				}
				return macrosTypes;
			},

			/**
			 * Устанавливает значение для правой части фильтра
			 * @throws {Terrasoft.UnsupportedTypeException}
			 * Если тип функции финкционального выражения не макрос и не часть даты
			 * @param {Terrasoft.BaseFilter} filter Объект фильтра
			 * @param {String/Number/Date/Boolean} value Значение
			 * @param {Terrasoft.FilterMacrosType} macrosType Тип макроса
			 */
			setRightExpressionValue: function(filter, value, macrosType) {
				var functionArgumentExpression = filter.leftExpression.functionArgument;
				if (functionArgumentExpression) {
					filter.leftExpression = functionArgumentExpression;
				}
				var expression;
				if (!Ext.isEmpty(macrosType)) {
					var macrosTypeConfig = this.getMacrosTypeConfig(macrosType);
					switch (macrosTypeConfig.functionType) {
						case Terrasoft.FunctionType.MACROS:
							expression = Ext.create("Terrasoft.FunctionExpression", {
								functionType: Terrasoft.FunctionType.MACROS,
								macrosType: macrosTypeConfig.queryMacrosType
							});
							if (Terrasoft.ParameterizedFilterMacrosTypes.indexOf(macrosType) > -1) {
								expression.functionArgument = Ext.create("Terrasoft.ParameterExpression", {
									parameterDataType: macrosTypeConfig.value.dataValueType,
									parameterValue: value
								});
							}
							break;
						case Terrasoft.FunctionType.DATE_PART:
							var leftExpression = Ext.create("Terrasoft.FunctionExpression", {
								functionType: Terrasoft.FunctionType.DATE_PART,
								datePartType: macrosTypeConfig.datePartType,
								functionArgument: filter.leftExpression
							});
							filter.leftExpression = leftExpression;
							var macrosTypeConfigValue = macrosTypeConfig.value;
							var hasDisplayRange = !Ext.isEmpty(macrosTypeConfigValue.displayValueRange);
							var parameterValue = (hasDisplayRange && !Ext.isEmpty(value)) ? (value + 1) : value;
							expression = Ext.create("Terrasoft.ParameterExpression", {
								parameterDataType: macrosTypeConfigValue.dataValueType,
								parameterValue: parameterValue
							});
							break;
						default:
							throw new Terrasoft.UnsupportedTypeException();
					}
					if (filter.filterType === Terrasoft.FilterType.IN) {
						var config = {
							leftExpressionColumnPath: filter.leftExpression.columnPath,
							dataValueType: Terrasoft.DataValueType.GUID,
							leftExpressionCaption: filter.leftExpressionCaption
						};
						var newFilter = this.createSimpleFilter(config);
						newFilter.referenceSchemaName = filter.referenceSchemaName;
						newFilter.setRightExpression(expression);
						this.fireEvent("replaceFilter", filter, newFilter);
					} else {
						filter.setRightExpression(expression);
					}
				} else {
					expression = Ext.create("Terrasoft.ParameterExpression", {
						parameterDataType: filter.dataValueType,
						parameterValue: value
					});
					filter.setRightExpression(expression);
				}
			},

			/**
			 * Устанавливает значение для правой части фильтра
			 * @throws {Terrasoft.UnsupportedTypeException}
			 * Если values не массив, то генерируется исключение
			 * @param {Terrasoft.BaseFilter} filter Объект фильтра
			 * @param {Array} values Массив значений
			 */
			setRightExpressionsValues: function(filter, values) {
				if (values && !Ext.isArray(values)) {
					throw new Terrasoft.UnsupportedTypeException({
						message: localizableStrings.setRightExpressionsValuesException
					});
				}
				var actualFilter;
				if (filter.filterType !== Terrasoft.FilterType.IN) {
					var config = {
						leftExpressionColumnPath: filter.leftExpression.columnPath,
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						referenceSchemaName: filter.referenceSchemaName,
						leftExpressionCaption: filter.leftExpressionCaption
					};
					actualFilter = this.createSimpleFilter(config);
					this.fireEvent("replaceFilter", filter, actualFilter);
				} else {
					actualFilter = filter;
				}
				var expressions = [];
				Terrasoft.each(values, function(value) {
					var expression = Ext.create("Terrasoft.ParameterExpression", {
						parameterValue: value,
						parameterDataType: Terrasoft.DataValueType.LOOKUP
					});
					expressions.push(expression);
				});
				actualFilter.setRightExpressions(expressions);
			},

			/**
			 * Возвращает объект настроек для типа макроса фильтра
			 * @throws {Terrasoft.UnsupportedTypeException}
			 * Если для типа функции фильтра не найден метод определения типа макроса фильтра
			 * @param {Terrasoft.BaseFilter} filter Элемент фильтра
			 * @return {Object} объект настроек для типа макроса фильтра
			 */
			getFilterMacrosConfig: function(filter) {
				return Terrasoft.GetFilterMacrosConfig(filter);
			},

			/**
			 * Возвращает объект отображаемых значений макроса фильтра
			 * @param {Terrasoft.BaseFilter} filter Элемент фильтра
			 * @return {Object} Объект отображаемых значений макроса фильтра
			 * @return {Object.macrosCaption} Заголовок макроса
			 * @return {Object.macrosParameterCaption} Объект отображаемых значений макроса фильтра
			 */
			getRightExpressionMacrosDisplayValues: function(filter) {
				return Terrasoft.GetRightExpressionMacrosDisplayValues(filter);
			},

			/**
			 * Формирует массив идентификаторов выбраных записей для передачи в окно выбора из справочника.
			 * @param {Terrasoft.BaseFilter} filter Элемент фильтра.
			 * @return {Array|null} Массив идентификаторов.
			 */
			getRightExpressionSelectedItemsIds: function(filter) {
				if (!filter.rightExpressions || !Ext.isArray(filter.rightExpressions)) {
					return null;
				}
				var selectedIds = [];
				Terrasoft.each(filter.rightExpressions, function(selectedItem) {
					selectedIds.push(selectedItem.parameter.value.Id);
				}, this);
				return selectedIds;
			}

		});

		return Terrasoft.EntitySchemaFilterProvider;
	});