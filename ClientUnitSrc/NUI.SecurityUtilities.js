define("SecurityUtilities", ["ext-base", "terrasoft", "SecurityUtilitiesResources", "RightUtilities"],
		function(Ext, Terrasoft, resources, RightUtilities) {
			var definedClass = Ext.ClassManager.get("Terrasoft.SecurityUtilities");
			if (definedClass) {
				return Ext.create(definedClass);
			}

			Ext.define("Terrasoft.configuration.mixins.SecurityUtilitiesMixin", {
				alternateClassName: "Terrasoft.SecurityUtilitiesMixin",

				/**
				 * Проверяет, администрируется ли текущяя схема по операциям.
				 * @protected
				 * @virtual
				 * @return {Boolean} True - если администрируется, false в обратном случае.
				 */
				isSchemaAdministratedByOperations: function() {
					var entitySchema = this.entitySchema;
					return entitySchema && !!entitySchema.administratedByOperations;
				},

				/**
				 * Возвращает название операции, доступ на которую должен быть у пользователя для использования раздела или
				 * страницы.
				 * @protected
				 * @virtual
				 * @return {String|null} Название операции.
				 */
				getSecurityOperationName: function() {
					return this.get("SecurityOperationName");
				},

				/**
				 * Проверяет доступность схемы раздела для чтения текущим пользователем.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция, которая будет вызвана по завершению.
				 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
				 */
				checkSchemaRigthsAvailability: function(callback, scope) {
					var entitySchemaName = this.entitySchemaName;
					RightUtilities.getSchemaOperationRightLevel(entitySchemaName, function(rightLevel) {
						this.set("SchemaOperationRight", rightLevel);
						callback.call(scope, this.isSchemaCanReadRightConverter(rightLevel));
					}, this);
				},

				/**
				 * Проверяет наявность прав на необходимую операцию.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция, которая будет вызвана по завершению.
				 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
				 */
				checkSchemaOperationAvailability: function(callback, scope) {
					var operationName = this.getSecurityOperationName();
					if (!operationName) {
						callback.call(scope, true);
						return;
					}
					this.checkCanExecuteOperation(operationName, callback, scope);
				},

				/**
				 * Проверяет возможность выполнения администрируемой операции.
				 * @protected
				 * @virtual
				 * @param {String} operationName Имя администрируемой операции.
				 * @param {Function} callback Функция, которая будет вызвана по завершению.
				 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
				 */
				checkCanExecuteOperation: function(operationName, callback, scope) {
					RightUtilities.checkCanExecuteOperation({
						operation: operationName
					}, function(result) {
						this.setCanExecuteOperationResult(operationName, result);
						callback.call(scope, result);
					}, this);
				},

				/**
				 * Устанавливает результат проверки возможности выполнения администрируемой операции.
				 * @protected
				 * @virtual
				 * @param {String} operationName Имя администрируемой операции.
				 * @param {Boolean} result Результат проверки возможности выполнения администрируемой операции.
				 */
				setCanExecuteOperationResult: function(operationName, result) {
					this.set(operationName, result);
				},

				/**
				 * Обрабатывает результат проверки прав. Уведомляет пользователя, если прав нет.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция, которая будет вызвана по завершению.
				 * @param {Boolean} result Результат проверки.
				 */
				processCheckAvailabilityResult: function(callback, result) {
					if (result) {
						callback.call(this);
					} else {
						this.hideBodyMask();
						var message = resources.localizableStrings.RightAvailabilityFailMessage;
						Terrasoft.showInformation(message);
					}
				},

				/**
				 * Производит проверку на доступность раздела для текущего пользователя.
				 * Если раздел не доступен - сообщает об этом и не вызывает функцию обратного вызова.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция, которая будет вызвана по завершению.
				 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
				 */
				checkAvailability: function(callback, scope) {
					var checkChain = [];
					var checkFn = this.isSchemaAdministratedByOperations() ?
							this.checkSchemaRigthsAvailability : this.checkSchemaOperationAvailability;
					checkChain.push(
							checkFn,
							this.processCheckAvailabilityResult,
							function() {
								callback.call(scope || this);
							},
							this
					);
					Terrasoft.chain.apply(this, checkChain);
				}
			});
		});