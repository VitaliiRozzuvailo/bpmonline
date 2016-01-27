define("ConfigurationItemGenerator", ["ContainerList", "ViewGeneratorV2"], function() {

	/**
	 * @class Terrasoft.configuration.ConfigurationItemGenerator
	 * Класс генератора конфигурационных элементов.
	 */
	Ext.define("Terrasoft.configuration.ConfigurationItemGenerator", {
		alternateClassName: "Terrasoft.ConfigurationItemGenerator",
		extend: "Terrasoft.ViewGenerator",

		Ext: null,
		sandbox: null,
		Terrasoft: null,

		/**
		 * Генерирует конфигурацию компонента ContainerList
		 * @protected
		 * @param {Object} config Конфигурация, которая содержит свойства для генерации ContainerList
		 * @return {Object} Конфигурация компонента ContainerList
		 */
		generateContainerList: function(config) {
			var containerListConfig = {
				className: "Terrasoft.ContainerList",
				idProperty: config.idProperty,
				collection: {bindTo: config.collection},
				observableRowNumber: config.observableRowNumber,
				onGetItemConfig: {bindTo: config.onGetItemConfig}
			};
			if (config.generateId !== false) {
				Ext.apply(containerListConfig, {
					id: config.name + "ContainerList",
					selectors: {wrapEl: "#" + config.name + "ContainerList"}
				});
			}
			var serviceProperties = ["onGetItemConfig", "generator", "collection"];
			var configWithoutServiceProperties = this.getConfigWithoutServiceProperties(config, serviceProperties);
			Ext.apply(containerListConfig, configWithoutServiceProperties);
			return containerListConfig;
		}
	});

	return Ext.create("Terrasoft.ConfigurationItemGenerator");
});