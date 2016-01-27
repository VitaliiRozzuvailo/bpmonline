define("ExtendedGridDemoModule", ["BaseModule", "ViewGeneratorV2", "OrderProduct", "LookupUtilities", "ExtendedGrid"],
	function(BaseModule, ViewGeneratorV2, OrderProduct, LookupUtilities) {
	Ext.define("Terrasoft.configuration.ExtendedGridDemoModule", {
		alternateClassName: "Terrasoft.ExtendedGridDemoModule",
		extend: "Terrasoft.BaseModule",
		Ext: null,
		sandbox: null,
		Terrasoft: null,

		getViewModelClass: function() {
			return this.Ext.define("Terrasoft.configuration.ExtendedGridDemoModel", {
				extend: "Terrasoft.BaseViewModel",
				Ext: null,
				Terrasoft: null,
				sandbox: null,
				entitySchemaName: "OrderProduct",
				entitySchema: OrderProduct,
				columns: {
					Name: {
						name: "Name",
						columnPath: "Name",
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					Price: {
						name: "Price",
						columnPath: "Price",
						dataValueType: Terrasoft.DataValueType.FLOAT,
						precision: 2
					},
					Quantity: {
						name: "Quantity",
						columnPath: "Quantity",
						dataValueType: Terrasoft.DataValueType.FLOAT,
						precision: 2
					},
					Order: {
						name: "Order",
						columnPath: "Order",
						dataValueType: Terrasoft.DataValueType.LOOKUP
					}
				},

				init: function() {
					this.set("GridData", this.Ext.create("Terrasoft.BaseViewModelCollection"));
					this.set("ActiveRow", null);
					var messages = {};
					messages.LookupInfo = {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					};
					messages.ResultSelectedRows = {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					};
					this.sandbox.registerMessages(messages);
				},

				changedRow: function(id) {
					if (!id) {
						return;
					}
					var collection = this.get("GridData");
					var viewModel = collection.get(id);
					viewModel.saveEntity(function() {
					}, this);
				},

				onActiveRowAction: function(tag, id) {
					if (tag === "save") {
						var collection = this.get("GridData");
						var viewModel = collection.get(id);
						viewModel.saveEntity(function() {
							this.set("ActiveRow", null);
						}, this);
					}
					if (tag === "cancel") {
						this.onLoadButtonClick();
						this.set("ActiveRow", null);
					}
				},

				onLoadButtonClick: function() {
					var scope = this;
					var gridData = this.get("GridData");
					gridData.clear();
					var orderId1 = "37DBCA9B-672C-4269-A0C4-3BBFE481CBB1";
					var select = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchema: OrderProduct
					});
					select.addColumn("Name");
					select.addColumn("Price");
					select.addColumn("Order");
					select.addColumn("Quantity");
					select.filters.add("OrderIdFilter", this.Terrasoft.createColumnInFilterWithParameters("Order", [orderId1]));
					select.getEntityCollection(function(result) {
						if (result.success) {
							var collection = result.collection;
							collection.each(function(item) {
								item.loadVocabulary = function(args, tag) {
									var config = {
										entitySchemaName: args.schemaName ||
											this.entitySchema.columns[tag].referenceSchemaName,
										multiSelect: false,
										columnName: tag,
										columnValue: this.get(tag),
										searchValue: args.searchValue
									};
									var lookupListConfig = this.columns[tag].lookupListConfig;
									var excludedProperty = ["filters", "filter"];
									if (lookupListConfig) {
										for (var property in lookupListConfig) {
											if (excludedProperty.indexOf(property) === -1) {
												config[property] = lookupListConfig[property];
											}
										}
									}
									LookupUtilities.Open(scope.sandbox, config, function(args) {
										var columnName = args.columnName;
										var selectedRows = args.selectedRows;
										if (!selectedRows.isEmpty()) {
											this.set(columnName, selectedRows.getByIndex(0));
										}
									}, this, null, false, false);
								};

								Terrasoft.each(item.columns, function(column) {
									var schemaColumns = item.entitySchema.columns[column.columnPath];
									if (schemaColumns) {
										column.type = 0;
									}
								});
							}, this);
							var gridData = this.get("GridData");
							gridData.loadAll(collection);
						}
					}, this);
				}
			});
		},

		getCurrentGrid: function() {
			return this.Ext.getCmp("ContainerGrid");
		},

		getViewModel: function() {
			return this.Ext.create(this.viewModelClass, {
				Ext: this.Ext,
				sandbox: this.sandbox,
				Terrasoft: this.Terrasoft
			});
		},

		config: {
			schema: {
				viewConfig: [
					{
						name: "LoadButton",
						click: {bindTo: "onLoadButtonClick"},
						caption: "Загрузка",
						style: Terrasoft.controls.ButtonEnums.style.BLUE,
						itemType: Terrasoft.ViewItemType.BUTTON
					},
					{
						name: "Container",
						itemType: Terrasoft.ViewItemType.EXTENDED_GRID,
						"activeRow": { "bindTo": "ActiveRow" },
						"beforeChangedRow": {"bindTo": "changedRow" },
						activeRowActions: [{
							className: "Terrasoft.Button",
							style: Terrasoft.controls.ButtonEnums.style.BLUE,
							caption: "Сохранить",
							tag: "save"
						}, {
							className: "Terrasoft.Button",
							style: Terrasoft.controls.ButtonEnums.style.GREY,
							caption: "Отмена",
							tag: "cancel"
						}],
						activeRowAction: {
							bindTo: "onActiveRowAction"
						},
						"collection": { "bindTo": "GridData" },
						"isLoading": { "bindTo": "IsGridLoading" },
						type: "listed",
						hierarchical: false,
						updateExpandHierarchyLevels: { bindTo: "onUpdateExpandHierarchyLevels" },
						listedConfig: {
							items: [
								{
									bindTo: "Name",
									position: {column: 0, colSpan: 6},
									caption: "Name"
								},
								{
									bindTo: "Price",
									position: {column: 6, colSpan: 6},
									caption: "Price"
								},
								{
									bindTo: "Order",
									position: {column: 12, colSpan: 6},
									caption: "Order"
								},
								{
									bindTo: "Quantity",
									position: {column: 18, colSpan: 6},
									caption: "Quantity"
								}
							]
						},
						tiledConfig: {
							grid: {columns: 24, rows: 2},
							items: [
								{
									bindTo: "Name",
									position: {row: 1, column: 0, colSpan: 18}
								}
							]
						}
					}
				]
			}
		},

		init: function() {
			if (!this.viewModel) {
				this.viewModelClass = this.getViewModelClass();
				this.config.viewModelClass = this.viewModelClass;
				this.viewModel = this.getViewModel(this.viewModelClass);
				this.viewModel.init();
			}
		},

		render: function(renderTo) {
			var viewGenerator = this.Ext.create("Terrasoft.ViewGenerator");
			viewGenerator.generate(this.config, function(viewConfig) {
				var containerName = "ExtGridContainer";
				var view = this.Ext.create("Terrasoft.Container", {
					id: containerName,
					selectors: {wrapEl: "#" +  containerName},
					items: this.Terrasoft.deepClone(viewConfig)
				});
				view.bind(this.viewModel);
				view.render(renderTo);
			}, this);
		}
	});
	return Terrasoft.ExtendedGridDemoModule;
});