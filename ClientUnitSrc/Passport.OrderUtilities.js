define("OrderUtilities", ["InvoiceConfigurationConstants", "OrderUtilitiesResources"],
	function(InvoiceConfigurationConstants, resources) {

		Ext.define("Terrasoft.configuration.mixins.OrderUtilities", {

			alternateClassName: "Terrasoft.OrderUtilities",

			/**
			 * Проверяет есть ли выставленый счет.
			 * @protected
			 * @param {Object} config Параметры фильтра.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			needToChangeInvoice: function(config, callback, scope) {
				if (!config.id) {
					callback.call(scope, true);
					return;
				}
				var paymentStatus = InvoiceConfigurationConstants.Invoice.PaymentStatus;
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "SupplyPaymentElement"
				});
				esq.addAggregationSchemaColumn("Id", Terrasoft.AggregationType.COUNT, "InvoiceCount");
				esq.filters.add(config.name, this.Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, config.name, config.id));
				esq.filters.add("Invoice.PaymentStatus", this.Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.NOT_EQUAL, "Invoice.PaymentStatus", paymentStatus.NotInvoiced));
				esq.filters.add("Invoice", this.Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.IS_NOT_NULL, "Invoice"));
				esq.getEntityCollection(function(result) {
					this.needToChangeInvoiceResultHandler(result, callback, scope);
				}, this);
			},

			/**
			 * Обработчик запроса на количество выставленых счетов.
			 * @protected
			 * @param {Object} result Результат запроса о существовании выставленого счета.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			needToChangeInvoiceResultHandler: function(result, callback, scope) {
				if (result.success) {
					var collection = result.collection;
					if (collection && collection.getCount() > 0 &&
						collection.getByIndex(0).get("InvoiceCount") > 0) {
						this.showConfirmationDialog(resources.localizableStrings.ChangeInvoice,
							function(dialogResult) {
								callback.call(scope, (dialogResult ===
									this.Terrasoft.MessageBoxButtons.YES.returnCode));
							},
							["yes", "no"]
						);
					} else {
						callback.call(scope, true);
					}
				} else {
					throw new Terrasoft.UnsupportedTypeException();
				}
			}
		});
		return Ext.create("Terrasoft.OrderUtilities");
	}
);
