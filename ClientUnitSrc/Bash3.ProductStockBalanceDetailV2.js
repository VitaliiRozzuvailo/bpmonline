define("ProductStockBalanceDetailV2", [],
    function () {
        return {
            entitySchemaName: "ProductStockBalance",
            methods: {},
            diff: /**SCHEMA_DIFF*/[
                {
                    operation: "remove",
                    name: "TotalQuantityListedGridColumn"
                },
                {
                    operation: "remove",
                    name: "ReserveQuantityListedGridColumn"
                },
                {
                    operation: "remove",
                    name: "TotalQuantityTiledGridColumn"
                },
                {
                    operation: "remove",
                    name: "ReserveQuantityTiledGridColumn"
                }
            ]/**SCHEMA_DIFF*/
        };
    }
);
