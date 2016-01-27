define("AccountContactsDetailV2", ["terrasoft"],
	function(Terrasoft) {
		return {
			entitySchemaName: "Contact",
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
										"column": 0,
										"colSpan": 6
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "JobListedGridColumn",
									"bindTo": "Job",
									"position": {
										"column": 6,
										"colSpan": 6
									}
								},
								{
									"name": "EmailListedGridColumn",
									"bindTo": "Email",
									"position": {
										"column": 12,
										"colSpan": 6
									}
								},
								{
									"name": "MobilePhoneListedGridColumn",
									"bindTo": "MobilePhone",
									"position": {
										"column": 18,
										"colSpan": 6
									}
								}

							]
						},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": {
								"columns": 24,
								"rows": 2
							},
							"items": [
								{
									"name": "NameTiledGridColumn",
									"bindTo": "Name",
									"position": {
										"row": 0,
										"column": 0,
										"colSpan": 12
									},
									"type": Terrasoft.GridCellType.TITLE
								},
								{
									"name": "JobTitleTiledGridColumn",
									"bindTo": "JobTitle",
									"position": {
										"row": 0,
										"column": 12,
										"colSpan": 12
									}
								},
								{
									"name": "PhoneTiledGridColumn",
									"bindTo": "Phone",
									"position": {
										"row": 1,
										"column": 0,
										"colSpan": 6
									}
								},
								{
									"name": "MobilePhoneTiledGridColumn",
									"bindTo": "MobilePhone",
									"position": {
										"row": 1,
										"column": 6,
										"colSpan": 6
									}
								},
								{
									"name": "EmailTiledGridColumn",
									"bindTo": "Email",
									"position": {
										"row": 1,
										"column": 12,
										"colSpan": 6
									}
								},
								{
									"name": "HomePhoneTiledGridColumn",
									"bindTo": "HomePhone",
									"position": {
										"row": 1,
										"column": 18,
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