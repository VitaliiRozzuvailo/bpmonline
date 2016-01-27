define("SectionModuleV2", ["BaseSchemaModuleV2"], function() {
	/**
	 * @class Terrasoft.configuration.SectionModule
	 * Класс SectionModule предназначен для создания экземпляра раздела
	 */
	Ext.define("Terrasoft.configuration.SectionModule", {
		alternateClassName: "Terrasoft.SectionModule",
		extend: "Terrasoft.BaseSchemaModule",

		/**
		 * Флаг, указывающий на то, что раздел на странице один.
		 * Если значение false, то на странице присутствует CardModule
		 * @protected
		 * @type {Boolean}
		 */
		isSeparateMode: true,

		/**
		 * Получает ключ профиля в разделе
		 * @return {String} Возращает ключ профиля  в разделе
		 */
		getProfileKey: function() {
			var parentKey = this.callParent(arguments);
			return parentKey + "GridSettingsGridDataView";
		},

		/**
		 * Подготавливает новое состояние страницы
		 * @protected
		 * @overridden
		 * @return {Object} Возвращает новое состояние страницы
		 */
		prepareHistorySate: function() {
			var newState = this.callParent(arguments);
			delete newState.isSeparateMode;
			delete newState.schemaName;
			delete newState.entitySchemaName;
			delete newState.operation;
			delete newState.primaryColumnValue;
			delete newState.isInChain;
			return newState;
		},

		/**
		 * Возвращает объект настроек модели представления.
		 * @return {Object} Возвращает объект настроек модели представления.
		 */
		getViewModelConfig: function() {
			var viewModelConfig = this.callParent(arguments);
			Ext.apply(viewModelConfig, {
				values: {
					IsSeparateMode: this.isSeparateMode
				}
			});
			return viewModelConfig;
		}

	});
	return Terrasoft.SectionModule;
});
