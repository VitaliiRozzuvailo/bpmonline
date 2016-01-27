define("ViewModule", ["ext-base", "terrasoft", "sandbox", "ViewModuleResources", "performancecountermanager",
		"LookupUtilities", "ViewModuleHelper", "ConfigurationConstants", "LeftPanelUtilitiesV2", "ModalBox",
		"ConfigurationBootstrap", "css!CommonCSSV2", "RemindingsUtilities", "ConfigurationEnums",
		"WelcomeScreenModule"],
	function(Ext, Terrasoft, sandbox, resources, performanceCounterManager, LookupUtilities,
		ViewModuleHelper, ConfigurationConstants, LeftPanelUtilities, ModalBox) {
		var centerPanel;
		var mainCenterPanel;
		var pages;
		var currentHash = {
			historyState: ""
		};

		/**
		 * Создает кнопку "Заказать презентацию".
		 * @param {Object} culture Культура текущего пользователя.
		 * @returns {Object} Возвращает элемент управления кнопки.
		 */
		var createBuyNowBtn = function(culture) {
			var buyNowBtn = {
				id: "buy-now-btn",
				cls: "buy-now-btn",
				iconPath:
					Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages["BuyNow" + culture.split("-")[1]])
			};
			buyNowBtn.click = function() {
				window.open(resources.localizableStrings.BuyNowUrl);
			};

			/**
			 * Корректирует позиции при изменении размера окна.
			 */
			buyNowBtn.correctPos = function() {
				var presentationBtn = Ext.getElementById("buy-now-btn");
				var chatBtn = Ext.getElementById("online-help-btn");
				var separatorSize = 5;
				var presentationButtonLeft =
					(window.innerWidth - chatBtn.offsetWidth - presentationBtn.offsetWidth - separatorSize) / 2;
				var chatBtnLeft = presentationButtonLeft + presentationBtn.offsetWidth + separatorSize;
				presentationBtn.style.left = presentationButtonLeft + "px";
				chatBtn.style.left = chatBtnLeft + "px";
			};
			var el = Ext.DomHelper.append(Ext.getBody(), {
				id: buyNowBtn.id,
				cls: buyNowBtn.cls,
				cn: [{
					id: "buy-now-btn-img",
					cls: "buy-now-btn-img-" + culture.split("-")[0],
					style: "background-image:url(" + buyNowBtn.iconPath + ");"
				}]
			});
			buyNowBtn.el = Ext.fly(el);
			buyNowBtn.el.on("click", buyNowBtn.click);
			Ext.EventManager.addListener(window, "resize", buyNowBtn.correctPos);
			return buyNowBtn;
		};

		/**
		 * Создает кнопку "On-line чат".
		 * @param {Object} culture Культура текущего пользователя.
		 * @returns {Object} Возвращает элемент управления кнопки.
		 */
		var createOnlineHelpBtn = function(culture) {
			var klBIZ;
			var onlineHelpBtn = {
				id: "online-help-btn",
				cls: "online-help-btn",
				iconPath:
					Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages["OnlineHelp" + culture.split("-")[1]])
			};
			onlineHelpBtn.click = function() {
				if (!klBIZ) {
					klBIZ = {};
				}
				klBIZ.time = 60 * 1000;
				klBIZ.url = window.location.href;
				if (document.title) {
					klBIZ.pageTitle = encodeURI(document.title.substring(0, 255));
				}
				klBIZ.setParam = "&ttl=" + klBIZ.pageTitle;
				klBIZ.referrer = encodeURI(document.referrer);
				klBIZ.setReloadIMG = false;
				klBIZ.setParam += "&url=" + encodeURI(klBIZ.url) + "&referrer=" + encodeURI(klBIZ.referrer);
				klBIZ.setParam += "&cd=" + window.screen.colorDepth + "&rh=" + screen.height + "&rw=" + screen.width;
				klBIZ.protocol = (("https:" === document.location.protocol) ? "https://" : "http://");
				klBIZ.srcMain = resources.localizableStrings.OnlineHelpUrl;
				klBIZ.srcOpen = klBIZ.protocol + "ok.kolobiz.com/client/?" + klBIZ.srcMain + klBIZ.setParam;
				if (navigator.userAgent.toLowerCase().indexOf("opera") !== -1 && window.event.preventDefault) {
					window.event.preventDefault();
				}
				this.newWindow = window.open(klBIZ.srcOpen, "ok_kolobiz20122359",
					"toolbar=0,scrollbars=0,location=0,status=1,menubar=0,width=620,height=490,resizable=1");
				this.newWindow.focus();
				this.newWindow.opener = window;
			};
			var el = Ext.DomHelper.append(Ext.getBody(), {
				id: onlineHelpBtn.id,
				cls: onlineHelpBtn.cls,
				cn: [{
					cls: "online-help-btn-img-" + culture.split("-")[0],
					style: "background-image:url(" + onlineHelpBtn.iconPath + ");"
				}]
			});
			onlineHelpBtn.el = Ext.fly(el);
			onlineHelpBtn.el.on("click", onlineHelpBtn.click);
		};

		function onLoadModule(config) {
			var renderTo = config.renderTo;
			var moduleId = config.moduleId;
			var moduleName = config.moduleName;
			if (Ext.isEmpty(renderTo)) {
				return;
			}
			sandbox.loadModule(moduleName, {
				renderTo: renderTo,
				id: moduleId,
				keepAlive: config.keepAlive || false
			});
		}

		function getDefModule(itemsConfig) {
			var defModule;
			Terrasoft.each(itemsConfig, function(item) {
				var itemConfig = item.config;
				if (item.name === "SectionMenuModule" && itemConfig) {
					defModule = itemConfig.defaultModule;
				}
			}, this);
			return defModule;
		}

		function init() {
			if (Ext.isFunction(ViewModuleHelper.initSettings)) {
				ViewModuleHelper.initSettings();
			}
			LeftPanelUtilities.initCollapsedState();
			sandbox.loadModule("NavigationModule");
			var sysSettings = ["BuildType"];
			Terrasoft.SysSettings.querySysSettings(sysSettings, function() {}, this);
			sandbox.loadModule("ProcessModuleV2");
			sandbox.loadModule("HotkeysModule");
			sandbox.loadModule("SyncModule");
			sandbox.subscribe("LoadModule", onLoadModule);
			sandbox.subscribe("SideBarModuleDefInfo", function() {
				if (isSectionDesigner()) {
					return;
				}
				var sideBarConfig = sandbox.publish("GetSideBarConfig");
				if (sideBarConfig) {
					sandbox.publish("PushSideBarModuleDefInfo", sideBarConfig.items);
				} else {
					ViewModuleHelper.getSideBarDefaultConfig(function(config) {
						var defaultModule;
						var menuItems;
						if (Ext.isObject(config)) {
							menuItems = config.items;
							defaultModule = config.startModule;
						} else {
							menuItems = config;
						}
						if (!defaultModule) {
							defaultModule = getDefModule(menuItems);
						}
						sandbox.publish("PushSideBarModuleDefInfo", menuItems);
					});
				}
			});
			Terrasoft.SysSettings.querySysSettings(["ShowDemoLinks", "PrimaryCulture", "SchedulerTimingStart",
				"SchedulerTimingEnd", "SchedulerDisplayTimingStart"], function(sysSettings) {
				if (sysSettings.ShowDemoLinks) {
					var buyNowBtn = createBuyNowBtn(sysSettings.PrimaryCulture.displayValue);
					createOnlineHelpBtn(sysSettings.PrimaryCulture.displayValue);
					buyNowBtn.correctPos();
				}
			}, this);
			pages = findAllSections();
		}

		function openHomePage(sectionCode) {
			var module = Terrasoft.configuration.ModuleStructure[sectionCode];
			var url = Terrasoft.deepClone(sectionCode);
			if (module) {
				var sectionModule = module.sectionModule;
				var sectionSchema = module.sectionSchema;
				url = sectionModule !== "LookupPage" ? sectionModule : "ProcessExecute";
				if (sectionSchema) {
					url = url + "/" + sectionSchema;
				}
			}
			sandbox.publish("PushHistoryState", {hash: url});
		}

		function requestHomePage(callback) {
			var defaultHomeModule = "MainMenu";
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "SysAdminUnit"
			});
			esq.addColumn("HomePage.Code", "Code");
			esq.getEntity(Terrasoft.SysValue.CURRENT_USER.value, function(result) {
				var entity = result.entity;
				if (result.success && entity) {
					var code = entity.get("Code");
					callback(code || defaultHomeModule);
				} else {
					callback(defaultHomeModule);
				}
			}, this);
		}

		function onHistoryStateChanged(token) {
			var currentState = sandbox.publish("GetHistoryState");
			var moduleName = token.hash ? token.hash.moduleName : null;
			if (currentHash.historyState === token.hash.historyState) {
				var moduleId = currentState.state && currentState.state.moduleId;
				if (!moduleId) {
					return;
				}
				if (moduleName) {
					performanceCounterManager.clearAllTimeStamps();
					performanceCounterManager.setTimeStamp("StateChanged");
					sandbox.loadModule(moduleName, {id: moduleId, renderTo: "centerPanel"});
				}
				return;
			}
			currentHash = currentState.hash;
			if (moduleName) {
				performanceCounterManager.clearAllTimeStamps();
				performanceCounterManager.setTimeStamp("StateChanged");
				if (isSectionDesigner()) {
					sandbox.loadModule(moduleName, { renderTo: "centerPanel" });
				} else if (moduleName !== "ProcessExecute") {
					var id = currentState.state && currentState.state.id;
					var schemaName = currentState.hash && currentState.hash.entityName || "";
					id = id || moduleName + "_" + schemaName;
					sandbox.loadModule(moduleName, {
						renderTo: "centerPanel",
						id: id
					});
				} else {
					var vwSysProcessFilters = Terrasoft.createFilterGroup();
					vwSysProcessFilters.name = "vwSysProcessFiler";
					vwSysProcessFilters.logicalComparisonTypes = Terrasoft.LogicalOperatorType.AND;
					var sysWorkspaceFilter = Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "SysWorkspace",
						Terrasoft.SysValue.CURRENT_WORKSPACE.value);
					vwSysProcessFilters.addItem(sysWorkspaceFilter);
					var isMaxVersionFilter = Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "IsMaxVersion", 1);
					vwSysProcessFilters.addItem(isMaxVersionFilter);
					var businessProcessTagFilter = Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "TagProperty",
						ConfigurationConstants.SysProcess.BusinessProcessTag);
					vwSysProcessFilters.addItem(businessProcessTagFilter);
					var config = {
						entitySchemaName: "VwSysProcess",
						mode: "processMode",
						captionLookup: resources.localizableStrings.ProcessPageCaption,
						multiSelect: false,
						columnName: "Caption",
						filters: vwSysProcessFilters,
						commandLineEnabled: true
					};
					var handler = function() {};
					LookupUtilities.OpenLookupPage(sandbox, { config: config, handler: handler}, this, Ext.get("centerPanel"), false);
				}

			}
		}

		function findAllSections() {
			var arr = [];
			var isCreated = false;
			var sections = Terrasoft.configuration.ModuleStructure;
			for (var i in sections) {
				isCreated = false;
				if (sections[i].pages) {
					for (var j = 0; j < sections[i].pages.length; j += 1) {
						if (sections[i].pages[j].cardSchema) {
							if (!isCreated) {
								arr[arr.length] = [];
								arr[arr.length - 1][0] = sections[i].sectionSchema;
								isCreated = true;
							}
							arr[arr.length - 1][arr[arr.length - 1].length] = sections[i].pages[j].cardSchema;
						}
					}
				}
			}
			return arr;
		}

		function onRefreshCacheHash() {
			currentHash.historyState =  sandbox.publish("GetHistoryState").hash.historyState;
		}

		function onShowHideRightPanel(config) {
			var forceShow = config && config.forceShow;
			var rightPanelElem = Ext.get("rightPanel");
			var centerPanelElem = Ext.get("centerPanel");
			if (forceShow) {
				if (rightPanelElem.hasCls("default-right-panel")) {
					rightPanelElem.removeCls("default-right-panel");
					rightPanelElem.addCls("right-panel");
				}
				if (centerPanelElem.hasCls("default-center-panel-content")) {
					centerPanelElem.removeCls("default-center-panel-content");
					centerPanelElem.addCls("center-panel-content");
				}
			} else {
				if (rightPanelElem.hasCls("right-panel")) {
					rightPanelElem.removeCls("right-panel");
					rightPanelElem.addCls("default-right-panel");
				}
				if (centerPanelElem.hasCls("center-panel-content")) {
					centerPanelElem.removeCls("center-panel-content");
					centerPanelElem.addCls("default-center-panel-content");
				}
			}
		}

		function isSectionDesigner() {
			var isDesigner = false;
			var hash = Terrasoft.router.Router.getHash();
			if (hash.indexOf("SectionDesigner") === 0) {
				isDesigner = true;
			}
			return isDesigner;
		}

		function render(renderTo) {
			var leftPanel = Ext.create("Terrasoft.Container", {
				renderTo: renderTo,
				id: "leftPanel",
				classes: {
					wrapClassName: ["left-panel", "left-panel-scroll", "fixed"]
				},
				selectors: {
					wrapEl: "#leftPanel"
				}
			});
			Ext.create("Terrasoft.Container", {
				renderTo: renderTo,
				id: "mainHeader",
				classes: {
					wrapClassName: ["main-header", "fixed"]
				},
				selectors: {
					wrapEl: "#mainHeader"
				}
			});
			mainCenterPanel = Ext.create("Terrasoft.Container", {
				renderTo: renderTo,
				id: "centerPanelContainer",
				classes: {
					wrapClassName: ["center-panel"]
				},
				selectors: {
					el: "#centerPanelContainer",
					wrapEl: "#centerPanelContainer"
				}
			});
			centerPanel = Ext.create("Terrasoft.Container", {
				renderTo: mainCenterPanel.getWrapEl(),
				id: "centerPanel",
				classes: {
					wrapClassName: ["default-center-panel-content"]
				},
				selectors: {
					el: "#centerPanel",
					wrapEl: "#centerPanel"
				}
			});
			Ext.create("Terrasoft.Container", {
				renderTo: mainCenterPanel.getWrapEl(),
				id: "rightPanel",
				classes: {
					wrapClassName: ["default-right-panel", "fixed"]
				},
				selectors: {
					wrapEl: "#rightPanel"
				}
			});
			Ext.create("Terrasoft.Container", {
				renderTo: renderTo,
				id: "communicationPanel",
				classes: {
					wrapClassName: ["communication-panel", "communication-panel-scroll", "fixed"]
				},
				selectors: {
					wrapEl: "#communicationPanel"
				}
			});
			var token = sandbox.publish("GetHistoryState");
			if (token) {
				onHistoryStateChanged(token);
			}
			sandbox.subscribe("HistoryStateChanged", onHistoryStateChanged);
			sandbox.subscribe("RefreshCacheHash", onRefreshCacheHash);
			sandbox.subscribe("ShowHideRightSidePanel", function(config) {
				onShowHideRightPanel(config);
			});
			sandbox.subscribe("SideBarVisibilityChanged", function(args) {
				var panel = centerPanel;
				if (args.panel === "leftPanel") {
					panel = leftPanel;
				}
				if (args.moduleName === null) {
					var panelEl = panel.getWrapEl().el;
					panelEl.setVisibilityMode(Ext.dom.AbstractElement.DISPLAY);
					panelEl.setVisible(false);
				} else {
					sandbox.loadModule(args.moduleName, {
						renderTo: panel.getWrapEl()
					});
				}
			});

			var isFlashError = window.WEB_SOCKET_SWF_EXCEPTION || false;
			if (isFlashError) {
				var buttonsConfig = {
					buttons: [Terrasoft.MessageBoxButtons.OK.returnCode],
					defaultButton: 0
				};
				Terrasoft.showInformation(resources.localizableStrings.SwfException,
					onFlashPlayerDownload, this, buttonsConfig);
			}
			sandbox.subscribe("NavigationModuleLoaded", function() {
				var state = sandbox.publish("GetHistoryState");
				if (!state.hash.historyState) {
					requestHomePage(function(code) {
						openHomePage(code);
						loadSideBarModule();
					});
				} else {
					loadSideBarModule();
				}
				loadRightSideBarModule();
				loadCommunicationPanelModule();
				if (isSectionDesigner()) {
					renderTo.addCls("section-designer-shown");
				}
				else {
					loadMainHeaderModule();
				}
			});
			loadWelcomeScreen();
		}

		function loadSideBarModule() {
			sandbox.loadModule("SideBarModule", {
				renderTo: "leftPanel",
				id: "SideBarModule"
			});
		}

		function loadRightSideBarModule() {
			sandbox.loadModule("RightSideBarModule", {
				renderTo: "rightPanel"
			});
		}

		function loadMainHeaderModule() {
			sandbox.loadModule("MainHeaderModule", {
				renderTo: "mainHeader"
			});
		}

		function loadCommunicationPanelModule() {
			sandbox.loadModule("CommunicationPanelModule", {
				renderTo: "communicationPanel"
			});
		}

		function onFlashPlayerDownload(result) {
			if (result === Terrasoft.MessageBoxButtons.OK.returnCode) {
				window.open("http://get.adobe.com/ru/flashplayer/", "_blank");
			}
		}

		/**
		 * Загружает приветственное окно при входе в систему.
		 * @private
		 */
		function loadWelcomeScreen() {
			Terrasoft.SysSettings.querySysSettings(["ShowWelcomeScreen", "BuildType"], function(sysSettings) {
				var showWelcomeScreen = sysSettings.ShowWelcomeScreen;
				var buildType = sysSettings.BuildType;
				if (!showWelcomeScreen) {
					return;
				}
				if (buildType === ConfigurationConstants.BuildType.Public) {
					loadWelcomeScreenModule();
				} else {
					Terrasoft.require(["profile!WelcomeScreenModule"], function(profile) {
						var isShown = profile.isShown;
						if (isShown) {
							return;
						}
						loadWelcomeScreenModule();
						this.Terrasoft.saveUserProfile("WelcomeScreenModule", {isShown: true});
					}, this);
				}
			}, this);
		}

		/**
		 * Загружает модуль приветственного окна.
		 * @private
		 */
		function loadWelcomeScreenModule() {
			var config = {
				minWidth: 100,
				minHeight: 100,
				boxClasses: ["welcome-screen-modal-box"]
			};
			var moduleName = "WelcomeScreenModule";
			var moduleId = sandbox.id + "_" + moduleName;
			var renderTo = ModalBox.show(config, function() {
				sandbox.unloadModule(moduleId, renderTo);
			});
			sandbox.loadModule(moduleName, {
				id: moduleId,
				renderTo: renderTo
			});
		}

		return {
			init: init,
			renderTo: Ext.getBody(),
			render: render
		};
	});