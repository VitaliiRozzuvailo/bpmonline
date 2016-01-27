define("OrderPageV2", ["ProcessModuleUtilities"],
	function(ProcessModuleUtilities) {
		return {
			entitySchemaName: "Order",
			methods: {
				/**
				 * Возвращает коллекцию действий карточки
				 * @protected
				 * @overridden
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий карточки
				 */
				getActions: function() {
					var actionMenuItems = this.callParent(arguments);
					actionMenuItems.add("CreateInvoice", this.getActionsMenuItem({
						"Caption": this.get("Resources.Strings.CreateInvoiceByOrderCaption"),
						"Tag": "onCreateInvoiceClick",
						"Enabled": {"bindTo": "canEntityBeOperated"}
					}));
					return actionMenuItems;
				},

				/**
				 * Обрабатывает выбор меню "Создать счет на основе заказа".
				 */
				onCreateInvoiceClick: function() {
					if (this.isChanged()) {
						this.save({
							isSilent: true,
							scope: this,
							callback: this.createInvoice
						});
					} else {
						this.createInvoice();
					}
				},

				/**
				 * Запускает процесс создания счета по заказу.
				 * @private
				 */
				createInvoice: function() {
					ProcessModuleUtilities.executeProcess({
						sysProcessName: "CreateInvoiceFromOrder",
						parameters: {
							CurrentOrder: this.get("Id")
						}
					});
				}
			},
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
		};
	});
