define("ViewModelSchemaDesignerSchema", ["ColumnHelper",
	"ContainerListGenerator", "ContainerList", "ViewModelSchemaDesignerItem", "css!ViewModelSchemaDesignerItem",
	"GridLayoutEditItemModel", "ImageCustomGeneratorV2", "DetailManager", "ImageCustomGeneratorV2"],
	function(ColumnHelper) {

		///TODO:
		/**
		 *
		 * отображение обязательности на сетке
		 *
		 * Работа с конверторами, предупреждение
		 *
		 * Создавать колонку с префиксом в имени
		 *
		 * при перетаскивании в диффе появляется идентификатор сетки
		 *
		 * Стили для левой панели
		 *
		 * Настройка Полей:
		 * работа параметра "Простой справочник" в настройке поля
		 */
		return {

			messages: {
				/**
				 * @message GetModuleInfo
				 */
				"GetModuleInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message OnDesignerSaved
				 */
				"OnDesignerSaved": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * @message GetColumnConfig
				 */
				"GetColumnConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Публикация сообщения для запроса параметров модуля.
				 */
				"GetModuleConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Подписка на сообщение для получения параметров подуля.
				 */
				"GetModuleConfigResult": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Подписка на сообщение валидации модуля.
				 */
				"Validate": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Публикация сообщения для отправки результатов валидации модуля.
				 */
				"ValidationResult": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Подписка на сообщение взятия идентификатора текущего пакета.
				 */
				"GetNewLookupPackageUId": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Публикация сообщения взятия идентификатора текущего пакета.
				 */
				"GetPackageUId": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Подписка на сообщение сохранения модуля.
				 */
				"Save": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Публикация сообщения для отправки результатов сохранения модуля.
				 */
				"SavingResult": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message GetSchemaColumnsNames
				 */
				"GetSchemaColumnsNames": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},
				/**
				 * @message GetDesignerDisplayConfig
				 */
				"GetDesignerDisplayConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			/**
			 * Атрибуты модели представления
			 * @type {Object}
			 */
			attributes: {

				/**
				 * Коллекция сущесвующих колонок для перетаскивания.
				 */
				ExistingModelDraggableItems: {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Коллекция типов новых колонок для перетаскивания.
				 */
				NewModelDraggableItems: {dataValueType: Terrasoft.DataValueType.COLLECTION},

				/**
				 * Признак доступности добавления новых полей.
				 */
				CanAddNewColumn: {dataValueType: Terrasoft.DataValueType.BOOLEAN}
			},
			methods: {

				/**
				 * Иниципализация параметров, на которые есть завязки в базовой карточке.
				 * @protected
				 * @virtual
				 */
				initSchemaBindings: function() {
					this.set("ReportGridData", this.Ext.create("Terrasoft.Collection"));
					this.set("IsSeparateMode", false);
					this.initTabs();
				},

				/**
				 * Инициализирует начальные значения модели. Замещаем всю логику страныц редактирования.
				 * @protected
				 * @overridden
				 * @param {Function} callback Функция, которая будет вызвана по завершению.
				 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
				 */
				init: function(callback, scope) {
					this.subscribeSandboxEvents();
					var emptyInfoImage = this.get("Resources.Images.EmptyInfoImage");
					this.set("EmptyInfoImageSrc", Terrasoft.ImageUrlBuilder.getUrl(emptyInfoImage));
					if (!this.get("GenerationValid")) {
						this.log(this.get("GenerationInfoMessage"));
						callback.call(scope);
						return;
					}
					this.initSchemaBindings();
					Terrasoft.chain(
						function(next) {
							var sandbox = this.sandbox;
							sandbox.subscribe("GetModuleConfigResult", function(moduleConfig) {
								this.set("CurrentClientUnitSchema", moduleConfig.clientUnitSchema);
								this.set("CurrentEntitySchema", moduleConfig.entitySchema);
								next();
							}, this, [sandbox.id]);
							sandbox.publish("GetModuleConfig", null, [sandbox.id]);
						},
						this.initGridLayoutItemsCollection,
						this.initCanAddNewColumn,
						this.initializeExistingModelDraggableItems,
						this.initializeNewModelDraggableItems,
						this.initDetailsCaptions,
						function() {
							callback.call(scope);
						}, this);
				},

				/**
				 * Инициализирует признак доступности добавления новых колонок.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция, которая будет вызвана по завершению.
				 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
				 */
				initCanAddNewColumn: function(callback, scope) {
					var entitySchema = this.get("CurrentEntitySchema");
					var isDBView = entitySchema.isDBView;
					this.set("CanAddNewColumn", isDBView ? false : true);
					callback.call(scope);
				},

				/**
				 * Инициализирует заголовки деталей.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция, которая будет вызвана по завершению.
				 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
				 */
				initDetailsCaptions: function(callback, scope) {
					var detailManagerItems = Terrasoft.DetailManager.getItems();
					Terrasoft.each(this.details, function(registeredDetailInfo, registeredDetailName) {
						var detailsCollection = detailManagerItems.filterByFn(function(detail) {
							return registeredDetailInfo.schemaName === detail.getDetailSchemaName() &&
								(!registeredDetailInfo.entitySchemaName ||
								registeredDetailInfo.entitySchemaName === detail.getEntitySchemaName());
						}, this);
						var caption = "";
						if (detailsCollection.isEmpty()) {
							caption = Ext.String.format(this.get("Resources.Strings.DesignerUnregisteredDetailCaption"),
								registeredDetailName);
						} else {
							var detailManagerItem = detailsCollection.getByIndex(0);
							caption = Ext.String.format(this.get("Resources.Strings.DesignerDetailCaption"),
								detailManagerItem.getCaption());
						}
						var detailCaptionBindPropetyName = registeredDetailName + "DetailCaption";
						this.set(detailCaptionBindPropetyName, caption);
					}, this);
					callback.call(scope);
				},

				/**
				 * Инициализирует коллекцию типов новых колонок для перетаскивания.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция, которая будет вызвана по завершению.
				 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
				 */
				initializeNewModelDraggableItems: function(callback, scope) {
					var newModelDraggableItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
					var columnsArray = this.Ext.create("Terrasoft.Collection");
					var currentCulture = Terrasoft.SysValue.CURRENT_USER_CULTURE.displayValue;
					Terrasoft.each(ColumnHelper.Type, function(type, typeName) {
						var uId = Terrasoft.generateGUID();
						var captionConfig = {};
						captionConfig[currentCulture] = type.caption;
						columnsArray.add(uId, this.Ext.create("Terrasoft.manager.EntitySchemaColumn", {
							uId: uId,
							caption: captionConfig,
							name: typeName,
							dataValueType: type.dataValueType,
							status: Terrasoft.ModificationStatus.NEW
						}));
					}, this);
					this.loadColumnsCollection(newModelDraggableItems, columnsArray);
					newModelDraggableItems.each(function(item) { item.isVirtual = true; }, this);
					newModelDraggableItems.on("itemChanged", this.draggableItemChanged, this);
					this.set("NewModelDraggableItems", newModelDraggableItems);
					callback.call(scope);
				},

				/**
				 * Инициализирует коллекцию сущесвующих колонок для перетаскивания.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция, которая будет вызвана по завершению.
				 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
				 */
				initializeExistingModelDraggableItems: function(callback, scope) {
					var instance = this.get("CurrentEntitySchema");
					var draggableItemsCollection = this.Ext.create("Terrasoft.BaseViewModelCollection");
					draggableItemsCollection.on("itemChanged", this.draggableItemChanged, this);
					this.loadColumnsCollection(draggableItemsCollection, instance.columns);
					this.set("ExistingModelDraggableItems", draggableItemsCollection);
					callback.call(scope);
				},

				/**
				 * Выполняет подписки на сообщения, которые понадобятся странице.
				 * @protected
				 * @virtual
				 */
				subscribeSandboxEvents: function() {
					var sandbox = this.sandbox;
					var configureModelItemModuleId = this.getConfigureModelItemModuleId();
					sandbox.subscribe("GetModuleInfo", this.getConfigureModelItemModuleConfig,
						this, [configureModelItemModuleId]);
					sandbox.subscribe("GetColumnConfig", this.getConfigureModelItemColumnConfig,
						this, [configureModelItemModuleId]);
					sandbox.subscribe("GetSchemaColumnsNames", this.getSchemaColumnsNames,
						this, [configureModelItemModuleId]);
					sandbox.subscribe("GetDesignerDisplayConfig", this.getDesignerDisplayConfig,
						this, [configureModelItemModuleId]);
					sandbox.subscribe("OnDesignerSaved", this.onConfigureModelItemResult,
						this, [configureModelItemModuleId]);
					sandbox.subscribe("GetNewLookupPackageUId", this.getPackageUId, this, [configureModelItemModuleId]);
					sandbox.subscribe("Validate", this.onValidate, this, [sandbox.id]);
					sandbox.subscribe("Save", this.onSave, this, [sandbox.id]);
				},

				/**
				 * Возвращает идентификатор текущего пакета.
				 * @protected
				 * @virtual
				 * @return {String} Идентификатор текущего пакета.
				 */
				getPackageUId: function() {
					var sandbox = this.sandbox;
					return sandbox.publish("GetPackageUId", null, [sandbox.id]);
				},

				/**
				 * Обработчик сообщения сохранения.
				 * @protected
				 * @virtual
				 */
				onSave: function() {
					if (!this.get("GenerationValid")) {
						this.publishSavingResult(null);
						return;
					}
					this.saveDesignData(this.publishSavingResult, this);
				},

				/**
				 * Публикует результат сохранения.
				 * @protected
				 * @virtual
				 * @param {Object} saveResult Результат сохранения.
				 */
				publishSavingResult: function(saveResult) {
					var sandbox = this.sandbox;
					this.hideBodyMask();
					sandbox.publish("SavingResult", saveResult, [sandbox.id]);
				},

				/**
				 * Обработчик сообщения валидации.
				 * @protected
				 * @virtual
				 */
				onValidate: function() {
					if (!this.get("GenerationValid")) {
						this.publishValidationResult(true);
						return;
					}
					this.asyncValidate(this.publishValidationResult, this);
				},

				/**
				 * Публикует результат валидации.
				 * @protected
				 * @virtual
				 * @param {Object} result Результат валидации.
				 */
				publishValidationResult: function(result) {
					var sandbox = this.sandbox;
					this.hideBodyMask();
					sandbox.publish("ValidationResult", result, [sandbox.id]);
				},

				/**
				 * Добавляет во все перетаскиваемые элементы новую группу.
				 * @protected
				 * @virtual
				 * @param {String} groupName Новая группа для перетаскивания.
				 */
				addDraggableGroupName: function(groupName) {
					var draggableItemsCollection = this.get("ExistingModelDraggableItems");
					var newModelDraggableItems = this.get("NewModelDraggableItems");
					draggableItemsCollection.each(function(draggableItem) {
						draggableItem.addDraggableGroupName(groupName);
					}, this);
					newModelDraggableItems.each(function(draggableItem) {
						draggableItem.addDraggableGroupName(groupName);
					}, this);
				},

				/**
				 * Обновляет параметр использованых колонок.
				 * @protected
				 * @virtual
				 * @return {Object} Объек информации об использовании колонок.
				 */
				updateUsedColumns: function() {
					var usedColumns = {};
					var gridLayout = this.getGridLayoutEditCollections();
					Terrasoft.each(gridLayout, function(gridLayoutName) {
						var collectionName = this.getGridLayoutEditCollectionName(gridLayoutName);
						var itemsCollection = this.get(collectionName);
						itemsCollection.each(function(modelItem) {
							var itemConfig = modelItem.itemConfig;
							var bindTo = itemConfig.bindTo || itemConfig.name;
							var columnUsedCount = usedColumns[bindTo] || (usedColumns[bindTo] = 0);
							usedColumns[bindTo] = ++columnUsedCount;
						}, this);
					}, this);
					this.set("UsedColumns", usedColumns);
					return usedColumns;
				},

				/**
				 * Сортирует коллекцию колонок, выставляя на первое место первичную для отображения колонку,
				 * потом обязательные, потом все остальные.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.Collection} collection Коллекция колонок для сортировки.
				 */
				sortColumnsCollection: function(collection) {
					var instance = this.get("CurrentEntitySchema");
					var primaryDisplayColumnUId = instance.getPropertyValue("primaryDisplayColumnUId");
					collection.sortByFn(function(column1, column2) {
						var uId1 = column1.getPropertyValue("uId");
						if (uId1 === primaryDisplayColumnUId) {
							return -1;
						}
						var uId2 = column2.getPropertyValue("uId");
						if (uId2 === primaryDisplayColumnUId) {
							return 1;
						}
						var isRequired1 = column1.getPropertyValue("isRequired");
						var isRequired2 = column2.getPropertyValue("isRequired");
						if (isRequired1 !== isRequired2) {
							return (isRequired2 - isRequired1);
						}
						var property1 = column1.getPropertyValue("caption");
						var property2 = column2.getPropertyValue("caption");
						property1 = property1 && property1.getValue();
						property2 = property2 && property2.getValue();
						if (property1 === property2) {
							return 0;
						}
						return (property1 < property2) ? -1 : 1;
					}, this);
				},

				/**
				 * Проверяет  может ли колонки быть добавленна на сетку.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.EntitySchemaColumn} column Объект колонки.
				 * @return {Boolean} true если колонка может быть добавленна в сетку, false - в обратном случае.
				 */
				columnsFilterFn: function(column) {
					var allowedDataValeTypes = [
						Terrasoft.DataValueType.TEXT, Terrasoft.DataValueType.INTEGER,
						Terrasoft.DataValueType.FLOAT, Terrasoft.DataValueType.MONEY,
						Terrasoft.DataValueType.DATE_TIME, Terrasoft.DataValueType.DATE,
						Terrasoft.DataValueType.TIME, Terrasoft.DataValueType.LOOKUP,
						Terrasoft.DataValueType.ENUM, Terrasoft.DataValueType.BOOLEAN
					];
					return column.getPropertyValue("usageType") !== Terrasoft.EntitySchemaColumnUsageType.None &&
						Ext.Array.contains(allowedDataValeTypes, column.getPropertyValue("dataValueType"));
				},

				/**
				 * Дополняет колекцию элементамы для перетаскивания, созданными из колонок.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.Collection} collection Коллекция, в которую будут добавлены элементы.
				 * @param {Terrasoft.Collection} columns Коллекция колонок.
				 */
				loadColumnsCollection: function(collection, columns) {
					var draggableGroupNames = this.getGridLayoutEditCollections();
					var filteredColumns = columns.filterByFn(this.columnsFilterFn, this);
					this.sortColumnsCollection(filteredColumns);
					var usedColumns = this.get("UsedColumns");
					filteredColumns.each(function(column) {
						var itemKey = column.getPropertyValue("uId");
						var columnItem = this.Ext.create("Terrasoft.GridLayoutEditDragableItemModel", {
							itemConfig: {
								name: column.name,
								layout: {colSpan: 12}
							},
							column: column,
							sandbox: {id: this.sandbox.id},
							values: {
								draggableGroupNames: draggableGroupNames,
								ItemUsed: !Ext.isEmpty(usedColumns[column.name])
							}
						});
						collection.add(itemKey, columnItem);
					}, this);
				},

				/**
				 * Инициализирует коллекции элементов для сеток на странице.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция, которая будет вызвана по завершению.
				 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
				 */
				initGridLayoutItemsCollection: function(callback, scope) {
					var schemaView = this.get("SchemaView");
					this.set("GridLayouts", []);
					Terrasoft.iterateChildItems(schemaView, function(iterationConfig) {
						var item = iterationConfig.item;
						if (item.itemType === Terrasoft.ViewItemType.GRID_LAYOUT) {
							this.createGridLayoutEditCollection(item);
						}
					}, this);
					callback.call(scope);
				},

				/**
				 * Создает коллекцию элементов для сетки на странице.
				 * @protected
				 * @virtual
				 * @param {Object} config Конфигурация сетки.
				 */
				createGridLayoutEditCollection: function(config) {
					var usedColumns = this.get("UsedColumns") || {};
					var instance = this.get("CurrentEntitySchema");
					var itemsCollection = Ext.create("Terrasoft.BaseViewModelCollection");
					var columns = instance.columns;
					Terrasoft.each(config.items, function(item) {
						var bindTo = item.bindTo || item.name;
						var columnUsedCount = usedColumns[bindTo] || (usedColumns[bindTo] = 0);
						usedColumns[bindTo] = ++columnUsedCount;
						var schemaColumnCollection = columns.filterByFn(function(column) {
							return column.getPropertyValue("name") === bindTo;
						}, this);
						var schemaColumn = !schemaColumnCollection.isEmpty()
							? schemaColumnCollection.getByIndex(0)
							: null;
						itemsCollection.add(item.name, this.Ext.create("Terrasoft.GridLayoutEditItemModel", {
							itemConfig: item,
							column: schemaColumn
						}));
					}, this);
					var gridLayout = this.get("GridLayouts");
					gridLayout.push(config.name);
					this.set("UsedColumns", usedColumns);
					var itemsCollectionName = this.getGridLayoutEditCollectionName(config);
					this.set(itemsCollectionName, itemsCollection);
				},

				/**
				 * Генерирует имя коллекции элементов сетки.
				 * @protected
				 * @virtual
				 * @param {Object|String} config Конфигурация или название элемента вредставления.
				 * @return {string} Имя коллекции элементов сетки.
				 */
				getGridLayoutEditCollectionName: function(config) {
					return (config.name || config)  + "Collection";
				},

				/**
				 * Обрабативает изменение состояния перетаскиваемого элемента.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.GridLayoutEditDragableItemModel} item Пеертаскиваемый элемент.
				 * @param {Object} config Параметры события.
				 */
				draggableItemChanged: function(item, config) {
					if (config.operation) {
						switch (config.operation) {
							case "InvalidDrop":
								this.onDraggableItemInvalidDrop(item, config);
								break;
							case "DragOver":
								this.onDraggableItemDragOver(item, config);
								break;
							case "DragDrop":
								this.onDraggableItemDragDrop(item, config);
								break;
						}
					}
				},

				/**
				 * Обрабатывает события неправильно перетаскивания, очищает выделенение.
				 * @protected
				 * @virtual
				 */
				onDraggableItemInvalidDrop: function() {
					var collections = this.getGridLayoutEditCollections();
					Terrasoft.each(collections, function(gridLayoutEditName) {
						this.set(gridLayoutEditName + "Selection", null);
					}, this);
				},

				/**
				 * Обрабатывает события перетаскивания элемента на сетку.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.GridLayoutEditDragableItemModel} item Пеертаскиваемый элемент.
				 * @param {Object} config Параметры события.
				 */
				onDraggableItemDragDrop: function(item, config) {
					var currentSelection = this.get(config.layoutName + "Selection");
					if (!currentSelection) {
						return;
					}
					if (item.isVirtual) {
						this.addNewColumn(config.layoutName, item);
					} else {
						item.set("ItemUsed", true);
						this.addModelItem(config.layoutName, item);
					}
				},

				/**
				 * Обрабатывает события перетаскивания элемента над сеткой, обновляет выделеную область в сетке.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.GridLayoutEditDragableItemModel} item Пеертаскиваемый элемент.
				 * @param {Object} config Параметры события.
				 */
				onDraggableItemDragOver: function(item, config) {
					var selectionName = config.layoutName + "Selection";
					var gridLayoutEditSelection = this.get(selectionName);
					if (!gridLayoutEditSelection ||
						gridLayoutEditSelection.row !== config.row ||
						gridLayoutEditSelection.rowSpan !== config.rowSpan ||
						gridLayoutEditSelection.column !== config.column ||
						gridLayoutEditSelection.colSpan !== config.colSpan) {
						this.set(selectionName, null);
						delete config.operation;
						this.set(selectionName, config);
					}
				},

				/**
				 * Создает копию перетаскиваемого элемента.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.GridLayoutEditItemModel} item Пеертаскиваемый элемент.
				 * @return {Terrasoft.GridLayoutEditItemModel} Копия элемента.
				 */
				createItemCopy: function(item) {
					var itemConfig = Terrasoft.deepClone(item.itemConfig);
					var uId = Terrasoft.generateGUID();
					var sourceColumn = item.column;
					var schemaNamePrefix = Terrasoft.ClientUnitSchemaManager.schemaNamePrefix;
					var newColumnName = (schemaNamePrefix) ? schemaNamePrefix + sourceColumn.name : sourceColumn.name;
					var columnCopy = this.Ext.create("Terrasoft.manager.EntitySchemaColumn", {
						uId: uId,
						caption: Terrasoft.deepClone(sourceColumn.caption.cultureValues),
						name: newColumnName,
						dataValueType: sourceColumn.dataValueType,
						status: Terrasoft.ModificationStatus.NEW
					});
					var newItemConfig = {
						itemConfig: itemConfig,
						column: columnCopy
					};
					return this.Ext.create("Terrasoft.GridLayoutEditItemModel", newItemConfig);
				},

				/**
				 * Создает новую колонку и добавляет в выбранную сетку.
				 * @protected
				 * @virtual
				 * @param {String} layoutName Имя сетки.
				 * @param {Terrasoft.GridLayoutEditItemModel} item Элемент для добавления.
				 */
				addNewColumn: function(layoutName, item) {
					this.set("ActionLayoutName", layoutName);
					var newItem = this.createItemCopy(item);
					this.set("ActionLayoutItem", newItem);
					this.set("ActionLayoutCreate", true);
					this.openConfigureModuelItemModule();
				},

				/**
				 * Возвращает список сеток на странице.
				 * @protected
				 * @virtual
				 * @return {String[]} Объект развязки сеток на странице и их коллекций.
				 */
				getGridLayoutEditCollections: function() {
					var gridLayoutEditCollections = this.get("GridLayouts") || [];
					return Terrasoft.deepClone(gridLayoutEditCollections);
				},

				/**
				 * @inheritdoc BasePageV2#getCardPrintButtonVisible
				 * @overridden
				 */
				getCardPrintButtonVisible: function() {
					return false;
				},

				/**
				 * @inheritdoc BasePageV2#getSectionPrintButtonVisible
				 * @overridden
				 */
				getSectionPrintButtonVisible: function() {
					return false;
				},

				/**
				 * Проверяет чтобы все обязательные колонки были добавленны на страницу.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция, которая будет вызвана по завершению.
				 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
				 */
				validateRequiredFields: function(callback, scope) {
					var usedColumns = this.updateUsedColumns();
					var instance = this.get("CurrentEntitySchema");
					var notUsedRequiredColumns = [];
					var columns = instance.columns;
					columns = columns.filterByFn(this.columnsFilterFn, this);
					columns.each(function(column) {
						if (column.isRequired && !usedColumns[column.name]) {
							var columnCaption = column.getPropertyValue("caption");
							var columnCaptionValue = columnCaption.getValue();
							notUsedRequiredColumns.push(columnCaptionValue);
						}
					}, this);
					if (Ext.isEmpty(notUsedRequiredColumns)) {
						callback.call(scope, true);
						return;
					}
					this.showConfirmationDialog(
						Ext.String.format(this.get("Resources.Strings.NotUsedRequiredFieldsMessage"),
							notUsedRequiredColumns.join("\n")),
						function(returnCode) {
							var result = returnCode === this.Terrasoft.MessageBoxButtons.OK.returnCode;
							callback.call(scope, result);
						}, [
							this.Terrasoft.MessageBoxButtons.OK.returnCode,
							this.Terrasoft.MessageBoxButtons.CANCEL.returnCode
						], null);
				},

				/**
				 * Валидирует модель представления в асинхронном режиме.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				asyncValidate: function(callback, scope) {
					var validationResult = true;
					var applyValidationResult = function(next, result) {
						validationResult = validationResult && result;
						if (validationResult) {
							next(validationResult);
						} else {
							callback.call(scope, validationResult);
						}
					};
					Terrasoft.chain(
						this.validateRequiredFields,
						applyValidationResult,
						function() {
							callback.call(scope, validationResult);
						},
						this);
				},

				/**
				 * Сохраняет измениния в схемах.
				 * @protected
				 * @virtual
				 */
				saveDesignData: function(callback, scope) {
					this.showBodyMask();
					var parentSchemaView = this.get("ParentSchemaView");
					var schemaView = this.get("SchemaView");
					this.applyGridLayoutEditItems(schemaView);
					var diff = Terrasoft.JsonDiffer.getJsonDiff(parentSchemaView, schemaView);
					var diffStr = JSON.stringify(diff, null, "\t");
					var instance = this.get("CurrentClientUnitSchema");
					instance.setSchemaDiff(diffStr);
					this.undefViewModelClass(instance);
					instance.define(function() {
						callback.call(scope);
						this.hideBodyMask();
					}, this);
				},

				/**
				 * Убирает информацию о созданном классе модели представления схемы.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.ClientUnitSchema} instance Экземпляр схемы.
				 */
				undefViewModelClass: function(instance) {
					var viewModelClassSuffix = "ViewModel";
					var modelNamespace = "Terrasoft.model";
					var globalNamespace = "Terrasoft";
					var schemaName = instance.getSchemaDefinitionName();
					var className =  schemaName + this.entitySchema.name + viewModelClassSuffix;
					var fullClassName = modelNamespace + "." + className;
					var alternateClassName = globalNamespace + "." + className;
					Ext.ClassManager.set(alternateClassName, null);
					Ext.ClassManager.set(fullClassName, null);
				},

				/**
				 * Обновляет переданную схему новыми элеметами сеток.
				 * @protected
				 * @virtual
				 * @param {Object} schemaView Схема представления.
				 */
				applyGridLayoutEditItems: function(schemaView) {
					var collections = this.getGridLayoutEditCollections();
					var gridLayoutCollectionsConfig = {};
					Terrasoft.each(collections, function(gridLayoutName) {
						var collectionName = this.getGridLayoutEditCollectionName(gridLayoutName);
						var gridLayoutItems = (gridLayoutCollectionsConfig[gridLayoutName] = []);
						var gridLayoutCollection = this.get(collectionName);
						if (!Ext.isEmpty(gridLayoutCollection)) {
							gridLayoutCollection.each(function(item) {
								gridLayoutItems.push(item.getConfigObject());
							}, this);
						}
					}, this);
					Terrasoft.iterateChildItems(schemaView, function(iterationConfig) {
						var schemaItem = iterationConfig.item;
						var schemaItemName = schemaItem.name;
						if (!Ext.isEmpty(gridLayoutCollectionsConfig[schemaItemName])) {
							schemaItem.items = gridLayoutCollectionsConfig[schemaItemName];
						}
					}, this);
				},

				/**
				 * @inheritdoc BasePageV2#loadDetail
				 * @overridden
				 */
				loadDetail: function() {},

				/**
				 * @inheritdoc BasePageV2#onRender
				 * @overridden
				 */
				onRender: function() {},

				/**
				 * Открывает окно настройки заголовка вкладок.
				 * @protected
				 * @virtual
				 */
				openTabSettingWindow: function() {
					var activeTabName = this.get("ActiveTabName");
					this.openCaptionConfigurationInputBox({
						name: activeTabName,
						caption: this.get("Resources.Strings.DesignerEditTabCaption")
					}, function(name, caption) {
						var resourceName = this.generateTabCaptionResourcesName(name);
						this.updateItemCaption(name, caption, resourceName);
						var tabsCollection = this.get("TabsCollection");
						var activeTab = tabsCollection.get(name);
						activeTab.set("Caption", caption);
					}, this);
				},

				/**
				 * Открывает окно настройки детали.
				 * @protected
				 * @virtual
				 */
				openDetailSettingWindow: function() {
					var tag = arguments[3];
					this.showInformationDialog("config detail:" + tag);
				},

				/**
				 * Удаляет деталь.
				 * @protected
				 * @virtual
				 */
				removeDetail: function() {
					var tag = arguments[3];
					var diff = [{
						"operation": "remove",
						"name": tag
					}];
					this.updateView(diff);
				},

				/**
				 * Генерирует название для ресурса заголовка группы.
				 * @protected
				 * @virtual
				 * @param {String} groupName Название группы.
				 * @return {String} Название ресурка заголовка группы.
				 */
				generateGroupCaptionResourcesName: function(groupName) {
					return groupName + "GroupCaption";
				},

				/**
				 * Генерирует название для ресурса заголовка вкладки.
				 * @protected
				 * @virtual
				 * @param {String} tabName Название вкладки.
				 * @return {String} Название ресурка заголовка группы.
				 */
				generateTabCaptionResourcesName: function(tabName) {
					return tabName + "TabCaption";
				},

				/**
				 * Возвращает полное название ресурка к которому привязанн заголовок элемента.
				 * @protected
				 * @virtual
				 * @param {String} itemName Название элемента.
				 * @return {String|null} Полное название ресурка заголовка элемента.
				 */
				getCaptionResourcesName: function(itemName) {
					var groupCaptionResourcesCache = this.get("CaptionResourcesCache");
					if (!groupCaptionResourcesCache) {
						groupCaptionResourcesCache = {};
						this.set("CaptionResourcesCache", groupCaptionResourcesCache);
					}
					if (groupCaptionResourcesCache[itemName]) {
						return groupCaptionResourcesCache[itemName];
					}
					var group = this.getSchemaViewItem(itemName);
					if (group && group.caption && group.caption.bindTo) {
						groupCaptionResourcesCache[itemName] = group.caption.bindTo;
						return group.caption.bindTo;
					}
					return null;
				},

				/**
				 * Находит элемент в схеме страницы.
				 * @protected
				 * @virtual
				 * @param {String} itemName Название элемента.
				 * @return {Object} Конфигурация элемента.
				 */
				getSchemaViewItem: function(itemName) {
					var schemaView = this.get("SchemaView");
					var result = null;
					Terrasoft.iterateChildItems(schemaView, function(iterationConfig) {
						var item = iterationConfig.item;
						var isItemFound = (item.name === itemName);
						if (!iterationConfig.childIterationResult || isItemFound) {
							if (isItemFound) {
								result = item;
							}
						}
						return (!isItemFound);
					}, this);
					return result;
				},

				/**
				 * Откравает модальное окно с полем ввода для заголовка объекта.
				 * @protected
				 * @virtual
				 * @param {Object} config Конфигурация модального окна.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				openCaptionConfigurationInputBox: function(config, callback, scope) {
					var captionResourcesName = this.getCaptionResourcesName(config.name);
					var caption = this.get(captionResourcesName);
					var controlConfig = {
						caption: {
							dataValueType: Terrasoft.DataValueType.TEXT,
							caption: this.get("Resources.Strings.DesignerEditTitleCaption"),
							value: caption
						}
					};
					Terrasoft.utils.inputBox(config.caption,
						function(buttonCode, controlData) {
							if (buttonCode === "SAVE") {
								callback.call(scope, config.name, controlData.caption.value);
							}
						}, [{
							className: "Terrasoft.Button",
							returnCode: "SAVE",
							style: Terrasoft.controls.ButtonEnums.style.GREEN,
							caption: this.get("Resources.Strings.DesignerSaveButtonCaption")
						}, Terrasoft.MessageBoxButtons.CANCEL],
						this,
						controlConfig,
						{defaultButton: 0}
					);
				},

				/**
				 * Открывает окно настройки группы.
				 * @protected
				 * @virtual
				 */
				openGroupSettingWindow: function() {
					var tag = arguments[3];
					this.openCaptionConfigurationInputBox({
						name: tag,
						caption: this.get("Resources.Strings.DesignerEditControlGroupCaption")
					}, function(name, caption) {
						var resourceName = this.generateGroupCaptionResourcesName(name);
						this.updateItemCaption(name, caption, resourceName);
					}, this);
				},

				/**
				 * Обновляет заголовок группы.
				 * @protected
				 * @virtual
				 * @param {String} itemName Название группы.
				 * @param {String} captionCaption Заловок группы.
				 * @param {String} defaultResourceItemCaption Заловок группы.
				 */
				updateItemCaption: function(itemName, captionCaption, defaultResourceItemCaption) {
					defaultResourceItemCaption = defaultResourceItemCaption || itemName;
					var modelStringResourceName = this.getCaptionResourcesName(itemName);
					var instance = this.get("CurrentClientUnitSchema");
					var localizableString = Ext.create("Terrasoft.LocalizableString");
					var diff = [];
					if (Ext.isEmpty(modelStringResourceName)) {
						modelStringResourceName = this.getModelStringResourceName(defaultResourceItemCaption);
						instance.localizableStrings.add(defaultResourceItemCaption, localizableString);
						diff.push({
							"operation": "merge",
							"name": itemName,
							"values": {
								"caption": {"bindTo": modelStringResourceName}
							}
						});
					} else {
						var bindTo = this.getSchemaResourceNameFromModelResourceName(modelStringResourceName);
						if (instance.localizableStrings.contains(bindTo)) {
							localizableString = instance.localizableStrings.get(bindTo);
						} else {
							instance.localizableStrings.add(bindTo, localizableString);
						}
					}
					this.set(modelStringResourceName, captionCaption || " ");
					localizableString.setValue(captionCaption);
					if (!Ext.isEmpty(diff)) {
						this.updateView(diff);
					}
				},

				/**
				 * Удаляет группу.
				 * @protected
				 * @virtual
				 */
				removeGroup: function() {
					var tag = arguments[3];
					var diff = [{
						"operation": "remove",
						"name": tag
					}];
					this.updateView(diff);
				},

				/**
				 * Генерирует имя параметра модели из имени строкового рессурса.
				 * @protected
				 * @virtual
				 * @param {String} resourceName Имя ресурса.
				 * @return {String} Имя параметра модели.
				 */
				getModelStringResourceName: function(resourceName) {
					return Ext.String.format("Resources.Strings.{0}", resourceName);
				},

				/**
				 * Генерирует имя имени строкового рессурса из параметра модели.
				 * @protected
				 * @virtual
				 * @param {String} resourceName Параметр модели.
				 * @return {String} Имя ресурса.
				 */
				getSchemaResourceNameFromModelResourceName: function(resourceName) {
					var resourceReqexp = /^Resources\.Strings\.(.*?)$/;
					var result = resourceReqexp.exec(resourceName);
					return result.length > 1 ? result[1] : null;
				},

				/**
				 * Генерирует уникальоное имя.
				 * @protected
				 * @virtual
				 * @param {String} prefix Префикс имени.
				 * @return {String} Уникальоное имя.
				 */
				getUniqueItemName: function(prefix) {
					var guid = Terrasoft.generateGUID();
					return prefix + guid.substring(0, 8);
				},

				/**
				 * Добавляет группу в выбранную вкладку.
				 * @protected
				 * @virtual
				 */
				addGroup: function() {
					var tag = arguments[3];
					var itemsCollection = Ext.create("Terrasoft.BaseViewModelCollection");
					var groupName = this.getUniqueItemName(tag + "Group");
					var gridLayoutName = this.getUniqueItemName(tag + "GridLayout");
					var gridLayout = this.get("GridLayouts");
					gridLayout.push(gridLayoutName);
					var itemsCollectionName = this.getGridLayoutEditCollectionName(gridLayoutName);
					this.set(itemsCollectionName, itemsCollection);
					this.addDraggableGroupName(gridLayoutName);
					var groupCaptionResourceName = this.generateGroupCaptionResourcesName(groupName);
					var instance = this.get("CurrentClientUnitSchema");
					instance.localizableStrings.add(groupCaptionResourceName, Ext.create("Terrasoft.LocalizableString"));
					this.set(groupCaptionResourceName, " ");
					var diff = [{
						"operation": "insert",
						"parentName": tag,
						"name": groupName,
						"propertyName": "items",
						"values": {
							"caption": {bindTo: this.getModelStringResourceName(groupCaptionResourceName)},
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": []
						}
					}, {
						"operation": "insert",
						"parentName": groupName,
						"propertyName": "items",
						"name": gridLayoutName,
						"values": {
							"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
							"items": []
						}
					}];
					this.updateView(diff);
				},

				/**
				 * Открывает окно добавления детали.
				 * @protected
				 * @virtual
				 */
				addDetail: function() {
					var tag = arguments[0];
					this.showInformationDialog("add detail to:" + tag);
				},

				/**
				 * Открывает окно сортировки в выбранной вкладке.
				 * @protected
				 * @virtual
				 */
				sortCurrentTabItems: function() {
					var tag = arguments[3];
					this.showInformationDialog("sort items in:" + tag);
				},

				/**
				 * Обрабатывает нажатие на действие элемента сетки.
				 * @protected
				 * @virtual
				 * @param {String} actionName Название действия.
				 * @param {String} modelItemId Уникальный идентификатор элемента сетки.
				 * @param {String} layoutName Имя сетки.
				 */
				onItemActionClick: function(actionName, modelItemId, layoutName) {
					switch (actionName) {
						case "removeModelItem":
							this.removeModelItem(layoutName, modelItemId);
							break;
						case "openModelItemSettingWindow":
							this.openModelItemSettingWindow(layoutName, modelItemId);
							break;
					}
				},

				/**
				 * Возвращает параметры для модумя настройки поля.
				 * @protected
				 * @virtual
				 * @return {Object} Параметры для модумя настройки поля
				 */
				getConfigureModelItemModuleConfig: function() {
					return {schemaName: "SchemaModelItemDesigner"};
				},

				/**
				 * Возвращает параметры для схемы настройки поля.
				 * @protected
				 * @virtual
				 * @return {Object} Параметры для схемы настройки поля
				 */
				getConfigureModelItemColumnConfig: function() {
					return this.get("ActionLayoutItem");
				},

				/**
				 * Обрабатывает резильтат работы модуля настройки поля.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.GridLayoutEditItemModel} item Настраиваемый элемент.
				 */
				onConfigureModelItemResult: function(item) {
					if (this.get("ActionLayoutCreate")) {
						var layoutName = this.get("ActionLayoutName");
						this.addModelItem(layoutName, item);
						var currentEntitySchema = this.get("CurrentEntitySchema");
						var column = item.column;
						currentEntitySchema.addColumn(column);
						var collection = this.Ext.create("Terrasoft.Collection");
						collection.add(column.uId, column);
						var draggableItemsCollection = this.get("ExistingModelDraggableItems");
						var usedColumns = this.get("UsedColumns");
						usedColumns[column.name] = 1;
						this.loadColumnsCollection(draggableItemsCollection, collection);
					}
				},

				/**
				 * Генерирует массив названий колонок для текущей сущности.
				 * @protected
				 * @virtual
				 * @return {String[]} Массив названий колонок для текущей сущности.
				 */
				getSchemaColumnsNames: function() {
					var instance = this.get("CurrentEntitySchema");
					var columnsNames = [];
					var columns = instance.columns;
					columns = columns.filterByFn(this.columnsFilterFn, this);
					columns.each(function(column) {
						columnsNames.push(column.getPropertyValue("name"));
					}, this);
					return columnsNames;
				},

				/**
				 * Генерирует идентификатор модуля настройки поля.
				 * @protected
				 * @virtual
				 * @return {String} Идентификатор модуля настройки поля.
				 */
				getConfigureModelItemModuleId: function() {
					return this.sandbox.id + "_ModelItemConfigModule";
				},

				/**
				 * Генерирует параметры отображения дизайнера колонки.
				 * @protected
				 * @virtual
				 * @return {Object} Параметры отображения дизайнера колонки.
				 */
				getDesignerDisplayConfig: function() {
					return {
						isNewColumn: this.get("ActionLayoutCreate")
					};
				},

				/**
				 * Загружает модуль настройки поля.
				 * @protected
				 * @virtual
				 */
				openConfigureModuelItemModule: function() {
					this.showBodyMask();
					var moduleId = this.getConfigureModelItemModuleId();
					this.sandbox.loadModule("ModalBoxSchemaModule", {id: moduleId});
				},

				/**
				 * Открывает окно настройки элемента сетки.
				 * @protected
				 * @virtual
				 * @param {String} layoutName Коллекция элементов сетки.
				 * @param {String} modelItemId Уникальный идентификатор элемента сетки.
				 */
				openModelItemSettingWindow: function(layoutName, modelItemId) {
					var collectionName = this.getGridLayoutEditCollectionName(layoutName);
					var collection = this.get(collectionName);
					var item = collection.get(modelItemId);
					this.set("ActionLayoutName", layoutName);
					this.set("ActionLayoutItem", item);
					this.set("ActionLayoutCreate", false);
					this.openConfigureModuelItemModule();
				},

				/**
				 * Удаляет элемент сетки.
				 * @protected
				 * @virtual
				 * @param {String} layoutName Коллекция элементов сетки.
				 * @param {String} modelItemId Уникальный идентификатор элемента сетки.
				 */
				removeModelItem: function(layoutName, modelItemId) {
					var collectionName = this.getGridLayoutEditCollectionName(layoutName);
					var collection = this.get(collectionName);
					var modelItem = collection.get(modelItemId);
					var itemConfig = modelItem.itemConfig;
					var bindTo = itemConfig.bindTo || itemConfig.name;
					var usedColumns = this.get("UsedColumns");
					if (!usedColumns[bindTo] || !(--usedColumns[bindTo])) {
						var existingModelDraggableItems = this.get("ExistingModelDraggableItems");
						var column = modelItem.column;
						var columnUId = column.getPropertyValue("uId");
						var existingModelDraggableItem = existingModelDraggableItems.get(columnUId);
						existingModelDraggableItem.set("ItemUsed", false);
					}
					collection.removeByKey(modelItemId);
				},

				/**
				 * Добавляет элемент в сетку.
				 * @protected
				 * @virtual
				 * @param {String} layoutName Коллекция элементов сетки.
				 * @param {Terrasoft.GridLayoutEditItemModel} item Конфигурация элемента сетки.
				 */
				addModelItem: function(layoutName, item) {
					var currentSelection = this.get(layoutName + "Selection");
					var currentCollectionName = this.getGridLayoutEditCollectionName(layoutName);
					var currentCollection = this.get(currentCollectionName);
					var itemConfig = Terrasoft.deepClone(item.itemConfig);
					Ext.apply(itemConfig.layout, currentSelection);
					itemConfig.bindTo = itemConfig.name;
					var newItemName = (itemConfig.name += Terrasoft.generateGUID());
					var newItemConfig = {
						itemConfig: itemConfig,
						column: item.column
					};
					var usedColumns = this.get("UsedColumns");
					if (Ext.isEmpty(usedColumns[itemConfig.bindTo])) {
						usedColumns[itemConfig.bindTo] = 1;
					} else {
						usedColumns[itemConfig.bindTo]++;
					}
					var newItem = this.Ext.create("Terrasoft.GridLayoutEditItemModel", newItemConfig);
					currentCollection.add(newItemName, newItem);
				},

				/**
				 * Возвращает обратное пришедшему значение.
				 * @param {boolean} value Значение.
				 * @return {boolean} Обратное значение.
				 */
				invertBooleanValue: function(value) {
					return !value;
				}

			},
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "DesignContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["design-container-wrapClass"],
						"items": []
					}
				}, {
					"operation": "insert",
					"name": "DesignedView",
					"parentName": "DesignContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.DESIGN_VIEW,
						"items": []
					}
				}, {
					"operation": "move",
					"name": "CardContentContainer",
					"parentName": "DesignedView",
					"propertyName": "items",
					"index": 0
				}, {
					"operation": "insert",
					"name": "DraggableItemsContainer",
					"parentName": "DesignContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {wrapClassName: ["draggable-items-list", "fixed"]},
						"items": []
					}
				}, {
					"operation": "insert",
					"name": "NewFieldsControlGroup",
					"parentName": "DraggableItemsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.NewFieldsControlGroupCaption"},
						"items": []
					}
				}, {
					"operation": "insert",
					"name": "ExistingFieldsControlGroup",
					"parentName": "DraggableItemsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"caption": {"bindTo": "Resources.Strings.ExistingFieldsControlGroupCaption"},
						"items": []
					}
				}, {
					"operation": "insert",
					"name": "ExistingModelDraggableItems",
					"parentName": "ExistingFieldsControlGroup",
					"propertyName": "items",
					"values": {
						"idProperty": "itemId",
						"collection": {"bindTo": "ExistingModelDraggableItems"},
						"generator": "ContainerListGenerator.generatePartial",
						"itemType": Terrasoft.ViewItemType.GRID,
						"itemConfig": [{
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"name": "ExistingModelItemContainer",
							"className": "Terrasoft.ViewModelSchemaDesignerItem",
							"draggableGroupNames": {"bindTo": "draggableGroupNames"},
							"invalidDrop": {bindTo: "onInvalidDrop"},
							"dragOver": {bindTo: "onDragOver"},
							"dragDrop": {bindTo: "onDragDrop"},
							"content": {bindTo: "content"},
							"imageConfig": {"bindTo": "getImageConfig"},
							"isUsed": {"bindTo": "ItemUsed"},
							"isRequired": {"bindTo": "IsRequired"}
						}]
					}
				}, {
					"operation": "insert",
					"name": "NewModelDraggableItems",
					"parentName": "NewFieldsControlGroup",
					"propertyName": "items",
					"values": {
						"idProperty": "itemId",
						"collection": {"bindTo": "NewModelDraggableItems"},
						"generator": "ContainerListGenerator.generatePartial",
						"itemType": Terrasoft.ViewItemType.GRID,
						"visible": {
							bindTo: "CanAddNewColumn"
						},
						"itemConfig": [{
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"name": "NewModelItemContainer",
							"classes": {wrapClassName: ["draggable-item"]},
							"className": "Terrasoft.ViewModelSchemaDesignerItem",
							"draggableGroupNames": {"bindTo": "draggableGroupNames"},
							"invalidDrop": {bindTo: "onInvalidDrop"},
							"dragOver": {bindTo: "onDragOver"},
							"dragDrop": {bindTo: "onDragDrop"},
							"imageConfig": {"bindTo": "getImageConfig"},
							"content": {"bindTo": "content"},
							"isUsed": {"bindTo": "ItemUsed"}
						}]
					}
				}, {
					"operation": "insert",
					"name": "NewColumnsInfoContainer",
					"parentName": "NewFieldsControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"visible": {
							bindTo: "CanAddNewColumn",
							bindConfig: {
								converter: "invertBooleanValue"
							}
						},
						"items": []
					}
				}, {
					"operation": "insert",
					"name": "NewColumnsInfoButton",
					"parentName": "NewColumnsInfoContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.InfoSpriteImage"},
						"classes": {
							"wrapperClass": "info-button",
							"imageClass": "info-button-image"
						},
						"showTooltip": true,
						"tooltipText": {"bindTo": "Resources.Strings.NewFieldsDisabledToolTipMessage"}
					}
				}, {
					"operation": "insert",
					"name": "NewColumnsInfoLabel",
					"parentName": "NewColumnsInfoContainer",
					"propertyName": "items",
					"values": {
						"labelClass": ["new-fields-info-label"],
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {"bindTo": "Resources.Strings.NewFieldsDisabledMessage"}
					}
				}
			]/**SCHEMA_DIFF*/,
			infoDiff: [
				{
					"operation": "insert",
					"name": "errorInfoContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["designer-info-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "errorInfoImage",
					"parentName": "errorInfoContainer",
					"propertyName": "items",
					"values": {
						"className": "Terrasoft.ImageEdit",
						"readonly": true,
						"classes": {
							"wrapClass": ["image-control"]
						},
						"onPhotoChange": "emptyFn",
						"getSrcMethod": "EmptyInfoImageSrc",
						"generator": "ImageCustomGeneratorV2.generateSimpleCustomImage"
					}
				},
				{
					"operation": "insert",
					"name": "titleInfoLabel",
					"parentName": "errorInfoContainer",
					"propertyName": "items",
					"values": {
						"classes": {"labelClass": ["title"]},
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {bindTo: "Resources.Strings.DesignerErrorInfoTitleMessage"}
					}
				},
				{
					"operation": "insert",
					"name": "descriptionInfoLabel",
					"parentName": "errorInfoContainer",
					"propertyName": "items",
					"values": {
						"classes": {"labelClass": ["description"]},
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {bindTo: "Resources.Strings.DesignerErrorInfoDescriptionMessage"}
					}
				}
			]
		};
	});
