define("SxAddressDeliveryTypeDetailV2", ["SxAddressDeliveryTypeDetailV2Resources", "terrasoft", "ViewUtilities", "ConfigurationEnums", "ConfigurationConstants","MultiMaskEdit"],
    function(resources, Terrasoft, ViewUtilities, Contact, ConfigurationEnums, ConfigurationConstants,MultiMaskEdit) {
        return {
            entitySchemaName: "SxAddressDeliveryType",

            attributes: {
                /**
                 * Коллекция типов адреса. "Домашний", "Доставки" и т.д.
                 */
                AddressTypes: {dataValueType: this.Terrasoft.DataValueType.COLLECTION}
            },
            messages: {
                "UpdateDetail": {
                    mode: Terrasoft.MessageMode.PTP,
                    direction: Terrasoft.MessageDirectionType.SUBSCRIBE
                }
            },
            methods: {
                init: function(callback, scope) {
                    if (!this.get("AddressTypes")) {
                        this.initAddressTypes(function() {
                            this.init(callback, scope);
                        }, this);
                    } else {
                        this.callParent(arguments);
                    }
                },

                updateDetail: function(config) {
                    //        debugger;
                    this.callParent(arguments);
                    this.getEntityStructure("SxAddressDeliveryType");
                    //      window.location.reload();
                },


               getEntityStructure: function(entitySchemaName) {
                    //if (!entitySchemaName) {
                    //    return this.callParent(arguments);
                   // }
                    //   debugger;

                    var entityStructure = this.callParent(arguments);

                    var typeColumnName = (entityStructure.attribute = "AddressType");

                    var addressTypes = this.get("AddressTypes");
                    var sourcePage = "SxAddressDeliveryTypePageV2";
                    var pages = [];
                   //if(TypeStatus != 'c08d7ee9-e801-45d7-ae0c-44bb50b12ebd') {

                        addressTypes.each(function (addressType) {
                            var caption = addressType.get("Name");
                            pages.push(Ext.apply({}, {
                                "UId": addressType.get("Id"),
                                "caption": caption,
                                "captionLcz": caption,
                                "typeColumnName": "AddressType"
                            }, sourcePage));
                        }, this);
                        entityStructure.pages = pages;
                    /*}
                    else{
                        pages.push(Ext.apply({}, {
                            "Id": this.Terrasoft.GUID_EMPTY,
                            "caption":this.get("Resources.Strings.AddButtonCaption"),
                            cardSchema: "SxAddressDeliveryTypePageV2",
                            typeColumnName: "AddressType"
                        }))
                        entityStructure.pages = pages;
                    }*/
                    return entityStructure;
                    TypeStatus=null;


                },

                onDetailCollapsedChanged:  function(entitySchemaName){
                    // debugger;
                    //  this.getEntityStructure(entitySchemaName);

                },

                getIsNotDeliveryNoteDetail: function(){

                    if(TypeStatus != 'c08d7ee9-e801-45d7-ae0c-44bb50b12ebd') {
                        return false;
                    }
                    else{return true;}
                },
                getIsNotDeliveryNoteDetail2: function(){
                    if(TypeStatus != 'c08d7ee9-e801-45d7-ae0c-44bb50b12ebd') {
                        return true;
                    }
                    else{return true;}
                },
                initAddressTypes: function(callback, scope) {
                    var esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "SxDeliveryType"});
                    esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
                    var nameColumn = esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "Name");
                    nameColumn.orderPosition = 1;
                    nameColumn.orderDirection = this.Terrasoft.OrderDirection.ASC;
                    var addressTypeColumnFilter = "";
                    var detailColumnName = this.get("DetailColumnName");
                   /* if (detailColumnName === "Contact") {
                        addressTypeColumnFilter = "ForContact";
                    } else if (detailColumnName === "Account") {
                        addressTypeColumnFilter = "ForAccount";
                    }
                    if (addressTypeColumnFilter) {
                        esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
                            this.Terrasoft.ComparisonType.EQUAL, addressTypeColumnFilter, 1));
                    }*/
                    esq.getEntityCollection(function(result) {
                        var addressTypes = Ext.create("Terrasoft.BaseViewModelCollection");
                        if (result.success) {
                            addressTypes = result.collection;
                        }
                        this.set("AddressTypes", addressTypes);
                        callback.call(scope);
                    }, this);
                }

            },

            diff: /**SCHEMA_DIFF*/[

                /*
                 {
                 "operation": "merge",
                 "name": "AddTypedRecordButton",
                 "parentName": "Detail",
                 "propertyName": "tools",
                 "values": {
                 "visible": {"bindTo": "getIsNotDeliveryNoteDetail"}
                 }
                 }
                 ,
                 {
                 "operation": "insert",
                 "name": "AddRecordButton",
                 "parentName": "Detail",
                 "propertyName": "tools",
                 "values": {
                 "itemType": Terrasoft.ViewItemType.BUTTON,
                 "caption": {"bindTo": "Resources.Strings.AddButtonCaption"},
                 "click": {"bindTo": "addRecord"},
                 "visible": {"bindTo": "getIsNotDeliveryNoteDetail2"}
                 }
                 }
                 */

            ]/**SCHEMA_DIFF*/
        };
    });