define('DocumentDetail', ['Document', 'DocumentDetailStructure', 'DocumentDetailResources'],
function(Document, structure, resources) {
	structure.userCode = function() {
		this.entitySchema = Document;
		this.name = 'DocumentDetailViewModel';
		this.editPageName = 'DocumentPage';
		this.columnsConfig = [
			{
				cols: 12,
				key: [
					{
						name: {
							bindTo: 'Number'
						},
						type: 'title'
					}
				]
			},
			{
				cols: 12,
				key: [
					{
						name: {
							bindTo: 'Type'
						}
					}
				]
			}
		];
		this.loadedColumns = [
			{
				columnPath: 'Number'
			},
			{
				columnPath: 'Type'
			}
		];
		this.methods.setEntitySchema = function() {
			this.entitySchema = Document;
		};
	};
	return structure;
});