define("OrderProductDetailV2", [], function() {
    return {
        entitySchemaName: "OrderProduct",
        methods: {
            init: function() {
                debugger;
                this.callParent(arguments);
                this.set("MultiSelect", false);
                this.set("isCollapsed", false);
                this.initCrossSaleLabelStyle();
            },
            getGridDataColumns: function() {
                debugger;
                var gridDataColumns = this.callParent(arguments);
                if (gridDataColumns && !gridDataColumns.SxCanceled) {
                    gridDataColumns.SxCanceled = {
                        path: "SxCanceled",
                        orderPosition: 0,
                        orderDirection: Terrasoft.OrderDirection.ASC
                    };
                }
                if (gridDataColumns && !gridDataColumns.SxCrossSale) {
                    gridDataColumns.SxCrossSale = {
                        path: "SxCrossSale",
                        orderPosition: 0,
                        orderDirection: Terrasoft.OrderDirection.ASC
                    };
                }
                if (gridDataColumns && !gridDataColumns.TotalAmount) {
                    gridDataColumns.TotalAmount = {
                        path: "TotalAmount",
                        orderPosition: 0,
                        orderDirection: Terrasoft.OrderDirection.ASC
                    };
                }
                return gridDataColumns;
            },
            addItemsToGridData: function(response) {
                var items = response.collection.items;
                var ttl = 0;
                for(var i = 0; i < items.length; i++) {
                    if(items[i].get("SxCrossSale")) ttl += items[i].get("TotalAmount");
                }
                this.set("SxCrossSaleTotalAmount", ttl);
                response.collection.each(function(el){
                    if(el.get('SxCanceled'))
                        el.customStyle = {
                            backgroundColor: "lightgray"
                        };
                });
                this.callParent(arguments);
            },
            getSxCrossSaleTotalAmount: function() {
                return "Сумма кросс-продаж: " + this.get("SxCrossSaleTotalAmount");
            },
            initCrossSaleLabelStyle: function() {
                if(!document.getElementById("SxCrossSaleTotalAmountLabelStyle")) {
                    var node = document.createElement("style");
                    node.id = "SxCrossSaleTotalAmountLabelStyle";
                    document.head.appendChild(node);
                    node.setAttribute("type", "text/css");
                    var content = "#OrderProductDetailV2SxCrossSaleTotalAmountLabel { width: auto; margin-left: 1em; }";
                    node.innerHTML = content;
                }
            }
        },
        diff: /**SCHEMA_DIFF*/[
            {
                "operation": "insert",
                "name": "SxCrossSaleTotalAmount",
                "parentName": "Detail",
                "propertyName": "tools",
                "values": {
                    "itemType": Terrasoft.ViewItemType.LABEL,
                    "visible": {bindTo: "getToolsVisible"},
                    "enabled": true,
                    "caption": {"bindTo": "getSxCrossSaleTotalAmount"}
                }
            }/*,
            {
                "operation": "merge",
                "name": "Price",
                "parentName": "Detail",
                "propertyName": "tools",
                "values": {
                    "itemType": Terrasoft.ViewItemType.LABEL,
                    "visible": {bindTo: "getToolsVisible"},
                    "enabled": true,
                    "caption": "цена"
                }
            },
            {
                "operation": "insert",
                "name": "PriceValue",
                "parentName": "PriceItemsContainer",
                "propertyName": "items",
                "values": {
                    "caption": {"bindTo": "Price"},
                    "markerValue": {"bindTo": "Resources.Strings.PriceCaption"},
                    "itemType": Terrasoft.ViewItemType.LABEL,
                    "classes": {"labelClass": ["price-item-value"]}
                }
            }*/
        ]/**SCHEMA_DIFF*/
    };
});