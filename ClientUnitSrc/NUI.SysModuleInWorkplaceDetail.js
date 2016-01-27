define("SysModuleInWorkplaceDetail", ["ext-base", "terrasoft", "sandbox", "SysModuleInWorkplace",
	"SysModuleInWorkplaceDetailStructure", "SysModuleInWorkplaceDetailResources", "LookupUtilities",
	"LocalizableHelper", "ServiceHelper"],
	function(Ext, Terrasoft, sandbox, entitySchema, structure, resources, LookupUtilities, LocalizableHelper,
		ServiceHelper) {
	structure.userCode = function() {
		this.loadAll = true;
		this.entitySchema = entitySchema;
		this.name = "SysModuleInWorkplaceDetailViewModel";
		this.columnsConfig = [];
		this.loadedColumns = [
			{
				columnPath: "Position"
			}
		];
		this.gridType = "tiled";
		this.methods.esqConfig = {
			sort: {
				columns: [
					{
						name: "Position",
						orderPosition: 0,
						orderDirection: Terrasoft.OrderDirection.ASC
					}
				]
			}
		};
		this.utilsConfig = {
			hideAction: true,
			hiddenCopy: true,
			hiddenEdit: true,
			hiddenView: true,
			hiddenSettings: true,
			useAdditionalAddButton: true
		};
		var parentAdd = this.methods.add;
		var setPosition = function(recordId, position, callback, scope) {
			var data = {
				tableName: entitySchema.name,
				primaryColumnValue: recordId,
				position: position,
				grouppingColumnNames: "SysWorkplaceId"
			};
			ServiceHelper.callService("RightsService", "SetCustomRecordPosition", callback, data, scope);
		};
		var scrollTo = document.body.scrollTop = document.documentElement.scrollTop = 0;
		this.methods.onActiveRowAction = function(tag) {
			if (tag === "delete") {
				this.delete();
			}
			var recordId = this.get("activeRow");
			var gridData = this.get("gridData");
			var activeRow = gridData.get(recordId);
			var position = activeRow.get("Position");
			if (tag === "up") {
				if (position > 0) {
					position--;
				}
			}
			if (tag === "down") {
				position++;
			}
			setPosition(recordId, position, function(response) {
				scrollTo = document.body.scrollTop || document.documentElement.scrollTop;
				gridData.clear();
				this.load();
			}, this);
		};
		this.methods.init = function() {
			if (!Ext.isEmpty(scrollTo) && scrollTo > 0) {
				Ext.getBody().dom.scrollTop = scrollTo;
				Ext.getDoc().dom.documentElement.scrollTop = scrollTo;
				scrollTo = 0;
			}
		};
		this.modifyGridConfig = function(config) {
			var customConfig = {
				activeRowAction: {
					bindTo: "onActiveRowAction"
				},
				activeRowActions: [
					{
						className: "Terrasoft.Button",
						style: Terrasoft.controls.ButtonEnums.style.BLUE,
						imageConfig: LocalizableHelper.localizableImages.Up,
						tag: "up"
					},
					{
						className: "Terrasoft.Button",
						style: Terrasoft.controls.ButtonEnums.style.BLUE,
						imageConfig: LocalizableHelper.localizableImages.Down,
						tag: "down"
					},
					{
						className: "Terrasoft.Button",
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: LocalizableHelper.localizableStrings.Delete,
						tag: "delete"
					}
				]
			};
			return Ext.apply(config, customConfig);
		};
		this.methods.add = function(tag) {
			parentAdd.call(this, null, this.addModule);
		};
		this.methods.addModule = function(tag) {
			var workplaceId = this.filterValue;
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "SysModuleInWorkplace"
			});
			esq.addColumn("SysModule.Id", "SysModuleId");
			esq.filters.add("ExistsFilter", Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "SysWorkplace", workplaceId));
			esq.getEntityCollection(function(result) {
				var existsCollection = [];
				if (result.success) {
					Terrasoft.each(result.collection.getItems(), function(item) {
						existsCollection.push(item.get("SysModuleId"));
					});
				}
				var config = {
					entitySchemaName: "SysModule",
					multiSelect: true
				};
				var filterGroup = Terrasoft.createFilterGroup();
				if (existsCollection.length > 0) {
					var existsFilter = Terrasoft.createColumnInFilterWithParameters("Id", existsCollection);
					existsFilter.comparisonType = Terrasoft.ComparisonType.NOT_EQUAL;
					filterGroup.add("existsFilter", existsFilter);
				}
				var nuiModulesFilter = Terrasoft.createColumnIsNotNullFilter("SectionModuleSchemaUId");
				filterGroup.add("nuiModulesFilter", nuiModulesFilter);
				config.filters = filterGroup;
				LookupUtilities.ThrowOpenLookupMessage(sandbox, config, this.addCallBack, this,
					this.getCardModuleSandboxId());

			}, this);
		};
		this.methods.addCallBack = function(args) {
			var bq = Ext.create("Terrasoft.BatchQuery");
			this.selectedRows = args.selectedRows.getItems();
			this.selectedItems = [];
			this.selectedRows.forEach(function(item) {
				bq.add(this.getInsertQuery(item));
				this.selectedItems.push(item.value);
			}, this);
			if (bq.queries.length) {
				bq.execute(this.onItemInsert, this);
			}
		};
		this.methods.getInsertQuery = function(item) {
			var insert = Ext.create("Terrasoft.InsertQuery", {
				rootSchemaName: "SysModuleInWorkplace"
			});
			insert.setParameterValue("SysModule", item.value, Terrasoft.DataValueType.GUID);
			insert.setParameterValue("SysWorkplace", this.filterValue, Terrasoft.DataValueType.GUID);
			return insert;
		};
		this.methods.onItemInsert = function(response) {
			if (response && response.success) {
				var queryResult = response.queryResults;
				var rowIds = [];
				Terrasoft.each(queryResult, function(item) {
					if (item.id) {
						rowIds.push(item.id);
					}
				});
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchema: entitySchema
				});
				var loadedColumns = this.loadedColumns;
				if (loadedColumns) {
					for (var column in loadedColumns) {
						esq.addColumn(loadedColumns[column].columnPath);
					}
				}
				var filter = Terrasoft.createColumnInFilterWithParameters("Id", rowIds);
				filter.comparisonType = Terrasoft.ComparisonType.EQUAL;
				esq.filters.add("id", filter);
				esq.getEntityCollection(function(response) {
					var items = response.collection.getItems();
					if (items.length > 0) {
						var collection = new Terrasoft.Collection();
						Terrasoft.each(items, function(item) {
							collection.add(item.get("Id"), item);
						});
						this.set("gridEmpty", false);
						var gridData = this.get("gridData");
						gridData.loadAll(collection);
					}
				}, this);
			}
		};
		this.methods.dblClickGridDetail = function() {
			return false;
		};
	};
	return structure;
});