define('DetailViewModelGenerator', ['ext-base', 'terrasoft', 'sandbox', 'CardViewModelGenerator',
	'DetailViewModelGeneratorResources', 'GridUtilities', 'GridProfileHelper', 'MaskHelper'],
	function(Ext, Terrasoft, sandbox, CardViewModelGenerator, resources, GridUtilities, GridProfileHelper, MaskHelper) {
		var cardEntityInfo;
		var entitySchema;
		var relativePath;

		function getFullViewModelSchema(sourceViewModelSchema, userCodes) {
			var viewModelSchema = Terrasoft.deepClone(sourceViewModelSchema);
			var parent = viewModelSchema.methods.applyFilter;
			viewModelSchema.methods.applyFilter = function(select, args) {
				if (parent) {
					if (!parent.apply(select, args)) {
						return;
					}
				}
				var filterPath = this.filterPath;
				var filterValue = this.filterValue;
				var filterLogicalOperationType = this.filterLogicalOperationType;
				if (args) {
					filterPath = this.filterPath = args.filterPath;
					filterValue = this.filterValue = args.filterValue;
					relativePath = this.filterPath = args.filterPath;
					filterLogicalOperationType = this.filterLogicalOperationType = args.filterLogicalOperationType;
				}
				if (Ext.isArray(filterPath)) {
					var schemaFiltersGroup = Terrasoft.createFilterGroup();
					schemaFiltersGroup.logicalOperation = (filterLogicalOperationType) ?
						filterLogicalOperationType :
						Terrasoft.LogicalOperatorType.AND;
					filterPath.forEach(function(path, index) {
						addFilterColumn.call(this, schemaFiltersGroup, path, filterValue[index]);
					}, this);
					select.filters.add('schemaFiltersGroup', schemaFiltersGroup);
				} else {
					addFilterColumn.call(this, select.filters, filterPath, filterValue);
				}
			};
			viewModelSchema.schema.gridPanel = [{
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: 'gridData',
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: true,
				isCollection: true
			}, {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: 'selectedRows',
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: false
			}, {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: 'activeRow',
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: false
			}, {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: 'loadMoreVisibility',
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				visible: false
			}];

			viewModelSchema.methods.getColumnsProfile = function() {
				return this.get('columnsSettingsProfile');
			};
			viewModelSchema.methods.dblClickGridDetail = function() {
				this.openCardModule('view');
			};
			viewModelSchema.methods.setColumnsProfile = function() {
				var columnsSettingsProfile = this.get('columnsSettingsProfile');
				var columnsSettingsProfileKey =  this.args.parentChemaName + this.args.schemaName + 'GridSettings';
				Terrasoft.utils.saveUserProfile(columnsSettingsProfileKey, columnsSettingsProfile, false);
				this.set('columnsSettingsProfile', columnsSettingsProfile);
			};

			viewModelSchema.methods.updateSortColumnsCaptions = function() {
				var columnsSettingsProfile = this.getColumnsProfile();
				GridProfileHelper.updateSortColumnsCaptions.call(this, columnsSettingsProfile);
			};
			viewModelSchema.methods.sortColumn = function(index) {
				var columnsSettingsProfile = this.getColumnsProfile();
				GridProfileHelper.changeSorting.call(this, {
					index: index,
					columnsSettingsProfile: columnsSettingsProfile
				});
				this.pageNumber = 0;
				this.isClearGridData = true;
				this.load();
			};
			viewModelSchema.methods.sortGrid = function(tag) {
				var columnsSettingsProfile = this.getColumnsProfile();
				GridProfileHelper.changeSorting.call(this, {
					tag: tag,
					columnsSettingsProfile: columnsSettingsProfile
				});
				this.pageNumber = 0;
				this.isClearGridData = true;
				this.load();
			};
			viewModelSchema.methods.getGridEmpty = function() {
				return this.get('gridData').getCount() === 0;
			};
			viewModelSchema.methods.onExpandHierarchyLevels = function(parentId, isExpanded) {
			};
			viewModelSchema.methods.selectRow = function(value) {
			};
			viewModelSchema.methods.unSelectRow = function(value) {
			};
			viewModelSchema.methods.load = function(args, type) {
				if (args) {
					this.args = args;
				} else {
					args = this.args;
				}
				var columnsSettingsProfile = this.getColumnsProfile();
				GridUtilities.getLocalizedColumnCaptions(columnsSettingsProfile, this.entitySchema.name,
					function(columnsConfig, captionsConfig) {
						if (captionsConfig) {
							var grid = Ext.getCmp(this.entitySchema.instanceId + '-grid');
							if (grid) {
								grid.captionsConfig = captionsConfig;
							}
						}
						if (args && args.predefinedRecords) {
							var blockBaseLoad = args.blockBaseLoad || false;
							var predefinedRecords = args.predefinedRecords || [];
							if (predefinedRecords.length > 0) {
								this.onLoadData();
							}
							if (predefinedRecords.length > 0 || blockBaseLoad) {
								return;
							}
						}
						var select  = this.getSelect(args);
						if (!Ext.isEmpty(select)) {
							this.loadSelect(select);
						}
					}, this);
			};

			viewModelSchema.methods.additionalAdd = function(construct, dom, event, tag, customAction) {
				this.add.call(this, tag, customAction);
			};

			viewModelSchema.methods.getLoadAllCaption = function() {
				var count = this.get('allRowsCount') || 0;

				return Ext.String.format(resources.localizableStrings.LoadAllButtonCaptionMask, count);
			};

			viewModelSchema.methods.loadAllRows = function() {
				this.loadAll = true;
				this.isClearGridData = true;
				this.load();
			};

			viewModelSchema.methods.loadAllRowsCount = function() {
				if (!this.showLoadAllButton) {
					return;
				}
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchema: this.entitySchema
				});
				select.addAggregationSchemaColumn(this.entitySchema.primaryColumnName,
					Terrasoft.AggregationType.COUNT, 'CountRows');

				var filteresq = this.getSelect(this.args);
				select.filters.add('filtername', filteresq.filters);

				select.getEntityCollection(function(response) {
					if (response.success && response.collection) {
						var items = response.collection.getItems();
						if (items.length > 0) {
							this.set('allRowsCount', items[0].get('CountRows'));
						}
					}
				}, this);

			};

			viewModelSchema.methods.loadSelect = function(select) {
				this.set('gridLoading', true);
				select.getEntityCollection(this.onLoadData, this);
			};
			viewModelSchema.methods.clear = function() {
				var gridData = this.get('gridData');
				gridData.clear();
			};
			viewModelSchema.methods.loadNext = function() {
				this.load();
			};
			viewModelSchema.methods.getSelect = function(args) {
				var columnsSettingsProfile = this.getColumnsProfile();
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchema: this.entitySchema
				});
				var profileSortedColumns = [];
				var parameters = [select, args, columnsSettingsProfile, profileSortedColumns];
				var initSelectActions = [
					this.getLoadedColumnsWithSortedColumnsInitialization,
					function(select, columnsSettingsProfile, profileSortedColumns) {
						if (!this.loadedColumns) {
							select = null;
						}
					},
					this.addSelectColumns,
					this.initSelectSorting,
					this.modifySelectQuery,
					this.initializePageable,
					this.applyFilter
				];
				Terrasoft.each(initSelectActions, function(action) {
					if (action && !Ext.isEmpty(this.parameters[0])) {
						action.apply(this.scope, this.parameters);
					}
				}, {scope: this, parameters: parameters});
				return select;
			};
			viewModelSchema.methods.addSelectColumns =  function(select) {
				select.addColumn(this.primaryColumnName);
				var columns = select.columns.collection;
				Terrasoft.each(this.loadedColumns, function(column, columnKey) {
					if (!columns.containsKey(columnKey)) {
						select.addColumn(column, columnKey);
					}
				});
				var config = Terrasoft.configuration.EntityStructure[this.entitySchema.name];
				var configAttribute = (config) ? config.attribute : undefined;
				if (configAttribute && !select.columns.find(configAttribute)) {
					select.addColumn(configAttribute);
				}
			};
			viewModelSchema.methods.initSelectSorting = function(
				select, args, columnsSettingsProfile, profileSortedColumns) {
				var sortedColumnName = this.sortedColumnName;
				var selectColumns = select.columns.collection;
				var sortedColumn = {};
				if (!GridProfileHelper.initSelectSorting.call(
					this,
					select,
					columnsSettingsProfile,
					profileSortedColumns)) {
					var index = 0;
					if (!Ext.isEmpty(sortedColumnName) &&
						selectColumns.containsKey(sortedColumnName)) {
						sortedColumn = selectColumns.get(sortedColumnName);
						sortedColumn.orderPosition = 1;
						sortedColumn.orderDirection = this.sortedColumnDirection ||
							Terrasoft.OrderDirection.ASC;
						index = selectColumns.indexOf(sortedColumn);
						this.set('sortColumnIndex', index);
						this.set('gridSortDirection', sortedColumn.orderDirection);

					} else {
						if (selectColumns.containsKey('CreatedOn')) {
							sortedColumn = select.columns.collection.get('CreatedOn');
						} else {
							sortedColumn = select.addColumn('CreatedOn');
						}
						sortedColumn.orderPosition = 1;
						sortedColumn.orderDirection = Terrasoft.OrderDirection.ASC;
						index = selectColumns.indexOf(sortedColumn);
						this.set('sortColumnIndex', index);
						this.set('gridSortDirection', sortedColumn.orderDirection);

					}
				}

			};
			viewModelSchema.methods.getLoadedColumnsWithSortedColumnsInitialization = function(
				select, args, columnsSettingsProfile, profileSortedColumns) {
				return GridProfileHelper.getLoadedColumnsWithSortedColumnsInitialization.call(
					this,
					select,
					columnsSettingsProfile,
					profileSortedColumns);
			};
			viewModelSchema.methods.reload = function() {
				var gridData = this.get('gridData');
				var tempCollection = new Terrasoft.BaseViewModelCollection();
				tempCollection.loadAll(gridData);
				this.clear();
				gridData.loadAll(tempCollection);
			};
			viewModelSchema.methods.initializePageable = function(select, args) {
				var addCount = 1;
				var pageRowCount = this.pageRowCount;
				var newLoadedCount = 1;
				if (args) {
					if (args.pageRowCount) {
						pageRowCount = this.pageRowCount = args.pageRowCount;
					} else {
						pageRowCount = this.pageRowCount = 5;
					}
					if (args.newLoadedCount > 0) {
						newLoadedCount = args.newLoadedCount;
						delete args.newLoadedCount;
					}
				}
				var config = {
					collection: this.get('gridData'),
					primaryColumnName: this.entitySchema.primaryColumnName,
					schemaQueryColumns: select.columns,
					isPageable: !this.loadAll && (pageRowCount > 0),
					rowCount: pageRowCount + addCount,
					newLoadedCount: newLoadedCount,
					isClearGridData: this.isClearGridData
				};
				GridUtilities.initializePageableOptions(select, config);
			};
			viewModelSchema.methods.sortByKey = function(array, key) {
				return array.sort(function(a, b) {
					var x = a[key];
					var y = b[key];
					return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				});
			};
			viewModelSchema.methods.onLoadData = function(response) {
				if (this.isInstanceDestroyed()) {
					return;
				}
				this.set('gridLoading', false);
				var collection = this.get('gridData');
				if (this.isClearGridData) {
					this.isClearGridData = false;
					this.clear();
				}
				var items = collection.getItems();
				var itemsKeys = collection.getKeys();
				if (response && response.success) {
					var responseItems = response.collection.getItems();
					if (this.modifyItems) {
						this.modifyItems(responseItems);
					}
					this.set('loadMoreVisibility', (this.loadAll) ? false : responseItems.length > this.pageRowCount);
					if (responseItems.length > this.pageRowCount && this.pageRowCount !== -1) {
						responseItems = responseItems.slice(0, responseItems.length - 1);
					}
					var tempCollection = new Terrasoft.BaseViewModelCollection();
					Terrasoft.each(responseItems, function(item) {
						var key = item.get('Id');
						if (itemsKeys && itemsKeys.length > 0 && itemsKeys.indexOf(key) != -1) {
							return;
						}
						tempCollection.add(key, item);
					});
					this.set('gridEmpty', items.length === 0 && tempCollection.getCount() === 0);
					collection.loadAll(tempCollection);
				}
				var gridSorting = this.get('gridSorting');
				if (gridSorting) {
					this.set('gridSorting', !gridSorting);
				}
				if (this.init) {
					this.init();
				}
			};

			viewModelSchema.methods.add = function(tag, customAction) {
				var isNewRecord = this.cardAction === 'add' || this.cardAction === 'copy';
				if (isNewRecord) {
					var historyState = this.sandbox.publish('GetHistoryState');
					var sandboxId = historyState.state.moduleId;
					var args = {
						callback: addDetail,
						tag: tag,
						scope: this,
						escope: this,
						customAction: customAction,
						moduleId: Ext.isEmpty(sandboxId) ? this.sandbox.id : sandboxId
					};
					this.sandbox.publish('SaveRecord', args);
				} else {
					if (Ext.isFunction(customAction)) {
						customAction.call(this);
					} else {
						addDetail(tag, customAction, this);
					}
				}
			};
			function addDetail(tag, customAction, scope) {
				MaskHelper.ShowBodyMask();
				if (!Ext.isEmpty(customAction)) {
					if (typeof customAction === 'string') {
						scope.sandbox.publish('PushHistoryState', { hash: customAction});
					} else {
						customAction.apply(scope);
					}
				} else {
					var filterPath = scope.filterPath;
					var filterValue = scope.filterValue;
					var config = Terrasoft.configuration.EntityStructure[scope.entitySchema.name];
					var editPageName = scope.getEditPage(config, tag);
					sandbox = scope.sandbox;
					var cardModuleId = sandbox.id + '_CardModule_' + scope.entitySchema.name;
					sandbox.subscribe('CardModuleEntityInfo', function(args) {
						var entityInfo = {};
						entityInfo.action = 'add';
						entityInfo.cardSchemaName = editPageName;
						entityInfo.activeRow = '';
						if (config && config.attribute) {
							entityInfo.typeUId = tag;
							entityInfo.typeColumnName = config.attribute;
						}
						entityInfo.valuePairs = [];
						if (Ext.isArray(filterPath)) {
							filterPath.forEach(function(path, index) {
								entityInfo.valuePairs.push({
									name: path,
									value: filterValue[index]
								});
							}, this);
						} else {
							entityInfo.valuePairs.push({
								name: filterPath,
								value: filterValue
							});
						}
						if (scope && Ext.isFunction(scope.modifyEntityInfo)) {
							scope.modifyEntityInfo.call(scope, entityInfo);
						}
						if (cardEntityInfo) {
							entityInfo.pageConfig = entityInfo.detailPageConfig = cardEntityInfo.detailPageConfig;
						}
						return entityInfo;
					}, [cardModuleId]);
					sandbox.publish('OpenCardModule', cardModuleId, [scope.getCardModuleSandboxId()]);
					sandbox.subscribe('UpdateDetail', function(recordId) {
						scope.isObsolete = true;
						scope.loadAllRowsCount();
						sandbox.publish('DetailChanged', [sandbox.id, recordId]);
					}, [cardModuleId]);
				}
			}

			viewModelSchema.methods.getEditPage = function(config, typeId) {
				MaskHelper.ShowBodyMask();
				if (config && typeId) {
					if (config.pages) {
						for (var i = 0; i < config.pages.length; i++) {
							var pageConfig = config.pages[i];
							if (pageConfig.UId === typeId && pageConfig.cardSchema) {
								return pageConfig.cardSchema;
							}
						}
					}
				}
				return this.editPageName;
			};
			viewModelSchema.methods.edit = function() {
				this.openCardModule('edit');
				this.clearSelection();
			};
			viewModelSchema.methods.copy = function() {
				MaskHelper.ShowBodyMask();
				this.openCardModule('copy');
			};
			viewModelSchema.methods.view = function() {
				MaskHelper.ShowBodyMask();
				this.openCardModule('view');
			};
			viewModelSchema.methods.getGridModeCaption = function() {
				if (this.get('multiSelect')) {
					return resources.localizableStrings.ToSigleSelectGridMode;
				} else {
					return resources.localizableStrings.ToMultiSelectGridMode;
				}
			};
			viewModelSchema.methods.switchGridMode = function() {
				this.clearSelection();
				var isMultiSelect = this.get('multiSelect');
				this.set('multiSelect', !isMultiSelect);
				var collection = new Terrasoft.BaseViewModelCollection();
				var gridData = this.get('gridData');
				collection.loadAll(gridData);
				this.clear();
				this.get('gridData').loadAll(collection);
			};
			viewModelSchema.methods.getSelectedItems = function() {
				var isMultiSelect = this.get('multiSelect');
				var activeRow = this.get('activeRow');
				var selectedRows = this.get('selectedRows');
				return isMultiSelect ? selectedRows : (activeRow && [activeRow]);
			};
			viewModelSchema.methods.GetSelectedItems = function() {
				if (window.console && window.console.warn) {
					window.console.warn(Ext.String.format(Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
							'GetSelectedItems', 'getSelectedItems'));
				}
				return this.getSelectedItems();
			};
			viewModelSchema.methods.setSelectedItems = function(selectedItems) {
				var isMultiSelect = this.get('multiSelect');
				if (isMultiSelect) {
					if (selectedItems instanceof Array) {
						this.set('selectedRows', selectedItems);
					} else {
						this.set('selectedRows', [selectedItems]);
					}
				} else {
					if (selectedItems instanceof Array) {
						if (!Ext.isEmpty(selectedItems)) {
							this.set('activeRow', selectedItems[0]);
						}
					} else {
						this.set('activeRow', selectedItems);
					}
				}
			};
			viewModelSchema.methods.clearSelection = function() {
				this.set('activeRow', null);
				this.set('selectedRows', null);
			};
			viewModelSchema.methods.openCardModule = function(action) {
				var selectedItems = this.getSelectedItems();
				if (Ext.isEmpty(selectedItems)) {
					return;
				}
				var viewModel = this;
				var primaryColumnValue = selectedItems.pop();
				var cardSchemaName;
				var config = Terrasoft.configuration.EntityStructure[this.entitySchema.name];
				var configAttribute;
				if (config) {
					cardSchemaName = config.cardSchema;
					configAttribute = config.attribute;
				}
				var gridData = this.get('gridData');
				if (Ext.isEmpty(primaryColumnValue) || Ext.isEmpty(gridData) || Ext.isEmpty(gridData.collection)) {
					return cardSchemaName;
				}
				var activeRow = gridData.get(primaryColumnValue);
				if (!activeRow) {
					return cardSchemaName;
				}
				var pageTypeId;
				if (configAttribute) {
					pageTypeId = activeRow.get(configAttribute).value;
				}
				cardSchemaName = this.getEditPage(config, pageTypeId);
				sandbox = this.sandbox;
				var cardModuleId = sandbox.id + '_CardModule_' + this.entitySchema.name;
				sandbox.subscribe('CardModuleEntityInfo', function() {
					var entityInfo = {
						action: action,
						activeRow: primaryColumnValue,
						cardSchemaName: cardSchemaName,
						isReadOnly: viewModel.get('isReadOnly')
					};
					if (config && config.attribute) {
						entityInfo.typeUId = pageTypeId;
						entityInfo.typeColumnName = config.attribute;
					}
					if (viewModel && Ext.isFunction(viewModel.modifyEntityInfo)) {
						viewModel.modifyEntityInfo.call(viewModel, entityInfo);
					}
					if (cardEntityInfo) {
						entityInfo.pageConfig = entityInfo.detailPageConfig = cardEntityInfo.detailPageConfig;
					}
					return entityInfo;
				}, [cardModuleId]);
				sandbox.publish('OpenCardModule', cardModuleId, [this.getCardModuleSandboxId()]);
				sandbox.subscribe('UpdateDetail', function(recordId) {
					var collection = viewModel.get('gridData');
					viewModel.clear();
					viewModel.load();
					viewModel.loadAllRowsCount();
					sandbox.publish('DetailChanged', [sandbox.id, recordId]);
				}, [cardModuleId]);
			};
			viewModelSchema.methods['delete'] = function() {
				this.showConfirmationDialog(resources.localizableStrings.OnDeleteWarning,
					function(returnCode) {
						if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
							this.onDeleteAccept();
						}
					}, ['yes', 'no']);
			};
			viewModelSchema.methods.onDeleteAccept = function() {
				GridUtilities.deleteSelectedRecords(this);
			};
			viewModelSchema.methods.onDeleted = function(records) {
				if (records && records.length) {
					var gridData = this.get('gridData');
					records.forEach(function(record) {
						gridData.removeByKey(record);
					});
					this.set('gridEmpty', !gridData.getCount());
					this.loadAllRowsCount();
					this.sandbox.publish('DetailChanged', [this.sandbox.id, null]);
				}
			};

			viewModelSchema.methods.isSomeSelected = function() {
				var selectedRows = this.getSelectedItems();
				return !Ext.isEmpty(selectedRows) && selectedRows.length === 1;
			};
			viewModelSchema.methods.isAnySelected = function() {
				var selectedRows = this.getSelectedItems();
				return !Ext.isEmpty(selectedRows) && selectedRows.length > 0;
			};
			viewModelSchema.methods.setReadOnly = function(isReadOnly) {
				if (isReadOnly === 'undefined') {
					return;
				}
				this.set('isReadOnly', isReadOnly);
			};
			viewModelSchema.methods.isEditActionsVisible = function() {
				return !this.get('isReadOnly');
			};
			applyUserCode(viewModelSchema, userCodes);
			this.editPageName = viewModelSchema.editPageName;
			return viewModelSchema;
		}

		function applyUserCode(viewModelSchema, userCodes) {
			Terrasoft.each(userCodes, function(userCode) {
				userCode.call(viewModelSchema);
			});
		}

		function generateViewModelColumn(schemaItem) {
			return {
				type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
				caption: schemaItem.caption,
				name: schemaItem.name,
				columnPath: schemaItem.columnPath,
				isCollection: schemaItem.isCollection
			};
		}

		function checkColumnsNames(columns, name) {
			if (columns[name] !== undefined) {
				var errorMessage = Ext.String.format(resources.localizableStrings.DuplicateExceptionMessage, name);
				throw new Terrasoft.ItemAlreadyExistsException({message: errorMessage});
			}
		}

		function getViewModelColumns(columns, columnsContainer) {
			Terrasoft.each(columnsContainer, function(schemaItem) {
				var itemType = schemaItem.type;
				switch (itemType) {
					case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
						var columnConfig = Terrasoft.utils.common.deepClone(schemaItem);
						var column = generateViewModelColumn(columnConfig);
						checkColumnsNames(columns, schemaItem.name);
						columns[schemaItem.name] = column;
						var entitySchemaColumn = entitySchema.getColumnByName(schemaItem.columnPath);
						if (entitySchemaColumn && entitySchemaColumn.isLookup === true) {
							column.isLookup = true;
							var lookupListColumnConfig = {
								type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
								name: schemaItem.list || schemaItem.name + 'List',
								isCollection: true
							};
							checkColumnsNames(columns, lookupListColumnConfig.name);
							columns[lookupListColumnConfig.name] = lookupListColumnConfig;
						}
						break;
					case Terrasoft.ViewModelSchemaItem.GROUP:
						var groupedColumns = getViewModelColumns(columns, schemaItem.items);
						Ext.apply(columns, groupedColumns);
						break;
					case Terrasoft.ViewModelSchemaItem.DETAIL:
						break;
					default:
						break;
				}
			}, this);
		}

		function addFilterColumn(target, name, value) {
			if (!this.entitySchema.columns[name]) {
				return;
			}
			target.add(name + '-filter-' + value, Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, name, value));
		}

		return {
			init: function(params) {
				sandbox = params.sa;
			},
			generateItem: function(viewModel, userCodes, args) {
				var fullViewModelSchema = Terrasoft.deepClone(viewModel);
				applyUserCode(fullViewModelSchema, userCodes);
				cardEntityInfo = args;
				entitySchema = fullViewModelSchema.entitySchema;
				var itemViewModelConfig = {
					extend: fullViewModelSchema.extend,
					className: 'Terrasoft.' + fullViewModelSchema.name,
					entitySchema: fullViewModelSchema.entitySchema,
					name: fullViewModelSchema.name + 'Item',
					defValues: fullViewModelSchema.defValues,
					parentModuleSandboxId: fullViewModelSchema.parentModuleSandboxId,
					gridType: fullViewModelSchema.gridType,
					utilsConfig: fullViewModelSchema.utilsConfig,
					showLoadAllButton: fullViewModelSchema.showLoadAllButton,
					columns: {},
					primaryColumnName: '',
					primaryDisplayColumnName: '',
					values: {
						gridEmpty: false,
						gridLoading: false,
						gridSorting: false,
						gridSortDirection: Terrasoft.OrderDirection.ASC,
						sortDirection: Terrasoft.OrderDirection.ASC,
						sortColumnIndex: 0,
						multiSelect: false,
						allRowsCount: 0
					}
				};
				itemViewModelConfig.columns[entitySchema.primaryColumn.name] = {
					columnPath: entitySchema.primaryColumn.name,
					name: entitySchema.primaryColumn.name,
					type: 0
				};
				fullViewModelSchema.methods.typeChanged = function(tag) {
					this.set(fullViewModelSchema.typeColumn, tag);
				};
				fullViewModelSchema.methods['delete'] = function() {
					if (!this.isNew) {
						this.set('toDelete', true);
					}
					this.onDeleted(this.isNew);
				};

				Ext.apply(itemViewModelConfig, fullViewModelSchema.methods);
				CardViewModelGenerator.getViewModelColumns(
					itemViewModelConfig,
					fullViewModelSchema.attributes,
					fullViewModelSchema.entitySchema);

				return itemViewModelConfig;
			},
			generate: function(viewModelSchema, userCodes, columnsSettingsProfile) {
				var fullViewModelSchema = getFullViewModelSchema(viewModelSchema, userCodes);
				entitySchema = fullViewModelSchema.entitySchema;
				var config = {
					extend: fullViewModelSchema.extend,
					typeColumn: fullViewModelSchema.typeColumn,
					typeCollection: fullViewModelSchema.typeCollection,
					alternateClassName: 'Terrasoft.' + fullViewModelSchema.name,
					entitySchema: fullViewModelSchema.entitySchema,
					loadAll: fullViewModelSchema.loadAll,
					name: fullViewModelSchema.name,
					editPageName: fullViewModelSchema.editPageName,
					attributes: fullViewModelSchema.attributes,
					columns: {},
					primaryColumnName: '',
					primaryDisplayColumnName: '',
					loadedColumns: fullViewModelSchema.loadedColumns,
					values: {
						expandHierarchyLevels: [],
						isReadOnly: false,
						columnsSettingsProfile: columnsSettingsProfile
					}
				};
				Ext.apply(config, fullViewModelSchema.methods);
				Ext.apply(config.values, fullViewModelSchema.values);
				getViewModelColumns(config.columns, fullViewModelSchema.schema.gridPanel);
				return config;
			}
		};
	});

