define('ProductPageV2', ['ProductPageV2Resources', 'GeneralDetails'],
function (resources, GeneralDetails) {
    return {
        entitySchemaName: 'Product',
        messages: {
            "UpdateSetInProduct": {
                mode: Terrasoft.MessageMode.PTP,
                direction: Terrasoft.MessageDirectionType.SUBSCRIBE
            }
        },
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
            },
            "SxSetProduct": {
                "schemaName": "SxSchema1Detail",
                "entitySchemaName": "SxSetProduct",
                "filter": {
                    "detailColumn": "SxSet",
                    "masterColumn": "Id"
                }
            }
        }/**SCHEMA_DETAILS*/,
        diff: /**SCHEMA_DIFF*/[
	        {
	            "operation": "merge",
	            "name": "ProductGeneralInfoTab",
	            "values": {
	                "caption": {
	                    "bindTo": "Resources.Strings.ProductGeneralInfoTabCaption"
	                }
	            }
	        },
	        {
	            "operation": "merge",
	            "name": "ProductPricesTab",
	            "values": {
	                "caption": {
	                    "bindTo": "Resources.Strings.ProductPricesTabCaption"
	                }
	            }
	        },
	        {
	            "operation": "merge",
	            "name": "ProductSpecificationTab",
	            "values": {
	                "caption": {
	                    "bindTo": "Resources.Strings.ProductSpecificationTabCaption"
	                }
	            }
	        },
	        {
	            "operation": "insert",
	            "name": "ProductPageV26Tab",
	            "values": {
	                "items": [],
	                "caption": {
	                    "bindTo": "Resources.Strings.ProductPageV26TabCaption"
	                }
	            },
	            "parentName": "Tabs",
	            "propertyName": "tabs",
	            "index": 4
	        },
	        {
	            "operation": "insert",
	            "name": "SxSetProduct",
	            "values": {
	                "itemType": 2
	            },
	            "parentName": "ProductPageV26Tab",
	            "propertyName": "items",
	            "index": 0
	        },
	        {
	            "operation": "merge",
	            "name": "ProductFilesTab",
	            "values": {
	                "caption": {
	                    "bindTo": "Resources.Strings.ProductFilesTabCaption"
	                }
	            }
	        }
        ]/**SCHEMA_DIFF*/,
        attributes: {},
        methods: {

            init: function () {
                this.callParent(arguments);

                this.sandbox.subscribe("UpdateSetInProduct", function () {

                    this.set("SxIsSet", true);
                    var id = this.get("Id");
                    var update = Ext.create("Terrasoft.UpdateQuery", {
                        rootSchemaName: "Product"
                    });

                    update.setParameterValue("SxIsSet", true, Terrasoft.DataValueType.BOOLEAN);
                    update.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Id", id));
                    update.execute();

                }, this);
            }
        },
        rules: {},
        userCode: {}
    };
});
