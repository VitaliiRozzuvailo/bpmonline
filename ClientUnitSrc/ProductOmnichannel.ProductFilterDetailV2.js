define("ProductFilterDetailV2", ["LocalizableHelper", "ServiceHelper",
	"ProductManagementDistributionConstants", "StructureExplorerUtilities", "SpecificationConstants"],
	function(LocalizableHelper, ServiceHelper, DistributionConsts, StructureExplorerUtilities, SpecificationConstants) {
		return {
			entitySchemaName: "ProductFilter",
			messages: {
				/**
				 * @message StructureExplorerInfo
				 * Необходимо для работы StructureExplorerUtilities
				 */
				"StructureExplorerInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message ColumnSelected
				 * Необходимо для работы StructureExplorerUtilities
				 */
				"ColumnSelected": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			methods: {
				/**
				 * Возвращает видимость кнопки добавления записи
				 * @protected
				 * @overridden
				 */
				getAddRecordButtonVisible: function() {
					return this.getToolsVisible();
				},

				/**
				 * Обработчик нажатия на кнопку добавления фильтра по колонке продукта
				 * @protected
				 */
				addColumnFilterRecord: function() {
					this.addRecord(DistributionConsts.ProductFilterTypes.ColumnFilter);
				},

				/**
				 * Обработчик нажатия на кнопку добавления фильтра по характеристике
				 * @protected
				 */
				addSpecificationFilterRecord: function() {
					this.addRecord(DistributionConsts.ProductFilterTypes.SpecificationFilter);
				},

				/**
				 * Выполняет добавление записи.
				 * @param filterType Иденификатор типа фильтра.
				 * @protected
				 * @overridden
				 */
				addRecord: function(filterType) {
					this.set("RequiredFilterType", filterType);
					this.sandbox.publish("SaveRecord", {
						isSilent: true,
						messageTags: [this.sandbox.id]
					}, [this.sandbox.id]);
				},

				/**
				 * Открывает Lookup для выбора характеристики или StructureExplorer для
				 * выбора колонки продукта в зависимости от RequiredFilterType.
				 * @protected
				 * @virtual
				 */
				onCardSaved: function() {
					var filterType = this.get("RequiredFilterType");
					switch (filterType) {
						case (DistributionConsts.ProductFilterTypes.ColumnFilter):
							this.openProductStructureExplorer();
							break;
						case (DistributionConsts.ProductFilterTypes.SpecificationFilter):
							this.openSpecificationInProductLookup();
							break;
					}
				},

				/**
				 * Открытие окна StructureExplorer.
				 * @private
				 */
				openProductStructureExplorer: function() {
					var excludeTypes = this.get("excludeProductColumnTypes");
					var config = {
						useBackwards: false,
						summaryColumnsOnly: false,
						excludeDataValueTypes: excludeTypes,
						schemaName: "Product"
					};
					var handler = this.productStructureExplorerHandler;
					StructureExplorerUtilities.Open(this.sandbox,
						config, handler, this.renderTo, this);
				},

				/**
				 * Обработчик выбора StructureExplorer.
				 * Проверяет выбранное поле на уникальность и добавляет запись на деталь.
				 * @param args {Object} Содержит результат работы пользователя.
				 */
				productStructureExplorerHandler: function(args) {
					var productTypeId = this.get("MasterRecordId");
					var columnDataValueType = args.dataValueType;
					var columnCaption = args.leftExpressionCaption;
					var filterName = columnCaption.split(".").reverse()[0];
					var columnPath = args.leftExpressionColumnPath;
					var referenceSchemaName = args.referenceSchemaName;
					var filterType = DistributionConsts.ProductFilterTypes.ColumnFilter;
					var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "ProductFilter"
					});
					select.addAggregationSchemaColumn("Id", this.Terrasoft.AggregationType.COUNT, "IdCOUNT");
					select.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"ProductType", productTypeId));
					select.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"ColumnPath", columnPath));
					select.getEntityCollection(function(response) {
						var message = "";
						var success = true;
						if (response.success) {
							if (response.collection.getCount() < 1) {
								message = this.get("Resources.Strings.CantCheckProductColumnFilterError");
							} else {
								var selectResult  =  response.collection.getByIndex(0);
								var filtersCount = selectResult.get("IdCOUNT");
								if (filtersCount > 0) {
									message = this.get("Resources.Strings.ProductColumnFilterExists");
									success = false;
								}
							}
						} else {
							message = this.get("Resources.Strings.CantCheckProductColumnFilterError");
							success = false;
						}
						if (success) {
							var insert = this.Ext.create("Terrasoft.InsertQuery", {
								rootSchemaName: "ProductFilter"
							});
							insert.setParameterValue("ProductType", productTypeId, this.Terrasoft.DataValueType.GUID);
							insert.setParameterValue("Type", filterType, this.Terrasoft.DataValueType.GUID);
							insert.setParameterValue("Name", filterName, this.Terrasoft.DataValueType.TEXT);
							insert.setParameterValue("ColumnCaption", columnCaption, this.Terrasoft.DataValueType.TEXT);
							insert.setParameterValue("ColumnPath", columnPath, this.Terrasoft.DataValueType.TEXT);
							insert.setParameterValue("ReferenceSchemaName", referenceSchemaName, this.Terrasoft.DataValueType.TEXT);
							insert.setParameterValue("ColumnDataValueType", columnDataValueType, this.Terrasoft.DataValueType.INTEGER);
							insert.execute(this.onItemInsert, this);
						} else {
							this.showInformationDialog(message);
						}
					}, this);
				},

				/**
				 * Открытие лукапа для выбора списка характеристик
				 * @private
				 */
				openSpecificationInProductLookup: function() {
					var productTypeId = this.get("MasterRecordId");
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "ProductFilter"
					});
					esq.addColumn("Specification.Id", "SpecificationId");
					esq.filters.add("ExistsFilter", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "ProductType", productTypeId));
					esq.filters.add("FilterTypeFilter", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Type",
						DistributionConsts.ProductFilterTypes.SpecificationFilter));
					esq.getEntityCollection(function(result) {
						var existsCollection = [];
						if (result.success) {
							result.collection.each(function(item) {
								existsCollection.push(item.get("SpecificationId"));
							});
						}
						var filterGroup = this.Terrasoft.createFilterGroup();
						if (existsCollection.length > 0) {
							var existsFilter = this.Terrasoft.createColumnInFilterWithParameters("Id", existsCollection);
							existsFilter.comparisonType = this.Terrasoft.ComparisonType.NOT_EQUAL;
							filterGroup.add("existsFilter", existsFilter);
						}
						var supportedSpecificationTypes = [
							SpecificationConstants.SpecificationTypes.StringType,
							SpecificationConstants.SpecificationTypes.ListType
						];
						var specTypeFilter = this.Terrasoft.createColumnInFilterWithParameters("Type",
							supportedSpecificationTypes);
						filterGroup.add("supportedSpecificationTypes", specTypeFilter);
						var config = {
							entitySchemaName: "Specification",
							multiSelect: true,
							filters: filterGroup
						};
						this.openLookup(config, this.addCallBack, this);
					}, this);
				},

				/**
				 * callBack функции openLookup
				 * @private
				 * @param args {Object} - результат выбора из списка характеристик
				 */
				addCallBack: function(args) {
					var bq = this.Ext.create("Terrasoft.BatchQuery");
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
				 * Возвращает запрос на добавление обьекта
				 * @param args {Object} выбранный в справочнике обьект
				 * @private
				 **/
				getInsertQuery: function(item) {
					var insert = this.Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "ProductFilter"
					});
					var filterType = DistributionConsts.ProductFilterTypes.SpecificationFilter;
					insert.setParameterValue("Specification", item.value, Terrasoft.DataValueType.GUID);
					insert.setParameterValue("ProductType", this.get("MasterRecordId"), Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Type",  filterType, Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Name", item.displayValue, Terrasoft.DataValueType.TEXT);
					return insert;
				},

				/**
				 * Загрузка добавленых объектов в реестр
				 * @private
				 * @param Object response
				 **/
				onItemInsert: function(response) {
					if (response && response.success) {
						this.get("Collection").clear();
						this.loadGridData();
					}
				},

				/**
				 * Метод устанавливает сортировку значений колонки position.
				 * @private
				 * @param recordId Идентификатор записи.
				 * @param position Новая позиция.
				 * @param callback Функция обратного вызова.
				 * @param scope Контекс выполнения callback.
				 */
				setPosition: function(recordId, position, callback, scope) {
					var data = {
						tableName: "ProductFilter",
						primaryColumnValue: recordId,
						position: position,
						grouppingColumnNames: "ProductTypeId"
					};
					ServiceHelper.callService("RightsService", "SetCustomRecordPosition", callback, data, scope);
				},

				/**
				 * Метод выполняет действия над выделенной строкой в завистимости от buttonTag
				 * @private
				 * @param buttonTag Тэг кнопки.
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
				 * Получает колонки, которые всегда выбираются запросом.
				 * @protected
				 * @overridden
				 * @return {Object} Возвращает колонки, которые всегда выбираются запросом.
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
				 * Дополнительная обработка после удаления записи.
				 * Выполняет перезагрузку реестра для обновления колонки Position записей.
				 * @protected
				 * @overridden
				 * @param result
				 */
				onDeleted: function(result) {
					this.callParent(arguments);
					if (result.Success) {
						this.reloadGridData();
					}
				},

				/**
				 * Выполняет сортировку реестра
				 * при нажатии на заголовок колонки в списочном режиме.
				 * В данной реализации подставляет индекс колонки -1, для отключения сортировки.
				 * @protected
				 * @overridden
				 */
				sortColumn: function() {
					this.set("SortColumnIndex", -1);
				},

				/**
				 * Формирует массив исключаемых типов полей продуктов excludeProductColumnTypes доступных для фильтрации
				 */
				setExcludeProductColumnTypes: function() {
					var dvt = this.Terrasoft.DataValueType;
					var excludeTypes = [
						dvt.BOOLEAN,
						dvt.COLLECTION,
						dvt.COLOR,
						dvt.CUSTOM_OBJECT,
						dvt.DATE,
						dvt.DATE_TIME,
						dvt.ENUM,
						dvt.FLOAT,
						dvt.GUID,
						dvt.IMAGE,
						dvt.IMAGELOOKUP,
						dvt.INTEGER,
						dvt.MONEY,
						dvt.TIME
					];
					this.set("excludeProductColumnTypes", excludeTypes);
				},
				/**
				 * Выполняет инициализацию детали.
				 * @protected
				 * @overridden
				 */
				init: function() {
					this.callParent(arguments);
					this.sortColumn();
					this.setExcludeProductColumnTypes();
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getCopyRecordMenuItem
				 * @overridden
				 */
				getCopyRecordMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getEditRecordMenuItem
				 * @overridden
				 */
				getEditRecordMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getSwitchGridModeMenuItem
				 * @overridden
				 */
				getSwitchGridModeMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getGridSortMenuItem
				 * @overridden
				 */
				getGridSortMenuItem: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addDetailWizardMenuItems
				 * @overridden
				 */
				addDetailWizardMenuItems: this.Terrasoft.emptyFn
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"activeRowActions": [],
						"activeRowAction": { "bindTo": "onActiveRowAction"},
						"type": "listed",
						"listedConfig": {
							"name": "DataGridListedConfig",
							"items": [
								{
									"name": "SpecificationListedGridColumn",
									"bindTo": "Specification",
									"position": { "column": 0, "colSpan": 8 }
								}
							]
						},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": { "columns": 24, "rows": 3 },
							"items": [
								{
									"name": "SpecificationTiledGridColumn",
									"bindTo": "Specification",
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
						"style": this.Terrasoft.controls.ButtonEnums.style.BLUE,
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
						"style": this.Terrasoft.controls.ButtonEnums.style.BLUE,
						"imageConfig": LocalizableHelper.localizableImages.Down,
						"tag": "Down"
					}
				},
				{
					"operation": "remove",
					"name": "AddRecordButton"
				},
				{
					"operation": "insert",
					"name": "AddFilterButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"index": 0,
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.AddButtonCaption"},
						"visible": {"bindTo": "getAddRecordButtonVisible"},
						"enabled": {"bindTo": "getAddRecordButtonEnabled"},
						"menu": [],
						"controlConfig": {
							"markerValue": "Add"
						}
					}
				},
				{
					"operation": "insert",
					"name": "AddColumnFilterButton",
					"parentName": "AddFilterButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddColumnFilterButtonCaption"},
						"click": {"bindTo": "addColumnFilterRecord"},
						"visible": {"bindTo": "getAddRecordButtonVisible"},
						"enabled": {"bindTo": "getAddRecordButtonEnabled"}
					}
				},
				{
					"operation": "insert",
					"name": "AddSpecificationFilterButton",
					"parentName": "AddFilterButton",
					"propertyName": "menu",
					"values": {
						"caption": {"bindTo": "Resources.Strings.AddSpecificationFilterButtonCaption"},
						"click": {"bindTo": "addSpecificationFilterRecord"},
						"visible": {"bindTo": "getAddRecordButtonVisible"},
						"enabled": {"bindTo": "getAddRecordButtonEnabled"}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);