define("ProductStockBalancePageV2", ["BaseFiltersGenerateModule", "BusinessRuleModule", "Warehouse"],
    function(BaseFiltersGenerateModule, BusinessRuleModule, Warehouse) {
        return {
            entitySchemaName: "ProductStockBalance",
            attributes: {
                Warehouse: {
                    dataValueType: Terrasoft.DataValueType.LOOKUP,
                    lookupListConfig: {
                        columns: ['SxOwner']
                    }
                },
                SxOwner: {
                    dataValueType: Terrasoft.DataValueType.LOOKUP,
                    caption: {
                        bindTo: "Resources.Strings.SxOwnerCaption"
                    },
                    lookupListConfig: {filter: BaseFiltersGenerateModule.OwnerFilter},
                    referenceSchemaName: 'Contact',
                    dependencies: [
                        {
                            columns: ['Warehouse'],
                            methodName: 'setOwner'
                        }
                    ]
                }
            },
            methods: {
                onEntityInitialized: function () {
                    this.setOwner();
                    this.callParent(arguments);
                },
                setOwner: function () {
                    var warehouse = this.get("Warehouse") || {},
                        owner = warehouse.SxOwner? warehouse.SxOwner: null;
                    this.set("SxOwner", owner);
                },
                saveOwner: function (callback, scope) {
                    var warehouse = this.get("Warehouse") || {},
                        owner = this.get("SxOwner") || {},
                        warehouseOwner = warehouse.SxOwner? warehouse.SxOwner: {},
                        result = {
                            success: true
                        };
                    if ((warehouseOwner.value !== owner.value) && !this.Ext.isEmpty(owner.value)) {
                        var query = this.Ext.create("Terrasoft.UpdateQuery", {
                            rootSchema: Warehouse
                        });
                        query.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
                            this.Terrasoft.ComparisonType.EQUAL, "Id", warehouse.value));
                        query.setParameterValue("SxOwner", owner.value);
                        query.execute(function (response) {
                            result.success = response.success;
                            !result.success && (result.message = this.get("Resources.Strings.CantSaveOwner"));
                            callback.call(scope || this, result);
                        }, scope || this);
                    } else {
                        callback.call(scope || this, result);
                    }
                },
                asyncValidate: function (callback, scope) {
                    this.callParent([function (response) {
                        if (!this.validateResponse(response)) return;
                        Terrasoft.chain(
                            function (next) {
                                this.saveOwner(function (response) {
                                    this.validateResponse(response) && next();
                                }, this);
                            },
                            function (next) {
                                callback.call(scope, response);
                                next();
                            },
                            this
                        );
                    }, this]);
                }
            },
            diff: /**SCHEMA_DIFF*/[
                {
                    operation: "merge",
                    name: "TotalQuantity",
                    values: {
                        visible: false
                    }
                },
                {
                    operation: "merge",
                    name: "ReserveQuantity",
                    values: {
                        visible: false
                    }
                },
                {
                    operation: "merge",
                    name: "AvailableQuantity",
                    values: {
                        enabled: true,
                        layout: {
                            column: 12,
                            row: 0,
                            colSpan: 12
                        }
                    }
                },
                {
                    operation: "insert",
                    parentName: "Header",
                    propertyName: "items",
                    name: "SxOwner",
                    values: {
                        bindTo: "SxOwner",
                        layout: {
                            column: 12,
                            row: 1,
                            colSpan: 12
                        }
                    }
                },
                {
                    operation: "insert",
                    parentName: "Header",
                    propertyName: "items",
                    name: "SxCountry",
                    values: {
                        bindTo: "SxCountry",
                        layout: {
                            column: 0,
                            row: 2,
                            colSpan: 12
                        }
                    }
                }
            ],/**SCHEMA_DIFF*/
            rules: {
                SxOwner: {
                    SxOwnerEnabledByWarehouse: {
                        ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
                        property: BusinessRuleModule.enums.Property.ENABLED,
                        conditions: [
                            {
                                leftExpression: {
                                    type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
                                    attribute: "Warehouse"
                                },
                                comparisonType: Terrasoft.ComparisonType.IS_NOT_NULL
                            }
                        ]
                    }
                }
            }
        };
    }
);