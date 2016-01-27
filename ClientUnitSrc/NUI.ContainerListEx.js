define("ContainerListEx", ["ContainerList"], function() {
	/**
	 * Класс реализует отображение коллекции элементов по конфигу контейнера.
	 * Расширенная версия, с возможностью синхронной отрисовки строк
	 */
	Ext.define("Terrasoft.controls.ContainerListEx", {
		extend: "Terrasoft.ContainerList",
		alternateClassName: "Terrasoft.ContainerListEx",

		/**
		 * Признак синхронной загрузки записей в реестр
		 * @protected
		 * @type {Boolean}
		 */
		isAsync: false,

		/**
		 * Префикс к идентификатору объекта
		 * @protected
		 * @type {String}
		 */
		endIdPrefix: "END",

		/**
		 * Декорирование вложенных контейнеров, добавление идентификатора
		 * @protected
		 */
		decorateView: function(items, id, prefix) {
			var decoratePrefixStr = Ext.String.format("-{0}-{1}-{2}", id, this.endIdPrefix, prefix);
			Terrasoft.each(items, function(item) {
				if (item.id) {
					item.id += decoratePrefixStr;
				}
				var selectors = item.selectors;
				if (selectors && selectors.wrapEl) {
					selectors.wrapEl += decoratePrefixStr;
				}
				var classes = item.classes;
				if (classes) {
					classes.wrapClassName = classes.wrapClassName || [];
					if (item.id) {
						classes.wrapClassName.push(item.id);
					}
				}
				if (item.items) {
					this.decorateView(item.items, id, prefix);
				}
			}, this);
		}
	});
	return Terrasoft.ContainerListEx;
});