define("ActivityPageV2", ["BaseFiltersGenerateModule", "BusinessRuleModule", "ConfigurationConstants",
		"ConfigurationEnums"],
	function(BaseFiltersGenerateModule, BusinessRuleModule, ConfigurationConstants, Enums) {
		return {
			entitySchemaName: "Activity",
			messages: {
				/**
				 * @message GetScheduleItemTitle
				 * Возвращает заголовок активности в режиме быстрого изменения
				 */
				"GetScheduleItemTitle": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			attributes: {
				"Author": {
					"isRequired": true
				},
				"Status": {
					"isRequired": true,
					lookupListConfig: {
						columns: ["Finish"]
					},
					dependencies: [
						{
							columns: ["Status"],
							methodName: "onStatusChanged"
						}
					]
				},
				/**
				 * Дата и время начала активности.
				 */
				"StartDate": {
					dataValueType: this.Terrasoft.DataValueType.DATE_TIME,
					dependencies: [
						{
							columns: ["StartDate"],
							methodName: "clearSeconds"
						},
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
							methodName: "clearSeconds"
						},
						{
							columns: ["DueDate"],
							methodName: "onDueDateChanged"
						}
					]
				},
				"RemindToAuthor": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					dependencies: [
						{
							columns: ["RemindToAuthor"],
							methodName: "onRemindToAuthorChanged"
						}
					]
				},
				"RemindToOwner": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					dependencies: [
						{
							columns: ["RemindToOwner"],
							methodName: "onRemindToOwnerChanged"
						}
					]
				},
				"ActivityCategory": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					dependencies: [
						{
							columns: ["ActivityCategory"],
							methodName: "onActivityCategoryChange"
						}
					]
				},
				"Result": {
					lookupListConfig: {
						filters: [
							function() {
								var type = this.get("ActivityCategory");
								var filterGroup = Ext.create("Terrasoft.FilterGroup");
								filterGroup.add("ActivityCategory",
									Terrasoft.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.EQUAL,
										"[ActivityCategoryResultEntry:ActivityResult].ActivityCategory",
										type.value));
								filterGroup.add("BusinessProcessOnly",
									Terrasoft.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.EQUAL,
										"BusinessProcessOnly",
										0));
								return filterGroup;
							}
						]
					}
				},
				"Owner": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					lookupListConfig: {filter: BaseFiltersGenerateModule.OwnerFilter}
				},
				/**
				 * Название представления "Расписание" раздела Активности.
				 */
				"SchedulerDataViewName": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					value: "SchedulerDataView"
				},
				/**
				 * Список ответственных
				 */
				"Participants": {
					dataValueType: this.Terrasoft.DataValueType.CUSTOM_OBJECT,
					value: null
				}
			},
			details: /**SCHEMA_DETAILS*/{
				Files: {
					schemaName: "FileDetailV2",
					entitySchemaName: "ActivityFile",
					filter: {
						masterColumn: "Id",
						detailColumn: "Activity"
					}
				},
				ActivityParticipant: {
					schemaName: "ActivityParticipantDetailV2",
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
				},
				EmailDetailV2: {
					schemaName: "EmailDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "ActivityConnection"
					},
					filterMethod: "emailDetailFilter"
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
				 * Инициализирует контекстную справку.
				 * @overridden
				 */
				initContextHelp: function() {
					this.set("ContextHelpId", 1010);
					this.callParent(arguments);
				},

				/**
				 * Событие окончания инициализации сущности.
				 * @overridden
				 */
				onEntityInitialized: function() {
					if (this.isAddMode()) {
						this.setDefActivityValues();
					} else {
						this.onDueDateChanged();
					}
					this.callParent(arguments);
					var scheduleItemTitle = this.sandbox.publish("GetScheduleItemTitle");
					if (scheduleItemTitle && this.get("IsSeparateMode") && !this.get("IsProcessMode") &&
						this.get("Operation") !== Enums.CardStateV2.ADD &&
						this.get("Operation") !== Enums.CardStateV2.COPY) {
						this.set("Title", scheduleItemTitle);
					}
				},

				/**
				 * Вызов по цепочке всех валидаторов модели. Останавливается на первой найденной ошибке.
				 * @return {Boolean} Возвращает true при успешном выполнении всех валидаторов.
				 */
				validate: function() {
					var isValid = this.callParent(arguments);
					if (!isValid) {
						return false;
					}
					return this.validateDueDate();
				},

				/**
				 * Фуккция валидации резултата активности
				 * Проверяет флаг IsProcessMode и заполненость поля.
				 * @return {{fullInvalidMessage: string, invalidMessage: string}} Возвращает результат валидации.
				 */
				activityResultValidator: function() {
					var invalidMessage = "";
					if (this.get("IsProcessMode") && this.Ext.isEmpty(this.get("Result"))) {
						invalidMessage = this.get("Resources.Strings.ActivityResultInProcessModeRequire");
					}
					return {
						fullInvalidMessage: invalidMessage,
						invalidMessage: invalidMessage
					};
				},

				/**
				 * Проверяет значение колонки "Завершение".
				 * Выводит сообщение в случае, если дата время "Завершение" больше "Начало".
				 * @private
				 * @return {Boolean} Результат валидации
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
				 * Возвращает признак является ли сущность типом Звонок.
				 * @protected
				 * @return {boolean}
				 */
				isCall: function() {
					return this.get("Type").value === ConfigurationConstants.Activity.Type.Call;
				},

				/**
				 * Открывает страницу редактирования активности по БП.
				 * @protected
				 */
				edit: function() {
					var procElId = this.get("ProcessElementId");
					var recordId = this.get("Id");
					if (procElId && !this.Terrasoft.isEmptyGUID(procElId)) {
						this.sandbox.publish("ProcessExecDataChanged", {
							procElUId: procElId,
							recordId: recordId,
							scope: this,
							parentMethodArguments: null,
							parentMethod: function() {
								return false;
							}
						});
						return true;
					}
					return false;
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
				 * Обработчик события изменения поля Даты начала.
				 * @protected
				 */
				onStartDateChanged: function() {
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
					var startDate = this.Terrasoft.deepClone(this.get("StartDate"));
					var dueDate = this.Terrasoft.deepClone(this.get("DueDate"));
					if (!this.validateDueDate() || !this.Ext.isDate(startDate) || !this.Ext.isDate(dueDate)) {
						return;
					}
					this.setDifferStartDueDate(startDate, dueDate);
				},

				/**
				 * Устанавливает интервал времени.
				 * @param {Date} startDate Дата начала.
				 * @param {Date} dueDate Дата завершения.
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
				 * Обработчик события загрузки списка значений для DueDate
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
				 * Перезаписывает необходимую коллекцию в источник данных для DueDateList
				 * @param {Array} currentList Коллекция c необходимыми данными данными для DueDate.
				 * @param {Terrasoft.core.collections.Collection} dataList Коллекция c текущими данными данными для DueDate.
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
				 * Возвращает стантадртное значение интервала времени в 180000 мс.
				 * @protected
				 */
				getDefaultTimeInterval: function() {
					return this.Terrasoft.TimeScale.THIRTY_MINUTES * this.Terrasoft.DateRate.MILLISECONDS_IN_MINUTE;
				},

				/**
				 * Обработчик события изменения поля Напомнить ответсвенному
				 * @protected
				 */
				onRemindToOwnerChanged: function() {
					var remindToOwner = this.get("RemindToOwner");
					if (remindToOwner) {
						var startDate = this.Terrasoft.deepClone(this.get("StartDate"));
						if (!Ext.isDate(startDate)) {
							return;
						}
						startDate = this.Terrasoft.clearSeconds(startDate);
						this.set("RemindToOwnerDate", startDate);
						this.set("RemindToOwnerDateEnabled", true);
					} else {
						this.set("RemindToOwnerDate", null);
						this.set("RemindToOwnerDateEnabled", false);
					}
				},

				/**
				 * Обработчик события изменения поля Напомнить автору
				 * @protected
				 */
				onRemindToAuthorChanged: function() {
					var remindToOwner = this.get("RemindToAuthor");
					if (remindToOwner) {
						var dueDate = this.Terrasoft.deepClone(this.get("DueDate"));
						if (!this.Ext.isDate(dueDate)) {
							return;
						}
						dueDate = this.Terrasoft.clearSeconds(dueDate);
						this.set("RemindToAuthorDate", dueDate);
						this.set("RemindToAuthorDateEnabled", true);
					} else {
						this.set("RemindToAuthorDate", null);
						this.set("RemindToAuthorDateEnabled", false);
					}
				},

				/**
				 * Обработчик события изменения поля Категория Активности
				 * @protected
				 */
				onActivityCategoryChange: function() {
					var activityCategory = this.get("ActivityCategory");
					if (activityCategory &&
						activityCategory.value === ConfigurationConstants.Activity.ActivityCategory.Meeting) {
						this.set("ShowInScheduler", true);
					}
				},

				/**
				 * Устанавливает значение для поля Категория активности
				 * @virtual
				 */
				setActivityCategory: function() {
					var type = this.get("Type");
					var activity = ConfigurationConstants.Activity;
					var activityCategory = activity.ActivityCategory;
					var category = (type.value === activity.Type.Task)
						? activityCategory.DoIt
						: activityCategory.Call;
					this.loadLookupDisplayValue("ActivityCategory", category);
				},

				/**
				 * Устанавливает значения по умолчанию для полей Активности.
				 * @protected
				 */
				setDefActivityValues: function() {
					this.setActivityCategory();
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
					var currentViewName = this.sandbox.publish("GetActiveViewName");
					this.set("ShowInScheduler", (currentViewName === "SchedulerDataView"));
					this.clearSeconds(null, "StartDate");
					this.clearSeconds(null, "DueDate");
				},

				/**
				 * Обработчик события изменения поля Статус.
				 * @protected
				 */
				onStatusChanged: function() {
					var status = this.get("Status");
					if (status && status.Finish === false) {
						this.set("Result", null);
						this.set("DetailedResult", null);
					}
				},

				/**
				 * Обработчик события нажатия на результирующую кнопку по процессу.
				 * @param {Object} event Объект события.
				 * @param {Object} dom Элемент разметки.
				 * @param {Object} options Опции.
				 * @param {Object} tag Тег нажатой кнопки.
				 */
				resultButtonClick: function(event, dom, options, tag) {
					this.set("Status", tag.status);
					this.set("Result", tag.result);
					this.set("ResultSelected", true);
				},

				/**
				 * Обработчик события нажатия на кнопку Отмена из группы Результат.
				 */
				resultCancelButtonClick: function() {
					this.set("Status", null);
					this.set("Result", null);
					this.set("DetailedResult", null);
					this.set("ResultSelected", false);
				},

				/**
				 * Возвращает значение свойства "Видимость" для расширенного блока полей "Результат".
				 * @param {Boolean} allowedResult Список доступных результатов для выбора.
				 * @return {Boolean} Значение свойства "Видимость" для расширенного блока полей "Результат".
				 */
				getIsCustomResultVisible: function(allowedResult) {
					return !this.Ext.isEmpty(allowedResult);
				},

				/**
				 * Открыть модальное окно, которое отображает информацию о шаге БП.
				 */
				showInformationOnStep: function() {
					this.showInformationDialog(this.get("InformationOnStep"));
					return false;
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
							isInChain: args.isInChain || true
						};
						this.sandbox.publish("ReloadGridAfterAdd", config);
					}
				},

				/**
				 * Вызывет родительский метод onSave.
				 * @private
				 */
				callParentOnSave: function() {
					this.set("callParentOnSave", true);
					this.save(this.get("ParentOnSaveArguments"));
				},

				/**
				 * Спрашивает об необходимости добавления
				 * выбранных ответственных в участники.
				 * @private
				 */
				askAddedParticipants: function() {
					this.showConfirmationDialog(this.get("Resources.Strings.InsertParticipantsMessage"),
						function(returnCode) {
							if (returnCode === this.Terrasoft.MessageBoxButtons.NO.returnCode) {
								this.set("Participants", null);
							}
							this.callParentOnSave();
						},
						[this.Terrasoft.MessageBoxButtons.YES.returnCode,
							this.Terrasoft.MessageBoxButtons.NO.returnCode],
						null);
				},

				/**
				 * Сохраняет объект.
				 * @overridden
				 */
				save: function() {
					if (this.get("callParentOnSave")) {
						this.callParent(arguments);
					} else {
						if (this.isEditMode() || Ext.isEmpty(this.get("Participants"))) {
							this.callParent(arguments);
						} else {
							this.set("ParentOnSaveArguments", arguments);
							this.askAddedParticipants();
						}
					}
				},

				/*
				 * Возвращает запрос на добавление учасника активности.
				 * @param {Object} args идентификатор активности и выбранный в справочнике контакт {ActivityId, value}
				 * @private
				 * */
				getParticipantInsertQuery: function(item) {
					var roleId = ConfigurationConstants.Activity.ParticipantRole.Participant;
					var activityId = this.get("Id");
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "ActivityParticipant"
					});
					insert.setParameterValue("Activity", activityId, this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Participant", item, this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Role", roleId, this.Terrasoft.DataValueType.GUID);
					return insert;
				},

				/*
				 * Выполняет запросы на добавление участников активности.
				 * @private
				 */
				insertParticipants: function() {
					var participants = this.get("Participants");
					if (participants) {
						var bq = Ext.create("Terrasoft.BatchQuery");
						participants.forEach(function(item) {
							bq.add(this.getParticipantInsertQuery(item.value));
						}, this);
						if (bq.queries.length) {
							bq.execute();
						}
					}
				},

				/*
				 * В случае наличия Participants добавляет участников активности,
				 * вызывает родительский метод onSaved и обновляет деталь участников активности.
				 * @private
				 */
				onSavedActivity: function(response, config) {
					config = (config && config.length === 1) ? config[0] : (config || {});
					config.callParent = true;
					this.insertParticipants();
					this.onSaved(response, config);
					this.updateDetail({detail: "ActivityParticipant"});
				},

				/**
				 * @inheritdoc Terrasoft.BasePageV2#onSaved
				 * @overridden
				 */
				onSaved: function(response, config) {
					if (config && config.callParent === true) {
						this.callParent(arguments);
					} else if (this.isCopyMode()) {
						var requestConfig = {
							serviceName: "EntityUtilsService",
							methodName: "CopyEntities",
							data: {
								sourceEntityId: this.get("SourceEntityPrimaryColumnValue"),
								recipientEntityId: this.get("Id"),
								columnName: "Activity",
								entitySchemaName: "Activity",
								sourceEntitySchemaNames: ["ActivityParticipant"]
							}
						};
						this.callService(requestConfig, function() {
							this.onSavedActivity(response, config);
						}, this);
					} else {
						this.onSavedActivity(response, config);
					}
				},

				/**
				 * Возвращает признак видимости поля Категория в зависимости от Типа активности.
				 * @param {Object} value Тип активности.
				 * @return {boolean} Признак видимости поля Категория в зависимости от Типа активности.
				 */
				getVisibleCategoryByType: function(value) {
					return (value && (value.value === ConfigurationConstants.Activity.Type.Task));
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
				 * Функция создания фильтров детали email.
				 * @protected
				 * @return {createFilterGroup}
				 */
				emailDetailFilter: function() {
					var recordId = this.get("Id");
					var filterGroup = new this.Terrasoft.createFilterGroup();
					filterGroup.add("ActivityConnectionNotNull", this.Terrasoft.createColumnIsNotNullFilter("ActivityConnection"));
					filterGroup.add("ActivityConnection", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "ActivityConnection", recordId));
					filterGroup.add("ActivityType", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Type", ConfigurationConstants.Activity.Type.Email));
					return filterGroup;
				},

				/**
				 * Возвращает значения по умолчанию, передаваемые в новую запись справочной колонки.
				 * @param {string} columnName Имя колонки.
				 * @overridden
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
					"parentName": "Tabs",
					"propertyName": "tabs",
					"name": "GeneralInfoTab",
					"values": {
						"caption": {"bindTo": "Resources.Strings.GeneralInfoTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"name": "ActivityParticipantTab",
					"values": {
						"caption": {"bindTo": "Resources.Strings.ActivityParticipantTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "ActivityParticipantTab",
					"propertyName": "items",
					"name": "ActivityParticipant",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"name": "ActivityFileNotesTab",
					"values": {
						"caption": {"bindTo": "Resources.Strings.ActivityFileNotesTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"name": "EmailTab",
					"values": {
						"caption": {"bindTo": "Resources.Strings.EmailTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "EmailTab",
					"propertyName": "items",
					"name": "EmailDetailV2",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"name": "TitleInformationContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": [],
						"layout": {"column": 0, "row": 0, "colSpan": 23, "rowSpan": 1},
						"id": "TitleInformationContainer",
						"selectors": {"wrapEl": "#TitleInformationContainer"}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"name": "InformationOnStepButtonContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": [],
						"layout": {"column": 23, "row": 0, "colSpan": 1, "rowSpan": 1},
						"id": "InformationOnStepButtonContainer",
						"selectors": {"wrapEl": "#InformationOnStepButtonContainer"}
					}
				},
				{
					"operation": "insert",
					"parentName": "TitleInformationContainer",
					"propertyName": "items",
					"name": "Title",
					"values": {
						"bindTo": "Title",
						"contentType": Terrasoft.ContentType.LONG_TEXT
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "StartDate",
					"values": {
						"bindTo": "StartDate",
						"layout": {"column": 0, "row": 1, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Owner",
					"values": {
						"bindTo": "Owner",
						"layout": {"column": 12, "row": 1, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "DueDate",
					"values": {
						"bindTo": "DueDate",
						"layout": {"column": 0, "row": 2, "colSpan": 12},
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
					"parentName": "Header",
					"propertyName": "items",
					"name": "Status",
					"values": {
						"bindTo": "Status",
						"layout": {"column": 0, "row": 3, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM

					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Author",
					"values": {
						"bindTo": "Author",
						"layout": {"column": 12, "row": 2, "colSpan": 12},
						"enabled": false
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoTab",
					"name": "ResultControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.ResultControlGroupCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "ResultControlGroup",
					"propertyName": "items",
					"name": "CustomResultControlBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": [],
						"visible": {
							"bindTo": "AllowedResult",
							"bindConfig": {
								"converter": "getIsCustomResultVisible"
							}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ResultControlGroup",
					"propertyName": "items",
					"name": "CustomSelectedResultControlBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": [],
						"visible": {
							"bindTo": "ResultSelected"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ResultControlGroup",
					"propertyName": "items",
					"name": "CustomActionSelectedResultControlBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": [],
						"visible": {
							"bindTo": "ResultSelected"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ResultControlGroup",
					"propertyName": "items",
					"name": "ResultControlBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoTab",
					"propertyName": "items",
					"name": "EntityConnections",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "ActivityCategory",
					"values": {
						"bindTo": "ActivityCategory",
						"layout": {"column": 12, "row": 4, "colSpan": 12},
						"visible": {
							"bindTo": "Type",
							"bindConfig": {
								"converter": "getVisibleCategoryByType"
							}
						},
						"contentType": Terrasoft.ContentType.ENUM

					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Priority",
					"values": {
						"bindTo": "Priority",
						"layout": {"column": 12, "row": 3, "colSpan": 12},
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "ShowInScheduler",
					"values": {
						"bindTo": "ShowInScheduler",
						"layout": {"column": 0, "row": 4, "colSpan": 12}
					}
				},
				{
					"operation": "insert",
					"parentName": "ResultControlBlock",
					"propertyName": "items",
					"name": "Result",
					"values": {
						"bindTo": "Result",
						"layout": {"column": 0, "row": 0, "colSpan": 24},
						"contentType": Terrasoft.ContentType.ENUM
					}
				},
				{
					"operation": "insert",
					"parentName": "ResultControlBlock",
					"propertyName": "items",
					"name": "DetailedResult",
					"values": {
						"bindTo": "DetailedResult",
						"layout": {"column": 0, "row": 1, "colSpan": 24, "rowSpan": 3},
						"contentType": Terrasoft.ContentType.LONG_TEXT
					}
				},
				{
					"operation": "insert",
					"parentName": "CustomSelectedResultControlBlock",
					"propertyName": "items",
					"name": "CustomDetailedResult",
					"values": {
						"bindTo": "DetailedResult",
						"layout": {"column": 0, "row": 0, "colSpan": 12, "rowSpan": 3},
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"labelWrapConfig": {
							"classes": {
								"wrapClassName": "justify-top"
							}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CustomActionSelectedResultControlBlock",
					"propertyName": "items",
					"name": "CustomActionSelectedResultControlGroup",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"layout": {"column": 0, "row": 0, "colSpan": 24},
						"items": [],
						"visible": {
							"bindTo": "ResultSelected"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CustomActionSelectedResultControlGroup",
					"propertyName": "items",
					"name": "ResultSaveButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "save"},
						"caption": {"bindTo": "Resources.Strings.SaveButtonCaption"},
						"style": Terrasoft.controls.ButtonEnums.style.BLUE
					}
				},
				{
					"operation": "insert",
					"parentName": "CustomActionSelectedResultControlGroup",
					"propertyName": "items",
					"name": "ResultCancelButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "resultCancelButtonClick"},
						"caption": {"bindTo": "Resources.Strings.CancelButtonCaption"}
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoTab",
					"name": "RemindControlGroup",
					"propertyName": "items",

					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.RemindControlGroupCaption"},
						"controlConfig": {},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "RemindControlGroup",
					"propertyName": "items",
					"name": "RemindControlBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "RemindControlBlock",
					"propertyName": "items",
					"name": "RemindToOwner",
					"values": {
						"bindTo": "RemindToOwner",
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"labelConfig": {
							"caption": {"bindTo": "Resources.Strings.RemindToOwnerCaption"}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "RemindControlBlock",
					"propertyName": "items",
					"name": "RemindToOwnerDate",
					"values": {
						"bindTo": "RemindToOwnerDate",
						"layout": {"column": 12, "row": 0, "colSpan": 12},
						"enabled": {"bindTo": "RemindToOwnerDateEnabled"},
						"labelConfig": {
							"caption": {"bindTo": "Resources.Strings.RemindDateCaption"}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "RemindControlBlock",
					"propertyName": "items",
					"name": "RemindToAuthor",
					"values": {
						"bindTo": "RemindToAuthor",
						"layout": {"column": 0, "row": 1, "colSpan": 12},
						"labelConfig": {
							"caption": {"bindTo": "Resources.Strings.RemindToAuthorCaption"}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "RemindControlBlock",
					"propertyName": "items",
					"name": "RemindToAuthorDate",
					"values": {
						"bindTo": "RemindToAuthorDate",
						"layout": {
							"column": 12,
							"row": 1,
							"colSpan": 12
						},
						"enabled": {"bindTo": "RemindToAuthorDateEnabled"},
						"labelConfig": {
							"caption": {"bindTo": "Resources.Strings.RemindDateCaption"}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ActivityFileNotesTab",
					"propertyName": "items",
					"name": "Files",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"name": "ActivityNotesControlGroup",
					"parentName": "ActivityFileNotesTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"caption": {"bindTo": "Resources.Strings.NotesGroupCaption"}
					}
				},
				{
					"operation": "insert",
					"parentName": "ActivityNotesControlGroup",
					"propertyName": "items",
					"name": "Notes",
					"values": {
						"contentType": Terrasoft.ContentType.RICH_TEXT,
						"layout": {"column": 0, "row": 0, "colSpan": 24},
						"labelConfig": {
							"visible": false
						},
						"controlConfig": {
							"imageLoaded": {
								"bindTo": "insertImagesToNotes"
							},
							"images": {
								"bindTo": "NotesImagesCollection"
							}
						}
					}
				}
			]/**SCHEMA_DIFF*/,
			rules: {
				"ActivityCategory": {
					"BindParameterVisibleActivityCategoryToType": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.VISIBLE,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "Type"
								},
								"comparisonType": Terrasoft.ComparisonType.EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": "fbe0acdc-cfc0-df11-b00f-001d60e938c6"
								}
							}
						]
					},
					"FiltrationActivityCategoryByActivityType": {
						"ruleType": BusinessRuleModule.enums.RuleType.FILTRATION,
						"baseAttributePatch": "ActivityType",
						"comparisonType": Terrasoft.ComparisonType.EQUAL,
						"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
						"attribute": "Type"
					}
				},
				"Result": {
					"BindParameterEnabledResultToStatus": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "Status",
									"attributePath": "Finish"
								},
								"comparisonType": Terrasoft.ComparisonType.EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": true
								}
							}
						]
					},
					"BindParameterRequiredResultToStatus": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.REQUIRED,
						"logical": Terrasoft.LogicalOperatorType.AND,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "Status",
									"attributePath": "Finish"
								},
								"comparisonType": Terrasoft.ComparisonType.EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": true
								}
							},
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "IsProcessMode"
								},
								"comparisonType": Terrasoft.ComparisonType.EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": true
								}
							}
						]
					}
				},
				"DetailedResult": {
					"BindParameterEnabledDetailedResultToStatus": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "Status",
									"attributePath": "Finish"
								},
								"comparisonType": Terrasoft.ComparisonType.EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": true
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
