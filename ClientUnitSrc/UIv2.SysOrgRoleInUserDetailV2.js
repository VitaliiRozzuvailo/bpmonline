define("SysOrgRoleInUserDetailV2", ["terrasoft", "ConfigurationConstants"],
	function(Terrasoft, ConfigurationConstants) {
		return {
			entitySchemaName: "SysUserInRole",
			methods: {

				/**
				 * @inheritdoc Terrasoft.BaseSysUserInRoleDetailV2#getSysAdminUnitTypeList
				 * @overridden
				 */
				getSysAdminUnitTypeList: function() {
					return [
						ConfigurationConstants.SysAdminUnit.Type.Organisation,
						ConfigurationConstants.SysAdminUnit.Type.Department,
						ConfigurationConstants.SysAdminUnit.Type.Manager,
						ConfigurationConstants.SysAdminUnit.Type.Team
					];
				},

				/**
				 * @inheritdoc Terrasoft.BaseSysUserInRoleDetailV2#getFilters
				 * @overridden
				 */
				getFilters: function() {
					var filters = this.callParent(arguments);
					filters.addItem(this.Terrasoft.createColumnInFilterWithParameters(
						"SysRole.SysAdminUnitTypeValue",
						this.getSysAdminUnitTypeList()));
					return filters;
				}
			}
		};
	});
