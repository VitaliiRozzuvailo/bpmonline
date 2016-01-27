define("SysProcessEntityDetailV2", ["terrasoft"],
	function(Terrasoft) {
		return {
			entitySchemaName: "VwSysProcessEntity",
			attributes: {},
			methods: {
				/**
				 * @inheritdoc BaseGridDetailV2#addRecordOperationsMenuItems
				 * @overridden
				 */
				addRecordOperationsMenuItems: this.Terrasoft.emptyFn,
				/**
				 * @inheritdoc BaseGridDetailV2#addDetailWizardMenuItems
				 * @overridden
				 */
				addDetailWizardMenuItems:  this.Terrasoft.emptyFn,
				/**
				 * @inheritdoc BaseGridDetailV2#getSwitchGridModeMenuItem
				 * @overridden
				 */
				getSwitchGridModeMenuItem: this.Terrasoft.emptyFn,
				initDetailOptions: function() {
					this.set("IsDetailCollapsed", true);
					this.callParent();
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
									"name": "EntityDisplayValueListedGridColumn",
									"bindTo": "EntityDisplayValue",
									"position": {
										"column": 1,
										"colSpan": 12
									}
								},
								{
									"name": "SysSchemaListedGridColumn",
									"bindTo": "SysSchema",
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
									"name": "EntityDisplayValueTiledGridColumn",
									"bindTo": "EntityDisplayValue",
									"position": {
										"row": 1,
										"column": 1,
										"colSpan": 12
									}
								},
								{
									"name": "SysSchemaTiledGridColumn",
									"bindTo": "SysSchema",
									"position": {
										"row": 1,
										"column": 13,
										"colSpan": 12
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