define("SummarySettingsModule", ["ext-base", "terrasoft", "sandbox", "SummarySettingsViewGenerator",
	"SummarySettingsViewModelGenerator", "SummarySettingsModuleResources",
	"MaskHelper", "ModalBox", "StructureExplorerUtilities"],
	function(Ext, Terrasoft, sandbox, SummarySettingsViewGenerator, SummarySettingsViewModelGenerator,
		resources, MaskHelper, modalBox, StructureExplorerUtilities) {

		var viewModel;
		var viewConfig;
		var profileKey;

		function addRow(container, functionCollection, rowsCollection, array, columnDataValueType) {
			var renderTo = container;
			var funcList = getFilteredList(functionCollection, columnDataValueType);
			var rowsList = rowsCollection;
			var key = array[4];
			var viewModel = Ext.create("Terrasoft.BaseViewModel",
				SummarySettingsViewModelGenerator.generateRow(array[0], array[3], array[2]));
			var view = Ext.create("Terrasoft.Container", SummarySettingsViewGenerator.generateRow(renderTo, key));
			viewModel.key = key;
			viewModel.set("funcSelectedCaption", funcList[array[1]].displayValue);
			viewModel.set("funcSelectedValue", funcList[array[1]].value);
			viewModel.set("dataValueType", columnDataValueType);
			prepareFuncListInViewModel(funcList, viewModel);
			viewModel.functionChanged = function(tag) {
				switch (tag) {
					case "SUM":
						changeFunctionInCaption(viewModel, viewModel.get("funcSelectedCaption"),
							funcList.SUM.displayValue);
						viewModel.set("funcSelectedCaption", funcList.SUM.displayValue);
						viewModel.set("funcSelectedValue", funcList.SUM.value);
						break;
					case "AVG":
						changeFunctionInCaption(viewModel, viewModel.get("funcSelectedCaption"),
							funcList.AVG.displayValue);
						viewModel.set("funcSelectedCaption", funcList.AVG.displayValue);
						viewModel.set("funcSelectedValue", funcList.AVG.value);
						break;
					case "MAX":
						changeFunctionInCaption(viewModel, viewModel.get("funcSelectedCaption"),
							funcList.MAX.displayValue);
						viewModel.set("funcSelectedCaption", funcList.MAX.displayValue);
						viewModel.set("funcSelectedValue", funcList.MAX.value);
						break;
					case "MIN":
						changeFunctionInCaption(viewModel, viewModel.get("funcSelectedCaption"),
							funcList.MIN.displayValue);
						viewModel.set("funcSelectedCaption", funcList.MIN.displayValue);
						viewModel.set("funcSelectedValue", funcList.MIN.value);
						break;
				}
			};
			viewModel.deleteRow = function() {
				var item = rowsList.removeByKey(this.key);
				item.view.destroy();
				this.destroy();
			};
			view.bind(viewModel);
			rowsList.add(key, {
				view: view,
				viewModel: viewModel
			});
		}

		function addRowsFromProfile(renderTo, functionCollection, rowsCollection, viewModel, profile) {
			if (profile) {
				if (profile && profile.length > 0) {
					var count = profile.length;
					for (var i = 0; i < count; i++) {
						if (profile[i][0] === "Id" && profile[i][1] === "COUNT") {
							viewModel.set("isChecked", true);
						} else {
							addRow(renderTo, functionCollection, rowsCollection, [profile[i][0],
								profile[i][1], profile[i][2], profile[i][3],
								viewModel.idGenerator.generate()], profile[i][4]);
						}
					}
				}
			}
		}

		function saveDataToProfile(rowsList, showCount) {
			var collection = new Terrasoft.Collection();
			var columnPath, funcValue, columnCaption, path, dataValueType;
			var save = true;
			if (showCount) {
				collection.add("IdCOUNT", ["Id", "COUNT", resources.localizableStrings.FuncCountCaption]);
			}
			rowsList.each(function(item) {
				path = item.viewModel.get("path");
				columnPath = item.viewModel.get("columnPath");
				funcValue = item.viewModel.get("funcSelectedValue");
				columnCaption = item.viewModel.get("columnCaption");
				dataValueType = item.viewModel.get("dataValueType");
				if (!collection.contains(columnPath + funcValue)) {
					collection.add(columnPath + funcValue, [columnPath, funcValue, columnCaption, path, dataValueType]);
				} else {
					save = false;
					return save;
				}
			});
			if (save) {
				var profile = collection.getItems();
				Terrasoft.saveUserProfile(profileKey, profile, false);
				sandbox.publish("BackHistoryState");
			}
			else {
				Terrasoft.showInformation(resources.localizableStrings.NotUniqueColumns);
			}
		}

		function getFilteredList(funcList, dataType) {
			var filteredCollection = {};
			switch (dataType) {
				case Terrasoft.DataValueType.FLOAT:
				case Terrasoft.DataValueType.INTEGER:
				case Terrasoft.DataValueType.MONEY:
					filteredCollection.Default = funcList.SUM;
					filteredCollection.SUM = funcList.SUM;
					filteredCollection.AVG = funcList.AVG;
					filteredCollection.MAX = funcList.MAX;
					filteredCollection.MIN = funcList.MIN;
					break;
				case Terrasoft.DataValueType.DATE:
				case Terrasoft.DataValueType.DATE_TIME:
				case Terrasoft.DataValueType.TIME:
					filteredCollection.Default = funcList.MAX;
					filteredCollection.MAX = funcList.MAX;
					filteredCollection.MIN = funcList.MIN;
					break;
				default :
					break;
			}
			return filteredCollection;
		}

		function prepareFuncListInViewModel(funcList, viewModel) {
			if (funcList.SUM) {
				viewModel.set("funcSumCaption", funcList.SUM.displayValue);
				viewModel.set("funcSumVisible", true);
			}
			if (funcList.AVG) {
				viewModel.set("funcAvgCaption", funcList.AVG.displayValue);
				viewModel.set("funcAvgVisible", true);
			}
			if (funcList.MAX) {
				viewModel.set("funcMaxCaption", funcList.MAX.displayValue);
				viewModel.set("funcMaxVisible", true);
			}
			if (funcList.MIN) {
				viewModel.set("funcMinCaption", funcList.MIN.displayValue);
				viewModel.set("funcMinVisible", true);
			}
		}

		function changeFunctionInCaption(vieModel, oldValue, newValue) {
			if (oldValue === newValue) {
				return;
			}
			var caption = vieModel.get("columnCaption");
			if (caption.search("(" + oldValue + ")") !== -1) {
				caption = caption.replace("(" + oldValue + ")", "(" + newValue + ")");
				vieModel.set("columnCaption", caption);
				vieModel.set("columnEditCaption", caption);
			}
		}

		function init() {
			if (!this.rowsCollection) {
				this.rowsCollection = new Terrasoft.Collection();
			}
			this.functionCollection = {
				"MAX": {value: "MAX", displayValue: resources.localizableStrings.FuncMaxCaption},
				"AVG": {value: "AVG", displayValue: resources.localizableStrings.FuncAvgCaption},
				"MIN": {value: "MIN", displayValue: resources.localizableStrings.FuncMinCaption},
				"SUM": {value: "SUM", displayValue: resources.localizableStrings.FuncSumCaption}
			};
			this.idGenerator = new Ext.data.SequentialIdGenerator({
				prefix: "row_",
				seed: 0
			});
			var state = sandbox.publish("GetHistoryState");
			var currentHash = state.hash;
			this.schemaName = state.state.entitySchemaName;
			var currentState = state.state || {};
			if (currentState.moduleId === sandbox.id) {
				return;
			}
			sandbox.publish("ReplaceHistoryState", {
				stateObj: {
					moduleId: sandbox.id
				},
				pageTitle: null,
				hash: currentHash.historyState,
				silent: true
			});
		}

		function render(renderTo) {
			MaskHelper.HideBodyMask();
			var rowsCollection = this.rowsCollection;
			var keyGenerator = this.idGenerator;

			if (viewModel) {
				var config = Terrasoft.deepClone(viewConfig);
				var genView = Ext.create(config.className || "Terrasoft.Container", config);
				genView.bind(viewModel);
				genView.render(renderTo);
				var itemsRenderTo = Ext.get("table-grid-container");
				rowsCollection.each(function(item) {
					var itemViewModel = item.viewModel;
					var key = keyGenerator.generate();
					var generatedItemViewConfig = SummarySettingsViewGenerator.generateRow(itemsRenderTo, key);
					var genView = Ext.create(generatedItemViewConfig.className ||
						"Terrasoft.Container", generatedItemViewConfig);
					genView.bind(itemViewModel);
					item.view = genView;
				});
				return;
			}
			this.renderTo = renderTo;
			var functionCollection = this.functionCollection;
			var schemaName = this.schemaName;
			profileKey = "Section-" + schemaName + "-MainGrid-Summary";
			if (schemaName) {
				require([schemaName, "profile!" + profileKey], function(schema, profile) {
					viewModel = Ext.create("Terrasoft.BaseViewModel", SummarySettingsViewModelGenerator.generate());
					viewModel.idGenerator = keyGenerator;
					var schemaCaption = schema.caption + ": " + resources.localizableStrings.PageCaption;
					sandbox.publish("InitDataViews", {caption: schemaCaption});
					var generatedViewConfig = SummarySettingsViewGenerator.generate(renderTo);
					viewConfig = Terrasoft.deepClone(generatedViewConfig);
					var view = Ext.create(generatedViewConfig.className || "Terrasoft.Container", generatedViewConfig);
					var selectDataId = sandbox.id + "_StructureExploreModule";

					sandbox.subscribe("ColumnSelected", function(args) {
						viewModel.generateRow(args);
						MaskHelper.HideBodyMask();
					}, [selectDataId]);
					viewModel.addRow = function() {
						sandbox.subscribe("StructureExplorerInfo", function() {
							return {
								useBackwards: false,
								summaryColumnsOnly: true
							};
						}, [selectDataId]);
						var handler = function(args) {
							var funcList = getFilteredList(functionCollection, args.dataValueType);
							var gridContainer = Ext.get("table-grid-container");
							addRow(gridContainer, functionCollection, rowsCollection, [args.leftExpressionColumnPath,
								funcList.Default.value, args.leftExpressionCaption + "(" +
									funcList.Default.displayValue + ")", args.leftExpressionCaption,
								viewModel.idGenerator.generate()], args.dataValueType);
						};
						var config = {
							schemaName: schemaName,
							excludeDataValueTypes: [Terrasoft.DataValueType.IMAGELOOKUP],
							useBackwards: false,
							summaryColumnsOnly: true
						};
						StructureExplorerUtilities.Open(sandbox, config, handler, renderTo, this);
					};
					viewModel.generateRow = function(args) {
						var columnPath = args.leftExpressionColumnPath;
						var columnCaption = args.leftExpressionCaption;
						var dataValueType = args.dataValueType;
						var pathCaption = columnCaption;
						var idGenerator = keyGenerator;
						var funcList = getFilteredList(functionCollection, dataValueType);
						if (!funcList.Default) {
							return;
						}
						var rowsList = rowsCollection;
						var key = idGenerator.generate();
						var viewModel = Ext.create("Terrasoft.BaseViewModel",
							SummarySettingsViewModelGenerator.generateRow(columnPath, pathCaption, columnCaption +
								" (" + funcList.Default.displayValue + ")"));
						viewModel.key = key;
						viewModel.set("funcSelectedCaption", funcList.Default.displayValue);
						viewModel.set("funcSelectedValue", funcList.Default.value);
						viewModel.set("dataValueType", dataValueType);
						prepareFuncListInViewModel(funcList, viewModel);
						viewModel.functionChanged = function(tag) {
							switch (tag) {
								case "SUM":
									changeFunctionInCaption(viewModel, viewModel.get("funcSelectedCaption"),
										funcList.SUM.displayValue);
									viewModel.set("funcSelectedCaption", funcList.SUM.displayValue);
									viewModel.set("funcSelectedValue", funcList.SUM.value);
									break;
								case "AVG":
									changeFunctionInCaption(viewModel, viewModel.get("funcSelectedCaption"),
										funcList.AVG.displayValue);
									viewModel.set("funcSelectedCaption", funcList.AVG.displayValue);
									viewModel.set("funcSelectedValue", funcList.AVG.value);
									break;
								case "MAX":
									changeFunctionInCaption(viewModel, viewModel.get("funcSelectedCaption"),
										funcList.MAX.displayValue);
									viewModel.set("funcSelectedCaption", funcList.MAX.displayValue);
									viewModel.set("funcSelectedValue", funcList.MAX.value);
									break;
								case "MIN":
									changeFunctionInCaption(viewModel, viewModel.get("funcSelectedCaption"),
										funcList.MIN.displayValue);
									viewModel.set("funcSelectedCaption", funcList.MIN.displayValue);
									viewModel.set("funcSelectedValue", funcList.MIN.value);
									break;
							}
						};
						viewModel.deleteRow = function() {
							var item = rowsList.removeByKey(this.key);
							item.view.destroy();
							this.destroy();
						};
						rowsCollection.add(key, {
							viewModel: viewModel
						});
					};
					viewModel.saveToProfile = function() {
						var rowsList = rowsCollection;
						saveDataToProfile(rowsList, this.get("isChecked"));
					};
					viewModel.cancel = function() {
						sandbox.publish("BackHistoryState");
					};
					view.bind(viewModel);
					view.render(renderTo);
					var gridContainer = Ext.get("table-grid-container");
					addRowsFromProfile(gridContainer, functionCollection, rowsCollection, viewModel, profile);
				});
			}
		}

		return {
			init: init,
			render: render
		};
	}
);
