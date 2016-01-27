define("LeadSpecificationDetailV2", [],
	function() {
		return {
			entitySchemaName: "SpecificationInLead",
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
	}
);