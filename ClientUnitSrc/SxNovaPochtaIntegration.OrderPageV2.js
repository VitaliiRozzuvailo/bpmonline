define("OrderPageV2", ["BusinessRuleModule", "ConfigurationConstants", "ServiceHelper"],
    function (BusinessRuleModule, ConfigurationConstants, ServiceHelper) {
        return {
            entitySchemaName: "Order",
            messages: {
                "SetNoNovaPochtaMail": {
                    mode: Terrasoft.MessageMode.PTP,
                    direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                },
                "SetNovaPochta": {
                    mode: Terrasoft.MessageMode.PTP,
                    direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                },
                "UpdateTTN": {
                    mode: Terrasoft.MessageMode.PTP,
                    direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                }
            },
            attributes: {
                "isNovaPochta": {
                    dataValueType: Terrasoft.DataValueType.BOOLEAN,
                    type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                    value: false
                }
            },
            rules: {
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
                "SxTakingDate": {
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
                }
            },
            methods: {

                init: function () {
                    this.callParent(arguments);

                    this.sandbox.subscribe("SetNovaPochta", function () {
                        this.set("isNovaPochta", true);
                        this.updateSxMailInOrder();
                    }, this);

                    this.sandbox.subscribe("SetNoNovaPochtaMail", function () {
                        this.set("isNovaPochta", false);
                        this.updateSxMailInOrder();
                    }, this);

                    this.sandbox.subscribe("UpdateTTN", function () {
                        this.onUpdateTTNClick();
                    }, this);

                    this.on("change:SxMail", function (model, value) {
                        this.publishPropertyValueToSection("CurrentSxMail", value);
                    }, this);
                },

                onEntityInitialized: function () {
                    this.callParent(arguments);
                    this.checkNovaPochtaSelected();

                    this.checkStatusNovaPochta();
                },

                checkNovaPochtaSelected: function () {
                    var mail = this.get("SxMail") || {};
                    //Nova pochta
                    if (mail.value === "ec82cf93-0994-4eb0-82a7-b991c55d5dde")
                        this.set("isNovaPochta", true);
                    else
                        this.set("isNovaPochta", false);
                },

                updateSxMailInOrder: function () {
                    var id = this.get("Id");
                    if (id === undefined) return;
                    var bq = Ext.create("Terrasoft.BatchQuery");
                    var select = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "SxAddressDeliveryType" });
                    select.addColumn("SxMail.Id", "SxMailId");
                    select.addColumn("SxMail", "SxMail");
                    select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "SxOrder.Id", id));
                    bq.add(select);
                    var th = this;
                    bq.execute(function (result) {
                        debugger
                        if (!result.success) return;
                        var mail = result.queryResults[0].rows;
                        if (mail.length < 1) return;

                        th.set("SxMail", mail[0].SxMail);

                        var update = Ext.create("Terrasoft.UpdateQuery", {
                            rootSchemaName: "Order"
                        });
                        debugger
                        update.setParameterValue("SxMail", mail[0].SxMailId, Terrasoft.DataValueType.GUID);
                        update.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Id", id));
                        update.execute();
                    });
                },

                /*
                * Start - get TTN
                */

                // up to button
                onUpdateTTNClick: function () {
                    debugger
                    var id = this.get("Id");  // 
                    var weight = 0;
                    var volume = 0;
                    //get product by order
                    var bq = Ext.create("Terrasoft.BatchQuery");
                    var select = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "OrderProduct" });

                    select.addColumn("Product.Id", "ProductId");
                    select.addColumn("Quantity", "Quantity");

                    select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Order.Id", id));
                    bq.add(select);

                    bq.execute(function (result) {
                        if (!result.success) return;
                        var products = result.queryResults[0].rows;
                        //get weight and volume by products
                        var bq = Ext.create("Terrasoft.BatchQuery");
                        var select = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "SpecificationInProduct" });
                        select.addColumn("IntValue", "Weight"); // вес
                        select.addColumn("FloatValue", "Volume");// объем
                        select.addColumn("Product.Id", "ProductId"); // ghjlecr
                        //filter by products - get 
                        var productCollection = [];
                        for (var i = 0; i < products.length; i++) {
                            //check on delivery
                            if (products[i].ProductId === '25f1f1cc-85ce-448c-b680-4d2835a18724') continue;
                            var idProd = products[i].ProductId;
                            var quantity = products[i].Quantity;

                            productCollection.push(products[i].ProductId);
                        }

                        select.filters.addItem(select.createColumnInFilterWithParameters("Product.Id", productCollection));
                        bq.add(select);

                        bq.execute(function (result) {
                            debugger
                            if (!result.success) return;
                            var collection = result.queryResults[0].rows;
                            // 
                            for (var j = 0; j < products.length; j++) {
                                //delivery
                                if (products[j].ProductId === '25f1f1cc-85ce-448c-b680-4d2835a18724') continue;
                                for (var i = 0; i < collection.length; i++) {
                                    //get values by product
                                    if (products[j].ProductId === collection[i].ProductId) {
                                        var w = collection[i].Weight;
                                        var v = collection[i].Volume;
                                        weight += w * products[j].Quantity;
                                        volume += v * products[j].Quantity;
                                    }
                                }
                            };
                            this.createRequestToNP(weight, volume);
                        }, this);
                    }, this);
                },

                createRequestToNP: function (weight, volume) {
                    var id = this.get("Id");  // 
                    var contactName = this.get("Contact").displayValue;
                    //split and get firstname and last name
                    var fio = contactName.split(" ");
                    var fName = fio[1], lName = fio[0];

                    var paymentMethod = (this.get("SxPaymentType") === "c2d88243-685d-4e8b-a533-73f4Cc8e869b" ? "NonCash" : "Cash");

                    var price = this.get("Amount");//price
                    var date = this.getDateNowToString(); //date(now)
                    var phoneR = this.get("ContactNumber"); //phone
                    if (phoneR == "") {
                        var message = this.get("Resources.Strings.SxErrorSomeFieldIsEmpty") + this.get("Resources.Strings.SxContactNumberIsEmpty");
                        this.showInformationDialog(message);
                        return;
                    }

                    //get fields from SxAddressDeliveryType for Nova pochta
                    var bq = Ext.create("Terrasoft.BatchQuery");
                    var select = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "SxAddressDeliveryType" });
                    select.addColumn("City.Name", "City");
                    select.addColumn("SxCountOfPlacesNP.Name", "SxCountOfPlacesNP");
                    select.addColumn("SxDeliveryTypeNP.Id", "SxDeliveryTypeNP");
                    select.addColumn("SxNumOfDepartament.Name", "SxNumOfDepartament");
                    select.addColumn("SxIsRedelivery");
                    select.addColumn("SxIsAddress");
                    select.addColumn("SxStreet");
                    select.addColumn("SxBuild");
                    select.addColumn("SxFlat");

                    select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "SxOrder.Id", id));
                    bq.add(select);

                    bq.execute(function (result) {
                        if (!result.success) return;
                        var collection = result.queryResults[0].rows;
                        //город
                        var city = collection[0].City;
                        //количество мест
                        var seatsAmount = collection[0].SxCountOfPlacesNP;
                        if (seatsAmount == "") {
                            var message = this.get("Resources.Strings.SxErrorSomeFieldIsEmpty") + this.get("Resources.Strings.SxSeatsAmountIsEmpty");
                            this.showInformationDialog(message);
                            return;
                        }
                        //тип доставки НОвой Почты
                        var serviceType = this.getServiceType(collection[0].SxDeliveryTypeNP);
                        if (serviceType == "") {
                            var message = this.get("Resources.Strings.SxErrorSomeFieldIsEmpty") + this.get("Resources.Strings.SxServiceTypeIsEmpty");
                            this.showInformationDialog(message);
                            return;
                        }
                        //адрессная 
                        var isAddress = collection[0].SxIsAddress.toString();
                        //обратная
                        var isRedelivery = collection[0].SxIsRedelivery.toString();

                        var street = collection[0].SxStreet;
                        var build = collection[0].SxBuild;
                        var flat = collection[0].SxFlat;
                        //адресс отделения
                        var refAddress = collection[0].SxNumOfDepartament.replace(/\"/gi, '\\"');
                        if (refAddress == "" && collection[0].SxIsAddress) {
                            var message = this.get("Resources.Strings.SxErrorSomeFieldIsEmpty") + this.get("Resources.Strings.SxNumOfDepartamentIsEmpty");
                            this.showInformationDialog(message);
                            return;
                        }
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
                            volume: volume,
                            paymentMethod: paymentMethod,
                            address: refAddress,
                            isAddress: isAddress,
                            isRedelivery: isRedelivery,
                            streetD: street,
                            buildD: build,
                            flatD: flat
                        };

                        // call service and get result
                        ServiceHelper.callService("SxNovaPochtaApi", "CreateOrderInNP",
                            function (response) {
                                debugger;
                                var result = response.CreateOrderInNPResult;
                                if (typeof result == 'undefined') {
                                    this.showInformationDialog(this.get("Resources.Strings.SxErrorFromServiceNPMessage"));
                                    return;
                                }
                                if (result.startsWith('Error')) {
                                    this.showInformationDialog(result);
                                    return;
                                }
                                if (this.parseXMLfromNP(this.stringToXML(result))) {
                                    this.showInformationDialog(this.get("Resources.Strings.SxSuccessFromServiceNPMessage"));
                                    return;
                                }
                            }, serviceData, this);
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

                getServiceType: function (type) {
                    switch (type) {
                        case "1d9a0bb2-a377-458d-a970-f4239f57dbd7": return "DoorsDoors";
                        case "e2cb4878-c793-4507-855e-247e03a9b446": return "DoorsWarehouse";
                        case "34c3e899-7e57-473b-a4b0-2cb3e1228547": return "WarehouseWarehouse";
                        case "0532d458-ad0e-4eee-8a48-1ca45852f0ab": return "WarehouseDoors";
                        default: return "";
                    }
                },
                //get xml with string
                stringToXML: function (oString) {
                    //code for IE
                    if (window.ActiveXObject)
                        return new ActiveXObject("Microsoft.XMLDOM").loadXML(oString);
                        // code for Chrome, Safari, Firefox, Opera, etc. 
                    else
                        return (new DOMParser()).parseFromString(oString, "text/xml");
                },
                //parse response by service
                parseXMLfromNP: function (xml) {
                    var success = xml.getElementsByTagName("success")[0].childNodes[0].nodeValue;
                    if (success === "false") {
                        this.showInformationDialog("Error. " + xml.getElementsByTagName("item")[0].childNodes[0].nodeValue);
                        return false;
                    }

                    var ttn = xml.getElementsByTagName("IntDocNumber")[0].childNodes[0].nodeValue; //en doc
                    var cost = xml.getElementsByTagName("CostOnSite")[0].childNodes[0].nodeValue;  //delivery cost
                    //ref
                    var docRef = xml.getElementsByTagName("Ref")[0].childNodes[0].nodeValue;  //document ref
                    var oldDocRef = this.get("SxDocumentRefFromNP");
                    //date
                    var dataDel = xml.getElementsByTagName("EstimatedDeliveryDate")[0].childNodes[0].nodeValue;  //delivery date
                    var parts = dataDel.split('.');
                    var date = new Date(parts[2], (parts[1] - 1), parts[0]);
                    var dateRec = new Date(parts[2], (parts[1] - 1), parts[0]);
                    dateRec.setDate(date.getDate() + 1);

                    this.set("SxTTN", ttn);
                    this.set("SxDeliveryDate", date);
                    this.set("SxTakingDate", dateRec);
                    this.set("DueDate", new Date());
                    this.set("SxDocumentRefFromNP", docRef);

                    //insert "Досавка"
                    this.insertDeliveryToOrderProduct(cost);

                    //call check order status by nova pochta
                    this.checkStatusNovaPochta();

                    //delete old document in NP
                    if (oldDocRef)
                        this.deleteENFromNovaPochta(oldDocRef)
                    return true;
                },

                //insert Delivery
                insertDeliveryToOrderProduct: function (cost) {
                    var serviceData = {
                        orderId: this.get("Id"),
                        cost: cost
                    };

                    // call service and get result
                    ServiceHelper.callService("SxAddDeliveryToOrderService", "addDeliveryToOrder",
                        function (response) {
                            debugger
                            //get result from service
                            var res = response.addDeliveryToOrderResult;
                            //check error
                            if (res.startsWith('Error')) {
                                console.log(res);
                            }
                            else {//update value on page
                                this.set("SxDeliveryPricePlan", cost);

                                var arr = res.split(';');
                                this.set("SxPaymentAmountPlan", parseFloat(arr[0]));
                                this.set("Amount", parseFloat(arr[1]));
                            }
                            this.updateDetails();
                        }, serviceData, this);
                },

                //check order status by nova pochta
                checkStatusNovaPochta: function () {
                    if (!this.get("SxTTN")) return;
                    var serviceData = { en: this.get("SxTTN") };

                    ServiceHelper.callService("SxNovaPochtaApi", "GetStatusOrderInNP",
                        function (response) {
                            var result = response.GetStatusOrderInNPResult;

                            var xml = this.stringToXML(result);
                            var success = xml.getElementsByTagName("success")[0].childNodes[0].nodeValue;
                            if (success === "false") {
                                console.log("OrderStatus not found! ")
                                return;
                            }

                            var stateName = xml.getElementsByTagName("StateName")[0].childNodes[0].nodeValue;
                            this.set("SxStatusByNovaPochta", stateName);
                            try {
                                var ttnMoney = xml.getElementsByTagName("RedeliveryNUM")[0].childNodes[0].nodeValue;
                                if (ttnMoney)
                                    this.set("SxTTNReceivingMoney", ttnMoney);
                            }
                            catch (e) {
                                console.log("RedeliveryNUM (SxTTNReceivingMoney) not found! ")
                            }
                        }, serviceData, this);
                },

                //check order status by nova pochta
                deleteENFromNovaPochta: function (oldDocRef) {
                    var serviceData = { docRef: oldDocRef };

                    ServiceHelper.callService("SxNovaPochtaApi", "DeleteENInOrder",
                        function (response) {
                            debugger
                            var result = response.DeleteENInOrderResult;
                            if (result === "false")
                                console.log("Error. EN didn't delete from NovaPochta!")
                            else
                                console.log("Success. EN removed from NovaPochta.")

                        }, serviceData, this);
                }
                /*
                * END - get TTN
                */
            },
            diff: /**SCHEMA_DIFF*/[
                 //дата доставки на Общей информации
                 {
                     "operation": "insert",
                     "parentName": "OrderPageGeneralInformationBlock",
                     "propertyName": "items",
                     "name": "SxDeliveryDate",
                     "values": {
                         "bindTo": "SxDeliveryDate",
                         "layout": { "column": 0, "row": 4, "colSpan": 12 },
                         //"enabled": false
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
                         "layout": { "column": 0, "row": 6, "colSpan": 12 },
                         //"enabled": false
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
                         "layout": { "column": 12, "row": 6, "colSpan": 12 },
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
                         "visible": { bindTo: "isNovaPochta" },
                         "layout": { "column": 1, "row": 6, "colSpan": 1 }
                     }
                 }

            ]/**SCHEMA_DIFF*/
        };
    });