define("FolderManagerViewModel", ["ext-base", "terrasoft", "FolderManagerViewModelResources",
		"ConfigurationConstants", "LookupUtilities", "ResponseExceptionHelper"],
	function(Ext, Terrasoft, resources, ConfigurationConstants, LookupUtilities, ResponseExceptionHelper) {

		function generate(parentSandbox, config) {
			var sandbox = parentSandbox;
			var quickFilterModuleId = sandbox.publish("GetSectionFilterModuleId");
			var viewModelConfig = {
				entitySchema: config.entitySchema,
				columns: {
					enableMultiSelect: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "enableMultiSelect"
					},
					multiSelect: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "multiSelect"
					},
					actualFolderId: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "actualFolderId"
					}
				},
				values: {
					gridData: new Terrasoft.Collection(),
					multiSelect: config.multiSelect,
					currentFilter: config.currentFilter,
					enableMultiSelect: config.enableMultiSelect,
					selectedRows: config.selectedFolders,
					activeRow: config.currentFilter,
					favoriteGeneratedId: config.favoriteGeneratedId,
					canRename: !Ext.isEmpty(config.currentFilter),
					selectEnabled: config.currentFilter || config.multiSelect,
					expandHierarchyLevels: [],
					administratedButtonVisible: config.entitySchema.administratedByRecords && !config.multiSelect,
					sectionModule: config.sectionEntitySchema,
					isGridDoubleClickAllowed: true,
					isFavoriteSelected: false
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
					expandToSelectedItems: expandToSelectedItems,
					onExpandHierarchyLevels: onExpandHierarchyLevels,
					onActiveRowAction: onActiveRowAction,
					setActiveRow: setActiveRow,
					SendUpdateFavoritesMenu: function(folderEntitySchemaName, folderSchemaUId) {
						sandbox.publish("UpdateFavoritesMenu", {
							folderEntitySchemaName: folderEntitySchemaName,
							folderSchemaUId: folderSchemaUId
						}, [quickFilterModuleId]);
					},
					resultSelectedFolders: function(selectedFolders) {
						if (config.loadSection) {
							loadSection(selectedFolders);
						} else {
							sandbox.publish("ResultSelectedFolders", {
								folders: selectedFolders
							}, [sandbox.id]);
							sandbox.publish("BackHistoryState");
						}
					},
					cancelSelecting: function() {
						if (config.loadSection) {
							loadSection();
						} else {
							sandbox.publish("BackHistoryState");
						}
					},
					addGeneralFolderButton: function() {
						var activeRow = this.get("isFavoriteSelected") ? this.get("activeRowToSet") : this.get("activeRow");
						this.currentEditElement.createNewFolder(ConfigurationConstants.Folder.Type.General, activeRow);
						this.renameFolder();
					},
					addSearchFolderButton: function() {
						var activeRow = this.get("isFavoriteSelected") ? this.get("activeRowToSet") : this.get("activeRow");
						this.currentEditElement.createNewFolder(ConfigurationConstants.Folder.Type.Search, activeRow);
						this.renameFolder();
					},
					getFolderEditViewModel: function(folderType) {
						var viewModelConfig = getFolderViewModelConfig(this.entitySchema, this);
						viewModelConfig.methods.getActiveRow = this.getActiveRow();
						var folderViewModel = Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
						folderViewModel.set("FolderType", {value: folderType});
						if (config && config.sectionEntitySchema) {
							folderViewModel.set("sectionEntitySchemaName", config.sectionEntitySchema.name);
						}
						return folderViewModel;
					},
					getFavoriteFolderActionCaption: function() {
						var parentRow = this.getActiveRowParent();
						var caption = (parentRow === config.favoriteRootRecordItem) ?
							resources.localizableStrings.RemoveFromFavoriteMenuItemCaption
							: resources.localizableStrings.AddToFavoriteMenuItemCaption;
						return caption;
					},
					getFavoriteActionVisible: function() {
						var parentRow = this.getActiveRowParent();
						return !Ext.isEmpty(parentRow);
					},
					getIsFolderSelected: function() {
						var parentRow = this.getActiveRowParent();
						return !Ext.isEmpty(parentRow) || this.get("multiSelect");
					},
					doFavoriteFolderAction: function() {
						var activeRow = this.getActiveRow();
						if (!activeRow) {
							return;
						}
						var isInFavorites = this.get("gridData").get(activeRow).get("isInFavorites");
						this.setActiveRow(this.getActualFolderId(activeRow));
						var filters;
						if (isInFavorites) {
							var selectedId = this.getActualFolderId(activeRow);
							var parentRow = this.getActiveRowParent();
							var keepActive = parentRow !== config.favoriteRootRecordItem;
							deleteFromFavorites(selectedId, this, keepActive);
						} else {
							var select = Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "FolderFavorite"
							});
							select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
							filters = Ext.create("Terrasoft.FilterGroup");
							filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"SysAdminUnit", Terrasoft.SysValue.CURRENT_USER.value));
							filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"FolderEntitySchemaUId", this.entitySchema.uId));
							filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"FolderId", activeRow));
							select.filters = filters;
							select.getEntityCollection(function(response) {
								if (response && response.success) {
									if (response.collection.getItems().length > 0) {
										return;
									}
									var insert = Ext.create("Terrasoft.InsertQuery", {
										rootSchemaName: "FolderFavorite"
									});
									insert.setParameterValue("SysAdminUnit", Terrasoft.SysValue.CURRENT_USER.value,
										Terrasoft.DataValueType.GUID);
									insert.setParameterValue("FolderId", activeRow, Terrasoft.DataValueType.GUID);
									insert.setParameterValue("FolderEntitySchemaUId", config.entitySchema.uId,
										Terrasoft.DataValueType.GUID);
									insert.execute(function(response) {
										if (response && response.success) {
											this.clear();
											this.load(true);
											this.SendUpdateFavoritesMenu(config.entitySchema.name,
												config.entitySchema.uId);
										}
									}, this);
								}
							}, this);
						}
					},

					editFolderFilters: function() {
						var activeRow = this.getActiveRow();
						var sectionFilterModuleId = sandbox.publish("GetSectionFilterModuleId");
						if (!activeRow || !this.currentEditElement) {
							return;
						}
						var folder = this.currentEditElement;
						sandbox.publish("UpdateCustomFilterMenu", {
							"isExtendedModeHidden": false,
							"isFoldersHidden": true,
							"clearActiveFolder": true
						}, [sectionFilterModuleId]);
						sandbox.publish("CustomFilterExtendedMode", {
							folder: folder,
							filter: Terrasoft.deserialize(folder.get("SearchData"))
						}, [sandbox.id]);
					},
					editRights: function() {
						var id = sandbox.id + "_Rights";
						sandbox.subscribe("GetRecordInfo", function() {
							return recordInfo;
						}, id);
						var recordInfo = {
							entitySchemaName: this.entitySchema.name,
							entitySchemaCaption: this.entitySchema.caption,
							primaryColumnValue: this.currentEditElement.get(this.entitySchema.primaryColumnName),
							primaryDisplayColumnValue:
								this.currentEditElement.get(this.entitySchema.primaryDisplayColumnName)
						};
						var params = sandbox.publish("GetHistoryState");
						params.state.foldersManagerOpened = true;
						sandbox.publish("PushHistoryState", {
							stateObj: params.state,
							hash: params.hash.historyState,
							silent: true
						});
						sandbox.loadModule("Rights", {
							renderTo: "centerPanel",
							id: id,
							keepAlive: true
						});
					},
					changeGridMode: function(multiSelect, callback) {
						this.set("administratedButtonVisible", this.entitySchema.administratedByRecords && !multiSelect);
						this.set("multiSelect", multiSelect);
						this.set("selectEnabled", multiSelect);
						this.clear();
						this.load(true, callback);
						this.showFolderInfo();
					},
					processMoveFolders: function(folders, callback) {
						var filters = Ext.create("Terrasoft.FilterGroup");
						var primaryDisplayColumn = this.entitySchema.primaryDisplayColumn;
						var moveFilter = Terrasoft.createColumnInFilterWithParameters(this.entitySchema.primaryColumnName,
							folders);
						moveFilter.comparisonType = Terrasoft.ComparisonType.NOT_EQUAL;
						filters.addItem(moveFilter);

						var rootEmailFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL,
								"FolderType", ConfigurationConstants.Folder.Type.RootEmail);
						filters.addItem(rootEmailFilter);

						if (!this.get("UseStaticFolders")) {
							var typeFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL,
								"FolderType", ConfigurationConstants.Folder.Type.General);
							filters.addItem(typeFilter);
						}
						var handler = function(args) {
							var collection = args.selectedRows.collection;
							var parentId = null;
							if (collection.length > 0) {
								var parent = collection.items[0];
								parentId = parent.value;
							}
							this.changeFolderParent(folders, parentId, callback);
						};
						var columnsConfig = [{
							cols: 24,
							key: [{
								name: {bindTo: "FolderType"},
								type: Terrasoft.GridKeyType.ICON16LISTED
							}, {
								name: {bindTo: "Name"}
							}]
						}];
						var captionsConfig = [{
							cols: 24,
							columnName: primaryDisplayColumn.name,
							name: primaryDisplayColumn.caption,
							sortColumnDirection: Terrasoft.core.enums.OrderDirection.ASC
						}];
						var config = {
							entitySchemaName: this.entitySchema.name,
							type: "listed",
							useListedLookupImages: true,
							multiSelect: false,
							columnName: this.entitySchema.primaryDisplayColumnName,
							searchValue: null,
							filters: filters,
							columns: ["Name", "FolderType", "Parent"],
							hierarchical: true,
							hierarchicalColumnName: "Parent",
							actionsButtonVisible: false,
							columnsConfig: [{
								cols: 24,
								key: [{
									name: {bindTo: "FolderType"},
									type: Terrasoft.GridKeyType.ICON16LISTED
								}, {
									name: {bindTo: "Name"}
								}]
							}],
							columnsSettingsProfile: {
								isTiled: false,
								listedColumnsConfig: Ext.encode(columnsConfig),
								captionsConfig: Ext.encode(captionsConfig)
							},
							virtualRootItem: this.allFoldersItem,
							virtualRootItemValues: this.allFoldersRecordItem
						};
						LookupUtilities.Open(sandbox, config, handler, this);
					},
					changeFolderParent: function(folders, parentId, callback) {
						var mainViewModel = this;
						var folderId = folders.pop();
						var allFoldersId = config.allFoldersRecordItem.value;
						var favoriteRootFolderId = config.favoriteRootRecordItem.value;
						if (folderId === parentId || !parentId || parentId.value === allFoldersId ||
								parentId.value === favoriteRootFolderId) {
							parentId = null;
						}
						var folder = Ext.create("Terrasoft.BaseViewModel", getFolderViewModelConfig(this.entitySchema));
						folder.loadEntity(folderId, function() {
							this.set("Parent", {value: parentId});
							if (folders.length) {
								this.saveEntity(function(result) {
									if (result.success) {
										this.changeFolderParent(folders, parentId, callback);
									} else {
										this.showInformationDialog(result.errorInfo.message);
									}
								}, mainViewModel);
							} else {
								this.saveEntity(function(result) {
									if (result.success) {
										this.set("activeRow", null);
										if (callback) {
											callback.call(mainViewModel);
										}
									} else {
										this.showInformationDialog(result.errorInfo.message);
									}
								}, mainViewModel);
							}
						});
					},
					/**
					 * Удаляет групу.
					 */
					onDeleteAccept: function onDeleteAccept() {
						var activeRow = this.get("activeRow");
						var selectedRows = this.get("selectedRows") || [];
						if (selectedRows.length || activeRow) {
							var selectedValues = selectedRows.length ? selectedRows : [activeRow];
							var actualSelectedValues = [];
							Terrasoft.each(selectedValues, function(currentRecordId) {
								var actualFolderId = this.getActualFolderId(currentRecordId);
								actualSelectedValues.push(actualFolderId);
								deleteFromFavoritesSilent(actualFolderId, this);
							}, this);
							var query = Ext.create("Terrasoft.DeleteQuery", {
								rootSchema: this.entitySchema
							});
							var filter = query.createColumnInFilterWithParameters(this.entitySchema.primaryColumnName,
								actualSelectedValues);
							query.filters.addItem(filter);
							query.execute(function(response) {
								if (response.success) {
									this.onDeleted();
								} else {
									this.showInformationDialog(ResponseExceptionHelper.GetExceptionMessage(response.errorInfo));
								}
							}, this);
						}
					},
					getGridRecordByItemValues: function(rowConfig, itemValues) {
						var gridRecord = Ext.create("Terrasoft.BaseViewModel", {
							entitySchema: config.entitySchema,
							rowConfig: rowConfig,
							values: itemValues,
							isNew: false,
							isDeleted: false,
							methods: {}
						});
						return gridRecord;
					},
					renameFolder: function() {
						var caption = null;
						var modifyFolderFunc = config.modifyFolderFunc;
						var controls = {
							name: {
								dataValueType: Terrasoft.DataValueType.TEXT,
								caption: this.entitySchema.primaryDisplayColumn.caption,
								value: this.currentEditElement.get(this.entitySchema.primaryDisplayColumnName)
							}
						};
						if (Ext.isFunction(modifyFolderFunc)) {
							controls = modifyFolderFunc.call(this, "get");
						}
						var currentEditElement = this.currentEditElement;
						if (currentEditElement.isNew) {
							caption = (currentEditElement.get("FolderType").value ===
								ConfigurationConstants.Folder.Type.Search) ?
									resources.localizableStrings.NewSearchFolderInputBoxCaption
									: resources.localizableStrings.NewGeneralFolderInputBoxCaption;
						} else {
							caption = (currentEditElement.get("FolderType").value ===
								ConfigurationConstants.Folder.Type.Search) ?
								resources.localizableStrings.SearchFolderInputBoxCaption
								: resources.localizableStrings.GeneralFolderInputBoxCaption;
						}
						Terrasoft.utils.inputBox(
							caption,
							nameInputBoxHandler,
							["ok", "cancel"],
							this,
							controls,
							{
								defaultButton: 0,
								classes: {
									coverClass: ["cover-calss1", "cover-calss2"],
									captionClass: ["caption-calss1", "caption-calss2"]
								}
							}
						);
					},
					closeFolderManager: function() {
						var sectionFilterModuleId = sandbox.publish("GetSectionFilterModuleId");
						if (!Ext.isEmpty(this.currentEditElement)) {
							this.applyFolderFilters(this.currentEditElement.get("Id"), true);
						}
						sandbox.publish("HideFolderTree", null, [sectionFilterModuleId]);
					},
					getGridColumnValue: function(rowId, columnName) {
						var result = null;
						var gridData = this.get("gridData");
						if (!Ext.isEmpty(gridData) && rowId) {
							var rowData = gridData.get(rowId);
							if (!Ext.isEmpty(rowData)) {
								result = rowData.get(columnName);
							}
						}
						return result;
					},
					getActualFolderId: function(rowId) {
						return this.getGridColumnValue(rowId, "actualFolderId");
					},
					getActiveRow: function() {
						return this.get("activeRow");
					},
					getActiveRowParent: function() {
						var activeRow = this.getActiveRow();
						return this.getGridColumnValue(activeRow, "Parent");
					},
					applyFolderFilters: function(rowId, addToQuickFilter) {
						var allFoldersId = config.allFoldersRecordItem.value;
						var favoriteRootFolderId = config.favoriteRootRecordItem.value;
						var filtersGroup = Terrasoft.createFilterGroup();
						var currentItem = this.currentEditElement;
						var sectionFilterModuleId = sandbox.publish("GetSectionFilterModuleId");
						var currentItemType = currentItem.get("FolderType");
						var resultFiltersObject = null;
						if (!this.currentEditElement) {
							return;
						}
						if (!Ext.isEmpty(rowId) && (rowId !== allFoldersId) && (rowId !== favoriteRootFolderId)) {
							if (currentItem.get("FolderType").value === ConfigurationConstants.Folder.Type.Search) {
								var searchData = currentItem.get("SearchData");
								if (!Ext.isEmpty(searchData)) {
									filtersGroup.add("filterDynamicFolder", Terrasoft.deserialize(searchData));
								}
							} else {
								var entityColumnName = config.entityColumnNameInFolderEntity;
								var inFolderSchemaName = config.inFolderEntitySchemaName;
								filtersGroup.add("filterStaticFolder", Terrasoft.createColumnInFilterWithParameters(
									Ext.String.format("[{0}:{1}:Id].Folder", inFolderSchemaName, entityColumnName),
									[rowId]));
							}
							var serializationInfo = filtersGroup.getDefSerializationInfo();
							serializationInfo.serializeFilterManagerInfo = true;
							resultFiltersObject = {
								value: currentItem.get("Id"),
								displayValue: currentItem.get("Name"),
								filter: filtersGroup.serialize(serializationInfo),
								folder: currentItem,
								folderType: currentItem.get("FolderType"),
								sectionEntitySchemaName: config.sectionEntitySchema.name
							};
						}
						var folderMenuItemConfig = null;
						if (currentItemType && currentItemType.value === ConfigurationConstants.Folder.Type.Search) {
							folderMenuItemConfig = {
								value: currentItem.get("Id"),
								displayValue: currentItem.get("Name"),
								folderType: currentItemType,
								folder: currentItem,
								filter: Terrasoft.deserialize(currentItem.get("SearchData")),
								sectionEntityScheamName: config.sectionEntitySchema.name
							};
						}
						sandbox.publish("UpdateCustomFilterMenu", folderMenuItemConfig, [sectionFilterModuleId]);
						if (addToQuickFilter) {
							sandbox.publish("ResultFolderFilter", resultFiltersObject, [sandbox.id]);
						}
					}
				}
			};

			function loadSection(selectedFolders) {
				var newState = {
					filterState: {
						folderFilterState: selectedFolders || []
					}
				};
				var url = "SectionModule/" + config.loadSection + "/";
				sandbox.publish("PushHistoryState", { hash: url, stateObj: newState });
			}

			function nameInputBoxHandler(returnCode, controlData) {
				var modifyFolderFunc = config.modifyFolderFunc;
				if (returnCode === "ok" && controlData.name.value) {
					this.currentEditElement.set(this.entitySchema.primaryDisplayColumnName,
						controlData.name.value);

					if (modifyFolderFunc != null && typeof(modifyFolderFunc) === "function") {
						var modifyColumn = config.modifyFolderFunc.call(viewModelConfig, "set", controlData);
						if ((modifyColumn != null) && (modifyColumn.columnName != null)) {
							this.currentEditElement.set(modifyColumn.columnName, modifyColumn.columnValue);
						}
					}
					this.setActiveRow(this.currentEditElement.get(this.entitySchema.primaryColumnName));
					this.currentEditElement.saveButton();
				}
				else {
					this.currentEditElement.cancelButton();
				}
			}

			return viewModelConfig;
		}

		function initAllFoldersSelect(scope) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchema: scope.entitySchema
			});
			select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
			var column = select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "Name");
			column.orderDirection = Terrasoft.OrderDirection.ASC;
			column.orderPosition = 0;
			select.addColumn("Parent");
			select.addColumn("FolderType");
			if (!scope.get("UseStaticFolders")) {
				select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL,
					"FolderType", ConfigurationConstants.Folder.Type.General));
			}
			select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL,
				"FolderType", ConfigurationConstants.Folder.Type.RootEmail));

			select.skipRowCount = scope.pageNumber * scope.pageRowsCount;
			select.rowCount = -1;
			return select;
		}

		function initFavoriteFoldersSelect(scope) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "FolderFavorite"
			});
			select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
			select.addColumn("FolderId");
			var filters = Ext.create("Terrasoft.FilterGroup");
			filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "SysAdminUnit",
				Terrasoft.SysValue.CURRENT_USER.value));
			filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"FolderEntitySchemaUId", scope.entitySchema.uId));
			select.filters = filters;
			return select;
		}

		function initFolderTypesSelect() {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "FolderType"
			});
			select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
			select.addColumn("Name");
			select.addColumn("Image");
			var filters = Ext.create("Terrasoft.FilterGroup");
			var groupFilters = Ext.create("Terrasoft.FilterGroup");
			groupFilters.logicalOperation = Terrasoft.LogicalOperatorType.OR;
			groupFilters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"Id", ConfigurationConstants.Folder.Type.General));
			groupFilters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"Id", ConfigurationConstants.Folder.Type.Favorite));
			filters.addItem(groupFilters);
			select.filters = filters;
			return select;
		}

		function initializeRootFolders(rows, viewModel) {
			Terrasoft.each(rows, function(folderTypeItem) {
				var itemValues = {
					value: folderTypeItem.Id,
					displayValue: folderTypeItem.Name,
					primaryImageValue: folderTypeItem.Image.value
				};
				if (folderTypeItem.Id === ConfigurationConstants.Folder.Type.General) {
					viewModel.allFoldersRecordValues = {
						Id: viewModel.allFoldersRecordItem.value,
						Name: viewModel.allFoldersRecordItem.displayValue,
						Parent: "",
						FolderType: itemValues
					};
				} else {
					viewModel.favoriteRootRecordValues = {
						Id: viewModel.favoriteRootRecordItem.value,
						Name: viewModel.favoriteRootRecordItem.displayValue,
						Parent: "",
						FolderType: itemValues
					};
				}
			});
		}

		function prepareAllFolders(rows, rowConfig, scope, resultItems) {
			Terrasoft.each(rows, function(rowItem) {
				var gridItem = scope.getGridRecordByItemValues(rowConfig, rowItem);
				var actualFolderId = gridItem.get("Id");
				if (!gridItem.get("Parent")) {
					gridItem.set("Parent", scope.allFoldersRecordItem);
				}
				gridItem.set("actualFolderId", actualFolderId);
				gridItem.set("isInFavorites", false);
				gridItem.set("administratedByRecords", gridItem.entitySchema.administratedByRecords);
				resultItems[actualFolderId] = gridItem;
			}, scope);
		}

		function prepareFavoriteFoldersAndGetSelected(rows, rowConfig, scope, resultItems) {
			var currentFavoriteRecordId = null;
			Terrasoft.each(rows, function(rowItem) {
				var folderId = rowItem.FolderId;
				var folderItem = resultItems[folderId];
				if (!Ext.isEmpty(folderItem)) {
					var newId = Terrasoft.generateGUID();
					var newItem = scope.getGridRecordByItemValues(rowConfig, folderItem.values);
					newItem.set("actualFolderId", folderId);
					newItem.set("isInFavorites", true);
					folderItem.set("isInFavorites", true);
					newItem.set("Id", newId);
					newItem.set("Parent", scope.favoriteRootRecordItem);
					resultItems[newId] = newItem;
					if ((scope.currentEditElement.get("Id") === folderId) && scope.get("isFavoriteSelected")) {
						scope.set("activeRow", null);
						currentFavoriteRecordId = newId;
					}
				}
			}, scope);
			return currentFavoriteRecordId;
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
			var batch = Ext.create("Terrasoft.BatchQuery");
			var mainSelect = initAllFoldersSelect(this);
			batch.add(mainSelect);
			var favoritesSelect = initFavoriteFoldersSelect(this);
			batch.add(favoritesSelect);
			if (!this.allFoldersRecordValues || !this.favoriteRootRecordValues) {
				var folderTypesSelect = initFolderTypesSelect();
				batch.add(folderTypesSelect);
			}
			batch.execute(function(response) {
				if (response && response.success) {
					var items = {};
					var allFolders = null;
					var rowConfig = null;
					var favoriteFolders = null;
					if (!response.queryResults) {
						return;
					}
					Terrasoft.each(response.queryResults, function(item) {
						if (!Ext.isEmpty(item.rowConfig.FolderId)) {
							favoriteFolders = item;
						} else
						if (!Ext.isEmpty(item.rowConfig.Image)) {
							initializeRootFolders(item.rows, this);
						} else {
							allFolders = item;
							rowConfig = item.rowConfig;
						}
					}, this);
					prepareAllFolders(allFolders.rows, rowConfig, this, items);
					var currentFavoriteRecordId =
						prepareFavoriteFoldersAndGetSelected(favoriteFolders.rows, rowConfig, this, items);
					var allFoldersItem = this.getGridRecordByItemValues(rowConfig, this.allFoldersRecordValues);
					var favoriteRootItem = this.getGridRecordByItemValues(rowConfig, this.favoriteRootRecordValues);
					this.allFoldersItem = allFoldersItem;
					items[favoriteRootItem.get("Id")] = favoriteRootItem;
					items[allFoldersItem.get("Id")] = allFoldersItem;

					this.set("expandHierarchyLevels", [favoriteRootItem.get("Id")]);
					this.set("expandHierarchyLevels", [allFoldersItem.get("Id")]);
					if (setExpandedLevels) {
						var selectedRows = this.get("currentFolders");
						if (Ext.isEmpty(selectedRows)) {
							var currentFilter = this.get("activeRow");
							selectedRows = currentFilter ? [currentFilter] : this.get("selectedRows");
						}
						//this.expandToSelectedItems(selectedRows);
					}
					this.set("activeRow", null);
					var collection = this.get("gridData");
					collection.clear();
					var activeRow = currentFavoriteRecordId || this.get("activeRowToSet");
					if (activeRow) {
						var itemsCollection = new Terrasoft.Collection();
						itemsCollection.loadAll(items);
						this.expandToSelectedItems([activeRow], itemsCollection);
					}
					collection.loadAll(items);
					this.set("activeRow", activeRow);
					if (Ext.isFunction(callback)) {
						callback.call(scope);
					}
				}
			}, this);
		}

		function expandToSelectedItems(selectedRows, items) {
			var expandLevels = [];
			if (!items) {
				items = this.get("gridData");
			}
			if (selectedRows) {
				Terrasoft.each(selectedRows, function(selectedRow) {
					fillExpandedLevels(selectedRow, items, expandLevels);
				});
			}
			this.set("expandHierarchyLevels", expandLevels);
		}

		function fillExpandedLevels(selectedRow, items, expandedLevels) {
			if (items.contains(selectedRow)) {
				var parent = items.get(selectedRow).get("Parent");
				if (parent && !Terrasoft.contains(expandedLevels, parent.value)) {
					expandedLevels.push(parent.value);
					fillExpandedLevels(parent.value, items, expandedLevels);
				}
			}
		}

		function onExpandHierarchyLevels() {
			this.set("isGridDoubleClickAllowed", false);
		}

		function selectButton() {
			this.renameFolder();
		}

		function cancelButton() {
			this.cancelSelecting();
		}

		function deleteButton() {
			var multiSelect = this.get("multiSelect");
			var selectedRows = this.get("selectedRows");
			var activeRow = this.get("activeRow");
			if (multiSelect && selectedRows && selectedRows.length > 0 || !multiSelect && activeRow) {
				this.showConfirmationDialog(resources.localizableStrings.OnDeleteWarning, function(returnCode) {
					if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
						this.onDeleteAccept();
					}
				}, ["yes", "no"]);
			}
		}

		function dblClickGrid(id) {
			if (!this.get("isGridDoubleClickAllowed")) {
				this.set("isGridDoubleClickAllowed", true);
				return;
			}
			if (id && this.getIsFolderSelected() && !this.get("multiSelect")) {
				this.set("activeRow", id);
				this.currentEditElement.loadEntity(id, function() {
					this.renameFolder();
				}, this);
			}
		}

		/**
		 * Обновляет дереко груп после удаления.
		 */
		function onDeleted() {
			this.set("activeRow", null);
			this.setActiveRow(this.allFoldersRecordValues.Id);
			this.set("selectedRows", []);
			this.load(true, Ext.emptyFn, this);
		}

		/**
		 * Очищает коллекцию реестра дерева груп.
		 */
		function clear() {
			this.set("activeRow", null);
			var collection = this.get("gridData");
			collection.clear();
			this.pageNumber = 0;
		}

		function getFolderViewModelConfig(entitySchema, mainViewModel) {
			var viewModelConfig = {
				entitySchema: entitySchema,
				columns: {},
				values: {
					editMode: false
				},
				methods: {
					createNewFolder: function(folderType, parent) {
						this.isNew = true;
						var validationConfig = this.validationConfig;
						this.validationConfig = null;
						Terrasoft.each(this.columns, function(column) {
							this.set(column.name, null);
						}, this);
						if ((parent === mainViewModel.allFoldersRecordItem.value) ||
								(parent === mainViewModel.favoriteRootRecordItem.value)) {
							parent = null;
						}
						this.validationConfig = validationConfig;
						this.setDefaultValues();
						this.set("Parent", {value: parent});
						this.set("FolderType", {value: folderType});
						this.set("editMode", true);
					},
					updateCurrentSelectedElement: function(result) {
						if (result.success) {
							mainViewModel.load(false, Ext.emptyFn, this);
							this.set("editMode", false);
						}
						else {
							this.showInformationDialog(result.errorInfo.message);
						}
					},
					saveButton: function() {
						if (this.isNew) {
							this.wasNew = true;
							var parent = this.get("Parent");
							if (parent && parent.value) {
								var expandedLevels = mainViewModel.get("expandHierarchyLevels").slice(0);
								if (!Terrasoft.contains(expandedLevels, parent.value)) {
									expandedLevels.push(parent.value);
								}
								mainViewModel.set("expandHierarchyLevels", expandedLevels);
							}
							var folderType = this.get("FolderType");
							if (folderType && folderType.value === ConfigurationConstants.Folder.Type.Search) {
								var filters = Ext.create("Terrasoft.FilterGroup");
								var serializationInfo = filters.getDefSerializationInfo();
								serializationInfo.serializeFilterManagerInfo = true;
								this.set("SearchData", filters.serialize(serializationInfo));
							}
						}
						this.saveEntity(this.updateCurrentSelectedElement);
					},
					saveLookupFolder: function(serializedFilters, callback) {
						if (this.isNew) {
							this.wasNew = true;
							var parent = this.get("Parent");
							if (parent && parent.value) {
								var expandedLevels = mainViewModel.get("expandHierarchyLevels").slice(0);
								if (!Terrasoft.contains(expandedLevels, parent.value)) {
									expandedLevels.push(parent.value);
								}
								mainViewModel.set("expandHierarchyLevels", expandedLevels);
							}
						}
						var folderType = this.get("FolderType");
						if (folderType && folderType.value === ConfigurationConstants.Folder.Type.Search) {
							this.set("SearchData", serializedFilters);
						}
						this.saveEntity(function(result) {
							if (!result.success) {
								this.showInformationDialog(result.errorInfo.message);
							}
						});
					},
					cancelButton: function() {
						if (this.isNew) {
							var parent = this.get("Parent");
							if (parent && parent.value) {
								mainViewModel.showFolderInfo(parent.value);
							} else {
								mainViewModel.showFolderInfo(mainViewModel.allFoldersRecordItem.value);
							}
						} else {
							this.set("editMode", false);
						}
					},
					goToEditMode: function() {
						this.set("editMode", true);
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

		function setActiveRow(rowId) {
			this.set("activeRowToSet", rowId);
		}

		function moveFolder() {
			var activeRow = this.get("activeRow");
			if (activeRow) {
				activeRow = this.getActualFolderId(activeRow);
			}
			var selectedRows = this.get("selectedRows");
			if (activeRow || (selectedRows && selectedRows.length > 0)) {
				this.set("currentFolders", (selectedRows && selectedRows.length) ? selectedRows : [activeRow]);
				this.previousModeMultiSelect = this.get("multiSelect");
			}
			var folders = this.get("currentFolders") || [];
			this.processMoveFolders(folders, function() {
				this.load(false);
			});
		}

		function changeMultiSelectMode() {
			if (this.get("enableMultiSelect")) {
				var multiSelect = !this.get("multiSelect");
				this.set("activeRow", null);
				this.changeGridMode(multiSelect);
			}
		}

		function showFolderInfo(rowId) {
			if (!rowId) {
				rowId = this.get("activeRow");
			}
			if (rowId === this.favoriteRootRecordItem.value) {
				this.set("activeRow", null);
			}
			if (!this.get("isGridDoubleClickAllowed")) {
				this.set("isGridDoubleClickAllowed", true);
			}
			var parentRow = null;
			var grid = Ext.getCmp("foldersGrid");
			if (!Ext.isEmpty(rowId)) {
				parentRow = this.getGridColumnValue(rowId, "Parent");
				this.set("isFavoriteSelected", (parentRow === this.favoriteRootRecordItem));
				grid.removeRowActions(rowId);
			}
			this.set("administratedButtonVisible",
				this.entitySchema.administratedByRecords && !Ext.isEmpty(parentRow) &&
					!this.get("multiSelect"));
			if (rowId && !this.get("multiSelect")) {
				if (this.currentEditElement) {
					var actualFolderId = this.getActualFolderId(rowId);
					if (actualFolderId) {
						this.currentEditElement.loadEntity(actualFolderId, function() {
							this.applyFolderFilters(this.currentEditElement.get("Id"), true);
						}, this);
					} else
					if ((rowId === this.favoriteRootRecordItem.value) || (rowId === this.allFoldersRecordItem.value)) {
						this.currentEditElement.set("Id", null);
						this.currentEditElement.set("Name", null);
						this.currentEditElement.set("FolderType", null);
						this.applyFolderFilters(rowId, true);
					}
				}
				if (rowId !== this.favoriteRootRecordItem.value && rowId !== this.allFoldersRecordItem.value) {
					grid.addRowActions(rowId);
				}
				this.set("canRename", !Ext.isEmpty(parentRow));
				this.set("selectEnabled", !Ext.isEmpty(parentRow));
			} else {
				this.set("canRename", false);
				this.set("selectEnabled", (rowId && !Ext.isEmpty(parentRow)));
			}
		}

		function onActiveRowAction(tag, rowId) {
			switch (tag) {
				case "favorite":
					this.doFavoriteFolderAction();
					break;
				case "editFilter":
					this.editFolderFilters();
					break;
				case "moveFolder":
					this.moveFolder();
					break;
				case "renameFolder":
					this.renameFolder();
					break;
				case "deleteButton":
					this.deleteButton();
					break;
				case "editRights":
					this.editRights();
					break;
			}
		}

		/**
		 * Возвращает запрос на удаление экземпляра избранной групы.
		 * @param {Guid} selectedId Идентификатор групы.
		 * @param {Object} scope Контекст.
		 * @return {Terrasoft.DeleteQuery|*} Запрос на удаление экземпляра избранной групы.
		 */
		function getDeleteFromFavoritesESQ(selectedId, scope) {
			var deleteESQ = Ext.create("Terrasoft.DeleteQuery", {
				rootSchemaName: "FolderFavorite"
			});
			var filters = Ext.create("Terrasoft.FilterGroup");
			filters.addItem(deleteESQ.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "SysAdminUnit",
				Terrasoft.SysValue.CURRENT_USER.value));
			filters.addItem(deleteESQ.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "FolderId",
				selectedId));
			filters.addItem(deleteESQ.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"FolderEntitySchemaUId", scope.entitySchema.uId));
			deleteESQ.filters = filters;
			return deleteESQ;
		}

		/**
		 * Удаляет групу из избранных без обновления дерева груп.
		 * @param {Guid} selectedId Идентификатор групы.
		 * @param {Object} scope Контекст.
		 */
		function deleteFromFavoritesSilent(selectedId, scope) {
			var del = getDeleteFromFavoritesESQ(selectedId, scope);
			del.execute(function(response) {
				if (response && response.success) {
					scope.SendUpdateFavoritesMenu(scope.entitySchema.name, scope.entitySchema.uId);
				}
			}, this);
		}

		/**
		 * Удаляет групу из избранных.
		 * @param {Guid} selectedId Идентификатор групы.
		 * @param {Object} scope Контекст.
		 * @param {bool|*} keepActive Флаг сброса текущей активной групы.
		 */
		function deleteFromFavorites(selectedId, scope, keepActive) {
			var del = getDeleteFromFavoritesESQ(selectedId, scope);
			del.execute(function(response) {
				if (response && response.success) {
					if (!keepActive) {
						scope.set("activeRow", null);
					}
					scope.clear();
					scope.load(true);
					scope.SendUpdateFavoritesMenu(scope.entitySchema.name, scope.entitySchema.uId);
				}
			}, this);
		}

		return {
			generate: generate,
			getFolderViewModelConfig: getFolderViewModelConfig
		};
	});