define("WebitelCtiProvider", ["ext-base", "terrasoft", "WebitelCtiProviderResources", "ServiceHelper",
		"WebitelModuleHelper"],
	function(Ext, Terrasoft, resources, ServiceHelper, WebitelModuleHelper) {
		Ext.ns("Terrasoft.integration");
		Ext.ns("Terrasoft.integration.telephony");
		Ext.ns("Terrasoft.integration.telephony.webitel");

		/**
		 * @class Terrasoft.integration.telephony.webitel.WebitelCtiProvider
		 * Класс провайдера Webitel.
		 */
		Ext.define("Terrasoft.integration.telephony.webitel.WebitelCtiProvider", {
			extend: "Terrasoft.BaseCtiProvider",
			alternateClassName: "Terrasoft.WebitelCtiProvider",
			singleton: true,

			// region Properties: Private

			/**
			 * Идентификатор устройства.
			 * @type {String}
			 */
			deviceId: "",

			/**
			 * Установлено ли соединение с телефонией.
			 * @type {Boolean}
			 */
			isConnected: false,

			/**
			 * Количество попыток подключений.
			 * @type {Number}
			 */
			connectionAttemptsCount: 5,

			/**
			 * Активный звонок.
			 * @type {Terrasoft.Telephony.Call}
			 */
			activeCall: null,

			/**
			 * Регулярное выражение для проверки, что строка является http(s) ссылкой.
			 * @type {RegExp}
			 */
			httpRegExp: new RegExp("^http(s{0,1})://"),

			/**
			 * Признак того, что конечное устройство SIP поддерживает возможность ответить на звонок.
			 * @type {Boolean}
			 */
			isSipAutoAnswerHeaderSupported: true,

			/**
			 * Использовать Web телефон.
			 * @type {Boolean}
			 */
			useWebPhone: false,

			/**
			 * Признак, определяющий использовать ли видео.
			 * @type {Boolean}
			 */
			useVideo: false,

			/**
			 * Режим отладки.
			 * @type {Boolean}
			 */
			debugMode: false,

			/**
			 * Параметры отображения видео.
			 * @type {Object}
			 */
			videoParams: {
				/** Минимальное разрешение по ширине. */
				"minWidth": 320,
				/** Максимальное разрешение по ширине. */
				"maxWidth": 1280,
				/** Минимальное разрешение по высоте. */
				"minHeight": 180,
				/** Максимальное разрешение по высоте. */
				"maxHeight": 720,
				/** Минимальная частота кадров. */
				"minFrameRate": 10,
				/** Максимальная частота кадров. */
				"maxFrameRate": 30
			},

			/**
			 * Номер консультационного звонка.
			 * @type {String}
			 */
			consultCallNumber: null,

			/*jshint bitwise:false */
			/**
			 * Набор доступных операций со звонком после соединения.
			 * @type {Number}
			 */
			connectedCallFeaturesSet: Terrasoft.CallFeaturesSet.CAN_HOLD |
			Terrasoft.CallFeaturesSet.CAN_MAKE_CONSULT_CALL |
			Terrasoft.CallFeaturesSet.CAN_BLIND_TRANSFER | Terrasoft.CallFeaturesSet.CAN_DROP |
			Terrasoft.CallFeaturesSet.CAN_DTMF,
			/*jshint bitwise:true */

			/**
			 * Объект Webitel.
			 * @type {Object}
			 */
			webitel: {},

			// endregion

			// region Properties: Protected

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#licInfoKeys
			 * @overridden
			 */
			licInfoKeys: ["WebitelCollaboration.Use"],

			// endregion

			// region Methods: Private

			/**
			 * Устанавливает соединение с сервером Webitel.
			 * @param {Object} config Конфигурация параметров соединения.
			 * @private
			 */
			connect: function(config) {
				if (this.webitel && this.isConnected) {
					return;
				}
				Terrasoft.SysSettings.querySysSettings(["webitelDomain", "webitelConnectionString",
						"webitelWebrtcConnectionString"], function(settings) {
						config.url = settings.webitelConnectionString;
						config.domain = WebitelModuleHelper.getHostName();
						config.webRtcServer = settings.webitelWebrtcConnectionString;
						var callback = function(responseObject) {
							require(["WebitelModule"], function() {
								var connection = responseObject.GetUserConnectionResult;
								if (!connection.login) {
									this.logError(resources.localizableStrings.SettingsMissedMessage);
									return;
								}
								config.login = connection.login + "@" + config.domain;
								config.password = connection.password;
								if (config.useWebPhone !== false) {
									require(["WebitelVerto"], function() {
										this.onConnected(config);
									}.bind(this));
								} else {
									this.onConnected(config);
								}
							}.bind(this));
						}.bind(this);
						var callConfig = {
							serviceName: "WUserConnectionService",
							methodName: "GetUserConnection",
							data: {
								userId: Terrasoft.SysValue.CURRENT_USER_CONTACT.value
							},
							callback: callback
						};
						ServiceHelper.callService(callConfig);
					}, this
				);
			},

			/**
			 * Обрабатывает ошибку отсутствия устройств.
			 */
			processDevicesNotFoundError: function() {
				var message = this.useVideo
					? resources.localizableStrings.VideoDeviceNotFoundMessage
					: resources.localizableStrings.AudioDeviceNotFoundMessage;
				Terrasoft.utils.showInformation(message);
			},

			/**
			 * Обработчик события соединения.
			 * @private
			 */
			onConnect: function() {
				this.fireEvent("rawMessage", "Connected");
			},

			/**
			 * Обработчик события успешной авторизации пользователя.
			 * @private
			 * @param {Object} status Текущий статус пользователя.
			 */
			onUserLogin: Ext.emptyFn,

			/**
			 * Обработчик события потери соединения.
			 * @private
			 */
			onDisconnect: function() {
				this.isConnected = false;
				this.fireEvent("rawMessage", "Disconnected");
				this.fireEvent("disconnected", "Disconnected");
			},

			/**
			 * Обработчик ошибки Webitel.
			 * @param {Object} args Данные ошибки.
			 */
			onError: function(args) {
				this.log("======================================= Error =====================================");
				this.fireEvent("error", args);
				if ((args.errorType === Ext.global.WebitelErrorTypes.Call) &&
						(args.message === "DevicesNotFoundError")) {
					this.processDevicesNotFoundError();
				}
			},

			/**
			 * Обработчик изменения состояния пользователя.
			 * @param {Object} agent Объект пользователя.
			 */
			onUserStatusChange: function(agent) {
				if (agent.id !== this.deviceId) {
					return;
				}
				var agentState;
				if (!agent.online) {
					agentState = Ext.global.WebitelAccountStatusTypes.Unregistered;
					this.isConnected = false;
					if (!this.activeCall) {
						this.fireEvent("disconnected", "Offline");
					}
				} else {
					agentState = agent.state;
					if (!this.isConnected && (agentState !== Ext.global.WebitelAccountStatusTypes.Unregistered)) {
						this.isConnected = true;
						this.fireEvent("initialized", this);
					}
					var away = agent.away;
					if ((!Ext.isEmpty(away) && (away !== Ext.global.WebitelUserAwayCauseTypes.None))) {
						agentState = away;
					}
				}
				this.fireEvent("agentStateChanged", {userState: agentState});
			},

			/**
			 * Обработчик события нового звонка.
			 * @private
			 * @param {Object} webitelCall Объект звонка Webitel.
			 */
			onNewCall: function(webitelCall) {
				var callId = webitelCall.uuid;
				var activeCall = this.activeCall;
				var isConsultCall = !Ext.isEmpty(activeCall);
				if (!webitelCall["attended-transfer-call-uuid"] && !Ext.isEmpty(activeCall)) {
					if (this.debugMode) {
						this.log("Hangup on new call: {0}", Ext.encode(webitelCall));
					}
					this.webitel.hangup(webitelCall.uuid);
					return;
				}
				var call = Ext.create("Terrasoft.integration.telephony.Call");
				call.id = callId;
				call.direction = this.getDirection(webitelCall);
				call.deviceId = this.deviceId;
				call.calledId =  webitelCall.calleeNumber;
				call.callerId = webitelCall.callerNumber;
				call.otherLegUUID = webitelCall["other-leg-unique-id"];
				call.ctiProvider = this;
				call.timeStamp = new Date();
				call.callFeaturesSet = Terrasoft.CallFeaturesSet.CAN_NOTHING;
				call.state = Terrasoft.GeneralizedCallState.ALERTING;
				if (isConsultCall) {
					call.redirectingId = this.deviceId;
					call.redirectionId = (call.direction === Terrasoft.CallDirection.OUT)
						? call.calledId
						: call.callerId;
					this.consultCall = call;
					activeCall.callFeaturesSet = Terrasoft.CallFeaturesSet.CAN_NOTHING;
					this.fireEvent("lineStateChanged", {
						callFeaturesSet: activeCall.callFeaturesSet,
						callId: activeCall.id
					});
				} else {
					/*jshint bitwise:false */
					call.callFeaturesSet = Terrasoft.CallFeaturesSet.CAN_DROP;
					if (call.direction === Terrasoft.CallDirection.IN &&
						(this.isSipAutoAnswerHeaderSupported || this.useWebPhone)) {
						call.callFeaturesSet |= Terrasoft.CallFeaturesSet.CAN_ANSWER;
					}
					/*jshint bitwise:true */
					this.activeCall = call;
				}
				this.updateDbCall(call, this.onUpdateDbCall);
				this.fireEvent("callStarted", call);
				this.fireEvent("lineStateChanged", {
					callFeaturesSet: call.callFeaturesSet,
					callId: call.id
				});
				this.fireEvent("agentStateChanged", {userState: Ext.global.WebitelAccountStatusTypes.Busy});
			},

			/**
			 * Обработчик события завершения звонка.
			 * @private
			 * @param {Object} webitelCall Объект звонка Webitel.
			 */
			onHangup: function(webitelCall) {
				var currentCall = this.findCallById(webitelCall.uuid);
				if (!currentCall) {
					return;
				}
				var callId = currentCall.id;
				var call;
				if (Ext.isEmpty(callId)) {
					call = this.activeCall;
					this.activeCall = null;
				} else {
					if (!Ext.isEmpty(this.activeCall) && this.activeCall.id === callId) {
						call = this.activeCall;
						this.activeCall = null;
					} else if (!Ext.isEmpty(this.consultCall) && this.consultCall.id === callId) {
						call = this.consultCall;
						this.consultCall = null;
						this.fireEvent("currentCallChanged", this.activeCall);
					}
				}
				if (Ext.isEmpty(call)) {
					this.fireEvent("lineStateChanged", {callFeaturesSet: Terrasoft.CallFeaturesSet.CAN_DIAL});
					return;
				}
				call.oldState = call.state;
				call.state = Terrasoft.GeneralizedCallState.NONE;
				call.callFeaturesSet = Terrasoft.CallFeaturesSet.CAN_DIAL;
				this.fireEvent("callFinished", call);
				if (!Ext.isEmpty(this.activeCall)) {
					var uuid = (this.activeCall.NewUUID) ? this.activeCall.NewUUID : this.activeCall.id;
					if (this.activeCall.state === Terrasoft.GeneralizedCallState.HOLDED) {
						this.webitel.unhold(uuid);
					}
				} else {
					if (!Ext.isEmpty(this.consultCall)) {
						this.activeCall = this.consultCall;
						this.consultCall = null;
						this.fireEvent("currentCallChanged", this.activeCall);
					} else {
						this.fireEvent("lineStateChanged", {callFeaturesSet: call.callFeaturesSet});
					}
				}
				this.updateDbCall(call, this.onUpdateDbCall);
				if (call.NewUUID) {
					this.updateCallId(call.id, call.NewUUID);
				}
				if (!this.isConnected && !this.activeCall) {
					this.fireEvent("disconnected", "Acitve call finished after disconnect");
				}
			},

			/**
			 * Обработчик события принятия звонка.
			 * @private
			 * @param {Object} webitelCall Объект звонка Webitel.
			 */
			onAcceptCall: function(webitelCall) {
				var currentCall = this.findCallById(webitelCall.uuid);
				if (!currentCall) {
					return;
				}
				var callId = currentCall.id;
				var call;
				var activeCallExists = !Ext.isEmpty(this.activeCall);
				if (activeCallExists && this.activeCall.id === callId) {
					call = this.activeCall;
				} else if (!Ext.isEmpty(this.consultCall) && this.consultCall.id === callId) {
					call = this.consultCall;
				}
				if (Ext.isEmpty(call)) {
					return;
				}
				/*jshint bitwise:false */
				call.callFeaturesSet = Terrasoft.CallFeaturesSet.CAN_DROP |
					Terrasoft.CallFeaturesSet.CAN_HOLD |
					Terrasoft.CallFeaturesSet.CAN_DTMF;
				/*jshint bitwise:true */
				call.oldState = call.state;
				call.state = Terrasoft.GeneralizedCallState.CONNECTED;
				if (call.oldState === Terrasoft.GeneralizedCallState.ALERTING) {
					this.fireEvent("commutationStarted", call);
				}
				if (activeCallExists) {
					this.fireEvent("lineStateChanged", {callFeaturesSet: this.activeCall.callFeaturesSet});
				}
				this.updateDbCall(call, this.onUpdateDbCall);
			},

			/**
			 * Обработчик события установки соединения с абонентом.
			 * @private
			 * @param {Object} webitelCall Звонок Webitel.
			 */
			onBridgeCall: function(webitelCall) {
				var activeCall = this.activeCall;
				if (!activeCall) {
					return;
				}
				var call = this.findCallById(webitelCall.uuid);
				if (!call) {
					return;
				}
				if (activeCall.id === call.id) {
					/*jshint bitwise:false */
					activeCall.callFeaturesSet |= Terrasoft.CallFeaturesSet.CAN_MAKE_CONSULT_CALL |
						Terrasoft.CallFeaturesSet.CAN_BLIND_TRANSFER;
					/*jshint bitwise:true */
				} else if (this.consultCall && this.consultCall.id === call.id) {
					activeCall.callFeaturesSet = Terrasoft.CallFeaturesSet.CAN_COMPLETE_TRANSFER;
				} else {
					return;
				}
				this.fireEvent("lineStateChanged", {callFeaturesSet: activeCall.callFeaturesSet});
			},

			/**
			 * Обработчик события постановки звонка на удержание.
			 * @private
			 * @param {Object} webitelCall Объект звонка Webitel.
			 */
			onHold: function(webitelCall) {
				var currentCall = this.findCallById(webitelCall.uuid);
				if (!currentCall) {
					return;
				}
				this.fireEvent("rawMessage", "onHoldStateChange: " + Terrasoft.encode("hold"));
				var call = this.findCallById(webitelCall.uuid);
				if (Ext.isEmpty(call)) {
					var message = "Holded activeCall is empty";
					this.logError("onHoldStateChange: {0}", message);
					return;
				}
				call.state = Terrasoft.GeneralizedCallState.HOLDED;
				this.activeCall.state = Terrasoft.GeneralizedCallState.HOLDED;
				/*jshint bitwise:false */
				call.callFeaturesSet = Terrasoft.CallFeaturesSet.CAN_UNHOLD |
				Terrasoft.CallFeaturesSet.CAN_MAKE_CONSULT_CALL |
				Terrasoft.CallFeaturesSet.CAN_DTMF;
				/*jshint bitwise:true */
				this.fireEvent("hold", call);
				this.updateDbCall(call, this.onUpdateDbCall);
				this.fireEvent("lineStateChanged", {callFeaturesSet: call.callFeaturesSet});
			},

			/**
			 * Обработчик события снятия звонка с удержания.
			 * @private
			 * @param {Object} webitelCall Звонок Webitel.
			 */
			onUnhold: function(webitelCall) {
				var currentCall = this.findCallById(webitelCall.uuid);
				if (!currentCall) {
					return;
				}
				this.fireEvent("rawMessage", "onHoldStateChange: " + Terrasoft.encode("hold"));
				var call = this.findCallById(webitelCall.uuid);
				if (Ext.isEmpty(call)) {
					var message = "Holded activeCall is empty";
					this.logError("onHoldStateChange: {0}", message);
					return;
				}
				call.state = Terrasoft.GeneralizedCallState.CONNECTED;
				call.callFeaturesSet = this.connectedCallFeaturesSet;
				this.fireEvent("unhold", call);
				this.updateDbCall(call, this.onUpdateDbCall);
				this.fireEvent("lineStateChanged", {callFeaturesSet: call.callFeaturesSet});
			},

			/**
			 * Обработчик события смены идентификатора звонка.
			 * @private
			 * @param {Object} config Измененные данные.
			 */
			onUuidCall: function(config) {
				var call = this.findCallById(config.call.uuid);
				if (call) {
					this.updateCallId(call.id, config.newId);
				}
			},

			/**
			 * Обработчик события звонка в браузере.
			 * @private
			 * @param {Object} session Сессия звонка.
			 */
			onWebitelWebRTCCall: function(session) {
				if (session.getDirection() === "incoming") {
					session.answer(this.useVideo);
				}
			},

			/**
			 * Обработчик события DTMF набора.
			 * @private
			 * @param {Object} config Конфигурация DTMF набора.
			 */
			onDtmfCall: function(config) {
				this.log("---------------- ON DTMF CALL ------------------", true);
				this.log(config.digits, true);
				this.fireEvent("dtmfEntered", config.digits);
				this.log("-----------------------------------------------", true);
			},

			/**
			 * Обработчик события начала записи звонка.
			 * @private
			 * @param {Object} webitelCall Объект звонка Webitel.
			 */
			onStartRecordCall: function(webitelCall) {
				this.log("---------------- ON RECORD START CALL ------------------", true);
				this.log(webitelCall, true);
				this.log("-----------------------------------------------", true);
			},

			/**
			 * Обработчик события остановки записи звонка.
			 * @private
			 * @param {Object} webitelCall Объект звонка Webitel.
			 */
			onStopRecordCall: function(webitelCall) {
				this.log("---------------- ON RECORD STOP CALL ------------------", true);
				this.log(webitelCall, true);
				this.log("-----------------------------------------------", true);
			},

			/**
			 * Обработчик события новой webRTC сессии.
			 * @private
			 * @param {Object} session Параметры webRtc сессии.
			 */
			onNewWebRTCCall: function(session) {
				var config = {};
				this.fireEvent("webRtcStarted", session.callID, config);
				if (config.mediaElementId) {
					session.params.tag = config.mediaElementId;
				}
			},

			/**
			 * Обработчик события старта видео потока webRtc сессии.
			 * @param {Object} session Параметры webRtc сессии.
			 */
			onVideoWebRTCCall: function(session) {
				if (!this.useVideo) {
					return;
				}
				this.fireEvent("webRtcVideoStarted", session.callID);
			},

			/**
			 * Обработчик события завершения webRTC сессии.
			 * @private
			 * @param {Object} session Параметры потока.
			 */
			onDestroyWebRTCCall: function(session) {
				this.fireEvent("webRtcDestroyed", session.callID);
			},

			/**
			 * Подписка на события телефонии Webitel.
			 * @private
			 */
			subscribeEvents: function() {
				var events = [
					{
						eventName: "onUserStatusChange",
						eventHandler: this.onUserStatusChange
					},
					{
						eventName: "onNewCall",
						eventHandler: this.onNewCall
					},
					{
						eventName: "onHangupCall",
						eventHandler: this.onHangup
					},
					{
						eventName: "onAcceptCall",
						eventHandler: this.onAcceptCall
					},
					{
						eventName: "onHoldCall",
						eventHandler: this.onHold
					},
					{
						eventName: "onUnholdCall",
						eventHandler: this.onUnhold
					},
					{
						eventName: "onBridgeCall",
						eventHandler: this.onBridgeCall
					},
					{
						eventName: "onUnBridgeCall",
						eventHandler: Terrasoft.emptyFn
					},
					{
						eventName: "onUuidCall",
						eventHandler: this.onUuidCall
					},
					{
						eventName: "onWebitelWebRTCCall",
						eventHandler: this.onWebitelWebRTCCall
					},
					{
						eventName: "onDtmfCall",
						eventHandler: this.onDtmfCall
					},
					{
						eventName: "onStartRecordCall",
						eventHandler: this.onStartRecordCall
					},
					{
						eventName: "onStopRecordCall",
						eventHandler: this.onStopRecordCall
					},
					{
						eventName: "onConnect",
						eventHandler: this.onConnect
					},
					{
						eventName: "onUserLogin",
						eventHandler: this.onUserLogin
					},
					{
						eventName: "onDisconnect",
						eventHandler: this.onDisconnect
					},
					{
						eventName: "onError",
						eventHandler: this.onError
					},
					{
						eventName: "onNewWebRTCCall",
						eventHandler: this.onNewWebRTCCall
					},
					{
						eventName: "onVideoWebRTCCall",
						eventHandler: this.onVideoWebRTCCall
					},
					{
						eventName: "onDestroyWebRTCCall",
						eventHandler: this.onDestroyWebRTCCall
					}
				];
				Terrasoft.each(events, function(event) {
					this.webitel[event.eventName](event.eventHandler.bind(this));
				}, this);
			},

			/**
			 * Обработчик события подключения к телефонии.
			 * @private
			 * @param {Object} config Параметры подключения.
			 */
			onConnected: function(config) {
				this.isSipAutoAnswerHeaderSupported = (config.isSipAutoAnswerHeaderSupported !== false);
				this.webitel = {};
				this.useWebPhone = config.useWebPhone || false;
				var webrtcConfig = false;
				this.useVideo = config.useVideo;
				if (this.useWebPhone) {
					webrtcConfig = {
						/*jshint camelcase:false */
						ws_servers: config.webRtcServer,
						/*jshint camelcase:true */
						login: config.login,
						webitelNumber: config.login.toString().split("@")[0],
						password: config.password,
						/*jshint camelcase:false */
						stun_servers: [],
						/*jshint camelcase:true */
						videoParams: this.videoParams
					};
				}
				this.webitel = new Ext.global.Webitel({
					server: config.url,
					account: config.login,
					secret: config.password,
					reconnect: this.connectionAttemptsCount,
					debug: config.debugMode || false,
					webrtc: webrtcConfig
				});
				Ext.global.webitel = this.webitel;
				this.deviceId = config.login.toString().split("@")[0];
				this.isAutoLogin = config.isAutoLogin;
				this.debugMode = config.debugMode;
				this.webitel.ctiProvider = this;
				this.subscribeEvents();
				try {
					if (this.isAutoLogin) {
						this.webitel.connect();
					}
				} catch (e) {
					this.onConnectError({
						errorCode: e.message,
						errorMessage: e.message
					});
				}
			},

			/**
			 * Обработчик события обновления звонка в базе данных.
			 * @private
			 * @param {Object} request Запрос.
			 * @param {Boolean} success Признак успешности выполнения запроса.
			 * @param {Object} response Ответ.
			 */
			onUpdateDbCall: function(request, success, response) {
				var callDatabaseUid = Terrasoft.decode(response.responseText);
				if (success && Terrasoft.isGUID(callDatabaseUid)) {
					var call = Terrasoft.decode(request.jsonData);
					if (!Ext.isEmpty(this.activeCall) && (this.activeCall.id === call.id ||
						this.activeCall.NewUUID === call.id)) {
						call = this.activeCall;
					} else if (!Ext.isEmpty(this.consultCall) && (this.consultCall.id === call.id ||
						this.consultCall.NewUUID === call.id)) {
						call = this.consultCall;
					}
					call.databaseUId = callDatabaseUid;
					this.fireEvent("callSaved", call);
				} else {
					this.fireEvent("rawMessage", "Update Call error");
					var errorInfo = {
						internalErrorCode: null,
						data: response.responseText,
						source: "App server",
						errorType: Terrasoft.MsgErrorType.COMMAND_ERROR
					};
					this.fireEvent("error", errorInfo);
				}
			},

			/**
			 * Обработчик события ошибки подключения к телефонии.
			 * @private
			 * @param {Object} err Объект, содаржащий описание ошибки.
			 */
			onConnectError: function(err) {
				this.fireEvent("rawMessage", "onConnectError: " + Terrasoft.encode(err));
			},

			/**
			 * Выполняет поиск звонка по его идентификатору.
			 * @private
			 * @param {String} callId Идентификатор звонка.
			 * @returns {Terrasoft.Telephony.Call} Найденный звонок.
			 */
			findCallById: function(callId) {
				if (!Ext.isEmpty(this.consultCall) && (this.consultCall.id === callId ||
					this.consultCall.NewUUID === callId)) {
					return this.consultCall;
				} else if (!Ext.isEmpty(this.activeCall) && (this.activeCall.id === callId ||
					this.activeCall.NewUUID === callId)) {
					return this.activeCall;
				}
				return null;
			},

			/**
			 * Возвращает направление звонка.
			 * @private
			 * @param {Object} webitelCall Объект звонка Webitel.
			 * @returns {Terrasoft.CallDirection} Идентификатор направления звонка.
			 */
			getDirection: function(webitelCall) {
				return (webitelCall.direction === Ext.global.WebitelCallDirectionTypes.Inbound)
					? Terrasoft.CallDirection.IN
					: Terrasoft.CallDirection.OUT;
			},

			/**
			 * Обновляет идентификатор звонка в базе данных.
			 * @private
			 * @param {String} callId Существующий идентификатор звонка.
			 * @param {String} newCallId Новый идентификатор звонка.
			 */
			updateCallId: function(callId, newCallId) {
				var update = Ext.create("Terrasoft.UpdateQuery", {
					rootSchemaName: "Call"
				});
				update.setParameterValue("IntegrationId", newCallId, 1);
				update.filters.add("IntegrationId", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "IntegrationId", callId));
				update.execute();
			},

			/**
			 * Возвращает возможность использования видео для звонка.
			 * @param {String} opponentNumber Номер абонента.
			 */
			getCanUseVideo: function(opponentNumber) {
				if (!this.useVideo) {
					return false;
				}
				return !(Ext.isString(opponentNumber) && Terrasoft.SysValue && Terrasoft.SysValue.CTI &&
					(opponentNumber.length > Terrasoft.SysValue.CTI.internalNumberLength));
			},

			//endregion

			//region Methods: Public

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#init
			 */
			init: function() {
				this.callParent(arguments);
				this.loginMsgService(this.msgUtilServiceUrl + this.loginMethodName, {
					"LicInfoKeys": this.licInfoKeys,
					"UserUId": Terrasoft.SysValue.CURRENT_USER.value
				}, this.connect.bind(this));
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#queryCallRecords
			 */
			queryCallRecords: function(callId, callback) {
				this.webitel.getRecordFileFromUUID(callId, function(result) {
					var response = result.response;
					if (!this.httpRegExp.test(response)) {
						this.logError(response);
						return;
					}
					callback([response]);
				}.bind(this));
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#makeCall
			 */
			makeCall: function(number) {
				var useVideo = this.getCanUseVideo(number);
				try {
					this.webitel.call(number, useVideo);
				} catch (e) {
					this.logError(e.message);
				}
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#answerCall
			 */
			answerCall: function(call) {
				var useVideo = this.getCanUseVideo(call.getAbonentNumber());
				this.webitel.answer(call.id, useVideo);
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#dropCall
			 */
			dropCall: function(call) {
				this.webitel.hangup(call.id);
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#makeConsultCall
			 */
			makeConsultCall: function(call, targetAddress) {
				if (call.state === Terrasoft.GeneralizedCallState.HOLDED) {
					this.webitel.attendedTransfer(call.id, targetAddress);
				} else {
					this.webitel.hold(call.id, function() {
						this.webitel.attendedTransfer(call.id, targetAddress);
					}.bind(this));
				}
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#cancelTransfer
			 */
			cancelTransfer: function(currentCall, consultCall) {
				this.webitel.cancelTransfer(currentCall.id, consultCall.id);
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#transferCall
			 */
			transferCall: function(currentCall, consultCall) {
				this.webitel.bridgeTransfer(currentCall.id, consultCall.id);
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#holdCall
			 */
			holdCall: function(call) {
				this.webitel.toggleHold(call.id);
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#blindTransferCall
			 */
			blindTransferCall: function(call, targetAddress) {
				this.webitel.transfer(call.id, targetAddress);
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#queryLineState
			 */
			queryLineState: Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#queryActiveCallSnapshot
			 */
			queryActiveCallSnapshot: Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#setUserState
			 * @param {String} code Код состояния.
			 * @param {String} reason (optional) Причина изменения состояния.
			 * @param {Object} callback (optional) Функция обратного вызова.
			 * @param {Boolean} disableReconnect (optional) Не выполнять попытку повторной авторизации.
			 */
			setUserState: function(code, reason, callback, disableReconnect) {
				code = code ? code.toUpperCase() : "";
				if (!this.isConnected && (code !== Ext.global.WebitelAccountStatusTypes.Unregistered)) {
					if (disableReconnect) {
						if (callback) {
							callback();
							return;
						}
					}
					this.webitel.login(function() {
						this.setUserState(code, reason, callback, true);
					}.bind(this));
					return;
				}
				switch (code) {
					case Ext.global.WebitelAccountStatusTypes.Unregistered:
						if (!this.activeCall) {
							this.webitel.logout();
						}
						if (callback) {
							callback();
						}
						break;
					case Ext.global.WebitelAccountStatusTypes.Ready:
						this.webitel.ready(callback);
						break;
					default:
						this.webitel.busy(code, reason, callback);
						break;
				}
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#queryUserState
			 */
			queryUserState: Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#changeCallCentreState
			 */
			changeCallCentreState: Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#getCapabilities
			 */
			getCapabilities: function() {
				/*jshint bitwise:false */
				var callCapabilities = Terrasoft.CallFeaturesSet.CAN_RECALL | Terrasoft.CallFeaturesSet.CAN_DIAL |
					Terrasoft.CallFeaturesSet.CAN_DROP |
					Terrasoft.CallFeaturesSet.CAN_HOLD | Terrasoft.CallFeaturesSet.CAN_UNHOLD |
					Terrasoft.CallFeaturesSet.CAN_COMPLETE_TRANSFER |
					Terrasoft.CallFeaturesSet.CAN_BLIND_TRANSFER | Terrasoft.CallFeaturesSet.CAN_MAKE_CONSULT_CALL |
					Terrasoft.CallFeaturesSet.CAN_DTMF;
				if (this.isSipAutoAnswerHeaderSupported) {
					callCapabilities |= Terrasoft.CallFeaturesSet.CAN_ANSWER;
				}
				if (this.useVideo) {
					callCapabilities |= Terrasoft.CallFeaturesSet.CAN_VIDEO;
				}
				/*jshint bitwise:true */
				return {
					callCapabilities: callCapabilities,
					agentCapabilities: Terrasoft.AgentFeaturesSet.CAN_GET_CALL_RECORDS
				};
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#sendDtmf
			 */
			sendDtmf: function(call, digit) {
				this.webitel.dtmf(call.id, digit);
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#setVideoState
			 */
			setVideoState: function(call, isVideoActive, callback) {
				var videoAction = isVideoActive ? "on" : "off";
				this.webitel.setMuteVideo(call.id, videoAction);
				callback(isVideoActive);
			},

			/**
			 * @inheritdoc Terrasoft.BaseCtiProvider#closeConnection
			 */
			closeConnection: function() {
				this.webitel.disconnect();
			}

			//endregion

		});
	}
);
