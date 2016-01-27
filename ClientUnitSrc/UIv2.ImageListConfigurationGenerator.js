define("ImageListConfigurationGenerator", ["ContainerList", "BaseModule"], function() {

	/**
	 * @class Terrasoft.configuration.ImageListConfigurationGenerator
	 * Класс генератора конфигурационных элементов
	 */
	Ext.define("Terrasoft.configuration.ImageListConfigurationGenerator", {
		alternateClassName: "Terrasoft.ImageListConfigurationGenerator",
		extend: "Terrasoft.BaseModule",

		Ext: null,
		sandbox: null,
		Terrasoft: null,

		/**
		 * Генерирует конфигурацию компонента ContainerList.
		 * @protected
		 * @param {Object} config Конфигурация, которая содержит свойства для генерации ContainerList.
		 * @returns {Object} Конфигурация компонента ContainerList.
		 */
		generateContainerList: function(config) {
			var container = {
				className: "Terrasoft.ContainerList",
				id: config.name + "ContainerList",
				selectors: {wrapEl: "#" + config.name + "ContainerList"},
				idProperty: config.idProperty,
				isAsync: false,
				collection: {bindTo: config.collection},
				observableRowNumber: config.observableRowNumber,
				onGetItemConfig: {bindTo: config.onGetItemConfig},
				visible: {"bindTo": config.visible}
			};
			if (!Ext.isEmpty(config.wrapClassName)) {
				container.classes = {
					wrapClassName: config.wrapClassName
				};
			}
			return container;
		}
	});

	return Ext.create("Terrasoft.ImageListConfigurationGenerator");
});