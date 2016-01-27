define("BasePageV2", ["terrasoft", "RightUtilities", "ResponseExceptionHelper",
		"ConfigurationEnums", "ProcessModuleV2", "ProcessModuleUtilities",
		"MenuUtilities", "performancecountermanager", "TagUtilitiesV2", "DelayExecutionUtilities",
		"RecommendationModuleUtilities", "ProcessEntryPointUtilities", "HtmlEditModule", "PrintReportUtilities",
		"SecurityUtilities", "css!HtmlEditModule", "css!DetailModuleV2", "LookupQuickAddMixin", "WizardUtilities",
		"ContextHelpMixin"],
	function(Terrasoft, RightUtilities, ResponseExceptionHelper, Enums, ProcessModule,
			ProcessModuleUtilities, MenuUtilities, performanceManager) {
		return {
			messages: {
				/**
				 * @message GridRowChanged
				 * Получает идентификатор выбранной в реестре записи при его изменении
				 * @param {String} Идентификатор выбранной записи
				 */
				"GridRowChanged": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 *
				 */
				"UpdateCardProperty": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 *
				 */
				"UpdateCardHeader": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 *
				 */
				"CloseCard": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message OpenCard
				 * Открывает карточку
				 * @param {Object} Конфиг открываемой карточки
				 */
				"OpenCard": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message OpenCardInChain
				 * Сообщение об открытии карточки
				 * @param {Object} Конфиг открываемой карточки
				 */
				"OpenCardInChain": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message GetCardState
				 * Возвращает состояние карточки
				 */
				"GetCardState": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message SaveRecord
				 * Сообщает карточке о необходимости сохраниться
				 */
				"SaveRecord": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message DetailChanged
				 * Срабатывает когда изменились данные на детали
				 */
				"DetailChanged": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message UpdateDetail
				 * Сообщает детали об изменении карточки
				 */
				"UpdateDetail": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message OnCardAction
				 * Срабатывает при выполнении действия карточки вне карточки
				 * @param {String} action Название действия
				 */
				"OnCardAction": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message CardChanged
				 * Сообщает об изменении состояния карточки
				 * @param {Object} config
				 * @param {String} config.key Название свойста модели представления
				 * @param {Object} config.value Значение
				 */
				"CardChanged": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message GetRecordInfo
				 * Передает конфигурационный объект со свойствами  схемы карточки в страницу настройки прав
				 * @param {String} Конфигурационный объект со свойствами  схемы карточки в страницу настройки прав
				 */
				"GetRecordInfo": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message CardRendered
				 * Сообщает подписчикам, что страница отрисована
				 */
				"CardRendered": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message CardSaved
				 * Сообщает, что страница сохранилась при silentSave
				 */
				"CardSaved": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message CloseDelayExecutionModule
				 * Скрывает и выгружает модуль отложенного выполнения по процессу
				 */
				"CloseDelayExecutionModule": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message GetProcessExecData
				 * Возвращает данные для отображения страницы редактирования по процессу
				 */
				"GetProcessExecData": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message GetProcessEntryPointInfo
				 * Возвращает список загруженных точек входа по текущему объекту
				 */
				"GetProcessEntryPointInfo": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message GetProcessEntryPointsData
				 * Получает и возвращает список точек входа по текущему объекту с сервера
				 */
				"GetProcessEntryPointsData": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message GetProcessEntryPointsData
				 * Закрывает и выгружает модальное окно точек входа в процесс
				 */
				"CloseProcessEntryPointModule": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message ProcessExecDataChanged
				 * Сообщает, что изменился текущий элемент по процессу
				 */
				"ProcessExecDataChanged": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message GetActiveViewName
				 * Получить название активного представления
				 */
				"GetActiveViewName": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message ValidateDetail
				 * Сообщает детали о необходимости провалидировать свои значения
				 */
				"ValidateDetail": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message DetailValidated
				 * Получает результат валидации детали
				 */
				"DetailValidated": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message SaveDetail
				 * Сообщает детали о необходимости сохранится
				 */
				"SaveDetail": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message DetailValidated
				 * Получает результат сохранения
				 */
				"DetailSaved": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetCardActions
				 * Возвращает действия карточки
				 * @return {Object} Фильтры
				 */
				"GetCardActions": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetCardViewOptions
				 * Передает в раздел пункты меню кнопки "Вид"
				 * @param {Terrasoft.BaseViewModelCollection} Пункты меню кнопки "Вид"
				 */
				"GetCardViewOptions": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetDataViews
				 * Получает представления раздела
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает представления раздела
				 */
				"GetDataViews": {
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
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message DiscardChanges
				 * Запускается после отмены изменений и инициализации объекта и информирует подписчиков о завершении
				 * инициализации сущности. В качестве параметра сообщения передается информация о объекте.
				 */
				"DiscardChanges": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetEntityInfo
				 * Возвращает информацию о объекте.
				 */
				"GetEntityInfo": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetColumnsValues
				 * Возвращает значения переданных колонок. Параметр - массив идентификаторов колонок.
				 */
				"GetColumnsValues": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetLookupQueryFilters
				 * Возвращает фильтры справочной колонки.
				 * @param {String} columnName Название колонки.
				 * @return {Terrasoft.FilterGroup} Фильтры справочной колонки.
				 */
				"GetLookupQueryFilters": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetLookupListConfig
				 * Возвращает информацию о настройках справочной колонки.
				 * @param {String} columnName Название колонки.
				 * @return {Terrasoft.FilterGroup} Информация о настройках справочной колонки.
				 */
				"GetLookupListConfig": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message EntityColumnChanged
				 * Уведомляет об изменении значения колонки объекта карточки.
				 * @return {Object} changed
				 * @return {Text} changed.columnName Название колонки.
				 * @return {Object} changed.columnValue Значение колонки.
				 */
				"EntityColumnChanged": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Получает набор значений свойств необходимых для того, что бы запустить процесс.
				 * @param {Array} Массив значений свойств.
				 */
				/**
				 * @message GetRunProcessesProperties
				 * Публикует сообщение, которое передает значения свойств необходимые для запуска процессов.
				 * @param {Array} Массив значений свойств.
				 */
				"GetRunProcessesProperties": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message ReloadCard
				 * Переоткрывает карточку.
				 */
				"ReloadCard": {
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
				 * Посылает колекцию пунктов меню кнопки быстрого добавления активности.
				 */
				"InitQuickAddMenuItems": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message OnQuickAddRecord
				 * Сообщает о нажатие пункта меню кнопки быстрого добавления активности из раздела.
				 */
				"OnQuickAddRecord": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message ReloadGridAfterAdd
				 * Обновляет реестр при добавленнии записи.
				 */
				"ReloadGridAfterAdd": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetLookupValuePairs
				 * Возвращает информацию о значениях по умолчанию, передаваемых в новую запись справочной колонки.
				 */
				"GetLookupValuePairs": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}

			},
			mixins: {
				DelayExecutionUtilities: "Terrasoft.DelayExecutionUtilities",
				RecommendationModuleUtilities: "Terrasoft.RecommendationModuleUtilities",
				ProcessEntryPointUtilities: "Terrasoft.ProcessEntryPointUtilities",
				PrintReportUtilities: "Terrasoft.PrintReportUtilities",
				SecurityUtilitiesMixin: "Terrasoft.SecurityUtilitiesMixin",
				LookupQuickAddMixin: "Terrasoft.LookupQuickAddMixin",

				/**
				 * @class ContextHelpMixin Реализует возможность работы с модулем открытия справки.
				 */
				ContextHelpMixin: "Terrasoft.ContextHelpMixin",

				/**
				 * @class WizardUtilities Реализует возможность работы с мастером разделов.
				 */
				WizardUtilities: "Terrasoft.WizardUtilities"
			},
			attributes: {
				/**
				 * Отвечает за доступность дизайнера для текущего пользователя
				 */
				"CanDesignPage": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Хранит имя активной вкладки
				 */
				"ActiveTabName": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Признак, что была нажата кнопка DiscardButtons (Отмена)
				 */
				"ForceUpdate": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					defaultValues: false
				},
				/**
				 * Признак, что объект карточки имеет изменения
				 */
				"IsChanged": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Признак видимости кнопки сохранения,
				 * устанавлвается в true, если хотя бы один элемент на странице получил фокус
				 */
				"ShowSaveButton": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Признак видимости кнопки отмены изменений,
				 * устанавлвается в true, если хотя бы один элемент на странице получил фокус
				 */
				"ShowDiscardButton": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Признак видимости кнопки закрытия карточки
				 */
				"ShowCloseButton": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Хранит идентификатор контектной справки
				 */
				"ContextHelpId": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Колличество точек входа в процесс по объекту текущей карточки
				 */
				"EntryPointsCount": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Проинициализированна ли сущность. Используется при подготовке сущности.
				 */
				"IsEntityInitialized": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: false
				},
				/**
				 * Уникальный идентификатор сущности, с которой произведено копирование записи.
				 */
				"SourceEntityPrimaryColumnValue": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Название представления "Реестр"
				 */
				"GridDataViewName": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					value: "GridDataView"
				},
				/**
				 * Название представления "Аналитика"
				 */
				"AnalyticsDataViewName": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					value: "AnalyticsDataView"
				},
				/**
				 * Признак видимости кнопки "Процесс"
				 */
				"IsProcessButtonVisible": {
					dataValueType: this.Terrasoft.DataValueType.BOOLEAN
				},
				/**
				 * Пункты меню кнопки "Процесс"
				 */
				"ProcessButtonMenuItems": {dataValueType: this.Terrasoft.DataValueType.COLLECTION},
				/**
				 * Коллекция пунктов меню кнопки быстрого добавления активности.
				 */
				QuickAddMenuItems: {
					dataValueType: Terrasoft.DataValueType.COLLECTION
				},
				/**
				 * Коллекция пунктов меню кнопки печатных форм.
				 */
				CardPrintMenuItems: {
					dataValueType: Terrasoft.DataValueType.COLLECTION
				},
				/**
				 * Название операции доступ на которую должен быть у пользователя для использования страницы
				 */
				SecurityOperationName: {
					dataValueType: Terrasoft.DataValueType.STRING,
					value: null
				},
				/**
				 * Топ записей по каждой колонке для MultiLookup
				 */
				"QueryRowCount": {
					dataValueType: this.Terrasoft.DataValueType.INTEGER,
					value: 3
				}
			},
			methods: {
				/**
				 * Получает значение гиперссылки.
				 * @protected
				 * @param {String} columnName Название колонки.
				 */
				getLinkUrl: function(columnName) {
					var column = this.columns[columnName];
					var attributeValues = this.get(columnName);
					var connectedColumn = attributeValues && this.columns[attributeValues.column];
					if (column.multiLookupColumns && connectedColumn) {
						column.referenceSchemaName = connectedColumn.referenceSchemaName;
					}
					return this.callParent(arguments);
				},

				/**
				 * Метод получения Id картинки для MultiLookup.
				 * @protected
				 * @virtual
				 * @param {String} columnName имя колонки.
				 * @return {guid} Id изображения.
				 */
				getLookupImageId: function(columnName) {
					var lookupImageId = "";
					var columnsInfo = Terrasoft.configuration.ColumnsInfo;
					Terrasoft.each(columnsInfo, function(column, name) {
						if (name === columnName) {
							lookupImageId = column.ImageId;
							return false;
						}
					}, this);
					return lookupImageId;
				},

				/**
				 * Метод обработчик установки значения в MultiLookup.
				 * @protected
				 * @virtual
				 * @param {String} columnName имя MultiLookup.
				 * @return {Array} Массив связаных колонок.
				 */
				getMultiLookupColumns: function(columnName) {
					var column = this.columns[columnName];
					return column && column.multiLookupColumns || null;
				},

				/**
				 * Получить набор данных по lookup колонке.
				 * @overridden
				 * @param {String} filterValue Фильтр для primaryDisplayColumn.
				 * @param {Terrasoft.Collection} list Коллекция, в которую будут загружены данные.
				 * @param {String} columnName Имя колонки ViewModel.
				 */
				loadLookupData: function(filterValue, list, columnName) {
					var multiLookupColumns = this.getMultiLookupColumns(columnName);
					if (!multiLookupColumns) {
						this.callParent(arguments);
						return;
					}
					var batch = Ext.create("Terrasoft.BatchQuery");
					var rowCount = this.get("QueryRowCount");
					Terrasoft.each(multiLookupColumns, function(columnName) {
						var query = this.getLookupQuery(filterValue, columnName);
						query.rowCount = rowCount;
						batch.add(query);
					}, this);
					batch.execute(function(response) {
						if (response && response.success) {
							list.clear();
							var objects = {};
							for (var i = 0; i < multiLookupColumns.length; i++) {
								var column = multiLookupColumns[i];
								var queryResult = response.queryResults && response.queryResults[i];
								if (!Ext.isEmpty(queryResult.rows)) {
									Terrasoft.each(queryResult.rows, function(item) {
										var key = item.value;
										if (!key) {
											return true;
										}
										objects[key] = this.Ext.apply(item, {
											"column": column,
											"imageConfig": {
												"source": Terrasoft.ImageSources.SYS_IMAGE,
												"params": {
													"primaryColumnValue": this.getLookupImageId(column)
												}
											}
										});
									}, this);
								}
							}
							list.loadAll(objects);
						}
					}, this);
				},

				/**
				 * Инициализирует значения MultiLookup.
				 * @protected
				 * @virtual
				 */
				initMultiLookup: function() {
					Terrasoft.each(this.columns, function(column, multiLookupColumnName) {
						var multiLookupColumns = column.multiLookupColumns;
						if (multiLookupColumns) {
							Terrasoft.each(multiLookupColumns, function(columnName) {
								var attributeValues = this.get(columnName);
								if (attributeValues) {
									this.Ext.apply(attributeValues, {"column": columnName});
									this.set(multiLookupColumnName, attributeValues);
								}
							}, this);
						}
					}, this);
				},

				/**
				 * Метод обработчик установки значения в MultiLookup.
				 * @protected
				 * @virtual
				 */
				onSetMultiLookup: function() {
					var multiLookupName = arguments[arguments.length - 1];
					var multiLookupColumns = this.getMultiLookupColumns(multiLookupName);
					if (Ext.isEmpty(multiLookupColumns)) {
						return;
					}
					var multiLookupValues = this.get(multiLookupName);
					var entityColumn = multiLookupValues && multiLookupValues.column || undefined;
					Terrasoft.each(multiLookupColumns, function(columnName) {
						if (columnName === entityColumn) {
							this.loadLookupDisplayValue(columnName, multiLookupValues.value);
						} else {
							this.set(columnName, null, {silent: true});
						}
					}, this);
				},

				/**
				 * Метод генератор leftIconConfig для MultiLookup.
				 * @protected
				 * @virtual
				 * @param {String} multiLookupName название колонки MultiLookup.
				 * @return {object} объект leftIconConfig.
				 */
				getMultiLookupIconConfig: function(multiLookupName) {
					var imageConfig = null;
					var multiLookupColumns = this.getMultiLookupColumns(multiLookupName);
					if (Ext.isEmpty(multiLookupColumns)) {
						return;
					}
					Terrasoft.each(multiLookupColumns, function(columnName) {
						if (this.get(columnName)) {
							imageConfig = {
								"source": Terrasoft.ImageSources.SYS_IMAGE,
								"params": {
									"primaryColumnValue": this.getLookupImageId(columnName)
								}
							};
						}
					}, this);
					return imageConfig;
				},

				/**
				 * Проверяет, является ли объект раздела администрируемым по записям
				 * @protected
				 */
				getSchemaAdministratedByRecords: function() {
					return !Ext.isEmpty(this.entitySchema) ? this.entitySchema.administratedByRecords : false;
				},

				/**
				 * Возвращает коллекцию действий карточки
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий карточки
				 */
				getActions: function() {
					var actionMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "CombinedModeActionsButtonHeaderMenuItemCaption"},
						"Type": "Terrasoft.MenuSeparator",
						"Visible": false
					}));
					actionMenuItems.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.EditRightsCaption"},
						"Tag": "editRights",
						"Visible": {"bindTo": "getSchemaAdministratedByRecords"}
					}));
					return actionMenuItems;
				},

				/**
				 * Добавляет пункт перехода в настройки списка в меню кнопки "Вид".
				 * @protected
				 * @param {Terrasoft.BaseViewModelCollection} viewOptions Пункты меню кнопки "Вид".
				 */
				addListSettingsOption: function(viewOptions) {
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.OpenListSettingsCaption"},
						"Click": {"bindTo": "openGridSettings"},
						"Visible": {"bindTo": "IsSectionVisible"}
					}));
				},

				/**
				 * Добавляет разделитель после пункта перехода в настройки списка в меню кнопки "Вид".
				 * @protected
				 * @param {Terrasoft.BaseViewModelCollection} viewOptions Пункты меню кнопки "Вид".
				 */
				addListSettingsOptionSeparator: function(viewOptions) {
					viewOptions.addItem(this.getButtonMenuSeparator({
						"Visible": {"bindTo": "IsSectionVisible"}
					}));
				},

				/**
				 * Получает пункты меню кнопки "Вид".
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает пункты меню кнопки "Вид".
				 */
				getViewOptions: function() {
					var viewOptions = this.Ext.create("Terrasoft.BaseViewModelCollection");
					this.addListSettingsOption(viewOptions);
					this.addListSettingsOptionSeparator(viewOptions);
					this.addChangeDataViewOptions(viewOptions);
					this.addChangeDataViewOptionsSeparator(viewOptions);
					this.addSectionDesignerViewOptions(viewOptions);
					return viewOptions;
				},

				/**
				 * Добавляет пункты переключения представлений в меню кнопки "Вид".
				 * @param {Terrasoft.BaseViewModelCollection} viewOptions Пункты меню кнопки "Вид".
				 */
				addChangeDataViewOptions: function(viewOptions) {
					var dataViews = this.getDataViews();
					if (!dataViews || !dataViews.contains(this.get("AnalyticsDataViewName"))) {
						return;
					}
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.AnalyticsDataViewCaption"},
						"Click": {"bindTo": "changeDataView"},
						"Visible": {"bindTo": "IsSectionVisible"},
						"Tag": "AnalyticsDataView"
					}));
				},

				/**
				 * Добавляет разделитель после пунктов переключения представлений в меню кнопки "Вид".
				 * @protected
				 * @param {Terrasoft.BaseViewModelCollection} viewOptions Пункты меню кнопки "Вид".
				 */
				addChangeDataViewOptionsSeparator: function(viewOptions) {
					viewOptions.addItem(this.getButtonMenuSeparator({
						"Visible": {"bindTo": "IsSectionVisible"}
					}));
				},

				/**
				 * Добавляет пункт открытия Мастера раздела в меню кнопки "Вид".
				 * @param {Terrasoft.BaseViewModelCollection} viewOptions Пункты иеню кнопки "Вид".
				 */
				addSectionDesignerViewOptions: function(viewOptions) {
					viewOptions.addItem(this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.OpenSectionDesignerButtonCaption"},
						"Click": {"bindTo": "startSectionDesigner"},
						"Visible": {"bindTo": "getCanDesignPage"}
					}));
				},

				/**
				 * Возвращает информацию о достуности мастера страницы.
				 * @protected
				 * @virtual
				 * @return {Boolean} true - если мастер страницы доступен, false - в обратном случае.
				 */
				getCanDesignPage: function() {
					var canDesignPage = this.get("CanDesignPage");
					return Ext.isEmpty(canDesignPage) ? false : canDesignPage;
				},

				/**
				 * Вызывает соответствующее действие карточки.
				 */
				onCardAction: function() {
					var action = arguments[0] || arguments[3];
					this[action]();
				},

				/**
				 * Устаревший метод вызова серверного сервиса
				 * @param {String} serviceName
				 * @param {String} methodName
				 * @param {Function} callback
				 * @param {Object} data
				 * @param {Object} scope
				 */
				callServiceMethod: function(serviceName, methodName, callback, data, scope) {
					var obsoleteMessage = this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage;
					this.log(Ext.String.format(obsoleteMessage, "callServiceMethod", "callService"));
					var config = {
						serviceName: serviceName,
						methodName: methodName,
						data: data
					};
					this.callService(config, callback, scope);
				},

				/**
				 * Проверяет наличие права доступа к Дизайнеру страниц и устанавливает соответстующее свойство модели
				 * ex. callCanChangeApplicationTuningMode
				 * @private
				 */
				initCanDesignPage: function() {
					this.canUseWizard(function(result) {
						result = result && !Ext.isEmpty(Terrasoft.configuration.ModuleStructure[this.entitySchemaName]);
						this.set("CanDesignPage", result);
					}, this);
				},

				/**
				 * Генерирует список значений по умолчанию
				 * @protected
				 * @virtual
				 * @return {Object[]} Возвращает список занчений по умолчанию
				 */
				getDefaultValues: function() {
					var cardInfo = this.sandbox.publish("getCardInfo", null, [this.sandbox.id]);
					var historyState = this.sandbox.publish("GetHistoryState");
					cardInfo = cardInfo || historyState.state || {};
					var defaultValues = [];
					var sourceDefaultValues = this.Terrasoft.deepClone(cardInfo.valuePairs) || [];
					while (!Ext.isEmpty(sourceDefaultValues)) {
						var defaultValue = sourceDefaultValues.pop();
						var values = Ext.isArray(defaultValue.name)
							? this.Terrasoft.mapObjectToCollection(defaultValue)
							: [defaultValue];
						defaultValues = defaultValues.concat(values);
					}
					if (cardInfo.typeColumnName && cardInfo.typeUId) {
						defaultValues.push({
							name: cardInfo.typeColumnName,
							value: cardInfo.typeUId
						});
					}
					this.set("DefaultValues", this.Terrasoft.deepClone(defaultValues));
					return defaultValues;
				},

				/**
				 * Возвращает значение по умолчанию
				 * @protected
				 * @virtual
				 * @return {Object} Возвращает значение по умолчанию
				 */
				getDefaultValueByName: function(valueName) {
					var defaultValues = this.get("DefaultValues") || this.getDefaultValues() || [];
					if (!defaultValues) {
						return null;
					}
					var defaultValue = Terrasoft.findItem(defaultValues, {name: valueName});
					if (!defaultValue) {
						return null;
					}
					defaultValue = defaultValue.item;
					if (!defaultValue || Ext.isEmpty(defaultValue.value)) {
						return null;
					}
					return defaultValue.value;
				},

				/**
				 * Устанавлтвает значения по умолчания, загружая отображаемые значения для справочных колонок
				 * @protected
				 * @virtual
				 * @param {Function} callback
				 * @param {Object} scope
				 */
				setEntityLookupDefaultValues: function(callback, scope) {
					var defaultValues = this.get("DefaultValues");
					if (!defaultValues) {
						defaultValues = this.getDefaultValues();
					}
					if (Ext.isEmpty(defaultValues)) {
						callback.call(scope || this);
						return;
					}
					var queryColumns = [];
					this.Terrasoft.each(defaultValues, function(defaultValue) {
						var entityColumn = this.findEntityColumn(defaultValue.name);
						if (!entityColumn) {
							return;
						}
						if (this.Terrasoft.isLookupDataValueType(entityColumn.dataValueType)) {
							queryColumns.push(Ext.apply({}, defaultValue, entityColumn));
						}
					}, this);
					if (queryColumns.length === 0) {
						callback.call(scope || this);
						return;
					}
					var bq = Ext.create("Terrasoft.BatchQuery");
					this.Terrasoft.each(queryColumns, function(queryColumn) {
						bq.add(this.getLookupDisplayValueQuery(queryColumn));
					}, this);
					bq.execute(function(result) {
						if (result.success) {
							this.Terrasoft.each(result.queryResults, function(queryResult, index) {
								if (Ext.isEmpty(queryResult) || Ext.isEmpty(queryResult.rows)) {
									return;
								}
								this.set(queryColumns[index].name, queryResult.rows[0]);
							}, this);
						}
						callback.call(scope || this);
					}, this);
				},

				/**
				 * Устанавливает значения по умолчания для не справочных колонок.
				 * @protected
				 * @virtual
				 * @param {Function} callback
				 * @param {Object} scope
				 */
				setEntityDefaultValues: function(callback, scope) {
					var defaultValues = this.get("DefaultValues") || this.getDefaultValues();
					this.Terrasoft.each(defaultValues, function(defaultValue) {
						var name = defaultValue.name;
						var schemaColumn = this.getColumnByName(name);
						if (schemaColumn && this.Terrasoft.isLookupDataValueType(schemaColumn.dataValueType)) {
							return;
						}
						this.set(name, defaultValue.value);
					}, this);
					callback.call(scope || this);
				},

				getIncrementCode: function(callback, scope) {
					var data = {
						sysSettingName: this.entitySchemaName + this.get("Resources.Strings.IncrementNumberSuffix"),
						sysSettingMaskName: this.entitySchemaName + this.get("Resources.Strings.IncrementMaskSuffix")
					};
					this.callServiceMethod("SysSettingsService", "GetIncrementValueVsMask", function(response) {
						callback.call(this, response.GetIncrementValueVsMaskResult);
					}, data, scope || this);
				},

				getLookupDisplayValueQuery: function(config) {
					var result = this.getLookupQuery(null, config.name, config.isLookup);
					result.enablePrimaryColumnFilter(config.value);
					return result;
				},

				/**
				 * Инциализирует значения открываемой сущности.
				 * @private
				 * @param {Function} callback
				 * @param {Object} scope
				 */
				initEntity: function(callback, scope) {
					this.showBodyMask();
					this.set("IsEntityInitialized", false);
					var operation = this.get("Operation");
					var primaryColumnValue = this.get("PrimaryColumnValue");
					if (operation === Enums.CardStateV2.ADD) {
						this.setDefaultValues(function() {
							this.setEntityLookupDefaultValues(function() {
								this.setEntityDefaultValues(callback, scope || this);
							}, this);
						}, this);
						return;
					}
					performanceManager.start("Init_Entity_setEntityDefaultValues");
					this.setEntityDefaultValues(function() {
						performanceManager.stop("Init_Entity_setEntityDefaultValues");
						if (operation === Enums.CardStateV2.EDIT) {
							performanceManager.start("Init_Entity_loadEntity");
							this.loadEntity(primaryColumnValue, function() {
								performanceManager.stop("Init_Entity_loadEntity");
								callback.call(scope || this);
							}, this);
							return;
						}
						if (operation === Enums.CardStateV2.COPY) {
							if (primaryColumnValue) {
								this.set("SourceEntityPrimaryColumnValue", primaryColumnValue);
							}
							this.copyEntity(primaryColumnValue, callback, scope || this);
							return;
						}
						callback.call(scope || this);
					}, this);
				},

				/**
				 * Проверяет, изменились ли поля объекта страницы
				 * @protected
				 * @return {Boolean} Возвращает true если есть изменения в значениях колонок схемы страницы,
				 * false - в обратном случае
				 */
				isChanged: function() {
					if (this.get("ForceUpdate")) {
						return true;
					}
					for (var columnName in this.changedValues) {
						var column = this.columns[columnName];
						if (!column || column.type !== this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN) {
							continue;
						}
						var columnPath = column.columnPath;
						if (!this.entitySchema.isColumnExist(columnPath)) {
							continue;
						}
						return true;
					}
					return false;
				},

				/**
				 * Синхронный вызов заполнения поля типа справочник
				 * @param {String} name
				 * @param {String} value
				 * @param {Function} callback
				 */
				loadLookupDisplayValue: function(name, value) {
					this.loadLookupDisplayValueAsync(name, value);
				},

				/**
				 * Асинхронный вызов заполнения поля типа справочник
				 * @param {String} name
				 * @param {Guid} value
				 * @param {Function} callback
				 */
				loadLookupDisplayValueAsync: function(name, value, callback) {
					var config = {
						name: name,
						value: value
					};
					var esq = this.getLookupDisplayValueQuery(config);
					esq.getEntityCollection(function(result) {
						if (result.success && result.collection.getCount()) {
							var entity = result.collection.getByIndex(0);
							this.set(name, entity.values);
						}
						if (callback) {
							callback.call(this);
						}
					}, this);
				},

				/**
				 * Обработчик изменения данных модели
				 * @overridden
				 */
				onDataChange: function() {
					this.callParent(arguments);
					if (this.get("IsEntityInitialized")) {
						var isChanged = this.isChanged();
						this.set("IsChanged", isChanged);
					}
				},

				/**
				 * Возвращает открыта ли страница в режиме добавления
				 * @private
				 * @return {Boolean} Возвращает открыта ли страница в режиме добавления
				 */
				isAddMode: function() {
					return this.get("Operation") === Enums.CardStateV2.ADD;
				},

				/**
				 * Возвращает открыта ли страница в режиме редактирования
				 * @private
				 * @return {Boolean} Возвращает открыта ли страница в режиме редактирования
				 */
				isEditMode: function() {
					return this.get("Operation") === Enums.CardStateV2.EDIT;
				},

				/**
				 * Возвращает открыта ли страница в режиме копирования
				 * @private
				 * @return {Boolean} Возвращает открыта ли страница в режиме копирования
				 */
				isCopyMode: function() {
					return this.get("Operation") === Enums.CardStateV2.COPY;
				},

				/**
				 * Возвращает открыта ли страница в режиме добавления или копирования
				 * @private
				 * @return {Boolean} Возвращает открыта ли страница в режиме добавления или копирования
				 */
				isNewMode: function() {
					return this.isAddMode() || this.isCopyMode();
				},

				/**
				 * Проверяет может ли операция выполнятся над сущностью
				 * @protected
				 * @virtual
				 * @return {Boolean} Возвращает true если можно выполнять операцию над сущностью
				 * и false в противном случае
				 */
				canEntityBeOperated: function() {
					return this.isEditMode();
				},

				/**
				 *
				 * @protected
				 * @virtual
				 */
				onDiscardChangesClick: function() {
					if (this.isNew) {
						this.sandbox.publish("BackHistoryState");
						return;
					}
					this.set("IsEntityInitialized", false);
					this.loadEntity(this.get("Id"), function() {
						this.updateButtonsVisibility(false, {
							force: true
						});
						this.initMultiLookup();
						this.set("IsEntityInitialized", true);
						this.discardDetailChange();
					}, this);
					if (this.get("ForceUpdate")) {
						this.set("ForceUpdate", false);
					}
				},

				/**
				 * Посылает сообщение деталям об отмене изменений в карточке.
				 * @protected
				 */
				discardDetailChange: function() {
					var eventTags = [];
					this.Terrasoft.each(this.details, function(detailConfig, detailName) {
						eventTags.push(this.getDetailId(detailName));
					}, this);
					var entityInfo = this.onGetEntityInfo();
					this.sandbox.publish("DiscardChanges", entityInfo, eventTags);
				},

				/**
				 *
				 * @protected
				 * @virtual
				 */
				onCloseClick: function() {
					this.onCloseCardButtonClick();
				},

				/**
				 *
				 * @protected
				 * @virtual
				 */
				onCloseCardButtonClick: function() {
					if (this.tryShowNextPrcElCard()) {
						return;
					}
					if (this.get("IsInChain") || this.get("IsProcessMode") || this.get("IsSeparateMode")) {
						this.sandbox.publish("BackHistoryState");
						return;
					}
					this.sandbox.publish("CloseCard", null, [this.sandbox.id]);
				},

				/**
				 * Открывает Страницу управления правами доступа
				 * @private
				 */
				openRightsPage: this.Terrasoft.abstractFn,

				/**
				 * Переходит на указанную страницу с передачей идентификатора текущей записи
				 * @private
				 * @param {String} moduleName
				 */
				executeAction: function(moduleName) {
					var recordId = this.get("Id");
					var token = moduleName + "/" + recordId;
					this.sandbox.publish("PushHistoryState", {hash: token});
				},

				/**
				 * Получает набор фильтров для построения отчета
				 * @return {Terrasoft.FilterGroup} Возвращает набор фильтров для построения отчета
				 */
				getReportFilters: function() {
					var filters = this.Ext.create("Terrasoft.FilterGroup");
					filters.name = "primaryColumnFilter";
					filters.logicalComparisonTypes = this.Terrasoft.LogicalOperatorType.AND;
					var filter = this.Terrasoft.createColumnInFilterWithParameters(this.entitySchema.primaryColumnName,
						[this.getPrimaryColumnValue()]);
					filters.addItem(filter);
					return filters;
				},

				/**
				 * Получает значение первичной колонки.
				 * @return {String} Возвращает значение первичной колонки.
				 */
				getPrimaryColumnValue: function() {
					var primaryColumnName = this.entitySchema.primaryColumnName;
					return this.get(primaryColumnName);
				},

				/**
				 * Получает признак отображения меню добавления.
				 * @return {Boolean}
				 */
				getAddButtonMenuVisible: function() {
					return false;
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
				 * Сохраняет текущую запись и передает признак быстрого добавления задачи.
				 * @protected
				 * @param {Object} typeColumnValue Значение колонки типа сущности.
				 */
				onQuickAddRecord: function(typeColumnValue) {
					var args = {
						flag: "QuickAdd",
						typeColumnValue: typeColumnValue,
						isSilent: true,
						messageTags: [this.sandbox.id],
						callback: this.openQuickActivityPage
					};
					this.save(args);
				},

				/**
				 * Открывает страницу активности.
				 * @param {Object} response Ответ сервера.
				 * @param {Object} config Конфигурация.
				 */
				openQuickActivityPage: function(response, config) {
					var typeColumnValue = config.typeColumnValue;
					var editPages = this.get("QuickEditPages");
					if (editPages.contains(typeColumnValue)) {
						var editPage = editPages.get(typeColumnValue);
						config.schemaName = editPage.get("SchemaName");
					} else {
						return;
					}
					var openCardConfig = {
						schemaName: config.schemaName,
						operation: Enums.CardStateV2.ADD,
						moduleId: this.sandbox.id + "_chain" + this.get("Id") + "quickAdd",
						defaultValues: this.defQuickAddActivityValuePairs(config),
						renderTo: "centerPanel"
					};
					this.Terrasoft.chain(
						function(next) {
							this.getEntityConnectionValues(openCardConfig, next);
						},
						function(next) {
							this.setAdditionalDefValues(openCardConfig, next);
						},
						function(next) {
							var args = {
								success: true,
								isInChain: true
							};
							this.sendSaveCardModuleResponse(args);
							next.call(this);
						},
						function() {
							this.openCardInChain(openCardConfig);
						},
						this
					);
				},

				/**
				 * Заполняет значения для создаваемой активности на основании детали связи.
				 * @protected
				 * @param {Object} openCardConfig Конфигурация для открытия страницы.
				 * @param {Function} next Функция обратного вызова.
				 */
				getEntityConnectionValues: function(openCardConfig, next) {
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "EntityConnection"
					});
					esq.addColumn("ColumnUId");
					esq.filters.addItem(esq.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "SysEntitySchemaUId", this.entitySchema.uId));
					esq.getEntityCollection(function(result) {
						if (result.success) {
							var entities = result.collection;
							this.Terrasoft.each(this.columns, function(column) {
								if (column.type === this.Terrasoft.ViewModelColumnType.ENTITY_COLUMN) {
									entities.each(function(item) {
										if (column.uId === item.get("ColumnUId")) {
											var entityValue = this.get(column.name);
											if (entityValue) {
												openCardConfig.defaultValues.push({
													name: column.name,
													value: entityValue.value
												});
											}
										}
									}, this);
								}
							}, this);
						}
						next();
					}, this);
				},

				/**
				 * Заполняет дополнительные дефолтные значения для создаваемой активности.
				 * @virtual
				 * @param {Object} openCardConfig Конфигурация для открытия страницы.
				 * @param {Function} next Функция обратного вызова.
				 */
				setAdditionalDefValues: function(openCardConfig, next) {
					next();
				},

				/**
				 * Получает массив названий колонок.
				 * @ovveridden
				 * @return {[String]} Массив названий колонок.
				 */
				getDefQuickAddColumnNames: function() {
					return ["DetailedResult", "Confirmed", "ShowInScheduler", "Recepient"];
				},

				/**
				 * Заполняет дефолтные значения для создаваемой активности.
				 * @virtual
				 * @param {Object} config Конфигурация для открытия страницы.
				 * @return {[Object]} Массив значений.
				 */
				defQuickAddActivityValuePairs: function(config) {
					var activity = this.Terrasoft.configuration.EntityStructure.Activity;
					var typeColumnValue = config.typeColumnValue;
					var valuePairs = [
						{
							name: activity.attribute,
							value: typeColumnValue
						}
					];
					var schema = this.entitySchemaName;
					var columns = this.getDefQuickAddColumnNames();
					this.Terrasoft.each(columns, function(columnSrc) {
						var columnDst = columnSrc;
						if (columnSrc === "DetailedResult") {
							columnDst = "Title";
						}
						if (schema === columnSrc) {
							columnSrc = "Id";
						}
						var column = this.get(columnSrc);
						if (column) {
							valuePairs.push({
								name: columnDst,
								value: column.value || column
							});
						}
					}, this);
					return valuePairs;
				},

				/**
				 * Инициализирует выпадающий список кнопки "Быстрого добавления активности".
				 * @protected
				 */
				initQuickAddMenuItems: function() {
					var collection = Ext.create("Terrasoft.BaseViewModelCollection");
					if (this.getAddButtonMenuVisible()) {
						var entityStructure = this.Terrasoft.configuration.EntityStructure.Activity;
						if (entityStructure) {
							Terrasoft.each(entityStructure.pages, function(editPage) {
								var typeUId = editPage.UId || Terrasoft.GUID_EMPTY;
								collection.add(typeUId, Ext.create("Terrasoft.BaseViewModel", {
									values: {
										Id: typeUId,
										Caption: editPage.captionLcz,
										Click: {bindTo: "onQuickAddRecord"},
										Tag: typeUId,
										SchemaName: editPage.cardSchema
									}
								}));
							}, this);
						}
						this.set("QuickEditPages", collection);
						var inSection = this.sandbox.publish("InitQuickAddMenuItems", collection, [this.sandbox.id]);
						if (!inSection) {
							this.set("QuickAddMenuItems", collection);
						}
					}
				},

				/**
				 * Вызывается после завершения инициализации схемы.
				 * @protected
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст выполнения.
				 */
				onPageInitialized: function(callback, scope) {
					callback.call(scope || this);
				},

				/**
				 * Инициализирует начальные значения модели
				 * @protected
				 * @virtual
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
							function(next) {
								this.initCanDesignPage();
								this.initCardActionHandler();
								this.initCardPropertyUpdateHandler();
								this.initCardHeaderUpdateHandler();
								this.subscribeSandboxEvents();
								this.subscribeViewModelEvents();
								this.initActionButtonMenu();
								this.initViewOptionsButtonMenu();
								this.initQuickAddMenuItems();
								this.initTabs();
								next();
							},
							function(next) {
								performanceManager.stop(performanceManagerLabel + "_Init");
								performanceManager.start(performanceManagerLabel + "_BeforeRender");
								this.onPageInitialized(callback, scope);
								next();
							},
							this.initEntity,
							function() {
								this.onEntityInitialized();
								this.initCardPrintForms();
							},
							this
						);
					}, this]);
				},

				/**
				 * Выполняет действия необходимые после отображения страницы
				 * @protected
				 * @virtual
				 */
				onRender: function() {
					performanceManager.start(this.sandbox.id + "_AfterRender");
					if (this.get("Restored")) {
						this.initHeader();
					}
					this.changeSelectedSideBarMenu();
					this.sandbox.publish("CardRendered", null, [this.sandbox.id]);
					this.loadRecommendationModule();
					this.hideBodyMask();
					performanceManager.stop(this.sandbox.id + "_AfterRender");
				},

				/**
				 * Изменяет выделенное меню раздела в левой панели.
				 * @protected
				 */
				changeSelectedSideBarMenu: function() {
					var moduleConfig = this.Terrasoft.configuration.ModuleStructure[this.entitySchemaName];
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
				 * Выполняет обновление всех деталей.
				 * @protected
				 * @virtual
				 */
				updateDetails: function() {
					this.Terrasoft.each(this.details, function(detailConfig, detailName) {
						this.updateDetail(Ext.apply({}, detailConfig, {detail: detailName}));
					}, this);
				},

				/**
				 * Выполняет обновление детали
				 * @protected
				 * @virtual
				 * @param {Object} detailConfig Конфигурация детали
				 */
				updateDetail: function(detailConfig) {
					var detailId = this.getDetailId(detailConfig.detail);
					this.sandbox.publish("UpdateDetail", {
						reloadAll: true
					}, [detailId]);
				},

				/**
				 * Событие окончания инициализации сущности
				 * @protected
				 * @virtual
				 */
				onEntityInitialized: function() {
					this.initMultiLookup();
					this.hideBodyMask();
					this.updateButtonsVisibility(false, {
						force: true
					});
					this.set("IsEntityInitialized", true);
					this.initHeader();
					this.initHeaderCaption();
					this.initControlGroupsProfile();
					var eventTags = this.getEntityInitializedSubscribers();
					eventTags.push(this.sandbox.id);
					var entityInfo = this.onGetEntityInfo();
					this.sandbox.publish("EntityInitialized", entityInfo, eventTags);
					if (this.get("IsProcessMode")) {
						this.set("ForceUpdate", true);
					}
					this.initRunProcessButtonMenu(true);
				},

				/**
				 * Возвращает массив идентификаторов деталей. При наличии идентификатора контейнера вызывает
				 * загрузку детали.
				 * @private
				 * @return {Array} Массив идентификаторов деталей.
				 */
				getDetailIds: function() {
					var eventTags = [];
					this.Terrasoft.each(this.details, function(detailConfig, detailName) {
						eventTags.push(this.getDetailId(detailName));
						var detailLoadConfig = this.get(detailName);
						if (detailLoadConfig && detailLoadConfig.containerId) {
							this.loadDetail(detailLoadConfig);
							this.set(detailName, null);
						}
					}, this);
					return eventTags;
				},

				/**
				 * Возвращает массив идентификаторов подписчиков сообщения EntityInitialized.
				 * @protected
				 * @return {Array} Массив идентификаторов подписчиков.
				 */
				getEntityInitializedSubscribers: function() {
					var subcribers = this.getDetailIds();
					return subcribers;
				},

				/**
				 * Выполняет подписки на сообщения, которые понадобятся странице
				 * @protected
				 * @virtual
				 */
				subscribeSandboxEvents: function() {
					var subscribersIds = this.getSaveRecordMessagePublishers();
					var openCardSubscribers = this.Terrasoft.deepClone(subscribersIds);
					openCardSubscribers.push(this.getLookupModuleId());
					var sandbox = this.sandbox;
					sandbox.subscribe("OpenCard", function(config) {
						this.openCardInChain(config);
					}, this, openCardSubscribers);
					sandbox.subscribe("GetCardState", function() {
						return {state: this.get("Operation")};
					}, this, subscribersIds);
					sandbox.subscribe("SaveRecord", function(args) {
						this.save(args);
					}, this, subscribersIds);
					sandbox.subscribe("GridRowChanged", function(config) {
						return this.onGridRowChanged(config);
					}, this, [this.sandbox.id]);
					var rightsModuleId = sandbox.id + "_Rights";
					var entitySchema = this.entitySchema;
					sandbox.subscribe("GetRecordInfo", function() {
						return {
							entitySchemaName: entitySchema.name,
							entitySchemaCaption: entitySchema.caption,
							primaryColumnValue: this.get(entitySchema.primaryColumnName),
							primaryDisplayColumnValue: this.get(entitySchema.primaryDisplayColumnName)
						};
					}, this, [rightsModuleId]);
					this.sandbox.subscribe("OnQuickAddRecord", this.onQuickAddRecord, this, [this.sandbox.id]);
					this.subscribeDetailsEvents();
				},

				/**
				 * Выполняет подписку на события изменения значения колонок объекта карточки.
				 * @private
				 */
				subscribeEntityColumnsChanging: function() {
					this.Terrasoft.each(this.columns, function(column) {
						this.subscribeEntityColumnChanging(column.name);
					}, this);
				},

				/**
				 * Выполняет подписку на событие изменения значения колонки объекта карточки.
				 * @private
				 * @param {String} columnName Название колонки объекта карточки.
				 */
				subscribeEntityColumnChanging: function(columnName) {
					var entityColumn = this.findEntityColumn(columnName);
					if (!entityColumn) {
						return;
					}
					this.on("change:" + columnName, function(model, columnValue) {
						this.entityColumnChanged(columnName, columnValue);
					}, this);
				},

				/**
				 * Уведомляет об изменении значения колонки объекта карточки.
				 * @private
				 * @param {String} columnName Название колонки.
				 * @param {Object} columnValue Значение колонки.
				 */
				entityColumnChanged: function(columnName, columnValue) {
					var column = this.columns[columnName];
					this.sandbox.publish("EntityColumnChanged", {
						columnName: columnName,
						columnValue: columnValue
					}, [this.sandbox.id + "_detail_EntityConnectionsEntityConnection_" + column.uId]);
				},

				/**
				 * Выполняет подписку на события модели-представления.
				 * @protected
				 * @virtual
				 */
				subscribeViewModelEvents: function() {
					this.subscribeEntityColumnsChanging();
				},

				/**
				 * Возвращает идентификатор модуля страницы справочника.
				 * @return {String} Идентификатор модуля страницы справочника.
				 */
				getLookupModuleId: function() {
					return this.sandbox.id + "_LookupPage";
				},

				/**
				 * Устанавливает значения атрибутов "ShowSaveButton", "ShowDiscardButton" и "ShowCloseButton"
				 * @inheritdoc Terrasoft.BaseSchemaViewModel#onItemFocused
				 * @protected
				 * @overridden
				 */
				onItemFocused: function() {
					this.set("ShowSaveButton", true);
					this.set("ShowDiscardButton", true);
					this.set("IsChanged", true, {silent: true});
				},

				/**
				 * Возвращает массив идентификаторов карточек, публикующих сообщение SaveRecord
				 * @return {Array} Массив идентификаторов
				 */
				getSaveRecordMessagePublishers: function() {
					var subscribersIds = [];
					this.Terrasoft.each(this.details, function(detail, detailName) {
						subscribersIds.push(this.getDetailId(detailName));
					}, this);
					return subscribersIds;
				},

				/**
				 * Выполняет открытие карточки в цепочке.
				 * @protected
				 * @overridden
				 * @param {Object} config
				 */
				openCardInChain: function(config) {
					if (this.sandbox.publish("OpenCardInChain", config)) {
						return;
					}
					this.callParent(arguments);
				},

				/**
				 *
				 * @param {Object} config
				 */
				onGridRowChanged: function(config) {
					if (config.schemaName && config.schemaName !== this.name) {
						return false;
					}
					this.set("Operation", config.operation);
					this.set("PrimaryColumnValue", config.primaryColumnValue);
					//TODO: Спросить у М. Тарасенко зачем нужна была закомментированная строка. Из-за нее
					//при переходе между записями в вертикальном реестре в карточке отображалось предупреждение для
					// полей, обязательных для заполнения
					//this.clearEntity();
					this.reloadEntity();
					return true;
				},

				/**
				 * Переоткрывает карточку.
				 * @param {Array} defaultValues Массив значений по умолчанию.
				 * @return {Boolean} Возвращает true для уведомления что сообщение было полученно и обработано.
				 */
				onReloadCard: function(defaultValues) {
					if (!this.Ext.isEmpty(defaultValues)) {
						var currentDefaultValues = this.get("DefaultValues") || [];
						this.Terrasoft.each(defaultValues, function(defaultValue) {
							if (defaultValue) {
								var newValue = this.Terrasoft.deepClone(defaultValue);
								var current = this.Terrasoft.findItem(currentDefaultValues, {name: newValue.name});
								if (current) {
									current.item.value = newValue.value;
								} else {
									currentDefaultValues.push(newValue);
								}
							}
						}, this);
						this.set("DefaultValues", currentDefaultValues);
					}
					this.reloadEntity(this.initTabs, this);
					return true;
				},

				/**
				 * Выполняет перезагрузку набора данных карточки.
				 * @protected
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				reloadEntity: function(callback, scope) {
					this.initEntity(function() {
						this.onEntityInitialized();
						this.updateDetails();
						this.sandbox.publish("CardRendered", null, [this.sandbox.id]);
						this.hideBodyMask();
						if (this.Ext.isFunction(callback)) {
							callback.call(scope);
						}
					}, this);
				},

				/**
				 * Выполняет постобработку сохранения записи.
				 * @protected
				 * @virtual
				 * @param {Object} response Ответ сервера на запрос сохранения записи.
				 * @param {Object} config Параметры сохранения.
				 */
				onSaved: function(response, config) {
					this.hideBodyMask();
					if (!this.get("NextPrcElReady")) {
						this.set("NextPrcElReady", response.nextPrcElReady);
					}
					if (config && config.isSilent) {
						this.onSilentSaved(response, config);
					} else {
						//TODO нужно понять, откуда открыта карточка, и если не из детали, то не публиковать
						var updateConfig = this.getUpdateDetailOnSavedConfig();
						this.sandbox.publish("UpdateDetail", updateConfig, [this.sandbox.id]);
						this.sendSaveCardModuleResponse(response.success);
						if (this.get("IsInChain")) {
							if (!this.tryShowNextPrcElCard(false)) {
								this.sandbox.publish("BackHistoryState");
							}
							return;
						}
						if (this.isNewMode()) {
							this.onCloseCardButtonClick();
						} else {
							if (!this.tryShowNextPrcElCard(false)) {
								if (this.get("IsProcessMode")) {
									this.sandbox.publish("BackHistoryState");
								}
							}
						}
					}
					this.set("Operation", Enums.CardStateV2.EDIT);
					this.updateButtonsVisibility(false, {
						force: true
					});
					this.set("IsChanged", this.isChanged());
				},

				/**
				 * Формирует конфигурацию для сообщения UpdateDetail.
				 * @protected
				 * @return {Object} Возвращает конфигурационный объект.
				 */
				getUpdateDetailOnSavedConfig: function() {
					var updateConfig = {
						primaryColumnValue: this.get(this.primaryColumnName)
					};
					return updateConfig;
				},

				/**
				 * Отображает карточку следующего по процессу элемента.
				 * @protected
				 * @virtual
				 * @param {Boolean} isSilentSave Параметр, указывающий на неявное сохранение сущности.
				 */
				tryShowNextPrcElCard: function(isSilentSave) {
					if (!isSilentSave && (!this.get("IsInChain") || !this.get("IsProcessMode"))) {
						return ProcessModule.onCardModuleSaved(this.get("NextPrcElReady"), this.sandbox, true);
					}
					return false;
				},

				/**
				 * Выполняет постобработку при "тихом" сохранения записи.
				 * @protected
				 * @virtual
				 * @param {Object} response Ответ сервера на запрос сохранения записи.
				 * @param {Object} config Параметры сохранения.
				 */
				onSilentSaved: function(response, config) {
					var callback = config.callback;
					if (callback) {
						callback.call(config.scope || this, response, config);
					}
					if (!callback || config.callBaseSilentSavedActions) {
						this.sandbox.publish("CardSaved", response, config.messageTags);
						this.sendSaveCardModuleResponse(response.success);
					}
				},

				/**
				 * Посылает сообщение о сохранении карточки.
				 * @protected
				 * @virtual
				 * @param {Boolean} success
				 * @return {Boolean}
				 */
				sendSaveCardModuleResponse: function(success) {
					var primaryColumnValue = this.get(this.primaryColumnName);
					var infoObject = {
						action: this.get("Operation"),
						success: success,
						primaryColumnValue: primaryColumnValue,
						uId: primaryColumnValue,//todo: remove
						primaryDisplayColumnValue: this.get(this.primaryDisplayColumnName),
						primaryDisplayColumnName: this.primaryDisplayColumnName,
						isInChain: this.get("IsInChain")
					};
					return this.sandbox.publish("CardModuleResponse", infoObject, [this.sandbox.id]);
				},

				/**
				 * Открывает Дизайнер страниц для текущей страницы
				 * @private
				 */
				openPageDesigner: function() {
					var moduleName = "EditPageDesigner";
					this.sandbox.publish("PushHistoryState", {hash: moduleName + "/" + this.name});
				},

				/**
				 *
				 */
				initCardPropertyUpdateHandler: function() {
					var detailsIds = this.getSaveRecordMessagePublishers();
					detailsIds.push(this.sandbox.id);
					this.sandbox.subscribe("UpdateCardProperty", function(config) {
						this.set(config.key, config.value, config.options);
					}, this, detailsIds);
				},

				/**
				 * Инициализирует действия карточки
				 */
				initActionButtonMenu: function() {
					this.publishPropertyValueToSection("IsCardInEditMode", this.isEditMode());
					var actionMenuItems = this.getActions();
					if (actionMenuItems.getCount()) {
						this.set("ActionsButtonVisible", true);
						this.set("ActionsButtonMenuItems", actionMenuItems);
					} else {
						this.set("ActionsButtonVisible", false);
					}
					if (this.entitySchema) {
						this.set("CombinedModeActionsButtonHeaderMenuItemCaption", this.entitySchema.caption);
					}
					this.sandbox.publish("GetCardActions", actionMenuItems, [this.sandbox.id]);
				},

				/**
				 * Инициализирует пункты меню кнопки "Вид"
				 * @protected
				 * @virtual
				 */
				initViewOptionsButtonMenu: function() {
					var viewOptions = this.getViewOptions();
					this.set("ViewOptionsButtonMenuItems", viewOptions);
					this.sandbox.publish("GetCardViewOptions", viewOptions, [this.sandbox.id]);
				},

				/**
				 * Возвращает видимость кнопки "Вид".
				 * @return {Boolean} Видимость кнопки "Вид".
				 */
				getViewOptionsButtonVisible: function() {
					var viewOptionsButtonMenuItems = this.get("ViewOptionsButtonMenuItems");
					return MenuUtilities.getMenuVisible(viewOptionsButtonMenuItems, this);
				},

				/**
				 * Обновляет верхнюю панель раздела
				 */
				initCardHeaderUpdateHandler: function() {
					this.sandbox.subscribe("UpdateCardHeader", function() {
						this.initHeader();
					}, this, [this.sandbox.id]);
				},

				/**
				 * Устанавливает признаки отображения кнопок Сохранить, Отмена и Закрыть. Метод проверяет текущее
				 * состояние кнопок, если кнопка отображена, она не скрывается. Для принудительного скрытия кнопки
				 * используется конфигурационный объект с параметром force.
				 * @private
				 * @param {Boolean} isVisible Признак отображения кнопок.
				 * @param {Object} config Конфигурационный объект.
				 * @param {Boolean} config.force Флаг дял принудительного изменения состояния кнопок.
				 */
				updateButtonsVisibility: function(isVisible, config) {
					var forceUpdate = false;
					if (config) {
						forceUpdate = (config.force === true);
					}
					var isDiscardButtonVisible = forceUpdate ? false : this.get("ShowDiscardButton");
					isDiscardButtonVisible = isVisible || isDiscardButtonVisible;
					this.set("ShowDiscardButton", isDiscardButtonVisible);
					var isProcessMode = (this.get("IsProcessMode") === true);
					var isSaveButtonVisible = forceUpdate ? false : this.get("ShowSaveButton");
					var saveButtonVisibility = isVisible || isSaveButtonVisible;
					this.set("ShowSaveButton", saveButtonVisibility || isProcessMode);
					this.set("ShowCloseButton", !saveButtonVisibility || (isProcessMode && !isDiscardButtonVisible));
				},

				/**
				 * Публикует сообщение ReloadDetail в модуль указанной детали с передачей параметров
				 * @protected
				 * @param {String} detailName Название детали
				 * @param {Object} args Параметры
				 */
				reloadDetail: function(detailName, args) {
					this.Terrasoft.each(this.entitySchemaInfo.details, function(detailInfo) {
						if (detailInfo.name === detailName) {
							this.sandbox.publish("ReloadDetail", args, [detailInfo.moduleId]);
						}
					});
				},

				/**
				 * Обрабатывает нажание кнопки "Назад", возвращает по цепочке на шаг назад
				 * @protected
				 * @virtual
				 */
				onBackButtonClick: function() {
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * Выполняет проверку ответа сервера в цепочке
				 * @protected
				 * @virtual
				 * @param {Object} response
				 */
				validateResponse: function(response) {
					var isSuccess = response && response.success;
					if (!isSuccess) {
						this.hideBodyMask();
						var errorMessage = (this.Ext.isEmpty(response.errorInfo))
							? response.message
							: ResponseExceptionHelper.GetExceptionMessage(response.errorInfo);
						if (errorMessage) {
							this.showInformationDialog(errorMessage);
						}
					}
					return isSuccess;
				},

				/**
				 * Проверяет наличие права на изменение.
				 * @param {Function} next Функция обратного вызова.
				 */
				saveCheckCanEditRight: function(next) {
					this.checkCanEditRight(function(response) {
						if (this.validateResponse(response)) {
							next();
						}
					}, this);
				},

				/**
				 * Валидирует значения модели представления.
				 * @param {Function} next Функция обратного вызова.
				 */
				saveAsyncValidate: function(next) {
					this.asyncValidate(function(response) {
						if (this.validateResponse(response)) {
							next();
						}
					}, this);
				},

				/**
				 * Публикует сообщение SaveDetail в каждую деталь.
				 * Вызывает callback-функцию после ответа сохранения каждой из деталей.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				saveDetails: function(callback, scope) {
					this.processDetails(
						function(next, detailId) {
							this.sandbox.subscribe("DetailSaved", function(result) {
								if (result.success) {
									next();
								} else {
									callback.call(scope, result);
								}
							}, this, [detailId]);
							if (!this.sandbox.publish("SaveDetail", null, [detailId])) {
								next();
							}
						},
						function(resultObject) {
							callback.call(scope, resultObject);
						}, this);
				},

				/**
				 * Выполняет сохранение сущности в цепочке вызовов методов.
				 * @param {Function} next Функция обратного вызова.
				 */
				saveEntityInChain: function(next) {
					this.saveEntity(function(response) {
						if (this.validateResponse(response)) {
							this.cardSaveResponse = response;
							next();
						}
					}, this);
				},
				/**
				 * Проверяет наличие права на изменение, валидирует значения элементов управления,
				 * сохраяет значения
				 * @protected
				 * @virtual
				 */
				save: function(config) {
					this.showBodyMask();
					this.Terrasoft.chain(
						this.saveCheckCanEditRight,
						this.saveAsyncValidate,
						this.saveEntityInChain,
						function(next) {
							this.saveDetails(function(response) {
								if (this.validateResponse(response)) {
									next();
								}
							}, this);
						},
						function() {
							this.onSaved(this.cardSaveResponse, config);
							this.cardSaveResponse = null;
							delete this.cardSaveResponse;
						},
						this);
				},

				/**
				 * Открывает страницу настройки прав доступа.
				 * @protected
				 * @virtual
				 */
				editRights: function() {
					if (this.isAddMode() || this.isCopyMode()) {
						var config = {
							callback: this.editRightsOnSavedCallback,
							isSilent: true
						};
						this.save(config);
					} else {
						this.openRightsModule();
					}
				},

				/**
				 * Открывает модуль настройки прав доступа.
				 * @protected
				 * @virtual
				 */
				openRightsModule: function() {
					this.showBodyMask();
					var sandbox = this.sandbox;
					var id = sandbox.id + "_Rights";
					sandbox.loadModule("Rights", {
						renderTo: "centerPanel",
						id: id,
						keepAlive: true
					});
				},

				/**
				 * Открывает страницу настройки прав доступа после сохранения новой записи.
				 * @private
				 * @param {Object} response Результат сохранения записи.
				 */
				editRightsOnSavedCallback: function(response) {
					this.openRightsModule();
					this.sendSaveCardModuleResponse(response.success);
				},

				/**
				 * Валидирует значения модели представления.
				 * Если присутствуют некорректные значения, выводит сообщение о необходимости заполнения первого.
				 * Иначе вызывается callback-функция.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения функции обратного вызова.
				 */
				asyncValidate: function(callback, scope) {
					var resultObject = {
						success: this.validate()
					};
					if (!resultObject.success) {
						resultObject.message = this.getValidationMessage();
						callback.call(scope, resultObject);
						return;
					}
					this.processDetails(
						function(next, detailId) {
							this.sandbox.subscribe("DetailValidated", function(result) {
								if (result.success) {
									next();
								} else {
									callback.call(scope, result);
								}
							}, this, [detailId]);
							if (!this.sandbox.publish("ValidateDetail", null, [detailId])) {
								next();
							}
						},
						function(resultObject) {
							callback.call(scope, resultObject);
						}, this);

				},

				/**
				 * Просматривает информацию валидации и возвращает на ее основе сообщение для пользователя
				 * @protected
				 * @virtual
				 * @return {*|String} Возвращает сообщения для пользователя
				 */
				getValidationMessage: function() {
					var invalidColumns = [];
					var messageTemplate = this.get("Resources.Strings.FieldValidationError");
					var invalidMessage = "";
					this.Terrasoft.each(this.validationInfo.attributes, function(attribute, attributeName) {
						if (!attribute.isValid) {
							invalidColumns.push(attributeName);
							invalidMessage = attribute.invalidMessage;
							return false;
						}
					});
					if (invalidColumns.length) {
						var invalidColumn = this.getColumnByName(invalidColumns[0]);
						var columnCaption =
							invalidColumn && invalidColumn.caption ? invalidColumn.caption : invalidColumns[0];
						return this.Ext.String.format(messageTemplate, columnCaption, invalidMessage);
					}
				},

				/**
				 * Проверяет наличие права на изменение.
				 * Если право отсутствует, выводит сообщение. Иначе вызывается callback-функция.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения функции обратного вызова.
				 */
				checkCanEditRight: function(callback, scope) {
					RightUtilities.checkCanEdit({
						schemaName: this.entitySchema.name,
						primaryColumnValue: this.get(this.entitySchema.primaryColumnName),
						isNew: this.isNew
					}, function(result) {
						var resultObject = {
							success: !result,
							message: result
						};
						callback.call(scope, resultObject);
					}, this);
				},

				/**
				 * Проходит по всем деталям, вызывая функцию обработки.
				 * @protected
				 * @virtual
				 * @param {Function} workFn Функция обработки детали.
				 * @param {Function} callback Функция обратного вызова.
				 * Вызывается в конце обработки деталей, или если возникла ошибка.
				 * @param {Object} scope Контекст выполнения функции обратного вызова.
				 */
				processDetails: function(workFn, callback, scope) {
					var chain = [];
					var chainContext = {
						context: scope || this,
						detailIds: []
					};
					this.Terrasoft.each(this.details, function(detailConfig, detailName) {
						chainContext.detailIds.push(this.getDetailId(detailName));
						chain.push(function(next) {
							var context = this.context;
							var detailId = this.detailIds.pop();
							workFn.call(context, next, detailId);
						});
					}, this);
					chain.push(function() {
						callback.call(scope, {success: true});
					});
					this.Terrasoft.chain.apply(chainContext, chain);
				},

				/**
				 * Инициализирует начальные значения модели для Tabs.
				 * @protected
				 * @virtual
				 */
				initTabs: function() {
					var defaultTabName = this.getDefaultTabName();
					if (!defaultTabName) {
						return;
					}
					this.setActiveTab(defaultTabName);
					this.set(defaultTabName, true);
				},

				/**
				 * Возвращает название вкладки по умолчанию.
				 * Таковым является либо значение свойства {@link Terrasoft.BasePageV2#DefaultTabName DefaultTabName},
				 * либо название первой вкладки в коллекции {@link Terrasoft.BasePageV2#TabsCollection TabsCollection}
				 * @protected
				 * @virtual
				 * @return {String} Название вкладки по умолчанию.
				 */
				getDefaultTabName: function() {
					var tabsCollection = this.get("TabsCollection");
					if (!tabsCollection.getCount()) {
						return "";
					}
					var defaultTabName = this.get("DefaultTabName");
					if (!defaultTabName) {
						defaultTabName = this.getDefaultValueByName("DefaultTabName");
						if (Ext.isEmpty(defaultTabName)) {
							var firstTab = tabsCollection.getByIndex(0);
							defaultTabName = firstTab.get("Name");
						}
						if (!Ext.isEmpty(defaultTabName)) {
							this.set("DefaultTabName", defaultTabName);
						}
					}
					return defaultTabName;
				},

				/**
				 * Инициализирует заголовок страницы.
				 * @protected
				 * @virtual
				 */
				initHeader: function() {
					if (this.get("IsSeparateMode")) {
						var entityCaption = this.getHeader();
						this.sandbox.publish("InitDataViews", {caption: entityCaption});
						this.initContextHelp();
					}
				},

				/**
				 * Инициализирует подпись заголовка страницы.
				 * @protected
				 * @virtual
				 */
				initHeaderCaption: this.Terrasoft.emptyFn,

				/**
				 * Инициализирует профиль страницы.
				 * @protected
				 * @virtual
				 */
				initControlGroupsProfile: function() {
					var profile = this.get("Profile");
					if (!this.Terrasoft.isEmptyObject(profile)) {
						var controlGroups = profile.controlGroups;
						if (controlGroups) {
							this.Terrasoft.each(controlGroups, function(controlGroup, controlGroupId) {
								this.set("is" + controlGroupId + "Collapsed", controlGroup.isCollapsed);
							}, this);
						}
					}
				},

				/**
				 * @inheritdoc Terrasoft.ContextHelpMixin#getContextHelpId
				 * @overriden
				 */
				getContextHelpId: function() {
					return this.get("ContextHelpId");
				},

				/**
				 * @inheritdoc Terrasoft.ContextHelpMixin#getContextHelpCode
				 * @overriden
				 */
				getContextHelpCode: function() {
					return this.name;
				},

				/**
				 *
				 * @protected
				 * @virtual
				 */
				initCardActionHandler: function() {
					this.on("change:IsChanged", function(model, value) {
						this.updateButtonsVisibility(value);
					}, this);
					this.on("change:ShowSaveButton", function(model, value) {
						this.publishPropertyValueToSection("ShowSaveButton", value);
					}, this);
					this.on("change:ShowDiscardButton", function(model, value) {
						this.publishPropertyValueToSection("ShowDiscardButton", value);
						this.set("ShowCloseButton", !value);
					}, this);
					this.on("change:Operation", function() {
						this.publishPropertyValueToSection("IsCardInEditMode", this.isEditMode());
					}, this);
					this.on("change:ShowCloseButton", function(model, value) {
						this.publishPropertyValueToSection("ShowCloseButton", value);
					}, this);
					this.on("change:EntryPointsCount", function(model, value) {
						this.publishPropertyValueToSection("EntryPointsCount", value);
					}, this);
					this.sandbox.subscribe("OnCardAction", this.onCardAction, this, [this.sandbox.id]);
				},

				/**
				 * Публикует сообщение CardChanged, которое говорит разделу об изменении значения в карточке.
				 * @protected
				 * @virtual
				 * @param {String} key Имя параметра.
				 * @param {*} value Значение параметра.
				 */
				publishPropertyValueToSection: function(key, value) {
					this.sandbox.publish("CardChanged", {
						key: key,
						value: value
					}, [this.sandbox.id]);
				},

				/**
				 * Возвращает заголовок страницы.
				 * @protected
				 * @virtual
				 * @return {String} Заголовок страницы.
				 */
				getHeader: function() {
					var caption = "";
					var typeName = this.get("Type");
					if (typeName) {
						caption = typeName.displayValue;
					} else {
						caption = this.entitySchema.caption;
					}
					return caption;
				},

				/**
				 * Устанавливает активную вкладку.
				 * @protected
				 * @virtual
				 * @param {String} tabName Имя вкладки.
				 */
				setActiveTab: function(tabName) {
					this.set("ActiveTabName", tabName);
				},

				/**
				 * Обрабатывает событие изменение вкладки Tabs.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.BaseViewModel} activeTab Выбранная вкладка.
				 */
				activeTabChange: function(activeTab) {
					var activeTabName = activeTab.get("Name");
					var tabsCollection = this.get("TabsCollection");
					tabsCollection.eachKey(function(tabName, tab) {
						var tabContainerVisibleBinding = tab.get("Name");
						this.set(tabContainerVisibleBinding, false);
					}, this);
					this.set(activeTabName, true);
				},

				/**
				 * Добавляет в выпадающий список для lookup елемент "Создать %введенное_значение%"
				 * @overriden
				 * @param {Object} config.
				 * @param {Terrasoft.Collection} config.collection Найденные значения для наполения справочника.
				 * @param {String} config.filterValue Фильтр для primaryDisplayColumn.
				 * @param {Object} config.objects Словарь который будет загружен в list.
				 * @param {String} config.columnName Имя колонки ViewModel.
				 * @param {Boolean} config.isLookupEdit lookup или combobox.
				 */
				onLookupDataLoaded: function(config) {
					this.callParent(arguments);
					this.mixins.LookupQuickAddMixin.onLookupDataLoaded.call(this, config);
				},

				/**
				 * При выборе значения "Создать ..." в LookupEdit - пытается создать новую запись или
				 * открывает карточку редактирования.
				 * @overriden
				 */
				onLookupChange: function(newValue, columnName) {
					this.callParent(arguments);
					this.mixins.LookupQuickAddMixin.onLookupChange.call(this, newValue, columnName);
				},

				/**
				 * Открывает страницу выбора из справочника или пытается добавить запись.
				 * @protected
				 * @param {Object} args Параметры.
				 * @param {Object} columnName Имя поля.
				 */
				loadVocabulary: function(args, columnName) {
					var config = this.getLookupPageConfig(args, columnName);
					this.openLookup(config, this.onLookupResult, this);
				},

				/**
				 * Возвращает настройки страницы выбора из справочника.
				 * @protected
				 * @param {Object} args Параметры.
				 * @param {String} columnName Название колонки.
				 * @return {Object} Настройки страницы выбора из справочника.
				 */
				getLookupPageConfig: function(args, columnName) {
					var config = {
						entitySchemaName: this.getLookupEntitySchemaName(args, columnName),
						multiSelect: false,
						columnName: columnName,
						columnValue: this.get(columnName),
						searchValue: args.searchValue,
						filters: this.getLookupQueryFilters(columnName)
					};
					this.Ext.apply(config, this.getLookupListConfig(columnName));
					var lookupDefValues = this.getLookupValuePairs(columnName);
					if (lookupDefValues) {
						var valuePairs = config.valuePairs || [];
						config.valuePairs = this.Ext.Array.merge(valuePairs, lookupDefValues);
					}
					return config;
				},

				/**
				 * Возвращает значения по умолчанию, передаваемые в новую запись справочной колонки.
				 * @param columnName Имя колонки.
				 * @virtual
				 */
				getLookupValuePairs: Terrasoft.emptyFn,

				/**
				 * Возвращает название схемы объекта справочного поля.
				 * @protected
				 * @param {Object} args Параметры.
				 * @param {String} columnName Название колонки.
				 * @return {String} Название схемы справочного поля.
				 */
				getLookupEntitySchemaName: function(args, columnName) {
					var entityColumn = this.findEntityColumn(columnName);
					if (!entityColumn) {
						entityColumn = this.getColumnByName(columnName);
					}
					return args.schemaName || entityColumn.referenceSchemaName;
				},

				/**
				 * Возвращает информацию о настройках справочной колонки.
				 * @private
				 * @param {String} columnName Название колонки.
				 * @return {Object|null} Информация о настройках справочной колонки.
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
				 * Событие выбора значений справочника.
				 * @protected
				 * @param {Object} args Результат работы модуля выбора из справочника.
				 * @param {Terrasoft.Collection} args.selectedRows Коллекция выбранных записей.
				 * @param {String} args.columnName Имя колонки, для которой осуществлялся выбор.
				 */
				onLookupResult: function(args) {
					var columnName = args.columnName;
					var selectedRows = args.selectedRows;
					if (!selectedRows.isEmpty()) {
						this.set(columnName, selectedRows.getByIndex(0));
					}
				},

				/**
				 * Возвращает идентификатор детали.
				 * @param {String} detailName Имя детали.
				 * @return {String} Идентификатор детали.
				 */
				getDetailId: function(detailName) {
					var entitySchemaName = this.details[detailName].entitySchemaName || "";
					return this.sandbox.id + "_detail_" + detailName + entitySchemaName;
				},

				subscribeDetailsEvents: function() {
					this.Terrasoft.each(this.details, function(detailConfig, detailName) {
						this.subscribeDetailEvents(detailConfig, detailName);
					}, this);
				},

				subscribeDetailEvents: function(detailConfig, detailName) {
					var detailId = this.getDetailId(detailName);
					var detail = this.Terrasoft.deepClone(detailConfig);
					var sandbox = this.sandbox;
					sandbox.subscribe("GetDetailInfo", function() {
						var filter = detail.filter || {};
						var masterFieldName = filter.masterColumn || "Id";
						var masterRecordId = this.get(masterFieldName);
						var masterRecordDisplayValue = this.get(this.primaryDisplayColumnName);
						var dataValueType;
						if (Ext.isObject(masterRecordId)) {
							masterRecordId = masterRecordId.value;
							dataValueType = this.Terrasoft.DataValueType.GUID;
						}
						var detailFilterMethod = !this.Ext.isEmpty(detail.filterMethod)
							? this[detail.filterMethod]
							: "";
						var ext = this.Ext;
						var terrasoft = this.Terrasoft;
						var detailFilter;
						if (ext.isFunction(detailFilterMethod)) {
							detailFilter = detailFilterMethod.call(this);
						} else {
							if (ext.isEmpty(masterRecordId) &&
									this.columns[masterFieldName].dataValueType !== terrasoft.DataValueType.TEXT) {
								detailFilter = terrasoft.createColumnIsNullFilter(filter.detailColumn);
							} else {
								detailFilter = terrasoft.createColumnFilterWithParameter(
										terrasoft.ComparisonType.EQUAL, filter.detailColumn, masterRecordId,
										dataValueType);
							}
						}
						var defaultValues = [
							{
								name: filter.detailColumn,
								value: masterRecordId
							}
						];
						this.Terrasoft.each(detail.defaultValues, function(detailDefaultValue, name) {
							var masterColumnValue = null;
							var value = null;
							if (detailDefaultValue.masterColumn !== undefined) {
								masterColumnValue = this.get(detailDefaultValue.masterColumn);
								if (!this.Ext.isEmpty(masterColumnValue)) {
									value = masterColumnValue.value || masterColumnValue;
								}
							} else {
								value = detailDefaultValue.value;
							}
							if (this.Ext.isEmpty(value)) {
								return;
							}
							defaultValues.push({
								name: name,
								value: value
							});
						}, this);
						return {
							schemaName: detail.schemaName,
							entitySchemaName: detail.entitySchemaName,
							cardPageName: this.name,
							filter: detailFilter,
							masterRecordId: masterRecordId,
							masterRecordDisplayValue: masterRecordDisplayValue,
							detailColumnName: filter.detailColumn,
							defaultValues: defaultValues,
							useRelationship: detail.useRelationship,
							relationType: detail.relationType,
							relationTypePath: detail.relationTypePath,
							relationshipPath: detail.relationshipPath,
							caption: this.get("Resources.Strings." + detail.captionName)
						};
					}, this, [detailId]);
					sandbox.subscribe("DetailChanged", function(args) {
						var subscriber = detail.subscriber;
						if (this.Ext.isFunction(subscriber)) {
							subscriber.call(this, args);
						} else if (this.Ext.isObject(subscriber)) {
							var methodName = subscriber.methodName;
							if (this.Ext.isFunction(this[methodName])) {
								this[methodName](args);
							}
						}
					}, this, [detailId]);
					sandbox.subscribe("GetColumnsValues", this.onGetColumnsValues, this, [detailId]);
					sandbox.subscribe("GetLookupQueryFilters", this.getLookupQueryFilters, this, [detailId]);
					sandbox.subscribe("GetLookupListConfig", this.getLookupListConfig, this, [detailId]);
					sandbox.subscribe("GetEntityInfo", this.onGetEntityInfo, this, [detailId]);
				},

				/**
				 * Обработчик события GetColumnsValues. Возвращает значения колонок объекта.
				 * @param {String[]} columnsUId Массив идентификаторов клонок.
				 * @private
				 * @return {Object} Значения колонок.
				 */
				onGetColumnsValues: function(columnsUId) {
					var entitySchema = this.entitySchema;
					var columnValues = {};
					this.Terrasoft.each(columnsUId, function(columnUId) {
						var entityColumn = entitySchema.getColumnByUId(columnUId);
						var columnName = entityColumn.name;
						columnValues[columnUId] = {
							columnValue: this.get(columnName),
							column: entityColumn
						};
					}, this);
					return columnValues;
				},

				/**
				 * Возвращает информацию об объекте.
				 * @private
				 * @return {Object} Информация об объекте.
				 */
				onGetEntityInfo: function() {
					var entityInfo = null;
					var entitySchema = this.entitySchema;
					if (this.get("IsEntityInitialized") && entitySchema) {
						entityInfo = {
							entitySchemaUId: entitySchema.uId,
							entitySchemaName: entitySchema.name,
							primaryColumnValue: this.get(entitySchema.primaryColumnName),
							primaryDisplayColumnValue: this.get(entitySchema.primaryDisplayColumnName)
						};
					}
					return entityInfo;
				},

				/**
				 * Загружает деталь, если деталь уже загружена, то перерисовывает её.
				 * @param {Object} config Конфигурация детали.
				 */
				loadDetail: function(config) {
					var detailId = this.getDetailId(config.detailName);
					var containerId = config.containerId;
					var rendered = this.sandbox.publish("RerenderDetail", {
						renderTo: containerId
					}, [detailId]);
					var detail = this.details[config.detailName];
					detail.containerId = containerId;
					detail.detailName = config.detailName;
					this.set(config.detailName, this.Terrasoft.deepClone(detail));
					if (rendered !== true && this.get("IsEntityInitialized")) {
						this.sandbox.loadModule("DetailModuleV2", {
							renderTo: containerId,
							id: detailId
						});
					}
				},

				/**
				 * Формирует фильтры, которые накладываются на справочные поля.
				 * @private
				 * @param {String} columnName Название колонки.
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
				 * Формирует запрос на выборку сущности.
				 * @overridden
				 * @protected
				 * @virtual
				 * @return {Object} Запрос на выборку сущности.
				 */
				getEntitySchemaQuery: function() {
					var esq = this.callParent(arguments);
					this.Terrasoft.each(this.columns, function(column) {
						var lookupListConfig = column.lookupListConfig;
						if (column.type === Terrasoft.ViewModelColumnType.ENTITY_COLUMN &&
							lookupListConfig &&
							lookupListConfig.columns) {
							this.Terrasoft.each(lookupListConfig.columns, function(lookupColumnName) {
								var columnPath = column.name + "." + lookupColumnName;
								if (!esq.columns.contains(columnPath)) {
									esq.addColumn(columnPath);
								}
							}, this);
						}
					}, this);
					this.addProcessEntryPointColumn(esq);
					return esq;
				},

				/**
				 * Загружает дополнительные данные в представление модели.
				 * @overridden
				 * @protected
				 * @virtual
				 */
				setColumnValues: function(entity) {
					this.Terrasoft.each(this.columns, function(column) {
						var lookupListConfig = column.lookupListConfig;
						if (column.type === Terrasoft.ViewModelColumnType.ENTITY_COLUMN &&
							lookupListConfig &&
							lookupListConfig.columns) {
							var columnName = column.name;
							var lookupValue = entity.get(columnName);
							if (!Ext.isEmpty(lookupValue)) {
								this.Terrasoft.each(lookupListConfig.columns, function(lookupColumnName) {
									lookupValue[lookupColumnName] = entity.get(columnName + "." + lookupColumnName);
								}, this);
							}
						}
					}, this);
					this.setEntryPointsCount(entity);
					this.callParent(arguments);
				},

				/**
				 * @inheritdoc Terrasoft.BaseViewModel#getLookupQuery
				 */
				getLookupQuery: function(filterValue, columnName) {
					var esq = this.callParent(arguments);
					var lookupColumn = this.columns[columnName];
					var lookupListConfig = lookupColumn.lookupListConfig;
					if (!lookupListConfig) {
						return esq;
					}
					this.Terrasoft.each(lookupListConfig.columns, function(column) {
						if (!esq.columns.contains(column)) {
							esq.addColumn(column);
						}
					}, this);
					var filterGroup = this.getLookupQueryFilters(columnName);
					esq.filters.addItem(filterGroup);
					var columns = esq.columns;
					if (lookupListConfig.orders) {
						var orders = lookupListConfig.orders;
						this.Terrasoft.each(orders, function(order) {
							var orderColumnPath = order.columnPath;
							if (!columns.contains(orderColumnPath)) {
								esq.addColumn(orderColumnPath);
							}
							var sortedColumn = columns.get(orderColumnPath);
							var direction = order.direction;
							sortedColumn.orderDirection = direction ? direction : Terrasoft.OrderDirection.ASC;
							var position = order.position;
							sortedColumn.orderPosition = position ? position : 1;
							this.shiftColumnsOrderPosition(columns, sortedColumn);
						}, this);
					}
					return esq;
				},

				/**
				 * Сдвигает позицию сортировки колонок.
				 * @private
				 */
				shiftColumnsOrderPosition: function(columns, sortedColumn) {
					var isNumber = this.Ext.isNumber;
					var sortedColumnOrderPosition = sortedColumn.orderPosition;
					if (isNumber(sortedColumnOrderPosition)) {
						columns.each(function(column) {
							if (column !== sortedColumn && isNumber(column.orderPosition) &&
								column.orderPosition >= sortedColumnOrderPosition) {
								column.orderPosition += 1;
							}
						});
					}
				},

				/**
				 * Получает значение свойства "Видимость" для контейнера табов.
				 * return {Boolean} Значение свойства "Видимость" для контейнера табов.
				 */
				getTabsContainerVisible: function() {
					return (this.get("TabsCollection").getCount() > 0);
				},

				/**
				 * Возвращает значение свойства "Видимость" для элемента выпадающего списка кнопки Печать.
				 * @param {String} reportId Идентификатор отчета.
				 * @return {Boolean} Возвращает значение свойства "Видимость" для элемента выпадающего списка кнопки
				 * Печать.
				 */
				getPrintMenuItemVisible: function(reportId) {
					if (this.isNewMode()) {
						return false;
					}
					var reportTypeColumnValue = this.getReportTypeColumnValue(reportId);
					var typeColumnValue = this.getTypeColumnValue(this);
					return (reportTypeColumnValue === typeColumnValue);
				},

				/**
				 * Получает представления раздела.
				 * @return {Terrasoft.BaseViewModelCollection} Представления раздела.
				 */
				getDataViews: function() {
					return this.sandbox.publish("GetDataViews", null, [this.sandbox.id]);
				},

				/**
				 * @inheritdoc Terrasoft.BaseSchemaViewModel#getProfileKey
				 */
				getProfileKey: function() {
					return this.name;
				},

				/**
				 * Запускает бизнес-процесс из списка глобальной кнопки запуска процессов.
				 * @param {Object} tag UId схемы бизнес-процесса.
				 */
				runProcess: function(tag) {
					ProcessModuleUtilities.executeProcess({
						sysProcessId: tag
					});
				}
			},
			diff: /**SCHEMA_DIFF*/[
				//				CardContentContainer
				{
					"operation": "insert",
					"name": "CardContentContainer",
					"values": {
						"id": "CardContentContainer",
						"selectors": {"wrapEl": "#CardContentContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["card-content-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ActionButtonsContainer",
					"parentName": "CardContentContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"visible": {"bindTo": "IsSeparateMode"},
						"wrapClass": ["actions-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "LeftContainer",
					"parentName": "ActionButtonsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["left-container-wrapClass"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "RunProcessContainer",
					"parentName": "ActionButtonsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["left-container-wrapClass"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "RightContainer",
					"parentName": "ActionButtonsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["right-container-wrapClass"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "SaveButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.SaveButtonCaption"},
						"classes": {"textClass": "actions-button-margin-right"},
						"click": {"bindTo": "save"},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"visible": {"bindTo": "ShowSaveButton"},
						"tag": "save",
						"markerValue": "SaveButton"
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "DelayExecutionButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.DelayExecutionButtonCaption"},
						"classes": {"textClass": "actions-button-margin-right"},
						"click": {"bindTo": "onDelayExecutionButtonClick"},
						"visible": {"bindTo": "getDelayExecutionButtonVisible"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "DiscardChangesButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.CancelButtonCaption"},
						"classes": {"textClass": "actions-button-margin-right"},
						"click": {"bindTo": "onDiscardChangesClick"},
						"visible": {"bindTo": "ShowDiscardButton"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "CloseButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.CloseButtonCaption"},
						"classes": {"textClass": "actions-button-margin-right"},
						"click": {"bindTo": "onCloseClick"},
						"visible": {"bindTo": "ShowCloseButton"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "actions",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ActionButtonCaption"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"menu": {
							"items": {"bindTo": "ActionsButtonMenuItems"}
						},
						"visible": {"bindTo": "ActionsButtonVisible"}
					}
				},
				{
					"operation": "insert",
					"parentName": "RightContainer",
					"propertyName": "items",
					"name": "PrintButton",
					"values": {
						itemType: Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.PrintButtonCaption"},
						"classes": {"wrapperClass": ["actions-button-margin-right"]},
						"controlConfig": {"menu": {"items": {"bindTo": "CardPrintMenuItems"}}},
						"visible": {"bindTo": "IsCardPrintButtonVisible"}
					}
				},
				{
					"operation": "insert",
					"parentName": "RightContainer",
					"propertyName": "items",
					"name": "ViewOptionsButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ViewOptionsButtonCaption"},
						"menu": {"items": {"bindTo": "ViewOptionsButtonMenuItems"}},
						"visible": {"bindTo": "getViewOptionsButtonVisible"}
					}
				},
				{
					"operation": "insert",
					"name": "DelayExecutionModuleContainer",
					"parentName": "CardContentContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"id": "DelayExecutionModuleContainer",
						"selectors": {"wrapEl": "#DelayExecutionModuleContainer"},
						"wrapClass": ["delay-execution-container"],
						"visible": {"bindTo": "DelayExecutionModuleContainerVisible"}
					}
				},
				{
					"operation": "insert",
					"name": "HeaderCaptionContainer",
					"parentName": "CardContentContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["header-caption-container-margin"],
						"visible": {
							"bindTo": "isNewMode"
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "NewRecordPageCaption",
					"parentName": "HeaderCaptionContainer",
					"propertyName": "items",
					"values": {
						"labelClass": ["new-record-header-caption-label"],
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {"bindTo": "NewRecordPageCaption"}
					}
				},
				{
					"operation": "insert",
					"name": "HeaderContainer",
					"parentName": "CardContentContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["header-container-margin-bottom"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "RecommendationModuleContainer",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"values": {
						"id": "RecommendationModuleContainer",
						"selectors": {"wrapEl": "#RecommendationModuleContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["recommendation-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Header",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "TabsContainer",
					"parentName": "CardContentContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"visible": {"bindTo": "getTabsContainerVisible"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Tabs",
					"parentName": "TabsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.TAB_PANEL,
						"activeTabChange": {"bindTo": "activeTabChange"},
						"activeTabName": {"bindTo": "ActiveTabName"},
						"classes": {"wrapClass": ["tab-panel-margin-bottom"]},
						"collection": {"bindTo": "TabsCollection"},
						"tabs": []
					}
				},
				{
					"operation": "insert",
					"name": "ProcessButton",
					"parentName": "RunProcessContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ProsessButtonCaption"},
						"imageConfig": {"bindTo": "Resources.Images.ProcessButtonImage"},
						"iconAlign": Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
						"classes": {"imageClass": ["t-btn-image left-12px t-btn-image-left"]},
						"menu": {"items": {"bindTo": "ProcessButtonMenuItems"}},
						"visible": {"bindTo": "IsProcessButtonVisible"}
					}
				},
				{
					"operation": "insert",
					"parentName": "LeftContainer",
					"propertyName": "items",
					"name": "addActions",
					"values": {
						"style": Terrasoft.controls.ButtonEnums.style.DEFAULT,
						"classes": {
							"imageClass": ["addbutton-imageClass"],
							"wrapperClass": ["addbutton-buttonClass"]
						},
						"imageConfig": {"bindTo": "Resources.Images.QuickAddButtonImage"},
						"showTooltip": true,
						"tooltipText": {"bindTo": "Resources.Strings.QuickAddButtonHint"},
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"menu": {
							"items": {"bindTo": "QuickAddMenuItems"}
						},
						"visible": {
							"bindTo": "getQuickAddButtonVisible"
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
