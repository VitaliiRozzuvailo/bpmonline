define("ProductUnitPageV2", ["BusinessRuleModule"],
	function(BusinessRuleModule) {
		return {
			entitySchemaName: "ProductUnit",
			attributes: {
				/**
				 * Единица измерения.
				 * @type: {Terrasoft.DataValueType.LOOKUP}
				 */
				"Unit": {
					"isRequired": true
				},

				/**
				 * Предыдущая единица измерения.
				 * @type: {Terrasoft.DataValueType.FLOAT}
				 */
				"OldNumberOfBaseUnits": {
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: this.Terrasoft.DataValueType.FLOAT
				},

				/**
				 * Количество базовых единиц измерения.
				 * @type: {Terrasoft.DataValueType.FLOAT}
				 */
				"NumberOfBaseUnits": {
					dependencies: [
						{
							columns: ["IsBase"],
							methodName: "isBaseChange"
						}
					]
				},

				/**
				 * Флаг, возможно ли изменить базовую единицу
				 * @type: {Terrasoft.DataValueType.BOOLEAN}
				 */
				"CanChangeIsBase": {
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN
				},

				/**
				 * Флаг, единица измерения была изменена
				 * @type: {Terrasoft.DataValueType.BOOLEAN}
				 */
				"IsUnitChanged": { dataValueType: this.Terrasoft.DataValueType.BOOLEAN }
			},
			rules: {
				/**
				 * Бизнес-правило поля "Базовая"
				 */
				"IsBase": {
					"EnabledIsBase": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [
							{
								leftExpression: {
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: "CanChangeIsBase"
								},
								comparisonType: this.Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: false
								}
							}
						]
					}
				},

				/**
				 * Бизнес-правило поля "Количество базовых единиц"
				 */
				"NumberOfBaseUnits": {
					"EnabledNumberOfBaseUnits": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.ENABLED,
						conditions: [
							{
								leftExpression: {
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: "IsBase"
								},
								comparisonType: this.Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: false
								}
							}
						]
					},
					"RequiredNumberOfBaseUnits": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.REQUIRED,
						conditions: [
							{
								leftExpression: {
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: "IsBase"
								},
								comparisonType: this.Terrasoft.ComparisonType.EQUAL,
								rightExpression: {
									type: BusinessRuleModule.enums.ValueType.CONSTANT,
									value: false
								}
							}
						]
					}
				}
			},
			methods: {
				/**
				 * Получает запрос на изменение данных записи единицы измерения с признаком Базовая
				 * @protected
				 * @param id
				 * @param numberOfBaseUnits
				 * @returns {Terrasoft.UpdateQuery} Возвращает Запрос на изменение данных
				 */
				getProductUnitUpdateQuery: function(id, numberOfBaseUnits) {
					var update = this.Ext.create("Terrasoft.UpdateQuery", {
						rootSchemaName: "ProductUnit"
					});
					var product = this.get("Product");
					var oldNumberOfBaseUnits = this.get("OldNumberOfBaseUnits");
					oldNumberOfBaseUnits =
						(this.Ext.isEmpty(oldNumberOfBaseUnits) ||
							oldNumberOfBaseUnits === 0) ? 1 : oldNumberOfBaseUnits;
					var newNumberOfBaseUnits = numberOfBaseUnits / oldNumberOfBaseUnits;
					var filters = update.filters;
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Product", product.value));
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Id", id));
					update.setParameterValue("IsBase", false, this.Terrasoft.DataValueType.BOOLEAN);
					update.setParameterValue("NumberOfBaseUnits", newNumberOfBaseUnits,
						this.Terrasoft.DataValueType.FLOAT);
					return update;
				},

				/**
				 * Пересчитывает единицы измерения при изменении базовой единицы
				 * @param callback
				 */
				reCalcProductUnitAfterChangeBaseUnit: function(callback) {
					var product =  this.get("Product");
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "ProductUnit"
					});
					esq.addColumn("Id");
					esq.addColumn("Product");
					esq.addColumn("Unit");
					esq.addColumn("IsBase");
					esq.addColumn("NumberOfBaseUnits");
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Product.Id", product.value));
					esq.getEntityCollection(function(response) {
						if (response.success) {
							var batch = this.Ext.create("Terrasoft.BatchQuery");
							response.collection.each(function(item) {
								if (this.get("Id") !== item.get("Id")) {
									var update = this.getProductUnitUpdateQuery(
										item.get("Id"),
										item.get("NumberOfBaseUnits"));
									batch.add(update, function() {}, this);
								}
							}, this);
							batch.execute(function() {
								callback.call(this);
							}, this);
						} else {
							callback.call(this);
						}
					}, this);
				},

				/**
				 * Получает запрос на изменение данных записи продукта
				 * @protected
				 * @returns {Terrasoft.UpdateQuery} Возвращает Запрос на изменение данных
				 */
				getProductUpdateQuery: function() {
					var updateProduct = this.Ext.create("Terrasoft.UpdateQuery", {
						rootSchemaName: "Product"
					});
					var product = this.get("Product");
					var filters = updateProduct.filters;
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Id", product.value));
					updateProduct.setParameterValue("Unit", this.get("Unit").value, this.Terrasoft.DataValueType.GUID);
					return updateProduct;
				},

				/**
				 * Выполняет дополнительные действия после сохранения записи
				 * @protected
				 * @overriden
				 * @param response
				 * @param config
				 */
				onSaved: function(response, config) {
					var canSaved = (config && config.canSaved) ? config.canSaved : false;
					var isBase = this.get("IsBase");
					if (isBase && !canSaved) {
						this.reCalcProductUnitAfterChangeBaseUnit(function() {
							this.getProductUpdateQuery().execute(function() {
								var info = config || {};
								info.canSaved = true;
								this.onSaved(response, info);
							}, this);
						});
					}
					if (canSaved || !isBase) {
						if (isBase) {
							config.isSilent = true;
							this.callParent(arguments);
							var updateConfig = {detail: "ProductPriceDetail",
								reloadAll: true,
								primaryColumnValue: this.get(this.primaryColumnName)
							};
							this.sandbox.publish("UpdateDetail", updateConfig, [this.sandbox.id]);
							this.sandbox.publish("BackHistoryState");
						} else {
							this.callParent(arguments);
						}
					}
				},

				/**
				 * Выполняет дополнительные действия после инициализации сущности
				 * @protected
				 * @overriden
				 */
				onEntityInitialized: function() {
					this.callParent(arguments);
					this.canChangeIsBase();
				},

				/**
				 * Проверяет возможность изменения поля "Базовая"
				 * @protected
				 */
				canChangeIsBase: function() {
					this.set("CanChangeIsBase", this.get("IsBase"));
				},

				/**
				 * Обрабатывает изменение поля "Базовая"
				 * @protected
				 */
				isBaseChange: function() {
					var isBase = this.get("IsBase");
					if (isBase) {
						this.set("OldNumberOfBaseUnits", this.get("NumberOfBaseUnits"));
						this.set("NumberOfBaseUnits", 1);
					}
				},

				/**
				 * Производит пользовательскую валидацию полей сущности
				 * @protected
				 * @param callback
				 * @param scope
				 */
				validateUnit: function(callback, scope) {
					var result = {
						success: true
					};
					if (this.isNewMode() || this.changedValues.Unit) {
						var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "ProductUnit"
						});
						esq.addAggregationSchemaColumn("Id", this.Terrasoft.AggregationType.COUNT, "Count");
						esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "Product.Id", this.get("Product").value));
						var unit = this.get("Unit");
						esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "Unit.Id", unit.value));
						esq.getEntityCollection(function(response) {
							var unique = true;
							if (response.success) {
								unique = (response.collection.getCount() > 0 &&
									response.collection.getItems()[0].get("Count") > 0) ? false : true;
							}
							if (!unique) {
								result.message = this.get("Resources.Strings.UnitExistsMessage");
								result.success = false;
							}
							callback.call(scope || this, result);
						}, this);
					} else {
						callback.call(scope || this, result);
					}
				},

				/**
				 * Производит асинхронную валидацию полей сущности
				 * @protected
				 * @overriden
				 * @param callback
				 * @param scope
				 */
				asyncValidate: function(callback, scope) {
					this.callParent([function(response) {
						if (!this.validateResponse(response)) {
							return;
						}
						this.Terrasoft.chain(
							function(next) {
								this.validateUnit(function(response) {
									if (this.validateResponse(response)) {
										next();
									}
								}, this);
							},
							function(next) {
								callback.call(scope, response);
								next();
							}, this);
					}, this]);
				},

				/**
				 *  Возвращает пустую коллекцию действий карточки, если схема не администрируется по записям
				 *  УДАЛИТЬ КОГДА ИСПРАВЯТ В БАЗОВОЙ ВЕРСИИ
				 * @returns {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий карточки
				 */
				getActions: function() {
					var parentActions = this.callParent(arguments);
					if (parentActions && !this.getSchemaAdministratedByRecords()) {
						parentActions.clear();
					}
					return parentActions;
				}
			},
			diff: /**SCHEMA_DIFF*/[
// Tabs
				{
					"operation": "merge",
					"name": "Tabs",
					"values": {
						"visible": false
					}
				},
// Columns and details
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Product",
					"values": {
						"bindTo": "Product",
						"layout": { "column": 0, "row": 0, "colSpan": 12 },
						"enabled": false,
						"controlConfig": {
							"enableRightIcon": false
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "IsBase",
					"values": {
						"bindTo": "IsBase",
						"layout": { "column": 12, "row": 0, "colSpan": 12 }
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Unit",
					"values": {
						"bindTo": "Unit",
						"layout": { "column": 0, "row": 1, "colSpan": 12 },
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "NumberOfBaseUnits",
					"values": {
						"bindTo": "NumberOfBaseUnits",
						"layout": { "column": 12, "row": 1, "colSpan": 12 }
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});