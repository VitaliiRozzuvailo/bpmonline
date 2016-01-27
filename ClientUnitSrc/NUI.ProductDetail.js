define('ProductDetail', ['ProductDetailStructure',
	'ProductDetailResources'],
	function(structure, resources) {
	structure.userCode = function() {
		this.name = 'ProductDetailViewModel';
		this.utilsConfig = {
			hiddenAdd: true,
			useAdditionalAddButton: true
		};
		this.columnsConfig = [
			[{
				cols: 16,
				key: [{
					name: {
						bindTo: 'Name'
					},
					type: 'title'
				}]
			}, {
				cols: 3,
				key: [{
					name: {
						bindTo: 'Quantity'
					}
				}]
			}, {
				cols: 5,
				key: [{
					name: {
						bindTo: 'TotalAmount'
					}
				}]
			}]
		];
		this.loadedColumns = [{
			columnPath: 'Name'
		}, {
			columnPath: 'Quantity'
		}, {
			columnPath: 'TotalAmount'
		}];
	};
	return structure;
});