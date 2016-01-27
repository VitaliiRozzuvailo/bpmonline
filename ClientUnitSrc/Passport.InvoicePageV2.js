define("InvoicePageV2", ["BusinessRuleModule", "InvoiceConfigurationConstants"],
	function(BusinessRuleModule, InvoiceConfigurationConstants) {
		return {
			entitySchemaName: "Invoice",
			methods: {
				/**
				 * @inheritDoc Terrasoft.BasePageV2#onEntityInitialized
				 * @overridden
				 */
				onEntityInitialized: function() {
					this.callParent(arguments);
					this.readSupplyPaymentElement();
				},

				/**
				 * Метод ищет шаг графика поставок и оплат, связанный с текущим счетом.
				 * @param {Function} callback Метод обратного вызова.
				 * @param {Object} scope Контекст выполнения.
				 * @private
				 */
				readSupplyPaymentElement: function(callback, scope) {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SupplyPaymentElement",
						rowCount: 1
					});
					esq.addColumn("Id");
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Invoice", this.get("Id")));
					esq.getEntityCollection(function(response) {
						var element = null;
						var collection = response.collection;
						if (collection && collection.getCount()) {
							var item = collection.getByIndex(0);
							element = {value: item.get("Id")};
						}
						this.set("SupplyPaymentElement", element);
						if (callback) {
							callback.call(scope || this);
						}
					}, this);
				},

				/**
				 * @inheritDoc Terrasoft.BasePageV2#save
				 * @overridden
				 */
				save: function(config) {
					if (!this.get("IsCancel")) {
						this.needToCancelInvoice(function(result) {
							if (result) {
								this.set("IsCancel", true);
								this.save(config);
							}
						}, this);
					} else {
						this.set("IsCancel", false);
						this.callParent(arguments);
					}

				},

				/**
				 * Диалоговое окно с вопросом о отвязки счета от шага ГПиО.
				 * @protected
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope консекст обратного вызова.
				 */
				needToCancelInvoice: function(callback, scope) {
					var supplyPaymentElement = this.get("SupplyPaymentElement");
					var paymentStatus = this.get("PaymentStatus") || {};
					var isCancel = this.get("IsCancel");
					if (paymentStatus.value === InvoiceConfigurationConstants.Invoice.PaymentStatus.Canceled &&
							supplyPaymentElement && !isCancel) {
						this.showConfirmationDialog(this.get("Resources.Strings.CleanupSupplyPaymentElement"),
							function(dialogResult) {
								if (dialogResult === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
									callback.call(scope, true);
								} else {
									callback.call(scope, false);
								}
							},
							["yes", "no"]
						);
					} else {
						callback.call(scope, true);
					}
				},

				/**
				 * @inheritDoc Terrasoft.BasePageV2#saveEntityInChain
				 * @overridden
				 */
				saveEntityInChain: function(next) {
					var callback = next;
					if (this.get("SupplyPaymentElement")) {
						callback = this.readSupplyPaymentElement.bind(this, next);
					}
					this.callParent([callback]);
				}
			},
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
		};
	}
);
