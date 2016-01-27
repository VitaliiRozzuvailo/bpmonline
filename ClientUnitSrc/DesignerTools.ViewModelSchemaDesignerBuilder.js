define("ViewModelSchemaDesignerBuilder", ["ViewModelSchemaDesignerViewModelGenerator", "SchemaBuilderV2",
		"ViewModelSchemaDesignerViewGenerator", "ViewModelSchemaValidationMixin"],
	function() {
		/**
		 * @class Terrasoft.configuration.ViewModelSchemaDesignerBuilder
		 * Класс, генерирующий представление и модель представления для модуля дизайнера клиентской схемы.
		 */
		var schemaGenerator = Ext.define("Terrasoft.configuration.ViewModelSchemaDesignerBuilder", {
			extend: "Terrasoft.SchemaBuilder",
			alternateClassName: "Terrasoft.ViewModelSchemaDesignerBuilder",

			mixins: {
				ViewModelSchemaValidationMixin: "Terrasoft.ViewModelSchemaValidationMixin"
			},

			/**
			 * Имя схемы дизайнера.
			 * @private
			 * @type {String}
			 */
			designerSchemaName: "ViewModelSchemaDesignerSchema",

			/**
			 * Получает всю цепочку наследования схем, дополняя их цепочкой схем дизайнера.
			 * @overridden
			 * @protected
			 * @param {Object} config
			 * @param {String} config.schemaName Название схемы.
			 * @param {Object} config.hierarchyStackИерархия наследования схем.
			 * @param {Boolean} config.isDesignSchema Признак, указывающий на то, что схема - схемы дизайнера.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Область видимости.
			 */
			requireAllSchemaHierarchy: function(config, callback, scope) {
				if (config.isDesignSchema || !Ext.isEmpty(config.hierarchyStack)) {
					this.callParent(arguments);
					return;
				}
				this.callParent([config, function(hierarchy) {
					var designSchemaConfig = {
						schemaName: this.designerSchemaName,
						profileKey: config.profileKey,
						hierarchyStack: [],
						isParent: false,
						isDesignSchema: true
					};
					this.requireAllSchemaHierarchy(designSchemaConfig, function(designHierarhy) {
						var firstSchema = hierarchy[hierarchy.length - 1];
						Terrasoft.each(designHierarhy, function(designSchema) {
							designSchema.isDesignSchema = true;
							designSchema.schemaName += firstSchema.schemaName;
						}, this);
						var lastDesignSchema = designHierarhy[0];
						var firstDesignSchema = designHierarhy[designHierarhy.length - 1];
						firstDesignSchema.type = Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA;
						firstDesignSchema.designedSchemaUId = firstSchema.schemaUId;
						var schemaAttributes = lastDesignSchema.attributes || (lastDesignSchema.attributes = {});
						Ext.apply(schemaAttributes, {
							designerClientUnitSchemaUId: {
								type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
								value: firstSchema.schemaUId
							}
						});
						hierarchy = hierarchy.concat(designHierarhy);
						callback.call(scope, hierarchy);
					}, this);
				}, this]);
			},

			/**
			 * @inheritdoc Terrasoft.SchemaBuilder#generateViewConfig
			 * @protected
			 * @overridden
			 */
			generateViewConfig: function(schema) {
				if (Ext.isEmpty(schema.viewConfig)) {
					this.callParent(arguments);
				}
			},

			/**
			 * Генерирует конфигурацию представления информации об ошибке в схеме.
			 * @protected
			 * @virtual
			 * @param {Object} schema Схема, для которой генерируется представление.
			 * @param {Object[]} hierarchy Иерархия схем.
			 */
			generateInfoViewConfig: function(schema, hierarchy) {
				var viewConfig = [];
				Terrasoft.each(hierarchy, function(schema) {
					viewConfig = this.applyViewDiff(viewConfig, schema.infoDiff);
				}, this);
				schema.viewConfig = viewConfig;
			},

			/**
			 * Генерирует конфигурацию представления настраиваемой схемы для валидации.
			 * @protected
			 * @virtual
			 * @param {Object} schema Схема, для которой генерируется представление.
			 * @param {Object[]} hierarchy Иерархия схем.
			 */
			generateBaseSchemaViewConfig: function(schema, hierarchy) {
				var viewConfig = [];
				Terrasoft.each(hierarchy, function(schema) {
					if (!schema.isDesignSchema) {
						viewConfig = this.applyViewDiff(viewConfig, schema.diff);
					}
				}, this);
				schema.viewConfig = viewConfig;
			},

			/**
			 * Генерирует представление схемы. Производит валидацию клиентской схемы.
			 * @override
			 * @param {Object} config Объект конфигурации.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Область видимости.
			 */
			buildSchema: function(config, callback, scope) {
				var schema = config.schema;
				var hierarchy = config.hierarchy;
				if (!Ext.isEmpty(config.isValid)) {
					schema.attributes.GenerationValid = {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						value: config.isValid
					};
					if (!config.isValid) {
						this.generateInfoViewConfig(schema, hierarchy);
						schema.attributes.GenerationInfoMessage = {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							value: config.message
						};
					}
					this.callParent(arguments);
				} else {
					var lastHierarchyElement = hierarchy[hierarchy.length - 1];
					schema = {
						type: lastHierarchyElement.type,
						viewConfig: []
					};
					this.generateBaseSchemaViewConfig(schema, hierarchy);
					this.validateSchema(schema, function(result) {
						config.isValid = result.success;
						config.message = result.message;
						this.buildSchema(config, callback, scope);
					}, this);
				}
			},

			/**
			 * Создает экземпляр класса Terrasoft.ViewGenerator
			 * @return {Terrasoft.ViewGenerator} Возвращает объект Terrasoft.ViewGenerator
			 */
			createDesignViewGenerator: function() {
				return Ext.create("Terrasoft.ViewModelSchemaDesignerViewGenerator");
			},

			/**
			 * Создает экземпляр класса Terrasoft.ViewModelGenerator
			 * @return {Terrasoft.ViewGenerator} Возвращает объект Terrasoft.ViewModelGenerator
			 */
			createViewModelGenerator: function() {
				return Ext.create("Terrasoft.ViewModelSchemaDesignerViewModelGenerator", {
					useCache: false
				});
			}

		});

		return Ext.create(schemaGenerator);

	});
