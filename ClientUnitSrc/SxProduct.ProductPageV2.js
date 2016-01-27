define('ProductPageV2', ['ProductPageV2Resources', 'GeneralDetails'],
function (resources, GeneralDetails) {
    return {
        entitySchemaName: 'Product',
        details: /**SCHEMA_DETAILS*/{
            "ProductStockBalance": {
                "schemaName": "ProductStockBalanceDetailV2",
                "filter": {
                    "masterColumn": "Id",
                    "detailColumn": "Product"
                }
            },
            "ProductUnitDetail": {
                "schemaName": "ProductUnitDetailV2",
                "filter": {
                    "masterColumn": "Id",
                    "detailColumn": "Product"
                }
            },
            "ProductPriceDetail": {
                "schemaName": "ProductPriceDetailV2",
                "filter": {
                    "masterColumn": "Id",
                    "detailColumn": "Product"
                }
            },
            "ProductSpecificationDetail": {
                "schemaName": "ProductSpecificationDetailV2",
                "filter": {
                    "masterColumn": "Id",
                    "detailColumn": "Product"
                }
            }
        }/**SCHEMA_DETAILS*/,
        diff: /**SCHEMA_DIFF*/[
	{
	    "operation": "merge",
	    "name": "Owner",
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
	    "name": "Code",
	    "values": {
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
	    "name": "IsArchive",
	    "values": {
	        "layout": {
	            "column": 0,
	            "row": 1,
	            "colSpan": 12,
	            "rowSpan": 1
	        }
	    }
	},
	{
	    "operation": "move",
	    "name": "IsArchive",
	    "parentName": "ProductGeneralInfoBlock",
	    "propertyName": "items",
	    "index": 2
	},
	{
	    "operation": "insert",
	    "name": "SxPriceCross",
	    "values": {
	        "layout": {
	            "column": 12,
	            "row": 1,
	            "colSpan": 12,
	            "rowSpan": 1
	        },
	        "bindTo": "SxPriceCross",
	        "caption": {
	            "bindTo": "Resources.Strings.SxPriceCrossCaption"
	        },
	        "textSize": 0,
	        "labelConfig": {
	            "visible": true
	        },
	        "enabled": true
	    },
	    "parentName": "ProductGeneralInfoBlock",
	    "propertyName": "items",
	    "index": 3
	},
	{
	    "operation": "merge",
	    "name": "Category",
	    "values": {
	        "layout": {
	            "column": 0,
	            "row": 0,
	            "colSpan": 12,
	            "rowSpan": 1
	        }
	    }
	},
	{
	    "operation": "move",
	    "name": "Category",
	    "parentName": "ProductCategoryBlock",
	    "propertyName": "items",
	    "index": 0
	},
	{
	    "operation": "merge",
	    "name": "Type",
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
	    "operation": "remove",
	    "name": "URL"
	},
	{
	    "operation": "remove",
	    "name": "TradeMark"
	},
            /*{
                "operation": "insert",
                "name": "SxPriceListMemo",
                "parentName": "BaseGeneralInfoBlock",
                "propertyName": "items",
                "values": {
                    "bindTo": "SxPriceListMemo",
                    "enabled": false,
                    "layout": {
                        "column": 0,
                        "row": 0,
                        "colSpan": 12
                    }
                }
            },*/


            {
                "operation": "insert",
                "name": "SxPriceListMemoControlGroup",
                "parentName": "ProductGeneralInfoTab",
                "propertyName": "items",
                "index": 6,
                "values": {
                    "itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
                    "caption": "",
                    "items": [],
                    "controlConfig": {
                        "collapsed": false
                    },
                    "visible": false
                }
            },
            {
                "operation": "insert",
                "name": "SxPriceListMemoBlock",
                "parentName": "SxPriceListMemoControlGroup",
                "propertyName": "items",
                "values": {
                    "itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
                    "items": []
                }
            },
            {
                "operation": "insert",
                "name": "SxPriceListMemo",
                "parentName": "SxPriceListMemoBlock",
                "propertyName": "items",
                "values": {
                    "contentType": Terrasoft.ContentType.LONG_TEXT,
                    "bindTo": "SxPriceListMemo",
                    "layout": { "column": 0, "row": 0, "colSpan": 24 },
                    "visible": true
                }
            }


        ]/**SCHEMA_DIFF*/,
        attributes: {},
        methods: {},
        rules: {},
        userCode: {}
    };
});
