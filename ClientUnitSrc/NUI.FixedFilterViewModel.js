define('FixedFilterViewModel', ['ext-base', 'sandbox', 'terrasoft', 'FixedFilterViewModelResources'],
	function(Ext, sandbox, Terrasoft, resources) {

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
			}
			else if (filterInfo.value) {
				if (filterInfo.isLookup) {
					filter = Terrasoft.createColumnInFilterWithParameters(filterInfo.columnName,
						filterInfo.value);
				}
				else {
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
						filterGroup.add(filterInfo.name + 'DefaultFilter', filter);
						filterGroup.add(filterInfo.name + 'AppendedFilter', appendFilter);
						return filterGroup;
					}
					else {
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
				}
				else {
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
					var periodConfig = this.config.getPeriodFilterConfig(filterConfig);
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
				}
				else {
					var entityColumn = this.entitySchema.getColumnByName(filterConfig.columnName);
					filterInfo.columnName = filterConfig.columnName;
					filterInfo.isLookup = entityColumn.isLookup;
					if (entityColumn) {
						if (entityColumn.isLookup) {
							var values = this.get(getSelectedLookupValuesPropertyName(filterConfig.name));
							var filterValues = [];
							values.each(function(value) {
								filterValues.push(value.get('value'));
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
				}
				else if (filterConfig.appendFilter) {
					filterInfo.appendFilter = filterConfig.appendFilter;
					filterInfo.appendFilterLogicalOperation = filterConfig.appendFilterLogicalOperation;
				}
				filtersValues[filterConfig.name] = filterInfo;
			}, this);
			return filtersValues;
		}

		function generate(schema) {
			var viewModelConfig = {
				entitySchema: schema.entitySchema,
				config: schema,
				columns: {
				},
				values: {
				},
				methods: {
					getFilters: getFilters,
					prepareFilters: prepareFilters,
					getSelectedLookupValuesPropertyName: getSelectedLookupValuesPropertyName,
					setPeriod: setPeriod,
					setCurrentContact: setCurrentContact,
					clearLookupFilter: clearLookupFilter,
					clearPeriodFilter: clearPeriodFilter,
					periodChanged: periodChanged,
					initialize: initialize,
					applyFilter: applyFilter,
					clearSimpleFilterProperties: clearSimpleFilterProperties,
					addLookupFilter: addLookupFilter,
					editFilter: editLookupFilter,
					subscribeCollectionEvents: subscribeCollectionEvents,
					addFilterValue: addFilterValue,
					addFilterValueByFilterConfig: addFilterValueByFilterConfig,
					addNonPeriodFilterValue: addNonPeriodFilterValue,
					updateButtonCaption: updateButtonCaption,
					getFilterValue: getFilterValue
				}
			};
			Terrasoft.each(schema.filters, function(filterConfig) {
				if (filterConfig.dataValueType === Terrasoft.DataValueType.DATE) {
					var periodConfig = schema.getPeriodFilterConfig(filterConfig);
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
				}
				else {
					var column = generateViewModelColumn(filterConfig.name, filterConfig.columnName);
					viewModelConfig.columns[column.name] = column;
					if (filterConfig.dataValueType === Terrasoft.DataValueType.LOOKUP ||
						filterConfig.dataValueType === Terrasoft.DataValueType.ENUM) {
						column.referenceSchemaName = filterConfig.referenceSchemaName ||
							schema.entitySchema.columns[filterConfig.columnName].referenceSchemaName;
						viewModelConfig.values[column.name + 'List'] = new Terrasoft.Collection();
						var selectedValuesCollection = new Terrasoft.Collection();
						viewModelConfig.values[getSelectedLookupValuesPropertyName(column.name)] =
							selectedValuesCollection;
						column.isLookup = true;
						var lookupListColumnConfig = {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: column.name + 'List',
							isCollection: true
						};
						viewModelConfig.columns[lookupListColumnConfig.name] = lookupListColumnConfig;
						if (filterConfig.prepareList) {
							viewModelConfig.methods['get' + lookupListColumnConfig.name] = filterConfig.prepareList;
						}
						var buttonCaptionColumnConfig = {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: filterConfig.name + 'ButtonCaption'
						};
						if (filterConfig.filter) {
							viewModelConfig.values[filterConfig.name + 'LookupFilter'] = filterConfig.filter();
						}
						viewModelConfig.columns[buttonCaptionColumnConfig.name] = buttonCaptionColumnConfig;
						viewModelConfig.values[buttonCaptionColumnConfig.name] = filterConfig.caption;
						viewModelConfig.values[filterConfig.name + 'Views'] = new Terrasoft.Collection();
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
						name: 'displayValue'
					},
					filterName: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: 'filterName'
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

		function initialize() {
			this.suspendUpdate = true;
			var currentFilter = this.get('currentFilterName');
			this.clearSimpleFilterProperties();
			var addedFilter = this.getAddedFixedFilter();
			var filterState = this.getFilterState('Fixed');
			Terrasoft.each(this.config.filters, function(filterInfo) {
				var value;
				if (filterInfo.name === 'Owner') {
					if (filterInfo.addOwnerCaption) {
						this.set('addOwnerCaption', filterInfo.addOwnerCaption);
					} else {
						this.set('addOwnerCaption', resources.localizableStrings.AddOwnerCaption);
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
				}
				else if (value) {
					this.addFilterValueByFilterConfig(filterInfo, value);
				}
			}, this);
			if (addedFilter) {
				this.set('currentFilterName', addedFilter.currentFilter);
				Terrasoft.each(addedFilter.values, function(currentValue) {
					this.addNonPeriodFilterValue(addedFilter.columnName, currentValue);
				}, this);
				this.clearSimpleFilterProperties();
			}
			this.suspendUpdate = false;
		}

		function subscribeCollectionEvents(filterName) {
			var selectedValues = this.get(getSelectedLookupValuesPropertyName(filterName));
			selectedValues.on('dataLoaded', function() {
				var filtersViews = this.get(filterName + 'Views');
				selectedValues.each(function(filterViewModel) {
					filtersViews.add(filterViewModel.get('filterName'), filterViewModel.get('view'));
				});
				this.updateButtonCaption(filterName);
			}, this);
			selectedValues.on('add', function(filterViewModel) {
				var filtersViews = this.get(filterName + 'Views');
				filtersViews.add(filterViewModel.get('filterName'), filterViewModel.get('view'));
				this.updateButtonCaption(filterName);
			}, this);
			selectedValues.on('remove', function(filterViewModel) {
				var filtersViews = this.get(filterName + 'Views');
				var view = filtersViews.removeByKey(filterViewModel.get('filterName'));
				view.destroy();
				this.updateButtonCaption(filterName);
			}, this);
			selectedValues.on('clear', function() {
				var filtersViews = this.get(filterName + 'Views');
				filtersViews.each(function(view) {
					view.destroy();
				});
				filtersViews.clear();
				this.updateButtonCaption(filterName);
			}, this);
		}

		function addNonPeriodFilterValue(tag, simpleFilterValue) {
			var selectedValues = this.get(getSelectedLookupValuesPropertyName(tag));
			var oldFilterName = this.get('currentFilterName');
			var filterName = 'fixedFilter' + tag + simpleFilterValue.value;
			if (oldFilterName && filterName !== oldFilterName) {
				selectedValues.removeByKey(oldFilterName);
			}
			var simpleFilter = selectedValues.find(filterName);
			if (!simpleFilter) {
				var config = generateFilterViewModelConfig();
				simpleFilter = this.getFilterViewModel(tag, filterName, config);
				simpleFilter.set('name', tag);
				simpleFilter.set('filterName', filterName);
				simpleFilter.set('value', simpleFilterValue.value);
				simpleFilter.set('displayValue', simpleFilterValue.displayValue);
				selectedValues.add(filterName, simpleFilter);
				this.filterChanged();
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
			this.set('currentFilterName', null);
		}

		function setPeriod(tag) {
			if (!tag) {
				return;
			}
			var indexOfSeparator = tag.lastIndexOf('_');
			if (indexOfSeparator === -1) {
				return;
			}
			var filterName = tag.substring(0, indexOfSeparator);
			var periodName = tag.substring(indexOfSeparator + 1);
			var periodFilterConfig;
			Terrasoft.each(this.config.filters, function(filterConfig) {
				if (filterConfig.name === filterName) {
					periodFilterConfig = this.config.getPeriodFilterConfig(filterConfig);
				}
			}, this);
			if (!periodFilterConfig) {
				return;
			}
			var startDate = new Date();
			var dueDate;
			switch (periodName) {
				case 'Yesterday':
					startDate = Terrasoft.startOfDay(Ext.Date.add(startDate, 'd', -1));
					dueDate = Terrasoft.endOfDay(startDate);
					break;
				case 'Tomorrow':
					startDate = Terrasoft.startOfDay(Ext.Date.add(startDate, 'd', 1));
					dueDate = Terrasoft.endOfDay(startDate);
					break;
				case 'PastWeek':
					startDate = Terrasoft.startOfWeek(Ext.Date.add(startDate, 'd', -7));
					dueDate = Terrasoft.endOfWeek(startDate);
					break;
				case 'CurrentWeek':
					startDate = Terrasoft.startOfWeek(startDate);
					dueDate = Terrasoft.endOfWeek(startDate);
					break;
				case 'NextWeek':
					startDate = Terrasoft.startOfWeek(Ext.Date.add(startDate, 'd', 7));
					dueDate = Terrasoft.endOfWeek(startDate);
					break;
				case 'PastMonth':
					startDate = Terrasoft.startOfMonth(Ext.Date.add(startDate, 'mo', -1));
					dueDate = Terrasoft.endOfMonth(startDate);
					break;
				case 'CurrentMonth':
					startDate = Terrasoft.startOfMonth(startDate);
					dueDate = Terrasoft.endOfMonth(startDate);
					break;
				case 'NextMonth':
					startDate = Terrasoft.startOfMonth(Ext.Date.add(startDate, 'mo', 1));
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
				var starColumnName = tag.periodConfig.startDateColumnName;
				var dueColumnName = tag.periodConfig.dueDateColumnName;
				var startDate = this.get(starColumnName);
				var dueDate = this.get(dueColumnName);
				if (startDate && dueDate && startDate > dueDate) {
					this.suspendUpdate = true;
					if (tag.currentColumnName === starColumnName) {
						this.set(dueColumnName, value);
					}
					else {
						this.set(starColumnName, value);
					}
					this.suspendUpdate = false;
				}
				if (this.filterChanged) {
					this.filterChanged();
				}
			}
		}

		function setCurrentContact(tag) {
			if (!tag) {
				return;
			}
			var filters = this.get(getSelectedLookupValuesPropertyName(tag));
			filters.clear();
			this.addNonPeriodFilterValue(tag, Terrasoft.SysValue.CURRENT_USER_CONTACT);
		}

		function clearLookupFilter(tag) {
			if (!tag) {
				return;
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
			return 'Selected' + propertyName + 'List';
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

		function updateButtonCaption(filterName) {
			var filterInfo;
			Terrasoft.each(this.config.filters, function(filterConfig) {
				if (filterConfig.name === filterName) {
					filterInfo = filterConfig;
				}
			}, this);
			if (filterInfo) {
				var selectedCollection = this.get(getSelectedLookupValuesPropertyName(filterInfo.name));
				if (!selectedCollection || selectedCollection.collection.length === 0) {
					this.set(filterName + 'ButtonCaption', filterInfo.caption);
					return;
				}
			}
			this.set(filterName + 'ButtonCaption', '');
		}

		function addLookupFilter(filterName) {
			//this.showSimpleFilterEdit(filterName);
			this.lookupSelecting(filterName);
		}

		function editLookupFilter(filterName, tag) {
			this.lookupSelecting(filterName, tag);
//			var filters = this.get(getSelectedLookupValuesPropertyName(filterName));
//			var filterViewModel = filters.find(tag);
//			if (filterViewModel) {
//				var value = {
//					value: filterViewModel.get('value'),
//					displayValue: filterViewModel.get('displayValue')
//				};
//				this.set('currentFilterName', tag);
//				this.set(filterName, value);
//				this.showSimpleFilterEdit(filterName);
//			}
		}

		function getFilterValue(filterName) {
			var result = {};
			Terrasoft.each(this.config.filters, function(filterConfig) {
				var filterValue;
				if (!filterName || filterConfig.name === filterName) {
					if (filterConfig.dataValueType === Terrasoft.DataValueType.DATE) {
						var periodConfig = this.config.getPeriodFilterConfig(filterConfig);
						var startDate = this.get(periodConfig.startDateColumnName);
						var dueDate = this.get(periodConfig.dueDateColumnName);
						filterValue = {
							startDate: startDate,
							dueDate: dueDate
						};
					} else if (filterConfig.dataValueType === Terrasoft.DataValueType.LOOKUP ||
						filterConfig.dataValueType === Terrasoft.DataValueType.ENUM) {
						var values = this.get(getSelectedLookupValuesPropertyName(filterConfig.name));
						filterValue = [];
						values.each(function(value) {
							filterValue.push({
								value: value.get('value'),
								displayValue: value.get('displayValue')
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
				var periodConfig = this.config.getPeriodFilterConfig(filterConfig);
				this.set(periodConfig.startDateColumnName, filterValue.startDate);
				this.set(periodConfig.dueDateColumnName, filterValue.dueDate);
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

		return {
			generate: generate
		};

	});