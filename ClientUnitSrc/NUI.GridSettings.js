define("GridSettings", ["ext-base", "terrasoft", "sandbox", "GridSettingsResources", "ConfigurationConstants",
		"MaskHelper", "StructureExplorerUtilities", "GridSettingsViewGenerator",
		"GridSettingsViewModelGenerator", "ConfigurationEnums"],
		function(Ext, Terrasoft, sandbox, resources, ConfigurationConstants, MaskHelper, StructureExplorerUtilities,
			viewGenerator, viewModelGenerator, ConfigurationEnums) {

	var localEntitySchema;
	var localEntitySchemaLoaded = false;
	var viewModel;

	function getEntitySchemaWithDescriptor(entityName, callback) {
		if (!localEntitySchemaLoaded) {
			localEntitySchema = sandbox.publish("GetEntitySchema", entityName);
			localEntitySchemaLoaded = true;
		}
		if (localEntitySchema) {
			callback.call(this, localEntitySchema);
		} else {
			sandbox.requireModuleDescriptors([entityName], function() {
				require([entityName], callback);
			}, this);
		}
	}

	function getUserSaveRights(callback, renderTo, scope) {
		var currentUser = Terrasoft.SysValue.CURRENT_USER.value;
		var sysAdmins = ConfigurationConstants.SysAdminUnit.Id.SysAdministrators;
		var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
			rootSchemaName: "SysUserInRole"
		});
		esq.addColumn("SysRole");
		esq.addColumn("SysUser");
		esq.filters.add("SysUser", Terrasoft.createColumnFilterWithParameter(
			Terrasoft.ComparisonType.EQUAL, "SysUser", currentUser));
		esq.filters.add("SysRole", Terrasoft.createColumnFilterWithParameter(
			Terrasoft.ComparisonType.EQUAL, "SysRole", sysAdmins));
		esq.getEntityCollection(function(response) {
			if (response && response.success) {
				var result = response.collection;
				var isSysAdmin = (result.collection.length !== 0);
				callback.call(scope, renderTo, isSysAdmin);
			}
		}, this);
	}

	var render = function(renderTo) {
		getUserSaveRights(finalRender, renderTo, this);
	};

	var finalRender = function(renderTo, isSysAdmin) {
		function pageAfterRender() {
			var columnsSettings = Ext.get("columnsSettings");
			columnsSettings.on("click", columnsSettingsClick, this);
			initDd(this);
		}

		var currentObject = this;
		currentObject.isSysAdmin = isSysAdmin;
		if (this.inited) {
			if (typeof this.isObjectColumn !== "undefined" && !this.isObjectColumn) {
				this.isObjectColumn = true;
				viewModel.openColumnSettings();
				return;
			}
			viewModel.updateItemsViewCollection();
			var viewConfig = viewGenerator.generate.call(viewModel.currentObject);
			var newView = Ext.create(viewConfig.className, viewConfig);
			newView.bind(viewModel);
			newView.render(renderTo);
			pageAfterRender.call(this);
			return;
		}

		this.inited = true;

		if (!this.dataCollection) {
			this.dataCollection = [];
		}
		if (!this.listedDataCollection) {
			this.listedDataCollection = [];
		}
		if (!this.viewCollection) {
			this.viewCollection = [];
		}
		if (!this.listedViewCollection) {
			this.listedViewCollection = [];
		}
		if (!this.elementPrefix) {
			this.elementPrefix = "element";
		}
		if (!this.plusPrefix) {
			this.plusPrefix = "plus";
		}
		if (!this.columnPrefix) {
			this.columnPrefix = "column";
		}
		if (!this.emptyPrefix) {
			this.emptyPrefix = "empty";
		}
		if (!this.rowSize) {
			this.rowSize = 24;
		}

		this.selectedCellCss = "selected-column";
		this.unselectedCellCss = "unchosen-column";
		this.titleCellCss = "grid-header";
		this.selectedCellId = "";

		if (!this.ddEmptyOverride) {
			this.ddEmptyOverride = {
				b4StartDrag: function() {
					if (!this.el) {
						this.el = Ext.get(this.getEl());
						this.el.setStyle("z-index", "11");
					}
					this.el.setStyle("border-right-style", "hidden");
					if (currentObject.selectedCellId !== "") {
						var previousCell = Ext.get(currentObject.selectedCellId);
						if (previousCell) {
							previousCell.removeCls(currentObject.selectedCellCss);
							previousCell.addCls(currentObject.unselectedCellCss);
						} else {
							currentObject.selectedCellId = "";
						}
					}
					this.el.removeCls(currentObject.unselectedCellCss);
					this.el.addCls(currentObject.selectedCellCss);
					currentObject.selectedCellId = this.el.dom.id;
				},
				onDrag: function(event) {
					var coords = [event.getX() - this.deltaX, event.getY() - this.deltaY];
					//var coords = [event.getX(), event.getY()];
					this.el.setXY(coords);
				},
				endDrag: function() {
					if (this.invalidDrop === true) {
						var coords = [this.startPageX, this.startPageY];
						this.el.setXY(coords);
						this.el.setStyle("z-index", "10");
						this.el.setStyle("border-right-style", "solid");
						delete this.invalidDrop;
					}
				},
				onDragDrop: function(event, target) {
					var ddTarget = Ext.get(target);
					var collection = viewModel.getActiveDataCollection();
					this.dragElement(currentObject, collection, this.el, ddTarget);
					this.el.remove();
					ddTarget.remove();
				},
				onInvalidDrop: function() {
					this.invalidDrop = true;
					this.el.removeCls(currentObject.selectedCellCss);
					this.el.addCls(currentObject.unselectedCellCss);
				},
				dragElement: function(currentObject, collection, el, ddTarget) {
					var targetIdParts = ddTarget.dom.id.split("-");
//						var targetType = targetIdParts[1];
					var newRowIndex = parseInt(targetIdParts[2], 10);
					var newCellIndex = parseInt(targetIdParts[3], 10);
					if (!newCellIndex) {
						newCellIndex = 0;
					}
					var elIdParts = el.dom.id.split("-");
					var oldRowIndex = parseInt(elIdParts[2], 10);
					var oldCellIndex = parseInt(elIdParts[3], 10);

					if (newRowIndex >= collection.length) {
						var currentRowIndex = newRowIndex + 1;
						collection.push({
							row: collection.length,
							cells: []
						});
						var lastRow = Ext.get("row-" + newRowIndex);
						var lastPlus = Ext.get("element-plus-" + newRowIndex);
						lastPlus.dom.id = "element-plus-" + newRowIndex + "-0";
						Ext.DomHelper.insertAfter(lastRow,
							"<div id=\"row-" + currentRowIndex + "\" class=\"grid-row grid-module\">" +
								"<div id=\"element-plus-" + currentRowIndex +
								"\" class=\"grid-cols-2\">" +
								"<div class=\"empty-inner-div\">" +
								"+" +
								"</div>" +
								"</div>" +
								"</div>",
							true);
						var lastEl = Ext.get("element-plus-" + currentRowIndex);
						lastEl.initDDTarget("empty", {}, currentObject.ddTargetEmptyOverride);
						for (var p = 2; p < currentObject.rowSize; p++) {
							lastEl = Ext.DomHelper.insertAfter(lastEl,
								"<div id=\"element-empty-" + currentRowIndex + "-" + p +
									"\" class=\"grid-cols-1\">" +
									"<div class=\"empty-inner-div\">" +
									"" +
									"</div>" +
									"</div>",
								true);
							lastEl.initDDTarget("empty", {}, currentObject.ddTargetEmptyOverride);
						}
					}

					viewModel.deactivateCells(collection);
					var oldRow = collection[oldRowIndex];
					var newRow = {};
					if (newRowIndex >= collection.length) {
						newRow = collection[collection.length - 1];
					} else {
						newRow = collection[newRowIndex];
					}
					var oldCells = oldRow.cells;
					var newCells = newRow.cells;

					var width = 0;
					for (var i = 0; i < oldCells.length; i++) {
						var oldCell = oldCells[i];
						var oldColumn = oldCell.column;
						var oldWidth = oldCell.width;
						if (oldColumn + oldWidth > oldCellIndex) {
							width = oldWidth;
							for (var j = 0; j < newCells.length; j++) {
								var newCell = newCells[j];
								var newColumn = newCell.column;
								if (oldRow.row === newRow.row && oldColumn === newColumn) {
									continue;
								}
								if (newColumn > newCellIndex && width > newColumn - newCellIndex) {
									width = newColumn - newCellIndex;
									break;
								}
							}
							oldCells.splice(i, 1);
							if (newCellIndex + width > currentObject.rowSize) {
								width = currentObject.rowSize - newCellIndex;
							}
							newCells.push({
								caption: oldCell.caption,
								metaPath: oldCell.metaPath,
								column: newCellIndex,
								width: width,
								isCurrent: true,
								isTitleText: oldCell.isTitleText,
								isCaptionHidden: oldCell.isCaptionHidden,
								orderDirection: oldCell.orderDirection,
								orderPosition: oldCell.orderPosition,
								serializedFilter: oldCell.serializedFilter,
								aggregationType: oldCell.aggregationType,
								isBackward: oldCell.isBackward
							});
							currentObject.selectedCellId = "element-column-" +
								newRowIndex +
								"-" +
								newCellIndex;
							break;
						}
					}
					viewModel.sortByKey(oldCells, "column");
					viewModel.sortByKey(newCells, "column");

					viewModel.refreshRow(oldRow);
					if (oldRow.row !== newRow.row) {
						viewModel.refreshRow(newRow);
					}
				}
			};
		}
		if (!this.ddTargetEmptyOverride) {
			this.ddTargetEmptyOverride = {};
		}

		getEntitySchemaWithDescriptor(this.schemaName, function(schema) {
			if (!currentObject.schema) {
				currentObject.schema = schema;
			}
		});

		var loadProfile = function(profile) {
			currentObject.isTiled = Ext.isEmpty(profile) ? currentObject.baseGridType : profile.isTiled;
			var viewModelConfig = viewModelGenerator.generate({
				isSingleTypeMode: Ext.isEmpty(currentObject.isSingleTypeMode) ?
					false :
					currentObject.isSingleTypeMode,

				GridType: currentObject.isTiled ?
					ConfigurationEnums.GridType.TILED :
					ConfigurationEnums.GridType.LISTED
			});
			viewModel = Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
			viewModel.currentObject = currentObject;
			viewModel.sandbox = sandbox;
			viewModel.renderTo = renderTo;
			viewModel.clearDDCache = function(el) {
				if (el && el.dom && el.dom.id) {
					try {
						Ext.cache[el.dom.id].events.mousedown = [];
					} catch (e) {}
				}
			};
			viewModel.changeGridType = function() {
				this.currentObject.isTiled = this.get("GridType") === ConfigurationEnums.GridType.TILED;
				var container = Ext.getCmp("columnsSettings");
				container.tpl = this.currentObject.isTiled ? viewGenerator.tiledTpl : viewGenerator.listedTpl;
				this.updateItemsViewCollection();
				container.reRender();
				pageAfterRender.call(currentObject);
			};
			viewModel.updateItemsViewCollection = function() {
				removeEmptyRows(currentObject.dataCollection);
				currentObject.viewCollection =
					viewModel.generateViewCollection(currentObject.dataCollection, currentObject.rowSize);
				currentObject.viewCollection.isTiled = true;

				currentObject.listedViewCollection =
					viewModel.generateViewCollection(currentObject.listedDataCollection, currentObject.rowSize);
				currentObject.viewCollection.isTiled = false;
			};
			viewModel.on("change:GridType", viewModel.changeGridType, viewModel);
			currentObject.profile = profile;
			currentObject.dataCollection = viewModel.getColumnsConfigFromProfile(profile, true);
			currentObject.listedDataCollection = viewModel.getColumnsConfigFromProfile(profile, false);
			viewModel.updateItemsViewCollection();
			var viewConfig = viewGenerator.generate.call(currentObject);
			var view = Ext.create(viewConfig.className, viewConfig);
			var page = Ext.getCmp("gridSettings");
			page.on("afterrender", pageAfterRender, currentObject);
			view.bind(viewModel);
			view.render(renderTo);
			MaskHelper.HideBodyMask();
		};

		if (currentObject.isNested) {
			loadProfile.call(currentObject, currentObject.profile);
		} else {
			require(["profile!" + currentObject.profileKey], loadProfile);
		}

		function initDd(ddElement) {
			clearDDGroup("empty");
			Ext.dd.DragDropManager.notifyOccluded = true;
			var columnsSettings = Ext.get("columnsSettings");
			var empties = Ext.select("[id*=\"element-empty\"]", false, columnsSettings.dom);
			empties.each(function(element) {
				element.initDDTarget("empty", {}, this.ddTargetEmptyOverride);
			}, ddElement);
			var pluses = Ext.select("[id*=\"element-plus\"]", false, columnsSettings.dom);
			pluses.each(function(element) {
				element.initDDTarget("empty", {}, this.ddTargetEmptyOverride);
			}, ddElement);
			var columns = Ext.select("[id*=\"element-column\"]", false, columnsSettings.dom);
			columns.each(function(element) {
				clearDDCache(element);
				element.initDD("empty", {isTarget: false}, this.ddEmptyOverride);
			}, ddElement);
		}

		function clearDDGroup(group) {
			if (group && typeof group === "string") {
				Ext.dd.DragDropManager.ids[group] = {};
			}
		}

		function clearDDCache(el) {
			if (el && el.dom && el.dom.id) {
				try {
					Ext.cache[el.dom.id].events.mousedown = [];
				} catch (e) {}
			}
		}

		function columnsSettingsClick(event) {
			var columnsSettings = Ext.get("columnsSettings");
			var root = columnsSettings.dom;
			var toggleRows = Ext.dom.Query.select("[id*=\"" + this.elementPrefix + "\"]", root);
			for (var i = 0, c = toggleRows.length; i < c; i += 1) {
				var toggle = toggleRows[i];
				if (!event.within(toggle)) {
					continue;
				}
				var toggleId = toggle.id;
				var toggleIdParts = toggleId.split("-");
				if (toggleIdParts[1] === this.plusPrefix) {
					if (toggleIdParts.length === 4) {
						createNewElement(toggle, this);
					} else {
						createNewRow(toggle, this);
					}
				} else if (toggleIdParts[1] === this.columnPrefix) {
					selectElement(toggle, this);
				}
			}
		}

		function selectElement(toggle, scope) {
			if (scope.selectedCellId !== "") {
				var previousCell = Ext.get(scope.selectedCellId);
				if (previousCell) {
					previousCell.removeCls(scope.selectedCellCss);
					previousCell.addCls(scope.unselectedCellCss);
				} else {
					scope.selectedCellId = "";
				}
			}
			var toggleId = toggle.id;
			var toggleEl = Ext.get(toggleId);
			toggleEl.removeCls(scope.unselectedCellCss);
			toggleEl.addCls(scope.selectedCellCss);
			scope.selectedCellId = toggleId;
		}

		function createNewElement(toggle, scope) {
			var config = {
				schemaName: currentObject.schemaName,
				excludeDataValueTypes: [Terrasoft.DataValueType.IMAGELOOKUP],
				useBackwards: true
			};
			var dataCollection = scope.isTiled ? scope.dataCollection : scope.listedDataCollection;

			var handler = function(args) {
				viewModel.deactivateCells(dataCollection);
				var toggleId = toggle.id;
				var toggleIdParts = toggleId.split("-");
				var currentRowIndex = parseInt(toggleIdParts[2], 10);
				var currentColumnIndex = parseInt(toggleIdParts[3], 10);
//					var nextColumnIndex = currentColumnIndex + 1;
				var cells = dataCollection[currentRowIndex].cells;
				var width = scope.rowSize - currentColumnIndex;
				for (var i = 0; i < cells.length; i++) {
					var cell = cells[i];
					if (cell.column > currentColumnIndex) {
						width = cell.column - currentColumnIndex;
						break;
					}
				}
				if (width > 4) {
					width = 4;
				}
				var schema = scope.schema;
				var primaryDisplayColumnName = schema.primaryDisplayColumnName;
				var row = dataCollection[currentRowIndex];
				var newCell = {
					caption: args.caption.join("."),
					column: currentColumnIndex,
					isCaptionHidden: primaryDisplayColumnName === args.leftExpressionColumnPath,
					isCurrent: true,
					isTitleText: primaryDisplayColumnName === args.leftExpressionColumnPath,
					metaPath: args.leftExpressionColumnPath,
					width: width
				};
				var previousCell = Ext.get(scope.selectedCellId);
				if (previousCell) {
					previousCell.removeCls(scope.selectedCellCss);
					previousCell.addCls(scope.unselectedCellCss);
				} else {
					scope.selectedCellId = "";
				}
				cells.push(newCell);
				row.cells = cells;
				viewModel.refreshRow(row);
				viewModel.sortByKey(cells, "column");
				scope.selectedCellId = "element-column-" + currentRowIndex + "-" + currentColumnIndex;
				removeEmptyRows(dataCollection);
				args.column = currentColumnIndex;
				args.isTiled = scope.isTiled;
				args.metaCaptionPath = args.leftExpressionCaption;
				args.row = currentRowIndex;
				args.width = width;
				scope.isObjectColumn = args.aggregationFunction || args.metaPath.length > 1 ? false : true;
				scope.args = args;
			};
			openStructureExplorer(sandbox, config, handler, renderTo, scope);
		}

		function openStructureExplorer(sandbox, config, callback, renderTo, scope) {
			if (scope.isNested) {
				sandbox.publish("OpenStructureExplorer", {
					config: config,
					handler: callback
				});
			} else {
				StructureExplorerUtilities.Open(sandbox, config, callback, renderTo, scope);
			}
		}

		function createNewRow(toggle, scope) {
			var config = {
				schemaName: currentObject.schemaName,
				excludeDataValueTypes: [Terrasoft.DataValueType.IMAGELOOKUP],
				useBackwards: true
			};
			var dataCollection = scope.isTiled ? scope.dataCollection : scope.listedDataCollection;
			var handler = function(args) {
				viewModel.deactivateCells(dataCollection);
				var toggleId = toggle.id;
				var toggleIdParts = toggleId.split("-");
				var currentRowIndex = parseInt(toggleIdParts[2], 10);
				//var nextRowIndex = currentRowIndex + 1;
				var schema = scope.schema;
				var primaryDisplayColumnName = schema.primaryDisplayColumnName;
				var newRow = {
					row: currentRowIndex,
					cells: [
						{
							caption: args.caption.join("."),
							column: 0,
							dataValueType: args.dataValueType,
							isCaptionHidden: primaryDisplayColumnName === args.leftExpressionColumnPath,
							isCurrent: true,
							isTitleText: primaryDisplayColumnName === args.leftExpressionColumnPath,
							metaPath: args.leftExpressionColumnPath,
							width: 4
						}
					]
				};
				var previousCell = Ext.get(scope.selectedCellId);
				if (previousCell) {
					previousCell.removeCls(scope.selectedCellCss);
					previousCell.addCls(scope.unselectedCellCss);
				} else {
					scope.selectedCellId = "";
				}
				dataCollection.push(newRow);
				viewModel.refreshRow(newRow);
				viewModel.addRow(newRow);
				removeEmptyRows(dataCollection);
				scope.selectedCellId = "element-column-" + (dataCollection.length - 1) + "-0";
				scope.isObjectColumn = args.aggregationFunction || args.metaPath.length > 1 ? false : true;
				args.row = currentRowIndex;
				args.column = 0;
				args.width = 4;
				args.isTiled = scope.isTiled;
				args.metaCaptionPath = args.leftExpressionCaption;
				scope.args = args;
			};
			openStructureExplorer(sandbox, config, handler, renderTo, scope);
		}

		function removeEmptyRows(collection) {
			for (var i = 0; i < collection.length; i++) {
				var row = collection[i];
				if (row.cells.length === 0) {
					collection.splice(i, 1);
					i--;
				} else {
					row.row = i;
				}
			}
		}
	};

	function init() {
		if (typeof this.schemaName === "undefined") {
			var gridSettingsInfo = sandbox.publish("GetGridSettingsInfo", null, [sandbox.id]);
			this.schemaName = gridSettingsInfo.entitySchemaName;
			this.isSingleTypeMode = gridSettingsInfo.isSingleTypeMode;
			this.baseGridType = gridSettingsInfo.baseGridType;
			this.profileKey = gridSettingsInfo.profileKey;
			this.hideButtons = gridSettingsInfo.hideButtons === true;
			this.hideCaption = gridSettingsInfo.hideCaption === true;
			this.hideGridType = gridSettingsInfo.hideGridType === true;
			this.profile = gridSettingsInfo.profile || {};
			this.isNested = gridSettingsInfo.isNested === true;

			if (!this.isNested) {
				var state = sandbox.publish("GetHistoryState");
				var currentHash = state.hash;
				var currentState = state.state || {};
				if (currentState.moduleId !== sandbox.id) {
					var newState = Terrasoft.deepClone(currentState);
					newState.moduleId = sandbox.id;
					sandbox.publish("ReplaceHistoryState", {
						stateObj: newState,
						pageTitle: null,
						hash: currentHash.historyState,
						silent: true
					});
				}
			}
		}

		sandbox.subscribe("GetProfileData", function() {
			var profile = viewModel.currentObject.profile;
			profile.tiledColumnsConfig = viewModel.getTiledProfileConfig();
			var listedProfileConfig = viewModel.getListedProfileConfig();
			profile.captionsConfig = listedProfileConfig.captionsConfig;
			profile.listedColumnsConfig = listedProfileConfig.listedColumnsConfig;
			return profile;
		});
	}

	return {
		init: init,
		render: render
	};
});