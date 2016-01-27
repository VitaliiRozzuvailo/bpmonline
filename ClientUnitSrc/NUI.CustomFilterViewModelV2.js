define("CustomFilterViewModelV2", ["ext-base", "terrasoft", "CustomFilterViewModelV2Resources", "ConfigurationEnums",
		"CustomFilterViewV2", "QuickFilterViewV2Resources", "ConfigurationConstants"],
	function(Ext, Terrasoft, resources, ConfigurationEnums, CustomFilterView, quickFilterViewResources,
		ConfigurationConstants) {

		var customFilterPrefix = "customFilter";

		function generate(config) {
			var values = {
				Ext: config.Ext,
				sandbox: config.sandbox,
				containerId: "SectionFiltersContainer",
				primaryDisplayColumnConfig: null,
				primaryDisplayColumnFilterTag: null,
				quickFilterKey: config.quickFilterKey,
				filters: new Terrasoft.Collection(),
				filtersViews: new Terrasoft.Collection(),
				currentFilterName: null,
				simpleFilterColumnList: new Terrasoft.Collection(),
				booleanValueColumnList: new Terrasoft.Collection(),
				buttonCaption: resources.localizableStrings.FiltersCaption,
				isExtendedModeHidden: Ext.isEmpty(config.isExtendedModeHidden) ? true : config.isExtendedModeHidden,
				isFoldersHidden: Ext.isEmpty(config.isFoldersHidden) ? true : config.isFoldersHidden,
				hasFolders: Ext.isEmpty(config.hasFolders) ? true : config.hasFolders,
				ActiveFolder: null,
				ActionsMenu: Ext.create("Terrasoft.BaseViewModelCollection"),
				IsSeparateMode: true,
				customFilterContainerName: config.customFilterContainerName,
				simpleFilterEditContainerName: config.simpleFilterEditContainerName,
				StringColumnSearchComparisonType: config.StringColumnSearchComparisonType,
				isShortFilterVisible: Ext.isEmpty(config.isShortFilterVisible) ? false : config.isShortFilterVisible
			};
			if (config.values) {
				Ext.apply(values, config.values);
			}
			var viewModelConfig = {
				entitySchema: config.entitySchema,
				folderEntitySchema: config.folderEntitySchema,
				columns: {
					buttonCaption: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "buttonCaption"
					},
					simpleFilterColumn: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "simpleFilterColumn"
					},
					booleanValueColumnList: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "booleanValueColumnList",
						isCollection: true
					},
					simpleFilterColumnList: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "simpleFilterColumnList",
						isCollection: true
					},
					simpleFilterValueColumn: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "simpleFilterValueColumn"
					}
				},
				values: values,
				methods: {
					getFilters: getFilters,
					clearConditions: clearConditions,
					subscribeForCollectionEvent: subscribeForCollectionEvent,
					init: init,
					initialize: initialize,
					updateButtonCaption: updateButtonCaption,
					loadFilterViews: loadFilterViews,
					addFilterView: addFilterView,
					removeFilterView: removeFilterView,
					clear: clear,
					clearFilterViews: clearFilterViews,
					getSimpleFilterColumnList: getSimpleFilterColumnList,
					simpleFilterColumnChange: simpleFilterColumnChange,
					cancelSimpleFilter: clearSimpleFilterProperties,
					applySimpleFilter: applySimpleFilter,
					addSimpleFilterValue: addSimpleFilterValue,
					addExtendFilterValue: addExtendFilterValue,
					clearSimpleFilterProperties: clearSimpleFilterProperties,
					generateFilterViewModelConfig: generateFilterViewModelConfig,
					getSimpleFilter: getSimpleFilter,
					getExtendFilter: getExtendFilter,
					addSimpleFilter: addSimpleFilter,
					setCustomFilters: setCustomFilters,
					editSimpleFilter: editSimpleFilter,
					editExtendFilter: editExtendFilter,
					getValueEditControlConfig: getValueEditControlConfig,
					getBooleanValueColumnList: getBooleanValueColumnList,
					getFilterValue: getFilterValue,
					addFilterValue: addFilterValue,
					showFolders: showFolders,
					updateFiltersByObjectPath: config.updateFiltersByObjectPath,
					isFolderItemVisible: isFolderItemVisible,
					getActiveFolderMenuItemName: getActiveFolderMenuItemName,
					initActionsMenu: initActionsMenu,
					initFavouriteFolders: initFavouriteFolders,
					getFoldersHidden: getFoldersHidden,
					updateFiltersOnReturn: updateFiltersOnReturn,
					filterChanged: filterChanged,
					showSimpleFilterEdit: showSimpleFilterEdit,
					getFilterViewModel: getFilterViewModel,
					getFilterView: getFilterView,
					generateFilterViewConfig: generateFilterViewConfig,
					goToExtendedMode: goToExtendedMode,
					goToSearchFolderEditMode: goToSearchFolderEditMode,
					showFolderManager: showFolderManager,
					onFavoriteFolderSelect: onFavoriteFolderSelect,
					showSimpleFilter: showSimpleFilter,
					//todo вынужденая мера, пока по конфигу инстансируется BaseViewModel.
					// Как только инстансирование модели изменится, перенести в свойства.
					getExt: function() {
						return this.get("Ext");
					},
					getSandbox: function() {
						return this.get("sandbox");
					},

					/**
					 * Получает идентификатор custom фильтра.
					 * @protected
					 */
					getCustomFilterId: function() {
						var sandbox = this.getSandbox();
						return "customFilter" + sandbox.id;
					}
				}
			};

			var defaultColumn = null;
			var displayColumnName = null;
			if (!Ext.isEmpty(config.filterDefaultColumnName)) {
				defaultColumn = config.entitySchema.getColumnByName(config.filterDefaultColumnName);
				displayColumnName = config.filterDefaultColumnName;
			} else {
				if (config.entitySchema.primaryDisplayColumnName) {
					defaultColumn = config.entitySchema.primaryDisplayColumn;
					displayColumnName = config.entitySchema.primaryDisplayColumnName;
				}
			}
			if (!Ext.isEmpty(defaultColumn)) {
				viewModelConfig.values.primaryDisplayColumnFilterTag = customFilterPrefix +
				displayColumnName + config.quickFilterKey;
				viewModelConfig.values.primaryDisplayColumnConfig = {
					value: displayColumnName,
					displayValue: defaultColumn.caption,
					dataValueType: defaultColumn.dataValueType,
					referenceSchemaName: defaultColumn.referenceSchemaName
				};
			}
			return viewModelConfig;
		}

		function generateFilterViewModelConfig() {
			return {
				columns: {
					columnCaption: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "columnCaption"
					},
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
					columnCaption: "",
					columnName: null,
					value: null,
					dataValueType: null,
					referenceSchemaName: null,
					referenceSchemaPrimaryDisplayColumnName: null,
					view: null,
					viewVisible: true
				},
				methods: {
				}
			};
		}

		function init(callback, scope) {
			this.subscribeForCollectionEvent();
			this.suspendUpdate = true;
			this.initActionsMenu();
			this.initFavouriteFolders();
			this.suspendUpdate = false;
			callback.call(scope);
		}
		function initialize() {
			var filterState = this.getFilterState("Custom");
			if (filterState) {
				for (var key in filterState) {
					this.addFilterValue(key, filterState[key]);
				}
			}
		}

		function updateFiltersOnReturn() {
			this.clearFilterViews();
			if (this.get("filters") !== null) {
				var filters = this.get("filters");
				var filtersViews = this.get("filtersViews");
				var filterNames = Terrasoft.deepClone(filters.getKeys());
				var scope = this;
				Terrasoft.each(filterNames, function(filterName) {
					var filter = filters.collection.getByKey(filterName);
					var config = scope.generateFilterViewModelConfig();
					config.methods.editFilter = function(tag) {
						scope.editSimpleFilter(tag);
					};
					config.methods.getFilter = scope.getSimpleFilter;
					var simpleFilterView = scope.getFilterView(filter, filterName);
					filtersViews.add(filterName, simpleFilterView);
				});
			}
		}

		function getFoldersHidden() {
			return this.get("isFoldersHidden") && this.get("hasFolders");
		}

		function initFavouriteFolders() {
			if (!this.folderEntitySchema) {
				this.set("hasFolders", false);
				return;
			}
			var folderEntitySchemaName = this.folderEntitySchema.name;
			var folderSchemaUId = this.folderEntitySchema.uId;
			var select = selectFavoriteFolders(folderEntitySchemaName, folderSchemaUId);
			var collection = this.get("ActionsMenu");
			this.initActionsMenu();
			select.execute(function(response) {
				if (response && response.success) {
					response.collection.each(function(folderItem) {
						var itemConfig = {
							values: {
								Caption: folderItem.get("FolderName"),
								Click: {bindTo: "onFavoriteFolderSelect"},
								Tag: folderItem,
								Visible: {
									bindTo: "getFoldersHidden"
								}
							}
						};
						var menuItem = Ext.create("Terrasoft.BaseViewModel", itemConfig);
						if (collection.indexOf(menuItem) < 0) {
							collection.addItem(menuItem);
						}
					});
				}
			});
		}

		function selectFavoriteFolders(folderEntitySchemaName, folderSchemaUId) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "FolderFavorite"
			});
			select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
			select.addColumn("FolderId");
			select.addColumn("[" + folderEntitySchemaName + ":Id:FolderId].Name", "FolderName");
			select.addColumn("[" + folderEntitySchemaName + ":Id:FolderId].FolderType", "FolderType");
			select.addColumn("[" + folderEntitySchemaName + ":Id:FolderId].SearchData", "SearchData");
			var filters = Ext.create("Terrasoft.FilterGroup");
			filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "SysAdminUnit",
				Terrasoft.SysValue.CURRENT_USER.value));
			filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"FolderEntitySchemaUId", folderSchemaUId));
			select.filters = filters;
			return select;
		}

		function initActionsMenu() {
			var collection = this.get("ActionsMenu");
			collection.clear();
			var isShortFilterVisible = this.get("isShortFilterVisible");
			if (!isShortFilterVisible) {
				var filterMenuItems = [
					{
						Id: Terrasoft.generateGUID(),
						Caption: {bindTo: "getActiveFolderMenuItemName"},
						Click: {bindTo: "goToSearchFolderEditMode"},
						Visible: {bindTo: "isFolderItemVisible"}
					},
					{
						Id: Terrasoft.generateGUID(),
						Caption: "",
						Type: Terrasoft.MenuItemType.SEPARATOR
					},
					{
						Id: Terrasoft.generateGUID(),
						Caption: resources.localizableStrings.AddConditionMenuItemCaption,
						Click: {bindTo: "addSimpleFilter"},
						Visible: {bindTo: "isExtendedModeHidden"},
						MarkerValue: resources.localizableStrings.AddConditionMenuItemCaption
					},
					{
						Id: Terrasoft.generateGUID(),
						Caption: resources.localizableStrings.ShowFoldersMenuItemCaption,
						Click: {bindTo: "showFolders"},
						Visible: {bindTo: "getFoldersHidden"}
					},
					{
						Id: Terrasoft.generateGUID(),
						Caption: resources.localizableStrings.ExtendedModeMenuItemCaption,
						Click: {bindTo: "goToExtendedMode"},
						Visible: {bindTo: "isExtendedModeHidden"},
						ImageConfig: this.get("Resources.Images.ImageListSchemaItem1")
					},
					{
						Id: Terrasoft.generateGUID(),
						Type: Terrasoft.MenuItemType.SEPARATOR,
						Caption: resources.localizableStrings.FavoriteFoldersMenuItemCaption
					}
				];
				for (var i in filterMenuItems) {
					var itemConfig = {
						values: filterMenuItems[i]
					};
					var menuItem = Ext.create("Terrasoft.BaseViewModel", itemConfig);
					collection.addItem(menuItem);
				}
			}
		}
		function isFolderItemVisible() {
			return this.get("ActiveFolder") !== null;
		}

		function getActiveFolderMenuItemName() {
			var activeFolder = this.get("ActiveFolder");
			return activeFolder ?
				Ext.String.format(resources.localizableStrings.EditFolderFiltersMenuItem, activeFolder.displayValue) :
				"";
		}

		function getSimpleFilterDisplayValue(simpleFilterColumn, simpleFilterValue) {
			var displayValue;
			if (simpleFilterColumn.dataValueType === Terrasoft.DataValueType.ENUM ||
				simpleFilterColumn.dataValueType === Terrasoft.DataValueType.LOOKUP) {
				displayValue = simpleFilterValue;
			} else if (simpleFilterColumn.dataValueType === Terrasoft.DataValueType.DATE_TIME) {
				displayValue = Terrasoft.getTypedStringValue(simpleFilterValue, Terrasoft.DataValueType.DATE);
			} else if (simpleFilterColumn.dataValueType === Terrasoft.DataValueType.BOOLEAN) {
				displayValue = simpleFilterValue.displayValue;
			} else {
				displayValue = Terrasoft.getTypedStringValue(simpleFilterValue, simpleFilterColumn.dataValueType);
			}
			return displayValue;
		}

		function addSimpleFilterValue(simpleFilterColumn, simpleFilterValue) {
			var filters = this.get("filters");
			var oldFilterName = this.get("currentFilterName");
			var filterName = customFilterPrefix + simpleFilterColumn.value + this.get("quickFilterKey");
			if (oldFilterName && filterName !== oldFilterName) {
				filters.removeByKey(oldFilterName);
			}
			var simpleFilter = filters.find(filterName);
			if (!simpleFilter) {
				var config = this.generateFilterViewModelConfig();
				config.methods.editFilter = function(tag) {
					this.editSimpleFilter(tag);
				}.bind(this);
				config.methods.getFilter = this.getSimpleFilter;
				simpleFilter = this.getFilterViewModel(filterName, config);
				simpleFilter.set("filterName", filterName);
				simpleFilter.set("columnName", simpleFilterColumn.value);
				simpleFilter.set("columnCaption", simpleFilterColumn.displayValue);
				simpleFilter.set("value", simpleFilterValue);
				simpleFilter.set("displayValue",
					getSimpleFilterDisplayValue(simpleFilterColumn, simpleFilterValue));
				simpleFilter.set("dataValueType", simpleFilterColumn.dataValueType);
				filters.add(filterName, simpleFilter);
				if (simpleFilterColumn.referenceSchemaName) {
					simpleFilter.set("referenceSchemaName", simpleFilterColumn.referenceSchemaName);
					var thisContext = this;
					if (simpleFilterColumn.primaryDisplayColumnName) {
						simpleFilter.set("referenceSchemaPrimaryDisplayColumnName",
							simpleFilterColumn.primaryDisplayColumnName);
						this.filterChanged();
					} else {
						require([simpleFilterColumn.referenceSchemaName], function(schema) {
							simpleFilter.set("referenceSchemaPrimaryDisplayColumnName",
								schema.primaryDisplayColumnName);
							thisContext.filterChanged();
						}, this);
					}
				} else {
					this.filterChanged();
				}
			} else {
				simpleFilter.set("value", simpleFilterValue);
				simpleFilter.set("displayValue",
					getSimpleFilterDisplayValue(simpleFilterColumn, simpleFilterValue));
				this.filterChanged();
			}
		}

		function addExtendFilterValue(extendFilterValue, clear) {
			var filters = this.get("filters");
			var oldFilterName = this.get("currentFilterName");
			if (!this.extendFilterIndex) {
				this.extendFilterIndex = 0;
			}
			var filterName = "customExtendFilter" + this.get("quickFilterKey") + this.extendFilterIndex++;
			if (oldFilterName) {
				filters.removeByKey(oldFilterName);
			}
			var config = this.generateFilterViewModelConfig();
			config.methods.editFilter = function() {
				this.editExtendFilter();
			}.bind(this);
			config.methods.getFilter = this.getExtendFilter;
			if (clear) {
				filters.clear();
			}
			if (extendFilterValue.displayValue !== "") {
				var extendFilter = this.getFilterViewModel(filterName, config);
				extendFilter.set("filterName", filterName);
				extendFilter.set("value", extendFilterValue.value);
				var extendFilterDisplayValue = extendFilterValue.displayValue;
				extendFilter.set("displayValue", extendFilterDisplayValue.length > 20 ?
					extendFilterDisplayValue.substring(0, 20) + "..." : extendFilterDisplayValue);
				filters.add(filterName, extendFilter);
			}
			this.filterChanged();
		}

		function setCustomFilters(filtersConfig) {
			var filters = this.get("filters");
			filters.clear();
			Terrasoft.each(filtersConfig, function(filterConfig) {
				this.addSimpleFilterValue(filterConfig.column, filterConfig.value);
			}, this);
		}

		function applySimpleFilter() {
			var simpleFilterColumn = this.get("simpleFilterColumn");
			var simpleFilterValue = this.get("simpleFilterValueColumn");
			if (simpleFilterColumn && !Ext.isEmpty(simpleFilterValue)) {
				this.addSimpleFilterValue(simpleFilterColumn, simpleFilterValue);
				this.destroySimpleFilterAddingContainer();
			}
		}

		function clearSimpleFilterProperties() {
			this.set("simpleFilterColumn", null);
			this.set("simpleFilterValueColumn", null);
			this.set("currentFilterName", null);
		}

		function getValueEditControlConfig(dataValueType) {
			var className;
			switch (dataValueType) {
				case Terrasoft.DataValueType.INTEGER:
					className = "Terrasoft.IntegerEdit";
					break;
				case Terrasoft.DataValueType.FLOAT:
					className = "Terrasoft.FloatEdit";
					break;
				case Terrasoft.DataValueType.MONEY:
					className = {
						className: "Terrasoft.FloatEdit",
						decimalPrecision: 2
					};
					break;
				case Terrasoft.DataValueType.DATE:
				case Terrasoft.DataValueType.DATE_TIME:
					className = "Terrasoft.DateEdit";
					break;
				case Terrasoft.DataValueType.BOOLEAN:
					className = {
						className: "Terrasoft.ComboBoxEdit",
						list: {
							bindTo: "booleanValueColumnList"
						},
						prepareList: {
							bindTo: "getBooleanValueColumnList"
						}
					};
					break;
				default:
					className = "Terrasoft.TextEdit";
					break;
			}
			return className;
		}

		function simpleFilterColumnChange(value) {
			if (value == null) {
				return;
			}
			var dataValueType = value ? value.dataValueType : "";
			var className = this.getValueEditControlConfig(dataValueType);
			this.changeSimpleFilterValueEdit(className);
			this.set("simpleFilterValueColumn", null);
		}

		function getSimpleFilterColumnList(filters, list) {
			list.clear();
			var columnList = {};
			var columnNames = [];
			var columns = this.entitySchema.columns;
			Terrasoft.each(columns, function(column) {
				if (column.dataValueType !== Terrasoft.DataValueType.GUID &&
					column.dataValueType !== Terrasoft.DataValueType.TIME &&
					column.dataValueType !== Terrasoft.DataValueType.BLOB &&
					column.dataValueType !== Terrasoft.DataValueType.IMAGELOOKUP &&
					column.usageType !== ConfigurationEnums.EntitySchemaColumnUsageType.None) {
					columnNames.push({
						name: column.name,
						caption: column.caption
					});
				}
			});
			var sortedColumnNames = columnNames.sort(function(a, b) {
				if (a.caption === b.caption) {
					return 0;
				} else {
					return a.caption > b.caption ? 1 : -1;
				}
			});
			Terrasoft.each(sortedColumnNames, function(item) {
				var column = columns[item.name];
				columnList[column.name] = {
					value: column.name,
					displayValue: column.caption,
					dataValueType: column.dataValueType,
					referenceSchemaName: column.referenceSchemaName
				};
			});
			list.loadAll(columnList);
		}

		function getBooleanValueColumnList(filters, list) {
			list.clear();
			var columnList = {};
			columnList.TRUE = {
				value: "true",
				displayValue: Terrasoft.getTypedStringValue(true, Terrasoft.DataValueType.BOOLEAN)
			};
			columnList.FALSE = {
				value: "false",
				displayValue: Terrasoft.getTypedStringValue(false, Terrasoft.DataValueType.BOOLEAN)
			};
			list.loadAll(columnList);
		}

		function subscribeForCollectionEvent() {
			var filters = this.get("filters");
			filters.on("dataLoaded", this.loadFilterViews, this);
			filters.on("add", this.addFilterView, this);
			filters.on("remove", this.removeFilterView, this);
			filters.on("clear", this.clearFilterViews, this);
		}

		function loadFilterViews() {
			var filtersViews = this.get("filtersViews");
			var filters = this.get("filters");
			filters.each(function(filterViewModel) {
				filtersViews.add(filterViewModel.get("filterName"), filterViewModel.get("view"));
			});
			this.updateButtonCaption();
		}

		function addFilterView(filterViewModel) {
			var filtersViews = this.get("filtersViews");
			filtersViews.add(filterViewModel.get("filterName"), filterViewModel.get("view"));
			this.updateButtonCaption();
		}

		function removeFilterView(filterViewModel) {
			var filtersViews = this.get("filtersViews");
			var view = filtersViews.removeByKey(filterViewModel.get("filterName"));
			if (view) {
				view.destroy();
			}
			this.updateButtonCaption();
		}

		function clearFilterViews() {
			var filtersViews = this.get("filtersViews");
			filtersViews.each(function(view) {
				view.destroy();
			});
			filtersViews.clear();
			this.updateButtonCaption();
		}

		function clear(filter) {
			this.addExtendFilterValue(filter, true);
		}

		function getSimpleFilter() {
			var filter;
			var dataValueType = this.get("dataValueType");
			var value = this.get("value");
			var columnName = this.get("columnName");
			switch (dataValueType) {
				case Terrasoft.DataValueType.LOOKUP:
				case Terrasoft.DataValueType.ENUM:
					filter = Terrasoft.createColumnFilterWithParameter(Terrasoft.SysSettings.lookupFilterType,
						columnName + "." + this.get("referenceSchemaPrimaryDisplayColumnName"),
						value);
					break;
				case Terrasoft.DataValueType.TEXT:
					var comparisonType = Terrasoft.ComparisonType.START_WITH;
					var stringColumnSearchComparisonType = this.get("StringColumnSearchComparisonType");
					if (stringColumnSearchComparisonType === 1) {
						comparisonType = Terrasoft.ComparisonType.CONTAIN;
					}
					filter = Terrasoft.createColumnFilterWithParameter(comparisonType, columnName, value);
					break;
				case Terrasoft.DataValueType.DATE:
				case Terrasoft.DataValueType.DATE_TIME:
					filter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, columnName,
						value);
					filter.trimDateTimeParameterToDate = true;
					break;
				case Terrasoft.DataValueType.BOOLEAN:
					filter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						columnName, value.value);
					break;
				default:
					filter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						columnName, value);
					break;
			}
			filter.leftExpressionCaption = this.get("columnCaption");
			return filter;
		}

		function getExtendFilter() {
			return Terrasoft.deserialize(this.get("value"));
		}

		function getFilters(extendedMode) {
			var filters = this.get("filters");
			var filterCollection = null;
			if (filters.collection.length === 1) {
				var filter = filters.getByIndex(0);
				if (!filter.get("columnName")) {
					filterCollection = filter.getFilter();
					if (!extendedMode && this.updateFiltersByObjectPath) {
						this.updateFiltersByObjectPath(filterCollection, filterCollection.rootSchemaName,
							this.updateFiltersByObjectPath);
					}
					return filterCollection;
				}
			}
			filterCollection = Terrasoft.createFilterGroup();
			filters.each(function(filterInfo) {
				var filter = filterInfo.getFilter();
				if (filter) {
					if (this.updateFiltersByObjectPath) {
						this.updateFiltersByObjectPath(filter, filter.rootSchemaName,
							this.updateFiltersByObjectPath);
					}
					filterCollection.add(filterInfo.get("filterName"), filter);
				}
			}, this);
			return filterCollection;
		}

		function clearConditions() {
			var filters = this.get("filters");
			if (filters.collection.length > 0) {
				filters.clear();
				this.filterChanged();
			}
		}

		function updateButtonCaption() {
			var filters = this.get("filters");
			if (filters.collection.length > 0 && this.get("IsSeparateMode")) {
				this.set("buttonCaption", "");
			} else {
				this.set("buttonCaption", resources.localizableStrings.FiltersCaption);
			}
		}

		function addSimpleFilter() {
			var filters = this.get("filters");
			var defFilter = null;
			if (!filters.find(this.get("primaryDisplayColumnFilterTag"))) {
				defFilter = this.get("primaryDisplayColumnConfig");
			}
			this.set("simpleFilterColumn", defFilter);
			this.set("simpleFilterValueColumn", null);
			this.set("currentFilterName", null);
			if (defFilter) {
				var valueEditConfig = this.getValueEditControlConfig(defFilter.dataValueType);
				this.showSimpleFilterEdit(valueEditConfig);
			} else {
				this.showSimpleFilterEdit();
			}
		}

		function editSimpleFilter(tag) {
			if (tag === this.get("currentFilterName")) {
				return;
			}
			var filters = this.get("filters");
			var filterViewModel = filters.find(tag);
			if (filterViewModel) {
				var renderIndex = filters.indexOf(filterViewModel);
				var columnValue = {
					value: filterViewModel.get("columnName"),
					displayValue: filterViewModel.get("columnCaption"),
					dataValueType: filterViewModel.get("dataValueType"),
					referenceSchemaName: filterViewModel.get("referenceSchemaName")
				};
				this.set("currentFilterName", tag);
				var value = filterViewModel.get("value");
				this.set("simpleFilterColumn", columnValue);
				this.set("simpleFilterValueColumn", value);
				var valueEditConfig = this.getValueEditControlConfig(columnValue.dataValueType);
				filterViewModel.set("viewVisible", false);
				this.showSimpleFilterEdit(valueEditConfig, function() {
					filterViewModel.set("viewVisible", true);
				}, renderIndex);
			}
		}

		function editExtendFilter() {
			this.goToExtendedMode();
		}

		function showFolders() {
			this.showFolderManager();
		}

		function getFilterValue(filterName) {
			var result = {};
			var filters = this.get("filters");
			filters.each(function(filterInfo) {
				var filterValue;
				var currentFilterName = filterInfo.get("columnName");
				if (!filterName || currentFilterName === filterName) {
					filterValue = {
						displayValue: filterInfo.get("displayValue")
					};
					if (filterInfo.get("datavalueType") === Terrasoft.DataValueType.BOOLEAN) {
						filterValue.value = filterInfo.get("value").value;
					} else {
						filterValue.value = filterInfo.get("value");
					}
					var referenceSchemaPrimaryDisplayColumnName = filterInfo.get(
						"referenceSchemaPrimaryDisplayColumnName");
					if (referenceSchemaPrimaryDisplayColumnName) {
						filterValue.primaryDisplayColumnName = referenceSchemaPrimaryDisplayColumnName;
					}
				}
				if (filterName) {
					result = filterValue;
				} else {
					result[currentFilterName] = filterValue;
				}
			});
			return result;
		}

		function addFilterValue(filterName, filterValue) {
			var column = this.entitySchema.columns[filterName];
			if (column) {
				var columnConfig = {
					value: column.name,
					displayValue: column.caption,
					dataValueType: column.dataValueType,
					referenceSchemaName: column.referenceSchemaName,
					primaryDisplayColumnName: filterValue.primaryDisplayColumnName
				};
				var value = filterValue.value;
				if (column.dataValueType === Terrasoft.DataValueType.BOOLEAN) {
					value = {
						value: value ? "true" : "false",
						displayValue: Terrasoft.getTypedStringValue(value, Terrasoft.DataValueType.BOOLEAN)
					};
				}
				this.addSimpleFilterValue(columnConfig, value);
			} else {
				this.addExtendFilterValue(filterValue, true);
			}
		}

		/**
		 * Генерирует событие об изменении фильтров.
		 * @private
		 */
		function filterChanged() {
			this.fireEvent("filterChanged", "CustomFilters", this.suspendUpdate);
		}

		function showSimpleFilterEdit(valueEditConfig, afterDestroy, renderIndex) {
			var Ext = this.getExt();
			var customFilterId = this.getCustomFilterId();
			var simpleFilterEditContainerName = this.get("simpleFilterEditContainerName");
			var customFilterContainer = Ext.get(this.get("customFilterContainerName"));
			var addConditionView = Ext.getCmp(simpleFilterEditContainerName);
			if (addConditionView) {
				addConditionView.destroy();
			}
			var addConditionViewConfig = CustomFilterView.generateAddSimpleFilterConfig(valueEditConfig,
				simpleFilterEditContainerName, customFilterId);
			addConditionView = Ext.create("Terrasoft.Container", addConditionViewConfig);
			this.destroySimpleFilterAddingContainer = function() {
				addConditionView.destroy();
			};
			this.changeSimpleFilterValueEdit = function(controlConfig) {
				if (!addConditionView.rendered) {
					return;
				}
				var config = CustomFilterView.getSimpleFilterValueEditConfig(controlConfig);
				config.id = this.getCustomFilterId();
				this.set("simpleFilterValueColumn", null);
				var oldControl = addConditionView.items.getByKey(config.id);
				if (oldControl) {
					addConditionView.remove(oldControl);
					oldControl.destroy();
				}
				var newControl = Ext.create(config.className, config);
				addConditionView.insert(newControl, 1);
				newControl.bind(this);
				addConditionView.reRender();

				var columnControl = addConditionView.items.getAt(0).getEl();
				if (!columnControl.getValue()) {
					columnControl.focus();
				} else {
					newControl.getEl().focus();
				}
			};
			var simpleFilterValueColumn = this.get("simpleFilterValueColumn");
			addConditionView.bind(this);
			if (renderIndex !== undefined) {
				addConditionView.render(customFilterContainer, renderIndex + 1);
			} else {
				addConditionView.render(customFilterContainer);
			}
			addConditionView.items.getAt(valueEditConfig ? 1 : 0).getEl().focus();
			addConditionView.on("destroy", function() {
				if (this.afterDestroy) {
					this.afterDestroy();
				}
			}, this);
			this.set("simpleFilterValueColumn", simpleFilterValueColumn);
			this.afterDestroy = afterDestroy;
		}

		function getFilterViewModel(filterName, config) {
			var Ext = this.getExt();
			var filterViewModel = Ext.create("Terrasoft.BaseViewModel", config);
			var customFiltersViewsContainer = Ext.get(this.get("customFilterContainerName"));
			filterViewModel.removeFilter = function(a1, a2, a3, tag) {
				var filters = this.get("filters");
				filters.removeByKey(tag);
				this.filterChanged();
			}.bind(this);

			var filterView = Ext.create("Terrasoft.Container", this.generateFilterViewConfig(filterName));
			filterView.bind(filterViewModel);
			filterView.render(customFiltersViewsContainer);
			filterViewModel.set("view", filterView);
			var stringColumnSearchComparisonType = this.get("StringColumnSearchComparisonType");
			filterViewModel.set("StringColumnSearchComparisonType", stringColumnSearchComparisonType);
			return filterViewModel;
		}

		/**
		 * Отображает поля редактирования фильтра при нажатии на кнопку с изображением фильтра,
		 * в том случае если эти поля не отображены.
		 * @protected
		 */
		function showSimpleFilter() {
			var simpleFilterEditContainerName = this.get("simpleFilterEditContainerName");
			var addConditionView = Ext.getCmp(simpleFilterEditContainerName);
			if (!addConditionView) {
				this.addSimpleFilter();
			}
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
					classes: {
						wrapperClass: "folder-icon-button"
					},
					caption: {
						bindTo: "displayValue"
					},
					menu:  {
						items: menu
					},
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

		function getFilterView(filterViewModel, filterName) {
			var Ext = this.getExt();
			var customFiltersViewsContainer = Ext.get(this.get("customFilterContainerName"));
			var filterView = Ext.create("Terrasoft.Container",
				this.generateFilterViewConfig(filterName));
			filterView.bind(filterViewModel);
			filterView.render(customFiltersViewsContainer);
			return filterView;
		}

		function goToExtendedMode() {
			var sandbox = this.getSandbox();
			this.set("isExtendedModeHidden", false);
			this.set("isFoldersHidden", true);
			this.set("ActiveFolder", null);
			sandbox.publish("CustomFilterExtendedMode", null, [sandbox.id]);
		}

		function goToSearchFolderEditMode() {
			var sandbox = this.getSandbox();
			var activeFolder = this.get("ActiveFolder");
			this.set("ActiveFolder", null);
			sandbox.publish("CustomFilterExtendedMode", activeFolder, [sandbox.id]);
		}

		function showFolderManager() {
			var sandbox = this.getSandbox();
			this.set("isExtendedModeHidden", true);
			this.set("isFoldersHidden", false);
			var config = null;
			var outResult = {};
			this.fireEvent("getFilterValue", "FolderFilters", "", outResult);
			var folterFilters = outResult.filters;
			var activeFolder = folterFilters ? folterFilters[0] : null;
			this.set("activeFolder", activeFolder);
			if (activeFolder) {
				config = {activeFolderId: activeFolder.value};
				this.set("activeFolder", null);
			}
			sandbox.publish("ShowFolderTree", config, [sandbox.id]);
		}

		function onFavoriteFolderSelect(tag) {
			var folderMenuItemConfig = {
				value: tag.get("FolderId"),
				displayValue: tag.get("FolderName"),
				folderType: tag.get("FolderType"),
				folder: tag,
				filter: tag.get("SearchData")
			};
			this.fireEvent("clearFilterValue", "FolderFilters", folderMenuItemConfig);
		}

		return {
			generate: generate
		};
	});
