define("SectionViewModelGenerator", ["ext-base", "terrasoft", "SectionViewModelGeneratorResources",
	"ConfigurationEnums", "ConfigurationConstants", "SysModuleAnalyticsReport", "ReportUtilities",
	"LocalizationUtilities", "LookupUtilities", "GridUtilities", "DataUtilities", "performancecountermanager",
	"RightUtilities", "MaskHelper", "GridProfileHelper", "EmailHelper"],
	function(Ext, Terrasoft, resources, ConfigurationEnums, ConfigurationConstants, SysModuleAnalyticsReport,
		ReportUtilities, LocalizationUtilities, LookupUtilities, GridUtilities, DataUtilities, performanceCounterManager,
		RightUtilities, MaskHelper, GridProfileHelper, EmailHelper) {
		var entitySchema;
		var previousChart;
		var previousReport;
		var sectionFilters;
		var generateReportInfo;
		var analyticData = {};
		var activeRowActions;

		function getCardSchemaName(config) {
			var cardSchemaName = (!config) ? (this.entitySchema.name + "Page") : config.cardSchema;
			cardSchemaName += "V2";
			var activeRowId = this.get("activeRow");
			var gridData = this.get("gridData");
			var configAttribute = (!config) ? null : config.attribute;
			if (Ext.isEmpty(activeRowId) || Ext.isEmpty(gridData) ||
				Ext.isEmpty(gridData.collection) || Ext.isEmpty(configAttribute)) {
				return cardSchemaName;
			}
			var filtredRows = gridData.collection.items.filter(
				function(item) {
					return (item.values.Id === activeRowId);
				});
			if (filtredRows.length < 1) {
				return cardSchemaName;
			}
			var pageTypeId = filtredRows[0].values[configAttribute].value;
			var pageObjects = config.pages.filter(
				function(item) {
					return (item.UId === pageTypeId);
				});
			if (Ext.isEmpty(pageObjects) || Ext.isEmpty(pageObjects[0])) {
				return cardSchemaName;
			}
			var pageObject = pageObjects[0];
			var pageObjectCardSchema = pageObject.cardSchema;
			return (!Ext.isEmpty(pageObjectCardSchema)) ? pageObjectCardSchema : cardSchemaName;
		}

		function getTypeColumnUId(config) {
			var cardSchemaName = (!config) ? (this.entitySchema.name + "Page") : config.cardSchema;
			cardSchemaName += "V2";
			var activeRowId = this.get("activeRow");
			var gridData = this.get("gridData");
			var configAttribute = (!config) ? null : config.attribute;
			if (Ext.isEmpty(activeRowId) || Ext.isEmpty(gridData) ||
				Ext.isEmpty(gridData.collection) || Ext.isEmpty(configAttribute)) {
				return cardSchemaName;
			}
			var filtredRows = gridData.collection.items.filter(
				function(item) {
					return (item.values.Id === activeRowId);
				});
			if (filtredRows.length < 1) {
				return cardSchemaName;
			}
			var pageTypeId = filtredRows[0].values[configAttribute].value;
			return pageTypeId;
		}

		function getSectionCode(scope) {
			return (scope.code) ? scope.code : scope.name.replace("Section", "");
		}

		function getFullViewModelSchema(sourceViewModelSchema) {
			var viewModelSchema = Terrasoft.utils.common.deepClone(sourceViewModelSchema);
			var baseSchemaMethods = {};
			baseSchemaMethods.checkExportGrid = function(callback) {
				RightUtilities.checkCanExecuteOperation({
					operation: "CanExportGrid"
				}, callback);
			};
			viewModelSchema.schema.gridPanel = [
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: "activeRow",
					dataValueType: Terrasoft.DataValueType.LOOKUP
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: "reportActiveRow",
					dataValueType: Terrasoft.DataValueType.LOOKUP
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: "analyticsChartActiveRow",
					dataValueType: Terrasoft.DataValueType.LOOKUP
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: "gridData",
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					isCollection: true
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: "analyticsGridData",
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					isCollection: true
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: "reportGridData",
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					isCollection: true
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: "selectedRows",
					dataValueType: Terrasoft.DataValueType.LOOKUP
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: "canLoadData",
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: "canManageAnalytics",
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				}
			];
			baseSchemaMethods.load = function(tabName, event) {
				if (tabName === "analytics") {
					this.getCurrentModuleCharts(this.entitySchema.name);
					this.getCurrentModuleReports(this.entitySchema.name);
					return;
				}
				if (!this.esqConfig) {
					this.esqConfig = getEsqConfig(viewModelSchema);
				}
				this.set("canLoadData", true);
				this.set("gridEmpty", false);
				var select = this.getSelect(tabName, event);
				if (!Ext.isEmpty(select)) {
					this.loadSelect(select, tabName, event);
				}
			};
			baseSchemaMethods.loadNext = function() {
				this.load();
			};
			baseSchemaMethods.updateGridColumnsConfig = function(columnsConfig) {
				if (columnsConfig) {
					var grid = Ext.getCmp("section-grid");
					for (var i = 0; i < columnsConfig.length; i++) {
						for (var j = 0; j < columnsConfig[i].length; j++) {
							columnsConfig[i][j].link = grid.columnsConfig[i][j].link;
						}
					}
					grid.columnsConfig = columnsConfig;
					if (grid.rendered) {
						grid.reRender();
					}
				}
			};
			baseSchemaMethods.getSelect = function(tabName, event) {
				var columnsSettingsProfile = this.getColumnsProfile();
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchema: this.entitySchema
				});
				var profileSortedColumns = {};
				var parameters = [select, columnsSettingsProfile, profileSortedColumns, tabName, event];
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
					this.modifyLinksQuery,
					function(select, columnsSettingsProfile, profileSortedColumns, tabName, event) {
						if (this.modifySelectQuery) {
							this.modifySelectQuery(select, tabName, event);
						}
					},
					this.initializePageable
				];
				Terrasoft.each(initSelectActions, function(action) {
					if (action && !Ext.isEmpty(this.parameters[0])) {
						action.apply(this.scope, this.parameters);
					}
				}, {scope: this, parameters: parameters});
				return select;
			};
			baseSchemaMethods.addSelectColumns = function(select) {
				select.addColumn(this.primaryColumnName);
				var columns = select.columns.collection;
				Terrasoft.each(this.loadedColumns, function(column, columnKey) {
					if (!columns.containsKey(columnKey)) {
						select.addColumn(column, columnKey);
					}
				});
				var moduleStructure = Terrasoft.configuration.ModuleStructure[getSectionCode(this)];
				var moduleStructureAttribute = (moduleStructure) ? moduleStructure.attribute : undefined;
				if (moduleStructureAttribute && !select.columns.find(moduleStructureAttribute)) {
					select.addColumn(moduleStructureAttribute);
				}
			};
			baseSchemaMethods.loadSelect = function(select) {
				this.sectionEntitySchemaQueryColumns = select.columns;
				this.set("lastSelectQuery", select);
				this.set("gridLoading", true);
				select.getEntityCollection(baseSchemaMethods.onLoadData, this);
			};
			baseSchemaMethods.isGridTiled = function() {
				var columnsSettingsProfile = this.getColumnsProfile();
				return columnsSettingsProfile.isTiled;
			};
			baseSchemaMethods.initializePageable = function(select) {
				this.pageRowsCount = this.esqConfig.pageRowsCount || (this.isGridTiled() ? 15 : 30);
				var pageRowsCount = this.pageRowsCount;
				var config = {
					collection: this.get("gridData"),
					primaryColumnName: this.entitySchema.primaryColumnName,
					schemaQueryColumns: this.sectionEntitySchemaQueryColumns,
					isPageable: !this.loadAll && (pageRowsCount > 0),
					rowCount: pageRowsCount,
					isClearGridData: this.isClearGridData
				};
				GridUtilities.initializePageableOptions(select, config);
			};
			baseSchemaMethods.getExtendedFilterDisplayValue = function(extendedFilter) {
				var comparisonTypeFlipped = Terrasoft.invert(Terrasoft.ComparisonType);
				var logicalOperatorTypeFlipped = Terrasoft.invert(Terrasoft.LogicalOperatorType);

				function getComparisonDisplayValue(comparison) {
					var comparisonType = comparisonTypeFlipped[comparison];
					return Terrasoft.Resources.ComparisonType[comparisonType];
				}

				function getLogicalOperatorDisplayvalue(operator) {
					var type = logicalOperatorTypeFlipped[operator];
					return Terrasoft.Resources.LogicalOperatorType[type];
				}

				var displayValue = "";

				function getDisplayValue(filter) {
					if (this.index++ > 0) {
						displayValue = displayValue + " " +
							getLogicalOperatorDisplayvalue(this.logicalOperation) + " ";
					}
					if (filter.collection) {
						if (filter.collection.length > 0) {
							var innerScope = {
								level: this.level + 1,
								index: 0,
								logicalOperation: filter.logicalOperation,
								getDisplayValue: this.getDisplayValue
							};
							if (this.level !== 0) {
								displayValue = displayValue + "(";
							}
							filter.each(getDisplayValue, innerScope);
							if (this.level !== 0) {
								displayValue = displayValue + ")";
							}
						}
					} else {
						displayValue = displayValue + filter.leftExpressionCaption + " " +
							getComparisonDisplayValue(filter.comparisonType) + " " +
							Terrasoft.getRightExpressionDisplayValue(filter);
					}
				}

				var scope = {
					level: 0,
					index: 0,
					logicalOperation: 0,
					getDisplayValue: getDisplayValue
				};
				scope.getDisplayValue(extendedFilter);
				return displayValue;
			};
			baseSchemaMethods.pushSectionTypeFilter = function(select) {
				var moduleConfig = Terrasoft.configuration.ModuleStructure[getSectionCode(this)];
				if (Ext.isEmpty(moduleConfig) || Ext.isEmpty(moduleConfig.attribute) ||
					Ext.isEmpty(moduleConfig.typeColumnValue)) {
					return;
				}
				select.filters.add("sectionFilter", select.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					moduleConfig.attribute,
					moduleConfig.typeColumnValue
				));
			};
			baseSchemaMethods.pushSelectFilters = function(select) {
				var quickFilter = this.getQuickFilter();
				var folderFilter = this.getFolderFilter();
				if (quickFilter && quickFilter.collection.length > 0) {
					select.filters.add("quickFilter", quickFilter);
				}
				if (folderFilter && folderFilter.length) {
					var filter = folderFilter[0];
					if (filter.folderType === ConfigurationConstants.Folder.Type.General) {
						this.set("deleteFromStaticFolderVisible", true);
						this.set("deleteFromStaticFolderCaption",
							resources.localizableStrings.DeleteFromStaticFolder + "'" + filter.displayValue + "'");
						this.set("folderFilterValue", filter.value);
					}
				} else {
					this.set("deleteFromStaticFolderVisible", false);
				}
				this.pushSectionTypeFilter(select);
				this.pushDemoUserFilter(select);
			};
			baseSchemaMethods.getAddButtonVisbility = function() {
				if (this.get("addButtonVisbility") !== undefined) {
					return this.get("addButtonVisbility");
				}
				return true;
			};
			baseSchemaMethods.pushDemoUserFilter = function(select) {
				var currentUser = this.getSysDefaultValue(Terrasoft.SystemValueType.CURRENT_USER);
				if (!Ext.isEmpty(currentUser) && !Ext.isEmpty(currentUser.displayValue) &&
					currentUser.displayValue.indexOf("Demo") >= 0) {
					var currentUserContact = this.getSysDefaultValue(
						Terrasoft.SystemValueType.CURRENT_USER_CONTACT);
					select.filters.add("demoFilter", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "CreatedBy", currentUserContact.value));
				}
			};
			baseSchemaMethods.initSelectSorting = GridProfileHelper.initSelectSorting;
			baseSchemaMethods.getLoadedColumnsWithSortedColumnsInitialization =
				GridProfileHelper.getLoadedColumnsWithSortedColumnsInitialization;
			baseSchemaMethods.loadByUId = function(uId) {
				this.set("gridLoading", false);
				this.set("gridEmpty", false);
				var sectionEntitySchemaQueryColumns = this.sectionEntitySchemaQueryColumns;
				if (sectionEntitySchemaQueryColumns) {
					var select = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchema: this.entitySchema
					});
					sectionEntitySchemaQueryColumns.collection.eachKey(function(key, column) {
						var columnInstance = GridUtilities.createLoadedColumnInstance(column, column.columnPath);
						select.addColumn(columnInstance, key);
					}, this);
					select.getEntity(uId, function(response) {
						if (response.success) {
							var entity = response.entity;
							if (Ext.isEmpty(entity)) {
								return;
							}
							var gridData = this.get("gridData");
							var keys = gridData.getKeys();
							if (keys.indexOf(uId) >= 0) {
								var itemViewModel = gridData.get(uId);
								sectionEntitySchemaQueryColumns.eachKey(function(columnName) {
									if (columnName !== this.entitySchema.primaryColumnName) {
										itemViewModel.set(columnName, entity.get(columnName));
									}
								}, this);
							} else {
								var collection = new Terrasoft.Collection();
								collection.add(uId, entity);
								this.modifyLinksItems(collection);
								if (Ext.isFunction(this.modifyItems)) {
									this.modifyItems.call(this, collection);
								}
								collection.loadAll(gridData);
								gridData.clear();
								gridData.loadAll(collection);
							}
						}
					}, this);
				}
			};
			baseSchemaMethods.modifyLinksQuery = function(esq) {
				var linksConfig = this.getLinksConfig();
				var columns = this.entitySchema.columns;
				var primaryDisplayColumnName = this.entitySchema.primaryDisplayColumnName;
				Terrasoft.each(linksConfig, function(columnName) {
					var column = columns[columnName];
					if (!column) {
						return;
					}
					var schemaName = (primaryDisplayColumnName === columnName) ?
						getSectionCode(this) : column.referenceSchemaName;
					var moduleStructure = Terrasoft.configuration.ModuleStructure[schemaName];
					if (!Ext.isEmpty(moduleStructure) && moduleStructure.attribute) {
						var addedColumnName = moduleStructure.attribute;
						if (primaryDisplayColumnName !== columnName) {
							addedColumnName = columnName + "." + addedColumnName;
						}
						if (Ext.isEmpty(esq.columns.find(addedColumnName))) {
							esq.addColumn(addedColumnName);
						}
					}
				}, this);
			};
			baseSchemaMethods.sortByKey = function(array, key) {
				return array.sort(function(a, b) {
					var x = a[key];
					var y = b[key];
					return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				});
			};
			baseSchemaMethods.getViews = function() {
				var moduleConfig = Terrasoft.configuration.ModuleStructure[getSectionCode(this)];
				var caption = this.entitySchema.caption;
				if (moduleConfig && moduleConfig.moduleHeader) {
					caption = moduleConfig.moduleHeader;
				}
				return [
					{
						name: "mainView",
						caption: caption
					},
					{
						name: "analytics",
						caption: resources.localizableStrings.AnaliticsTabCaption
					}
				];
			};
			baseSchemaMethods.addChart = function() {
				previousChart = null;
				var token = "ChartEdit/" + this.name + "/" + this.entitySchema.name;
				Terrasoft.Router.pushState(null, null, token);
			};
			baseSchemaMethods.editChart = function() {
				previousChart = null;
				var key = this.get("analyticsChartActiveRow");
				var token = "ChartEdit/" + this.name + "/" + key;
				Terrasoft.Router.pushState(null, null, token);
			};
			baseSchemaMethods.clearRightContainer = function() {
				var rightContainer = Ext.getCmp("rightContainer");
				rightContainer.items.clear();
				rightContainer.reRender();
			};
			baseSchemaMethods.deleteChart = function() {
				this.showConfirmationDialog(resources.localizableStrings.OnDeleteWarning,
					function(returnCode) {
						if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
							var activeRow = this.get("analyticsChartActiveRow");
							var query = Ext.create("Terrasoft.DeleteQuery", {
								//todo SysModuleAnalyticsChart deleted
								rootSchema: null
							});
							var filter = query.createColumnInFilterWithParameters("Id", [activeRow]);
							query.filters.addItem(filter);
							query.execute(function(response) {
								if (response.success) {
									var activeRowId = this.get("analyticsChartActiveRow");
									var collection = this.get("analyticsGridData");
									var filtredRows = collection.collection.items.filter(function(item) {
										return (item.values.Id === activeRowId);
									});
									if (filtredRows.length > 0) {
										collection.remove(filtredRows[0]);
									}
									this.set("analyticsChartActiveRow", null);
									this.clearRightContainer();
								}
							}, this);
						}
					}, ["yes", "no"]);
			};
			baseSchemaMethods.isChartSelected = function() {
				var selectedRow = this.get("analyticsChartActiveRow");
				return !Ext.isEmpty(selectedRow);
			};
			baseSchemaMethods.getAnalyticsActions = function() {
				return [
					{
						caption: resources.localizableStrings.AddChart,
						click: {
							bindTo: "addChart"
						}
					},
					{
						caption: resources.localizableStrings.EditChart,
						click: {
							bindTo: "editChart"
						},
						enabled: {
							bindTo: "isChartSelected"
						}
					},
					{
						caption: resources.localizableStrings.DeleteChart,
						click: {
							bindTo: "deleteChart"
						},
						enabled: {
							bindTo: "isChartSelected"
						}
					}
				];
			};
			baseSchemaMethods.addToStaticFolder = function() {
				var records = this.getSelectedItems();
				if (records && records.length) {
					var context = this;
					var entitySchemaName = this.entitySchema.name;
					var renderContainer = Ext.get("centerPanel");
					var lookUpHandler = function(args) {
						var selectedRows = args.selectedRows.getItems();
						if (!selectedRows.length) {
							return;
						}
						var folderName;
						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: entitySchemaName + "InFolder"
						});
						select.addColumn("Folder");
						var recordId = select.addColumn(entitySchemaName);
						select.filters.add("recordsFilter", Terrasoft.createColumnInFilterWithParameters(
							recordId.columnPath, records));
						select.getEntityCollection(function(result) {
							var existingRecords = [];
							if (result.success) {
								result.collection.each(function(item) {
									existingRecords.push({
										entityId: item.get(entitySchemaName).value,
										folderId: item.get("Folder").value
									});
								});
							}
							var bq = Ext.create("Terrasoft.BatchQuery");
							records.forEach(function(record) {
								selectedRows.forEach(function(folder) {
									folderName = folder.displayValue;
									if (!context.isObjectInArray(existingRecords, {
										entityId: record,
										folderId: folder.value
									})) {
										var insert = Ext.create("Terrasoft.InsertQuery", {
											rootSchemaName: entitySchemaName + "InFolder"
										});
										insert.setParameterValue("Folder", folder.value, Terrasoft.DataValueType.GUID);
										insert.setParameterValue(entitySchemaName, record,
											Terrasoft.DataValueType.GUID);
										bq.add(insert);
									}
								});
							});
							var addedCount = bq.queries.length;
							bq.execute(function(response) {
								if (response.success) {
									this.showInformationDialog(
										Ext.String.format(resources.localizableStrings.RecordsAddedToStaticFolder,
											folderName, addedCount), function() {},
										{ style: Terrasoft.MessageBoxStyles.BLUE }
									);
								}
							}, context);
							if (context.get("multiSelect")) {
								context.set("selectedRows", null);
							} else {
								context.set("activeRow", null);
							}
						});
					};
					var lookUpConfig = {
						entitySchemaName: entitySchemaName + "Folder",
						enableMultiSelect: false,
						filters: Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "FolderType",
							ConfigurationConstants.Folder.Type.General)
					};
					LookupUtilities.Open(this.getSandbox(), lookUpConfig, lookUpHandler, viewModelSchema,
						renderContainer);
				}
			};
			baseSchemaMethods.isObjectInArray = function(array, object) {
				if (!Ext.isArray(array)) {
					return false;
				}
				for (var i = 0; i < array.length; i++) {
					var element = array[i];
					var isEqual = true;
					for (var propertyName in element) {
						if (element[propertyName] !== object[propertyName]) {
							isEqual = false;
							break;
						}
					}
					if (isEqual) {
						return true;
					}
				}
				return false;
			};
			baseSchemaMethods.deleteFromStaticFolder = function() {
				var activeRow = this.get("activeRow");
				var selectedRows = this.get("selectedRows");
				var records = activeRow ? [activeRow] : selectedRows;
				if (records && records.length) {
					var entitySchemaName = this.entitySchema.name;
					var query = Ext.create("Terrasoft.DeleteQuery", { rootSchemaName: entitySchemaName + "InFolder" });
					query.filters.addItem(Terrasoft.createColumnInFilterWithParameters(entitySchemaName, records));
					query.filters.add(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Folder", this.get("folderFilterValue")));
					query.execute(function(respose) {
						if (respose && respose.success) {
							this.onDeleted(records);
						}
					}, this);
				}
			};
			baseSchemaMethods.sortColumn = function(index) {
				var columnsSettingsProfile = this.getColumnsProfile();
				GridProfileHelper.changeSorting.call(this, {
					index: index,
					columnsSettingsProfile: columnsSettingsProfile
				});
				this.isClearGridData = true;
				this.load(this.get("currentTabName"), "");
			};
			baseSchemaMethods.sortGrid = function(tag) {
				var columnsSettingsProfile = this.getColumnsProfile();
				GridProfileHelper.changeSorting.call(this, {
					tag: tag,
					columnsSettingsProfile: columnsSettingsProfile
				});
				this.isClearGridData = true;
				this.load(this.get("currentTabName"), "");
			};
			baseSchemaMethods.updateSortColumnsCaptions = function() {
				var columnsSettingsProfile = this.getColumnsProfile();
				GridProfileHelper.updateSortColumnsCaptions.call(this, columnsSettingsProfile);
			};
			baseSchemaMethods.switchGridMode = function() {
				var grid = Ext.getCmp("section-grid");
				if (grid.activeRowActions && grid.activeRowActions.length) {
					if (!activeRowActions) {
						activeRowActions = grid.activeRowActions;
					}
					grid.activeRowActions = [];
					this.set("activeRow", null);
				} else {
					grid.activeRowActions = activeRowActions;
					this.set("selectedRows", null);
				}
				this.set("multiSelect", !grid.multiSelect);
				this.set("gridModeCaption", grid.multiSelect ? resources.localizableStrings.MultiSelectTrue :
					resources.localizableStrings.MultiSelectFalse);
				var collection = new Terrasoft.BaseViewModelCollection();
				var gridData = this.get("gridData");
				collection.loadAll(gridData);
				this.get("gridData").clear();
				this.get("gridData").loadAll(collection);
			};
			baseSchemaMethods.getActions = function() {
				var actionsButtonConfig = [];
				actionsButtonConfig.push({
					caption: resources.localizableStrings.SortCaption,
					menu: {
						items: []
					}
				});
				var columnsSettingsProfile = this.getColumnsProfile();
				var columnsSettings = columnsSettingsProfile.isTiled ?
					columnsSettingsProfile.tiledColumnsConfig :
					columnsSettingsProfile.listedColumnsConfig;
				if (columnsSettings) {
					columnsSettings = Ext.decode(columnsSettings);
				}
				if (columnsSettings) {
					for (var i = 0; i < columnsSettings.length; i++) {
						var row = columnsSettingsProfile.isTiled ? columnsSettings[i] :
							columnsSettings;
						for (var j = 0; j < row.length; j++) {
							var cell = row[j];
							var key = cell.key;
							var name = key[key.length - 1].name.bindTo;
							actionsButtonConfig[0].menu.items.push({
								caption: {
									bindTo: name + "_SortedColumnCaption"
								},
								tag: name,
								click: {
									bindTo: "sortGrid"
								}
							});
						}
						if (!columnsSettingsProfile.isTiled) {
							break;
						}
					}
				}
				actionsButtonConfig.push({
					caption: resources.localizableStrings.OpenSettingPageCaption,
					click: {
						bindTo: "openSettingPage"
					}
				});
				actionsButtonConfig.push({
					caption: resources.localizableStrings.OpenGridSettingsPageCaption,
					click: {
						bindTo: "openGridSettingPage"
					}
				});
				actionsButtonConfig.push({
					caption: resources.localizableStrings.ExportDataPageCaption,
					visible: {
						bindTo: "canExportGrid"
					},
					click: {
						bindTo: "exportData"
					}
				});
				actionsButtonConfig.push({
					caption: resources.localizableStrings.SectionDesignerMenuItemCaption,
					visible: {
						bindTo: "isSectionDesignerAvailable"
					},
					click: {
						bindTo: "startSectionDesigner"
					}
				});
				return actionsButtonConfig;
			};
			baseSchemaMethods.startSectionDesigner = function() {
				var sectionName = "";
				var sandbox = this.getSandbox();
				var state = sandbox.publish("GetHistoryState");
				var sectionSchema = state.hash.entityName;
				for (var name in Terrasoft.configuration.ModuleStructure) {
					if (!Terrasoft.configuration.ModuleStructure.hasOwnProperty(name)) {
						continue;
					}
					var sectionInfo = Terrasoft.configuration.ModuleStructure[name];
					if (sectionInfo.sectionSchema === sectionSchema) {
						sectionName = name;
						break;
					}
				}
				if (sectionName) {
					var location = window.location;
					var origin = location.origin || location.protocol + '//' + location.host;
					var url = origin + location.pathname + "#SectionDesigner/" + sectionName;
					require(["SectionDesignerUtils"], function(module) {
						module.start(url);
					});
				}
			};
			baseSchemaMethods.getCurrentModuleCharts = function(moduleSchemaName) {
				if (this.get("analyticsGridData").getCount() > 0) {
					previousChart = null;
					this.chartSelected();
					return;
				}
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					//todo SysModuleAnalyticsChart deleted
					rootSchema: null
				});
				select.addColumn("Id");
				var captionColumn = LocalizationUtilities.addLocalizableColumn(select, "Caption");
				captionColumn.orderPosition = 1;
				captionColumn.orderDirection = Terrasoft.OrderDirection.ASC;
				select.addColumn("SeriesKind");
				select.addColumn("SysChartSeriesKind");
				select.addColumn("SysChartSeriesKind.Image", "Image");
				var filters = Ext.create("Terrasoft.FilterGroup");
				filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					"ModuleSchemaName", moduleSchemaName));
				select.filters = filters;
				select.getEntityCollection(function(response) {
					var collection = this.get("analyticsGridData");
					var entities = response.collection;
					var itemsCollection = {};
					entities.each(function(item) {
						var itemKey = item.get(item.primaryColumnName);
						itemsCollection[itemKey] = item;
					});
					if (entities.collection) {
						if (entities.collection.length > 0) {
							this.set("haveCharts", true);
						}
					}
					analyticData.SysModuleAnalyticsChart = itemsCollection;
					collection.loadAll(itemsCollection);
					if (this.get("analyticsChartActiveRow")) {
						this.chartSelected(this.get("analyticsChartActiveRow"));
					}
				}, this);
			};
			baseSchemaMethods.getCurrentModuleReports = function(moduleSchemaName) {
				if (this.get("reportGridData").getCount() > 0) {
					this.reportSelected();
					return;
				}
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchema: SysModuleAnalyticsReport
				});
				select.addColumn("Id");
				LocalizationUtilities.addLocalizableColumn(select, "Caption");
				select.addColumn("SysSchemaUId");
				select.addColumn("[VwSysSchemaInWorkspace:UId:SysOptionsPageSchemaUId].Name", "OptionSchemaName");
				var filters = Ext.create("Terrasoft.FilterGroup");
				filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					"ModuleSchemaName", moduleSchemaName));
				var workspaceIdFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					"[VwSysSchemaInWorkspace:UId:SysOptionsPageSchemaUId].SysWorkspace.Id",
					Terrasoft.SysValue.CURRENT_WORKSPACE.value);
				filters.add("workspaceIdFilter", workspaceIdFilter);
				select.filters = filters;
				select.getEntityCollection(function(response) {
					var collection = this.get("reportGridData");
					var entities = response.collection;
					var itemsCollection = {};
					entities.each(function(item) {
						var itemKey = item.get(item.primaryColumnName);
						itemsCollection[itemKey] = item;
					});
					if (entities.collection) {
						if (entities.collection.length > 0) {
							this.set("haveReports", true);
						}
					}
					analyticData.SysModuleAnalyticsReport = itemsCollection;
					collection.loadAll(itemsCollection);
					var reportId = this.get("reportActiveRow");
					if (reportId) {
						this.reportSelected(reportId);
					}

				}, this);
			};
			baseSchemaMethods.getDefView = function() {
				return "mainView";
			};
			baseSchemaMethods.chartSelected = function(key) {
				if (!key || key === null) {
					key = this.get("analyticsChartActiveRow");
				}
				if (key) {
					if (previousChart !== key) {
						previousChart = key;
						MaskHelper.ShowBodyMask();
						if (previousReport) {
							this.clearRightContainer();
							this.set("reportActiveRow", null);
							var reportCollection = this.get("reportGridData");
							reportCollection.clear();
							reportCollection.loadAll(analyticData.SysModuleAnalyticsReport);
							previousReport = null;
						}

						var chartModuleId = this.getSandBoxId() + "_ChartModule";
						var chartRenderTo = Ext.get("rightContainer");
						if (chartRenderTo) {
							this.subscribe("GetChartId", function() {
								MaskHelper.HideBodyMask();
								return key;
							}, [chartModuleId]);
							this.loadModule("ChartModule", {
								id: chartModuleId,
								renderTo: chartRenderTo
							});
						} else {
							MaskHelper.HideBodyMask();
						}
					}
				}
			};
			baseSchemaMethods.reportSelected = function(key) {
				if (!key || key === null) {
					key = this.get("reportActiveRow");
				}
				if (key) {
					if (previousReport !== key) {
						previousReport = key;
						if (previousChart) {
							this.clearRightContainer();
							this.set("analyticsChartActiveRow", null);
							var chartCollection = this.get("analyticsGridData");
							chartCollection.clear();
							chartCollection.loadAll(analyticData.SysModuleAnalyticsChart);
							previousChart = null;
						}
						var grid = this.get("reportGridData");
						if (grid.getCount() <= 0) {
							previousReport = null;
							return;
						}
						var activeReport = grid.get(key);
						var reportConfig = {
							id: activeReport.get("Id"),
							caption: activeReport.get("Caption"),
							reportId: activeReport.get("SysSchemaUId"),
							sysSchemaName: activeReport.get("OptionSchemaName"),
							sectionUId: this.entitySchema.uId,
							activeRow: this.get("activeRow"),
							selectedRows: this.get("selectedRows"),
							type: "DevExpress",
							parentModuleSandboxId: this.getSandBoxId()
						};

						var reportModuleId = this.getSandBoxId() + "_ReportModule";
						this.subscribe("GetReportId", function() {
							return key;
						}, [reportModuleId]);
						this.subscribe("GetReportConfig", function() {
							return reportConfig;
						}, ["GetReportConfigKey"]);
						var reportRenderTo = Ext.get("rightContainer");
						this.loadModule("ReportModule", {
							id: reportModuleId,
							renderTo: reportRenderTo
						});
						this.publishMessage("GenerateReport", key);
					}
				}
			};
			baseSchemaMethods.generateRecordReport = function(tag, recordId) {
				var filterGroup = Terrasoft.createFilterGroup();
				filterGroup.name = "primaryColumnFilter";
				filterGroup.logicalComparisonTypes = Terrasoft.LogicalOperatorType.AND;
				var filter = Terrasoft.createColumnInFilterWithParameters("Id", [recordId]);
				filterGroup.addItem(filter);
				var extConfig = {
					recordId: recordId,
					reportParameters: {
						Filters: filterGroup.serialize()
					}
				};
				var config = Ext.apply(tag, extConfig);
				ReportUtilities.generateReport(this.entitySchema.uId, config);
			};
			baseSchemaMethods.generateReport = function(tag) {
				generateReportInfo = tag;
				sectionFilters = this.getQuickFilter();
				this.getSelectedButton();
			};
			baseSchemaMethods.getSelectedButton = function() {
				var recordId = this.get("activeRow");
				var reportParameters = {
					Filters: sectionFilters.serialize()
				};
				var extConfig = {
					recordId: recordId,
					reportParameters: reportParameters
				};
				var config = Ext.apply(generateReportInfo, extConfig);
				ReportUtilities.generateReport(this.entitySchema.uId, config);
			};
			baseSchemaMethods.onLoadData = function(response) {
				this.set("gridLoading", false);
				var collection = this.get("gridData");
				if (this.isClearGridData) {
					this.isClearGridData = false;
					collection.clear();
				}
				if (response.success) {
					if (this.onLoadData && this.onLoadData !== baseSchemaMethods.onLoadData) {
						response = this.onLoadData(response);
					}
					this.set("gridEmpty", collection.getCount() || response.collection.getCount() ? false : true);
					var responseCollection = response.collection;
					this.modifyLinksItems(responseCollection);
					if (Ext.isFunction(this.modifyItems)) {
						this.modifyItems.call(this, responseCollection);
					}
					var responseCollectionNew = responseCollection.filterByFn(function(item, key) {
						return (!collection.contains(key));
					});
					this.loadGridCollectionItems(responseCollectionNew);
					performanceCounterManager.setTimeStamp("loadDataComplete");

				}
				previousChart = null;
				previousReport = null;
			};
			baseSchemaMethods.loadGridCollectionItems = function(items) {
				var collection = this.get("gridData");
				collection.loadAll(items);
			};
			baseSchemaMethods.modifyLinksItems = function(responseItems) {
				var linksConfig = this.getLinksConfig();
				var scope = this;
				var columnNameMap = GridUtilities.getColumnNameMap(responseItems.rowConfig);
				var primaryColumnName = this.entitySchema.primaryColumnName;
				var primaryDisplayColumnName = this.entitySchema.primaryDisplayColumnName;
				responseItems.each(function(item) {
					var columns = this.entitySchema.columns;
					Terrasoft.each(linksConfig, function(columnName) {
						item["getEmail" + columnName + "Link"] = function() {
							var columnKey = columnNameMap[columnName];
							var value = this.get(columnKey);
							var url = "";
							if (!Ext.isEmpty(value)) {
								url = EmailHelper.getEmailUrl(value);
							}
							if (!Ext.isEmpty(url)) {
								return {
									url: url,
									title: value,
									target: ""
								};
							}
							return null;
						};
						if (columnName === primaryDisplayColumnName) {
							item["get" + columnName + "LinkPrimary"] = function() {
								var itemId = this.get(columnNameMap[primaryColumnName]) || this.get(primaryColumnName);
								var itemTitle = this.get(columnNameMap[primaryDisplayColumnName]) ||
									this.get(primaryDisplayColumnName);
								var entityStructure = Terrasoft.configuration.EntityStructure[getSectionCode(scope)];
								var patch = [];
								var cardSchema;
								if (entityStructure && Ext.isArray(entityStructure.pages) &&
									entityStructure.pages.length > 0) {
									var moduleStructure =
										Terrasoft.configuration.ModuleStructure[getSectionCode(scope)];
									var pages = entityStructure.pages;
									var typeColumnName = pages[0].typeColumnName;
									cardSchema = pages[0].cardSchema;
									if (!Ext.isEmpty(typeColumnName)) {
										var typeColumnValue = this.get(typeColumnName);
										typeColumnValue = typeColumnValue.value || typeColumnValue;
										Terrasoft.each(pages, function(page) {
											if (page.UId === typeColumnValue) {
												cardSchema = page.cardSchema;
											}
										}, this);
									}
									cardSchema += "V2";
									var  cardModule = moduleStructure ? moduleStructure.cardModule : "CardModule";
									cardModule += "V2";
									patch = [cardModule, cardSchema, ConfigurationEnums.CardState.View, itemId];
								} else {
									cardSchema = scope.entitySchema.name + "PageV2";
									patch = ["CardModuleV2", cardSchema,
										ConfigurationEnums.CardState.View,
										itemId];
								}
								return {
									url: Terrasoft.workspaceBaseUrl +
										"/Nui/ViewModule.aspx#" + patch.join("/"),
									title: itemTitle,
									target: "_self"
								};
							};
						} else {
							var column = columns[columnName];
							if (column && column.isLookup && column.referenceSchemaName) {
								var schemaName = column.referenceSchemaName;
								var entityStructure = Terrasoft.configuration.EntityStructure[schemaName];
								if (entityStructure && Ext.isArray(entityStructure.pages) &&
									entityStructure.pages.length > 0) {
									item["get" + columnName + "Link"] = function() {
										var columnKey = columnNameMap[columnName];
										if (Ext.isEmpty(this.get(columnKey))) {
											return;
										}
										var columnId = this.get(columnKey).value;
										var title = this.get(columnKey).displayValue;
										var moduleStructure = Terrasoft.configuration.ModuleStructure[schemaName];
										var columnType = this.get(columnKey + "." + moduleStructure.attribute);
										var columnTypeId = (columnType && columnType.value) ? columnType.value : null;
										var cardSchema = entityStructure.pages[0].cardSchema;
										if (!Ext.isEmpty(columnTypeId) && entityStructure.pages.length > 1) {
											Terrasoft.each(entityStructure.pages, function(pageItem) {
												if (pageItem.UId === columnTypeId) {
													cardSchema = pageItem.cardSchema;
												}
											}, this);
										}
										var patch = [moduleStructure.cardModule, cardSchema,
											ConfigurationEnums.CardState.View,
											columnId];
										var url = Terrasoft.workspaceBaseUrl +
											"/Nui/ViewModule.aspx#" + patch.join("/");

										return {
											url: url,
											title: title,
											target: "_self"
										};
									};
								}
							}
						}
					}, this);
				}, this);
			};
			baseSchemaMethods.clear = function(tabName, event) {
				if (tabName === "analytics") {
					if (event !== "QuickFilterChanged") {
						var analyticsCollection = this.get("analyticsGridData");
						analyticsCollection.clear();

						var reportCollection = this.get("reportGridData");
						reportCollection.clear();
					}
				} else {
					previousChart = null;
					var collection = this.get("gridData");
					this.set("activeRow", null);
					this.set("selectedRows", null);
					collection.clear();
				}
			};
			baseSchemaMethods.add = function(tag) {
				var state = ConfigurationEnums.CardState.Add;
				openCardModule.call(this, state, tag);
			};
			baseSchemaMethods.copy = function(tag, recordId) {
				var state = ConfigurationEnums.CardState.Copy;
				openCardModule.call(this, state, tag, recordId);
			};
			baseSchemaMethods.edit = function(tag, recordId) {
				var state = ConfigurationEnums.CardState.Edit;
				openCardModule.call(this, state, tag, recordId);
			};
			baseSchemaMethods.view = function(tag, recordId) {
				var state = ConfigurationEnums.CardState.View;
				openCardModule.call(this, state, tag, recordId);
			};
			baseSchemaMethods.onMultiSelectDelete = function() {
				var context = this;
				var selectedRows = this.get("selectedRows");
				if (selectedRows && selectedRows.length > 0) {
					RightUtilities.checkMultiCanDelete({
						schemaName: this.entitySchema.name,
						primaryColumnValues: selectedRows
					}, function(result) {
						if (result) {
							context.showInformationDialog(resources.localizableStrings[result], function() {
							}, {
								style: Terrasoft.MessageBoxStyles.BLUE
							});
						} else {
							var message = resources.localizableStrings.OnDeleteWarning;
							context.showConfirmationDialog(message, function(returnCode) {
								if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
									context.onDeleteAccept();
								}
							}, ["yes", "no"]);
						}
					});
				}
			};
			baseSchemaMethods.onDelete = function() {
				var context = this;
				RightUtilities.checkCanDelete({
					schemaName: this.entitySchema.name,
					primaryColumnValue: this.get("activeRow")
				}, function(result) {
					if (result) {
						context.showInformationDialog(resources.localizableStrings[result], function() {
						}, {
							style: Terrasoft.MessageBoxStyles.BLUE
						});
					} else {
						var message = resources.localizableStrings.OnDeleteWarning;
						context.showConfirmationDialog(message, function(returnCode) {
							if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
								context.onDeleteAccept();
							}
						}, ["yes", "no"]);
					}
				});
			};
			baseSchemaMethods.viewChanged = function(name) {
				if (name === "mainView" && this.get("multiSelect")) {
					Ext.getCmp("section-grid").activeRowActions = [];
				}
			};
			baseSchemaMethods.onDeleteAccept = function() {
				GridUtilities.deleteSelectedRecords(this);
			};
			baseSchemaMethods.onActiveRowAction = function(operation, recordId) {
				var itemConfig = getCurrentItemPageConfig(this);
				switch (operation.split("_")[0]) {
					case ConfigurationEnums.CardState.View:
						this.view(itemConfig, recordId);
						break;
					case ConfigurationEnums.CardState.Edit:
						this.edit(itemConfig, recordId);
						break;
					case ConfigurationEnums.CardState.Copy:
						this.copy(itemConfig, recordId);
						break;
					case ConfigurationEnums.CardState.Delete:
						this.onDelete();
						break;
					case ConfigurationEnums.CardState.Report:
						var caption = operation.split("_")[1];
						var reportId = operation.split("_")[2];
						var typeName = operation.split("_")[3];
						this.generateRecordReport({
							caption: caption,
							reportId: reportId,
							type: typeName
						}, recordId);
						break;
				}
			};
			baseSchemaMethods.onAfterGridRowRender = function() {
			};
			baseSchemaMethods.selectRow = function() {
			};
			baseSchemaMethods.unSelectRow = function() {
			};
			baseSchemaMethods.onDeleted = function(records) {
				if (!records) {
					var activeRow = this.get("activeRow");
					var selectedRows = this.get("selectedRows");
					records = activeRow ? [activeRow] : selectedRows;
				}
				if (records && records.length) {
					var gridData = this.get("gridData");
					records.forEach(function(record) {
						gridData.removeByKey(record);
					});
					this.set("gridEmpty", !gridData.getCount());
				}
			};
			baseSchemaMethods.executeAction = function() {
			};
			baseSchemaMethods.openGridSettingPage = function() {
				var sandboxId = this.getSandBoxId();
				var renderTo = this.getContainer();
				var gridSettingsId = "GridSettings_" + sandboxId;
				var entitySchemaName = this.entitySchema.name;
				var currentTabName = this.get("currentTabName");
				var viewModel = this;
				var sectionName = this.name.replace("Section", "");
				var gridSettingsPageConfig = this.gridSettingsPageConfig;
				this.subscribe("GetGridSettingsInfo", function() {
					var gridSettingsInfo = {};
					gridSettingsInfo.entitySchemaName = entitySchemaName;
					if (gridSettingsPageConfig) {
						gridSettingsInfo.isSingleTypeMode = gridSettingsPageConfig.isSingleTypeMode;
						gridSettingsInfo.baseGridType = gridSettingsPageConfig.baseGridType ||
							ConfigurationEnums.GridType.TILED;
					}
					gridSettingsInfo.profileKey = sectionName + "GridSettings" + currentTabName;
					return gridSettingsInfo;
				}, [gridSettingsId]);
				var params = this.publishMessage("GetHistoryState");
				this.publishMessage("PushHistoryState", {hash: params.hash.historyState});
				MaskHelper.ShowBodyMask();
				this.loadModule("GridSettings", {
					renderTo: renderTo,
					id: gridSettingsId,
					keepAlive: true
				});
				this.subscribe("UpdateDetail", function(args) {
					if (args && args.newProfileData) {
						viewModel.setColumnsProfile(args.newProfileData, true);
					}
					viewModel.isObsolete = true;
				}, [gridSettingsId]);
			};
			baseSchemaMethods.getColumnsProfile = function() {
				var columnsSettingsProfile = this.get("columnsSettingsProfile");
				var currentTabName = this.get("currentTabName");
				return columnsSettingsProfile[currentTabName].value || {};
			};
			baseSchemaMethods.setColumnsProfile = function(viewColumnsSettingsProfile, notSaveToProfile) {
				var columnsSettingsProfile = this.get("columnsSettingsProfile");
				var currentTabName = this.get("currentTabName");
				columnsSettingsProfile[currentTabName].value = viewColumnsSettingsProfile;
				if (notSaveToProfile !== true) {
					var columnsSettingsProfileKey = this.name.replace("Section", "") + "GridSettings" + currentTabName;
					Terrasoft.utils.saveUserProfile(columnsSettingsProfileKey,
						viewColumnsSettingsProfile, false);
				}
				this.set("columnsSettingsProfile", columnsSettingsProfile);
			};
			baseSchemaMethods.getCustomProfileValue = function(key) {
				var customSectionProfile = this.get("customSectionProfile");
				if (customSectionProfile && (key in customSectionProfile)) {
					return customSectionProfile[key];
				}
				return null;
			};
			baseSchemaMethods.setCustomProfile = function(key, value) {
				var customSectionProfile = this.get("customSectionProfile");
				var customSectionProfileKey = this.get("customSectionProfileKey");
				if (customSectionProfile) {
					customSectionProfile[key] = value;
				} else {
					customSectionProfile = {
						key: value
					};
				}
				Terrasoft.utils.saveUserProfile(customSectionProfileKey,
					customSectionProfile, false);
				this.get("customSectionProfile", customSectionProfile);
			};
			baseSchemaMethods.exportData = function() {
				var entityName = this.entitySchema.name;
				var visibleColumns = this.get("visibleGridColumns");
				var selectQuery = this.get("lastSelectQuery");
				if (visibleColumns) {
					var arrayKeys = Ext.clone(selectQuery.columns.getKeys());
					for (var i = 0; i < arrayKeys.length; i++) {
						var exist = false;
						var columnPath = selectQuery.columns.get(arrayKeys[i]).columnPath;
						for (var itemName in visibleColumns) {
							if (visibleColumns[itemName].columnPath === columnPath) {
								exist = true;
								break;
							}
						}
						if (!exist) {
							selectQuery.columns.removeByKey(arrayKeys[i]);
						}
					}
				}
				DataUtilities.generateCsvFile(entityName, entityName, selectQuery);
			};
			baseSchemaMethods.getCurrentViewActions = function() {
				var currentTabName = this.get("currentTabName");
				if (currentTabName === "analytics") {
					return this.getAnalyticsActions();
				}
				return this.getActions();
			};
			baseSchemaMethods.updateActionsConfig = function(actionsConfig, callback, scope) {
				var currentTabName = this.get("currentTabName");
				if (currentTabName === "analytics") {
					scope = scope || this;
					var canManageAnalytics = this.get("canManageAnalytics");
					if (Ext.isEmpty(canManageAnalytics)) {
						RightUtilities.checkCanExecuteOperation({operation: "CanManageAnalytics"}, function(result) {
							this.set("canManageAnalytics", result);
							if (result) {
								callback.call(this);
							}
						}, this);
					} else if (canManageAnalytics) {
						callback.call(scope || this);
					}
				} else {
					callback.call(scope || this);
				}
			};
			baseSchemaMethods.getLinksConfig = function() {
				var currentTabName = this.get("currentTabName");
				var linksConfig = this.get("linksConfig");
				if (Ext.isEmpty(linksConfig)) {
					return [];
				}
				return linksConfig[currentTabName] || [];
			};
			baseSchemaMethods.getEditPages = function() {
				var structureConfig = Terrasoft.configuration.ModuleStructure[getSectionCode(this)];
				if (Ext.isEmpty(structureConfig)) {
					return;
				}
				return structureConfig.pages;
			};
			baseSchemaMethods.getSelectedItems = function() {
				var isMultiSelect = this.get("multiSelect");
				var activeRow = this.get("activeRow");
				var selectedRows = this.get("selectedRows");
				return isMultiSelect ? selectedRows : (activeRow && [activeRow]);
			};
			baseSchemaMethods.isSingleSelected = function() {
				var selectedRows = this.getSelectedItems();
				return !Ext.isEmpty(selectedRows) && selectedRows.length === 1;
			};
			baseSchemaMethods.isAnySelected = function() {
				var selectedRows = this.getSelectedItems();
				return !Ext.isEmpty(selectedRows);
			};
			applyBaseMethodsToSchema(viewModelSchema, baseSchemaMethods);
			return viewModelSchema;
		}

		function applyBaseMethodsToSchema(viewModelSchema, baseSchemaMethods) {
			var schemaMethods = viewModelSchema.methods;
			var cloneArguments = function(argumentsToClone) {
				var returnedResult = [];
				for (var i = 0; i < argumentsToClone.length; i++) {
					returnedResult.push(argumentsToClone[i]);
				}
				return returnedResult;
			};
			var createProxyFunction = function(baseMethod, childMethod) {
				return function() {
					var args = cloneArguments(arguments);
					args.push(baseMethod);
					return childMethod.apply(this, args);
				};
			};
			for (var baseMethod in baseSchemaMethods) {
				if (!schemaMethods.hasOwnProperty(baseMethod)) {
					viewModelSchema.methods[baseMethod] = baseSchemaMethods[baseMethod];
				} else {
					viewModelSchema.methods[baseMethod] = createProxyFunction(baseSchemaMethods[baseMethod],
						viewModelSchema.methods[baseMethod]);

				}
			}
		}

		function getEsqConfig(viewModelSchema) {
			return viewModelSchema.esqConfig || {
				sort: {
					columns: [
//						{
//							name: "CreatedOn",
//							orderPosition: 1,
//							orderDirection: Terrasoft.OrderDirection.DESC
//						}
					]
				}
			};
		}

		function getCurrentItemPageConfig(scope) {
			var moduleStructure = Terrasoft.configuration.ModuleStructure[getSectionCode(scope)];
			if (moduleStructure) {
				var attribute = moduleStructure.attribute;
				if (!Ext.isEmpty(attribute)) {

					var gridDataCollection = scope.get("gridData");
					var activeRowId = scope.get("activeRow");
					var attributeColumn = null;
					gridDataCollection.each(function(item) {
						if (item.get(item.primaryColumnName) === activeRowId) {
							attributeColumn = item.get(attribute);
						}
					}, this);

					if (!Ext.isEmpty(attributeColumn)) {
						var UId = attributeColumn.value;
						var pages = moduleStructure.pages;
						Terrasoft.each(pages, function(item) {
							if (item.UId === UId) {
								return item;
							}
						});
					}

				}
			}
			return {};
		}

		function openCardModule(action, tag, recordId) {
			var config = Terrasoft.configuration.ModuleStructure[getSectionCode(this)];
			var cardSchema = (!config) ? (this.entitySchema.name + "Page") : config.cardSchema;
			cardSchema = (!Ext.isEmpty(tag) && !Ext.isEmpty(tag.cardSchema)) ? tag.cardSchema : cardSchema;
			cardSchema += "V2";
			var typeUId = "";
			var typeColumnName = "";
			MaskHelper.ShowBodyMask();


			switch (action) {
				case ConfigurationEnums.CardState.Add:
					if (config && !Ext.isEmpty(config.attribute) && !Ext.isEmpty(tag.UId)) {
						typeColumnName = config.attribute;
						typeUId = tag.UId;
					}
					break;
				case ConfigurationEnums.CardState.Edit:
				case ConfigurationEnums.CardState.View:
				case ConfigurationEnums.CardState.Copy:
					if (!recordId) {
						recordId = this.get("activeRow");
					}
					cardSchema = getCardSchemaName.call(this, config);
					if (!tag.UId) {
						typeUId = tag.UId = getTypeColumnUId.call(this, config);
					}
					break;
				default:
					break;
			}

			var newCardModuleId = "ViewModule_CardModule_" + this.entitySchema.name;
			var sandbox = this.getSandbox();
			var entityInfo = {};
			entityInfo.action = action;
			entityInfo.cardSchemaName = cardSchema;
			entityInfo.activeRow = recordId;
			if (config && config.attribute) {
				entityInfo.typeUId = typeUId;
				entityInfo.typeColumnName = config.attribute;
			}
			if (tag && tag.additionalValues) {
				entityInfo.valuePairs = tag.additionalValues;
			}
			if (this.modifyCardEntityInfo) {
				this.modifyCardEntityInfo(entityInfo);
			}
			sandbox.subscribe("CardModuleEntityInfo", function() {
				return entityInfo;
			}, [newCardModuleId]);

			this.openCardConfig = {
				top: document.body.scrollTop || document.documentElement.scrollTop || 0,
				action: action,
				recordId: recordId,
				sandboxId: newCardModuleId
			};
			this.cardModuleResponse = null;
			var scope = this;
			sandbox.subscribe("CardModuleResponse", function(response) {
				scope.cardModuleResponse = response;
			}, [newCardModuleId]);

			var params = sandbox.publish("GetHistoryState");
			var newState = Terrasoft.deepClone(params.state);
			sandbox.publish("PushHistoryState", {hash: params.hash.historyState});
			sandbox.publish("ReplaceHistoryState", {
				hash: params.hash.historyState,
				stateObj: Ext.apply(newState, entityInfo),
				silent: true
			});
			performanceCounterManager.clearAllTimeStamps();
			performanceCounterManager.setTimeStamp("StateChanged");
			sandbox.loadModule("CardModuleV2", {
				renderTo: this.getContainer(),
				id: newCardModuleId,
				keepAlive: true
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
								name: schemaItem.list || schemaItem.name + "List",
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

		return {
			generateBaseViewModelSchema: getFullViewModelSchema,
			generate: function(viewModelSchema) {
				var fullViewModelSchema = getFullViewModelSchema(viewModelSchema);
				entitySchema = fullViewModelSchema.entitySchema;
				var primaryImageColumnName = entitySchema.primaryImageColumnName;
				if (primaryImageColumnName) {
					fullViewModelSchema.loadedColumns.push({
						columnPath: primaryImageColumnName
					});
				}
				var config = {
					extend: fullViewModelSchema.extend,
					alternateClassName: "Terrasoft." + fullViewModelSchema.name,
					entitySchema: fullViewModelSchema.entitySchema,
					loadAll: false,
					fixedFilterConfig: fullViewModelSchema.fixedFilterConfig,
					folderFilterConfig: fullViewModelSchema.folderFilterConfig,
					extendedFilterConfig: fullViewModelSchema.extendedFilterConfig,
					quickFilterUtils: fullViewModelSchema.quickFilterUtils,
					name: fullViewModelSchema.name,
					loadedColumns: fullViewModelSchema.loadedColumns,
					code: fullViewModelSchema.code,
					columns: {
						multiSelect: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: "multiSelect"
						}
					},
					primaryColumnName: "",
					primaryDisplayColumnName: "",
					values: {
						gridEmpty: false,
						gridLoading: false,
						multiSelect: false,
						folderFilterValue: "",
						deleteFromStaticFolderVisible: false,
						addToStaticFolderCaption: resources.localizableStrings.AddToStaticFolder,
						addToStaticFolderVisible: true,
						deleteFromStaticFolderCaption: resources.localizableStrings.DeleteFromStaticFolder,
						gridModeCaption: resources.localizableStrings.MultiSelectFalse,
						haveReports: false,
						haveCharts: false,
						lastSelectQuery: null,
						visibleGridColumns: null,
						canExportGrid: false,
						isSectionDesignerAvailable: false,
						canOpenDesigner: true
					}
				};
				Ext.apply(config, fullViewModelSchema.methods);
				getViewModelColumns(config.columns, fullViewModelSchema.schema.gridPanel);
				return config;
			}
		};
	});