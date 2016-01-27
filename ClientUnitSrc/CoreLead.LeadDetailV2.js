define("LeadDetailV2", ["css!LeadDetailModule", "ControlGridModule", "BaseProgressBarModule",
		"css!BaseProgressBarModule"],
	function() {
		return {
			entitySchemaName: "Lead",
			attributes: {
				/**
				 * Признак возможности отображения реестра.
				 * @type {Boolean}
				 */
				CanShowDataGrid: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				}
			},
			methods: {
				/**
				 * Обновляет признак возможности отображения реестра.
				 */
				updateCanShowDataGrid: function() {
					var masterRecordId = this.get("MasterRecordId");
					var canShowDataGrid = (masterRecordId && masterRecordId !== null);
					this.set("CanShowDataGrid", canShowDataGrid);
				},

				/**
				 * @inheritDoc Terrasoft.Configuration.BaseDetailV2#getToolsVisible
				 * @overridden
				 */
				getToolsVisible: function() {
					return (!this.get("IsDetailCollapsed") && this.get("CanShowDataGrid"));
				},

				/**
				 * @inheritDoc Terrasoft.Configuration.BaseDetailV2#updateDetail
				 * @overridden
				 */
				updateDetail: function(config) {
					config.reloadAll = true;
					this.callParent(arguments);
					this.updateCanShowDataGrid();
				},

				/**
				 * @inheritDoc Terrasoft.Configuration.BaseDetailV2#init
				 * @overridden
				 */
				init: function(callback, scope) {
					this.updateCanShowDataGrid();
					this.callParent([
						function() {
							callback.call(scope);
						},
						this
					]);
				},

				/**
				 * Метод передает по ссылке конфиг контрола индикатора.
				 * @param {Object} control Объект содержащий конфиг контрола.
				 * @overridden
				 */
				applyControlConfig: function(control) {
					control.config = {
						className: "Terrasoft.BaseProgressBar",
						value: {
							"bindTo": "QualifyStatus",
							"bindConfig": {"converter": "getQualifyStatusValue"}
						},
						width: "158px"
					};
				},

				/**
				 * Добавляет метод, возвращающий конфигурацию ссылки в ячейке реестра.
				 * @overridden
				 * @param {Terrasoft.BaseViewModel} item Элемент реестра.
				 * @return {Object} URL.
				 */
				addColumnLink: function(item) {
					item.getQualifyStatusValue = function(qualifyStatus) {
						if (!qualifyStatus) {
							return null;
						} else {
							return {
								value: this.get("QualifyStatus.StageNumber"),
								displayValue: qualifyStatus.displayValue
							};
						}
					};
					return this.callParent(arguments);
				},

				/**
				 * Возвращает колонки, которые всегда выбираются запросом.
				 * @protected
				 * @overriden
				 * @return {Object} Возвращает массив объектов-конфигураций колонок.
				 */
				getGridDataColumns: function() {
					var gridDataColumns = this.callParent(arguments);
					gridDataColumns["QualifyStatus.StageNumber"] =
						gridDataColumns["QualifyStatus.StageNumber"] || {path: "QualifyStatus.StageNumber"};
					return gridDataColumns;
				},

				getIsCanShowDataGrid: function(canShowDataGrid) {
					return !canShowDataGrid;
				},

				/**
				 * @inheritdoc Terrasoft.GridUtilitiesV2#getFilterDefaultColumnName
				 * @overridden
				 */
				getFilterDefaultColumnName: function() {
					return "LeadType";
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "AddRecordButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "addRecord"},
						"visible": {"bindTo": "getToolsVisible"},
						"enabled": {"bindTo": "getAddRecordButtonEnabled"},
						"caption": {"bindTo": "Resources.Strings.AddButtonCaption"}
					},
					"index": 0
				},
				{
					"operation": "insert",
					"name": "ToolsButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "Resources.Images.ToolsButtonImage"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"visible": {"bindTo": "getToolsVisible"},
						"classes": {
							wrapperClass: ["detail-tools-button-wrapper"],
							menuClass: ["detail-tools-button-menu"]
						},
						"menu": {
							"items": {
								"bindTo": "ToolsButtonMenu"
							}
						}
					},
					"index": 1
				},
				{
					"operation": "remove",
					"name": "DataGrid"
				},
				{
					"operation": "insert",
					"name": "DataGrid",
					"parentName": "Detail",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID,
						"listedZebra": true,
						"collection": {"bindTo": "Collection"},
						"activeRow": {"bindTo": "ActiveRow"},
						"primaryColumnName": "Id",
						"isEmpty": {"bindTo": "IsGridEmpty"},
						"isLoading": {"bindTo": "IsGridLoading"},
						"multiSelect": {"bindTo": "MultiSelect"},
						"selectedRows": {"bindTo": "SelectedRows"},
						"sortColumn": {"bindTo": "sortColumn"},
						"sortColumnDirection": {"bindTo": "GridSortDirection"},
						"sortColumnIndex": {"bindTo": "SortColumnIndex"},
						"linkClick": {"bindTo": "linkClicked"},
						"className": "Terrasoft.ControlGrid",
						"controlColumnName": "QualifyStatus",
						"applyControlConfig": {"bindTo": "applyControlConfig"}
					}
				},
				{
					"operation": "insert",
					"name": "EmptyEntityLabel",
					"parentName": "Detail",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {
							"labelClass": ["t-label ts-empty-entity-label"]
						},
						"caption": {"bindTo": "Resources.Strings.EmptyEntityLabel"},
						"visible": {
							"bindTo": "CanShowDataGrid",
							"bindConfig": {"converter": "getIsCanShowDataGrid"}
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
