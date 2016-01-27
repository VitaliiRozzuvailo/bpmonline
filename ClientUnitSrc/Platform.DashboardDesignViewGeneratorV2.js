define("DashboardDesignViewGeneratorV2", ["ext-base", "terrasoft", "DesignViewGeneratorV2"],
	function(Ext, Terrasoft) {
		var viewGenerator = Ext.define("Terrasoft.configuration.DashboardDesignViewGenerator", {
			extend: "Terrasoft.DesignViewGenerator",
			alternateClassName: "Terrasoft.DashboardDesignViewGenerator",

			/**
			 * @inheritDoc Terrasoft.DesignViewGenerator#generateAddButtonItems
			 * @overridden
			 */
			generateAddButtonItems: function(column, row, config) {
				var tag = [config.name, column, row].join(":");
				var result = [];
				Terrasoft.each(Terrasoft.DashboardEnums.WidgetType, function(typeConfig, typeName) {
					var addTag = tag + ":" + typeName;
					result.push({
						caption: { "bindTo": "Resources.Strings.Add" + typeName + "ButtonCaption" },
						click: { bindTo: "addWidget" },
						tag: addTag
					});
				}, this);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для сетки {Terrasoft.ViewItemType.GRID_LAYOUT}.
			 * @override
			 * @param {Object} config Конфигурация сетки.
			 * @return {Object} Возвращает сгенерированное представление сетки.
			 */
			generateGridLayout: function() {
				var result = this.callParent(arguments);
				var gridLayout = result[0];
				gridLayout.markerValue = "DashboardGridLayout";
				return result;
			},

			/**
			 * @inheritDoc Terrasoft.DesignViewGenerator#getLabelCaption
			 * @overridden
			 */
			getLabelCaption: function(config) {
				if (config.itemType === Terrasoft.ViewItemType.MODULE) {
					return { "bindTo": config.name + "Caption" };
				} else {
					return this.callParent(arguments);
				}
			},

			/**
			 * @inheritDoc Terrasoft.DesignViewGenerator#getGridLayoutChangePanelConfig
			 * @overridden
			 */
			getGridLayoutChangePanelConfig: function(config) {
				var gridLayoutName = config.name;
				var panelConfig = this.callParent(arguments);
				var configItem = {
					"name": gridLayoutName + "editItem",
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": { "bindTo": "Resources.Strings.EditButtonCaption" },
					"tag": gridLayoutName,
					"markerValue": "editGridElement",
					"click": { "bindTo": "editItem"}
				};
				var copyItem = {
					"name": gridLayoutName + "copyItem",
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": { "bindTo": "Resources.Strings.CopyButtonCaption" },
					"classes": { "textClass": ["copy-button"] },
					"tag": gridLayoutName,
					"markerValue": "copyGridElement",
					"click": { "bindTo": "copyItem"}
				};
				panelConfig.items.unshift(configItem, copyItem);
				return panelConfig;
			}

		});

		return Ext.create(viewGenerator);
	});