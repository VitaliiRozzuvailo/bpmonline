define("EntityStructureHelperMixin", ["ext-base", "terrasoft", "ConfigurationEnums",
	"EntityStructureHelperMixinResources", "ServiceHelper", "ViewGeneratorV2" ],
	function(Ext, Terrasoft, ConfigurationEnums, resources, ServiceHelper) {

		/**
		 * @class Terrasoft.configuration.mixins.EntityStructureHelperMixin
		 * Миксин, реализующий работу с структурой объекта.
		 */
		Ext.define("Terrasoft.configuration.mixins.EntityStructureHelperMixin", {
			alternateClassName: "Terrasoft.EntityStructureHelperMixin",

			/**
			 * Генерирует имя класса схемы объекта по имени схемы объекта.
			 * @param {String} entitySchemaName Имя схемы обекта.
			 * @return {string} Возвращает имя класса схемы объекта.
			 */
			getEntitySchemaClassName: function(entitySchemaName) {
				return "Terrasoft." + entitySchemaName;
			},

			/**
			 * Возвращает схему объекта по имени.
			 * @param {String} entitySchemaName Имя схемы объекта.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			getEntitySchema: function(entitySchemaName, callback, scope) {
				var entitySchemaClassName =  this.getEntitySchemaClassName(entitySchemaName);
				var entitySchema = Ext.ClassManager.get(entitySchemaClassName);
				if (entitySchema) {
					callback.call(scope, entitySchema);
					return;
				}
				this.sandbox.requireModuleDescriptors([entitySchemaName], function() {
					Terrasoft.require([entitySchemaName], callback, scope);
				}, scope);
			},

			/**
			 * Возвращает заголовок схемы объекта по имени.
			 * @param {String} entitySchemaName Имя схемы объекта.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			getEntitySchemaCaption: function(entitySchemaName, callback, scope) {
				this.getEntitySchema(entitySchemaName, function(entitySchema) {
					callback.call(scope, entitySchema.caption);
				}, scope);
			},

			/**
			 * Запрашивает дескрипторы для схем справочных колонок объекта.
			 * @param {Terrasoft.BaseEntitySchema} entity Cхема объекта.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			getEntityDescriptorsForLookupColumns: function(entity, callback, scope) {
				var entityNames = [];
				Terrasoft.each(entity.columns, function(column) {
					if (Terrasoft.isLookupDataValueType(column.dataValueType)) {
						var schemaName = column.referenceSchemaName;
						if (!Ext.Array.contains(entityNames, schemaName)) {
							entityNames.push(schemaName);
						}
					}
				}, this);
				this.sandbox.requireModuleDescriptors(entityNames, callback, scope);
			},

			/**
			 * Генерирует справочные колонки объекта по имени объекта.
			 * @param {Terrasoft.BaseEntitySchema} entitySchemaName Имя схема объекта.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			getLookupColumns: function(entitySchemaName, callback, scope) {
				var config = {
					lookupsColumnsOnly: true,
					entitySchemaName: entitySchemaName
				};
				this.getColumns(config, callback, scope);
			},

			/**
			 * Запрашиевает колонки обратной связи для объекта по имени объекта.
			 * @param {Terrasoft.BaseEntitySchema} entitySchemaName Имя схема объекта.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			getBackwardColumns: function(entitySchemaName, callback, scope) {
				var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "SysEntitySchemaReference",
					rowCount: -1,
					isDistinct: true
				});

				select.addColumn("ColumnCaption", "ColumnCaption");
				select.addColumn("ColumnName", "ColumnName");
				select.addColumn("SysSchema.Name", "Name");
				select.addColumn("SysSchema.Caption", "Caption");

				select.filters.addItem(select.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"[SysSchema:Id:ReferenceSchema].Name",
					entitySchemaName));
				select.filters.addItem(select.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"SysSchema.SysPackage.SysWorkspace",
					Terrasoft.SysValue.CURRENT_WORKSPACE.value));
				select.filters.addItem(select.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.NOT_START_WITH,
					"SysSchema.Name",
					"VwSys"));
				select.filters.addItem(select.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.NOT_START_WITH,
					"SysSchema.Name",
					"Sys"));
				select.filters.addItem(select.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"UsageType",
					0));
				select.getEntityCollection(callback, scope);
			},

			/**
			 * Проверяет, может ли быть примененна к данному типу данных данная функция аггрегации.
			 * @param {Terrasoft.core.enums.DataValueType} dataValueType Тип данных.
			 * @param {Terrasoft.core.enums.AggregationType} aggregationType Функция аггрегации.
			 * @return {Boolean} Возвращает true если к данному типу данных модет быть премененна
			 * данная фукнция аггрегации, false в обратном случае.
			 */
			isAggregateFunctionCanBeUsed: function(dataValueType, aggregationType) {
				if (dataValueType === Terrasoft.DataValueType.BLOB) {
					return false;
				}
				switch (aggregationType) {
					case Terrasoft.AggregationType.COUNT:
						return true;
					case Terrasoft.AggregationType.MAX:
					case Terrasoft.AggregationType.MIN:
						return  Terrasoft.isDateDataValueType(dataValueType) || Terrasoft.isNumberDataValueType(dataValueType);
					case Terrasoft.AggregationType.AVG:
					case Terrasoft.AggregationType.SUM:
						return Terrasoft.isNumberDataValueType(dataValueType);
					default:
						return false;
				}
			},

			/**
			 * Проверяет, может ли быть примененна аггрегация к типу данных.
			 * @param {Terrasoft.core.enums.DataValueType} dataValueType Тип данных.
			 * @return {Boolean} Возвращает true если к данному типу данных модет быть премененна
			 * аггрегации, false в обратном случае.
			 */
			isAggregateDataValueType: function(dataValueType) {
				return Terrasoft.isDateDataValueType(dataValueType) || Terrasoft.isNumberDataValueType(dataValueType);
			},

			/**
			 * Создает представление колонки для выпадающего списка.
			 * @param {Object} column Колонка объекта.
			 * @return {Object} Возвращает представление колонки для выпадающего списка.
			 */
			createItem: function(column) {
				return {
					value: column.uId,
					displayValue: column.caption,
					columnName: column.name,
					referenceSchemaName: column.referenceSchemaName || "",
					dataValueType: column.dataValueType,
					isLookup: column.isLookup || false,
					order: 2
				};
			},

			/**
			 * Создает представление дочерней колонки объекта для выпадающего списка.
			 * @param {Object} column Колонка объекта.
			 * @return {Object} Возвращает представление колонки для выпадающего списка.
			 */
			createChild: function(column) {
				return Ext.apply(this.createItem(column), {
					isBackward: false
				});
			},

			/**
			 * Создает представление колонки обратной связи для выпадающего списка.
			 * @param {Object} column Колонка обратной связи.
			 * @return {Object} Возвращает представление колонки обратной связи для выпадающего списка.
			 */
			createBackwardChild: function(column) {
				return {
					value: column.UId,
					displayValue:
						resources.localizableStrings.BackwardCaptionTemplate
							.replace("#EntityName#", column.Caption)
							.replace("#ColumnName#", column.ColumnCaption),
					columnName: "[" + column.Name + ":" + column.ColumnName + "]",
					referenceSchemaName: column.Name,
					isBackward: true,
					order: 2
				};
			},

			/**
			 * Создает представление колонки "Количество" для выпадающего списка.
			 * @return {Object} Возвращает представление колонки "Количество" для выпадающего списка.
			 */
			createCountColumn: function() {
				return {
					value: "count",
					displayValue: resources.localizableStrings.CountItemCaption,
					columnName: "count",
					dataValueType: Terrasoft.DataValueType.INTEGER,
					order: 1,
					isAggregative: true,
					aggregationFunction: ConfigurationEnums.AggregationFunction.COUNT
				};
			},

			/**
			 * Создает представление колонки "Существует" для выпадающего списка.
			 * @return {Object} Возвращает представление колонки "Существует" для выпадающего списка.
			 */
			createExistsColumn: function() {
				return {
					value: "exists",
					displayValue: resources.localizableStrings.ExistsItemCaption,
					columnName: "exists",
					order: 0,
					isAggregative: true,
					aggregationFunction: ConfigurationEnums.AggregationFunction.EXISTS
				};
			},

			/**
			 * Проверяет, входит ли схема в список разрешенных схем.
			 * @param {Object} config Объект конфигурации.
			 * @param {String} entitySchemaName Имя схемы.
			 * @return {Boolean} Возвращает true если схема входит в список разрешенных или список пустой,
			 * false в обратном случае.
			 */
			isReferenceSchemasAllowed: function(config, entitySchemaName) {
				return (Ext.isEmpty(config.allowedReferenceSchemas) ||
					Ext.Array.contains(config.allowedReferenceSchemas, entitySchemaName));
			},

			/**
			 * Возвращет колонки объекта в зависимости от параметров.
			 * @param {Object} config Параметры отбора колонок объекта.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			getColumns: function(config, callback, scope) {
				config = Ext.apply({}, config, {
					excludeDataValueTypes: [],
					lookupsColumnsOnly: false
				});
				config.excludeDataValueTypes.push(Terrasoft.DataValueType.BLOB);
				var entitySchemaName = config.entitySchemaName;
				if (!entitySchemaName) {
					callback.call(scope, null);
					return;
				}
				this.getEntitySchema(entitySchemaName, function(entitySchema) {
					var primaryColumnName = entitySchema.primaryColumnName;
					var entitySchemaColumns = Terrasoft.deepClone(entitySchema.columns);
					entitySchemaColumns = _.filter(entitySchemaColumns, function(column) {
						return (config.displayId &&
									(column.name === primaryColumnName) &&
									this.isReferenceSchemasAllowed(config, entitySchemaName)) ||

							((column.name !== primaryColumnName) &&

							(column.usageType !== ConfigurationEnums.EntitySchemaColumnUsageType.None) &&

							(Ext.isEmpty(config.excludeDataValueTypes) ||
								!Terrasoft.contains(config.excludeDataValueTypes, column.dataValueType)) &&

							(Ext.isEmpty(config.allowedDataValueTypes) ||
								Terrasoft.contains(config.allowedDataValueTypes, column.dataValueType)) &&

							(!config.aggregationType ||
								this.isAggregateFunctionCanBeUsed(column.dataValueType, config.aggregationType)) &&

							(!config.lookupsColumnsOnly ||
								(column.isLookup &&
									this.isReferenceSchemasAllowed(config, column.referenceSchemaName))) &&

							((!config.hasBackwardElemnts && !config.summaryColumnsOnly) ||
								this.isAggregateDataValueType(column.dataValueType)));
					}, this);
					var columns = {};
					Terrasoft.each(entitySchemaColumns, function(column) {
						var columnObject = {};
						columnObject[column.name] = this.createItem(column);
						Ext.apply(columns, columnObject);
					}, this);
					if (config.hasBackwardElemnts) {
						Ext.apply(columns, {
							functionCount: this.createCountColumn()
						});
						if (config.UseExists) {
							Ext.apply(columns, {
								functionExists: this.createExistsColumn()
							});
						}
					}
//					columns.sortByFn(function(a, b) {
//						return a.order - b.order === 0 ?
//							a.displayValue.localeCompare(b.displayValue) :
//							a.order - b.order;
//					});
					callback.call(scope, columns);
				}, this);
			},

			/**
			 * Генерирует имя колонки по полному пути.
			 * @param {Object[]} dataSend Массив объектов конфигурации запроса для заголовка.
			 * @param {String} dataSend.schemaName Имя схемы.
			 * @param {String} dataSend.columnPath Полный путь колонки.
			 * @param {String} dataSend.key Ключ, для определения колонки.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			getColumnPathCaption: function(dataSend, callback, scope) {
				var data = { configJSON: dataSend } || {};
				ServiceHelper.callService({
					serviceName: "StructureExplorerService",
					methodName: "GetColumnPathCaption",
					data: data,
					callback: function(response) {
						callback.call(this, response.GetColumnPathCaptionResult);
					},
					scope: scope
				});
			},

			/**
			 * Проверяет, есть ли у схемы колонки, к которым может быть пременнена функция аггрегации.
			 * @param {String} schemaName Имя схемы.
			 * @param {Terrasoft.core.enums.AggregationType} aggregationType Функция аггрегации.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			hasAggregationColumns: function(schemaName, aggregationType, callback, scope) {
				var data = {
					schemaName: schemaName,
					aggregationType: aggregationType
				} || {};
				ServiceHelper.callService({
					serviceName: "StructureExplorerService",
					methodName: "HasAggregationColumns",
					data: data,
					callback: function(response) {
						callback.call(this, response.HasAggregationColumnsResult);
					},
					scope: scope
				});
			}
		});

	});