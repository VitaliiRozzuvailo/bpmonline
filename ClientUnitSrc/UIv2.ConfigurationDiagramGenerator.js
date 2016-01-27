define("ConfigurationDiagramGenerator", ["diagram", "ViewGeneratorV2"], function() {

	/**
	 * @class Terrasoft.configuration.ConfigurationDiagramGenerator
	 * Класс генератора диаграммы.
	 */
	Ext.define("Terrasoft.configuration.ConfigurationDiagramGenerator", {
		alternateClassName: "Terrasoft.ConfigurationDiagramGenerator",
		extend: "Terrasoft.ViewGenerator",

		Ext: null,
		sandbox: null,
		Terrasoft: null,

		/**
		 * Генерирует конфигурацию компонента diagram.
		 * @protected
		 * @param {Object} config Конфигурация, которая содержит свойства для генерации diagram.
		 * @return {Object} Конфигурация компонента diagram.
		 */
		generateDiagram: function(config) {
			var diagramConfig = {
				className: config.className || "Terrasoft.Diagram",
				items: {bindTo: config.items}
			};
			if (config.generateId !== false) {
				Ext.apply(diagramConfig, {
					id: config.name,
					selectors: {wrapEl: "#" + config.name}
				});
			}
			return diagramConfig;
		}
	});

	return Ext.create("Terrasoft.ConfigurationDiagramGenerator");
});
