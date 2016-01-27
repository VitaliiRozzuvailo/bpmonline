define("ContainerListGenerator", ["ext-base", "terrasoft", "DesignViewGeneratorV2"],
	function(Ext, Terrasoft) {
		var viewGenerator = Ext.define("Terrasoft.configuration.ContainerListGenerator", {
			extend: "Terrasoft.ViewGenerator",
			alternateClassName: "Terrasoft.ContainerListGenerator",

			/**
			 * Генерирует конфигурацию представления для {Terrasoft.ContainerList}.
			 * @protected
			 * @virtual
			 * @param {Object} config Описание элемента представления.
			 * @return {Object} Возвращает сгенерированное представление ContainerList.
			 */
			generateGrid: function(config) {
				var id = this.getControlId(config, "Terrasoft.Grid");
				var itemConfig = {
					itemType: Terrasoft.ViewItemType.CONTAINER,
					name: "row-container",
					items: config.itemConfig
				};
				var item = this.generateItem(itemConfig);
				var result = {
					className: "Terrasoft.ContainerList",
					id: id,
					selectors: {wrapEl: "#" + id},
					defaultItemConfig: item
				};
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, ["itemConfig", "generator"]));
				this.applyControlConfig(result, config);
				return result;
			}
		});
		return Ext.create(viewGenerator);
	});
