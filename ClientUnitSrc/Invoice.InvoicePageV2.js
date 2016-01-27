define("InvoicePageV2", ["BaseFiltersGenerateModule", "BusinessRuleModule", "ConfigurationConstants",
		"InvoiceConfigurationConstants", "MoneyModule", "VisaHelper", "VwInvoiceProduct",
		"css!VisaHelper", "MultiCurrencyEdit", "MultiCurrencyEditUtilities", "ProductEntryPageUtils"],
	function(BaseFiltersGenerateModule, BusinessRuleModule, ConfigurationConstants, InvoiceConfigurationConstants,
			MoneyModule, VisaHelper, VwInvoiceProduct) {
		return {
			entitySchemaName: "Invoice",
			mixins: {
				ProductEntryPageUtils: "Terrasoft.ProductEntryPageUtils",

				/**
				 * Миксин управления мультивалютностью в карточке редактирования.
				 */
				MultiCurrencyEditUtilities: "Terrasoft.MultiCurrencyEditUtilities"
			},
			messages: {
				/**
				 * @message GetColumnsValues
				 * Возвращает значения переданных колонок. Параметр - массив идентификаторов колонок.
				 */
				"GetColumnsValues": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			attributes: {
				/**
				 * Признак редактируемости поля Заказ
				 */
				"OrderEnabled": false,

				/**
				* Платежные реквизиты клиента
				*/
				"CustomerBillingInfo": {
					dependencies: [
						{
							columns: ["Account"],
							methodName: "clearBillingInfo"
						}
					]
				},
				/**
				* Платежные реквизиты поставщика
				*/
				"SupplierBillingInfo": {
					dependencies: [
						{
							columns: ["Supplier"],
							methodName: "clearBillingInfo"
						}
					]
				},
				/**
				 * Валюта
				 */
				"Currency": {
					dataValueType: Terrasoft.DataValueType.FLOAT,
					lookupListConfig: {
						columns: ["Division"]
					}
				},
				/**
				* Курс
				*/
				"CurrencyRate": {
					dataValueType: Terrasoft.DataValueType.FLOAT,
					dependencies: [
						{
							columns: ["Currency"],
							methodName: "setCurrencyRate"
						}
					]
				},
				/**
				* Сумма
				*/
				"Amount": {
					dataValueType: Terrasoft.DataValueType.FLOAT,
					dependencies: [
						{
							columns: ["Amount"],
							methodName: "recalculatePrimaryAmount"
						}
					]
				},
				/**
				* Дата напоминания ответственному
				*/
				"RemindToOwnerDate": {
					dataValueType: Terrasoft.DataValueType.DATE_TIME,
					dependencies: [
						{
							columns: ["RemindToOwner"],
							methodName: "remindToOwnerDateOnChange"
						}
					]
				},
				/**
				* Дата выставления
				*/
				"StartDate": {
					dataValueType: Terrasoft.DataValueType.DATE,
					dependencies: [
						{
							columns: ["StartDate"],
							methodName: "onStartDateAttributeChange"
						}
					]
				},
				/**
				* Дата оплаты
				*/
				"DueDate": {
					dataValueType: Terrasoft.DataValueType.DATE,
					dependencies: [
						{
							columns: ["PaymentStatus"],
							methodName: "setDueDate"
						}
					]
				},

				/**
				 * Флаг изменения типа валюты
				 */
				"IsCurrencyRateChange": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: false
				},
				/**
				 * Сумма оплаты
				 */
				"PaymentAmount": {
					dataValueType: Terrasoft.DataValueType.FLOAT,
					dependencies: [
						{
							columns: ["CurrencyRate"],
							methodName: "recalculatePaymentAmount"
						}
					]
				},
				/**
				 * Сумма оплаты, б.в.
				 */
				"PrimaryPaymentAmount": {
					dataValueType: Terrasoft.DataValueType.FLOAT,
					dependencies: [
						{
							columns: ["PaymentAmount"],
							methodName: "recalculatePrimaryPaymentAmount"
						}
					]
				},
				/**
				 * Ответственный.
				 */
				"Owner": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					lookupListConfig: {filter: BaseFiltersGenerateModule.OwnerFilter}
				},
				/**
				 * Доступность полей Amount и PrimaryAmount.
				 */
				"AmountEnabled": {
					"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"dataValueType": this.Terrasoft.DataValueType.BOOLEAN,
					"value": false
				}
			},
			details: /**SCHEMA_DETAILS*/{
				Activities: {
					schemaName: "ActivityDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "Invoice"
					},
					defaultValues: {
						Account: {masterColumn: "Account"},
						Contact: {masterColumn: "Contact"}
					}
				},
				InvoiceProduct: {
					schemaName: "InvoiceProductDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "Invoice"
					},
					subscriber: function() {
						this.updateAmount();
						this.setAmountEnabled();
					}
				},
				Visa: {
					schemaName: "VisaDetailV2",
					entitySchemaName: "InvoiceVisa",
					filter: {
						masterColumn: "Id",
						detailColumn: "Invoice"
					}
				},
				Files: {
					schemaName: "FileDetailV2",
					entitySchemaName: "InvoiceFile",
					filter: {
						masterColumn: "Id",
						detailColumn: "Invoice"
					}
				},
				EntityConnections: {
					schemaName: "EntityConnectionsDetailV2",
					entitySchemaName: "EntityConnection",
					filter: {
						masterColumn: "Id",
						detailColumn: "SysModuleEntity"
					}
				}
			}/**SCHEMA_DETAILS*/,
			methods: {

				/**
				 * @inheritdoc Terrasoft.BasePageV2#init
				 * @overridden
				 */
				init: function() {
					this.mixins.MultiCurrencyEditUtilities.init.call(this);
					this.callParent(arguments);
				},

				/**
				 * Возвращает коллекцию действий карточки.
				 * @protected
				 * @overridden
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий карточки
				 */
				getActions: function() {
					var actionMenuItems = this.callParent(arguments);
					actionMenuItems.addItem(this.getActionsMenuItem({
						Type: "Terrasoft.MenuSeparator",
						Caption: ""
					}));
					actionMenuItems.addItem(this.getActionsMenuItem({
						"Caption": VisaHelper.resources.localizableStrings.SendToVisaCaption,
						"Tag": VisaHelper.SendToVisaMenuItem.methodName,
						"Enabled": {"bindTo": "canEntityBeOperated"}
					}));
					return actionMenuItems;
				},

				/**
				 * @inheritDoc Terrasoft.BasePageV2#onEntityInitialized
				 * @overridden
				 */
				onEntityInitialized: function() {
					if (this.isAddMode() || this.isCopyMode()) {
						this.getIncrementCode(function(responce) {
							this.set("Number", responce);
						});
					}
					this.callParent(arguments);
					this.setAmountEnabled();
				},

				/**
				 * Метод ищет шаг заказа.
				 * @private
				 */
				setAmountEnabled: function() {
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "InvoiceProduct"
					});
					esq.addAggregationSchemaColumn("Id",
						Terrasoft.AggregationType.COUNT, "ProductsCount");
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Invoice",  this.get("Id")));
					esq.getEntityCollection(function(response) {
						if (response.success) {
							var collection = response.collection;
							if (collection && collection.getByIndex(0)) {
								this.set("AmountEnabled", (collection.getByIndex(0).get("ProductsCount") === 0));
							}
						}
					}, this);
				},

				/**
				* Срабатывает, когда изменилась дата выставления
				* @private
				*/
				onStartDateAttributeChange: function() {
					var currency = this.get("Currency");
					this.Terrasoft.SysSettings.querySysSettingsItem("PrimaryCurrency", function(primaryCurrency) {
						if (!currency) {
							return;
						}
						if (currency.value !== primaryCurrency.value && !this.Ext.isEmpty(this.get("StartDate")) &&
								!this.Ext.isEmpty(currency.value)) {
							this.showConfirmationDialog(this.get("Resources.Strings.CurrencyRateDateQuestion"),
								function(returnCode) {
									if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
										this.setCurrencyRate();
									}
								}, ["yes", "no"]);
						} else {
							this.setCurrencyRate();
						}
					}, this);
				},

				/**
				 * Устанавливает курс валюты.
				 * Пересчитывает значение "Amount" на основании текущего "PrimaryAmount".
				 * @protected
				 */
				setCurrencyRate: function() {
					this.set("ShowSaveButton", true);
					this.set("ShowDiscardButton", true);
					this.set("IsChanged", true, {silent: true});
					MoneyModule.LoadCurrencyRate.call(this, "Currency", "CurrencyRate", this.get("StartDate"), function() {
						this.recalculateAmount();
						this.recalculatePaymentAmount();
					});
				},

				/**
				 * Возвращает коэффициент деления.
				 * @protected
				 */
				getCurrencyDivision: function() {
					var currency = this.get("Currency");
					return currency && currency.Division;
				},

				/**
				 * Рассчитывает сумму (Amount).
				 * @protected
				 */
				recalculateAmount: function() {
					var division = this.getCurrencyDivision();
					this.set("IsAmountCalculated", true);
					MoneyModule.RecalcCurrencyValue.call(this, "CurrencyRate", "Amount", "PrimaryAmount", division);
					this.set("IsAmountCalculated", false);
				},

				/**
				 * Рассчитывает сумму, б.в. (PrimaryAmount).
				 * @protected
				 */
				recalculatePrimaryAmount: function() {
					var isAutoCalculated = this.get("IsAmountCalculated");
					if (!isAutoCalculated) {
						var division = this.getCurrencyDivision();
						MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "Amount", "PrimaryAmount", division);
					}
				},

				/**
				 * Рассчитать сумму оплаты.
				 * @protected
				 */
				recalculatePaymentAmount: function() {
					var division = this.getCurrencyDivision();
					this.set("IsPaymentAmountCalculated", true);
					MoneyModule.RecalcCurrencyValue.call(this, "CurrencyRate", "PaymentAmount", "PrimaryPaymentAmount",
						division);
					this.set("IsPaymentAmountCalculated", false);
				},

				/**
				 * Рассчитать сумму оплаты, б.в.
				 * @protected
				 */
				recalculatePrimaryPaymentAmount: function() {
					var isAutoCalculated = this.get("IsPaymentAmountCalculated");
					if (!isAutoCalculated) {
						var division = this.getCurrencyDivision();
						MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "PaymentAmount", "PrimaryPaymentAmount",
							division);
					}
				},

				/**
				* Срабатывает, когда изменилась дата напоминания ответственному
				* @protected
				*/
				remindToOwnerDateOnChange: function() {
					if (this.get("RemindToOwner")) {
						var currentDateTime = this.getSysDefaultValue(Terrasoft.SystemValueType.CURRENT_DATE_TIME);
						currentDateTime.setDate(currentDateTime.getDate() + 1);
						var startDateTime = this.get("StartDate");
						if (!this.Ext.isEmpty(startDateTime) && startDateTime > currentDateTime) {
							this.set("RemindToOwnerDate", startDateTime);
						} else {
							this.set("RemindToOwnerDate", currentDateTime);
						}
					} else {
						this.set("RemindToOwnerDate", null);
					}
				},

				/**
				* Проставляет дату оплаты
				* @protected
				*/
				setDueDate: function() {
					var paymentStatus = this.get("PaymentStatus");
					if (this.Ext.isEmpty(paymentStatus) ||
						(paymentStatus.value !== InvoiceConfigurationConstants.Invoice.PaymentStatus.PartiallyPaid &&
							paymentStatus.value !== InvoiceConfigurationConstants.Invoice.PaymentStatus.Paid)) {
						this.set("DueDate", null);
					} else {
						this.set("DueDate", this.getSysDefaultValue(Terrasoft.SystemValueType.CURRENT_DATE_TIME));
					}
					if (paymentStatus && paymentStatus.value === InvoiceConfigurationConstants.Invoice.PaymentStatus.Paid) {
						this.set("PaymentAmount", this.get("Amount"));
					}
				},

				/**
				* Проверяет заполненость полей "Контакт" или "Контрагент" значениями
				* @param {Function} callback
				* @param {Object} scope
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
				 * Проверяет заполненость поля "Курс" значением
				 * @param {Function} callback
				 * @param {Object} scope
				 */
				validateCurrencyRateFilling: function(callback, scope) {
					var result = {
						success: true
					};
					var currencyRate = this.get("CurrencyRate");
					if (this.Ext.isEmpty(currencyRate) || currencyRate <= 0) {
						result.message = this.get("Resources.Strings.RequiredCurrencyRateMessage");
						result.success = false;
					}
					callback.call(scope || this, result);
				},

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
							checkResponse,
							function(context) {
								context.scope.validateCurrencyRateFilling(function(response) {
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
				 * Действие "Отправить на визирование"
				 */
				sendToVisa: VisaHelper.SendToVisaMethod,

				/**
				 * Очистить значения платежных реквизитов поставщика и клиента
				 * @protected
				 */
				clearBillingInfo: function() {
					if (this.Ext.isEmpty(this.get("Account"))) {
						this.set("CustomerBillingInfo", null);
					}
					if (this.Ext.isEmpty(this.get("Supplier"))) {
						this.set("SupplierBillingInfo", null);
					}
				},

				/**
				 * Копирование продуктов
				 * @private
				 * @param {Terrasoft.Collection} sourceEntityItems Продукты для копирования.
				 * @param {Function} callback Метод обратного вызова.
				 */
				copyInvoiceProducts: function(sourceEntityItems, callback) {
					var batchQuery = this.Ext.create("Terrasoft.BatchQuery");
					sourceEntityItems.each(function(entity) {
						var insertQuery = this.Ext.create("Terrasoft.InsertQuery", {
							rootSchemaName: "InvoiceProduct"
						});
						delete entity.columns.Id;
						this.Terrasoft.each(entity.columns, function(column) {
							if (column.columnPath === "Invoice") {
								insertQuery.setParameterValue(column.columnPath, this.get("Id"),
									column.dataValueType);
							} else {
								if (!this.Ext.isEmpty(entity.get(column.columnPath))) {
									insertQuery.setParameterValue(column.columnPath,
										entity.get(column.columnPath), column.dataValueType);
								}
							}
						}, this);
						batchQuery.add(insertQuery);
					}, this);
					batchQuery.execute(callback, this);
				},

				/**
				 * Заполнение колонок при копировании счета и копирование продуктов
				 * @private
				 */
				setCopyColumnValues: function(entity) {
					this.callParent(arguments);
					var parentId = entity.get("Id");
					this.set("ParentInvoiceId", parentId);
					var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "InvoiceProduct"
					});
					select.rowCount = 1;
					select.filters.add("InvoiceId", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "Invoice", parentId));
					select.getEntityCollection(function(responce) {
						if (responce.collection.getCount() !== 0) {
							this.showConfirmationDialog(this.get("Resources.Strings.CopyProductsQuestion"),
								function(returnCode) {
									if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
										this.saveEntity(this.prepareProductCopy, this);
									} else {
										this.set("Amount", 0);
										this.set("PrimaryAmount", 0);
										this.set("PaymentAmount", 0);
										this.set("PrimaryPaymentAmount", 0);
									}
								}, ["yes", "no"]);
						}
					}, this);
				},

				/**
				 * callback - функция, запускает процесс копирования после сохранения счета
				 * @private
				 */
				prepareProductCopy: function() {
					var parentId = this.get("ParentInvoiceId");
					var schema = VwInvoiceProduct;
					var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchema: schema
					});
					select.filters.add("InvoiceId", Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "Invoice", parentId));
					this.Terrasoft.each(schema.columns, function(item) {
						if (item.isValueCloneable) {
							select.addColumn(item.name);
						}
					});
					select.getEntityCollection(function(responce) {
						var entityCollection = responce.collection;
						if (entityCollection.getCount() === 0) {
							return;
						}
						this.copyInvoiceProducts(entityCollection, this.onProductsCopied);
					}, this);
				},

				/**
				 * Обработка результатов запроса на копирование продуктов
				 * @private
				 */
				onProductsCopied: function(responce) {
					if (responce.ResponseStatus) {
						this.showInformationDialog(this.Ext.String.format(
							this.get("Resources.Strings.CopyProductsError"), responce.ResponseStatus.Message));
						return;
					}
					this.sendSaveCardModuleResponse(responce.success);
				},

				/**
				 * @inheritDoc Terrasoft.BasePageV2#saveEntityInChain
				 * @overridden
				 */
				saveEntityInChain: function(next) {
					var callback = this.updateAmountAfterSave.bind(this, "InvoiceProduct", next);
					this.callParent([callback]);
				}
			},
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
				},
				"CustomerBillingInfo": {
					"FiltrationCustomerBillingInfoByAccount": {
						"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
						"baseAttributePatch": "Account",
						"autocomplete": true,
						"autoClean": true,
						"comparisonType": Terrasoft.ComparisonType.EQUAL,
						"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						"attribute": "Account"
					},
					"BindParameterEnabledCustomerBillingInfoToAccount": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "Account"
								},
								"comparisonType": Terrasoft.ComparisonType.IS_NOT_NULL
							}
						]
					}
				},
				"SupplierBillingInfo": {
					"FiltrationSupplierBillingInfoByAccount": {
						"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
						"baseAttributePatch": "Account",
						"autocomplete": true,
						"autoClean": true,
						"comparisonType": Terrasoft.ComparisonType.EQUAL,
						"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						"attribute": "Supplier"
					},
					"BindParameterEnabledSupplierBillingInfoToSupplier": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "Supplier"
								},
								"comparisonType": Terrasoft.ComparisonType.IS_NOT_NULL
							}
						]
					}
				},
				"Order": {
					"EnableOrderByOrderEnabled": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "OrderEnabled"
								},
								"comparisonType": Terrasoft.ComparisonType.EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": true
								}
							}
						]
					}
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "GeneralInfoTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.GeneralInfoTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "InvoiceProductsTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.InvoiceProductsTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "InvoiceVisaTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.InvoiceVisaTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "InvoiceHistoryTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.InvoiceHistoryTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "InvoiceFileNotesTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.InvoiceFileNotesTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
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
					"parentName": "Header",
					"propertyName": "items",
					"name": "StartDate",
					"values": {
						"bindTo": "StartDate",
						"caption": {"bindTo": "Resources.Strings.StartDateCaption"},
						"layout": {"column": 12, "row": 0, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Owner",
					"values": {
						"bindTo": "Owner",
						"layout": {"column": 0, "row": 1, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoTab",
					"name": "InvoicePageGeneralTabContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoiceProductsTab",
					"name": "InvoicePageProductsTabContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoiceVisaTab",
					"name": "InvoicePageVisaTabContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoiceVisaTab",
					"propertyName": "items",
					"name": "Visa",
					"lableConfig": {"visible": false},
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoiceLineTab",
					"name": "InvoicePageLineTabContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoiceHistoryTab",
					"name": "InvoicePageHistoryTabContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageHistoryTabContainer",
					"propertyName": "items",
					"name": "Activities",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoiceProductsTab",
					"propertyName": "items",
					"name": "InvoiceProduct",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoiceFileNotesTab",
					"name": "InvoicePageFileNotesTabContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},

				{
					"operation": "insert",
					"parentName": "InvoicePageGeneralTabContainer",
					"name": "GeneralInfoControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"controlConfig": {
							"collapsed": false
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageGeneralTabContainer",
					"name": "SumControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.SumGroupCaption"},
						"items": [],
						"controlConfig": {
							"collapsed": false
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageGeneralTabContainer",
					"name": "PaymentControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.PaymentGroupCaption"},
						"items": [],
						"controlConfig": {
							"collapsed": false
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageGeneralTabContainer",
					"propertyName": "items",
					"name": "EntityConnections",
					"values": {
						itemType: Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageGeneralTabContainer",
					"name": "RemindControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.RemindControlGroupCaption"},
						"controlConfig": {
							"collapsed": false
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoControlGroup",
					"propertyName": "items",
					"name": "InvoicePageGeneralBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "SumControlGroup",
					"propertyName": "items",
					"name": "InvoicePageSumBlock",

					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "PaymentControlGroup",
					"propertyName": "items",
					"name": "InvoicePagePaymentBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "RemindControlGroup",
					"propertyName": "items",
					"name": "InvoicePageRemindControlBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageProductsTabContainer",
					"propertyName": "items",
					"name": "InvoicePageProductsBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageVisaTabContainer",
					"propertyName": "items",
					"name": "InvoicePageVisaBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageLineTabContainer",
					"propertyName": "items",
					"name": "InvoicePageLineBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageHistoryTabContainer",
					"propertyName": "items",
					"name": "InvoicePageHistoryBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},

				{
					"operation": "insert",
					"parentName": "InvoicePageGeneralBlock",
					"propertyName": "items",
					"name": "Account",
					"values": {
						"bindTo": "Account",
						"layout": {"column": 0, "row": 1, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageGeneralBlock",
					"propertyName": "items",
					"name": "Contact",
					"values": {
						"bindTo": "Contact",
						"layout": {"column": 0, "row": 2, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageGeneralBlock",
					"propertyName": "items",
					"name": "Supplier",
					"values": {
						"bindTo": "Supplier",
						"layout": {"column": 0, "row": 3, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageGeneralBlock",
					"propertyName": "items",
					"name": "CustomerBillingInfo",
					"values": {
						"bindTo": "CustomerBillingInfo",
						"layout": {"column": 12, "row": 1, "colSpan": 12},
						"caption": {"bindTo": "Resources.Strings.ClientDetails"},
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageGeneralBlock",
					"propertyName": "items",
					"name": "SupplierBillingInfo",
					"values": {
						"bindTo": "SupplierBillingInfo",
						"layout": {"column": 12, "row": 3, "colSpan": 12},
						"caption": {"bindTo": "Resources.Strings.SupplierDetails"},
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageSumBlock",
					"name": "Amount",
					"propertyName": "items",
					"values": {
						"bindTo": "Amount",
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"primaryAmount": "PrimaryAmount",
						"currency": "Currency",
						"rate": "CurrencyRate",
						"enabled": {"bindTo": "AmountEnabled"},
						"primaryAmountEnabled": false,
						"generator": "MultiCurrencyEditViewGenerator.generate"
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePagePaymentBlock",
					"name": "PaymentStatus",
					"propertyName": "items",
					"values": {
						"bindTo": "PaymentStatus",
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePagePaymentBlock",
					"propertyName": "items",
					"name": "DueDate",
					"values": {
						"bindTo": "DueDate",
						"layout": {"column": 12, "row": 0, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePagePaymentBlock",
					"propertyName": "items",
					"name": "PaymentAmount",
					"values": {
						"bindTo": "PaymentAmount",
						"layout": {"column": 0, "row": 1, "colSpan": 12},
						"primaryAmount": "PrimaryPaymentAmount",
						"currency": "Currency",
						"rate": "CurrencyRate",
						"primaryAmountEnabled": false,
						"generator": "MultiCurrencyEditViewGenerator.generate"
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageRemindControlBlock",
					"propertyName": "items",
					"name": "RemindToOwner",
					"values": {
						"bindTo": "RemindToOwner",
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 12
						},
						"labelConfig": {
							"caption": {"bindTo": "Resources.Strings.RemindToOwnerCaption"}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoicePageRemindControlBlock",
					"propertyName": "items",
					"name": "RemindToOwnerDate",
					"values": {
						"bindTo": "RemindToOwnerDate",
						"layout": {
							"column": 12,
							"row": 0,
							"colSpan": 12
						},
						"labelConfig": {
							"caption": {"bindTo": "Resources.Strings.RemindDateCaption"}
						},
						"controlConfig": {
							"enabled": {"bindTo": "RemindToOwner"}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoiceFileNotesTab",
					"propertyName": "items",
					"name": "Files",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"name": "InvoiceNotesControlGroup",
					"parentName": "InvoiceFileNotesTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"caption": {"bindTo": "Resources.Strings.NotesGroupCaption"},
						"controlConfig": {
							"collapsed": false
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "InvoiceNotesControlGroup",
					"propertyName": "items",
					"name": "Notes",
					"values": {
						"contentType": Terrasoft.ContentType.RICH_TEXT,
						"layout": {"column": 0, "row": 0, "colSpan": 24},
						"labelConfig": {
							"visible": false
						},
						"controlConfig": {
							"imageLoaded": {
								"bindTo": "insertImagesToNotes"
							},
							"images": {
								"bindTo": "NotesImagesCollection"
							}
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
