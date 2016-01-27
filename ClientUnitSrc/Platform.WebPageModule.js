define("WebPageModule", ["WebPageModuleResources", "BaseNestedModule"],
		function(resources) {
		/**
		 * @class Terrasoft.configuration.WebPageViewConfig
		 * Класс генерурующий конфигурацию представления модуля Web-страницы.
		 */
		Ext.define("Terrasoft.configuration.WebPageViewConfig", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.WebPageViewConfig",

			/**
			 * Генерирует конфигурацию представления модуля Web-страницы.
			 * @protected
			 * @virtual
			 * @param {Object} config Объект конфигурации.
			 * @return {Object[]} Возвращает конфигурацию представления модуля Web-страницы.
			 */
			generate: function(config) {
				var id = Terrasoft.Component.generateId();
				var iframeHtml = this.getIframeParams(config, id);
				var result = {
					"name": id,
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {
						wrapClassName: ["WebPage-module-wraper"]
					},
					"items": [
						{
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"html": iframeHtml,
							"selectors": {
								"wrapEl": "#" + id + "Container"
							}
						}
					]
				};
				return result;
			},

			/**
			 * Возвращает параметры iframe.
			 * @private
			 * @param {Object} config Объект конфигурации.
			 * @param {String} id Идентификатор контейнера iframe.
			 * @return {Object} Параметры iframe.
			 */
			getIframeParams: function(config, id) {
				var iframeStyle = config.style ? "style='" + Terrasoft.utils.common.encodeHtml(config.style) + "'" : "";
				var encodedUrl = Terrasoft.utils.common.encodeHtml(config.url);
				var iframeHtml = "";
				if (!Ext.isEmpty(config.url)) {
					iframeHtml = "<iframe id = '" + id + "-webpage-widget' " +
						"class = 'webpage-widget' src='" + encodedUrl +
						"' width='100%' height='100%' " + iframeStyle +
						" ></iframe>";
				}
				return iframeHtml;
			}
		});

		Ext.define("Terrasoft.configuration.WebPageViewModel", {
			extend: "Terrasoft.BaseModel",
			alternateClassName: "Terrasoft.WebPageViewModel",
			Ext: null,
			sandbox: null,
			Terrasoft: null,

			onRender: Ext.emptyFn,

			/**
			 * Создает экземпляр модели
			 * @overridden
			 */
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
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @overridden
			 * @param {Function} callback Функция, которая будет вызвана по завершению
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback
			 */
			init: function(callback, scope) {
				callback.call(scope);
			}
		});

		Ext.define("Terrasoft.configuration.WebPageModule", {
			extend: "Terrasoft.BaseNestedModule",
			alternateClassName: "Terrasoft.WebPageModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,
			showMask: true,

			/**
			 * Имя класса модели представления для модуля Web-страницы.
			 * @type {String}
			 */
			viewModelClassName: "Terrasoft.WebPageViewModel",

			/**
			 * Имя класа генератога конфигурации представления модуля Web-страницы.
			 * @type {String}
			 */
			viewConfigClassName: "Terrasoft.WebPageViewConfig",

			/**
			 * Имя класа генератора представления.
			 * @type {String}
			 */
			viewGeneratorClass: "Terrasoft.ViewGenerator",

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewConfig
			 * @protected
			 * @overridden
			 * @param {Function} callback Функция, которая будет вызвана по завершению
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback
			 */
			initViewConfig: function(callback, scope) {
				var generatorConfig = Terrasoft.deepClone(this.moduleConfig);
				generatorConfig.viewModelClass = this.viewModelClass;
				this.buildView(generatorConfig, function(view) {
					this.viewConfig = view[0];
					callback.call(scope);
				}, this);

			},

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @overridden
			 */
			init: function() {
				if (!this.viewModel) {
					this.initConfig();
					this.subscribeMessages();
				}
				this.callParent(arguments);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewModelClass
			 * @protected
			 * @overridden
			 * @param {Function} callback Функция, которая будет вызвана по завершению
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback
			 */
			initViewModelClass: function(callback, scope) {
				this.viewModelClass = Ext.ClassManager.get(this.viewModelClassName);
				callback.call(scope);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#getViewModelConfig
			 * @protected
			 * @overridden
			 * @return {Object} Возвращает параметры для сознания модели представления модуля.
			 */
			getViewModelConfig: function() {
				var config = this.callParent(arguments);
				config.values = this.moduleConfig;
				return config;
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
					viewConfig: [viewClass.generate(config)]
				};
				var viewConfig = Ext.apply({
					schema: schema
				}, config);
				viewGenerator.generate(viewConfig, callback, scope);
			},

			/**
			 * Инициализирует объект конфигурации модуля.
			 * @protected
			 * @virtual
			 */
			initConfig: function() {
				var sandbox = this.sandbox;
				this.moduleConfig = sandbox.publish("GetWebPageConfig", null, [sandbox.id]);
			},

			/**
			 * Подписывается на сообщения родительского модуля.
			 * @protected
			 * @virtual
			 */
			subscribeMessages: function() {
				var sandbox = this.sandbox;
				sandbox.subscribe("GenerateWebPage", this.onGenerateWebPage, this, [sandbox.id]);
			},

			/**
			 * Метод обработки сообщения генерации web-страницы.
			 * @protected
			 * @virtual
			 */
			onGenerateWebPage: function() {
				var viewModel = this.viewModel;
				this.initConfig();
				viewModel.loadFromColumnValues(this.moduleConfig);
				var view = this.view;
				if (view && !view.destroyed) {
					view.destroy();
				}
				this.initViewConfig(function() {
					var renderTo = Ext.get(viewModel.renderTo);
					if (renderTo) {
						this.render(renderTo);
					}
				}, this);
			}
		});
		return Terrasoft.WebPageModule;
	});
