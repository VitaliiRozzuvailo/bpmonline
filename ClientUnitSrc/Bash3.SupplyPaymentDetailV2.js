define("SupplyPaymentDetailV2", ["ConfigurationConstants", "OrderConfigurationConstants", "ConfigurationEnums",
        "SupplyPaymentGridButtonsUtility", "Order", "ConfigurationGrid", "ConfigurationGridGenerator",
        "ConfigurationGridUtilities", "css!SupplyPaymentGridButtonsUtility", "OrderUtilities"],
    function(ConfigurationConstants, OrderConfigurationConstants, enums, GridButtonsUtil, Order) {
        return {
            entitySchemaName: "SupplyPaymentElement",
            attributes: {

            },
            messages: {
                "SetPrimaryValues": {
                    mode: this.Terrasoft.MessageMode.PTP,
                    direction: this.Terrasoft.MessageDirectionType.PUBLISH
                }
            },

            /**
             * Классы-миксины, расширяющие функциональность данного класа.
             */
            mixins: {
                ConfigurationGridUtilites: "Terrasoft.ConfigurationGridUtilities",
                OrderUtilities: "Terrasoft.OrderUtilities"
            },
            methods: {
                onCardSaved: function() {
                    var setTemplateRecordId = this.get("SetTemplateRecordId");
                    if (setTemplateRecordId) {
                        this.set("SetTemplateRecordId", null);
                        this.setTemplateWithCheck(setTemplateRecordId);
                    } else {
                        var needRefresh = this.get("NeedRefreshAfterPageSaved");
                        if (needRefresh) {
                            this.set("NeedRefreshAfterPageSaved", false);
                            this.set("AddRowOnDataChangedConfig", {callback: this.onCardSaved, scope: this});
                            this.reloadGridData();
                        } else {
                            this.callParent(arguments);
                        }
                    }
                    this.sandbox.publish("SetPrimaryValues");
                },
                initItemTemplates: function() {
                    /*v ar templateCollection = Ext.create("Terrasoft.BaseViewModelCollection");
                    var esq = this.getTemplateNamesEsq();
                    esq.getEntityCollection(function(response) {
                        if (response.success) {
                            response.collection.each(function(template) {
                                var id = template.get("Id");
                                templateCollection.add(id, this.getButtonMenuItem({
                                    Id: id,
                                    Caption: template.get("Name"),
                                    Click: {bindTo: "setTemplate"},
                                    Tag: id
                                }));
                            }, this);
                        }
                        this.set("ItemTemplates", templateCollection);
                    }, this);*/

                    //var templateCollection=this.get("ItemTemplates");
                    var templateCollection = Ext.create("Terrasoft.BaseViewModelCollection");
                    var Id=Terrasoft.generateGUID();
                    templateCollection.add(Id, this.getButtonMenuItem({
                        Id: Id,
                        Caption: "Заполнить деталь по шаблону",
                        Click: {bindTo: "newTemplateFunction"},
                        Tag: Id
                    }));
                    this.set("ItemTemplates", templateCollection);
                },
                newTemplateFunction: function(){
                    debugger;
                    var id = this.get("MasterRecordId");
                    this.callService({
                        serviceName: "SxSupplyPaymentService",
                        methodName: "addPayment",
                        data: {
                            "Id": id
                        }
                    },this.someCallBack, this);
                },
                someCallBack: function(){
                    debugger;
                    this.reloadGridData();
                },
                reloadGridData: function(){
                    this.callParent(arguments);
                }
            },
            diff: /**SCHEMA_DIFF*/[
            ]/**SCHEMA_DIFF*/
        };
    }
);
