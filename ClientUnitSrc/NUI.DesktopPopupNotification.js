define("DesktopPopupNotification", ["ext-base"],
		function(Ext) {
			/**
			 * Коллекция созданных и не закрытых объектов нотификации с их конфигами.
			 * @type {Terrasoft.Collection}
			 */
			var notifications = new Terrasoft.Collection();

			/**
			 * @enum
			 * Тип разрешения. */
			var PermissionType = {
				/** По умолчанию. */
				DEFAULT: "default",
				/** Разрешено. */
				GRANTED: "granted",
				/** Запрещено. */
				DENIED: "denied"
			};

			/**
			 * Массив разрешений.
			 * @type {String[]}
			 */
			var permissionTypes = [PermissionType.GRANTED, PermissionType.DEFAULT, PermissionType.DENIED];

			/**
			 * Признак, находится ли окно в фокусе.
			 * @type {Boolean}
			*/
			var isWindowFocused = true;

			/**
			 * Функция обработчика события показа окна нотификации.
			 * @private
			 */
			var defOnShow = Ext.emptyFn;

			/**
			 * Функция обработчика события нажатия на окно нотификации.
			 * @private
			 * @param {Object} sender Объект отправитель события.
			 */
			var defOnClick = function(sender) {
				closeNotification(sender.target);
			};

			/**
			 * Функция обработчика события закрытия окна нотификации.
			 * @param {Object} sender Объект отправитель события.
			 */
			var defOnClose = function(sender) {
				closeNotification(sender.target);
			};

			/**
			 * Функция обработчика события ошибки окна нотификации.
			 */
			var defOnError = Ext.emptyFn;

			/**
			 * Проверяет видимость окна.
			 * @private
			 * @returns {Boolean} true если окно скрыто, иначе - false.
			 */
			function getIsDocumentHidden() {
				return !isWindowFocused;
			}

			/**
			 * Возвращает текущий установленный уровень разрешения.
			 * @private
			 * @returns {String} Разрешение (default, granted, denied).
			 */
			var getPermissionLevel = function() {
				if (!getIsNotificationSupported()) {
					return PermissionType.DEFAULT;
				}
				var permissionLevel;
				if (window.Notification && window.Notification.permissionLevel) {
					permissionLevel = window.Notification.permissionLevel();
				} else if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
					permissionLevel = permissionTypes[window.webkitNotifications.checkPermission()];
				} else if (navigator.mozNotification) {
					permissionLevel = PermissionType.GRANTED;
				} else if (window.Notification && window.Notification.permission) {
					permissionLevel = window.Notification.permission;
				}
				return permissionLevel;
			};

			/**
			 *  Возвращает поддерживает ли браузер механизм Popup нотификаций.
			 *  @public
			 *  @returns {Boolean} true если механизм поддерживается, иначе - false.
			 */
			var getIsNotificationSupported = function() {
				var isSupported = false;
				try {
					isSupported = !!(window.Notification || window.webkitNotifications || navigator.mozNotification);
				} catch (e) {}
				return isSupported;
			};

			/**
			 * Запрашивает разрешение у пользователя на показ Popup нотификации.
			 * @public
			 * @param {Function} callback Функция, которая будет вызвана после решения пользователя.
			 */
			var requestPermission = function(callback) {
				if (!getIsNotificationSupported()) {
					return;
				}
				var callbackFunction = Ext.isFunction(callback) ? callback : Ext.emptyFn;
				if (window.webkitNotifications && window.webkitNotifications.checkPermission) {
					window.webkitNotifications.requestPermission(callbackFunction);
				} else if (window.Notification && window.Notification.requestPermission) {
					window.Notification.requestPermission(callbackFunction);
				}
			};

			/**
			 * Создает конфигурацию объекта нотификации по умолчанию.
			 * @returns {Object} Конфигурация объекта нотификации.
			 */
			var createNotificationConfig = function() {
				return {
					id: Ext.emptyString,
					title: Ext.emptyString,
					body: Ext.emptyString,
					icon: {},
					ignorePageVisibility: true,
					onClick: defOnClick,
					onClose: defOnClose,
					onError: defOnError,
					onShow: defOnShow
				};
			};

			/**
			 * Возвращает объект окна нотификации по идентификатору.
			 * @public
			 * @param {String} id Идентификатор объекта нотификации.
			 * @returns {Object} Объект окна нотификации.
			 */
			var getNotification = function(id) {
				var notifyItem = notifications.find(id);
				if (!notifyItem) {
					return null;
				}
				return notifyItem.notification;
			};

			/**
			 * Возвращает конфигурацию объекта нотификации по идентификатору.
			 * @public
			 * @param {String} id Идентификатор объекта нотификации.
			 * @returns {Object} Конфигурация объекта нотификации.
			 */
			var getNotificationConfig = function(id) {
				var notifyItem = notifications.find(id);
				if (!notifyItem) {
					return null;
				}
				return notifyItem.config;
			};

			/**
			 * Показывает окно нотификации.
			 * @public
			 * @param {Object} config Конфигурациия для объекта окна нотификации.
			 * @returns {Object} Объект окна нотификации.
			 */
			var showNotification = function(config) {
				var notifyItem = notifications.find(config.id);
				var notification = null;
				if (!getIsNotificationSupported()) {
					return notification;
				}
				if ((getPermissionLevel() !== PermissionType.GRANTED)) {
					return notification;
				}
				if ((config.ignorePageVisibility || getIsDocumentHidden()) &&
					Ext.isString(config.title) && (Ext.isString(config.icon) || Ext.isObject(config.icon))) {
					if (window.Notification) {
						notification = notifyItem ? notifyItem.notification :
							new window.Notification(config.title, {
								icon: Ext.isString(config.icon) ? config.icon : config.icon.x32,
								body: config.body || Ext.emptyString,
								tag: config.id
							});
					} else if (window.webkitNotifications) {
						notification = notifyItem ? notifyItem.notification :
							window.webkitNotifications.createNotification(config.icon, config.title, config.body);
						notification.show();
					} else if (navigator.mozNotification) {
						notification = notifyItem ? notifyItem.notification :
							navigator.mozNotification.createNotification(config.title, config.body, config.icon);
						notification.show();
					}
					notification.onclick = config.onClick && config.onClick !== defOnClick ? function(sender) {
						config.onClick.call(this, sender);
						defOnClick.call(this, sender);
					} : defOnClick;
					notification.onshow = config.onShow && config.onShow !== defOnShow ? function(sender) {
						config.onShow.call(this, sender);
						defOnShow.call(this, sender);
					} : defOnShow;
					notification.onrror = config.onError && config.onError !== defOnError ? function(sender) {
						config.onError.call(this, sender);
						defOnError.call(this, sender);
					} : defOnError;
					notification.onclose = config.onClose && config.onClose !== defOnClose ? function(sender) {
						config.onClose.call(this, sender);
						defOnClose.call(this, sender);
					} : defOnClose;
					if (!notifyItem) {
						notifications.add(config.id, {notification: notification, config: config});
					}
				}
				return notification;
			};

			/**
			 * Закрывает окно нотификации.
			 * @public
			 * @param {Object} notification Объект окна нотификации.
			 */
			var closeNotification = function(notification) {
				if (!notification) {
					return;
				}
				var notifyItem = notifications.removeByKey(notification.tag);
				if (!notifyItem) {
					return;
				}
				if (notifyItem.notification.close) {
					notifyItem.notification.close();
				}
			};

			window.addEventListener("focus", function() {
				isWindowFocused = true;
			});

			window.addEventListener("blur", function() {
				isWindowFocused = false;
			});

			return {
				PermissionType: PermissionType,
				getIsNotificationSupported: getIsNotificationSupported,
				getPermissionLevel: getPermissionLevel,
				requestPermission: requestPermission,
				createNotificationConfig: createNotificationConfig,
				getNotification: getNotification,
				getNotificationConfig: getNotificationConfig,
				showNotification: showNotification,
				closeNotification: closeNotification
			};
		}
);