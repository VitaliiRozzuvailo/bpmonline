define("SysProcessElementLogDetailV2", ["ProcessModule", "ConfigurationConstants", "MaskHelper",
		"SysProcessElementLogDetailV2Resources"],
		function(ProcessModule, ConfigurationConstants, MaskHelper) {
			return {
				entitySchemaName: "SysProcessElementLog",
				attributes: {
					/**
					 * Признак видимости кнопки "Выполнить элемент"
					 */
					"IsRunElementButtonVisible": {
							dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
							type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					},
					/**
					 * Признак видимости кнопки "Скачать описание ошибки"
					 */
					"IsErrorButtonsVisible": {
						dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
						type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					}
				},
				messages: {
					/**
					 * Получает значение поля Состояние родительского процесса.
					 */
					"GetProcessStatus": {
						mode: this.Terrasoft.MessageMode.PTP,
						direction: this.Terrasoft.MessageDirectionType.PUBLISH
					}
				},
				methods: {
					/**
					 * @inheritdoc BaseGridDetailV2#addRecordOperationsMenuItems
					 * @overridden
					 */
					addRecordOperationsMenuItems: this.Terrasoft.emptyFn,
					/**
					 * @inheritdoc BaseGridDetailV2#addDetailWizardMenuItems
					 * @overridden
					 */
					addDetailWizardMenuItems:  this.Terrasoft.emptyFn,
					/**
					 * @inheritdoc BaseGridDetailV2#getSwitchGridModeMenuItem
					 * @overridden
					 */
					getSwitchGridModeMenuItem: this.Terrasoft.emptyFn,
					initDetailOptions: function() {
						this.set("IsDetailCollapsed", true);
						this.callParent();
					},
					getGridDataColumns: function() {
						var gridDataColumns = this.callParent(arguments);
						if (!gridDataColumns.ErrorDescription) {
							gridDataColumns.ErrorDescription = {
								path: "ErrorDescription"
							};
						}
						if (!gridDataColumns.SysProcess) {
							gridDataColumns.SysProcess = {
								path: "SysProcess"
							};
						}
						if (!gridDataColumns.Status) {
							gridDataColumns.Status = {
								path: "Status"
							};
						}
						return gridDataColumns;
					},
					runElement:  function(recordId) {
						if (!recordId && this.isSingleSelected()) {
							var activeRow = this.getActiveRow();
							recordId = activeRow.get(this.primaryColumnName);
						}
						var data = {
							procElUId: recordId
						};
						MaskHelper.ShowBodyMask();
						var responseCallback = function() {
							MaskHelper.HideBodyMask();
						};
						ProcessModule.services.callConfigurationServiceMethod("ProcessEngineService/ExecuteProcessElement",
								data, responseCallback);
					},
					/**
					 * @inheritdoc GridUtilitiesV2#onGridDataLoaded
					 * @overridden
					 */
					onGridDataLoaded: function() {
						this.callParent(arguments);
						this.set("IsRunElementButtonVisible", this.runElementButtonVisible());
						this.set("IsErrorButtonsVisible", this.getErrorButtonsVisible());
					},
					/*
					 * Обработчик события выбора записи детали.
					 * @protected
					 * @param {String} rowId Идентификатор выбираемой записи.
					 */
					selectRow: function(rowId) {
						this.set("IsRunElementButtonVisible", this.runElementButtonVisible(rowId));
						this.set("IsErrorButtonsVisible", this.getErrorButtonsVisible(rowId));
					},
					/**
					 * Возвращает значение видимости кнопки "Выполнить элемент"
					 * @returns {boolean}
					 */
					runElementButtonVisible: function(rowId) {
						var gridData = this.getGridData();
						if (this.get("IsDetailCollapsed") || gridData.getCount() === 0) {
							return false;
					}
						var activeRow = rowId ? gridData.get(rowId) : this.getActiveRow();
						if (!activeRow) {
							return false;
						}
						var status = ConfigurationConstants.SysProcess.Status;
						var elementStatus = activeRow.get("Status");
						if (elementStatus.value === status.Performed) {
							return true;
						} else if (elementStatus.value === status.Error) {
							var processStatus = this.sandbox.publish("GetProcessStatus");
							return processStatus.value !== status.Canceled;
						}
					},
					/**
					 * Возвращает значение видимости кнопки "Скачать описание ошибки"
					 * @returns {boolean}
					 */
					getErrorButtonsVisible: function(rowId) {
						var gridData = this.getGridData();
						if (this.get("IsDetailCollapsed") || gridData.getCount() === 0) {
							return false;
						}
						var activeRow = rowId ? gridData.get(rowId) : this.getActiveRow();
						if (activeRow) {
							var status = activeRow.get("Status");
							return status.value === ConfigurationConstants.SysProcess.Status.Error;
						}
						return false;
					},
					takeError: function() {
						var activeRow = this.getActiveRow();
						var errorDescription = activeRow.get("ErrorDescription");
						var errorBlob = new Blob([errorDescription], {type: "text/plain;charset=UTF-8"});
						var processName = activeRow.get("SysProcess").displayValue;
						var txtFile = document.createElement("a");
						txtFile.href = URL.createObjectURL(errorBlob);
						txtFile.download = processName + "_Error";
						document.body.appendChild(txtFile);
						txtFile.click();
						document.body.removeChild(txtFile);
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
										"name": "CaptionListedGridColumn",
										"bindTo": "Caption",
										"position": {
											"column": 1,
											"colSpan": 10
										}
									},
									{
										"name": "StatusListedGridColumn",
										"bindTo": "Status",
										"position": {
											"column": 11,
											"colSpan": 4
										}
									},
									{
										"name": "StartDateListedGridColumn",
										"bindTo": "StartDate",
										"position": {
											"column": 15,
											"colSpan": 5
										}
									},
									{
										"name": "CompleteDateListedGridColumn",
										"bindTo": "CompleteDate",
										"position": {
											"column": 20,
											"colSpan": 5
										}
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
										"name": "CaptionTiledGridColumn",
										"bindTo": "Caption",
										"position": {
											"row": 1,
											"column": 1,
											"colSpan": 10
										}
									},
									{
										"name": "StatusTiledGridColumn",
										"bindTo": "Status",
										"position": {
											"row": 1,
											"column": 11,
											"colSpan": 4
										}
									},
									{
										"name": "StartDateTiledGridColumn",
										"bindTo": "StartDate",
										"position": {
											"row": 1,
											"column": 15,
											"colSpan": 5
										}
									},
									{
										"name": "CompleteDateTiledGridColumn",
										"bindTo": "CompleteDate",
										"position": {
											"row": 1,
											"column": 20,
											"colSpan": 5
										}
									}
								]
							},
							"selectRow": {"bindTo": "selectRow"}
						}
					},
					{
						"operation": "insert",
						"name": "RunElementButton",
						"parentName": "Detail",
						"index": 2,
						"propertyName": "tools",
						"values":
						{
							"itemType": Terrasoft.ViewItemType.BUTTON,
							"caption": {"bindTo": "Resources.Strings.ExecuteElementCaption"},
							"click": {
								"bindTo": "runElement"
							},
							"visible": {
								"bindTo": "IsRunElementButtonVisible"
							}
						}
					}, {
						"operation": "insert",
						"name": "TakeErrorButton",
						"parentName": "Detail",
						"index": 3,
						"propertyName": "tools",
						"values":
						{
							"itemType": Terrasoft.ViewItemType.BUTTON,
							"caption": {"bindTo": "Resources.Strings.TakeErrorCaption"},
							"click": {
								"bindTo": "takeError"
							},
							"visible": {
								"bindTo": "IsErrorButtonsVisible"
							}
						}
					}
				]/**SCHEMA_DIFF*/
			};
		}
);
