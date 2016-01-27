define("SupplyPaymentProductDetailModalBox", ["ConfigurationGrid", "ConfigurationGridGenerator",
		"ConfigurationGridUtilities", "css!SummaryModuleV2"], function() {
	return {
		entitySchemaName: "VwSupplyPaymentProduct",
		mixins: {
			ConfigurationGridUtilites: "Terrasoft.ConfigurationGridUtilities",
			GridUtilities: "Terrasoft.GridUtilities"
		},
		messages: {
			/**
			 * Используется для обновления реестра детали графика поставок и оплат.
			 */
			"ReloadSupplyPaymentGridData": {
				mode: this.Terrasoft.MessageMode.BROADCAST,
				direction: this.Terrasoft.MessageDirectionType.PUBLISH
			}
		},
		attributes: {
			/**
			 * Признак редактируемости реестра.
			 */
			IsEditable: {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: true
			},

			/**
			 * Минимальная ширина окна.
			 */
			MinWidth: {
				dataValueType: Terrasoft.DataValueType.INTEGER,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: 820
			},

			/**
			 * Минимальная высота окна.
			 */
			MinHeight: {
				dataValueType: Terrasoft.DataValueType.INTEGER,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: 100
			},

			/**
			 * Максимальная высота контейнера реестра.
			 */
			MaxGridHeight: {
				dataValueType: Terrasoft.DataValueType.INTEGER,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: 450
			},

			/**
			 * Итоговое значение суммы.
			 */
			TotalAmount: {
				dataValueType: Terrasoft.DataValueType.TEXT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: ""
			}
		},
		methods: {
			/**
			 * Инициализирует коллекцию данных представления реестра.
			 * @protected
			 * @param {Function} callback Функция, которая будет вызвана после инициализации.
			 * @param {Object} scope Контекст выполнения.
			 */
			initData: function(callback, scope) {
				this.set("Collection", this.Ext.create("Terrasoft.BaseViewModelCollection"));
				this.initGridRowViewModel(function() {
					this.initGridData();
					this.mixins.GridUtilities.init.call(this);
					this.loadGridData();
					callback.call(scope);
				}, this);
			},

			/**
			 * @inheritdoc Terrasoft.ConfigurationGridUtilities#getDefaultConfigurationGridItemSchemaName
			 * @overridden
			 */
			getDefaultConfigurationGridItemSchemaName: function() {
				return "SupplyPaymentProductPageV2";
			},

			/**
			 * Возвращает коллекцию реестра.
			 * @protected
			 * @return {Object}
			 */
			getGridData: function() {
				return this.get("Collection");
			},

			/**
			 * @inheritdoc Terrasoft.BaseSchemaViewModel#init
			 * @overridden
			 */
			init: function(callback, scope) {
				this.initEditPages();
				this.callParent([function() {
					this.initData(function() {
						callback.call(scope);
					}, this);
				}, this]);
			},

			/**
			 * Выполняет инициализацию значений по умолчанию для работы со списком.
			 * @protected
			 * @virtual
			 */
			initGridData: function() {
				this.set("ActiveRow", "");
				this.set("IsEditable", true);
				this.set("MultiSelect", false);
				this.set("IsPageable", false);
				this.set("IsClearGridData", false);
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#loadGridData
			 * @overridden
			 */
			loadGridData: function() {
				if (!this.get("IsDetailCollapsed") && !this.get("IsGridLoading")) {
					this.set("IsGridLoading", true);
					this.mixins.GridUtilities.loadGridData.call(this);
				}
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#getFilters
			 * @overridden
			 */
			getFilters: function() {
				var filters = this.mixins.GridUtilities.getFilters.call(this);
				if (filters) {
					var moduleInfo = this.getModuleInfo();
					var supplyPaymentElementId = moduleInfo && moduleInfo.supplyPaymentElementId;
					if (supplyPaymentElementId) {
						filters.add("supplyPaymentElementFilter",
							this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "SupplyPaymentElement", supplyPaymentElementId
							)
						);
					}
					var notDistributedFiltersGroup = this.Ext.create("Terrasoft.FilterGroup");
					notDistributedFiltersGroup.logicalOperation =  Terrasoft.LogicalOperatorType.OR;
					notDistributedFiltersGroup.add("isNotDistributedFilter",
						this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "IsDistributed", 0
						)
					);
					notDistributedFiltersGroup.add("usedQuantityMoreZeroFilter",
						this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.GREATER, "UsedQuantity", 0
						)
					);
					filters.add(notDistributedFiltersGroup);
				}
				return filters;
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#getGridDataColumns
			 * @overridden
			 */
			getGridDataColumns: function() {
				var gridDataColumns = this.mixins.GridUtilities.getGridDataColumns(arguments);
				var requiredColumns = {
					OrderProduct: {path: "OrderProduct"}
				};
				return Ext.apply(gridDataColumns, requiredColumns);
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#addGridDataColumns
			 * @overridden
			 */
			addGridDataColumns: function(esq) {
				this.mixins.GridUtilities.addGridDataColumns(arguments);
				if (!esq.columns.contains("OrderProduct.Price")) {
					esq.addColumn("OrderProduct.Price", "Price");
				}
				if (!esq.columns.contains("OrderProduct.DiscountPercent")) {
					esq.addColumn("OrderProduct.DiscountPercent", "DiscountPercent");
				}
			},

			/**
			 * Инициализирует классы элементов коллекции реестра.
			 * @protected
			 * @param {Function} callback callback-функция.
			 * @param {Object} scope Контекст выполнения.
			 */
			initGridRowViewModel: function(callback, scope) {
				this.initEditableGridRowViewModel(callback, scope);
			},

			/**
			 * Получает информацию, переданную при загрузке модуля.
			 * @protected
			 * @return {Object} Объект, передаваемый деталью при загрузке модуля модального окна.
			 */
			getModuleInfo: function() {
				return this.get("moduleInfo");
			},

			/**
			 * @inheritDoc Terrasoft.BaseSectionV2#getActiveRow
			 * @overridden
			 */
			getActiveRow: function() {
				var activeRow = null;
				var primaryColumnValue = this.get("ActiveRow");
				if (primaryColumnValue) {
					var gridData = this.getGridData();
					activeRow = gridData.find(primaryColumnValue) ? gridData.get(primaryColumnValue) : null;
				}
				return activeRow;
			},

			/**
			 * Вычисляет размеры модального окна по содержимому контейнеров.
			 * @private
			 * @return {Object} Объект, содержащий информацию о ширине и высоте модального окна.
			 */
			getModalWindowSize: function() {
				var gridContainerEl = this.Ext.get("gridContainer");
				var fixedContainerEl = this.Ext.get("fixedAreaContainer");
				if (!gridContainerEl || !fixedContainerEl) {
					return null;
				}
				var totalHeight = fixedContainerEl.dom.clientHeight +
					Math.min(gridContainerEl.dom.clientHeight, this.get("MaxGridHeight")) + this.get("MinHeight");
				return {
					width: this.get("MinWidth"),
					height: totalHeight
				};
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#onGridDataLoaded
			 * @overridden
			 */
			onGridDataLoaded: function() {
				this.mixins.GridUtilities.onGridDataLoaded.apply(this, arguments);
				this.recalculateTotalAmount();
				var modalWindowSize = this.getModalWindowSize();
				if (modalWindowSize) {
					this.updateSize(modalWindowSize.width, modalWindowSize.height);
				}
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#prepareResponseCollectionItem
			 * @overridden
			 */
			prepareResponseCollectionItem: function(item) {
				this.mixins.GridUtilities.prepareResponseCollectionItem.apply(this, arguments);
				item.on("change:UsedAmount", this.recalculateTotalAmount, this);
			},

			/**
			 * Пересчет итоговой суммы.
			 * @private
			 */
			recalculateTotalAmount: function() {
				var totalAmount = 0;
				var gridData = this.getGridData();
				gridData.each(function(row) {
					totalAmount += row.get("UsedAmount") || 0;
				}, this);
				this.set("TotalAmount", this.Terrasoft.getFormattedNumberValue(totalAmount));
			},

			/**
			 * Возвращает информацию о продуктах с измененным количеством.
			 * @protected
			 * @return {Object} Информация о продуктах с измененным количеством.
			 */
			getChangedProductData: function() {
				var data = this.getGridData();
				var productsInfo = {};
				var isAnyRowChanged = false;
				data.each(function(row) {
					if (row.isChanged()) {
						var quantity = row.get("UsedQuantity");
						if (quantity !== 0 && !Boolean(quantity)) {
							quantity = 0;
							row.set("UsedQuantity", quantity);
						}
						isAnyRowChanged = true;
						var orderProduct = row.get("OrderProduct");
						if (orderProduct && orderProduct.value) {
							productsInfo[orderProduct.value] = quantity;
						}
					}
				}, this);
				return {
					productsInfo: productsInfo,
					isAnyRowChanged: isAnyRowChanged
				};
			},

			/**
			 * Сохраняет изменения количества продуктов.
			 * @protected
			 */
			saveChanges: function() {
				var moduleInfo = this.getModuleInfo();
				var supplyPaymentElementId = moduleInfo && moduleInfo.supplyPaymentElementId;
				var changedProductData = this.getChangedProductData();
				if (supplyPaymentElementId && changedProductData.isAnyRowChanged) {
					this.set("okButtonMaskVisible", true);
					this.saveChangesOnServer({
						supplyPaymentElementId: supplyPaymentElementId,
						productsInfo: changedProductData.productsInfo,
						callback: function() {
							this.sandbox.publish("ReloadSupplyPaymentGridData");
							this.closeWindow();
						},
						scope: this
					});
				} else {
					this.closeWindow();
				}
			},

			/**
			 * Сохраняет изменения количества продуктов в БД.
			 * @protected
			 * @param {Object} config Объект для формирования запроса обновления количества продуктов на сервер.
			 * Содержит следующие параметры:
			 * @param {GUID} config.supplyPaymentElementId
			 *   Идентификатор текущего шага графика поставок и оплат.
			 * @param {Object} config.productsInfo
			 *   Объект, содержащий информацию об изменённых продуктах и их новом количестве.
			 * @param {Function} config.callback
			 *   Функция, которая будет вызвана после получения ответа от сервера.
			 * @param {Object} config.scope
			 *   Контекст выполнения.
			 */
			saveChangesOnServer: function(config) {
				this.callService({
					serviceName: "OrderPassportService",
					methodName: "UpdateSupplyPaymentProducts",
					data: {
						"updateRequest": {
							"supplyPaymentElementId": config.supplyPaymentElementId,
							"productsData": this.Terrasoft.encode(config.productsInfo)
						}
					}
				}, function(response) {
					this.set("okButtonMaskVisible", false);
					var result = response.UpdateSupplyPaymentProductsResult || {};
					if (!result.success) {
						this.showInformationDialog(result.errorInfo.message);
						this.reloadGridData();
					} else {
						config.callback.call(config.scope);
					}
				}, this);
			},

			/**
			 * @inheritdoc Terrasoft.ConfigurationGridUtilities#onCtrlEnterKeyPressed
			 * @overridden
			 */
			onCtrlEnterKeyPressed: function() {
				var activeRow = this.getActiveRow();
				this.unfocusRowControls(activeRow);
				this.setActiveRow(null);
			},

			/**
			 * @inheritdoc Terrasoft.ConfigurationGridUtilities#onEnterKeyPressed
			 * @overridden
			 */
			onEnterKeyPressed: function() {
				var activeRow = this.getActiveRow();
				this.unfocusRowControls(activeRow);
			},

			/**
			 * @inheritdoc Terrasoft.ConfigurationGridUtilities#onTabKeyPressed
			 * @overridden
			 */
			onTabKeyPressed: function() {
				var activeRow = this.getActiveRow();
				this.currentActiveColumnName = this.getCurrentActiveColumnName(activeRow, this.columnsConfig);
				return true;
			},

			/**
			 * @inheritdoc Terrasoft.BaseSchemaViewModel#onRender
			 * @overridden
			 */
			onRender: function() {
				var modalBoxInnerBoxEl = this.Ext.get(this.renderTo);
				if (modalBoxInnerBoxEl && this.Ext.isFunction(modalBoxInnerBoxEl.parent)) {
					var modalBoxEl = modalBoxInnerBoxEl.parent();
					if (modalBoxEl) {
						modalBoxEl.addCls("supply-payment-products-modal-box");
					}
				}
				this.updateSize(this.get("MinWidth"), this.get("MinHeight") + 50);
			},

			/**
			 * Выполняется при закрытии модального окна.
			 * @protected
			 */
			closeWindow: function() {
				this.destroyModule();
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "gridContainer",
				"index": 0,
				"propertyName": "items",
				"values": {
					"id": "gridContainer",
					"selectors": {"wrapEl": "#gridContainer"},
					"wrapClass": ["grid-container"],
					"markerValue": "supplyPaymentGridContainer",
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "DataGrid",
				"parentName": "gridContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.GRID,
					"className": "Terrasoft.ConfigurationGrid",
					"generator": "ConfigurationGridGenerator.generatePartial",
					"generateControlsConfig": {"bindTo": "generateActiveRowControlsConfig"},
					"multiSelect": false,
					"rowDataItemMarkerColumnName": "OrderProduct",
					"unSelectRow": {"bindTo": "unSelectRow"},
					"onGridClick": {"bindTo": "onGridClick"},
					"listedZebra": true,
					"initActiveRowKeyMap": {"bindTo": "initActiveRowKeyMap"},
					"collection": {"bindTo": "Collection"},
					"activeRow": {"bindTo": "ActiveRow"},
					"primaryColumnName": "Id",
					"isEmpty": {"bindTo": "IsGridEmpty"},
					"isLoading": {"bindTo": "IsGridLoading"},
					"selectedRows": {"bindTo": "SelectedRows"},
					"type": "listed",
					"listedConfig": {
						"name": "DataGridListedConfig",
						"items": [
							{
								"name": "OrderProductListedGridColumn",
								"bindTo": "OrderProduct",
								"position": {"column": 1, "colSpan": 12}
							},
							{
								"name": "UsedQuantityListedGridColumn",
								"bindTo": "UsedQuantity",
								"position": {"column": 13, "colSpan": 4}
							},
							{
								"name": "MaxQuantityListedGridColumn",
								"bindTo": "MaxQuantity",
								"position": {"column": 17, "colSpan": 4}
							},
							{
								"name": "UsedAmountListedGridColumn",
								"bindTo": "UsedAmount",
								"position": {"column": 21, "colSpan": 4}
							}
						]
					},
					"tiledConfig": {
						"name": "DataGridTiledConfig",
						"grid": {"columns": 24, "rows": 1},
						"items": [
							{
								"name": "OrderProductTiledGridColumn",
								"bindTo": "OrderProduct",
								"position": {"row": 1, "column": 1, "colSpan": 12}
							},
							{
								"name": "UsedQuantityTiledGridColumn",
								"bindTo": "UsedQuantity",
								"position": {"row": 1, "column": 13, "colSpan": 4}
							},
							{
								"name": "MaxQuantityTiledGridColumn",
								"bindTo": "MaxQuantity",
								"position": {"row": 1, "column": 17, "colSpan": 4}
							},
							{
								"name": "UsedAmountTiledGridColumn",
								"bindTo": "UsedAmount",
								"position": {"row": 1, "column": 21, "colSpan": 4}
							}
						]
					}
				}
			},
			{
				"operation": "insert",
				"name": "fixedAreaContainer",
				"index": 1,
				"values": {
					"id": "fixedAreaContainer",
					"selectors": {"wrapEl": "#fixedAreaContainer"},
					"wrapClass": ["fixed-area-container"],
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"propertyName": "items",
				"name": "headContainer",
				"parentName": "fixedAreaContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["header"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "headContainer",
				"propertyName": "items",
				"name": "headerNameContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["header-name-container", "header-name-container-full"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "headContainer",
				"propertyName": "items",
				"name": "closeIconContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["header-name-container", "header-name-container-full"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "closeIconButton",
				"parentName": "closeIconContainer",
				"propertyName": "items",
				"values": {
					"click": {"bindTo": "closeWindow"},
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"imageConfig": {"bindTo": "Resources.Images.CloseIcon"},
					"markerValue": "CloseIconButton",
					"classes": {"wrapperClass": ["close-btn-user-class"]},
					"selectors": {"wrapEl": "#headContainer"}
				}
			},
			{
				"operation": "insert",
				"parentName": "headerNameContainer",
				"propertyName": "items",
				"name": "HeaderLabel",
				"values": {
					"itemType": Terrasoft.ViewItemType.LABEL,
					"caption": {"bindTo": "Resources.Strings.HeaderCaption"}
				}
			},
			{
				"operation": "insert",
				"name": "buttonsContainer",
				"parentName": "fixedAreaContainer",
				"propertyName": "items",
				"values": {
					"id": "buttonsContainer",
					"selectors": {"wrapEl": "#buttonsContainer"},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "summaryItemContainer",
				"propertyName": "items",
				"parentName": "buttonsContainer",
				"values": {
					"id": "summaryItemContainer",
					"selectors": {"wrapEl": "#summaryItemContainer"},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["summary-item-container"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "okButton",
				"parentName": "buttonsContainer",
				"propertyName": "items",
				"values": {
					"caption": {"bindTo": "Resources.Strings.OKButtonCaption"},
					"click": {"bindTo": "saveChanges"},
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"style": Terrasoft.controls.ButtonEnums.style.BLUE,
					"maskVisible": {"bindTo": "okButtonMaskVisible"},
					"markerValue": "ButtonOK"
				}
			},
			{
				"operation": "insert",
				"name": "cancelButton",
				"parentName": "buttonsContainer",
				"propertyName": "items",
				"values": {
					"caption": {"bindTo": "Resources.Strings.CancelButtonCaption"},
					"click": {"bindTo": "closeWindow"},
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"style": Terrasoft.controls.ButtonEnums.style.DEFAULT,
					"markerValue": "ButtonCancel"
				}
			},
			{
				"operation": "insert",
				"name": "summaryItemCaption",
				"parentName": "summaryItemContainer",
				"propertyName": "items",
				"values": {
					"caption": {"bindTo": "Resources.Strings.TotalAmountCaption"},
					"itemType": Terrasoft.ViewItemType.LABEL,
					"classes": {
						"labelClass": ["summary-item-caption"]
					}
				}
			},
			{
				"operation": "insert",
				"name": "summaryItemValue",
				"parentName": "summaryItemContainer",
				"propertyName": "items",
				"values": {
					"caption": {"bindTo": "TotalAmount"},
					"itemType": Terrasoft.ViewItemType.LABEL,
					"classes": {
						"labelClass": ["summary-item-value"]
					}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
