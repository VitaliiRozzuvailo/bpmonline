define("BaseAnniversaryDetailV2", ["terrasoft"], function(Terrasoft) {
	return {
		attributes: {
			Types: {dataValueType: Terrasoft.DataValueType.COLLECTION}
		},
		methods: {
			init: function(callback, scope) {
				if (!this.get("Types")) {
					this.initAnniversaryTypes(function() {
						this.init(callback, scope);
					}, this);
				} else {
					this.callParent(arguments);
				}
			},

			getEntityStructure: function(entitySchemaName) {
				if (!entitySchemaName) {
					return this.callParent(arguments);
				}
				var entityStructure = this.callParent(arguments);
				var typeColumnName = (entityStructure.attribute = "AnniversaryType");
				var anniversaryTypes = this.get("Types");
				var sourcePage = entityStructure.pages[0];
				var pages = [];
				anniversaryTypes.each(function(anniversaryType) {
					var caption = anniversaryType.get("Name");
					pages.push(Ext.apply({}, {
						"UId": anniversaryType.get("Id"),
						"caption": caption,
						"captionLcz": caption,
						"typeColumnName": typeColumnName
					}, sourcePage));
				}, this);
				entityStructure.pages = pages;
				return entityStructure;
			},

			/*
			 * @inheritdoc Terrasoft.GridUtilitiesV2#getGridDataColumns
			 * @overridden
			 */
			getGridDataColumns: function() {
				var config = this.callParent(arguments);
				config.AnniversaryType = {path: "AnniversaryType"};
				config.Description = {path: "Description"};
				config.Date = {path: "Date"};
				return config;
			},

			/**
			 * Инициализирует коллекцию типов знаменательного события
			 * @protected
			 */
			initAnniversaryTypes: function(callback, scope) {
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "AnniversaryType"});
				esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
				var nameColumn = esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "Name");
				nameColumn.orderPosition = 1;
				nameColumn.orderDirection = Terrasoft.OrderDirection.ASC;
				esq.getEntityCollection(function(result) {
					var anniversaryTypes = Ext.create("Terrasoft.BaseViewModelCollection");
					if (result.success) {
						anniversaryTypes = result.collection;
					}
					this.set("Types", anniversaryTypes);
					callback.call(scope);
				}, this);
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
								"name": "AnniversaryTypeListedGridColumn",
								"bindTo": "AnniversaryType",
								"position": {"column": 1, "colSpan": 12}
							},
							{
								"name": "DateListedGridColumn",
								"bindTo": "Date",
								"position": {"column": 13, "colSpan": 12}
							}
						]
					},
					"tiledConfig": {
						"name": "DataGridTiledConfig",
						"grid": {"columns": 24, "rows": 1},
						"items": []
					}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
