define("ESNNotificationModule", ["ESNNotificationModuleResources", "ViewUtilities", "ESNConstants", "NetworkUtilities",
		"ContainerList", "BaseModule", "SchemaBuilderV2"],
	function(resources, ViewUtilities, ESNConstants, NetworkUtilities) {
		/**
		 * @class Terrasoft.configuration.ESNNotificationModule
		 * Класс ESNNotificationModule предназначен для создания экземпляра модуля уведомлений ESN.
		 */
		Ext.define("Terrasoft.configuration.ESNNotificationModule", {
			alternateClassName: "Terrasoft.ESNNotificationModule",
			extend: "Terrasoft.BaseModule",
			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Создает экземпляр представления.
			 * @protected
			 * @vitrtual
			 * @return {Terrasoft.Container} Возвращает экземпляр представления.
			 */
			getView: function() {
				var viewItems = [];
				var notificationItemsContainer = ViewUtilities.getContainerConfig("esnNotificationItemsContainer",
					["default-esn-notification-items-container-class"]);
				notificationItemsContainer.markerValue = "Уведомления esn";
				notificationItemsContainer.items.push({
					className: "Terrasoft.ContainerList",
					id: this.sandbox.id + "_esn_notification-items-container-list",
					idProperty: "Id",
					selectors: {wrapEl: "#" + this.sandbox.id + "_esn_notification-items-container-list"},
					collection: {bindTo: "ESNNotifications"},
					onGetItemConfig: {bindTo: "onGetItemConfig"},
					onItemClick: {bindTo: "onItemClick"},
					observableRowNumber: 1,
					observableRowVisible: {bindTo: "onLoadNext"}
				});
				viewItems.push(Terrasoft.deepClone(notificationItemsContainer));
				return this.Ext.create("Terrasoft.Container", {
					id: "esn-notifications",
					selectors: {wrapEl: "#esn-notifications"},
					classes: {wrapClassName: ["esn-notifications-main-container"]},
					items: viewItems
				});
			},

			/**
			 * Создает экземпляр модели представления.
			 * @protected
			 * @return {Terrasoft.BaseViewModel} Возвращает экземпляр модели представления.
			 */
			getViewModel: function() {
				var viewModel = Ext.create("Terrasoft.BaseViewModel", {
					values: {
						/**
						 * Коллекция уведомлений.
						 * @private
						 */
						ESNNotifications: this.Ext.create("Terrasoft.BaseViewModelCollection"),

						/**
						 * Конфигурационный объект для формирования класа модели уведомления
						 * и конфига отображения уведомления.
						 * @private
						 */
						SchemaGeneratorConfig: {
							schemaName: "ESNNotificationSchema",
							profileKey: "ESNNotificationSchema"
						},

						/**
						 * Признак возможности загрузить еще одну страницу данных.
						 * @private
						 */
						CanLoadMoreData: true,

						/**
						 * Количество уведомлений на одной странице.
						 */
						RowCount: 15,

						/**
						 * Конфиг представления уведомления.
						 * @private
						 */
						NotificationViewConfig: null,

						/**
						 * Класс модели представления уведомления.
						 */
						ViewModelClass: null
					},
					methods: {
						/**
						 * Устанавливает свойство config при формировании отображения уведомления.
						 * Используется как обработчик события "onGetItemConfig" экземпляра ContainerList.
						 * @param {Object} itemConfig Конфигурационнй объект.
						 * @param {Object} item Уведомление.
						 */
						onGetItemConfig: function(itemConfig, item) {
							var viewConfig =  this.Terrasoft.deepClone(this.get("NotificationViewConfig"));
							var isRead = item.get("IsRead");
							if (viewConfig && viewConfig.hasOwnProperty("classes") &&
									viewConfig.classes.hasOwnProperty("wrapClassName") &&
									Ext.isArray(viewConfig.classes.wrapClassName) &&
									viewConfig.classes.wrapClassName.indexOf("selected") === -1 &&
									isRead === false) {
								viewConfig.classes.wrapClassName.push("selected");
							}
							itemConfig.config = viewConfig;
						},

						/**
						 * Обрабатывает событие клика по элементу.
						 * @param {String} id Идентификатор записи в коллекции.
						 */
						onItemClick: function(id) {
							var ESNNotifications = this.get("ESNNotifications");
							var notification = ESNNotifications.get(id);
							var notificationIsRead = notification.get("IsRead");
							if (!notificationIsRead) {
								notification.set("IsRead", true);
								notification.saveEntity(function() {
									this.sandbox.publish("UpdateCounters");
								});
							}
							var socialMessage = notification.get("SocialMessageParams");
							if (socialMessage.parent && !Ext.isEmpty(socialMessage.parent.id) &&
									!Terrasoft.isEmptyGUID(socialMessage.parent.id)) {
								socialMessage = socialMessage.parent;
							}
							var valuePairs = [
								{
									name: "DefaultTabName",
									value: "ESNTab"
								},
								{
									name: "ActiveSocialMessageId",
									value: socialMessage.id
								}
							];
							var handled = this.sandbox.publish("ReloadCard", valuePairs, [socialMessage.entityId]);
							if (!handled) {
								NetworkUtilities.openEntityPage({
									sandbox: this.sandbox,
									entityId: socialMessage.entityId,
									entitySchemaUId: socialMessage.entitySchemaUId,
									stateObj: {
										valuePairs: valuePairs
									}
								});
							}
						},

						/**
						 * Формирует класс модели представления и конфигурацию представления уведомления по схеме.
						 * @param {Function} callback Функция обратного вызова.
						 * @param {Object} scope Контекст вызова функции обратного вызова.
						 */
						buildSchema: function(callback, scope) {
							var schemaBuilder = this.Ext.create("Terrasoft.SchemaBuilder");
							var generatorConfig = this.Terrasoft.deepClone(this.get("SchemaGeneratorConfig"));
							schemaBuilder.build(generatorConfig, function(viewModelClass, viewConfig) {
								this.set("ViewModelClass", viewModelClass);
								var view = {
									"classes": {wrapClassName: ["esn-notification-container"]},
									"items": viewConfig
								};
								this.set("NotificationViewConfig", view);
								callback.call(scope);
							}, this);
						},

						/**
						 * Возвращает класс модели представления уведомления.
						 * @return {Object|*} Класс модели представления уведомления.
						 */
						getViewModelClass: function() {
							var viewModelClass = this.get("ViewModelClass");
							return this.Terrasoft.deepClone(viewModelClass);
						},

						/**
						 * Формирует экземпляр модели представления и заполняет его значениями.
						 * @param {Terrasoft.BaseViewModel} entity Уведомление.
						 * @return {viewModelClass} Экземпляр модели представления.
						 */
						onLoadEntity: function(entity) {
							var viewModelClass = this.getViewModelClass();
							var viewModel = this.Ext.create(viewModelClass, {
									Ext: this.Ext,
									sandbox: this.sandbox,
									Terrasoft: this.Terrasoft
								});
							viewModel.init();
							viewModel.isNew = false;
							var socialMessageParams = {
								id: entity.get("SocialMessageId"),
								entityId: entity.get("SocialMessageEntityId"),
								entitySchemaUId: entity.get("SocialMessageEntitySchemaUId"),
								parent: {
									id: entity.get("SocialMessageParentId"),
									entityId: entity.get("SocialMessageParentEntityId"),
									entitySchemaUId: entity.get("SocialMessageParentEntitySchemaUId")
								}
							};
							viewModel.set("SocialMessageParams", socialMessageParams);
							viewModel.setColumnValues(entity, {preventValidation: true});
							return viewModel;
						},

						/**
						 * Добавляет в экземпляр запроса колонки.
						 * @protected
						 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будут добавлены колонки.
						 */
						addEsqColumns: function(esq) {
							esq.addColumn("CreatedBy");
							var sortedSelectColumn = esq.addColumn("CreatedOn");
							sortedSelectColumn.orderPosition = 0;
							sortedSelectColumn.orderDirection = Terrasoft.OrderDirection.DESC;
							esq.addColumn("Type");
							esq.addColumn("Owner");
							esq.addColumn("IsRead");
							esq.addColumn("SocialMessage");
							esq.addColumn("SocialMessage.Id", "SocialMessageId");
							esq.addColumn("SocialMessage.EntityId", "SocialMessageEntityId");
							esq.addColumn("SocialMessage.EntitySchemaUId", "SocialMessageEntitySchemaUId");
							esq.addColumn("SocialMessage.Parent");
							esq.addColumn("SocialMessage.Parent.Id", "SocialMessageParentId");
							esq.addColumn("SocialMessage.Parent.EntityId", "SocialMessageParentEntityId");
							esq.addColumn("SocialMessage.Parent.EntitySchemaUId", "SocialMessageParentEntitySchemaUId");
						},

						/**
						 * Добавляет в экземпляр запроса фильтры.
						 * @protected
						 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будут добавлены фильтры.
						 */
						addCurrentContactFilters: function(esq) {
							var filters = this.Terrasoft.createFilterGroup();
							filters.add("currentContactFilter",
								esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
									"Owner", Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
							filters.add("notCreatedByCurrentContactFilter",
								esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL,
									"CreatedBy", Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
							esq.filters = filters;
						},

						/**
						 * Инициализирует свойства постраничности EntitySchemaQuery.
						 * @param {Terrasoft.EntitySchemaQuery} select Запрос по выборке уведомлений.
						 * @param {Object} config Конфигурация запроса.
						 * @private
						 */
						initializePageableOptions: function(select, config) {
							var isPageable = config.isPageable;
							select.isPageable = isPageable;
							var rowCount = config.rowCount;
							select.rowCount = isPageable ? rowCount : -1;
							if (!isPageable) {
								return;
							}
							var collection = config.collection;
							var primaryColumnName = config.primaryColumnName;
							var schemaQueryColumns = config.schemaQueryColumns;
							var isClearGridData = config.isClearGridData;
							var conditionalValues = null;
							var loadedRecordsCount = collection.getCount();
							var isNextPageLoading = (loadedRecordsCount > 0 && !isClearGridData);
							if (isNextPageLoading) {
								var lastRecord = config.lastRecord ||
									collection.getByIndex(loadedRecordsCount - 1);
								var columnDataValueType = this.getDataValueType(lastRecord, primaryColumnName);
								conditionalValues = Ext.create("Terrasoft.ColumnValues");
								conditionalValues.setParameterValue(primaryColumnName,
									lastRecord.get(primaryColumnName), columnDataValueType);
								schemaQueryColumns.eachKey(function(columnName, column) {
									var value = lastRecord.get(columnName);
									var dataValueType = this.getDataValueType(lastRecord, columnName);
									if (column.orderDirection !== Terrasoft.OrderDirection.NONE) {
										if (dataValueType === Terrasoft.DataValueType.LOOKUP) {
											value = value ? value.displayValue : null;
											dataValueType = Terrasoft.DataValueType.TEXT;
										}
										conditionalValues.setParameterValue(columnName, value, dataValueType);
									}
								}, this);
							}
							select.conditionalValues = conditionalValues;
						},

						/**
						 * Возвращает тип данных колонки.
						 * @param {Object} record Элемент коллекции уведомлений.
						 * @param {String} columnName Название колонки.
						 * @return {Object} Тип данных колонки.
						 */
						getDataValueType: function(record, columnName) {
							var recordColumn = record.columns[columnName]
								? record.columns[columnName]
								: record.entitySchema.columns[columnName];
							return recordColumn ? recordColumn.dataValueType : null;
						},

						/**
						 * Выполняет загрузку данных.
						 * @protected
						 */
						loadNotifications: function() {
							var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "ESNNotification"
							});
							this.addEsqColumns(esq);
							this.addCurrentContactFilters(esq);
							var rowCount = this.get("RowCount");
							var config = {
								collection: this.get("ESNNotifications"),
								primaryColumnName: "Id",
								schemaQueryColumns: esq.columns,
								isPageable: true,
								rowCount: rowCount,
								isClearGridData: false
							};
							this.initializePageableOptions(esq, config);
							esq.getEntityCollection(this.onNotificationsLoaded, this);
						},

						/**
						 * Отмечает прочитанными все непрочитанные уведомления пользователя.
						 * @protected
						 * @param {Function} callback Функция обратного вызова.
						 * @param {Object} scope Контекст выполнения Функции обратного вызова.
						 */
						markNewNotificationsAsRead: function(callback, scope) {
							var uq = this.Ext.create("Terrasoft.UpdateQuery", {
								rootSchemaName: "ESNNotification"
							});
							this.addCurrentContactFilters(uq);
							uq.filters.add("unreadNotificationFilter",
									uq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "IsRead", false));
							uq.setParameterValue("IsRead", true, Terrasoft.DataValueType.BOOLEAN);
							uq.execute(function(response) {
								if (!response.success) {
									this.log(resources.localizableStrings.NotMarkedNewNotificationsAsRead,
											Terrasoft.LogMessageType.WARNING);
								}
								this.sandbox.publish("UpdateCounters");
								callback.call(this);
							}, scope);
						},

						/**
						 * Заполняет коллекцию уведомлений моделями представлений, на основании полученных данных.
						 * @param {Object} result Результат выполнения запроса на получение данных.
						 */
						onNotificationsLoaded: function(result) {
							if (!result.success) {
								return;
							}
							var dataCollection = result.collection;
							this.set("CanLoadMoreData", dataCollection.getCount() > 0);
							var data = this.Ext.create("Terrasoft.BaseViewModelCollection");
							dataCollection.each(function(item) {
								var model = this.onLoadEntity(item);
								data.add(item.get("Id"), model);
							}, this);
							var collection = this.get("ESNNotifications");
							collection.loadAll(data);
						},

						/**
						 * Выполняет загрузку следующей страницы данных.
						 */
						onLoadNext: function() {
							var canLoadMoreData = this.get("CanLoadMoreData");
							if (canLoadMoreData) {
								this.loadNotifications(false);
							}
						},

						/**
						 * Выполняет инициализацию модели представления.
						 * @private
						 */
						init: function() {
							this.buildSchema(function() {
								this.markNewNotificationsAsRead(this.loadNotifications, this);
							}, this);
							Terrasoft.ServerChannel.on(Terrasoft.EventName.ON_MESSAGE,
								this.onSocialMessageReceived, this);
						},

						/**
						 * Обработчик сообщения о новых комментариях и лайках.
						 * @param {Object} scope Контекст вызова функции обратного вызова.
						 * @param {object} response Ответ от сервера.
						 * @private
						 */
						onSocialMessageReceived: function(scope, response) {
							if (!response) {
								return;
							}
							if (response.Header.Sender === ESNConstants.WebSocketMessageHeader.ESNNotification) {
								var receivedMessage = this.Ext.decode(response.Body);
								var currentContactId = Terrasoft.core.enums.SysValue.CURRENT_USER_CONTACT.value;
								if (currentContactId === receivedMessage.createdBy.value) {
									return;
								}
								var viewModelClass = this.getViewModelClass();
								var notification = this.prepareNotification(viewModelClass, receivedMessage);
								var notifications = this.get("ESNNotifications");
								if (!notifications.contains(receivedMessage.id)) {
									notifications.add(receivedMessage.id, notification, 0);
								}
							}
						},

						/**
						 * Преобразовывает входящее сообщение в уведомление.
						 * @param {Function|String} viewModelClass Класс модели представления уведомления.
						 * @param {Object} message Входящее сообщение.
						 * @return {Object} Уведомление.
						 */
						prepareNotification: function(viewModelClass, message) {
							var notification = this.Ext.create(viewModelClass, {
								Ext: this.Ext,
								sandbox: this.sandbox,
								Terrasoft: this.Terrasoft
							});
							notification.init();
							notification.set("Id", message.id);
							notification.set("IsRead", false);
							notification.set("CreatedBy", message.createdBy);
							notification.set("CreatedOn", new Date(message.createdOn));
							notification.set("SocialMessage", message.socialMessage);
							notification.set("SocialMessageParams", message.socialMessage);
							notification.set("Type", message.type);
							notification.isNew = false;
							return notification;
						}
					}
				});
				viewModel.Ext = this.Ext;
				viewModel.Terrasoft = this.Terrasoft;
				viewModel.sandbox = this.sandbox;
				return viewModel;
			},

			/**
			 * Выполняет прорисовку модуля в контейнер.
			 * @private
			 * @param {Ext.Element} renderTo Элемент, в который будет происходить отрисовка.
			 */
			render: function(renderTo) {
				var view = this.getView();
				var viewModel = this.getViewModel();
				view.bind(viewModel);
				view.render(renderTo);
				viewModel.init();
			},

			/**
			 * Деструктор класса.
			 * @private
			 */
			destroy: function() {
				this.callParent(arguments);
			}
		});
		return Terrasoft.ESNNotificationModule;
	});
