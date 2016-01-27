/**
 * @class Terrasoft.BaseLocalNotificationManager
 * Базовый класс менеджера по работе с локальными уведомлениями.
 */
Ext.define("Terrasoft.Configuration.BaseLocalNotificationManager", {
	alternateClassName: "Terrasoft.BaseLocalNotificationManager",

	/**
	 * @private
	 */
	initFlag: false,
	
	/**
	 * @private
	 */
	getToProcessNotifications: function() {
		return Terrasoft.SysSettingsValue.getBooleanValue("ShowMobileLocalNotifications") &&
			(Terrasoft.core.Platform !== Terrasoft.ExecutionPlatforms.WebKit) &&
			!Terrasoft.util.isWindowsPlatform();
	},

	/**
	 * @private
	 */
	initializeLocalNotificationEvents: function(callback) {
		var me = this;
		Terrasoft.LocalNotification.onClick(function(notification) {
			Ext.callback(me.onNotificationClick, me, [notification]);
		});
		Terrasoft.LocalNotification.onClear(function(notification) {
			Ext.callback(me.onNotificationClear, me, [notification]);
		});
		if (Terrasoft.ApplicationUtils.isOnlineMode()) {
			var onResumeBinded = Ext.bind(this.onResume, this);
			Terrasoft.DocumentEventManager.subscribe("resume", onResumeBinded, false);
		}
		Ext.callback(callback, this);
	},

	/**
	 * @private
	 */
	setLocalNotificationPermission: function(callback) {
		Terrasoft.LocalNotification.promptForPermission({
			callback: function(granted) {
				if (granted) {
					this.initializeLocalNotificationEvents(callback);
				}
			},
			scope: this
		});
	},

	/**
	 * Инициализация менеджера.
	 * @protected
	 * @virtual
	 */
	initialize: function(callback) {
		if (this.initFlag) {
			Ext.callback(callback, this);
			return;
		}
		this.initFlag = true;
		Terrasoft.LocalNotification.hasPermission({
			callback: function(hasPermission) {
				if (!hasPermission) {
					this.setLocalNotificationPermission(callback);
				} else {
					this.initializeLocalNotificationEvents(callback);
				}
			},
			scope: this
		});
	},

	/**
	 * Обработчик активизации приложения, выход из спящего режима.
	 * @protected
	 * @virtual
	 */
	onResume: function() {
		var toProcessNotifications = this.getToProcessNotifications();
		if (!toProcessNotifications) {
			return;
		}
		Terrasoft.AsyncManager.callInOrder([
			this.getNotifications,
			this.createNotifications
		], this);
	},

	/**
	 * Загружает список необходимых моделей.
	 * @protected
	 * @virtual
	 */
	loadModels: function(callback) {
		Terrasoft.StructureLoader.loadModels({
			modelNames: ["VwRemindings", "Activity"],
			success: function() {
				Ext.callback(callback, this);
			},
			scope: this
		});
	},

	/**
	 * Получает список записей уведомлений.
	 * @protected
	 * @virtual
	 */
	getNotifications: function(callback) {
	},
	
	/**
	 * Создает уведомления на основе списка записей уведомлений.
	 * @protected
	 * @virtual
	 */
	createNotifications: function(callback) {
	},

	/**
	 * Обработчик нажатия на уведомление.
	 * @protected
	 * @virtual
	 */
	onNotificationClick: function(notification) {
	},

	/**
	 * Обработчик отмены напоминания.
	 * @protected
	 * @virtual
	 */
	onNotificationClear: function(notification) {
	},

	/**
	 * Обработка уведомлений.
	 */
	processNotifications: function() {
		var toProcessNotifications = this.getToProcessNotifications();
		if (!toProcessNotifications) {
			return;
		}
		Terrasoft.AsyncManager.callInOrder([
			this.loadModels,
			this.initialize,
			this.getNotifications,
			this.createNotifications
		], this);
	}

});