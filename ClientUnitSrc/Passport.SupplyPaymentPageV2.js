define("SupplyPaymentPageV2", ["terrasoft", "BusinessRuleModule", "ConfigurationConstants", "MoneyModule",
		"SupplyPaymentGridButtonsUtility", "ConfigurationEnums", "LookupUtilities",
		"SupplyPaymentProductDetailModalBox", "OrderUtilities"],
	function(Terrasoft, BusinessRuleModule, ConfigurationConstants, MoneyModule, GridButtonsUtil) {
		return {
			entitySchemaName: "SupplyPaymentElement",
			messages: {
				/**
				 * Обновление плановой суммы после изменения записи на детали продукты.
				 */
				"UpdateAmountPlan": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			mixins: {
				OrderUtilities: "Terrasoft.OrderUtilities"
			},
			attributes: {
				/**
				 * Кратность валюты.
				 */
				"Currency": {
					caption: {"bindTo": "Resources.Strings.Currency"},
					dataValueType: this.Terrasoft.DataValueType.LOOKUP,
					referenceSchemaName: "Currency"
				},

				/**
				 * Курс.
				 */
				"CurrencyRate": {
					caption: {"bindTo": "Resources.Strings.CurrencyRate"},
					dataValueType: this.Terrasoft.DataValueType.MONEY
				},

				/**
				 * Сумма план в б.в.
				 */
				"PrimaryAmountPlan": {
					dependencies: [{
						columns: ["AmountPlan", "CurrencyRate"],
						methodName: "recalculatePrimaryAmountPlan"
					}]
				},

				/**
				 * Сумма факт в б.в.
				 */
				"PrimaryAmountFact": {
					dependencies: [{
						columns: ["AmountFact", "CurrencyRate"],
						methodName: "recalculatePrimaryAmountFact"
					}]
				},

				/**
				 * Доступность полей AmountPlan и Percentage.
				 */
				"AmountPlanEnabled": {
					type: this.Terrasoft.ViewModelColumnType.CALCULATED_COLUMN,
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					value: true
				},

				/**
				 * Название.
				 */
				"Name": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					dependencies: [
						{
							columns: ["Type"],
							methodName: "onTypeChanged"
						}
					]
				},

				/**
				 * Отсрочка, дней.
				 */
				"Delay": {
					dataValueType: Terrasoft.DataValueType.INTEGER,
					dependencies: [
						{
							columns: ["DatePlan"],
							methodName: "onDatePlanChanged"
						}
					]
				},

				/**
				 * Плановая дата.
				 */
				"DatePlan": {
					dependencies: [
						{
							columns: ["DelayType"],
							methodName: "onDelayTypeChanged"
						},
						{
							columns: ["Delay"],
							methodName: "onDelayChanged"
						}
					]
				},

				/**
				 * Фактическая дата.
				 */
				"DateFact": {
					dependencies: [
						{
							columns: ["State"],
							methodName: "onStateChanged"
						}
					]
				},

				/**
				 * Тип шага.
				 */
				"Type": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					isRequired: true
				},

				/**
				 * Состояние.
				 */
				"State": {
					dependencies: [
						{
							columns: ["DateFact"],
							methodName: "onDateFactChanged"
						}
					]
				},

				/**
				 * Плановая сумма.
				 */
				"AmountPlan": {
					dependencies: [
						{
							columns: ["Type"],
							methodName: "onTypeChanged"
						},
						{
							columns: ["Percentage"],
							methodName: "onPercentageChanged"
						}
					]
				},

				/**
				 * Доля, %.
				 */
				"Percentage": {
					dependencies: [
						{
							columns: ["AmountPlan"],
							methodName: "onAmountPlanChanged"
						}
					]
				},

				/**
				 * Ссылка на связанный элемент.
				 */
				"PreviousElement": {
					lookupListConfig: {
						hideActions: true,
						columns: ["DatePlan", "DateFact", "State"],
						filters: [
							function() {
								return this.Terrasoft.createColumnFilterWithParameter(
									this.Terrasoft.ComparisonType.NOT_EQUAL, "Id", this.get("Id"));
							}
						]
					},
					dependencies: [
						{
							columns: ["PreviousElement"],
							methodName: "onPreviousElementChanged"
						}
					]
				},

				/**
				 * Общая сумма шагов с типом "Поставка".
				 */
				"SupplyAmount": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.FLOAT
				},

				/**
				 * Общая сумма шагов с типом "Оплата".
				 */
				"PaymentAmount": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.FLOAT
				},

				/**
				 * Плановая дата связанного шага.
				 */
				"LinkedDatePlan": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.DATE
				},

				/**
				 * Фактическая дата связанного шага.
				 */
				"LinkedDateFact": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.DATE
				},

				/**
				 * Состояние связанного шага.
				 */
				"LinkedState": {
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.ENUM
				},

				/**
				 * Количество продуктов в текущем шаге.
				 */
				"ProductsCount": {
					type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
					dataValueType: Terrasoft.DataValueType.INTEGER
				},

				/**
				 * Сумма в текущем заказе.
				 */
				"OrderAmount": {
					type: Terrasoft.ViewModelColumnType.ENTITY_COLUMN,
					dataValueType: Terrasoft.DataValueType.FLOAT
				},

				/**
				 * Курс валюты в заказе.
				 */
				"Order": {
					lookupListConfig: {
						columns: ["Currency", "CurrencyRate", "Currency.Division", "Contact", "Account", "Amount"]
					}
				},

				/**
				 * Счет.
				 */
				"Invoice": {
					lookupListConfig: {
						columns: ["PaymentStatus"]
					}
				}
			},
			methods: {
				/**
				 * @inheritDoc Terrasoft.Configuration.BasePageV2#save
				 * @overridden
				 */
				save: function(config) {
					if (!this.get("ChangeInvoice") && this.changedValues &&
							this.changedValues.hasOwnProperty("AmountPlan")) {
						this.needToChangeInvoice({
								name: "Id",
								id: this.get("Id")
							}, function(result) {
								if (result) {
									this.set("ChangeInvoice", true);
									this.save(config);
								}
							}, this
						);
					} else {
						this.setReloadDetailFlag();
						this.set("ChangeInvoice", false);
						this.callParent(arguments);
					}
				},

				/**
				 * Устанавливает при необходимости флаг перезагрузки реестра детали.
				 * @private
				 */
				setReloadDetailFlag: function() {
					if (this.parentDetailViewModel && !this.Ext.isEmpty(this.changedValues)) {
						var columnsToCheck = this.getColumnsForGridReload();
						this.Terrasoft.each(columnsToCheck, function(column) {
							if (this.changedValues.hasOwnProperty(column)) {
								this.parentDetailViewModel.set("NeedReloadGridData", true);
								return false;
							}
						}, this);
					}
				},

				/**
				 * Возвращает набор названий колонок, при изменении которых, после сохранения шага
				 * необходимо перезагружать реестр детали.
				 * @return {String[]} Массив названий колонок.
				 */
				getColumnsForGridReload: function() {
					return ["Delay", "DatePlan", "DateFact", "Name"];
				},

				/**
				 * Возвращает значение либо с объекта вычитаного с страницы либо с детали.
				 * @private
				 * @param {String} table Имя таблицы.
				 * @param {String} column Имя колонки.
				 * @param {Object} scope контестк.
				 * @return {Object} Возвращает искомый объект.
				 */
				getColumnData: function(table, column, scope) {
					scope = scope || this;
					var path = this.Ext.String.format("{0}.{1}", table, column);
					var tableValue = scope.get(table);
					if (tableValue && tableValue[column]) {
						scope.set(path, tableValue[column]);
					}
					return scope.get(path);
				},

				/**
				 * @inheritDoc Terrasoft.Configuration.BasePageV2#init
				 * @overridden
				 */
				init: function() {
					GridButtonsUtil.init({
						Ext: this.Ext,
						Terrasoft: this.Terrasoft
					});
					this.callParent(arguments);
				},

				/**
				 * @inheritDoc Terrasoft.Configuration.BasePageV2#subscribeSandboxEvents
				 * @overridden
				 */
				subscribeSandboxEvents: function() {
					this.callParent(arguments);
					this.sandbox.subscribe("UpdateAmountPlan", function() {
						this.updateAmountPlan();
					}, this, [this.sandbox.id + "_detail_SupplyPaymentProductSupplyPaymentProduct"]);
				},

				/**
				 * @inheritDoc Terrasoft.Configuration.BaseViewModel#getEntitySchemaQuery
				 * @overridden
				 */
				getEntitySchemaQuery: function() {
					var esq = this.callParent(arguments);
					this.addRequiredEsqColumns(esq);
					if (esq.columns.contains("ProductsCount")) {
						esq.columns.removeByKey("ProductsCount");
					}
					esq.addAggregationSchemaColumn("[SupplyPaymentProduct:SupplyPaymentElement].Id",
						Terrasoft.AggregationType.COUNT, "ProductsCount");
					return esq;
				},

				/**
				 * @inheritdoc Terrasoft.BaseModel#onDataChange
				 * @overridden
				 */
				onDataChange: function() {
					this.callParent(arguments);
					if (this.changedValues) {
						delete this.changedValues.Products;
						delete this.changedValues.Invoice;
					}
				},

				/**
				 * @inheritdoc Terrasoft.BaseViewModel#onDataChange
				 * @overridden
				 */
				validateColumn: function(columnName) {
					if (["Products", "Invoice"].indexOf(columnName) > -1) {
						return true;
					}
					return this.callParent(arguments);
				},

				/**
				 * @inheritdoc Terrasoft.BaseViewModel#loadEntity
				 * @overridden
				 */
				loadEntity: function(primaryColumnValue, callback, scope) {
					this.callParent([primaryColumnValue, function() {
						this.initSupplyPaymentData();
						if (callback) {
							callback.call(scope, this);
						}
					}, this]);
				},

				/**
				 * Добавляет в запрос колонки, используемые для расчетов.
				 * @param {Terrasoft.EntitySchemaQuery} esq Запрос.
				 */
				addRequiredEsqColumns: function(esq) {
					if (!esq.columns.contains("OrderAmount")) {
						esq.addColumn("Order.Amount", "OrderAmount");
					}
				},

				/**
				 * Обновляет плановую сумму по продуктам в шаге.
				 * @private
				 */
				updateAmountPlan: function() {
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SupplyPaymentProduct"
					});
					esq.addAggregationSchemaColumn("Amount", Terrasoft.AggregationType.SUM, "AmountSum");
					var filters = Terrasoft.createFilterGroup();
					filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"SupplyPaymentElement", this.get("Id")));
					esq.filters = filters;
					esq.getEntityCollection(function(response) {
						if (response.success) {
							var collection = response.collection;
							if (collection.getCount() > 0) {
								var amountSum = collection.getByIndex(0).get("AmountSum");
								this.set("AmountPlan", amountSum);
								this.recalculatePrimaryAmountPlan();
								this.save({isSilent: true});
							}
						}
					}, this);
				},

				/**
				 * Обработчик изменения плановой даты.
				 */
				onDatePlanChanged: function() {
					var delayType = this.get("DelayType");
					if (this.get("isWorking") || this.get("isElementChanged") ||
						(delayType.value === ConfigurationConstants.SupplyPayment.Fixed)) {
						return;
					}
					var delayDiff = 0;
					var datePlan = this.get("DatePlan");
					var linkedDatePlan = this.get("LinkedDatePlan");
					var linkedDateFact = this.get("LinkedDateFact");
					var linkedState = this.get("LinkedState");
					if (!this.Ext.isDate(datePlan)) {
						return;
					}
					switch (delayType.value) {
						case ConfigurationConstants.SupplyPayment.FromPlan:
							delayDiff = this.getDaysDifference(datePlan, linkedDatePlan);
							break;
						case ConfigurationConstants.SupplyPayment.FromFact:
							if (this.Ext.isDate(linkedDateFact) &&
								(linkedState.value === ConfigurationConstants.SupplyPayment.StateFinished)) {
								delayDiff = this.getDaysDifference(datePlan, linkedDateFact);
							} else {
								delayDiff = this.getDaysDifference(datePlan, linkedDatePlan);
							}
							break;
					}
					this.set("isWorking", true);
					this.set("Delay", delayDiff > 0 ? delayDiff : 0);
					this.set("isWorking", false);
				},

				/**
				 * Вычисляет разницу в днях между двумя датами.
				 * @param {Date} lastDate Конечная дата.
				 * @param {Date} firstDate Начальная дата.
				 * @return {Number} Количество дней.
				 */
				getDaysDifference: function(lastDate, firstDate) {
					if (this.Ext.isDate(lastDate) && this.Ext.isDate(firstDate)) {
						return Math.round((lastDate.getTime() - firstDate.getTime()) / 86400000);
					}
					return 0;
				},

				/**
				 * Обработчик изменения отсрочки.
				 */
				onDelayChanged: function() {
					var delayType = this.get("DelayType");
					if (this.get("isWorking") || delayType.value === ConfigurationConstants.SupplyPayment.Fixed) {
						return;
					}
					var newDatePlan = 0;
					this.set("isWorking", true);
					var delay = this.get("Delay");
					var linkedDateFact = this.get("LinkedDateFact");
					var linkedDatePlan = this.get("LinkedDatePlan");
					var linkedState = this.get("LinkedState");
					var datePlan = this.get("DatePlan");
					if (!this.Ext.isDate(datePlan)) {
						this.set("isWorking", false);
						return;
					}
					switch (delayType.value) {
						case ConfigurationConstants.SupplyPayment.FromPlan:
							newDatePlan = this.safeCallOnDate(this.Terrasoft.addDays, linkedDatePlan, delay);
							break;
						case ConfigurationConstants.SupplyPayment.FromFact:
							if (this.Ext.isDate(linkedDateFact) &&
								(linkedState.value === ConfigurationConstants.SupplyPayment.StateFinished)) {
								newDatePlan = this.safeCallOnDate(this.Terrasoft.addDays, linkedDateFact, delay);
							} else {
								newDatePlan = this.safeCallOnDate(this.Terrasoft.addDays, linkedDatePlan, delay);
							}
							break;
					}
					this.set("DatePlan", this.safeCallOnDate(this.Terrasoft.addMinutes, newDatePlan, 1));
					this.set("isWorking", false);
				},

				/**
				 * Возвращает результат применения функции к аргументам, если второй аргумент является датой, или null.
				 * @param {Function} func функция для вызова.
				 * @param {Date} date Дата.
				 * @return {Date}
				 */
				safeCallOnDate: function(func, date) {
					if (this.Ext.isDate(date)) {
						return func.apply(this, Array.prototype.slice.call(arguments, 1));
					} else {
						return null;
					}
				},

				/**
				 * Обработчик изменения состояния.
				 */
				onStateChanged: function() {
					var state = this.get("State");
					if ((state.value === ConfigurationConstants.SupplyPayment.StateFinished) &&
						(!this.get("DateFact"))) {
						var currentDate = new Date(Ext.Date.now());
						this.set("DateFact", currentDate);
					}
				},

				/**
				 * Обработчик изменения фактической даты.
				 */
				onDateFactChanged: function() {
					var state = this.get("State");
					if (state.value !== ConfigurationConstants.SupplyPayment.StateFinished) {
						this.loadLookupDisplayValue("State", ConfigurationConstants.SupplyPayment.StateFinished);
					}
				},

				/**
				 * Обработчик изменнения типа отсрочки.
				 */
				onDelayTypeChanged: function() {
					if (!this.get("PreviousElement")) {
						return;
					}
					var linkedDatePlan = 0;
					var delay = this.get("Delay");
					var delayType = this.get("DelayType");
					switch (delayType.value) {
						case ConfigurationConstants.SupplyPayment.FromPlan:
							linkedDatePlan = Terrasoft.addMinutes(this.get("LinkedDatePlan"), 1);
							if (linkedDatePlan) {
								this.set("DatePlan", Terrasoft.addDays(linkedDatePlan, delay));
							}
							break;
						case ConfigurationConstants.SupplyPayment.FromFact:
							var state = this.get("LinkedState");
							linkedDatePlan = this.get("LinkedDatePlan");
							var linkedDateFact = this.get("LinkedDateFact");
							if (state.value === ConfigurationConstants.SupplyPayment.StateFinished) {
								if (linkedDateFact) {
									this.set("DatePlan", Terrasoft.addDays(linkedDateFact, delay));
								}
							} else {
								if (linkedDatePlan) {
									this.set("DatePlan", Terrasoft.addDays(linkedDatePlan, delay));
								}
							}
							break;
					}
				},

				/**
				 * Обработчик изменения типа шага.
				 */
				onTypeChanged: function() {
					this.callParent(arguments);
					if (this.get("IsSeparateMode")) {
						var entityCaption = this.getHeader();
						this.sandbox.publish("InitDataViews", {caption: entityCaption});
					}
					GridButtonsUtil.instance.updateInvoiceValue(this);
					this.setAmountPlanEnabled();
					if (!this.isNewMode()) {
						return;
					}
					var elementType = this.get("Type");
					if (elementType) {
						this.recalcTypedAmountPlan(function() {
							if (elementType.value === ConfigurationConstants.SupplyPayment.TypeSupply) {
								var amountSupply = this.getOrderAmount() - this.get("SupplyAmount");
								if (amountSupply < 0) {
									amountSupply = 0;
								}
								this.set("AmountPlan", amountSupply);
							} else {
								var amountPayment = this.getOrderAmount() - this.get("PaymentAmount");
								if (amountPayment < 0) {
									amountPayment = 0;
								}
								this.set("AmountPlan", amountPayment);
							}
						}, this);
					}
				},

				/**
				 * Обработчик изменения доли.
				 */
				onPercentageChanged: function() {
					if (this.get("isWorking")) {
						return;
					}
					var orderAmount = this.getOrderAmount();
					var percentage = this.get("Percentage") || 0;
					var amountPlan = Math.round(percentage * (orderAmount / 100) * 100) / 100;
					this.set("isWorking", true);
					this.set("AmountPlan", amountPlan);
					this.set("isWorking", false);
					this.recalculatePrimaryAmountPlan();
				},

				/**
				 * Обработчик изменения плановой суммы.
				 */
				onAmountPlanChanged: function() {
					var orderAmount = this.getOrderAmount();
					if (this.get("isWorking") || (orderAmount === 0)) {
						return;
					}
					var amountPlan = this.get("AmountPlan") || 0;
					var percentage = Math.round((amountPlan / orderAmount) * 10000) / 100;
					this.set("isWorking", true);
					this.set("Percentage", percentage);
					this.set("isWorking", false);
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
						this.Terrasoft.chain(
							function(next) {
								this.callWithValidation(next, this.validateAmount);
							},
							function() {
								callback.call(scope, response);
							}, this);
					}, this]);
				},

				/**
				 * @inheritdoc BasePageV2#initActionButtonMenu
				 * @overridden
				 */
				initActionButtonMenu: function() {
					return null;
				},

				/**
				 * Обработчик смены связанного элемента.
				 * @protected
				 * @virtual
				 */
				onPreviousElementChanged: function() {
					this.updatePreviousElementData();
					this.set("isElementChanged", true);
					this.onDelayTypeChanged();
					this.set("isElementChanged", false);
				},

				/**
				 * Обновляет атрибуты LinkedDatePlan, LinkedDateFact, LinkedState
				 * из плановой и фактической дат и состояния предыдущего элемента.
				 */
				updatePreviousElementData: function() {
					var previousElement = this.get("PreviousElement") || {};
					var datePlan = previousElement.DatePlan || this.get("PreviousElement.DatePlan");
					var dateFact = previousElement.DateFact || this.get("PreviousElement.DateFact");
					var state = previousElement.State || this.get("PreviousElement.State");
					this.set("LinkedDatePlan", datePlan, {silent: true});
					this.set("LinkedDateFact", dateFact, {silent: true});
					this.set("LinkedState", state, {silent: true});
				},

				/**
				 * Создаёт Entity Schema Query для связанного шага.
				 */
				createLinkedESQ: function() {
					var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: this.entitySchemaName
					});
					select.addColumn("Id");
					select.addColumn("Name");
					select.addColumn("State");
					select.addColumn("DateFact");
					select.addColumn("AmountPlan");
					select.addColumn("Type");
					var datePlanColumn = select.addColumn("DatePlan");
					datePlanColumn.orderPosition = 0;
					datePlanColumn.orderDirection = this.Terrasoft.OrderDirection.DESC;
					var order = this.get("Order");
					select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
							"Order", order.value));
					select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.NOT_EQUAL,
							"Id", this.get("Id")));
					return select;
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#initEntity
				 * @overridden
				 */
				initEntity: function(callback, scope) {
					this.callParent([function() {
						this.set("IsEntityInitialized", true);
						this.initSupplyPaymentData();
						callback.call(scope || this);
					}, this]);
				},

				/**
				 * Вычисляет связанный шаг.
				 * @protected
				 * @param {Function} callback Метод обратного вызова.
				 * @param {Object} scope Контекст выполнения.
				 */
				findPreviousElement: function(callback, scope) {
					var select = this.createLinkedESQ();
					select.getEntityCollection(function(response) {
						if (response.success) {
							if (response.collection.getCount() === 0) {
								this.loadLookupDisplayValue("DelayType", ConfigurationConstants.SupplyPayment.Fixed);
								this.set("IsFirstItem", true);
								return;
							}
							var item = response.collection.getByIndex(0);
							this.set("PreviousElement", {
								value: item.get("Id"),
								displayValue: item.get("Name"),
								DatePlan: item.get("DatePlan"),
								DateFact: item.get("DateFact"),
								State: item.get("State")
							});
							this.calcTypedAmountPlan(response.collection);
							callback.call(scope, {success: true});
						}
					}, this);
				},

				/**
				 * Вычисляет общую плановую сумму шагов обоих типов.
				 * @param {Object} collection entity-коллеккция.
				 */
				calcTypedAmountPlan: function(collection) {
					var supplyAmount = 0;
					var paymentAmount = 0;
					collection.each(function(item) {
						var itemType = item.get("Type") || {};
						if (itemType.value === ConfigurationConstants.SupplyPayment.TypeSupply) {
							supplyAmount += item.get("AmountPlan");
						} else if (itemType.value) {
							paymentAmount += item.get("AmountPlan");
						}
					}, this);
					this.set("SupplyAmount", supplyAmount);
					this.set("PaymentAmount", paymentAmount);
				},

				/**
				 * Пересчитывает суммы оплат и поставок в заказе.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст выполнения.
				 */
				recalcTypedAmountPlan: function(callback, scope) {
					this.set("SupplyAmount", 0);
					this.set("PaymentAmount", 0);
					var select = this.createLinkedESQ();
					select.getEntityCollection(function(response) {
						if (response.success) {
							this.calcTypedAmountPlan(response.collection);
						}
						if (callback) {
							callback.call(scope);
						}
					}, this);
				},

				/**
				 * Инициализирует данные графика поставок и оплат.
				 * @private
				 */
				initSupplyPaymentData: function() {
					this.setAmountPlanEnabled();
					this.setCurrency();
					if (this.isNewMode()) {
						this.set("SupplyAmount", 0, {silent: true});
						this.set("PaymentAmount", 0, {silent: true});
						this.callWithValidation(this.Ext.emptyFn, this.findPreviousElement);
					} else {
						this.updatePreviousElementData();
					}
					this.set("OldDelay", this.get("Delay"), {silent: true});
					this.set("OldDatePlan", this.get("DatePlan"), {silent: true});
				},

				/**
				 * Возвращает сумму заказа.
				 */
				getOrderAmount: function() {
					return this.get("OrderAmount") || 0;
				},

				/**
				 * Расчитывает и устанавливает значения по умолчанию.
				 */
				setElementDefaultValues: function() {
					this.set("IsFirstItem", false);
					this.Terrasoft.chain(
						function() {
							this.callWithValidation(this.Ext.emptyFn, this.findPreviousElement);
						}, this
					);
				},

				/**
				 * Устанавливает валюту и множитель.
				 * @private
				 */
				setCurrency: function() {
					var order = this.get("Order") || {};
					var currency = order.Currency || this.get("Order.Currency") || {};
					currency.Division = order["Currency.Division"] || this.get("Order.Currency.Division");
					var currencyRate = order.CurrencyRate || this.get("Order.CurrencyRate");
					this.set("Currency", currency ? currency : null, {silent: true});
					this.set("CurrencyRate", this.Ext.isEmpty(currencyRate) ? 0 : currencyRate, {silent: true});
				},

				/**
				 * Устанавливает значение подсказки для поля Percentage.
				 * @private
				 * @return {String} Строка подсказки для поля.
				 */
				getPercentageHint: function() {
					var isSupply = !GridButtonsUtil.instance.getIsPayment(this) && this.get("Type");
					var productsCount = this.get("ProductsCount") || 0;
					var percentageHint = "";
					if (isSupply) {
						percentageHint = this.get("Resources.Strings.PercentageForSupplyIsNotEditableHint");
					} else if (productsCount > 0) {
						percentageHint = this.get("Resources.Strings.PercentageForPaymentsWithProductIsNotEditableHint");
					}
					return percentageHint;
				},

				/**
				 * Устанавливает признак включенности полей AmountPlan и Percentage.
				 * @private
				 */
				setAmountPlanEnabled: function() {
					var isNotSupply = GridButtonsUtil.instance.getIsPayment(this) || !this.get("Type");
					var notIncludedProducts = (this.get("ProductsCount") || 0) === 0;
					this.set("AmountPlanEnabled", isNotSupply && notIncludedProducts);
				},

				/**
				 * Возвращает коэффициент деления.
				 * @private
				 */
				getCurrencyDivision: function() {
					var currency = this.get("Currency");
					return currency && currency.Division;
				},

				/**
				 * Рассчитать сумму оплаты, б.в.
				 * @private
				 */
				recalculatePrimaryAmountPlan: function() {
					if (this.get("isWorking")) {
						return;
					}
					var division = this.getCurrencyDivision();
					MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "AmountPlan", "PrimaryAmountPlan",
						division);
				},

				/**
				 * Рассчитать сумму оплаты, б.в.
				 * @private
				 */
				recalculatePrimaryAmountFact: function() {
					var division = this.getCurrencyDivision();
					MoneyModule.RecalcBaseValue.call(this, "CurrencyRate", "AmountFact", "PrimaryAmountFact",
						division);
				},

				/**
				 * Валидатор суммы.
				 * @private
				 */
				validateAmount: function(callback, scope) {
					var amountPlan = this.get("AmountPlan");
					var amountFact = this.get("AmountFact");
					var result = {
						success: true
					};
					if (amountPlan < 0) {
						result.message = this.get("Resources.Strings.AmountPlanNegative");
						result.success = false;
					}
					if (amountFact < 0) {
						result.message = this.get("Resources.Strings.AmountFactNegative");
						result.success = false;
					}
					callback.call(scope || this, result);
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#onSaved
				 * @overridden
				 */
				onSaved: function() {
					this.callParent(arguments);
					this.updateInvoiceCurrency();
				},

				/**
				 * Обновляет валюту в счете.
				 * @protected
				 * @virtual
				 */
				updateInvoiceCurrency: function() {
					var invoice = this.get("Invoice");
					invoice = invoice && invoice.value;
					if (!this.Terrasoft.isGUID(invoice)) {
						return;
					}
					var currency = this.get("Currency");
					var currencyRate = this.get("CurrencyRate");
					if (!currency || !currencyRate) {
						return;
					}
					var update = this.Ext.create("Terrasoft.UpdateQuery", {
						rootSchemaName: "Invoice"
					});
					update.setParameterValue("Currency", currency.value, this.Terrasoft.DataValueType.GUID);
					update.setParameterValue("CurrencyRate", currencyRate, this.Terrasoft.DataValueType.MONEY);
					update.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Id", invoice));
					update.execute();
				},

				/**
				 * Возвращает реестру конфигурацию по умолчанию для отображения колонки в виде ссылки.
				 * @param {Terrasoft.EntitySchemaColumn} column Колонка entity схемы.
				 * @return {Object} Конфигурация для отображения колонки в виде ссылки.
				 */
				getLinkColumnConfig: function(column) {
					var columnPath = column.columnPath;
					var value = this.get(columnPath);
					if (!value) {
						return null;
					}
					var config = {
						target: "_self",
						url: ""
					};
					if (columnPath === "Products") {
						config.title = value;
						config.caption = value;
					} else if (columnPath === "Invoice") {
						config.title = value.displayValue;
						config.caption = value.displayValue;
						if (value && value.value) {
							var urlConfig = this.getLinkUrl(column.name);
							config.url = urlConfig.url;
						}
					}
					return config.caption ? config : null;
				},

				/**
				 * @inheritdoc Terrasoft.BaseViewModel#setColumnValues
				 * @overridden
				 */
				setColumnValues: function(entity) {
					if (entity) {
						entity.set("Products", entity.get("ProductsCount") || "0");
					}
					this.callParent(arguments);
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "remove",
					"name": "TabsContainer"
				},
				{
					"operation": "insert",
					"name": "SupplyPaymentPageGeneralTabContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "SupplyPaymentPageGeneralTabContainer",
					"propertyName": "items",
					"name": "SupplyPaymentPageGeneralBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Name",
					"values": {
						"bindTo": "Name",
						"layout": {"column": 0, "row": 0, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "PreviousElement",
					"values": {
						"bindTo": "PreviousElement",
						"layout": {"column": 12, "row": 0, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "ElementType",
					"values": {
						"bindTo": "Type",
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 0, "row": 1, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Delay",
					"values": {
						"bindTo": "Delay",
						"layout": {"column": 12, "row": 1, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "DatePlan",
					"values": {
						"bindTo": "DatePlan",
						"layout": {"column": 0, "row": 2, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "DateFact",
					"values": {
						"bindTo": "DateFact",
						"layout": {"column": 12, "row": 2, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Percentage",
					"values": {
						"bindTo": "Percentage",
						"layout": {"column": 0, "row": 3, "colSpan": 12},
						"enabled": {"bindTo": "AmountPlanEnabled"},
						"hint": {"bindTo": "getPercentageHint"}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "State",
					"values": {
						"bindTo": "State",
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 12, "row": 3, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Currency",
					"values": {
						"layout": {"column": 0, "row": 4, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": false
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "CurrencyRate",
					"values": {
						"layout": {"column": 12, "row": 4, "colSpan": 12},
						"enabled": false
					}
				},
				{
					"operation": "insert",
					"name": "AmountPlan",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 5, "colSpan": 12},
						"enabled": {"bindTo": "AmountPlanEnabled"}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "PrimaryAmountPlan",
					"values": {
						"layout": {"column": 12, "row": 5, "colSpan": 12},
						"enabled": false
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "DelayType",
					"values": {
						"bindTo": "DelayType",
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {"column": 0, "row": 6, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "AmountFact",
					"values": {
						"bindTo": "AmountFact",
						"layout": {"column": 0, "row": 7, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "PrimaryAmountFact",
					"values": {
						"layout": {"column": 12, "row": 7, "colSpan": 12},
						"enabled": false
					}
				}
			]/**SCHEMA_DIFF*/,
			rules: {
				"PreviousElement": {
					"BindParameterRequiredPreviousElement": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.REQUIRED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "DelayType"
								},
								"comparisonType": Terrasoft.ComparisonType.NOT_EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": ConfigurationConstants.SupplyPayment.Fixed
								}
							}
						]
					},
					"FiltrationPreviousElementByOrder": {
						"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
						"autocomplete": true,
						"autoClean": true,
						"baseAttributePatch": "Order",
						"comparisonType": Terrasoft.ComparisonType.EQUAL,
						"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						"attribute": "Order"
					}
				},
				"Percentage": {
					"BindParameterEnabledPercentage": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								"attribute": "AmountPlanEnabled"
							},
							"comparisonType": this.Terrasoft.core.enums.ComparisonType.EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							}
						}]
					}
				},
				"AmountPlan": {
					"BindParameterEnabledAmountPlan": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [{
							"leftExpression": {
								"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								"attribute": "AmountPlanEnabled"
							},
							"comparisonType": this.Terrasoft.core.enums.ComparisonType.EQUAL,
							"rightExpression": {
								"type": BusinessRuleModule.enums.ValueType.CONSTANT,
								"value": true
							}
						}]
					}
				}
			}
		};
	}
);
