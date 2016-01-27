define("FixedFilterViewModelV2", ["ext-base", "terrasoft", "FixedFilterViewModelV2Resources", "LookupUtilities",
		"QuickFilterViewV2Resources", "ConfigurationConstants"],
		function(Ext, Terrasoft, resources, LookupUtilities, quickFilterViewResources, ConfigurationConstants) {

			function defGetFilter(filterInfo) {
				var filter;
				if (filterInfo.dataValueType === Terrasoft.DataValueType.DATE) {
					var startDate = filterInfo.startDate.value;
					var dueDate = filterInfo.dueDate.value;
					if (filterInfo.singleColumn) {
						if (startDate && dueDate) {
							filter =
									Terrasoft.createColumnBetweenFilterWithParameters(
											filterInfo.startDate.columnName,
											Terrasoft.startOfDay(startDate), Terrasoft.endOfDay(dueDate));
						} else if (startDate) {
							filter =
									Terrasoft.createColumnFilterWithParameter(
											Terrasoft.ComparisonType.GREATER_OR_EQUAL,
											filterInfo.startDate.columnName, Terrasoft.startOfDay(startDate));
						} else if (dueDate) {
							filter =
									Terrasoft.createColumnFilterWithParameter(
											Terrasoft.ComparisonType.LESS_OR_EQUAL,
											filterInfo.startDate.columnName, Terrasoft.endOfDay(dueDate));
						}
					} else {
						var periodFilterCollection = Terrasoft.createFilterGroup();
						periodFilterCollection.logicalOperation = Terrasoft.LogicalOperatorType.AND;
						if (startDate) {
							filter =
									Terrasoft.createColumnFilterWithParameter(
											Terrasoft.ComparisonType.GREATER_OR_EQUAL,
											filterInfo.dueDate.columnName, Terrasoft.startOfDay(startDate));
							periodFilterCollection.add(filterInfo.dueDate.columnName, filter);
						}
						if (dueDate) {
							filter =
									Terrasoft.createColumnFilterWithParameter(
											Terrasoft.ComparisonType.LESS_OR_EQUAL,
											filterInfo.startDate.columnName, Terrasoft.endOfDay(dueDate));
							periodFilterCollection.add(filterInfo.startDate.columnName, filter);
						}
						if (startDate && dueDate) {
							filter = periodFilterCollection;
						}
					}
				} else if (filterInfo.value) {
					if (filterInfo.isLookup) {
						filter = Terrasoft.createColumnInFilterWithParameters(filterInfo.columnName,
								filterInfo.value);
					} else {
						filter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								filterInfo.columnName, filterInfo.value);
					}
				}

				if (filterInfo.appendFilter) {
					var appendFilter = filterInfo.appendFilter(filterInfo);
					if (appendFilter) {
						if (filter) {
							var filterGroup = Terrasoft.createFilterGroup();
							filterGroup.logicalOperation = filterInfo.appendFilterLogicalOperation ||
									Terrasoft.LogicalOperatorType.OR;
							filterGroup.add(filterInfo.name + "DefaultFilter", filter);
							filterGroup.add(filterInfo.name + "AppendedFilter", appendFilter);
							return filterGroup;
						} else {
							return appendFilter;
						}
					}
				}
				return filter;
			}

			function defGetFilters(filtersInfo) {
				var filtersCollection = Terrasoft.createFilterGroup();
				filtersCollection.logicalOperation = Terrasoft.LogicalOperatorType.AND;
				Terrasoft.each(filtersInfo, function(filterInfo) {
					var filter;
					if (filterInfo.getFilter) {
						filter = filterInfo.getFilter(filterInfo);
					} else {
						filter = defGetFilter(filterInfo);
					}
					if (filter) {
						filtersCollection.add(filterInfo.name, filter);
					}
				}, this);
				return filtersCollection;
			}

			function getFilters() {
				var filtersValues = this.prepareFilters();
				if (this.config.getFilters) {
					return this.config.getFilters(filtersValues);
				}
				return defGetFilters(filtersValues);
			}

			function prepareFilters() {
				var filtersValues = {};
				Terrasoft.each(this.config.filters, function(filterConfig) {
					if (filterConfig.moduleName) {
						return;
					}
					var filterInfo = {
						name: filterConfig.name,
						dataValueType: filterConfig.dataValueType
					};
					if (filterConfig.dataValueType === Terrasoft.DataValueType.DATE) {
						var periodConfig = this.getPeriodFilterConfig(filterConfig);
						var startDate = this.get(periodConfig.startDateColumnName);
						var dueDate = this.get(periodConfig.dueDateColumnName);
						filterInfo.startDate = {
							columnName: periodConfig.startDateColumnName,
							value: startDate
						};
						filterInfo.dueDate = {
							columnName: periodConfig.dueDateColumnName,
							value: dueDate
						};
						filterInfo.singleColumn = periodConfig.singleColumn;
					} else {
						var entityColumn = this.entitySchema.getColumnByName(filterConfig.columnName);
						filterInfo.columnName = filterConfig.columnName;
						filterInfo.isLookup = entityColumn.isLookup;
						if (entityColumn) {
							if (entityColumn.isLookup) {
								var values = this.get(getSelectedLookupValuesPropertyName(filterConfig.name));
								var filterValues = [];
								values.each(function(value) {
									filterValues.push(value.get("value"));
								}, this);
								if (filterValues.length > 0) {
									filterInfo.value = filterValues;
								}
							} else {
								var value = this.get(filterConfig.name);
								filterInfo.value = value;
							}
						}
					}
					if (filterConfig.getFilter) {
						filterInfo.getFilter = filterConfig.getFilter;
					} else if (filterConfig.appendFilter) {
						filterInfo.appendFilter = filterConfig.appendFilter;
						filterInfo.appendFilterLogicalOperation = filterConfig.appendFilterLogicalOperation;
					}
					filtersValues[filterConfig.name] = filterInfo;
				}, this);
				return filtersValues;
			}

			/**
			 * Формирует конфигурацию фиксированых фильтров по периоду.
			 * @param {Object} filterConfig Конфигурация фиксированых фильтров.
			 * @return {Object} Конфигурация Фиксированых фильтров по периоду.
			 */
			function defaultGetPeriodFilterConfig(filterConfig) {
				var resultConfig = {};
				var startDateColumnName = filterConfig.columnName;
				var startDateDefValue = filterConfig.defValue || null;
				var dueDateColumnName = filterConfig.columnName;
				var dueDateDefValue = filterConfig.defValue || null;
				if (filterConfig.startDate) {
					startDateColumnName = filterConfig.startDate.columnName || startDateColumnName;
					startDateDefValue = filterConfig.startDate.defValue || startDateDefValue;
					if (filterConfig.dueDate) {
						dueDateColumnName = filterConfig.dueDate.columnName || startDateColumnName || dueDateColumnName;
						dueDateDefValue = filterConfig.dueDate.defValue || startDateDefValue || dueDateDefValue;
					} else {
						dueDateColumnName = startDateColumnName;
						dueDateDefValue = startDateDefValue;
					}
				}
				if (startDateColumnName === dueDateColumnName) {
					dueDateColumnName = startDateColumnName + "Due";
					resultConfig.singleColumn = true;
				}
				resultConfig.startDateColumnName = startDateColumnName;
				resultConfig.startDateDefValue = startDateDefValue;
				resultConfig.dueDateColumnName = dueDateColumnName;
				resultConfig.dueDateDefValue = dueDateDefValue;
				return resultConfig;
			}

			function generate(config) {
				var getPeriodFilterConfigFn = config.getPeriodFilterConfig || defaultGetPeriodFilterConfig;
				var viewModelConfig = {
					entitySchema: config.entitySchema,
					config: config,
					columns: {
					},
					values: {
						IsSeparateMode: true,
						Ext: config.Ext,
						sandbox: config.sandbox
					},
					methods: {
						getFilters: getFilters,
						prepareFilters: prepareFilters,
						getPeriodFilterConfig: getPeriodFilterConfigFn,
						getSelectedLookupValuesPropertyName: getSelectedLookupValuesPropertyName,
						setPeriod: setPeriod,
						setCurrentDayPeriod: setCurrentDayPeriod,
						setCurrentWeekPeriod: setCurrentWeekPeriod,
						setCurrentContact: setCurrentContact,
						clearLookupFilter: clearLookupFilter,
						clearPeriodFilter: clearPeriodFilter,
						clearOwnerFilter: clearOwnerFilter,
						editOwnerFilter: editOwnerFilter,
						periodChanged: periodChanged,
						init: init,
						applyFilter: applyFilter,
						clearSimpleFilterProperties: clearSimpleFilterProperties,
						addLookupFilter: addLookupFilter,
						editFilter: editLookupFilter,
						subscribeCollectionEvents: subscribeCollectionEvents,
						addFilterValue: addFilterValue,
						addFilterValueByFilterConfig: addFilterValueByFilterConfig,
						addNonPeriodFilterValue: addNonPeriodFilterValue,
						updateButtonCaption: updateButtonCaption,
						getFilterValue: getFilterValue,
						updateFiltersOnReturn: updateFiltersOnReturn,
						clearFilterViews: clearFilterViews,
						filterChanged: filterChanged,
						getAddedFixedFilter: Terrasoft.emptyFn,
						lookupSelecting: lookupSelecting,
						getFilterViewModel: getFilterViewModel,
						getFilterView: getFilterView,
						generateFilterViewConfig: generateFilterViewConfig,
						onRemoveFilter: onRemoveFilter,
						//todo вынужденая мера, пока по конфигу инстансируется BaseViewModel.
						// Как только инстансирование модели изменится, перенести в свойства.
						getExt: function() {
							return this.get("Ext");
						},
						getSandbox: function() {
							return this.get("sandbox");
						}
					}
				};
				Terrasoft.each(config.filters, function(filterConfig) {
					if (filterConfig.dataValueType === Terrasoft.DataValueType.DATE) {
						var periodConfig = getPeriodFilterConfigFn(filterConfig);
						var startDateColumn = generateViewModelColumn(periodConfig.startDateColumnName);
						viewModelConfig.values[periodConfig.startDateColumnName] = periodConfig.startDateDefValue;
						viewModelConfig.columns[periodConfig.startDateColumnName] = startDateColumn;
						var dueDateColumn = generateViewModelColumn(periodConfig.dueDateColumnName);
						viewModelConfig.columns[dueDateColumn.name] = dueDateColumn;
						viewModelConfig.values[periodConfig.dueDateColumnName] = periodConfig.dueDateDefValue;
						if (periodConfig.singleColumn) {
							dueDateColumn.dataValueType = Terrasoft.DataValueType.DATE;
							dueDateColumn.type = Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN;
						}
					} else {
						var column = generateViewModelColumn(filterConfig.name, filterConfig.columnName);
						viewModelConfig.columns[column.name] = column;
						if (filterConfig.dataValueType === Terrasoft.DataValueType.LOOKUP ||
								filterConfig.dataValueType === Terrasoft.DataValueType.ENUM) {
							column.referenceSchemaName = filterConfig.referenceSchemaName ||
									config.entitySchema.columns[filterConfig.columnName].referenceSchemaName;
							viewModelConfig.values[column.name + "List"] = new Terrasoft.Collection();
							var selectedValuesCollection = new Terrasoft.Collection();
							viewModelConfig.values[getSelectedLookupValuesPropertyName(column.name)] =
									selectedValuesCollection;
							column.isLookup = true;
							var lookupListColumnConfig = {
								type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
								name: column.name + "List",
								isCollection: true
							};
							viewModelConfig.columns[lookupListColumnConfig.name] = lookupListColumnConfig;
							if (filterConfig.prepareList) {
								viewModelConfig.methods["get" + lookupListColumnConfig.name] = filterConfig.prepareList;
							}
							var buttonCaptionColumnConfig = {
								type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
								name: filterConfig.name + "ButtonCaption"
							};
							if (filterConfig.filter) {
								viewModelConfig.values[filterConfig.name + "LookupFilter"] = filterConfig.filter();
							}
							viewModelConfig.columns[buttonCaptionColumnConfig.name] = buttonCaptionColumnConfig;
							viewModelConfig.values[buttonCaptionColumnConfig.name] = filterConfig.caption;
							viewModelConfig.values[filterConfig.name + "Views"] = new Terrasoft.Collection();
						}
					}
				}, this);
				return viewModelConfig;
			}

			function generateFilterViewModelConfig() {
				return {
					columns: {
						displayValue: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: "displayValue"
						},
						filterName: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: "filterName"
						}
					},
					values: {
						name: null,
						value: null,
						view: null
					},
					methods: {
					}
				};
			}

			function clearFilterViews(tag) {
				var filtersViews = this.get(tag + "Views");
				filtersViews.each(function(view) {
					if (!view.destroyed) {
						view.destroy();
					}
				});
				filtersViews.clear();
			}

			function updateFiltersOnReturn() {
				var update = this.suspendUpdate;
				this.suspendUpdate = true;
				var tag = "Owner";
				var filters = this.get(getSelectedLookupValuesPropertyName(tag));
				var filtersViews = this.get(tag + "Views");
				if (filters != null && filters.getCount() > 0) {
					this.clearFilterViews(tag);
					var filterNames = Terrasoft.deepClone(filters.getKeys());
					var scope = this;
					Terrasoft.each(filterNames, function(filterName) {
						var filter = filters.collection.getByKey(filterName);
						var simpleFilterView = scope.getFilterView(tag, filterName, filter);
						filtersViews.add(filterName, simpleFilterView);
					});
				}
				var filterState = this.getFilterState("Fixed");
				Terrasoft.each(this.config.filters, function(filterValue) {
					if (filterValue.name !== "Owner" && filterState && filterState[filterValue.name]) {
						var filterConfig = filterState[filterValue.name];
						var periodConfig = this.getPeriodFilterConfig(filterConfig.config || filterConfig);
						var startDate = filterConfig.startDate ? new Date(filterConfig.startDate) : null;
						var dueDate = filterConfig.dueDate ? new Date(filterConfig.dueDate) : null;
						this.set(periodConfig.startDateColumnName, startDate);
						this.set(periodConfig.dueDateColumnName, dueDate);
					}
				}, this);
				this.suspendUpdate = update;
			}

			/**
			 * Инициализирует фиксированные фильтры по полученому конфигу,
			 * в случае первичной инициализации инициирует событие изменения фильтров.
			 * @private
			 */
			function init(callback, scope) {
				this.suspendUpdate = true;
				this.clearSimpleFilterProperties();
				var addedFilter = this.getAddedFixedFilter();
				var filterState = this.getFilterState("Fixed");
				Terrasoft.each(this.config.filters, function(filterInfo) {
					var value;
					if (filterInfo.name === "Owner") {
						if (filterInfo.addOwnerCaption) {
							this.set("addOwnerCaption", filterInfo.addOwnerCaption);
						} else {
							this.set("addOwnerCaption", resources.localizableStrings.AddOwnerCaption);
						}
					}
					if (filterInfo.dataValueType === Terrasoft.DataValueType.LOOKUP ||
						filterInfo.dataValueType === Terrasoft.DataValueType.ENUM) {
						this.subscribeCollectionEvents(filterInfo.name);

						if (filterState && filterState[filterInfo.name]) {
							value = filterState[filterInfo.name];
						} else if (filterInfo.defValue) {
							value = filterInfo.defValue;
						}
					} else if (filterState && filterState[filterInfo.name]) {
						value = filterState[filterInfo.name];
					}
					if (Ext.isArray(value)) {
						Terrasoft.each(value, function(currentValue) {
							this.addFilterValueByFilterConfig(filterInfo, currentValue);
						}, this);
					} else if (value) {
						this.addFilterValueByFilterConfig(filterInfo, value);
					}
				}, this);
				if (addedFilter) {
					this.set("currentFilterName", addedFilter.currentFilter);
					Terrasoft.each(addedFilter.values, function(currentValue) {
						this.addNonPeriodFilterValue(addedFilter.columnName, currentValue);
					}, this);
					this.clearSimpleFilterProperties();
				}
				this.suspendUpdate = false;
				callback.call(scope);
			}

			function subscribeCollectionEvents(filterName) {
				var selectedValues = this.get(getSelectedLookupValuesPropertyName(filterName));
				selectedValues.on("dataLoaded", function() {
					var filtersViews = this.get(filterName + "Views");
					selectedValues.each(function(filterViewModel) {
						filtersViews.add(filterViewModel.get("filterName"), filterViewModel.get("view"));
					});
					this.updateButtonCaption(filterName);
				}, this);
				selectedValues.on("add", function(filterViewModel) {
					var filtersViews = this.get(filterName + "Views");
					if (!filtersViews.find(filterViewModel.get("filterName"))) {
						filtersViews.add(filterViewModel.get("filterName"), filterViewModel.get("view"));
					}
					this.updateButtonCaption(filterName);
				}, this);
				selectedValues.on("remove", function(filterViewModel) {
					var filtersViews = this.get(filterName + "Views");
					var view = filtersViews.removeByKey(filterViewModel.get("filterName"));
					if (view) {
						view.destroy();
					}
					this.updateButtonCaption(filterName);
				}, this);
				selectedValues.on("clear", function() {
					var filtersViews = this.get(filterName + "Views");
					filtersViews.each(function(view) {
						view.destroy();
					});
					filtersViews.clear();
					this.updateButtonCaption(filterName);
				}, this);
			}

			function addNonPeriodFilterValue(tag, simpleFilterValue) {
				var selectedValues = this.get(getSelectedLookupValuesPropertyName(tag));
				var oldFilterName = this.get("currentFilterName");
				var filterName = "fixedFilter" + tag + simpleFilterValue.value;
				if (oldFilterName && filterName !== oldFilterName) {
					selectedValues.removeByKey(oldFilterName);
				}
				var simpleFilter = selectedValues.find(filterName);
				if (!simpleFilter) {
					var config = generateFilterViewModelConfig();
					simpleFilter = this.getFilterViewModel(tag, filterName, config);
					simpleFilter.set("name", tag);
					simpleFilter.set("filterName", filterName);
					simpleFilter.set("value", simpleFilterValue.value);
					simpleFilter.set("displayValue", simpleFilterValue.displayValue);
					selectedValues.add(filterName, simpleFilter);
					if (this.filterChanged) {
						this.filterChanged();
					}
				}
			}

			function applyFilter(a1, a2, a3, tag) {
				var simpleFilterValue = this.get(tag);
				if (simpleFilterValue) {
					this.addNonPeriodFilterValue(tag, simpleFilterValue);
				}
				this.destroySimpleFilterEdit();
			}

			function clearSimpleFilterProperties(tag) {
				this.set(tag, null);
				this.set("currentFilterName", null);
			}

			function setCurrentDayPeriod() {
				this.setPeriod("PeriodFilter_Today");
			}

			function setCurrentWeekPeriod() {
				this.setPeriod("PeriodFilter_CurrentWeek");
			}

			function setPeriod(tag) {
				if (!tag) {
					return;
				}
				var indexOfSeparator = tag.lastIndexOf("_");
				if (indexOfSeparator === -1) {
					return;
				}
				var filterName = tag.substring(0, indexOfSeparator);
				var periodName = tag.substring(indexOfSeparator + 1);
				var periodFilterConfig;
				Terrasoft.each(this.config.filters, function(filterConfig) {
					if (filterConfig.name === filterName) {
						periodFilterConfig = this.getPeriodFilterConfig(filterConfig);
					}
				}, this);
				if (!periodFilterConfig) {
					return;
				}
				var startDate = new Date();
				var dueDate;
				switch (periodName) {
					case "Yesterday":
						startDate = Terrasoft.startOfDay(Ext.Date.add(startDate, "d", -1));
						dueDate = Terrasoft.endOfDay(startDate);
						break;
					case "Tomorrow":
						startDate = Terrasoft.startOfDay(Ext.Date.add(startDate, "d", 1));
						dueDate = Terrasoft.endOfDay(startDate);
						break;
					case "PastWeek":
						startDate = Terrasoft.startOfWeek(Ext.Date.add(startDate, "d", -7));
						dueDate = Terrasoft.endOfWeek(startDate);
						break;
					case "CurrentWeek":
						startDate = Terrasoft.startOfWeek(startDate);
						dueDate = Terrasoft.endOfWeek(startDate);
						break;
					case "NextWeek":
						startDate = Terrasoft.startOfWeek(Ext.Date.add(startDate, "d", 7));
						dueDate = Terrasoft.endOfWeek(startDate);
						break;
					case "PastMonth":
						startDate = Terrasoft.startOfMonth(Ext.Date.add(startDate, "mo", -1));
						dueDate = Terrasoft.endOfMonth(startDate);
						break;
					case "CurrentMonth":
						startDate = Terrasoft.startOfMonth(startDate);
						dueDate = Terrasoft.endOfMonth(startDate);
						break;
					case "NextMonth":
						startDate = Terrasoft.startOfMonth(Ext.Date.add(startDate, "mo", 1));
						dueDate = Terrasoft.endOfMonth(startDate);
						break;
					default:
						startDate = Terrasoft.startOfDay(startDate);
						dueDate = Terrasoft.endOfDay(startDate);
						break;
				}
				this.suspendUpdate = true;
				this.set(periodFilterConfig.startDateColumnName, startDate);
				this.set(periodFilterConfig.dueDateColumnName, dueDate);
				this.suspendUpdate = false;
				if (this.filterChanged) {
					this.filterChanged();
				}
			}

			function periodChanged(value, tag) {
				if (!this.suspendUpdate) {
					this.suspendUpdate = true;
					this.set(tag.currentColumnName, value);

					var starColumnName = tag.periodConfig.startDateColumnName;
					var dueColumnName = tag.periodConfig.dueDateColumnName;
					var startDate = this.get(starColumnName);
					var dueDate = this.get(dueColumnName);

					if (tag.currentColumnName === starColumnName) {
						if ((value && dueDate) && (value >= dueDate)) {
							this.set(dueColumnName, Terrasoft.deepClone(value));
						}
					} else {
						if ((value && startDate) && (value <= startDate)) {
							this.set(starColumnName, Terrasoft.deepClone(value));
						}
					}
					this.suspendUpdate = false;
					if (this.filterChanged) {
						this.filterChanged();
					}
				}
			}

			function setCurrentContact(tag) {
				if (!tag) {
					return;
				}
				this.set("ownerFirstFilterVisible", false);
				var filters = this.get(getSelectedLookupValuesPropertyName(tag));
				filters.clear();
				this.addNonPeriodFilterValue(tag, Terrasoft.SysValue.CURRENT_USER_CONTACT);
			}

			function clearLookupFilter(tag) {
				if (!tag) {
					return;
				}
				if (tag === "Owner") {
					this.set("ownerFirstFilterVisible", false);
				}
				var filters = this.get(getSelectedLookupValuesPropertyName(tag));
				filters.clear();
				this.filterChanged();
			}

			function generateViewModelColumn(columnName, columnPath) {
				return {
					type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
					name: columnName,
					columnPath: columnPath || columnName
				};
			}

			function getSelectedLookupValuesPropertyName(propertyName) {
				return "Selected" + propertyName + "List";
			}

			function clearPeriodFilter(a1, a2, a3, tag) {
				var startDate = this.get(tag.startDateColumnName);
				var dueDate = this.get(tag.dueDateColumnName);
				if (startDate || dueDate) {
					this.suspendUpdate = true;
					this.set(tag.startDateColumnName, null);
					this.set(tag.dueDateColumnName, null);
					this.suspendUpdate = false;
					if (this.filterChanged) {
						this.filterChanged();
					}
				}
			}

			function clearOwnerFilter(a1, a2, a3, tag) {
				var filters = this.get(this.getSelectedLookupValuesPropertyName("Owner"));
				filters.removeByKey(tag);
				this.set("ownerFirstFilterVisible", false);
				this.filterChanged();
			}

			function editOwnerFilter(a1, a2, a3, tag) {
				this.editFilter("Owner", tag);
			}

			function updateButtonCaption(filterName) {
				var filterInfo;
				Terrasoft.each(this.config.filters, function(filterConfig) {
					if (filterConfig.name === filterName) {
						filterInfo = filterConfig;
					}
				}, this);
				if (filterInfo) {
					var selectedCollection = this.get(getSelectedLookupValuesPropertyName(filterInfo.name));
					if (!selectedCollection || selectedCollection.collection.length === 0 || !this.get("IsSeparateMode")) {
						this.set(filterName + "ButtonCaption", filterInfo.caption);
						return;
					}
				}
				this.set(filterName + "ButtonCaption", "");
			}

			function addLookupFilter(filterName) {
				this.lookupSelecting(filterName);
			}

			function editLookupFilter(filterName, tag) {
				this.lookupSelecting(filterName, tag);
			}

			function getFilterValue(filterName) {
				var result = {};
				Terrasoft.each(this.config.filters, function(filterConfig) {
					var filterValue;
					if (!filterName || filterConfig.name === filterName) {
						if (filterConfig.dataValueType === Terrasoft.DataValueType.DATE) {
							var periodConfig = this.getPeriodFilterConfig(filterConfig);
							var startDate = this.get(periodConfig.startDateColumnName);
							var dueDate = this.get(periodConfig.dueDateColumnName);
							filterValue = {
								startDate: startDate,
								dueDate: dueDate,
								config: {
									startDate: {
										columnName: periodConfig.startDateColumnName
									},
									dueDate: {
										columnName: periodConfig.dueDateColumnName
									}
								}
							};
						} else if (filterConfig.dataValueType === Terrasoft.DataValueType.LOOKUP ||
								filterConfig.dataValueType === Terrasoft.DataValueType.ENUM) {
							var values = this.get(getSelectedLookupValuesPropertyName(filterConfig.name));
							filterValue = [];
							values.each(function(value) {
								filterValue.push({
									value: value.get("value"),
									displayValue: value.get("displayValue")
								});
							}, this);
						} else {
							filterValue = this.get(filterConfig.name);
						}
						if (filterName) {
							result = filterValue;
						} else {
							result[filterConfig.name] = filterValue;
						}
					}
				}, this);
				return result;
			}

			function addFilterValueByFilterConfig(filterConfig, filterValue) {
				if (filterConfig.dataValueType === Terrasoft.DataValueType.DATE) {
					var periodConfig = this.getPeriodFilterConfig(filterConfig);
					var startDate = filterValue.startDate ? new Date(filterValue.startDate) : null;
					var dueDate = filterValue.dueDate ? new Date(filterValue.dueDate) : null;
					this.set(periodConfig.startDateColumnName, startDate);
					this.set(periodConfig.dueDateColumnName, dueDate);
				} else {
					if (!Ext.isArray(filterValue)) {
						this.addNonPeriodFilterValue(filterConfig.name, filterValue);
					} else {
						Terrasoft.each(filterValue, function(val) {
							this.addNonPeriodFilterValue(filterConfig.name, val);
						}, this);
					}
				}
			}

			function addFilterValue(filterName, filterValue) {
				var filterChanged = false;
				var updateSuspended = this.suspendUpdate;
				this.suspendUpdate = true;
				Terrasoft.each(this.config.filters, function(filterConfig) {
					if (filterConfig.name === filterName) {
						filterChanged = true;
						this.addFilterValueByFilterConfig(filterConfig, filterValue);
					}
				}, this);
				this.suspendUpdate = updateSuspended;
				if (filterChanged && this.filterChanged) {
					this.filterChanged();
				}
			}

			/**
			 * Генерирует событие об изменении фильтров.
			 * @private
			 */
			function filterChanged() {
				this.fireEvent("filterChanged", "FixedFilters", this.suspendUpdate);
			}

			function lookupSelecting(tag, currentFilter) {
				var sandbox = this.getSandbox();
				LookupUtilities.Open(sandbox, {
					entitySchemaName: this.columns[tag].referenceSchemaName,
					multiSelect: false,
					columnName: tag,
					currentFilter: currentFilter,
					filters: this.get(tag + "LookupFilter")
				}, function(response) {
					response.selectedRows.each(function(row) {
						this.set("ownerFirstFilterVisible", false);
						this.addNonPeriodFilterValue(tag, row);
					}, this);
				}, this);
			}

			/**
			 * Обрабатывает удаление фиксированного фильтра.
			 * @private
			 * @param {String} filterListName Название коллекции фильтров.
			 * @param {String} filterName Название фильтра.
			 */
			function onRemoveFilter(filterListName, filterName) {
				var filters = this.get(
					this.getSelectedLookupValuesPropertyName(filterName));
				filters.removeByKey(filterListName);
				this.filterChanged();
			}

			function getFilterViewModel(tag, filterName, config) {
				var Ext = this.getExt();
				var filterViewModel = Ext.create("Terrasoft.BaseViewModel", config);
				filterViewModel.addEvents("removeFilter");
				var customFiltersViewsContainer = Ext.get("fixedFilter" + tag + "Container");
				filterViewModel.removeFilter = function(a1, a2, a3, filtersName) {
					this.fireEvent("removeFilter", filtersName, this.get("name"));
				};
				filterViewModel.on("removeFilter", this.onRemoveFilter, this);
				filterViewModel.onEditFilter = this.editFilter.bind(this);
				filterViewModel.editFilter = function(tag) {
					this.onEditFilter(this.get("name"), tag);
				};
				var filterView = Ext.create("Terrasoft.Container",
				//todo утилитный класс
				this.generateFilterViewConfig(filterName));
				filterView.bind(filterViewModel);
				if (customFiltersViewsContainer) {
					filterView.render(customFiltersViewsContainer);
				}
				filterViewModel.set("view", filterView);
				return filterViewModel;
			}

			function generateFilterViewConfig(filterName, folderType) {
				var viewConfig = {
					id: filterName + "View",
					selectors: {
						el: "#" + filterName + "View",
						wrapEl: "#" + filterName + "View"
					},
					classes: {
						wrapClassName: "filter-inner-container filter-element-container-wrap"
					},
					markerValue: {bindTo: "columnCaption"},
					visible: {
						bindTo: "viewVisible",
						bindConfig: {
							converter: function(x) {
								return x !== false;
							}
						}
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: filterName + "ViewContainer",
							selectors: {
								el: "#" + filterName + "ViewContainer",
								wrapEl: "#" + filterName + "ViewContainer"
							},
							classes: {
								wrapClassName: "filter-caption-value-container"
							},
							items: [
								{
									className: "Terrasoft.Label",
									classes: {
										labelClass: ["filter-caption-label", "filter-element-with-right-space"]
									},
									caption: {
										bindTo: "columnCaption",
										bindConfig: {
											converter: function(x) {
												if (x) {
													return x + ":";
												}
												return x;
											}
										}
									},
									visible: {
										bindTo: "columnCaption",
										bindConfig: {
											converter: function(x) {
												return !(x !== "" && !x);
											}
										}
									}
								},
								{
									className: "Terrasoft.Label",
									classes: {
										labelClass: ["filter-value-label", "filter-element-with-right-space"]
									},
									caption: {
										bindTo: "displayValue"
									},
									click: {
										bindTo: "editFilter"
									},
									tag: filterName
								}
							]
						},

						{
							className: "Terrasoft.Button",
							classes: {
								wrapperClass: "filter-remove-button"
							},
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							imageConfig: quickFilterViewResources.localizableImages.RemoveButtonImage,
							click: {
								bindTo: "removeFilter"
							},
							tag: filterName
						}
					]
				};
				if (folderType) {
					var menu = [
						{
							className: "Terrasoft.MenuItem",
							caption: quickFilterViewResources.localizableStrings.SelectAnotherFolder,
							click: {bindTo: "openFoldersTree"}
						}
					];
					if (folderType.value === ConfigurationConstants.Folder.Type.Search) {
						menu.push(
							{
								className: "Terrasoft.MenuItem",
								caption: quickFilterViewResources.localizableStrings.EditFilterGroup,
								click: {bindTo: "openEditFolderItem"},
								tag: filterName
							}
						);
					}
					var folderIcon = {
						className: "Terrasoft.Button",
						classes: {wrapperClass: "folder-icon-button"},
						caption: {bindTo: "displayValue"},
						menu:  {items: menu},
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						imageConfig: folderType.value === ConfigurationConstants.Folder.Type.General
							? quickFilterViewResources.localizableImages.GeneralFolderImage
							: quickFilterViewResources.localizableImages.SearchFolderImage,
						tag: filterName
					};
					viewConfig.classes = {
						wrapClassName: "folder-filter-inner-container filter-element-container-wrap"
					};
					var itemsContainer = viewConfig.items[0];
					itemsContainer.items = [folderIcon];
				}

				return viewConfig;
			}

			function getFilterView(tag, filterName, filterViewModel) {
				var Ext = this.getExt();
				var customFiltersViewsContainer = Ext.get("fixedFilter" + tag + "Container");
				var filterView = Ext.create("Terrasoft.Container",
					this.generateFilterViewConfig(filterName));
				filterView.bind(filterViewModel);
				if (customFiltersViewsContainer) {
					filterView.render(customFiltersViewsContainer);
				}
				return filterView;
			}

			return {
				generate: generate
			};

		});
