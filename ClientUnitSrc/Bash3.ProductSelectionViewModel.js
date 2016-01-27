define("ProductSelectionViewModel", ["ProductSelectionViewModelResources", "MoneyModule", "MaskHelper",
        "ProductUtilitiesV2", "ProductManagementDistributionConstants"],
    function(resources, MoneyModule, MaskHelper, ProductUtilities, DistributionConstants) {

        /**
         * Генерирует конфигурацию модели представления модуля выбора продуктов
         * @param {Object} sandbox
         * @param {Object} Terrasoft
         * @param {Object} Ext
         * @return {Object}
         */
        function generate(sandbox, Terrasoft, Ext) {
            var viewModelConfig = {
                columns: {
                    /**
                     * Наименование продукта
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    Name: {
                        type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                        name: "Name"
                    },

                    /**
                     * Цена продукта
                     * @type {Terrasoft.dataValueType.FLOAT}
                     */
                    Price: {
                        type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                        name: "Price"
                    },

                    /**
                     * Доступность продукта на складах
                     * @type {Terrasoft.dataValueType.FLOAT}
                     */
                    Available: {
                        type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                        name: "Available"
                    },

                    /**
                     * Количество продуктов
                     * @type {Terrasoft.dataValueType.FLOAT}
                     */
                    Count: {
                        type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                        name: "Count"
                    },

                    /**
                     * Единица измерения
                     * @type {Terrasoft.dataValueType.LOOKUP}
                     */
                    Unit: {
                        type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                        name: "Unit"
                    },

                    /**
                     * Сообщение о выбранных в документе продуктах
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    AvailableIn: {
                        type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                        name: "AvailableIn"
                    },

                    /**
                     * Количество выбранных в документе продуктов
                     * @type {Terrasoft.dataValueType.FLOAT}
                     */
                    AvailableInCount: {
                        type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                        name: "AvailableInCount"
                    }
                },
                values: {
                    /**
                     * Название схемы
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    EntitySchemaName: "Product",

                    /**
                     * Схема
                     * @type {Object}
                     */
                    EntitySchema: null,

                    /**
                     * Название схемы детали
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    ProductDetailEntitySchemaName: null,

                    /**
                     * Схема детали
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    MasterEntitySchemaName: null,

                    /**
                     * Идентификатор записи детали
                     * @type {Terrasoft.dataValueType.GUID}
                     */
                    MasterRecordId: null,

                    /**
                     * Запись детали
                     * @type {Object}
                     */
                    MasterEntity: null,

                    /**
                     * Текущее представление
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    CurrentDataView: "GridDataView",

                    /**
                     * Коллекция представлений модуля
                     * @type {Terrasoft.Collection}
                     */
                    DataViews: null,

                    /**
                     * Коллекция записей реестра
                     * @type {Terrasoft.Collection}
                     */
                    GridData: new Terrasoft.Collection(),

                    /**
                     * Коллекция записей реестра представления
                     * @type {Terrasoft.Collection}
                     */
                    DataViewGridCollection: new Terrasoft.Collection(),

                    /**
                     * Коллекция записей реестра представления корзины
                     * @type {Terrasoft.Collection}
                     */
                    BasketViewGridCollection: new Terrasoft.Collection(),

                    /**
                     * Коллекция фильтров каталога
                     * @type {Object}
                     */
                    CatalogueFilters: null,

                    /**
                     * Значение системной настройки "Базовый прайс-лист"
                     * @type {Object}
                     */
                    BasePriceList: null,

                    /**
                     * Заголовок колонки Код
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    CodeLabel: resources.localizableStrings.CodeCaption,

                    /**
                     * Заголовок колонки Название
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    NameLabel: resources.localizableStrings.NameCaption,

                    /**
                     * Заголовок колонки Цена
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    PriceLabel: resources.localizableStrings.PriceCaption,

                    /**
                     * Заголовок колонки Доступно
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    AvailableLabel: resources.localizableStrings.AvailableCaption,

                    /**
                     * Заголовок колонки Количество
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    CountLabel: resources.localizableStrings.CountCaption,

                    /**
                     * Заголовок колонки Единица измерения
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    UnitLabel: resources.localizableStrings.UnitCaption,

                    /**
                     * Название модуля
                     * @type {Terrasoft.dataValueType.TEXT}
                     */
                    ModuleName: "ProductSelectionModule",

                    /**
                     * Признак того, что нужно пересчитать продукт.
                     * @type {Boolean}
                     */
                    NeedRecalc: false,

                    /**
                     * Признак того, что нужно сохранить набор после пересчета.
                     * @type {Boolean}
                     */
                    NeedSave: false
                },
                methods: {
                    /**
                     *
                     */
                    onGetItemConfig: function() {
                        //console.log(arguments);
                    },

                    /**
                     * Заполняет коллекцию элементов колонки Единицы измерения.
                     * @protected
                     * @param {Terrasoft.Collection} filter Фильтр.
                     * @param {Terrasoft.Collection} list Коллекция элементов колонки.
                     */
                    fillUnitItems: function(filter, list) {
                        if (list === null) {
                            return;
                        }
                        list.clear();
                        var select = Ext.create("Terrasoft.EntitySchemaQuery", {
                            rootSchemaName: "Unit"
                        });
                        select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
                        var column = select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "Name");
                        column.orderDirection = Terrasoft.OrderDirection.ASC;
                        column.orderPosition = 0;
                        select.addColumn("[ProductUnit:Unit:Id].NumberOfBaseUnits", "NumberOfBaseUnits");
                        select.addColumn("[ProductUnit:Unit:Id].IsBase", "IsBase");
                        select.rowCount = -1;
                        var productKey = this.get("RealRecordId") || this.get("Id");
                        select.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                            "[ProductUnit:Unit:Id].Product.Id", productKey));
                        select.getEntityCollection(function(result) {
                            var collection = result.collection;
                            var columns = {};
                            if (collection && collection.collection.length > 0) {
                                Terrasoft.each(collection.collection.items, function(item) {
                                    var id = item.get("Id");
                                    var it = {
                                        displayValue: item.get("Name"),
                                        value: id,
                                        NumberOfBaseUnits: item.get("NumberOfBaseUnits"),
                                        IsBase: item.get("IsBase")
                                    };
                                    if (!list.contains(id)) {
                                        columns[id] = it;
                                    }
                                }, this);
                                list.loadAll(columns);
                            }
                        }, this);
                    },
// Initialization
                    /**
                     * Инициализирует модуль подбора продуктов.
                     * @protected
                     * @param {Object} config Конфиг.
                     */
                    init: function(config) {
                        MaskHelper.ShowBodyMask();
                        this.registerMessages();
                        if (config) {
                            this.set("EntitySchema", config.EntitySchema);
                            this.set("ProductDetailEntitySchemaName", config.productDetailEntitySchemaName || null);
                            this.set("MasterEntitySchemaName", config.masterEntitySchemaName || null);
                            this.set("MasterRecordId", config.masterRecordId || null);
                            this.set("BasePriceList", config.BasePriceList);

                            this.requestMasterEntityData(this.initCallback);
                        } else {
                            this.initCallback();
                        }
                        /*var CurrentCountry = sandbox.publish("GetCountry");

                        var select = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "ProductStockBalance"});
                        select.addColumn("SxCountry");
                        select.addColumn("AvailableQuantity");
                        var filter = Terrasoft.createColumnFilterWithParameter(
                            Terrasoft.ComparisonType.EQUAL, "SxCountry", CurrentCountry);
                        select.filters.addItem(filter);
                        select.getEntityCollection(function (result) {
                            var EntityCollection = result.collection.collection.items;
                            var collectionSize = EntityCollection.length;
                            EntityCollection.forEach(function (item, i, EntityCollection) {
                                contractList.push(item.values.sxContract.value);
                            });
                            n.set("ContractList", contractList)
                        });*/
                    },

                    /**
                     * Дополнителная инициализация модуля
                     * Callback функция
                     * @protected
                     */
                    initCallback: function() {
                        Terrasoft.SysSettings.querySysSettings(["PriceWithTaxes", "PrimaryCurrency",
                            "BasePriceList", "DefaultTax"], function(values) {
                            this.set("CurrentDataView", "GridDataView");
                            this.set("PrimaryCurrency", values.PrimaryCurrency);
                            ProductUtilities.PriceWithTaxes = values.PriceWithTaxes;
                            MoneyModule.LoadCurrencyRate.call(this, "PrimaryCurrency", "PrimaryCurrencyRate", new Date(Date.now()));
                            this.subscribeMessages();
                            this.loadGridData();
                        }, this);
                    },

                    /**
                     * Запрашивает данные по записи детали.
                     * @protected
                     * @param {Function} callback функция.
                     */
                    requestMasterEntityData: function(callback) {
                        if (this.get("MasterRecordId")) {
                            var select = Ext.create("Terrasoft.EntitySchemaQuery", {
                                rootSchemaName: this.get("MasterEntitySchemaName")
                            });
                            select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
                            select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "Name");
                            select.addColumn("Currency");
                            select.addColumn("Currency.Symbol");
                            select.addColumn("Currency.ShortName");
                            select.addColumn("CurrencyRate");
                            select.addColumn("Currency.Division");
                            select.getEntity(this.get("MasterRecordId"), function(result) {
                                if (result.success) {
                                    this.set("MasterEntity", result.entity);
                                    var currencySymbol = (!Ext.isEmpty(result.entity.get("Currency.Symbol")) ?
                                            result.entity.get("Currency.Symbol") :
                                            result.entity.get("Currency.ShortName")) || "";
                                    this.setPriceCaption(currencySymbol);
                                    this.setSummaryCurrencySymbol(currencySymbol);
                                    callback.call(this);
                                }
                            }, this);
                        }
                    },

                    /**
                     * Загружает следующую порцию записей в реестр
                     * @protected
                     */
                    onLoadNext: function() {
                        if (this.get("CurrentDataView") === "GridDataView") {
                            this.loadGridData();
                        }
                    },

                    /**
                     * Регистрация событий
                     * @protected
                     */
                    registerMessages: function() {
                        var messages = {
                            /**
                             * @message CardSaved
                             * Принимает информацию, о том, что родительская страница сохранилась
                             */
                            "CardSaved": {
                                mode: Terrasoft.MessageMode.BROADCAST,
                                direction: Terrasoft.MessageDirectionType.PUBLISH
                            }

                        };
                        sandbox.registerMessages(messages);
                    },

                    /**
                     * Удаление регистрации событий
                     * @protected
                     */
                    unRegisterMessages: function() {
                        sandbox.unRegisterMessages(["ChangeDataView"]);
                    },

                    /**
                     * Подписка на события
                     * @protected
                     */
                    subscribeMessages: function() {
                        sandbox.subscribe("ChangeDataView", this.changeDataView, this,
                            ["ViewModule_MainHeaderModule_" + this.get("ModuleName")]);
                        this.initDataViews(false);
                        sandbox.subscribe("NeedHeaderCaption", function() {
                            this.initDataViews();
                        }, this);
                    },

                    /**
                     * Инициализирует верхнюю панель.
                     * @protected
                     * @param {Boolean} isCommandLineVisible
                     */
                    initDataViews: function(isCommandLineVisible) {
                        sandbox.publish("InitDataViews", {
                            caption: this.getModuleCaption(),
                            dataViews: this.getDataViews(),
                            isCommandLineVisible: isCommandLineVisible,
                            moduleName: this.get("ModuleName")
                        });
                    },

                    /**
                     * Изменяет текущее представление.
                     * @protected
                     * @param {Object} viewConfig Конфиг представления.
                     */
                    changeDataView: function(viewConfig) {
                        if (viewConfig.moduleName === this.get("ModuleName")) {
                            if (this.get("CurrentDataView") === viewConfig.tag) {
                                return;
                            }
                            var wAC = Ext.get("workingAreaContainer");
                            if (viewConfig.tag === "BasketDataView") {
                                this.set("CurrentDataView", viewConfig.tag);
                                if (!wAC.hasCls("no-folders")) {
                                    wAC.addCls("no-folders");
                                }
                                this.saveDataViewGridCollection();
                                this.loadBasketGridData();
                                sandbox.publish("UpdateQuickSearchFilterString", {
                                    newSearchStringValue: "",
                                    autoApply: false
                                });
                            } else {
                                this.set("CurrentDataView", viewConfig.tag);
                                wAC.removeCls("no-folders");
                                sandbox.publish("UpdateQuickSearchFilterString", {
                                    newSearchStringValue: this.get("QuickSearchFilterString"),
                                    autoApply: false
                                });
                                this.reloadDataViewGridCollection();
                            }
                        }
                    },

                    /**
                     * Выполняет Сохранение коллекции представления данных
                     * @protected
                     */
                    saveDataViewGridCollection: function() {
                        var gridData = this.getGridData();
                        var dataCollection = new Terrasoft.Collection();
                        gridData.each(function(item) {
                            dataCollection.add(item.get("Id"), item);
                        }, this);
                        this.set("DataViewGridCollection", dataCollection);
                    },

                    /**
                     * Выполняет перезагрузку представления данных
                     * @protected
                     */
                    reloadDataViewGridCollection: function() {
                        var collection = this.get("DataViewGridCollection");
                        var basket = this.getBasketData();
                        basket.each(function(basketItem) {
                            var basketItemCount = basketItem.get("Count");
                            var basketItemUnit = basketItem.get("Unit");
                            var item = collection.find(basketItem.get("Id"));
                            if (item) {
                                var count = item.get("Count");
                                if (basketItemCount !== count) {
                                    item.set("Count", basketItemCount);
                                }
                                var unit = item.get("Unit");
                                if (unit !== basketItemUnit) {
                                    item.set("Unit", basketItemUnit);
                                }
                            }
                        }, this);
                        var gridData = this.getGridData();
                        gridData.clear();
                        gridData.loadAll(collection);
                    },

                    /**
                     * Выполняет загрузку представления корзины
                     * @protected
                     * @virtual
                     */
                    loadBasketGridData: function() {
                        var dataCollection = new Terrasoft.Collection();
                        var basket = this.getBasketData();
                        basket.each(function(item) {
                            if (item.get("Count") > 0) {
                                var cloneItem = this.cloneProduct(item);
                                this.prepareItem(cloneItem);
                                cloneItem.on("change", this.onDataGridItemChanged, this);
                                cloneItem.on("change:Unit", this.onUnitChanged, this);
                                cloneItem.on("change:Count", this.onCountChanged, this);
                                //cloneItem.on("change:Price", this.onPriceChanged, this);
                                dataCollection.add(cloneItem.get("Id"), cloneItem);
                            }
                        }, this);
                        var gridData = this.getGridData();
                        gridData.clear();
                        gridData.loadAll(dataCollection);
                        this.set("BasketViewGridCollection", dataCollection);
                    },

                    /**
                     * Клонирует запись продукта.
                     * @param {Object} product Продукт.
                     * @return {BaseViewModel} Возвращает копию записи продукта.
                     */
                    cloneProduct: function(product) {
                        var values = Ext.apply(product.values, product.changedValues);
                        return this.getGridRecordByItemValues(values, this.get("EntitySchema"));
                    },

                    /**
                     * Выполняет загрузку представления списка
                     * @protected
                     * @virtual
                     */
                    loadGridData: function() {
                        MaskHelper.ShowBodyMask();
                        var sortColumnLastValue = this.get("sortColumnLastValue");
                        var batchQuery = Ext.create("Terrasoft.BatchQuery");
                        var esq = this.getGridDataESQ();
                        esq.rowCount = 30;
                        this.initQueryColumns(esq);
                        this.initQueryFilters(esq);
                        this.initializePageableOptions(esq, sortColumnLastValue);
                        batchQuery.add(esq);
                        var basePriceList = this.get("BasePriceList");
                        if (basePriceList) {
                            var basePriceListProductEsq = this.getGridDataESQ();
                            basePriceListProductEsq.rowCount = 40;
                            basePriceListProductEsq.addColumn("Price", "ProductPrice");
                            basePriceListProductEsq.addColumn("[ProductPrice:Product:Id].Price", "Price");
                            basePriceListProductEsq.addColumn("[ProductPrice:Product:Id].Currency", "Currency");
                            basePriceListProductEsq.addColumn("[ProductPrice:Product:Id].Tax", "Tax");
                            basePriceListProductEsq.addColumn("[ProductPrice:Product:Id].Tax.Percent", "DiscountTax");
                            basePriceListProductEsq.filters.addItem(Terrasoft.createFilter(Terrasoft.ComparisonType.EQUAL,
                                "[ProductPrice:Product:Id].Product.Id", "Id"));
                            basePriceListProductEsq.filters.addItem(Terrasoft.createColumnFilterWithParameter(
                                Terrasoft.ComparisonType.EQUAL, "[ProductPrice:Product:Id].PriceList.Id",
                                basePriceList.value));
                            basePriceListProductEsq.filters.addItem(
                                Terrasoft.createColumnIsNotNullFilter("[ProductPrice:Product:Id].Price"));
                            this.initQueryFilters(basePriceListProductEsq);
                            this.initializePageableOptions(basePriceListProductEsq, sortColumnLastValue);
                            batchQuery.add(basePriceListProductEsq);
                        }
                        var masterEntity = this.get("MasterEntity");
                        if (masterEntity) {
                            var esqEntitySchemaName = this.get("MasterEntitySchemaName") + this.get("EntitySchemaName");
                            var partColumnName = "[" + esqEntitySchemaName + ":Product:Id].";
                            var sumCountColumnName = partColumnName + "Quantity";
                            var productInCountEsq = this.getGridDataESQ();
                            productInCountEsq.addColumn(partColumnName + "Id", esqEntitySchemaName + "Id");
                            productInCountEsq.addColumn(partColumnName + "Product.Code", "Code");
                            productInCountEsq.addColumn(partColumnName + "Product.IsArchive", "IsArchive");
                            productInCountEsq.addColumn(partColumnName + "Unit", "Unit");
                            productInCountEsq.addColumn(partColumnName + "Unit", "UnitIn");
                            productInCountEsq.addColumn(partColumnName + "Price", "Price");
                            productInCountEsq.addColumn(partColumnName + "Quantity", "Quantity");
                            productInCountEsq.addColumn(partColumnName + "PrimaryPrice", "PrimaryPrice");
                            productInCountEsq.addColumn(partColumnName + "PrimaryAmount", "PrimaryAmount");
                            productInCountEsq.addColumn(partColumnName + "Amount", "Amount");
                            productInCountEsq.addColumn(partColumnName + "PrimaryDiscountAmount", "PrimaryDiscountAmount");
                            productInCountEsq.addColumn(partColumnName + "DiscountAmount", "DiscountAmount");
                            productInCountEsq.addColumn(partColumnName + "DiscountPercent", "DiscountPercent");
                            productInCountEsq.addColumn(partColumnName + "Tax", "Tax");
                            productInCountEsq.addColumn(partColumnName + "Tax.Percent", "TaxPercent");
                            productInCountEsq.addColumn(partColumnName + "PrimaryTaxAmount", "PrimaryTaxAmount");
                            productInCountEsq.addColumn(partColumnName + "TaxAmount", "TaxAmount");
                            productInCountEsq.addColumn(partColumnName + "PrimaryTotalAmount", "PrimaryTotalAmount");
                            productInCountEsq.addColumn(partColumnName + "TotalAmount", "TotalAmount");
                            productInCountEsq.addColumn(partColumnName + "DiscountTax", "DiscountTax");
                            productInCountEsq.addColumn(partColumnName + "BaseQuantity", "BaseQuantity");
                            productInCountEsq.addColumn(partColumnName + "PriceList", "PriceList");
                            //productInCountEsq.addColumn(partColumnName + "PriceList", "PriceList");
                            //productInCountEsq.addColumn(partColumnName + "SxPriceListMemo", "SxPriceListMemo");
                            productInCountEsq.addAggregationSchemaColumn("[ProductStockBalance:Product:Id].AvailableQuantity",
                                Terrasoft.AggregationType.SUM, "Available");
                            productInCountEsq.addColumn(sumCountColumnName, "AvailableIn");
                            /*productInCountEsq.addAggregationSchemaColumn(sumCountColumnName,
                             Terrasoft.AggregationType.SUM, "AvailableIn");*/
                            productInCountEsq.filters.addItem(
                                Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                                    Ext.String.format("{0}{1}.Id", partColumnName, this.get("MasterEntitySchemaName")),
                                    masterEntity.get("Id")));
                            productInCountEsq.filters.addItem(Terrasoft.createColumnIsNotNullFilter(sumCountColumnName));

                            /*
                            var CurrentCountry = sandbox.publish("GetCountry");
                            productInCountEsq.filters.addItem(Terrasoft.createColumnFilterWithParameter(
                                Terrasoft.ComparisonType.EQUAL,
                                "[ProductStockBalance:Product:Id].SxCountry", CurrentCountry));*/

                            this.initQueryFilters(productInCountEsq);
                            batchQuery.add(productInCountEsq);
                        }
                        this.set("sortColumnLastValue", null);
                        batchQuery.execute(this.onGridDataLoaded, this);
                    },

