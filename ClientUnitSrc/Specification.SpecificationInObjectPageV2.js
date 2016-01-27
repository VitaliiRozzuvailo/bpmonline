// D9 Team
define("SpecificationInObjectPageV2", ["SpecificationUtils",
	"SpecificationConstants", "BusinessRuleModule"],
	function(SpecificationUtils, SpecificationConstants, BusinessRuleModule) {
		return {
			entitySchemaName: "SpecificationInObject",
			attributes: {
				/**
				 * Характеристика
				 * @type: {Terrasoft.DataValueType.LOOKUP}
				 */
				"Specification":
				{
					lookupListConfig: {
						columns: ["Type"]
					}
				}
			},
			methods: {
				/**
				 *  Возвращает пустую коллекцию действий карточки, если схема не администрируется по записям
				 *  УДАЛИТЬ КОГДА ИСПРАВЯТ В БАЗОВОЙ ВЕРСИИ
				 * @returns {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий карточки
				 */
				getActions: function() {
					var parentActions = this.callParent(arguments);
					if (parentActions && !this.getSchemaAdministratedByRecords()) {
						parentActions.clear();
					}
					return parentActions;
				}
			},
			diff: /**SCHEMA_DIFF*/[
// Tabs
				{
					"operation": "merge",
					"name": "Tabs",
					"values": {
						"visible": false
					}
				},
// Columns
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Specification",
					"values": {
						"bindTo": "Specification",
						"layout": { "column": 0, "row": 1, "colSpan": 12 }
					}
				},

				{
					"operation": "insert",
					"parentName": "Header",
					"name": "ColumnsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"layout": { "column": 0, "row": 2, "colSpan": 12, "rowSpan": 3},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "ColumnsContainer",
					"propertyName": "items",
					"name": "ListItemValue",
					"values": {
						"caption": { "bindTo": "Resources.Strings.ValueCaption" },
						"contentType": Terrasoft.ContentType.ENUM,
						"bindTo": "ListItemValue"
					}
				},
				{
					"operation": "insert",
					"parentName": "ColumnsContainer",
					"propertyName": "items",
					"name": "StringValue",
					"values": {
						"caption": { "bindTo": "Resources.Strings.ValueCaption" },
						"bindTo": "StringValue"
					}
				},
				{
					"operation": "insert",
					"parentName": "ColumnsContainer",
					"propertyName": "items",
					"name": "IntValue",
					"values": {
						"caption": { "bindTo": "Resources.Strings.ValueCaption" },
						"bindTo": "IntValue"
					}
				},
				{
					"operation": "insert",
					"parentName": "ColumnsContainer",
					"propertyName": "items",
					"name": "FloatValue",
					"values": {
						"caption": { "bindTo": "Resources.Strings.ValueCaption" },
						"bindTo": "FloatValue"
					}
				},
				{
					"operation": "insert",
					"parentName": "ColumnsContainer",
					"propertyName": "items",
					"name": "BooleanValue",
					"values": {
						"caption": { "bindTo": "Resources.Strings.ValueCaption" },
						"bindTo": "BooleanValue"
					}
				}
			]/**SCHEMA_DIFF*/,
			rules: {
				"StringValue": SpecificationUtils.GenerateVisibleRuleForSpecificationType("StringValue",
					SpecificationConstants.SpecificationTypes.StringType),
				"IntValue": SpecificationUtils.GenerateVisibleRuleForSpecificationType("IntValue",
					SpecificationConstants.SpecificationTypes.IntType),
				"FloatValue": SpecificationUtils.GenerateVisibleRuleForSpecificationType("FloatValue",
					SpecificationConstants.SpecificationTypes.FloatType),
				"BooleanValue": SpecificationUtils.GenerateVisibleRuleForSpecificationType("BooleanValue",
					SpecificationConstants.SpecificationTypes.BooleanType),
				"ListItemValue": SpecificationUtils.GenerateVisibleRuleForSpecificationType("ListItemValue",
					SpecificationConstants.SpecificationTypes.ListType,
						"FiltrationListItemValueBySpecififcation",
						{
							ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
							autoClean: true,
							baseAttributePatch: "Specification",
							comparisonType: this.Terrasoft.ComparisonType.EQUAL,
							type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							attribute: "Specification"
					})
			}
		};
	});