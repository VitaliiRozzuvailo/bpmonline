define("MobileRecordDesignerSettings", ["ext-base", "MobileRecordDesignerSettingsResources", "MobileDesignerUtils",
		"MobileBaseDesignerSettings"],
	function(Ext, resources, MobileDesignerUtils) {

		/**
		 * @class Terrasoft.configuration.MobileBaseDesignerSettings
		 * Класс настройки карточки дизайнера.
		 */
		var module = Ext.define("Terrasoft.configuration.MobileRecordDesignerSettings", {
			alternateClassName: "Terrasoft.MobileRecordDesignerSettings",
			extend: "Terrasoft.MobileBaseDesignerSettings",

			/**
			 * Локализированные строки.
			 * @type {Object}
			 */
			localizableStrings: null,

			/**
			 * Стандартные детали.
			 * @type {Object[]}
			 */
			details: null,

			/**
			 * Группы колонок.
			 * @type {Object[]}
			 */
			columnSets: null,

			/**
			 * @private
			 */
			getDefaultColumnSets: function() {
				var columnSetCaption = resources.localizableStrings.PrimaryColumnSetCaption;
				var columnSetItem = this.createColumnSetItem({
					name: "primaryColumnSet",
					caption: columnSetCaption
				});
				columnSetItem.items = this.createDefaultColumnItemsByEntitySchema(this.entitySchema);
				return [columnSetItem];
			},

			/**
			 * @private
			 */
			setColumnSetCaptionsByEntitySchema: function(entitySchema, columnSetConfig, config) {
				var columns = columnSetConfig.items || [];
				MobileDesignerUtils.setColumnsContentByPath({
					modelName: entitySchema.name,
					items: columns,
					callback: config.callback,
					scope: config.scope
				});
			},

			/**
			 * @private
			 */
			setColumnSetCaptionsByColumnSetConfig: function(columnSetConfig, config) {
				this.getEntitySchemaByName(columnSetConfig.entitySchemaName, function(entitySchema) {
					this.setColumnSetCaptionsByEntitySchema(entitySchema, columnSetConfig, config);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerSettings#initializeDefaultValues
			 * @protected
			 * @overridden
			 */
			initializeDefaultValues: function() {
				this.callParent(arguments);
				if (!this.localizableStrings) {
					this.localizableStrings = {};
				}
				if (!this.details) {
					this.details = [];
				}
				if (!this.columnSets) {
					this.columnSets = this.getDefaultColumnSets();
				} else {
					this.columnSets.sort(function(a, b) {
						return a.position - b.position;
					});
				}
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerSettings#initializeCaptionValues
			 * @protected
			 * @overridden
			 */
			initializeCaptionValues: function(config) {
				var columnSets = this.columnSets;
				if (!columnSets || columnSets.length === 0) {
					Ext.callback(config.callback, config.scope);
					return;
				}
				var originalCallback = config.callback;
				var processedColumnSetsCount = 0;
				var columnSetsCount = columnSets.length;
				var originalScope = config.scope;
				config.scope = this;
				config.callback = function() {
					processedColumnSetsCount++;
					if (processedColumnSetsCount === columnSetsCount) {
						Ext.callback(originalCallback, originalScope);
					}
				};
				for (var i = 0; i < columnSetsCount; i++) {
					var columnSetConfig = columnSets[i];
					var columnSetEntityName = columnSetConfig.entitySchemaName;
					if (columnSetEntityName === this.entitySchemaName) {
						this.setColumnSetCaptionsByEntitySchema(this.entitySchema, columnSetConfig, config);
					} else {
						this.setColumnSetCaptionsByColumnSetConfig(columnSetConfig, config);
					}
				}
			},

			/**
			 * Удаляет локализированную строку.
			 * @param {String} key Имя локализированной строки.
			 */
			removeLocalizableString: function(key) {
				delete this.localizableStrings[key];
			},

			/**
			 * Добавляет локализированную строку по имени.
			 * @param {String} name Имя, по которому генерируется ключ локализированной строки.
			 * @param {String} value Значение локализированной строки.
			 * @returns {String} Имя локализированной строки.
			 */
			addLocalizableString: function(name, value) {
				var key = this.getLocalizableStringKey(name);
				this.localizableStrings[key] = value;
				return key;
			},

			/**
			 * Добавляет локализированную строку по ключу.
			 * @param {String} key Ключ локализированной строки.
			 * @param {String} value Значение локализированной строки.
			 */
			setLocalizableString: function(key, value) {
				this.localizableStrings[key] = value;
			},

			/**
			 * Возвращает локализированную строку по ключу.
			 * @param {String} key Ключ локализированной строки.
			 * @returns {String} Локализированная строка.
			 */
			getLocalizableStringByKey: function(key) {
				return this.localizableStrings[key];
			},

			/**
			 * Возвращает ключ локализированной строки по имени.
			 * @param {String} name Имя, по которому генерируется ключ локализированной строки.
			 * @returns {String} Ключ локализированной строки.
			 */
			getLocalizableStringKey: function(name) {
				return name + this.entitySchemaName + "_caption";
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerSettings#removeItem
			 * @overridden
			 */
			removeItem: function(name, item) {
				this.removeLocalizableString(item.caption);
				this.callParent(arguments);
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerSettings#applyItem
			 * @overridden
			 */
			applyItem: function(name, item, newItem) {
				if (item.name !== newItem.name) {
					this.removeLocalizableString(item.caption);
				}
				this.callParent(arguments);
			},

			/**
			 * Добавляет деталь.
			 * @param {Object} detailItem Конфигурационный объект детали.
			 */
			addDetailItem: function(detailItem) {
				this.addItem("details", detailItem);
			},

			/**
			 * Удаляет деталь.
			 * @param detailItem Конфигурационный объект детали.
			 */
			removeDetailItem: function(detailItem) {
				this.removeItem("details", detailItem);
			},

			/**
			 * Применяет новые значения детали.
			 * @param {Object} detailItem Конфигурационный объект детали.
			 * @param {Object} newDetailItem Конфигурационный объект новой детали.
			 */
			applyDetailItem: function(detailItem, newDetailItem) {
				this.applyItem("details", detailItem, newDetailItem);
			},

			/**
			 * Добавляет группу колонок.
			 * @param columnSetItem Конфигурационный объект группы колонок.
			 */
			addColumnSetItem: function(columnSetItem) {
				this.addItem("columnSets", columnSetItem);
			},

			/**
			 * Удаляет группу колонок.
			 * @param columnSetItem Конфигурационный объект группы колонок.
			 */
			removeColumnSetItem: function(columnSetItem) {
				this.removeItem("columnSets", columnSetItem);
			},

			/**
			 * Применяет новые значения группе колонок.
			 * @param {Object} columnSetItem Конфигурационный объект группу колонок.
			 * @param {Object} newColumnSetItem Конфигурационный объект новой группы колонок.
			 */
			applyColumnSetItem: function(columnSetItem, newColumnSetItem) {
				this.applyItem("columnSets", columnSetItem, newColumnSetItem);
			},

			/**
			 * Перемещает группу колонок на одну позицию.
			 * @param {Object} item Элемент.
			 * @param {Number} offset Смещение элемента.
			 * @returns {Boolean} true, если изменилась позиция.
			 */
			moveColumnSetItem: function(item, offset) {
				var columnSets = this.columnSets;
				if (offset === -1 && columnSets.indexOf(item) === 1) {
					return false;
				}
				return this.moveItem("columnSets", item, offset);
			},

			/**
			 * Находит деталь по имени.
			 * @param {String} name Имя детали.
			 * @returns {Object|null} Деталь.
			 */
			findDetailItemByName: function(name) {
				return this.findDetailItemByPropertyName("name", name);
			},

			/**
			 * Находит деталь по имени схемы.
			 * @param {String} name Имя схемы детали.
			 * @returns {Object|null} Деталь.
			 */
			findDetailItemBySchemaName: function(name) {
				return this.findDetailItemByPropertyName("detailSchemaName", name);
			},

			/**
			 * Находит деталь по имени свойства и значению.
			 * @param {String} propertyName Имя свойства детали.
			 * @param {String} value Значение свойства детали.
			 * @returns {Object|null} Деталь.
			 */
			findDetailItemByPropertyName: function(propertyName, value) {
				return this.findItemByPropertyName("details", propertyName, value);
			},

			/**
			 * Находит группу колонок по имени.
			 * @param {String} value Имя группы колонок.
			 * @returns {Object} Группа колонок.
			 */
			findColumnSetItemByName: function(value) {
				return this.findColumnSetItemByPropertyName("name", value);
			},

			/**
			 * Находит группу колонок по свойству и имени.
			 * @param {String} propertyName Имя свойства группы колонок.
			 * @param {String} value Имя группы колонок.
			 * @returns {Object} Группа колонок.
			 */
			findColumnSetItemByPropertyName: function(propertyName, value) {
				return this.findItemByPropertyName("columnSets", propertyName, value);
			},

			/**
			 * Создает конфигурацию элемента стандартной детали.
			 * @param {Object} config Конфигурация стандартной детали.
			 * @returns {Object} Конфигурация элемента стандартной детали.
			 */
			createDetailItem: function(config) {
				var name = config.name + "StandartDetail";
				var localizableStringKey = this.addLocalizableString(name, config.caption);
				var detailItem = {
					caption: localizableStringKey,
					entitySchemaName: config.entitySchemaName,
					filter: config.filter,
					name: name,
					detailSchemaName: config.name
				};
				return detailItem;
			},

			/**
			 * Создает конфигурацию элемента группы колонок.
			 * @param {Object} config Конфигурация группы колонок.
			 * @returns {Object} Конфигурация элемента группы колонок.
			 */
			createColumnSetItem: function(config) {
				var columnSetItem = {
					items: [],
					rows: 1
				};
				var nameSuffix;
				if (config.isDetail) {
					columnSetItem.isDetail = true;
					columnSetItem.filter = config.filter;
					columnSetItem.detailSchemaName = config.name;
					columnSetItem.entitySchemaName = config.entitySchemaName;
					nameSuffix = "EmbeddedDetail";
				} else {
					columnSetItem.entitySchemaName = this.entitySchemaName;
					nameSuffix = "";
				}
				columnSetItem.name = config.name + nameSuffix;
				columnSetItem.caption = this.addLocalizableString(columnSetItem.name, config.caption);
				return columnSetItem;
			},

			/**
			 * Возвращает массив конфигураций элементов колонок.
			 * @param {Object} entitySchema Экземпляр схемы.
			 * @returns {Object[]} Массив конфигураций элементов колонок.
			 */
			createDefaultColumnItemsByEntitySchema: function(entitySchema) {
				var primaryDisplayColumn = entitySchema.primaryDisplayColumn;
				var primaryColumn = entitySchema.primaryColumn;
				var columns = [];
				if (primaryDisplayColumn) {
					columns.push(primaryDisplayColumn);
				}
				Terrasoft.each(entitySchema.columns, function(column) {
					if (column.isRequired && column !== primaryDisplayColumn && column !== primaryColumn) {
						columns.push(column);
					}
				});
				var items = [];
				for (var i = 0, ln = columns.length; i < ln; i++) {
					var column = columns[i];
					var columnItem = this.createColumnItem({
						row: i,
						caption: column.caption,
						columnName: column.name,
						dataValueType: column.dataValueType
					});
					items.push(columnItem);
				}
				return items;
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerSettings#getSettingsConfig
			 * @overridden
			 */
			getSettingsConfig: function() {
				var settingsConfig = this.callParent(arguments);
				settingsConfig.details = this.details;
				var columnSets = this.columnSets;
				for (var i = 0, ln = columnSets.length; i < ln; i++) {
					columnSets[i].position = i;
				}
				settingsConfig.columnSets = columnSets;
				settingsConfig.localizableStrings = this.localizableStrings;
				return settingsConfig;
			}

		});
		return module;

	});
