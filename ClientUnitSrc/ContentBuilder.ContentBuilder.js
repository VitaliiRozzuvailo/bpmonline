define("ContentBuilder", ["ModalBox", "MacrosModule", "ContainerListGenerator", "ContainerList",
	"ContentPreviewBlock", "ContentBuilderHelper", "css!ContentBuilderCSS"],
function(ModalBox) {
	return {
		attributes: {

			/**
			 * Ширина холста в пикселях.
			 */
			Width: {
				dataValueType: Terrasoft.DataValueType.INTEGER,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: 750,
				dependencies: [{
					columns: ["ContentSheetWidth"],
					methodName: "onContentSheetWidthChanged"
				}]
			},

			/**
			 * Значение ширины в поле ввода.
			 */
			ContentSheetWidth: {
				dataValueType: Terrasoft.DataValueType.INTEGER,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: 750
			},

			/**
			 * Цвет холста.
			 */
			BackgroundColor: {
				dataValueType: Terrasoft.DataValueType.STRING,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				value: "#ffffff"
			},

			/**
			 * Идентификатор контента.
			 */
			Id: {
				dataValueType: Terrasoft.DataValueType.TEXT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},

			/**
			 * Заголовок дизайнера контента.
			 */
			Caption: {
				dataValueType: Terrasoft.DataValueType.TEXT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},

			/**
			 * Коллекция моделей представления блоков.
			 */
			Items: {
				dataValueType: Terrasoft.core.enums.DataValueType.COLLECTION,
				type: Terrasoft.core.enums.ViewModelColumnType.VIRTUAL_COLUMN
			},

			/**
			 * Коллекция блоков предпросмотра.
			 */
			PreviewItems: {
				dataValueType: Terrasoft.DataValueType.COLLECTION,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},

			/**
			 * Предустановленный конфигурацилонный объект блоков.
			 */
			ExistingItemsConfig: {
				dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
				type: Terrasoft.core.enums.ViewModelColumnType.VIRTUAL_COLUMN
			},

			/**
			 * Индекс элемента на холсте.
			 */
			ReorderableIndex: {
				dataValueType: Terrasoft.core.enums.DataValueType.INTEGER,
				type: Terrasoft.core.enums.ViewModelColumnType.VIRTUAL_COLUMN
			},

			/**
			 * Признак выделености холста.
			 */
			ContentSheetSelected: {
				dataValueType: Terrasoft.core.enums.DataValueType.BOOLEAN,
				type: Terrasoft.core.enums.ViewModelColumnType.VIRTUAL_COLUMN
			},

			/**
			 * Флаг загрузки списка блоков предпросмотра.
			 */
			"IsPreviewItemsLoading": {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			/**
			 * Флаг загрузки холста.
			 */
			"IsSheetContainerLoading": {dataValueType: Terrasoft.DataValueType.BOOLEAN}

		},
		messages: {
			/**
			 * Подписка на получение выбранного макроса.
			 */
			"MacroSelected": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		methods: {

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @overridden
			 */
			init: function() {
				var previewBlocks = this.Ext.create("Terrasoft.BaseViewModelCollection");
				previewBlocks.on("itemChanged", this.previewItemChanged, this);
				var items = this.Ext.create("Terrasoft.BaseViewModelCollection");
				this.subscribeForItemsCollectionEvents(items);
				this.set("Items", items);
				this.set("PreviewItems", previewBlocks);
				this.callParent(arguments);
				this.loadPreviewBlocks();
				this.initializeSheet();
				this.subscribeMessages();
				this.showBodyMask();
			},

			/**
			 * Генерирует запрос для блоков предпросмотра.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.EntitySchemaQuery} Запрос для блоков предпросмотра.
			 */
			getBlocksEntitySchemaQuery: function() {
				var entitySchemaQuery = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "ContentBlock"
				});
				entitySchemaQuery.addColumn("Id");
				var nameColumn = entitySchemaQuery.addColumn("Name", "Caption");
				nameColumn.orderPosition = 0;
				nameColumn.orderDirection = Terrasoft.OrderDirection.ASC;
				entitySchemaQuery.addColumn("Config", "BlockConfig");
				entitySchemaQuery.addColumn("Image");
				return entitySchemaQuery;
			},

			/**
			 * Загружает коллекцию блоков контента, инициализирует ею колленцию блоков предпросмотра.
			 * @protected
			 * @virtual
			 */
			loadPreviewBlocks: function() {
				this.set("IsPreviewItemsLoading", true);
				var entitySchemaQuery = this.getBlocksEntitySchemaQuery();
				entitySchemaQuery.getEntityCollection(function(response) {
					if (response.success) {
						var collection = response.collection;
						this.onPreviewBlocksLoaded(collection);
					}
				}, this);
			},

			/**
			 * Инициализирует коллекцию блоков предпросмотра.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.Collection} previewBlocksCollection Коллекция блоков дизайнера контента.
			 */
			onPreviewBlocksLoaded: function(previewBlocksCollection) {
				this.set("IsPreviewItemsLoading", false);
				var previewBlocks = this.get("PreviewItems");
				previewBlocks.clear();
				var contentBuilderHelper = Ext.create("Terrasoft.ContentBuilderHelper");
				previewBlocksCollection.each(function(previewBlockItem) {
					var serializedBlockConfig = previewBlockItem.get("BlockConfig");
					var blockConfig = (serializedBlockConfig && Terrasoft.decode(serializedBlockConfig)) || {};
					var block = contentBuilderHelper.toViewModel(blockConfig);
					var id = block.get("Id");
					var caption = previewBlockItem.get("Caption");
					var imageConfig = this.get("Resources.Images.DefaultBlockImage");
					var sysImage = previewBlockItem.get("Image");
					if (!Ext.isEmpty(sysImage)) {
						imageConfig = {
							source: Terrasoft.ImageSources.SYS_IMAGE,
							params: {primaryColumnValue: sysImage.value}
						};
					}
					block.sandbox = this.sandbox;
					block.set("Caption", caption);
					block.set("Tag", id);
					block.set("ImageConfig", imageConfig);
					previewBlocks.add(id, block);
				}, this);
			},

			/**
			 * Инициализирует холст.
			 * @protected
			 * @virtual
			 */
			initializeSheet: function() {
				this.set("IsSheetContainerLoading", true);
				this.getContentSheetConfig(this.loadContentSheetConfig, this);
			},

			/**
			 * Инициализирует модель представления конфигурацией холста.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурационный объект холста.
			 */
			loadContentSheetConfig: function(config) {
				this.set("IsSheetContainerLoading", false);
				var contentBuilderHelper = Ext.create("Terrasoft.ContentBuilderHelper");
				config = Ext.apply({}, config, {
					Width: this.get("Width"),
					BackgroundColor: this.get("BackgroundColor")
				});
				var sheetConfig = contentBuilderHelper.toViewModel(config);
				Terrasoft.each(sheetConfig, function(parameterValue, parameterName) {
					if (parameterName === "Caption") {
						parameterValue = parameterValue || this.get("Resources.Strings.DefaultCaption");
					}
					if (parameterName === "Items") {
						var items = this.get("Items");
						items.clear();
						items.loadAll(parameterValue);
						return;
					}
					if (parameterName === "Width") {
						this.set("ContentSheetWidth", parameterValue);
					}
					this.set(parameterName, parameterValue);
				}, this);
			},

			/**
			 * Подписывается на события коллекции блоков контента.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.BaseViewModelCollection} items Коллекция блоков контента.
			 */
			subscribeForItemsCollectionEvents: function(items) {
				items.on("itemChanged", this.itemChanged, this);
				items.on("add", this.onContentBlockAdd, this);
				items.on("remove", this.onContentBlockRemove, this);
				items.on("dataloaded", this.onDataLoaded, this);
				items.on("clear", this.onClear, this);
			},

			/**
			 * Подписывается на сообщения.
			 * @protected
			 * @virtual
			 */
			subscribeMessages: function() {
				var macrosModuleId = this.getMacrosModuleId();
				this.sandbox.subscribe("MacroSelected", this.onGetMacros, this, [macrosModuleId]);
			},

			/**
			 * Генерирует уникальный идентификатор модуля выбора макроса.
			 * @protected
			 * @virtual
			 * @return {String} Уникальный идентификатор модуля выбора макроса.
			 */
			getMacrosModuleId: function() {
				return this.sandbox.id + "_MacrosModule";
			},

			/**
			 * Обрабатывает получение макросов.
			 * @protected
			 * @virtual
			 * @param {String} macros Макрос.
			 */
			onGetMacros: function(macros) {
				var blocks = this.get("Items");
				var selectedBlock = this.getSelectedItem(blocks);
				var elements = selectedBlock.get("Items");
				var selectedElemet = this.getSelectedItem(elements);
				selectedElemet.set("SelectedText", macros);
			},

			/**
			 * Возвращает элемент с признаком Selected.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.Collection} items Коллекция элементов.
			 */
			getSelectedItem: function(items) {
				var result = null;
				items.each(function(item) {
					if (item.get("Selected") === true) {
						result = item;
						return false;
					}
				}, this);
				return result;
			},

			/**
			 * Обработчик события 'itemChanged' коллекции Terrasoft.Collection.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.BaseViewModel} item Элемент коллекции, в котором произошли изменения.
			 * @param {Object} config Параметры события.
			 */
			itemChanged: function(item, config) {
				if (config.event) {
					switch (config.event) {
						case "ondragover":
							this.onItemDragOver.apply(this, config.arguments);
							break;
						case "ondragdrop":
							this.onItemDragDrop.apply(this, config.arguments);
							break;
						case "oninvaliddrop":
							this.onItemInvalidDrop.apply(this, config.arguments);
							break;
						case "oncopy":
							this.onItemCopy(config.arguments);
							break;
						case "onremove":
							var itemConfig = config.arguments;
							var id = itemConfig.Id;
							this.onItemRemove(id);
							break;
						case "onselected":
							this.onItemSelected(config.arguments);
							break;
						case "macrobuttonclicked":
							this.openMacrosPage();
							break;
						case "selectedtextchanged":
							var selectedText = config.arguments[0];
							this.set("SelectedText", selectedText);
							break;
					}
				}
			},

			/**
			 * Открывает страницу макросов.
			 * @protected
			 * @virtual
			 */
			openMacrosPage: function() {
				var config = {
					heightPixels: 420,
					widthPixels: 450,
					boxClasses: ["macros-page-modal-box"]
				};
				var moduleId = this.getMacrosModuleId();
				var renderTo = ModalBox.show(config, function() {
					this.sandbox.unloadModule(moduleId, renderTo);
				}.bind(this));
				this.sandbox.loadModule("MacrosModule", {
					id: moduleId,
					renderTo: renderTo
				});

			},

			/**
			 * Обрабвтывает изменения блока предпросмотра.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.BaseViewModel} item Измененный элемент.
			 * @param {Object} config Конфигурация изменения.
			 * @param {String} config.event Название действия изменения.
			 * @param {String} config.arguments Аргументы действия изменения.
			 */
			previewItemChanged: function(item, config) {
				if (config.event) {
					switch (config.event) {
						case "ondragover":
							this.onPreviewDragOver.apply(this, config.arguments);
							break;
						case "ondragdrop":
							this.onPreviewDragDrop.apply(this, config.arguments);
							break;
						case "oninvaliddrop":
							this.onPreviewInvalidDrop.apply(this, config.arguments);
							break;
					}
				}
			},

			/**
			 * Получение позиции элемента в контейнере.
			 * @protected
			 * @virtual
			 * @param {String} key Ключ искомого элемента.
			 * @return {Number} позиции элемента в контейнере.
			 */
			indexOf: function(key) {
				var viewModelItems = this.get("Items");
				var viewModelItemsKeys = viewModelItems.getKeys();
				return viewModelItemsKeys.indexOf(key);
			},

			/**
			 * Добавляет элемент в коллекцию.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.BaseViewModel} viewModelItem Модель представления элемента.
			 * @return {Boolean} Результат операции.
			 */
			addItem: function(viewModelItem) {
				var viewModelItemId = viewModelItem.get("Id");
				var viewModelItems = this.get("Items");
				var itemIndex = this.indexOf(viewModelItemId);
				var reorderableIndex = this.get("ReorderableIndex");
				if (!Ext.isEmpty(reorderableIndex)) {
					viewModelItems.removeByKey(viewModelItemId);
					if (itemIndex === -1 || (reorderableIndex <= itemIndex)) {
						reorderableIndex += 1;
					}
					viewModelItems.insert(reorderableIndex, viewModelItemId, viewModelItem);
				} else if (itemIndex === -1) {
					viewModelItems.add(viewModelItemId, viewModelItem);
				} else {
					return false;
				}
				this.set("ReorderableIndex", null);
				return true;
			},

			/**
			 * Обрабатывает события перетаскивания элемента предпросмотра над зоной вставки.
			 * @protected
			 * @virtual
			 * @param {String} overItemTag Тэг элемента над которым происходит перетаскивание.
			 */
			onPreviewDragOver: function(overItemTag) {
				this.onItemDragOver(overItemTag);
			},

			/**
			 * Обрабатывает события невалидного перетаскивания элемента предпросмотра.
			 * @protected
			 * @param {String} overItemTag Тэг элемента вставки.
			 */
			onPreviewInvalidDrop: function(overItemTag) {
				this.onItemInvalidDrop(overItemTag);
			},

			/**
			 * Обрабатывает события вставки элемента предпросмотра.
			 * @protected
			 * @param {String} tag Тэг элемента вставки.
			 */
			onPreviewDragDrop: function(tag) {
				var previewItems = this.get("PreviewItems");
				var block = previewItems.get(tag);
				var elementClone = this.cloneContentElement(block);
				this.addItem(elementClone);
			},

			/**
			 * Обрабатывает события невалидного перетаскивания блока.
			 * @protected
			 * @param {String} tag Тэг элемента вставки.
			 */
			onItemInvalidDrop: function() {
				this.set("ReorderableIndex", null);
			},

			/**
			 * Обрабатывает события перетаскивания блока над зоной вставки.
			 * @protected
			 * @param {String} overItemTag Тэг элемента над которым происходит перетаскивание.
			 */
			onItemDragOver: function(overItemTag) {
				this.set("ReorderableIndex", null);
				var indexOf = this.indexOf(overItemTag);
				this.set("ReorderableIndex", indexOf);
			},

			/**
			 * Обрабатывает события вставки блока.
			 * @protected
			 * @virtual
			 * @param {String} itemId Идентификатор элемента.
			 */
			onItemDragDrop: function(itemId) {
				var viewModelItems = this.get("Items");
				var viewModelItem = viewModelItems.get(itemId);
				this.addItem(viewModelItem);
			},

			/**
			 * Создает копию элемента контента.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.BaseViewModel} viewModel Модель элемента контента.
			 * @return {Terrasoft.BaseViewModel} Копия модель элемента контента.
			 */
			cloneContentElement: function(viewModel) {
				var contentBuilderHelper = Ext.create("Terrasoft.ContentBuilderHelper");
				var config = contentBuilderHelper.toJSON(viewModel);
				return contentBuilderHelper.toViewModel(config);
			},

			/**
			 * Обрабатывает события выделенности дочернего элемента.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурационный объект.
			 */
			onItemSelected: function(config) {
				if (!config.value) {
					return;
				}
				var itemId = config.Id;
				var collection = this.get("Items");
				collection.each(function(contentItem) {
					if (contentItem.get("Id") !== itemId) {
						contentItem.set("Selected", false);
					}
				}, this);
				this.set("ContentSheetSelected", false);
			},

			/**
			 * Обрабатывает события копирования блока.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурационный объект.
			 */
			onItemCopy: function(config) {
				var id = config.Id;
				var contentBlocks = this.get("Items");
				var block = contentBlocks.get(id);
				var sourceBlockIndex = contentBlocks.indexOf(block);
				var elementClone = this.cloneContentElement(block);
				var cloneId = elementClone.get("Id");
				contentBlocks.insert(sourceBlockIndex, cloneId, elementClone);
			},

			/**
			 * Обрабатывает события удаления блока.
			 * @protected
			 * @virtual
			 * @param {Object} id Конфигурационный объект.
			 */
			onItemRemove: function(id) {
				var blocksCollection = this.get("Items");
				blocksCollection.removeByKey(id);
			},

			/**
			 * Обрабатывает события клика кнопки настройки холста.
			 * @protected
			 */
			onContentSheetSettingButtonClick: function() {
				var collection = this.get("Items");
				collection.each(function(contentItem) {
					contentItem.set("Selected", false);
				}, this);
				var isSelected = !this.get("ContentSheetSelected");
				this.set("ContentSheetSelected", isSelected);
			},

			/**
			 * @inheritdoc BaseSchemaViewModel#onRender
			 * @overridden
			 */
			onRender: function() {
				this.callParent(arguments);
				this.hideBodyMask();
			},

			/**
			 * Метод выполняет сохранение дизайнера контента.
			 * @protected
			 * @virtual
			 */
			save: function() {},

			/**
			 * Обрабативает сохранения дизайнера контента.
			 * @protected
			 * @virtual
			 */
			onSaved: Terrasoft.emptyFn,

			/**
			 * Метод отмены изменений дизайнера контента.
			 * @protected
			 * @virtual
			 */
			cancel: function() {
				Terrasoft.utils.showMessage({
					caption: this.get("Resources.Strings.CancelMessage"),
					buttons: ["Ok", "Cancel"],
					defaultButton: 0
				});
			},

			/**
			 * Обработчик добавления блока.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.ContentBlockViewModel} contentBlock Добавляемый блок
			 */
			onContentBlockAdd: Terrasoft.emptyFn,

			/**
			 * Обработчик удаления блока.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.ContentBlockViewModel} contentBlock Удаляемый блок
			 */
			onContentBlockRemove: Terrasoft.emptyFn,

			/**
			 * Обработчик агрузки данных в коллекцию.
			 * @protected
			 * @virtual
			 */
			onDataLoaded: Terrasoft.emptyFn,

			/**
			 * Обработчик очищения коллекции.
			 * @protected
			 * @virtual
			 */
			onClear: Terrasoft.emptyFn,

			/**
			 * Вызывает валидацию значения ширины в поле ввода и, если валидация прошла,
			 * устанавливает ширину холста равной этому значению.
			 * @protected
			 */
			onContentSheetWidthChanged: function() {
				var columnName = "ContentSheetWidth";
				if (this.validateColumn(columnName)) {
					var width = this.get(columnName);
					this.set("Width", width);
				}
			},

			/**
			 * Валидирует введенное значение ширины и, если валидация прошла, устанавливает
			 * ширину холста.
			 * @protected
			 * @param {Number} value Ширина холста.
			 * @return {Object} Результат валидации.
			 */
			widthRangeValidator: function(value) {
				var invalidMessage = "";
				var minMessage = this.get("Resources.Strings.WidthIncorrectMinValueValidationMessage");
				var maxMessage = this.get("Resources.Strings.WidthIncorrectMaxValueValidationMessage");
				var minValue = 300;
				var maxValue = 3000;
				if (value > maxValue) {
					invalidMessage = this.Ext.String.format(maxMessage, maxValue);
				} else if (value < minValue) {
					invalidMessage = this.Ext.String.format(minMessage, minValue);
				}
				return {
					fullInvalidMessage: invalidMessage,
					invalidMessage: invalidMessage
				};
			},

			/**
			 * @inheritDoc BasePageV2#setValidationConfig
			 * @overridden
			 */
			setValidationConfig: function() {
				this.callParent(arguments);
				this.addColumnValidator("ContentSheetWidth", this.widthRangeValidator);
			},

			/**
			 * Возвращает массив конфигурационных объектов блоков предпросмотра.
			 * @protected
			 * @virtual
			 * @return {Array} Массив конфигурационных объектов блоков предпросмотра
			 */
			getContentSheetConfig: function(callback, scope) {
				var config = {
					ItemType: "sheet",
					Items: []
				};
				callback.call(scope, config);
			},

			/**
			 * Загружает модуль предпросмотра.
			 * @protected
			 * @virtual
			 */
			openPreviewModule: function() {
				var contentBuilderHelper = Ext.create("Terrasoft.ContentBuilderHelper");
				var emailContentExporter = Ext.create("Terrasoft.EmailContentExporter");
				var config = contentBuilderHelper.toJSON(this);
				var html = emailContentExporter.exportData(config);
				var previewWindow = window.open("", "printwin");
				previewWindow.document.write(html);
				previewWindow.document.close();
			},

			/**
			 * Генерирует идентификатор модуля предпросмотра.
			 * @protected
			 * @virtual
			 * @return {String} Идентификатор модуля предпросмотра.
			 */
			getPreviewModuleId: function() {
				return this.sandbox.id + "_ContentBuilderPreviewModule";
			}

		},
		diff: [
			{
				"operation": "insert",
				"name": "MainContainer",
				"values": {
					"classes": {
						"textClass": "center-panel",
						"wrapClassName": ["content-builder-container"]
					},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "LeftControlGroup",
				"parentName": "MainContainer",
				"propertyName": "items",
				"values": {
					"classes": {
						"wrapClass": ["left-control-group", "fixed"]
					},
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"caption": {"bindTo": "Resources.Strings.PreviewBlockCaption"},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "FilterContainer",
				"parentName": "LeftControlGroup",
				"propertyName": "items",
				"values": {
					"classes": {
						"textClassName": "filter-container"
					},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "ContentBuilderPreviewContainer",
				"parentName": "LeftControlGroup",
				"propertyName": "items",
				"values": {
					"idProperty": "Id",
					"collection": {"bindTo": "PreviewItems"},
					"generator": "ContainerListGenerator.generatePartial",
					"maskVisible": {"bindTo": "IsPreviewItemsLoading"},
					"itemType": Terrasoft.ViewItemType.GRID,
					"classes": {wrapClassName: ["content-preview-block-container"]},
					"itemConfig": [{
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"name": "ContentPreviewBlock",
						"className": "Terrasoft.ContentPreviewBlock",
						"dragOver": {bindTo: "onDragOver"},
						"dragDrop": {bindTo: "onDragDrop"},
						"invalidDrop": {bindTo: "onInvalidDrop"},
						"caption": {bindTo: "Caption"},
						"tag": {bindTo: "Tag"},
						"imageConfig": {bindTo: "ImageConfig"},
						"draggableGroupName": ["ContentBlank"]
					}]
				}
			},
			{
				"operation": "insert",
				"name": "RightContainer",
				"parentName": "MainContainer",
				"propertyName": "items",
				"values": {
					"classes": {wrapClassName: ["right-container"]},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "HeaderContainer",
				"parentName": "RightContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {wrapClassName: ["header-container"]},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "FooterContainer",
				"parentName": "RightContainer",
				"propertyName": "items",
				"values": {
					"classes": {wrapClassName: ["footer-container"]},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "Caption",
				"parentName": "HeaderContainer",
				"propertyName": "items",
				"index": 0,
				"values": {
					"itemType": Terrasoft.ViewItemType.LABEL,
					"classes": {
						wrapClassName: ["caption-label"],
						labelClass: ["content-builder-caption-label"]
					},
					"caption": {bindTo: "Caption"}
				}
			},
			{
				"operation": "insert",
				"name": "LeftButtonContainer",
				"parentName": "HeaderContainer",
				"propertyName": "items",
				"values": {
					"classes": {wrapClassName: ["left-button-container"]},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "SaveButton",
				"parentName": "LeftButtonContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.SaveButtonCaption"},
					"classes": {
						"textClass": "actions-button-margin-right"
					},
					"click": {"bindTo": "save"},
					"style": Terrasoft.controls.ButtonEnums.style.GREEN
				}
			},
			{
				"operation": "insert",
				"name": "CancelButton",
				"parentName": "LeftButtonContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.CancelButtonCaption"},
					"classes": {
						"textClass": "actions-button-margin-right"
					},
					"click": {"bindTo": "cancel"}
				}
			},
			{
				"operation": "insert",
				"name": "PreviewButton",
				"parentName": "LeftButtonContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.PreviewButtonCaption"},
					"classes": {"textClass": "actions-button-margin-right"},
					"click": {"bindTo": "openPreviewModule"}
				}
			},
			{
				"operation": "insert",
				"name": "RightButtonContainer",
				"parentName": "HeaderContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {wrapClassName: ["right-button-container"]},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "SettingsContainer",
				"parentName": "RightButtonContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["content-builder-settings-container"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "ContentSheetWidth",
				"parentName": "SettingsContainer",
				"propertyName": "items",
				"values": {
					"labelConfig": {"visible": false},
					"visible": {"bindTo": "ContentSheetSelected"},
					"classes": {
						wrapClass: ["settings-width-button"]
					}
				}
			},
			{
				"operation": "insert",
				"name": "PxLabel",
				"parentName": "SettingsContainer",
				"propertyName": "items",
				"values": {
					"id": "pxLabel",
					"itemType": Terrasoft.ViewItemType.LABEL,
					"caption": {"bindTo": "Resources.Strings.PxLabelCaption"},
					"labelConfig": {
						"classes": ["pxLabel"]
					},
					"visible": {"bindTo": "ContentSheetSelected"}
				}
			},
			{
				"operation": "insert",
				"name": "SettingsColorButton",
				"parentName": "SettingsContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.COLOR_BUTTON,
					"value": {"bindTo": "BackgroundColor"},
					"visible": {"bindTo": "ContentSheetSelected"},
					"classes": {
						wrapClasses: ["settings-color-button"]
					}
				}
			},
			{
				"operation": "insert",
				"name": "SheetSettingsButton",
				"parentName": "SettingsContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"imageConfig": {"bindTo": "Resources.Images.SettingsButtonIcon"},
					"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"click": {"bindTo": "onContentSheetSettingButtonClick"},
					"classes": {
						wrapperClass: ["settings-button-control"]
					}
				}
			},
			{
				"operation": "insert",
				"name": "SheetContainer",
				"parentName": "FooterContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"className": "Terrasoft.ContentSheet",
					"classes": {
						"wrapClass": ["sheet-container"]
					},
					"maskVisible": {"bindTo": "IsSheetContainerLoading"},
					"viewModelItems": {bindTo: "Items"},
					"reorderableIndex": {bindTo: "ReorderableIndex"},
					"placeholder": {bindTo: "Resources.Strings.ContentSheetPlaceholder"},
					"width": {bindTo: "Width"},
					"backgroundColor": {bindTo: "BackgroundColor"},
					"selected": {bindTo: "ContentSheetSelected"},
					"getGroupName": function() {
						return "ContentBlank";
					},
					"tools": []
				}
			}
		]

	};
});
