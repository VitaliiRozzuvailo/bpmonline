define("BaseSectionV2", ["terrasoft", "ConfigurationEnums", "ConfigurationConstants", "RightUtilities",
		"ProcessModuleUtilities", "AcademyUtilities", "MenuUtilities",
		"performancecountermanager", "TagUtilitiesV2", "GridUtilitiesV2",
		"DataUtilities", "ProcessEntryPointUtilities", "ProcessEntryPointUtilities", "BaseSectionGridRowViewModel",
		"HistoryStateUtilities", "PrintReportUtilities", "SecurityUtilities", "css!QuickFilterModuleV2",
		"WizardUtilities", "ContextHelpMixin"],
	function(Terrasoft, ConfigurationEnums, ConfigurationConstants, RightUtilities, ProcessModuleUtilities,
			AcademyUtilities, MenuUtilities, performanceManager) {
		return {
			/**
			 * Сообщения, добавленные или измененные относительно родительской схемы
			 * @type {Object}
			 */
			messages: {

				/**
				 * Публикация сообщения переотрисовки модуля итогов.
				 */
				"RerenderModule": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для получение состояния.
				 */
				"GetHistoryState": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 *
				 */
				"UpdateCardProperty": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 *
				 */
				"UpdateCardHeader": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 *
				 */
				"CardModuleResponse": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"CloseCard": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GridRowChanged
				 * Сообщает идентификатор выбранной в реестре записи при его изменении
				 * @param {String} Идентификатор выбранной записи
				 */
				"GridRowChanged": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetSectionFilters
				 * Возвращает выбранные в реестре фильтры
				 * @return {Object} Фильтры
				 */
				"GetSectionFilters": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message OnCardAction
				 * Сообщает о выполнении действия карточки вне карточки
				 * @param {String} action Название действия
				 */
				"OnCardAction": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message CardChanged
				 * Срабатывает при изменении состояния карточки
				 * @param {Object} config
				 * @param {String} config.key Название свойста модели представления
				 * @param {Object} config.value Значение
				 */
				"CardChanged": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message getCardInfo
				 */
				"getCardInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"UpdateFilter": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Инициирует генерацию события ChangeHeaderCaption
				 */
				"NeedHeaderCaption": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"FiltersChanged": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 *
				 */
				"GetFixedFilterConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"CustomFilterExtendedMode": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"GetExtendedFilter": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"CustomFilterExtendedModeClose": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"ApplyResultExtendedFilter": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"UpdateExtendedFilter": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 *
				 */
				"GetFolderFilter": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"ResultFolderFilter": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"UpdateFolderFilter": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 *
				 */
				"FilterActionsFired": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 *
				 */
				"FilterActionsEnabledChanged": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"ChangeHeaderCaption": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message LookupInfo
				 * Для работы LookupUtilities
				 */
				"LookupInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message ResultSelectedRows
				 * Для работы LookupUtilities
				 */
				"ResultSelectedRows": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"AddFolderActionFired": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message OpenCardInChain
				 * Сообщение об открытии карточки
				 * @param {Object} Конфиг открываемой карточки
				 */
				"OpenCardInChain": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message CardRendered
				 * Открытая страница редактирования отрисовалась.
				 */
				"CardRendered": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message Сообщение для обновления пунктов меню в модуле фильтров
				 */
				"UpdateCustomFilterMenu": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetProcessEntryPointsData
				 */
				"GetProcessEntryPointInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetProcessEntryPointsData
				 */
				"GetProcessEntryPointsData": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetProcessEntryPointsData
				 */
				"CloseProcessEntryPointModule": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message ProcessExecDataChanged
				 */
				"ProcessExecDataChanged": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetCardActions
				 * Получает действия карточки
				 * @return {Object} Фильтры
				 */
				"GetCardActions": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetCardViewOptions
				 * Получает пункты меню кнопки "Вид" карточки
				 * @param {Terrasoft.BaseViewModelCollection} Пункты меню кнопки "Вид"
				 */
				"GetCardViewOptions": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 *
				 */
				"GetSectionFiltersInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message UpdateSection
				 * Обновляет раздел
				 */
				"UpdateSection": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message ResetSection
				 * Сбрасывает раздел
				 */
				"ResetSection": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message SetCustomFilters
				 * Устанавливает быстрые фильтры в разделе
				 */
				"SetCustomFilters": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message IsSeparateMode
				 * Отправляет текущее состояние раздела (открыта карточка или нет)
				 */
				"IsSeparateMode": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetDataViews
				 * Передает представления раздела
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает представления раздела
				 */
				"GetDataViews": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetRunProcessesProperties
				 * Получает набор значений свойств необходимых для того, что бы запустить процесс.
				 * @param {Array} Массив значений свойств.
				 */
				"GetRunProcessesProperties": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message SelectedSideBarItemChanged
				 * Изменяет выделение текущего раздела в меню раделов левой панели.
				 * @param {String} Структура раздела (Напр. "SectionModuleV2/AccountPageV2/" или "DashboardsModule/").
				 */
				"SelectedSideBarItemChanged": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message InitQuickAddMenuItems
				 * Получает колекцию пунктов меню кнопки быстрого добавления активности.
				 */
				"InitQuickAddMenuItems": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message OnQuickAddRecord
				 * Сообщает о нажатии пункта меню кнопки быстрого добавления активности.
				 */
				"OnQuickAddRecord": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetFolderEntitiesNames
				 * Возвращает названия схем груп для текущего раздела.
				 */
				"GetFolderEntitiesNames": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message TagChanged
				 * Обновляет количество тегов в кнопке.
				 */
				"TagChanged": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetRecordId
				 * Возвращает идентификатор записи, которая редактируется.
				 */
				"GetRecordId": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message EntityInitialized
				 * Запускается после инициализации объекта и информирует подписчиков о завершении инициализации
				 * сущности. В качестве параметра сообщения передается информация о объекте.
				 */
				"EntityInitialized": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},

			/**
			 * Классы-миксины (примеси), расширяющие функциональность данного класа
			 */
			mixins: {
				/**
				 * @class GridUtilities реализующий базовые методы работы с реестром
				 */
				GridUtilities: "Terrasoft.GridUtilities",

				/**
				 *
				 */
				ProcessEntryPointUtilities: "Terrasoft.ProcessEntryPointUtilities",

				/**
				 * @class PrintReportUtilities реализующий базовые методы работы с отчетами и печатными формами.
				 */
				PrintReportUtilities: "Terrasoft.PrintReportUtilities",

				/**
				 * @class SecurityUtilitiesMixin реализует проверку прав доступа по операциям.
				 */
				SecurityUtilitiesMixin: "Terrasoft.SecurityUtilitiesMixin",

				/**
				 * @class TagUtilities реализует возможность работы с модулем тегов.
				 */
				TagUtilities: "Terrasoft.TagUtilities",

				/**
				 * @class ContextHelpMixin Реализует возможность работы с модулем открытия справки.
				 */
				ContextHelpMixin: "Terrasoft.ContextHelpMixin",

				/**
				 * @class WizardUtilities Реализует возможность работы с мастером разделов.
				 */
				WizardUtilities: "Terrasoft.WizardUtilities"
			},

			/**
			 * Атрибуты модели представления раздела
			 * @type {Object}
			 */
			attributes: {
				/**
				 * Коллекция данных для представления списка
				 */
				"GridData": {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Коллекция данных для представления аналитики
				 */
				"AnalyticsData": {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Коллекция представлений раздела
				 */
				"DataViews": {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Значение первичной колонки активной записи реестра
				 */
				"ActiveRow": {dataValueType: Terrasoft.DataValueType.GUID},

				/**
				 * Флаг, указывает пустой ли реестр
				 */
				"IsGridEmpty": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Флаг, указываюший отображать ли в модуле групп статические группы
				 */
				"UseStaticFolders": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					value: false
				},

				/**
				 * Флаг, указываюший доступность работы с тегами
				 */
				"UseTagModule": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					value: true
				},

				/**
				 * Флаг, показывать ли маску загрузки
				 */
				"ShowGridMask": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Флаг, загрузился ли реестр
				 */
				"IsGridLoading": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Флаг, возможность множественного выбора в реестре
				 */
				"MultiSelect": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: false
				},

				/**
				 * Коллекция выбранных записей в реестре
				 */
				"SelectedRows": {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Идентификатор контекстной справки раздела
				 */
				"ContextHelpId": {dataValueType: Terrasoft.DataValueType.INTEGER},

				/**
				 * Коллекция фильтров раздела
				 */
				"SectionFilters": {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Профиль раздела
				 */
				"SectionProfile": {dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT},

				/**
				 * Колличество записей выбираемые в запросе
				 */
				"RowCount": {dataValueType: Terrasoft.DataValueType.INTEGER},

				/**
				 * Флаг, постраничная загрузка в запросе
				 */
				"IsPageable": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Флаг, очищать реестр
				 */
				"IsClearGridData": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Флаг, видимость карточки
				 */
				"IsCardVisible": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Флаг, определяющий возможность запуска модуля тегов
				 */
				"CanShowTags": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Флаг, видимость раздела
				 */
				"IsSectionVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: true
				},

				/**
				 * Коллекция реестра представления аналитики
				 */
				"AnalyticsGridData": {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Флаг,
				 */
				"IsEmptyChart": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 *
				 */
				"AnalyticsChartActiveRow": {dataValueType: Terrasoft.DataValueType.GUID},

				/**
				 *
				 */
				"ReportGridData": {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 *
				 */
				"IsEmptyReports": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 *
				 */
				"ReportActiveRow": {dataValueType: Terrasoft.DataValueType.GUID},

				/**
				 *
				 */
				"IsActionButtonsContainerVisible": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 *
				 */
				"IsAnalyticsActionButtonsContainerVisible": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Коллекция печатных форм раздела в реестра.
				 */
				"SectionPrintMenuItems": {
					dataValueType: Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Видимость кнопки печатных форм раздела.
				 */
				"IsSectionPrintButtonVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},

				/**
				 * Название коллекции меню выпадающего списка в кнопке Действия в режиме отображения реестра.
				 */
				"SeparateModeActionsButtonMenuItems": {
					dataValueType: Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Название коллекции меню выпадающего списка в кнопке Действия в режиме отображения
				 * вертикального реестра и карточки.
				 */
				"CombinedModeActionsButtonMenuItems": {
					dataValueType: Terrasoft.DataValueType.COLLECTION
				},

				/**
				 *
				 */
				"ChartEditSchemaName": {dataValueType: Terrasoft.DataValueType.TEXT},

				/**
				 *
				 */
				"FixedFilterConfig": {dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT},

				/**
				 *
				 */
				"ExtendedFilters": {dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT},

				/**
				 * Имя активного предсталения
				 */
				"ActiveViewName": {dataValueType: Terrasoft.DataValueType.TEXT},

				/**
				 * Флаг, отвечает за видимость действий добавления групп
				 */
				"IsFolderManagerActionsContainerVisible": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Признак видимости действия "добавить в группу"
				 */
				"IsIncludeInFolderButtonVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: true
				},

				/**
				 *
				 */
				"FilterActionsEnabledProperties": {dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT},

				/**
				 * Коллекция колонок меню сортировки
				 */
				"SortColumns": {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Коллекция печатных форм раздела в карточке
				 */
				"CardPrintMenuItems": {
					dataValueType: Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Видимость кнопки печатных форм карточки.
				 */
				"IsCardPrintButtonVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN
				},

				/**
				 * Хранит информацию о необходимости изменения конфигурации колонок текущего реестра.
				 **/
				"GridSettingsChanged": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Значение первичной колонки активной записи, перед перезагрузкой реестра
				 */
				"ActiveRowBeforeReload": {dataValueType: Terrasoft.DataValueType.GUID},

				/**
				 * Название представления "Реестр"
				 */
				"GridDataViewName": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					value: "GridDataView"
				},

				/**
				 * Название представления "Аналитика"
				 */
				"AnalyticsDataViewName": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					value: "AnalyticsDataView"
				},

				/**
				 * Профиль настроек активного представления раздела.
				 */
				"ActiveViewSettingsProfile": {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					value: {}
				},

				/**
				 * Признак открытия карточки находящейся в цепочке
				 */
				"IsCardInChain": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: false
				},

				/**
				 * Сохраненные в профиле фильтры раздела.
				 */
				"ProfileFilters": {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
				},

				/**
				 * Признак видимости кнопки "Запустить процесс"
				 */
				"IsRunProcessButtonVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: false
				},

				/**
				 * Пункты меню кнопки "Запустить процесс"
				 */
				"RunProcessButtonMenuItems": {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Пункты меню кнопки "Процесс"
				 */
				"ProcessButtonMenuItems": {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Коллекция пунктов меню кнопки быстрого добавления активности.
				 */
				"QuickAddMenuItems": {
					dataValueType: Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Название операции доступ на которую должен быть у пользователя для использования раздела
				 */
				SecurityOperationName: {
					dataValueType: Terrasoft.DataValueType.STRING,
					value: null
				},

				/**
				 * Признак видимости действия "Настроить итоги".
				 */
				"IsSummarySettingsVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: true
				},

				/**
				 * Признак видимости кнопки тегов.
				 * @Type {Boolean}
				 */
				"TagButtonVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: false
				},

				/**
				 * Признак наявности прав на использование мастеров.
				 */
				"CanUseWizard": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: false
				}
			},

			/**
			 * Методы модели представления раздела
			 * @type {Object}
			 */
			methods: {

				/**
				 * Загружает модуль итогов.
				 * @private
				 */
				loadDashboardModule: function() {
					if (this.get("Restored")) {
						return;
					}
					var moduleId = this.sandbox.id + "SectionDashboard";
					var rendered = this.sandbox.publish("RerenderModule", {
						renderTo: "DashboardModule"
					}, [moduleId]);
					if (!rendered) {
						this.sandbox.loadModule("SectionDashboardsModule", {
							renderTo: "DashboardModule",
							id: moduleId
						});
					}
				},

				/**
				 * Проверяет, является ли объект раздела администрируемым по записям.
				 * @protected
				 */
				getSchemaAdministratedByRecords: function() {
					return this.entitySchema.administratedByRecords;
				},

				/**
				 * Обрабатывает нажатие на элемент упрваления закрытия раздела
				 * @protected
				 */
				onCloseSectionButtonClick: function() {
					this.hideSection();
					this.removeSectionHistoryState();
					this.updateCardHeader();
					this.updateSectionHeader();
				},

				/**
				 * Генерирует идентификатор модуля страницы
				 * @protected
				 * @return {string} Возвращает идентификатор модуля страницы
				 */
				getCardModuleSandboxId: function() {
					return this.sandbox.id + "_CardModuleV2";
				},

				/**
				 * Получает идентификаторы модулей страницы в режимах:
				 * - открытие в цепочке
				 * - открытие не в цепочке
				 * @return {Array} Возвращает идентификаторы модулей страницы
				 */
				getCardModuleSandboxIdentifiers: function() {
					var identifiers = [];
					identifiers.push(this.getCardModuleSandboxId());
					this.Terrasoft.each(this.getTypeColumnValues(), function(typeColumnValue) {
						identifiers.push(this.getChainCardModuleSandboxId(typeColumnValue));
					}, this);
					return identifiers;
				},

				/**
				 * Герерирует идентификатор модуля страницы для загрузки в цепочке
				 * @protected
				 * @param {String} typeColumnValue Уникальный идентификатор типа для страницы редактирования
				 * @return {string} Возвращает идентификатор модуля страницы для загрузки в цепочке
				 */
				getChainCardModuleSandboxId: function(typeColumnValue) {
					return this.getCardModuleSandboxId() + "_chain" + typeColumnValue;
				},

				/**
				 *
				 * @protected
				 */
				updateCardProperties: function() {
					this.sandbox.publish("UpdateCardProperty", {
						key: "IsSeparateMode",
						value: true
					}, [this.getCardModuleSandboxId()]);
				},

				/**
				 *
				 * @protected
				 */
				updateCardHeader: function() {
					this.sandbox.publish("UpdateCardHeader", null, [this.getCardModuleSandboxId()]);
				},

				/**
				 * Обновляет заголовок верхнего меню страницы раздела
				 * @protected
				 */
				updateSectionHeader: function() {
					var caption = "";
					var typeColumnName = this.get("TypeColumnName");
					var activeRow = this.getActiveRow();
					if (typeColumnName && activeRow) {
						caption = activeRow.get(typeColumnName).displayValue;
					} else {
						caption = this.entitySchema.caption;
					}
					this.sandbox.publish("ChangeHeaderCaption", {
						caption: caption,
						dataViews: new Terrasoft.Collection(),
						moduleName: this.name
					});
				},

				/**
				 *
				 * @protected
				 */
				onBackButtonClick: function() {
					this.showSection();
					this.addSectionHistoryState();
					this.initMainHeaderCaption();
				},

				/**
				 *
				 * @protected
				 */
				onCardAction: function() {
					var tag = arguments[0] || arguments[3];
					this.sandbox.publish("OnCardAction", tag, [this.getCardModuleSandboxId()]);
				},

				/**
				 *
				 * @protected
				 */
				initCardChangedHandler: function() {
					this.sandbox.subscribe("CardChanged", function(config) {
						this.set(config.key, config.value);
					}, this, [this.getCardModuleSandboxId()]);
				},

				/**
				 * Получает коллекцию строк реестра
				 * @protected
				 * @return {Terrasoft.Collection}
				 */
				getGridData: function() {
					return this.get("GridData");
				},

				/**
				 *
				 * @protected
				 */
				showCard: function() {
					var isCardVisible = this.get("IsCardVisible");
					if (isCardVisible) {
						return;
					}
					this.onHideCustomFilter();
					this.onHideFoldersModule();
					this.set("IsCardVisible", true);
					this.onSectionModeChanged();
					var schema = this.Ext.get(this.name + "Container");
					schema.replaceCls("one-el", "two-el");
				},

				/**
				 * Публикует сообщение с текущим состоянием реестра
				 */
				onSectionModeChanged: function() {
					var quickFilterModuleId = this.getQuickFilterModuleId();
					this.sandbox.publish("IsSeparateMode", !this.get("IsCardVisible"), [quickFilterModuleId]);
				},

				/**
				 *
				 * @protected
				 */
				showSection: function() {
					var isSectionVisible = this.get("IsSectionVisible");
					if (isSectionVisible) {
						return;
					}
					this.set("IsSectionVisible", true);
					if (this.get("IsCardVisible")) {
						var schema = this.Ext.get(this.name + "Container");
						schema.replaceCls("one-el", "two-el");
					}
					var section = this.Ext.get("SectionContainer");
					if (section) {
						section.removeCls("display-none");
					}
				},

				/**
				 *
				 * @protected
				 */
				hideSection: function() {
					var isSectionVisible = this.get("IsSectionVisible");
					if (!isSectionVisible) {
						return;
					}
					this.set("IsSectionVisible", false);
					var schema = this.Ext.get(this.name + "Container");
					schema.replaceCls("two-el", "one-el");
					var section = this.Ext.get("SectionContainer");
					if (section) {
						section.addCls("display-none");
					}
				},

				/**
				 * Выгружает модуль карточки, и скрывает ее контейнер
				 * @protected
				 */
				hideCard: function() {
					var isCardVisible = this.get("IsCardVisible");
					if (!isCardVisible) {
						return;
					}
					this.sandbox.unloadModule(this.getCardModuleSandboxId());
					this.set("IsCardVisible", false);
					this.onSectionModeChanged();
					var schema = this.Ext.get(this.name + "Container");
					schema.replaceCls("two-el", "one-el");
				},

				/**
				 *
				 * @protected
				 */
				addSectionHistoryState: function() {
					var historyState = this.sandbox.publish("GetHistoryState");
					var currentState = historyState.state;
					var newState = {
						moduleId: currentState.moduleId
					};
					var hash = historyState.hash;
					historyState = hash.historyState;
					if (historyState.substr(-1) !== "/") {
						historyState += "/";
					}
					var hashItems = historyState.split("/");
					var module = "SectionModuleV2";
					var sectionSchema = this.name;
					var cardSchema = hashItems[1];
					var operation = hashItems[2];
					var primaryColumnValue = hashItems[3];
					historyState = this.Terrasoft.combinePath(module, sectionSchema, cardSchema, operation,
						primaryColumnValue);

					this.sandbox.publish("PushHistoryState", {
						hash: historyState,
						silent: true,
						stateObj: newState
					});
				},

				/**
				 *
				 * @protected
				 */
				addCardHistoryState: function(schemaName, operation, primaryColumnValue) {
					if (!schemaName) {
						return;
					}
					var cardOperationConfig = {
						schemaName: schemaName,
						operation: operation,
						primaryColumnValue: primaryColumnValue
					};
					var stateConfig = this.getCardHistoryStateConfig(cardOperationConfig);
					this.sandbox.publish("PushHistoryState", stateConfig);
				},

				/**
				 * Возвращает конфиг состояния истории браузера для открытия карточки редактирования.
				 * @protected
				 * @param {Object} config Параметры открытия карточки редактирования.
				 * @param {String} config.schemaName Название схемы карточки редактирования.
				 * @param {String} config.operation Тип открытия карточки редактирования.
				 * @param {String} config.primaryColumnValue Значение первичной колонки активной записи раздела.
				 * @return {Object} Конфигурацию состояния истории браузера для открытия карточки редактирования.
				 */
				getCardHistoryStateConfig: function(config) {
					var schemaName = config.schemaName;
					var operation = config.operation;
					var primaryColumnValue = config.primaryColumnValue;
					var historyState = this.sandbox.publish("GetHistoryState");
					var currentState = Terrasoft.deepClone(historyState.state);
					historyState = historyState.hash.historyState;
					primaryColumnValue = primaryColumnValue || "";
					if (historyState.substr(-1) !== "/") {
						historyState += "/";
					}
					var hashItems = historyState.split("/");
					if (hashItems.length === 6) {
						historyState = historyState.replace(hashItems[2], schemaName);
						historyState = historyState.replace(hashItems[3], operation);
						historyState = historyState.replace(hashItems[4], primaryColumnValue);
						historyState = historyState.replace("//", "/");
					}
					if (hashItems.length === 5) {
						if (this.getHistoryStateInfo().workAreaMode === ConfigurationEnums.WorkAreaMode.CARD) {
							historyState = this.Terrasoft.combinePath("CardModuleV2", schemaName, operation,
								primaryColumnValue);
						} else {
							historyState = historyState.replace(hashItems[2], schemaName);
							historyState = historyState.replace(hashItems[3], operation);
							historyState += primaryColumnValue;
							historyState = historyState.replace("//", "/");
						}
					}
					if (hashItems.length === 3) {
						historyState += schemaName + "/" + operation + "/" + primaryColumnValue;
					}
					return {
						hash: historyState,
						stateObj: currentState,
						silent: true
					};
				},

				/**
				 *
				 * @protected
				 */
				removeCardHistoryState: function() {
					var module = "SectionModuleV2";
					var schema = this.name;
					var historyState = this.sandbox.publish("GetHistoryState");
					var currentState = historyState.state;
					var newState = {
						moduleId: currentState.moduleId
					};
					var hash = [module, schema].join("/");
					this.sandbox.publish("PushHistoryState", {
						hash: hash,
						stateObj: newState,
						silent: true
					});
				},

				/**
				 *
				 * @protected
				 */
				removeSectionHistoryState: function() {
					var historyState = this.sandbox.publish("GetHistoryState");
					var currentState = historyState.state;
					var newState = {
						moduleId: currentState.moduleId
					};
					var hash = historyState.hash;
					historyState = hash.historyState;
					if (historyState.substr(-1) !== "/") {
						historyState += "/";
					}
					var stateItems = historyState.split("/");
					var module = "CardModuleV2";
					var schema = stateItems[2];
					var operation = stateItems[3];
					var primaryColumnValue = stateItems[4];
					historyState = [module, schema, operation, primaryColumnValue].join("/");
					this.sandbox.publish("PushHistoryState", {
						hash: historyState,
						stateObj: newState,
						silent: true
					});
				},

				/**
				 *
				 * @protected
				 */
				loadCardModule: function() {
					this.sandbox.loadModule("CardModuleV2", {
						renderTo: "CardContainer"
					});
				},

				/**
				 * Инициализация подписка на сообщение закрытия страницы редактирования
				 * @protected
				 */
				initCloseCardSubscription: function() {
					this.sandbox.subscribe("CloseCard", function() {
						this.closeCard();
						if (!this.get("IsSectionVisible")) {
							this.showSection();
							this.initMainHeaderCaption();
						} else {
							this.restoreMultiSelectState();
						}
					}, this, [this.getCardModuleSandboxId()]);
				},

				/**
				 * Инициализация подписка на сообщение сохранения страницы редактирования
				 * @protected
				 * @virtual
				 */
				initCardModuleResponseSubscription: function() {
					var editCardsSandboxIds = this.getCardModuleResponseTags();
					this.sandbox.subscribe("CardModuleResponse", this.onCardModuleResponse, this, editCardsSandboxIds);
				},

				/**
				 * Генерирует список тэгов для подписки изменения страницы редактирования.
				 * @protected
				 * @virtual
				 * @return {String[]} Список тэгов для подписки изменения страницы редактирования.
				 */
				getCardModuleResponseTags: function() {
					var typeColumnValues = this.getTypeColumnValues();
					var editCardsSandboxIds = typeColumnValues.map(function(typeColumnValue) {
						return this.getChainCardModuleSandboxId(typeColumnValue);
					}, this);
					editCardsSandboxIds.push(this.getCardModuleSandboxId());
					return editCardsSandboxIds;
				},

				/**
				 * Обрабатывает ответ карточки после сохранения записи.
				 * @param {Object} response
				 * @return {Boolean}
				 */
				onCardModuleResponse: function(response) {
					this.set("IsCardInChain", response.isInChain);
					this.loadGridDataRecord(response.primaryColumnValue);
					return true;
				},

				/**
				 * Инициализирует подписки на сообщения карточки новой записи
				 * @protected
				 */
				initAddCardInfoSubscription: function() {
					this.Terrasoft.each(this.getTypeColumnValues(), function(typeColumnValue) {
						this.initGetCardInfoSubscription(typeColumnValue);
					}, this);
				},

				/**
				 * Инициализация подписка на сообщение конкретной страницы редактирования новой записи
				 * @protected
				 */
				initGetCardInfoSubscription: function(typeColumnValue) {
					var typeColumnName = this.get("TypeColumnName");
					if (typeColumnName && typeColumnValue) {
						this.sandbox.subscribe("getCardInfo", function() {
							return this.getCardInfoConfig(typeColumnName, typeColumnValue);
						}, this, [this.getChainCardModuleSandboxId(typeColumnValue)]);
					}
				},

				/**
				 * Возвращает конфигурацию для передачи в карточку параметров и значений по умолчанию.
				 * @param {String} typeColumnName Название колонки типа объекта.
				 * @param {String} typeColumnValue Идентификатор типа объекта.
				 * @return {Object} Конфигурация со значениями по умолчанию.
				 */
				getCardInfoConfig: function(typeColumnName, typeColumnValue) {
					return {
						typeColumnName: typeColumnName,
						typeUId: typeColumnValue
					};
				},

				/**
				 * Получает возможные значения колонки типа.
				 * @protected
				 * @return {Array} Возвращает возможные значения колонки типа.
				 */
				getTypeColumnValues: function() {
					var typeColumnValues = [];
					var editPages = this.get("EditPages");
					editPages.each(function(editPage) {
						var typeColumnValue = editPage.get("Tag");
						typeColumnValues.push(typeColumnValue);
					}, this);
					return typeColumnValues;
				},

				/**
				 * Открывает страницу добавления записи
				 * @protected
				 */
				addRecord: function(typeColumnValue) {
					if (!typeColumnValue) {
						if (this.get("EditPages").getCount() > 1) {
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
				 * Открывает страницу редактирования записи.
				 * @protected
				 * @param {String} primaryColumnValue Уникальный идентификатор записи.
				 */
				editRecord: function(primaryColumnValue) {
					var activeRow = this.getActiveRow();
					var typeColumnValue = this.getTypeColumnValue(activeRow);
					var schemaName = this.getEditPageSchemaName(typeColumnValue);
					this.set("ShowCloseButton", true);
					this.openCard(schemaName, ConfigurationEnums.CardStateV2.EDIT, primaryColumnValue);
				},

				/**
				 * Открывает страницу копирования записи.
				 * @protected
				 * @param {String} primaryColumnValue Уникальный идентификатор записи.
				 */
				copyRecord: function(primaryColumnValue) {
					var activeRow = this.getActiveRow();
					var typeColumnValue = this.getTypeColumnValue(activeRow);
					var schemaName = this.getEditPageSchemaName(typeColumnValue);
					this.openCardInChain({
						id: primaryColumnValue,
						schemaName: schemaName,
						operation: ConfigurationEnums.CardStateV2.COPY,
						moduleId: this.getChainCardModuleSandboxId(typeColumnValue)
					});
				},

				/**
				 * Открывает карточку.
				 * @protected
				 * @param {String} schemaName Имя схемы.
				 * @param {String} operation Действие.
				 * @param {String} primaryColumnValue Уникальный идентификатор записи.
				 */
				openCard: function(schemaName, operation, primaryColumnValue) {
					this.set("ShowGridMask", true);
					var isCardVisible = this.get("IsCardVisible");
					this.showCard();
					if (operation) {
						this.set("IsCardInEditMode", operation === ConfigurationEnums.CardStateV2.EDIT);
					}
					this.removeCardHistoryState();
					this.addCardHistoryState(schemaName, operation, primaryColumnValue);
					var config = {
						schemaName: schemaName,
						primaryColumnValue: primaryColumnValue,
						operation: operation
					};
					this.initTagButtonCaption(primaryColumnValue);
					if (!isCardVisible) {
						this.loadCardModule();
						this.switchActiveRowActions();
						this.reloadGridColumnsConfig(true);
						this.ensureActiveRowVisible();
					} else {
						if (!this.sandbox.publish("GridRowChanged", config, [this.getCardModuleSandboxId()])) {
							this.loadCardModule();
						}
					}
				},

				/**
				 * Обрабатывает сообщение о завершении отрисовки страницы редактирования.
				 * @protected
				 */
				onCardRendered: function() {
					this.set("ShowGridMask", false);
					var activeRow = this.getActiveRow();
					if (!activeRow) {
						var gridData = this.getGridData();
						var historyStateInfo = this.getHistoryStateInfo();
						var primaryColumnValue = historyStateInfo.primaryColumnValue;
						if (gridData.contains(primaryColumnValue)) {
							this.set("ActiveRow", primaryColumnValue);
						} else {
							var isGridLoading = this.get("IsGridLoading");
							var activeRowBeforeReload = this.get("ActiveRowBeforeReload");
							if (!isGridLoading && (activeRowBeforeReload !== primaryColumnValue)) {
								this.loadGridDataRecord(primaryColumnValue);
							}
						}
					}
					this.ensureActiveRowVisible();
					this.restoreCardScrollTop();
				},

				/**
				 * Закрывает карточку.
				 * @protected
				 */
				closeCard: function() {
					this.hideCard();
					this.removeCardHistoryState();
					this.updateCardHeader();
					this.switchActiveRowActions();
					this.reloadGridColumnsConfig(true);
					this.ensureActiveRowVisible();
				},

				/**
				 * Возвращает активную запись.
				 * @protected
				 * @return {Object}
				 */
				getActiveRow: function() {
					var activeRow = null;
					var primaryColumnValue = this.get("ActiveRow");
					if (primaryColumnValue) {
						var gridData = this.getGridData();
						activeRow = gridData.find(primaryColumnValue) ? gridData.get(primaryColumnValue) : null;
					}
					return activeRow;
				},

				/**
				 * Обрабатывает нажатие "действия" активной записи.
				 * @protected
				 * @param {String} buttonTag Тег "действия".
				 * @param {String} primaryColumnValue Уникальный идентификатор активной записи.
				 */
				onActiveRowAction: function(buttonTag, primaryColumnValue) {
					switch (buttonTag) {
						case "edit":
							this.editRecord(primaryColumnValue);
							break;
						case "copy":
							this.copyRecord(primaryColumnValue);
							break;
						case "delete":
							this.deleteRecords();
							break;
						case "print":
							this.printRecord(primaryColumnValue);
							break;
						case "processEntryPoint":
							this.onProcessEntryPointGridRowButtonClick();
							break;
					}
				},

				/**
				 * Сбрасывает состояние.
				 * @protected
				 */
				refreshHistoryState: function() {
					var sandbox = this.sandbox;
					var state = sandbox.publish("GetHistoryState");
					var currentState = state.state || {};
					if (currentState.moduleId === sandbox.id) {
						return;
					}
					this.sandbox.publish("PushHistoryState", {
						hash: state.hash.historyState,
						stateObj: {
							moduleId: sandbox.id
						}
					});
				},

				/**
				 * Устанавливает класс для контейнера раздела в зависимости от активного представления.
				 * @protected
				 * @param {String} viewName Активное представление.
				 */
				updateSectionContainerStyle: function(viewName) {
					var schema = this.Ext.get(this.name + "Container");
					if (!schema) {
						return;
					}
					if (viewName === "AnalyticsDataView") {
						schema.addCls("dashboard-container");
					} else {
						schema.removeCls("dashboard-container");
					}
				},

				/**
				 * Инициирует загрузку сторонних модулей
				 * @protected
				 */
				onRender: function() {
					performanceManager.start(this.sandbox.id + "_AfterRender");
					var isDataReloaded = false;
					this.switchActiveRowActions();
					if (this.get("GridSettingsChanged") === true) {
						isDataReloaded = true;
						this.reloadGridData();
					}
					if (this.get("Restored")) {
						this.reloadGridColumnsConfig(true);
						var historyStateInfo = this.getHistoryStateInfo();
						var historyState = this.sandbox.publish("GetHistoryState");
						if (historyStateInfo.workAreaMode === ConfigurationEnums.WorkAreaMode.COMBINED) {
							this.set("IsCardVisible", false);
							this.showCard();
							if (historyState.state.hasOwnProperty("cardScroll")) {
								var cardScroll = historyState.state.cardScroll;
								this.set("CardScrollTop", cardScroll);
							}
							if (!isDataReloaded) {
								this.reloadGridColumnsConfig(true);
							}
						} else if (historyStateInfo.workAreaMode === ConfigurationEnums.WorkAreaMode.CARD) {
							this.reloadGridColumnsConfig(true);
							this.set("IsSectionVisible", true);
							this.hideSection();
						} else if (historyStateInfo.workAreaMode === ConfigurationEnums.WorkAreaMode.SECTION) {
							this.closeCard();
						}
						var foldersManagerOpened = historyState.state.foldersManagerOpened;
						if (foldersManagerOpened || this.get("IsFoldersVisible")) {
							this.onShowAllFoldersButtonClick();
						} else if (this.get("IsExtendedFiltersVisible")) {
							this.onShowCustomFilter();
						}
						this.setGridOffsetClass(this.get("GridOffsetLinesCount"));
						this.initMainHeaderCaption();
						this.hideBodyMask();
					} else {
						this.initCard();
						this.initFilters();
						this.createScrollTopBtn();
						this.loadSummary();
						this.initMainHeaderCaption();
						this.callParent(arguments);
					}
					var activeViewName = this.get("ActiveViewName");
					this.updateSectionContainerStyle(activeViewName);
					this.changeSelectedSideBarMenu();
					this.subscribeGridEvents();
					this.set("Restored", false);
					performanceManager.stop(this.sandbox.id + "_AfterRender");
				},

				/**
				 * Изменяет выделенное меню раздела в левой панели.
				 * @protected
				 */
				changeSelectedSideBarMenu: function() {
					var moduleConfig = this.getModuleStructure();
					if (moduleConfig) {
						var sectionSchema = moduleConfig.sectionSchema;
						var config = moduleConfig.sectionModule + "/";
						if (sectionSchema) {
							config += moduleConfig.sectionSchema + "/";
						}
						this.sandbox.publish("SelectedSideBarItemChanged", config, ["sectionMenuModule"]);
					}
				},

				/**
				 * Инициализирует начальное состояние модели представления
				 * @protected
				 * @overridden
				 */
				init: function(callback, scope) {
					var performanceManagerLabel = "";
					if (scope && scope.hasOwnProperty("sandbox")) {
						performanceManagerLabel = scope.sandbox.id;
					} else if (this && this.hasOwnProperty("sandbox")) {
						performanceManagerLabel = this.sandbox.id;
					}
					performanceManager.start(performanceManagerLabel + "_Init");
					this.callParent([function() {
						Terrasoft.chain(
							this.checkAvailability,
							this.initViewModelValuesFromSysSettings,
							this.initActiveViewSettingsProfile,
							this.initData,
							function(next) {
								this.canUseWizard(function(result) {
									this.set("CanUseWizard", result);
								}, this);
								this.checkCanManageAnalytics();
								this.initSectionFiltersCollection();
								this.initSortActionItems();
								this.initDataViews();
								this.initActionButtonMenu("Separate", this.getSectionActions());
								this.initSectionViewOptionsButtonMenu(this.getViewOptions());
								this.initEditPages();
								this.initCardContainer();
								this.initContextHelp();
								this.initAddRecordButtonParameters();
								this.initFolders();
								this.initRowCount();
								this.initIsPageable();
								this.initIsActionButtonsContainerVisible();
								this.initUpdateAction();
								this.initResetAction();
								this.initFilterStorage();
								this.initActionsButtonHeaderMenuItemCaption();
								this.subscribeSandboxEvents();
								this.mixins.GridUtilities.init.call(this);
								this.subscribeIsCardVisibleChange();
								this.subscribeGetRunProcessesProperties();
								this.initRunProcessButtonMenu(false);
								this.subscribeCanShowTags();
								this.initTags(this.entitySchemaName);
								next();
							},
							function() {
								performanceManager.stop(performanceManagerLabel + "_Init");
								performanceManager.start(performanceManagerLabel + "_BeforeRender");
								callback.call(scope);
							}, this);
						this.initHelpUrl(this.Terrasoft.emptyFn, this);
						this.initPrintButtonsMenu(this.Terrasoft.emptyFn, this);
					}, this]);
				},

				/**
				 * Выполняет подписку на сообщение об обновлении раздела.
				 * @protected
				 */
				initUpdateAction: function() {
					this.sandbox.subscribe("UpdateSection", this.updateSection, this, [this.name + "_UpdateSection"]);
				},

				/**
				 * Обновляет раздел.
				 * @protected
				 * @virtual
				 */
				updateSection: function() {
					var activeViewName = this.getActiveViewName();
					if (activeViewName === "AnalyticsDataView") {
						this.loadAnalyticsDataView();
					} else {
						this.reloadGridData();
					}
				},

				/**
				 * Выполняет подписку на сообщение о сбросе раздела
				 * @protected
				 */
				initResetAction: function() {
					this.sandbox.subscribe("ResetSection", function() {
						var storage = Terrasoft.configuration.Storage.Filters =
							Terrasoft.configuration.Storage.Filters || {};
						storage[this.name] = {};

						var profile = this.get("Profile");
						profile.Filters = {};
						Terrasoft.utils.saveUserProfile(this.getProfileKey(), profile, false);

						this.set("IgnoreFilterUpdate", true);
						this.onHideCustomFilter();
						this.onHideFoldersModule();
						var emptyFilter = {
							value: "",
							displayValue: ""
						};
						var quickFilterModuleId = this.getQuickFilterModuleId();
						this.sandbox.publish("UpdateExtendedFilter", emptyFilter, [quickFilterModuleId]);
						this.sandbox.publish("UpdateFolderFilter", null, [quickFilterModuleId]);
						this.set("IgnoreFilterUpdate", false);

						var sectionFilters = this.get("SectionFilters");
						sectionFilters.clear();
						this.reloadGridData();
					}, this, [this.name + "_ResetSection"]);
				},

				/**
				 * Выполняет установку заголовка страницы
				 * @protected
				 */
				initMainHeaderCaption: function() {
					var dataViews = this.get("DataViews");
					var activeViewName = this.getActiveViewName();
					var activeView = dataViews.get(activeViewName);
					var activeViewCaption = activeView.caption;
					this.sandbox.publish("ChangeHeaderCaption", {
						caption: activeViewCaption || this.getDefaultGridDataViewCaption(),
						dataViews: dataViews,
						moduleName: this.name
					});
				},

				/**
				 *
				 * @protected
				 */
				initCardContainer: function() {
					this.set("IsCardVisible", false);
				},

				/**
				 *
				 * @protected
				 */
				initCard: function() {
					var historyStateInfo = this.getHistoryStateInfo();
					if (historyStateInfo.workAreaMode === ConfigurationEnums.WorkAreaMode.COMBINED) {
						var schemaName = historyStateInfo.schemas[1];
						var operation = historyStateInfo.operation;
						var primaryColumnValue = historyStateInfo.primaryColumnValue;
						this.openCard(schemaName, operation, primaryColumnValue);
					}
				},

				/**
				 * Выполняет инициализацию представлений раздела.
				 * @protected
				 */
				initDataViews: function() {
					var defaultDataViews = this.getDefaultDataViews();
					var dataViews = this.Ext.create("Terrasoft.Collection");
					var savedActiveViewName = this.getActiveViewNameFromProfile();
					this.Terrasoft.each(defaultDataViews, function(dataView, dataViewName) {
						dataViews.add(dataViewName, dataView, dataView.index);
						if (savedActiveViewName !== "") {
							dataView.active = (dataViewName === savedActiveViewName);
						}
					}, this);
					this.set("DataViews", dataViews);
					this.set("IsGridLoading", false);
					this.sandbox.subscribe("ChangeDataView", this.changeDataView, this,
						["ViewModule_MainHeaderModule_" + this.name]);
					this.sandbox.publish("InitDataViews", {
						caption: this.getDefaultGridDataViewCaption(),
						dataViews: dataViews,
						moduleName: this.name,
						async: true
					});
					this.sandbox.subscribe("GetActiveViewName", function() {
						return this.getActiveViewName();
					}, this);
					this.setActiveView(this.getActiveViewName(), false);
				},

				/**
				 * Изменяет активное предсталение.
				 * Если карточка открыта - закрывает, если раздел закрыт - открывает.
				 * Актуализирует отображение представлений в шапке приложения
				 * @param {Object/String} viewConfig Название представления
				 */
				changeDataView: function(viewConfig) {
					if ((typeof viewConfig !== "string") && viewConfig.moduleName !== this.name) {
						return;
					}
					if (this.get("IsCardVisible")) {
						this.closeCard();
					}
					if (!this.get("IsSectionVisible")) {
						this.showSection();
					}
					var viewName = (typeof viewConfig === "string") ? viewConfig : viewConfig.tag;
					this.setActiveView(viewName, true);
					this.updateSectionContainerStyle(viewName);
					this.refreshHistoryState();
					this.sandbox.publish("ChangeHeaderCaption", {
						caption: this.getDefaultGridDataViewCaption(),
						dataViews: this.get("DataViews"),
						moduleName: this.name
					});
				},

				/**
				 * Инициализирует коллекцию данных рееестра.
				 * @protected
				 */
				initGridData: function() {
					this.set("GridData", this.Ext.create("Terrasoft.BaseViewModelCollection"));
				},

				/**
				 * Инициализирует коллекцию данных рееестра и классы элементов коллекции.
				 * @protected
				 * @param {Function} callback callback-функция.
				 * @param {Object} scope Контекст выполнения callback-функции.
				 */
				initData: function(callback, scope) {
					this.initGridData();
					this.initGridRowViewModel(callback, scope);
				},

				/**
				 * Загружает модуль итогов.
				 * @protected
				 */
				loadSummary: function() {
					if (this.destroyed) {
						return;
					}
					var sectionModuleId = this.sandbox.id;
					this.sandbox.subscribe("GetSectionModuleId", function() {
						return sectionModuleId;
					});
					this.sandbox.subscribe("GetSectionSchemaName", function() {
						return this.entitySchema.name;
					}, this, [this.sandbox.id + "_SummaryModuleV2"]);
					this.loadSummaryModule();
				},

				/**
				 * Загружает модуль отображения итогов.
				 */
				loadSummaryModule: function() {
					this.sandbox.loadModule("SummaryModuleV2", {
						renderTo: "SectionSummaryContainer"
					});
				},

				/**
				 * @inheritdoc Terrasoft.ContextHelpMixin#getContextHelpId
				 * @overridden
				 */
				getContextHelpId: function() {
					return this.get("ContextHelpId");
				},

				/**
				 * @inheritdoc Terrasoft.ContextHelpMixin#getContextHelpCode
				 * @overridden
				 */
				getContextHelpCode: function() {
					return this.name;
				},

				/**
				 * Возвращает индентификатор контекстной справки по работе со статическими группами.
				 * @protected
				 * @virtual
				 * @return {String} Индентификатор контекстной справки по работе со статическими группами.
				 */
				getStaticFolderContextHelpId: function() {
					return ConfigurationConstants.ContextHelp.StaticFolderHelpPageId;
				},

				/**
				 * Возвращает код контекстной справки по работе со статическими группами.
				 * @protected
				 * @virtual
				 * @return {String} Код контекстной справки по работе со статическими группами.
				 */
				getStaticFolderContextHelpCode: function() {
					return ConfigurationConstants.ContextHelp.StaticFolderHelpPageCode;
				},

				/**
				 * Инициализирует ссылку на справку.
				 * @protected
				 * @param {Function} callback callback-функция.
				 * @param {Object} scope Контекст выполнения callback-функции.
				 */
				initHelpUrl: function(callback, scope) {
					var contextHelpConfig = this.getContextHelpConfig();
					var contextHelpCode;
					var contextHelpId;
					if (contextHelpConfig) {
						contextHelpCode = contextHelpConfig.contextHelpCode;
						contextHelpId = contextHelpConfig.contextHelpId;
					}
					var staticFolderHelpConfig = {
						callback: function(url) {
							this.set("StaticFolderHelpUrl", url);
							callback.call(scope);
						},
						scope: this,
						contextHelpId: this.getStaticFolderContextHelpId(),
						contextHelpCode: this.getStaticFolderContextHelpCode()
					};
					var helpConfig = {
						callback: function(url) {
							this.set("HelpUrl", url);
							AcademyUtilities.getUrl(staticFolderHelpConfig);
						},
						scope: this,
						contextHelpId: contextHelpId,
						contextHelpCode: contextHelpCode
					};
					AcademyUtilities.getUrl(helpConfig);
				},

				/**
				 * Инициализирует начальное значение свойства видимости области расширенного выбора групп.
				 * @protected
				 */
				initFolders: function() {
					this.set("IsFoldersVisible", false);
					this.set("IsExtendedFiltersVisible", false);
				},

				/**
				 * Инициализирует значение заголовка кнопки Добавить.
				 * @protected
				 */
				initAddRecordButtonParameters: function() {
					var caption = this.get("Resources.Strings.AddRecordButtonCaption");
					var tag = this.Terrasoft.GUID_EMPTY;
					var editPages = this.get("EditPages");
					var editPagesCount = editPages.getCount();
					if (editPagesCount === 1) {
						var editPage = editPages.getByIndex(0);
						caption = editPage.get("Caption");
						tag = editPage.get("Tag");
					}
					this.set("AddRecordButtonCaption", caption);
					this.set("AddRecordButtonTag", tag);
				},

				/**
				 * Инициализирует начальное значение свойства количество одновременно загружаемых записей при
				 * постраничной загрузке
				 * @protected
				 */
				initRowCount: function() {
					this.set("RowCount", 15);
				},

				/**
				 * Инициализирует начальное значение свойства необходимости использования постраничной загрузки
				 * @protected
				 */
				initIsPageable: function() {
					this.set("IsPageable", true);
				},

				initIsActionButtonsContainerVisible: function() {
					this.set("IsActionButtonsContainerVisible", true);
					this.set("IsAnalytiscActionButtonsContainerVisible", false);
				},

				/**
				 * Инициирует настройки фиксированных фильтров
				 */
				initFixedFiltersConfig: Ext.emptyFn,

				/**
				 * Загружает данные в реестр текущего представления.
				 * @virtual
				 */
				loadActiveViewData: function() {
					var activeViewName = this.getActiveViewName();
					if (activeViewName === this.get("GridDataViewName")) {
						this.loadGridData();
					}
				},

				/**
				 * Обновляет раздел после применения фильтров.
				 * @overridden
				 */
				afterFiltersUpdated: function() {
					this.scrollTop();
					this.loadActiveViewData();
					this.sandbox.publish("FiltersChanged", null, [this.sandbox.id]);
				},

				/**
				 * Возвращает определенный тип фильтров
				 * FixedFilters, CustomFilters, FolderFilters, demoFilters
				 * @protected
				 * @param {String} key
				 * @return {Object}
				 */
				getFilter: function(key) {
					var filters = this.getFilters();
					return filters.find(key) ? filters.get(key) : null;
				},

				/**
				 * Устанавливает определенный тип фильтров
				 * FixedFilters, CustomFilters, FolderFilters, demoFilters
				 * @protected
				 * @param {String} key
				 * @param {Object} value
				 * @param {Object} filtersValue
				 */
				setFilter: function(key, value, filtersValue) {
					var filters = this.get("SectionFilters");
					if (key) {
						if (filters.find(key)) {
							filters.remove(filters.get(key));
						}
						if (key === "FolderFilters" && value.getCount() === 0) {
							this.set("CurrentFolder", null);
						}
						filters.add(key, value);
						this.setVerticalGridOffset(filters);
						this.saveFilter(key, filtersValue, value);
					} else if (value) {
						this.setVerticalGridOffset(filters);
						value.each(function(filter) {
							this.setFilter(filter.key, filter);
						}, this);
					}
				},

				/**
				 * Устанавливает класс для формирования отступа вертикального реестра в зависимости от
				 * количества фильтров.
				 * @param {Terrasoft.FiltersGroup|*} filters Примененные в разделе фильтры.
				 */
				setVerticalGridOffset: function(filters) {
					var linesCount = this.getVerticalGridOffset(filters);
					this.set("GridOffsetLinesCount", linesCount);
					this.setGridOffsetClass(linesCount);
				},

				/**
				 * Подсчитывает количество строк, занимаемых фильтрами в режиме вертикального реестра.
				 * @param {Terrasoft.FiltersGroup} filters Примененные в разделе фиксированные фильтры.
				 * @return {Number}
				 */
				getVerticalGridOffset: function(filters) {
					var linesCount = 1;
					if (this.get("UseTagModule") === true) {
						linesCount++;
					}
					var fixedFilterConfig = this.get("FixedFilterConfig");
					if (!Ext.isEmpty(fixedFilterConfig)) {
						linesCount += fixedFilterConfig.filters.length;
					}
					if (!this.Ext.isEmpty(filters)) {
						filters.each(function(filter) {
							var count = 1;
							if (filter.getCount) {
								count = filter.getCount();
							} else if (filter.length) {
								count = filter.length;
							}
							var key = filter.key;
							if (key === "FixedFilters") {
								linesCount += this.getVerticalGridOffsetForFixedFilter(filter);
							} else if (count > 1 && key === "TagFilters") {
								linesCount += count - 1;
							} else {
								linesCount += count;
							}
						}, this);
					}
					return linesCount;
				},

				/**
				 * Подсчитывает количество дополнительных строк, занимаемых выбранными значениями фиксированных фильтров
				 * в режиме вертикального реестра.
				 * Например каждое выбранное значение фильтра по ответственному занимает одну строку.
				 * Перечисление фильтров по ответственному содержится в фильтре с ключем "OwnerDefaultFilter".
				 * @param {Terrasoft.FiltersGroup} filters Примененные в разделе фиксированные фильтры.
				 * @return {Number}
				 */
				getVerticalGridOffsetForFixedFilter: function(filters) {
					var linesCount = 0;
					filters.each(function(filterItem) {
						if (filterItem.key !== "PeriodFilter") {
							if (filterItem.collection) {
								var ownerFilter = filterItem.collection.findBy(
									function(item, key) {
										return (key === "OwnerDefaultFilter");
									});
								if (ownerFilter) {
									linesCount += ownerFilter.rightExpressions.length;
								} else {
									linesCount += filterItem.getCount();
								}
							} else {
								linesCount += filterItem.rightExpressions.length;
							}
						}
					}, this);
					return linesCount;
				},

				/**
				 * Устанавливает контейнеру реестра класс, который соответствует необходимому количеству строк отступа.
				 * @param {Number|*} linesCount Количество строк.
				 */
				setGridOffsetClass: function(linesCount) {
					var dataViewsContainer = this.Ext.get("DataViewsContainer");
					if (dataViewsContainer) {
						for (var i = 1; i <= 10; i++) {
							dataViewsContainer.removeCls("filter-line-" + i);
						}
						if (!this.needToSetOffset(linesCount)) {
							return;
						}
						linesCount = linesCount > 10 ? 10 : linesCount;
						dataViewsContainer.addCls("filter-line-" + linesCount);
					}
				},

				/**
				 * Проверяет необходимость установки класса контейнеру реестра.
				 * @param {Number|*} linesCount Количество строк.
				 * @return {Boolean}
				 */
				needToSetOffset: function(linesCount) {
					return (linesCount != null);
				},

				/**
				 * Возвращает ключ фильтров раздела
				 * @protected
				 * @return {String} Ключ
				 */
				getFiltersKey: function() {
					var currentTabName = this.getActiveViewName();
					var schemaName = this.name;
					return schemaName + currentTabName + "Filters";
				},

				/**
				 * Сохраняет фильтр в профиль (или в сессию) пользователя.
				 * @param {String} filterKey Имя фильтра.
				 * @param {String} filterValue Сериализованое значение фильтра.
				 * @param {Object} filter
				 */
				saveFilter: function(filterKey, filterValue, filter) {
					if (!filterValue) {
						return;
					}
					var storage = Terrasoft.configuration.Storage.Filters = Terrasoft.configuration.Storage.Filters || {};
					var profileFilters = this.get("ProfileFilters") || {};
					var sessionFilters = storage[this.name] = storage[this.name] || {};
					var sectionFiltersValue = this.get("SectionFiltersValue");
					if (sectionFiltersValue.contains(filterKey)) {
						sectionFiltersValue.removeByKey(filterKey);
					}
					sectionFiltersValue.add(filterKey, filterValue);
					filter.serializationInfo = {serializeFilterManagerInfo: true};
					var serializableFilter = {};
					filter.getSerializableObject(serializableFilter, filter.serializationInfo);
					switch (filterKey) {
						case "CustomFilters":
							Terrasoft.each(filterValue, function(item) {
								var f = item.filter = item.value || "";
								var isSerializedFilter = (typeof f === "string" && f.indexOf("[") >= 0 && f.indexOf("]") >= 0 &&
								f.indexOf("{") >= 0 && f.indexOf("}") >= 0);
								if (!isSerializedFilter) {
									item.filter = Terrasoft.encode(serializableFilter);
								}
							});
							sessionFilters[filterKey] = filterValue;
							break;
						case "FolderFilters":
							profileFilters[filterKey] = filterValue;
							Terrasoft.utils.saveUserProfile(this.getFiltersKey(), profileFilters, false);
							this.set("ProfileFilters", profileFilters);

							break;
						case "FixedFilters":
							filterValue.filter = Terrasoft.encode(serializableFilter);
							profileFilters[filterKey] = {Fixed: filterValue};
							Terrasoft.utils.saveUserProfile(this.getFiltersKey(), profileFilters, false);
							this.set("ProfileFilters", profileFilters);
							break;
						default:
							return;
					}
				},

				/**
				 * Получает настройки для менеджера групп раздела
				 * @return {Object}
				 */
				getFolderManagerConfig: function() {
					var activeFolderId = this.get("activeFolderId");
					this.set("activeFolderId", null);
					return {
						entitySchemaName: this.getFolderEntityName(),
						inFolderEntitySchemaName: this.getInFolderEntityName(),
						entityColumnNameInFolderEntity: this.getEntityColumnNameInFolderEntity(),
						sectionEntitySchema: this.entitySchema,
						activeFolderId: activeFolderId,
						useStaticFolders: this.get("UseStaticFolders")
					};
				},

				/**
				 * Подписывает на сообщения, которые возвращают необходимые для модулей фильтрации данные
				 * @protected
				 */
				subscribeFilterGetConfigMessages: function() {
					var quickFilterModuleId = this.getQuickFilterModuleId();
					var folderManagerModuleId = this.getFolderManagerModuleId();
					var extendedFilterModuleId = this.getExtendedFilterEditModuleId();
					this.sandbox.subscribe("GetSectionEntitySchema", function() {
						return this.entitySchema;
					}, this);
					this.sandbox.subscribe("GetSectionFilterModuleId", function() {
						return quickFilterModuleId;
					}, this);
					this.sandbox.subscribe("GetFixedFilterConfig", function() {
						return this.get("FixedFilterConfig");
					}, this, [quickFilterModuleId]);
					this.sandbox.subscribe("FolderInfo", function() {
						return this.getFolderManagerConfig();
					}, this, [folderManagerModuleId]);
					this.sandbox.subscribe("GetFolderFilter", function() {
						this.getFilter("FolderFilters");
					}, this, [folderManagerModuleId]);
					this.sandbox.subscribe("GetSectionSchemaName", function() {
						return this.entitySchema.name;
					}, this, [extendedFilterModuleId]);
					this.sandbox.subscribe("ApplyResultExtendedFilter", function(args) {
						if (args.filter) {
							if (args.folderEditMode) {
								this.onFilterUpdate("FolderFilters", args.filter);
							} else {
								var displayValue = this.getExtendedFilterDisplayValue(args.filter);
								var extendedFilter = {
									value: args.serializedFilter,
									displayValue: displayValue
								};
								this.sandbox.publish("UpdateExtendedFilter", extendedFilter, [quickFilterModuleId]);
							}
						}
					}, this, [extendedFilterModuleId]);
					this.sandbox.subscribe("ResultFolderFilter", function(args) {
						this.set("CurrentFolder", args);
						var quickFilterModuleId = this.getQuickFilterModuleId();
						this.sandbox.publish("UpdateFolderFilter", args, [quickFilterModuleId]);
					}, this, [folderManagerModuleId]);
					this.sandbox.subscribe("FilterCurrentSection", this.filterCurrentSection, this);
				},

				filterCurrentSection: function(args) {
					if (args.schemaName !== "" && args.schemaName !== this.entitySchema.name) {
						return false;
					}
					var column = {
						value: this.entitySchema.primaryDisplayColumn.name,
						displayValue: this.entitySchema.primaryDisplayColumn.caption,
						dataValueType: this.entitySchema.primaryDisplayColumn.dataValueType
					};
					var filters = [{
						value: args.value,
						column: column
					}];
					var quickFilterModuleId = this.getQuickFilterModuleId();
					this.sandbox.publish("SetCustomFilters", filters, [quickFilterModuleId]);
					return true;
				},

				/**
				 * Выполняет подписки на сообщения, которые понадобятся разделу.
				 * @protected
				 */
				subscribeSandboxEvents: function() {
					var cardModuleSandboxId = this.getCardModuleSandboxId();
					this.sandbox.subscribe("OpenCardInChain", function(config) {
						return this.openCardInChain(config);
					}, this, []);
					this.sandbox.subscribe("CardRendered", function() {
						this.onCardRendered();
					}, this, [cardModuleSandboxId]);
					this.sandbox.subscribe("NeedHeaderCaption", function() {
						this.initMainHeaderCaption();
					}, this);
					this.sandbox.subscribe("GetCardActions", function(actionMenuItems) {
						this.initActionButtonMenu("Combined", actionMenuItems);
					}, this, [cardModuleSandboxId]);
					this.sandbox.subscribe("GetCardViewOptions", this.initCardViewOptionsButtonMenu, this,
						[cardModuleSandboxId]);
					this.sandbox.subscribe("GetDataViews", this.getDataViews, this, this.getCardModuleSandboxIdentifiers());
					this.initCardChangedHandler();
					this.initGetFiltersMessage();
					this.initCloseCardSubscription();
					this.initCardModuleResponseSubscription();
					this.initAddCardInfoSubscription();
					var quickFilterModuleId = this.getQuickFilterModuleId();
					var folderManagerModuleId = this.getFolderManagerModuleId();
					var extendedFilterModuleId = this.getExtendedFilterEditModuleId();
					this.sandbox.subscribe("ShowFolderTree", this.showFolderTree, this,
						[quickFilterModuleId, extendedFilterModuleId]);
					this.sandbox.subscribe("CustomFilterExtendedMode", this.showCustomFilterExtendedMode, this,
						[quickFilterModuleId, folderManagerModuleId]);
					this.sandbox.subscribe("GetFolderEntitiesNames", this.getFolderEntitiesNames, this,
						[quickFilterModuleId, folderManagerModuleId]);
					this.sandbox.subscribe("HideFolderTree", this.onHideFoldersModule, this, [quickFilterModuleId]);
					this.sandbox.subscribe("InitQuickAddMenuItems", function(buttonMenuItems) {
						this.set("QuickAddMenuItems", buttonMenuItems);
						return true;
					}, this, [cardModuleSandboxId]);
					this.sandbox.subscribe("TagChanged", this.reloadTagCount, this, [this.getTagModuleSandboxId()]);
					this.sandbox.subscribe("EntityInitialized", function() {
						this.initTagButton();
					}, this, [cardModuleSandboxId]);
				},

				/**
				 * Возвращает идентификатор модуля тегов.
				 * @return {String} Идентификатор модуля тегов.
				 */
				getTagModuleSandboxId: function() {
					return this.sandbox.id + "_TagModule";
				},

				/**
				 * Возвращает названия объектов груп объекта.
				 * @protected
				 * @virtual
				 * @return {Object} Названия объектов груп объекта.
				 */
				getFolderEntitiesNames: function() {
					return {
						folderSchemaName: this.getFolderEntityName(),
						inFolderSchemaName: this.getInFolderEntityName(),
						entityColumnNameInFolderEntity: this.getEntityColumnNameInFolderEntity(),
						tagSchemaName: this.tagSchemaName,
						inTagSchemaName: this.inTagSchemaName,
						useTagModule: this.get("UseTagModule")
					};
				},

				/**
				 * Сохраняет текущую запись и передает признак быстрого добавления задачи.
				 * @protected
				 * @param {Object} typeColumnValue Значение колонки типа сущности.
				 */
				onQuickAddRecord: function() {
					var typeColumnValue = arguments[arguments.length - 1];
					this.sandbox.publish("OnQuickAddRecord", typeColumnValue, [this.getCardModuleSandboxId()]);
				},

				/**
				 * Получает признак отображения меню быстрого добавления активностей.
				 * @return {Boolean}
				 */
				getQuickAddButtonVisible: function() {
					var collection = this.get("QuickAddMenuItems");
					return (!this.Ext.isEmpty(collection) && !collection.isEmpty());
				},

				/**
				 * Выполняет подписку на событие изменения значения признака видимость карточки.
				 * @private
				 */
				subscribeIsCardVisibleChange: function() {
					this.on("change:IsCardVisible", this.onCardVisibleChanged, this);
				},

				/**
				 * Выполняет подписку на событие изменения значения признака "Карточка сохранена, открыть теги".
				 * @private
				 */
				subscribeCanShowTags: function() {
					this.on("change:CanShowTags", this.onCanShowTagsChanged, this);
				},

				/**
				 * Обработчик события изенения значения признака "Карточка сохранена, открыть теги".
				 * @private
				 */
				onCanShowTagsChanged: function() {
					if (this.get("CanShowTags")) {
						this.showTagModule();
						this.set("CanShowTags", false);
					}
				},

				/**
				 * Регистрирует метод-обработчик на сообщение GetRunProcessesProperties.
				 * @protected
				 */
				subscribeGetRunProcessesProperties: function() {
					this.sandbox.subscribe("GetRunProcessesProperties", function(properties) {
						this.Terrasoft.each(properties, function(property) {
							var viewModelItem = this.get(property.key);
							if (viewModelItem instanceof Terrasoft.Collection) {
								viewModelItem.loadAll(property.value);
							} else {
								this.set(property.key, property.value);
							}
						}, this);
					}, this);
				},

				/**
				 * @obsolete
				 */
				OpenCardInChain: function(config) {
					this.log(this.Ext.String.format(this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
						"OpenCardInChain", "openCardInChain"));
					this.openCardInChain(config);
				},

				/**
				 * Выполняет открытие карточки в цепочке.
				 * @overridden
				 * @param {Object} config Объект с параметрами открываемой карточки.
				 * @return {Boolean} True в случае открытия карточки, false если было обработано нажатие по ссылке.
				 */
				openCardInChain: function(config) {
					if (config.isLinkClick) {
						return false;
					}
					this.saveCardScroll();
					this.scrollCardTop();
					this.callParent(arguments);
					return true;
				},

				/**
				 * Сохраняет скрол карточки в случае открытия следующего модуля в цепочке
				 */
				saveCardScroll: function() {
					if (this.get("IsCardVisible")) {
						var cardScroll = this.get("CardScrollTop") || 0;
						var historyState = this.sandbox.publish("GetHistoryState");
						var state = Terrasoft.deepClone(historyState.state);
						state.cardScroll = cardScroll;
						this.sandbox.publish("ReplaceHistoryState", {
							hash: historyState.hash.historyState,
							silent: true,
							stateObj: state
						});
					}
				},

				/**
				 * Восстанавливает состояние прокрутки страницы редактирования.
				 * @private
				 */
				restoreCardScrollTop: function() {
					var cardScrollTop = this.get("CardScrollTop");
					if (cardScrollTop !== null) {
						this.Ext.getBody().dom.scrollTop = cardScrollTop;
						this.Ext.getDoc().dom.documentElement.scrollTop = cardScrollTop;
					}
				},

				/**
				 *
				 * @protected
				 */
				initSectionFiltersCollection: function() {
					this.set("ProfileFilters", {});
					this.set("SectionFilters", Ext.create("Terrasoft.FilterGroup"));
					this.set("SectionFiltersValue", Ext.create("Terrasoft.Collection"));
				},

				/**
				 *
				 * @protected
				 */
				initFilterActions: function() {
					this.set("FilterActionsEnabledProperties", {});
					this.sandbox.subscribe("FilterActionsEnabledChanged", function(enableConfig) {
						this.set("FilterActionsEnabledProperties", enableConfig);
					}, this);
				},

				/**
				 * Инициализирует хранилища (в профиле и в сессии) фильтров
				 */
				initFilterStorage: function() {
					this.Terrasoft.require(["profile!" + this.getFiltersKey()], function(profile) {
						var profileFilters = this.Terrasoft.deepClone(profile);
						var storage = Terrasoft.configuration.Storage.Filters = Terrasoft.configuration.Storage.Filters || {};
						var sessionFilters = storage[this.name] = storage[this.name] || {};
						var sectionFiltersValue = this.get("SectionFiltersValue");
						var sectionFilters = this.get("SectionFilters");
						var primaryDisplayColumnName = this.entitySchema.primaryDisplayColumn.name;
						var primaryDisplayColumnCaption = this.entitySchema.primaryDisplayColumn.caption;
						var primaryDisplayColumnDataValueType = this.entitySchema.primaryDisplayColumn.dataValueType;
						var sectionSchemaName = this.entitySchema.name;
						var addDynamicFolder = this.addDynamicFolder;
						this.sandbox.subscribe("GetSectionFiltersInfo", function() {
							return sectionFiltersValue;
						}, this, [this.sandbox.id + "_QuickFilterModuleV2"]);

						var applyFilter = function(filterValue, key) {
							Terrasoft.each(filterValue, function(item) {
								if (item.filter) {
									var filter = Terrasoft.deserialize(item.filter);
									if (!sectionFilters.contains(key)) {
										sectionFilters.add(key, Ext.create("Terrasoft.FilterGroup"));
									}
									sectionFilters.get(key).add(filter);
								} else if (item.primaryDisplayColumn) {
									var filters = Ext.create("Terrasoft.FilterGroup");
									filters.addItem(Terrasoft.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.START_WITH, primaryDisplayColumnName, item.value));
									sectionFilters.add(key, filters);
									var column = {
										value: primaryDisplayColumnName,
										displayValue: primaryDisplayColumnCaption,
										dataValueType: primaryDisplayColumnDataValueType
									};
									item.column = column;
								} else if (item.folderInfo) {
									var folderInfo = Ext.decode(item.folderInfo);
									if (folderInfo.FolderType.value === ConfigurationConstants.Folder.Type.General) {
										var folderFilter = Terrasoft.createFilterGroup();
										var inFolderSchemaName = this.getInFolderEntityName();
										var entityColumnNameInFolderEntity = this.getEntityColumnNameInFolderEntity();
										folderFilter.add("filterStaticFolder",
											Terrasoft.createColumnInFilterWithParameters(Ext.String.format(
												"[{0}:{1}:Id].Folder", inFolderSchemaName,
												entityColumnNameInFolderEntity), [item.folderId]));
										sectionFilters.add(key, folderFilter);
										var serializationInfo = folderFilter.getDefSerializationInfo();
										serializationInfo.serializeFilterManagerInfo = true;
										item.value = item.folderId;
										item.displayValue = folderInfo.displayValue;
										item.folderType = folderInfo.FolderType;
										item.filter = folderFilter.serialize(serializationInfo);
										item.sectionEntitySchemaName = sectionSchemaName;
									} else {
										item.value = item.folderId;
										item.displayValue = folderInfo.displayValue;
										item.folderType = folderInfo.FolderType;
										item.sectionEntitySchemaName = sectionSchemaName;
										addDynamicFolder(sectionFilters, item);
									}
									delete sessionFilters.FolderFilters;
								}
							});

							if (sectionFiltersValue.contains(key)) {
								sectionFiltersValue.removeByKey(key);
							}
							if (key === "FixedFilters") {
								filterValue = filterValue.Fixed;
								delete filterValue.filter;
							}
							sectionFiltersValue.add(key, filterValue);
						};
						if (sessionFilters.CustomFilters && sessionFilters.CustomFilters.primaryDisplayColumn) {
							var sessionFiltersFixed = {};
							sessionFiltersFixed.CustomFilters = {};
							sessionFiltersFixed.CustomFilters[primaryDisplayColumnName] = sessionFilters.CustomFilters;
							sessionFilters = sessionFiltersFixed;
						}

						this.Terrasoft.each(profileFilters, applyFilter, this);
						this.Terrasoft.each(sessionFilters, applyFilter, this);
					}, this);
				},

				/**
				 * Получает сериализированный фильтр группы при переходе в раздел по макросу
				 * @param {Object} sectionFilters Группа фильтров раздела
				 * @param {Object} item Конфиг динамической группы
				 */
				addDynamicFolder: function(sectionFilters, item) {
					var select = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: this.getFolderEntityName()
					});
					select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "Id");
					select.addColumn("SearchData");
					var filters = Ext.create("Terrasoft.FilterGroup");
					filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Id",
						item.folderId));
					select.filters = filters;
					select.getEntityCollection(function(response) {
						if (response && response.success) {
							response.collection.each(function(responseItem) {
								sectionFilters.add("FolderFilters",
									Terrasoft.deserialize(responseItem.get("SearchData")));
								item.filter = responseItem.get("SearchData");
							});
						}
					}, this);
				},

				/**
				 * Герерирует идентификатор модуля списка групп.
				 * @protected
				 * @return {String} Идентификатор модуля.
				 */
				getFolderManagerModuleId: function() {
					return this.sandbox.id + "_FolderManagerModule";
				},

				/**
				 * Герерирует идентификатор модуля расширеной фильтрации.
				 * @protected
				 * @return {String} Идентификатор модуля.
				 */
				getExtendedFilterEditModuleId: function() {
					return this.sandbox.id + "_ExtendedFilterEditModule";
				},

				/**
				 * Инициализирует идентификатор модуля быстрой фильтрации, сообщения для совместной с ним работы и
				 * загружает его
				 * @protected
				 */
				initFilters: function() {
					this.initFilterActions();
					this.initFixedFiltersConfig();
					this.subscribeFiltersChanged();
					this.subscribeFilterGetConfigMessages();
					this.loadFiltersModule();
				},

				/**
				 * Открывает модуль расширеной фильтрации.
				 * @protected
				 * @virtual
				 * @param {Object} args Параментры открытия модуля.
				 */
				showCustomFilterExtendedMode: function(args) {
					var quickFilterModuleId = this.getQuickFilterModuleId();
					var folderManagerModuleId = this.getFolderManagerModuleId();
					var extendedFilterModuleId = this.getExtendedFilterEditModuleId();
					this.set("IsFolderManagerActionsContainerVisible", false);
					this.sandbox.subscribe("CustomFilterExtendedModeClose", function(args) {
						this.onHideCustomFilter();
						if (args && args.filter) {
							this.sandbox.publish("UpdateFolderFilter", args, [quickFilterModuleId]);
						}
					}, this, [quickFilterModuleId]);
					var folderEditMode = false;
					var folder = null;
					var filter = null;
					if (args && args.folder) {
						folderEditMode = true;
						folder = args.folder;
						filter = args.filter;
						this.set("activeFolderId", folder.get("Id"));
					}
					this.onShowCustomFilter(folderEditMode);
					this.sandbox.subscribe("GetExtendedFilter", function() {
						var config = {};
						if (folderEditMode) {
							config.filter = filter;
							config.folder = folder;
						} else {
							config.filter = this.getFilter("CustomFilters");
						}
						return config;
					}, this, [extendedFilterModuleId]);
					this.sandbox.unloadModule(folderManagerModuleId, "FoldersContainer");
					this.sandbox.loadModule("ExtendedFilterEditModuleV2", {
						renderTo: "ExtendedFiltersContainer",
						id: extendedFilterModuleId
					});
				},

				/**
				 * Открывает модуль списка групп.
				 * @protected
				 * @virtual
				 * @param {Object} args Параментры открытия модуля.
				 */
				showFolderTree: function(args) {
					var extendedFilterModuleId = this.getExtendedFilterEditModuleId();
					if (this.get("IsFolderManagerActionsContainerVisible")) {
						return;
					}
					if (args && args.activeFolderId) {
						this.set("activeFolderId", args.activeFolderId);
					}
					this.set("IsFolderManagerActionsContainerVisible", true);
					this.onShowAllFoldersButtonClick();
					this.sandbox.unloadModule(extendedFilterModuleId, "ExtendedFiltersContainer");
					this.sandbox.loadModule("FolderManager", {
						renderTo: "FoldersContainer",
						id: this.getFolderManagerModuleId()
					});
				},

				/**
				 * Загружает модуль фильтров.
				 */
				loadFiltersModule: function() {
					performanceManager.start("QuickFilterModuleV2_BeforeLoad");
					performanceManager.start("QuickFilterModuleV2_FiltersRecived");
					this.sandbox.loadModule("QuickFilterModuleV2", {
						renderTo: "SectionFiltersContainer",
						id: this.getQuickFilterModuleId()
					});
				},

				/**
				 * Показывает область расширенного выбора групп
				 * @protected
				 */
				onShowAllFoldersButtonClick: function() {
					var isSeparateMode = !this.get("IsCardVisible");
					if (!isSeparateMode) {
						this.closeCard();
					}
					var schema = this.Ext.get("FoldersAndDataViewContainer");
					if (schema) {
						schema.replaceCls("one-el", "two-el");
						schema.addCls("folder-edit-mode");
					}
					this.set("IsExtendedFiltersVisible", false);
					this.set("IsFoldersVisible", true);
					var dataViewsContainer = Ext.get("DataViewsContainer");
					if (dataViewsContainer) {
						dataViewsContainer.addCls("data-views-with-folders-container-wrapClass");
					}
				},

				/**
				 * Скрывает область расширенного выбора групп
				 * @protected
				 */
				onHideFoldersModule: function() {
					this.set("IsFolderManagerActionsContainerVisible", false);
					var quickFilterModuleId = this.getQuickFilterModuleId();
					var folderManagerModuleId = this.getFolderManagerModuleId();
					this.sandbox.unloadModule(folderManagerModuleId, "FoldersContainer");
					this.sandbox.publish("UpdateCustomFilterMenu", {
						"isFoldersHidden": true,
						"clearActiveFolder": true
					}, [quickFilterModuleId]);
					var schema = this.Ext.get("FoldersAndDataViewContainer");
					if (schema) {
						schema.replaceCls("two-el", "one-el");
						schema.removeCls("folder-edit-mode");
					}
					this.set("IsFoldersVisible", false);
					var dataViewsContainer = Ext.get("DataViewsContainer");
					if (dataViewsContainer) {
						dataViewsContainer.removeCls("data-views-with-folders-container-wrapClass");
					}
				},

				/**
				 *
				 * @protected
				 */
				onShowCustomFilter: function(folderEditMode) {
					var isSeparateMode = !this.get("IsCardVisible");
					if (!isSeparateMode) {
						this.closeCard();
					}
					var schema = this.Ext.get("FoldersAndDataViewContainer");
					if (schema) {
						schema.replaceCls("one-el", "two-el");
						if (folderEditMode) {
							schema.addCls("folder-edit-mode");
						} else {
							schema.removeCls("folder-edit-mode");
						}
					}
					this.set("IsFoldersVisible", false);
					this.set("IsExtendedFiltersVisible", true);
					var dataViewsContainer = Ext.get("DataViewsContainer");
					if (dataViewsContainer) {
						dataViewsContainer.addCls("data-views-with-folders-container-wrapClass");
					}
				},

				/**
				 *
				 * @protected
				 */
				onHideCustomFilter: function() {
					var extendedFilterModuleId = this.getExtendedFilterEditModuleId();
					var quickFilterModuleId = this.getQuickFilterModuleId();
					this.sandbox.unloadModule(extendedFilterModuleId, "ExtendedFiltersContainer");
					this.sandbox.publish("UpdateCustomFilterMenu", {"isExtendedModeHidden": true}, [quickFilterModuleId]);
					var schema = this.Ext.get("FoldersAndDataViewContainer");
					if (schema) {
						schema.replaceCls("two-el", "one-el");
						schema.removeCls("folder-edit-mode");
					}
					this.set("IsExtendedFiltersVisible", false);
					var dataViewsContainer = Ext.get("DataViewsContainer");
					if (dataViewsContainer) {
						dataViewsContainer.removeCls("data-views-with-folders-container-wrapClass");
					}
				},

				/**
				 *
				 * @protected
				 * @param {Object} extendedFilter
				 * @return {String}
				 */
				getExtendedFilterDisplayValue: function(extendedFilter) {
					var comparisonTypeFlipped = Terrasoft.invert(Terrasoft.ComparisonType);
					var logicalOperatorTypeFlipped = Terrasoft.invert(Terrasoft.LogicalOperatorType);

					function getComparisonDisplayValue(comparison) {
						var comparisonType = comparisonTypeFlipped[comparison];
						return Terrasoft.Resources.ComparisonType[comparisonType];
					}

					function getLogicalOperatorDisplayValue(operator) {
						var type = logicalOperatorTypeFlipped[operator];
						return Terrasoft.Resources.LogicalOperatorType[type];
					}

					var displayValue = "";

					function getDisplayValue(filter) {
						if (this.index++ > 0) {
							displayValue = displayValue + " " +
							getLogicalOperatorDisplayValue(this.logicalOperation) + " ";
						}
						if (filter.collection) {
							if (filter.collection.length > 0) {
								var innerScope = {
									level: this.level + 1,
									index: 0,
									logicalOperation: filter.logicalOperation,
									getDisplayValue: this.getDisplayValue
								};
								if (this.level !== 0) {
									displayValue = displayValue + "(";
								}
								filter.each(getDisplayValue, innerScope);
								if (this.level !== 0) {
									displayValue = displayValue + ")";
								}
							}
						} else {
							displayValue = displayValue + filter.leftExpressionCaption + " " +
							getComparisonDisplayValue(filter.comparisonType) + " " +
							Terrasoft.getRightExpressionDisplayValue(filter);
						}
					}

					var scope = {
						level: 0,
						index: 0,
						logicalOperation: 0,
						getDisplayValue: getDisplayValue
					};
					scope.getDisplayValue(extendedFilter);
					return displayValue;
				},

				/**
				 * Возвращает заголовок представления реестра по умолчанию
				 * @protected
				 * @return {String}
				 */
				getDefaultGridDataViewCaption: function() {
					return this.getModuleCaption();
				},

				/**
				 * Возвращает иконку представления реестра по умолчанию
				 * @protected
				 * @return {String}
				 */
				getDefaultGridDataViewIcon: function() {
					return this.get("Resources.Images.GridDataViewIcon");
				},

				/**
				 * Возвращает представления раздела по умолчанию.
				 * Реестр, Аналитика
				 * @protected
				 * @return {Object} Представления раздела по умолчанию
				 */
				getDefaultDataViews: function() {
					var gridDataView = {
						name: this.get("GridDataViewName"),
						caption: this.getDefaultGridDataViewCaption(),
						icon: this.getDefaultGridDataViewIcon()
					};
					var analyticsDataView = {
						name: this.get("AnalyticsDataViewName"),
						caption: this.getDefaultAnalyticsDataViewCaption(),
						icon: this.getDefaultAnalyticsDataViewIcon()
					};
					return {
						"GridDataView": gridDataView,
						"AnalyticsDataView": analyticsDataView
					};
				},

				/**
				 * Открывает страницу поиска дублей
				 * @protected
				 */
				findDuplicates: this.Ext.emptyFn,

				/**
				 * Инициализирует фильтры экземпляра запроса
				 * @protected
				 * @param {Terrasoft.EntitySchemaQuery} esq
				 */
				initQueryFilters: function(esq) {
					var filters = this.getFilters();
					if (filters) {
						esq.filters.addItem(filters);
					}
				},

				/**
				 * Возвращает примененные фильтры
				 * @protected
				 * @return {Terrasoft.FilterGroup|*}
				 */
				getFilters: function() {
					var sectionFilters = this.get("SectionFilters");
					var serializationInfo = sectionFilters.getDefSerializationInfo();
					serializationInfo.serializeFilterManagerInfo = true;
					var deserializedFilters = Terrasoft.deserialize(sectionFilters.serialize(serializationInfo));
					return deserializedFilters;
				},

				/**
				 * Получает набор фильтров для построения отчета.
				 * @param {String} recordId Уникальный идентификатор выбранной записи, для которой генерируются фильтры.
				 * @return {Terrasoft.FilterGroup} Возвращает набор фильтров для построения отчета.
				 */
				getReportFilters: function(recordId) {
					var filters = this.getFilters();
					if (this.isAnySelected()) {
						filters.clear();
						var selectedRows = (recordId && [recordId]) || this.getSelectedItems();
						filters.name = "primaryColumnFilter";
						filters.logicalComparisonTypes = Terrasoft.LogicalOperatorType.AND;
						var filter = Terrasoft.createColumnInFilterWithParameters("Id", selectedRows);
						filters.addItem(filter);
					}
					return filters;
				},

				/**
				 * Получает значение первичной колонки выбранной записи
				 * @return {String} Возвращает значение первичной колонки выбранной записи
				 */
				getPrimaryColumnValue: function() {
					return this.get("ActiveRow");
				},

				/**
				 * Генерирует список отчетов
				 * @protected
				 */
				initPrintButtonsMenu: function(callback, scope) {
					this.initSectionPrintForms();
					this.initCardPrintForms();
					this.initCurrentModuleReports();
					if (callback) {
						callback.call(scope || this);
					}
				},

				/**
				 * Возвращает значение свойства "Видимость" для элемента выпадающего списка кнопки Печать.
				 * @param {String} reportId Идентификатор отчета.
				 * @return {Boolean} Возвращает значение свойства "Видимость" для элемента выпадающего списка кнопки
				 * Печать.
				 */
				getPrintMenuItemVisible: function(reportId) {
					var primaryColumnValue = this.get("ActiveRow");
					if (!primaryColumnValue) {
						return false;
					}
					var gridData = this.getGridData();
					if (gridData.contains(primaryColumnValue)) {
						var activeRow = gridData.get(primaryColumnValue);
						var typeColumnValue = this.getTypeColumnValue(activeRow);
						var reportTypeColumnValue = this.getReportTypeColumnValue(reportId);
						return (reportTypeColumnValue === typeColumnValue);
					}
				},

				/**
				 * Инициализирует выпадающий список кнопки "Действия".
				 * @protected
				 * @param {String} modeType Название типа отображения раздела
				 * @param {Terrasoft.BaseViewModelCollection} actionMenuItems
				 */
				initActionButtonMenu: function(modeType, actionMenuItems) {
					var collectionName = modeType + "ModeActionsButtonMenuItems";
					var collection = this.get(collectionName);
					if (actionMenuItems.getCount()) {
						this.set(modeType + "ModeActionsButtonVisible", true);
						var newCollection = this.Ext.create("Terrasoft.BaseViewModelCollection");
						actionMenuItems.each(function(item) {
							var newItem = this.cloneBaseViewModel(item);
							newCollection.addItem(newItem);
						}, this);
						if (collection) {
							collection.clear();
							collection.loadAll(newCollection);
						} else {
							this.set(collectionName, newCollection);
						}
					} else {
						this.set(modeType + "ModeActionsButtonVisible", false);
					}
				},

				/**
				 * Инициализирует пункты меню кнопки "Вид"
				 * @protected
				 * @virtual
				 * @param {String} collectionName Название инициализируемой коллекции
				 * @param {Terrasoft.BaseViewModelCollection} viewOptions Пункты меню
				 */
				initViewOptionsButtonMenu: function(collectionName, viewOptions) {
					var collection = this.get(collectionName);
					var newCollection = this.Ext.create("Terrasoft.BaseViewModelCollection");
					viewOptions.each(function(item) {
						var newItem = this.cloneBaseViewModel(item);
						newCollection.addItem(newItem);
					}, this);
					if (collection) {
						collection.clear();
						collection.loadAll(newCollection);
					} else {
						this.set(collectionName, newCollection);
					}
				},

				/**
				 * Инициализирует пункты меню кнопки "Вид" раздела
				 * @protected
				 * @virtual
				 * @param {Terrasoft.BaseViewModelCollection} viewOptions Пункты меню
				 */
				initSectionViewOptionsButtonMenu: function(viewOptions) {
					this.initViewOptionsButtonMenu("SeparateModeViewOptionsButtonMenuItems", viewOptions);
				},

				/**
				 * Инициализирует пункты меню кнопки "Вид" карточки
				 * @protected
				 * @virtual
				 * @param {Terrasoft.BaseViewModelCollection} viewOptions Пункты меню
				 */
				initCardViewOptionsButtonMenu: function(viewOptions) {
					this.initViewOptionsButtonMenu("CombinedModeViewOptionsButtonMenuItems", viewOptions);
				},

				/**
				 * Клонирует все значения модели представления, обрабатывает вложеные коллекции.
				 * @param {Terrasoft.BaseViewModel} originalItem Модель представления.
				 * @return {Terrasoft.BaseViewModel|*} Новая модель представления с скопированными значениями.
				 */
				cloneBaseViewModel: function(originalItem) {
					var newItem = this.Ext.create("Terrasoft.BaseViewModel");
					this.Terrasoft.each(originalItem.values, function(itemValue, valueName) {
						if (!(itemValue instanceof Terrasoft.Collection)) {
							newItem.set(valueName, this.Terrasoft.deepClone(itemValue));
						} else {
							var newItemsCollection = this.Ext.create("Terrasoft.BaseViewModelCollection");
							itemValue.each(function(item) {
								newItemsCollection.add(this.cloneBaseViewModel(item));
							}, this);
							newItem.set(valueName, newItemsCollection);
						}
					}, this);
					return newItem;
				},

				/**
				 * Возвращает значение видимости для действия множественный выбор.
				 * @return {Boolean} Видимость пункта меню.
				 */
				isMultiSelectVisible: function() {
					return !this.get("MultiSelect");
				},

				/**
				 * Возвращает значение видимости для действия отменить множественный выбор.
				 * @return {Boolean} Видимость пункта меню.
				 */
				isSingleSelectVisible: function() {
					return this.get("MultiSelect");
				},

				/**
				 * Возвращает значение видимости для действия снять все выделения.
				 * @return {Boolean} Видимость пункта меню.
				 */
				isUnSelectVisible: function() {
					return this.isAnySelected();
				},

				getFolderMenuItems: function() {
					if (this.get("UseStaticFolders")) {
						var addFolderButtonMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
						addFolderButtonMenuItems.addItem(this.getButtonMenuItem({
							"Caption": {"bindTo": "Resources.Strings.AddDynamicFolderButtonCaption"},
							"Click": {"bindTo": "onAddDynamicFolder"},
							"Visible": {"bindTo": "UseStaticFolders"}
						}));
						addFolderButtonMenuItems.addItem(this.getButtonMenuItem({
							"Caption": {"bindTo": "Resources.Strings.AddStaticFolderButtonCaption"},
							"Click": {"bindTo": "onAddStaticFolder"},
							"Visible": {"bindTo": "UseStaticFolders"}
						}));
						return addFolderButtonMenuItems;
					} else {
						return null;
					}
				},

				/**
				 * Возвращает коллекцию действий раздела в режиме отображения реестра
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий раздела в режиме
				 * отображения реестра
				 */
				getSectionActions: function() {
					var actionMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
					actionMenuItems.addItem(this.getButtonMenuItem({
						Caption: {"bindTo": "SeparateModeActionsButtonHeaderMenuItemCaption"},
						Type: "Terrasoft.MenuSeparator",
						Visible: {bindTo: "IsExtendedFiltersVisible"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.SelectMultipleRecordsButtonCaption"},
						"Click": {"bindTo": "setMultiSelect"},
						"Visible": {"bindTo": "isMultiSelectVisible"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.SelectOneRecordButtonCaption"},
						"Click": {"bindTo": "unSetMultiSelect"},
						"Visible": {"bindTo": "isSingleSelectVisible"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.UnselectAllButtonCaption"},
						"Click": {"bindTo": "unSelectRecords"},
						"Visible": {"bindTo": "MultiSelect"},
						"Enabled": {"bindTo": "isUnSelectVisible"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.ExportListToFileButtonCaption"},
						"Click": {"bindTo": "exportToFile"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.IncludeInFolderButtonCaption"},
						"Click": {"bindTo": "openStaticGroupLookup"},
						"Enabled": {"bindTo": "isAnySelected"},
						"Visible": {"bindTo": "UseStaticFolders"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.ExcludeFromFolderButtonCaption"},
						"Click": {"bindTo": "excludeFromFolder"},
						"Enabled": {"bindTo": "isAnySelected"},
						"Visible": {"bindTo": "UseStaticFolders"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						Caption: {bindTo: "Resources.Strings.DeleteRecordButtonCaption"},
						Enabled: {bindTo: "isAnySelected"},
						Visible: {bindTo: "MultiSelect"},
						Click: {bindTo: "deleteRecords"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						Caption: {bindTo: "Resources.Strings.FiltersCaption"},
						Type: "Terrasoft.MenuSeparator",
						Visible: {bindTo: "IsExtendedFiltersVisible"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						Caption: {bindTo: "Resources.Strings.GroupMenuItemCaption"},
						Click: {bindTo: "groupFilterItems"},
						Enabled: {
							bindTo: "FilterActionsEnabledProperties",
							bindConfig: {
								"converter": function(value) {
									return value ? value.groupBtnState : false;
								}
							}
						},
						Visible: {bindTo: "IsExtendedFiltersVisible"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						Caption: {bindTo: "Resources.Strings.UnGroupMenuItemCaption"},
						Click: {bindTo: "unGroupFilterItems"},
						Enabled: {
							bindTo: "FilterActionsEnabledProperties",
							bindConfig: {
								"converter": function(value) {
									return value ? value.unGroupBtnState : false;
								}
							}
						},
						Visible: {bindTo: "IsExtendedFiltersVisible"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						Caption: {bindTo: "Resources.Strings.MoveUpMenuItemCaption"},
						Click: {bindTo: "moveUpFilter"},
						Enabled: {
							bindTo: "FilterActionsEnabledProperties",
							bindConfig: {
								"converter": function(value) {
									return value ? value.moveUpBtnState : false;
								}
							}
						},
						Visible: {bindTo: "IsExtendedFiltersVisible"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						Caption: {bindTo: "Resources.Strings.MoveDownMenuItemCaption"},
						Click: {bindTo: "moveDownFilter"},
						Enabled: {
							bindTo: "FilterActionsEnabledProperties",
							bindConfig: {
								"converter": function(value) {
									return value ? value.moveDownBtnState : false;
								}
							}
						},
						Visible: {bindTo: "IsExtendedFiltersVisible"}
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						Visible: {bindTo: "IsExtendedFiltersVisible"},
						Type: "Terrasoft.MenuSeparator",
						Caption: ""
					}));
					return actionMenuItems;
				},

				/**
				 * Получает пункты меню кнопки "Вид"
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает пункты меню кнопки "Вид"
				 */
				getViewOptions: function() {
					var viewOptions = this.Ext.create("Terrasoft.BaseViewModelCollection");
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.SortMenuCaption"},
						"Items": {"bindTo": "SortColumns"}
					}));
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.OpenSummarySettingsModuleButtonCaption"},
						"Click": {"bindTo": "openSummarySettings"},
						"Visible": {"bindTo": "IsSummarySettingsVisible"}
					}));
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.OpenGridSettingsCaption"},
						"Click": {"bindTo": "openGridSettings"}
					}));
					viewOptions.addItem(this.getButtonMenuSeparator());
					this.addChangeDataViewOptions(viewOptions);
					viewOptions.addItem(this.getButtonMenuSeparator());
					this.addSectionDesignerViewOptions(viewOptions);
					return viewOptions;
				},

				/**
				 * Проверяет может ли операция выполнятся над сущностью
				 * @protected
				 * @virtual
				 * @return {Boolean} Возвращает true если можно выполнять операцию над сущностью
				 * и false в противном случае
				 */
				canEntityBeOperated: function() {
					return this.get("IsCardInEditMode");
				},

				/**
				 * Добавляет пункты переключения представлений в меню кнопки "Вид"
				 * @param {Terrasoft.BaseViewModelCollection} viewOptions Пункты меню кнопки "Вид"
				 */
				addChangeDataViewOptions: function(viewOptions) {
					var dataViews = this.get("DataViews");
					if (!dataViews.contains(this.get("AnalyticsDataViewName"))) {
						return;
					}
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.AnalyticsDataViewCaption"},
						"Click": {"bindTo": "changeDataView"},
						"Tag": this.get("AnalyticsDataViewName")
					}));
				},

				/**
				 * Добавляет пункт открытия Мастера раздела в меню кнопки "Вид"
				 * @param {Terrasoft.BaseViewModelCollection} viewOptions Пункты иеню кнопки "Вид"
				 */
				addSectionDesignerViewOptions: function(viewOptions) {
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.OpenSectionDesignerButtonCaption"},
						"Click": {"bindTo": "startSectionDesigner"},
						"Visible": {"bindTo": "getCanDesignSection"}
					}));
				},

				/**
				 * Возвращает информацию о достуности мастера страницы.
				 * @protected
				 * @virtual
				 * @return {Boolean} true - если мастер страницы доступен, false - в обратном случае.
				 */
				getCanDesignPage: function() {
					return this.getCanDesignSection();
				},

				/**
				 * Возвращает информацию о достуности мастера раздела.
				 * @protected
				 * @virtual
				 * @return {Boolean} true - если мастер раздела доступен, false - в обратном случае.
				 */
				getCanDesignSection: function() {
					var isSchemaRegisteredInModuleStructure =
						!Ext.isEmpty(Terrasoft.configuration.ModuleStructure[this.entitySchemaName]);
					var canUseWizard = this.get("CanUseWizard");
					return Ext.isEmpty(canUseWizard) ? false : (canUseWizard && isSchemaRegisteredInModuleStructure);
				},

				/**
				 * Проверяет нужно ли отображать кнопку сохранения новой записи
				 * @protected
				 * @virtual
				 * @return {Boolean} Возвращает true если нужно показывать кнопку сохранения новой записи
				 * и false в противном случае
				 */
				showNewRecordSaveButton: function() {
					return !this.get("IsCardInEditMode") && this.get("ShowSaveButton");
				},

				/**
				 * Проверяет нужно ли отображать кнопку сохранения существующей записи
				 * @protected
				 * @virtual
				 * @return {Boolean} Возвращает true если нужно показывать кнопку сохранения существующей записи
				 * и false в противном случае
				 */
				showExistingRecordSaveButton: function() {
					return this.get("IsCardInEditMode") && this.get("ShowSaveButton");
				},

				/**
				 * Возвращает коллекцию действий карточки
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий карточки
				 */
				getCardActions: function() {
					var actionMenuItems = this.sandbox.publish("GetCardActions");
					return actionMenuItems;
				},

				/**
				 * Выполняет загрузку представления списка
				 * @protected
				 */
				loadGridDataView: function(loadData) {
					this.set("IsActionButtonsContainerVisible", true);
					this.set("IsAnalyticsActionButtonsContainerVisible", false);
					if (loadData) {
						this.loadGridData();
					}
				},

				/**
				 * Выполняет загрузку представления аналитики
				 * @protected
				 */
				loadAnalyticsDataView: function() {
					this.set("IsActionButtonsContainerVisible", false);
					this.set("IsAnalyticsActionButtonsContainerVisible", true);
					this.scrollTop();
				},

				/**

				 * Делает активным указанное представление. Инициирует его загрузку.
				 * Все остальные представления скрываются.
				 * @protected
				 * @param {String} activeViewName Название представления.
				 * @param {Boolean} loadData Флаг загрузки данных.
				 */
				setActiveView: function(activeViewName, loadData) {
					this.showBodyMask();
					if (!this.get("IsCardVisible")) {
						this.hideCard();
					}
					var dataViews = this.get("DataViews");
					dataViews.each(function(dataView) {
						var isViewActive = (dataView.name === activeViewName);
						this.setViewVisible(dataView, isViewActive);
					}, this);
					this.loadView(activeViewName, loadData);
					this.hideBodyMask();
				},

				/**
				 * Получает имя активного представления.
				 * @protected
				 * @return {String} Имя представления.
				 */
				getActiveViewName: function() {
					var activeViewName = this.get("GridDataViewName");
					var dataViews = this.get("DataViews");
					if (dataViews) {
						dataViews.each(function(dataView) {
							if (dataView.active) {
								activeViewName = dataView.name;
							}
						}, this);
					}
					return activeViewName;
				},

				/**
				 * Получает имя активного представления из профиля.
				 * @protected
				 * @return {String} Имя представления.
				 */
				getActiveViewNameFromProfile: function() {
					var profile = this.get("ActiveViewSettingsProfile");
					if (profile && profile.hasOwnProperty("activeViewName")) {
						return profile.activeViewName;
					}
					return "";
				},

				/**
				 * Запрашивает профиль для текущего активного представления.
				 * @param {Function} callback Callback-функция.
				 * @param {Object} scope Контекст.
				 */
				initActiveViewSettingsProfile: function(callback, scope) {
					var profileKey = this.getActiveViewSettingsProfileKey();
					this.Terrasoft.require(["profile!" + profileKey], function(profile) {
						this.set("ActiveViewSettingsProfile", profile);
						callback.call(scope);
					}, this);
				},

				/**
				 * Инициализирует значения модели представления, полученные из системных настроек.
				 * @param {Function} callback Callback-функция.
				 * @param {Object} scope Контекст.
				 */
				initViewModelValuesFromSysSettings: function(callback, scope) {
					callback.call(scope);
				},

				/**
				 * Запрашивает профиль настроек реестра для текущего активного представления.
				 * @protected
				 * @param {Function} callback Callback-функция.
				 * @param {Object} scope Контекст.
				 */
				getActiveViewGridSettingsProfile: function(callback, scope) {
					this.Terrasoft.require(["profile!" + this.getProfileKey()], function(profile) {
						this.set("Profile", profile);
						callback.call(scope);
					}, this);
				},

				/**
				 * Сохранят имя активного представления в профиле.
				 * @protected
				 * @param {String} activeViewName Имя активного представления.
				 */
				saveActiveViewNameToProfile: function(activeViewName) {
					var profileKey = this.getActiveViewSettingsProfileKey();
					var profile = this.get("ActiveViewSettingsProfile") || {};
					if (profile.activeViewName && profile.activeViewName === activeViewName) {
						return;
					}
					profile.activeViewName = activeViewName;
					this.set("ActiveViewSettingsProfile", profile);
					this.Terrasoft.utils.saveUserProfile(profileKey, profile, false);
				},

				/**
				 *
				 * @protected
				 */
				getDataViewVisiblePropertyName: function(dataViewName) {
					return this.Ext.String.format("Is{0}Visible", dataViewName);
				},

				/**
				 * Изменяет видимость указанного представления
				 * @protected
				 * @param {Object} dataView Представления раздела
				 * @param {Boolean} value Значение видимости
				 */
				setViewVisible: function(dataView, value) {
					var dataViewVisiblePropertyName = this.getDataViewVisiblePropertyName(dataView.name);
					this.set(dataViewVisiblePropertyName, value);
					dataView.active = value;
				},

				/**
				 * Инициирует загрузку указанного представления.
				 * @protected
				 * @param {String} dataViewName Название представления раздела.
				 * @param {Boolean} loadData Флаг загрузки данных.
				 */
				loadView: function(dataViewName, loadData) {
					this.set("ActiveViewName", dataViewName);
					this.saveActiveViewNameToProfile(dataViewName);
					this.getActiveViewGridSettingsProfile(function() {
						this["load" + dataViewName](loadData);
					}, this);
				},

				/**
				 * Инициализирует начальное значение свойства необходимости использования постраничной загрузки
				 * @protected
				 */
				needLoadData: function() {
					if (!this.get("CanLoadMoreData")) {
						return;
					}
					if (this.get("IsActionButtonsContainerVisible")) {
						this.loadGridData();
					} else if (this.get("IsAnalyticsActionButtonsContainerVisible")) {
						this.loadAnalyticsDataView();
					}
				},

				/**
				 * Возвращает ключ профиля.
				 * @protected
				 * @return {String} Ключ.
				 */
				getProfileKey: function() {
					var currentTabName = this.getActiveViewName();
					var schemaName = this.name;
					return schemaName + "GridSettings" + currentTabName;
				},

				/**
				 * Возвращает ключ профиля активного представления.
				 * @protected
				 * @return {String} Ключ.
				 */
				getActiveViewSettingsProfileKey: function() {
					var schemaName = this.name;
					return schemaName + "ActiveViewSettingsProfile";
				},

				/**
				 *
				 * @protected
				 * @param {String} gridType
				 * @return {String}
				 */
				getDataGridName: function(gridType) {
					var dataGridName = "DataGrid";
					if (gridType) {
						if (gridType === "vertical") {
							dataGridName += "VerticalProfile";
						}
					} else {
						var isCardVisible = this.get("IsCardVisible");
						if (isCardVisible === true) {
							dataGridName += "VerticalProfile";
						}
					}
					return dataGridName;
				},

				/**
				 * Возвращает набор колонок из профилей для нормального и узкого реестра
				 * @protected
				 * @return {Object}
				 */
				getProfileColumns: function() {
					var profileColumns = {};
					var profile = this.get("Profile");
					var normalPropertyName = this.getDataGridName("normal");
					var verticalPropertyName = this.getDataGridName("vertical");
					var normalProfileConfig = profile[normalPropertyName];
					this.convertProfileColumns(profileColumns, normalProfileConfig);
					var verticalProfileConfig = profile[verticalPropertyName];
					this.convertProfileColumns(profileColumns, verticalProfileConfig);
					return profileColumns;
				},

				/**
				 * Проверяет совпадение выбраного элемента реестра и текущего активного.
				 * @param {String} primaryColumnValue Идентификатор выбранного элемента.
				 * @return {Boolean}
				 */
				isNewRowSelected: function(primaryColumnValue) {
					if (!primaryColumnValue) {
						return true;
					}
					var selectedRows = this.getSelectedItems();
					if (!selectedRows) {
						return true;
					}
					var isSingleSelected = this.isSingleSelected();
					if (isSingleSelected) {
						return (selectedRows[0] !== primaryColumnValue);
					} else {
						return (selectedRows && selectedRows.indexOf(primaryColumnValue) === -1);
					}
				},

				/**
				 *
				 * @protected
				 */
				rowSelected: function(primaryColumnValue) {
					if (this.get("IsCardVisible") === true) {
						var isNewRowSelected = this.isNewRowSelected(primaryColumnValue);
						if (primaryColumnValue && isNewRowSelected && !this.get("IsCardInChain")) {
							var gridData = this.getGridData();
							var activeRow = gridData.get(primaryColumnValue);
							var typeColumnValue = this.getTypeColumnValue(activeRow);
							var schemaName = this.getEditPageSchemaName(typeColumnValue);
							this.openCard(schemaName, ConfigurationEnums.CardStateV2.EDIT, primaryColumnValue);
						}
					}
					this.set("IsCardInChain", false);
				},

				/**
				 * Обрабатывает нажатие на ссылку в реестре раздела
				 * @protected
				 * @return {Boolean} Возвращает признак перехода по ссылке
				 */
				linkClicked: function(href, columnName) {
					var linkParams = href.split("/");
					var recordId = linkParams[linkParams.length - 1];
					if (columnName !== this.primaryDisplayColumnName) {
						return true;
					} else {
						if (this.get("MultiSelect")) {
							this.saveMultiSelectState();
							this.unSetMultiSelect();
						}
						this.set("ActiveRow", recordId);
						this.editRecord(recordId, true);
						return false;
					}
				},

				/**
				 * Сохраняет состояние множественного выбора в реестре раздела.
				 */
				saveMultiSelectState: function() {
					var multiSelect = this.get("MultiSelect");
					var selectedRows = this.get("SelectedRows");
					this.set("MultiSelectState", {
						multiSelect: multiSelect,
						selectedRows: this.Terrasoft.deepClone(selectedRows)
					});
				},

				/**
				 * Восстанавливает сохраненное состояние множественного выбора в реестре раздела.
				 */
				restoreMultiSelectState: function() {
					var storage = this.get("MultiSelectState");
					if (storage) {
						if (storage.multiSelect) {
							this.setMultiSelect();
							var rows = this.Terrasoft.deepClone(storage.selectedRows);
							this.set("SelectedRows", rows);
						}
						this.set("MultiSelectState", null);
					}
				},

				/**
				 *
				 * @protected
				 */
				openSummarySettings: function() {
					var historyState = this.sandbox.publish("GetHistoryState");
					var entitySchemaName = this.entitySchema.name;
					var summaryModuleId = this.sandbox.id + "_SummarySettingsModule";
					this.sandbox.publish("PushHistoryState", {
						hash: historyState.hash.historyState,
						stateObj: {
							entitySchemaName: entitySchemaName
						}
					});
					this.sandbox.loadModule("SummarySettingsModule", {
						renderTo: this.renderTo,
						id: summaryModuleId,
						keepAlive: true
					});
				},

				/**
				 *
				 * @protected
				 */
				initActionsButtonHeaderMenuItemCaption: function() {
					this.initSeparateModeActionsButtonHeaderMenuItemCaption();
					this.initCombinedModeActionsButtonHeaderMenuItemCaption();
				},

				/**
				 *
				 * @protected
				 */
				initSeparateModeActionsButtonHeaderMenuItemCaption: function() {
					var moduleCaption = this.getModuleCaption();
					this.set("SeparateModeActionsButtonHeaderMenuItemCaption", moduleCaption);
				},

				/**
				 *
				 * @protected
				 */
				initCombinedModeActionsButtonHeaderMenuItemCaption: function() {
					this.set("CombinedModeActionsButtonHeaderMenuItemCaption", this.entitySchema.caption);
				},

				/**
				 * Отправляет сообщение о нажатии на действие группировать фильтры
				 * @protected
				 */
				groupFilterItems: function() {
					this.sendFiltersActionFired("group");
				},

				/**
				 * Отправляет сообщение о нажатии на действие разгруппировать фильтры
				 * @protected
				 */
				unGroupFilterItems: function() {
					this.sendFiltersActionFired("ungroup");
				},

				/**
				 * Отправляет сообщение о нажатии на действие для фильтров вверх
				 * @protected
				 */
				moveUpFilter: function() {
					this.sendFiltersActionFired("up");
				},

				/**
				 * Отправляет сообщение о нажатии на действие для фильтров вниз
				 * @protected
				 */
				moveDownFilter: function() {
					this.sendFiltersActionFired("down");
				},

				/**
				 *
				 * @protected
				 * @param {String} key
				 */
				sendFiltersActionFired: function(key) {
					this.sandbox.publish("FilterActionsFired", key);
				},

				/**
				 *
				 * @protected
				 */
				setMultiSelect: function() {
					this.hideActiveRowActions();
					this.set("ActiveRow", null);
					this.set("MultiSelect", true);
				},

				/**
				 *
				 * @protected
				 */
				unSetMultiSelect: function() {
					this.showActiveRowActions();
					this.set("MultiSelect", false);
					this.unSelectRecords();
					this.switchActiveRowActions();
				},

				/**
				 *
				 * @protected
				 */
				unSelectRecords: function() {
					this.set("SelectedRows", []);
				},

				/**
				 *
				 * @protected
				 */
				onAddStaticFolder: function() {
					this.sandbox.publish("AddFolderActionFired", {
						type: "generalFolder"
					});
				},

				/**
				 * Обработчик добавления новой группы с проверкой отображения статических групп.
				 * @protected
				 * @return {Boolean}
				 */
				onAddFolderClick: function() {
					if (this.get("UseStaticFolders")) {
						return false;
					} else {
						this.onAddDynamicFolder();
					}
				},

				/**
				 *
				 * @protected
				 */
				onAddDynamicFolder: function() {
					this.sandbox.publish("AddFolderActionFired", {
						type: "searchFolder"
					});
				},

				/**
				 * Получает название класса модели представления возвращаемого объекта по результатам запроса
				 * @protected
				 * @return {String} Возвращает название
				 */
				getGridRowViewModelClassName: function() {
					return "Terrasoft.BaseSectionGridRowViewModel";
				},

				/**
				 * Создает необходимые для работы кнопки вверх подписки на события
				 */
				createScrollTopBtn: function() {
					var scope = this;
					this.Ext.EventManager.addListener(window, "scroll", function() {
						var historyStateInfo = scope.getHistoryStateInfo();
						var top = Ext.getDoc().dom.documentElement.scrollTop || Ext.getBody().dom.scrollTop;
						if (historyStateInfo.workAreaMode === ConfigurationEnums.WorkAreaMode.SECTION) {
							scope.set("ScrollTop", top);
							scope.updateScrollTopBtnPosition(scope, top + Ext.getBody().getHeight() - 105);
						} else if (historyStateInfo.workAreaMode === ConfigurationEnums.WorkAreaMode.COMBINED) {
							scope.set("CardScrollTop", top);
						}
					});
					this.Ext.EventManager.addListener(Ext.get(this.getScrollContainerId()), "scroll", function() {
						var historyStateInfo = scope.getHistoryStateInfo();
						if (historyStateInfo.workAreaMode === ConfigurationEnums.WorkAreaMode.COMBINED) {
							var top = this.scrollTop;
							scope.set("ScrollTop", top);
							scope.updateScrollTopBtnPosition(scope, top + Ext.getBody().getHeight() - 140);
						}
					});
				},

				/**
				 * Обновляет положение кнопки вверх.
				 * @param {Object} scope Контекст.
				 * @param {Number} top Отступ сверху.
				 */
				updateScrollTopBtnPosition: function(scope, top) {
					scope = scope || this;
					var el = Ext.getBody().select(".viewmodel-scrolltop-btn").elements;
					if (el.length === 0) {
						return;
					}
					el = el[0];
					el.style.top = top + "px";
					if (!el.style.visibility || el.style.visibility === "") {
						el.style.visibility = "visible";
					}
				},

				/**
				 * Возвращает идентификатор контейнера, который будет прокручиваться кнопкой вверх
				 * @return {String} Идентификатор контейнера, который будет прокручиваться кнопкой вверх
				 */
				getScrollContainerId: function() {
					return "SectionContainer";
				},

				/**
				 * Получает конфигурацию иконки кнопки "Вверх"
				 * @return {Object} Возвращает конфигурацию иконки кнопки "Вверх"
				 */
				getScrollTopButtonImageConfig: function() {
					return {
						source: this.Terrasoft.ImageSources.URL,
						url: this.Terrasoft.ImageUrlBuilder.getUrl(this.get("Resources.Images.scrollTopImage"))
					};
				},

				/**
				 * Проверяет видимость кнопки вверх.
				 * @param {Number} top Высота отступа прокрутки.
				 * @return {Boolean} Видимость кнопки вверх.
				 */
				scrollTopBtnShow: function(top) {
					return top > 0;
				},

				/**
				 * Прокручивает содержимое контейнера вверх
				 */
				scrollTop: function() {
					var containerId = this.getScrollContainerId();
					var historyStateInfo = this.getHistoryStateInfo();
					if (historyStateInfo.workAreaMode === ConfigurationEnums.WorkAreaMode.COMBINED) {
						Ext.get(containerId).dom.scrollTop = 0;
					} else {
						Ext.getBody().dom.scrollTop = 0;
						Ext.getDoc().dom.documentElement.scrollTop = 0;
					}
				},

				/**
				 * Прокручивает контейнер карточки редактирования вверх.
				 */
				scrollCardTop: function() {
					Ext.getBody().dom.scrollTop = 0;
					Ext.getDoc().dom.documentElement.scrollTop = 0;
				},

				/**
				 * Проверяет есть ли у пользователя право добавить/изменить/удалить график
				 * согласно системной настройке "Настройка аналитики" (CanManageAnalytics)
				 * @return {Boolean} Возвращает результат: есть ли у пользователя право на редактирование графиков
				 */
				checkCanManageAnalytics: function() {
					RightUtilities.checkCanExecuteOperation({
						operation: "CanManageAnalytics"
					}, this.onCanManageAnalytics, this);
				},

				/**
				 * Устанавливает аттрибут "CanManageAnalytics" в зависимости от значения запрашиваемой
				 * системной настройки "Отображать Демо ссылки" (ShowDemoLinks)
				 * и доступа к операции "Настройка аналитики" (CanManageAnalytics)
				 */
				onCanManageAnalytics: function(result) {
					this.Terrasoft.SysSettings.querySysSettingsItem("ShowDemoLinks", function(value) {
						var canManageAnalytics = !value && result;
						this.set("canManageAnalytics", canManageAnalytics);
					}, this);
				},

				/**
				 * Возвращает заголовок раздела текущей сущности.
				 * @protected
				 * @virtual
				 * @return {Object} Заголовок раздела текущей сущности.
				 */
				getModuleCaption: function() {
					var moduleStructure = this.getModuleStructure();
					return moduleStructure && moduleStructure.moduleCaption;
				},

				/**
				 * Возвращает заголовок представления аналитики по умолчанию.
				 * @protected
				 * @return {String} Возвращает заголовок представления реестра по умолчанию.
				 */
				getDefaultAnalyticsDataViewCaption: function() {
					return this.getModuleCaption();
				},

				/**
				 * Возвращает иконку представления аналитики по умолчанию.
				 * @protected
				 * @return {Object} Возвращает конфигурацию иконки аналитики.
				 */
				getDefaultAnalyticsDataViewIcon: function() {
					return this.get("Resources.Images.AnalyticsDataViewIcon");
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
				 * @overridden
				 */
				afterLoadGridDataUserFunction: function(primaryColumnValue) {
					if (this.get("MultiSelect")) {
						var selectedRows = this.Terrasoft.deepClone(this.get("SelectedRows"));
						selectedRows.push(primaryColumnValue);
						this.set("SelectedRows", []);
						this.setMultiSelect();
						this.set("SelectedRows", selectedRows);
					} else {
						if (!this.get("IsCardVisible")) {
							this.set("ActiveRow", primaryColumnValue);
						}
					}
				},

				/**
				 * Получает представления раздела
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает представления раздела
				 */
				getDataViews: function() {
					return this.get("DataViews");
				},

				/**
				 * При открытии карточки скрывается кнопка "Запустить процесс"
				 * @protected
				 */
				onCardVisibleChanged: function() {
					var runProcessButtonMenuItems = this.get("RunProcessButtonMenuItems");
					var isCardVisible = this.get("IsCardVisible");
					var existsRunProcess = runProcessButtonMenuItems && runProcessButtonMenuItems.getCount() > 0;
					var isRunProcessButtonVisible = !isCardVisible && existsRunProcess;
					this.set("IsRunProcessButtonVisible", isRunProcessButtonVisible);
				},

				/**
				 * Запускает бизнес-процесс из списка глобальной кнопки запуска процессов.
				 * @param {Object} tag UId схемы бизнес-процесса.
				 */
				runProcess: function(tag) {
					ProcessModuleUtilities.executeProcess({
						sysProcessId: tag
					});
				},

				/**
				 * Формирует конфигурацию для пользовательского сообщения о пустом реестре.
				 * @protected
				 * @param {Object} config Конфигурация для пользовательского сообщения о пустом реестре.
				 */
				prepareEmptyGridMessageConfig: function(config) {
					var historyStateInfo = this.getHistoryStateInfo();
					if (historyStateInfo.workAreaMode === ConfigurationEnums.WorkAreaMode.COMBINED) {
						return;
					}
					var emptyGridMessageProperties = this.getDefaultEmptyGridMessageProperties();
					var filterKey = this.getLastFilterKey();
					var quickFilters = ["FixedFilters", "CustomFilters"];
					if (filterKey === "FolderFilters") {
						var currentFilter = this.get("CurrentFolder");
						if (currentFilter &&
							(currentFilter.folderType.value === ConfigurationConstants.Folder.Type.Search)) {
							this.applyEmptyDynamicFolderGridMessageParameters(emptyGridMessageProperties);
						} else {
							this.applyEmptyFolderGridMessageParameters(emptyGridMessageProperties);
						}
					} else if (filterKey === "TagFilters") {
						this.applyEmptyFilterResultGridMessageParameters(emptyGridMessageProperties);
					} else if (quickFilters.indexOf(filterKey) >= 0) {
						this.applyEmptyFilterResultGridMessageParameters(emptyGridMessageProperties);
					}
					var emptyGridMessageViewConfig = this.getEmptyGridMessageViewConfig(emptyGridMessageProperties);
					this.Ext.apply(config, emptyGridMessageViewConfig);
				},

				/**
				 * Возвращает ключ последней группы фильтров.
				 * @protected
				 * @return {String} Ключ последней группы фильтров.
				 */
				getLastFilterKey: function() {
					var filters = this.getFilters();
					filters = filters.filter(function(filter) {
						var notNull = (filter.isNull === undefined);
						var isFilterGroup = (filter instanceof Terrasoft.FilterGroup);
						var notEmptyFilterGroup = (isFilterGroup && !filter.isEmpty() && !(filter.getByIndex(0).key === "undefined" &&
						(filter.getByIndex(0) instanceof Terrasoft.FilterGroup) && filter.getByIndex(0).isEmpty()));
						return (notNull && notEmptyFilterGroup);
					});
					var count = filters ? filters.getCount() : 0;
					if (count === 0) {
						return null;
					}
					var filter = filters.getByIndex(count - 1);
					return filter.key;
				},

				/**
				 * Возвращает параметры по умолчанию сообщения о пустом реестре.
				 * @return {Object} Параметры по умолчанию сообщения о пустом реестре.
				 */
				getDefaultEmptyGridMessageProperties: function() {
					return {
						title: this.get("Resources.Strings.EmptyInfoTitle"),
						description: this.get("Resources.Strings.EmptyInfoDescription"),
						recommendation: this.get("Resources.Strings.EmptyInfoRecommendation"),
						image: this.get("Resources.Images.EmptyInfoImage"),
						useStaticFolderHelpUrl: false
					};
				},

				/**
				 * Применяет параметры сообщения о пустом реестре при выборе динамеческой группы.
				 * @param {Object} emptyGridMessageProperties Параметры сообщения о пустом реестре.
				 */
				applyEmptyDynamicFolderGridMessageParameters: function(emptyGridMessageProperties) {
					this.Ext.apply(emptyGridMessageProperties, {
						title: this.get("Resources.Strings.EmptyDynamicGroupTitle"),
						description: this.get("Resources.Strings.EmptyDynamicGroupDescription"),
						recommendation: this.get("Resources.Strings.EmptyDynamicGroupRecommendation"),
						image: this.get("Resources.Images.EmptyDynamicGroupImage")
					});
				},

				/**
				 * Применяет параметры сообщения о пустом реестре при выборе группы.
				 * @param {Object} emptyGridMessageProperties Параметры сообщения о пустом реестре.
				 */
				applyEmptyFolderGridMessageParameters: function(emptyGridMessageProperties) {
					this.Ext.apply(emptyGridMessageProperties, {
						title: this.get("Resources.Strings.EmptyGroupTitle"),
						description: this.get("Resources.Strings.EmptyGroupDescription"),
						recommendation: this.get("Resources.Strings.EmptyGroupRecommendation"),
						image: this.get("Resources.Images.EmptyGroupImage"),
						useStaticFolderHelpUrl: true
					});
				},

				/**
				 * Применяет параметры сообщения о пустом реестре при установке быстрого фильтра.
				 * @param {Object} emptyGridMessageProperties Параметры сообщения о пустом реестре.
				 */
				applyEmptyFilterResultGridMessageParameters: function(emptyGridMessageProperties) {
					this.Ext.apply(emptyGridMessageProperties, {
						title: this.get("Resources.Strings.EmptyFilterTitle"),
						description: this.get("Resources.Strings.EmptyFilterDescription"),
						recommendation: this.get("Resources.Strings.EmptyFilterRecommendation"),
						image: this.get("Resources.Images.EmptyFilterImage")
					});
				},

				/**
				 * Возвращает конфигурацию представления сообщения о пустом реестре.
				 * @param {Object} emptyGridMessageProperties Параметры сообщения о пустом реестре.
				 * @return {Object} Конфигурация представления сообщения о пустом реестре.
				 */
				getEmptyGridMessageViewConfig: function(emptyGridMessageProperties) {
					var config = {
						className: "Terrasoft.Container",
						classes: {
							wrapClassName: ["empty-grid-message"]
						},
						items: []
					};
					config.items.push({
						className: "Terrasoft.Container",
						classes: {
							wrapClassName: ["image-container"]
						},
						items: [
							{
								className: "Terrasoft.ImageEdit",
								readonly: true,
								classes: {
									wrapClass: ["image-control"]
								},
								imageSrc: this.Terrasoft.ImageUrlBuilder.getUrl(emptyGridMessageProperties.image)
							}
						]
					});
					config.items.push({
						className: "Terrasoft.Container",
						classes: {
							wrapClassName: ["title"]
						},
						items: [
							{
								className: "Terrasoft.Label",
								caption: emptyGridMessageProperties.title
							}
						]
					});
					var descriptionConfig = {
						className: "Terrasoft.Container",
						classes: {
							wrapClassName: ["description"]
						},
						items: []
					};
					descriptionConfig.items.push({
						className: "Terrasoft.Container",
						classes: {wrapClassName: ["action"]},
						items: [
							{
								className: "Terrasoft.Label",
								caption: emptyGridMessageProperties.description
							}
						]
					});
					var recommendation = emptyGridMessageProperties.recommendation;
					if (!this.Ext.isEmpty(recommendation)) {
						var useStaticFolderHelpUrl = emptyGridMessageProperties.useStaticFolderHelpUrl;
						var helpUrl = (useStaticFolderHelpUrl) ? this.get("StaticFolderHelpUrl") : this.get("HelpUrl");
						var startTagPart = "";
						var endTagPart = "";
						if (!this.Ext.isEmpty(helpUrl)) {
							startTagPart = "<a target=\"_blank\" href=\"" + helpUrl + "\">";
							endTagPart = "</a>";
						}
						recommendation = this.Ext.String.format(recommendation, startTagPart, endTagPart);
						descriptionConfig.items.push({
							className: "Terrasoft.Container",
							classes: {
								wrapClassName: ["reference"]
							},
							items: [
								{
									selectors: {
										wrapEl: ".reference"
									},
									className: "Terrasoft.HtmlControl",
									html: recommendation
								}
							]
						});
					}
					config.items.push(descriptionConfig);
					return config;
				},

				/**
				 * Обработчик кнопки "Тег".
				 * @protected
				 */
				onTagButtonClick: function() {
					if (this.isNew) {
						this.sandbox.publish("OnCardAction", "saveCardAndLoadTagsFromSection", [this.getCardModuleSandboxId()]);
					} else {
						this.mixins.TagUtilities.showTagModule.call(this);
					}
				},

				/**
				 * Возвращает идентификатор активной записи раздела.
				 * @overridden
				 * @protected
				 * @return {String} идентификатор активной записи раздела.
				 */
				getCurrentRecordId: function() {
					return this.sandbox.publish("GetRecordId", this, [this.getCardModuleSandboxId()]);
				},

				/**
				 * Очищает подписки на события
				 */
				destroy: function() {
					this.mixins.GridUtilities.destroy.call(this);
					this.callParent(arguments);
				},

				/**
				 * Возвращает видимость кнопки "Вид".
				 * @return {Boolean} Видимость кнопки "Вид".
				 */
				getCombinedModeViewOptionsButtonVisible: function() {
					var combinedModeViewOptionsButtonMenuItems = this.get("CombinedModeViewOptionsButtonMenuItems");
					return MenuUtilities.getMenuVisible(combinedModeViewOptionsButtonMenuItems, this);
				}
			},

			/**
			 * Представление раздела
			 * @type {Object[]}
			 */
			diff: [
				// SectionWrapContainer
				{
					"operation": "insert",
					"name": "SectionWrapContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["section-wrap"],
						"items": []
					}
				},
				//Кнопка "Вверх"
				{
					"operation": "insert",
					"name": "ScrollTopBtn",
					"parentName": "SectionContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ScrollTopCaption"},
						"visible": {
							"bindTo": "ScrollTop",
							"bindConfig": {
								"converter": "scrollTopBtnShow"
							}
						},
						"imageConfig": {"bindTo": "getScrollTopButtonImageConfig"},
						"classes": {
							"textClass": ["viewmodel-scrolltop-btn-text"],
							"wrapperClass": "viewmodel-scrolltop-btn"
						},
						"click": {"bindTo": "scrollTop"}
					}
				},
				//				ActionButtonsContainer
				{
					"operation": "insert",
					"name": "ActionButtonsContainer",
					"parentName": "SectionWrapContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"id": "ActionButtonsContainer",
						"selectors": {"wrapEl": "#ActionButtonsContainer"},
						"wrapClass": ["action-buttons-container-wrapClass"],
						"items": [],
						"visible": {
							"bindTo": "IsActionButtonsContainerVisible"
						}
					}
				},
				//				AnalyticsActionButtonsContainer
				{
					"operation": "insert",
					"name": "AnalyticsActionButtonsContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"id": "AnalyticsActionButtonsContainer",
						"selectors": {"wrapEl": "#AnalyticsActionButtonsContainer"},
						"wrapClass": ["action-buttons-container-wrapClass"],
						"items": [],
						"visible": {
							"bindTo": "IsAnalyticsActionButtonsContainerVisible"
						}
					}
				},
				/* ANALYTICS MODE */
				//				AnalyticsModeActionButtonsRightContainer
				{
					"operation": "insert",
					"name": "AnalyticsModeActionButtonsRightContainer",
					"parentName": "FiltersContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["separate-action-buttons-right-container-wrapClass"],
						"visible": {
							bindTo: "IsAnalyticsActionButtonsContainerVisible"
						},
						"items": []
					}
				},
				//				AnalyticsModeReportsButton
				{
					"operation": "insert",
					"name": "AnalyticsModeReportsButton",
					"parentName": "AnalyticsModeActionButtonsRightContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ReportsButtonCaption"},
						"classes": {"wrapperClass": ["actions-button-margin-right"]},
						"menu": {"items": {"bindTo": "ReportGridData"}},
						"visible": {"bindTo": "getReportsButtonVisible"}
					}
				},
				//				AnalyticsModeViewOptionsButton
				{
					"operation": "insert",
					"name": "AnalyticsModeViewOptionsButton",
					"parentName": "AnalyticsModeActionButtonsRightContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ViewOptionsButtonCaption"},
						"menu": []
					}
				},
				{
					"operation": "insert",
					"index": 0,
					"name": "OpenAnalyticsViewAnalyticsModeOptionsMenuItem",
					"parentName": "AnalyticsModeViewOptionsButton",
					"propertyName": "menu",
					"values": {
						"itemType": Terrasoft.ViewItemType.MENU_ITEM,
						"caption": {"bindTo": "Resources.Strings.GridDataViewCaption"},
						"click": {"bindTo": "changeDataView"},
						"tag": "GridDataView"
					}
				},
				//				SeparateModeActionButtonsContainer
				{
					"operation": "insert",
					"name": "SeparateModeActionButtonsContainer",
					"parentName": "ActionButtonsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"visible": {
							"bindTo": "IsCardVisible",
							"bindConfig": {
								"converter": function(value) {
									return !value;
								}
							}
						},
						"wrapClass": ["separate-action-buttons-container-wrapClass"],
						"items": []
					}
				},
				//				SeparateModeActionButtonsLeftContainer
				{
					"operation": "insert",
					"name": "SeparateModeActionButtonsLeftContainer",
					"parentName": "SeparateModeActionButtonsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["separate-action-buttons-left-container-wrapClass"],
						"items": []
					}
				},
				//				SeparateModeActionButtonsRightContainer
				{
					"operation": "insert",
					"name": "SeparateModeActionButtonsRightContainer",
					"parentName": "SeparateModeActionButtonsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["separate-action-buttons-right-container-wrapClass"],
						"items": []
					}
				},
				//				AddFolderButton
				{
					"operation": "insert",
					"name": "AddFolderButton",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.AddFolderButtonCaption"},
						"click": {"bindTo": "onAddFolderClick"},
						"visible": {"bindTo": "IsFoldersVisible"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"menu": {"items": {"bindTo": "getFolderMenuItems"}}
					}
				},
				//				SeparateModeAddRecordButton
				{
					"operation": "insert",
					"name": "SeparateModeAddRecordButton",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "AddRecordButtonCaption"},
						"click": {"bindTo": "addRecord"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"controlConfig": {
							"menu": {
								"items": {
									"bindTo": "EditPages",
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
				//				SeparateModeActionsButton
				{
					"operation": "insert",
					"name": "SeparateModeActionsButton",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ActionsButtonCaption"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"menu": {"items": {"bindTo": "SeparateModeActionsButtonMenuItems"}},
						"visible": {"bindTo": "SeparateModeActionsButtonVisible"}
					}
				},
				//				SeparateModeReportsButton
				{
					"operation": "insert",
					"name": "SeparateModeReportsButton",
					"parentName": "SeparateModeActionButtonsRightContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.PrintButtonCaption"},
						"classes": {"wrapperClass": ["actions-button-margin-right"]},
						"controlConfig": {
							"menu": {"items": {"bindTo": "SectionPrintMenuItems"}},
							"visible": {"bindTo": "IsSectionPrintButtonVisible"}
						}
					}
				},
				//				SeparateModeViewOptionsButton
				{
					"operation": "insert",
					"name": "SeparateModeViewOptionsButton",
					"parentName": "SeparateModeActionButtonsRightContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ViewOptionsButtonCaption"},
						"menu": {"items": {"bindTo": "SeparateModeViewOptionsButtonMenuItems"}}
					}
				},
				/* END */
				/* COMBINED MODE */
				//				CombinedModeActionButtonsContainer
				{
					"operation": "insert",
					"name": "CombinedModeActionButtonsContainer",
					"parentName": "ActionButtonsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["combined-action-buttons-container-wrapClass"],
						"visible": {"bindTo": "IsCardVisible"},
						"items": []
					}
				},
				//				CombinedModeActionButtonsSectionContainer
				{
					"operation": "insert",
					"name": "CombinedModeActionButtonsSectionContainer",
					"parentName": "CombinedModeActionButtonsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["combined-action-buttons-section-container-wrapClass"],
						"visible": {"bindTo": "IsSectionVisible"},
						"items": []
					}
				},
				//				CombinedModeActionButtonsCardContainer
				{
					"operation": "insert",
					"name": "CombinedModeActionButtonsCardContainer",
					"parentName": "CombinedModeActionButtonsContainer",
					"propertyName": "items",
					"values": {
						"id": "CombinedModeActionButtonsCardContainer",
						"selectors": {"wrapEl": "#CombinedModeActionButtonsCardContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["combined-action-buttons-card-container-wrapClass"],
						"items": []
					}
				},
				//				CombinedModeActionButtonsCardLeftContainer
				{
					"operation": "insert",
					"name": "CombinedModeActionButtonsCardLeftContainer",
					"parentName": "CombinedModeActionButtonsCardContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["combined-action-buttons-card-left-container-wrapClass"],
						"items": []
					}
				},
				//				CombinedModeActionButtonsCardRunProcessContainer
				{
					"operation": "insert",
					"name": "CombinedModeActionButtonsCardRunProcessContainer",
					"parentName": "CombinedModeActionButtonsCardContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["combined-action-buttons-card-left-container-wrapClass"],
						"items": []
					}
				},
				//				CombinedModeActionButtonsCardRightContainer
				{
					"operation": "insert",
					"name": "CombinedModeActionButtonsCardRightContainer",
					"parentName": "CombinedModeActionButtonsCardContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["combined-action-buttons-card-right-container-wrapClass"],
						"items": []
					}
				},
				//				CombinedModeActionButtonsCardLeftContainer - BackButton
				{
					"operation": "insert",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"name": "BackButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "getBackButtonImageConfig"},
						"classes": {"wrapperClass": ["back-button-margin-right", "card-back-button"]},
						"click": {"bindTo": "onBackButtonClick"},
						"visible": {
							"bindTo": "IsSectionVisible",
							"bindConfig": {
								"converter": function(value) {
									return !value;
								}
							}
						}
					}
				},
				//				CombinedModeActionButtonsCardLeftContainer - SaveRecordButton
				{
					"operation": "insert",
					"name": "SaveRecordButton",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.SaveRecordButtonCaption"},
						"click": {"bindTo": "onCardAction"},
						"style": Terrasoft.controls.ButtonEnums.style.BLUE,
						"visible": {"bindTo": "showExistingRecordSaveButton"},
						"classes": {"textClass": ["actions-button-margin-right"]},
						"tag": "save",
						"markerValue": "SaveButton"
					}
				},
				//				CombinedModeActionButtonsCardLeftContainer - SaveRecordButton
				{
					"operation": "insert",
					"name": "SaveNewRecordButton",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.SaveRecordButtonCaption"},
						"click": {"bindTo": "onCardAction"},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"visible": {"bindTo": "showNewRecordSaveButton"},
						"classes": {"textClass": ["actions-button-margin-right"]},
						"tag": "save",
						"markerValue": "SaveButton"
					}
				},
				//				CombinedModeActionButtonsCardLeftContainer - DiscardChangesButton
				{
					"operation": "insert",
					"name": "DiscardChangesButton",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.DiscardChangesButtonCaption"},
						"click": {"bindTo": "onCardAction"},
						"visible": {"bindTo": "ShowDiscardButton"},
						"classes": {"textClass": ["actions-button-margin-right"]},
						"tag": "onDiscardChangesClick"
					}
				},
				//				CombinedModeActionButtonsCardLeftContainer - CloseButton
				{
					"operation": "insert",
					"name": "CloseButton",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.CloseButtonCaption"},
						"click": {"bindTo": "onCardAction"},
						"visible": {"bindTo": "ShowCloseButton"},
						"classes": {"textClass": ["actions-button-margin-right"]},
						"tag": "onCloseClick"
					}
				},
				//				CombinedModeAddRecordButton
				{
					"operation": "insert",
					"name": "CombinedModeAddRecordButton",
					"parentName": "CombinedModeActionButtonsSectionContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "AddRecordButtonCaption"},
						"click": {"bindTo": "addRecord"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"enabled": {
							"bindTo": "ShowSaveButton",
							"bindConfig": {
								"converter": function(value) {
									return !value;
								}
							}
						},
						"controlConfig": {
							"menu": {
								"items": {
									"bindTo": "EditPages",
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
				//				CombinedModeActionsButton
				{
					"operation": "insert",
					"name": "CombinedModeActionsButton",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ActionsButtonCaption"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"controlConfig": {
							"menu": {
								"items": {
									"bindTo": "CombinedModeActionsButtonMenuItems"
								}
							}
						},
						"visible": {
							"bindTo": "CombinedModeActionsButtonVisible"
						}
					}
				},
				//				CombinedModeActionButtonsCardRunProcessContainer - ProcessButton
				{
					"operation": "insert",
					"name": "ProcessButton",
					"parentName": "CombinedModeActionButtonsCardRunProcessContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ProsessButtonCaption"},
						"imageConfig": {"bindTo": "Resources.Images.ProcessButtonImage"},
						"iconAlign": Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
						"classes": {"imageClass": ["t-btn-image left-12px t-btn-image-left process-button-image"]},
						"menu": {"items": {"bindTo": "ProcessButtonMenuItems"}},
						"visible": {"bindTo": "IsProcessButtonVisible"}
					}
				},
				//				CombinedModePrintButton
				{
					"operation": "insert",
					"name": "CombinedModePrintButton",
					"parentName": "CombinedModeActionButtonsCardRightContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.PrintButtonCaption"},
						"classes": {"wrapperClass": ["actions-button-margin-right"]},
						"controlConfig": {"menu": {"items": {"bindTo": "CardPrintMenuItems"}}},
						"visible": {"bindTo": "IsCardPrintButtonVisible"}
					}
				},
				//				CombinedModeViewOptionsButton
				{
					"operation": "insert",
					"name": "CombinedModeViewOptionsButton",
					"parentName": "CombinedModeActionButtonsCardRightContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ViewOptionsButtonCaption"},
						"menu": {"items": {"bindTo": "CombinedModeViewOptionsButtonMenuItems"}},
						"visible": {"bindTo": "getCombinedModeViewOptionsButtonVisible"}
					}
				},
				/* END */
				//				ContentContainer
				{
					"operation": "insert",
					"name": "ContentContainer",
					"parentName": "SectionWrapContainer",
					"propertyName": "items",
					"values": {
						"id": "ContentContainer",
						"selectors": {"wrapEl": "#ContentContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["content-container-wrapClass"],
						"items": []
					}
				},
				//				SectionContainer
				{
					"operation": "insert",
					"name": "SectionContainer",
					"parentName": "ContentContainer",
					"propertyName": "items",
					"values": {
						"id": "SectionContainer",
						"selectors": {"wrapEl": "#SectionContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["section", "left-el"],
						"items": []
					}
				},
				//				CardContainer
				{
					"operation": "insert",
					"name": "CardContainer",
					"parentName": "ContentContainer",
					"propertyName": "items",
					"values": {
						"id": "CardContainer",
						"selectors": {"wrapEl": "#CardContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"visible": {"bindTo": "IsCardVisible"},
						"items": [],
						"wrapClass": ["card", "right-el"]
					}
				},
				//				GridUtilsContainer
				{
					"operation": "insert",
					"name": "GridUtilsContainer",
					"parentName": "DataViewsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["utils-container-wrapClass"],
						"items": []
					}
				},
				//				Folders and DataView Container
				{
					"operation": "insert",
					"name": "FoldersAndDataViewContainer",
					"parentName": "SectionContainer",
					"propertyName": "items",
					"values": {
						"id": "FoldersAndDataViewContainer",
						"selectors": {"wrapEl": "#FoldersAndDataViewContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["section-inner-wrap", "one-el"],
						"items": []
					}
				},
				//				FoldersContainer
				{
					"operation": "insert",
					"name": "FoldersContainer",
					"propertyName": "items",
					"values": {
						"id": "FoldersContainer",
						"selectors": {"wrapEl": "#FoldersContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"controlConfig": {"visible": {"bindTo": "IsFoldersVisible"}},
						"wrapClass": ["folders-container-wrapClass", "left-inner-el"],
						"items": []
					}
				},
				//				ExtendedFiltersContainer
				{
					"operation": "insert",
					"name": "ExtendedFiltersContainer",
					"propertyName": "items",
					"values": {
						"id": "ExtendedFiltersContainer",
						"selectors": {"wrapEl": "#ExtendedFiltersContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"controlConfig": {"visible": {"bindTo": "IsExtendedFiltersVisible"}},
						"wrapClass": ["extended-filters-container-wrapClass", "left-inner-el"],
						"items": []
					}
				},
				//				DataViewsContainer
				{
					"operation": "insert",
					"name": "DataViewsContainer",
					"parentName": "FoldersAndDataViewContainer",
					"propertyName": "items",
					"values": {
						"id": "DataViewsContainer",
						"selectors": {"wrapEl": "#DataViewsContainer"},
						"itemType": Terrasoft.ViewItemType.SECTION_VIEWS,
						"wrapClass": ["data-views-container-wrapClass", "data-view-border-right", "right-inner-el"],
						"items": []
					}
				},
				//				LeftGridUtilsContainer
				{
					"operation": "insert",
					"name": "LeftGridUtilsContainer",
					"parentName": "GridUtilsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["left-utils-container-wrapClass"],
						"items": []
					}
				},
				//				RightGridUtilsContainer
				{
					"operation": "insert",
					"name": "RightGridUtilsContainer",
					"parentName": "GridUtilsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["right-summary-container-wrapClass"],
						"items": []
					}
				},
				//				FiltersContainer
				{
					"operation": "insert",
					"name": "FiltersContainer",
					"parentName": "LeftGridUtilsContainer",
					"propertyName": "items",
					"values": {
						"id": "SectionFiltersContainer",
						"selectors": {wrapEl: "#SectionFiltersContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["filters-container-wrapClass"],
						"items": []
					}
				},
				//				CloseButtonContainer
				{
					"operation": "insert",
					"name": "CloseButtonContainer",
					"parentName": "GridUtilsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["close-button-container-wrapClass"],
						"items": []
					}
				},
				//				CloseSectionButton
				{
					"operation": "insert",
					"name": "CloseSectionButton",
					"parentName": "CloseButtonContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"classes": {"imageClass": ["close-button-background-no-repeat"]},
						"click": {"bindTo": "onCloseSectionButtonClick"},
						"imageConfig": {"bindTo": "getCloseButtonImageConfig"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"visible": {"bindTo": "IsCardVisible"}
					}
				},
				//				SummaryContainer
				{
					"operation": "insert",
					"name": "SummaryContainer",
					"parentName": "RightGridUtilsContainer",
					"propertyName": "items",
					"values": {
						"id": "SectionSummaryContainer",
						"selectors": {
							"wrapEl": "#SectionSummaryContainer"
						},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["summary-container-wrapClass"],
						"items": []
					}
				},
				//				GridDataView
				{
					"operation": "insert",
					"name": "GridDataView",
					"parentName": "DataViewsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.SECTION_VIEW,
						"items": []
					}
				},
				//				AnalyticsDataView
				{
					"operation": "insert",
					"name": "AnalyticsDataView",
					"parentName": "DataViewsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.SECTION_VIEW,

						"items": []
					}
				},
				//				AnalyticsGridLayoutContainer
				{
					"operation": "insert",
					"name": "AnalyticsGridLayoutContainer",
					"parentName": "AnalyticsDataView",
					"propertyName": "items",
					"values": {
						"id": "AnalyticsGridLayoutContainer",
						"selectors": {"wrapEl": "#AnalyticsGridLayoutContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["analytics-gridLayout-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "AnalyticsGridLayoutContainer",
					"propertyName": "items",
					"name": "DashboardModule",
					"values": {
						"itemType": Terrasoft.ViewItemType.MODULE,
						"moduleName": "DashboardsModule",
						"afterrender": {
							"bindTo": "loadDashboardModule"
						},
						"afterrerender": {
							"bindTo": "loadDashboardModule"
						}
					}
				},
				//				AnalyticsGridLayout
				{
					"operation": "insert",
					"name": "AnalyticsGridLayout",
					"parentName": "AnalyticsGridLayoutContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": [],
						"visible": false
					}
				},
				//				AddChartActionButton
				{
					"operation": "insert",
					"name": "AddChartActionButton",
					"parentName": "AnalyticsActionButtonsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"caption": {"bindTo": "Resources.Strings.AddChartButtonCaption"},
						"visible": false,
						"click": {"bindTo": "addChart"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						}
					}
				},
				{
					"operation": "insert",
					"name": "DataGridContainer",
					"parentName": "GridDataView",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["grid-dataview-container-wrapClass"],
						"items": []
					}
				}, {
					//				DataGrid
					"operation": "insert",
					"name": "DataGrid",
					"parentName": "DataGridContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID,
						"type": {"bindTo": "GridType"},
						"listedZebra": true,
						"activeRow": {"bindTo": "ActiveRow"},
						"collection": {"bindTo": "GridData"},
						"isEmpty": {"bindTo": "IsGridEmpty"},
						"isLoading": {"bindTo": "IsGridLoading"},
						"multiSelect": {"bindTo": "MultiSelect"},
						"primaryColumnName": "Id",
						"selectedRows": {"bindTo": "SelectedRows"},
						"sortColumn": {"bindTo": "sortColumn"},
						"sortColumnDirection": {"bindTo": "GridSortDirection"},
						"sortColumnIndex": {"bindTo": "SortColumnIndex"},
						"selectRow": {"bindTo": "rowSelected"},
						"linkClick": {"bindTo": "linkClicked"},
						"needLoadData": {"bindTo": "needLoadData"},
						"activeRowAction": {"bindTo": "onActiveRowAction"},
						"activeRowActions": [],
						"getEmptyMessageConfig": {"bindTo": "prepareEmptyGridMessageConfig"}
					}
				},
				//				DataGridActiveRowOpenAction
				{
					"operation": "insert",
					"name": "DataGridActiveRowOpenAction",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.BLUE,
						"caption": {"bindTo": "Resources.Strings.OpenRecordGridRowButtonCaption"},
						"tag": "edit"
					}
				},
				//				DataGridActiveRowCopyAction
				{
					"operation": "insert",
					"name": "DataGridActiveRowCopyAction",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": {"bindTo": "Resources.Strings.CopyRecordGridRowButtonCaption"},
						"tag": "copy"
					}
				},
				//				DataGridActiveRowDeleteAction
				{
					"operation": "insert",
					"name": "DataGridActiveRowDeleteAction",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": {"bindTo": "Resources.Strings.DeleteRecordGridRowButtonCaption"},
						"tag": "delete"
					}
				},
				//				ProcessEntryPointGridRowButton
				{
					"operation": "insert",
					"name": "ProcessEntryPointGridRowButton",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": {"bindTo": "Resources.Strings.ProcessEntryPointGridRowButtonCaption"},
						"tag": "processEntryPoint",
						"visible": {bindTo: "getProcessEntryPointGridRowButtonVisible"}
					}
				},
				//				ProcessRunButton
				{
					"operation": "insert",
					"name": "ProcessRunButton",
					"parentName": "SeparateModeActionButtonsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.RunProsessButtonCaption"},
						"imageConfig": {"bindTo": "Resources.Images.ProcessButtonImage"},
						"iconAlign": Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
						"classes": {
							"imageClass": ["t-btn-image left-12px t-btn-image-left"],
							"textClass": ["t-btn-text t-btn-left actions-button-margin-right"]
						},
						"menu": {"items": {"bindTo": "RunProcessButtonMenuItems"}},
						"visible": {"bindTo": "IsRunProcessButtonVisible"}
					}
				},
				{
					"operation": "insert",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"name": "addActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.DEFAULT,
						"classes": {
							"imageClass": ["addbutton-imageClass"],
							"wrapperClass": ["addbutton-buttonClass"],
							"tooltipClassName": ["quick-addbuton-tooltip"]
						},
						"imageConfig": {"bindTo": "Resources.Images.QuickAddButtonImage"},
						"showTooltip": true,
						"tooltipText": {"bindTo": "Resources.Strings.QuickAddButtonHint"},
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"menu": {
							"items": {"bindTo": "QuickAddMenuItems"}
						},
						"visible": {
							"bindTo": "getQuickAddButtonVisible"
						}
					}
				},
				{
					"operation": "insert",
					"name": "CombinedModeTagsButton",
					"parentName": "CombinedModeActionButtonsCardLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "TagButtonCaption"},
						"click": {"bindTo": "onTagButtonClick"},
						"imageConfig": {"bindTo": "Resources.Images.TagButtonIcon"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"visible": {"bindTo": "TagButtonVisible"}
					}
				}
			]
		};
	});
