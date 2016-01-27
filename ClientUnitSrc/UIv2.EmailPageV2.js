define("EmailPageV2", ["BaseFiltersGenerateModule", "BusinessRuleModule", "ConfigurationConstants", "LookupUtilities",
		"EmailUtilitiesV2", "ConfigurationEnums"],
	function(BaseFiltersGenerateModule, BusinessRuleModule, ConfigurationConstants, LookupUtilities, EmailUtilities,
			ConfigurationEnums) {
		return {
			entitySchemaName: "Activity",
			attributes: {
				/**
				 * Ответственный.
				 */
				"Owner": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					lookupListConfig: {filter: BaseFiltersGenerateModule.OwnerFilter}
				},
				/**
				 * Признак видимости кнопки Отправить.
				 */
				"IsSendButtonVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					dependencies: [
						{
							columns: ["EmailSendStatus"],
							methodName: "getIsVisibleSendButton"
						}
					]
				},
				/**
				 * Признак видимости кнопки Ответить.
				 */
				"IsReplyButtonVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					dependencies: [
						{
							columns: ["Type", "MessageType"],
							methodName: "getIsVisibleReplyButton"
						}
					]
				},
				/**
				 * Признак видимости кнопки Переслать.
				 */
				"IsForwardButtonVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					dependencies: [
						{
							columns: ["Type", "MessageType"],
							methodName: "getIsVisibleForwardButton"
						}
					]
				},
				/**
				 * Признак видимости кнопки Переслать от.
				 */
				"IsForwardOUTButtonVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					dependencies: [
						{
							columns: ["EmailSendStatus"],
							methodName: "getIsVisibleForwardOUTButton"
						}
					]
				},
				/**
				 * Дата отправки.
				 */
				"SendDate": {
					dataValueType: this.Terrasoft.DataValueType.DATE_TIME
				},
				/**
				 * Отправитель.
				 */
				"Sender": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					visible: false,
					dependencies: [
						{
							columns: ["SenderEnum"],
							methodName: "setSenderFromSenderEnum"
						}
					]
				},
				/**
				 * Перечень отправителей.
				 */
				"SenderEnum": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					"caption": {"bindTo": "Resources.Strings.SenderCaption"}
				},
				/**
				 * Список отправителей, отображаемый при выборе значения из справочника.
				 */
				"SenderEnumList": {
					dataValueType: Terrasoft.DataValueType.ENUM,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isCollection: true
				},
				/**
				 * Получатель.
				 */
				"Recepient": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					dependencies: [
						{
							columns: ["Contact"],
							methodName: "onContactChange"
						}
					]
				},
				/**
				 * Категория активности.
				 */
				"ActivityCategory": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					dependencies: [
						{
							columns: ["Type"],
							methodName: "setDefaultValueByType"
						}
					]
				},
				/**
				 * Дата и время начала активности.
				 */
				"StartDate": {
					dataValueType: Terrasoft.DataValueType.DATE_TIME,
					dependencies: [
						{
							columns: ["StartDate"],
							methodName: "onStartDateChanged"
						}
					]
				},
				/**
				 * Дата и время завершения активности.
				 */
				"DueDate": {
					dataValueType: Terrasoft.DataValueType.DATE_TIME,
					dependencies: [
						{
							columns: ["DueDate"],
							methodName: "onDueDateChanged"
						}
					]
				},
				/**
				 * Состояние отправки письма.
				 */
				"EmailSendStatus": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					dependencies: [
						{
							columns: ["Type"],
							methodName: "setDefaultValueByType"
						}
					]
				},
				/**
				 * Признак Отображать в расписании.
				 */
				"ShowInScheduler": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					dependencies: [
						{
							columns: ["ActivityCategory"],
							methodName: "setDefaultShowInScheduler"
						}
					]
				},
				/**
				 * Поле "Копия" видимо.
				 */
				"isCopyRecipientVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},
				/**
				 * Поле "Скрытая копия" видимо.
				 */
				"isBlindCopyRecipientVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},

				/**
				 * Название представления "Расписание" раздела Активности.
				 */
				"SchedulerDataViewName": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					value: "SchedulerDataView"
				}
			},
			messages: {
				"ChangeRemindingsCounts": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message GetIsVisibleEmailPageButtons
				 * Получает информацию о том, какую кнопку следует отображать на странице.
				 */
				"GetIsVisibleEmailPageButtons": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			details: /**SCHEMA_DETAILS*/{
				Files: {
					schemaName: "EmailFileDetailV2",
					entitySchemaName: "ActivityFile",
					filter: {
						masterColumn: "Id",
						detailColumn: "Activity"
					}
				},
				EntityConnections: {
					schemaName: "EntityConnectionsDetailV2",
					entitySchemaName: "EntityConnection",
					filter: {
						masterColumn: "Id",
						detailColumn: "SysModuleEntity"
					}
				}
			}/**SCHEMA_DETAILS*/,
			methods: {

				/**
				 * Получает признак отображения меню добавления.
				 * @overridden
				 * @return {Boolean}
				 */
				getAddButtonMenuVisible: function() {
					return true;
				},

				/**
				 * @overridden
				 */
				getHeader: function() {
					return this.get("Resources.Strings.EmailPageCaption");
				},

				/**
				 * Заполняет список отправителей письма.
				 * @protected
				 */
				loadSenders: function() {
					var list = arguments[1];
					if (list === null) {
						return;
					}
					list.clear();
					var selectMailboxSyncSettings = this.getSenderQuery();
					selectMailboxSyncSettings.getEntityCollection(function(result) {
						var collection = result.collection;
						var columns = {};
						if (collection && collection.collection.length > 0) {
							Terrasoft.each(collection.collection.items, function(item) {
								var columnDisplayValue = this.Ext.String.format(
									this.get("Resources.Strings.EmailFormatString"),
									Terrasoft.core.enums.SysValue.CURRENT_USER_CONTACT.displayValue,
									item.values.SenderEmailAddress);
								var lookupValue = {
									displayValue: columnDisplayValue,
									value: item.values.Id
								};
								if (!list.contains(item.values.Id)) {
									columns[item.values.Id] = lookupValue;
								}
							}, this);
							list.loadAll(columns);
						}
					}, this);
				},

				/**
				 * Обработчик события загрузки списка значений для DueDate.
				 * @protected
				 */
				loadDueDateList: function(filterText, dataList) {
					var dueDateList = this.getDueDateDefaultList();
					if (!dueDateList) {
						dueDateList = this.setDueDateDefaultList(dataList);
					}
					var startDate = this.Terrasoft.deepClone(this.get("StartDate"));
					var dueDate = this.Terrasoft.deepClone(this.get("DueDate"));
					var ext = this.Ext;
					if (!ext.isDate(startDate) || !ext.isDate(dueDate)) {
						return;
					}
					if (startDate.getDate() === dueDate.getDate()) {
						var startTime = startDate.getTime();
						var timeFormat = this.Terrasoft.Resources.CultureSettings.timeFormat;
						dueDateList = dueDateList.filter(function(item) {
							var dueDate = ext.Date.parse(item.displayValue, timeFormat, true);
							var hours = dueDate.getHours();
							var minutes = dueDate.getMinutes();
							return (startTime <= startDate.setHours(hours, minutes));
						});
					}
					this.reloadDueDateList(dueDateList, dataList);
				},

				/**
				 * Возвращает список значений по умолчанию для DueDate.
				 * @protected
				 * @return {Terrasoft.core.collections.Collection} Список значений по умолчанию для DueDate.
				 */
				getDueDateDefaultList: function() {
					return this.get("TimeEditDefaultList");
				},

				/**
				 * Сохраняет полученный список значений для DueDate.
				 * @protected
				 * @param {Terrasoft.core.collections.Collection} data Коллекция по умолчанию для DueDate.
				 * @return {Terrasoft.core.collections.Collection} Список значений по умолчанию для DueDate.
				 */
				setDueDateDefaultList: function(data) {
					var defaultList = this.Terrasoft.deepClone(data.getItems());
					this.set("TimeEditDefaultList", defaultList);
					return defaultList;
				},

				/**
				 * Перезаписывает необходимую коллекцию в источник данных для DueDateList.
				 * @param {Terrasoft.Collection} currentList Коллекция c необходимыми данными данными для DueDate.
				 * @param {Terrasoft.Collection} dataList Коллекция c текущими данными данными для DueDate.
				 * @protected
				 */
				reloadDueDateList: function(currentList, dataList) {
					var newList = {};
					currentList.forEach(function(element) {
						newList[element.value] = element;
					});
					dataList.clear();
					dataList.loadAll(newList);
				},

				/**
				 * @overridden
				 */
				onEntityInitialized: function() {
					var ext = this.Ext;
					this.set("isCopyRecipientVisible", false);
					this.set("isBlindCopyRecipientVisible", false);

					if (!this.get("PlainTextMode")) {
						this.set("PlainTextMode", false);
					}
					this.setSenderEnumFromSender();
					this.setDefaultSenderEnum();
					this.setEmailAsRead();
					if (ext.isEmpty(this.get("IsHtmlBody")) && this.isAddMode()) {
						this.set("IsHtmlBody", true);
					}
					if (this.isAddMode()) {
						this.setValuesByForwardOrReply();
					}
					if (this.isAddMode() || this.isCopyMode()) {
						this.setDefEmailValues();
					}
					this.setDefaultValueByType();
					this.callParent(arguments);
				},

				onPageInitialized: function(callback, scope) {
					if (!this.get("SenderEnumList")) {
						this.set("SenderEnumList", this.Ext.create("Terrasoft.Collection"));
					}
					if (!this.get("Images")) {
						this.set("Images", this.Ext.create("Terrasoft.BaseViewModelCollection"));
					}
					if (callback) {
						callback.call(scope || this);
					}
				},
				/**
				 * Устанавливает значения по умолчанию.
				 * @protected
				 */
				setDefEmailValues: function() {
					this.set("ActivityCategory", {value: ConfigurationConstants.Activity.ActivityCategory.Email});
					var startDate = this.get("StartDate");
					var dueDate = this.get("DueDate");
					var millisecondsInMinute = this.Terrasoft.core.enums.DateRate.MILLISECONDS_IN_MINUTE;
					if (!dueDate || this.Ext.Date.getElapsed(startDate, dueDate) < 5 * millisecondsInMinute) {
						this.set("DueDate", new Date(startDate.getTime() + 30 * millisecondsInMinute));
					}
					var currentViewName = this.sandbox.publish("GetActiveViewName");
					this.set("ShowInScheduler", (currentViewName === "SchedulerDataView"));
				},

				/**
				 * Сохранить изображения в БД.
				 * @private
				 * @param {Object} fileNames Имена файлов.
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения.
				 */
				insertImages: function(fileNames, scope) {
					this.Terrasoft.each(fileNames, function(file) {
						var newItemId = Terrasoft.generateGUID();
						var callback = function(response) {
							var fileId = response.id;
							var activityFileSchemaUId = ConfigurationConstants.SysSchema.ActivityFile;
							var image = this.Ext.create("Terrasoft.BaseViewModel", {
								values: {
									fileName: file.name,
									url: "../rest/FileService/GetFile/" + activityFileSchemaUId + "/" + fileId
								}
							});
							var imagesCollection = scope.get("Images");
							if (imagesCollection) {
								imagesCollection.add(imagesCollection.getUniqueKey(), image);
							}
						};
						var parameters = {};
						parameters.Id = {
							value: newItemId,
							type: Terrasoft.DataValueType.GUID
						};
						parameters.CreatedOn = {
							value: Terrasoft.SysValue.CURRENT_DATE_TIME,
							type: Terrasoft.DataValueType.DATE_TIME
						};
						parameters.CreatedBy = {
							value: Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
							type: Terrasoft.DataValueType.GUID
						};
						parameters.Name = {
							value: file.name,
							type: Terrasoft.DataValueType.TEXT
						};
						parameters.Version = {
							value: 1,
							type: Terrasoft.DataValueType.INTEGER
						};
						parameters.Size = {
							value: file.size,
							type: Terrasoft.DataValueType.INTEGER
						};
						parameters.Type = {
							value: ConfigurationConstants.FileType.File,
							type: Terrasoft.DataValueType.GUID
						};
						parameters.Activity = {
							value: scope.get("Id"),
							type: Terrasoft.DataValueType.GUID
						};
						var data = {
							entityName: "ActivityFile",
							fileFieldName: "Data",
							file: file,
							parameters: parameters
						};
						Terrasoft.FileHelper.uploadFile(Terrasoft.QueryOperationType.INSERT, data, callback, this);
					}, scope);
				},

				/**
				 * Определить доступность кнопки "Отправить".
				 * @protected
				 */
				getIsVisibleSendButton: function() {
					var status = this.get("EmailSendStatus");
					var isVisible = (this.Ext.isEmpty(status) ||
					status.value !== ConfigurationConstants.Activity.EmailSendStatus.Sended);
					this.set("isVisibleSendButton", isVisible);
					this.sandbox.publish("GetIsVisibleEmailPageButtons", {
						key: "IsSendButtonVisible",
						value: isVisible
					});
					return isVisible;
				},

				/**
				 * Определить доступность кнопки "Ответить".
				 * @protected
				 */
				getIsVisibleReplyButton: function() {
					var type = this.get("Type");
					var emailType = this.get("MessageType");
					var isVisible = (type && type.value === ConfigurationConstants.Activity.Type.Email && emailType &&
					emailType.value === ConfigurationConstants.Activity.MessageType.Incoming);
					this.set("isVisibleReplyButton", isVisible);
					this.sandbox.publish("GetIsVisibleEmailPageButtons", {
						key: "IsReplyButtonVisible",
						value: isVisible
					});
					return isVisible;
				},

				/**
				 * Определить доступность кнопки "Переслать".
				 * @protected
				 */
				getIsVisibleForwardButton: function() {
					var type = this.get("Type");
					var messageType = this.get("MessageType");
					var emailSendStatus = this.get("EmailSendStatus");
					var isVisible = (type && type.value === ConfigurationConstants.Activity.Type.Email &&
					emailSendStatus && emailSendStatus.value ===
					ConfigurationConstants.Activity.EmailSendStatus.Sended &&
					messageType && messageType.value !== ConfigurationConstants.Activity.MessageType.Incoming);
					this.set("isVisibleForwardButton", isVisible);
					this.sandbox.publish("GetIsVisibleEmailPageButtons", {
						key: "IsForwardButtonVisible",
						value: isVisible
					});
					return isVisible;
				},

				/**
				 * Определить доступность кнопки "Переслать".
				 * @protected
				 */
				getIsVisibleForwardOUTButton: function() {
					var type = this.get("Type");
					var messageType = this.get("MessageType");
					var emailSendStatus = this.get("EmailSendStatus");
					var isVisible = (type && type.value === ConfigurationConstants.Activity.Type.Email &&
					emailSendStatus && emailSendStatus.value ===
					ConfigurationConstants.Activity.EmailSendStatus.Sended &&
					messageType && messageType.value === ConfigurationConstants.Activity.MessageType.Incoming);
					this.set("isVisibleForwardOUTButton", isVisible);
					this.sandbox.publish("GetIsVisibleEmailPageButtons", {
						key: "IsForwardOUTButtonVisible",
						value: isVisible
					});
					return isVisible;
				},

				/**
				 * Срабатывает, когда изображения загружены.
				 * @private
				 * @param {Object} fileNames Имена файлов.
				 */
				onImageLoaded: function(fileNames) {
					if (this.isAddMode() && this.Ext.isEmpty(this.get("IsSavedEntity"))) {
						var buttonsConfig = {
							buttons: [Terrasoft.MessageBoxButtons.YES.returnCode,
								Terrasoft.MessageBoxButtons.NO.returnCode],
							defaultButton: 0
						};
						this.showInformationDialog(this.get("Resources.Strings.SaveForInsertImage"),
							function(result) {
								if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
									this.saveEntity(function() {
										this.set("IsSavedEntity", true);
										this.insertImages(fileNames, this);
									});
								}
							}, buttonsConfig, this);
					} else {
						this.insertImages(fileNames, this);
					}
				},

				/**
				 * Срабатывает, когда изменилось значение поля "Кому".
				 * @protected
				 */
				onContactChange: function() {
					var ext = this.Ext;
					var contact = this.get("Contact");
					var recipient = this.get("Recepient");
					if (ext.isEmpty(recipient) && !ext.isEmpty(contact) && !ext.isEmpty(contact.Email)) {
						var email = ext.String.format(this.get("Resources.Strings.EmailFormatString"),
							contact.displayValue, contact.Email);
						this.set("Recepient", email);
					}
				},

				/**
				 * Открыть страницу выбора из справочника значения поля "Копия".
				 * @protected
				 */
				openCopyRecepientLookupEmail: function() {
					var lookup = this.getLookupConfig("CopyRecepient");
					lookup.config.actionsButtonVisible = false;
					LookupUtilities.Open(this.sandbox, lookup.config, lookup.callback, this, null, false, false);
				},

				/**
				 * Открыть страницу выбора из справочника значения поля "Скрытая копия"
				 * @protected
				 */
				openBlindCopyRecepientLookupEmail: function() {
					var lookup = this.getLookupConfig("BlindCopyRecepient");
					LookupUtilities.Open(this.sandbox, lookup.config, lookup.callback, this, null, false, false);
				},

				/**
				 * Сформировать настройки, необходимые для отображение страницы выбора из справочника.
				 * @protected
				 * @param {String} columnName Имя колонки, для которой нужно указать значение из справочника.
				 * @return {Object}
				 */
				getLookupConfig: function(columnName) {
					var scope = this;
					var callback = function(args) {
						scope.onLookupSelected(args);
					};
					return {
						config: {
							entitySchemaName: "VwRecepientEmail",
							columnName: columnName,
							columns: ["ContactId"],
							filters: Terrasoft.createColumnIsNotNullFilter("ContactId"),
							multiSelect: true
						},
						callback: callback
					};
				},

				/**
				 * Срабатывает, когда указаны значения на странице выбора из справочника.
				 * @param {Object} args
				 */
				onLookupSelected: function(args) {
					var ext = this.Ext;
					var columnName = args.columnName;
					var isContactEmpty = ext.isEmpty(this.get("Contact"));
					var items = args.selectedRows.collection.items;
					this.recepientCollection = this.recepientCollection || [];
					var collection = this.recepientCollection;
					var columnValue = this.get(columnName);
					if (ext.isEmpty(columnValue)) {
						columnValue = "";
					} else {
						columnValue = columnValue.trim();
						var addSymbol = "";
						var symbol = columnValue[columnValue.length - 1];
						if (symbol === ";") {
							addSymbol = " ";
						} else {
							addSymbol = "; ";
						}
						columnValue = columnValue + addSymbol;
					}
					Terrasoft.each(items, function(item) {
						var contactId = item.ContactId;
						if (isContactEmpty && ext.isEmpty(columnValue) && columnName === "Recepient") {
							this.loadLookupDisplayValue("Contact", contactId);
							isContactEmpty = false;
						}
						var displayValue = item.displayValue;
						if (collection.indexOf(contactId) < 0) {
							collection.push(contactId);
						}
						var idx = columnValue.indexOf(displayValue + ";");
						if (idx !== 0 && idx < 0) {
							columnValue += displayValue + "; ";
						}
					}, this);
					this.set(columnName, columnValue);
				},

				/**
				 * Сформировать запрос регистрации участников.
				 * @protected
				 * @param {String} contactId Идентификатор записи контакта.
				 * @param {String} activityId Идентификатор записи активности.
				 */
				getContactInsertQuery: function(contactId, activityId) {
					var roleId = ConfigurationConstants.Activity.ParticipantRole.Participant;
					var insert = this.Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "ActivityParticipant"
					});
					var id = Terrasoft.utils.generateGUID();
					insert.setParameterValue("Id", id, Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Activity", activityId, Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Participant", contactId, Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Role", roleId, Terrasoft.DataValueType.GUID);
					return insert;
				},

				/**
				 * Проверяет корректно ли заполнено поле "Дата начала".
				 * @param {Object} callback Функция обратного вызова.
				 * @param {Object} scope Контекст выполения функции обратного вызова.
				 */
				validateStartDate: function(callback, scope) {
					var result = {
						success: true
					};
					var plainTextMode = this.get("PlainTextMode");
					this.set("IsHtmlBody", !plainTextMode);
					if (this.get("StartDate") > this.get("DueDate")) {
						result.message = this.get("Resources.Strings.StartDateGreaterDueDate");
						result.success = false;
					}
					callback.call(scope || this, result);
				},

				/**
				 * @overridden
				 */
				asyncValidate: function(callback, scope) {
					this.callParent([function(response) {
						if (!this.validateResponse(response)) {
							return;
						}
						Terrasoft.chain(
							function(next) {
								this.validateStartDate(function(response) {
									if (this.validateResponse(response)) {
										next();
									}
								}, this);
							},
							function(next) {
								callback.call(scope, response);
								next();
							}, this);
					}, this]);
				},

				/**
				 * Обработчик события изменения полей StartDate и DueDate. Метод очищает значения секунд и миллисекунд.
				 * @private
				 * @param {Object} argument Параметр, который указывается в зависимостях колонки. Не используется.
				 * @param {String} columnName Название поля, изменение которого инициировало событие change.
				 */
				clearSeconds: function(argument, columnName) {
					var date = this.get(columnName);
					if (!this.Ext.isDate(date)) {
						return;
					}
					date = this.Terrasoft.clearSeconds(date);
					this.set(columnName, date, {
						silent: true
					});
				},

				/**
				 * Возвращает стантадртное значение интервала времени в 180000 мс.
				 * @protected
				 */
				getDefaultTimeInterval: function() {
					return this.Terrasoft.TimeScale.THIRTY_MINUTES * this.Terrasoft.DateRate.MILLISECONDS_IN_MINUTE;
				},

				/**
				 * Обработчик события изменения поля Даты начала.
				 * @protected
				 */
				onStartDateChanged: function() {
					this.clearSeconds(arguments);
					var startDate = this.Terrasoft.deepClone(this.get("StartDate"));
					if (!this.Ext.isDate(startDate)) {
						return;
					}
					var differStartDueDate = this.get("DifferStartDueDate");
					if (!differStartDueDate) {
						differStartDueDate = this.getDefaultTimeInterval();
					}
					this.set("DueDate", new Date(startDate.getTime() + differStartDueDate));
				},

				/**
				 * Обработчик события изменения поля Даты завершения.
				 * @protected
				 */
				onDueDateChanged: function() {
					this.clearSeconds(arguments);
					var startDate = this.Terrasoft.deepClone(this.get("StartDate"));
					var dueDate = this.Terrasoft.deepClone(this.get("DueDate"));
					if (!this.validateDueDate() || !this.Ext.isDate(startDate) || !this.Ext.isDate(dueDate)) {
						return;
					}
					this.setDifferStartDueDate(startDate, dueDate);
				},

				/**
				 * Устанавливает интервал времени.
				 * @param {DateTime} startDate Дата начала.
				 * @param {DateTime} dueDate Дата завершения.
				 */
				setDifferStartDueDate: function(startDate, dueDate) {
					var difference = {};
					if (startDate.getTime() < dueDate.getTime()) {
						difference = dueDate.getTime() - startDate.getTime();
					} else {
						difference = this.getDefaultTimeInterval();
					}
					this.set("DifferStartDueDate", difference);
				},

				/**
				 * Проверяет значение колонки "Завершение".
				 * Выводит сообщение в случае, если дата время "Завершение" больше "Начало".
				 * @private
				 * @return {Boolean} Результат валидации.
				 */
				validateDueDate: function() {
					var startDate = this.get("StartDate");
					var dueDate = this.get("DueDate");
					if (this.Ext.isEmpty(startDate) || this.Ext.isEmpty(dueDate)) {
						return false;
					}
					if (startDate > dueDate) {
						this.showInformationDialog(this.get("Resources.Strings.StartDateGreaterDueDate"));
						return false;
					}
					return true;
				},

				/**
				 * Устанавливает Отображать в расписании значением по умолчанию.
				 * @protected
				 */
				setDefaultShowInScheduler: function() {
					var category = this.get("ActivityCategory");
					var meeting = ConfigurationConstants.Activity.ActivityCategory.Meeting;
					if (!this.Ext.isEmpty(category) && category.value === meeting) {
						this.set("ShowInScheduler", true);
					}
				},

				/**
				 * Копирует значения колонок из схемы в текущую модель.
				 * @param {Object} entity Схема активности.
				 * @param {Object} actionType Действие, выполняемое с письмом.
				 */
				copyEntityColumnValues: function(entity, actionType) {
					var contact = entity.get("Contact");
					var account = entity.get("Account");
					var sender = entity.get("Sender");
					var recipient = entity.get("Recepient");
					var copyRecipient = entity.get("CopyRecepient");
					var blindCopyRecipient = entity.get("BlindCopyRecepient");
					var messageType = entity.get("MessageType");
					if (messageType.value === ConfigurationConstants.Activity.MessageType.Incoming &&
						actionType.name === "ReplyAll" || actionType.name === "Reply") {
						if (sender) {
							this.set("Recepient", sender);
						}
					} else if (messageType.value === ConfigurationConstants.Activity.MessageType.Outgoing &&
						actionType.name === "ReplyAll") {
						if (recipient) {
							this.set("Recepient", recipient);
						}
					}
					this.set("Type", entity.get("Type"));
					if (copyRecipient && actionType.name === "ReplyAll") {
						this.set("CopyRecepient", copyRecipient);
					}
					if (blindCopyRecipient && actionType.name === "ReplyAll") {
						this.set("BlindCopyRecepient", blindCopyRecipient);
					}
					if (contact) {
						this.set("Contact", contact);
					}
					if (account) {
						this.set("Account", account);
					}
				},

				/**
				 * Заменяет ссылки на id содержимого в теле письма на актуальные.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				replaceContentIds: function(callback, scope) {
					var guidPattern = "[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}";
					var body = this.get("Body");
					var sourceEmailId = this.get("SourceEntityPrimaryColumnValue");
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "ActivityFile"});
					esq.addColumn("Id", "SourceFileId");
					esq.addColumn("[ActivityFile:Name:Name].Id", "EmailFileId");
					esq.addColumn("[ActivityFile:CreatedOn:CreatedOn].Id");
					esq.addColumn("[ActivityFile:Size:Size].Id");
					var filters = esq.filters;
					filters.addItem(scope.Terrasoft.createColumnFilterWithParameter(
						scope.Terrasoft.ComparisonType.EQUAL, "Activity", sourceEmailId));
					filters.addItem(scope.Terrasoft.createFilter(scope.Terrasoft.ComparisonType.NOT_EQUAL,
						"[ActivityFile:Name:Name].Id", "Id"));
					filters.addItem(scope.Terrasoft.createFilter(scope.Terrasoft.ComparisonType.NOT_EQUAL,
						"[ActivityFile:CreatedOn:CreatedOn].Id", "Id"));
					filters.addItem(scope.Terrasoft.createFilter(scope.Terrasoft.ComparisonType.NOT_EQUAL,
						"[ActivityFile:Size:Size].Id", "Id"));
					esq.getEntityCollection(function(response) {
						if (!response.success) {
							var errorInfo = response.errorInfo;
							throw new Terrasoft.UnknownException({
								message: errorInfo.message
							});
						}
						var entities = response.collection;
						entities.each(function(entity) {
							var sourceFileId = entity.get("SourceFileId");
							var emailFileId = entity.get("EmailFileId");
							var pattern = this.Ext.String.format(
								"(\\.\\/terrasoft\\.axd\\?s=db&sn=)({0})(&id=)({1})(&t=.*)?(&sc=)({0})",
								guidPattern, sourceFileId);
							var regex = new RegExp(pattern, "ig");
							body = body.replace(regex, "$1$2$3" + emailFileId + "$5$6$7");
						}, this);
						this.set("Body", body);
						callback.call(scope);
					}, scope);
				},

				/**
				 * Проставляет значения модели после получения схемы при пересылке или копировании письма.
				 * @protected
				 * @param {Object} response Ответ от сервера.
				 */
				getEntityCallBack: function(response) {
					if (response && response.success && response.entity) {
						var entity = response.entity;
						var format = this.Ext.String.format;
						var actionType = this.get("EmailActionType");
						var body = entity.get("Body");
						var sender = entity.get("Sender");
						var recipient = entity.get("Recepient");
						var copyRecipient = entity.get("CopyRecepient");
						var title = entity.get("Title");
						var startDate = entity.get("StartDate");
						this.copyEntityColumnValues(entity, actionType);
						var titleAdd = actionType.name === "Forward" ?
							this.get("Resources.Strings.ForwardShablonCaption") :
							this.get("Resources.Strings.ReplyShablonCaption");
						this.set("Title", format("{0} {1}", titleAdd, title));
						var template = "<br><br><br><div><hr><span style='font-weight: bold;'" +
							">{6}: </span><span>{0}</span><br><span style='font-weight: bold;'>" +
							"{7}: </span><span>{1}</span><br><span style='font-weight: bold;'>" +
							"{8}: </span><span>{2}</span><br><span style='font-weight: bold;'>" +
							"{9}: </span><span>{3}</span><br><span style='font-weight: bold;'>" +
							"{10}: </span><span>{4}</span><br><div>{5}";
						body = format(template, sender, startDate, recipient, copyRecipient, title, body,
							this.get("Resources.Strings.SenderCaption"),
							this.get("Resources.Strings.SendDateCaption"),
							this.get("Resources.Strings.RecepientCaption"),
							this.get("Resources.Strings.CopyRecepientCaption"),
							this.get("Resources.Strings.TitleCaption"));
						this.set("Body", body);
						this.initHeaderCaption();
						if (actionType.name === "Forward" && entity.get("FileCount") > 0) {
							this.showConfirmationDialog(this.get("Resources.Strings.CopyAttachmentMsg"), function(result) {
								if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
									this.saveEntity(function(response) {
										this.set("SourceEntityPrimaryColumnValue", entity.get(this.primaryColumnName));
										this.set("Operation", ConfigurationEnums.CardStateV2.EDIT);
										this.onSaved(response, {"setOperation": ConfigurationEnums.CardStateV2.ADD});
									}, this);
								}
							}, ["yes", "no"]);
						}
					}
				},

				/**
				 * Проставляет значения модели в зависимости от типа отправки Email сообщения.
				 * @protected
				 */
				setValuesByForwardOrReply: function() {
					var state = this.sandbox.publish("GetHistoryState");
					var params = state.hash.valuePairs;
					var forwardEmailId;
					if (!(params && params.length > 0)) {
						return;
					}
					var selectEmail = this.getEmailSelect();
					var actionTypes = ["Forward", "ReplyAll", "Reply"];
					for (var i = 0; i < params.length; i++) {
						var actionType = params[i];
						if (actionTypes.indexOf(actionType.name) !== -1) {
							forwardEmailId = actionType.value;
							this.set("EmailActionType", actionType);
							selectEmail.getEntity(forwardEmailId, this.getEntityCallBack, this);
						}
					}
				},

				/**
				 * Проставляет признак, указывающий на то, что письмо прочитано.
				 * @protected
				 */
				setEmailAsRead: function() {
					var id = this.get("Id");
					var update = this.Ext.create("Terrasoft.UpdateQuery", {
						rootSchemaName: "ActivityParticipant"
					});
					var filters = update.filters;
					var userIdFilter = update.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Participant", Terrasoft.SysValue.CURRENT_USER_CONTACT.value);
					filters.add("userIdFilter", userIdFilter);
					var activityIdFilter = update.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
						"Activity", id);
					filters.add("ActivityIdFilter", activityIdFilter);
					update.setParameterValue("ReadMark", true, Terrasoft.DataValueType.BOOLEAN);
					update.execute(function(response) {
						if (response && response.success) {
							this.sandbox.publish("ChangeRemindingsCounts", {});
						}
					}, this);
				},

				/**
				 * Возвращает массив загружаемых колонок.
				 * @private
				 * @return {Array} Массив колонок.
				 */
				getEmailSelectColumns: function() {
					return ["Id", "Author", "Owner", "Contact", "Account", "Sender",
						"Recepient", "CopyRecepient", "BlindCopyRecepient", "Body",
						"Title", "StartDate", "MessageType", "Type"];
				},

				/**
				 * Возвращает запрос на выборку записи
				 * @protected
				 * @param {String} emailId Идентификатор записи активности
				 * @returns {Terrasoft.EntitySchemaQuery}
				 */
				getEmailSelect: function(emailId) {
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "Activity"});
					var columns = this.getEmailSelectColumns();
					this.Terrasoft.each(columns, function(columnName) {
						esq.addColumn(columnName);
					}, this);
					var fileCountColumn = this.Ext.create("Terrasoft.AggregationQueryColumn", {
						aggregationType: Terrasoft.AggregationType.COUNT,
						columnPath: "[ActivityFile:Activity].Id"
					});
					esq.addColumn(fileCountColumn, "FileCount");
					esq.enablePrimaryColumnFilter(emailId);
					return esq;
				},

				/**
				 * Проставляет Отправителя, значениями выбранными пользователем
				 * @protected
				 */
				setSenderFromSenderEnum: function() {
					var senderEnum = this.get("SenderEnum");
					var ext = this.Ext;
					if (!ext.isEmpty(senderEnum) && !ext.isEmpty(senderEnum.displayValue) &&
						senderEnum.value !== "oldKey") {
						this.set("Sender", senderEnum.displayValue);
					} else if (senderEnum === null) {
						this.set("Sender", "");
					}
				},

				/**
				 * Проставляет перечень отправителей значением из колонки Отправитель
				 * @protected
				 */
				setSenderEnumFromSender: function() {
					var sender = this.get("Sender");
					var senderEnum = this.get("SenderEnum");
					var ext = this.Ext;
					if (ext.isEmpty(senderEnum) && !ext.isEmpty(sender)) {
						var senderEnumValue = {
							displayValue: sender,
							value: "oldKey"
						};
						this.set("SenderEnum", senderEnumValue);
					}
				},

				/**
				 * Проставляет перечень отправителей значением по умолчанию
				 * @protected
				 */
				setDefaultSenderEnum: function() {
					var isAddMode = this.isAddMode();
					if (isAddMode) {
						var selectMailboxSyncSettings = this.getSenderQuery();
						selectMailboxSyncSettings.getEntityCollection(function(result) {
							var collection = result.collection;
							if (collection && collection.collection.length > 0) {
								Terrasoft.each(collection.collection.items, function(item) {
									var columnDisplayValue = this.Ext.String.format(
										this.get("Resources.Strings.EmailFormatString"),
										Terrasoft.core.enums.SysValue.CURRENT_USER_CONTACT.displayValue,
										item.values.SenderEmailAddress);
									var it = {
										displayValue: columnDisplayValue,
										value: item.values.Id
									};
									if (isAddMode && item.values.IsDefault && item.values.SendEmailsViaThisAccount) {
										this.set("SenderEnum", it);
									}
								}, this);
							} else {
								var buttonsConfig = {
									buttons: [Terrasoft.MessageBoxButtons.YES.returnCode,
										Terrasoft.MessageBoxButtons.NO.returnCode],
									defaultButton: 0,
									caption: this.get("Resources.Strings.AddEmailForUserQuestion")
								};
								var buildType = ConfigurationConstants.BuildType.Public;
								this.Terrasoft.SysSettings.querySysSettingsItem("BuildType", function(sysSettingValue) {
									if (sysSettingValue && sysSettingValue.value === buildType) {
										this.showInformationDialog(this.get("Resources.Strings.MailboxDoesntExist"));
									} else {
										this.showInformationDialog(
											this.get("Resources.Strings.AddEmailForUserQuestion"),
											this.addEmailForUser, buttonsConfig, this);
									}
								}, this);
							}
						}, this);
					} else {
						var sender = this.get("Sender");
						if (!this.Ext.isEmpty(sender)) {
							var item = {
								displayValue: sender,
								value: "oldKey"
							};
							this.set("SenderEnum", item);
						}
					}
				},

				/**
				 * Проставляет указать пользователю адрес электронного ящика.
				 * @protected
				 * @param {String} result Код нажатой кнопки диалогового сообщения.
				 */
				addEmailForUser: function(result) {
					if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
						this.sandbox.publish("PushHistoryState", {hash: "MailboxSynchronizationSettingsModule"});
					}
				},

				/**
				 * Возвращает запрос на выборку отправителя
				 * @protected
				 */
				getSenderQuery: function() {
					var sysAdminUnit = Terrasoft.core.enums.SysValue.CURRENT_USER;
					var selectMailboxSyncSettings = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "MailboxSyncSettings"
					});
					selectMailboxSyncSettings.addColumn("Id");
					selectMailboxSyncSettings.addColumn("SysAdminUnit.Contact.Name");
					selectMailboxSyncSettings.addColumn("SenderEmailAddress");
					selectMailboxSyncSettings.addColumn("IsDefault");
					selectMailboxSyncSettings.addColumn("SendEmailsViaThisAccount");
					selectMailboxSyncSettings.filters.logicalOperation = Terrasoft.LogicalOperatorType.AND;

					var filterName = "FilterEmailSettings";
					var filterIsEmailForSendName = "FilterIsEmailForSendName";
					var filterIsSharedName = "FilterIsSharedName";
					var filtersGroup = selectMailboxSyncSettings.createFilterGroup();
					filtersGroup.name = "FilterGroup";
					filtersGroup.logicalOperation = Terrasoft.LogicalOperatorType.OR;

					var filterSettings = selectMailboxSyncSettings.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "SysAdminUnit", sysAdminUnit.value);
					var filterIsEmailForSend = selectMailboxSyncSettings.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "SendEmailsViaThisAccount", true);
					var filterIsShared = selectMailboxSyncSettings.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "IsShared", true);

					if (selectMailboxSyncSettings.filters.contains(filterName)) {
						selectMailboxSyncSettings.filters.removeByKey(filterName);
					}
					if (selectMailboxSyncSettings.filters.contains(filterIsShared)) {
						selectMailboxSyncSettings.filters.removeByKey(filterIsShared);
					}
					if (selectMailboxSyncSettings.filters.contains(filterIsEmailForSendName)) {
						selectMailboxSyncSettings.filters.removeByKey(filterIsEmailForSendName);
					}

					filtersGroup.add(filterName, filterSettings);
					filtersGroup.add(filterIsSharedName, filterIsShared);
					selectMailboxSyncSettings.filters.add(filtersGroup.name, filtersGroup);

					selectMailboxSyncSettings.filters.add(filterIsEmailForSendName, filterIsEmailForSend);
					return selectMailboxSyncSettings;
				},

				/**
				 * Проставляет значениями по умолчанию свойства сущности Email
				 * @protected
				 */
				setDefaultValueByType: function() {
					var type = this.get("Type");
					if (!type || type.value !== ConfigurationConstants.Activity.Type.Email) {
						return;
					}
					if (!this.isAddMode()) {
						this.onDueDateChanged();
						return;
					}
					var startDate = this.get("StartDate");
					var dueDate = this.get("DueDate");
					var millisecondsInMinute = this.Terrasoft.core.enums.DateRate.MILLISECONDS_IN_MINUTE;
					var defaultTimeInterval = this.getDefaultTimeInterval();
					if (!dueDate || this.Ext.Date.getElapsed(startDate, dueDate) < 4 * millisecondsInMinute) {
						var defaultDueDate = this.Ext.Date.add(startDate, this.Ext.Date.MILLI, defaultTimeInterval);
						this.set("DueDate", defaultDueDate);
					} else {
						this.setDifferStartDueDate(startDate, dueDate);
					}
					var category = ConfigurationConstants.Activity.ActivityCategory.Email;
					var emailSendStatus = ConfigurationConstants.Activity.EmailSendStatus.NotSended;
					var emailMessageType = ConfigurationConstants.Activity.MessageType.Outgoing;
					var bq = Ext.create("Terrasoft.BatchQuery");
					bq.add(this.getLookupDisplayValueQuery({
						name: "ActivityCategory",
						value: category
					}));
					bq.add(this.getLookupDisplayValueQuery({
						name: "MessageType",
						value: emailMessageType
					}));
					bq.add(this.getLookupDisplayValueQuery({
						name: "EmailSendStatus",
						value: emailSendStatus
					}));
					bq.execute(function(response) {
						if (!(response && response.success)) {
							return;
						}
						this.set("ActivityCategory", response.queryResults[0].rows[0]);
						this.set("MessageType", response.queryResults[1].rows[0]);
						this.set("EmailSendStatus", response.queryResults[2].rows[0]);
					}, this);
				},

				/**
				 * Выполняет проверку перед тем как будет отправлен Email.
				 * @protected
				 */
				checkSenderBeforeSend: function() {
					var ext = this.Ext;
					var sender = this.get("Sender");
					var recipient = this.get("Recepient");
					var copyRecipient = this.get("CopyRecepient");
					var blindCopyRecipient = this.get("BlindCopyRecepient");
					if (ext.isEmpty(sender)) {
						this.showConfirmationDialog(this.get("Resources.Strings.SendEmailForUserQuestion"));
						return;
					}
					if (ext.isEmpty(recipient) && ext.isEmpty(copyRecipient) && ext.isEmpty(blindCopyRecipient)) {
						this.showConfirmationDialog(this.get("Resources.Strings.RecepientEmailForUserQuestion"));
						return;
					}
					if (this.isAddMode()) {
						var buttonsConfig = {
							buttons: [Terrasoft.MessageBoxButtons.YES.returnCode,
								Terrasoft.MessageBoxButtons.NO.returnCode],
							defaultButton: 0
						};
						this.showInformationDialog(this.get("Resources.Strings.SaveAndSend"), function(result) {
							if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
								if (this.isChanged()) {
									this.saveEntity(function() {
										this.sendEmail(this);
									});
								} else {
									this.sendEmail(this);
								}
							}
						}, buttonsConfig, this);
					} else {
						if (this.isChanged()) {
							this.saveEntity(function() {
								this.sendEmail(this);
							});
						} else {
							this.sendEmail(this);
						}
					}
				},

				/**
				 * Отправить Email.
				 * @protected
				 */
				sendEmail: function(scope) {
					var activityId = scope.get("Id");
					scope.set("EmailSendStatus", {
						displayValue: "Sended",
						value: ConfigurationConstants.Activity.EmailSendStatus.Sended
					});
					EmailUtilities.send.call(this, activityId, function(response) {
						this.onSaved(response);
					});
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#sendSaveCardModuleResponse
				 * @overridden
				 */
				sendSaveCardModuleResponse: function(args) {
					if (!this.callParent([args.success || args])) {
						var config = {
							entitySchemaName: this.entitySchemaName,
							primaryColumnValue: this.get(this.primaryColumnName),
							isInChain: args.isInChain || false
						};
					}
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#onSaved
				 * @overridden
				 */
				onSaved: function(response, config) {
					var forwardEmailId = this.get("SourceEntityPrimaryColumnValue");
					if (config && config.callParent === true) {
						this.callParent(arguments);
						if (config.setOperation) {
							this.set("Operation", config.setOperation);
						}
					} else if (forwardEmailId) {
						var requestConfig = {
							serviceName: "EntityUtilsService",
							methodName: "CopyEntities",
							data: {
								sourceEntityId: forwardEmailId,
								recipientEntityId: this.get("Id"),
								columnName: "Activity",
								entitySchemaName: "Activity",
								sourceEntitySchemaNames: ["ActivityFile"]
							}
						};
						this.callService(requestConfig, function() {
							config = (config && config.length === 1) ? config[0] : (config || {});
							config.callParent = true;
							this.replaceContentIds(function() {
								this.set("SourceEntityPrimaryColumnValue", null);
								this.onSaved(response, config);
							}, this);
						}, this);
					} else {
						config = (config && config.length === 1) ? config[0] : (config || {});
						config.callParent = true;
						this.onSaved(response, config);
					}
				},

				/**
				 * Ответить на Email сообщение.
				 * @protected
				 */
				replyEmail: function() {
					var linkReply = this.getLink("linkReply");
					this.sandbox.publish("PushHistoryState", {hash: linkReply});
				},

				/**
				 * Ответить всем на Email сообщение.
				 * @protected
				 */
				replyAllEmail: function() {
					var linkReplyAll = this.getLink("linkReplyAll");
					this.sandbox.publish("PushHistoryState", {hash: linkReplyAll});

				},

				/**
				 * Переслать Email сообщение.
				 * @protected
				 */
				forwardEmail: function() {
					var linkForward = this.getLink("linkForward");
					this.sandbox.publish("PushHistoryState", {hash: linkForward});
				},

				/**
				 * Возвращает Url запроса к сервису.
				 * @protected
				 * @param {String} typeLink Тип отправки Email сообщения.
				 * @returns {String}
				 */
				getLink: function(typeLink) {
					var emailId = this.get("Id");
					var emailSchemaName = "Activity";
					var emailConfig = Terrasoft.configuration.ModuleStructure[emailSchemaName];
					var typeId = this.get(emailConfig.attribute);
					var linkAddURL = [emailConfig.cardModule, "EmailPageV2", "add", emailConfig.attribute, typeId.value];
					if (typeLink === "linkReply") {
						return linkAddURL.join("/") + "/Reply/" + emailId;
					} else if (typeLink === "linkReplyAll") {
						return linkAddURL.join("/") + "/ReplyAll/" + emailId;
					} else if (typeLink === "linkForward") {
						return linkAddURL.join("/") + "/Forward/" + emailId;
					}
				},

				/**
				 * Открыть страницу выбора получателей Email сообщения.
				 * @protected
				 */
				openRecepientLookupEmail: function() {
					var lookup = this.getLookupConfig("Recepient");
					lookup.config.actionsButtonVisible = false;
					LookupUtilities.Open(this.sandbox, lookup.config, lookup.callback, this, null, false, false);
				},
				/**
				 * Изменяет на обратное видимость поля.
				 * @private
				 */
				fieldVisibleToggleClick: function() {
					if (arguments && arguments.length) {
						var tag = arguments[arguments.length - 1];
						this.set(tag, !this.get(tag));
					}
				},

				/**
				 * Открыть модальное окно, которое отображает информацию о шаге БП.
				 */
				showInformationOnStep: function() {
					this.showInformationDialog(this.get("InformationOnStep"));
					return false;
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#addChangeDataViewOptions
				 * @overridden
				 */
				addChangeDataViewOptions: function(viewOptions) {
					this.addSchedulerDataViewOption(viewOptions);
					this.addGridDataViewOption(viewOptions);
					this.callParent(arguments);
				},

				/**
				 * Добавляет пункт "Перейти в расписание" в коллекцию меню кнопки "Вид".
				 * @protected
				 * @param {Object} viewOptions Коллекция пунктов меню.
				 */
				addSchedulerDataViewOption: function(viewOptions) {
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.SchedulerDataViewCaption"},
						"Click": {"bindTo": "changeDataView"},
						"Visible": {"bindTo": "getSchedulerDataViewOptionVisible"},
						"Tag": this.get("SchedulerDataViewName")
					}));
				},

				/**
				 * Добавляет пункт "Перейти в реестр записей" в коллекцию меню кнопки "Вид".
				 * @protected
				 * @param {Object} viewOptions Коллекция пунктов меню.
				 */
				addGridDataViewOption: function(viewOptions) {
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.GridDataViewCaption"},
						"Click": {"bindTo": "changeDataView"},
						"Visible": {"bindTo": "getGridDataViewOptionVisible"},
						"Tag": this.get("GridDataViewName")
					}));
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#addListSettingsOption
				 * @overridden
				 */
				addListSettingsOption: function(viewOptions) {
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.OpenListSettingsCaption"},
						"Click": {"bindTo": "openGridSettings"},
						"Visible": {"bindTo": "getListSettingsOptionVisible"}
					}));
				},

				/**
				 * Возвращает значения по умолчанию, передаваемые в новую запись справочной колонки.
				 * @overridden
				 * @param {String} columnName Имя колонки.
				 * @return {Array} Массив значений по умолчанию.
				 */
				getLookupValuePairs: function(columnName) {
					var valuePairs = [];
					var column = this.getColumnByName(columnName);
					if (!this.Ext.isEmpty(column) && !this.Ext.isEmpty(column.referenceSchemaName) &&
						column.referenceSchemaName === "Contact") {
						var account = this.get("Account");
						if (!this.Ext.isEmpty(account)) {
							valuePairs.push({
								name: "Account",
								value: account.value
							});
						}
					}
					return valuePairs;
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#subscribeDetailEvents
				 */
				subscribeDetailEvents: function(detailConfig, detailName) {
					this.callParent(arguments);
					var detailId = this.getDetailId(detailName);
					this.sandbox.subscribe("GetLookupValuePairs", this.getLookupValuePairs, this, [detailId]);
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "EmailMessageTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.EmailMessageTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "EmailGeneralInfoTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.EmailGeneralInfoTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "EmailAttachingTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": {"bindTo": "Resources.Strings.EmailAttachingTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "send",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.SendEmailAction"},
						"layout": {"column": 6, "row": 0, "colSpan": 2},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"classes": {"textClass": ["actions-button-margin-right"]},
						"click": {
							"bindTo": "checkSenderBeforeSend"
						},
						"visible": {
							"bindTo": "getIsVisibleSendButton"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "reply",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ReplyActionCaption"},
						"layout": {"column": 8, "row": 0, "colSpan": 2},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"classes": {"textClass": ["actions-button-margin-right"]},
						"click": {
							"bindTo": "replyEmail"
						},
						"visible": {
							"bindTo": "getIsVisibleReplyButton"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "replyAll",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ReplyAllActionCaption"},
						"layout": {"column": 10, "row": 0, "colSpan": 2},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"classes": {"textClass": ["actions-button-margin-right"]},
						"click": {
							"bindTo": "replyAllEmail"
						},
						"visible": {
							"bindTo": "getIsVisibleReplyButton"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "forward",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ForwardActionCaption"},
						"layout": {"column": 12, "row": 0, "colSpan": 2},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"click": {
							"bindTo": "forwardEmail"
						},
						"visible": {
							"bindTo": "getIsVisibleForwardButton"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "forwardOUT",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ForwardActionCaption"},
						"layout": {"column": 14, "row": 0, "colSpan": 2},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"click": {
							"bindTo": "forwardEmail"
						},
						"visible": {
							"bindTo": "getIsVisibleForwardOUTButton"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "SenderEnum",
					"values": {
						"layout": {"column": 0, "row": 0, "colSpan": 16},
						"bindTo": "SenderEnum",
						"controlConfig": {
							"className": "Terrasoft.ComboBoxEdit",
							"list": {
								"bindTo": "SenderEnumList"
							},
							"prepareList": {
								"bindTo": "loadSenders"
							}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "SendDate",
					"values": {
						"bindTo": "SendDate",
						"caption": {"bindTo": "Resources.Strings.SendDateCaption"},
						"enabled": false,
						"layout": {"column": 16, "row": 0, "colSpan": 8}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailAttachingTab",
					"propertyName": "items",
					"name": "Files",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Recepient",
					"values": {
						"bindTo": "Recepient",
						"layout": {"column": 0, "row": 1, "colSpan": 22},
						"controlConfig": {
							"className": "Terrasoft.TextEdit",
							"rightIconClasses": ["custom-right-item", "lookup-edit-right-icon"],
							"rightIconClick": {
								"bindTo": "openRecepientLookupEmail"
							}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "ToggleCopyRecipientVisible",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.CC"},
						"layout": {"column": 22, "row": 1, "colSpan": 1},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"click": {"bindTo": "fieldVisibleToggleClick"},
						"tag": "isCopyRecipientVisible"
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "ToggleBlindCopyRecipientVisible",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.BCC"},
						"layout": {"column": 23, "row": 1, "colSpan": 1},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"click": {"bindTo": "fieldVisibleToggleClick"},
						"tag": "isBlindCopyRecipientVisible"
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"name": "CopyRecepient",
					"values": {
						"bindTo": "CopyRecepient",
						"controlConfig": {
							"className": "Terrasoft.TextEdit",
							"rightIconClasses": ["custom-right-item", "lookup-edit-right-icon"],
							"rightIconClick": {"bindTo": "openCopyRecepientLookupEmail"}
						},
						"visible": {"bindTo": "isCopyRecipientVisible"}
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"name": "BlindCopyRecepient",
					"values": {
						"bindTo": "BlindCopyRecepient",
						"controlConfig": {
							"className": "Terrasoft.TextEdit",
							"rightIconClasses": ["custom-right-item", "lookup-edit-right-icon"],
							"rightIconClick": {"bindTo": "openBlindCopyRecepientLookupEmail"}
						},
						"visible": {"bindTo": "isBlindCopyRecipientVisible"}
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderContainer",
					"name": "AdditionalHeaderContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": [],
						"id": "AdditionalHeaderContainer",
						"selectors": {"wrapEl": "#AdditionalHeaderContainer"}
					}
				},
				{
					"operation": "insert",
					"parentName": "AdditionalHeaderContainer",
					"propertyName": "items",
					"name": "AdditionalHeaderBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "AdditionalHeaderBlock",
					"name": "TitleFieldContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": [],
						"id": "TitleFieldContainer",
						"selectors": {"wrapEl": "#TitleFieldContainer"},
						"layout": {"column": 0, "row": 0, "colSpan": 23}
					}
				},
				{
					"operation": "insert",
					"parentName": "AdditionalHeaderBlock",
					"name": "InformationOnStepButtonContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": [],
						"id": "InformationOnStepButtonContainer",
						"selectors": {"wrapEl": "#InformationOnStepButtonContainer"},
						"layout": {"column": 23, "row": 0, "colSpan": 1}
					}
				},
				{
					"operation": "insert",
					"parentName": "TitleFieldContainer",
					"propertyName": "items",
					"name": "Title",
					"values": {
						"bindTo": "Title",
						"caption": {"bindTo": "Resources.Strings.TitleCaption"},
						"markerValue": {"bindTo": "Resources.Strings.TitleCaption"}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailMessageTab",
					"name": "EmailPageMessageTabContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailGeneralInfoTab",
					"name": "EmailPageGeneralInfoTabContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailPageMessageTabContainer",
					"name": "MessageControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailPageGeneralInfoTabContainer",
					"name": "GeneralInfoControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"controlConfig": {
							"collapsed": false
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoControlGroup",
					"propertyName": "items",
					"name": "EmailPageGeneralInfoBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "MessageControlGroup",
					"propertyName": "items",
					"name": "EmailPageMessageBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailPageMessageBlock",
					"propertyName": "items",
					"name": "Body",
					"values": {
						"bindTo": "Body",
						"layout": {"column": 0, "row": 0, "colSpan": 24},
						"contentType": Terrasoft.ContentType.RICH_TEXT,
						"labelConfig": {
							"visible": false
						},
						"controlConfig": {
							"imageLoaded": {
								"bindTo": "onImageLoaded"
							},
							"images": {
								"bindTo": "Images"
							},
							"plainTextMode": {
								"bindTo": "PlainTextMode"
							},
							"defaultFontFamily": "Segoe UI"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailPageGeneralInfoBlock",
					"propertyName": "items",
					"name": "Owner",
					"values": {
						"bindTo": "Owner",
						"layout": {"column": 0, "row": 3, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailPageGeneralInfoBlock",
					"propertyName": "items",
					"name": "Author",
					"values": {
						"bindTo": "Author",
						"layout": {"column": 0, "row": 4, "colSpan": 12},
						"enabled": false
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailPageGeneralInfoBlock",
					"propertyName": "items",
					"name": "Priority",
					"values": {
						"bindTo": "Priority",
						"layout": {"column": 12, "row": 1, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailPageGeneralInfoBlock",
					"propertyName": "items",
					"name": "ShowInScheduler",
					"values": {
						"bindTo": "ShowInScheduler",
						"layout": {"column": 0, "row": 2, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailPageGeneralInfoBlock",
					"propertyName": "items",
					"name": "Status",
					"values": {
						"caption": {"bindTo": "Resources.Strings.EmailSendStatusCaption"},
						"bindTo": "Status",
						"layout": {"column": 12, "row": 0, "colSpan": 12},
						"contentType": "Terrasoft.ContentType.ENUM"
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailPageGeneralInfoBlock",
					"propertyName": "items",
					"name": "StartDate",
					"values": {
						"bindTo": "StartDate",
						"layout": {"column": 0, "row": 0, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailPageGeneralInfoBlock",
					"propertyName": "items",
					"name": "DueDate",
					"values": {
						"bindTo": "DueDate",
						"layout": {"column": 0, "row": 1, "colSpan": 12},
						"controlConfig": {
							"timeEdit": {
								"controlConfig": {
									"prepareList": {
										"bindTo": "loadDueDateList"
									}
								}
							}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailGeneralInfoTab",
					"propertyName": "items",
					"name": "EntityConnections",
					"values": {
						itemType: Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "merge",
					"name": "SaveButton",
					"values": {
						"style": Terrasoft.controls.ButtonEnums.style.BLUE
					}
				}

			]/**SCHEMA_DIFF*/,
			rules: {
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
