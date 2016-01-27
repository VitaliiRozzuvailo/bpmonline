define("ContactCareerDetailV2", ["terrasoft"],
	function(Terrasoft) {
		return {
			entitySchemaName: "ContactCareer",
			attributes: {},
			methods: {

				/**
				 * Возвращает имя колонки для фильтрации по умолчанию.
				 * @overridden
				 * @return {String} Имя колонки.
				 */
				getFilterDefaultColumnName: function() {
					return "Account";
				}
			},
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
									"name": "AccountListedGridColumn",
									"bindTo": "Account",
									"position": {
										"column": 1,
										"colSpan": 8
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "JobListedGridColumn",
									"bindTo": "Job",
									"type": Terrasoft.GridCellType.TEXT,
									"position": {
										"column": 9,
										"colSpan": 8
									}
								},
								{
									"name": "CurrentListedGridColumn",
									"bindTo": "Current",
									"type": Terrasoft.GridCellType.TEXT,
									"position": {
										"column": 17,
										"colSpan": 4
									}
								},
								{
									"name": "PrimaryListedGridColumn",
									"bindTo": "Primary",
									"type": Terrasoft.GridCellType.TEXT,
									"position": {
										"column": 21,
										"colSpan": 4
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
									"name": "AccountTiledGridColumn",
									"bindTo": "Account",
									"position": {
										"row": 1,
										"column": 1,
										"colSpan": 24
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "JobTiledGridColumn",
									"bindTo": "Job",
									"type": Terrasoft.GridCellType.TEXT,
									"position": {
										"row": 2,
										"column": 1,
										"colSpan": 12
									}
								},
								{
									"name": "CurrentTiledGridColumn",
									"bindTo": "Current",
									"type": Terrasoft.GridCellType.TEXT,
									"position": {
										"row": 2,
										"column": 13,
										"colSpan": 6
									}
								},
								{
									"name": "PrimaryTiledGridColumn",
									"bindTo": "Primary",
									"type": Terrasoft.GridCellType.TEXT,
									"position": {
										"row": 2,
										"column": 19,
										"colSpan": 6
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