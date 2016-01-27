define("ConfigurationViewModule", ["ext-base", "sandbox", "terrasoft", "ConfigurationViewModuleResources",
			"LookupUtilities", "ViewModuleHelper", "ConfigurationConstants", "LeftPanelUtilitiesV2", "ModalBox",
			"IntroPageUtilities", "WelcomeScreenModule", "BaseViewModule"],
		function(Ext, sandbox, Terrasoft, resources, LookupUtilities,
				ViewModuleHelper, ConfigurationConstants, LeftPanelUtilities, ModalBox, IntroPageUtilities) {

			/**
			 * @class Terrasoft.configuration.DemoButtons
			 * Класс создающий демо кнопки.
			 */
			Ext.define("Terrasoft.configuration.DemoButtons", {
				extend: "Terrasoft.BaseViewModule",
				alternateClassName: "Terrasoft.DemoButtons",

				/**
				 * Конфигурация демо кнопок.
				 * @type {Object[]}
				 */
				buttonsConfig: null,

				/**
				 * Конфигурация демо-кнопок с системной настройкой.
				 * @type {Object[]}
				 */
				buttonsSysSettingConfig: null,

				/**
				 * Размер расстояния между кнопками.
				 * @type {Number}
				 */
				separatorSize: 5,

				/**
				 * Классы демо кнопок.
				 * @type {String[]}
				 */
				buttonClasses: ["demo-btn"],

				/**
				 * Открывает окно заказа презентации.
				 * @protected
				 * @virtual
				 */
				openBuyNowWindow: function() {
					window.open(resources.localizableStrings.BuyNowUrl);
				},

				/**
				 * Открывает вкладку браузера с триальной версией продукта.
				 * @protected
				 * @virtual
				 */
				openTrialWindow: function(value) {
					window.open(value);
				},

				/**
				 * Генерирует строку параметров для окна чата с менеджером.
				 * @protected
				 * @virtual
				 */
				createOnlineHelpButtonParameters: function() {
					var parameters = {
						ttl: document.title && encodeURI(document.title.substring(0, 255)),
						url: encodeURI(window.location.href),
						referrer: encodeURI(encodeURI(document.referrer)),
						cd: window.screen.colorDepth,
						rh: screen.height,
						rw: screen.width
					};
					var parametersArray = [resources.localizableStrings.OnlineHelpUrl];
					Terrasoft.each(parameters, function(parameter, name) {
						parametersArray.push(name + "=" + parameter);
					}, this);
					return parametersArray.join("&");
				},

				/**
				 * Открывает окно чата с менеджером.
				 * @protected
				 * @virtual
				 */
				openOnlineHelpWindow: function() {
					var protocol = (("https:" === document.location.protocol) ? "https://" : "http://");
					var srcOpen = protocol + "ok.kolobiz.com/client/?" + this.createOnlineHelpButtonParameters();
					if (navigator.userAgent.toLowerCase().indexOf("opera") !== -1 && window.event.preventDefault) {
						window.event.preventDefault();
					}
					var newWindow = window.open(srcOpen, "ok_kolobiz20122359",
							"toolbar=0,scrollbars=0,location=0,status=1,menubar=0,width=620,height=490,resizable=1");
					newWindow.focus();
					newWindow.opener = window;
				},

				/**
				 * Находит и возвращает текущую культуру.
				 * @protected
				 * @virtual
				 * @return {String} Возвращает текущую культуру.
				 */
				getCurrentCulture: function() {
					var cachedSettings = Terrasoft.SysSettings.cachedSettings;
					return cachedSettings.PrimaryCulture.displayValue;
				},

				/**
				 * Создает и отображет демо кнопку по переданной конфигурации.
				 * @protected
				 * @virtual
				 * @param {Object} config Конфигурация демо кнопки.
				 */
				createDemoButton: function(config) {
					var culture = this.getCurrentCulture();
					var cultureParts = culture.split("-");
					var currentLocalizationImageName = config.localizableImagesPrefix + cultureParts[0].toUpperCase();
					var imageConfig = resources.localizableImages[currentLocalizationImageName];
					var element = Ext.create("Terrasoft.Button", {
						renderTo: Ext.getBody(),
						id: config.id,
						imageConfig: imageConfig,
						classes: {
							wrapperClass: this.buttonClasses,
							imageClass: [config.imageClassPrefix + cultureParts[0]]
						},
						click: {bindTo: config.click}
					});
					element.bind(this);
				},

				/*
				 * Инициализирует начальные данные.
				 * @protected
				 */
				init: function() {
					this.initButtonsConfig();
					this.initButtons();
				},
				/**
				 * Создает конфигурацию демо кнопок.
				 */
				initButtonsConfig: function() {
					if (!this.buttonsConfig) {
						this.buttonsConfig = [];
					}
					this.buttonsConfig.push({
						localizableImagesPrefix: "BuyNow",
						id: "buy-now-btn",
						imageClassPrefix: "buy-now-btn-img-",
						click: "openBuyNowWindow"
					});
					this.buttonsConfig.push({
						localizableImagesPrefix: "OnlineHelp",
						id: "online-help-btn",
						imageClassPrefix: "online-help-btn-img-",
						click: "openOnlineHelpWindow"
					});
					if (!this.buttonsSysSettingConfig) {
						this.buttonsSysSettingConfig = [];
					}
					this.buttonsSysSettingConfig.push({
						localizableImagesPrefix: "Trial",
						id: "trial-btn",
						imageClassPrefix: "trial-btn-img-",
						position: "0",
						sysSetting: "TrialUrl",
						action: this.openTrialWindow
					});
				},

				/**
				 * Создает демо кнопки, актуализирует их позицию.
				 */
				initButtons: function() {
					Terrasoft.chain(
							this.prepareButtonsConfig,
							function(next) {
								Terrasoft.each(this.buttonsConfig, this.createDemoButton, this);
								next();
							},
							function(next) {
								Ext.EventManager.addListener(window, "resize", this.updateButtonsPosition, this);
								next();
							},
							this.updateButtonsPosition, this);
				},

				/**
				 * Подготавливает конфигурацию демо-кнопок.
				 * @param callback {Function} Функция обратного выбоза.
				 */
				prepareButtonsConfig: function(callback) {
					var iterator = this.buttonsSysSettingConfig.length;
					Terrasoft.each(this.buttonsSysSettingConfig, function(item) {
						Terrasoft.chain(
								function(next) {
									Terrasoft.SysSettings.querySysSettingsItem(item.sysSetting, function(value) {
										next(value);
									});
								},
								function(next, value) {
									if (value) {
										var prepareButton = {};
										var onClickName = item.localizableImagesPrefix + "Click";
										this[onClickName] = function() {
											item.action(value);
										};
										prepareButton.localizableImagesPrefix = item.localizableImagesPrefix;
										prepareButton.id = item.id;
										prepareButton.imageClassPrefix = item.imageClassPrefix;
										prepareButton.click = onClickName;
										this.buttonsConfig.splice(item.position, 0, prepareButton);
									}
									next();
								},
								function() {
									if (--iterator === 0) {
										callback();
									}
								}, this);
					}, this);
				},

				/**
				 * Актуализирует позицию кнопок.
				 * @protected
				 * @virtual
				 */
				updateButtonsPosition: function() {
					var buttons = this.buttonsConfig.map(function(buttonConfig) {
						var element = Ext.getCmp(buttonConfig.id);
						return element.getWrapEl();
					}, this);
					var buttonsWidthSum = 0;
					Terrasoft.each(buttons, function(button) {
						buttonsWidthSum += button.dom.offsetWidth;
					}, this);
					var buttonPosition =
							(window.innerWidth - buttonsWidthSum - (this.separatorSize * (buttons.length - 1))) / 2;
					Terrasoft.each(buttons, function(button) {
						button.setStyle("left", buttonPosition + "px");
						buttonPosition += (button.dom.offsetWidth + this.separatorSize);
					}, this);
				}
			})
			;

			/**
			 * @class Terrasoft.configuration.ViewModule
			 * Класс визуального модуля представления.
			 */
			var viewModule = Ext.define("Terrasoft.configuration.ConfigurationViewModule", {
				extend: "Terrasoft.BaseViewModule",
				alternateClassName: "Terrasoft.ConfigurationViewModule",

				Ext: null,
				sandbox: null,
				Terrasoft: null,

				/**
				 * Схема домашней страницы по умолчанию.
				 * @type {String}
				 */
				defaultIntroPage: "SimpleIntro",

				diff: [
					{
						"operation": "insert",
						"name": "leftPanel",
						"values": {
							"itemType": Terrasoft.ViewItemType.MODULE,
							"moduleName": "SideBarModule",
							"classes": {
								"wrapClassName": ["left-panel", "left-panel-scroll", "fixed"]
							}
						}
					}, {
						"operation": "insert",
						"name": "mainHeader",
						"values": {
							"itemType": Terrasoft.ViewItemType.MODULE,
							"moduleName": "MainHeaderModule",
							"classes": {
								"wrapClassName": ["main-header", "fixed"]
							}
						}
					}, {
						"operation": "insert",
						"name": "centerPanelContainer",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"wrapClass": ["center-panel"],
							"id": "centerPanelContainer",
							"selectors": {"wrapEl": "#centerPanelContainer"},
							"items": []
						}
					}, {
						"operation": "insert",
						"name": "communicationPanel",
						"values": {
							"itemType": Terrasoft.ViewItemType.MODULE,
							"moduleName": "CommunicationPanelModule",
							"classes": {
								"wrapClassName": ["communication-panel", "communication-panel-scroll", "fixed"]
							}
						}
					}, {
						"operation": "move",
						"name": "centerPanel",
						"parentName": "centerPanelContainer",
						"propertyName": "items",
						"index": 0
					}, {
						"operation": "insert",
						"parentName": "centerPanelContainer",
						"propertyName": "items",
						"name": "rightPanel",
						"index": 1,
						"values": {
							"itemType": Terrasoft.ViewItemType.MODULE,
							"moduleName": "RightSideBarModule",
							"classes": {
								"wrapClassName": ["default-right-panel", "fixed"]
							}
						}
					}
				],

				/**
				 * @inheritDoc Terrasoft.configuration.BaseViewModule#getSysSettingsNames
				 * @overridden
				 */
				getSysSettingsNames: function() {
					var sysSettings = this.callParent(arguments) || [];
					sysSettings.push("DefaultIntroPage");
					return sysSettings;
				},

				/**
				 * Обрабатывает результаты загрузки системных настроек.
				 * @protected
				 * @overridden
				 * @param {Object[]} values Значения системных настроек.
				 */
				onSysSettingsResponse: function(values) {
					this.callParent(arguments);
					if (values.ShowDemoLinks) {
						this.prepareDemoLinkButtons();
					}
					var defaultIntroPage = values.DefaultIntroPage;
					if (defaultIntroPage) {
						IntroPageUtilities.getDefaultIntroPageName(defaultIntroPage.value, function(defaultIntroPageName) {
							this.defaultIntroPage = defaultIntroPageName;
						}, this);
					}
				},

				/**
				 * Создает и отображает кнопки "Заказать презентацию" и "On-line чат".
				 * @protected
				 * @virtual
				 */
				prepareDemoLinkButtons: function() {
					var buttons = this.Ext.create("Terrasoft.DemoButtons");
					buttons.init();
				},

				/**
				 * @inheritDoc Terrasoft.configuration.BaseViewModule#init
				 * @overridden
				 */
				init: function(callback, scope) {
					this.callParent([
						function() {
							if (Ext.isFunction(ViewModuleHelper.initSettings)) {
								ViewModuleHelper.initSettings();
							}
							LeftPanelUtilities.initCollapsedState();
							callback.call(scope);
						}, this
					]);
				},

				/**
				 * @inheritdoc Terrasoft.BaseSchemaModule#render
				 * @protected
				 * @overridden
				 */
				render: function() {
					this.callParent(arguments);
					this.loadWelcomeScreen();
				},

				/**
				 * @inheritDoc Terrasoft.configuration.BaseViewModule#loadNonVisibleModules
				 * @overridden
				 */
				loadNonVisibleModules: function() {
					this.callParent(arguments);
					var sandbox = this.sandbox;
					sandbox.loadModule("ProcessModuleV2");
					sandbox.loadModule("HotkeysModule");
					sandbox.loadModule("SyncModule");
				},

				/**
				 * @inheritDoc Terrasoft.configuration.BaseViewModule#subscribeMessages
				 * @overridden
				 */
				subscribeMessages: function() {
					this.callParent(arguments);
					var sandbox = this.sandbox;
					sandbox.subscribe("SideBarModuleDefInfo", this.onSideBarModuleDefInfo, this);
					sandbox.subscribe("ShowHideRightSidePanel", this.onShowHideRightPanel, this);
					sandbox.subscribe("SideBarVisibilityChanged", this.onSideBarVisibilityChanged, this);
				},

				/**
				 * Генерирует конфигурацию для модуля левой панели.
				 * @protected
				 * @virtual
				 */
				onSideBarModuleDefInfo: function() {
					var sideBarConfig = this.sandbox.publish("GetSideBarConfig");
					if (sideBarConfig) {
						this.sandbox.publish("PushSideBarModuleDefInfo", sideBarConfig.items);
					} else {
						var me = this;
						ViewModuleHelper.getSideBarDefaultConfig(function(config) {
							var menuItems = Ext.isObject(config) ? config.items : config;
							me.sandbox.publish("PushSideBarModuleDefInfo", menuItems);
						});
					}
				},

				/**
				 * Изменяет css класс для элемента.
				 * @protected
				 * @virtual
				 * @param {String} elementName Имя элемента.
				 * @param {String} oldCssClass Старый css класс элемента.
				 * @param {String} cssClass Новый css класс элемента.
				 */
				changeItemClass: function(elementName, oldCssClass, cssClass) {
					var element = Ext.get(elementName);
					if (element.hasCls(oldCssClass)) {
						element.removeCls(oldCssClass);
						element.addCls(cssClass);
					}
				},

				/**
				 * Показывает или скрывает правую панель.
				 * @protected
				 * @virtual
				 * @param {Object} config Конфигурация действия.
				 * @param {Boolean} config.forceShow Признак показа правой панели. Если установлен в true,
				 * панель будет показана, если в false, панель скроется.
				 *
				 */
				onShowHideRightPanel: function(config) {
					var forceShow = config && config.forceShow;
					var centerPanelClasses = ["center-panel-content", "default-center-panel-content"];
					var rightPanelClasses = ["right-panel", "default-right-panel"];
					if (forceShow) {
						rightPanelClasses.reverse();
						centerPanelClasses.reverse();
					}
					this.changeItemClass("rightPanel", rightPanelClasses[0], rightPanelClasses[1]);
					this.changeItemClass("centerPanel", centerPanelClasses[0], centerPanelClasses[1]);
				},

				/**
				 * Скрывает или загружает модуль в указанную панель.
				 * @pretected
				 * @virtual
				 * @param {Object} args Параметры изменения видимости.
				 * @param {String} args.panel Имя панели.
				 * @param {String} args.moduleName Имя модуля.
				 */
				onSideBarVisibilityChanged: function(args) {
					var panelName = args.panel || "centerPanel";
					if (args.moduleName) {
						this.sandbox.loadModule(args.moduleName, {
							renderTo: panelName
						});
					} else {
						var panel = Ext.getCmp(panelName);
						var panelEl = panel.getWrapEl().el;
						panelEl.setVisibilityMode(Ext.dom.AbstractElement.DISPLAY);
						panelEl.setVisible(false);
					}
				},

				/**
				 * @inheritDoc Terrasoft.configuration.BaseViewModule#onLoadModule
				 * @overridden
				 */
				onLoadModule: function(config) {
					if (config.moduleName === "ProcessExecute") {
						this.loadProcessModule();
					} else {
						this.callParent(arguments);
					}
				},

				/**
				 * Загружает модуль справочника с перечнем бызнесс процессов для запуска.
				 * @protected
				 * @virtual
				 */
				loadProcessModule: function() {
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
					var handler = Terrasoft.emptyFn;
					LookupUtilities.OpenLookupPage(this.sandbox, {config: config, handler: handler}, this, null, false);
				},

				/**
				 * Загружает приветственное окно при входе в систему.
				 * @private
				 */
				loadWelcomeScreen: function() {
					var isFirstLogin = this.Terrasoft.isFirstLogin;
					if (!isFirstLogin) {
						return;
					}
					this.Terrasoft.SysSettings.querySysSettings([
						"UseWelcomeScreen", "BuildType"
					], function(sysSettings) {
						var useWelcomeScreen = sysSettings.UseWelcomeScreen;
						if (!useWelcomeScreen) {
							return;
						}
						var buildType = sysSettings.BuildType;
						if (buildType.value === ConfigurationConstants.BuildType.Public) {
							this.loadWelcomeScreenModule();
						} else {
							this.Terrasoft.require(["profile!WelcomeScreenModule"], function(profile) {
								if (profile && profile.isShown) {
									return;
								}
								this.loadWelcomeScreenModule();
								this.Terrasoft.saveUserProfile("WelcomeScreenModule", {isShown: true});
							}, this);
						}
					}, this);
				},

				/**
				 * Загружает модуль приветственного окна.
				 * @private
				 */
				loadWelcomeScreenModule: function() {
					var config = {
						minWidth: 100,
						minHeight: 100,
						boxClasses: ["welcome-screen-modal-box"]
					};
					var moduleName = "WelcomeScreenModule";
					var moduleId = this.sandbox.id + "_" + moduleName;
					var renderTo = ModalBox.show(config, function() {
						this.sandbox.unloadModule(moduleId, renderTo);
					}.bind(this));
					this.sandbox.loadModule(moduleName, {
						id: moduleId,
						renderTo: renderTo
					});
				},

				/**
				 * @inheritDoc Terrasoft.configuration.BaseViewModule#getHomeModulePath
				 * @overridden
				 */
				getHomeModulePath: function() {
					return this.Terrasoft.combinePath(this.homeModule, this.defaultIntroPage);
				}
			});
			return viewModule;

		})
;