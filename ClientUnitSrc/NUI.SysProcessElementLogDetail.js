define('SysProcessElementLogDetail', ['ext-base', 'terrasoft', 'SysProcessElementLog',
	'SysProcessElementLogDetailStructure', 'SysProcessElementLogDetailResources', 'ConfigurationConstants',
	'ModalBox', 'ProcessModule'],
	function(Ext, Terrasoft, SysProcessElementLog,  structure, resources, ConfigurationConstants, modalBox,
		ProcessModule) {
		structure.userCode = function() {
			this.entitySchema = SysProcessElementLog;
			this.name = 'SysProcessElementLogDetailViewModel';
			this.captionsConfig = [
				{
					cols: 10,
					name: resources.localizableStrings.Element
				},
				{
					cols: 4,
					name: resources.localizableStrings.Status
				},
				{
					cols: 5,
					name: resources.localizableStrings.StartDate
				},
				{
					cols: 5,
					name: resources.localizableStrings.CompleteDate
				}
			];
			this.columnsConfig = [
				[
					{
						cols:10,
						key: [
							{
								name: {
									bindTo: 'Caption'
								}
							}
						]
					},
					{
						cols: 4,
						key: [
							{
								name: {
									bindTo: 'Status'
								}
							}
						]
					},
					{
						cols: 5,
						key: [
							{
								name: {
									bindTo: 'StartDate'
								}
							}
						]
					},
					{
						cols: 5,
						key: [
							{
								name: {
									bindTo: 'CompleteDate'
								}
							}
						]
					}
				]
			];
			this.loadedColumns = [
				{
					columnPath: 'Caption'
				},
				{
					columnPath: 'Status'
				},
				{
					columnPath: 'StartDate'
				},
				{
					columnPath: 'CompleteDate'
				},
				{
					columnPath: 'ErrorDescription'
				}
			];

			this.modifyUtilsButton = function(utilsButton) {
				utilsButton.menu.items[0].visible = false;
				utilsButton.menu.items.push({
					caption: resources.localizableStrings.RunElement,
					click: {
						bindTo: 'runElement'
					},
					visible: {
						bindTo: 'getRunMenuButtonsVisible'
					}
				});
				utilsButton.menu.items.push({
					caption: resources.localizableStrings.ShowError,
					click: {
						bindTo: 'showError'
					},
					visible: {
						bindTo: 'getErrorMenuButtonsVisible'
					}
				});
				return utilsButton;
			};

			this.methods.runElement = function() {
				var selectedRow = this.getFirstSelectedRow();
				if (!selectedRow) {
				        return;
				}
				var data = {
					procElUId: selectedRow[0].values.Id
				};
				var maskId = Terrasoft.Mask.show();
				var responseCallback = function(request, success, response) {
					Terrasoft.Mask.hide(maskId);
				};
				ProcessModule.services.callConfigurationServiceMethod('ProcessEngineService/ExecuteProcessElement',
					data, responseCallback);
			};

			this.methods.getFirstSelectedRow = function () {
				var selectedRow;
				var selectedRows = this.GetSelectedItems();
				if (selectedRows) {
					var recordId = selectedRows[0];
					var gridData = this.get('gridData');
					if (recordId && gridData && gridData.collection) {
						if (recordId) {
							selectedRow = gridData.collection.items.filter(function(item) {
								return (item.values.Id === recordId);
							});
						}
					}
				}
				return selectedRow;
			};

			this.methods.getErrorMenuButtonsVisible = function() {
				var selectedRow = this.getFirstSelectedRow();
				if (selectedRow) {
					var status = selectedRow[0].values.Status;
					return status.value === ConfigurationConstants.SysProcess.Status.Error;
				}
				return false;
			};

			this.methods.getRunMenuButtonsVisible = function() {
				var selectedRow = this.getFirstSelectedRow();
				if (selectedRow) {
					var status = selectedRow[0].values.Status;
					return status.value === ConfigurationConstants.SysProcess.Status.Error ||
						status.value === ConfigurationConstants.SysProcess.Status.Performed;
				}
				return false;
			};

			function getModalBoxViewModel() {
				return Ext.create("Terrasoft.BaseViewModel", {
					values: {
						errorDescription: ''
					},
					methods: {
						onCloseModalBox: function() {
							modalBox.close();
						}
					}
				});
			}

			function getModalBoxView(renderTo) {
				var labelConfig = Ext.create('Terrasoft.Label', {
					caption: {
						bindTo: 'errorDescription'
					}/*,
					wordWrap: true*/
				});
				var labelContainerConfig = Ext.create('Terrasoft.Container', {
					id: 'labelContainer',
					selectors: {
						wrapEl: '#labelContainer'
					},
					items: [
						labelConfig
					]
				});

				var buttonConfig = Ext.create('Terrasoft.Button', {
					id: 'closeButton',
					caption: resources.localizableStrings.CloseButton,
					style: Terrasoft.controls.ButtonEnums.style.BLUE,
					selectors: {
						wrapEl: '#closeButton'
					},
					click: {
						bindTo: 'onCloseModalBox'
					}
				});
				var buttonContainerConfig = Ext.create('Terrasoft.Container', {
					id: 'buttonContainer',
					selectors: {
						wrapEl: '#buttonContainer'
					},
					items: [
						buttonConfig
					]
				});
				var resultConfig = Ext.create('Terrasoft.Container', {
					id: 'messageContainer',
					selectors: {
						wrapEl: '#messageContainer'
					},
					renderTo: renderTo,
					items: [
						labelContainerConfig,
						buttonContainerConfig
					]
				});
				return resultConfig;
			}

			this.methods.showError = function() {
				var selectedRow = this.getFirstSelectedRow(this);
				if (selectedRow) {
					var errorDescription = selectedRow[0].values.ErrorDescription;
					errorDescription = errorDescription;
					var renderTo = modalBox.show({maxWidth: 40, maxHeight: 40, minHeight: 10});
					viewModel = getModalBoxViewModel();
					viewModel.set('errorDescription', errorDescription);
					viewConfig = getModalBoxView(renderTo);
					viewConfig.bind(viewModel);
					modalBox.updateSizeByContent();
				}
			};

			this.methods.dblClickGridDetail = function() {
				return false;
			};

		};
		return structure;
	});