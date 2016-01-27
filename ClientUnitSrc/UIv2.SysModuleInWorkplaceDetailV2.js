define("SysModuleInWorkplaceDetailV2", ["LocalizableHelper", "ServiceHelper"],
	function(LocalizableHelper, ServiceHelper) {
		return {
			entitySchemaName: "SysModuleInWorkplace",
			methods: {

				/**
				 * @overridden
				 */
				onCardSaved: function() {
					this.openSysModuleLookup();
				},

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
				addRecord: function() {
					this.sandbox.publish("SaveRecord", {
						isSilent: true,
						messageTags: [this.sandbox.id]
					}, [this.sandbox.id]);
				},

				/**
				 * Формирует фильтр для системных разделов.
				 * @private
				 * @return {Terrasoft.FilterGroup} Фильтр для системных разделов
				 */
				getHiddenModulesFilter: function() {
					var hiddenModulesFilter = this.Terrasoft.createColumnInFilterWithParameters(
						"Code",
						["SysAdminOperation", "SysAdminUnit", "SystemUsers", "FuncRoles"]
					);
					hiddenModulesFilter.comparisonType = this.Terrasoft.ComparisonType.NOT_EQUAL;
					return hiddenModulesFilter;
				},

				/**
				 * Открывает справочник разделов
				 * @private
				 */
				openSysModuleLookup: function() {
					var workplaceId = this.get("MasterRecordId");
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SysModuleInWorkplace"
					});
					esq.addColumn("SysModule.Id", "SysModuleId");
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "SysWorkplace", workplaceId));
					esq.getEntityCollection(function(result) {
						var existsCollection = [];
						if (result.success) {
							result.collection.each(function(item) {
								existsCollection.push(item.get("SysModuleId"));
							});
						}
						var filterGroup = this.Terrasoft.createFilterGroup();
						filterGroup.addItem(this.Terrasoft.createColumnIsNotNullFilter("SectionModuleSchemaUId"));
						var hiddenModulesFilter = this.getHiddenModulesFilter();
						filterGroup.addItem(hiddenModulesFilter);

						if (existsCollection.length > 0) {
							var existsFilter = this.Terrasoft.createColumnInFilterWithParameters("Id", existsCollection);
							existsFilter.comparisonType = this.Terrasoft.ComparisonType.NOT_EQUAL;
							filterGroup.addItem(existsFilter);
						}
						var config = {
							entitySchemaName: "SysModule",
							multiSelect: true,
							filters: filterGroup
						};
						this.openLookup(config, this.addCallBack, this);
					}, this);
				},

				/**
				 * callBack функции openLookup
				 * @private
				 * @param {Object} args
				 */
				addCallBack: function(args) {
					var batchQuery = Ext.create("Terrasoft.BatchQuery");
					var selectedRows = this.selectedRows = args.selectedRows.getItems();
					this.selectedItems = [];
					selectedRows.forEach(function(item) {
						batchQuery.add(this.getInsertQuery(item));
						this.selectedItems.push(item.value);
					}, this);
					if (!batchQuery.queries.length) {
						return;
					}
					this.showBodyMask();
					batchQuery.execute(this.onItemInsert, this);
				},

				/**
				 * Возвращает запрос на добавление обьекта
				 * @param {Object} item выбранный в справочнике обьект
				 * @private
				 **/
				getInsertQuery: function(item) {
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "SysModuleInWorkplace"
					});
					insert.setParameterValue("SysModule", item.value, Terrasoft.DataValueType.GUID);
					insert.setParameterValue("SysWorkplace", this.get("MasterRecordId"), Terrasoft.DataValueType.GUID);
					return insert;
				},

				/**
				 * Загрузка добавленых объектов в реестр
				 * @private
				 * @param {Object} response
				 **/
				onItemInsert: function(response) {
					if (!response.success) {
						this.hideBodyMask();
						var errorInfo = response.errorInfo;
						throw new Terrasoft.UnknownException({
							message: errorInfo.message
						});
					}
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
					var filter = this.Terrasoft.createColumnInFilterWithParameters(this.primaryColumnName, rowIds);
					filter.comparisonType = this.Terrasoft.ComparisonType.EQUAL;
					esq.filters.addItem(filter);
					esq.getEntityCollection(function(response) {
						this.hideBodyMask();
						this.onGridDataLoaded(response);
					}, this);
				},

				/**
				 * Метод устанавливает сортировку значений колонки position
				 * @private
				 * @param {String} recordId
				 * @param {Number} position
				 * @param {Function} callback
				 * @param {Object} scope
				 */
				setPosition: function(recordId, position, callback, scope) {
					var data = {
						tableName: "SysModuleInWorkplace",
						primaryColumnValue: recordId,
						position: position,
						grouppingColumnNames: "SysWorkplaceId"
					};
					ServiceHelper.callService("RightsService", "SetCustomRecordPosition", callback, data, scope);
				},

				/**
				 * Метод выполняет действия над выделенной строкой в завистимости от buttonTag
				 * @private
				 * @param {String} buttonTag
				 */
				onActiveRowAction: function(buttonTag) {
					var recordId = this.get("ActiveRow");
					var gridData = this.get("Collection");
					var activeRow = gridData.get(recordId);
					var position = activeRow.get("Position");
					if (buttonTag === "Up") {
						if (position > 0) {
							position--;
						}
					}
					if (buttonTag === "Down") {
						position++;
					}
					this.setPosition(recordId, position, function() {
						gridData.clear();
						this.loadGridData();
					}, this);
				},

				/**
				 * Получает колонки, которые всегда выбираются запросом
				 * @protected
				 * @overridden
				 * @return {Object} Возвращает колонки, которые всегда выбираются запросом
				 */
				getGridDataColumns: function() {
					var gridDataColumns = this.callParent(arguments);
					if (!gridDataColumns.Position) {
						gridDataColumns.Position = {
							path: "Position",
							orderPosition: 0,
							orderDirection: this.Terrasoft.OrderDirection.ASC
						};
					}
					return gridDataColumns;
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
						"activeRowActions": [],
						"activeRowAction": { bindTo: "onActiveRowAction"},
						"type": "listed",
						"listedConfig": {
							"name": "DataGridListedConfig",
							"items": [
								{
									"name": "SysModuleGridColumn",
									"bindTo": "SysModule",
									"position": { "column": 0, "colSpan": 8 }
								}
							]
						},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": { "columns": 24, "rows": 3 },
							"items": [
								{
									"name": "SysModuleGridColumn",
									"bindTo": "SysModule",
									"position": { "column": 0, "colSpan": 8 }
								}
							]
						}
					}
				}, {
					"operation": "insert",
					"name": "DataGridActiveRowUpButton",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.BLUE,
						"imageConfig": LocalizableHelper.localizableImages.Up,
						"tag": "Up"
					}
				}, {
					"operation": "insert",
					"name": "DataGridActiveRowUpButton",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.BLUE,
						"imageConfig": LocalizableHelper.localizableImages.Down,
						"tag": "Down"
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);