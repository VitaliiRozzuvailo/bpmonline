define("ChiefsDetailV2", ["ConfigurationConstants"],
	function(ConfigurationConstants) {
		return {
			entitySchemaName: "VwSysAdminUnit",
			methods: {

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addDetailWizardMenuItems
				 * @overridden
				 */
				addDetailWizardMenuItems: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc UsersDetailV2#initData
				 * @overridden
				 */
				initData: function() {
					this.callParent(arguments);
					this.subscribeEvents();
				},

				/**
				 * Выполняет подписку на события для детали.
				 */
				subscribeEvents: function() {
					this.sandbox.subscribe("GetChiefId", function() {
						return {
							parent: this.get("ChiefRole"),
							defaultValues: this.get("DefaultValues")
						};
					}, this, [this.getUsersDetailSandboxId()]);
					this.sandbox.subscribe("UpdateChiefDetail", function() {
						this.loadGridData();
					}, this, [this.sandbox.id]);
				},

				/**
				 * @inheritdoc UsersDetailV2#getTargetRoleId
				 * @overridden
				 */
				getTargetRoleId: function() {
					return this.get("ChiefRole");
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getAddRecordButtonEnabled
				 * @overridden
				 */
				getAddRecordButtonEnabled: function() {
					return this.get("IsAddRecordEnabled");
				},

				/**
				 * @inheritdoc GridUtilitiesV2#loadGridData
				 * @overridden
				 */
				loadGridData: function() {
					var isEmpty = this.Ext.isEmpty(this.get("SelectedNodesPrimaryColumnValues"));
					if (isEmpty) {
						this.set("gridEmpty", isEmpty);
						this.getGridData().clear();
					}
					if (this.get("ServiceDataLoaded")) {
						if (!isEmpty) {
							this.callParent(arguments);
						}
						this.set("ServiceDataLoaded", false);
						return;
					}
					this.selectChiefUnits(this.loadGridData);
				},

				/**
				 * Метод выполняет запрос к базе, который возвращает идентификатор группы руководителей для текущего
				 * подразделения.
				 * @protected
				 * @param {Function} callback Функция обратного вызова, которая вызывается после того,
				 * как отработал запрос.
				 */
				selectChiefUnits: function(callback) {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "VwSysAdminUnit"
					});
					esq.addColumn("Id");
					esq.addColumn("Name");
					esq.addColumn("ParentRole");
					esq.addColumn("SysAdminUnitType");
					esq.filters.add("ParentRoleFilter", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "ParentRole", this.get("MasterRecordId")));
					esq.filters.add("TypeFilter", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "SysAdminUnitType",
						ConfigurationConstants.SysAdminUnit.TypeGuid.Manager));
					esq.getEntityCollection(function(response) {
						if (response && response.success) {
							if (response.collection.getCount() === 0) {
								this.set("SelectedNodesPrimaryColumnValues", []);
								this.sandbox.publish("GetChiefsSysAdminUnits", null, [this.sandbox.id]);
								this.set("IsAddRecordEnabled", false);
							} else {
								var result = response.collection.getItems()[0];
								var id = result.get("Id");
								this.set("SelectedNodesPrimaryColumnValues", [id]);
								this.set("ChiefRole", id);
								this.sandbox.publish("GetChiefsSysAdminUnits", {
									SysAdminUnitType: result.get("SysAdminUnitType").value,
									ParentRole: result.get("ParentRole").value,
									Name: result.get("Name"),
									Id: id
								}, [this.sandbox.id]);
								this.set("IsAddRecordEnabled", true);
							}
							this.set("ServiceDataLoaded", true);
							if (this.Ext.isFunction(callback)) {
								callback.call(this);
							}
						}
					}, this);
				},

				/**
				 * @inheritdoc BaseGridDetailV2#getFilters
				 * @overridden
				 **/
				getFilters: function() {
					var filters = this.Ext.create("Terrasoft.FilterGroup");
					filters.addItem(this.Terrasoft.createColumnInFilterWithParameters(
						"[SysUserInRole:SysUser:Id].[SysAdminUnit:Id:SysRole].Id",
						this.get("SelectedNodesPrimaryColumnValues")));
					return filters;
				}
			},
			messages: {
				"GetChiefsSysAdminUnits": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * Используется для передачи идентификатора текущей роли руководителя.
				 */
				"GetChiefId": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * Используется для сообщения, что была добавлена или удалена роль и стоит перезагрузить деталь.
				 */
				"UpdateChiefDetail": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			}
		};
	});