define("OrderPageV2", ['OrderConfigurationConstants', "MoneyModule"],
    function(OrderConfigurationConstants, MoneyModule) {
        return {
            entitySchemaName: "Order",
            attributes:{
                "IsNeedReload": {
                    dataValueType: Terrasoft.DataValueType.BOOLEAN,
                    type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                    value: false
                },
                "AddressSuggest": {
                    dataValueType: Terrasoft.DataValueType.TEXT,
                    type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                    value: ""
                },
                "isSuggestNeeded": {
                    dataValueType: Terrasoft.DataValueType.BOOLEAN,
                    type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                    value: true
                },
                "SxLinq":{
                    dependencies: [
                        {
                            columns: ["SxMail"],
                            methodName: "createLink"
                        }
                    ]
                }
            },
            messages:{
                "SetPrimaryValues": {
                    mode: this.Terrasoft.MessageMode.PTP,
                    direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
                },
                "GetCurrency": {
                    mode: this.Terrasoft.MessageMode.PTP,
                    direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
                },
                "GetCountry": {
                    mode: this.Terrasoft.MessageMode.PTP,
                    direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
                },
                "UpdateEntityFromAddressDetail":{
                    mode: this.Terrasoft.MessageMode.PTP,
                    direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
                },
                "ReloadOrderPageValues":{
                    mode: this.Terrasoft.MessageMode.PTP,
                    direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
                }
            },
            methods: {
                isCountryRussia: function() {
                    var c = this.get("SxCountry") || {};
                    return (c.value === "a570b005-e8bb-df11-b00f-001d60e938c6");
                },
                initAddressList: function() {
                    this.adressList = Ext.create("Terrasoft.ListView", {
                        alignEl: Ext.get('OrderPageV2AddressSuggestContainer_Control')
                    });
                    this.adressList.on('select', function(el){
                        var data = el.value.data;
                        if(!data.postal_code) {
                            this.set("SxAddress", el.value.value);
                        } else {
                            Terrasoft.showConfirmation("Выбран адресс:\n" + el.displayValue + "\nс почтовым индексом: "+
                                data.postal_code + "\nСохранить?",
                                function(tag){
                                    this.set("SxAddress", el.displayValue.split(", ").splice(1).join(", "));
                                    this.set("SxZip", data.postal_code);
                                    this.loadLookups(data.city, data.region, data.city_with_type, data.region_with_type);
                                }, ["yes", "no"], this);
                        }
                        this.adressList.hide();
                    }, this);
                    this.on("destroy", function() {
                        Ext.getBody().removeListener('mousedown', this.onMouseDownCollapse, this);
                        this.adressList.destroy();
                    }, this);
                    Ext.getBody().on('mousedown', this.onMouseDownCollapse, this);
                    Ext.ComponentMgr.all.map.OrderPageV2AddressSuggestTextEdit.on('keyup', this.suggest, this);
                    this.set("AddressListInited", true);
                },
                loadLookups: function(city, region, city_with_type, region_with_type) {
                    var bq = Ext.create("Terrasoft.BatchQuery");
                    var esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "City"});
                    esq.addColumn("Id");
                    esq.filters.add("NameFilter", this.Terrasoft.createColumnFilterWithParameter(
                        this.Terrasoft.ComparisonType.EQUAL, "Name", city));
                    bq.add(esq);

                    esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "Region"});
                    esq.addColumn("Id");
                    esq.filters.add("NameFilter", this.Terrasoft.createColumnFilterWithParameter(
                        this.Terrasoft.ComparisonType.EQUAL, "Name", region));
                    bq.add(esq);

                    bq.execute(function(response) {
                        if (response && response.success) {
                            var cities = response.queryResults[0].rows,
                                regions = cityFounded = response.queryResults[1].rows;
                            if(regions.length > 0) {
                                this.set("SxRegion", {value: regions[0].Id, displayValue: region});
                                this.set("SxAddress", this.get("SxAddress").replace(region_with_type + ", ", ""));
                            }
                            if(cities.length > 0) {
                                this.set("SxCity", {value: cities[0].Id, displayValue: city});
                                this.set("SxAddress", this.get("SxAddress").replace(city_with_type+ ", ", ""));
                            }
                            if(cities.length == 0 && regions.length == 0) {
                                Terrasoft.showConfirmation("В справочнике Областей не найдено значение:\n" + region
                                    + ".\nВ справочнике Городов не найдено значение:\n" + city
                                    + ".\nСоздать указанные значения?",
                                    function(tag){
                                        if(tag == 'cancel') return;
                                        var bq = Ext.create("Terrasoft.BatchQuery");
                                        if(tag == 'both' || tag == 'region') {
                                            var iq = Ext.create('Terrasoft.InsertQuery', {rootSchemaName: 'Region'});
                                            var regionId = Terrasoft.generateGUID();
                                            iq.setParameterValue('Id', regionId, Terrasoft.DataValueType.GUID);
                                            iq.setParameterValue('Country', this.get('Country').value,
                                                Terrasoft.DataValueType.GUID);
                                            iq.setParameterValue('Name', region, Terrasoft.DataValueType.TEXT);
                                            bq.add(iq);
                                        }
                                        if(tag == 'both' || tag == 'city') {
                                            var iq = Ext.create('Terrasoft.InsertQuery', {rootSchemaName: 'City'});
                                            var cityId = Terrasoft.generateGUID();
                                            iq.setParameterValue('Id', cityId, Terrasoft.DataValueType.GUID);
                                            iq.setParameterValue('Country', this.get('Country').value,
                                                Terrasoft.DataValueType.GUID);
                                            iq.setParameterValue('Region', regionId, Terrasoft.DataValueType.GUID);
                                            iq.setParameterValue('Name', city, Terrasoft.DataValueType.TEXT);
                                            bq.add(iq);
                                        }
                                        bq.execute(function(response) {
                                            if(response.success) {
                                                if(tag == 'both' || tag == 'region') {
                                                    this.set('SxRegion', {value: regionId, displayValue: region});
                                                    this.set("SxAddress", this.get("SxAddress").replace(region_with_type + ", ", ""));
                                                }
                                                if(tag == 'both' || tag == 'city') {
                                                    this.set('SxCity', {value: cityId, displayValue: city});
                                                    this.set("SxAddress", this.get("SxAddress").replace(city_with_type + ", ", ""));
                                                }
                                            }
                                        }, this);
                                    }, [
                                        {className: 'Terrasoft.Button', caption: 'Регион и город', returnCode: 'both'},
                                        {className: 'Terrasoft.Button', caption: 'Регион',         returnCode: 'region'},
                                        {className: 'Terrasoft.Button', caption: 'Город',          returnCode: 'city'},
                                        {className: 'Terrasoft.Button', caption: 'Отмена',         returnCode: 'cancel'}
                                    ], this);
                            } else if(regions.length == 0) {
                                Terrasoft.showConfirmation("В справочнике Областей не найдено значение:\n" + region
                                    + ".\nСоздать указанное значение?",
                                    function(tag){
                                        if(tag == 'no') return;
                                        var bq = Ext.create("Terrasoft.BatchQuery");
                                        var iq = Ext.create('Terrasoft.InsertQuery', {rootSchemaName: 'Region'});
                                        var regionId = Terrasoft.generateGUID();
                                        iq.setParameterValue('Id', regionId, Terrasoft.DataValueType.GUID);
                                        iq.setParameterValue('Country', this.get('Country').value,
                                            Terrasoft.DataValueType.GUID);
                                        iq.setParameterValue('Name', region, Terrasoft.DataValueType.TEXT);
                                        bq.add(iq);
                                        bq.execute(function(response) {
                                            if(response.success) {
                                                this.set('SxRegion', {value: regionId, displayValue: region});
                                                this.set("SxAddress", this.get("Address").replace(region_with_type + ", ", ""));
                                            }
                                        }, this);
                                    }, ["yes", "no"], this);
                            } else if (cities.length == 0) {
                                Terrasoft.showConfirmation("В справочнике Городов не найдено значение:\n" + city
                                    + ".\nСоздать указанное значение?",
                                    function(tag){
                                        if(tag == 'no') return;
                                        var bq = Ext.create("Terrasoft.BatchQuery");
                                        var iq = Ext.create('Terrasoft.InsertQuery', {rootSchemaName: 'City'});
                                        var cityId = Terrasoft.generateGUID();
                                        iq.setParameterValue('Id', cityId, Terrasoft.DataValueType.GUID);
                                        iq.setParameterValue('Country', this.get('Country').value,
                                            Terrasoft.DataValueType.GUID);
                                        iq.setParameterValue('Region', regions[0].Id, Terrasoft.DataValueType.GUID);
                                        iq.setParameterValue('Name', city, Terrasoft.DataValueType.TEXT);
                                        bq.add(iq);
                                        bq.execute(function(response) {
                                            if(response.success) {
                                                this.set('SxCity', {value: cityId, displayValue: city});
                                                this.set("SxAddress", this.get("SxAddress").replace(city_with_type + ", ", ""));
                                            }
                                        }, this);
                                    }, ["yes", "no"], this);
                            }
                        }
                    }, this);
                },
                suggest: function(el) {
                    if(this.isCountryRussia())
                        Ext.Ajax.request({
                            method: 'POST',
                            url: 'https://dadata.ru/api/v1/suggest/address',
                            headers: {
                                'Authorization': 'Token bf69a05b6ce842dcd0cbc159648d19a8c49fdf33',
                                'Content-Type': 'application/json'
                            },
                            jsonData: JSON.stringify({
                                query: this.get('SxCountry').displayValue + ' ' + el.el.getValue()
                            }),
                            success: function(response) {
                                var items = Ext.decode(response.responseText).suggestions;
                                this.adressList.listItems = [];
                                for(var i = 0; i < items.length; i++) {
                                    this.adressList.listItems.push({value: items[i], displayValue: items[i].value});
                                }
                                if(items.length) {
                                    this.adressList.alignEl= Ext.get('OrderPageV2AddressSuggestContainer_Control');
                                    this.adressList.show();}
                                else this.adressList.hide();
                            },
                            scope: this
                        });
                },
                onMouseDownCollapse: function(e) {
                    if(this.adressList.visible) {
                        var isInWrap = e.within(Ext.ComponentMgr.all.map.OrderPageV2AddressSuggestTextEdit.getWrapEl());
                        var listView = this.adressList;
                        var isInList = Ext.isEmpty(listView) || e.within(listView.getWrapEl());
                        if (!isInWrap && !isInList) {
                            this.adressList.hide();
                        }
                    }
                },
                refreshControlsState: function() {
                    if(!this.get("Address")) {
                        this.set("isAddressRequired", true);
                    }
                    var country = this.get("Country") || {};
                    this.set("isCountryRequired", !country.value);
                    this.set("isAddressEnabled", !!country.value);
                    if(this.isCountryRussia()) {
                        var value = (this.get("AddressType") || {}).value !== "588a794c-5808-415a-b9e3-f19326e33fc8";
                        this.set("isSuggestNeeded", value);
                    } else {
                        this.set("isSuggestNeeded", false);
                    }
                },
                reloadLink: function() {
                    var control = Ext.ComponentManager.all.map.OrderPageV2SxLinqTextEdit;
                    if(control) {
                        control.setEnabled(true);
                        control.value = this.get('SxLinq');
                        control.showValueAsLink = true;
                        control.reRender();
                        //control.setLinkMode(true);
                        if(control.linkEl) {
                            control.linkEl.dom.href = this.get('SxLinq');
                            control.linkEl.dom.target = '_blank';
                        }
                        //control.setLinkMode(true);
                        control.setEnabled(false);
                    }
                },
                createLink:function() {
                    var mail = this.get("SxMail");
                    if (mail) {
                        switch (mail.value) {
                            case "ec82cf93-0994-4eb0-82a7-b991c55d5dde":
                                this.set("SxLinq", "http://novaposhta.ua/office/list");
                                break;
                            case "bc085176-2cd3-4869-8b5c-2f396061be6a":
                                this.set("SxLinq", "http://www.intime.ua/representations/");
                                break;
                            case "4755794d-1b20-499a-bccd-bc521d7f8c4c":
                                this.set("SxLinq",
                                    "http://www.delivery-auto.com/ru-RU/Representatives/RepresentativesList");
                                break;
                            default:
                                this.set("SxLinq","")
                        }
                    }
                },
                IsAddressGroupVisible: function(){
                    if (this.isAddMode()){
                        return true;
                    }
                    else
                        return false;
                },
                IsAddressDetailVisible: function(){
                    return !this.IsAddressGroupVisible();
                },
                isUkraine: function(){
                    if(this.get("SxCountry")){
                        if(this.get("SxCountry").value=="a470b005-e8bb-df11-b00f-001d60e938c6"){
                            return true;
                        }
                        else
                            return false;
                    }
                    else
                        return false;
                },
                validateOrderStatus: function(callback, scope) {
                    var result = {
                        success: true
                    };
                    var status = this.get("Status");
                    var primaryAmount = this.get("PrimaryAmount");
                    var OrderStatus = OrderConfigurationConstants.Order.OrderStatus;
                    if (status && (status.value === OrderStatus.InPlanned || status.value === OrderStatus.Canceled)) {
                        callback.call(scope || this, result);
                        return;
                    }
                    var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
                        rootSchemaName: "SupplyPaymentElement"
                    });
                    esq.addAggregationSchemaColumn("PrimaryAmountPlan", Terrasoft.AggregationType.SUM,
                        "PrimaryAmountPlanSum");
                    var filters = Terrasoft.createFilterGroup();
                    filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                        "Order", this.get("Id")));
                    filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                        "Type", OrderConfigurationConstants.SupplyPaymentElement.Type.Payment));
                    esq.filters = filters;
                    esq.getEntityCollection(function(response) {
                        if (response.success) {
                            var collection = response.collection;
                            if (collection.getCount() > 0 && primaryAmount !==
                                collection.getByIndex(0).get("PrimaryAmountPlanSum")) {
                                //result.message = this.get("Resources.Strings.ValidateOrderStatus");
                                //result.success = false;

                            }

                        } else {
                            return;
                        }
                        callback.call(this, result);
                    }, scope);
                },
                init: function(){
                    this.callParent(arguments);
                    this.on('change:SxLinq', this.reloadLink);

                    this.sandbox.subscribe("GetCurrency", function(){
                        return this.get("Currency").displayValue;
                    },this);
                    this.sandbox.subscribe("GetCountry", function(){
                        return this.get("SxCountry").value;
                    },this);
                    this.sandbox.subscribe("UpdateEntityFromAddressDetail", function(){
                        this.reloadEntity();
                    }, this);
                    this.sandbox.subscribe("SetPrimaryValues", function(){
                        this.setPrimaryValues();
                    },this);
                    this.sandbox.subscribe("ReloadOrderPageValues", function(){

                        var select = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "Order"});
                        select.addColumn("Id");
                        select.addColumn("SxPaymentAmountPlan");
                        select.addColumn("SxDeliveryPricePlan");
                        select.addColumn("Amount");
                        //n.set("sxAccount", null);
                        //n.set("sxContact", null);
                        var filter = Terrasoft.createColumnFilterWithParameter(
                               Terrasoft.ComparisonType.EQUAL, "Id", this.get("Id"));
                        select.filters.addItem(filter);
                        var TmpThis=this;
                        select.getEntityCollection(function (result) {
                            //debugger;
                            //var EntityCollection = result.collection.collection.items;
                            if(result.collection.collection.items[0]){
                                TmpThis.set("SxPaymentAmountPlan",
                                    result.collection.collection.items[0].get("SxPaymentAmountPlan"),true);
                                TmpThis.set("SxDeliveryPricePlan",
                                    result.collection.collection.items[0].get("SxDeliveryPricePlan"),true);
                                TmpThis.set("Amount",
                                    result.collection.collection.items[0].get("Amount"),true);
                            }
                        });
                        //this.set("IsNeedReload", true);
                        //this.reloadEntity();
                        //this.onReloadCard();
                    },this);

                },
                asyncValidate: function(callback, scope) {
                    this.callParent([function(response) {
                        var checkResponse = function(context) {
                            if (!context.response.success) {
                                context.callback.call(context.scope, context.response);
                            } else {
                                context.next();
                            }
                        };
                        var validationChain = [
                            checkResponse,
                            function(context) {
                                context.scope.validateAccountOrContactFilling(function(response) {
                                    context.response = response;
                                    context.next();
                                }, context.scope);
                            },
                            function(context) {
                                context.callback.call(context.scope, context.response);
                            }
                        ];
                        Terrasoft.chain({
                            scope: scope || this,
                            response: response,
                            callback: callback
                        }, validationChain);
                    }, this]);
                },
                onEntityInitialized: function(){
                    this.callParent(arguments);
                    this.setPrimaryValues();
                    this.initAddressList();
                    this.refreshControlsState();
                    if(this.get("IsNeedReload")){
                        //debugger;
                        //this.set("IsNeedReload", false);
                        //this.reloadEntity();
                        //this.onReloadCard();
                    }
                },
                reloadEntity: function(){
                    this.callParent(arguments);
                },
                setPrimaryValues: function(){
                    MoneyModule.LoadCurrencyRate.call(this, "Currency", "CurrencyRate", this.get("StartDate"), function() {
                        var division = this.getCurrencyDivision();
                        /*MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "Amount", "PrimaryAmount",
                         division);
                         MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "PaymentAmount", "PrimaryAmount",
                         division);*/
                        MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "SxPaymentAmountPlan", "SxPaymentAmountPlanPrimary",
                            division);
                        MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "SxDeliveryPriceFact", "SxDeliveryPriceFactPrimary",
                            division);
                        MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "SxDeliveryPricePlan", "SxDeliveryPricePlanPrimary",
                            division);
                    });
                },
                onChangeCurrency: function() {
                    var Currency = this.get("SxCurrency") || {};
                    var CurrentId = this.get("Id");
                    var th = this;
                    var GetCurr=Ext.create("Terrasoft.EntitySchemaQuery",{rootSchemaName: "OrderProduct"})
                    GetCurr.addColumn("Order");
                    GetCurr.addColumn("Id");
                    GetCurr.addColumn("Product");
                    GetCurr.filters.add("OrderFilter", this.Terrasoft.createColumnFilterWithParameter(
                        this.Terrasoft.ComparisonType.EQUAL, "Order", CurrentId));
                    GetCurr.getEntityCollection(function(response) {
                        if (response.success && response.collection) {
                            var items = response.collection.getItems();
                            if (items.length > 0) {
                                items.forEach(function(item,i,items){
                                    var product=item.get("Product");
                                    var OrderProductId=item.get("Id");
                                    var PriceListEsq=Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "ProductPrice"});
                                    PriceListEsq.addColumn("Product");
                                    PriceListEsq.addColumn("PriceList");
                                    PriceListEsq.addColumn("Price");
                                    PriceListEsq.addColumn("Currency");
                                    PriceListEsq.filters.add("ProductFilter", this.Terrasoft.createColumnFilterWithParameter(
                                        this.Terrasoft.ComparisonType.EQUAL, "Product", product.value));
                                    PriceListEsq.filters.add("CurrencyFilter", this.Terrasoft.createColumnFilterWithParameter(
                                        this.Terrasoft.ComparisonType.EQUAL, "Currency", Currency.value));
                                    PriceListEsq.getEntityCollection(function(response){
                                        if (response.success && response.collection) {
                                            var items = response.collection.getItems();
                                            items.forEach(function(item,i,items){
                                                var newprice=item.get("Price");
                                                var update = this.Ext.create("Terrasoft.UpdateQuery", {
                                                    rootSchemaName: "OrderProduct"
                                                });
                                                update.setParameterValue("Price", newprice, this.Terrasoft.DataValueType.FLOAT);
                                                update.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
                                                    this.Terrasoft.ComparisonType.EQUAL, "Id",  OrderProductId));
                                                update.execute(th.updateDetails);
                                                /*setTimeout(function(){
                                                    th.updateDetails();
                                                },2000);*/
                                            })
                                        }
                                    },this);
                                })
                            }
                        }
                    }, this);
                    th.updateDetails();
                },
                getActions: function() {
                    var actionMenuItems = this.callParent(arguments);
                    actionMenuItems.addItem(this.getButtonMenuItem({
                        "Caption": {"bindTo": "CombinedModeActionsButtonHeaderMenuItemCaption"},
                        "Type": "Terrasoft.MenuSeparator",
                        "Visible": false
                    }));
                    actionMenuItems.addItem(this.getButtonMenuItem({
                        "Caption": "sms",
                        "Tag": "sendsms"
                    }));
                    actionMenuItems.addItem(this.getButtonMenuItem({
                        "Caption": "checkstatus",
                        "Tag": "checkstatus"
                    }));
                    return actionMenuItems;
                },
                checkstatus:function(){
                    debugger;
                    this.showBodyMask();

                    var serviceConfig = {
                        serviceName: "SxSMSApi",
                        methodName: "CheckStatus",
                        timeout: 20 * 60 * 1000
                    };
                    var callback = this.Terrasoft.emptyFn;

                    /*callback = function (response) {
                     var key = response.GetSMSXMLResult;
                     //this.downloadXML("TOTALINFO.xml", key);
                     };*/
                    this.callService(serviceConfig, function (response) {
                        this.hideBodyMask();
                        callback.call(this, response);
                    }, this);
                },
                /*PaymentAmountCalculate: function(){
                    var paymentAmount=this.get("Amount")+this.get("SxDeliveryPrice");
                    this.set("SxPaymentAmountPlan",paymentAmount);
                },*/
                sendsms: function(){
                    debugger;
                    this.showBodyMask();

                    var serviceConfig = {
                        serviceName: "SxSMSApi",
                        methodName: "SendSMS",
                        timeout: 20 * 60 * 1000
                    };
                    var callback = this.Terrasoft.emptyFn;

                    /*callback = function (response) {
                        var key = response.GetSMSXMLResult;
                        //this.downloadXML("TOTALINFO.xml", key);
                    };*/
                    this.callService(serviceConfig, function (response) {
                        this.hideBodyMask(); 
                        callback.call(this, response);
                    }, this);
                },
                /**
                 * Вызывается при изменении валюты
                 * @protected
                 */
                onCurrencyChanged: function() {
                    this.set("ShowSaveButton", true);
                    this.set("ShowDiscardButton", true);
                    this.set("IsChanged", true, {silent: true});


                    MoneyModule.LoadCurrencyRate.call(this, "Currency", "CurrencyRate", this.get("StartDate"), function() {
                        var division = this.getCurrencyDivision();
                        /*MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "Amount", "PrimaryAmount",
                            division);
                        MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "PaymentAmount", "PrimaryAmount",
                            division);*/
                       /* MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "SxPaymentAmountPlan", "SxPaymentAmountPlanPrimary",
                            division);
                        MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "SxDeliveryPriceFact", "SxDeliveryPriceFactPrimary",
                            division);
                        MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "SxDeliveryPricePlan", "SxDeliveryPricePlanPrimary",
                            division);*/


                        MoneyModule.RecalcCurrencyValue.call(this, "CurrencyRate", "Amount", "PrimaryAmount",
                            division);
                        MoneyModule.RecalcCurrencyValue.call(this, "CurrencyRate", "PaymentAmount", "PrimaryPaymentAmount",
                            division);
                        MoneyModule.RecalcCurrencyValue.call(this, "CurrencyRate", "SxPaymentAmountPlan", "SxPaymentAmountPlanPrimary",
                            division);
                        MoneyModule.RecalcCurrencyValue.call(this, "CurrencyRate", "SxDeliveryPriceFact", "SxDeliveryPriceFactPrimary",
                            division);
                        MoneyModule.RecalcCurrencyValue.call(this, "CurrencyRate", "SxDeliveryPricePlan", "SxDeliveryPricePlanPrimary",
                            division);
                    });
                },
