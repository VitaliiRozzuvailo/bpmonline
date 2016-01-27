define("ContextCallUtilities", ["terrasoft"],
	function(Terrasoft) {

		/**
		 * @class Terrasoft.configuration.mixins.ContextCallUtilities
		 * Миксин контекстного звонка.
		 * @type {Terrasoft.BaseObject}
		 */
		Ext.define("Terrasoft.configuration.mixins.ContextCallUtilities", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.ContextCallUtilities",

			//region Methods: Protected

			/**
			 * Возвращает значение номера телефона.
			 * @protected
			 * @param {String} columnName Имя колонки.
			 * @param {String} entityId Идентификатор записи.
			 * @returns {String} Значение номера телефона. Пустое значение, если запись в реестре не обнаружена.
			 */
			getCustomerNumber: function(columnName, entityId) {
				var gridData = this.getGridData();
				var entity = gridData.find(entityId);
				if (!entity) {
					return;
				}
				return entity.get(columnName);
			},

			/**
			 * Обрабатывает нажатие на ссылку на средство связи с типом Телефон.
			 * @protected
			 * @param {String} rowId Идентификатор записи.
			 * @param {String} columnName Имя колонки.
			 * @return {Boolean} Возвращает признак перехода по ссылке.
			 */
			phoneLinkClicked: function(rowId, columnName) {
				if (Ext.isEmpty(columnName)) {
					return false;
				}
				var schemaColumnName = columnName;
				// TODO: #CRM-2249 Ошибка при настройке реестра: если колонка, которая ссылается не на раздел,
				// настроена форматом "Ссылка". Удалить после выполнения
				if (columnName.indexOf("on") !== -1 && columnName.indexOf("LinkClick") !== -1) {
					schemaColumnName = columnName.slice("on".length, columnName.length - "LinkClick".length);
				}
				if (Ext.isEmpty(schemaColumnName)) {
					schemaColumnName = columnName;
				}
				var handled = this.callCustomer({
					entityColumnName: schemaColumnName,
					entitySchemaName: this.entitySchemaName,
					entityId: rowId,
					number: this.getCustomerNumber.bind(this, schemaColumnName)
				});
				return handled;
			},

			/**
			 * Выполняет контекстный звонок.
			 * @protected
			 * @param {Object} config Конфигурация выполнения контекстного звонка.
			 * @param {String} config.entityColumnName Имя колонки схемы, которая инициирует контекстный звонок.
			 * @param {String} config.entitySchemaName Имя схемы, которой принадлежит колонка.
			 * @param {String} config.entityId Идентификатор записи.
			 * @param {String|Function} config.number Номер, на который необходимо выполнить звонок.
			 * @returns {Boolean} Признак успешного выполнения.
			 */
			callCustomer: function(config) {
				var linkColumnUtilities = Terrasoft.LinkColumnUtilities || {};
				var telephonyUtility = linkColumnUtilities.Telephony;
				if (Ext.isEmpty(telephonyUtility)) {
					return false;
				}
				var entityColumnName = config.entityColumnName;
				var entityId = config.entityId;
				var entitySchemaName = config.entitySchemaName;
				var isTelephonyColumn = telephonyUtility.getIsLinkColumn.call(telephonyUtility,
					entitySchemaName, entityColumnName);
				if (!isTelephonyColumn) {
					return false;
				}
				var number = Ext.isFunction(config.number) ? config.number.call(this, entityId) : config.number;
				if (!number) {
					return false;
				}
				this.sandbox.publish("CallCustomer", {
					number: number,
					customerId: entityId,
					entitySchemaName: entitySchemaName
				});
				return true;
			}

			//endregion

		});
	}
);
