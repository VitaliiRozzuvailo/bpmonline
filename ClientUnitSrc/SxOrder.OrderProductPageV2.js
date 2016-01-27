define("OrderProductPageV2", [],
    function() {
        return {
            entitySchemaName: "OrderProduct",
            attributes:{
                "Price":{
                    dependencies:[
                        {
                            columns: ["Product"],
                            methodName: "GeneratePrice"
                        }
                    ]
                }
            },
            methods: {
                GeneratePrice: function(){
                    var Order=this.get("Order");
                    //var CurrencyId=this.get("Currency").value;
                    var OrderId=this.get("Order").value;
                    var product=this.get("Product")||{};
                    var productId=product.value;
                    var th=this;
                    var GetCurr=Ext.create("Terrasoft.EntitySchemaQuery",{rootSchemaName: "Order"})
                    GetCurr.addColumn("SxCurrency");
                    GetCurr.addColumn("Id");
                    GetCurr.filters.add("OrderFilter", this.Terrasoft.createColumnFilterWithParameter(
                        this.Terrasoft.ComparisonType.EQUAL, "Id", OrderId));
                    var Currency;
                    GetCurr.getEntityCollection(function(response) {
                        if (response.success && response.collection) {
                            var items = response.collection.getItems();
                            if (items.length > 0) {
                                Currency=items[0].get("SxCurrency");
                            }
                            var PriceListEsq=Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "ProductPrice"});
                            PriceListEsq.addColumn("Product");
                            PriceListEsq.addColumn("PriceList");
                            PriceListEsq.addColumn("Price");
                            PriceListEsq.addColumn("Currency");
                            PriceListEsq.filters.add("OrderFilter", this.Terrasoft.createColumnFilterWithParameter(
                                this.Terrasoft.ComparisonType.EQUAL, "Product", productId));
                            PriceListEsq.filters.add("CurrencyFilter", this.Terrasoft.createColumnFilterWithParameter(
                                this.Terrasoft.ComparisonType.EQUAL, "Currency", Currency.value));
                            PriceListEsq.getEntityCollection(function(response){
                                if (response.success && response.collection) {
                                    var items = response.collection.getItems();
                                    items.forEach(function(item,i,items){
                                        //if(CurrencyId==item.get("Currency").value) {
                                            th.set("Price",item.get("Price"));
                                       // }
                                    })
                                }
                            },this);
                        }
                    }, this);
                    var CountryEsq=Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "SxAddressDeliveryType"});
                    CountryEsq.addColumn("Id");
                    CountryEsq.addColumn("SxOrder");
                    CountryEsq.addColumn("Country");
                    CountryEsq.filters.add("OrderFilter", this.Terrasoft.createColumnFilterWithParameter(
                        this.Terrasoft.ComparisonType.EQUAL, "SxOrder", OrderId));
                    var string="";
                    var Country;
                    CountryEsq.getEntityCollection(function(response) {
                        if (response.success && response.collection) {
                            var items = response.collection.getItems();
                            if (items.length > 0) {
                                th.set('TempCountry',
                                    items[0].get("Country"));
                                Country=items[0].get("Country");
                               // items.forEach(function(item,i,items){
                                //    string=string+item.get("SxOrder").value+"  ";
                                   // alert(item.get("SxOrder").displayValue);
                               // })

                                //Console.write(string);
                                //string=string+items[]
                            }
                        }
                    }, this);
                    var a=7;

                },
                setPrice: function () {
                    return "";
                },
                setPriceAsync: function () {
                    return "";
                },
                calculatePrimaryValues: function() {

                }
            },
            diff: [
                {
                    "operation": "insert",
                    "name": "SxCanceled",
                    "parentName": "BaseGeneralInfoBlock",
                    "propertyName": "items",
                    "values": {
                        "bindTo": "SxCanceled",
                        "enabled": true,
                        "layout": {
                            "column": 12,
                            "row": 0,
                            "colSpan": 12
                        }
                    }
                },
                {
                    "operation": "insert",
                    "name": "SxCrossSale",
                    "parentName": "BaseGeneralInfoBlock",
                    "propertyName": "items",
                    "values": {
                        "bindTo": "SxCrossSale",
                        "enabled": true,
                        "layout": {
                            "column": 12,
                            "row": 1,
                            "colSpan": 12
                        }
                    }
                },
                {
                    "operation": "merge",
                    "name": "Price",
                    "parentName": "BaseGeneralInfoBlock",
                    "propertyName": "items",
                    "values": {
                        "bindTo": "Price",
                        "enabled": true,
                        "layout": {
                            "column": 12,
                            "row": 2,
                            "colSpan": 12
                        }
                    }
                }
            ]
        };
    });