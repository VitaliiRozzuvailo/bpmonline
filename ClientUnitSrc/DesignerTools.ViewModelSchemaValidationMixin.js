define("ViewModelSchemaValidationMixin", ["ViewModelSchemaValidationMixinResources"], function(resources) {
		/**
		 * @class Terrasoft.configuration.mixins.ViewModelSchemaValidationMixin
		 * Миксин валидации клинтской схемы.
		 */
		var schemaValidationMixin = Ext.define("Terrasoft.configuration.mixins.ViewModelSchemaValidationMixin", {
			alternateClassName: "Terrasoft.ViewModelSchemaValidationMixin",

			/**
			 * Возвращает значение локализированной строки.
			 * @protected
			 * @virtual
			 * @param {String} name Название локализированной строки.
			 * @return {String} Значение локализированной строки.
			 */
			getLocalizableStringValue: function(name) {
				return resources.localizableStrings[name];
			},

			/**
			 * Возвразает имя корневого элемента схемы в зависимости от типа схемы.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.SchemaType} schemaType Тип схемы.
			 * @return {string} Имя корневого элемента схемы.
			 */
			getViewSchemaRootItemName: function(schemaType) {
				switch (schemaType) {
					case Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA:
						return "CardContentContainer";
					case Terrasoft.SchemaType.MODULE_VIEW_MODEL_SCHEMA:
						return "SectionWrapContainer";
					case Terrasoft.SchemaType.GRID_DETAIL_VIEW_MODEL_SCHEMA:
					case Terrasoft.SchemaType.EDIT_CONTROLS_DETAIL_VIEW_MODEL_SCHEMA:
					case Terrasoft.SchemaType.MODULE:
						throw new Terrasoft.UnsupportedTypeException();
				}
			},

			/**
			 * Проверяет схему на соответствие корневого объета правилам:
			 * Корневой элемент должен быть только один.
			 * У корневого элемента должно быть имя корневого элемента базовой схемы этого типа.
			 * @protected
			 * @virtual
			 * @param {Object} schema Схема.
			 * @param {Object} schema.viewConfig Собранная схема представления.
			 * @param {Terrasoft.SchemaType} schema.type Тип схемы.
			 * @return {Object} Результат валидации.
			 */
			viewSchemaRootValidator: function(schema) {
				var viewSchema = schema.viewConfig;
				var rootItemName = this.getViewSchemaRootItemName(schema.type);
				var result = {success: true};
				var rootItem = viewSchema;
				if (Ext.isArray(viewSchema)) {
					if (viewSchema.length > 1) {
						result.success = false;
						result.message = this.getLocalizableStringValue("ViewSchemaSingleRootValidatorMessage");
						return result;
					}
					rootItem = viewSchema[0];
				}
				if (rootItem.name !== rootItemName) {
					result.success = false;
					result.message = Ext.String.format(
						this.getLocalizableStringValue("ViewSchemaRootNameValidatorMessage"), rootItemName);
				}
				return result;
			},

			/**
			 * Проверяет схему на уникальность имен всех элементов в схеме.
			 * @protected
			 * @virtual
			 * @param {Object} schema Схема.
			 * @param {Object} schema.viewConfig Собранная схема представления.
			 * @param {Terrasoft.SchemaType} schema.type Тип схемы.
			 * @return {Object} Результат валидации.
			 */
			viewSchemaUniqueNamesValidator: function(schema) {
				var viewSchema = schema.viewConfig;
				var result = {success: true};
				var itemsNames = [];
				Terrasoft.iterateChildItems(viewSchema, function(iterationConfig) {
					var item = iterationConfig.item;
					var itemName = item.name;
					if (Ext.Array.contains(itemsNames, itemName)) {
						result.success = false;
						result.message = Ext.String.format(
							this.getLocalizableStringValue("ViewSchemaUniqueNamesValidatorMessage"), itemName);
						return false;
					}
					itemsNames.push(itemName);
				}, this);
				return result;
			},

			/**
			 * Проверяет чтобы все элементы модели находились в сетке.
			 * @protected
			 * @virtual
			 * @param {Object} schema Схема.
			 * @param {Object} schema.viewConfig Собранная схема представления.
			 * @param {Terrasoft.SchemaType} schema.type Тип схемы.
			 * @return {Object} Результат валидации.
			 */
			viewSchemaModelItemsValidator: function(schema) {
				var viewSchema = Terrasoft.deepClone(schema.viewConfig);
				Terrasoft.iterateChildItems(viewSchema, function(iterationConfig) {
					var item = iterationConfig.item;
					var itemType = item.itemType;
					if (!Ext.isEmpty(item.generator) ||
						itemType === Terrasoft.ViewItemType.BUTTON &&
						itemType === Terrasoft.ViewItemType.MENU) {
						var parent = iterationConfig.parent;
						var propertyName = iterationConfig.propertyName;
						delete parent[propertyName];
					}
				}, this);
				var result = {success: true};
				Terrasoft.iterateChildItems(viewSchema, function(iterationConfig) {
					var item = iterationConfig.item;
					var itemType = item.itemType;
					var parent = iterationConfig.parent;
					var parentItemType = parent.itemType;
					if ((Ext.isEmpty(itemType) || (itemType === Terrasoft.ViewItemType.MODEL_ITEM)) &&
						(parentItemType !== Terrasoft.ViewItemType.GRID_LAYOUT &&
						//parentItemType !== Terrasoft.ViewItemType.BUTTON &&
						//parentItemType !== Terrasoft.ViewItemType.MENU &&
						parentItemType !== Terrasoft.ViewItemType.TAB_PANEL)) {
						result.success = false;
						result.message = Ext.String.format(
							this.getLocalizableStringValue("ViewSchemaModelItemsValidatorMessage"), item.name);
						return false;
					}
				}, this);
				return result;
			},

			/**
			 * Проверяет схему на использование функций в схеме представления.
			 * @protected
			 * @virtual
			 * @param {Object} schema Схема.
			 * @param {Object} schema.viewConfig Собранная схема представления.
			 * @param {Terrasoft.SchemaType} schema.type Тип схемы.
			 * @return {Object} Результат валидации.
			 */
			viewSchemaJsonStructureValidator: function(schema) {
				var viewSchema = schema.viewConfig;
				var result = {success: true};
				Terrasoft.each(viewSchema, function(propertyValue) {
					if (!propertyValue || typeof propertyValue !== "object" || propertyValue.constructor === Date) {
						return result.success;
					}
					if (Ext.isFunction(propertyValue)) {
						result.success = false;
						result.message = this.getLocalizableStringValue("ViewSchemaIsJsonFunctionValidatorMessage");
						return result;
					}
					var propertyResult = this.viewSchemaJsonStructureValidator(propertyValue);
					if (!propertyResult.success) {
						result = propertyResult;
					}
					return result.success;
				}, this);
				return result;
			},

			/**
			 * Генерирует список валидаторов схемы.
			 * @protected
			 * @virtual
			 * @return {Function[]} Список функций валидации.
			 */
			getSchemaValidators: function() {
				return [this.viewSchemaRootValidator, this.viewSchemaUniqueNamesValidator,
					this.viewSchemaJsonStructureValidator];
			},

			/**
			 * Валидирует схему.
			 * @protected
			 * @virtual
			 * @param {Object} schema Схема.
			 * @param {Object} schema.viewConfig Собранная схема представления.
			 * @param {Terrasoft.SchemaType} schema.type Тип схемы.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст выполнения функции обратного вызова.
			 */
			validateSchema: function(schema, callback, scope) {
				var validators = this.getSchemaValidators();
				var validationResult = {success: true};
				Terrasoft.each(validators, function(validator) {
					validationResult = validator.call(this, schema);
					return validationResult.success;
				}, this);
				callback.call(scope, validationResult);
			}

		});
		return schemaValidationMixin;
	});
