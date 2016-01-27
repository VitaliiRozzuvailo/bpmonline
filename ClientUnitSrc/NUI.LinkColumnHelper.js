define("LinkColumnHelper", [], function() {

		/**
		 * Проверяет является ли колонка ссылкой.
		 * @param {String} entitySchemaName Имя схемы.
		 * @param {String} columnName Имя колонки.
		 * @returns {boolean} Признак, является ли колонка ссылкой.
		 */
		var getIsLinkColumn = function(entitySchemaName, columnName) {
			for (var linkColumnUtility in Terrasoft.LinkColumnUtilities) {
				var columnUtility = Terrasoft.LinkColumnUtilities[linkColumnUtility];
				if (!Ext.isObject(columnUtility)) {
					continue;
				}
				if (!Ext.isFunction(columnUtility.getIsLinkColumn)) {
					continue;
				}
				if (columnUtility.getIsLinkColumn.call(columnUtility, entitySchemaName, columnName)) {
					return true;
				}
			}
			return false;
		};

		/**
		 * Создает URL ссылку.
		 * @param {String} entitySchemaName Имя схемы.
		 * @param {String} columnPath Имя колонки.
		 * @param {String} displayValue Отображаемое значение колонки.
		 * @param {String} recordId Id записи.
		 * @returns {Object} URL ссылку.
		 */
		var createLink = function(entitySchemaName, columnPath, displayValue, recordId) {
			for (var linkColumnUtility in Terrasoft.LinkColumnUtilities) {
				var columnUtility = Terrasoft.LinkColumnUtilities[linkColumnUtility];
				if (!Ext.isObject(columnUtility)) {
					continue;
				}
				if ((!Ext.isFunction(columnUtility.getIsLinkColumn)) || (!Ext.isFunction(columnUtility.createLink))) {
					continue;
				}
				if (!columnUtility.getIsLinkColumn.call(columnUtility, entitySchemaName, columnPath)) {
					continue;
				}
				return columnUtility.createLink.call(columnUtility, entitySchemaName,
					columnPath, displayValue, recordId);
			}
			return null;
		};

		return {
			getIsLinkColumn: getIsLinkColumn,
			createLink: createLink
		};
	}
);