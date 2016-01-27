define("ProductUtilitiesV2", ["ConfigurationConstants", "MoneyModule"],
	function() {
		/**
		 * @class Terrasoft.configuration.ProductUtilities
		 * Вспомогательный класс
		 */
		Ext.define("Terrasoft.configuration.ProductUtilities", {
			alternateClassName: "Terrasoft.ProductUtilities",

			/**
			 * Количество разрядов числа без разделителя
			 * @public
			 * @type {Terrasoft.Resources.CultureSettings}
			 */
			NumberGroupSizes: Terrasoft.Resources.CultureSettings.numberGroupSizes,

			/**
			 * Признак использования разделения разрядов числа
			 * @public
			 * @type {Boolean}
			 */
			UseThousandSeparator: true,

			/**
			 * Разделитель разрядов числа
			 * @public
			 * @type {Terrasoft.Resources.CultureSettings}
			 */
			ThousandSeparator: Terrasoft.Resources.CultureSettings.thousandSeparator,

			/**
			 * Шаблон разделителей целой и дробной части
			 * @protected
			 * @overridden
			 * @type {RegExp}
			 */
			DecimalSeparatorsRe: /[,.]/,

			/**
			 * Разделитель целой и десятичной части числа
			 * @overridden
			 * @type {Terrasoft.Resources.CultureSettings}
			 */
			DecimalSeparator: Terrasoft.Resources.CultureSettings.decimalSeparator,

			/**
			 * Точность десятичной части числа (количество цифр после разделителя)
			 * @overridden
			 * @type {Number}
			 */
			DecimalPrecision: 2,

			DisplayNumberConfig: null,

			/**
			 * Значение системной настройки Цена с налогом.
			 * @type {Object}
			 */
			PriceWithTaxes: null,

			/**
			 * Инициализирует параметры элемента управления
			 * @protected
			 * @overridden
			 */
			initDisplayNumberConfig: function() {
				var thousandSeparator = this.ThousandSeparator;
				this.ThousandSeparatorRe = new RegExp(thousandSeparator, "g");

				this.DisplayNumberConfig = {
					decimalPrecision: this.DecimalPrecision,
					decimalSeparator: this.DecimalSeparator,
					useThousandSeparator: this.UseThousandSeparator,
					thousandSeparator:  this.ThousandSeparator,
					numberGroupSizes: this.NumberGroupSizes
				};
			},
			/**
			 * Преобразует строку value в число с учетом второго параметра, если type равно Terrasoft.DataValueType.INTEGER
			 * метод вернет целое число,
			 * если type равно Terrasoft.DataValueType.FLOAT метод вернет число с плавающей точкой.
			 * Если параметр value это число функция вернет его без преобразования.
			 * @protected
			 * @param  {String/Number} value Строка которую нужно преобразовать в число
			 * Terrasoft.DataValueType.INTEGER и Terrasoft.DataValueType.FLOAT
			 * @return {Number} число после преобразования входной строки
			 */
			parseNumber: function(value) {
				return Terrasoft.parseNumber(value, this.DisplayNumberConfig);
			},

			/**
			 * Метод форматирует строку/число согласно заданному конфигурационному объекту.
			 * @protected
			 * @param  {Number/String} value Число дял форматирования
			 * @return {String} Отформатированная строка
			 */
			getFormattedNumberValue: function(value) {
				var config = Ext.apply({}, this.DisplayNumberConfig);
				return Terrasoft.getFormattedNumberValue(value, config);
			},

			/**
			 * Устанавливает Количество и Количество в б.е.
			 * @param {BaseViewModel} productModel Модель продукта.
			 * @param {Function} callback функция.
			 * @param {Object} scope Контекст.
			 */
			setNumberOfBaseUnitsAndBaseQuantity: function(productModel, callback, scope) {
				var unit = productModel.get("Unit");
				if (unit) {
					var quantity = productModel.get("Quantity") || productModel.get("Count") || 0;
					var select = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "ProductUnit"
					});
					select.addColumn("NumberOfBaseUnits");
					select.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Unit.Id", unit.value));
					select.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Product.Id", productModel.get("RealRecordId")));
					select.execute(function(response) {
						response.collection.each(function(item) {
							unit.NumberOfBaseUnits = item.get("NumberOfBaseUnits");
							productModel.set("BaseQuantity", quantity * item.get("NumberOfBaseUnits"));
						}, this);
						if (response.collection.getCount() < 1) {
							productModel.set("BaseQuantity", quantity);
						}
						if (Ext.isFunction(callback)) {
							callback.call(scope);
						}
					}, this);
				}
			},

			/**
			 * Рассчитывает сумму.
			 * @protected
			 */
			calcAmount: function(price, quantity) {
				if (!Ext.isEmpty(price) && !Ext.isEmpty(quantity)) {
					return price * quantity;
				}
				return 0;
			},

			/**
			 * Рассчитывает процент скидки.
			 * @protected
			 */
			calcDiscountPercent: function(amount, discountAmount) {
				if (!Ext.isEmpty(amount) && !Ext.isEmpty(discountAmount) && amount > 0 && discountAmount > 0) {
					var percent = Math.round(((discountAmount * 100) / amount) * 100) / 100;
					if (percent > 100) {
						percent = 100;
					}
					return percent;
				} else if (Ext.isEmpty(discountAmount) || discountAmount === 0) {
					return 0;
				}
				return 0;
			},

			/**
			 * Рассчитывает сумму скидки.
			 * @protected
			 */
			calcDiscountAmount: function(amount, discountPercent) {
				if (discountPercent > 100) {
					discountPercent = 100;
				}
				var newDiscountAmount = 0;
				if (!Ext.isEmpty(amount) && !Ext.isEmpty(discountPercent)) {
					newDiscountAmount = Math.round(((amount * discountPercent) / 100) * 100) / 100;
					if (newDiscountAmount > amount) {
						newDiscountAmount = amount;
					}
				}
				return newDiscountAmount;
			},

			/**
			 * Рассчитывает общую сумму со скидкой.
			 * @protected
			 * @returns {number} Возвращает расчитанную общую сумму.
			 */
			calcTotalAmountWithDiscount: function(amount, discountAmount) {
				if (Ext.isEmpty(amount)) {
					amount = 0;
				}
				if (Ext.isEmpty(discountAmount)) {
					discountAmount = 0;
				}
				if (discountAmount > amount) {
					discountAmount = amount;
				}
				return (amount - discountAmount);
			},

			/**
			 * Рассчитывает сумму налога.
			 * @protected
			 * @returns {number} Возвращает расчитанную сумму налога.
			 */
			calcTaxAmount: function(totalAmount, discountTax) {
				discountTax = (Ext.isEmpty(discountTax)) ? 0 : ((discountTax > 100) ? 100 : discountTax);
				var taxAmount = 0;
				if (this.PriceWithTaxes) {
					taxAmount = Math.round(((totalAmount * discountTax) / (100 + discountTax)) * 100) / 100;
				} else {
					taxAmount = Math.round(totalAmount * discountTax) / 100;
				}
				return taxAmount;
			},

			/**
			 * Рассчитывает общую сумму.
			 * @protected
			 */
			calcTotalAmount: function(totalAmount, taxAmount) {
				if (!this.PriceWithTaxes) {
					totalAmount += taxAmount;
				}
				return totalAmount;
			},

			/**
			 * Рассчитывает стоимость продукта.
			 * @param {Object} productModel Модель продукта.
			 */
			calculateProduct: function(productModel) {
				var baseQuantity = productModel.get("BaseQuantity");
				var price = productModel.get("Price");
				var amount = this.calcAmount(price, baseQuantity);
				var discountPercent = productModel.get("DiscountPercent") || 0;
				var discountAmount = productModel.get("DiscountAmount") || 0;
				if (discountAmount) {
					discountPercent = this.calcDiscountPercent(amount, discountAmount);
				} else if (discountPercent) {
					discountAmount = this.calcDiscountAmount(amount, discountPercent);
				}
				var totalAmountWithDiscount = this.calcTotalAmountWithDiscount(amount, discountAmount);
				var discountTax = productModel.get("DiscountTax") || 0;
				var taxAmount = this.calcTaxAmount(totalAmountWithDiscount, discountTax);
				var totalAmount = this.calcTotalAmount(totalAmountWithDiscount, taxAmount);

				productModel.set("Amount", amount);
				productModel.set("DiscountPercent", discountPercent);
				productModel.set("DiscountAmount", discountAmount);
				productModel.set("DiscountTax", discountTax);
				productModel.set("TaxAmount", taxAmount);
				productModel.set("TotalAmount", totalAmount);
			}

		});
		var productUtilities = Ext.create(Terrasoft.configuration.ProductUtilities);
		productUtilities.initDisplayNumberConfig();
		return productUtilities;
	});
