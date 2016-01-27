define("EntityStructureHelper", ["ext-base", "terrasoft", "ConfigurationEnums", "EntityStructureHelperResources"],
	function(Ext, Terrasoft, ConfigurationEnums, resources) {
		var sandbox = {};
		var summaryColumnsOnly = false;
		var useBackwards = true;
		var displayId = false;
		var lookupsColumnsOnly = false;
		var dataValueType = null;
		var aggregationType;
		var UseExists;
		var localEntitySchema;
		var localEntitySchemaLoaded = false;
		var excludeDataValueTypes = [];
		var allowedReferenceSchemas = [];

		function init(params) {
			sandbox = params.sa;
			summaryColumnsOnly = params.summaryColumnsOnly;
			useBackwards = params.useBackwards;
			displayId = params.displayId || false;
			lookupsColumnsOnly = params.lookupsColumnsOnly || false;
			dataValueType = params.dataValueType || null;
			aggregationType = params.aggregationType || null;
			UseExists = params.useExists || false;
			allowedReferenceSchemas = params.allowedReferenceSchemas || [];
			excludeDataValueTypes = params.excludeDataValueTypes || [];
			excludeDataValueTypes.push(Terrasoft.DataValueType.BLOB);
			localEntitySchemaLoaded = false;
		}

		function getEntitySchemaDescriptor(entityName, callback) {
			if (!localEntitySchemaLoaded) {
				localEntitySchema = sandbox.publish("GetEntitySchema", entityName);
				localEntitySchemaLoaded = true;
			}
			if (localEntitySchema) {
				callback.call(this, localEntitySchema);
			} else {
				sandbox.requireModuleDescriptors([entityName], callback, this);
			}
		}

		function getEntitySchema(entityName, callback) {
			if (localEntitySchema) {
				callback.call(this, localEntitySchema);
			} else {
				require([entityName], callback);
			}
		}
		function getEntityDescriptorsForLookupColumns(entity, callback) {
			var entityNames = [];
			Terrasoft.each(entity.columns, function(column) {
				if (column.isLookup) {
					var schemaName = column.referenceSchemaName;
					if (!arrayHasItem(entityNames, schemaName)) {
						entityNames[entityNames.length] = schemaName;
					}
				}
			}, this);
			sandbox.requireModuleDescriptors(entityNames, callback, this);
		}
		function getLookupColumns(identifier, callback, scope) {
			var schemaName = identifier.referenceSchemaName;
			getEntitySchemaDescriptor(schemaName, function() {
				getEntitySchema(schemaName, function(schema) {
					getEntityDescriptorsForLookupColumns(schema, function() {});
					var columns = {};
					Terrasoft.each(schema.columns, function(column) {
						if (column.isLookup &&
							column.usageType !== ConfigurationEnums.EntitySchemaColumnUsageType.None) {
							columns[column.uId] = createChild(column);
						}
					}, this);
					if (useBackwards) {
						getBackwardColumns(schemaName, function(result) {
							result.collection.each(function(column) {
								var columnFakeId = Terrasoft.utils.generateGUID();
								column.values.UId = columnFakeId;
								columns[columnFakeId] = createBackwardChild(column.values);
							}, this);
							callback.call(scope, columns);
						});
					} else {
						callback.call(scope, columns);
					}
				});
			});
		}

		function getBackwardColumns(identifier, callback) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "SysEntitySchemaReference",
				rowCount: -1,
				isDistinct: true
			});
			select.addColumn("ColumnCaption", "ColumnCaption");
			select.addColumn("ColumnName", "ColumnName");
			select.addColumn("SysSchema.Name", "Name");
			select.addColumn("SysSchema.Caption", "Caption");
			select.filters.add("SchemaFilter",
				select.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "[SysSchema:Id:ReferenceSchema].Name", identifier));
			select.filters.add("PackageFilter",
				select.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"SysSchema.SysPackage.SysWorkspace",
					Terrasoft.SysValue.CURRENT_WORKSPACE.value));
			select.filters.add("VwSysFilter",
				select.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.NOT_START_WITH,
					"SysSchema.Name", "VwSys"));
			select.filters.add("SysFilter",
				select.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.NOT_START_WITH,
					"SysSchema.Name", "Sys"));
			select.filters.add("UsageTypeFilter",
				select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "UsageType", 0));
			select.getEntityCollection(callback, this);
		}
		function isAggregateTypeColumn(column, aggregationType) {
			return isAggregateFunctionCanBeUsedToType(column.dataValueType, aggregationType);
		}
		function isAggregateFunctionCanBeUsedToType(dataValueType, aggregationType) {
			if (dataValueType === Terrasoft.DataValueType.BLOB) {
				return false;
			}
			switch (aggregationType) {
				case Terrasoft.AggregationType.COUNT:
					return true;
				case Terrasoft.AggregationType.MAX:
				case Terrasoft.AggregationType.MIN:
					return isDateTime(dataValueType) || isNumeric(dataValueType);
				case Terrasoft.AggregationType.AVG:
				case Terrasoft.AggregationType.SUM:
					return isNumeric(dataValueType);
				default:
					return false;
			}
		}
		function isDateTime(dataValueType) {
			return dataValueType === Terrasoft.DataValueType.DATE_TIME ||
				dataValueType === Terrasoft.DataValueType.DATE ||
				dataValueType === Terrasoft.DataValueType.TIME;
		}
		function isNumeric(dataValueType) {
			return dataValueType === Terrasoft.DataValueType.INTEGER ||
				dataValueType === Terrasoft.DataValueType.FLOAT ||
				dataValueType === Terrasoft.DataValueType.MONEY;
		}
		function isAggregateColumn(column) {
			var dataValueType = column.dataValueType;
			return isDateTime(dataValueType) || isNumeric(dataValueType);
		}
		function getItemsColumns(identifier, callback, hasBackwardElemnts, scope) {
			var schemaName = identifier.referenceSchemaName;
			if (schemaName) {
				getEntitySchemaDescriptor(schemaName, function() {
					getEntitySchema(schemaName, function(schema) {
						var columns = {};
						var primaryColumName = schema.primaryColumnName;
						Terrasoft.each(schema.columns, function(column) {
							var columnDataValueType = column.dataValueType;
							if (column.usageType === ConfigurationEnums.EntitySchemaColumnUsageType.None) {
								return;
							}
							if (Terrasoft.contains(excludeDataValueTypes, columnDataValueType)) {
								return;
							}
							if (column.name === primaryColumName) {
								if (displayId && (Ext.isEmpty(allowedReferenceSchemas) ||
										Ext.Array.contains(allowedReferenceSchemas, schemaName))) {
									columns[column.uId] = createItem(column);
								}
								return;
							}
							if (!Ext.isEmpty(aggregationType)) {
								if (isAggregateTypeColumn(column, aggregationType)) {
									columns[column.uId] = createItem(column);
								}
								return;
							}
							if (lookupsColumnsOnly) {
								if (column.isLookup &&
									(Ext.isEmpty(allowedReferenceSchemas) ||
										Ext.Array.contains(allowedReferenceSchemas, column.referenceSchemaName))) {
									columns[column.uId] = createItem(column);
								}
								return;
							}
							if ((hasBackwardElemnts || summaryColumnsOnly) && !isAggregateColumn(column)) {
								return;
							}
							if (!Ext.isEmpty(dataValueType) && (dataValueType !== columnDataValueType)) {
								return;
							}
							columns[column.uId] = createItem(column);
						}, this);
						if (hasBackwardElemnts) {
							columns.functionCount = createCountColumn();
							if (UseExists) {
								columns.functionExists = createExistsColumn();
							}
						}
						callback.call(scope, columns);
					});
				});
			} else {
				callback.call(scope, {});
			}
		}
		function getSchemaCaption(identifier, callback, scope) {
			var schemaName = identifier.referenceSchemaName;
			getEntitySchemaDescriptor(schemaName, function() {
				getEntitySchema(schemaName, function(schema) {
					callback.call(scope, schema.caption);
				});
			});
		}
		function createItem(column) {
			return {
				value: column.uId,
				displayValue: column.caption,
				columnName: column.name,
				order: 2,
				dataValueType: column.dataValueType,
				isLookup: column.isLookup || false,
				referenceSchemaName: column.isLookup ? column.referenceSchemaName : ""
			};
		}
		function createChild(column) {
			return {
				value: column.uId,
				displayValue: column.caption,
				columnName: column.name,
				referenceSchemaName: column.referenceSchemaName,
				isBackward: false,
				order: 2
			};
		}
		function createCountColumn() {
			return {
				value: "count",
				displayValue: resources.localizableStrings.CountItemCaption,
				columnName: "count",
				dataValueType: Terrasoft.DataValueType.INTEGER,
				order: 1,
				isAggregative: true,
				aggregationFunction: ConfigurationEnums.AggregationFunction.COUNT
			};
		}
		function createExistsColumn() {
			return {
				value: "exists",
				displayValue: resources.localizableStrings.ExistsItemCaption,
				columnName: "exists",
				order: 0,
				isAggregative: true,
				aggregationFunction: ConfigurationEnums.AggregationFunction.EXISTS
			};
		}
		function createBackwardChild(column) {
			return {
				value: column.UId,
				displayValue:
					resources.localizableStrings.BackwardCaptionTemplate
						.replace("#EntityName#", column.Caption)
						.replace("#ColumnName#", column.ColumnCaption),
				columnName: "[" + column.Name + ":" + column.ColumnName + "]",
				referenceSchemaName: column.Name,
				isBackward: true,
				order: 2
			};
		}
		function arrayHasItem(array, item) {
			return array.indexOf(item) >= 0;
		}
		function getColumnPathCaption(dataSend, callback, scope) {
			var ajaxProvider = Terrasoft.AjaxProvider;
			var data = {configJSON: dataSend} || {};
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/StructureExplorerService/GetColumnPathCaption";
			ajaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data,
				callback: function(request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
					}
					callback.call(scope || this, responseObject);
				},
				scope: this
			});
		}

		function hasAggregationColumns(schemaName, aggregationType, callback, scope) {
			var ajaxProvider = Terrasoft.AjaxProvider;
			var data = {
				schemaName: schemaName,
				aggregationType: aggregationType
			} || {};
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/StructureExplorerService/HasAggregationColumns";
			var request = ajaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data,
				callback: function(request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject =  Terrasoft.decode(response.responseText).HasAggregationColumnsResult;
					}
					callback.call(scope || this, responseObject);
				},
				scope: scope
			});
			return request;
		}
		return {
			init: init,
			getItems: getItemsColumns,
			getChildren: getLookupColumns,
			getItemCaption: getSchemaCaption,
			getBackwardColumns: getBackwardColumns,
			hasAggregationColumns: hasAggregationColumns,
			getColumnPathCaption: getColumnPathCaption,
			isAggregateFunctionCanBeUsedToType: isAggregateFunctionCanBeUsedToType
		};
	});
