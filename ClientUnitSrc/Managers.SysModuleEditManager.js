define("SysModuleEditManager", ["object-manager", "SysModuleEditManagerItem"], function() {
	/**
	 * @class Terrasoft.SysModuleEditManager
	 * Класс менеджера страницы схемы раздела.
	 */

	Ext.define("Terrasoft.SysModuleEditManager", {
		extend: "Terrasoft.ObjectManager",
		alternateClassName: "Terrasoft.SysModuleEditManager",
		singleton: true,

		//region Properties: Private

		/**
		 * Название класса элемента менеджера.
		 * @private
		 * {String}
		 */
		itemClassName: "Terrasoft.SysModuleEditManagerItem",

		/**
		 * Название схемы.
		 * @private
		 * {String}
		 */
		entitySchemaName: "SysModuleEdit",

		/**
		 * Объект соответствий свойств колонкам.
		 * @private
		 * @type {Object}
		 */
		propertyColumnNames: {
			sysModuleEntity: "SysModuleEntity",
			cardSchemaUId: "CardSchemaUId",
			typeColumnValue: "TypeColumnValue",
			useModuleDetails: "UseModuleDetails",
			position: "Position",
			helpContextId: "HelpContextId",
			actionKindCaption: "ActionKindCaption",
			actionKindName: "ActionKindName",
			pageCaption: "PageCaption"
		}

		// endregion

	});

	return Terrasoft.SysModuleEditManager;

});