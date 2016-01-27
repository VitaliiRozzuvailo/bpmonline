define("SysProcessLogSectionV2", ["BaseFiltersGenerateModule", "ConfigurationConstants", "ProcessModule",
		"RightUtilities", "ProcessModuleUtilities", "SysProcessLogSectionV2GridRowViewModel"],
	function(BaseFiltersGenerateModule, ConfigurationConstants, ProcessModule, RightUtilities, ProcessModuleUtilities) {
		return {
			entitySchemaName: "SysProcessLog",
			attributes: {
				/**
				 * Название операции доступ на которую должен быть у пользователя для использования секции
				 */
				SecurityOperationName: {
					dataValueType: Terrasoft.DataValueType.STRING,
					value: "CanManageProcessLogSection"
				}
				// TODO Расскомментировать когда заработает кастомная фильтрация раздела
			/*attributes: {
				/*	ExtendedFilterConfig: {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					folderFilterViewId: "ProcessLogFolderFilterView",
					folderFilterViewModelId: "ProcessLogFolderFilterViewModel"
					//updateFiltersByObjectPath: this.methods.updateFiltersByObjectPath
				},
				FolderFilterConfig: {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					extendedFilterViewId: "ProcessLogExtendedFilterEditView",
					extendedFilterViewModelId: "ProcessLogExtendedFilterEditModel"
					//updateFiltersByObjectPath: this.methods.updateFiltersByObjectPath
				}
			}
				}*/
			},
			messages: {
				"ExecutionCanceled": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			methods: {
				/**
				 * Убирает пункт открытия Мастера раздела из меню кнопки "Вид".
				 * @overridden
				 */
				addSectionDesignerViewOptions: Terrasoft.emptyFn,
				/**
				 * Переопределены ресурсы для модели записи реестра
				 * @overridden
				 */
				getGridRowViewModelClassName: function() {
					return "Terrasoft.SysProcessLogSectionV2GridRowViewModel";
				},
				/**
				 * Возвращает коллекцию действий раздела в режиме отображения реестра
				 * @protected
				 * @overridden
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий раздела в режиме
				 * отображения реестра
				 */
				getSectionActions: function() {
					var actionMenuItems = this.callParent(arguments);
					var newActionMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
					actionMenuItems.each(function(item) {
						if (item.values.Caption &&
								item.values.Caption.bindTo === "Resources.Strings.DeleteRecordButtonCaption") {
							return false;
						}
						newActionMenuItems.addItem(item);
					}, this);
					newActionMenuItems.addItem(this.getButtonMenuItem({
						Type: "Terrasoft.MenuSeparator",
						Caption: ""
					}));
					newActionMenuItems.addItem(this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.CancelExecutionButtonCaption"},
						Click: {"bindTo": "cancelExecutionConfirmation"},
						Visible: {"bindTo": "getShowCancelExecutionMenuVisible"}
					}));
					return newActionMenuItems;
				},

				/**
				 *
				 * @overridden
				 */
				unSetMultiSelect: function() {
					this.callParent(arguments);
					if (this.get("HasCanceledItems")) {
						this.reloadGridData();
						this.set("HasCanceledItems", false);
					}
				},

				/**
				 * @overridden
				 */
				getGridDataColumns: function() {
					var gridDataColumns = this.callParent(arguments);
					if (!gridDataColumns.StartDate) {
						gridDataColumns.StartDate = {
							path: "StartDate"
						};
					}
					if (!gridDataColumns.Parent) {
						gridDataColumns.Parent = {
							path: "Parent"
						};
					}
					return gridDataColumns;
				},

				/**
				 * Инициализирует значения настроек контекстной справки.
				 * @overridden
				 */
				initContextHelp: function() {
					this.set("ContextHelpId", 7001);
					this.callParent(arguments);
				},

				/**
				 * @overridden
				 */
				init: function() {
					this.initCanCancelProcess();
					this.callParent(arguments);
					this.set("UseTagModule", false);
					this.set("UseStaticFolders", true);
					this.set("TagButtonVisible", false);
					this.sandbox.subscribe("ExecutionCanceled", this.reloadCanceledProcessGridData, this);
				},

				/**
				 * Обновляет реестр для отмененных процессов
				 * @param id {String} Уникальный идентификатор записи реестра
				 */
				reloadCanceledProcessGridData: function(id) {
					this.loadGridDataRecord(id);
					var gridData = this.getGridData();
					var subProcessGridData = gridData.filterByFn(function(item) {
						var parent = item.values.Parent;
						return parent && (parent.value === id);
					}, this);
					if (subProcessGridData.getCount() > 0) {
						subProcessGridData.each(function(item) {
							this.reloadCanceledProcessGridData(item.values.Id);
						}, this);
					}
				},

				/**
				 * Инициализирует атрибута CanCancelProcess
				 * @protected
				 */
				initCanCancelProcess: function() {
					this.set("CanCancelProcess", false);
					RightUtilities.checkCanExecuteOperation({operation: "CanCancelProcess"},
						this.setCanCancelProcess, this);
				},
				setCanCancelProcess: function(result) {
					this.set("CanCancelProcess", result);
				},
				/**
				 * Возвращает признак отображения меню Отменить выполнение
				 * @returns {Boolean}
				 */
				getShowCancelExecutionMenuVisible: function() {
					var result = this.get("CanCancelProcess");
					if (!result) {
						return false;
					}
					var selectedItems = this.getSelectedItems();
					if (!selectedItems || selectedItems.length === 0) {
						return false;
					}
					var gridData = this.getGridData();
					this.Terrasoft.each(selectedItems, function(recordId) {
						var selectedRow = gridData.get(recordId);
						if (selectedRow) {
							var parent = selectedRow.get("Parent");
							if (parent) {
								result = false;
								return false;
							}
							var status = selectedRow.get("Status").value;
							result = (status === ConfigurationConstants.SysProcess.Status.Performed ||
								status === ConfigurationConstants.SysProcess.Status.Error);
							if (!result) {
								return false;
							}
						}
					}, this);
					return result;
				},
				/**
				 * Если в фильтр построен не по схеме раздела, подменяет путь фильтрации
				 * относительно схемы SysProcessEntity
				 * @param filter
				 * @param entitySchema
				 * @param updateFiltersByObjectPath
				 */
				updateFiltersByObjectPath: function(filter, entitySchema, updateFiltersByObjectPath) {
					if (!entitySchema) {
						return;
					}
					if (!Ext.isEmpty(filter.leftExpression) && entitySchema !== "SysProcessLog") {
						filter.leftExpression.columnPath =
							"[SysProcessEntity:SysProcess].[" + entitySchema + ":Id:EntityId]." +
								filter.leftExpression.columnPath;
					} else if (filter.getItems) {
						Terrasoft.each(filter.getItems(), function(item) {
							updateFiltersByObjectPath(item, item.rootSchemaName || entitySchema,
								updateFiltersByObjectPath);
						});
					}
				},

				/**
				 * @overridden
				 */
				initFixedFiltersConfig: function() {
					var fixedFilterConfig = {
						entitySchema: this.entitySchema,
						filters: [
							{
								name: "PeriodFilter",
								caption: this.get("Resources.Strings.PeriodFilterCaption"),
								dataValueType: Terrasoft.DataValueType.DATE,
								startDate: {
									columnName: "StartDate"
								},
								dueDate: {
									columnName: "StartDate"
								}
							},
							{
								name: "Owner",
								caption: this.get("Resources.Strings.OwnerFilterCaption"),
								columnName: "Owner",
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								filter: BaseFiltersGenerateModule.OwnerFilter
							}
						]
					};
					this.set("FixedFilterConfig", fixedFilterConfig);
				},

				/**
				 * @overridden
				 */
				getFilters: function() {
					var filters = this.callParent(arguments);
					var filterName = "WorkspaceFilter";
					if (!filters.contains(filterName)) {
						filters.add(filterName, Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "SysWorkspace",
							Terrasoft.SysValue.CURRENT_WORKSPACE.value));
					}
					return filters;
				},
				/**
				 * Открывает в новом окне страницу просмотра диаграммы бизнес-процесса
				 * @param recordId (optional)
				 */
				showProcessDiagram: function(recordId) {
					if (!recordId && this.isSingleSelected()) {
						var activeRow = this.getActiveRow();
						recordId = activeRow.get("Id");
					}
					var url = "../ViewPage.aspx?Id=" +
						ConfigurationConstants.ProcessLog.sysProcessLogViewPageId +
						"&recordId=" + recordId;
					window.open(url);
				},
				/**
				 * @overridden
				 */
				onActiveRowAction: function(buttonTag, primaryColumnValue) {
					switch (buttonTag) {
						case "processDiagram":
							this.showProcessDiagram(primaryColumnValue);
							break;
						case "сancelExecution":
							this.cancelExecutionConfirmation();
							break;
						default:
							this.callParent(arguments);
							break;
					}
				},
				/**
				 * Отображает вопрос пользователю для подтвержления опреации отмены бизнес-процесса
				 */
				cancelExecutionConfirmation: function() {
					if (!this.isAnySelected()) {
						return;
					}
					this.showConfirmationDialog(this.get("Resources.Strings.CancelExecutionConfirmation"),
						this.cancelExecution, ["yes", "no"]);
				},
				/**
				 * Выполняет отмену бизнес-процееса, если пользователь подтвердил операцию
				 * @param result
				 */
				cancelExecution: function(result) {
					if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
						var selectedItems = this.getSelectedItems();
						var processDataIds = "";
						var isNotFirstItem = false;
						for (var i = 0; i < selectedItems.length; i++) {
							if (isNotFirstItem) {
								processDataIds += ";";
							} else {
								isNotFirstItem = true;
							}
							processDataIds += selectedItems[i];
						}
						var data = {
							processDataIds: processDataIds
						};
						var maskId = this.Terrasoft.Mask.show();
						var responseCallback = function() {
							for (var i = 0; i < selectedItems.length; i++) {
								this.reloadCanceledProcessGridData(selectedItems[i]);
							}
							if (this.get("MultiSelect") && selectedItems.length > 0) {
								this.set("HasCanceledItems", true);
							}
							this.Terrasoft.Mask.hide(maskId);
						};
						ProcessModule.services.cancelExecution(this, data, responseCallback);
					}
				},
				processDiagram: function() {
					ProcessModuleUtilities.showProcessDiagram(this.getActiveRow().get(this.primaryColumnName));
				},

				prepareResponseCollection: function(collection) {
					this.mixins.GridUtilities.prepareResponseCollection.call(this, collection);
					var canCancelProcess = this.get("CanCancelProcess");
					collection.each(function(item) {
						item.set("CanCancelProcess", canCancelProcess);
						item.getCancelExecutionVisible = function() {
							if (!canCancelProcess) {
								return false;
							}
							if (this.get("Parent")) {
								return false;
							}
							var status = this.get("Status").value;
							var sysProcessStatus =  ConfigurationConstants.SysProcess.Status;
							return (status === sysProcessStatus.Performed) || (status === sysProcessStatus.Error);
						};
					}, this);
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "DataGridActiveRowProcessDiagram",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": {"bindTo": "Resources.Strings.ProcessDiagramButtonCaption"},
						"tag": "processDiagram"
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowCancelExecution",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": {"bindTo": "Resources.Strings.CancelExecutionButtonCaption"},
						"tag": "сancelExecution",
						"visible": {
							"bindTo": "getCancelExecutionVisible"
						}
					}
				},
				{
					"operation": "merge",
					"name": "SeparateModeAddRecordButton",
					"values": {
						"visible": false
					}
				},
				{
					"operation": "merge",
					"name": "CombinedModeAddRecordButton",
					"values": {
						"visible": false
					}
				},
				{
					"operation": "merge",
					"name": "DeleteRecordMenuItem",
					"values": {
						"visible": false
					}
				},
				{
					"operation": "merge",
					"name": "DataGridActiveRowDeleteAction",
					"values": {
						"visible": false
					}
				},
				{
					"operation": "merge",
					"name": "DataGridActiveRowCopyAction",
					"values": {
						"visible": false
					}
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowDeleteAction"
				},
				{
					"operation": "merge",
					"name": "CardContainer",
					"values": {
						"wrapClass": ["card", "right-el", "sys-process-card-container"]
					}
				},
				{
					"operation": "merge",
					"name": "CombinedModeViewOptionsButton",
					"values": {
						"visible": {"bindTo": "IsSectionVisible"}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
