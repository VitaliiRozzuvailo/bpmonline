define("SysModuleEditManagerItem", ["SysModuleEditManagerItemResources", "object-manager-item",
		"client-unit-schema-manager"], function() {

	/**
	 * @class Terrasoft.SysModuleEditManagerItem
	 * Класс элемента менеджера страницы схемы раздела.
	 */

	Ext.define("Terrasoft.SysModuleEditManagerItem", {
		extend: "Terrasoft.ObjectManagerItem",
		alternateClassName: "Terrasoft.SysModuleEditManagerItem",

		// region Properties: Private

		/**
		 * Идентификатор entity схемы раздела.
		 * @private
		 * @type {Object}
		 */
		sysModuleEntity: null,

		/**
		 * Идентификатор схемы страницы.
		 * @private
		 * @type {String}
		 */
		cardSchemaUId: null,

		/**
		 * Значение колонки типа сущности.
		 * @private
		 * @type {String}
		 */
		typeColumnValue: null,

		/**
		 * Признак использования деталей раздела.
		 * @private
		 * @type {Boolean}
		 */
		useModuleDetails: null,

		/**
		 * Позиция страницы.
		 * @private
		 * @type {Number}
		 */
		position: null,

		/**
		 * Идентификатор справки.
		 * @private
		 * @type {String}
		 */
		helpContextId: null,

		/**
		 * Заголовок действия.
		 * @private
		 * @type {String}
		 */
		actionKindCaption: null,

		/**
		 * Название действия.
		 * @private
		 * @type {String}
		 */
		actionKindName: null,

		/**
		 * Заголовок страницы.
		 * @private
		 * @type {String}
		 */
		pageCaption: null,

		// endregion

		// region Methods: Public

		/**
		 * Метод возвращает значение идентификатора entity схемы раздела.
		 * @return {String} Возвращает значение идентификатора entity схемы раздела.
		 */
		getSysModuleEntityId: function() {
			var sysModuleEntity = this.getPropertyValue("sysModuleEntity");
			return sysModuleEntity && sysModuleEntity.value;
		},

		/**
		 * Метод устанавливает значение идентификатора entity схемы раздела.
		 * @param {String} value Идентификатора entity схемы раздела.
		 */
		setSysModuleEntityId: function(value) {
			this.setPropertyValue("sysModuleEntity", {
				value: value,
				displayValue: ""
			});
		},

		/**
		 * Метод возвращает значение идентификатора схемы страницы.
		 * @return {String} Возвращает значение идентификатора схемы страницы.
		 */
		getCardSchemaUId: function() {
			return this.getPropertyValue("cardSchemaUId");
		},

		/**
		 * Метод устанавливает значение идентификатора схемы страницы.
		 * @param {String} value Идентификатора схемы страницы.
		 */
		setCardSchemaUId: function(value) {
			this.setPropertyValue("cardSchemaUId", value);
		},

		/**
		 * Метод возвращает значение колонки типа сущности.
		 * @return {String} Возвращает значение колонки типа сущности.
		 */
		getTypeColumnValue: function() {
			return this.getPropertyValue("typeColumnValue");
		},

		/**
		 * Метод устанавливает значение колонки типа сущности.
		 * @param {String} value Значение колонки типа сущности.
		 */
		setTypeColumnValue: function(value) {
			this.setPropertyValue("typeColumnValue", value);
		},

		/**
		 * Метод возвращает признак использования деталей раздела.
		 * @return {String} Возвращает признак использования деталей раздела.
		 */
		getUseModuleDetails: function() {
			return this.getPropertyValue("useModuleDetails");
		},

		/**
		 * Метод устанавливает признак использования деталей раздела.
		 * @param {String} value Признак использования деталей раздела.
		 */
		setUseModuleDetails: function(value) {
			this.setPropertyValue("useModuleDetails", value);
		},

		/**
		 * Метод возвращает позицию страницы.
		 * @return {String} Возвращает позицию страницы.
		 */
		getPosition: function() {
			return this.getPropertyValue("position");
		},

		/**
		 * Метод устанавливает позицию страницы.
		 * @param {String} value Позиция страницы.
		 */
		setPosition: function(value) {
			this.setPropertyValue("position", value);
		},

		/**
		 * Метод возвращает идентификатор справки.
		 * @return {String} Возвращает идентификатор справки.
		 */
		getНelpContextId: function() {
			return this.getPropertyValue("helpContextId");
		},

		/**
		 * Метод устанавливает идентификатор справки.
		 * @param {String} value Идентификатор справки.
		 */
		setHelpContextId: function(value) {
			this.setPropertyValue("helpContextId", value);
		},

		/**
		 * Метод возвращает заголовок действия.
		 * @return {String} Возвращает заголовок действия.
		 */
		getActionKindCaption: function() {
			return this.getPropertyValue("actionKindCaption");
		},

		/**
		 * Метод устанавливает заголовок действия.
		 * @param {String} value Заголовок действия.
		 */
		setActionKindCaption: function(value) {
			this.setPropertyValue("actionKindCaption", value);
		},

		/**
		 * Метод возвращает название действия.
		 * @return {String} Возвращает название действия.
		 */
		getActionKindName: function() {
			return this.getPropertyValue("actionKindName");
		},

		/**
		 * Метод устанавливает название действия.
		 * @param {String} value Название действия.
		 */
		setActionKindName: function(value) {
			this.setPropertyValue("actionKindName", value);
		},

		/**
		 * Метод возвращает заголовок страницы.
		 * @return {String} Возвращает заголовок страницы.
		 */
		getPageCaption: function() {
			return this.getPropertyValue("pageCaption");
		},

		/**
		 * Метод устанавливает заголовок страницы.
		 * @param {String} value Заголовок страницы.
		 */
		setPageCaption: function(value) {
			this.setPropertyValue("pageCaption", value);
		}

		// endregion

	});

	return Terrasoft.SysModuleEditManagerItem;

});