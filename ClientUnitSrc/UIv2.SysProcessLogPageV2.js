define("SysProcessLogPageV2", ["ProcessModuleUtilities", "ProcessModule", "ConfigurationConstants"],
		function(ProcessModuleUtilities, ProcessModule, ConfigurationConstants) {
			return {
				entitySchemaName: "SysProcessLog",
				attributes: {
					/**
					 * Название операции доступ на которую должен быть у пользователя для использования страницы
					 */
					SecurityOperationName: {
						dataValueType: Terrasoft.DataValueType.STRING,
						value: "CanManageProcessLogSection"
					}
				},
				messages: {
					"ExecutionCanceled": {
						mode: this.Terrasoft.MessageMode.PTP,
						direction: this.Terrasoft.MessageDirectionType.PUBLISH
					},
					/**
					 * Возвращает значение поля Состояние процесса
					 */
					"GetProcessStatus": {
						mode: this.Terrasoft.MessageMode.PTP,
						direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
					}
				},
				details: /**SCHEMA_DETAILS*/{
					ProcessElementLog: {
						schemaName: "SysProcessElementLogDetailV2",
						filter: {
							detailColumn: "SysProcess"
						}
					},
					ProcessEntity: {
						schemaName: "SysProcessEntityDetailV2",
						filter: {
							detailColumn: "SysProcess"
						},
						filterMethod: "entityDetailFilter"
					}
				}/**SCHEMA_DETAILS*/,
				methods: {
					/**
					 * Инициализирует подписку на изменение свойств карточки
					 * @protected
					 * @overriden
					 */
					initCardActionHandler: function() {
						this.callParent(arguments);
						var propertyNames = [
							"Status"
						];
						this.Terrasoft.each(propertyNames, function(propertyName) {
							this.on("change:" + propertyName, function(model, value) {
								this.sandbox.publish("CardChanged", {
									key: propertyName,
									value: value
								}, [this.sandbox.id]);
							}, this);
						}, this);
					},
					/**
					 * Возвращает коллекцию действий карточки
					 * @protected
					 * @overridden
					 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий карточки
					 */
					getActions: function() {
						var actionMenuItems = this.callParent(arguments);
						actionMenuItems.addItem(this.getActionsMenuItem({
							Type: "Terrasoft.MenuSeparator",
							Caption: ""
						}));
						actionMenuItems.addItem(this.getActionsMenuItem({
							Caption: {bindTo: "Resources.Strings.CancelExecutionButtonCaption"},
							Tag: "cancelExecutionConfirmation",
							Visible: {
								"bindTo": "Status",
								"bindConfig": {
									"converter": function(value) {
										return this.getShowCancelExecutionMenuVisible(value);
									}
								}
							}
						}));
						actionMenuItems.addItem(this.getActionsMenuItem({
							Caption: {bindTo: "Resources.Strings.ProcessDiagramButtonCaption"},
							Tag: "processDiagram"
						}));
						return actionMenuItems;
					},

					getShowCancelExecutionMenuVisible: function(status) {
						var parent = this.get("Parent");
						if (parent) {
							return false;
						}
						var currentStatus = status ? status.value : null;
						return (currentStatus === ConfigurationConstants.SysProcess.Status.Performed ||
							currentStatus === ConfigurationConstants.SysProcess.Status.Error);
					},

					/**
					 * Отображает вопрос пользователю для подтвержления опреации отмены бизнес-процесса
					 */
					cancelExecutionConfirmation: function() {
						this.showConfirmationDialog(this.get("Resources.Strings.CancelExecutionConfirmation"),
							this.cancelExecution, ["yes", "no"]);
					},

					/**
					 * Выполняет отмену бизнес-процесса, если пользователь подтвердил операцию
					 * @param result
					 */
					cancelExecution: function(result) {
						if (result !== Terrasoft.MessageBoxButtons.YES.returnCode) {
							return;
						}
						var selectedItemId = this.get(this.primaryColumnName);
						var data = {
							processDataIds: selectedItemId
						};
						var maskId = this.Terrasoft.Mask.show();
						var responseCallback = function() {
							this.loadEntity(selectedItemId);
							this.sandbox.publish("ExecutionCanceled",
								selectedItemId
							);
							this.updateDetails();
							this.Terrasoft.Mask.hide(maskId);
						};
						ProcessModule.services.cancelExecution(this, data, responseCallback);
					},

					/**
					 * Выполняет открытие диаграммы процесса
					 */
					processDiagram: function() {
						ProcessModuleUtilities.showProcessDiagram(this.get(this.primaryColumnName));
					},
					updateButtonsVisibility: function() {
						this.set("ShowDiscardButton", false);
						this.set("ShowSaveButton", false);
					},

					/**
					 * Функция создания фильтров детали Связанные элементы
					 */
					entityDetailFilter: function() {
						var filterGroup = new this.Terrasoft.createFilterGroup();
						filterGroup.add("ProcessFilter", this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "SysProcess", this.get("Id")));
						filterGroup.add("WorkspaceFilter", this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "SysWorkspace",
								this.Terrasoft.SysValue.CURRENT_WORKSPACE.value));
						return filterGroup;
					},

					/**
					 * Получение состояния процесса
					 */
					onGetProcessStatus: function() {
						return this.get("Status");
					},

					/**
					 * Инициализирует начальные значения модели
					 * @protected
					 * @overload
					 */
					init: function(callback, scope) {
						this.sandbox.subscribe("GetProcessStatus", this.onGetProcessStatus, this);
						this.callParent(arguments);
					},

					/**
					 * Убирает пункт открытия Мастера раздела из меню кнопки "Вид".
					 * overridden
					 */
					addSectionDesignerViewOptions: this.Terrasoft.emptyFn
				},
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "insert",
						"name": "GeneralInfoTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.GeneralInfoTabCaption"},
							"items": []
						}
					}, {
						"operation": "insert",
						"parentName": "GeneralInfoTab",
						"name": "GeneralInfoControlGroup",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"controlConfig": {
								collapsed: false
							}
						}
					}, {
						"operation": "insert",
						"parentName": "GeneralInfoControlGroup",
						"propertyName": "items",
						"name": "GeneralInfoBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					}, {
						"operation": "insert",
						"parentName": "GeneralInfoBlock",
						"propertyName": "items",
						"name": "Name",
						"values": {
							"bindTo": "Name",
							"layout": {"column": 0, "row": 0, "colSpan": 24},
							"controlConfig": {
								"enabled": false
							}
						}
					}, {
						"operation": "insert",
						"parentName": "GeneralInfoBlock",
						"propertyName": "items",
						"name": "Status",
						"values": {
							"bindTo": "Status",
							"layout": {"column": 0, "row": 1, "colSpan": 12},
							"controlConfig": {
								"enabled": false
							}
						}
					}, {
						"operation": "insert",
						"parentName": "GeneralInfoBlock",
						"propertyName": "items",
						"name": "Owner",
						"values": {
							"bindTo": "Owner",
							"layout": {"column": 12, "row": 1, "colSpan": 12},
							"controlConfig": {
								"enabled": false
							}
						}
					}, {
						"operation": "insert",
						"parentName": "GeneralInfoBlock",
						"propertyName": "items",
						"name": "StartDate",
						"values": {
							"bindTo": "StartDate",
							"layout": {"column": 0, "row": 2, "colSpan": 12},
							"controlConfig": {
								"enabled": false
							}
						}
					}, {
						"operation": "insert",
						"parentName": "GeneralInfoBlock",
						"propertyName": "items",
						"name": "CompleteDate",
						"values": {
							"bindTo": "CompleteDate",
							"layout": { "column": 12, "row": 2, "colSpan": 12},
							"controlConfig": {
								"enabled": false
							}
						}
					}, {
						"operation": "insert",
						"parentName": "GeneralInfoTab",
						"propertyName": "items",
						"name": "ProcessElementLog",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					}, {
						"operation": "insert",
						"parentName": "GeneralInfoTab",
						"propertyName": "items",
						"name": "ProcessEntity",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					}
				]/**SCHEMA_DIFF*/
			};
		});