// Grid
                    /**
                     * Создает экземпляр класса Terrasoft.EntitySchemaQuery.
                     * Инициализирует его свойствами rootSchema.
                     * @protected
                     * @return {Terrasoft.EntitySchemaQuery} Возвращает экземпляр класса Terrasoft.EntitySchemaQuery.
                     */
                    getGridDataESQ: function() {
                        var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
                            rootSchemaName: this.get("EntitySchemaName")
                        });
                        esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
                        var column = esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "Name");
                        column.orderPosition = 0;
                        column.orderDirection = Terrasoft.OrderDirection.ASC;
                        return esq;
                    },

                    /**
                     * Инициализирует колонки запроса
                     * @protected
                     * @param {Terrasoft.EntitySchemaQuery} esq
                     */
                    initQueryColumns: function(esq) {
                        esq.addAggregationSchemaColumn("[ProductStockBalance:Product:Id].AvailableQuantity",
                            Terrasoft.AggregationType.SUM, "Available");
                        esq.addColumn("Unit");
                        esq.addColumn("Price");
                        esq.addColumn("Currency");
                        esq.addColumn("Tax");
                        esq.addColumn("Code");
                        esq.addColumn("IsArchive");
                        esq.addColumn("SxPriceListMemo");
                    },

                    /**
                     * Инициализирует фильтры запроса
                     * @protected
                     * @param {Terrasoft.EntitySchemaQuery} esq
                     */
                    initQueryFilters: function(esq) {
                        var catalogueFilters = this.get("CatalogueFilters");
                        var quickSearchFilters = this.get("QuickSearchFilters");
                        if (catalogueFilters) {
                            esq.filters.add("CatalogueFilters", catalogueFilters);
                        }
                        if (quickSearchFilters) {
                            esq.filters.add("QuickSearchFilters", quickSearchFilters);
                        }
                    },

                    /**
                     * Обрабатывает ответ запроса загрузки данных для реестра.
                     * @protected
                     * @param {Object} response Ответ сервера.
                     */
                    onGridDataLoaded: function(response) {
                        if (!response.success) {
                            return;
                        }
                        var dataCollection = new Terrasoft.Collection();
                        this.prepareResponseCollection(dataCollection, response);
                        var lastValue = null;
                        var gridData = this.getGridData();
                        var canLoadData = false;
                        if (dataCollection.getCount()) {
                            var lastItemIndex = dataCollection.getCount() - 1;
                            var lastItem = dataCollection.getByIndex(lastItemIndex);
                            var products = gridData.collection.filterBy(
                                function(res) {
                                    var resId = res.get("RealRecordId");
                                    return resId === lastItem.get("RealRecordId");
                                }
                            );
                            if ((products.length <= 0)) {
                                lastValue = lastItem.get("Name");
                                canLoadData = true;
                            }
                        }
                        this.set("sortColumnLastValue", lastValue);
                        if (canLoadData) {
                            gridData.loadAll(dataCollection);
                        }
                        MaskHelper.HideBodyMask();
                    },

                    /**
                     * Возвращает тип данных колонки
                     * @protected
                     * @param {Object} record Элемент коллекции виз
                     * @param {String} columnName Название колонки
                     * @returns {Object} Тип данных колонки
                     */
                    getDataValueType: function(record, columnName) {
                        var recordColumn = record.columns[columnName] ?
                            record.columns[columnName] :
                            record.entitySchema.columns[columnName];
                        return recordColumn ? recordColumn.dataValueType : null;
                    },

                    /**
                     * Инициализирует свойства постраничности EntitySchemaQuery
                     * @protected
                     * @param {Terrasoft.EntitySchemaQuery} select Запрос
                     * @param {String} sortColumnLastValue Последнее значение в реестре
                     * @private
                     */
                    initializePageableOptions: function(select, sortColumnLastValue) {
                        if (sortColumnLastValue && this.get("GridData").getCount()) {
                            select.filters.add("LastValueFilter", Terrasoft.createColumnFilterWithParameter(
                                Terrasoft.ComparisonType.GREATER,
                                "Name", sortColumnLastValue));
                        }
                    },

                    /**
                     * Возвращает конфигурацию колонок записи в реестре
                     * @returns {Object}
                     */
                    getProductRowConfig: function() {
                        var rowConfig = {
                            Amount: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            Available: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            AvailableIn: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            BaseQuantity: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            Count: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            Code: {
                                dataValueType: Terrasoft.DataValueType.TEXT
                            },
                            DiscountAmount: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            DiscountPercent: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            DiscountTax: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            Id: {
                                dataValueType: Terrasoft.DataValueType.GUID
                            },
                            InvoiceProductId: {
                                dataValueType: Terrasoft.DataValueType.GUID
                            },
                            IsArchive: {
                                dataValueType: Terrasoft.DataValueType.BOOLEAN
                            },
                            Name: {
                                dataValueType: Terrasoft.DataValueType.TEXT
                            },
                            Price: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            PriceList: {
                                dataValueType: Terrasoft.DataValueType.LOOKUP,
                                isLookup: true,
                                referenceSchemaName: "Pricelist"
                            },
                            PrimaryAmount: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            PrimaryDiscountAmount: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            PrimaryPrice: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            PrimaryTaxAmount: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            PrimaryTotalAmount: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            Quantity: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            Tax: {
                                dataValueType: Terrasoft.DataValueType.LOOKUP,
                                isLookup: true,
                                referenceSchemaName: "Tax"
                            },
                            TaxAmount: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            TaxPercent: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            TotalAmount: {
                                dataValueType: Terrasoft.DataValueType.FLOAT
                            },
                            Unit: {
                                dataValueType: Terrasoft.DataValueType.LOOKUP,
                                isLookup: true,
                                referenceSchemaName: "Unit"
                            },
                            UnitIn: {
                                dataValueType: Terrasoft.DataValueType.LOOKUP,
                                isLookup: true,
                                referenceSchemaName: "Unit"
                            }
                        };
                        return rowConfig;
                    },

                    /**
                     * Возвращает стандартную конфигурацию строки реестра.
                     * @protected
                     * @param {Terrasoft.Collection} rowValues Значения строки.
                     * @param {Terrasoft.EntitySchema} entitySchema Схема записи.
                     * @return {BaseViewModel}
                     */
                    getGridRecordByItemValues: function(rowValues, entitySchema) {
                        var gridRecord = Ext.create("Terrasoft.BaseViewModel", {
                            entitySchema: entitySchema,
                            rowConfig: this.getProductRowConfig(),
                            values: rowValues,
                            isNew: false,
                            isDeleted: false,
                            methods: {

                            }
                        });
                        return gridRecord;
                    },

                    /**
                     * Модифицирует коллекции данных перед загрузкой в реестр.
                     * @protected
                     * @param {Terrasoft.Collection} collection Коллекция элементов реестра.
                     * @param {Object} response Ответ сервера.
                     */
                    prepareResponseCollection: function(collection, response) {
                        var esqEntitySchemaName = this.get("MasterEntitySchemaName") + this.get("EntitySchemaName") + "Id";
                        var productSelectResponse = response.queryResults[0];
                        var productInEntityResponse = response.queryResults[response.queryResults.length - 1];
                        var basket = this.getBasketData();
                        Terrasoft.each(productInEntityResponse.rows, function(row) {
                            var item = this.getGridRecordByItemValues(row, this.get("EntitySchema"));
                            var itemId = item.get("Id");
                            item.set("RealRecordId", itemId);
                            var customKey = itemId + "_" + item.get(esqEntitySchemaName);
                            item.set("Id", customKey);
                            var availableIn = row.AvailableIn;
                            item.set("Count", availableIn);
                            item.set("AvailableInCount", availableIn);
                            var masterEntity = this.get("MasterEntity");
                            var unitIn = row.UnitIn;
                            var entityCaption = Terrasoft.configuration.ModuleStructure[this.get("MasterEntitySchemaName")];
                            entityCaption = entityCaption.moduleCaption.substr(0, entityCaption.moduleCaption.length - 1);
                            var captionMasterEntity = entityCaption + " " + masterEntity.get("Name");
                            var unit = unitIn ? unitIn.displayValue : "";
                            item.set("AvailableIn", Ext.String.format(
                                "Продукт добавлен в {0} в количестве {1} {2}",
                                captionMasterEntity, availableIn.toString(), unit.toString()));
                            if (!basket.contains(customKey)) {
                                basket.add(customKey, item);
                            }
                        }, this);
                        basket.each(function(item) {
                            var products = productSelectResponse.rows.filter(
                                function(res) {
                                    var resId = res.RealRecordId || res.Id;
                                    return resId === item.get("RealRecordId");
                                }
                            );
                            if (products.length) {
                                var detailRecordId = item.get(esqEntitySchemaName);
                                Terrasoft.each(products, function(pr) {
                                    var product = Terrasoft.deepClone(pr);
                                    var productId = product.RealRecordId || product.Id;
                                    var customKey = detailRecordId ? productId + "_" + detailRecordId : productId;
                                    product.RealRecordId = productId;
                                    product.Id = customKey;
                                    product.Price = item.get("Price");
                                    product.Unit = item.get("Unit");
                                    product.UnitIn = item.get("UnitIn");
                                    product.Amount = item.get("Amount");
                                    product.BaseQuantity = item.get("BaseQuantity");
                                    product.Code = item.get("Code");
                                    product.DiscountAmount = item.get("DiscountAmount");
                                    product.DiscountPercent = item.get("DiscountPercent");
                                    product.DiscountPercent = item.get("DiscountPercent");
                                    product[esqEntitySchemaName] = item.get(esqEntitySchemaName);
                                    product.IsArchive = item.get("IsArchive");
                                    product.Name = item.get("Name");
                                    product.PriceList = item.get("PriceList");
                                    product.PrimaryAmount = item.get("PrimaryAmount");
                                    product.PrimaryDiscountAmount = item.get("PrimaryDiscountAmount");
                                    product.PrimaryPrice = item.get("PrimaryPrice");
                                    product.PrimaryTaxAmount = item.get("PrimaryTaxAmount");
                                    product.PrimaryTotalAmount = item.get("PrimaryTotalAmount");
                                    product.Quantity = item.get("Quantity");
                                    product.Tax = item.get("Tax");
                                    product.TaxAmount = item.get("TaxAmount");
                                    product.TaxPercent = item.get("TaxPercent");
                                    product.TotalAmount = item.get("TotalAmount");
                                    var masterEntity = this.get("MasterEntity");
                                    product.Currency = masterEntity.get("Currency");
                                    var availableInCount = item.get("AvailableInCount");
                                    product.AvailableIn = item.get("AvailableIn");
                                    product.Count = availableInCount;
                                    product.AvailableInCount = availableInCount;

                                    Ext.Array.insert(productSelectResponse.rows,
                                        Ext.Array.indexOf(productSelectResponse.rows, pr, 0), [product]);
                                    if (productId === pr.Id) {
                                        Ext.Array.remove(productSelectResponse.rows, pr);
                                    }
                                }, this);
                            }
                        }, this);
                        Terrasoft.each(productSelectResponse.rows, function(row) {
                            var item = this.getGridRecordByItemValues(row, this.get("EntitySchema"));
                            this.prepareItem(item);
                            var price = item.get("Price");
                            var masterEntity = this.get("MasterEntity");
                            var masterCurrencyId = (masterEntity && masterEntity.get("Currency")) ?
                                masterEntity.get("Currency").value : null;
                            var currencyId = item.get("Currency") ? item.get("Currency").value : null;
                            if (currencyId && (masterCurrencyId !== currencyId)) {
                                MoneyModule.onLoadCurrencyRate.call(
                                    this, item.get("Currency").value, null,
                                    function(result) {
                                        this.setPrice(item, price, result.Division, result.Rate);
                                    },
                                    function() {
                                        this.setPrice(item, price, 1, 1);
                                    }
                                );
                            }
                            var basePriceListProduct = response.queryResults[1].rows.filter(function(res) {
                                return res.Id === item.get("Id");
                            });
                            if (basePriceListProduct && basePriceListProduct.length > 0) {
                                var tax = basePriceListProduct[0].Tax;
                                var taxPercent = basePriceListProduct[0].DiscountTax;
                                if (tax) {
                                    item.set("Tax", tax);
                                    item.set("DiscountTax", taxPercent);
                                }
                            }
                            var itemId = item.get("Id");
                            var existingItem = basket.find(itemId);
                            if (!existingItem && item.get("Count") > 0) {
                                basket.add(itemId, item);
                            } else if (!Ext.isEmpty(existingItem)) {
                                var priceItem = existingItem.get("Price");
                                if (!priceItem) {
                                    priceItem = 0;
                                }
                                item.set("Price", parseFloat(priceItem).toFixed(2));
                                item.set("Unit", existingItem.get("Unit"));
                                item.set("Count", existingItem.get("Count"));
                            }
                            item.on("change", this.onDataGridItemChanged, this);
                            item.on("change:Unit", this.onUnitChanged, this);
                            item.on("change:Count", this.onCountChanged, this);
                            item.on("change:Price", this.onPriceChanged, this);
                            var isArchive = item.get("IsArchive");
                            var gridData = this.getGridData();
                            if ((!isArchive || item.get("AvailableInCount")) &&
                                !collection.contains(row.Id) && !gridData.contains(row.Id)) {
                                collection.add(row.Id, item);
                            }
                        }, this);
                        this.calcSummary();
                    },

                    /**
                     * Обрабатывает запись продукта перед загрузкой в реестр
                     * @protected
                     * @param {Object} item Запись продукта.
                     */
                    prepareItem: function(item) {
                        item.sandbox = sandbox;
                        if (!item.get("RealRecordId")) {
                            item.set("RealRecordId", item.get("Id"));
                        }
                        item.set("MasterEntitySchemaName", this.get("MasterEntitySchemaName"));
                        item.set("MasterRecordId", this.get("MasterRecordId"));

                        item.set("UnitEnumList", new Terrasoft.Collection());
                        item.fillUnitItems = this.fillUnitItems;

                        var price = item.get("Price");
                        if (!price) {
                            price = 0;
                        }
                        item.set("Price", parseFloat(price).toFixed(2));
                        item.set("PriceDisplayValue", ProductUtilities.getFormattedNumberValue(price));
                        var currency = sandbox.publish("GetCurrency");
                        var Pricelists = item.values.SxPriceListMemo.split(';');
                        var newValue=0;
                        Pricelists.forEach(function(currentItem){
                            if (currentItem.indexOf(currency)+1){
                                newValue=currentItem.replace(currency,"");

                            }
                        });
                        item.set("SxPriceListMemoDisplayValue",newValue);
                        //GetGurrency
                        //item.set("productStockValue",0);
                        /*var CurrentCountry = sandbox.publish("GetCountry");

                        var select = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "ProductStockBalance"});
                        select.addColumn("SxCountry");
                        select.addColumn("AvailableQuantity");
                        var filter = Terrasoft.createColumnFilterWithParameter(
                            Terrasoft.ComparisonType.EQUAL, "SxCountry", CurrentCountry);
                        select.filters.addItem(filter);
                        var filter2 = Terrasoft.createColumnFilterWithParameter(
                            Terrasoft.ComparisonType.EQUAL, "Product", item.get("Id"));
                        select.filters.addItem(filter2);


                        select.getEntityCollection(function (result) {
                            var EntityCollection = result.collection.collection.items;
                            if (EntityCollection.length==0)
                                item.set("productStockValue",0);
                            EntityCollection.forEach(function (item, i, EntityCollection) {
                                //contractList.push(item.values.sxContract.value);
                                item.set("productStockValue",item.values.AvailableQuantity);

                            });
                        });*/




                        //item.values.SxPriceListMemo
                        item.showImage = function() {
                            return !Ext.isEmpty(this.get("AvailableIn"));
                        };
                        item.getImageURL = function() {
                            return Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.Warning);
                        };
                        item.onAvailableClick = this.onAvailableClick;
                    },

                    /**
                     * Обрабатывает изменение едининц измерения.
                     * @protected
                     * @param {BaseViewModel} model Модель.
                     * @param {Object} item Измененный элемент.
                     */
                    onUnitChanged: function(model, item) {
                        this.set("NeedRecalc", true);
                        var count = model.get("Count");
                        model.validate = this.validate;
                        if (Ext.isEmpty(count) || (count < 0 && count === item)) {
                            count = 0;
                        }
                        model.set("Quantity", parseFloat(count));
                        if (!Ext.isEmpty(item) && item.NumberOfBaseUnits) {
                            model.set("BaseQuantity", count * item.NumberOfBaseUnits);
                            this.set("NeedRecalc", false);
                        } else {
                            ProductUtilities.setNumberOfBaseUnitsAndBaseQuantity(model, function() {
                                this.set("NeedRecalc", false);
                                if (this.get("NeedSave") === true) {
                                    this.saveSelectedProducts();
                                }
                            }, this);
                        }
                    },
                    /**
                     * Обрабатывает изменение количества.
                     * @protected
                     * @param {BaseViewModel} model Модель.
                     * @param {Object} item Измененный элемент.
                     * @param {Object} options Дополнительный настройки.
                     */
                    onCountChanged: function(model, item, options) {
                                          //
                        this.onUnitChanged(model, item, options);
                    },
                    onPriceChanged: function(model, item, options) {

                        //this.onPriceChangedFunc(model, item, options);
                    },

                    /**
                     * Выделяет и собирает измененные элементы, чтобы потом сохранить.
                     * @protected
                     * @param {BaseViewModel} item Продукт.
                     */
                    onDataGridItemChanged: function(item) {
                        var basket = this.getBasketData();
                        var itemId = item.get("Id");
                        var itemCount = item.get("Count") || 0;
                        if (itemCount < 0) {
                            itemCount = 0;
                            item.set("Count", 0);
                        }
                        var Delivery=false;
                        if (item.get("RealRecordId")==
                            "25f1f1cc-85ce-448c-b680-4d2835a18724")
                        {
                            Delivery=true;
                        }
                        var itemAvailableInCount = item.get("AvailableInCount");
                        var existingItem = basket.find(itemId);
                        if (itemCount > 0) {
                            if (!existingItem) {
                                basket.add(itemId, item);
                                existingItem = basket.find(itemId);
                            } else {
                                /*existingItem.set("Count", itemCount);
                                if(Delivery && item.changedValues.PriceDisplayValue){
                                    existingItem.set("Price", item.changedValues.PriceDisplayValue);
                                }*/
                            }
                        } else if (existingItem && Ext.isEmpty(itemAvailableInCount)) {
                            basket.removeByKey(itemId);
                        }
                        if (existingItem && item) {
                            existingItem.set("Count", parseFloat(itemCount));
                            existingItem.set("Quantity", parseFloat(itemCount));
                            if(Delivery && item.changedValues.PriceDisplayValue!=0){
                                existingItem.set("Price", parseFloat(item.changedValues.PriceDisplayValue));
                            }
                            existingItem.set("BaseQuantity", item.get("BaseQuantity"));
                            existingItem.set("Unit", item.get("Unit"));
                            ProductUtilities.calculateProduct(existingItem);
                            this.calcSummary();
                        }
                    },

                    /**
                     * Устанавливает цену продукта.
                     * @protected
                     * @param {Object} item Продукт.
                     * @param {Number} productPrice Цена продукта.
                     * @param {Number} division Кратность.
                     * @param {Number} rate Курс.
                     */
                    setPrice: function(item, productPrice, division, rate) {
                        var entity = this.get("MasterEntity");
                        var currencyRate = (entity && entity.get("CurrencyRate")) ? entity.get("CurrencyRate") : 1;
                        var divisionResult = (division === 0) ? 1 : division;
                        var rateResult = (rate === 0) ? 1 : rate;
                        var price = (productPrice * currencyRate * divisionResult) / (rateResult * entity.get("Currency.Division"));
                        item.set("Price", parseFloat(price).toFixed(2));
                        item.set("PriceDisplayValue", ProductUtilities.getFormattedNumberValue(price));
                    },

                    /**
                     * Получает коллекцию выбранных элементов реестра.
                     * @protected
                     * @returns {Object} Возвращает коллекцию данных корзины
                     */
                    getBasketData: function() {
                        var baskedData = this.get("BasketData");
                        if (!baskedData) {
                            baskedData = new Terrasoft.Collection();
                            this.set("BasketData", baskedData);
                        }
                        return baskedData;
                    },

                    /**
                     * Получает коллекцию элементов реестра.
                     * @protected
                     * @returns {Object} Возвращает коллекцию данных
                     */
                    getGridData: function() {
                        var gridData = this.get("GridData");
                        if (!gridData) {
                            gridData = new Terrasoft.Collection();
                            this.set("GridData", gridData);
                        }
                        return gridData;
                    },

                    /**
                     * Устанавливает заголовок колонки Цена в шапке реестра.
                     * @protected
                     * @param {String} symbol Символ валюты.
                     */
                    setPriceCaption: function(symbol) {
                        this.set("PriceLabel", Ext.String.format("Цена{0}", ", " + symbol));
                    },

                    /**
                     * Получает коллекцию представлений модуля.
                     * @protected
                     * @returns {Collection}
                     */
                    getDataViews: function() {
                        var moduleCaption = this.getModuleCaption();
                        var gridDataView = {
                            name: "GridDataView",
                            active: true,
                            caption: moduleCaption,
                            icon: resources.localizableImages.GridDataViewIcon
                        };
                        var basketDataView = {
                            name: "BasketDataView",
                            caption: moduleCaption,
                            icon: resources.localizableImages.BasketDataViewIcon
                        };
                        var dataViews = Ext.create("Terrasoft.Collection");
                        dataViews.add(gridDataView.name, gridDataView, 0);
                        dataViews.add(basketDataView.name, basketDataView, 1);
                        this.set("DataViews", dataViews);
                        return dataViews;
                    },

                    /**
                     * Получает заголовок модуля.
                     * @protected
                     * @returns {string}
                     */
                    getModuleCaption: function() {
                        var entity = this.get("MasterEntity");
                        var entityCaption = this.getEntityCaption();
                        return Ext.String.format(
                            "Подбор продуктов в {0}", entityCaption + " №" + entity.get("Name")
                        );
                    },

                    /**
                     * Получает заголовок сущности.
                     * @protected
                     * @returns {string}
                     */
                    getEntityCaption: function() {
                        var entityCaption = Terrasoft.configuration.ModuleStructure[this.get("MasterEntitySchemaName")];
                        return entityCaption.moduleCaption.substr(0, entityCaption.moduleCaption.length - 1);
                    },

                    /**
                     * Обрабатывает нажатие на колонку Доступно в реестре
                     * @protected
                     */
                    onAvailableClick: function() {
                        //console.log(arguments);
                    },

