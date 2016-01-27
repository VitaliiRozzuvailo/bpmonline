define("SpecificationUtils", ["BusinessRuleModule"],
	function(BusinessRuleModule) {
		/**
		 * Генерирует бизнес-правило для скрытия поля Значение характеристики в зависимости от типа характеристики.
		 * @param attributeName Название поля.
		 * @param typeId Уникальный идентификатор типа характеристики.
		 * @returns {Object} Сгенерированное правило
		 */
		function generateVisibleRuleForSpecificationType(attributeName, typeId,
														 additionalRuleName, additionalRule) {
			var ruleName = "BindParameterVisible" + attributeName + "ToSpecificationType";
			var rule = {};
			rule[ruleName] = {
				"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
				"property": BusinessRuleModule.enums.Property.VISIBLE,
				"conditions": [
					{
						"leftExpression": {
							"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							"attribute": "Specification",
							"attributePath": "Type"
						},
						"comparisonType": Terrasoft.ComparisonType.EQUAL,
						"rightExpression": {
							"type": BusinessRuleModule.enums.ValueType.CONSTANT,
							"value": typeId
						}
					}
				]
			};
			if (additionalRule && additionalRuleName) {
				rule[additionalRuleName] = additionalRule;
			}
			return rule;
		}
		return {
			GenerateVisibleRuleForSpecificationType: generateVisibleRuleForSpecificationType
		};
	});