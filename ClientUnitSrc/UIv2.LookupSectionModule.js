define("LookupSectionModule", ["SectionModuleV2"], function() {
	/**
	 * @class Terrasoft.configuration.LookupSectionModule
	 * Класс SectionModule предназначен для создания экземпляра раздела справочника.
	 */
	Ext.define("Terrasoft.configuration.LookupSectionModule", {
		alternateClassName: "Terrasoft.LookupSectionModule",
		extend: "Terrasoft.SectionModule",

		/**
		 * Получает ключ профиля в разделе.
		 * @overridden
		 * @return {String} Возращает ключ профиля  в разделе.
		 */
		getProfileKey: function() {
			return this.schemaName + this.entitySchemaName + "GridSettingsGridDataView";
		},

		/**
		 * Сохраняет название схемы, указанной в состоянии.
		 * @overridden
		 */
		initHistoryState: function() {
			var sandbox = this.sandbox;
			var state = sandbox.publish("GetHistoryState");
			var currentState = state.state || {};
			this.entitySchemaName = currentState.entitySchemaName;
			this.callParent(arguments);
		},

		/**
		 * Подготавливает новое состояние страницы.
		 * @protected
		 * @overridden
		 * @return {Object} Новое состояние страницы.
		 */
		prepareHistorySate: function() {
			var newState = this.callParent(arguments);
			newState.entitySchemaName = this.entitySchemaName;
			return newState;
		}

	});
	return Terrasoft.LookupSectionModule;
});
