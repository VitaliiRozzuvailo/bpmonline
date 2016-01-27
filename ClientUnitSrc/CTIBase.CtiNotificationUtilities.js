define("CtiNotificationUtilities", ["ext-base", "terrasoft", "sandbox", "CtiNotificationUtilitiesResources",
		"DesktopPopupNotification", "CtiConstants"],
	function(Ext, Terrasoft, sandbox, resources, DesktopPopupNotification, CtiConstants) {

		/**
		 * Объект кэша нотификационных конфигураций.
		 * @type {Object}
		 */
		var callNotificationCache = Terrasoft.configuration.Storage.CallNotifications || (function() {
			var cache = {};

			Terrasoft.each(CallType, function(item) {
				cache[item] = new Terrasoft.Collection();
			});

			/**
			 * Добавляет объект конфигурации нотификации в кэш.
			 * @private
			 * @param {CallType} callType Тип звонка.
			 * @param {String} callId Идентификатор звонка.
			 * @param {Object} config Конфигурация объекта нотификации.
			 */
			cache.add = function(callType, callId, config) {
				if (!this[callType]) {
					return;
				}
				this[callType].removeByKey(callId);
				this[callType].add(callId, config);
			};

			/**
			 * Удаляет объект конфигурации нотификации из кэша.
			 * @private
			 * @param {CallType} callType Тип звонка.
			 * @param {String} callId Идентификатор звонка.
			 * @returns {Object} Возвращает удаленный объект конфигурации нотификации, иначе - false.
			 */
			cache.remove = function(callType, callId) {
				if (!this[callType]) {
					return false;
				}
				return this[callType].removeByKey(callId);
			};

			/**
			 * Возвращает объект конфигурации нотификации из кэша.
			 * @private
			 * @param {CallType} callType Тип звонка.
			 * @param {String} callId Идентификатор звонка.
			 * @returns {Object} Возвращает объект конфигурации нотификации.
			 */
			cache.find = function(callType, callId) {
				if (!this[callType]) {
					return null;
				}
				return this[callType].find(callId);
			};

			return cache;
		})();

		/**
		 * Функция обработчика события нажатия на окно нотификации.
		 * @private
		 * @param {Object} sender Объект-отправитель события.
		 */
		function onCallNotificationClick(sender) {
			focus();
			var desktopNotification = sender.target;
			var callNotification = getCallNotificationConfig(desktopNotification.tag);
			if (!Ext.isEmpty(callNotification)) {
				callNotificationCache.remove(callNotification.callType, callNotification.callId);
			}
		}

		/**
		 * Возвращает конфигурацию объекта нотификации по идентификатору.
		 * @public
		 * @param {String} callId Идентификатор входящего/исходящего вызова.
		 * @returns {Object} Возвращает конфигурацию объекта нотификации по идентификатору.
		 */
		var getCallNotificationConfig = function(callId) {
			return DesktopPopupNotification.getNotificationConfig(callId);
		};

		/**
		 * Возвращает закешированную конфигурацию объекта нотификации по типу и идентификатору звонка.
		 * @public
		 * @param {CallType} callType Тип звонка.
		 * @param {String} callId Идентификатор входящего/исходящего вызова.
		 * @returns {Object} Возвращает конфигурацию объекта нотификации по идентификатору.
		 */
		var findCachedCallNotificationConfig = function(callType, callId) {
			return callNotificationCache.find(callType, callId);
		};

		/**
		 * Показывает окно нотификации для звонка.
		 * @public
		 * @param {String} callId Идентификатор входящего/исходящего вызова.
		 * @param {String} message Сообщение, которое будет отображено в окне нотификации.
		 * @param {CallType} callType Тип звонка.
		 * @param {String} iconId Идентификатор изображения, которое будет отображено в окне нотификации.
		 */
		var showCallNotification = function(callId, message, callType, iconId) {
			if (Ext.isEmpty(message)) {
				return;
			}
			var iconUrl = Ext.emptyString;
			var title = Ext.emptyString;
			var imageConfig = {
				source: Terrasoft.ImageSources.SYS_IMAGE,
				params: {
					primaryColumnValue: iconId
				}
			};
			var callImage;
			switch (callType) {
				case CtiConstants.CallType.INCOMING:
					title = resources.localizableStrings.IncomingCallCaption;
					callImage = resources.localizableImages.IncomingCall;
					break;
				case CtiConstants.CallType.OUTGOING:
					title = resources.localizableStrings.OutgoingCallCaption;
					callImage = resources.localizableImages.OutgoingCall;
					break;
				case CtiConstants.CallType.MISSED:
					title = resources.localizableStrings.MissedCallCaption;
					callImage = resources.localizableImages.MissedCall;
					break;
				default:
					title = resources.localizableStrings.DefaultCallCaption;
					callImage = resources.localizableImages.DefaultCall;
					break;
			}
			imageConfig = Terrasoft.isGUID(iconId) ? imageConfig : callImage;
			if (!!imageConfig) {
				iconUrl = Terrasoft.ImageUrlBuilder.getUrl(imageConfig);
			}
			var notifyConfig = DesktopPopupNotification.createNotificationConfig();
			notifyConfig.title = title;
			notifyConfig.body = message;
			notifyConfig.id = callId;
			notifyConfig.iconId = iconId;
			notifyConfig.ignorePageVisibility = false;
			notifyConfig.icon = iconUrl;
			notifyConfig.callType = callType;
			notifyConfig.onClick = onCallNotificationClick;
			callNotificationCache.add(callType, callId, notifyConfig);
			DesktopPopupNotification.closeNotification(notifyConfig);
			DesktopPopupNotification.showNotification(notifyConfig);
		};

		/**
		 * Закрывает окно нотификации звонка.
		 * @param {String} callId Идентификатор входящего/исходящего вызова.
		 */
		var closeCallNotification = function(callId) {
			var callNotification = DesktopPopupNotification.getNotification(callId);
			DesktopPopupNotification.closeNotification(callNotification);
		};

		return {
			getCallNotificationConfig: getCallNotificationConfig,
			findCachedCallNotificationConfig: findCachedCallNotificationConfig,
			showCallNotification: showCallNotification,
			closeCallNotification: closeCallNotification
		};

	});