define("DashboardDesigner", ["ext-base", "DashboardDesignerResources", "DesignViewModelV2",
	"PageDesignerUtilities", "DashboardDesignViewGeneratorV2", "BaseSchemaModuleV2", "DashboardModule"],
	function(Ext, resources, DesignViewModelV2, pageDesignerUtilities) {

		/**
		 * @class Terrasoft.configuration.DashboardViewConfig
		 * Класс генерурующий конфигурацию представления для модуля дизайнера итога.
		 */
		Ext.define("Terrasoft.configuration.DashboardDesignerViewConfig", {
			extend: "Terrasoft.DashboardViewConfig",
			alternateClassName: "Terrasoft.DashboardDesignerViewConfig",

			/**
			 * Генерирует конфигурацию представления модуля итогов.
			 * @returns {Object[]} Возвращает конфигурацию представления модуля итогов.
			 */
			generate: function() {
				var itemsConfig = this.callParent(arguments);
				Terrasoft.each(itemsConfig, function(itemConfig) {
					itemConfig.generator = "DashboardDesignViewGeneratorV2.generatePartial";
				}, this);
				var viewConfig = [{
					"name": "ToolsContainer",
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["dashboard-tools-container"],
					"items": [{
						"name": "SaveButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.SaveButtonCaption"},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"click": {"bindTo": "save"}
					}, {
						"name": "CancelButton",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.CancelButtonCaption"},
						"click": {bindTo: "cancel"}
					}]
				}, {
					"name": "ConfigContainer",
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["dashboard-config-container"],
					"items": [{
						"name": "caption",
						"itemType": Terrasoft.ViewItemType.MODEL_ITEM,
						"dataValueType": Terrasoft.DataValueType.TEXT,
						"isRequired": true,
						"labelConfig": {
							"caption": {"bindTo": "Resources.Strings.CaptionFieldCaption"}
						}
					}]
				}, {
					"name": "dashboardView",
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"items": itemsConfig
				}];
				return viewConfig;
			}
		});

		/**
		 * Объявляем класс базового дизайнера.
		 */
		var dashboardClass = Ext.ClassManager.get("Terrasoft.BaseDashboardViewModel");
		DesignViewModelV2.define("BaseDashboardDesignerViewModel", dashboardClass);

		/**
		 * @class Terrasoft.configuration.DashboardModule
		 * Класс визуального модуля дизайнера итогов.
		 */
		Ext.define("Terrasoft.configuration.DashboardDesignerViewModel", {
			extend: "Terrasoft.BaseDashboardDesignerViewModel",
			alternateClassName: "Terrasoft.DashboardDesignerViewModel",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			constructor: function(config) {
				if (!this.columns) {
					this.columns = {};
				}
				var dashboardPropertiesAttributes = Terrasoft.DashboardManager.getPropertiesAttributes();
				this.entitySchema = (config.Ext || Ext).create("Terrasoft.BaseEntitySchema", {
					"columns": dashboardPropertiesAttributes
				});
				Ext.apply(this.columns, dashboardPropertiesAttributes);
				Ext.merge(this.columns, {
					"id": {"isRequired": false},
					"items": {"dataValueType": Terrasoft.DataValueType.CUSTOM_OBJECT}
				});
				this.callParent(arguments);
				this.initResourcesValues(resources);
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
			 * Инициализирует заголовок страницы.
			 * @protected
			 * @virtual
			 */
			initHeader: function() {
				var dashboard = this.getDashboard();
				var caption = dashboard.getIsNew()
					? this.get("Resources.Strings.NewItemCaption")
					: Terrasoft.getFormattedString(this.get("Resources.Strings.ExistingItemCaption"),
					dashboard.getCaption());
				this.sandbox.publish("InitDataViews", {caption: caption});
				this.initContextHelp();
			},

			/**
			 * Инициализирует контекстную справку.
			 * @protected
			 * @virtual
			 */
			initContextHelp: function() {
				var contextHelpId = 1013;
				this.sandbox.publish("InitContextHelp", contextHelpId);
			},

			/**
			 * Обработчик нажатия кнопки "Отмена".
			 * @protected
			 * @virtual
			 */
			cancel: function() {
				var sandbox = this.sandbox;
				sandbox.publish("BackHistoryState");
			},

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
			 */
			init: function(callback, scope) {
				this.initHeader();
				var dashboard = this.getDashboard();
				this.set("caption", dashboard.getCaption());
				this.set("sectionId", dashboard.getSectionId());
				this.set("items", dashboard.getItems());
				this.set("schema", {
					viewConfig: dashboard.getViewConfig()
				});
				this.on("change:schema", this.onSchemaChange, this);
				this.on("change:items", this.onItemsChange, this);
				this.on("change:selectedItem", this.onSelectedItemChanged, this);
				this.initModulesCaptions();
				this.registerWidgetMessages();
				callback.call(scope);
				this.set("isInitialized", true, {silent: true});
			},

			/**
			 * Инициализирует заголовки для элементов сетки.
			 * @protected
			 * @virtual
			 */
			initModulesCaptions: function() {
				var items = this.get("items");
				Terrasoft.each(items, function(itemConfig, itemName) {
					var defaultModuleCaption =
						this.get("Resources.Strings.ModulePrefix") +
							(itemConfig.moduleName || itemConfig.parameters.moduleName);
					var moduleCaption = itemConfig.caption ||
						itemConfig.parameters.caption ||
						defaultModuleCaption;
					this.set(itemName + "Caption", moduleCaption);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseDashboardDesignerViewModel#getIsCurrentItemColumn
			 * @overridden
			 * @returns {boolean} Всегда возвращает false - Все элементы не являются полями.
			 */
			getIsCurrentItemColumn: function() {
				return false;
			},

			/**
			 * Генерирует уникальный идентификатор для модуля в тоге.
			 * @protected
			 * @virtual
			 * @param {String} itemName Имя итога.
			 * @param {Object} moduleConfig Конфигурация итога.
			 * @returns {String} Возвращает уникальный идентификатор для модуля в итоге.
			 */
			getModuleId: function(itemName, moduleConfig) {
				return this.sandbox.id + itemName + moduleConfig.moduleName;
			},

			/**
			 * Регистрирует необходимые модулю в итоге сообщения.
			 * @protected
			 * @virtual
			 */
			registerWidgetMessages: function() {
				var messages = {};
				var ptpSubscribeConfig = {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				};
				Terrasoft.each(Terrasoft.DashboardEnums.WidgetType, function(typeConfig) {
					var config = typeConfig.design;
					messages[config.configurationMessage] = ptpSubscribeConfig;
					messages[config.resultMessage] = ptpSubscribeConfig;
				}, this);
				this.sandbox.registerMessages(messages);
			},

			/**
			 * Возвращает коллецию итогов модуля.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.Collection} Возвращает коллецию итогов модуля.
			 */
			getDashboards: function() {
				return this.get("Dashboards");
			},

			/**
			 * Загружает модуль редактирования элемента сетки.
			 * @protected
			 * @virtual
			 * @param {String} widgetType Тип редактируемого виджета.
			 * @param {String} operation Тип операция.
			 */
			loadDesignModule: function(widgetType, operation) {
				var config = this.getWidgetConfig(widgetType);
				var moduleId = this.sandbox.id + "_" + config.moduleName;
				this.set("designOperation", operation);
				this.sandbox.subscribe(config.configurationMessage, this.onDesignerModuleConfigRequest, this, [moduleId]);
				this.sandbox.subscribe(config.resultMessage, this.onDesignModuleResponse, this, [moduleId]);
				var historyState = this.sandbox.publish("GetHistoryState");
				var moduleState = Ext.apply({hash: historyState.hash.historyState}, config.stateConfig);
				this.sandbox.publish("PushHistoryState", moduleState);
				this.sandbox.loadModule(config.moduleName, {
					"renderTo": this.renderTo,
					"id": moduleId,
					"keepAlive": true
				});
			},

			/**
			 * Обрабатывает запрос модуля редактирования на получение конфигурации элемента.
			 * @protected
			 * @virtual
			 * @return {Object|null} Отдает конфигурацию модуля, если модуль редактируется,
			 * или null - если добавляется.
			 */
			onDesignerModuleConfigRequest: function() {
				var initConfig = {sectionId: this.get("sectionId")};
				if (this.get("designOperation") === Terrasoft.ConfigurationEnums.CardOperation.ADD) {
					return initConfig;
				}
				var dashboard = this.getDashboard();
				var selectedItem = this.get("selectedItem");
				var items = dashboard.getItems();
				var moduleConfig = items[selectedItem];
				Ext.apply(initConfig, moduleConfig.parameters);
				if (this.get("designOperation") === Terrasoft.ConfigurationEnums.CardOperation.COPY) {
					initConfig.caption += " - " + this.get("Resources.Strings.CopySuffix");
				}
				return initConfig;
			},

			/**
			 * Обрабатывает ответ от модуля редактирования,
			 * обновляет информацию о модуле,
			 * добавляет модуль в представление.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурация модуля.
			 */
			onDesignModuleResponse: function(config) {
				var selectedItemName;
				var itemName = (selectedItemName = this.get("selectedItem"));
				var items = this.get("items");
				var itemsClone = Terrasoft.deepClone(items);
				var widgetConfig = {
					"parameters": config
				};
				var designOperation = this.get("designOperation");
				if (designOperation === Terrasoft.ConfigurationEnums.CardOperation.ADD ||
					designOperation === Terrasoft.ConfigurationEnums.CardOperation.COPY) {
					var widgetType = this.get("addWidgetType");
					widgetConfig.widgetType = widgetType;
					itemName = this.generateUniqName(widgetType);
					var newItemConfig = {
						parentName: this.get("addParentName"),
						column: this.get("addCol"),
						row: this.get("addCow"),
						name: itemName,
						itemType: Terrasoft.ViewItemType.MODULE
					};
					if (designOperation === Terrasoft.ConfigurationEnums.CardOperation.COPY) {
						var selectedItemViewConfig = this.getSchemaItemInfoByName(selectedItemName);
						var selectedItemLayout = selectedItemViewConfig.item.layout;
						Ext.apply(newItemConfig, {
							colSpan: selectedItemLayout.colSpan,
							rowSpan: selectedItemLayout.rowSpan
						});
					}
					this.addSchemaItem(newItemConfig);
				}
				var item = itemsClone[itemName] || (itemsClone[itemName] = {});
				Ext.apply(item, widgetConfig);
				this.set("items", itemsClone);
				this.set("selectedItem", itemName);
			},

			/**
			 * Находит начальную конфигурацию для типа виджета.
			 * @protected
			 * @overridden
			 * @param {Object|String} config Конфигурация элемента, содержащая тив виджета, или тип виджета.
			 * @return {Object} Возвращает начальную конфигурацию для типа виджета.
			 */
			getWidgetConfig: function(config) {
				var widgetTypeName = config.widgetType || config;
				var widgetConfig = Terrasoft.DashboardEnums.WidgetType[widgetTypeName];
				return widgetConfig.design;
			},

			/**
			 * Обрабатывает нажатие кнопки редактирования элемента.
			 * @protected
			 * @virtual
			 */
			editItem: function() {
				var selectedItem = this.get("selectedItem");
				var dashboard = this.getDashboard();
				var items = dashboard.getItems();
				var moduleConfig = items[selectedItem];
				this.loadDesignModule(moduleConfig.widgetType, Terrasoft.ConfigurationEnums.CardOperation.EDIT);
			},

			/**
			 * Обрабатывает нажатие кнопки копирования элемента.
			 * @protected
			 * @virtual
			 */
			copyItem: function() {
				var selectedItem = this.get("selectedItem");
				var dashboard = this.getDashboard();
				var items = dashboard.getItems();
				var selectedItemConfig = items[selectedItem];
				var widgetType = selectedItemConfig.widgetType;
				this.set("addParentName", this.getMainElementId());
				this.set("addCol", 0);
				this.set("addCow",  this.getRowToInsert());
				this.set("addWidgetType", widgetType);
				this.loadDesignModule(widgetType, Terrasoft.ConfigurationEnums.CardOperation.COPY);
			},

			/**
			 * Возвращает номер ряда для вставки скопированного элемента.
			 * @protected
			 * @virtual
			 * @return {Number} Номер ряда.
			 */
			getRowToInsert: function() {
				var schema = this.get("schema");
				var viewConfig = schema.viewConfig;
				var row = 0;
				this.Terrasoft.each(viewConfig, function(item) {
					var lastRow = item.layout.row + item.layout.rowSpan;
					if (lastRow - 1 >= row) {
						row = lastRow;
					}
				}, this);
				return row;
			},

			/**
			 * Возвращает идентификатор главного контейнера.
			 * @protected
			 * @virtual
			 * @return {String} Bдентификатор главного контейнера.
			 */
			getMainElementId: function() {
				return "DashboardItem" + this.getDashboard().getId() + "GridLayout";
			},

			/**
			 * Обрабатывает нажатие кнопки добавления элемента.
			 * @param {String} tag Конфигурационная строка.
			 * @protected
			 * @virtual
			 */
			addWidget: function(tag) {
				var args = tag.split(":");
				this.set("addParentName", args[0]);
				this.set("addCol", args[1]);
				this.set("addCow", args[2]);
				this.set("addWidgetType", args[3]);
				var widgetType = args[3];
				this.loadDesignModule(widgetType, Terrasoft.ConfigurationEnums.CardOperation.ADD);
			},

			/**
			 * Добавляет элемент в схему.
			 * @overridden
			 * @param {Object} config Конфигурация нового элемента.
			 */
			addSchemaItem: function(config) {
				var schema = this.get("schema");
				var schemaClone = Terrasoft.deepClone(schema);
				var parent = this.getSchemaItemInfoByName(config.parentName, schemaClone.viewConfig);
				var col = parseInt(config.column, 10);
				var row = parseInt(config.row, 10);
				var parentItems = (parent && parent.item) || schemaClone.viewConfig;
				var calculatedColSpan = this.calculateColumnWidth(parentItems, col, row);
				var layout = {
					column: col,
					row: row,
					colSpan: config.colSpan || calculatedColSpan,
					rowSpan: config.rowSpan || 1
				};
				var item = {
					layout: layout,
					name: config.name,
					itemType: config.itemType
				};
				parentItems.push(item);
				this.set("schema", schemaClone);
			},

			/**
			 * Обработчик события изменения выбранного элемента схемы. Вызывает перегенерацию представления схемы.
			 * @protected
			 * @virtual
			 */
			onSelectedItemChanged: function() {
				var selectedItem = this.get("selectedItem");
				this.reRender({
					selectedItemName: selectedItem,
					dashboards: this.getDashboards()
				});
			},

			/**
			 * Обработчик события изменения схемы. Перегененрирует представление схемы и сохраняет схему в DesignData.
			 * @protected
			 * @virtual
			 */
			onSchemaChange: function() {
				var schema = arguments[1];
				var dashboard = this.getDashboard();
				dashboard.setViewConfig(schema.viewConfig);
				var selectedItem = this.get("selectedItem");
				this.reRender({
					selectedItemName: selectedItem,
					dashboards: this.getDashboards()
				});
			},

			/**
			 * Обработчик события изменения элементов сетки.
			 * @protected
			 * @virtual
			 */
			onItemsChange: function() {
				this.initModulesCaptions();
			},

			/**
			 * Возвращает текущий итог.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.DashboardManagerItem} Возвращает текущий итог.
			 */
			getDashboard: function() {
				var dashboards = this.getDashboards();
				return dashboards.getByIndex(0);
			},

			/**
			 * Обработчик изменения данных модели.
			 * @overridden
			 * @param {Object} obj Объект с изменными данными.
			 * @param {Object} options Объект дополнительных параметров, с которым был вызван метод изменения данных.
			 */
			onDataChange: function(obj, options) {
				if (this.get("isInitialized")) {
					this.applyChangesToDashboard(obj, options);
				}
				this.callParent(arguments);
			},

			/**
			 * Обработчик нажатия кнопки "Сохранить".
			 * @protected
			 * @virtual
			 */
			save: function() {
				if (!this.validate()) {
					return;
				}
				var dashboard = this.getDashboard();
				if (dashboard.getIsNew()) {
					Terrasoft.DashboardManager.addItem(dashboard);
				}
				Terrasoft.DashboardManager.save(this.onSaved, this);
			},

			/**
			 * Обработчик завершения сохранения.
			 * @protected
			 * @virtual
			 */
			onSaved: function(response) {
				if (response.success) {
					var sandbox = this.sandbox;
					var dashboard = this.getDashboard();
					sandbox.publish("SetDesignerResult", {
						dashboardId: dashboard.getId()
					}, [sandbox.id]);
					sandbox.publish("BackHistoryState");
				}
			},

			/**
			 * Переносит изменения из модели модуля в объект итога.
			 * @protected
			 * @virtual
			 * @param {Object} obj Объект измененых данных модели.
			 */
			applyChangesToDashboard: function(obj) {
				var dashboard = this.getDashboard();
				Terrasoft.each(obj.changed, function(changedValue, changedValueName) {
					if (dashboard.propertyColumnNames[changedValueName]) {
						dashboard.setPropertyValue(changedValueName, changedValue);
					}
				}, this);
			},

			/**
			 * Обрабатывает уничтожение модели представления.
			 * @protected
			 * @virtual
			 */
			destroy: function() {
				var dashboard = this.getDashboard();
				if (dashboard && !dashboard.destroyed) {
					dashboard.discard();
				}
			},

			/**
			 * Производит перегенерацию представления итога. Добавляется в модель представления в модуле итога.
			 */
			reRender: Ext.emptyFn,

			/**
			 * Выполняет необходимые операции после отображениея представления.
			 * @protected
			 * @virtual
			 */
			onRender: function() {
				if (this.get("Restored")) {
					this.initHeader();
					this.set("Restored", false);
				}
				this.onViewRendered();
			},

			/**
			 * Обработчик события отрисовки представления.
			 * @private
			 */
			onViewRendered: function() {
				pageDesignerUtilities.initializeGridLayoutDragAndDrop(Ext.bind(this.changeItemPosition, this));
			}
		});

		/**
		 * @class Terrasoft.configuration.DashboardModule
		 * Класс визуального модуля итогов.
		 */
		var dashboardModule = Ext.define("Terrasoft.configuration.DashboardDesigner", {
			extend: "Terrasoft.BaseSchemaModule",
			alternateClassName: "Terrasoft.DashboardDesigner",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 *
			 */
			mixins: {
				/**
				 * Миксин, реализующий работу с HistoryState
				 */
				HistoryStateUtilities: "Terrasoft.HistoryStateUtilities"
			},

			/**
			 * Корневой элемент представления дизайнера.
			 * @private
			 * @type {Ext.Element}
			 */
			renderContainer: null,

			/**
			 * Имя класа генератора представления.
			 * @type {String}
			 */
			viewGeneratorClass: "Terrasoft.ViewGenerator",

			/**
			 * Создает экземпляр класса Terrasoft.ViewGenerator.
			 * @return {Terrasoft.ViewGenerator} Возвращает объект Terrasoft.ViewGenerator.
			 */
			createViewGenerator: function() {
				return this.Ext.create(this.viewGeneratorClass);
			},

			/**
			 * Генерирует ключ профиля для модуля итогов.
			 * @overridden
			 * @protected
			 * @return {String} Возращает ключ профиля для модуля итогов.
			 */
			getProfileKey: function() {
				return "DashboardId";
			},

			/**
			 * Возвращает объект настроек модели представления.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект настроек модели представления.
			 */
			getViewModelConfig: function() {
				var module = this;
				var viewModelConfig = {
					Ext: this.Ext,
					sandbox: this.sandbox,
					Terrasoft: this.Terrasoft,
					values: {
						Dashboards: this.dashboards
					},
					reRender: function(config) {
						module.reBuildView(config, function() {
							this.reRender();
						}, module);
					}
				};
				return viewModelConfig;
			},

			/**
			 * Убирает инициализацию имени схемы модуля.
			 * @overridden
			 * @protected
			 */
			initSchemaName: function() {
				this.schemaName = "DashboardDesigner";
			},

			/**
			 * Запрашивает доступные итоги у менеджера.
			 * @protected
			 * @virtual
			 * @param {Object} config Объект конфигурации получения итогов.
			 * @param {String} config.dashboardId Уникальный идентификатор используемой записи.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
			 * @return {Terrasoft.Collection} Возвращает доступные итоги.
			 */
			requireDashboards: function(config, callback, scope) {
				Terrasoft.DashboardManager.initialize({}, function() {
					var dashboardCollection = Ext.create("Terrasoft.Collection");
					if (config && config.dashboardId) {
						var dashboard;
						if (config.copyItem) {
							dashboard = Terrasoft.DashboardManager.copyItem(config.dashboardId);
						} else {
							dashboard = Terrasoft.DashboardManager.getItem(config.dashboardId);
						}
						dashboardCollection.add(dashboard.getId(), dashboard);
						callback.call(scope, dashboardCollection);
					} else {
						var createItemConfig;
						var sectionInfo = this.getSectionInfo();
						var moduleStructure = Terrasoft.configuration.ModuleStructure;
						var dashboardSectionModule = moduleStructure.Dashboard.sectionModule;
						if (sectionInfo.sectionModule !== dashboardSectionModule && sectionInfo.moduleId) {
							createItemConfig = {
								sectionId: sectionInfo.moduleId
							};
						}
						Terrasoft.DashboardManager.createItem(createItemConfig, function(dashboard) {
							dashboardCollection.add(dashboard.getId(), dashboard);
							callback.call(scope, dashboardCollection);
						}, this);
					}
				}, this);
			},

			/**
			 * Создает конфигурацию представления модуля.
			 * @protected
			 * @virtual
			 * param {Object} config Объект конфигурации.
			 * param {Function} callback Функция обратного вызова.
			 * param {Terrasoft.BaseModel} scope Контекст выполнения функции обратного вызова.
			 * @return {Object[]} Возвращает конфигурацию представления модуля.
			 */
			buildView: function(config, callback, scope) {
				var viewGenerator = this.createViewGenerator();
				var viewClass = this.Ext.create("Terrasoft.DashboardDesignerViewConfig");
				var schema = {
					viewConfig: viewClass.generate(config.dashboards)
				};
				var viewConfig = Ext.apply({
					schema: schema
				}, config);
				viewGenerator.generate(viewConfig, callback, scope);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseSchemaModule#generateSchemaStructure
			 * @overridden
			 */
			generateSchemaStructure: function(callback, scope) {
				this.requireDashboards(this.moduleConfig, function(dashboards) {
					this.dashboards = dashboards;
					this.viewModelClass = Ext.ClassManager.get("Terrasoft.DashboardDesignerViewModel");
					var generatorConfig = Terrasoft.deepClone(this.moduleConfig);
					generatorConfig.viewModelClass = this.viewModelClass;
					generatorConfig.dashboards = this.dashboards;
					this.buildView(generatorConfig, function(view) {
						callback.call(scope, this.viewModelClass, view);
					}, this);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseSchemaModule#render
			 * @overridden
			 */
			render: function(renderTo) {
				this.callParent(arguments);
				this.renderContainer = renderTo;
			},

			/**
			 * Перегенерация представления модуля.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурационный объект.
			 * @param {Function} callback Функция, которая будет вызвана по завершению.
			 * @param {Object} scope Контекст, в котором будет вызвана функция callback.!
			 */
			reBuildView: function(config, callback, scope) {
				var generatorConfig = Ext.apply(config, this.moduleConfig, {
					viewModelClass: this.viewModelClass,
					dashboards: this.dashboards
				});
				this.buildView(generatorConfig, function(view) {
					this.viewConfig = view;
					callback.call(scope, view);
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.BaseNestedModule#init
			 * @overridden
			 */
			init: function() {
				if (!this.viewModel) {
					this.initConfig();
				}
				this.callParent(arguments);
			},

			/**
			 * Инициализирует объект конфигурации модуля.
			 * @protected
			 * @virtual
			 */
			initConfig: function() {
				this.moduleConfig = this.sandbox.publish("GetDashboardInfo", null, [this.sandbox.id]);
			},

			/**
			 * Перерисовка представления модуля с перегенрацией представления.
			 * @protected
			 * @virtual
			 */
			reRender: function() {
				if (!this.renderContainer) {
					return;
				}
				var view = this.view;
				if (view) {
					view.destroy();
				}
				var viewModel = this.viewModel;
				var containerName = this.schemaName + this.autoGeneratedContainerSuffix;
				view = this.view = this.Ext.create("Terrasoft.Container", {
					id: containerName,
					selectors: {wrapEl: "#" +  containerName},
					classes: {wrapClassName: ["schema-wrap", "one-el"]},
					items: Terrasoft.deepClone(this.viewConfig)
				});
				view.bind(viewModel);
				view.render(this.renderContainer);
				viewModel.onRender();
			},

			/**
			 * Обнуляет внутрение параметры.
			 * @overridden
			 */
			destroy: function() {
				this.callParent(arguments);
				this.renderContainer = null;
			}
		});
		return dashboardModule;
	});
