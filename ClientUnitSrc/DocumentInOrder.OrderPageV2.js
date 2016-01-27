define("OrderPageV2", ["ProductEntryPageUtils", "css!VisaHelper"],
	function() {
		return {
				entitySchemaName: "Order",
				details: /**SCHEMA_DETAILS*/{
					Document: {
						schemaName: "DocumentDetailV2",
						entitySchemaName: "Document",
						filter: {
							masterColumn: "Id",
							detailColumn: "Order"
						},
						defaultValues: {
							Account: {masterColumn: "Account"},
							Contact: {masterColumn: "Contact"}
						}
					}
				}/**SCHEMA_DETAILS*/,
				attributes: {},
				methods: {},
				rules: {},
				userCode: {},
				diff: /**SCHEMA_DIFF*/[
				]/**SCHEMA_DIFF*/
			};
	});
