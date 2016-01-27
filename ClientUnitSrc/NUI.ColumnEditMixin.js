define("ColumnEditMixin", ["ext-base", "ColumnEditMixinResources", "EntityStructureHelperMixin"],
	function(Ext) {


		Ext.define("Terrasoft.configuration.mixins.ColumnEditMixin", {
			alternateClassName: "Terrasoft.ColumnEditMixin",

			mixins: {
				EntityStructureHelper: "Terrasoft.EntityStructureHelperMixin"
			},

			/**
			 * Получить набор данных по колонке.
			 * @param {String} filterValue Фильтр для primaryDisplayColumn
			 * @param {Terrasoft.Collection} list Коллекция, в которую будут загружены данные.
			 * @param {String} columnName Имя колонки ViewModel.
			 * @param {Boolean} isLookup Признак справочной колонке.
			 */
			loadColumnsData: function(filterValue, list, columnName, isLookup) {
				var entityStructureConfig = this.getEntityStructureConfig(columnName);
				if (!entityStructureConfig) {
					return;
				}
				this.getColumns(entityStructureConfig, function(columns) {
					list.clear();
					var columnsCollection = this.Ext.create("Terrasoft.Collection");
					var objects = {};
					Terrasoft.each(columns, function(column) {
						var columnConfig = {
							value: column.columnName,
							dataValueType: column.dataValueType,
							displayValue: column.displayValue,
							referenceSchemaName: column.referenceSchemaName
						};
						objects[columnConfig.value] = columnConfig;
					}, this);
					columnsCollection.loadAll(objects);
					columnsCollection = columnsCollection.filter(
						"displayValue",
						filterValue,
						Terrasoft.StringFilterType.START_WITH
					);
					if (!columnsCollection.isEmpty()) {
						list.loadAll(columnsCollection);
					}
				}, this);
			},

			/**
			 * Генерирует конфигурацию для модуля выбора колонки по имени колонки.
			 * @param {String} columnName Имя колонки.
			 * @return {Object|null} Возвращает конфигурацию для модуля выбора колонки.
			 */
			getEntityStructureConfig: function(columnName) {
				var entityStructureConfig = this.columns[columnName].entityStructureConfig;
				if (!entityStructureConfig) {
					return;
				}
				entityStructureConfig = Terrasoft.deepClone(entityStructureConfig);
				var sourceToValueDecoupling = [{
					sourceName: "schemaColumnName",
					valueName: "schemaName",
					parameterName: "Name"
				}, {
					sourceName: "aggregationTypeParameterName",
					valueName: "aggregationType",
					parameterName: "value"
				}];
				Terrasoft.each(sourceToValueDecoupling, function(decoupling) {
					var sourceValue = entityStructureConfig[decoupling.sourceName];
					if (!sourceValue) {
						return;
					}
					var value = this.get(sourceValue);
					var itemConfig = {};
					itemConfig[decoupling.valueName] = value && value[decoupling.parameterName];
					Ext.apply(entityStructureConfig, itemConfig);
				}, this);

				if (!entityStructureConfig.schemaName) {
					return;
				}
				entityStructureConfig.entitySchemaName = entityStructureConfig.schemaName;
				if (Ext.isString(entityStructureConfig.allowedReferenceSchemas) &&
					Ext.isFunction(this[entityStructureConfig.allowedReferenceSchemas])) {
					entityStructureConfig.allowedReferenceSchemas = this[entityStructureConfig.allowedReferenceSchemas]();
				}
				if (Ext.isString(entityStructureConfig.allowedReferenceSchemas)) {
					entityStructureConfig.allowedReferenceSchemas = [entityStructureConfig.allowedReferenceSchemas];
				}
				Ext.apply(entityStructureConfig, {
					tag: columnName
				});
				return entityStructureConfig;
			},

			/**
			 * Открывает страницу выбора колонки.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация открытия страницы.
			 * @param {String} columnName Название колонки для которой открывается страница.
			 */
			loadColumn: function(config, columnName) {
				var entityStructureConfig = this.getEntityStructureConfig(columnName);
				if (!entityStructureConfig) {
					return;
				}
				Terrasoft.StructureExplorerUtilities.open({
					scope: this,
					handlerMethod: this.onColumnLoaded,
					moduleConfig: entityStructureConfig
				});
			},

			/**
			 * Сохраняет выбранную колонку в модель представления.
			 * @protected
			 * @virtual
			 * @param {Object} selectedColumnInfo Объект с информацией о выбранной колонке.
			 */
			onColumnLoaded: function(selectedColumnInfo) {
				var structureExplorerConfig = this.structureExplorerConfig;
				var selectedObject = {
					value: selectedColumnInfo.leftExpressionColumnPath,
					dataValueType: selectedColumnInfo.dataValueType,
					displayValue: selectedColumnInfo.leftExpressionCaption,
					referenceSchemaName: selectedColumnInfo.referenceSchemaName
				};
				this.set(structureExplorerConfig.tag, selectedObject);
			},

			/**
			 * Инициализирует колонки.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				this.initColumnsLists();
				this.initColumnDisplayValue(callback, scope);
			},

			/**
			 * Инициализирует модель параметрами для выпадающих списков параметров выбора колонки.
			 * @virtual
			 * @protected
			 */
			initColumnsLists: function() {
				Terrasoft.each(this.columns, function(columnConfig, columnName) {
					var entityStructureConfig = this.getEntityStructureConfig(columnName);
					if (entityStructureConfig && entityStructureConfig.entitySchemaName) {
						this.set(columnName + "List", this.Ext.create("Terrasoft.Collection"));
					}
				}, this);
			},

			/**
			 * Загружает заголовки и типы для значений колонок, содержащих колонки объектов.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			initColumnDisplayValue: function(callback, scope) {
				var serviceData = [];
				Terrasoft.each(this.columns, function(columnConfig, columnName) {
					var entityStructureConfig = this.getEntityStructureConfig(columnName);
					if (!entityStructureConfig || !entityStructureConfig.entitySchemaName) {
						return;
					}
					var columnPath = this.get(columnName);
					columnPath = (columnPath && columnPath.value) || columnPath;
					if (columnPath) {
						serviceData.push({
							schemaName: entityStructureConfig.entitySchemaName,
							columnPath: columnPath,
							key: columnName
						});
					}
				}, this);
				if (Ext.isEmpty(serviceData)) {
					callback.call(scope);
					return;
				}
				this.getColumnPathCaption(this.Ext.JSON.encode(serviceData), function(response) {
					response.forEach(function(columnInfo) {
						var selectedObject = {
							value: this.get(columnInfo.key),
							dataValueType: columnInfo.dataValueType,
							displayValue: columnInfo.columnCaption,
							referenceSchemaName: columnInfo.referenceSchemaName
						};
						this.set(columnInfo.key, selectedObject);
					}, this);
					callback.call(scope);
				}, this);
			}
		});

	});