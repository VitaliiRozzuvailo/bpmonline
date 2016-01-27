define("LeadDetailV2", ["terrasoft"],
		function(Terrasoft) {
			return {
				entitySchemaName: "Lead",
				attributes: {},
				methods: {},
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "remove",
						"name": "AddRecordButton",
						"parentName": "Detail",
						"propertyName": "tools"
					},
					{
						"operation": "remove",
						"name": "ToolsButton",
						"parentName": "Detail",
						"propertyName": "tools"
					},
					{
						"operation": "merge",
						"name": "DataGrid",
						"values": {
							type: "listed",
							listedConfig: {
								name: "DataGridListedConfig",
								items: [
									{
										name: "LeadNameListedGridColumn",
										bindTo: "LeadName",
										position: { column: 1, colSpan: 18 }
									}
								]
							},
							tiledConfig: {
								name: "DataGridTiledConfig",
								grid: {
									columns: 24,
									rows: 2
								},
								items: [
									{
										name: "LeadNameTiledGridColumn",
										bindTo: "LeadName",
										position: { row: 1, column: 1, colSpan: 24 },
										type: Terrasoft.GridCellType.TITLE
									}
								]
							}
						}
					}
				]/**SCHEMA_DIFF*/
			};
		}
);
