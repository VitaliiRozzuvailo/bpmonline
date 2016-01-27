define("AccountPageV2", ["BaseFiltersGenerateModule", "ConfigurationEnums", "ConfigurationConstants",
        "DuplicatesSearchUtilitiesV2"],
    function(BaseFiltersGenerateModule, Enums, ConfigurationConstants) {
        return {
            entitySchemaName: "Account",
            messages: {

            },
            attributes: {
                "Owner": {
                    dataValueType: Terrasoft.DataValueType.LOOKUP,
                    lookupListConfig: {
                        filter: function() {

                            var leftExpression = "[Contact:Id].Type";

                            var filter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
                                leftExpression, '60733efc-f36b-1410-a883-16d83cab0980');
                            return filter;
                        }
                    }
                }
            },
            details: /**SCHEMA_DETAILS*/{

            }/**SCHEMA_DETAILS*/,
            /**
             * Классы-миксины (примеси) расширяющие функциональность данного класа
             */
            mixins: {

            },
            methods: {

            },
            diff: /**SCHEMA_DIFF*/[

            ]/**SCHEMA_DIFF*/
        };
    });