define("AccountBillingInfoDetailV2", [],
	function() {
		return {
			entitySchemaName: "AccountBillingInfo",
			attributes: {},
			methods: {

				/**
				 * Возвращает имя колонки для фильтрации по умолчанию.
				 * @overridden
				 * @return {String} Имя колонки.
				 */
				getFilterDefaultColumnName: function() {
					return "Name";
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
									"name": "NameListedGridColumn",
									"bindTo": "Name",
									"position": {
										"column": 1,
										"colSpan": 8
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "BillingInfoListedGridColumn",
									"bindTo": "BillingInfo",
									"position": {
										"column": 9,
										"colSpan": 16
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
									"name": "NameTiledGridColumn",
									"bindTo": "Name",
									"position": {
										"row": 1,
										"column": 1,
										"colSpan": 8
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "BillingInfoTiledGridColumn",
									"bindTo": "BillingInfo",
									"position": {
										"row": 1,
										"column": 9,
										"colSpan": 16
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