define("BaseProductDetailPageV2", ["BusinessRuleModule", "MoneyModule"], function(BusinessRuleModule) {
	return {
		entitySchemaName: "BaseProductEntry",
		attributes: {
			/**
			 * Единица измерения
			 * @type {Terrasoft.DataValueType.LOOKUP}
			 */
			"Unit": {
				lookupListConfig: {
					columns: [
						"[ProductUnit:Unit:Id].Id",
						"[ProductUnit:Unit:Id].IsBase",
						"[ProductUnit:Unit:Id].NumberOfBaseUnits"
					],
					filter: function() {
						if (this.get("Product")) {
							return Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
								"[ProductUnit:Unit:Id].Product.Id", this.get("Product").value);
						}
						return null;
					}
				}
			},

			/**
			 * Продукт
			 * @type {Terrasoft.DataValueType.LOOKUP}
			 */
			"Product": {
				lookupListConfig: {
					columns: ["[ProductUnit:Product:Id].NumberOfBaseUnits"],
					filter: function() {
						return Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
							"IsArchive", 0);
					}
				},
				isRequired: true
			},

			/**
			 * Сумма
			 * @type {Terrasoft.DataValueType.FLOAT}
			 */
			"Amount": {
				dependencies: [
					{
						columns: ["BaseQuantity"],
						methodName: "onBaseQuantityOrUnitChange"
					}
				]
			},

			/**
			 * Количество в базовых единицах измерения
			 * @type {Terrasoft.DataValueType.FLOAT}
			 */
			"BaseQuantity": {
				name: "BaseQuantity",
				dataValueType: Terrasoft.DataValueType.FLOAT,
				dependencies: [
					{
						columns: ["Quantity", "Unit"],
						methodName: "onQuantityOrUnitChange"
					}
				]
			},

			/**
			 * Прайс-лист
			 * @type {Terrasoft.DataValueType.LOOKUP}
			 */
			"PriceList": {
				lookupListConfig: {
					filter: function() {
						if (this.get("Product")) {
							return Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
								"[ProductPrice:PriceList:Id].Product.Id", this.get("Product").value);
						}
						return null;
					}
				},
				dependencies: [
					{
						columns: ["Product"],
						methodName: "onProductChange"
					}
				]
			},

			/**
			 * Цена продукта
			 * @type {Terrasoft.DataValueType.FLOAT}
			 */
			"Price": {
				name: "Price",
				dataValueType: Terrasoft.DataValueType.FLOAT,
				dependencies: [
					{
						columns: ["PriceList"],
						methodName: "onPriceListChange"
					}
				]
			},

			/**
			 * Флаг инициализации
			 * @type {Terrasoft.DataValueType.BOOLEAN}
			 */
			"IsInitialized": {
				dataValueType: Terrasoft.DataValueType.BOOLEAN
			}
		},
		methods: {

			/**
			 * Событие окончания инициализации сущности.
			 * @protected
			 * @virtual
			 */
			initEntity: function (callback, scope) {
				this.callParent([function() {
					if (!this.get("IsInitialized")) {
						Terrasoft.SysSettings.querySysSettings(["BasePriceList", "DefaultTax", "PriceWithTaxes"], function(values) {
							if (values.DefaultTax) {
								this.set("DefaultTax", values.DefaultTax);
								if (this.isAddMode()) {
									var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
										rootSchemaName: "Tax"
									});
									select.addColumn("Id");
									select.addColumn("Name");
									select.addColumn("Percent");
									select.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
										this.Terrasoft.ComparisonType.EQUAL, "Id", values.DefaultTax.value));
									select.execute(function(response) {
										response.collection.each(function(item) {
											this.set("Tax", values.DefaultTax);
											this.set("DiscountTax", item.get("Percent"));
										}, this);
									}, this);
								}
							}
							if (values.BasePriceList) {
								this.set("BasePriceList", values.BasePriceList);
							}
							if (values.PriceWithTaxes) {
								this.set("PriceWithTaxes", values.PriceWithTaxes);
							}
							this.set("IsInitialized", true);
							this.set("IsEntityInitialized", true);
							callback.call(scope || this);
						}, this);
					} else {
						callback.call(scope || this);
					}
				}, this]);

			},

			/**
			 * Устанавливает Количество, б.е - (Количество * Единица измерения продукта.Базовых единиц).
			 * При изменении поля "Единица измерения".
			 * @protected
			 */
			onQuantityOrUnitChange: function() {
				var unit = this.get("Unit");
				if (unit) {
					var quantity = this.get("Quantity");
					var numberOfBaseUnits = unit["[ProductUnit:Unit:Id].NumberOfBaseUnits"];
					if (!numberOfBaseUnits) {
						var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "ProductUnit"
						});
						select.addColumn("NumberOfBaseUnits");
						select.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "Unit.Id", unit.value));
						select.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "Product.Id", this.get("Product").value));
						select.execute(function(response) {
							response.collection.each(function(item) {
								unit["[ProductUnit:Unit:Id].NumberOfBaseUnits"] = item.get("NumberOfBaseUnits");
								this.set("BaseQuantity", quantity * item.get("NumberOfBaseUnits"));
							}, this);
						}, this);
					} else {
						this.set("BaseQuantity", quantity * numberOfBaseUnits);
					}
				}
			},

			/**
			 * Устанавливает Количество, б.е - (Количество * Единица измерения продукта.Базовых единиц).
			 * При изменении поля "Количество".
			 * @protected
			 */
			onBaseQuantityOrUnitChange: function() {
				this.calcAmount();
			},

			/**
			 * Рассчитывает сумму.
			 * @protected
			 */
			calcAmount: function() {
				var price = this.get("Price") || 0;
				var quantity = this.get("BaseQuantity") || this.get("Quantity") || 0;
				this.set("Amount", (price * quantity));
			},

			/**
			 * Обрабатывает изменение поля "Продукт".
			 * @protected
			 */
			onProductChange: function() {
				var priceList = this.get("PriceList");
				var basePriceList = this.get("BasePriceList");
				var product = this.get("Product");
				this.set("PriceList", null);
				if (!product || !basePriceList) {
					return;
				}
				this.set("PriceList", basePriceList);
			},

			/**
			 * Запрашивает дополнительные данные по прайс-листу.
			 * @protected
			 * @returns {boolean}
			 */
			requirePriceListData: function() {
				var priceList = this.get("PriceList");
				var product = this.get("Product");
				if (!priceList || !product) {
					this.set("PriceList", null);
					this.set("Price", 0);
					this.set("Tax", null);
					this.set("DiscountTax", 0);
					return false;
				}
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "ProductPrice"
				});
				select.addColumn("Price");
				select.addColumn("Currency.Id");
				select.addColumn("Tax");
				select.addColumn("Tax.Percent");
				select.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL, "PriceList", priceList.value));
				select.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL, "Product", this.get("Product").value));
				select.execute(function(response) {
					response.collection.each(function(item) {
						priceList.Price = item.get("Price");
						priceList["Currency.Id"] = item.get("Currency.Id");
						priceList.Tax = item.get("Tax");
						priceList["Tax.Percent"] = item.get("Tax.Percent");
					}, this);
					if (!this.Ext.isEmpty(priceList.Tax)) {
						this.set("Tax", priceList.Tax);
						this.set("DiscountTax", priceList["Tax.Percent"]);
					}
					this.onPriceListChange(true);
				}, this);
				return false;
			},

			/**
			 * Обрабатывает изменение поля "Прайс-лист".
			 * @protected
			 * @returns {boolean}
			 */
			onPriceListChange: function() {
				var product = this.get("Product");
				if (product && product.Unit) {
					this.set("Unit", product.Unit);
				}
				return this.requirePriceListData();
			}
		},
		rules: {
			/**
			 * Бизнес-правило поля "Прайс-лист"
			 */
			"PriceList": {
				"EnabledPriceList": {
					ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					property: BusinessRuleModule.enums.Property.ENABLED,
					conditions: [
						{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "Product"
							},
							comparisonType: this.Terrasoft.ComparisonType.IS_NOT_NULL
						}
					]
				}
			},
			"Name": {
				"BindParameterEnabledName": {
					"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					"property": BusinessRuleModule.enums.Property.ENABLED,
					"conditions": [
						{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							},
							"comparisonType": Terrasoft.ComparisonType.EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": false
			}
						}
					]
				}
		},
			"TotalAmount": {
				"BindParameterEnabledTotalAmount": {
					"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					"property": BusinessRuleModule.enums.Property.ENABLED,
					"conditions": [
						{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							},
							"comparisonType": Terrasoft.ComparisonType.EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": false
							}
						}
					]
				}
			},
			"PrimaryTotalAmount": {
				"BindParameterEnabledPrimaryTotalAmount": {
					"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					"property": BusinessRuleModule.enums.Property.ENABLED,
					"conditions": [
						{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							},
							"comparisonType": Terrasoft.ComparisonType.EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": false
							}
						}
					]
				}
			},
			"DiscountTax": {
				"BindParameterEnabledDiscountTax": {
					"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					"property": BusinessRuleModule.enums.Property.ENABLED,
					"conditions": [
						{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							},
							"comparisonType": Terrasoft.ComparisonType.EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": false
							}
						}
					]
				}
			},
			"TaxAmount": {
				"BindParameterEnabledTaxAmount": {
					"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					"property": BusinessRuleModule.enums.Property.ENABLED,
					"conditions": [
						{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							},
							"comparisonType": Terrasoft.ComparisonType.EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": false
							}
						}
					]
				}
			},
			"PrimaryTaxAmount": {
				"BindParameterEnabledPrymaryTaxAmount": {
					"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					"property": BusinessRuleModule.enums.Property.ENABLED,
					"conditions": [
						{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							},
							"comparisonType": Terrasoft.ComparisonType.EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": false
							}
						}
					]
				}
			},
			"Amount": {
				"BindParameterEnabledAmount": {
					"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					"property": BusinessRuleModule.enums.Property.ENABLED,
					"conditions": [
						{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							},
							"comparisonType": Terrasoft.ComparisonType.EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": false
							}
						}
					]
				}
			},
			"PrimaryAmount": {
				"BindParameterEnabledPrimaryAmount": {
					"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					"property": BusinessRuleModule.enums.Property.ENABLED,
					"conditions": [
						{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							},
							"comparisonType": Terrasoft.ComparisonType.EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": false
							}
						}
					]
				}
			}/*,
			"Unit": {
				"BindParameterEnabledAmount": {
					"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					"property": BusinessRuleModule.enums.Property.ENABLED,
					"conditions": [
						{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							},
							"comparisonType": Terrasoft.ComparisonType.EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": false
							}
						}
					]
				}
			}*/
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "remove",
				"name": "CustomProduct",
				"parentName": "BaseGeneralInfoBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "CustomProduct",
					"layout": {
						"column": 0,
						"row": 2,
						"colSpan": 24
					}
				}
			},
			{
				"operation": "move",
				"name": "Quantity",
				"parentName": "BaseGeneralInfoBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Quantity",
					"layout": {
						"column": 0,
						"row": 2,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "move",
				"name": "Unit",
				"parentName": "BaseGeneralInfoBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Unit",
					//"enabled": true,
					"layout": { "column": 12, "row": 2, "colSpan": 12 },
					"contentType": Terrasoft.ContentType.ENUM
				}
			},
			{
				"operation": "move",
				"name": "DeliveryDate",
				"parentName": "BaseGeneralInfoBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "DeliveryDate",
					"layout": {
						"column": 0,
						"row": 3,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "merge",
				"name": "AmountControlGroup",
				"parentName": "BaseProductPageGeneralTabContainer",
				"propertyName": "items",
				"values": {
					"controlConfig": {
						"collapsed": false
					}
				}
			},
			{
				"operation": "insert",
				"name": "PriceList",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "PriceList",
					"layout": { "column": 0, "row": 0, "colSpan": 12 },
					"contentType": Terrasoft.ContentType.ENUM
				}
			},
			{
				"operation": "move",
				"name": "Price",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Price",
					"layout": { "column": 0, "row": 1, "colSpan": 12 }
				}
			},
			{
				"operation": "move",
				"name": "Amount",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Amount",
					//"enabled": false,
					"layout": { "column": 12, "row": 1, "colSpan": 12 }
				}
			},
			{
				"operation": "move",
				"name": "DiscountPercent",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "DiscountPercent",
					"layout": { "column": 0, "row": 2, "colSpan": 12 }
				}
			},
			{
				"operation": "move",
				"name": "DiscountAmount",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "DiscountAmount",
					"layout": { "column": 12, "row": 2, "colSpan": 12 }
				}
			},
			{
				"operation": "move",
				"name": "Tax",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Tax",
					"layout": { "column": 0, "row": 3, "colSpan": 12 },
					"contentType": Terrasoft.ContentType.ENUM
				}
			},
			{
				"operation": "move",
				"name": "TaxAmount",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "TaxAmount",
					//"enabled": false,
					"layout": { "column": 0, "row": 4, "colSpan": 12 }
				}
			},
			{
				"operation": "move",
				"name": "DiscountTax",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "DiscountTax",
					//"enabled": false,
					"layout": { "column": 12, "row": 4, "colSpan": 12 }
				}
			},
			{
				"operation": "move",
				"name": "TotalAmount",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "TotalAmount",
					//"enabled": false,
					"layout": { "column": 0, "row": 5, "colSpan": 12 }
				}
			}
		]/**SCHEMA_DIFF*/
	};
});