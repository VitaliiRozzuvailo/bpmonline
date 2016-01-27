define("RelationshipDiagramModule", ["terrasoft", "ext-base", "ej-diagram", "RelationshipDiagramModuleResources",
		"BaseNestedModule", "RelationshipDiagramViewModel", "RelationshipDiagram"
	],
	function(Terrasoft, Ext) {

		/**
		 * @class Terrasoft.configuration.RelationshipDiagramViewConfig
		 * Класс генерирующий конфигурацию представления модуля взаимосвязей.
		 */
		Ext.define("Terrasoft.configuration.RelationshipDiagramViewConfig", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.RelationshipDiagramViewConfig",

			/**
			 * Генерирует конфигурацию представления модуля взаимосвязей.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает конфигурацию представления модуля взаимосвязей.
			 */
			generate: function() {
				return {
					className: "Terrasoft.RelationshipDiagram",
					id: "relationship-diagram",
					itemType: Terrasoft.ViewItemType.MODULE,
					classes: {
						wrapClassName: ["diagram"]
					},
					items: {
						bindTo: "Nodes"
					}
				};
			}
		});

		/**
		 * @class Terrasoft.configuration.RelationshipDiagramModule
		 * Класс визуального модуля взаимосвязей.
		 */
		Ext.define("Terrasoft.configuration.RelationshipDiagramModule", {
			extend: "Terrasoft.BaseNestedModule",
			alternateClassName: "Terrasoft.RelationshipDiagramModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,
			showMask: true,
			/**
			 * Имя класса модели представления для модуля.
			 * @type {String}
			 */
			viewModelClassName: "Terrasoft.RelationshipDiagramViewModel",

			/**
			 * Имя класа генератога конфигурации представления модуля.
			 * @type {String}
			 */
			viewConfigClassName: "Terrasoft.RelationshipDiagramViewConfig",

			/**
			 * Имя класа генератога представления.
			 * @type {String}
			 */
			viewGeneratorClass: "Terrasoft.ViewGenerator",

			/**
			 * Событие обновления модуля взаимосвязей.
			 * @protected
			 * @virtual
			 * param {Object} config Конфигурация настроек для обновления модуля взаимосвязей.
			 * @param {String} config.renderTo Имя контейнера для рендеринга.
			 * @return {boolean} Возвращает true.
			 */
			onReloadRelationshipDiagram: function(config) {
				var viewModel = this.viewModel;
				if (viewModel) {
					var renderTo = config.renderTo ? Ext.get(config.renderTo) : this.renderToId;
					var view = this.view;
					if (view && !view.destroyed) {
						view.destroy();
					}
					this.view = view = null;
					this.initConfig();
					if (viewModel && !viewModel.destroyed) {
						viewModel.destroy();
					}
					this.viewModel = viewModel = null;
					this.initViewModelClass(function() {
						if (this.destroyed) {
							return;
						}
						this.initViewConfig(function() {
							if (this.destroyed) {
								return;
							}
							viewModel = this.viewModel = this.createViewModel();
							viewModel.init(function() {
								if (!this.destroyed && renderTo) {
									this.render(renderTo);
								}
							}, this);
						}, this);
					}, this);

					return true;
				}
			},

			/**
			 * @inheritDoc Terrasoft.BaseNestedModule#initViewConfig
			 * @overridden
			 */
			initViewConfig: function(callback, scope) {
				var generatorConfig = Terrasoft.deepClone(this.moduleConfig);
				generatorConfig.viewModelClass = this.viewModelClass;
				this.buildView(generatorConfig, function(view) {
					view[0].items = {
						bindTo: "Nodes"
					};
					this.viewConfig = view[0];
					callback.call(scope);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.BaseNestedModule#init
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
			 * @inheritDoc Terrasoft.BaseNestedModule#initViewModelClass
			 * @overridden
			 */
			initViewModelClass: function(callback, scope) {
				this.viewModelClass = Ext.ClassManager.get(this.viewModelClassName);
				callback.call(scope);
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
			 * @inheritdoc Terrasoft.BaseNestedModule#createViewModel
			 * @overridden
			 */
			createViewModel: function() {
				var viewModel = this.callParent(arguments);
				viewModel.set("AccountId", this.moduleConfig.accountId);
				return viewModel;
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
				this.moduleConfig = {};
				var sandbox = this.sandbox;
				var moduleConfig = sandbox.publish("GetRelationshipDiagramInfo", null, [sandbox.id]);
				if (!this.Ext.isEmpty(moduleConfig)) {
					this.moduleConfig = moduleConfig;
				}
			},

			/**
			 * Подписывается на сообщения.
			 * @protected
			 * @virtual
			 */
			subscribeMessages: function() {
				var sandbox = this.sandbox;
				sandbox.subscribe("ReloadRelationshipDiagram", this.onReloadRelationshipDiagram, this, [sandbox.id]);
			}

		});

		return Terrasoft.RelationshipDiagramModule;
	}
);