define("ProductInLeadTypeDetailV2", ["ConfigurationEnums"],
	function(configurationEnums) {
		return {
			entitySchemaName: "VwProductInLeadType",
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "AddRecordButton",
					"values": {
						"visible": false
					}
				},
				{
					"operation": "merge",
					"name": "AddTypedRecordButton",
					"values": {
						"controlConfig": {
							"menu": {
								"items": [
									{
										"caption": {
											bindTo: "Resources.Strings.AddProductCaption"
										},
										"click": {
											bindTo: "addRecord"
										},
										"tag": "Product"
									}
								]
							}
						},
						"visible": {
							"bindTo": "getToolsVisible"
						}
					}
				},
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"rowDataItemMarkerColumnName": "Name"
					}
				}
			]/**SCHEMA_DIFF*/,
			methods: {
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
				 * Возвращает колонки, которые всегда выбираются запросом.
				 * @return {Object} Возвращает массив объектов-конфигураций колонок.
				 */
				getGridDataColumns: function() {
					return {
						"Id": {path: "Id"},
						"Product": {path: "Product"},
						"Product.Name": {path: "Product.Name"},
						"ProductFolder": {path: "ProductFolder"},
						"ProductFolder.Name": {path: "ProductFolder.Name"}
					};
				},

				/**
				 * Открывает справочник элемента.
				 * @param {String} columnName Имя колонки.
				 * @private
				 */
				openItemLookup: function(columnName) {
					var leadTypeId = this.get("MasterRecordId");
					if (this.Ext.isEmpty(leadTypeId) || this.Ext.isEmpty(columnName)) {
						return;
					}
					var config = {
						entitySchemaName: columnName,
						multiSelect: true,
						columnName: columnName,
						columns: ["Name"]
					};
					var productFilterPath = "[ProductInLeadType:" + columnName + ":Id].LeadType";
					var subProductFilterGroup = this.Ext.create("Terrasoft.FilterGroup");
					var productFilter = this.Terrasoft.createColumnInFilterWithParameters(productFilterPath,
						[leadTypeId]);
					subProductFilterGroup.addItem(productFilter);
					var notExistsFilter = this.Terrasoft.createNotExistsFilter("Id", subProductFilterGroup);
					config.filters = notExistsFilter;
					this.openLookup(config, this.addCallBack, this);
				},

				/**
				 * Вызывает открытие справочника.
				 * @overridden
				 */
				onCardSaved: function() {
					this.openItemLookup(this.get("AddItemType"));
				},

				/*
				 * Открывает справочник продуктов в случае если карточка типа потребности была ранее сохранена.
				 * @overridden
				 */
				addRecord: function(tag) {
					this.set("AddItemType", tag);
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
					this.openItemLookup(tag);
				},

				/*
				 * Добавление выбраных элементов.
				 * @param {String} args Имя колонки.
				 * @private
				 */
				addCallBack: function(args) {
					var bq = this.Ext.create("Terrasoft.BatchQuery");
					var leadTypeId = this.get("MasterRecordId");
					this.selectedRows = args.selectedRows.getItems();
					this.selectedItems = [];
					this.selectedRows.forEach(function(item) {
						item.LeadTypeId = leadTypeId;
						switch (args.columnName) {
							case "Product":
								item.ProductId = item.value;
								item.ProductFolderId = null;
								break;
							case "ProductFolder":
								item.ProductFolderId = item.value;
								item.ProductId = null;
								break;
						}
						bq.add(this.getProductInsertQuery(item));
						this.selectedItems.push(item.value);
					}, this);
					if (bq.queries.length) {
						this.showBodyMask.call(this);
						bq.execute(this.onItemsInsert, this);
					}
				},

				/*
				 * Возвращает запрос на добавление элемента.
				 * @param {Object} item Идентификатор типа потребности и выбранный в справочнике элемент.
				 * @private
				 */
				getProductInsertQuery: function(item) {
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "ProductInLeadType"
					});
					insert.setParameterValue("LeadType", item.LeadTypeId, this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Product", item.ProductId, this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("ProductFolder", item.ProductFolderId, this.Terrasoft.DataValueType.GUID);
					return insert;
				},

				/*
				 * Загрузка добавленых элементов в реестр.
				 * @param {Object} response Объект ответа от сервера.
				 * @private
				 */
				onItemsInsert: function(response) {
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

				/*
				 * Удаление выбранных записей
				 * @overridden
				 */
				deleteRecords: function() {
					var selectedRows = this.getSelectedItems();
					if (selectedRows.length > 0) {
						this.entitySchema.name = "ProductInLeadType";
						this.set("SelectedRows", selectedRows);
						this.callParent(arguments);
					}
				},

				/**
				 * Дополнительная обработка после удаления записи
				 * @overridden
				 */
				onDeleted: function() {
					this.entitySchema.name = this.entitySchemaName;
				}
			}
		};
	});
