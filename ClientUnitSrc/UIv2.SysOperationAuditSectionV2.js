define("SysOperationAuditSectionV2", ["BaseFiltersGenerateModule", "SysOperationAudit", "SysOperationAuditArch",
	"RightUtilities"],
function(BaseFiltersGenerateModule, SysOperationAudit, SysOperationAuditArch, RightUtilities) {
	return {
		entitySchemaName: "SysOperationAudit",
		attributes: {
			/**
			 * Колекция архива журнала
			 */
			"GridDataArchCollection": {
				dataValueType: Terrasoft.DataValueType.COLLECTION,
				value: this.Ext.create("Terrasoft.BaseViewModelCollection")
			}
		},
		methods: {
			/**
			 * Инициализирует настройки фиксированных фильтров
			 * @overridden
			 */
			initFixedFiltersConfig: function() {
				var fixedFilterConfig = {
					entitySchema: SysOperationAudit,
					filters: [
						{
							name: "PeriodFilter",
							caption: this.get("Resources.Strings.PeriodFilterCaption"),
							dataValueType: this.Terrasoft.DataValueType.DATE,
							columnName: "Date",
							startDate: {},
							dueDate: {}
						},
						{
							name: "Owner",
							caption: this.get("Resources.Strings.OwnerFilterCaption"),
							dataValueType: Terrasoft.DataValueType.LOOKUP,
							filter: BaseFiltersGenerateModule.OwnerFilter,
							columnName: "Owner"
						}
					]
				};
				this.set("FixedFilterConfig", fixedFilterConfig);
			},

			/**
			 * Возвращает заголовок Журнала аудита
			 * @overridden
			 * @return {string} Возвращает заголовок
			 */
			getDefaultGridDataViewCaption: function() {
				return this.isAuditArchiveView()
					? this.get("Resources.Strings.ArchiveSectionViewCaption")
					: this.get("Resources.Strings.AuditSectionViewCaption");
			},

			/**
			 * Возвращает заголовок Архива журнала
			 * @protected
			 * @return {string} Возвращает заголовок
			 */
			getSysOperationAuditArchViewCaption: function() {
				return this.get("Resources.Strings.ArchiveSectionViewCaption");
			},

			/**
			 * Возвращает иконку Архива журнала
			 * @protected
			 * @return {String}
			 */
			getSysOperationAuditArchViewIcon: function() {
				return this.get("Resources.Images.SysOperationAuditArchViewIcon");
			},

			/**
			 * Выполняет загрузку представления списка Архива журнала
			 * @protected
			 */
			loadSysOperationAuditArchView: function(loadData) {
				this.loadGridDataView(loadData);
			},

			/**
			 * Загружает данные в реестр текущего представления.
			 * @overridden
			 */
			loadActiveViewData: function() {
				this.loadGridData();
			},

			/**
			 * Получает представления по умолчанию
			 * @overridden
			 * @return {Object} Возвращает объект представления
			 */
			getDefaultDataViews: function() {
				var gridDataView = {
					name: "GridDataView",
					active: true,
					caption: this.getDefaultGridDataViewCaption(),
					icon: this.getDefaultGridDataViewIcon()
				};
				var sysOperationAuditArchView = {
					name: "SysOperationAuditArchView",
					active: false,
					caption: this.getSysOperationAuditArchViewCaption(),
					icon: this.getSysOperationAuditArchViewIcon()
				};
				return {
					"GridDataView": gridDataView,
					"SysOperationAuditArchView": sysOperationAuditArchView
				};
			},

			/**
			 * Возвращает коллекцию действий раздела в режиме отображения реестра
			 * @protected
			 * @overridden
			 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий раздела в режиме
			 * отображения реестра
			 */
			getSectionActions: function() {
				var actionMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
				actionMenuItems.addItem(this.getActionsMenuItem({
					Type: "Terrasoft.MenuSeparator",
					Caption: ""
				}));
				actionMenuItems.addItem(this.getActionsMenuItem({
					Caption: {bindTo: "Resources.Strings.ArchivingAuditActionCaption"},
					Click: {bindTo: "processMoveAuditToArchive"},
					Visible: {bindTo: "isAuditView"},
					Enabled: {bindTo: "canManageSysAuditOperationsSection"}
				}));
				return actionMenuItems;
			},

			/**
			 * Выводит сообщение для подтверждения Архивации журнала
			 * @protected
			 */
			processMoveAuditToArchive: function() {
				this.showConfirmationDialog(this.get("Resources.Strings.MovingToArchiveActionConfirmMessage"),
						this.doMoveAuditToArchive, ["yes", "no"]);
			},

			/**
			 * Загружает модуль Архивации журнала
			 * @protected
			 * @param {Boolean} result результат подтверждения Архивации журнала
			 */
			doMoveAuditToArchive: function(result) {
				if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
					this.sandbox.publish("PushHistoryState", {
						hash: "SysOperationAuditMovingToArchiveModule/"
					});
				} else {
					return;
				}
			},

			/**
			 * @overridden
			 */
			init: function() {
				this.initCanManageSysOperationAudit();
				this.callParent(arguments);
			},

			/**
			 * Получает права доступа для выполнения операции Архивировать журнал
			 * @protected
			 */
			initCanManageSysOperationAudit: function() {
				RightUtilities.checkCanExecuteOperation({
					operation: "CanManageSysOperationAudit"
				}, function(result) {
					this.set("canManageSysAuditOperationsSection", result);
				}, this);
			},

			/**
			 * @overridden
			 */
			initActionsButtonHeaderMenuItemCaption: function() {
			},

			/**
			 * Инициализирует контекстную справку
			 * @overridden
			 */
			initContextHelp: function() {
				this.set("ContextHelpId", 1260);
				this.callParent(arguments);
			},

			/**
			 * Получает коллекцию строк реестра относительно активного представления
			 * @overridden
			 * @return {Terrasoft.Collection} Возвращает колекцию
			 */

			getGridData: function() {
				return this.isAuditArchiveView()
							? this.get("GridDataArchCollection")
							: this.get("GridData");
			},

			/**
			 * Изменяет активное предсталение.
			 * Если карточка открыта - закрывает, если раздел закрыт - открывает.
			 * Актуализирует отображение представлений в шапке приложения
			 * @param {String} viewConfig Название представления
			 */
			changeDataView: function(viewConfig) {
				var viewName = (typeof viewConfig === "string") ? viewConfig : viewConfig.tag;
				if (viewName === this.getActiveViewName()) {
					return;
				}
				if (!this.isAuditArchiveView()) {
					this.entitySchema = SysOperationAuditArch;
					this.set("SeparateModeActionsButtonVisible", false);
				} else {
					this.entitySchema = SysOperationAudit;
					this.set("SeparateModeActionsButtonVisible", true);
				}
				if (this.get("IsCardVisible")) {
					this.closeCard();
				}
				if (!this.get("IsSectionVisible")) {
					this.showSection();
				}
				this.setActiveView(viewName, true);
				var headerCaption = (this.isAuditArchiveView())
					? this.getSysOperationAuditArchViewCaption()
					: this.getDefaultGridDataViewCaption();
				this.sandbox.publish("ChangeHeaderCaption", {
					caption: headerCaption,
					dataViews: this.get("DataViews"),
					moduleName: this.name
				});
				this.loadSummary();
			},

			/**
			 * Получает признак активности представления "Архив журнала"
			 * @protected
			 * @return {Boolean} Возвращает признак
			 */
			isAuditArchiveView: function() {
				return (this.get("ActiveViewName") === "SysOperationAuditArchView");
			},

			/**
			 * Получает признак активности представления "Журнала аудита"
			 * @protected
			 * @return {Boolean} Возвращает признак
			 */
			isAuditView: function() {
				return (this.get("ActiveViewName") === "GridDataView");
			}
		},
		diff: /**SCHEMA_DIFF*/[
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
				"name": "DataGridActiveRowOpenAction",
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
				"operation": "insert",
				"name": "SysOperationAuditArchView",
				"parentName": "DataViewsContainer",
				"propertyName": "items",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.SECTION_VIEW,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "SysOperationAuditArchContainer",
				"parentName": "SysOperationAuditArchView",
				"propertyName": "items",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "DataGrid",
				"parentName": "SysOperationAuditArchContainer",
				"propertyName": "items",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.GRID,
					"type": { "bindTo": "GridType" },
					"collection": { "bindTo": "GridDataArchCollection" },
					"isEmpty": {"bindTo": "IsGridEmpty"},
					"getEmptyMessageConfig": {"bindTo": "prepareEmptyGridMessageConfig"}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});