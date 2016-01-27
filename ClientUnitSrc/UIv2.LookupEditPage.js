define("LookupEditPage", ["LookupManager"],
function() {
	return {
		entitySchemaName: "Lookup",
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		attributes: {
			/**
			 * Виртуальная колонка схемы справочника.
			 */
			SysEntitySchema: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isLookup: true,
				isRequired: true,
				lookupListConfig: {
					columns: ["UId", "Caption"],
					filter: function() {
						var filters = this.Ext.create("Terrasoft.FilterGroup");
						filters.addItem(Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL,
							"SysWorkspace",
							Terrasoft.SysValue.CURRENT_WORKSPACE.value
						));
						filters.addItem(Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL,
							"ManagerName",
							"EntitySchemaManager"
						));
						return filters;
					}
				},
				referenceSchema: {
					name: "VwSysSchemaInfo",
					primaryColumnName: "Name",
					primaryDisplayColumnName: "Caption"
				},
				referenceSchemaName: "VwSysSchemaInfo"
			},
			/**
			 * Колонка схемы справочника.
			 */
			"SysEntitySchemaUId": {
				dependencies: [{
					columns: ["SysEntitySchema"],
					methodName: "sysEntitySchemaChanged"
				}]
			},

			/**
			 * Виртуальная колонка страницы справочника.
			 */
			SysPageSchema: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isLookup: true,
				lookupListConfig: {
					columns: ["UId", "Caption"],
					filter: function() {
						var filters = this.Ext.create("Terrasoft.FilterGroup");
						filters.addItem(Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL,
							"SysWorkspace",
							Terrasoft.SysValue.CURRENT_WORKSPACE.value
						));
						filters.addItem(Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL,
							"ManagerName",
							"ClientUnitSchemaManager"
						));
						return filters;
					}
				},
				referenceSchema: {
					name: "VwSysSchemaInfo",
					primaryColumnName: "Name",
					primaryDisplayColumnName: "Caption"
				},
				referenceSchemaName: "VwSysSchemaInfo"
			},
			/**
			 * Колонка страницы справочника.
			 */
			"SysPageSchemaUId": {
				dependencies: [{
					columns: ["SysPageSchema"],
					methodName: "sysPageSchemaChanged"
				}]
			}
		},
		methods: {

			/**
			 * Обрабатывает изменение виртуальной колонки схемы, устанавливает новое значение в колонку схемы.
			 * @protected
			 * @virtual
			 */
			sysEntitySchemaChanged: function() {
				var schema = this.get("SysEntitySchema");
				var uid = Ext.isEmpty(schema) ? null : schema.UId;
				this.set("SysEntitySchemaUId", uid);
			},

			/**
			 * Обрабатывает изменение виртуальной колонки страницы, устанавливает новое значение в колонку схемы.
			 * @protected
			 * @virtual
			 */
			sysPageSchemaChanged: function() {
				var schema = this.get("SysPageSchema");
				var uid = Ext.isEmpty(schema) ? null : schema.UId;
				this.set("SysPageSchemaUId", uid);
			},

			/**
			 * @inheritdoc BasePageV2#getLookupPageConfig
			 * @overridden
			 */
			getLookupPageConfig: function(args, columnName) {
				var config = this.callParent(arguments);
				var lookupHeader = this.get(Ext.String.format("Resources.Strings.{0}UIdLookupHeader", columnName));
				if (lookupHeader) {
					Ext.apply(config, {captionLookup: lookupHeader});
				}
				return config;
			},

			/**
			 * Возвращает название схемы справочного поля.
			 * @protected
			 * @overridden
			 * @param {Object} args Параметры.
			 * @param {String} columnName Название колонки.
			 * @return {Object|null} Название схемы справочного поля.
			 */
			getLookupEntitySchemaName: function(args, columnName) {
				var entityColumn = this.columns[columnName];
				return args.schemaName || entityColumn.referenceSchemaName;
			},

			/**
			 * Загружает значения виртуальных колонок схем.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			loadSchemaNames: function(callback, scope) {
				var columnNames = {
					"SysEntitySchemaUId": "SysEntitySchema",
					"SysPageSchemaUId": "SysPageSchema"
				};
				var bq = Ext.create("Terrasoft.BatchQuery");
				Terrasoft.each(columnNames, function(lookupName, columnName) {
					var column = this.columns[lookupName];
					var columnValue = this.get(columnName);
					if (!Ext.isEmpty(columnValue) && Terrasoft.isGUID(columnValue)) {
						var lookupQuery = this.getLookupQuery(null, column.name, column.isLookup);
						lookupQuery.filters.addItem(Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "UId", columnValue));
						bq.add(lookupQuery, function(result) {
							var value = null;
							if (result.success && !result.collection.isEmpty()) {
								var resultValue = result.collection.getByIndex(0);
								value = resultValue.values;
							}
							this.set(lookupName, value);
						}, this);
					} else {
						this.set(lookupName, null);
					}
				}, this);
				if (bq.queries.length) {
					bq.execute(callback, scope);
				} else {
					if (callback) {
						callback.call(scope || this, this);
					}
				}
			},

			/**
			 * @inheritdoc Terrasoft.BaseViewModel#loadEntity
			 * @overridden
			 */
			loadEntity: function(primaryColumnValue, callback, scope) {
				this.callParent([primaryColumnValue, function() {
					this.loadSchemaNames(callback, scope);
				}, this]);
			}

		},
		rules: {},
		userCode: {},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "actions",
				"values": {
					"visible": false
				}
			},
			{
				"operation": "insert",
				"name": "Name",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"layout": {
						"colSpan": 24,
						"column": 0,
						"row": 0
					}
				}
			},
			{
				"operation": "insert",
				"name": "SysEntitySchema",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"labelConfig": {
						"caption": {"bindTo": "Resources.Strings.SysEntitySchemaUIdLabel"}
					},
					"layout": {
						"colSpan": 24,
						"column": 0,
						"row": 1
					}
				}
			},
			{
				"operation": "insert",
				"name": "SysPageSchema",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"labelConfig": {
						"caption": {"bindTo": "Resources.Strings.SysPageSchemaUIdLabel"}
					},
					"layout": {
						"colSpan": 24,
						"column": 0,
						"row": 2
					}
				}
			},
			{
				"operation": "insert",
				"name": "Description",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 2,
						"column": 0,
						"row": 3
					},
					"contentType": Terrasoft.ContentType.LONG_TEXT
				}
			}
		]/**SCHEMA_DIFF*/

	};
});
