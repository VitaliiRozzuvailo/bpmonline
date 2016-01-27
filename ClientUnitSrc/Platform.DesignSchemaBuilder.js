define("DesignSchemaBuilder", ["SectionDesignDataModule", "SchemaBuilderV2", "ext-base", "terrasoft",
	"DesignViewGeneratorV2"],
	function(SectionDesignDataModule) {
		var schemaBuilder = Ext.define("Terrasoft.configuration.DesignSchemaBuilder", {
			extend: "Terrasoft.SchemaBuilder",
			alternateClassName: "Terrasoft.DesignSchemaBuilder",

			/**
			 * Ссылка на модуль данных дизайнера
			 * @private
			 * @type {Object}
			 */
			sectionDesignDataModule: SectionDesignDataModule,

			createViewGenerator: function() {
				return Ext.create("Terrasoft.DesignViewGenerator");
			},

			/**
			 * Возвращает дизайн информацию схемы
			 * @private
			 * @param {String} schemaName Имя схемы
			 * @param {Function} callback Функция обратного вызова
			 */
			getDesignSchemaData: function(schemaName, callback, scope) {
				var callConfig = {
					name: schemaName,
					callback: function(schema) {
						callback.call(scope, schema);
					},
					scope: this
				};
				this.sectionDesignDataModule.getClientUnitSchemaByName(callConfig);
			},

			/**
			 * Возвращает через функцию обратного вызова схему
			 * @overriden
			 * @param {String} schemaName Имя схемы
			 * @param {Function} callback Функция обратного вызова
			 */
			getSchema: function(schemaName, callback, scope, isParent) {
				if (isParent) {
					this.callParent(arguments);
				} else {
					this.getDesignSchemaData(schemaName, function(schemaDesignData) {
						callback.call(scope, schemaDesignData.schema);
					}, this);
				}
			},

			/**
			 * Возвращает через функцию обратного вызова структуру схемы
			 * @overriden
			 * @param {String} schemaName Имя схемы
			 * @param {Function} callback Функция обратного вызова
			 */
			getSchemaStructure: function(schemaName, callback, scope, isParent) {
				if (isParent) {
					this.callParent(arguments);
				} else {
					this.getDesignSchemaData(schemaName, function(schemaDesignData) {
						callback.call(scope, schemaDesignData.structure);
					}, this);
				}
			},

			/**
			 * Возвращает через функцию обратного вызова ресурсы схемы
			 * @overriden
			 * @param {String} schemaName Имя схемы
			 * @param {Function} callback Функция обратного вызова
			 */
			getSchemaResources: function(schemaName, callback, scope, isParent) {
				if (isParent) {
					this.callParent(arguments);
				} else {
					this.getDesignSchemaData(schemaName, function(schemaDesignData) {
						callback.call(scope, schemaDesignData.resources);
					}, this);
				}
			},

			/**
			 * Возвращает через функцию обратного вызова entity схему
			 * @overriden
			 * @param {String} entitySchemaName Имя entity схемы
			 * @param {Function} callback Функция обратного вызова
			 */
			getEntitySchema: function(entitySchemaName, callback, scope) {
				if (entitySchemaName) {
					var callConfig = {
						name: entitySchemaName,
						callback: function(schema) {
							callback.call(scope, schema);
						},
						scope: this
					};
					this.sectionDesignDataModule.getEntitySchemaByName(callConfig);
				} else {
					callback.call(scope, null);
				}
			},

			/**
			 * @inheritdoc Terrasoft.SchemaBuilder#requireAllSchemaHierarchy
			 * @overridden
			 * Метод кэширует иерархию схем.
			 */
			requireAllSchemaHierarchy: function(config, callback, scope) {
				this.callParent([config, function(schemaHierarchy) {
					this.schemaHierarchy = schemaHierarchy;
					callback.call(scope, schemaHierarchy);
				}, this]);
			},

			/**
			 * @inheritdoc Terrasoft.SchemaBuilder#generateViewConfig
			 * @overridden
			 * Метод генерирует представление только для тех схем, для которых генерация еше не выполнялась.
			 */
			generateViewConfig: function(schema, hierarchy) {
				if (Ext.isEmpty(schema.viewConfig)) {
					this.callParent(arguments);
				}
			},

			/**
			 * Перегенерирует представление и модель представления схемы по переданной схеме. При генерации
			 * используется закэшированная иерархия схем.
			 * @param {Object} schema Схема, для которой необходимо выполнить перегенерацию.
			 * @param {String} selectedItem Имя выбранного элемента схемы.
			 * @param {Function} callback Функция обратного вызова
			 * @param {Object} scope Контекст вызова callback-функции
			 */
			reBuild: function(schema, selectedItem, callback, scope) {
				var schemaName = schema.schemaName;
				var schemaHierarchy = this.schemaHierarchy;
				schemaHierarchy.pop();
				schemaHierarchy.push(schema);
				Terrasoft.chain(
					function(next) {
						this.getSchemaResources(schemaName, function(resources) {
							schema.resources = resources;
							next();
						});
					},
					function(next) {
						var entitySchemaName = schema.entitySchemaName;
						this.getEntitySchema(entitySchemaName, function(entitySchema) {
							schema.entitySchema = entitySchema;
							next();
						});
					},
					function() {
						var generatorConfig = {
							schema: schema,
							schemaName: schemaName,
							hierarchy: schemaHierarchy,
							useCache: false,
							viewGeneratorConfig: {
								selectedItemName: selectedItem
							}
						};
						this.buildSchema(generatorConfig, callback, scope);
					},
					this
				);
			}

		});

		return Ext.create(schemaBuilder);
	}
);