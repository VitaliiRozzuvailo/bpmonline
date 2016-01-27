define("SysFuncRoleInUserDetailV2", ["terrasoft", "ConfigurationConstants"],
	function(Terrasoft, ConfigurationConstants) {
		return {
			entitySchemaName: "SysUserInRole",
			methods: {

				/**
				 * @inheritdoc Terrasoft.BaseSysUserInRoleDetailV2#getSysAdminUnitTypeList
				 * @overridden
				 */
				getSysAdminUnitTypeList: function() {
					return [ConfigurationConstants.SysAdminUnit.Type.FuncRole];
				},

				/**
				 * @inheritdoc Terrasoft.BaseSysUserInRoleDetailV2#getFilters
				 * @overridden
				 */
				getFilters: function() {
					var filters = this.callParent(arguments);
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL,
					"SysRole.SysAdminUnitTypeValue",
					ConfigurationConstants.SysAdminUnit.Type.FuncRole));
					return filters;
				}
			}
		};
	});
