define("SysModuleEntityManagerItem", ["SysModuleEntityManagerItemResources", "object-manager-item",
		"entity-schema-manager"], function() {

	/**
	 * @class Terrasoft.SysModuleEntityManagerItem
	 * Класс элемента менеджера схемы раздела.
	 */

	Ext.define("Terrasoft.SysModuleEntityManagerItem", {
		extend: "Terrasoft.ObjectManagerItem",
		alternateClassName: "Terrasoft.SysModuleEntityManagerItem",

		// region Properties: Private

		/**
		 * Идентификатор колонки типа.
		 * @private
		 * @type {String}
		 */
		typeColumnUId: null,

		/**
		 * Идентификатор entity схемы.
		 * @private
		 * @type {String}
		 */
		entitySchemaUId: null,

		// endregion

		// region Methods: Public

		/**
		 * Метод возвращает значение идентификатора entity схемы.
		 * @return {String} Возвращает значение идентификатора entity схемы.
		 */
		getEntitySchemaUId: function() {
			return this.getPropertyValue("entitySchemaUId");
		},

		/**
		 * Метод устанавливает значение идентификатора entity схемы.
		 * @param {String} value Идентификатора entity схемы.
		 */
		setEntitySchemaUId: function(value) {
			this.setPropertyValue("entitySchemaUId", value);
		},

		/**
		 * Возвращает коллекцию элементов менеджера страниц схем раздела для схемы раздела.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова callback-функции.
		 * @return {Terrasoft.Collection} Коллекцию элементов менеджера страниц схем раздела для схемы раздела.
		 */
		getSysModuleEditManagerItems: function(callback, scope) {
			Terrasoft.chain(
				function(next) {
					Terrasoft.SysModuleEditManager.initialize(null, next, this);
				},
				function() {
					var sysModuleEntityId = this.id;
					var sysModuleEditItems = Terrasoft.SysModuleEditManager.getItems();
					var sysModuleEditManagerItems = sysModuleEditItems.filterByFn(function(item) {
						return (item.getSysModuleEntityId() === sysModuleEntityId);
					});
					callback.call(scope, sysModuleEditManagerItems);
				},
				this
			);
		},

		/**
		 * Метод возвращает значение идентификатора колонки типа.
		 * @return {String} Возвращает значение идентификатора колонки типа.
		 */
		getTypeColumnUId: function() {
			return this.getPropertyValue("typeColumnUId");
		},

		/**
		 * Метод устанавливает значение идентификатора колонки типа.
		 * @param {String} value значение идентификатора колонки типа.
		 */
		setTypeColumnUId: function(value) {
			this.setPropertyValue("typeColumnUId", value);
		}

		// endregion

	});

	return Terrasoft.SysModuleEntityManagerItem;

});