define("ProductDetailV2", ["terrasoft", "ConfigurationEnums", "MaskHelper", "ConfigurationGrid",
		"ConfigurationGridGenerator", "ConfigurationGridUtilities"],
	function(Terrasoft, enums, MaskHelper) {
		return {
			mixins: {
				ConfigurationGridUtilites: "Terrasoft.ConfigurationGridUtilities"
			},
			attributes: {
				IsEditable: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: true
				}
			},
			messages: {
				/**
				 * @message ProductSelectionInfo
				 * Запрашивает параметры модуля подбора продутов
				 * @return {Object}
				 */
				"ProductSelectionInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message ProductSelectionSave
				 * Обрабатывает событие закрытия модуля подбора продуктов
				 */
				"ProductSelectionSave": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			methods: {
				/**
				 * Инициализация детали
				 * @protected
				 * @overriden
				 */
				init: function() {
					this.callParent(arguments);
					this.subscribeOnProductSelectionInfo();
					this.set("MultiSelect", false);
					Terrasoft.SysSettings.querySysSettings(["BasePriceList", "DefaultTax", "PriceWithTaxes"], function(values) {
						if (values.DefaultTax) {
							this.set("DefaultTax", values.DefaultTax);
						}
						if (values.BasePriceList) {
							this.set("BasePriceList", values.BasePriceList);
						}
						if (values.PriceWithTaxes) {
							this.set("PriceWithTaxes", values.PriceWithTaxes);
						}
					}, this);
				},

				/**
				 * Подписка на события модуля подбора продуктов
				 * @protected
				 */
				subscribeOnProductSelectionInfo: function() {
					this.sandbox.subscribe("ProductSelectionSave", function() {
						this.reloadGridData();
						this.fireDetailChanged();
						this.updateOrderProductCurrency();
					}, this, [this.sandbox.id + "_ProductSelectionModule"]);
					this.sandbox.subscribe("ProductSelectionInfo", function() {
						return {
							masterRecordId: this.get("MasterRecordId"),
							masterEntitySchemaName: this.get("DetailColumnName"),
							masterCurrency: this.get("Currency")
						};
					}, this, [this.sandbox.id + "_ProductSelectionModule"]);
				},

				/**
				 * Устанавливает валюту заказа тем продуктам в заказе, у которых не установлена.
				 * @virtual
				 * @protected
				 */
				updateOrderProductCurrency: function() {
					var orderId = this.get("MasterRecordId");
					if (!orderId) {
						return;
					}
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "Order"
					});
					esq.addColumn("Currency");
					esq.addColumn("CurrencyRate");
					esq.getEntity(orderId, function(result) {
						var entity = result.entity;
						if (!entity) {
							return;
						}
						var currency = entity.get("Currency");
						var currencyRate = entity.get("CurrencyRate");
						var update = this.Ext.create("Terrasoft.UpdateQuery", {
							rootSchemaName: "OrderProduct"
						});
						update.setParameterValue("Currency", currency.value, this.Terrasoft.DataValueType.GUID);
						update.setParameterValue("CurrencyRate", currencyRate, this.Terrasoft.DataValueType.MONEY);
						update.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "Order", orderId));
						update.filters.addItem(this.Terrasoft.createIsNullFilter(
							this.Ext.create("Terrasoft.ColumnExpression", {columnPath: "Currency"})));
						update.execute();
					}, this);
				},

				/**
				 * Обработчик нажатия на кнопку "Подбор продуктов"
				 * Сохраняет карточку и вызывает загрузку модуля подбора продуктов
				 * @protected
				 */
				onProductSelectionButtonClick: function() {
					var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
					var isNewRecord = (cardState.state === enums.CardStateV2.ADD ||
						cardState.state === enums.CardStateV2.COPY);
					if (isNewRecord) {
						var args = {
							isSilent: true,
							messageTags: [this.sandbox.id]
						};
						this.set("OpenProductSelectionModule", true);
						this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
					} else {
						this.loadProductSelectionModule();
					}
				},

				/**
				 * Обрабатывает сообщение о сохранении записи
				 * @protected
				 */
				onCardSaved: function() {
					if (this.get("OpenProductSelectionModule")) {
						this.loadProductSelectionModule();
						this.set("OpenProductSelectionModule", false);
						return;
					}
					this.callParent(arguments);
				},

				/**
				 * Загружает модуль подбора продуктов
				 * @protected
				 * @virtual
				 */
				loadProductSelectionModule: function() {
					var openCardConfig = {
						moduleId: this.sandbox.id,
						OpenProductSelectionModule: true,
						operation: enums.CardStateV2.EDIT
					};
					this.sandbox.publish("OpenCard", openCardConfig, [this.sandbox.id]);
				},

				/**
				 * Установка дефолтных значений для строк реестра
				 * @returns {Object}
				 */
				getGridRowViewModelConfig: function() {
					var rowConfig = this.callParent(arguments);
					if (this.getIsEditable()) {
						var defaultTax = this.get("DefaultTax");
						if (defaultTax) {
							rowConfig.values.DefaultTax = defaultTax;
						}
						var basePriceList = this.get("BasePriceList");
						if (basePriceList) {
							rowConfig.values.BasePriceList = basePriceList;
						}
						var priceWithTaxes = this.get("PriceWithTaxes");
						if (priceWithTaxes) {
							rowConfig.values.PriceWithTaxes = priceWithTaxes;
						}
						rowConfig.methods = rowConfig.methods || {};
						var scope = this;
						rowConfig.methods.onSaved = function(response, config) {
							scope.onProductSaved.call(scope);
							if (config && config.isSilent) {
								this.onSilentSaved(response, config);
							}
						};
					}
					return rowConfig;
				},

				/**
				 * Посылает сообщение карточке про изменения в детали.
				 */
				onProductSaved: function() {
					this.fireDetailChanged({});
					MaskHelper.HideBodyMask();
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#addRecordOperationsMenuItems
				 * @overridden
				 */
				addRecordOperationsMenuItems: function(toolsButtonMenu) {
					toolsButtonMenu.addItem(this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.AddButtonCaption"},
						Click: {"bindTo": "addRecord"},
						Enabled: {"bindTo": "getAddRecordButtonEnabled"}
					}));
					this.callParent(arguments);
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"className": "Terrasoft.ConfigurationGrid",
						"generator": "ConfigurationGridGenerator.generatePartial",
						"generateControlsConfig": {bindTo: "generateActiveRowControlsConfig"},
						"multiSelect": {"bindTo": "MultiSelect"},
						"changeRow": {"bindTo": "changeRow"},
						"unSelectRow": {"bindTo": "unSelectRow"},
						"onGridClick": {"bindTo": "onGridClick"},
						"activeRowActions": [
							{
								"className": "Terrasoft.Button",
								"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"tag": "save",
								"markerValue": "save",
								"imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
							},
							{
								"className": "Terrasoft.Button",
								"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"tag": "cancel",
								"markerValue": "cancel",
								"imageConfig": {"bindTo": "Resources.Images.CancelIcon"}
							},
							{
								"className": "Terrasoft.Button",
								"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								"tag": "remove",
								"markerValue": "remove",
								"imageConfig": {"bindTo": "Resources.Images.RemoveIcon"}
							}
						],
						"listedZebra": true,
						"initActiveRowKeyMap": {"bindTo": "initActiveRowKeyMap"},
						"activeRowAction": {"bindTo": "onActiveRowAction"}
					}
				},
				{
					"operation": "remove",
					"name": "AddRecordButton"
				},
				{
					"operation": "insert",
					"name": "ProductSelectionButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"index": 0,
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ProductSelection"},
						"click": {"bindTo": "onProductSelectionButtonClick"},
						"enabled": true,
						"visible": {"bindTo": "getToolsVisible"}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
