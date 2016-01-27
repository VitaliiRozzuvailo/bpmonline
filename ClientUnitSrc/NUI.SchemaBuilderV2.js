define("SchemaBuilderV2", ["performancecountermanager", "ViewModelGeneratorV2", "ViewGeneratorV2",
		"ext-base", "terrasoft", "sandbox"],
	function(performanceManager) {

		// TODO: Логика определения какой класс генератора выбрать (при условии перекрытия генераторов)

		var schemaGenerator = Ext.define("Terrasoft.configuration.SchemaBuilder", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.SchemaBuilder",

			/**
			 * Ссылка на объект ядра.
			 * @private
			 * @type {Object}
			 */
			core: require("core"),

			/**
			 * Префикс ключа профиля.
			 * @private
			 * @type {String}
			 */
			profilePrefix: "profile!",

			/**
			 * Суффикс модуля структуры схемы.
			 * @private
			 * @type {String}
			 */
			structureSuffix: "Structure",

			/**
			 * Суффикс модуля ресурсов схемы.
			 * @private
			 * @type {String}
			 */
			resourcesSuffix: "Resources",

			/**
			 * Экземпляр {Terrasoft.ViewModelGenerator} для генерации модели представления.
			 * @private
			 * @type {Terrasoft.ViewModelGenerator}
			 */
			viewModelGenerator: null,

			/**
			 * Экземпляр {Terrasoft.ViewGenerator} для генерации преддставления.
			 * @private
			 * @type {Terrasoft.ViewGenerator}
			 */
			viewGenerator: null,

			/**
			 * Генерирует конфигурацию представления схемы.
			 * @param {Object} schema Схема, для которой генерируется представление.
			 * @param {String[]} hierarchy Иерархия схем.
			 */
			generateViewConfig: function(schema, hierarchy) {
				var viewConfig = [];
				Terrasoft.each(hierarchy, function(schema) {
					viewConfig = this.applyViewDiff(viewConfig, schema.diff);
				}, this);
				schema.viewConfig = viewConfig;
			},

			/**
			 * Применяет пакет разницы на представление родительской схемы.
			 * @protected
			 * @param {Object[]} parentView Конфигурация представления родительской схемы.
			 * @param {Object[]} diff Пакет разницы. Представляет собой массив операций модификации родительской схемы.
			 * @return {Object[]} Возвращает структуру представления с примененным пакетом разницы.
			 */
			applyViewDiff: function(parentView, diff) {
				return Terrasoft.JsonApplier.applyDiff(parentView, diff);
			},

			/**
			 * Применяет пакет разницы, настроенный в элементе БП, на представление родительской схемы.
			 * @param {Object} schema Схема.
			 * @param {Object[]} customDiff Пакет разницы. Представляет собой массив операций модификации родительской
			 * схемы.
			 */
			applyCustomDiff: function(schema, customDiff) {
				if (!customDiff) {
					return;
				}
				schema.viewConfig = Terrasoft.JsonApplier.applyDiff(schema.viewConfig, customDiff);
			},

			/**
			 * Получает имя схемы по ее UId.
			 * @private
			 * @param {String} schemaUId.
			 * @return {String} schemaName.
			 */
			getParentSchemaNameByUId: function(schemaUId) {
				var result = "";
				Terrasoft.each(this.core.schemaModules, function(uId, name) {
					if (uId === schemaUId) {
						result = name;
						return false;
					}
					return true;
				});
				return result;
			},

			/**
			 * Возвращает через функцию обратного вызова схему.
			 * @static
			 * @param {String} schemaName Имя схемы.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			getSchema: function(schemaName, callback, scope) {
				Terrasoft.require([schemaName], function(schema) {
					callback.call(scope, schema);
				}, this);
			},

			/**
			 * Возвращает через функцию обратного вызова структуру схемы.
			 * @static
			 * @param {String} schemaName Имя схемы.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			getSchemaStructure: function(schemaName, callback, scope) {
				Terrasoft.require([schemaName + this.structureSuffix], function(structure) {
					callback.call(scope, structure);
				}, this);
			},

			/**
			 * Возвращает через функцию обратного вызова ресурсы схемы.
			 * @static
			 * @param {String} schemaName Имя схемы.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			getSchemaResources: function(schemaName, callback, scope) {
				Terrasoft.require([schemaName + this.resourcesSuffix], function(resources) {
					callback.call(scope, resources);
				}, this);
			},

			/**
			 * Возвращает через функцию обратного вызова entity схему.
			 * @static
			 * @param {String} entitySchemaName Имя entity схемы.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			getEntitySchema: function(entitySchemaName, callback, scope) {
				Terrasoft.require([entitySchemaName], function(entitySchema) {
					callback.call(scope, entitySchema);
				}, this);
			},

			/**
			 * Возвращает через функцию обратного вызова проффиль.
			 * @static
			 * @param {String} profileKey Ключ профиля.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			getProfile: function(profileKey, callback, scope) {
				Terrasoft.require([this.profilePrefix + profileKey], function(profile) {
					callback.call(scope, profile);
				}, this);
			},

			/**
			 * Получает всю цепочку наследования схем.
			 * @private
			 * @param {Object} config
			 * @param {String} config.schemaName Название схемы.
			 * @param {Object} config.hierarchyStack Иерархия наследования схем.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Область видимости.
			 */
			requireAllSchemaHierarchy: function(config, callback, scope) {
				var schemaName = config.schemaName;
				var isParent = config.isParent;
				var profileKey = config.profileKey;
				var hierarchy = config.hierarchyStack || [];
				var customAttributes = config.customAttributes;
				var entitySchemaName = config.entitySchemaName;
				var schema;
				var schemaResponse = config.schemaResponse;
				Terrasoft.chain(
					function(next) {
						if (!schemaResponse) {
							this.getSchema(schemaName, function(schemaResponse) {
								next(schemaResponse);
							}, this, isParent);
						} else {
							next(schemaResponse);
						}
					},
					function(next, schemaResponse) {
						schema = schemaResponse;
						if (customAttributes) {
							if (!schema.initialAttributes) {
								schema.initialAttributes = Ext.apply({}, schema.attributes);
							}
							schema.attributes = {};
							Ext.apply(schema.attributes, schema.initialAttributes);
							Ext.apply(schema.attributes, customAttributes);
						}
						if (entitySchemaName) {
							schema.entitySchemaName = entitySchemaName;
						}
						next();
					},
					function(next) {
						this.getSchemaResources(schemaName, function(resources) {
							schema.resources = resources;
							next();
						}, this, isParent);
					},
					function(next) {
						entitySchemaName = (entitySchemaName) ? entitySchemaName : schema.entitySchemaName;
						this.getEntitySchema(entitySchemaName, function(entitySchema) {
							schema.entitySchema = entitySchema;
							next();
						}, this, isParent);
					},
					function(next) {
						this.getProfile(profileKey, function(profile) {
							schema.profile = profile;
							next();
						}, this, isParent);
					},
					function() {
						this.getSchemaStructure(schemaName, function(structure) {
							schema.extendParent = structure.extendParent;
							schema.parentSchemaUId = structure.parentSchemaUId;
							schema.schemaName = structure.schemaName;
							schema.schemaCaption = structure.schemaCaption;
							schema.schemaUId = structure.schemaUId;
							schema.type = structure.type;
							hierarchy.unshift(schema);
							var parentSchemaName = structure.parentSchemaName;
							if (parentSchemaName) {
								var config = {
									schemaName: parentSchemaName,
									profileKey: profileKey,
									hierarchyStack: hierarchy,
									isParent: true
								};
								scope.requireAllSchemaHierarchy(config, callback, scope);
							} else {
								callback.call(scope, hierarchy);
							}
						}, this, isParent);
					},
					this
				);
			},

			/**
			 * Генерирует представление схемы.
			 * @override
			 * @param {Object} config Объект конфигурации.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Область видимости.
			 */
			generateView: function(config, callback, scope) {
				this.viewGenerator.generate(config, function(viewConfig) {
					callback.call(scope, viewConfig);
				});
			},

			/**
			 * Генерирует модель представления схемы.
			 * @override
			 * @param {Object} config Объект конфигурации.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Область видимости.
			 */
			generateViewModel: function(config, callback, scope) {
				this.viewModelGenerator.generate(config, function(viewModelClass) {
					callback.call(scope, viewModelClass);
				});
			},

			/**
			 * Создает экземпляр класса Terrasoft.ViewGenerator.
			 * @return {Terrasoft.ViewGenerator} Возвращает объект Terrasoft.ViewGenerator.
			 */
			createViewGenerator: function() {
				return Ext.create("Terrasoft.ViewGenerator");
			},

			/**
			 * Создает экземпляр класса Terrasoft.ViewModelGenerator.
			 * @return {Terrasoft.ViewModelGenerator} Возвращает объект Terrasoft.ViewModelGenerator.
			 */
			createViewModelGenerator: function() {
				return Ext.create("Terrasoft.ViewModelGenerator");
			},

			/**
			 * Генерирует структуру схемы. В случае, когда данные по запрашиваемому конфигу находятся в кэше,
			 * возвращает закэшированный результат. Используется кэш уровня страницы.
			 * @param {Object} config Конфигурация сборки схемы.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			build: function(config, callback, scope) {
				var performanceManagerLabel = "";
				if (scope && scope.hasOwnProperty("sandbox")) {
					performanceManagerLabel = scope.sandbox.id;
				} else if (this && this.hasOwnProperty("sandbox")) {
					performanceManagerLabel = this.sandbox.id;
				}
				performanceManager.start(performanceManagerLabel + "_Build");
				var generatorConfig = Terrasoft.deepClone(config);
				generatorConfig.performanceManagerLabel = performanceManagerLabel;
				performanceManager.start(performanceManagerLabel + "_Build_requireAllSchemaHierarchy");
				if (config.useCache !== false) {
					if (generatorConfig.entitySchemaName) {
						if (!this.tryReturnCache(generatorConfig, callback, scope)) {
							this.buildSchemaHierarchy(generatorConfig, callback, scope);
						}
					} else {
						this.getSchema(config.schemaName, function(schemaResponse) {
							generatorConfig.entitySchemaName = schemaResponse.entitySchemaName;
							generatorConfig.schemaResponse = schemaResponse;
							if (!this.tryReturnCache(generatorConfig, callback, scope)) {
								this.buildSchemaHierarchy(generatorConfig, callback, scope);
							}
						}, this);
					}
				} else {
					this.buildSchemaHierarchy(generatorConfig, callback, scope);
				}
			},

			/**
			 * Ищет сохраненные данные в кэше. В случае, если данные найдены, завершает работу SchemaBuilder, вызывает
			 * функцию обратного вызова с найденными данными и возвращает true. Если данные не найдены,
			 * возвращает false.
			 * @param {Object} config Конфигурация сборки схемы.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 * @returns {Boolean} Результат поиска данных в кэше.
			 */
			tryReturnCache: function(config, callback, scope) {
				var result = false;
				var cacheItem = this.getCachedItem(config);
				if (cacheItem) {
					result = true;
					var performanceManagerLabel = config.performanceManagerLabel;
					performanceManager.stop(performanceManagerLabel + "_Build_requireAllSchemaHierarchy");
					performanceManager.start(performanceManagerLabel + "_Build_buildSchema");
					performanceManager.start(performanceManagerLabel + "_Build_buildSchema_generateViewModel");
					performanceManager.stop(performanceManagerLabel + "_Build_buildSchema_generateViewModel");
					performanceManager.start(performanceManagerLabel + "_Build_buildSchema_generateView");
					performanceManager.stop(performanceManagerLabel + "_Build_buildSchema_generateView");
					performanceManager.stop(performanceManagerLabel + "_Build_buildSchema");
					performanceManager.stop(performanceManagerLabel + "_Build");
					callback.call(scope, cacheItem.viewModelClass, cacheItem.view, cacheItem.schema);
				}
				return result;
			},

			/**
			 * Выполняет запрос всей цепочки наследования схемы и запускает процесс построения схемы
			 * (см. {@link #buildSchema}).
			 * @param {Object} config Конфигурация сборки схемы.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			buildSchemaHierarchy: function(config, callback, scope) {
				this.requireAllSchemaHierarchy(config, function(hierarchy) {
					var schema = hierarchy[hierarchy.length - 1];
					Ext.apply(config, {
						hierarchy: hierarchy,
						schema: schema
					});
					performanceManager.stop(config.performanceManagerLabel + "_Build_requireAllSchemaHierarchy");
					performanceManager.start(config.performanceManagerLabel + "_Build_buildSchema");
					this.buildSchema(config, callback, scope);
				}, this);
			},

			/**
			 * По конфигу запроса схемы вовзвращает ключ кеширования.
			 * @param {Object} config Конфигурация сборки схемы.
			 * @returns {String} Ключ кэша.
			 */
			getCacheItemKey: function(config) {
				return [config.schemaName, config.entitySchemaName, config.profileKey].join("_");
			},

			/**
			 * Возвращает закэшированный вариант схемы, представления и модели представления схемы. В кэше не храниться
			 * класс модели представления, вместо него сохраняется имя класса. При получении закэшировнных данных, в
			 * менеджере классов проверяется наличие класса. Если класс найден, он возвращается, иначе кэш сбрасывается
			 * и возвращается нулевой результат.
			 * @param {Object} config Конфигурация сборки схемы.
			 * @return {Object} Объект кэша.
			 */
			getCachedItem: function(config) {
				var cache = this.getCache();
				if (!cache) {
					return null;
				}
				var cacheKey = this.getCacheItemKey(config);
				var cacheItem = cache.getItem(cacheKey);
				if (cacheItem) {
					var item = Terrasoft.deepClone(cacheItem);
					var viewModelClass = Ext.ClassManager.get(item.viewModelClassName);
					if (viewModelClass) {
						item.viewModelClass = viewModelClass;
						return item;
					}
					cache.removeItem(cacheKey);
				}
				return null;
			},

			/**
			 * Сохраняет в кэш схему, представление и имя класса модели представления схемы.
			 * @param {Object} config Конфигурация сборки схемы.
			 * @param {Object} item Кэшируемый объект.
			 */
			addToCaсhe: function(config, item) {
				var cache = this.getCache();
				if (cache) {
					var cacheKey = this.getCacheItemKey(config);
					cache.setItem(cacheKey, item);
				}
			},

			/**
			 * Возвращает объект кэша уровня странцы (MemoryCache).
			 * @returns {Terrasoft.MemoryStore}
			 */
			getCache: function() {
				return Terrasoft.ClientPageSessionCache;
			},

			/**
			 * Выполняет построение схемы по иерархии наследования схем.
			 * @param {Object} config Конфигурация построения схемы.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			buildSchema: function(config, callback, scope) {
				var schema = config.schema;
				var hierarchy = config.hierarchy;
				this.viewModelGenerator = this.createViewModelGenerator();
				performanceManager.start(config.performanceManagerLabel + "_Build_buildSchema_generateViewModel");
				this.generateViewModel(config, function(viewModelClass) {
					this.generateViewConfig(schema, hierarchy);
					this.applyCustomDiff(schema, config.customDiff);
					var viewConfig = {
						schema: schema,
						viewModelClass: viewModelClass
					};
					if (config.viewGeneratorConfig) {
						Ext.apply(viewConfig, config.viewGeneratorConfig);
					}
					this.viewGenerator = this.createViewGenerator();
					performanceManager.stop(config.performanceManagerLabel + "_Build_buildSchema_generateViewModel");
					performanceManager.start(config.performanceManagerLabel + "_Build_buildSchema_generateView");
					this.generateView(viewConfig, function(view) {
						this.viewModelGenerator = null;
						this.viewGenerator = null;
						performanceManager.stop(config.performanceManagerLabel + "_Build_buildSchema_generateView");
						performanceManager.stop(config.performanceManagerLabel + "_Build_buildSchema");
						performanceManager.stop(config.performanceManagerLabel + "_Build");
						this.addToCaсhe(config, {
							view: Terrasoft.deepClone(view),
							//schema: Terrasoft.deepClone(schema),
							viewModelClassName: viewModelClass.$className
						});
						callback.call(scope, viewModelClass, view, schema);
					}, this);
				}, this);
			}

		});

		return Ext.create(schemaGenerator);

	});
