define("SysAdminUnitIPRangeDetailV2", ["terrasoft", "ConfigurationGridUtilities"],
	function(Terrasoft, ConfigurationGridUtilities) {
		return {
			mixins: {
				ConfigurationGridUtilities: "Terrasoft.ConfigurationGridUtilities"
			},
			attributes: {
				IsEditable: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: true
				}
			},
			entitySchemaName: "SysAdminUnitIPRange",
			methods: {

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addDetailWizardMenuItems
				 * @overridden
				 */
				addDetailWizardMenuItems: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.SysAdminUnitChiefIPRangeDetailV2#getAddRecordButtonEnabled
				 * @overridden
				 */
				getAddRecordButtonEnabled: function() {
					return true;
				},

				/**
				 * Загружает данные в реестр детали. Возврат базовой логики.
				 * @inheritdoc SysAdminUnitChiefIPRangeDetailV2#loadGridData
				 * @overridden
				 */
				loadGridData: function() {
					this.beforeLoadGridData();
					var esq = this.getGridDataESQ();
					this.initQueryColumns(esq);
					this.initQuerySorting(esq);
					this.initQueryFilters(esq);
					this.initQueryOptions(esq);
					this.initQueryEvents(esq);
					esq.getEntityCollection(function(response) {
						this.destroyQueryEvents(esq);
						this.onGridDataLoaded(response);
					}, this);
					this.setOrgRoleId();
				},

				/**
				 * Возвращает фильтр для выполнения запроса
				 * @inheritdoc SysAdminUnitChiefIPRangeDetailV2#getFilters
				 * @overridden
				 * @return {Terrasoft.FilterGroup} Группа фильтров filters.
				 **/
				getFilters: function() {
					var filters = this.Ext.create("Terrasoft.FilterGroup");
					var orgRoleId = this.get("MasterRecordId");
					if (orgRoleId) {
						var idFilter = Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL,"SysAdminUnit.Id", orgRoleId);
						filters.addItem(idFilter);
					}
					return filters;
				},

				/**
				 * Устанавливает значение организационной роли по умолчанию выбранную орг. роль.
				 * @protected
				 * @return {void} Группа фильтров filters.
				 **/
				setOrgRoleId: function() {
					var orgRoleId = this.get("MasterRecordId");
					var orgRoleValue = {
						name: "SysAdminUnit",
						value: orgRoleId
					};
					this.set("DefaultValues", [orgRoleValue]);
				}
			}
		};
	});