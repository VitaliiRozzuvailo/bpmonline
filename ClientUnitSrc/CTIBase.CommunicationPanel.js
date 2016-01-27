define("CommunicationPanel", ["terrasoft", "CommunicationPanelHelper", "CtiBaseHelper"],
	function(Terrasoft, CommunicationPanelHelper, CtiBaseHelper) {
		return {
			messages: {

				/**
				 * @message SelectCommunicationPanelItem
				 * Выбирает пункт в коммуникационной панели.
				 * @param {Object} Информация о выбранном пункте коммуникационной панели.
				 */
				"SelectCommunicationPanelItem": {
					"mode": Terrasoft.MessageMode.PTP,
					"direction": Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message CallDurationChanged
				 * Изменяет строку с длительностью соответствующего звонка.
				 * @param {String} Длительность звонка.
				 */
				"CallDurationChanged": {
					"mode": Terrasoft.MessageMode.PTP,
					"direction": Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			attributes: {
				/**
				 * Признак, определяющий активен ли пункт меню «CTI панель».
				 * @type {Boolean}
				 */
				"CtiPanelActive": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * Счетчик пропущенных звонков.
				 * @type {String}
				 */
				"CtiPanelCounter": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": ""
				},

				/**
				 * Время разговора в формате mm:ss.
				 * @type {String}
				 */
				"CallDuration": {
					"dataValueType": Terrasoft.DataValueType.TEXT,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": null
				},

				/**
				 * Признак, определяющий видим ли пункт меню «CTI панель».
				 * @type {Boolean}
				 */
				"CtiPanelVisible": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": false
				},

				/**
				 * Признак, определяющий необходимость загрузки cti-модуля без последующей выгрузки.
				 * @type {Boolean}
				 */
				"CtiPanelModuleKeepAlive": {
					"dataValueType": Terrasoft.DataValueType.BOOLEAN,
					"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"value": true
				}
			},
			methods: {

				/**
				 * Инициализирует начальный выделенный пункт меню.
				 * @protected
				 * @overridden
				 * @param {function} callback Функция обратного вызова. Параметром в функцию передается тэг выбранного
				 * пункта меню.
				 */
				initSelectedMenuItem: function(callback) {
					this.sandbox.subscribe("SelectCommunicationPanelItem", this.selectItem.bind(this));
					this.sandbox.subscribe("CallDurationChanged", this.onCallDurationChanged.bind(this));
					this.callParent([function(selectedMenuItemTag) {
						CtiBaseHelper.GetIsTelephonyEnabled(function(isEnabled) {
							this.set("CtiPanelVisible", isEnabled);
							if (!isEnabled && (selectedMenuItemTag === "CtiPanel")) {
								selectedMenuItemTag = "";
							}
							if (isEnabled && (selectedMenuItemTag !== "CtiPanel")) {
								var itemConfig = this.getPanelItemConfig("CtiPanelModule");
								itemConfig.loadHidden = true;
								this.sandbox.publish("CommunicationPanelItemSelected", itemConfig);
							}
							callback(selectedMenuItemTag);
						}.bind(this));
					}.bind(this)]);
				},

				/**
				 * Обрабатывает сообщении о том, что длительность текущего звонка изменилась.
				 * @param callDuration {String} Длительность звонка в формате mm:ss.
				 */
				onCallDurationChanged: function(callDuration) {
					this.set("CallDuration", callDuration);
				},

				/**
				 * @inheritDoc Terrasoft.CommunicationPanel#getPanelItemConfig
				 * @overridden
				 */
				getPanelItemConfig: function(moduleName) {
					var config = this.callParent(arguments);
					if (moduleName !== "CtiPanelModule") {
						return config;
					}
					return Ext.apply(config, {
						keepAlive: true
					});
				},

				/**
				 * Устанавливает выбранный пункт меню.
				 * @private
				 * @param {Object} config Конфигурационный объект выбранного пункта меню.
				 */
				selectItem: function(config) {
					this.set("SelectedMenuItem", config.selectedItem);
				},

				/**
				 * Возвращает конфигурацию изображения элемента меню CtiPanel по его состоянию.
				 * @private
				 * @param {String} itemTag Идентификатор элемента меню.
				 * @returns {Object} Конфигурация изображения.
				 */
				getCtiPanelImageConfig: function(itemTag) {
					var isItemPressed = this.get("SelectedMenuItem") === itemTag;
					var ctiPanelCounter = this.get(itemTag + "Counter");
					var pressedSuffix = isItemPressed ? "Pressed" : Ext.emptyString;
					var counterSuffix = !Ext.isEmpty(ctiPanelCounter) ? "Counter" : Ext.emptyString;
					var callDuration = this.get("CallDuration");
					if (!isItemPressed) {
						counterSuffix = !Ext.isEmpty(callDuration) ? "CallDuration" : counterSuffix;
					}
					var resourceName = Ext.String.format(this.get("Resources.Strings.MenuItemIconNameTemplate"),
						itemTag, pressedSuffix, counterSuffix);
					return this.get("Resources.Images." + resourceName);
				},

				/**
				 * Возвращает стиль элемента меню CtiPanel по его состоянию.
				 * @private
				 * @param {String} itemTag Идентификатор элемента меню.
				 * @returns {String} Стиль изображения.
				 */
				getCtiPanelStyle: function(itemTag) {
					var isItemPressed = this.get("SelectedMenuItem") === itemTag;
					var callDuration = this.get("CallDuration");
					var itemWithCallDuration = (!isItemPressed && !Ext.isEmpty(callDuration));
					return itemWithCallDuration ? "with-call-duration" : "without-call-duration";
				},

				/**
				 * Возвращает подпись пункта меню "Cti панель". Может вернуть либо количество пропущеных звонков,
				 * либо, при наличие звонка и свернутой панели - длительность звонка.
				 * @private
				 * @returns {String} Подпись пункта меню "Cti панель".
				 */
				getCtiPanelCaption: function(itemTag) {
					var isItemPressed = this.get("SelectedMenuItem") === itemTag;
					var ctiPanelCounter = this.get(itemTag + "Counter");
					var callDuration = this.get("CallDuration");
					if (!isItemPressed) {
						return !Ext.isEmpty(callDuration) ? callDuration : ctiPanelCounter;
					}
					return ctiPanelCounter;
				}
			},
			diff: [
				{
					"operation": "insert",
					"index": 0,
					"parentName": "communicationPanelContent",
					"propertyName": "items",
					"name": "ctiPanel",
					"values": {
						"tag": "CtiPanel",
						"visible": {"bindTo": "CtiPanelVisible"},
						"imageConfig": {"bindTo": "getCtiPanelImageConfig"},
						"caption": {"bindTo": "getCtiPanelCaption"},
						"style": {"bindTo": "getCtiPanelStyle"},
						"generator": "CommunicationPanelHelper.generateMenuItem"
					}
				}
			]
		};
	});