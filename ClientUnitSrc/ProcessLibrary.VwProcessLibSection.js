define("VwProcessLibSection", ["ProcessModuleUtilities", "ProcessLibraryConstants", "ConfigurationEnums",
		"VwProcessLibSectionGridRowViewModel"],
		function(ProcessModuleUtilities, ProcessLibraryConstants, ConfigurationEnums) {
			return {
				entitySchemaName: "VwProcessLib",
				attributes: {
					/**
					 * Название операции доступ на которую должен быть у пользователя для использования раздела
					 */
					SecurityOperationName: {
						dataValueType: Terrasoft.DataValueType.STRING,
						value: "CanManageProcessDesign"
					}
				},
				diff: /**SCHEMA_DIFF*/[
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
						"name": "DataGridActiveRowOpenAction",
						"values": {
							"caption": {"bindTo": "getCaptionDataGridActiveRowOpenAction"}
						}
					},
					{
						"operation": "insert",
						"name": "DataGridActiveRowRunProcess",
						"parentName": "DataGrid",
						"propertyName": "activeRowActions",
						"values": {
							"className": "Terrasoft.Button",
							"visible": {"bindTo": "getIsVisibleRunProcessButton"},
							"style": Terrasoft.controls.ButtonEnums.style.GREY,
							"caption": {"bindTo": "Resources.Strings.RunProcessButtonCaption"},
							"tag": "executeProcess"
						}
					},
					{
						"operation": "insert",
						"name": "DataGridActiveRowOpenProcessProperties",
						"parentName": "DataGrid",
						"propertyName": "activeRowActions",
						"values": {
							"className": "Terrasoft.Button",
							"visible": {"bindTo": "getIsVisibleOpenProcessPropertiesButton"},
							"style": Terrasoft.controls.ButtonEnums.style.GREY,
							"caption": {"bindTo": "Resources.Strings.ProcessPropertiesButtonCaption"},
							"tag": "openProcessProperties"
						}
					},
					{
						"operation": "insert",
						"name": "DataGridActiveRowOpenProcessDesigner",
						"parentName": "DataGrid",
						"propertyName": "activeRowActions",
						"values": {
							"className": "Terrasoft.Button",
							"visible": {"bindTo": "getIsVisibleProcessDesignerButton"},
							"style": Terrasoft.controls.ButtonEnums.style.GREY,
							"caption": {
								"bindTo": "Resources.Strings.ProcessDesignerButtonCaption"
							},
							"tag": "openProcessDesigner"
						}
					},
					{
						"operation": "merge",
						"name": "SeparateModeAddRecordButton",
						"values": {
							"caption": {"bindTo": "Resources.Strings.AddQuickModelProcessButtonCaption"},
							"controlConfig": null,
							"click": {"bindTo": "addQuickModelRecord"}
						}
					},
					{
						"operation": "insert",
						"name": "SeparateModeAddBusinessModelRecordButton",
						"parentName": "SeparateModeActionButtonsLeftContainer",
						"propertyName": "items",
						"index": 2,
						"values": {
							"itemType": Terrasoft.ViewItemType.BUTTON,
							"caption": {"bindTo": "Resources.Strings.AddBusinessProcessButtonCaption"},
							"click": {"bindTo": "addProcessRecord"},
							"classes": {
								"textClass": ["actions-button-margin-right"],
								"wrapperClass": ["actions-button-margin-right"]
							}
						}
					},
					{
						"operation": "insert",
						"name": "CombinedModeOpenProcessDesignerButton",
						"parentName": "CombinedModeActionButtonsCardLeftContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.BUTTON,
							"caption": {"bindTo": "Resources.Strings.OpenInDesignerButtonCaption"},
							"click": {"bindTo": "onCardAction"},
							"style": Terrasoft.controls.ButtonEnums.style.BLUE,
							"classes": {"textClass": ["actions-button-margin-right"]},
							"tag": "show5xProcessSchemaDesigner"
						}
					},
					{
						"operation": "merge",
						"name": "CombinedModeViewOptionsButton",
						"values": {
							"visible": {"bindTo": "IsSectionVisible"}
						}
					}
				]/**SCHEMA_DIFF*/,
				messages: {
					/**
					 * @message GetIsVisibleCancelRunningProcessesAction
					 * Определяет видимость действия "Отменить запущенные процессы".
					 * @param {Object} Значение свойства, которые отвечают за видимость действия.
					 */
					"GetIsVisibleCancelRunningProcessesAction": {
						mode: this.Terrasoft.MessageMode.PTP,
						direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
					},
					/**
					 * @message SectionVisibleChanged
					 * Сигнализирует об изменении видимости вертикального реестра раздела.
					 */
					"SectionVisibleChanged": {
						mode: this.Terrasoft.MessageMode.BROADCAST,
						direction: this.Terrasoft.MessageDirectionType.PUBLISH
					}
				},
				methods: {
					/**
					 * @overridden
					 */
					init: function() {
						this.registerGetIsVisibleCancelRunningProcessesActionHandler();
						this.callParent(arguments);
						this.set("IsSubscribed", false);
						this.set("UseTagModule", false);
						this.set("UseStaticFolders", true);
						this.set("TagButtonVisible", false);
					},
					/**
					 * @overridden
					 */
					getFilters: function() {
						var filters = this.callParent(arguments);
						var filterName = "WorkspaceFilter";
						if (filters.contains(filterName)) {
							return filters;
						}
						filters.add(filterName, Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "SysWorkspace",
							Terrasoft.SysValue.CURRENT_WORKSPACE.value));
						return filters;
					},
					/**
					 * Убирает пункт открытия Мастера раздела из меню кнопки "Вид".
					 * @overridden
					 */
					addSectionDesignerViewOptions: Terrasoft.emptyFn,
					/**
					 * Возвращает колонки, которые всегда выбираются запросом.
					 * @protected
					 * @overridden
					 * @return {Object} Возвращает массив объектов-конфигураций колонок.
					 */
					getGridDataColumns: function() {
						var gridDataColumns = this.callParent(arguments);
						if (!gridDataColumns.TagProperty) {
							gridDataColumns.TagProperty = {
								path: "TagProperty"
							};
						}
						return gridDataColumns;
					},
					/**
					 * @protected
					 * @overridden
					 */
					showSection: function() {
						this.callParent(arguments);
						this.sandbox.publish("SectionVisibleChanged");
					},
					/**
					 * @protected
					 * @overridden
					 */
					hideSection: function() {
						this.callParent(arguments);
						this.sandbox.publish("SectionVisibleChanged");
					},
					/**
					 * Регистрирует подписчика на сообщение GetIsVisibleCancelRunningProcessesAction.
					 * @protected
					 */
					registerGetIsVisibleCancelRunningProcessesActionHandler: function() {
						this.sandbox.subscribe("GetIsVisibleCancelRunningProcessesAction", function(config) {
							this.set(config.key, config.value);
						}, this);
					},
					/**
					 * Переопределены ресурсы для модели записи реестра
					 * Проверка отображения кнопок RowViewModel
					 * @overridden
					 */
					getGridRowViewModelClassName: function() {
						return "Terrasoft.VwProcessLibSectionGridRowViewModel";
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
					 * @overridden
					 * @param schemaName
					 * @param operation
					 * @param primaryColumnValue
					 * @param {Boolean} callParentFunction Признак указывает на необходимость вызова родительской функции
					 */
					openCard: function(schemaName, operation, primaryColumnValue, callParentFunction) {
						if ((operation !== ConfigurationEnums.CardStateV2.EDIT) || callParentFunction) {
							this.callParent(arguments);
							return;
						}
						var activeRow = this.findGridRow(primaryColumnValue);
						if (!activeRow) {
							this.callParent(arguments);
							return;
						}
						var isNotSeparateMode = !this.get("IsCardVisible");
						var typeColumnValue = this.getTypeColumnValue(activeRow);
						if (isNotSeparateMode &&
								typeColumnValue === ProcessLibraryConstants.VwProcessLib.Type.BusinessProcess) {
							ProcessModuleUtilities.show5xProcessSchemaDesigner(primaryColumnValue);
							return;
						}
						activeRow.loadEntity(primaryColumnValue, function() {
							var currentSchemaName = this.getEditPageSchemaName(typeColumnValue);
							this.openCard(currentSchemaName, operation, primaryColumnValue, true);
						}, this);
					},
					/*
					 * Выполняет поиск записи реестра по уникальному идентификатору
					 * @private
					 * @param {String} primaryColumnValue Уникальный идентификатор записи
					 * @returns {Terrasoft.VwProcessLibSectionGridRowViewModel} Объект записи реестра
					 */
					findGridRow: function(primaryColumnValue) {
						var gridData = this.getGridData();
						if (gridData.getCount() === 0) {
							return null;
						}
						return gridData.get(primaryColumnValue);
					},
					/**
					 * Добавлена возможность запустить бизнес-процесс по нажатию кнопки выделенной записи реестра
					 * @overridden
					 */
					onActiveRowAction: function(buttonTag, primaryColumnValue) {
						switch (buttonTag) {
							case "executeProcess":
								ProcessModuleUtilities.executeProcess({
									"sysProcessId": primaryColumnValue
								});
								break;
							case "openProcessProperties":
								this.openProcessProperties(primaryColumnValue);
								break;
							case "openProcessDesigner":
								this.openProcessDesigner(primaryColumnValue);
								break;
							default:
								this.callParent(arguments);
								break;
						}
					},
					/**
					 * Инициализирует значения настроек контекстной справки.
					 * @overridden
					 */
					initContextHelp: function() {
						this.set("ContextHelpId", 7000);
						this.callParent(arguments);
					},
					/**
					 * @overridden
					 * @return {Object} Представления раздела по умолчанию.
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
					 * Открывает страницу Мастера процессов
					 * @private
					 */
					addQuickModelRecord: function() {
						this.addRecord(ProcessLibraryConstants.VwProcessLib.Type.QuickModel);
					},
					/**
					 * Открывает страницу Дизайнера процессов
					 * @private
					 */
					addProcessRecord: function() {
						this.addRecord(ProcessLibraryConstants.VwProcessLib.Type.BusinessProcess);
					},
					/**
					 * Открывает страницу Мастера процессов
					 * @overridden
					 */
					addRecord: function(typeColumnValue) {
						if (typeColumnValue === ProcessLibraryConstants.VwProcessLib.Type.BusinessProcess) {
							if (ProcessModuleUtilities.getIsDemoMode(this)) {
								return false;
							}
							ProcessModuleUtilities.show5xProcessSchemaDesigner();
						} else {
							return this.callParent(arguments);
						}
					},
					/**
					 * Открывает дизайнер процессов 5.x
					 * @protected
					 */
					show5xProcessSchemaDesigner: function() {
						if (ProcessModuleUtilities.getIsDemoMode(this)) {
							return;
						}
						var schemaUId = null;
						var records = this.getSelectedItems();
						if (records && records.length > 0) {
							schemaUId = records[0];
						}
						ProcessModuleUtilities.show5xProcessSchemaDesigner(schemaUId);
					},
					/**
					 * Запускает на выполнение бизнес-процесс
					 * @private
					 */
					executeProcess: function() {
						var selectedItems = this.getSelectedItems();
						if (!selectedItems || selectedItems.length === 0) {
							return;
						}
						ProcessModuleUtilities.executeProcess({
							"sysProcessId": selectedItems[0]
						});
					},
					/**
					 * Позволяет выполнить публикацию схем
					 * @private
					 */
					publish: function() {
						if (ProcessModuleUtilities.getIsDemoMode(this)) {
							return;
						}
						ProcessModuleUtilities.publish();
					},
					/**
					 * Открывает страницу редактирования QuickModel схемы
					 * @private
					 */
					openQuickModelPage: function() {
						var selectedItems = this.getSelectedItems();
						if (!selectedItems || selectedItems.length === 0) {
							return;
						}
						this.editRecord(selectedItems[0]);
					},
					/**
					 * Возвращает выделенную строку таблицы
					 * @private
					 * @returns {Object}
					 */
					findFirstSelectedItem: function() {
						if (this.get("isMultiSelectVisible")) {
							return null;
						}
						this.get("GridSettingsChanged");
						var selectedItems = this.getSelectedItems();
						var gridData = this.getGridData();
						if (Ext.isEmpty(selectedItems) || selectedItems.length !== 1 ||
								gridData.isEmpty() || !gridData.contains(selectedItems[0])) {
							return null;
						}
						return gridData.get(selectedItems[0]);
					},
					/**
					 * Возвращает признак отображения пункта меню "Запустить процесс"
					 * @private
					 * @returns {Boolean}
					 */
					getIsVisibleRunProcessAction: function() {
						var selectedItem = this.findFirstSelectedItem();
						if (selectedItem == null) {
							return false;
						}
						return selectedItem.get("TagProperty") === ProcessLibraryConstants.VwProcessLib.BusinessProcessTag;
					},
					/**
					 * Возвращает признак отображения пунктов меню Мастера процессов
					 * @private
					 * @returns {Boolean}
					 */
					getIsVisibleQuickModelActions: function() {
						var selectedItem = this.findFirstSelectedItem();
						if (selectedItem == null) {
							return false;
						}
						var processSchemaType = selectedItem.get("ProcessSchemaType");
						return processSchemaType &&
								processSchemaType.value === ProcessLibraryConstants.VwProcessLib.Type.QuickModel;
					},
					/**
					 * Возвращает признак отображения пункта меню "Отменить запущенные процессы"
					 * @private
					 * @returns {Boolean}
					 */
					getIsVisibleCancelRunningProcessesAction: function() {
						return this.getIsVisibleQuickModelActions();
					},
					/**
					 * @overridden
					 */
					getSectionActions: function() {
						var actionMenuItems = this.callParent(arguments);
						actionMenuItems.each(function(item) {
							if (item.values.Caption &&
									item.values.Caption.bindTo === "Resources.Strings.DeleteRecordButtonCaption") {
								item.values.Visible = false;
								return false;
							}
						}, this);
						actionMenuItems.addItem(this.getButtonMenuItem({
							"Type": "Terrasoft.MenuSeparator",
							"Caption": ""
						}));
						actionMenuItems.addItem(this.getButtonMenuItem({
							"Caption": {"bindTo": "Resources.Strings.RunProcessButtonCaption"},
							"Tag": "executeProcess",
							"Visible": {"bindTo": "getIsVisibleRunProcessAction"},
							"Enabled": {"bindTo": "isAnySelected"},
							"Click": {"bindTo": "executeProcess"}
						}));
						actionMenuItems.addItem(this.getButtonMenuItem({
							"Caption": {"bindTo": "Resources.Strings.Show5xProcessSchemaDesignerCaption"},
							"Click": {"bindTo": "show5xProcessSchemaDesigner"},
							"Enabled": {"bindTo": "isAnySelected"},
							"Visible": {"bindTo": "isMultiSelectVisible"}
						}));
						actionMenuItems.addItem(this.getButtonMenuItem({
							"Caption": {"bindTo": "Resources.Strings.PublishProcessActionCaption"},
							"Tag": "publish",
							"Visible": {"bindTo": "isMultiSelectVisible"},
							"Enabled": {"bindTo": "isAnySelected"},
							"Click": {"bindTo": "publish"}
						}));
						return actionMenuItems;
					},
					/*
					 * Открывает окно свойств бизнес-процесса
					 * @private
					 * @param {String} primaryColumnValue Уникальный идентификатор записи
					 */
					openProcessProperties: function(primaryColumnValue) {
						var gridRow = this.findGridRow(primaryColumnValue);
						gridRow.loadEntity(primaryColumnValue, function() {
							var typeColumnValue = this.getTypeColumnValue(gridRow);
							var currentSchemaName = this.getEditPageSchemaName(typeColumnValue);
							var operation = ConfigurationEnums.CardStateV2.EDIT;
							this.openCard(currentSchemaName, operation, primaryColumnValue, true);
						}, this);
					},
					/*
					 *
					 * @private
					 * @param {String} primaryColumnValue Уникальный идентификатор записи
					 */
					openProcessDesigner: function(primaryColumnValue) {
						window.open("./SchemaDesigner.aspx#process/" + primaryColumnValue);
					},
					/**
					 * Добавлен признак, указывающий на клик по ссылке
					 * @overridden
					 * @param {String} primaryColumnValue Уникальный идентификатор записи
					 * @param {Boolean} islinkClicked Признак, указывающий на клик по ссылке
					 */
					editRecord: function(primaryColumnValue, islinkClicked) {
						if (islinkClicked) {
							this.set("ActiveRow", primaryColumnValue);
							this.openProcessProperties(primaryColumnValue);
							return;
						}
						this.callParent(arguments);
					}
				}
			};
		});
