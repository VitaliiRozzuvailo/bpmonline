define('ContactPageV2', ['ContactPageV2Resources', 'GeneralDetails'],
    function(resources, GeneralDetails) {
        return {
            entitySchemaName: 'Contact',
            details: /**SCHEMA_DETAILS*/{

            }/**SCHEMA_DETAILS*/,
            diff: /**SCHEMA_DIFF*/[
                {
                    "operation": "insert",
                    "name": "SxFromSite",
                    "parentName": "Header",
                    "propertyName": "items",
                    "values": {
                        //"contentType": Terrasoft.ContentType.LONG_TEXT,
                        "bindTo": "SxFromSite",
                        "layout": { "column": 12, "row":3, "colSpan": 12 },
                        "visible": true
                    }
                },
                {
                    "operation": "insert",
                    "name": "Country",
                    "parentName": "Header",
                    "propertyName": "items",
                    "values": {
                        //"contentType": Terrasoft.ContentType.LONG_TEXT,
                        "bindTo": "Country",
                        "layout": { "column": 2, "row":4, "colSpan": 10 },
                        "visible": {bindTo:"IsVisible"}
                    }
                },
                {
                    "operation": "insert",
                    "name": "City",
                    "parentName": "Header",
                    "propertyName": "items",
                    "values": {
                        //"contentType": Terrasoft.ContentType.LONG_TEXT,
                        "bindTo": "City",
                        "layout": { "column": 12, "row":4, "colSpan": 12 },
                        "visible": {bindTo:"IsVisible"}
                    }

                }
            ]/**SCHEMA_DIFF*/,
            attributes: {
                "City":{
                    "isRequired": {bindTo:"IsVisible"}
                },
                "Country":{
                    "isRequired": {bindTo:"IsVisible"}
                }
            },
            methods: {
                IsVisible: function(){
                    if (this.isAddMode()){
                        return true;
                    }
                }
               /* onSaved: function(){
                    if (this.isAddMode()){

                        var insert = this.Ext.create("Terrasoft.InsertQuery", {
                            rootSchema: "ContactAddress"
                        });
                        //insert.setColumnValue(,"Contact");
                        insert.setParameterValue("Contact",
                            this.get("Id"), Terrasoft.DataValueType.GUID);
                        insert.setParameterValue("Country",
                            this.get("Country").value, Terrasoft.DataValueType.GUID);
                        insert.setParameterValue("City",
                            this.get("City").value, Terrasoft.DataValueType.GUID);
                        //insert.setColumnValue(,"Country");
                        //insert.setColumnValue(,"City");


                        insert.execute();

                    }
                    this.callParent(arguments);

                }*/
            },
            rules: {},
            userCode: {}
        };
    });
