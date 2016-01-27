define('OverdueActivitiesDashboardSection', ['ext-base', 'terrasoft', 'sandbox',
'OverdueActivitiesDashboardSectionResources', 'ConfigurationConstants'],
	function(Ext, Terrasoft, sandbox, resources, ConfigurationConstants) {
		var getViewModel = function() {
			return Ext.create('Terrasoft.BaseViewModel', {
				//todo SysModuleAnalyticsChart deleted
				entitySchema: null,
				methods: {
					getChart: function(key) {
						sandbox.publish('GenerateChart', key);
					},
					load: function() {

					}
				}
			});
		};
		var charsConfig = [
			{
				name: 'Chart1',
				chartId: ConfigurationConstants.Dashboard.Type.OverdueActivities,
				containerId: 'OverdueActivitiesDashboardSectionContainer1',
				filters: function() {
					var filtersCollection = Terrasoft.createFilterGroup();
					filtersCollection.add('StatusFilter', Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL,
						'Status', ConfigurationConstants.Activity.Status.NotStarted));
					filtersCollection.add('DateFilter', Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.LESS,
						'DueDate', new Date()));
					return filtersCollection;
				}
			}
		];

		function generateMainView() {
			var leftConfig = Ext.create('Terrasoft.Container', {
				id: 'OverdueActivitiesDashboardSectionContainer',

				selectors: {
					wrapEl: '#OverdueActivitiesDashboardSectionContainer'
				},
				items: [
					Ext.create('Terrasoft.Container', {
						id: 'OverdueActivitiesDashboardSectionContainer1',
						selectors: {
							wrapEl: '#OverdueActivitiesDashboardSectionContainer1'
						},
						items: [
							{
								className: 'Terrasoft.Label',
								classes: {
									labelClass: ['graph-header-name']
								},
								caption: resources.localizableStrings.overdueActivityCaption
							}
						]
					})
				]
			});
			var resultConfig = Ext.create('Terrasoft.Container', {
				id: 'TopOverdueActivitiesDashboardSectionContainer1',
				selectors: {
					wrapEl: '#TopOverdueActivitiesDashboardSectionContainer1'
				},
				items: [
					leftConfig
				]
			});
			return resultConfig;
		}

		function loadChart(name, renderTo) {
			var chartId = name;
			sandbox.loadModule('ChartModule', {
				id: chartId,
				renderTo: renderTo
			});

		}

		var render = function(renderTo) {
			var viewConfig = generateMainView();
			var viewModel = getViewModel();
			viewConfig.bind(viewModel);
			viewConfig.render(renderTo);
			var sandboxChartId = sandbox.id + '_ChartModule';
			sandbox.subscribe('GetChartId', function(chartName) {
				for (var i = 0; i < charsConfig.length; i++) {
					var config = charsConfig[i];
					if (config.name === chartName) {
						return config.chartId;
					}
				}
			}, [sandboxChartId]);
			sandbox.subscribe('GetChartParameters', function(chartName) {
				return {
					hideCaption: true
				};
			}, [sandboxChartId]);

			sandbox.subscribe('GetChartFilter', function(chartName) {
				for (var i = 0; i < charsConfig.length; i++) {
					var config = charsConfig[i];
					if (config.name === chartName) {
						return config.filters();
					}
				}
			}, [sandboxChartId]);
			for (var i = 0; i < charsConfig.length; i++) {
				var config = charsConfig[i];
				var chartRenderTo = Ext.get(config.containerId);
				config.name = sandbox.id + '_ChartModule';
				loadChart(config.name, chartRenderTo);
			}
		};
		return {
			userCode: function() {
			},
			schema: function() {
			},
			methods: function() {
			},
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
	}
)
;