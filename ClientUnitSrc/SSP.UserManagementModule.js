define('UserManagementModule', ['ext-base', 'terrasoft', 'sandbox', 'UserManagementModuleResources'],
		function(Ext, Terrasoft, sandbox, resources) {

	var render = function(renderTo) {
		switch (Terrasoft.action) {
			case 'register':
				sandbox.loadModule('Registration', {
					renderTo: renderTo,
					id: sandbox.id + '-Registration',
					keepAlive: true
				});
				break;
		}
	};

	return {
		render: render,
		renderTo: Ext.getBody()
	};
});