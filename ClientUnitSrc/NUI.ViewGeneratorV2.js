define("ViewGeneratorV2", ["BusinessRulesApplierV2", "ext-base", "terrasoft", "ViewGeneratorV2Resources",
		"LinkColumnHelper", "ModuleUtils", "BaseGeneratorV2"],
	function(BusinessRulesApplier, Ext, Terrasoft, resources, LinkColumnHelper, moduleUtils) {

		/**
		 * @class Terrasoft.configuration.ViewGenerator
		 * Класс-генератор представления
		 */
		var viewGenerator = Ext.define("Terrasoft.configuration.ViewGenerator", {
			extend: "Terrasoft.BaseGenerator",
			alternateClassName: "Terrasoft.ViewGenerator",

			/**
			 * Объект специфических генераторов для элементов
			 * @private
			 * @type {Object}
			 */
			customGenerators: null,

			/**
			 * Класс модели представления
			 * @private
			 * @type {Object}
			 */
			viewModelClass: null,

			/**
			 * Профиль cхемы
			 * @private
			 * @type {Object}
			 */
			schemaProfile: null,

			/**
			 * Css-класс контейнера-обертки над элементом модели с заголовком
			 * @private
			 * @type {String[]}
			 */
			defaultModelItemClass: "control-width-15",

			/**
			 * Css-класс контейнера-обертки над элементом модели без заголовка
			 * @private
			 * @type {String}
			 */
			defaultModelItemClassWithoutLabel: "control-no-label",

			/**
			 * Css-класс контейнера-обертки над элементом модели в сетке, если она находися в крайнем левом положении
			 * @private
			 * @type {String[]}
			 */
			defaultModelItemLeftClass: "control-left",

			/**
			 * Css-класс контейнера-обертки над элементом модели в сетке, если она находися в крайнем правом положении
			 * @private
			 * @type {String[]}
			 */
			defaultModelItemRightClass: "control-right",

			/**
			 * Css-класс контейнера-обертки элемента управления ControlGroup
			 * @private
			 * @type {String[]}
			 */
			defaultControlGroupClass: ["control-group-margin-bottom"],

			/**
			 * Css-класс контейнера-обертки элемента управления с заголовком колонки
			 * @private
			 * @type {String[]}
			 */
			defaultLabelWrapClass: ["label-wrap"],

			/**
			 * Css-класс контейнера-обертки элемента управления со значением колонки
			 * @private
			 * @type {String[]}
			 */
			defaultControlWrapClass: ["control-wrap"],

			/**
			 * Суффикс контейнера заголовка элемента управления
			 * @private
			 * @type {String}
			 */
			defaultLabelWrapSuffix: "_Label",

			/**
			 * Суффикс контейнера элемента управления
			 * @private
			 * @type {String}
			 */
			defaultControlWrapSuffix: "_Control",

			/**
			 * Css-класс подписи с размером по умолчанию
			 * @private
			 * @type {String}
			 */
			standardTextSizeClass: "",

			/**
			 * Css-класс подписи со стиль «Заголовок»
			 * @private
			 * @type {String}
			 */
			largeTextSizeClass: "text-size-caption",

			/**
			 * Css-класс контейнера переключателя
			 * @private
			 * @type {String}
			 */
			radioButtonContainerClass: ["radio-button-container"],

			/**
			 * Css-класс контейнера модуля
			 * @private
			 * @type {String}
			 */
			moduleClass: ["module-container"],

			/**
			 * Имя метода модели для вызова страницы справочника
			 * @private
			 * @type {String}
			 */
			loadVocabularyMethodName: "loadVocabulary",

			/**
			 * Суффикс имени колонки для полей со списком
			 * @private
			 * @type {String}
			 */
			defaultListColumnSuffix: "List",

			/**
			 * Суффикс идентификатора элемента ввода для подписи переключателя
			 * @private
			 * @type {String}
			 */
			radioButtonInputIdSuffix: "-el",

			/**
			 * Имя метода карточки для загрузки детали.
			 * @private
			 * @type {String}
			 */
			defaultLoadDetailMethodName: "loadDetail",

			/**
			 * Имя метода карточки для загрузки модуля
			 * @private
			 * @type {String}
			 */
			defaultLoadModuleMethodName: "loadModule",

			/**
			 * Имя события модели, вызиваемого при фокусировке элемента редактирования
			 * @private
			 * @type {String}
			 */
			defaultFocusMethodName: "onItemFocused",

			/**
			 * Максимальное количество столбцов в сетке
			 * @private
			 * @type {Number}
			 */
			maxGridLayoutColumnsCount: 24,

			/**
			 * Отступ снизу для элемента управления ScheduleEdit в px. Используется при установке дополнительных стилей
			 * страницы (отступ снизу). Элемент управления ScheduleEdit имеет преднастроенный отступ 5 px.
			 * @private
			 * @type {Number}
			 */
			defaultScheduleEditBottomPadding: Terrasoft.convertEmToPx("2em"),

			/**
			 * Объект развязки имени класса представления элемента и суффикса для уникального идентификатора.
			 * @private
			 * @type {Object}
			 */
			defaultControlSuffix: {
				"Terrasoft.GridLayout": "GridLayout",
				"Terrasoft.Grid": "Grid",
				"Terrasoft.TabPanel": "TabPanel",
				"Terrasoft.ImageTabPanel": "ImageTabPanel",
				"Terrasoft.Label": "Label",
				"Terrasoft.Button": "Button",
				"Terrasoft.MemoEdit": "MemoEdit",
				"Terrasoft.TextEdit": "TextEdit",
				"Terrasoft.HtmlEdit": "HtmlEdit",
				"Terrasoft.FloatEdit": "FloatEdit",
				"Terrasoft.IntegerEdit": "IntegerEdit",
				"Terrasoft.DateEdit": "DateEdit",
				"Terrasoft.TimeEdit": "TimeEdit",
				"Terrasoft.ComboBoxEdit": "ComboBoxEdit",
				"Terrasoft.LookupEdit": "LookupEdit",
				"Terrasoft.CheckBoxEdit": "CheckBoxEdit",
				"Terrasoft.ControlGroup": "ControlGroup",
				"Terrasoft.Container": "Container",
				"Terrasoft.RadioButton": "RadioButton",
				"Terrasoft.ScheduleEdit": "ScheduleEdit",
				"Terrasoft.BaseProgressBar": "BaseProgressBar"
			},

			/**
			 * Конфигурация заголовка ячейки реестра по умолчанию
			 * @private
			 * @type {Object}
			 */
			defaultGridCellCaptionConfig: {
				visible: true,
				position: Terrasoft.CaptionPositionType.ABOVE,
				align: Terrasoft.CaptionAlignType.LEFT
			},

			/**
			 * Значения позиции элементов в GridLayout по умолчанию
			 * @private
			 * @type {Object}
			 */
			defaultGridLayoutItemConfig: {
				colSpan: 12,
				rowSpan: 1
			},

			/**
			 * Шаблон названия свойства видимости для представления раздела
			 * @private
			 * @type {String}
			 */
			dataViewVisiblePropertyTemplate: "Is{0}Visible",

			/**
			 * Установить функции-генераторы для всех элементов, у которых указаны генераторы из этого модуля
			 * @private
			 * @param {String} moduleName Имя модуля
			 * @param {Object} module Экземпляр модуля
			 */
			setGeneratorsByModule: function(moduleName, module) {
				var generators = this.customGenerators;
				Terrasoft.each(generators, function(generator, itemName) {
					if (Ext.isString(generator) && generator.indexOf(moduleName) === 0) {
						var methodName = generator.split(".")[1];
						var generatorFn = module[methodName];
						generators[itemName] = {
							generatorFn: generatorFn,
							scope: module
						};
					}
				}, this);
			},

			/**
			 * Собирает коллекцию всех элементов, использующих пользовательские методы генерации. Вызывается рекурсивно
			 * @private
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @param {Object} generators Элементы, использующих пользовательские генераторы. Используется для рекурсии
			 */
			fillCustomGenerators: function(config, generators) {
				Terrasoft.iterateChildItems(config, function(iterationConfig) {
					var itemConfig = iterationConfig.item;
					if (this.hasItemCustomGenerator(itemConfig)) {
						var itemName = itemConfig.name;
						generators[itemName] = itemConfig.generator;
					}
				}, this);
			},

			/**
			 * Запрашивает и получает все пользовательские функции-генераторы
			 * @private
			 * @param {Object[]} viewConfig Конфигурация представления, объединенная по всей иерархии наследования схемы
			 * @param {Function} callback Функция-callback, в нее передается сгенерированную конфигурацию представления
			 * @param {Object} scope Контекст выполнения функции callback
			 */
			requireCustomGenerators: function(viewConfig, callback, scope) {
				var generators = this.customGenerators = {};
				this.fillCustomGenerators(viewConfig, generators);
				var modulesToRequire = [];
				Terrasoft.each(generators, function(descriptor) {
					if (Ext.isString(descriptor)) {
						var generatorModule = descriptor.split(".")[0];
						modulesToRequire.push(generatorModule);
					}
				}, this);
				var me = this;
				require(modulesToRequire, function() {
					var modules = arguments;
					Terrasoft.each(modulesToRequire, function(moduleName, index) {
						me.setGeneratorsByModule(moduleName, modules[index]);
					});
					callback.call(scope);
				});
			},

			/**
			 * Генерирует конфигурацию представления, на основе которой будут создаваться элементы управления
			 * @protected
			 * @param {Object[]} viewConfig Конфигурация представления, объединенная по всей иерархии наследования схемы
			 * @return {Object[]} Возвращает сгенерированное представление схемы
			 */
			generateView: function(viewConfig) {
				var resultView = [];
				Terrasoft.each(viewConfig, function(item) {
					var itemView = this.generateItem(item);
					resultView = resultView.concat(itemView);
				}, this);
				return resultView;
			},

			/**
			 * Проверяет, должен ли элемент использовать пользовательскую функцию генерации
			 * @protected
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Boolean} Возвращает true, есть ли у элемента пользовательская функция генерации
			 * false в противном случае
			 */
			hasItemCustomGenerator: function(config) {
				var customGenerator = config.generator;
				return (Ext.isString(customGenerator) || Ext.isFunction(customGenerator));
			},

			/**
			 * Генерирует конфигурацию представления элемента схемы
			 * @protected
			 * @throws {Terrasoft.InvalidObjectState} Бросает исключение если элемент не был сгенерирован
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Object} Возвращает сгенерированное представление элемента
			 */
			generateItem: function(config) {
				var clonedConfig = Terrasoft.deepClone(config);
				var result = (this.hasItemCustomGenerator(clonedConfig))
					? this.generateCustomItem(clonedConfig)
					: this.generateStandardItem(clonedConfig);
				if (Ext.isEmpty(result)) {
					var errorMessage = Ext.String.format(
						resources.localizableStrings.GeneratedItemIsEmptyMessage,
						Terrasoft.encode(clonedConfig)
					);
					throw new Terrasoft.InvalidObjectState({
						message: errorMessage
					});
				}
				return result;
			},

			/**
			 * Генерирует представление элемента c помощью пользовательской функции
			 * @protected
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Object} Возвращает сгенерированное представление элемента
			 */
			generateCustomItem: function(config) {
				var name = config.name;
				var generator = this.customGenerators[name];
				var generatorFn = generator.generatorFn || generator;
				var generatorScope = generator.scope || config;
				return generatorFn.call(generatorScope, config, this.generateConfig);
			},

			/**
			 * Генерирует представление элемента
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Object} Возвращает сгенерированное представление элемента
			 */
			generateStandardItem: function(config) {
				var itemType = config.itemType;
				var result = null;
				switch (itemType) {
					case Terrasoft.ViewItemType.GRID_LAYOUT:
						result = this.generateGridLayout(config);
						break;
					case Terrasoft.ViewItemType.TAB_PANEL:
						result = this.generateTabPanel(config);
						break;
					case Terrasoft.ViewItemType.IMAGE_TAB_PANEL:
						result = this.generateImageTabPanel(config);
						break;
					case Terrasoft.ViewItemType.DETAIL:
						result = this.generateDetail(config);
						break;
					case Terrasoft.ViewItemType.MODULE:
						result = this.generateModule(config);
						break;
					case Terrasoft.ViewItemType.BUTTON:
						result = this.generateButton(config);
						break;
					case Terrasoft.ViewItemType.LABEL:
						result = this.generateLabel(config);
						break;
					case Terrasoft.ViewItemType.CONTAINER:
						result = this.generateContainer(config);
						break;
					case Terrasoft.ViewItemType.MENU:
						result = this.generateMenu(config);
						break;
					case Terrasoft.ViewItemType.MENU_ITEM:
						result = this.generateMenuItem(config);
						break;
					case Terrasoft.ViewItemType.MENU_SEPARATOR:
						result = this.generateSeparatorMenuItem(config);
						break;
					case Terrasoft.ViewItemType.MODEL_ITEM:
						result = this.generateModelItem(config);
						break;
					case Terrasoft.ViewItemType.SECTION_VIEWS:
						result = this.generateSectionViews(config);
						break;
					case Terrasoft.ViewItemType.SECTION_VIEW:
						result = this.generateSectionView(config);
						break;
					case Terrasoft.ViewItemType.GRID:
						result = this.generateGrid(config);
						break;
					case Terrasoft.ViewItemType.CONTROL_GROUP:
						result = this.generateControlGroup(config);
						break;
					case Terrasoft.ViewItemType.RADIO_GROUP:
						result = this.generateRadioGroup(config);
						break;
					case Terrasoft.ViewItemType.DESIGN_VIEW:
						result = this.generateDesignedView(config);
						break;
					case Terrasoft.ViewItemType.SCHEDULE_EDIT:
						result = this.generateScheduleEdit(config);
						break;
					case Terrasoft.ViewItemType.COLOR_BUTTON:
						result = this.generateColorButton(config);
						break;
					case Terrasoft.ViewItemType.HYPERLINK:
						result = this.generateHyperlink(config);
						break;
					default:
						result = this.generateModelItem(config);
						break;
				}
				return result;
			},

			/**
			 * Генерирует уникальный идентификатор элемента управления
			 * на основе имени конфигурации элемента и имени класса.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы.
			 * @param {String} className Имя класса элемента управления.
			 * @return {String} Возвращает сгенерированные представления элементов сетки.
			 */
			getControlId: function(config, className) {
				return (this.schemaName + config.name + this.defaultControlSuffix[className]);
			},

			/**
			 * Добавляет идентификатор к конфигурации элемента управления.
			 * @protected
			 * @virtual
			 * @param {Object} control Конфигурация элемента управления.
			 * @param {Object} config Конфигурация элемента представления схемы.
			 */
			applyControlId: function(control, config, id) {
				if (config.generateId !== false) {
					Ext.apply(control, {id: id});
				}
			},

			/**
			 * Возвращает конфигурацию элемента без системных параметров
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @param {String[]} serviceProperties Перечень системных параметров
			 * @return {Object} Возвращает конфигурацию элемента без системных параметров
			 */
			getConfigWithoutServiceProperties: function(config, serviceProperties) {
				var result = Terrasoft.deepClone(config);
				serviceProperties = serviceProperties.concat(
					["name", "itemType", "controlConfig", "items", "layout", "contentType", "bindTo", "dataValueType",
						"generateId"]);
				Terrasoft.each(serviceProperties, function(propertyName) {
					delete result[propertyName];
				}, this);
				return result;
			},

			/**
			 * Возвращает конфигурацию элемента без указаных параметров
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @param {String[]} properties Перечень параметров
			 * @return {Object} Возвращает конфигурацию элемента без указаных параметров
			 */
			getConfigWithoutProperties: function(config, properties) {
				var result = Terrasoft.deepClone(config);
				Terrasoft.each(properties, function(propertyName) {
					delete result[propertyName];
				}, this);
				Terrasoft.each(result, function(obj) {
					if (Ext.isObject(obj) && !Ext.Object.isEmpty(obj)) {
						Terrasoft.each(properties, function(propertyName) {
							delete obj[propertyName];
						}, this);
					}
				}, this);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для сетки {Terrasoft.ViewItemType.GRID_LAYOUT}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация сетки
			 * @return {Object} Возвращает сгенерированное представление сетки
			 */
			generateGridLayout: function(config) {
				var controlId = this.getControlId(config, "Terrasoft.GridLayout");
				var result = {
					className: "Terrasoft.GridLayout",
					items: []
				};
				this.applyControlId(result, config, controlId);
				Terrasoft.each(config.items, function(childItem) {
					result.items = result.items.concat(this.generateGridLayoutItem(childItem));
				}, this);
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, []));
				this.applyControlConfig(result, config);
				return result;
			},

			/**
			 * Расширяет описание положения объекта в сетке значениями по умолчанию
			 * @protected
			 * @param {Object} config Конфигурация элемента представления схемы
			 */
			applyLayoutItemDefaults: function(config) {
				config.layout = Ext.apply({}, config.layout, this.defaultGridLayoutItemConfig);
			},

			/**
			 * Генерирует конфигурацию представления для элементов сетки с учетом их положения
			 * @protected
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Object[]} Возвращает сгенерированные представления элементов сетки
			 */
			generateGridLayoutItem: function(config) {
				this.applyLayoutItemDefaults(config);
				var result = [];
				var items = this.generateItem(config);
				items = Ext.isArray(items) ? items : [items];
				Terrasoft.each(items, function(item) {
					result.push(Ext.apply({item: item}, config.layout));
				}, this);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для вкладок {Terrasoft.ViewItemType.TAB_PANEL}
			 * @protected
			 * @virtual
			 * @param {String} className Класс панели с вкладками.
			 * @param {Object} config Конфигурация вкладок
			 * @return {Object} Возвращает сгенерированное представление вкладок
			 */
			generateTabPanel: function(config, className) {
				var tabPanel = this.generateTabPanelControl(config, className);
				var result = [tabPanel];
				Terrasoft.each(config.tabs, function(tab) {
					result.push(this.generateTabContent(tab));
				}, this);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для вкладок {Terrasoft.ViewItemType.IMAGE_TAB_PANEL}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация вкладок
			 * @return {Object} Возвращает сгенерированное представление вкладок
			 */
			generateImageTabPanel: function(config) {
				return this.generateTabPanel(config, "Terrasoft.ImageTabPanel");
			},

			/**
			 * Генерирует конфигурацию представления для наследников элемента управления вкладок
			 * {Terrasoft.ViewItemType.IMAGE_TAB_PANEL}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация вкладок
			 * @return {Object} Возвращает сгенерированное представление вкладок
			 */
			generateTabPanelControl: function(config, className) {
				if (!className) {
					className = "Terrasoft.TabPanel";
				}
				var controlId = this.getControlId(config, className);
				var tabPanel = {
					className: className,
					tabs: {
						bindTo: this.getTabsCollectionName(config)
					}
				};
				this.applyControlId(tabPanel, config, controlId);
				Ext.apply(tabPanel, this.getConfigWithoutServiceProperties(config, ["tabs", "collection"]));
				this.applyControlConfig(tabPanel, config);
				return tabPanel;
			},

			/**
			 * Генерирует представление одной вкладки для {Terrasoft.ViewItemType.TAB_PANEL}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация вкладки
			 * @return {Object} Возвращает сгенерированное контейнера, содержащего описанные в конфигурации элементы
			 * с связкой на видимость
			 */
			generateTabContent: function(config) {
				var tabContainerName = config.name;
				var result = this.getDefaultContainerConfig(tabContainerName, config);
				result.visible = {bindTo: tabContainerName};
				Terrasoft.each(config.items, function(item) {
					result.items = result.items.concat(this.generateItem(item));
				}, this);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для детали {Terrasoft.ViewItemType.DETAIL}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация детали
			 * @return {Object} Возвращает сгенерированную конфигурацию представление детали
			 */
			generateDetail: function(config) {
				var detailContainerId = this.getControlId(config, "Terrasoft.Container");
				var result = this.getDefaultContainerConfig(detailContainerId, config);
				result.tag = {
					detailName: config.name,
					containerId: detailContainerId
				};
				result.markerValue = config.name + "DetailContainer";
				result.afterrender = { bindTo: this.defaultLoadDetailMethodName };
				result.afterrerender = { bindTo: this.defaultLoadDetailMethodName };
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, []));
				this.applyControlConfig(result, config);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления контейнера для модуля {Terrasoft.ViewItemType.MODULE}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация модуля
			 * @return {Object} Возвращает сгенерированное представление контейнера для модуля
			 */
			generateModule: function(config) {
				var moduleName = config.name;
				var controlConfig = {
					wrapClass: this.moduleClass,
					generateId: config.generateId
				};
				var containerId = moduleName;
				if (config.makeUniqueId === true) {
					containerId = this.getControlId(config, "Terrasoft.Container");
				}
				var result = this.getDefaultContainerConfig(containerId, controlConfig);
				result.tag = {
					containerId: result.id,
					moduleName: config.moduleName
				};
				result.markerValue = {"bindTo": moduleName + "ModuleContainer"};
				if (Ext.isEmpty(config.afterrender)) {
					result.afterrender = {bindTo: this.defaultLoadModuleMethodName};
				}
				if (Ext.isEmpty(config.afterrerender)) {
					result.afterrerender = {bindTo: this.defaultLoadModuleMethodName};
				}
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, ["moduleName", "makeUniqueId"]));
				this.applyControlConfig(result, config);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для контейнера {Terrasoft.ViewItemType.CONTAINER}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация контейнера
			 * @return {Object} Возвращает сгенерированное представление контейнера
			 */
			generateContainer: function(config) {
				var id = this.getControlId(config, "Terrasoft.Container");
				var container = this.getDefaultContainerConfig(id, config);
				Terrasoft.each(config.items, function(childItem) {
					var childItemConfig = this.generateItem(childItem);
					container.items = container.items.concat(childItemConfig);
				}, this);
				Ext.apply(container, this.getConfigWithoutServiceProperties(config, ["wrapClass", "styles"]));
				this.applyControlConfig(container, config);
				return container;
			},

			/**
			 * Генерирует имя колонки модели со списком элементов для выпадающего списка
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {String} Возвращает сгенерированное имя колонки модели
			 */
			getExpandableListName: function(config) {
				return this.getItemBindTo(config) + this.defaultListColumnSuffix;
			},

			/**
			 * Формирует имя маркера
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @returns {String} Возращает сформированое имя маркера
			 */
			getMarkerValue: function(config) {
				if (config.markerValue) {
					return config.markerValue;
				}
				var caption = this.getLabelCaption(config);
				return !Ext.isString(caption)
					? config.name
					: Ext.String.format("{0} {1}", config.name, caption);
			},

			/**
			 * Генерирует конфигурацию представления для подписи {Terrasoft.ViewItemType.LABEL}
			 * @protected
			 * @virtual
			 * @throws {Terrasoft.NullOrEmptyException} Бросает исключение если не было найденно значение заголовка
			 * @param {Object} config Конфигурация подписи
			 * @return {Object} Возвращает сгенерированное представление подписи
			 */
			generateLabel: function(config) {
				var caption = this.getLabelCaption(config);
				if (Ext.isEmpty(caption)) {
					var errorMessage = Ext.String.format(
						resources.localizableStrings.LabelCaptionNullOrEmptyMessage,
						config.name
					);
					throw new Terrasoft.NullOrEmptyException({message: errorMessage});
				}
				var id = this.getControlId(config, "Terrasoft.Label");
				var label = {
					className: "Terrasoft.Label",
					caption: caption,
					markerValue: this.getMarkerValue(config)
				};
				this.applyControlId(label, config, id);
				this.addLabelSizeClass(label, config);
				Ext.apply(label, this.getConfigWithoutServiceProperties(config, ["labelConfig", "labelWrapConfig",
					"controlWrapConfig", "value", "textSize"]));
				if (config.labelConfig) {
					this.addClasses(label, "labelClass", config.labelConfig.classes);
					delete config.labelConfig.classes;
					Ext.merge(label, config.labelConfig);
				}
				return label;
			},

			/**
			 * Генерирует конфигурацию представления для гиперссылки {Terrasoft.ViewItemType.HYPERLINK}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация гиперссылки.
			 * @return {Object} Возвращает сгенерированное представление гиперссылки.
			 */
			generateHyperlink: function(config) {
				var id = this.getControlId(config, "Terrasoft.Hyperlink");
				var hyperlink = {
					className: "Terrasoft.Hyperlink",
					markerValue: this.getMarkerValue(config)
				};
				this.applyControlId(hyperlink, config, id);
				this.addLabelSizeClass(hyperlink, config);
				Ext.apply(hyperlink, this.getConfigWithoutServiceProperties(config, []));
				return hyperlink;
			},

			/**
			 * Добавляет css класс, отвечающий за установленный размер подписи
			 * @protected
			 * @virtual
			 * @param {Object} label Конфигурация представления подписи
			 * @param {Object} config Конфигурация подписи
			 */
			addLabelSizeClass: function(label, config) {
				var textSizeClasses = (config.textSize === Terrasoft.TextSize.LARGE)
					? [this.largeTextSizeClass]
					: [this.standardTextSizeClass];
				this.addClasses(label, "labelClass", textSizeClasses);
			},

			/**
			 * Генерирует конфигурацию представления для кнопки {Terrasoft.ViewItemType.BUTTON}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация кнопки
			 * @return {Object} Возвращает сгенерированное представление кнопки
			 */
			generateButton: function(config) {
				var id = this.getControlId(config, "Terrasoft.Button");
				var result = {
					className: "Terrasoft.Button",
					markerValue: config.name
				};
				this.applyControlId(result, config, id);
				var serviceProperties = [];
				if (Ext.isArray(config.menu)) {
					result.menu = this.generateItem({
						itemType: Terrasoft.ViewItemType.MENU,
						items: config.menu
					});
					serviceProperties.push("menu");
				}
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, serviceProperties));
				this.applyControlConfig(result, config);
				return result;
			},

			/**
			 * Возвращает заголовок группы полей
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {String} Заголовок группы полей
			 */
			getControlGroupCaption: function(config) {
				var controlConfig = config.controlConfig;
				return config.caption || (controlConfig && controlConfig.caption);
			},


			/**
			 * Генерирует конфигурацию представления для группы элементов {Terrasoft.ViewItemType.CONTROL_GROUP}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация группы элементов
			 * @return {Object} Возвращает сгенерированное представление группы элементов
			 */
			generateControlGroup: function(config) {
				var controlId = this.getControlId(config, "Terrasoft.ControlGroup");
				var result = {
					className: "Terrasoft.ControlGroup",
					markerValue: this.getControlGroupCaption(config),
					classes: {wrapClass: this.defaultControlGroupClass},
					items: [],
					tools: [],
					collapsedchanged: {
						bindTo: "onCollapsedChanged"
					},
					collapsed: {
						bindTo: "is" + controlId + "Collapsed"
					},
					tag: controlId
				};
				this.applyControlId(result, config, controlId);
				Terrasoft.each(config.items, function(childItem) {
					result.items = result.items.concat(this.generateItem(childItem));
				}, this);
				Terrasoft.each(config.tools, function(childItem) {
					result.tools = result.tools.concat(this.generateItem(childItem));
				}, this);
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, ["tools"]));
				this.applyControlConfig(result, config);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для группы переключателей {Terrasoft.ViewItemType.RADIO_GROUP}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация группы переключателей
			 * @return {Object} Возвращает сгенерированное представление группы переключателей
			 */
			generateRadioGroup: function(config) {
				var containerId = this.getControlId(config, "Terrasoft.Container");
				var result = this.getDefaultContainerConfig(containerId, config);
				Terrasoft.each(config.items, function(item) {
					item.bindTo = config.value;
					result.items.push(this.generateRadioButton(item));
				}, this);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для настраиваемой части представления.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация представления.
			 * @return {Object} Возвращает сгенерированное представление.
			 */
			generateDesignedView: function(config) {
				var id = config.name;
				var container = this.getDefaultContainerConfig(id, config);
				Ext.apply(container, this.getConfigWithoutServiceProperties(config, ["wrapClass", "styles"]));
				this.applyControlConfig(container, config);
				return container;
			},

			/**
			 * Генерирует конфигурацию представления для переключателя
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация переключателя
			 * @return {Object} Возвращает сгенерированное представление переключателя
			 */
			generateRadioButton: function(config) {
				var containerId = this.getControlId(config, "Terrasoft.Container");
				var radioId = this.getControlId(config, "Terrasoft.RadioButton");
				var controlConfig = {
					wrapClass: this.radioButtonContainerClass,
					generateId: config.generateId
				};
				var result = this.getDefaultContainerConfig(containerId, controlConfig);
				var radioButton = {
					className: "Terrasoft.RadioButton",
					tag: config.value,
					checked: config.bindTo
				};
				this.applyControlId(radioButton, config, radioId);
				Ext.apply(radioButton, this.getConfigWithoutServiceProperties(config, ["caption"]));
				this.applyControlConfig(radioButton, config);
				var labelConfig = this.generateLabel(config);
				labelConfig.inputId = radioId + this.radioButtonInputIdSuffix;
				result.items.push(radioButton, labelConfig);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для меню {Terrasoft.ViewItemType.MENU}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация меню
			 * @return {Object} Возвращает сгенерированное представление меню
			 */
			generateMenu: function(config) {
				var result = {
					className: "Terrasoft.Menu",
					items: []
				};
				Terrasoft.each(config.items, function(menuItemConfig) {
					menuItemConfig.itemType = menuItemConfig.itemType || Terrasoft.ViewItemType.MENU_ITEM;
					var childItemConfig = this.generateItem(menuItemConfig);
					result.items.push(childItemConfig);
				}, this);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для элемента меню {Terrasoft.ViewItemType.MENU_ITEM}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента меню
			 * @return {Object} Возвращает сгенерированное представление элемента меню
			 */
			generateMenuItem: function(config) {
				var result = {
					className: "Terrasoft.MenuItem",
					markerValue: config.name
				};
				if (config.menu) {
					result.menu = this.generateItem({
						itemType: Terrasoft.ViewItemType.MENU,
						items: config.menu
					});
				}
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, ["menu"]));
				this.applyControlConfig(result, config);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления разделителя в меню {Terrasoft.ViewItemType.MENU_SEPARATOR}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация разделителя в меню
			 * @return {Object} Возвращает сгенерированное представление разделителя в меню
			 */
			generateSeparatorMenuItem: function(config) {
				var result = {
					className: "Terrasoft.MenuSeparator"
				};
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, []));
				this.applyControlConfig(result, config);
				return result;
			},

			/**
			 * Применяет controlConfig на схему элемента управления
			 * @protected
			 * @param {Object} control Схема элемента управления
			 * @param {Object} config Конфигурация элемента представления схемы
			 */
			applyControlConfig: function(control, config) {
				config.controlConfig = config.controlConfig || {};
				this.addClasses(control, "wrapClass", config.controlConfig.classes);
				delete config.controlConfig.classes;
				Ext.merge(control, config.controlConfig);
			},

			/**
			 * Генерирует конфигурацию представления для {Terrasoft.ViewItemType.MODEL_ITEM}
			 * @protected
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Object} Возвращает сгенерированное представление элемента
			 */
			generateModelItem: function(config) {
				var modelItemWrapId = this.getControlId(config, "Terrasoft.Container");
				var modelItemWrap = this.getDefaultContainerConfig(modelItemWrapId, config);
				if (!Ext.isEmpty(config.visible)) {
					modelItemWrap.visible = config.visible;
				}
				if (this.isItemLabelVisible(config)) {
					var labelWrap = this.generateControlLabelWrap(config);
					var label = this.generateControlLabel(config);
					labelWrap.items.push(label);
					modelItemWrap.items.push(labelWrap);
				}
				var defaultClasses = this.getModelItemContainerClasses(config);
				this.addClasses(modelItemWrap, "wrapClassName", defaultClasses);
				var controlWrap = this.generateEditControlWrap(config);
				var control = this.generateEditControl(config);
				controlWrap.items.push(control);
				modelItemWrap.items.push(controlWrap);
				return modelItemWrap;
			},

			/**
			 * Возвращает информацию об необходимости генерировать подпись для элемента
			 * @protected
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Boolean} Возвращает true если нужно генерировать подпись,
			 * false в противном случае
			 */
			isItemLabelVisible: function(config) {
				return (!config.labelConfig || config.labelConfig.visible !== false);
			},

			/**
			 * Генерирует коллекцию классов для обертки над элементом модели
			 * @protected
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Array[]} Возвращает коллекцию классов для обертки над элементом модели
			 */
			getModelItemContainerClasses: function(config) {
				var result = this.isItemLabelVisible(config)
					? [this.defaultModelItemClass]
					: [this.defaultModelItemClassWithoutLabel];
				if (!config.layout) {
					return result;
				}
				if (config.layout.column === 0) {
					result.push(this.defaultModelItemLeftClass);
				}
				if ((config.layout.column + config.layout.colSpan) === this.maxGridLayoutColumnsCount) {
					result.push(this.defaultModelItemRightClass);
				}
				return result;
			},

			/**
			 * Возвращает текстовое значение заголовка элемента представления схемы
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {String}
			 */
			getLabelCaption: function(config) {
				var labelConfig = config.labelConfig;
				var caption;
				if (config.caption) {
					caption = config.caption;
				} else if (labelConfig && labelConfig.caption) {
					caption = labelConfig.caption;
				} else {
					var column = this.findViewModelColumn(config);
					if (column && column.caption) {
						caption = column.caption;
					}
				}
				return caption;
			},

			/**
			 * Генерирует конфигурацию контейнера заголовка элемента управления
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Object} Возвращает конфигурацию контейнера заголовка элемента управления
			 */
			generateControlLabelWrap: function(config) {
				var labelWrapId = this.getControlId(config, "Terrasoft.Container");
				if (labelWrapId) {
					labelWrapId = labelWrapId + this.defaultLabelWrapSuffix;
				}
				var controlConfig = {
					wrapClass: this.defaultLabelWrapClass,
					generateId: config.generateId
				};
				var labelWrap = this.getDefaultContainerConfig(labelWrapId, controlConfig);
				var labelWrapConfig = config.labelWrapConfig;
				if (labelWrapConfig) {
					var configClasses = labelWrapConfig.classes;
					if (configClasses) {
						var wrapClasses = configClasses.wrapClassName;
						this.addClasses(labelWrap, "wrapClassName", wrapClasses);
						delete labelWrapConfig.classes;
					}
					Ext.merge(labelWrap, labelWrapConfig);
					delete config.labelWrapConfig;
				}
				return labelWrap;
			},

			/**
			 * Генерирует конфигурацию представления заголовка элемента схемы
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Object} Возвращает сгенерированное представление заголовка элемента схемы
			 */
			generateControlLabel: function(config) {
				var label = this.generateLabel(config);
				label.isRequired = Ext.isEmpty(label.isRequired) ? this.isItemRequired(config) : label.isRequired;
				var columnConfig = this.findViewModelColumn(config);
				label.tag = (columnConfig) ? columnConfig.name : "";
				if (columnConfig && columnConfig.dataValueType === Terrasoft.DataValueType.BOOLEAN) {
					label.click = {
						bindTo: "invertColumnValue"
					};
				}
				delete label.href;
				delete label.showValueAsLink;
				delete label.hasClearIcon;
				delete label.timeFormat;
				return label;
			},

			/**
			 * Добавляет переданные css классы в схему элемента управления
			 * @protected
			 * @param {Object} control Схема элемента управления
			 * @param {String} classType Имя свойства схемы классов элемента управления для вставки классов
			 * @param {String[]} classes Массив css классов
			 */
			addClasses: function(control, classType, classes) {
				if (Ext.isEmpty(classes)) {
					return;
				}
				var classesObject = control.classes = control.classes || {};
				var controlClasses = classesObject[classType] || [];
				classesObject[classType] = Ext.Array.merge(controlClasses, classes);
			},

			/**
			 * Возвращает имя параметра модели представления, с которым нужно связать текущий элемент
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {String} Возвращает имя параметра модели представления, с которым нужно связать текущий элемент
			 */
			getItemBindTo: function(config) {
				return (config.bindTo || config.name);
			},

			/**
			 * Возвращает тип данных элемента
			 * @protected
			 * @virtual
			 * @throws {Terrasoft.ItemNotFoundException} Бросает исключение если колонка не была найденна
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Terrasoft.DataValueType} Возвращает тип данных элемент
			 */
			getItemDataValueType: function(config) {
				if (!Ext.isEmpty(config.dataValueType)) {
					return config.dataValueType;
				}
				var entitySchemaColumn = this.findViewModelColumn(config);
				if (Ext.isEmpty(entitySchemaColumn)) {
					var errorMessage = Ext.String.format(
						resources.localizableStrings.CannotFindColumnMassage,
						Terrasoft.encode(config)
					);
					throw new Terrasoft.ItemNotFoundException({
						message: errorMessage
					});
				}
				return entitySchemaColumn.dataValueType;
			},

			/**
			 * Возвращает колонку схемы, к которой была сделана привязка
			 * @protected
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Object} Объект колонки
			 */
			findViewModelColumn: function(config) {
				var bindToProperty = this.getItemBindTo(config);
				return this.viewModelClass.prototype.getColumnByName(bindToProperty);
			},

			/**
			 * Возвращает объект с информацией для связывания элемента управления по умолчанию
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {object} Возвращает объект с связками по умолчанию
			 */
			getAutoBindings: function(config) {
				var result = {
					value: {bindTo: this.getItemBindTo(config)},
					isRequired: this.isItemRequired(config),
					markerValue: this.getMarkerValue(config),
					placeholder: resources.localizableStrings.NotFiledPlaceholderCaption
				};
				if (this.schemaType === Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA) {
					result.focus = {bindTo: this.defaultFocusMethodName};
				}
				return result;
			},

			/**
			 * Возвращает является ли элемент обязательным для заполнения
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Boolean} Возвращает является ли элемент обязательным для заполнения
			 */
			isItemRequired: function(config) {
				var column = this.findViewModelColumn(config);
				return Ext.isEmpty(column) ? false : column.isRequired;
			},

			/**
			 * Генерирует конфигурацию представления для текстового поля
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {object} Возвращает представление текстового поля
			 */
			generateTextEdit: function(config) {
				var className = "";
				switch (config.contentType) {
					case Terrasoft.ContentType.LONG_TEXT:
						className = "Terrasoft.MemoEdit";
						break;
					case Terrasoft.ContentType.RICH_TEXT:
						className = "Terrasoft.HtmlEdit";
						break;
					default:
						className = "Terrasoft.TextEdit";
						break;
				}
				var id = this.getControlId(config, className);
				var textEdit = {
					className: className
				};
				this.applyControlId(textEdit, config, id);
				var defaultBindings = this.getAutoBindings(config);
				if (config.contentType === Terrasoft.ContentType.RICH_TEXT) {
					delete defaultBindings.placeholder;// todo: remove after htmlEdit will use "placeholder"
					//#277633 HtmlEdit: Реализовать работу HtmlEdit с placeholder
				}
				Ext.apply(textEdit, defaultBindings);
				Ext.apply(textEdit, this.getConfigWithoutServiceProperties(config,
					["labelConfig", "labelWrapConfig", "caption", "textSize"]));
				this.applyControlConfig(textEdit, config);
				return textEdit;
			},

			/**
			 * Генерирует конфигурацию представления для целочисленного поля
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {object} Возвращает представление целочисленного поля
			 */
			generateIntegerEdit: function(config) {
				var id = this.getControlId(config, "Terrasoft.IntegerEdit");
				var integerEdit = {
					className: "Terrasoft.IntegerEdit"
				};
				this.applyControlId(integerEdit, config, id);
				var defaultBindings = this.getAutoBindings(config);
				Ext.apply(integerEdit, defaultBindings);
				Ext.apply(integerEdit, this.getConfigWithoutServiceProperties(config,
					["labelConfig", "labelWrapConfig", "caption", "textSize"]));
				this.applyControlConfig(integerEdit, config);
				return integerEdit;
			},

			/**
			 * Генерирует конфигурацию представления для поля с плавающей запятой
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {object} Возвращает представление поля с плавающей запятой
			 */
			generateFloatEdit: function(config) {
				var id = this.getControlId(config, "Terrasoft.FloatEdit");
				var floatEdit = {
					className: "Terrasoft.FloatEdit"
				};
				this.applyControlId(floatEdit, config, id);
				var defaultBindings = this.getAutoBindings(config);
				var column = this.findViewModelColumn(config);
				if (column) {
					Ext.apply(floatEdit, {decimalPrecision: column.precision});
				}
				Ext.apply(floatEdit, defaultBindings);
				Ext.apply(floatEdit, this.getConfigWithoutServiceProperties(config,
					["labelConfig", "labelWrapConfig", "caption", "textSize"]));
				this.applyControlConfig(floatEdit, config);
				return floatEdit;
			},

			/**
			 * Генерирует конфигурацию представления для денежного поля
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {object} Возвращает представление денежного поля
			 */
			generateMoneyEdit: function(config) {
				var id = this.getControlId(config, "Terrasoft.FloatEdit");
				var floatEdit = {
					className: "Terrasoft.FloatEdit",
					decimalPrecision: 2
				};
				this.applyControlId(floatEdit, config, id);
				var defaultBindings = this.getAutoBindings(config);
				Ext.apply(floatEdit, defaultBindings);
				Ext.apply(floatEdit, this.getConfigWithoutServiceProperties(config,
					["labelConfig", "labelWrapConfig", "caption", "textSize"]));
				this.applyControlConfig(floatEdit, config);
				return floatEdit;
			},

			/**
			 * Генерирует конфигурацию представления для поля даты и времени
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {object} Возвращает представление поля даты и времени
			 */
			generateDateTimeEdit: function(config) {
				var dateEdit = this.generateDateEdit(config);
				var timeEdit = this.generateTimeEdit(config);
				this.addClasses(dateEdit, "wrapClass", ["datetime-datecontrol"]);
				this.addClasses(timeEdit, "wrapClass", ["datetime-timecontrol"]);
				var controlContainer = this.getDefaultContainerConfig(config.name + "DateTimeContainer", config);
				controlContainer.items = [dateEdit, timeEdit];
				return controlContainer;
			},

			/**
			 * Генерирует конфигурацию представления для поля даты
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {object} Возвращает представление поля даты
			 */
			generateDateEdit: function(config) {
				var id = this.getControlId(config, "Terrasoft.DateEdit");
				var dateEdit = {
					className: "Terrasoft.DateEdit"
				};
				this.applyControlId(dateEdit, config, id);
				var defaultBindings = this.getAutoBindings(config);
				Ext.apply(dateEdit, defaultBindings);
				Ext.apply(dateEdit, this.getConfigWithoutServiceProperties(config,
					["labelConfig", "labelWrapConfig", "caption", "textSize"]));
				if (config.controlConfig) {
					this.applyControlConfig(dateEdit, config.controlConfig.dateEdit || {});
					delete config.controlConfig.dateEdit;
				}
				var configWithOutTimeEdit = this.getConfigWithoutProperties(config,
					["timeEdit"]);
				this.applyControlConfig(dateEdit, configWithOutTimeEdit);
				return dateEdit;
			},

			/**
			 * Генерирует конфигурацию представления для поля времени
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {object} Возвращает представление поля времени
			 */
			generateTimeEdit: function(config) {
				var id = this.getControlId(config, "Terrasoft.TimeEdit");
				var timeEdit = {
					className: "Terrasoft.TimeEdit"
				};
				this.applyControlId(timeEdit, config, id);
				var defaultBindings = this.getAutoBindings(config);
				Ext.apply(timeEdit, defaultBindings);
				Ext.apply(timeEdit, this.getConfigWithoutServiceProperties(config,
					["labelConfig", "labelWrapConfig", "caption", "textSize"]));
				if (config.controlConfig) {
					this.applyControlConfig(timeEdit, config.controlConfig.timeEdit || {});
					delete config.controlConfig.timeEdit;
				}
				this.applyControlConfig(timeEdit, config);
				return timeEdit;
			},

			/**
			 * Генерирует конфигурацию представления для поля с выпадающим списком
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {object} Возвращает представление поля с выпадающим списком
			 */
			generateEnumEdit: function(config) {
				var id = this.getControlId(config, "Terrasoft.ComboBoxEdit");
				var enumEdit = {
					className: "Terrasoft.ComboBoxEdit",
					list: {
						bindTo: this.getExpandableListName(config)
					}
				};
				this.applyControlId(enumEdit, config, id);
				var defaultBindings = this.getAutoBindings(config);
				Ext.apply(enumEdit, defaultBindings);
				Ext.apply(enumEdit, this.getConfigWithoutServiceProperties(config,
					["labelConfig", "labelWrapConfig", "caption", "textSize"]));
				this.applyControlConfig(enumEdit, config);
				return enumEdit;
			},

			/**
			 * Генерирует конфигурацию представления для справочного поля.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы.
			 * @return {object} Конфигурация представления справочного поля.
			 */
			generateLookupEdit: function(config) {
				var contentType = config.contentType;
				if ((contentType && (contentType !== Terrasoft.ContentType.LOOKUP)) || !contentType) {
					var viewModelColumn = this.findViewModelColumn(config);
					if (viewModelColumn && viewModelColumn.isSimpleLookup) {
						contentType = Terrasoft.ContentType.ENUM;
					}
				}
				if (contentType && contentType === Terrasoft.ContentType.ENUM) {
					return this.generateEnumEdit(config);
				}
				var id = this.getControlId(config, "Terrasoft.LookupEdit");
				var lookupEdit = {
					className: "Terrasoft.LookupEdit",
					list: {
						bindTo: this.getExpandableListName(config)
					},
					tag: this.getItemBindTo(config),
					loadVocabulary: {
						bindTo: this.loadVocabularyMethodName
					},
					change: {
						bindTo: "onLookupChange"
					},
					href: { bindTo: "getLinkUrl" },
					linkclick: { bindTo: "onLinkClick" },
					showValueAsLink: true,
					hasClearIcon: true
				};
				this.applyControlId(lookupEdit, config, id);
				var defaultBindings = this.getAutoBindings(config);
				Ext.apply(lookupEdit, defaultBindings);
				Ext.apply(lookupEdit, this.getConfigWithoutServiceProperties(config,
					["loadVocabularyMethodName", "labelConfig", "labelWrapConfig", "caption", "textSize"]));
				this.applyControlConfig(lookupEdit, config);
				return lookupEdit;
			},

			/**
			 * Генерирует конфигурацию представления для логического поля
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {object} Возвращает представление логического поля
			 */
			generateBooleanEdit: function(config) {
				var id = this.getControlId(config, "Terrasoft.CheckBoxEdit");
				var checkBoxEdit = {
					className: "Terrasoft.CheckBoxEdit",
					checked: {
						bindTo: this.getItemBindTo(config)
					},
					markerValue: this.getMarkerValue(config)
				};
				this.applyControlId(checkBoxEdit, config, id);
				if (this.schemaType === Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA) {
					checkBoxEdit.focus = { bindTo: this.defaultFocusMethodName };
				}
				Ext.apply(checkBoxEdit, this.getConfigWithoutServiceProperties(config,
					["labelConfig", "labelWrapConfig", "caption", "textSize"]));
				this.applyControlConfig(checkBoxEdit, config);
				return checkBoxEdit;
			},

			/**
			 * Генерирует конфигурацию представления индикатора прогресса
			 * @protected
			 * @overridden
			 * @param {Object} config Конфигурация элемента индикатор прогресса
			 * @return {Object} Возвращает сгенерированное представление поля элемента схемы
			 */
			generateStageIndicator: function(config) {
				var id = this.getControlId(config, "Terrasoft.BaseProgressBar");
				var stageIndicator = {
					className: "Terrasoft.BaseProgressBar",
					markerValue: this.getMarkerValue(config)
				};
				this.applyControlId(stageIndicator, config, id);
				Ext.apply(stageIndicator, this.getConfigWithoutServiceProperties(config,
					["labelConfig", "labelWrapConfig", "caption", "isRequired", "generator"]));
				this.applyControlConfig(stageIndicator, config);
				return stageIndicator;
			},

			/**
			 * Генерирует конфигурацию контейнера элемента управления
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы
			 * @return {Object} Возвращает конфигурацию контейнера элемента управления
			 */
			generateEditControlWrap: function(config) {
				var controlWrapId = this.getControlId(config, "Terrasoft.Container");
				if (controlWrapId) {
					controlWrapId = controlWrapId + this.defaultControlWrapSuffix;
				}
				var controlConfig = {
					wrapClass: this.defaultControlWrapClass,
					generateId: config.generateId
				};
				var controlWrap = this.getDefaultContainerConfig(controlWrapId, controlConfig);
				var controlWrapConfig = config.controlWrapConfig;
				if (controlWrapConfig) {
					var configClasses = controlWrapConfig.classes;
					if (configClasses) {
						var wrapClasses = configClasses.wrapClassName;
						this.addClasses(controlWrap, "wrapClassName", wrapClasses);
						delete config.controlWrapConfig.classes;
					}
					Ext.merge(controlWrap, controlWrapConfig);
					delete config.controlWrapConfig;
				}
				return controlWrap;
			},

			/**
			 * Генерирует конфигурацию представления поля элемента схемы.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления схемы.
			 * @return {Object/Array} Возвращает сгенерированное представление поля элемента схемы.
			 */
			generateEditControl: function(config) {
				var itemDataValueType = this.getItemDataValueType(config);
				var controlConfig;
				switch (itemDataValueType) {
					case Terrasoft.DataValueType.TEXT:
						controlConfig = this.generateTextEdit(config);
						break;
					case Terrasoft.DataValueType.INTEGER:
						controlConfig = this.generateIntegerEdit(config);
						break;
					case Terrasoft.DataValueType.FLOAT:
						controlConfig = this.generateFloatEdit(config);
						break;
					case Terrasoft.DataValueType.MONEY:
						controlConfig = this.generateMoneyEdit(config);
						break;
					case Terrasoft.DataValueType.DATE_TIME:
						controlConfig = this.generateDateTimeEdit(config);
						break;
					case Terrasoft.DataValueType.DATE:
						controlConfig = this.generateDateEdit(config);
						break;
					case Terrasoft.DataValueType.TIME:
						controlConfig = this.generateTimeEdit(config);
						break;
					case Terrasoft.DataValueType.LOOKUP:
						controlConfig = this.generateLookupEdit(config);
						break;
					case Terrasoft.DataValueType.ENUM:
						controlConfig = this.generateEnumEdit(config);
						break;
					case Terrasoft.DataValueType.BOOLEAN:
						controlConfig = this.generateBooleanEdit(config);
						break;
					case Terrasoft.DataValueType.STAGE_INDICATOR:
						controlConfig = this.generateStageIndicator(config);
						break;
					default:
						var errorMessage = Ext.String.format(
							resources.localizableStrings.UnsupportedDataValueTypeMessage,
							Ext.Object.getKey(Terrasoft.DataValueType, itemDataValueType));
						throw new Terrasoft.UnsupportedTypeException({message: errorMessage});
				}
				return controlConfig;
			},

			/**
			 * Генерирует конфигурацию представления контейнера {Terrasoft.Container}.
			 * @protected
			 * @virtual
			 * @param {String} id Уникальный идентификатор на странице.
			 * @param {Object} config Конфигурация элемента представления схемы.
			 * @param {String} config.wrapClass СSS классы контейнера.
			 * @param {Object} config.styles СSS стили контейнера.
			 * @return {Object} Возвращает сгенерированное представление контейнера.
			 */
			getDefaultContainerConfig: function(id, config) {
				var wrapClass = config.wrapClass;
				var styles = config.styles;
				var container = {
					className: "Terrasoft.Container",
					items: []
				};
				this.applyControlId(container, config, id);
				if (!Ext.isEmpty(styles)) {
					container.styles = {wrapStyles: styles};
				}
				if (!Ext.isEmpty(wrapClass)) {
					container.classes = {wrapClassName: wrapClass};
				}
				return container;
			},

			/**
			 * Генерирует конфигурацию представления для Terrasoft.ViewItemType.SECTION_VIEWS
			 * @protected
			 * @virtual
			 * @param {Object} config Описание элемента представления
			 * @return {Object} Конфигурация представлений
			 */
			generateSectionViews: function(config) {
				return this.generateContainer(config);
			},

			/**
			 * Генерирует конфигурацию представления для Terrasoft.ViewItemType.SECTION_VIEW
			 * @protected
			 * @virtual
			 * @param {Object} config Описание элемента представления
			 * @return {Object} Конфигурация представления
			 */
			generateSectionView: function(config) {
				var container = this.generateContainer(config);
				var visible = Ext.String.format(this.dataViewVisiblePropertyTemplate, config.name);
				container.visible = {bindTo: visible};
				Ext.apply(container, this.getConfigWithoutServiceProperties(config, []));
				this.applyControlConfig(container, config);
				return container;
			},

			/**
			 * Получает начальную конфигурацию реестра
			 * @private
			 * @param {Object} config Конфигурационный объект
			 * @returns {Object}
			 */
			getDefaultGridConfig: function(config) {
				var className = "Terrasoft.Grid";
				var id = this.getControlId(config, className);
				var gridConfig = {
					className: className
				};
				this.applyControlId(gridConfig, config, id);
				return gridConfig;
			},

			/**
			 * Генерирует конфигурацию заголовка в ячейке плиточного реестра
			 * @param {Object} gridConfig Конфигурация реестра
			 * @param {Object} columnConfig Конфигурация колонки реестра
			 * @return {Object} Возвращает конфигурацию заголовка в ячейке
			 */
			generateTiledCellCaption: function(gridConfig, columnConfig) {
				var captionConfig = Ext.apply({}, columnConfig.captionConfig, this.defaultGridCellCaptionConfig);
				if (gridConfig.type !== Terrasoft.GridType.TILED || !captionConfig.visible) {
					return null;
				}
				var name = this.getGridColumnCaption(columnConfig);
				if (!name) {
					return null;
				}
				return {
					type: !!gridConfig.isVertical ? Terrasoft.GridKeyType.LABEL : Terrasoft.GridKeyType.CAPTION,
					name: name
				};
			},

			/**
			 * Генерирует конфигурацию значения в ячейке
			 * @param {Object} config Конфигурация колонки
			 * @return {Object} Возвращает конфигурацию значения в ячейке
			 */
			generateGridCellValue: function(config) {
				var cellValue = {};
				var type = config.type;
				cellValue.name = config.value || {bindTo: config.bindTo};
				switch (type) {
					case Terrasoft.GridCellType.LINK:
						cellValue.name = {bindTo: "on" + config.bindTo + "LinkClick"};
						cellValue.type = Terrasoft.GridKeyType.LINK;
						break;
					case Terrasoft.GridCellType.TITLE:
						cellValue.type = Terrasoft.GridKeyType.TITLE;
						break;
					default:
						cellValue.type = Terrasoft.GridKeyType.TEXT;
						break;
				}
				return cellValue;
			},

			/**
			 * Сортирует колоноки в рамках одной строки реестра по позиции относительно левого края.
			 * В конфигурацию реестра текущей реализации колонки необходимо добавлять по порядку
			 * @protected
			 * @param {Array} columns Массив колонок строки
			 */
			sortGridRowColumns: function(columns) {
				columns.sort(function(first, second) {
					var firstColumn = first.position.column;
					var secondColumn = second.position.column;
					if (firstColumn > secondColumn) {
						return 1;
					}
					if (firstColumn < secondColumn) {
						return -1;
					}
					return 0;
				});
			},

			/**
			 * Получает значение заголовка колонки в реестре
			 * @protected
			 * @param {Object} config Конфигурация колонки
			 * @return {String} Возвращает значение заголовка колонки в реестре
			 */
			getGridColumnCaption: function(config) {
				if (config.caption) {
					return config.caption;
				}
				var viewModelColumn = this.findViewModelColumn(config);
				if (viewModelColumn) {
					return viewModelColumn.caption;
				}
				return null;
			},

			/**
			 * Генерирует конфигурацию заголовка колонки списочного реестра
			 * @protected
			 * @param {Object} config Конфигурация колонки
			 * @return {Object} Возвращает конфигурацию заголовка колонки списочного реестра
			 */
			generateGridCaptionConfig: function(config) {
				var position = config.position;
				var cols = position.colSpan;
				var name = this.getGridColumnCaption(config);
				return {
					cols: cols,
					name: name
				};
			},

			/**
			 * Генерирует конфигурацию заголовков списочного реестра
			 * @protected
			 * @param {Array} columns Конфигурация колонки
			 * @return {Array} Возвращает конфигурацию заголовков списочного реестра
			 */
			generateGridCaptionsConfig: function(columns) {
				var captionsConfig = [];
				this.sortGridRowColumns(columns);
				Terrasoft.each(columns, function(column) {
					var captionConfig = this.generateGridCaptionConfig(column);
					captionsConfig.push(captionConfig);
				}, this);
				return captionsConfig;
			},

			/**
			 * Получает колонки соответствующие указанной строке реестра
			 * @protected
			 * @param {Object} config Конфигурация колонок
			 * @param {Number} rowIndex Порядковый номер строки
			 * @return {Array} Возвращает колонки соответствующие указанной строке реестра
			 */
			getGridRowColumns: function(config, rowIndex) {
				return config.items.filter(function(column) {
					var position = column.position;
					return (position.row === rowIndex);
				});
			},

			/**
			 * Генерирует конфигурацию строки реестра
			 * @protected
			 * @param {Object} gridConfig Конфигурация реестра
			 * @param {Object} columns Конфигурация колонок
			 * @return {Array} Возвращает конфигурацию строки реестра
			 */
			generateGridRowConfig: function(gridConfig, columns) {
				var rowConfig = [];
				this.sortGridRowColumns(columns);
				Terrasoft.each(columns, function(column) {
					var cellConfig = this.generateGridCell(gridConfig, column);
					rowConfig.push(cellConfig);
				}, this);
				return rowConfig;
			},

			/**
			 * Генерирует конфигурацию ячейки реестра
			 * @protected
			 * @param {Object} gridConfig Конфигурация реестра
			 * @param {Object} columnConfig Конфигурация колонки
			 * @return {Object} Возвращает конфигурацию ячейки реестра
			 */
			generateGridCell: function(gridConfig, columnConfig) {
				var cols = columnConfig.position.colSpan;
				var key = [];
				var cellCaption = this.generateTiledCellCaption(gridConfig, columnConfig);
				var cellValue = this.generateGridCellValue(columnConfig);
				if (!!gridConfig.isVertical) {
					return this.generateVerticalGridCellConfig(cellCaption, cellValue, cols);
				}
				if (cellCaption) {
					key.push(cellCaption);
				}
				if (cellValue) {
					key.push(cellValue);
				}
				var cellConfig = {
					cols: cols,
					key: key
				};
				var aggregationType = columnConfig.aggregationType;
				if (!Ext.isEmpty(aggregationType)) {
					cellConfig.aggregationType = aggregationType;
				}
				return cellConfig;
			},

			/**
			 * Генерирует конфигурацию ячейки вертикального реестра
			 * @protected
			 * @param {Object} cellCaption заголовок ячейки
			 * @param {Object} cellValue значение ячейки
			 * @param {Object} colsCount ширина ячейки
			 * @return {Array} Возвращает конфигурацию ячейки вертикального реестра
			 */
			generateVerticalGridCellConfig: function(cellCaption, cellValue, colsCount) {
				var config = [];
				if (cellCaption) {
					var captionColsCount = parseInt(colsCount / 100 * 40, 10);
					config.push({cols: captionColsCount, key: [cellCaption]});
					colsCount -= captionColsCount;
				}
				if (cellValue) {
					config.push({cols: colsCount, key: [cellValue]});
				}
				return config;
			},

			/**
			 * Актуализирует списочную конфигурацию реестра старого типа, согласно новой
			 * @protected
			 * @param gridConfig Конфигурация реестра
			 */
			actualizeListedGridConfig: function(gridConfig) {
				var listedConfig = gridConfig.listedConfig;
				var listedConfigItems = listedConfig.items;
				var captionsConfig = this.generateGridCaptionsConfig(listedConfigItems);
				var columnsConfig = this.generateGridRowConfig(gridConfig, listedConfigItems);
				gridConfig.listedConfig = {
					captionsConfig: captionsConfig,
					columnsConfig: columnsConfig
				};
				this.addLinks(gridConfig.listedConfig, false);
			},

			/**
			 * Добавляет свойство link к колонкам
			 * @param gridConfig
			 * @param isTiled
			 */
			addLinks: function(gridConfig, isTiled) {
				gridConfig.columnsConfig.forEach(function(row) {
					if (!isTiled) {
						row = gridConfig.columnsConfig;
					}
					var viewModel = this.viewModelClass && this.viewModelClass.prototype ?
						this.viewModelClass.prototype :
						this.viewModelClass;
					var columns = viewModel.columns;
					var primaryDisplayColumnName = viewModel.entitySchema &&
						viewModel.entitySchema.primaryDisplayColumnName;
					Terrasoft.each(row, function(cell) {
						var item = Ext.isArray(cell) ? cell : [cell];
						Terrasoft.each(item, function(cellItem) {
							var itemKey = cellItem.key;
							var columnName;
							var columnType;
							Terrasoft.each(itemKey, function(element) {
								if (element && element.name && element.name.bindTo) {
									var keySplitter = "#";
									var columnKeySplittedArray = element.name.bindTo.split(keySplitter);
									columnName = columnKeySplittedArray[0];
									if (element.type) {
										columnType = element.type;
									}
								}
							}, this);
							var column = columns[columnName] || {};
							var entitySchema = viewModel.entitySchema || {};
							var moduleSchemaConfig = moduleUtils.getModuleStructureByName(entitySchema.name);
							if (moduleSchemaConfig && (primaryDisplayColumnName === columnName ||
								LinkColumnHelper.getIsLinkColumn(viewModel.entitySchema.name, columnName))) {
								cellItem.link = {bindTo: "on" + columnName + "LinkClick"};
							}
							var referenceSchemaName = column.referenceSchemaName;
							if (column.isLookup && referenceSchemaName) {
								var moduleStructure = moduleUtils.getModuleStructureByName(referenceSchemaName);
								var entityStructure = moduleUtils.getEntityStructureByName[referenceSchemaName];
								if (entityStructure && moduleStructure && Ext.isArray(entityStructure.pages) &&
									entityStructure.pages.length > 0) {
									cellItem.link = {bindTo: "on" + columnName + "LinkClick"};
								}
							}
							if (Ext.isEmpty(cellItem.link) && (columnType !== Terrasoft.GridKeyType.LINK)) {
								cellItem.link = {bindTo: "on" + columnName + "LinkClick"};
							}
						}, this);
					}, this);
					if (!isTiled) {
						return false;
					}
				}, this);
			},

			/**
			 * Актуализирует плиточную конфигурацию реестра старого типа, согласно новой
			 * @protected
			 * @param {Object} gridConfig Конфигурация реестра
			 */
			actualizeTiledGridConfig: function(gridConfig) {
				var tiledConfig = gridConfig.tiledConfig;
				var columnsConfig = [];
				var initialIndex = 1;
				var rowsCount = tiledConfig.grid.rows;
				for (var rowIndex = initialIndex; rowIndex < rowsCount + initialIndex; rowIndex++) {
					var columns = this.getGridRowColumns(tiledConfig, rowIndex);
					var rowConfig = this.generateGridRowConfig(gridConfig, columns);
					if (rowConfig.length) {
						columnsConfig.push(rowConfig);
					}
				}
				gridConfig.tiledConfig = {
					columnsConfig: columnsConfig
				};
				if (!gridConfig.isVertical) {
					this.addLinks(gridConfig.tiledConfig, true);
				}
			},

			/**
			 * Актуализирует конфигурацию реестра старого типа, согласно новой
			 * @protected
			 * @param {Object} config Конфигурация реестра
			 */
			actualizeGridConfig: function(config) {
				this.actualizeListedGridConfig(config);
				this.actualizeTiledGridConfig(config);
			},

			/**
			 * Генерирует конфигурацию представления для Terrasoft.ViewItemType.GRID
			 * @protected
			 * @virtual
			 * @param config Описание элемента представления
			 * @return {Object} Конфигурация реестра
			 */
			generateGrid: function(config) {
				var gridConfig = this.getDefaultGridConfig(config);
				var profile = this.schemaProfile[config.name];
				if (profile && profile.listedConfig && profile.tiledConfig) {
					if (profile.type) {
						config.type = profile.type;
					}
					config.listedConfig = Ext.decode(profile.listedConfig);
					config.tiledConfig = Ext.decode(profile.tiledConfig);
					this.actualizeGridConfig(config);
				} else if (profile && profile.listedColumnsConfig && profile.tiledColumnsConfig) {
					config.type = profile.isTiled ? Terrasoft.GridType.TILED : Terrasoft.GridType.LISTED;
					config.listedConfig = {
						columnsConfig: Ext.decode(profile.listedColumnsConfig),
						captionsConfig: Ext.decode(profile.captionsConfig)
					};
					config.tiledConfig = {
						columnsConfig:  Ext.decode(profile.tiledColumnsConfig)
					};
				} else {
					if (config.listedConfig && config.tiledConfig) {
						this.actualizeGridConfig(config);
					}
				}
				if (config.activeRowActions) {
					Terrasoft.each(config.activeRowActions, function(item) {
						item.markerValue = item.markerValue || item.caption;
					});
				}
				if (config.needLoadData) {
					config.watchRowInViewport = 2;
					config.watchedRowInViewport = config.needLoadData;
				}
				Ext.apply(gridConfig, this.getConfigWithoutServiceProperties(config, ["needLoadData"]));
				this.applyControlConfig(gridConfig, config);
				return gridConfig;
			},

			/**
			 * Генерирует конфигурацию представления для Terrasoft.ViewItemType.SCHEDULE_EDIT
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация элемента представления
			 * @return {Object} Возвращает конфигурацию расписания
			 */
			generateScheduleEdit: function(config) {
				var className = "Terrasoft.ScheduleEdit";
				var result = {
					className: className,
					bottomPadding: this.defaultScheduleEditBottomPadding
				};
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, []));
				this.applyControlConfig(result, config);
				return result;
			},

			/**
			 * Генерирует конфигурацию представления для кнопки выбора цвета {Terrasoft.ViewItemType.COLOR_BUTTON}
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация кнопки цвета
			 * @return {Object} Возвращает сгенерированное представление кнопки цвета
			 */
			generateColorButton: function(config) {
				var id = this.getControlId(config, "Terrasoft.ColorButton");
				var result = {
					className: "Terrasoft.ColorButton",
					markerValue: config.name
				};
				this.applyControlId(result, config, id);
				Ext.apply(result, this.getConfigWithoutServiceProperties(config, []));
				this.applyControlConfig(result, config);
				return result;
			},

			/**
			 * Инициализирует внутренние параметры профиля и класса модели представления генератора.
			 * @protected
			 * @overridden
			 * @param {Object} config Конфигурация построения схемы.
			 */
			init: function(config) {
				this.callParent(arguments);
				var schema = config.schema;
				this.schemaProfile = schema.profile || [];
				this.viewModelClass = config.viewModelClass;
			},

			/**
			 * Синхронно генерирует часть представления.
			 * @param {Object} viewConfig Конфигурация представления.
			 * @param config
			 * @param {String} config.schemaName Имя схемы.
			 * @param {Class} config.viewModelClass Класс модели представления.
			 * @return {Object[]} Возвращает сгенерированное представление схемы.
			 */
			generatePartial: function(viewConfig, config) {
				this.init(config);
				if (this.schemaType === Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA) {
					BusinessRulesApplier.applyRules(this.viewModelClass, viewConfig);
				}
				delete viewConfig.generator;
				var view = this.generateView([viewConfig]);
				this.clear();
				return view;
			},

			/**
			 * Очищает внутренние параметры профиля,
			 * пользовательских генераторов и класса модели представления генератора.
			 * @protected
			 * @overridden
			 */
			clear: function() {
				this.callParent(arguments);
				this.viewModelClass = null;
				this.customGenerators = null;
				this.schemaProfile = null;
			},

			/**
			 * Получает все схемы по иерархии и генерирует классы ViewModel.
			 * @overridden
			 * @param config
			 * @param {String} config.schemaName Имя схемы.
			 * @param {Class} config.viewModelClass Класс модели представления.
			 * @param {Function} callback Функция-callback.
			 * @param {Object} scope Контекст выполнения функции callback.
			 */
			generate: function(config, callback, scope) {
				var schema = config.schema;
				var combinedViewConfig = schema.viewConfig;
				this.callParent([config, function() {
					if (this.schemaType === Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA) {
						BusinessRulesApplier.applyRules(this.viewModelClass, combinedViewConfig);
					}
					this.requireCustomGenerators(combinedViewConfig, function() {
						var viewConfig = this.generateView(combinedViewConfig);
						this.clear();
						callback.call(scope, viewConfig);
					}, this);
				}, this]);
			}
		});

		return Ext.create(viewGenerator);

	}
);
