define("OrderSectionV2", function () {
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
                var mail = this.get("CurrentSxMail");
                if (!mail) {
                    var activeRow = this.get("ActiveRow");
                    if (activeRow) {
                        var m = this.get("GridData").get(activeRow).get("SxMail") || {};
                        return (m || m.value === "ec82cf93-0994-4eb0-82a7-b991c55d5dde") ? true : false;
                    }
                    return false;
                }
                else {
                    return (mail.value === "ec82cf93-0994-4eb0-82a7-b991c55d5dde");
                }
            },

            onUpdateTTNClick: function () {
                //send message to OrderPageV2 for update TTN
                this.sandbox.publish("UpdateTTN");
            },
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