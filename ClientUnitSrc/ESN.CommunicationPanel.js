define("CommunicationPanel", ["terrasoft", "RemindingsUtilities", "ESNConstants", "CommunicationPanelHelper"],
	function(Terrasoft, RemindingsUtilities, ESNConstants) {
		return {
			messages: {
				"UpdateCounters": {
					"mode": Terrasoft.MessageMode.BROADCAST,
					"direction": Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			attributes: {
				/**
				 * Признак, определяющий активен ли пункт меню «уведомления esn».
				 * @type {Boolean}
				 */
				"ESNNotificationActive": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * Конфигурация отображения пункта меню «Уведомления ESN».
				 * @type {Object}
				 */
				"ESNNotificationImageConfig": {
					"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": null
				},

				/**
				 * Счетчик новых уведомлений.
				 * @type {String}
				 */
				"ESNNotificationCounter": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				}
			},
			methods: {

				/**
				 * Выполняет обновление количества уведомлений ESN.
				 * @overridden
				 * @param {Number} countersData.notificationsCount Количество уведомлений.
				 * @param {Number} countersData.visaCount Количество виз.
				 * @param {Number} countersData.esnNotificationsCount Количество уведомлений ESN.
				 */
				updateUserCounters: function(countersData) {
					this.callParent(arguments);
					var esnNotificationsCounterValue = "";
					if (countersData.hasOwnProperty("esnNotificationsCount") &&
							(countersData.esnNotificationsCount > 0)) {
						esnNotificationsCounterValue = countersData.esnNotificationsCount;
					}
					this.set("ESNNotificationCounter", esnNotificationsCounterValue);
				},

				/**
				 * Формирует конфигурационнй объект для обновления значений счетчиков.
				 * @overridden
				 * @param {Object} counters Объект, который в себе содержит значения счетчиков
				 * количества уведомлений.
				 * @return {Object} Конфигурационнй объект для обновления значений счетчиков.
				 */
				getCountersConfig: function(counters) {
					var result = this.callParent(arguments);
					result.esnNotificationsCount = counters.ESNNotificationsCount;
					return result;
				},

				/**
				 * Обработчик сообщения обновления счечиков.
				 * @private
				 */
				onUpdateCounters: function() {
					RemindingsUtilities.getRemindingsCounters(this, this.updateUserCounters);
				},

				/**
				 * Обработчик сообщения изменения счечиков.
				 * @private
				 * @param {Object} scope Контекст выполнения callback-функции.
				 * @param {Function} response Ответ от сервера.
				 */
				onSocialMessageReceived: function(scope, response) {
					if (!response) {
						return;
					}
					if (response.Header.Sender === ESNConstants.WebSocketMessageHeader.ESNNotification) {
						this.onUpdateCounters();
					}
				},

				/**
				 * Инициализирует начальные значения модели.
				 * @protected
				 * @overridden
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.sandbox.subscribe("UpdateCounters", this.onUpdateCounters, this);
						this.Terrasoft.ServerChannel.on(this.Terrasoft.EventName.ON_MESSAGE,
							this.onSocialMessageReceived, this);
						if (callback) {
							callback.call(scope || this);
						}
					}, this]);
				},

				/**
				 * Очищает все подписки на события.
				 * @virtual
				 */
				destroy: function() {
					this.Terrasoft.ServerChannel.un(this.Terrasoft.EventName.ON_MESSAGE, this.onSocialMessageReceived,
						this);
					this.callParent(arguments);
				},

				/**
				 * @inheritdoc Terrasoft.CommunicationPanel#getPanelItemConfig
				 * @overridden
				 */
				getPanelItemConfig: function(moduleName) {
					var config = this.callParent(arguments);
					if (moduleName !== "ESNFeedModule") {
						return config;
					}
					return this.Ext.apply(config, {
						keepAlive: true
					});
				}

			},
			diff: [
				{
					"operation": "insert",
					"index": 2,
					"parentName": "communicationPanelContent",
					"propertyName": "items",
					"name": "esnNotification",
					"values": {
						"tag": "ESNNotification",
						"generator": "CommunicationPanelHelper.generateMenuItem"
					}
				}
			]
		};
	});