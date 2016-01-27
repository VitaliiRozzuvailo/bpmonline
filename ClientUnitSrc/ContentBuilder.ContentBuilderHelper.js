define("ContentBuilderHelper", ["ContentBlockViewModel", "ContentTextElementViewModel", "ContentHTMLElementViewModel",
	"ContentImageElementViewModel"], function() {

	/**
	 * @class Terrasoft.ContentExporters.ContentBuilderHelper
	 * Класс дополнительной функциональности дизайнера контента.
	 */
	Ext.define("Terrasoft.ContentExporters.ContentBuilderHelper", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.ContentBuilderHelper",

		//region Properties: Protected

		/**
		 * Список параметров для настройки холста.
		 * @protected
		 * @virtual
		 * @type {String[]}
		 */
		sheetElementProperties: ["ItemType", "Caption", "Items", "Width", "BackgroundColor"],

		/**
		 * Список параметров для настройки блока.
		 * @protected
		 * @virtual
		 * @type {String[]}
		 */
		blockElementProperties: ["ItemType", "Items"],

		/**
		 * Список параметров для настройки изображения.
		 * @protected
		 * @virtual
		 * @type {String[]}
		 */
		imageElementProperties: ["ItemType", "Column", "Row", "ColSpan", "RowSpan", "GroupName", "Link", "ImageConfig"],

		/**
		 * Список параметров для настройки текста.
		 * @protected
		 * @virtual
		 * @type {String[]}
		 */
		textElementProperties: ["ItemType", "Column", "Row", "ColSpan", "RowSpan", "GroupName", "Content"],

		/**
		 * Список параметров для настройки html элемента.
		 * @protected
		 * @virtual
		 * @type {String[]}
		 */
		htmlElementProperties: ["ItemType", "Column", "Row", "ColSpan", "RowSpan", "GroupName", "Content"],

		//endregion

		//region Methods: Protected

		/**
		 * Создает объект из перечисленных параметров входящего объекта.
		 * @protected
		 * @virtual
		 * @param {Object} object Входящий объект.
		 * @param {Object} config Конфигурация действия.
		 * @param {String[]} config.expectedParameters Список копируемых параметров.
		 * @return {Object} Объект, состоящий из перечисленных параметров входящего объекта.
		 */
		sliceObject: function(object, config) {
			var expectedParameters = config.expectedParameters, result = {};
			Terrasoft.each(expectedParameters, function(parameterName) {
				result[parameterName] = object[parameterName];
			}, this);
			return result;
		},

		/**
		 * Создает объект из перечисленных параметров входящей модели.
		 * @protected
		 * @virtual
		 * @param {Terrasoft.BaseModel} viewModel Входящая модель.
		 * @param {Object} config Конфигурация действия.
		 * @param {String[]} config.expectedParameters Список копируемых параметров.
		 * @return {Object} Объект, состоящий из перечисленных параметров входящей модели.
		 */
		sliceViewModel: function(viewModel, config) {
			var expectedParameters = config.expectedParameters, result = {};
			Terrasoft.each(expectedParameters, function(parameterName) {
				result[parameterName] = viewModel.get(parameterName);
			}, this);
			return result;
		},

		/**
		 * Создает объект параметров модели для холста.
		 * @protected
		 * @virtual
		 * @param {Object} config Настройка холста.
		 * @return {Object} Объект параметров.
		 */
		sheetToViewModel: function(config) {
			var itemsCollection = Ext.create("Terrasoft.BaseViewModelCollection");
			var items = config.Items;
			if (!Ext.isEmpty(items)) {
				Terrasoft.each(items, function(item) {
					var exportedItem = this.itemToViewModel(item);
					var itemId = exportedItem.get("Id");
					itemsCollection.add(itemId, exportedItem);
				}, this);
			}
			config.Items = itemsCollection;
			config = this.sliceObject(config, {expectedParameters: this.sheetElementProperties});
			config.Id = Terrasoft.generateGUID();
			return config;
		},

		/**
		 * Создает модель представления блока контента.
		 * @protected
		 * @virtual
		 * @param {Object} config Настройка блока контента.
		 * @return {Terrasoft.BaseViewModel} Модель представления блока контента.
		 */
		blockToViewModel: function(config) {
			var itemsCollection = Ext.create("Terrasoft.BaseViewModelCollection");
			var items = config.Items;
			if (Ext.isEmpty(items)) {
				throw Ext.create("Terrasoft.NullOrEmptyException");
			}
			Terrasoft.each(items, function(item) {
				var exportedItem = this.itemToViewModel(item);
				var itemId = exportedItem.get("Id");
				itemsCollection.add(itemId, exportedItem);
			}, this);
			config.Items = itemsCollection;
			config = this.sliceObject(config, {expectedParameters: this.blockElementProperties});
			config.Id = Terrasoft.generateGUID();
			return Ext.create("Terrasoft.ContentBlockViewModel", {values: config});
		},

		/**
		 * Создает модель представления элемента текта.
		 * @protected
		 * @virtual
		 * @param {Object} config Настройка элемента текта.
		 * @return {Terrasoft.BaseViewModel} Модель представления элемента текта.
		 */
		textToViewModel: function(config) {
			config = this.sliceObject(config, {expectedParameters: this.textElementProperties});
			config.Id = Terrasoft.generateGUID();
			return Ext.create("Terrasoft.ContentTextElementViewModel", {values: config});
		},

		/**
		 * Создает модель представления элемента html разметки.
		 * @protected
		 * @virtual
		 * @param {Object} config Настройка элемента html разметки.
		 * @return {Terrasoft.BaseViewModel} Модель представления элемента html разметки.
		 */
		htmlToViewModel: function(config) {
			config = this.sliceObject(config, {expectedParameters: this.htmlElementProperties});
			config.Id = Terrasoft.generateGUID();
			return Ext.create("Terrasoft.ContentHTMLElementViewModel", {values: config});
		},

		/**
		 * Создает модель представления элемента изображения.
		 * @protected
		 * @virtual
		 * @param {Object} config Настройка элемента изображения.
		 * @return {Terrasoft.BaseViewModel} Модель представления элемента изображения.
		 */
		imageToViewModel: function(config) {
			config = this.sliceObject(config, {expectedParameters: this.imageElementProperties});
			config.Id = Terrasoft.generateGUID();
			return Ext.create("Terrasoft.ContentImageElementViewModel", {values: config});
		},

		/**
		 * Создает модель представления элемента контента.
		 * @protected
		 * @virtual
		 * @param {Object} config Настройка элемента контента.
		 * @return {Terrasoft.BaseViewModel|Object} Модель представления элемента контента.
		 */
		itemToViewModel: function(config) {
			var result = {};
			var itemType = config.ItemType;
			if (Ext.isEmpty(itemType)) {
				throw Ext.create("Terrasoft.NullOrEmptyException");
			}
			switch (itemType) {
				case "sheet":
					result = this.sheetToViewModel(config);
					break;
				case "block":
					result = this.blockToViewModel(config);
					break;
				case "text":
					result = this.textToViewModel(config);
					break;
				case "html":
					result = this.htmlToViewModel(config);
					break;
				case "image":
					result = this.imageToViewModel(config);
					break;
				default:
					throw Ext.create("Terrasoft.NotImplementedException");
			}
			return result;
		},

		/**
		 * Создает объект параметров из модели холста.
		 * @protected
		 * @virtual
		 * @param {Object} viewModel Модель холста.
		 * @return {Object} Объект параметров.
		 */
		sheetToJSON: function(viewModel) {
			var result = this.sliceViewModel(viewModel, {expectedParameters: this.sheetElementProperties});
			var items = result.Items;
			var itemsCollection = [];
			if (Ext.isEmpty(items)) {
				throw Ext.create("Terrasoft.NullOrEmptyException");
			}
			items.each(function(item) {
				var importedItem = this.itemToJSON(item);
				itemsCollection.push(importedItem);
			}, this);
			result.Items = itemsCollection;
			return result;
		},

		/**
		 * Создает объект параметров из модели блока.
		 * @protected
		 * @virtual
		 * @param {Object} viewModel Модель блока.
		 * @return {Object} Объект параметров.
		 */
		blockToJSON: function(viewModel) {
			var result = this.sliceViewModel(viewModel, {expectedParameters: this.blockElementProperties});
			var items = result.Items;
			var itemsCollection = [];
			if (Ext.isEmpty(items)) {
				throw Ext.create("Terrasoft.NullOrEmptyException");
			}
			items.each(function(item) {
				var importedItem = this.itemToJSON(item);
				itemsCollection.push(importedItem);
			}, this);
			result.Items = itemsCollection;
			return result;
		},

		/**
		 * Создает объект параметров из модели текстового элемента.
		 * @protected
		 * @virtual
		 * @param {Object} viewModel Модель текстового элемента.
		 * @return {Object} Объект параметров.
		 */
		textToJSON: function(viewModel) {
			return this.sliceViewModel(viewModel, {expectedParameters: this.textElementProperties});
		},

		/**
		 * Создает объект параметров из модели html элемента.
		 * @protected
		 * @virtual
		 * @param {Object} viewModel Модель html элемента.
		 * @return {Object} Объект параметров.
		 */
		htmlToJSON: function(viewModel) {
			return this.sliceViewModel(viewModel, {expectedParameters: this.htmlElementProperties});
		},

		/**
		 * Создает объект параметров из модели элемента изображения.
		 * @protected
		 * @virtual
		 * @param {Object} viewModel Модель элемента изображжения.
		 * @return {Object} Объект параметров.
		 */
		imageToJSON: function(viewModel) {
			return this.sliceViewModel(viewModel, {expectedParameters: this.imageElementProperties});
		},

		/**
		 * Создает объект параметров из модели элемента.
		 * @protected
		 * @virtual
		 * @param {Object} viewModel Модель элемента.
		 * @return {Object} Объект параметров.
		 */
		itemToJSON: function(viewModel) {
			var result = {};
			var itemType = viewModel.get("ItemType");
			if (Ext.isEmpty(itemType)) {
				throw Ext.create("Terrasoft.NullOrEmptyException");
			}
			switch (itemType) {
				case "sheet":
					result = this.sheetToJSON(viewModel);
					break;
				case "block":
					result = this.blockToJSON(viewModel);
					break;
				case "text":
					result = this.textToJSON(viewModel);
					break;
				case "html":
					result = this.htmlToJSON(viewModel);
					break;
				case "image":
					result = this.imageToJSON(viewModel);
					break;
				default:
					throw Ext.create("Terrasoft.NotImplementedException");
			}
			return result;
		},

		//endregion

		//region Methods: Public

		/**
		 * Преобразует конфигурацию объекта контента в его модель представления.
		 * @virtual
		 * @param {Object} config Кoнфигурация элемента контента.
		 * @return {Terrasoft.BaseViewModel|Object} Модель представления элемента.
		 */
		toViewModel: function(config) {
			config = Terrasoft.deepClone(config);
			return this.itemToViewModel(config);
		},

		/**
		 * Преобразует модель представления объекта контента в его конфигурацию.
		 * @virtual
		 * @param {Terrasoft.BaseModel} viewModel Модель представления элемента.
		 * @return {Object} Кoнфигурация элемента контента.
		 */
		toJSON: function(viewModel) {
			return this.itemToJSON(viewModel);
		}

		//endregion

	});
});
