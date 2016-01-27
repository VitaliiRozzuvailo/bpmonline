define("BaseSupplyPaymentItemPageV2", ["terrasoft", "OrderConfigurationConstants"],
	function(Terrasoft, OrderConfigurationConstants) {
		return {
			methods: {
				/**
				 * Инициирует выполнение метода последующим вызовом метода проверки ответа сервера
				 * в callback-функции. Если валидация прошла успешно, выполняет следующий шаг цепочки,
				 * иначе прекращает работу.
				 * @param {Function} next Следующий шаг цепочки вызовов.
				 * @param {Function} method Выполняемый метод.
				 */
				callWithValidation: function(next, method) {
					if (method && this.Ext.isFunction(method)) {
						method.call(this, function(response) {
							if (this.validateResponse(response)) {
								next();
							}
						}, this);
					}
				},

				/**
				 * Обработчик изменения типа шага.
				 * @private
				 */
				onTypeChanged: function() {
					var name = this.get("Name");
					var type = this.get("Type");
					if (this.Ext.isEmpty(name) && !this.Ext.isEmpty(type)) {
						this.set("Name", type.displayValue);
					}
				},

				/**
				 * Возвращает признак необходимости проводить валидацию по полю "Доля, %" в рамках родительского объекта.
				 * Общее значение данного поля должно быть не более 100%. Валидацию необходимо проводить
				 * если доля изменена, текущий шаг связан с заказом и является оплатой.
				 * @protected
				 */
				needValidateTotalPercentage: function() {
					if (this.changedValues && this.changedValues.hasOwnProperty("Percentage")) {
						var order = this.get("Order");
						var type = this.get("Type");
						return (order && order.value && type &&
							(type.value === OrderConfigurationConstants.SupplyPaymentElement.Type.Payment));
					}
					return false;
				},

				/**
				 * Отправляет запрос валидации значения поля "Доля, %" на сервер. Метод сервиса проверяет значение поля
				 * текущей записи и остальных значений данного поля для текущего заказа. Если суммарное значение
				 * больше 100%, функция обратного вызова получает соответствующую информацию и возвращает сообщение
				 * валидации. Иначе на сервере происходит проверка существования записей с незаполненным полем "Доля, %".
				 * Если существует единственная подобная запись, она автоматически заполняется остатком.
				 * @protected
				 * @param {Object} config Объект для формирования запроса валидации.
				 * Содержит следующие параметры:
				 * @param {GUID} config.orderId
				 *   Идентификатор текущего заказа.
				 * @param {GUID} config.supplyPaymentElementId
				 *   Идентификатор текущего шага графика поставок и оплат.
				 * @param {Number} config.percentageValue
				 *   Новое значение поля "Доля, %" текущего шага.
				 * @param {Function} config.callback
				 *   Функция, которая будет вызвана после получения ответа от сервера.
				 */
				validateTotalPercentage: function(config) {
					this.callService({
						serviceName: "OrderPassportService",
						methodName: "ValidateSupplyPaymentPercentage",
						data: {
							"orderId": config.orderId,
							"currentElementId": config.supplyPaymentElementId,
							"newPercentageValue": config.percentageValue
						}
					}, function(response) {
						var responseResult = response.ValidateSupplyPaymentPercentageResult || {};
						if (responseResult.success && this.parentDetailViewModel &&
								this.changedValues && this.changedValues.Percentage) {
							this.parentDetailViewModel.set("NeedReloadGridData", true);
						}
						config.callback.call(this, {
							success: responseResult.success,
							message: (responseResult.errorInfo && responseResult.errorInfo.message) || ""
						});
					}, this);
				},

				/**
				 * Валидатор отсрочки.
				 * @private
				 * @param {Function} callback - функция обратного вызова.
				 * @param {Object} scope - контекст.
				 */
				validateDelay: function(callback, scope) {
					var delay = this.get("Delay");
					var result = {
						success: true
					};
					if (delay < 0) {
						result.message = this.get("Resources.Strings.DelayNegative");
						result.success = false;
					}
					callback.call(scope || this, result);
				},

				/**
				 * Валидатор доли.
				 * @private
				 * @param {Function} callback - функция обратного вызова.
				 * @param {Object} scope - контекст.
				 */
				validatePercentage: function(callback, scope) {
					var percent = this.get("Percentage");
					var result = {
						success: true
					};
					if ((percent > 100) || (percent < 0)) {
						result.message = this.get("Resources.Strings.PercentageIncorrect");
						result.success = false;
					} else if ((percent > 0) && this.needValidateTotalPercentage()) {
						this.validateTotalPercentage(
							{
								orderId: this.get("Order").value,
								supplyPaymentElementId: this.get("Id"),
								percentageValue: percent,
								callback: callback
							}
						);
						return;
					}
					callback.call(scope || this, result);
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#asyncValidate
				 * @protected
				 * @overridden
				 */
				asyncValidate: function(callback, scope) {
					this.callParent([function(response) {
						if (!this.validateResponse(response)) {
							return;
						}
						Terrasoft.chain(
							function(next) {
								this.callWithValidation(next, this.validatePercentage);
							},
							function(next) {
								this.callWithValidation(next, this.validateDelay);
							},
							function() {
								callback.call(scope, response);
							}, this);
					}, this]);
				}
			}
		};
	}
);
