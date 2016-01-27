define("CtiPanel", ["terrasoft", "CtiProviderInitializer", "CtiBaseHelper", "CtiPanelResources", "CtiConstants",
		"CtiPanelModelUtilities", "CtiPanelUtils", "CtiPanelIdentificationUtilities", "CtiContainerListGenerator",
		"CtiContainerList", "SearchEdit", "CtiPanelCommunicationHistoryUtilities", "CtiPanelEmptyHistoryMixin"],
	function(Terrasoft, CtiProviderInitializer, CtiBaseHelper, resources, ctiConstants) {
		return {
			messages: {
				/**
				 * @message CallCustomer
				 * Уведомляет о необходимости звонка клиенту.
				 * @param {Object} Информация о параметрах звонка.
				 */
				"CallCustomer": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetCallRecords
				 * Уведомляет о необходимости получения записей разговоров звонка.
				 * @param {Object} Информация о параметрах звонка.
				 */
				"GetCallRecords": {
					"mode": Terrasoft.MessageMode.PTP,
					"direction": Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message SelectCommunicationPanelItem
				 * Выбирает пункт в коммуникационной панели.
				 * @param {Object} Информация о выбранном пункте коммуникационной панели.
				 */
				"SelectCommunicationPanelItem": {
					"mode": Terrasoft.MessageMode.PTP,
					"direction": Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message CallDurationChanged
				 * Изменяет строку с длительностью соответствующего звонка.
				 * @param {String} Длительность звонка.
				 */
				"CallDurationChanged": {
					"mode": Terrasoft.MessageMode.PTP,
					"direction": Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message CtiPanelConnected
				 * Публикация сообщения о загрузке cti панели.
				 */
				"CtiPanelConnected": {
					"mode": Terrasoft.MessageMode.PTP,
					"direction": Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message PushHistoryState
				 * Публикация сообщения установки состояния.
				 * @param {Object} Конфигурационный объект нового состояния.
				 */
				"PushHistoryState": {
					"mode": Terrasoft.MessageMode.BROADCAST,
					"direction": Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message AgentStateChanged
				 * Сообщение изменения текущего статуса оператора.
				 * @param {String} Длительность звонка.
				 */
				"AgentStateChanged": {
					"mode": Terrasoft.MessageMode.PTP,
					"direction": Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			mixins: {
				/**
				 * Миксин модели представления.
				 */
				CtiPanelModelUtilities: Terrasoft.CtiPanelModelUtilities,

				/**
				 * Миксин модели динамически генерируемых панелей Cti панели.
				 */
				CtiPanelUtils: Terrasoft.CtiPanelUtils,

				/**
				 * Миксин идентификации абонента.
				 */
				CtiPanelIdentificationUtilities: Terrasoft.CtiPanelIdentificationUtilities,

				/**
				 * Миксин истории звонков.
				 */
				CtiPanelCommunicationHistoryUtilities: Terrasoft.CtiPanelCommunicationHistoryUtilities,

				/**
				 * Миксин для показа сообщения при пустой истории звонков.
				 */
				CtiPanelEmptyHistoryMixin: Terrasoft.CtiPanelEmptyHistoryMixin
			},
			attributes: {

				/**
				 * Набранный номер телефона.
				 * @private
				 * @type {String}
				 */
				"PhoneNumber": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Предыдущее значение в поле Номер телефона. Необходимо, чтобы избежать избыточного числа срабатываний
				 * обработчиков изменения значения номера телефона.
				 * @private
				 * @type {String}
				 */
				"PhoneNumberOldValue": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Коллекция со списком событий и их обработчиков, на которые произошла подписка
				 * при создании соединения.
				 * @private
				 * @type {Object[]}
				 */
				"SubscribedEvents": {
					"value": null
				},

				/**
				 * Коллекция элементов с данными идентификации для различных типов абонентов.
				 * Ключ - тип абонента, значение - массив элементов идентификации, которые следует отобразить.
				 * @private
				 * @type {Object}
				 */
				"IdentificationDataLabels": {
					"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT,
					"value": {
						"Contact": ["AccountName", "Job"],
						"Account": ["AccountType", "City"],
						"Employee": ["Department"]
					}
				},

				/**
				 * Количество идентифицированных абонентов основного звонка.
				 * @private
				 * @type {Number}
				 */
				"IdentifiedSubscribersCount": {
					"dataValueType": Terrasoft.DataValueType.INTEGER,
					"value": 0
				},

				/**
				 * Ключ идентифицированного абонента основного звонка в коллекции с данными идентифицированных
				 * абонентов.
				 * @private
				 * @type {String}
				 */
				"IdentifiedSubscriberKey": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"value": ""
				},

				/**
				 * Количество идентифицированных абонентов консультационного звонка.
				 * @private
				 * @type {Number}
				 */
				"IdentifiedConsultSubscribersCount": {
					"dataValueType": Terrasoft.DataValueType.INTEGER,
					"value": 0
				},

				/**
				 * Ключ идентифицированного абонента консультационного звонка в коллекции с данными идентифицированных
				 * абонентов.
				 * @private
				 * @type {String}
				 */
				"IdentifiedConsultSubscriberKey": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"value": ""
				},

				/**
				 * Строка отображающая длительность разговора основного звонка в формате mm:ss.
				 * @private
				 * @type {String}
				 */
				"CallDuration": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": null
				},

				/**
				 * Время начала разговора.
				 * @private
				 * @type {String}
				 */
				"CommutationStartedOn": {
					"dataValueType": Terrasoft.DataValueType.DATE_TIME,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": null
				},

				/**
				 * Идентификатор таймера.
				 * @private
				 * @type {String}
				 */
				"DurationTimerIntervalId": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Строка отображающая длительность разговора консультационного звонка в формате mm:ss.
				 * @private
				 * @type {String}
				 */
				"ConsultCallDuration": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": "00:00"
				},

				/**
				 * Была запрошена подготовка к началу перевода.
				 * @private
				 * @type {Boolean}
				 */
				"IsTransferPrepared": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"value": false
				},

				/**
				 * Идентификатор абонента, которого следует сделать идентифицируемым, сразу по завершению
				 * процесса идентификации.
				 * @private
				 * @type {String}
				 */
				"AdvisedIdentifiedSubscriber": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Коллекция панелей идентифицированных абонентов основного звонка.
				 * @private
				 * @type {Terrasoft.Collection}
				 */
				"IdentifiedSubscriberPanelCollection": {
					"dataValueType": Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Коллекция панелей идентифицированных абонентов консультационного звонка.
				 * @private
				 * @type {Terrasoft.Collection}
				 */
				"IdentifiedConsultSubscriberPanelCollection": {
					"dataValueType": Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Коллекция панелей с результатами поиска абонента.
				 * @private
				 * @type {Terrasoft.Collection}
				 */
				"SearchResultPanelCollection": {
					"dataValueType": Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Коллекция панелей с историей звонков.
				 * @private
				 * @type {Terrasoft.Collection}
				 */
				"CommunicationHistoryPanelCollection": {
					"dataValueType": Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Признак, что поиск абонентов завершен и
				 * не вернул записей, соответствующих установленным фильтрам.
				 * @private
				 * @type {Boolean}
				 */
				"IsSearchFinishedAndResultEmpty": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"value": false
				},

				/**
				 * Признак того, что колекция абонентов, найденных в результате поиска, пустая.
				 * @private
				 * @type {Boolean}
				 */
				"IsSearchResultPanelCollectionEmpty": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"value": true
				},

				/**
				 * Строка символов, которые были отправлены через DTMF набор.
				 * @private
				 * @type {String}
				 */
				"DtmfDigits": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Была запрошена подготовка к началу DTMF набора.
				 * @private
				 * @type {Boolean}
				 */
				"IsDtmfPrepared": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"value": false
				},

				/**
				 * Настройки телефонии.
				 * @private
				 * @type {Object}
				 */
				"CtiSettings": {
					"dataValueType": Terrasoft.DataValueType.Object,
					"value": null
				},

				/**
				 * Поддерживает ли провайдер телефонии передачу видео.
				 * @private
				 * @type {Boolean}
				 */
				"IsVideoSupported": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"value": false
				},

				/**
				 * Скрыт ли контейнер с видео.
				 * @private
				 * @type {Boolean}
				 */
				"IsVideoHidden": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"value": false
				},

				/**
				 * Признак, указывающий на необходимость отображения сообщения о пустой истории.
				 * @private
				 * @type {Boolean}
				 */
				"DisplayEmptyHistoryMessage": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"value": false
				}
			},
			methods: {

				//region Methods: Private

				/**
				 * Выводит сообщение об ошибке в консоль.
				 * @private
				 * @param {Object} message Сообщение.
				 */
				logError: function(message) {
					var console = Ext.global.console;
					if (console && console.error) {
						console.error(message);
					}
				},

				//endregion

				//region Methods: Protected

				/**
				 * Инициализирует коллекции схемы.
				 * @protected
				 */
				initCollections: function() {
					this.set("SearchResultPanelCollection", this.Ext.create("Terrasoft.Collection"));
					this.initCallHistoryCollection();
					this.set("IdentifiedSubscriberPanelCollection",
						this.Ext.create("Terrasoft.BaseViewModelCollection"));
					this.set("IdentifiedConsultSubscriberPanelCollection",
						this.Ext.create("Terrasoft.BaseViewModelCollection"));
				},

				/**
				 * Инициализирует коллекцию истории звонков и выполняет подписку на ее изменение.
				 * @protected
				 */
				initCallHistoryCollection: function() {
					var collection = this.Ext.create("Terrasoft.Collection");
					collection.on("add", this.onCallHistoryChanged, this);
					collection.on("dataLoaded", this.onCallHistoryChanged, this);
					collection.on("remove", this.onCallHistoryChanged, this);
					collection.on("clear", this.onCallHistoryChanged, this);
					this.set("CommunicationHistoryPanelCollection", collection);
				},

				/**
				 * Обрабатывает изменение коллекции истории звонков.
				 * @protected
				 */
				onCallHistoryChanged: function() {
					var collection = this.get("CommunicationHistoryPanelCollection");
					this.set("DisplayEmptyHistoryMessage", collection.isEmpty());
				},

				/**
				 * Создает подключение к телефонии.
				 * @protected
				 */
				createConnection: function() {
					this.subscribeEvents();
					this.connect(null, function(success, error) {
						if (error) {
							this.onConnectError(error);
						}
					}.bind(this));
				},

				/**
				 * Инициализирует Cti модель.
				 * @param {Terrasoft.BaseCtiProvider} provider Провайдер функций телефонии.
				 * @protected
				 */
				initializeCtiModel: function(provider) {
					this.ctiProvider = provider;
					this.createConnection();
				},

				/**
				 * Подписывает на события Cti модели.
				 * @protected
				 */
				subscribeEvents: function() {
					var ctiPanelEvents = [
						{
							eventName: "connected",
							eventHandler: this.onConnected
						},
						{
							eventName: "commutationStarted",
							eventHandler: this.onCommutationStarted
						},
						{
							eventName: "change:CurrentCallNumber",
							eventHandler: this.onChangeCurrentCallNumber
						},
						{
							eventName: "change:CurrentCall",
							eventHandler: this.onChangeCurrentCall
						},
						{
							eventName: "change:CallDuration",
							eventHandler: this.onChangeCallDuration
						},
						{
							eventName: "change:ConsultCallNumber",
							eventHandler: this.onChangeConsultCallNumber
						},
						{
							eventName: "change:IsConsulting",
							eventHandler: this.onChangeIsConsulting
						},
						{
							eventName: "change:AgentState",
							eventHandler: this.onAgentStateCodeChanged
						},
						{
							eventName: "change:IdentifiedSubscriberKey",
							eventHandler: this.onIdentifiedSubscriberKeyChanged
						},
						{
							eventName: "change:IdentifiedConsultSubscriberKey",
							eventHandler: this.onIdentifiedConsultSubscriberKeyChanged
						},
						{
							eventName: "callSaved",
							eventHandler: this.onCallSavedEvent
						},
						{
							eventName: "dtmfEntered",
							eventHandler: this.onDtmfEntered
						},
						{
							eventName: "webRtcStarted",
							eventHandler: this.onWebRtcStarted
						},
						{
							eventName: "webRtcVideoStarted",
							eventHandler: this.onWebRtcVideoStarted
						},
						{
							eventName: "webRtcDestroyed",
							eventHandler: this.onWebRtcDestroyed
						},
						{
							eventName: "change:IsVideoHidden",
							eventHandler: this.onVideoHidden
						}
					];
					Terrasoft.each(ctiPanelEvents, function(item) {
						this.on(item.eventName, item.eventHandler, this);
					}, this);
					this.set("SubscribedEvents", ctiPanelEvents);
					this.sandbox.subscribe("CallCustomer", this.onCallCustomer.bind(this));
					this.sandbox.subscribe("GetCallRecords", this.onGetCallRecords.bind(this),
						[ctiConstants.CallRecordsContextMessageId]);
					this.activeCalls.on("clear", this.onCtiPanelActiveCallsEmpty, this);
					this.activeCalls.on("remove", this.onCtiPanelActiveCallRemoved, this);
				},

				/**
				 * Обрабатывает ошибку при подключении к телефонии.
				 * @protected
				 * @param {Object} error Объект ошибки.
				 * @param {Terrasoft.MsgErrorType} error.errorType Тип ошибки.
				 * @param {String} error.internalErrorCode Код ошибки.
				 * @param {String} error.data Текст ошибки.
				 * @param {String} error.source Источник ошибки.
				 */
				onConnectError: function(error) {
					if (error.errorType === Terrasoft.MsgErrorType.CONNECTION_CONFIG_ERROR) {
						this.logError(this.get("Resources.Strings.ConnectionConfigEmptyError"));
					}
				},

				/**
				 * Определяет необходимость показа сообщения о пустой истории звонков.
				 * @return {Boolean} Если история звонков отображается и она пустая, то true.
				 * @protected
				 */
				isEmptyCallHistoryMessageVisible: function() {
					return this.getIsCommunicationHistoryVisible() && this.get("DisplayEmptyHistoryMessage");
				},

				//endregion

				//region Methods: Public

				/**
				 * Инициализация схемы.
				 * @public
				 */
				init: function() {
					this.initCollections();
					this.callParent(arguments);
					var initialize = function() {
						CtiBaseHelper.queryCtiSettings(function(ctiSettings) {
							this.set("CtiSettings", ctiSettings);
							CtiProviderInitializer.initializeCtiProvider(ctiSettings.ctiProviderName,
								this.initializeCtiModel.bind(this));
							this.loadCommunicationHistory();
						}.bind(this));
					}.bind(this);
					if (this.get("Restored") !== true) {
						this.generateIdentifiedSubscriberPanelItemConfig(function() {
							this.generateСommunicationPanelItemConfig(function() {
								this.generateSearchResultPanelItemConfig(function() {
									this.generateCommunicationHistoryItemPanelItemConfig(initialize);
								}.bind(this));
							}.bind(this));
						}.bind(this));
					}
					this.on("destroyed", this.onDestroyed);
					this.initHelpUrl();
					this.emptyMessageConfig = {
						title: this.get("Resources.Strings.EmptyHistoryTitleLabel"),
						description: this.get("Resources.Strings.EmptyHistoryMessage"),
						image: this.get("Resources.Images.EmptySearchResultImage")
					};
				},

				/**
				 * Обработка события уничтожения схемы.
				 * @public
				 */
				onDestroyed: function() {
					var ctiPanelEvents = this.get("SubscribedEvents");
					Terrasoft.each(ctiPanelEvents, function(item) {
						this.un(item.eventName, item.eventHandler, this);
					}, this);
					this.set("SubscribedEvents", "");
					this.activeCalls.un("clear", this.onCtiPanelActiveCallsEmpty, this);
					this.activeCalls.un("remove", this.onCtiPanelActiveCallRemoved, this);
					var collection = this.get("CommunicationHistoryPanelCollection");
					collection.un("add", this.onCallHistoryChanged, this);
					collection.un("dataLoaded", this.onCallHistoryChanged, this);
					collection.un("clear", this.onCallHistoryChanged, this);
					collection.un("remove", this.onCallHistoryChanged, this);
				}

				//endregion

			},
			diff: [
				{
					"operation": "insert",
					"name": "ctiPanelMainContainer",
					"values": {
						"id": "ctiPanelMainContainer",
						"selectors": {"wrapEl": "#ctiPanelMainContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["ctiPanelMain"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ctiPanelVideoContainer",
					"parentName": "ctiPanelMainContainer",
					"propertyName": "items",
					"values": {
						"id": "ctiPanelVideoContainer",
						"selectors": {"wrapEl": "#ctiPanelVideoContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["ctiPanelVideo"],
						"items": []
					}
				},

				//region current call identification controls

				{
					"operation": "insert",
					"name": "IdentificationPanel",
					"parentName": "ctiPanelMainContainer",
					"propertyName": "items",
					"values": {
						"id": "IdentificationPanel",
						"markerValue": {"bindTo": "CurrentCallNumber"},
						"selectors": {"wrapEl": "#IdentificationPanel"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["identification-panel"],
						"visible": {"bindTo": "getIsCallExists"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "IdentificationPanelLeft",
					"parentName": "IdentificationPanel",
					"propertyName": "items",
					"values": {
						"id": "IdentificationPanelLeft",
						"selectors": {"wrapEl": "#IdentificationPanelLeft"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["identification-panel-left"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "IdentificationPanelRight",
					"parentName": "IdentificationPanel",
					"propertyName": "items",
					"values": {
						"id": "IdentificationPanelRight",
						"selectors": {"wrapEl": "#IdentificationPanelRight"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["identification-panel-right"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "IdentificationDataPanel",
					"parentName": "IdentificationPanelRight",
					"propertyName": "items",
					"values": {
						"id": "IdentificationDataPanel",
						"selectors": {"wrapEl": "#IdentificationDataPanel"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["identification-data-panel"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "SubscriberPhoto",
					"parentName": "IdentificationPanelLeft",
					"propertyName": "items",
					"values": {
						"id": "SubscriberPhoto",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "getSubscriberPhoto"},
						"classes": {"wrapperClass": ["subscriber-photo"]},
						"markerValue": "SubscriberPhoto",
						"selectors": {"wrapEl": "#SubscriberPhoto"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "Photo"
					}
				},
				{
					"operation": "insert",
					"name": "TransferringArrows",
					"parentName": "IdentificationPanelLeft",
					"propertyName": "items",
					"values": {
						"id": "TransferringArrows",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "Resources.Images.TransferringArrows"},
						"classes": {"wrapperClass": ["transferring-arrows"]},
						"markerValue": "TransferringArrows",
						"selectors": {"wrapEl": "#TransferringArrows"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"visible": {"bindTo": "IsConsulting"}
					}
				},
				{
					"operation": "insert",
					"name": "PrimaryCallInfo",
					"parentName": "IdentificationPanelRight",
					"propertyName": "items",
					"values": {
						"id": "PrimaryCallInfo",
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {"bindTo": "CurrentCallNumber"},
						"markerValue": "PrimaryCallInfo",
						"classes": {"labelClass": "primary-call-info"},
						"visible": {"bindTo": "getIsSubscriberUnknown"}
					}
				},
				{
					"operation": "insert",
					"name": "SubscriberName",
					"parentName": "IdentificationDataPanel",
					"propertyName": "items",
					"values": {
						"id": "SubscriberName",
						"markerValue": {"bindTo": "getSubscriberData"},
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "getSubscriberData"},
						"hint": {"bindTo": "getSubscriberData"},
						"tag": "Name",
						"visible": {
							"bindTo": "IdentifiedSubscriberKey",
							"bindConfig": {"converter": "getIsSubscriberIdentified"}
						},
						"click": {"bindTo": "onSubscriberNameClick"},
						"classes": {"wrapperClass": ["subsciber-menu-button"]},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"menu": {
							"items": [
								{
									"id": "SelectAnotherSubscriberMenuItem",
									"caption": {"bindTo": "Resources.Strings.SelectAnotherSubscriberCaption"},
									"markerValue": "SelectAnotherSubscriberMenuItem",
									"click": {"bindTo": "clearSubscriber"}
								}
							]
						}
					}
				},
				{
					"operation": "insert",
					"name": "SubscriberNumberInfo",
					"parentName": "IdentificationPanelRight",
					"propertyName": "items",
					"values": {
						"id": "SubscriberNumberInfo",
						"selectors": {"wrapEl": "#SubscriberNumberInfo"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"markerValue": "SubscriberNumberInfo",
						"items": [
							{
								"id": "CommunicationTypeLabel",
								"itemType": Terrasoft.ViewItemType.LABEL,
								"classes": {"labelClass": ["label-caption"]},
								"markerValue": {"bindTo": "getSubscriberData"},
								"selectors": {"wrapEl": "#CommunicationTypeLabel"},
								"caption": {"bindTo": "getSubscriberData"},
								"tag": "CommunicationType"
							},
							{
								"id": "CallNumber",
								"itemType": Terrasoft.ViewItemType.LABEL,
								"classes": {"labelClass": ["subscriber-info"]},
								"markerValue": {"bindTo": "getSubscriberData"},
								"selectors": {"wrapEl": "#CallNumber"},
								"caption": {"bindTo": "getSubscriberData"},
								"tag": "Number"
							}
						]
					}
				},
				{
					"operation": "insert",
					"name": "AccountName",
					"parentName": "IdentificationDataPanel",
					"propertyName": "items",
					"values": {
						"generator": "CtiBaseHelper.getIdentificationDataLabel"
					}
				},
				{
					"operation": "insert",
					"name": "SubscriberJob",
					"parentName": "IdentificationDataPanel",
					"propertyName": "items",
					"values": {
						"tag": "Job",
						"generator": "CtiBaseHelper.getIdentificationDataLabel"
					}
				},
				{
					"operation": "insert",
					"name": "SubscriberDepartment",
					"parentName": "IdentificationDataPanel",
					"propertyName": "items",
					"values": {
						"tag": "Department",
						"generator": "CtiBaseHelper.getIdentificationDataLabel"
					}
				},
				{
					"operation": "insert",
					"name": "AccountType",
					"parentName": "IdentificationDataPanel",
					"propertyName": "items",
					"values": {
						"generator": "CtiBaseHelper.getIdentificationDataLabel"
					}
				},
				{
					"operation": "insert",
					"name": "AccountCity",
					"parentName": "IdentificationDataPanel",
					"propertyName": "items",
					"values": {
						"tag": "City",
						"generator": "CtiBaseHelper.getIdentificationDataLabel"
					}
				},
				{
					"operation": "insert",
					"name": "CallDurationInfo",
					"parentName": "IdentificationPanelRight",
					"propertyName": "items",
					"values": {
						"id": "CallDurationInfo",
						"selectors": {"wrapEl": "#CallDurationInfo"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"visible": {"bindTo": "getIsCallDurationVisible"},
						"classes": {
							wrapClassName: ["call-duration-container"]
						},
						"items": [
							{
								"id": "CallDurationLabel",
								"itemType": Terrasoft.ViewItemType.LABEL,
								"classes": {"labelClass": ["label-caption"]},
								"markerValue": "CallDurationLabel",
								"selectors": {"wrapEl": "#CallDurationLabel"},
								"caption": {"bindTo": "Resources.Strings.CallDurationLabelCaption"}
							},
							{
								"id": "CallDuration",
								"itemType": Terrasoft.ViewItemType.LABEL,
								"classes": {"labelClass": ["call-duration"]},
								"markerValue": "CallDuration",
								"selectors": {"wrapEl": "#CallDuration"},
								"caption": {"bindTo": "CallDuration"}
							}
						]
					}
				},

				//endregion

				//region consult call identification controls

				{
					"operation": "insert",
					"name": "ConsultIdentificationPanel",
					"parentName": "ctiPanelMainContainer",
					"propertyName": "items",
					"values": {
						"id": "ConsultIdentificationPanel",
						"markerValue": {"bindTo": "ConsultCallNumber"},
						"selectors": {"wrapEl": "#ConsultIdentificationPanel"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["identification-panel", "consult-identification-panel"],
						"visible": {"bindTo": "IsConsulting"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ConsultIdentificationPanelLeft",
					"parentName": "ConsultIdentificationPanel",
					"propertyName": "items",
					"values": {
						"id": "ConsultIdentificationPanelLeft",
						"selectors": {"wrapEl": "#ConsultIdentificationPanelLeft"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["identification-panel-left"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ConsultIdentificationPanelRight",
					"parentName": "ConsultIdentificationPanel",
					"propertyName": "items",
					"values": {
						"id": "ConsultIdentificationPanelRight",
						"selectors": {"wrapEl": "#ConsultIdentificationPanelRight"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["identification-panel-right"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ConsultIdentificationDataPanel",
					"parentName": "ConsultIdentificationPanelRight",
					"propertyName": "items",
					"values": {
						"id": "ConsultIdentificationDataPanel",
						"selectors": {"wrapEl": "#ConsultIdentificationDataPanel"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["identification-data-panel"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ConsultSubscriberPhoto",
					"parentName": "ConsultIdentificationPanelLeft",
					"propertyName": "items",
					"values": {
						"id": "ConsultSubscriberPhoto",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "getConsultSubscriberPhoto"},
						"classes": {"wrapperClass": ["subscriber-photo"]},
						"markerValue": "ConsultSubscriberPhoto",
						"selectors": {"wrapEl": "#ConsultSubscriberPhoto"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "Photo"
					}
				},
				{
					"operation": "insert",
					"name": "ConsultCallInfo",
					"parentName": "ConsultIdentificationPanelRight",
					"propertyName": "items",
					"values": {
						"id": "ConsultCallInfo",
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {"bindTo": "ConsultCallNumber"},
						"markerValue": "ConsultCallInfo",
						"classes": {"labelClass": "primary-call-info"},
						"visible": {"bindTo": "getIsConsultSubscriberUnknown"}
					}
				},
				{
					"operation": "insert",
					"name": "ConsultSubscriberName",
					"parentName": "ConsultIdentificationDataPanel",
					"propertyName": "items",
					"values": {
						"id": "ConsultSubscriberName",
						"markerValue": {"bindTo": "getConsultSubscriberData"},
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "getConsultSubscriberData"},
						"hint": {"bindTo": "getConsultSubscriberData"},
						"tag": "Name",
						"visible": {
							"bindTo": "IdentifiedConsultSubscriberKey",
							"bindConfig": {"converter": "getIsSubscriberIdentified"}
						},
						"click": {"bindTo": "onConsultSubscriberNameClick"},
						"classes": {"wrapperClass": ["subsciber-menu-button"]},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"menu": {
							"items": [
								{
									"id": "SelectAnotherConsultSubscriberMenuItem",
									"caption": {"bindTo": "Resources.Strings.SelectAnotherSubscriberCaption"},
									"markerValue": "SelectAnotherConsultSubscriberMenuItem",
									"click": {"bindTo": "clearConsultSubscriber"}
								}
							]
						}
					}
				},
				{
					"operation": "insert",
					"name": "ConsultSubscriberNumberInfo",
					"parentName": "ConsultIdentificationPanelRight",
					"propertyName": "items",
					"values": {
						"id": "ConsultSubscriberNumberInfo",
						"selectors": {"wrapEl": "#ConsultSubscriberNumberInfo"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"markerValue": "SubscriberNumberInfo",
						"items": [
							{
								"id": "ConsultCommunicationTypeLabel",
								"itemType": Terrasoft.ViewItemType.LABEL,
								"classes": {"labelClass": ["label-caption"]},
								"markerValue": {"bindTo": "getConsultSubscriberData"},
								"selectors": {"wrapEl": "#ConsultCommunicationTypeLabel"},
								"caption": {"bindTo": "getConsultSubscriberData"},
								"tag": "CommunicationType"
							},
							{
								"id": "ConsultCallNumber",
								"itemType": Terrasoft.ViewItemType.LABEL,
								"classes": {"labelClass": ["subscriber-info"]},
								"markerValue": {"bindTo": "getConsultSubscriberData"},
								"selectors": {"wrapEl": "#ConsultCallNumber"},
								"caption": {"bindTo": "getConsultSubscriberData"},
								"tag": "Number"
							}
						]
					}
				},
				{
					"operation": "insert",
					"name": "ConsultAccountName",
					"parentName": "ConsultIdentificationDataPanel",
					"propertyName": "items",
					"values": {
						"tag": "AccountName",
						"visible": {"bindTo": "getIsConsultInfoLabelVisible"},
						"value": {"bindTo": "getConsultSubscriberData"},
						"generator": "CtiBaseHelper.getIdentificationDataLabel"
					}
				},
				{
					"operation": "insert",
					"name": "ConsultSubscriberJob",
					"parentName": "ConsultIdentificationDataPanel",
					"propertyName": "items",
					"values": {
						"tag": "Job",
						"visible": {"bindTo": "getIsConsultInfoLabelVisible"},
						"value": {"bindTo": "getConsultSubscriberData"},
						"generator": "CtiBaseHelper.getIdentificationDataLabel"
					}
				},
				{
					"operation": "insert",
					"name": "ConsultSubscriberDepartment",
					"parentName": "ConsultIdentificationDataPanel",
					"propertyName": "items",
					"values": {
						"tag": "Department",
						"visible": {"bindTo": "getIsConsultInfoLabelVisible"},
						"value": {"bindTo": "getConsultSubscriberData"},
						"generator": "CtiBaseHelper.getIdentificationDataLabel"
					}
				},
				{
					"operation": "insert",
					"name": "ConsultAccountType",
					"parentName": "ConsultIdentificationDataPanel",
					"propertyName": "items",
					"values": {
						"tag": "AccountType",
						"visible": {"bindTo": "getIsConsultInfoLabelVisible"},
						"value": {"bindTo": "getConsultSubscriberData"},
						"generator": "CtiBaseHelper.getIdentificationDataLabel"
					}
				},
				{
					"operation": "insert",
					"name": "ConsultAccountCity",
					"parentName": "ConsultIdentificationDataPanel",
					"propertyName": "items",
					"values": {
						"tag": "City",
						"visible": {"bindTo": "getIsConsultInfoLabelVisible"},
						"value": {"bindTo": "getConsultSubscriberData"},
						"generator": "CtiBaseHelper.getIdentificationDataLabel"
					}
				},
				{
					"operation": "insert",
					"name": "CallDurationInfo",
					"parentName": "ConsultIdentificationPanelRight",
					"propertyName": "items",
					"values": {
						"id": "CallDurationInfo",
						"selectors": {"wrapEl": "#CallDurationInfo"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"visible": false,
						"classes": {
							wrapClassName: ["call-duration-container"]
						},
						"items": [
							{
								"id": "CallDurationLabel",
								"itemType": Terrasoft.ViewItemType.LABEL,
								"classes": {"labelClass": ["label-caption"]},
								"markerValue": "CallDurationLabel",
								"selectors": {"wrapEl": "#CallDurationLabel"},
								"caption": {"bindTo": "Resources.Strings.CallDurationLabelCaption"}
							},
							{
								"id": "ConsultCallDuration",
								"itemType": Terrasoft.ViewItemType.LABEL,
								"classes": {"labelClass": ["call-duration"]},
								"markerValue": "ConsultCallDuration",
								"selectors": {"wrapEl": "#ConsultCallDuration"},
								"caption": {"bindTo": "ConsultCallDuration"}
							}
						]
					}
				},

				//endregion

				//region call buttons controls

				{
					"operation": "insert",
					"name": "ButtonsPanelWrapper",
					"parentName": "ctiPanelMainContainer",
					"propertyName": "items",
					"values": {
						"markerValue": "ButtonsPanelWrapper",
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"visible": {"bindTo": "getIsCallExists"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "DtmfButtonsContainer",
					"parentName": "ButtonsPanelWrapper",
					"propertyName": "items",
					"values": {
						"onButtonClick": {"bindTo": "enterDtmf"},
						"dtmfDigitsLabel": {"bindTo": "DtmfDigits"},
						"visible": {"bindTo": "getCanMakeDtmf"},
						"generator": "CtiBaseHelper.getDtmfButtonsContainer"
					}
				},
				{
					"operation": "insert",
					"name": "ButtonsPanel",
					"parentName": "ButtonsPanelWrapper",
					"propertyName": "items",
					"values": {
						"markerValue": "ButtonsPanel",
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["buttons-panel"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"index": 1,
					"name": "HoldButton",
					"parentName": "ButtonsPanel",
					"propertyName": "items",
					"values": {
						"id": "HoldButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "holdOrUnholdCall"},
						"visible": {"bindTo": "getCanHoldOrUnhold"},
						"imageConfig": {"bindTo": "getHoldButtonImageConfig"},
						"classes": {"wrapperClass": ["call-hold-button"]},
						"markerValue": "HoldButton",
						"selectors": {"wrapEl": "#HoldButton"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"hint": {"bindTo": "getHoldButtonHint"},
						"tag": "HoldButton"
					}
				},
				{
					"operation": "insert",
					"index": 2,
					"name": "PrepareTransferButton",
					"parentName": "ButtonsPanel",
					"propertyName": "items",
					"values": {
						"id": "PrepareTransferButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "onPrepareTransferButtonClick"},
						"visible": {"bindTo" : "getCanMakeConsultCall"},
						"imageConfig": {"bindTo": "getPrepareTransferButtonImageConfig"},
						"classes": {"wrapperClass": ["call-prepare-transfer-button"]},
						"markerValue": "PrepareTransferButton",
						"selectors": {"wrapEl": "#PrepareTransferButton"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"hint": {"bindTo": "Resources.Strings.PrepareTransferButtonHint"},
						"tag": "PrepareTransferButton"
					}
				},
				{
					"operation": "insert",
					"index": 3,
					"name": "CompleteTransferButton",
					"parentName": "ButtonsPanel",
					"propertyName": "items",
					"values": {
						"id": "CompleteTransferButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "transferCall"},
						"visible": {"bindTo" : "getCanTransfer"},
						"imageConfig": {"bindTo": "Resources.Images.CompleteTransferButtonIcon"},
						"classes": {"wrapperClass": ["call-complete-transfer-button",
							"t-btn-style-call-button-middle"]},
						"markerValue": "CompleteTransferButton",
						"selectors": {"wrapEl": "#CompleteTransferButton"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"showTooltip": true,
						"tooltipText": { "bindTo": "Resources.Strings.CompleteTransferTip" },
						"tag": "CompleteTransferButton"
					}
				},
				{
					"operation": "insert",
					"index": 4,
					"name": "DtmfButton",
					"parentName": "ButtonsPanel",
					"propertyName": "items",
					"values": {
						"id": "DtmfButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "onDtmfButtonClick"},
						"visible": {"bindTo": "getCanDtmf"},
						"imageConfig": {"bindTo": "getDtmfButtonImageConfig"},
						"markerValue": "DtmfButton",
						"selectors": {"wrapEl": "#DtmfButton"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"hint": {"bindTo": "Resources.Strings.DtmfButtonHint"},
						"tag": "DtmfButton"
					}
				},
				{
					"operation": "insert",
					"index": 5,
					"name": "MuteButton",
					"parentName": "ButtonsPanel",
					"propertyName": "items",
					"values": {
						"id": "MuteButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "onMuteButtonClick"},
						"visible": {"bindTo": "getIsMuteButtonVisible"},
						"enabled": {"bindTo": "getIsMuteButtonEnabled"},
						"imageConfig": {"bindTo": "getMuteButtonImageConfig"},
						"classes": {"wrapperClass": ["call-mute-button"]},
						"markerValue": "MuteButton",
						"selectors": {"wrapEl": "#MuteButton"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"hint": {"bindTo": "getMuteButtonHint"},
						"tag": "MuteButton"
					}
				},
				{
					"operation": "insert",
					"index": 6,
					"name": "VideoButton",
					"parentName": "ButtonsPanel",
					"propertyName": "items",
					"values": {
						"id": "VideoButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "onVideoButtonClick"},
						"visible": {"bindTo": "getIsAdditionalButtonsVisible"},
						"enabled": {"bindTo": "IsVideoSupported"},
						"imageConfig": {"bindTo": "getVideoButtonImageConfig"},
						"classes": {"wrapperClass": ["call-video-button"]},
						"markerValue": "VideoButton",
						"selectors": {"wrapEl": "#VideoButton"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"hint": {"bindTo": "getVideoButtonHint"},
						"tag": "VideoOffButton"
					}
				},
				{
					"operation": "insert",
					"index": 7,
					"name": "CancelTransferButton",
					"parentName": "ButtonsPanel",
					"propertyName": "items",
					"values": {
						"id": "CancelTransferButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "cancelTransfer"},
						"visible": {"bindTo" : "getCanCancelTransfer"},
						"imageConfig": {"bindTo": "Resources.Images.CancelTransferButtonIcon"},
						"classes": {"wrapperClass": ["call-cancel-transfer-button", "t-btn-style-call-button-middle"]},
						"markerValue": "CancelTransferButton",
						"selectors": {"wrapEl": "#CancelTransferButton"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"hint": {"bindTo": "Resources.Strings.CancelTransferButtonHint"},
						"tag": "TransferButton"
					}
				},
				{
					"operation": "insert",
					"index": 8,
					"name": "AnswerButton",
					"parentName": "ButtonsPanel",
					"propertyName": "items",
					"values": {
						"id": "AnswerButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "answerCall"},
						"visible": {"bindTo": "getCanAnswer"},
						"imageConfig": {"bindTo": "Resources.Images.AnswerButtonLongIcon"},
						"classes": {"wrapperClass": ["call-answer-button", "t-btn-style-call-button-long"]},
						"markerValue": "AnswerButton",
						"selectors": {"wrapEl": "#AnswerButton"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"hint": {"bindTo": "Resources.Strings.AnswerButtonHint"},
						"tag": "AnswerButton"
					}
				},
				{
					"operation": "insert",
					"index": 9,
					"name": "DropButton",
					"parentName": "ButtonsPanel",
					"propertyName": "items",
					"values": {
						"id": "DropButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "dropCall"},
						"visible": {"bindTo": "getCanDrop"},
						"imageConfig": {"bindTo": "getDropButtonImageConfig"},
						"classes": {"wrapperClass": ["call-drop-button"]},
						"markerValue": "DropButton",
						"selectors": {"wrapEl": "#DropButton"},
						"style": {"bindTo": "getDropButtonStyle"},
						"hint": {"bindTo": "Resources.Strings.DropButtonHint"},
						"tag": "DropButton"
					}
				},

				//endregion

				{
					"operation": "insert",
					"parentName": "ctiPanelMainContainer",
					"propertyName": "items",
					"name": "PhoneNumber",
					"values": {
						"id": "PhoneNumber",
						"className": "Terrasoft.SearchEdit",
						"contentType": Terrasoft.ContentType.SHORT_TEXT,
						"labelConfig": {"visible": false},
						"bindTo": "PhoneNumber",
						"enterkeypressed": { "bindTo": "callPhoneNumber"},
						"change": {"bindTo": "onPhoneNumberChanged"},
						"searchValueChanged": {"bindTo": "onPhoneNumberChanged"},
						"visible": {"bindTo": "getCanMakeCallOrMakeConsultCall"},
						"classes": {
							"wrapClass": ["phone-number-edit"]
						},
						"rightIconClick": {
							"bindTo": "callPhoneNumber"
						},
						"rightIconConfig": {
							"source": Terrasoft.ImageSources.URL,
							"url": Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.MakeCallButtonIcon)
						}
					}
				},

				//region search and identification panels

				{
					"operation": "insert",
					"name": "SearchResultItemsListContainer",
					"parentName": "ctiPanelMainContainer",
					"propertyName": "items",
					"values": {
						"id": "SearchResultItemsListContainer",
						"itemType": Terrasoft.ViewItemType.GRID,
						"markerValue": "SearchResultItemsListContainer",
						"selectors": {"wrapEl": "#SearchResultItemsListContainer"},
						"idProperty": "Id",
						"collection": {"bindTo": "SearchResultPanelCollection"},
						"onGetItemConfig": {"bindTo": "getSearchResultPanelViewConfig"},
						"classes": {"wrapClassName": ["search-result-items-list-container"]},
						"visible": {"bindTo": "getIsSearchResultItemsListContainerVisible"},
						"generator": "CtiContainerListGenerator.generatePartial"
					}
				},
				{
					"operation": "insert",
					"parentName": "ctiPanelMainContainer",
					"name": "IdentificationItemsControlGroup",
					"propertyName": "items",
					"values": {
						"id": "IdentificationItemsControlGroup",
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"markerValue": "IdentificationItemsControlGroup",
						"selectors": {"wrapEl": "#IdentificationItemsControlGroup"},
						"caption": {"bindTo": "Resources.Strings.IdentificationItemsControlGroupCaption"},
						"visible": {"bindTo": "getIsIdentificationGroupContainerVisible"},
						"controlConfig": {"collapsed": false},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "IdentificationItemsListContainer",
					"parentName": "IdentificationItemsControlGroup",
					"propertyName": "items",
					"values": {
						"id": "IdentificationItemsListContainer",
						"itemType": Terrasoft.ViewItemType.GRID,
						"markerValue": "IdentificationItemsListContainer",
						"selectors": {"wrapEl": "#IdentificationItemsListContainer"},
						"idProperty": "Id",
						"collection": {"bindTo": "IdentifiedSubscriberPanelCollection"},
						"onGetItemConfig": {"bindTo": "getIdentifiedSubscriberPanelViewConfig"},
						"classes": {"wrapClassName": ["identification-items-list-container"]},
						"onItemClick": {"bindTo": "setIdentifiedSubscriber"},
						"visible": {"bindTo": "getIsCurrentCallIdentificationContainerVisible"},
						"generator": "CtiContainerListGenerator.generatePartial"
					}
				},
				{
					"operation": "insert",
					"name": "IdentificationConsultItemsListContainer",
					"parentName": "IdentificationItemsControlGroup",
					"propertyName": "items",
					"values": {
						"id": "IdentificationConsultItemsListContainer",
						"itemType": Terrasoft.ViewItemType.GRID,
						"markerValue": "IdentificationConsultItemsListContainer",
						"selectors": {"wrapEl": "#IdentificationConsultItemsListContainer"},
						"idProperty": "Id",
						"collection": {"bindTo": "IdentifiedConsultSubscriberPanelCollection"},
						"onGetItemConfig": {"bindTo": "getIdentifiedSubscriberPanelViewConfig"},
						"classes": {"wrapClassName": ["identification-items-list-container"]},
						"onItemClick": {"bindTo": "setIdentifiedSubscriber"},
						"visible": {"bindTo": "getIsConsultCallIdentificationContainerVisible"},
						"generator": "CtiContainerListGenerator.generatePartial"
					}
				},

				//endregion

				//region empty panel elements

				{
					"operation": "insert",
					"name": "EmptySearchResultContainer",
					"parentName": "ctiPanelMainContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"visible": {"bindTo": "getIsEmptySearchResultContainerVisible"},
						"classes": {
							"wrapClassName": ["empty-search-result-container"]
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "EmptySearchResultImage",
					"parentName": "EmptySearchResultContainer",
					"propertyName": "items",
					"values": {
						"generator": "ImageCustomGeneratorV2.generateSimpleCustomImage",
						"onPhotoChange": Terrasoft.emptyFn,
						"getSrcMethod": "getEmptySearchResultImageUrl",
						"classes": {
							"wrapClass": ["image-container"]
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "EmptySearchResultLabel",
					"parentName": "EmptySearchResultContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {
							"labelClass": [
								"description-label"
							]
						},
						"caption": {"bindTo": "Resources.Strings.EmptySearchResultMessage"}
					}
				},

				//endregion

				//region communication history panels

				{
					"operation": "insert",
					"name": "CommunicationHistoryContainerList",
					"parentName": "ctiPanelMainContainer",
					"propertyName": "items",
					"values": {
						"id": "CommunicationHistoryContainerList",
						"itemType": Terrasoft.ViewItemType.GRID,
						"markerValue": "CommunicationHistoryContainerList",
						"selectors": {"wrapEl": "#CommunicationHistoryContainerList"},
						"idProperty": "Id",
						"collection": {"bindTo": "CommunicationHistoryPanelCollection"},
						"onGetItemConfig": {"bindTo": "getCommunicationHistoryPanelViewConfig"},
						"classes": {"wrapClassName": ["communication-history-items-list-container"]},
						"visible": {"bindTo": "getIsCommunicationHistoryVisible"},
						"generator": "CtiContainerListGenerator.generatePartial",
						"getEmptyMessageConfig": {"bindTo": "prepareEmptyGridMessageConfig"},
						"isEmpty": {"bindTo": "isEmptyCallHistoryMessageVisible"}
					}
				}

				//endregion

			]
		};
	}
);