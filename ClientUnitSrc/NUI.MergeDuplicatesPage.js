define("MergeDuplicatesPage", ["ext-base", "terrasoft", "sandbox", "MergeDuplicatesPageView",
	"MergeDuplicatesPageViewModel", "DetailModule", "DuplicatesModuleView", "DuplicatesModuleViewModel"], function(Ext,
		Terrasoft, sandbox, MergeDuplicatesPageView, MergeDuplicatesPageViewModel, DetailModule, DuplicatesModuleView,
			DuplicatesModuleViewModel) {
	var viewModel;
	function render(renderTo) {
		if (viewModel) {
			var cloneConfig = Terrasoft.deepClone(this.viewConfig);
			var view = Ext.create("Terrasoft.Container", cloneConfig);
			view.bind(viewModel);
			view.render(renderTo);
			viewModel.loadDetails();
			viewModel.renderValueVariants();
			return;
		}
		var historyState = sandbox.publish("GetHistoryState");
		var entitySchemaName = historyState.hash.entityName;
		var state = historyState.state;
		var list = [];
		if (state && state.list && Ext.isArray(state.list)) {
			list = state.list;
		}
		// TODO: Убрать
		if (Ext.isEmpty(entitySchemaName)) {
			entitySchemaName = "Account";
		}
		if (list.length < 2) {
			list = ["f23f40a8-f36b-1410-6c8b-000c2992b005", "51ce59b8-875c-49ea-9d39-d46d70a7748d",
			"b2a3fd22-db18-4c39-bb07-e866c0cbf424"];
		}

		if (entitySchemaName !== "Account") {
			entitySchemaName = "Contact";
		}

		var viewModelConfig = MergeDuplicatesPageViewModel.generate(sandbox, entitySchemaName);
		viewModel = Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
		this.viewConfig = MergeDuplicatesPageView.generate(viewModelConfig);
		var config = Terrasoft.deepClone(this.viewConfig);
		var _view = Ext.create("Terrasoft.Container", config);
		viewModel.on("change:isViewGroup", function(model, tag) {
			var radioGroup = ["Changed", "All"];
			if (Ext.isEmpty(tag) || radioGroup.indexOf(tag) < 0) {
				return;
			}
			Terrasoft.each(radioGroup, function(item) {
				this.set("isView" + item, (tag === item));
			}, this);
			this.controlDisplayChange.call(this);
		}, viewModel);
		viewModel.renderTo = renderTo;
		viewModel.init();
		_view.bind(viewModel);
		_view.render(renderTo);
		viewModel.load(list);
		var mainHeaderCaption = MergeDuplicatesPageView.getHeaderCaption(entitySchemaName);
		sandbox.publish("InitDataViews", {caption: mainHeaderCaption});
	}

	function destroy() {
		var historyState = sandbox.publish("GetHistoryState");
		var mainHeaderCaption = DuplicatesModuleView.getMainHeaderCaption(historyState.hash.entityName);
		sandbox.publish("InitDataViews", {caption: mainHeaderCaption});
	}

	return {
		init: function() {
			var state = sandbox.publish("GetHistoryState");
			var currentHash = state.hash;
			var currentState = state.state || {};
			if (currentState.moduleId === sandbox.id) {
				return;
			}
			var newState = Terrasoft.deepClone(currentState);
			newState.moduleId = sandbox.id;
			sandbox.publish("ReplaceHistoryState", {
				stateObj: newState,
				pageTitle: null,
				hash: currentHash.historyState,
				silent: true
			});
		},
		render: render,
		destroy: destroy
	};
});