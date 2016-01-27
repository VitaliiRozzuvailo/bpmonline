define('SxVwOrderContDetail', ['terrasoft'],
function(Terrasoft) {
	return {
		entitySchemaName: 'SxVwOrderCont',
		attributes: {},
		diff: /**SCHEMA_DIFF*/[
	{
		"operation": "merge",
		"name": "DataGrid",
		"values": {
			"type": "listed",
			"listedConfig": {
				"name": "DataGridListedConfig",
				"items": [
					{
						"name": "SxNameListedGridColumn",
						"bindTo": "SxName",
						"type": "text",
						"position": {
							"column": 0,
							"colSpan": 24
						}
					}
				]
			},
			"tiledConfig": {
				"name": "DataGridTiledConfig",
				"grid": {
					"columns": 24,
					"rows": 1
				},
				"items": [
					{
						"name": "SxNameTiledGridColumn",
						"bindTo": "SxName",
						"type": "text",
						"position": {
							"row": 1,
							"column": 0,
							"colSpan": 24
						},
						"captionConfig": {
							"visible": false
						}
					}
				]
			}
		}
	}
]/**SCHEMA_DIFF*/,
		methods: {},
		messages: {}
	};
});
