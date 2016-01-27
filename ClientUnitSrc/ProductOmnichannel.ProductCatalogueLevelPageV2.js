// D9 Team
define("ProductCatalogueLevelPageV2", ["StructureExplorerUtilities", "css!ProductManagementDistributionCss"],
	function(StructureExplorerUtilities) {
		return {
			entitySchemaName: "ProductCatalogueLevel",
			messages: {
				/**
				 * @message StructureExplorerInfo
				 * Необходимо для работы StructureExplorerUtilities
				 */
				"StructureExplorerInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message ColumnSelected
				 * Необходимо для работы StructureExplorerUtilities
				 */
				"ColumnSelected": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			methods: {

				/**
				 * Открытие окна StructureExplorer.
				 * @private
				 */
				openStructureExplorer: function() {
					var config = {
						useBackwards: false,
						firstColumnsOnly: true,
						summaryColumnsOnly: false,
						lookupsColumnsOnly: true,
						schemaName: "Product"
					};
					var handler = this.structureExplorerHandler;
					StructureExplorerUtilities.Open(this.sandbox,
						config, handler, this.renderTo, this);
				},

				/**
				 * Обработчик выбора StructureExplorer.
				 * Обновляет свойства viewModel согласно выбору в окне StructureExplorer.
				 * @param args {Object} Содержит результат работы пользователя.
				 */
				structureExplorerHandler: function(args) {
					var columnCaption = args.leftExpressionCaption;
					var columnPath = args.leftExpressionColumnPath;
					var referenceSchemaName = args.referenceSchemaName;
					var oldColumnPath = this.get("ColumnPath");
					var oldColumnCaption = this.get("ColumnCaption");
					var oldName = this.get("Name");
					this.set("ColumnCaption", columnCaption);
					this.set("ColumnPath", columnPath);
					this.set("ReferenceSchemaName", referenceSchemaName);
					if ((oldName === oldColumnCaption || this.Ext.isEmpty(oldName)) &&
						columnPath !== oldColumnPath)
					{
						this.set("Name", columnCaption);
					}
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
// Header
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Name",
					"values": {
						"layout": {"column": 0, "row": 0, "colSpan": 24}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "ColumnCaption",
					"values": {
						"bindTo": "ColumnCaption",
						"layout": {"column": 0, "row": 1, "colSpan": 24},
						"classes": { "wrapClass": ["columnCaption-readonly-class"] },
						"controlConfig": {
							"className": "Terrasoft.TextEdit",
							"readonly": true,
							"rightIconClasses": ["custom-right-item", "lookup-edit-right-icon"],
							"rightIconClick": { "bindTo": "openStructureExplorer" }
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});