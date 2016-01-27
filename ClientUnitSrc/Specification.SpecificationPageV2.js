// D9 Team
define("SpecificationPageV2", ["SpecificationConstants", "SpecificationListItemDetailV2"],
	function(SpecificationConstants) {
		return {
			entitySchemaName: "Specification",
			methods: {
				/**
				 * Определяет видимость детали "Список значений" по типу характеристики
				 * @returns {boolean} Возвращает true,
				 * если должна быть видима деталь "Список значений".
				 */
				isValuesListVisible: function() {
					var specificationType = this.get("Type");
					return (!!specificationType &&
						specificationType.value === SpecificationConstants.SpecificationTypes.ListType);
				},
				/**
				 *  Возвращает пустую коллекцию действий карточки, если схема не администрируется по записям.
				 *  УДАЛИТЬ КОГДА ИСПРАВЯТ В БАЗОВОЙ ВЕРСИИ
				 * @returns {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий карточки.
				 */
				getActions: function() {
					var parentActions = this.callParent(arguments);
					if (parentActions && !this.getSchemaAdministratedByRecords()) {
						parentActions.clear();
					}
					return parentActions;
				},
				/**
				 * Инициализирует страницу редактирования
				 * @protected
				 * @overridden
				 */
				init: function() {
					this.callParent(arguments);
					this.set("CanUserEditType", this.isNewMode());
				}
			},
			details: /**SCHEMA_DETAILS*/{
				SpecificationListItemDetail: {
					schemaName: "SpecificationListItemDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "Specification"
					}
				}
			}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
// Tabs
				{
					"operation": "merge",
					"name": "Tabs",
					"values": {
						"visible": false
					}
				},
// Header
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Name",
					"values": {
						"layout": { "column": 0, "row": 0, "colSpan": 18 }
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Type",
					"values": {
						"bindTo": "Type",
						"enabled": {"bindTo" : "CanUserEditType"},
						"layout": { "column": 0, "row": 1, "colSpan": 18 },
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Description",
					"values": {
						"bindTo": "Description",
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"layout": { "column": 0, "row": 2, "colSpan": 18 }
					}
				},
				{
					"operation": "insert",
					"name": "DetailControlGroup",
					"parentName": "Headers",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"controlConfig": {
							"collapsed": false,
							"visible": {"bindTo" : "isValuesListVisible"}
						}
					}
				},
// Tabs
				{
					"operation": "insert",
					"parentName": "DetailControlGroup",
					"propertyName": "items",
					"name": "SpecificationListItemDetail",
					"values": {
						"layout": { "column": 0, "row": 4, "colSpan": 24 },
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});