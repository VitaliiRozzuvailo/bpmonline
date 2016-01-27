define("ViewModelSchemaDesignerModule", ["MaskHelper", "BaseSchemaModuleV2", "ViewModelSchemaDesignerBuilder"],
		function(MaskHelper) {
	/**
	 * @class Terrasoft.configuration.ViewModelSchemaDesignerModule
	 * Класс модуля дизайнера клиентских схем.
	 */
	Ext.define("Terrasoft.configuration.ViewModelSchemaDesignerModule", {
		extend: "Terrasoft.BaseSchemaModule",
		alternateClassName: "Terrasoft.ViewModelSchemaDesignerModule",

		/**
		 * Настраиваемое представление.
		 * @type {Terrasoft.Component}
		 */
		designerView: null,

		/**
		 * Объект конфигурации модуля.
		 * @type {Object}
		 */
		moduleConfig: null,

		/**
		 * Инициализует конфигурацию модуля клиентской схемой и схемой сущности.
		 * @protected
		 * @virtual
		 * @param {Function} callback Функция, которая будет вызвана по завершению.
		 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
		 */
		initModuleConfig: function(callback, scope) {
			MaskHelper.ShowBodyMask();
			var sandbox = this.sandbox;
			sandbox.subscribe("GetModuleConfigResult", function(moduleConfig) {
				this.moduleConfig = moduleConfig;
				var clientUnitSchema = moduleConfig.clientUnitSchema;
				var clientUnitSchemaName = clientUnitSchema.name;
				Terrasoft.require([clientUnitSchemaName], function() {
					callback.call(scope);
				}, this);
			}, this, [sandbox.id]);
			sandbox.publish("GetModuleConfig", null, [sandbox.id]);
		},

		/**
		 * Инициализация состояние, названия схемы, генерирует класс модели представления и представление
		 * После этого создает и инициализирует экземпляр представления.
		 * @virtual
		 * @overridden
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова callback-функции.
		 */
		init: function(callback, scope) {
			if (!this.moduleConfig) {
				this.initModuleConfig(function() {
					this.init(callback, scope);
				}, this);
				return;
			}
			this.callParent(arguments);
		},

		/**
		 * Инициализирует название схемы.
		 * @protected
		 * @virtual
		 */
		initSchemaName: function() {
			if (this.moduleConfig && this.moduleConfig.clientUnitSchema) {
				this.schemaName = this.moduleConfig.clientUnitSchema.getSchemaDefinitionName();
			} else {
				this.callParent(arguments);
			}
		},

		/**
		 * Валидирует клиентскую схему с которой инициализировали модуль.
		 * @protected
		 * @virtual
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Область видимости.
		 */
		validateClientUnitSchema: function(callback, scope) {
			var result = {success: true};
			if (this.moduleConfig && this.moduleConfig.clientUnitSchema) {
				var clientUnitSchema = this.moduleConfig.clientUnitSchema;
				result = clientUnitSchema.validateSchema(callback, scope);
				return;
			}
			callback.call(scope, result);
		},

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#generateSchemaStructure
		 * @protected
		 * @overridden
		 */
		generateSchemaStructure: function(callback, scope) {
			this.schemaBuilder = this.Ext.create("Terrasoft.ViewModelSchemaDesignerBuilder");
			var config = {
				schemaName: this.schemaName,
				entitySchemaName: this.entitySchemaName,
				profileKey: this.getProfileKey()
			};
			this.validateClientUnitSchema(function(validationResult) {
				if (!validationResult.success) {
					Ext.apply(config, {
						isValid: validationResult.success,
						message: validationResult.message
					});
				}
				this.schemaBuilder.build(config, function(viewModelClass, viewConfig) {
					callback.call(scope, viewModelClass, viewConfig);
				}, this);
			}, this);
		},

		/**
		 * Обновляет текущее представление в соответствии с набором операций.
		 * @param {Object[]} operation Набор операций.
		 * @param {Function} callback Функция, которая будет вызвана по завершению.
		 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
		 */
		updateView: function(operation, callback, scope) {
			this.schemaBuilder = this.Ext.create("Terrasoft.ViewModelSchemaDesignerBuilder");
			var schema = this.viewModel.get("SchemaView");
			var schemaViewContainer = this.viewModel.get("SchemaViewContainer");
			var renderTo = Ext.get(schemaViewContainer);
			if (!renderTo) {
				if (callback) {
					callback.call(scope);
				}
				return;
			}
			if (!Ext.isEmpty(operation)) {
				var diff = Ext.isArray(operation) ? operation : [operation];
				schema = this.schemaBuilder.applyViewDiff(schema, diff);
				this.viewModel.set("SchemaView", schema);
			}
			var config = {
				schema: {viewConfig: schema},
				viewModelClass: this.viewModelClass
			};
			this.schemaBuilder.viewGenerator = this.schemaBuilder.createDesignViewGenerator();
			this.schemaBuilder.generateView(config, function(viewConfig) {
				var view = this.designerView;
				if (view && !view.destroyed) {
					view.destroy();
					view = null;
				}
				view = this.designerView = this.Ext.create("Terrasoft.Container", viewConfig[0]);
				view.bind(this.viewModel);
				var renderTo = Ext.get(schemaViewContainer);
				view.render(renderTo);
				if (callback) {
					callback.call(scope);
				}
			}, this);
		},

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#render
		 * @protected
		 * @overridden
		 */
		render: function() {
			this.callParent(arguments);
			this.updateView();
			MaskHelper.HideBodyMask();
		},

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#createViewModel
		 * @protected
		 * @overridden
		 */
		createViewModel: function() {
			var viewModel = this.callParent(arguments);
			viewModel.updateView = this.updateView.bind(this);
			return viewModel;
		}

	});
	return Terrasoft.ViewModelSchemaDesignerModule;
});