// Summary
                    /**
                     * Вычисляет строку итогов по выбранным продуктам
                     * @protected
                     */
                    calcSummary: function() {
                        var totalAmount = 0.0;
                        var lineItemsCount = 0;

                        var basket = this.getBasketData();
                        var KeysCol=basket.collection.keys;
                        var newValue = 0;
                        //basket.collection.keys
                        basket.each(function(item) {

                           // for (var i=0;i<KeysCol.length;i++){
                                var grid=this.getGridData();
                                if (grid.find(item.get("Id"))){

                                    //var a = grid.find(KeysCol[i]);
                                    var Pricelists = grid.find(item.get("Id")).values.SxPriceListMemo.split(';');
                                    var OrderCurrency = sandbox.publish("GetCurrency");

                                    Pricelists.forEach(function (currentItem) {
                                        if (currentItem.indexOf(OrderCurrency) + 1) {
                                            newValue = currentItem.replace(OrderCurrency, "");

                                        }
                                    });
                                }
                            //}



                            var quantity = item.get("Quantity");
                            totalAmount += newValue*quantity;// || 0.0;
                            var count = (!Ext.isEmpty(quantity) && quantity > 0) ? 1 : 0;
                            lineItemsCount += count;
                        }, this);/*
                        var grid=this.getGridData();
                        if (grid.find(item.get("Id"))){
                            if (item.values.Id != "25f1f1cc-85ce-448c-b680-4d2835a18724") {
                                var Pricelists = grid.find(item.get("Id")).values.SxPriceListMemo.split(';');
                                var OrderCurrency = sandbox.publish("GetCurrency");
                                var newValue = 0;
                                Pricelists.forEach(function (currentItem) {
                                    if (currentItem.indexOf(OrderCurrency) + 1) {
                                        newValue = currentItem.replace(OrderCurrency, "");

                                    }
                                });
                                insert.setParameterValue("Price",
                                    newValue, Terrasoft.DataValueType.FLOAT);*/

                        this.set("TotalAmount", totalAmount);
                        this.set("LineItemsCount", lineItemsCount);
                    },

                    /**
                     * Устанавливает символ валюты.
                     * @protected
                     * @param {String} symbol Символ валюты.
                     */
                    setSummaryCurrencySymbol: function(symbol) {
                        this.set("CurrencySymbol", symbol);
                    },
