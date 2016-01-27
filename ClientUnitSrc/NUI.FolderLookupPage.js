define('FolderLookupPage', ['ext-base', 'terrasoft', 'sandbox', 'FolderLookupPageResources', 'ContactFolder',
		'ConfigurationConstants', 'ResponseExceptionHelper', 'MaskHelper'], function(Ext, Terrasoft, sandbox, resources,
		ContactFolder, ConfigurationConstants, ResponseExceptionHelper, MaskHelper) {

	var config = /*TODO удалить после тестирования*/{entitySchema: ContactFolder};
	var container;
	var viewModel;
	var view;
	var folderView;
	var entitySchemaProvider;
	var filterManager;
	var isProviderInitialized = false;
	var topLevelRecordItem = null;
	var topLevelRecord = null;
	var FolderLookupPageView;
	var FolderLookupPageViewModel;

	function init() {
		var state = sandbox.publish('GetHistoryState');
		var currentHash = state.hash;
		var currentState = state.state || {};
		if (currentState.moduleId === sandbox.id) {
			return;
		}
		sandbox.publish('ReplaceHistoryState', {
			stateObj: {
				moduleId: sandbox.id
			},
			pageTitle: null,
			hash: currentHash.historyState,
			silent: true
		});
		config = sandbox.publish('FolderInfo', null, [sandbox.id]);
		if (config.currentFilter) {
			config.enableMultiSelect = true;
			config.selectedFolders = [config.currentFilter];
			config.currentFilter = null;
			config.multiSelect = true;
		}
		if (!config.folderFilterViewId) {
			config.folderFilterViewId = 'FolderLookupPageView';
		}
		if (!config.folderFilterViewModelId) {
			config.folderFilterViewModelId = 'FolderLookupPageViewModel';
		}
	}

	function render(renderTo) {
		if (!isProviderInitialized) {
			initializeProvider(renderTo);
			return;
		}
		entitySchemaProvider.renderTo = renderTo;
		container = renderTo;
		if (config.entitySchema) {
			initializeModule();
		}
		else {
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
			FolderLookupPageView = filterView;
			FolderLookupPageView.sandbox = sandbox;
			FolderLookupPageViewModel = filterViewModel;
			FolderLookupPageViewModel.sandbox = sandbox;
			FolderLookupPageViewModel.renderTo = container;
			var firstLoad = false;
			if (!viewModel) {
				firstLoad = true;
				topLevelRecordItem = {
					value: Terrasoft.GUID_EMPTY,
					displayValue: config.entitySchema.caption
				};
				var viewModelConfig = FolderLookupPageViewModel.generate(config);
				viewModelConfig.methods.resultSelectedFolders = resultSelectedFolders;
				viewModelConfig.methods.cancelSelecting = cancelSelecting;
				//viewModelConfig.methods.addGeneralFolderButton = addGeneralFolderButton;
				viewModelConfig.methods.addSearchFolderButton = addSearchFolderButton;
				viewModelConfig.methods.getFolderEditViewModel = getFolderEditViewModel;
				viewModelConfig.methods.editRights = editRights;
				viewModelConfig.methods.changeGridMode = changeGridMode;
				viewModelConfig.methods.changeFolderParent = changeFolderParent;
				viewModelConfig.methods.onDeleteAccept = onDeleteAccept;
				viewModelConfig.methods.getTopLevelRecord = getTopLevelRecord;
				viewModelConfig.methods.editButton = editButton;
				viewModel = Ext.create('Terrasoft.BaseViewModel', viewModelConfig);
				viewModel.topLevelRecordItem = topLevelRecordItem;
				viewModel.currentEditElement =
					viewModel.getFolderEditViewModel(ConfigurationConstants.Folder.Type.General);
				viewModel.load(true);
			}
			var viewConfig = FolderLookupPageView.generate();
			view = Ext.create('Terrasoft.Container', viewConfig);
			view.bind(viewModel);
			var folderViewConfig = FolderLookupPageView.getFolderView();
			folderView = Ext.create('Terrasoft.ControlGroup', folderViewConfig);
			var filterEditContainer = view.items.items[3];
			filterEditContainer.items.add('innerContainer', folderView);
			viewModel.currentEditElement.set('filterEditContainer', filterEditContainer);
			var sectionSchema = config.sectionEntitySchema;
			if (sectionSchema) {
				var currentModule = Terrasoft.configuration.ModuleStructure[sectionSchema.name];
				if (currentModule) {
					var headerName = resources.localizableStrings.StaticCaptionPartHeaderGroup + ' ' +
						currentModule.moduleCaption;
					viewModel.set('groupPageCaption', headerName);
				}
			}
			folderView.bind(viewModel.currentEditElement);
			view.render(container);
			MaskHelper.HideBodyMask();
			var activeRow = viewModel.get('activeRow');
			if (firstLoad && activeRow) {
				viewModel.showFolderInfo(activeRow);
			}
		});
	}

	function resultSelectedFolders(selectedFolders) {
		if (config.loadSection) {
			loadSection(selectedFolders);
		} else {
			sandbox.publish('ResultSelectedFolders', {
				folders: selectedFolders
			}, [sandbox.id]);
			sandbox.publish('BackHistoryState');
		}
	}

	function cancelSelecting() {
		if (config.loadSection) {
			loadSection();
		} else {
			sandbox.publish('BackHistoryState');
		}
	}

	function loadSection(selectedFolders) {
		var newState = {
			filterState: {
				folderFilterState: selectedFolders || []
			}
		};
		var url = "SectionModule/" + config.loadSection + "/";
		sandbox.publish('PushHistoryState', { hash: url, stateObj: newState });
	}

	function getTopLevelRecord(rowConfig) {
		if (!topLevelRecord) {
			topLevelRecord = Ext.create("Terrasoft.BaseViewModel", {
				entitySchema: config.entitySchema,
				rowConfig: rowConfig,
				values: {
					Id: topLevelRecordItem.value,
					Name: topLevelRecordItem.displayValue,
					Parent: '',
					FolderType: {
						value: ConfigurationConstants.Folder.Type.General
					}
				},
				isNew: false,
				isDeleted: false
			});
		}
		return topLevelRecord;
	}

	function addGeneralFolderButton() {
		//var activeRow = getActiveRow();
		//this.currentEditElement.createNewFolder(ConfigurationConstants.Folder.Type.General, activeRow);
		//this.set('folderInfoVisible', false);
		//this.editButton();
	}

	function addSearchFolderButton() {
		var activeRow = getActiveRow();
		this.currentEditElement.createNewFolder(ConfigurationConstants.Folder.Type.Search, activeRow);
		this.set('folderInfoVisible', true);
		this.editButton();
	}

	function editButton() {
		var caption = null;
		var modifyFolderFunc = config.modifyFolderFunc;
		var controls = {
			name: {
				dataValueType: Terrasoft.DataValueType.TEXT,
				caption: this.entitySchema.primaryDisplayColumn.caption,
				value: this.currentEditElement.get(this.entitySchema.primaryDisplayColumnName)
			}
		};
		if (modifyFolderFunc != null && typeof(modifyFolderFunc) === 'function') {
			controls = modifyFolderFunc.call(this, 'get');
		}
		if (this.currentEditElement.isNew) {
			if (this.currentEditElement.get('FolderType').value === ConfigurationConstants.Folder.Type.Search) {
				caption = resources.localizableStrings.NewSearchFolderInputBoxCaption;
			}
			else {
				caption = resources.localizableStrings.NewSearchFolderInputBoxCaption;//resources.localizableStrings.NewGeneralFolderInputBoxCaption;
			}
		}
		Terrasoft.utils.inputBox(
			caption,
			nameInputBoxHandler,
			['ok', 'cancel'],
			this,
			controls,
			{
				defaultButton: 0,
				classes: {
					coverClass: ['cover-calss1', 'cover-calss2'],
					captionClass: ['caption-calss1', 'caption-calss2']
				}
			}
		);
	}

	function nameInputBoxHandler(returnCode, controlData) {
		var modifyFolderFunc = config.modifyFolderFunc;
		if (returnCode === 'ok' && controlData.name.value) {
			this.currentEditElement.set(this.entitySchema.primaryDisplayColumnName, controlData.name.value);

			if (modifyFolderFunc != null && typeof(modifyFolderFunc) === 'function') {
				var modifyColumn = config.modifyFolderFunc.call(this, 'set', controlData);
				if (modifyColumn != null && modifyColumn.columnName != null) {
					this.currentEditElement.set(modifyColumn.columnName, modifyColumn.columnValue);
				}
			}
			this.currentEditElement.saveButton();
		}
		else {
			this.currentEditElement.cancelButton();
		}
	}

	function getFolderEditViewModel(folderType) {
		var viewModelConfig = FolderLookupPageViewModel.getFolderViewModelConfig(this.entitySchema, this);
		viewModelConfig.methods.getActiveRow = getActiveRow;
		var folderViewModel = Ext.create('Terrasoft.BaseViewModel', viewModelConfig);
		folderViewModel.set('FolderType', {value: folderType});
		filterManager.setFilters(Ext.create('Terrasoft.FilterGroup'));
		folderViewModel.set('FilterManager', filterManager);
		if (config && config.sectionEntitySchema) {
			folderViewModel.set('sectionEntitySchemaName', config.sectionEntitySchema.name);
		}
		return folderViewModel;
	}

	function getActiveRow() {
		return viewModel.get('activeRow');
	}

	function initializeProvider(renderTo) {
		var map = {};
		map.EntitySchemaFilterProviderModule = {
			sandbox: 'sandbox_' + sandbox.id,
			'ext-base': 'ext_' + Ext.id
		};
		requirejs.config({
			map: map
		});
		require(['EntitySchemaFilterProviderModule'], function(EntitySchemaFilterProviderModule) {
				entitySchemaProvider = new EntitySchemaFilterProviderModule({
					rootSchemaName: config.sectionEntitySchema.name
				});
				filterManager = Ext.create('Terrasoft.FilterManager', {
					provider: entitySchemaProvider,
					rootSchemaName: config.sectionEntitySchema.name
				});
				isProviderInitialized = true;
				render(renderTo);
			}
		);
	}

	function changeGridMode(multiSelect, callback) {
		this.set('administratedButtonVisible', this.entitySchema.administratedByRecords && !multiSelect);
		this.set('multiSelect', multiSelect);
		this.set('selectEnabled', multiSelect);
		this.clear();
		this.load(true, callback);
		this.showFolderInfo();
	}

	function destroy(config) {
		if (config.keepAlive) {
			return;
		}
		entitySchemaProvider.destroy();
		entitySchemaProvider = null;
		filterManager.destroy();
		filterManager = null;
		requirejs.undef('EntitySchemaFilterProviderModule');
	}

	function changeFolderParent(folders, parentId, callback) {
		var mainViewModel = this;
		var folderId = folders.pop();
		if (folderId === parentId || !parentId || parentId === topLevelRecordItem.value) {
			parentId = null;
		}
		var folder = Ext.create('Terrasoft.BaseViewModel',
			FolderLookupPageViewModel.getFolderViewModelConfig(this.entitySchema));
		folder.loadEntity(folderId, function() {
			this.set('Parent', {value: parentId});
			if (folders.length) {
				this.saveEntity(function(result) {
					if (result.success) {
						mainViewModel.changeFolderParent(folders, parentId, callback);
					}
					else {
						this.showInformationDialog(result.errorInfo.message);
					}
				}, mainViewModel);
			} else {
				this.saveEntity(function(result) {
					if (result.success) {
						mainViewModel.set('activeRow', null);
						callback.call(mainViewModel);
					}
					else {
						this.showInformationDialog(result.errorInfo.message);
					}
				}, mainViewModel);
			}
		});
	}

	function onDeleteAccept() {
		var activeRow = this.get('activeRow');
		var selectedRows = this.get('selectedRows') || [];
		if (selectedRows.length || activeRow) {
			var selectedValues = selectedRows.length ? selectedRows : [activeRow];
			var query = Ext.create("Terrasoft.DeleteQuery", {
				rootSchema: this.entitySchema
			});
			var filter = query.createColumnInFilterWithParameters(this.entitySchema.primaryColumnName,
				selectedValues);
			query.filters.addItem(filter);
			query.execute(function(response) {
				if (response.success) {
					this.onDeleted(selectedValues);
				} else {
					this.showInformationDialog(ResponseExceptionHelper.GetExceptionMessage(response.errorInfo));
				}
			}, this);
		}
	}

	function editRights() {
		sandbox.subscribe('GetRecordInfo', function() {
			return recordInfo;
		});
		var recordInfo = {
			entitySchemaName: this.entitySchema.name,
			entitySchemaCaption: this.entitySchema.caption,
			primaryColumnValue: this.currentEditElement.get(this.entitySchema.primaryColumnName),
			primaryDisplayColumnValue: this.currentEditElement.get(this.entitySchema.primaryDisplayColumnName)
		};
		var id = sandbox.id + '_Rights';
		var renderTo = Ext.get('centerPanel');
		var params = sandbox.publish('GetHistoryState');
		sandbox.publish('PushHistoryState', { hash: params.hash.historyState });
		sandbox.loadModule('Rights', {
			renderTo: renderTo,
			id: id,
			keepAlive: true
		});
	}

	return {
		render: render,
		init: init,
		destroy: destroy
	};
});