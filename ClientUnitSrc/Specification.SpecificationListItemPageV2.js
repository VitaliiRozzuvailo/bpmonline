// D9 Team
define("SpecificationListItemPageV2", [],
	function() {
		return {
			entitySchemaName: "SpecificationListItem",
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
						"layout": { "column": 0, "row": 0, "colSpan": 18 },
						"enabled": false,
						"controlConfig": {
							"enableRightIcon": false
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Name",
					"values": {
						"caption": { "bindTo": "Resources.Strings.NameCaption" },
						"layout": { "column": 0, "row": 1, "colSpan": 18 },
						"bindTo": "Name"
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});