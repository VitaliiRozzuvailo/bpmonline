define("BaseViewModule", ["ext-base", "terrasoft", "BaseViewModuleResources", "performancecountermanager",
	"ConfigurationConstants", "ViewGeneratorV2"],
	function(Ext, Terrasoft, resources, performanceCounterManager, ConfigurationConstants) {

		/**
		 * @class Terrasoft.configuration.BaseViewModule
		 * Базовый класс визуального модуля представления.
		 */
		Ext.define("Terrasoft.configuration.BaseViewModule", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.BaseViewModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Признак асинхронности модуля.
			 * @type {Boolean}
			 */
			isAsync: true,

			/**
			 * Последнее состояние хэша.
			 * @type {Object}
			 */
			currentHash: {
				historyState: ""
			},

			/**
			 * Код домашней страницы по умолчанию.
			 * @type {String}
			 */
			defaultHomeModule: ConfigurationConstants.DefaultHomeModule,

			/**
			 * Код домашней страницы.
			 * @type {String}
			 */
			homeModule: "",

			/**
			 * Имя основного контейнера модуля.
			 * @type {Object[]}
			 */
			containerName: "ViewModuleContainer",

			/**
			 * Конфигурация представления модуля.
			 * @type {Object[]}
			 */
			viewConfig: null,

			/**
			 * Имя класса - генератора представления.
			 * @type {String}
			 */
			viewGeneratorClass:  "Terrasoft.ViewGenerator",

			/**
			 * Разница схемы представления.
			 * @type {Object[]}
			 */
			diff: [{
				"operation": "insert",
				"name": "centerPanel",
				"values": {
					"id": "centerPanel",
					"selectors": { "wrapEl": "#centerPanel" },
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["default-center-panel-content"]

				}
			}],

			/**
			 * Инициализирует модуль.
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				Terrasoft.chain(
					this.initSysSettings,
					this.initViewConfig,
					this.initHomePage,
					function() {
						this.subscribeMessages();
						callback.call(scope);
					},
					this
				);
			},

			/**
			 * Отображение представление.
			 * @virtual
			 * @param {Ext.Element} renderTo Ссылка на контейнер, в котором будет отображаться представление.
			 */
			render: function(renderTo) {
				this.renderView(renderTo);
				this.loadNonVisibleModules();
				this.initHistoryState();
				this.checkWebSocketSupport();
			},

			/**
			 * Проверяет, является ли контекст выполнения экземпляром класса, или прототипом базовых.
			 * @protected
			 * @virtual
			 * @return {Boolean} Возвращает true если текущий контекст выполнения - экземпляр класса,
			 * false в обратном случае.
			 */
			isInstance: function() {
				return this.hasOwnProperty("instanceId") && this.instanceId;
			},

			/**
			 * Создеает схему представления на основе параметра разницы для всей иерархии классов.
			 * @protected
			 * @virtual
			 * @return {Object[]} Возвращает схему представления.
			 */
			getSchema: function() {
				var baseSchema = [];
				if (this.superclass.getSchema) {
					baseSchema = this.superclass.getSchema();
				}
				return this.hasDiff() ? Terrasoft.JsonApplier.applyDiff(baseSchema, this.diff) : baseSchema;
			},

			/**
			 * Проверяет, есть ли у контекста параметр разницы для схемы.
			 * @protected
			 * @virtual
			 * @return {Boolean} Возвращает true если есть, false в обратном случае.
			 */
			hasDiff: function() {
				var isInstance = this.isInstance();
				var diff = this.diff;
				return (isInstance && (diff !== this.superclass.diff)) ||
					(!isInstance && (this.hasOwnProperty("diff") && !Ext.isEmpty(diff)));
			},

			/**
			 * Создает конфигурацию представления модуля.
			 * @protected
			 * @virtual
			 * @param {Object} config Объект конфигурации.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			buildView: function(config, callback, scope) {
				var viewGenerator = this.createViewGenerator();
				var schema = {
					viewConfig: this.getSchema()
				};
				var viewConfig = Ext.apply({
					schema: schema
				}, config);
				viewGenerator.generate(viewConfig, callback, scope);
			},

			/**
			 * Инициализирует объект конфигурации представления модуля.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			initViewConfig: function(callback, scope) {
				var generatorConfig = {};
				generatorConfig.viewModelClass = this.self;
				this.buildView(generatorConfig, function(view) {
					this.viewConfig = view;
					callback.call(scope);
				}, this);
			},

			/**
			 * Создает экземпляр класса Terrasoft.ViewGenerator.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.ViewGenerator} Возвращает объект Terrasoft.ViewGenerator.
			 */
			createViewGenerator: function() {
				return this.Ext.create(this.viewGeneratorClass);
			},

			/**
			 * Инициализирует основные системные настройки.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			initSysSettings: function(callback, scope) {
				Terrasoft.SysSettings.querySysSettings(this.getSysSettingsNames(), function(values) {
					this.onSysSettingsResponse(values);
					callback.call(scope);
				}, this);
			},

			/**
			 * Возвращает массив названий системных настроек, значения которых запрашиваются и кэшируются при входе в
			 * систему пользователем.
			 * @protected
			 * @virtual
			 * @return {String[]} Массив названий системных настроек, значения которых запрашиваются и кэшируются при
			 * входе в систему пользователем.
			 */
			getSysSettingsNames: function() {
				return ["BuildType", "ShowDemoLinks", "PrimaryCulture", "SchedulerTimingStart",
					"SchedulerTimingEnd", "SchedulerDisplayTimingStart", "PrimaryCurrency"];
			},

			/**
			 * Обрабатывает результаты загрузки системных настроек.
			 * @protected
			 * @virtual
			 */
			onSysSettingsResponse: Terrasoft.emptyFn,

			/**
			 * Создает и загружает основные панели сайта.
			 * @protected
			 * @virtual
			 * @param {Ext.Element} renderTo Ссылка на контейнер, в котором будет отображаться представление.
			 */
			renderView: function(renderTo) {
				var view = this.view = this.Ext.create("Terrasoft.Container", {
					id: this.containerName,
					selectors: {wrapEl: "#" +  this.containerName},
					items: Terrasoft.deepClone(this.viewConfig),
					markerValue: this.containerName
				});
				view.render(renderTo);
			},

			/**
			 * Инициализирует начальное состояние.
			 * @protected
			 * @virtual
			 */
			initHistoryState: function() {
				var token = this.sandbox.publish("GetHistoryState");
				if (token) {
					this.onHistoryStateChanged(token);
				}
			},

			/**
			 * Проверяет поддержку браузером WebSocket.
			 * @protected
			 * @virtual
			 */
			checkWebSocketSupport: function() {
				var isFlashError = window.WEB_SOCKET_SWF_EXCEPTION || false;
				if (isFlashError) {
					var buttonsConfig = {
						buttons: [Terrasoft.MessageBoxButtons.OK.returnCode],
						defaultButton: 0
					};
					Terrasoft.showInformation(resources.localizableStrings.SwfException,
						this.onFlashPlayerDownload, this, buttonsConfig);
				}
			},

			/**
			 * Открывает окно загрузки последнего flashplayer.
			 * @protected
			 * @virtual
			 * @param {Object} result Результат работы информационного окна.
			 */
			onFlashPlayerDownload: function(result) {
				if (result === Terrasoft.MessageBoxButtons.OK.returnCode) {
					window.open("http://get.adobe.com/ru/flashplayer/", "_blank");
				}
			},

			/**
			 * Загружает утилитные, невидимые модули.
			 * @protected
			 * @virtual
			 */
			loadNonVisibleModules: function() {
				var sandbox = this.sandbox;
				sandbox.loadModule("NavigationModule");
			},

			/**
			 * Подписывается на сообщения.
			 * @protected
			 * @virtual
			 */
			subscribeMessages: function() {
				var sandbox = this.sandbox;
				sandbox.subscribe("LoadModule", this.onLoadModule, this);
				sandbox.subscribe("HistoryStateChanged", this.onHistoryStateChanged, this);
				sandbox.subscribe("RefreshCacheHash", this.refreshCacheHash, this);
				sandbox.subscribe("NavigationModuleLoaded", this.loadMainPanelsModules, this);
			},

			/**
			 * Загружает модули в основные панели.
			 * @protected
			 * @virtual
			 */
			loadMainPanelsModules: function() {
				var schema = this.getSchema();
				Terrasoft.iterateChildItems(schema, function(iterationConfig) {
					var item = iterationConfig.item;
					if (item.itemType === Terrasoft.ViewItemType.MODULE) {
						this.onLoadModule({
							moduleName: item.moduleName,
							renderTo: item.name
						});
					}
				}, this);
				this.loadHomePage();
			},

			/**
			 * Инициализирует код домашней страницы для текущего пользователя.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			initHomePage: function(callback, scope) {
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "SysAdminUnit"
				});
				esq.addColumn("HomePage.Code", "Code");
				esq.getEntity(Terrasoft.SysValue.CURRENT_USER.value, function(result) {
					this.homeModule = this.defaultHomeModule;
					var entity = result.entity;
					if (result.success && entity) {
						this.homeModule = entity.get("Code") || this.homeModule;
					}
					callback.call(scope);
				}, this);
			},

			/**
			 * Загружает модуль.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация загрузки модуля.
			 * @param {String} config.renderTo Имя контейнера для модуля.
			 * @param {String} config.moduleId Уникальный идентификатор модуля.
			 * @param {String} config.moduleName Имя загружаемого модуля.
			 * @param {Boolean} config.keepAlive Признак того, будет ли уничтожен предыдущий модуль,
			 * загруженный в контейнер.
			 */
			onLoadModule: function(config) {
				var renderTo = config.renderTo;
				if (!Ext.isEmpty(renderTo)) {
					this.sandbox.loadModule(config.moduleName, {
						renderTo: renderTo,
						id: config.moduleId,
						keepAlive: config.keepAlive || false
					});
				}
			},

			/**
			 * Находит имя модуля в объекте состояния браузера.
			 * @protected
			 * @virtual
			 * @param {Object} token Объект состояния браузера.
			 * @return {String} Возвращает имя модуля.
			 */
			getModuleName: function(token) {
				return token.hash ? token.hash.moduleName : null;
			},

			/**
			 * Обрабатывае изменение состояния. Запускает таймер производительности.
			 * @protected
			 * @virtual
			 */
			onStateChanged: function() {
				performanceCounterManager.clearAllTimeStamps();
				performanceCounterManager.setTimeStamp("StateChanged");
			},

			/**
			 * Обрабатывает новое состояние, загружает модуль цепочки.
			 * @protected
			 * @virtual
			 * @param {Object} token Объект нового состояния браузера.
			 */
			loadChainModule: function(token) {
				var currentState = this.sandbox.publish("GetHistoryState");
				var moduleId = currentState.state && currentState.state.moduleId;
				var moduleName = this.getModuleName(token);
				if (!moduleId || !moduleName) {
					return;
				}
				this.onStateChanged();
				this.onLoadModule({
					moduleName: moduleName,
					moduleId: moduleId,
					renderTo: "centerPanel"
				});
			},

			/**
			 * Обрабатывает новое состояние, загружает модуль.
			 * @protected
			 * @virtual
			 * @param {Object} token Объект нового состояния браузера.
			 */
			loadModuleFromHistoryState: function(token) {
				var moduleName = this.getModuleName(token);
				if (!moduleName) {
					return;
				}
				var currentState = this.sandbox.publish("GetHistoryState");
				var id = this.generateModuleId(moduleName, currentState);
				this.onStateChanged();
				this.onLoadModule({
					moduleName: moduleName,
					moduleId: id,
					renderTo: "centerPanel"
				});
			},

			/**
			 * Генерирует уникальный идентификатор модуля на основе имени модуля и текущего состояния.
			 * @protected
			 * @virtual
			 * @param {String} moduleName Имя модуля.
			 * @param {Object} currentState Объект состояния браузера.
			 * @return {String} Возвращает уникальный идентификатор модуля.
			 */
			generateModuleId: function(moduleName, currentState) {
				var id = currentState.state && currentState.state.id;
				var result = moduleName;
				var hash = currentState.hash;
				var schemaName = (currentState.hash && currentState.hash.entityName) || "";
				if (!this.Ext.isEmpty(hash) && !this.Ext.isEmpty(hash.recordId)) {
					result += "_" + hash.recordId;
				}
				return id || result + "_" + schemaName;
			},

			/**
			 * Обрабатывает изменение состояния. Загружает необходимые модули.
			 * @protected
			 * @virtual
			 * @param {Object} token Объект нового состояния браузера.
			 */
			onHistoryStateChanged: function(token) {
				if (this.currentHash.historyState === token.hash.historyState) {
					this.loadChainModule(token);
				} else {
					this.refreshCacheHash();
					this.loadModuleFromHistoryState(token);
				}
			},

			/**
			 * Обновляет текущее состояние для модуля.
			 * @protected
			 * @virtual
			 */
			refreshCacheHash: function() {
				var currentHistoryState = this.sandbox.publish("GetHistoryState");
				this.currentHash.historyState = currentHistoryState.hash.historyState;
			},

			/**
			 * Открывает домашнюю страницу, если состояние не было установленно.
			 * @protected
			 * @virtual
			 */
			loadHomePage: function() {
				var state = this.sandbox.publish("GetHistoryState");
				var hash = state.hash;
				if (!hash.historyState) {
					this.openHomePage();
				} else if (hash.moduleName === "MainMenu") {
					this.replaceHomePage();
				}
			},

			/**
			 * Открывает домашнюю страницу.
			 * @protected
			 * @virtual
			 */
			openHomePage: function() {
				var hash = this.getHomePagePath();
				this.sandbox.publish("PushHistoryState", {hash: hash});
			},

			/**
			 * Заменяет текущую страницу домашней.
			 * @private
			 */
			replaceHomePage: function() {
				var hash = this.getHomePagePath();
				this.sandbox.publish("ReplaceHistoryState", {hash: hash});
			},

			/**
			 * Возвращает путь к домашней странице.
			 * @protected
			 * @virtual
			 * @return {String} Путь к домашней странице.
			 */
			getHomePagePath: function() {
				var module = this.Terrasoft.configuration.ModuleStructure[this.homeModule];
				return module ? this.Terrasoft.combinePath(module.sectionModule, module.sectionSchema) :
					this.getHomeModulePath();
			},

			/**
			 * Возвращает путь к стартовому модулю.
			 * @protected
			 * @virtual
			 * @return {String} Путь к стартовому модулю.
			 */
			getHomeModulePath: function() {
				return this.homeModule;
			}
		});

		return Terrasoft.BaseViewModule;

	});