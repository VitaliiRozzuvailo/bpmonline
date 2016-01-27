define("LeftPanelClientWorkplaceMenu", ["LeftPanelClientWorkplaceMenuResources", "MaskHelper", "ServiceHelper",
	"RightUtilities", "profile!clientWorkplaceMenuProfile", "css!LeftPanelTopMenuModule"],
	function(resources, MaskHelper, ServiceHelper, RightUtilities, clientWorkplaceMenuProfile) {
		function createConstructor(context) {
			var container;
			var viewModel;
			var Ext = context.Ext;
			var sandbox = context.sandbox;
			var Terrasoft = context.Terrasoft;
			var profile = clientWorkplaceMenuProfile;

			var getViewConfig = function() {
				var topMenuContainer = {
					className: "Terrasoft.Container",
					id: "top-menu-workplace-button-container",
					selectors: {
						wrapEl: "#" + "top-menu-workplace-button-container"
					},
					classes: {
						wrapClassName: ["top-menu-workplace-button-container-wrapEl"]
					},
					items: getTopMenuConfig("Default")
				};
				return topMenuContainer;
			};

			function getTopMenuConfig(caption) {
				var menuConfig = {
						id: "menu-workplace-button",
						selectors: {
							wrapEl: "#menu-workplace-button"
						},
						tag: "TopWorkplaceMenu",
						markerValue: "TopWorkplaceMenu",
						className: "Terrasoft.Button",
						style: {
							bindTo: "TopWorkplaceMenuButtonStyle"
						},
						caption: {
							bindTo: "TopWorkplaceMenuCaption"
						},
						menu: {
							items: {
								bindTo: "WorkplaceCollection"
							}
						},
						prepareMenu: {bindTo: "addHighlight"},
						hideMenu: {bindTo: "removeHighlight"}
					};
				return [menuConfig];
			}

			var getViewModel = function() {
				return Ext.create("Terrasoft.BaseViewModel", {
					values: {
						selectedWorkplaceId: null,
						TopWorkplaceMenuCaption: "",
						WorkplaceCollection: Ext.create("Terrasoft.BaseViewModelCollection"),
						TopWorkplaceMenuButtonStyle: Terrasoft.controls.ButtonEnums.style.TRANSPARENT
					},
					methods: {
						reloadMenu: function(workplaces, workplaceId) {
							var control = Ext.getCmp("menu-workplace-button");
							if (!control) {
								return;
							}
							var menuItems = [];
							Terrasoft.each(workplaces, function(item) {
								if (item.hide) {
									return;
								}
								var menuItemConfig = {
									caption: item.name,
									tag: item.workplaceId,
									markerValue: item.name,
									click: {
										bindTo: "menuItemClick"
									}
								};
								menuItems.push(menuItemConfig);
								if (workplaceId === item.workplaceId) {
									control.caption = item.name;
								}
							}, this);
							if (workplaceId === undefined) {
								control.caption = workplaces[0].name;
							}
							var menu = Ext.create("Terrasoft.Menu", {
								items: menuItems,
								markerValue: "TopWorkplaceMenu"
							});
							menu.bind(this);
							control.menu = menu;
							control.reRender();
						},
						loadMenu: function(workplaces, workplaceId) {
							var collection = this.get("WorkplaceCollection");
							if (!collection.isEmpty()) {
								collection.clear();
							}
							Terrasoft.each(workplaces, function(item) {
								if (item.hide) {
									return;
								}
								collection.addItem(Ext.create("Terrasoft.BaseViewModel", {
									values: {
										Id: Terrasoft.generateGUID(),
										Caption: item.name,
										MarkerValue: item.name,
										Tag: item.workplaceId,
										Click: {bindTo: "menuItemClick"}
									}
								}));
								if (workplaceId === item.workplaceId) {
									this.set("TopWorkplaceMenuCaption", item.name);
								}
							}, this);
						},
						loadMenuItems: function(workplaceId) {
							var workplaces =
								Terrasoft.deepClone(Terrasoft.configuration.WorkplacesStructure.Workplaces);
							if (workplaces.length > 0) {
								workplaces.sort(function(a, b) {
									if (a.name < b.name) {
										return -1;
									}
									if (a.name > b.name) {
										return 1;
									}
									return 0;
								});
								this.loadMenu(workplaces, workplaceId);
							}
						},
						menuItemClick: function(tag) {
							if (this.get("selectedWorkplaceId") === tag) {
								return;
							}
							this.loadMenuItems(tag);
							var dataSend = {
								workplaceId: tag
							};
							Terrasoft.utils.saveUserProfile("clientWorkplaceMenuProfile", dataSend);
							ServiceHelper.callService("WorkplaceService", "SetWorkplaceCache", Terrasoft.emptyFn, dataSend, this);
							this.load(tag);
							this.set("selectedWorkplaceId", tag);
						},
						load: function(tag) {
							var workplaceItem = this.getWorkplaceData(tag);
							if (workplaceItem) {
								sandbox.subscribe("GetWorkplaceInfo", function(args) {
									return workplaceItem;
								});
								sandbox.loadModule(workplaceItem.loaderName);
							}
						},
						getWorkplaceData: function(workplaceId) {
							var workplaces = Terrasoft.configuration.WorkplacesStructure.Workplaces;
							var workplaceItem = null;
							if (workplaces.length > 0) {
								Terrasoft.each(workplaces, function(item) {
									if (item.workplaceId === workplaceId) {
										workplaceItem = item;
									}
								}, this);
							}
							return workplaceItem;
						},
						addHighlight: function() {
							this.set("TopWorkplaceMenuButtonStyle", "highlighted");
						},
						removeHighlight: function() {
							this.set("TopWorkplaceMenuButtonStyle", Terrasoft.controls.ButtonEnums.style.TRANSPARENT);
						}
					}
				});
			};
			var loadMenu = function() {
				var workplaceId;
				var workplaces = Terrasoft.configuration.WorkplacesStructure.Workplaces;
				if (profile && profile.workplaceId) {
					var isInWorkplace = workplaces.some(function(item) {
						return item.workplaceId === profile.workplaceId;
					});
					if (isInWorkplace) {
						workplaceId = profile.workplaceId;
					} else if (workplaces.length) {
						profile.workplaceId = workplaces[0].workplaceId;
						workplaceId = profile.workplaceId;
					}
				} else {
					if (workplaces.length) {
						workplaceId = profile.workplaceId = workplaces[0].workplaceId;
					}
				}
				if (workplaceId != null) {
					viewModel.loadMenuItems(workplaceId);
					viewModel.load(workplaceId);
				}
			};
			var generate = function() {
				var view = Ext.create("Terrasoft.Container", getViewConfig());
				viewModel = getViewModel();
				view.bind(viewModel);
				view.render(container);
				sandbox.subscribe("RefreshWorkplace", function(args) {
					ServiceHelper.callService("WorkplaceService", "RefreshWorkplace", function(responce) {
						Terrasoft.configuration.WorkplacesStructure = JSON.parse(responce.RefreshWorkplaceResult);
						loadMenu();
					}, null, this);
				});
				loadMenu();
				sandbox.subscribe("ChangeCurrentWorkplace", function(args) {
					viewModel.menuItemClick(args);
				});
			};

			function render(renderTo) {
				container = renderTo;
				generate();
			}

			return Ext.define("LeftPanelClientWorkplaceMenu", {
				render: render
			});
		}

		return createConstructor;
	});