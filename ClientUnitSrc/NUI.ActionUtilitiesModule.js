define('ActionUtilitiesModule', ['ext-base', 'ActionUtilitiesModuleResources', 'ReportUtilities'],
	function(Ext, resources, ReportUtilities) {
		var caption = resources.localizableStrings.ActionButtonCaption;
		var addItems = function(config, actions) {
			Terrasoft.each(actions, function(item) {
				var itemConfig = {
					caption: item.caption,
					tag: item.tag === undefined ? item.schemaName : item.tag,
					className: item.className,
					enabled: item.enabled ? item.enabled : true
				};
				if (item.className !== 'Terrasoft.MenuSeparator') {
					itemConfig.click = item.click ? item.click : {
						bindTo: item.methodName === undefined ? 'executeAction' : item.methodName
					};
				}
				if (item.menu) {
					itemConfig.menu = item.menu;
				}
				if (item.visible) {
					itemConfig.visible = item.visible;
				}
				if (!Ext.isEmpty(item.customConfig)) {
					Ext.apply(itemConfig, item.customConfig);
				}
				config.push(itemConfig);
			});
		};
		var getActionsButtonConfig = function(actions) {
			var config = {
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
				caption: resources.localizableStrings.ActionButtonCaption,
				classes: {
					wrapperClass: ['main-buttons']
				}
			};
			var menuItemConfig = [];
			addItems(menuItemConfig, actions);
			var configMenu = {
				menu: {
					items: menuItemConfig
				}
			};
			Ext.apply(config, configMenu);
			return config;
		};

		return {
			addActionsButton: function(buttonsConfig, actions) {
				if (actions) {
					var actionsButton = buttonsConfig.filter(function(button) {
						return button.caption === caption;
					});
					if (actionsButton && actionsButton.length > 0) {
						addItems(actionsButton[0].menu.items, actions);
					} else {
						buttonsConfig.push(getActionsButtonConfig(actions));
					}
				}
			},
			getReports: function(reports) {
				if (reports.length) {
					var reportsButtonConfig = ReportUtilities.getReportsMenuConfig(reports);
					if (reportsButtonConfig.length > 0) {
						reportsButtonConfig.unshift({
							caption: resources.localizableStrings.PrintCaption,
							className: 'Terrasoft.MenuSeparator'
						});
					}
					return reportsButtonConfig;
				}
			}
		};
	}
);
