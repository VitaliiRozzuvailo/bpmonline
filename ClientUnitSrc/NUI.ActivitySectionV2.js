define("ActivitySectionV2", ["BaseFiltersGenerateModule", "ConfigurationConstants", "GoogleIntegrationUtilities",
		"ConfigurationEnums", "ProcessModuleUtilities", "ActivitySectionGridRowViewModel", "css!ActivitySectionCSS"],
	function(BaseFiltersGenerateModule, ConfigurationConstants, GoogleUtilities, ConfigurationEnums,
			ProcessModuleUtilities) {
		return {
			/**
			 *
			 */
			entitySchemaName: "Activity",
			attributes: {
				/**
				 * Коллекция пунктов меню интервалов времени расписания.
				 */
				IntervalMenuItems: {dataValueType: this.Terrasoft.DataValueType.COLLECTION},

				/**
				 * Коллекция элементов расписания.
				 */
				ScheduleGridData: {dataValueType: this.Terrasoft.DataValueType.COLLECTION},

				/**
				 * Название представления "Расписание".
				 */
				"SchedulerDataViewName": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					value: "SchedulerDataView"
				},

				/**
				 * Объект, содержащий значения начальной и конечной даты выделеной области.
				 */
				SchedulerSelection: {
					dataValueType: this.Terrasoft.DataValueType.CUSTOM_OBJECT,
					value: null
				},

				/**
				 * Коллекция моделей всплывающих окон расписания.
				 */
				SchedulerFloatItemsCollection: {dataValueType: this.Terrasoft.DataValueType.COLLECTION},

				/**
				 * Вводимые пользователем символы.
				 */
				GetSchedulerSelectionPressedKeys: {
					dataValue: this.Terrasoft.DataValueType.TEXT,
					value: ""
				},

				/**
				 * Количество загруженных страниц в расписание.
				 */
				"SchedulePageCount": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					value: 0
				},

				/**
				 * Количество записей на странице в расписании. Инициируется системной настройкой.
				 */
				"SchedulerItemsAmountPerPage": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER
				},
				"canUseSyncFeaturesByBuildType": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					value: false
				}
			},
			messages: {
				/**
				 * @message GetIsVisibleEmailPageButtons
				 * Определяет видимость кнопки открытия страницы Email.
				 * @param {Object} Значение свойства, которые отвечают за видимость кнопки.
				 */
				"GetIsVisibleEmailPageButtons": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				"OpenItem": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message ProcessExecDataChanged
				 * Определяет что нужно передать данные выполнения процесса.
				 * @param {Object}
				 * procElUId: идентификатор элемента процесса,
				 * recordId: идентификатор записи,
				 * scope: контекст,
				 * parentMethodArguments: агументы для родительского метода,
				 * parentMethod: родительский метод.
				 */
				"ProcessExecDataChanged": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetFixedFilter
				 * Сообщает значение FixedFilter.
				 * @param {String} Название фильтра.
				 * @return {Object} Фильтр.
				 */
				"GetFixedFilter": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetSimpleTaskAddViewModel
				 * Запрашивает формирование модели окна быстрого добавления задачи.
				 */
				"GetSimpleTaskAddViewModel": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message SimpleTaskViewModelCreated
				 * Получает сформированную модели окна быстрого добавления задачи.
				 */
				"SimpleTaskViewModelCreated": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message RenderSimpleTaskAddView
				 * Инициирует отрисовку окна быстрого добавления задачи.
				 * @param {Object}
				 * renderTo: идентификатор контейнера для отрисовки,
				 * viewModel: модель окна быстрого добавления задачи.
				 */
				"RenderSimpleTaskAddView": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message RemoveViewModel
				 * Ожидает сообщение об удалении модели окна быстрого добавления задачи из коллекции расписания.
				 */
				"RemoveViewModel": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetEnteredKeys
				 * Возвращает введенные пользователем символы при быстром добавлении задачи после выделения.
				 * @return {String} Строка введенных символов.
				 */
				"GetSchedulerSelectionPressedKeys": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message ReloadGridAfterAdd
				 * Обновляет реестр при добавленнии записи.
				 */
				"ReloadGridAfterAdd": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			methods: {
				/**
				 * Иницализирует начальные значения раздела.
				 * @overridden
				 */
				init: function(callback, scope) {
					this.set("SelectedRows", []);
					this.initFiltersUpdateDelay();
					this.registerGetIsVisibleEmailPageButtonsHandler();
					this.initScheduleGridData();
					this.initSchedulerFloatItemsCollection();
					this.initSchedulerTimeScaleLookupValue();
					this.initMailBoxSyncSettings();
					this.initFixedFiltersConfig();
					this.initIntervalMenuItems();
					this.callParent([function() {
						this.initSchedulerItemsAmountPerPage(function() {
							callback.call(scope);
						}.bind(this));
					}, this]);
					var sysSettings = ["BuildType"];
					Terrasoft.SysSettings.querySysSettings(sysSettings, function() {
						var buildType = Terrasoft.SysSettings.cachedSettings.BuildType &&
							Terrasoft.SysSettings.cachedSettings.BuildType.value;
						this.set("canUseSyncFeaturesByBuildType", buildType !==
						ConfigurationConstants.BuildType.Public);
					}, this);
					this.initGoogleCalendarLog();
				},

				/**
				 * Инициализирует значение количества записей на странице в расписании.
				 */
				initSchedulerItemsAmountPerPage: function(callback) {
					this.Terrasoft.SysSettings.querySysSettingsItem("SchedulerItemsAmountPerPage", function(value) {
						if (!value || value < 1) {
							value = this.get("RowCount");
						}
						this.set("SchedulerItemsAmountPerPage", value);
						if (callback) {
							callback();
						}
					}, this);
				},

				/**
				 * Инициализирует коллекцию данных представления рееестра.
				 * @protected
				 */
				initScheduleGridData: function() {
					this.set("ScheduleGridData", this.Ext.create("Terrasoft.BaseViewModelCollection"));

				},

				/**
				 * Инициализирует коллекцию данных представления рееестра.
				 * @protected
				 */
				initSchedulerFloatItemsCollection: function() {
					this.set("SchedulerFloatItemsCollection", this.Ext.create("Terrasoft.BaseViewModelCollection"));
				},

				/**
				 * Инициализирует значение временного интервала в расписании.
				 * @protected
				 */
				initSchedulerTimeScaleLookupValue: function() {
					var profile = this.get("Profile");
					this.set("SchedulerTimeScaleLookupValue", {
						value: (profile && profile.schedulerTimeScaleLookupValue) ||
						this.Terrasoft.TimeScale.THIRTY_MINUTES
					});
				},

				/**
				 * Получает коллекцию реестра.
				 * @override
				 * @protected
				 * @return {Collection}
				 */
				getGridData: function() {
					if (this.isNotSchedulerDataView()) {
						return this.get("GridData");
					} else {
						return this.get("ScheduleGridData");
					}
				},

				/**
				 * Устанавливает идентификатор контекстной справки.
				 * @protected
				 */
				initContextHelp: function() {
					this.set("ContextHelpId", 1010);
					this.callParent(arguments);
				},

				/**
				 * Возвращает колонки, которые всегда выбираются запросом.
				 * @protected
				 * @overridden
				 * @return {Object} Возвращает массив объектов-конфигураций колонок.
				 */
				getGridDataColumns: function() {
					var baseGridDataColumns = this.callParent(arguments);
					var gridDataColumns = {
						"Account": {path: "Account"},
						"StartDate": {path: "StartDate"},
						"DueDate": {path: "DueDate"},
						"ShowInScheduler": {path: "ShowInScheduler"},
						"Status": {path: "Status"},
						"Status.Finish": {path: "Status.Finish"},
						"ProcessElementId": {
							path: "ProcessElementId",
							dataValueType: 0
						}
					};
					return Ext.apply(baseGridDataColumns, gridDataColumns);
				},

				/**
				 * Возвращает значение видимости для действия множественный выбор.
				 * @overridden
				 * @return {boolean} Видимость пункта меню.
				 */
				isMultiSelectVisible: function() {
					return (!this.get("MultiSelect") && this.isNotSchedulerDataView());
				},

				/**
				 * Возвращает значение видимости для действия отменить множественный выбор.
				 * @return {boolean} Видимость пункта меню.
				 */
				isSingleSelectVisible: function() {
					return this.get("MultiSelect") && this.isNotSchedulerDataView();
				},

				/**
				 * Возвращает значение видимости для действия снять все выделения.
				 * @return {boolean} Видимость пункта меню.
				 */
				isUnSelectVisible: function() {
					return this.isAnySelected() && this.isNotSchedulerDataView();
				},

				/**
				 * Устанавливает значение видимости для действия поместить в группу.
				 */
				setAddFolderActionVisible: function() {
					this.set("IsIncludeInFolderButtonVisible", this.isNotSchedulerDataView());
				},

				/**
				 * Проверяет, видима ли кнопка Исключить из группы в меню кнопки действий.
				 * @protected
				 * @return {Boolean} Результат проверки.
				 */
				isExcludeFromFolderButtonVisible: function() {
					var currentFolder = this.get("CurrentFolder");
					var visible = currentFolder ?
						(currentFolder.folderType.value === ConfigurationConstants.Folder.Type.General) :
						false;
					return visible && this.isNotSchedulerDataView();
				},

				/**
				 * Возвращает коллекцию действий раздела в режиме отображения реестра.
				 * @protected
				 * @overridden
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий раздела в режиме
				 * отображения реестра.
				 */
				getSectionActions: function() {
					var actionMenuItems = this.callParent(arguments);
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Visible": {"bindTo": "isNotSchedulerDataView"},
						Type: "Terrasoft.MenuSeparator",
						Caption: ""
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.OpenGoogleSettingsPage"},
						Click: {"bindTo": "openGoogleSettingsPage"},
						"Visible": {"bindTo": "canUseSyncFeaturesByBuildType"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.SynchronizeWithGoogleCalendarAction"},
						Click: {"bindTo": "synchronizeWithGoogleCalendar"},
						"Visible": {"bindTo": "canUseSyncFeaturesByBuildType"}
					}));
					return actionMenuItems;
				},

				/**
				 * Проверяет наличие настроек синхронизации с почтовыми ящиками
				 * и устанавливает соответствующее свойство модели.
				 * @protected
				 */
				initMailBoxSyncSettings: function() {
					this.set("isMailboxSyncExist", false);
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "MailboxSyncSettings"
					});
					esq.addColumn("Id");
					var filter = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"SysAdminUnit", this.Terrasoft.SysValue.CURRENT_USER.value);
					esq.filters.addItem(filter);
					esq.getEntityCollection(function(response) {
						if (response.success) {
							this.set("isMailboxSyncExist", (response.collection.getCount() > 0));
						}
					}, this);
				},

				/**
				 * Делает активным указанное представление. Инициирует его загрузку.
				 * Все остальные представления скрываются.
				 * @protected
				 * @overridden
				 */
				setActiveView: function() {
					this.set("IsGridEmpty", false);
					this.callParent(arguments);
					this.setAddFolderActionVisible();
					if (this.isSchedulerDataView()) {
						this.showBodyMask();
					}
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#loadGridDataView
				 * @overridden
				 */
				loadGridDataView: function(loadData) {
					var refreshData = loadData;
					loadData = false;
					this.callParent(arguments);
					if (refreshData === true) {
						this.refreshGridData();
					}
				},

				/**
				 * Инициализирует фиксированные фильтры.
				 * @protected
				 */
				initFixedFiltersConfig: function() {
					var fixedFilterConfig = {
						entitySchema: this.entitySchema,
						filters: [
							{
								name: "PeriodFilter",
								caption: this.get("Resources.Strings.PeriodFilterCaption"),
								dataValueType: this.Terrasoft.DataValueType.DATE,
								startDate: {
									columnName: "StartDate",
									defValue: this.Terrasoft.startOfWeek(new Date())
								},
								dueDate: {
									columnName: "DueDate",
									defValue: this.Terrasoft.endOfWeek(new Date())
								}
							},
							{
								name: "Owner",
								caption: this.get("Resources.Strings.OwnerFilterCaption"),
								columnName: "Owner",
								defValue: this.Terrasoft.SysValue.CURRENT_USER_CONTACT,
								dataValueType: this.Terrasoft.DataValueType.LOOKUP,
								filter: BaseFiltersGenerateModule.OwnerFilter,
								appendFilter: function(filterInfo) {
									var filter;
									if (filterInfo.value && filterInfo.value.length > 0) {
										filter = Terrasoft.createColumnInFilterWithParameters(
											"[ActivityParticipant:Activity].Participant",
											filterInfo.value);
									}
									return filter;
								}
							}
						]
					};
					this.set("FixedFilterConfig", fixedFilterConfig);
				},

				/**
				 * Регистрирует подписчиков.
				 * @protected
				 */
				registerGetIsVisibleEmailPageButtonsHandler: function() {
					this.sandbox.subscribe("GetIsVisibleEmailPageButtons", function(config) {
						this.set(config.key, config.value);
					}, this);
				},

				/**
				 * Получает представления по умолчанию.
				 * @protected
				 * @return {Object}
				 */
				getDefaultDataViews: function() {
					var baseDataViews = this.callParent();
					baseDataViews.SchedulerDataView = {
						index: 0,
						name: "SchedulerDataView",
						caption: this.get("Resources.Strings.SchedulerHeader"),
						icon: this.get("Resources.Images.SchedulerDataViewIcon")
					};
					baseDataViews.GridDataView.index = 1;
					baseDataViews.AnalyticsDataView.index = 2;
					return baseDataViews;
				},

				/**
				 * Обновляет фильтрацию в разделе.
				 * @protected
				 * @overridden
				 */
				onFilterUpdate: function() {
					this.callParent(arguments);
					var quickFilterModuleId = this.getQuickFilterModuleId();
					var filters = this.sandbox.publish("GetFixedFilter", {filterName: "PeriodFilter"},
						[quickFilterModuleId]);
					if (!filters || !filters.startDate || !filters.dueDate) {
						filters = {
							startDate: new Date(),
							dueDate: new Date()
						};
					}
					if (this.isSchedulerDataView()) {
						this.set("SchedulePageCount", 0);
					}
					this.set("SchedulerStartDate", filters.startDate);
					this.set("SchedulerDueDate", filters.dueDate);
				},

				/**
				 * Загружает представление расписания.
				 * @protected
				 * @param {Boolean} loadData Флаг загрузки данных.
				 */
				loadSchedulerDataView: function(loadData) {
					this.initSchedulerTimeScaleLookupValue();
					this.set("IsActionButtonsContainerVisible", true);
					this.set("IsAnalyticsActionButtonsContainerVisible", false);
					this.set("IsClearGridData", true);
					this.set("ActiveRow", null);
					this.set("SelectedRows", []);
					this.set("SchedulePageCount", 0);
					if (loadData === false) {
						return;
					}
					this.loadGridData();
				},

				/**
				 * Возвращает список фильтров, примененных в разделе.
				 * @protected
				 * @overridden
				 */
				getFilters: function() {
					var filters = this.callParent(arguments);
					var fixedFilters = filters.contains("FixedFilters")
						? filters.get("FixedFilters")
						: null;
					if (!this.Ext.isEmpty(fixedFilters) && fixedFilters.contains("Owner")) {
						var ownerFilters = fixedFilters.get("Owner");
						if (ownerFilters.contains("OwnerDefaultFilter")) {
							ownerFilters.removeByKey("OwnerDefaultFilter");
						}
					}
					if (this.isSchedulerDataView()) {
						if (!filters.contains("ShowInSchedulerFilter")) {
							filters.add("ShowInSchedulerFilter", this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "ShowInScheduler", true));
						}
						if (!fixedFilters) {
							fixedFilters = this.Terrasoft.createFilterGroup();
							fixedFilters.logicalOperation = Terrasoft.LogicalOperatorType.AND;
							filters.add("FixedFilters", fixedFilters);
						}
						var hasPeriodFilters = fixedFilters.contains("PeriodFilter");
						var periodFilter = hasPeriodFilters ? fixedFilters.get("PeriodFilter") : null;
						if (!hasPeriodFilters || (periodFilter && !(periodFilter instanceof Terrasoft.Collection))) {
							this.setDateFiltersCurrentDate(fixedFilters);
						}
					}
					if (this.isNotSchedulerDataView() &&
						filters.contains("ShowInSchedulerFilter")) {
						filters.removeByKey("ShowInSchedulerFilter");
					}

					filters.add("NotEmailFilter", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.NOT_EQUAL, "Type", ConfigurationConstants.Activity.Type.Email
					));

					return filters;
				},

				/**
				 * Устанавливает фиксированые фильтры по периоду для фильтрации по текущей дате.
				 * @private
				 * @param {Object} fixedFilters Группа фиксированых фильтров.
				 */
				setDateFiltersCurrentDate: function(fixedFilters) {
					var now = new Date();
					var periodFilter = this.Terrasoft.createFilterGroup();
					periodFilter.logicalOperation = Terrasoft.LogicalOperatorType.AND;
					periodFilter.add("DueDate", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.GREATER_OR_EQUAL, "DueDate",
						this.Terrasoft.startOfDay(now)));
					periodFilter.add("StartDate", this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.LESS_OR_EQUAL, "StartDate",
						this.Terrasoft.endOfDay(now)));
					if (fixedFilters.contains("PeriodFilter")) {
						fixedFilters.removeByKey("PeriodFilter");
					}
					fixedFilters.add("PeriodFilter", periodFilter);
				},

				/**
				 * Инициализирует коллекцию возможных при работе с расписанием временных интервалов.
				 * @protected
				 */
				initIntervalMenuItems: function() {
					var terrasoft = this.Terrasoft;
					this.set("IntervalMenuItems", this.Ext.create("Terrasoft.BaseViewModelCollection"));
					var intervalMenuItems = this.get("IntervalMenuItems");
					var timeScaleFormat = this.get("Resources.Strings.IntervalFormat");
					terrasoft.each(terrasoft.TimeScale, function(value) {
						intervalMenuItems.addItem(this.getButtonMenuItem({
							"Caption": timeScaleFormat.replace("#interval#", value),
							"Click": {bindTo: "changeInterval"},
							"Tag": value
						}));
					}, this);
				},

				/**
				 * Изменяет значение шкалы времени элемента управления расписание.
				 * @protected
				 * @param {Terrasoft.TimeScale} value Значение шкалы времени.
				 */
				changeInterval: function(value) {
					var profile = this.get("Profile");
					if (profile) {
						profile.schedulerTimeScaleLookupValue = value;
						this.Terrasoft.utils.saveUserProfile(this.getProfileKey(), profile, false);
					}
					this.set("SchedulerTimeScaleLookupValue", {value: value});
				},

				/**
				 * Получает значение шкалы времени элемента управления расписание.
				 * @protected
				 * @return {Object} Текущее значение шкалы времени.
				 */
				getTimeScale: function() {
					var schedulerTimeScaleLookupValue = this.get("SchedulerTimeScaleLookupValue");
					return (schedulerTimeScaleLookupValue && schedulerTimeScaleLookupValue.value);
				},

				/**
				 * Получает период элемента управления расписание.
				 * @protected
				 * @return {Object} Элемента управления расписание.
				 */
				getSchedulerPeriod: function() {
					var startDate = this.get("SchedulerStartDate") || new Date();
					var dueDate = this.get("SchedulerDueDate") || new Date();
					var clearDueDate = this.Ext.Date.clearTime(dueDate);
					var clearStartDate = this.Ext.Date.clearTime(startDate);
					var selectedPeriod = clearDueDate - clearStartDate;
					if (selectedPeriod < 0) {
						startDate = dueDate;
					}
					return {
						startDate: startDate,
						dueDate: dueDate
					};
				},

				/**
				 * Обрабатывает событие изменения элемента расписания.
				 * @protected
				 */
				changeScheduleItem: Terrasoft.emptyFn,

				/**
				 * Получает признак, включены ли кнопки расписания.
				 * @protected
				 * @return {Boolean} Активность кнопки расписания.
				 */
				getSchedulerButtonsEnabled: function() {
					var selectedValues = this.get("SelectedRows");
					return selectedValues && (selectedValues.length > 0);
				},

				/**
				 * Обновляет реестр.
				 * @protected
				 */
				refreshGridData: function() {
					var gridData = this.getGridData();
					if (gridData) {
						gridData.clear();
						this.loadGridData();
					}
				},

				/**
				 * Проверяет, произошла ли ошибка из-за того, что не сконфигурирован доступ к Google Calendar API.
				 * @protected
				 */
				getGoogleCalendarAccessNotConfigured: function(errorMessage) {
					return (errorMessage.toLowerCase().indexOf("access not configured") !== -1);
				},

				/**
				 * Запускает синхронизацию с Google календарем.
				 * @protected
				 */
				synchronizeWithGoogleCalendar: function() {
					this.showBodyMask();
					var requestUrl = this.Terrasoft.workspaceBaseUrl +
						"/ServiceModel/ProcessEngineService.svc/SynchronizeCalendarWithGoogleModuleProcess/" +
						"Execute?ResultParameterName=SyncResult";
					this.Ext.Ajax.request({
						url: requestUrl,
						headers: {
							"Content-Type": "application/json",
							"Accept": "application/json"
						},
						method: "POST",
						scope: this,
						timeout: 120000,
						callback: function(request, success, response) {
							var messageFail;
							var periodErrorMessage = "The requested minimum modification time lies too far in the past";
							if (success) {
								var responseValue = this.Ext.isIE8 || this.Ext.isIE9 ?
									response.responseXML.firstChild.text :
									response.responseXML.firstChild.textContent;
								var responseData = this.Ext.decode(this.Ext.decode(responseValue));
								if (this.Ext.isEmpty(responseData)) {
									messageFail = this.get("Resources.Strings.SyncProcessFail");
								} else if (Ext.isString(responseData) &&
									responseData.indexOf(periodErrorMessage) !== -1) {
									messageFail =
										this.get("Resources.Strings.GoogleModificationDateLiesTooFarInThePastError");
								} else if (responseData && responseData.addedRecordsInBPMonlineCount) {
									this.refreshGridData();
									var message = this.Ext.String.format(
										this.get("Resources.Strings.SynchronizeWithGoogleSyncResult"),
										responseData.addedRecordsInBPMonlineCount,
										responseData.updatedRecordsInBPMonlineCount,
										responseData.deletedRecordsInBPMonlineCount,
										responseData.addedRecordsInGoogleCount,
										responseData.updatedRecordsInGoogleCount,
										responseData.deletedRecordsInGoogleCount);
									var messageArr = message.split("{NewLine}");
									message = messageArr.join("\n");
									this.Terrasoft.utils.showInformation(message, null, null, {buttons: ["ok"]});
								} else if (responseData && responseData.settingsNotSet) {
									messageFail = this.get("Resources.Strings.SettingsNotSet");
								} else if (responseData.AuthenticationErrorMessage) {
									GoogleUtilities.showGoogleAuthenticationWindow(function() {
										Terrasoft.utils.showInformation(
											GoogleUtilities.localizableStrings.SettingSavedNeedRestart);
									});
								} else {
									messageFail = this.get("Resources.Strings.SyncProcessFail");
									if (this.Ext.isString(responseData)) {
										if (this.getGoogleCalendarAccessNotConfigured(responseData)) {
											messageFail = messageFail + ": \r\n" +
											this.get("Resources.Strings.GoogleAccessNotConfigured");
										} else {
											messageFail = messageFail + ": \r\n" +
											responseData.replace(/\\r\\n/g, "\r\n").replace(/\\t/g, "\t");
										}
									}
								}
							} else if (response.timedout) {
								messageFail = this.get("Resources.Strings.SyncProcessTimedOut");
							} else {
								messageFail = this.get("Resources.Strings.CallbackFailed");
							}
							this.hideBodyMask();
							if (messageFail) {
								this.Terrasoft.utils.showInformation(messageFail, null, null, {buttons: ["ok"]});
							}
						}
					});
				},

				/**
				 * Открывает страницу настройки интеграции с GOOGLE.
				 * @protected
				 */
				openGoogleSettingsPage: function() {
					this.sandbox.publish("PushHistoryState", {
						hash: "GoogleIntegrationSettingsModule/",
						stateObj: {schema: "Activity"}
					});
				},

				/**
				 * Загружает email сообщения.
				 * @obsolete
				 * @protected
				 */
				loadImapEmails: function() {
					window.console.warn(this.Ext.String.format(
						this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
						"loadImapEmails", "loadEmails"));
					this.loadEmails();
				},

				/**
				 * Загружает email сообщения.
				 * @protected
				 */
				loadEmails: function() {
					if (!this.get("isMailboxSyncExist")) {
						var buttonsConfig = {
							buttons: [this.Terrasoft.MessageBoxButtons.OK.returnCode],
							defaultButton: 0
						};
						this.Terrasoft.showInformation(this.get("Resources.Strings.MailboxSettingsEmpty"),
							this.Terrasoft.emptyFn, this, buttonsConfig);
						return;
					}
					var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "ActivityFolder"
					});
					select.addColumn("Id");
					select.filters.addItem(select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"[MailboxSyncSettings:MailboxName:Name].SysAdminUnit", this.Terrasoft.SysValue.CURRENT_USER.value));
					select.getEntityCollection(function(response) {
						if (response.success) {
							this.Terrasoft.each(response.collection.getItems(), function(item) {
								var requestUrl = this.Terrasoft.workspaceBaseUrl +
									"/ServiceModel/ProcessEngineService.svc/LoadImapEmailsProcess/" +
									"Execute?ResultParameterName=LoadResult" +
									"&MailBoxFolderId=" + item.get("Id");
								this.showBodyMask();
								this.Ext.Ajax.request({
									url: requestUrl,
									headers: {
										"Content-Type": "application/json",
										"Accept": "application/json"
									},
									method: "POST",
									scope: this,
									callback: function(request, success, response) {
										this.hideBodyMask();
										var responseData;
										if (success) {
											var responseValue = this.Ext.isIE8 || this.Ext.isIE9 ?
												response.responseXML.firstChild.text :
												response.responseXML.firstChild.textContent;
											responseData = this.Ext.decode(this.Ext.decode(responseValue));
											this.refreshGridData();
											this.Terrasoft.utils.showInformation(
												this.get("Resources.Strings.LoadImapEmailsResult"), null, null,
												{buttons: ["ok"]});
										}
										if (responseData && responseData.Messages.length > 0) {
											this.Terrasoft.each(responseData.Messages, function(element) {
												this.Terrasoft.utils.showInformation(element.message, null, null,
													{buttons: ["ok"]});
											}, this);
										}
									}
								});
							}, this);
						}
					}, this);
				},

				/**
				 * Открывает активность на редактирование.
				 * @protected
				 */
				openItem: function() {
					var prcElId = this.getGridData().get(this.get("SelectedRows")).get("ProcessElementId");
					var recordId = this.getGridData().get(this.get("SelectedRows")).get(this.primaryColumnName);
					if (ProcessModuleUtilities.tryShowProcessCard.call(this, prcElId, recordId)) {
						return;
					}
					var selectedItem = this.get("SelectedRows");
					var gridData = this.getGridData();
					var activeRow = gridData.get(selectedItem);
					var typeColumnValue = this.getTypeColumnValue(activeRow);
					var schemaName = this.getEditPageSchemaName(typeColumnValue);
					this.openCard(schemaName, "edit", selectedItem);
				},

				/**
				 * Устанавливает видимость фильтров в вертикальном представлении в зависимости от режима.
				 */
				setFiltersVisibleInCombinedMode: function() {
					var schema = this.Ext.get(this.name + "Container");
					if (schema) {
						if (this.isSchedulerDataView()) {
							this.setGridOffsetClass();
							if (!schema.hasCls("filters-hidden")) {
								schema.addCls("filters-hidden");
							}
						} else {
							schema.removeCls("filters-hidden");
							this.setGridOffsetClass(this.get("GridOffsetLinesCount"));
						}
					}
				},

				/*
				 * Учитывает возможность наличия скрытого фильтра NotEmailFilter.
				 * @inheritdoc Terrasoft.BaseSectionV2#getVerticalGridOffset
				 * @overridden
				 */
				getVerticalGridOffset: function(filters) {
					var linesCount = this.callParent(arguments);
					var notEmailFilter = filters.collection.findBy(
						function(item, key) {
							return (key === "NotEmailFilter");
						});
					if (notEmailFilter) {
						linesCount--;
					}
					return linesCount;
				},

				/**
				 * Проверяет необходимость установки класса контейнеру реестра.
				 * @overridden
				 * @param {Integer|*} linesCount Количество строк.
				 * @return {boolean} Необходимость установки отступа контейнера реестра.
				 */
				needToSetOffset: function(linesCount) {
					return (linesCount != null && !this.isSchedulerDataView());
				},

				/**
				 * Копирует выделенную запись.
				 * @protected
				 */
				copyItem: function() {
					var selectedItem = this.get("SelectedRows");
					var gridData = this.getGridData();
					var activeRow = gridData.get(selectedItem);
					var primaryColumnValue = activeRow.get(activeRow.primaryColumnName);
					this.copyRecord(primaryColumnValue);
				},

				/**
				 * Удаляет активность.
				 * @protected
				 */
				deleteItem: function() {
					this.deleteRecords();
				},

				/**
				 * Возвращает выбранные записи в расписании.
				 * @protected
				 * @overridden
				 * @return {Array|null} Список записей.
				 */
				getSelectedItems: function() {
					if (this.isSchedulerDataView()) {
						return this.get("SelectedRows");
					} else {
						return this.callParent(arguments);
					}
				},

				/**
				 * Закрытие окон быстрого добавления задачи после удаления записи.
				 * @overridden
				 * @param {object} response Ответ от сервера.
				 */
				onDeleted: function(response) {
					this.callParent(arguments);
					if (response.Success) {
						var schedulerFloatItemsCollection = this.get("SchedulerFloatItemsCollection");
						if (schedulerFloatItemsCollection) {
							schedulerFloatItemsCollection.clear();
						}
					}
				},

				/**
				 * Открывает карточку активности.
				 * @overridden
				 */
				openCard: function() {
					this.setFiltersVisibleInCombinedMode();
					var gridData = this.getGridData();
					var activeRow = this.get("ActiveRow");
					var prcElId = Terrasoft.GUID_EMPTY;
					var recordId = Terrasoft.GUID_EMPTY;
					if (activeRow && gridData && gridData.contains(activeRow)) {
						var activeRecord = gridData.get(activeRow);
						if (activeRecord) {
							prcElId = activeRecord.get("ProcessElementId");
							recordId = activeRecord.get(this.primaryColumnName);
						}
					}
					if (ProcessModuleUtilities.tryShowProcessCard.call(this, prcElId, recordId)) {
						return;
					}
					this.callParent(arguments);
				},

				/**
				 * Открывает карточку активности в цепочке.
				 * @overridden
				 */
				openCardInChain: function(config) {
					if (this.isSchedulerDataView() && (config.operation === ConfigurationEnums.CardStateV2.ADD)) {
						var historyStateInfo = this.getHistoryStateInfo();
						if (historyStateInfo.workAreaMode === ConfigurationEnums.WorkAreaMode.COMBINED) {
							this.closeCard();
						}
					}
					return this.callParent(arguments);
				},

				/**
				 * Открывает карточку редактирования активности.
				 * @protected
				 */
				showCard: function() {
					if (this.isSchedulerDataView()) {
						var selectedRows = this.get("SelectedRows");
						if (selectedRows.length) {
							var scheduleGridData = this.get("ScheduleGridData");
							var selectedRow = scheduleGridData.get(selectedRows[0]);
							if (this.isSchedulerDataView()) {
								if (!this.get("SectionSchedulerStartDate") && !this.get("SectionSchedulerDueDate")) {
									this.set("SectionSchedulerStartDate", this.get("SchedulerStartDate"));
									this.set("SectionSchedulerDueDate", this.get("SchedulerDueDate"));
								}
							}
							var startDate = selectedRow.get("StartDate");
							this.setVerticalSchedulerPeriodToOneDay(startDate);
						}
					}
					this.callParent(arguments);
				},

				/**
				 * Устанавливает период для вертикального реестра равным одному дню.
				 * @param {Object} date Дата начала текущей задачи.
				 */
				setVerticalSchedulerPeriodToOneDay: function(date) {
					var startDate = this.get("SchedulerStartDate").toDateString("dd.MM.yyyy");
					var endDate = this.get("SchedulerDueDate").toDateString("dd.MM.yyyy");
					if (startDate !== endDate || startDate !== date.toDateString("dd.MM.yyyy")) {
						this.set("SchedulerStartDate", this.Terrasoft.deepClone(date));
						this.set("SchedulerDueDate", this.Terrasoft.deepClone(date));
					}
				},

				/**
				 * Возвращает значение по умолчанию для представления расписание.
				 * @overridden
				 */
				isNewRowSelected: function() {
					if (this.isSchedulerDataView()) {
						return true;
					} else {
						return this.callParent(arguments);
					}
				},

				/**
				 * Получает признак, что активное представление это представление расписание.
				 * @protected
				 * @return {boolean}
				 */
				isSchedulerDataView: function() {
					return (this.get("ActiveViewName") === "SchedulerDataView");
				},

				/**
				 * Получает признак, что активное представление НЕ представление расписание.
				 * @protected
				 * @return {boolean}
				 */
				isNotSchedulerDataView: function() {
					return !this.isSchedulerDataView();
				},

				/**
				 * Возвращает видимость пункта "Настройка списка" в меню кнопки "Вид".
				 * @protected
				 * @return {Boolean} Видимость пункта "Настройка списка".
				 */
				getListSettingsOptionVisible: function() {
					return (this.get("IsSectionVisible") && this.isNotSchedulerDataView());
				},

				/**
				 * Возвращает видимость пункта "Перейти в расписание" в меню кнопки "Вид".
				 * @protected
				 * @return {Boolean} Видимость пункта "Перейти в расписание".
				 */
				getSchedulerDataViewOptionVisible: function() {
					return (this.get("IsSectionVisible") && this.isNotSchedulerDataView());
				},

				/**
				 * Возвращает видимость пункта "Перейти в реестр записей" в меню кнопки "Вид".
				 * @protected
				 * @return {Boolean} Видимость пункта "Перейти в реестр записей".
				 */
				getGridDataViewOptionVisible: function() {
					return (this.get("IsSectionVisible") && this.isSchedulerDataView());
				},

				/**
				 * Получает признак имеет ли тип Email активная запись.
				 * @protected
				 * @return {boolean}
				 */
				isActiveRowEmail: function() {
					var activeRowId = this.get("ActiveRow");
					if (activeRowId) {
						var gridData = this.getGridData();
						if (gridData.contains(activeRowId)) {
							var activeRow = gridData.get(activeRowId);
							var type = activeRow.get("Type").value;
							return type === ConfigurationConstants.Activity.Type.Email;
						}
						return false;
					}
					return false;
				},

				/**
				 * Получает признак, скрыта ли кнопка Отправить.
				 * @protected
				 * @return {Boolean}
				 */
				getIsSendButtonVisible: function() {
					var visible = this.get("IsSendButtonVisible") || false;
					return visible && this.isActiveRowEmail();
				},

				/**
				 * Получает признак, скрыта ли кнопка Ответить.
				 * @protected
				 * @return {Boolean}
				 */
				getIsReplyButtonVisible: function() {
					var visible = this.get("IsReplyButtonVisible") || false;
					return visible && this.isActiveRowEmail();
				},

				/**
				 * Получает признак, скрыта ли кнопка Переслать.
				 * @protected
				 * @return {Boolean}
				 */
				getIsForwardButtonVisible: function() {
					var visible = this.get("IsForwardButtonVisible") || false;
					return visible && this.isActiveRowEmail();
				},

				/**
				 * Получает признак, скрыта ли кнопка Переслать.
				 * @protected
				 * @return {Boolean}
				 */
				getIsForwardOUTButtonVisible: function() {
					var visible = this.get("IsForwardOUTButtonVisible") || false;
					return visible && this.isActiveRowEmail();
				},

				/**
				 * Обрабатывает нажатие на ссылку в реестре раздела.
				 * @protected
				 * @overridden
				 * @return {Boolean} Возвращает признак перехода по ссылке.
				 */
				linkClicked: function(href, columnName) {
					if (columnName !== this.primaryDisplayColumnName) {
						return true;
					}
					var linkParams = href.split("/");
					var recordId = linkParams[linkParams.length - 1];
					var gridData = this.getGridData();
					var row = gridData.get(recordId);
					var prcElId = row.get("ProcessElementId");
					if (!ProcessModuleUtilities.tryShowProcessCard.call(this, prcElId, recordId)) {
						this.set("ActiveRow", recordId);
						if (this.get("MultiSelect")) {
							this.saveMultiSelectState();
							this.unSetMultiSelect();
						}
						this.editRecord(recordId);
					}
					return false;
				},

				/**
				 * Закрывает карточку редактирования.
				 * @protected
				 * @overridden
				 */
				closeCard: function() {
					this.callParent(arguments);
					if (this.isSchedulerDataView()) {
						if (this.get("SectionSchedulerStartDate")) {
							this.set("SchedulerStartDate", this.get("SectionSchedulerStartDate"));
							this.set("SectionSchedulerStartDate", null);
						}
						if (this.get("SectionSchedulerDueDate")) {
							this.set("SchedulerDueDate", this.get("SectionSchedulerDueDate"));
							this.set("SectionSchedulerDueDate", null);
						}
					}
				},

				/**
				 * Добавляет пункт перехода в Расписание в меню кнопки "Вид".
				 * @overridden
				 */
				addChangeDataViewOptions: function(viewOptions) {
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.SchedulerDataViewCaption"},
						"Click": {"bindTo": "changeDataView"},
						"Tag": this.get("SchedulerDataViewName")
					}));
					this.callParent(arguments);
				},

				/**
				 * Возвращает ответственных из фиксированого фильтра, кроме текущего пользователя.
				 * @private
				 */
				getParticipants: function() {
					var quickFilterModuleId = this.getQuickFilterModuleId();
					var owners = this.sandbox.publish("GetFixedFilter", {filterName: "Owner"},
						[quickFilterModuleId]);
					var participants = [];
					owners.forEach(function(item) {
						if (item.value !== this.Terrasoft.SysValue.CURRENT_USER_CONTACT.value) {
							participants.push(item);
						}
					});
					return participants;
				},

				/**
				 * Возвращает конфигурацию для передачи в карточку параметров и значений по умолчанию.
				 * Передает значения для колонок StartDate и DueDate при наличии выделеной области.
				 * @overridden
				 */
				getCardInfoConfig: function(typeColumnName, typeColumnValue) {
					var cardInfo = {
						typeColumnName: typeColumnName,
						typeUId: typeColumnValue
					};
					cardInfo.valuePairs = [];
					var selection = this.get("SchedulerSelection");
					if (selection) {
						var defaultValues = cardInfo.valuePairs || [];
						defaultValues.push({
							name: "StartDate",
							value: selection.startDate
						});
						defaultValues.push({
							name: "DueDate",
							value: selection.dueDate
						});
						cardInfo.valuePairs = defaultValues;
						this.set("SchedulerSelection", null);
					}
					cardInfo.valuePairs.push({
						name: "Participants",
						value: this.getParticipants()
					});
					return cardInfo;
				},

				/**
				 * Загружает модуль быстрого добавления задачи.
				 * @overridden
				 */
				onRender: function() {
					this.callParent(arguments);
					this.sandbox.loadModule("SimpleTaskAddModule", {
						id: this.getSimpleAddTaskModuleId(),
						keepAlive: true
					});
					this.setFiltersVisibleInCombinedMode();
				},

				/**
				 * Инициирует создание модели окна быстрого добавления задачи.
				 * @private
				 * @param {Object} config объект настроек модели
				 */
				getSimpleAddTaskViewModel: function(config) {
					this.sandbox.publish("GetSimpleTaskAddViewModel", config);
				},

				/**
				 * Добавляет модель окна быстрого добавления задачи в коллекцию расписания.
				 * @private
				 * @param {Object} viewModel Модель окна быстрого добавления задачи.
				 */
				onSimpleTaskViewModelCreated: function(viewModel) {
					var collection = this.get("SchedulerFloatItemsCollection");
					collection.add(viewModel);
				},

				/**
				 * Удаляет модель окна быстрого добавления задачи в коллекцию расписания.
				 * @private
				 * @param {Object} config Параметры для обновления записи,
				 * в случае если окно закрывается по кнопке сохранить.
				 */
				onRemoveViewModel: function(config) {
					var viewModel = config.viewModel;
					var collection = this.get("SchedulerFloatItemsCollection");
					collection.remove(viewModel);
					var recordId = config.recordId;
					if (recordId) {
						this.set("SchedulerSelection", null);
						this.loadGridDataRecord(recordId);
					}
				},

				/**
				 * Возвращает строку, которая содержит введенные пользователем символы.
				 * @return {String} Строка с введенными символами.
				 */
				getSchedulerSelectionPressedKeys: function() {
					var symbols = this.get("SchedulerSelectionPressedKeys") || "";
					this.set("SchedulerSelectionPressedKeys", "");
					return symbols;
				},

				/**
				 * Подписывает на сообщения о формировании модели окна быстрого добавления задачи,
				 * удаления модели окна быстрого добавления задачи из коллекции расписания.
				 * @overridden
				 */
				subscribeSandboxEvents: function() {
					this.callParent(arguments);
					this.sandbox.subscribe("SimpleTaskViewModelCreated", this.onSimpleTaskViewModelCreated, this);
					this.sandbox.subscribe("RemoveViewModel", this.onRemoveViewModel, this);
					this.sandbox.subscribe("GetSchedulerSelectionPressedKeys", this.getSchedulerSelectionPressedKeys,
						this, [this.getSimpleAddTaskModuleId()]);
					this.sandbox.subscribe("OpenItem", this.openItem, this, [this.getSimpleAddTaskModuleId()]);

				},

				/**
				 * Отправляет сообщение о начале отрисовки окна быстрого добавления задачи.
				 * @private
				 * @param {Object} config Конфигурационный объект.
				 */
				onFloatingItemReady: function(config) {
					var collection = this.get("SchedulerFloatItemsCollection");
					var viewModel = collection.getByIndex(0);
					this.sandbox.publish("RenderSimpleTaskAddView", {
						renderTo: config.renderTo,
						input: config.input,
						viewModel: viewModel
					});
				},

				/**
				 * Формирует идентификатор модуля быстрого добавления задачи.
				 * @private
				 * @return {string} Идентификатор модуля быстрого добавления задачи.
				 */
				getSimpleAddTaskModuleId: function() {
					return this.sandbox.id + "_SimpleAddTaskModule";
				},

				/**
				 * Инициализация подписки на сообщение получения параметров карточки и
				 * значений по умолчанию для модуля быстрого добавления задачи.
				 * @overridden
				 */
				initGetCardInfoSubscription: function(typeColumnValue) {
					var typeColumnName = this.get("TypeColumnName");
					if (typeColumnName && typeColumnValue) {
						this.sandbox.subscribe("getCardInfo", function() {
							return this.getCardInfoConfig(typeColumnName, typeColumnValue);
						}, this, [
							this.getChainCardModuleSandboxId(typeColumnValue),
							this.getSimpleAddTaskModuleId()
						]);
					}
				},

				/**
				 * Подписывает на сообщение сохранения страницы редактирования.
				 * @overridden
				 */
				initCardModuleResponseSubscription: function() {
					var editCardsSandboxIds = [];
					var editPages = this.get("EditPages");
					editPages.each(function(editPage) {
						var editCardsSandboxId = this.getChainCardModuleSandboxId(editPage.get("Tag"));
						editCardsSandboxIds.push(editCardsSandboxId);
					}, this);
					editCardsSandboxIds.push(this.getCardModuleSandboxId());
					editCardsSandboxIds.push(this.getSimpleAddTaskModuleId() + "_CardModule");
					this.sandbox.subscribe("CardModuleResponse", this.onCardModuleResponse, this, editCardsSandboxIds);

					this.sandbox.subscribe("ReloadGridAfterAdd", function(config) {
						if (config && config.entitySchemaName === this.entitySchemaName) {
							this.set("IsCardInChain", config.isInChain || false);
							this.loadGridDataRecord(config.primaryColumnValue, function() {
								this.set("IsCardInChain", false);
							}, this);
						}
					}, this);
				},

				/**
				 * Возвращает количество записей на странице в расписании.
				 * @overridden
				 * @return {Integer|*} Количество записей.
				 */
				getRowCount: function() {
					var rowCount = this.callParent(arguments);
					if (this.isSchedulerDataView()) {
						rowCount = this.get("SchedulerItemsAmountPerPage") || rowCount;
					}
					return rowCount;
				},

				/**
				 * Возвращает текущую активную запись реестра или расписания.
				 * @overridden
				 * @return {Object|null} Текущая активная запись.
				 */
				getActiveRow: function() {
					var activeRow = null;
					var primaryColumnValue = this.isSchedulerDataView()
						? this.get("SelectedRows")[0]
						: this.get("ActiveRow");
					if (primaryColumnValue) {
						var gridData = this.getGridData();
						activeRow = gridData.contains(primaryColumnValue) ? gridData.get(primaryColumnValue) : null;
					}
					return activeRow;
				},

				/**
				 * Возвращает реестр раздела или расписание, в соответствии с текущим представлением.
				 * @overridden
				 * @return {*|Component}
				 */
				getCurrentGrid: function() {
					return this.isSchedulerDataView()
						? this.Ext.getCmp("ActivitySectionV2Scheduler")
						: this.Ext.getCmp(this.name + "DataGridGrid");
				},

				/**
				 * Открывает катрочку записи в расписании по двойному клику.
				 * @private
				 */
				onScheduleItemDoubleClick: function() {
					var isCardVisible = this.get("IsCardVisible");
					if (isCardVisible === true) {
						return;
					}
					var collection = this.get("SchedulerFloatItemsCollection");
					if (!collection.isEmpty()) {
						return;
					}
					this.openItem();
				},

				/**
				 * Очищает коллекцию всплывающих окон в расписании.
				 * @private
				 */
				onChangeSelectedItems: function() {
					var collection = this.get("SchedulerFloatItemsCollection");
					if (collection && !collection.isEmpty()) {
						collection.clear();
					}
				},

				/**
				 * Открывает окно быстрого изменения записи в расписании по одиночному клику.
				 * @private
				 * @param {Object} scheduleItem экземпляр элемента расписания по которому кликнули.
				 */
				onScheduleItemTitleClick: function(scheduleItem) {
					if (this.get("IsCardVisible")) {
						return;
					}
					var activeRow = this.getActiveRow();
					var typeId = this.getTypeColumnValue(activeRow);
					var cardSchemaName = this.getEditPageSchemaName(typeId);
					this.getSimpleAddTaskViewModel({
						scheduleItem: scheduleItem,
						cardSchemaName: cardSchemaName,
						mode: (!this.get("IsCardVisible")) ? "normal" : "small"
					});
				},

				/**
				 * Инициирует создание модели окна быстрого добавления задачи.
				 * @private
				 */
				onSelectionKeyPress: function() {
					this.getSimpleAddTaskViewModel(
						{
							mode: (!this.get("IsCardVisible")) ? "normal" : "small"
						}
					);
				},

				/**
				 * Приводит представление реестра в соответствие с новой конфигурацией колонок в профиле.
				 * В случае с расписанием, перерисовка не нужна.
				 * @inheritdoc Terrasoft.BaseSectionV2#reloadGridColumnsConfig
				 * @overridden
				 */
				reloadGridColumnsConfig: function(doReRender) {
					var isNotSchedulerDataView = this.isNotSchedulerDataView();
					this.callParent([(doReRender && isNotSchedulerDataView)]);
				},

				/**
				 * При открытии задачи из расписания блокирует переход реестра к активной строке.
				 * @inheritdoc Terrasoft.BaseSectionV2#reloadGridColumnsConfig
				 * @overridden
				 */
				ensureActiveRowVisible: function() {
					if (this.isSchedulerDataView()) {
						return;
					}
					this.callParent(arguments);
				},

				/**
				 * Обрабатывает полученые данные, и выводит сообщение о возможности загрузить
				 * еще одну страницу данных в расписании.
				 * @overridden
				 * @param {Object} response Ответ сервера.
				 */
				onGridDataLoaded: function(response) {
					this.callParent(arguments);
					if (!response.success || this.isNotSchedulerDataView()) {
						return;
					}
					var scheduleCollection = this.getGridData();
					var pageCount = this.get("SchedulePageCount") || 1;
					var canLoadMoreData = this.get("CanLoadMoreData");
					var rowCount = this.get("SchedulerItemsAmountPerPage");
					if (scheduleCollection.getCount() < pageCount * rowCount && canLoadMoreData) {
						this.needLoadData();
					} else {
						if (canLoadMoreData) {
							this.set("CanLoadMoreData", false);
							var message = this.get("Resources.Strings.LoadMoreDataTemplate");
							this.showConfirmationDialog(this.Ext.String.format(message, rowCount), function(result) {
								if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
									this.set("SchedulePageCount", pageCount + 1);
									this.set("CanLoadMoreData", true);
									this.needLoadData();
								}
							}, ["yes", "no"]);
						}
					}
				},

				/**
				 * Показывает в расписании маску загрузки данных при загрузке записей.
				 * @inheritdoc Terrasoft.GridUtilities#beforeLoadGridData
				 * @overridden
				 */
				beforeLoadGridData: function() {
					if (this.isSchedulerDataView()) {
						this.showBodyMask({timeout: 0});
					}
					this.callParent(arguments);
				},

				/**
				 * Показывает в расписании маску загрузки данных при дозагрузке записи.
				 * @inheritdoc Terrasoft.GridUtilities#beforeLoadGridDataRecord
				 * @overridden
				 */
				beforeLoadGridDataRecord: function() {
					if (this.isSchedulerDataView()) {
						this.showBodyMask({timeout: 0});
					}
					this.callParent(arguments);
				},

				/**
				 * @inheritdoc Terrasoft.GridUtilities#addItemsToGridData
				 * @overridden
				 */
				addItemsToGridData: function() {
					this.callParent(arguments);
					if (this.isSchedulerDataView()) {
						this.hideBodyMask();
					}
				},

				/**
				 * Устанавливает сортировку по дате начала для представления расписание.
				 * @overridden
				 * @param {Object} esq Запрос на выборку данных.
				 */
				initQuerySorting: function(esq) {
					if (this.isSchedulerDataView()) {
						var sortedColumn = esq.columns.collection.get("StartDate");
						if (sortedColumn) {
							sortedColumn.orderPosition = 1;
							sortedColumn.orderDirection = this.Terrasoft.OrderDirection.ASC;
						}
					} else {
						this.callParent(arguments);
					}
				},

				/**
				 * Инициирует выбор в ресстре добавленной записи.
				 * В случае множественного режима:
				 * - получает копию массива текущих выбранных записей
				 * - добавляет в массив новую запись
				 * - "снимает" выделение со всех записей
				 * - устанавливает режим множественного выбора (имеем в виду: получение экземпляра реестра и очистку
				 * * activeRowActions. Связано с тем, что реестр создается заново после возвращения из карточки
				 * * добавления записи)
				 * - устанавливает актуальные значения выбранных записей
				 * overridden
				 */
				afterLoadGridDataUserFunction: function(primaryColumnValue) {
					if (this.get("MultiSelect")) {
						var selectedRows = this.Terrasoft.deepClone(this.get("SelectedRows"));
						selectedRows.push(primaryColumnValue);
						this.set("SelectedRows", []);
						this.setMultiSelect();
						this.set("SelectedRows", selectedRows);
					} else {
						if (this.isNotSchedulerDataView() && this.getCurrentGrid() && !this.get("IsCardVisible")) {
							this.set("ActiveRow", primaryColumnValue);
						}
					}
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#rowSelected
				 * @overridden
				 * @protected
				 */
				rowSelected: function(primaryColumnValue) {
					if (this.isSchedulerDataView()) {
						this.set("ActiveRow", primaryColumnValue);
					}
					this.callParent(arguments);
				},

				/**
				 * Загружает данные в расписание.
				 * @overridden
				 */
				loadActiveViewData: function() {
					var activeViewName = this.getActiveViewName();
					if (activeViewName === this.get("GridDataViewName") || this.isSchedulerDataView()) {
						this.loadGridData();
					}
				},

				/**
				 * @inheritdoc Terrasoft.BaseSection#getGridRowViewModelClassName
				 */
				getGridRowViewModelClassName: function() {
					return (this.isSchedulerDataView())
						? "Terrasoft.ActivitySectionGridRowViewModel"
						: this.callParent(arguments);
				},

				/**
				 * Подписывает на события сокета, для обработки сообщений процесса синхронизации с Google-календарем.
				 * @private
				 */
				initGoogleCalendarLog: function() {
					this.Terrasoft.ServerChannel.on(Terrasoft.EventName.ON_MESSAGE, this.onGoogleCalendarMessage, this);
				},

				/**
				 * Сохраняет сообщения процесса синхронизации с Google-календарем.
				 * @param {Object} scope Контекст.
				 * @param {Object} message Сообщение процесса синхронизации с Google-календарем.
				 */
				onGoogleCalendarMessage: function(scope, message) {
					switch (message.Header.Sender) {
						case "GoogleCalendar":
							this.log(message.Body, this.Terrasoft.LogMessageType.INFORMATION);
							break;
						default:
							break;
					}
				},

				/**
				 * Устанавливает значение задержки перед фильтрацией.
				 * @private
				 */
				initFiltersUpdateDelay: function() {
					this.filtersUpdateDelay = 300;
				},

				/**
				 * Инициализирует коллекцию страниц редактирования сущности.
				 * Удаляет из коллекции страницы для типа Email и Звонок
				 * @inheritdoc Terrasoft.BaseSection#initEditPages
				 * @override
				 */
				initEditPages: function() {
					var enabledEditPages = new this.Terrasoft.Collection();
					this.callParent(arguments);
					var editPages = this.get("EditPages");
					this.Terrasoft.each(editPages.getItems(), function(item) {
						if (item.get("Id") !== ConfigurationConstants.Activity.Type.Email &&
							item.get("Id") !== ConfigurationConstants.Activity.Type.Call) {
							enabledEditPages.add(item);
						}
					});
					this.set("EnabledEditPages", enabledEditPages);
				},

				/**
				 * @inheritdoc Terrasoft.BaseSection#initEditPages
				 * @override
				 */
				addRecord: function(typeColumnValue) {
					if (!typeColumnValue) {
						if (this.get("EnabledEditPages").getCount() > 1) {
							return false;
						}
						var tag = this.get("AddRecordButtonTag");
						typeColumnValue = tag || this.Terrasoft.GUID_EMPTY;
					}
					var schemaName = this.getEditPageSchemaName(typeColumnValue);
					if (!schemaName) {
						return;
					}
					this.openCardInChain({
						schemaName: schemaName,
						operation: ConfigurationEnums.CardStateV2.ADD,
						moduleId: this.getChainCardModuleSandboxId(typeColumnValue)
					});
				},

				/**
				 * @inheritdoc Terrasoft.BaseSection#initAddRecordButtonParameters
				 * @override
				 */
				initAddRecordButtonParameters: function() {
					var caption = this.get("Resources.Strings.AddRecordButtonCaption");
					var tag = this.Terrasoft.GUID_EMPTY;
					var editPages = this.get("EnabledEditPages");
					var editPagesCount = editPages.getCount();
					if (editPagesCount === 1) {
						var editPage = editPages.getByIndex(0);
						caption = editPage.get("Caption");
						tag = editPage.get("Tag");
					}
					this.set("AddRecordButtonCaption", caption);
					this.set("AddRecordButtonTag", tag);
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "OpenButton",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.OpenButtonCaption"},
						"classes": {
							"textClass": ["actions-button-margin-right"]
						},
						"visible": {
							"bindTo": "isSchedulerDataView"
						},
						"enabled": {"bindTo": "getSchedulerButtonsEnabled"},
						"click": {"bindTo": "openItem"}
					}
				},
				{
					"operation": "insert",
					"name": "CopyButton",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.CopyButtonCaption"},
						"classes": {
							"textClass": ["actions-button-margin-right"]
						},
						"visible": {
							"bindTo": "isSchedulerDataView"
						},
						"click": {
							"bindTo": "copyItem"
						},
						"enabled": {
							"bindTo": "getSchedulerButtonsEnabled"
						}
					}
				},
				{
					"operation": "insert",
					"name": "DeleteButton",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.DeleteButtonCaption"},
						"classes": {
							"textClass": ["actions-button-margin-right"]
						},
						"visible": {
							"bindTo": "isSchedulerDataView"
						},
						"click": {
							"bindTo": "deleteItem"
						},
						"enabled": {
							"bindTo": "getSchedulerButtonsEnabled"
						}
					}
				},
				{
					"operation": "merge",
					"name": "SeparateModePrintButton",
					"values": {
						"visible": {
							"bindTo": "ActiveViewName",
							"bindConfig": {
								"converter": function(value) {
									var sectionPrintMenuItems = this.get("SectionPrintMenuItems");
									return ((value !== "SchedulerDataView") &&
									(sectionPrintMenuItems && sectionPrintMenuItems.getCount() > 0));
								}
							}
						}
					}
				},
				{
					"operation": "merge",
					"name": "SeparateModeViewOptionsButton",
					"values": {
						"visible": {"bindTo": "isNotSchedulerDataView"}
					}
				},
				{
					"operation": "merge",
					"name": "SelectMultipleRecordsMenuItem",
					"values": {
						"visible": {
							"bindTo": "isNotSchedulerDataView"
						}
					}
				},
				{
					"operation": "merge",
					"name": "SelectOneRecordMenuItem",
					"values": {
						"visible": {
							"bindTo": "isNotSchedulerDataView"
						}
					}
				},
				{
					"operation": "merge",
					"name": "UnselectAllRecordsMenuItem",
					"values": {
						"visible": {
							"bindTo": "isNotSchedulerDataView"
						}
					}
				},
				{
					"operation": "merge",
					"name": "ExportListToFileMenuItem",
					"values": {
						"visible": {
							"bindTo": "isNotSchedulerDataView"
						}
					}
				},
				{
					"operation": "merge",
					"name": "IncludeInFolderMenuItem",
					"values": {
						"visible": {
							"bindTo": "isNotSchedulerDataView"
						}
					}
				},
				{
					"operation": "merge",
					"name": "ExcludeFromFolderMenuItem",
					"values": {
						"visible": {
							"bindTo": "isNotSchedulerDataView"
						}
					}
				},
				{
					"operation": "merge",
					"name": "DeleteRecordMenuItem",
					"values": {
						"visible": {
							"bindTo": "isNotSchedulerDataView"
						}
					}
				},
				{
					"operation": "insert",
					"name": "SeparateModeIntervalButton",
					"parentName": "SeparateModeActionButtonsRightContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"controlConfig": {"menu": {"items": {"bindTo": "IntervalMenuItems"}}},
						"visible": {
							"bindTo": "isSchedulerDataView"
						},
						"caption": {"bindTo": "Resources.Strings.ViewOptionsButtonCaption"}
					}
				},
				{
					"operation": "insert",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"name": "send",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"caption": {"bindTo": "Resources.Strings.SendEmailAction"},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"click": {"bindTo": "onCardAction"},
						"tag": "checkSenderBeforeSend",
						"visible": {
							"bindTo": "getIsSendButtonVisible"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"name": "reply",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ReplyActionCaption"},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"click": {"bindTo": "onCardAction"},
						"tag": "replyEmail",
						"visible": {
							"bindTo": "getIsReplyButtonVisible"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"name": "replyAll",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ReplyAllActionCaption"},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"click": {"bindTo": "onCardAction"},
						"tag": "replyAllEmail",
						"visible": {
							"bindTo": "getIsReplyButtonVisible"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"name": "forward",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ForwardActionCaption"},
						"layout": {"column": 12, "row": 0, "colSpan": 2},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"click": {"bindTo": "onCardAction"},
						"tag": "forwardEmail",
						"visible": {
							"bindTo": "getIsForwardButtonVisible"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"name": "forwardOUT",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ForwardActionCaption"},
						"layout": {"column": 14, "row": 0, "colSpan": 2},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"click": {"bindTo": "onCardAction"},
						"tag": "forwardEmail",
						"visible": {
							"bindTo": "getIsForwardOUTButtonVisible"
						}
					}
				},
				{
					"operation": "insert",
					"name": "Schedule",
					"parentName": "DataViewsContainer",
					"propertyName": "items",
					"values": {
						"id": "ActivitySectionV2Scheduler",
						"selectors": {"wrapEl": "#ActivitySectionV2Scheduler"},
						"itemType": Terrasoft.ViewItemType.SCHEDULE_EDIT,
						"visible": {"bindTo": "isSchedulerDataView"},
						"startHour": Terrasoft.SysSettings.cachedSettings.SchedulerTimingStart,
						"displayStartHour": Terrasoft.SysSettings.cachedSettings.SchedulerDisplayTimingStart + "-00",
						"dueHour": Terrasoft.SysSettings.cachedSettings.SchedulerTimingEnd,
						"timeScale": {"bindTo": "getTimeScale"},
						"period": {"bindTo": "getSchedulerPeriod"},
						"timezone": [{}],
						"startDate": null,
						"dueDate": null,
						"activityCollection": {"bindTo": "ScheduleGridData"},
						"selectedItems": {"bindTo": "SelectedRows"},
						"changeSelectedItems": {"bindTo": "onChangeSelectedItems"},
						"scheduleItemDoubleClick": {"bindTo": "onScheduleItemDoubleClick"},
						"scheduleItemTitleClick": {"bindTo": "onScheduleItemTitleClick"},
						"change": {"bindTo": "changeScheduleItem"},
						"selection": {"bindTo": "SchedulerSelection"},
						"floatingItemsCollection": {"bindTo": "SchedulerFloatItemsCollection"},
						"selectionKeyPress": {bindTo: "onSelectionKeyPress"},
						"floatingItemReady": {"bindTo": "onFloatingItemReady"},
						"selectionKeyPressSymbols": {"bindTo": "SchedulerSelectionPressedKeys"},
						"itemBindingConfig": {
							"itemId": {"bindTo": "Id"},
							"title": {"bindTo": "getScheduleItemTitle"},
							"changeTitle": {"bindTo": "onTitleChanged"},
							"startDate": {"bindTo": "StartDate"},
							"changeStartDate": {"bindTo": "onStartDateChanged"},
							"dueDate": {"bindTo": "DueDate"},
							"changeDueDate": {"bindTo": "onDueDateChanged"},
							"status": {"bindTo": "getScheduleItemStatus"},
							"changeStatus": {"bindTo": "onStatusChanged"},
							"background": {"bindTo": "Background"},
							"fontColor": {"bindTo": "FontColor"},
							"isBold": {"bindTo": "IsBold"},
							"isItalic": {"bindTo": "IsItalic"},
							"isUnderline": {"bindTo": "IsUnderline"},
							"hint": {bindTo: "getScheduleItemHint"}
						},
						"floatingItemBindingConfig": {
							"caption": {"bindTo": "getSimpleModuleCaption"},
							"width": {"bindTo": "getSimpleModuleWidth"}
						}
					}
				},
				{
					"operation": "insert",
					"index": 0,
					"name": "OpenSchedulerDataViewOptionsMenuItem",
					"parentName": "AnalyticsModeViewOptionsButton",
					"propertyName": "menu",
					"values": {
						"itemType": Terrasoft.ViewItemType.MENU_ITEM,
						"caption": {"bindTo": "Resources.Strings.SchedulerDataViewCaption"},
						"click": {"bindTo": "changeDataView"},
						"tag": "SchedulerDataView"
					}
				},
				{
					"operation": "merge",
					"name": "SeparateModeAddRecordButton",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"values": {
						"controlConfig": {
							"menu": {
								"items": {
									"bindTo": "EnabledEditPages",
									"bindConfig": {
										"converter": function(editPages) {
											if (editPages.getCount() > 1) {
												return editPages;
											} else {
												return null;
											}
										}
									}
								}
							}
						}

					}
				},
				{
					"operation": "merge",
					"name": "CombinedModeAddRecordButton",
					"parentName": "CombinedModeActionButtonsSectionContainer",
					"propertyName": "items",
					"values": {
						"controlConfig": {
							"menu": {
								"items": {
									"bindTo": "EnabledEditPages",
									"bindConfig": {
										"converter": function(editPages) {
											if (editPages.getCount() > 1) {
												return editPages;
											} else {
												return null;
											}
										}
									}
								}
							}
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
