define("LocalDuplicateSearchPageViewModel", ["ext-base", "terrasoft", "sandbox",
		"LocalDuplicateSearchPageViewModelResources"], function(Ext, Terrasoft, sandbox, resources) {
	var entitySchemaName;

	function generate(parentSandbox, name) {
		sandbox = parentSandbox;
		entitySchemaName = name;
		return {
			values: {
				checks: [],
				isNotDuplicate: null,
				gridData: Ext.create("Terrasoft.BaseViewModelCollection"),
				activeRow: null
			},
			methods: {
				load: load,
				okClick: okClick,
				cancelClick: cancelClick,
				getHeader: getHeader,
				onDuplicatesIdLoad: onDuplicatesIdLoad,
				onActiveRowAction: onActiveRowAction,
				getGridButtonsVisible: getGridButtonsVisible
			}
		};
	}

	function getGridButtonsVisible() {
		return true;
	}

	function onActiveRowAction(tag) {
		var isChecked = (tag === "IsNotDuplicate");
		var activeRow = this.get("activeRow");
		var gridData = this.get("gridData");
		if (activeRow && gridData) {
			var item = gridData.get(activeRow);
			item.set("isChecked", isChecked);
			var itemView = Ext.get("duplicateGrid-item-" + activeRow);
			if (isChecked) {
				itemView.addCls("no-duplicate");
			} else {
				itemView.removeCls("no-duplicate");
			}
		}
	}

	function load(state) {
		this.ajaxProvider = Terrasoft.AjaxProvider;
		this.dataSend = state.dataSend;
		this.state = state;
		this.set("DescriptionCaption", "");
		if (Ext.isArray(this.state.list)) {
			this.onDuplicatesIdLoad(this.state.list);
		} else {
			callServiceMethod.call(this, this.ajaxProvider, "Find" + entitySchemaName + "Duplicates",
				function(response) {
					this.onDuplicatesIdLoad(response["Find" + entitySchemaName + "DuplicatesResult"]);
				}, state.dataSend);
		}
		sandbox.publish("ChangeHeaderCaption", {
			caption: this.getHeader(),
			dataViews: Ext.create("Terrasoft.Collection")
		});
	}

	function onDuplicatesIdLoad(resultCollection) {
		if (resultCollection && resultCollection.length) {
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: entitySchemaName});
			var additionalColumns = [];
			if (entitySchemaName === "Account") {
				additionalColumns = ["Phone", "AdditionalPhone", "Web"];
			} else {
				additionalColumns = ["MobilePhone", "HomePhone", "Email"];
			}
			esq.addColumn("Id");
			esq.addColumn("Name");
			esq.addColumn("Owner");
			Terrasoft.each(additionalColumns, function(column) {
				esq.addColumn(column);
			}, this);
			esq.filters.addItem(Terrasoft.createColumnInFilterWithParameters("Id", resultCollection));
			esq.getEntityCollection(function(response) {
				if (response.success) {
					var foundItemsCount = resultCollection.length;
					var availableItems = response.collection;
					var availableItemsCount = availableItems.getCount();
					var duplicateRecordsMessageTemplate = resources.localizableStrings.DuplicateRecordsMessageTemplate;
					var mainMessage = Ext.String.format(duplicateRecordsMessageTemplate, foundItemsCount);
					if (foundItemsCount === availableItemsCount) {
						this.set("DescriptionCaption", mainMessage);
					} else if (foundItemsCount > availableItemsCount) {
						var addititionalMessage = resources.localizableStrings.NotEnoughAccessMessage;
						this.set("DescriptionCaption", Ext.String.format("{0} {1}", mainMessage, addititionalMessage));
					}
					var collection = this.get("gridData");
					availableItems.each(function(item) {
						item.getGridButtonIsNotDuplicateVisible = function() {
							var isChecked = this.get("isChecked") || false;
							return !isChecked;
						};
						item.getGridButtonIsDuplicateVisible = function() {
							var isChecked = this.get("isChecked") || false;
							return isChecked;
						};
					}, this);
					collection.loadAll(availableItems);
				}
			}, this);
		}
	}

	function okClick() {
		var collection = [];
		var gridData = this.get("gridData");
		Terrasoft.each(gridData.getItems(), function(item) {
			var isChecked = item.get("isChecked") || false;
			if (isChecked) {
				collection.push(item.get("Id"));
			}
		}, this);
		var isNotDuplicate = (collection.length > 0);
		sandbox.publish("FindDuplicatesResult", {
			isNotDuplicate: isNotDuplicate,
			collection: collection,
			config: this.dataSend
		}, [this.state.cardSandBoxId]);
		cancelClick();
	}

	function cancelClick() {
		sandbox.publish("BackHistoryState");
	}

	function getHeader() {
		return Ext.String.format(resources.localizableStrings.PageHeaderMask,
			resources.localizableStrings["PageHeader" + entitySchemaName]);
	}

	function callServiceMethod(ajaxProvider, methodName, callback, dataSend) {
		var data = dataSend || {};
		var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/SearchDuplicatesService/" + methodName;
		var request = ajaxProvider.request({
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

	return {
		generate: generate
	};
});