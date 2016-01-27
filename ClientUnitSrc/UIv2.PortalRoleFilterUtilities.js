define("PortalRoleFilterUtilities", ["terrasoft", "ConfigurationConstants"],
	function(Terrasoft, ConfigurationConstants) {
		var portalRoleFilterUtilitiesClass = Ext.define("Terrasoft.configuration.mixins.PortalRoleFilterUtilities", {

				alternateClassName: "Terrasoft.PortalRoleFilterUtilities",

				/**
				 * Возвращает группу фильтров для получения ролей без роли Пользователи портала.
				 * @param  {Array} sysAdminUnitTypeList Список типов ролей для фильтрации.
				 * @return {Terrasoft.FilterGroup} Группа фильтров.
				 */
				getSysAdminUnitWithoutPortalFilterGroup: function(sysAdminUnitTypeList) {
					var orgRolesFilterGroup = Terrasoft.createFilterGroup();
					orgRolesFilterGroup.logicalOperation = Terrasoft.LogicalOperatorType.AND;
					orgRolesFilterGroup.addItem(Terrasoft.createColumnInFilterWithParameters(
						"SysAdminUnitTypeValue", sysAdminUnitTypeList));
					orgRolesFilterGroup.addItem(Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.NOT_EQUAL,
						"Id",
						ConfigurationConstants.SysAdminUnit.Id.PortalUsers));
					return orgRolesFilterGroup;
				},

				/**
				 * Возвращает группу фильтров для получения роли Пользователи портала, если она активна.
				 * @return {Terrasoft.FilterGroup} Группа фильтров.
				 */
				getPortalFilterGroup: function() {
					var portalFilterGroup = Terrasoft.createFilterGroup();
					portalFilterGroup.logicalOperation = Terrasoft.LogicalOperatorType.AND;
					portalFilterGroup.addItem(Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "Active", true));
					portalFilterGroup.addItem(Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL,
						"Id",
						ConfigurationConstants.SysAdminUnit.Id.PortalUsers));
					return portalFilterGroup;
				},

				/**
				 * Возвращает группу фильтров для получения ролей.
				 * @param  {Array} sysAdminUnitTypeList Список типов ролей для фильтрации.
				 * @return {Terrasoft.FilterGroup} Группа фильтров.
				 */
				getSysAdminUnitFilterGroup: function(sysAdminUnitTypeList) {
					var orgRolesFilterGroup = this.getSysAdminUnitWithoutPortalFilterGroup(sysAdminUnitTypeList);
					var portalFilterGroup = this.getPortalFilterGroup();
					var filterGroup = Terrasoft.createFilterGroup();
					filterGroup.logicalOperation = Terrasoft.LogicalOperatorType.OR;
					filterGroup.addItem(portalFilterGroup);
					filterGroup.addItem(orgRolesFilterGroup);
					return filterGroup;
				}
			});
		return Ext.create(portalRoleFilterUtilitiesClass);
	});