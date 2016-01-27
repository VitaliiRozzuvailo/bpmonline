define("MenuUtilities", ["ext-base"], function(Ext) {
	/**
	 * @class Terrasoft.configuration.MenuUtilities
	 * Класс MenuUtilities предназначен для проверки видимости меню.
	 */
	var menuUtilitiesClass = Ext.define("Terrasoft.configuration.MenuUtilities", {
		alternateClassName: "Terrasoft.MenuUtilities",

		/**
		 * Значение по умолчанию для видимости пункта меню.
		 */
		defaultMenuItemVisibility: true,

		/**
		 * Возвращает видимость меню по переданной коллекции пунктов.
		 * @param {Object} menuItems Коллекция пунктов меню.
		 * @param {Object} viewModel Контекст получения видимости пунктов меню.
		 * @return {Boolean} Видимость меню.
		 */
		getMenuVisible: function(menuItems, viewModel) {
			if (!menuItems || menuItems.isEmpty()) {
				return false;
			}
			var menuVisible = true;
			menuItems.each(function(menuItem) {
				menuVisible = this.getMenuItemVisible(menuItem, viewModel);
				return !menuVisible;
			}, this);
			return menuVisible;
		},

		/**
		 * Возвращает видимость пункта меню.
		 * @protected
		 * @param {Object} menuItem Пункт меню.
		 * @param {Object} viewModel Контекст получения видимости пункта меню.
		 * @return {Boolean} Видимость пункта меню.
		 */
		getMenuItemVisible: function(menuItem, viewModel) {
			var menuItemVisible = this.defaultMenuItemVisibility;
			var menuItemVisibleConfig = menuItem.get("Visible");
			if (Ext.isObject(menuItemVisibleConfig)) {
				var viewModelPropertyName = menuItemVisibleConfig.bindTo;
				menuItemVisible = this.getViewModelPropertyValue(viewModel, viewModelPropertyName, menuItem);
			} else {
				menuItemVisible = (Ext.isEmpty(menuItemVisibleConfig)
					? this.defaultMenuItemVisibility
					: menuItemVisibleConfig);
			}
			return menuItemVisible;
		},

		/**
		 * Возвращает видимость пункта меню, учитывая контекст.
		 * @private
		 * @param {Object} viewModel Контекст получения видимости пункта меню.
		 * @param {String} propertyName Названия свойства.
		 * @param {Object} menuItem Пункт меню.
		 * @return {Boolean} Видимость пункта меню.
		 */
		getViewModelPropertyValue: function(viewModel, propertyName, menuItem) {
			var propertyValue = this.defaultMenuItemVisibility;
			if (Ext.isFunction(viewModel[propertyName])) {
				propertyValue = viewModel[propertyName](menuItem.get("Id"));
			} else {
				propertyValue = viewModel.get(propertyName);
			}
			return propertyValue;
		}

	});
	return Ext.create(menuUtilitiesClass);
});
