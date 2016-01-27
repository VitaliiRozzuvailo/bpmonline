define("SupplyPaymentProductPageV2", ["BusinessRuleModule", "OrderConfigurationConstants"],
	function(BusinessRuleModule, OrderConfigurationConstants) {
		return {
			entitySchemaName: "VwSupplyPaymentProduct",
			attributes: {
				/**
				* Сумма по продукту.
				*/
				UsedAmount: {
					dependencies: [
						{
							columns: ["UsedQuantity"],
							methodName: "onUsedQuantityChanged"
						}
					]
				}
			},
			methods: {
				/**
				 * @inheritDoc Terrasoft.BasePageV2#onSaved
				 * @overridden
				 */
				onSaved: function() {
					this.callParent(arguments);
					this.validateUsedQuantity(this.get("UsedQuantity"));
				},

				/**
				 * Обработчик изменения количества.
				 * @private
				 */
				onUsedQuantityChanged: function() {
					this.recalculateQuantityValues();
				},

				/**
				 * Пересчет суммы по количеству.
				 * @private
				 */
				recalculateQuantityValues: function() {
					if (!this.validationConfig.UsedQuantity) {
						this.setValidationConfig();
					}
					var productPrice = this.get("Price");
					var discountPercent = this.get("DiscountPercent") || 0;
					var value = this.get("UsedQuantity");
					if (productPrice) {
						var newValue = value * productPrice * (1 - discountPercent / 100);
						this.set("UsedAmount", newValue);
					}
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2ViewModel#setValidationConfig
				 * @overridden
				 */
				setValidationConfig: function() {
					this.callParent(arguments);
					this.addColumnValidator("UsedQuantity", this.validateUsedQuantity);
				},

				/**
				 * Проверяет обязательное поле при сохранении.
				 * @param {String} value
				 * @return {Object} Возвращает объект с текстами ошибок валидации поля.
				 */
				validateUsedQuantity: function(value) {
					var invalidMessage = "";
					var maxQuantity = this.get("MaxQuantity");
					if (value > maxQuantity) {
						invalidMessage = this.get("Resources.Strings.ValidateUsedQuantity");
					} else
					if (value < 0) {
						invalidMessage = this.get("Resources.Strings.ValidateUsedQuantityMoreZero");
					}
					return {
						invalidMessage: invalidMessage
					};
				}
			},
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/,
			rules: {
				"OrderProduct": {
					"BindParameterEnabledOrderProduct": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							},
							"comparisonType": this.Terrasoft.core.enums.ComparisonType.NOT_EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							}
						}]
					}
				},
				"MaxQuantity": {
					"BindParameterEnabledMaxQuantity": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							},
							"comparisonType": this.Terrasoft.core.enums.ComparisonType.NOT_EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							}
						}]
					}
				},
				"UsedAmount": {
					"BindParameterEnabledUsedAmount": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							},
							"comparisonType": this.Terrasoft.core.enums.ComparisonType.NOT_EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							}
						}]
					}
				}
			}
		};
	}
);
