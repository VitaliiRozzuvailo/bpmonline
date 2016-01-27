define('QuickFilterViewModel', ['ext-base', 'terrasoft', 'FixedFilterViewModel',
	'FolderFilterViewModel', 'CustomFilterViewModel', 'QuickFilterViewModelResources'],
	function(Ext, Terrasoft, FixedFilterViewModel, FolderFilterViewModel, CustomFilterViewModel, resources) {

		var info;
		function generate(config, currentInfo) {
			info = currentInfo;
			var viewModelConfig = {
				quickFilterViewModelConfig: {
					values: {
					},
					methods: {
						getFilters: getFilters,
						getFilterValue: getFilterValue,
						addFilterValue: addFilterValue
					}
				}
			};
			if (config.fixedFilterConfig && config.hasBaseFixedFilters) {
				viewModelConfig.fixedFilterViewModelConfig = FixedFilterViewModel.generate(config.fixedFilterConfig);
				viewModelConfig.fixedFilterViewModelConfig.methods.getFilterState = config.getFilterState;
				viewModelConfig.fixedFilterViewModelConfig.methods.filterChanged = config.filterChanged;
			}
			if (config.folderFilterConfig && (!info || !info.hideFolderFilter)) {
				viewModelConfig.folderFilterViewModelConfig = FolderFilterViewModel.generate(config.folderFilterConfig);
				viewModelConfig.folderFilterViewModelConfig.methods.getFilterState = config.getFilterState;
				viewModelConfig.folderFilterViewModelConfig.methods.filterChanged = config.filterChanged;
			}
			if (config.customFilterConfig && (!info || !info.hideCustomFilter)) {
				viewModelConfig.customFilterViewModelConfig = CustomFilterViewModel.generate(config.customFilterConfig);
				viewModelConfig.customFilterViewModelConfig.methods.getFilterState = config.getFilterState;
				viewModelConfig.customFilterViewModelConfig.methods.filterChanged = config.filterChanged;
			}
			return viewModelConfig;
		}

		function getFilters() {

			var filtersCollection = Terrasoft.createFilterGroup();
			filtersCollection.logicalOperation = Terrasoft.LogicalOperatorType.AND;

			if (this.filterModulesMap) {
				Terrasoft.each(this.filterModulesMap, function(item, index) {
					var filterViewModel = item.viewModel;
					if (index && filterViewModel && filterViewModel.getFilters) {
						var filter = filterViewModel.getFilters.call(filterViewModel);
						if (filter) {
							filtersCollection.add(index + 'Filters', filter);
						}
					}
				}, this);
			}

			if (this.fixedFilterViewModel) {
				var fixedFilterCollection = this.fixedFilterViewModel.getFilters();
				if (fixedFilterCollection.collection.length > 0) {
					filtersCollection.add('FixedFilters', fixedFilterCollection);
				}
			}
			if (this.folderFilterViewModel && (!info || !info.hideFolderFilter)) {
				var folderFilterCollection = this.folderFilterViewModel.getFilters();
				if (folderFilterCollection.collection.length > 0) {
					filtersCollection.add('FolderFilters', folderFilterCollection);
				}
			}
			if (this.customFilterViewModel && (!info || !info.hideCustomFilter)) {
				var customFilterCollection = this.customFilterViewModel.getFilters();
				if (customFilterCollection.collection.length > 0) {
					filtersCollection.add('CustomFilters', customFilterCollection);
				}
			}
			return filtersCollection;
		}

		function getFilterValue(filterType, filterName) {
			switch (filterType) {
				case 'Fixed':
					if (this.fixedFilterViewModel) {
						return this.fixedFilterViewModel.getFilterValue(filterName);
					}
					break;
				case 'Folder':
					if (this.folderFilterViewModel) {
						return this.folderFilterViewModel.getFilterValue();
					}
					break;
				case 'Custom':
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
				case 'Fixed':
					if (this.fixedFilterViewModel) {
						return this.fixedFilterViewModel.addFilterValue(filterName, filterValue);
					}
					break;
				case 'Folder':
					if (this.folderFilterViewModel) {
						return this.folderFilterViewModel.addFilterValue(filterValue);
					}
					break;
				case 'Custom':
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