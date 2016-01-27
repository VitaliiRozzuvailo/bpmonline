define("ProductPageV2", ["BusinessRuleModule"],
	function(BusinessRuleModule) {
		return {
			entitySchemaName: "Product",
			attributes: {
				/**
				 * Флаг, указывающий на то, что изменилась единица измерения.
				 * @type {Boolean}
				 */
				IsUnitChanged: {dataValueType: this.Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Единица измерения
				 * @type {Object}
				 */
				"Unit": {
					dependencies: [{
						columns: ["Unit"],
						methodName: "unitChanged"
					}]
				},

				/**
				 * Тип
				 * @type {Object}
				 */
				"Type": {
					dependencies: [{
						columns: ["Category"],
						methodName: "categoryChanged"
					}]
				},

				/**
				 * Базовый прайс-лист
				 * @type {Object}
				 */
				BasePriceList: {
					dataValueType: this.Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}
			},
			details: /**SCHEMA_DETAILS*/{
				/**
				 * Деталь "Остатки".
				 */
				ProductStockBalance: {
					schemaName: "ProductStockBalanceDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "Product"
					}
				},

				/**
				 * Деталь "Единицы измерения".
				 */
				ProductUnitDetail: {
					schemaName: "ProductUnitDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "Product"
					},
					subscriber: function(args) {
						args.detailName = "ProductUnitDetail";
						this.onDetailChange(args);
					}
				},

				/**
				 * Деталь "Цены".
				 */
				ProductPriceDetail: {
					schemaName: "ProductPriceDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "Product"
					},
					subscriber: function(args) {
						args.detailName = "ProductPriceDetail";
						this.onDetailChange(args);
					}
				},

				/**
				 * Деталь "Характеристики"
				 */

				ProductSpecificationDetail: {
					schemaName: "ProductSpecificationDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "Product"
					}
				}

			}/**SCHEMA_DETAILS*/,
			rules: {
				/**
				 * Бизнес-правило взаимофильтрации и автозаполнения полей Тип и Категория.
				 */
				"Type": {
					"FiltrationCategoryByType": {
						ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
						autocomplete: true,
						autoClean: true,
						baseAttributePatch: "Category",
						comparisonType: this.Terrasoft.ComparisonType.EQUAL,
						type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						attribute: "Category"
					}
				}
			},
			methods: {

				/**
				 * Иницализирует начальные значения.
				 * @private
				 */
				init: function() {
					Terrasoft.SysSettings.querySysSettingsItem("BasePriceList", function(value) {
						this.set("BasePriceList", value);
					}, this);
					this.callParent(arguments);
				},

				/**
				 * Вызывает метод обновления для детали Единицы измерения.
				 * @protected
				 */
				updateProductUnitDetail: function() {
					this.updateDetail({detail: "ProductUnitDetail", reloadAll: true});
				},

				/**
				 * Вызывает метод обновления для детали Единицы измерения
				 * @protected
				 */
				updateProductPriceDetail: function() {
					this.updateDetail({detail: "ProductPriceDetail", reloadAll: true});
				},

				/**
				 * Обрабатывает событие изменения на детали.
				 * @protected
				 * @param {Object} args Аргументы.
				 */
				onDetailChange: function(args) {
					if (args.action === "edit" && args.detailName === "ProductUnitDetail") {
						this.Terrasoft.each(args.rows, function(itemKey) {
							if (!itemKey) {
								return;
							}
							var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "ProductUnit"
							});
							esq.addColumn("IsBase");
							esq.addColumn("Unit");
							esq.getEntity(itemKey, function(response) {
								if (response.success) {
									var item = response.entity;
									if (item.get("IsBase")) {
										this.set("Unit", item.get("Unit"));
									}
								}
							}, this);
						}, this);
					}
					if (args.action === "edit" && args.detailName === "ProductPriceDetail") {
						this.Terrasoft.each(args.rows, function(itemKey) {
							var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "ProductPrice"
							});
							esq.addColumn("Price");
							esq.addColumn("Tax");
							esq.addColumn("PriceList");
							esq.addColumn("Currency");
							esq.getEntity(itemKey, function(response) {
								if (response.success) {
									var item = response.entity;
									var basePriceList = this.get("BasePriceList");
									var priceList = item.get("PriceList");
									if (basePriceList && priceList &&
										(item.get("PriceList").value === basePriceList.value)) {
										if (item.get("Price")) {
											this.set("Price", item.get("Price"));
										}
										if (item.get("Tax")) {
											this.set("Tax", item.get("Tax"));
										}
										if (item.get("Currency")) {
											this.set("Currency", item.get("Currency"));
										}
									}
								}
							}, this);
						}, this);
					}
				},

				/**
				 * Выполняет обработку изменния поля "Единица измерения".
				 * @protected
				 */
				unitChanged: function() {
					this.set("IsUnitChanged", true);
				},

				/**
				 * Выполняет обработку изменния поля "Категория".
				 * @protected
				 */
				categoryChanged: function() {
					this.set("Type", null);
				},

				/**
				 * Возвращает запрос на вставку записи с признаком Базовая на деталь "Единицы измерения"
				 * при сохранении новой карточки Продукта.
				 * @protected
				 * @returns {Terrasoft.InsertQuery}
				 */
				getInsertNewUnit: function() {
					var insert = this.Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "ProductUnit"
					});
					insert.setParameterValue("Product", this.get("Id"), this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Unit", this.get("Unit").value, this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("IsBase", true, this.Terrasoft.DataValueType.BOOLEAN);
					insert.setParameterValue("NumberOfBaseUnits", 1, this.Terrasoft.DataValueType.FLOAT);
					return insert;
				},

				/**
				 * Выполняет обновление записи детали "Единицы измерения" после изменения поля "Единица измерения".
				 * @protected
				 */
				updateUnit: function(callback) {
					var unit = this.get("Unit");
					if (this.get("IsUnitChanged") && !this.Ext.isEmpty(unit) || this.isNewMode()) {
						var update = this.Ext.create("Terrasoft.UpdateQuery", {
							rootSchemaName: "ProductUnit"
						});
						var filters = update.filters;
						var idProduct = this.get("Id");
						var idFilter = this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "Product", idProduct);
						filters.add("IdFilter", idFilter);
						var isBaseFilter = this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "IsBase", true);
						filters.add("isBaseFilter", isBaseFilter);
						update.setParameterValue("Unit", unit.value, this.Terrasoft.DataValueType.GUID);
						update.execute(function(response) {
							this.set("IsUnitChanged", false);
							if (response.rowsAffected === 0) {
								this.getInsertNewUnit().execute(callback, this);
							} else {
								callback.call(this);
							}
						}, this);
					} else if (callback) {
						callback.call(this);
					}
				},

				/**
				 * Получает запрос на изменение данных записи единицы измерения с признаком Базовая.
				 * @protected
				 * @param {Object} config Конфигурационный объект.
				 * @returns {Terrasoft.UpdateQuery} Возвращает Запрос на изменение данных.
				 */
				getProductUnitUpdateQuery: function(config) {
					var update = this.Ext.create("Terrasoft.UpdateQuery", {
						rootSchemaName: "ProductUnit"
					});
					var oldNumberOfBaseUnits =
						(this.Ext.isEmpty(config.oldNumberOfBaseUnits) ||
							config.oldNumberOfBaseUnits === 0) ? 1 : config.oldNumberOfBaseUnits;
					var newNumberOfBaseUnits = config.numberOfBaseUnits / oldNumberOfBaseUnits;
					var filters = update.filters;
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Product", this.get("Id")));
					filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Id", config.id));
					update.setParameterValue("IsBase", config.isBase, this.Terrasoft.DataValueType.BOOLEAN);
					update.setParameterValue("NumberOfBaseUnits", newNumberOfBaseUnits,
						this.Terrasoft.DataValueType.FLOAT);
					return update;
				},

				/**
				 * Пересчитывает единицы измерения для продукта при изменении поля Единица измерения.
				 * @param {Object} productUnit Конфигурационный объект продукта.
				 * @param {Object} callback Функция обратного вызова.
				 */
				reCalculateUnits: function(productUnit, callback) {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "ProductUnit"
					});
					esq.addColumn("Id");
					esq.addColumn("Product");
					esq.addColumn("Unit");
					esq.addColumn("IsBase");
					esq.addColumn("NumberOfBaseUnits");
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Product.Id", this.get("Id")));
					esq.getEntityCollection(function(response) {
						if (response.success) {
							var batch = this.Ext.create("Terrasoft.BatchQuery");
							response.collection.each(function(item) {
								var update;
								if (this.get("Unit").value !== item.get("Unit").value) {
									update = this.getProductUnitUpdateQuery({
										id: item.get("Id"),
										numberOfBaseUnits: item.get("NumberOfBaseUnits"),
										oldNumberOfBaseUnits: productUnit.NumberOfBaseUnits,
										isBase: false
									});
								} else {
									update = this.getProductUnitUpdateQuery({
										id: item.get("Id"),
										numberOfBaseUnits: 1,
										oldNumberOfBaseUnits: 1,
										isBase: true
									});
								}
								batch.add(update, function() {}, this);
							}, this);
							batch.execute(function() {
								callback.call(this);
							}, this);
						} else {
							callback.call(this);
						}
					}, this);
				},

				/**
				 * Производит синхронизацию поля Единица измерения с деталью Единицы измерения.
				 * Выбрать запись:
				 * 1) Есть такая не базовая - пересчет + установка этой записи базовой;
				 * 2) Нет такой - обновляем значение базовой.
				 * @param {Object} response Ответ сервера.
				 */
				synchronizeUnit: function(response) {
					if (response.success && response.collection.getCount() > 0) {
						this.set("NeedRecalculateUnits", {
							resultCollection: response.collection.getItems()[0]
						});
					} else {
						this.set("NeedRecalculateUnits", false);
					}
				},

				/**
				 * Возвращает запрос базовой единицы продукта.
				 * @protected
				 * @returns {Terrasoft.EntitySchemaQuery}
				 */
				getProductUnitEsq: function() {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "ProductUnit"
					});
					esq.addColumn("Id");
					esq.addColumn("Product");
					esq.addColumn("Unit");
					esq.addColumn("IsBase");
					esq.addColumn("NumberOfBaseUnits");
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Product.Id", this.get("Id")));
					var unit = this.get("Unit");
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Unit.Id", unit.value));
					return esq;
				},

				/**
				 * Выполняет вставку записи базового прайс-листа на деталь "Цены"
				 * при сохранении новой карточки Продукта.
				 * @protected
				 * @param {Object} callback Функция обратного вызова.
				 */
				insertBasePrice: function(callback) {
					var basePriceList = this.get("BasePriceList");
					if (basePriceList) {
						var insert = this.Ext.create("Terrasoft.InsertQuery", {
							rootSchemaName: "ProductPrice"
						});
						insert.setParameterValue("Product", this.get("Id"), this.Terrasoft.DataValueType.GUID);
						var currency = this.get("Currency");
						if (this.Ext.isEmpty(currency)) {
							currency = {value: null};
						}
						insert.setParameterValue("Currency", currency.value, this.Terrasoft.DataValueType.GUID);
						var tax = this.get("Tax");
						if (this.Ext.isEmpty(tax)) {
							tax = {value: null};
						}
						insert.setParameterValue("Tax", tax.value, this.Terrasoft.DataValueType.GUID);
						insert.setParameterValue("PriceList", basePriceList.value, this.Terrasoft.DataValueType.GUID);
						insert.setParameterValue("Price", this.get("Price"), this.Terrasoft.DataValueType.FLOAT);
						insert.execute(callback, this);
					} else {
						callback.call(this);
					}
				},

				/**
				 * Производит синхронизацию полей Цена, Валюта, Налог с записью на детали Цены,
				 * у которой значение прайс-лист соответствует системной настройке "Базовый прайс-лист".
				 * @protected
				 * @param {Object} response Ответ сервера.
				 * @param {Object} config Конфигурационный объект.
				 */
				synchronizePrice: function(response, config) {
					if (!response) {
						this.insertBasePrice(function() {
							this.updateProductPriceDetail();
							this.updateProductUnitDetail();
							this.onSaved(false, config);
						});
					} else {
						this.updateProductPriceDetail();
						this.updateProductUnitDetail();
						this.onSaved(false, config);
					}
				},

				/**
				 * Возвращает запрос на обновление базовой цены продукта.
				 * @protected
				 * @returns {Terrasoft.UpdateQuery}
				 */
				getUpdateBasePrice: function() {
					var update = this.Ext.create("Terrasoft.UpdateQuery", {
						rootSchemaName: "ProductPrice"
					});
					var filters = update.filters;
					var idProduct = this.get("Id");
					var idFilter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Product", idProduct);
					filters.add("IdFilter", idFilter);
					var basePriceList = this.get("BasePriceList");
					var isBaseFilter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "PriceList", basePriceList.value);
					filters.add("isBaseFilter", isBaseFilter);
					update.setParameterValue("Price", this.get("Price"), this.Terrasoft.DataValueType.FLOAT);
					var currency = this.get("Currency");
					if (this.Ext.isEmpty(currency)) {
						currency = {value: null};
					}
					update.setParameterValue("Currency", currency.value, this.Terrasoft.DataValueType.GUID);
					var tax = this.get("Tax");
					if (this.Ext.isEmpty(tax)) {
						tax = {value: null};
					}
					update.setParameterValue("Tax", tax.value, this.Terrasoft.DataValueType.GUID);
					return update;
				},

				/**
				 * Выполняет дополнительные действия после сохранения записи.
				 * @protected
				 * @overriden
				 * @param {Boolean} needSynchronize Флаг, нужна ли синхронизация.
				 * @param {Object} config Конфигурационный объект.
				 * @returns {Boolean} Успешность сохранения.
				 */
				onSaved: function(needSynchronize, config) {
					var basePriceList = this.get("BasePriceList");
					if (needSynchronize && this.validate()) {
						var batchQuery = Ext.create("Terrasoft.BatchQuery");
						batchQuery.add(this.getProductUnitEsq());
						if (basePriceList) {
							batchQuery.add(this.getUpdateBasePrice());
						}
						batchQuery.execute(function(response) {
							if (response.success) {
								var resultUnitSync = response.queryResults[0];
								var resultUpdateBasePriceSync =
									(basePriceList) ? response.queryResults[1].rowsAffected : 0;
								if (resultUnitSync.rows.length) {
									this.reCalculateUnits(resultUnitSync.rows[0], function() {
										this.synchronizePrice(resultUpdateBasePriceSync, config);
									});
								} else {
									this.updateUnit(function() {
										this.synchronizePrice(resultUpdateBasePriceSync, config);
									});
								}
							}
						}, this);
						return false;
					}
					this.callParent(arguments);
				}
			},
			diff: /**SCHEMA_DIFF*/[
// Tabs and groups
				{
					"operation": "insert",
					"name": "ProductPricesTab",
					"index": 2,
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.PricesTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ProductSpecificationTab",
					"index": 3,
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.SpecificationTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ProductCategoryControlGroup",
					"parentName": "ProductGeneralInfoTab",
					"propertyName": "items",
					"index": 1,
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.CategoryGroupCaption"},
						"items": [],
						"controlConfig": {
							"collapsed": false
						}
					}
				},
				{
					"operation": "insert",
					"name": "ProductCategoryBlock",
					"parentName": "ProductCategoryControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "merge",
					"name": "PriceControlGroup",
					"parentName": "ProductGeneralInfoTab",
					"propertyName": "items",
					"index": 2,
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.BasePriceGroupCaption"}
					}
				},
