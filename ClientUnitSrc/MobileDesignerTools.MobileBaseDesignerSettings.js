define("MobileBaseDesignerSettings", ["ext-base"],
	function(Ext) {

		/**
		 * @class Terrasoft.configuration.MobileBaseDesignerSettings
		 * Базовый класс настройки дизайнера.
		 */
		var module = Ext.define("Terrasoft.configuration.MobileBaseDesignerSettings", {
			alternateClassName: "Terrasoft.MobileBaseDesignerSettings",
			extend: "Terrasoft.BaseObject",

			name: null,

			/**
			 * Экземпляр схемы.
			 * @type {Object}
			 */
			entitySchema: null,

			/**
			 * Имя схемы.
			 * @type {String}
			 */
			entitySchemaName: null,

			/**
			 * Конфигурация настройки дизайнера.
			 * @type {Object}
			 */
			settingsConfig: null,

			/**
			 * @type {Object}
			 */
			sandbox: null,

			/**
			 * @private
			 */
			swapItems: function(items, indexA, indexB) {
				var tmp = items[indexA];
				items[indexA] = items[indexB];
				items[indexB] = tmp;
			},

			/**
			 * @inheritDoc Terrasoft.BaseObject#constructor
			 * @overridden
			 */
			constructor: function(config) {
				var settingsConfig = config.settingsConfig;
				for (var property in settingsConfig) {
					if (this[property] !== undefined) {
						this[property] = settingsConfig[property];
					}
				}
				this.callParent(arguments);
			},

			/**
			 * Устанавливает значения по умолчанию.
			 * @protected
			 * @virtual
			 */
			initializeDefaultValues: function() {
			},

			/**
			 * Инициализирует заголовки колонок.
			 * @param {Object} config Конфигурационный объект с параметрами вызова метода:
			 * @param {Function} config.callback Функция обратного вызова.
			 * @param {Object} config.scope Контекст функции обратного вызова.
			 * @protected
			 * @virtual
			 */
			initializeCaptionValues: function(config) {
				Ext.callback(config.callback, config.scope);
			},

			/**
			 * Выполняет инициализацию.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова функции обратного вызова.
			 */
			initialize: function(callback, scope) {
				this.getEntitySchemaByName(this.entitySchemaName, function(entitySchema) {
					this.entitySchema = entitySchema;
					this.initializeDefaultValues();
					this.initializeCaptionValues({
						callback: callback,
						scope: scope
					});
				}, this);
			},

			/**
			 * Метод возвращает объект по его имени.
			 * @param {String} entitySchemaName Имя объекта.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова функции обратного вызова.
			 */
			getEntitySchemaByName: function(entitySchemaName, callback, scope) {
				scope = scope || this;
				this.sandbox.requireModuleDescriptors(["force!" + entitySchemaName], function() {
					Terrasoft.require([entitySchemaName], callback, scope);
				}, scope);
			},

			/**
			 * Добавляет элемент по имени свойства.
			 * @param {String} name Имя свойства, содержащего массив элементов.
			 * @param {Object} item Элемент.
			 */
			addItem: function(name, item) {
				this[name].push(item);
			},

			/**
			 * Удаляет элемент по имени свойства.
			 * @param {String} name Имя свойства которое содержит массив элементов.
			 * @param item Элемент.
			 */
			removeItem: function(name, item) {
				this[name] = Ext.Array.difference(this[name], [item]);
			},

			/**
			 * Применяет новые значения элемента по имени свойства.
			 * @param {String} name Имя свойства которое содержит массив элементов.
			 * @param {Object} item Элемент.
			 * @param {Object} newItem Новый элемент.
			 */
			applyItem: function(name, item, newItem) {
				Ext.apply(item, newItem);
			},

			/**
			 * Перемещает элемент массива на одну позицию.
			 * @param {String} name Имя свойства, которое содержит массив элементов.
			 * @param {Object} item Элемент.
			 * @param {Number} offset Смещение элемента.
			 * @returns {Boolean} true, если изменилась позиция элемента.
			 */
			moveItem: function(name, item, offset) {
				var items = this[name];
				var indexA = items.indexOf(item);
				var indexB = indexA + offset;
				if (indexB < 0 || indexB >=  items.length) {
					return false;
				}
				this.swapItems(items, indexA, indexB);
				return true;
			},

			/**
			 * Находит элемент по имени свойства и значению.
			 * @param {String} itemsPropertyName Имя свойства которое содержит массив элементов.
			 * @param {String} propertyName Имя свойства элемента.
			 * @param {String} value Значение свойства элемента.
			 * @returns {Object|null} Элемент настроек.
			 */
			findItemByPropertyName: function(itemsPropertyName, propertyName, value) {
				var items = this[itemsPropertyName];
				for (var i = 0, ln = items.length; i < ln; i++) {
					var item = items[i];
					if (item[propertyName] === value) {
						return item;
					}
				}
				return null;
			},

			/**
			 * Создает конфигурацию элемента колонки.
			 * @param config Конфигурация колонки.
			 * @param {Number} config.row Номер строки.
			 * @param {String} config.caption Заголовок колонки.
			 * @param {String} config.columnName Имя колонки.
			 * @param {Terrasoft.DataValueType} config.dataValueType Тип данных.
			 * @returns {Object} Конфигурация элемента колонки.
			 */
			createColumnItem: function(config) {
				return {
					name: Terrasoft.generateGUID(),
					row: config.row,
					content: config.caption,
					columnName: config.columnName,
					dataValueType: config.dataValueType
				};
			},

			/**
			 * Генерирует конфигурацию настройки дизайнера на основании измененных данных.
			 * @returns {Object} Конфигурация настройки дизайнера.
			 */
			getSettingsConfig: function() {
				return this.settingsConfig;
			}

		});
		return module;

	});
