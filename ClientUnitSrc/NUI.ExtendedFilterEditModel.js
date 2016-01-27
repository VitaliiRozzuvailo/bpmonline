define("ExtendedFilterEditModel", ["ext-base", "terrasoft", "ExtendedFilterEditModelResources"],
	function(Ext, Terrasoft, resources) {

		function generateModel(sandbox, renderTo) {
			var model = {
				values: {
					FilterManager: null,
					SelectedFilters: null,
					EntitySchemaName: null,
					groupButtonVisible: false,
					unGroupButtonVisible: false,
					moveUpButtonVisible: false,
					moveDownButtonVisible: false,
					isHeaderVisible: true,
					currentFolderName: "",
					sandbox: sandbox,
					renderTo: renderTo
				},
				methods: {
					getFiltersArray: function() {
						var selectedItems = this.get("SelectedFilters");
						var filtersArray = [];
						Terrasoft.each(selectedItems, function(item) {
							filtersArray.push(item);
						});
						return filtersArray;
					},
					getFilter: function() {
						var selectedItems = this.get("SelectedFilters");
						var filtersArray = [];
						Terrasoft.each(selectedItems, function(item) {
							filtersArray.push(item);
						});
						return (filtersArray.length > 0) ? filtersArray[0] : null;
					},
					groupItems: function() {
						var filterManager = this.get("FilterManager");
						filterManager.groupFilters(this.getFiltersArray());
						this.onSelectedFilterChange();
					},
					unGroupItems: function() {
						var filterManager = this.get("FilterManager");
						filterManager.unGroupFilters(this.getFilter());
						this.onSelectedFilterChange();
					},
					moveUp: function() {
						var filterManager = this.get("FilterManager");
						filterManager.moveUp(this.getFilter());
						this.onSelectedFilterChange();
					},
					moveDown: function() {
						var filterManager = this.get("FilterManager");
						filterManager.moveDown(this.getFilter());
						this.onSelectedFilterChange();
					},
					saveButton: function() {
						var filterManager = this.get("FilterManager");
						var sandbox = this.get("sandbox");
						sandbox.publish("ResultExtendedFilter", {
							filter: filterManager.filters,
							serializedFilter: filterManager.serializeFilters()
						}, [sandbox.id]);
						sandbox.publish("BackHistoryState");
					},
					applyButton: function() {
						this.get("sandbox").publish("BackHistoryState");
					},
					actionsButtonVisible: function() {
						return this.get("groupButtonVisible") || this.get("unGroupButtonVisible") ||
							this.get("moveUpButtonVisible") || this.get("moveDownButtonVisible");
					},
					onSelectedFilterChange: function() {
						var filter = this.getFilter();
						var rootFilter = this.get("FilterManager").filters;
						var notRootFilter = !Ext.isEmpty(filter) && (filter !== rootFilter);
						var notFirstFilter = rootFilter.indexOf(filter) !== 0;
						var notLastFilter = rootFilter.indexOf(filter) !== (rootFilter.getCount() - 1);
						this.set("groupButtonVisible", notRootFilter);
						this.set("unGroupButtonVisible", notRootFilter &&
							(filter.$className === "Terrasoft.data.filters.FilterGroup"));
						this.set("moveUpButtonVisible", notRootFilter && notFirstFilter);
						this.set("moveDownButtonVisible", notRootFilter && notLastFilter);
					},
					closeExtendedFilter: function() {
						var container = this.get("renderTo");
						if (!Ext.isEmpty(container)) {
							container.setDisplayed(false);
						}
					},
					getExtendedFilterCaption: function() {
						return this.get("currentFolderName") ||
							resources.localizableStrings.ExtendedFilterModeCaption;
					}
				}
			};
			return model;
		}

		return {
			generateModel: generateModel
		};
	});