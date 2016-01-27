define("StructureExplorerUtilities", ["ModalBox", "MaskHelper"], function(modalBox, MaskHelper) {
	var structureExplorerPageId;
	function openStructureExplorer(sandbox, config, callback, renderTo, scope) {
		this.sandbox = sandbox;
		if (!scope.structureExplorerPageParamsById) {
			scope.structureExplorerPageParamsById = [];
		}
		var handler = function(args) {
			callback.call(scope, args);
			MaskHelper.HideBodyMask();
		};
		structureExplorerPageId = sandbox.id + "_StructureExplorerPage";
		sandbox.subscribe("StructureExplorerInfo", function() {
			scope.structureExplorerPageParamsById[structureExplorerPageId] = config;
			return scope.structureExplorerPageParamsById[structureExplorerPageId];
		}, [structureExplorerPageId]);
		var modalBoxSize = getModalBoxSize(config);
		var container = modalBox.show(modalBoxSize,
			function(destroy) {
				if (destroy) {
					sandbox.unloadModule(structureExplorerPageId);
				}
			}, this);

		sandbox.loadModule("StructureExploreModule", {
			renderTo: container,
			id: structureExplorerPageId,
			keepAlive: false
		});
		sandbox.subscribe("ColumnSelected", handler, [structureExplorerPageId]);
	}
	var mbBaseSize = {
		widthPixels: 568,
		heightPixels: 420
	};
	function getModalBoxSize(config) {
		var mbSize;
		if (config.widthPixels && config.heightPixels) {
			mbSize = {
				widthPixels: config.widthPixels,
				heightPixels: config.heightPixels
			};
		} else if (config.minWidth && config.minHeight && config.maxHeight && config.maxWidth) {
			mbSize = {
				minWidth: config.minWidth,
				minHeight: config.minHeight,
				maxHeight: config.maxHeight,
				maxWidth: config.maxWidth
			};
		} else {
			mbSize = {
				widthPixels: mbBaseSize.widthPixels,
				heightPixels: mbBaseSize.heightPixels
			};
		}
		return mbSize;
	}
	function closeStructureExplorer() {
		modalBox.close();
		if (this.sandbox) {
			this.sandbox.unloadModule(structureExplorerPageId);
		}
		structureExplorerPageId = null;
	}
	return {
		Close: closeStructureExplorer,
		Open: openStructureExplorer
	};
});