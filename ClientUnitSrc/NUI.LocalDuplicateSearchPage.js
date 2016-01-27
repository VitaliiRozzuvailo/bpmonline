define("LocalDuplicateSearchPage", ["ext-base", "sandbox", "LocalDuplicateSearchPageViewModel",
		"LocalDuplicateSearchPageView", "MaskHelper"], function(Ext, sandbox, LocalDuplicateSearchPageViewModel,
		LocalDuplicateSearchPageView, MaskHelper) {
	function render(renderTo) {
		var historyState = sandbox.publish("GetHistoryState");
		var config = sandbox.publish("GetDuplicateSearchConfig", null, [sandbox.id]);
		var state = config || historyState.state;
		var viewModelConfig = LocalDuplicateSearchPageViewModel.generate(sandbox, state.entitySchemaName);
		var viewConfig = LocalDuplicateSearchPageView.generate(state.entitySchemaName);
		var view = Ext.create("Terrasoft.Container", viewConfig);
		var viewModel = Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
		viewModel.load(state);
		view.bind(viewModel);
		MaskHelper.HideBodyMask();
		view.render(renderTo);
	}

	return {render: render};
});