define('FolderLookupPageViewModel', ['ext-base', 'terrasoft', 'FolderLookupPageViewModelResources',
		'ConfigurationConstants'], function(Ext, Terrasoft, resources, ConfigurationConstants) {

	function generate(config) {
		var viewModelConfig = {
			entitySchema: config.entitySchema,
			columns: {
				enableMultiSelect: {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					name: 'enableMultiSelect'
				},
				multiSelect: {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					name: 'multiSelect'
				},
				simpleSelectMode: {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					name: 'simpleSelectMode'
				},
				folderInfoVisible: {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					name: 'folderInfoVisible'
				}
			},
			values: {
				gridData: new Terrasoft.Collection(),
				multiSelect: config.multiSelect,
				currentFilter: config.currentFilter,
				enableMultiSelect: config.enableMultiSelect,
				simpleSelectMode: false,
				selectedRows: config.selectedFolders,
				activeRow: config.currentFilter,
				folderInfoVisible: false,
				canRename: config.currentFilter ? true : false,
				selectEnabled: config.currentFilter || config.multiSelect,
				expandHierarchyLevels: [],
				administratedButtonVisible: config.entitySchema.administratedByRecords && !config.multiSelect
			},
			methods: {
				cancelButton: cancelButton,
				changeMultiSelectMode: changeMultiSelectMode,
				clear: clear,
				dblClickGrid: dblClickGrid,
				deleteButton: deleteButton,
				load: load,
				loadNext: loadNext,
				moveFolder: moveFolder,
				onActiveRowChanged: showFolderInfo,
				onDeleted: onDeleted,
				selectButton: selectButton,
				showFolderInfo: showFolderInfo,
				expandToSelectedItems: expandToSelectedItems
			}
		};
		return viewModelConfig;
	}

	function loadNext() {
		this.pageNumber++;
		this.load();
	}

	function load(setExpandedLevels, callback, scope) {
		if (!this.pageNumber) {
			this.pageNumber = 0;
		}
		if (!this.pageRowsCount) {
			this.pageRowsCount = 15;
		}
		scope = scope || this;
		var pageNumber = this.pageNumber;
		var pageRowsCount = this.pageRowsCount;
		var select = Ext.create('Terrasoft.EntitySchemaQuery', {
			rootSchema: this.entitySchema
		});
		select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, 'Id');
		var column = select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, 'Name');
		column.orderDirection = Terrasoft.OrderDirection.ASC;
		column.orderPosition = 0;
		select.addColumn('Parent');
		select.addColumn('FolderType');
		select.skipRowCount = pageNumber * pageRowsCount;
		select.rowCount = -1;
		if (this.get('simpleSelectMode')) {
			var moveFilter = Terrasoft.createColumnInFilterWithParameters(this.entitySchema.primaryColumnName,
				this.get('currentFolders'));
			moveFilter.comparisonType = Terrasoft.ComparisonType.NOT_EQUAL;
			select.filters.add('MoveFilter', moveFilter);
		}
		select.getEntityCollection(function(response) {
			if (response.success) {
				var items = {};
				var simpleSelectMode = this.get('simpleSelectMode');
				response.collection.each(function(item) {
					if (simpleSelectMode && !item.get('Parent')) {
						item.set('Parent', this.topLevelRecordItem);
					}
					items[item.get('Id')] = item;
				}, this);
				if (simpleSelectMode) {
					var rowConfig = select.getViewModelRowConfig(response.collection.rowConfig);
					var item = this.getTopLevelRecord(rowConfig);
					items[item.get('Id')] = item;
					this.set('expandHierarchyLevels', [item.get('Id')]);
				}  else if (setExpandedLevels) {
					var selectedRows = this.get('currentFolders');
					if (Ext.isEmpty(selectedRows)) {
						var currentFilter = this.get('activeRow');
						selectedRows = currentFilter ? [currentFilter] : this.get('selectedRows');
					}
					this.expandToSelectedItems(selectedRows);
				}
				var collection = this.get('gridData');
				collection.clear();
				collection.loadAll(items);
				if (Ext.isFunction(callback)) {
					callback.call(scope);
				}
			}
		}, this);
	}
	function expandToSelectedItems(selectedRows) {
		var expandLevels = [];
		var items = this.get('gridData');
		if (selectedRows) {
			Terrasoft.each(selectedRows, function(selectedRow) {
				fillExpandedLevels(selectedRow, items, expandLevels);
			});
		}
		this.set('expandHierarchyLevels', expandLevels);
	}

	function fillExpandedLevels(selectedRow, items, expandedLevels) {
		if (items.contains(selectedRow)) {
			var parent = items.get(selectedRow).get('Parent');
			if (parent && !Terrasoft.contains(expandedLevels, parent.value)) {
				expandedLevels.push(parent.value);
				fillExpandedLevels(parent.value, items, expandedLevels);
			}
		}
	}

	function backFromSimpleMode() {
		this.set('simpleSelectMode', false);

		var changeGridModeCallBack = function() {
			var selectedRows = this.get('currentFolders');
			if (this.previousModeMultiSelect) {
				this.set('selectedRows', selectedRows);
				this.set('activeRow', null);
			} else if (selectedRows.length > 0) {
				this.set('selectedRows', []);
				this.set('activeRow', selectedRows[0]);
			} else {
				this.set('selectedRows', []);
				this.set('activeRow', null);
				return;
			}
			this.showFolderInfo();
		};
		this.changeGridMode(this.previousModeMultiSelect, changeGridModeCallBack);
	}

	function getSelectedValue(currentRecord) {
		return {
			value: currentRecord.get('Id'),
			displayValue: currentRecord.get('Name')
		};
	}

	function selectButton() {
		var activeRow = this.get('activeRow');
		if (this.get('simpleSelectMode')) {
			var currentFolders = Terrasoft.deepClone(this.get('currentFolders'));
			this.changeFolderParent(currentFolders, activeRow, function() {
				backFromSimpleMode.apply(this, arguments);
				this.set('currentFolders', []);
			});
			return;
		}
		var selectedValues = [];
		var gridData = this.get('gridData');
		var parentSchemaName = this.entitySchema.name.replace('Folder', '');
		if (this.get('multiSelect')) {
			var selectedRows = this.get('selectedRows');
			Terrasoft.each(selectedRows, function(row) {
				var currentRecord = gridData.get(row);
				var value = getSelectedValue(currentRecord);
				value.sectionEntityScheamName = parentSchemaName;
				selectedValues.push(value);
			}, this);
		} else {
			var currentRecord = gridData.get(activeRow);
			var value = getSelectedValue(currentRecord);
			value.sectionEntityScheamName = parentSchemaName;
			selectedValues.push(value);
		}
		this.resultSelectedFolders(selectedValues);
	}

	function cancelButton() {
		if (this.get('simpleSelectMode')) {
			backFromSimpleMode.call(this);
			return;
		}
		this.cancelSelecting();
	}

	function deleteButton() {
		var multiSelect = this.get('multiSelect');
		var selectedRows = this.get('selectedRows');
		var activeRow = this.get('activeRow');
		if (multiSelect && selectedRows && selectedRows.length > 0 || !multiSelect && activeRow) {
			this.showConfirmationDialog(resources.localizableStrings.OnDeleteWarning, function(returnCode) {
				if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
					this.onDeleteAccept();
				}
			}, ['yes', 'no']);
		}
	}

	function dblClickGrid(id) {
		if (!this.get('multiSelect')) {
			this.set('activeRow', id);
			this.selectButton();
		}
	}

	function onDeleted() {
		this.set('activeRow', null);
		this.set('selectedRows', []);
		this.clear();
		this.load(true);
		this.showFolderInfo();
	}

	function clear() {
		var collection = this.get('gridData');
		collection.clear();
		this.pageNumber = 0;
	}

	function getFolderViewModelConfig(entitySchema, mainViewModel) {
		var viewModelConfig = {
			entitySchema: entitySchema,
			columns: {},
			values: {
				FilterManager: null,
				SelectedFilters: null,
				editMode: false,
				groupButtonVisible: false,
				unGroupButtonVisible: false,
				moveUpButtonVisible: false,
				moveDownButtonVisible: false
			},
			methods: {
				createNewFolder: function(folderType, parent) {
					this.isNew = true;
					var validationConfig = this.validationConfig;
					this.validationConfig = null;
					Terrasoft.each(this.columns, function(column) {
						this.set(column.name, null);
					}, this);
					this.validationConfig = validationConfig;
					this.setDefaultValues();
					this.set('Parent', {value: parent});
					this.set('FolderType', {value: folderType});
					this.set('editMode', true);
					var filterManager = this.get('FilterManager');
					filterManager.setFilters(Ext.create('Terrasoft.FilterGroup'));
					this.set('FilterManager', filterManager);
				},
				updateCurrentSelectedElement: function(result) {
					if (result.success) {
						mainViewModel.load(false, function() {
							if (this.wasNew) {
								this.wasNew = false;
								mainViewModel.set('activeRow', this.get(this.primaryColumnName));
								mainViewModel.showFolderInfo();
							}
						}, this);
						this.set('editMode', false);
					}
					else {
						this.showInformationDialog(result.errorInfo.message);
					}
				},
				saveButton: function() {
					if (this.isNew) {
						this.wasNew = true;
						var parent = this.get('Parent');
						if (parent && parent.value) {

							var expandedLevels = mainViewModel.get('expandHierarchyLevels').slice(0);
							if (!Terrasoft.contains(expandedLevels, parent.value)) {
								expandedLevels.push(parent.value);
							}
							mainViewModel.set('expandHierarchyLevels', expandedLevels);
						}
					}
					var folderType = this.get('FolderType');
					if (folderType && folderType.value === ConfigurationConstants.Folder.Type.Search) {
						this.set('SearchData', this.get('FilterManager').serializeFilters());
					}
					this.saveEntity(this.updateCurrentSelectedElement);
				},
				clearButton: function() {
					var filterManager = this.get('FilterManager');
					filterManager.setFilters(Ext.create('Terrasoft.FilterGroup'));
					this.set('FilterManager', filterManager);
				},
				cancelButton: function() {
					if (this.isNew) {
						var parent = this.get('Parent');
						if (parent && parent.value) {
							mainViewModel.showFolderInfo(parent.value);
						}
					} else {
						this.set('editMode', false);
					}
				},
				getFiltersArray: function() {
					var selectedItems = this.get('SelectedFilters');
					var filtersArray = [];
					Terrasoft.each(selectedItems, function(item) {
						filtersArray.push(item);
					});
					return filtersArray;
				},
				getFilter: function() {
					var selectedItems = this.get('SelectedFilters');
					var filtersArray = [];
					Terrasoft.each(selectedItems, function(item) {
						filtersArray.push(item);
					});
					return (filtersArray.length > 0) ? filtersArray[0] : null;
				},
				groupItems: function() {
					var filterManager = this.get('FilterManager');
					filterManager.groupFilters(this.getFiltersArray());
					this.onSelectedFilterChange();
				},
				unGroupItems: function() {
					var filterManager = this.get('FilterManager');
					filterManager.unGroupFilters(this.getFilter());
					this.onSelectedFilterChange();
				},
				moveUp: function() {
					var filterManager = this.get('FilterManager');
					filterManager.moveUp(this.getFilter());
					this.onSelectedFilterChange();
				},
				moveDown: function() {
					var filterManager = this.get('FilterManager');
					filterManager.moveDown(this.getFilter());
					this.onSelectedFilterChange();
				},
				goToEditMode: function() {
					this.set('editMode', true);
				},
				actionsButtonVisible: function() {
					return this.get('groupButtonVisible') || this.get('unGroupButtonVisible') ||
						this.get('moveUpButtonVisible') || this.get('moveDownButtonVisible');
				},
				onSelectedFilterChange: function() {
					var filter = this.getFilter();
					var rootFilter = this.get('FilterManager').filters;
					var notRootFilter = filter && filter !== rootFilter;
					var notFirstFilter = rootFilter.indexOf(filter) !== 0;
					var notLastFilter = rootFilter.indexOf(filter) !== rootFilter.getCount() - 1;
					this.set('groupButtonVisible', notRootFilter ? true : false);
					this.set('unGroupButtonVisible', notRootFilter &&
						filter.$className === 'Terrasoft.data.filters.FilterGroup');
					this.set('moveUpButtonVisible', notRootFilter && notFirstFilter);
					this.set('moveDownButtonVisible', notRootFilter && notLastFilter);
				}
			}
		};
		viewModelConfig.columns = Terrasoft.deepClone(entitySchema.columns);
		Terrasoft.each(viewModelConfig.columns, function(column) {
			column.columnPath = column.name;
			column.type = Terrasoft.ViewModelColumnType.ENTITY_COLUMN;
		}, this);
		return viewModelConfig;
	}

	function moveFolder() {
		var activeRow = this.get('activeRow');
		var selectedRows = this.get('selectedRows');
		if (activeRow || (selectedRows && selectedRows.length > 0)) {
			this.set('simpleSelectMode', true);
			this.set('currentFolders', selectedRows.length ? selectedRows : [activeRow]);
			this.previousModeMultiSelect = this.get('multiSelect');
			this.set('selectedRows', []);
			this.set('activeRow', null);
			this.changeGridMode(false);
		}
	}

	function changeMultiSelectMode() {
		if (this.get('enableMultiSelect')) {
			var multiSelect = !this.get('multiSelect');
			this.set('activeRow', null);
			this.changeGridMode(multiSelect);
		}
	}

	function showFolderInfo(rowId) {
		if (rowId === this.get('activeRow')) {
			return;
		}
		if (!rowId) {
			rowId = this.get('activeRow');
		}
		if (rowId && !this.get('simpleSelectMode') && !this.get('multiSelect')) {
			var self = this;
			if (this.currentEditElement) {
				var filterManager = this.currentEditElement.get('FilterManager');
				var filterModel = this.currentEditElement;
				this.currentEditElement.loadEntity(rowId, function() {
					if (this.get('FolderType').value === ConfigurationConstants.Folder.Type.Search) {
						var searchData = this.get('SearchData');
						var deserializedFilters = Ext.isEmpty(searchData) ?
							null : Terrasoft.deserialize(searchData);
						if (filterModel.methods.assignEntitySchema) {
							filterModel.assignEntitySchema.call(filterModel, deserializedFilters);
						} else {
							searchData = Ext.isEmpty(deserializedFilters) ?
								Ext.create('Terrasoft.FilterGroup') : deserializedFilters;
							filterManager.setFilters(searchData);
							this.set('FilterManager', filterManager);
						}
						self.set('folderInfoVisible', true);
					} else {
						self.set('folderInfoVisible', false);
					}
					self.set('canRename', true);
					this.set('editMode', this.isNew);
				});
			}
			this.set('selectEnabled', true);
		} else {
			this.set('folderInfoVisible', false);
			this.set('canRename', false);
			this.set('selectEnabled', (rowId && this.get('simpleSelectMode')) || this.get('multiSelect'));
		}
	}

	return {
		generate: generate,
		getFolderViewModelConfig: getFolderViewModelConfig
	};
});