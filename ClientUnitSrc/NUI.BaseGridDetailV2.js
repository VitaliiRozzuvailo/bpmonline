define("BaseGridDetailV2", ["BaseGridDetailV2Resources", "ConfigurationEnums", "GridUtilitiesV2", "WizardUtilities",
			"QuickFilterModuleV2"],
	function(resources, enums) {
		return {
			messages: {
				/**
				 * @message OpenCard
				 * Возвращает информацию о карточке
				 */
				"getCardInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message CardSaved
				 * Принимает информацию, о том, что родельская страница сохранилась
				 */
				"CardSaved": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message RerenderQuickFilterModule
				 * Публикует сообщение для перерисовки фильтра.
				 */
				"RerenderQuickFilterModule": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * @message GetModuleSchema
				 * Возвращает информацию о сущности с которой работает фильтр.
				 */
				"GetModuleSchema": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message UpdateFilter
				 * Сообщение обработчика события фильтра в детали.
				 */
				"UpdateFilter": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetShortFilterFieldsVisible
				 * Возвращает признак отображения полей ввода данных для фильтра.
				 */
				"GetShortFilterFieldsVisible": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},

			mixins: {
				GridUtilities: "Terrasoft.GridUtilities",
				WizardUtilities: "Terrasoft.WizardUtilities"
			},
			/**
			 * Атрибуты модели представления
			 * @type {Object}
			 */
			attributes: {
				/**
				 * Значение первичной колонки активной записи реестра.
				 */
				ActiveRow: {dataValueType: Terrasoft.DataValueType.GUID},

				/**
				 * Признак "грид пустой".
				 */
				IsGridEmpty: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Признак "грид в процессе загрузки".
				 */
				IsGridLoading: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Разрешен множественный выбор.
				 */
				MultiSelect: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Массив выбранных строк.
				 */
				SelectedRows: {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Количество строк.
				 */
				RowCount: {dataValueType: Terrasoft.DataValueType.INTEGER},

				/**
				 * Постраничная загрузка.
				 */
				IsPageable: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Признак "данные загружены".
				 */
				IsGridDataLoaded: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Направление сортировки.
				 */
				GridSortDirection: {dataValueType: Terrasoft.DataValueType.INTEGER},

				/**
				 * Колонка сортировки.
				 */
				SortColumnIndex: {dataValueType: Terrasoft.DataValueType.INTEGER},

				/**
				 * Хранит информацию о необходимости изменения конфига колонок текущего реестра.
				 */
				GridSettingsChanged: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Значение первичной колонки активной записи, перед перезагрузкой реестра.
				 */
				ActiveRowBeforeReload: {dataValueType: Terrasoft.DataValueType.GUID},

				/**
				 * Режим открытия карточки записи.
				 */
				CardState: {dataValueType: Terrasoft.DataValueType.TEXT},

				/**
				 * Уникальный идентификатор карточки.
				 */
				EditPageUId: {dataValueType: Terrasoft.DataValueType.GUID},

				/**
				 * Коллекция выпадающего списка функциональной кнопки.
				 */
				ToolsButtonMenu: {
					dataValueType: Terrasoft.DataValueType.COLLECTION
				},

				/**
				 * Коллекция фильтров детали.
				 */
				"DetailFilters": {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Флаг, очищать реестр детали.
				 */
				"IsClearGridData": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Признак, что мастер детали доступный.
				 */
				IsDetailWizardAvailable: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Признак отображения фильтра по умолчанию.
				 */
				IsDetailFilterVisible: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Признак наличия хотя бы одного фильтра в детали.
				 */
				IsFilterAdded: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: true
				},

				/**
				 * Признак отображения полей ввода данных для фильтра.
				 */
				IsShortFilterFieldsVisible: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Признак нажатия кнопки взаимосвязей.
				 */
				IsRelationshipButtonPressed: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Признак использования взаимосвязей.
				 */
				UseRelationship: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

				/**
				 * Индификатор типа взаимосвязи.
				 */
				RelationType: {dataValueType: Terrasoft.DataValueType.GUID},

				/**
				 * Колонка типа взаимосвязи.
				 */
				RelationTypePath: {dataValueType: Terrasoft.DataValueType.TEXT},

				/**
				 * Колонка взаимосвязи.
				 */
				RelationshipPath: {dataValueType: Terrasoft.DataValueType.TEXT},

				/**
				 * Признак отображения кнопки взаимосвязей.
				 */
				RelationshipButtonVisible: {dataValueType: Terrasoft.DataValueType.BOOLEAN}
			},

			methods: {

				/**
				 * @inheritdoc Terrasoft.BaseDetailV2#init
				 * @overridden
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.mixins.WizardUtilities.canUseWizard(function(result) {
							this.set("IsDetailWizardAvailable", result);
							callback.call(scope);
						}, this);
					}, this]);
					this.registerMessages();
					this.initDetailFilterCollection();
					this.initFilterVisibility();
					this.isFilterAdded();
				},

				/**
				 * Инициализирует коллекцию данных представления рееестра
				 * @protected
				 */
				initData: function(callback, scope) {
					this.callParent([function() {
						this.initGridRowViewModel(function() {
							this.initGridData();
							this.initSortActionItems();
							this.reloadGridColumnsConfig();
							this.initRelationshipButton(function() {
								this.loadGridData();
								this.initToolsButtonMenu();
								this.mixins.GridUtilities.init.call(this);
								callback.call(scope);
							});
						}, this);
					}, this]);
				},

				/**
				 * Выполняет загрузку представления списка
				 * @protected
				 * @virtual
				 */
				loadGridData: function() {
					if (!this.get("IsDetailCollapsed") && !this.get("IsGridLoading")) {
						this.mixins.GridUtilities.loadGridData.call(this);
					}
				},

				/**
				 * Выполняет инициализацию значений по умолчанию для работы со списком
				 * @protected
				 * @virtual
				 */
				initGridData: function() {
					this.set("ActiveRow", "");
					if (Ext.isEmpty(this.get("MultiSelect"))) {
						this.set("MultiSelect", false);
					}
					if (Ext.isEmpty(this.get("IsPageable"))) {
						this.set("IsPageable", true);
					}
					this.set("IsClearGridData", false);
					if (!Ext.isNumber(this.get("RowCount"))) {
						this.set("RowCount", 5);
					}
				},

				/**
				 * Инициирует загрузку сторонних модулей
				 * @protected
				 */
				onRender: function() {
					if (this.get("GridSettingsChanged")) {
						this.reloadGridData();
					} else {
						var gridData = this.getGridData();
						this.reloadGridColumnsConfig(true);
						if (gridData && gridData.getCount() > 0) {
							var tempCollection = this.Ext.create("Terrasoft.BaseViewModelCollection");
							var items = gridData.getItems();
							Terrasoft.each(items, function(item) {
								tempCollection.add(item.get("Id"), item);
							});
							gridData.clear();
							gridData.loadAll(tempCollection);
						}
					}
					this.subscribeGridEvents();
				},

				/**
				 * Генерирует индентификатор загружаемого модуля.
				 * @protected
				 * @overridden
				 * @param {String} moduleName Имя модуля.
				 * @return {String} Идентификатор модуля.
				 */
				getModuleId: function(moduleName) {
					if (moduleName === "QuickFilterModuleV2") {
						return this.getQuickFilterModuleId();
					}
					return this.sandbox.id + "_" + moduleName;
				},

				/**
				 * Возвращает коллекцию реестра.
				 * @return {Object}
				 */
				getGridData: function() {
					return this.get("Collection");
				},

				/**
				 * Возвращает ключ профиля.
				 * @returns {String} Ключ
				 */
				getProfileKey: function() {
					return this.get("CardPageName") + this.get("SchemaName");
				},

				/**
				 * Получает коллекцию фильтров.
				 * @overridden
				 * @returns {Terrasoft.FilterGroup} группы фильтров детали.
				 */
				getFilters: function() {
					var detailFilters = this.get("DetailFilters");
					var masterColumnFilters = this.get("Filter");
					var serializationMasterColumnInfo = masterColumnFilters.getDefSerializationInfo();
					serializationMasterColumnInfo.serializeFilterManagerInfo = true;
					var serializationDetailInfo = detailFilters.getDefSerializationInfo();
					serializationDetailInfo.serializeFilterManagerInfo = true;
					var deserializedMasterColumnFilters = Terrasoft.deserialize(masterColumnFilters
						.serialize(serializationMasterColumnInfo));
					var deserializedDetailFilters = Terrasoft.deserialize(detailFilters.serialize(serializationDetailInfo));
					if (this.get("IsRelationshipButtonPressed")) {
						var mainFilterGroup = this.getRelationshipFilters();
						mainFilterGroup.logicalOperation = this.Terrasoft.LogicalOperatorType.OR;
						mainFilterGroup.add("masterRecordFilter", deserializedMasterColumnFilters);
						deserializedDetailFilters.add("mainFilterGroup", mainFilterGroup);
					} else {
						deserializedDetailFilters.add("masterRecordFilter", deserializedMasterColumnFilters);
					}
					return deserializedDetailFilters;
				},

				/**
				 * Возвращает активную строку.
				 * @protected
				 * @return {Terrasoft.BaseViewModel} Активная строка.
				 */
				getActiveRow: function() {
					var isEditable = this.get("IsEditable");
					var primaryColumnValue;
					if (!isEditable) {
						var selectedItems = this.getSelectedItems();
						if (this.Ext.isEmpty(selectedItems)) {
							return null;
						}
						primaryColumnValue = selectedItems[0];
					} else {
						primaryColumnValue = this.get("ActiveRow");
					}
					if (primaryColumnValue) {
						var gridData = this.getGridData();
						return gridData.get(primaryColumnValue);
					}
				},

				/**
				 * Устанавливает признак наличия пользовательских фильтров детали.
				 */
				isFilterAdded: function() {
					var filters = this.get("DetailFilters");
					var isCustomFiltersEmpty = true;
					if (filters.find("CustomFilters")) {
						var customFilter = filters.get("CustomFilters");
						var isFilterGroup = (customFilter instanceof Terrasoft.FilterGroup);
						isCustomFiltersEmpty = !(isFilterGroup && !customFilter.isEmpty());
					}
					this.set("IsFilterAdded", isCustomFiltersEmpty);
				},

				/**
				 * Добавляет запись на деталь. Если запись, в которой находится деталь не сохранена, выполняет
				 * сохранение.
				 * @protected
				 * @param {String} editPageUId Значение колонки типа.
				 */
				addRecord: function(editPageUId) {
					if (!editPageUId) {
						var editPages = this.get("EditPages");
						if (editPages.getCount()) {
							editPageUId = editPages.getByIndex(0).get("Tag");
						}
					}
					var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
					var isNew = (cardState.state === enums.CardStateV2.ADD ||
						cardState.state === enums.CardStateV2.COPY);
					if (isNew) {
						this.set("CardState", enums.CardStateV2.ADD);
						this.set("EditPageUId", editPageUId);
						var args = {
							isSilent: true,
							messageTags: [this.sandbox.id]
						};
						this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
					} else {
						if (this.getIsEditable()) {
							this.addRow(editPageUId);
						} else {
							this.openCard(enums.CardStateV2.ADD, editPageUId, null);
						}
					}
				},

				/**
				 * Открывает страницу добавления детали.
				 * @param {String} editPageUId Значение колонки типа
				 */
				copyRecord: function(editPageUId) {
					if (!this.isAnySelected()) {
						return;
					}
					if (!editPageUId) {
						var editPages = this.get("EditPages");
						if (editPages.getCount() === 0) {
							return;
						}
						editPageUId = editPages.getByIndex(0).get("Tag");
					}
					var selectedItems = this.getSelectedItems();
					var copiedRecordId = selectedItems[0];
					var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
					var isNew = (cardState.state === enums.CardStateV2.ADD ||
						cardState.state === enums.CardStateV2.COPY);
					if (isNew) {
						this.set("CardState", enums.CardStateV2.COPY);
						this.set("EditPageUId", editPageUId);
						var args = {
							isSilent: true,
							messageTags: [this.sandbox.id]
						};
						this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
					} else {
						this.openCard(enums.CardStateV2.COPY, editPageUId, copiedRecordId);
					}
				},

				/**
				 * Для деталей использующий режим взаимосвязей,
				 * проверяет есть ли записи данной сущности для связанных объектов,
				 * если есть, то отображает кнопку взаимосвязей.
				 * @param {Function} callback Функция обратного вызова.
				 */
				initRelationshipButton: function(callback) {
					if (this.get("UseRelationship") && this.get("MasterRecordId") && this.get("DetailColumnName")) {
						var esq = this.getGridDataESQ();
						esq.addAggregationSchemaColumn(this.get("DetailColumnName"),
								this.Terrasoft.AggregationType.COUNT, "Count");
						esq.filters.addItem(this.getRelationshipFilters());
						esq.getEntityCollection(function(response) {
							var relationshipButtonVisible = false;
							if (response.success) {
								var collection = response.collection;
								if (collection && collection.getCount() > 0) {
									relationshipButtonVisible = collection.getByIndex(0).get("Count") > 0;
								}
							}
							if (relationshipButtonVisible) {
								this.initRelationshipButtonPressed();
							} else {
								this.set("IsRelationshipButtonPressed", false);
							}
							this.set("RelationshipButtonVisible", relationshipButtonVisible);
							if (this.Ext.isFunction(callback)) {
								callback.call(this);
							}
						}, this);
					} else if (this.Ext.isFunction(callback)) {
						callback.call(this);
					}
				},

				/**
				 * Устанавливает признак нажатия кнопки взаимосвязей по умолчанию.
				 */
				initRelationshipButtonPressed: function() {
					var profile = this.getProfile();
					var isRelationshipButtonPressed = !Ext.isEmpty(profile.isRelationshipButtonPressed) ?
							profile.isRelationshipButtonPressed : false;
					this.set("IsRelationshipButtonPressed", isRelationshipButtonPressed);
				},

				/**
				 * Устанавливает отображение фильтра детали и кнопки скрытия фильтра по умолчанию.
				 */
				initFilterVisibility: function() {
					this.set("IsDetailFilterVisible", false);
					this.set("IsFilterAdded", true);
				},

				/**
				 * Устанавливает параметры для отображения фильтра.
				 */
				setQuickFilterVisible: function() {
					this.set("IsShortFilterFieldsVisible", true);
					this.set("IsDetailFilterVisible", true);
				},

				/**
				 * Скрывает быстрый фильтр детали.
				 */
				hideQuickFilter: function() {
					this.set("IsDetailFilterVisible", false);
				},

				/**
				 * Возвращает доступность кнопки добавления записи.
				 * @return {Boolean}
				 */
				getAddRecordButtonEnabled: function() {
					return true;
				},

				/**
				 * Возвращает доступность кнопки с меню добавления записи.
				 * @return {Boolean}
				 */
				getAddTypedRecordButtonEnabled: function() {
					return true;
				},

				/**
				 * Возвращает доступность кнопки редактирования записи.
				 * @return {Boolean}
				 */
				getEditRecordButtonEnabled: function() {
					var selectedItems = this.getSelectedItems();
					return selectedItems && (selectedItems.length === 1);
				},

				/**
				 * Возвращает доступность пункта меню копирования записи.
				 * @return {Boolean}
				 */
				getCopyRecordMenuEnabled: function() {
					var selectedItems = this.getSelectedItems();
					return selectedItems && (selectedItems.length === 1);
				},

				/**
				 * Проверяет, выбрана ли хоть одна запись в реестре.
				 * @return {Boolean}
				 */
				isAnySelected: function() {
					var selectedItems = this.getSelectedItems();
					return selectedItems && (selectedItems.length > 0);
				},

				/**
				 * Возвращает видимость кнопки добавления записи.
				 * @protected
				 * @return {Boolean} Видимость кнопки добавления записи.
				 */
				getAddRecordButtonVisible: function() {
					var editPages = this.get("EditPages");
					var toolsVisible = this.getToolsVisible();
					var editPagesCount = editPages.getCount();
					return toolsVisible
						? ((editPagesCount === 1) || (this.getIsEditable() && (editPagesCount === 0)))
						: toolsVisible;
				},

				/**
				 * Возвращает видимость кнопки с меню добавления записи.
				 * @protected
				 * @return {Boolean} Видимость кнопки с меню добавления записи.
				 */
				getAddTypedRecordButtonVisible: function() {
					var editPages = this.get("EditPages");
					return (this.getToolsVisible() && (editPages.getCount() > 1));
				},

				/**
				 * Обработчик нажатия кнопки изменить.
				 * @param {Object} record (optional) Модель записи, которая будет открыта для редактирования,
				 * в случае если в реестре детали нет активной строки.
				 */
				editRecord: function(record) {
					var activeRow = record || this.getActiveRow();
					if (activeRow) {
						var primaryColumnValue = activeRow.get(activeRow.primaryColumnName);
						var typeColumnValue = this.getTypeColumnValue(activeRow);
						this.openCard(enums.CardStateV2.EDIT, typeColumnValue, primaryColumnValue);
					}
				},

				/**
				 * Подписывается на сообщения, необходимые для работы детали.
				 * @protected
				 * @overridden
				 */
				subscribeSandboxEvents: function() {
					this.callParent(arguments);
					var editPages = this.get("EditPages");
					editPages.each(function(editPage) {
						var typeColumnValue = editPage.get("Tag");
						var cardModuleId = this.getEditPageSandboxId(editPage);
						this.sandbox.subscribe("getCardInfo", function() {
							var detailInfo = this.getDetailInfo();
							var cardInfo = {
								valuePairs: detailInfo.defaultValues || []
							};
							var typeColumnName = this.get("TypeColumnName");
							if (typeColumnName && typeColumnValue) {
								cardInfo.typeColumnName = typeColumnName;
								cardInfo.typeUId = typeColumnValue;
							}
							return cardInfo;
						}, this, [cardModuleId]);
					}, this);
					this.sandbox.subscribe("CardSaved", this.onCardSaved, this, [this.sandbox.id]);
					this.subscribeGetModuleSchema();
					this.subscribeFiltersChanged();
					this.subscribeGetShortFilterFieldsVisible();
				},

				/**
				 * Подписка на сообщение для получение признака отображения полей ввода данных для фильтра.
				 */
				subscribeGetShortFilterFieldsVisible: function() {
					var quickFilterModuleId = this.getQuickFilterModuleId();
					this.sandbox.subscribe("GetShortFilterFieldsVisible", function() {
						var isShortFilterFieldsVisible = this.get("IsShortFilterFieldsVisible");
						this.set("IsShortFilterFieldsVisible", false);
						return isShortFilterFieldsVisible;
					}, this, [quickFilterModuleId]);
				},

				/**
				 * Обновляет деталь согласно переданным параметрам.
				 * @protected
				 * @overridden
				 * @param {Object} config конфигурация обновления детали
				 */
				updateDetail: function(config) {
					this.callParent(arguments);
					if (config.reloadAll) {
						var detailInfo = this.getDetailInfo();
						this.set("MasterRecordId", detailInfo.masterRecordId);
						this.set("DetailColumnName", detailInfo.detailColumnName);
						this.set("Filter", detailInfo.filter);
						this.set("CardPageName", detailInfo.cardPageName);
						this.set("SchemaName", detailInfo.schemaName);
						this.set("DefaultValues", detailInfo.defaultValues);
						this.set("UseRelationship", detailInfo.useRelationship);
						this.set("RelationType", detailInfo.relationType);
						this.set("RelationTypePath", detailInfo.relationTypePath);
						this.set("RelationshipPath", detailInfo.relationshipPath);
						this.set("IsGridDataLoaded", false);
						this.set("IsClearGridData", true);
						this.set("ActiveRow", null);
						this.set("SelectedRows", []);
						this.initRelationshipButton(this.loadGridData);
					} else {
						var primaryColumnValue = config.primaryColumnValue;
						this.loadGridDataRecord(primaryColumnValue);
						this.fireDetailChanged({
							action: "edit",
							rows: [primaryColumnValue]
						});
					}
				},

				/**
				 * Генерирует массив идентификоторов sandbox всех станиц редактирования детали.
				 * @protected
				 * @virtual
				 * @return {String[]} Возвращает массив идентификоторов sandbox всех станиц редактирования детали.
				 */
				getEditPagesSandboxIds: function() {
					var editPages = this.get("EditPages");
					var sandboxIds = [];
					editPages.each(function(editPage) {
						sandboxIds.push(this.getEditPageSandboxId(editPage));
					}, this);
					return sandboxIds;
				},

				/**
				 * Генерирует идентификатор sandbox для страницы редактирования.
				 * @protected
				 * @virtual
				 * @return {String} Возвращает идентификатор sandbox для страницы редактирования.
				 */
				getEditPageSandboxId: function(editPage) {
					var schemaName = editPage.get("SchemaName");
					var typeId = editPage.get("Tag");
					return this.sandbox.id + schemaName + typeId;
				},

				/**
				 * Генерирует массив тэгов для сообщения UpdateDetail.
				 * @protected
				 * @virtual
				 * @return {String[]} Возвращает массив тэгов для сообщения UpdateDetail
				 */
				getUpdateDetailSandboxTags: function() {
					var tags = this.callParent(arguments);
					return tags.concat(this.getEditPagesSandboxIds());
				},

				/**
				 * Открывает страницу редактирования.
				 * @param {String} operation Действие.
				 * @param {String} typeColumnValue Значение колонки типа.
				 * @param {String} recordId Идентификатор записи.
				 */
				openCard: function(operation, typeColumnValue, recordId) {
					var config = this.getOpenCardConfig(operation, typeColumnValue, recordId);
					this.sandbox.publish("OpenCard", config, [this.sandbox.id]);
				},

				/**
				 * Возвращает параметры открытия страницы редактирования.
				 * @protected
				 * @virtual
				 * @param {String} operation Действие.
				 * @param {String} typeColumnValue Значение колонки типа.
				 * @param {String} recordId Идентификатор записи.
				 * @return {Object}
				 */
				getOpenCardConfig: function(operation, typeColumnValue, recordId) {
					var editPages = this.get("EditPages");
					var editPage = editPages.get(typeColumnValue);
					var schemaName = editPage.get("SchemaName");
					var cardModuleId = this.getEditPageSandboxId(editPage);
					var defaultValues = this.get("DefaultValues");
					var typeColumnName = this.get("TypeColumnName");
					if (typeColumnName && typeColumnValue) {
						defaultValues.push({
							name: typeColumnName,
							value: typeColumnValue
						});
					}
					return {
						moduleId: cardModuleId,
						schemaName: schemaName,
						operation: operation,
						id: recordId,
						defaultValues: defaultValues
					};
				},

				/**
				 * Обрабатывает событие сохранения карточки, в которой находится деталь.
				 * @protected
				 * @virtual
				 */
				onCardSaved: function() {
					var editPageUId = this.get("EditPageUId");
					if (this.getIsEditable()) {
						this.addRow(editPageUId);
					} else {
						this.openCard(this.get("CardState"), editPageUId, null);
					}
				},

				/**
				 * Обрабатывает сворачивания или разворачивание детали.
				 * @protected
				 * @virtual
				 */
				onDetailCollapsedChanged: function(isCollapsed) {
					this.callParent(arguments);
					if (!isCollapsed && !this.get("IsGridDataLoaded")) {
						this.loadGridData();
					} else if (!isCollapsed && !this.get("IsFilterAdded")) {
						this.set("IsDetailFilterVisible", true);
					} else if (isCollapsed) {
						this.set("IsDetailFilterVisible", false);
					}
				},

				/**
				 * Дополнительная обработка после удаления записи.
				 * @protected
				 * @param {Object} result
				 */
				onDeleted: function(result) {
					if (result.Success) {
						this.fireDetailChanged({
							action: "delete",
							rows: result.DeletedItems
						});
					}
				},

				/**
				 * Сообщает об изменении детали.
				 * @protected
				 * @param {Object} args Информация об изменении детали {action: "delete", rows: []}
				 */
				fireDetailChanged: function(args) {
					this.sandbox.publish("DetailChanged", args, [this.sandbox.id]);
				},

				/**
				 * Переключает виды реестра.
				 * @protected
				 */
				//TODO вынести в GridUtilities?
				switchGridMode: function() {
					this.set("ActiveRow", null);
					this.set("SelectedRows", null);

					var multiSelect = this.get("MultiSelect");
					this.set("MultiSelect", !multiSelect);

					var collection = this.getGridData();
					var newCollection = this.Ext.create("Terrasoft.BaseViewModelCollection");
					newCollection.loadAll(collection);
					collection.clear();
					collection.loadAll(newCollection);
				},

				/**
				 * Получает заголовок реестра, в зависимости от текущего вида реестра.
				 * @protected
				 * @returns {String}
				 */
				getSwitchGridModeMenuCaption: function() {
					return (this.get("MultiSelect") === true) ?
						this.get("Resources.Strings.SingleModeMenuCaption") :
						this.get("Resources.Strings.MultiModeMenuCaption");
				},

				/**
				 * Обрабатывает нажатие на элемент меню сортировки колонки.
				 * @protected
				 */
				onSortClick: Terrasoft.emptyFn,

				/**
				 *
				 * @protected
				 */
				onSetupTotalClick: Terrasoft.emptyFn,

				/**
				 * Догружает данные в реестр с постраничной загрузкой данных.
				 * @protected
				 */
				loadMore: function() {
					this.loadGridData();
				},

				/**
				 * @inheritDoc Terrasoft.BaseDetailV2#initProfile
				 * @overridden
				 */
				initProfile: function() {
					var profile = this.getProfile();
					var dataGridName = this.getDataGridName();
					if (!profile[dataGridName]) {
						profile[dataGridName] = {};
						this.set("Profile", this.Terrasoft.deepClone(profile));
					}
				},

				/**
				 * Формирует название колонки, в случае если название передано в формате on(.+?)LinkClick.
				 * @param {String} columnName Название колонки.
				 * @return {String} Исправленое название колонки.
				 */
				fixColumnName: function(columnName) {
					var regexp = new RegExp("on(.+?)LinkClick", "i");
					if (regexp.test(columnName)) {
						columnName = columnName.replace("on", "");
						columnName = columnName.replace("LinkClick", "");
					}
					return columnName;
				},

				/**
				 * Открывает карточку редактирования объекта при нажатии на ссылку в реестре.
				 * @protected
				 * @overridden
				 */
				linkClicked: function(recordId, columnName) {
					var entitySchema = this.entitySchema;
					var collection = this.get("Collection");
					var row = collection.get(recordId);
					if (columnName === entitySchema.primaryDisplayColumnName ||
						columnName === ("on" + entitySchema.primaryDisplayColumnName + "LinkClick")) {
						this.editRecord(row);
						return false;
					}
					columnName = this.fixColumnName(columnName);
					var column = entitySchema.columns.hasOwnProperty(columnName)
						? entitySchema.columns[columnName]
						: null;
					if (this.Ext.isEmpty(column) || !column.hasOwnProperty("referenceSchemaName")) {
						return true;
					}
					var columnSchemaName = column.referenceSchemaName;
					var entityStructure = this.Terrasoft.configuration.EntityStructure[columnSchemaName];
					var pages = entityStructure.hasOwnProperty("pages")
						? entityStructure.pages
						: [];
					if (this.Ext.isEmpty(entityStructure) || pages.length !== 1) {
						return true;
					}
					var cardModuleId = this.sandbox.id + "_" + pages[0].cardSchema;
					var operation = enums.CardStateV2.EDIT;
					var columnValue = row.get(columnName);
					columnValue = columnValue.value
						? columnValue.value
						: columnValue;
					var openCardConfig = {
						moduleId: cardModuleId,
						schemaName: pages[0].cardSchema,
						operation: operation,
						id: columnValue
					};
					this.sandbox.publish("OpenCard", openCardConfig, [this.sandbox.id]);
					return false;
				},

				/**
				 * Инициализирует выпадающий список функциональной кнопки.
				 * @private
				 */
				initToolsButtonMenu: function() {
					var toolsButtonMenu = this.get("ToolsButtonMenu");
					if (!toolsButtonMenu) {
						toolsButtonMenu = this.Ext.create("Terrasoft.BaseViewModelCollection");
						this.set("ToolsButtonMenu", toolsButtonMenu);
					}
					this.addToolsButtonMenuItems(toolsButtonMenu);
				},

				/**
				 * Добавляет элементы в коллекцию выпадающего списка функциональной кнопки.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.BaseViewModelCollection} toolsButtonMenu Коллекция выпадающего списка
				 * функциональной кнопки.
				 */
				addToolsButtonMenuItems: function(toolsButtonMenu) {
					this.addRecordOperationsMenuItems(toolsButtonMenu);
					this.addGridOperationsMenuItems(toolsButtonMenu);
					this.addDetailWizardMenuItems(toolsButtonMenu);
				},

				/**
				 * Добавляет элементы манипулирования записями в коллекцию выпадающего списка функциональной кнопки.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.BaseViewModelCollection} toolsButtonMenu Коллекция выпадающего списка
				 * функциональной кнопки.
				 */
				addRecordOperationsMenuItems: function(toolsButtonMenu) {
					var copyRecordMenuItem = this.getCopyRecordMenuItem();
					if (copyRecordMenuItem) {
						toolsButtonMenu.addItem(copyRecordMenuItem);
					}
					var editRecordMenuItem = this.getEditRecordMenuItem();
					if (editRecordMenuItem) {
						toolsButtonMenu.addItem(editRecordMenuItem);
					}
					var deleteRecordMenuItem = this.getDeleteRecordMenuItem();
					if (deleteRecordMenuItem) {
						toolsButtonMenu.addItem(deleteRecordMenuItem);
					}
				},

				/**
				 * Возвращает элемент выпадающего списка функциональной кнопки, отвечающий за переключение режима выбора
				 * записей в реестре.
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseViewModel} Элемент выпадающего списка функциональной кнопки.
				 */
				getSwitchGridModeMenuItem: function() {
					return this.getButtonMenuItem({
						Caption: {"bindTo": "getSwitchGridModeMenuCaption"},
						Click: {"bindTo": "switchGridMode"}
					});
				},

				/**
				 * Добавляет элементы манипулирования реестром в коллекцию выпадающего списка функциональной кнопки.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.BaseViewModelCollection} toolsButtonMenu Коллекция выпадающего списка
				 * функциональной кнопки.
				 */
				addGridOperationsMenuItems: function(toolsButtonMenu) {
					var switchGridModeMenuItem = this.getSwitchGridModeMenuItem();
					if (switchGridModeMenuItem) {
						toolsButtonMenu.addItem(this.getButtonMenuSeparator());
						toolsButtonMenu.addItem(switchGridModeMenuItem);
					}
					var showQuickFilterButton = this.getShowQuickFilterButton();
					if (showQuickFilterButton) {
						toolsButtonMenu.addItem(this.getButtonMenuSeparator());
						toolsButtonMenu.addItem(showQuickFilterButton);
					}
					var hideQuickFilterButton = this.getHideQuickFilterButton();
					if (hideQuickFilterButton) {
						toolsButtonMenu.addItem(this.getButtonMenuSeparator());
						toolsButtonMenu.addItem(hideQuickFilterButton);
					}
					var gridSortMenuItem = this.getGridSortMenuItem();
					if (gridSortMenuItem) {
						toolsButtonMenu.addItem(this.getButtonMenuSeparator());
						toolsButtonMenu.addItem(gridSortMenuItem);
					}
					var gridSettingsMenuItem = this.getGridSettingsMenuItem();
					if (gridSettingsMenuItem) {
						toolsButtonMenu.addItem(this.getButtonMenuSeparator());
						toolsButtonMenu.addItem(gridSettingsMenuItem);
					}
				},

				/**
				 * Добавляет элементы мастера детали в коллекцию выпадающего списка функциональной кнопки.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.BaseViewModelCollection} toolsButtonMenu Коллекция выпадающего списка
				 * функциональной кнопки.
				 */
				addDetailWizardMenuItems: function(toolsButtonMenu) {
					toolsButtonMenu.addItem(this.getButtonMenuSeparator());
					toolsButtonMenu.addItem(this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.DetailWizardMenuCaption"},
						Click: {"bindTo": "openDetailWizard"},
						Visible: {"bindTo": "IsDetailWizardAvailable"}
					}));
				},

				/**
				 * Возвращает элемент выпадающего списка функциональной кнопки, отвечающий за копирование записи.
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseViewModel} Элемент выпадающего списка функциональной кнопки, отвечающий за
				 * копирование записи.
				 */
				getCopyRecordMenuItem: function() {
					return this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.CopyMenuCaption"},
						Click: {"bindTo": "copyRecord"},
						Enabled: {bindTo: "getCopyRecordMenuEnabled"}
					});
				},

				/**
				 * Возвращает элемент выпадающего списка функциональной кнопки, отвечающий за редактирование записи.
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseViewModel} Элемент выпадающего списка функциональной кнопки, отвечающий за
				 * редактирование записи.
				 */
				getEditRecordMenuItem: function() {
					return this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.EditMenuCaption"},
						Click: {"bindTo": "editRecord"},
						Enabled: {bindTo: "getEditRecordButtonEnabled"}
					});
				},

				/**
				 * Возвращает элемент выпадающего списка функциональной кнопки, отвечающий за удаление записи.
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseViewModel} Элемент выпадающего списка функциональной кнопки, отвечающий за
				 * удаление записи.
				 */
				getDeleteRecordMenuItem: function() {
					return this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.DeleteMenuCaption"},
						Click: {"bindTo": "deleteRecords"},
						Enabled: {bindTo: "isAnySelected"}
					});
				},

				/**
				 * Возвращает элемент выпадающего списка функциональной кнопки, отвечающий за сортировку реестра.
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseViewModel} Элемент выпадающего списка функциональной кнопки, отвечающий за
				 * сортировку реестра.
				 */
				getGridSortMenuItem: function() {
					return this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.SortMenuCaption"},
						Items: this.get("SortColumns")
					});
				},

				/**
				 * Возвращает элемент выпадающего списка функциональной кнопки, отвечающий за отображение быстрого
				 * фильтра.
				 * @return {Terrasoft.BaseViewModel} Элемент выпадающего списка функциональной кнопки, отвечающий за
				 * отображение быстрого фильтра.
				 */
				getShowQuickFilterButton: function() {
					return this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.QuickFilterCaption"},
						Click: {"bindTo": "setQuickFilterVisible"},
						Visible: {
							"bindTo": "IsDetailFilterVisible",
							"bindConfig": {
								converter: function(value) {
									return !value;
								}
							}
						}
					});
				},

				/**
				 * Возвращает элемент выпадающего списка функциональной кнопки, отвечающий за скрытие быстрого фильтра.
				 * @return {Terrasoft.BaseViewModel} Элемент выпадающего списка функциональной кнопки, отвечающий за
				 * скрытие фильтра.
				 */
				getHideQuickFilterButton: function() {
					return this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.RemoveQuickFilterCaption"},
						Click: {"bindTo": "hideQuickFilter"},
						Visible: {"bindTo": "IsDetailFilterVisible"},
						Enabled: {"bindTo": "IsFilterAdded"}
					});
				},

				/**
				 * Возвращает элемент выпадающего списка функциональной кнопки, отвечающий за настройку реестра.
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseViewModel} Элемент выпадающего списка функциональной кнопки, отвечающий за
				 * настройку реестра.
				 */
				getGridSettingsMenuItem: function() {
					return this.getButtonMenuItem({
						Caption: {"bindTo": "Resources.Strings.SetupGridMenuCaption"},
						Click: {"bindTo": "openGridSettings"}
					});
				},

				/**
				 * Отправляет сообщение модулю быстрой фильрации для его перерисовки.
				 * @protected
				 * @param {Object} config Объект со свойствами для установки.
				 * @param {String} config.moduleName Наименование модуля.
				 * @param {String} config.containerId Идентификатор контейнера, в который отрисовывается фильтр.
				 */
				sendFilterRerender: function(config) {
					if (Ext.isEmpty(config.moduleName)) {
						return;
					}
					var moduleId = this.getModuleId(config.moduleName);
					var args = {
						renderTo: config.containerId
					};
					this.sandbox.publish("RerenderQuickFilterModule", args, [moduleId]);
				},

				/**
				 * Отправляет сообщение модулю быстрой фильтрации для установки параметров отображения.
				 * @protected
				 */
				sendFilterFullModeVisible: function() {
					var quickFilterModuleId = this.getQuickFilterModuleId();
					this.sandbox.publish("FilterFullModeVisible", null, [quickFilterModuleId]);
				},

				/**
				 * Инициализация фильтра детали.
				 */
				initDetailFilterCollection: function() {
					this.set("DetailFilters", this.Ext.create("Terrasoft.FilterGroup"));
				},

				/**
				 * Устанавливает значение фильтров в детали.
				 * @protected
				 * @param {String} key Тип фильтров.
				 * @param {Object} value Значение фильтров.
				 */
				setFilter: function(key, value) {
					var filters = this.get("DetailFilters");
					if (key) {
						if (filters.find(key)) {
							filters.remove(filters.get(key));
						}
						filters.add(key, value);
					} else if (value) {
						value.each(function(filter) {
							this.setFilter(filter.key, filter);
						}, this);
					}
				},

				/**
				 * Обновляет реестр детали после применения фильтров.
				 * @overridden
				 */
				afterFiltersUpdated: function() {
					this.loadGridData();
					this.isFilterAdded();
				},

				/**
				 * Возвращает признак отображения фильтра без выпадающего меню.
				 * @overridden
				 * @return {Boolean} Признак отображения фильтра без выпадающего меню.
				 */
				getShortFilterVisible: function() {
					return true;
				},

				/**
				 * Загружает быстрый фильтр.
				 * @param config Параметры загрузки модуля.
				 */
				loadQuickFilter: function(config) {
					var moduleId = this.getModuleId(config.moduleName);
					var args = {
						renderTo: config.containerId
					};
					var rendered = this.sandbox.publish("RerenderQuickFilterModule", args, [moduleId]);
					if (!rendered) {
						this.loadModule(config);
					}
				},

				/**
				 * Возвращает признак видимости кнопки отображения записей по взаимосвязи.
				 * @protected
				 * @return {Boolean} Признак видимости кнопки отображения записей по взаимосвязи.
				 */
				getRelationshipButtonVisible: function() {
					return this.get("RelationshipButtonVisible") && this.getToolsVisible();
				},

				/**
				 * Устанавливает признак нажатия кнопки взаимосвязей, сохраняет значение в профиль,
				 * и перезагружает данные детали.
				 * @protected
				 */
				onRelationshipButtonClick: function() {
					var isRelationshipButtonPressed = !this.get("IsRelationshipButtonPressed");
					var profile = this.getProfile();
					var key = this.getProfileKey();
					if (profile && key) {
						profile.isRelationshipButtonPressed = isRelationshipButtonPressed;
						this.set(this.getProfileColumnName(), profile);
						this.Terrasoft.utils.saveUserProfile(key, profile, false);
					}
					this.set("IsRelationshipButtonPressed", isRelationshipButtonPressed);
					this.reloadGridData();
				},

				/**
				 * Возвращает фильтр взаимосвязей.
				 * @protected
				 * @return {Terrasoft.FilterGroup} Фильтр по взаимосвязям.
				 */
				getRelationshipFilters: function() {
					var mainFilterGroup = this.Ext.create("Terrasoft.FilterGroup");
					var relationshipFilterGroup = this.Ext.create("Terrasoft.FilterGroup");
					var masterRecordId = this.get("MasterRecordId");
					var detailColumnName = this.get("DetailColumnName");
					var relationTypePath = this.get("RelationTypePath");
					var relationshipPath = this.get("RelationshipPath");
					var relationType = this.get("RelationType");
					if (relationTypePath && relationshipPath && relationType) {
						relationshipFilterGroup.add("relationshipFilter", this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL,
								relationTypePath,
								relationType,
								Terrasoft.DataValueType.GUID));
						relationshipFilterGroup.add("relationshipTypeFilter", this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL,
								relationshipPath,
								masterRecordId,
								Terrasoft.DataValueType.GUID));
					} else {
						relationshipFilterGroup.add("relationshipFilter", this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL,
								this.getDefaultRelationshipPath(),
								masterRecordId,
								Terrasoft.DataValueType.GUID));
					}
					mainFilterGroup.add("subRelationshipFilterGroup", this.Terrasoft.createExistsFilter(
							detailColumnName,
							relationshipFilterGroup));
					return mainFilterGroup;
				},

				/**
				 * Строит путь к колонке взаимосвязи по умолчанию.
				 * @protected
				 * @return {String} Путь к колонке взаимосвязи по умолчанию.
				 */
				getDefaultRelationshipPath: function() {
					return "[Account:Id:" + this.get("DetailColumnName") + "].Parent";
				},

				/**
				 * Очищает подписки на события.
				 */
				destroy: function() {
					this.mixins.GridUtilities.destroy.call(this);
					this.callParent(arguments);
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "DataGrid",
					"parentName": "Detail",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID,
						"listedZebra": true,
						"collection": {"bindTo": "Collection"},
						"activeRow": {"bindTo": "ActiveRow"},
						"primaryColumnName": "Id",
						"isEmpty": {"bindTo": "IsGridEmpty"},
						"isLoading": {"bindTo": "IsGridLoading"},
						"multiSelect": {"bindTo": "MultiSelect"},
						"selectedRows": {"bindTo": "SelectedRows"},
						"sortColumn": {"bindTo": "sortColumn"},
						"sortColumnDirection": {"bindTo": "GridSortDirection"},
						"sortColumnIndex": {"bindTo": "SortColumnIndex"},
						"linkClick": {"bindTo": "linkClicked"}
					}
				},
				{
					"operation": "insert",
					"parentName": "Detail",
					"propertyName": "items",
					"name": "loadMore",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {
							"bindTo": "Resources.Strings.LoadMoreButtonCaption"
						},
						"click": {
							"bindTo": "loadMore"
						},
						"controlConfig": {
							"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							"imageConfig": resources.localizableImages.LoadMoreIcon
						},
						"classes": {
							"wrapperClass": ["load-more-button-class"]
						},
						"visible": {
							"bindTo": "CanLoadMoreData"
						}
					}
				},
