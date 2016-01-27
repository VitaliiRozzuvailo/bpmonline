define("NavigationModule", ["ext-base", "terrasoft", "sandbox"],
	function(Ext, Terrasoft, sandbox) {

	var router = Terrasoft.router.Router;

	function init() {
		router.on("stateChanged", onRouterStateChanged, router);
		sandbox.subscribe("PushHistoryState", onPushHistoryState);
		sandbox.subscribe("ReplaceHistoryState", onReplaceHistoryState);
		sandbox.subscribe("GetHistoryState", onGetHistoryState);
		sandbox.subscribe("BackHistoryState", onBackHistoryState);
		sandbox.subscribe("ForwardHistoryState", onForwardHistoryState);
		onRouterStateChanged();
		sandbox.publish("NavigationModuleLoaded");
	}

	function onReplaceHistoryState(historyState) {
		router.replaceState(historyState.stateObj, historyState.pageTitle, historyState.hash, historyState.silent);
	}

	function onRouterStateChanged() {
		var history = onGetHistoryState();
		sandbox.publish("HistoryStateChanged", history);
	}

	/**
	 * Возвращает последнее состояние истории браузера.
	 * Проверка первого символа клиентской части адреса связана с проблемами в ie версии 9
	 * @returns {Object} Последнее состояние истории браузера
	 */
	function onGetHistoryState() {
		var hash = router.getHash();
		if (hash.charAt(0) === "/") {
			hash = hash.slice(1);
		}
		var history = {
			state: router.getState(),
			hash: splitHistoryState(hash)
		};
		return history;
	}

	function splitHistoryState(historyState) {
		var historyStateParts = historyState.split("?");
		var params = historyStateParts[0].split("/");
		var history = {};
		history.historyState = historyState;
		history.moduleName = params[0];
		history.entityName = params[1];
		history.operationType =  params[2];
		var paramExtr = 3;
		if (params.length > 4 && history.operationType !== "add") {
			paramExtr = 4;
			if (params[3]) {
				history.recordId = params[3];
			}
		}
		if (params.length > 4) {
			var valuePairs = (params.length - paramExtr) / 2;
			history.valuePairs = [];
			for (var i = 0; i < valuePairs; i++) {
				var index = paramExtr + i * 2;
				history.valuePairs[i] = {
					name: params[index],
					value: params[index + 1]
				};
			}
		} else {
			if (params[3]) {
				history.recordId = params[3];
			}
		}
		return history;
	}

	function onPushHistoryState(historyState) {
		var result = sandbox.publish("BeforeHistoryChanging", historyState);
		if (Ext.isEmpty(result) || result) {
			router.pushState(historyState.stateObj, historyState.pageTitle, historyState.hash, historyState.silent);
		}
		if (historyState.silent === true) {
			sandbox.publish("RefreshCacheHash");
		}
	}

	function onBackHistoryState() {
		router.back();
	}

	function onForwardHistoryState() {
		router.forward();
	}

	return {
		"init": init
	};
});
