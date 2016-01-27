define("CtiPanelUtils", [],
	function() {

		/**
		 * @class Terrasoft.configuration.mixins.CtiPanelUtils
		 * Миксин модели динамически генерируемых панелей Cti панели.
		 * @type {Terrasoft.BaseObject}
		 */
		Ext.define("Terrasoft.configuration.mixins.CtiPanelUtils", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.CtiPanelUtils",

			/**
			 * Название схемы панели идентифицированного абонента.
			 * @type {String}
			 */
			identifiedSubscriberPanelSchema: "IdentifiedSubscriberItem",

			/**
			 * Название схемы панели истории звонков.
			 * @type {String}
			 */
			communicationHistoryPanelSchema: "CommunicationHistoryItem",

			/**
			 * Название схемы панели результатов поиска абонента.
			 * @type {String}
			 */
			searchResultPanelSchema: "SubscriberSearchResultItem",

			/**
			 * Название схемы панели средства связи абонента.
			 * @type {String}
			 */
			сommunicationPanelSchema: "SubscriberCommunicationItem",

			/**
			 * Название свойства, где хранится класс модели представления панели идентифицированного абонента.
			 * @type {String}
			 */
			identifiedSubscriberPanelViewModelClass: "IdentifiedSubscriberPanelViewModelClass",

			/**
			 * Название свойства, где хранится класс модели представления панели истории звонка.
			 * @type {String}
			 */
			communicationHistoryPanelViewModelClass: "СommunicationHistoryPanelViewModelClass",

			/**
			 * Название свойства, где хранится класс модели представления панели результатов поиска абонента.
			 * @type {String}
			 */
			searchResultPanelViewModelClass: "SearchResultPanelViewModelClass",

			/**
			 * Название свойства, где хранится класс модели представления панели средства связи абонента.
			 * @type {String}
			 */
			сommunicationPanelViewModelClass: "СommunicationPanelViewModelClass",

			/**
			 * Название свойства, где будет сохранено представление модели панели идентифицированного абонента.
			 * @type {String}
			 */
			identifiedSubscriberPanelView: "IdentifiedSubscriberPanelView",

			/**
			 * Название свойства, где будет сохранено представление модели панели истории звонка.
			 * @type {String}
			 */
			communicationHistoryPanelView: "СommunicationHistoryPanelView",

			/**
			 * Название свойства, где будет сохранено представление модели панели результатов поиска абонента.
			 * @type {String}
			 */
			searchResultPanelView: "SearchResultPanelView",

			/**
			 * Название свойства, где будет сохранено представление модели панели средства связи абонента.
			 * @type {String}
			 */
			сommunicationPanelView: "СommunicationPanelView",

			//region Methods: Private

			/**
			 * Создаёт объект модели представления панели.
			 * @private
			 * @param {Object} panelConfig Конфигурация панели.
			 * @param {Object} viewModelClassPropertyName Название свойства, где хранится класс модели представления.
			 * @return {Object} Объект модели представления панели.
			 */
			createPanelViewModel: function(panelConfig, viewModelClassPropertyName) {
				var panelViewModelClass = Terrasoft.deepClone(this.get(viewModelClassPropertyName));
				return this.Ext.create(panelViewModelClass, {
					Ext: this.Ext,
					sandbox: this.sandbox,
					Terrasoft: this.Terrasoft,
					values: panelConfig
				});
			},

			/**
			 * Создаёт конфигурацию модели представления панелей.
			 * @private
			 * @param {String} viewModelClassPropertyName Название свойства, где хранится класс модели представления.
			 * @param {String} viewPropertyName Название свойства, где будет сохранено представление модели.
			 * @param {Object} schema Схема панели идентифицированного абонента.
			 * @param {Object} hierarchy Иерархия схемы панели идентифицированного абонента.
			 * @param {Function} callback Функция обратного вызова.
			 */
			generatePanelViewModel: function(viewModelClassPropertyName, viewPropertyName, schema, hierarchy, callback) {
				var viewModelGenerator = Ext.create("Terrasoft.ViewModelGenerator");
				var generatorConfig = {
					hierarchy: hierarchy
				};
				var viewModelGenerateCallBack = function(viewModelClass) {
					this.set(viewModelClassPropertyName, viewModelClass);
					var viewConfig = {
						schema: schema,
						viewModelClass: viewModelClass
					};
					var viewGenerator = Ext.create("Terrasoft.ViewGenerator");
					var viewGeneratorCallback = function(view) {
						this.set(viewPropertyName, view);
						callback();
					}.bind(this);
					viewGenerator.generate(viewConfig, viewGeneratorCallback, this);
				}.bind(this);
				viewModelGenerator.generate(generatorConfig, viewModelGenerateCallBack);
			},

			/**
			 * Создает конфигурацию модели и представления панелей.
			 * @private
			 * @param {String} schemaName Название схемы.
			 * @param {String} profileKey Ключ профиля.
			 * @param {String} viewModelClassPropertyName Название свойства, где хранится класс модели представления.
			 * @param {String} viewPropertyName Название свойства, где будет сохранено представление модели.
			 * @param {Function} callback Функция обратного вызова.
			 */
			generatePanelItemConfig: function(schemaName, profileKey, viewModelClassPropertyName, viewPropertyName,
				callback) {
				var schemaBuilder = Ext.create("Terrasoft.SchemaBuilder");
				var requireAllSchemaHierarchyCallBack = function(hierarchy) {
					var schema = hierarchy[hierarchy.length - 1];
					schemaBuilder.generateViewConfig(schema, hierarchy);
					this.generatePanelViewModel(viewModelClassPropertyName, viewPropertyName, schema,
						hierarchy, callback);
				}.bind(this);
				var generatorConfig = {
					schemaName: schemaName,
					profileKey: profileKey
				};
				schemaBuilder.requireAllSchemaHierarchy(generatorConfig, requireAllSchemaHierarchyCallBack, this);
			},

			/**
			 * Создает конфигурацию модели и представления панели идентифицированного абонента.
			 * @private
			 * @param {Function} callback Функция обратного вызова.
			 */
			generateIdentifiedSubscriberPanelItemConfig: function(callback) {
				this.generatePanelItemConfig(
					this.identifiedSubscriberPanelSchema, this.identifiedSubscriberPanelSchema,
					this.identifiedSubscriberPanelViewModelClass, this.identifiedSubscriberPanelView, callback);
			},

			/**
			 * Создает конфигурацию модели и представления панели истории звонков.
			 * @private
			 * @param {Function} callback Функция обратного вызова.
			 */
			generateCommunicationHistoryItemPanelItemConfig: function(callback) {
				this.generatePanelItemConfig(
					this.communicationHistoryPanelSchema, this.communicationHistoryPanelSchema,
					this.communicationHistoryPanelViewModelClass, this.communicationHistoryPanelView, callback);
			},

			/**
			 * Создает конфигурацию модели и представления панели результатов поиска абонента.
			 * @private
			 * @param {Function} callback Функция обратного вызова.
			 */
			generateSearchResultPanelItemConfig: function(callback) {
				this.generatePanelItemConfig(
					this.searchResultPanelSchema, this.searchResultPanelSchema,
					this.searchResultPanelViewModelClass, this.searchResultPanelView, callback);
			},

			/**
			 * Создает конфигурацию модели и представления панели средства связи абонента.
			 * @private
			 * @param {Function} callback Функция обратного вызова.
			 */
			generateСommunicationPanelItemConfig: function(callback) {
				this.generatePanelItemConfig(
					this.сommunicationPanelSchema, this.сommunicationPanelSchema,
					this.сommunicationPanelViewModelClass, this.сommunicationPanelView, callback);
			},

			/**
			 * Задает конфигурацию элемента коллекции панелей идентифицированных абонентов.
			 * @private
			 * @param {Object} item Элемент коллекции панелей идентифицированных абонентов.
			 */
			getIdentifiedSubscriberPanelViewConfig: function(item) {
				item.config = Terrasoft.deepClone(this.get(this.identifiedSubscriberPanelView));
			},

			/**
			 * Задает конфигурацию элемента коллекции панелей результатов поиска абонента.
			 * @private
			 * @param {Object} item Элемент коллекции панелей результатов поиска абонента.
			 */
			getSearchResultPanelViewConfig: function(item) {
				item.config = Terrasoft.deepClone(this.get(this.searchResultPanelView));
			},

			/**
			 * Задает конфигурацию элемента коллекции истории звонков.
			 * @private
			 * @param {Object} item Элемент коллекции панелей истории комуникационной панели.
			 */
			getCommunicationHistoryPanelViewConfig: function(item) {
				item.config = Terrasoft.deepClone(this.get(this.communicationHistoryPanelView));
			}

			//endregion

		});

	});