define("DocumentDetailV2", ["terrasoft"],
	function(Terrasoft) {
		return {
			entitySchemaName: "Document",
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
									"name": "NumberListedGridColumn",
									"bindTo": "Number",
									"position": {
										"column": 1,
										"colSpan": 12
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "TypeListedGridColumn",
									"bindTo": "Type",
									"position": {
										"column": 13,
										"colSpan": 12
									}
								}
							]
						},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": {
								"columns": 24,
								"rows": 3
							},
							"items": [
								{
									"name": "NumberTiledGridColumn",
									"bindTo": "Number",
									"position": {
										"row": 1,
										"column": 1,
										"colSpan": 12
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "TypeTiledGridColumn",
									"bindTo": "Type",
									"position": {
										"row": 1,
										"column": 13,
										"colSpan": 12
									}
								}
							]
						}
					}
				},
			]/**SCHEMA_DIFF*/
		};
	}
);