define("BaseWidgetDesigner", ["terrasoft", "BaseWidgetDesignerResources", "ColumnEditMixin", "ColumnEditGenerator",
	"css!BaseWidgetDesignerCSS"],
function(Terrasoft, resources) {
	var localizableStrings = resources.localizableStrings;
	return {
		messages: {

			/**
			 * Публикация сообщения переотрисовки модуля показателя.
			 */
			"RerenderModule": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Публикация сообщения для получения параметров инициализации модуля дизайнера виджета.
			 */
			"GetModuleConfig": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Публикация сообщения для отдачи параметров настройки модуля дизайнера виджета.
			 */
			"PostModuleConfig": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Публикация сообщения изменения заголовка модуля дизайнера виджета.
			 */
			"ChangeHeaderCaption": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Публикация сообщения для возвращения предидущего состояния.
			 */
			"BackHistoryState": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Подписка на получение конфигурациооного объекта модуля фильтров.
			 */
			"GetFilterModuleConfig": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * Подписка на изменение фильтра.
			 */
			"OnFiltersChanged": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * Публикация сообщения устновки модуля фильтров.
			 */
			"SetFilterModuleConfig": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Сообщение взятия схемы раздела.
			 */
			"GetSectionEntitySchema": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			}

		},
		mixins: {
			ColumnEditMixin: "Terrasoft.ColumnEditMixin"
		},
		attributes: {

			/**
			 * Заголовок виджета.
			 */
			caption: {
				dataValueType: Terrasoft.DataValueType.TEXT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: true,
				value: localizableStrings.NewWidget
			},

			/**
			 * Колонка связи с разделом.
			 */
			sectionBindingColumn: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isLookup: true,
				entityStructureConfig: {
					useBackwards: false,
					displayId: true,
					lookupsColumnsOnly: true,
					allowedReferenceSchemas: "getAllowedReferenceSchemas",
					schemaColumnName: "entitySchemaName"
				}
			},

			/**
			 * Колонка с информацией о разделе.
			 */
			sectionId: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},

			/**
			 * Название схемы.
			 */
			entitySchemaName: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: true,
				isLookup: true,
				lookupListConfig: {
					columns: ["Name", "Caption"],
					filter: "getSchemasFilter"
				},
				referenceSchema: {
					name: "VwSysSchemaInfo",
					primaryColumnName: "Name",
					primaryDisplayColumnName: "Caption"
				},
				referenceSchemaName: "VwSysSchemaInfo"
			},

			/**
			 * Данные фильтра.
			 */
			filterData: {
				dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			}
		},
		methods: {

			/**
			 * Возвращает название модуля виджета.
			 * @protected
			 * @virtual
			 * @return {String} Возвращает название модуля виджета.
			 */
			getWidgetModuleName: this.Ext.emptyFn,

			/**
			 * Возвращает название сообщение получения настроек модуля виджета.
			 * @protected
			 * @virtual
			 * @return {String} Возвращает название сообщение получения настроек модуля виджета.
			 */
			getWidgetConfigMessage: this.Ext.emptyFn,

			/**
			 * Возвращает название сообщение обновления виджета.
			 * @protected
			 * @virtual
			 * @return {String} Возвращает название сообщение обновления виджета.
			 */
			getWidgetRefreshMessage: this.Ext.emptyFn,

			/**
			 * Возвращает объект соотношения свойств модуля виджета и модуля настройки виджета.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект соотношения свойств модуля виджета и модуля настройки виджета.
			 */
			getWidgetModulePropertiesTranslator: function() {
				var widgetModulePropertiesTranslator = {
					"caption": "caption",
					"filterData": "filterData",
					"entitySchemaName": "entitySchemaName",
					"sectionBindingColumn": "sectionBindingColumn",
					"sectionId": "sectionId"
				};
				return widgetModulePropertiesTranslator;
			},

			/**
			 * Метод выполняет сохранение настройки виджета.
			 * @protected
			 * @virtual
			 */
			save: function() {
				if (this.validate()) {
					this.sandbox.publish("PostModuleConfig", this.getWidgetConfig(), [this.sandbox.id]);
					this.sandbox.publish("BackHistoryState");
				}
			},

			/**
			 * Метод отмены изменений настройки виджета.
			 * @protected
			 * @virtual
			 */
			cancel: function() {
				this.sandbox.publish("BackHistoryState");
			},

			/**
			 * Обновляет виджет.
			 * @protected
			 * @virtual
			 */
			refreshWidget: function() {
				var canRefresh = this.get("moduleLoaded") && this.validate();
				if (canRefresh) {
					var widgetRefreshMessage = this.getWidgetRefreshMessage();
					if (widgetRefreshMessage) {
						this.sandbox.publish(widgetRefreshMessage, this.getDesignWidgetConfig(),
							[this.getWidgetPreviewModuleId()]);
					}
				}
			},

			/**
			 * Возвращает объект актуальных настроек виджета.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект актуальных настроек виджета.
			 */
			getWidgetConfig: function() {
				var widgetConfig = {};
				var widgetModulePropertiesTranslator = this.getWidgetModulePropertiesTranslator();
				Terrasoft.each(this.columns, function(propertyValue, propertyName) {
					var widgetPropertyName = widgetModulePropertiesTranslator[propertyName];
					if (widgetPropertyName) {
						var value = this.get(propertyName);
						widgetConfig[widgetPropertyName] = (value && (value.Name || value.value)) || value;
					}
				}, this);
				return widgetConfig;
			},

			/**
			 * Генерирует заголовок для поля связи с разделом.
			 * @protected
			 * @virtual
			 * @return {String} Возвращает заголовок для поля связи с разделом.
			 */
			getSectionBindingColumnCaption: function() {
				var moduleInfo = this.get("sectionId");
				var moduleId = (moduleInfo && moduleInfo.value) || moduleInfo;
				var moduleCaption = "";
				Terrasoft.each(Terrasoft.configuration.ModuleStructure, function(moduleConfig) {
					if (moduleConfig.moduleId === moduleId) {
						moduleCaption = moduleConfig.moduleCaption;
						return false;
					}
				}, this);
				var sectionBindingColumnFormat = this.get("Resources.Strings.SectionBindingColumnFormat");
				var entitySchemaNameInfo = this.get("entitySchemaName");
				var entitySchemaNameLookupValue  = (entitySchemaNameInfo && entitySchemaNameInfo.displayValue) || "";
				return this.Ext.String.format(sectionBindingColumnFormat, entitySchemaNameLookupValue, moduleCaption);
			},

			/**
			 * Проверяет на пустое значение.
			 * @param {*} value Значение
			 * @return {boolean} Возвращает true, если передан не пустой объект, false в обратном случае.
			 */
			isNotEmptyConverter: function(value) {
				return !Ext.isEmpty(value);
			},

			/**
			 * Генерирует список названий схем обектов для колонки связи с разделом.
			 * @protected
			 * @virtual
			 * @return {String[]} Возвращает список названий схем обектов для колонки связи с разделом.
			 */
			getAllowedReferenceSchemas: function() {
				var sectionSchema = this.getSectionSchemaName();
				return sectionSchema && [sectionSchema];
			},

			/**
			 * Возврашает имя схемы объекта раздела.
			 * @protected
			 * @virtual
			 * @return {String[]} Возврашает имя схемы объекта раздела.
			 */
			getSectionSchemaName: function() {
				var sectionSchema = this.sandbox.publish("GetSectionEntitySchema");
				return sectionSchema && sectionSchema.name;
			},

			/**
			 * Возвращает объект актуальных настроек виджета в режиме дизайна.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект актуальных настроек виджета.
			 */
			getDesignWidgetConfig: function() {
				var widgetConfig = this.getWidgetConfig();
				return widgetConfig;
			},

			/**
			 * Возвращает идентификатор модуля.
			 * @protected
			 * @virtual
			 * @return {String} Возвращает идентификатор модуля.
			 */
			getWidgetPreviewModuleId: function() {
				return this.sandbox.id + this.name;
			},

			/**
			 * Возвращает идентификатор модуля фильтрации.
			 * @protected
			 * @virtual
			 * @return {String} Возвращает идентификатор модуля фильтрации.
			 */
			getFilterEditModuleId: function() {
				return this.sandbox.id + "_ExtendedFilterEditModule";
			},

			/**
			 * Метод загрузки модуля фильтрации.
			 * @protected
			 * @virtual
			 */
			loadFilterModule: function() {
				var moduleId = this.getFilterEditModuleId();
				this.sandbox.subscribe("OnFiltersChanged", function(args) {
					this.set("filterData", args.serializedFilter);
				}, this, [moduleId]);
				this.sandbox.subscribe("GetFilterModuleConfig", function() {
					var entitySchemaNameProperty = this.get("entitySchemaName");
					return {
						rootSchemaName: entitySchemaNameProperty && entitySchemaNameProperty.Name,
						filters: this.get("filterData")
					};
				}, this, [moduleId]);
				this.sandbox.loadModule("FilterEditModule", {
					renderTo: "FilterProperties",
					id: moduleId
				});
				this.set("filterModuleLoaded", true);
			},

			/**
			 * Метод обработки события изменения названия схемы.
			 * @protected
			 * @virtual
			 */
			onEntitySchemaNameChange: function() {
				this.set("filterData", null);
				this.set("sectionBindingColumn", null);
				this.initSectionBindingColumn();
				var entitySchemaNameProperty = this.get("entitySchemaName");
				if (entitySchemaNameProperty) {
					this.loadFilterModule();
					var moduleId = this.getFilterEditModuleId();
					this.sandbox.publish("SetFilterModuleConfig", {
						rootSchemaName: entitySchemaNameProperty && entitySchemaNameProperty.Name
					}, [moduleId]);
				}
			},

			/**
			 * Инициализирует значение колонки связи с разделом.
			 * @protected
			 * @virtual
			 */
			initSectionBindingColumn: function() {
				var defaultSectionBindingColumnValue = {
					value: "Id",
					displayValue: "Id",
					dataValueType: Terrasoft.DataValueType.GUID
				};
				var entitySchemaName = this.get("entitySchemaName");
				entitySchemaName = (entitySchemaName && entitySchemaName.Name) || entitySchemaName;
				this.set("sectionBindingColumn",
					(entitySchemaName === this.getSectionSchemaName()) ? defaultSectionBindingColumnValue : null
				);

			},

			/**
			 * Загружает модуль виджета.
			 * @protected
			 * @virtual
			 */
			loadWidgetModule: function() {
				var widgetModuleName = this.getWidgetModuleName();
				if (widgetModuleName) {
					var moduleId = this.getWidgetPreviewModuleId();
					var rendered = this.sandbox.publish("RerenderModule", {
						renderTo: widgetModuleName
					}, [moduleId]);
					if (!rendered) {
						this.sandbox.loadModule(widgetModuleName, {
							renderTo: "WidgetModule",
							id: moduleId
						});
					}
				}
			},

			/**
			 * Инициализирует начальные значения модели.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			init: function(callback, scope) {
				this.callParent([function() {
					this.initWidgetDesigner(function() {
						this.refreshWidget();
						var getWidgetConfigMessage = this.getWidgetConfigMessage();
						if (getWidgetConfigMessage) {
							this.sandbox.subscribe(getWidgetConfigMessage, function() {
								return this.getDesignWidgetConfig();
							}, this, [this.getWidgetPreviewModuleId()]);
						}
						this.sandbox.publish("ChangeHeaderCaption", {
							caption: this.get("Resources.Strings.WidgetDesignerCaption"),
							moduleName: this.name
						});
						this.on("change:entitySchemaName", this.onEntitySchemaNameChange, this);
						callback.call(scope);
					}, this);
				}, this]);
			},

			/**
			 * Обработчик изменения данных.
			 * @protected
			 * @virtual
			 */
			onDataChange: function() {
				this.callParent(arguments);
				this.refreshWidget();
			},

			/**
			 * Метод обработки события отрисовки модуля.
			 * @protected
			 * @virtual
			 */
			onRender: function() {
				if (!this.get("filterModuleLoaded")) {
					this.loadFilterModule();
				}
			},

			/**
			 * Генерирует Фильтр для запроса списка схем объектов в текущей конфигурации.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.FilterGroup} Возвращает Фильтр для запроса списка схем объектов
			 * в текущей конфигурации.
			 */
			getSchemasFilter: function() {
				var filters = this.Ext.create("Terrasoft.FilterGroup");
				filters.addItem(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"SysWorkspace",
					Terrasoft.SysValue.CURRENT_WORKSPACE.value
				));
				filters.addItem(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"ManagerName",
					"EntitySchemaManager"
				));
				return filters;
			},

			getWidgetInitConfig: function() {
				return this.sandbox.publish("GetModuleConfig", null, [this.sandbox.id]);
			},

			/**
			 * Выполняет инициализацию дизайнера.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			initWidgetDesigner: function(callback, scope) {
				var widgetConfig = this.getWidgetInitConfig();
				Terrasoft.chain(
					function(next) {
						if (!widgetConfig) {
							this.set("moduleLoaded", true);
							callback.call(scope);
							return;
						}
						var widgetModulePropertiesTranslator = this.getWidgetModulePropertiesTranslator();
						Terrasoft.each(this.columns, function(columnConfig, columnName) {
							var widgetPropertyName = widgetModulePropertiesTranslator[columnName];
							if (widgetPropertyName && !Ext.isEmpty(widgetConfig[widgetPropertyName])) {
								var propertyValue = widgetConfig[widgetPropertyName];
								if (Terrasoft.isLookupDataValueType(columnConfig.dataValueType)) {
									this.setAttributeDisplayValue(columnName, propertyValue);
								} else {
									this.set(columnName, propertyValue);
								}
							}
						}, this);
						next();
					},
					function(next) {
						var widgetModulePropertiesTranslator = this.getWidgetModulePropertiesTranslator();
						var widgetPropertyName = widgetModulePropertiesTranslator.entitySchemaName;
						var entitySchemaName = widgetConfig[widgetPropertyName];
						if (!entitySchemaName) {
							next();
							return;
						}
						this.getEntitySchemaCaption(entitySchemaName, function(entitySchemaCaption) {
							this.set("entitySchemaName", {
								value: entitySchemaName,
								Name: entitySchemaName,
								displayValue: entitySchemaCaption
							});
							next();
						}, this);
					},
					function(next) {
						this.mixins.ColumnEditMixin.init.call(this, function() {
							next();
						}, this);
					},
					function() {
						this.set("moduleLoaded", true);
						callback.call(scope);
					},
					this
				);
			},

			/**
			 * Установка начальных значений для справочных колонок.
			 * @protected
			 * @virtual
			 * @param {String} propertyName Название колонки.
			 * @param {Object} propertyValue Значение колонки.
			 */
			setAttributeDisplayValue: function(propertyName, propertyValue) {
				this.set(propertyName, propertyValue);
			},

			/**
			 * Формирует метод, который возвращает экземпляр EntitySchemaQuery для получения данных справочной колонки.
			 * @overridden
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает экземпляр EntitySchemaQuery для получения данных справочной колонки.
			 */
			getLookupQuery: function(filterValue, columnName) {
				var esq = this.callParent(arguments);
				var lookupColumn = this.columns[columnName];
				var lookupListConfig = lookupColumn.lookupListConfig;
				if (!lookupListConfig) {
					return esq;
				}
				Terrasoft.each(lookupListConfig.columns, function(column) {
					if (!esq.columns.contains(column)) {
						esq.addColumn(column);
					}
				}, this);
				var filterGroup = this.getLookupQueryFilters(columnName);
				esq.filters.addItem(filterGroup);
				var columns = esq.columns;
				if (lookupListConfig.orders) {
					var orders = lookupListConfig.orders;
					Terrasoft.each(orders, function(order) {
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
					Terrasoft.each(filterArray, function(item) {
						var filter;
						if (Ext.isObject(item) && Ext.isFunction(item.method)) {
							filter = item.method.call(this, item.argument);
						}
						if (Ext.isFunction(item)) {
							filter = item.call(this);
						}
						if (Ext.isEmpty(filter)) {
							throw new Terrasoft.InvalidFormatException({
								message: Ext.String.format(
									this.get("Resources.Strings.ColumnFilterInvalidFormatException"), columnName)
							});
						}
						filterGroup.addItem(filter);
					}, this);
					if (lookupListConfig.filter) {
						var filterItem = Ext.isString(lookupListConfig.filter)
							? this[lookupListConfig.filter]()
							: lookupListConfig.filter.call(this);
						if (filterItem) {
							filterGroup.addItem(filterItem);
						}
					}
				}
				return filterGroup;
			},

			/**
			 * Проверяет видимость колонки связи с разделом.
			 * @protected
			 * @virtual
			 * @return {Boolean} Возвращает true если видима, false в обратном случае.
			 */
			getSectionBindingColumnVisible: function() {
				var sectionId = this.get("sectionId");
				var entitySchemaName = this.get("entitySchemaName");
				return Boolean(sectionId) && Boolean(entitySchemaName);
			}

		},
		diff: [
			{
				"operation": "insert",
				"name": "WidgetDesignerContainer",
				"values": {
					"id": "WidgetDesignerContainer",
					"selectors": {
						"wrapEl": "#WidgetDesignerContainer"
					},
					"classes": {
						"textClass": "center-panel",
						"wrapClassName": ["widget-designer-container"]
					},
					"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "HeaderContainer",
				"parentName": "WidgetDesignerContainer",
				"propertyName": "items",
				"values": {
					"id": "HeaderContainer",
					"selectors": {
						"wrapEl": "#HeaderContainer"
					},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 24
					},
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "HeaderContainer",
				"propertyName": "items",
				"name": "SaveButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {
						"bindTo": "Resources.Strings.SaveButtonCaption"
					},
					"classes": {
						"textClass": "actions-button-margin-right"
					},
					"click": {
						"bindTo": "save"
					},
					"style": "green",
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 2
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "HeaderContainer",
				"propertyName": "items",
				"name": "CancelButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {
						"bindTo": "Resources.Strings.CancelButtonCaption"
					},
					"classes": {
						"textClass": "actions-button-margin-right"
					},
					"click": {
						"bindTo": "cancel"
					},
					"style": "default",
					"layout": {
						"column": 4,
						"row": 0,
						"colSpan": 2
					}
				}
			},
			{
				"operation": "insert",
				"name": "FooterContainer",
				"parentName": "WidgetDesignerContainer",
				"propertyName": "items",
				"values": {
					"id": "FooterContainer",
					"selectors": {
						"wrapEl": "#FooterContainer"
					},
					"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
					"layout": {
						"column": 0,
						"row": 1,
						"colSpan": 24
					},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "WidgetModule",
				"parentName": "FooterContainer",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 11,
						"row": 0,
						"colSpan": 13,
						"rowSpan": 5
					},
					"itemType": Terrasoft.ViewItemType.MODULE,
					"afterrender": {
						"bindTo": "loadWidgetModule"
					},
					"afterrerender": {
						"bindTo": "loadWidgetModule"
					}
				}
			},
			{
				"operation": "insert",
				"name": "WidgetProperties",
				"parentName": "FooterContainer",
				"propertyName": "items",
				"values": {
					"id": "WidgetProperties",
					"selectors": {
						"wrapEl": "#WidgetProperties"
					},
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"layout": {
						"column": 0,
						"row": 1,
						"colSpan": 10
					},
					"controlConfig": {
						"collapsed": false
					},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "Caption",
				"parentName": "WidgetProperties",
				"propertyName": "items",
				"values": {
					"bindTo": "caption",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.CaptionLabel"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "QueryProperties",
				"parentName": "WidgetProperties",
				"propertyName": "items",
				"values": {
					"id": "QueryProperties",
					"selectors": {
						"wrapEl": "#QueryProperties"
					},
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"controlConfig": {
						"collapsed": false,
						"caption": {
							"bindTo": "Resources.Strings.QueryPropertiesLabel"
						}
					},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "EntitySchemaName",
				"parentName": "QueryProperties",
				"propertyName": "items",
				"values": {
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"bindTo": "entitySchemaName",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.EntitySchemaNameLabel"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "FilterPropertiesGroup",
				"parentName": "WidgetProperties",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"controlConfig": {
						"collapsed": false,
						"caption": {"bindTo": "Resources.Strings.FilterPropertiesLabel"}
					},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "FilterProperties",
				"parentName": "FilterPropertiesGroup",
				"propertyName": "items",
				"values": {
					"id": "FilterProperties",
					"itemType": Terrasoft.ViewItemType.MODULE,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "SectionBindingGroup",
				"parentName": "WidgetProperties",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"controlConfig": {
						"collapsed": false,
						"caption": {"bindTo": "Resources.Strings.SectionBindingGroupCaption"}
					},
					"visible": {
						"bindTo": "sectionId",
						"bindConfig": {"converter": "isNotEmptyConverter"}
					},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "sectionBindingColumn",
				"parentName": "SectionBindingGroup",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.MODEL_ITEM,
					"generator": "ColumnEditGenerator.generatePartial",
					"labelConfig": {"caption": {"bindTo": "getSectionBindingColumnCaption"}},
					"visible": {"bindTo": "getSectionBindingColumnVisible"},
					"controlConfig": {
						"placeholder": {"bindTo": "Resources.Strings.SectionBindingColumnCaption"},
						"classes": ["placeholderOpacity"]
					}
				}
			},
			{
				"operation": "insert",
				"name": "FormatProperties",
				"parentName": "WidgetProperties",
				"propertyName": "items",
				"values": {
					"id": "FormatProperties",
					"selectors": {
						"wrapEl": "#FormatProperties"
					},
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"controlConfig": {
						"collapsed": false,
						"caption": {
							"bindTo": "Resources.Strings.FormatPropertiesLabel"
						}
					},
					"items": []
				}
			}
		]
	};
});
