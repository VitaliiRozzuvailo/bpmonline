define("ProductPageV2", ["MoneyModule", "MultiCurrencyEdit", "MultiCurrencyEditUtilities",
		"css!ProductManagementBaseCss"],
	function(MoneyModule) {
		return {
			entitySchemaName: "Product",
			attributes: {
				/**
				 *
				 */
				"Owner": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					lookupListConfig: {
						filter: function() {
							return Terrasoft.createColumnIsNotNullFilter("[SysAdminUnit:Contact].Id");
						}
					}
				},
				/**
				 *
				 */
				"Unit": {
					"isRequired": true
				},
				/**
				 * Цена б.в.
				 * @private
				 */
				"PrimaryPrice": {
					"dataValueType": Terrasoft.DataValueType.FLOAT,
					"dependencies": [
						{
							"columns": ["CurrencyRate", "Price"],
							"methodName": "recalculatePrimaryPrice"
						}
					]
				},
				/**
				 * Курс валюты.
				 * @private
				 */
				"CurrencyRate": {
					"dataValueType": Terrasoft.DataValueType.FLOAT,
					"dependencies": [
						{
							"columns": ["Currency"],
							"methodName": "setCurrencyRate"
						}
					]
				}
			},
			details: /**SCHEMA_DETAILS*/{
				/**
				 *
				 */
				Files: {
					schemaName: "FileDetailV2",
					entitySchemaName: "ProductFile",
					filter: {
						masterColumn: "Id",
						detailColumn: "Product"
					}
				}
			}/**SCHEMA_DETAILS*/,
			mixins: {

				/**
				 * Миксин управления мультивалютностью в карточке редактирования.
				 */
				MultiCurrencyEditUtilities: "Terrasoft.MultiCurrencyEditUtilities"
			},
			methods: {

				/**
				 * @inheritdoc Terrasoft.BasePageV2#init
				 * @overridden
				 */
				init: function() {
					this.mixins.MultiCurrencyEditUtilities.init.call(this);
					this.callParent(arguments);
				},

				/**
				 * @inheritDoc BasePageV2#onEntityInitialized
				 * @overridden
				 */
				onEntityInitialized: function() {
					this.callParent(arguments);
					this.setCurrencyRate();
				},

				/**
				 * Устанавливает идентификатор контекстной справки.
				 * @protected
				 */
				initContextHelp: function() {
					this.set("ContextHelpId", 1056);
					this.callParent(arguments);
				},

				/**
				 * Вызывается перед вызовом диалогового окна выбора изображения.
				 * @returns {boolean}
				 */
				beforePhotoFileSelected: function() {
					return true;
				},

				/**
				 * Получает сформированную ссылку на изображение.
				 * @protected
				 * @returns {String}
				 */
				getPhotoSrcMethod: function() {
					var primaryImageColumnValue = this.get(this.primaryImageColumnName);
					if (primaryImageColumnValue) {
						return this.getSchemaImageUrl(primaryImageColumnValue);
					}
					return this.Terrasoft.ImageUrlBuilder.getUrl(this.get("Resources.Images.DefaultPhoto"));
				},

				/**
				 * Обрабатывает изменение и загрузку изображения.
				 * @param photo
				 */
				onPhotoChange: function(photo) {
					if (!photo) {
						this.set(this.primaryImageColumnName, null);
						return;
					}
					this.Terrasoft.ImageApi.upload({
						file: photo,
						onComplete: this.onPhotoUploaded,
						onError: this.Terrasoft.emptyFn,
						scope: this
					});
				},

				/**
				 * Осуществляет установку загруженных данных изображения в модель представления.
				 * @param imageId
				 */
				onPhotoUploaded: function(imageId) {
					var imageData = {
						value: imageId,
						displayValue: "Picture"
					};
					this.set(this.primaryImageColumnName, imageData);
				},

				/**
				 * Возвращает коэффициент деления валюты.
				 * @protected
				 */
				getCurrencyDivision: function() {
					var currency = this.get("Currency");
					return currency && currency.Division;
				},

				/**
				 * Пересчитывает цену б.в.
				 * @protected
				 */
				recalculatePrimaryPrice: function() {
					var price = this.get("Price");
					if (this.Ext.isEmpty(price)) {
						this.set("PrimaryPrice", null);
						return;
					}
					var division = this.getCurrencyDivision();
					MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "Price", "PrimaryPrice", division);
				},

				/**
				 * Устанавливает курс валюты.
				 * @protected
				 */
				setCurrencyRate: function() {
					MoneyModule.LoadCurrencyRate.call(this, "Currency", "CurrencyRate", new Date());
				}
			},
			diff: /**SCHEMA_DIFF*/[
// Header
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "PhotoContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["product-image-edit-container"],
						"layout": {"column": 0, "row": 0, "rowSpan": 2, "colSpan": 3},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "PhotoContainer",
					"propertyName": "items",
					"name": "Photo",
					"values": {
						"getSrcMethod": "getPhotoSrcMethod",
						"onPhotoChange": "onPhotoChange",
						"beforeFileSelected": "beforePhotoFileSelected",
						"readonly": false,
						"generator": "ImageCustomGeneratorV2.generateCustomImageControl"
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Name",
					"values": {
						"layout": {"column": 3, "row": 0, "colSpan": 20},
						"labelWrapConfig": {"classes": {"wrapClassName": ["page-header-label-wrap"]}}
					}
				},
// Tabs
				{
					"operation": "insert",
					"name": "ProductGeneralInfoTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": { "bindTo": "Resources.Strings.GeneralInfoTabCaption" },
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ProductFilesTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": { "bindTo": "Resources.Strings.FilesTabCaption" },
						"items": []
					}
				},
// Control groups
				{
					"operation": "insert",
					"name": "CommonControlGroup",
					"parentName": "ProductGeneralInfoTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"controlConfig": {
							"collapsed": false
						}
					}
				},
				{
					"operation": "insert",
					"name": "PriceControlGroup",
					"parentName": "ProductGeneralInfoTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption":  { "bindTo": "Resources.Strings.PriceGroupCaption" },
						"items": [],
						"controlConfig": {
							"collapsed": false
						}
					}
				},
				{
					"operation": "insert",
					"name": "NotesControlGroup",
					"parentName": "ProductFilesTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"caption": { "bindTo": "Resources.Strings.NotesGroupCaption" },
						"controlConfig": {
							"collapsed": false
						}
					}
				},
