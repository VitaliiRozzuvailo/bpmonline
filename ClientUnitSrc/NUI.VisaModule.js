define("VisaModule", ["VisaModuleResources", "ViewUtilities", "RemindingsUtilities",
	"NetworkUtilities", "VisaHelper", "ServiceHelper", "ContainerList", "BaseModule", "ServiceHelper"],
	function(resources, ViewUtilities, RemindingsUtilities, NetworkUtilities, VisaHelper, ServiceHelper) {

		/**
		 * @class Terrasoft.configuration.VisasModule
		 * Класс VisasModule предназначен для создания экземпляра раздела Визы
		 */
		Ext.define("Terrasoft.configuration.VisaModule", {
			alternateClassName: "Terrasoft.VisaModule",
			extend: "Terrasoft.BaseModule",
			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Последний выбранный элемент визы
			 * @private
			 */
			LastSelectedRow: null,

			/**
			 * Номер строки реестра с конца, при появлении которого в видимой области происходит дозагрузка
			 * Виз
			 * @private
			 */
			ObservableRows: 1,

			/**
			 * Создает контейнер для размещения текста о новых визах
			 * @private
			 * @return {Object} Возвращает экземпляр конфигурации контейнера
			 */
			getMessageContainer: function() {
				return {
					className: "Terrasoft.Container",
					id: "messageContainer",
					selectors: {wrapEl: "#messageContainer"},
					classes: {wrapClassName: ["showNewVisaContainer-class"]},
					visible: {bindTo: "ShowNewVisasVisible"},
					items: [
						{
							className: "Terrasoft.Button",
							caption: {bindTo: "getShowNewVisaText"},
							classes: {textClass: ["showNewVisaButton-class"]},
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
							imageConfig: {
								source: Terrasoft.ImageSources.URL,
								url: Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.More)
							},
							click: {bindTo: "onShowNewVisaClick"}
						}
					]
				};
			},

			/**
			 * Возвращает экземпляр конфигурации эелемента визы
			 * @private
			 * @return {Object} Возвращает экземпляр контейнера для элемента визы
			 */
			getVisaItemConfig: function() {
				var visaItemConfig;
				visaItemConfig = ViewUtilities.getContainerConfig("visaItemContainer",
					["visa-item-container"]);
				var visaItemTopContainer = ViewUtilities.getContainerConfig("visaItemTopContainer",
					["visa-item-top-container"]);
				visaItemTopContainer.items.push({
					className: "Terrasoft.ImageView",
					imageSrc: {bindTo: "getVisaImage"},
					classes: {wrapClass: ["visa-icon-class"]}
				});
				visaItemTopContainer.items.push({
					className: "Terrasoft.Label",
					caption: {bindTo: "getVisaDateTime"},
					classes: {labelClass: ["date-time-labelClass"]}
				});
				visaItemTopContainer.items.push({
					className: "Terrasoft.Button",
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					classes: {wrapperClass: ["visaActionButtonWrap-class"]},
					menu: {
						items: [{
							caption: resources.localizableStrings.ApproveMenuItemCaption,
							click: {bindTo: "approve"}
						}, {
							caption: resources.localizableStrings.RejectMenuItemCaption,
							click: {bindTo: "reject"}
						}, {
							caption: resources.localizableStrings.ChangeVizierCaption,
							click: {bindTo: "changeVizier"}
						}]
					}
				});
				visaItemTopContainer.items.push({
					className: "Terrasoft.Label",
					caption: {bindTo: "getVisaButtonCaption"},
					classes: {labelClass: ["button-caption-labelClass"]}
				});
				visaItemConfig.items.push(visaItemTopContainer);
				var visaItemBottomContainer =
					ViewUtilities.getContainerConfig("visaItemBottomContainer",
						["visa-item-bottom-container"]);
				visaItemBottomContainer.items.push({
					className: "Terrasoft.Label",
					caption: {bindTo: "getVisaSubjectCaption"},
					click: {bindTo: "onVisaSubjectClick"},
					classes: {labelClass: ["subject-text-labelClass", "label-link", "label-url"]}
				});
				visaItemConfig.items.push(visaItemBottomContainer);
				var visa = ViewUtilities.getContainerConfig("visa", ["visa-container"]);
				visa.items.push(visaItemConfig);
				return visa;
			},

			/**
			 * Создает контейнер, в котором будут отображаться визы
			 * @private
			 * @return {Object} Возвращает экземпляр конфигурации контейнера
			 */
			getVisasContainer: function() {
				var visaItemsContainer = ViewUtilities.getContainerConfig("visaItemsContainer",
					["default-visa-items-container-class"]);
				visaItemsContainer.items.push({
					className: "Terrasoft.ContainerList",
					id: this.sandbox.id + "_visa-items-container-list",
					idProperty: "Id",
					selectors: {wrapEl: "#" + this.sandbox.id + "_visa-items-container-list"},
					collection: {bindTo: "Visas"},
					observableRowNumber: this.ObservableRows,
					observableRowVisible: {bindTo: "onLoadNext"},
					defaultItemConfig: this.getVisaItemConfig()
				});
				return visaItemsContainer;
			},

			/**
			 * Создает экземпляр представления
			 * @protected
			 * @vitrtual
			 * @return {Terrasoft.Container} Возвращает экземпляр представления
			 */
			getView: function() {
				var viewItems = [];
				viewItems.push(this.getMessageContainer());
				viewItems.push(Terrasoft.deepClone(this.getVisasContainer()));
				return this.Ext.create("Terrasoft.Container", {
					id: "visas",
					selectors: {wrapEl: "#visas"},
					classes: {wrapClassName: ["visas-main-container"]},
					items: viewItems
				});
			},

			/**
			 * Создает экземпляр модели представления
			 * @protected
			 * @return {Terrasoft.BaseViewModel} Возвращает экземпляр модели представления
			 */
			getViewModel: function() {
				var scope = this;
				var sandbox = scope.sandbox;
				var Terrasoft = scope.Terrasoft;
				return Ext.create("Terrasoft.BaseViewModel", {
					values: {

						/**
						 * Коллекция виз
						 * @private
						 */
						Visas: new Terrasoft.Collection(),

						/**
						 * Признак видимости контейнера с напоминанием о новых визах
						 * @private
						 */
						ShowNewVisasVisible: false,

						/**
						 * Количество новых виз
						 * @private
						 */
						NewVisasCount: 0,

						/**
						 * Общее количество виз
						 * @private
						 */
						CommonVisasCount: 0,

						/**
						 * Количество не прочитанных виз
						 * @private
						 */
						NotOpenedVisasCount: 0
					},
					methods: {

						/**
						 * Формирует путь к изображению для текущей визы согласно типу визы
						 * @private
						 * @returns {String} Возвращает сформированный путь к изображению
						 */
						getVisaImage: function() {
							var schemaName = this.get("VisaSchemaName");
							var moduleStructure = Terrasoft.configuration.ModuleStructure[schemaName];
							if (!moduleStructure || !moduleStructure.logoId) {
								return "";
							}
							var imageId = moduleStructure.logoId;
							return Terrasoft.ImageUrlBuilder.getUrl({
								source: Terrasoft.ImageSources.ENTITY_COLUMN,
								params: {
									schemaName: "SysImage",
									columnName: "Data",
									primaryColumnValue: imageId
								}
							});
						},

						/**
						 * Обработчик нажатия кнопки показа новых виз
						 * @private
						 */
						onShowNewVisaClick: function() {
							var visas = this.get("Visas");
							visas.clear();
							var visaItemsContainer = Ext.get("visaItemsContainer");
							if (visaItemsContainer.hasCls("offset-visa-items-container-class")) {
								visaItemsContainer.removeCls("offset-visa-items-container-class");
								visaItemsContainer.addCls("default-visa-items-container-class");
							}
							this.set("ShowNewVisasVisible", false);
							this.set("NotOpenedVisasCount", 0);
							this.loadVisas(true);
						},

						/**
						 * Возвращает текст с количеством новых виз
						 * @private
						 */
						getShowNewVisaText: function() {
							var newVisasCount = this.get("NewVisasCount");
							if (newVisasCount === 0) {
								this.set("ShowNewVisasVisible", false);
							} else if (newVisasCount > 1) {
								return Ext.String.format(resources.localizableStrings.ShowMoreThanOneNewVisas,
									newVisasCount);
							} else {
								return resources.localizableStrings.ShowNewVisa;
							}
						},

						/**
						 * Получает дату/время визы
						 * @private
						 * @return {Ext.Date} Возвращает дату визы
						 */
						getVisaDateTime: function() {
							var createdOn = this.get("CreatedOn");
							return Terrasoft.getTypedStringValue(createdOn, Terrasoft.DataValueType.DATE_TIME);
						},

						/**
						 * Получает подпись функциональной кнопки визы
						 * @private
						 */
						getVisaButtonCaption: function() {
							var caption = this.get("VisaTypeName");
							if (Ext.isEmpty(caption)) {
								caption = this.get("VisaSchemaCaption");
							}
							return caption;
						},

						/**
						 * Получает содержимое визы
						 * @private
						 */
						getVisaSubjectCaption: function() {
							return this.get("Title");
						},

						/**
						 * Обрабатывает нажатие на гипер-ссылку визы. Обеспечивает переход к сущности,
						 * которая инициировала визу
						 * @private
						 */
						onVisaSubjectClick: function() {
							var schemaName = this.get("VisaSchemaName");
							var moduleStructure = Terrasoft.configuration.ModuleStructure[schemaName];
							var attribute = moduleStructure.attribute;
							var entityId = this.get("VisaObjectId");
							var typeId = null;
							var hash;
							if (attribute) {
								var select = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: schemaName});
								select.addColumn(attribute);
								select.getEntity(entityId, function(result) {
									if (result && result.success) {
										var entity = result.entity;
										typeId = entity.get(attribute).value;
										hash = NetworkUtilities.getEntityUrl(schemaName, entityId, typeId);
										sandbox.publish("PushHistoryState", {hash: hash});
									}
								}, this);
							} else {
								hash = NetworkUtilities.getEntityUrl(schemaName, entityId, typeId);
								sandbox.publish("PushHistoryState", {hash: hash});
							}
						},

						/**
						 * Удаляет элемент визы из коллекции Visas. Посылает сообщение на обновление
						 * количества виз в подписи вкладки
						 * @private
						 */
						deleteVisaItem: function() {
							this.sandbox.publish("UpdateRemindingsCount");
							var visas = this.parrentViewModel.get("Visas");
							visas.removeByKey(this.get("Id"));
						},

						/**
						 * Обнуляет значения для свойств модели представления. Приводит расположение панелей вкладки
						 * в исходное состояние
						 * @private
						 */
						resetValues: function() {
							this.set("CommonVisasCount", 0);
							this.set("NotOpenedVisasCount", 0);
							this.set("NewVisasCount", 0);
							this.set("ShowNewVisasVisible", false);
							var visaItemsContainer = Ext.get("visaItemsContainer");
							if (visaItemsContainer.hasCls("offset-visa-items-container-class")) {
								visaItemsContainer.removeCls("offset-visa-items-container-class");
								visaItemsContainer.addCls("default-visa-items-container-class");
							}
						},

						/**
						 * Выполняет декремент на единицу значения CommonVisasCount
						 * @private
						 */
						decrementCommonVisasCount: function() {
							var parrentViewModel = this.parrentViewModel;
							var commonVisasCount = parrentViewModel.get("CommonVisasCount");
							parrentViewModel.set("CommonVisasCount", commonVisasCount - 1);
						},

						getEntityVisaSelect: function(schema) {
							var select = Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchema: schema
							});
							select.addColumn("Id");
							select.addColumn("Status");
							select.addColumn("Comment");
							select.addColumn("SetDate");
							select.addColumn("SetBy");
							return select;
						},

						getVisaEntity: function(callback) {
							var id = this.get("Id");
							var visaModel = this;
							var visaEntityName = this.get("VisaSchemaName") + "Visa";
							sandbox.requireModuleDescriptors(["force!" + visaEntityName], function() {
								require([visaEntityName], function(schema) {
									var select = visaModel.getEntityVisaSelect(schema);
									select.getEntity(id, function(result) {
										if (result.success) {
											callback.call(visaModel, result.entity);
										}
									}, this);
								});
							});
						},

						/**
						 * Удаляет визу из коллекции виз. Уменьшает счетчик общего количества уведомлений
						 * @private
						 */
						deleteVisa: function() {
							this.deleteVisaItem();
							this.decrementCommonVisasCount();
						},

						/**
						 * Обработчик события утверждения визы
						 * @private
						 */
						approve: function() {
							this.getVisaEntity(function(result) {
								VisaHelper.approveAction(result, function() {
									this.deleteVisa();
								}, this);
							});
						},

						/**
						 * Обработчик события отклонения визы
						 * @private
						 */
						reject: function() {
							this.getVisaEntity(function(result) {
								VisaHelper.rejectAction(result, function() {
									this.deleteVisa();
								}, this);
							});
						},

						/**
						 * Обработчик события смены визирующего
						 * @private
						 */
						changeVizier: function() {
							var visaEntityName = this.get("VisaSchemaName") + "Visa";
							var visaModel = this;
							VisaHelper.changeVizierAction(this.get("Id"), visaEntityName, sandbox, null, function() {
								visaModel.deleteVisa();
							}, this);
						},

						/**
						 * Декорирует модель функциями
						 * @param {Object} item Элемент коллекции виз
						 * @private
						 */
						decorateItem: function(item) {
							item.sandbox = sandbox;
							item.reject = this.reject;
							item.Terrasoft = Terrasoft;
							item.approve = this.approve;
							item.parrentViewModel = this;
							item.deleteVisa = this.deleteVisa;
							item.getVisaImage = this.getVisaImage;
							item.changeVizier = this.changeVizier;
							item.getVisaEntity = this.getVisaEntity;
							item.deleteVisaItem = this.deleteVisaItem;
							item.getVisaDateTime = this.getVisaDateTime;
							item.VisaImagesConfig = scope.VisaImagesConfig;
							item.onVisaSubjectClick = this.onVisaSubjectClick;
							item.getEntityVisaSelect = this.getEntityVisaSelect;
							item.getVisaButtonCaption = this.getVisaButtonCaption;
							item.getVisaSubjectCaption = this.getVisaSubjectCaption;
							item.decrementCommonVisasCount = this.decrementCommonVisasCount;
						},

						/**
						 * Возвращает тип данных колонки
						 * @param {Object} record Элемент коллекции виз
						 * @param {String} columnName Название колонки
						 * @returns {Object} Тип данных колонки
						 */
						getDataValueType: function(record, columnName) {
							var recordColumn = record.columns[columnName] ?
								record.columns[columnName] :
								record.entitySchema.columns[columnName];
							return recordColumn ? recordColumn.dataValueType : null;
						},

						/**
						 * Инициализирует свойства постраничности EntitySchemaQuery
						 * @param {Object} responseOptions Опции запроса к сервису.
						 * @param {Object} config Конфигурация для вычисления условий для постаничности.
						 * @private
						 */
						initializePageableOptions: function(requestOptions, config) {
							var isPageable = config.isPageable;
							requestOptions.IsPageable = isPageable;
							var rowCount = config.rowCount;
							var newLoadedCount = config.newLoadedCount ? config.newLoadedCount : 1;
							requestOptions.RowCount = isPageable ? rowCount : -1;
							if (!isPageable) {
								return;
							}
							var collection = config.collection;
							var primaryColumnName = config.primaryColumnName;
							var isClearGridData = config.isClearGridData;
							var conditionalValues = [];
							var loadedRecordsCount = collection.getCount();
							var isNextPageLoading = (loadedRecordsCount > 0 && !isClearGridData);
							if (isNextPageLoading) {
								var lastRecord = config.lastRecord ||
									collection.getByIndex(loadedRecordsCount - newLoadedCount);
								var columnDataValueType = this.getDataValueType(lastRecord, primaryColumnName);
								conditionalValues[0] = {
									ColumnName: "CreatedOn",
									Value: lastRecord.get("CreatedOn"),
									ValueType: this.getDataValueType(lastRecord, "CreatedOn")
								};
								conditionalValues[1] = {
									ColumnName: primaryColumnName,
									Value: lastRecord.get(primaryColumnName),
									ValueType: columnDataValueType
								};
							}
							requestOptions.ConditionalValues = conditionalValues;
						},

						/**
						 * Создает конфигурацию колонок для экземпляра BaseViewModel.
						 * @private
						 * @param {Object} rowConfig Содержит типы всех колонок, которые были переданы с сервера.
						 * @return {Object} Возвращает конфигурацию колонок сущности.
						 */
						getViewModelRowConfig: function(rowConfig) {
							var result = rowConfig;
							Terrasoft.each(rowConfig, function(column, columnName) {
								if (result[columnName]) {
									result[columnName].columnPath = columnName;
								}
							}, this);
							return result;
						},

						/**
						 * Формирует экземляр ViewModel по результатам запроса.
						 * @private
						 * @param {Object} rawData Строка результата запроса.
						 * @param {Object} rowConfig Содержит типы всех колонок, которые были переданы с сервера.
						 * @return {Terrasoft.BaseViewModel} Возвращает созданный экземпляр сущности по данным
						 * rawData c учетом rowConfig.
						 */
						getViewModelByQueryResult: function(rawData, rowConfig) {
							Terrasoft.each(rowConfig, function(column, columnName) {
								var rowDataType = column.dataValueType;
								if (rowDataType === Terrasoft.DataValueType.DATE ||
									rowDataType === Terrasoft.DataValueType.DATE_TIME ||
									rowDataType === Terrasoft.DataValueType.TIME) {
									var rawDate = rawData[columnName];
									rawData[columnName] =
										Ext.isEmpty(rawDate) ? null : Terrasoft.parseDate(rawDate);
								}
							}, this);
							return Ext.create("Terrasoft.BaseViewModel", {
								entitySchema: this.rootSchema,
								rowConfig: this.getViewModelRowConfig(rowConfig),
								values: rawData,
								isNew: false,
								isDeleted: false
							});
						},

						/**
						 * Формирует коллекцию моделей представления на основании резултатов запроса к сервису.
						 * @private
						 * @param {Object} response Результат запроса к сервису.
						 * @returns {Terrasoft.BaseViewModelCollection|*} Коллекция моделей представления.
						 */
						getViewModelCollection: function(response) {
							var rowConfig = response.rowConfig;
							var viewModelCollection = Ext.create("Terrasoft.BaseViewModelCollection", {
								rowConfig: response.rowConfig
							});
							var primaryColumnName = "Id";
							Terrasoft.each(response.rows, function(row) {
								var viewModel = this.getViewModelByQueryResult(row, rowConfig);
								if (rowConfig[primaryColumnName]) {
									var key = viewModel.get(primaryColumnName);
									if (viewModelCollection.contains(key)) {
										viewModelCollection.addItem(viewModel);
									} else {
										viewModelCollection.add(key, viewModel);
									}
								} else {
									viewModelCollection.addItem(viewModel);
								}
							}, this);

							return viewModelCollection;
						},

						/**
						 * Загружает визы в коллекцию Visas
						 * @param {Boolean} isLoadNew Признак, который отвечает, что нужно произвести дозагрузку новых
						 * виз
						 * @private
						 */
						loadVisas: function(isLoadNew) {
							var visasCollection = this.get("Visas");
							if (isLoadNew) {
								visasCollection.clear();
							}
							var requestOptions = {
								IsPageable: false,
								RowCount: 0,
								ConditionalValues: []
							};
							var config = {
								collection: this.get("Visas"),
								primaryColumnName: "Id",
								isPageable: true,
								rowCount: 15,
								isClearGridData: false
							};
							this.initializePageableOptions(requestOptions, config);
							ServiceHelper.callService(
								"VisaDataService",
								"GetVisaEntities",
								function(responseObject) {
									var response = Terrasoft.decode(responseObject.GetVisaEntitiesResult);
									if (response.rowsAffected > 0) {
										var viewModelCollection = this.getViewModelCollection(response);
										viewModelCollection.each(function(item) {
											this.decorateItem(item);
										}, this);
										visasCollection.loadAll(viewModelCollection);
										sandbox.publish("UpdateRemindingsCount");
									}
								}, {
									sysAdminUnitId: Terrasoft.core.enums.SysValue.CURRENT_USER.value,
									requestOptions: requestOptions
								}, this);
						},

						/**
						 * Функция дозагрузки виз
						 * @private
						 */
						onLoadNext: function() {
							this.loadVisas(false);
						},

						/**
						 * Обновляет количество новых виз на основании значений счетчиков,
						 * которые получены в результате выполнения задачи на сервере.
						 * @private
						 * @param {Object} scope Контекст
						 * @param {Object} userCounters Объект, который в себе содержит значения счетчиков
						 * количества виз
						 */
						onChangeVisasCount: function(scope, userCounters) {
							if (userCounters && userCounters.Header.Sender !== "GetRemindingCounters") {
								return;
							}
							var counters = Ext.decode(userCounters.Body);
							var visasCount = counters.VisaCount;
							var visas = this.get("CommonVisasCount");
							var newVisasCount = visas - visasCount;
							var notOpenedVisasCount = this.get("NotOpenedVisasCount");
							this.set("NotOpenedVisasCount", notOpenedVisasCount +
								newVisasCount * (-1));
							var loadedVisasCount = this.get("Visas").getCount();
							if (visasCount > 0 && (newVisasCount < 0) &&
								(visas - loadedVisasCount) >= 0) {
								this.set("NewVisasCount", this.get("NotOpenedVisasCount"));
								var visasContainer = Ext.get("visaItemsContainer");
								if (visasContainer.hasCls("default-visa-items-container-class")) {
									visasContainer.removeCls("default-visa-items-container-class");
									visasContainer.addCls("offset-visa-items-container-class");
								}
								this.set("ShowNewVisasVisible", true);
							}
							this.set("CommonVisasCount", counters.VisaCount);
						},

						/**
						 * Выполняет инициализацию модели представления
						 * @private
						 */
						init: function() {
							this.loadVisas(false);
							Terrasoft.ServerChannel.on(Terrasoft.EventName.ON_MESSAGE,
								this.onChangeVisasCount, this);
							RemindingsUtilities.getRemindingsCounters(this, function(counters) {
								this.set("CommonVisasCount", counters.VisaCount);
							});
							var visaItemsContainer = Ext.get("visaItemsContainer");
							visaItemsContainer.on("click", scope.onVisaClick, this);
						}
					}
				});
			},

			/**
			 * Обработчик события клика на контейнере виз
			 * @param {Ext.EventObject} event Событие
			 * @param HTMLElement target Элемент на котором выполнен клик
			 */
			onVisaClick: function(event, target) {
				var targetEl = Ext.get(target);
				var root = Ext.get("visaItemsContainer").dom;
				var visaEl = targetEl.findParent("[class*='visa-container']", root, true);
				if (!visaEl) {
					return;
				}
				if (!visaEl.hasCls("selected-item-class")) {
					visaEl.addCls("selected-item-class");
				}
				var lastSelectedRow = this.LastSelectedRow;
				if (lastSelectedRow && visaEl.id !== lastSelectedRow.id) {
					if (lastSelectedRow.hasCls("selected-item-class")) {
						lastSelectedRow.removeCls("selected-item-class");
					}
				}
				this.LastSelectedRow = visaEl;
			},

			/**
			 * Выполняет прорисовку модуля в контейнер
			 * @private
			 * @param {Ext.Element} renderTo
			 */
			render: function(renderTo) {
				var view = this.getView();
				var viewModel = this.getViewModel();
				view.bind(viewModel);
				view.render(renderTo);
				viewModel.init();
			},

			/**
			 * Деструктор класса
			 * @private
			 */
			destroy: function() {
				var visaItemsContainer = Ext.get("visaItemsContainer");
				if (visaItemsContainer) {
					visaItemsContainer.un("click", this.onVisaClick, this);
				}
			}
		});
		return Terrasoft.VisaModule;
	});