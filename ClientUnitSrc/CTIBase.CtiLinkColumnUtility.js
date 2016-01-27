define("CtiLinkColumnUtility", [], function() {

		/**
		 * Проверят наличие соединения с сервреом телефонии.
		 * @returns {Boolean} Признак наличия соединения с сервером телефонии.
		 */
		function getIsConnected() {
			return Terrasoft.CtiModel && Terrasoft.CtiModel.get("IsConnected");
		}

		/**
		 *  @class Terrasoft.configuration.CtiLinkColumnUtility.
		 *  Класс для работы с колонками типа "ссылка".
		 */
		Ext.define("Terrasoft.configuration.CtiLinkColumnUtility", {
			alternateClassName: "Terrasoft.CtiLinkColumnUtility",

			/**
			 * Список колонок по разделам.
			 */
			linkColumns: {
				Contact: ["Phone", "MobilePhone", "HomePhone"],
				Account: ["Phone", "AdditionalPhone"]
			},

			/**
			 * Проверяет является ли колонка ссылкой.
			 * @param {String} entitySchemaName Имя схемы.
			 * @param {String} columnPath Имя колонки.
			 * @returns {boolean} Признак, является ли колонка ссылкой.
			 */
			getIsLinkColumn: function(entitySchemaName, columnPath) {
				if (!getIsConnected()) {
					return false;
				}
				if (Ext.isEmpty(this.linkColumns[entitySchemaName])) {
					return false;
				}
				return this.linkColumns[entitySchemaName].indexOf(columnPath) >= 0;
			},

			/**
			 * Создает URL ссылку.
			 * @param {String} entitySchemaName Имя схемы.
			 * @param {String} columnPath Имя колонки.
			 * @param {String} displayValue Отображаемое значение колонки.
			 * @param {String} recordId Id записи.
			 * @returns {Object} URL ссылку.
			 */
			createLink: function(entitySchemaName, columnPath, displayValue, recordId) {
				if (!this.getIsLinkColumn.call(this, entitySchemaName, columnPath)) {
					return null;
				}
				var link = Ext.String.format("callTo: {0}/{1}/{2}", entitySchemaName,
					recordId, displayValue);
				return {
					caption: displayValue,
					target: "_self",
					title: displayValue,
					url: link
				};
			}
		});

		return Terrasoft.CtiLinkColumnUtility;
	}
);