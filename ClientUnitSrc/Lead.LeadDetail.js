define('LeadDetail', ['Lead', 'LeadDetailStructure', 'LeadDetailResources'], function(Lead, structure, resources) {
	structure.userCode = function() {
		this.entitySchema = Lead;
		this.name = 'LeadDetailViewModel';
		this.editPageName = 'LeadPage';
		this.utilsConfig = {
			hiddenAdd: true,
			hiddenCopy: true,
			hiddenEdit: true,
			hiddenDelete: true
		};
		this.columnsConfig = [
			[
				{
					cols: 24,
					key: [
						{
							name: {
								bindTo: 'LeadName'
							},
							type: 'title'
						}
					]
				}
			]
		];
		this.loadedColumns = [
			{
				columnPath: 'LeadName'
			}
		];
		this.methods.setEntitySchema = function() {
			this.entitySchema = Lead;
		};
	};
	return structure;
});