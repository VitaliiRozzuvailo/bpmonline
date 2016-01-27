define("EmailPageV2", ["BusinessRuleModule", "ConfigurationConstants"],
	function(BusinessRuleModule, ConfigurationConstants) {
		return {
			entitySchemaName: "Activity",
			methods: {
				/**
				 * Копирует значения колонок из схемы в текущую модель.
				 * @overridden
				 * @param {Object} entity Схема активности.
				 * @param {Object} actionType Действие, выполняемое с письмом.
				 */
				copyEntityColumnValues: function(entity, actionType) {
					var order = entity.get("Order");
					if (order) {
						this.set("Order", order);
					}
					this.callParent(arguments);
				},

				/**
				 * Возвращает массив загружаемых колонок.
				 * @private
				 * @overridden
				 * @return {Array} Массив колонок.
				 */
				getEmailSelectColumns: function() {
					var columnsArray = this.callParent(arguments);
					columnsArray.push("Order");
					return columnsArray;
				}
			},
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				/*{
					"operation": "merge",
					"name": "Lead",
					"values": {
						"layout": {"column": 0, "row": 2, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailPageLinksBlock",
					"propertyName": "items",
					"name": "Order",
					"values": {
						"bindTo": "Order",
						"layout": {"column": 0, "row": 2, "colSpan": 12}
					}
				}*/
			]/**SCHEMA_DIFF*/,
			rules: {
				"Order": {
					"FiltrationOrderByContact": {
						"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
						"autocomplete": true,
						"autoClean": true,
						"baseAttributePatch": "Contact",
						"comparisonType": Terrasoft.ComparisonType.EQUAL,
						"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						"attribute": "Contact"
					},
					"FiltrationOrderByAccount": {
						"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
						"autocomplete": true,
						"autoClean": true,
						"baseAttributePatch": "Account",
						"comparisonType": Terrasoft.ComparisonType.EQUAL,
						"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						"attribute": "Account"
					}
				}
			}
		};
	});