define("OrderSectionV2", [], function() {
    return {
        entitySchemaName: "Order",
        attributes: {},
        methods: {
            getReportParam:function () {
                var token = "CardModuleV2/SxGetReportParamPageV2/edit/"+Terrasoft.generateGUID();
                this.sandbox.publish("PushHistoryState", {hash: token});
            }
        },
        diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
    };
});