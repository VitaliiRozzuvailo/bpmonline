define("AccountOrganizationChartDetail", ["AccountOrganizationChart",
"AccountOrganizationChartDetailStructure", "AccountOrganizationChartDetailResources"],
function(AccountOrganizationChart, structure, resources) {
	structure.userCode = function() {
		this.entitySchema = AccountOrganizationChart;
		this.name = "AccountOrganizationChartDetailViewModel";
		this.editPageName = "AccountOrganizationChartPage";
		this.hierarchicalGrid = true;
		this.loadAll = true;
		this.columnsConfig = [
			[
				{
					cols: 24,
					key: [
						{
							name: {
								bindTo: "CustomDepartmentName"
							},
							type: "title"
						}
					]
				}
			]
		];
		this.loadedColumns = [
			{
				columnPath: "CustomDepartmentName"
			}, {
				columnPath: "Parent"
			}
		];
		this.editPages = [
			{
				caption: resources.localizableStrings.AddItem,
				name: "AddItem",
				UId: ""
			}, {
				caption: resources.localizableStrings.AddChildItem,
				name: "AddChildItem",
				UId: "",
				bindTo: "addChild",
				enabled: {
					bindTo: "isSomeSelected"
				}
			}
		];
		this.methods.addChild = function() {
			this.add(null, function() {
				var selectedRows = this.GetSelectedItems();
				if (!selectedRows) {
					return;
				}
				var scope = this;
				var recordId = selectedRows[0];
				var accountObj = {
					name: this.filterPath,
					value: this.filterValue
				};
				var parentObj = {
					name: "Parent",
					value: recordId
				};
				var editPageName = this.editPageName;
				var sandbox = this.sandbox;
				var cardModuleId = sandbox.id + "_CardModule_" + this.entitySchema.name;
				sandbox.subscribe("CardModuleEntityInfo", function(args) {
					var entityInfo = {};
					entityInfo.action = "add";
					entityInfo.cardSchemaName = editPageName;
					entityInfo.activeRow = "";
					entityInfo.valuePairs = [];
					entityInfo.valuePairs.push(
						accountObj,
						parentObj);
					return entityInfo;
				}, [cardModuleId]);
				sandbox.publish("OpenCardModule", cardModuleId, [this.getCardModuleSandboxId()]);
				sandbox.subscribe("UpdateDetail", function(recordId) {
					var collection = scope.get("gridData");
					collection.clear();
					scope.load();
					scope.isObsolete = true;
				}, [cardModuleId]);
			});
		};
		this.methods.onDeleteAccept = function() {
			var selectedRows = this.GetSelectedItems();
			var grid = this.get("gridData");
			var batch = Ext.create("Terrasoft.BatchQuery");
			Terrasoft.each(selectedRows, function(recordId) {
				this.deleteItem(recordId, batch, this);
			}, this);
			if (batch.queries.length > 0) {
				batch.execute(this.onDeleted, this);
			}
		};
		this.methods.onDeleted = function(response) {
			if (response && response.success) {
				var collection = this.get("gridData");
				this.clearSelection();
				this.set("gridEmpty", !collection.getItems().length);
			} else {
				this.showConfirmationDialog(resources.localizableStrings.OnDeleteError);
			}
		};
		this.methods.deleteItem = function(recordId, batch, scope) {
			var grid = scope.get("gridData");
			var toDelete = new Terrasoft.Collection();
			grid.each(function(item) {
				var parent = item.get("Parent");
				if (parent && parent.value === recordId) {
					toDelete.add(item);
				}
			}, grid);

			Terrasoft.each(toDelete.getItems(), function(item) {
				this.deleteItem(item.get("Id"), batch, this);
			}, scope);
			if (grid.find(recordId)) {
				var selfDelete = grid.get(recordId);
				grid.remove(selfDelete);

				var query = Ext.create("Terrasoft.DeleteQuery", {
					rootSchema: scope.entitySchema
				});
				var filter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Id", recordId);
				query.filters.addItem(filter);
				batch.add(query);
			}
		};

		this.methods.setEntitySchema = function() {
			this.entitySchema = AccountOrganizationChart;
		};
	};
	return structure;
});