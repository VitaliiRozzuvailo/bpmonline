define('ProcessExecutionContextModule', ['ext-base', 'terrasoft', 'sandbox', 'ProcessExecutionContextModuleResources'],
	function(Ext, Terrasoft, sandbox, resources) {

		var executionContext;
		var cardModuleSandboxId;

		function createExecutionContextItem(itemName, itemCaption, itemSchemaName, itemFilterPath,
				itemFilterValuePath) {
			return {
				name: itemName,
				caption: itemCaption,
				schemaName: itemSchemaName,
				filterPath: itemFilterPath,
				filterValuePath: itemFilterValuePath
			};
		}
		
		function getDetailContainerName(detailItemName) {
			return 'detail-' + detailItemName;
		}
		
		function getDetailInstanceId(detailItemName, entitySchemaName) {
			// TODO Fix this stub!!!
			return sandbox.id.replace('UserQuestionProcessElementPage', 'CardModule')
				.replace(sandbox.moduleName, '') + entitySchemaName + '_detail_' + detailItemName;
		}
		
		function loadDetails() {
			var detailsInfo = executionContext;
			Terrasoft.each(detailsInfo, function(detailItem) {
				var detailInstanceId = getDetailInstanceId(detailItem.name, detailItem.filterPath);
				var detailContainer = Ext.get(getDetailContainerName(detailItem.name));
				sandbox.loadModule('DetailModule', {
					renderTo: detailContainer,
					id: detailInstanceId
				});
			});
		}
		
		function loadData() {
			var action = 'edit';
			sandbox.subscribe('DetailInfo', function(detailId) {
				var details = executionContext;
				Terrasoft.each(details, function(item) {
					var currentDetailId = getDetailInstanceId(item.name, item.filterPath);
					if (currentDetailId === detailId) {
						var key = item;
						var args = {
							Id: detailId,
							schemaName: item.schemaName,
							filterPath: item.filterPath,
							filterValue: item.filterValuePath,
							parentChemaName: item.filterPath,
							operationType: action,
							cardModuleSandboxId: cardModuleSandboxId
						};
						sandbox.publish('LoadData', args);
					}
				});
			});
		}

		function createDetailContainer(itemName, itemCaption, isCollapsed) {
			var detailContainer = {
				id: getDetailContainerName(itemName),
				className: 'Terrasoft.ControlGroup',
				caption: itemCaption || itemName,
				collapsed: isCollapsed,
				markerValue: itemCaption,
				classes: {
					wrapContainerClass: 'control-group-container'
				},
				items: []
			};
			return detailContainer;
		}

		function getView() {
			var detailContainers = [];
			var detailsInfo = executionContext;
			Terrasoft.each(detailsInfo, function(detailItem) {
				var detailContainer = createDetailContainer(detailItem.name, detailItem.caption, false);
				detailContainers.push(detailContainer);
			});
			var container = Ext.create('Terrasoft.Container', {
				id: 'processElementExecutionContextContainer',
				classes: {
					wrapClassName: [
						'qualify-module-container'
					]
				},
				selectors: {
					wrapEl: '#processElementExecutionContextContainer'
				},
				items: detailContainers
			});
			return container;
		}

		function getViewModel() {
			var viewModel = Ext.create('Terrasoft.BaseViewModel', {
				values: {
					caption: ''
				}
			});
			return viewModel;
		}

		function render(renderTo) {
			var processExecData = sandbox.publish('GetProcessExecData');
			cardModuleSandboxId = sandbox.publish('GetCardModuleSandboxId');
			if (!Ext.isEmpty(processExecData.executionContext)) {
				executionContext = Ext.decode(processExecData.executionContext);
				var view = getView();
				var viewModel = getViewModel();
				viewModel.set('caption', 'ProcessElementExecutionContextModule');
				view.bind(viewModel);
				view.render(renderTo);
				loadDetails();
				loadData();
			}
		}

		return {
			render: render
		};

	});