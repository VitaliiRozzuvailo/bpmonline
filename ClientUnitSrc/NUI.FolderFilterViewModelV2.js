define("FolderFilterViewModelV2", ["ext-base", "sandbox", "terrasoft", "FolderFilterViewModelV2Resources",
		"QuickFilterViewV2Resources", "ConfigurationConstants"],
	function(Ext, sandbox, Terrasoft, resources, quickFilterViewResources, ConfigurationConstants) {

		function generate(config) {
			var Ext = config.Ext;
			var values = {
				Ext: Ext,
				sandbox: config.sandbox,
				filters: Ext.create("Terrasoft.Collection"),
				filtersViews: Ext.create("Terrasoft.Collection"),
				currentFilterName: null,
				folderFilterColumnList: Ext.create("Terrasoft.Collection"),
				buttonCaption: resources.localizableStrings.FoldersCaption,
				folderEntitySchema: config.folderEntitySchema,
				inFolderEntitySchema: config.inFolderEntitySchema,
				entityColumnNameInFolderEntity: config.entityColumnNameInFolderEntity,
				folderFilterContainerName: config.folderFilterContainerName,
				folderFilterButtonContainerName: config.folderFilterButtonContainerName
			};
			if (config.values) {
				Ext.apply(values, config.values);
			}
			var viewModelConfig = {
				entitySchema: config.entitySchema,
				config: config,
				columns: {
					buttonCaption: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "buttonCaption"
					},
					folderFilterColumn: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "folderFilterColumn",
						isLookup: true,
						referenceSchemaName: config.folderEntitySchema.name
					},
					folderFilterColumnList: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "folderFilterColumnList",
						isCollection: true
					}
				},
				values: values,
				methods: {
					getFilters: getFilters,
					subscribeForCollectionEvent: subscribeForCollectionEvent,
					updateButtonCaption: updateButtonCaption,
					loadFilterViews: loadFilterViews,
					addFilterView: addFilterView,
					removeFilterView: removeFilterView,
					clear: clear,
					clearConditions: clearConditions,
					clearFilterViews: clearFilterViews,
					generateFilterViewModelConfig: generateFilterViewModelConfig,
					getFiltersInfo: getFiltersInfo,
					getFilterValue: getFilterValue,
					updateFiltersByObjectPath: config.updateFiltersByObjectPath,
					addFilterValue: addFilterValue,
					addSingleFilterValue: addSingleFilterValue,
					init: init,
					initialize: initialize,
					//TODO удалить когда будет реализован выбор из справочника
					selectFolder: addFilter,
					editFilter: editFilter,
					applyFolderFilter: applySimpleFilter,
					clearSimpleFilterProperties: clearSimpleFilterProperties,
					addFavoriteFilter: selectFavorite,
					updateFiltersOnReturn: updateFiltersOnReturn,
					clearFolderValue: clearFolderValue,
					filterChanged: filterChanged,
					folderSelecting: folderSelecting,
					getFilterViewModel: getFilterViewModel,
					generateFilterViewConfig: generateFilterViewConfig,
					//todo вынужденая мера, пока по конфигу инстансируется BaseViewModel.
					// Как только инстансирование модели изменится, перенести в свойства.
					getExt: function() {
						return this.get("Ext");
					},
					getSandbox: function() {
						return this.get("sandbox");
					},

					/**
					 * Обработчик события изменения свойств пользовательского фильтра.
					 * @private
					 * @param {Object} config Объект с свойствами для установки.
					 * @param {Boolean} config.isExtendedModeHidden Флаг состояния модуля расширеного редактирования
					 * фильтров.
					 * @param {Boolean} config.isFoldersHidden Флаг состояния модуля групп.
					 */
					onChangeCustomFiltersMode: function(config) {
						if (!Ext.isEmpty(config.isExtendedModeHidden)) {
							this.set("isExtendedModeHidden", config.isExtendedModeHidden);
						}
						if (!Ext.isEmpty(config.isFoldersHidden)) {
							this.set("isFoldersHidden", config.isFoldersHidden);
						}
					}
				}
			};

			var folderColumnName;
			if (config.inFolderEntitySchema) {
				var entityColumnName;
				var entityColumnNameByName;
				Terrasoft.each(config.inFolderEntitySchema.columns, function(schemaColumn) {
					if (!folderColumnName && schemaColumn.referenceSchemaName ===
						config.folderEntitySchema.name) {
						folderColumnName = schemaColumn.name;
					} else if (!entityColumnNameByName && schemaColumn.name === config.entitySchema.name &&
						schemaColumn.referenceSchemaName === config.entitySchema.name) {
						entityColumnNameByName = schemaColumn.name;
					} else if (!entityColumnName && schemaColumn.referenceSchemaName ===
						config.entitySchema.name) {
						entityColumnName = schemaColumn.name;
					}
				}, this);
				if (entityColumnNameByName) {
					entityColumnName = entityColumnNameByName;
				}
				if (!entityColumnName) {
					entityColumnName = config.entityColumnNameInFolderEntity;
				}
				viewModelConfig.values.staticFolderLeftExpression = "[" + config.inFolderEntitySchema.name + ":" +
					entityColumnName + "]." + folderColumnName;

			} else {
				Terrasoft.each(config.entitySchema.columns, function(schemaColumn) {
					if (!folderColumnName && schemaColumn.referenceSchemaName ===
						config.folderEntitySchema.name) {
						folderColumnName = schemaColumn.name;
					}
				}, this);
				viewModelConfig.values.singleFolderMode = true;
				viewModelConfig.values.staticFolderLeftExpression = folderColumnName;
			}
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
					filter: null,
					value: null,
					view: null
				},
				methods: {
				}
			};
		}

		function updateFiltersOnReturn() {
			var filterValue = this.get("folderValue");
			if (filterValue) {
				this.clearFilterViews();
				var filterName = "folderFilter" + filterValue.value.replace("-", "");
				var config = this.generateFilterViewModelConfig();
				var simpleFilter = this.getFilterViewModel(filterName, config, filterValue.folder);
				simpleFilter.set("folderId", filterValue.folder.get("FolderId"));
				simpleFilter.set("filterName", filterName);
				simpleFilter.set("value", filterValue.value);
				simpleFilter.set("displayValue", filterValue.displayValue);
				simpleFilter.set("filter", filterValue.filter);
				simpleFilter.set("folderType", filterValue.folderType);
				this.addFilterView(simpleFilter);
			}
		}

		function getFilters() {
			var filters = this.get("filters");
			var filterCollection = Terrasoft.createFilterGroup();
			filterCollection.logicalOperation = Terrasoft.LogicalOperatorType.OR;
			var filterValues = [];
			filters.each(function(filterInfo) {
				var filter = filterInfo.get("filter");
				if (filter) {
					filterCollection.add(filterInfo.get("filterName"), Terrasoft.deserialize(filter));
				} else {
					filterValues.push(filterInfo.get("value"));
				}
			});
			if (filterValues.length > 0) {
				filterCollection.add(this.get("staticFoldersFilter"), Terrasoft.createColumnInFilterWithParameters(
					this.get("staticFolderLeftExpression"), filterValues));
			}
			if (this.updateFiltersByObjectPath) {
				this.updateFiltersByObjectPath(filterCollection, this.entitySchema.name,
					this.updateFiltersByObjectPath);
			}
			return filterCollection;
		}

		function getFiltersInfo() {
			var filters = this.get("filters");
			var Ext = this.getExt();
			var filterValues = Ext.create("Terrasoft.Collection");
			filters.each(function(filterInfo) {
				var value = filterInfo.get("value");
				if (!filterInfo.get("folderType") && Terrasoft.isGUID(value)) {
					filterValues.add(value, filterInfo.get("filterName"));
				}
			});
			if (filterValues.getCount() > 0) {
				this.blobLoading = true;
				var folderEntitySchema = this.get("folderEntitySchema");
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchema: folderEntitySchema
				});
				select.addColumn(folderEntitySchema.primaryColumnName);
				select.addColumn("FolderType.Id", "FolderTypeId");
				select.addColumn("SearchData", "SearchData");
				select.filters.add("PrimaryColumnFilter", select.createColumnInFilterWithParameters(
					folderEntitySchema.primaryColumnName, filterValues.getKeys()));

				select.getEntityCollection(function(response) {
					if (response.success) {
						response.collection.each(function(item) {
							var folderId = item.get(folderEntitySchema.primaryColumnName);
							var filterName = filterValues.get(folderId);
							var folderFilter = filters.get(filterName);
							folderFilter.set("folderType", item.get("FolderTypeId"));
							folderFilter.set("filter", item.get("SearchData"));
						});
					}
					this.blobLoading = false;
					this.filterChanged();
				}, this);
			}
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
			this.set("filterViewModel", filterViewModel);
			this.updateButtonCaption();
		}

		function removeFilterView(filterViewModel) {
			var filtersViews = this.get("filtersViews");
			var view = filtersViews.removeByKey(filterViewModel.get("filterName"));
			view.destroy();
			this.updateButtonCaption();
		}

		function clearConditions() {
			var filters = this.get("filters");
			if (filters.collection.length > 0) {
				filters.clear();
				//this.filterChanged();
			}
		}

		function clearFolderValue() {
			this.set("folderValue", null);
		}

		function clearFilterViews() {
			var filtersViews = this.get("filtersViews");
			filtersViews.each(function(view) {
				view.destroy();
			});
			filtersViews.clear();
			this.updateButtonCaption();
		}

		function updateButtonCaption() {
			var filters = this.get("filters");
			if (filters.collection.length > 0) {
				this.set("buttonCaption", "");
			} else {
				this.set("buttonCaption", resources.localizableStrings.FoldersCaption);
			}
		}

		function addSingleFilterValue(filterValue) {
			var filters = this.get("filters");
			this.set("folderValue", filterValue);
			var filterName = "folderFilter" + filterValue.value.replace("-", "");
			if (!this.get("inFolderEntitySchema")) {
				filters.clear();
			} else {
				var oldFilterName = this.get("currentFilterName");
				if (oldFilterName && filterName !== oldFilterName) {
					filters.removeByKey(oldFilterName);
				}
			}
			this.clearFilterViews();
			var simpleFilter = filters.find(filterName);
			if (!simpleFilter) {
				var config = this.generateFilterViewModelConfig();
				simpleFilter = this.getFilterViewModel(filterName, config, filterValue.folder);
				simpleFilter.set("folderId", filterValue.folder.get("FolderId"));
				simpleFilter.set("filterName", filterName);
				simpleFilter.set("value", filterValue.value);
				simpleFilter.set("displayValue", filterValue.displayValue);
				simpleFilter.set("filter", filterValue.filter);
				simpleFilter.set("folderType", filterValue.folderType);
				filters.add(filterName, simpleFilter);
				//this.filterChanged();
			} else {
				simpleFilter.set("value", filterValue.value);
				simpleFilter.set("displayValue", filterValue.displayValue);
				//this.filterChanged();
			}
		}

		function addFilterValue(filterName, filterValues) {
			if (Ext.isArray(filterValues)) {
				Terrasoft.each(filterValues, function(currentValue) {
					this.addSingleFilterValue(currentValue);
				}, this);
			} else {
				this.addSingleFilterValue(filterValues);
			}
		}

		//TODO удалить когда будет доступен выбор из справочника
		function addFilter() {
			this.folderSelecting();
		}

		function editFilter(tag) {
			var filters = this.get("filters");
			var value;
			var filterViewModel = filters.find(tag);
			if (filterViewModel) {
				value = filterViewModel.get("value");
			}
			this.folderSelecting(value);
		}

		function applySimpleFilter() {
			var simpleFilterColumn = this.get("folderFilterColumn");
			if (simpleFilterColumn) {
				this.addSingleFilterValue(simpleFilterColumn);
			}
			this.destroySimpleFilterAddingContainer();
		}

		function clearSimpleFilterProperties() {
			this.set("folderFilterColumn", null);
			this.set("currentFilterName", null);
		}

		function getFilterValue() {
			var filters = this.get("filters");
			var sectionEntityScheamName = this.entitySchema.name;
			var filterValues = [];
			filters.each(function(filterInfo) {
				var value = filterInfo.get("value");
				if (Terrasoft.isGUID(value)) {
					var displayValue = filterInfo.get("displayValue");
					var filter = filterInfo.get("filter");
					var folderType = filterInfo.get("folderType");
					var folderId = filterInfo.get("folderId");
					filterValues.push({
						value: value,
						displayValue: displayValue,
						filter: filter,
						folderType: folderType,
						folderId: folderId,
						sectionEntityScheamName: sectionEntityScheamName
					});
				}
			});
			return filterValues;
		}
		function initialize() {
			var filterState = this.getFilterState("Folder");
			var Ext = this.getExt();
			var filterCollection = Ext.create("Terrasoft.Collection");
			if (filterState) {
				Terrasoft.each(filterState, function(filter) {
					filter.folder = Ext.create("Terrasoft.BaseViewModel", {
						values: {
							Id: filter.value,
							Name: filter.displayValue,
							SearchData: filter.filter,
							FolderType: filter.folderType,
							FolderId: filter.folderId
						}
					});
					//if (val.value !== selectedFiltersInfo.currentFolderFilterValue) {
					filterCollection.add(filter.value, filter);
					//}
				}, this);
			}
			var filters = filterCollection.getItems();
			if (filters) {
				this.addFilterValue("", filters);
			}
		}

		function init(callback, scope) {
			this.suspendUpdate = true;
			this.subscribeForCollectionEvent();

			this.getFiltersInfo();
			this.suspendUpdate = false;
			callback.call(scope);
		}

		function clear(filter) {
			this.clearConditions();
			if (filter) {
				this.addSingleFilterValue(filter);
			}
			this.filterChanged();
		}

		function selectFavorite(tag) {
			var primaryInfo = tag.split("&");
			var selectedFolders = [{
				displayValue: primaryInfo[1],
				value: primaryInfo[0],
				sectionEntityScheamName: this.get("folderEntitySchema").name
			}];
			return selectedFolders;
		}

		/**
		 * Генерирует событие об изменении фильтров.
		 * @private
		 */
		function filterChanged() {
			this.fireEvent("filterChanged", "FolderFilters", this.suspendUpdate);
		}

		function folderSelecting(currentFilter) {
			var selectedFiltersState = this.get("Filters");
			var selectedValues = [];
			if (!currentFilter) {
				Terrasoft.each(selectedFiltersState, function(currentValue) {
					selectedValues.push(currentValue.value);
				}, this);
			}
			var enableMultiSelect = this.get("inFolderEntitySchema") ? true : false;
			if (!enableMultiSelect && selectedValues.length) {
				currentFilter = selectedValues[0];
			}
		}

		function getFilterViewModel(filterName, config, folder) {
			var Ext = this.getExt();
			var sandbox = this.getSandbox();
			var me = this;
			var filterViewModel = Ext.create("Terrasoft.BaseViewModel", config);
			filterViewModel.removeFilter = function(a1, a2, a3, tag) {
				var filters = this.get("filters");
				filters.removeByKey(tag);
				this.set("folderValue", null);
				this.filterChanged();
			}.bind(this);
			filterViewModel.editFilter = function(tag) {
				var modifyCustomFilterModeConfig = {
					"isExtendedModeHidden": false,
					"isFoldersHidden": true
				};
				me.onChangeCustomFiltersMode(modifyCustomFilterModeConfig);
				this.editFilter(tag);
			}.bind(this);
			filterViewModel.openFoldersTree = function() {
				var activeFolderId = folder.get("FolderId") || folder.get("Id");
				var modifyCustomFilterModeConfig = {
					"isExtendedModeHidden": true,
					"isFoldersHidden": false
				};
				me.onChangeCustomFiltersMode(modifyCustomFilterModeConfig);
				sandbox.publish("ShowFolderTree", {activeFolderId: activeFolderId}, [sandbox.id]);
			};
			filterViewModel.openEditFolderItem = function() {
				var modifyCustomFilterModeConfig = {
					"isExtendedModeHidden": false,
					"isFoldersHidden": true
				};
				me.onChangeCustomFiltersMode(modifyCustomFilterModeConfig);
				sandbox.publish("CustomFilterExtendedMode", {
					folder: folder,
					filter: Terrasoft.deserialize(folder.get("SearchData"))
				}, [sandbox.id]);
			};
			var filterView = Ext.create("Terrasoft.Container",
				this.generateFilterViewConfig(filterName, folder.get("FolderType")));
			filterView.bind(filterViewModel);
			var folderFilterContainerName = this.get("folderFilterContainerName");
			var customFiltersViewsContainer = Ext.get(folderFilterContainerName);
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

		return {
			generate: generate
		};

	});
