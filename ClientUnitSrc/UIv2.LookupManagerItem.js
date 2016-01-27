define("LookupManagerItem", ["SysModuleEntityManager", "object-manager-item"], function() {

	/**
	 * @class Terrasoft.LookupManagerItem
	 * @public
	 * Класс элемента менеджера .
	 */

	Ext.define("Terrasoft.manager.LookupManagerItem", {
		extend: "Terrasoft.ObjectManagerItem",
		alternateClassName: "Terrasoft.LookupManagerItem",

		// region Properties: Private

		/**
		 * Заголовок.
		 * @protected
		 * @type {String}
		 */
		name: null,

		/**
		 * Описание.
		 * @protected
		 * @type {String}
		 */
		description: null,

		/**
		 * Идентификатор схемы детали.
		 * @private
		 * @type {String}
		 */
		sysPageSchemaUId: null,

		/**
		 * Идентификатор entity схемы детали.
		 * @private
		 * @type {String}
		 */
		sysEntitySchemaUId: null,

		/**
		 * Ссылка на SysLookup.
		 * @private
		 * @type {String}
		 */
		sysLookup: null,

		// endregion

		// region Methods: Public

		/**
		 * Метод возвращает значение заголовка элемента.
		 * @return {String} Значение заголовка.
		 */
		getName: function() {
			return this.getPropertyValue("name");
		},

		/**
		 * Метод возвращает значение описания элемента.
		 * @return {String} Значение описания.
		 */
		getDescription: function() {
			return this.getPropertyValue("description");
		},

		/**
		 * Метод возвращает значение идентификатора страницы.
		 * @return {String} Идентификатор страницы.
		 */
		getSysPageSchemaUId: function() {
			return this.getPropertyValue("sysPageSchemaUId");
		},

		/**
		 * Метод возвращает значение идентификатора схемы.
		 * @return {String} Идентификатор схемы.
		 */
		getSysEntitySchemaUId: function() {
			return this.getPropertyValue("sysEntitySchemaUId");
		},

		/**
		 * Метод возвращает значение ссылки на SysLookup.
		 * @return {String} Ссылка на SysLookup.
		 */
		getSysLookup: function() {
			return this.getPropertyValue("sysLookup");
		},

		/**
		 * Метод устанавливает значение для заголовка элемента.
		 * @param {String} name Заголовок.
		 */
		setName: function(name) {
			this.setPropertyValue("name", name);
		},


		/**
		 * Возвращает элемент менеджера схем раздела для установленной entity-схемы справочника.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова callback-функции.
		 * @return {Terrasoft.SysModuleEntityManagerItem} Элемент менеджера схем раздела для установленной
		 * entity-схемы справочника.
		 */
		getSysModuleEntityManagerItems: function(callback, scope) {
			Terrasoft.SysModuleEntityManager.initialize(null, function() {
				Terrasoft.SysModuleEntityManager.findItemsByEntitySchemaUId(this.getSysEntitySchemaUId(), callback, scope);
			}, this);
		}

		// endregion

	});

	return Terrasoft.LookupManagerItem;

});