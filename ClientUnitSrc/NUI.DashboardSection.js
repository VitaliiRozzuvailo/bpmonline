define('DashboardSection', ['ext-base', 'terrasoft', 'sandbox', 'DashboardSectionResources', 'ConfigurationConstants',
	'LocalizationUtilities', 'MaskHelper', 'DashboardModule'],
	function(Ext, Terrasoft, sandbox, resources, ConfigurationConstants, LocalizationUtilities, MaskHelper) {
		var getViewModel = function() {
			return Ext.create('Terrasoft.BaseViewModel', {
				//todo SysModuleAnalyticsChart deleted
				entitySchema: null,
				methods: {
					changeView: function(p1, p2, p3, p4) {
						Ext.getCmp('dashboard-top-container').items.clear();
						Ext.getCmp('dashboard-left-container').items.clear();
						Ext.getCmp('dashboard-right-container').items.clear();
						Ext.getCmp('dashboard-top-container').reRender();
						Ext.getCmp('dashboard-left-container').reRender();
						Ext.getCmp('dashboard-right-container').reRender();
						this.set('headerCaption', p1.moduleCaption);
						var dashboardId = p1.dashboardId;
						var dashboardProfileKey = 'DashboardSectiondashboardId';
						Terrasoft.utils.saveUserProfile(dashboardProfileKey, {
							lastDashboardId: dashboardId,
							headerCaption: this.get('headerCaption')
						}, false);
						var esq = Ext.create('Terrasoft.EntitySchemaQuery', {
							//todo DashboardItem deleted
							rootSchemaName: null
						});
						esq.addColumn('Id');
						esq.addColumn('ModuleName');
						esq.addColumn('ContainerId');
						esq.addColumn('CharModuleAnalyticsId');
						esq.addColumn('GroupCaption');
						var positionColumn = esq.addColumn('Position');
						positionColumn.orderDirection = Terrasoft.OrderDirection.ASC;
						positionColumn.orderPosition = 0;
						esq.filters.add('filterDashboard', Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, 'Dashboard', dashboardId));
						esq.getEntityCollection(function(result) {
							if (moduleInstance.isDestroyed) {
								return;
							}
							if (result.success) {
								var sandboxChartIds = [];
								var sandboxCharts = {};
								Terrasoft.each(result.collection.getItems(), function(item) {
									var sandboxChartId = sandbox.id + '_ChartModule' + Terrasoft.utils.generateGUID();
									sandboxChartIds.push(sandboxChartId);
									sandboxCharts[sandboxChartId] = {
										sandboxChartId: sandboxChartId,
										moduleName: item.get('ModuleName'),
										containerId: item.get('ContainerId'),
										charModuleAnalyticsId: item.get('CharModuleAnalyticsId'),
										groupCaption: item.get('GroupCaption'),
										position: item.get('Position'),
										id: item.get('Id')

									};
								});
								subscribeForResult(sandboxChartIds, sandboxCharts);
								Terrasoft.each(sandboxCharts, function(item) {
									if (item.moduleName && item.containerId) {
										loadDashboardModule(item.moduleName, item.containerId,
											item.charModuleAnalyticsId, item.sandboxChartId, item.groupCaption,
											item.position, item.id
										);
									}
								});

							}
						}, this);
					},
					getChart: function(key) {
						sandbox.publish('GenerateChart', key);
					},
					load: function() {

					}
				},
				values: {
					headerCaption: null
				}
			});
		};

		var viewModel;

		function loadDashboardInit(firstDashboardId) {
			var dashboardId = firstDashboardId;
			var esq = Ext.create('Terrasoft.EntitySchemaQuery', {
				//todo DashboardItem deleted
				rootSchemaName: null
			});
			esq.addColumn('Id');
			esq.addColumn('ModuleName');
			esq.addColumn('ContainerId');
			esq.addColumn('CharModuleAnalyticsId');
			esq.addColumn('GroupCaption');
			var positionColumn = esq.addColumn('Position');
			positionColumn.orderDirection = Terrasoft.OrderDirection.ASC;
			positionColumn.orderPosition = 0;
			esq.filters.add('filterDashboard', Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, 'Dashboard', dashboardId));
			esq.getEntityCollection(function(result) {
				if (moduleInstance.isDestroyed) {
					return;
				}
				if (result.success) {
					var sandboxChartIds = [];
					var sandboxCharts = {};
					Terrasoft.each(result.collection.getItems(), function(item) {
						var sandboxChartId = sandbox.id + '_ChartModule' +
							Terrasoft.utils.generateGUID();
						sandboxChartIds.push(sandboxChartId);
						sandboxCharts[sandboxChartId] = {
							sandboxChartId: sandboxChartId,
							moduleName: item.get('ModuleName'),
							containerId: item.get('ContainerId'),
							charModuleAnalyticsId: item.get('CharModuleAnalyticsId'),
							groupCaption: item.get('GroupCaption'),
							position: item.get('Position'),
							id: item.get('Id')
						};
					});
					subscribeForResult(sandboxChartIds, sandboxCharts);
					Terrasoft.each(sandboxCharts, function(item) {
						if (item.moduleName && item.containerId) {
							loadDashboardModule(item.moduleName, item.containerId,
								item.charModuleAnalyticsId, item.sandboxChartId, item.groupCaption, item.position,
								item.id
							);
						}
					});

				}
			}, this);
		}

		function loadDashboards(renderTo) {
			if (!viewModel) {
				viewModel = getViewModel();
			}
			var dashboardsMenuItemsConfig = [];
			var esq = Ext.create('Terrasoft.EntitySchemaQuery', {
				//todo Dashboard deleted
				rootSchema: null
			});
			esq.addColumn('Id');
			//esq.addColumn('Name');
			LocalizationUtilities.addLocalizableColumn(esq, 'Name');
			var positionColumn = esq.addColumn('Position');
			positionColumn.orderDirection = Terrasoft.OrderDirection.ASC;
			positionColumn.orderPosition = 0;
			var filtersCollection = Terrasoft.createFilterGroup();
			filtersCollection.add('IsNUI', Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL,
				'IsNUI', true));
			esq.filters = filtersCollection;
			esq.getEntityCollection(function(result) {
				if (moduleInstance.isDestroyed) {
					return;
				}
				if (result.success) {
					if (result.collection.collection.length > 0) {
						var firstdashboardId = result.collection.collection.items[0].get('Id');
						var dashboardProfileKey = 'DashboardSectiondashboardId';
						require(['profile!' + dashboardProfileKey],
							function(dashboardProfile) {
								if (moduleInstance.isDestroyed) {
									return;
								}
								var dashboardProfileSettings = dashboardProfile;
								if (dashboardProfile.lastDashboardId) {
									firstdashboardId = dashboardProfile.lastDashboardId;
								}
								if (dashboardProfile.headerCaption) {
									viewModel.set('headerCaption', dashboardProfile.headerCaption);
								}
								loadDashboardInit(firstdashboardId);
							});
						Terrasoft.each(result.collection.getItems(), function(item) {
							var itemCaption = Ext.String.format(resources.localizableStrings.summaryCaption,
								item.get('Name'));
							if (!viewModel.get('headerCaption')) {
								viewModel.set('headerCaption', itemCaption);
							}
							var dashboard = {
								caption: itemCaption,
								tag: {
									name: 'item2',
									caption: 'item2',
									dashboardId: item.get('Id'),
									//moduleName: 'ActivityDashboardSection',
									moduleCaption: itemCaption
								},
								click: {
									bindTo: 'changeView'
								}
							};
							dashboardsMenuItemsConfig.push(dashboard);
						});
					}
					else {
						viewModel.set('headerCaption', resources.localizableStrings.noSummaryCaption);
					}
				}
				var viewConfig = generateMainView(dashboardsMenuItemsConfig);
				viewConfig.bind(viewModel);
				viewConfig.render(renderTo);
				loadContextHelp('1013');
				loadCommandLine();
			}, this);
		}

		function loadCommandLine() {
			var commandLineContainer = Ext.get('card-command-line-container');
			sandbox.loadModule('CommandLineModule', {
				renderTo: commandLineContainer
			});
		}

		function loadContextHelp(id) {
			sandbox.subscribe('GetContextHelpId', function() {
				return id;
			}, [id]);
			var contextHelpContainer = Ext.get('dashboard-context-help-container');
			sandbox.loadModule('ContextHelpModule', {
				renderTo: contextHelpContainer,
				id: id
			});
		}

		function loadTopDashboardModule(module) {
			var dashboardTopContainer = Ext.get('dashboard-top-container');
			sandbox.loadModule(module, {
				renderTo: dashboardTopContainer
			});
		}

		function loadLeftDashboardModule(module) {
			var dashboardLeftContainer = Ext.get('dashboard-left-container');
			sandbox.loadModule(module, {
				renderTo: dashboardLeftContainer
			});
		}

		function loadRightDashboardModule(module) {
			var dashboardRightContainer = Ext.get('dashboard-right-container');
			sandbox.loadModule(module, {
				renderTo: dashboardRightContainer
			});
		}

		function subscribeForResult(sandboxChartsIds, charts) {
			sandbox.subscribe('GetChartId', function(chartId) {
				return charts[chartId].charModuleAnalyticsId;
			}, sandboxChartsIds);
		}

		function loadDashboardModule(module, container, chartId, sandboxChartId, groupCaption, position, id) {
			var dashboardRightContainer = Ext.getCmp(container);
			var containerId = id + module + container + 'DashboardContainer' + position;
			if (Ext.getCmp(containerId)) {
				Ext.getCmp(containerId).destroy();
			}
			var innerContainer = Ext.create('Terrasoft.Container', {
				//caption: groupCaption,
				id: containerId,
				selectors: {
					wrapEl: '#' + containerId
				},
				items: []
			});
			dashboardRightContainer.add(innerContainer);

			if (!chartId) {
				sandbox.loadModule(module, {
					renderTo: Ext.get(containerId)
				});
			}
			else {
				sandbox.loadModule('ChartModule', {
					id: sandboxChartId,
					renderTo: Ext.get(containerId)
				});
			}
		}

		function generateMainView(dashboardsMenuItemsConfig) {
			debugger;
			var resultConfig = Ext.create('Terrasoft.Container', {
				id: 'topContainer',
				selectors: {
					wrapEl: '#topContainer'
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
						items: [
							{
								id: 'headMenuButton',
								className: 'Terrasoft.Button',
								classes: {
									innerWrapperClass: 'header-button-menu',
									wrapperClass: 'header-button-text'
								},
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								caption: {
									bindTo: 'headerCaption'
								},
								menu: {
									id: 'innerMenu',
									items: dashboardsMenuItemsConfig
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
					},
					{
						className: 'Terrasoft.Container',
						id: 'dashboard-context-help-container',
						classes: {
							wrapClassName: ['dashboard-context-help-container']
						},
						selectors: {
							wrapEl: '#dashboard-context-help-container'
						},
						items: []
					},
					{
						className: 'Terrasoft.Container',
						id: 'dashboard-top-container',
						selectors: {
							wrapEl: '#dashboard-top-container'
						},
						items: []
					},
					{
						className: 'Terrasoft.Container',
						id: 'dashboard-bottom-container',
						selectors: {
							wrapEl: '#dashboard-bottom-container'
						},
						items: [
							{
								className: 'Terrasoft.Container',
								id: 'dashboard-left-container',
								classes: {
									wrapClassName: ['left-container']
								},
								selectors: {
									wrapEl: '#dashboard-left-container'
								},
								items: []
							},
							{
								className: 'Terrasoft.Container',
								id: 'dashboard-right-container',
								classes: {
									wrapClassName: ['right-container']
								},
								selectors: {
									wrapEl: '#dashboard-right-container'
								},
								items: []
							}
						]
					}
				]
			});
			return resultConfig;
		}

		function loadChart(name, renderTo) {
			sandbox.loadModule('ChartModule', {
				id: name,
				renderTo: renderTo
			});
		}

		var render = function(renderTo) {
			debugger;
			if (!viewModel) {
				viewModel = getViewModel();
			}
			loadDashboards(renderTo);
			MaskHelper.HideBodyMask();
		};

		var moduleInstance = {
			init: function() {
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
			},
			render: render
		};

		return moduleInstance;
	}
);