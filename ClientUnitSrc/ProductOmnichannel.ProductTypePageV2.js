// D9 Team
define("ProductTypePageV2", [],
	function() {
		return {
			entitySchemaName: "ProductType",
			methods: {
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
				}
			},
			details: /**SCHEMA_DETAILS*/{
				ProductFilterDetail: {
					schemaName: "ProductFilterDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "ProductType"
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
					"name": "Category",
					"values": {
						"bindTo": "Category",
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

// Tabs

				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "ProductFilterDetail",
					"values": {
						"layout": { "column": 0, "row": 4, "colSpan": 24 },
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});