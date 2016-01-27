define("LeadSectionV2", ["LeadSectionV2Resources", "terrasoft", "ProcessModuleUtilities", "LeadConfigurationConst",
		"ControlGridModule", "BaseProgressBarModule", "EntityHelper", "css!BaseProgressBarModule",
		"css!LeadQualificationModuleStyles"],
	function(resources, Terrasoft, ProcessModuleUtilities, LeadConfigurationConst) {
		return {
			entitySchemaName: "Lead",
			attributes: {
				"UseProcessLeadManagement": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				}
			},
			mixins: {
				EntityHelper: "Terrasoft.EntityHelper"
			},
			messages: {
				/**
				 * @message GetBackHistoryState
				 * Возвращает путь, куда переходить после нажатия на кнопку закрыть
				 * в окне настройки типа потребности.
				 */
				"GetBackHistoryState": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			methods: {
				/**
				 * Инициализирует начальные значения модели.
				 * @overridden
				 * @param {Function} callback Функция обратного вызова.
				 */
				init: function(callback) {
					this.callParent([function() {
						Terrasoft.SysSettings.querySysSettingsItem("UseProcessLeadManagement", function(value) {
							this.set("UseProcessLeadManagement", value);
							callback.call(this);
						}, this);
					}, this]);
					var initialHistoryState = this.sandbox.publish("GetHistoryState").hash.historyState;
					this.set("InitialHistoryState", initialHistoryState);
				},

				/**
				 * Подписка на события sandbox
				 * @protected
				 * @overriden
				 */
				subscribeSandboxEvents: function() {
					this.callParent();
					this.sandbox.subscribe("GetBackHistoryState", function() {
						return this.get("InitialHistoryState");
					}, this, ["LeadTypeSectionV2"]);
				},

				/**
				 * Возвращает коллекцию действий раздела.
				 * Добавляет действие "Настройка типов потребностей".
				 * @protected
				 * @overridden
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий.
				 */
				getSectionActions: function() {
					var actionMenuItems = this.callParent(arguments);
					actionMenuItems.addItem(this.getActionsMenuItem({
						"Type": "Terrasoft.MenuSeparator",
						"Caption": ""
					}));
					actionMenuItems.addItem(this.getActionsMenuItem({
						"Caption": {"bindTo": "Resources.Strings.ConfigureLeadTypes"},
						"Enabled": true,
						"Click": {"bindTo": "navigateToLeadTypeSection"}
					}));
					return actionMenuItems;
				},

				/**
				 * Реализует действие "Настройка типов потребностей".
				 * Переход в раздел Типы потребностей.
				 * @protected
				 */
				navigateToLeadTypeSection: function() {
					this.sandbox.publish("PushHistoryState", {
						hash: "SectionModuleV2/LeadTypeSectionV2"
					});
				},

				/**
				 * Возвращает колонки, которые всегда выбираются запросом.
				 * @protected
				 * @overriden
				 * @return {Object} Возвращает массив объектов-конфигураций колонок.
				 */
				getGridDataColumns: function() {
					var gridDataColumns = this.callParent(arguments);
					gridDataColumns.QualifyStatus = gridDataColumns.QualifyStatus || {path: "QualifyStatus"};
					gridDataColumns.QualificationProcessId =
						gridDataColumns.QualificationProcessId || {path: "QualificationProcessId"};
					gridDataColumns["QualifyStatus.StageNumber"] =
						gridDataColumns["QualifyStatus.StageNumber"] || {path: "QualifyStatus.StageNumber"};
					return gridDataColumns;
				},

				/**
				 * Выполняет действие при нажатии на кнопку в строке рееестра.
				 * @protected
				 * @overridden
				 * @param {String} buttonTag Признак для определения действия.
				 */
				onActiveRowAction: function(buttonTag) {
					if (buttonTag === "onQualificationProcessButtonClick") {
						this.onQualificationProcessButtonClick();
					} else {
						this.callParent(arguments);
					}
				},

				/**
				 * Обработчик нажатия кнопки QualificationProcessButton.
				 */
				onQualificationProcessButtonClick: function() {
					if (this.get("IsCardVisible")) {
						this.sandbox.publish("OnCardAction", "onQualificationProcessButtonClick",
							[this.getCardModuleSandboxId()]);
					} else {
						var activeRow = this.getActiveRow();
						var qualificationProcessId = activeRow.get("QualificationProcessId");
						if (!qualificationProcessId) {
							this.refreshColumns(["QualificationProcessId"],
								this.executeQualificationProcess, activeRow);
						} else {
							this.executeQualificationProcess();
						}
					}
				},

				/**
				 * Выполняет запуск процесса упарвления лидом с точки его последней активности.
				 */
				executeQualificationProcess: function() {
					var activeRow = this.getActiveRow();
					var qualificationProcessId = activeRow.get("QualificationProcessId");
					if (qualificationProcessId) {
						ProcessModuleUtilities.continueExecuting(qualificationProcessId, this);
					} else {
						Terrasoft.SysSettings.querySysSettingsItem("LeadManagementProcess", function(sysSetting) {
							var processName = "";
							if (!sysSetting) {
								processName = "LeadManagement";
							}
							var processId = sysSetting.value;
							ProcessModuleUtilities.executeProcess({
								"sysProcessName": processName,
								"sysProcessId": processId,
								"parameters": {
									"LeadId": this.getPrimaryColumnValue(),
									"ManualLaunch": true
								}
							});
						}, this);
					}
				},

				/**
				 * Возвращает состояние квалификации лида.
				 * @param {String} id Уникальный идентификатор записи Лида.
				 * @return {String}
				 */
				getQualifyStatus: function(id) {
					var activeRow;
					if (id) {
						var gridData = this.getGridData();
						activeRow = gridData.get(id);
					} else {
						activeRow = this.getActiveRow();
					}
					if (!activeRow) {
						return null;
					}
					var qualifyStatus = activeRow.get("QualifyStatus");
					return (qualifyStatus) ? qualifyStatus.value : null;
				},

				/**
				 * Добавляет метод, возвращающий конфигурацию ссылки в ячейке реестра.
				 * @overridden
				 * @param {Terrasoft.BaseViewModel} item Элемент реестра.
				 * @return {Object} URL.
				 */
				addColumnLink: function(item) {
					var self = this;
					item.getQualificationProcessButtonCaption = function() {
						return self.getQualificationProcessButtonCaption.call(self, this.get(this.primaryColumnName));
					};
					item.getIsQualificationStageActive = function() {
						return self.getIsQualificationStageActive.call(self, this.get(this.primaryColumnName));
					};
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
				 * Возвращает заголовок кнопки запуска процесса квалификации.
				 * @param {String} id Уникальный идентификатор записи Лида.
				 * @return {String} Заголовок кнопки запуска активного процесса квалификации.
				 */
				getQualificationProcessButtonCaption: function(id) {
					var qualifyStatusId = this.getQualifyStatus(id);
					var qualifyStatus = LeadConfigurationConst.LeadConst.QualifyStatus;
					if (qualifyStatusId === qualifyStatus.Qualification) {
						return this.get("Resources.Strings.QualifyStatusQualificationCaption");
					}
					if (qualifyStatusId === qualifyStatus.Distribution) {
						return this.get("Resources.Strings.QualifyStatusDistributionCaption");
					}
					if (qualifyStatusId === qualifyStatus.TransferForSale) {
						return this.get("Resources.Strings.QualifyStatusTranslationForSaleCaption");
					}
					return "";
				},

				/**
				 * Возвращает признак активности стадии квалификации.
				 * @param {String} id Уникальный идентификатор записи Лида.
				 * @return {Boolean}
				 */
				getIsQualificationStageActive: function(id) {
					if (!this.get("UseProcessLeadManagement")) {
						return false;
					}
					var qualifyStatusId = this.getQualifyStatus(id);
					var qualifyStatus = LeadConfigurationConst.LeadConst.QualifyStatus;
					return (qualifyStatusId === qualifyStatus.Qualification ||
						qualifyStatusId === qualifyStatus.Distribution ||
						qualifyStatusId === qualifyStatus.TransferForSale);
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
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "remove",
					"name": "DataGrid"
				},
				{
					"operation": "insert",
					"name": "DataGrid",
					"parentName": "DataGridContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID,
						"type": {"bindTo": "GridType"},
						"listedZebra": true,
						"activeRow": {"bindTo": "ActiveRow"},
						"collection": {"bindTo": "GridData"},
						"isEmpty": {"bindTo": "IsGridEmpty"},
						"isLoading": {"bindTo": "IsGridLoading"},
						"multiSelect": {"bindTo": "MultiSelect"},
						"primaryColumnName": "Id",
						"selectedRows": {"bindTo": "SelectedRows"},
						"sortColumn": {"bindTo": "sortColumn"},
						"sortColumnDirection": {"bindTo": "GridSortDirection"},
						"sortColumnIndex": {"bindTo": "SortColumnIndex"},
						"selectRow": {"bindTo": "rowSelected"},
						"linkClick": {"bindTo": "linkClicked"},
						"needLoadData": {"bindTo": "needLoadData"},
						"activeRowAction": {"bindTo": "onActiveRowAction"},
						"activeRowActions": [],
						"className": "Terrasoft.ControlGrid",
						"controlColumnName": "QualifyStatus",
						"applyControlConfig": {"bindTo": "applyControlConfig"},
						"getEmptyMessageConfig": {"bindTo": "prepareEmptyGridMessageConfig"}
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowOpenAction",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.BLUE,
						"caption": {"bindTo": "Resources.Strings.OpenRecordGridRowButtonCaption"},
						"tag": "edit"
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowCopyAction",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": {"bindTo": "Resources.Strings.CopyRecordGridRowButtonCaption"},
						"tag": "copy"
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowDeleteAction",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": {"bindTo": "Resources.Strings.DeleteRecordGridRowButtonCaption"},
						"tag": "delete"
					}
				},
				{
					"operation": "insert",
					"name": "ProcessEntryPointGridRowButton",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": {"bindTo": "Resources.Strings.ProcessEntryPointGridRowButtonCaption"},
						"tag": "processEntryPoint",
						"visible": {"bindTo": "getProcessEntryPointGridRowButtonVisible"}
					}
				},
				{
					"operation": "insert",
					"name": "QualificationProcessButton",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "getQualificationProcessButtonCaption"},
						"markerValue": {"bindTo": "getQualificationProcessButtonCaption"},
						"click": {"bindTo": "onQualificationProcessButtonClick"},
						"classes": {"textClass": "actions-button-margin-right"},
						"iconAlign": Terrasoft.controls.ButtonEnums.iconAlign.RIGHT,
						"imageConfig": resources.localizableImages.QualificationProcessButtonImage,
						"visible": {"bindTo": "getIsQualificationStageActive"}
					}
				},
				{
					"operation": "insert",
					"name": "DataGridActiveRowQualificationProcessAction",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "getQualificationProcessButtonCaption"},
						"tag": "onQualificationProcessButtonClick",
						"iconAlign": Terrasoft.controls.ButtonEnums.iconAlign.RIGHT,
						"imageConfig": resources.localizableImages.QualificationProcessActionImage,
						"classes": {"textClass": "ts-grid-image-action"},
						"visible": {"bindTo": "getIsQualificationStageActive"}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
