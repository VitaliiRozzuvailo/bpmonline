define("SupplyPaymentTemplateItemPageV2", ["terrasoft", "BusinessRuleModule", "ConfigurationConstants"],
	function(Terrasoft, BusinessRuleModule, ConfigurationConstants) {
		return {
			entitySchemaName: "SupplyPaymentTemplateItem",
			attributes: {
				/**
				 * Название
				 */
				"Name": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					isRequired: true,
					dependencies: [
						{
							columns: ["Type"],
							methodName: "onTypeChanged"
						}
					]
				},

				"PreviousElement": {
					lookupListConfig: {
						hideActions: true,
						filters: [
							function() {
								var Id = this.get("Id");
								var filterGroup = Ext.create("Terrasoft.FilterGroup");
								filterGroup.add("prevElement", this.Terrasoft.createColumnFilterWithParameter(
									this.Terrasoft.ComparisonType.NOT_EQUAL, "Id", Id));
								return filterGroup;
							}
						]
					}
				},

				/**
				 * Тип шага
				 */
				"Type": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					isRequired: true
				}
			},
			methods: {
				/**
				 * Устанавливает признак что запись загружена, необходимо для редактируемого реестра при добавлении
				 * новой записи.
				 * @inheritdoc Terrasoft.BaseViewModel#setDefaultValues
				 * @protected
				 * @overridden
				 */
				setDefaultValues: function() {
					this.callParent(arguments);
					this.set("IsEntityInitialized", true);
				}
			},
			rules: {
				"PreviousElement": {
					"BindParameterRequiredPreviousElement": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.REQUIRED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "DelayType"
								},
								"comparisonType": Terrasoft.ComparisonType.NOT_EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": ConfigurationConstants.SupplyPayment.Fixed
								}
							}
						]
					},
					"FiltrationPreviousElementByTemplate": {
						"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
						"autocomplete": true,
						"baseAttributePatch": "SupplyPaymentTemplate",
						"comparisonType": Terrasoft.ComparisonType.EQUAL,
						"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						"attribute": "SupplyPaymentTemplate"
					}
				}
			}
		};
	}
);

