define("FolderManagerView", ["ext-base", "terrasoft", "FolderManagerViewResources", "ConfigurationConstants"],
		function(Ext, Terrasoft, resources, ConfigurationConstants) {

	function generate() {
		var closePanelImageUrl = Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.ClosePanelImage);

		function isMailboxType(folderType) {
			return folderType.value === ConfigurationConstants.Folder.Type.SubEmail ||
				folderType.value === ConfigurationConstants.Folder.Type.MailBox;
		}

		var viewConfig = {
			id: "folderManagerContainer",
			selectors: {wrapEl: "#folderManagerContainer"},
			items: [{
				className: "Terrasoft.Container",
				id: "foldersContainer",
				selectors: {wrapEl: "#foldersContainer"},
				items: [{
					className: "Terrasoft.Container",
					id: "header",
					selectors: {wrapEl: "#header"},
					classes : {wrapClassName: "folder-manager-header"},
					items: [{
						id: "folderHeaderLabel",
						className: "Terrasoft.Label",
						classes: {labelClass: ["folder-manager-header-name"]},
						caption: resources.localizableStrings.FoldersHeaderCaption,
						// TODO: удалить заголовок после переноса действий
						visible: false
					},
					{
						className: "Terrasoft.Button",
						tag: "CloseButton",
						markerValue: resources.localizableStrings.CloseButtonCaption,
						classes: {wrapperClass: ["folder-manager-button-right"]},
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						visible: true,
						imageConfig: {
							source: Terrasoft.ImageSources.URL,
							url: closePanelImageUrl
						},
						click: {bindTo: "closeFolderManager"}
					}]
				},
				{
					className: "Terrasoft.Container",
					id: "gridContainer",
					selectors: {wrapEl: "#gridContainer"},
					classes: {wrapClassName: ["folder-manager-left-container"]},
					items: [{
						className: "Terrasoft.Grid",
						id: "foldersGrid",
						type: "listed",
						primaryColumnName: "Id",
						selectRow: {bindTo: "onActiveRowChanged"},
						multiSelect: {bindTo: "multiSelect"},
						hierarchical: true,
						hierarchicalColumnName: "Parent",
						columnsConfig: [{
							cols: 22,
							key: [{
								name: {bindTo: "FolderType"},
								type: Terrasoft.GridKeyType.ICON16LISTED
							}, {
								name: {bindTo: "Name"}
							}]
						}],
						activeRowActions: [{
							className: "Terrasoft.Button",
							classes: {wrapperClass: "folder-favorite-actions-icon"},
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							tag: "favorite",
							imageConfig: {
								bindTo: "isInFavorites",
								bindConfig: {
									converter: function(isInFavorites) {
										return isInFavorites
											? resources.localizableImages.RemoveFromFavorites
											: resources.localizableImages.AddToFavoritesImage;
									}
								}
							}
						},
						{
							className: "Terrasoft.Button",
							classes: {wrapperClass: "folder-menu-actions-icon"},
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							menu: {
								items: [{
									className: "Terrasoft.MenuItem",
									caption: resources.localizableStrings.EditFolderFilters,
									tag: "editFilter",
									markerValue: resources.localizableStrings.EditFolderFilters,
									visible: {
										bindTo: "FolderType",
										bindConfig: {
											converter: function(folderType) {
												return folderType.value ===
													ConfigurationConstants.Folder.Type.Search;
											}
										}
									}
								},
								{
									className: "Terrasoft.MenuItem",
									caption: resources.localizableStrings.RenameMenuItemCaption,
									tag: "renameFolder",
									markerValue: resources.localizableStrings.RenameMenuItemCaption,
									visible: {
										bindTo: "FolderType",
										bindConfig: {
											converter: function(folderType) {
												return !isMailboxType(folderType);
											}
										}
									}
								},
								{
									className: "Terrasoft.MenuItem",
									caption: resources.localizableStrings.MoveMenuItemCaption,
									tag: "moveFolder",
									markerValue: resources.localizableStrings.MoveMenuItemCaption,
									visible: {
										bindTo: "FolderType",
										bindConfig: {
											converter: function(folderType) {
												return !isMailboxType(folderType);
											}
										}
									}
								},
								{
									className: "Terrasoft.MenuItem",
									caption: resources.localizableStrings.DeleteMenuItemCaption,
									tag: "deleteButton",
									markerValue: resources.localizableStrings.DeleteMenuItemCaption,
									visible: {
										bindTo: "FolderType",
										bindConfig: {
											converter: function(folderType) {
												return !isMailboxType(folderType);
											}
										}
									}
								},
								{
									className: "Terrasoft.MenuItem",
									caption:
										resources.localizableStrings.EditRightsMenuItemCaption,
									tag: "editRights",
									markerValue: resources.localizableStrings.EditRightsMenuItemCaption,
									visible: {bindTo: "administratedByRecords"}
								}]
							},
							imageConfig: resources.localizableImages.SettingsImage
						}],
						captionsCss: "folder-manager-grid-captions",
						collection: {bindTo: "gridData"},
						watchedRowInViewport: {bindTo: "loadNext"},
						selectedRows: {bindTo: "selectedRows"},
						activeRow: {bindTo: "activeRow"},
						openRecord: {bindTo: "dblClickGrid"},
						expandHierarchyLevels: {bindTo: "expandHierarchyLevels"},
						updateExpandHierarchyLevels: {bindTo: "onExpandHierarchyLevels"},
						activeRowAction: {bindTo: "onActiveRowAction"},
						useListedLookupImages: true
					}]
				}]
			}]
		};
		return viewConfig;
	}

	return {generate: generate};
});