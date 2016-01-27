define("ProductStockBalanceDetailV2", [],
	function () {
		return {
			entitySchemaName: "ProductStockBalance",
			methods: {
				/**
				 * @inheritdoc Terrasoft.GridUtilitiesV2#getFilterDefaultColumnName
				 * @overridden
				 */
				getFilterDefaultColumnName: function() {
					return "Warehouse";
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"primaryDisplayColumnName": "Warehouse",
						"type": "listed",
						"listedConfig": {
							"name": "DataGridListedConfig",
							"items": [
								{
									"name": "WarehouseListedGridColumn",
									"bindTo": "Warehouse",
									"position": {"column": 0, "colSpan": 12}
								},
								{
									"name": "TotalQuantityListedGridColumn",
									"bindTo": "TotalQuantity",
									"position": {"column": 12, "colSpan": 4}
								},
								{
									"name": "ReserveQuantityListedGridColumn",
									"bindTo": "ReserveQuantity",
									"position": {"column": 16, "colSpan": 4}
								},
								{
									"name": "AvailableQuantityListedGridColumn",
									"bindTo": "AvailableQuantity",
									"position": {"column": 20, "colSpan": 4}
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
									"name": "WarehouseTiledGridColumn",
									"bindTo": "Warehouse",
									"position": {"row": 0, "column": 0, "colSpan": 12}
								},
								{
									"name": "TotalQuantityTiledGridColumn",
									"bindTo": "TotalQuantity",
									"position": {"row": 0, "column": 12, "colSpan": 4}
								},
								{
									"name": "ReserveQuantityTiledGridColumn",
									"bindTo": "ReserveQuantity",
									"position": {"row": 0, "column": 16, "colSpan": 4}
								},
								{
									"name": "AvailableQuantityTiledGridColumn",
									"bindTo": "AvailableQuantity",
									"position": {"row": 0, "column": 20, "colSpan": 4}
								}
							]
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
