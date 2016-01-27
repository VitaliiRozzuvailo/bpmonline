define("ContactCareerPageInContactV2", [], function() {
	return {
		entitySchemaName: "ContactCareer",
		attributes: {
			"JobTitle": {
				name: "JobTitle",
				dataValueType: Terrasoft.DataValueType.TEXT,
				dependencies: [
					{
						columns: ["Job"],
						methodName: "onJobChange"
					}
				]
			},
			"DueDate": {
				name: "DueDate",
				dataValueType: Terrasoft.DataValueType.DATE,
				dependencies: [
					{
						columns: ["Current"],
						methodName: "onCurrentChange"
					}
				]
			}
		},
		methods: {

			/**
			 * Устанавливает значения по умолчанию
			 * @protected
			 * @overridden
			 */
			getDefaultValues: function() {
				var defValues = this.callParent(arguments);
				defValues.push({
					name: "Current",
					value: true
				},
				{
					name: "Primary",
					value: true
				});
				return defValues;
			},

			/**
			 * Устанавливает значение поля "Полное название должности" при изменении значения поля "Должность"
			 * @protected
			 * @virtual
			 */
			onJobChange: function() {
				var job = this.get("Job");
				if (!Ext.isEmpty(job)) {
					this.set("JobTitle", job.displayValue);
				}
			},

			/**
			 * Устанавливает значение поля "Завершение" при изменении значения поля "Текущее"
			 * @protected
			 * @virtual
			 */
			onCurrentChange: function() {
				var dueDate = this.get("Current") ? null : new Date();
				this.set("DueDate", dueDate);
			},

			/**
			 * Валидирует значения модели представления.
			 * Если присутствуют некорректные значения, выводит сообщение о необходимости заполнения первого.
			 * Иначе вызывается callback-функция.
			 * @protected
			 * @overridden
			 * @param {Function} callback callback-функция
			 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции
			 */
			asyncValidate: function(callback, scope) {
				this.callParent([function(result) {
					if (!result.success) {
						callback.call(scope, result);
						return;
					}
					var startDate = this.get("StartDate");
					var dueDate = this.get("DueDate");
					if (dueDate !== null) {
						if (startDate > dueDate) {
							this.showInformationDialog(this.get("Resources.Strings.WarningWrongDate"));
							this.hideBodyMask();
							return;
						}
					}
					var current = this.get("Current");
					var primary = this.get("Primary");
					if (current && primary) {
						var contactId = this.get("Contact").value;
						this.getContactCareerCollection(contactId, callback, scope, result);
					} else {
						callback.call(scope, result);
					}
				}, this]);
			},

			/**
			 * Строит запрос к БД, проверяет есть ли у данного контакта должность
			 * с признаками "Текущая", "Основная" кроме данной
			 * @protected
			 * @virtual
			 * @param {String} contactId идентификатор контакта
			 * @param {Function} callback callback-функция
			 * @param {Object} scope Контекст выполнения функции callback
			 * @param {Object} result Ответ сервера
			 */
			getContactCareerCollection: function(contactId, callback, scope, result) {
				var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "ContactCareer"});
				select.addColumn("Id");
				select.addColumn("Contact");
				select.addColumn("Account");
				select.addColumn("Job");
				select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.NOT_EQUAL,
					"Id", this.get("Id")));
				select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
					"Contact", contactId));
				select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
					"Current", true));
				select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
					"Primary", true));
				select.getEntityCollection(function(response) {
					this.onGetSelectResult(response, callback, scope, result);
				}, this);
			},

			/**
			 * Получает выборку в результате запроса к БД,
			 * вызывает окно сообщений для того, чтобы спросить пользователя
			 * является ли найденная работа с атрибутом "Текущая" актуальной
			 * @protected
			 * @virtual
			 * @param {Object} response выборка полученная в результате запроса
			 * @param {Function} callback callback-функция
			 * @param {Object} scope Контекст выполнения функции callback
			 * @param {Object} result Ответ сервера
			 */
			onGetSelectResult: function(response, callback, scope, result) {
				var entityCollection = response.collection;
				var buttonsConfig = {
					buttons: [
						this.Terrasoft.MessageBoxButtons.YES.returnCode,
						this.Terrasoft.MessageBoxButtons.NO.returnCode
					],
					defaultButton: 0
				};
				if (entityCollection.getCount() > 0) {
					var message = this.get("Resources.Strings.ChangeContactJob");
					var oldContact = entityCollection.getItems()[0].get("Contact").displayValue;
					var oldAccount =  entityCollection.getItems()[0].get("Account").displayValue;
					var oldJob = entityCollection.getItems()[0].get("Job");
					var oldJobTitle = "";
					if (oldJob) {
						oldJobTitle = oldJob.displayValue;
					}
					this.showInformationDialog(Ext.String.format(message, oldContact, oldAccount, oldJobTitle),
							function(returnCode) {
								this.getSelectedButton(returnCode, callback, scope, result, entityCollection);
							}, buttonsConfig);
				} else {
					callback.call(scope, result);
				}
			},

			/**
			 * Получает ответ пользователя на вопрос в окне сообщений
			 * @protected
			 * @virtual
			 * @param {String} returnCode ответ пользователя на вопрос из окна сообщений
			 * @param {Function} callback callback-функция
			 * @param {Object} scope Контекст выполнения функции callback
			 * @param {Object} result Ответ сервера
			 * @param {Object} entityCollection выборка полученная в результате запроса
			 */
			getSelectedButton: function(returnCode, callback, scope, result, entityCollection) {
				if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
					this.onAnswerYes(entityCollection, returnCode, callback, scope, result);
				} else {
					this.onAnswerNo(entityCollection, returnCode, callback, scope, result);
				}
			},

			/**
			 * Обновляет найденную старую запись (работу),
			 * устанавливает ей признак "Текущая" = "Ложь",
			 * а также дату завершения
			 * @protected
			 * @virtual
			 * @param {Object} entityCollection выборка полученная в результате запроса
			 * @param {String} returnCode ответ пользователя на вопрос из окна сообщений
			 * @param {Function} callback callback-функция
			 * @param {Object} scope Контекст выполнения функции callback
			 * @param {Object} result Ответ сервера
			 */
			onAnswerNo: function(entityCollection, returnCode, callback, scope, result) {
				var oldContactCareer = entityCollection.getItems()[0].get("Id");
				var update = Ext.create("Terrasoft.UpdateQuery", {
					rootSchemaName: "ContactCareer"
				});
				update.filters.add("ContactIdFilter",
						update.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "Id", oldContactCareer));
				update.setParameterValue("Current", false, this.Terrasoft.DataValueType.BOOLEAN);
				update.setParameterValue("DueDate", new Date(), this.Terrasoft.DataValueType.DATE);
				update.execute();
				callback.call(scope, result);
			},

			/**
			 * Обновляет найденную старую запись (работу),
			 * устанавливает ей признак "Основная" = "Ложь"
			 * @protected
			 * @virtual
			 * @param {Object} entityCollection выборка полученная в результате запроса
			 * @param {String} returnCode ответ пользователя на вопрос из окна сообщений
			 * @param {Function} callback callback-функция
			 * @param {Object} scope Контекст выполнения функции callback
			 * @param {Object} result Ответ сервера
			 */
			onAnswerYes: function(entityCollection, returnCode, callback, scope, result) {
				var oldContactCareer = entityCollection.getByIndex(0).get("Id");
				var update = Ext.create("Terrasoft.UpdateQuery", {
					rootSchemaName: "ContactCareer"
				});
				update.filters.addItem(update.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
					"Id", oldContactCareer));
				update.setParameterValue("Primary", false, this.Terrasoft.DataValueType.BOOLEAN);
				update.execute();
				callback.call(scope, result);
			}

		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "Contact",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"bindTo": "Contact",
					"enabled": false,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 24
					}
				}
			},
			{
				"operation": "insert",
				"name": "Account",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"bindTo": "Account",
					"layout": {
						"column": 0,
						"row": 1,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "Department",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"bindTo": "Department",
					"layout": {
						"column": 12,
						"row": 1,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "Job",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"bindTo": "Job",
					"layout": {
						"column": 0,
						"row": 2,
						"colSpan": 12
					},
					"contentType": Terrasoft.ContentType.ENUM
				}
			},
			{
				"operation": "insert",
				"name": "JobTitle",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"bindTo": "JobTitle",
					"layout": {
						"column": 0,
						"row": 3,
						"colSpan": 24
					}
				}
			},
			{
				"operation": "insert",
				"name": "Primary",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"bindTo": "Primary",
					"layout": {
						"column": 12,
						"row": 2,
						"colSpan": 6
					}
				}
			},
			{
				"operation": "insert",
				"name": "Current",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"bindTo": "Current",
					"layout": {
						"column": 18,
						"row": 2,
						"colSpan": 6
					}
				}
			},
			{
				"operation": "insert",
				"name": "StartDate",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"bindTo": "StartDate",
					"layout": {
						"column": 0,
						"row": 4,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "DueDate",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"bindTo": "DueDate",
					"layout": {
						"column": 12,
						"row": 4,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"name": "JobChangeReason",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"bindTo": "JobChangeReason",
					"layout": {
						"column": 0,
						"row": 5,
						"colSpan": 12
					},
					"contentType": Terrasoft.ContentType.ENUM
				}
			},
			{
				"operation": "insert",
				"name": "Description",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"bindTo": "Description",
					"layout": {
						"column": 0,
						"row": 6,
						"colSpan": 24
					},
					"contentType": Terrasoft.ContentType.LONG_TEXT
				}
			}
		]/**SCHEMA_DIFF*/
	};
});