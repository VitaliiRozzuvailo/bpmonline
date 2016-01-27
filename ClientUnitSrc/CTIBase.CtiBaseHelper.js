define("CtiBaseHelper", ["terrasoft", "CtiConstants", "CtiBaseHelperResources"],
	function(Terrasoft, CtiConstants, resources) {

		/**
		 * Выводит информационное сообщение в консоль.
		 * @private
		 * @param {String|Object} message Сообщение.
		 */
		function log(message) {
			var console = Ext.global.console;
			if (console && console.log) {
				console.log(message);
			}
		}

		/**
		 * Выводит предупреждающее сообщение в консоль.
		 * @private
		 * @param {String|Object} message Сообщение.
		 */
		function logWarning(message) {
			var console = Ext.global.console;
			if (console && console.warn) {
				console.warn(message);
			}
		}

		/**
		 * Выводит сообщение об ошибке в консоль.
		 * @private
		 * @param {String|Object} message Сообщение.
		 */
		function logError(message) {
			var console = Ext.global.console;
			if (console && console.error) {
				console.error(message);
			}
		}

		/**
		 * Проверяет установку в профиле пользователя разрешения на подключение к телефонии.
		 * @private
		 * @param {Function} callback Функция обратного вызова. В функцию передается признак того, что телефония разрешена.
		 */
		function getIsProfileTelephonyEnabled(callback) {
			queryCtiSettings(function(ctiSettings) {
				var isTelephonyDisabled = (ctiSettings && ctiSettings.connectionParams &&
				ctiSettings.connectionParams.disableCallCentre);
				callback(!isTelephonyDisabled);
			});
		}

		/**
		 * Инициализирует параметры телефонии.
		 * @private
		 * @param {Function} callback (optional) Функция обратного вызова. В качестве аргумента передаются параметры
		 * телефонии.
		 */
		function initCtiSettings(callback) {
			if (!Terrasoft.SysValue) {
				callback(null);
				return;
			}
			var ctiSettings = Terrasoft.SysValue.CTI;
			if (Ext.isObject(ctiSettings) && ctiSettings.isInitialized) {
				callback(ctiSettings);
				return;
			}
			ctiSettings = {
				isInitialized: false
			};
			Terrasoft.SysValue.CTI = ctiSettings;
			Terrasoft.SysSettings.querySysSettings(["SysMsgLib", "InternalNumberLength", "SearchNumberLength",
					"CommunicationHistoryRowCount"],
				function(settings) {
					var sysMsgLibItem = settings.SysMsgLib;
					if (!sysMsgLibItem || (sysMsgLibItem.value === Terrasoft.GUID_EMPTY)) {
						logWarning(CtiConstants.LocalizableStrings.SysMsgLibSettingsEmptyMessage);
						ctiSettings.isInitialized = true;
						callback(ctiSettings);
						return;
					}
					var sysMsgLibId = settings.SysMsgLib.value;
					ctiSettings.sysMsgLibId = sysMsgLibId;
					ctiSettings.internalNumberLength = settings.InternalNumberLength;
					ctiSettings.searchNumberLength = settings.SearchNumberLength;
					ctiSettings.communicationHistoryRowCount = settings.CommunicationHistoryRowCount;
					initializeMsgLibSettings(sysMsgLibId, ctiSettings, callback);
				}
			);
		}

		/**
		 * Инициализирует параметры коннектора телефонии.
		 * @private
		 * @param {String} sysMsgLibId Идентификатор библиотеки обмена сообщениями.
		 * @param {Object} ctiSettings Параметры телефонии.
		 * @param {Function} callback (optional) Функция обратного вызова. В качестве аргумента передаются параметры
		 * телефонии.
		 */
		function initializeMsgLibSettings(sysMsgLibId, ctiSettings, callback) {
			if (ctiSettings.isInitialized) {
				if (callback) {
					callback(ctiSettings);
				}
				return;
			}
			var batchQuery = Ext.create("Terrasoft.BatchQuery");
			batchQuery.add(getMsgLibSelect(sysMsgLibId));
			batchQuery.add(getMsgUserSettingsSelect(sysMsgLibId));
			batchQuery.execute(function(response) {
				if (!response.success || !response.queryResults || response.queryResults.length === 0) {
					ctiSettings.isInitialized = true;
					if (callback) {
						callback(ctiSettings);
					}
					return;
				}
				var queryResults = response.queryResults;
				var msgLibRows = queryResults[0].rows;
				setMsgLibSettings(msgLibRows, ctiSettings);
				if (queryResults.length > 1) {
					var msgUserSettingsRows = queryResults[1].rows;
					setMsgUserSettings(msgUserSettingsRows, ctiSettings);
				}
				ctiSettings.isInitialized = true;
				if (callback) {
					callback(ctiSettings);
				}
			});
		}

		/**
		 * Возвращает запрос на выборку настройки библиотеки телефонии.
		 * @private
		 * @param {String} sysMsgLibId Идентификатор библиотеки обмена сообщениями.
		 * @returns {Terrasoft.EntitySchemaQuery} Запрос на выборку настройки библиотеки телефонии.
		 */
		function getMsgLibSelect(sysMsgLibId) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "SysMsgLib"
			});
			select.addColumn("SetupPageSchemaName");
			select.addColumn("LicOperations");
			select.addColumn("CtiProviderName");
			select.filters.add("idFilter", Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "Id", sysMsgLibId));
			return select;
		}

		/**
		 * Записывает в настройки cti настройки библиотеки телефонии.
		 * @private
		 * @param {Object[]} msgLibRows Записи выборки настроек библиотеки телефонии.
		 * @param {Object} ctiSettings cti телефонии.
		 */
		function setMsgLibSettings(msgLibRows, ctiSettings) {
			if (!msgLibRows || (msgLibRows.length === 0)) {
				return;
			}
			var msgLib = msgLibRows[0];
			ctiSettings.setupPageSchemaName = msgLib.SetupPageSchemaName;
			var licOperations = msgLib.LicOperations;
			if (Ext.isString(licOperations)) {
				ctiSettings.licOperations = licOperations.split(";");
			}
			ctiSettings.ctiProviderName = msgLib.CtiProviderName;
		}

		/**
		 * Возвращает запрос на выборку параметров телефонии текущего пользователя.
		 * @private
		 * @param {String} sysMsgLibId Идентификатор библиотеки обмена сообщениями.
		 * @returns {Terrasoft.EntitySchemaQuery} Запрос на выборку параметров телефонии текущего пользователя.
		 */
		function getMsgUserSettingsSelect(sysMsgLibId) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "SysMsgUserSettings"
			});
			select.addColumn("ConnectionParams");
			select.filters.add("userFilter", Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "User", Terrasoft.SysValue.CURRENT_USER.value));
			select.filters.add("libFilter", Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "SysMsgLib", sysMsgLibId));
			return select;
		}

		/**
		 * Записывает в настройки cti параметры подключения пользователя к телефонии.
		 * @private
		 * @param {Object[]} msgUserSettingsRows Записи выборки параметров подключения пользователя к телефонии.
		 * @param {Object} ctiSettings Настройки телефонии.
		 */
		function setMsgUserSettings(msgUserSettingsRows, ctiSettings) {
			if (!msgUserSettingsRows || (msgUserSettingsRows.length === 0)) {
				log(CtiConstants.LocalizableStrings.ConnectionConfigEmptyMessage);
				return;
			}
			var msgUserSettings = msgUserSettingsRows[0];
			var connectionParams = msgUserSettings.ConnectionParams;
			if (connectionParams) {
				try {
					ctiSettings.connectionParams = Terrasoft.decode(connectionParams);
				} catch (e) {
					logError(e);
				}
			}
			if (!ctiSettings.connectionParams) {
				logError(CtiConstants.LocalizableStrings.ConnectionConfigIncorrectMessage);
			}
		}

		/**
		 * Запрашивает параметры телефонии.
		 * @param {Function} callback Функция обратного вызова. В качестве аргумента передаются параметры телефонии.
		 */
		function queryCtiSettings(callback) {
			var ctiSettings = Terrasoft.SysValue.CTI;
			if (ctiSettings && ctiSettings.isInitialized) {
				callback(ctiSettings);
				return;
			}
			initCtiSettings(callback);
		}

		/**
		 * Проверяет разрешенность подключения к телефонии.
		 * Условия:
		 * Есть действующая лицензия на коннектор.
		 * В профиле пользователя включена интеграция с телефонией
		 * @param {Function} callback Функция обратного вызова.
		 */
		var getIsTelephonyEnabled = function(callback) {
			queryCtiSettings(function(ctiSettings) {
				if (Ext.isEmpty(ctiSettings.sysMsgLibId) || Ext.isEmpty(ctiSettings.ctiProviderName)
						|| Ext.isEmpty(ctiSettings.connectionParams)) {
					callback(false);
					return;
				}
				var licOperations = ctiSettings.licOperations || [];
				getUserHasOperationLicense({
					operations: licOperations,
					isAnyOperation: false
				}, function(canUseCti) {
					if (canUseCti) {
						getIsProfileTelephonyEnabled(callback);
					} else {
						logWarning(Ext.String.format(CtiConstants.LocalizableStrings.LicenseNotFoundMessage,
							licOperations));
						callback(false);
					}
				});
			});
		};

		function getUserHasOperationLicense(data, callback, scope) {
			var storage = Terrasoft.configuration.Storage;
			var key = data.operations.join("-");
			var licStore = storage.UserOperationLicense = storage.UserOperationLicense || [];
			if (licStore[key]) {
				callback.call(scope || this, licStore[key]);
			} else {
				var handler = function(response) {
					licStore[key] = response;
					callback.call(scope || this, licStore[key]);
				};
				callServiceMethod("GetUserHasOperationLicense", handler, data);
			}
		}

		function callServiceMethod(methodName, callback, data) {
			Terrasoft.AjaxProvider.request({
				url: Terrasoft.workspaceBaseUrl + "/rest/CtiRightsService/" + methodName,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data || {},
				callback: function(request, success, response) {
					var responseObject = {};
					if (success) {
						var obj = Terrasoft.decode(response.responseText);
						responseObject = obj[methodName + "Result"];
					}
					callback.call(this, responseObject);
				},
				scope: this
			});
		}

		/**
		 * Генерирует контейнер с двумя надписями - заголовок и данные для блока идентификации звонка.
		 * @param {Object} config Содержит свойства для генерации блока идентификации.
		 * @returns {Object} Конфигурация блока идентификации.
		 */
		function getIdentificationDataLabel(config) {
			var tag = Ext.isEmpty(config.tag) ? config.name : config.tag;
			var visibleBindTo = Ext.isEmpty(config.visible) ? {"bindTo": "getIsInfoLabelVisible"} : config.visible;
			var captionBindTo = Ext.isEmpty(config.caption)
				? {bindTo: "Resources.Strings." + tag + "LabelCaption"}
				: config.caption;
			var valueBindTo = Ext.isEmpty(config.value)
				? {"bindTo": "getSubscriberData"}
				: config.value;
			var controlConfig = {
				className: "Terrasoft.Container",
				id: config.name + "Info",
				selectors: {wrapEl: "#" + config.name + "Info"},
				markerValue: config.name + "Info",
				visible: visibleBindTo,
				tag: tag,
				items: [
					{
						id: config.name + "Label",
						className: "Terrasoft.Label",
						markerValue: captionBindTo,
						selectors: {wrapEl: "#" + config.name + "Label"},
						classes: {labelClass: "label-caption"},
						caption: captionBindTo
					},
					{
						id: config.name,
						className: "Terrasoft.Label",
						markerValue: valueBindTo,
						selectors: {wrapEl: "#" + config.name},
						classes: {labelClass: "subscriber-info"},
						caption: valueBindTo,
						tag: tag
					}
				]
			};
			return controlConfig;
		}

		/**
		 * Возвращает конфигурацию иконки состояния оператора.
		 * @param {String} stateCode Код cостояния оператора.
		 * @param {Boolean} isSmallIcon (optional) Взять уменьшенную иконку.
		 * @return {Object} Конфигурация изображения.
		 */
		function getOperatorStatusIcon(stateCode, isSmallIcon) {
			if (Ext.isEmpty(stateCode)) {
				return null;
			}
			stateCode = stateCode.toUpperCase();
			var imageCode;
			// TODO: #CC-131 Отображать иконку по ссылке из таблицы SysImage.
			switch (stateCode) {
				case "READY":
				case "ACTIVE":
				case "AVAILABLE":
				case "ONHOOK":
					imageCode = (isSmallIcon) ? "ReadyStatusIcon" : "ReadyStatusProfileMenuItemIcon";
					break;
				case "AWAY":
				case "ONBREAK":
				case "DND":
					imageCode = (isSmallIcon) ? "AwayStatusIcon" : "AwayStatusProfileMenuItemIcon";
					break;
				default:
					imageCode = (isSmallIcon) ? "BusyStatusIcon" : "BusyStatusProfileMenuItemIcon";
					break;
			}
			return resources.localizableImages[imageCode];
		}

		/**
		 * Генерирует контейнер с кнопками для DTMF набора и подписью с набранными символами.
		 * @param {Object} config Содержит свойства для генерации контейнера.
		 * @param {String} config.name Название контейнера.
		 * @param {Object|Boolean} config.visible Объект с конфигурацией для привязки свойства видимости контейнера
		 * или логическое значение видимости контейнера.
		 * @param {Object} config.onButtonClick Объект с конфигурацией для привязки обработчика нажатия на кнопку DTMF
		 * набора.
		 * @param {Object|String} config.dtmfDigitsLabel Объект с конфигурацией для привязки свойства подписи с
		 * набранными символами или строка с набранными символами.
		 * @returns {Object} config Конфигурация контейнера с кнопками для DTMF набора и подписью с набранными
		 * символами.
		 */
		function getDtmfButtonsContainer(config) {
			var buttonCaptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
			var buttonCaptionsAliases = {
				"*": "Star",
				"#": "Hashtag"
			};
			var containerConfig = {
				id: config.name,
				className: "Terrasoft.Container",
				selectors: {wrapEl: "#" + config.name},
				markerValue: config.name,
				classes: {wrapClassName: ["dtmf-buttons-container"]},
				visible: config.visible,
				items: []
			};
			buttonCaptions.forEach(function(caption) {
				var captionAlias = buttonCaptionsAliases[caption];
				var suffix = captionAlias ? captionAlias : caption;
				var buttonName = "DtmfButton" + suffix;
				var buttonConfig = {
					id: buttonName,
					className: "Terrasoft.Button",
					markerValue: buttonName,
					selectors: {wrapEl: "#" + buttonName},
					caption: caption,
					tag: caption,
					click: config.onButtonClick
				};
				containerConfig.items.push(buttonConfig);
			});
			var dtmfDigitsLabelConfig = {
				id: "DtmfDigitsLabel",
				className: "Terrasoft.Label",
				selectors: {wrapEl: "#DtmfDigitsLabel"},
				classes: {labelClass: "dtmf-digits-label"},
				caption: config.dtmfDigitsLabel,
				markerValue: config.dtmfDigitsLabel
			};
			containerConfig.items.push(dtmfDigitsLabelConfig);
			return containerConfig;
		}

		return {
			GetUserHasOperationLicense: getUserHasOperationLicense,
			GetIsTelephonyEnabled: getIsTelephonyEnabled,
			queryCtiSettings: queryCtiSettings,
			getIdentificationDataLabel: getIdentificationDataLabel,
			getOperatorStatusIcon: getOperatorStatusIcon,
			getDtmfButtonsContainer: getDtmfButtonsContainer
		};
	});