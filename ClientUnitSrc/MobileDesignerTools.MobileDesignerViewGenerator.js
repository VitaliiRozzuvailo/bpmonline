define("MobileDesignerViewGenerator", ["ext-base", "terrasoft", "DesignViewGeneratorV2"],
	function(Ext, Terrasoft) {

		/**
		 * Класс элемента в сетке дизайнера мобильного приложения.
		 * @class Terrasoft.configuration.MobileDesignerGridLayoutEditItem
		 */
		Ext.define("Terrasoft.configuration.MobileDesignerGridLayoutEditItem", {
			extend: "Terrasoft.controls.GridLayoutEditItem",
			alternateClassName: "Terrasoft.MobileDesignerGridLayoutEditItem",

			/**
			 * @inheritDoc Terrasoft.GridLayoutEditItem#b4StartDrag
			 * @overridden
			 */
			b4StartDrag: function() {
				this.callParent(arguments);
				this.wrapEl.setVisible(true);
			}
		});

		/**
		 * @class Terrasoft.configuration.MobileDesignerViewGenerator
		 * Класс-генератор представления дизайнера мобильного приложения.
		 */
		var viewGenerator = Ext.define("Terrasoft.configuration.MobileDesignerViewGenerator", {
			extend: "Terrasoft.ViewGenerator",
			alternateClassName: "Terrasoft.MobileDesignerViewGenerator",

			/**
			 * @inheritDoc Terrasoft.ViewGenerator#generateControlGroup
			 * @overridden
			 */
			generateControlGroup: function(config) {
				var wrapClass = config.wrapClass || [];
				wrapClass.push("detail");
				var caption = config.caption;
				var controlGroup = {
					className: "Terrasoft.ControlGroup",
					caption: caption,
					collapsed: { bindTo: config.name + "Collapsed" },
					collapsedchanged: { bindTo: config.name + "CollapseChange" },
					items: [],
					wrapClass: wrapClass.join(" "),
					markerValue: caption
				};
				Terrasoft.each(config.items, function(childItem) {
					var childItemConfig = this.generateItem(childItem);
					controlGroup.items = controlGroup.items.concat(childItemConfig);
				}, this);
				if (!config.disableTools) {
					controlGroup.tools = this.generateControlGroupTools(config);
				}
				return controlGroup;
			},

			/**
			 * Генерирует конфигурацию элементов настройки для группы элементов.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация группы элементов.
			 * @return {Object[]} Сгенерированное представление элементов настройки.
			 */
			generateControlGroupTools: function(config) {
				var configurationButton = this.generateButton({
					name: config.name + "Configuration",
					caption: { "bindTo": "Resources.Strings.ConfigureControlGroupButtonCaption" },
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					tag: config.name,
					click: { bindTo: "onConfigureControlGroupButtonClick" }
				});
				var removeButton = this.generateButton({
					name: config.name + "Remove",
					caption: { "bindTo": "Resources.Strings.RemoveControlGroupButtonCaption" },
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					tag: config.name,
					click: { bindTo: "onRemoveControlGroupButtonClick" }
				});
				var result = [configurationButton];
				if (config.useOrderTools) {
					var moveUpButton = this.generateButton({
						name: config.name + "MoveUp",
						imageConfig: { "bindTo": "Resources.Images.MoveUpButtonImage" },
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						tag: config.name,
						click: { bindTo: "onMoveUpControlGroupButtonClick" }
					});
					result.push(moveUpButton);
					var moveDownButton = this.generateButton({
						name: config.name + "MoveDown",
						imageConfig: { "bindTo": "Resources.Images.MoveDownButtonImage" },
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						tag: config.name,
						click: { bindTo: "onMoveDownControlGroupButtonClick" }
					});
					result.push(moveDownButton);
				}
				result.push(removeButton);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для сетки {Terrasoft.ViewItemType.GRID_LAYOUT}.
			 * @protected
			 * @overridden
			 * @param {Object} config Конфигурация сетки.
			 * @return {Object} Сгенерированное представление сетки.
			 */
			generateGridLayout: function(config) {
				var controlId = config.name;
				var result = {
					className: "Terrasoft.GridLayoutEdit",
					itemClassName: "Terrasoft.MobileDesignerGridLayoutEditItem",
					id: controlId,
					selectors: { wrapEl: "#" + controlId },
					rows: { bindTo: config.name + "Rows" },
					columns: 1,
					items: { bindTo: config.name + "ItemsCollection" },
					selectedItemsChange: { bindTo: config.name + "SelectedItemsChange" },
					selectionChanged: { bindTo: config.name + "SelectionChanged" },
					visible: { bindTo: config.name + "Visible" },
					autoHeight: true,
					autoWidth: false,
					multipleSelection: false,
					allowItemsIntersection: false,
					changePositionForIntersectedItems: true,
					minRows: 1,
					maxRows: config.maxRows,
					selectionType: Terrasoft.GridLayoutEditSelectionType.HORIZONTAL
				};
				this.applyControlConfig(result, config);
				return result;
			}

		});
		return Ext.create(viewGenerator);
	});