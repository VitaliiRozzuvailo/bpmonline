define('AwaitingOpportunitiesDashboardSection', ['ext-base', 'terrasoft', 'sandbox',
'AwaitingOpportunitiesDashboardSectionResources', 'ConfigurationConstants'],
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
				name: 'Chart2',
				chartId: ConfigurationConstants.Dashboard.Type.AwaitingPayment,
				containerId: 'AwaitingOpportunitiesDashboardSection1',
				filters: function() {
					var currentDate = new Date();
					var value = currentDate;
					var filtersCollection = Terrasoft.createFilterGroup();
					filtersCollection.add('PaymentStatusFilter', Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL,
						'PaymentStatus.FinalStatus', false));
					filtersCollection.add('InvoiceOwnerFilter', Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL,
						'Owner', Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
					filtersCollection.add('StartFilter', Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.GREATER,
						'StartDate', Terrasoft.startOfMonth(new Date()),
							Terrasoft.DataValueType.DATE));
					filtersCollection.add('EndFilter', Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.LESS,
						'StartDate', Terrasoft.endOfMonth(new Date())));
					return filtersCollection;
				}
			}
		];

		function generateMainView() {
			var rightConfig = Ext.create('Terrasoft.Container', {
				id: 'AwaitingOpportunitiesDashboardSection',
				selectors: {
					wrapEl: '#AwaitingOpportunitiesDashboardSection'
				},
				items: [
					Ext.create('Terrasoft.Container', {
						id: 'AwaitingOpportunitiesDashboardSection1',
						selectors: {
							wrapEl: '#AwaitingOpportunitiesDashboardSection1'
						},
						items: [
							{
								className: 'Terrasoft.Label',
								classes: {
									labelClass: ['graph-header-name']
								},
								caption: resources.localizableStrings.awaitingOpportunities
							}
						]
					})
				]
			});
			var resultConfig = Ext.create('Terrasoft.Container', {
				id: 'topActivityContainer',
				selectors: {
					wrapEl: '#topActivityContainer'
				},
				items: [
					rightConfig
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