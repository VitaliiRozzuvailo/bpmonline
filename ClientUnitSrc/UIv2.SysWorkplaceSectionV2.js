define("SysWorkplaceSectionV2", ["LocalizableHelper", "ServiceHelper", "SysWorkplaceSectionGridRowViewModel",
		"SysWorkplaceUtilitiesModuleV2", "css!SysWorkplaceUtilitiesModuleV2"],
function(LocalizableHelper, ServiceHelper) {
	return {
		entitySchemaName: "SysWorkplace",

		messages: {
			"RefreshWorkplace": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.PUBLISH
			}
		},

		attributes: {
			"SecurityOperationName": {
				"dataValueType": this.Terrasoft.DataValueType.STRING,
				"value": "CanManageWorkplaceSettings"
			}
		},

		methods: {

			/**
			 * @overridden
			 */
			getGridRowViewModelClassName: function() {
				return "Terrasoft.SysWorkplaceSectionGridRowViewModel";
			},

			/**
			* Возвращает представления раздела по умолчанию.
			* Реестр, Аналитика
			* @protected
			* @return {Object} Представления раздела по умолчанию
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
			* @override
			* @returns {string}
			*/
			getDefaultGridDataViewCaption: function() {
				return this.get("Resources.Strings.HeaderCaption");
			},

			/**
			 * @override
			 */
			initSeparateModeActionsButtonHeaderMenuItemCaption: function() {
				this.set("SeparateModeActionsButtonHeaderMenuItemCaption", this.get("Resources.Strings.HeaderCaption"));
				this.set("IsIncludeInFolderButtonVisible", false);
			},

			/**
			 * Метод выполняет действия над выделенной строкой в завистимости от tag
			 * @private
			 */
			onActiveRowAction: function(tag, id) {
				if (tag === "delete" || tag === "edit") {
					this.callParent(arguments);
				} else {
					var gridData = this.getGridData();
					var activeRow = gridData.get(id);
					var position = activeRow.get("Position");
					if (tag === "up") {
						if (position > 0) {
							position--;
						}
					}
					if (tag === "down") {
						position++;
					}
					this.setPosition(id, position, function() {
						gridData.clear();
						this.loadGridData();
					}, this);
				}
			},

			/**
			 * Получает колонки, которые всегда выбираются запросом
			 * @protected
			 * @overridden
			 * @return {Object} Возвращает колонки, которые всегда выбираются запросом
			 */
			getGridDataColumns: function() {
				var gridDataColumns = this.callParent(arguments);
				if (!gridDataColumns.Position) {
					gridDataColumns.Position = {
						path: "Position",
						orderPosition: 0,
						orderDirection: Terrasoft.OrderDirection.ASC
					};
				}
				return gridDataColumns;
			},

			/**
			 * Устанавливает позицию записи.
			 * @protected
			 * @virtual
			 * @param {String} recordId Уникальный идентификатор записи.
			 * @param {Number} position Новая позиция записи.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			setPosition: function(recordId, position, callback, scope) {
				var data = {
					tableName: this.entitySchemaName,
					primaryColumnValue: recordId,
					position: position,
					grouppingColumnNames: ""
				};
				ServiceHelper.callService("RightsService", "SetCustomRecordPosition", callback, data, scope);
			},

			/**
			* Выполняет действия необходимые после отображения страницы.
			* @protected
			* @overridden
			*/
			onRender: function() {
				if (!this.get("Restored")) {
					this.loadActiveViewData();
				}
				this.callParent(arguments);
			}

		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "DataGrid",
				"values": {
					"activeRowAction": {bindTo: "onActiveRowAction"},
					"type": "tiled",
					"listedConfig": {
						"name": "DataGridListedConfig",
						"items": [
							{
								"name": "NameListedGridColumn",
								"bindTo": "Name",
								"type": Terrasoft.GridCellType.TEXT,
								"position": {"column": 1, "colSpan": 14}
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
					"wrapClass": ["workplace-data-views-container-wrapClass"]
				}
			},
			{
				"operation": "insert",
				"name": "DataGridActiveRowMoveUpAction",
				"parentName": "DataGrid",
				"propertyName": "activeRowActions",
				"values": {
					"className": "Terrasoft.Button",
					"style": Terrasoft.controls.ButtonEnums.style.BLUE,
					"imageConfig": LocalizableHelper.localizableImages.Up,
					"tag": "up"
				}
			},
			{
				"operation": "insert",
				"name": "DataGridActiveRowMoveDownAction",
				"parentName": "DataGrid",
				"propertyName": "activeRowActions",
				"values": {
					"className": "Terrasoft.Button",
					"style": Terrasoft.controls.ButtonEnums.style.BLUE,
					"imageConfig": LocalizableHelper.localizableImages.Down,
					"tag": "down"
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
			}
		]/**SCHEMA_DIFF*/
	};
});
