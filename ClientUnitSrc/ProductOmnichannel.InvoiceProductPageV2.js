define("InvoiceProductPageV2", ["MoneyModule"],
	function(MoneyModule) {
		return {
			entitySchemaName: "InvoiceProduct",
			methods: {
				/**
				 * Обрабатывает выбор продукта.
				 * @protected
				 */
				onProductSelect: this.Ext.emptyFn,

				/**
				 * Загрузка данных по валюте счета.
				 * @param {Function} callback
				 * @param {Object} scope
				 */
				loadCurrencyInvoice: function (callback, scope) {
					var invoice = this.get("Invoice");
					if (invoice && !invoice.CurrencyRate) {
						var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "Invoice"
						});
						select.addColumn("Currency.Division");
						select.addColumn("CurrencyRate");
						select.addColumn("Currency");
						select.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "Id", invoice.value));
						select.execute(function (response) {
							response.collection.each(function (item) {
								invoice["Currency.Division"] = item.get("Currency.Division");
								invoice.CurrencyRate = item.get("CurrencyRate");
								invoice.Currency = item.get("Currency");
								callback.call(scope || this);
							}, this);
						}, this);
					}
				},

				/**
				 * Обрабатывает изменение поля "Прайс-лист".
				 * @protected
				 */
				onPriceListChange: function(isNotNeedCallParent) {
					var result = true;
					var invoice = this.get("Invoice");
					if (!invoice) {
						return;
					}
					if (!isNotNeedCallParent) {
						result = this.callParent(arguments);
					}
					if (result) {
						if (invoice && !invoice.CurrencyRate) {
							this.loadCurrencyInvoice(this.setPriceAsync, this);
						} else {
							this.setPriceAsync();
						}
					}
				},

				/**
				 * Установка цены асинхронная.
				 */
				setPriceAsync: function() {
					var priceList = this.get("PriceList");
					var product = this.get("Product");
					if (product) {
						var priceListPrice = priceList.Price || product.Price || 0;
						MoneyModule.onLoadCurrencyRate.call(
							this, priceList["Currency.Id"], null,
							function (item) {
								this.setPrice(priceListPrice, item.Division, item.Rate);
							},
							function () {
								this.setPrice(priceListPrice, 1, 1);
							}
						);
					}
				},

				/**
				 * Устанавливает цену продукта.
				 * @param {Number} priceListPrice Цена прайс листа.
				 * @param {Number} division Делитель.
				 * @param {Number} rate Курс.
				 */
				setPrice: function(priceListPrice, division, rate) {
					var invoice = this.get("Invoice");
					var divisionNew = (division === 0) ? 1 : division;
					var rateNew = (rate === 0) ? 1 : rate;
					var price = (priceListPrice * invoice.CurrencyRate * divisionNew) / (rateNew * invoice["Currency.Division"]);
					this.set("Price", price);
				}
			}
		};
	});
