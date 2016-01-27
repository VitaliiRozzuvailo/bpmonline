define('FolderLookupPageView', ['ext-base', 'terrasoft', 'FolderLookupPageViewResources'], function(Ext, Terrasoft,
		resources) {

	function generate() {
		var viewConfig = {
			id: 'folderLookupContainer',
			selectors: {
				wrapEl: '#folderLookupContainer'
			},
			items: [
				{
					className: 'Terrasoft.Container',
					id: "header",
					selectors: {
						wrapEl: '#header'
					},
					classes : {
						wrapClassName: "header"
					},
					items: [
						{
							className: 'Terrasoft.Label',
							classes: {
								labelClass: ['header-name']
							},
							caption: {
								bindTo: 'groupPageCaption'
							}
						}
					]
				},
				{
					className: 'Terrasoft.Container',
					id: 'buttonsContainer',
					selectors: {
						wrapEl: '#buttonsContainer'
					},
					items: [
						{
							className: 'Terrasoft.Button',
							caption: resources.localizableStrings.SelectButtonCaption,
							style: Terrasoft.controls.ButtonEnums.style.GREEN,
							tag: 'SelectButton',
							classes: {
								textClass: ['folder-lookup-page-main-buttons']
							},
							click: {
								bindTo: 'selectButton'
							},
							enabled: {
								bindTo: 'selectEnabled'
							}
						},
						{
							className: 'Terrasoft.Button',
							caption: resources.localizableStrings.CancelButtonCaption,
							tag: 'CancelButton',
							classes: {
								textClass: ['folder-lookup-page-main-buttons']
							},
							click: {
								bindTo: 'cancelButton'
							}
						},
						{
							className: 'Terrasoft.Button',
							caption: resources.localizableStrings.ActionButtonCaption,
							tag: 'ActionButton',
							classes: {
								wrapperClass: ['folder-lookup-page-main-buttons']
							},
							visible: {
								bindTo: 'simpleSelectMode',
								bindConfig: {
									converter: function(simpleSelectMode) {
										return !simpleSelectMode;
									}
								}
							},
							menu: {
								items: [
									{
										className: 'Terrasoft.MenuItem',
										caption: resources.localizableStrings.CreateStaticMenuItemCaption,
										click: {
											bindTo: 'addGeneralFolderButton'
										}
									},
									{
										className: 'Terrasoft.MenuItem',
										caption: resources.localizableStrings.CreateDynamicMenuItemCaption,
										click: {
											bindTo: 'addSearchFolderButton'
										}
									},
									{
										className: 'Terrasoft.MenuSeparator'
									},
									{
										className: 'Terrasoft.MenuItem',
										caption: resources.localizableStrings.MoveMenuItemCaption,
										click: {
											bindTo: 'moveFolder'
										},
										enabled: {
											bindTo: 'selectEnabled'
										}
									},
									{
										className: 'Terrasoft.MenuItem',
										caption: resources.localizableStrings.RenameMenuItemCaption,
										click: {
											bindTo: 'editButton'
										},
										visible: {
											bindTo: 'canRename'
										}
									},
									{
										className: 'Terrasoft.MenuItem',
										caption: resources.localizableStrings.DeleteMenuItemCaption,
										click: {
											bindTo: 'deleteButton'
										},
										enabled: {
											bindTo: 'selectEnabled'
										}
									},
									{
										className: 'Terrasoft.MenuItem',
										caption: resources.localizableStrings.EditRightsMenuItemCaption,
										click: {
											bindTo: 'editRights'
										},
										visible: {
											bindTo: 'administratedButtonVisible'
										},
										enabled: {
											bindTo: 'selectEnabled'
										}
									},
									{
										className: 'Terrasoft.MenuSeparator',
										visible: {
											bindTo: 'enableMultiSelect'
										}
									},
									{
										className: 'Terrasoft.MenuItem',
										caption: {
											bindTo: 'multiSelect',
											bindConfig: {
												converter: function(multiSelect) {
													return multiSelect
														? resources.localizableStrings.SelectFolderMenuItemCaption
														: resources.localizableStrings.SelectFoldersMenuItemCaption;
												}
											}
										},
										visible: {
											bindTo: 'enableMultiSelect'
										},
										click: {
											bindTo: 'changeMultiSelectMode'
										}
									}
								]
							}
						}
					]
				},
				{
					className: 'Terrasoft.Container',
					id: 'gridContainer',
					selectors: {wrapEl: '#gridContainer'},
					classes: {wrapClassName: ['folder-lookup-page-left-container']},
					items: [
						{
							className: 'Terrasoft.Grid',
							id: 'foldersGrid',
							type: 'listed',
							primaryColumnName: 'Id',
							selectRow: {bindTo: 'onActiveRowChanged'},
							multiSelect: {bindTo: 'multiSelect'},
							hierarchical: true,
							hierarchicalColumnName: 'Parent',
							columnsConfig: [{
								cols: 24,
								key: [{
									name: {bindTo: 'FolderType'},
									type: Terrasoft.GridKeyType.ICON16LISTED
								}, {
									name: {bindTo: 'Name'}
								}]
							}],
							collection: {bindTo: 'gridData'},
							watchedRowInViewport: {bindTo: 'loadNext'},
							selectedRows: {bindTo: 'selectedRows'},
							activeRow: {bindTo: 'activeRow'},
							openRecord: {bindTo: 'dblClickGrid'},
							expandHierarchyLevels: {bindTo: 'expandHierarchyLevels'},
							useListedLookupImages: true
						}
					]
				}, {
					className: 'Terrasoft.Container',
					id: 'folderEditContainer',
					selectors: {
						wrapEl: '#folderEditContainer'
					},
					classes: {
						wrapClassName: ['folder-lookup-page-right-container']
					},
					visible: {
						bindTo: 'folderInfoVisible'
					},
					items: [
					]
				}
			]
		};
		return viewConfig;
	}

	function getFolderView() {
		var config = {
			caption: resources.localizableStrings.FilterGroupCaption,
			collapsed: false,
			id: 'filteredit',
			selectors: {
				wrapEl: '#filteredit'
			},
			classes: {
				wrapClass: ['folder-lookup-page-right-control-group']
			},
			items: [
				{
					className: 'Terrasoft.Container',
					id: 'folderEditButtonsContainer',
					selectors: {
						wrapEl: '#folderEditButtonsContainer'
					},
					classes: {
						wrapClassName: ['folder-lookup-page-right-inner-container']
					},
					items: [
						{
							className: 'Terrasoft.Button',
							caption: resources.localizableStrings.SaveButtonCaption,
							style: Terrasoft.controls.ButtonEnums.style.BLUE,
							classes: {
								textClass: ['folder-lookup-page-main-buttons']
							},
							click: {
								bindTo: 'saveButton'
							}
						},
						{
							className: 'Terrasoft.Button',
							caption: resources.localizableStrings.ClearButtonCaption,
							classes: {
								textClass: ['folder-lookup-page-main-buttons']
							},
							click: {
								bindTo: 'clearButton'
							}
						},
						{
							className: 'Terrasoft.Button',
							caption: resources.localizableStrings.ActionButtonCaption,
							style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
							classes: {
								wrapperClass: ['folder-lookup-page-main-buttons']
							},
							visible: {
								bindTo: 'actionsButtonVisible'
							},
							menu: {
								items: [
									{
										className: 'Terrasoft.MenuItem',
										caption: resources.localizableStrings.GroupMenuItemCaption,
										click: {
											bindTo: 'groupItems'
										},
										enabled: {
											bindTo: 'groupButtonVisible'
										}
									},
									{
										className: 'Terrasoft.MenuItem',
										caption: resources.localizableStrings.UnGroupMenuItemCaption,
										click: {
											bindTo: 'unGroupItems'
										},
										enabled: {
											bindTo: 'unGroupButtonVisible'
										}
									},
									{
										className: 'Terrasoft.MenuItem',
										caption: resources.localizableStrings.MoveUpMenuItemCaption,
										click: {
											bindTo: 'moveUp'
										},
										enabled: {
											bindTo: 'moveUpButtonVisible'
										}
									},
									{
										className: 'Terrasoft.MenuItem',
										caption: resources.localizableStrings.MoveDownMenuItemCaption,
										click: {
											bindTo: 'moveDown'
										},
										enabled: {
											bindTo: 'moveDownButtonVisible'
										}
									}
								]
							}
						}
					]
				},
				{
					className: 'Terrasoft.FilterEdit',
					renderTo: Ext.get('filteredit'),
					filterManager: {
						bindTo: 'FilterManager'
					},
					selectedItems: {
						bindTo: 'SelectedFilters'
					},
					selectedFiltersChange: {
						bindTo: 'onSelectedFilterChange'
					}
				}
			]
		};
		return config;
	}

	return {
		generate: generate,
		getFolderView: getFolderView
	};
});