//				AddRecordButton
				{
					"operation": "insert",
					"name": "AddRecordButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "addRecord"},
						"visible": {"bindTo": "getAddRecordButtonVisible"},
						"enabled": {"bindTo": "getAddRecordButtonEnabled"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"caption": {"bindTo": "Resources.Strings.AddButtonCaption"}
					}
				},
//				AddTypedRecordButton
				{
					"operation": "insert",
					"name": "AddTypedRecordButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"menu": {
							"items": {
								"bindTo": "EditPages"
							}
						},
						"visible": {"bindTo": "getAddTypedRecordButtonVisible"},
						"enabled": {"bindTo": "getAddTypedRecordButtonEnabled"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"caption": {"bindTo": "Resources.Strings.AddButtonCaption"}
					}
				},
				// ToolsButton
				{
					"operation": "insert",
					"name": "ToolsButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "Resources.Images.ToolsButtonImage"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"visible": {"bindTo": "getToolsVisible"},
						"classes": {
							wrapperClass: ["detail-tools-button-wrapper"],
							menuClass: ["detail-tools-button-menu"]
						},
						"menu": {
							"items": {
								"bindTo": "ToolsButtonMenu"
							}
						}
					}
				},
				// Действия
				{
					"operation": "insert",
					"name": "ActionsButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ActionsButtonCaption"},
						"visible": false,
						"menu": []
					}
				},
				// Вид
				{
					"operation": "insert",
					"name": "ViewButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.ViewButtonCaption"},
						"visible": false,
						"menu": []
					}
				},
				// Взаимосвязи
				{
					"operation": "insert",
					"name": "RelationshipButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.RelationshipButtonImage"},
						"visible": {"bindTo": "getRelationshipButtonVisible"},
						"pressed": {"bindTo": "IsRelationshipButtonPressed"},
						"click": {"bindTo": "onRelationshipButtonClick"},
						"hint": {"bindTo": "Resources.Strings.RelationshipButtonHint"},
						"classes": {
							"wrapperClass": ["detail-relationship-button-wrapper"]
						}
					}
				},
				// Фильтры
				{
					"operation": "insert",
					"name": "FiltersContainer",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.MODULE,
						"moduleName": "QuickFilterModuleV2",
						"generateId": true,
						"makeUniqueId": true,
						"visible": {"bindTo": "IsDetailFilterVisible"},
						"classes": {
							wrapClassName: ["detail-filter-container-style"]
						},
						"afterrender": {"bindTo": "loadQuickFilter"},
						"afterrerender": {"bindTo": "sendFilterRerender"}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
