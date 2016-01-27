define('QuickFilterModule', ['QuickFilterViewModel', 'QuickFilterView',
	'LabelDateEdit', 'LookupUtilities', 'QuickFilterModuleResources', 'performancecountermanager', 'StorageUtilities'],
	function(QuickFilterViewModel, QuickFilterView, LabelDateEdit,
			 LookupUtilities, resources, performanceCounterManager, StorageUtilities) {
		var filterModulesMap = [];
		var info;
		function createConstructor(context) {
			var Ext = context.Ext;
			var sandbox = context.sandbox;
			var Terrasoft = context.Terrasoft;

			var quickFilterKey;
			var filtersViewItemsNames = {
				customFilterContainerName: 'customFilterContainer',
				folderFilterContainerName: 'folderFilterContainer',
				quickFilterViewContainerName: 'quickFilterViewContainer',
				simpleFilterEditContainerName: 'simpleFilterEditContainer',
				folderFilterButtonContainerName: 'folderFilterButtonContainer',
				customFilterButtonContainerName: 'customFilterButtonContainer'
			};

			function getFixedFilterConfig() {
				var config = sandbox.publish('GetFixedFilterConfig');
				if (config) {
					config.filterChangedDefined = true;
					if (!config.getPeriodFilterConfig) {
						config.getPeriodFilterConfig = getPeriodFilterConfig;
					}
				}
				return config;
			}

			function getFolderFilterConfig(entitySchema, folderEntitySchema, inFolderEntitySchema) {
				var config = sandbox.publish('GetFolderFilterConfig') || {};
				config.entitySchema = entitySchema;
				config.folderEntitySchema = folderEntitySchema;
				config.inFolderEntitySchema = inFolderEntitySchema;
				config.folderFilterContainerName = filtersViewItemsNames.folderFilterContainerName;
				config.folderFilterButtonContainerName = filtersViewItemsNames.folderFilterButtonContainerName;
				return config;
			}

			function getCustomFilterConfig(entitySchema) {
				var config = sandbox.publish('GetExtendedFilterConfig') || {};
				config.entitySchema = entitySchema;
				config.customFilterContainerName = filtersViewItemsNames.customFilterContainerName;
				config.customFilterButtonContainerName = filtersViewItemsNames.customFilterButtonContainerName;
				config.quickFilterKey = quickFilterKey;
				return config;
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
					dueDateColumnName = startDateColumnName + 'Due';
					resultConfig.singleColumn = true;
				}
				resultConfig.startDateColumnName = startDateColumnName;
				resultConfig.startDateDefValue = startDateDefValue;
				resultConfig.dueDateColumnName = dueDateColumnName;
				resultConfig.dueDateDefValue = dueDateDefValue;
				return resultConfig;
			}

			function adjustCustomFilterViewModel(customFilterViewModel) {
				customFilterViewModel.showSimpleFilterEdit = function(valueEditConfig, afterDestroy, renderIndex) {
					var customFilterContainer = Ext.get(filtersViewItemsNames.customFilterContainerName);
					var addConditionView = Ext.getCmp(filtersViewItemsNames.simpleFilterEditContainerName);
					if (addConditionView) {
						if (customFilterViewModel.afterDestroy) {
							customFilterViewModel.afterDestroy();
						}
						if (renderIndex !== undefined) {
							addConditionView.reRender(renderIndex + 1);
						}
						else {
							addConditionView.reRender(null, customFilterContainer);
						}
						addConditionView.items.getAt(valueEditConfig ? 1 : 0).getEl().focus();
					}
					else {
						var addConditionViewConfig = QuickFilterView.generateAddSimpleFilterConfig(valueEditConfig,
							filtersViewItemsNames.simpleFilterEditContainerName);
						addConditionView = Ext.create("Terrasoft.Container", addConditionViewConfig);
						customFilterViewModel.destroySimpleFilterAddingContainer = function() {
							addConditionView.destroy();
						};
						addConditionView.bind(customFilterViewModel);
						if (renderIndex !== undefined) {
							addConditionView.render(customFilterContainer, renderIndex + 1);
						} else {
							addConditionView.render(customFilterContainer);
						}
						addConditionView.items.getAt(valueEditConfig ? 1 : 0).getEl().focus();
						customFilterViewModel.changeSimpleFilterValueEdit = function(controlConfig) {
							var config = QuickFilterView.getSimpleFilterValueEditConfig(controlConfig);
							config.id = "simpleFilterValueColumn";
							customFilterViewModel.set('simpleFilterValueColumn', null);
							var oldControl = addConditionView.items.getByKey(config.id);
							if (oldControl) {
								addConditionView.remove(oldControl);
								oldControl.destroy();
							}
							var newControl = Ext.create(config.className, config);
							addConditionView.insert(newControl, 1);
							newControl.bind(customFilterViewModel);
							addConditionView.reRender();

							var columnControl = addConditionView.items.getAt(0).getEl();
							if (!columnControl.getValue()) {
								columnControl.focus();
							} else {
								newControl.getEl().focus();
							}

						};
						addConditionView.on('destroy', function() {
							if (customFilterViewModel.afterDestroy) {
								customFilterViewModel.afterDestroy();
							}
						});
					}
					customFilterViewModel.afterDestroy = afterDestroy;
				};
				customFilterViewModel.getFilterViewModel = function(filterName, config) {
					var filterViewModel = Ext.create('Terrasoft.BaseViewModel', config);
					var customFiltersViewsContainer = Ext.get(filtersViewItemsNames.customFilterContainerName);
					filterViewModel.removeFilter = function(a1, a2, a3, tag) {
						var filters = customFilterViewModel.get('filters');
						filters.removeByKey(tag);
						customFilterViewModel.filterChanged();
					};

					var filterView = Ext.create('Terrasoft.Container',
						QuickFilterView.generateFilterViewConfig(filterName));
					filterView.bind(filterViewModel);
					filterView.render(customFiltersViewsContainer);
					filterViewModel.set('view', filterView);
					return filterViewModel;
				};
				customFilterViewModel.goToExtendedMode = function() {
					sandbox.publish('CustomFilterExtendedMode', {
						extendedFilter: customFilterViewModel.getFilters(true)
					}, [sandbox.id]);
				};
			}

			function adjustFolderFilterViewModel(folderFilterViewModel) {
				folderFilterViewModel.subscribeForCollectionEvent();
				folderFilterViewModel.getFilterViewModel = function(filterName, config) {
					var filterViewModel = Ext.create('Terrasoft.BaseViewModel', config);
					var customFiltersViewsContainer = Ext.get(filtersViewItemsNames.folderFilterContainerName);
					filterViewModel.removeFilter = function(a1, a2, a3, tag) {
						var filters = folderFilterViewModel.get('filters');
						filters.removeByKey(tag);
						folderFilterViewModel.filterChanged();
					};
					filterViewModel.editFilter = function(tag) {
						folderFilterViewModel.editFilter(tag);
					};
					var filterView = Ext.create('Terrasoft.Container',
						QuickFilterView.generateFilterViewConfig(filterName));
					filterView.bind(filterViewModel);
					filterView.render(customFiltersViewsContainer);
					filterViewModel.set('view', filterView);
					return filterViewModel;
				};
				folderFilterViewModel.folderSelecting = function(currentFilter) {
					var selectedFiltersState = getFilterState.call(this, 'Folder');
					var selectedValues = [];
					if (!currentFilter) {
						Terrasoft.each(selectedFiltersState, function(currentValue) {
							selectedValues.push(currentValue.value);
						}, this);
					}
					var enableMultiSelect = folderFilterViewModel.get('inFolderEntitySchema') ? true : false;
					if (!enableMultiSelect && selectedValues.length) {
						currentFilter = selectedValues[0];
					}
					LookupUtilities.OpenFolder(sandbox, {
						entitySchema: folderFilterViewModel.get('folderEntitySchema'),
						sectionEntitySchema: folderFilterViewModel.entitySchema,
						enableMultiSelect: enableMultiSelect,
						currentFilter: currentFilter,
						selectedFolders: selectedValues,
						multiSelect: selectedValues.length && !currentFilter && enableMultiSelect
					});
				};
			}

			function adjustFixedFilterViewModel(fixedFilterViewModel) {
				fixedFilterViewModel.showSimpleFilterEdit = function(filterName) {
					if (Ext.getCmp(filtersViewItemsNames.simpleFilterEditContainerName)) {
						Ext.getCmp(filtersViewItemsNames.simpleFilterEditContainerName).destroy();
					}
					var customFilterContainer = Ext.get(filtersViewItemsNames.quickFilterViewContainerName);
					var addConditionViewConfig = QuickFilterView.generateSimpleEditFilterConfig(filterName,
						filtersViewItemsNames.simpleFilterEditContainerName);
					var addConditionView = Ext.create("Terrasoft.Container", addConditionViewConfig);
					fixedFilterViewModel.destroySimpleFilterEdit = function() {
						addConditionView.destroy();
					};
					addConditionView.bind(fixedFilterViewModel);
					addConditionView.render(customFilterContainer);
					addConditionView.items.getAt(0).getEl().focus();
				};
				fixedFilterViewModel.getFilterViewModel = function(tag, filterName, config) {
					var filterViewModel = Ext.create('Terrasoft.BaseViewModel', config);
					var customFiltersViewsContainer = Ext.get('fixedFilter' + tag + 'Container');
					filterViewModel.removeFilter = function(a1, a2, a3, filterName) {
						var filters = fixedFilterViewModel.get(
							fixedFilterViewModel.getSelectedLookupValuesPropertyName(this.get('name')));
						filters.removeByKey(filterName);
						fixedFilterViewModel.filterChanged();
					};
					filterViewModel.editFilter = function(tag) {
						fixedFilterViewModel.editFilter(this.get('name'), tag);
					};
					var filterView = Ext.create('Terrasoft.Container',
						QuickFilterView.generateFilterViewConfig(filterName));
					filterView.bind(filterViewModel);
					if (customFiltersViewsContainer) {
						filterView.render(customFiltersViewsContainer);
					}
					filterViewModel.set('view', filterView);
					return filterViewModel;
				};
				fixedFilterViewModel.lookupSelecting = function(tag, currentFilter) {
					LookupUtilities.ThrowOpenLookupMessage(sandbox, {
						entitySchemaName: fixedFilterViewModel.columns[tag].referenceSchemaName,
						multiSelect: false,
						columnName: tag,
						currentFilter: currentFilter,
						filters: fixedFilterViewModel.get(tag + "LookupFilter")
					});
				};
			}

			function render(renderTo) {
				var quickFilterParams = sandbox.publish('GetQuickFilterParams', null, [sandbox.id]);
				quickFilterKey = quickFilterParams && quickFilterParams.quickFilterKey ?
					quickFilterParams.quickFilterKey :
					null;
				if (quickFilterKey) {
					for (var viewItemsName in filtersViewItemsNames) {
						filtersViewItemsNames[viewItemsName] += quickFilterKey;
					}
				}

				var schema = sandbox.publish('GetModuleSchema', null, [sandbox.id]);
				var entitySchema = schema ? schema : sandbox.publish('GetSectionEntitySchema');
				info = sandbox.publish('GetQuickFilterInfo');
				var referenceSchemas = getReferenceSchemas(entitySchema);

				var requiredFilterModules = [];
				var fixedFilterConfig = getFixedFilterConfig();
				if (fixedFilterConfig && fixedFilterConfig.filters) {
					Terrasoft.each(fixedFilterConfig.filters, function(filter) {
						var moduleName = filter.moduleName;
						if (!Ext.isEmpty(moduleName)) {
							requiredFilterModules.push(moduleName);
						}
					}, this);
				}
				var baseRequiredModules = [entitySchema.name + 'Folder', entitySchema.name + 'InFolder'];
				var requiredModules = baseRequiredModules.concat(requiredFilterModules);

				sandbox.requireModuleDescriptors(referenceSchemas, function() {
					if (moduleInstance.isDestroyed) {
						return;
					}
					require(requiredModules,
						function(folderEntitySchema, inFolderEntitySchema) {
							if (moduleInstance.isDestroyed) {
								return;
							}


							var moduleIndex = baseRequiredModules.length;
							filterModulesMap = [];
							var baseFixedFilters = ['PeriodFilter', 'Owner'];
							var hasBaseFixedFilters = false;
							var responseArguments = arguments;
							if (fixedFilterConfig && fixedFilterConfig.filters) {
								Terrasoft.each(fixedFilterConfig.filters, function(filter) {
									var moduleName = filter.moduleName;
									if (baseFixedFilters.indexOf(filter.name) >= 0) {
										hasBaseFixedFilters = true;
									}
									if (!Ext.isEmpty(moduleName)) {
										filterModulesMap[moduleName] = {
											config: filter,
											module: responseArguments[moduleIndex++]
										};
									}
								}, this);
							}

							var config = {
								//							Тут будет присутствовать такое наполнение
								//							fixedFilterConfig: {},
								//							folderFilterConfig: {},
								//							customFilterConfig: {},
								getFilterState: getFilterState,
								quickFilterViewContainerName: filtersViewItemsNames.quickFilterViewContainerName
							};
							config.fixedFilterConfig = fixedFilterConfig;
							config.hasBaseFixedFilters = hasBaseFixedFilters;
							if (!folderEntitySchema || !inFolderEntitySchema) {
								config.folderFilterConfig = null;
							} else {
								config.folderFilterConfig = getFolderFilterConfig(entitySchema, folderEntitySchema,
									inFolderEntitySchema);
							}
							config.customFilterConfig = getCustomFilterConfig(entitySchema);
							var viewModelConfig = QuickFilterViewModel.generate(config, info);
							var viewConfig = QuickFilterView.generate(config, info);

							var viewModel = Ext.create('Terrasoft.BaseViewModel',
								viewModelConfig.quickFilterViewModelConfig);
							viewModel.filterModulesMap = filterModulesMap;
							var view = Ext.create("Terrasoft.Container", viewConfig.quickFilterViewConfig);
							viewModel.getSchemaName = function() {
								return entitySchema.name;
							};
							viewModel.saveFilterState = saveFilterState;
							var filterChanged = function() {
								if (!this.suspendUpdate) {
									viewModel.saveFilterState();
									sandbox.publish('QuickFilterChanged', null, [sandbox.id]);
								}
							};

							Terrasoft.each(filterModulesMap, function(item) {
								var filterModule = item.module;
								if (!filterModule || !filterModule.generateViewConfig ||
									!filterModule.generateViewModelConfig) {
									return;
								}
								var filterViewModelConfig = filterModule.generateViewModelConfig(item.config);
								filterViewModelConfig.methods.filterChanged = filterChanged;
								filterViewModelConfig.methods.getFilterState = getFilterState;
								var filterViewModel = item.viewModel = Ext.create('Terrasoft.BaseViewModel',
									filterViewModelConfig);

								var filterViewConfig = filterModule.generateViewConfig(item.config);
								var preparedFilterViewConfig = generateFixedFilterConfig(filterViewConfig, item);
								var filterView = Ext.create("Terrasoft.Container", preparedFilterViewConfig);
								filterView.bind(filterViewModel);
								view.items.add(item.moduleName + 'Container', filterView);
							}, this);

							if (viewModelConfig.fixedFilterViewModelConfig && viewConfig.fixedFilterViewConfig) {
								viewModelConfig.fixedFilterViewModelConfig.methods.filterChanged = filterChanged;
								viewModelConfig.fixedFilterViewModelConfig.methods.getAddedFixedFilter =
									getAddedFixedFilter;
								var fixedFilterViewModel = Ext.create('Terrasoft.BaseViewModel',
									viewModelConfig.fixedFilterViewModelConfig);
								adjustFixedFilterViewModel(fixedFilterViewModel);
								viewModel.fixedFilterViewModel = fixedFilterViewModel;

								var fixedFilterView = Ext.create("Terrasoft.Container",
									viewConfig.fixedFilterViewConfig);
								fixedFilterView.bind(fixedFilterViewModel);
								view.items.add('FixedFilterContainer', fixedFilterView);
							}

							if (viewModelConfig.folderFilterViewModelConfig && viewConfig.folderFilterViewConfig) {
								viewModelConfig.folderFilterViewModelConfig.methods.filterChanged = filterChanged;
								viewModelConfig.folderFilterViewModelConfig.methods.getAddedFolderFilters =
									getAddedFolderFilters;
								var folderFilterViewModel = Ext.create('Terrasoft.BaseViewModel',
									viewModelConfig.folderFilterViewModelConfig);
								adjustFolderFilterViewModel(folderFilterViewModel);
								viewModel.folderFilterViewModel = folderFilterViewModel;

								var folderFilterView = Ext.create("Terrasoft.Container",
									viewConfig.folderFilterViewConfig);
								folderFilterView.bind(folderFilterViewModel);
								view.items.add('FolderFilterContainer', folderFilterView);
							}

							if (viewModelConfig.customFilterViewModelConfig && viewConfig.customFilterViewConfig) {
								viewModelConfig.customFilterViewModelConfig.methods.filterChanged = filterChanged;
								var customFilterViewModel = Ext.create('Terrasoft.BaseViewModel',
									viewModelConfig.customFilterViewModelConfig);
								adjustCustomFilterViewModel(customFilterViewModel);
								viewModel.customFilterViewModel = customFilterViewModel;

								var customFilterView = Ext.create("Terrasoft.Container",
									viewConfig.customFilterViewConfig);
								customFilterView.bind(customFilterViewModel);
								view.items.add('CustomFilterContainer', customFilterView);
							}

							sandbox.subscribe('GetQuickFilter', function() {
								return viewModel.getFilters();
							}, [sandbox.id]);

							sandbox.subscribe('GetFixedFilter', function(filterName) {
								return viewModel.getFilterValue('Fixed', filterName);
							});

							sandbox.subscribe('GetFolderFilter', function() {
								return viewModel.getFilterValue('Folder');
							}, [sandbox.id]);

							sandbox.subscribe('GetCustomFilter', function(filterName) {
								return viewModel.getFilterValue('Custom', filterName);
							});

							sandbox.subscribe('AddFixedFilter', function(args) {
								viewModel.addFilterValue('Fixed', args.filterName, args.filterValue);
							});

							sandbox.subscribe('AddFolderFilter', function(args) {
								viewModel.addFilterValue('Folder', null, args.filterValue);
								viewModel.saveFilterState();
							});

							sandbox.subscribe('AddCustomFilter', function(args) {
								viewModel.addFilterValue('Custom', args.filterName, args.filterValue);
							});

							view.render(renderTo);
							if (config && config.fixedFilterConfig) {
								var filters = config.fixedFilterConfig.filters;
								var periodFiltersConfig = null;
								Terrasoft.each(filters, function(filtersItem) {
									if (filtersItem.name === 'PeriodFilter') {
										periodFiltersConfig = filtersItem;
										return;
									}
								}, this);
								if (periodFiltersConfig && periodFiltersConfig.defPeriodIsEmpty &&
									viewModel.fixedFilterViewModel &&
									viewModel.fixedFilterViewModel.clearPeriodFilter) {
									var periodConfig = config.fixedFilterConfig.getPeriodFilterConfig(periodFiltersConfig);
									viewModel.fixedFilterViewModel.clearPeriodFilter(null, null, null, periodConfig);
								}
							}
							if (!(viewModel.folderFilterViewModel && viewModel.folderFilterViewModel.blobLoading)) {
								sandbox.publish('QuickFilterChanged', null, [sandbox.id]);
							}
							performanceCounterManager.setTimeStamp('loadAdditionalModulesComplete');
						});
				});
			}


			function generateFixedFilterConfig(viewConfig, config) {
				var spanId = (viewConfig.id || config.moduleName) + 'SpanContainer';
				var innerId = (viewConfig.id || config.moduleName) + 'SpanContainer';
				return {
					id: spanId,
					selectors: {
						el: "#" + spanId,
						wrapEl: '#' + spanId
					},
					tpl: [
						'<span id="{id}" style="{wrapStyles}" class="{wrapClassName}">',
						'{%this.renderItems(out, values)%}',
						'</span>'
					],
					afterrender: {
						bindTo: 'initialize'
					},
					wrapEl: "#fixedFilterContainer",
					items: [{
						className: 'Terrasoft.Container',
						id: innerId,
						selectors: {
							wrapEl: '#' + innerId
						},
						classes: {
							wrapClassName: ['filter-inner-container']
						},
						items: [viewConfig]
					}]
				}
			}

			function saveFilterState() {
				var state = sandbox.publish('GetHistoryState');
				var currentHash = state.hash;
				var currentState = state.state || {};
				var filterState = {};
				filterState.fixedFilterState = this.getFilterValue('Fixed');
				filterState.folderFilterState = this.getFilterValue('Folder');
				filterState.customFilterState = this.getFilterValue('Custom');
				Terrasoft.each(filterModulesMap, function(item, index) {
					var itemViewModel = item.viewModel;
					if (itemViewModel.getFilterValue) {
						var moduleStateKey = index + 'ModuleState';
						filterState[moduleStateKey] =  itemViewModel.getFilterValue.call(itemViewModel);
					}
				}, this);
				var newState = Terrasoft.deepClone(currentState);
				newState[quickFilterKey ? quickFilterKey : 'filterState'] = filterState;
				sandbox.publish('ReplaceHistoryState', {
					stateObj: newState,
					pageTitle: null,
					hash: currentHash.historyState,
					silent: true
				});
				var filterFolderProfileKey = 'FilterFolders_' + this.getSchemaName();
				var filterCustomProfileKey = 'FilterCustom_' + this.getSchemaName();
				if (filterState.folderFilterState) {
					Terrasoft.utils.saveUserProfile(filterFolderProfileKey, filterState.folderFilterState, false);
				}
				var customFilter = filterState.customFilterState;
				if (customFilter) {
					StorageUtilities.setItem(customFilter, filterCustomProfileKey);
				}
			}

			function clearFixedFilters(fixedFilters) {
				var filter;
				if (Ext.isEmpty(fixedFilters)) {
					fixedFilters = {};
					var fixedFiltersConfig = getFixedFilterConfig();
					var filters = fixedFiltersConfig.filters;
					for (var i = 0; i < fixedFiltersConfig.filters.length; i++) {
						filter = filters[i];
						if ('startDate' in filter &&
							'dueDate' in filter) {
							fixedFilters[filter.name] = {
								startDate: null,
								dueDate: null
							};
						} else {
							fixedFilters[filter.name] = [];
						}
					}
					return fixedFilters;
				}
				for (filter in fixedFilters) {
					if (fixedFilters[filter] instanceof Array) {
						fixedFilters[filter] = [];
					} else {
						for (var subFilter in fixedFilters[filter]) {
							fixedFilters[filter][subFilter] = null;
						}
					}
				}
				return fixedFilters;
			}

			function getFilterState(filterType) {
				var state = sandbox.publish('GetHistoryState');
				var moduleStateKey = filterType + 'ModuleState';
				var currentState = state.state || {};
				var filterState;
				var entityName = state.hash.entityName ? state.hash.entityName.replace('Section', '')
					: this.entitySchema.name;

				var filterFolderProfileKey = 'FilterFolders_' + entityName;
				var filterCustomProfileKey = 'FilterCustom_' + entityName;
				var filterObj = currentState[quickFilterKey ? quickFilterKey : 'filterState'];
				if (filterObj) {
					if (filterObj[moduleStateKey]) {
						return filterObj[moduleStateKey]
					}
					switch (filterType) {
						case 'Fixed':
							filterState = filterObj.fixedFilterState;
							if (filterObj.ignoreFixedFilters) {
								filterState = clearFixedFilters(filterState);
							}
							break;
						case 'Folder':
							if (!filterObj.ignoreFolderFilters) {
								filterState = filterObj.folderFilterState;
							} else {
								Terrasoft.utils.saveUserProfile(filterFolderProfileKey, {}, false);
							}
							break;
						case 'Custom':
							filterState = filterObj.customFilterState ||
								StorageUtilities.getItem(filterCustomProfileKey);
							StorageUtilities.setItem(filterState, filterCustomProfileKey);
							break;
						default:
							break;
					}
				} else {
					if (filterType === 'Custom') {
						filterState = StorageUtilities.getItem(filterCustomProfileKey);
					}
				}
				return filterState;
			}

			function getAddedFolderFilters() {
				var selectedFiltersInfo = {};
				var state = sandbox.publish('GetHistoryState');
				var currentState = state.state || {};
				var filterState = currentState[quickFilterKey ? quickFilterKey : 'filterState'];
				if (filterState && !filterState.ignoreFolderFilters) {
					if (!filterState.selectedFolderFilters) {
						selectedFiltersInfo.selectedFolderFilters = filterState.selectedFolderFilters;
					} else if (filterState.selectedFolderFilters.length > 0 &&
						filterState.selectedFolderFilters[0].sectionEntityScheamName ===
							this.entitySchema.name) {
						selectedFiltersInfo.selectedFolderFilters = filterState.selectedFolderFilters;
					}
					selectedFiltersInfo.currentFolderFilterValue = filterState.currentFolderFilterValue;
				}
				return selectedFiltersInfo;
			}

			function getAddedFixedFilter() {
				var state = sandbox.publish('GetHistoryState');
				var currentState = state.state || {};
				var filterState = currentState[quickFilterKey ? quickFilterKey : 'filterState'];
				if (filterState) {
					return filterState.selectedFixedFilters;
				}
			}

			function getReferenceSchemas(entitySchema) {
				var schemaList = [];
				Terrasoft.each(entitySchema.columns, function(column) {
					if ((column.dataValueType === Terrasoft.DataValueType.LOOKUP ||
						column.dataValueType === Terrasoft.DataValueType.ENUM) &&
						schemaList.indexOf(column.referenceSchemaName) === -1) {
						schemaList.push(column.referenceSchemaName);
					}
				});
				schemaList.push('find!' + entitySchema.name + 'Folder');
				schemaList.push('find!' + entitySchema.name + 'InFolder');
				return schemaList;
			}

			var moduleInstance = Ext.define('QuickFilterModule', {
				render: render
			});

			return moduleInstance;
		}
		return createConstructor;
	});
