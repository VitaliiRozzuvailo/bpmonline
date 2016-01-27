define("OrderProductPageV2", ["MoneyModule"],
	function(MoneyModule) {
		return {
			entitySchemaName: "OrderProduct",
			attributes: {
				"Order": {
					lookupListConfig: {
						columns: ["CurrencyRate", "Currency", "Currency.Division"]
					}
				},
				"Currency": {
					lookupListConfig: {
						columns: ["Division"]
					}
				}
			},
			methods: {

				/**
				 * Загрузка данных по валюте заказа
				 * @param {Function} callback
				 * @param {Object} scope
				 */
				loadCurrencyOrder: function(callback, scope) {
					var order = this.get("Order");
					if (order && !order.CurrencyRate) {
						var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "Order"
						});
						select.addColumn("Currency.Division");
						select.addColumn("CurrencyRate");
						select.addColumn("Currency");
						select.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "Id", order.value));
						select.execute(function(response) {
							response.collection.each(function(item) {
								order["Currency.Division"] = item.get("Currency.Division");
								order.CurrencyRate = item.get("CurrencyRate");
								order.Currency = item.get("Currency");
								callback.call(scope || this);
							}, this);
						}, this);
					}
				},

				/**
				 * Обрабатывает выбор продукта
				 * @protected
				 */
				onProductSelect: this.Ext.emptyFn,

				/**
				 * Обрабатывает изменение поля "Прайс-лист"
				 * @protected
				 * @param {Bool} isNotNeedCallParent
				 */
				onPriceListChange: function(isNotNeedCallParent) {
					var result = true;
					var order = this.get("Order");
					if (!order) {
						return;
					}
					if (!isNotNeedCallParent) {
						result = this.callParent(arguments);
					}
					if (result) {
						if (order && !order.CurrencyRate) {
							this.loadCurrencyOrder(this.setPriceAsync, this);
						} else {
							this.setPriceAsync();
						}
					}
				},

				/**
				 * Установка цены асинхронная
				 */
				setPriceAsync: function() {
					var priceList = this.get("PriceList");
					var product = this.get("Product");
					if (product) {
						var priceListPrice = priceList.Price || product.Price || 0;
						MoneyModule.onLoadCurrencyRate.call(
							this, priceList["Currency.Id"], null,
							function(item) {
								this.setPrice(priceListPrice, item.Division, item.Rate);
							},
							function() {
								this.setPrice(priceListPrice, 1, 1);
							}
						);
					}
				},

				/**
				 * Устанавливает цену продукта
				 * @param {String} priceListPrice Делитель
				 * @param {float} division Делитель
				 * @param {float} rate Курс
				 */
				setPrice: function(priceListPrice, division, rate) {
					var productCurrencyRate = this.get("CurrencyRate");
					var productDivision = this.getColumnData("Currency", "Division");
					var divisionNew = (division === 0) ? 1 : division;
					var rateNew = (rate === 0) ? 1 : rate;
					var price = (priceListPrice * productCurrencyRate * divisionNew) / (rateNew * productDivision);
					this.set("Price", price);
				},

				/**
				 * Возвращает значение либо с объекта вычитаного с страницы либо с детали.
				 * @private
				 * @param {String} table Имя таблицы.
				 * @param {String} column Имя колонки.
				 * @param {Object} scope контестк.
				 * @return {Object} Возвращает искомый объект.
				 */
				getColumnData: function(table, column, scope) {
					scope = scope || this;
					if (scope.get(table) && scope.get(table)[column]) {
						scope.set(Ext.String.format("{0}.{1}", table, column), scope.get(table)[column]);
					}
					return scope.get(Ext.String.format("{0}.{1}", table, column));
				}
			}
		};
	}
);
