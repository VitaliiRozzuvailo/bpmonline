define('ProcessNotifyDemoViewModel', ['ext-base', 'terrasoft', 'sandbox', 'ProcessNotifyDemoViewModelResources'],
	function(Ext, Terrasoft, sandbox, resources) {

		var generateMainViewModel = function() {
			var viewModel = Ext.create('Terrasoft.BaseViewModel');
			return viewModel;
		}

		return {
			generate: generateMainViewModel
		}

	});