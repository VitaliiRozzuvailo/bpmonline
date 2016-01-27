define("InvoiceDetailV2", ["terrasoft"],
	function(Terrasoft) {
		return {
			entitySchemaName: "Invoice",
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
									"name": "NumberListedGridColumn",
									"bindTo": "Number",
									"position": {
										"column": 1,
										"colSpan": 8
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "PrimaryAmountListedGridColumn",
									"bindTo": "PrimaryAmount",
									"position": {
										"column": 9,
										"colSpan": 8
									}
								},
								{
									"name": "PaymentStatusListedGridColumn",
									"bindTo": "PaymentStatus",
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
									"name": "NumberTiledGridColumn",
									"bindTo": "Number",
									"position": {
										"row": 1,
										"column": 1,
										"colSpan": 8
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "PrimaryAmountTiledGridColumn",
									"bindTo": "PrimaryAmount",
									"position": {
										"row": 1,
										"column": 9,
										"colSpan": 8
									}
								},
								{
									"name": "PaymentStatusTiledGridColumn",
									"bindTo": "PaymentStatus",
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