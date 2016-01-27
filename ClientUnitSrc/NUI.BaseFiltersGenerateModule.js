define('BaseFiltersGenerateModule', ['ext-base', 'terrasoft', 'BaseFiltersGenerateModuleResources'],
	function(Ext, Terrasoft, resources) {

	function OwnerFilter() {
		return Terrasoft.createColumnIsNotNullFilter('[SysAdminUnit:Contact].Id');
	}

	function SelfFilter() {
		var primaryColumnName = 'Id';
		if (this.entitySchema && this.entitySchema.primaryColumnName) {
			primaryColumnName = this.entitySchema.primaryColumnName;
		}
		var primaryColumnValue = this.get(primaryColumnName);
		return Terrasoft.createColumnFilterWithParameter(
			Terrasoft.ComparisonType.NOT_EQUAL, primaryColumnName, primaryColumnValue);
	}

	return {
		OwnerFilter: OwnerFilter,
		SelfFilter: SelfFilter
	};
});