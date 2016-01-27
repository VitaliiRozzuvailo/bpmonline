define('DocumentProductPage', ['ext-base', 'terrasoft', 'sandbox',
	'DocumentProduct', 'DocumentProductPageStructure', 'DocumentProductPageResources',
	'BusinessRuleModule', 'MoneyModule'],
	function(Ext, Terrasoft, sandbox, DocumentProduct, structure,
			resources, BusinessRuleModule, MoneyModule) {
		structure.userCode = function() {
			this.entitySchema = DocumentProduct;
			this.name = 'DocumentProductCardViewModel';
			this.sysSettings = ['PriceWithTaxes'];
			this.schema.leftPanel = [{
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'Id',
				columnPath: 'Id',
				visible: false,
				viewVisible: false
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'Document',
				columnPath: 'Document',
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: true,
				viewVisible: true,
				columns: ['CurrencyRate'],
				customConfig: {
					enabled: false
				}
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'Product',
				columnPath: 'Product',
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: true,
				viewVisible: true,
				columns: ['Currency', 'Price', 'Unit', 'Tax', 'Tax.Percent'],
				rules: [{
					ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					property: BusinessRuleModule.enums.Property.ENABLED,
					conditions: [{
						leftExpression: {
							type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							attribute: 'CustomProduct'
						},
						comparisonType: Terrasoft.ComparisonType.IS_NULL
					}]
				}]
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'CustomProduct',
				columnPath: 'CustomProduct',
				dataValueType: Terrasoft.DataValueType.TEXT,
				visible: true,
				viewVisible: true,
				rules: [{
					ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					property: BusinessRuleModule.enums.Property.ENABLED,
					conditions: [{
						leftExpression: {
							type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							attribute: 'Product'
						},
						comparisonType: Terrasoft.ComparisonType.IS_NULL
					}]
				}]
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'Quantity',
				columnPath: 'Quantity',
				dataValueType: Terrasoft.DataValueType.FLOAT,
				visible: true,
				viewVisible: true
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'Unit',
				columnPath: 'Unit',
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: true,
				viewVisible: true,
				customConfig: {
					enabled: false
				}
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'DeliveryDate',
				columnPath: 'DeliveryDate',
				dataValueType: Terrasoft.DataValueType.DATE,
				visible: true,
				viewVisible: true
			}, {
				type: Terrasoft.ViewModelSchemaItem.GROUP,
				name: 'totalsumm',
				caption: resources.localizableStrings.TotalSummGroupCaption,
				visible: true,
				collapsed: false,
				wrapContainerClass: 'control-group-container',
				items: [{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Price',
					columnPath: 'Price',
					dataValueType: Terrasoft.DataValueType.FLOAT,
					visible: true,
					dependencies: ['Product'],
					methodName: 'onProductSelect'
				}, {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Amount',
					columnPath: 'Amount',
					dataValueType: Terrasoft.DataValueType.FLOAT,
					visible: true,
					customConfig: {
						enabled: false
					},
					dependencies: ['Price', 'Quantity'],
					methodName: 'calcAmount'
				}, {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'DiscountPercent',
					columnPath: 'DiscountPercent',
					dataValueType: Terrasoft.DataValueType.FLOAT,
					visible: true,
					dependencies: ['DiscountAmount'],
					methodName: 'calcDiscountPercent'
				}, {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'DiscountAmount',
					columnPath: 'DiscountAmount',
					dataValueType: Terrasoft.DataValueType.FLOAT,
					visible: true,
					dependencies: ['Amount', 'DiscountPercent'],
					methodName: 'calcDiscountAmount'
				}, {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Tax',
					columnPath: 'Tax',
					columns: ['Percent'],
					dataValueType: Terrasoft.DataValueType.ENUM,
					visible: true
				}, {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'DiscountTax',
					columnPath: 'DiscountTax',
					dataValueType: Terrasoft.DataValueType.FLOAT,
					visible: true,
					customConfig: {
						enabled: false
					},
					dependencies: ['Tax'],
					methodName: 'onTaxChange'
				}, {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'TaxAmount',
					columnPath: 'TaxAmount',
					dataValueType: Terrasoft.DataValueType.FLOAT,
					visible: true,
					customConfig: {
						enabled: false
					},
					dependencies: ['Amount', 'DiscountTax'],
					methodName: 'setTaxAmount'
				}, {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'TotalAmount',
					columnPath: 'TotalAmount',
					dataValueType: Terrasoft.DataValueType.FLOAT,
					visible: true,
					customConfig: {
						enabled: false
					},
					dependencies: ['Amount', 'TaxAmount', 'DiscountAmount'],
					methodName: 'setTotalAmount'
				}]
			}];
			this.getItemViewHeader = function() {
				return {
					columns: [
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Document',
							columnPath: 'Document',
							viewVisible: true,
							labelClass: 'document-documentname'
						}
					]
				};
			};

			var validateGreaterOrEqualZero = function(value) {
				var message = '';
				if (value < 0) {
					message = resources.localizableStrings.FieldMustBeGreaterOrEqualZeroMessage;
				}
				return { invalidMessage: message };
			};


			this.validationConfig = {
				Quantity: [ validateGreaterOrEqualZero ]
			};

			this.methods.init = function() {
				if (Ext.isEmpty(this.get('Quantity'))) {
					this.set('Quantity', 1);
				}
				if (Ext.isEmpty(this.get('DiscountPercent'))) {
					this.set('DiscountPercent', 0);
				}
			};

			this.methods.save = function(isValid) {
				isValid = true;
				var product = this.get('Product');
				var customProduct = this.get('CustomProduct');
				if (Ext.isEmpty(product) && Ext.isEmpty(customProduct)) {
					this.showInformationDialog(resources.localizableStrings.WarningProductCustomProductRequire);
					isValid = false;
				}
				return isValid;
			};

			this.methods.onTaxChange = function() {
				var tax = this.get('Tax');
				var taxPercent = (!Ext.isEmpty(tax)) ? tax.Percent : null;
				if (!Ext.isEmpty(taxPercent)) {
					this.set('DiscountTax', taxPercent);
				}
			};

			this.methods.onProductSelect = function() {
				var product = this.get('Product');
				this.set('Tax', null);
				this.set('Unit', null);
				if (Ext.isEmpty(product)) {
					return;
				}
				if (!Ext.isEmpty(product.Tax)) {
					product.Tax.Percent = product['Tax.Percent'];
					this.set('Tax', product.Tax);
				}
				if (!Ext.isEmpty(product.Unit)) {
					this.set('Unit', product.Unit);
				}
				MoneyModule.onLoadCurrencyRate.call(this, product.Currency.value, null, function(item) {
					var document = this.get('Document');
					var price = (product.Price * document.CurrencyRate * item.Division) / item.Rate;
					this.set('Price', price);
				});
			};

			this.methods.calcAmount = function() {
				var price = this.get('Price');
				var quantity = this.get('Quantity');
				if (!Ext.isEmpty(price) && !Ext.isEmpty(quantity)) {
					this.set('Amount', (price * quantity));
				}
			};

			this.methods.calcDiscountPercent = function() {
				var amount = this.get('Amount');
				var discountPercent = this.get('DiscountPercent');
				var discountAmount = this.get('DiscountAmount');
				if (!Ext.isEmpty(amount) && !Ext.isEmpty(discountAmount) && amount > 0 && discountAmount > 0) {
					var percent = Math.round(((discountAmount * 100) / amount) * 100) / 100;
					if (percent > 100) {
						percent = 100;
					}
					if (discountPercent !== percent) {
						this.set('DiscountPercent', percent);
					}
				}
			};

			this.methods.calcDiscountAmount = function() {
				var amount = this.get('Amount');
				var discountPercent = this.get('DiscountPercent');
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
				if (this.get('DiscountAmount') !== newDiscountAmount) {
					this.set('DiscountAmount', newDiscountAmount);
				}
				var taxAmount = this.calcTaxAmount();
				if (this.get('TaxAmount') !== taxAmount) {
					this.set('TaxAmount', taxAmount);
				}
			};

			this.methods.calcTotalAmount = function() {
				var amount = this.get('Amount');
				if (Ext.isEmpty(amount)) {
					amount = 0;
				}
				var discountAmount =  this.get('DiscountAmount');
				if (Ext.isEmpty(discountAmount)) {
					discountAmount = 0;
				}
				if (discountAmount > amount) {
					discountAmount = amount;
				}
				return (amount - discountAmount);
			};

			this.methods.calcTaxAmount = function() {
				var totalAmount = this.calcTotalAmount();
				var discountTax = this.get('DiscountTax');
				discountTax = (Ext.isEmpty(discountTax)) ? 0 : ((discountTax > 100) ? 100 : discountTax);
				var taxAmount = 0;
				if (Terrasoft.SysSettings.cachedSettings.PriceWithTaxes) {
					taxAmount = Math.round(((totalAmount * discountTax) / (100 + discountTax)) * 100) / 100;
				} else {
					taxAmount = Math.round(totalAmount * discountTax) / 100;
				}
				return taxAmount;
			};

			this.methods.setTaxAmount = function() {
				var taxAmount = this.calcTaxAmount();
				if (this.get('TaxAmount') !== taxAmount) {
					this.set('TaxAmount', taxAmount);
				}
			};

			this.methods.setTotalAmount = function() {
				var totalAmount = this.calcTotalAmount();
				var taxAmount = this.calcTaxAmount();
				if (!Terrasoft.SysSettings.cachedSettings.PriceWithTaxes) {
					totalAmount += taxAmount;
				}
				if (this.get('TotalAmount') !== totalAmount) {
					this.set('TotalAmount', totalAmount);
				}
			};
		};
		return structure;
	});