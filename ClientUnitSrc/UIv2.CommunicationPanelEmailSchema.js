define("CommunicationPanelEmailSchema", ["CommunicationPanelEmailSchemaResources", "ContainerListGenerator",
	"ContainerList", "ConfigurationConstants", "ConfigurationEnums", "NetworkUtilities", "EmailConstants",
	"ProcessModuleUtilities", "ExchangeNUIConstants", "BusinessRulesApplierV2"],
	function(resources, ContainerListGenerator, ContainerList, ConfigurationConstants, ConfigurationEnums,
			NetworkUtilities, EmailConstants, ProcessModuleUtilities, ExchangeNUIConstants, BusinessRulesApplier) {
	return {
		entitySchemaName: EmailConstants.entitySchemaName,
		messages: {
			/**
			 * @message GetHistoryState
			 * Сообщение запрашивает текущее состояние истории.
			 */
			"GetHistoryState": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * @message PushHistoryState
			 * Сообщение устанавливает новоее состояние истории.
			 */
			"PushHistoryState": {
				mode: this.Terrasoft.MessageMode.BROADCAST,
				direction: this.Terrasoft.MessageDirectionType.PUBLISH
			}
		},
		attributes: {
			/**
			 * Коллекция писем.
			 * @Type {Terrasoft.BaseViewModelCollection}
			 */
			"EmailCollection": {
				dataValueType: this.Terrasoft.DataValueType.COLLECTION
			},

			/**
			 * Признак возможности загрузить еще одну страницу данных.
			 * @private
			 */
			"CanLoadMoreData": {
				dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
				value: true
			},

			/**
			 * Конфигурационный объект для формирования класа модели почтового сообщения
			 * и конфига отображения почты.
			 * @private
			 */
			"SchemaGeneratorConfig": {
				dataValueType: this.Terrasoft.DataValueType.CUSTOM_OBJECT
			},

			/**
			 * Конфиг представления для почтового сообщения.
			 * @private
			 */
			"EmailViewConfig": {
				dataValueType: this.Terrasoft.DataValueType.CUSTOM_OBJECT
			},

			/**
			 * Количество писем на одной странице.
			 */
			"RowCount": {
				dataValueType: this.Terrasoft.DataValueType.INTEGER,
				value: 15
			},

			/**
			 * Класс модели представления почтового сообщения.
			 */
			"ViewModelClass": {
				dataValueType: this.Terrasoft.DataValueType.CUSTOM_OBJECT
			},

			/**
			 * Массив параметров доступных для запуска процессов почтовых сообщений.
			 * @Type {Array}
			 */
			"EmailProcessList": {
				dataValueType: this.Terrasoft.DataValueType.CUSTOM_OBJECT
			},

			/**
			 * Массив колонок связей сущности.
			 * @Type {Array}
			 */
			"EntityConnectionColumnList": {
				dataValueType: this.Terrasoft.DataValueType.CUSTOM_OBJECT
			},

			/**
			 * Массив колонок связей сущности по умолчанию.
			 * @Type {Array}
			 */
			"DefaultEntityConnectionColumns": {
				dataValueType: this.Terrasoft.DataValueType.CUSTOM_OBJECT
			},

			/**
			 * Тег для выбора списка процессов почтовых сообщений.
			 * @Type {String}
			 */
			"EmailProcessTag": {
				dataValueType: this.Terrasoft.DataValueType.TEXT,
				value: "Email Process"
			},

			/**
			 * Тип почтового сообщения.
			 */
			"EmailType": {
				"dataValueType": Terrasoft.DataValueType.GUID,
				"value": EmailConstants.emailType.INCOMING
			},

			/**
			 * Признак обработки почтовых сообщений.
			 */
			"IsProcessed": {
				"dataValueType": Terrasoft.DataValueType.BOOLEAN,
				"value": true
			},

			/**
			 * Коллекция элементов меню кнопки выбора типа почтовых сообщений.
			 */
			"EmailTypeMenuItems": {dataValueType: Terrasoft.DataValueType.COLLECTION},

			/**
			 * Коллекция пунктов меню кнопки действий в шапке коммуникационной панели.
			 */
			"EmailTabActionsMenuCollection": {
				dataValueType: this.Terrasoft.DataValueType.COLLECTION
			},

			/**
			 * Идентификатор выбранного почтового сообщения.
			 */
			"SelectedEmailItemId": {
				dataValueType: this.Terrasoft.DataValueType.GUID,
				value: Terrasoft.GUID_EMPTY
			},

			/**
			 * Признак окончания загрузки писем в панели.
			 */
			"IsDataLoaded": {
				dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
				value: true
			},

			/**
			 * Устанавливает признак отображения кнопки настройки почтовых ящиков в функциональной кнопке email панели.
			 */
			"IsEmailBoxSettingsButtonVisible": {
				dataVlueType: this.Terrasoft.DataValueType.BOOLEAN
			}
		},
		methods: {
			/**
			 * Устанавливает свойство config при формировании отображения почтового сообщения.
			 * Используется как обработчик события "onGetItemConfig" экземпляра ContainerList.
			 * @param {Object} itemConfig Конфигурационнй объект.
			 */
			onGetItemConfig: function(itemConfig) {
				var viewConfig =  this.Terrasoft.deepClone(this.get("EmailViewConfig"));
				itemConfig.config = viewConfig;
			},

			/**
			 * Выполняет загрузку следующей страницы данных.
			 */
			onLoadNext: function() {
				var canLoadMoreData = this.get("CanLoadMoreData");
				if (canLoadMoreData) {
					this.loadEmails();
				}
			},

			/**
			 * Возвращает тип данных колонки.
			 * @param {Object} record Элемент коллекции писем.
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
			 * Выполняет загрузку почтовых сообщений.
			 * @protected
			 * @param {Boolean} clearCollection Признак необходимости очистки коллекции.
			 */
			loadEmails: function(clearCollection) {
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: EmailConstants.entitySchemaName
				});
				this.addEsqColumns(esq);
				this.addFilters(esq);
				this.addSorting(esq);
				var rowCount = this.get("RowCount");
				var config = {
					collection: this.get("EmailCollection"),
					primaryColumnName: "Id",
					schemaQueryColumns: esq.columns,
					isPageable: true,
					rowCount: rowCount,
					isClearGridData: clearCollection
				};
				this.initializePageableOptions(esq, config);
				this.set("IsDataLoaded", false);
				esq.getEntityCollection(function(result) {
					this.onEmailsLoaded(result, clearCollection);
				}, this);
			},

			/**
			 * Выполняет перезагрузку почтовых сообщений.
			 * @protected
			 */
			reloadEmails: function() {
				this.showBodyMask({
					selector: ".right-panel-modules-container",
					timeout: 0
				});
				this.loadEmails(true);
			},

			/**
			 * Заполняет коллекцию писем моделями представлений, на основании полученных данных.
			 * @param {Object} result Результат выполнения запроса на получение данных.
			 * @param {Boolean} clearCollection
			 */
			onEmailsLoaded: function(result, clearCollection) {
				if (result.success) {
					var dataCollection = result.collection;
					this.set("CanLoadMoreData", dataCollection.getCount() > 0);
					var data = this.Ext.create("Terrasoft.BaseViewModelCollection");
					dataCollection.each(function(item) {
						var model = this.onLoadEntity(item);
						data.add(item.get("Id"), model);
					}, this);
					var collection = this.get("EmailCollection");
					if (clearCollection) {
						collection.clear();
					}
					collection.loadAll(data);
					var emailType = this.get("EmailType");
					if (emailType === EmailConstants.emailType.INCOMING) {
						this.loadEmailSenders(data.getKeys());
					}
				}
				this.hideBodyMask();
				this.set("IsDataLoaded", true);
			},

			/**
			 * Запрашивает список контактов отправителей для указанных писем.
			 * @param {Array} emailIds Список писем.
			 */
			loadEmailSenders: function(emailIds) {
				var sendersESQ = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "ActivityParticipant"
				});
				sendersESQ.addColumn("Activity");
				sendersESQ.addColumn("Participant");
				sendersESQ.addColumn("CreatedOn");
				var createdOnColumn = sendersESQ.columns.get("CreatedOn");
				createdOnColumn.orderPosition = 2;
				createdOnColumn.orderDirection = Terrasoft.OrderDirection.DESC;
				var filters = this.Terrasoft.createFilterGroup();
				filters.add("RoleFilter",
					sendersESQ.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Role", ConfigurationConstants.Activity.ParticipantRole.From));
				filters.add("ActivityFilter",
					sendersESQ.createColumnInFilterWithParameters(
						"Activity", emailIds));
				sendersESQ.filters = filters;
				sendersESQ.getEntityCollection(this.onSendersLoaded, this);
			},

			/**
			 * Устанавливает полученые контакты отправителей в письма.
			 * @param {Object} response Ответ сервера.
			 */
			onSendersLoaded: function(response) {
				if (response.success) {
					var senders = response.collection;
					var emails = this.get("EmailCollection");
					senders.each(function(sender) {
						var senderEmail = sender.get("Activity");
						var senderContact = sender.get("Participant");
						var email = emails.find(senderEmail.value);
						if (!this.Ext.isEmpty(email)) {
							email.initSenderInfo(senderContact);
						}
					}, this);
				}
			},

			/**
			 * Формирует экземпляр модели представления и заполняет его значениями.
			 * @param {Terrasoft.BaseViewModel} entity Почтовое сообщение.
			 * @return {viewModelClass} Экземпляр модели представления.
			 */
			onLoadEntity: function(entity) {
				var viewModelClass = this.getViewModelClass();
				var processList = this.get("EmailProcessList");
				var relationColumns = this.get("EntityConnectionColumnList");
				var defaultRelationColumns = this.get("DefaultEntityConnectionColumns");
				var viewModel = this.Ext.create(viewModelClass, {
					Ext: this.Ext,
					sandbox: this.sandbox,
					Terrasoft: this.Terrasoft,
					values: {
						"ProcessParametersArray": this.Terrasoft.deepClone(processList),
						"EntityConnectionColumnList": this.Terrasoft.deepClone(relationColumns),
						"DefaultEntityConnectionColumns": this.Terrasoft.deepClone(defaultRelationColumns)
					}
				});
				viewModel.setColumnValues(entity, {preventValidation: true});
				viewModel.init();
				BusinessRulesApplier.applyDependencies(viewModel);
				this.subscribeModelEvents(viewModel);
				return viewModel;
			},

			/**
			 * Возвращает класс модели представления почтового сообщения.
			 * @return {Object|*} Класс модели представления почтового сообщения.
			 */
			getViewModelClass: function() {
				var viewModelClass = this.get("ViewModelClass");
				return this.Terrasoft.deepClone(viewModelClass);
			},

			/**
			 * Инициализирует свойства постраничности EntitySchemaQuery.
			 * @param {Terrasoft.EntitySchemaQuery} select Запрос по выборке почтовых сообщений.
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
					conditionalValues = this.Ext.create("Terrasoft.ColumnValues");
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
			 * Добавляет в экземпляр запроса колонки.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будут добавлены колонки.
			 */
			addEsqColumns: function(esq) {
				var columns = this.getEmailSelectColumns();
				this.Terrasoft.each(columns, function(columnName) {
					esq.addColumn(columnName);
				}, this);
			},

			/**
			 * Возвращает массив загружаемых колонок.
			 * @private
			 * @return {Array} Массив колонок.
			 */
			getEmailSelectColumns: function() {
				var entityConnectionColumns = this.get("EntityConnectionColumnList");
				var emailSelectColumns = ["Id", "Author", "Owner", "Contact", "Sender", "Recepient", "CopyRecepient",
					"BlindCopyRecepient", "Body", "Title", "StartDate", "MessageType", "Type", "CreatedOn",
					"SendDate", "ModifiedOn", "IsNeedProcess", "Priority", "DueDate", "ActivityCategory", "Status"];
				emailSelectColumns = this.Ext.Array.merge(emailSelectColumns, entityConnectionColumns);
				return emailSelectColumns;
			},

			/**
			 * Добавляет в экземпляр запроса фильтры.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос, в который будут добавлены фильтры.
			 */
			addFilters: function(esq) {
				var emailType = this.get("EmailType");
				var isProcessed = this.get("IsProcessed");
				var filters = this.Terrasoft.createFilterGroup();
				filters.add("currentContactFilter", this.Terrasoft.createColumnInFilterWithParameters(
						"[ActivityParticipant:Activity:Id].Participant", [Terrasoft.SysValue.CURRENT_USER_CONTACT.value]));
				filters.add("ActivityType",
					esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Type", ConfigurationConstants.Activity.Type.Email));
				if (emailType === EmailConstants.emailType.INCOMING) {
					filters.add("MessageType",
						esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"MessageType", ConfigurationConstants.Activity.MessageType.Incoming));
				} else if (emailType === EmailConstants.emailType.OUTGOING) {
					filters.add("MessageType",
						esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"MessageType", ConfigurationConstants.Activity.MessageType.Outgoing));
					filters.add("SendDateIsNotNull", this.Terrasoft.createIsNotNullFilter(
						this.Ext.create("Terrasoft.ColumnExpression", {columnPath: "SendDate"})
					));
				} else if (emailType === EmailConstants.emailType.DRAFT) {
					filters.add("MessageType",
						esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"MessageType", ConfigurationConstants.Activity.MessageType.Outgoing));
					filters.add("SendDateIsNull", this.Terrasoft.createIsNullFilter(
						this.Ext.create("Terrasoft.ColumnExpression", {columnPath: "SendDate"})
					));
				}
				filters.add("isProcessed",
						esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"IsNeedProcess", isProcessed));
				esq.filters = filters;
			},

			/**
			 * Добавляет сортировку в запрос.
			 * @protected
			 * @param {Terrasoft.EntitySchemaQuery} esq Запрос.
			 */
			addSorting: function(esq) {
				var sendDateColumn = esq.columns.get("SendDate");
				sendDateColumn.orderPosition = 0;
				sendDateColumn.orderDirection = Terrasoft.OrderDirection.DESC;
				var modifiedOnColumn = esq.columns.get("ModifiedOn");
				modifiedOnColumn.orderPosition = 1;
				modifiedOnColumn.orderDirection = Terrasoft.OrderDirection.DESC;
			},

			/**
			 * @inheritDoc BaseSchemaViewModel#init
			 * @protected
			 * @overridden
			 * @param {Function} callback Функция обратного вызова.
			 */
			init: function(callback) {
				this.initEmailTabActionsMenuCollection();
				this.initParameters();
				this.callParent([function() {
					Terrasoft.chain(
						this.initEmailProcessTag,
						this.initBuildType,
						this.loadProcessList,
						this.loadEntityConnectionColumns,
						this.initDefaultEntityConnectionColumns,
						this.buildSchema,
						function() {
							this.loadEmails();
							callback();
						}, this);
				}, this]);
			},

			/**
			 * Формирует коллекцию пунктов меню кнопки действий.
			 */
			initEmailTabActionsMenuCollection: function() {
				var collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
				var synchronizeEmailCaption = this.get("Resources.Strings.SynchronizeEmail");
				var synchronizeEmailItem = this.Ext.create("Terrasoft.BaseViewModel", {
					values: {
						"Caption": synchronizeEmailCaption,
						"Click": {bindTo: "onSynchronizeEmail"},
						"MarkerValue": synchronizeEmailCaption
					}
				});
				collection.addItem(synchronizeEmailItem);
				var emailBoxSettingsCaption = this.get("Resources.Strings.EmailBoxSettings");
				var emailBoxSettingsItem = this.Ext.create("Terrasoft.BaseViewModel", {
					values: {
						"Caption": emailBoxSettingsCaption,
						"Click": {bindTo: "navigateToMailboxSyncSettings"},
						"MarkerValue": emailBoxSettingsCaption,
						"Visible": {
							bindTo: "IsEmailBoxSettingsButtonVisible"
						}
					}
				});
				collection.addItem(emailBoxSettingsItem);
				var emailBoxIsProcessedCaption = this.get("Resources.Strings.EmailBoxIsProcessedCaption");
				var emailBoxIsProcessedItem = this.Ext.create("Terrasoft.BaseViewModel", {
					values: {
						"Caption": emailBoxIsProcessedCaption,
						"Click": {bindTo: "onProcessChange"},
						"Visible": {bindTo: "IsProcessed"},
						"MarkerValue": emailBoxIsProcessedCaption
					}
				});
				collection.addItem(emailBoxIsProcessedItem);
				var emailBoxNotProcessedCaption = this.get("Resources.Strings.EmailBoxNotProcessedCaption");
				var emailBoxNotProcessedItem = this.Ext.create("Terrasoft.BaseViewModel", {
					values: {
						"Caption": emailBoxNotProcessedCaption,
						"Click": {bindTo: "onProcessChange"},
						"Visible": {
							bindTo: "IsProcessed",
							bindConfig: {
								converter: function(value) {
									return !value;
								}
							}
						},
						"MarkerValue": emailBoxNotProcessedCaption
					}
				});
				collection.addItem(emailBoxNotProcessedItem);
				this.set("EmailTabActionsMenuCollection", collection);
			},

			/**
			 * Устанавливает тип сборки и задает параметр отображения элемента функциональной кнопки настройки почтовых
			 * ящиков.
			 * @param {Function} callback Функция обратного вызова.
			 */
			initBuildType: function(callback) {
				var sysSettings = ["BuildType"];
				Terrasoft.SysSettings.querySysSettings(sysSettings, function(response) {
					var buildType = response.BuildType.value;
					this.set("IsEmailBoxSettingsButtonVisible", buildType !== ConfigurationConstants.BuildType.Public);
					callback();
				}, this);
			},

			/**
			 * Запрашивает тег для фильтрации процессов.
			 * @param {Function} callback Функция обратного вызова.
			 */
			initEmailProcessTag: function(callback) {
				this.Terrasoft.SysSettings.querySysSettingsItem("EmailProcessTag", function(value) {
						this.set("EmailProcessTag", value);
						if (callback) {
							callback();
						}
					}, this);
			},

			/**
			 * Инициализация начальных параметров.
			 * @protected
			 */
			initParameters: function() {
				this.set("EmailTypeMenuItems", this.Ext.create("Terrasoft.BaseViewModelCollection"));
				this.set("EmailCollection", this.Ext.create("Terrasoft.BaseViewModelCollection"));
				this.set("SchemaGeneratorConfig", {
					schemaName: "EmailItemSchema",
					profileKey: "EmailItemSchema"
				});
			},

			/**
			 * Формирует класс модели представления и конфигурацию представления почтового сообщения по схеме.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова функции обратного вызова.
			 */
			buildSchema: function(callback, scope) {
				var schemaBuilder = this.Ext.create("Terrasoft.SchemaBuilder");
				var generatorConfig = this.Terrasoft.deepClone(this.get("SchemaGeneratorConfig"));
				schemaBuilder.build(generatorConfig, function(viewModelClass, viewConfig) {
					this.set("ViewModelClass", viewModelClass);
					this.createEmailRelationPanelConfig(viewConfig);
					var view = {
						"id": "emailContainer",
						"classes": {wrapClassName: ["email-container"]},
						"items": [{
							"className": "Terrasoft.Container",
							"markerValue": {"bindTo": "getEmailMarkerValue"},
							"items": viewConfig
						}]
					};
					this.set("EmailViewConfig", view);
					callback.call(scope);
				}, this);
			},

			/**
			 * Открывает карточку создания нового e-mail.
			 */
			createEmail: function() {
				var historyState = this.sandbox.publish("GetHistoryState");
				var config = {
					sandbox: this.sandbox,
					entitySchemaName: EmailConstants.entitySchemaName,
					primaryColumnValue: this.Terrasoft.GUID_EMPTY,
					operation: ConfigurationEnums.CardStateV2.ADD,
					historyState: historyState,
					typeId: ConfigurationConstants.Activity.Type.Email
				};
				NetworkUtilities.openCardInChain(config);
			},

			/**
			 * Открывает модуль настроек почтового ящика.
			 */
			navigateToMailboxSyncSettings: function() {
				var sandbox = this.sandbox;
				var tag = "MailboxSynchronizationSettingsModule";
				var currentHistoryState = sandbox.publish("GetHistoryState").hash.historyState;
				if (currentHistoryState !== tag) {
					if (tag !== "MailboxSynchronizationSettingsModule") {
						this.showBodyMask();
					}
					sandbox.publish("PushHistoryState", {hash: tag});
				}
			},

			/**
			 * Синхронизирует email сообщения.
			 * @protected
			 * @overridden
			 */
			onSynchronizeEmail: function() {
				this.checkMailBoxSyncSettings(function(isMailboxExist) {
					if (!isMailboxExist) {
						this.Terrasoft.showInformation(this.get("Resources.Strings.MailboxSettingsEmpty"));
						return;
					}
					var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "MailboxSyncSettings"
					});
					select.addColumn("[ActivityFolder:Name:MailboxName].Id", "ActivityFolderId");
					select.addColumn("SenderEmailAddress", "SenderEmailAddress");
					select.addColumn("MailServer.Id", "MailServerId");
					select.addColumn("MailServer.Type.Id", "MailServerTypeId");
					select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"SysAdminUnit", this.Terrasoft.SysValue.CURRENT_USER.value));
					select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"EnableMailSynhronization", true));
					select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"[ActivityFolder:Name:MailboxName].FolderType", ConfigurationConstants.Folder.Type.MailBox));
					select.getEntityCollection(function(response) {
						if (response.success) {
							this.downloadMessages(response.collection);
						}
					}, this);
				}, this);
			},

			/**
			 * Проверяет наличие настроек синхронизации с почтовыми ящиками.
			 * @protected
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Function} callback.isMailboxExist Результат проверки.
			 * @param {Object} scope Контекст вызова функции обратного вызова.
			 */
			checkMailBoxSyncSettings: function(callback, scope) {
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "MailboxSyncSettings"
				});
				esq.addColumn("Id");
				esq.addColumn("EnableMailSynhronization");
				esq.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ImportTasks", "ImportTasks");
				esq.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ImportAppointments", "ImportAppointments");
				esq.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ExportActivities", "ExportActivities");
				var filter = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"SysAdminUnit", this.Terrasoft.SysValue.CURRENT_USER.value);
				esq.filters.addItem(filter);
				esq.getEntityCollection(function(response) {
					if (!response.success) {
						return;
					}
					var collection = response.collection;
					var isMailboxExist = false;
					if (!collection.isEmpty()) {
						collection.each(function(item) {
							isMailboxExist = isMailboxExist || (item.get("EnableMailSynhronization") === true);
						});
					}
					callback.call(scope, isMailboxExist);
				}, this);
			},

			/**
			 * Загружает email сообщения.
			 * @private
			 * @param {Terrasoft.Collection} collection Коллекция экземпляров сущностей.
			 */
			downloadMessages: function(collection) {
				var requestsCount = 0;
				var messageArray = [];
				collection.each(function(item) {
					var requestUrl;
					var data = {};
					if (item.get("MailServerTypeId") === ExchangeNUIConstants.MailServer.Type.Exchange) {
						data = {
							create: true,
							interval: 0,
							serverId: item.get("MailServerId"),
							senderEmailAddress: item.get("SenderEmailAddress")
						};
						requestUrl = this.Terrasoft.workspaceBaseUrl +
								"/rest/MailboxSettingsService/CreateEmailSyncJob";
					} else {
						requestUrl = this.Terrasoft.workspaceBaseUrl +
								"/ServiceModel/ProcessEngineService.svc/LoadImapEmailsProcess/" +
								"Execute?ResultParameterName=LoadResult" +
								"&MailBoxFolderId=" + item.get("ActivityFolderId");
					}
					this.showBodyMask();
					requestsCount++;
					this.Ext.Ajax.request({
						url: requestUrl,
						timeout: 180000,
						headers: {
							"Content-Type": "application/json",
							"Accept": "application/json"
						},
						method: "POST",
						scope: this,
						callback: function(request, success, response) {
							var responseData;
							if (success) {
								if (response.responseXML === null) {
									var result = this.Ext.decode(response.responseText);
									responseData = {
										Messages: []
									};
									if (result.CreateDeleteSyncJobResult) {
										responseData.Messages.push(result.CreateDeleteSyncJobResult);
									}
								} else {
									var responseValue = this.Ext.isIE8 || this.Ext.isIE9 ?
											response.responseXML.firstChild.text :
											response.responseXML.firstChild.textContent;
									responseData = this.Ext.decode(this.Ext.decode(responseValue));
								}
								if (responseData && responseData.Messages.length > 0) {
									messageArray = messageArray.concat(responseData.Messages);
								}
							}
							if (--requestsCount <= 0) {
								var message = this.get("Resources.Strings.LoadingMessagesComplete");
								if (messageArray.length > 0) {
									message = "";
									this.Terrasoft.each(messageArray, function(element) {
										message = message.concat(this.Ext.String.format("[{0}]: {1} ", element.key,
												element.message));
									}, this);
								}
								this.hideBodyMask();
								this.Terrasoft.utils.showInformation(message);
							}
						},
						jsonData: data
					});
				}, this);
			},

			/**
			 * Запрашивает доступные для запуска процессы.
			 * @param {Function} callback Функция обратного вызова.
			 */
			loadProcessList: function(callback) {
				this.set("EmailProcessList", []);
				var filters = this.getProcessFilters();
				var select = ProcessModuleUtilities.createRunProcessSelect(filters);
				select.getEntityCollection(function(result) {
					if (result.success) {
						this.initEmailProcessList(result.collection);
					}
					callback();
				}, this);
			},

			/**
			 * Инициализирует список колонок связи, отображаемых по умолчанию.
			 * @param {Function} callback Функция обратного вызова.
			 */
			initDefaultEntityConnectionColumns: function(callback) {
				var profile = this.get("Profile");
				var defaultEntityConnectionColumns = profile.defaultEntityConnectionColumns;
				this.set("DefaultEntityConnectionColumns", defaultEntityConnectionColumns);
				if (callback) {
					callback();
				}
			},

			/**
			 * Загружает колонки связей сущности.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст.
			 */
			loadEntityConnectionColumns: function(callback) {
				var entitySchemaUId = this.entitySchema.uId;
				var cacheItemName = entitySchemaUId + "_" + this.name;
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "EntityConnection",
					serverESQCacheParameters: {
						cacheLevel: Terrasoft.ESQServerCacheLevels.SESSION,
						cacheGroup: this.name,
						cacheItemName: cacheItemName
					}
				});
				esq.addColumn("ColumnUId");
				esq.filters.addItem(esq.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL, "SysEntitySchemaUId", this.entitySchema.uId));
				esq.getEntityCollection(function(result) {
					var entityConnectionArray = [];
					if (result.success) {
						var entities = result.collection;
						var activityConnection = this.entitySchema.getColumnByName("ActivityConnection");
						var viewModel = this.Ext.create("Terrasoft.BaseViewModel", {
							values: {
								"Name": activityConnection.name,
								"Caption": activityConnection.caption,
								"ColumnUId": activityConnection.uId
							}
						});
						entities.add(viewModel.ColumnUId, viewModel, viewModel.ColumnUId);
						this.sortEntityConnectionColumns(entities);
						this.fillEntityConnectionColumnsList(entities, entityConnectionArray);
						entityConnectionArray.unshift("Contact", "Account");
					}
					this.set("EntityConnectionColumnList", entityConnectionArray);
					callback();
				}, this);
			},

			/**
			 * Заполняет массив связей сущности.
			 * @param {Terrasoft.BaseViewModelCollection} entities Коллекция связей сущности.
			 * @param {Array} entityConnectionArray Массив связей сущности.
			 */
			fillEntityConnectionColumnsList: function(entities, entityConnectionArray) {
				var entitySchema = this.entitySchema;
				entities.each(function(item) {
					var entityColumn = entitySchema.getColumnByUId(item.get("ColumnUId"));
					if (!(entityColumn.name === "Contact" || entityColumn.name === "Account")) {
						entityConnectionArray.push(entityColumn.name);
					}
				}, this);
			},

			/**
			 * Сортирует коллекцию связей сущности.
			 * @param {Terrasoft.BaseViewModelCollection} entities Коллекция связей сущности.
			 */
			sortEntityConnectionColumns: function(entities) {
				var entitySchema = this.entitySchema;
				entities.sortByFn(function(elA, elB) {
					var aColumnUId = elA.get("ColumnUId");
					var bColumnUId = elB.get("ColumnUId");
					var entityColumnA = null;
					var entityColumnB = null;
					if (!this.Ext.isEmpty(aColumnUId) && !this.Ext.isEmpty(bColumnUId)) {
						entityColumnA = entitySchema.getColumnByUId(elA.get("ColumnUId"));
						entityColumnB = entitySchema.getColumnByUId(elB.get("ColumnUId"));
					} else {
						return;
					}
					if (entityColumnA.caption === entityColumnB.caption) {
						return 0;
					}
					return (entityColumnA.caption < entityColumnB.caption) ? -1 : 1;
				}, this);
			},

			/**
			 * Формирует массив дополнительных фильтров для выбора доступных для запуска процессов.
			 * @return {Array} Массив дополнительных фильтров.
			 */
			getProcessFilters: function() {
				var filters = [];
				var emailProcessTag = this.get("EmailProcessTag");
				filters.push(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "TagProperty",
					emailProcessTag));
				return filters;
			},

			/**
			 * Формирует массив параметров доступных для запуска процессов почтовых сообщений.
			 * @param {Terrasoft.Collection} processList Коллекция процессов почтовых сообщений.
			 */
			initEmailProcessList: function(processList) {
				var emailProcessList = this.get("EmailProcessList");
				processList.each(function(process) {
					var proceessId = process.get("Id");
					var processCaption = process.get("Caption");
					emailProcessList.push({
						"Id": proceessId,
						"Caption": processCaption,
						"Click": {"bindTo": "runProcess"},
						"Tag": proceessId,
						"MarkerValue": processCaption
					});
				}, this);
				this.set("EmailProcessList", emailProcessList);
			},

			/**
			 * Подписывает на события модели письма.
			 * @private
			 * @param {Terrasoft.BaseViewModel} model Модель письма.
			 */
			subscribeModelEvents: function(model) {
				model.on("emailDeleted", this.onDeleteEmail, this);
				model.on("entitySaved", this.onEntitySaved, this);
			},

			/**
			 * Отписывает от событий модели письма.
			 * @private
			 * @param {Terrasoft.BaseViewModel} model Модель письма.
			 */
			unsubscribeModelEvents: function(model) {
				model.un("emailDeleted", this.onDeleteEmail, this);
				model.un("entitySaved", this.onEntitySaved, this);
			},

			/**
			 * Обрабатывает сохранение элемента коллекции.
			 * @param {Terrasoft.BaseViewModel} model Модель письма.
			 */
			onEntitySaved: function(model) {
				var result = true;
				var emailType = this.get("EmailType");
				var isProcessed = this.get("IsProcessed");
				var messageType = model.get("MessageType");
				var sendDate = model.get("SendDate");
				var isNeedProcess = model.get("IsNeedProcess");
				if (emailType === EmailConstants.emailType.INCOMING || emailType === EmailConstants.emailType.OUTGOING) {
					result = result && (messageType.value === emailType);
				} else if (emailType === EmailConstants.emailType.DRAFT) {
					result = result && (sendDate === null);
				}
				result = result && (isNeedProcess === isProcessed);
				if (!result) {
					this.unsubscribeModelEvents(model);
					var collection = this.get("EmailCollection");
					collection.remove(model);
				}
			},

			/**
			 * Удаляет письмо из коллекции писем.
			 * @param {Terrasoft.BaseViewModel} model Модель письма.
			 */
			onDeleteEmail: function(model) {
				this.unsubscribeModelEvents(model);
				var collection = this.get("EmailCollection");
				collection.remove(model);
			},

			/**
			 * Получает заголовок для кнопки изменения отображения типа почтового сообщения.
			 * @return {String} Заголовок для кнопки.
			 */
			getMailTypeCaption: function() {
				var emailTypeCaption = this.get("Resources.Strings.IncomingEmail");
				var emailTypeCaptionGuid = this.get("EmailType");
				if (emailTypeCaptionGuid === EmailConstants.emailType.OUTGOING) {
					emailTypeCaption = this.get("Resources.Strings.OutgoingEmail");
				} else if (emailTypeCaptionGuid === EmailConstants.emailType.DRAFT)
				{
					emailTypeCaption = this.get("Resources.Strings.DraftEmail");
				}
				return emailTypeCaption;
			},

			/**
			 * Изменяет тип выводимых почтовых сообщений
			 * и перегружает коллекцию почтовых сообщений.
			 * @param {Terrasoft.DataValueType.GUID} value Уникальный идентификатор типа почтового сообщения.
			 */
			onMailTypeChange: function(value) {
				this.set("EmailType", value);
				this.reloadEmails();
			},

			/**
			 * Возвращает пункт меню для кнопки выбора типа связей.
			 * @protected
			 * @param {Object} column Колонка связи.
			 * @return {Terrasoft.BaseViewModel} Модель представления пункта меню.
			 */
			generateRelationMenuItemConfig: function(column) {
				var imageConfig = this.getRelationImageConfig(column.name);
				var config = {
					"click": {"bindTo": "onLookupParametersChange"},
					"caption": column.caption,
					"imageConfig": imageConfig,
					"tag": column.name,
					"visible": {
						"bindTo": column.name,
						"bindConfig": {
							"converter": "isEmptyColumnValue"
						}
					},
					"markerValue": column.caption
				};
				return config;
			},

			/**
			 * Возвращает коллекцию пунктов меню для кнопки выбора типа почтовых сообщений.
			 * @protected
			 * @return {Terrasoft.BaseViewModelCollection} Коллекция пунктов меню.
			 */
			getEmailTypeMenuItems: function() {
				var emailTypeMenuItems = this.get("EmailTypeMenuItems");
				var config = {
					onClick: "onMailTypeChange",
					caption: this.get("Resources.Strings.IncomingEmail"),
					tag: EmailConstants.emailType.INCOMING
				};
				var emailTypeMenuItem = this.getTypeEmailMenuItem(config);
				emailTypeMenuItems.addItem(emailTypeMenuItem);
				config.tag = EmailConstants.emailType.OUTGOING;
				config.caption = this.get("Resources.Strings.OutgoingEmail");
				emailTypeMenuItem = this.getTypeEmailMenuItem(config);
				emailTypeMenuItems.addItem(emailTypeMenuItem);
				config.tag = EmailConstants.emailType.DRAFT;
				config.caption = this.get("Resources.Strings.DraftEmail");
				emailTypeMenuItem = this.getTypeEmailMenuItem(config);
				emailTypeMenuItems.addItem(emailTypeMenuItem);
				return emailTypeMenuItems;
			},

			/**
			 * Возвращает пункт меню для кнопки выбора типа почтовых сообщений.
			 * @protected
			 * @param {Object} config Параметры для создания представления пункта меню.
			 * @param {String} config.caption Название пункта меню.
			 * @param {String} config.tag Тег элемента пункта меню.
			 * @param {Object} config.onClick Обработчик нажатия по пункту меню.
			 * @return {Terrasoft.BaseViewModel} Модель представления пункта меню.
			 */
			getTypeEmailMenuItem: function(config) {
				var caption = config.caption;
				var onClick = config.onClick;
				var tag = config.tag;
				return this.Ext.create("Terrasoft.BaseViewModel", {
					values: {
						"Caption": caption,
						"Tag": tag,
						"Click": {"bindTo": onClick}
					}
				});
			},

			/**
			 * Обработчик смены состояния обработки почтовых сообщений.
			 */
			onProcessChange: function() {
				var isProcessed = this.get("IsProcessed");
				this.set("IsProcessed", !isProcessed);
				this.reloadEmails();
			},

			/**
			 * @inheritDoc BaseSchemaViewModel#getProfileKey
			 * @overridden
			 * @return {string} Ключ профиля.
			 */
			getProfileKey: function() {
				return "EmailRelationDefaultButtons";
			},

			/**
			 * Создает объект с параметрами панели с кнопками связей письма и добавлет ее в элементы
			 * представления письма.
			 * @param {Array|*} viewConfigItems Массив с элементами представления письма.
			 */
			createEmailRelationPanelConfig: function(viewConfigItems) {
				var relationColumns = this.get("EntityConnectionColumnList");
				if (this.Ext.isEmpty(viewConfigItems) || this.Ext.isEmpty(relationColumns)) {
					return;
				}
				var panel = this.generateEmailRelationsPanelConfig(relationColumns);
				viewConfigItems.push(panel);
			},

			/**
			 * Создает объект с параметрами контейнера и кнопок связей письма.
			 * @protected
			 * @param {Array} relationColumns Массив названий колонок связей.
			 * @return {Object} Праметры элемента управления.
			 */
			generateEmailRelationsPanelConfig: function(relationColumns) {
				var items = [];
				var relationMenuItems = [];
				var lookupEditConfig = {
					"cleariconclick": {bindTo: "clearColumn"},
					"href": {bindTo: "getHref"},
					"linkclick": {bindTo: "onLinkClick"},
					"showValueAsLink": true,
					"hasClearIcon": true
				};
				this.Terrasoft.each(relationColumns, function(columnName) {
					var editConfig = this.Terrasoft.deepClone(lookupEditConfig);
					Ext.apply(editConfig, {
						"value": {bindTo: columnName}
					});
					var column = this.entitySchema.getColumnByName(columnName);
					var relationItemConfig = this.generateEmailRelationButtonConfig(column);
					var lookupConfig = this.createEditContainerConfig(column.name, editConfig);
					var relationMenuItemConfig = this.generateRelationMenuItemConfig(column);
					var ext = this.Ext;
					if (!ext.isEmpty(relationItemConfig) && !ext.isEmpty(lookupConfig)) {
						var relationItems = [];
						relationItems.push(relationItemConfig);
						relationItems.push(lookupConfig);
						items.push({
							"className": "Terrasoft.Container",
							"classes": {"wrapClassName": ["email-item-relation-container"]},
							"markerValue": "EmailRelationContainer",
							"items": relationItems,
							"visible": {"bindTo": "isColumnFilled"},
							"tag": column.name
						});
						relationMenuItems.push(relationMenuItemConfig);
					}
				}, this);
				var relationsButtonConfig = {
					"className": "Terrasoft.Button",
					"imageConfig": {
						"bindTo": "CurrentColumnName",
						"bindConfig": {"converter": "getRelationButtonImageConfig"}
					},
					"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"menu": {
						"items": relationMenuItems
					},
					markerValue: "relationMenuItems"
				};
				var lookupAllEditConfig = {
						"value": {bindTo: "CurrentColumnValue"},
						"change": {bindTo: "onColumnValueChange"},
						"placeholder": {
							"bindTo": "CurrentColumnName",
							"bindConfig": {
								"converter": "getPlaceholder"
							}
						},
						"hasClearIcon": false
					};
				lookupAllEditConfig = this.createEditContainerConfig(null, lookupAllEditConfig);
				var relationItems = [];
				relationItems.push(relationsButtonConfig);
				relationItems.push(lookupAllEditConfig);
				items.push({
					"className": "Terrasoft.Container",
					"classes": {"wrapClassName": ["email-item-relation-container"]},
					"markerValue": "EmailRelationContainer",
					"visible": {"bindTo": "IsAddNewRelationVisible"},
					"items": relationItems
				});
				var emailButtonsContainerConfig = this.generateEmailButtonsContainerConfig();
				items.push(emailButtonsContainerConfig);
				var panelContainerConfig = {
					"className": "Terrasoft.Container",
					"classes": {"wrapClassName": ["email-relation-container"]},
					"markerValue": "EmailAllRelationContainer",
					"items": items
				};
				return panelContainerConfig;
			},

			/**
			 * Создает объект с параметрами контейнера и кнопок письма.
			 * @protected
			 * @return {Object} Праметры элемента управления.
			 */
			generateEmailButtonsContainerConfig: function() {
				var buttonItems = [];
				var emailButtonContainerConfig = null;
				var processEmailButtonConfig = this.generateEmailProcessedButtonConfig();
				buttonItems.push(processEmailButtonConfig);
				var deleteEmailButtonConfig = this.generateDeleteEmailButtonConfig();
				buttonItems.push(deleteEmailButtonConfig);
				emailButtonContainerConfig = {
					"className": "Terrasoft.Container",
					"classes": {"wrapClassName": ["email-item-relation-container"]},
					"items": buttonItems
				};
				return emailButtonContainerConfig;
			},

			/**
			 * Создает объект с параметрами связи письма для указанной колонки.
			 * @protected
			 * @param {Object} column Обьект связи.
			 * @return {Object} Параметры для создания кнопки.
			 */
			generateEmailRelationButtonConfig: function(column) {
				var schemaName = column.referenceSchemaName;
				return {
					"className": "Terrasoft.Button",
					"imageConfig": {"bindTo": "getRelationButtonImageConfig"},
					"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"classes": {
						wrapperClass: ["email-relation-button-wrapper"]
					},
					"visible": true,
					"markerValue": "EmailRelationButton" + " " + schemaName + " " + column.name,
					"tag": column.name
				};
			},

			/**
			* Создает объект с параметрами кнопки "обработано".
			* @protected
			* @return {Object} Параметры для создания кнопки.
			*/
			generateEmailProcessedButtonConfig: function() {
				return {
					"className": "Terrasoft.Button",
					"caption": {"bindTo": "Resources.Strings.MarkAsProcessed"},
					"style": Terrasoft.controls.ButtonEnums.style.GREEN,
					"imageConfig": {"bindTo": "Resources.Images.ApplyButtonImage"},
					"click": {bindTo: "setIsNeedProcessFalse"},
					"visible": {"bindTo": "IsNeedProcess"},
					"markerValue": "setNeedProcessFalse"
				};
			},

			/**
			 * Создает объект с параметрами кнопки "Удалить".
			 * @protected
			 * @return {Object} Параметры для создания кнопки.
			 */
			generateDeleteEmailButtonConfig: function() {
				return {
					"className": "Terrasoft.Button",
					"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"imageConfig": {"bindTo": "Resources.Images.DeleteEmailButtonImage"},
					"click": {bindTo: "onDeleteEmail"},
					"markerValue": "deleteEmail"
				};
			},

			/**
			 * Создает объект с параметрами для справочного поля.
			 * @protected
			 * @return {Object} Параметры для справочного поля.
			 */
			createEditContainerConfig: function(columnName, lookupConfig) {
				var items = {
					"className": "Terrasoft.LookupEdit",
					"markerValue": {bindTo: "getEditContainerMarkerValue"},
					loadVocabulary: {bindTo: "loadVocabulary"},
					"list": {
						"bindTo": "CurrentRelationItemsList"
					},
					"prepareList": {
						"bindTo": "loadPrepareItems"
					},
					"tag": columnName
				};
				Ext.apply(items, lookupConfig);
				var config = {
					"className": "Terrasoft.Container",
					"classes": {
						"wrapClassName": ["control-wrap"]
					},
					"items": [
						items
					]
				};
				return config;
			},

			/**
			 * Формирует объект с параметрами иконки кнопки.
			 * @param {String} columnName Название колонки.
			 * @return {Object} Параметры иконки.
			 */
			getRelationImageConfig: function(columnName) {
				var resourceName = columnName + "ExistIcon";
				var image = this.get("Resources.Images." + resourceName);
				if (this.Ext.isEmpty(image)) {
					image = this.get("Resources.Images.DefaultIcon");
				}
				return image;
			},

			/**
			 * Формирует параметры сообщения об отсутствии данных.
			 * @param {Object} config Параметры сообщения об отсутствии данных.
			 */
			getEmptyMessageConfig: function(config) {
				config.className = "Terrasoft.Label";
				config.caption = this.get("Resources.Strings.NoEmailsInFolder");
				config.classes = {
					"labelClass": ["email-empty-message"]
				};
			}
		},
		diff: [
			{
				"operation": "insert",
				"name": "Emails",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {"wrapClassName": ["emails-main-container"]},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "EmailTabHeader",
				"propertyName": "items",
				"parentName": "Emails",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {"wrapClassName": ["emails-header-container"]},
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "EmailTabHeader",
				"propertyName": "items",
				"name": "MailTypeButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {
						"bindTo": "getMailTypeCaption"
					},
					"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"classes": {
						"wrapperClass": ["email-type-button-wrapper"],
						"menuClass": ["email-type-button-menu"]
					},
					"menu": {
						"items": {"bindTo": "getEmailTypeMenuItems"}
					},
					"enabled": {"bindTo": "IsDataLoaded"},
					"markerValue": "EmailTypeButton"
				}
			},
			{
				"operation": "insert",
				"name": "AddEmail",
				"propertyName": "items",
				"parentName": "EmailTabHeader",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"imageConfig": {"bindTo": "Resources.Images.AddEmailImage"},
					"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"markerValue": "AddEmailButton",
					"click": {"bindTo": "createEmail"},
					"classes": {wrapClassName: ["add-email-button-wrap"]}
				}
			},
			{
				"operation": "insert",
				"name": "EmailTabActions",
				"propertyName": "items",
				"parentName": "EmailTabHeader",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"imageConfig": {"bindTo": "Resources.Images.ActionsButtonImage"},
					"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"classes": {
						wrapperClass: ["email-actions-button-wrapper", "email-tab-actions-button-wrapper"],
						menuClass: ["email-actions-button-menu"]
					},
					"controlConfig": {
						"menu": {
							"items": {"bindTo": "EmailTabActionsMenuCollection"}
						}
					},
					"markerValue": "EmailTabActions"
				}
			},
			{
				"operation": "insert",
				"name": "EmailContainerList",
				"propertyName": "items",
				"parentName": "Emails",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"generator": "ContainerListGenerator.generateGrid",
					"collection": {"bindTo": "EmailCollection"},
					"classes": {"wrapClassName": ["emails-container-list"]},
					"onGetItemConfig": {"bindTo": "onGetItemConfig"},
					"idProperty": "Id",
					"observableRowNumber": 1,
					"observableRowVisible": {"bindTo": "onLoadNext"},
					"rowCssSelector": ".email-container.selectable",
					"getEmptyMessageConfig": {bindTo: "getEmptyMessageConfig"},
					"items": []
				}
			}
		]
	};
});
