define("CommunicationPanel", ["terrasoft", "RemindingsUtilities", "GoogleTagManagerUtilities",
		"CommunicationPanelHelper"],
	function(Terrasoft, RemindingsUtilities, GoogleTagManagerUtilities) {
		return {
			messages: {
				"ShowHideRightSidePanel": {
					"mode": Terrasoft.MessageMode.PTP,
					"direction": Terrasoft.MessageDirectionType.PUBLISH
				},
				"CommunicationPanelItemSelected": {
					"mode": Terrasoft.MessageMode.PTP,
					"direction": Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			mixins: {},
			attributes: {

				/**
				 * Текущий выбранный элемент меню.
				 * @type {String}
				 */
				"SelectedMenuItem": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Конфигурация педыдущего выбранного элемента меню панели.
				 * @type {String}
				 */
				"PreviousItemConfig": {
					"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": null
				},

				/**
				 * Признак, определяющий активен ли пункт меню «Лента ESN».
				 * @type {Boolean}
				 */
				"ESNFeedActive": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * Счетчик непрочитанных уведомлений пункта меню «Лента ESN».
				 * @type {String}
				 */
				"ESNFeedCounter": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Признак, определяющий активен ли пункт меню «Уведомления».
				 * @type {Boolean}
				 */
				"NotificationsActive": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * Счетчик непрочитанных уведомлений пункта меню «Уведомления».
				 * @type {String}
				 */
				"NotificationsCounter": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Признак, определяющий активен ли пункт меню «Визы».
				 * @type {Boolean}
				 */
				"VisaActive": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * Счетчик виз.
				 * @type {String}
				 */
				"VisaCounter": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Количество необработанных почтовых сообщений.
				 * @type {String}
				 */
				"EmailCounter": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Максимальная длина текста счетчика уведомлений.
				 * @type {Number}
				 */
				"MaxCounterLength": {
					"dataValueType": Terrasoft.DataValueType.INTEGER,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": 2
				},

				/**
				 * Признак отображать ли пункт меню «Визы».
				 * @type {Boolean}
				 */
				"VisaVisible": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				}
			},
			methods: {

				/**
				 * Инициализирует начальные значения модели.
				 * @protected
				 * @overridden
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						Terrasoft.ServerChannel.on(Terrasoft.EventName.ON_MESSAGE, this.onUserCountersChanged, this);
						this.initUserCounters(true);
						this.initVisaVisible();
						this.on("change:SelectedMenuItem", this.onSelectedMenuItemChanged, this);
						this.initSelectedMenuItem(function(selectedMenuItemTag) {
							this.set("SelectedMenuItem", selectedMenuItemTag);
							if (callback) {
								callback.call(scope || this);
							}
						}.bind(this));
					}, this]);
				},

				/**
				 * Инициализация атрибута доступности пункта меню «Визы».
				 * @protected
				 * @virtual
				 */
				initVisaVisible: function() {
					var select = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "NotificationProvider"
					});
					var visaType = "0";
					select.addAggregationSchemaColumn("Id", Terrasoft.AggregationType.COUNT, "VisaProviderCount");
					select.filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Type", visaType));
					select.getEntityCollection(function(response) {
						if (response.success) {
							var result = response.collection.getByIndex(0);
							var visaProviderCount = result.get("VisaProviderCount");
							var visaVisible = visaProviderCount > 0;
							this.set("VisaVisible", visaVisible);
						}
					}, this);
				},

				/**
				 * Инициализирует начальный выделенный пункт меню.
				 * @protected
				 * @virtual
				 * @param {function} callback Функция обратного вызова. Параметром в функцию передается тэг выбранного
				 * пункта меню.
				 */
				initSelectedMenuItem: function(callback) {
					var profile = this.get("Profile");
					var selectedMenuItemTag = !Ext.isEmpty((profile || {}).selectedItemTag)
						? profile.selectedItemTag
						: "";
					callback(selectedMenuItemTag);
				},

				/**
				 * Возвращает ключ профиля.
				 * @protected
				 * @overridden
				 * @returns {string} Ключ профиля для коммуникационной панели.
				 */
				getProfileKey: function() {
					return "CommunicationPanelProfileData";
				},

				/**
				 * Выполняет первоначальный подсчет количества уведомлений/виз.
				 * Выполняет вызов сервиса, который в свою очередь ставит задачу,
				 * которая периодически выполняет подсчет количества уведомлений и возврат их на клиент.
				 * @private
				 * @param {Boolean} callService Указывает нужно ли вызывать метод сервиса.
				 */
				initUserCounters: function(callService) {
					RemindingsUtilities.getRemindingsCounters(this, this.updateUserCounters);
					if (callService) {
						var config = {
							serviceName: "RemindingService",
							methodName: "UpdateRemindingsCountersStart"
						};
						this.callService(config, Terrasoft.emptyFn, this);
					}
				},

				/**
				 * Выполняет обновление количества уведомлений/виз.
				 * @private
				 * @param {Number} countersData.notificationsCount Количество уведомлений.
				 * @param {Number} countersData.visaCount Количество виз.
				 */
				updateUserCounters: function(countersData) {
					var notificationsCounterValue =
						countersData.remindingsCount > 0 ? String(countersData.remindingsCount) : "";
					var visasCounterValue = countersData.visaCount > 0 ? String(countersData.visaCount) : "";
					this.set("NotificationsCounter", notificationsCounterValue);
					this.set("VisaCounter", visasCounterValue);
				},

				/**
				 * Возвращает конфигурацию выбранного элемента меню панели.
				 * @virtual
				 * @param {String} moduleName Название модуля.
				 * @returns {Object} Конфигурация выбранного элемента меню панели.
				 */
				getPanelItemConfig: function(moduleName) {
					return {
						moduleName: moduleName,
						keepAlive: false
					};
				},

				/**
				 * Загружает модуль выбранного элемента меню панели.
				 * @private
				 * @param {String} itemTag Название модуля.
				 */
				loadModule: function(itemTag) {
					var moduleName = itemTag + "Module";
					var itemConfig = this.getPanelItemConfig(moduleName);
					if (Ext.isEmpty(itemConfig)) {
						return;
					}
					var previousItemConfig = this.get("PreviousItemConfig");
					this.set("PreviousItemConfig", itemConfig);
					itemConfig.previousItemConfig = previousItemConfig;
					this.sandbox.publish("CommunicationPanelItemSelected", itemConfig);
				},

				/**
				 * Срабатывает при клике на кнопку меню панели. 4-ым параметром передается название (tag) кнопки.
				 * @private
				 */
				onMenuItemClick: function() {
					var selectedItemTag = arguments[3];
					var oldItemTag = this.get("SelectedMenuItem");
					if (selectedItemTag === oldItemTag) {
						selectedItemTag = "";
					}
					this.set("SelectedMenuItem", selectedItemTag);

					GoogleTagManagerUtilities.actionModule({
						virtualUrl: this.Terrasoft.workspaceBaseUrl + "/" + this.sandbox.id,
						moduleName: selectedItemTag,
						typeModule: selectedItemTag
					});
				},

				/**
				 * Скрывает правую боковую панель.
				 * @private
				 */
				closeRightPanel: function() {
					this.set("SelectedMenuItem", "");
				},

				/**
				 * Устанавливает видимость кнопки "Cвернуть панель".
				 * @private
				 */
				isRightPanelCloseButtonVisible: function() {
					return !Ext.isEmpty(this.get("SelectedMenuItem"));
				},

				/**
				 * Срабатывает при изменении активного элемента меню панели.
				 * @private
				 * @param {Backbone.Model} model Модель.
				 * @param {String} newItemTag Идентификатор выбранного элемента меню.
				 */
				onSelectedMenuItemChanged: function(model, newItemTag) {
					var oldItemTag = model.previous("SelectedMenuItem");
					var isOldItemNotEmpty = !Ext.isEmpty(oldItemTag);
					var isNewItemNotEmpty = !Ext.isEmpty(newItemTag);
					this.saveProfileData(function() {
						this.sandbox.publish("ShowHideRightSidePanel", {
							forceShow: isNewItemNotEmpty
						});
						if (isNewItemNotEmpty) {
							this.loadModule(newItemTag);
						}
					}.bind(this));
					if (isOldItemNotEmpty) {
						this.set(oldItemTag + "Active", false);
					}
					if (isNewItemNotEmpty) {
						this.set(newItemTag + "Active", true);
					}
				},

				/**
				 * Сохраняет настройки коммуникационной панели в профиль.
				 * @private
				 * @param callback (optional) Функция обратного вызова.
				 */
				saveProfileData: function(callback) {
					var selectedMenuItemTag = this.get("SelectedMenuItem");
					var profileData = Ext.Object.merge(this.ProfileData || {},
						{selectedItemTag: selectedMenuItemTag});
					Terrasoft.utils.saveUserProfile(this.getProfileKey(), profileData, false, function() {
						this.set("Profile", profileData);
						if (callback) {
							callback();
						}
					}.bind(this));
				},

				/**
				 * Запускает процедуру обновления уведомлений на основании значений счетчиков,
				 * которые получены в результате выполнения задачи на сервере.
				 * @private
				 * @param {Object} scope Контекст.
				 * @param {Object} userCounters Объект, который в себе содержит значения счетчиков
				 * количества уведомлений.
				 */
				onUserCountersChanged: function(scope, userCounters) {
					if (!userCounters) {
						return;
					}
					switch (userCounters.Header.Sender) {
						case "GetRemindingCounters":
							var counters = Ext.decode(userCounters.Body);
							var countersConfig = this.getCountersConfig(counters);
							this.updateUserCounters(countersConfig);
							break;
						case "UpdateReminding":
							this.initUserCounters(false);
							break;
						default:
							break;
					}
				},

				/**
				 * Формирует конфигурационнй объект для обновления значений счетчиков.
				 * @param {Object} counters Объект, который в себе содержит значения счетчиков
				 * количества уведомлений.
				 * @return {Object} Конфигурационнй объект для обновления значений счетчиков.
				 */
				getCountersConfig: function(counters) {
					return {
						remindingsCount: counters.RemindingsCount,
						visaCount: counters.VisaCount
					};
				},

				/**
				 * Возвращает конфигурацию изображения элемента меню по его состоянию.
				 * @private
				 * @param {String} itemTag Идентификатор элемента меню.
				 * @returns {Object} Конфигурация изображения.
				 */
				getItemImageConfig: function(itemTag) {
					var isItemPressed = (this.get("SelectedMenuItem") === itemTag);
					var isItemCounter = this.get(itemTag + "Counter");
					var pressedSuffix = isItemPressed ? "Pressed" : Ext.emptyString;
					var counterSuffix = isItemCounter ? "Counter" : Ext.emptyString;
					var resourceName = this.Ext.String.format(this.get("Resources.Strings.MenuItemIconNameTemplate"),
						itemTag, pressedSuffix, counterSuffix);
					return this.get("Resources.Images." + resourceName);
				},

				/**
				 * Возвращает всплывающую подсказку для пунктов меню.
				 * @private
				 * @param {String} tag Параметр идентификации пункта меню.
				 * @returns {String} Текст всплывающей подсказки.
				 */
				getHint: function(tag) {
					return this.get("Resources.Strings." + tag + "MenuHint");
				},

				/**
				 * Возвращает конфигурацию изображения для кнопки "Свернуть панель".
				 * @private
				 * @returns {Object} Конфигурация изображения.
				 */
				getCloseRightSidePanelButtonImageConfig: function() {
					return this.get("Resources.Images.ImageCloseRightSidePanelButton");
				},

				/**
				 * Возвращает текст всплывающей подсказки для кнопки "Свернуть панель".
				 * @private
				 * @returns {String} Текст всплывающей подсказки.
				 */
				getCloseRightSidePanelButtonHint: function() {
					return this.get("Resources.Strings.CloseRightSidePanel");
				}
			},
			diff: [
				{
					"operation": "insert",
					"name": "communicationPanelAll",
					"propertyName": "items",
					"values": {
						"id": "communicationPanelAll",
						"selectors": {"wrapEl": "#communicationPanelAll"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["all"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "rightPanelCloseButton",
					"parentName": "communicationPanelAll",
					"propertyName": "items",
					"values": {
						"id": "rightPanelCloseButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "closeRightPanel"},
						"visible": {"bindTo": "isRightPanelCloseButtonVisible"},
						"imageConfig": {"bindTo": "getCloseRightSidePanelButtonImageConfig"},
						"hint": {"bindTo": "getCloseRightSidePanelButtonHint"},
						"markerValue": "rightPanelCloseButton",
						"selectors": {"wrapEl": "#rightPanelCloseButton"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "rightPanelCloseButton"
					}
				},
				{
					"operation": "insert",
					"name": "communicationPanelContent",
					"parentName": "communicationPanelAll",
					"propertyName": "items",
					"values": {
						"id": "communicationPanelContent",
						"selectors": {"wrapEl": "#communicationPanelContent"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["content"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "communicationPanelContent",
					"propertyName": "items",
					"name": "email",
					"values": {
						"tag": "Email",
						"generator": "CommunicationPanelHelper.generateMenuItem",
						"markerValue": "email"
					}
				},
				{
					"operation": "insert",
					"parentName": "communicationPanelContent",
					"propertyName": "items",
					"name": "esnFeed",
					"values": {
						"tag": "ESNFeed",
						"generator": "CommunicationPanelHelper.generateMenuItem"
					}
				},
				{
					"operation": "insert",
					"parentName": "communicationPanelContent",
					"propertyName": "items",
					"name": "remindings",
					"values": {
						"tag": "Notifications",
						"generator": "CommunicationPanelHelper.generateMenuItem"
					}
				},
				{
					"operation": "insert",
					"parentName": "communicationPanelContent",
					"propertyName": "items",
					"name": "visas",
					"values": {
						"tag": "Visa",
						"generator": "CommunicationPanelHelper.generateMenuItem",
						"visible": {"bindTo": "VisaVisible"}
					}
				}
			]
		};
	});
