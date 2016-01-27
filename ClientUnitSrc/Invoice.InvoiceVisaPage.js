define('InvoiceVisaPage', ['InvoiceVisaPageStructure', 'InvoiceVisaPageResources', 'InvoiceVisa'],
	function(structure, resources, InvoiceVisa) {
		structure.userCode = function() {
			var filterSchemaName = 'Invoice';
			this.entitySchema = InvoiceVisa;
			this.name = 'InvoiceVisaCardViewModel';
			this.extend = 'VisaPage';

		};
		structure.extend = 'VisaPage';

		return structure;
	})





//define('InvoiceVisaPage', ['InvoiceVisaPageStructure', 'InvoiceVisaPageResources', 'InvoiceVisa'],
//	function(structure, resources, InvoiceVisa) {
//		structure.userCode = function() {
//			this.entitySchema = InvoiceVisa;
//			this.name = 'InvoiceVisaCardViewModel';
////					filterSchemaName = 'Invoice';
//		};
//		structure.extend = 'VisaPage';
//
//		return structure;
//	})
