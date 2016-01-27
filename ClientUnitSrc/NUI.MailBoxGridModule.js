define('MailBoxGridModule', ['ext-base', 'terrasoft', 'sandbox',
	'MailBoxGridModuleResources'],
	function (Ext, Terrasoft, sandbox, resources) {

		function getActiveRow(scope) {
			var activeRow = scope.get('activeRowId')
			if (activeRow !== undefined) {
				var gridData = scope.get('gridData')
				return gridData.get(activeRow);
			}
			return null;
		}

		function getView() {
			var container = Ext.create('Terrasoft.Container', {
				id: 'main',
				selectors: {
					wrapEl: '#main'
				},
				items: [
					{
						className: 'Terrasoft.Container',
						id: 'windowCaptionContainer',
						selectors: {
							wrapEl: '#windowCaptionContainer'
						},
						classes: {
							wrapClassName: ['window-caption-container']
						},
						items: [
							{
								className: 'Terrasoft.Label',
								caption: resources.localizableStrings.WindowCaption,
								classes: {
									labelClass: ['windowcaption-label']
								},
								width: '100%'
							}
						]
					},
					{
						className: 'Terrasoft.Container',
						id: 'addNewBtnContainer',
						selectors: {
							wrapEl: '#addNewBtnContainer'
						},
						classes: {
							wrapClassName: ['addnew-button-container']
						},
						items: [
							{
								className: 'Terrasoft.Button',
								id: 'btnAddNew',
								caption: resources.localizableStrings.AddNewCaption,
								width: '150px',
								style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
								click: {
									bindTo: 'onAddNewBtnClick'
								}
							}
						]
					},
					{
						className: 'Terrasoft.Container',
						id: 'gridContainer',
						selectors: {
							wrapEl: '#gridContainer'
						},
						classes: {
							wrapClassName: ['grid-container']
						},
						items: [
							{
								className: 'Terrasoft.Grid',
								type: 'tiled',
								primaryColumnName: 'Id',
								activeRow: {
									bindTo: 'activeRowId'
								},
								columnsConfig: [
									{
										cols: 24,
										key: [
											{
												name: {
													bindTo: 'Name'
												}
											}
										]
									}
								],
								collection: {
									bindTo: 'gridData'
								},
								activeRowAction: {
									bindTo: 'onActiveRowAction'
								},
								activeRowActions: [{
									className: 'Terrasoft.Button',
									style: Terrasoft.controls.ButtonEnums.style.GREY,
									caption: resources.localizableStrings.DeleteCaption,
									tag: 'Delete'
								},
								{
									className: 'Terrasoft.Button',
									style: Terrasoft.controls.ButtonEnums.style.GREY,
									caption: resources.localizableStrings.TuneCaption,
									tag: 'Tune'
								},
								{
									className: 'Terrasoft.Button',
									style: Terrasoft.controls.ButtonEnums.style.GREY,
									caption: resources.localizableStrings.AccessCaption,
									tag: 'Access'
								}]
							}
						]
					}
				]
			});
			return container;
		}

		function getViewModel() {
			var model = Ext.create('Terrasoft.BaseViewModel', {
				values: {
					activeRowId: null,
					gridData: Ext.create('Terrasoft.BaseViewModelCollection', {
						rowConfig: { Id: 'Id', Name: 'Name'}
					})
				},
				methods: {
					getData: function () {
					},
					onActiveRowAction: function (tag) {
						var activeRow = getActiveRow(this);
						if (activeRow !== null) {
							var id = activeRow.values['Id'];
							var name = activeRow.values['Name'];
						}
					}
				}
			});
			return model;
		}

		function render(renderTo) {
			var view = getView();
			//var viewModel = getViewModel();
			//viewModel.getData();
			//view.bind(viewModel);
			view.render(renderTo);
		}

		return {
			render: render
		}
	});