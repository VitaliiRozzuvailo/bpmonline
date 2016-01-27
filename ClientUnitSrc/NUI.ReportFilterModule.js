define("ReportFilterModule", ["ext-base", "terrasoft", "sandbox", "ReportFilterModuleResources", "LookupUtilities"],
	function(Ext, Terrasoft, sandbox, resources, LookupUtilities) {
		var reportConfig = {};
		var formingMethodSelectedFilter;
		var periodFilterConfig;
		var prepareFiltersInfo;
		var hasPeriodFilter;
		var columnInfo = [];
		var viewModel;

		function render(renderTo) {
			reportConfig = sandbox.publish("GetReportConfig", null, ["GetReportConfigKey"]);
			require([reportConfig.sysSchemaName], function(viewFilterConfig) {
				var config = viewFilterConfig;
				if (!config) {
					return;
				}
				var entitySchema = sandbox.publish("GetSectionEntitySchema");
				var viewModelConfig = {
					entitySchema: entitySchema,
					methods: {setEntityColumnInfo: setEntityColumnInfo}
				};
				var viewConfig = {
					className: "Terrasoft.Container",
					id: "report-controls-container-test",
					selectors: {wrapEl: "#report-controls-container-test"},
					items: []
				};
				var queryConfig = [];
				generateFilterItems(config, viewConfig, viewModelConfig, queryConfig);
				var view = Ext.create(viewConfig.className, viewConfig);
				if (viewModel) {
					view.bind(viewModel);
					view.render(renderTo);
				} else {
					viewModel = Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
					Terrasoft.each(config, function(filterConfig) {
						var defValue = filterConfig.defValue;
						var columnName = filterConfig.columnName || filterConfig.name;
						if (filterConfig.dataValueType === "PeriodFilter") {
							prepareFiltersInfo = prepareFilters(viewModel);
						}
						if (defValue) {
							switch (filterConfig.dataValueType) {
								case "LOOKUP":
								case "ENUM":
									addInColumnInfo(columnName, defValue.value, filterConfig.parameterName,
										filterConfig.filter);
									viewModel.set(columnName, defValue);
									break;
								case "DATE":
									addInColumnInfo(columnName, defValue, filterConfig.parameterName,
										filterConfig.filter);
									viewModel.set(columnName, defValue);
									break;
								default:
									break;
							}
						}
					}, this);

					var baseGetLookupQuery = viewModel.getLookupQuery;
					viewModel.getLookupQuery = function(filterValue, columnName) {
						var esq = baseGetLookupQuery.apply(this, arguments);
						esq.filters.add(getLookupQueryFilters(this, columnName));
						return esq;
					};

					sandbox.subscribe("GetReportFilterCollection", function() {
						if (columnInfo.length > 0) {
							queryConfig.push(getControlsValue);
						}
						var paramCollection = {};
						Terrasoft.each(queryConfig, function(addFilter) {
							addFilter(paramCollection);
						}, this);
						return paramCollection;
					});
					view.bind(viewModel);
					view.render(renderTo);
				}
			});
		}

		var generateFilterItems = function(controlsConfig, viewConfig, viewModel, filterQueryConfig) {
			Terrasoft.each(controlsConfig, function(filterConfig) {
				switch (filterConfig.dataValueType) {
					case "PeriodFilter":
						hasPeriodFilter = true;
						var periodFilterView = getPeriodFilterViewConfig(filterConfig);
						var periodFilterViewModel = getPeriodFilterViewModelConfig(filterConfig);
						Ext.merge(viewModel, periodFilterViewModel);
						filterQueryConfig.push(getPeriodFilterQuery);
						Terrasoft.each(periodFilterView, function(item) {
							viewConfig.items.push(item);
						}, this);
						break;
					case "FormingMethod":
						var formingMethodView = getFormingMethodViewConfig();
						var formingMethodViewModel = getFormingMethodViewModel();
						Ext.merge(viewModel, formingMethodViewModel);
						filterQueryConfig.push(getFormingMethodFilterQuery);
						Terrasoft.each(formingMethodView, function(item) {
							viewConfig.items.push(item);
						}, this);
						break;
					case "LOOKUP":
						var lookupMethodViewModel = getLookupMethodViewModel(filterConfig, viewModel);
						Ext.merge(viewModel, lookupMethodViewModel);
						viewConfig.items.push(getLabelControl(filterConfig));
						viewConfig.items.push({
							id: "lookup-edit-" + filterConfig.name,
							className: "Terrasoft.LookupEdit",
							markerValue: filterConfig.columnName,
							classes: {
								wrapClass: "report-custom-control"
							},
							value: {
								bindTo: filterConfig.columnName
							},
							loadVocabulary: {
								bindTo: "loadVocabulary"
							},
							list: {
								bindTo: filterConfig.columnName + "List"
							},
							change: {
								bindTo: "setEntityColumnInfo"
							},
							tag: filterConfig.columnName
						});
						break;
					case "ENUM":
						var enumMethodViewModel = getLookupMethodViewModel(filterConfig, viewModel);
						Ext.merge(viewModel, enumMethodViewModel);
						viewConfig.items.push(getLabelControl(filterConfig));
						viewConfig.items.push({
							id: "enum-edit-" + filterConfig.name,
							className: "Terrasoft.ComboBoxEdit",
							markerValue: filterConfig.columnName,
							classes: {
								wrapClass: "report-custom-control"
							},
							value: {
								bindTo: filterConfig.columnName
							},
							list: {
								bindTo: filterConfig.columnName + "List"
							},
							change: {
								bindTo: "setEntityColumnInfo"
							},
							tag: filterConfig.columnName
						});
						break;
					case "INTEGER":
						viewConfig.items.push(getLabelControl(filterConfig));
						viewConfig.items.push({
							id: "integer-edit-" + filterConfig.name,
							className: "Terrasoft.IntegerEdit"
						});
						break;
					case "DATE":
						var dateViewModel = getDateViewModel(filterConfig);
						Ext.merge(viewModel, dateViewModel);
						viewConfig.items.push(getLabelControl(filterConfig));
						viewConfig.items.push(getDateControl(filterConfig));
						break;
					case "MONEY":
					case "FLOAT":
						viewConfig.items.push({
							id: "float-edit-" + filterConfig.name,
							className: "Terrasoft.FloatEdit"
						});
						break;
					case "DATE_TIME":
						viewConfig.items.push(getLabelControl(filterConfig));
						viewConfig.items.push({
								className: "Terrasoft.Container",
								id: filterConfig.name,
								classes: {
									wrapClassName: ["datetimeeditcontainer-class"]
								},
								selectors: {
									wrapEl: "#" + filterConfig.name
								},
								items: [
									getDateControl(filterConfig),
									getTimeControl(filterConfig)
								]
							}
						);
						break;
					case "TIME":
						viewConfig.items.push(getLabelControl(filterConfig));
						viewConfig.items.push(getTimeControl(filterConfig));
						break;
					case "BOOLEAN":
						viewConfig.items.push(getLabelControl(filterConfig));
						viewConfig.items.push(getBooleanControl(filterConfig));
						break;
					default:
						break;
				}
			}, this);
		};

		function setEntityColumnInfo(selectedValue, columnName) {
			if (columnName) {
				var parameterName = this.columns[columnName] ? this.columns[columnName].parameterName : columnName;
				var filter = this.columns[columnName] ? this.columns[columnName].filter : null;
				var inputValue;
				if (selectedValue == null || !selectedValue.value) {
					inputValue = selectedValue;
				} else {
					inputValue = selectedValue.value;
				}
				if (columnInfo.length === 0) {
					addInColumnInfo(columnName, inputValue, parameterName, filter);
				} else {
					var hasColumn = false;
					for (var i in columnInfo) {
						if (columnName === columnInfo[i].columnName) {
							hasColumn = true;
							columnInfo[i].value = inputValue;
							columnInfo[i].parameterName = parameterName;
						}
					}
					if (!hasColumn) {
						addInColumnInfo(columnName, inputValue, parameterName, filter);
					}
				}
			}
		}

		function addInColumnInfo(name, value, parameterName, filter) {
			columnInfo.push({
				columnName: name,
				value: value,
				parameterName: parameterName,
				filter: filter
			});
		}

		function getDateViewModel(filterConfig) {
			var viewModelConfig = {
				columns: {
				},
				values: {
				}
			};
			var column = generateViewModelColumn(filterConfig);
			viewModelConfig.columns[column.name] = column;
			var columnName = filterConfig.columnName || filterConfig.name;
			viewModelConfig.values[columnName] = filterConfig.defValue;
			return viewModelConfig;
		}

		function getLookupMethodViewModel(filterConfig, viewModel) {
			var viewModelConfig = {
				columns: {
				},
				values: {

				},
				methods: {
					loadVocabulary: loadVocabulary
				}
			};
			var column = generateViewModelColumn(filterConfig);
			viewModelConfig.columns[column.name] = column;
			if (filterConfig.dataValueType === "LOOKUP" ||
				filterConfig.dataValueType === "ENUM") {
				if (viewModel.entitySchema && viewModel.entitySchema.columns[column.name]) {
					column.referenceSchemaName = viewModel.entitySchema.columns[column.name].referenceSchemaName;
				}

				viewModelConfig.values[column.name] = filterConfig.defValue;
				viewModelConfig.values[column.name + "List"] = new Terrasoft.Collection();
				var selectedValuesCollection = new Terrasoft.Collection();
				viewModelConfig.values["Selected" + column.name + "List"] = selectedValuesCollection;
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
				viewModelConfig.values[filterConfig.name + "Views"] = new Terrasoft.Collection();
			}
			return viewModelConfig;
		}

		function getLookupQueryFilters(scope, columnName) {
			var filter = null;
			Terrasoft.each(columnInfo, function(columnItem) {
				if (columnItem.columnName === columnName) {
					filter = columnItem.filter;
					if (Ext.isFunction(filter)) {
						filter = filter.call(this);
					}
				}
			}, scope);
			var filterGroup = Ext.create("Terrasoft.FilterGroup");
			if (!Ext.isEmpty(filter)) {
				filterGroup.addItem(filter);
			}
			return filterGroup;
		}

		function loadVocabulary(args, tag) {
			var config = {
				entitySchemaName: this.entitySchema.columns[tag].referenceSchemaName,
				multiSelect: false,
				columnName: tag,
				searchValue: args.searchValue,
				filters: getLookupQueryFilters(this, tag)
			};
			var self = this;
			var callback = function(args) {
				var columnName = args.columnName;
				var collection = args.selectedRows;
				if (collection.getCount() > 0) {
					self.set(columnName, collection.getItems()[0]);
					self.setEntityColumnInfo(collection.getItems()[0], columnName);
				}
			};
			LookupUtilities.Open(sandbox, config, callback, this, null, false, false);
		}

		function generateViewModelColumn(filterConfig) {
			return {
				type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
				name: filterConfig.name,
				columnPath: filterConfig.columnName || filterConfig.name,
				parameterName: filterConfig.parameterName
			};
		}

		function getControlsValue(paramCollection) {
			for (var i in columnInfo) {
				paramCollection[columnInfo[i].parameterName] = columnInfo[i].value;
			}
		}

		function getPeriodFilterQuery(parametrs) {
			var filterInfo = prepareFiltersInfo;
			parametrs.DateFilterEnabled = hasPeriodFilter;
			parametrs.StartDate = null;
			parametrs.EndDate = null;
			if (hasPeriodFilter) {
				var startDate = filterInfo.startDate.value;
				var dueDate = filterInfo.dueDate.value;
				if (startDate && dueDate) {
					parametrs.StartDate = Terrasoft.startOfDay(startDate);
					parametrs.EndDate = Terrasoft.endOfDay(dueDate);
				} else if (startDate) {
					parametrs.StartDate = Terrasoft.startOfDay(startDate);
				} else if (dueDate) {
					parametrs.EndDate = Terrasoft.endOfDay(dueDate);
				}
			}
		}

		function getPeriodFilterViewModelConfig(filterConfig) {
			var viewModelConfig = {
				config: filterConfig,
				columns: {
				},
				values: {
					isShowPeriod: true
				},
				methods: {
					prepareFilters: prepareFilters,
					setPeriod: setPeriod,
					periodChanged: periodChanged,
					disablePeriodFilter: disablePeriodFilter
				}
			};
			periodFilterConfig = getPeriodFilterConfig(filterConfig);
			var startDateColumn = generatePeriodViewModelColumn(periodFilterConfig.startDateColumnName);
			viewModelConfig.values[periodFilterConfig.startDateColumnName] = periodFilterConfig.startDateDefValue;
			viewModelConfig.columns[periodFilterConfig.startDateColumnName] = startDateColumn;
			var dueDateColumn = generatePeriodViewModelColumn(periodFilterConfig.dueDateColumnName);
			viewModelConfig.columns[dueDateColumn.name] = dueDateColumn;
			viewModelConfig.values[periodFilterConfig.dueDateColumnName] = periodFilterConfig.dueDateDefValue;
			return viewModelConfig;
		}

		function prepareFilters(viewModel) {
			var filterInfo = {};
			var startDate = viewModel.get(periodFilterConfig.startDateColumnName);
			var dueDate = viewModel.get(periodFilterConfig.dueDateColumnName);
			filterInfo.startDate = {
				columnName: periodFilterConfig.startDateColumnName,
				value: startDate
			};
			filterInfo.dueDate = {
				columnName: periodFilterConfig.dueDateColumnName,
				value: dueDate
			};
			filterInfo.singleColumn = periodFilterConfig.singleColumn;
			return filterInfo;
		}

		function getPeriodFilterConfig(filterConfig) {
			var resultConfig = {};
			var startDateColumnName = filterConfig.columnName;
			var startDateDefValue = filterConfig.defValue || new Date();
			var dueDateColumnName = filterConfig.columnName;
			var dueDateDefValue = filterConfig.defValue || new Date();
			if (filterConfig.startDate) {
				startDateColumnName = filterConfig.startDate.columnName || startDateColumnName;
				startDateDefValue = filterConfig.startDate.defValue || startDateDefValue;
				if (filterConfig.dueDate) {
					dueDateColumnName = filterConfig.dueDate.columnName || startDateColumnName || dueDateColumnName;
					dueDateDefValue = filterConfig.dueDate.defValue || startDateDefValue || dueDateDefValue;
				}
				else {
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

		function generatePeriodViewModelColumn(columnName) {
			return {
				name: columnName,
				columnPath: columnName,
				dataValueType: Terrasoft.DataValueType.DATE,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			};
		}

		function getPeriodFilterViewConfig(filterConfig) {
			var items = [
				{
					className: "Terrasoft.Label",
					classes: {
						labelClass: "report-custom-label-with-top"
					},
					caption: resources.localizableStrings.FilteringOptions
				},
				{
					className: "Terrasoft.Container",
					id: "showPeriodContainer",
					classes: {
						wrapClassName: [
							"report-custom-view-container"
						]
					},
					selectors: {
						wrapEl: "#showPeriodContainer"
					},
					items: [
						{
							className: "Terrasoft.CheckBoxEdit",
							tag: "showPeriod",
							classes: {
								wrapClass: "report-custom-control-container"
							},
							checked: {
								bindTo: "isShowPeriod"
							},
							checkedchanged: {
								bindTo: "disablePeriodFilter"
							}
						},
						{
							className: "Terrasoft.Label",
							classes: {
								labelClass: "report-custom-label-container"
							},
							caption: resources.localizableStrings.ShowPeriod
						}
					]
				},
				{
					className: "Terrasoft.Container",
					id: "reportFilter" + filterConfig.name + "ButtonContainer",
					selectors: {
						el: "#reportFilter" + filterConfig.name + "ButtonContainer",
						wrapEl: "#reportFilter" + filterConfig.name + "ButtonContainer"
					},
					items: [
						getPeriodreportButtonViewConfig(filterConfig.name)
					],
					classes: {
						wrapClassName: "report-filter-inner-container"
					}
				},
				{
					className: "Terrasoft.Container",
					id: "reportFilter" + filterConfig.name + "ValuesContainer",
					selectors: {
						el: "#reportFilter" + filterConfig.name + "ValuesContainer",
						wrapEl: "#reportFilter" + filterConfig.name + "ValuesContainer"
					},
					items: [
						getDateFilterValueLabel(filterConfig, "startDate",
							resources.localizableStrings.StartDatePlaceholder),
						{
							className: "Terrasoft.Label",
							classes: {
								labelClass: ["filter-caption-label", "report-element-with-space"]
							},
							caption: resources.localizableStrings.PeriodToLabelCaption
						},
						getDateFilterValueLabel(filterConfig, "dueDate",
							resources.localizableStrings.DueDatePlaceholder),
						{
							className: "Terrasoft.Button",
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							imageConfig: resources.localizableImages.RemoveButtonImage,
							click: {
								bindTo: "clearPeriodFilter"
							}
						}
					],
					classes: {
						wrapClassName: "report-inner-container"
					}
				}
			];
			return items;
		}

		function disablePeriodFilter(isChecked) {
			if (isChecked) {
				this.isShowPeriod = true;
				hasPeriodFilter = true;
			} else {
				this.isShowPeriod = false;
				hasPeriodFilter = false;
			}

		}

		function setPeriod(tag) {
			if (!tag) {
				return;
			}
			var indexOfSeparator = tag.lastIndexOf("_");
			if (indexOfSeparator === -1) {
				return;
			}
			var periodName = tag.substring(indexOfSeparator + 1);
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
			prepareFiltersInfo.startDate.value = startDate;
			prepareFiltersInfo.dueDate.value = dueDate;
		}

		function periodChanged(value, tag) {
			if (this.suspendUpdate) {
				return;
			}
			var currentColumnName = tag.currentColumnName;
			this.suspendUpdate = true;
			var dateValue = value;
			switch (currentColumnName) {
				case periodFilterConfig.startDateColumnName:
					dateValue = Terrasoft.startOfDay(dateValue);
					prepareFiltersInfo.startDate.value = dateValue;
					break;
				case periodFilterConfig.dueDateColumnName:
					dateValue = Terrasoft.endOfDay(dateValue);
					prepareFiltersInfo.dueDate.value = dateValue;
					break;
			}
			this.set(currentColumnName, dateValue);
			this.suspendUpdate = false;
		}

		function getDateFilterValueLabel(filterConfig, columnPlace, placeholder) {
			var columnName;
			var periodFilterConfig = getPeriodFilterConfig(filterConfig);
			switch (columnPlace) {
				case "startDate":
					columnName = periodFilterConfig.startDateColumnName;
					break;
				case "dueDate":
					columnName = periodFilterConfig.dueDateColumnName;
					break;
				default:
					break;
			}
			return {
				id: "reportFilter" + columnName + "View",
				className: "Terrasoft.DateEdit",
				classes: {labelClass: ["filter-element-with-right-space"]},
				value: {bindTo: columnName},
				width: "145px",
				tag: {currentColumnName: columnName},
				placeholder: placeholder,
				enabled: {bindTo: "isShowPeriod"},
				change: {bindTo: "periodChanged"}
			};
		}

		function getFormingMethodViewConfig() {
			var items = [
				{
					className: "Terrasoft.Label",
					classes: {
						labelClass: "report-custom-label-with-top"
					},
					caption: resources.localizableStrings.FormingMethod
				},
				{
					className: "Terrasoft.Container",
					id: "bySelectedContainer",
					classes: {
						wrapClassName: [
							"report-custom-view-container"
						]
					},
					selectors: {
						wrapEl: "#bySelectedContainer"
					},
					items: [
						{
							className: "Terrasoft.RadioButton",
							tag: "bySelected",
							checkedchanged: {
								bindTo: "onCheckChange"
							},
							checked: {
								bindTo: "formingMethodButtonsGroup"
							},
							classes: {
								wrapClass: "report-custom-control-container"
							}
						},
						{
							className: "Terrasoft.Label",
							classes: {
								labelClass: "report-custom-label-container"
							},
							caption: {
								bindTo: "calculateSelectedRecord"
							}
						}
					]
				},
				{
					className: "Terrasoft.Container",
					id: "byFilteredContainer",
					classes: {
						wrapClassName: [
							"report-custom-view-container"
						]
					},
					selectors: {
						wrapEl: "#byFilteredContainer"
					},
					items: [
						{
							className: "Terrasoft.RadioButton",
							tag: "byFiltered",
							checked: {
								bindTo: "formingMethodButtonsGroup"
							},
							checkedchanged: {
								bindTo: "onCheckChange"
							},
							classes: {
								wrapClass: "report-custom-control-container"
							}
						},
						{
							className: "Terrasoft.Label",
							classes: {
								labelClass: "report-custom-label-container"
							},
							caption: resources.localizableStrings.ByFilteredLabel
						}
					]
				},
				{
					className: "Terrasoft.Container",
					id: "byAllContainer",
					classes: {
						wrapClassName: [
							"report-custom-view-container"
						]
					},
					selectors: {
						wrapEl: "#byAllContainer"
					},
					items: [
						{
							className: "Terrasoft.RadioButton",
							tag: "byAll",
							checkedchanged: {
								bindTo: "onCheckChange"
							},
							checked: {
								bindTo: "formingMethodButtonsGroup"
							},
							classes: {
								wrapClass: "report-custom-control-container"
							}
						},
						{
							className: "Terrasoft.Label",
							classes: {
								labelClass: "report-custom-label-container"
							},
							caption: resources.localizableStrings.ByAllRecord
						}
					]
				}
			];
			return items;
		}

		function getPeriodreportButtonViewConfig(filterName) {
			var config = getReportButtonBaseConfig();
			config.imageConfig = resources.localizableImages.PeriodButtonImage;
			config.menu = {
				items: [
					{
						className: "Terrasoft.MenuItem",
						caption: resources.localizableStrings.YesterdayCaption,
						click: {
							bindTo: "setPeriod"
						},
						tag: filterName + "_Yesterday"
					},
					{
						className: "Terrasoft.MenuItem",
						caption: resources.localizableStrings.TodayCaption,
						click: {
							bindTo: "setPeriod"
						},
						tag: filterName + "_Today"
					},
					{
						className: "Terrasoft.MenuItem",
						caption: resources.localizableStrings.TomorrowCaption,
						click: {
							bindTo: "setPeriod"
						},
						tag: filterName + "_Tomorrow"
					},
					{
						className: "Terrasoft.MenuSeparator"
					},
					{
						className: "Terrasoft.MenuItem",
						caption: resources.localizableStrings.PastWeekCaption,
						click: {
							bindTo: "setPeriod"
						},
						tag: filterName + "_PastWeek"
					},
					{
						className: "Terrasoft.MenuItem",
						caption: resources.localizableStrings.CurrentWeekCaption,
						click: {
							bindTo: "setPeriod"
						},
						tag: filterName + "_CurrentWeek"
					},
					{
						className: "Terrasoft.MenuItem",
						caption: resources.localizableStrings.NextWeekCaption,
						click: {
							bindTo: "setPeriod"
						},
						tag: filterName + "_NextWeek"
					},
					{
						className: "Terrasoft.MenuSeparator"
					},
					{
						className: "Terrasoft.MenuItem",
						caption: resources.localizableStrings.PastMonthCaption,
						click: {
							bindTo: "setPeriod"
						},
						tag: filterName + "_PastMonth"
					},
					{
						className: "Terrasoft.MenuItem",
						caption: resources.localizableStrings.CurrentMonthCaption,
						click: {
							bindTo: "setPeriod"
						},
						tag: filterName + "_CurrentMonth"
					},
					{
						className: "Terrasoft.MenuItem",
						caption: resources.localizableStrings.NextMonthCaption,
						click: {
							bindTo: "setPeriod"
						},
						tag: filterName + "_NextMonth"
					}
				]
			};
			return config;
		}

		function getReportButtonBaseConfig() {
			return {
				className: "Terrasoft.Button",
				style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
				classes: {
					wrapperClass: ["report-with-centered-right-menu"]
				}
			};
		}

		function getFormingMethodViewModel() {
			return {
				values: {
					formingMethodButtonsGroup: "bySelected"
				},
				methods: {
					onCheckChange: function(isChecked, tag) {
						if (isChecked) {
							formingMethodSelectedFilter = tag;
						}
					},
					calculateSelectedRecord: function() {
						var activeRow = reportConfig.activeRow;
						var selectedRows = reportConfig.selectedRows;
						var count;
						if (activeRow) {
							count = 1;
						} else if (selectedRows) {
							count = selectedRows.length;
						} else {
							count = 0;
						}
						return Ext.String.format(resources.localizableStrings.BySelectedRecord, count);
					}
				}
			};
		}

		function getFormingMethodFilterQuery(reportFilters) {
			var getNoneRecord = Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "Id", Terrasoft.GUID_EMPTY);
			switch (formingMethodSelectedFilter) {
				case "bySelected":
					var activeRow = reportConfig.activeRow;
					var selectedRows = reportConfig.selectedRows;
					var filterSettings;
					if (activeRow) {
						filterSettings = Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "Id", activeRow);
						reportFilters.Filters = filterSettings.serialize();
					} else if (selectedRows && (selectedRows.length > 0)) {
						filterSettings = Terrasoft.createColumnInFilterWithParameters("Id", selectedRows);
						reportFilters.Filters = filterSettings.serialize();
					} else {
						reportFilters.Filters = getNoneRecord.serialize();
					}
					break;
				case "byFiltered":
					var quickFilter = sandbox.publish("GetFiltersCollection");
					if (quickFilter && quickFilter.collection.length > 0) {
						reportFilters.Filters = quickFilter.serialize();
					} else {
						reportFilters.Filters = null;
						break;
					}
					break;
				case "byAll":
					reportFilters.Filters = null;
					break;
			}
		}

		function getLabelControl(filterConfig) {
			return {
				id: "label-edit-" + filterConfig.name,
				className: "Terrasoft.Label",
				caption: filterConfig.caption,
				classes: {
					labelClass: ["report-custom-label-with-top28"]
				}
			};
		}

		function getBooleanControl(filterConfig) {
			return {
				id: "boolean-edit-" + filterConfig.name,
				className: "Terrasoft.CheckBoxEdit"
			};
		}

		function getDateControl(filterConfig) {
			var columnName = filterConfig.columnName || filterConfig.name;
			return {
				className: "Terrasoft.DateEdit",
				classes: {
					wrapClass: "report-custom-control"
				},
				id: "date-edit-" + filterConfig.name,
				selectors: {
					wrapEl: "#date-edit-" + filterConfig.name
				},
				change: {
					bindTo: "setEntityColumnInfo"
				},
				width: "215px",
				value: {
					bindTo: columnName
				},
				tag: columnName
			};
		}

		function getTimeControl(filterConfig) {
			return {
				className: "Terrasoft.TimeEdit",
				id: "time-edit-" + filterConfig.name,
				selectors: {
					wrapEl: "#time-edit-" + filterConfig.name
				},
				classes: {
					wrapClass: "report-custom-control"
				},
				value: {
					bindTo: filterConfig.columnName
				}
			};
		}

		return {render: render};

	});