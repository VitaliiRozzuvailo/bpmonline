define("OrderProductPageV2", ["MoneyModule"],
		function(MoneyModule) {
			return {
				entitySchemaName: "OrderProduct",
				attributes: {
					/**
					 * Валюта
					 */
					"Currency": {
						dataValueType: Terrasoft.DataValueType.FLOAT,
						lookupListConfig: {
							columns: ["Division"]
						}
					},
					"Order": {
						lookupListConfig: {
							columns: ["CurrencyRate", "Currency", "Currency.Division"]
						}
					},
					"PrimaryPrice": {
						dependencies: [
							{
								columns: ["Price", "Amount", "DiscountAmount", "TaxAmount", "TotalAmount"],
								methodName: "calculatePrimaryValues"
							}
						]
					}
				},
				methods: {
					/**
					 * Инициализация значений для финансовых расчетов
					 * @protected
					 */
					onEntityInitialized: function() {
						this.callParent(arguments);
						this.set("ProductEntryMasterRecord", this.get("Order"));
					},

					/**
					 * Возвращает коэффициент деления.
					 * @protected
					 */
					getCurrencyDivision: function() {
						var currency = this.get("Currency");
						return currency && currency.Division;
					},

					calculatePrimaryValues: function() {
						var columnName = arguments[arguments.length - 1];
						MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", columnName, "Primary" + columnName,
							this.getCurrencyDivision());
					}
				},
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "insert",
						"name": "Order",
						"parentName": "BaseGeneralInfoBlock",
						"propertyName": "items",
						"values": {
							"bindTo": "Order",
							"enabled": false,
							"layout": {
								"column": 0,
								"row": 0,
								"colSpan": 12
							}
						}
					}, {
						"operation": "remove",
						"name": "DeliveryDate"
					}
				]/**SCHEMA_DIFF*/
			};
		});