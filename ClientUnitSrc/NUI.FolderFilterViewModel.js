define('FolderFilterViewModel', ['ext-base', 'sandbox', 'terrasoft', 'FolderFilterViewModelResources'],
	function(Ext, sandbox, Terrasoft, resources) {

		function generate(schema) {
			var viewModelConfig = {
				entitySchema: schema.entitySchema,
				config: schema,
				columns: {
					buttonCaption: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: 'buttonCaption'
					},
					folderFilterColumn: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: 'folderFilterColumn',
						isLookup: true,
						referenceSchemaName: schema.folderEntitySchema.name
					},
					folderFilterColumnList: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: 'folderFilterColumnList',
						isCollection: true
					}
				},
				values: {
					filters: new Terrasoft.Collection(),
					filtersViews: new Terrasoft.Collection(),
					currentFilterName: null,
					folderFilterColumnList: new Terrasoft.Collection(),
					buttonCaption: resources.localizableStrings.FoldersCaption,
					folderEntitySchema: schema.folderEntitySchema,
					inFolderEntitySchema: schema.inFolderEntitySchema
				},
				methods: {
					getFilters: getFilters,
					subscribeForCollectionEvent: subscribeForCollectionEvent,
					updateButtonCaption: updateButtonCaption,
					loadFilterViews: loadFilterViews,
					addFilterView: addFilterView,
					removeFilterView: removeFilterView,
					clearFilterViews: clearFilterViews,
					generateFilterViewModelConfig: generateFilterViewModelConfig,
					getFiltersInfo: getFiltersInfo,
					getFilterValue: getFilterValue,
					updateFiltersByObjectPath: schema.updateFiltersByObjectPath,
					addFilterValue: addFilterValue,
					addSingleFilterValue: addSingleFilterValue,
					initialize: initialize,
					//TODO удалить когда будет реализован выбор из справочника
					selectFolder: addFilter,
					editFilter: editFilter,
					applyFolderFilter: applySimpleFilter,
					clearSimpleFilterProperties: clearSimpleFilterProperties
				}
			};

			var folderColumnName;
			if (schema.inFolderEntitySchema) {
				var entityColumnName;
				var entityColumnNameByName;
				Terrasoft.each(schema.inFolderEntitySchema.columns, function(schemaColumn) {
					if (!folderColumnName && schemaColumn.referenceSchemaName ===
						schema.folderEntitySchema.name) {
						folderColumnName = schemaColumn.name;
					} else if (!entityColumnNameByName && schemaColumn.name === schema.entitySchema.name &&
						schemaColumn.referenceSchemaName === schema.entitySchema.name) {
						entityColumnNameByName = schemaColumn.name;
					}
					else if (!entityColumnName && schemaColumn.referenceSchemaName ===
						schema.entitySchema.name) {
						entityColumnName = schemaColumn.name;
					}
				}, this);
				if (entityColumnNameByName) {
					entityColumnName = entityColumnNameByName;
				}
				viewModelConfig.values.staticFolderLeftExpression = '[' + schema.inFolderEntitySchema.name + ':' +
					entityColumnName + '].' + folderColumnName;

			}
			else {
				Terrasoft.each(schema.entitySchema.columns, function(schemaColumn) {
					if (!folderColumnName && schemaColumn.referenceSchemaName ===
						schema.folderEntitySchema.name) {
						folderColumnName = schemaColumn.name;
					}
				}, this);
				viewModelConfig.values.singleFolderMode = true;
				viewModelConfig.values.staticFolderLeftExpression = folderColumnName;
			}
			return viewModelConfig;
		}

		function generateFilterViewModelConfig() {
			return {
				columns: {
					displayValue: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: 'displayValue'
					},
					filterName: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: 'filterName'
					}
				},
				values: {
					filter: null,
					value: null,
					view: null
				},
				methods: {
				}
			};
		}

		function getFilters() {
			var filters = this.get('filters');
			var filterCollection = Terrasoft.createFilterGroup();
			filterCollection.logicalOperation = Terrasoft.LogicalOperatorType.OR;
			var filterValues = [];
			filters.each(function(filterInfo) {
				var filter = filterInfo.get('filter');
				if (filter) {
					filterCollection.add(filterInfo.get('filterName'), Terrasoft.deserialize(filter));
				}
				else {
					filterValues.push(filterInfo.get('value'));
				}
			});
			if (filterValues.length > 0) {
				filterCollection.add(this.get('staticFoldersFilter'), Terrasoft.createColumnInFilterWithParameters(
					this.get('staticFolderLeftExpression'), filterValues));
			}
			if (this.updateFiltersByObjectPath) {
				this.updateFiltersByObjectPath(filterCollection, this.entitySchema.name,
						this.updateFiltersByObjectPath);
			}
			return filterCollection;
		}

		function getFiltersInfo() {
			var filters = this.get('filters');
			var filterValues = new Terrasoft.Collection();
			filters.each(function(filterInfo) {
				var value = filterInfo.get('value');
				if (!filterInfo.get('folderType') && Terrasoft.isGUID(value)) {
					filterValues.add(value, filterInfo.get('filterName'));
				}
			});
			if (filterValues.getCount() > 0) {
				this.blobLoading = true;
				var folderEntitySchema = this.get('folderEntitySchema');
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchema: folderEntitySchema
				});
				select.addColumn(folderEntitySchema.primaryColumnName);
				select.addColumn('FolderType.Id', 'FolderTypeId');
				select.addColumn('SearchData', 'SearchData');
				select.filters.add('PrimaryColumnFilter', select.createColumnInFilterWithParameters(
					folderEntitySchema.primaryColumnName, filterValues.getKeys()));

				select.getEntityCollection(function(response) {
					if (response.success) {
						response.collection.each(function(item) {
							var folderId = item.get(folderEntitySchema.primaryColumnName);
							var filterName = filterValues.get(folderId);
							var folderFilter = filters.get(filterName);
							folderFilter.set('folderType', item.get('FolderTypeId'));
							folderFilter.set('filter', item.get('SearchData'));
						});
					}
					this.blobLoading = false;
					this.filterChanged();
				}, this);
			}
		}

		function subscribeForCollectionEvent() {
			var filters = this.get('filters');
			filters.on('dataLoaded', this.loadFilterViews, this);
			filters.on('add', this.addFilterView, this);
			filters.on('remove', this.removeFilterView, this);
			filters.on('clear', this.clearFilterViews, this);
		}

		function loadFilterViews() {
			var filtersViews = this.get('filtersViews');
			var filters = this.get('filters');
			filters.each(function(filterViewModel) {
				filtersViews.add(filterViewModel.get('filterName'), filterViewModel.get('view'));
			});
			this.updateButtonCaption();
		}

		function addFilterView(filterViewModel) {
			var filtersViews = this.get('filtersViews');
			filtersViews.add(filterViewModel.get('filterName'), filterViewModel.get('view'));
			this.updateButtonCaption();
		}

		function removeFilterView(filterViewModel) {
			var filtersViews = this.get('filtersViews');
			var view = filtersViews.removeByKey(filterViewModel.get('filterName'));
			view.destroy();
			this.updateButtonCaption();
		}

		function clearFilterViews() {
			var filtersViews = this.get('filtersViews');
			filtersViews.each(function(view) {
				view.destroy();
			});
			filtersViews.clear();
			this.updateButtonCaption();
		}

		function updateButtonCaption() {
			var filters = this.get('filters');
			if (filters.collection.length > 0) {
				this.set('buttonCaption', '');
			} else {
				this.set('buttonCaption', resources.localizableStrings.FoldersCaption);
			}
		}

		function addSingleFilterValue(filterValue) {
			var filters = this.get('filters');
			var filterName = 'folderFilter' + filterValue.value.replace('-', '');
			if (!this.get('inFolderEntitySchema')) {
				filters.clear();
			}
			else {
				var oldFilterName = this.get('currentFilterName');
				if (oldFilterName && filterName !== oldFilterName) {
					filters.removeByKey(oldFilterName);
				}
			}
			var simpleFilter = filters.find(filterName);
			if (!simpleFilter) {
				var config = this.generateFilterViewModelConfig();
				simpleFilter = this.getFilterViewModel(filterName, config);
				simpleFilter.set('filterName', filterName);
				simpleFilter.set('value', filterValue.value);
				simpleFilter.set('displayValue', filterValue.displayValue);
				simpleFilter.set('filter', filterValue.filter);
				simpleFilter.set('folderType', filterValue.folderType);
				filters.add(filterName, simpleFilter);
				this.filterChanged();
			}
			else {
				simpleFilter.set('value', filterValue.value);
				simpleFilter.set('displayValue', filterValue.displayValue);
				this.filterChanged();
			}
		}

		function addFilterValue(filterValues) {
			if (Ext.isArray(filterValues)) {
				Terrasoft.each(filterValues, function(currentValue) {
					this.addSingleFilterValue(currentValue);
				}, this);
			}
			else {
				this.addSingleFilterValue(filterValues);
			}
		}

		//TODO удалить когда будет доступен выбор из справочника
		function addFilter() {
			this.folderSelecting();
			//this.showFolderFilterEdit();
		}

		function editFilter(tag) {
			var filters = this.get('filters');
			var value;
			var filterViewModel = filters.find(tag);
			if (filterViewModel) {
				value = filterViewModel.get('value');
			}
			this.folderSelecting(value);
//			var filters = this.get('filters');
//			var filterViewModel = filters.find(tag);
//			if (filterViewModel) {
//				var value = {
//					value: filterViewModel.get('value'),
//					displayValue: filterViewModel.get('displayValue'),
//					filter: filterViewModel.get('filter')
//				};
//				this.set('currentFilterName', tag);
//				this.set('folderFilterColumn', value);
//				this.showFolderFilterEdit();
//			}
		}

		function applySimpleFilter() {
			var simpleFilterColumn = this.get('folderFilterColumn');
			if (simpleFilterColumn) {
				this.addSingleFilterValue(simpleFilterColumn);
			}
			this.destroySimpleFilterAddingContainer();
		}

		function clearSimpleFilterProperties() {
			this.set('folderFilterColumn', null);
			this.set('currentFilterName', null);
		}

		function getFilterValue() {
            var filters = this.get('filters');
			var sectionEntityScheamName = this.entitySchema.name;
            var filterValues = [];
			filters.each(function(filterInfo) {
				var value = filterInfo.get('value');
				if (Terrasoft.isGUID(value)) {
					var displayValue = filterInfo.get('displayValue');
					var filter = filterInfo.get('filter');
					var folderType = filterInfo.get('folderType');
					filterValues.push({
						value: value,
						displayValue: displayValue,
						filter: filter,
						folderType: folderType,
                        sectionEntityScheamName: sectionEntityScheamName
					});
				}
			});
			return filterValues;
		}

		function initialize() {
			this.suspendUpdate = true;
			var selectedFiltersInfo = this.getAddedFolderFilters();
			var filterState = this.getFilterState('Folder');
			var filterCollection = new Terrasoft.Collection();
			if (filterState) {
				Terrasoft.each(filterState, function(val) {
					if (val.value !== selectedFiltersInfo.currentFolderFilterValue) {
						filterCollection.add(val.value, val);
					}
				}, this);
			}
			if (selectedFiltersInfo.selectedFolderFilters) {
				if (!selectedFiltersInfo.currentFolderFilterValue) {
					filterCollection.clear();
				}
				Terrasoft.each(selectedFiltersInfo.selectedFolderFilters, function(val) {
					if (filterCollection.contains(val.value)) {
						filterCollection.removeByKey(val.value);
					}
					filterCollection.add(val.value, val);
				}, this);
			}
			var filters = filterCollection.getItems();
			if (filters) {
				this.addFilterValue(filters);
			}
			this.getFiltersInfo();
			this.suspendUpdate = false;
		}

		return {
			generate: generate
		};

	});