define("ImageListGenerator", ["ext-base", "terrasoft", "ViewGeneratorV2", "ImageList"],
	function(Ext, Terrasoft) {
		Ext.define("Terrasoft.configuration.ImageListGenerator", {
			singleton: true,
			extend: "Terrasoft.ViewGenerator",
			alternateClassName: "Terrasoft.ImageListGenerator",

			/**
			 * Генерирует конфигурацию представления для {Terrasoft.ContainerList}.
			 * @protected
			 * @virtual
			 * @param {Object} config Описание элемента представления.
			 * @return {Object} Возвращает сгенерированное представление ContainerList.
			 */
			generateImageList: function(config) {
				var result = {
					className: "Terrasoft.ImageList",
					value: {
						bindTo: this.getItemBindTo(config)
					},
					list: {
						bindTo: this.getExpandableListName(config)
					}
				};
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, ["generator"]));
				this.applyControlConfig(result, config);
				return result;
			}
		});

		return Terrasoft.configuration.ImageListGenerator;
	});