define("SystemDesignerTileModule", ["SystemDesignerTileModuleResources", "BaseNestedModule"],
	function(resources) {

	/**
	 * @class Terrasoft.configuration.SystemDesignerTileViewConfig
	 * Класс генерурующий конфигурацию представления модуля.
	 */
	Ext.define("Terrasoft.configuration.SystemDesignerTileViewConfig", {
		extend: "Terrasoft.BaseModel",
		alternateClassName: "Terrasoft.SystemDesignerTileViewConfig",

		/**
		 * Генерирует конфигурацию представления модуля плитки.
		 * @protected
		 * @virtual
		 * @param {Object} config Объект конфигурации.
		 * @param {String} config.style Стиль отображения.
		 * @return {Object[]} Возвращает конфигурацию представления модуля показателя.
		 */
		generate: function(config) {
			var style = config.style || "";
			var fontStyle = config.fontStyle || "";
			var wrapClassName = Ext.String.format("{0}", style);
			var id = Terrasoft.Component.generateId();
			var result = {
				"name": id,
				"itemType": Terrasoft.ViewItemType.CONTAINER,
				"classes": { wrapClassName: [wrapClassName, "system-designer-tile-module-wraper"] },
				"styles": {
					"width": "100%"
				},
				"items": [
					{
						"name": id + "-wrap",
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"styles": {
							"width": "100%"
						},
						"classes": { wrapClassName: ["system-designer-tile-wrap"] },
						"items": [
							{
								"name": "system-designer-tile-caption-" + id,
								"itemType": Terrasoft.ViewItemType.LABEL,
								"caption": { "bindTo": "caption" },
								"classes": { "labelClass": ["system-designer-tile-caption"] },
								"click": { "bindTo": "onClick"},
								"markerValue": { "bindTo": "caption" }
							},
							{
								"name": "system-designer-tile-hint-" + id,
								"itemType": Terrasoft.ViewItemType.LABEL,
								"caption": { "bindTo": "hint" },
								"classes": { "labelClass": ["system-designer-tile-hint " + fontStyle] }
							}
						]
					}
				]
			};
			return result;
		}

	});

	/**
	 * @class Terrasoft.configuration.SystemDesignerTileViewModel
	 * Класс модели представления модуля.
	 */
	Ext.define("Terrasoft.configuration.SystemDesignerTileViewModel", {
		extend: "Terrasoft.BaseModel",
		alternateClassName: "Terrasoft.SystemDesignerTileViewModel",
		Ext: null,
		sandbox: null,
		Terrasoft: null,

		/**
		 * Описание колонок модели.
		 * {Object}
		 */
		columns: {
			caption: {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				dataValueType: Terrasoft.DataValueType.Text,
				value: null
			},
			hint: {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				dataValueType: Terrasoft.DataValueType.Text,
				value: null
			}
		},

		/**
		 * @overridden
		 */
		onRender: Ext.emptyFn,

		/**
		 * Обработчик нажатия на заголовок.
		 * @virtual
		 */
		onClick: Ext.emptyFn,

		constructor: function() {
			this.callParent(arguments);
			this.initResourcesValues(resources);
		},

		/**
		 * Выполняет подготовку параметров показателя.
		 * @protected
		 * @virtual
		 * @param {Function} callback Функция, которая будет вызвана по завершению
		 * @param {Object} scope Контекст, в котором будет вызвана функция callback
		 */
		prepareTile: function(callback, scope) {
			if (callback) {
				callback.call(scope || this);
			}
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
		 * @virtual
		 * @param {Function} callback Функция, которая будет вызвана по завершению
		 * @param {Object} scope Контекст, в котором будет вызвана функция callback
		 */
		init: function(callback, scope) {
			var caption = this.get("Resources.Strings.Caption");
			var hint = this.get("Resources.Strings.Hint");
			if (caption) {
				this.set("caption", caption);
			}
			if (hint) {
				this.set("hint", hint);
			}
			if (callback) {
				callback.call(scope || this);
			}
		}

	});

	Ext.define("Terrasoft.configuration.SystemDesignerTileModule", {
		extend: "Terrasoft.BaseNestedModule",
		alternateClassName: "Terrasoft.SystemDesignerTileModule",

		Ext: null,
		sandbox: null,
		Terrasoft: null,
		showMask: true,

		/**
		 * Имя класса модели представления для модуля.
		 * @type {String}
		 */
		viewModelClassName: "Terrasoft.SystemDesignerTileViewModel",

		/**
		 * Имя класа генератога конфигурации представления модуля.
		 * @type {String}
		 */
		viewConfigClassName: "Terrasoft.SystemDesignerTileViewConfig",

		/**
		 * Имя класа генератога представления.
		 * @type {String}
		 */
		viewGeneratorClass: "Terrasoft.ViewGenerator",

		/**
		 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewConfig
		 * @overridden
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
		 * @inheritDoc Terrasoft.configuration.BaseNestedModule#init
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
		 * @overridden
		 */
		initViewModelClass: function(callback, scope) {
			if (this.moduleConfig.hasOwnProperty("requiredModule")) {
				var requiredModule = this.moduleConfig.requiredModule;
				this.sandbox.requireModuleDescriptors([ requiredModule], function() {
					Terrasoft.require([requiredModule, "css!" + requiredModule],
						function() {
							this.viewModelClass = Ext.ClassManager.get(this.viewModelClassName);
							callback.call(scope);
						}, this);
				}, this);
			} else {
				this.viewModelClass = Ext.ClassManager.get(this.viewModelClassName);
				callback.call(scope);
			}
		},

		/**
		 * @inheritDoc Terrasoft.configuration.BaseNestedModule#getViewModelConfig
		 * @overridden
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
			this.moduleConfig = sandbox.publish("GetSystemDesignerTileConfig", null, [sandbox.id]);
			this.viewModelClassName = this.moduleConfig.viewModelClassName || this.viewModelClassName;
			this.viewConfigClassName = this.moduleConfig.viewConfigClassName || this.viewConfigClassName;
		},

		/**
		 * Подписывается на сообщения родительского модуля.
		 * @protected
		 * @virtual
		 */
		subscribeMessages: function() {
			var sandbox = this.sandbox;
			sandbox.subscribe("GenerateSystemDesignerTile", this.onGenerateTile, this, [sandbox.id]);
		},

		/**
		 * Метод обработки сообщения генерации показателя.
		 * @protected
		 * @virtual
		 */
		onGenerateTile: function() {
			var viewModel = this.viewModel;
			this.initConfig();
			viewModel.loadFromColumnValues(this.moduleConfig);
			viewModel.prepareTile(function() {
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
			}, this);
		}
	});

	return Terrasoft.SystemDesignerTileModule;

});