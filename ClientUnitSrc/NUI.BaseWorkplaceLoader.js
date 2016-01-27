define('BaseWorkplaceLoader', ['BaseWorkplaceLoaderResources', 'sandbox'],
	function(resources, sandbox) {

		function load(args) {
			resetMenuByWorkplaceId(args);
			sandbox.publish('PostSectionMenuConfig', {modules: args.modules}, ['SectionMenuModuleId']);
		}

		function init() {
			var args = sandbox.publish('GetWorkplaceInfo');
			load(args);
		}

		function resetMenuByWorkplaceId(workplace) {
			var structure = Terrasoft.configuration.ModuleStructure;
			if (structure) {
				Terrasoft.each(structure, function(item) {
					if (hasModule(workplace.modules, item)) {
						item.hide = "false";
						setModulePosition(workplace.modules, item);
					} else {
						item.hide = "true";
					}
				}, this);
			}
		}

		function setModulePosition(workplaceModules, sectionItem) {
			if (workplaceModules && sectionItem) {
				Terrasoft.each(workplaceModules, function(item) {
					if (item.sectionName === sectionItem.sectionSchema ||
						item.sectionName === sectionItem.sectionModule) {
						sectionItem.position = item.position;
					}
				}, this);
			}
		}

		function hasModule(workplaceModules, sectionItem) {
			var has = false;
			if (workplaceModules && sectionItem) {
				Terrasoft.each(workplaceModules, function(item) {
					if (item.sectionName === sectionItem.sectionSchema ||
						item.sectionName === sectionItem.sectionModule) {
						has = true;
					}
				}, this);
			}
			return has;
		}

		return {
			init: init,
			load: load
		};
	});