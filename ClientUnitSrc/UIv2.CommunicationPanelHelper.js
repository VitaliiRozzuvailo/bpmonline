define("CommunicationPanelHelper", ["BaseModule"], function() {

		/**
		 * @class Terrasoft.configuration.CommunicationPanelHelper
		 * Класс генератора конфигурационных элементов коммуникационной панели.
		 */
		Ext.define("Terrasoft.configuration.CommunicationPanelHelper", {
			alternateClassName: "Terrasoft.CommunicationPanelHelper",
			extend: "Terrasoft.BaseModule",
			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Генерирует пункт меню для коммуникационной панели.
			 * @protected
			 * @param {Object} config Содержит свойства для генерации пунктов меню.
			 * @return {Object} Конфигурация пункта меню.
			 */
			generateMenuItem: function(config) {
				var imageConfig = Ext.isEmpty(config.imageConfig) ? {bindTo: "getItemImageConfig"} : config.imageConfig;
				var itemCaption = Ext.isEmpty(config.caption) ? {bindTo: config.tag + "Counter"} : config.caption;
				var style = Ext.isEmpty(config.style) ? Terrasoft.controls.ButtonEnums.style.TRANSPARENT : config.style;
				return {
					id: "view-button-" + config.name,
					className: "Terrasoft.Button",
					selectors: {wrapEl: "#view-button-" + config.name},
					caption: itemCaption,
					click: {bindTo: "onMenuItemClick"},
					imageConfig: imageConfig,
					hint: {"bindTo": "getHint"},
					pressed: {bindTo: config.tag + "Active"},
					classes: {
						imageClass: ["communication-panel-menu-images-class"],
						pressedClass: ["pressed-button-view"]
					},
					markerValue: config.name,
					style: style,
					tag: config.tag,
					visible: Ext.isEmpty(config.visible) || config.visible,
					width: "100%"
				};
			}
		});

		return Ext.create("Terrasoft.CommunicationPanelHelper");
	});