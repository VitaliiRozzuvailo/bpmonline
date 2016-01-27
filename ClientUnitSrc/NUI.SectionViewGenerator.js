define('SectionViewGenerator', ['ext-base', 'terrasoft', 'sandbox', 'SectionViewGeneratorResources',
	'ActionUtilitiesModule', 'GridUtilities'],
	function(Ext, Terrasoft, sandbox, resources, actionUtilities, gridUtilities) {
		var entitySchema;

		function getFullViewModelSchema(sourceViewModelSchema, sectionInfo) {
			var viewModelSchema = Terrasoft.utils.common.deepClone(sourceViewModelSchema);
			applyUserCode(viewModelSchema, sourceViewModelSchema);
			if (sourceViewModelSchema.methods && sourceViewModelSchema.methods.applySectionConfig) {
				sourceViewModelSchema.methods.applySectionConfig(sectionInfo);
			}
			return viewModelSchema;
		}

		function applyUserCode(viewModelSchema, sourceViewModelSchema) {
		}

		function getActionsCongif(actions, id) {
			return {
				className: 'Terrasoft.Container',
				id: id || 'settings-container',
				selectors: {
					wrapEl: '#' + (id || 'settings-container')
				},
				items: [
					{
						id: 'settings-button',
						selectors: {wrapEl: '#settings-button'},
						className: 'Terrasoft.Button',
						classes: {
							wrapperClass: ['open-button-wrapperEl'],
							imageClass: ['open-button-image-size'],
							markerClass: ['open-button-markerEl']
						},
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						imageConfig: resources.localizableImages.ImageOpenButton,
						margin: '0px 10px 0px 0px',
						menu: {items: actions}
					}
				]
			};
		}

		function getHeaderConfig(views) {
			var mainContainer = getContainerConfig('header', 'section-header');
			var tabContainer = getContainerConfig('tab-list', 'section-tab-list');
			tabContainer.items = [generateTabItems(views)];
			mainContainer.items = [
				tabContainer,
				getContainerConfig('section-command-line-container', 'section-command-line'),
				getContainerConfig('section-context-help-container', 'section-context-help')
			];
			return mainContainer;
		}

		function getLabelConfig(schemaItem) {
			var caption;
			switch (schemaItem.type) {
				case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
					var entitySchemaColumn = entitySchema.getColumnByName(schemaItem.name);
					caption = entitySchemaColumn ? entitySchemaColumn.caption : schemaItem.caption;
					break;
				case Terrasoft.ViewModelSchemaItem.METHOD:
					caption = schemaItem.caption;
					break;
			}
			return {
				className: 'Terrasoft.Label',
				caption: caption || '',
				classes: {
					labelClass: ['controlCaption']
				}
			};
		}

		function getGridConfig(sectionInfo, isTiled) {
			var activeRowActions = [];
			activeRowActions.push({
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.BLUE,
				caption: resources.localizableStrings.ViewButtonCaption,
				tag: 'view'
			});
			if (!sectionInfo || !sectionInfo.isCopyButtonHidden) {
				activeRowActions.push({
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.GREY,
						caption: resources.localizableStrings.CopyButtonCaption,
						tag: 'copy'
					}
				);
			}
			activeRowActions.push({
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.GREY,
				caption: resources.localizableStrings.EditButtonCaption,
				tag: 'edit'
			});
			if (!sectionInfo || !sectionInfo.isDeleteButtonHidden) {
				activeRowActions.push({
					className: 'Terrasoft.Button',
					style: Terrasoft.controls.ButtonEnums.style.GREY,
					caption: resources.localizableStrings.DeleteButtonCaption,
					tag: 'delete'
				});
			}
			return {
				id: 'section-grid',
				className: 'Terrasoft.Grid',
//				columnsConfig: {bindTo: 'columnsConfig'},
				type: isTiled ? 'tiled' : 'listed',
				primaryColumnName: entitySchema.primaryColumnName,
				watchRowInViewport: 2,
				collection: {
					bindTo: 'gridData'
				},
				activeRow: {
					bindTo: 'activeRow'
				},
				isEmpty: {
					bindTo: 'gridEmpty'
				},
				useRowActionsExternal: true,
				isLoading: {
					bindTo: 'gridLoading'
				},
				activeRowAction: {
					bindTo: 'onActiveRowAction'
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
				multiSelect: {
					bindTo: 'multiSelect'
				},
				selectedRows: {
					bindTo: 'selectedRows'
				},
				selectRow: {
					bindTo: 'selectRow'
				},
				unSelectRow: {
					bindTo: 'unSelectRow'
				},
				watchedRowInViewport: {
					bindTo: 'loadNext'
				},
				activeRowActions: activeRowActions
			};
		}

		function getControlConfig(schemaItem, bindings) {
			var dataValueType = schemaItem.dataValueType;
			var additionalConfig = {};
			if (schemaItem.type === Terrasoft.ViewModelSchemaItem.METHOD) {
				additionalConfig.readonly = true;
			} else {
				var entitySchemaColumn = entitySchema.getColumnByName(schemaItem.name);
				additionalConfig.isRequired = entitySchemaColumn.isRequired === true;
				additionalConfig.readonly = schemaItem.readonly === true;
			}
			var customConfig = schemaItem.customConfig;
			customConfig = customConfig && Terrasoft.utils.common.deepClone(schemaItem.customConfig);
			var controlConfig = Terrasoft.getControlConfigByDataValueType(dataValueType);
			Ext.apply(controlConfig, additionalConfig);
			var boo = customConfig && Ext.apply(controlConfig, customConfig);
			applyBindingsConfig(controlConfig, schemaItem, bindings);
			return controlConfig;
		}

		function generateView(container, columnsObject, bindings) {
			var items = container.items;
			Terrasoft.each(columnsObject, function(schemaItem) {
				if (schemaItem.visible === false) {
					return;
				}
				var labelConfig;
				var controlConfig;
				var itemType = schemaItem.type;
				switch (itemType) {
					case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
					case Terrasoft.ViewModelSchemaItem.METHOD:
						labelConfig = getLabelConfig(schemaItem);
						items.push(labelConfig);
						controlConfig = getControlConfig(schemaItem, bindings);
						items.push(controlConfig);
						break;
					case Terrasoft.ViewModelSchemaItem.GROUP:
						var containerConfig = {
							className: 'Terrasoft.Container',
							caption: schemaItem.caption,
							items: []
						};
						generateView(containerConfig, schemaItem.items, bindings);
						items.push(containerConfig);
						break;
					case Terrasoft.ViewModelSchemaItem.DETAIL:
						break;
					default:
						break;
				}
			}, this);
		}

		function isLookupSchemaItem(schemaItem) {
			var isLookup = false;
			var schemaItemType = schemaItem.type;
			switch (schemaItemType) {
				case Terrasoft.ViewModelSchemaItem.METHOD:
					isLookup = (schemaItem.dataValueType === Terrasoft.DataValueType.LOOKUP);
					break;
				case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
					var entitySchemaColumn = entitySchema.getColumnByName(schemaItem.columnPath);
					isLookup = entitySchemaColumn.isLookup;
					break;
				default:
					isLookup = false;
			}
			return isLookup;
		}

		function applyBindingsConfig(controlConfig, schemaItem, bindings) {
			var itemName = schemaItem.name;
			var binding = bindings[itemName];
			var boo = binding && Ext.apply(controlConfig, binding);
			var defaultBindingConfig = {
				value: {
					bindTo: schemaItem.name
				}
			};
			if (isLookupSchemaItem(schemaItem)) {
				var listName = schemaItem.list || schemaItem.name + 'List';
				defaultBindingConfig.list = {
					bindTo: listName
				};
			}
			Ext.apply(controlConfig, defaultBindingConfig);
		}

		function getContainerConfig(id, wrapClass) {
			var container = {
				className: 'Terrasoft.Container',
				items: [],
				id: id,
				selectors: {
					wrapEl: '#' + id
				}
			};
			if (!Ext.isEmpty(wrapClass)) {
				container.classes = {
					wrapClassName: wrapClass
				};
			}
			return container;
		}

		function getButtonAddConfig(entitySchema, getEditPages, viewName) {
			var config = {
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.GREEN,
				classes: {
					wrapperClass: ['main-buttons'],
					textClass: ['main-buttons']
				},
				caption: resources.localizableStrings.AddButtonCaption,
				margin: '0px 10px 0px 0px',
				visible: {
					bindTo: "getAddButtonVisbility"
				}
			};
			var editPages = {};
			if (getEditPages) {
				editPages = getEditPages(viewName);
			} else {
				var structureConfig = Terrasoft.configuration.ModuleStructure[entitySchema.name];
				editPages = structureConfig.pages;
			}
			if (!Ext.isEmpty(editPages)) {
				var menuItemConfig = [];
				Terrasoft.each(editPages, function(item) {
					var pageConfig = {
						caption: item.caption,
						tag: item,
						click: {
							bindTo: "add"
						},
						classes: {
							labelClass: 'menu-add-item'
						}
					};
					if (item.customConfig) {
						Ext.apply(pageConfig, item.customConfig);
					}
					menuItemConfig.push(pageConfig);
				});
				var configMenu = {
					menu: {
						items: menuItemConfig
					}
				};
				Ext.apply(config, configMenu);
			}
			else {
				var configClick = {
					click: {
						bindTo: 'add'
					}
				};
				Ext.apply(config, configClick);
			}
			return config;
		}

		function generateMainView(fullViewModelSchema, columnsSettingsProfile, linksConfig, sectionInfo) {
			var gridPanelConfig = getContainerConfig('autoGeneratedGridContainer');
			var gridConfig = getGridConfig(sectionInfo, columnsSettingsProfile.isTiled);
			if (fullViewModelSchema.methods && fullViewModelSchema.methods.modifyGridConfig) {
				fullViewModelSchema.methods.modifyGridConfig(gridConfig, fullViewModelSchema);
			}
			gridPanelConfig.items = [gridConfig];
			if (columnsSettingsProfile) {
				var gridsColumnsConfig = columnsSettingsProfile.isTiled ? columnsSettingsProfile.tiledColumnsConfig
					: columnsSettingsProfile.listedColumnsConfig;
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
			if (!gridConfig.columnsConfig) {
				gridConfig.columnsConfig = fullViewModelSchema.columnsConfig;
			}
			gridUtilities.addLinks(gridConfig, fullViewModelSchema, linksConfig);
			generateView(gridPanelConfig, fullViewModelSchema.schema.gridPanelConfig, fullViewModelSchema.bindings);
			Ext.apply(gridPanelConfig, {});
			return gridPanelConfig;
		}

		function generateAnalyticsView(fullViewModelSchema, columnsSettingsProfile) {
			var utilsConfig = getContainerConfig('gridUtils');
			var actionsContainer = getContainerConfig('SectionActionsContainer', 'analytics-actions');
			var leftConfig = {
				className: 'Terrasoft.Container',
				id: 'leftContainer',
				classes: {
					wrapClassName: [
						'analytics-left-container'
					]
				},
				selectors: {
					wrapEl: '#leftContainer'
				},
				items: [
					{
						className: 'Terrasoft.ControlGroup',
						caption: resources.localizableStrings.graphiscsCaption,
						classes: {
							wrapContainerClass: ['analytics-control-group']
						},
						collapsed: false,
						id: 'chartContainer',
						visible: {
							bindTo: 'haveCharts'
						},
						selectors: {
							wrapEl: '#chartContainer'
						},
						items: [
							{
								className: 'Terrasoft.Grid',
								type: 'tiled',
								id: 'chartGrid',
								selectRow: {
									bindTo: 'chartSelected'
								},
								activeRow: {
									bindTo: 'analyticsChartActiveRow'
								},
								columnsConfig: [
									{
										cols: 20,
										key: [
											{
												name: {
													bindTo: 'SysChartSeriesKind',
													primaryImageColumnName: 'Photo'
												},
												type: 'grid-icon-22x22'
											},
											{
												name: {
													bindTo: 'Caption',
													primaryImageColumnName: 'Photo'
												}
											}
										]
									}
								],
								collection: {
									bindTo: 'analyticsGridData'
								},
								watchedRowInViewport: {
									bindTo: 'loadNext'
								}
							}
						]
					},
					{
						className: 'Terrasoft.ControlGroup',
						caption: resources.localizableStrings.ReportCaption,
						classes: {
							wrapContainerClass: ['analytics-control-group']
						},
						collapsed: false,
						id: 'reportContainer',
						visible: {
							bindTo: 'haveReports'
						},
						selectors: {
							wrapEl: '#reportContainer'
						},
						items: [
							{
								className: 'Terrasoft.Grid',
								type: 'tiled',
								id: 'reportGrid',
								selectRow: {
									bindTo: 'reportSelected'
								},
								activeRow: {
									bindTo: 'reportActiveRow'
								},
								columnsConfig: [
									{
										cols: 20,
										key: [
											{
												name: {
													bindTo: 'Caption',
													primaryImageColumnName: 'Logo'
												},
												lookupImageType: 'grid-icon-22x22'
											}
										]
									}
								],
								collection: {
									bindTo: 'reportGridData'
								},
								watchedRowInViewport: {
									bindTo: 'loadNext'
								}
							}
						]

					}
				]
			};
			var rightConfig = {
				className: 'Terrasoft.Container',
				id: 'rightContainer',
				classes: {
					wrapClassName: [
						'analytics-right-container'
					]
				},
				selectors: {
					wrapEl: '#rightContainer'
				}
			};
			var resultConfig = {
				className: 'Terrasoft.Container',
				id: 'topContainer',
				selectors: {
					wrapEl: '#topContainer'
				},
				items: [
					actionsContainer,
					utilsConfig,
					leftConfig,
					rightConfig
				]
			};
			return resultConfig;
		}

		function generateTabItems(views) {
			var headerButton = {
				className: 'Terrasoft.Button',
				classes: {
					wrapperClass: 'header-tab-btn-user-class',
					innerWrapperClass: 'header-tab-btn-inner-user-class'
				},
				style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
				caption: {
					bindTo: 'tabName'
				}
			};
			var headerConfig = {};
			if (views.length > 1) {
				var menuItems = [];
				Terrasoft.each(views, function(viewItem) {
					menuItems.push({
						caption: viewItem.caption,
						tag: {
							name: viewItem.name,
							caption: viewItem.caption
						},
						click: {
							bindTo: 'changeView'
						}
					});
				});
				headerConfig = {
					className: 'Terrasoft.Button',
					classes: {
						wrapperClass: 'header-tab-btn-user-class',
						innerWrapperClass: 'header-tab-btn-inner-user-class'
					},
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					caption: {
						bindTo: 'tabName'
					},
					menu: {
						items: menuItems
					}
				};
			} else {
				headerConfig = {
					className: 'Terrasoft.Label',
					caption: {
						bindTo: 'tabName'
					},
					classes: {
						labelClass: ['section-header-caption']
					}
				};
			}
			return headerConfig;
		}

		function generateUtilsCongif(fullViewModelSchema, reports, viewName, sectionInfo) {
			var actionsCongif = getContainerConfig('SectionActionsContainer');
			var summaryConfig = getContainerConfig('summary-container');
			var summaryViewConfig = getContainerConfig('main-summary-view');
			summaryConfig.items.push(summaryViewConfig);
			var utilsConfig = getContainerConfig('gridUtils');
			var buttonPanelConfig = getContainerConfig('button-panel');
			buttonPanelConfig.items = [getButtonAddConfig(fullViewModelSchema.entitySchema,
				fullViewModelSchema.getEditPages, viewName)];
			var sectionConfig = fullViewModelSchema.sectionConfig || {};
			if (sectionConfig.hideActions !== true) {
				var actionButtons = [{
					caption: { bindTo: 'gridModeCaption' },
					methodName: 'switchGridMode'
				}, {
					caption: { bindTo: 'addToStaticFolderCaption' },
					methodName: 'addToStaticFolder',
					visible: {bindTo: 'addToStaticFolderVisible'}
				}, {
					caption: { bindTo: 'deleteFromStaticFolderCaption' },
					methodName: 'deleteFromStaticFolder',
					visible: { bindTo: 'deleteFromStaticFolderVisible' }
				}];

				if (!sectionInfo || !sectionInfo.isDeleteButtonHidden) {
					actionButtons.push({
						caption: resources.localizableStrings.DeleteButtonCaption,
						methodName: 'onMultiSelectDelete',
						visible: { bindTo: 'multiSelect' }
					});
				}

				actionUtilities.addActionsButton(buttonPanelConfig.items, actionButtons);
				actionUtilities.addActionsButton(buttonPanelConfig.items, fullViewModelSchema.actions);
				reports = actionUtilities.getReports(reports);
				actionUtilities.addActionsButton(buttonPanelConfig.items, reports);
			}
			if (sectionConfig.hideButtons !== true) {
				utilsConfig.items.push(buttonPanelConfig);
			}
			if (sectionConfig.hideSummary !== true) {
				utilsConfig.items.push(summaryConfig);
			}
			if (sectionConfig.hideSettings !== true) {
				utilsConfig.items.push(actionsCongif);
			}
			return utilsConfig;
		}

		return {
			getActionsCongif: getActionsCongif,
			getButtonAddConfig: getButtonAddConfig,
			generateUtilsCongif: generateUtilsCongif,
			generate: function(viewModelSchema, views, columnsSettingsProfile, reports, linksConfig, sectionInfo) {
				var fullViewModelSchema = getFullViewModelSchema(viewModelSchema, sectionInfo);
				entitySchema = fullViewModelSchema.entitySchema;
				var headerConfig = getHeaderConfig(views);
				var viewConfig = getContainerConfig('autoGeneratedContainer');
				var quickFilterConfig = getContainerConfig('quickFilterContainer', 'quickFilterContainer');
				var topContainer = getContainerConfig('topContainer', 'topContainer');
				if (!sectionInfo || !sectionInfo.isHeasderlHidden) {
					viewConfig.items = [headerConfig, quickFilterConfig];
				} else {
					viewConfig.items = [quickFilterConfig];
				}
				if (sectionInfo && sectionInfo.isTopContainerPresent) {
					viewConfig.items.push(topContainer);
					if (fullViewModelSchema.methods && fullViewModelSchema.methods.modifyTopConyainerConfig) {
						fullViewModelSchema.methods.modifyTopConyainerConfig(topContainer, fullViewModelSchema);
					}
				}
				var viewsConfig = {
					containerView: viewConfig,
					views: []
				};
				var linksConf = linksConfig || {};
				Terrasoft.each(views, function(view) {
					var viewConfig;
					if (Ext.isEmpty(linksConf[view.name])) {
						linksConf[view.name] = [];
					}
					var viewColumnsSettingsProfile = columnsSettingsProfile[view.name].value;
					if (fullViewModelSchema.methods &&
						fullViewModelSchema.methods.createViewConfig) {
						viewConfig = fullViewModelSchema.methods.createViewConfig(view.name, viewColumnsSettingsProfile,
							reports, linksConf[view.name]);
					}
					if (viewConfig !== null) {
						if (view.name === 'mainView' || view.likeMain) {
							viewConfig = generateMainView(fullViewModelSchema,
								viewColumnsSettingsProfile,
								linksConf[view.name], sectionInfo);
							viewConfig.items.unshift(getContainerConfig('spinnerContainer'));
							if (!sectionInfo || !sectionInfo.isButtonPanelHidden) {
								var utilsConfig = generateUtilsCongif(fullViewModelSchema, reports,
									view.name, sectionInfo);
								if (fullViewModelSchema.methods &&
									fullViewModelSchema.methods.modifyUtilsConfig) {
									fullViewModelSchema.methods.modifyUtilsConfig(utilsConfig);
								}
								viewConfig.items.unshift(utilsConfig);
							}
							if (sectionInfo !== null && sectionInfo.isRightPanelPresent) {
								var rightViewConfig = getContainerConfig('rightPanelContainer', 'rightPanelContainer');
								var centerPanelConfig = getContainerConfig('centerPanelContainer',
									'centerPanelContainer');
								viewConfig.classes = {
									wrapClassName: 'leftPanelContainer'
								};
								centerPanelConfig.items = [viewConfig, rightViewConfig];
								viewConfig = centerPanelConfig;
							}
						}
						if (view.name === 'analytics') {
							viewConfig = generateAnalyticsView(fullViewModelSchema, viewColumnsSettingsProfile);
						}
					}
					viewsConfig.views.push({
						name: view.name,
						viewConfig: viewConfig
					});
				});
				if (fullViewModelSchema.contextHelpId) {
					viewsConfig.contextHelpId = fullViewModelSchema.contextHelpId;
				}
				return viewsConfig;
			}
		};
	})
;