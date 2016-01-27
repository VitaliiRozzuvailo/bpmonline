define("ActivityDashboardSection", ["ext-base", "terrasoft", "sandbox", "ActivityDashboardSectionResources",
	"InvoiceConfigurationConstants"],
	function(Ext, Terrasoft, sandbox, resources, InvoiceConfigurationConstants) {
		var getViewModel = function() {
			return Ext.create("Terrasoft.BaseViewModel", {
				//todo SysModuleAnalyticsChart deleted
				entitySchema: null,
				methods: {
					getChart: function(key) {
						sandbox.publish("GenerateChart", key);
					},
					load: function() {

					}
				}
			});
		};
		var charsConfig = [
			{
				name: "Chart3",
				chartId: InvoiceConfigurationConstants.Dashboard.Type.InvoiceByPayment,
				containerId: "ActivityDashboardSectionContainer1",
				filters: function() {
					var filtersCollection = Terrasoft.createFilterGroup();
					filtersCollection.add("InvoiceOwnerFilter", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL,
						"Owner", Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
					filtersCollection.add("StartFilter", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.GREATER,
						"StartDate", Terrasoft.startOfMonth(new Date()),
							Terrasoft.DataValueType.DATE));
					filtersCollection.add("EndFilter", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.LESS,
						"StartDate", Terrasoft.endOfMonth(new Date()),
							Terrasoft.DataValueType.DATE));
					return filtersCollection;
				}
			}
		];

		function generateMainView() {
			var rightConfig = Ext.create("Terrasoft.Container", {
				id: "ActivityDashboardSectionContainer",
				selectors: {
					wrapEl: "#ActivityDashboardSectionContainer"
				},
				items: [
					Ext.create("Terrasoft.Container", {
						id: "ActivityDashboardSectionContainer1",
						selectors: {
							wrapEl: "#ActivityDashboardSectionContainer1"
						},
						items: [
							{
								className: "Terrasoft.Label",
								classes: {
									labelClass: ["graph-header-name"]
								},
								caption: resources.localizableStrings.invoicesByStatus
							}
						]
					})
				]
			});
			var resultConfig = Ext.create("Terrasoft.Container", {
				id: "topActivityDashboardSectionContainer1",
				selectors: {
					wrapEl: "#topActivityDashboardSectionContainer1"
				},
				items: [
					rightConfig
				]
			});
			return resultConfig;
		}

		function loadChart(name, renderTo) {
			var chartId = name;
			sandbox.loadModule("ChartModule", {
				id: chartId,
				renderTo: renderTo
			});

		}

		var render = function(renderTo) {
			var viewConfig = generateMainView();
			var viewModel = getViewModel();
			viewConfig.bind(viewModel);
			viewConfig.render(renderTo);
			var sandboxChartId = sandbox.id + "_ChartModule";
			sandbox.subscribe("GetChartId", function(chartName) {
				for (var i = 0; i < charsConfig.length; i++) {
					var config = charsConfig[i];
					if (config.name === chartName) {
						return config.chartId;
					}
				}
			}, [sandboxChartId]);
			sandbox.subscribe("GetChartParameters", function(chartName) {
				return {
					hideCaption: true
				};
			}, [sandboxChartId]);

			sandbox.subscribe("GetChartFilter", function(chartName) {
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
				config.name = sandbox.id + "_ChartModule";
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
				var state = sandbox.publish("GetHistoryState");
				var currentHash = state.hash;
				var currentState = state.state || {};
				if (currentState.moduleId === sandbox.id) {
					return;
				}
				var newState = Terrasoft.deepClone(currentState);
				newState.moduleId = sandbox.id;
				sandbox.publish("ReplaceHistoryState", {
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