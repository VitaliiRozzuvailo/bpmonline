define("SessionDetailV2", ["terrasoft", "SessionDetailV2Resources"],
	function(Terrasoft, resources) {
		return {
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "remove",
					"name": "AddRecordButton"
				},
				{
					"operation": "remove",
					"name": "ActionsButton"
				},
				{
					"operation": "merge",
					"name": "DataGrid",
					"parentName": "Detail",
					"propertyName": "items",
					"values": {
						"selectRow": {"bindTo": "rowSelected"},
						"activeRowAction": {"bindTo": "onActiveRowAction"},
						"activeRowActions": []
					}
				},
				{
					"operation": "insert",
					"name": "EndTheSessionActionButton",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": resources.localizableStrings.EndTheSessionButtonCaption,
						"tag": "endSession",
						"markerValue": "EndSessionButtonMarker",
						"visible": {
							"bindTo": "SessionEndDate",
							"bindConfig": {
								"converter": function(value) {
									return !value;
								}
							}
						}
					}
				},
				{
					"operation": "insert",
					"name": "EndTheSessionButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"index": 0,
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.EndTheSessionButtonCaption"},
						"click": {"bindTo": "endTheSession"},
						"enabled": {"bindTo": "EndTheSessionButtonEnabled"}
					}
				}
			]/**SCHEMA_DIFF*/,
			entitySchemaName: "SysUserSession",
			methods: {

				/**
				 * Обработчик нажатия на кнопки выделенной записи.
				 * @protected
				 * @param {String} buttonTag Тег кнопки.
				 * @param {Guid} primaryColumnValue Идентификатор выделенной записи.
				 */
				onActiveRowAction: function(buttonTag, primaryColumnValue) {
					switch (buttonTag) {
						case "endSession":
							this.endTheSession(primaryColumnValue);
							break;
					}
				},

				/**
				 * Обрабатывает событие выбора строки реестра.
				 * @protected
				 */
				rowSelected: function(primaryColumnValue) {
					this.setEndTheSessionButtonEnable(primaryColumnValue);
				},

				/**
				 * @inheritdoc GridUtilitiesV2#onGridDataLoaded
				 * @overridden
				 */
				onGridDataLoaded: function() {
					this.callParent(arguments);
					this.setEndTheSessionButtonEnable(this.get("ActiveRow"));
				},

				/**
				 * Получает значение доступности кнопки "Завершить сеанс".
				 * @protected
				 * @return {boolean} Видимость кнопки.
				 */
				setEndTheSessionButtonEnable: function(primaryColumnValue) {
					var visible = false;
					var activeRow;
					if (primaryColumnValue) {
						var gridData = this.getGridData();
						activeRow = gridData.find(primaryColumnValue) ? gridData.get(primaryColumnValue) : null;
					}
					if (!this.Ext.isEmpty(activeRow)) {
						visible = this.Ext.isEmpty(activeRow.get("SessionEndDate"));
					}
					this.set("EndTheSessionButtonEnabled", visible);
				},

				/**
				 * @inheritdoc BaseDetailV2#getSwitchGridModeMenuItem
				 * @overridden
				 */
				getSwitchGridModeMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc BaseDetailV2#getSwitchGridModeMenuItem
				 * @overridden
				 */
				addRecordOperationsMenuItems: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addDetailWizardMenuItems
				 * @overridden
				 */
				addDetailWizardMenuItems: this.Terrasoft.emptyFn,

				/**
				 * Обрабатывает ответ сервера после действия Завершить сеанс.
				 * @param {Object} response Объект, содержащий ответ сервера.
				 * @protected
				 */
				endTheSessionCallBack: function(response) {
					if (response) {
						if (!this.Ext.isEmpty(response.TerminateSessionResult) &&
							response.TerminateSessionResult >= 0) {
							this.reloadGridData();
						} else {
							this.showInformationDialog(
								this.get("Resources.Strings.TerminateSessionErrorMessage"));
						}
					}
				},

				/**
				 * Выполняет действие "Завершить сеанс".
				 * @protected
				 */
				endTheSession: function() {
					this.showConfirmationDialog(this.get("Resources.Strings.TerminateSessionMessage"),
						function(returnCode) {
							if (returnCode === this.Terrasoft.MessageBoxButtons.NO.returnCode) {
								return;
							}
							var dataSend = {
								recordId: this.get("ActiveRow")
							};
							var config = {
								serviceName: "AdministrationService",
								methodName: "TerminateSession",
								data: dataSend
							};
							this.callService(config, this.endTheSessionCallBack);
						},
						[this.Terrasoft.MessageBoxButtons.YES.returnCode, this.Terrasoft.MessageBoxButtons.NO.returnCode],
						null);
				}
			}
		};
	});