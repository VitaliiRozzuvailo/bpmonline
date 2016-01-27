// D9 Team
define("SpecificationDetailV2", [],
	function() {
		return {
			entitySchemaName: "SpecificationInObject",
			messages: {
				/**
				 * @message GetBackHistoryState
				 * Возвращает путь, куда переходить после нажатия на кнопку закрыть
				 * в окне настройки справочников.
				 */
				"GetBackHistoryState": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			methods: {
				/**
				 * Переходит в раздел характеристик.
				 */
				navigateToSpecificationSection: function() {
					this.sandbox.publish("PushHistoryState", {
						hash: "SectionModuleV2/SpecificationSectionV2"
					});
				},

				/**
				 * Осуществляется подписка на события sandbox
				 * @protected
				 * @overriden
				 */
				subscribeSandboxEvents: function() {
					this.callParent();
					this.subscribeForGetBackHistoryState();
				},

				/**
				 * Осуществляется подписка на события GetBackHistoryState модулей
				 * @protected
				 * @virtual
				 */
				subscribeForGetBackHistoryState: function() {
					var initialHistoryState = this.sandbox.publish("GetHistoryState").hash.historyState;
					this.set("InitialHistoryState", initialHistoryState);
					this.sandbox.subscribe("GetBackHistoryState", function() {
						return this.get("InitialHistoryState");
					}, this, ["SpecificationSectionV2"]);
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addRecordOperationsMenuItems
				 * @overridden
				 */
				addRecordOperationsMenuItems: function(toolsButtonMenu) {
					var editRecordMenuItem = this.getEditRecordMenuItem();
					if (editRecordMenuItem) {
						toolsButtonMenu.addItem(editRecordMenuItem);
					}
					var deleteRecordMenuItem = this.getDeleteRecordMenuItem();
					if (deleteRecordMenuItem) {
						toolsButtonMenu.addItem(deleteRecordMenuItem);
					}
					toolsButtonMenu.addItem(this.getButtonMenuSeparator());
					toolsButtonMenu.addItem(this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.OpenSpecificationSectionButtonCaption"},
						Click: {"bindTo": "navigateToSpecificationSection"}
					}));
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"type": "listed",
						"listedConfig": {
							"name": "DataGridListedConfig",
							"items": [
								{
									"name": "SpecificationListedGridColumn",
									"bindTo": "Specification",
									"position": {
										"column": 0,
										"colSpan": 12
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "StringValueListedGridColumn",
									"bindTo": "StringValue",
									"position": {
										"column": 12,
										"colSpan": 12
									}
								}
							]
						},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": {
								"columns": 24,
								"rows": 1
							},
							"items": [
								{
									"name": "SpecificationTiledGridColumn",
									"bindTo": "Specification",
									"position": {"row": 0, "column": 0, "colSpan": 12},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "StringValueTiledGridColumn",
									"bindTo": "StringValue",
									"position": {"row": 0, "column": 12, "colSpan": 12}
								}
							]
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
