// D9 Team
define("ProductStockBalancePageV2", [],
	function() {
		return {
			entitySchemaName: "ProductStockBalance",
			attributes: {

				/**
				 * Доступное количество продукта
				 * @type {Terrasoft.DataValueType.FLOAT}
				 */
				"AvailableQuantity": {
					dependencies: [ {
						columns: ["TotalQuantity", "ReserveQuantity"],
						methodName: "recalculateAvailableQuantity"
					}]
				}
			},
			methods: {

				/**
				 * Пересчет доступного количества продукта на складе
				 * @protected
				 */
				recalculateAvailableQuantity: function() {
					var totalQuantity = this.get("TotalQuantity") || 0.0;
					var reserveQuantity = this.get("ReserveQuantity") || 0.0;
					var availableQuantity = totalQuantity - reserveQuantity;
					this.set("AvailableQuantity", availableQuantity);
				},

				/**
				 * Валидация выбранного склада. Проверка уникальности склада для продукта
				 * @protected
				 * @virtual
				 * @param callback Функция обратного вызова для асинхронной валидации
				 * @param scope Контекст выполнения
				 */
				validateWarehouse:  function(callback, scope) {
					var result = {
						success: true
					};
					var product = this.get("Product");
					var warehouse = this.get("Warehouse");
					if (this.Ext.isEmpty(product) || this.Ext.isEmpty(warehouse)) {
						result.message = this.get("Resources.Strings.CantCheckWarehouseError");
						result.success = false;
						callback.call(scope || this, result);
						return;
					}
					if (this.isNewMode() || this.changedValues.Warehouse) {
						var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "ProductStockBalance"
						});
						select.addAggregationSchemaColumn("Id", Terrasoft.AggregationType.COUNT, "IdCOUNT");
						select.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"Product", product.value));
						select.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"Warehouse", warehouse.value));
						select.getEntityCollection(function(response) {
							if (response.success) {
								if (response.collection.getCount() < 1) {
									result.message = this.get("Resources.Strings.CantCheckWarehouseError");
									result.success = false;
								} else {
									var selectResult  =  response.collection.getByIndex(0);
									var warehousesCount = selectResult.get("IdCOUNT");
									if (warehousesCount > 0) {
										result.message = this.get("Resources.Strings.WarehouseExists");
										result.success = false;
									}
								}
							} else {
								result.message = this.get("Resources.Strings.CantCheckWarehouseError");
								result.success = false;
							}
							callback.call(scope || this, result);
						}, this);
					} else {
						callback.call(scope || this, result);
					}
				},

				/**
				 * Асинхронная валидация карточки
				 * @protected
				 * @override
				 * @param callback Функция обратного вызова
				 * @param scope Контекст выполнения
				 */
				asyncValidate: function(callback, scope) {
					this.callParent([function(response) {
						if (!this.validateResponse(response)) {
							return;
						}
						Terrasoft.chain(
							function(next) {
								this.validateWarehouse(function(response) {
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
					"name": "Warehouse",
					"values": {
						"bindTo": "Warehouse",
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": { "column": 0, "row": 1, "colSpan": 12 }
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "TotalQuantity",
					"values": {
						"bindTo": "TotalQuantity",
						"layout": { "column": 12, "row": 0, "colSpan": 12 },
						"controlConfig": {"decimalPrecision": 3}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "ReserveQuantity",
					"values": {
						"bindTo": "ReserveQuantity",
						"layout": { "column": 12, "row": 1, "colSpan": 12 },
						"controlConfig": {"decimalPrecision": 3}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "AvailableQuantity",
					"values": {
						"bindTo": "AvailableQuantity",
						"layout": { "column": 12, "row": 2, "colSpan": 12 },
						"enabled": false,
						"controlConfig": {"decimalPrecision": 3}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});