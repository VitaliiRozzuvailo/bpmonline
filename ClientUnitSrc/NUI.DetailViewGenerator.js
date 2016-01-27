define('DetailViewGenerator', ['ext-base', 'terrasoft', 'DetailViewGeneratorResources', 'GridUtilities'],
		function(Ext, Terrasoft, resources, GridUtilities)  {

	var defaultButtons = {
		defaultAddItem: {
			caption: resources.localizableStrings.AddButtonCaption,
			tag: 'ContactCardSchema',
			click: {
				bindTo: 'add'
			},
			visible: {
				bindTo: 'isEditActionsVisible'
			}
		},
		editItem: {
			caption: resources.localizableStrings.EditButtonCaption,
			click: {
				bindTo: 'edit'
			},
			visible: {
				bindTo: 'isEditActionsVisible'
			},
			enabled: {
				bindTo: 'isSomeSelected'
			}
		},
		copyItem: {
			caption: resources.localizableStrings.CopyButtonCaption,
			click: {
				bindTo: 'copy'
			},
			visible: {
				bindTo: 'isEditActionsVisible'
			},
			enabled: {
				bindTo: 'isSomeSelected'
			}
		},
		deleteItem: {
			caption: resources.localizableStrings.DeleteButtonCaption,
			click: {
				bindTo: 'delete'
			},
			visible: {
				bindTo: 'isEditActionsVisible'
			},
			enabled: {
				bindTo: 'isAnySelected'
			}
		},
		viewItem: {
			caption: resources.localizableStrings.ViewButtonCaption,
			click: {
				bindTo: 'view'
			},
			enabled: {
				bindTo: 'isSomeSelected'
			}
		},
		switchGridModeItem: {
			caption: {
				bindTo: 'getGridModeCaption'
			},
			click: {
				bindTo: 'switchGridMode'
			},
			visible: {
				bindTo: 'isEditActionsVisible'
			}
		}
	};

	function getFullViewModelSchema(sourceViewModelSchema, userCodes) {
		var viewModelSchema = Terrasoft.deepClone(sourceViewModelSchema);
		applyUserCode(viewModelSchema, userCodes);
		return viewModelSchema;
	}

	function applyUserCode(viewModelSchema, userCodes) {
		Terrasoft.each(userCodes, function(userCode) {
			userCode.call(viewModelSchema);
		});
	}

	function getGridConfig(fullViewModelSchema, isTiled) {
		var entitySchema = fullViewModelSchema.entitySchema;
		var config = {
			id: entitySchema.instanceId + '-' + Terrasoft.generateGUID() + '-grid',
			className: 'Terrasoft.Grid',
			type: fullViewModelSchema.gridType || (isTiled ? 'tiled' : 'listed'),
			multiSelect: {
				bindTo: 'multiSelect'
			},
			primaryColumnName: entitySchema.primaryColumnName,
			isEmpty: {
				bindTo: 'gridEmpty'
			},
			isLoading: {
				bindTo: 'gridLoading'
			},
			collection: {
				bindTo: 'gridData'
			},
			activeRow: {
				bindTo: 'activeRow'
			},
			selectedRows: {
				bindTo: 'selectedRows'
			},
			sortColumn: {
				bindTo: 'sortColumn'
			},
			sortColumnDirection: {
				bindTo: 'gridSortDirection'
			},
			sortColumnIndex: {
				bindTo: 'sortColumnIndex'
			},
			expandHierarchyLevels: {
				bindTo: 'expandHierarchyLevels'
			},
			updateExpandHierarchyLevels: {
				bindTo: 'onExpandHierarchyLevels'
			},
			selectRow: {
				bindTo: 'selectRow'
			},
			unSelectRow: {
				bindTo: 'unSelectRow'
			},
			openRecord: {
				bindTo: 'dblClickGridDetail'
			}
		};
		if (fullViewModelSchema.modifyGridConfig) {
			return fullViewModelSchema.modifyGridConfig(config);
		} else {
			return config;
		}
	}

	function getEditPages(fullViewModelSchema) {
		var config = Terrasoft.configuration.EntityStructure[fullViewModelSchema.entitySchema.name];
		if (fullViewModelSchema.editPages) {
			if (!config) {
				config = {};
				if (!config.pages) {
					config.pages = [];
				}
			}
			Ext.apply(config.pages, fullViewModelSchema.editPages);
		}
		return config;
	}

	function GenerateUnitsButtonConfig(fullViewModelSchema, columnsSettingsProfile) {
		var additionalAddButtonConfig;
		var actions = fullViewModelSchema.actions;
		var utilsConfig = fullViewModelSchema.utilsConfig;
		var utilsCollection = [];
		if (utilsConfig && utilsConfig.useAdditionalAddButton === true) {
			additionalAddButtonConfig = {
				caption: resources.localizableStrings.AddButtonCaption,
				click: {bindTo: 'additionalAdd'},
				/*classes: {
					wrapperClass: 'additionalAddWrapperClass',
					imageClass: 'additionalAddImageClass',
					textClass: 'additionalAddTextClass'
				},*/
				visible: {bindTo: 'isEditActionsVisible'}
			};
			utilsCollection.push(GridUtilities.getAddButtonConfig(additionalAddButtonConfig));
		}
		if (utilsConfig && utilsConfig.hideAction) {
			return utilsCollection;
		}
		var actionsConfig = {};
		actionsConfig.columnsSettingsProfile = columnsSettingsProfile;
		var utilsButton = GridUtilities.getSettingsButtonConfig(actionsConfig);
		if (actions && Ext.isArray(actions)) {
			utilsButton.menu.items = actions;
			utilsCollection.unshift(utilsButton);
			utilsCollection.push(getContainerConfig(Terrasoft.generateGUID(), ['clear-both']));
			return utilsCollection;
		}
		var utilsMenuItems = utilsButton.menu.items;
		utilsMenuItems.push(defaultButtons.switchGridModeItem);
		if (utilsConfig) {
			if (utilsConfig.hiddenSettings) {
				utilsMenuItems = [];
			}
			if (!utilsConfig.hiddenDelete) {
				utilsMenuItems.unshift(defaultButtons.deleteItem);
			}
			if (!utilsConfig.hiddenEdit) {
				utilsMenuItems.unshift(defaultButtons.editItem);
			}
			if (!utilsConfig.hiddenCopy) {
				utilsMenuItems.unshift(defaultButtons.copyItem);
			}
			if (!utilsConfig.hiddenAdd) {
				utilsMenuItems.unshift(defaultButtons.defaultAddItem);
			}
			if (!utilsConfig.hiddenView) {
				utilsMenuItems.unshift(defaultButtons.viewItem);
			}
		} else {
			utilsMenuItems.unshift(defaultButtons.deleteItem);
			utilsMenuItems.unshift(defaultButtons.copyItem);
			utilsMenuItems.unshift(defaultButtons.editItem);
			var config = getEditPages(fullViewModelSchema);
			if (config && config.pages) {
				var additionalItems;
				if (additionalAddButtonConfig) {
					delete additionalAddButtonConfig.click;
					additionalAddButtonConfig.menu = {items: []};
					additionalItems = additionalAddButtonConfig.menu.items;
				}
				for (var i = config.pages.length - 1; i >= 0; i--) {
					var pageConfig = config.pages[i];
					var newItemElement = {
						caption: pageConfig.caption || defaultButtons.defaultAddItem.caption,
						tag: pageConfig.UId,
						click: {bindTo: pageConfig.bindTo || 'add'}
					};
					if (pageConfig.enabled) {
						newItemElement.enabled = pageConfig.enabled;
					}
					utilsMenuItems.unshift(newItemElement);
					if (additionalItems) {
						additionalItems.unshift(newItemElement);
					}
				}
			} else {
				utilsMenuItems.unshift(defaultButtons.defaultAddItem);
			}
			utilsMenuItems.unshift(defaultButtons.viewItem);
		}
		if (fullViewModelSchema.modifyUtilsButton && Ext.isFunction(fullViewModelSchema.modifyUtilsButton)) {
			utilsButton = fullViewModelSchema.modifyUtilsButton(Terrasoft.deepClone(utilsButton));
		}
		utilsCollection.unshift(utilsButton);
		return utilsCollection;
	}

	function getContainerConfig(id, styles) {
		var container = {
			className: 'Terrasoft.Container',
			items: [],
			id: id,
			selectors: {
				wrapEl: '#' + id
			}
		};
		if (styles) {
			container.classes = {
				wrapClassName: styles
			};
		}
		return container;
	}

	return {
		generate: function(viewModelSchema, userCodes, parentId, operationType, columnsSettingsProfile) {
			var containerPrefix = parentId || '';
			var fullViewModelSchema = getFullViewModelSchema(viewModelSchema, userCodes);
			var viewConfig = getContainerConfig(containerPrefix + 'autoGeneratedContainer' + operationType,
				'grid-detail-container');
			var utilsContainerConfig = getContainerConfig(containerPrefix + 'utils' + operationType);

			Ext.apply(utilsContainerConfig, {
				classes: {
					wrapClassName: 'listDetailContainer'
				}
			});
			utilsContainerConfig.items = new GenerateUnitsButtonConfig(fullViewModelSchema, columnsSettingsProfile);
			var gridPanelConfig = getContainerConfig(containerPrefix + 'autoGeneratedGridContainer' + operationType,
				'controlBaseedit');
			var gridConfig = getGridConfig(fullViewModelSchema, columnsSettingsProfile.isTiled);
			if (columnsSettingsProfile) {
				var gridsColumnsConfig = columnsSettingsProfile.isTiled ?
					columnsSettingsProfile.tiledColumnsConfig :
					columnsSettingsProfile.listedColumnsConfig;
				if (gridsColumnsConfig) {
					var columnsConfig = Ext.decode(gridsColumnsConfig);
					if (columnsConfig.length > 0) {
						gridConfig.columnsConfig = columnsConfig;
						if (!columnsSettingsProfile.isTiled) {
							gridConfig.captionsConfig = Ext.decode(columnsSettingsProfile.captionsConfig);
						}
					}
				}
			}
			if (!gridConfig.captionsConfig && fullViewModelSchema.captionsConfig) {
				gridConfig.captionsConfig = fullViewModelSchema.captionsConfig;
			}
			if (!gridConfig.columnsConfig) {
				gridConfig.columnsConfig = fullViewModelSchema.columnsConfig;
			}
			gridConfig.hierarchical = fullViewModelSchema.hierarchicalGrid || false;
			if (gridConfig.hierarchical) {
				gridConfig.hierarchicalColumnName = fullViewModelSchema.entitySchema.hierarchicalColumnName;
				gridConfig.primaryColumnName = fullViewModelSchema.entitySchema.primaryColumnName;
			}
			var loadButtonsConfig = getContainerConfig(containerPrefix + '-detail-load-utils-container',
				'detail-load-utils-container');
			var loadNextButton = GridUtilities.getLoadButtonConfig();
			if (loadNextButton && loadNextButton.classes) {
				loadNextButton.classes.wrapperClass = '';
			}
			loadButtonsConfig.items = [loadNextButton];
			if (fullViewModelSchema.showLoadAllButton) {
				loadButtonsConfig.items.push(GridUtilities.getLoadAllButtonConfig());
			}
			gridPanelConfig.items = fullViewModelSchema.loadAll ? [gridConfig] : [gridConfig, loadButtonsConfig];
			viewConfig.items = [utilsContainerConfig, gridPanelConfig];
			if (fullViewModelSchema.methods.modifyView) {
				fullViewModelSchema.methods.modifyView(viewConfig, containerPrefix, operationType);
			}
			return viewConfig;
		}
	};
});
