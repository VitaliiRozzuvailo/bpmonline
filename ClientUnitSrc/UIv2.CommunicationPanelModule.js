define("CommunicationPanelModule", ["BaseSchemaModuleV2"], function() {
	/**
	 * @class Terrasoft.configuration.CommunicationPanelModule
	 * Класс страницы коммуникационной панели.
	 */
	Ext.define("Terrasoft.configuration.CommunicationPanelModule", {
		alternateClassName: "Terrasoft.CommunicationPanelModule",
		extend: "Terrasoft.BaseSchemaModule",

		/**
		 * Инициализирует название схемы.
		 * @protected
		 * @overridden
		 */
		initSchemaName: function() {
			this.schemaName = "CommunicationPanel";
		},

		/**
		 * Заменяет последний элемент в цепочке состояний, если его идентификатор модуля отличается от текущего.
		 * @protected
		 * @overridden
		 */
		initHistoryState: Ext.emptyFn

	});
	return Terrasoft.CommunicationPanelModule;
});
