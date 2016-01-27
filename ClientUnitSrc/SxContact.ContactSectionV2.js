define("ContactSectionV2", ["GridUtilitiesV2", "GoogleIntegrationUtilities", "RightUtilities",
        "ConfigurationConstants"],
    function(gridUtilitiesV2, GoogleUtilities, RightUtilities, ConfigurationConstants) {
        return {
            entitySchemaName: "Contact",
            attributes: {
            },
            messages: {
            },
            methods: {
                /**
                 * @overridden
                 */
                init: function() {
                   if(typeof(CommandLineChar)!='undefined' && CommandLineChar=="+"){
                        this.entitySchema.primaryDisplayColumn.name="MobilePhone";
                        this.primaryDisplayColumnName="MobilePhone";
                        this.entitySchema.primaryDisplayColumn.caption="Мобильный телефон";
                        this.entitySchema.primaryColumn.uId="98e085c7-ad4d-4ac6-8c1c-09be09876d44";
                        this.entitySchema.primaryDisplayColumn.uId="98e085c7-ad4d-4ac6-8c1c-09be09876d44";
                    }
                    else{
                        this.entitySchema.primaryDisplayColumn.name="Name";
                        this.primaryDisplayColumnName="Name";
                        this.entitySchema.primaryDisplayColumn.caption="ФИО";
                        this.entitySchema.primaryColumn.uId="ae0e45ca-c495-4fe7-a39d-3ab7278e1617";
                        this.entitySchema.primaryDisplayColumn.uId="ae0e45ca-c495-4fe7-a39d-3ab7278e1617";
                    }
                    this.checkCanSearchDuplicates();
                    this.set("GridType", "tiled");
                    this.callParent(arguments);
                    var sysSettings = ["BuildType"];
                    Terrasoft.SysSettings.querySysSettings(sysSettings, function() {
                        var buildType = Terrasoft.SysSettings.cachedSettings.BuildType &&
                            Terrasoft.SysSettings.cachedSettings.BuildType.value;
                        this.set("canUseGoogleOrSocialFeaturesByBuildType", buildType !==
                            ConfigurationConstants.BuildType.Public);
                    }, this);
                }
            }
        };
    });
