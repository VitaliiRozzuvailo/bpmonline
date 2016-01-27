define('ViewModuleHelper', ['ext-base', 'terrasoft', 'ViewModuleHelperResources'],
	function(Ext, Terrasoft, resources) {

	function getSideBarDefaultConfig(callback) {
		var menuConfig = {
			items: [{
				name: 'LeftPanelTopMenuModule',
				id: 'leftPanelTopMenu',
				showInHeader: true
			}, {
				name: 'LeftPanelClientWorkplaceMenu',
				id: 'leftPanelClientWorkplaceMenu',
				showInHeader: true
			}, {
				name: 'SectionMenuModule',
				id: 'sectionMenuModule'
			}]
		};
		callback(menuConfig);
	}

	return {
		getSideBarDefaultConfig: getSideBarDefaultConfig
	};
});