// Utility methods
                    /**
                     * Рассчитывает сумму.
                     * @protected
                     */
                    calcAmount: function() {
                        var price = this.get("Price");
                        var quantity = this.get("BaseQuantity");
                        if (!Ext.isEmpty(price) && !Ext.isEmpty(quantity)) {
                            this.set("Amount", (price * quantity));
                        }
                    },

                    /**
                     * Выпоняет сохранение выбранных продуктов и обновление существующих.
                     * @protected
                     */
                    saveSelectedProducts: function() {
                        if (this.get("NeedRecalc") === true) {
                            this.set("NeedSave", true);
                            return;
                        }
                        MaskHelper.ShowBodyMask();
                        var currentDataView = this.get("CurrentDataView");
                        var selectedProducts = this.getBasketData();
                        if (Ext.isEmpty(this.get("MasterEntitySchemaName")) ||
                            Ext.isEmpty(this.get("MasterRecordId")) ||
                            (selectedProducts.getCount() < 1)) {
                            this.afterSave();
                            return;
                        }
                        var batchQuery = Ext.create("Terrasoft.BatchQuery");
                        var rootSchemaName = this.get("MasterEntitySchemaName") + this.get("EntitySchemaName");
                        selectedProducts.each(function(item) {
                            ProductUtilities.calculateProduct(item);
                            if (item.get("AvailableInCount") > 0) {
                                var quantity = (currentDataView === "GridDataView") ?
                                    item.get("Quantity") :
                                item.get("Count") || 0;
                                if (parseFloat(quantity) === 0) {
                                    //delete
                                    var deleteQuery = Ext.create("Terrasoft.DeleteQuery", {
                                        rootSchemaName: rootSchemaName
                                    });
                                    var entityIdFilter = Terrasoft.createColumnFilterWithParameter(
                                        Terrasoft.ComparisonType.EQUAL, "Id", item.get(rootSchemaName + "Id"));
                                    deleteQuery.filters.add("entityIdFilter", entityIdFilter);
                                    batchQuery.add(deleteQuery);
                                } else {
                                    var update = Ext.create("Terrasoft.UpdateQuery", {
                                        rootSchemaName: rootSchemaName
                                    });
                                    var filters = update.filters;
                                    filters.add("IdFilter", Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Id",
                                        item.get(rootSchemaName + "Id")));
                                    update.setParameterValue("Quantity",
                                        quantity, Terrasoft.DataValueType.FLOAT);
                                    update.setParameterValue("BaseQuantity",
                                        item.get("BaseQuantity"), Terrasoft.DataValueType.FLOAT);
                                    if (item.get("Unit")) {
                                        update.setParameterValue("Unit",
                                            item.get("Unit").value, Terrasoft.DataValueType.GUID);
                                    }
                                    if (item.get("PriceList")) {
                                        update.setParameterValue("PriceList",
                                            item.get("PriceList").value, Terrasoft.DataValueType.GUID);
                                    }
                                    /*
                                    if (item.get("RealRecordId")=="25f1f1cc-85ce-448c-b680-4d2835a18724"){
                                        var griditems=this.getGridData().collection.items;
                                        griditems.forEach(function(currentitem){
                                            if(currentitem.get("RealRecordId")=="25f1f1cc-85ce-448c-b680-4d2835a18724")
                                            {
                                                currentitem.get("Price");
                                            }
                                        })


                                    }*/

                                    if (item.values.Id!="25f1f1cc-85ce-448c-b680-4d2835a18724") {

                                        var grid=this.getGridData();
                                        if (grid.find(item.get("Id"))){
                                            if (item.values.Id != "25f1f1cc-85ce-448c-b680-4d2835a18724") {
                                                var Pricelists = grid.find(item.get("Id")).values.SxPriceListMemo.split(';');
                                                var OrderCurrency = sandbox.publish("GetCurrency");
                                                var newValue = 0;
                                                Pricelists.forEach(function (currentItem) {
                                                    if (currentItem.indexOf(OrderCurrency) + 1) {
                                                        newValue = currentItem.replace(OrderCurrency, "");

                                                    }
                                                });
                                                update.setParameterValue("Price",
                                                    newValue, Terrasoft.DataValueType.FLOAT);
                                            }
                                            else{

                                                if (grid.collection.getByKey(item.get("Id"))){
                                                    if (grid.collection.getByKey(item.get("Id")).model.changed.SxPriceListMemoDisplayValue){
                                                        update.setParameterValue("Price",
                                                            grid.collection.getByKey(item.get("Id")).model.changed.SxPriceListMemoDisplayValue,
                                                            Terrasoft.DataValueType.FLOAT);
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            update.setParameterValue("Price",
                                                item.get("Price"), Terrasoft.DataValueType.FLOAT);
                                        }
                                    }


                                    if (item.get("PrimaryPrice")) {
                                        update.setParameterValue("PrimaryPrice",
                                            item.get("PrimaryPrice"), Terrasoft.DataValueType.FLOAT);
                                    }
                                    if (item.get("Amount")) {
                                        update.setParameterValue("Amount",
                                            item.get("Amount"), Terrasoft.DataValueType.FLOAT);
                                    }
                                    if (item.get("PrimaryAmount")) {
                                        update.setParameterValue("PrimaryAmount",
                                            item.get("PrimaryAmount"), Terrasoft.DataValueType.FLOAT);
                                    }
                                    if (item.get("TaxAmount")) {
                                        update.setParameterValue("TaxAmount",
                                            item.get("TaxAmount"), Terrasoft.DataValueType.FLOAT);
                                    }
                                    if (item.get("PrimaryTaxAmount")) {
                                        update.setParameterValue("PrimaryTaxAmount",
                                            item.get("PrimaryTaxAmount"), Terrasoft.DataValueType.FLOAT);
                                    }
                                    if ((item.get("TotalAmount"))&&item.values.Id!="25f1f1cc-85ce-448c-b680-4d2835a18724"){
                                        update.setParameterValue("TotalAmount",
                                            item.get("TotalAmount"), Terrasoft.DataValueType.FLOAT);
                                    }
                                    if (item.get("PrimaryTotalAmount")) {
                                        update.setParameterValue("PrimaryTotalAmount",
                                            item.get("PrimaryTotalAmount"), Terrasoft.DataValueType.FLOAT);
                                    }
                                    if (item.get("DiscountTax")) {
                                        update.setParameterValue("DiscountTax",
                                            item.get("DiscountTax"), Terrasoft.DataValueType.FLOAT);
                                    }


                                    if (item.values.Id=="25f1f1cc-85ce-448c-b680-4d2835a18724"){

                                        var grid=this.getGridData();
                                        if (grid.collection.getByKey(item.get("Id"))){
                                            if (grid.collection.getByKey(item.get("Id")).model.changed.SxPriceListMemoDisplayValue){
                                                update.setParameterValue("Price",
                                                    grid.collection.getByKey(item.get("Id")).model.changed.SxPriceListMemoDisplayValue,
                                                    Terrasoft.DataValueType.FLOAT);
                                                update.setParameterValue("TotalAmount",
                                                    grid.collection.getByKey(item.get("Id")).model.changed.SxPriceListMemoDisplayValue,
                                                    Terrasoft.DataValueType.FLOAT);
                                            }
                                        }
                                    }
                                    batchQuery.add(update);
                                   // batchQuery.add(update2);



                                }
                            } else {
                                //insert
                                var insert = Ext.create("Terrasoft.InsertQuery", {
                                    rootSchemaName: rootSchemaName
                                });

                                if (this.get("MasterRecordId")) {
                                    insert.setParameterValue(this.get("MasterEntitySchemaName"),
                                        this.get("MasterRecordId"), Terrasoft.DataValueType.GUID);
                                }
                                if (item.get("Id")) {
                                    insert.setParameterValue("Product",
                                        item.get("Id"), Terrasoft.DataValueType.GUID);
                                }
                                if (item.get("Name")) {
                                    insert.setParameterValue("Name",
                                        item.get("Name"), Terrasoft.DataValueType.TEXT);
                                }
                                if (item.get("Quantity")) {
                                    insert.setParameterValue("Quantity",
                                        parseFloat(item.get("Quantity")), Terrasoft.DataValueType.FLOAT);
                                }
                                if (item.get("BaseQuantity")) {
                                    insert.setParameterValue("BaseQuantity",
                                        parseFloat(item.get("BaseQuantity")), Terrasoft.DataValueType.FLOAT);
                                }
                                if (item.get("Unit")) {
                                    insert.setParameterValue("Unit",
                                        item.get("Unit").value, Terrasoft.DataValueType.GUID);
                                }
                                if (item.get("Tax")) {
                                    insert.setParameterValue("Tax",
                                        item.get("Tax").value, Terrasoft.DataValueType.GUID);
                                }
                                if (item.get("PriceList")) {
                                    insert.setParameterValue("PriceList",
                                        item.get("PriceList").value, Terrasoft.DataValueType.GUID);
                                } else if (this.get("BasePriceList")) {
                                    insert.setParameterValue("PriceList",
                                        this.get("BasePriceList").value, Terrasoft.DataValueType.GUID);
                                }
                               /* if (item.get("Price")&&item.values.Id!="25f1f1cc-85ce-448c-b680-4d2835a18724") {

                                    insert.setParameterValue("Price",
                                        item.get("Price"), Terrasoft.DataValueType.FLOAT);
                                }*/
                                if (item.get("PrimaryPrice")) {
                                    insert.setParameterValue("PrimaryPrice",
                                        item.get("PrimaryPrice"), Terrasoft.DataValueType.FLOAT);
                                }
                                if (item.get("Amount")) {
                                    insert.setParameterValue("Amount",
                                        item.get("Amount"), Terrasoft.DataValueType.FLOAT);
                                }
                                if (item.get("PrimaryAmount")) {
                                    insert.setParameterValue("PrimaryAmount",
                                        item.get("PrimaryAmount"), Terrasoft.DataValueType.FLOAT);
                                }
                                if (item.get("TaxAmount")) {
                                    insert.setParameterValue("TaxAmount",
                                        item.get("TaxAmount"), Terrasoft.DataValueType.FLOAT);
                                }
                                if (item.get("PrimaryTaxAmount")) {
                                    insert.setParameterValue("PrimaryTaxAmount",
                                        item.get("PrimaryTaxAmount"), Terrasoft.DataValueType.FLOAT);
                                }
                                /*if (item.get("TotalAmount")&&item.values.Id!="25f1f1cc-85ce-448c-b680-4d2835a18724") {
                                    insert.setParameterValue("TotalAmount",
                                        item.get("TotalAmount"), Terrasoft.DataValueType.FLOAT);
                                }*/
                                if (item.get("PrimaryTotalAmount")) {
                                    insert.setParameterValue("PrimaryTotalAmount",
                                        item.get("PrimaryTotalAmount"), Terrasoft.DataValueType.FLOAT);
                                }
                                if (item.get("DiscountTax")) {
                                    insert.setParameterValue("DiscountTax",
                                        item.get("DiscountTax"), Terrasoft.DataValueType.FLOAT);
                                }
                                if (item.values.Id!="25f1f1cc-85ce-448c-b680-4d2835a18724") {

                                    var grid=this.getGridData();
                                    if (grid.find(item.get("Id"))){
                                        if (item.values.Id != "25f1f1cc-85ce-448c-b680-4d2835a18724") {
                                            var Pricelists = grid.find(item.get("Id")).values.SxPriceListMemo.split(';');
                                            var OrderCurrency = sandbox.publish("GetCurrency");
                                            var newValue = 0;
                                            Pricelists.forEach(function (currentItem) {
                                                if (currentItem.indexOf(OrderCurrency) + 1) {
                                                    newValue = currentItem.replace(OrderCurrency, "");

                                                }
                                            });
                                            insert.setParameterValue("Price",
                                                newValue, Terrasoft.DataValueType.FLOAT);
                                            insert.setParameterValue("TotalAmount",
                                                newValue, Terrasoft.DataValueType.FLOAT);
                                        }
                                        else{

                                            if (grid.collection.getByKey(item.get("Id"))){
                                                if (grid.collection.getByKey(item.get("Id")).model.changed.SxPriceListMemoDisplayValue){
                                                    insert.setParameterValue("Price",
                                                        grid.collection.getByKey(item.get("Id")).model.changed.SxPriceListMemoDisplayValue,
                                                        Terrasoft.DataValueType.FLOAT);
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        insert.setParameterValue("Price",
                                            item.get("Price"), Terrasoft.DataValueType.FLOAT);
                                    }
                                }
                                debugger;
                                if (item.values.Id=="25f1f1cc-85ce-448c-b680-4d2835a18724"){

                                    var grid=this.getGridData();
                                    if (grid.collection.getByKey(item.get("Id"))){
                                        if (grid.collection.getByKey(item.get("Id")).model.attributes.SxPriceListMemoDisplayValue){
                                            insert.setParameterValue("Price",
                                                grid.collection.getByKey(item.get("Id")).model.attributes.SxPriceListMemoDisplayValue,
                                                Terrasoft.DataValueType.FLOAT);
                                            insert.setParameterValue("TotalAmount",
                                                grid.collection.getByKey(item.get("Id")).model.attributes.SxPriceListMemoDisplayValue,
                                                Terrasoft.DataValueType.FLOAT);
                                        }
                                    }
                                }
                                batchQuery.add(insert);
                            }

                            if (item.values.Id) {
                                if (item.values.Id == "25f1f1cc-85ce-448c-b680-4d2835a18724") {

                                    var DeliveryUpdate = Ext.create("Terrasoft.UpdateQuery", {
                                        rootSchemaName: "Order"
                                    });
                                    var filters2 = DeliveryUpdate.filters;
                                    filters2.add(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Id",
                                        this.get("MasterRecordId")));
                                    var currentGrid=this.getGridData();
                                    if (currentGrid.collection.getByKey(item.get("Id"))){
                                        if (currentGrid.collection.getByKey(item.get("Id")).model.changed.SxPriceListMemoDisplayValue){
                                            DeliveryUpdate.setParameterValue("SxDeliveryPricePlan",
                                                currentGrid.collection.getByKey(item.get("Id")).model.changed.SxPriceListMemoDisplayValue,
                                                Terrasoft.DataValueType.FLOAT);
                                        }
                                    }
                                    else{
                                        DeliveryUpdate.setParameterValue("SxDeliveryPricePlan",
                                            item.get("Price"), Terrasoft.DataValueType.FLOAT);
                                    }
                                    //grid.collection.getByKey(item.get("Id")).model.changed.SxPriceListMemoDisplayValue;
                                    /*DeliveryUpdate.setParameterValue("SxDeliveryPricePlan",
                                     item.get("Price"), Terrasoft.DataValueType.FLOAT);*/
                                    DeliveryUpdate.execute(function(){
                                        sandbox.publish("ReloadOrderPageValues");
                                    });
                                }
                            }

                        }, this);

                        batchQuery.execute(this.afterSave, this);
                    },

                    /**
                     * Сохраняет выбранные продукты.
                     * @protected
                     */
                    saveBasketData: function() {
                        this.saveSelectedProducts();
                    },

                    /**
                     * Ищет выбранные продукты.
                     * @protected
                     * @returns {Collection} Возвращает коллекцию выбранных элементов.
                     */
                    findSelectedProducts: function() {
                        var grid = this.getGridData();
                        var resultCollection = grid.filterByFn(function(item) {
                            var count = parseFloat(item.get("Count"));
                            var availableInCount = parseFloat(item.get("AvailableInCount"));
                            return ((count > 0 && availableInCount !== count) || (availableInCount > 0 && count === 0));
                        });
                        return resultCollection;
                    },
// Button handlers

                    /**
                     * Дополнительная обработка после сохранения.
                     * @protected
                     */
                    afterSave: function() {
                        sandbox.publish("ReloadOrderPageValues");
                        this.initDataViews(true);
                        sandbox.publish("ProductSelectionSave", this.findSelectedProducts(), [sandbox.id]);
                        sandbox.publish("BackHistoryState");
                        MaskHelper.HideBodyMask();


                    },

                    /**
                     * Обрабатывает нажатие кнопки Сохранить.
                     * @protected
                     */
                    onSaveButtonClick: function() {
                        this.saveBasketData();
                    },

                    /**
                     * Обрабатывает нажатие кнопки Отмена.
                     * @protected
                     */
                    onCancelButtonClick: function() {
                        this.afterSave();
                    },

// Quick Search Module
                    /**
                     * Загружает модуль строки поиска.
                     * @protected
                     * @param {Object} renderTo Контейнер для отображения.
                     */
                    loadQuickSearchModule: function(renderTo) {
                        var quickSearchModuleId = sandbox.id + "_QuickSearchModule";
                        sandbox.subscribe("QuickSearchFilterInfo", function() {
                            return this.getQuickSearchFilterConfig();
                        }, this);
                        sandbox.subscribe("UpdateQuickSearchFilter", function(filterItem) {
                            this.onQuickSearchFilterUpdate(filterItem.key, filterItem.filters, filterItem.filtersValue);
                        }, this);
                        sandbox.loadModule("QuickSearchModule", {
                            renderTo: renderTo,
                            id: quickSearchModuleId
                        });
                    },

                    /**
                     * Получает конфигурацию модуля строки поиска.
                     * @protected
                     * @returns {Object}
                     */
                    getQuickSearchFilterConfig: function() {
                        return {
                            InitSearchString: "",
                            SearchStringPlaceHolder: resources.localizableStrings.SearchStringPlaceHolder,
                            FilterColumns: [
                                {
                                    Column: "Name",
                                    ComparisonType: Terrasoft.ComparisonType.START_WITH
                                },
                                {
                                    Column: "Code",
                                    ComparisonType: Terrasoft.ComparisonType.START_WITH
                                }
                            ]
                        };
                    },

                    /**
                     * Обрабатывает изменение фильтров поиска.
                     * @protected
                     * @param {String} filterKey Ключ фильтра.
                     * @param {Terrasoft.data.filters.FilterGroup} filterItem Группа фильтров.
                     * @param {Terrasoft.Collection} filtersValue Значение фильтра.
                     */
                    onQuickSearchFilterUpdate: function(filterKey, filterItem, filtersValue) {
                        MaskHelper.ShowBodyMask();
                        var currentDataView = this.get("CurrentDataView");
                        if (currentDataView === "GridDataView") {
                            this.set("QuickSearchFilterString", filtersValue);
                            this.set("QuickSearchFilters", filterItem);
                            var grid = this.getGridData();
                            grid.clear();
                            this.loadGridData();
                        } else if (currentDataView === "BasketDataView") {
                            var collection = this.get("BasketViewGridCollection");
                            var filteredCollection = Ext.isEmpty(filtersValue) ?
                                collection :
                                collection.filterByFn(
                                    function(item) {
                                        return (item.get("Name").indexOf(filtersValue) === 0 ||
                                        item.get("Code").indexOf(filtersValue) === 0);
                                    }
                                );
                            var gridData = this.getGridData();
                            gridData.clear();
                            gridData.loadAll(filteredCollection);
                            MaskHelper.HideBodyMask();
                        }
                    },

// Folders Manager
                    /**
                     * Загружает модуль менеджера групп.
                     * @protected
                     * @param {Object} renderTo Контейнер для отображения.
                     */
                    loadFolderManager: function(renderTo) {
                        this.set("FoldresModuleRenderTo", renderTo);
                        var folderManagerModuleId = sandbox.id + "_FolderManagerModule";
                        sandbox.subscribe("FolderInfo", function() {
                            return this.getFolderManagerConfig(this.get("EntitySchema"));
                        }, this, [folderManagerModuleId]);
                        sandbox.subscribe("UpdateCatalogueFilter", function(filterItem) {
                            this.onFilterUpdate(filterItem.key, filterItem.filters, filterItem.filtersValue);
                        }, this);
                        sandbox.loadModule("FolderManager", {
                            renderTo: renderTo,
                            id: folderManagerModuleId
                        });
                    },

                    /**
                     * Возвращает настройку менеджера групп.
                     * @protected
                     * @overriden
                     * @param {Terrasoft.EntitySchema} schema Схема.
                     * @returns {Object}
                     */
                    getFolderManagerConfig: function(schema) {
                        var filterValues = [{
                            columnPath: "IsArchive",
                            value: false
                        }];
                        var config = {
                            entitySchemaName: "ProductFolder",
                            sectionEntitySchema: schema,
                            activeFolderId: null,
                            catalogueRootRecordItem: {
                                value: DistributionConstants.ProductFolder.RootCatalogueFolder.RootId,
                                displayValue: resources.localizableStrings.ProductCatalogueRootCaption
                            },
                            catalogAdditionalFiltersValues: filterValues,
                            isProductSelectMode: true,
                            closeVisible: false
                        };
                        return config;
                    },

                    /**
                     * Обрабатывает изменение фильтров.
                     * @protected
                     * @param {String} filterKey Ключ фильтра.
                     * @param {Terrasoft.data.filters.FilterGroup} filterItem Фильтр.
                     */
                    onFilterUpdate: function(filterKey, filterItem) {
                        if (this.get("CurrentDataView") === "GridDataView") {
                            this.set("CatalogueFilters", filterItem);
                            var grid = this.getGridData();
                            grid.clear();
                            this.loadGridData();
                        }
                    }
                }
            };
            return viewModelConfig;
        }

        return {
            generate: generate
        };
    }
);
