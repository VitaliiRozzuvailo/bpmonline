define('DuplicatesModule', ['ext-base', 'terrasoft', 'sandbox', 'DuplicatesModuleView', 'DuplicatesModuleViewModel',
		'MaskHelper', 'DuplicatesModuleResources'],
function(Ext, Terrasoft, sandbox, DuplicatesModuleView, DuplicatesModuleViewModel, MaskHelper, resources) {
	var viewModel;
	var viewConfig;
	function render(renderTo) {
		if (viewModel) {
			viewModel.set('selectedRows', []);
			viewModel.set('expandHierarchyLevels', []);
			var cloneConfig = Terrasoft.deepClone(this.viewConfig);
			var view = Ext.create('Terrasoft.Container', cloneConfig);
			viewModel.init();
			view.bind(viewModel);
			view.render(renderTo);
			return;
		}
		var historyState = sandbox.publish('GetHistoryState');
		var entitySchemaName = historyState.hash.entityName;
		if (entitySchemaName !== 'Account') {
			entitySchemaName = 'Contact';
		}
		var viewModelConfig = DuplicatesModuleViewModel.generate(sandbox, entitySchemaName);
		this.viewConfig = DuplicatesModuleView.generate(entitySchemaName);
		var config = Terrasoft.deepClone(this.viewConfig);
		var _view = Ext.create('Terrasoft.Container', config);
		viewModel = Ext.create('Terrasoft.BaseViewModel', viewModelConfig);
		viewModel.renderTo = renderTo;
		viewModel.init();
		_view.bind(viewModel);
		MaskHelper.HideBodyMask();
		_view.render(renderTo);
		viewModel.updateStatus(true);
		var caption = resources.localizableStrings[entitySchemaName + 'Caption'];
		sandbox.publish("InitDataViews", {caption: caption});
	}
	return {
		init: function() {
			var state = sandbox.publish('GetHistoryState');
			var currentHash = state.hash;
			var currentState = state.state || {};
			if (currentState.moduleId === sandbox.id) {
				return;
			}
			var newState = Terrasoft.deepClone(currentState);
			newState.moduleId = sandbox.id;
			sandbox.publish('ReplaceHistoryState', {
				stateObj: newState,
				pageTitle: null,
				hash: currentHash.historyState,
				silent: true
			});
		},
		render: render
	};
});