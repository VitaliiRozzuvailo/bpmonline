define("OrderPageV2", ["OrderConfigurationConstants", "BusinessRuleModule", "MoneyModule",
			"VisaHelper", "ProductEntryPageUtils", "css!VisaHelper", "MultiCurrencyEdit", "MultiCurrencyEditUtilities"],
		function(OrderConfigurationConstants, BusinessRuleModule, MoneyModule, VisaHelper) {
			return {
				entitySchemaName: "Order",
				messages: {
					/**
					 * @message GetOrderProductSummary
					 * Возвращение информации для итогов детали "Продукты".
					 */
					"GetOrderProductSummary": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},

					/**
					 * @message UpdateOrderProductSummary
					 * Обновление итогов детали "Продукты".
					 */
					"UpdateOrderProductSummary": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					},

					/**
					 * @message GetIsDeliveryAddressDetailVisible
					 * Возвращение видимости детали "Адрес поставки".
					 */
					"GetIsDeliveryAddressDetailVisible": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					},

					/**
					 * @message SetActiveAddress
					 * Используется для установки активного адреса в деталях.
					 */
					"SetActiveAddress": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					},

					/**
					 * @message UpdateOrderAddress
					 * Используется для обновления активного адреса при выборе такового в детали.
					 */
					"UpdateOrderAddress": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.SUBSCRIBE
					}
				},
				attributes: {
					"Status": {
						"lookupListConfig": {
							orders: [{columnPath: "Position"}]
						}
					},
					"PaymentStatus": {
						"lookupListConfig": {
							orders: [{columnPath: "Position"}]
						}
					},
					"DeliveryStatus": {
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						"lookupListConfig": {
							orders: [{columnPath: "Position"}]
						}
					},
					"DeliveryType": {
						dependencies: [
							{
								columns: ["DeliveryType"],
								methodName: "updateDeliveryAddresses"
							}
						]
					},
					"SourceOrder": {
						"lookupListConfig": {
							orders: [{columnPath: "Name"}]
						}
					},
					/**
					 * Валюта
					 */
					"Currency": {
						dataValueType: Terrasoft.DataValueType.ENUM,
						lookupListConfig: {
							columns: ["Division", "ShortName"]
						}
					},
					"CurrencyRate": {
						dataValueType: Terrasoft.DataValueType.FLOAT,
						dependencies: [
							{
								columns: ["Currency"],
								methodName: "onCurrencyChanged"
							}
						]
					},
					"PrimaryPaymentAmount": {
						dataValueType: Terrasoft.DataValueType.FLOAT,
					},
					"ActualDate": {
						dataValueType: Terrasoft.DataValueType.DATE_TIME,
						dependencies: [
							{
								columns: ["PaymentStatus", "DeliveryStatus", "Status", "Date"],
								methodName: "setClosedOrder"
							}
						]
					},
					"Date": {
						dataValueType: Terrasoft.DataValueType.DATE_TIME
					},
					"Client": {
						dataValueType: Terrasoft.DataValueType.DATE_TIME,
						dependencies: [
							{
								columns: ["Account", "Contact"],
								methodName: "updateDeliveryAddresses"
							}
						]
					},
					"AmountAndCurrency": {
						dependencies: [
							{
								columns: ["Amount", "Currency"],
								methodName: "updateOrderProductSummary"
							}
						]
					}
				},
				details: /**SCHEMA_DETAILS*/{
					Files: {
						schemaName: "FileDetailV2",
						entitySchemaName: "OrderFile",
						filter: {
							masterColumn: "Id",
							detailColumn: "Order"
						}
					},
					ProductInProductsTab: {
						schemaName: "OrderProductDetailV2",
						entitySchemaName: "OrderProduct",
						filter: {
							masterColumn: "Id",
							detailColumn: "Order"
						},
						subscriber: {methodName: "refreshAmount"},
						defaultValues: {
							Currency: {masterColumn: "Currency"},
							CurrencyRate: {masterColumn: "CurrencyRate"}
						}
					},
					ProductInResultsTab: {
						schemaName: "OrderProductDetailV2",
						entitySchemaName: "OrderProduct",
						filter: {
							masterColumn: "Id",
							detailColumn: "Order"
						},
						subscriber: {methodName: "refreshAmount"},
						defaultValues: {
							Currency: {masterColumn: "Currency"},
							CurrencyRate: {masterColumn: "CurrencyRate"}
						}
					},
					Activities: {
						schemaName: "ActivityDetailV2",
						filter: {
							masterColumn: "Id",
							detailColumn: "Order"
						},
						defaultValues: {
							Account: {masterColumn: "Account"},
							Contact: {masterColumn: "Contact"}
						}
					},
					Visa: {
						schemaName: "VisaDetailV2",
						entitySchemaName: "OrderVisa",
						filter: {
							masterColumn: "Id",
							detailColumn: "Order"
						}
					},
					Invoice: {
						schemaName: "InvoiceDetailV2",
						entitySchemaName: "Invoice",
						filter: {
							masterColumn: "Id",
							detailColumn: "Order"
						},
						defaultValues: {
							Account: {masterColumn: "Account"},
							Contact: {masterColumn: "Contact"}
						}
					},
					DeliveryAddressDetail: {
						schemaName: "AddressSelectionDetailV2",
						defaultValues: {
							"ContactId": {masterColumn: "Contact"},
							"AccountId": {masterColumn: "Account"},
							"DeliveryAddress": {masterColumn: "DeliveryAddress"}
						}
					},
					AddressSelectionDetailResultsTab: {
						schemaName: "AddressSelectionResultDetailV2",
						defaultValues: {
							"ContactId": {masterColumn: "Contact"},
							"AccountId": {masterColumn: "Account"},
							"DeliveryAddress": {masterColumn: "DeliveryAddress"}
						}
					}
				}/**SCHEMA_DETAILS*/,
				mixins: {
					ProductEntryPageUtils: "Terrasoft.ProductEntryPageUtils",

					/**
					 * Миксин управления мультивалютностью в карточке редактирования.
					 */
					MultiCurrencyEditUtilities: "Terrasoft.MultiCurrencyEditUtilities"
				},
				methods: {

					/**
					 * Перечитывает значение сумм из БД.
					 */
					refreshAmount: function() {
						this.updateAmount(function() {
							this.updateOrderProductSummary();
						}, this);
					},

					/**
					 * @inheritdoc Terrasoft.BasePageV2#init
					 * @overridden
					 */
					init: function() {
						this.mixins.MultiCurrencyEditUtilities.init.call(this);
						this.callParent(arguments);
					},

					/**
					 * @inheritdoc Terrasoft.BasePageV2#activeTabChange
					 * @overridden
					 */
					activeTabChange: function(activeTab) {
						this.callParent(arguments);
						var tabName = activeTab.get("Name");
						if (tabName === "OrderProductTab") {
							this.updateDetail({detail: "ProductInProductsTab"});
						} else if (tabName === "OrderResultsTab") {
							this.updateDetail({detail: "ProductInResultsTab"});
						}
					},

					/**
					 * В зависимости от типа поставки показывает/скрывает деталь адреса доставки.
					 * @private
					 */
					getDeliveryAddressVisible: function() {
						var deliveryType = this.get("DeliveryType");
						return deliveryType &&
								(deliveryType.value === OrderConfigurationConstants.Order.DeliveryType.Courier);
					},

					/**
					 * Устанавливает идентификатор контекстной справки.
					 * @protected
					 */
					initContextHelp: function() {
						this.set("ContextHelpId", 1055);
						this.callParent(arguments);
					},

					/**
					 * @inheritdoc Terrasoft.BasePageV2#onEntityInitialized
					 * @overridden
					 */
					onEntityInitialized: function() {
						if (this.isAddMode() || this.isCopyMode()) {
							this.getIncrementCode(function(responce) {
								this.set("Number", responce);
							});
						}
						this.callParent(arguments);
					},

					getActions: function() {
						var actionMenuItems = this.callParent(arguments);
						actionMenuItems.add("SendToVisaSeparator", this.getActionsMenuItem({
							Type: "Terrasoft.MenuSeparator",
							Caption: ""
						}));
						actionMenuItems.add("SendToVisa", this.getActionsMenuItem({
							"Caption": VisaHelper.resources.localizableStrings.SendToVisaCaption,
							"Tag": VisaHelper.SendToVisaMenuItem.methodName,
							"Enabled": {"bindTo": "canEntityBeOperated"}
						}));
						return actionMenuItems;
					},

					/**
					 * Действие "Отправить на визирование"
					 */
					sendToVisa: VisaHelper.SendToVisaMethod,

					/**
					 * Выполняет проверку значения модели представления.
					 * Если присутствуют некорректные значения, выводит сообщение о необходимости заполнения первого.
					 * @protected
					 * @overridden
					 * @param {Function} callback callback-функция
					 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции
					 */
					asyncValidate: function(callback, scope) {
						this.callParent([function(response) {
							var checkResponse = function(context) {
								if (!context.response.success) {
									context.callback.call(context.scope, context.response);
								} else {
									context.next();
								}
							};
							var validationChain = [
								checkResponse,
								function(context) {
									context.scope.validateAccountOrContactFilling(function(response) {
										context.response = response;
										context.next();
									}, context.scope);
								},
								function(context) {
									context.callback.call(context.scope, context.response);
								}
							];
							Terrasoft.chain({
								scope: scope || this,
								response: response,
								callback: callback
							}, validationChain);
						}, this]);
					},

					/**
					 * Добавляет валидаторы
					 * @inheritdoc Terrasoft.BasePageV2ViewModel#setValidationConfig
					 * @overridden
					 */
					setValidationConfig: function() {
						this.callParent(arguments);
						this.addColumnValidator("PaymentAmount", this.validatePaymentAmount);
						this.addColumnValidator("ActualDate", this.validateDate);
						this.addColumnValidator("DueDate", this.validateDate);
						this.addColumnValidator("Date", this.validateDate);

					},

					/**
					 * Функция валидации колонок "Дата", "Дата выполнения", "Плановая дата выполнения".
					 * Дата выполнения и плановая дата не может быть больше даты заказа
					 * @return {{fullInvalidMessage: string, invalidMessage: string}}
					 */
					validateDate: function() {
						var actualDate = Terrasoft.deepClone(this.get("ActualDate"));
						var dueDate = Terrasoft.deepClone(this.get("DueDate"));
						var date = Terrasoft.deepClone(this.get("Date"));
						var invalidMessage = "";
						if (dueDate && date && dueDate.setHours(0, 0, 0, 0) < date.setHours(0, 0, 0, 0)) {
							invalidMessage = this.get("Resources.Strings.DateLessDueDate");
						}
						if (actualDate && date && actualDate.setHours(0, 0, 0, 0) < date.setHours(0, 0, 0, 0)) {
							invalidMessage = this.get("Resources.Strings.DateLessActualDate");
						}
						return {
							fullInvalidMessage: invalidMessage,
							invalidMessage: invalidMessage
						};
					},

					/**
					 * Функция валидации колонки "Сумма оплаты".
					 * Сумма оплаты заказа не может быть больше суммы заказа.
					 * @return {{fullInvalidMessage: string, invalidMessage: string}}
					 */
					validatePaymentAmount: function() {
						var paymentAmount = this.get("PaymentAmount");
						var amount = this.get("Amount");
						var invalidMessage = "";
						if (paymentAmount < 0) {
							invalidMessage = this.get("Resources.Strings.ValidatePaymentAmountNegative");
						} else if ((!amount && (paymentAmount > 0)) || (paymentAmount > amount)) {
							invalidMessage = this.get("Resources.Strings.ValidatePaymentAmount");
						}
						return {
							fullInvalidMessage: invalidMessage,
							invalidMessage: invalidMessage
						};
					},

					/**
					 * Проверяет заполненость полей "Контакт" или "Контрагент" значениями
					 * @param {Function} callback Функция обратного вызова
					 * @param {Object} scope Контекст
					 */
					validateAccountOrContactFilling: function(callback, scope) {
						var account = this.get("Account");
						var contact = this.get("Contact");
						var result = {
							success: true
						};
						if (this.Ext.isEmpty(account) && this.Ext.isEmpty(contact)) {
							result.message = this.get("Resources.Strings.RequiredFieldsMessage");
							result.success = false;
						}
						callback.call(scope || this, result);
					},

					/**
					 * Вызывается при изменении валюты
					 * @protected
					 */
					onCurrencyChanged: function() {
						this.set("ShowSaveButton", true);
						this.set("ShowDiscardButton", true);
						this.set("IsChanged", true, {silent: true});
						MoneyModule.LoadCurrencyRate.call(this, "Currency", "CurrencyRate", this.get("StartDate"), function() {
							var division = this.getCurrencyDivision();
							MoneyModule.RecalcCurrencyValue.call(this, "CurrencyRate", "Amount", "PrimaryAmount",
									division);
							MoneyModule.RecalcCurrencyValue.call(this, "CurrencyRate", "PaymentAmount", "PrimaryPaymentAmount",
									division);
						});
					},

					/**
					 * Возвращает коэффициент деления
					 * @protected
					 */
					getCurrencyDivision: function() {
						var currency = this.get("Currency");
						return currency && currency.Division;
					},

					/**
					 * Устанавливает заказ выполненным и проверят логику дат
					 * @protected
					 */
					setClosedOrder: function() {
						if (!this.get("IsEntityInitialized")) {
							return;
						}
						var currentDateTime = this.getSysDefaultValue(Terrasoft.SystemValueType.CURRENT_DATE_TIME);
						var paymentStatus = this.get("PaymentStatus");
						var deliveryStatus = this.get("DeliveryStatus");
						var status = this.get("Status");
						if (status && (status.value === OrderConfigurationConstants.Order.OrderStatus.Closed)) {
							this.set("ActualDate", currentDateTime);
						}
						if (paymentStatus && deliveryStatus &&
								(paymentStatus.value === OrderConfigurationConstants.Order.PaymentStatus.Paid) &&
								(deliveryStatus.value === OrderConfigurationConstants.Order.DeliveryStatus.Delivery)) {
							this.set("ActualDate", currentDateTime);
							this.loadLookupDisplayValue("Status", OrderConfigurationConstants.Order.OrderStatus.Closed);
						}
					},

					/**
					 * Функция сохранения карточки
					 * @overridden
					 */
					save: function() {
						if (this.validate()) {
							var amount = this.get("Amount");
							var paymentAmount = this.get("PaymentAmount");
							if (amount && (amount > 0) && (amount === paymentAmount)) {
								this.loadLookupDisplayValue("PaymentStatus",
										OrderConfigurationConstants.Order.PaymentStatus.Paid);
							} else if (paymentAmount > 0) {
								this.loadLookupDisplayValue("PaymentStatus",
										OrderConfigurationConstants.Order.PaymentStatus.PartiallyPaid);
							}
						}
						this.callParent(arguments);
					},
					/**
					 * Выполняет постобработку сохранения записи
					 * @protected
					 * @virtual
					 */
					onSaved: function() {
						this.callParent(arguments);
						var config = arguments[arguments.length - 1];
						if (config && config.isSilent) {
							return;
						}
						this.updateAmountAfterSave("ProductInProductsTab",
							function() {
								this.updateDetail({detail: "ProductInResultsTab"});
								this.updateOrderProductSummary();
							},
							this
						);
					},

					/**
					 * @inheritdoc Terrasoft.BaseViewModel#getEntitySchemaQuery
					 * @overridden
					 */
					getEntitySchemaQuery: function() {
						var esq = this.callParent(arguments);
						this.addProductsCountColumn(esq);
						return esq;
					},

					/**
					 * @inheritdoc Terrasoft.BaseViewModel#setColumnValues
					 * @overridden
					 */
					setColumnValues: function(entity) {
						this.callParent(arguments);
						this.updateProductsCount(entity);
					},

					/**
					 * @inheritdoc Terrasoft.ProductEntryPageUtils#modifyAmountESQ
					 * @overridden
					 */
					modifyAmountESQ: function(esq) {
						this.mixins.ProductEntryPageUtils.modifyAmountESQ.apply(this, arguments);
						this.addProductsCountColumn(esq);
					},

					/**
					 * @inheritdoc Terrasoft.ProductEntryPageUtils#updateAmountColumnValues
					 * @overridden
					 */
					updateAmountColumnValues: function(entity) {
						this.mixins.ProductEntryPageUtils.updateAmountColumnValues.apply(this, arguments);
						this.updateProductsCount(entity);
					},

					/**
					 * Добавляет колонку с колиеством продуктов заказа в запрос.
					 * @param {Terrasoft.EntitySchemaQuery} esq Запрос в таблицу заказа.
					 */
					addProductsCountColumn: function(esq) {
						esq.addAggregationSchemaColumn("[OrderProduct:Order].Id",
								this.Terrasoft.AggregationType.COUNT, "ProductCount");
					},

					/**
					 * Обновляет количество продуктов в заказе.
					 * @param {Terrasoft.BaseModel} entity Заказ с актуальным количеством.
					 */
					updateProductsCount: function(entity) {
						var countColumn = "ProductCount";
						this.setColumnValue(countColumn, entity.get(countColumn), {preventValidation: true});
					},

					/**
					 * Возвращет конфигурацию для итогов на детали "Продукты".
					 * @return {Object} Конфигурация для вычисления итогов детали.
					 */
					getProductSummaryConfig: function() {
						var currency = this.get("Currency") || {};
						return {
							count: this.get("ProductCount"),
							currency: currency.ShortName,
							amount: this.get("Amount")
						};
					},

					/**
					 * @inheritdoc Terrasoft.BasePageV2#subscribeSandboxEvents
					 * @overridden
					 */
					subscribeSandboxEvents: function() {
						this.callParent(arguments);
						this.sandbox.subscribe("GetOrderProductSummary", this.getProductSummaryConfig, this,
								[this.getDetailId("ProductInProductsTab"), this.getDetailId("ProductInResultsTab")]);
						this.sandbox.subscribe("GetIsDeliveryAddressDetailVisible", this.getDeliveryAddressVisible, this,
								[this.getDetailId("DeliveryAddressDetail"),
									this.getDetailId("AddressSelectionDetailResultsTab")]);
						this.sandbox.subscribe("UpdateOrderAddress", this.onUpdateAddress, this,
							[this.getDetailId("DeliveryAddressDetail"),
								this.getDetailId("AddressSelectionDetailResultsTab")]);
					},

					/**
					 * Обновляет итоги на на детали "Продукты".
					 */
					updateOrderProductSummary: function() {
						this.sandbox.publish("UpdateOrderProductSummary", null,
							[this.getDetailId("ProductInProductsTab"), this.getDetailId("ProductInResultsTab")]);
					},

					/**
					 * Обновляет деталь "Адрес доставки".
					 */
					updateDeliveryAddresses: function() {
						this.updateDetail({detail: "DeliveryAddressDetail"});
						this.updateDetail({detail: "AddressSelectionDetailResultsTab"});
					},

					/**
					 * Устанавливает адрес доставки заказа.
					 * @private
					 * @param {Object} config Информация для обновления адреса доставки. Содержит следующие параметры:
					 * @param {String} config.senderId Идентификатор детали который отправил сообщение.
					 * @param {String} config.deliveryAddress Адрес доставки.
					 */
					onUpdateAddress: function(config) {
						var detailIds = [
							this.getDetailId("DeliveryAddressDetail"),
							this.getDetailId("AddressSelectionDetailResultsTab")
						];
						var position = detailIds.indexOf(config.senderId);
						detailIds.splice(position, 1);
						this.set("DeliveryAddress", config.deliveryAddress);
						this.sandbox.publish("SetActiveAddress", config.deliveryAddress, detailIds);
					}
				},
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "merge",
						"name": "TabsContainer",
						"values": {
							"wrapClass": ["order-tabs-container"]
						}
					},
					{
						"operation": "insert",
						"name": "OrderProductTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"index": 0,
						"values": {
							"caption": {"bindTo": "Resources.Strings.OrderProduct"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "OrderDeliveryTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.OrderDelivery"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "OrderResultsTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.OrderResults"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderResultsTab",
						"propertyName": "items",
						"name": "ProductInResultsTab",
						"index": 0,
						"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
					},
					{
						"operation": "insert",
						"parentName": "OrderResultsTab",
						"name": "OrderResultsDeliveryAndPaymentControlBlock",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"caption": {"bindTo": "Resources.Strings.DeliveryAndPaymentGroupCaption"},
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderResultsDeliveryAndPaymentControlBlock",
						"propertyName": "items",
						"name": "OrderPageDeliveryAndPaymentBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageDeliveryAndPaymentBlock",
						"propertyName": "items",
						"name": "DeliveryTypeResult",
						"values": {
							"bindTo": "DeliveryType",
							"dataValueType": Terrasoft.DataValueType.ENUM,
							"layout": {"column": 0, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageDeliveryAndPaymentBlock",
						"propertyName": "items",
						"name": "PaymentTypeResult",
						"values": {
							"bindTo": "PaymentType",
							"dataValueType": Terrasoft.DataValueType.ENUM,
							"layout": {"column": 12, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderResultsTab",
						"propertyName": "items",
						"name": "AddressSelectionDetailResultsTab",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL,
							"visible": {"bindTo": "getDeliveryAddressVisible"}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderResultsTab",
						"name": "OrderReceiverInformationResultsControlBlock",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"caption": {"bindTo": "Resources.Strings.OrderReceiverInformationGroupCaption"},
							"items": [],
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderReceiverInformationResultsControlBlock",
						"propertyName": "items",
						"name": "OrderReceiverInformationResultsBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderReceiverInformationResultsBlock",
						"propertyName": "items",
						"name": "ContactNumberResultsBlock",
						"values": {
							"bindTo": "ContactNumber",
							"layout": {"column": 0, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderReceiverInformationResultsBlock",
						"propertyName": "items",
						"name": "ReceiverNameResultsBlock",
						"values": {
							"bindTo": "ReceiverName",
							"layout": {"column": 0, "row": 1, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderReceiverInformationResultsBlock",
						"propertyName": "items",
						"name": "CommentResultsBlock",
						"values": {
							"bindTo": "Comment",
							"layout": {"column": 0, "row": 2, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderGeneralInformationTab",
						"propertyName": "items",
						"name": "OrderPageGeneralInformationBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageGeneralInformationBlock",
						"propertyName": "items",
						"name": "Number",
						"values": {
							"bindTo": "Number",
							"layout": {"column": 0, "row": 0, "colSpan": 12},
							"enabled": false
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageGeneralInformationBlock",
						"propertyName": "items",
						"name": "Date",
						"values": {
							"bindTo": "Date",
							"layout": {"column": 12, "row": 0, "colSpan": 12},
							"dataValueType": Terrasoft.DataValueType.DATE
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageGeneralInformationBlock",
						"propertyName": "items",
						"name": "SourceOrder",
						"values": {
							"bindTo": "SourceOrder",
							"layout": {"column": 12, "row": 1, "colSpan": 12},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "Amount",
						"values": {
							"bindTo": "Amount",
							"layout": {"column": 12, "row": 0, "colSpan": 12},
							"primaryAmount": "PrimaryAmount",
							"currency": "Currency",
							"rate": "CurrencyRate",
							"primaryAmountEnabled": false,
							"enabled": false,
							"generator": "MultiCurrencyEditViewGenerator.generate"
						}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "PaymentAmount",
						"values": {
							"bindTo": "PaymentAmount",
							"layout": {"column": 12, "row": 1, "colSpan": 12},
							"primaryAmount": "PrimaryPaymentAmount",
							"currency": "Currency",
							"rate": "CurrencyRate",
							"primaryAmountEnabled": false,
							"enabled": false,
							"generator": "MultiCurrencyEditViewGenerator.generate"
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageGeneralInformationBlock",
						"propertyName": "items",
						"name": "DueDate",
						"values": {
							"bindTo": "DueDate",
							"layout": {"column": 0, "row": 2, "colSpan": 12},
							"dataValueType": Terrasoft.DataValueType.DATE
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageGeneralInformationBlock",
						"propertyName": "items",
						"name": "ActualDate",
						"values": {
							"bindTo": "ActualDate",
							"layout": {"column": 12, "row": 2, "colSpan": 12},
							"dataValueType": Terrasoft.DataValueType.DATE
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageGeneralInformationBlock",
						"propertyName": "items",
						"name": "PaymentStatus",
						"values": {
							"bindTo": "PaymentStatus",
							"layout": {"column": 0, "row": 3, "colSpan": 12},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageGeneralInformationBlock",
						"propertyName": "items",
						"name": "DeliveryStatus",
						"values": {
							"bindTo": "DeliveryStatus",
							"layout": {"column": 12, "row": 3, "colSpan": 12},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageGeneralInformationBlock",
						"propertyName": "items",
						"name": "Owner",
						"values": {
							"bindTo": "Owner",
							"layout": {"column": 0, "row": 4, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"name": "OrderHistoryTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.OrderHistoryTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "OrderGeneralInformationTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.OrderGeneralInformationTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "OrderVisaTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.OrderVisaTabCaption"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderVisaTab",
						"name": "OrderPageVisaTabContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderVisaTab",
						"propertyName": "items",
						"name": "Visa",
						"lableConfig": {"visible": false},
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageVisaTabContainer",
						"propertyName": "items",
						"name": "OrderPageVisaBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"name": "FileNotesTab",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {"bindTo": "Resources.Strings.FileNotes"},
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderHistoryTab",
						"name": "OrderPageHistoryTabContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageHistoryTabContainer",
						"propertyName": "items",
						"name": "Activities",
						"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageHistoryTabContainer",
						"propertyName": "items",
						"name": "Document",
						"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
					},
					{
						"operation": "insert",
						"parentName": "OrderPageHistoryTabContainer",
						"propertyName": "items",
						"name": "Invoice",
						"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "Account",
						"values": {
							"bindTo": "Account",
							"layout": {"column": 0, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "Contact",
						"values": {
							"bindTo": "Contact",
							"layout": {"column": 0, "row": 1, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"name": "Status",
						"values": {
							"bindTo": "Status",
							"layout": {"column": 0, "row": 2, "colSpan": 12},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderProductTab",
						"propertyName": "items",
						"name": "ProductInProductsTab",
						"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
					},
					{
						"operation": "insert",
						"parentName": "FileNotesTab",
						"propertyName": "items",
						"name": "Files",
						"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
					},
					{
						"operation": "insert",
						"name": "NotesControlGroup",
						"parentName": "FileNotesTab",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"caption": {"bindTo": "Resources.Strings.NotesGroupCaption"},
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "NotesControlGroup",
						"propertyName": "items",
						"name": "Notes",
						"values": {
							"contentType": Terrasoft.ContentType.RICH_TEXT,
							"layout": {"column": 0, "row": 0, "colSpan": 24},
							"labelConfig": {"visible": false},
							"controlConfig": {
								"imageLoaded": {"bindTo": "insertImagesToNotes"},
								"images": {"bindTo": "NotesImagesCollection"}
							}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderDeliveryTab",
						"name": "OrderDeliveryInformationControlBlock",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderDeliveryInformationControlBlock",
						"propertyName": "items",
						"name": "OrderDeliveryInformationBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderDeliveryInformationBlock",
						"propertyName": "items",
						"name": "DeliveryType",
						"values": {
							"bindTo": "DeliveryType",
							"dataValueType": Terrasoft.DataValueType.ENUM,
							"layout": {"column": 0, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderDeliveryInformationBlock",
						"propertyName": "items",
						"name": "PaymentType",
						"values": {
							"bindTo": "PaymentType",
							"dataValueType": Terrasoft.DataValueType.ENUM,
							"layout": {"column": 12, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderDeliveryTab",
						"propertyName": "items",
						"name": "DeliveryAddressDetail",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL,
							"visible": {"bindTo": "getDeliveryAddressVisible"}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderDeliveryTab",
						"name": "OrderReceiverInformationControlBlock",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"caption": {"bindTo": "Resources.Strings.OrderReceiverInformationGroupCaption"},
							"items": [],
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderReceiverInformationControlBlock",
						"propertyName": "items",
						"name": "OrderReceiverInformationBlock",
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderReceiverInformationBlock",
						"propertyName": "items",
						"name": "ContactNumber",
						"values": {
							"bindTo": "ContactNumber",
							"layout": {"column": 0, "row": 0, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderReceiverInformationBlock",
						"propertyName": "items",
						"name": "ReceiverName",
						"values": {
							"bindTo": "ReceiverName",
							"layout": {"column": 0, "row": 1, "colSpan": 12}
						}
					},
					{
						"operation": "insert",
						"parentName": "OrderReceiverInformationBlock",
						"propertyName": "items",
						"name": "Comment",
						"values": {
							"bindTo": "Comment",
							"layout": {"column": 0, "row": 2, "colSpan": 12}
						}
					}
				]/**SCHEMA_DIFF*/,
				rules: {
					"Contact": {
						"FiltrationContactByAccount": {
							"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
							"autocomplete": true,
							"autoClean": true,
							"baseAttributePatch": "Account",
							"comparisonType": Terrasoft.ComparisonType.EQUAL,
							"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							"attribute": "Account"
						}
					}
				}
			};
		});
