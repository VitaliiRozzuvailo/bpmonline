define("CardProcessModule", ["CardProcessViewGenerator", "CardProcessViewModelGenerator", "DetailModule",
	"CardUtilities", "CardProcessModuleResources", "LoadProcessModules", "LookupUtilities", "ProcessModule",
	"EditPageDesignerHelper", "SysModuleReport", "LocalizationUtilities", "StorageUtilities",
	"performancecountermanager", "ProcessHelper", "MaskHelper", "ReportUtilities"],
	function(CardProcessViewGenerator, CardProcessViewModelGenerator, DetailModule, CardUtilities,
		CardProcessModuleResources, LoadProcessModules, LookupUtilities, ProcessModule, EditPageDesignerHelper,
		SysModuleReport, LocalizationUtilities, StorageUtilities, performanceCounterManager, ProcessHelper,
		MaskHelper, ReportUtilities) {
		function createConstructor(context) {
			var view;
			var viewModel;
			var viewModelSchema;
			var info;
			var viewRenderTo;
			var valuePairs;
			var action;
			var parentSchemaName;
			var recordId;
			var additionalValues = [];
			var prepareValues = [];
			var isProcessMode = false;
			var viewConfig;
			var defaultValues;
			var detailProfileKey;
			var detailProfile;
			var contextHelpId;
			var Ext = context.Ext;
			var sandbox = context.sandbox;
			var Terrasoft = context.Terrasoft;
			var savedSchemaName;
			var instance;
			var parentContainer;
			var parentSchemaNames = [];
			var isReadOnly;
			var processData;

			function loadCardView(renderTo, moduleInstance) {
				instance = moduleInstance;
				var entityInfo = sandbox.publish("CardModuleEntityInfo", null, [sandbox.id]);
				if (viewModel) {
					var config = Terrasoft.deepClone(viewConfig);
					var genView = Ext.create(config.className || "Terrasoft.Container", config);
					var loadCardViewCallback = function() {
						genView.bind(viewModel);
						performanceCounterManager.setTimeStamp("render");
						genView.render(renderTo);
						performanceCounterManager.setTimeStamp("renderComplete");
						requiredLabelReset(viewModel);
						resumeScroll.call(viewModel);
					};
					if (isProcessMode && viewModelSchema && viewModelSchema.customizeView) {
						viewModelSchema.customizeView(viewModel, loadCardViewCallback);
					} else {
						loadCardViewCallback();
					}
					return;
				}
				processData = ProcessHelper.getProcessElementData(sandbox);
				if (processData && !Ext.isEmpty(processData.parameters)) {
					Terrasoft.each(processData.parameters, function(param, name) {
						if (ProcessHelper.getIsDateTimeDataValueType(param.dataValueType)) {
							processData.parameters[name] = Terrasoft.parseDate(param.value);
						}
					}, this);
				}
				sandbox.subscribe("OpenCardModule", function(args) {
					viewModel.scrollTo = document.body.scrollTop || document.documentElement.scrollTop;
					var params = sandbox.publish("GetHistoryState");
					sandbox.publish("PushHistoryState", {hash: params.hash.historyState});
					MaskHelper.ShowBodyMask();
					sandbox.loadModule("CardModule", {
						renderTo: parentContainer || renderTo,
						id: args,
						keepAlive: true
					});
				}, [sandbox.id]);
				sandbox.subscribe("OpenGridSettings", function(args) {
					var params = sandbox.publish("GetHistoryState");
					sandbox.publish("PushHistoryState", {hash: params.hash.historyState});
					MaskHelper.ShowBodyMask();
					sandbox.loadModule("GridSettings", {
						renderTo: parentContainer || renderTo,
						id: args,
						keepAlive: true
					});
				}, [sandbox.id]);
				sandbox.subscribe("LoadCustomModule", function(args) {
					viewModel.scrollTo = document.body.scrollTop || document.documentElement.scrollTop;
					var params = sandbox.publish("GetHistoryState");
					sandbox.publish("PushHistoryState", { hash: params.hash.historyState });
					sandbox.loadModule(args.moduleName, {
						renderTo: renderTo,
						id: args.moduleId,
						keepAlive: true
					});
				}, [sandbox.id]);
				var historyState = sandbox.publish("GetHistoryState");
				var hash = historyState.hash;
				var state = historyState.state;
				var schemaName = hash.entityName || "";
				action = hash.operationType || "add";
				parentSchemaName = hash.parentSchemaName || "";
				recordId = hash.recordId || "";
				valuePairs = hash.valuePairs || [];
				if (state) {
					defaultValues = state.defaultValues;
					isProcessMode = !Ext.isEmpty(state.executionData) && !Ext.isEmpty(hash.historyState.match("/prc$"));
				}
				if (entityInfo) {
					if (entityInfo.cardSchemaName) {
						schemaName = entityInfo.cardSchemaName;
					}
					if (entityInfo.action) {
						action = entityInfo.action;
					}
					if (entityInfo.activeRow) {
						recordId = entityInfo.activeRow;
					}
					if (entityInfo.typeColumnName && entityInfo.typeUId) {
						valuePairs.push({
							name: entityInfo.typeColumnName,
							value: entityInfo.typeUId
						});
					}
					if (entityInfo.valuePairs) {
						var valuePairName = entityInfo.valuePairs[0].name;
						var valuePairValue = entityInfo.valuePairs[0].value;
						if (Ext.isArray(valuePairName)) {
							entityInfo.valuePairs.pop();
							valuePairName.forEach(function(name, index) {
								entityInfo.valuePairs.push({
									name: name,
									value: valuePairValue[index]
								});
							});
						}
						entityInfo.valuePairs.forEach(function(value, index) {
							valuePairs.push({
								name: entityInfo.valuePairs[index].name,
								value: entityInfo.valuePairs[index].value
							});
						});
					}
					isReadOnly = entityInfo.isReadOnly;
				}

				if (processData) {
					Terrasoft.each(processData.parameters, function(value, name) {
						valuePairs.push({
							name: name,
							value: value
						});
					}, this);
				}

				if (schemaName) {
					var map = {};
					map[schemaName] = {
						sandbox: "sandbox_" + sandbox.id,
						"ext-base": "ext_" + Ext.id
					};
					requirejs.config({
						map: map
					});
					detailProfileKey = "CollapsedDetail_" + schemaName;
					var detailsCollapsedProfileKey = "profile!" + detailProfileKey;
					savedSchemaName = schemaName;
					performanceCounterManager.setTimeStamp("LoadSchema");
					require([schemaName, detailsCollapsedProfileKey], function(schema, detailsCollapsedProfile) {
						if (instance.isDestroyed) {
							return;
						}
						schema.name = schemaName;
						schema.entityInfo = entityInfo;
						schema.action = action;
						detailProfile = detailsCollapsedProfile;
						performanceCounterManager.setTimeStamp("BuildSchemaAndParents");
						createSchemaParents(schema, function(schemaConfig, parentSchemaConfig) {
							if (instance.isDestroyed) {
								return;
							}
							viewModelSchema = createSchema(schemaConfig, parentSchemaConfig);
							contextHelpId = viewModelSchema.contextHelpId;
							EditPageDesignerHelper.getModifications(schemaName, function(editPageModifications) {
								if (instance.isDestroyed) {
									return;
								}
								EditPageDesignerHelper.updateSchema(viewModelSchema, editPageModifications);
								if (viewModelSchema.finalizeStructure) {
									viewModelSchema.find = EditPageDesignerHelper.findElementInStructure;
									viewModelSchema.finalizeStructure.call(viewModelSchema);
								}
								var viewModelConfig = createViewModelClassBySchema(viewModelSchema);
								viewModelConfig.loadLookup = loadLookup;
								viewModel = Ext.create(viewModelConfig.name);
								Terrasoft.each(viewModelSchema.schema.leftPanel, function(schemaItem) {
									setDetailCollapsed(schemaItem, detailsCollapsedProfile);
								});
								Terrasoft.each(viewModelSchema.schema.rightPanel, function(schemaItem) {
									setDetailCollapsed(schemaItem, detailsCollapsedProfile);
								});
								viewModel.set("isProcessMode", isProcessMode);
								viewModel.set("isVisibleEditButton", true);
								viewModel.set("canDesignPage", false);

								viewModel.set("delayExecutionButtonVisible",
									LoadProcessModules.isDelayExecutionButtonVisible(sandbox, isProcessMode));

								viewModel.processData = processData;

								var reportsSelectedCallback = function(reports) {
									if (instance.isDestroyed) {
										return;
									}
									viewModel.entitySchemaInfo = viewModelConfig.entitySchemaInfo;
									viewModel.set("isEdit", action === "edit");
									sandbox.subscribe("GetCardSchemaName", function() {
										return viewModelSchema.entitySchema.name;
									});
									sandbox.subscribe("OpenLookupPage", function(openLookupPageArgs) {
										viewModel.scrollTo = document.body.scrollTop ||
											document.documentElement.scrollTop;
										LookupUtilities.OpenLookupPage(sandbox, renderTo, openLookupPageArgs,
											viewModel);
									}, [sandbox.id]);
									sandbox.subscribe("ShowLookupPage", function(config) {
										viewModel.scrollTo = document.body.scrollTop ||
											document.documentElement.scrollTop;
										LookupUtilities.Open(sandbox, config, function(args) {
											sandbox.publish("LookupResultSelected", args);
										}, this, renderTo);
									}, [sandbox.id]);
									sandbox.subscribe("SaveRecord", function(args) {
										viewModel.isSilentSave = true;
										viewModel.silentArgs = args;
										if (args.moduleId === sandbox.id) {
											viewModel.save();
										}
									});
									sandbox.subscribe("FindDuplicatesResult", function(responce) {
										viewModel.onFindDuplicatesResult(responce);
									}, [sandbox.id]);
									sandbox.subscribe("DetailInfo", function(detailId) {
										Terrasoft.each(detailsInfo, function(item) {
											var currentDetailId = sandbox.id + "_detail_" + item.name;
											if (currentDetailId !== detailId) {
												return;
											}
											var filterPath = item.filterPath;
											var filterValue;
											if (Ext.isArray(filterPath)) {
												filterValue = [];
												filterPath.forEach(function(value, index) {
													filterValue.push(getFilterColumnValue(item.filterValuePath[index]));
												}, this);
											} else {
												filterValue = getFilterColumnValue(item.filterValuePath);
											}
											var args = {
												Id: detailId,
												entityInfo: entityInfo,
												entitySchemaName: item.entitySchemaName,
												schemaName: item.schemaName,
												filterPath: filterPath,
												filterValue: filterValue,
												parentChemaName: viewModel.entitySchema.name,
												operationType: action,
												cardModuleSandboxId: sandbox.id
											};
											if (viewModel.getPredefinedRecords) {
												args.predefinedRecords = viewModel.getPredefinedRecords(item.name,
													action);
											}
											if (viewModel.readOnlyDetails) {
												var detailsNames = viewModel.readOnlyDetails;
												for (var i = 0; i < detailsNames.length; i++) {
													if (detailsNames[i] === item.name) {
														args.isReadOnly = true;
													}
												}
											}
											sandbox.publish("LoadData", args);
										});
									});
									viewModel.destroy = function(config) {
										if (Ext.isEmpty(config) || config.keepAlive !== true) {
											requirejs.undef(savedSchemaName);
										}
									};
									viewModel.detailSubscribeds = {};
									viewModel.changeDetailSubscribeByName = function(name, handler) {
										var detailsInfo = info.details;
										Terrasoft.each(detailsInfo, function(detailItem) {
											if (detailItem.name === name) {
												viewModel.detailSubscribeds[detailItem.moduleId] = {
													handler: handler,
													name: name,
													isSubscribed: false
												};
												onDetailChangeSubscribe(detailItem);
											}
										});
									};
									viewModel.openLookup = function(config, handler) {
										LookupUtilities.Open(sandbox, config, handler,
											viewModel, parentContainer || renderTo);
									};
									viewModel.reloadDetail = function(detailName, args) {
										Terrasoft.each(this.entitySchemaInfo.details, function(detailInfo) {
											if (detailInfo.name === detailName) {
												sandbox.publish("ReloadDetail", args, [detailInfo.moduleId]);
											}
										});
									};
									viewModel.getDetailItems = function(detailName) {
										var collection = [];
										Terrasoft.each(this.entitySchemaInfo.details, function(detailInfo) {
											if (detailInfo.name === detailName) {
												var response = sandbox.publish("RequestDetailItems", detailName,
													[detailInfo.moduleId]);
												if (response) {
													collection = response.collection || [];
												}
											}
										});
										return collection;
									};
									viewModel.action = action;
									viewModel.ajaxProvider = Terrasoft.AjaxProvider;

									var detailsInfo = info.details;

									Terrasoft.each(viewModel.columns, function(column) {
										if (column.isCollection === true) {
											viewModel.set(column.name, new Terrasoft.Collection());
										}
									});

									var parentOnSaved = viewModel.onSaved;
									viewModel.onSaved = function(item) {
										if (item && !item.success) {
											if (parentOnSaved) {
												parentOnSaved.apply(viewModel, arguments);
											}
											return;
										}
										if (viewModel.isSilentSave) {
											viewModel.isSilentSave = false;
											viewModel.action = "edit";
											var args = viewModel.silentArgs;
											args.callback(args.tag, args.customAction, args.scope);
											return;
										}
										this.saveDetails();

										if (isProcessMode) {
											ProcessModule.onCardModuleSaved(item);
										}
										var nextPrcElReady = {};
										if (item && item.nextPrcElReady === true) {
											nextPrcElReady = item.nextPrcElReady;
											viewModel.nextPrcElReady = nextPrcElReady;
										}
										if (parentOnSaved) {
											parentOnSaved.apply(viewModel, arguments);
										} else {
											if (nextPrcElReady) {
												return;
											}
											Terrasoft.Router.back();
										}
									};
									viewModel.saveDetails = function() {
										Terrasoft.each(this.entitySchemaInfo.details, function(detailInfo) {
											if (!detailInfo.collapsed) {
												sandbox.publish("SaveDetails", null, [detailInfo.moduleId]);
											}
										});

									};
									viewModel.onDetailCollapsedChanged = function(collapsed, tag) {
										detailProfile = detailProfile || [];
										detailProfile[tag] = {
											collapsed: collapsed
										};
										Terrasoft.utils.saveUserProfile(detailProfileKey, detailProfile, false);
										if (collapsed) {
											return;
										}
										Terrasoft.each(this.entitySchemaInfo.details, function(detailInfo) {
											if (detailInfo.name === tag && detailInfo.collapsed) {
												detailInfo.collapsed = false;
												loadDetail(detailInfo);
											}
										});
									};
									viewModelSchema.isReadOnly = isReadOnly;
									viewModel.isReadOnly = isReadOnly;
									var generatedViewConfig = CardProcessViewGenerator.generate(viewModelSchema, action,
										info, detailProfile, reports.collection.getItems());

									if (viewModelSchema.visibilityBindings &&
										viewModelSchema.visibilityBindings.length) {
										viewModel.visibilityBindings = viewModelSchema.visibilityBindings;
									}
									if (viewModel.modifyViewConfig) {
										viewModel.modifyViewConfig.call(viewModel, generatedViewConfig);
									}
									viewModel.renderTo = renderTo;
									viewConfig = Terrasoft.deepClone(generatedViewConfig);

									view = Ext.create(generatedViewConfig.className || "Terrasoft.Container",
										generatedViewConfig);
									viewRenderTo = renderTo;
									viewModel.modificateBeforeBind();
									if (action === "add" || action === "copy") {
										view.bind(viewModel);
									}
									viewModel.callCanChangeApplicationTuningMode(function(result) {
										if (!instance.isDestroyed) {
											viewModel.set("canDesignPage", result);
										}
									});

									viewModel.getSandbox = function() {
										return sandbox;
									};

									var SysSettingsArray = [];
									Terrasoft.each(info.sysSettings, function(item) {
										SysSettingsArray.push(item.sysSettingName);
									}, this);
									if (SysSettingsArray.length > 0) {
										Terrasoft.SysSettings.querySysSettings(SysSettingsArray, function() {
											if (instance.isDestroyed) {
												return;
											}
											prepareAdditionalValues();
										}, this);
									} else {
										prepareAdditionalValues();
									}
								};
								var sysModuleReportsSelect = ReportUtilities.getReports(viewModel.entitySchema.uId,
									"Card");
								StorageUtilities.GetESQResultByKey({
									esq: sysModuleReportsSelect,
									key: viewModel.name + "Reports",
									callback: reportsSelectedCallback,
									scope: this
								});
							}, this);
						});
					});
				}
			}

			function resumeScroll() {
				var scrollTo = this.scrollTo;
				if (scrollTo && scrollTo > 0) {
					Ext.getBody().dom.scrollTop = scrollTo;
					Ext.getDoc().dom.documentElement.scrollTop = scrollTo;
					scrollTo = 0;
				}
			}

			function createSchemaParents(schemaConfig, callback) {
				var parentSchemaName = schemaConfig.extend;
				parentSchemaNames.push(parentSchemaName);
				if (parentSchemaName === "Terrasoft.model.BaseViewModel") {
					schemaConfig.find = EditPageDesignerHelper.findElementInStructure;
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
				structure.finalizeStructure = child.finalizeStructure;
				return structure;
			}

			function setDetailCollapsed(schemaItem, profile) {
				if (schemaItem.type === Terrasoft.ViewModelSchemaItem.DETAIL) {
					var isCollapsed = true;
					if (profile && profile[schemaItem.name]) {
						isCollapsed = profile[schemaItem.name].collapsed;
					} else if (typeof schemaItem.collapsed === "boolean") {
						isCollapsed = schemaItem.collapsed;
					}
					viewModel.set("detail_collapsed_" + schemaItem.name, isCollapsed);
				}
			}

			function createSchema(schemaConfig, parentSchemaConfig) {
				var schemaName = schemaConfig.name;
				var parentSchema = Terrasoft.deepClone(parentSchemaConfig || schemaConfig);
				var schema = extendStructure(parentSchema, schemaConfig);
				schema.schemaDifferences.call(schema);
				schema.sandbox = sandbox;
				if (isProcessMode && schema.userCodeInProcessMode) {
					schema.userCodeInProcessMode.call(schema);
				} else {
					schema.userCode.call(schema);
				}
				schema.name = schemaName;
				return schema;
			}

			function createViewModelClassBySchema(schema) {
				info = CardUtilities.getInfo(schema);
				updateDetailInfoFromProfile(detailProfile, info);
				var viewModelConfig = CardProcessViewModelGenerator.generate(schema, info, sandbox);
				viewModelConfig.loadLookup = loadLookup;
				Ext.define(viewModelConfig.name, viewModelConfig);
				return viewModelConfig;
			}

			function prepareAdditionalValues() {
				prepareValues = [];
				Terrasoft.each(info.sysSettings, function(item) {
					if (item.isLookup) {
						// TODO: Заменить синхронное получение значения с приватного на публичное.
						prepareValues.push({
							columnName: item.columnName,
							value: Terrasoft.SysSettings.cachedSettings[item.sysSettingName]
						});
					} else {
						additionalValues.push({
							columnName: item.columnName,
							value: Terrasoft.SysSettings.cachedSettings[item.sysSettingName]
						});
					}
				}, this);

				Terrasoft.each(valuePairs, function(item) {
					var columnName = item.name;
					var value = item.value;
					var column = viewModel.findEntityColumn(columnName);
					if (!Ext.isEmpty(column) && column.isLookup) {
						prepareValues.push({
							columnName: columnName,
							value: value
						});
					} else if (!Ext.isEmpty(column) && column.dataValueType === Terrasoft.DataValueType.BOOLEAN) {
						additionalValues.push({
							columnName: columnName,
							value: !!(value === true || value === "true" || value === "1")
						});
					} else {
						additionalValues.push({
							columnName: columnName,
							value: value
						});
					}
				}, this);

				if (prepareValues.length > 0) {
					var bq = Ext.create("Terrasoft.BatchQuery");
					Terrasoft.each(prepareValues, function(item) {
						bq.add(getPrepareValuesQuery(item));
					}, this);
					bq.execute(onLoadAdditionalValues, this);
				} else {
					prepareEntity();
				}
			}

			function onLoadAdditionalValues(result) {
				if (view.destroyed === true) {
					return;
				}
				if (result.success) {
					for (var i = 0; i < result.queryResults.length; i++) {
						var qresult = result.queryResults[i];
						if (!Ext.isEmpty(qresult)) {
							var rows = qresult.rows;
							if (!Ext.isEmpty(rows) && !Ext.isEmpty(rows[0])) {
								additionalValues.push({
									columnName: prepareValues[i].columnName,
									value: rows[0]
								});
							}
						}
					}
				}
				prepareEntity();
			}

			function getPrepareValuesQuery(prepareValue) {
				//var column = this.viewModel.getSafeEntityColumn(prepareValue.columnName);
				var column = viewModel.findEntityColumn(prepareValue.columnName);
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: column.referenceSchemaName
				});
				esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "value");
				esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "displayValue");
				Terrasoft.each(info.columns[column.name], function(additionalColumnName) {
					if (!esq.columns.contains(additionalColumnName)) {
						esq.addColumn(additionalColumnName);
					}
				}, this);

				// TODO: Заменить на публичный метод фильтра по PrimaryValue
				if (prepareValue.value.UId) {
					esq.enablePrimaryColumnFilter(prepareValue.value.UId);
				} else {
					esq.enablePrimaryColumnFilter(prepareValue.value);
				}

				return esq;
			}

			function getFilterColumnValue(filterValuePath) {
				var filterValue = viewModel.get(filterValuePath);
				return filterValue && (filterValue.value || filterValue);
			}

			function prepareEntity() {
				if (action === "edit" || action === "view") {
					viewModel.loadEntity(recordId, function() {
						if (view.destroyed === true) {
							return;
						}
						onLoadEntity(viewRenderTo);
						bindDependencies(viewModel, info.dependencies);
						Terrasoft.each(additionalValues, function(item) {
							if (Ext.isEmpty(viewModel.get(item.columnName))) {
								viewModel.set(item.columnName, item.value);
							}
						}, this);
						prepareProcessDataParameters();
						viewModel.init.call(viewModel);
						loadProcessModules();
						loadCommandLine();
						loadContextHelp(contextHelpId);
						requiredLabelReset(viewModel);

					}, this);
				} else if (action === "copy") {
					viewModel.copyEntity(recordId, function() {
						if (view.destroyed === true) {
							return;
						}
						viewModel.set("originalId", recordId);
						bindDependencies(viewModel, info.dependencies);
						Terrasoft.each(additionalValues, function(item) {
							viewModel.set(item.columnName, item.value);
						}, this);
						performanceCounterManager.setTimeStamp("render");
						view.render(viewRenderTo);
						MaskHelper.HideBodyMask();
						performanceCounterManager.setTimeStamp("renderComplete");
						loadDetails();
						loadProcessModules();
						loadCommandLine();
						loadContextHelp(contextHelpId);
						prepareProcessDataParameters();
						viewModel.init.call(viewModel);
						requiredLabelReset(viewModel);

					}, this);
				} else {
					viewModel.setDefaultValues();
					if (defaultValues) {
						Terrasoft.each(viewModel.columns, function(column) {
							if (defaultValues[column.name]) {
								viewModel.set(column.name, defaultValues[column.name]);
							}
						});
					}
					bindDependencies(viewModel, info.dependencies);
					Terrasoft.each(additionalValues, function(item) {
						viewModel.set(item.columnName, item.value);
					}, this);
					performanceCounterManager.setTimeStamp("render");
					view.render(viewRenderTo);
					MaskHelper.HideBodyMask();
					performanceCounterManager.setTimeStamp("renderComplete");
					loadDetails();
					loadProcessModules();
					loadCommandLine();
					loadContextHelp(contextHelpId);
					prepareProcessDataParameters();
					viewModel.init.call(viewModel);
					requiredLabelReset(viewModel);
				}

			}

			function prepareProcessDataParameters() {
				if (processData && processData.parameters && viewModel && viewModel.columns) {
					Terrasoft.each(processData.parameters, function(value, name) {
						var parameterValue = Terrasoft.deepClone(value);
						var column = this.columns[name];
						if (column) {
							value = ProcessHelper.getClientValueByDataValueType(parameterValue, column.dataValueType);
							this.set(name, value);
						}
					}, viewModel);
				}
			}

			function requiredLabelReset(viewModel) {
				Terrasoft.each(viewModel.columns, function(column, name) {
					if (column.isRequired) {
						var labelControl = Ext.get(name + "ControlLabel");
						if (!Ext.isEmpty(labelControl)) {
							labelControl.addCls("required-caption");
						}
					}
				}, this);
			}

			function loadProcessModules() {
				LoadProcessModules.loadProcessModules(sandbox, isProcessMode);
			}

			function onLoadEntity(viewRenderTo) {
				var loadCardViewCallback = function() {
					view.bind(viewModel);
					performanceCounterManager.setTimeStamp("render");
					view.render(viewRenderTo);
					MaskHelper.HideBodyMask();
					performanceCounterManager.setTimeStamp("renderComplete");
					loadDetails();
					ProcessHelper.prepareCard(viewModel);
				};
				if (isProcessMode && viewModelSchema && viewModelSchema.customizeView) {
					viewModelSchema.customizeView(viewModel, loadCardViewCallback);
				} else {
					loadCardViewCallback();
				}
			}

			function bindDependencies(viewModel, infoDependencies) {
				Terrasoft.each(infoDependencies, function(dependency) {
					var changelist = "";
					Terrasoft.each(dependency.dependencies, function(item) {
						changelist += "change:" + item + " ";
					}, this);
					viewModel.on(changelist, function() {
						viewModel[dependency.methodName](dependency.argument);
					});
				}, this);
			}

			function loadLookup(name, value) {
				var column = this.findEntityColumn(name);
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: column.referenceSchemaName
				});
				esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "value");
				esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "displayValue");
				Terrasoft.each(this.entitySchemaInfo.columns[name], function(additionalColumnName) {
					if (!esq.columns.contains(additionalColumnName)) {
						esq.addColumn(additionalColumnName);
					}
				}, this);
				esq.getEntity(value, function(result) {
					var entity = result.entity;
					if (entity) {
						this.set(name, entity.values);
					}
				}, this);

			}

			function loadDetails() {
				var detailsInfo = info.details;
				performanceCounterManager.setTimeStamp("loadAdditionalModules");
				Terrasoft.each(detailsInfo, function(detailItem) {
					if (!detailItem.collapsed) {
						loadDetail(detailItem);
					}
				});
			}

			function onDetailChangeSubscribe(detailItem) {
				var subscribe = viewModel.detailSubscribeds[detailItem.moduleId];
				var moduleId = detailItem.moduleId;
				if (!Ext.isEmpty(subscribe) && !Ext.isEmpty(moduleId) && Ext.isFunction(subscribe.handler)) {
					sandbox.subscribe("DetailChanged", function(args) {
						var detailModuleId = args[0];
						args = Terrasoft.deepClone(args);
						args.splice(0, 1);
						subscribe = viewModel.detailSubscribeds[detailModuleId];
						if (subscribe && subscribe.handler) {
							subscribe.handler.apply(viewModel, args);
						}
					});
					subscribe.isSubscribed = true;
				}
			}

			function loadDetail(detailItem) {
				if (instance.isDestroyed) {
					return;
				}
				var entitySchemaName = detailItem.entitySchemaName;
				var detailItemName = detailItem.name;
				var detailInstanceId = detailItem.moduleId = sandbox.id +
					"_detail_" + detailItem.name;
				var detailContainer = Ext.get("datail-" + detailItemName);
				onDetailChangeSubscribe(detailItem);
				if (!Ext.isEmpty(entitySchemaName)) {
					sandbox.requireModuleDescriptors(["force!" + entitySchemaName], function() {
						require([entitySchemaName], function() {
							sandbox.loadModule("DetailModule", {
								renderTo: detailContainer,
								id: detailInstanceId
							});
						});
					}, this);
				} else {
					sandbox.loadModule("DetailModule", {
						renderTo: detailContainer,
						id: detailInstanceId
					});
				}
			}

			function updateDetailInfoFromProfile(profile, info) {
				info.details.forEach(function(detail) {
					var detailProfile = profile[detail.name];
					if (detailProfile) {
						detail.collapsed = detailProfile.collapsed;
					}
				});
			}

			function loadCommandLine() {
				if (instance.isDestroyed) {
					return;
				}
				var commandLineContainer = Ext.get("card-command-line-container");
				sandbox.loadModule("CommandLineModule", {
					renderTo: commandLineContainer
				});
			}

			function loadContextHelp(id) {
				if (instance.isDestroyed) {
					return;
				}
				if (id) {
					sandbox.subscribe("GetContextHelpId", function() {
						return id;
					}, [id]);
					var contextHelpContainer = Ext.get("card-context-help-container");
					sandbox.loadModule("ContextHelpModule", {
						renderTo: contextHelpContainer,
						id: id
					});
				}
			}

			function init() {
				parentContainer = sandbox.publish("GetParentContainer");
				if (parentContainer) {
					return;
				}
				var state = sandbox.publish("GetHistoryState");
				var currentHash = state.hash;
				var currentState = state.state || {};
				if (currentState.moduleId === sandbox.id) {
					return;
				}
				var newState = Terrasoft.deepClone(currentState);
				newState.moduleId = sandbox.id;
				sandbox.publish("ReplaceHistoryState", {
					stateObj: newState,
					pageTitle: null,
					hash: currentHash.historyState,
					silent: true
				});
			}

			return Ext.define("CardProcessModule", {
				init: init,
				render: function(renderTo) {
					loadCardView(renderTo, this);
				},
				destroy: function(config) {
					if (config.keepAlive !== true) {
						var parentSchemaName = parentSchemaNames.pop();
						while (parentSchemaName) {
							requirejs.undef(parentSchemaName);
							parentSchemaName = parentSchemaNames.pop();
						}
						requirejs.undef(savedSchemaName);
					}
					this.callParent(arguments);
				}
			});
		}

		return createConstructor;
	});