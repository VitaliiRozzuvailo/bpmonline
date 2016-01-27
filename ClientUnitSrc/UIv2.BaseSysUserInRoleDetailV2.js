define("BaseSysUserInRoleDetailV2", [
		"terrasoft", "ConfigurationConstants", "ConfigurationEnums",
		"PortalRoleFilterUtilities"
	],
	function(Terrasoft, ConfigurationConstants, enums, PortalRoleFilterUtilities) {
		return {
			entitySchemaName: "SysUserInRole",
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"rowDataItemMarkerColumnName": "SysRole"
					}
				}
			]/**SCHEMA_DIFF*/,
			methods: {
				/**
				 * Выполняет проверку ответа сервера.
				 * @protected
				 * @virtual
				 * @param {Object} response ответ сервиса AdministrationService.
				 */
				validateResponse: function(response) {
					var isSuccess = response && response.success;
					if (!isSuccess) {
						this.hideBodyMask();
						var errorMessage = response.message;
						if (errorMessage) {
							this.showInformationDialog(errorMessage);
						}
					}
					return isSuccess;
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addDetailWizardMenuItems
				 * @overridden
				 */
				addDetailWizardMenuItems: this.Terrasoft.emptyFn,

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
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getFilters
				 * @overridden
				 */
				getFilters: function() {
					var filters = this.Ext.create("Terrasoft.FilterGroup");
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL,
						"SysUser",
						this.get("MasterRecordId")));
					return filters;
				},

				/**
				 * Возвращает config для lookupPage.
				 * @private
				 * @return {Object} config для lookupPage.
				 */
				getLookupPageConfig: function() {
					var filters = this.Terrasoft.createFilterGroup();
					filters.addItem(this.getRoleLookupFilter());
					var config = {
						entitySchemaName: "SysAdminUnit",
						multiSelect: true,
						columns: ["Name"],
						filters: filters,
						hideActions: true
					};
					return config;
				},

				/**
				 * Возвращает список типов ролей для фильтрации.
				 * @private
				 * @return {Array} Возвращает список типов ролей.
				 */
				getSysAdminUnitTypeList: function() {
					return [];
				},

				/**
				 * Формирует фильтры для отображения ролей.
				 * @private
				 * @return {Terrasoft.data.filters.FilterGroup} Возвращает группу фильтров.
				 */
				getRoleLookupFilter: function() {
					var filters = this.Terrasoft.createFilterGroup();
					var notExistsFilter = this.Terrasoft.createNotExistsFilter(
						"[SysUserInRole:SysRole:Id].Id");
					var subFilter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL,
						"SysUser",
						this.get("MasterRecordId"));
					notExistsFilter.subFilters.addItem(subFilter);
					filters.addItem(notExistsFilter);
					var roles = this.getSysAdminUnitTypeList();
					filters.addItem(PortalRoleFilterUtilities.getSysAdminUnitFilterGroup(roles));
					return filters;
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addRecord
				 * @overridden
				 */
				addRecord: function() {
					var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
					var isNew = (cardState.state === enums.CardStateV2.ADD ||
						cardState.state === enums.CardStateV2.COPY);
					if (isNew) {
						var args = {
							isSilent: true,
							messageTags: [this.sandbox.id]
						};
						this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
						return;
					}
					var config = this.getLookupPageConfig();
					this.openLookup(config, this.addCallback, this);
				},

				/**
				 * @inheritDoc GridUtilitiesV2#onDeleteAccept
				 * @overridden
				 */
				onDeleteAccept: function() {
					this.showBodyMask();
					this.callService({
						serviceName: "AdministrationService",
						methodName: "RemoveUsersInRoles",
						data: {
							roleIds: "",
							userIds: "",
							recordIds: this.Ext.encode(this.getSelectedItems())
						}
					}, function(response) {
						var result = this.Ext.decode(response.RemoveUsersInRolesResult);
						var success = result.Success;
						var deletedItems = result.DeletedItems;
						this.removeGridRecords(deletedItems);
						this.hideBodyMask();
						if (!success) {
							this.showDeleteExceptionMessage(result);
						}
						this.onDeleted(result);
					}, this);
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#onCardSaved
				 * @overridden
				 */
				onCardSaved: function() {
					var config = this.getLookupPageConfig();
					this.openLookup(config, this.addCallback, this);
				},

				/**
				 * Callback-функция, которая вызывается после закрытия окна выбора из справочника пользователей.
				 * @virtual
				 * @param {Object} args Объект, содержащий коллекцию выбранных записей.
				 */
				addCallback: function(args) {
					var dataSend = {
						roleIds: this.Ext.encode(args.selectedRows.getKeys()),
						userId: this.get("MasterRecordId")
					};
					var config = {
						serviceName: "AdministrationService",
						methodName: "AddUserRoles",
						data: dataSend
					};
					this.showBodyMask();
					this.callService(config, function(response) {
						response.message = response.AddUserRolesResult;
						response.success = this.Ext.isEmpty(response.message);
						if (this.validateResponse(response)) {
							this.hideBodyMask();
							this.reloadGridData();
						}
					}, this);
				}
			}
		};
	});