define("MaskHelper", ["ext-base", "terrasoft", "MaskHelperResources"],
	function(Ext, Terrasoft) {
		/**
		 * Идентификатор маски загрузки раздела.
		 * @Type {String}
		 */
		var bodyMaskId;

		/**
		 * Отображает маску загрузки страницы, если она не была отображена.
		 * @param {Object} config Параметры для маски.
		 * @param {Number} config.timeout Задержка перед отображением маски.
		 * @param {Float} config.opacity Степень прозрачности маски в диапазоне с 0 до 1.
		 * @param {String} config.backgroundColor Цвет фона заливки маски.
		 */
		var showBodyMask = function(config) {
			bodyMaskId = Terrasoft.Mask.show(config) || bodyMaskId;
		};

		/**
		 * Скрывает маску загрузки страницы, если она была отображена.
		 */
		var hideBodyMask = function() {
			if (!Ext.isEmpty(bodyMaskId)) {
				Terrasoft.Mask.hide(bodyMaskId);
			}
		};

		return {
			ShowBodyMask: showBodyMask,
			HideBodyMask: hideBodyMask
		};
	});
