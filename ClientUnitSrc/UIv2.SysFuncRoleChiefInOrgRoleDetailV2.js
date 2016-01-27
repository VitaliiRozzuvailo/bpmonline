define("SysFuncRoleChiefInOrgRoleDetailV2", ["terrasoft", "SysFuncRoleChiefInOrgRoleDetailV2Resources",
		"ConfigurationConstants", "ConfigurationEnums"],
	function(Terrasoft, resources, ConfigurationConstants, enums) {
		return {
			messages: {
				/**
				 * Сообщает разделу о необходимости вывода сообщения об актуализации ролей.
				 */
				"NeedActualizeRoles": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			entitySchemaName: "SysFuncRoleInOrgRole",
			diff: /**SCHEMA_DIFF*/[
			]/**SCHEMA_DIFF*/,
			methods: {
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
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getSwitchGridModeMenuItem
				 * @overridden
				 */
				getSwitchGridModeMenuItem: this.Terrasoft.emptyFn,

				/**
				 * Возможность добавления записи зависит от наличия орг. роли руководителя для текущей роли.
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getAddRecordButtonEnabled
				 * @overridden
				 */

				/**
				 * Публикует сообщение о необходимости выполнить актуализацию ролей.
				 */
				publishNeedActualizeRolesMessage: function() {
					this.sandbox.publish("NeedActualizeRoles");
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#onDeleted
				 * @overridden
				 */
				onDeleted: function() {
					this.callParent(arguments);
					this.publishNeedActualizeRolesMessage();
				},

				getAddRecordButtonEnabled: function() {
					return this.get("IsChiefRoleExists");
				},

				/**
				 * @inheritdoc GridUtilitiesV2#getGridDataColumns
				 * @overridden
				 * @return {Object} Возвращает массив объектов-конфигураций колонок.
				 */
				getGridDataColumns: function() {
					var config = this.callParent(arguments);
					config["OrgRole.Id"] = { path: "OrgRole.Id"};
					config["OrgRole.Name"] = { path: "OrgRole.Name"};
					config["FuncRole.Name"] = { path: "FuncRole.Name" };
					return config;
				},

				/**
				 * @protected
				 * @inheritdoc GridUtilitiesV2#loadGridData
				 * @overridden
				 */
				loadGridData: function() {
					if (this.get("ChiefOrgRoleIdLoaded")) {
						this.callParent(arguments);
						this.set("ChiefOrgRoleIdLoaded", false);
						return;
					}
					this.getChiefOrgRoleId(this.loadGridData);
				},

				/**
				 * @protected
				 * @inheritdoc BaseGridDetailV2#getFilters
				 * @overridden
				 * @return {Terrasoft.FilterGroup} Группа фильтров filters.
				 **/
				getFilters: function() {
					var filters = this.Ext.create("Terrasoft.FilterGroup");
					filters.addItem(this.Terrasoft.createColumnInFilterWithParameters(
						"OrgRole.Id", [this.get("ChiefOrgRoleId")]));
					return filters;
				},

				/**
				 * Выполняет запрос, который возвращает идентификатор организационной роли руководителей
				 * для выбранной организационной роли.
				 * @protected
				 * @param {Function} callback Функция обратного вызова, которая вызывается после того, как получен идентификатор.
				 */
				getChiefOrgRoleId: function(callback) {
					var parentId = this.get("MasterRecordId");
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SysAdminUnit"
					});
					esq.addColumn("Id");
					esq.filters.addItem(this.Terrasoft.createColumnInFilterWithParameters(
						"ParentRole.Id", [parentId]));
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "SysAdminUnitTypeValue",
						ConfigurationConstants.SysAdminUnit.Type.Manager));

					esq.getEntityCollection(function(response) {
						if (response && response.success) {
							var collection = response.collection;
							if (collection.getCount() > 0) {
								var chiefOrgRoleId = collection.getByIndex(0).get("Id");
								var defaultValue = {
									name: "OrgRole",
									value: chiefOrgRoleId
								};
								this.set("DefaultValues", [defaultValue]);
								this.set("ChiefOrgRoleId", chiefOrgRoleId);
								this.set("ChiefOrgRoleIdLoaded", true);
								if (this.Ext.isFunction(callback)) {
									callback.call(this);
								}
								this.set("IsChiefRoleExists", true);
							} else {
								this.set("IsChiefRoleExists", false);
								var gridData = this.getGridData();
								if (gridData.getCount() > 0) {
									gridData.clear();
								}
								this.set("LastRecord", null);
								this.set("IsGridEmpty", true);
							}
						}
					}, this);
				},

				/**
				 * @inheritdoc GridUtilitiesV2#createViewModel
				 * @overridden
				 */
				createViewModel: function(config) {
					this.callParent(arguments);
					var dataMarkerColumnName = "FuncRole";
					if (this.isOrgRolesDetail()) {
						dataMarkerColumnName = "OrgRole";
					}
					config.viewModel.primaryDisplayColumnName = dataMarkerColumnName;
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
				 * Формирует фильтры, для отображения ролей.
				 * @private
				 * @return {Terrasoft.data.filters.FilterGroup} Возвращает группу фильтров.
				 */
				getRoleLookupFilter: function() {
					var filters = this.Terrasoft.createFilterGroup();
					var typeFilter = this.Terrasoft.createColumnInFilterWithParameters("SysAdminUnitTypeValue",
							this.getFilterRoleType());
					var notExistsFilter = this.Terrasoft.createNotExistsFilter(
						"[SysFuncRoleInOrgRole:FuncRole:Id].Id");
					var subFilter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL,
						"OrgRole",
						this.get("ChiefOrgRoleId"));
					notExistsFilter.subFilters.addItem(subFilter);
					filters.addItem(notExistsFilter);
					filters.addItem(typeFilter);
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
				 * Возвращает признак отображения детали "Организационные роли".
				 * @private
				 * @return {Boolean} Возвращает признак отображения детали "Организационные роли".
				 */
				isOrgRolesDetail: function() {
					var detailColumnName = this.get("DetailColumnName");
					return (detailColumnName && detailColumnName === "FuncRole");
				},

				/**
				 * Возвращает список типов для фильтра лукапа.
				 * @private
				 * @return {Array} Массив типов.
				 */
				getFilterRoleType: function() {
					if (this.isOrgRolesDetail()) {
						return [
							ConfigurationConstants.SysAdminUnit.Type.Organisation,
							ConfigurationConstants.SysAdminUnit.Type.Department,
							ConfigurationConstants.SysAdminUnit.Type.Manager,
							ConfigurationConstants.SysAdminUnit.Type.Team
						];
					}
					return [ConfigurationConstants.SysAdminUnit.Type.FuncRole];
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
				 * Callback-функция, которая вызывается после закрытия окна выбора из справочника пользователей.
				 * @virtual
				 * @param {Object} args Объект, содержащий коллекцию выбранных записей.
				 */
				addCallback: function(args) {
					var dataSend = {
						orgRoleId: this.get("ChiefOrgRoleId"),
						funcRoleIds: this.Ext.encode(args.selectedRows.getKeys())
					};
					var config = {
						serviceName: "AdministrationService",
						methodName: "AddFuncRolesInOrgRole",
						data: dataSend
					};
					this.showBodyMask();
					this.callService(config, function(response) {
						response.message = response.AddFuncRolesInOrgRoleResult;
						response.success = this.Ext.isEmpty(response.message);
						if (this.validateResponse(response)) {
							this.hideBodyMask();
							this.reloadGridData();
							this.publishNeedActualizeRolesMessage();
						}
					}, this);
				}
			}
		};
	});