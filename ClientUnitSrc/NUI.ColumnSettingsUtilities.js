define('ColumnSettingsUtilities', function() {
	function openColumnSettings(sandbox, config, callback, renderTo, scope) {
		var handler = function(args) {
			callback.call(scope, args);
		};
		var columnSettingsId = sandbox.id + '_ColumnSettings';
		sandbox.subscribe('ColumnSettingsInfo', function() {
			return config;
		}, [columnSettingsId]);
		var params = sandbox.publish('GetHistoryState');
		sandbox.publish('PushHistoryState', {hash: params.hash.historyState});
		sandbox.loadModule('ColumnSettings', {
			renderTo: renderTo,
			id: columnSettingsId,
			keepAlive: true
		});
		sandbox.subscribe('ColumnSetuped', handler, [columnSettingsId]);
	}

	return {
		Open: openColumnSettings
	};
});