define("ContactAddressPageV2", ["BusinessRuleModule"], function(BusinessRuleModule) {
    return {
        entitySchemaName: "ContactAddress",
        methods: {
            getIsNotBlackList: function(){
                if(TypeStatus == 'c08d7ee9-e801-45d7-ae0c-44bb50b12ebd' ||TypeStatus =='00783ef6-f36b-1410-a883-16d83cab0980') {
                 return false;
                }
                else{
                    return true;
                }
            },

            save: function(){
                CountryBase= this.get('Country').Name;
                return this.callParent(arguments);

        }
        },
        details: /**SCHEMA_DETAILS*/{
        }/**SCHEMA_DETAILS*/,
        rules: {},
        diff: /**SCHEMA_DIFF*/[
            {
                "operation": "merge",
                "parentName": "Header",
                "propertyName": "items",
                "name": "AddressType",
                "values": {
                    bindTo: "AddressType",
                    contentType: Terrasoft.ContentType.ENUM,
                    layout: { column: 0, row: 0, colSpan: 12 },
                    "visible": {"bindTo": "getIsNotBlackList"}
                }
            }
        ]/**SCHEMA_DIFF*/
    };
});