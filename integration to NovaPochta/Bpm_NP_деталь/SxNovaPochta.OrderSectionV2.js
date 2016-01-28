define("OrderSectionV2", ["ServiceHelper"], function (ServiceHelper) {
    return {
        entitySchemaName: "Order",
        messages: {
            "UpdateTTN": {
                mode: Terrasoft.MessageMode.PTP,
                direction: Terrasoft.MessageDirectionType.PUBLISH
            }
        },
        methods: {
            isNovaPochta: function () {
                //debugger;
                //var mail = this.get("CurrentSxMail");
                //if (!mail) {
                var activeRow = this.get("ActiveRow");
                if (activeRow) {
                    var m = this.get("GridData").get(activeRow).get("SxMail");
                    return (m || m.value === "ec82cf93-0994-4eb0-82a7-b991c55d5dde") ? true : false;
                }
                return false;
                // }
                //else {
                //    return (mail.value === "ec82cf93-0994-4eb0-82a7-b991c55d5dde");
                //}
            },
            /*
            * Start - get TTN
            */

            onUpdateTTNClick: function () {
                debugger;

                var activeRow = this.get("ActiveRow");  // order id
                var activeOrder = this.get("GridData").get(activeRow);
                var contactName = activeOrder.get("Contact").displayValue;
                //разбиение по пробелам для получения отдельно имя и фамилия
                var fio = contactName.split(" ");
                var fName = fio[1], lName = fio[0];

                var date = this.getDateNowToString(); //дата создания(сейчас)        //TODO date
                //TODO city REF
                var phoneR = activeOrder.get("ContactNumber"); //номер отправителя
                var price = activeOrder.get("Amount");//цена итого(план)
                var th = this;
                var weight = 0;

                var bq = Ext.create("Terrasoft.BatchQuery");
                var select = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "OrderProduct" });
                select.addColumn("Product.Id", "ProductId");
                select.addColumn("Quantity", "Quantity");

                select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Order.Id", activeRow));
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
                            //получили вес продуктов в заказе
                            this.createRequestToNP(weight, fName, lName, price, date, phoneR, th);

                        }, this);
                    }
                }, this);
            },
            //получение веса 
            createRequestToNP: function (weight, fName, lName, price, date, phoneR, th) {
                var id = this.get("ActiveRow");  // order id

                var bq = Ext.create("Terrasoft.BatchQuery");
                var select = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "SxAddressDeliveryType" });
                select.addColumn("City.Name", "City");
                select.addColumn("SxCountOfPlacesNP.Name", "SxCountOfPlacesNP");
                select.addColumn("SxDeliveryTypeNP.Id", "SxDeliveryTypeNP");
                select.addColumn("SxNumOfDepartament.Name", "SxNumOfDepartament");
                select.addColumn("SxPaymentType.Id", "PaymentType");
                select.addColumn("SxIsRedelivery");
                select.addColumn("SxIsAddress");
                select.addColumn("SxStreet");
                select.addColumn("SxBuild");
                select.addColumn("SxFlat");

                select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "SxOrder.Id", id));
                bq.add(select);
                bq.execute(function (result) {
                    if (!result.success) return;
                    //debugger
                    var row = result.queryResults[0].rows;
                    var seatsAmount = row[0].SxCountOfPlacesNP; //количество мест
                    /**/
                    function getServiceType(type) {
                        switch (type) {
                            case "24e69d36-deb2-4c9f-9472-1c41bf1b98d8": return "DoorsDoors";
                            case "eafc95fb-f36a-4936-bd40-8e32048cf859": return "DoorsWarehouse";
                            case "8194b452-5d37-427c-baa7-cdb44d374871": return "WarehouseWarehouse";
                            case "c8c8f60c-bfd8-4f59-9143-dd2eb7bf0484": return "WarehouseDoors";
                            default: return "";
                        }
                    }
                    var city = row[0].City;
                    var serviceType = getServiceType(row[0].SxDeliveryTypeNP); //тип доставки
                    /**/
                    var paymentMethod = row[0].PaymentType === "c2d88243-685d-4e8b-a533-73f4Cc8e869b" ? "NonCash" : "Cash";

                    //TODO set refAddressRecipient
                    var refAddress = row[0].SxNumOfDepartament.replace(/\"/gi, '\\"');;

                    var isAddress = row[0].SxIsAddress;
                    var isRedelivery = row[0].SxIsRedelivery;
                    var street = row[0].SxStreet;
                    var build = row[0].SxBuild;
                    var flat = row[0].SxFlat;

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
                            //debugger;
                            var result = response.CreateOrderInNPResult;
                            if (typeof result == 'undefined') {
                                th.showInformationDialog(th.get("Resources.Strings.ErrorFromServiceNPMessage"));
                                return;
                            }
                            if (result.startsWith('Error')) {
                                th.showInformationDialog(result);
                                return;
                            }
                            th.parseXMLfromNP(th.stringToXML(result), th)
                        }, serviceData, this);
                });
            },
            getDateNowToString: function () {
                function padStr(i) {
                    return (i < 10) ? "0" + i : "" + i;
                }
                var temp = new Date();
                var dateStr = padStr(temp.getDate()) + "." + padStr(1 + temp.getMonth()) + "." + padStr(temp.getFullYear());
                return dateStr;
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
            parseXMLfromNP: function (xml, th) {
                //debugger;
                var success = xml.getElementsByTagName("success")[0].childNodes[0].nodeValue;
                if (success === "false") {
                    th.showInformationDialog("Error. " + xml.getElementsByTagName("item")[0].childNodes[0].nodeValue);
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

                //вызывоем проверку статуса заказа
                var serviceData = {
                    en: ttn
                };
                // Вызов веб-сервиса и обработка результатов.
                ServiceHelper.callService("SxNovaPochtaApi", "GetStatusOrderInNP",
                    function (response) {
                        debugger;
                        var result = response.GetStatusOrderInNPResult;
                        var xml = this.stringToXML(result);
                        var success = xml.getElementsByTagName("success")[0].childNodes[0].nodeValue;
                        if (success === "false") return;

                        var stateName = xml.getElementsByTagName("StateName")[0].childNodes[0].nodeValue;
                        var num = xml.getElementsByTagName("RedeliveryNUM")[0];
                        var ttnMoney = null;
                        if (num.childNodes.length > 0)
                            ttnMoney = xml.getElementsByTagName("RedeliveryNUM")[0].childNodes[0].nodeValue;  //ttn доставки
                        th.updateOrder(ttn, cost, date, dateRec, stateName, ttnMoney, th);
                    }, serviceData, this);

                return true;
            },

            updateOrder: function (ttn, costD, dataD, dateRec, stateName, ttnMoney, th) {
                var update = this.Ext.create("Terrasoft.UpdateQuery", {
                    rootSchemaName: "Order"
                });
                update.setParameterValue("SxDeliveryPricePlan", costD, th.Terrasoft.DataValueType.FLOAT);
                update.setParameterValue("SxTTN", ttn, th.Terrasoft.DataValueType.TEXT);
                update.setParameterValue("SxSendingDate", new Date(), th.Terrasoft.DataValueType.DATE_TIME);
                update.setParameterValue("SxDeliveryDate", dataD, th.Terrasoft.DataValueType.DATE_TIME);
                update.setParameterValue("SxReceivingDate", dateRec, th.Terrasoft.DataValueType.DATE_TIME);
                update.setParameterValue("SxStatusByNovaPochta", stateName, th.Terrasoft.DataValueType.TEXT);
                update.setParameterValue("SxTTNReceivingMoney", ttnMoney, th.Terrasoft.DataValueType.TEXT);

                var id = th.get("ActiveRow");
                update.filters.addItem(th.Terrasoft.createColumnFilterWithParameter(
                    th.Terrasoft.ComparisonType.EQUAL, "Id", id));

                update.execute(function (result) {
                    if (!result.success)
                        th.showInformationDialog(th.get("Resources.Strings.ErrorFromServiceNPMessage"));
                    else {
                        //TODO udate info
                        th.sandbox.publish("UpdateTTN");
                        th.showInformationDialog(th.get("Resources.Strings.SuccessFromServiceNPMessage"));
                    }
                });
            }
            /*
            * END - get TTN
            */
        },
        diff: /**SCHEMA_DIFF*/[
           {
               "operation": "insert",
               "parentName": "CombinedModeActionButtonsCardLeftContainer",
               "propertyName": "items",
               "name": "UpdateTTNButton",
               "values": {
                   itemType: Terrasoft.ViewItemType.BUTTON,
                   caption: { bindTo: "Resources.Strings.UpdateTTNButtonCaption" },
                   click: { bindTo: "onUpdateTTNClick" },
                   "visible": { bindTo: "isNovaPochta" },
                   "style": Terrasoft.controls.ButtonEnums.style.GREEN,
                   "layout": { "column": 1, "row": 6, "colSpan": 1 }
               }
           }
        ]/**SCHEMA_DIFF*/
    };
});