// Columns and details
				{
					"operation": "insert",
					"parentName": "ProductPricesTab",
					"propertyName": "items",
					"name": "ProductPriceDetail",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "ProductPricesTab",
					"propertyName": "items",
					"name": "ProductStockBalance",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "ProductSpecificationTab",
					"propertyName": "items",
					"name": "ProductSpecificationDetail",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "ProductGeneralInfoTab",
					"propertyName": "items",
					"name": "ProductUnitDetail",
					"index": 3,
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "move",
					"name": "Code",
					"parentName": "ProductGeneralInfoBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "Code",
						"layout": {"column": 0, "row": 0, "colSpan": 12}
					}
				},
				{
					"operation": "move",
					"name": "Owner",
					"parentName": "ProductGeneralInfoBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "Owner",
						"layout": {"column": 12, "row": 0, "colSpan": 12}
					}
				},
				{
					"operation": "move",
					"name": "URL",
					"parentName": "ProductGeneralInfoBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "URL",
						"layout": {"column": 0, "row": 1, "colSpan": 12}
					}
				},
				{
					"operation": "move",
					"name": "IsArchive",
					"parentName": "ProductGeneralInfoBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "IsArchive",
						"layout": {"column": 12, "row": 1, "colSpan": 12}
					}
				},
				{
					"operation": "move",
					"name": "Unit",
					"parentName": "ProductPriceBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "Unit",
						"layout": {"column": 12, "row": 1, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"name": "Category",
					"parentName": "ProductCategoryBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "Category",
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "move",
					"name": "Type",
					"parentName": "ProductCategoryBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "Type",
						"layout": {"column": 0, "row": 1, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"name": "TradeMark",
					"parentName": "ProductCategoryBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "TradeMark",
						"layout": {"column": 12, "row": 0, "colSpan": 12}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
