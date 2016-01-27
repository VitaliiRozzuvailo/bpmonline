define("BaseSchemaViewModel", ["MaskHelper", "NetworkUtilities", "LookupUtilities",
	"ConfigurationEnums", "ModuleUtils", "HistoryStateUtilities", "RightUtilities"],
	function(MaskHelper, NetworkUtilities, LookupUtilities, ConfigurationEnums, moduleUtils) {

		/**
		 * @class Terrasoft.configuration.BaseSchemaViewModel
		 * Конфигурационный базовый класс модели представления.
		 */
		Ext.define("Terrasoft.configuration.BaseSchemaViewModel", {
			alternateClassName: "Terrasoft.BaseSchemaViewModel",
			extend: "Terrasoft.BaseViewModel",

			Ext: null,

			sandbox: null,

			Terrasoft: null,

			/**
			 * Идентификатор маски.
			 * @type {String}
			 */
			bodyMaskId: "",

			/**
			 * Имя контейнера, в который отрендерена ViewModel.
			 */
			renderTo: "",

			/**
			 * Название метода модели представления, который будет вызван после нажатия на элмент меню кнопки "Действия".
			 */
			actionsClickMethodName: "onCardAction",

			/**
			 * Используемые сообщения.
			 * @protected
			 */
			messages: {
				/**
				 * @message LookupInfo
				 * Для работы LookupUtilities.
				 */
				"LookupInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message ResultSelectedRows
				 * Для работы LookupUtilities.
				 */
				"ResultSelectedRows": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},

			/**
			 *
			 */
			mixins: {
				/**
				 * Миксин, реализующий работу с HistoryState.
				 */
				HistoryStateUtilities: "Terrasoft.HistoryStateUtilities",

				/**
				 * @class RightUtilitiesMixin реализующий базовые с правами.
				 */
				RightUtilitiesMixin: "Terrasoft.RightUtilitiesMixin"
			},

			/**
			 * Создает экземпляр схемы.
			 */
			constructor: function() {
				this.callParent(arguments);
				this.registerMessages();
			},

			/**
			 * Инициализует модель представления.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Объект окружения фукнции обратного вызова.
			 */
			init: function(callback, scope) {
				this.initializeProfile(function() {
					this.initTypeColumnName();
					this.setValidationConfig();
					if (this.Ext.isFunction(callback)) {
						callback.call(scope);
					}
				}, this);
			},

			/**
			 * Инициализирует колонку профиля в модели представления значением.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Объект окружения фукнции обратного вызова.
			 */
			initializeProfile: function(callback, scope) {
				this.requireProfile(function(profile) {
					var profileColumnName = this.getProfileColumnName();
					this.set(profileColumnName, profile);
					if (this.Ext.isFunction(callback)) {
						callback.call(scope);
					}
				}, this);
			},

			/**
			 * Загружает профиль текущей схемы.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Объект окружения фукнции обратного вызова.
			 */
			requireProfile: function(callback, scope) {
				var profileKey = this.getProfileKey();
				this.Terrasoft.require(["profile!" + profileKey], function(profile) {
					if (this.Ext.isFunction(callback)) {
						callback.call(scope, profile);
					}
				}, this);
			},

			/**
			 * Добавляет валидатор для указанной колонки.
			 * @protected
			 * @virtual
			 * @param {String} columnName Имя колонки для валидации.
			 * @param {Function} validatorFn Функция валидации.
			 */
			addColumnValidator: function(columnName, validatorFn) {
				var columnValidationConfig = this.validationConfig[columnName] || (this.validationConfig[columnName] = []);
				columnValidationConfig.push(validatorFn);
			},

			/**
			 * Инициализирует пользовательские валидаторы.
			 * @protected
			 * @virtual
			 */
			setValidationConfig: Terrasoft.emptyFn,

			/**
			 * Возвращает ключ профиля.
			 * @virtual
			 * @return {string} Ключ профиля.
			 */
			getProfileKey: function() {
				return "";
			},

			/**
			 * Отображает маску.
			 * @protected
			 * @param {Object} config Параметры для отображения маски.
			 */
			showBodyMask: function(config) {
				MaskHelper.ShowBodyMask(config);
			},

			/**
			 * Удаляет маску по идентификатору.
			 * protected
			 */
			hideBodyMask: function() {
				MaskHelper.HideBodyMask();
			},

			/**
			 * Инициализирует коллекцию страниц редактирования сущности.
			 * @protected
			 */
			initEditPages: function() {
				var collection = Ext.create("Terrasoft.BaseViewModelCollection");
				var entityStructure = this.getEntityStructure(this.entitySchemaName);
				if (entityStructure) {
					Terrasoft.each(entityStructure.pages, function(editPage) {
						var typeUId = editPage.UId || Terrasoft.GUID_EMPTY;
						collection.add(typeUId, Ext.create("Terrasoft.BaseViewModel", {
							values: {
								Id: typeUId,
								Caption: editPage.caption,
								Click: {bindTo: "addRecord"},
								Tag: typeUId,
								SchemaName: editPage.cardSchema
							}
						}));
					}, this);
				}
				this.set("EditPages", collection);
			},

			/**
			 * Очищает значения колонок схемы, устанавливая null. Очищает параметр измененных значений.
			 * @protected
			 * @virtual
			 */
			clearEntity: function() {
				Terrasoft.each(this.columns, function(column, columnName) {
					if ((column.type === Terrasoft.ViewModelColumnType.ENTITY_COLUMN) && !column.isCollection) {
						this.setColumnValue(columnName, null, {preventValidation: true});
					}
				}, this);
				this.changedValues = {};
			},

			/**
			 * Инициализурует колонку схемы, отвечающую за хранение название колонки типа.
			 * @protected
			 * @virtual
			 */
			initTypeColumnName: function() {
				var typeColumnName = null;
				var entityStructure = this.getEntityStructure(this.entitySchemaName);
				if (entityStructure) {
					Terrasoft.each(entityStructure.pages, function(editPage) {
						if (editPage.typeColumnName) {
							typeColumnName = editPage.typeColumnName;
						}
						return false;
					}, this);
				}
				this.set("TypeColumnName", typeColumnName);
			},

			/**
			 * Получает название страницы редактирования сущности.
			 * @param {String} typeUId Значение колонки типа.
			 * @return {String} Возвращает название страницы редактирования сущности.
			 */
			getEditPageSchemaName: function(typeUId) {
				var editPages = this.get("EditPages");
				if (editPages.contains(typeUId)) {
					var editPage = editPages.get(typeUId);
					return editPage.get("SchemaName");
				}
			},

			/**
			 * Метод возвращает объект по его имени.
			 * @param {String} entitySchemaName Имя объекта.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова функции обратного вызова.
			 */
			getEntitySchemaByName: function(entitySchemaName, callback, scope) {
				scope = scope || this;
				this.sandbox.requireModuleDescriptors(["force!" + entitySchemaName], function() {
					Terrasoft.require([entitySchemaName], callback, scope);
				}, scope);
			},

			/**
			 * Расширяет конфигурацию сообщений модуля, сообщениями описанными в схеме.
			 * @protected
			 */
			registerMessages: function() {
				this.sandbox.registerMessages(this.messages);
			},

			/**
			 * Открывает справочник в модальном окне.
			 * @protected
			 * @param {Object} config Конфигурация справочника.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			openLookup: function(config, callback, scope) {
				LookupUtilities.Open(this.sandbox, config, callback, scope || this, null, false, false);
			},

			/**
			 * Возвращает значение типа.
			 */
			getTypeColumnValue: function(row) {
				var typeColumnValue = this.Terrasoft.GUID_EMPTY;
				var typeColumnName = this.get("TypeColumnName");
				if (typeColumnName) {
					typeColumnValue = (row.get(typeColumnName) && row.get(typeColumnName).value);
				}
				return typeColumnValue;
			},

			/**
			 * Метод вызывает метод веб сервиса с указанными параметрами.
			 * @param {Object} config обьект, который содержит название сервиса, название метода, данные.
			 * @param {Function} callback
			 * @param {Object} scope
			 * @returns {Object} обьект запроса.
			 */
			callService: function(config, callback, scope) {
				var dataSend = config.data || {};
				var jsonData = (config.encodeData === false) ? dataSend : Ext.encode(dataSend);
				var requestUrl = this.Terrasoft.combinePath(this.Terrasoft.workspaceBaseUrl, "rest", config.serviceName,
					config.methodName);
				return this.Terrasoft.AjaxProvider.request({
					url: requestUrl,
					headers: {
						"Accept": "application/json",
						"Content-Type": "application/json"
					},
					method: "POST",
					jsonData: jsonData,
					callback: function() {
						var success = arguments[1];
						var response = arguments[2];
						var responseObject = success ? Terrasoft.decode(response.responseText) : {};
						callback.call(this, responseObject);
					},
					scope: scope || this
				});
			},

			/**
			 * Получает конфигурацию иконки кнопки "Закрыть".
			 * @return {Object} Возвращает конфигурацию иконки кнопки "Закрыть".
			 */
			getCloseButtonImageConfig: function() {
				return this.getResourceImageConfig("Resources.Images.CloseButtonImage");
			},

			/**
			 * Получает конфигурацию иконки кнопки "Назад".
			 * @return {Object} Возвращает конфигурацию иконки кнопки "Назад".
			 */
			getBackButtonImageConfig: function() {
				return this.getResourceImageConfig("Resources.Images.BackButtonImage");
			},

			/**
			 * Получает конфигурацию иконки кнопки "Настройки" в выбранной строке реестра.
			 * @return {Object} Возвращает конфигурацию иконки кнопки "Настройки" в выбранной строке реестра.
			 */
			getActiveRowSettingsButtonImageConfig: function() {
				return this.getResourceImageConfig("Resources.Images.SettingsButtonImage");
			},

			/**
			 * Генерирует конфигурацию ссылки на изображение в ресурсах.
			 * @param {String} resourceName Имя ресурса.
			 * @return {Object} Возвращает конфигурацию ссылки на изображение в ресурсах.
			 */
			getResourceImageConfig: function(resourceName) {
				return {
					source: this.Terrasoft.ImageSources.URL,
					url: this.Terrasoft.ImageUrlBuilder.getUrl(this.get(resourceName))
				};
			},

			/**
			 * Добавляет подзапрос, который вычисляет количество активных точек входа по процессу.
			 * @param {Object} esq
			 */
			addProcessEntryPointColumn: function(esq) {
				var expressionConfig = {
					columnPath: "[EntryPoint:EntityId].Id",
					parentCollection: this,
					aggregationType: Terrasoft.AggregationType.COUNT
				};
				var column = Ext.create("Terrasoft.SubQueryExpression", expressionConfig);
				var filter = esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "IsActive", true);
				column.subFilters.addItem(filter);
				var esqColumn = esq.addColumn("EntryPointsCount");
				esqColumn.expression = column;
			},

			/**
			 * Метод запуска мастера раздела.
			 */
			startSectionDesigner: function() {
				var location = window.location;
				var origin = location.origin || location.protocol + "//" + location.host;
				var url = Ext.String.format("{0}{1}#SectionDesigner", origin, location.pathname);
				var schemaName = this.name;
				Terrasoft.each(Terrasoft.configuration.ModuleStructure, function(structure, sectionCode) {
					if (structure.sectionSchema === schemaName) {
						url += "/" + sectionCode;
						var historyStateInfo = this.getHistoryStateInfo();
						var schemas = historyStateInfo.schemas;
						var cardPage = (historyStateInfo.module === "CardModuleV2") ? schemas[0] : schemas[1];
						if (cardPage) {
							url += "/Page/" + cardPage;
						}
						return false;
					} else if (structure.pages) {
						var length = structure.pages.length;
						for (var i = 0; i < length; i++) {
							var page = structure.pages[i];
							if (page.cardSchema === schemaName) {
								url += "/" + sectionCode + "/Page/" + schemaName;
								return false;
							}
						}
					} else if (structure.cardSchema === schemaName) {
						url += "/" + sectionCode + "/Page/" + schemaName;
						return false;
					}
				}, this);
				require(["SectionDesignerUtils"], function(module) {
					module.start(url);
				});
			},

			/**
			 * @obsolete
			 */
			getActionsMenuItem: function(config) {
				var message = this.Ext.String.format(this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
					"getActionsMenuItem", "getButtonMenuItem");
				var schemaName = this.name;
				if (schemaName) {
					message = schemaName + ": " + message;
				}
				this.log(message, this.Terrasoft.LogMessageType.WARNING);
				return this.getButtonMenuItem(config);
			},

			/**
			 * Создает экземпляр элмента выпадающего меню кнопки.
			 * @param {Object} config Конфигурация.
			 * @return {Terrasoft.BaseViewModel} Возвращает экземпляр элмента выпадающего меню кнопки.
			 */
			getButtonMenuItem: function(config) {
				return this.Ext.create("Terrasoft.BaseViewModel", {
					values: this.Ext.apply({}, config, {
						Id: this.Terrasoft.generateGUID(),
						Caption: "",
						Click: (config.Type === "Terrasoft.MenuSeparator") ? null : {bindTo: this.actionsClickMethodName},
						MarkerValue: config.Caption
					})
				});
			},

			/**
			 * Создает экземпляр разделителя выпадающего меню кнопки.
			 * @param {Object} [config] Конфигурация.
			 * @return {Terrasoft.BaseViewModel} Возвращает экземпляр разделителя выпадающего меню кнопки.
			 */
			getButtonMenuSeparator: function(config) {
				return this.Ext.create("Terrasoft.BaseViewModel", {
					values: this.Ext.apply({}, config, {
						Id: this.Terrasoft.generateGUID(),
						Caption: "",
						Type: "Terrasoft.MenuSeparator"
					})
				});
			},

			/**
			 * Обрабатывает сворачивание или разворачивание детали.
			 * @protected
			 * @virtual
			 * @param {Boolean} isCollapsed Значение свернутости детали.
			 * @param {String} controlId Идентификатор элемента управления, в который загружена деталь.
			 */
			onCollapsedChanged: function(isCollapsed, controlId) {
				var profile = this.getProfile();
				var profileKey = this.getProfileKey();
				if (this.Terrasoft.isEmptyObject(profile)) {
					profile = {key: profileKey};
					this.set("Profile", profile);
				}
				var profileControlGroups = profile.controlGroups = profile.controlGroups || {};
				profileControlGroups[controlId] = {isCollapsed: isCollapsed};
				this.Terrasoft.utils.saveUserProfile(profileKey, profile, false);
			},

			/**
			 * Возвращает профиль текущей схемы.
			 * @return {Object} Профиль текущей схемы.
			 */
			getProfile: function() {
				var profileColumnName = this.getProfileColumnName();
				return this.get(profileColumnName);
			},

			/**
			 * Возвращает название колонки, в которой хранится профиль текущей схемы.
			 * @return {Object} Название колонки, в которой хранится профиль текущей схемы.
			 */
			getProfileColumnName: function() {
				return "Profile";
			},

			/**
			 * Возвращает обратное пришедшему значение. Используется для конвертера в привязках на значение.
			 * @param {boolean} value Значение.
			 * @return {boolean} Обратное значение.
			 */
			invertBooleanValue: function(value) {
				return !value;
			},

			/**
			 * Обработчик нажатия на заголовок логической колонки.
			 * @protected
			 * @virtual
			 */
			invertColumnValue: function(columnName) {
				if (columnName) {
					var currentValue = this.get(columnName);
					this.set(columnName, !currentValue);
				}
			},

			/**
			 * Событие фокусировки элемента редактирования.
			 * @protected
			 * @virtual
			 */
			onItemFocused: Terrasoft.emptyFn,

			/**
			 *
			 */
			onRender: Terrasoft.emptyFn,

			/**
			 * Очищает все подписки на сообщения.
			 * @inheritdoc Terrasoft.core.BaseObject#destroy
			 * @overridden
			 */
			destroy: function() {
				if (this.messages) {
					var messages = this.Terrasoft.keys(this.messages);
					this.sandbox.unRegisterMessages(messages);
				}
				this.callParent(arguments);
			},

			/**
			 * Возвращает структуру раздела.
			 * @protected
			 * @param {String} moduleName Название объекта.
			 * @return {Object} Структура раздела.
			 */
			getModuleStructure: function(moduleName) {
				return moduleUtils.getModuleStructureByName(moduleName || this.entitySchemaName);
			},

			/**
			 * Возвращает информации о схеме объекта данных для текущей сущности.
			 * @protected
			 * @param {String} entitySchemaName Название схемы объекта.
			 * @return {Object} Информация о схеме объета данных.
			 */
			getEntityStructure: function(entitySchemaName) {
				return moduleUtils.getEntityStructureByName(entitySchemaName || this.entitySchemaName);
			},

			/**
			 * Получает значение гиперссылки.
			 * @protected
			 * @param {String} columnName Название колонки.
			 */
			getLinkUrl: function(columnName) {
				var column = this.columns[columnName];
				var columnValue = this.get(columnName);
				if (!column) {
					return {};
				}
				var referenceSchemaName = column.referenceSchemaName;
				var entitySchemaConfig = this.getModuleStructure(referenceSchemaName);
				if (columnValue && entitySchemaConfig) {
					var typeAttr = NetworkUtilities.getTypeColumn(referenceSchemaName);
					var typeUId;
					if (typeAttr && columnValue[typeAttr.path]) {
						typeUId = columnValue[typeAttr.path].value;
					}
					var url = NetworkUtilities.getEntityUrl(referenceSchemaName, columnValue.value, typeUId);
					return {
						url: "ViewModule.aspx#" + url,
						caption: columnValue.displayValue
					};
				}
				return {};
			},

			/**
			 * Получает название карточки редактирования сущности.
			 * @param {String} entitySchemaName Название схемы сущности.
			 * @param {String} columnName Название колонки.
			 * @return {String} Название карточки редактирования сущности.
			 */
			getCardSchemaName: function(entitySchemaName, columnName) {
				var entitySchemaConfig = this.getModuleStructure(entitySchemaName);
				var cardSchema = entitySchemaConfig.cardSchema;
				if (entitySchemaConfig.attribute) {
					var typeId = this.get(columnName + "." + entitySchemaConfig.attribute) ||
						this.get(entitySchemaConfig.attribute);
					Terrasoft.each(entitySchemaConfig.pages, function(item) {
						if (typeId && item.UId === typeId.value && item.cardSchema) {
							cardSchema = item.cardSchema;
						}
					}, this);
				}
				return cardSchema;
			},

			/**
			 * Обрабатывает нажатие на ссылку в элементе управления.
			 * @param {String} url Гиперссылка.
			 * @param {String} columnName Название колонки.
			 * @return {Boolean} Признак, отменять или нет DOM обработчик нажатия на ссылку.
			 */
			onLinkClick: function(url, columnName) {
				var column = this.columns[columnName];
				var columnValue = this.get(columnName);
				if (!column) {
					return true;
				}
				var entitySchemaName = column.referenceSchemaName;
				var cardSchema = this.getCardSchemaName(entitySchemaName, columnName);
				var config = {
					schemaName: cardSchema,
					id: columnValue.value,
					operation: ConfigurationEnums.CardStateV2.EDIT,
					renderTo: "centerPanel",
					isLinkClick: true
				};
				this.openCardInChain(config);
				return false;
			},

			/**
			 * Обрабатывает изменение значение в LookupEdit.
			 * @protected
			 * @virtual
			 */
			onLookupChange: Terrasoft.emptyFn,

			/**
			 * Выполняет открытие карточки в цепочке.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация открываемой карточки.
			 */
			openCardInChain: function(config) {
				this.showBodyMask();
				var historyState = this.sandbox.publish("GetHistoryState");
				var stateObj = config.stateObj || {
					isSeparateMode: config.isSeparateMode || true,
					schemaName: config.schemaName,
					entitySchemaName: config.entitySchemaName,
					operation: config.action || config.operation,
					primaryColumnValue: config.id,
					valuePairs: config.defaultValues,
					isInChain: true
				};
				this.sandbox.publish("PushHistoryState", {
					hash: historyState.hash.historyState,
					silent: config.silent,
					stateObj: stateObj
				});
				var moduleName = config.moduleName || "CardModuleV2";
				var moduleParams = {
					renderTo: config.renderTo || this.renderTo,
					id: config.moduleId,
					keepAlive: (config.keepAlive !== false)
				};
				var instanceConfig = config.instanceConfig;
				if (instanceConfig) {
					this.Ext.apply(moduleParams, {
						instanceConfig: instanceConfig
					});
				}
				this.sandbox.loadModule(moduleName, moduleParams);
			},

			/**
			 * Загружает модуль.
			 * @param {Object} config Объект с свойствами для установки.
			 * @param {String} config.moduleName Имя загружаемого модуля.
			 * @param {String} config.containerId Контейнер, куда будет загружаться модуль.
			 */
			loadModule: function(config) {
				if (Ext.isEmpty(config.moduleName) || Ext.isEmpty(config.containerId)) {
					return;
				}
				var moduleId = this.getModuleId(config.moduleName);
				var moduleConfig = {
					renderTo: config.containerId
				};
				if (!Ext.isEmpty(moduleId)) {
					moduleConfig.id = moduleId;
				}
				this.sandbox.loadModule(config.moduleName, moduleConfig);
			},

			/**
			 * Возвращает Id модуля.
			 * @virtual
			 * @param {String} moduleName Имя модуля.
			 * @return {string} Id модуля.
			 */
			getModuleId: function() {
				return "";
			}
		});

		return Terrasoft.BaseSchemaViewModel;

	});
