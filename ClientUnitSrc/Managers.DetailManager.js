define("DetailManager", ["object-manager", "DetailManagerItem"], function() {
	/**
	 * @class Terrasoft.DetailManager
	 * Класс менеджера деталей.
	 */

	Ext.define("Terrasoft.DetailManager", {
		extend: "Terrasoft.ObjectManager",
		alternateClassName: "Terrasoft.DetailManager",
		singleton: true,

		//region Properties: Private

		/**
		 * Убирать или нет дубли в результирующем наборе данных.
		 * @type {Boolean}
		 */
		isDistinct: true,

		/**
		 * Название класса элемента менеджера.
		 * @private
		 * {String}
		 */
		itemClassName: "Terrasoft.DetailManagerItem",

		/**
		 * Название схемы.
		 * @private
		 * {String}
		 */
		entitySchemaName: "SysDetail",

		/**
		 * Объект соответствий свойств колонкам.
		 * @private
		 * @type {Object}
		 */
		propertyColumnNames: {
			caption: "Caption",
			detailSchemaUId: "DetailSchemaUId",
			entitySchemaUId: "EntitySchemaUId",
			detailSchemaName: "[SysSchema:UId:DetailSchemaUId].Name",
			entitySchemaName: "[SysSchema:UId:EntitySchemaUId].Name"
		}

		// endregion

	});
	return Terrasoft.DetailManager;
});