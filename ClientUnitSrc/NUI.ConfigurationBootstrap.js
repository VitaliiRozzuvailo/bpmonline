define("ConfigurationBootstrap", ["terrasoft", "BootstrapModules"],
	function(Terrasoft, bootstrapModules) {
	var modulesNames = [];
	Terrasoft.each(bootstrapModules, function() {
		var moduleName = arguments[1];
		modulesNames.push(moduleName);
	});
	require(modulesNames, function() {
		Terrasoft.each(arguments, function(module) {
			if (module && module.init) {
				module.init();
			}
		});
	});//a
});