define("DashboardSectionV2", ["ext-base", "terrasoft", "sandbox", "DashboardSectionV2Resources",
		 "LocalizationUtilities", "css!DashboardSectionV2"],
	function(Ext, Terrasoft, sandbox, resources, LocalizationUtilities) {

		function getViewModel() {
			return Ext.create("Terrasoft.BaseViewModel", {
				values: {
					TabsCollection: new Terrasoft.BaseViewModelCollection(),
					ActiveTabName: null,
					IsScrollVisible: false
				},
				methods: {
					activeTabChange: function(tab) {
						Ext.getCmp("dashboard-top-container").items.clear();
						Ext.getCmp("dashboard-left-container").items.clear();
						Ext.getCmp("dashboard-right-container").items.clear();
						Ext.getCmp("dashboard-top-container").reRender();
						Ext.getCmp("dashboard-left-container").reRender();
						Ext.getCmp("dashboard-right-container").reRender();
						var dashboardId = tab.get("Id");
						if (Terrasoft.isEmptyGUID(dashboardId)) {
							this.set("ActiveTabName", null);
							return;
						}
						var dashboardProfileKey = "DashboardSectiondashboardId";
						Terrasoft.utils.saveUserProfile(dashboardProfileKey, {
							lastDashboardId: dashboardId,
							ActiveTabName: this.get("ActiveTabName")
						}, false);
						var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
							//todo DashboardItem deleted
							rootSchemaName: null
						});
						esq.addColumn("Id");
						esq.addColumn("ModuleName");
						esq.addColumn("ContainerId");
						esq.addColumn("CharModuleAnalyticsId");
						esq.addColumn("GroupCaption");
						var positionColumn = esq.addColumn("Position");
						positionColumn.orderDirection = Terrasoft.OrderDirection.ASC;
						positionColumn.orderPosition = 0;
						esq.filters.add("filterDashboard", Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "Dashboard", dashboardId));
						esq.getEntityCollection(function(result) {
							if (moduleInstance.isDestroyed) {
								return;
							}
							if (result.success) {
								var sandboxChartIds = [];
								var sandboxCharts = {};
								Terrasoft.each(result.collection.getItems(), function(item) {
									var sandboxChartId = sandbox.id + "_ChartModule" + Terrasoft.utils.generateGUID();
									sandboxChartIds.push(sandboxChartId);
									sandboxCharts[sandboxChartId] = {
										sandboxChartId: sandboxChartId,
										moduleName: item.get("ModuleName"),
										containerId: item.get("ContainerId"),
										charModuleAnalyticsId: item.get("CharModuleAnalyticsId"),
										groupCaption: item.get("GroupCaption"),
										position: item.get("Position"),
										id: item.get("Id")

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
						sandbox.publish("GenerateChart", key);
					}
				}
			});
		}

		function generateMainView() {
			var resultConfig = {
				id: "topContainer",
				selectors: {
					wrapEl: "#topContainer"
				},
				items: [
					{
						className: "Terrasoft.TabPanel",
						tabs: {
							bindTo: "TabsCollection"
						},
						activeTabName: {
							bindTo: "ActiveTabName"
						},
						isScrollVisible: {
							bindTo: "IsScrollVisible"
						},
						activeTabChange: { bindTo: "activeTabChange" }
					}, {
						className: "Terrasoft.Container",
						id: "dashboard-top-container",
						selectors: {
							wrapEl: "#dashboard-top-container"
						},
						items: []
					},
					{
						className: "Terrasoft.Container",
						id: "dashboard-bottom-container",
						selectors: {
							wrapEl: "#dashboard-bottom-container"
						},
						items: [
							{
								className: "Terrasoft.Container",
								id: "dashboard-left-container",
								classes: {
									wrapClassName: ["left-container"]
								},
								selectors: {
									wrapEl: "#dashboard-left-container"
								},
								items: []
							},
							{
								className: "Terrasoft.Container",
								id: "dashboard-right-container",
								classes: {
									wrapClassName: ["right-container"]
								},
								selectors: {
									wrapEl: "#dashboard-right-container"
								},
								items: []
							}
						]
					}
				]
			};
			return Ext.create("Terrasoft.Container", resultConfig);
		}

		function loadDashboards(viewModel) {
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				//todo Dashboard deleted
				rootSchema: null
			});
			esq.addColumn("Id");
			LocalizationUtilities.addLocalizableColumn(esq, "Name");
			var positionColumn = esq.addColumn("Position");
			positionColumn.orderDirection = Terrasoft.OrderDirection.ASC;
			positionColumn.orderPosition = 0;
			var filtersCollection = Terrasoft.createFilterGroup();
			filtersCollection.add("IsNUI", Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL,
				"IsNUI", true));
			esq.filters = filtersCollection;
			esq.getEntityCollection(function(result) {
				if (moduleInstance.isDestroyed) {
					return;
				}
				if (result.success) {
					var tabsCollection = viewModel.get("TabsCollection");
					if (result.collection.collection.length > 0) {
						Terrasoft.each(result.collection.getItems(), function(item) {
							tabsCollection.add(tabsCollection.getUniqueKey(), item);
						});
						viewModel.set("IsScrollVisible", tabsCollection.collection.length > 4);
						require(["profile!" + "DashboardSectiondashboardId"],
							function(dashboardProfile) {
								if (moduleInstance.isDestroyed) {
									return;
								}
								if (dashboardProfile.ActiveTabName) {
									viewModel.set("ActiveTabName", dashboardProfile.ActiveTabName);
								} else {
									Terrasoft.each(tabsCollection.collection.items, function(item) {
										if (!viewModel.get("ActiveTabName")) {
											viewModel.set("ActiveTabName", item.get("Id"));
										}
									});
								}
							});
					}
					else {
						var tab = Ext.create("Terrasoft.BaseViewModel", {
							values: {
								Name: Terrasoft.GUID_EMPTY,
								Caption: resources.localizableStrings.noSummaryCaption,
								Id: Terrasoft.GUID_EMPTY
							}
						});
						tabsCollection.add(tabsCollection.getUniqueKey(), tab);
						viewModel.set("ActiveTabName", null);
						viewModel.set("IsScrollVisible", false);
					}
				}
			}, this);
		}

		function subscribeForResult(sandboxChartsIds, charts) {
			sandbox.subscribe("GetChartId", function(chartId) {
				return charts[chartId].charModuleAnalyticsId;
			}, sandboxChartsIds);
		}

		function loadDashboardModule(module, container, chartId, sandboxChartId, groupCaption, position, id) {
			var dashboardRightContainer = Ext.getCmp(container);
			var containerId = id + module + container + "DashboardContainer" + position;
			if (Ext.getCmp(containerId)) {
				Ext.getCmp(containerId).destroy();
			}
			var innerContainer = Ext.create("Terrasoft.Container", {
				id: containerId,
				selectors: {
					wrapEl: "#" + containerId
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
				sandbox.loadModule("ChartModule", {
					id: sandboxChartId,
					renderTo: Ext.get(containerId)
				});
			}
		}

		var render = function(renderTo) {
			var viewModel = getViewModel();
			loadDashboards(viewModel);
			var viewConfig = generateMainView();
			viewConfig.bind(viewModel);
			viewConfig.render(renderTo);
		};

		var moduleInstance = {
			init: function() {
				sandbox.publish("InitDataViews", {caption: resources.localizableStrings.sectionCaption});
				sandbox.publish("InitContextHelp", 1013);
			},
			render: render
		};

		return moduleInstance;
	}
);