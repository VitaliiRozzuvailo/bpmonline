define("ContactCommunicationDetail", ["ContactCommunicationDetailResources", "terrasoft", "ViewUtilities", "Contact", "ConfigurationEnums", "ConfigurationConstants","MultiMaskEdit"],
    function(resources, Terrasoft, ViewUtilities, Contact, ConfigurationEnums, ConfigurationConstants,MultiMaskEdit) {
        return {
            entitySchemaName: "ContactCommunication",

            attributes: {
            },
            methods: {

                initCommunicationTypesFilters: function(entitySchemaName) {
                    this.callParent(arguments);
                  //  debugger;
                    var columns = Contact.columns;
                    if (columns !== null) {

                        if(TypeStatus!='60733efc-f36b-1410-a883-16d83cab0980') {
                            if (columns.LinkedIn.usageType === ConfigurationEnums.EntitySchemaColumnUsageType.None) {
                                var InstagtramFilter = Terrasoft.createColumnFilterWithParameter(
                                    Terrasoft.ComparisonType.NOT_EQUAL, "Id", ConfigurationConstants.CommunicationTypes.Instagtram);
                                entitySchemaName.filters.addItem(InstagtramFilter);
                                var OdnoklasnikiFilter = Terrasoft.createColumnFilterWithParameter(
                                    Terrasoft.ComparisonType.NOT_EQUAL, "Id", ConfigurationConstants.CommunicationTypes.Odnoklasniki);
                                entitySchemaName.filters.addItem(OdnoklasnikiFilter);
                                var VkontakteFilter = Terrasoft.createColumnFilterWithParameter(
                                    Terrasoft.ComparisonType.NOT_EQUAL, "Id", ConfigurationConstants.CommunicationTypes.Vkontakte);
                                entitySchemaName.filters.addItem(VkontakteFilter);
                            }
                        }
                     }
                 return entitySchemaName;
                }
            },

            diff: /**SCHEMA_DIFF*/[


            ]/**SCHEMA_DIFF*/
        };
    });