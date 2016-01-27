define("GridSettingsViewModelGenerator", ["ext-base", "terrasoft", "GridSettingsViewModelGeneratorResources",
	"ConfigurationConstants", "ColumnSettingsUtilities"],
	function(Ext, Terrasoft, resources, ConfigurationConstants, ColumnSettingsUtilities) {

		function generateViewModel(config) {
			var methods = {
				getColumnGridConfig: function(cell, columnKey) {
					var value = [];
					if (!cell.isCaptionHidden) {
						value.push({
							name: cell.caption,
							type: "caption"
						});
					}
					value.push({
						name: {
							bindTo: columnKey
						},
						type: cell.isTitleText ? "title" : "text",
						caption: cell.caption
					});
					return value;
				},
				getBaseColumnConfig: function(cell, captionLcz, metaPath) {
					return {
						aggregationType: cell.aggregationType,
						captionLcz: captionLcz,
						cols: cell.width,
						dataValueType: cell.dataValueType,
						isBackward: cell.isBackward,
						metaCaptionPath: cell.metaCaptionPath,
						metaPath: metaPath,
						orderDirection: cell.orderDirection,
						orderPosition: cell.orderPosition,
						referenceSchemaName: cell.referenceSchemaName,
						serializedFilter: cell.serializedFilter,
						hideFilter: cell.hideFilter
					};
				},
				getActiveDataCollection: function() {
					return this.currentObject.isTiled ?
						this.currentObject.dataCollection :
						this.currentObject.listedDataCollection;
				},
				SaveSettings: function() {
					var profileKey = this.currentObject.profileKey;
					var profile = this.getNewProfileData();
					Terrasoft.utils.saveUserProfile(profileKey, profile, false, function() {
						this.sandbox.publish("UpdateDetail",  {
							newProfileData: profile
						}, [this.sandbox.id]);
						this.sandbox.publish("BackHistoryState");
					}, this);
				},
				SaveSettingsForAllUsers: function() {
					var profileKey = this.currentObject.profileKey;
					var profile = this.getNewProfileData();
					Terrasoft.utils.saveUserProfile(profileKey, profile, false);
					Terrasoft.utils.saveUserProfile(profileKey, profile, true, function() {
						this.sandbox.publish("UpdateDetail", {
							newProfileData: profile
						}, [this.sandbox.id]);
						this.sandbox.publish("BackHistoryState");
					}, this);
				},
				getNewProfileData: function() {
					var profileKey = this.currentObject.profileKey;
					var profile = this.currentObject.profile;
					profile.tiledColumnsConfig = this.getTiledProfileConfig();
					var listedProfileConfig = this.getListedProfileConfig();
					profile.captionsConfig = listedProfileConfig.captionsConfig;
					profile.listedColumnsConfig = listedProfileConfig.listedColumnsConfig;

					profile.currentCulture = this.currentObject.profile.currentCultrue;
					profile.key = profileKey;
					profile.isTiled = !!this.currentObject.isTiled;
					return profile;
				},
				getTiledProfileConfig: function() {
					var collection = this.currentObject.dataCollection;
					var tiledColumnsConfig = [];
					var index = 0;
					var keySplitter = ConfigurationConstants.EntitySchemaQuery.ColumnKeySplitter;
					var addedColumns = [];
					for (var i = 0; i < collection.length; i++) {
						var row = collection[i];
						if (row.cells.length === 0) {
							continue;
						}
						tiledColumnsConfig.push([]);
						for (var j = 0; j < row.cells.length; j++) {
							var cell = row.cells[j];
							var columnKeySplittedArray = cell.metaPath.split(keySplitter);
							var metaPath = columnKeySplittedArray[0];
							var columnKey = metaPath;
							if (addedColumns.indexOf(metaPath) !== -1) {
								columnKey += keySplitter + i + j;
							} else {
								addedColumns.push(metaPath);
							}
							collection[i].cells[j].columnKey = columnKey;
							var captionLcz = {};
							captionLcz[Terrasoft.Resources.CultureSettings.currentCultureId] = cell.caption;
							var column = this.getBaseColumnConfig(cell, captionLcz, metaPath);
							column.titleSize = cell.titleSize;
							column.key = this.getColumnGridConfig(cell, columnKey);
							tiledColumnsConfig[index].push(column);
						}
						index++;
					}
					return Ext.encode(tiledColumnsConfig);
				},
				getListedProfileConfig: function() {
					var collection = this.currentObject.listedDataCollection;
					var keySplitter = ConfigurationConstants.EntitySchemaQuery.ColumnKeySplitter;
					var listedColumnsConfig = [];
					var captionsConfig = [];
					var addedColumns = [];
					if (collection.length > 0) {
						var firstRow = collection[0];
						for (var k = 0; k < firstRow.cells.length; k++) {
							var listedCell = firstRow.cells[k];
							var columnKeySplittedArray = listedCell.metaPath.split(keySplitter);
							var metaPath = columnKeySplittedArray[0];

							var columnKey = metaPath;
							if (addedColumns.indexOf(metaPath) !== -1) {
								columnKey += keySplitter + 0 + k;
							} else {
								addedColumns.push(metaPath);
							}
							firstRow.cells[k].columnKey = columnKey;
							var captionLcz = {};
							captionLcz[Terrasoft.Resources.CultureSettings.currentCultureId] = listedCell.caption;
							var listedColumn = this.getBaseColumnConfig(listedCell, captionLcz, metaPath);
							listedColumn.key = [{
								name: {
									bindTo: columnKey
								}
							}];
							listedColumnsConfig.push(listedColumn);
							var caption = {
								cols: listedCell.width,
								columnName: listedCell.columnKey,
								name: listedCell.caption
							};
							captionsConfig.push(caption);
						}

					}
					return {
						captionsConfig: Ext.encode(captionsConfig),
						listedColumnsConfig: Ext.encode(listedColumnsConfig)
					};
				},
				cancelSettings: function() {
					this.sandbox.publish("BackHistoryState");
				},
				deleteElement: function() {
					var currentObject = this.currentObject;
					var collection = this.getActiveDataCollection();
					var columnsSettings = Ext.get("columnsSettings");
					var toggles = Ext.select("[class*=\"" + currentObject.selectedCellCss + "\"]",
						false, columnsSettings.dom);
					if (toggles.elements && !toggles.elements.length) {
						return;
					}
					var toggle = toggles.item(0);
					var toggleId = toggle.dom.id;
					var toggleIdParts = toggleId.split("-");
					var currentRowIndex = parseInt(toggleIdParts[2], 10);
					var currentColumnIndex = parseInt(toggleIdParts[3], 10);
					this.deactivateCells(collection);
					var row = collection[currentRowIndex];
					var cells = row.cells;
					for (var i = 0; i < cells.length; i++) {
						var cell = cells[i];
						var column = cell.column;
						var width = cell.width;
						if (column + width > currentColumnIndex) {
							if (toggle.dom.id === currentObject.selectedCellId) {
								currentObject.selectedCellId = "";
							}
							cells.splice(i, 1);
							this.refreshRow(row);
							break;
						}
					}
				},
				setupElement: function() {
					var currentObject = this.currentObject;
					var collection = this.getActiveDataCollection();

					var columnsSettings = Ext.get("columnsSettings");
					var toggles = Ext.select("[class*=\"" + currentObject.selectedCellCss + "\"]",
						false, columnsSettings.dom);
					if (toggles.elements && !toggles.elements.length) {
						return;
					}
					var toggle = toggles.item(0);
					var toggleId = toggle.dom.id;
					var toggleIdParts = toggleId.split("-");
					var currentRowIndex = parseInt(toggleIdParts[2], 10);
					var currentColumnIndex = parseInt(toggleIdParts[3], 10);
					this.deactivateCells(collection);
					var row = collection[currentRowIndex];
					var cells = row.cells;
					for (var i = 0; i < cells.length; i++) {
						var cell = cells[i];
						var column = cell.column;
						var width = cell.width;
						if (column + width > currentColumnIndex) {
							var args = {};
							args.aggregationType = cell.aggregationType;
							args.column = cell.column;
							args.dataValueType = cell.dataValueType;
							args.isBackward = cell.isBackward;
							args.isCaptionHidden = cell.isCaptionHidden;
							args.isTiled = currentObject.isTiled;
							args.isTitleText = cell.isTitleText;
							args.leftExpressionCaption = cell.caption;
//						args.leftExpressionColumnPath = cell.metaPath;
							args.metaCaptionPath = cell.metaCaptionPath;
							args.serializedFilter = cell.serializedFilter;
							args.titleSize = cell.titleSize;
							args.referenceSchemaName = cell.referenceSchemaName;
							args.row = currentRowIndex;
							args.width = cell.width;
							args.hideFilter = cell.hideFilter;
							currentObject.args = args;
							break;
						}
					}

					this.openColumnSettings();
				},
				openColumnSettings: function() {
					var currentObject = this.currentObject;
					var config = currentObject.args;
					var collection = this.getActiveDataCollection();

					var handler = function(args) {
						var rowNumber = args.row;
						while (!collection[rowNumber] && rowNumber > 0) {
							rowNumber--;
						}
						var cells = collection[rowNumber].cells;
						var currentColumnIndex = args.column;
						for (var i = 0; i < cells.length; i++) {
							var cell = cells[i];
							var column = cell.column;
							var width = cell.width;
							if (column + width > currentColumnIndex) {
								var textSize = args.size;
								var isTitleText = textSize === "Caption" || (textSize === "ByDefault" &&
									currentObject.schema.primaryDisplayColumnName === cell.metaPath);
								cell.aggregationType = args.aggregationType;
								cell.caption = args.title;
								cell.dataValueType = args.dataValueType;
								cell.isBackward = args.isBackward;
								cell.isCaptionHidden = args.isCaptionHidden;
								cell.isCurrent = true;
								cell.isTitleText = isTitleText;
								cell.metaCaptionPath = args.metaCaptionPath;
								cell.titleSize = textSize;
								cell.referenceSchemaName = args.referenceSchemaName;
								cell.serializedFilter = args.serializedFilter;
								cell.hideFilter = args.hideFilter;
								break;
							}
						}
					};

					if (this.currentObject.isNested) {
						this.sandbox.publish("OpenColumnSettings", {
							config: config,
							handler: handler
						});
					} else {
						ColumnSettingsUtilities.Open(this.sandbox, config, handler, this.renderTo, this);
					}
				},
				expandElement: function() {
					var currentObject = this.currentObject;
					var collection = this.getActiveDataCollection();

					var columnsSettings = Ext.get("columnsSettings");
					var toggles = Ext.select("[class*=\"" +
						currentObject.selectedCellCss +
						"\"]", false, columnsSettings.dom);
					if (toggles.getCount() === 0) {
						return;
					}
					var toggle = toggles.item(0);
					var toggleId = toggle.dom.id;
					var toggleIdParts = toggleId.split("-");
					var currentRowIndex = parseInt(toggleIdParts[2], 10);
					var currentColumnIndex = parseInt(toggleIdParts[3], 10);
					this.deactivateCells(collection);
					var row = collection[currentRowIndex];
					var cells = row.cells;
					for (var i = 0; i < cells.length; i++) {
						var cell = cells[i];
						var column = cell.column;
						var width = cell.width;
						if (column + width > currentColumnIndex) {
							var nextCellIndex = i < cells.length - 1 ? cells[i + 1].column : currentObject.rowSize;
							var newWidth = width + 1;
							if (column + newWidth > currentObject.rowSize || column + newWidth > nextCellIndex) {
								return;
							}
							cell.width = newWidth;
							cell.isCurrent = true;
							this.refreshRow(row);
							break;
						}
					}
				},
				narrowElement: function() {
					var currentObject = this.currentObject;
					var collection = this.getActiveDataCollection();
					var columnsSettings = Ext.get("columnsSettings");
					var toggles = Ext.select("[class*=\"" +
						currentObject.selectedCellCss +
						"\"]", false, columnsSettings.dom);
					if (toggles.getCount() === 0) {
						return;
					}
					var toggle = toggles.item(0);
					var toggleId = toggle.dom.id;
					var toggleIdParts = toggleId.split("-");
					var currentRowIndex = parseInt(toggleIdParts[2], 10);
					var currentColumnIndex = parseInt(toggleIdParts[3], 10);
					this.deactivateCells(collection);
					var row = collection[currentRowIndex];
					var cells = row.cells;
					for (var i = 0; i < cells.length; i++) {
						var cell = cells[i];
						var column = cell.column;
						var width = cell.width;
						if (column + width > currentColumnIndex) {
							var newWidth = width - 1;
							if (newWidth <= 0) {
								return;
							}
							cell.width = newWidth;
							cell.isCurrent = true;
							this.refreshRow(row);
							break;
						}
					}
				},
				getBaseCellConfig: function(profileCell) {
					return {
						column: profileCell,
						aggregationType: profileCell.aggregationType,
						dataValueType: profileCell.dataValueType,
						isBackward: profileCell.isBackward,
						isTitleText: profileCell.isTitleText,
						metaCaptionPath: profileCell.metaCaptionPath,
						serializedFilter: profileCell.serializedFilter,
						referenceSchemaName: profileCell.referenceSchemaName,
						width: profileCell.cols,
						hideFilter: profileCell.hideFilter
					};
				},
				generateTiledCollection: function(config) {
					var previousCell = {};
					var keySplitter = ConfigurationConstants.EntitySchemaQuery.ColumnKeySplitter;
					var collection = [];
					for (var i = 0; i < config.length; i++) {
						var row = config[i];
						var cells = [];
						for (var j = 0; j < row.length; j++) {
							var cell = row[j];
							var key = cell.key;
							var keysCount = key.length;
							var caption = key[keysCount - 1].caption;
							var bindTo = key[keysCount - 1].name.bindTo;
							var columnKeySplittedArray = bindTo.split(keySplitter);
							var metaPath = columnKeySplittedArray[0];
							var isTitleText = key[key.length - 1].type === "title";
							var column = j;
							if (j > 0) {
								previousCell = cells[j - 1];
								column = previousCell.column + previousCell.width;
							}
							var dataTiledCell = this.getBaseCellConfig(cell);
							Ext.apply(dataTiledCell, {
								caption: caption,
								column: column,
								isCaptionHidden: keysCount === 1,
								metaPath: metaPath,
								titleSize: cell.titleSize,
								isTitleText: isTitleText

							});
							if (!Ext.isEmpty(cell.orderDirection)) {
								dataTiledCell.orderDirection = cell.orderDirection;
								dataTiledCell.orderPosition = cell.orderPosition;
							}
							cells.push(dataTiledCell);
						}
						collection.push({
							row: i,
							cells: cells
						});
					}
					return collection;
				},
				generateListedCollection: function(config, captionsConfig) {
					var previousCell = {};

					var cells = [];
					for (var k = 0; k < config.length; k++) {
						var listedCell = config[k];
						var captionCell = Ext.decode(captionsConfig)[k];
						if (Ext.isEmpty(listedCell) || Ext.isEmpty(captionCell) || Ext.isEmpty(listedCell.key)) {
							continue;
						}
						var listedColumn = k;
						if (k > 0) {
							previousCell = cells[k - 1];
							listedColumn = previousCell.column + previousCell.width;
						}
						var dataListedCell = this.getBaseCellConfig(listedCell);
						Ext.apply(dataListedCell,  {
							caption: captionCell.name,
							metaPath: listedCell.key[0].name.bindTo,
							titleSize: captionCell.titleSize,
							column: listedColumn

						});
						if (!Ext.isEmpty(listedCell.orderDirection)) {
							dataListedCell.orderDirection = listedCell.orderDirection;
							dataListedCell.orderPosition = listedCell.orderPosition;
						}
						cells.push(dataListedCell);
					}
					return [{
						row: 0,
						cells: cells
					}];
				},
				getColumnsConfigFromProfile: function(profile, isTiled) {
					var dataCollection = [];
					if (!profile.tiledColumnsConfig && !profile.listedColumnsConfig) {
						profile.tiledColumnsConfig = "{}";
						profile.listedColumnsConfig = "{}";
						return dataCollection;
					}
					var gridsColumnsConfig = isTiled ? profile.tiledColumnsConfig : profile.listedColumnsConfig;
					if (gridsColumnsConfig) {
						var columnsConfig = Ext.decode(gridsColumnsConfig);
						if (isTiled) {
							dataCollection = this.generateTiledCollection(columnsConfig);
						} else if (columnsConfig.length > 0) {
							var captionsConfig = profile.captionsConfig;
							dataCollection = this.generateListedCollection(columnsConfig, captionsConfig);
						}
					}
					return dataCollection;
				},
				createAddCellConfig: function(index) {
					return {
						caption: "+",
						metaPath: "+",
						column: index,
						width: 2,
						isNew: true
					};
				},
				createEmptyCellConfig: function(index) {
					return {
						caption: "",
						metaPath: "",
						column: index,
						width: 1,
						isEmpty: true
					};
				},
				generateViewCollection: function(dataCollection, rowSize) {
					var viewCollection = [];
					var rowCells = [];
					for (var i = 0; i < dataCollection.length; i++) {
						var currentRow = dataCollection[i];
						rowCells = [];
						var currentColumn = 0;
						for (var j = 0; j < currentRow.cells.length; j++) {
							var currentCell = currentRow.cells[j];
							if (currentCell.column !== currentColumn) {
								if (currentCell.column - currentColumn >= 2) {
									rowCells.push(this.createAddCellConfig(currentColumn));
									currentColumn += 2;
								}
								for (var k = currentColumn; k < currentCell.column; k++) {
									rowCells.push(this.createEmptyCellConfig(k));
								}
							}
							rowCells.push(currentCell);
							currentColumn = currentCell.column + currentCell.width;
						}
						if (currentColumn !== rowSize) {
							if (currentColumn <= rowSize - 2) {
								rowCells.push(this.createAddCellConfig(currentColumn));
								currentColumn += 2;
							}
							for (var y = currentColumn; y < rowSize; y++) {
								rowCells.push(this.createEmptyCellConfig(y));
							}
						}
						viewCollection.push({
							row: i,
							cells: rowCells
						});
					}
					rowCells = [];
					for (var z = 0; z < rowSize - 2; z++) {
						rowCells.push(this.createEmptyCellConfig(z + 2));
					}
					viewCollection.push({
						row: dataCollection.length,
						cells: rowCells
					});

					return viewCollection;
				},
				refreshRow: function(row) {
					var currentRowIndex = row.row;
					var cells = row.cells;
					var currentRow = Ext.get("row-" + currentRowIndex);
					var rowSize = this.currentObject.rowSize;
					var newRow = {};
					var newCell = {};
					if (cells.length > 0) {
						newRow = Ext.DomHelper.insertAfter(currentRow,
							"<div id=\"row-new\" class=\"grid-row grid-module\"></div>",
							true);
						currentRow.remove();
						var currentCellIndex = 0;
						var emptiesCount = 0;
						for (var i = 0; i < cells.length; i++) {
							var cell = cells[i];
							var column = cell.column;
							var width = cell.width;
							var caption = cell.caption;
							var isCurrent = cell.isCurrent;
							var isTitleText = cell.isTitleText;
							if (currentCellIndex !== column) {
								emptiesCount = column - currentCellIndex;
								if (emptiesCount > 1) {
									newCell = Ext.DomHelper.append(newRow,
										"<div id=\"element-plus-" + currentRowIndex + "-" + currentCellIndex +
											"\" class=\"grid-cols-2\">" +
											"<div class=\"empty-inner-div\">" +
											"+" +
											"</div>" +
											"</div>",
										true);
									newCell.initDDTarget("empty", {}, this.currentObject.ddTargetEmptyOverride);
									currentCellIndex += 2;
								}
								for (var j = currentCellIndex; j < column; j++) {
									newCell = Ext.DomHelper.append(newRow,
										"<div id=\"element-empty-" + currentRowIndex + "-" + j +
											"\" class=\"grid-cols-1\">" +
											"<div class=\"empty-inner-div\">" +
											"" +
											"</div>" +
											"</div>",
										true);
									newCell.initDDTarget("empty", {}, this.currentObject.ddTargetEmptyOverride);
								}
							}
							var columnClasses = "grid-cols-";
							columnClasses += width;
							columnClasses += " ";
							if (isCurrent) {
								columnClasses += this.currentObject.selectedCellCss;
							} else {
								columnClasses += this.currentObject.unselectedCellCss;
							}
							var innerDivClassesClasses = "column-inner-div";

							if (isTitleText) {
								innerDivClassesClasses += " ";
								innerDivClassesClasses += this.currentObject.titleCellCss;
							}
							newCell = Ext.DomHelper.append(newRow,
								"<div id=\"element-column-" + currentRowIndex + "-" + column + "\"class=\"" +
									columnClasses +
									"\">" +
									"<div class=\"" +
									innerDivClassesClasses +
									"\">" +
									caption +
									"</div>" +
									"</div>",
								true);
							this.clearDDCache(newCell);
							newCell.initDD("empty", {isTarget: false}, this.currentObject.ddEmptyOverride);
							currentCellIndex = column + width;
						}
						if (currentCellIndex < rowSize) {
							emptiesCount = rowSize - currentCellIndex;
							if (emptiesCount > 1) {
								newCell = Ext.DomHelper.append(newRow,
									"<div id=\"element-plus-" + currentRowIndex + "-" + currentCellIndex +
										"\" class=\"grid-cols-2\">" +
										"<div class=\"empty-inner-div\">" +
										"+" +
										"</div>" +
										"</div>",
									true);
								newCell.initDDTarget("empty", {}, this.currentObject.ddTargetEmptyOverride);
								currentCellIndex += 2;
							}
							for (var k = currentCellIndex; k < rowSize; k++) {
								newCell = Ext.DomHelper.append(newRow,
									"<div id=\"element-empty-" + currentRowIndex + "-" + k +
										"\" class=\"grid-cols-1\">" +
										"<div class=\"empty-inner-div\">" +
										"" +
										"</div>" +
										"</div>",
									true);
								newCell.initDDTarget("empty", {}, this.currentObject.ddTargetEmptyOverride);
							}
						}
						newRow.dom.id = "row-" + currentRowIndex;
					} else {
						if (!this.currentObject.isTiled) {
							newRow = Ext.DomHelper.insertAfter(currentRow,
								"<div id=\"row-new\" class=\"grid-row grid-module\"></div>",
								true);
							newCell = Ext.DomHelper.append(newRow,
								"<div id=\"element-plus-0-0\" class=\"grid-cols-2\">" +
									"<div class=\"empty-inner-div\">" +
									"+" +
									"</div>" +
									"</div>",
								true);
							for (var y = 2; y < rowSize; y++) {
								newCell = Ext.DomHelper.append(newRow,
									"<div id=\"element-empty-0-" + y +
										"\" class=\"grid-cols-1\">" +
										"<div class=\"empty-inner-div\">" +
										"" +
										"</div>" +
										"</div>",
									true);
							}
							currentRow.remove();
							newRow.dom.id = "row-0";
						} else {
							currentRow.remove();
						}
					}
				},
				addRow: function(row) {
					var currentRowIndex = row.row;
					var currentRow = Ext.get("row-" + currentRowIndex);
					var newRowIndex = currentRowIndex + 1;
					var newRow = Ext.DomHelper.insertAfter(currentRow,
						"<div id=\"row-" + newRowIndex + "\" class=\"grid-row grid-module\"></div>",
						true);
					var newCell = Ext.DomHelper.append(newRow,
						"<div id=\"element-plus-" + newRowIndex + "\" class=\"grid-cols-2\">" +
							"<div class=\"empty-inner-div\">" +
							"+" +
							"</div>" +
							"</div>",
						true);

					for (var y = 2; y < this.currentObject.rowSize; y++) {
						newCell = Ext.DomHelper.append(newRow,
							"<div id=\"element-empty-" + newRowIndex + "-" + y +
								"\" class=\"grid-cols-1\">" +
								"<div class=\"empty-inner-div\">" +
								"" +
								"</div>" +
								"</div>",
							true);
					}
				},
				deactivateCells: function(collection) {
					for (var i = 0; i < collection.length; i++) {
						var cells = collection[i].cells;
						for (var j = 0; j < cells.length; j++) {
							var cell = cells[j];
							cell.isCurrent = false;
						}
					}
				},
				sortByKey: function(array, key) {
					return array.sort(function(a, b) {
						var x = a[key];
						var y = b[key];
						return ((x < y) ? -1 : ((x > y) ? 1 : 0));
					});
				}

			};
			var values = {
			};
			Ext.apply(values, config);
			var viewModelConfig = {
				name: "FileListModule",
				columns: {},
				primaryColumnName: "",
				primaryDisplayColumnName: "",
				values: values,
				methods: methods
			};
			return viewModelConfig;
		}
		return {
			generate: generateViewModel
		};
	});
