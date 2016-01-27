define("ExtendedFilterEditModelV2", ["ext-base", "terrasoft", "ExtendedFilterEditModelV2Resources"],
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
					renderTo: renderTo,
					activeFolder: null
				},
				methods: {
					initActionFired: function() {
						var me = this;
						sandbox.subscribe("FilterActionsFired", function(key) {
							switch (key) {
								case "group":
									me.groupItems();
									break;
								case "ungroup":
									me.unGroupItems();
									break;
								case "up":
									me.moveUp();
									break;
								case "down":
									me.moveDown();
									break;
							}
						});
					},
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
					onGoBackToFolders: function() {
						var sandbox = this.get("sandbox");
						sandbox.publish("ShowFolderTree", null, [sandbox.id]);
					},
					saveButton: function() {
						this.applyButton(true);
						this.onGoBackToFolders();
					},
					applyButton: function(saveFolder) {
						var filterManager = this.get("FilterManager");
						var sandbox = this.get("sandbox");
						if (saveFolder) {
							var folder = this.get("activeFolder");
							if (folder) {
								folder.saveLookupFolder(filterManager.serializeFilters(), function() {});
							}
						}
						sandbox.publish("ApplyResultExtendedFilter", {
							folderEditMode: this.isFolderEditMode(),
							filter: filterManager.filters,
							serializedFilter: filterManager.serializeFilters()
						}, [sandbox.id]);
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
						this.fireEnableChanged();
					},
					fireEnableChanged: function() {
						var enableConfig = {
							groupBtnState: this.get("groupButtonVisible"),
							unGroupBtnState: this.get("unGroupButtonVisible"),
							moveUpBtnState: this.get("moveUpButtonVisible"),
							moveDownBtnState: this.get("moveDownButtonVisible")
						};
						sandbox.publish("FilterActionsEnabledChanged", enableConfig);
					},
					closeExtendedFilter: function() {
						var folderConfig = null;
						if (this.isFolderEditMode()) {
							var folder = this.get("activeFolder");
							folderConfig = {
								value: folder.get("Id"),
								displayValue: folder.get("Name"),
								filter: folder.get("SearchData"),
								folder: folder,
								folderType: folder.get("FolderType")
							};
						}
						var sectionFilterModuleId = sandbox.publish("GetSectionFilterModuleId");
						sandbox.publish("CustomFilterExtendedModeClose", folderConfig, [sectionFilterModuleId]);
					},
					getExtendedFilterCaption: function() {
						return this.get("currentFolderName") ||
							resources.localizableStrings.ExtendedFilterModeCaption;
					},
					getExtendedFolderCaption: function() {
						var folder = this.get("activeFolder");
						return folder ? folder.get("Name") : "";
					},
					isFolderEditMode: function() {
						return this.get("activeFolder") != null;
					}
				}
			};
			return model;
		}

		return {
			generateModel: generateModel
		};
	});