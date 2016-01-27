define("DashboardManager", ["object-manager", "DashboardManagerItem"], function() {

	/**
	 * @class Terrasoft.DashboardManager
	 * @public
	 * Класс менеджера итогов.
	 */
	Ext.define("Terrasoft.DashboardManager", {
		extend: "Terrasoft.ObjectManager",
		alternateClassName: "Terrasoft.DashboardManager",
		singleton: true,

		//region Properties: Private

		/**
		 * Название класса элемента менеджера.
		 * @private
		 * {String}
		 */
		itemClassName: "Terrasoft.DashboardManagerItem",

		/**
		 * Название схемы.
		 * @private
		 * {String}
		 */
		entitySchemaName: "SysDashboard",


		/**
		 * Объект соответствий свойств колонкам.
		 * @public
		 * @type {Object}
		 */
		propertyColumnNames: {
			id: "Id",
			caption: "Caption",
			position: "Position",
			viewConfig: "ViewConfig",
			items: "Items",
			sectionId: "Section"
		},

		// endregion

		//region Methods: Public

		/**
		 * Создает экземпляр итога.
		 * @param {Object} config Конфигурация создаваемого итога:
		 * @param {Terrasoft.DataManagerItem} config.dataManagerItem Данные для созданного итога. Если указан - итог будет
		 * создан на основании этих данных.
		 * @param {Object} config.propertyValues Если не указа dataManagerItem, используется для инициализации итога.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст функции обратного вызова.
		 * @returns {Terrasoft.DashboardManagerItem} созданный экземпляр итога.
		 */
		createItem: function(config, callback, scope) {
			scope = scope || this;
			if (config && config.dataManagerItem) {
				var dashboardManagerItem = this.createManagerItem(config);
				callback.call(scope, dashboardManagerItem);
			} else {
				var createConfig = {
					entitySchemaName: this.entitySchemaName
				};
				if (config && config.sectionId) {
					Ext.apply(createConfig, {
						columnValues: { Section: { value: config.sectionId } }
					});
				}
				var createCallback = function(dataManagerItem) {
					var dashboardManagerItem = this.createManagerItem({ dataManagerItem: dataManagerItem });
					var propertyValues = config && config.propertyValues;
					Terrasoft.each(propertyValues, function(propertyValue, propertyName) {
						dashboardManagerItem.setPropertyValue(propertyName, propertyValue);
					}, this);
					callback.call(scope, dashboardManagerItem);
				};
				Terrasoft.DataManager.createItem(createConfig, createCallback, this);
			}
		}

		//endregion

	});
	return Terrasoft.DashboardManager;
});