// Column blocks (grids)
				{
					"operation": "insert",
					"name": "ProductGeneralInfoBlock",
					"parentName": "CommonControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ProductPriceBlock",
					"parentName": "PriceControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
// Columns and details
				{
					"operation": "insert",
					"name": "Type",
					"parentName": "ProductGeneralInfoBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "Type",
						"layout": { "column": 0, "row": 0, "colSpan": 12 },
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"name": "Unit",
					"parentName": "ProductGeneralInfoBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "Unit",
						"layout": { "column": 12, "row": 0, "colSpan": 12 },
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"name": "Code",
					"parentName": "ProductGeneralInfoBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "Code",
						"layout": { "column": 0, "row": 1, "colSpan": 12 }
					}
				},
				{
					"operation": "insert",
					"name": "Owner",
					"parentName": "ProductGeneralInfoBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "Owner",
						"layout": { "column": 12, "row": 1, "colSpan": 12 }
					}
				},
				{
					"operation": "insert",
					"name": "URL",
					"parentName": "ProductGeneralInfoBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "URL",
						"layout": { "column": 0, "row": 2, "colSpan": 12 }
					}
				},
				{
					"operation": "insert",
					"name": "IsArchive",
					"parentName": "ProductGeneralInfoBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "IsArchive",
						"layout": { "column": 12, "row": 2, "colSpan": 12 }
					}
				},
				{
					"operation": "insert",
					"name": "Price",
					"parentName": "ProductPriceBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "Price",
						"layout": { "column": 0, "row": 0, "colSpan": 12 },
						"primaryAmount": "PrimaryPrice",
						"currency": "Currency",
						"rate": "CurrencyRate",
						"primaryAmountEnabled": false,
						"rateEnabled": false,
						"generator": "MultiCurrencyEditViewGenerator.generate"
					}
				},
				{
					"operation": "insert",
					"name": "Tax",
					"parentName": "ProductPriceBlock",
					"propertyName": "items",
					"values": {
						"bindTo": "Tax",
						"layout": { "column": 12, "row": 0, "colSpan": 12 },
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"parentName": "ProductFilesTab",
					"propertyName": "items",
					"index": 0,
					"name": "Files",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "NotesControlGroup",
					"propertyName": "items",
					"name": "Notes",
					"values": {
						"contentType": Terrasoft.ContentType.RICH_TEXT,
						"layout": {"column": 0, "row": 0, "colSpan": 24},
						"labelConfig": {
							"visible": false
						},
						"controlConfig": {
							"imageLoaded": {
								"bindTo": "insertImagesToNotes"
							},
							"images": {
								"bindTo": "NotesImagesCollection"
							}
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
