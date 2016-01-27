define("ProductSpecificationDetailV2", function() {
		return {
			entitySchemaName: "SpecificationInProduct",
			methods: {
				/**
				 * @inheritdoc Terrasoft.GridUtilitiesV2#getFilterDefaultColumnName
				 * @overridden
				 */
				getFilterDefaultColumnName: function() {
					return "Specification";
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"rowDataItemMarkerColumnName": "Specification"
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
