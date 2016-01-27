define("SysModuleEntityManager", ["object-manager", "SysModuleEntityManagerItem"], function() {
	/**
	 * @class Terrasoft.SysModuleEntityManager
	 * Класс менеджера схемы раздела.
	 */

	Ext.define("Terrasoft.SysModuleEntityManager", {
		extend: "Terrasoft.ObjectManager",
		alternateClassName: "Terrasoft.SysModuleEntityManager",
		singleton: true,

		//region Properties: Private

		/**
		 * Название класса элемента менеджера.
		 * @private
		 * {String}
		 */
		itemClassName: "Terrasoft.SysModuleEntityManagerItem",

		/**
		 * Название схемы.
		 * @private
		 * {String}
		 */
		entitySchemaName: "SysModuleEntity",

		/**
		 * Объект соответствий свойств колонкам.
		 * @private
		 * @type {Object}
		 */
		propertyColumnNames: {
			entitySchemaUId: "SysEntitySchemaUId",
			typeColumnUId: "TypeColumnUId"
		},

		// endregion

		// region Methods: Public

		/**
		 * Возвращает коллекцию элементов менеджера схем раздела для entity-схемы.
		 * @param {String} entitySchemaUId entity-схемы.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова callback-функции.
		 * @return {Terrasoft.SysModuleEntityManagerItem} Коллекцию элементов менеджера схем раздела
		 * entity-схемы детали.
		 */
		findItemsByEntitySchemaUId: function(entitySchemaUId, callback, scope) {
			Terrasoft.chain(
				function(next) {
					this.initialize(null, next, this);
				},
				function() {
					var filteredItems = this.items.filterByFn(function(item) {
						return (item.getEntitySchemaUId() === entitySchemaUId);
					});
					callback.call(scope, filteredItems);
				},
				this
			);
		}

		// endregion

	});

	return Terrasoft.SysModuleEntityManager;

});