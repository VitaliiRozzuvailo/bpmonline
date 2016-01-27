define("RightUtilities", ["ext-base", "terrasoft", "StorageUtilities"],
	function(Ext, Terrasoft, StorageUtilities) {

	/**
	 * Функция обратного вызова проверки права текущего пользователя на операции.
	 * @callback Terrasoft.RightUtilities~onCheckCanExecuteOperations
	 * @param {Object} requestResult Результат проверки доступа на операции. Ключ объекта - название операции,
	 * значение - доступна ли операция текущему пользователю.
	 */

	/** @enum
	 *  Уровни доступа на схему */
	var SchemaOperationRightLevels = {
		/** Нет доступа */
		None: 0,
		/** Доступен для чтение */
		CanRead: 1,
		/** Доступен для добавление */
		CanAppend: 2,
		/** Доступен для изменение */
		CanEdit: 4,
		/** Доступен для удаление */
		CanDelete: 8
	};

	/** @enum
	 *  Уровни дуступа на запись */
	var RecordOperationRightLevels = {
		/** Нет доступа */
		None: 0,
		/** Доступна для чтение */
		CanRead: 1,
		/** Доступна для чтение с правом делегирование */
		CanChangeReadRight: 1 + 2,
		/** Доступна для изменение */
		CanEdit: 4,
		/** Доступна для изменение с правом делегирование */
		CanChangeEditRight: 4 + 8,
		/** Доступна для удаление */
		CanDelete: 16,
		/** Доступна для удаление с правом делегирование */
		CanChangeDeleteRight: 16 + 32
	};

	var definedClass = Ext.ClassManager.get("Terrasoft.RightUtilities");
	if (definedClass) {
		return Ext.create(definedClass);
	}

	Ext.define("Terrasoft.configuration.mixins.RightUtilitiesMixin", {
		alternateClassName: "Terrasoft.RightUtilitiesMixin",

		/**
		 * Проверяет есть ли доступ на чтение из таблицы, для переданного уровня доступа.
		 * @param {Number} value Уровеню доступа.
		 * @returns {boolean} Возвращает true если есть доступ на операцию,
		 * false - в противном случае.
		 */
		isSchemaCanReadRightConverter: function(value) {
			return ((SchemaOperationRightLevels.CanRead & value) === SchemaOperationRightLevels.CanRead);
		},

		/**
		 * Проверяет есть ли доступ на добавление в таблицу, для переданного уровня доступа.
		 * @param {Number} value Уровеню доступа.
		 * @returns {boolean} Возвращает true если есть доступ на операцию,
		 * false - в противном случае.
		 */
		isSchemaCanAppendRightConverter: function(value) {
			return ((SchemaOperationRightLevels.CanAppend & value) === SchemaOperationRightLevels.CanAppend);
		},

		/**
		 * Проверяет есть ли доступ на зменение записи в таблице, для переданного уровня доступа.
		 * @param {Number} value Уровеню доступа.
		 * @returns {boolean} Возвращает true если есть доступ на операцию,
		 * false - в противном случае.
		 */
		isSchemaCanEditRightConverter: function(value) {
			return ((SchemaOperationRightLevels.CanEdit & value) === SchemaOperationRightLevels.CanEdit);
		},

		/**
		 * Проверяет есть ли доступ на удаление записи в таблице, для переданного уровня доступа.
		 * @param {Number} value Уровеню доступа.
		 * @returns {boolean} Возвращает true если есть доступ на операцию,
		 * false - в противном случае.
		 */
		isSchemaCanDeleteRightConverter: function(value) {
			return ((SchemaOperationRightLevels.CanDelete & value) === SchemaOperationRightLevels.CanDelete);
		},

		/**
		 * Проверяет есть ли доступ на чтение записи, для переданного уровня доступа.
		 * @param {Number} value Уровеню доступа.
		 * @returns {boolean} Возвращает true если есть доступ на операцию,
		 * false - в противном случае.
		 */
		isSchemaRecordCanReadRightConverter: function(value) {
			return ((RecordOperationRightLevels.CanRead & value) === RecordOperationRightLevels.CanRead);
		},

		/**
		 * Проверяет есть ли доступ на изменения прав на чтение записи, для переданного уровня доступа.
		 * @param {Number} value Уровеню доступа.
		 * @returns {boolean} Возвращает true если есть доступ на операцию,
		 * false - в противном случае.
		 */
		isSchemaRecordCanChangeReadRightConverter: function(value) {
			return ((RecordOperationRightLevels.CanChangeReadRight & value) ===
				RecordOperationRightLevels.CanChangeReadRight);
		},

		/**
		 * Проверяет есть ли доступ на изменение записи, для переданного уровня доступа.
		 * @param {Number} value Уровеню доступа.
		 * @returns {boolean} Возвращает true если есть доступ на операцию,
		 * false - в противном случае.
		 */
		isSchemaRecordCanEditRightConverter: function(value) {
			return ((RecordOperationRightLevels.CanEdit & value) === RecordOperationRightLevels.CanEdit);
		},

		/**
		 * Проверяет есть ли доступ на изменения прав на изменение записи, для переданного уровня доступа.
		 * @param {Number} value Уровеню доступа.
		 * @returns {boolean} Возвращает true если есть доступ на операцию,
		 * false - в противном случае.
		 */
		isSchemaRecordCanChangeEditRightConverter: function(value) {
			return ((RecordOperationRightLevels.CanChangeEditRight & value) ===
				RecordOperationRightLevels.CanChangeEditRight);
		},

		/**
		 * Проверяет есть ли доступ на удаление записи, для переданного уровня доступа.
		 * @param {Number} value Уровеню доступа.
		 * @returns {boolean} Возвращает true если есть доступ на операцию,
		 * false - в противном случае.
		 */
		isSchemaRecordCanDeleteRightConverter: function(value) {
			return ((RecordOperationRightLevels.CanDelete & value) === RecordOperationRightLevels.CanDelete);
		},

		/**
		 * Проверяет есть ли доступ на изменения прав на удаление записи, для переданного уровня доступа.
		 * @param {Number} value Уровеню доступа.
		 * @returns {boolean} Возвращает true если есть доступ на операцию,
		 * false - в противном случае.
		 */
		isSchemaRecordCanChangeDeleteRightConverter: function(value) {
			return ((RecordOperationRightLevels.CanChangeDeleteRight & value) ===
				RecordOperationRightLevels.CanChangeDeleteRight);
		}
	});

	/**
	 * @class Terrasoft.configuration.BaseSchemaViewModel
	 * Конфигурационный базовый класс модели представления
	 */
	var rightUtilitiesClass = Ext.define("Terrasoft.configuration.RightUtilities", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.RightUtilities",

		mixins: {
			rightsUtilities: "Terrasoft.RightUtilitiesMixin"
		},

		/**
		 * Имя сервиса работы с правами.
		 * @protected
		 * @type {String}
		 */
		serviceName: "RightsService",

		/**
		 * Название операций.
		 * @type {Object}
		 */
		SysAdminOperationCode: {
			CAN_DESIGN_PAGE: "CanChangeApplicationTuningMode"
		},

		/**
		 * Метод вызывает метод веб сервиса с указанными параметрами.
		 * @param {String} methodName Имя метода веб сервиса.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		callServiceMethod: function(methodName, data, callback, scope) {
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/" + this.serviceName + "/" + methodName;
			Terrasoft.AjaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data || {},
				callback: function(request, success, response) {
					var responseObject = success ? Terrasoft.decode(response.responseText) : {};
					callback.call(scope || this, responseObject);
				},
				scope: this
			});
		},

		/**
		 * Метод вызывает метод веб сервиса с указанными параметрами.
		 * Обрабатывает возвращающее значерние, подготавливая к использованию.
		 * @param {String} methodName Имя метода веб сервиса.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		callRightServiceMethod: function(methodName, data, callback, scope) {
			this.callServiceMethod(methodName, data, function(responseObject) {
				if (!this.isDestroyed) {
					callback.call(scope || this, responseObject[methodName + "Result"]);
				}
			}, this);
		},

		/**
		 * Проверяет права текущего пользователя на конкретную операцию.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		checkCanExecuteOperation: function(data, callback, scope) {
			var storageKey = "GetCanExecuteOperation!" + data.operation;
			var requestFunction = function(innerCallback) {
				this.callRightServiceMethod("GetCanExecuteOperation", data, innerCallback, this);
			};
			StorageUtilities.workRequestWithStorage(storageKey, requestFunction, function() {
				callback.apply(scope, arguments);
			}, this);
		},

		/**
		 * Проверяет права текущего пользователя на операции. Возвращает объект доступа на каждую операцию.
		 * @param {String[]} operations Список операций.
		 * @param {RightUtilities~onCheckCanExecuteOperations} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		checkCanExecuteOperations: function(operations, callback, scope) {
			var operationsToRequest = [];
			var requestResult = {};
			Terrasoft.each(operations, function(operation) {
				var storageKey = "GetCanExecuteOperation!" + operation;
				var storageItem = StorageUtilities.getItem(storageKey);
				if (Ext.isEmpty(storageItem)) {
					operationsToRequest.push(operation);
				} else {
					requestResult[operation] = storageItem[0];
				}
			}, this);
			var data = Ext.encode({operations: operationsToRequest});
			this.callRightServiceMethod("GetCanExecuteOperations", data, function(result) {
				Terrasoft.each(result, function(operationPermition) {
					var operationPermitionKey = operationPermition.Key;
					var operationPermitionValue = operationPermition.Value;
					var storageKey = "GetCanExecuteOperation!" + operationPermitionKey;
					StorageUtilities.setItem([operationPermitionValue], storageKey);
					requestResult[operationPermitionKey] = operationPermitionValue;
				}, this);
				if (callback) {
					callback.call(scope, requestResult)
				}
			}, this);
		},

		/**
		 * Запрашивает информацию про права на операции для объета.
		 * @param {String} schemaName Имя объекта.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		getSchemaOperationRightLevel: function(schemaName, callback, scope) {
			this.callRightServiceMethod("GetSchemaOperationRightLevel", {
				"schemaName": schemaName
			}, callback, scope);
		},

		/**
		 * Запрашивает информацию про права на операции для записи.
		 * @param {String} schemaName Имя объекта.
		 * @param {String} primaryColumnValue Уникальный идентификатор записи.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		getSchemaRecordRightLevel: function(schemaName, primaryColumnValue, callback, scope) {
			this.callRightServiceMethod("GetSchemaRecordRightLevel", {
				"schemaName": schemaName,
				"primaryColumnValue": primaryColumnValue
			}, callback, scope);
		},

		/**
		 * Запрашивает информацию про права на операцию удаления в объекте.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		checkCanDelete: function(data, callback, scope) {
			this.callRightServiceMethod("GetCanDelete", data, callback, scope);
		},

		/**
		 * Запрашивает информацию про права на операцию изменения для записи.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		checkCanEditRecords: function(data, callback, scope) {
			this.callRightServiceMethod("GetCanEditRecords", data, callback, scope);
		},

		/**
		 * Запрашивает информацию про права на операцию чтения для записи.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		checkCanReadRecords: function(data, callback, scope) {
			this.callRightServiceMethod("GetCanReadRecords", data, callback, scope);
		},

		/**
		 * Запрашивает информацию про права на операцию удаления для записей.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		checkMultiCanDelete: function(data, callback, scope) {
			this.callRightServiceMethod("GetCanDeleteRecords", data, callback, scope);
		},

		/**
		 * Запрашивает информацию про права на операцию изменения в объекте.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		checkCanEdit: function(data, callback, scope) {
			this.callRightServiceMethod("GetCanEdit", data, callback, scope);
		},

		/**
		 * Запрашивает информацию про все права на запись.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		getRecordRights: function(data, callback, scope) {
			this.callRightServiceMethod("GetRecordRights", data, callback, scope);
		},

		/**
		 * Запрашивает информацию про все права на запись для конкретоного пользователя.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		getUserRecordRights: function(data, callback, scope) {
			this.callRightServiceMethod("GetUserRecordRights", data, callback, scope);
		},

		/**
		 * Запрашивает информацию про запрещающие права на запись для конкретоного пользователя.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		getUseDenyRecordRights: function(data, callback, scope) {
			this.callRightServiceMethod("GetUseDenyRecordRights", data, callback, scope);
		},

		/**
		 * Запрашивает информацию про права на операцию удаления в объекте.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		getSchemaDeleteRights: function(data, callback, scope) {
			this.callRightServiceMethod("GetSchemaDeleteRights", data, callback, scope);
		},

		/**
		 * Запрашивает информацию про права на операцию изменения в объекте.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		getSchemaEditRights: function(data, callback, scope) {
			this.callRightServiceMethod("GetSchemaEditRights", data, callback, scope);
		},

		/**
		 * Запрашивает информацию про права на операцию чтения в объекте.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		getSchemaReadRights: function(data, callback, scope) {
			this.callRightServiceMethod("GetSchemaReadRights", data, callback, scope);
		},

		/**
		 * Применяет объект изменения прав для конкретоной записи.
		 * @param {Object} data Обьект данных для метода веб сервиса.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Объект окружения фукнции обратного вызова.
		 */
		applyChanges: function(data, callback, scope) {
			this.callRightServiceMethod("ApplyChanges", data, callback, scope);
		}
	});

	return Ext.create(rightUtilitiesClass);

});
