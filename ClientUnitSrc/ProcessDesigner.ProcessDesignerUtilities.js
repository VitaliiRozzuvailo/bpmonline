define('ProcessDesignerUtilities', ['ext-base', 'terrasoft', 'ProcessDesignerUtilitiesResources',
    'ProcessSchema'],
    function(Ext, Terrasoft, resources, ProcessSchema) {

        function createContainerConfig(id) {
            return {
                className: 'Terrasoft.Container',
                items: [],
                id: id,
                selectors: {
                    wrapEl: '#' + id
                }
            };
        }

		function createButtonConfig(id, caption, style) {
			var buttonConfig = {
				id: id,
				selectors: {
					wrapEl: '#' + id
				},
				className: 'Terrasoft.Button',
				style: style || Terrasoft.controls.ButtonEnums.style.DEFAULT,
				caption: caption,
				classes: {
					wrapperClass: ['btn-panel']
				}
			};
			return buttonConfig;
		}

		function getSaveButtonConfig() {
			var buttonConfig = createButtonConfig('save', resources.localizableStrings.SaveButtonCaption,
				Terrasoft.controls.ButtonEnums.style.GREEN);
			buttonConfig.menu = {
				items: [{
					caption: resources.localizableStrings.SaveButtonCaption,
					click: {
						bindTo: 'save'
					}
				},
				{
					caption: resources.localizableStrings.PublishButtonCaption,
					click: {
						bindTo: 'publish'
					}
				}
			]
			};
			return Ext.apply({}, buttonConfig);
		}

		function getPropertiesButtonConfig() {
			var buttonConfig = createButtonConfig('properties', resources.localizableStrings.PropertiesButtonCaption);
			buttonConfig.click = {
				bindTo: 'getProperties'
			};
			return Ext.apply({}, buttonConfig);
		}

		function getCancelButtonConfig() {
			var buttonConfig = createButtonConfig('cancel', resources.localizableStrings.CancelButtonCaption);
			buttonConfig.click = {
				bindTo: 'cancel'
			};
			return Ext.apply({}, buttonConfig);
		}

        function getSequenceFlowButtonConfig() {
            var buttonConfig = {
                className: 'Terrasoft.Button',
                style:  Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
                imageConfig: resources.localizableImages.Sequence,
                iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
                menu: {
                    items: [
                        {
                            imageConfig: resources.localizableImages.Sequence
                        },
                        {
                            imageConfig: resources.localizableImages.Sequence
                        }
                    ]
                }
            };
            return Ext.apply({}, buttonConfig);
        }

        function getSequenceFlowButtonConfig() {
            var buttonConfig = {
                className: 'Terrasoft.Button',
                style:  Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
                imageConfig: resources.localizableImages.Sequence,
                iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
                menu: {
                    items: [
                        {
                            imageConfig: resources.localizableImages.Sequence
                        },
                        {
                            imageConfig: resources.localizableImages.Sequence
                        }
                    ]
                }
            };
            return Ext.apply({}, buttonConfig);
        }

        function createViewModel() {
            var schema = ProcessSchema.createSchema();
			schema.methods.getProperties = function (){return {}};
            return Ext.create('Terrasoft.BaseViewModel', {
                values: schema.values,
                methods: schema.methods
            });
        }

		function getProcessDesignerViewConfig() {
			var processDesignerConfig = createContainerConfig('processDesigner');
			Ext.apply(processDesignerConfig, {
				styles: {
					wrapStyles: {
						width: '100%',
						height: '100%'
					}
				}
			});
			return processDesignerConfig;
		}

		function getLeftPanelViewConfig() {
			var leftPanelConfig = createContainerConfig('pdLeftPanel');
			Ext.apply(leftPanelConfig, {
				styles: {
					wrapStyles: {
						width: '25%',
						height: '100%',
						float: 'left',
                        'border-right': '1px solid #c2c6ce'
					}
				}
			});
			leftPanelConfig.items.push(getElementGroupsMenuConfig());
			leftPanelConfig.items.push(getElementsMenuConfig());
			return leftPanelConfig;
		}

		function getElementGroupsMenuConfig() {
			var elementGroupsMenuConfig = createContainerConfig('pdElementGroupsMenuPanel');
			Ext.apply(elementGroupsMenuConfig, {
				styles: {
					wrapStyles: {
						width: '100%',
						height: '30px',
						float: 'left'
					}
				}
			});
			var taskMenuButtonConfig = createButtonConfig('taskMenu', '',
				Terrasoft.controls.ButtonEnums.style.TRANSPARENT);
			Ext.apply(taskMenuButtonConfig,{
				imageConfig: resources.localizableImages.TaskMenu
			});
			var gatewayMenuButtonConfig = createButtonConfig('gatewayMenu', '',
				Terrasoft.controls.ButtonEnums.style.TRANSPARENT);
			Ext.apply(gatewayMenuButtonConfig,{
				imageConfig: resources.localizableImages.GatewayMenu
			});
			var endEventMenuButtonConfig = createButtonConfig('endEventMenu', '',
				Terrasoft.controls.ButtonEnums.style.TRANSPARENT);
			Ext.apply(endEventMenuButtonConfig,{
				imageConfig: resources.localizableImages.EndEventMenu
			});
			var artifactsMenuButtonConfig = createButtonConfig('artifactsMenu', '',
					Terrasoft.controls.ButtonEnums.style.TRANSPARENT);
			Ext.apply(artifactsMenuButtonConfig,{
				imageConfig: resources.localizableImages.ArtifactsMenu
			});
			var annotationMenuButtonConfig = createButtonConfig('annotationMenu', '',
					Terrasoft.controls.ButtonEnums.style.TRANSPARENT);
			Ext.apply(annotationMenuButtonConfig,{
				imageConfig: resources.localizableImages.AnnotationMenu
			});
			elementGroupsMenuConfig.items.push(taskMenuButtonConfig);
			elementGroupsMenuConfig.items.push(gatewayMenuButtonConfig);
			elementGroupsMenuConfig.items.push(endEventMenuButtonConfig);
			elementGroupsMenuConfig.items.push(artifactsMenuButtonConfig);
			elementGroupsMenuConfig.items.push(annotationMenuButtonConfig);
			return elementGroupsMenuConfig;
		}

		function getElementsMenuConfig() {
			var elementsMenuConfig = createContainerConfig('pdElementsMenuPanel');
			Ext.apply(elementsMenuConfig, {
				styles: {
					wrapStyles: {
						width: '100%',
						height: '100%',
						float: 'left'
					}
				}
			});
			return elementsMenuConfig;
		}

		function getCenterPanelViewConfig() {
			var centerPanelConfig = createContainerConfig('pdCenterPanel');
			Ext.apply(centerPanelConfig, {
				styles: {
					wrapStyles: {
						width: '74%',
						height: '100%',
						float: 'left'
					}
				}
			});
			return centerPanelConfig;
		}

		function getBtnPanelViewConfig() {
			var btnPanelConfig = createContainerConfig('pdBtnPanel');
			Ext.apply(btnPanelConfig, {
				styles: {
					wrapStyles: {
						'vertical-align': 'top',
						display: 'table-cell'
					}
				}
			});
			btnPanelConfig.items.push(getSaveButtonConfig());
			btnPanelConfig.items.push(getCancelButtonConfig());
			btnPanelConfig.items.push(getPropertiesButtonConfig());
            //btnPanelConfig.items.push(getSequenceFlowButtonConfig());
			return btnPanelConfig;
		}

		function getUtilsPanelViewConfig() {
			var utilsPanelConfig = createContainerConfig('pdUtilsPanel');
			Ext.apply(utilsPanelConfig, {
				styles: {
					wrapStyles: {
						height: '10%',
                        'margin-left': '15px'
					}
				}
			});
			utilsPanelConfig.items.push(getBtnPanelViewConfig());
			return utilsPanelConfig;
		}

		function getHeaderViewConfig() {
			var headerConfig = createContainerConfig('header');
			Ext.apply(headerConfig, {
				classes: {
					wrapClassName: ['header']
				}
			});
            Ext.apply(headerConfig, {
                styles: {
                    wrapStyles: {
                        'margin-left': '15px'
                    }
                }
            });
			headerConfig.items = [
				{
					className: 'Terrasoft.Container',
					id: 'header-name-container',
					classes: {
						wrapClassName: ['header-name-container']
					},
					selectors: {
						wrapEl: '#header-name-container'
					},
					items: [
						{
							className: 'Terrasoft.Label',
							id: 'header-name',
							caption: {
								bindTo: 'name'
							}
						}
					]
				},
				{
					className: 'Terrasoft.Container',
					id: 'card-command-line-container',
					classes: {
						wrapClassName: ['card-command-line']
					},
					selectors: {
						wrapEl: '#card-command-line-container'
					},
					items: []
				}
			];
			return headerConfig;
		}

		function getDiagramViewConfig(svgContainerName) {
			var processDesignerDiagramConfig = createContainerConfig(svgContainerName);
			Ext.apply(processDesignerDiagramConfig, {
				styles: {
					wrapStyles: {
						height: '90%'
					}
				}
			});
			return processDesignerDiagramConfig;
		}

		function loadCommandLineModule(sandbox) {
			var commandLineContainer = Ext.get('card-command-line-container');
			sandbox.loadModule('CommandLineModule', {
				renderTo: commandLineContainer
			});
		}

        function createView(svgContainerName) {
            var processDesignerConfig = getProcessDesignerViewConfig();
            var leftPanelConfig = getLeftPanelViewConfig();
            processDesignerConfig.items.push(leftPanelConfig);
            var centerPanelConfig = getCenterPanelViewConfig();
            processDesignerConfig.items.push(centerPanelConfig);
			var headerConfig = getHeaderViewConfig();
            var utilsPanelConfig = getUtilsPanelViewConfig();
			centerPanelConfig.items.push(headerConfig);
            centerPanelConfig.items.push(utilsPanelConfig);
            var processDesignerDiagramConfig = getDiagramViewConfig(svgContainerName);
            centerPanelConfig.items.push(processDesignerDiagramConfig);
			return Ext.create('Terrasoft.Container', processDesignerConfig);
        }

        return {
            createViewModel: createViewModel,
            createView: createView,
			loadCommandLineModule : loadCommandLineModule
        };
    });
