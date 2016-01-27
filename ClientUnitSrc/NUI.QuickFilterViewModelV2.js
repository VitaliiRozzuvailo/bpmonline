define("QuickFilterViewModelV2", ["ext-base", "terrasoft", "FixedFilterViewModelV2",
	"FolderFilterViewModelV2", "CustomFilterViewModelV2", "QuickFilterViewModelV2Resources"],
	function(Ext, Terrasoft, FixedFilterViewModel, FolderFilterViewModel, CustomFilterViewModel) {

		function generate(config) {
			var viewModelConfig = {
				quickFilterViewModelConfig: {
					values: {
					},
					methods: {
						getFilters: getFilters,
						clearQuickFilters: clearQuickFilters,
						clearFolderFilters: clearFolderFilters,
						getFilterValue: getFilterValue,
						addFilterValue: addFilterValue
					}
				}
			};
			if (config.fixedFilterConfig) {
				viewModelConfig.fixedFilterViewModelConfig = FixedFilterViewModel.generate(config.fixedFilterConfig);
				viewModelConfig.fixedFilterViewModelConfig.methods.getFilterState = function() {
					return this.get("Filters");
				};
			}
			if (config.folderFilterConfig) {
				viewModelConfig.folderFilterViewModelConfig = FolderFilterViewModel.generate(config.folderFilterConfig);
				viewModelConfig.folderFilterViewModelConfig.methods.getFilterState = function() {
					return this.get("Filters");
				};
			}
			if (config.customFilterConfig) {
				viewModelConfig.customFilterViewModelConfig = CustomFilterViewModel.generate(config.customFilterConfig);
				var customFilterViewModelConfig = viewModelConfig.customFilterViewModelConfig;
				customFilterViewModelConfig.methods.getFilterState = function() {
					return this.get("Filters");
				};
			}
			return viewModelConfig;
		}

		function getFilters() {
			var filtersCollection = Terrasoft.createFilterGroup();
			filtersCollection.logicalOperation = Terrasoft.LogicalOperatorType.AND;
			if (this.fixedFilterViewModel) {
				var fixedFilterCollection = this.fixedFilterViewModel.getFilters();
				if (fixedFilterCollection.collection.length > 0) {
					filtersCollection.add("FixedFilters", fixedFilterCollection);
				}
			}
			if (this.folderFilterViewModel) {
				var folderFilterCollection = this.folderFilterViewModel.getFilters();
				if (folderFilterCollection.collection.length > 0) {
					filtersCollection.add("FolderFilters", folderFilterCollection);
				}
			}
			if (this.customFilterViewModel) {
				var customFilterCollection = this.customFilterViewModel.getFilters();
				if (customFilterCollection.collection.length > 0) {
					filtersCollection.add("CustomFilters", customFilterCollection);
				}
			}
			return filtersCollection;
		}

		function clearQuickFilters(filter) {
			if (this.customFilterViewModel) {
				//this.customFilterViewModel.clearConditions();
				this.customFilterViewModel.addExtendFilterValue(filter, true);
			}
		}

		function clearFolderFilters(filter) {
			if (this.folderFilterViewModel) {
				this.folderFilterViewModel.clearConditions();
				if (filter) {
					this.folderFilterViewModel.addSingleFilterValue(filter);
				}
				this.folderFilterViewModel.filterChanged();
			}
		}

		function getFilterValue(filterType, filterName) {
			switch (filterType) {
				case "Fixed":
					if (this.fixedFilterViewModel) {
						return this.fixedFilterViewModel.getFilterValue(filterName);
					}
					break;
				case "Folder":
					if (this.folderFilterViewModel) {
						return this.folderFilterViewModel.getFilterValue();
					}
					break;
				case "Custom":
					if (this.customFilterViewModel) {
						return this.customFilterViewModel.getFilterValue(filterName);
					}
					break;
				default:
					break;
			}
		}

		function addFilterValue(filterType, filterName, filterValue) {
			switch (filterType) {
				case "Fixed":
					if (this.fixedFilterViewModel) {
						return this.fixedFilterViewModel.addFilterValue(filterName, filterValue);
					}
					break;
				case "Folder":
					if (this.folderFilterViewModel) {
						return this.folderFilterViewModel.addFilterValue(filterValue);
					}
					break;
				case "Custom":
					if (this.customFilterViewModel) {
						return this.customFilterViewModel.addFilterValue(filterName, filterValue);
					}
					break;
				default:
					break;
			}
		}

		return {
			generate: generate
		};
	});