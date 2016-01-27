define("SysAdminUnitChiefIPRangeDetailV2", ["terrasoft", "ConfigurationConstants", "ConfigurationGrid",
		"ConfigurationGridGenerator", "ConfigurationGridUtilities"],
	function(Terrasoft, ConfigurationConstants, ConfigurationGrid,
		ConfigurationGridGenerator, ConfigurationGridUtilities) {
		return {
			mixins: {
				ConfigurationGridUtilities: "Terrasoft.ConfigurationGridUtilities"
			},
			attributes: {
				IsEditable: {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: true
				}
			},
			entitySchemaName: "SysAdminUnitIPRange",
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"className": "Terrasoft.ConfigurationGrid",
						"generator": "ConfigurationGridGenerator.generatePartial",
						"generateControlsConfig": {"bindTo": "generateActiveRowControlsConfig"},
						"changeRow": {"bindTo": "changeRow"},
						"unSelectRow": {"bindTo": "unSelectRow"},
						"onGridClick": {"bindTo": "onGridClick"},
						"activeRowActions": [
							{
								"className": "Terrasoft.Button",
								"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"tag": "save",
								"markerValue": "save",
								"imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
							},
							{
								"className": "Terrasoft.Button",
								"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"tag": "cancel",
								"markerValue": "cancel",
								"imageConfig": {"bindTo": "Resources.Images.CancelIcon"}
							},
							{
								"className": "Terrasoft.Button",
								"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"tag": "remove",
								"markerValue": "remove",
								"imageConfig": {"bindTo": "Resources.Images.RemoveIcon"}
							}
						],
						"listedZebra": true,
						"initActiveRowKeyMap": {"bindTo": "initActiveRowKeyMap"},
						"activeRowAction": {"bindTo": "onActiveRowAction"},
						"multiSelect": false,
						"type": "listed",
						"listedConfig": {
							"name": "DataGridListedConfig",
							"items": [
								{
									"name": "SysAdminUnitNameListedGridColumn",
									"caption": {"bindTo": "Resources.Strings.SysAdminUnitNameCaption"},
									"bindTo": "SysAdminUnit.Name",
									"type": "text",
									"position": {
										"column": 0,
										"colSpan": 9
									}
								},
								{
									"name": "BeginIPListedGridColumn",
									"caption": {"bindTo": "Resources.Strings.BeginIPCaption"},
									"bindTo": "BeginIP",
									"type": "text",
									"position": {
										"column": 9,
										"colSpan": 6
									}
								},
								{
									"name": "EndIPListedGridColumn",
									"caption": {"bindTo": "Resources.Strings.EndIPCaption"},
									"bindTo": "EndIP",
									"type": "text",
									"position": {
										"column": 15,
										"colSpan": 6
									}
								}
							]
						}
					}
				}
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
					config["SysAdminUnit.Name"] = { path: "SysAdminUnit.Name"};
					config["BeginIP"] = { path: "BeginIP"};
					config["EndIP"] = { path: "EndIP" };
					return config;
				},

				/**
				 * @protected
				 * @inheritdoc GridUtilitiesV2#loadGridData
				 * @overridden
				 */
				loadGridData: function() {
					if (this.get("ChiefOrgRoleIdLoaded")) {
						this.set("ChiefOrgRoleIdLoaded", false);
						if (this.get("IsChiefRoleExists")) {
							this.callParent(arguments);
						}
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
					var item = this.get("ChiefOrgRoleId");
					filters.addItem(this.Terrasoft.createColumnInFilterWithParameters(
						"SysAdminUnit.Id", [item]));
					return filters;
				},

				/**
				 * Выполняет запрос, который возвращает идентификатор организационной роли руководителей
				 * для выбранной организационной роли.
				 * @protected
				 * @param {Function} callback Функция обратного вызова, которая вызывается после того,
				 * как получен идентификатор.
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
						Terrasoft.ComparisonType.EQUAL, "SysAdminUnitTypeValue",
						ConfigurationConstants.SysAdminUnit.Type.Manager));
					esq.getEntityCollection(function(response) {
						if (response && response.success) {
							var collection = response.collection;
							if (collection.getCount() > 0) {
								this.set("IsChiefRoleExists", true);
								var chiefOrgRoleId = collection.getByIndex(0).get("Id");
								var chiefOrgRoleValue = {
									name: "SysAdminUnit",
									value: chiefOrgRoleId
								};
								this.set("DefaultValues", [chiefOrgRoleValue]);
								this.set("ChiefOrgRoleId", chiefOrgRoleId);
								this.set("IsChiefRoleExists", true)
							} else {
								this.set("IsChiefRoleExists", false);
								var gridData = this.getGridData();
								gridData.clear();
							}
							this.set("ChiefOrgRoleIdLoaded", true);
							if (this.Ext.isFunction(callback)) {
								callback.call(this);
							}
						}
					}, this);
				}
			}
		};
	});