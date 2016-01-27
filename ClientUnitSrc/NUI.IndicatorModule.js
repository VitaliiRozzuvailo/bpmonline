define("IndicatorModule", ["IndicatorModuleResources", "BaseNestedModule"],
	function(resources) {

		/**
		 * @class Terrasoft.configuration.IndicatorViewConfig
		 * Класс генерурующий конфигурацию представления модуля показателя.
		 */
		Ext.define("Terrasoft.configuration.IndicatorViewConfig", {
			extend: "Terrasoft.BaseModel",
			alternateClassName: "Terrasoft.IndicatorViewConfig",

			/**
			 * Генерирует конфигурацию представления модуля показателя.
			 * @protected
			 * @virtual
			 * @param {Object} config Объект конфигурации.
			 * @param {Terrasoft.BaseEntitySchema} config.entitySchema Cхема объекта.
			 * @param {String} config.style Стиль отображения.
			 * @return {Object[]} Возвращает конфигурацию представления модуля показателя.
			 */
			generate: function(config) {
				var style = config.style || "";
				var fontStyle = config.fontStyle || "";
				var wrapClassName = Ext.String.format("{0}", style);
				var id = Terrasoft.Component.generateId();
				var result = {
					"name": id,
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {wrapClassName: [wrapClassName, "indicator-module-wraper"]},
					"styles": {
						"display": "table",
						"width": "100%",
						"height": "100%"
					},
					"items": [
						{
							"name": id + "-wrap",
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"styles": {
								"display": "table-cell",
								"vertical-align": "middle"
							},
							"classes": {wrapClassName: ["indicator-wrap"]},
							"items": [
								{
									"name": "indicator-caption" + id,
									"itemType": Terrasoft.ViewItemType.LABEL,
									"caption": {"bindTo": "caption"},
									"classes": {"labelClass": ["indicator-caption"]}
								},
								{
									"name": "indicator-value" + id,
									"itemType": Terrasoft.ViewItemType.LABEL,
									"caption": {
										"bindTo": "value",
										"bindConfig": {"converter": "valueConverter"}
									},
									"classes": {"labelClass": ["indicator-value " + fontStyle]}
								}
							]
						}
					]
				};
				return result;
			}
		});

		Ext.define("Terrasoft.configuration.IndicatorViewModel", {
			extend: "Terrasoft.BaseModel",
			alternateClassName: "Terrasoft.IndicatorViewModel",
			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Описание колонок модели.
			 * {Object}
			 */
			columns: {
				caption: {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					dataValueType: Terrasoft.DataValueType.Text,
					value: null
				},
				value: {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					dataValueType: Terrasoft.DataValueType.Text,
					value: null
				}
			},

			/**
			 * Описание для форматирования данных отображения по умолчанию.
			 * {Object}
			 */
			defaultFormat: {
				textDecorator: "{0}",
				thousandSeparator: Terrasoft.Resources.CultureSettings.thousandSeparator,
				dateFormat: Terrasoft.Resources.CultureSettings.dateFormat
			},

			onRender: Ext.emptyFn,

			constructor: function() {
				this.callParent(arguments);
				this.initResourcesValues(resources);
			},

			/**
			 * Конвертирует значение в определенный формат в зависимости от типа значения.
			 * @protected
			 * @virtual
			 * @param {String/Date/Number} value Значение которое необходимо конвертировать.
			 * @return {String} Возвращает отформатированную строку.
			 */
			valueConverter: function(value) {
				var result = "";
				var formatConfig = this.get("format") || this.defaultFormat;
				if (Ext.isNumber(value)) {
					formatConfig.decimalPrecision = (Ext.isEmpty(formatConfig.decimalPrecision)) ?
						((formatConfig.type === Terrasoft.DataValueType.INTEGER) ? 0 : 2) :
						formatConfig.decimalPrecision;
					if (formatConfig.decimalPrecision === 0) {
						value = Math.round(value);
					}
					result = Terrasoft.getFormattedNumberValue(value, formatConfig);
				} else if (Ext.isDate(value)) {
					var dateFormat = formatConfig.dateFormat || Terrasoft.Resources.CultureSettings.dateFormat;
					result = Ext.Date.format(value, dateFormat);
				}
				var textDecorator = formatConfig.textDecorator;
				if (textDecorator) {
					result = Ext.String.format(textDecorator, result);
				}
				return result;
			},

			/**
			 * Инициализирует модель значениями ресурсов из объекта ресурсов.
			 * @protected
			 * @virtual
			 * @param {Object} resourcesObj Объект ресурсов.
			 */
			initResourcesValues: function(resourcesObj) {
				var resourcesSuffix = "Resources";
				Terrasoft.each(resourcesObj, function(resourceGroup, resourceGroupName) {
					resourceGroupName = resourceGroupName.replace("localizable", "");
					Terrasoft.each(resourceGroup, function(resourceValue, resourceName) {
						var viewModelResourceName = [resourcesSuffix, resourceGroupName, resourceName].join(".");
						this.set(viewModelResourceName, resourceValue);
					}, this);
				}, this);
			},

			/**
			 * Выполняет подготовку параметров показателя.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback
			 */
			prepareIndicator: function(callback, scope) {
				var select = this.createSelect();
				if (select) {
					select.getEntityCollection(function(response) {
						if (!response.success || this.destroyed) {
							return;
						}
						var resultEntity = response.collection.getByIndex(0);
						var resultValue = resultEntity.get("value");
						this.set("value", resultValue);
						callback.call(scope);
					}, this);
				} else {
					callback.call(scope);
				}
			},

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback
			 */
			init: function(callback, scope) {
				this.prepareIndicator(callback, scope);
			},

			/**
			 * Выполняет выборку данных.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.EntitySchemaQuery} select Cодержит выбранные и отфильтрованные данные.
			 */
			createSelect: function() {
				var entitySchemaName = this.get("entitySchemaName");
				if (!entitySchemaName) {
					return null;
				}
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: entitySchemaName,
					rowCount: 1
				});
				this.addAggregationColumn(select);
				var filterData = this.get("filterData");
				var filters = Ext.isString(filterData)
					? Terrasoft.deserialize(filterData)
					: this.Ext.create("Terrasoft.FilterGroup");
				select.filters.addItem(filters);
				var quickFilters = this.getQuickFilters();
				if (!Ext.isEmpty(quickFilters)) {
					select.filters.addItem(quickFilters);
				}
				return select;
			},

			/**
			 * Обновляет фильтры раздела в зависимости от настройки связи с разделом.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.FilterGroup} quickFilter Объект фильтров раздела.
			 * @param {String} column Колонка связи с разделом.
			 */
			updateModuleFilter: function(quickFilter, column) {
				var leftExpression = quickFilter.leftExpression;
				if (!Ext.isEmpty(leftExpression)) {
					leftExpression.columnPath = column + "." + leftExpression.columnPath;
				} else {
					quickFilter.each(function(item) {
						this.updateModuleFilter(item, column);
					}, this);
				}
			},

			/**
			 * Возвращает фильтры с учетом фильтров разделов.
			 * @returns {Object} quickFilter Фильтры с учетом фильтров разделов.
			 */
			getQuickFilters: function() {
				var column = this.get("sectionBindingColumn");
				if (Ext.isEmpty(this.get("sectionId")) || Ext.isEmpty(column)) {
					return this.Ext.create("Terrasoft.FilterGroup");
				}
				column = column.replace(/\.[iI]d$|^[iI]d$/, "");
				var quickFilter = this.sandbox.publish("GetFiltersCollection", null);
				if (quickFilter && !quickFilter.isEmpty() && !Ext.isEmpty(column)) {
					this.updateModuleFilter(quickFilter, column);
				}
				return quickFilter;
			},

			/**
			 * Добавляет агрегирующую колонку основываясь на типе агрегации из конфига.
			 * @protected
			 * @virtual
			 * @param {Object} select Выборка данных.
			 */
			addAggregationColumn: function(select) {
				var aggregationType = this.get("aggregationType");
				var aggregationColumnName = this.get("columnName") || "Id";
				select.addAggregationSchemaColumn(aggregationColumnName, aggregationType, "value");
			}
		});

		Ext.define("Terrasoft.configuration.IndicatorModule", {
			extend: "Terrasoft.BaseNestedModule",
			alternateClassName: "Terrasoft.IndicatorModule",

			Ext: null,
			sandbox: null,
			Terrasoft: null,
			showMask: true,

			/**
			 * Используемые сообщения.
			 * @protected
			 */
			messages: {
				/**
				 * @message GetSectionFilterModuleId
				 * Для подписки на UpdateFilter.
				 */
				"GetSectionFilterModuleId": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},

			/**
			 * Имя класса модели представления для модуля показателя.
			 * @type {String}
			 */
			viewModelClassName: "Terrasoft.IndicatorViewModel",

			/**
			 * Имя класа генератога конфигурации представления модуля показателя.
			 * @type {String}
			 */
			viewConfigClassName: "Terrasoft.IndicatorViewConfig",

			/**
			 * Имя класа генератога представления.
			 * @type {String}
			 */
			viewGeneratorClass: "Terrasoft.ViewGenerator",

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewConfig
			 * @overridden
			 */
			initViewConfig: function(callback, scope) {
				var generatorConfig = Terrasoft.deepClone(this.moduleConfig);
				generatorConfig.viewModelClass = this.viewModelClass;
				this.buildView(generatorConfig, function(view) {
					this.viewConfig = view[0];
					callback.call(scope);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#init
			 * @overridden
			 */
			init: function() {
				if (!this.viewModel) {
					this.initConfig();
					this.registerMessages();
					this.subscribeMessages();
				}
				this.callParent(arguments);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#initViewModelClass
			 * @overridden
			 */
			initViewModelClass: function(callback, scope) {
				this.viewModelClass = Ext.ClassManager.get(this.viewModelClassName);
				callback.call(scope);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#getViewModelConfig
			 * @overridden
			 */
			getViewModelConfig: function() {
				var config = this.callParent(arguments);
				config.values = this.moduleConfig;
				return config;
			},

			/**
			 * Создает экземпляр класса Terrasoft.ViewGenerator.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.ViewGenerator} Возвращает объект Terrasoft.ViewGenerator.
			 */
			createViewGenerator: function() {
				return this.Ext.create(this.viewGeneratorClass);
			},

			/**
			 * Создает конфигурацию представления вложенного модуля.
			 * @protected
			 * @virtual
			 * param {Object} config Объект конфигурации.
			 * param {Function} callback Функция обратного вызова.
			 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
			 * @return {Object[]} Возвращает конфигурацию представления вложенного модуля.
			 */
			buildView: function(config, callback, scope) {
				var viewGenerator = this.createViewGenerator();
				var viewClass = this.Ext.create(this.viewConfigClassName);
				var schema = {
					viewConfig: [viewClass.generate(config)]
				};
				var viewConfig = Ext.apply({
					schema: schema
				}, config);
				viewGenerator.generate(viewConfig, callback, scope);
			},

			/**
			 * Инициализирует объект конфигурации модуля.
			 * @protected
			 * @virtual
			 */
			initConfig: function() {
				var sandbox = this.sandbox;
				this.moduleConfig = sandbox.publish("GetIndicatorConfig", null, [sandbox.id]);
			},

			/**
			 * Подписывается на сообщения родительского модуля.
			 * @protected
			 * @virtual
			 */
			subscribeMessages: function() {
				var sandbox = this.sandbox;
				var sectionFilterModuleId = sandbox.publish("GetSectionFilterModuleId");
				sandbox.subscribe("GenerateIndicator", this.onGenerateIndicator, this, [sandbox.id]);
				sandbox.subscribe("UpdateFilter", function() {
					if (!Ext.isEmpty(this.moduleConfig.sectionId) &&
						!Ext.isEmpty(this.moduleConfig.sectionBindingColumn)) {
						this.onGenerateIndicator();
					}
				}, this, [sectionFilterModuleId]);
			},

			/**
			 * Метод обработки сообщения генерации показателя.
			 * @protected
			 * @virtual
			 */
			onGenerateIndicator: function() {
				var viewModel = this.viewModel;
				this.initConfig();
				viewModel.loadFromColumnValues(this.moduleConfig);
				viewModel.prepareIndicator(function() {
					var view = this.view;
					if (view && !view.destroyed) {
						view.destroy();
					}
					this.initViewConfig(function() {
						var renderTo = Ext.get(viewModel.renderTo);
						if (renderTo) {
							this.render(renderTo);
						}
					}, this);
				}, this);
			},

			/**
			 * Расширяет конфигурацию сообщений модуля, сообщениями описанными в модуле.
			 * @protected
			 */
			registerMessages: function() {
				this.sandbox.registerMessages(this.messages);
			}
		});

		return Terrasoft.IndicatorModule;

	});
