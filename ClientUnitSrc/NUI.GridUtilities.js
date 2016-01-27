define("GridUtilities", ["ext-base", "terrasoft", "sandbox", "GridUtilitiesResources", "ConfigurationConstants",
		"ServiceHelper", "ConfigurationEnums"],
	function(Ext, Terrasoft, sandbox, resources, ConfigurationConstants, ServiceHelper, ConfigurationEnums) {

	var lastCheckedGridConfigKey;

	var callServiceMethod = function(methodName, callback, data, scope, profile) {
		Terrasoft.AjaxProvider.request({
			url: Terrasoft.workspaceBaseUrl + "/rest/GridUtilitiesService/" + methodName,
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			method: "POST",
			jsonData: data || {},
			callback: function(request, success, response) {
				var responseObject = {};
				if (success) {
					responseObject = Terrasoft.decode(response.responseText);
				}
				callback.call(scope || this, responseObject, profile);
			},
			scope: scope || this
		});
	};

	function deleteSelectedRecords(scope) {
		var elements;
		if (scope.get("multiSelect")) {
			elements = scope.get("selectedRows");
		} else {
			var activeRow = scope.get("activeRow");
			elements = activeRow ? [activeRow] : [];
		}
		if (!elements.length) {
			return;
		}
		var maskId = Terrasoft.Mask.show({
			caption: resources.localizableStrings.Deleting
		});
		var internalCallback = function(responseObject) {
			var result = Ext.decode(responseObject.DeleteRecordsResult);
			var success = result.Success;
			var deletedItems = result.DeletedItems;
			this.onDeleted(deletedItems);
			Terrasoft.Mask.hide(maskId);
			if (!success) {
				var message = "";
				if (result.IsDbOperationException) {
					message = resources.localizableStrings.DependencyWarningMessage;
				} else if (result.IsSecurityException) {
					message = resources.localizableStrings.RightLevelWarningMessage;
				} else {
					message = result.ExceptionMessage;
				}
				this.showInformationDialog(message);
			}
		};
		var data = {
			primaryColumnValues: elements,
			rootSchema: scope.entitySchema.name
		};
		ServiceHelper.callService("GridUtilitiesService", "DeleteRecords", internalCallback, data, scope);
	}

	function getAddButtonConfig(customConfig) {
		var config = {
			className: "Terrasoft.Button",
			classes: {
				wrapperClass: ["grid-utils-button-wrapperEl"],
				textClass: ["grid-utils-text-button-wrapperEl"],
				markerClass: ["grid-utils-button-markerEl"]
			},
			style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT
		};
		if (customConfig) {
			Ext.apply(config, customConfig);
		}
		return config;
	}

	function getSettingsButtonConfig(actionsConfig) {
		var actionsButtonConfig = {
			className: "Terrasoft.Button",
			classes: {
				wrapperClass: ["grid-settings-button-wrapperEl"],
				imageClass: ["grid-settings-button-image-size"],
				markerClass: ["grid-settings-button-markerEl"]
			},
			caption: resources.localizableStrings.ActionsButtonCaption,
			menu: {
				items: [
					{
						caption: resources.localizableStrings.SortCaption,
						menu: {
							items: []
						}
					},
					{
						caption: resources.localizableStrings.OpenSettingPageCaption,
						click: {
							bindTo: "openSettingPage"
						},
						visible: false
					}, {
						caption: resources.localizableStrings.OpenGridSettingsPageCaption,
						click: {
							bindTo: "openGridSettingPage"
						}
					}
				]
			}
		};
		var columnsSettingsProfile = actionsConfig.columnsSettingsProfile;
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
					actionsButtonConfig.menu.items[0].menu.items.push({
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
		return actionsButtonConfig;
	}

	function getLoadButtonConfig() {
		return {
			className: "Terrasoft.Button",
			classes: {
				wrapperClass: "load-more-btn-user-class"
			},
			imageConfig: resources.localizableImages.MoreArrowIcon,
			style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
			caption: resources.localizableStrings.LoadButtonCaption,
			click: {
				bindTo: "loadNext"
			},
			visible: {
				bindTo: "loadMoreVisibility"
			}
		};
	}

	function getLoadAllButtonConfig() {
		return {
			className: "Terrasoft.Button",
			classes: {
				wrapperClass: ""
			},
			imageConfig: resources.localizableImages.MoreArrowIcon,
			style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
			caption: {
				bindTo: "getLoadAllCaption"
			},
			click: {
				bindTo: "loadAllRows"
			},
			visible: {
				bindTo: "loadMoreVisibility"
			}
		};
	}

	function getColumnSortDirection(orderDirection, dataValueType) {
		if (orderDirection && orderDirection !== "") {
			orderDirection = orderDirection ===
				Terrasoft.OrderDirection.ASC ?
				Terrasoft.OrderDirection.DESC :
				Terrasoft.OrderDirection.ASC;
		} else {
			if (dataValueType === Terrasoft.DataValueType.TEXT ||
				dataValueType === Terrasoft.DataValueType.LOOKUP) {
				orderDirection = Terrasoft.OrderDirection.ASC;
			} else if (dataValueType ===
				Terrasoft.DataValueType.INTEGER ||
				dataValueType === Terrasoft.DataValueType.FLOAT ||
				dataValueType === Terrasoft.DataValueType.MONEY ||
				dataValueType ===
					Terrasoft.DataValueType.DATE_TIME ||
				dataValueType === Terrasoft.DataValueType.DATE ||
				dataValueType === Terrasoft.DataValueType.TIME ||
				dataValueType === Terrasoft.DataValueType.BOOLEAN) {
				orderDirection = Terrasoft.OrderDirection.DESC;
			} else {
				orderDirection = Terrasoft.OrderDirection.ASC;
			}
		}
		return orderDirection;
	}

	function getColumnCaption(caption, orderDirection) {
		if (!orderDirection || orderDirection === "") {
			return caption;
		}
		if (orderDirection === Terrasoft.OrderDirection.ASC) {
			caption += " (" + resources.localizableStrings.AscendingDirectionCaption + ")";
		} else {
			caption += " (" + resources.localizableStrings.DescendingDirectionCaption + ")";
		}
		return caption;
	}

	function getLocalizedColumnCaptions(profile, rootSchemaName, callback, scope) {
		function checkColumn(column) {
			if (column.metaPath && (!column.captionLcz || !column.captionLcz[culture])) {
				columns.push(column.metaPath);
			} else if (column.captionLcz && column.captionLcz[culture]) {
				column.key.forEach(function(item) {
					if (item.type === "caption") {
						item.name = column.captionLcz[culture];
					} else {
						item.caption = column.captionLcz[culture];
					}
				});
			}
		}
		function checkCaption(captions, column) {
			var columnName = column.metaPath;
			if (column.metaPath && (!column.captionLcz || !column.captionLcz[culture])) {
				columns.push(columnName);
			} else if (column.captionLcz && column.captionLcz[culture]) {
				captions.forEach(function(caption) {
					if (caption.columnName === columnName) {
						caption.name = column.captionLcz[culture];
					}
				});
			}
		}
		function updateColumn(column, result) {
			var columnName = column.metaPath;
			var captionLcz = column.captionLcz = column.captionLcz || {};
			column.key.forEach(function(item) {
				if (result[columnName]) {
					if (item.type === "caption") {
						item.name = result[columnName];
					} else {
						item.caption = result[columnName];
					}
					captionLcz[culture] = result[columnName];
				}
			});
		}
		function updateCaption(captions, column, result) {
			var columnName = column.metaPath;
			var captionLcz = column.captionLcz = column.captionLcz || {};
			column.key.forEach(function() {
				if (result[columnName]) {
					captionLcz[culture] = result[columnName];
					captions.forEach(function(caption) {
						if (caption.columnName === columnName) {
							caption.name = result[columnName];
						}
					});
				}
			});
		}
		function updateProfile(profile, columns, captions) {
			profile.currentCulture = culture;
			if (profile.isTiled) {
				profile.tiledColumnsConfig = Terrasoft.encode(columns);
			} else {
				profile.captionsConfig = Terrasoft.encode(captions);
				profile.listedColumnsConfig = Terrasoft.encode(columns);
			}
			if (profile.key) {
				Terrasoft.utils.saveUserProfile(profile.key, profile, false);
			}
		}
		var columnsConfig = Terrasoft.decode(
			profile.isTiled ? profile.tiledColumnsConfig : profile.listedColumnsConfig);
		var captionsConfig = Terrasoft.decode(profile.captionsConfig);
		if (!columnsConfig || lastCheckedGridConfigKey === profile.key) {
			callback.call(scope);
			return;
		}
		lastCheckedGridConfigKey = profile.key;
		var culture = Terrasoft.Resources.CultureSettings.currentCultureId;
		var columns = [];
		columnsConfig.forEach(function(row) {
			if (row.length) {
				row.forEach(function(column) {
					checkColumn(column);
				});
			} else {
				checkCaption(captionsConfig, row);
			}
		});
		if (columns.length) {
			callServiceMethod("GetLocalizedColumnCaptions", function(response, args) {
				var result = {};
				if (response.GetLocalizedColumnCaptionsResult) {
					response.GetLocalizedColumnCaptionsResult.forEach(function(item) {
						result[item.Key] = item.Value;
					});
				}
				columnsConfig.forEach(function(row) {
					if (row.length) {
						row.forEach(function(column) {
							updateColumn(column, result);
						});
					} else {
						updateCaption(captionsConfig, row, result);
					}
				});
				updateProfile(args.profile, columnsConfig, captionsConfig);
				callback.call(scope, columnsConfig, captionsConfig);
			}, {
				"rootSchemaName": rootSchemaName,
				"columns": columns
			}, this, {
				profile: profile,
				rootSchemaName: rootSchemaName
			});
		} else {
			if (profile.currentCulture !== culture) {
				updateProfile(profile, columnsConfig, captionsConfig);
			}
			callback.call(scope, columnsConfig, captionsConfig);
		}
	}

	function addLinks(gridConfig, fullViewModelSchema, linksConfig) {
		var isTiled = gridConfig.type === ConfigurationEnums.GridType.TILED;
		gridConfig.columnsConfig.forEach(function(row) {
			if (!isTiled) {
				row = gridConfig.columnsConfig;
			}
			var columns = fullViewModelSchema.entitySchema.columns;
			var primaryDisplayColumnName = fullViewModelSchema.entitySchema.primaryDisplayColumnName;
			Terrasoft.each(row, function(item) {
				var itemKey = item.key;
				var columnName;
				Terrasoft.each(itemKey, function(element) {
					if (element && element.name && element.name.bindTo) {
						var keySplitter = ConfigurationConstants.EntitySchemaQuery.ColumnKeySplitter;
						var columnKeySplittedArray = element.name.bindTo.split(keySplitter);
						columnName = columnKeySplittedArray[0];
					}
				}, this);
				var column = columns[columnName];
				if (columnName === primaryDisplayColumnName) {
					linksConfig.push(columnName);
					item.link = {bindTo: "get" + columnName + "LinkPrimary"};
				}
				if (column && column.isLookup && column.referenceSchemaName) {
					var moduleStructure = Terrasoft.configuration.ModuleStructure[column.referenceSchemaName];
					var entityStructure = Terrasoft.configuration.EntityStructure[column.referenceSchemaName];
					if (entityStructure && moduleStructure && Ext.isArray(entityStructure.pages) &&
						entityStructure.pages.length > 0) {
						linksConfig.push(columnName);
						item.link = {bindTo: "get" + columnName + "Link"};
					}
				}
				if (linksConfig.indexOf(columnName) < 0) {
					linksConfig.push(columnName);
				}
				if (Ext.isEmpty(item.link)) {
					item.link = {bindTo: "getEmail" + columnName + "Link"};
				}
			}, this);
			if (!isTiled) {
				return false;
			}

		}, this);
	}

	function getDataValueType(record, columnName) {
		var recordColumn = record.columns[columnName] ?
			record.columns[columnName] :
			record.entitySchema.columns[columnName];
		return recordColumn ? recordColumn.dataValueType : null;
	}

	function initializePageableOptions(select, config) {
		var isPageable = config.isPageable;
		select.isPageable = isPageable;
		var rowCount = config.rowCount;
		var newLoadedCount = config.newLoadedCount ? config.newLoadedCount : 1;
		select.rowCount = isPageable ? rowCount : -1;
		if (!isPageable) {
			return;
		}
		var collection = config.collection;
		var primaryColumnName = config.primaryColumnName;
		var schemaQueryColumns = config.schemaQueryColumns;
		var isClearGridData = config.isClearGridData;
		var conditionalValues = null;
		var loadedRecordsCount = collection.getCount();
		var isNextPageLoading = (loadedRecordsCount > 0 && !isClearGridData);
		if (isNextPageLoading) {
			var lastRecord = config.lastRecord || collection.getByIndex(loadedRecordsCount - newLoadedCount);
			var columnDataValueType = getDataValueType(lastRecord, primaryColumnName);
			conditionalValues = Ext.create("Terrasoft.ColumnValues");
			conditionalValues.setParameterValue(primaryColumnName,
				lastRecord.get(primaryColumnName), columnDataValueType);
			schemaQueryColumns.eachKey(function(columnName, column) {
				var value = lastRecord.get(columnName);
				var dataValueType = getDataValueType(lastRecord, columnName);
				if (column.orderDirection !== Terrasoft.OrderDirection.NONE) {
					if (dataValueType === Terrasoft.DataValueType.LOOKUP) {
						value = value ? value.displayValue : null;
						dataValueType = Terrasoft.DataValueType.TEXT;
					}
					conditionalValues.setParameterValue(columnName, value, dataValueType);
				}
			}, this);
		}
		select.conditionalValues = conditionalValues;
	}

	function initializeHierarchicalOptions(select, config) {
		select.isHierarchical = config.isHierarchical;
		select.hierarchicalMaxDepth = config.hierarchicalMaxDepth;
		select.hierarchicalColumnName = config.hierarchicalColumnName;
		select.hierarchicalColumnValue = config.hierarchicalColumnValue;
	}

	function createLoadedColumnInstance(columnConfig, columnPath) {
		var columnInstance = {};
		var columnCaption;
		var currentCulture = Terrasoft.Resources.CultureSettings.currentCultureId;
		if (columnConfig.captionLcz && columnConfig.captionLcz[currentCulture]) {
			columnCaption = columnConfig.captionLcz[currentCulture];
		}
		if (columnConfig.aggregationType) {
			columnInstance = Ext.create("Terrasoft.AggregationQueryColumn", {
				aggregationType: columnConfig.aggregationType,
				columnPath: columnPath,
				subFilters: Terrasoft.deserialize(columnConfig.serializedFilter),
				caption: columnCaption
			});
		} else {
			columnInstance = Ext.create("Terrasoft.EntityQueryColumn", {
				columnPath: columnPath,
				caption: columnCaption
			});
		}
		return columnInstance;
	}

	function getColumnNameMap(columns, columnPathPropertyName) {
		if (!columnPathPropertyName) {
			columnPathPropertyName = "columnPath";
		}
		var columnNameMap = {};
		Terrasoft.each(columns, function(column, key) {
			var columnPath = column[columnPathPropertyName];
			if (columnPath && !columnNameMap[columnPath]) {
				columnNameMap[columnPath] = key;
			}
		});
		return columnNameMap;
	}

	return {
		addLinks: addLinks,
		deleteSelectedRecords: deleteSelectedRecords,
		getSettingsButtonConfig: getSettingsButtonConfig,
		getAddButtonConfig: getAddButtonConfig,
		getLoadButtonConfig: getLoadButtonConfig,
		getLoadAllButtonConfig: getLoadAllButtonConfig,
		getColumnSortDirection: getColumnSortDirection,
		getColumnCaption: getColumnCaption,
		getLocalizedColumnCaptions: getLocalizedColumnCaptions,
		initializePageableOptions: initializePageableOptions,
		initializeHierarchicalOptions: initializeHierarchicalOptions,
		createLoadedColumnInstance: createLoadedColumnInstance,
		getColumnNameMap: getColumnNameMap
	};

});