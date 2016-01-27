define("VisaDetailV2", ["terrasoft", "VisaHelper", "ConfigurationConstants", "SecurityUtilities"],
	function(Terrasoft, VisaHelper, ConfigurationConstants) {
		return {
			attributes: {
				"IsShowAll": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					value: true
				},
				/**
				 * Название операции, доступ на которую должен быть у пользователя для использования страницы.
				 */
				"SecurityOperationName": {
					"dataValueType": this.Terrasoft.DataValueType.STRING,
					"value": "CanManageUsers"
				}
			},
			mixins: {
				SecurityUtilitiesMixin: "Terrasoft.SecurityUtilitiesMixin"
			},
			methods: {
				/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#linkClicked
			 * @overridden
				 */
				linkClicked: function(recordId, columnName, href, callParentOnLinkClicked) {
					if (callParentOnLinkClicked) {
						this.callParent(arguments);
						return false;
					}
					if (columnName === "VisaOwner" || columnName === "DelegatedFrom") {
						Terrasoft.chain(
							this.checkAvailability,
							function() {
								this.linkClicked(recordId, columnName, href, true);
							},
							this
						);
					} else {
						this.callParent(arguments);
					}
					return false;
				},

				/**
				 * Выполняет визирование выделенной записи.
				 * @private
				 **/
				approve: function() {
					var activeRow = this.getActiveRow();
					if (!this.checkState(activeRow)) {
						return;
					}
					VisaHelper.approveAction(activeRow, this.visaHelperActionsCallBack, this);
				},

				/**
				 * Выполняет проверку состояния визы.
				 * @private
				 * @return {bool}
				 **/
				checkState: function(entity) {
					var status = entity.get("Status");
					if (entity.get("IsCanceled") === true) {
						this.showInformationDialog(this.get("Resources.Strings.IsCanceled"));
						return false;
					}
					if (status.value === ConfigurationConstants.VisaStatus.positive.value) {
						this.showInformationDialog(this.get("Resources.Strings.ApproveYet"));
						return false;
					}
					if (status.value === ConfigurationConstants.VisaStatus.negative.value) {
						this.showInformationDialog(this.get("Resources.Strings.RejectingYet"));
						return false;
					}
					return true;
				},

				/**
				 * Выполняет действие отклонить визирование.
				 * @private
				 **/
				reject: function() {
					var activeRow = this.getActiveRow();
					if (!this.checkState(activeRow)) {
						return;
					}
					VisaHelper.rejectAction(activeRow, this.visaHelperActionsCallBack, this);
				},

				/**
				 * Выполняет действие сменить визирующего.
				 * @private
				 **/
				changeVizier: function() {
					var activeRow = this.getActiveRow();
					var id = activeRow.get("Id");
					var visaEntityName = activeRow.entitySchema.name;
					VisaHelper.changeVizierAction(id, visaEntityName, this.sandbox, null, this.visaHelperActionsCallBack, this);
				},

				/**
				 * Получает название кнопки в зависимости от View.
				 * @private
				 **/
				getCaptionShowAll: function() {
					return this.get("IsShowAll")
						? this.get("Resources.Strings.ShowAllCaption")
						: this.get("Resources.Strings.ShowActualCaption");
				},

				/**
				 * Выполняет действие показать все визы.
				 * @private
				 **/
				showAllActualVisas: function() {
					this.set("IsClearGridData", true);
					var showAll = this.get("IsShowAll");
					this.loadGridData();
					this.set("IsShowAll", !showAll);
				},

				/**
				 * Возвращает фильтр для выполнения запроса.
				 * @protected
				 * @return {Object}
				 **/
				getFilters: function() {
					var filters = this.Ext.create("Terrasoft.FilterGroup");
					var baseFilter = this.callParent(arguments);
					if (baseFilter) {
						filters.addItem(baseFilter);
					}
					if (!this.get("IsShowAll")) {
						filters.addItem(Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "IsCanceled", false));
					}
					return filters;
				},

				/**
				 * Получает колонки, которые всегда выбираются запросом.
				 * @protected
				 * @overridden
				 * @return {Object} Возвращает колонки, которые всегда выбираются запросом.
				 */
				getGridDataColumns: function() {
					var gridDataColumns = this.callParent(arguments);
					if (!gridDataColumns.IsCanceled) {
						gridDataColumns.IsCanceled = {
							path: "IsCanceled"
						};
					}
					return gridDataColumns;
				},

				/**
				 * Делает недоступным/доступным пункт меню "Сменить визирующего"
				 * @returns {boolean} - результат доступности пункта меню
				 */
				setEnableVisaOwnerMenuActions: function() {
					if (this.getEditRecordButtonEnabled()) {
						var record = this.getActiveRow();
						var status = record.get("Status");
						this.getGridDataColumns();
						var isCanceled = record.get("IsCanceled");
						if (status.displayValue === ConfigurationConstants.VisaStatus.positive.displayValue ||
							status.displayValue === ConfigurationConstants.VisaStatus.negative.displayValue ||
							isCanceled) {
							return false;
						}
						return true;
					}
				},

				/**
				 * CallBack функции "отправить на визирование".
				 * @protected
				 * @param {Object} result
				 **/
				addCallBack: function(result) {
					var activeRow = this.getActiveRow();
					var primaryColumnValue = activeRow.get("Id");
					var selectedRow = result.selectedRows.getByIndex(0);
					var update = this.Ext.create("Terrasoft.UpdateQuery", {
						rootSchema: this.entitySchema
					});
					update.enablePrimaryColumnFilter(primaryColumnValue);
					update.setParameterValue("DelegatedFrom",  activeRow.get("VisaOwner").value);
					update.setParameterValue("VisaOwner", selectedRow.value);
					update.execute(function(response) {
						if (response.success) {
							activeRow.set("DelegatedFrom", activeRow.get("VisaOwner"));
							activeRow.set("VisaOwner", selectedRow);
						}
					}, this);
				},

				/**
				 * CallBack функция действий VisaHelper
				 * @private
				 * @param {object} response
				 * @param {object} updateObject
				 **/
				visaHelperActionsCallBack: function(response, updateObject) {
					var activeRow = this.getActiveRow();
					if (!response.success) {
						return;
					}
					this.Terrasoft.each(updateObject, function(item, itemName) {
						activeRow.set(itemName, item);
					}, this);
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addRecordOperationsMenuItems
				 * @overridden
				 */
				addRecordOperationsMenuItems: function(toolsButtonMenu) {
					this.callParent(arguments);
					toolsButtonMenu.addItem(this.getButtonMenuSeparator());
					toolsButtonMenu.addItem(this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.Approve"},
						Click: {"bindTo": "approve"},
						Enabled: {bindTo: "getEditRecordButtonEnabled"}
					}));
					toolsButtonMenu.addItem(this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.Reject"},
						Click: {"bindTo": "reject"},
						Enabled: {bindTo: "getEditRecordButtonEnabled"}
					}));
					toolsButtonMenu.addItem(this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.ChangeVisaOwner"},
						Click: {"bindTo": "changeVizier"},
						Enabled: {bindTo: "setEnableVisaOwnerMenuActions"}
					}));
					toolsButtonMenu.addItem(this.getButtonMenuItem({
						Caption: {"bindTo": "getCaptionShowAll"},
						Click: {"bindTo": "showAllActualVisas"}
					}));
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getCopyRecordMenuItem
				 * @overridden
				 */
				getCopyRecordMenuItem: Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.GridUtilitiesV2#getFilterDefaultColumnName
				 * @overridden
				 */
				getFilterDefaultColumnName: function() {
					return "VisaOwner";
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
									"name": "ObjectiveListedGridColumn",
									"bindTo": "Objective",
									"position": {
										"column": 1,
										"colSpan": 24
									},
									"type": Terrasoft.GridCellType.TITLE
								}
							]
						},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": {
								"columns": 24,
								"rows": 3
							},
							"items": [
								{
									"name": "ObjectiveTiledGridColumn",
									"bindTo": "Objective",
									"position": {
										"row": 1,
										"column": 1,
										"colSpan": 24
									},
									"type": Terrasoft.GridCellType.TITLE
								}
							]
						}
					}
				},
				{
					"operation": "remove",
					"name": "AddRecordButton"
				}
			]/**SCHEMA_DIFF*/
		};
	}
);