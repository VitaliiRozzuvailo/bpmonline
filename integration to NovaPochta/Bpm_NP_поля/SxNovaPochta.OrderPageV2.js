define("OrderPageV2", ["BusinessRuleModule", "ConfigurationConstants", "ServiceHelper"],
    function (BusinessRuleModule, ConfigurationConstants, ServiceHelper) {
        return {
            entitySchemaName: "Order",
            attributes: {
                "SxLinq": {
                    dependencies: [{
                        columns: ["SxMail"],
                        methodName: "createLink"
                    }]
                },
                "SxMail": {
                    dependencies: [{
                        columns: ["SxCountry"],
                        methodName: "resetMail"
                    }]
                },
                "SxIsAddress": {
                    dependencies: [{
                        columns: ["SxMail"],
                        methodName: "resetIsAddress"
                    }]
                },
                "SxNumberOfDepartament": {
                    "lookupListConfig": {
                        "filter": function () {
                            var city = !Ext.isEmpty(this.get('SxCity')) ? this.get('SxCity').value : '00000000-0000-0000-0000-000000000000';
                            return Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                            'SxCity', city);
                        }
                    }
                },
                "SxAddressOfDepartament": {
                    dependencies: [{
                        columns: ["SxNumberOfDepartament"],
                        methodName: "refreshAddressOfDepartment"
                    }]
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
                }
            },
            rules: {

                //tab - general information

                "SxSendingDate": {
                    BindParametrVisibileSxSendingDateBySxMail: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxMail"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "ec82cf93-0994-4eb0-82a7-b991c55d5dde"
                            }
                        }]
                    }
                },
                "SxDeliveryDate": {
                    BindParametrVisibileSxDeliveryDateBySxMail: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxMail"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "ec82cf93-0994-4eb0-82a7-b991c55d5dde"
                            }
                        }]
                    }
                },
                "SxReceivingDate": {
                    BindParametrVisibileSxReceivingDateBySxMail: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxMail"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "ec82cf93-0994-4eb0-82a7-b991c55d5dde"
                            }
                        }]
                    }
                },
                "SxTTNReceivingMoney": {
                    BindParametrVisibileSxTTNReceivingMoneyBySxMail: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxMail"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "ec82cf93-0994-4eb0-82a7-b991c55d5dde"
                            }
                        }]
                    }
                },
                "SxStatusByNovaPochta": {
                    BindParametrVisibileSxStatusByNovaPochtaBySxMail: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxMail"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "ec82cf93-0994-4eb0-82a7-b991c55d5dde"
                            }
                        }]
                    }
                },

                /// address and delivery method

                "SxIsAddress": {
                    BindParametrVisibileSxIsAddressBySxMail: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxMail"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "ec82cf93-0994-4eb0-82a7-b991c55d5dde"
                            }
                        }]
                    }
                },
                "SxIsRedelivery": {
                    BindParametrVisibileSxIsRedeliveryBySxMail: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxMail"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "ec82cf93-0994-4eb0-82a7-b991c55d5dde"
                            }
                        }]
                    }
                },
                "SxCountOfPlacesNP": {
                    BindParametrVisibileSxCountOfPlacesNPBySxMail: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxMail"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "ec82cf93-0994-4eb0-82a7-b991c55d5dde"
                            }
                        }]
                    }
                },
                "SxDeliveryTypeNP": {
                    BindParametrVisibileSxDeliveryTypeNPBySxMail: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxMail"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "ec82cf93-0994-4eb0-82a7-b991c55d5dde"
                            }
                        }]
                    }
                },
                //for russia
                "SxDeliveryState": {
                    BindParametrVisibileSxDeliveryStateBySxMail: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxCountry"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "a570b005-e8bb-df11-b00f-001d60e938c6"
                            }
                        }]
                    }
                },
                "SxLinq": {
                    BindParametrVisibileSxLinqBySxCountry: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxCountry"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "a470b005-e8bb-df11-b00f-001d60e938c6"
                            }
                        }]
                    }
                },
                "SxMail": {
                    BindParametrVisibileSxMailBySxCountry: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxCountry"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "a470b005-e8bb-df11-b00f-001d60e938c6"
                            }
                        }]
                    }
                },
                "SxAddressOfDepartament": {
                    BindParametrVisibileSxAddressOfDepartamentBySxCountry: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxCountry"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "a470b005-e8bb-df11-b00f-001d60e938c6"
                            }
                        }]
                    }
                },
                "SxNumberOfDepartament": {
                    BindParametrVisibileSxAddressOfDepartamentBySxCountry: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxCountry"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: "a470b005-e8bb-df11-b00f-001d60e938c6"
                            }
                        }]
                    }
                },
                "SxStreet": {
                    BindParametrVisibileSxSreetBySxIsAddress: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxIsAddress"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: true
                            }
                        }]
                    }
                },
                "SxBuild": {
                    BindParametrVisibileSxSreetBySxIsAddress: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxIsAddress"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: true
                            }
                        }]
                    }
                },
                "SxFlat": {
                    BindParametrVisibileSxSreetBySxIsAddress: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.VISIBLE,
                        conditions: [{
                            leftExpression: {
                                type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                attribute: "SxIsAddress"
                            },
                            comparisonType: Terrasoft.ComparisonType.EQUAL,
                            rightExpression: {
                                type: BusinessRuleModule.enums.ValueType.CONSTANT,
                                value: true
                            }
                        }]
                    }
                },
                //правило на фильтрацию
                "SxRegion": {
                    FiltrationSxRegionyByCountry: {
                        ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
                        autocomplete: true,
                        autoClean: true,
                        baseAttributePatch: "Country",
                        comparisonType: Terrasoft.ComparisonType.EQUAL,
                        type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                        attribute: "SxCountry"
                    }
                },
                "SxCity": {
                    FiltrationCityByRegion: {
                        ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
                        autocomplete: true,
                        autoClean: true,
                        baseAttributePatch: "Region",
                        comparisonType: Terrasoft.ComparisonType.EQUAL,
                        type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                        attribute: "SxRegion"
                    }
                },
                "SxCity": {
                    FiltrationCityByCountry: {
                        ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
                        autocomplete: true,
                        autoClean: true,
                        baseAttributePatch: "Country",
                        comparisonType: Terrasoft.ComparisonType.EQUAL,
                        type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                        attribute: "SxCountry"
                    }
                }
            },
            methods: {
                isCountryRussia: function () {
                    var c = this.get("SxCountry") || {};
                    return (c.value === "a570b005-e8bb-df11-b00f-001d60e938c6");
                },
                isCountryUkraine: function () {
                    var c = this.get("SxCountry") || {};
                    return (c.value === "a470b005-e8bb-df11-b00f-001d60e938c6");
                },
                isNovaPochtaFunc: function () {
                    if (!this) return;
                    var m = this.get("SxMail") || {};
                    var c = this.get("SxCountry") || {};
                    //проверка на поле почта, которое равно "НОВАЯ ПОЧТА"
                    return ((c && c.value == "a470b005-e8bb-df11-b00f-001d60e938c6")
                        && (m && m.value === "ec82cf93-0994-4eb0-82a7-b991c55d5dde"));
                },

                refreshAddressOfDepartment: function () {
                    debugger;
                    if (this.get("SxNumberOfDepartament")) {
                        var a = this.get("SxNumberOfDepartament");
                        var address = this.get("SxNumberOfDepartament").displayValue.split(":");
                        if (address.length > 1) {
                            this.set("SxAddressOfDepartament", address[1]);
                            return;
                        }
                    }
                    this.set("SxAddressOfDepartament", "");
                },
                resetMail: function () {
                    if (this.isCountryUkraine()) return;
                    this.set("SxMail", "");
                    this.set("SxIsAddress", false);
                },

                resetIsAddress: function () {
                    if (this.isNovaPochtaFunc()) return;
                    this.set("SxIsAddress", false);
                },
                /*
                * Start - get TTN
                */

                // Метод-обработчик нажатия кнопки.
                onUpdateTTNClick: function () {
                    debugger;
                    var id = this.get("Id");  // 
                    var weight = 0;

                    var bq = Ext.create("Terrasoft.BatchQuery");
                    var select = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "OrderProduct" });
                    select.addColumn("Product.Id", "ProductId");
                    select.addColumn("Quantity", "Quantity");

                    select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                        "Order.Id", id));
                    bq.add(select);

                    bq.execute(function (result) {
                        if (!result.success) return;
                        var products = result.queryResults[0].rows;
                        for (var i = 0; i < products.length; i++) {
                            var idProd = products[i].ProductId;
                            var quantity = products[i].Quantity;
                            var bq = Ext.create("Terrasoft.BatchQuery");
                            var select = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "SpecificationInProduct" });
                            select.addColumn("IntValue");
                            //фильтр на продукт
                            select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                                "Product.Id", idProd));
                            //фильтр на вес
                            select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                                "Specification.Id", "04649e1d-186b-4e46-a0e7-aed342d3eb3c"));
                            bq.add(select);

                            bq.execute(function (result) {
                                if (!result.success) return;
                                var collection = result.queryResults[0].rows;
                                for (var i = 0; i < collection.length; i++) {
                                    var value = collection[i].IntValue;
                                    weight += value * quantity;
                                };

                                var contactName = this.get("Contact").displayValue;
                                //разбиение по пробелам для получения отдельно имя и фамилия
                                var fio = contactName.split(" ");
                                var fName = fio[1], lName = fio[0];

                                //TODO city REF
                                var city = this.get("SxCity").displayValue;// город TODO - № отделения
                                var price = this.get("Amount");//цена итого(план)
                                var date = this.getDateNowToString(); //дата создания(сейчас)        //TODO date
                                var phoneR = this.get("ContactNumber"); //номер отправителя

                                //////////////////////
                                //if (phoneR == "") {
                                //    this.showInformationDialog("set phone , lol!");
                                //    return;
                                //}
                                ////////////////////////////

                                var seatsAmount = this.get("SxCountOfPlacesNP").displayValue; //количество мест
                                var serviceType = this.getServiceType(); //тип доставки
                                var paymentMethod = this.get("PaymentType").value === "c2d88243-685d-4e8b-a533-73f4Cc8e869b" ? "NonCash" : "Cash";

                                debugger;
                                var isAddress = this.get("SxIsAddress").toString();
                                var isRedelivery = this.get("SxIsRedelivery").toString();

                                var street = this.get("SxStreet");
                                var build = this.get("SxBuild");
                                var flat = this.get("SxFlat");

                                var refAddress = this.get("SxNumberOfDepartament").displayValue.replace(/\"/gi, '\\"');

                                var serviceData = {
                                    fName: fName,
                                    lName: lName,
                                    city: city,
                                    price: price,
                                    date: date,
                                    phoneR: phoneR,
                                    seatsAmount: seatsAmount,
                                    serviceType: serviceType,
                                    weight: weight,
                                    paymentMethod: paymentMethod,
                                    address: refAddress,
                                    isAddress: isAddress,
                                    isRedelivery: isRedelivery,
                                    streetD: street,
                                    buildD: build,
                                    flatD: flat
                                };

                                // Вызов веб-сервиса и обработка результатов.
                                ServiceHelper.callService("SxNovaPochtaApi", "CreateOrderInNP",
                                    function (response) {
                                        debugger;
                                        var result = response.CreateOrderInNPResult;
                                        if (typeof result == 'undefined') {
                                            this.showInformationDialog(this.get("Resources.Strings.ErrorFromServiceNPMessage"));
                                            return;
                                        }
                                        if (result.startsWith('Error')) {
                                            this.showInformationDialog(result);
                                            return;
                                        }
                                        if (this.parseXMLfromNP(this.stringToXML(result))) {
                                            this.showInformationDialog(this.get("Resources.Strings.SuccessFromServiceNPMessage"));
                                            return;
                                        }
                                    }, serviceData, this);
                            }, this);
                        }
                    }, this);
                },
                getDateNowToString: function () {
                    function padStr(i) {
                        return (i < 10) ? "0" + i : "" + i;
                    }
                    var temp = new Date();
                    var dateStr = padStr(temp.getDate()) + "." + padStr(1 + temp.getMonth()) + "." + padStr(temp.getFullYear());
                    return dateStr;
                },
                getServiceType: function () {
                    var type = this.get("SxDeliveryTypeNP").value;
                    switch (type) {
                        case "24e69d36-deb2-4c9f-9472-1c41bf1b98d8": return "DoorsDoors";
                        case "eafc95fb-f36a-4936-bd40-8e32048cf859": return "DoorsWarehouse";
                        case "8194b452-5d37-427c-baa7-cdb44d374871": return "WarehouseWarehouse";
                        case "c8c8f60c-bfd8-4f59-9143-dd2eb7bf0484": return "WarehouseDoors";
                        default: return "";
                    }
                },
                //получае xml cо строки
                stringToXML: function (oString) {
                    //code for IE
                    if (window.ActiveXObject)
                        return new ActiveXObject("Microsoft.XMLDOM").loadXML(oString);
                        // code for Chrome, Safari, Firefox, Opera, etc. 
                    else
                        return (new DOMParser()).parseFromString(oString, "text/xml");
                },
                //парсим ответ с сервиса
                parseXMLfromNP: function (xml) {
                    debugger;
                    //TODO parse response
                    var success = xml.getElementsByTagName("success")[0].childNodes[0].nodeValue;
                    if (success === "false") {
                        this.showInformationDialog("Error. " + xml.getElementsByTagName("item")[0].childNodes[0].nodeValue);
                        return false;
                    }

                    var ttn = xml.getElementsByTagName("IntDocNumber")[0].childNodes[0].nodeValue; //en doc
                    var cost = xml.getElementsByTagName("CostOnSite")[0].childNodes[0].nodeValue;  //цена доставки
                    //date
                    var dataDel = xml.getElementsByTagName("EstimatedDeliveryDate")[0].childNodes[0].nodeValue;  //дата доставки
                    var parts = dataDel.split('.');
                    var date = new Date(parts[2], (parts[1] - 1), parts[0]);
                    var dateRec = new Date(parts[2], (parts[1] - 1), parts[0]);
                    dateRec.setDate(date.getDate() + 1);

                    this.set("SxDeliveryPricePlan", cost);
                    this.set("SxTTN", ttn);
                    this.set("SxDeliveryDate", date);
                    this.set("SxReceivingDate", dateRec);
                    this.set("SxSendingDate", new Date());

                    //общая сумма 
                    var money = this.get("Amount");
                    this.set("Amount", (parseFloat(money) + parseFloat(cost)))

                    //вызывоем проверку статуса заказа
                    this.checkStatusNovaPochta();
                    return true;
                },
                //проверка статуса поставки в новой почте
                checkStatusNovaPochta: function () {
                    if (!this.get("SxTTN")) return;
                    var serviceData = { en: this.get("SxTTN") };
                    // Вызов веб-сервиса и обработка результатов.
                    ServiceHelper.callService("SxNovaPochtaApi", "GetStatusOrderInNP",
                        function (response) {
                            var result = response.GetStatusOrderInNPResult;

                            var xml = this.stringToXML(result);
                            var success = xml.getElementsByTagName("success")[0].childNodes[0].nodeValue;
                            if (success === "false") return;

                            var stateName = xml.getElementsByTagName("StateName")[0].childNodes[0].nodeValue;
                            this.set("SxStatusByNovaPochta", stateName);

                            var ttnMoney = xml.getElementsByTagName("RedeliveryNUM")[0].childNodes[0].nodeValue;  //ttn доставки
                            if (ttnMoney)
                                this.set("SxTTNReceivingMoney", ttnMoney);
                        }, serviceData, this);
                },
                /*
                * END - get TTN
                */
                createLink: function () {
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
                                this.set("SxLinq", "")
                        }
                    }
                },

                init: function () {
                    this.callParent(arguments);
                    this.on("change:SxMail", function (model, value) {
                        this.publishPropertyValueToSection("CurrentSxMail", value);
                    }, this);
                },

                onEntityInitialized: function () {
                    this.callParent(arguments);

                    this.on('change:SxNumberOfDepartament', this.refreshAddressOfDepartment);
                    this.on('change:SxLinq', this.reloadLink);
                    this.checkStatusNovaPochta();
                    this.refreshAddressOfDepartment();
                    this.createLink();
                },

                /* refreshControlsState: function () {
                     if (!this.get("SxAddress")) {
                         this.set("isAddressRequired", true);
                     }
                     var country = this.get("Country") || {};
                     this.set("isCountryRequired", !country.value);
                     this.set("isAddressEnabled", !!country.value);
                     if (this.isCountryRussia()) {
                         var value = (this.get("AddressType") || {}).value !== "588a794c-5808-415a-b9e3-f19326e33fc8";
                         this.set("isSuggestNeeded", value);
                     } else {
                         this.set("isSuggestNeeded", false);
                     }
                 },*/

                reloadLink: function () {
                    var control = Ext.ComponentManager.all.map.OrderPageV2SxLinqTextEdit;
                    if (control) {
                        control.setEnabled(true);
                        control.value = this.get('SxLinq');
                        control.showValueAsLink = true;
                        control.reRender();
                        control.setLinkMode(true);
                        if (control.linkEl) {
                            control.linkEl.dom.href = this.get('SxLinq');
                            control.linkEl.dom.target = '_blank';
                        }
                        control.setLinkMode(true);
                        control.setEnabled(false);
                    }
                }
            },
            diff: /**SCHEMA_DIFF*/[
                //delete detail
                {
                    "operation": "remove",
                    "name": "OrderAddressAndDelivery"
                },
                //дата отправления на Общей информации
                 {
                     "operation": "insert",
                     "parentName": "OrderPageGeneralInformationBlock",
                     "propertyName": "items",
                     "name": "SxSendingDate",
                     "values": {
                         "bindTo": "SxSendingDate",
                         "layout": { "column": 12, "row": 4, "colSpan": 12 },
                     }
                 },
                 //дата доставки на Общей информации
                 {
                     "operation": "insert",
                     "parentName": "OrderPageGeneralInformationBlock",
                     "propertyName": "items",
                     "name": "SxDeliveryDate",
                     "values": {
                         "bindTo": "SxDeliveryDate",
                         "layout": { "column": 12, "row": 5, "colSpan": 12 },
                     }
                 },
                 //дата получения на Общей информации
                 {
                     "operation": "insert",
                     "parentName": "OrderPageGeneralInformationBlock",
                     "propertyName": "items",
                     "name": "SxReceivingDate",
                     "values": {
                         "bindTo": "SxReceivingDate",
                         "layout": { "column": 12, "row": 6, "colSpan": 12 },
                     }
                 },
                 //ТТН получения денег на Общей информации
                 {
                     "operation": "insert",
                     "parentName": "OrderPageGeneralInformationBlock",
                     "propertyName": "items",
                     "name": "SxTTNReceivingMoney",
                     "values": {
                         "bindTo": "SxTTNReceivingMoney",
                         "layout": { "column": 0, "row": 5, "colSpan": 12 },
                         "enabled": false
                     }
                 },
                 //статус Новой почты на Общей информации
                 {
                     "operation": "insert",
                     "parentName": "OrderPageGeneralInformationBlock",
                     "propertyName": "items",
                     "name": "SxStatusByNovaPochta",
                     "values": {
                         "bindTo": "SxStatusByNovaPochta",
                         "layout": { "column": 0, "row": 6, "colSpan": 12 },
                         "enabled": false
                     }
                 },
                 //Кнопка - Обновить ТТН
                 {
                     "operation": "insert",
                     "parentName": "LeftContainer",
                     "propertyName": "items",
                     "name": "UpdateTTNButton",
                     "values": {
                         itemType: Terrasoft.ViewItemType.BUTTON,
                         caption: { bindTo: "Resources.Strings.UpdateTTNButtonCaption" },
                         click: { bindTo: "onUpdateTTNClick" },
                         "style": Terrasoft.controls.ButtonEnums.style.BLUE,
                         "visible": { bindTo: "isNovaPochtaFunc" },
                         "layout": { "column": 1, "row": 6, "colSpan": 1 }
                     }
                 },
                 //Таб - Адрес и способ доставки
                 {
                     "operation": "insert",
                     "name": "OrderAddressDeliveryTab",
                     "parentName": "Tabs",
                     "propertyName": "tabs",
                     "values": {
                         "caption": { "bindTo": "Resources.Strings.OrderAddressDeliveryTabCaption" },
                         "items": []
                     },
                     "index": 1
                 },
                 {
                     "operation": "insert",
                     "parentName": "OrderAddressDeliveryTab",
                     "propertyName": "items",
                     "name": "OrderAddressDeliveryBlock",
                     "values": {
                         "itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
                         "items": []
                     }
                 },

               //////////////////////////
               //тип доставки на табе - Адрес и способ доставки
              {
                  "operation": "insert",
                  "parentName": "OrderAddressDeliveryBlock",
                  "propertyName": "items",
                  "name": "SxAddressType",
                  "values": {
                      "dataValueType": Terrasoft.DataValueType.ENUM,
                      "layout": { "column": 0, "row": 0, "colSpan": 12 }
                  }
              },
              //страна на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxCountry",
                "values": {
                    "dataValueType": Terrasoft.DataValueType.ENUM,
                    "layout": { "column": 0, "row": 1, "colSpan": 12 }
                }
            },
            //адрес на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxAddress",
                "values": {
                    "layout": {
                        "column": 0, "row": 3, "colSpan": 12
                    }
                }
            },
            //тип оплаты на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "PaymentType",
                "values": {
                    "dataValueType": Terrasoft.DataValueType.ENUM,
                    "layout": { "column": 12, "row": 0, "colSpan": 12 }
                }
            },
            //регион/область на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxRegion",
                "values": {
                    "dataValueType": Terrasoft.DataValueType.ENUM,
                    "layout": { "column": 12, "row": 1, "colSpan": 12 }
                }
            },
            //город на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxCity",
                "values": {
                    "layout": { "column": 0, "row": 2, "colSpan": 12 }
                }
            },
            //индекс на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxZip",
                "values": {
                    "layout": { "column": 12, "row": 2, "colSpan": 12 }
                }
            },
            //тип доставки на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxDeliveryState",
                "values": {
                    "bindTo": "SxDeliveryState",
                    "layout": { "column": 12, "row": 3, "colSpan": 12 },
                    "contentType": Terrasoft.ContentType.ENUM,
                }
            },
            //ссылка на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxLinq",
                "values": {
                    "bindTo": "SxLinq",
                    "layout": { "column": 12, "row": 5, "colSpan": 12 },
                    "enabled": false
                }
            },
            //тип почты на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxMail",
                "values": {
                    "bindTo": "SxMail",
                    "layout": { "column": 0, "row": 5, "colSpan": 12 },
                    "contentType": Terrasoft.ContentType.ENUM,
                }
            },
            //адрес отделения на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxAddressOfDepartament",
                "values": {
                    "bindTo": "SxAddressOfDepartament",
                    "layout": { "column": 12, "row": 6, "colSpan": 12 },
                    "enabled": false
                }
            },
            //номер отделения почты на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxNumberOfDepartament",
                "values": {
                    "bindTo": "SxNumberOfDepartament",
                    "layout": { "column": 0, "row": 6, "colSpan": 12 },
                    //"contentType": Terrasoft.ContentType.ENUM,
                    //"visible": { bindTo: "isCountryUkraine" }
                }
            },
            //адрессная доставка НП на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxIsAddress",
                "values": {
                    "bindTo": "SxIsAddress",
                    "layout": { "column": 0, "row": 8, "colSpan": 12 },
                }
            },
            //обратная доставка НП на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxIsRedelivery",
                "values": {
                    "bindTo": "SxIsRedelivery",
                    "layout": { "column": 0, "row": 7, "colSpan": 12 },
                }
            },
            //количество мест НП на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxCountOfPlacesNP",
                "values": {
                    "bindTo": "SxCountOfPlacesNP",
                    "layout": { "column": 12, "row": 7, "colSpan": 12 },
                    "contentType": Terrasoft.ContentType.ENUM,
                }
            },
            //тип доставки НП на табе - Адрес и способ доставки
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxDeliveryTypeNP",
                "values": {
                    "bindTo": "SxDeliveryTypeNP",
                    "layout": { "column": 12, "row": 8, "colSpan": 12 },
                    "contentType": Terrasoft.ContentType.ENUM
                }
            },
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxStreet",
                "values": {
                    "bindTo": "SxStreet",
                    "layout": { "column": 0, "row": 9, "colSpan": 12 }
                }
            },
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxBuild",
                "values": {
                    "bindTo": "SxBuild",
                    "layout": { "column": 12, "row": 9, "colSpan": 6 }
                }
            },
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "SxFlat",
                "values": {
                    "bindTo": "SxFlat",
                    "layout": { "column": 18, "row": 9, "colSpan": 6 },
                    //"visible": { "bindTo": "IsNovaPochta" }
                }
            },
            {
                "operation": "insert",
                "parentName": "OrderAddressDeliveryBlock",
                "propertyName": "items",
                "name": "AddressSuggest",
                "values": {
                    "bindTo": "AddressSuggest",
                    "layout": {
                        "column": 0,
                        "row": 4,
                        "colSpan": 24
                    },
                    "caption": { "bindTo": "Resources.Strings.SelectionAddressCaption" },
                    "enabled": { "bindTo": "isSuggestNeeded" }
                }
            }
            ]/**SCHEMA_DIFF*/
        };
    });