
define('OrderPageV2', ['OrderPageV2Resources', 'GeneralDetails','BusinessRuleModule'],
    function(resources, GeneralDetails,BusinessRuleModule) {
        return {
            entitySchemaName: 'Order',
            details: /**SCHEMA_DETAILS*/{
                OrderAddressAndDelivery: {
                    schemaName: "SxDeliveryAndAddressDetail",
                    entitySchemaName: "SxAddressDeliveryType",
                    filter: {
                        masterColumn: "Id",
                        detailColumn: "SxOrder"
                    }
                }
            }/**SCHEMA_DETAILS*/,
            messages: {
                "UpdateNumberFromDB": {
                    mode: Terrasoft.MessageMode.PTP,
                    direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                }
            },
            diff: /**SCHEMA_DIFF*/[
                {
                    name:"PrimaryAmount",
                    operation:"remove"
                },
                {
                    name:"PrimaryPaymentAmount",
                    operation:"remove"
                },
                {
                    name:"CurrencyRate",
                    operation:"remove"
                },
                {
                    name:"Visa",
                    operation:"remove"
                },
                {
                    name:"Lead",
                    operation:"remove"
                },
                {
                    name:"OrderVisaTab",
                    operation:"remove"
                },
                {
                    name:"LeadTab",
                    operation:"remove"
                },
                {
                    name:"Date",
                    operation:"remove"
                },
                {
                    name:"Currency",
                    operation:"remove"
                },

                {
                    "operation": "insert",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "Date",
                    "values": {
                        "bindTo": "Date",
                        "layout": {
                            "column": 0,
                            "row": 1,
                            "colSpan": 6
                        }
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "OrderPassportBlock",
                    "propertyName": "items",
                    "name": "SxCurrency",
                    "values": {
                        "bindTo": "SxCurrency",
                        "layout": {"column": 0, "row": 0, "colSpan": 12},
						"caption": {
							"bindTo": "Resources.Strings.SxCurrencyCaption"
						}
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "SxTime",
                    "values": {
                        "bindTo": "SxTime",
                        "layout": {
                            "column": 6,
                            "row": 1,
                            "colSpan": 6
                        }
                    }
                },
               {
                    "operation": "merge",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "Status",
                    "values": {
                        "bindTo": "Status",
                        "layout": {
                            "column": 12,
                            "row": 3,
                            "colSpan": 12
                        }
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "SxOrderCancelCase",
                    "values": {
                        "bindTo": "SxOrderCancelCase",
                        "visible":{
                            bindTo:"isOrderCancelled"
                        },
                        //"isRequired":{
                       //     bindTo:"isOrderCancelled"
                        //},
                        "layout": {
                            "column": 12,
                            "row": 4,
                            "colSpan": 12
                        }
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "SxDeliveryPrice",
                    "values": {
                        "bindTo": "SxDeliveryPrice",
                        "layout": {
                            "column": 12,
                            "row": 1,
                            "colSpan": 12
                        }
                    }
                },
                {
                    "operation": "insert",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "SxPlatform",
                    "values": {
                        "bindTo": "SxPlatform",
                        "layout": {
                            "column": 0,
                            "row": 7,
                            "colSpan": 12
                        }
                    }
                },

                {
                    "operation": "merge",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "SourceOrder",
                    "values": {
                        "bindTo": "SourceOrder",
                        "layout": {
                            "column": 12,
                            "row": 0,
                            "colSpan": 12
                        }
                    }
                },
                {
                    "operation": "merge",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "PaymentAmount",

                    "values": {
                        "bindTo": "PaymentAmount",
                        "enabled": false
                    }
                },
                {
                    "operation": "merge",
                    "parentName": "Header",
                    "propertyName": "items",
                    "name": "Account",

                    "values": {
                        "bindTo": "Account",
                        "visible": {
                            bindTo:"isAccountVisible"
                        }
                    }
                },
                /*{
                    "operation": "insert",
                    "parentName": "OrderPassportTab",
                    "propertyName": "items",
                    "name": "OrderAddressAndDelivery",
                    "values": {"itemType": Terrasoft.ViewItemType.DETAIL}
                }*/

            ]/**SCHEMA_DIFF*/,
            attributes: {
                "PaymentAmount":{
                    dependencies: [
                        {
                            columns: ["Amount","SxDeliveryPrice"],
                            methodName: "PaymentAmountCalculate"
                        }
                    ]
                },
                "WithoutPartedPay": {
                    "type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
                    "dataValueType": this.Terrasoft.DataValueType.GUID,
                    "value": this.Terrasoft.GUID_EMPTY
                },
                "Name":{
                    dependencies:[
                        {
                            columns: ["SxCurrency"],
                            methodName: "onChangeCurrency"
                        }
                    ]
                }
            },
            methods: {

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
                               // result.message = this.get("Resources.Strings.ValidateOrderStatus");
                               // result.success = false;
                            }
                        } else {
                            return;
                        }
                        callback.call(this, result);
                    }, scope);
                },
                asyncValidate: function(callback, scope) {
                    this.callParent([function(response) {
                        if (!this.validateResponse(response)) {
                            return;
                        }
                        Terrasoft.chain(
                            function(next) {
                                this.validateOrderStatus(function(response) {
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
                onChangeCurrency: function () {

                    var Currency=this.get("SxCurrency")||{};
                    var CurrentId=this.get("Id");
                    //OrderProduct
                    var th=this;
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

                                                //if(CurrencyId==item.get("Currency").value) {
                                                //th.set("Price",item.get("Price"));
                                                var newprice=item.get("Price");
                                                //TODO update price in OrderProduct by OrderProductId
                                                var update = this.Ext.create("Terrasoft.UpdateQuery", {
                                                    rootSchemaName: "OrderProduct"
                                                });
                                                update.setParameterValue("Price", newprice, this.Terrasoft.DataValueType.FLOAT);
                                                update.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
                                                    this.Terrasoft.ComparisonType.EQUAL, "Id",  OrderProductId));
                                                update.execute();
                                                /*setTimeout(th.updateDetail(
                                                    {
                                                        detail: "Product",//название детали (как описана в карточке)
                                                        reloadAll: true
                                                    }
                                                ),5000);*/
                                                setTimeout(function(){
                                                    th.updateDetail(
                                                        {
                                                            detail: "Product",//название детали (как описана в карточке)
                                                            reloadAll: true
                                                        }
                                                    )
                                                },2000);
                                                // }
                                            })
                                        }
                                    },this);
                                })
                            }

                        }
                    }, this);
                    th.updateDetail(
                        {
                            detail: "Product",//название детали (как описана в карточке)
                            reloadAll: true
                        }
                    )
                },
                init: function() {
                    this.callParent(arguments);
                    this.on("change:Contact", this.RefreshAccountVisible);
                    this.sandbox.subscribe("UpdateNumberFromDB", function(){
                        this.refreshFilter();
                        var masterId = this.get("Id");
                        var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
                            rootSchemaName: this.entitySchemaName
                        });
                        select.addColumn("Number");
                        select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
                            "Id", masterId));
                        select.getEntityCollection(function(response) {
                            if (response.success && response.collection.getCount() > 0) {
                                var updatedMaster = response.collection.getByIndex(0);
                                this.set("Number", updatedMaster.get("Number"));
                                var updatedPrimaryAmount = updatedMaster.get("PrimaryAmount");
                            }
                        }, this);
                    }, this);
                },

                PaymentAmountCalculate: function(){
                    var paymentAmount=this.get("Amount")+this.get("SxDeliveryPrice");
                    this.set("PaymentAmount",paymentAmount);
                },
                isOrderCancelled: function(){
                    if(this.get("Status"))
                    {
                        if (this.get("Status").value=="8ab0f830-908b-40d7-80a3-7f49ef70ce70")
                          return true;
                        else
                          return false;
                    }
                    else
                        return false;
                },
                RefreshAccountVisible: function(){
                        if (this.get("Contact"))
                        {
                            var contactId=this.get("Contact").value;
                            var select=Ext.create('Terrasoft.EntitySchemaQuery', {rootSchemaName: 'Contact'});
                            select.addColumn('Id');
                            select.addColumn('Type.Id');

                            select.filters.add('filterCreatedBy', Terrasoft.createColumnFilterWithParameter(
                                Terrasoft.ComparisonType.EQUAL, 'Id', contactId));
                            select.getEntityCollection(function(response) {
                                if (response.success && response.collection) {
                                    var items = response.collection.getItems();
                                    if (items.length > 0) {
                                        this.set('isAccountVisible',
                                                items[0].get("Type.Id")=="806732ee-f36b-1410-a883-16d83cab0980");
                                    }
                                }
                            }, this);
                        }
                },
                validatePaymentAmount: function() {
                    var paymentAmount = this.get("PaymentAmount");
                    //var amount = this.get("Amount");
                    var invalidMessage = "";
                    if (paymentAmount < 0) {
                        invalidMessage = this.get("Resources.Strings.ValidatePaymentAmountNegative");
                    }
                    return {
                        fullInvalidMessage: invalidMessage,
                        invalidMessage: invalidMessage
                    };
                },
                onEntityInitialized: function() {
                    this.callParent(arguments);
                    this.refreshFilter();
                },
                refreshFilter: function() {
                    var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
                        rootSchemaName: "SxAddressDeliveryType"
                    });
                    select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
                        "SxOrder", this.get("Id")));
                    select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
                        "AddressType", "0af25a5b-2a51-4879-ab2d-238173736d59"));
                    select.getEntityCollection(function(response) {
                        var f = (response.success && response.collection.getCount() > 0);
                        this.set("WithoutPartedPay", f ? 'a2f17c7b-956b-47c8-9ea5-b545b74a26f6' : Terrasoft.GUID_EMPTY);
                    }, this);
                }
            },
            rules: {
                "SxOrderCancelCase":
                {
                    "SxOrderCancelCaseRequired": {
                        "ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        "property": BusinessRuleModule.enums.Property.REQUIRED,
                        "conditions": [
                            {
                                "leftExpression": {
                                    "type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                    "attribute": "Status"
                                },
                                "comparisonType": Terrasoft.ComparisonType.EQUAL,
                                "rightExpression": {
                                    "type": BusinessRuleModule.enums.ValueType.CONSTANT,
                                    "value": "8ab0f830-908b-40d7-80a3-7f49ef70ce70"
                                }
                            }
                        ]
                    }
                },
                "PaymentStatus": {
                    "WithoutPartedPay": {
                        ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
                        baseAttributePatch: "Id",
                        comparisonType: Terrasoft.ComparisonType.NOT_EQUAL,
                        type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                        attribute: "WithoutPartedPay"
                    }
                }
            },
            userCode: {}
        };
    });
