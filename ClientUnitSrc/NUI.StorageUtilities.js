define("StorageUtilities", ["ext-base", "terrasoft", "sandbox", "StorageUtilitiesResources"], function(Ext, Terrasoft) {
	var clearStorageModes = {
		ALL: "all",
		GROUP: "group",
		ITEM: "item",
		GROUP_ITEM: "groupItem"
	};

	var getESQResultByKey = function(config) {
		var result = Terrasoft.configuration.Storage[config.key];
		if (result) {
			config.callback.call(config.scope, result);
		} else {
			var setESQResultByKey = function(result) {
				Terrasoft.configuration.Storage[config.key] = result;
				config.callback.call(config.scope, result);
			};
			if (config.extraQuery) {
				config.extraQuery.query.getEntityCollection(function(result) {
					Terrasoft.configuration.Storage[config.extraQuery.key] = result;
					config.esq.getEntityCollection(setESQResultByKey);
				});
			} else {
				config.esq.getEntityCollection(setESQResultByKey);
			}
		}
	};

	function isFunction(functionToCheck) {
		var getType = {};
		return functionToCheck && getType.toString.call(functionToCheck) === "[object Function]";
	}
	function cloneResult(result) {
		var returnedResult = [];
		for (var i = 0; i < result.length; i++) {
			returnedResult.push(Terrasoft.deepClone(result[i]));
		}
		return returnedResult;
	}
	function workRequestWithStorage(storageKeyGenerator, requestFunction, callbackFunction, scope) {
		scope = scope || this;
		var storageKey = null;
		var groupName = null;
		if (isFunction(storageKeyGenerator)) {
			storageKey = storageKeyGenerator.apply(scope, Array.prototype.slice.call(arguments, 4));
		} else {
			storageKey = storageKeyGenerator;
		}
		if (Ext.isEmpty(storageKey)) {
			callbackFunction.call(scope, {});
			return;
		}
		if (storageKey.constructor === Object &&
			storageKey.hasOwnProperty("groupName") &&
			storageKey.hasOwnProperty("valueKey")) {
			groupName = storageKey.groupName;
			storageKey = storageKey.valueKey;
		}
		var result = {};
		if (!Ext.isEmpty(groupName)) {
			result = Terrasoft.configuration.Storage[groupName];
			if (!Ext.isEmpty(result)) {
				result = result[storageKey];
			}
		} else {
			result = Terrasoft.configuration.Storage[storageKey];
		}
		if (!Ext.isEmpty(result)) {
			callbackFunction.apply(scope, cloneResult(result));
		} else {
			var saveResultFunction = function() {
				if (!Ext.isEmpty(groupName)) {
					var group = Terrasoft.configuration.Storage[groupName];
					if (Ext.isEmpty(group)) {
						group = Terrasoft.configuration.Storage[groupName] = {};
					}
					group[storageKey] = arguments;
				} else {
					Terrasoft.configuration.Storage[storageKey] = arguments;
				}

				callbackFunction.apply(scope, cloneResult(arguments));
			};
			var requestArguments = Array.prototype.slice.call(arguments, 4);
			requestArguments.unshift(saveResultFunction);
			requestFunction.apply(scope, requestArguments);
		}
		return storageKey;
	}
	function clearAllInStorage() {
		for (var storageValue in Terrasoft.configuration.Storage) {
			delete Terrasoft.configuration.Storage[storageValue];
		}
	}
	function clearItemInStorage(name) {
		if (Terrasoft.configuration.Storage.hasOwnProperty(name)) {
			delete Terrasoft.configuration.Storage[name];
		}
	}
	function clearGroupItemInStorage(groupName, itemName) {
		if (Terrasoft.configuration.Storage.hasOwnProperty(groupName) &&
			Terrasoft.configuration.Storage[groupName].hasOwnProperty(itemName)) {
			delete Terrasoft.configuration.Storage[groupName][itemName];
		}
	}
	function clearStorage(mod, groupName, itemName) {
		switch (mod) {
			case clearStorageModes.ALL:
				clearAllInStorage();
				return;
			case clearStorageModes.GROUP:
			case clearStorageModes.ITEM:
				clearItemInStorage(groupName);
				break;
			case clearStorageModes.GROUP_ITEM:
				clearGroupItemInStorage(groupName, itemName);
				break;
		}
	}

	function innerGetItem(groupName, itemName) {
		var group = (groupName && itemName)
			? Terrasoft.configuration.Storage[groupName] || {}
			: Terrasoft.configuration.Storage;
		var key = groupName || itemName;
		var item = group[key];
		return Terrasoft.deepClone(item);
	}

	function innerSetItem(item, groupName, itemName) {
		if (groupName && itemName) {
			var group = Terrasoft.configuration.Storage[groupName] || (Terrasoft.configuration.Storage[groupName] = {});
			group[itemName] = item;
		} else {
			var key = groupName || itemName;
			Terrasoft.configuration.Storage[key] = item;
		}
	}

	function innerDeleteItem(groupName, itemName) {
		if (groupName && itemName) {
			delete Terrasoft.configuration.Storage[groupName][itemName];
		} else {
			var key = groupName || itemName;
			delete Terrasoft.configuration.Storage[key];
		}
	}

	return {
		GetESQResultByKey: getESQResultByKey,
		workRequestWithStorage: workRequestWithStorage,
		ClearStorageModes: clearStorageModes,
		clearStorage: clearStorage,
		getItem: innerGetItem,
		setItem: innerSetItem,
		deleteItem: innerDeleteItem
	};
});
