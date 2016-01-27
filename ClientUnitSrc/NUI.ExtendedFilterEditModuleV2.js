define("ExtendedFilterEditModuleV2", ["ext-base", "terrasoft", "sandbox", "ExtendedFilterEditModuleV2Resources",
	"ExtendedFilterEditModelV2", "ExtendedFilterEditViewV2"],
	function(Ext, Terrasoft, sandbox, resources, ExtendedFilterEditModel, ExtendedFilterEditView) {

		var viewModel;
		var entitySchemaProvider;
		var filterManager;
		var isProviderInitialized = false;
		var isInitialized = false;
		var sectionCaption = "";
		var schema = sandbox.publish("GetModuleSchema", null, [sandbox.id]);
		var schemaName = schema ? schema.name : sandbox.publish("GetSectionSchemaName", null, [sandbox.id]);
		var extendedFilterViewId = "ExtendedFilterEditViewV2";
		var extendedFilterViewModelId = "ExtendedFilterEditModelV2";
		var isCustomFilter = false;
		var isHeaderVisible = true;
		var currentFolder = null;

		function init() {
			var state = sandbox.publish("GetHistoryState");
			var currentHash = state.hash;
			var currentState = state.state || {};
			if (currentState.moduleId === sandbox.id) {
				return;
			}
			isHeaderVisible = (currentHash.moduleName !== "FolderManager");
		}

		function destroy(config) {
			if (config.keepAlive) {
				return;
			}
			entitySchemaProvider.destroy();
			entitySchemaProvider = null;
			filterManager = null;
			requirejs.undef("EntitySchemaFilterProviderModule");
		}

		function initializeProvider(renderTo) {
			var filterConfig = sandbox.publish("GetExtendedFilter", null, [sandbox.id]);
			var filter = filterConfig.filter;
			if (!Ext.isEmpty(filter)) {
				if (filter.extendedFilterViewId) {
					extendedFilterViewId = filter.extendedFilterViewId;
					isCustomFilter = true;
				}
				if (filter.extendedFilterViewModelId) {
					extendedFilterViewModelId = filter.extendedFilterViewModelId;
					isCustomFilter = true;
				}
//				currentFolderName = filter.currentFolderName;
			}
			currentFolder = filterConfig.folder;

			var map = {};
			map.EntitySchemaFilterProviderModule = {
				sandbox: "sandbox_" + sandbox.id,
				"ext-base": "ext_" + Ext.id
			};
			requirejs.config({
				map: map
			});
			var entitySchemaName = Ext.isEmpty(filter) ? schemaName : filter.rootSchemaName || schemaName;
			require(["EntitySchemaFilterProviderModule"], function(EntitySchemaFilterProviderModule) {
					entitySchemaProvider = new EntitySchemaFilterProviderModule({
						rootSchemaName: entitySchemaName
					});
					filterManager = Ext.create("Terrasoft.FilterManager", {
						provider: entitySchemaProvider,
						rootSchemaName: entitySchemaName
					});
					filterManager.setFilters(filter || Ext.create("Terrasoft.FilterGroup"));

					var moduleStructure = Terrasoft.configuration.ModuleStructure;
					var sectionStructure = moduleStructure[schemaName];
					if (sectionStructure) {
						sectionCaption = sectionStructure.moduleCaption;
					}
					isProviderInitialized = true;
					render(renderTo);
				}
			);
		}

		function createFilterEditContainer(renderTo) {
			var view = ExtendedFilterEditView.generateView(renderTo);
			var filterEditContainer = Ext.create("Terrasoft.Container", view);
			filterEditContainer.bind(viewModel);
		}

		function render(renderTo) {
			if (!isProviderInitialized) {
				initializeProvider(renderTo);
				return;
			}
			entitySchemaProvider.renderTo = renderTo;
			if (isInitialized) {
				createFilterEditContainer(renderTo);
				return;
			}
			require([extendedFilterViewId, extendedFilterViewModelId],
				function(filterView, filterViewModel) {
					ExtendedFilterEditView = filterView;
					ExtendedFilterEditModel = filterViewModel;
					viewModel = ExtendedFilterEditModel.generateModel(sandbox, renderTo);
					viewModel = Ext.create("Terrasoft.BaseViewModel", viewModel);
					viewModel.set("FilterManager", filterManager);
					viewModel.set("EntitySchemaName", Ext.String.format("{0} {1}",
						resources.localizableStrings.ExtendedFilterSettingsCaption, sectionCaption));
					viewModel.set("isHeaderVisible", isHeaderVisible);
					//viewModel.set("currentFolderName", currentFolderName);
					if (isCustomFilter) {
						viewModel.set("sectionEntitySchemaName", schemaName);
						viewModel.assignEntitySchema(filterManager.filters, true);
					}
					viewModel.initActionFired();
					viewModel.set("activeFolder", currentFolder);
					createFilterEditContainer(renderTo);
					isInitialized = true;
				}
			);
		}

		return {
			init: init,
			render: render,
			destroy: destroy
		};
	});