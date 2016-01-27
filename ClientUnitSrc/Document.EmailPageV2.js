define("EmailPageV2", ["BusinessRuleModule"], function(BusinessRuleModule) {
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
				var document = entity.get("Document");
				if (document) {
					this.set("Document", document);
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
				columnsArray.push("Document");
				return columnsArray;
			}
		},
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/,
		rules: {
			"Document": {
				"FiltrationDocumentByAccount": {
					"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
					"autocomplete": true,
					"autoClean": true,
					"baseAttributePatch": "Account",
					"comparisonType": Terrasoft.ComparisonType.EQUAL,
					"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
					"attribute": "Account"
				},
				"FiltrationDocumentByContact": {
					"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
					"autocomplete": true,
					"autoClean": true,
					"baseAttributePatch": "Contact",
					"comparisonType": Terrasoft.ComparisonType.EQUAL,
					"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
					"attribute": "Contact"
				}
			}
		}
	};
});