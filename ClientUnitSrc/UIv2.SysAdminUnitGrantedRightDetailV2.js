define("SysAdminUnitGrantedRightDetailV2", [],
	function() {
		return {
			entitySchemaName: "SysAdminUnitGrantedRight",
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"rowDataItemMarkerColumnName": "GranteeSysAdminUnit"
					}
				},
				{
					"operation": "merge",
					"name": "AddRecordButton",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddButtonCaption"}
					},
					"index": 0
				},
				{
					"operation": "insert",
					"name": "GetRightsButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "getRights"},
						"visible": {"bindTo": "getAddRecordButtonVisible"},
						"enabled": {"bindTo": "getAddRecordButtonEnabled"},
						"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"caption": {"bindTo": "Resources.Strings.GetRightsButtonCaption"}
					},
					"index": 1
				},
				{
					"operation": "merge",
					"name": "ToolsButton",
					"index": 2,
					"values": {
					}
				}
			]/**SCHEMA_DIFF*/,
			messages: {

				/**
				 * Сообщает разделу о необходимости вывода сообщения об актуализации ролей.
				 */
				"NeedActualizeRoles": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			methods: {

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#onDeleted
				 * @overridden
				 */
				onDeleted: function(result) {
					this.callParent(arguments);
					this.publishNeedActualizeRolesMessage();
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getCopyRecordMenuItem
				 * @overridden
				 */
				getCopyRecordMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getEditRecordMenuItem
				 * @overridden
				 */
				getEditRecordMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addDetailWizardMenuItems
				 * @overridden
				 */
				addDetailWizardMenuItems: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getSwitchGridModeMenuItem
				 * @overridden
				 */
				getSwitchGridModeMenuItem: this.Terrasoft.emptyFn,

				/**
				 * Открывает справочник объектов администрирования.
				 * @protected
				 * @param {Boolean} isDelegate Флаг, указывающий направление делегирования прав. Если true, то текущий
				 * пользователь делегирует права выбираемым элементам из справочника. Если false, то текущему
				 * пользователю делегируются права от выбираемых элементов.
				 */
				openUsersLookup: function(isDelegate) {
					var config = this.prepareLookupConfig(isDelegate);
					this.openLookup(config, this.addCallback.bind(this, isDelegate), this);
				},

				/**
				 * Вызывает onInsertSysAdminUnitGrantedRightComplete.
				 * @virtual
				 * @param {Boolean} isDelegate Флаг, указывающий направление делегирования прав. Если true, то текущий
				 * пользователь делегирует права выбираемым элементам из справочника. Если false, то текущему
				 * пользователю делегируются права от выбираемых элементов.
				 * @param {Object} args Объект, содержащий коллекцию выбранных записей.
				 */
				addCallback: function(isDelegate, args) {
					this.onInsertSysAdminUnitGrantedRight(isDelegate, args, this.get("MasterRecordId"));
				},

				/**
				 * Callback-функция, которые вызывается после добавления пользователя.
				 * @protected
				 * @param {Boolean} isDelegate Флаг, указывающий направление делегирования прав. Если true, то текущий
				 * пользователь делегирует права выбираемым элементам из справочника. Если false, то текущему
				 * пользователю делегируются права от выбираемых элементов.
				 * @param {Object} args Объект, содержащий коллекцию выбранных записей.
				 */
				onInsertSysAdminUnitGrantedRight: function(isDelegate, args) {
					var selectedIds = args.selectedRows.getKeys();
					var dataSend = {
						masterRecordId: this.get("MasterRecordId"),
						selectedRecords: this.Ext.JSON.encode(selectedIds)
					};
					var config = {
						serviceName: "AdministrationService",
						methodName: isDelegate
							? "AddSysAdminUnitGrantedRights"
							: "AddSysAdminUnitGrantedRightsFromSelectedRecords",
						data: dataSend
					};
					this.callService(config, function(response) {
						if (response && !this.Ext.isEmpty(response.errorMessage)) {
							this.showInformationDialog(response.errorMessage);
						}
						this.onInsertCompleted();
					});
				},

				/**
				 * Формирует фильтры, котрые исключают повторение существующих записей в детали.
				 * @private
				 * @param {Boolean} isDelegate Флаг, указывающий направление делегирования прав. Если true, то текущий
				 * пользователь делегирует права выбираемым элементам из справочника. Если false, то текущему
				 * пользователю делегируются права от выбираемых элементов.
				 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
				 */
				getLookupFilter: function(isDelegate) {
					var filters = this.Terrasoft.createFilterGroup();
					var parentFilter =  this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL,
						isDelegate ? "GrantorSysAdminUnit.Id" : "GranteeSysAdminUnit.Id",
						this.get("MasterRecordId"));
					var sameIdFilter =  this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.NOT_EQUAL,
						"Id",
						this.get("MasterRecordId"));

					var notExistsFilter = this.Terrasoft.createNotExistsFilter(
						this.Ext.String.format("[SysAdminUnitGrantedRight:{0}:Id].Id", isDelegate
							? "GranteeSysAdminUnit"
							: "GrantorSysAdminUnit"));
					notExistsFilter.subFilters.addItem(parentFilter);
					filters.addItem(notExistsFilter);
					filters.addItem(sameIdFilter);
					return filters;
				},

				/**
				 * Подготовка параметров для открытия окна выбора из пользователей.
				 * @return {Object} Config настроек окна выбора из справочника.
				 */
				prepareLookupConfig: function() {
					var filters = this.getLookupFilter();
					var config = {
						entitySchemaName: "SysAdminUnit",
						multiSelect: true,
						columns: ["Contact", "Name"],
						hideActions: true,
						filters: filters
					};
					return config;
				},

				/**
				 * Обработчик нажатия на кнопку Делегировать права.
				 * @inheritdoc BaseGridDetailV2#addRecord
				 * @overridden
				 */
				addRecord: function() {
					this.openUsersLookup(true);
				},

				/**
				 * Обработчик нажатия на кнопку Получить права.
				 * @protected
				 */
				getRights: function() {
					this.openUsersLookup(false);
				},

				/**
				 * @inheritdoc BaseGridDetailV2#getAddRecordButtonVisible
				 * @overridden
				 */
				getAddRecordButtonVisible: function() {
					return true;
				},

				/**
				 * Публикует сообщение о необходимости выполнить актуализацию ролей.
				 */
				publishNeedActualizeRolesMessage: function() {
					this.sandbox.publish("NeedActualizeRoles");
				},

				/**
				 * Загрузка добавленных пользователей в реестр.
				 * @private
				 */
				onInsertCompleted: function() {
					this.publishNeedActualizeRolesMessage();
					this.hideBodyMask();
					this.reloadGridData();
				}
			}
		};
	});