define("SupplyPaymentTemplateItemDetailV2", ["ConfigurationGrid", "ConfigurationGridGenerator",
		"ConfigurationGridUtilities"],
	function() {
		return {
			entitySchemaName: "SupplyPaymentTemplateItem",

			attributes: {
				IsEditable: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: true
				},

				/**
				 * Используется для вызова callback-метода после загрузки данных реестра.
				 * После первого вызова автоматически обнуляется.
				 */
				AddRowOnDataChangedConfig: {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}
			},

			mixins: {
				ConfigurationGridUtilites: "Terrasoft.ConfigurationGridUtilities"
			},

			methods: {

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getGridSortMenuItem
				 * @overridden
				 */
				getGridSortMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getCopyRecordMenuItem
				 * @overridden
				 */
				getCopyRecordMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getEditRecordMenuItem
				 * @overridden
				 */
				getEditRecordMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getDeleteRecordMenuItem
				 * @overridden
				 */
				getDeleteRecordMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getSwitchGridModeMenuItem
				 * @overridden
				 */
				getSwitchGridModeMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addDetailWizardMenuItems
				 * @overridden
				 */
				addDetailWizardMenuItems: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#sortColumn
				 * @overridden
				 */
				sortColumn: this.Terrasoft.emptyFn,

				/**
				 * @inheritDoc Terrasoft.configuration.mixins.GridUtilities#getGridDataColumns
				 * @protected
				 * @overridden
				 */
				getGridDataColumns: function() {
					var gridDataColumns = {
						"Position": {
							path: "Position",
							orderPosition: 0,
							orderDirection: this.Terrasoft.OrderDirection.ASC
						}
					};
					return gridDataColumns;
				},

				/**
				 * @inheritDoc Terrasoft.configuration.mixins.ConfigurationGridUtilites#saveRowChanges
				 * @overridden
				 */
				saveRowChanges: function(row, callback, scope) {
					if (!row || !this.Ext.isFunction(row.isChanged)) {
						this.mixins.ConfigurationGridUtilites.saveRowChanges.apply(this, arguments);
						return;
					}
					var needReloadAfterSave = this.checkAnyColumnChanged(row, ["PreviousElement", "Delay", "Name"]);
					this.mixins.ConfigurationGridUtilites.saveRowChanges.call(this, row, function() {
						if (needReloadAfterSave) {
							this.set("AddRowOnDataChangedConfig", {callback: callback, scope: scope});
							this.reloadGridData();
						} else if (callback) {
							callback.call(scope || this);
						}
					}, this);
				},

				/**
				 * Проверяет, изменялись ли колонки. Возвращает результат проверки.
				 * @param {Terrasoft.BaseModel} row Запись реестра.
				 * @param {Array} columnNames Массив названий колонок.
				 * @return {Boolean} true, если была изменена одна из колонок.
				 */
				checkAnyColumnChanged: function(row, columnNames) {
					var result = false;
					if (row && row.isChanged()) {
						this.Terrasoft.each(columnNames, function(columnName) {
							result = row.changedValues.hasOwnProperty(columnName);
							if (result) {
								return false;
							}
						}, this);
					}
					return result;
				},

				/**
				 * @inheritDoc Terrasoft.configuration.mixins.GridUtilitesV2#onGridDataLoaded
				 * @overridden
				 */
				onGridDataLoaded: function() {
					this.callParent(arguments);
					var addRowConfig = this.get("AddRowOnDataChangedConfig");
					if (addRowConfig) {
						this.set("AddRowOnDataChangedConfig", null);
						addRowConfig.callback.call(addRowConfig.scope);
					}
				},

				/**
				 * @inheritdoc Terrasoft.ConfigurationGridUtilities#getAddItemsToGridDataOptions
				 * @overridden
				 */
				getAddItemsToGridDataOptions: function() {
					return {mode: "bottom"};
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "remove",
					"name": "DataGridActiveRowOpenAction"
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowCopyAction"
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowDeleteAction"
				},
				{
					"operation": "remove",
					"name": "ProcessEntryPointGridRowButton"
				},
				{
					"operation": "insert",
					"name": "activeRowActionSave",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "save",
						"markerValue": "save",
						"imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
					}
				},
				{
					"operation": "insert",
					"name": "activeRowActionSave",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "cancel",
						"markerValue": "cancel",
						"imageConfig": {"bindTo": "Resources.Images.CancelIcon"}
					}
				},
				{
					"operation": "insert",
					"name": "activeRowActionSave",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "remove",
						"markerValue": "remove",
						"imageConfig": {"bindTo": "Resources.Images.RemoveIcon"}
					}
				},
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"className": "Terrasoft.ConfigurationGrid",
						"generator": "ConfigurationGridGenerator.generatePartial",
						"type": "listed",
						"generateControlsConfig": {"bindTo": "generatActiveRowControlsConfig"},
						"changeRow": {"bindTo": "changeRow"},
						"unSelectRow": {"bindTo": "unSelectRow"},
						"onGridClick": {"bindTo": "onGridClick"},
						"sortColumnIndex": null,
						"listedZebra": true,
						"initActiveRowKeyMap": {"bindTo": "initActiveRowKeyMap"},
						"activeRowAction": {"bindTo": "onActiveRowAction"},
						"activeRowActions": [],
						"listedConfig": {
							"name": "DataGridListedConfig",
							"items": [
								{
									"name": "NameListedGridColumn",
									"bindTo": "Name",
									"position": {
										"column": 1,
										"colSpan": 5
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "TypeListedGridColumn",
									"bindTo": "Type",
									"position": {
										"column": 5,
										"colSpan": 2
									}
								},
								{
									"name": "DelayListedGridColumn",
									"bindTo": "Delay",
									"position": {
										"column": 7,
										"colSpan": 4
									}
								},
								{
									"name": "PercentageListedGridColumn",
									"bindTo": "Percentage",
									"position": {
										"column": 11,
										"colSpan": 2
									}
								},
								{
									"name": "PreviousElementListedGridColumn",
									"bindTo": "PreviousElement",
									"position": {
										"column": 13,
										"colSpan": 5
									}
								}
							]
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
