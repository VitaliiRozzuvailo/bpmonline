define('FileDetail', ['ext-base', 'terrasoft', 'sandbox', 'FileDetailStructure', 'FileDetailResources',
	'ConfigurationConstants', 'ConfigurationEnums', 'ConfigurationFileApi', 'ViewUtilities'],
	function(Ext, Terrasoft, sandbox, structure, resources, ConfigurationConstants, ConfigurationEnums,
	         ConfigurationFileApi, ViewUtilities) {

		var self;
		var loadedFileId = null;
		var newLoadedCount = 1;
		structure.userCode = function() {
			this.utilsConfig = {
				hiddenAdd: true,
				hiddenEdit: true,
				hiddenCopy: true,
				hiddenSettings: false,
				useAdditionalAddButton: true
			};
			this.name = 'FileDetailViewModel';
			if (this.entitySchema) {
				this.captionsConfig = [{
					cols: 18,
					name: this.entitySchema.columns.Name.caption
				}, {
					cols: 6,
					name: this.entitySchema.columns.CreatedBy.caption
				}];
			}
			this.columnsConfig = [{
				link: {bindTo: 'getLink'},
				cols: 18,
				key: [{name: {bindTo: 'Name'}}]
			}, {
				cols: 6,
				key: [{name: {bindTo: 'CreatedBy'}}]
			}];
			this.loadedColumns = [{
				columnPath: 'Name'
			}, {
				columnPath: 'Notes'
			}, {
				columnPath: 'Type'
			}, {
				columnPath: 'CreatedBy'
			}, {
				columnPath: 'LockedOn'
			}, {
				columnPath: 'LockedBy'
			}];
			this.actions = [{
				caption: resources.localizableStrings.AddLinkCaption,
				tag: 'addLinkButton',
				click: {bindTo: 'onAddLink'},
				enabled: {bindTo: 'isEditActionsVisible'}
			}, {
				caption: resources.localizableStrings.ActionDeleteCaption,
				tag: 'Delete',
				click: {bindTo: 'delete'},
				enabled: {bindTo: 'isAnySelected'},
				visible: {bindTo: 'isEditActionsVisible'}
			}, {
				caption: resources.localizableStrings.ActionChangeSettingsCation,
				tag: 'ChangeSettings',
				click: {bindTo: 'onChangeSettingsActions'},
				enabled: {bindTo: 'isLinkSelected'},
				visible: {bindTo: 'isEditActionsVisible'}
			}, {
				caption: resources.localizableStrings.ActionLockCaption,
				tag: 'Lock',
				visible: false,
				click: {bindTo: 'onChangeLockAction'},
				enabled: {bindTo: 'isSomeUnLocked'}
			}, {
				caption: resources.localizableStrings.ActionUnlockCaption,
				tag: 'Unlock',
				visible: false,
				click: {bindTo: 'onChangeLockAction'},
				enabled: {bindTo: 'isSomeLocked'}
			}, {
				caption: resources.localizableStrings.ActionShowLogCaption,
				tag: 'ShowLog',
				visible: false,
				click: {bindTo: 'onShowLogAction'},
				enabled: {bindTo: 'isSomeSelected'}
			}, {
				caption: {bindTo: 'getGridModeCaption'},
				click: {bindTo: 'switchGridMode'},
				visible: {bindTo: 'isEditActionsVisible'}
			}];

			var baseOnDeleted = this.methods.onDeleted;

			this.methods.modifyItems = function(items) {
				for (var index in items) {
					if (items.hasOwnProperty(index)) {
						items[index].getLink = function() {
							var id = this.get('Id');
							var type = this.get('Type');
							var name = this.get('Name');
							var notes = this.get('Notes');
							var target = '_self';
							var link;
							if (type.value === ConfigurationConstants.FileType.File) {
								link = '../rest/FileService/GetFile/' + this.entitySchema.uId + '/' + id;
								notes = name;
							} else {
								var rg = new RegExp('((ftp|http|https):\/\/)+', 'i');
								link = rg.test(name) ? name : 'http://' + name;
								target = '_blank';
							}
							return {
								url: link,
								title: notes,
								target: target
							};
						};
					}
				}
			};
			this.methods.onFileSelect = function(files) {
				if (files.length <= 0) {
					return;
				}
				this.add(null, function() {
					var callbackSuccess = function(loadedFileId) {
						var fileData = {
							value: loadedFileId,
							displayValue: 'File'
						};
					};
					var callbackError = function() {
						this.showInformationDialog(resources.localizableStrings.UploadFileError);
					};
					var config = {
						onComplete: callbackSuccess,
						onError: callbackError,
						entitySchemaName : this.entitySchema.name,
						columnName : 'Data',
						scope: this,
						parentColumnName : this.filterPath,
						parentColumnValue : this.filterValue
					};
					config.file = files[0];
					var callback = function() {
						var gridData = this.get('gridData');
						var newItem = gridData.createItem({
							Id: loadedFileId,
							Name: config.file.name,
							CreatedBy: Terrasoft.SysValue.CURRENT_USER_CONTACT,
							Type: { value: ConfigurationConstants.FileType.File },
							CreatedOn: new Date()
						});
						newItem.entitySchema = this.entitySchema;
						var displayColumns = ['Name', 'CreatedBy'];
						Terrasoft.each(displayColumns, function(columnName) {
							var column = this.entitySchema.columns[columnName];
							newItem.columns[columnName] = {
								columnPath: columnName,
								dataValueType: column.dataValueType,
								isLookup: column.isLookup,
								referenceSchemaName: column.referenceSchemaName
							};
							if (column.isLookup) {
								newItem.columns[columnName].primaryImageColumnName = "Photo32";
							}
						}, this);
						var newItems = [newItem];
						this.modifyItems(newItems);
						this.set('gridEmpty', false);
						gridData.loadAll(prepareCollectionForLoading(newItems));
						sandbox.publish('DetailChanged', [sandbox.id, null]);
					};
					loadedFileId = Terrasoft.ConfigurationFileApi.upload(config, callback);
					newLoadedCount = newLoadedCount + 1;
				});
			};
			this.methods.onDeleted = function(response) {
				baseOnDeleted.call(this, response);
				this.reloadKeys.call(this);
			};
			this.methods.onAddFileClick = function(event) {
			};
			this.methods.reloadKeys = function() {
				var gridData = this.get('gridData');
				var selectedRows = this.getSelectedItems();
				if (Ext.isEmpty(selectedRows)) {
					selectedRows = [];
				}
				var newSelectedRows = [];
				var items = gridData.getItems();
				var map = gridData.collection.map;
				var keys = gridData.collection.keys;
				Terrasoft.each(items, function(gridDataItem, index) {
					var itemId = gridDataItem.get('Id');
					if (selectedRows.indexOf(itemId) >= 0) {
						newSelectedRows.push(itemId);
					}
					map[itemId] = gridDataItem;
					keys[index] = itemId;
				}, this);
				this.setSelectedItems(newSelectedRows);
				gridData.collection.rebuildIndexMap();
			};
			this.methods.isLinkSelected = function() {
				var collection = this.getRows(ConfigurationConstants.FileType.Link, true);
				return (collection.length > 0) && this.isSomeSelected();
			};
			this.methods.isSomeLocked = function(tag) {
				var collection = this.getRows(ConfigurationConstants.FileType.File, true);
				return (collection.length > 0) && this.isSomeSelected();
			};
			this.methods.isSomeUnLocked = function(tag) {
				var collection = this.getRows(ConfigurationConstants.FileType.File, false);
				return (collection.length > 0) && this.isSomeSelected();
			};
			this.methods.getRows = function(type, isLocked) {
				var response = [];
				var selectedRows = this.getSelectedItems();
				if (Ext.isEmpty(selectedRows)) {
					selectedRows = [];
				}
				var collection = this.get('gridData');
				Terrasoft.each(selectedRows, function(rowId) {
					var item = collection.get(rowId);
					var lockedBy = item.get('LockedBy') || null;
					if ((type === ConfigurationConstants.FileType.File && type === item.get('Type').value &&
						isLocked !== Ext.isEmpty(lockedBy)) ||
						(type === ConfigurationConstants.FileType.Link && type === item.get('Type').value) ||
						(Ext.isEmpty(type))) {
						response.push(item);
					}
				}, this);
				return response;
			};
			this.methods.onChangeSettingsActions = function(tag) {
				var selectedRows = this.getSelectedItems();
				var collection = this.get('gridData');
				var viewModel = collection.get(selectedRows[0]);
				var typeId = viewModel.get('Type').value;
				var viewModelId = viewModel.get('Id');
				if (typeId !== ConfigurationConstants.FileType.File) {
					openLoadLinkPageModule.call(this, 'edit', viewModelId);
				}
			};
			this.methods.onChangeLockAction = function(tag) {
				this.changeLock(tag === 'Lock');
			};
			this.methods.changeLock = function(isLocked) {
				var collection = this.getRows(ConfigurationConstants.FileType.File, !isLocked);
				Terrasoft.each(collection, function(item) {
					var itemId = item.get('Id');
					var currentDateTime = new Date();
					var update = Ext.create("Terrasoft.UpdateQuery", {
						rootSchemaName: this.entitySchema.name
					});
					update.enablePrimaryColumnFilter(itemId);
					update.setParameterValue("LockedOn", currentDateTime, Terrasoft.DataValueType.DATE_TIME);
					if (isLocked) {
						update.setParameterValue("LockedBy", Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
							Terrasoft.DataValueType.GUID);
					} else {
						update.setParameterValue("LockedBy", null, Terrasoft.DataValueType.GUID);
					}
					update.execute(function(response) {
						var gridData = this.get('gridData');
						var items = gridData.getItems();
						gridData.clear();
						Terrasoft.each(items, function(gridDataItem) {
							if (gridDataItem.get('Id') === itemId) {
								gridDataItem.set('LockedBy', (isLocked) ?
									Terrasoft.SysValue.CURRENT_USER_CONTACT :
									null);
							}
						}, this);
						gridData.loadAll(prepareCollectionForLoading(items));
					}, this);
				}, this);
			};
			this.methods.onShowLogAction = function() {
			};
			this.methods.onAddLink = function() {
				this.add(null, function() {
					openLoadLinkPageModule.call(this, 'add');
				});
			};
			this.methods.init = function() {
				self = this;
			};
			this.methods.addDragDropZone = function(viewConfig, containerPrefix) {
				var dragDropZoneContainer =  ViewUtilities.getContainerConfig('drag-zone-' + containerPrefix);
				var name = viewConfig.id + '-drag-zone';
				var html = '<div id="' + name + '" class="drag-drop-zone"></div>';
				//			var html = '<a href="#" id="' + name + '" class="drag-drop-zone"></a>';
				var dragDropZone = {
					id: name,
					className: 'Terrasoft.HtmlControl',
					html: html,
					selectors: {wrapEl: '#' + name},
					onAfterRender: function() {
						var el = document.getElementById(name);
						if (!el) {
							return;
						}
						el.onclick = function(e) {
							return false;
						};
						el.ondragenter = function(e) {
							e.stopPropagation();
							e.preventDefault();
							this.style.borderColor = '#4b7fc7';
						};
						//					el.onDragStart = function(e) {
						//						e.stopPropagation();
						//						e.preventDefault();
						//						e.dataTransfer.setData("text/plain", event.target.textContent)
						//					};
						el.ondragleave = function(e) {
							e.stopPropagation();
							e.preventDefault();
							this.style.borderColor = "#bbb";
						};
						el.ondragover = function(e) {
							e.stopPropagation();
							e.preventDefault();
						};
						el.ondrop = function(e) {
							e.stopPropagation();
							e.preventDefault();
							this.style.borderColor = "#bbb";
							var dataTransfer = e.dataTransfer;
							var files = dataTransfer.files;
							if (files) {
								self.onFileSelect(files);
							}
						};
					}
				};
				dragDropZoneContainer.items.push(dragDropZone);
				viewConfig.items.push(dragDropZoneContainer);
			};
			this.methods.loadNext = function() {
				var args = this.args;
				if (loadedFileId) {
					args.newLoadedCount = newLoadedCount;
					loadedFileId = null;
					newLoadedCount = 1;
				}
				this.load(args);
			};
			this.methods.modifyView = function(viewConfig, containerPrefix, operationType) {
				var addButton = viewConfig.items[0].items[1];
				addButton.tag = 'addFileButton';
				addButton.fileUpload = true;
				addButton.filesSelected = {
					bindTo: 'onFileSelect'
				};
				addButton.click = {
					bindTo: 'onAddFileClick'
				};
				var isCompatible = !(Ext.isIE8 || Ext.isIE9);
				if (isCompatible && operationType !== ConfigurationEnums.CardState.View) {
					this.addDragDropZone(viewConfig, containerPrefix);
				}
			};
		};

		function prepareCollectionForLoading(collection) {
			var result = {};
			Terrasoft.each(collection, function(item) {
				var id = item.get('Id');
				result[id] = item;
			});
			return result;
		}

		function openLoadLinkPageModule(action, rowId) {
			var viewModel = this;
			var recordId = rowId || this.filterValue;
			var filterPath = this.filterPath;
			var cardModuleId = this.sandbox.id + '_CardModule_' + this.entitySchema.name;
			this.sandbox.subscribe('CardModuleEntityInfo', function(args) {
				var entityInfo = {};
				entityInfo.action = action;
				entityInfo.cardSchemaName = 'LinkPage';
				entityInfo.activeRow = recordId;
				entityInfo.valuePairs = [{
					name: 'Page',
					value: filterPath
				}, {
					name: 'EntitySchemaName',
					value: viewModel.entitySchema.name
				}, {
					name: filterPath,
					value: recordId
				}];
				return entityInfo;
			}, [cardModuleId]);
			this.sandbox.publish('OpenCardModule', cardModuleId, [this.getCardModuleSandboxId()]);
			this.sandbox.subscribe('UpdateDetail', function(recordId) {
				viewModel.isObsolete = true;
			}, [cardModuleId]);
		}

		return structure;
	});