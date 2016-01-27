define("SearchDuplicatesSettingsPage", ["ext-base", "terrasoft", "sandbox", "SearchDuplicatesSettingsPageViewModel",
	"SearchDuplicatesSettingsPageView", "DuplicatesModuleView"], function(Ext, Terrasoft, sandbox,
		SearchDuplicatesSettingsPageViewModel, SearchDuplicatesSettingsPageView, DuplicatesModuleView) {

		/*function loadCommandLine() {
			var commandLineContainer = Ext.get("command-line-container");
			sandbox.loadModule("CommandLineModule", {
				renderTo: commandLineContainer
			});
		}*/

	function render(renderTo) {
		var historyState = sandbox.publish("GetHistoryState");
		var viewModelConfig = SearchDuplicatesSettingsPageViewModel.generate(sandbox, historyState.state.entitySchemaName);
		var viewConfig = SearchDuplicatesSettingsPageView.generate();
		var view = Ext.create("Terrasoft.Container", viewConfig);
		var viewModel = Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
		viewModel.on("change:isByPeriodGroup", function(model, tag) {
			var radioGroup = ["Changed", "All"];
			if (Ext.isEmpty(tag) || radioGroup.indexOf(tag) < 0) {
				return;
			}
			Terrasoft.each(radioGroup, function(item) {
				this.set("isByPeriod" + item, (tag === item));
			}, this);
		}, viewModel);
		viewModel.load();
		view.bind(viewModel);
		view.render(renderTo);
		var mainHeaderCaption =
				SearchDuplicatesSettingsPageViewModel.getMainHeaderCaption(historyState.state.entitySchemaName);
		sandbox.publish("InitDataViews", {caption: mainHeaderCaption});
		//loadCommandLine();
	}

	function destroy() {
		var historyState = sandbox.publish("GetHistoryState");
		var mainHeaderCaption = DuplicatesModuleView.getMainHeaderCaption(historyState.hash.entityName);
		sandbox.publish("InitDataViews", {caption: mainHeaderCaption});
	}

	return {
		render: render,
		destroy: destroy
	};
});
