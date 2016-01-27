define("BaseVwProcessLibPageV2", ["BaseVwProcessLibPageV2Resources", "GeneralDetails", "ProcessModuleUtilities",
		"ConfigurationEnums", "ProcessLibraryConstants", "RightUtilities"],
	function(resources, GeneralDetails, ProcessModuleUtilities, Enums, ProcessLibraryConstants, RightUtilities) {
		return {
			entitySchemaName: "VwProcessLib",
			attributes: {
				/**
				 * Название операции доступ на которую должен быть у пользователя для использования страницы
				 */
				SecurityOperationName: {
					dataValueType: Terrasoft.DataValueType.STRING,
					value: "CanManageProcessDesign"
				}
			},
			details: /**SCHEMA_DETAILS*/{
				Files: {
					schemaName: "FileDetailV2",
					entitySchemaName: "VwProcessLibFile",
					filter: {
						masterColumn: "Id",
						detailColumn: "VwProcessLibFileId"
					}
				},
				ProcessInModules: {
					schemaName: "ProcessInModulesDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "SysSchemaUId"
					}
				}
			}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "Caption",
					"values": {
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 24,
							"rowSpan": 1
						},
						"bindTo": "Caption",
						"caption": {
							"bindTo": "Resources.Strings.CaptionCaption"
						},
						"textSize": "Default",
						"contentType": 1,
						"isRequired": true
					},
					"parentName": "Header",
					"propertyName": "items",
					"index": 0
				},
				{
					"operation": "insert",
					"name": "Name",
					"values": {
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 20,
							"rowSpan": 1
						},
						"bindTo": "Name",
						"caption": {
							"bindTo": "Resources.Strings.NameCaption"
						},
						"textSize": "Default",
						"contentType": 1,
						"isRequired": true
					},
					"parentName": "Header",
					"propertyName": "items",
					"index": 1
				},
				{
					"operation": "insert",
					"name": "Enabled",
					"values": {
						"layout": {
							"column": 20,
							"row": 1,
							"colSpan": 4,
							"rowSpan": 1
						},
						"bindTo": "Enabled",
						"caption": {
							"bindTo": "Resources.Strings.EnabledCaption"
						},
						"textSize": "Default"
					},
					"parentName": "Header",
					"propertyName": "items",
					"index": 4
				},
				{
					"operation": "insert",
					"name": "SysPackage",
					"values": {
						"layout": {
							"column": 0,
							"row": 2,
							"colSpan": 24,
							"rowSpan": 1
						},
						"bindTo": "SysPackage",
						"caption": {
							"bindTo": "Resources.Strings.SysPackageCaption"
						},
						"textSize": "Default",
						"contentType": 3,
						"isRequired": true
					},
					"parentName": "Header",
					"propertyName": "items",
					"index": 2
				},
				{
					"operation": "insert",
					"name": "ModulesTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.ModulesTabCaption"},
						"items": []
					}
				},
				{
					"operation": "remove",
					"name": "ESNTab"
				},
				{
					"operation": "insert",
					"parentName": "ModulesTab",
					"propertyName": "items",
					"name": "ProcessInModules",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "OpenProcessDesignerButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.OpenInDesignerButtonCaption"},
						"classes": {"textClass": "actions-button-margin-right"},
						"click": {"bindTo": "show5xProcessSchemaDesigner"},
						"style": Terrasoft.controls.ButtonEnums.style.BLUE
					}
				}
			]/**SCHEMA_DIFF*/,
			messages: {
				/**
				 * @message GetIsVisibleCancelRunningProcessesAction
				 * Получает информацию о том, нужно ли отображать действие "Отменить запущенные процессы"
				 */
				"GetIsVisibleCancelRunningProcessesAction": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message ResetStartProcessMenuItems
				 * Сообщение о том, что нужно обновить пункты меню кнопки "Запустить процесс"
				 */
				"ResetStartProcessMenuItems": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			methods: {
				/**
				 * @overridden
				 */
				init: function(callback) {
					this.callParent([function() {
						this.set("IsSubscribed", false);
						this.initCanCancelRunningProcess(callback, this);
					}, this]);
				},
				/**
				 * Добавляет фильтрацию по текущему рабочему пространству.
				 * @overridden
				 */
				getEntitySchemaQuery: function() {
					var esq = this.callParent(arguments);
					var filterName = "WorkspaceFilter";
					var filters = esq.filters;
					if (filters.contains(filterName)) {
						return esq;
					}
					filters.add(filterName, Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "SysWorkspace",
						Terrasoft.SysValue.CURRENT_WORKSPACE.value));
					var enablePrimaryColumnFilter = esq.enablePrimaryColumnFilter;
					esq.enablePrimaryColumnFilter = function() {
						enablePrimaryColumnFilter.apply(esq, arguments);
						var workspaceFilter = esq.filters.get(filterName);
						workspaceFilter.isEnabled = true;
					};
					return esq;
				},
				/**
				 * Убирает пункт открытия Мастера раздела из меню кнопки "Вид".
				 * overridden
				 */
				addSectionDesignerViewOptions: Terrasoft.emptyFn,
				/**
				 * Инициализирует значение признака: есть ли у пользователя права на выполнение операции
				 * "Отменить запущенные процессы"
				 * @param {Function} callback Функция обратного вызова
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения
				 * @private
				 */
				initCanCancelRunningProcess: function(callback, scope) {
					this.setCanCancelRunningProcess(false);
					RightUtilities.checkCanExecuteOperation({operation: "CanCancelProcess"}, function(value) {
						this.setCanCancelRunningProcess(value);
						this.updateIsVisibleCancelRunningProcessesAction();
						if (callback) {
							callback.call(this);
						}
					}, scope || this);
				},
				/**
				 * Проставляет значение признака: есть ли у пользователя права на выполнение операции
				 * "Отменить запущенные процессы"
				 * @private
				 */
				setCanCancelRunningProcess: function(value) {
					this.set("CanCancelProcess", value);
				},
				/**
				 * Открывает модальное окно свойств схемы процесса
				 * @protected
				 */
				showExtendedProperties: Terrasoft.abstractFn,
				/**
				 * Возвращает коллекцию действий карточки
				 * @protected
				 * @overridden
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий карточки
				 */
				getActions: function() {
					var actionMenuItems = this.callParent(arguments);
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Caption": this.get("Resources.Strings.RunProcessActionCaption"),
						"Tag": "executeProcess",
						"Visible": {
							"bindTo": "getIsVisibleRunProcessAction"
						}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Caption": this.get("Resources.Strings.ShowExtendedPropertiesActionCaption"),
						"Tag": "showExtendedProperties",
						"Visible": {
							"bindTo": "getIsVisibleQuickModelActions"
						}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Caption": this.get("Resources.Strings.PublishProcessActionCaption"),
						"Tag": "publish",
						"Visible": {
							"bindTo": "Operation",
							"bindConfig": {
								"converter": function(value) {
									return value !== Enums.CardStateV2.ADD;
								}
							}
						}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Caption": this.get("Resources.Strings.CancelRunningProcessesActionCaption"),
						"Tag": "cancelRunningProcesses",
						"Visible": {
							"bindTo": "IsVisibleCancelRunningProcessesAction"
						}
					}));
					return actionMenuItems;
				},
				/**
				 * Возвращает признак отображения пункта меню "Запустить процесс"
				 * @private
				 * @returns {Boolean}
				 */
				getIsVisibleRunProcessAction: function() {
					if (this.get("Operation") === Enums.CardStateV2.ADD) {
						return false;
					}
					return (this.get("TagProperty") === ProcessLibraryConstants.VwProcessLib.BusinessProcessTag);
				},
				/**
				 * Обновляет признак отображения пункта меню "Отменить запущенные процессы"
				 * @private
				 */
				updateIsVisibleCancelRunningProcessesAction: function() {
					var isVisible = !this.get("HasNoRunningProcess") && this.get("CanCancelProcess") &&
						this.getIsQuickModelProcessSchemaType();
					var propertyName = "IsVisibleCancelRunningProcessesAction";
					this.set(propertyName, isVisible);
					this.sandbox.publish("GetIsVisibleCancelRunningProcessesAction", {
						key: propertyName,
						value: isVisible
					});
				},
				/**
				 * Возвращает признак отображения пунктов меню Мастера процессов
				 * @private
				 * @returns {Boolean}
				 */
				getIsVisibleQuickModelActions: function() {
					return this.getIsQuickModelProcessSchemaType();
				},
				/**
				 * Возвращает признак, указывающий на то, что схема создана мастером процессов.
				 * @private
				 * @returns {Boolean}
				 */
				getIsQuickModelProcessSchemaType: function() {
					var processSchemaType = this.get("ProcessSchemaType");
					return processSchemaType &&
						processSchemaType.value === ProcessLibraryConstants.VwProcessLib.Type.QuickModel;
				},
				/**
				 * Открывает дизайнер процесса 5x
				 * @protected
				 */
				show5xProcessSchemaDesigner: function() {
					if (ProcessModuleUtilities.getIsDemoMode(this)) {
						return;
					}
					ProcessModuleUtilities.show5xProcessSchemaDesigner(this.get(this.primaryColumnName));
				},
				/**
				 * Запускает на выполнение бизнес-процесс
				 * @private
				 */
				executeProcess: function() {
					ProcessModuleUtilities.executeProcess({
						"sysProcessId": this.get(this.primaryColumnName)
					});
				},
				/**
				 * Отменяет все запущенные экземпляры бизнес-процесса
				 * @private
				 */
				cancelRunningProcesses: function() {
					if (ProcessModuleUtilities.getIsDemoMode(this)) {
						return;
					}
					var message = this.get("Resources.Strings.CancelRunningProcessesConfirmationMessage");
					var runningProcessCount = this.get("RunningProcessCount");
					this.showConfirmationDialog(this.Ext.String.format(message, runningProcessCount), function(result) {
						if (result === Terrasoft.MessageBoxButtons.NO.returnCode) {
							return;
						}
						ProcessModuleUtilities.cancelExecutionBySchemaId(this, this.get("SysSchemaId"),
							function(responseObject) {
								var hasNoRunningProcess = responseObject && responseObject.success;
								this.set("HasNoRunningProcess", hasNoRunningProcess);
								if (hasNoRunningProcess) {
									this.set("RunningProcessCount", 0);
								}
								this.sandbox.publish("SetHasNoRunningProcess", hasNoRunningProcess,
									[this.getFlowElementsModuleId()]);
							}
						);
					}, [Terrasoft.MessageBoxButtons.YES.returnCode, Terrasoft.MessageBoxButtons.NO.returnCode]);
				},
				/**
				 * @overridden
				 */
				onEntityInitialized: function() {
					this.callParent(arguments);
					if (this.isAddMode() || this.isCopyMode()) {
						this.set("Enabled", true);
						this.set("UId", this.get(this.primaryColumnName));
					}
				},
				/**
				 * Обработать событие выбора пункта меню Опубликовать процесс
				 * @private
				 */
				publish: function() {
					if (ProcessModuleUtilities.getIsDemoMode(this)) {
						return;
					}
					if (!this.getIsQuickModelProcessSchemaType()) {
						ProcessModuleUtilities.publish();
						return;
					}
					if (this.get("Enabled")) {
						this.publishQuickModelProcessSchema();
						return;
					}
					var buttonsConfig = {
						"buttons":
							[Terrasoft.MessageBoxButtons.YES.returnCode, Terrasoft.MessageBoxButtons.NO.returnCode],
						"defaultButton": 0
					};
					this.showInformationDialog(this.get("Resources.Strings.ShouldActivateProcessMessage"),
						function(result) {
							if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
								this.set("Enabled", true);
							}
							this.publishQuickModelProcessSchema();
						}, buttonsConfig, this);
				},
				/**
				 * Выполняет сохранение и публикацию QuickModel схемы процесса
				 * @private
				 */
				publishQuickModelProcessSchema: function() {
					this.set("shouldBePublished", true);
					this.save();
				},
				/**
				 * Скрывает отображение действий: подписки и отписки на обновление ленты
				 * @overriden
				 * @return {Boolean}
				 */
				getSubscribeButtonVisible: function() {
					return false;
				},
				/**
				 * @inheritdoc Terrasoft.Terrasoft.BasePrintFormViewModel#initCardPrintForms
				 * @overridden
				 */
				initCardPrintForms: function(callback, scope) {
					var printMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
					this.set(this.moduleCardPrintFormsCollectionName, printMenuItems);
					if (callback) {
						callback.call(scope || this);
					}
				},
				/**
				 * @inheritdoc Terrasoft.BasePageV2#save
				 * @overridden
				 */
				save: function() {
					var isQuickModelProcessSchemaType = this.getIsQuickModelProcessSchemaType();
					var isNewMode = this.isNewMode();
					var hasNoRunningProcess = this.get("HasNoRunningProcess");
					if (isQuickModelProcessSchemaType && (isNewMode || hasNoRunningProcess)) {
						this.callParent(arguments);
						return;
					}
					ProcessModuleUtilities.showBodyMask();
					this.updateRunButtonProcessList(function() {
						this.updateButtonsVisibility(false, {force: true});
						ProcessModuleUtilities.hideBodyMask();
					});
				},
				/**
				 * Обновляет информацию: какие процессы отображать в пунктах меню кнопки "Запустить процесс"
				 * @private
				 */
				updateRunButtonProcessList: function(callback) {
					var entitySchemaName = "RunButtonProcessList";
					var deleteQuery = Ext.create("Terrasoft.DeleteQuery", {
						rootSchemaName: entitySchemaName
					});
					deleteQuery.filters.addItem(Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "SysSchemaUId", this.get("UId")));
					deleteQuery.execute(function(response) {
						if (this.get("AddToRunButton")) {
							var insert = Ext.create("Terrasoft.InsertQuery", {
								rootSchemaName: entitySchemaName
							});
							insert.setParameterValue("Id", Terrasoft.utils.generateGUID(),
								Terrasoft.DataValueType.GUID);
							insert.setParameterValue("SysSchemaUId", this.get("UId"), Terrasoft.DataValueType.GUID);
							insert.execute(function(response) {
								this.onUpdateRunButtonProcessList(response, callback);
							}, this);
							return;
						}
						this.onUpdateRunButtonProcessList(response, callback);
					}, this);
				},
				/**
				 * Обработчик сохранения изменений: списка отображаемых схем бизнес-процессов
				 * в пунктах меню кнопки "Запустить процесс"
				 * @private
				 */
				onUpdateRunButtonProcessList: function(response, callback) {
					if (response && response.success) {
						this.sandbox.publish("ResetStartProcessMenuItems");
						if (callback) {
							callback.call(this);
						}
					}
				}
			},
			rules: {},
			userCode: {}
		};
	});
