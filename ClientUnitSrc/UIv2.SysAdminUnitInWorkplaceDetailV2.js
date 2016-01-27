define("SysAdminUnitInWorkplaceDetailV2", [],
	function() {
		return {
			entitySchemaName: "SysAdminUnitInWorkplace",
			methods: {

				/**
				 * Возвращает видимость кнопки добавления записи
				 * @overridden
				 */
				getAddRecordButtonVisible: function() {
					return this.getToolsVisible();
				},

				/**
				 * @overridden
				 */
				onCardSaved: function() {
					this.openSysAdminLookup();
				},

				/**
				 * @overridden
				 **/
				addRecord: function() {
					this.sandbox.publish("SaveRecord", {
						isSilent: true,
						messageTags: [this.sandbox.id]
					}, [this.sandbox.id]);
				},

				/**
				 * Открывает справочник объектов администрирования
				 * @private
				 */
				openSysAdminLookup: function() {
					var workplaceId = this.get("MasterRecordId");
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SysAdminUnitInWorkplace"
					});
					esq.addColumn("SysAdminUnit.Id", "SysAdminUnitId");
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "SysWorkplace", workplaceId));
					esq.getEntityCollection(function(result) {
						var existsCollection = [];
						if (result.success) {
							result.collection.each(function(item) {
								existsCollection.push(item.get("SysAdminUnitId"));
							}, this);
						}
						var config = {
							entitySchemaName: "SysAdminUnit",
							multiSelect: true,
							hideActions: true
						};
						var filterGroup = this.Terrasoft.createFilterGroup();
						if (existsCollection.length > 0) {
							var existsFilter =
								this.Terrasoft.createColumnInFilterWithParameters("Id", existsCollection);
							existsFilter.comparisonType = this.Terrasoft.ComparisonType.NOT_EQUAL;
							filterGroup.addItem(existsFilter);
						}
						var rolesFilter = this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.LESS, "SysAdminUnitTypeValue", 4);
						filterGroup.addItem(rolesFilter);
						config.filters = filterGroup;
						this.openLookup(config, this.addCallBack, this);
					}, this);
				},

				/**
				 * callBack функции openLookup
				 * @private
				 * @param {Object} args
				 */
				addCallBack: function(args) {
					var bq = Ext.create("Terrasoft.BatchQuery");
					this.selectedRows = args.selectedRows.getItems();
					this.selectedItems = [];
					this.selectedRows.forEach(function(item) {
						bq.add(this.getInsertQuery(item));
						this.selectedItems.push(item.value);
					}, this);
					if (bq.queries.length) {
						bq.execute(this.onItemInsert, this);
					}
				},

				/**
				* Возвращает запрос на добавление обьекта администрирования
				* @param  {Object} item выбранный в справочнике обьект {SysWorkplaceId, value}
				* @private
				* @return Object
				 **/
				getInsertQuery: function(item) {
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "SysAdminUnitInWorkplace"
					});
					insert.setParameterValue("SysAdminUnit", item.value, Terrasoft.DataValueType.GUID);
					insert.setParameterValue("SysWorkplace", this.get("MasterRecordId"), Terrasoft.DataValueType.GUID);
					return insert;
				},

				/**
				 * Загрузка добавленых объектов в реестр
				 * @private
				 * @param {Object} response
				 **/
				onItemInsert: function(response) {
					if (response && response.success) {
						var queryResult = response.queryResults;
						var rowIds = [];
						this.Terrasoft.each(queryResult, function(item) {
							if (item.id) {
								rowIds.push(item.id);
							}
						});
						var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchema: this.entitySchema
						});
						this.initQueryColumns(esq);
						var filter = this.Terrasoft.createColumnInFilterWithParameters("Id", rowIds);
						filter.comparisonType = this.Terrasoft.ComparisonType.EQUAL;
						esq.filters.add("id", filter);
						esq.getEntityCollection(function(response) {
							this.onGridDataLoaded(response);
						}, this);
					}
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getEditRecordMenuItem
				 * @overridden
				 */
				getEditRecordMenuItem: Terrasoft.emptyFn

			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "Detail",
					"values": {
						"wrapClass": ["hide-grid-caption-wrapClass"]
					}
				},
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
									"bindTo": "SysAdminUnit.Name",
									"position": { "column": 1, "colSpan": 24 }
								}
							]
						},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": { "columns": 24, "rows": 1 },
							"items": [
								{
									"name": "NameTiledGridColumn",
									"bindTo": "SysAdminUnit.Name",
									"type": "text",
									"position": { "row": 1, "column": 0, "colSpan": 20 }
								}
							]
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
