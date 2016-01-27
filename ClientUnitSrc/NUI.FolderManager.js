define("FolderManager", ["ext-base", "terrasoft", "sandbox", "FolderManagerResources", "ConfigurationConstants",
		"MaskHelper"],
	function(Ext, Terrasoft, sandbox, resources, ConfigurationConstants,
			MaskHelper) {

		var config;
		var container;
		var viewModel;
		var view;
		var FolderManagerView;
		var FolderManagerViewModel;

		function init() {
			config = sandbox.publish("FolderInfo", null, [sandbox.id]);
			config.enableMultiSelect = true;
			if (config.currentFilter) {
				config.enableMultiSelect = true;
				config.selectedFolders = [config.currentFilter];
				config.currentFilter = null;
				config.multiSelect = true;
			}
			if (!config.folderFilterViewId) {
				config.folderFilterViewId = "FolderManagerView";
			}
			if (!config.folderFilterViewModelId) {
				config.folderFilterViewModelId = "FolderManagerViewModel";
			}
			config.allFoldersRecordItem = {
				value: Terrasoft.GUID_EMPTY,
				displayValue: resources.localizableStrings.AllFoldersCaption
			};
			config.favoriteRootRecordItem = {
				value: Terrasoft.generateGUID(),
				displayValue: resources.localizableStrings.FavoriteFoldersCaption
			};
		}

		function render(renderTo) {
			container = renderTo;
			if (config.entitySchema) {
				initializeModule();
			} else {
				sandbox.requireModuleDescriptors([config.entitySchemaName], function() {
					require([config.entitySchemaName], function(schema) {
						config.entitySchema = schema;
						initializeModule();
					});
				});
			}
		}

		function initializeModule() {
			require([config.folderFilterViewId, config.folderFilterViewModelId], function(filterView, filterViewModel) {
				FolderManagerView = filterView;
				FolderManagerView.sandbox = sandbox;
				FolderManagerViewModel = filterViewModel;
				FolderManagerViewModel.sandbox = sandbox;
				FolderManagerViewModel.renderTo = container;
				var firstLoad = false;
				if (!viewModel) {
					firstLoad = true;
					var viewModelConfig = FolderManagerViewModel.generate(sandbox, config);
					viewModel = Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
					viewModel.allFoldersRecordItem = config.allFoldersRecordItem;
					viewModel.favoriteRootRecordItem = config.favoriteRootRecordItem;
					viewModel.currentEditElement =
						viewModel.getFolderEditViewModel(ConfigurationConstants.Folder.Type.General);
					viewModel.renderTo = container;
					viewModel.set("administratedButtonVisible", false);
					if (config.hasOwnProperty("useStaticFolders")) {
						viewModel.set("UseStaticFolders", config.useStaticFolders);
					}
					viewModel.load(true);
				}
				var viewConfig = FolderManagerView.generate();
				view = Ext.create("Terrasoft.Container", viewConfig);
				view.bind(viewModel);
				var sectionSchema = config.sectionEntitySchema;
				if (sectionSchema) {
					var currentModule = Terrasoft.configuration.ModuleStructure[sectionSchema.name];
					if (currentModule) {
						var headerName = Ext.String.format("{0} {1}",
							resources.localizableStrings.StaticCaptionPartHeaderGroup, currentModule.moduleCaption);
						viewModel.set("groupPageCaption", headerName);
					}
				}
				view.render(container);
				MaskHelper.HideBodyMask();
				var activeRow = config.activeFolderId;
				viewModel.setActiveRow(activeRow);
				sandbox.subscribe("AddFolderActionFired", function(config) {
					switch (config.type) {
						case "generalFolder":
							viewModel.addGeneralFolderButton();
							break;
						case "searchFolder":
							viewModel.addSearchFolderButton();
							break;
					}
				});
			});
		}

		return {
			render: render,
			init: init
		};
	});
