define("BaseProductDetailPageV2", ["BusinessRuleModule", "MoneyModule"], function(BusinessRuleModule, MoneyModule) {
	return {
		entitySchemaName: "BaseProductEntry",
		attributes: {
			/**
			 * Продукт
			 * @type {Terrasoft.DataValueType.LOOKUP}
			 */
			"Product": {
				lookupListConfig: {
					columns: ["Currency", "Currency.Division", "Price", "Unit", "Tax", "Tax.Percent"]
				}
			},

			/**
			 * Налог
			 * @type {Terrasoft.DataValueType.LOOKUP}
			 */
			"Tax": {
				lookupListConfig: {
					columns: ["Percent"]
				}
			},

			/**
			 * Налог в процентах
			 * @type {Terrasoft.DataValueType.FLOAT}
			 */
			"DiscountTax": {
				name: "DiscountTax",
				dataValueType: Terrasoft.DataValueType.FLOAT,
				dependencies: [
					{
						columns: ["Tax"],
						methodName: "onTaxChange"
					}
				]
			},

			/**
			 * Сумма налога
			 * @type {Terrasoft.DataValueType.FLOAT}
			 */
			"TaxAmount": {
				name: "TaxAmount",
				dataValueType: Terrasoft.DataValueType.FLOAT,
				dependencies: [
					{
						columns: ["Amount", "DiscountTax"],
						methodName: "setTaxAmount"
					}
				]
			},

			/**
			 * Цена
			 * @type {Terrasoft.DataValueType.FLOAT}
			 */
			"Price": {
				name: "Price",
				dataValueType: Terrasoft.DataValueType.FLOAT,
				dependencies: [
					{
						columns: ["Product"],
						methodName: "onProductSelect"
					}
				]
			},

			/**
			 * Сумма
			 * @type {Terrasoft.DataValueType.FLOAT}
			 */
			"Amount": {
				name: "Amount",
				dataValueType: Terrasoft.DataValueType.FLOAT,
				dependencies: [
					{
						columns: ["Price", "Quantity"],
						methodName: "calcAmount"
					}
				]
			},

			/**
			 * Процент скидки
			 * @type {Terrasoft.DataValueType.FLOAT}
			 */
			"DiscountPercent": {
				name: "DiscountPercent",
				dataValueType: Terrasoft.DataValueType.FLOAT,
				dependencies: [
					{
						columns: ["DiscountAmount"],
						methodName: "calcDiscountPercent"
					}
				]
			},

			/**
			 * Сумма скидки
			 * @type {Terrasoft.DataValueType.FLOAT}
			 */
			"DiscountAmount": {
				name: "DiscountAmount",
				dataValueType: Terrasoft.DataValueType.FLOAT,
				dependencies: [
					{
						columns: ["Amount", "DiscountPercent"],
						methodName: "calcDiscountAmount"
					}
				]
			},

			/**
			 * Общая сумма
			 * @type {Terrasoft.DataValueType.FLOAT}
			 */
			"TotalAmount": {
				name: "TotalAmount",
				dataValueType: Terrasoft.DataValueType.FLOAT,
				dependencies: [
					{
						columns: ["Amount", "TaxAmount", "DiscountAmount"],
						methodName: "setTotalAmount"
					}
				]
			},

			/**
			 * Название
			 * @type {String}
			 */
			"Name": {
				name: "Name",
				dataValueType: Terrasoft.DataValueType.TEXT,
				dependencies: [
					{
						columns: ["CustomProduct", "Product"],
						methodName: "changeProductName"
					}
				]
			}
		},
		methods: {

			/**
			 * Инициализирует начальные значения модели
			 * @virtual
			 * @overriden
			 */
			init: function() {
				Terrasoft.SysSettings.querySysSettingsItem("PriceWithTaxes", function(value) {
					if (value) {
						this.set("PriceWithTaxes", value);
					}
				}, this);
				this.callParent(arguments);
			},

			/**
			 * Изменяет название продукта
			 * @protected
			 */
			changeProductName: function() {
				var product = this.get("Product");
				var customProduct = this.get("CustomProduct");
				var caption = product && product.displayValue ? product.displayValue : customProduct;
				this.set("ShowSaveButton", true);
				this.set("Name", caption);
			},

			/**
			 * Устанавливает значения по умолчанию
			 * @protected
			 * @overridden
			 */
			getDefaultValues: function() {
				var defValues = this.callParent(arguments);
				if (this.Ext.isEmpty(this.get("Quantity"))) {
					defValues.push({
						name: "Quantity",
						value: 1
					});
				}
				if (this.Ext.isEmpty(this.get("DiscountPercent"))) {
					defValues.push({
						name: "DiscountPercent",
						value: 0
					});
				}
				this.set("DefaultValues", this.Terrasoft.deepClone(defValues));
				return defValues;
			},

			/**
			 * Изменяет значение налога
			 * @protected
			 */
			onTaxChange: function() {
				var tax = this.get("Tax");
				var taxPercent = (!this.Ext.isEmpty(tax)) ? tax.Percent : null;
				this.set("DiscountTax", taxPercent);
			},

			/**
			 * Обрабатывает выбор продукта
			 * @protected
			 * @virtual
			 */
			onProductSelect: function() {
				if (!this.changedValues.IsChanged) { return; }
				var product = this.get("Product");
				this.set("Tax", null);
				this.set("Unit", null);
				if (this.Ext.isEmpty(product)) {
					this.set("Price", 0);
					return;
				}
				if (!this.Ext.isEmpty(product.Tax)) {
					product.Tax.Percent = product["Tax.Percent"];
					this.set("Tax", product.Tax);
				}
				if (!this.Ext.isEmpty(product.Unit)) {
					this.set("Unit", product.Unit);
				}
				if (product && product.Currency) {
					MoneyModule.onLoadCurrencyRate.call(this, product.Currency.value, null, function(item) {
						var master = this.get("ProductEntryMasterRecord");
						var price = 0.0;
						if (!master) { return; }
						if (product.Currency.value !== master.Currency.value) {
							var price = (product.Price * master.CurrencyRate * item.Division) / (item.Rate * master["Currency.Division"]);
						} else {
							price = product.Price;
						}
						this.set("Price", price);
					});
				}
			},

			/**
			 * Рассчитывает сумму
			 * @protected
			 */
			calcAmount: function() {
				var price = this.get("Price");
				var quantity = this.get("Quantity");
				if (!this.Ext.isEmpty(price) && !this.Ext.isEmpty(quantity)) {
					this.set("Amount", (price * quantity));
				}
			},

			/**
			 * Рассчитывает процент скидки
			 * @protected
			 */
			calcDiscountPercent: function() {
				var amount = this.get("Amount");
				var discountPercent = this.get("DiscountPercent");
				var discountAmount = this.get("DiscountAmount");
				if (!this.Ext.isEmpty(amount) && !this.Ext.isEmpty(discountAmount) && amount > 0 && discountAmount > 0) {
					var percent = Math.round(((discountAmount * 100) / amount) * 100) / 100;
					if (percent > 100) {
						percent = 100;
					}
					if (discountPercent !== percent) {
						this.set("DiscountPercent", percent);
					}
				} else if (this.Ext.isEmpty(discountAmount) || discountAmount === 0) {
					if (discountPercent !== 0) {
						this.set("DiscountPercent", 0);
					}
				}
			},

			/**
			 * Рассчитывает сумму скидки
			 * @protected
			 */
			calcDiscountAmount: function() {
				var amount = this.get("Amount");
				var discountPercent = this.get("DiscountPercent");
				if (discountPercent > 100) {
					discountPercent = 100;
				}
				var newDiscountAmount = 0;
				if (!this.Ext.isEmpty(amount) && !this.Ext.isEmpty(discountPercent)) {
					newDiscountAmount = Math.round(((amount * discountPercent) / 100) * 100) / 100;
					if (newDiscountAmount > amount) {
						newDiscountAmount = amount;
					}
				}
				if (this.get("DiscountAmount") !== newDiscountAmount) {
					this.set("DiscountAmount", newDiscountAmount);
				}
				var taxAmount = this.calcTaxAmount();
				if (this.get("TaxAmount") !== taxAmount) {
					this.set("TaxAmount", taxAmount);
				}
			},

			/**
			 * Рассчитывает общую сумму
			 * @protected
			 * @returns {number} Возвращает расчитанную общую сумму
			 */
			calcTotalAmount: function() {
				var amount = this.get("Amount");
				if (this.Ext.isEmpty(amount)) {
					amount = 0;
				}
				var discountAmount =  this.get("DiscountAmount");
				if (this.Ext.isEmpty(discountAmount)) {
					discountAmount = 0;
				}
				if (discountAmount > amount) {
					discountAmount = amount;
				}
				return (amount - discountAmount);
			},

			/**
			 * Рассчитывает сумму налога
			 * @protected
			 * @returns {number} Возвращает расчитанную сумму налога
			 */
			calcTaxAmount: function() {
				var totalAmount = this.calcTotalAmount();
				var discountTax = this.get("DiscountTax");
				discountTax = (this.Ext.isEmpty(discountTax)) ? 0 : ((discountTax > 100) ? 100 : discountTax);
				var taxAmount = 0;
				if (this.get("PriceWithTaxes")) {
					taxAmount = Math.round(((totalAmount * discountTax) / (100 + discountTax)) * 100) / 100;
				} else {
					taxAmount = Math.round(totalAmount * discountTax) / 100;
				}
				return taxAmount;
			},

			/**
			 * Устанавливает сумму налога
			 * @protected
			 */
			setTaxAmount: function() {
				var taxAmount = this.calcTaxAmount();
				if (this.get("TaxAmount") !== taxAmount) {
					this.set("TaxAmount", taxAmount);
				}
			},

			/**
			 * Устанавливает общую сумму
			 * @protected
			 */
			setTotalAmount: function() {
				var totalAmount = this.calcTotalAmount();
				var taxAmount = this.calcTaxAmount();
				if (!this.get("PriceWithTaxes")) {
					totalAmount += taxAmount;
				}
				if (this.get("TotalAmount") !== totalAmount) {
					this.set("TotalAmount", totalAmount);
				}
			},

			/**
			 * Валидирует значения модели представления.
			 * Если присутствуют некорректные значения, выводит сообщение о необходимости заполнения первого.
			 * Иначе вызывается callback-функция.
			 * @protected
			 * @overridden
			 * @param {Function} callback callback-функция
			 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции
			 * @returns {Boolean} возвращает результат валидации
			 */
			validate: function() {
				var product = this.get("Product");
				var customProduct = this.get("CustomProduct");
				if (this.Ext.isEmpty(product) && this.Ext.isEmpty(customProduct)) {
					this.showInformationDialog(this.get("Resources.Strings.WarningProductCustomProductRequire"));
					return false;
				}
				//TODO: this solution is temporary, may be reviewed in future, if hints are available
				var quantity = this.get("Quantity");
				if (quantity < 0) {
					this.showInformationDialog(this.get("Resources.Strings.FieldMustBeGreaterOrEqualZeroMessage"));
					return false;
				}

				var date = this.get("DeliveryDate");
				if (this.Ext.isEmpty(date)) {
					this.set("DeliveryDate", null);
				}
				return this.callParent(arguments);
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "remove",
				"name": "actions"
			},
			{
				"operation": "insert",
				"name": "BaseProductPageGeneralTabContainer",
				"parentName": "CardContentContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "BaseGeneralInfoGroup",
				"parentName": "BaseProductPageGeneralTabContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"items": [],
					"controlConfig": {
						"collapsed": false
					}
				}
			},
			{
				"operation": "insert",
				"name": "BaseGeneralInfoBlock",
				"parentName": "BaseGeneralInfoGroup",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "Product",
				"parentName": "BaseGeneralInfoBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Product",
					"layout": {
						"column": 0,
						"row": 1,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
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
				"operation": "insert",
				"name": "Quantity",
				"parentName": "BaseGeneralInfoBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Quantity",
					"layout": {
						"column": 0,
						"row": 3,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "Unit",
				"parentName": "BaseGeneralInfoBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Unit",
					"enabled": false,
					"layout": {
						"column": 12,
						"row": 3,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "DeliveryDate",
				"parentName": "BaseGeneralInfoBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "DeliveryDate",
					"layout": {
						"column": 0,
						"row": 4,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "AmountControlGroup",
				"parentName": "BaseProductPageGeneralTabContainer",
				"propertyName": "items",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.AmountGroupCaption"
					},
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"items": [],
					"controlConfig": {
						"collapsed": false
					}
				}
			},
			{
				"operation": "insert",
				"name": "AmountBlock",
				"parentName": "AmountControlGroup",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "Price",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Price",
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "Amount",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Amount",
					"enabled": false,
					"layout": {
						"column": 12,
						"row": 0,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "DiscountPercent",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "DiscountPercent",
					"layout": {
						"column": 0,
						"row": 1,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "DiscountAmount",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "DiscountAmount",
					"layout": {
						"column": 12,
						"row": 1,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "Tax",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Tax",
					"layout": {
						"column": 0,
						"row": 2,
						"colSpan": 12
					},
					"contentType": Terrasoft.ContentType.ENUM
				}
			},
			{
				"operation": "insert",
				"name": "TaxAmount",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "TaxAmount",
					"enabled": false,
					"layout": {
						"column": 0,
						"row": 3,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "DiscountTax",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "DiscountTax",
					"enabled": false,
					"layout": {
						"column": 12,
						"row": 3,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "TotalAmount",
				"parentName": "AmountBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "TotalAmount",
					"enabled": false,
					"layout": {
						"column": 0,
						"row": 4,
						"colSpan": 12
					}
				}
			}
		]/**SCHEMA_DIFF*/,
		rules: {
			"Product": {
				"BindParameterEnabledProductToCustomProduct": {
					"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					"property": BusinessRuleModule.enums.Property.ENABLED,
					"conditions": [
						{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								"attribute": "CustomProduct"
							},
							"comparisonType": Terrasoft.ComparisonType.IS_NULL
						}
					]
				}
			},
			"CustomProduct": {
				"BindParameterEnabledCustomProductToProduct": {
					"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					"property": BusinessRuleModule.enums.Property.ENABLED,
					"conditions": [
						{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								"attribute": "Product"
							},
							"comparisonType": Terrasoft.ComparisonType.IS_NULL
						}
					]
				}
			},
			"Price": {
				"BindParameterEnabledCustomProductToProduct": {
					"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					"property": BusinessRuleModule.enums.Property.ENABLED,
					"conditions": [
						{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								"attribute": "CustomProduct"
							},
							"comparisonType": Terrasoft.ComparisonType.IS_NOT_NULL
						}
					]
				}
			}
		}
	};
});