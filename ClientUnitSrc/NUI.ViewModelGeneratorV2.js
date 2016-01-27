define("ViewModelGeneratorV2", ["ext-base", "terrasoft", "ViewModelGeneratorV2Resources",
	"BaseSchemaViewModel", "BaseGeneratorV2"],
	function(Ext, Terrasoft, resources, BaseSchemaViewModel) {
	/**
	 * @class Terrasoft.configuration.ViewModelGenerator
	 * Класс, генерирующий модель представления
	 */
	var viewModelGenerator = Ext.define("Terrasoft.configuration.ViewModelGenerator", {
		alternateClassName: "Terrasoft.ViewModelGenerator",
		extend: "Terrasoft.BaseGenerator",

		/**
		 * Название глобального пространства имен
		 * @private
		 * @type {String}
		 */
		globalNamespace: "Terrasoft",

		/**
		 * Название пространства имен моделей
		 * @private
		 * @type {String}
		 */
		modelNamespace: "Terrasoft.model",

		/**
		 * Суффикс имени класса моделей представления
		 * @private
		 * @type {String}
		 */
		viewModelClassSuffix: "ViewModel",

		/**
		 * Суффикс названия колонки ресурсов
		 * @private
		 * @type {String}
		 */
		resourcesSuffix: "Resources",

		/**
		 * Суффикс имени класса моделей представления
		 * @private
		 * @type {String}
		 */
		lookupColumnListSuffix: "List",

		/**
		 * Объект типов ресурсов
		 * @private
		 * @type {Object}
		 */
		resourceType: {
			STRING: "Strings",
			IMAGE: "Images"
		},

		/**
		 * Название колонки профиля
		 * @private
		 * @type {String}
		 */
		profileColumnName: "Profile",

		/**
		 * Суффикс названия коллекции
		 * @private
		 * @type {String}
		 */
		collectionSuffix: "Collection",

		/**
		 * Имя базового класса моделей представления
		 * @private
		 * @type {String}
		 */
		baseViewModelClass: BaseSchemaViewModel,

		/**
		 * Признак, отвечающий за кеширование класов при создании
		 * @protected
		 * @virtual
		 * @type {Boolean}
		 */
		useCache: true,

		/**
		 * Применяет пакет разницы на представление родительской схемы
		 * @protected
		 * @virtual
		 * @param {Object[]} parentView Конфигурация представления родительской схемы
		 * @param {Object[]} diff Пакет разницы. Представляет собой массив операций модификации родительской схемы
		 * @return {Object[]} Возвращает структуру представления с примененным пакетом разницы
		 */
		applyViewDiff: function(parentView, diff) {
			return Terrasoft.JsonApplier.applyDiff(parentView, diff);
		},

		/**
		 * Генерирует все классы представления заданной иерархии схем и возвращает класс последней схемы в иерархии
		 * @private
		 * @param {Object[]} hierarchy Иерархия схем
		 * @return {Object} Возвращает родительский класс
		 */
		generateSchemaClass: function(hierarchy) {
			var parentClass = this.baseViewModelClass;
			var viewConfig = [];
			Terrasoft.each(hierarchy, function(schema) {
				viewConfig = this.applyViewDiff(viewConfig, schema.diff);
				parentClass = this.generateClass(parentClass, schema, viewConfig);
			}, this);
			return parentClass;
		},

		/**
		 * Генерирует класс иерархии
		 * @private
		 * @param {Object} parentClass Родительский класс
		 * @param {Object} schema Схема генерации класса
		 * @param {Object} viewConfig Конфигурационный объект представления схемы
		 * @return {Object} Возвращает созданный класс
		 */
		generateClass: function(parentClass, schema, viewConfig) {
			var parentClassPrototype = parentClass.prototype;
			var entitySchemaName = schema.entitySchemaName || parentClassPrototype.entitySchemaName || "";
			var className = schema.schemaName + entitySchemaName + this.viewModelClassSuffix;
			var fullClassName = this.modelNamespace + "." + className;
			var definedClass = Ext.ClassManager.get(fullClassName);
			if (definedClass && this.useCache) {
				return definedClass;
			}
			var alternateClassName = this.globalNamespace + "." + className;
			var classConfig = {
				extend: parentClassPrototype.alternateClassName,
				alternateClassName: alternateClassName,
				mixins: schema.mixins,
				uId: schema.schemaUId,
				name: schema.schemaName,
				entitySchemaName: entitySchemaName,
				type: schema.type,
				Ext: null,
				Terrasoft: null,
				sandbox: null,
				columns: {},
				rules: {},
				details: {},
				messages: {},
				resources: {}
			};
			this.applyMethods(classConfig, schema.methods);
			this.initEntitySchema(classConfig, entitySchemaName);
			this.applyParentColumns(classConfig.columns, parentClassPrototype.columns);
			this.applyEntitySchemaColumns(classConfig.columns, schema.entitySchema);
			this.applySchemaAttributes(classConfig.columns, schema.attributes);
			this.applyProfile(classConfig, schema.profile);
			this.applyParentMessages(classConfig.messages, parentClassPrototype.messages);
			this.applyMessages(classConfig.messages, schema.messages);
			if (schema.type === Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA) {
				this.applySchemaBusinessRules(classConfig.rules, parentClassPrototype.rules, schema.rules);
				this.applySchemaDetails(classConfig.details, parentClassPrototype.details, schema.details);
			}
			this.applyResources(classConfig.columns, schema.resources);
			this.addViewColumns(classConfig.columns, viewConfig);
			this.applyUserCode(classConfig, schema.userCode);
			return Ext.define(fullClassName, classConfig);
		},

		/**
		 * Добавляет колонку профиля в схему генерируемого класса
		 * @protected
		 * @virtual
		 * @param {Object} config Конфигурационный объект класса
		 * @param {Object} profile Профиль
		 */
		applyProfile: function(config, profile) {
			var  profileColumnName = this.profileColumnName;
			config.columns[profileColumnName] = {
				name: profileColumnName,
				value: profile,
				dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			};
		},

		/**
		 * Применяет сообщения родительского класса к сообщениям схемы генерируемого класса
		 * @protected
		 * @virtual
		 * @param {Object} messagesConfig Сообщения схемы генерируемого класса
		 * @param {Object} parentMessages Сообщения родительского класса
		 */
		applyParentMessages: function(messagesConfig, parentMessages) {
			this.applyMessages(messagesConfig, parentMessages);
		},

		/**
		 * Применяет сообщения схемы к сообщениям схемы генерируемого класса
		 * @protected
		 * @virtual
		 * @param {Object} messagesConfig Сообщения схемы генерируемого класса
		 * @param {Object} schemaMessages Сообщения схемы
		 */
		applyMessages: function(messagesConfig, schemaMessages) {
			Terrasoft.each(schemaMessages, function(schemaMessage, messageName) {
				var message = messagesConfig[messageName];
				if (message) {
					Ext.apply(message, schemaMessage);
				} else {
					messagesConfig[messageName] = Terrasoft.deepClone(schemaMessage);
				}
			}, this);
		},

		/**
		 * Применяет мотоды схемы к схеме генерируемого класса
		 * @param {Object} config Конфигурационный объект класса
		 * @param {Object} methods Методы схемы
		 */
		applyMethods: function(config, methods) {
			Ext.apply(config, Terrasoft.deepClone(methods));
		},

		/**
		 * Инициализирует схему сущности
		 * @protected
		 * @virtual
		 * @throws {Terrasoft.ItemNotFoundException}
		 * Если объект не найден генерируется исключение.
		 * @param {Object} classConfig Конфигурационный объект класса
		 * @param {String} entitySchemaName Название схемы сущности
		 */
		initEntitySchema: function(classConfig, entitySchemaName) {
			if (Ext.isEmpty(entitySchemaName)) {
				return;
			}
			var entitySchemaClassName = this.globalNamespace + "." + entitySchemaName;
			var entitySchema = Ext.ClassManager.get(entitySchemaClassName);
			if (!entitySchema) {
				throw new Terrasoft.ItemNotFoundException({
					message: Ext.String.format(resources.localizableStrings.EntitySchemaNotFountExceptionMessage,
						entitySchemaClassName)
				});
			}
			classConfig.entitySchema = entitySchema;
		},

		/**
		 * Выполняет пользовательский код на структуре схемы и тем самым модифицирует структуру схемы
		 * @protected
		 * @virtual
		 * @param {Object} config Конфигурационный объект схемы модели представления
		 * @param {Function} userCode Функция пользовательского кода
		 */
		applyUserCode: function(config, userCode) {
			if (!userCode || !Ext.isFunction(userCode.viewModel)) {
				return;
			}
			userCode.viewModel(config);
		},

		/**
		 * Применяет колонки схемы сущности к колонкам схемы генерируемого класса
		 * @protected
		 * @virtual
		 * @param {Object} columnsConfig Конфигурационный объект колонок схемы конфигурируемого класса
		 * @param {Object} entitySchema Схема сущности
		 */
		applyEntitySchemaColumns: function(columnsConfig, entitySchema) {
			if (Ext.isEmpty(entitySchema)) {
				return;
			}
			Terrasoft.each(entitySchema.columns, function(column, columnName) {
				column.columnPath = columnName;
			}, this);
			this.applyColumns(columnsConfig, entitySchema.columns);
		},

		/**
		 * Применяет атрибуты схемы к колонкам схемы генерируемого класса
		 * @protected
		 * @virtual
		 * @param {Object} columnsConfig Конфигурационный объект колонок схемы конфигурируемого класса
		 * @param {Object} attributes Атрибуты схемы
		 */
		applySchemaAttributes: function(columnsConfig, attributes) {
			Terrasoft.each(attributes, function(attribute, attributeName) {
				this.applyColumn(columnsConfig, attribute, attributeName);
			}, this);
		},

		/**
		 * Применяет колонки родительского класса к колонкам схемы генерируемого класса
		 * @protected
		 * @virtual
		 * @param {Object} columnsConfig Конфигурационный объект колонок схемы конфигурируемого класса
		 * @param {Object} parentColumns Конфигурационный объект колонок схемы родительского класса
		 */
		applyParentColumns: function(columnsConfig, parentColumns) {
			this.applyColumns(columnsConfig, parentColumns);
		},

		/**
		 * Применяет переданные колонки к колонкам генерируемого класса
		 * @private
		 * @param {Object} columnsConfig Конфигурационный объект колонок схемы конфигурируемого класса
		 * @param {Object} columns Колонки
		 */
		applyColumns: function(columnsConfig, columns) {
			Terrasoft.each(columns, function(column, columnName) {
				this.applyColumn(columnsConfig, column, columnName);
			}, this);
		},

		/**
		 * Применяет свойства переданной колонки к колонке генерируемого класса
		 * @param {Object} columnsConfig Конфигурационный конфиг колонок
		 * @param {Object} column Колонка
		 * @param {String} columnName Название колонки
		 */
		applyColumn: function(columnsConfig, column, columnName) {
			column.name = columnName;
			var parentColumn = columnsConfig[columnName];
			var columnValue = column.value;
			delete column.value;
			if (parentColumn) {
				var parentDependencies = parentColumn.dependencies;
				var columnDependencies = column.dependencies;
				Ext.apply(parentColumn, column);
				if (parentDependencies && columnDependencies) {
					parentColumn.dependencies = parentDependencies.concat(columnDependencies);
				}
				column.value = columnValue;
				if (columnValue !== undefined) {
					parentColumn.value = columnValue;
				}
			} else {
				var columnConfig = Terrasoft.deepClone(column);
				column.value = columnValue;
				if (columnValue !== undefined) {
					columnConfig.value = columnValue;
				}
				this.applyColumnDefaults(columnConfig);
				columnsConfig[columnName] = columnConfig;
				if (column.dataValueType === Terrasoft.DataValueType.LOOKUP) {
					this.addLookupListColumn(columnsConfig, columnName);
				}
			}
		},

		/**
		 * Создает конфигурационный объект колонки на основании имени переданной справочной колонки и добавляет его
		 * к колонкам схемы генерируемого класса
		 * @private
		 * @param {Object} columnsConfig Конфигурационный объект колонок
		 * @param {String} name Название справочной колонки
		 */
		addLookupListColumn: function(columnsConfig, name) {
			var lookupColumnName = name + this.lookupColumnListSuffix;
			columnsConfig[lookupColumnName] = {
				name: lookupColumnName,
				dataValueType: Terrasoft.DataValueType.COLLECTION,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: new Terrasoft.Collection()
			};
		},

		/**
		 * Применяет свойства колонки по умолчанию
		 * @private
		 * @param {Object} column Колонка
		 */
		applyColumnDefaults: function(column) {
			if (Ext.isNumber(column.type)) {
				return;
			}
			column.type = Ext.isEmpty(column.columnPath)
				? Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				: Terrasoft.ViewModelColumnType.ENTITY_COLUMN;
		},

		/**
		 * Применяет переданные бизнес-правила к бизнес-правилам схемы генерируемого класса
		 * @protected
		 * @virtual
		 * @param {Object} rulesConfig Конфиграция бизнес-правил класса
		 * @param {Object} parentRules Родительские бизнес-правила
		 * @param {Object} rules Бизнес-правила
		 */
		applySchemaBusinessRules: function(rulesConfig, parentRules, rules) {
			Terrasoft.each(parentRules, function(columnRules, columnName) {
				this.applyColumnBusinessRules(rulesConfig, columnRules, columnName);
			}, this);
			Terrasoft.each(rules, function(columnRules, columnName) {
				this.applyColumnBusinessRules(rulesConfig, columnRules, columnName);
			}, this);
		},

		/**
		 * Применяет переданные элементы к бизнес-правилам указанной колонки
		 * @private
		 * @param {Object} rulesConfig Конфиграция бизнес-правил класса
		 * @param {Object} columnRules Бизнес-правила колонки
		 * @param {String} columnName Название колонки
		 */
		applyColumnBusinessRules: function(rulesConfig, columnRules, columnName) {
			var columnRulesConfig = rulesConfig[columnName];
			if (columnRulesConfig) {
				Terrasoft.each(columnRules, function(columnRule, columnRuleName) {
					this.applyColumnBusinessRule(columnRulesConfig, columnRule, columnRuleName);
				}, this);
			} else {
				rulesConfig[columnName] = Terrasoft.deepClone(columnRules);
			}
		},

		/**
		 * Применяет переданный элемент к элементу бизнес-правила колонки
		 * @private
		 * @param {Object} columnRulesConfig Существующие бизнес-правила колонки
		 * @param {Object} columnRule Элемент для применения
		 * @param {String} columnRuleName Названия элемента для применения
		 */
		applyColumnBusinessRule: function(columnRulesConfig, columnRule, columnRuleName) {
			var columnRuleConfig = columnRulesConfig[columnRuleName];
			if (columnRuleConfig) {
				Ext.apply(columnRuleConfig, columnRule);
			} else {
				columnRulesConfig[columnRuleName] = Terrasoft.deepClone(columnRule);
			}
		},

		/**
		 * Применяет переданные детали к деталям схемы генерируемого класса
		 * @protected
		 * @virtual
		 * @param {Object} detailsConfig Конфигурационный объект деталей генерируемого класса
		 * @param {Object} parentDetails Конфигурационный объект деталей родительского класса
		 * @param {Object} details Детали
		 */
		applySchemaDetails: function(detailsConfig, parentDetails, details) {
			Terrasoft.each(parentDetails, function(detail, detailName) {
				this.applyDetail(detailsConfig, detail, detailName);
			}, this);
			Terrasoft.each(details, function(detail, detailName) {
				this.applyDetail(detailsConfig, detail, detailName);
			}, this);
		},

		/**
		 * Применяет свойства переданной детали к детали схемы генерируемого класса
		 * @param {Object} detailsConfig Конфигурационный объект деталей генерируемого класса
		 * @param {Object} detail Деталь
		 * @param {String} detailName Название детали
		 */
		applyDetail: function(detailsConfig, detail, detailName) {
			var parentDetail = detailsConfig[detailName];
			if (parentDetail) {
				Ext.apply(parentDetail, detail);
			} else {
				detailsConfig[detailName] = Terrasoft.deepClone(detail);
			}
		},

		/**
		 * Применяет переданные ресурсы к колонкам схемы генерируемого класса
		 * @protected
		 * @virtual
		 * @param {Object} columns Конфигурационный объект колонок схемы конфигурируемого класса
		 * @param {Object} resources Ресурсы
		 */
		applyResources: function(columns, resources) {
			Terrasoft.each(resources.localizableStrings, function(value, name) {
				this.applyResource(columns, name, value, this.resourceType.STRING);
			}, this);
			Terrasoft.each(resources.localizableImages, function(value, name) {
				this.applyResource(columns, name, value, this.resourceType.IMAGE);
			}, this);
		},

		/**
		 * Создает конфигурационный объект колонки на основании свойств переданного ресурса и добавляет его
		 * к колонкам схемы генерируемого класса
		 * @private
		 * @param {Object} columnsConfig Конфигурационный объект колонок
		 * @param {String} name Название ресурса
		 * @param {Object} value Значение ресурса
		 * @param {String} type Тип ресурса
		 */
		applyResource: function(columnsConfig, name, value, type) {
			var resourceColumn = {
				name: this.resourcesSuffix + "." + type + "." + name,
				dataValueType: (type === this.resourceType.STRING) ? Terrasoft.DataValueType.TEXT :
					Terrasoft.DataValueType.IMAGE,
				type: Terrasoft.ViewModelColumnType.RESOURCE_COLUMN,
				value: value
			};
			this.applyColumnDefaults(resourceColumn);
			columnsConfig[resourceColumn.name] = resourceColumn;
		},

		/**
		* Применяет конфигурационные объекты колонкок на основании свойств переданной конфигурации представления
		 * @protected
		 * @virtual
		* @param {Object[]} columnsConfig Конфигурационный объект колонок схемы конфигурируемого класса
		* @param {Object} config Конфигурация представления
		*/
		addViewColumns: function(columnsConfig, config) {
			Terrasoft.iterateChildItems(config, function(iterationConfig) {
				this.addViewItemColumns(columnsConfig, iterationConfig.item);
			}, this);
		},

		/**
		 * Применяет конфигурационные объекты колонкок на основании описания элемента представления
		 * @private
		 * @virtual
		 * @param {Object[]} columnsConfig Конфигурационный объект колонок схемы конфигурируемого класса
		 * @param {Object} config Конфигурация элемента представления
		 */
		addViewItemColumns: function(columnsConfig, config) {
			if ((config.itemType === Terrasoft.ViewItemType.TAB_PANEL) ||
					(config.itemType === Terrasoft.ViewItemType.IMAGE_TAB_PANEL)) {
				this.applyTabPanelColumns(columnsConfig, config);
			}
		},

		/**
		 * Расширяет колонки схемы виртуальными колонками, необходимыми для работы вкладок
		 * @protected
		 * @virtual
		 * @param {Object[]} columnsConfig Массив колонок схемы
		 * @param {Object} config Конфигурация вкладок
		 */
		applyTabPanelColumns: function(columnsConfig, config) {
			var tabsValues = [];
			Terrasoft.each(config.tabs, function(item) {
				var itemName = item.name;
				columnsConfig[itemName] = {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: false
				};
				var caption = this.getTabCaption(columnsConfig, item);
				tabsValues.push({
					Caption: caption,
					Name: itemName
				});
			}, this);
			var tabsCollection = Ext.create("Terrasoft.BaseViewModelCollection", {
				entitySchema: Ext.create("Terrasoft.BaseEntitySchema", {
					columns: {},
					primaryColumnName: "Name"
				})
			});
			tabsCollection.loadFromColumnValues(tabsValues);
			var tabCollectionName = this.getTabsCollectionName(config);
			columnsConfig[tabCollectionName] = {
				dataValueType: Terrasoft.DataValueType.COLLECTION,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: tabsCollection
			};
		},

		/**
		 * Возвращает значение заголовка для вкладки
		 * @protected
		 * @virtual
		 * @param {Object[]} columnsConfig Конфигурационный объект колонок схемы конфигурируемого класса
		 * @param {Object} config Конфигурация элемента представления схемы
		 * @return {String} Возвращает тестровое значение заголовка для вкладки
		 */
		getTabCaption: function(columnsConfig, config) {
			var caption = config.caption;
			if (caption && caption.bindTo) {
				if (columnsConfig[caption.bindTo]) {
					return columnsConfig[caption.bindTo].value;
				}
			} else {
				return caption;
			}
		},

		/**
		 * Получает все схемы по иерархии и генерирует классы ViewModel
		 * @overridden
		 * @param {Object} config
		 * @param {Function} callback Функция обратного вызова
		 * @param {Object} scope Контекст выполнения функции обратного вызова
		 */
		generate: function(config, callback, scope) {
			var hierarchy = config.hierarchy;
			this.useCache = Ext.isEmpty(config.useCache) ? this.useCache : config.useCache;
			this.callParent([config, function() {
				var viewModelClass = this.generateSchemaClass(hierarchy);
				callback.call(scope, viewModelClass);
			}], this);
		}
	});

	return Ext.create(viewModelGenerator);

});
