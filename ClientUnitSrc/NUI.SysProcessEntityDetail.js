define('SysProcessEntityDetail', ['ext-base', 'terrasoft', 'VwSysProcessEntity', 'SysProcessEntityDetailStructure',
	'SysProcessEntityDetailResources'],
	function(Ext, Terrasoft, VwSysProcessEntity,  structure, resources) {
		structure.userCode = function() {
			this.entitySchema = VwSysProcessEntity;
			this.name = 'SysProcessEntityDetailViewModel';

			this.captionsConfig = [
				{
					cols: 12,
					name: resources.localizableStrings.Caption
				},
				{
					cols: 12,
					name: resources.localizableStrings.Entity
				}
			];
			this.columnsConfig = [
				[
					{
						cols: 12,
						key: [
							{
								name: {
                                    bindTo: 'EntityDisplayValue'
								}
							}
						]
					},
					{
						cols: 12,
						key: [
							{
								name: {
									bindTo: 'SysSchema'
								}
							}
						]
					}
				]
			];
			this.loadedColumns = [
				{
					columnPath: 'SysSchema'
				},
				{
					columnPath: 'EntityDisplayValue'
				}
			];

			this.modifyUtilsButton = function(utilsButton) {
				utilsButton.menu.items[0].visible = false;
				return utilsButton;
			};

            var applyFilter = this.methods.applyFilter;
            this.methods.applyFilter = function(select, args) {
                select.filters.add('workFilter', Terrasoft.createColumnFilterWithParameter(
                    Terrasoft.ComparisonType.EQUAL,
                    'SysWorkspace',
                    Terrasoft.SysValue.CURRENT_WORKSPACE.value));
                if (applyFilter) {
                    applyFilter.call(this, select, args);
                    return true;
                }
            };

			this.methods.dblClickGridDetail = function() {
				return false;
			};
		};
		return structure;
	});