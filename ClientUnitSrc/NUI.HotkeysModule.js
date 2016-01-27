define("HotkeysModule", ["ext-base", "sandbox"], function(Ext, sandbox) {
		return {
			init: function() {
				sandbox.loadModule("HotkeyItemsModule");
				sandbox.subscribe("GetEventsConfig", function(eventsHandlerConfig) {
					var body = Ext.getBody();
					for (var eventName in eventsHandlerConfig) {
						if (eventsHandlerConfig.hasOwnProperty(eventName)) {
							body.on(eventName, eventsHandlerConfig[eventName]);
						}
					}
				}, ["ViewModel_HotkeyItemsModule"]);
			}
		};
	}
);