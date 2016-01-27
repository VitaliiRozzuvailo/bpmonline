define("LeadProductDetailV2", ["ConfigurationEnums"],
	function(configurationEnums) {
		return {
			entitySchemaName: "LeadProduct",
			methods: {
				/**
				 * Возвращает колонки, которые всегда выбираются запросом
				 * @return {Object} Возвращает массив объектов-конфигураций колонок
				 */
				getGridDataColumns: function() {
					return {
						"Id": {path: "Id"},
						"Product": {path: "Product"},
						"Product.Name": {path: "Product.Name"}
					};
				},

				/**
				 * Открывает справочник продуктов
				 * @private
				 */
				openProductLookup: function() {
					var config = {
						entitySchemaName: "Product",
						multiSelect: true,
						columns: ["Name", "Price", "Currency"]
					};
					var leadId = this.get("MasterRecordId");
					if (this.Ext.isEmpty(leadId)) {
						return;
					}
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: this.entitySchemaName
					});
					esq.addColumn("Id");
					esq.addColumn("Product.Id", "ProductId");
					esq.filters.add("filterLead", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Lead", leadId));
					esq.getEntityCollection(function(result) {
						var existsProductsCollection = [];
						if (result.success) {
							result.collection.each(function(item) {
								existsProductsCollection.push(item.get("ProductId"));
							});
						}
						if (existsProductsCollection.length > 0) {
							var existsFilter = this.Terrasoft.createColumnInFilterWithParameters("Id",
								existsProductsCollection);
							existsFilter.comparisonType = this.Terrasoft.ComparisonType.NOT_EQUAL;
							existsFilter.Name = "existsFilter";
							config.filters = existsFilter;
						}
						this.openLookup(config, this.addCallBack, this);
					}, this);
				},

				/**
				 * @overridden
				 */
				onCardSaved: function() {
					this.openProductLookup();
				},

				/*
				 * Открывает справочник продуктов в случае если карточка лида была ранее сохранена
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
					this.openProductLookup();
				},

				/*
				 * Добавление выбраных продуктов
				 * @private
				 * */
				addCallBack: function(args) {
					var bq = this.Ext.create("Terrasoft.BatchQuery");
					var leadId = this.get("MasterRecordId");
					this.selectedRows = args.selectedRows.getItems();
					this.selectedItems = [];
					this.selectedRows.forEach(function(item) {
						item.LeadId = leadId;
						item.ProductId = item.value;
						bq.add(this.getProductInsertQuery(item));
						this.selectedItems.push(item.value);
					}, this);
					if (bq.queries.length) {
						this.showBodyMask.call(this);
						bq.execute(this.onProductInsert, this);
					}
				},

				/*
				 * Возвращает запрос на добавление продукта
				 * @param item {Object} идентификатор лида и выбранный в справочнике продукт   {LeadId, value}
				 * @private
				 * */
				getProductInsertQuery: function(item) {
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: this.entitySchemaName
					});
					insert.setParameterValue("Lead", item.LeadId, this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Product", item.ProductId, this.Terrasoft.DataValueType.GUID);
					return insert;
				},

				/*
				 * Загрузка добавленых продуктов в реестр
				 * @private
				 * */
				onProductInsert: function(response) {
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
				 * */
				deleteRecords: function() {
					var selectedRows = this.getSelectedItems();
					if (selectedRows.length > 0) {
						this.set("SelectedRows", selectedRows);
						this.callParent(arguments);
					}
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
				 * @inheritdoc Terrasoft.GridUtilitiesV2#getFilterDefaultColumnName
				 * @overridden
				 */
				getFilterDefaultColumnName: function() {
					return "Product";
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"rowDataItemMarkerColumnName": "Product"
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
