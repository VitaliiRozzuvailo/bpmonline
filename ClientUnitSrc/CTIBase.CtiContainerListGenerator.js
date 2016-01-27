define("CtiContainerListGenerator", ["ext-base", "terrasoft", "DesignViewGeneratorV2", "CtiContainerList"],
	function(Ext, Terrasoft) {
		var viewGenerator = Ext.define("Terrasoft.configuration.CtiContainerListGenerator", {
			extend: "Terrasoft.ViewGenerator",
			alternateClassName: "Terrasoft.CtiContainerListGenerator",

			/**
			 * Генерирует конфигурацию представления для {Terrasoft.CtiContainerList}.
			 * @protected
			 * @virtual
			 * @param {Object} config Описание элемента представления.
			 * @return {Object} Возвращает сгенерированное представление CtiContainerList.
			 */
			generateGrid: function(config) {
				var id = this.getControlId(config, "Terrasoft.Grid");
				var itemConfig = {
					itemType: Terrasoft.ViewItemType.CONTAINER,
					name: "row-container",
					items: config.itemConfig
				};
				this.generateItem(itemConfig);
				var result = {
					className: "Terrasoft.CtiContainerList",
					id: id,
					selectors: { wrapEl: "#" + id }
				};
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, ["itemConfig"]));
				this.applyControlConfig(result, config);
				return result;
			}
		});

		return Ext.create(viewGenerator);
	});