//SxPaymentAmountPlan SxDeliveryPriceFact  SxDeliveryPricePlan

                /**
                 * Возвращает коэффициент деления
                 * @protected
                 */
                getCurrencyDivision: function() {
                    var currency = this.get("Currency");
                    return currency && currency.Division;
                }

            },
            details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
            diff: /**SCHEMA_DIFF*/[
                /*{
                    "operation": "remove",
                    "name": "OrderAddressAndDelivery"
                },*/
                /*{
                    "operation": "insert",
                    "parentName": "DeliveryTypeAndAddressTab",
                    "propertyName": "items",
                    "name": "OrderAddressAndDelivery",
                    "values": {"itemType": Terrasoft.ViewItemType.DETAIL},
                    "visible":{bindTo:"IsAddressDetailVisible"}
                },*/
                {
                    "operation": "insert",
                    "parentName": "DeliveryTypeAndAddressTab",
                    "name": "AddressDeliveryControlBlock",
                    "propertyName": "items",
                    "values": {
                        "itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
                        "caption": "Адрес и способ доставки",
                        "items": [],
                        "controlConfig": {"collapsed": false},
                        "visible":{"bindTo":"IsAddressGroupVisible"}
                    },
                    index:0
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryControlBlock",
                    "propertyName": "items",
                    "name": "AddressDeliveryGridLayout",
                    "values": {
                        "itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
                        "items": []
                    },
                    index:0
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryGridLayout",
                    "propertyName": "items",
                    "name": "DeliveryType",
                    "values": {
                        "bindTo": "DeliveryType",
                        "layout": {"column": 0, "row": 0, "colSpan": 12}
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryGridLayout",
                    "propertyName": "items",
                    "name": "SxCountry",
                    "values": {
                        "bindTo": "SxCountry",
                        "layout": {"column": 0, "row": 1, "colSpan": 12}
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryGridLayout",
                    "propertyName": "items",
                    "name": "SxCity",
                    "values": {
                        "bindTo": "SxCity",
                        "layout": {"column": 0, "row": 2, "colSpan": 12}
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryGridLayout",
                    "propertyName": "items",
                    "name": "SxRegion",
                    "values": {
                        "bindTo": "SxRegion",
                        "layout": {"column": 12, "row": 1, "colSpan": 12}
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryGridLayout",
                    "propertyName": "items",
                    "name": "SxZip",
                    "values": {
                        "bindTo": "SxZip",
                        "layout": {"column": 12, "row": 2, "colSpan": 12}
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryGridLayout",
                    "propertyName": "items",
                    "name": "SxAddress",
                    "values": {
                        "bindTo": "SxAddress",
                        "layout": {"column": 0, "row": 3, "colSpan": 12}
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryGridLayout",
                    "propertyName": "items",
                    "name": "AddressSuggest",
                    "values": {
                        "bindTo": "AddressSuggest",
                        "layout": {"column": 0, "row": 4, "colSpan": 24},
                        "caption": "Подбор адреса"//,
                       // enabled: {"bindTo": "isSuggestNeeded"}
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryControlBlock",
                    "propertyName": "items",
                    "name": "AddressDeliveryMailGridLayout",
                    "values": {
                        "itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
                        "items": [],
                        "visible": {bindTo:"isUkraine"}
                    },
                    index:1
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryMailGridLayout",
                    "propertyName": "items",
                    "name": "SxMail",
                    "values": {
                        "bindTo": "SxMail",
                        "layout": {"column": 0, "row": 0, "colSpan": 12}
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryMailGridLayout",
                    "propertyName": "items",
                    "name": "SxLinq",
                    "values": {
                        "bindTo": "SxLinq",
                        "layout": {"column": 12, "row": 0, "colSpan": 12}
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryMailGridLayout",
                    "propertyName": "items",
                    "name": "SxAddressOfDepartament",
                    "values": {
                        "bindTo": "SxAddressOfDepartament",
                        "layout": {"column": 0, "row": 1, "colSpan": 12}
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "AddressDeliveryMailGridLayout",
                    "propertyName": "items",
                    "name": "SxNumberOfDepartament",
                    "values": {
                        "bindTo": "SxNumberOfDepartament",
                        "layout": {"column": 12, "row": 1, "colSpan": 12}
                    }
                },
                {
                    "operation": "remove",
                    "name": "SxCurrency"
                },
                {
                    "operation": "remove",
                    "name": "Document"
                },
                {
                    "operation": "remove",
                    "name": "Invoice"
                },
                {
                    "operation": "remove",
                    "name": "SourceOrder"
                },
                {
                    "operation": "remove",
                    "name": "Owner"
                },
                {
                    "operation": "remove",
                    "name": "DueDate"
                },
                {
                    "operation": "remove",
                    "name": "ActualDate"
                },
                {
                    "operation": "remove",
                    "name": "PaymentStatus"
                },
                {
                    "operation": "remove",
                    "name": "DeliveryStatus"
                },
                {
                    "operation": "remove",
                    "name": "Number"
                },
                {
                    "operation": "remove",
                    "name": "OrderPassportTab"
                },

                {
                    "operation": "insert",
                    "name": "Number",
                    "parentName": "OrderPageGeneralInformationBlock",
                    "propertyName": "items",
                    "values": {
                        "bindTo": "Number",
                        "layout": {"column": 0, "row": 0, "colSpan": 12},
                        "contentType": Terrasoft.ContentType.ENUM
                    }
                },
                {
                    "operation": "insert",
                    "name": "SourceOrder",
                    "parentName": "OrderPageGeneralInformationBlock",
                    "propertyName": "items",
                    "values": {
                        "bindTo": "SourceOrder",
                        "layout": {"column": 12, "row": 1, "colSpan": 12},
                        "contentType": Terrasoft.ContentType.ENUM
                    }
                },
                {
                    "operation": "insert",
                    "name": "Owner",
                    "parentName": "OrderPageGeneralInformationBlock",
                    "propertyName": "items",
                    "values": {
                        "bindTo": "Owner",
                        "layout": {"column": 0, "row": 1, "colSpan": 12},
                        "contentType": Terrasoft.ContentType.ENUM
                    }
                },
                {
                    "operation": "insert",
                    "name": "DueDate",
                    "parentName": "OrderPageGeneralInformationBlock",
                    "propertyName": "items",
                    "values": {
                        "bindTo": "DueDate",
                        "layout": {"column": 0, "row": 3, "colSpan": 12},
                        "contentType": Terrasoft.ContentType.ENUM
                    }
                },
                {
                    "operation": "insert",
                    "name": "ActualDate",
                    "parentName": "OrderPageGeneralInformationBlock",
                    "propertyName": "items",
                    "values": {
                        "bindTo": "ActualDate",
                        "layout": {"column": 12, "row": 3, "colSpan": 12}
                    }
                },
                {
                    "operation": "insert",
                    "name": "SxPaymentType",
                    "parentName": "OrderPageGeneralInformationBlock",
                    "propertyName": "items",
                    "values": {
                        "bindTo": "SxPaymentType",
                        "layout": {"column": 12, "row": 4, "colSpan": 12},
                        "contentType": Terrasoft.ContentType.ENUM
                    }
                },
                {
                    "operation": "insert",
                    "name": "SxTakingDate",
                    "parentName": "OrderPageGeneralInformationBlock",
                    "propertyName": "items",
                    "values": {
                        "bindTo": "SxTakingDate",
                        "layout": {"column": 0, "row": 5, "colSpan": 12}
                    }
                },
                {
                    "operation": "insert",
                    "name": "PaymentStatus",
                    "parentName": "OrderPageGeneralInformationBlock",
                    "propertyName": "items",
                    "values": {
                        "bindTo": "PaymentStatus",
                        "layout": {"column": 0, "row": 2, "colSpan": 12},
                        "contentType": Terrasoft.ContentType.ENUM
                    }
                },
                {
                    "operation":"remove",
                    "name":"AddressSelectionDetailResultsTab"
                },
                {
                    "operation":"remove",
                    "name":"OrderPageDeliveryAndPaymentBlock"
                },
                {
                    "operation":"remove",
                    "name":"OrderResultsDeliveryAndPaymentControlBlock"
                },

                {
                    "operation": "insert",
                    "name": "DeliveryStatus",
                    "parentName": "OrderPageGeneralInformationBlock",
                    "propertyName": "items",
                    "values": {
                        "bindTo": "DeliveryStatus",
                        "layout": {"column": 12, "row": 2, "colSpan": 12},
                        "contentType": Terrasoft.ContentType.ENUM
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "OrderPageGeneralInformationBlock",
                    "propertyName": "items",
                    "name": "SxReturnCosts",
                    "values": {
                        "bindTo": "SxReturnCosts",
                        "primaryAmount": "SxReturnCostsPrimary",
                        "currency": "Currency",
                        "rate": "CurrencyRate",
                        "primaryAmountEnabled": false,
                        "enabled": true,
                        "generator": "MultiCurrencyEditViewGenerator.generate",
                        "layout": {
                            "column": 12,
                            "row": 5,
                            "colSpan": 12,
                            "rowSpan": 1
                        }
                    }
                },
                {
                    "operation": "remove",
                    "name": "OrderGeneralInformationTab"
                },
                /*{
                    "operation": "merge",
                    "name": "HistoryTab",
                    "name": "OrderGeneralInformationTab",
                    "parentName": "Tabs",
                    "propertyName": "tabs",
                    "values": {
                        "caption": {"bindTo": "Resources.Strings.HistoryTabCaption"},
                        "items": []
                    },
                    "index": 4
                },*/
                /*{
                    "operation":"remove",
                    "name": "OrderHistoryTab"
                },*/
                {
                    "operation": "move",
                    "name": "OrderHistoryTab",
                    "parentName": "Tabs",
                    "propertyName": "tabs",
                    /*"values": {
                        "caption": {"bindTo": "Resources.Strings.OrderHistoryTabCaption"}
                    },*/
                    "index": 4
                },

                {
                    "operation": "merge",
                    "name": "OrderResultsTab",
                    "parentName": "Tabs",
                    "propertyName": "tabs",
                    "values": {
                        "caption": {"bindTo": "Resources.Strings.OrderResults"}//,
                        //"items": []
                    },
                    "index":6
                },
                {
                    "operation": "insert",
                    "name": "OrderGeneralInformationTab",
                    "parentName": "Tabs",
                    "propertyName": "tabs",
                    "values": {
                        "caption": {"bindTo": "Resources.Strings.OrderGeneralInformationTabCaption"},
                        "items": []
                    },
                    "index": 4
                },
                {
                    "operation": "remove",

                    "name": "OrderPageGeneralInformationBlock"


                },
                {
                    "operation": "insert",
                    "parentName": "OrderGeneralInformationTab",
                    "propertyName": "items",
                    "name": "OrderPageGeneralInformationBlock",
                    "values": {
                        "itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
                        "items": []
                    }
                },
                {
                    "operation": "insert",
                    "name": "PayGraphicTab",
                    "parentName": "Tabs",
                    "propertyName": "tabs",
                    "values": {
                        "caption": "График поставок и оплат",
                        "items": []
                    },
                    "index": 2
                },
                {
                    "operation": "insert",
                    "parentName": "PayGraphicTab",
                    "propertyName": "items",
                    "name": "PayGraphicInformationBlock",
                    "values": {
                        "itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
                        "items": []
                    }
                },
                {
                    "operation": "insert",
                    "name": "DeliveryTypeAndAddressTab",
                    "parentName": "Tabs",
                    "propertyName": "tabs",
                    "values": {
                        "caption": "Адрес и способ доставки",
                        "items": []
                    },
                    "index": 1
                },
                {
                    "operation": "insert",
                    "parentName": "DeliveryTypeAndAddressTab",
                    "propertyName": "items",
                    "name": "DeliveryTypeAndAddressInformationBlock",
                    "values": {
                        "itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
                        "items": []
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "PayGraphicTab",
                    "propertyName": "items",
                    "name": "SupplyPayment",
                    "values": {"itemType": Terrasoft.ViewItemType.DETAIL}
                },

                {
                    "operation":"remove",
                    "name":"OrderAddressAndDelivery"
                },
                {
                    "operation": "insert",
                    "parentName": "DeliveryTypeAndAddressTab",
                    "propertyName": "items",
                    "name": "OrderAddressAndDelivery",
                    "values": {"itemType": Terrasoft.ViewItemType.DETAIL,
                        "visible":{bindTo:"IsAddressDetailVisible"}}
                },


                //SxReturnCosts
                //DueDate ActualDate PaymentStatus DeliveryStatus
                /*{
                    "operation": "merge",
                    "name": "Date",
                    "values":{
                        layout: {
                            "col": 0,
                            "row": 0,
                            "colSpan": 12,
                            "rowSpan": 1
                        }
                    }
                }*/
                /*{
                    "operation": "insert",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "Amount",
                    "values": {
                        "bindTo": "Amount",
                        "layout": {"column": 12, "row": 0, "colSpan": 12},
                        "primaryAmount": "PrimaryAmount",
                        "currency": "Currency",
                        "rate": "CurrencyRate",
                        "primaryAmountEnabled": false,
                        "enabled": false,
                        "generator": "MultiCurrencyEditViewGenerator.generate"
                    }
                },*/
                {
                    "operation": "merge",
                    "name": "Amount",
                    "values": {
                        "layout": {
                            "column": 0,
                            "row": 2,
                            "colSpan": 12,
                            "rowSpan": 1
                        },
                        "enabled":true
                    }
                },
                {
                    "operation": "merge",
                    "name": "Date",
                    "values": {
                        "layout": {
                            "column": 12,
                            "row": 0,
                            "colSpan": 12,
                            "rowSpan": 1
                        }
                    }
                },
                {
                    "operation": "merge",
                    "name": "Contact",
                    "values": {
                        "layout": {
                            "column": 0,
                            "row": 4,
                            "colSpan": 12,
                            "rowSpan": 1
                        }
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "SxPaymentAmountPlan",
                    "values": {
                        "bindTo": "SxPaymentAmountPlan",
                        "primaryAmount": "SxPaymentAmountPlanPrimary",
                        "currency": "Currency",
                        "rate": "CurrencyRate",
                        "primaryAmountEnabled": false,
                        "enabled": false,
                        "generator": "MultiCurrencyEditViewGenerator.generate",
                        "layout": {
                            "column": 0,
                            "row": 0,
                            "colSpan": 12,
                            "rowSpan": 1
                        }
                    }
                },

                {
                    "operation": "merge",
                    "name": "PaymentAmount",
                    "values": {
                        "layout": {
                            "column": 12,
                            "row": 2,
                            "colSpan": 12,
                            "rowSpan": 1
                        },
                        "enabled": true
                    }
                },
                {
                    "operation": "merge",
                    "name": "SxPlatform",
                    "values": {
                        "layout": {
                            "column": 0,
                            "row": 3,
                            "colSpan": 12,
                            "rowSpan": 1
                        }
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "SxDeliveryPriceFact",
                    "values": {
                        "layout": {
                            "column": 12,
                            "row": 1,
                            "colSpan": 12,
                            "rowSpan": 1
                        },
                        "bindTo": "SxDeliveryPriceFact",
                        "primaryAmount": "SxDeliveryPriceFactPrimary",
                        "currency": "Currency",
                        "rate": "CurrencyRate",
                        "primaryAmountEnabled": false,
                        "enabled": true,
                        "generator": "MultiCurrencyEditViewGenerator.generate"
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "SxDeliveryPricePlan",
                    "values": {
                        "layout": {
                            "column": 0,
                            "row": 1,
                            "colSpan": 12,
                            "rowSpan": 1
                        },
                        "bindTo": "SxDeliveryPricePlan",
                        "primaryAmount": "SxDeliveryPricePlanPrimary",
                        "currency": "Currency",
                        "rate": "CurrencyRate",
                        "primaryAmountEnabled": false,
                        "enabled": false,
                        "generator": "MultiCurrencyEditViewGenerator.generate"
                    }
                },
                {
                    "operation": "remove",
                    "name": "SxDeliveryPrice"
                },
                {
                    "operation": "remove",
                    "name": "DeliveryType"
                },
                {
                    "operation": "remove",
                    "name": "PaymentType"
                },
                {
                    "operation": "remove",
                    "name": "DeliveryAddressDetail"
                },
                {
                    "operation": "remove",
                    "name": "SxTime"
                },
                /*{
                    "operation": "remove",
                    "name": "OrderResultsTab"
                },*/
                {
                    "operation": "remove",
                    "name": " DeliveryAddressDetail"
                },
                {
                    "operation": "remove",
                    "name": " DeliveryAddressDetail"
                },

                {
                    "operation":"remove",
                    "name":"OrderDeliveryTab"
                },

                {
                    "operation": "insert",
                    "parentName": "DeliveryTypeAndAddressTab",
                    "name": "OrderReceiverInformationBlock",
                    "propertyName": "items",
                    "values": {
                        "itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
                        "caption": {"bindTo": "Resources.Strings.OrderReceiverInformationGroupCaption"},
                        "items": [],
                        "controlConfig": {"collapsed": false}
                    }
                },

                {
                    "operation": "insert",
                    "parentName": "OrderReceiverInformationBlock",
                    "propertyName": "items",
                    "name": "RecieverInfoBlock",
                    "values": {
                        "itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
                        "items": []
                    },
                    index:0
                },
                {
                    "operation": "insert",
                    "parentName": "RecieverInfoBlock",
                    "propertyName": "items",
                    "name": "ContactNumber",
                    "values": {
                        "layout": {
                            "column": 0,
                            "row": 0,
                            "colSpan": 24,
                            "rowSpan": 1
                        }
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "RecieverInfoBlock",
                    "propertyName": "items",
                    "name": "ReceiverName",
                    "values": {
                        "layout": {
                            "column": 0,
                            "row": 1,
                            "colSpan": 24,
                            "rowSpan": 1
                        }
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "RecieverInfoBlock",
                    "propertyName": "items",
                    "name": "Comment",
                    "values": {
                        "layout": {
                            "column": 0,
                            "row": 2,
                            "colSpan": 24,
                            "rowSpan": 1
                        }
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "OrderPageGeneralInformationBlock",
                    "propertyName": "items",
                    "name": "SxTTN",
                    "values": {
                        "bindTo": "SxTTN",
                        "layout": {"column": 12, "row": 0, "colSpan": 12}
                    }
                }
            ]/**SCHEMA_DIFF*/
        };
    });