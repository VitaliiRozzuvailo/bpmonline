define("OrderProductPageV2", ["BusinessRuleModule", "OrderUtilities"],
	function(BusinessRuleModule) {
		return {
			entitySchemaName: "OrderProduct",
			mixins: {
				OrderUtilities: "Terrasoft.OrderUtilities"
			},
			methods: {
				/**
				 * @inheritDoc Terrasoft.Configuration.BasePageV2#save
				 * @overridden
				 */
				save: function(config) {
					if (!this.get("ChangeInvoice")) {
						this.needToChangeInvoice({
								name: "Order",
								id: this.get("Order").value
							}, function(result) {
								if (result) {
									this.set("ChangeInvoice", true);
									this.save(config);
								}
							}, this
						);
					} else {
						this.set("ChangeInvoice", false);
						this.callParent(arguments);
					}
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#asyncValidate
				 * @protected
				 * @overridden
				 */
				asyncValidate: function(callback, scope) {
					this.callParent([function(response) {
						if (response.success && this.needValidateQuantity()) {
							this.validateQuantity(callback);
						} else {
							callback.call(scope, response);
						}
					}, this]);
				},

				/**
				 * Возвращает необходимось валидации количества.
				 * @return {Boolean} true, если необходима валидация.
				 */
				needValidateQuantity: function() {
					return this.changedValues && this.changedValues.hasOwnProperty("Quantity");
				},

				/**
				 * Проверяет значение количества у продукта.
				 * @param {Function} callback Метод обратного вызова.
				 */
				validateQuantity: function(callback) {
					this.callService({
						serviceName: "OrderPassportService",
						methodName: "ValidateOrderProductQuantity",
						data: {
							"orderProductId": this.get("Id"),
							"newQuantity": this.get("Quantity")
						}
					}, function(response) {
						var responseResult = response.ValidateOrderProductQuantityResult || {};
						callback.call(this, {
							success: responseResult.success,
							message: (responseResult.errorInfo && responseResult.errorInfo.message) || ""
						});
					}, this);
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "AmountBlock",
					"propertyName": "items",
					"name": "Currency",
					"values": {
						"layout": {"column": 0, "row": 6, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "AmountBlock",
					"propertyName": "items",
					"name": "CurrencyRate",
					"values": {
						"layout": {"column": 12, "row": 6, "colSpan": 12}
					}
				}
			]/**SCHEMA_DIFF*/,
			rules: {
				"Currency": {
					"BindParameterEnabledCurrency": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONST,
								"value": true
							},
							"comparisonType": this.Terrasoft.core.enums.ComparisonType.NOT_EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONST,
								"value": true
							}
						}]
					}
				},
				"CurrencyRate": {
					"BindParameterEnabledCurrencyRate": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONST,
								"value": true
							},
							"comparisonType": this.Terrasoft.core.enums.ComparisonType.NOT_EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONST,
								"value": true
							}
						}]
					}
				}
			}
		};
	}
);
