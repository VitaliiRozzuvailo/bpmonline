define("ProductPriceDetailPageV2", [],
	function() {
		return {
			entitySchemaName: "ProductPrice",
			attributes: {
				/**
				 * Прайс-лист
				 * @type {Terrasoft.DataValueType.LOOKUP}
				 */
				"PriceList": {
					dataValueType: Terrasoft.DataValueType.LOOKUP
				},

				/**
				 * Значение системной настройки "Базовый прайс-лист"
				 * @type {Terrasoft.DataValueType.LOOKUP}
				 */
				BasePriceList: {
					dataValueType: this.Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Значение системной настройки "Базовая валюта"
				 * @type {Terrasoft.DataValueType.LOOKUP}
				 */
				BaseCurrency: {
					dataValueType: this.Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Значение системной настройки "Налог по-умолчанию"
				 * @type {Terrasoft.DataValueType.LOOKUP}
				 */
				BaseTax: {
					dataValueType: this.Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}
			},
			methods: {
				/**
				 * Инициализирует начальные значения модели
				 * @protected
				 * @virtual
				 * @overriden
				 */
				init: function() {
					Terrasoft.SysSettings.querySysSettingsItem("BasePriceList",
						function(value) {
							this.set("BasePriceList", value);
						}, this);
					this.callParent(arguments);
				},

				/**
				 * Проверяет установлен ли базовый "Прайс-лист" для продукта
				 * @protected
				 */
				checkHasBasePriceList: function() {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "ProductPrice"
					});
					esq.addAggregationSchemaColumn("Id", this.Terrasoft.AggregationType.COUNT, "Count");
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Product.Id", this.get("Product").value));
					esq.getEntityCollection(function(response) {
						if (response.success && (response.collection.getCount() > 0 &&
								response.collection.getItems()[0].get("Count") > 0)) {
							this.set("PriceList", null);
						}
					}, this);
				},

				/**
				 * Выполняет дополнительные действия после инициализации сущности
				 * @protected
				 * @overriden
				 */
				onEntityInitialized: function() {
					this.callParent(arguments);
					if (this.isAddMode()) {
						this.checkHasBasePriceList();
					}
				},

				/**
				 * Получает запрос на изменение данных записи продукта
				 * @protected
				 * @returns {Terrasoft.UpdateQuery} Возвращает Запрос на изменение данных
				 */
				getProductUpdateQuery: function() {
					var updateProduct = this.Ext.create("Terrasoft.UpdateQuery", {
						rootSchemaName: "Product"
					});
					var product = this.get("Product");
					var filters = updateProduct.filters;
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Id", product.value));
					updateProduct.setParameterValue("Price", this.get("Price"), this.Terrasoft.DataValueType.FLOAT);
					var currency = this.get("Currency");
					if (this.Ext.isEmpty(currency)) {
						currency = {value: null};
					}
					updateProduct.setParameterValue("Currency", currency.value, this.Terrasoft.DataValueType.GUID);
					var tax = this.get("Tax");
					if (this.Ext.isEmpty(tax)) {
						tax = {value: null};
					}
					updateProduct.setParameterValue("Tax", tax.value, this.Terrasoft.DataValueType.GUID);
					return updateProduct;
				},

				/**
				 * Выполняет дополнительные действия после сохранения записи
				 * @protected
				 * @overriden
				 * @param response
				 * @param config
				 */
				onSaved: function(response, config) {
					var canSaved = (config && config.canSaved) ? config.canSaved : false;
					var priceList = this.get("PriceList");
					var basePriceList = this.get("BasePriceList");
					if (priceList && basePriceList && basePriceList.value === priceList.value && !canSaved) {
						this.getProductUpdateQuery().execute(function() {
							var info = config || {};
							info.canSaved = true;
							this.onSaved(response, info);
						}, this);
					} else {
						canSaved = true;
					}
					if (canSaved) {
						this.callParent(arguments);
					}
				},

				/**
				 * Производит пользовательскую валидацию полей сущности
				 * @protected
				 * @param callback
				 * @param scope
				 */
				validatePriceList: function(callback, scope) {
					var result = {
						success: true
					};
					if (this.isNewMode() || this.changedValues.PriceList) {
						var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "ProductPrice"
						});
						esq.addAggregationSchemaColumn("Id", this.Terrasoft.AggregationType.COUNT, "Count");
						esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "Product.Id", this.get("Product").value));
						var priceList = this.get("PriceList");
						esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "PriceList.Id", priceList.value));
						esq.getEntityCollection(function(response) {
							var unique = true;
							if (response.success) {
								unique = (response.collection.getCount() > 0 &&
									response.collection.getItems()[0].get("Count") > 0) ? false : true;
							}
							if (!unique) {
								result.message = this.get("Resources.Strings.PriceListExistsMessage");
								result.success = false;
							}
							callback.call(scope || this, result);
						}, this);
					} else {
						callback.call(scope || this, result);
					}
				},

				/**
				 * Производит асинхронную валидацию полей сущности
				 * @protected
				 * @overriden
				 * @param callback
				 * @param scope
				 */
				asyncValidate: function(callback, scope) {
					this.callParent([function(response) {
						if (!this.validateResponse(response)) {
							return;
						}
						this.Terrasoft.chain(
							function(next) {
								this.validatePriceList(function(response) {
									if (this.validateResponse(response)) {
										next();
									}
								}, this);
							},
							function(next) {
								callback.call(scope, response);
								next();
							}, this);
					}, this]);
				},

				/**
				 *  Возвращает пустую коллекцию действий карточки, если схема не администрируется по записям
				 *  УДАЛИТЬ КОГДА ИСПРАВЯТ В БАЗОВОЙ ВЕРСИИ
				 * @returns {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий карточки
				 */
				getActions: function() {
					var parentActions = this.callParent(arguments);
					if (parentActions && !this.getSchemaAdministratedByRecords()) {
						parentActions.clear();
					}
					return parentActions;
				}
			},
			diff: /**SCHEMA_DIFF*/[
// Tabs
				{
					"operation": "merge",
					"name": "Tabs",
					"values": {
						"visible": false
					}
				},

// Columns and details
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Product",
					"values": {
						"bindTo": "Product",
						"layout": { "column": 0, "row": 0, "colSpan": 12 },
						"enabled": false,
						"controlConfig": {
							"enableRightIcon": false
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Price",
					"values": {
						"bindTo": "Price",
						"layout": { "column": 12, "row": 0, "colSpan": 12 }
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "PriceList",
					"values": {
						"bindTo": "PriceList",
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": { "column": 0, "row": 1, "colSpan": 12 },
						"enabled": {"bindTo": "isNewMode"}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Currency",
					"values": {
						"bindTo": "Currency",
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": { "column": 12, "row": 1, "colSpan": 12 }
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Tax",
					"values": {
						"bindTo": "Tax",
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": { "column": 12, "row": 2, "colSpan": 12 }
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});