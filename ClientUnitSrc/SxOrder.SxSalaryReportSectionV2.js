define('SxSalaryReportSectionV2', ['GridUtilitiesV2'],
    function(GridUtilitiesV2) {
        return {
            entitySchemaName: 'SxSalaryReport',
            contextHelpId: '1001',
            diff: /**SCHEMA_DIFF*/[
                {
                    "operation": "merge",
                    "name": "FiltersContainer",
                    "values": {
                        "visible":false
                    }
                }
            ]/**SCHEMA_DIFF*/,
            messages: {},
            methods: {}
        };
    });
