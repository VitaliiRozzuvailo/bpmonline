define("DashboardModule", ["ext-base", "DashboardModuleResources", "BaseNestedModule"],
	function(ext, resources) {

		/**
		 * @class Terrasoft.configuration.BaseDashboardsViewModel
		 * Класс модели представления модуля итогов.
		 */
		Ext.define("Terrasoft.configuration.BaseDashboardViewModel", {
			extend: "Terrasoft.BaseModel",
			alternateClassName: "Terrasoft.BaseDashboardViewModel",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			constructor: function() {
				this.callParent(arguments);
				this.initResourcesValues(resources);
			},

			/**
			 * Инициализирует модель значениями ресурсов из объекта ресурсов.
			 * @protected
			 * @virtual
			 * @param {Object} resourcesObj Объект ресурсов.
			 */
			initResourcesValues: function(resourcesObj) {
				var resourcesSuffix = "Resources";
				Terrasoft.each(resourcesObj, function(resourceGroup, resourceGroupName) {
					resourceGroupName = resourceGroupName.replace("localizable", "");
					Terrasoft.each(resourceGroup, function(resourceValue, resourceName) {
						var viewModelResourceName = [resourcesSuffix, resourceGroupName, resourceName].join(".");
						this.set(viewModelResourceName, resourceValue);
					}, this);
				}, this);
			},

			/**
			 * Загружает модули итога.
			 * @protected
			 * @virtual
			 */
			loadNestedModule: function() {
				var dashboards = this.getDashboards();
				dashboards.each(function(dashboard) {
					var modulesConfig = dashboard.getItems();
					Terrasoft.each(modulesConfig, function(moduleConfig, name) {
						var config = Ext.apply({}, this.getWidgetConfig(moduleConfig), moduleConfig);
						var moduleId = this.getModuleId(name, config);
						var moduleName = config.moduleName || config.parameters.moduleName;
						this.sandbox.loadModule(moduleName, {
							renderTo: name,
							id: moduleId
						});
					}, this);
				}, this);
			},

			/**
			 * Находит начальную конфигурацию для типа виджета.
			 * @protected
			 * @overridden
			 * @param {Object|String} config Конфигурация элемента, содержащая тив виджета, или тип виджета.
			 * @return {Object} Возвращает начальную конфигурацию для типа виджета.
			 */
			getWidgetConfig: function(config) {
				var widgetConfig = Terrasoft.DashboardEnums.WidgetType[config.widgetType];
				return widgetConfig.view;
			},

			/**
			 * Генерирует уникальный идентификатор для модуля в итоге.
			 * @protected
			 * @virtual
			 * @param {String} itemName Имя итога.
			 * @param {Object} moduleConfig Конфигурация итога.
			 * @returns {String} Возвращает уникальный идентификатор для модуля в итоге.
			 */
			getModuleId: function(itemName, moduleConfig) {
				return this.sandbox.id + itemName + moduleConfig.moduleName;
			},

			/**
			 * Регистрирует необходимые модулю в итоге сообщения.
			 * @protected
			 * @virtual
			 * @param {String} itemName Имя итога.
			 * @param {String} moduleConfig Конфигурация итога.
			 */
			registerModuleMessages: function(itemName, moduleConfig) {
				var messages = {};
				var config = Ext.apply({}, this.getWidgetConfig(moduleConfig), moduleConfig);
				var configurationMessage = config.configurationMessage || config.parameters.configurationMessage;
				messages[configurationMessage] = {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				};
				this.sandbox.registerMessages(messages);
			},

			/**
			 * Подписывает сообщение входящих параметров для загружаемого модуля.
			 * @protected
			 * @virtual
			 * @param {String} itemName Имя итога.
			 * @param {Object} moduleConfig Конфигурация итога.
			 */
			subscribeNestedModulesMessage: function(itemName, moduleConfig) {
				var config = Ext.apply({}, this.getWidgetConfig(moduleConfig), moduleConfig);
				var moduleId = this.getModuleId(itemName, config);
				this.registerModuleMessages(itemName, config);
				var configurationMessage = config.configurationMessage || config.parameters.configurationMessage;
				var parameters = config.parameters.parameters || config.parameters;
				this.sandbox.subscribe(configurationMessage, function() {
					return parameters;
				}, [moduleId]);
			},

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				this.subscribeModuleMessages();
				this.initModulesCaptions();
				callback.call(scope);
			},

			/**
			 * Выполняет подписку на сообщения.
			 * @protected
			 * @virtual
			 */
			subscribeModuleMessages: function() {
				var dashboards = this.getDashboards();
				dashboards.each(function(dashboard) {
					var modulesConfig = dashboard.getItems();
					Terrasoft.each(modulesConfig, function(moduleConfig, name) {
						this.subscribeNestedModulesMessage(name, moduleConfig);
					}, this);
				}, this);
			},

			/**
			 * Выполняет необходимые операции после отображениея представления.
			 * @protected
			 * @virtual
			 */
			onRender: function() {
				if (!this.get("Restored")) {
					this.loadNestedModule();
				}
			},

			/**
			 * Генерирует имя параметра привязки к маркеру модуля.
			 * @protected
			 * @virtual
			 * @param {String} itemName Имя модуля.
			 * @returns {String} Возвращает имя параметра привязки к маркеру модуля.
			 */
			getModuleCaptionPropertyName: function(itemName) {
				return itemName + "ModuleContainer";
			},

			/**
			 * Инициализирует заголовки маркеров для модулей.
			 * @protected
			 * @virtual
			 */
			initModulesCaptions: function() {
				var dashboards = this.getDashboards();
				dashboards.each(function(dashboard) {
					var modulesConfig = dashboard.getItems();
					Terrasoft.each(modulesConfig, function(itemConfig, name) {
						var defaultModuleCaption =
							this.get("Resources.Strings.ModulePrefix") +
								(itemConfig.moduleName || itemConfig.parameters.moduleName);
						var moduleCaption = itemConfig.caption ||
							itemConfig.parameters.caption ||
							defaultModuleCaption;
						this.set(this.getModuleCaptionPropertyName(name), moduleCaption);
					}, this);
				}, this);
			},

			/**
			 * Возвращает коллецию итогов модуля.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.Collection} Возвращает коллецию итогов модуля.
			 */
			getDashboards: function() {
				return this.get("Dashboards");
			},

			/**
			 * Метод для подписки по умалчанию для afterrender и afterrerender.
			 */
			loadModule: this.Terrasoft.emptyFn
		});

		/**
		 * @class Terrasoft.configuration.DashboardViewsConfig
		 * Класс генерирующий конфигурацию представления модуля итога.
		 */
		Ext.define("Terrasoft.configuration.DashboardViewConfig", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.DashboardViewConfig",

			/**
			 * Высота ячейки в сетке.
			 * @type {String}
			 */
			rowHeight: "69px",

			/**
			 * Генерирует конфигурацию представления итога.
			 * @param {Terrasoft.Collection} items Коллекция итогов.
			 * @returns {Object[]} Возвращает конфигурацию представления итога.
			 */
			generate: function(items) {
				var itemsConfig = [];
				items.each(function(item) {
					var itemId = "DashboardItem" + item.getId();
					itemsConfig.push({
						"name": itemId + "GridLayout",
						"rowHeight": this.rowHeight,
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": item.getViewConfig()
					});
				}, this);
				return itemsConfig;
			}
		});

		/**
		 * @class Terrasoft.configuration.DashboardModule
		 * Класс визуального модуля итогов.
		 */
		var dashboardModule = Ext.define("Terrasoft.configuration.DashboardModule", {
			extend: "Terrasoft.BaseNestedModule",
			alternateClassName: "Terrasoft.DashboardModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,
			showMask: true,

			/**
			 * Корневой элемент представления дизайнера.
			 * @private
			 * @type {Ext.Element}
			 */
			renderContainer: null,

			/**
			 * Объект конфигурации модуля.
			 * @type {Object}
			 */
			moduleConfig: null,

			/**
			 * Имя класса модели представления для вложенного модуля.
			 * @type {String}
			 */
			viewModelClassName: "Terrasoft.BaseDashboardViewModel",

			/**
			 * Имя класа генератога конфигурации представления вложенного модуля.
			 * @type {String}
			 */
			viewConfigClassName: "Terrasoft.DashboardViewConfig",

			/**
			 * Имя класа генератога представления.
			 * @type {String}
			 */
			viewGeneratorClass: "Terrasoft.ViewGenerator",

			/**
			 * Событие обновления модуля итога.
			 * @protected
			 * @virtual
			 * @return {boolean} Возвращает true.
			 * Необходимо для родительского модуля для информации, был ли загружен модуль.
			 */
			onReloadDashboard: function() {
				if (this.view && !this.view.destroyed) {
					this.view.destroy();
				}
				this.view = null;
				if (this.viewModel && !this.viewModel.destroyed) {
					this.viewModel.destroy();
				}
				this.viewModel = null;
				this.initConfig();
				this.initViewModelClass(function() {
					if (this.destroyed) {
						return;
					}
					this.initViewConfig(function() {
						if (this.destroyed) {
							return;
						}
						var viewModel = this.viewModel = this.createViewModel();
						viewModel.init(function() {
							if (!this.destroyed && this.renderContainer) {
								this.render(this.renderContainer);
							}
						}, this);
					}, this);
				}, this);

				return true;
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseSchemaModule#render
			 * @overridden
			 */
			render: function(renderTo) {
				this.callParent(arguments);
				this.renderContainer = renderTo;
			},

			/**
			 * Создает экземпляр класса Terrasoft.ViewGenerator.
			 * @return {Terrasoft.ViewGenerator} Возвращает объект Terrasoft.ViewGenerator.
			 */
			createViewGenerator: function() {
				return this.Ext.create(this.viewGeneratorClass);
			},

			/**
			 * Создает конфигурацию представления вложенного модуля.
			 * @protected
			 * @virtual
			 * param {Object} config Объект конфигурации.
			 * param {Function} callback Функция обратного вызова.
			 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
			 * @return {Object[]} Возвращает конфигурацию представления вложенного модуля.
			 */
			buildView: function(config, callback, scope) {
				var viewGenerator = this.createViewGenerator();
				var viewClass = this.Ext.create(this.viewConfigClassName);
				var schema = {
					viewConfig: viewClass.generate(config.dashboards)
				};
				var viewConfig = Ext.apply({
					schema: schema
				}, config);
				viewGenerator.generate(viewConfig, callback, scope);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewConfig
			 * @overridden
			 */
			initViewConfig: function(callback, scope) {
				var generatorConfig = Terrasoft.deepClone(this.moduleConfig);
				generatorConfig.viewModelClass = this.viewModelClass;
				generatorConfig.dashboards = this.dashboards;
				this.buildView(generatorConfig, function(view) {
					this.viewConfig = view[0];
					callback.call(scope);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewModelClass
			 * @overridden
			 */
			initViewModelClass: function(callback, scope) {
				this.requireDashboards(this.moduleConfig, function(dashboards) {
					this.dashboards = dashboards;
					this.viewModelClass = Ext.ClassManager.get(this.viewModelClassName);
					callback.call(scope);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#getViewModelConfig
			 * @overridden
			 */
			getViewModelConfig: function() {
				var config = this.callParent(arguments);
				config.values = Ext.apply({}, this.moduleConfig, { Dashboards: this.dashboards });
				return config;
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#init
			 * @overridden
			 */
			init: function() {
				if (!this.viewModel) {
					this.subscribeMessages();
					this.initConfig();
				}
				this.callParent(arguments);
			},

			/**
			 * Инициализирует объект конфигурации модуля.
			 * @protected
			 * @virtual
			 */
			initConfig: function() {
				var sandbox = this.sandbox;
				this.moduleConfig = sandbox.publish("GetDashboardInfo", null, [sandbox.id]);
			},

			/**
			 * Подписывается на сообщения родительского модуля.
			 * @protected
			 * @virtual
			 */
			subscribeMessages: function() {
				var sandbox = this.sandbox;
				sandbox.subscribe("ReloadDashboard", this.onReloadDashboard, this, [sandbox.id]);
			},

			/**
			 * Запрашивает доступные итоги у менеджера.
			 * @protected
			 * @virtual
			 * param {Object} config Объект конфигурации получения итогов.
			 * param {String} config.dashboardId Уникальный идентификатор используемой записи.
			 * param {Function} callback Функция обратного вызова.
			 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
			 * @return {Terrasoft.Collection} Возвращает доступные итоги.
			 */
			requireDashboards: function(config, callback, scope) {
				Terrasoft.DashboardManager.initialize({}, function() {
					var dashboardCollection = Ext.create("Terrasoft.Collection");
					if (config && config.dashboardId) {
						var dashboard = Terrasoft.DashboardManager.getItem(config.dashboardId);
						dashboardCollection.add(dashboard.getId(), dashboard);
						callback.call(scope, dashboardCollection);
						return;
					}
					Terrasoft.DashboardManager.createItem(null, function(dashboard) {
						dashboardCollection.add(dashboard.getId(), dashboard);
						callback.call(scope, dashboardCollection);
					}, this);
				}, this);
			}
		});
		return dashboardModule;
	});