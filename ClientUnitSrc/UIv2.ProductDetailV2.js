define("ProductDetailV2", ["terrasoft"],
		function(Terrasoft) {
			return {
				entitySchemaName: "BaseProductEntry",
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
										"name": "NameListedGridColumn",
										"bindTo": "Name",
										"position": {
											"column": 1,
											"colSpan": 12
										},
										"type": Terrasoft.GridCellType.TITLE
									},
									{
										"name": "QuantityListedGridColumn",
										"bindTo": "Quantity",
										"position": {
											"column": 13,
											"colSpan": 6
										}
									},
									{
										"name": "TotalAmountListedGridColumn",
										"bindTo": "TotalAmount",
										"position": {
											"column": 19,
											"colSpan": 6
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
											"colSpan": 16
										},
										"type": Terrasoft.GridCellType.TITLE
									},
									{
										"name": "QuantityTiledGridColumn",
										"bindTo": "Quantity",
										"position": {
											"row": 1,
											"column": 17,
											"colSpan": 8
										}
									},
									{
										"name": "PriceTiledGridColumn",
										"bindTo": "Price",
										"position": {
											"row": 2,
											"column": 1,
											"colSpan": 8
										}
									},
									{
										"name": "DiscountPercentTiledGridColumn",
										"bindTo": "DiscountPercent",
										"position": {
											"row": 2,
											"column": 9,
											"colSpan": 8
										}
									},
									{
										"name": "TotalAmountTiledGridColumn",
										"bindTo": "TotalAmount",
										"position": {
											"row": 2,
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