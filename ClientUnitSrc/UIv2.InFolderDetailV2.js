define("InFolderDetailV2", ["terrasoft"],
	function(Terrasoft) {
		return {
			attributes: {},
			methods: {},
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
									"name": "FolderListedGridColumn",
									"bindTo": "Folder",
									"position": {
										"column": 1,
										"colSpan": 16
									}
								},
								{
									"name": "CreatedByListedGridColumn",
									"bindTo": "CreatedBy",
									"position": {
										"column": 17,
										"colSpan": 8
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
									"name": "FolderTiledGridColumn",
									"bindTo": "Folder",
									"position": {
										"row": 1,
										"column": 1,
										"colSpan": 16
									}
								},
								{
									"name": "CreatedByTiledGridColumn",
									"bindTo": "CreatedBy",
									"position": {
										"row": 1,
										"column": 17,
										"colSpan": 8
									}
								}
							]
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);