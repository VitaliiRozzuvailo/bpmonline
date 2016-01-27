define("SupplyPaymentDetailV2", ["ConfigurationConstants", "OrderConfigurationConstants", "ConfigurationEnums",
		"SupplyPaymentGridButtonsUtility", "Order", "ConfigurationGrid", "ConfigurationGridGenerator",
		"ConfigurationGridUtilities", "css!SupplyPaymentGridButtonsUtility", "OrderUtilities"],
	function(ConfigurationConstants, OrderConfigurationConstants, enums, GridButtonsUtil, Order) {
		/**
		 * Тип результата.
		 * @enum
		 */
		var result = {
			NoError: 0,
			NoItems: 1,
			TypeNotMatch: 2,
			ExistInvoice: 3
		};
		/**
		 * Название объекта для генерации.
		 * @enum
		 */
		var entityName = {
			Invoice: "Invoice",
			Contract: "Contract"
		};
		return {
			entitySchemaName: "SupplyPaymentElement",
			attributes: {
				"IsEditable": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: true
				},
				"ActiveRow": {
					dataValueType: Terrasoft.DataValueType.GUID,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"State": {
					dataValueType: Terrasoft.DataValueType.LOOKUP
				},
				"NeedReloadGridData": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: false
				}
			},
			messages: {

				/**
				 * Используется для обновления реестра детали графика поставок и оплат.
				 */
				"ReloadSupplyPaymentGridData": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Используется для получения информации об активной строке реестра в модальном окне продуктов.
				 */
				"GetModuleInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Используется для получения суммы заказа.
				 */
				"GetOrderAmount": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},

			/**
			 * Классы-миксины, расширяющие функциональность данного класа.
			 */
			mixins: {
				ConfigurationGridUtilites: "Terrasoft.ConfigurationGridUtilities",
				OrderUtilities: "Terrasoft.OrderUtilities"
			},
			methods: {
				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#subscribeSandboxEvents
				 */
				subscribeSandboxEvents: function() {
					this.callParent(arguments);
					this.sandbox.subscribe("ReloadSupplyPaymentGridData", function() {
						this.set("ActiveRow", null);
						this.set("OldActiveRow", null);
						this.reloadGridData();
					}, this);
					this.sandbox.subscribe("GetModuleInfo", function() {
						var activeRowId = this.get("CurrentRowId");
						if (activeRowId) {
							return {
								schemaName: "SupplyPaymentProductDetailModalBox",
								supplyPaymentElementId: activeRowId
							};
						}
					}, this, [this.getModalBoxProductDetailId()]);
					this.sandbox.subscribe("RerenderDetail", function(config) {
						if (this.viewModel) {
							var renderTo = this.Ext.get(config.renderTo);
							if (renderTo) {
								if (this.view) {
									this.view.destroyed = true;
								}
								this.render(renderTo);
								return true;
							}
						}
					}, this, [this.sandbox.id]);
				},

				/**
				 * Возвращает идентификатор sandbox для детали "Продукты" открытой в модальном окне.
				 * @return {String}
				 */
				getModalBoxProductDetailId: function() {
					return this.sandbox.id + "_SupplyPaymentProductDetailModalBox";
				},

				/**
				 * Добавляет в запрос колонки, которые необходимо загружать вне зависимости от профиля.
				 * @protected
				 * @param {Terrasoft.EntitySchemaQuery} esq Запрос на загрузку данных реестра.
				 */
				addRequiredColumns: function(esq) {
					esq.addColumn("State");
					esq.addColumn("Order");
					var orderColumns = Order.columns;
					var requiredOrderColumns = ["Contract", "Contact", "Account", "Currency", "CurrencyRate",
						"Opportunity"];
					this.Terrasoft.each(requiredOrderColumns, function(columnName) {
						if (orderColumns[columnName]) {
							esq.addColumn("Order." + columnName);
							if (columnName === "Currency") {
								esq.addColumn("Order.Currency.Division");
							}
						}
					}, this);
					esq.addColumn("AmountPlan");
					esq.addColumn("Contract");
					esq.addColumn("Invoice");
					esq.addColumn("Invoice.PaymentStatus");
					esq.addColumn("Order.Amount", "OrderAmount");
					esq.addColumn("PreviousElement.DatePlan", "PreviousElement.DatePlan");
					esq.addColumn("PreviousElement.DateFact", "PreviousElement.DateFact");
					esq.addColumn("PreviousElement.State", "PreviousElement.State");
				},

				/**
				 * @inheritDoc Terrasoft.configuration.mixins.GridUtilities#getGridDataColumns
				 * @protected
				 * @overridden
				 */
				getGridDataColumns: function() {
					var baseGridDataColumns = this.callParent(arguments);
					var gridDataColumns = {
						"DatePlan": {
							path: "DatePlan",
							orderPosition: 0,
							orderDirection: this.Terrasoft.OrderDirection.ASC
						},
						"DateFact": {
							path: "DateFact",
							orderPosition: 1,
							orderDirection: this.Terrasoft.OrderDirection.ASC
						},
						"CreatedOn": {
							path: "CreatedOn",
							orderPosition: 2,
							orderDirection: this.Terrasoft.OrderDirection.ASC
						}
					};
					return Ext.apply(baseGridDataColumns, gridDataColumns);
				},

				/**
				 * @inheritdoc Terrasoft.GridUtilitiesV2#addGridDataColumns
				 * @overridden
				 */
				addGridDataColumns: function(esq) {
					this.callParent(arguments);
					this.addRequiredColumns(esq);
					GridButtonsUtil.instance.addGridDataColumns(esq);
				},

				/**
				 * @inheritdoc Terrasoft.GridUtilitiesV2#prepareResponseCollectionItem
				 * @overridden
				 */
				prepareResponseCollectionItem: function(item) {
					this.mixins.GridUtilities.prepareResponseCollectionItem.apply(this, arguments);
					GridButtonsUtil.instance.prepareResponseCollectionItem(item, this);
					if (item.isNewMode()) {
						var amount = this.sandbox.publish("GetOrderAmount", null, [this.sandbox.id]);
						item.set("OrderAmount", amount);
					}
					item.initSupplyPaymentData();
				},

				/**
				 * @inheritdoc Terrasoft.ConfigurationGridUtilites#getCellControlsConfig
				 * @overridden
				 */
				getCellControlsConfig: function(entitySchemaColumn) {
					var controlsConfig = GridButtonsUtil.instance.getCellControlsConfig(entitySchemaColumn);
					if (!controlsConfig) {
						controlsConfig =
							this.mixins.ConfigurationGridUtilites.getCellControlsConfig.apply(this, arguments);
						if (entitySchemaColumn.name === "Percentage") {
							controlsConfig.hint = {"bindTo": "getPercentageHint"};
						}
					}
					return controlsConfig;
				},

				/**
				 * @inheritdoc Terrasoft.ConfigurationGridUtilites#onGridClick
				 * @overridden
				 */
				onGridClick: function() {
					if (this.get("IsButtonClicked")) {
						this.set("IsButtonClicked", false);
					} else {
						this.mixins.ConfigurationGridUtilites.onGridClick.apply(this, arguments);
					}
				},

				/**
				 * @inheritdoc Terrasoft.GridUtilitiesV2#linkClicked
				 * @overridden
				 */
				linkClicked: function(recordId, columnName) {
					var eventResult = false;
					try {
						this.set("CurrentRowId", recordId);
						if (columnName === "Products") {
							this.openProductsWindow();
						} else if (columnName === "Invoice") {
							var data = this.getGridData();
							var row = data.get(recordId);
							this.onInvoiceButtonClick(row);
						}
					} catch (exception) {
						this.log(exception, this.Terrasoft.LogMessageType.ERROR);
					}
					this.set("IsButtonClicked", true);
					return eventResult;
				},

				/**
				 * Обрабатывает клик по кнопке колонки "Продукты" в реестре детали (в режиме редактирования записи).
				 * @protected
				 * @param {Terrasoft.BasePageV2ViewModel} item Модель представления страницы строки реестра.
				 */
				onProductsButtonClick: function(item) {
					this.set("CurrentRowId", this.get("ActiveRow"));
					this.saveIfNeedAndProceed(item, this.openProductsWindow, this);
				},

				/**
				 * Обрабатывает нажатие на кнопку очистки.
				 * @param {Terrasoft.BasePageV2ViewModel} item Модель представления страницы строки реестра.
				 */
				onClearProductsButtonClick: function(item) {
					this.saveIfNeedAndProceed(item, this.clearSupplyPaymentElementProducts, this);
				},

				/**
				 * Сохраняет, при необходимости, переданную строку  и вызывает метод обратного вызова.
				 * @param {Terrasoft.BasePageV2ViewModel} item Модель представления страницы строки реестра.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст выполнения.
				 */
				saveIfNeedAndProceed: function(item, callback, scope) {
					if (!item) {
						return;
					}
					if (item.isChanged()) {
						item.save({
							isSilent: true,
							scope: this,
							callback: function() {
								callback.call(scope, item);
							}
						});
					} else {
						callback.call(scope, item);
					}
				},

				/**
				 * Очищает продукты шага графика поставок и оплат.
				 * @param {Terrasoft.BaseModel} row  Модель представления строки реестра.
				 */
				clearSupplyPaymentElementProducts: function(row) {
					var rowId = row.get("Id");
					this.callService({
						serviceName: "OrderPassportService",
						methodName: "ClearSupplyPaymentProducts",
						data: {
							"supplyPaymentElementId": rowId
						}
					}, function(response) {
						var result = response.ClearSupplyPaymentProductsResult || {};
						if (!result.success) {
							if (result.errorInfo) {
								this.showInformationDialog(result.errorInfo.message);
							} else {
								throw new Terrasoft.UnknownException();
							}
						}
						this.reloadGridData();
					}, this);
				},

				/**
				 * Обрабатывает клик по кнопке колонки "Счет" в реестре детали (в режиме редактирования записи).
				 * @protected
				 * param {Object} row Модель представления строки реестра.
				 */
				onInvoiceButtonClick: function(row) {
					var invoice = row.get("Invoice");
					if (invoice && this.Terrasoft.isGUID(invoice.value)) {
						this.openInvoicePage(invoice.value);
						return;
					}
					if (row.isChanged()) {
						row.save({
							isSilent: true,
							scope: this,
							callback: this.asyncGenerateInvoices.bind(this, [row])
						});
					} else {
						this.asyncGenerateInvoices([row]);
					}
				},

				/**
				 * Открывает страницу редактирования счета.
				 * @param {Guid} invoiceId Id счета.
				 */
				openInvoicePage: function(invoiceId) {
					var config = {
						schemaName: "InvoicePageV2",
						operation: enums.CardStateV2.EDIT,
						id: invoiceId,
						moduleId: this.getInviocePageSandboxId()
					};
					this.sandbox.publish("OpenCard", config, [this.sandbox.id]);
				},

				/**
				 * Возвращает тег карточки счета.
				 * @return {String}
				 */
				getInviocePageSandboxId: function() {
					return this.sandbox.id + "_InvoicePageV2";
				},

				/**
				 * Загружает окно редактирования продуктов шага.
				 * @protected
				 */
				openProductsWindow: function() {
					var currentRowId = this.get("CurrentRowId");
					var collection = this.getGridData();
					var item = collection.get(currentRowId);
					this.needToChangeInvoice({
							name: "Id",
							id: item.get("Id")
						}, function(result) {
							if (result) {
								this.sandbox.loadModule("ModalBoxSchemaModule", {id: this.getModalBoxProductDetailId()});
							}
						}, this
					);
				},

				/**
				 * @inheritdoc Terrasoft.BaseDetailV2#init
				 * @overridden
				 */
				init: function() {
					GridButtonsUtil.init({
						Ext: this.Ext,
						Terrasoft: this.Terrasoft
					});
					this.callParent(arguments);
					this.set("isCollapsed", false);
					this.Terrasoft.chain(this.initDefTemplate, this.initItemTemplates, this);
				},

				/**
				 * Создает экземпляр запроса для названий шаблонов графика.
				 * @protected
				 * @return {Terrasoft.EntitySchemaQuery} Экземпляр запроса для названий шаблонов графика.
				 */
				getTemplateNamesEsq: function() {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SupplyPaymentTemplate"
					});
					esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
					var nameColumn = esq.addMacrosColumn(this.Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "Name");
					nameColumn.orderDirection = Terrasoft.core.enums.OrderDirection.ASC;
					nameColumn.orderPosition = 1;
					return esq;
				},

				/**
				 * Инициализирует коллекцию элементов меню кнопки заполнить по шаблону.
				 * @protected
				 */
				initItemTemplates: function() {
					var templateCollection = Ext.create("Terrasoft.BaseViewModelCollection");
					var esq = this.getTemplateNamesEsq();
					esq.getEntityCollection(function(response) {
						if (response.success) {
							response.collection.each(function(template) {
								var id = template.get("Id");
								templateCollection.add(id, this.getButtonMenuItem({
									Id: id,
									Caption: template.get("Name"),
									Click: {bindTo: "setTemplate"},
									Tag: id
								}));
							}, this);
						}
						this.set("ItemTemplates", templateCollection);
					}, this);
				},

				/**
				 * Инициализирует значение системной настройки "Шаблон паспорта заказа по умолчанию".
				 * @param {Function} next Функция обратного вызова.
				 */
				initDefTemplate: function(next) {
					this.Terrasoft.SysSettings.querySysSettingsItem("OrderPassportTemplateDef", function(value) {
								this.set("OrderPassportTemplateDef", value);
								next();
							},
							this);
				},

				/**
				 * Возвращает активность кнопки "Заполнить по шаблону".
				 * @protected
				 * @return {Boolean} Активность кнопки "Заполнить по шаблону".
				 */
				getSetTemplateButtonEnabled: function() {
					var templateCollection = this.get("ItemTemplates");
					return (Boolean(templateCollection) && templateCollection.getCount() > 0);
				},

				/**
				 * Сохраняет при необходимости заказ и применяет выбранный шаблон графика.
				 * @protected
				 * @param {String} tag Id шаблона.
				 */
				setTemplate: function(tag) {
					var isNewRecord = this.getIsNewMasterRecord();
					if (!isNewRecord) {
						this.setTemplateWithCheck(tag);
					} else {
						this.set("SetTemplateRecordId", tag);
						var args = {
							isSilent: true,
							messageTags: [this.sandbox.id]
						};
						this.turnDefPassportTemplateOff(function() {
							this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
						}.bind(this));
					}
				},

				/**
				 * @inheritdoc Terrasoft.BaseDetailV2#onCardSaved
				 * @overridden
				 */
				onCardSaved: function() {
					var setTemplateRecordId = this.get("SetTemplateRecordId");
					if (setTemplateRecordId) {
						this.set("SetTemplateRecordId", null);
						this.setTemplateWithCheck(setTemplateRecordId);
					} else {
						var needRefresh = this.get("NeedRefreshAfterPageSaved");
						if (needRefresh) {
							this.set("NeedRefreshAfterPageSaved", false);
							this.set("AddRowOnDataChangedConfig", {callback: this.onCardSaved, scope: this});
							this.reloadGridData();
						} else {
							this.callParent(arguments);
						}
					}
				},

				/**
				 * @inheritdoc Terrasoft.BaseDetailV2#onGridDataLoaded
				 * @overridden
				 */
				onGridDataLoaded: function() {
					this.callParent(arguments);
					var addRowConfig = this.get("AddRowOnDataChangedConfig");
					if (addRowConfig) {
						this.set("AddRowOnDataChangedConfig", null);
						if (this.Ext.isFunction(addRowConfig.callback)) {
							addRowConfig.callback.call(addRowConfig.scope || this);
						}
					}
				},

				/**
				 * Вызывает метод изменения шаблона графика веб сервиса OrderPassportService.
				 * @protected
				 * @param {String} tag Id шаблона.
				 */
				setTemplateWithCheck: function(tag) {
					var orderId = this.get("MasterRecordId");
					this.Terrasoft.chain(
							function(next) {
								var data = this.getGridData();
								if (data.getCount() === 0) {
									next();
								} else {
									this.showConfirmationDialog(this.get("Resources.Strings.SetTemplateActionWarning"),
											function(returnCode) {
												if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
													this.set("IsGridLoading", true);
													next();
												}
											},
											[this.Terrasoft.MessageBoxButtons.YES.returnCode, this.Terrasoft.MessageBoxButtons.NO.returnCode],
											null);
								}
							},
							function() {
								this.callService({
									serviceName: "OrderPassportService",
									methodName: "ChangeTemplate",
									data: {
										"orderId": orderId,
										"templateId": tag
									}
								}, this.onTemplateChanged, this);
							},
							this);
				},

				/**
				 * Возвращает признак того, что запись, открытая в странице редактирования, еще не была сохранена.
				 * @protected
				 * @returns {Boolean} Признак того, что запись, открытая в странице редактирования, еще не была сохранена.
				 */
				getIsNewMasterRecord: function() {
					var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
					var isNew = (cardState.state === enums.CardStateV2.ADD || cardState.state === enums.CardStateV2.COPY);
					return isNew;
				},

				/**
				 * Добавляет запись на деталь. Если запись, в которой находится деталь не сохранена, выполняет
				 * сохранение.
				 * @protected
				 */
				addTemplateItemRecord: function() {
					var args = arguments;
					var isNew = this.getIsNewMasterRecord();
					var isDefTemplateExists = Boolean(this.get("OrderPassportTemplateDef"));
					if (!isNew || !isDefTemplateExists) {
						this.addRecord(args);
					} else {
						this.Terrasoft.chain(
								function(next) {
									this.showConfirmationDialog(this.get("Resources.Strings.ThereIsDefTemplateWarning"),
										function(returnCode) {
											if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
												this.turnDefPassportTemplateOff(next);
											} else {
												this.set("NeedRefreshAfterPageSaved", true);
												next();
											}
										},
										[
											this.Terrasoft.MessageBoxButtons.YES.returnCode,
											this.Terrasoft.MessageBoxButtons.NO.returnCode
										],
										null);
								},
								function() {
									this.addRecord(args);
								},
								this
						);
					}
				},

				/**
				 * @inheritdoc Terrasoft.ConfigurationGridUtilities#getAddItemsToGridDataOptions
				 * @overridden
				 */
				getAddItemsToGridDataOptions: function() {
					return {
						mode: "bottom"
					};
				},

				/**
				 * Отключает создание элементов графика поставок и оплат по шаблону из системной настройки.
				 * @param {Function} next Функция обратного вызова.
				 */
				turnDefPassportTemplateOff: function(next) {
					var orderId = this.get("MasterRecordId");
					this.callService({
						serviceName: "OrderPassportService",
						methodName: "TurnDefPassportTemplateOff",
						data: {
							"orderId": orderId
						}
					}, function() {
						next();
					}, this);
				},

				/**
				 * Обрабатывает ответ от сервера об изменении шаблона.
				 * Обновляет данные на детали в случае успеха, либо выводит сообщение с ошибкой.
				 * @protected
				 * @param {Object} response Ответ от сервера.
				 */
				onTemplateChanged: function(response) {
					this.set("IsGridLoading", false);
					if (response && response.ChangeTemplateResult) {
						var result = response.ChangeTemplateResult;
						if (result.success) {
							this.set("ActiveRow", null);
							this.fireDetailChanged(null);
							this.reloadGridData();
						} else if (result.errorInfo) {
							var errorData = {
								IsDbOperationException: result.errorInfo.errorCode === "DbOperationException",
								ExceptionMessage: result.errorInfo.message
							};
							this.showDeleteExceptionMessage(errorData);
						}
					}
				},

				/**
				 * Возвращает признак доступности элементов меню функциональной кнопки.
				 * @protected
				 * @return {Boolean} Признак доступности элементов.
				 */
				getEnableMenuActions: function() {
					if (this.getEditRecordButtonEnabled()) {
						var notAllowed = ConfigurationConstants.SupplyPayment.StateFinished;
						var record = this.getActiveRow();
						var status = record.get("State");
						return (status.value !== notAllowed);
					}
					return false;
				},

				/**
				 * @inheritDoc Terrasoft.Configuration.BaseDetailV2#updateDetail
				 * @overridden
				 */
				updateDetail: function(config) {
					if (!config.reloadAll) {
						this.fireDetailChanged(null);
						config.reloadAll = true;
					}
					this.callParent([config]);
				},

				/**
				 * Добавляет элементы манипулирования реестром в коллекцию выпадающего списка функциональной кнопки.
				 * @protected
				 * @overridden
				 * @param {BaseViewModelCollection} toolsButtonMenu Коллекция выпадающего списка функциональной кнопки.
				 */
				addGridOperationsMenuItems: function(toolsButtonMenu) {
					toolsButtonMenu.addItem(this.getButtonMenuSeparator());
					this.addGenerateMenuButtons(toolsButtonMenu, [entityName.Invoice]);
					this.callParent(arguments);
				},

				/**
				 * Добавляет элементы манипулирования реестром в коллекцию выпадающего списка функциональной кнопки.
				 * @protected
				 * @param {BaseViewModelCollection} toolsButtonMenu Коллекция выпадающего списка функциональной кнопки.
				 * @param {String[]} entities масив объектов.
				 */
				addGenerateMenuButtons: function(toolsButtonMenu, entities) {
					this.Terrasoft.each(entities, function(entity) {
						toolsButtonMenu.addItem(this.getButtonMenuItem({
							Caption: {"bindTo": "getGenerateMenuCaption"},
							Click: {"bindTo": "generateButtonClick"},
							Visible: {"bindTo": "getGenerateButtonsVisible"},
							Tag: entity
						}));
					}, this);
				},

				/**
				 * Получает видимость пункта меню для генерации счета, в зависимости от текущего вида реестра.
				 * @protected
				 * @return {Boolean}
				 */
				getGenerateButtonsVisible: function() {
					return !this.get("MultiSelect");
				},

				/**
				 * Получает заголовок пункта меню для генерации счета, в зависимости от текущего вида реестра.
				 * @protected
				 * @return {String}
				 */
				getGenerateMenuCaption: function() {
					var entity = arguments[arguments.length - 1]; // тег передается последним аргументом
					var caption = "";
					if (entity === entityName.Invoice) {
						caption = (this.get("MultiSelect")) ?
							this.get("Resources.Strings.MultiGenerateInvoiceMenuCaption") :
							this.get("Resources.Strings.SingleGenerateInvoiceMenuCaption");
					}
					return caption;
				},

				/**
				 * Обработчик нажатия кнопок генерации.
				 * @private
				 */
				generateButtonClick: function() {
					var entity = arguments[arguments.length - 1]; // тег передается последним аргументом
					this.showConfirmationDialog(this.get("Resources.Strings.Create" + entity),
						function(dialogResult) {
							if (dialogResult === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
								var collection = this.getGridData();
								var selectedRows;
								if (this.get("MultiSelect")) {
									selectedRows = this.get("SelectedRows") ? this.get("SelectedRows") : [];
								} else {
									selectedRows = this.get("ActiveRow") ? [this.get("ActiveRow")] : [];
								}

								if (!selectedRows.length) {
									this.validateResult({error: result.NoItems});
									return;
								}

								var filteredCollection = [];
								Terrasoft.each(selectedRows, function(row) {
									var item = collection.get(row);
									if (this.checkSupplyPaymentType(item, entity)) {
										filteredCollection.push(item);
									}
								}, this);

								if (!filteredCollection.length) {
									this.validateResult({error: result.TypeNotMatch, entity: entity});
									return;
								}

								this.asyncGenerateInvoices(filteredCollection);
							}
						},
						["yes", "no"]
					);
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#sortColumn
				 * @overridden
				 */
				sortColumn: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getGridSortMenuItem
				 * @overridden
				 */
				getGridSortMenuItem: this.Terrasoft.emptyFn,

				/**
				 * Асинхронная генерация счета.
				 * @private
				 * @param {Array} collection Коллекция елементов по которым сгенерируются счета.
				 */
				asyncGenerateInvoices: function(collection) {
					var index = 0;
					var invoicesCount = 0;
					var existInvoiceCount = 0;

					var generateInvoice = function(next) {
						var item = collection[index++];
						var invoice = item.get("Invoice");
						if (invoice && this.Terrasoft.isGUID(invoice.value)) {
							existInvoiceCount++;
							this.validateResult({error: result.ExistInvoice, existInvoiceCount: existInvoiceCount});
							next();
						} else {
							getAdditionAttributes.call(this, next, item);
						}
					};

					var getAdditionAttributes = function(next, item) {
						this.getIncrementCode(function(result) {
							item.set("Number", result);
							item.set("StartDate", new Date());
							var esq = this.getSupplyPaymentProductEntitySchemaQuery(item.get("Id"));
							esq.getEntityCollection(function(response) {
								if (response.success) {
									item.set("ProductCollection", response.collection);
									insertInvoice.call(this, next, item);
								}
							}, this);
						}, this);
					};

					var insertInvoice = function(next, item) {
						var insert = this.getInvoiceInsertQuery(item);
						insert.execute(function(response) {
							if (response.success) {
								var config = {
									invoiceId: response.id,
									id: item.get("Id"),
									amount: item.get("AmountPlan"),
									number: item.get("Number"),
									startDate: item.get("StartDate"),
									products: item.get("ProductCollection")
								};
								if (config.products.getCount() === 0) {
									invoicesCount++;
									updateSupplyPaymentElement.call(this, next, config);
								} else {
									insertInvoiceProducts.call(this, next, config);
								}
							}
						}, this);
					};

					var insertInvoiceProducts = function(nextParrent, config) {
						var productsMethods = [];
						Terrasoft.each(config.products.getItems(), function() {
							productsMethods.push(function(next, i) {
								if (!i) {
									i = 0;
								}
								var insert = this.getInvoiceProductInsertQuery(config, i);
								insert.execute(function(response) {
									if (response.success) {
										invoicesCount++;
										i++;
										next(i);
									}
								}, this);
							});
						}, this);
						productsMethods.push(function() {
							updateSupplyPaymentElement.call(this, nextParrent, config);
						});
						productsMethods.push(this);
						Terrasoft.chain.apply(this, productsMethods);
					};

					var updateSupplyPaymentElement = function(next, config) {
						var update = this.getSupplyPaymentElementUpdateQuery(config);
						update.execute(function(response) {
							if (response.success) {
								this.updateDetail({primaryColumnValue: config.id});
								this.openInvoicePage(config.invoiceId);
								next();
							}
						}, this);
					};

					var methods = [];
					methods.push(generateInvoice);
					methods.push(function() {
						this.hideBodyMask();
					});
					methods.push(this);

					this.showBodyMask();
					Terrasoft.chain.apply(this, methods);
				},

				/**
				 * Добавляет в экземпляр запроса колонки.
				 * @private
				 * @param {Guid} id Идентификатор шага графика поставок и оплат.
				 * @return {Terrasoft.EntitySchemaQuery} esq Запрос получения продуктов из Шага заказа.
				 */
				getSupplyPaymentProductEntitySchemaQuery: function(id) {
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SupplyPaymentProduct"
					});
					esq.addColumn("Product.Product", "Product");
					esq.addColumn("Product.Name", "Name");
					esq.addColumn("Product.Price", "Price");
					esq.addColumn("Product.DiscountPercent", "DiscountPercent");
					esq.addColumn("Product.Tax", "Tax");
					esq.addColumn("Product.DiscountTax", "DiscountTax");
					esq.addColumn("Product.Amount", "Amount");
					esq.addColumn("Product.DiscountAmount", "DiscountAmount");
					esq.addColumn("Product.TaxAmount", "TaxAmount");
					esq.addColumn("Product.Unit", "Unit");
					esq.addColumn("Quantity");
					esq.addColumn("Amount", "TotalAmount");
					esq.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "SupplyPaymentElement", id));
					return esq;
				},

				/**
				 * Добавляет в экземпляр запроса колонки.
				 * @private
				 * @param {Object} config.
				 * @return {Terrasoft.UpdateQuery} update Запрос изменения Шага заказа.
				 */
				getSupplyPaymentElementUpdateQuery: function(config) {
					var update = this.Ext.create("Terrasoft.UpdateQuery", {
						rootSchemaName: "SupplyPaymentElement"
					});
					update.filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.EQUAL, "Id", config.id));
					update.setParameterValue("Invoice", config.invoiceId, this.Terrasoft.DataValueType.GUID);
					return update;
				},

				/**
				 * @inheritDoc Terrasoft.GridUtilitiesV2#onDeleted
				 * @overridden
				 */
				onDeleted: function() {
					this.updateDetail({});
					this.mixins.GridUtilities.onDeleted.apply(this, arguments);
				},

				/**
				 * @inheritDoc Terrasoft.BaseGridDetailV2#getUpdateDetailSandboxTags
				 * @overridden
				 */
				getUpdateDetailSandboxTags: function() {
					var tags = this.callParent(arguments);
					return tags.concat(this.getInviocePageSandboxId());
				},

				/**
				 * @inheritDoc Terrasoft.ConfigurationGridUtilities#activeRowSaved
				 * @overridden
				 */
				activeRowSaved: function(activeRow, callback, scope) {
					callback = callback || this.Ext.emptyFn;
					scope = scope || this;
					var newArguments = [activeRow, this.checkAndDivideProducts.bind(this, activeRow, callback, scope), this];
					this.mixins.ConfigurationGridUtilites.activeRowSaved.apply(this, newArguments);
				},

				/**
				 * Проверяет необходимость разделения продуктов.
				 * @param {Object} row Строка реестра.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст выполнения.
				 */
				checkAndDivideProducts: function(row, callback, scope) {
					var contract;
					if (row) {
						contract = row.get("Contract");
					}
					if (!row || !contract || !contract.value) {
						callback.call(scope);
						return;
					}
					var divideProductData =  {
						supplyPaymentProductId: row.get("Id"),
						contractId: contract.value
					};
					var config = {
						serviceName: "SupplyPaymentService",
						methodName: "NeedDivideProduct",
						data: divideProductData
					};
					this.callService(config, function(response) {
						if (response && response.NeedDivideProductResult) {
							this.onDivideProductNecessary(divideProductData, callback, scope);
						} else {
							callback.call(scope);
						}
					}, this);
				},

				/**
				 * Запрос подтверждения пользователя на разделение продуктов по разным договорам.
				 * @param {Object} divideProductData Параметры текущего шага.
				 * @param {Guid} divideProductData.supplyPaymentProductId Id текущего шага.
				 * @param {Guid} divideProductData.contractId Id договора текущего шага.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст выполнения.
				 */
				onDivideProductNecessary: function(divideProductData, callback, scope) {
					this.showConfirmation(
						this.get("Resources.Strings.DivideProduct"),
						function(buttonCode) {
							if (buttonCode === "ok") {
								this.onDivideProductsAccepted(divideProductData, callback, scope);
							} else {
								callback.call(scope);
							}
						},
						["ok", "cancel"],
						this
					);
				},

				/**
				 * Разделяет продукты по договорам.
				 * @param {Object} divideProductData Параметры текущего шага.
				 * @param {Guid} divideProductData.supplyPaymentProductId Id текущего шага.
				 * @param {Guid} divideProductData.contractId Id договора текущего шага.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст выполнения.
				 */
				onDivideProductsAccepted: function(divideProductData, callback, scope) {
					var config = {
						serviceName: "SupplyPaymentService",
						methodName: "DivideProduct",
						data: divideProductData
					};
					this.callService(config, function() {
						this.fireDetailChanged(null);
						callback.call(scope);
					}, this);
				},

				/**
				 * Валидирование результатов.
				 * @private
				 * @param {Object} config когфиг для валидации.
				 */
				validateResult: function(config) {
					var resultText = "";
					switch (config.error) {
						case result.NoError:
							resultText = Ext.String.format(this.get("Resources.Strings.InvoicesCreated"),
									"\n\t", config.invoicesCount);
							if (config.existInvoiceCount) {
								resultText += this.get("Resources.Strings.ExistInvoice");
							}
							break;
						case result.NoItems:
							resultText = this.get("Resources.Strings.NoItems");
							break;
						case result.TypeNotMatch:
							resultText = Ext.String.format(this.get("Resources.Strings.TypeNotMatch"),
								this.get("Resources.Strings." + config.entity),
									config.entity === entityName.Invoice ? this.get("Resources.Strings.Payment") :
										this.get("Resources.Strings.Delivery"));
							break;
						case result.ExistInvoice:
							resultText = this.get("Resources.Strings.ExistInvoice");
							break;
					}
					if (resultText) {
						this.showInformationDialog(resultText);
					}
				},

				/**
				 * Проверка типа записи.
				 * @private
				 * @param {Object} item Елемент, у которого необходимо проверить тип.
				 * @param {Enum} entity Имя объекта.
				 * @return {Boolean}
				 */
				checkSupplyPaymentType: function(item, entity) {
					var result = GridButtonsUtil.instance.getIsPayment(item);
					return (entity === entityName.Invoice) ? result : !result;
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
				 * Добавляет в экземпляр запроса колонки.
				 * @private
				 * @param {Object} item Елемент у которого вычитываются свойства для генерации Счета.
				 * @return {Terrasoft.InsertQuery} insert Запрос вставки Счета.
				 */
				getInvoiceInsertQuery: function(item) {
					var insert = this.Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "Invoice"
					});
					insert.setParameterValue("Number", item.get("Number"), this.Terrasoft.DataValueType.TEXT);
					insert.setParameterValue("Order", item.get("Order").value, this.Terrasoft.DataValueType.GUID);
					var opportunity = this.getColumnData("Order", "Opportunity", item);
					if (opportunity) {
						insert.setParameterValue("Opportunity", opportunity.value,
								this.Terrasoft.DataValueType.GUID);
					}
					var contact = this.getColumnData("Order", "Contact", item);
					if (contact) {
						insert.setParameterValue("Contact", contact.value,
								this.Terrasoft.DataValueType.GUID);
					}
					var account = this.getColumnData("Order", "Account", item);
					if (account) {
						insert.setParameterValue("Account", account.value,
								this.Terrasoft.DataValueType.GUID);
					}
					var currency = this.getColumnData("Order", "Currency", item);
					if (currency) {
						insert.setParameterValue("Currency", currency.value,
							this.Terrasoft.DataValueType.GUID);
					}
					var currencyRate = this.getColumnData("Order", "CurrencyRate", item);
					if (currency) {
						insert.setParameterValue("CurrencyRate", currencyRate,
							this.Terrasoft.DataValueType.FLOAT);
					}
					insert.setParameterValue("Owner", Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
						this.Terrasoft.DataValueType.GUID);
					var supplier = this.Terrasoft.SysValue.CURRENT_USER_ACCOUNT.value;
					if (!this.Terrasoft.isEmptyGUID(supplier)) {
						insert.setParameterValue("Supplier", supplier,
							this.Terrasoft.DataValueType.GUID);
					}
					insert.setParameterValue("StartDate", item.get("StartDate"), this.Terrasoft.DataValueType.DATE);
					if (item.get("ProductCollection").getCount() === 0) {
						var division = this.getColumnData("Order", "Currency.Division", item);
						var amountPlan = item.get("AmountPlan");
						var primaryAmount = Math.round((amountPlan * division * 100) / currencyRate) / 100;
						insert.setParameterValue("PrimaryAmount", primaryAmount,
								this.Terrasoft.DataValueType.FLOAT);
						insert.setParameterValue("Amount", item.get("AmountPlan"),
								this.Terrasoft.DataValueType.FLOAT);
					}
					return insert;
				},

				/**
				 * Получение номера счета.
				 * @private
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				getIncrementCode: function(callback, scope) {
					var config = {
						serviceName: "SysSettingsService",
						methodName:  "GetIncrementValueVsMask",
						data: {
							sysSettingName: "InvoiceLastNumber",
							sysSettingMaskName: "InvoiceCodeMask"
						}
					};
					this.callService(config, function(response) {
						callback.call(this, response.GetIncrementValueVsMaskResult);
					}, scope || this);
				},

				/**
				 * Добавляет в экземпляр запроса колонки.
				 * @private
				 * @param {Object} config настроек формирования InsertQuery.
				 * @param {int} i номер продукта в шаге.
				 * @return {Terrasoft.InsertQuery} insert Запрос вставки продукта Счета.
				 */
				getInvoiceProductInsertQuery: function(config, i) {
					var product = config.products.getByIndex(i);
					var insert = this.Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "InvoiceProduct"
					});
					insert.setParameterValue("SupplyPaymentProduct", product.get("Id"),
							this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Name", product.get("Name"), this.Terrasoft.DataValueType.TEXT);
					insert.setParameterValue("Product", product.get("Product").value,
							this.Terrasoft.DataValueType.GUID);
					var price =  product.get("Price");
					insert.setParameterValue("Price", price, this.Terrasoft.DataValueType.FLOAT);
					var discountPercent =  product.get("DiscountPercent");
					insert.setParameterValue("DiscountPercent", discountPercent, this.Terrasoft.DataValueType.FLOAT);
					insert.setParameterValue("Tax", product.get("Tax").value,
							this.Terrasoft.DataValueType.GUID);
					var discountTax = product.get("DiscountTax");
					insert.setParameterValue("DiscountTax", discountTax, this.Terrasoft.DataValueType.FLOAT);
					insert.setParameterValue("TotalAmount", product.get("TotalAmount"),
							this.Terrasoft.DataValueType.FLOAT);
					var quantity = product.get("Quantity");
					insert.setParameterValue("Quantity", quantity, this.Terrasoft.DataValueType.FLOAT);
					var amount = price * quantity;
					insert.setParameterValue("Amount", amount, this.Terrasoft.DataValueType.FLOAT);
					var discountAmount = amount * (discountPercent / 100);
					insert.setParameterValue("DiscountAmount", discountAmount, this.Terrasoft.DataValueType.FLOAT);
					var taxAmount = (amount - discountAmount) * (discountTax / 100);
					insert.setParameterValue("TaxAmount", taxAmount, this.Terrasoft.DataValueType.FLOAT);
					insert.setParameterValue("Unit", product.get("Unit").value,
							this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Invoice", config.invoiceId, this.Terrasoft.DataValueType.GUID);
					return insert;
				},

				/**
				 * @inheritDoc Terrasoft.mixins.ConfigurationGridUtilites#saveRowChanges
				 * @overridden
				 */
				saveRowChanges: function(row, callback, scope) {
					var isAmountFactChanged = Boolean(row && row.changedValues && row.changedValues.hasOwnProperty("AmountFact"));
					this.mixins.ConfigurationGridUtilites.saveRowChanges.call(this, row, function() {
						if (this.get("NeedReloadGridData")) {
							this.set("NeedReloadGridData", false);
							this.set("AddRowOnDataChangedConfig", {callback: callback, scope: scope});
							this.reloadGridData();
						} else if (callback) {
							callback.call(scope || this);
						}
						if (isAmountFactChanged) {
							this.fireDetailChanged(null);
						}
					}, this);
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#editRecord
				 * @overridden
				 **/
				editRecord: function() {
					var activeRow = this.getActiveRow();
					var typeColumnValue = this.getTypeColumnValue(activeRow);
					this.saveIfNeedAndProceed(activeRow, function() {
						this.openCard(enums.CardStateV2.EDIT, typeColumnValue, activeRow.get("Id"));
					}, this);
				},

				/**
				 * @inheritdoc Terrasoft.GridUtilitiesV2#getFilterDefaultColumnName
				 * @overridden
				 */
				getFilterDefaultColumnName: function() {
					return "Type";
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DeleteRecordMenu",
					"parentName": "ActionsButton",
					"propertyName": "menu",
					"index": 1,
					"values": {"enabled": {"bindTo": "getEnableMenuActions"}}
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowOpenAction"
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowCopyAction"
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowDeleteAction"
				},
				{
					"operation": "insert",
					"name": "activeRowActionSave",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "save",
						"markerValue": "save",
						"imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
					}
				},
				{
					"operation": "insert",
					"name": "activeRowActionOpenCard",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "card",
						"markerValue": "card",
						"imageConfig": {"bindTo": "Resources.Images.CardIcon"}
					}
				},
				{
					"operation": "insert",
					"name": "activeRowActionCancel",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "cancel",
						"markerValue": "cancel",
						"imageConfig": {"bindTo": "Resources.Images.CancelIcon"}
					}
				},
				{
					"operation": "insert",
					"name": "activeRowActionRemove",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "remove",
						"markerValue": "remove",
						"imageConfig": {"bindTo": "Resources.Images.RemoveIcon"}
					}
				},
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"className": "Terrasoft.ConfigurationGrid",
						"generator": "ConfigurationGridGenerator.generatePartial",
						"type": "listed",
						"generateControlsConfig": {"bindTo": "generateActiveRowControlsConfig"},
						"changeRow": {"bindTo": "changeRow"},
						"unSelectRow": {"bindTo": "unSelectRow"},
						"onGridClick": {"bindTo": "onGridClick"},
						"sortColumnIndex": null,
						"listedZebra": true,
						"useLinks": true,
						"collection": {"bindTo": "Collection"},
						"activeRow": {"bindTo": "ActiveRow"},
						"selectedRows": {"bindTo": "SelectedRows"},
						"primaryColumnName": "Id",
						"initActiveRowKeyMap": {"bindTo": "initActiveRowKeyMap"},
						"activeRowAction": {"bindTo": "onActiveRowAction"},
						"activeRowActions": []
					}
				},
				{
					"operation": "insert",
					"index": 1,
					"name": "SetTemplateButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"menu": {"items": {"bindTo": "ItemTemplates"}},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"enabled": {"bindTo": "getSetTemplateButtonEnabled"},
						"visible": {"bindTo": "getToolsVisible"},
						"caption": {"bindTo": "Resources.Strings.SetTemplateButtonCaption"}
					}
				},
				{
					"operation": "merge",
					"name": "AddRecordButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {"click": {"bindTo": "addTemplateItemRecord"}}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
