define("SectionModule", ["ext-base", "terrasoft", "sandbox", "SectionModuleResources", "SectionViewGenerator",
	"SectionViewModelGenerator", "GridUtilities", "LookupUtilities", "SysModuleReport", "LocalizationUtilities",
	"ConfigurationEnums", "StorageUtilities", "performancecountermanager", "MaskHelper", "ReportUtilities",
	"PackageHelper", "ConfigurationConstants"],
	function(Ext, Terrasoft, sandbox, resources, SectionViewGenerator, SectionViewModelGenerator, GridUtilities,
			LookupUtilities, SysModuleReport, LocalizationUtilities, ConfigurationEnums, StorageUtilities,
			performanceCounterManager, MaskHelper, ReportUtilities, PackageHelper, ConfigurationConstants) {

		var viewCollection = new Terrasoft.Collection();
		var viewModel;
		var currentView;
		var currentViewConfig;
		var baseViewsConfig;
		var container;
		var filterProfileState = {};
		var contextHelpId;
		var selectedAnalyticsId = "";
		var isBroadcastMessagesSubscribed;
		var quickFilterModuleId;

		function loadView(renderTo) {
			var historyState = sandbox.publish("GetHistoryState");
			var entityName = "";
			var activeView = "";
			var sectionInfo = sandbox.publish("SectionInfo", null, [sandbox.id]);
			if (!sectionInfo) {
				sectionInfo = sandbox.publish("SectionInfo");
			}
			if (!sectionInfo) {
				historyState = sandbox.publish("GetHistoryState");
				entityName = historyState.hash.entityName;
				activeView = historyState.hash.operationType || historyState.state.activeTab;
			} else {
				historyState = {};
				entityName = sectionInfo.entityName;
				activeView = sectionInfo.activeView;
			}

			quickFilterModuleId = sandbox.id + "_QuickFilterModule";
			sandbox.subscribe("GetQuickFilterModuleId", function() {
				return quickFilterModuleId;
			});

			var scrollTo = document.body.scrollTop = document.documentElement.scrollTop = 0;

			if (viewModel && viewModel.name === entityName && !viewModel.isObsolete) {
				var viewsConfig = Terrasoft.deepClone(baseViewsConfig);
				var view = Ext.create(viewsConfig.containerView.className, viewsConfig.containerView);
				var openCardConfig = viewModel.openCardConfig;
				view.bind(viewModel);
				view.render(renderTo);
				if (openCardConfig) {
					viewModel.scrollTo =  openCardConfig.top || 0;
				}
				changeView(currentViewConfig, true);
				viewModel.reloadActions(currentViewConfig);
				if (!Ext.isEmpty(openCardConfig)) {
					if (historyState && historyState.state) {
						viewModel.isBackFromCard = historyState.state.searchState ? false : true;
					}
					var cardModuleResponse = viewModel.cardModuleResponse;
					if (!Ext.isEmpty(cardModuleResponse) &&
						cardModuleResponse.success && Terrasoft.isGUID(cardModuleResponse.uId)) {
						var uId = cardModuleResponse.uId;
						viewModel.loadByUId.call(viewModel, uId);
					}
				}
				viewModel.openCardConfig = null;
				viewModel.cardModuleResponse = null;
				scrollTo = viewModel.scrollTo;
				if (!Ext.isEmpty(scrollTo) && scrollTo > 0) {
					Ext.getBody().dom.scrollTop = scrollTo;
					Ext.getDoc().dom.documentElement.scrollTop = scrollTo;
					scrollTo = 0;
				}
			} else {
				if (viewModel && viewModel.isObsolete) {
					viewModel.isObsolete = false;
				}
				scrollTo = document.body.scrollTop = document.documentElement.scrollTop = 0;
				container = renderTo;
				var profileKey = entityName.replace("Section", "");
				var selectedAnalyticsElementProfileKey = "SelectedAnalyticsElement_" + profileKey;
				var customSectionProfileKey = "CustomSectionProfile_" + profileKey;
				var filterFolderProfileKey = "FilterFolders_" + profileKey;
				if (entityName) {
					var map = {};
					map[entityName] = {
						sandbox: "sandbox_" + sandbox.id,
						"ext-base": "ext_" + Ext.id
					};
					requirejs.config({
						map: map
					});
					performanceCounterManager.setTimeStamp("LoadSchema");
					require([entityName,
						"profile!" + selectedAnalyticsElementProfileKey,
						"profile!" + filterFolderProfileKey,
						"profile!" + customSectionProfileKey],
						function(entity, selectedAnalyticElement, filterFolder, customSectionProfile) {
							if (moduleInstance.isDestroyed) {
								return;
							}
							if (!Ext.isEmpty(filterFolder) &&
								((historyState.state && !historyState.state.filterState) ||
									historyState.state && historyState.state.filterState &&
										Ext.isEmpty(historyState.state.filterState.folderFilterState))) {
								filterProfileState.selectedFolderFilters = filterFolder;
								var currentState = historyState.state || {};
								var newState = Terrasoft.deepClone(currentState);
								var filterState = currentState.filterState || {};
								filterState.selectedFolderFilters = filterFolder;
								newState.filterState = filterState;
								var currentHash = historyState.hash;
								sandbox.publish("ReplaceHistoryState", {
									stateObj: newState,
									pageTitle: null,
									hash: currentHash.historyState,
									silent: true
								});
							}
							if (selectedAnalyticElement) {
								selectedAnalyticsId = selectedAnalyticElement.id;
							}
							entity.name = entityName;
							performanceCounterManager.setTimeStamp("BuildSchemaAndParents");
							createSchemaParents(entity, function(schemaConfig, parentSchemaConfig) {
								if (moduleInstance.isDestroyed) {
									return;
								}
								var viewModelSchema = schemaConfig;
								viewModelSchema = createSchema(viewModelSchema, parentSchemaConfig);
								var viewModelConfig = createViewModelClassBySchema(viewModelSchema);
								var viewModelValues = viewModelConfig.values;
								viewModelValues.customSectionProfileKey = customSectionProfileKey;
								viewModelValues.customSectionProfile = customSectionProfile;
								viewModel = Ext.create(viewModelConfig.name, {
									values: viewModelConfig.values
								});
								viewModel.scrollTo = scrollTo;
								viewModel.checkExportGrid(function(result) {
									if (!moduleInstance.isDestroyed) {
										viewModel.set("canExportGrid", result);
									}
								});
								var sectionViews = viewModel.getViews();
								var getColumnsProfilesCallback = function(columnsSettingsProfile) {
									sandbox.publish("InitDataViews", {
										isMainHeaderVisible: false
									});
									this.set("columnsSettingsProfile", columnsSettingsProfile);
									this.loadedColumns = viewModelConfig.loadedColumns;
									Terrasoft.each(this.columns, function(column) {
										if (column.isCollection === true) {
											this.set(column.name, new Terrasoft.BaseViewModelCollection());
										}
									}, this);
									if (viewModelConfig.initViewModel) {
										viewModelConfig.initViewModel.call(this);
									}
									if (selectedAnalyticsId) {
										this.set("analyticsChartActiveRow", selectedAnalyticsId);
										selectedAnalyticsId = "";
										Terrasoft.utils.saveUserProfile(selectedAnalyticsElementProfileKey, {}, false);
									}
									this.getContainer = function() {
										return renderTo;
									};
									this.getSandbox = function() {
										return sandbox;
									};
									this.executeAction = function(moduleName) {
										if (moduleName) {
											return sandbox.publish("PushHistoryState", {hash: moduleName});
										}
									};
									this.changeView = function(viewName) {
										MaskHelper.ShowBodyMask();
										changeView(viewName);
										this.loadedColumns = viewModelConfig.loadedColumns;
										this.reloadActions(viewName);
										MaskHelper.HideBodyMask();
									};
									this.openSettingPage = function() {
										if (viewModelConfig.openSettingPage) {
											viewModelConfig.openSettingPage.call(this);
											return;
										}
										MaskHelper.ShowBodyMask();
										var tag = "SummarySettingsModule/" + viewModelConfig.entitySchema.name;
										sandbox.publish("PushHistoryState", {hash: tag});
									};
									this.publishMessage = function(message, args, tags) {
										return sandbox.publish(message, args, tags);
									};
									this.subscribe = function(eventName, eventHandler, tags) {
										sandbox.subscribe(eventName, eventHandler, tags);
									};
									this.getSandBoxId = function() {
										return sandbox.id;
									};
									this.loadModule = function(name, args) {
										return sandbox.loadModule(name, args);
									};
									this.getFolderFilter = function() {
										return sandbox.publish("GetFolderFilter", null, [quickFilterModuleId]);
									};
									this.getQuickFilter = function() {
										return sandbox.publish("GetQuickFilter", null, [quickFilterModuleId]);
									};
									var extActions;
									this.reloadActions = function() {
										this.updateSortColumnsCaptions();
										var sectionActionsContainer = Ext.get("SectionActionsContainer");
										if (Ext.isEmpty(sectionActionsContainer)) {
											return;
										}
										var actions = this.getCurrentViewActions();
										var actionsConfig = SectionViewGenerator.getActionsCongif(actions);
										this.updateActionsConfig(actionsConfig, function() {
											if (extActions) {
												extActions.destroy();
											}
											extActions = Ext.create(actionsConfig.className, actionsConfig);
											extActions.bind(this);
											extActions.render(sectionActionsContainer);
										}, this);
									};
									var defViewName = this.getDefView();
									if (!Ext.isEmpty(activeView)) {
										defViewName = activeView;
									}
									var defView = {};
									Terrasoft.each(sectionViews, function(sectionView) {
										if (sectionView.name === defViewName) {
											defView = sectionView;
										}
									});
									var linksConfig = {};
									var reportsSelectedCallback = function(reports) {
										if (moduleInstance.isDestroyed) {
											return;
										}
										var reportsCollections = reports.collection.getItems();
										baseViewsConfig = SectionViewGenerator.generate(viewModelSchema, sectionViews,
											columnsSettingsProfile, reportsCollections, linksConfig, sectionInfo);
										this.set("linksConfig", linksConfig);
										contextHelpId = baseViewsConfig.contextHelpId;
										var viewsConfig = Terrasoft.deepClone(baseViewsConfig);
										var view = Ext.create(viewsConfig.containerView.className,
											viewsConfig.containerView);
										viewCollection.clear();
										Terrasoft.each(viewsConfig.views, function(tabView) {
											var itemViewSchema = Terrasoft.deepClone(tabView.viewConfig);
											viewCollection.add(tabView.name, itemViewSchema);
										});
										view.bind(this);
										performanceCounterManager.setTimeStamp("render");
										view.render(renderTo);
										MaskHelper.HideBodyMask();
										changeView(defView, true);
										this.reloadActions(defView);
										performanceCounterManager.setTimeStamp("renderComplete");
										sandbox.subscribe("GetFixedFilterConfig", function() {
											return viewModelConfig.fixedFilterConfig;
										});
										sandbox.subscribe("GetFolderFilterConfig", function() {
											return viewModelConfig.folderFilterConfig || {};
										});
										sandbox.subscribe("GetExtendedFilterConfig", function() {
											return viewModelConfig.extendedFilterConfig || {};
										});
										sandbox.subscribe("GetSectionEntitySchema", function() {
											return viewModelConfig.entitySchema;
										});
										sandbox.subscribe("GetSectionSchemaName", function() {
											return viewModelConfig.entitySchema.name;
										});
										sandbox.subscribe("GetQuickFilterInfo", function() {
											return viewModelConfig.quickFilterUtils;
										});
										loadAdditionalModules();
									};
									var sectionReportsSelect = ReportUtilities.getReports(this.entitySchema.uId,
										"Section");
									var storageQueryConfig = {
										esq: sectionReportsSelect,
										key: this.name + "Reports",
										callback: reportsSelectedCallback,
										scope: this
									};

									if (viewModelSchema.loadCardReports) {
										storageQueryConfig.extraQuery = {
											query: ReportUtilities.getReports(this.entitySchema.uId,
												"Card"),
											key: this.entitySchema.name + "PageReports"
										};
									}
									StorageUtilities.GetESQResultByKey(storageQueryConfig);
									if (Terrasoft.SysSettings.cachedSettings.BuildType !==
										"e45eb864-59cc-4325-8276-d85e1ba90c95") {
										getIsSectionDesignerAvailable(this);
									}
								};
								getColumnsProfiles(profileKey, sectionViews, getColumnsProfilesCallback, viewModel);
							});
						}
					);
				}
			}
		}

		function getColumnsProfiles(profileKey, tabNames, callback, scope) {
			var profileData = {};
			var requireSchemas = [];
			Terrasoft.each(tabNames, function(tabName) {
				var profileKey = this.profileKey + "GridSettings" + tabName.name;
				profileData[tabName.name] = {
					key: profileKey
				};
				requireSchemas.push("profile!" + profileKey);
			}, {
				profileKey: profileKey
			});
			require(requireSchemas, function() {
				if (moduleInstance.isDestroyed) {
					return;
				}
				var i = 0;
				for (var viewName in profileData) {
					profileData[viewName].value = arguments[i++];
				}
				callback.call(scope, profileData);
			});
		}
		function createSchemaParents(schemaConfig, callback) {
			var parentSchemaName = schemaConfig.extend;
			if (parentSchemaName === "Terrasoft.model.BaseViewModel") {
				callback(schemaConfig, null);
				return;
			}
			var map = {};
			map[parentSchemaName] = {
				sandbox: "sandbox_" + sandbox.id,
				"ext-base": "ext_" + Ext.id,
				terrasoft: "terrasoft_" + Terrasoft.id
			};
			requirejs.config({
				map: map
			});
			require([parentSchemaName], function(parentSchemaConfig) {
				parentSchemaConfig.name = parentSchemaName;
				createSchemaParents(parentSchemaConfig, function(parentSchemaConfig, parentConfig) {
					var parentSchema = createSchema(parentSchemaConfig, parentConfig);
					createViewModelClassBySchema(parentSchema);
					callback(schemaConfig, parentSchema);
				});
			});
		}

		function extendStructure(parent, child) {
			var structure = Terrasoft.deepClone(parent);
			structure.name = child.name;
			structure.extend = child.extend;
			structure.type = child.type;
			structure.schemaDifferences = child.schemaDifferences;
			structure.userCode = child.userCode;
			//			Ext.apply(structure.methods, child.methods);
			return structure;
		}

		function createSchema(schemaConfig, parentSchemaConfig) {
			var schemaName = schemaConfig.name;
			var parentSchema = Terrasoft.deepClone(parentSchemaConfig || schemaConfig);
			var schema = extendStructure(parentSchema, schemaConfig);
			schema.schemaDifferences.call(schema);
			schema.sandbox = sandbox;
			schema.userCode.call(schema);
			schema.name = schemaName;
			return schema;
		}

		function createViewModelClassBySchema(schema) {
			var viewModelConfig = SectionViewModelGenerator.generate(schema);
			var viewModelConfigCopy = Terrasoft.deepClone(viewModelConfig);
			Ext.define(viewModelConfigCopy.name, viewModelConfigCopy);
			return viewModelConfig;
		}

		function loadAdditionalModules() {
			performanceCounterManager.setTimeStamp("loadAdditionalModules");
			loadCommandLine();
			loadQuickFilter();
			loadSummary();
			loadContextHelp(contextHelpId);
		}

		function loadCommandLine() {
			if (moduleInstance.isDestroyed) {
				return;
			}
			sandbox.loadModule("CommandLineModule", {
				renderTo: "section-command-line-container"
			});
		}

		function loadContextHelp(id) {
			if (moduleInstance.isDestroyed) {
				return;
			}
			if (id) {
				var moduleId = sandbox.id + "_ContextHelp" + id;
				sandbox.subscribe("GetContextHelpId", function() {
					return id;
				}, [moduleId]);
				var contextHelpContainer = Ext.get("section-context-help-container");
				sandbox.loadModule("ContextHelpModule", {
					renderTo: contextHelpContainer,
					id: moduleId
				});
			}
		}

		function loadQuickFilter() {
			if (moduleInstance.isDestroyed) {
				return;
			}
			var quickFilterContainer = Ext.get("quickFilterContainer");
			if (!isBroadcastMessagesSubscribed) {
				sandbox.subscribe("QuickFilterChanged", function() {
					if (viewModel.isBackFromCard) {
						viewModel.isBackFromCard = false;
						return;
					}
					performanceCounterManager.setTimeStamp("loadData");
					viewModel.clear(viewModel.get("currentTabName"), "QuickFilterChanged");
					viewModel.load(viewModel.get("currentTabName"), "QuickFilterChanged");
				}, [quickFilterModuleId]);
				sandbox.subscribe("CustomFilterExtendedMode", function(args) {
					var moduleId = sandbox.id + "_ExtendedFilterEditModule";

					sandbox.subscribe("GetExtendedFilter", function() {
						var extendedFilterConfig = viewModel.extendedFilterConfig;
						if (extendedFilterConfig) {
							if (extendedFilterConfig.extendedFilterViewId) {
								args.extendedFilter.extendedFilterViewId =
									extendedFilterConfig.extendedFilterViewId;
							}
							if (extendedFilterConfig.extendedFilterViewModelId) {
								args.extendedFilter.extendedFilterViewModelId =
									extendedFilterConfig.extendedFilterViewModelId;
							}
						}
						return args.extendedFilter;
					}, [moduleId]);
					sandbox.subscribe("ResultExtendedFilter", function(args) {
						if (args.filter) {
							if (args.filter.collection.length > 0) {
								filterProfileState.customFilterState = {
									extendedFilter: {
										value: args.serializedFilter,
										displayValue: viewModel.getExtendedFilterDisplayValue(args.filter)
									}
								};
							} else {
								filterProfileState.customFilterState = {};
							}
						}
					}, [moduleId]);

					var params = sandbox.publish("GetHistoryState");
					sandbox.publish("PushHistoryState", {hash: params.hash.historyState});
					sandbox.loadModule("ExtendedFilterEditModule", {
						renderTo: container,
						keepAlive: true,
						id: moduleId
					});
				}, [quickFilterModuleId]);
				sandbox.subscribe("OpenFolderPage", function(args) {
					filterProfileState.currentFolderFilterValue = args.config.currentFilter;
					var moduleId = sandbox.id + "_FolderLookupPage";
					var params = sandbox.publish("GetHistoryState");
					sandbox.subscribe("ResultSelectedFolders", function(args) {
						filterProfileState.selectedFolderFilters = args.folders;
					}, [moduleId]);
					sandbox.subscribe("FolderInfo", function() {
						args.config.modifyFolderFunc = viewModel.modifyFolderFunc;
						var folderFilterConfig = viewModel.folderFilterConfig;
						if (folderFilterConfig) {
							if (folderFilterConfig.folderFilterViewId) {
								args.config.folderFilterViewId = folderFilterConfig.folderFilterViewId;
							}
							if (folderFilterConfig.folderFilterViewModelId) {
								args.config.folderFilterViewModelId = folderFilterConfig.folderFilterViewModelId;
							}
						}
						return args.config;
					}, [moduleId]);
					sandbox.publish("PushHistoryState", {hash: params.hash.historyState});
					sandbox.loadModule("FolderLookupPage", {
						renderTo: container,
						id: moduleId,
						keepAlive: true
					});
				}, [quickFilterModuleId]);
				sandbox.subscribe("OpenLookupPage", function(args) {
					var moduleId = sandbox.id + "_LookupPage";
					var params = sandbox.publish("GetHistoryState");
					sandbox.subscribe("ResultSelectedRows", function(lookupValueResult) {
						filterProfileState.selectedFixedFilters = {
							columnName: lookupValueResult.columnName,
							values: lookupValueResult.selectedRows.getItems(),
							currentFilter: args.config.currentFilter
						};
					}, [moduleId]);
					sandbox.subscribe("LookupInfo", function() {
						return args.config;
					}, [moduleId]);
					sandbox.publish("PushHistoryState", {hash: params.hash.historyState});
					MaskHelper.ShowBodyMask();
					sandbox.loadModule("LookupPage", {
						renderTo: container,
						id: moduleId,
						keepAlive: true
					});
				});
				isBroadcastMessagesSubscribed = true;
			}
			sandbox.loadModule("QuickFilterModule", {
				renderTo: quickFilterContainer,
				id: quickFilterModuleId
			});
			var renderTo = Ext.get("centerPanel");
			sandbox.subscribe("ShowLookupPage", function(config) {
				viewModel.scrollTo = document.body.scrollTop || document.documentElement.scrollTop;
				LookupUtilities.Open(sandbox, config, function(args) {
					sandbox.publish("LookupResultSelected", args);
				}, this, renderTo);
			}, [sandbox.id]);
		}

		function getIsSectionDesignerAvailable(viewModel) {
			PackageHelper.getIsPackageInstalled(ConfigurationConstants.PackageUId.Platform,
				function(isPackageInstalled) {
					if (isPackageInstalled) {
						require(["SectionDesignerUtils"], function(module) {
							module.getCanUseSectionDesigner(function(result) {
								viewModel.set("isSectionDesignerAvailable", result.canUseSectionDesigner);
							});
						});
					} else {
						viewModel.set("isSectionDesignerAvailable", false);
					}
				});
		}

		function loadSummary() {
			var summaryContainer = Ext.get("main-summary-view");
			if (summaryContainer) {
				sandbox.loadModule("SummaryModule", {
					renderTo: summaryContainer
				});
			}
		}

		function changeView(view, renderOnly) {
			if (currentView && !currentView.destroyed) {
				currentView.destroy();
			}
			if (viewModel.viewChanging) {
				viewModel.viewChanging(view.name);
			}
			var viewContainer = Ext.get("autoGeneratedContainer");
			var itemViewConfig = viewCollection.get(view.name);
			var config = Terrasoft.deepClone(itemViewConfig);
			currentView = Ext.create(config.className, config);
			var currentViewItems = currentView.items;
			if (currentViewItems) {
				if (currentViewItems.items) {
					Terrasoft.each(currentViewItems.items, function(item) {
						if (item.className === "Terrasoft.Grid") {
							item.on("afterRowRender", viewModel.onAfterGridRowRender);
						}
					}, this);
				}
			}
			viewModel.set("tabName", view.caption);
			viewModel.set("currentTabName", view.name);
			if (!renderOnly) {
				viewModel.clear(view.name, "viewChanging");
			}
			currentView.bind(viewModel);
			if (!renderOnly) {
				viewModel.load(view.name, "viewChanging");
				currentView.render(viewContainer);
				loadSummary();
			} else {
				currentView.render(viewContainer);
			}

			if (viewModel.viewChanged) {
				viewModel.viewChanged(view.name);
			}
			currentViewConfig = view;
		}

		function init() {
			var state = sandbox.publish("GetHistoryState");
			var currentHash = state.hash;
			var currentState = state.state || {};
			if (currentState.moduleId === sandbox.id &&
				!filterProfileState.customFilterState &&
				!filterProfileState.selectedFolderFilters &&
				!filterProfileState.selectedFixedFilters) {
				return;
			}
			var newState = Terrasoft.deepClone(currentState);
			var filterState = currentState.filterState || {};
			if (filterProfileState.customFilterState) {
				filterState.customFilterState = filterProfileState.customFilterState;
				newState.filterState = filterState;
				filterProfileState.customFilterState = null;
			}
			if (filterProfileState.selectedFolderFilters) {
				filterState.selectedFolderFilters = filterProfileState.selectedFolderFilters;
				filterState.currentFolderFilterValue = filterProfileState.currentFolderFilterValue;
				newState.filterState = filterState;
				filterProfileState.selectedFolderFilters = null;
			}
			if (filterProfileState.selectedFixedFilters) {
				filterState.selectedFixedFilters = filterProfileState.selectedFixedFilters;
				newState.filterState = filterState;
				filterProfileState.selectedFixedFilters = null;
			}
			newState.moduleId = sandbox.id;
			sandbox.publish("ReplaceHistoryState", {
				stateObj: newState,
				pageTitle: null,
				hash: currentHash.historyState,
				silent: true
			});
		}

		var moduleInstance = {
			init: init,
			render: function(renderTo) {
				loadView(renderTo);
			},
			destroy: function() {
				if (viewModel.onModuleDestroy) {
					viewModel.onModuleDestroy();
				}
			}
		};
		return moduleInstance;
	}
);