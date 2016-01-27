define("ProductSalesUtils", ["ext-base", "terrasoft", "ProductSalesUtilsResources", "MaskHelper"],
	function(Ext, Terrasoft, resources, MaskHelper) {
		var openProductSelectionModuleInChain = function(config, sandbox) {
			MaskHelper.ShowBodyMask();
			var params = sandbox.publish("GetHistoryState");
			sandbox.publish("PushHistoryState", {
				hash: params.hash.historyState,
				silent: true
			});
			sandbox.loadModule("ProductSelectionModule", {
				renderTo: "centerPanel",
				id: config.moduleId + "_ProductSelectionModule",
				keepAlive: true
			});
			return true;
		};

		return {
			openProductSelectionModuleInChain: openProductSelectionModuleInChain
		};
	});