define('InvoiceDetail', ['ext-base', 'terrasoft', 'Invoice', 'InvoiceDetailStructure', 'InvoiceDetailResources'],
	function(Ext, Terrasoft, Invoice,  structure, resources) {
	
	structure.userCode = function() {
		this.entitySchema = Invoice;
		this.name = 'InvoiceDetailViewModel';
		this.editPageName = 'InvoicePage';
		this.columnsConfig = [
			{
				cols: 8,
				key: [
					{
						name: {
							bindTo: 'Number'
						},
						type: 'title'
					}
				]
			},
			{
				cols: 8,
				key: [
					{
						name: {
							bindTo: 'PrimaryAmount'
						}
					}
				]
			},
			{
				cols: 8,
				key: [
					{
						name: {
							bindTo: 'PaymentStatus'
						}
					}
				]
			}
		];
		this.loadedColumns = [
			{
				columnPath: 'Number'
			}, {
				columnPath: 'PrimaryAmount'
			}, {
				columnPath: 'PaymentStatus'
			}
		];
		this.methods.setEntitySchema = function() {
			this.entitySchema = Invoice;
		};
	};
	return structure;
});