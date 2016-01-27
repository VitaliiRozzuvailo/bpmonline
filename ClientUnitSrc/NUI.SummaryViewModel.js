define('SummaryViewModel', ['ext-base', 'terrasoft', 'SummaryViewModelResources'],
	function(Ext, Terrasoft, resources) {
		var entitySchema;

		function generateItem() {
			var viewModel = {
				values: {
					columnCaption: '',
					columnValue: ''
				},
				methods: {}
			};
			return viewModel;
		}

		function generate() {
			var viewModel = {
				values: {
				},
				methods: {
				}
			};
			return viewModel;
		}

		return {
			generate : generate,
			generateItem : generateItem
		};
	});
