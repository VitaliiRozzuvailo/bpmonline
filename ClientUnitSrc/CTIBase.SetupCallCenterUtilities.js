define("SetupCallCenterUtilities", ["BaseModule"], function() {
	/**
	 * @class Terrasoft.configuration.SetupCallCenterUtilities
	 * Класс генератора конфигурационных элементов страниц настроек параметров Call-центра.
	 */
	Ext.define("Terrasoft.configuration.SetupCallCenterUtilities", {
		alternateClassName: "Terrasoft.SetupCallCenterUtilities",
		extend: "Terrasoft.BaseModule",
		Ext: null,
		sandbox: null,
		Terrasoft: null,

		/**
		 * Генерирует CheckBox контрол, для страниц настроек параметров Call-центра.
		 * @protected
		 * @param {Object} config Содержит свойства для генерации контрола.
		 * @returns {Object} Конфигурация контрола.
		 */
		generateBottomCheckBoxControl: function(config) {
			var control = {
				className: "Terrasoft.Container",
				id: config.name + "Container",
				selectors: {wrapEl: "#" + config.name + "Container"},
				classes: {wrapClassName: ["setup-module-check-box"]},
				visible: Ext.isDefined(config.visible) ? config.visible : true,
				items: [
					{
						id: config.name + "Edit",
						markerValue: config.name,
						className: "Terrasoft.CheckBoxEdit",
						checked: {bindTo: config.name},
						hint: {bindTo: config.hint},
						enabled: Ext.isDefined(config.enabled) ? config.enabled : true
					},
					{
						id: config.name + "Label",
						className: "Terrasoft.Label",
						caption: {bindTo: "Resources.Strings." + config.name + "Caption"},
						classes: {labelClass: "setup-module-caption"}
					}
				]
			};
			return control;
		},

		/**
		 * Генерирует TextEdit контрол, для страниц настроек параметров Call-центра.
		 * @protected
		 * @param {Object} config Содержит свойства для генерации контрола.
		 * @returns {Object} Конфигурация контрола.
		 */
		generateTextEdit: function(config) {
			var labelClasses = (config.isRequired) ? ["control-caption", "required-caption"] : ["control-caption"];
			return [
				{
					className: "Terrasoft.Label",
					id: config.name + "Label",
					caption: {bindTo: "Resources.Strings." + config.name + "Caption"},
					classes: {labelClass: labelClasses}
				},
				{
					id: config.name + "Edit",
					markerValue: config.name,
					className: "Terrasoft.TextEdit",
					value: {bindTo: config.name},
					protect: config.protect || false
				}
			];
		}

	});
	return Ext.create("Terrasoft.SetupCallCenterUtilities");
});