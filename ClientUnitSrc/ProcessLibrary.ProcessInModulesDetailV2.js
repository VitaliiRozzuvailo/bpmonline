define("ProcessInModulesDetailV2", ["ConfigurationConstants", "ConfigurationEnums"],
	function(ConfigurationConstants, configurationEnums) {
		return {
			/**
			 * Имя схемы объекта
			 * @type {String}
			 */
			entitySchemaName: "ProcessInModules",

			messages: {
			},
			attributes: {
			},
			methods: {
				/**
				 * Открывает справочник разделов
				 * @private
				 */
				openModuleLookup: function() {
					var sysSchemaUId = this.get("MasterRecordId");
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: this.entitySchemaName
					});
					esq.addColumn("Id");
					esq.addColumn("SysModule.Id", "SysModule");
					esq.filters.add("filterSchema", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "SysSchemaUId", sysSchemaUId));
					esq.getEntityCollection(function(result) {
						var existsModuleCollection = [];
						if (result.success) {
							result.collection.each(function(item) {
								existsModuleCollection.push(item.get("SysModule"));
							});
						}
						var config = {
							entitySchemaName: "SysModule",
							multiSelect: true,
							columns: ["Caption"],
							hideActions: true
						};
						var filterGroup = Terrasoft.createFilterGroup();
						if (existsModuleCollection.length > 0) {
							var existsFilter = this.Terrasoft.createColumnInFilterWithParameters("Id",
								existsModuleCollection);
							existsFilter.comparisonType = this.Terrasoft.ComparisonType.NOT_EQUAL;
							existsFilter.Name = "existsFilter";
							filterGroup.addItem(existsFilter);
						}
						var cardModuleFilter = this.Terrasoft.createColumnIsNotNullFilter("CardModuleUId");
						filterGroup.addItem(cardModuleFilter);
						config.filters = filterGroup;
						this.openLookup(config, this.addCallBack, this);
					}, this);
				},

				/*
				 * Открывает справочник разделов в случае если карточка процесса была ранее сохранена
				 * @overridden
				 * */
				addRecord: function() {
					var masterCardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
					var isNewRecord = (masterCardState.state === configurationEnums.CardStateV2.ADD ||
					masterCardState.state === configurationEnums.CardStateV2.COPY);
					if (isNewRecord === true) {
						var args = {
							isSilent: true,
							messageTags: [this.sandbox.id]
						};
						this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
						return;
					}
					this.openModuleLookup();
				},

				/**
				 * @overridden
				 */
				onCardSaved: function() {
					this.openModuleLookup();
				},

				/*
				 * Добавление выбраных разделов
				 * @private
				 * */
				addCallBack: function(args) {
					var bq = this.Ext.create("Terrasoft.BatchQuery");
					var schemaUId = this.get("MasterRecordId");
					this.selectedRows = args.selectedRows.getItems();
					this.selectedItems = [];
					this.selectedRows.forEach(function(item) {
						item.SysSchemaUId = schemaUId;
						bq.add(this.getProcessInModulesInsertQuery(item));
						this.selectedItems.push(item.value);
					}, this);
					if (bq.queries.length) {
						this.showBodyMask.call(this);
						bq.execute(this.onProcessInModulesInsert, this);
					}
				},

				/*
				 * Возвращает запрос на добавление разделов
				 * @param args {Object} идентификатор процесса и выбранный в справочнике раздел   {SysModuleId, value}
				 * @private
				 * */
				getProcessInModulesInsertQuery: function(item) {
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: this.entitySchemaName
					});
					insert.setParameterValue("SysSchemaUId", item.SysSchemaUId, this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("SysModule", item.value, this.Terrasoft.DataValueType.GUID);
					return insert;
				},

				/*
				 * Загрузка добавленых разделов в реестр
				 * @private
				 * */
				onProcessInModulesInsert: function(response) {
					this.hideBodyMask.call(this);
					this.beforeLoadGridData();
					var filterCollection = [];
					response.queryResults.forEach(function(item) {
						filterCollection.push(item.id);
					});
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: this.entitySchemaName
					});
					this.initQueryColumns(esq);
					esq.filters.add("recordId", Terrasoft.createColumnInFilterWithParameters("Id", filterCollection));
					esq.getEntityCollection(function(response) {
						this.afterLoadGridData();
						if (response.success) {
							var responseCollection = response.collection;
							this.prepareResponseCollection(responseCollection);
							this.getGridData().loadAll(responseCollection);
						}
					}, this);
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getCopyRecordMenuItem
				 * @overridden
				 */
				getCopyRecordMenuItem: Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getEditRecordMenuItem
				 * @overridden
				 */
				getEditRecordMenuItem: Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addDetailWizardMenuItems
				 * @overridden
				 */
				addDetailWizardMenuItems: Terrasoft.emptyFn
			},

			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						rowDataItemMarkerColumnName: "SysModule",
						type: "listed",
						listedConfig: {
							name: "DataGridListedConfig",
							items: [
								{
									name: "CaptionListedGridColumn",
									bindTo: "Caption",
									type: Terrasoft.GridCellType.TEXT,
									position: {
										column: 1,
										colSpan: 24
									}
								}
							]
						},
						tiledConfig: {
							name: "DataGridTiledConfig",
							grid: {columns: 24, rows: 3},
							items: [
								{
									name: "CaptionTiledGridColumn",
									bindTo: "Caption",
									type: Terrasoft.GridCellType.TEXT,
									position: {
										row: 1,
										column: 1,
										colSpan: 24
									},
									captionConfig: {
										visible: true
									}
								}
							]
						}
					}
				},
				{
					"operation": "merge",
					"name": "AddRecordButton",
					"values": {
						"visible": {"bindTo": "getToolsVisible"}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
