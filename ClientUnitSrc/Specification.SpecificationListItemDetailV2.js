// D9 Team
define("SpecificationListItemDetailV2", [],
	function () {
		return {
			entitySchemaName: "SpecificationListItem",
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
									"name": "NameListedGridColumn",
									"bindTo": "Name",
									"position": { "column": 0, "colSpan": 24 }
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
									"name": "NameTiledGridColumn",
									"bindTo": "Name",
									"position": { "row": 0, "column": 0, "colSpan": 12 }
								}
							]
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
