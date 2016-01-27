define("InvoiceConfigurationConstants", ["InvoiceConfigurationConstantsResources"], function(resources) {

	var invoice = {
		PaymentStatus: {
			Paid: "698d39fd-52e6-df11-971b-001d60e938c6",
			PartiallyPaid: "03794bf5-52e6-df11-971b-001d60e938c6",
			WaitingPayment: "36319d13-98e6-df11-971b-001d60e938c6",
			Canceled: "3fb932ea-f36b-1410-2691-00155d043205",
			NotInvoiced: "02794bf5-52e6-df11-971b-001d60e938c6"
		}
	};

	var dashboard = {
		Type: {
			InvoiceByPayment: "a7691005-7af7-4eda-89eb-2ba28cf48864",
			OpportunityByOwner: "cb8dce09-30a8-434f-9756-a587138780c4"
		}
	};

	return {
		Dashboard: dashboard,
		Invoice: invoice
	};
});