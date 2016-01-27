define("DuplicatesModuleViewModel", ["ext-base", "terrasoft", "sandbox", "DuplicatesModuleViewModelResources",
	"MaskHelper", "RightUtilities"], function(Ext, Terrasoft, sandbox, resources, MaskHelper, RightUtilities) {
	var entitySchemaName;
	var statusInterval;
	function generate(parentSandbox, name) {
		sandbox = parentSandbox;
		entitySchemaName = name;
		var viewModelConfig = {
			values: {
				page: 0,
				gridData: new Terrasoft.Collection(),
				activeRow: null,
				selectedRows: null,
				gridLoading: false,
				expandedElements: [],
				statusDescription: null,
				startButtonEnabled: false,
				stopButtonEnabled: false,
				mergeButtonEnabled: true
			},
			methods: {
				init: init,
				load: load,
				loadNext: loadNext,
				dateFormat: dateFormat,
				onStartClick: onStartClick,
				onStopClick: onStopClick,
				onScheduleClick: onScheduleClick,
				onMergeClick: onMergeClick,
				prepareStatus: prepareStatus,
				loadDuplicatesUnique: loadDuplicatesUnique,
				loadDuplicates: loadDuplicates,
				loadDuplicatesChilds: loadDuplicatesChilds,
				onLoadDuplicatesChild: onLoadDuplicatesChild,
				onLoadDuplicates: onLoadDuplicates,
				onRowsSelectionChanged: onRowsSelectionChanged,
				getGridButtonVisible: getGridButtonVisible,
				getChildRows: getChildRows,
				onActiveRowAction: onActiveRowAction,
				onExpandHierarchyLevels: onExpandHierarchyLevels,
				updateStatus: updateStatus,
				cancelClick: cancelClick
			}
		};
		return viewModelConfig;
	}

	function onExpandHierarchyLevels(parentId, isExpanded) {
		var gridData = this.get("gridData");
		var item = gridData.get(parentId);
		if (isExpanded && !Ext.isEmpty(item) && item.get("ChildsHasLoad") !== true) {
			loadDuplicatesChilds.call(this, [parentId]);
		}
	}

	function getGridButtonVisible() {
		return Ext.isEmpty(this.get("Parent"));
	}

	function checkCanMergeDuplicates(callback) {
		var func = callback;
		var scope = this;
		RightUtilities.checkCanExecuteOperation({
			operation: "CanMergeDuplicates"
		}, function(result) {
			func.call(scope, result);
		}, this);
	}

	function getChildRows(parentId) {
		var collection = [];
		var selectedRows = this.get("selectedRows");
		var gridData = this.get("gridData");
		Terrasoft.each(selectedRows, function(rowId) {
			var row = gridData.get(rowId);
			var parent = row.get("Parent");
			if (parent && parent.value === parentId) {
				var childId = row.get("Entity2").value;
				if (collection.indexOf(childId) < 0) {
					collection.push(childId);
				}
			}
		}, this);
		return collection;
	}

	function onActiveRowAction(tag, activeRow) {
		var collection = getChildRows.call(this, activeRow) || [];
		if (collection.length < 1) {
			return;
		}
		if (tag === "MergeDuplicate") {
			collection.unshift(activeRow);
			var pageId = sandbox.id + "_MergePage";
			var params = sandbox.publish("GetHistoryState");
			sandbox.publish("PushHistoryState", {hash: params.hash.historyState,
				stateObj: {
					entitySchemaName: this.entitySchemaName,
					list: collection
				}
			});
			sandbox.loadModule("MergeDuplicatesPage", {
				renderTo: this.renderTo,
				keepAlive: true,
				id: pageId
			});
		} else {
			var dataSend = {
				id: activeRow,
				duplicates: collection
			};
			callServiceMethod.call(this, "Set" + this.entitySchemaName + "AsCheckeds", function() {
				removeItemsFromGrid.call(this, collection, activeRow);
			}, dataSend);
		}
	}

	function removeItemsFromGrid(itemsToRemove, parentId) {
		var gridData = this.get("gridData");
		var selectedRows = this.get("selectedRows");
		var expandHierarchyLevels = this.get("expandHierarchyLevels");
		var items = gridData.getItems();
		var removeCollection = [];
		var childColumn = 0;
		Terrasoft.each(items, function(item) {
			var child = item.get("Entity2");
			var parent = item.get("Parent");
			if (parent && parent.value === parentId) {
				childColumn++;
				if (child && itemsToRemove.indexOf(child.value) >= 0) {
					removeCollection.push(item.get("Id"));
				}
			}
		}, this);
		if (removeCollection.length >= childColumn) {
			removeCollection.push(parentId);
		}
		Terrasoft.each(removeCollection, function(removeKey) {
			var selectIndex = selectedRows.indexOf(removeKey);
			if (selectIndex >= 0) {
				selectedRows.splice(selectIndex, 1);
			}
			var expandIndex = expandHierarchyLevels.indexOf(removeKey);
			if (expandIndex >= 0) {
				expandHierarchyLevels.splice(expandIndex, 1);
			}
			gridData.removeByKey(removeKey);
		}, this);

		this.set("selectedRows", selectedRows);
		this.set("expandHierarchyLevels", expandHierarchyLevels);
		this.onRowsSelectionChanged();
	}

	function init() {
		this.entitySchemaName = entitySchemaName;
		this.ajaxProvider = Terrasoft.AjaxProvider;
		var gridData = this.get("gridData");
		gridData.clear();
		this.set("page", 0);
		this.on("change:selectedRows", this.onRowsSelectionChanged, this);
		this.load();
	}

	function load() {
		var page = this.get("page") || 0;
		this.loadDuplicatesUnique(page * 15);
	}

	function loadNext() {
		var page = this.get("page") || 0;
		this.set("page", (page + 1));
		this.load.call(this);
	}

	function loadDuplicatesUnique(skip) {
		this.set("gridLoading", true);
		callServiceMethod.call(this, "Get" + entitySchemaName + "DuplicatesParents",
				function(responce) {
					var responseList = responce["Get" + entitySchemaName + "DuplicatesParentsResult"] || [];
					if (responseList.length > 0) {
						this.set("gridEmpty", false);
						this.loadDuplicates(responce["Get" + entitySchemaName + "DuplicatesParentsResult"]);
					} else {
						var gridData = this.get("gridData");
						if (gridData && !gridData.getCount()) {
							this.set("gridEmpty", true);
						}
						this.set("gridLoading", false);
					}
				}, { skip: skip });
	}

	function loadDuplicates(responce) {
		var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
			rootSchemaName: entitySchemaName
		});
		esq.addColumn("Name");
		if (entitySchemaName === "Account") {
			esq.addColumn("Phone");
			esq.addColumn("AdditionalPhone");
			esq.addColumn("Web");
		} else {
			esq.addColumn("MobilePhone");
			esq.addColumn("HomePhone");
			esq.addColumn("Email");
		}
		esq.filters.addItem(Terrasoft.createColumnInFilterWithParameters("Id", responce));
		esq.getEntityCollection(this.onLoadDuplicates, this);
	}

	function loadDuplicatesChilds(response) {
		var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
			rootSchemaName: "Vw" + entitySchemaName + "Duplicate"
		});
		esq.addColumn("Entity2");
		esq.addColumn("Entity2.Name", "Name");
		if (entitySchemaName === "Account") {
			esq.addColumn("Entity2.Phone", "Phone");
			esq.addColumn("Entity2.AdditionalPhone", "AdditionalPhone");
			esq.addColumn("Entity2.Web", "Web");
		} else {
			esq.addColumn("Entity2.MobilePhone", "MobilePhone");
			esq.addColumn("Entity2.HomePhone", "HomePhone");
			esq.addColumn("Entity2.Email", "Email");
		}
		esq.rowCount = 1000;
		esq.addColumn("Entity1", "Parent");
		esq.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"StatusOfDuplicate", "F19D417E-F36B-1410-918D-20CF308CCED1"));
		esq.filters.addItem(Terrasoft.createColumnInFilterWithParameters("Entity1", response));
		esq.getEntityCollection(this.onLoadDuplicatesChild, this);
	}

	function onLoadDuplicatesChild(responce) {
		this.set("gridLoading", false);
		this.onLoadDuplicates(responce, true);
	}

	function onLoadDuplicates(response, isChilds) {
		checkCanMergeDuplicates.call(this, function(result) {
			if (!Ext.isBoolean(isChilds)) {
				isChilds = false;
			}
			if (response.success) {
				var currentParentId;
				var parentList = [];
				var gridData = this.get("gridData");
				var items = (isChilds ? [] : gridData.getItems());
				var loadItems = response.collection.getItems();
				Terrasoft.each(loadItems, function(item) {
					if (!isChilds) {
						parentList.push(item.get("Id"));
					} else {
						item.set("current_Id", item.get("Id"));
						var parent = item.get("Parent");
						if (parent) {
							currentParentId = parent.value;
						}
						item.set("Id", Terrasoft.generateGUID());
					}
					item.set("HasNesting", (isChilds ? 0 : 1));
					item.getGridButtonEnabled = function() {
						var collection = this.get("childCollection") || [];
						return (collection.length > 0);
					};
					item.getGridButtonVisible = function() {
						return Ext.isEmpty(this.get("Parent")) && result;
					};
					items.push(item);
				}, this);
				var loadedCollection = prepareCollectionForLoading(items);
				if (isChilds) {
					if (!Ext.isEmpty(currentParentId)) {
						gridData.loadAll(loadedCollection, {
							mode: "child",
							target: currentParentId
						});
						var currentItems = gridData.getItems();
						var parent = gridData.get(currentParentId);
						if (parent) {
							parent.set("ChildsHasLoad", true);
						}
						gridData.clear();
						gridData.loadAll(prepareCollectionForLoading(currentItems));
					}
				} else {
					gridData.clear();
					gridData.loadAll(loadedCollection);
				}
			}
		});
		MaskHelper.HideBodyMask();
	}

	function prepareCollectionForLoading(collection) {
		var result = {};
		Terrasoft.each(collection, function(item) {
			var id = item.get("Id");
			result[id] = item;
		});
		return result;
	}

	function onStartClick() {
		this.set("startButtonEnabled", false);
		this.set("stopButtonEnabled", true);
		callServiceMethod.call(this, this.entitySchemaName + "SearchStart", function(responce) {
			this.prepareStatus(responce[this.entitySchemaName + "SearchStartResult"]);
		});
	}

	function onStopClick() {
		this.set("startButtonEnabled", true);
		this.set("stopButtonEnabled", false);
		callServiceMethod.call(this, this.entitySchemaName + "SearchStop", function(responce) {
			this.prepareStatus(responce[this.entitySchemaName + "SearchStopResult"]);
		});
	}

	function onScheduleClick() {
		var settingsPageId = sandbox.id + "_SchedulePage";
		var params = sandbox.publish("GetHistoryState");
		sandbox.publish("PushHistoryState", {hash: params.hash.historyState,
			stateObj: { entitySchemaName: this.entitySchemaName }
		});
		sandbox.loadModule("SearchDuplicatesSettingsPage", {
			renderTo: this.renderTo,
			keepAlive: true,
			id: settingsPageId
		});
	}

	function onMergeClick() {
		var gridData = this.get("gridData");
		var mergeList = [];
		var parentId = null;
		var selectedRows = this.get("selectedRows") || [];
		Terrasoft.each(selectedRows, function(id) {
			var item = gridData.get(id);
			if (item) {
				var parent = item.values.Parent;
				if (parent && parent.value) {
					parentId = parent.value;
				}
				var entity = item.values.Entity2;
				if (entity && entity.value) {
					mergeList.push(entity.value);
				}
			}
		}, this);

		var settingsPageId = sandbox.id + "_SchedulePage";
		var params = sandbox.publish("GetHistoryState");
		sandbox.publish("PushHistoryState", {hash: params.hash.historyState,
			stateObj: {
				entitySchemaName: this.entitySchemaName,
				list: mergeList,
				paretnId: parentId
			}
		});
		sandbox.loadModule("MergeDuplicatesPage", {
			renderTo: this.renderTo,
			keepAlive: true,
			id: settingsPageId
		});
	}

	function onRowsSelectionChanged() {
		var selectedRows = this.get("selectedRows") ? this.get("selectedRows") : [];
		var gridData = this.get("gridData");
		var keys = gridData.getKeys();
		Terrasoft.each(Terrasoft.deepClone(selectedRows), function(item) {
			if (keys.indexOf(item) < 0) {
				selectedRows.splice(selectedRows.indexOf(item), 1);
			}
		});
		Terrasoft.each(selectedRows, function(rowId) {
			var row = gridData.get(rowId);
			if (Ext.isEmpty(row.get("Parent"))) {
				row.set("childCollection", this.getChildRows(row.get("Id")) || []);
			}
		}, this);
	}

	function dateFormat(d, f) {
		var zf = function(value) {
			value = parseInt(value, 10);
			if (value < 10) {
				return "0" + value;
			}
			return value;
		};
		return f.replace(/(yyyy|mmmm|mmm|mm|dddd|ddd|dd|h|hh|nn|ss|a\/p)/gi,
				function($1) {
					switch ($1.toLowerCase()) {
						case "yyyy":
							return d.getFullYear();
						case "mmmm":
							return gsMonthNames[d.getMonth()];
						case "mmm":
							return gsMonthNames[d.getMonth()].substr(0, 3);
						case "mm":
							return zf(d.getMonth() + 1);
						case "dddd":
							return gsDayNames[d.getDay()];
						case "ddd":
							return gsDayNames[d.getDay()].substr(0, 3);
						case "dd":
							return zf(d.getDate());
						case "hh":
							return zf((h = d.getHours() % 12) ? h : 12);
						case "h":
							return zf(d.getHours());
						case "nn":
							return zf(d.getMinutes());
						case "ss":
							return zf(d.getSeconds());
						case "a/p":
							return d.getHours() < 12 ? "a" : "p";
					}
				}
		);
	}

	function updateStatus(firstLoad) {
		clearInterval(statusInterval);
		var container = Ext.get("duplicatesModuleContainer");
		if (Ext.isEmpty(container)) {
			return;
		}
		callServiceMethod.call(this, "Get" + this.entitySchemaName + "SearchStatus", function(responce) {
			this.prepareStatus(responce["Get" + this.entitySchemaName + "SearchStatusResult"], firstLoad);
		});
	}

	function prepareStatus(stats, firstLoad) {
		clearInterval(statusInterval);
		this.set("startButtonEnabled", (stats.Code !== "InProgress"));
		this.set("stopButtonEnabled", (stats.Code === "InProgress"));
		var date = null;
		if (stats.ChangeOn && stats.ChangeOn.length > 25) {
			var dateSource = stats.ChangeOn;
			date = new Date(parseInt(dateSource.substr(6, 13), 10));
		}
		var localizableStrings = resources.localizableStrings;
		var message = null;
		var mask;
		switch (stats.Code) {
			case "InProgress":
				mask = localizableStrings.StatusInProgressMask;
				message = Ext.String.format(mask, stats.Percent);
				var scope = this;
				statusInterval = setInterval(function() {
					scope.updateStatus.call(scope);
				}, 30000);
				break;
			case "Finished":
				mask = localizableStrings.StatusFinishedMask;
				message = Ext.String.format(mask, this.dateFormat(date, "dd.mm.yyyy"),
						this.dateFormat(date, "h:nn"));
				if (!firstLoad) {
					this.load();
				}
				break;
			case "Suspended":
				mask = localizableStrings.StatusSuspendedMask;
				message = Ext.String.format(mask, stats.Percent,
						this.dateFormat(date, "dd.mm.yyyy"), this.dateFormat(date, "h:nn"));
				break;
			default:
				mask = localizableStrings.StatusNeverMask;
				var modelName = localizableStrings["StatusNever" + this.entitySchemaName];
				message = Ext.String.format(mask, modelName);
				break;
		}
		this.set("statusDescription", message);
	}

	function callServiceMethod(methodName, callback, dataSend) {
		var data = dataSend || {};
		var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/SearchDuplicatesService/" + methodName;
		var request = this.ajaxProvider.request({
			url: requestUrl,
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			method: "POST",
			jsonData: data,
			callback: function(request, success, response) {
				var responseObject = {};
				if (success) {
					responseObject = Terrasoft.decode(response.responseText);
				}
				callback.call(this, responseObject);
			},
			scope: this
		});
		return request;
	}

	function cancelClick() {
		sandbox.publish("BackHistoryState");
	}

	return {
		generate: generate
	};
});