define('GeneratedWebFormModule', ['ext-base', 'terrasoft', 'sandbox', 'GeneratedWebForm', 'GeneratedWebFormModuleResources'],
	function(Ext, Terrasoft, sandbox, GeneratedWebForm, resources) {
		var viewModel = null;
		var renderContainer;

		var getView  = function() {
			var container = Ext.create('Terrasoft.Container', {
				id: 'container',
				selectors: {
					wrapEl: '#container'
				},
				items: [
					{
						className: 'Terrasoft.Container',
						id: 'header-name-container',
						classes: {
							wrapClassName: ['header-name-container']
						},
						selectors: {
							wrapEl: '#header-name-container'
						},
						items: [{
							className: 'Terrasoft.Label',
							id: 'header-name',
							caption: resources.localizableStrings.GeneratedWebFormsHeader,
							width: '100%'
						}]
					},
					{
						className: 'Terrasoft.Container',
						id: 'topButtons',
						selectors: {
							wrapEl: '#topButtons'
						},
						classes: {
							wrapClassName: ['container-spacing']
						},
						items: [
							{
								className: 'Terrasoft.Button',
								id: 'btnAddNew',
								caption: resources.localizableStrings.AddNewCaption,
								style: Terrasoft.controls.ButtonEnums.style.GREEN,
								tag: 'addNew',
								visible: true,
								click: {
									bindTo: 'onAddNewButtonClick'
								}
							}
						]
					},
					{
						className: 'Terrasoft.Container',
						id: 'gridArea',
						selectors: {
							wrapEl: '#gridArea'
						},
						classes: {
							wrapClassName: ['container-spacing']
						},
						items: [
							{
								className: 'Terrasoft.Grid',
								type: 'tiled',
								primaryColumnName: 'Name',
								activeRow: {
									bindTo: 'activeRowId'
								},
								captionsConfig: [
									{
										cols: 12,
										name: resources.localizableStrings.NameColumnCaption
									}
								],
								columnsConfig: [
									[
										{
											cols: 24,
											key: [
												{
													name: {
														bindTo: 'Name'
													},
													type: 'title'
												}
											]
										}
									]
								],
								collection: {
									bindTo: 'gridData'
								},
								activeRowAction: {
									bindTo: 'onActiveRowSelect'
								},
								activeRowActions: [
									{
										className: 'Terrasoft.Button',
										style: Terrasoft.controls.ButtonEnums.style.BLUE,
										caption: resources.localizableStrings.ViewButtonCaption,
										tag: 'View'
									},
									{
										className: 'Terrasoft.Button',
										style: Terrasoft.controls.ButtonEnums.style.BLUE,
										caption: resources.localizableStrings.EditButtonCaption,
										tag: 'Edit'
									},
									{
										className: 'Terrasoft.Button',
										style: Terrasoft.controls.ButtonEnums.style.GREY,
										caption: resources.localizableStrings.DeleteButtonCaption,
										tag: 'Delete'
									}
								]
							}
						]
					}
				]
			});
			return container;
		}

		var getViewModel = function() {
			return Ext.create('Terrasoft.BaseViewModel', {
				entitySchema: GeneratedWebForm,
				values: {
					activeRowId: null,
					gridData: Ext.create('Terrasoft.BaseViewModelCollection', {
						rowConfig: {Name: 'Name', Id: 'Id'}
					})
				},
				methods: {
					onActiveRowSelect: function(tag) {
						if (tag === 'Delete') {
							this.onDeleteButtonClick();
						} else if (tag === 'Edit') {
							this.onEditButtonClick();
						} else if (tag === 'View') {
							this.onViewButtonClick();
						}
					},
					onAddNewButtonClick: function() {
						var newCardModuleId = sandbox.id + '_CardModule_' + this.entitySchema.name;
						//renderContainer = Ext.get('centerPanel');
						sandbox.subscribe('CardModuleEntityInfo', function(args) {
							var entityInfo = {};
							entityInfo.action = 'add';
							entityInfo.cardSchemaName = 'GeneratedWebFormPage';
							entityInfo.activeRow = '';
							return entityInfo;
						}, [newCardModuleId]);
						this.cardModuleResponse = null;
						var scope = this;
						sandbox.subscribe('CardModuleResponse', function(response) {
							scope.cardModuleResponse = response;
						}, [newCardModuleId]);
						var params = sandbox.publish('GetHistoryState');
						sandbox.publish('PushHistoryState', {hash: params.hash.historyState});
						sandbox.loadModule('CardModule', {
							renderTo: renderContainer,
							id: newCardModuleId,
							keepAlive: true
						})
					},
					onDeleteButtonClick: function() {
						var recordId = getActiveRow(this);
						if (recordId) {
							var scope = this;
							var cfg = {
								style: Terrasoft.MessageBoxStyles.BLUE
							};
							scope.showConfirmationDialog(
								resources.localizableStrings.DeleteConfirmation,
								function getSelectedButton(returnCode) {
									if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
										var deleteQuery = Ext.create('Terrasoft.DeleteQuery', {
											rootSchemaName: 'GeneratedWebForm'
										});
										deleteQuery.filters.add('IdFilter',
											deleteQuery.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
												'Id', recordId));
										deleteQuery.execute(function(response) {
											scope.getData();
										}, scope);
									}
								}, ['yes', 'no'], cfg);
						}
					},
					onEditButtonClick: function() {
						var recordId = getActiveRow(this);
						sandbox.publish('PushHistoryState',
							{
								hash: 'GeneratedWebFormPage',
								stateObj: {id: recordId}
							});
					},
					onViewButtonClick: function() {
						var recordId = getActiveRow(this);
						sandbox.publish('PushHistoryState',
							{
								hash: 'GeneratedWebFormPage',
								stateObj: {id: recordId}
							});
					},
					loadData: function() {

					}
				}
			});
		}

		function getActiveRow(scope) {
			var activeRow = scope.get('activeRowId');
			if (activeRow) {
				var gridData = scope.get('gridData');
				return gridData.get(activeRow);
			}
			return null;
		}

		function init() {
			var state = sandbox.publish('GetHistoryState');
			var currentHash = state.hash;
			var currentState = state.state || {};
			if (currentState.moduleId === sandbox.id) {
				return;
			}
			var newState = Terrasoft.deepClone(currentState);
			newState.moduleId = sandbox.id;
			sandbox.publish('ReplaceHistoryState', {
				stateObj: newState,
				pageTitle: null,
				hash: currentHash.historyState,
				silent: true
			});
		}

		function render(renderTo) {
			renderContainer = renderTo;
			if (viewModel) {
				var config = getView();
				var view = Ext.create(config.className || 'Terrasoft.Container', config);
				view.bind(viewModel);
				view.render(renderTo);
				return;
			}
			var view = getView();
			viewModel = getViewModel();
			view.bind(viewModel);
			view.render(renderTo);
		}

		return {
			init: init,
			render: render
		}
 });