define("LookupPageViewModelGenerator", ["ext-base", "terrasoft", "LookupPageViewModelGeneratorResources",
	"GridUtilities", "GridProfileHelper", "ConfigurationEnums", "MaskHelper", "ProcessModuleUtilities",
	"RightUtilities", "LookupUtilities", "ModuleUtils"],
	function(Ext, Terrasoft, resources, gridUtils, GridProfileHelper, ConfigurationEnums, MaskHelper,
	ProcessModuleUtilities, RightUtilities, LookupUtilities, moduleUtils) {

		var LookupModes = {
			EDIT_MODE: "editMode",
			PROCESS_MODE: "processMode"
		};
		var methods = {
			isProcessMode: function() {
				return this.get("lookupMode") === LookupModes.PROCESS_MODE;
			},
			isEditMode: function() {
				return this.get("lookupMode") === LookupModes.EDIT_MODE;
			},
			init: function() {
				var lookupInfo = this.getLookupInfo();
				this.sandbox.subscribe("CardModuleResponse", function(args) {
					if (args.success) {
						var rootSchema = this.getCurrentSchema();
						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchema: rootSchema
						});
						select.addColumn(rootSchema.primaryColumnName);
						select.addColumn(rootSchema.primaryDisplayColumnName);
						this.addSelectColumns(select);
						select.filters.addItem(Terrasoft.createColumnInFilterWithParameters("Id", [args.uId]));
						var lookupInfo = this.getLookupInfo();
						var filters = lookupInfo.filters;
						if (filters) {
							if (filters.filterType === Terrasoft.FilterType.FILTER_GROUP) {
								filters.each(function(filter) {
									select.filters.addItem(filter);
								});
							} else {
								select.filters.addItem(filters);
							}
						}
						select.getEntityCollection(function(response) {
							var result = new Terrasoft.Collection();
							response.collection.each(function(item) {
								result.add(item.get("Id"), this.getResultItem(item));
							}, this);
							this.selectResult(result);
						}, this);
					}
				}, this, [this.sandbox.id + "_" + lookupInfo.columnName + "_CardModule"]);
			},

			loadNext: function() {
				if (!this.destroyed) {
					this.pageNumber++;
					this.load();
				}
			},
			getCurrentSchema: function() {
				return this.entitySchema;
			},
			getLookupInfo: function() {
				return this.get("LookupInfo");
			},
			initLoadedColumns: function() {
				this.loadedColumns = [];
				Terrasoft.each(this.getLookupInfo().columns, function(column) {
					this.loadedColumns.push({
						columnPath: column
					});
				}, this);
				var entitySchema = this.getCurrentSchema();
				this.loadedColumns.push({
					columnPath: entitySchema.primaryColumnName
				}, {
					columnPath: entitySchema.primaryDisplayColumnName
				});
				var entityStructure = moduleUtils.getEntityStructureByName(entitySchema.name);
				if (entityStructure) {
					var typeColumnName = entityStructure.pages[0].typeColumnName;
					if ((entityStructure.pages.length > 1) && typeColumnName) {
						this.loadedColumns.push({
							columnPath: typeColumnName
						});
					}
				}
			},
			isGridTiled: function() {
				var columnsSettingsProfile = this.getColumnsProfile();
				return columnsSettingsProfile.isTiled;
			},
			getColumnsProfile: function() {
				var profile = this.get("gridProfile");
				if (profile.listedConfig) {
					var viewGenerator = Ext.create("Terrasoft.ViewGenerator");
					viewGenerator.viewModelClass = this;
					var newProfile = {
						listedConfig: Ext.decode(profile.listedConfig),
						tiledConfig: Ext.decode(profile.tiledConfig),
						isTiled: profile.type === "tiled",
						type: profile.type,
						key: profile.key
					};
					viewGenerator.actualizeGridConfig(newProfile);
					this.clearLinks(newProfile);
					this.set("gridProfile", {
						isTiled: newProfile.isTiled,
						key: newProfile.key,
						listedColumnsConfig: Ext.encode(newProfile.listedConfig.columnsConfig),
						captionsConfig: Ext.encode(newProfile.listedConfig.captionsConfig),
						tiledColumnsConfig: Ext.encode(newProfile.tiledConfig.columnsConfig),
						type: newProfile.type
					});
				}
				return this.get("gridProfile");
			},

			clearLinks: function(profile) {
				Terrasoft.each(profile.listedConfig.columnsConfig, function(item) {
					if (item.hasOwnProperty("link")) {
						delete item.link;
					}
				}, this);
				Terrasoft.each(profile.tiledConfig.columnsConfig, function(rowItem) {
					Terrasoft.each(rowItem, function(item) {
						if (item.hasOwnProperty("link")) {
							delete item.link;
						}
					}, this);
				}, this);
			},
			sortColumn: function(index) {
				var columnsSettingsProfile = this.getColumnsProfile();
				GridProfileHelper.changeSorting.call(this, {
					index: index,
					columnsSettingsProfile: columnsSettingsProfile
				});
				this.isClearGridData = true;
				this.load();
			},
			sortGrid: function(tag) {
				var columnsSettingsProfile = this.getColumnsProfile();
				GridProfileHelper.changeSorting.call(this, {
					tag: tag,
					columnsSettingsProfile: columnsSettingsProfile
				});
				this.isClearGridData = true;
				this.load();
			},
			setColumnsProfile: function(viewColumnsSettingsProfile) {
				var columnsSettingsProfileKey = this.getProfileKey();
				Terrasoft.utils.saveUserProfile(columnsSettingsProfileKey, viewColumnsSettingsProfile, false);
				this.set("gridProfile", viewColumnsSettingsProfile);
			},
			getSelect: function() {
				var columnsSettingsProfile = this.getColumnsProfile();
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchema: this.getCurrentSchema()
				});
				var profileSortedColumns = {};
				var parameters = [select, columnsSettingsProfile, profileSortedColumns];
				var initSelectActions = [
					this.getLoadedColumnsWithSortedColumnsInitialization,
					function(select) {
						if (!this.loadedColumns) {
							select = null;
						}
					},
					this.addSelectColumns,
					this.initSelectSorting,
					this.pushSelectFilters,
					this.initializePageable
				];
				Terrasoft.each(initSelectActions, function(action) {
					if (action && !Ext.isEmpty(this.parameters[0])) {
						action.apply(this.scope, this.parameters);
					}
				}, {scope: this, parameters: parameters});
				return select;
			},
			getLoadedColumnsWithSortedColumnsInitialization:
				GridProfileHelper.getLoadedColumnsWithSortedColumnsInitialization,
			addSelectColumns: function(select) {
				var columns = select.columns.collection;
				Terrasoft.each(this.loadedColumns, function(column, columnKey) {
					if (!columns.containsKey(columnKey)) {
						select.addColumn(column, columnKey);
					}
				});
			},
			initSelectSorting: function(select) {
				var lookupInfo = this.getLookupInfo();
				if (lookupInfo && lookupInfo.sortedColumns) {
					Terrasoft.each(lookupInfo.sortedColumns, function(item) {
						var column = null;
						if (select.columns.contains(item.name)) {
							column = select.columns.get(item.name);
						} else {
							column = select.addColumn(item.name);
						}
						column.orderPosition = item.orderPosition;
						column.orderDirection = item.orderDirection;
					}, this);
				}
				GridProfileHelper.initSelectSorting.apply(this, arguments);
			},
			pushSelectFilters: function(select) {
				var filters = select.filters;
				var lookupInfo = this.getLookupInfo();
				if (!lookupInfo.columnValue) {
					var searchColumn = this.get("searchColumn");
					var searchData = this.get("searchData");
					if (searchColumn && searchData) {
						var columnPath = searchColumn.value;
						var filter = select.createColumnFilterWithParameter(Terrasoft.ComparisonType.START_WITH,
							columnPath, searchData);
						filters.add("searchDataFilter", filter);
					}
				} else {
					lookupInfo.columnValue = null;
				}
			},
			initializePageable: function(select) {
				if (!this.pageRowsCount) {
					this.pageRowsCount = this.isGridTiled() ? 15 : 30;
				}
				var config = {
					collection: this.get("gridData"),
					primaryColumnName: this.entitySchema.primaryColumnName,
					schemaQueryColumns: select.columns,
					isPageable: !this.loadAll && (this.pageRowsCount > 0),
					rowCount: this.pageRowsCount,
					select: select,
					isClearGridData: this.isClearGridData,
					lookupReferenceSchema: this.getCurrentSchema()
				};
				var lastRecord = this.get("lastRecord");
				if (!Ext.isEmpty(lastRecord)) {
					config.lastRecord = lastRecord;
				}
				gridUtils.initializePageableOptions(select, config);
			},
			load: function() {
				if (this.get("RestoreSelectedData")) {
					this.loadSelected();
				}
				var select = this.getSelect();
				var hierarchicalColumnName = this.getHierarchicalColumnName();
				if (!Ext.isEmpty(hierarchicalColumnName)) {
					this.putNestingColumn(select, hierarchicalColumnName);
				}
				this.set("advancedVisible", false);
				this.set("advancedSpinnerVisible", true);
				this.set("IsGridLoading", true);
				var lookupInfo = this.getLookupInfo();
				if (!Ext.isEmpty(lookupInfo.filterObjectPath)) {
					this.updateFilterByFilterObjectPath(select.filters, lookupInfo.filterObjectPath);
				}
				var filters = select.filters;
				if (!Ext.isEmpty(lookupInfo.filters)) {
					filters.add("searchFilter", lookupInfo.filters);
				}
				if (!Ext.isEmpty(hierarchicalColumnName)) {
					select.filters.add("hierarchicalParentFilter",
						this.getFirstLevelFilter(hierarchicalColumnName));
				}
				select.getEntityCollection(this.onLoadData, this);
			},
			getHierarchicalColumnName: function() {
				var lookupInfo = this.getLookupInfo();
				if (lookupInfo.hierarchical) {
					if (!Ext.isEmpty(lookupInfo.hierarchicalColumnName)) {
						return lookupInfo.hierarchicalColumnName;
					}
					return this.getCurrentSchema().hierarchicalColumnName;
				}
				return null;
			},
			loadNesting: function(parentId) {
				var select = this.getSelect();
				var lookupInfo = this.getLookupInfo();
				var hierarchicalColumnName = this.getCurrentSchema().hierarchicalColumnName;
				if (!Ext.isEmpty(lookupInfo.hierarchicalColumnName)) {
					hierarchicalColumnName = lookupInfo.hierarchicalColumnName;
				}
				if (!Ext.isEmpty(hierarchicalColumnName)) {
					select.addColumn(hierarchicalColumnName + "." + "Id", "parentId");
					this.putNestingColumn(select, hierarchicalColumnName);
				}
				select.rowCount = -1;
				select.isPageable = false;
				if (!Ext.isEmpty(lookupInfo.filterObjectPath)) {
					this.updateFilterByFilterObjectPath(select.filters, lookupInfo.filterObjectPath);
				}
				var filters = select.filters;
				if (!Ext.isEmpty(lookupInfo.filters)) {
					filters.add("searchFilter", lookupInfo.filters);
				}
				if (!Ext.isEmpty(hierarchicalColumnName)) {
					var virtualRootItem = lookupInfo.virtualRootItem;
					if (!Ext.isEmpty(virtualRootItem) && (parentId === virtualRootItem.get("Id"))) {
						select.filters.add("hierarchicalParentFilter",
							this.getFirstLevelFilter(hierarchicalColumnName));
					} else {
						select.filters.add("hierarchicalParentFilter",
							this.getChildFilter(hierarchicalColumnName, parentId));
					}
				}
				select.getEntityCollection(this.onLoadNesting, this);
			},
			afterRender: function() {
				var searchEdit = Ext.getCmp("searchEdit");
				searchEdit.getEl().focus();
			},
			onLoadNesting: function(response) {
				var parentId = null;
				if (!Ext.isEmpty(response.collection.getByIndex(0))) {
					parentId = response.collection.getByIndex(0).get("parentId");
				}

				var resultCollection = response.collection;
				var lookupInfo = this.getLookupInfo();
				var virtualRootItem = lookupInfo.virtualRootItem;
				if (!Ext.isEmpty(virtualRootItem) && (!parentId)) {
					var virtualRootItemValues = lookupInfo.virtualRootItemValues;
					virtualRootItem.set("HasNesting", 1);
					var hierarchicalColumnName = this.getCurrentSchema().hierarchicalColumnName;
					if (!hierarchicalColumnName) {
						hierarchicalColumnName = lookupInfo.hierarchicalColumnName;
					}
					resultCollection = Ext.create("Terrasoft.Collection");
					resultCollection.add(0, virtualRootItem);
					response.collection.each(function(item) {
						if (!item.get(hierarchicalColumnName)) {
							item.set(hierarchicalColumnName, virtualRootItemValues);
							item.set("parentId", virtualRootItem.get("Id"));
						}
						resultCollection.add(response.collection.indexOf(item) + 1, item);
					}, this);
					parentId = virtualRootItem.get("Id");
					this.get("gridData").clear();
				}
				this.get("gridData").loadAll(resultCollection, {
					mode: "child",
					target: parentId
				});
			},
			/**
			 * Обрабатывает ответ на запрос загрузку данных
			 * @param {OBJECT} response Ответ запроса на вычитку данных
			 * @param {OBJECT} options Опции для добавления записей в определенное место грида
			 */
			onLoadData: function(response, options) {
				this.set("IsGridLoading", false);
				if (response.collection.isEmpty() === 0) {
					this.set("advancedSpinnerVisible", false);
					this.set("IsGridEmpty", true);
					return;
				}

				var gridCollection = this.get("gridData");
				if (this.isClearGridData) {
					this.isClearGridData = false;
					gridCollection.clear();
				}
				var lookupInfo = this.getLookupInfo();
				var virtualRootItem = lookupInfo.virtualRootItem;
				if (!Ext.isEmpty(virtualRootItem)) {
					virtualRootItem.set("HasNesting", 1);
					if (gridCollection.isEmpty()) {
						this.loadNesting(virtualRootItem.get("Id"));
						this.set("expandHierarchyLevels", [virtualRootItem.get("Id")]);
					}
				} else {
					this.set("IsGridEmpty", gridCollection.isEmpty() && response.collection.isEmpty());
					var fixedCollection = this.prepareResponseCollection(response.collection);
					gridCollection.loadAll(fixedCollection, options);
				}
				if (!gridCollection.isEmpty()) {
					var lastRecord = gridCollection.getByIndex(gridCollection.getCount() - 1);
					this.set("lastRecord", lastRecord);
				}

				this.set("advancedSpinnerVisible", false);
				if (this.get("gridData").getCount() < this.pageRowsCount) {
					this.set("advancedVisible", false);
				} else {
					this.set("advancedVisible", (response.collection.getCount() > 0));
				}

			},
			prepareResponseCollection: function(dataCollection) {
				var gridCollection = this.get("gridData");
				var fixedCollection = Ext.create("Terrasoft.Collection");
				dataCollection.each(function(item) {
					var itemKey = item.get(item.primaryColumnName);
					if (!gridCollection.contains(itemKey) && !fixedCollection.contains(itemKey)) {
						fixedCollection.add(itemKey, item);
					}
				});
				return fixedCollection;
			},
			loadSelected: function() {
				var restoredIds = this.get("RestoreSelectedData");
				this.set("RestoreSelectedData", null);
				var columnsSettingsProfile = this.getColumnsProfile();
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchema: this.getCurrentSchema()
				});
				var profileSortedColumns = {};
				var parameters = [select, columnsSettingsProfile, profileSortedColumns];
				var initSelectActions = [
					this.getLoadedColumnsWithSortedColumnsInitialization,
					function(select) {
						if (!this.loadedColumns) {
							select = null;
						}
					},
					this.addSelectColumns,
					this.initSelectSorting
				];
				Terrasoft.each(initSelectActions, function(action) {
					if (action && !Ext.isEmpty(this.parameters[0])) {
						action.apply(this.scope, this.parameters);
					}
				}, {scope: this, parameters: parameters});
				var filters = select.filters;
				filters.add("selectedIdsFilter", Terrasoft.createColumnInFilterWithParameters("Id", restoredIds));
				this.set("advancedVisible", false);
				this.set("advancedSpinnerVisible", true);
				this.set("IsGridLoading", true);
				select.getEntityCollection(function(response) {
					this.onLoadData(response, {mode: "top"});
					this.setSelectedRecords(restoredIds);
				}, this);
			},

			updateFilterByFilterObjectPath: function(filters, objectPath) {
				if (!Ext.isEmpty(filters.leftExpression)) {
					filters.leftExpression.columnPath =
						objectPath + "." + filters.leftExpression.columnPath;
				} else {
					Terrasoft.each(filters.getItems(), function(item) {
						this.updateFilterByFilterObjectPath(item, objectPath);
					}, this);
				}
			},
			getFirstLevelFilter: function(hierarchicalColumnName) {
				return Terrasoft.createColumnIsNullFilter(hierarchicalColumnName);
			},
			getChildFilter: function(hierarchicalColumnName, parentId) {
				return Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					hierarchicalColumnName,
					parentId);
			},
			putNestingColumn: function(select, parentColumnName) {
				var serializationInfo = select.filters.getDefSerializationInfo();
				serializationInfo.serializeFilterManagerInfo = true;
				var filters = Terrasoft.deserialize(select.filters.serialize(serializationInfo));
				var lookupInfo = this.getLookupInfo();
				if (!Ext.isEmpty(lookupInfo.filterObjectPath)) {
					this.updateFilterByFilterObjectPath(filters, lookupInfo.filterObjectPath);
				}
				if (!Ext.isEmpty(lookupInfo.filters)) {
					filters.add("searchFilter", lookupInfo.filters);
				}
				var aggregationColumnName = Ext.String.format("[{0}:{1}].Id",
					select.rootSchemaName || select.rootSchema.name, parentColumnName);
				var agrigationColumn = Ext.create("Terrasoft.AggregationQueryColumn", {
					aggregationType: Terrasoft.AggregationType.COUNT,
					columnPath: aggregationColumnName,
					subFilters: filters
				});
				select.addColumn(agrigationColumn, "HasNesting");
			},
			onSearchButtonClick: function() {
				if (this.get("searchData") !== this.get("previousSearchData")) {
					this.set("previousSearchData", this.get("searchData"));
					this.set("activeRow", null);
					this.clear();
					this.load();
					this.emptyGridRowHistory();
				}
			},
			onExpandHierarchyLevels: function(parentId, isExpanded) {
				var expandedElements = this.get("expandedElements");
				if (isExpanded && !expandedElements.hasOwnProperty(parentId)) {
					expandedElements[parentId] = {
						page: 0
					};
					this.loadNesting(parentId);
				}
			},
			getSelectedRecords: function() {
				var isMultiSelect = this.get("multiSelect");
				var activeRow = this.get("activeRow");
				var selectedRows = this.get("selectedRows");
				return isMultiSelect ? selectedRows : (activeRow && [activeRow]);
			},
			setSelectedRecords: function(rowIds) {
				var isMultiSelect = this.get("multiSelect");
				if (!isMultiSelect) {
					return;
				}
				this.set("selectedRows", rowIds);
			},
			clearSelection: function() {
				this.set("activeRow", null);
				this.set("selectedRows", []);
			},
			/**
			 * Возвращает истину, если выбраны только одна запись.
			 * @returns {boolean}
			 */
			isSingleSelected: function() {
				var selectedRows = this.getSelectedRecords();
				return selectedRows && (selectedRows.length === 1);
			},
			/**
			 * Возвращает истину, если выбраны одна и более записей.
			 * @returns {boolean}
			 */
			isAnySelected: function() {
				var selectedRows = this.getSelectedRecords();
				return selectedRows && (selectedRows.length > 0);
			},
			isUnSelectAllMenuVisible: function() {
				return (this.get("multiSelect") === true);
			},
			getResultItem: function(item) {
				var primaryColumnName = item.primaryColumnName;
				var primaryDisplayColumnName = item.primaryDisplayColumnName;
				item.values.value = item.values[primaryColumnName];
				item.values.displayValue = item.values[primaryDisplayColumnName];
				return item.values;
			},
			selectButton: function() {
				var collection = this.get("gridData");
				var result = new Terrasoft.Collection();
				var notLoadedItems = [];
				var records = this.getSelectedRecords();
				if (!Ext.isEmpty(records)) {
					records.forEach(function(recordId) {
						if (collection.contains(recordId)) {
							result.add(recordId, this.getResultItem(collection.get(recordId)));
						} else {
							notLoadedItems.push(recordId);
						}
					}, this);
				}
				if (Ext.isEmpty(notLoadedItems)) {
					this.selectResult(result);
				} else {
					var rootSchema = this.getCurrentSchema();
					var select = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchema: rootSchema
					});
					select.addColumn(rootSchema.primaryColumnName);
					select.addColumn(rootSchema.primaryDisplayColumnName);
					this.addSelectColumns(select);
					select.filters.add("IdFilter", Terrasoft.createColumnInFilterWithParameters("Id", notLoadedItems));
					select.getEntityCollection(function(response) {
						response.collection.each(function(item) {
							result.add(item.get("Id"), this.getResultItem(item));
						}, this);
						this.selectResult(result);
					}, this);
				}
			},
			selectResult: function(result) {
				this.sandbox.publish("ResultSelectedRows", {
					selectedRows: result,
					columnName: this.getLookupInfo().columnName
				}, [this.sandbox.id]);
			},
			cancelButton: function() {
				if (this.isProcessMode()) {
					this.sandbox.publish("BackHistoryState");
					return;
				}
				this.close();
			},
			showProcessLogButton: function() {
				this.sandbox.publish("PushHistoryState", {hash: "SectionModule/SysProcessLogSection"});
			},
			updateSortColumnsCaptions: function() {
				var columnsSettingsProfile = this.getColumnsProfile();
				GridProfileHelper.updateSortColumnsCaptions.call(this, columnsSettingsProfile);
			},
			hide: function() {
				LookupUtilities.Hide();
			},
			close: function() {
				LookupUtilities.Close(this.sandbox);
			},
			getCurrentCardInfo: function() {
				var entitySchema = this.getCurrentSchema();
				var entityStructure = moduleUtils.getEntityStructureByName(entitySchema.name);
				var selectedRecords = this.getSelectedRecords();
				var gridData = this.get("gridData");
				var editPagesInfo = entityStructure.pages;
				var cardSchemaName = editPagesInfo[0].cardSchema;
				var configAttribute = editPagesInfo[0].typeColumnName;
				var result = {cardSchemaName: cardSchemaName};
				if (Ext.isEmpty(selectedRecords) ||
					gridData.isEmpty() ||
					Ext.isEmpty(configAttribute)) {
					return result;
				}
				var filteredRow = gridData.get(selectedRecords[0]);
				if (Ext.isEmpty(filteredRow)) {
					return result;
				}
				var pageTypeId = filteredRow.get(configAttribute).value;
				var pageObjects = editPagesInfo.filter(function(item) {
					return (item.UId === pageTypeId);
				});
				if (Ext.isEmpty(pageObjects)) {
					return result;
				}
				var pageObject = pageObjects[0];
				var pageObjectCardSchema = pageObject.cardSchema;
				result.cardSchemaName = pageObjectCardSchema ||  cardSchemaName;
				result.typeUId = pageTypeId;
				result.typeColumnName = configAttribute;
				return result;
			},

			onDelete: function() {
				var items = this.getSelectedRecords();
				if (!items || !items.length) {
					return;
				}
				var checkCanDeleteCallback = function(result) {
					if (result) {
						this.showInformationDialog(resources.localizableStrings[result], function() {}, {
							style: Terrasoft.MessageBoxStyles.BLUE
						});
					} else {
						this.showConfirmationDialog(resources.localizableStrings.OnDeleteWarning, function(returnCode) {
							if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
								this.onDeleteAccept();
							}
						}, [Terrasoft.MessageBoxButtons.YES.returnCode, Terrasoft.MessageBoxButtons.NO.returnCode]);
					}
				};

				if (items.length === 1) {
					RightUtilities.checkCanDelete({
						schemaName: this.entitySchema.name,
						primaryColumnValue: items[0]
					}, checkCanDeleteCallback, this);
				} else {
					RightUtilities.checkMultiCanDelete({
						schemaName: this.entitySchema.name,
						primaryColumnValues: items
					}, checkCanDeleteCallback, this);
				}
			},
			onDeleteAccept: function() {
				gridUtils.deleteSelectedRecords(this);
			},
			getContainer: function() {
				return LookupUtilities.GetContainer();
			},

			getActionConfig: function(tag) {
				var tags = tag.split("/");
				return {
					action: tags[0],
					cardSchemaName: tags[1],
					typeUId: tags[2],
					typeColumnName: tags[3]
				};
			},

			defaultModeActionButtonClick: function(tag) {
				var actionConfig = this.getActionConfig(tag);
				var entitySchema = this.getCurrentSchema();
				var activeRows = this.getSelectedRecords();
				var activeRow = activeRows && (activeRows.length > 0) ? activeRows[0] : null;
				var lookupInfo = this.getLookupInfo();
				if ((actionConfig.action !== ConfigurationEnums.CardState.Add) && !activeRow) {
					return;
				}
				var entityStructure = moduleUtils.getEntityStructureByName(entitySchema.name);
				if (entityStructure) {
					if ((actionConfig.action === ConfigurationEnums.CardState.Edit) ||
						(actionConfig.action === ConfigurationEnums.CardState.Copy)) {
						Ext.apply(actionConfig, this.getCurrentCardInfo(actionConfig));
					}
					if (this.updateAddCardModuleEntityInfo) {
						this.updateAddCardModuleEntityInfo(actionConfig, activeRow);
					}
					if (lookupInfo.valuePairs) {
						actionConfig.valuePairs = lookupInfo.valuePairs;
					}
					var lookupPageId = this.sandbox.id + "_" + lookupInfo.columnName + "_CardModule";
					this.sandbox.subscribe("getCardInfo", function() {
						var cardInfo = {
							valuePairs: actionConfig.valuePairs || []
						};
						if (actionConfig.typeColumnName) {
							cardInfo.typeColumnName = actionConfig.typeColumnName;
							cardInfo.typeUId = actionConfig.typeUId;
						}
						return cardInfo;
					}, this, [lookupPageId]);
					var params = this.sandbox.publish("GetHistoryState");
					this.sandbox.publish("PushHistoryState", {
						hash: params.hash.historyState,
						stateObj: {
							isSeparateMode: true,
							schemaName: actionConfig.cardSchemaName,
							operation: actionConfig.action,
							primaryColumnValue: activeRow,
							valuePairs: actionConfig.valuePairs,
							isInChain: true
						}
					});
					MaskHelper.ShowBodyMask();
					LookupUtilities.Hide();
					this.sandbox.loadModule("CardModuleV2", {
						renderTo: "centerPanel",
						id: lookupPageId,
						keepAlive: true
					});
				} else {
					var lookupEditPageId = this.sandbox.id + "_NUIBaseLookupEditPage";
					var captionLookup = this.get("captionLookup").replace(
						resources.localizableStrings.CaptionLookupPage, "");
					this.sandbox.subscribe("CardModuleEntityInfo", function() {
						var entityInfo = {};
						entityInfo.action = actionConfig.action;
						entityInfo.entitySchemaName = entitySchema.name;
						entityInfo.activeRow = activeRow;
						entityInfo.lookupCaption = captionLookup;
						entityInfo.lookupInfo = lookupInfo;
						return entityInfo;
					}, [lookupEditPageId]);
					var lookupEditPageParams = this.sandbox.publish("GetHistoryState");
					this.sandbox.publish("PushHistoryState", {
						hash: lookupEditPageParams.hash.historyState
					});
					MaskHelper.ShowBodyMask();
					LookupUtilities.Hide();
					this.sandbox.loadModule("NUIBaseLookupEditPage", {
						renderTo: "centerPanel",
						id: lookupEditPageId,
						keepAlive: true
					});
				}
			},

			/**
			 * Открывает карточку
			 * @param {OBJECT} openCardConfig
			 */
			openCard: function(openCardConfig) {
				this.sandbox.publish("OpenCard", openCardConfig, [this.sandbox.id]);
			},

			/* jshint unused : false */
			processModeActionButtonClick: function(tag) {

				var activeItems = this.getSelectedRecords();
				if ((tag === "executeProcess") && !Ext.isEmpty(activeItems)) {
					ProcessModuleUtilities.executeProcess({
						sysProcessId: activeItems[0]
					});
				}
			},
			generateCardPath: function(cardConfig, action) {
				var url = [];
				if (cardConfig.cardModule) {
					url.push(cardConfig.cardModule);
				}
				if (cardConfig.cardSchema) {
					url.push(cardConfig.cardSchema, action);
				}
				if (action !== ConfigurationEnums.CardState.Add) {
					var activeRows = this.getSelectedRecords();
					var activeRow = activeRows[0];
					url.push(activeRow);
				}
				return url.join("/");
			},
			editModeActionButtonClick: function(tag) {
				var cardModule, cardSchema;
				var entitySchema = this.getCurrentSchema();
				var module = moduleUtils.getModuleStructureByName(entitySchema.name);
				if (module) {
					cardModule = module.cardModule;
					cardSchema = module.cardSchema;
				}
				var cardConfig = {
					cardModule: cardModule,
					cardSchema: cardSchema
				};
				if (this.getLookupInfo().cardCustomConfig) {
					Ext.apply(cardConfig, this.getLookupInfo().cardCustomConfig);
				}
				if (!cardConfig.cardSchema) {
					return;
				}
				var url = this.generateCardPath(cardConfig, tag);
				if (url) {
					this.sandbox.publish("PushHistoryState", {hash: url});
					LookupUtilities.Hide();
				}
			},
			actionButtonClick: function(tag) {
				this.getLookupInfo().searchValue = "";
				if (!tag) {
					tag = arguments[3];
				}
				if (this.isEditMode()) {
					this.editModeActionButtonClick(tag);
					return;
				}
				if (this.isProcessMode()) {
					this.processModeActionButtonClick(tag);
					return;
				}
				this.defaultModeActionButtonClick(tag);
			},
			onDeleted:  function(records) {
				if (!records) {
					records = this.getSelectedRecords();
				}
				if (records && (records.length > 0)) {
					var gridData = this.get("gridData");
					records.forEach(function(record) {
						gridData.removeByKey(record);
					});
					this.set("IsGridEmpty", gridData.isEmpty());
					this.clearSelection();
					var lookupInfo = this.getLookupInfo();
					if (lookupInfo.methods && lookupInfo.methods.onDeleted) {
						lookupInfo.methods.onDeleted.call(this);
					}
				}
			},
			dblClickGrid: function(id) {
				if (this.isEditMode()) {
					this.set("activeRow", id);
					this.actionButtonClick("edit");
					return;
				} else if (this.isProcessMode()) {
					this.actionButtonClick("executeProcess");
					return;
				}
				this.set("activeRow", id);
				this.selectButton();
			},
			clear: function() {
				this.get("gridData").clear();
				this.set("expandHierarchyLevels", []);
				this.pageNumber = 0;
			},
			openGridSettingPage: function() {
				var sandboxId = this.sandbox.id;
				var gridSettingsId = "GridSettings_" + sandboxId;
				var entitySchemaName = this.getCurrentSchema().name;
				var viewModel = this;
				var renderTo = Ext.get("centerPanel");
				var profileKey =  this.getProfileKey();
				this.sandbox.subscribe("GetGridSettingsInfo", function() {
					var gridSettingsInfo = {};
					gridSettingsInfo.entitySchemaName = entitySchemaName;
					gridSettingsInfo.baseGridType = ConfigurationEnums.GridType.LISTED;
					gridSettingsInfo.profileKey = profileKey;
					return gridSettingsInfo;
				}, this, [gridSettingsId]);
				var params = this.sandbox.publish("GetHistoryState");
				this.sandbox.publish("PushHistoryState", {hash: params.hash.historyState});
				MaskHelper.ShowBodyMask();
				this.sandbox.loadModule("GridSettingsV2", {
					renderTo: renderTo,
					id: gridSettingsId,
					keepAlive: true
				});
				this.sandbox.subscribe("GridSettingsChanged", function(args) {
					if (args && args.newProfileData) {
						viewModel.set("gridProfile", args.newProfileData);
					}
					viewModel.isObsolete = true;
					viewModel.close();
				}, this, [gridSettingsId]);
				viewModel.hide();
			},

			initHasActions: function() {
				var lookupInfo = this.getLookupInfo();
				var context = this;
				if (typeof lookupInfo.actionsButtonVisible !== "boolean" || lookupInfo.actionsButtonVisible) {
					RightUtilities.getSchemaDeleteRights({
						schemaName: this.getCurrentSchema().name
					}, function(response) {
						if (response) {
							context.set("canDelete", false);
						} else {
							context.set("canDelete", true);
						}
						RightUtilities.getSchemaEditRights({
							schemaName: this.getCurrentSchema().name
						}, function(response) {
							var entitySchema = this.getCurrentSchema();
							var hasEditPage = !Ext.isEmpty(moduleUtils.getEntityStructureByName(entitySchema.name));
							if (response || !hasEditPage) {
								context.set("canEdit", false);
							} else {
								context.set("canEdit", true);
							}
							context.set("hasActions", context.get("canEdit") || context.get("canDelete"));
							if (lookupInfo.hideActions) {
								context.set("hasActions", false);
							}
						}, this);

					}, this);
				} else {
					context.set("hasActions", false);
				}
			},
			isValidColumnDataValueType: function(column) {
				return (column.dataValueType === Terrasoft.DataValueType.TEXT ||
					column.dataValueType === Terrasoft.DataValueType.LOOKUP);
			},
			getSchemaColumns: function() {
				var entitySchema = this.getCurrentSchema();
				var schemaColumns = this.get("schemaColumns");
				schemaColumns.clear();
				var columns = Ext.create("Terrasoft.Collection");
				Terrasoft.each(entitySchema.columns, function(entitySchemaColumn) {
					if (this.isValidColumnDataValueType(entitySchemaColumn) &&
						entitySchemaColumn.name !== entitySchema.primaryDisplayColumnName &&
						entitySchemaColumn.usageType !== ConfigurationEnums.EntitySchemaColumnUsageType.None) {
						var columnPath = entitySchemaColumn.name;
						if (entitySchemaColumn.isLookup) {
							columnPath += "." + entitySchemaColumn.referenceSchema.primaryDisplayColumnName;
						}
						var column = {
							value: columnPath,
							displayValue: entitySchemaColumn.caption
						};
						columns.add(column.name, column);
					}
				}, this);
				columns.sort(0, Terrasoft.OrderDirection.ASC, function(a, b) {
					if (a.displayValue < b.displayValue) {
						return -1;
					} else if (a.displayValue > b.displayValue) {
						return 1;
					} else {
						return 0;
					}
				});
				columns.add(entitySchema.primaryDisplayColumn.name, {
					value: entitySchema.primaryDisplayColumn.name,
					displayValue: entitySchema.primaryDisplayColumn.caption
				}, 0);
				schemaColumns.loadAll(columns);
			},
			initCaptionLookup: function() {
				var lookupInfo = this.getLookupInfo();
				if (!Ext.isEmpty(lookupInfo.captionLookup)) {
					this.set("captionLookup", lookupInfo.captionLookup);
					return;
				}
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "SysLookup"});
				select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "value");
				select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "displayValue");
				select.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					"SysEntitySchemaUId", this.getCurrentSchema().uId
				));
				select.getEntityCollection(function(response) {
					var prefix = "";
					if (!lookupInfo.mode) {
						prefix = resources.localizableStrings.CaptionLookupPage;
					}
					if (response.collection.getCount() > 0) {
						var lookupName = response.collection.getByIndex(0).get("displayValue");
						this.set("captionLookup", prefix + lookupName);
					} else {
						this.set("captionLookup", prefix + this.getCurrentSchema().caption);
					}
				}, this);
			},
			emptyGridRowHistory: function() {
				var grid = Ext.getCmp("grid");
				if (grid.watchRowHistory) {
					grid.watchRowHistory = [];
				}
			},
			getProfileKey: function() {
				var lookupInfo = this.getLookupInfo();
				var postfix = lookupInfo.lookupPostfix;
				var profileKey = "GridSettings_" + this.entitySchema.name;
				if (!this.Ext.isEmpty(postfix)) {
					profileKey += postfix;
				}
				return profileKey;
			},
			getDefaultProfile: function() {
				var primaryDisplayColumn = this.entitySchema.primaryDisplayColumn;
				var lookupInfo = this.getLookupInfo();
				var tiledColumnsConfig = null;
				var listedColumnsConfig = null;
				var captionsConfig = null;
				if (lookupInfo && !this.Ext.isEmpty(lookupInfo.sortedColumns)) {
					tiledColumnsConfig = [[{
						cols: 24,
						key: [{
							caption: primaryDisplayColumn.caption,
							name: {bindTo: primaryDisplayColumn.name},
							type: Terrasoft.GridKeyType.TITLE
						}],
						metaPath: primaryDisplayColumn.name,
						orderPosition: 0
					}]];
					listedColumnsConfig = [{
						cols: 24,
						key: [{
							name: {bindTo: primaryDisplayColumn.name}
						}],
						metaPath: primaryDisplayColumn.name,
						orderPosition: 0
					}];
					captionsConfig = [{
						cols: 24,
						columnName: primaryDisplayColumn.name,
						name: primaryDisplayColumn.caption
					}];
				} else {
					tiledColumnsConfig = [[{
						cols: 24,
						key: [{
							caption: primaryDisplayColumn.caption,
							name: {bindTo: primaryDisplayColumn.name},
							type: Terrasoft.GridKeyType.TITLE
						}],
						metaPath: primaryDisplayColumn.name,
						orderDirection: Terrasoft.OrderDirection.ASC,
						orderPosition: 0
					}]];
					listedColumnsConfig = [{
						cols: 24,
						key: [{
							name: {bindTo: primaryDisplayColumn.name}
						}],
						metaPath: primaryDisplayColumn.name,
						orderDirection: Terrasoft.OrderDirection.ASC,
						orderPosition: 0
					}];
					captionsConfig = [{
						cols: 24,
						columnName: primaryDisplayColumn.name,
						name: primaryDisplayColumn.caption,
						sortColumnDirection: Terrasoft.core.enums.OrderDirection.ASC
					}];
				}
				var key = this.getProfileKey();
				return {
					key: key,
					isTiled: false,
					listedColumnsConfig: Ext.encode(listedColumnsConfig),
					tiledColumnsConfig: Ext.encode(tiledColumnsConfig),
					captionsConfig: Ext.encode(captionsConfig)
				};
			}
		};
		function generateViewModel(lookupInfo) {
			var activeRow = Ext.isEmpty(lookupInfo.selectedRows) ? null : lookupInfo.selectedRows[0];
			var values = {
				searchData: "",
				searchColumn: lookupInfo.searchColumn,
				schemaColumns: new Terrasoft.Collection(),
				gridProfile: lookupInfo.gridProfile,
				selectedRowsCount: 0,
				Caption: "",
				captionLookup: "",
				canEdit: true,
				canDelete: true,
				hasActions: true,
				expandedElements: {},
				expandHierarchyLevels: null,
				gridData: new Terrasoft.Collection(),
				LookupInfo: lookupInfo,
				lookupMode: lookupInfo.mode,
				multiSelect: lookupInfo.multiSelect,
				selectedRows: lookupInfo.selectedRows || null,
				activeRow: activeRow
			};
			var config = {
				name: "LookupPageModule",
				entitySchema: lookupInfo.entitySchema,
				columns: {},
				primaryColumnName: "",
				primaryDisplayColumnName: "",
				values: values,
				methods: methods
			};
			return config;
		}
		return {
			generate: generateViewModel
		};
	});
