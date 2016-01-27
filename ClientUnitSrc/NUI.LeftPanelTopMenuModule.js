define("LeftPanelTopMenuModule", ["LeftPanelTopMenuModuleResources", "MaskHelper",
	"LookupUtilities", "ConfigurationConstants", "ProcessModuleUtilities", "LeftPanelUtilitiesV2"],
		function(resources, MaskHelper, LookupUtilities, ConfigurationConstants,
				ProcessModuleUtilities, LeftPanelUtilities) {
			function createConstructor(context) {
				var container;
				var Ext = context.Ext;
				var sandbox = context.sandbox;
				var Terrasoft = context.Terrasoft;

				function callServiceMethod(ajaxProvider, requestUrl, callback, dataSend) {
					var provider = ajaxProvider;
					var data = dataSend || {};
					provider.request({
						url: requestUrl,
						headers: {
							"Accept": "application/json",
							"Content-Type": "application/json"
						},
						method: "POST",
						jsonData: data,
						callback: function(request, success, response) {
							var responseObject = {};
							if (success) {
								responseObject = Terrasoft.decode(response.responseText);
							}
							callback.call(this, responseObject);
						},
						scope: this
					});
				}

				var getViewModel = function() {
					var viewModel =  Ext.create("Terrasoft.BaseViewModel", {
						values: {
							collapsed: false,
							quickAddMenu: Ext.create("Terrasoft.BaseViewModelCollection"),
							startProcessMenu: Ext.create("Terrasoft.BaseViewModelCollection"),
							MainMenuItems: Ext.create("Terrasoft.BaseViewModelCollection"),
							IsSystemDesignerVisible: true,
							IsSSP: (Terrasoft.CurrentUser.userType === Terrasoft.UserType.SSP)
						},
						methods: {
							/**
							 * Инициализирует начальные значения модели.
							 * @protected
							 * @overridden
							 */
							init: function(callback, scope) {
								this.loadMenu();
								this.setSystemDesignerVisible();
								LeftPanelUtilities.on("collapsedChanged", this.onSideBarCollapsedChanged, this);
								callback.call(scope);
							},

							/**
							 * Устанавливает, исходя из конфигурации, свойство панели отвечающее за отображение кнопки "Дизайнер системы".
							 * Отвечает за отображение и скрытие кнопки "Дизайнер системы" на панели.
							 * @private
							 * @param {Object} config Конфигурация настроек верхней панели
							 */
							setSystemDesignerVisible: function() {
								var isSystemDesignerVisible = !this.get("IsSSP");
								Terrasoft.SysSettings.querySysSettings(["BuildType"], function(sysSettings) {
									var buildType = sysSettings.BuildType;
									if (buildType && (buildType.value === ConfigurationConstants.BuildType.Public)) {
										isSystemDesignerVisible = false;
									}
									this.set("IsSystemDesignerVisible", isSystemDesignerVisible);
								}, this);
							},

							/**
							 * Возвращает конфигурацию пункта главного меню.
							 * @private
							 * @param {Object} entity Запись из справочника пунктов главного меню.
							 * @return {Object} Конфигурация пункта главного меню.
							 **/
							getConfigMenuItem: function(entity) {
								var uId = entity.get("IntroPageUId");
								var name = entity.get("Name");
								var tag = entity.get("Tag");
								return {
									Id: uId,
									Caption: name,
									Tag: tag,
									Class: "menu-item",
									Click: {bindTo: "goToIntroPageFromMenu"}
								};
							},

							/**
							 * Заполняет коллекцию пунктов главного меню.
							 * @protected
							 */
							loadItemsMainMenu: function() {
								var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
									rootSchemaName: "ApplicationMainMenu",
									isDistinct: true
								});
								esq.addColumn("Id");
								esq.addColumn("IntroPageUId");
								esq.addColumn("Name");
								esq.addColumn("[SysSchema:UId:IntroPageUId].Name", "Tag");
								esq.getEntityCollection(function(result) {
									if (!result.success) {
										return;
									}
									var menuCollection = Ext.create("Terrasoft.BaseViewModelCollection");
									var entities = result.collection;
									var mainMenuConfig = {
										Id: "menu-menu-item",
										Tag: "MainMenu",
										Caption: resources.localizableStrings.mainManuMenuItemCaption,
										Visible: {
											bindTo: "IsSSP",
											bindConfig: {
												converter: function(value) {
													return !value;
												}
											}
										}
									};
									var entitiesCount = entities.getCount();
									if (entitiesCount === 0) {
										mainMenuConfig.Class = "menu-item";
										mainMenuConfig.Click = {bindTo: "goToFromMenu"};
										menuCollection.add(mainMenuConfig.Id, Ext.create("Terrasoft.BaseViewModel", {
											values: mainMenuConfig
										}));
									} else if (entitiesCount === 1) {
										entities.each(function(entity) {
											var menuItem = this.getConfigMenuItem(entity);
											menuItem.Caption = mainMenuConfig.Caption;
											menuCollection.add(menuItem.Id, Ext.create("Terrasoft.BaseViewModel", {
												values: menuItem
											}));
										}, this);
									} else {
										mainMenuConfig.Type = "Terrasoft.MenuSeparator";
										menuCollection.add(mainMenuConfig.Id, Ext.create("Terrasoft.BaseViewModel", {
											values: mainMenuConfig
										}));
										entities.each(function(entity) {
											var menuItem = this.getConfigMenuItem(entity);
											menuCollection.add(menuItem.Id, Ext.create("Terrasoft.BaseViewModel", {
												values: menuItem
											}));
										}, this);
										var id = "end-menu-menu-item";
										menuCollection.add(id, Ext.create("Terrasoft.BaseViewModel", {
											values: {
												Id: id,
												Type: "Terrasoft.MenuSeparator"
											}
										}));
									}
									var mainMenuItems = this.get("MainMenuItems");
									menuCollection.loadAll(mainMenuItems);
									mainMenuItems.clear();
									mainMenuItems.loadAll(menuCollection);
								}, this);
							},

							loadItemsQuickAddMenu: function() {
								var collection = this.get("quickAddMenu");
								collection.clear();
								var quickItems = Terrasoft.configuration.QuickAddMenu.QuickAddMenu;
								Terrasoft.each(quickItems, function(item) {
									var id = item.itemId;
									collection.add(id, Ext.create("Terrasoft.BaseViewModel", {
										values: {
											Id: id,
											Caption: item.name,
											Click: {bindTo: "processQuickMenuClick"},
											ModuleName: item.ModuleName,
											Tag: id,
											TypeColumnName: item.TypeColumnName,
											TypeColumnValue: item.TypeColumnValue,
											EditPageName: item.EditPageName
										}
									}));
								}, this);
							},

							processQuickMenuClick: function(tag) {
								var collection = this.get("quickAddMenu");
								var quickMenuItem = collection.get(tag);
								var moduleName = quickMenuItem.get("ModuleName") || "SysModuleEditManageModule";
								require([moduleName], function(module) {
									if (module) {
										module.Run({
											sandbox: sandbox,
											item: quickMenuItem
										});
									}
								});
							},

							/**
							 * Заполняет коллекцию пунктов меню глобальной кнопки запуска бизнес-процессов
							 */
							loadItemsStartProcessMenu: function() {
								var filters = [];
								filters.push(
										Terrasoft.createExistsFilter("[RunButtonProcessList:SysSchemaUId:UId].Id"));
								var select = ProcessModuleUtilities.createRunProcessSelect(filters);
								select.getEntityCollection(function(result) {
									if (result.success) {
										var startProcessMenuItems = this.get("startProcessMenu");
										startProcessMenuItems.clear();
										var entities = result.collection;
										var existsAnyAvailableToRunProcess = entities.getCount() > 0;
										if (!existsAnyAvailableToRunProcess) {
											return;
										}
										var id = "caption-runprocess-menu-item";
										startProcessMenuItems.add(id, Ext.create("Terrasoft.BaseViewModel", {
											values: {
												Id: id,
												Type: "Terrasoft.MenuSeparator",
												Caption: resources.localizableStrings.RunProcessButtonMenuCaption
											}
										}));
										var idColumnName = "Id";
										var captionColumnName = "Caption";
										entities.each(function(entity) {
											id = entity.get(idColumnName);
											var caption = entity.get(captionColumnName);
											startProcessMenuItems.add(id, Ext.create("Terrasoft.BaseViewModel", {
												values: {
													Id: id,
													Caption: caption,
													Click: {bindTo: "runProcess"},
													Tag: id,
													MarkerValue: caption
												}
											}));
										}, this);
										id = "separator-runprocess-menu-item";
										startProcessMenuItems.add(id, Ext.create("Terrasoft.BaseViewModel", {
											values: {
												Id: id,
												Type: "Terrasoft.MenuSeparator",
												Caption: resources.localizableStrings.mainManuMenuItemCaption
											}
										}));
										id = "open-process-page";
										startProcessMenuItems.add(id, Ext.create("Terrasoft.BaseViewModel", {
											values: {
												Id: id,
												Caption: resources.localizableStrings.AnotherProcessMenuItemCaption,
												Click: {bindTo: "openProcessPage"},
												Tag: id
											}
										}));
									} else {
										throw new Terrasoft.QueryExecutionException();
									}
								}, this);
							},

							/**
							 * Возвращает конфигурацию отображения элементов.
							 * @return {Object}
							 */
							getViewConfig: function() {
								var view = {
									id: "side-bar-top-menu-module-container",
									selectors: {
										wrapEl: "#side-bar-top-menu-module-container"
									},
									classes: {
										wrapClassName: ["top-menu-module-container"]
									},
									items: this.getTopMenuConfig()
								};
								return view;
							},

							/**
							 * Возвращает объект меню.
							 * @return {Object}
							 */
							loadMenu: function() {
								this.loadItemsStartProcessMenu();
								sandbox.subscribe("ResetStartProcessMenuItems", function() {
									this.loadItemsStartProcessMenu();
								}, this);
								this.loadItemsQuickAddMenu();
								var menuCollection = Ext.create("Terrasoft.BaseViewModelCollection");
								var id = "process-menu-item";
								menuCollection.add(id, Ext.create("Terrasoft.BaseViewModel", {
									values: {
										Id: id,
										Tag: "ProcessExecute",
										Caption: resources.localizableStrings.processMenuItemCaption,
										Click: {bindTo: "openProcessPage"},
										Visible: {
											bindTo: "IsSSP",
											bindConfig: {
												converter: function(value) {
													return !value;
												}
											}
										}
									}
								}));
								id = "collapse-menu-item";
								menuCollection.add(id, Ext.create("Terrasoft.BaseViewModel", {
									values: {
										Id: id,
										Tag: "CollapseMenu",
										Caption: this.getCollapseSideBarMenuItemCaptionConfig(),
										Click: {bindTo: "collapseSideBar"}
									}
								}));
								var workplaceMenu = this.getWorkplaceMenu();
								if (workplaceMenu.getCount() > 0) {
									menuCollection.loadAll(workplaceMenu);
								}
								id = "system-designer-menu-item";
								menuCollection.add(id, Ext.create("Terrasoft.BaseViewModel", {
									values: {
										Id: id,
										Tag: "IntroPage/SystemDesigner",
										Caption: resources.localizableStrings.systemDesignerMenuItemCaption,
										Click: {bindTo: "goToFromMenu"},
										Visible: {bindTo: "IsSystemDesignerVisible"}
									}
								}));
								id = "profile-menu-item";
								menuCollection.add(id, Ext.create("Terrasoft.BaseViewModel", {
									values: {
										Id: id,
										Tag: "ProfileModule",
										Caption: resources.localizableStrings.userProfileMenuItemCaption,
										Click: {bindTo: "goToFromMenu"}
									}
								}));
								id = "exit-menu-item";
								menuCollection.add(id, Ext.create("Terrasoft.BaseViewModel", {
									values: {
										Id: id,
										Tag: "Exit",
										ClassName: "Terrasoft.MenuItem",
										Caption: resources.localizableStrings.exitMenuItemCaption,
										Click: {bindTo: "exitClick"}
									}
								}));
								var mainMenuItems = this.get("MainMenuItems");
								mainMenuItems.loadAll(menuCollection);
								this.loadItemsMainMenu();
							},

							/**
							 * Возвращает объект меню для рабочих мест.
							 * @return {Object}
							 */
							getWorkplaceMenu: function() {
								var workplaceMenuItems = Ext.create("Terrasoft.BaseViewModelCollection");
								var workplaces = Terrasoft.deepClone(Terrasoft.configuration.WorkplacesStructure.Workplaces);
								if (workplaces.length > 0) {
									var id = "separator-top-menu-item";
									workplaceMenuItems.add(id, Ext.create("Terrasoft.BaseViewModel", {
										values: {
											Id: id,
											Type: "Terrasoft.MenuSeparator",
											Caption: resources.localizableStrings.workPlaceMenuItemCaption
										}
									}));
									workplaces.sort(function(a, b) {
										if (a.name < b.name) {
											return -1;
										}
										if (a.name > b.name) {
											return 1;
										}
										return 0;
									});
									Terrasoft.each(workplaces, function(item) {
										if (item.hide) {
											return;
										}
										var menuItemConfig = {
											Caption: item.name,
											Tag: item.workplaceId,
											Click: {
												bindTo: "workPlaceMenuItemClick"
											}
										};
										workplaceMenuItems.add(Ext.create("Terrasoft.BaseViewModel", {
											values: menuItemConfig
										}));
									}, this);
									id = "separator-botom-menu-item";
									workplaceMenuItems.add(id, Ext.create("Terrasoft.BaseViewModel", {
										values: {
											Id: id,
											Type: "Terrasoft.MenuSeparator"
										}
									}));
								}
								return workplaceMenuItems;
							},

							/**
							 * Возвращает конфигурацию верхнего меню.
							 * @return {Object}
							 */
							getTopMenuConfig: function() {
								var menuConfig = [
									{
										id: "collapse-button",
										tag: "CollapseMenu",
										className: "Terrasoft.Button",
										style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
										classes: {
											imageClass: ["button-image-size"],
											wrapperClass: ["collapse-button-wrapperEl"]
										},
										imageConfig: resources.localizableImages.collapseIcon,
										click: {
											bindTo: "collapseSideBar"
										},
										hint: this.getCollapseSideBarMenuItemCaptionConfig()
									},
									{
										id: "menu-button",
										tag: "MainMenu",
										className: "Terrasoft.Button",
										style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
										hint: resources.localizableStrings.MenuButtonHint,
										classes: {
											imageClass: ["button-image-size"],
											wrapperClass: ["menu-button-wrapperEl"]
										},
										imageConfig: resources.localizableImages.menuIcon,
										menu: {
											items: {bindTo: "MainMenuItems"}
										}
									},
									{
										id: "menu-startprocess-button",
										tag: "StartProcessMenu",
										className: "Terrasoft.Button",
										style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
										hint: resources.localizableStrings.StartProcessButtonHint,
										classes: {
											imageClass: ["button-image-size"],
											wrapperClass: ["menu-startprocess-button-wrapperEl"]
										},
										imageConfig: resources.localizableImages.processIcon,
										menu: {
											items: {bindTo: "startProcessMenu"}
										},
										click: {
											bindTo: "openProcessPage"
										},
										visible: {
											bindTo: "IsSSP",
											bindConfig: {
												converter: function(value) {
													return !value;
												}
											}
										}
									},
									{
										id: "menu-quickadd-button",
										tag: "quickAddMenu",
										className: "Terrasoft.Button",
										style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
										classes: {
											imageClass: ["button-image-size"],
											wrapperClass: ["menu-quickadd-button-wrapperEl"]
										},
										hint: resources.localizableStrings.AddButtonHint,
										imageConfig: resources.localizableImages.quickaddIcon,
										menu: {
											items: {bindTo: "quickAddMenu"}
										},
										visible: {
											bindTo: "IsSSP",
											bindConfig: {
												converter: function(value) {
													return !value;
												}
											}
										}
									}
								];
								return menuConfig;
							},

							/**
							 * Возвращает конфигурацию для элемента переключения свёрнутости левой панели.
							 * @return {Object}
							 */
							getCollapseSideBarMenuItemCaptionConfig: function() {
								return {
									bindTo: "Collapsed",
									bindConfig: {
										converter: this.getCollapseSideBarMenuItemCaption
									}
								};
							},

							/**
							 * Запускает бизнес-процесс из списка глобальной кнопки запуска процессов
							 * @param {Object} tag UId схемы бизнес-процесса
							 */
							runProcess: function(tag) {
								ProcessModuleUtilities.executeProcess({
									sysProcessId: tag
								});
							},
							goTo: function() {
								var tag = arguments[3];
								var currentModule = sandbox.publish("GetHistoryState").hash.historyState;
								if (currentModule !== tag) {
									MaskHelper.ShowBodyMask();
									sandbox.publish("PushHistoryState", {hash: tag});
								}
							},
							exitClick: function() {
								var ajaxProvider = Terrasoft.AjaxProvider;
								var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/MainMenuService/Logout";
								callServiceMethod(ajaxProvider, requestUrl, function() {
									window.logout = true;
									window.location.replace(Terrasoft.loaderBaseUrl + "/simpleLogin");
								}, {});
							},
							goToFromMenu: function(tag) {
								var currentHistoryState = sandbox.publish("GetHistoryState").hash.historyState;
								if (currentHistoryState !== tag) {
									if (tag !== "ProfileModule") {
										MaskHelper.ShowBodyMask();
									}
									sandbox.publish("PushHistoryState", {hash: tag});
								}
							},
							goToIntroPageFromMenu: function(tag) {
								var currentHistoryState = sandbox.publish("GetHistoryState").hash.historyState;
								if (currentHistoryState !== tag) {
									//MaskHelper.ShowBodyMask();
									var hash = "IntroPage/" + tag;
									sandbox.publish("PushHistoryState", {hash: hash});
								}
							},
							openProcessPage: function() {
								var vwSysProcessFilters = Terrasoft.createFilterGroup();
								vwSysProcessFilters.name = "vwSysProcessFiler";
								vwSysProcessFilters.logicalComparisonTypes = Terrasoft.LogicalOperatorType.AND;
								var sysWorkspaceFilter = Terrasoft.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.EQUAL, "SysWorkspace",
										Terrasoft.SysValue.CURRENT_WORKSPACE.value);
								vwSysProcessFilters.addItem(sysWorkspaceFilter);
								var businessProcessTagFilter = Terrasoft.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.EQUAL, "TagProperty",
										ConfigurationConstants.SysProcess.BusinessProcessTag);
								vwSysProcessFilters.addItem(businessProcessTagFilter);
								var isMaxVersionFilter = Terrasoft.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.EQUAL, "IsMaxVersion", true);
								vwSysProcessFilters.addItem(isMaxVersionFilter);
								var config = {
									entitySchemaName: "VwSysProcess",
									isRunProcessPage: true,
									captionLookup: resources.localizableStrings.processLookupCaption,
									multiSelect: false,
									columnName: "Caption",
									filters: vwSysProcessFilters,
									hideActions: true
								};
								var handler = function(args) {
									var activeItems = args.selectedRows.getItems();
									if (!Ext.isEmpty(activeItems)) {
										ProcessModuleUtilities.executeProcess({
											sysProcessId: activeItems[0].Id
										});
									}
								};
								LookupUtilities.Open(sandbox, config, handler, this, null, false, false);
							},
							collapseSideBar: function() {
								LeftPanelUtilities.changeCollapsed();
							},
							showESN: function() {
								var esnHash = "SectionModuleV2/ESNFeedSectionV2/";
								var currentModule = sandbox.publish("GetHistoryState").hash.historyState;
								if (currentModule !== esnHash) {
									MaskHelper.ShowBodyMask();
									sandbox.publish("PushHistoryState", {hash: esnHash});
								}
							},
							/**
							 * Возвращает текст для элемента переключения свёрнутости левой панели.
							 * @param {Boolean} isCollapsed Признак свёрнутости.
							 * @return {String} Текст для элемента переключения свёрнутости левой панели.
							 */
							getCollapseSideBarMenuItemCaption: function(isCollapsed) {
								if (Ext.isEmpty(isCollapsed)) {
									isCollapsed = LeftPanelUtilities.getDefaultCollapsed();
								}
								if (isCollapsed) {
									return resources.localizableStrings.expandSideBarMenuItemCaption;
								} else {
									return resources.localizableStrings.collapseSideBarMenuItemCaption;
								}
							},
							workPlaceMenuItemClick: function(tag) {
								var workplaceItem = this.getWorkplaceData(tag);
								if (workplaceItem) {
									sandbox.publish("ChangeCurrentWorkplace", tag);
								}
							},
							getWorkplaceData: function(workplaceId) {
								var workplaces = Terrasoft.configuration.WorkplacesStructure.Workplaces;
								var workplaceItem = null;
								if (workplaces.length > 0) {
									Terrasoft.each(workplaces, function(item) {
										if (item.workplaceId === workplaceId) {
											workplaceItem = item;
										}
									}, this);
								}
								return workplaceItem;
							},
							/**
							 * Обработчик события изменения свёрнутости левой панели.
							 * @param {Boolean} isCollapsed Признак свёрнутости.
							 */
							onSideBarCollapsedChanged: function(isCollapsed) {
								sandbox.publish("ChangeSideBarCollapsed", isCollapsed);
								this.set("Collapsed", isCollapsed);
							}
						}
					});
					return viewModel;
				};

				var generate = function() {
					var viewModel = this.viewModel;
					var view = this.view;
					if (!Ext.isEmpty(viewModel) && !Ext.isEmpty(view)) {
						view.destroy();
					}
					var viewConfig = viewModel.getViewConfig();
					view = Ext.create("Terrasoft.Container", Terrasoft.deepClone(viewConfig));
					view.bind(viewModel);
					view.render(container);
					MaskHelper.HideBodyMask();
				};

				function render(renderTo) {
					container = renderTo;
					generate.call(this);
				}

				function init(callback, scope) {
					var viewModel = this.viewModel = getViewModel();
					callback = callback || Ext.emptyFn;
					scope = scope || this;
					viewModel.init(function() {
						callback.call(scope);
					}, this);
				}

				return Ext.define("Terrasoft.configuration.LeftPanelTopMenuModule", {
					extend: "Terrasoft.BaseModule",
					render: render,
					init: init,
					isAsync: false,
					viewModel: null,
					generate: generate
				});
			}

			return createConstructor;
		});
		