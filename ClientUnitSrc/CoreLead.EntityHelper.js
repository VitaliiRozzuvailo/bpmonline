define("EntityHelper", function() {
	var entityHelperClass = Ext.define("Terrasoft.configuration.mixins.EntityHelper", {

		alternateClassName: "Terrasoft.EntityHelper",

		/**
		 * Выполняет чтение колонок из объекта по идентификатору
		 * с передачей считанного объекта в функцию обратного вызова.
		 * @param {String} schemaName Имя схемы.
		 * @param {String} recordId Уникальный идентификатор.
		 * @param {Array} columns Перечень названий колонок для считывания.
		 * @param {Function} callback Функция обратного вызова.
		 */
		readEntity: function(schemaName, recordId, columns, callback) {
			if (recordId === Terrasoft.GUID_EMPTY) {
				if (callback) {
					callback.call(this);
				}
				return;
			}
			var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: schemaName
			});
			Terrasoft.each(columns, function(columnName) {
				esq.addColumn(columnName);
			});
			esq.getEntity(recordId, function(result) {
				if (callback) {
					callback.call(this, result.entity);
				}
			}, this);
		},

		/**
		 * Выполняет обновление значений колонок объекта.
		 * @param {Array} columns Перечень названий колонок для считывания.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Terrasoft.BaseModel} model Экземпляр модели.
		 */
		refreshColumns: function(columns, callback, model) {
			if (!model) {
				model = this;
			}
			var primaryColumnValue = this.getPrimaryColumnValue();
			var entitySchemaName = this.entitySchemaName;
			this.readEntity(entitySchemaName, primaryColumnValue, columns, function(entity) {
				model.loadFromColumnValues(entity.values);
				if (callback) {
					callback.call(this, entity);
				}
			});
		}

	});
	return entityHelperClass;
});
