define("OrderPageV2", ["OrderConfigurationConstants", "ConfigurationEnums", "OrderUtilities"],
	function(OrderConfigurationConstants, ConfigurationEnums) {
		return {
			entitySchemaName: "Order",
			messages: {

				/**
				 * Используется для получения суммы заказа.
				 */
				"GetOrderAmount": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			mixins: {
				OrderUtilities: "Terrasoft.OrderUtilities"
			},
			details: /**SCHEMA_DETAILS*/{
				SupplyPayment: {
					schemaName: "SupplyPaymentDetailV2",
					entitySchemaName: "SupplyPaymentElement",
					filter: {
						masterColumn: "Id",
						detailColumn: "Order"
					},
					defaultValues: {
						Currency: {
							masterColumn: "Currency"
						},
						CurrencyRate: {
							masterColumn: "CurrencyRate"
						}
					},
					subscriber: {methodName: "refreshAmount"}
				},
				SupplyPaymentResults: {
					schemaName: "SupplyPaymentDetailV2",
					entitySchemaName: "SupplyPaymentElement",
					filter: {
						masterColumn: "Id",
						detailColumn: "Order"
					},
					defaultValues: {
						Currency: {
							masterColumn: "Currency"
						},
						CurrencyRate: {
							masterColumn: "CurrencyRate"
						}
					},
					subscriber: {methodName: "refreshAmount"}
				}
			}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "OrderPassportTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 1,
					"values": {
						"caption": {"bindTo": "Resources.Strings.OrderPassport"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "OrderPassportTab",
					"propertyName": "items",
					"name": "SupplyPayment",
					"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
				},
				{
					"operation": "insert",
					"parentName": "OrderResultsTab",
					"propertyName": "items",
					"name": "SupplyPaymentResults",
					"index": 1,
					"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
				}
			]/**SCHEMA_DIFF*/,
			methods: {
				/**
				 * @inheritDoc Terrasoft.Configuration.BasePageV2#save
				 * @overridden
				 */
				save: function(config) {
					if (!this.get("ChangeInvoice") && this.changedValues &&
							this.changedValues.hasOwnProperty("Currency")) {
						this.needToChangeInvoice({
								name: "Order",
								id: this.get("Id")
							}, function(result) {
								if (result) {
									this.set("ChangeInvoice", true);
									this.save(config);
								}
							}, this
						);
					} else {
						this.set("ChangeInvoice", false);
						this.callParent(arguments);
					}
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#activeTabChange
				 * @overridden
				 */
				activeTabChange: function(activeTab) {
					this.callParent(arguments);
					var tabName = activeTab.get("Name");
					if (tabName === "OrderPassportTab") {
						this.updateDetail({detail: "SupplyPayment"});
					} else if (tabName === "OrderResultsTab") {
						this.updateDetail({detail: "SupplyPaymentResults"});
					}
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#subscribeSandboxEvents
				 * @overridden
				 */
				subscribeSandboxEvents: function() {
					this.callParent(arguments);
					var detailIds = [this.getDetailId("SupplyPayment"), this.getDetailId("SupplyPaymentResults")];
					this.sandbox.subscribe("GetOrderAmount", this.onGetOrderAmount, this, detailIds);
				},

				/**
				 * Обрабатывает сообщение GetOrderAmount.
				 * @public
				 */
				onGetOrderAmount: function() {
					return this.get("Amount");
				},

				/**
				 * @inheritdoc Terrasoft.OrderPageV2#modifyAmountESQ
				 * @overridden
				 */
				modifyAmountESQ: function(esq) {
					this.callParent(arguments);
					esq.addColumn("PaymentAmount");
					esq.addColumn("PrimaryPaymentAmount");
				},

				/**
				 * @inheritdoc Terrasoft.OrderPageV2#updateAmountColumnValues
				 * @overridden
				 */
				updateAmountColumnValues: function(entity) {
					this.callParent(arguments);
					var updatedPaymentAmount = entity.get("PaymentAmount");
					var updatedPrimaryPaymentAmount = entity.get("PrimaryPaymentAmount");
					if (updatedPaymentAmount !== this.get("PaymentAmount") ||
							updatedPrimaryPaymentAmount !== this.get("PrimaryPaymentAmount")) {
						this.set("PaymentAmount", updatedPaymentAmount);
						this.set("PrimaryPaymentAmount", updatedPrimaryPaymentAmount);
					}
				},

				/**
				 * Выполняет проверку значения модели представления.
				 * @private
				 * @overridden
				 * @param {Function} callback callback-функция
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции
				 */
				asyncValidate: function(callback, scope) {
					this.callParent([function(response) {
						if (!this.validateResponse(response)) {
							return;
						}
						Terrasoft.chain(
							function(next) {
								this.validateOrderStatus(function(response) {
									if (this.validateResponse(response)) {
										next();
									}
								}, this);
							},
							function(next) {
								callback.call(scope, response);
								next();
							}, this);
					}, this]);
				},

				/**
				 * Проверка валидации колонки "Статус".
				 * Сумма по продуктам и по оплатам дожна совпадать.
				 */
				validateOrderStatus: function(callback, scope) {
					var result = {
						success: true
					};
					var status = this.get("Status");
					var primaryAmount = this.get("PrimaryAmount");
					var OrderStatus = OrderConfigurationConstants.Order.OrderStatus;
					if (status && (status.value === OrderStatus.InPlanned || status.value === OrderStatus.Canceled)) {
						callback.call(scope || this, result);
						return;
					}
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SupplyPaymentElement"
					});
					esq.addAggregationSchemaColumn("PrimaryAmountPlan", Terrasoft.AggregationType.SUM,
						"PrimaryAmountPlanSum");
					var filters = Terrasoft.createFilterGroup();
					filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Order", this.get("Id")));
					filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Type", OrderConfigurationConstants.SupplyPaymentElement.Type.Payment));
					esq.filters = filters;
					esq.getEntityCollection(function(response) {
						if (response.success) {
							var collection = response.collection;
							if (collection.getCount() > 0 && primaryAmount !==
								collection.getByIndex(0).get("PrimaryAmountPlanSum")) {
								result.message = this.get("Resources.Strings.ValidateOrderStatus");
								result.success = false;
							}
						} else {
							return;
						}
						callback.call(this, result);
					}, scope);
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#onSaved
				 * @overriden
				 */
				onSaved: function() {
					var operation = this.get("Operation");
					if (operation === ConfigurationEnums.CardStateV2.EDIT) {
						this.updateDetail({detail: "SupplyPayment"});
						this.updateDetail({detail: "SupplyPaymentResults"});
					}
					this.callParent(arguments);
				}
			}
		};
	});
