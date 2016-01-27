define("MainHeaderModule", ["MainHeaderModuleResources", "IconHelper", "ServiceHelper",
		"MainHeaderExtensions", "IntroPageUtilities", "ConfigurationConstants", "BaseSchemaModuleV2",
		"ImageView", "css!MainHeaderExtensions"],
	function(resources, iconHelper, serviceHelper, extensions, IntroPageUtilities, ConfigurationConstants) {

		/**
		 * Создает конфигурацию кнопки представления с иконкой.
		 * @private
		 * @param config {Object} Конфигурация кнопки представления с иконкой.
		 * @return {Object} Возвращает конфигурацию кнопки представления с иконкой.
		 */
		var createViewIconButtonConfig = function(config) {
			var buttonConfig = iconHelper.createIconButtonConfig(config);
			buttonConfig.imageConfig = {
				source: Terrasoft.ImageSources.URL,
				url: Terrasoft.ImageUrlBuilder.getUrl(config.icon)
			};
			return buttonConfig;
		};

		/**
		 * @class Terrasoft.configuration.MainHeaderModule
		 * Класс MainHeaderModule предназначен для создания экземпляра верхней панели.
		 */
		Ext.define("Terrasoft.configuration.MainHeaderModule", {
			alternateClassName: "Terrasoft.MainHeaderModule",
			extend: "Terrasoft.BaseSchemaModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Модель представления верхней панели.
			 * @private
			 * @type {Object}
			 */
			viewModel: null,

			/**
			 * Иницализирует начальные значения модуля верхней панели.
			 * @private
			 */
			init: function(callback, scope) {
				this.viewModel = this.createViewModel();
				this.viewModel.Ext = this.Ext;
				this.viewModel.Terrasoft = this.Terrasoft;
				this.viewModel.init();
				if (callback) {
					callback.call(scope || this);
				}
			},

			/**
			 * Отображает представление в контейнер renderTo.
			 * @param {Ext.Element} renderTo Ссылка на контейнер, в котором будет отображаться представление.
			 */
			render: function(renderTo) {
				var view = this.getView();
				view.bind(this.viewModel);
				view.render(renderTo);
				this.viewModel.loadCommandModule();
				this.viewModel.loadProfileButtonMenu();
			},

			/**
			 * Создает модель представления верхней панели.
			 * @protected
			 * @return {Object} Возвращает модель представления верхней панели.
			 */
			createViewModel: function() {
				var values = {
					/**
					 * Внутренний sandbox модели.
					 * @private
					 * @type {Object}
					 */
					sandbox: this.sandbox,

					/**
					 * Заголовок верхней шапки.
					 * @private
					 * @type {String}
					 */
					HeaderCaption: "",

					/**
					 * Имя активного представления.
					 * @private
					 * @type {String}
					 */
					ActiveViewName: "",

					/**
					 * Коллекция кнопок представлений раздела.
					 * @private
					 * @type {Collection}
					 */
					ViewButtons: new Terrasoft.Collection(),

					/**
					 * Флаг, который указывает откуда вызывается верхняя панель.
					 * Если значение True, то вызывается из главного меню - Логотип слева отображается,
					 * справа скрывается.
					 * Если значение False, то стандартный вызов - Логотип слева скрываетя, справа отображается.
					 * @private
					 * @type {Boolean}
					 */
					IsMainMenu: false,

					/**
					 * Флаг, который указывает будет ли видим заголовок верхней панели.
					 * @private
					 * @type {Boolean}
					 */
					IsCaptionVisible: true,

					/**
					 * Флаг, который указывает будет ли видим модуль коммандной строки.
					 * @private
					 * @type {Boolean}
					 */
					IsCommandLineVisible: false,

					IsSSP: (Terrasoft.CurrentUser.userType === Terrasoft.UserType.SSP),

					/**
					 * Флаг, который указывает будет ли видим модуль контекстной справки.
					 * @private
					 * @type {Boolean}
					 */
					IsContextHelpVisible: false,

					/**
					 * Флаг, который указывает будет ли видна кнопка "Дизайнер системы".
					 * @private
					 * @type {Boolean}
					 */
					IsSystemDesignerVisible: false,

					/**
					 * Флаг, который указывает будет ли видимо фото текущего пользователя в верхней панели.
					 * @private
					 * @type {Boolean}
					 */
					IsUserPhotoVisible: true,

					/**
					 * Флаг, который указывает будет ли видим правый логотип в верхней панели.
					 * @private
					 * @type {Boolean}
					 */
					IsLogoVisible: true,

					/**
					 * Флаг, который указывает будет ли видима верхняя панель.
					 * @private
					 * @type {Boolean}
					 */
					IsMainHeaderVisible: true,

					/**
					 * Идентификатор фотографии текущего пользователя.
					 * @private
					 * @type {String}
					 */
					ContactPhotoId: "",

					/**
					 * Название модуля, который сейчас заружен.
					 * @private
					 * @type {String}
					 */
					ModuleName: "",

					/**
					 * Коллекция пунктов меню кнопки профиля пользователя.
					 * @private
					 * @type {Terrasoft.BaseViewModelCollection}
					 */
					ProfileMenuCollection: Ext.create("Terrasoft.BaseViewModelCollection")
				};
				var methods = {
					/**
					 * Загружает модуль коммандной строки.
					 * @private
					 */
					loadCommandModule: function() {
						var commandLineContainer = this.Ext.getCmp("header-command-line-container");
						if (commandLineContainer && commandLineContainer.rendered) {
							this.getSandbox().loadModule("CommandLineModule", {
								renderTo: "header-command-line-container"
							});
						}
					},

					/**
					 * Формирует пункты меню в меню кнопки профиля.
					 * @private
					 */
					loadProfileButtonMenu: function() {
						var profileMenuCollection = this.get("ProfileMenuCollection");
						profileMenuCollection.addItem(Ext.create("Terrasoft.BaseViewModel", {
							values: {
								Caption: resources.localizableStrings.ProfileMenuItemCaption,
								Click: {
									bindTo: "onProfileMenuItemClick"
								},
								MarkerValue: resources.localizableStrings.ProfileMenuItemCaption,
								ImageConfig: resources.localizableImages.YourProfileIcon
							}
						}));
						profileMenuCollection.addItem(Ext.create("Terrasoft.BaseViewModel", {
							values: {
								Type: "Terrasoft.MenuSeparator",
								Caption: ""
							}
						}));
						profileMenuCollection.addItem(Ext.create("Terrasoft.BaseViewModel", {
							values: {
								Caption: resources.localizableStrings.ExitMenuItemCaption,
								Click: {
									bindTo: "onExitMenuItemClick"
								},
								MarkerValue: resources.localizableStrings.ExitMenuItemCaption
							}
						}));
					},

					/**
					 * Выгружает модуль коммандной строки.
					 * @private
					 */
					unloadCommandModule: function() {
						this.getSandbox().unloadModule("CommandLineModule");
					},

					/**
					 * Перезагружает модуль коммандной строки.
					 * @private
					 */
					reloadCommandModule: function() {
						this.unloadCommandModule();
						this.loadCommandModule();
					},

					/**
					 * Получает sandbox.
					 * @private
					 * @return {Object} sandbox.
					 */
					getSandbox: function() {
						return this.get("sandbox");
					},

					/**
					 * Изменяет видимость панели кнопок.
					 * @returns {boolean}
					 */
					getIsButtonsVisible: function() {
						return (this.get("ViewButtons").getCount() > 1);
					},

					/**
					 * Корректирует ширину заголовка в зависимости от наличия кнопок представлений.
					 */
					fixHeaderWidth: function() {
						var captionContainer = this.Ext.get("caption");
						if (!captionContainer) {
							return;
						}
						var viewButtonsVisible = this.getIsButtonsVisible();
						if (viewButtonsVisible) {
							captionContainer.removeCls("fix-width");
						} else {
							captionContainer.addCls("fix-width");
						}
					},

					/**
					 * Изменяет состояние верхней панели.
					 * @private
					 * @param config {Object} Конфигурация состояния верхней панели.
					 */
					onInitDataViews: function(config) {
						var conf = (config && config[0].settings) ? config[0].settings : config[0];
						if (conf.dataViews) {
							this.setButtons(conf);
						} else {
							this.set("ViewButtons", new this.Terrasoft.Collection());
							this.setSettings(conf);
						}
						this.set("HeaderCaption", conf.caption ? conf.caption : "");
						this.set("ModuleName", conf.moduleName ? conf.moduleName : "");
					},

					/**
					 * Устанавливает коллекцию кнопок переключения представлений.
					 * @param config
					 */
					setButtons: function(config) {
						var buttons = new this.Terrasoft.Collection();
						var buttonsContainer = this.Ext.getCmp("button-switch");
						if (buttonsContainer) {
							this.clearContainerItems("button-switch");
							config.dataViews.each(function(item) {
								var bConfig = item.icon ?
									this.createViewIconButtonConfig(item) :
									this.createButtonConfig(item);
								if (item.active) {
									this.set("ActiveViewName", item.name);
								}
								buttons.add(bConfig);
								buttonsContainer.add(bConfig);
							}, this);
							this.set("ViewButtons", buttons);
							this.setSettings(config);
							buttonsContainer.bind(this);
							this.setPressedViewButtons(this.get("ActiveViewName"));
						}
					},

					/**
					 * Обрабатывает нажатие на элемент "Ваш профиль" меню кнопки профиля.
					 * @private
					 */
					onProfileMenuItemClick: function() {
						this.getSandbox().publish("PushHistoryState", {hash: "ProfileModule"});
					},

					/**
					 * Обрабатывает нажатие на элемент "Выход" меню кнопки профиля.
					 * @private
					 */
					onExitMenuItemClick: function() {
						serviceHelper.callService("MainMenuService", "Logout", function() {
							window.logout = true;
							window.location.replace(Terrasoft.loaderBaseUrl + "/simpleLogin");
						}, {}, this);
					},

					/**
					 * Обрабатывает нажатие на логотип.
					 * @private
					 */
					onLogoClick: function() {
						this.openHomePage();
					},

					/**
					 * Открывает домашнюю страницу.
					 * @protected
					 */
					openHomePage: function() {
						this.Terrasoft.SysSettings.querySysSettings(["DefaultIntroPage"], function(values) {
							var defaultIntroPage = values.DefaultIntroPage;
							if (defaultIntroPage) {
								IntroPageUtilities.getDefaultIntroPageName(defaultIntroPage.value,
									function(defaultIntroPageName) {
										var defaultHomeModule = ConfigurationConstants.DefaultHomeModule;
										var hash = this.Terrasoft.combinePath(defaultHomeModule, defaultIntroPageName);
										this.getSandbox().publish("PushHistoryState", {hash: hash});
									}, this);
							}
						}, this);
					},

					/**
					 * Обрабатывает нажатие на кнопку "Дизайнер системы".
					 * @private
					 */
					onSystemDesignerClick: function() {
						this.getSandbox().publish("PushHistoryState", {
							hash: "IntroPage/SystemDesigner"
						});
					},

					/**
					 * Обрабатывает нажатие на заголовок раздела.
					 * @private
					 */
					onCaptionClick: function() {
						this.updateSection();
					},

					/**
					 * Обновляет раздел.
					 * @private
					 */
					updateSection: function() {
						this.getSandbox().publish("UpdateSection", null, [this.get("ModuleName") + "_UpdateSection"]);
					},

					/**
					 * Сбрасывает фильтры и обновляет раздел.
					 * @private
					 */
					resetSection: function() {
						this.getSandbox().publish("ResetSection", null, [this.get("ModuleName") + "_ResetSection"]);
					},

					/**
					 * Обрабатывает нажатие на кнопку переключения видов грида.
					 * @private
					 */
					onViewButtonClick: function() {
						var tag = arguments[3];
						this.setPressedViewButtons(tag);
						var viewConfig = {
							tag: tag,
							moduleName: this.get("ModuleName")
						};
						var sandbox = this.getSandbox();
						sandbox.publish("ChangeDataView", viewConfig, [sandbox.id + "_" + viewConfig.moduleName]);
					},

					/**
					 * Обрабатывает нажатие на кнопку переключения представления в состояние Нажата.
					 * @private
					 * @param viewName {String} Имя представления.
					 */
					setPressedViewButtons: function(viewName) {
						var buttons = this.get("ViewButtons");
						var items = buttons.getItems();
						var isPressed = false;
						this.Terrasoft.each(items, function(item) {
							if (item.tag === viewName) {
								isPressed = true;
								this.set(item.tag + "Active", true);
							} else {
								this.set(item.tag + "Active", false);
							}
						}, this);
						if (!isPressed && items.length > 0) {
							this.set(items[0].tag + "Active", true);
						}
					},

					/**
					 * Устанавливает нужные состояния панелей по конфигурации.
					 * @private
					 * @param config {Object} Конфигурация настроек верхней панели.
					 */
					setSettings: function setSettings(config) {
						var mainHeader = this.Ext.get("mainHeader");
						var centerPanelContainer = this.Ext.get("centerPanelContainer");
						if (config.hasOwnProperty("isMainHeaderVisible")) {
							mainHeader.setVisible(config.isMainHeaderVisible);
							centerPanelContainer.addCls("center-panel-no-padding-top");
						} else {
							mainHeader.setVisible(true);
							centerPanelContainer.removeCls("center-panel-no-padding-top");
						}
						var logoVisible = true;
						if (config.hasOwnProperty("isMainMenu")) {
							this.set("IsMainMenu", config.isMainMenu);
							logoVisible = false;
							this.set("IsLogoVisible", logoVisible);
						} else {
							this.set("IsMainMenu", false);
							logoVisible = true;
							this.set("IsLogoVisible", logoVisible);
						}
						if (config.hasOwnProperty("isCaptionVisible")) {
							this.set("IsCaptionVisible", config.isCaptionVisible);
						} else {
							this.set("IsCaptionVisible", true);
						}
						this.сommandLineVisible(config);
						this.contextHelpVisible(config);
						this.setSystemDesignerVisible(config);
						if (config.hasOwnProperty("isUserPhotoVisible")) {
							this.set("IsUserPhotoVisible", config.isUserPhotoVisible);
						} else {
							this.set("IsUserPhotoVisible", true);
						}
						if (config.hasOwnProperty("isLogoVisible")) {
							this.set("IsLogoVisible", config.isLogoVisible);
						} else {
							this.set("IsLogoVisible", logoVisible);
						}
						if (config.hasOwnProperty("isLogoVisible")) {
							this.set("IsLogoVisible", config.isLogoVisible);
						} else {
							this.set("IsLogoVisible", logoVisible);
						}
					},

					/**
					 * Устанавливает, исходя из конфигурации, свойство панели отвечающее за отображение командной
					 * строки. Отвечает за отображение и скрытие командной строки на панели.
					 * @private
					 * @param {Object} config Конфигурация настроек верхней панели.
					 */
					сommandLineVisible: function(config) {
						var isCommandLineVisible = !this.get("IsSSP");
						if (isCommandLineVisible && config.hasOwnProperty("isCommandLineVisible")) {
							isCommandLineVisible = config.isCommandLineVisible;
						}
						if (this.get("IsCommandLineVisible") !== isCommandLineVisible) {
							this.set("IsCommandLineVisible", isCommandLineVisible);
							this.reloadCommandModule();
						}
					},

					/**
					 * Устанавливает, исходя из конфигурации, свойство панели отвечающее за отображение кнопки помощи.
					 * Отвечает за отображение и скрытие кнопки помощи на панели.
					 * @private
					 * @param {Object} config Конфигурация настроек верхней панели.
					 */
					contextHelpVisible: function(config) {
						var isContextHelpVisible = !this.get("IsSSP");
						if (isContextHelpVisible && config.hasOwnProperty("isContextHelpVisible")) {
							isContextHelpVisible = config.isContextHelpVisible;
						}
						this.set("IsContextHelpVisible", isContextHelpVisible);
					},

					/**
					 * Устанавливает, исходя из конфигурации, свойство панели отвечающее за отображение кнопки
					 * "Дизайнер системы". Отвечает за отображение и скрытие кнопки "Дизайнер системы" на панели.
					 * @private
					 * @param {Object} config Конфигурация настроек верхней панели.
					 */
					setSystemDesignerVisible: function(config) {
						var isSystemDesignerVisible = !this.get("IsSSP");
						if (config.hasOwnProperty("isSystemDesignerVisible")) {
							isSystemDesignerVisible = config.isSystemDesignerVisible;
						}
						Terrasoft.SysSettings.querySysSettings(["BuildType"], function(sysSettings) {
							var buildType = sysSettings.BuildType;
							if (buildType && (buildType.value === ConfigurationConstants.BuildType.Public)) {
								isSystemDesignerVisible = false;
							}
							this.set("IsSystemDesignerVisible", isSystemDesignerVisible);
						}, this);
					},

					/**
					 * Очищает заголовок верхней панели.
					 * @private
					 */
					clearHeader: function() {
						var mainHeader = this.Ext.get("mainHeader");
						if (mainHeader && !mainHeader.isVisible()) {
							mainHeader.setVisible(true);
						}
						this.set("HeaderCaption", "");
					},

					/**
					 * Загружает кнопку контекстной справки.
					 * @param config
					 * @private
					 */
					loadContextHelp: function(config) {
						this.getSandbox().subscribe("GetContextHelpId", function() {
							return config;
						}, [this.getSandbox().id + "_ContextHelpModule"]);
						this.clearContainerItems("header-context-help-container", true);
						this.getSandbox().loadModule("ContextHelpModule", {
							renderTo: "header-context-help-container"
						});
					},

					/**
					 * Очищает элементы контейнера и перерисовывает его.
					 * @param {String} containerId Идентификатор контейнера.
					 * @param {Boolean} needRerender Флаг, указывающий, необходимо ли перерисовывать контейнер
					 * после удаления элементов.
					 */
					clearContainerItems: function(containerId, needRerender) {
						var container = this.Ext.getCmp(containerId);
						if (container && container.getWrapEl()) {
							if (container.getWrapEl()) {
								container.items.each(function(item) {
									container.remove(item);
									item.destroy();
								}, this);
							}
						}
						if (needRerender) {
							container.reRender();
						}
					},

					/**
					 * Создает конфигурацию кнопки представления с иконкой.
					 * @private
					 * @param config {Object} Конфигурационный объект представления.
					 * @return {Object} Конфигурация элемента управления представления с иконкой.
					 */
					createViewIconButtonConfig: createViewIconButtonConfig,

					/**
					 * Создает конфигурация кнопки без иконки.
					 * @private
					 * @param config {Object} Конфигурация.
					 * @return {Object} Конфигурация элемента управления без иконки.
					 */
					createButtonConfig: function(config) {
						var buttonConfig = {
							caption: config.caption ? config.caption : config.name,
							tag: [config.name, config.caption],
							markerValue: [config.name, config.caption],
							className: "Terrasoft.Button",
							style: this.Terrasoft.controls.ButtonEnums.style.DEFAULT,
							pressed: {bindTo: config.name + "Active"},
							click: {bindTo: config.func ? config.func : "onViewButtonClick"},
							classes: {
								textClass: ["view-no-images-class"],
								pressedClass: ["pressed-button-view"]
							},
							menu: {
								items: {
									bindTo: "ProfileMenuCollection"
								},
								ulClass: "profile-menu"
							}
						};
						return buttonConfig;
					},

					/**
					 * Обрабатывает события изменения фото текущего пользователя.
					 * @param {Object} scope Контекст выполнения метода.
					 * @param {Object} response Ответ сервера.
					 */
					onContactPhotoMessageChanged: function(scope, response) {
						if (response && response.Header.Sender !== "UpdateHeaderContactPhoto") {
							return;
						}
						var receivedMessage = Ext.decode(response.Body);
						var photoId = receivedMessage.photoId;
						this.set("ContactPhotoId", photoId);
						var storage = this.Terrasoft.DomainCache;
						storage.setItem("ContactPhotoId", Terrasoft.encode(photoId));
					},

					/**
					 * Инициализирует начальное состояние и события модели.
					 * @protected
					 */
					init: function() {
						var sandbox = this.getSandbox();
						sandbox.subscribe("InitDataViews", function() {
							this.onInitDataViews(arguments);
							this.fixHeaderWidth();
						}, this);
						sandbox.subscribe("ChangeHeaderCaption", function(args) {
							this.set("HeaderCaption", args.caption);
							this.set("ModuleName", args.moduleName ? args.moduleName : "");
							if (args.dataViews) {
								this.setButtons(args);
							}
							this.fixHeaderWidth();
						}, this);
						sandbox.subscribe("InitContextHelp", function(config) {
							this.loadContextHelp(config);
							sandbox.publish("ChangeContextHelpId", config, [sandbox.id + "_ContextHelpModule"]);
						}, this);
						if (this.Ext.isEmpty(this.get("HeaderCaption"))) {
							sandbox.publish("NeedHeaderCaption");
						}
						var storage = this.Terrasoft.DomainCache;
						var contactPhotoId = storage.getItem("ContactPhotoId") ||
							this.Terrasoft.SysValue.CURRENT_USER_CONTACT.primaryImageValue;
						this.set("ContactPhotoId", contactPhotoId);
						Terrasoft.ServerChannel.on(Terrasoft.EventName.ON_MESSAGE,
							this.onContactPhotoMessageChanged, this);
						if (Ext.isFunction(extensions.customInitViewModel)) {
							extensions.customInitViewModel(viewModel);
						}
					},

					/**
					 * Возвращает конфигурацию изображения текущего пользователя.
					 * @private
					 * @return {Object} Конфигурация изображения.
					 */
					getContactPhoto: function() {
						var photoId = this.get("ContactPhotoId");
						if (this.Terrasoft.isEmptyGUID(photoId)) {
							return resources.localizableImages.ContactEmptyPhoto;
						}
						var photoConfig = {
							source: this.Terrasoft.ImageSources.ENTITY_COLUMN,
							params: {
								schemaName: "SysImage",
								columnName: "Data",
								primaryColumnValue: photoId
							}
						};
						return {
							source: Terrasoft.ImageSources.URL,
							url: Terrasoft.ImageUrlBuilder.getUrl(photoConfig)
						};
					}
				};
				if (Ext.isFunction(extensions.extendViewModelValues)) {
					extensions.extendViewModelValues(values);
				}
				if (Ext.isFunction(extensions.extendViewModelMethods)) {
					extensions.extendViewModelMethods(methods);
				}
				var viewModel = this.Ext.create("Terrasoft.BaseViewModel", {
					values: values,
					methods: methods
				});
				return viewModel;
			},

			/**
			 * Получает конфигурацию представления.
			 * @private
			 * @return {Object} Возвращает конфигурацию представления.
			 */
			getView: function() {
				return this.getContainer("mainHeaderContainer", ["main-header", "fixed"], this.getHeaderItems());
			},

			/**
			 * Возвращает представление контейнера.
			 * @private
			 * @param id {String} Идентификатор.
			 * @param wrapClass {Object} Классы контейнера.
			 * @param items {Object} Коллекция дочерних элементов.
			 * @return {Object} Возвращает конфигурацию контейнера.
			 */
			getContainer: function(id, wrapClass, items) {
				var container = this.Ext.create("Terrasoft.Container", {
					id: id,
					classes: {
						wrapClassName: this.Ext.isArray(wrapClass) ? wrapClass : [wrapClass]
					},
					selectors: {
						wrapEl: "#" + id
					},
					items: items ? items : []
				});
				return container;
			},

			/**
			 * Возвращает массив контейнеров элементов представления.
			 * @private
			 * @return {Object} Массив контейнеров элементов представления.
			 */
			getHeaderItems: function() {
				var menuLogoImageContainer = this.getContainer("main-header-menu-logo-image-container",
					"main-header-menu-logo-image-container-class");
				menuLogoImageContainer.add(
					this.getImageConfig("menuLogoImage", ["main-header-menu-logo-image"],
						this.getMenuLogoImageConfig())
				);
				this.setVisibleBinding(menuLogoImageContainer, "IsMainMenu");
				var captionContainer = this.getContainer("caption", "caption-class", [this.generateCaption()]);
				var buttonsContainer = this.getContainer("button-switch", "button-class");
				this.setVisibleBinding(buttonsContainer, "getIsButtonsVisible");
				var emptyContainer = this.getContainer("empty-container", "empty-container-class");
				var commandLineContainer = this.getContainer("header-command-line-container", "command-line-class");
				this.setVisibleBinding(commandLineContainer, "IsCommandLineVisible");
				var imageContainer = this.getContainer("main-header-image-container",
					"main-header-image-container-class");
				var photo = this.getProfileButtonConfig();
				imageContainer.add(photo);
				if (Ext.isFunction(extensions.extendImageContainer)) {
					extensions.extendImageContainer(imageContainer);
				}
				this.setVisibleBinding(imageContainer, "IsUserPhotoVisible");
				var contextHelpContainer = this.getContainer("header-context-help-container", "context-help-class");
				this.setVisibleBinding(contextHelpContainer, "IsContextHelpVisible");
				var systemDesignerContainer = this.getContainer("header-system-designer-container",
					"context-system-designer-class", [ this.createViewIconButtonConfig({
						name: "system-designer",
						hint: resources.localizableStrings.SystemDesignerCaption,
						icon: resources.localizableImages.SystemDesignerIcon,
						func: "onSystemDesignerClick",
						wrapperClass: "system-designer-button",
						imageClass: "system-designer-image"
					})
				]);
				this.setVisibleBinding(systemDesignerContainer, "IsSystemDesignerVisible");
				var logoContainer = this.getContainer("main-header-logo-container", "main-header-logo-container-class");
				if (this.viewModel.get("IsSSP")) {
					logoContainer.add(
							this.getImageConfig("logoImage", ["main-header-logo-image"], this.getLogoImageConfig())
					);
				} else {
					logoContainer.add(
							this.getImageConfig("logoImage", ["main-header-logo-image", "cursor-pointer"],
									this.getLogoImageConfig(), "onLogoClick")
					);
				}
				this.setVisibleBinding(logoContainer, "IsLogoVisible");
				var leftHeaderContainer = this.getContainer("left-header-container", "left-header-container-class");
				var rightHeaderContainer = this.getContainer("right-header-container", "right-header-container-class");
				var rightImageContainer = this.getContainer("header-right-image-container",
						"context-right-image-class");
				leftHeaderContainer.add([
					menuLogoImageContainer,
					captionContainer,
					buttonsContainer,
					emptyContainer,
					commandLineContainer
				]);
				rightImageContainer.add([
					contextHelpContainer,
					systemDesignerContainer
				]);
				rightHeaderContainer.add([
					imageContainer,
					rightImageContainer,
					logoContainer
				]);
				return [
					leftHeaderContainer,
					rightHeaderContainer
				];
			},

			/**
			 * Генерирует конфигурацию элемента управления заголовка.
			 * @private
			 * @return {Object} Конфигурация элемента управления заголовка.
			 */
			generateCaption: function() {
				var caption = {
					className: "Terrasoft.Label",
					classes: {
						labelClass: ["header-section-caption-class", "cursor-pointer"]
					},
					caption: {
						bindTo: "HeaderCaption"
					},
					hint: {
						bindTo: "HeaderCaption"
					},
					markerValue: {
						bindTo: "HeaderCaption"
					},
					visible: {
						bindTo: "IsCaptionVisible"
					},
					click: {
						bindTo: "onCaptionClick"
					}
				};
				return caption;
			},

			/**
			 * Создает конфигурацию кнопки представления с иконкой.
			 * @private
			 * @param config {Object} Конфигурационный объект представления.
			 * @return {Object} Конфигурация элемента управления представления с иконкой.
			 */
			createViewIconButtonConfig: createViewIconButtonConfig,

			/**
			 * Создает конфигурационный объект кнопки профиля пользователя.
			 * @private
			 * @return {Object} Возвращает конфигурационный объект кнопки профиля пользователя.
			 */
			getProfileButtonConfig: function() {
				var buttonConfig = {
					id: "profile-user-button",
					className: "Terrasoft.Button",
					selectors: {
						wrapEl: "#profile-user-button"
					},
					hint: resources.localizableStrings.ProfileImageButtonHintCaption,
					imageConfig: {
						bindTo: "getContactPhoto"
					},
					menu: {
						items: {
							bindTo: "ProfileMenuCollection"
						},
						ulClass: "profile-menu"
					},
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
					classes: {
						wrapperClass: ["photo-icon-wrapper"],
						imageClass: ["photo-icon"],
						markerClass: ["profile-photo-btn-marker-class"]
					}
				};
				return buttonConfig;
			},

			/**
			 * Добавляет биндинг видимости к контейнеру.
			 * @private
			 * @param container {Object} Контейнер к которому добавляется биндинг.
			 * @param modelItem {String} Название элемента модели.
			 */
			setVisibleBinding: function(container, modelItem) {
				container.bindings.visible = {
					config: {
						changeMethod: "setVisible"
					},
					modelItem: modelItem
				};
			},

			/**
			 * Возвращает конфигурацию элемента управления с изображением.
			 * @private
			 * @param name {String} Наименование.
			 * @param className {String} Классы элемента управления.
			 * @param config {String} Конфигурация изображения.
			 * @param click {String} Имя метода, который вызовется при клике.
			 * @return {Object} Конфигурация элемента управления с изображением.
			 */
			getImageConfig: function(name, className, config, click) {
				if (!Ext.isArray(className) && !Ext.isEmpty(className)) {
					className = [className];
				}
				var imageUrl = this.getImageSrc(config);
				var imageConfig = {
					id: name,
					selectors: {
						wrapEl: "#" + name
					},
					className: "Terrasoft.ImageView",
					imageSrc: imageUrl,
					classes: { wrapClass: className }
				};
				if (click) {
					imageConfig.click = { bindTo: click };
				}
				return imageConfig;
			},

			/**
			 * Возвращает URL изображения.
			 * @private
			 * @param config
			 * @return {String} URL
			 */
			getImageSrc: function(config) {
				return this.Terrasoft.ImageUrlBuilder.getUrl(config);
			},

			/**
			 * Возвращает конфигурацию изображения логотипа.
			 * @private
			 * @return {Object} Конфигурация изображения.
			 */
			getLogoImageConfig: function() {
				return {
					params: {
						r: "HeaderLogoImage"
					},
					source: this.Terrasoft.ImageSources.SYS_SETTING
				};
			},

			/**
			 * Возвращает конфигурацию изображения логотипа.
			 * @private
			 * @return {Object} Конфигурация изображения логотипа.
			 */
			getMenuLogoImageConfig: function() {
				return {
					params: {
						r: "MenuLogoImage"
					},
					source: this.Terrasoft.ImageSources.SYS_SETTING
				};
			}
		});
		return Terrasoft.MainHeaderModule;
	});