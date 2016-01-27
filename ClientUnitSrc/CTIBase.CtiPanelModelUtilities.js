define("CtiPanelModelUtilities", ["CtiConstants", "NetworkUtilities"],
	function(CtiConstants, NetworkUtilities) {

		/**
		 * @class Terrasoft.configuration.mixins.CtiPanelModelUtilities
		 * Миксин модели представления cti панели.
		 * @type {Terrasoft.BaseObject}
		 */
		Ext.define("Terrasoft.configuration.mixins.CtiPanelModelUtilities", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.CtiPanelModelUtilities",

			// region Properties: Private

			/**
			 * Класс медиа-элемента, указывающий на то, что используется видео поток.
			 * @private
			 * @type {String}
			 */
			useVideoMediaElementClassName: "useVideo",

			// endregion

			//region Methods: Private

			/**
			 * Получает локализированную строку из ресурсов.
			 * @private
			 * @param {String} stringName Название локализированной строки.
			 * @returns {String} Локализированная строка.
			 */
			getResourceString: function(stringName) {
				return this.get("Resources.Strings." + stringName);
			},

			/**
			 * Получает локализированное изображение из ресурсов.
			 * @private
			 * @param {String} imageName Название локализированного изображения.
			 * @returns {Object} Локализированное изображение.
			 */
			getResourceImage: function(imageName) {
				return this.get("Resources.Images." + imageName);
			},

			/**
			 * Инициализирует коллекции идентифицируемых абонентов.
			 * @private
			 */
			initializeSubscribersCollections: function() {
				var events = ["add", "remove", "dataLoaded", "clear"];
				var identifiedSubscribers = this.get("IdentifiedSubscriberPanelCollection");
				var identifiedConsultSubscribers = this.get("IdentifiedConsultSubscriberPanelCollection");
				var searchResultSubscribers = this.get("SearchResultPanelCollection");
				Terrasoft.each(events, function(eventName) {
					identifiedSubscribers.on(eventName, function() {
						this.onIdentifiedSubscribersChanged(identifiedSubscribers, false);
					}.bind(this));
					identifiedConsultSubscribers.on(eventName, function() {
						this.onIdentifiedSubscribersChanged(identifiedConsultSubscribers, true);
					}.bind(this));
					searchResultSubscribers.on(eventName, function() {
						this.onSearchResultSubscribersChanged(searchResultSubscribers);
					}.bind(this));
				}, this);
			},

			/**
			 * Очищает поле номера.
			 * @private
			 */
			clearPhoneNumber: function() {
				this.set("PhoneNumber", "");
			},

			/**
			 * Совершает звонок (простой или консультационный) на номер введенный в поле PhoneNumber.
			 * @private
			 */
			callPhoneNumber: function() {
				var number = this.get("PhoneNumber");
				this.callByNumber(number);
			},

			/**
			 * Обрабатывает событие изменения значения в поле ввода номера.
			 * @param {String} value Текущее значение в поле ввода номера.
			 */
			onPhoneNumberChanged: function(value) {
				var oldValue = this.get("PhoneNumberOldValue");
				if (value === oldValue) {
					return;
				}
				this.set("PhoneNumberOldValue", value);
				if (this.isSearchValueValid(value) && !this.isPhoneNumberValid(value)) {
					this.searchSubscriberByPrimaryColumnValue(value);
				} else {
					this.set("IsSearchFinishedAndResultEmpty", false);
					this.clearSearchSubscriber();
				}
			},

			/**
			 * Обновляет строку длительности разговора.
			 * @private
			 */
			updateCallDuration: function() {
				var ctiModel = Terrasoft.CtiModel;
				var commutationStartedOn = ctiModel.get("CommutationStartedOn");
				var currentDate = new Date();
				var timeDifference = Ext.Date.getElapsed(currentDate, commutationStartedOn);
				var secondDifference = Math.floor(timeDifference / CtiConstants.TimeScale.MillisecondsInSecond);
				var minutes = Math.floor(secondDifference / CtiConstants.TimeScale.SecondsInMinute);
				if (minutes < CtiConstants.TimeScale.MinTwoDigitNumber) {
					minutes = "0" + minutes;
				}
				var seconds = secondDifference - (minutes * CtiConstants.TimeScale.SecondsInMinute);
				if (seconds < CtiConstants.TimeScale.MinTwoDigitNumber) {
					seconds = "0" + seconds;
				}
				var msg = Ext.String.format("{0}:{1}", minutes, seconds);
				ctiModel.set("CallDuration", msg);
			},

			//endregion

			//region Methods: Protected

			/**
			 * Инициализирует свойства модели при подключении телефонии.
			 * @protected
			 */
			initOnConnected: function() {
				var capabilities = this.getProviderCapabilities();
				/*jshint bitwise:false */
				this.set("IsVideoSupported",
					(capabilities.callCapabilities & Terrasoft.CallFeaturesSet.CAN_VIDEO) !== 0);
				/*jshint bitwise:true */
			},

			/**
			 * Возвращает признак широкой кнопки Завершить.
			 * @protected
			 * @return {Boolean} Возвращает true, если необходима широкая кнопка Завершить.
			 */
			getIsDropButtonLong: function() {
				var buttonsCount = this.getCanAnswer() + this.getCanHoldOrUnhold() +
					this.getCanStartOrCompleteTransfer();
				return (buttonsCount < 2);
			},

			/**
			 * Возвращает конфигурацию изображения кнопки "Положить трубку".
			 * @protected
			 * @return {Object} Конфигурация изображения.
			 */
			getDropButtonImageConfig: function() {
				var imageName = this.getIsDropButtonLong() ? "DropButtonLongIcon" : "DropButtonShortIcon";
				return this.getResourceImage(imageName);
			},

			/**
			 * Возвращает стиль кнопки "Положить трубку".
			 * @protected
			 * @return {String} Стиль кнопки "Положить трубку".
			 */
			getDropButtonStyle: function() {
				var style = this.getIsDropButtonLong() ? "call-button-long" : "call-button-middle";
				return style;
			},

			/**
			 * Возвращает конфигурацию изображения для кнопки "Снять/поставить на удержание".
			 * @protected
			 * @return {Object} Конфигурация изображения.
			 */
			getHoldButtonImageConfig: function() {
				var imageName;
				switch (true) {
					case this.getCanUnhold():
						imageName = "UnholdButtonIcon";
						break;
					case this.getCanHold():
						imageName = "HoldButtonIcon";
						break;
					default:
						imageName = "HoldButtonIconDisabled";
						break;
				}
				return this.getResourceImage(imageName);
			},

			/**
			 * Возвращает текст подсказки для кнопки "Снять/поставить на удержание".
			 * @protected
			 * @return {String|*} Текст подсказки.
			 */
			getHoldButtonHint: function() {
				var stringName = this.getCanUnhold() ? "UnholdButtonHint" : "HoldButtonHint";
				return this.getResourceString(stringName);
			},

			/**
			 * Возвращает URL изображения, если нет записей удовлетворяющих условиям поиска.
			 * @protected
			 * @return {String} URL изображения, если нет записей удовлетворяющих условиям поиска.
			 */
			getEmptySearchResultImageUrl: function() {
				var emptySearchResultImage = this.getResourceImage("EmptySearchResultImage");
				return Terrasoft.ImageUrlBuilder.getUrl(emptySearchResultImage);
			},

			/**
			 * Возвращает возможность позвонить либо совершить консультационный звонок.
			 * @protected
			 * @returns {Boolean} true, если можно позвонить либо совершить консультационный звонок. Иначе - false.
			 */
			getCanMakeCallOrMakeConsultCall: function() {
				if (this.getCanCall()) {
					return true;
				}
				return (this.get("IsTransferPrepared") && this.getCanMakeConsultCall());
			},

			/**
			 * Формирует признак видимости контейнера с найденными абонентами в результате поиска.
			 * @protected
			 * @returns {Boolean} Признак видимости контейнера с найденными абонентами в результате поиска.
			 */
			getIsSearchResultItemsListContainerVisible: function() {
				return (!this.get("IsSearchResultPanelCollectionEmpty") && this.getCanMakeCallOrMakeConsultCall());
			},

			/**
			 * Определяет видимость вкладки истории звонков.
			 * @private
			 * @returns {Boolean} true, если нет активного звонка и нет текста в поле поиска абонентоа. Иначе - false.
			 */
			getIsCommunicationHistoryVisible: function() {
				return (!this.getIsIdentificationGroupContainerVisible() &&
					this.get("IsSearchResultPanelCollectionEmpty") && !this.get("IsSearchFinishedAndResultEmpty") &&
					this.getCanMakeCallOrMakeConsultCall());
			},

			/**
			 * Возвращает признак возможности совершить DTMF набор.
			 * @protected
			 * @returns {Boolean} true, если можно совершить DTMF набор. Иначе - false.
			 */
			getCanMakeDtmf: function() {
				var isDtmfPrepared = this.get("IsDtmfPrepared");
				return (isDtmfPrepared && this.getCanDtmf());
			},

			/**
			 * Возвращает возможность инициировать начало перевода либо завершить перевод.
			 * @protected
			 * @returns {Boolean} true, если доступна инициация либо завершение перевода, иначе - false.
			 */
			getCanStartOrCompleteTransfer: function() {
				var canStartOrCompleteTransfer = this.getCanMakeConsultCall() || this.getCanBlindTransfer() ||
					this.getCanTransfer();
				return canStartOrCompleteTransfer;
			},

			/**
			 * Возвращает конфигурацию изображения кнопки "Подготовка к переводу".
			 * @protected
			 * @return {Object} Конфигурация изображения.
			 */
			getPrepareTransferButtonImageConfig: function() {
				var imageName = !this.get("IsTransferPrepared")
					? "PrepareTransferButtonIcon"
					: "PrepareTransferButtonIconDisabled";
				return this.getResourceImage(imageName);
			},

			/**
			 * Определяет, отображаются ли кнопки "Панель набора номера", "Отключить звук", "Отключить видео".
			 * @protected
			 * @return {Boolean} Кнопка видима.
			 */
			getIsAdditionalButtonsVisible: function() {
				//TODO #CC-213 #CC-347 #CC-348 Дополнительные кнопки панели.
				return this.getCanStartOrCompleteTransfer() || this.getCanHoldOrUnhold();
			},

			/**
			 * Возвращает конфигурацию изображения кнопки отображения/скрытия поля ввода DTMF наборa.
			 * @protected
			 * @return {Object} Конфигурация изображения.
			 */
			getDtmfButtonImageConfig: function() {
				var imageName = this.get("IsDtmfPrepared") ? "DtmfButtonIconPressed" : "DtmfButtonIcon";
				return this.getResourceImage(imageName);
			},

			/**
			 * Возвращает конфигурацию изображения кнопки "Панель набора номера".
			 * @protected
			 * @return {Object} Конфигурация изображения.
			 */
			getDialPanelButtonImageConfig: function() {
				var canOpenDialPanel = false;
				var imageName = canOpenDialPanel ? "DialPanelButtonIcon" : "DialPanelButtonIconDisabled";
				return this.getResourceImage(imageName);
			},

			/**
			 * Определяет, отображается ли кнопка "Отключить звук".
			 * @protected
			 * @return {Boolean} Кнопка видима.
			 */
			getIsMuteButtonVisible: function() {
				//TODO #CC-347 Реализовать работу функции "Отключить звук" (реализовать проверку).
				return this.getIsAdditionalButtonsVisible();
			},

			/**
			 * Определяет, доступность кнопки "Отключить звук".
			 * @protected
			 * @return {Boolean} Кнопка доступна.
			 */
			getIsMuteButtonEnabled: function() {
				//TODO #CC-347 Реализовать работу функции "Отключить звук" (реализовать проверку).
				return false;
			},

			/**
			 * Возвращает конфигурацию изображения кнопки "Отключить звук".
			 * @protected
			 * @return {Object} Конфигурация изображения.
			 */
			getMuteButtonImageConfig: function() {
				var canMute = false;
				var imageName = canMute ? "MuteButtonIcon" : "MuteButtonIconDisabled";
				return this.getResourceImage(imageName);
			},

			/**
			 * Возвращает текст подсказки для кнопки "Отключить звук".
			 * @protected
			 * @return {String} Текст подсказки.
			 */
			getMuteButtonHint: function() {
				var canMute = false;
				var stringName = canMute ? "MuteButtonHint" : "UnmuteButtonHint";
				return this.getResourceString(stringName);
			},

			/**
			 * Возвращает стиль контейнера с видео.
			 * @return {String}
			 */
			getVideoContainerStyle: function() {
				if (this.get("IsVideoHidden")) {
					return "video-hidden";
				}
			},

			/**
			 * Возвращает конфигурацию изображения кнопки "Отключить видео".
			 * @protected
			 * @return {Object} Конфигурация изображения.
			 */
			getVideoButtonImageConfig: function() {
				var imageName;
				var isVideoHidden = this.get("IsVideoHidden");
				var isVideoSupported = this.get("IsVideoSupported");
				if (!isVideoSupported) {
					imageName = "VideoOffButtonIconDisabled";
				} else {
					imageName = (isVideoHidden) ? "VideoOffButtonIcon" : "VideoOnButtonIcon";
				}
				return this.getResourceImage(imageName);
			},

			/**
			 * Возвращает текст подсказки для кнопки "Отключить видео".
			 * @protected
			 * @return {String} Текст подсказки.
			 */
			getVideoButtonHint: function() {
				var isVideoHidden = this.get("IsVideoHidden");
				var stringName = isVideoHidden ? "VideoOnButtonHint" : "VideoOffButtonHint";
				return this.getResourceString(stringName);
			},

			/**
			 * Возвращает конфигурацию изображения с фото абонента, а если абонент не определен - иконку
			 * неизвестного контакта.
			 * @protected
			 * @param {String} tag Тэг элемента управления фото панели идентификации.
			 * @param {String} collectionName (optional) Название коллекции идентифицируемых абонентов.
			 * @param {String} subscriberKeyName (optional) Название свойства с ключом
			 * идентифицированного абонента.
			 * @returns {Object} Конфигурация изображения.
			 */
			getSubscriberPhoto: function(tag, collectionName, subscriberKeyName) {
				var subscriberPanel = this.getIdentifiedSubscriberPanel(collectionName, subscriberKeyName);
				if (!subscriberPanel) {
					return this.getResourceImage("UnidentifiedSubscriberPhoto");
				}
				var photoId = subscriberPanel.get("Photo");
				if (subscriberPanel.get("Type") === CtiConstants.SubscriberTypes.Account) {
					return this.getResourceImage("AccountIdentifiedPhoto");
				}
				if (Ext.isEmpty(photoId) || this.Terrasoft.isEmptyGUID(photoId)) {
					return this.getResourceImage("ContactEmptyPhoto");
				}
				var photoConfig = {
					source: this.Terrasoft.ImageSources.ENTITY_COLUMN,
					params: {
						schemaName: "SysImage",
						columnName: "Data",
						primaryColumnValue: photoId
					}
				};
				return {
					source: Terrasoft.ImageSources.URL,
					url: Terrasoft.ImageUrlBuilder.getUrl(photoConfig)
				};
			},

			/**
			 * Возвращает конфигурацию изображения с фото абонента консультационного звонка.
			 * @protected
			 * @param {String} tag Тэг элемента управления фото панели идентификации.
			 * @returns {Object} Конфигурация изображения.
			 */
			getConsultSubscriberPhoto: function(tag) {
				return this.getSubscriberPhoto(tag, "IdentifiedConsultSubscriberPanelCollection",
					"IdentifiedConsultSubscriberKey");
			},

			/**
			 * Возвращает информацию об абоненте по тэгу элемента управления в блоке идентификации.
			 * @protected
			 * @param {String} tag Тэг элемента управления идентификации абонента.
			 * @param {String} collectionName (optional) Название коллекции идентифицируемых абонентов.
			 * @param {String} subscriberKeyName (optional) Название свойства с ключом идентифицированного абонента.
			 * @returns {String} Информация об абоненте.
			 */
			getSubscriberData: function(tag, collectionName, subscriberKeyName) {
				var subscriberPanel = this.getIdentifiedSubscriberPanel(collectionName, subscriberKeyName);
				if (!subscriberPanel) {
					return "";
				}
				return subscriberPanel.get(tag) || "";
			},

			/**
			 * Возвращает информацию об абоненте по тэгу элемента управления в блоке идентификации консультационного
			 * звонка.
			 * @protected
			 * @param {String} tag Тэг элемента управления идентификации абонента.
			 * @returns {String} Информация об абоненте.
			 */
			getConsultSubscriberData: function(tag) {
				return this.getSubscriberData(tag, "IdentifiedConsultSubscriberPanelCollection",
					"IdentifiedConsultSubscriberKey");
			},

			/**
			 * Определяет, являются ли данные идентификации видимые по тэгу элемента управления в блоке идентификации.
			 * @protected
			 * @param {String} tag Тэг элемента управления идентификации абонента.
			 * @param {String} collectionName (optional) Название коллекции идентифицируемых абонентов.
			 * @param {String} subscriberKeyName (optional) Название свойства с ключом идентифицированного абонента.
			 * @return {Boolean} Видимость данных идентификации.
			 */
			getIsInfoLabelVisible: function(tag, collectionName, subscriberKeyName) {
				var subscriberPanel = this.getIdentifiedSubscriberPanel(collectionName, subscriberKeyName);
				if (!subscriberPanel) {
					return false;
				}
				var identificationDataLabels = this.get("IdentificationDataLabels");
				var currentIdentificationDataLabels = identificationDataLabels[subscriberPanel.get("Type")];
				var isInfoLabelVisible = (!Ext.isEmpty(subscriberPanel.get(tag)) &&
					currentIdentificationDataLabels.indexOf(tag) !== -1);
				return isInfoLabelVisible;
			},

			/**
			 * Определяет, являются ли данные идентификации видимые по тэгу элемента управления в блоке идентификации
			 * консультационного звонка.
			 * @protected
			 * @param {String} tag Тэг элемента управления идентификации абонента.
			 * @return {Boolean} Видимость данных идентификации.
			 */
			getIsConsultInfoLabelVisible: function(tag) {
				return this.getIsInfoLabelVisible(tag, "IdentifiedConsultSubscriberPanelCollection",
					"IdentifiedConsultSubscriberKey");
			},

			/**
			 * Определяет, является ли абонент идентифицированным, в зависимости от значения параметра с ключом
			 * коллекции идентифицированных абонентов.
			 * @private
			 * @param {String} keyValue Значение ключа.
			 * @returns {Boolean} Абонент идентифицирован.
			 */
			getIsSubscriberIdentified: function(keyValue) {
				return !Ext.isEmpty(keyValue);
			},

			/**
			 * Определяет, является ли абонент неизвестным.
			 * @protected
			 * @return {Boolean} Абонент неизвестен.
			 */
			getIsSubscriberUnknown: function() {
				var identifiedSubscriberKey = this.get("IdentifiedSubscriberKey");
				return Ext.isEmpty(identifiedSubscriberKey) && this.getIsCallExists();
			},

			/**
			 * Определяет, является ли абонент консультационного звонка неизвестным.
			 * @protected
			 * @return {Boolean} Абонент неизвестен.
			 */
			getIsConsultSubscriberUnknown: function() {
				var identifiedSubscriberKey = this.get("IdentifiedConsultSubscriberKey");
				return Ext.isEmpty(identifiedSubscriberKey) && this.get("IsConsulting");
			},

			/**
			 * Определяет существует ли звонок в модели.
			 * @protected
			 * @returns {Boolean} true, если звонок существует. Иначе - false.
			 */
			getIsCallExists: function() {
				return !Ext.isEmpty(this.get("CurrentCall"));
			},

			/**
			 * @inheritdoc Terrasoft.CtiModel#callStarted.
			 * @protected
			 */
			getIsCallDurationVisible: function() {
				return !Ext.isEmpty(this.get("CommutationStartedOn"));
			},

			/**
			 * Определяет вилимость сообщения, что нет записей удовлетворяющих условиям поиска.
			 * @private
			 * @returns {Boolean} true, если нет записей удовлетворяющих условиям поиска. Иначе - false.
			 */
			getIsEmptySearchResultContainerVisible: function() {
				var isVisible = this.get("IsSearchFinishedAndResultEmpty") && this.getCanMakeCallOrMakeConsultCall();
				return isVisible;
			},

			//endregion

			// region Methods: Public

			/**
			 * Совершает звонок (простой или консультационный) на номер телефона.
			 * @param {String} number Номер телефона.
			 */
			callByNumber: function(number) {
				number = number.replace(/\D/g, "");
				if (this.isPhoneNumberValid(number)) {
					var isTransferPrepared = this.get("IsTransferPrepared");
					if (isTransferPrepared && this.getCanMakeConsultCall()) {
						this.makeConsultCall(number);
						this.set("IsTransferPrepared", false);
					} else {
						this.makeCall(number);
					}
					this.clearPhoneNumber();
				}
			},

			//endregion

			//region Events

			/**
			 * Производит переход в карточку абонента основного звонка.
			 */
			onSubscriberNameClick: function() {
				this.onNameClick(false);
			},

			/**
			 * Производит переход в карточку абонента консультационного звонка.
			 */
			onConsultSubscriberNameClick: function() {
				this.onNameClick(true);
			},

			/**
			 * Производит переход в карточку абонента.
			 * @private
			 * @param {Boolean} isConsultSubscriber Признак абонента консультанционного звонка.
			 */
			onNameClick: function(isConsultSubscriber) {
				var collectionName = isConsultSubscriber
					? "IdentifiedConsultSubscriberPanelCollection"
					: "IdentifiedSubscriberPanelCollection";
				var identifiedSubscriberKeyName = isConsultSubscriber
					? "IdentifiedConsultSubscriberKey"
					: "IdentifiedSubscriberKey";
				var subscriberPanel = this.getIdentifiedSubscriberPanel(collectionName, identifiedSubscriberKeyName);
				if (!subscriberPanel) {
					return;
				}
				var subscriberType = subscriberPanel.get("Type");
				var schemaName = (subscriberType !== CtiConstants.SubscriberTypes.Employee)
					? subscriberType
					: CtiConstants.SubscriberTypes.Contact;
				var hash = NetworkUtilities.getEntityUrl(schemaName, subscriberPanel.get("Id"));
				this.sandbox.publish("PushHistoryState", {hash: hash});
			},

			/**
			 * Обрабатывает нажатие кнопки "Подготовка к переводу".
			 */
			onPrepareTransferButtonClick: function() {
				var isTransferPrepared = this.get("IsTransferPrepared");
				this.set("IsTransferPrepared", !isTransferPrepared);
				if (!isTransferPrepared) {
					this.set("IsDtmfPrepared", false);
				}
			},

			/**
			 * Обрабатывает нажатие кнопки "Панель набора номера".
			 * @private
			 */
			onDtmfButtonClick: function() {
				var isDtmfPrepared = this.get("IsDtmfPrepared");
				this.set("IsDtmfPrepared", !isDtmfPrepared);
				if (!isDtmfPrepared) {
					this.set("IsTransferPrepared", false);
				}
			},

			/**
			 * Обработчик нажатия кнопки DTMF наборa.
			 * @private
			 */
			enterDtmf: function() {
				var dtmfDigit = arguments[3];
				this.sendDtmf(dtmfDigit);
			},

			/**
			 * Обрабатывает нажатие кнопки "Отключить звук".
			 * @private
			 */
			onMuteButtonClick: function() {
				//TODO #CC-347 Реализовать работу функции "Отключить звук".
			},

			/**
			 * Обрабатывает нажатие кнопки "Отключить видео".
			 * @private
			 */
			onVideoButtonClick: function() {
				var currentCall = this.get("CurrentCall");
				this.checkCurrentCallExists(currentCall);
				var isStartVideo = this.get("IsVideoHidden");
				this.setVideoState(currentCall, isStartVideo, this.onSetVideoState.bind(this));
				
			},

			/**
			 * @inheritdoc Terrasoft.CtiModel#commutationStarted.
			 * @private
			 */
			onCommutationStarted: function(call) {
				var currentCall = this.get("CurrentCall");
				if (currentCall && currentCall.id === call.id) {
					var durationTimerIntervalId = setInterval(this.updateCallDuration,
						CtiConstants.TalkDuration.RefreshRate);
					this.set("DurationTimerIntervalId", durationTimerIntervalId);
					this.set("CommutationStartedOn", new Date());
				}
			},

			/**
			 * Обрабатывает событие изменения состояния оператора.
			 * @param {Backbone.Model} model Cti-модель.
			 * @param {String} agentStateCode Код состояния оператора.
			 */
			onAgentStateCodeChanged: function(model, agentStateCode) {
				this.sandbox.publish("AgentStateChanged", agentStateCode);
			},

			/**
			 * Текущий звонок изменился.
			 * @param {Backbone.Model} model Cti-модель.
			 * @param {Terrasoft.integration.telephony.Call} call Объект звонка.
			 * @private
			 */
			onChangeCurrentCall: function(model, call) {
				if (call) {
					var communicationPanelConfig = {selectedItem: "CtiPanel"};
					this.sandbox.publish("SelectCommunicationPanelItem", communicationPanelConfig);
				}
			},

			/**
			 * Длительность звонка изменилась.
			 * @param {Backbone.Model} model Cti-модель.
			 * @param {String} callDuration Длительность звонка в формате mm:ss.
			 * @private
			 */
			onChangeCallDuration: function(model, callDuration) {
				this.sandbox.publish("CallDurationChanged", callDuration);
			},

			/**
			 * @inheritdoc Terrasoft.CtiModel#connected.
			 * @private
			 */
			onConnected: function() {
				//TODO #CC-349 Реализовать запрос состояния клиента при соединении/перезагрузке страницы в браузере.
				this.initializeSubscribersCollections();
				this.sandbox.publish("CtiPanelConnected");
				this.initOnConnected();
			},

			/**
			 * Обработчик события изменения номера текущего звонка.
			 * @private
			 * @param {Backbone.Model} model Модель.
			 * @param {String} number Номер текущего звонка.
			 */
			onChangeCurrentCallNumber: function(model, number) {
				var panelCollection = this.get("IdentifiedSubscriberPanelCollection");
				panelCollection.clear();
				if (!Ext.isEmpty(number)) {
					this.identifySubscriber(number);
				} else {
					this.loadCommunicationHistory();
				}
			},

			/**
			 * Обработчик события изменения номера консультационного звонка.
			 * @param {Backbone.Model} model Модель.
			 * @param {String} number Номер консультационного звонка.
			 */
			onChangeConsultCallNumber: function(model, number) {
				var panelCollection = this.get("IdentifiedConsultSubscriberPanelCollection");
				panelCollection.clear();
				if (!Ext.isEmpty(number)) {
					this.identifySubscriber(number, "IdentifiedConsultSubscriberPanelCollection",
						"IdentifiedConsultSubscriberKey");
				}
			},

			/**
			 * Обрабатывает событие изменения ключа идентифицированного абонента основного звонка.
			 * @param {Backbone.Model} model Cti-модель.
			 * @param {String} identifiedSubscriberKey Ключ идентифицированного абонента основного звонка.
			 */
			onIdentifiedSubscriberKeyChanged: function(model, identifiedSubscriberKey) {
				this.updateCallByIdentifiedSubscriber("IdentifiedSubscriberPanelCollection", identifiedSubscriberKey);
			},

			/**
			 * Обрабатывает событие изменения ключа идентифицированного абонента консультационного звонка.
			 * @param {Backbone.Model} model Cti-модель.
			 * @param {String} identifiedSubscriberKey Ключ идентифицированного абонента консультационного звонка.
			 */
			onIdentifiedConsultSubscriberKeyChanged: function(model, identifiedSubscriberKey) {
				this.updateCallByIdentifiedSubscriber("IdentifiedConsultSubscriberPanelCollection", identifiedSubscriberKey);
			},

			/**
			 * @inheritDoc Terrasoft.BaseCtiProvider#callSaved
			 */
			onCallSavedEvent: function(call) {
				var activeCall = this.activeCalls.find(call.id);
				if (activeCall) {
					this.updateCallByIdentificationData(activeCall);
				}
			},

			/**
			 * Обработчик события изменения коллекции идентифицированных абонентов звонка. По умолчанию выполняется для
			 * основного звонка.
			 * @private
			 * @param {Terrasoft.Collection} subscribersCollection Коллекция идентифицируемых абонентов.
			 * @param {String} isConsult (optional) Признак, указывающий является ли звонок консультационным.
			 */
			onIdentifiedSubscribersChanged: function(subscribersCollection, isConsult) {
				var subscribersCount = subscribersCollection.getCount();
				var identifiedSubscriberKeyPropertyName = (isConsult)
					? "IdentifiedConsultSubscriberKey"
					: "IdentifiedSubscriberKey";
				var identifiedSubscriberCountPropertyName = (isConsult)
					? "IdentifiedConsultSubscribersCount"
					: "IdentifiedSubscribersCount";
				if (subscribersCount === 1) {
					var subscriberKeys = subscribersCollection.getKeys();
					this.set(identifiedSubscriberKeyPropertyName, subscriberKeys[0]);
				} else {
					this.set(identifiedSubscriberKeyPropertyName, null);
				}
				this.set(identifiedSubscriberCountPropertyName, subscribersCount);
			},

			/**
			 * Обработчик события изменения коллекции абонентов, найденных в результате поиска.
			 * @private
			 * @param {Terrasoft.Collection} subscribersCollection Коллекция абонентов, найденных в результате поиска.
			 */
			onSearchResultSubscribersChanged: function(subscribersCollection) {
				var isSubscribersCollectionEmpty = subscribersCollection.isEmpty();
				this.set("IsSearchResultPanelCollectionEmpty", isSubscribersCollectionEmpty);
			},

			/**
			 * Обработчик события звонка клиенту.
			 * @private
			 * @param {Object} numberInfo Информация о параметрах звонка.
			 * @param {String} numberInfo.number Номер телефона клиента.
			 */
			onCallCustomer: function(numberInfo) {
				var phoneNumber = numberInfo.number;
				if (numberInfo.customerId) {
					this.set("AdvisedIdentifiedSubscriber", numberInfo.customerId);
				}
				this.makeCall(phoneNumber);
			},

			/**
			 * Обработчик события о необходимости получения записей разговоров звонка.
			 * @private
			 * @param {Object} callInfo Информация для получения записей разговоров звонка.
			 * @param {String} callInfo.callId Идентификатор звонка.
			 * @param {Function} callInfo.callback Функция обратного вызова.
			 * @param {Boolean} callInfo.callback.canGetCallRecords Признак, что есть возможность получать записи
			 * разговоров звонка.
			 * @param {String[]} callInfo.callback.callRecords (optional) Массив ссылок на записи разговоров звонка.
			 */
			onGetCallRecords: function(callInfo) {
				var callId = callInfo.callId;
				var callback = callInfo.callback;
				if (Ext.isEmpty(callId)) {
					callback(false);
					return;
				}
				var canGetCallRecords = this.get("IsConnected") && this.getCanGetCallRecords();
				if (!canGetCallRecords) {
					callback(canGetCallRecords);
					return;
				}
				this.queryCallRecords(callId, function(callRecords) {
					callback(canGetCallRecords, callRecords);
				});
			},

			/**
			 * Срабатывает при удалении звонка из списка активных @link Terrasoft.CtiModel#activeCalls.
			 * @private
			 */
			onCtiPanelActiveCallRemoved: function() {
				if (this.activeCalls.isEmpty()) {
					this.onCtiPanelActiveCallsEmpty();
				}
			},

			/**
			 * Срабатывает, если очистилась коллекция активных звонков @link Terrasoft.CtiModel#activeCalls.
			 * @private
			 */
			onCtiPanelActiveCallsEmpty: function() {
				this.clearPhoneNumber();
				this.set("IsTransferPrepared", false);
				this.set("IsDtmfPrepared", false);
				this.set("DtmfDigits", "");
				var durationTimerIntervalId = this.get("DurationTimerIntervalId");
				clearInterval(durationTimerIntervalId);
				this.set("CommutationStartedOn", null);
				this.set("CallDuration", null);
				this.set("IsVideoHidden", false);
			},

			/**
			 * Срабатывает на событии DTMF набора. Устанавливает в свойство "DtmfDigits" строку из последних набранных
			 * символов.
			 * @param {String} dtmfDigit Символ, нажатый при DTMF наборе.
			 * @private
			 */
			onDtmfEntered: function(dtmfDigit) {
				var dtmfDigits = this.get("DtmfDigits") || "";
				if (dtmfDigits.length >= CtiConstants.DtmfMaxDisplayedDigits) {
					dtmfDigits = dtmfDigits.substr(1);
				}
				this.set("DtmfDigits", dtmfDigits + dtmfDigit);
			},

			/**
			 * Обрабатывает старт webRtc сессии.
			 * @param {String} sessionId Идентификатор webRtc сессии.
			 * @param {Object} config Параметры события.
			 * @param {String} config.mediaElementId Идентификатор элемента dom, в который будет направлены аудио и
			 * видео потоки. Значение должно быть установлено в обработчике события.
			 * @private
			 */
			onWebRtcStarted: function(sessionId, config) {
				var videoContainer = Ext.getCmp("ctiPanelVideoContainer");
				if (!videoContainer) {
					return;
				}
				////TODO #CC-724 Webitel. Видеозвонки. Не работать с dom напрямую
				var videoNotSupportedMessage = this.getResourceString("VideoNotSupportedMessage");
				var videoTag = Ext.DomHelper.append(videoContainer.id, {
					tag: "video",
					id:  Ext.String.htmlEncode(sessionId),
					controls: "controls",
					html:  Ext.String.htmlEncode(videoNotSupportedMessage)
				});
				config.mediaElementId = videoTag.id;
			},

			/**
			 * Срабатывает при старте видеопотока webRtc сессии.
			 * @param {String} sessionId Идентификатор webRtc сессии.
			 * @private
			 */
			onWebRtcVideoStarted: function(sessionId) {
				////TODO #CC-724 Webitel. Видеозвонки. Не работать с dom напрямую
				var videoTag = Ext.get(sessionId);
				if (videoTag) {
					videoTag.addCls(this.useVideoMediaElementClassName);
				}
			},

			/**
			 * Срабатывает при завершении webRtc сессии.
			 * @param {String} sessionId Идентификатор webRtc сессии.
			 * @private
			 */
			onWebRtcDestroyed: function(sessionId) {
				////TODO #CC-724 Webitel. Видеозвонки. Не работать с dom напрямую
				var videoTag = Ext.get(sessionId);
				if (videoTag) {
					videoTag.remove();
				}
			},

			/**
			 * Обрабатывает изменение признака того, что видео должно быть скрыто.
			 * @private
			 * @param {Backbone.Model} model Модель.
			 * @param {String} isHidden Признак того, что видео должно быть скрыто.
			 */
			onVideoHidden: function(model, isHidden) {
				var container = Ext.getCmp("ctiPanelVideoContainer");
				if (!container || !container.wrapEl) {
					return;
				}
				var containerWrapEl = container.wrapEl;
				if (isHidden) {
					containerWrapEl.addCls("video-hidden");
				} else {
					containerWrapEl.removeCls("video-hidden");
				}
			},

			/**
			 * Обрабатывает изменение состояния использования видео во время звонка.
			 * @private
			 * @param {Boolean} isVideoActive Признак использования видео во время звонка.
			 */
			onSetVideoState: function(isVideoActive) {
				this.set("IsVideoHidden", !isVideoActive);
			}

			//endregion

		});
	});
