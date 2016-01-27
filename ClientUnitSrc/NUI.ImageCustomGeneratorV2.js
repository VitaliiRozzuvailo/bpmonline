define("ImageCustomGeneratorV2", ["ImageCustomGeneratorV2Resources", "ext-base", "terrasoft"], function() {
	var ImageCustomGenerator = Ext.define("Terrasoft.configuration.ImageCustomgenerator", {
		extend: "Terrasoft.ViewGenerator",
		alternateClassName: "Terrasoft.ImageCustomGenerator",

		/**
		 * Генерирует параметры создания контрола.
		 * @param {Object} config Параметры для генератора.
		 * @return {Object} Параметры создания контрола.
		 */
		generateCustomImageControl: function(config) {
			var id = this.getControlId(config, "Terrasoft.ImageEdit");
			var controlConfig = {
				className: "Terrasoft.ImageEdit",
				imageSrc: {bindTo: config.getSrcMethod},
				defaultImageSrc: config.defaultImage,
				change: {bindTo: config.onPhotoChange}
			};
			this.applyControlId(controlConfig, config, id);
			Ext.apply(controlConfig, this.getConfigWithoutServiceProperties(config,
				["generator", "getSrcMethod", "defaultImage", "onPhotoChange", "beforeFileSelected"]));
			return controlConfig;
		},

		/**
		 * Получает идентификатор контрола.
		 * @overriden
		 * @param {Object} config Параметры для генератора.
		 * @param {String} className Название класса.
		 * @return {String} Идентификатор контрола.
		 */
		getControlId: function(config, className) {
			if(className === "Terrasoft.ImageEdit"){
				return config.name + "ImageEdit"
			}
			return this.callParent(arguments);
		},

		/**
		 * Фомирует параметры создания элемента управления для отображения картинок.
		 * @param {Object} config Параметры для генератора.
		 * @return {Object}  Параметры создания элемента управления для отображения картинок.
		 */
		generateSimpleCustomImage: function(config) {
			var initialConfig = this.generateCustomImageControl(config);
			initialConfig.tpl = [
				/*jshint quotmark:false*/
				'<div id="{id}-image-edit" class="{wrapClass}">',
				'<img id="{id}-image-edit-element" src="{imageSrc}" title="{imageTitle}">',
				'</div>'
				/*jshint quotmark:true*/
			];
			return initialConfig;
		}
	});
	return Ext.create(ImageCustomGenerator);
});