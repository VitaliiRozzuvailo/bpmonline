define("SysMobileWorkplaceSection", ["SysMobileWorkplaceSectionResources", "SectionDesignerUtils",
	"MobileDesignerUtils", "css!SysMobileWorkplaceSectionStyles"],
	function(resources, SectionDesignerUtils, MobileDesignerUtils) {
		return {
			entitySchemaName: "SysMobileWorkplace",
			methods: {

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#initEditPages
				 * @protected
				 * @overridden
				 */
				initEditPages: function() {
					this.callParent(arguments);
					var editPages = this.get("EditPages");
					var typeUId = this.Terrasoft.GUID_EMPTY;
					if (this.Ext.isEmpty(editPages.find(typeUId))) {
						editPages.add(typeUId, this.Ext.create("Terrasoft.BaseViewModel", {
							values: {
								Id: typeUId,
								Caption: this.get("Resources.Strings.AddRecordButtonCaption"),
								Click: {bindTo: "addRecord"},
								Tag: typeUId,
								SchemaName: "SysMobileWorkplacePage"
							}
						}));
					}
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#getDefaultDataViews
				 * @protected
				 * @overridden
				 */
				getDefaultDataViews: function() {
					var gridDataView = {
						name: "GridDataView",
						active: true,
						caption: this.getDefaultGridDataViewCaption(),
						icon: this.getDefaultGridDataViewIcon()
					};
					return {
						"GridDataView": gridDataView
					};
				},

				/**
				 * @inheritDoc Terrasoft.configuration.mixins.GridUtilities#reloadGridColumnsConfig
				 * @protected
				 * @overridden
				 */
				reloadGridColumnsConfig: function(doReRender) {
					if (doReRender) {
						var grid = this.getCurrentGrid();
						if (!grid) {
							return;
						}
						grid.clear();
						grid.prepareCollectionData();
						if (grid.rendered) {
							grid.reRender();
						}
					}
				},

				/**
				 * @inheritDoc Terrasoft.configuration.mixins.GridUtilities#checkCanDelete
				 * @protected
				 * @overridden
				 */
				checkCanDelete: function(items) {
					var gridData = this.getGridData();
					for (var i = 0, ln = items.length; i < ln; i++) {
						var item = gridData.get(items[i]);
						if (item.get("Code") === MobileDesignerUtils.defaultWorkplaceCode) {
							this.showInformationDialog(this.get("Resources.Strings.DeleteDefaultWorkplaceMessage"));
							return;
						}
					}
					this.callParent(arguments);
				},

				/**
				 * @inheritDoc Terrasoft.configuration.mixins.GridUtilities#getGridDataColumns
				 * @protected
				 * @overridden
				 */
				getGridDataColumns: function() {
					var gridDataColumns = this.callParent(arguments);
					gridDataColumns.Code = {
						path: "Code"
					};
					return gridDataColumns;
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#getDefaultGridDataViewCaption
				 * @protected
				 * @overridden
				 */
				getDefaultGridDataViewCaption: function() {
					return this.get("Resources.Strings.HeaderCaption");
				},

				/**
				 * @inheritDoc Terrasoft.BaseSectionV2#onRender
				 * @protected
				 * @overridden
				 */
				onRender: function() {
					if (!this.get("Restored")) {
						this.loadActiveViewData();
					}
					this.callParent(arguments);
				},

				/**
				 * Метод открытия карточки на редактирование.
				 * @protected
				 */
				openCard: function(schemaName, operation, primaryColumnValue) {
					this.maskId = Terrasoft.Mask.show({ timeout: 0 });
					this.callParent(arguments);
				},

				/**
				 * Переход к дизайнеру мобильного приложения.
				 * @private
				 */
				onSetupSectionsClick: function() {
					var activeRow = this.getActiveRow();
					var url = Ext.String.format("{0}/Nui/ViewModule.aspx?vm=MobileDesignerModule#{1}",
						this.Terrasoft.workspaceBaseUrl, activeRow.values.Code);
					window.open(url);
				},

				/**
				 * Обработчик события, срабатывающего после отрисовки карточки.
				 * @private
				 */
				onCardRendered: function() {
					this.callParent(arguments);
					Terrasoft.Mask.hide(this.maskId);
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
									"name": "NameListedGridColumn",
									"bindTo": "Name",
									"type": Terrasoft.GridCellType.TEXT,
									"position": {"column": 1, "colSpan": 24},
									"captionConfig": {"visible": false}
								}
							]
						},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": {"columns": 24, "rows": 1},
							"items": [
								{
									"name": "NameTiledGridColumn",
									"bindTo": "Name",
									"type": Terrasoft.GridCellType.TEXT,
									"position": {"row": 1, "column": 1, "colSpan": 10},
									"captionConfig": {"visible": false}
								}
							]
						},
						"sortColumnIndex": null
					}
				},
				{
					"operation": "merge",
					"name": "DataViewsContainer",
					"values": {
						"wrapClass": ["mobile-workplace-data-views-container-wrapClass"]
					}
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowCopyAction"
				},
				{
					"operation": "remove",
					"name": "SeparateModePrintButton"
				},
				{
					"operation": "merge",
					"name": "DataGridActiveRowOpenAction",
					"values": {
						"style": Terrasoft.controls.ButtonEnums.style.GREY
					}
				},
				{
					"operation": "remove",
					"name": "CombinedModePrintButton"
				},
				{
					"operation": "remove",
					"name": "CombinedModeViewOptionsButton"
				},
				{
					"operation": "remove",
					"name": "SeparateModeViewOptionsButton"
				},
				{
					"operation": "remove",
					"name": "SeparateModeActionsButton"
				},
				{
					"operation": "remove",
					"name": "FiltersContainer"
				},
				{
					"operation": "remove",
					"name": "CombinedModeActionsButton"
				},
				{
					"operation": "insert",
					"name": "SetupSectionsButton",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": { "bindTo": "Resources.Strings.SetupSectionsButtonCaption" },
						"classes": { "textClass": ["actions-button-margin-right"] },
						"click": { "bindTo": "onSetupSectionsClick" },
						"visible": { "bindTo": "ShowCloseButton" }
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
