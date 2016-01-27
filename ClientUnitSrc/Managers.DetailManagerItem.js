define("DetailManagerItem", ["DetailManagerItemResources", "object-manager-item"], function() {

	/**
	 * @class Terrasoft.DetailManagerItem
	 * Класс элемента менеджера деталей.
	 */

	Ext.define("Terrasoft.DetailManagerItem", {
		extend: "Terrasoft.ObjectManagerItem",
		alternateClassName: "Terrasoft.DetailManagerItem",

		// region Properties: Private

		/**
		 * Заголовок.
		 * @private
		 * @type {String}
		 */
		caption: null,

		/**
		 * Идентификатор схемы детали.
		 * @private
		 * @type {String}
		 */
		detailSchemaUId: null,

		/**
		 * Идентификатор entity схемы детали.
		 * @private
		 * @type {String}
		 */
		entitySchemaUId: null,

		/**
		 * Название схемы детали.
		 * @private
		 * @type {String}
		 */
		detailSchemaName: null,

		/**
		 * Название entity схемы детали.
		 * @private
		 * @type {String}
		 */
		entitySchemaName: null,

		// endregion

		// region Methods: Public

		/**
		 * Метод возвращает значение заголовка элемента.
		 * @return {String} Возвращает значение заголовка.
		 */
		getCaption: function() {
			return this.caption;
		},

		/**
		 * Метод возвращает значение UId схемы детали.
		 * @return {String} Возвращает значение UId схемы детали.
		 */
		getDetailSchemaUId: function() {
			return this.getPropertyValue("detailSchemaUId");
		},

		/**
		 * Метод возвращает значение Name схемы детали.
		 * @return {String} Возвращает значение Name схемы детали.
		 */
		getDetailSchemaName: function() {
			return this.detailSchemaName;
		},

		/**
		 * Метод возвращает значение UId entity схемы.
		 * @return {String} Возвращает значение UId entity схемы детали.
		 */
		getEntitySchemaUId: function() {
			return this.getPropertyValue("entitySchemaUId");
		},

		/**
		 * Метод возвращает значение Name entity схемы.
		 * @return {String} Возвращает значение Name entity схемы детали.
		 */
		getEntitySchemaName: function() {
			return this.entitySchemaName;
		},

		/**
		 * Метод устанавливает значение для заголовка элемента.
		 * @param {String} caption Заголовок.
		 */
		setCaption: function(caption) {
			this.setPropertyValue("caption", caption);
		},

		/**
		 * Метод устанавливает идентификатор детали для схемы.
		 * @param {String} schemaUId Заголовок.
		 */
		setDetailSchemaUId: function(schemaUId) {
			this.setPropertyValue("detailSchemaUId", schemaUId);
		},

		/**
		 * Метод устанавливает идентификатор entity схемы детали.
		 * @param {String} schemaUId Заголовок.
		 */
		setEntitySchemaUId: function(schemaUId) {
			this.setPropertyValue("entitySchemaUId", schemaUId);
		},

		/**
		 * Возвращает элемент менеджера схем раздела для установленной entity-схемы детали.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова callback-функции.
		 * @return {Terrasoft.SysModuleEntityManagerItem} Элемент менеджера схем раздела для установленной
		 * entity-схемы детали.
		 */
		getSysModuleEntityManagerItem: function(callback, scope) {
			Terrasoft.SysModuleEntityManager.findItemsByEntitySchemaUId(this.entitySchemaUId,
					function(sysModuleEntityManagerItems) {
				callback.call(scope, sysModuleEntityManagerItems.getByIndex(0));
			}, this);
		}

		// endregion

	});

	return Terrasoft.DetailManagerItem;

});