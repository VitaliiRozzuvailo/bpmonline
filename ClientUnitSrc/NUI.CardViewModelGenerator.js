define("CardViewModelGenerator", ["ext-base", "terrasoft", "sandbox", "CardViewModelGeneratorResources",
		"BusinessRuleModule", "ConfigurationEnums", "ReportUtilities", "GeneralDetails", "ResponseExceptionHelper",
		"RightUtilities", "NetworkUtilities", "MaskHelper", "EmailHelper"],
		function(Ext, Terrasoft, sandbox, resources, BusinessRuleModule, ConfigurationEnums, ReportUtilities,
				GeneralDetails, ResponseExceptionHelper, RightUtilities, NetworkUtilities, MaskHelper, EmailHelper) {
	var entitySchema;
	var rightsChecked;
	var hasLimitations;

	function internalSetColumnValues(entity, info, scope) {
		var context = scope || this;
		var infoColumns = info.columns;
		for (var columnskey in infoColumns) {
			if (infoColumns.hasOwnProperty(columnskey)) {
				var entityObject = entity.get(columnskey);
				if (!Ext.isEmpty(entityObject) && !Ext.isEmpty(entityObject.value)) {
					var columns = infoColumns[columnskey];
					if (columns.length && columns.length > 0) {
						for (var i = 0, len = columns.length; i < len; i += 1) {
							var column = columns[i];
							entityObject = setAttributeValueByPath(entityObject, column,
								entity.get(columnskey + "." + column));
						}
					}
				} else {
					entity.set(columnskey, null);
				}
			}
		}
		context.callParent(arguments);
		var entityColumns = entity.columns;
		Terrasoft.each(entityColumns, function(item, key) {
			var contextColumn = context.columns[key];
			if (contextColumn && !contextColumn.dataValueType) {
				contextColumn.dataValueType = item.dataValueType;
			}
		}, this);
	}

	function getFullViewModelSchema(sourceViewModelSchema) {
		return Terrasoft.utils.common.deepClone(sourceViewModelSchema);
	}

	function generateViewModelColumn(schemaItem) {
		return {
			type: schemaItem.columnType ? schemaItem.columnType : Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
			caption: schemaItem.caption,
			name: schemaItem.name,
			columnPath: schemaItem.columnPath,
			IsRequired: schemaItem.IsRequired,
			dataValueType: schemaItem.columnDataValueType
		};
	}

	function checkColumnsNames(columns, name) {
		if (columns[name] !== undefined) {
			return true;
			//var errorMessage = Ext.String.format(resources.localizableStrings.DuplicateColumnNames, name);
			//throw new Terrasoft.ItemAlreadyExistsException({message: errorMessage});
		}
	}

	function getCustomViewModelColumns(config, containerCollection, customEntitySchema) {
		entitySchema = customEntitySchema;
		getViewModelColumns(config, containerCollection);
	}

	function setAttributeValueByPath(object, path, value) {
		var pathList = path.split(".");
		var pathListLength = pathList.length;
		var obj = object;
		for (var columnkey in pathList) {
			if (pathList.hasOwnProperty(columnkey)) {
				var column = pathList[columnkey];
				if (Number(columnkey) + 1 < pathListLength) {
					if (obj[column] === undefined) {
						obj[column] = {};
					}
					obj = obj[column];
				} else {
					obj[column] = value;
				}
			}
		}
		return object;
	}

	function needIncludeToQuery(entityColumn) {
		return (entityColumn.dataValueType !== Terrasoft.DataValueType.IMAGE &&
			entityColumn.dataValueType !== Terrasoft.DataValueType.BLOB);
	}

	function getViewModelColumns(config, containerCollection) {
		var groupedColumns = [];
		var columns = config.columns;
		Terrasoft.each(containerCollection, function(schemaItem) {
			var itemType = schemaItem.type;
			switch (itemType) {
				case Terrasoft.ViewModelSchemaItem.IMAGE:
					break;
				case Terrasoft.ViewModelSchemaItem.METHOD:
				case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
					var columnConfig = Terrasoft.utils.common.deepClone(schemaItem);
					var column = generateViewModelColumn(columnConfig);
					if (schemaItem.isRequired) {
						column.isRequired = schemaItem.isRequired;
					}
					if (checkColumnsNames(columns, schemaItem.name)) {
						break;
					}
					columns[schemaItem.name] = column;
					groupedColumns.push(column);
					var entitySchemaColumn = entitySchema.getColumnByName(schemaItem.columnPath);
					if (entitySchemaColumn && entitySchemaColumn.isLookup === true ||
						schemaItem.isCollection === true) {
						column.isLookup = true;
						var lookupListColumnConfig = {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: schemaItem.list || schemaItem.name + "List",
							isCollection: true
						};
						if (checkColumnsNames(columns, lookupListColumnConfig.name)) {
							break;
						}
						columns[lookupListColumnConfig.name] = lookupListColumnConfig;
					}

					break;
				case ConfigurationEnums.CustomViewModelSchemaItem.RADIO_GROUP:
					Terrasoft.each(schemaItem.items, function(radioItem) {
						if (!Ext.isEmpty(radioItem.items)) {
							var groupColumns = getViewModelColumns(config, radioItem.items);
							groupedColumns.push(groupColumns);
						}
					}, this);
					break;
				case ConfigurationEnums.CustomViewModelSchemaItem.ITEMS_GROUP:
				case Terrasoft.ViewModelSchemaItem.GROUP:
					var groupColumns = getViewModelColumns(config, schemaItem.items);
					groupedColumns.push(groupColumns);
					var groupVisibleMethodName = schemaItem.name + "GetVisible";
					config[groupVisibleMethodName] = function() {
						if (!groupColumns) {
							return true;
						}
						var column, item;
						for (var i = 0, length = groupColumns.length; i < length; i++) {
							column = groupColumns[i];
							if (column.length > 0) {
								for (var j = 0; j < column.length; j++) {
									item = this.get(column[j].name);
									if ((!Ext.isEmpty(item) && item.displayValue === undefined) ||
										(!Ext.isEmpty(item) && item.displayValue !== "")) {
										return true;
									}
								}
							} else {
								item = this.get(column.name);
								if ((!Ext.isEmpty(item) && item.displayValue === undefined) ||
									(!Ext.isEmpty(item) && item.displayValue !== "")) {
									return true;
								}
							}
						}
						return false;
					};
					break;
				case Terrasoft.ViewModelSchemaItem.DETAIL:
					break;
				default:
					break;
			}
		}, this);
		return groupedColumns;
	}

	function prepareInfo(schema) {
		Terrasoft.each(schema.entitySchemaInfo.info, function(info) {
			var ruleBaseAttribute = info.baseAttribute;
			var methodName = ruleBaseAttribute + "ShowInfo";
			schema.methods[methodName] = function() {
				/*jshint noarg: false */
				var rule = this[arguments.callee.$name].info;
				this.showInfo(rule);
			};
			schema.methods[methodName].info = info;
		});
	}

	function generate(viewModelSchema, info, sandbox) {
		var fullViewModelSchema = getFullViewModelSchema(viewModelSchema);
		fullViewModelSchema.entitySchemaInfo = info;
		entitySchema = fullViewModelSchema.entitySchema;
		var validationConfig = {};
		var customValidationConfig = fullViewModelSchema.validationConfig;
		if (customValidationConfig) {
			validationConfig = customValidationConfig;
		}
		var config = {
			extend: fullViewModelSchema.extend,
			className: "Terrasoft." + fullViewModelSchema.name,
			entitySchema: fullViewModelSchema.entitySchema,
			name: fullViewModelSchema.name,
			defValues: fullViewModelSchema.defValues,
			validationConfig: validationConfig,
			columns: {},
			primaryColumnName: "",
			primaryDisplayColumnName: "",
			canChangeStructure: fullViewModelSchema.canChangeStructure,

			/**
			 * Признак скрытия командной строки.
			 * @type {Boolean}
			 */
			isCommandLineHidden: false,

			values: {
				advancedVisible: false,
				isProcessMode: false,
				delayExecutionButtonVisible: false,
				isEdit: true,
				isVisibleEditButton: true,
				canDesignPage: false
			}
		};

		var parentInit = fullViewModelSchema.methods.init;

		var childGetActionsButtonVisible = fullViewModelSchema.methods.getActionsButtonVisible;
		fullViewModelSchema.methods.getActionsButtonVisible = function() {
			if (childGetActionsButtonVisible) {
				return childGetActionsButtonVisible.apply(this, arguments);
			} else {
				var visible = true;
				Terrasoft.each(this.visibilityBindings, function(item) {
					visible = visible && Ext.isFunction(this[item]) ? this[item]() : this.get(item);
					if (!visible) {
						return false;
					}
				}, this);
				return visible;
			}
		};
		fullViewModelSchema.methods.showAllFields = function(groupCollapsed) {
			if (typeof groupCollapsed !== "boolean" || groupCollapsed === false) {
				this.set("advancedVisible", true);
			}
		};
		fullViewModelSchema.methods.loadVocabulary = function(args, tag) {
			var config = {
				entitySchemaName: this.entitySchema.columns[tag].referenceSchemaName,
				multiSelect: false,
				columnName: tag,
				columnValue: this.get(tag),
				searchValue: args.searchValue,
				filters: this.getLookupQueryFilters.call(this, tag),
				columns: this.entitySchemaInfo.columns[tag],
				orders: this.entitySchemaInfo.orders[tag]
			};
			var customOptions = this.entitySchemaInfo.lookupOptions[tag];
			Ext.apply(config, customOptions);
			var handler = function(args) {
				var columnName = args.columnName;
				var collection = args.selectedRows.collection;
				if (collection.length > 0) {
					this.set(columnName, collection.items[0]);
				}
			};
			this.scrollTo = document.body.scrollTop || document.documentElement.scrollTop;
			this.openLookup(config, handler);
		};
		fullViewModelSchema.methods.init = function() {
			if (parentInit) {
				parentInit.call(this, arguments);
			}
		};
		fullViewModelSchema.methods.insertImagesToNotes = function(files) {
			GeneralDetails.insertImagesToNotes(files, this);
		};
		var parentModificateBeforeBind = fullViewModelSchema.methods.modificateBeforeBind;
		fullViewModelSchema.methods.modificateBeforeBind = function() {
			GeneralDetails.setNotesImagesCollection(this);
			if (parentModificateBeforeBind) {
				parentModificateBeforeBind.call(this, arguments);
			}
		};
		fullViewModelSchema.methods.moveToAction = function(tag) {
			var containerId;
			var detailId;
			Terrasoft.each(this.entitySchemaInfo.groups, function(group) {
				if (group.id === tag) {
					containerId = group.containerId;
					detailId = "datail-" + group.name;
				}
			}, this);

			if (containerId || detailId) {
				var wrapContainer = Ext.get(containerId + "-wrap");
				var wrapDetail = Ext.get(detailId + "-wrap");
				var controlContainer = Ext.getCmp(containerId);
				var controlDetail = Ext.getCmp(detailId);
				var wrap = wrapContainer || wrapDetail;
				var control = controlContainer || controlDetail;
				if (!Ext.isEmpty(wrap) && !Ext.isEmpty(control)) {
					var scrollTo = wrap.getY();
					Ext.getBody().dom.scrollTop = scrollTo;
					Ext.getDoc().dom.documentElement.scrollTop = scrollTo;
					control.setCollapsed(false);
				}
			}
		};
		var parentOnSaved = fullViewModelSchema.methods.onSaved;
		fullViewModelSchema.methods.onSaved = function(item) {
			MaskHelper.HideBodyMask();
			if (item && !item.success) {
				var errorMessage = ResponseExceptionHelper.GetExceptionMessage(item.errorInfo);
				this.showInformationDialog(errorMessage);
				return;
			}
			sendCardModuleResponse.call(this, true);
			if (parentOnSaved) {
				if (!parentOnSaved.apply(this, arguments)) {
					return;
				}
			}
			if (this.nextPrcElReady) {
				return;
			}
			sandbox.publish("UpdateDetail", this.get("Id"), [sandbox.id]);
			sandbox.publish("BackHistoryState");
		};
		var childCancel = fullViewModelSchema.methods.cancel;
		fullViewModelSchema.methods.cancel = function() {
			sendCardModuleResponse.call(this, false);
			if (childCancel) {
				childCancel();
			}
			sandbox.publish("BackHistoryState");
		};
		fullViewModelSchema.methods.showInfo = function(info) {
			//temporary solution. Until hints will be created.
			var infoText = "";
			var value = info.value;
			if (typeof value === "string") {
				infoText = value;
			} else {
				if (typeof value === "object") {
					if (value.hasOwnProperty("bindTo")) {
						var cValue = "";
						if (value.bindTo in this) {
							cValue = this[value.bindTo].apply(this, [info]);
						} else {
							cValue = this.get(value.bindTo);
						}
						var column = this.getColumnByName(value.bindTo);
						if (!Ext.isEmpty(column)) {
							var type = this.getColumnDataValueType(column);
							if (value.hasOwnProperty("converter")) {
								cValue = value.converter.apply(this, [cValue, type]);
							} else {
								cValue = Terrasoft.getTypedStringValue.apply(this, [cValue, type]);
							}
						}
						infoText = cValue;
					}
				}
			}
			this.showInformationDialog(infoText);
		};

		function sendCardModuleResponse(success) {
			sandbox.publish("CardModuleResponse", {
				action: this.action,
				success: success,
				uId: this.get(this.entitySchema.primaryColumnName),
				primaryDisplayColumnValue: this.get(this.entitySchema.primaryDisplayColumnName),
				primaryDisplayColumnName: this.entitySchema.primaryDisplayColumnName
			}, [sandbox.id]);
		}


		var parent = fullViewModelSchema.methods.save;
		fullViewModelSchema.methods.save = function() {
			var args = arguments;
			var viewModelContext = this;
			var save = function() {
				if (!viewModelContext.validate()) {
					var entitySchemaColumns = viewModelContext.entitySchema.columns;
					var viewModelColumns = viewModelContext.columns;
					var collection = viewModelContext.validationInfo.attributes;
					for (var key in collection) {
						if (collection.hasOwnProperty(key)) {
							if (collection[key].invalidMessage) {
								var entitySchemaCaption = entitySchemaColumns[key] ?
									entitySchemaColumns[key].caption : "";
								var viewModelCaption = viewModelColumns[key].caption;
								var requiredCaption = viewModelCaption ? viewModelCaption : entitySchemaCaption;
								var showWarning = Ext.String.format(resources.localizableStrings.FillRequiredField,
									requiredCaption);
								viewModelContext.showInformationDialog(showWarning);
							}
						}
					}
					return;
				}
				MaskHelper.ShowBodyMask();
				if (parent) {
					if (!parent.apply(viewModelContext, arguments[0])) {
						MaskHelper.HideBodyMask();
						return;
					}
				}
				if (!viewModelContext.hasChangedValues()) {
					if (viewModelContext.onSaved) {
						var silentSaveResult = viewModelContext.get("SilentSaveResult");
						viewModelContext.onSaved(silentSaveResult);
					}
				} else {
					viewModelContext.saveEntity(viewModelContext.onSaved);
				}
			};
			MaskHelper.HideBodyMask();
			RightUtilities.checkCanEdit({
				schemaName: this.entitySchema.name,
				primaryColumnValue: this.get(this.entitySchema.primaryColumnName),
				isNew: this.isNew
			}, function(result) {
				rightsChecked = true;
				hasLimitations = result;
				if (result) {
					this.showInformationDialog(result);
				} else {
					save(args);
				}
			}, this);
		};
		fullViewModelSchema.methods.hasChangedValues = function() {
			var changedValues = this.changedValues;
			if (Terrasoft.isEmptyObject(changedValues)) {
				return false;
			}
			for (var columnName in changedValues) {
				if (changedValues.hasOwnProperty(columnName)) {
					var column = this.columns[columnName];
					if (!column || column.type !== Terrasoft.ViewModelColumnType.ENTITY_COLUMN) {
						continue;
					}
					return true;
				}
			}
			return false;
		};
		fullViewModelSchema.methods.getDefValuesResponce = function(columns, schemaName, columnName, idValue) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: schemaName
			});
			select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "value");
			select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "displayValue");
			for (var j = 0; j < columns.length; j++) {
				var column = columns[j];
				if (typeof column.value !== "undefined") {
					this.set(column.columnPath, column.value);
					column.selectColumnPath = null;
					continue;
				}
				if (typeof column.sourceColumnPath === "undefined") {
					continue;
				}
				column.selectColumnPath = select.addColumn(column.sourceColumnPath);
			}
			select.getEntity(idValue, function(result) {
				var entity = result.entity;
				if (entity) {
					for (var j = 0; j < columns.length; j++) {
						var column = columns[j];
						if (column.selectColumnPath != null) {
							this.set(column.columnPath, entity.get(column.selectColumnPath.columnPath));
						}
					}
					this.set(columnName, {
						value: entity.get("value"),
						displayValue: entity.get("displayValue")
					});
				}
			}, this);
		};
		var parentSetCustomDefValues = fullViewModelSchema.methods.setCustomDefValues;
		fullViewModelSchema.methods.setCustomDefValues = function(args) {
			if (parentSetCustomDefValues) {
				if (!parentSetCustomDefValues.call(this, args)) {
					return;
				}
			}
			var defValues = this.defValues || [];

			if (!this.entitySchema) {
				return;
			}
			var groupedParameters = {};
			for (var i = 0; i < defValues.length; i++) {
				var element = defValues[i];
				var groupedElement = groupedParameters[element.sourceSchemaName];
				if (typeof groupedElement === "undefined") {
					groupedElement = groupedParameters[element.sourceSchemaName] = [];
				}
				groupedElement[groupedElement.length] = element;
			}
			for (i = 0; i < args.length; i++) {
				var entityColumn = this.findEntityColumn(args[i].name);
				var schemaName = entityColumn.referenceSchemaName;
				var columnName = args[i].name;
				var idValue = args[i].value;
				var columns = groupedParameters[schemaName] || [];
				this.getDefValuesResponce(columns, schemaName, columnName, idValue);
			}
		};
		var parentGetSchemaAdministratedByRecords = fullViewModelSchema.methods.getSchemaAdministratedByRecords;
		fullViewModelSchema.methods.getSchemaAdministratedByRecords = function() {
			if (parentGetSchemaAdministratedByRecords) {
				return parentGetSchemaAdministratedByRecords.call(this);
			}
			return this.entitySchema.administratedByRecords;
		};
		var childGetHeader = fullViewModelSchema.methods.getHeader;
		fullViewModelSchema.methods.getHeader = function() {
			var header;
			var entityStructure = Terrasoft.configuration.EntityStructure[this.entitySchema.name];
			if (childGetHeader) {
				header = childGetHeader.apply(this, arguments);
			} else if (entityStructure && entityStructure.attribute) {
				var typeColumnValue = this.get(entityStructure.attribute);
				entityStructure.pages.forEach(function(page) {
					if (typeColumnValue && page.UId === typeColumnValue.value) {
						header = page.captionLcz;
					}
				});
			}
			return header || this.entitySchema.caption;
		};
		fullViewModelSchema.methods.callCanChangeApplicationTuningMode = function(callback) {
			RightUtilities.checkCanExecuteOperation({
				operation: "CanChangeApplicationTuningMode"
			}, callback);
		};
		var parentMethodEdit = fullViewModelSchema.methods.edit;
		fullViewModelSchema.methods.edit = function() {
			if (parentMethodEdit) {
				var needExit = parentMethodEdit.call(this);
				if (needExit) {
					return;
				}
			}
			var recordId = this.get(this.primaryColumnName);
			var config = Terrasoft.configuration.ModuleStructure[this.entitySchema.name];
			var cardSchemaName = (!config) ? (this.entitySchema.name + "Page") : config.cardSchema;
			var configAttribute = (!config) ? null : config.attribute;
			var pageTypeId = this.get(configAttribute);
			if (!Ext.isEmpty(pageTypeId)) {
				var pageObjects = config.pages.filter(
					function(item) {
						return (item.UId === pageTypeId.value);
					});
				if (!Ext.isEmpty(pageObjects) && !Ext.isEmpty(pageObjects[0])) {
					var pageObject = pageObjects[0];
					var pageObjectCardSchema = pageObject.cardSchema;
					cardSchemaName = (!Ext.isEmpty(pageObjectCardSchema)) ? pageObjectCardSchema : cardSchemaName;
				}
			}
			var token = ((!config) ? ("CardModule") : config.cardModule) + "/" +
				cardSchemaName + "/edit/" + recordId;
			Terrasoft.Router.pushState(null, null, token);
		};
		if (fullViewModelSchema.schema.customPanel) {
			getViewModelColumns(config, fullViewModelSchema.schema.customPanel);
		}
		getViewModelColumns(config, fullViewModelSchema.schema.leftPanel);
		getViewModelColumns(config, fullViewModelSchema.schema.rightPanel);
		if (fullViewModelSchema.schema.customBottomPanel) {
			getViewModelColumns(config, fullViewModelSchema.schema.customBottomPanel);
		}
		BusinessRuleModule.prepareViewModelRule(fullViewModelSchema);
		prepareInfo(fullViewModelSchema);
		fullViewModelSchema.methods.getLookupQuery = function(filterValue, columnName) {
			var esq = this.callParent(arguments);
			Terrasoft.each(info.columns[columnName], function(column) {
				if (!esq.columns.contains(column)) {
					esq.addColumn(column);
				}
			}, this);

			var filterGroup = this.getLookupQueryFilters.call(this, columnName);
			if (!Ext.isEmpty(filterGroup)) {
				esq.filters.addItem(filterGroup);
			}
			var collection = esq.columns.collection;

			var displayColumn = collection.get("displayValue");
			if (displayColumn) {
				displayColumn.orderPosition = 100;
			}

			var primaryOrderColumnName =
				this.entitySchema.columns[columnName].referenceSchema.primaryOrderColumnName;
			var primaryColumn;
			if (primaryOrderColumnName) {
				primaryColumn = collection.get(primaryOrderColumnName);
				if (primaryColumn) {
					primaryColumn.orderDirection = Terrasoft.OrderDirection.ASC;
					primaryColumn.orderPosition = 99;
				}
			}

			if (info && info.orders && info.orders[columnName]) {
				var orders = info.orders[columnName] || [];
				Terrasoft.each(orders, function(order) {
					var orderColumnPath = order.columnPath;
					if (!collection.containsKey(orderColumnPath)) {
						esq.addColumn(orderColumnPath);
					}
					var sortedColumn = collection.get(orderColumnPath);
					sortedColumn.orderDirection = order.direction;
					sortedColumn.orderPosition = order.position;
				}, this);
			}
			return esq;
		};

		fullViewModelSchema.methods.getLookupQueryFilters = function(columnName) {
			var filterArray = this.entitySchemaInfo.filters[columnName];
			var filterGroup = Ext.create("Terrasoft.FilterGroup");
			Terrasoft.each(filterArray, function(item) {
				var filter;
				if (Ext.isObject(item) && Ext.isFunction(item.method)) {
					filter = item.method.call(this, item.argument);
				}
				if (Ext.isFunction(item)) {
					filter = item.call(this);
				}
				if (!Ext.isEmpty(filter)) {
					filterGroup.addItem(filter);
				}
			}, this);
			return filterGroup;
		};

		fullViewModelSchema.methods.onLabelLinkClick = function(columnName) {
			var recordId = this.get(columnName).value;
			var columns = Terrasoft[this.entitySchema.name].columns;
			var column = columns[columnName];
			var schemaName = column.referenceSchemaName;
			var moduleStructure = Terrasoft.configuration.ModuleStructure[schemaName];
			var entityStructure = Terrasoft.configuration.EntityStructure[schemaName];
			var typeAttributeName = moduleStructure.attribute;
			var pages = entityStructure.pages;
			var cardSchema = pages[0].cardSchema;
			var	typeAttribute = this.get(columnName + "." + typeAttribute);
			if (typeAttributeName && pages.length > 0 && typeAttribute) {
				var typeAttributeId = typeAttribute.value;
				Terrasoft.each(entityStructure.pages, function(page) {
					if (page.UId === typeAttributeId) {
						cardSchema = page.cardSchema;
					}
				}, this);
			}
			var token = moduleStructure.cardModule + "/" + cardSchema + "/view/" + recordId;
			Terrasoft.Router.pushState(null, null, token);
		};
		fullViewModelSchema.methods.onUrlClick = function(columnPath) {
			var value = this.get(columnPath);
			if (EmailHelper.isEmailAddress(value)) {
				EmailHelper.onEmailUrlClick(value);
			} else {
				NetworkUtilities.onUrlClick(value);
			}
		};
		fullViewModelSchema.methods.getEntitySchemaQuery = function() {
			var infoColumns = info.columns;
			var esq = this.callParent(arguments);
			var esqColumns = esq.columns.getKeys();
			for (var columnskey in infoColumns) {
				if (infoColumns.hasOwnProperty(columnskey)) {
					var columns = infoColumns[columnskey];
					if (columns.length && columns.length > 0) {
						for (var i = 0, len = columns.length; i < len; i += 1) {
							column = columns[i];
							var columnPath = columnskey + "." + column;
							if (esqColumns.indexOf(columnPath) < 0) {
								esq.addColumn(columnPath);
							}
						}
					}
				}
			}
			if (this.entitySchema && this.entitySchema.name && Terrasoft[this.entitySchema.name]) {
				var entitySchemaColumns = Terrasoft[this.entitySchema.name].columns;
				Terrasoft.each(esqColumns, function(columnName) {
					var column = entitySchemaColumns[columnName];
					if (column) {
						if (column.isLookup && column.referenceSchemaName) {
							var schemaName = column.referenceSchemaName;
							var moduleStructure = Terrasoft.configuration.ModuleStructure[schemaName];
							if (moduleStructure && moduleStructure.attribute) {
								var columnPath = columnName + "." + moduleStructure.attribute;
								if (esqColumns.indexOf(columnPath) < 0) {
									esq.addColumn(columnPath);
								}
							}
						}
					}
				}, this);
			}

			if (esqColumns.indexOf("ProcessListeners") < 0) {
				esq.addColumn("ProcessListeners");
			}
			return esq;
		};
		fullViewModelSchema.methods.setColumnValues = function(entity) {
			internalSetColumnValues(entity, info, this);
		};
		var parentSetCopyColumnValues = fullViewModelSchema.methods.setCopyColumnValues;
		fullViewModelSchema.methods.setCopyColumnValues = function(entity) {
			internalSetColumnValues(entity, info, this);
			if (parentSetCopyColumnValues) {
				parentSetCopyColumnValues.call(this, arguments);
			}

		};
		fullViewModelSchema.methods.openPageDesigner = function() {
			MaskHelper.ShowBodyMask();
			var moduleName = "EditPageDesigner";
			sandbox.publish("PushHistoryState", { hash: moduleName + "/" + this.name });
		};
		fullViewModelSchema.methods.delayExecution = function() {
			var delayExecutionContainer = Ext.get("delay-execution");
			sandbox.loadModule("DelayExecutionModule", {
				renderTo: delayExecutionContainer
			});
		};
		fullViewModelSchema.methods.executeAction = function(tag) {
			var recordId = this.get("Id");
			var token = tag + "/" + recordId;
			var router = Terrasoft.router.Router;
			router.pushState(null, null, token);
		};
		fullViewModelSchema.methods.editRights = function() {
			var openRightsModule = function(arg1, arg2, scope) {
				var entitySchema = scope.entitySchema;
				sandbox.subscribe("GetRecordInfo", function() {
					return {
						entitySchemaName: entitySchema.name,
						entitySchemaCaption: entitySchema.caption,
						primaryColumnValue: scope.get(entitySchema.primaryColumnName),
						primaryDisplayColumnValue: scope.get(entitySchema.primaryDisplayColumnName)
					};
				});
				var id = sandbox.id + "_Rights";
				var renderTo = Ext.get("centerPanel");
				var historyState = sandbox.publish("GetHistoryState");
				sandbox.publish("PushHistoryState", {hash: historyState.hash.historyState});
				MaskHelper.ShowBodyMask();
				sandbox.loadModule("Rights", {
					renderTo: renderTo,
					id: id,
					keepAlive: true
				});
			};
			if (this.isNew) {
				this.isSilentSave = true;
				this.silentArgs = {
					callback: openRightsModule,
					scope: this
				};
				this.save();
			} else {
				openRightsModule(null, null, this);
			}
		};
		fullViewModelSchema.methods.generateReport = function(tag) {
			var recordId = this.get("Id");
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

		fullViewModelSchema.methods.getIncrementCode = function(entitySchemaName, callback) {
			var dataSend = {
				sysSettingName: entitySchemaName + "LastNumber",
				sysSettingMaskName: entitySchemaName + "CodeMask"
			};
			this.callServiceMethod.call(this, "SysSettingsService", "GetIncrementValueVsMask", function(responce) {
				callback.call(this, responce.GetIncrementValueVsMaskResult);
			}, dataSend);
		};

		fullViewModelSchema.methods.callServiceMethod = function(serviceName, methodName, callback, dataSend) {
			var data = dataSend || {};
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/" + serviceName + "/" + methodName;
			var request = this.ajaxProvider.request({
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
					callback.call(this, responseObject);
				},
				scope: this
			});
			return request;
		};
		fullViewModelSchema.methods.setReadOnlyDetails = function(detailsList, isReadOnly) {
			if (!this.readOnlyDetails) {
				this.readOnlyDetails = [];
			}
			Terrasoft.each(this.entitySchemaInfo.details, function(detailInfo) {
				if (detailsList.indexOf(detailInfo.name) !== -1) {
					var disabledDetailIndex = this.readOnlyDetails.indexOf(detailInfo.name);
					if (isReadOnly === true) {
						if (disabledDetailIndex === -1) {
							this.readOnlyDetails.push(detailInfo.name);
						}
					} else if (disabledDetailIndex !== -1) {
						this.readOnlyDetails.splice(disabledDetailIndex, 1);
					}
					if (!detailInfo.collapsed) {
						sandbox.publish("SetDetailReadOnly", { disableDetails: isReadOnly }, [detailInfo.moduleId]);
					}
				}
			}, this);
		};

		Ext.apply(config, fullViewModelSchema.methods);
		config.entitySchemaInfo = fullViewModelSchema.entitySchemaInfo;
		for (var entitySchemaColumnKey in entitySchema.columns) {
			if (entitySchema.columns.hasOwnProperty(entitySchemaColumnKey)) {
				var entitySchemaColumn = entitySchema.columns[entitySchemaColumnKey];
				var isPresent = false;
				for (var columnKey in config.columns) {
					if (config.columns.hasOwnProperty(columnKey)) {
						var column = config.columns[columnKey];
						if (column.name === entitySchemaColumn.name) {
							isPresent = true;
							break;
						}
					}
				}
				if (!isPresent && entitySchemaColumn.name !== "Color" && needIncludeToQuery(entitySchemaColumn)) {
					var newColumn = {
						caption: entitySchemaColumn.caption,
						columnPath: entitySchemaColumn.name,
						name: entitySchemaColumn.name,
						type: 0
					};
					config.columns[newColumn.name] = newColumn;
				}
			}
		}
		return config;
	}

	return {
		getViewModelColumns: getCustomViewModelColumns,
		generate: generate
	};
});
