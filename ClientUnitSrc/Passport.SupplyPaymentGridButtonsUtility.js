define("SupplyPaymentGridButtonsUtility", ["SupplyPaymentElement", "SupplyPaymentGridButtonsUtilityResources",
		"OrderConfigurationConstants"],
		function(SupplyPaymentElementSchema, resources, OrderConfigurationConstants) {

	/**
	 * Утилитный модуль для работы кнопок в реестре детали "График поставок и оплат".
	 */
	Ext.define("Terrasoft.configuration.SupplyPaymentGridButtonsUtility", {
		singletone: true,
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.SupplyPaymentGridButtonsUtility",

		Ext: null,
		Terrasoft: null,

		/**
		 * Возвращает параметры кнопки реестра для колонки "Продукты".
		 * @return {Object} Параметры кнопки реестра для колонки "Продукты".
		 */
		getProductColumnConfig: function() {
			var productsColumn = SupplyPaymentElementSchema.getColumnByName("Products");
			var buttonName = productsColumn.name + "Button";
			var productButtonClickMethodName = "onProductsButtonClick";
			var clearProductButtonClickMethodName = "onClearProductsButtonClick";
			var editProductsButtonConfig = this.getButtonConfig({
				buttonName: buttonName,
				columnName: productsColumn.name,
				columnCaption: productsColumn.caption,
				clickMethodName: productButtonClickMethodName
			});
			var clearProductsButtonConfig = this.getClearProductsButtonsConfig(productsColumn.name,
					clearProductButtonClickMethodName);
			var productColumnConfig = {
				prepareResponseRow: function(row) {
					var productCount = row.get(this.detailColumn.name) || 0;
					var columnValueFormat = "";
					var productCountModulo = productCount % 10;
					var isNotTenthNumber = (((productCount % 100) - (productCount % 10)) / 10) !== 1;
					if (productCount === 0) {
						columnValueFormat = resources.localizableStrings.GridButtonAdd;
					} else if (productCountModulo === 1 && isNotTenthNumber) {
						columnValueFormat = resources.localizableStrings.GridButtonOneProduct;
					} else if (productCountModulo < 5 && isNotTenthNumber) {
						columnValueFormat = resources.localizableStrings.GridButtonLessThanFiveProducts;
					} else {
						columnValueFormat = resources.localizableStrings.GridButtonFiveAndMoreProducts;
					}
					row.set(productsColumn.name, Ext.String.format(columnValueFormat, productCount));
				},
				detailColumn: {
					name: "ProductsCount",
					modifyQuery: function(esq) {
						esq.addAggregationSchemaColumn("[SupplyPaymentProduct:SupplyPaymentElement].Id",
								Terrasoft.AggregationType.COUNT, this.name);
					}
				},
				clickMethodNames: [productButtonClickMethodName, clearProductButtonClickMethodName],
				controlConfig: {
					"name": "ProductsButtonsContainer",
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["product-buttons-container"],
					"items": [editProductsButtonConfig, clearProductsButtonConfig]
				}
			};
			return {
				name: productsColumn.name,
				config: productColumnConfig
			};
		},

		/**
		 * Возвращает конфигурацию представления кнопки очистки продуктов.
		 * @param {String} columnName Название колонки с кнопкой.
		 * @param {String} clickMethodName Название метода обработчика нажатия на кнопку.
		 * @return {Object} Конфигурация представления кнопки очистки продуктов.
		 */
		getClearProductsButtonsConfig: function(columnName, clickMethodName) {
			var buttonName = columnName + "ClearButton";
			return {
				"name": buttonName + "Container",
				"itemType": Terrasoft.ViewItemType.CONTAINER,
				"wrapClass": ["editable-grid-button", "clear-products"],
				"items": [
					{
						"name": buttonName,
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": clickMethodName},
						"visible": {
							"bindTo": "ProductsCount",
							"bindConfig": {
								"converter": function(value) {
									return Boolean(value);
								}
							}
						},
						"hint": resources.localizableStrings.ClearProductsButtonHint,
						"markerValue": columnName + "ClearProductsButton",
						"imageConfig": resources.localizableImages.CloseIcon,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT
					}
				]
			};
		},

		/**
		 * Проверка типа записи.
		 * @private
		 * @param {Object} item Елемент у которого необходимо проверить тип.
		 * @returns {Boolean}
		 */
		getIsPayment: function(item) {
			var type = item.get("Type");
			return (type && type.value) === OrderConfigurationConstants.SupplyPaymentElement.Type.Payment;
		},

		/**
		 * Обновляет значения колонки "Счет" строки реестра в зависимости от типа.
		 * @param {Terrasoft.BaseModel} supplyPaymentRow Строка реестра.
		 */
		updateInvoiceValue: function(supplyPaymentRow) {
			var invoiceColumnName = "Invoice";
			var invoice = supplyPaymentRow.get(invoiceColumnName);
			if (!this.getIsPayment(supplyPaymentRow)) {
				if (invoice) {
					supplyPaymentRow.set(invoiceColumnName, null);
				}
				return;
			}
			if (!invoice) {
				supplyPaymentRow.set(invoiceColumnName, {
					value: 1,
					displayValue: resources.localizableStrings.GridButtonCreateInvoice
				});
			}
		},

		/**
		 * Возвращает параметры кнопки реестра для колонки "Счет".
		 * @return {Object} Параметры кнопки реестра для колонки "Счет".
		 */
		getInvoiceColumnConfig: function() {
			var invoiceColumn = SupplyPaymentElementSchema.getColumnByName("Invoice");
			var buttonName = invoiceColumn.name + "Button";
			var clickMethodName = "onInvoiceButtonClick";
			var invoiceColumnConfig = {
				prepareResponseRow: this.updateInvoiceValue.bind(this),
				clickMethodNames: [clickMethodName],
				controlConfig: this.getButtonConfig({
					buttonName: buttonName,
					columnName: invoiceColumn.name,
					captionConverter: this.getDisplayValue,
					columnCaption: invoiceColumn.caption,
					clickMethodName: clickMethodName
				})
			};
			return {
				name: invoiceColumn.name,
				config: invoiceColumnConfig
			};
		},

		/**
		 * Возвращает значения для отображения для справочного значения.
		 * @param {Object} value Справочноге значение.
		 * @returns {String} Значение для отображения.
		 */
		getDisplayValue: function(value) {
			return value && (value.displayValue || value);
		},

		/**
		 * Возвращает конфигурацию представления кнопки в реестре.
		 * @param {Object} config Параметры кнопки.
		 * @param {String} config.buttonName Название кнопки.
		 * @param {String} config.columnName Название колонки.
		 * @param {String} config.columnCaption Заголовок колонки.
		 * @param {String} config.clickMethodName Название обработчика нажатия на кнопку.
		 * @param {Function} [config.captionConverter] Функция для преобразования значения в колонке в заголовок кнопки.
		 * @returns {Object} Конфигурация представления кнопки в реестре.
		 */
		getButtonConfig: function(config) {
			var captionConfig = {
				bindTo: config.columnName
			};
			if (config.captionConverter) {
				captionConfig.bindConfig = {
					"converter": config.captionConverter
				};
			}
			return {
				"name": config.buttonName + "Container",
				"itemType": Terrasoft.ViewItemType.CONTAINER,
				"wrapClass": ["editable-grid-button"],
				"items": [
					{
						"name": config.buttonName,
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": captionConfig,
						"click": {"bindTo": config.clickMethodName},
						"visible": {
							"bindTo": config.columnName,
							"bindConfig": {
								"converter": function(value) {
									return Boolean(value);
								}
							}
						},
						"markerValue": this.Ext.String.format("{0} {1}", config.columnName, config.columnCaption),
						"tag": config.columnName,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT
					}
				]
			};
		},

		/**
		 * Возвращает коллекцию параметров кастомных кнопок реестра.
		 * @return {Terrasoft.Collection} Коллекция параметров кастомных кнопок реестра.
		 */
		getCustomLinkColumns: function() {
			if (this.customLinkColumns) {
				return this.customLinkColumns;
			}
			var config = this.customLinkColumns = Ext.create("Terrasoft.Collection");
			var productColumnConfig = this.getProductColumnConfig();
			var invoiceColumnConfig = this.getInvoiceColumnConfig();
			config.add(productColumnConfig.name, productColumnConfig.config);
			config.add(invoiceColumnConfig.name, invoiceColumnConfig.config);
			return config;
		},

		/**
		 * Добавляет колонки в екземпляр запроса, необходимые для вычисления заголовка кнопок реестра.
		 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будут добавлены колонки.
		 */
		addGridDataColumns: function(esq) {
			var customColumns = this.getCustomLinkColumns();
			if (customColumns) {
				customColumns.each(function(customColumn) {
					if (customColumn.detailColumn && this.Ext.isFunction(customColumn.detailColumn.modifyQuery)) {
						customColumn.detailColumn.modifyQuery(esq);
					}
				}, this);
			}
		},

		/**
		 * Модифицирует строку данных перед загрузкой в реестр. Определяет заголовок кнопки в реестре
		 * и добавляет обработчик клика по кнопке.
		 * @param {Terrasoft.BaseViewModel} item  Элемент реестра.
		 * @param {Terrasoft.BaseViewModel} detailViewModel  Модель представления детали.
		 */
		prepareResponseCollectionItem: function(item, detailViewModel) {
			var customColumnButtons = this.getCustomLinkColumns();
			if (customColumnButtons) {
				customColumnButtons.each(function(customColumnButton) {
					if (customColumnButton.clickMethodNames) {
						this.Terrasoft.each(customColumnButton.clickMethodNames, function(clickMethodName) {
							var detailHandler = detailViewModel[clickMethodName];
							if (this.Ext.isFunction(detailHandler)) {
								item[clickMethodName] = function() {
									detailHandler.call(detailViewModel, item);
								};
							}
						}, this);
					}
					if (this.Ext.isFunction(customColumnButton.prepareResponseRow)) {
						customColumnButton.prepareResponseRow(item, detailViewModel);
					}
					item.parentDetailViewModel = detailViewModel;
					this.decorateItemLoadEntity(item, detailViewModel);
				}, this);
			}
		},

		/**
		 * Декорирует метод loadEntity модели представления строки реестра.
		 * Добавляет вызов prepareResponseCollectionItem после загрузки.
		 * @param {Terrasoft.BaseViewModel} item  Элемент реестра.
		 * @param {Terrasoft.BaseViewModel} detailViewModel  Модель представления детали.
		 */
		decorateItemLoadEntity: function(item, detailViewModel) {
			if (item.get("IsLoadEntityMethodDecorated")) {
				return;
			}
			var util = this;
			var itemLoadEntity = item.loadEntity;
			item.loadEntity = function(primaryColumnValue, callback, scope) {
				itemLoadEntity.call(item, primaryColumnValue, function(loadedItem) {
					util.prepareResponseCollectionItem(loadedItem, detailViewModel);
					if (callback) {
						callback.call(scope || this);
					}
				}, this);
			};
			item.set("IsLoadEntityMethodDecorated", true);
		},

		/**
		 * Возвращает конфигурацию представления контролов для ячейки реестра.
		 * @param {Terrasoft.EntitySchemaColumn} entitySchemaColumn Колонка ячейки реестра.
		 * @return {Object} Конфигурация представления контролов ячейки.
		 */
		getCellControlsConfig: function(entitySchemaColumn) {
			var columnName = entitySchemaColumn.name;
			var customColumnButtons = this.getCustomLinkColumns();
			var customColumnConfig = customColumnButtons.find(columnName);
			return (customColumnConfig && customColumnConfig.controlConfig) || null;
		}
	});

	var privateClassName = "Terrasoft.SupplyPaymentGridButtonsUtility";
	var instance = null;
	var initialized = false;
	var instanceConfig = {};
	var util = {
		init: function(config, className) {
			if (initialized) {
				return;
			}
			if (config) {
				instanceConfig = config;
			}
			if (className) {
				privateClassName = className;
			}
		}
	};
	Object.defineProperty(util, "instance", {
		get: function() {
			if (initialized === false) {
				instance = Ext.create(privateClassName, instanceConfig);
				initialized = true;
			}
			return instance;
		}
	});
	return util;
});
