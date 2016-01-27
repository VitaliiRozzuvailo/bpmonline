define("SysRoleInMobWorkplaceDetail", ["SysRoleInMobWorkplaceDetailResources", "MobileDesignerUtils",
	"ConfigurationConstants"],
	function(resources, MobileDesignerUtils, ConfigurationConstants) {
		return {
			entitySchemaName: "SysRoleInMobWorkplace",
			methods: {

				/**
				 * @private
				 */
				sysRoleIdPath: "SysRole.Id",

				/**
				 * @private
				 */
				openSysAdminLookup: function() {
					var workplaceId = this.get("MasterRecordId");
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SysRoleInMobWorkplace"
					});
					esq.addColumn("SysRole.Id", "SysRoleId");
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "SysMobileWorkplace", workplaceId));
					esq.getEntityCollection(function(result) {
						var existingRoles = [];
						if (result.success) {
							result.collection.each(function(item) {
								existingRoles.push(item.get("SysRoleId"));
							}, this);
						}
						var config = {
							entitySchemaName: "SysAdminUnit",
							multiSelect: true
						};
						var filterGroup = this.Terrasoft.createFilterGroup();
						if (existingRoles.length > 0) {
							var existsFilter = this.Terrasoft.createColumnInFilterWithParameters("Id", existingRoles);
							existsFilter.comparisonType = this.Terrasoft.ComparisonType.NOT_EQUAL;
							filterGroup.addItem(existsFilter);
						}
						config.filters = filterGroup;
						this.openLookup(config, this.addCallback, this);
					}, this);
				},

				/**
				 * @private
				 */
				addCallback: function(args) {
					var batchQuery = Ext.create("Terrasoft.BatchQuery");
					this.selectedRows = args.selectedRows.getItems();
					this.selectedItems = [];
					this.selectedRows.forEach(function(item) {
						batchQuery.add(this.getInsertQuery(item));
						this.selectedItems.push(item.value);
					}, this);
					if (batchQuery.queries.length) {
						batchQuery.execute(this.onItemInsert, this);
					}
				},

				/**
				 * @private
				 **/
				getInsertQuery: function(item) {
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "SysRoleInMobWorkplace"
					});
					insert.setParameterValue("SysRole", item.value, Terrasoft.DataValueType.GUID);
					insert.setParameterValue("SysMobileWorkplace", this.get("MasterRecordId"), Terrasoft.DataValueType.GUID);
					return insert;
				},

				/**
				 * @private
				 **/
				onItemInsert: function(response) {
					if (response && response.success) {
						var queryResult = response.queryResults;
						var rowIds = [];
						this.Terrasoft.each(queryResult, function(item) {
							if (item.id) {
								rowIds.push(item.id);
							}
						});
						var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchema: this.entitySchema
						});
						this.initQueryColumns(esq);
						var filter = this.Terrasoft.createColumnInFilterWithParameters("Id", rowIds);
						filter.comparisonType = this.Terrasoft.ComparisonType.EQUAL;
						esq.filters.add("id", filter);
						esq.getEntityCollection(function(response) {
							this.onGridDataLoaded(response);
						}, this);
					}
				},

				/**
				 * Возвращает видимость кнопки добавления записи
				 * @inheritDoc Terrasoft.BaseGridDetailV2#getAddRecordButtonVisible
				 * @protected
				 * @overridden
				 */
				getAddRecordButtonVisible: function() {
					return this.getToolsVisible();
				},

				/**
				 * @inheritDoc Terrasoft.BaseGridDetailV2#onCardSaved
				 * @protected
				 * @overridden
				 */
				onCardSaved: function() {
					this.openSysAdminLookup();
				},

				/**
				 * @inheritDoc Terrasoft.BaseGridDetailV2#addRecord
				 * @protected
				 * @overridden
				 **/
				addRecord: function() {
					this.sandbox.publish("SaveRecord", {
						isSilent: true,
						messageTags: [this.sandbox.id]
					}, [this.sandbox.id]);
				},

				/**
				 * Добавляет элементы манипулирования реестром в коллекцию выпадающего списка функциональной кнопки.
				 * @inheritDoc Terrasoft.BaseGridDetailV2#addGridOperationsMenuItems
				 * @protected
				 * @overridden
				 * @param {BaseViewModelCollection} toolsButtonMenu Коллекция выпадающего списка функциональной кнопки.
				 */
				addGridOperationsMenuItems: Terrasoft.emptyFn,

				/**
				 * @inheritDoc Terrasoft.BaseGridDetailV2#getEditRecordMenuItem
				 * @protected
				 * @overridden
				 */
				getEditRecordMenuItem: Terrasoft.emptyFn,

				/**
				 * @inheritDoc Terrasoft.BaseGridDetailV2#getCopyRecordMenuItem
				 * @protected
				 * @overridden
				 */
				getCopyRecordMenuItem: Terrasoft.emptyFn,

				/**
				 * @inheritDoc Terrasoft.BaseGridDetailV2#addDetailWizardMenuItems
				 * @protected
				 * @overridden
				 */
				addDetailWizardMenuItems: Terrasoft.emptyFn,

				/**
				 * @inheritDoc Terrasoft.configuration.mixins.GridUtilities#getGridDataColumns
				 * @protected
				 * @overridden
				 */
				getGridDataColumns: function() {
					var defColumnsConfig = this.callParent(arguments);
					var roleIdPath = this.sysRoleIdPath;
					defColumnsConfig[roleIdPath] = {
						path: roleIdPath
					};
					return defColumnsConfig;
				},

				/**
				 * @inheritDoc Terrasoft.configuration.mixins.GridUtilities#checkCanDelete
				 * @protected
				 * @overridden
				 */
				checkCanDelete: function(items, callback, scope) {
					var gridData = this.getGridData();
					var isExistsAllEmployeesRight = false;
					for (var i = 0, ln = items.length; i < ln; i++) {
						var item = gridData.get(items[i]);
						if (item.get(this.sysRoleIdPath) === ConfigurationConstants.SysAdminUnit.Id.AllEmployees) {
							isExistsAllEmployeesRight = true;
							break;
						}
					}
					if (!isExistsAllEmployeesRight) {
						this.Ext.callback(callback, scope);
						return;
					}
					var detailInfo = this.getDetailInfo();
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SysMobileWorkplace"
					});
					esq.addColumn("Code");
					var filter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Id", detailInfo.masterRecordId);
					esq.filters.add("id", filter);
					esq.getEntityCollection(function(response) {
						if (response && response.success) {
							var collection = response.collection;
							if (collection.getCount() === 1) {
								var result = collection.getItems()[0];
								if (MobileDesignerUtils.defaultWorkplaceCode === result.get("Code")) {
									this.showInformationDialog(resources.localizableStrings.DeleteDefaultWorkplaceRightMessage);
									return;
								}
								this.Ext.callback(callback, scope);
							}
						}
					}, this);
				}

			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "Detail",
					"values": {
						"wrapClass": ["hide-grid-caption-wrapClass"]
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
