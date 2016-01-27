define("EmailItemSchema", ["EmailItemSchemaResources", "NetworkUtilities", "FormatUtils",
		"EmailConstants", "ConfigurationEnums", "ConfigurationConstants", "ProcessModuleUtilities", "RightUtilities",
		"BusinessRuleModule", "LookupQuickAddMixin"],
	function(resources, NetworkUtilities, FormatUtils, EmailConstants, ConfigurationEnums,
             ConfigurationConstants, ProcessModuleUtilities, RightUtilities, BusinessRuleModule) {
		return {
			entitySchemaName: EmailConstants.entitySchemaName,
			mixins: {
				/**
				 * @class LookupQuickAddMixin реализующий методы добавления новой записи из справочного поля.
				 */
				LookupQuickAddMixin: "Terrasoft.LookupQuickAddMixin"
			},
			messages: {

				/**
				 * @message PushHistoryState
				 * Сообщение изменения в цепочке состояний.
				 */
				"PushHistoryState": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetHistoryState
				 * Сообщение запрашивает текущее состояние истории.
				 */
				"GetHistoryState": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message BackHistoryState
				 * Сообщение, вызываемое при возвращении на предыдущее состояние истории.
				 */
				"BackHistoryState": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message ReloadCard
				 * Вызывает перезагрузку данных на карточке.
				 */
				"ReloadCard": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			attributes: {
				/**
				 * Заголовок почтового сообщения.
				 * @type {String}
				 */
				MailTitleText: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					value: ""
				},

				/**
				 * Регулярное выражение для получения имени и почтового адреса отправителя письма.
				 * @type {String}
				 */
				SenderInfoRegExp: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					value: "(.+)<(.+)>"
				},

				/**
				 * Коллекция пунктов меню кнопки действий.
				 * @Type {Terrasoft.BaseViewModelCollection}
				 */
				ActionsMenuCollection: {
					dataValueType: this.Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Список доступных для запуска процессов.
				 * @Type {Array}
				 */
				ProcessParametersArray: {
					dataValueType: this.Terrasoft.DataValueType.CUSTOM_OBJECT
				},

				/**
				 * Список колонок связей письма.
				 * @Type {Array}
				 */
				EntityConnectionColumnList: {
					dataValueType: this.Terrasoft.DataValueType.CUSTOM_OBJECT
				},

				/**
				 * Список колонок связей письма по умолчанию.
				 * @Type {Array}
				 */
				DefaultEntityConnectionColumns: {
					dataValueType: this.Terrasoft.DataValueType.CUSTOM_OBJECT
				},

				/**
				 * Признак видимости справочного поля.
				 */
				IsLookupVisible: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					"value": false
				},

				/**
				 * Наименование текущей колонки связи.
				 */
				CurrentColumnName: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					value: ""
				},

				/**
				 * Значение в текущей колонки связи.
				 */
				CurrentColumnValue: {
					dataValueType: Terrasoft.DataValueType.VIRTUAL_COLUMN,
					isLookup: true
				},

				/**
				 * Список возможных значений для редактируемого поля связи.
				 */
				"CurrentRelationItemsList": {
					dataValueType: Terrasoft.DataValueType.COLLECTION,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isCollection: true
				},

				/**
				 * Количество отображаемых значений для редактируемого поля связи.
				 */
				"CurrentRelationRowCount": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					value: 5
				},

				/**
				 * Контакт, указанный как отправитель письма.
				 */
				"SenderContact": {
					dataValueType: Terrasoft.DataValueType.LOOKUP
				},

				/**
				 * Признак, проинициализированна ли сущность.
				 */
				"IsEntityInitialized": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					value: true
				},

				/**
				 * Признак отображения поля добавления новой связи.
				 */
				"IsAddNewRelationVisible": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					value: true
				},

				/**
				 * Имя отправителяю
				 */
				"SenderName": {
					dataValueType: Terrasoft.DataValueType.TEXT
				},

				/**
				 * Адрес отправителя.
				 */
				"SenderEmail": {
					dataValueType: Terrasoft.DataValueType.TEXT
				},

				/**
				 * Признак наличия контакта отправителя.
				 */
				"HasContact": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN
				}
			},
			methods: {

				/**
				 * Инициализирует начальные значения.
				 * @protected
				 * @overridden
				 */
				init: function() {
					this.initParameters();
					this.initActionsMenuCollection();
					this.initSenderInfo();
					this.subscribeSandboxEvents();
					this.isNew = false;
					this.addEvents(
						/**
						 * @event
						 * Событие удаления письма.
						 * @param {Object} viewModel Модель представления письма.
						 */
						"emailDeleted",

						/**
						 * @event
						 * Событие сохранения письма.
						 * @param {Object} viewModel Модель представления письма.
						 */
						"entitySaved"
					);
					this.callParent(arguments);
				},

				/**
				 * Подписывает модель письма на сообщения sandbox.
				 */
				subscribeSandboxEvents: function() {
					this.sandbox.subscribe("BackHistoryState", this.onBackHistoryState, this);
				},

				/**
				 * Очищает поле новой связи письма, если карточка новой записи была закрыта кнопкой отмена.
				 */
				onBackHistoryState: function() {
					var isCardOpened = this.get("IsCardOpened");
					if (isCardOpened) {
						this.set("CurrentColumnValue", null);
						this.set("IsCardOpened", false);
					}
				},

				/**
				 * @inheritdoc Terrasoft.LookupQuickAddMixin#openPageForNewEntity
				 * @overriden
				 */
				openPageForNewEntity: function(columnName, displayColumnName, displayColumnValue) {
					var isCardOpened = this.get("IsCardOpened");
					var historyState = this.sandbox.publish("GetHistoryState");
					var state = historyState.state || {};
					var moduleId = state.moduleId;
					if (isCardOpened || moduleId.indexOf(columnName) > 0) {
						var defValues = [{
							name: displayColumnName,
							value: displayColumnValue
						}];
						this.sandbox.publish("ReloadCard", defValues);
					} else {
						this.set("IsCardOpened", true);
						this.mixins.LookupQuickAddMixin.openPageForNewEntity.apply(this, arguments);
					}
				},

				/**
				 * Инициализация начальных параметров.
				 */
				initParameters: function() {
					this.set("MailTitleText", this.getMailTitleText());
					this.set("MailDateText", this.getMailDate());
					this.initDefaultColumnName();
				},

				/**
				 * Очищает значение связи по имени колонки.
				 * @param {String} columnName Наименование колонки.
				 */
				clearColumn: function(columnName) {
					this.initDefaultColumnName();
					this.set(columnName, null);
					this.onSaveEntity();
				},

				/**
				 * Инициализация наименования колонки по умолчанию.
				 */
				initDefaultColumnName: function() {
					var connectionColumnList = this.get("EntityConnectionColumnList");
					var length = connectionColumnList.length;
					this.setIsAddNewRelationVisible();
					for (var i = 0; i < length; i++) {
						var columnName = connectionColumnList[i];
						if (!this.isColumnFilled(columnName)) {
							this.set("CurrentColumnName", columnName);
							return;
						}
					}
				},

				/**
				 * Формирует коллекцию пунктов меню кнопки действий.
				 */
				initActionsMenuCollection: function() {
					var collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
					var deleteCaption = this.get("Resources.Strings.Delete");
					var deleteItem = this.Ext.create("Terrasoft.BaseViewModel", {
						values: {
							"Caption": deleteCaption,
							"Click": {bindTo: "onDeleteEmail"},
							"MarkerValue": deleteCaption
						}
					});
					collection.addItem(deleteItem);
					var processParams = this.get("ProcessParametersArray");
					if (!this.Ext.isEmpty(processParams)) {
						var separator = this.Ext.create("Terrasoft.BaseViewModel", {
							values: {
								"Type": "Terrasoft.MenuSeparator",
								"Caption": this.get("Resources.Strings.RunProcessMenuSeparator"),
								"MarkerValue": "RunProcess"
							}
						});
						collection.addItem(separator);
						this.Terrasoft.each(processParams, function(processParam) {
							var item = this.Ext.create("Terrasoft.BaseViewModel", {
								values: processParam
							});
							collection.addItem(item);
						}, this);
					}
					this.set("ActionsMenuCollection", collection);
				},

				/**
				 * Получает маркер значение для колонки связи.
				 * @return {String} markerStr Маркерное значение.
				 * @param {String} columnName Строка с html тегами.
				 */
				getEditContainerMarkerValue: function(columnName) {
					var currentColumnName = columnName || this.get("CurrentColumnName");
					if (Ext.isEmpty(currentColumnName)) {
						return;
					}
					var column = this.entitySchema.getColumnByName(currentColumnName);
					var markerStr = this.Ext.String.format("{0} {1}", column.name, column.caption);
					return markerStr;
				},

				/**
				 * Проверяет заполнение значения для колонки связи.
				 * @protected
				 * @param {Object} value Значение колонки связи.
				 * @return {Boolean} Возвращает признак заполнено ли значение для колонки связи.
				 */
				isEmptyColumnValue: function(value) {
					return this.Ext.isEmpty(value);
				},

				/**
				 * Обработчик пункта меню удалить.
				 */
				onDeleteEmail: function() {
					var recordId = this.get("Id");
					var config = {
						schemaName: this.entitySchema.name,
						primaryColumnValue: recordId
					};
					RightUtilities.checkCanDelete(config, this.onCheckCanDeleteResponse, this);
				},

				/**
				 * Обрабатывает результат проверки возможности удаления выбранных записей.
				 * @param {String} rightsErrorMessage Ответ сервера.
				 */
				onCheckCanDeleteResponse: function(rightsErrorMessage) {
					if (rightsErrorMessage) {
						var message = this.get("Resources.Strings." + rightsErrorMessage);
						message = message || rightsErrorMessage;
						this.showInformationDialog(message);
						return;
					}
					this.showConfirmationDialog(this.get("Resources.Strings.DeleteConfirmationMessage"),
						function(returnCode) {
							this.onDelete(returnCode);
						},
						[this.Terrasoft.MessageBoxButtons.YES.returnCode,
							this.Terrasoft.MessageBoxButtons.NO.returnCode]);
				},

				/**
				 * Обрабатывает ответ пользователя о необходимости удаления данных.
				 * @param {String} returnCode Код выбранного варианта.
				 */
				onDelete: function(returnCode) {
					if (returnCode !== this.Terrasoft.MessageBoxButtons.YES.returnCode) {
						return;
					}
					this.showBodyMask({
						selector: ".right-panel-modules-container",
						timeout: 0
					});
					this.callService({
						serviceName: "GridUtilitiesService",
						methodName: "DeleteRecords",
						data: {
							primaryColumnValues: [this.get("Id")],
							rootSchema: this.entitySchema.name
						}
					}, function(responseObject) {
						var result = this.Ext.decode(responseObject.DeleteRecordsResult);
						var success = result.Success;
						this.removeEmailFromPanel();
						this.hideBodyMask();
						if (!success) {
							this.showDeleteExceptionMessage(result);
						}
					}, this);
				},

				/**
				 * Генерирует событие удаления элемента из правой панели.
				 */
				removeEmailFromPanel: function() {
					this.fireEvent("emailDeleted", this);
				},

				/**
				 * Показывает сообщение об ошибке, произошедшей во время удаления.
				 * @protected
				 * @param {Object} result Ответ сервера
				 */
				showDeleteExceptionMessage: function(result) {
					var message = "";
					if (result.IsDbOperationException) {
						message = this.get("Resources.Strings.DependencyWarningMessage");
					} else if (result.IsSecurityException) {
						message = this.get("Resources.Strings.RightLevelWarningMessage");
					} else {
						message = result.ExceptionMessage;
					}
					this.showInformationDialog(message);
				},

				/**
				 * Формирует имя отправителя почтового сообщения.
				 * @return {String} Имя отправителя почтового сообщения.
				 */
				getSenderName: function() {
					var author = this.get("Author");
					var senderInfoRegExp = this.get("SenderInfoRegExp");
					var senderContact = this.get("SenderContact");
					var sender = this.get("Sender");
					if (!this.Ext.isEmpty(senderContact)) {
						return senderContact.displayValue;
					}
					if (this.Ext.isEmpty(sender)) {
						sender = author ? author.displayValue : "";
						return sender;
					}
					var regExp = new RegExp(senderInfoRegExp);
					var senderInfo = sender.match(regExp);
					var senderName = senderInfo ? senderInfo[1] : "";
					if (senderInfo && senderName) {
						return senderName;
					}
					return "";
				},

				/**
				 * Формирует email адрес отправителя почтового сообщения.
				 * @return {String} Email адрес отправителя почтового сообщения.
				 */
				getSenderEmail: function() {
					var sender = this.get("Sender");
					var senderInfoRegExp = this.get("SenderInfoRegExp");
					var regExp = new RegExp(senderInfoRegExp);
					var senderInfo = sender.match(regExp);
					var senderEmail = senderInfo ? senderInfo[2] : "";
					if (senderInfo && senderEmail) {
						return senderEmail;
					}
					return sender;
				},

				/**
				 * Открывает страницу контакта.
				 */
				openContactPage: function() {
					var messageType = this.get("MessageType");
					var contact = null;
					var primaryColumn;
					var history = this.sandbox.publish("GetHistoryState");
					if (!this.Ext.isEmpty(history.state)) {
						primaryColumn = history.state.primaryColumnValue;
					}
					if (messageType.value === ConfigurationConstants.Activity.MessageType.Incoming) {
						contact = this.get("SenderContact");
						if (this.Ext.isEmpty(contact)) {
							return;
						}
					} else {
						contact = this.get("Author");
					}
					var contactId = contact.value;
					if (primaryColumn !== contactId) {
						RightUtilities.checkCanReadRecords({
							schemaName: "Contact",
							primaryColumnValues: [contactId]
						}, this.onCheckContactReadRightsResponse, this);
					}
					return false;
				},

				/**
				 * Обрабатывает результат запроса прав на чтение контакта.
				 * @param {Array} result Результат запроса прав.
				 */
				onCheckContactReadRightsResponse: function(result) {
					var response = this.Ext.isEmpty(result) ? false : result[0];
					if (response && response.Value) {
						this.onUrlClick("Contact", response.Key);
					} else {
						var message = this.get("Resources.Strings.ReadRightLevelWarningMessage");
						this.showInformationDialog(message);
					}
				},

				/**
				 * Формирует тему почтового сообщения.
				 * @return {String} Текст темы почтового сообщения.
				 */
				getMailTitleText: function() {
					var title = this.get("Title");
					return title ? title : "";
				},

				/**
				 * Формирует текст почтового сообщения.
				 * @return {String} Текст почтового сообщения.
				 */
				getMailBody: function() {
					var numberBodySymbols = EmailConstants.NumberBodySymbols;
					var body = this.get("Body");
					var textMail = "";
					if (!Ext.isEmpty(body)) {
						textMail = this.removeHtmlTags(body);
					}
					if (textMail.length > numberBodySymbols) {
						textMail = textMail.substr(0, numberBodySymbols - 1);
					}
					return textMail;
				},

				/**
				 * Обработчик клика на заголовок письма.
				 */
				onTitleClick: function() {
					var type = this.get("Type");
					var typeid = type ? type.value : null;
					this.onUrlClick(EmailConstants.entitySchemaName, this.get("Id"), typeid);
				},

				/**
				 * Обработчик клика на label-гиперссылку.
				 */
				onUrlClick: function(entitySchemaName, primaryColumnValue, typeColumnValue) {
					var historyState = this.sandbox.publish("GetHistoryState");
					var config = {
						sandbox: this.sandbox,
						entitySchemaName: entitySchemaName,
						primaryColumnValue: primaryColumnValue,
						operation: ConfigurationEnums.CardStateV2.EDIT,
						historyState: historyState,
						typeId: typeColumnValue,
						moduleId: this.sandbox.id + "_CardModuleV2_" + primaryColumnValue
					};
					NetworkUtilities.openCardInChain(config);
				},

				/**
				 * Изменение параметров модели для работы справочного поля.
				 * @private
				 */
				onLookupParametersChange: function(columnName) {
					var currentColumnName = this.get("CurrentColumnName");
					if (currentColumnName !== columnName) {
						this.set("CurrentColumnName", null);
						this.set("CurrentColumnValue", null);
						this.set("CurrentColumnName", columnName);
						this.set("IsCardOpened", false);
					}
				},

				/**
				 * Получает значение связи.
				 * @private
				 * @param {String} columnName Наименование колонки связи.
				 * @return {Object} Значение связи.
				 */
				getColumnValue: function(columnName) {
					var currentLookupValue = this.get(columnName);
					return currentLookupValue;
				},

				/**
				 * Удаляет html теги из строки.
				 * @private
				 * @param {String} value Строка с html тегами.
				 * @return {String} Строка без html тегов.
				 */
				removeHtmlTags: function(value) {
					var RegexItem = this.regexItem;
					var regexArray = this.getRegexArray(RegexItem);
					this.Terrasoft.each(regexArray, function(item) {
						value = value.replace(item.regex, item.replace);
					}, this);
					return value;
				},

				/**
				 * Функция конструктор для обьекта регулярного выражения.
				 * @private
				 * @param {Object} regex Регулярное выражение.
				 * @param {String} replace Строка на которую заменить результат выборки по регулярному выражению.
				 */
				regexItem: function(regex, replace) {
					this.regex = regex;
					this.replace = replace;
				},

				/**
				 * Формирует массив регулярных выражений.
				 * @private
				 * @param {Object} RegexItem Функция конструктор для обьекта регулярного выражения .
				 * @return {Array} regexArray Массив обьектов регулярных выражений.
				 */
				getRegexArray: function(RegexItem) {
					var regexArray = [];
					//jscs:disable
					/*jshint quotmark: false */
					regexArray.push(new RegexItem(/<!--[\s\S]*?-->/g, ""), new RegexItem(/\t/gi, ""),
						new RegexItem(/>\s+</gi, "><"));
					/*jshint quotmark: true */
					//jscs:enable
					if (this.Ext.isWebKit) {
						regexArray.push(new RegexItem(/<div>(<div>)+/gi, "<div>"),
							new RegexItem(/<\/div>(<\/div>)+/gi, "<\/div>"));
					}
					//jscs:disable
					/*jshint quotmark:false */
					regexArray.push(new RegexItem(/<style>(.+?)<\/style>/gi, ""),
						new RegexItem(/<div>\n/gi, ""), new RegexItem(/<div><br[\s\/]*>/gi, ""),
						new RegexItem(/<p>\n/gi, ""), new RegexItem(/<div>\n <\/div>/gi, "\n"),
						new RegexItem(/<br[\s\/]*>\n?|<\/p>|<\/div>/gi, "\n"), new RegexItem(/<[^>]+>|<\/\w+>/gi, ""),
						new RegexItem(/ /gi, " "), new RegexItem(/&/gi, "&"), new RegexItem(/•/gi, " * "),
						new RegexItem(/–/gi, "-"), new RegexItem(/"/gi, "\""), new RegexItem(/«/gi, "\""),
						new RegexItem(/»/gi, "\""), new RegexItem(/‹/gi, "<"), new RegexItem(/›/gi, ">"),
						new RegexItem(/™/gi, "(tm)"), new RegexItem(/</gi, "<"), new RegexItem(/>/gi, ">"),
						new RegexItem(/©/gi, "(c)"), new RegexItem(/®/gi, "(r)"), new RegexItem(/\n*$/, ""),
						new RegexItem(/&nbsp;/g, " "), new RegexItem(/(\n)( )+/, "\n"), new RegexItem(/(\n)+$/, ""),
						new RegexItem(/&quot;/gi, "\""), new RegexItem(/&rdquo;/gi, "\""), new RegexItem(/&amp;/gi, "&"),
						new RegexItem(/&rsquo;/gi, "\'"), new RegexItem(/&lt;/gi, "<"), new RegexItem(/&raquo;/gi, "»"),
						new RegexItem(/&gt;/gi, ">"), new RegexItem(/&#8220;/gi, "\""), new RegexItem(/&#43;/gi, "+"));
					/*jshint quotmark:true */
					//jscs:enable
					return regexArray;
				},

				/**
				 * Формирует ссылку на аватар автора почтового сообщения.
				 * @return {String} Ссылка на аватар автора почтового сообщения.
				 */
				getAuthorImageSrc: function() {
					var messageType = this.get("MessageType");
					var contact = null;
					if (messageType.value === ConfigurationConstants.Activity.MessageType.Incoming) {
						contact = this.get("SenderContact");
						if (this.Ext.isEmpty(contact)) {
							return "";
						}
					} else {
						contact = this.get("Author");
					}
					if (this.Ext.isEmpty(contact) || this.Ext.isEmpty(contact.primaryImageValue) ||
						this.Terrasoft.isEmptyGUID(contact.primaryImageValue)) {
						return "";
					}
					return this.getImageSrc(contact.primaryImageValue);
				},

				/**
				 * Проверяет на наличие аватара автора письма.
				 * @return {Boolean} признак для отображения аватара автора письма.
				 */
				isAuthorImageUrlExist: function() {
					var authorImageUrl = this.getAuthorImageSrc();
					if (this.Ext.isEmpty(authorImageUrl)) {
						return false;
					}
					return true;
				},

				/**
				 * Формирует ссылку на изображение по идентификатору изображения.
				 * @param {String} imageId Идентификатор изображения.
				 * @private
				 * @return {String} Ссылка на изображение.
				 */
				getImageSrc: function(imageId) {
					return this.Terrasoft.ImageUrlBuilder.getUrl({
						source: this.Terrasoft.ImageSources.ENTITY_COLUMN,
						params: {
							schemaName: "SysImage",
							columnName: "Data",
							primaryColumnValue: imageId
						}
					});
				},

				/**
				 * Формирует выводимую дату для письма.
				 * @return {String} Выводимая дата для письма.
				 */
				getMailDate: function() {
					var mailDate = this.get("SendDate");
					if (Ext.isEmpty(mailDate)) {
						mailDate = this.get("ModifiedOn");
					}
					var smartDate = null;
					var dateDiff = FormatUtils.dateDiffDays(mailDate, new Date());
					switch (dateDiff) {
						case 0:
							smartDate = Terrasoft.utils.getTypedStringValue(mailDate, Terrasoft.DataValueType.TIME);
							break;
						case 1:
							smartDate = this.get("Resources.Strings.Yesterday");
							break;
						default:
							smartDate = Terrasoft.utils.getTypedStringValue(mailDate, Terrasoft.DataValueType.DATE);
							break;
					}
					return smartDate;
				},

				/**
				 * Формирует параметры для запуска процесса.
				 * @param {Guid} processId Идентификатор процесса.
				 * @return {Object} Параметры для запуска процесса.
				 */
				getProcessExecuteConfig: function(processId) {
					var emailId = this.get("Id");
					var config = {
						sysProcessId: processId,
						parameters: {
							RecordId: emailId
						}
					};
					return config;
				},

				/**
				 * Запускает процесс.
				 * @param {Guid} processId Идентификатор процесса.
				 */
				runProcess: function(processId) {
					var config = this.getProcessExecuteConfig(processId);
					ProcessModuleUtilities.executeProcess(config);
				},

				/**
				 * Возвращает маркерное значение контейнера письма.
				 * @return {String} Маркерное значение контейнера письма.
				 */
				getEmailMarkerValue: function() {
					return this.get("MailTitleText");
				},

				/**
				 * Устанавливает и сохраняет значение признака на обработку.
				 */
				setIsNeedProcessFalse: function() {
					this.set("IsNeedProcess", false);
					this.onSaveEntity();
				},

				/**
				 * Сохраняет значение сущности.
				 */
				onSaveEntity: function() {
					this.showBodyMask({
						selector: ".right-panel-modules-container",
						timeout: 0
					});
					this.saveEntity(function(response) {
						this.hideBodyMask();
						if (response.success) {
							this.fireEvent("entitySaved", this);
							this.set("CurrentColumnValue", null);
						}
					}, this);
				},

				/**
				 * Формирует объект с параметрами иконки кнопки.
				 * @param {String} columnName Название колонки.
				 * @return {Object} Параметры иконки.
				 */
				getRelationButtonImageConfig: function(columnName) {
					var resourceName = columnName + "ExistIcon";
					var image = this.get("Resources.Images." + resourceName);
					if (this.Ext.isEmpty(image)) {
						image = this.get("Resources.Images.DefaultIcon");
					}
					return image;
				},

				/**
				 * Проверяет видимость кнопки связи для указанной колонки.
				 * @param {String} columnName Название колонки.
				 * @return {boolean} Видимость кнопки связи для указанной колонки.
				 */
				getEmailRelationButtonVisible: function(columnName) {
					var isVisible = false;
					var DefaultEntityConnectionColumns = this.get("DefaultEntityConnectionColumns");
					if (this.Ext.Array.contains(DefaultEntityConnectionColumns, columnName)) {
						isVisible = true;
					} else {
						isVisible = this.isColumnFilled(columnName);
					}
					return isVisible;
				},

				/**
				 * Возвращает признак существования связи для заданной колонки.
				 * @param {String} columnName Название колонки.
				 * @return {boolean} Признак существования связи для заданной колонки.
				 */
				isColumnFilled: function(columnName) {
					var value = this.get(columnName);
					return (!this.Ext.isEmpty(value));
				},

				/**
				 * Открывает страницу выбора из справочника или добавляет запись.
				 * @protected
				 * @param {Object} args Параметры.
				 */
				loadVocabulary: function(args, columnName) {
					var currentColumnName = this.get("CurrentColumnName");
					if (!this.Ext.isEmpty(columnName)) {
						currentColumnName = columnName;
					}
					var config = this.getLookupPageConfig(args, currentColumnName);
					this.openLookup(config, this.onLookupSelected, this);
				},

				/**
				 * Возвращает настройки страницы выбора из справочника.
				 * @protected
				 * @param {Object} args Параметры.
				 * @param {String} columnName Название колонки связи.
				 * @return {Object} Настройки страницы выбора из справочника.
				 */
				getLookupPageConfig: function(args, columnName) {
					var entitySchemaName = this.getLookupEntitySchemaName(args, columnName);
					var config = {
						entitySchemaName: entitySchemaName,
						multiSelect: false,
						columnName: columnName,
						columnValue: this.get(columnName),
						searchValue: args.searchValue,
						filters: this.getLookupQueryFilters(columnName)
					};
					this.Ext.apply(config, this.getLookupListConfig(columnName));
					return config;
				},

				/**
				 * Формирует список дополнительных колонок для выбора из справочника.
				 * @param {String} entitySchemaName Название схемы справочного поля.
				 * @return {Array} массив дополнительных колонок.
				 */
				getAdditionalColumns: function(entitySchemaName) {
					var secondLevelBindingsConfig = this.get("SecondLevelBindingsConfig");
					var entityColumsBinding = secondLevelBindingsConfig[entitySchemaName];
					var result = [];
					Terrasoft.each(entityColumsBinding, function(item) {
						if (result.indexOf(item.childColumn) === -1) {
							result.push(item.childColumn);
						}
					}, this);
					return result;
				},

				/**
				 * Возвращает название схемы объекта справочного поля.
				 * @protected
				 * @param {Object} args Параметры.
				 * @param {String} columnName Название колонки связи.
				 * @return {String} Название схемы справочного поля.
				 */
				getLookupEntitySchemaName: function(args, columnName) {
					var entityColumn = this.entitySchema.getColumnByName(columnName);
					return args.schemaName || entityColumn.referenceSchemaName;
				},

				/**
				 * Возвращает информацию о настройках справочной колонки связи.
				 * @private
				 * @param {String} columnName Название колонки связи.
				 * @return {Object|null} Информация о настройках справочной колонки связи.
				 */
				getLookupListConfig: function(columnName) {
					var schemaColumn = this.getColumnByName(columnName);
					if (!schemaColumn) {
						return null;
					}
					var lookupListConfig = schemaColumn.lookupListConfig;
					if (!lookupListConfig) {
						return null;
					}
					var excludedProperty = ["filters", "filter"];
					var config = {};
					this.Terrasoft.each(lookupListConfig, function(property, propertyName) {
						if (excludedProperty.indexOf(propertyName) === -1) {
							config[propertyName] = property;
						}
					});
					return config;
				},

				/**
				 * Обрабатывает нажатие на ссылку в элементе управления.
				 * @param {String} url Гиперссылка.
				 * @param {String} columnName Наименование колонки связи.
				 * @return {Boolean} Признак, отменять или нет DOM обработчик нажатия на ссылку.
				 */
				onLinkClick: function(url, columnName) {
					var currentColumnValue = this.getColumnValue(columnName);
					var currentColumnName = columnName;
					var column = this.columns[currentColumnName];
					if (this.Ext.isEmpty(column)) {
						return true;
					}
					var referenceSchemaName = column.referenceSchemaName;
					if (this.Ext.isEmpty(referenceSchemaName)) {
						return true;
					}
					var entityId = currentColumnValue.value;
					var historyState = this.sandbox.publish("GetHistoryState");
					var config = {
						sandbox: this.sandbox,
						entityId: entityId,
						entitySchemaName: referenceSchemaName
					};
					if (config.entityId !== historyState.state.primaryColumnValue) {
						NetworkUtilities.openEntityPage(config);
					}
					return false;
				},

				/**
				 * Изменяет значение колонки связи сущности при изменении данных в справочном поле.
				 * @param {String} value Новое значение связи.
				 * @param {String} columnName Наименование колонки связи.
				 */
				onColumnValueChange: function(value, columnName) {
					var currentColumnName = this.get("CurrentColumnName");
					if (!this.Ext.isEmpty(columnName)) {
						currentColumnName = columnName;
					}
					if (this.Ext.isEmpty(currentColumnName)) {
						return;
					}
					var prevValue = this.get(currentColumnName);
					if (prevValue === value) {
						return;
					}
					if (value != null && value.value === Terrasoft.GUID_EMPTY) {
						value.isNewValue = true;
						this.mixins.LookupQuickAddMixin.onLookupChange.call(this, value, currentColumnName);
					} else {
						this.set(currentColumnName, value);
						this.initDefaultColumnName();
						this.onSaveEntity();
					}
				},

				/**
				 * Событие выбора значений справочника.
				 * @overridden
				 * @param {Object} config Результат работы модуля выбора из справочника.
				 * @param {Terrasoft.Collection} config.selectedRows Коллекция выбранных записе.
				 * @param {String} config.columnName Имя колонки, для которой осеществлялся выбор.
				 */
				onLookupResult: function(config) {
					var columnName = config.columnName;
					var selectedRows = config.selectedRows;
					if (!selectedRows.isEmpty()) {
						var value = selectedRows.getByIndex(0);
						this.set(columnName, value);
						this.initDefaultColumnName();
						this.onSaveEntity();
					}
					this.set("CurrentColumnValue", null);
				},

				/**
				 * Получает ссылку на карточку объекта.
				 * @param {String} columnName Наименование колонки связи.
				 * @return {Object} Объект ссылки к карточке объекта.
				 */
				getHref: function(columnName) {
					var currentColumnValue = this.getColumnValue(columnName);
					var currentColumnName = columnName;
					var column = this.columns[currentColumnName];
					if (Ext.isEmpty(column)) {
						return {};
					}
					var referenceSchemaName = column.referenceSchemaName;
					var entitySchemaConfig = this.Terrasoft.configuration.ModuleStructure[referenceSchemaName];
					if (currentColumnValue && entitySchemaConfig) {
						var typeAttr = NetworkUtilities.getTypeColumn(referenceSchemaName);
						var typeUId;
						if (typeAttr && currentColumnValue[typeAttr.path]) {
							typeUId = currentColumnValue[typeAttr.path].value;
						}
						var url = NetworkUtilities.getEntityUrl(referenceSchemaName, currentColumnValue.value, typeUId);
						return {
							url: "ViewModule.aspx#" + url,
							caption: currentColumnValue.displayValue
						};
					}
					return {};
				},

				/**
				 * Обработчик события выбора значения связи в LookupPage-е. Устанавливает значения в модель представления.
				 * @param {Object} lookupPageResult Результат выбора в окне лукапа.
				 */
				onLookupSelected: function(lookupPageResult) {
					var selectedRows = lookupPageResult.selectedRows;
					if (selectedRows.getCount() > 0) {
						var selectedValue = selectedRows.getByIndex(0);
						this.onColumnValueChange(selectedValue, lookupPageResult.columnName);
					}
				},

				/**
				 * Заполняет список преподготовленных данных для справочного поля.
				 * @protected
				 * @param {Object} inputString Введенные данные в справочное поле.
				 */
				loadPrepareItems: function(inputString) {
					var list = this.Ext.create("Terrasoft.Collection");
					if (Ext.isEmpty(inputString) || (inputString.length < 3)) {
						return;
					}
					list.clear();
					var selectItemSettings = this.getPrepareQuery(inputString);
					selectItemSettings.getEntityCollection(function(result) {
						if (!result.success) {
							return;
						}
						var collection = result.collection;
						var columns = {};
						var currentColumnName = this.get("CurrentColumnName");
						var config = {
							collection: collection,
							filterValue: inputString,
							objects: columns,
							columnName: currentColumnName,
							isLookupEdit: true
						};
						if (collection && !collection.isEmpty()) {
							collection.each(function(item) {
								var itemId = item.get("Id");
								var lookupValue = {
									displayValue: item.get("displayValue"),
									value: itemId
								};
								if (!list.contains(itemId)) {
									columns[itemId] = lookupValue;
								}
							}, this);
						}
						this.mixins.LookupQuickAddMixin.onLookupDataLoaded.call(this, config);
						list.loadAll(columns);
						this.set("CurrentRelationItemsList", list);
					}, this);
				},

				/**
				 * Возвращает запрос на выборку элементов для справочного поля.
				 * @protected
				 * @param {String} inputString Вводимые данные в справочное поле.
				 * @returns {Terrasoft.EntitySchemaQuery} Запрос на выборку элементов для справочного поля.
				 */
				getPrepareQuery: function(inputString) {
					var rowCount = this.get("CurrentRelationRowCount");
					var currentColumnName = this.get("CurrentColumnName");
					var column = this.columns[currentColumnName];
					var referenceSchemaName = column.referenceSchemaName;
					var referenceSchema = column.referenceSchema;
					var currentValue = this.getColumnValue(currentColumnName);
					var currentId = currentValue ? currentValue.value : null;
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: referenceSchemaName
					});
					esq.addColumn("Id");
					esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "displayValue");
					if (currentColumnName === "ActivityConnection") {
						var currentEmailId = this.get("Id");
						esq.filters.addItem(esq.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.NOT_EQUAL, referenceSchema.primaryColumnName,
							currentEmailId));
					}
					esq.filters.addItem(esq.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.NOT_EQUAL, referenceSchema.primaryColumnName, currentId));
					esq.filters.add("startFilter", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.START_WITH, referenceSchema.primaryDisplayColumnName,
						inputString));
					esq.rowCount = rowCount;
					esq.filters.addItem(this.getLookupQueryFilters(currentColumnName));
					return esq;
				},

				/**
				 * Формирует фильтры, которые накладываются на справочные поля.
				 * @private
				 * @param {String} columnName Название колонки связи.
				 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
				 */
				getLookupQueryFilters: function(columnName) {
					var filterGroup = this.Ext.create("Terrasoft.FilterGroup");
					var column = this.columns[columnName];
					var lookupListConfig = column.lookupListConfig;
					if (lookupListConfig) {
						var filterArray = lookupListConfig.filters;
						this.Terrasoft.each(filterArray, function(item) {
							var filter;
							if (Ext.isObject(item) && Ext.isFunction(item.method)) {
								filter = item.method.call(this, item.argument);
							}
							if (Ext.isFunction(item)) {
								filter = item.call(this);
							}
							if (Ext.isEmpty(filter)) {
								throw new this.Terrasoft.InvalidFormatException({
									message: Ext.String.format(
										this.get("Resources.Strings.ColumnFilterInvalidFormatException"), columnName)
								});
							}
							filterGroup.addItem(filter);
						}, this);
						if (lookupListConfig.filter) {
							var filterItem = lookupListConfig.filter.call(this);
							if (filterItem) {
								filterGroup.addItem(filterItem);
							}
						}
					}
					return filterGroup;
				},

				/**
				 * Возвращает открыта ли страница в режиме копирования.
				 * @private
				 * @return {Boolean} Возвращает открыта ли страница в режиме копирования.
				 */
				isCopyMode: function() {
					return false;
				},

				/**
				 * Получает замещающий текст для справочного поля, если оно не заполнено.
				 * @param {String} columnName Наименование колонки связи.
				 * @return {String} Замещающий текст
				 */
				getPlaceholder: function(columnName) {
					var column = this.entitySchema.getColumnByName(columnName);
					if (this.Ext.isEmpty(column)) {
						return "";
					}
					var connectToText = this.get("Resources.Strings.ConnectTo");
					return Ext.String.format(connectToText, column.caption);
				},

				/**
				 * Устанавливает признак отображения поля добавления новой связи.
				 */
				setIsAddNewRelationVisible: function() {
					var result = false;
					var connectionColumnList = this.get("EntityConnectionColumnList");
					this.Terrasoft.each(connectionColumnList, function(columnName) {
						result = result || !this.isColumnFilled(columnName);
					}, this);
					this.set("IsAddNewRelationVisible", result);
				},

				/**
				 * Устанавливавет значения параметров контакта отправителя.
				 * @param {Object} senderContact Контакт отправителя.
				 */
				initSenderInfo: function(senderContact) {
					if (!this.Ext.isEmpty(senderContact)) {
						this.set("SenderContact", senderContact);
					}
					var name = this.getSenderName();
					var email = this.getSenderEmail();
					if (this.Ext.isEmpty(name)) {
						name = email;
						email = "";
					}
					var hasContact = true;
					var messageType = this.get("MessageType");
					if (messageType.value === ConfigurationConstants.Activity.MessageType.Incoming) {
						var contact = this.get("SenderContact");
						hasContact = !this.Ext.isEmpty(contact);
					}
					this.set("SenderName", name);
					this.set("SenderEmail", email);
					this.set("HasContact", hasContact);
				},

				/**
				 * Формирует ссылку на письмо.
				 * @return {String} Ссылка на письмо.
				 */
				getEmailHref: function() {
					var url = Terrasoft.workspaceBaseUrl + "/Nui/ViewModule.aspx#";
					var id = this.get("Id");
					var referenceSchemaName = EmailConstants.entitySchemaName;
					var typeUId = ConfigurationConstants.Activity.Type.Email;
					url += NetworkUtilities.getEntityUrl(referenceSchemaName, id, typeUId);
					return url;
				}
			},
			diff: [
				{
					"operation": "insert",
					"name": "EmailHeader",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						classes: {wrapClassName: ["messageHeader"]},
						items: []
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailHeader",
					"propertyName": "items",
					"name": "EmailAuthorImage",
					"values": {
						"getSrcMethod": "getAuthorImageSrc",
						"onPhotoChange": Terrasoft.emptyFn,
						"readonly": true,
						"classes": {"wrapClass": ["author-image-container"]},
						"generator": "ImageCustomGeneratorV2.generateSimpleCustomImage",
						"onImageClick": {bindTo: "openContactPage"},
						"visible": {bindTo: "isAuthorImageUrlExist"}
					}
				},
				{
					"operation": "insert",
					"name": "EmailAuthorContainer",
					"parentName": "EmailHeader",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						classes: {wrapClassName: ["createdBy"]},
						items: []
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailAuthorContainer",
					"propertyName": "items",
					"name": "EmailAuthor",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {bindTo: "SenderName"},
						"classes": {
							"labelClass": ["t-label", "label-link", "label-url"]
						},
						"click": {bindTo: "openContactPage"},
						"markerValue": {bindTo: "SenderName"},
						"visible": {bindTo: "HasContact"}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailAuthorContainer",
					"propertyName": "items",
					"name": "EmailAuthorAddress",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {bindTo: "SenderName"},
						"classes": {
							"labelClass": ["t-label"]
						},
						"markerValue": {bindTo: "SenderName"},
						"visible": {
							bindTo: "HasContact",
							bindConfig: {
								converter: function(value) {
									return !value;
								}
							}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailHeader",
					"propertyName": "items",
					"name": "AuthorEmailAddress",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {bindTo: "SenderEmail"},
						"classes": {
							"labelClass": ["t-label", "createdByAddress"]
						},
						"markerValue": {bindTo: "SenderEmail"},
						"visible": {
							bindTo: "SenderEmail",
							bindConfig: {
								converter: function(value) {
									return value !== "";
								}
							}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailHeader",
					"propertyName": "items",
					"name": "EmailDate",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {
							"labelClass": ["message-date-text"]
						},
						"caption": {bindTo: "MailDateText"},
						"markerValue": {bindTo: "MailDateText"}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailHeader",
					"propertyName": "items",
					"name": "ActionsButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "Resources.Images.ActionsButtonImage"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"classes": {
							wrapperClass: ["email-actions-button-wrapper"],
							menuClass: ["email-actions-button-menu"]
						},
						"controlConfig": {
							"menu": {
								"items": {"bindTo": "ActionsMenuCollection"}
							}
						},
						"markerValue": "EmailActionsButton"
					}
				},
				{
					"operation": "insert",
					"name": "EmailMessage",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {"wrapClassName": ["message-container"]},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "TitleContainer",
					"parentName": "EmailMessage",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {wrapClassName: ["title-container"]},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "TitleContainer",
					"propertyName": "items",
					"name": "EmailTitleText",
					"values": {
						"itemType": Terrasoft.ViewItemType.HYPERLINK,
						"classes": {
							"hyperlinkClass": ["link", "message-title", "label-url", "label-link"]
						},
						"caption": {bindTo: "MailTitleText"},
						"href": {bindTo: "getEmailHref"},
						"click": {bindTo: "onTitleClick"},
						"markerValue": {bindTo: "MailTitleText"}
					}
				},
				{
					"operation": "insert",
					"name": "EmailMessageText",
					"parentName": "EmailMessage",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {"wrapClassName": ["message-text-container"]},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailMessageText",
					"propertyName": "items",
					"name": "EmailText",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"classes": {
							"labelClass": ["message-email-text"]
						},
						"caption": {bindTo: "getMailBody"}
					}
				}
			],
			rules: {
				"ActivityConnection": {
					"FiltrationActivityConnectionByAccount": {
						"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
						"autocomplete": true,
						"autoClean": true,
						"baseAttributePatch": "Account",
						"comparisonType": Terrasoft.ComparisonType.EQUAL,
						"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						"attribute": "Account"
					},
					"FiltrationActivityConnectiontByContact": {
						"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
						"autocomplete": true,
						"autoClean": true,
						"baseAttributePatch": "Contact",
						"comparisonType": Terrasoft.ComparisonType.EQUAL,
						"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						"attribute": "Contact"
					},
					"FiltrationWithoutCurrenttActivity": {
						"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
						"autocomplete": false,
						"autoClean": false,
						"baseAttributePatch": "Id",
						"comparisonType": Terrasoft.ComparisonType.NOT_EQUAL,
						"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						"attribute": "Id"
					}
				},
				"SenderEnum": {
					"BindParameterEnabledSenderEnumToEmailSendStatus": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "EmailSendStatus"
								},
								"comparisonType": Terrasoft.ComparisonType.NOT_EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": ConfigurationConstants.Activity.EmailSendStatus.Sended
								}
							}
						]
					}
				},
				"Recepient": {
					"BindParameterEnabledRecepientToEmailSendStatus": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "EmailSendStatus"
								},
								"comparisonType": Terrasoft.ComparisonType.NOT_EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": ConfigurationConstants.Activity.EmailSendStatus.Sended
								}
							}
						]
					}
				},
				"CopyRecepient": {
					"BindParameterEnabledCopyRecepientToEmailSendStatus": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "EmailSendStatus"
								},
								"comparisonType": Terrasoft.ComparisonType.NOT_EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": ConfigurationConstants.Activity.EmailSendStatus.Sended
								}
							}
						]
					}
				},
				"BlindCopyRecepient": {
					"BindParameterEnabledBlindCopyRecepientToEmailSendStatus": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "EmailSendStatus"
								},
								"comparisonType": Terrasoft.ComparisonType.NOT_EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": ConfigurationConstants.Activity.EmailSendStatus.Sended
								}
							}
						]
					}
				},
				"Title": {
					"BindParameterEnabledTitleToEmailSendStatus": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "EmailSendStatus"
								},
								"comparisonType": Terrasoft.ComparisonType.NOT_EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": ConfigurationConstants.Activity.EmailSendStatus.Sended
								}
							}
						]
					}
				},
				"Body": {
					"BindParameterEnabledBodyToEmailSendStatus": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "EmailSendStatus"
								},
								"comparisonType": Terrasoft.ComparisonType.NOT_EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": ConfigurationConstants.Activity.EmailSendStatus.Sended
								}
							}
						]
					}
				},
				"Owner": {
					"BindParameterEnabledOwnerToEmailSendStatus": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "EmailSendStatus"
								},
								"comparisonType": Terrasoft.ComparisonType.IN,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": ConfigurationConstants.Activity.EmailSendStatus.Sended
								}
							}
						]
					}
				},
				"Status": {
					"BindParameterEnabledStatusToEmailSendStatus": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "EmailSendStatus"
								},
								"comparisonType": Terrasoft.ComparisonType.IN,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": ConfigurationConstants.Activity.EmailSendStatus.Sended
								}
							}
						]
					}
				},
				"Contact": {
					"FiltrationContactByAccount": {
						"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
						"autocomplete": true,
						"autoClean": true,
						"baseAttributePatch": "Account",
						"comparisonType": Terrasoft.ComparisonType.EQUAL,
						"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						"attribute": "Account"
					}
				}
			}
		};
	});
