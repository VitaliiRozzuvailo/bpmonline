define("SxSxSetProduct1Page", [], function () {
    return {
        entitySchemaName: "SxSetProduct",
        messages: {
            "UpdateSetInProduct": {
                mode: Terrasoft.MessageMode.PTP,
                direction: Terrasoft.MessageDirectionType.PUBLISH
            }
        },
        attributes: {
            // Ќаименование колонки модели представлени€.
            "SxProduct": {
                dataValueType: Terrasoft.DataValueType.LOOKUP,
                lookupListConfig: {
                    filters: [
                        function () {
                            debugger
                            var set = this.get("SxSet");

                            var filterGroup = Ext.create("Terrasoft.FilterGroup");
                            filterGroup.add("IsSet", Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "SxIsSet", "false"));
                            filterGroup.add("IsThisId", Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL, "Id", set.value));
                            return filterGroup;
                        }
                    ]
                }
            }
        },
        details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
        diff: /**SCHEMA_DIFF*/[
	{
	    "operation": "insert",
	    "name": "SxProductcbda84c3-e2a9-40c8-9fa3-8734908f9644",
	    "values": {
	        "layout": {
	            "colSpan": 12,
	            "rowSpan": 1,
	            "column": 0,
	            "row": 0,
	            "layoutName": "Header"
	        },
	        "bindTo": "SxProduct"
	    },
	    "parentName": "Header",
	    "propertyName": "items",
	    "index": 0
	},
	{
	    "operation": "insert",
	    "name": "SxQuantitydc1fc65b-5b74-4fae-a112-a86b0cf7b3b9",
	    "values": {
	        "layout": {
	            "colSpan": 12,
	            "rowSpan": 1,
	            "column": 12,
	            "row": 0,
	            "layoutName": "Header"
	        },
	        "bindTo": "SxQuantity"
	    },
	    "parentName": "Header",
	    "propertyName": "items",
	    "index": 1
	}
        ]/**SCHEMA_DIFF*/,
        methods: {
            onSaved: function () {
                if (this.get("SxProduct"))
                    this.sandbox.publish("UpdateSetInProduct");

                this.callParent(arguments);
            },
        },
        rules: {}
    };
});
