define("DashboardGridDesigner", ["terrasoft", "DashboardGridDesignerResources"],
function(Terrasoft, resources) {
	var localizableStrings = resources.localizableStrings;
	return {
		messages: {
			/**
			 * Подписка на сообщение для получения параметров инициализации модуля.
			 */
			"GetDashboardGridConfig": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * Публикация сообщения для генерации списка.
			 */
			"GenerateDashboardGrid": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Публикация сообщения для получение состояния.
			 */
			"GetHistoryState": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Подписка на сообщение для получения параметров модуля настройки реестра итогов.
			 */
			"SaveGridSettings": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * Публикация сообщения установки состояния.
			 */
			"PushHistoryState": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},

			/**
			 * Подписка на сообщение для подготовки параметров модуля настройки реестра итогов.
			 */
			"GetGridSettingsInfo": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}

		},
		attributes: {

			/**
			 * Заголовок списка.
			 */
			caption: {
				value: localizableStrings.NewWidget
			},

			/**
			 * Стиль списка.
			 */
			style: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: true,
				value: Terrasoft.DashboardEnums.WidgetColor["widget-green"]
			},

			/**
			 * Направление сортировки.
			 */
			orderDirection: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: true,
				value: {
					value: Terrasoft.OrderDirection.DESC,
					displayValue: localizableStrings.DescendingOrder
				}
			},

			/**
			 * Колонка  сортировки.
			 */
			orderColumn: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: true,
				value: {

				}
			},

			/**
			 * Количество рядов для отображения.
			 */
			rowCount: {
				dataValueType: Terrasoft.DataValueType.INTEGER,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: false,
				value: 5
			},

			/**
			 * Конфигурация списка.
			 */
			gridConfig: {
				dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: false,
				dependencies: [
					{
						columns: ["orderColumn", "orderDirection"],
						methodName: "setColumnGridConfig"
					}
				]
			}
		},
		methods: {

			/**
			 * Возвращает название сообщение получения настроек модуля виджета.
			 * @protected
			 * @virtual
			 * @return {String} Возвращает название сообщение получения настроек модуля виджета.
			 */
			getWidgetConfigMessage: function() {
				return "GetDashboardGridConfig";
			},

			/**
			 * Возвращает название сообщение обновления виджета.
			 * @protected
			 * @virtual
			 * @return {String} Возвращает название сообщение обновления виджета.
			 */
			getWidgetRefreshMessage: function() {
				return "GenerateDashboardGrid";
			},

			/**
			 * Возвращает объект соотношения свойств модуля виджета и модуля настройки виджета.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект соотношения свойств модуля виджета и модуля настройки виджета.
			 */
			getWidgetModulePropertiesTranslator: function() {
				var widgetModulePropertiesTranslator = {
					rowCount: "rowCount",
					style: "style",
					gridConfig: "gridConfig",
					orderDirection: "orderDirection",
					orderColumn: "orderColumn"
				};
				return Ext.apply(this.callParent(arguments), widgetModulePropertiesTranslator);
			},

			/**
			 * Возвращает объект актуальных настроек виджета в режиме дизайна.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект актуальных настроек виджета.
			 */
			getDesignWidgetConfig: function() {
				var config = this.callParent(arguments);
				Ext.apply(config, {
					isDesigned: true
				});
				return config;
			},

			/**
			 * Возвращает название модуля виджета.
			 * @protected
			 * @virtual
			 * @return {String} Возвращает название модуля виджета.
			 */
			getWidgetModuleName: function() {
				return "DashboardGridModule";
			},

			/**
			 * Метод обработки события изменения названия схемы.
			 * @protected
			 * @virtual
			 */
			onEntitySchemaNameChange: function() {
				if (this.get("moduleLoaded")) {
					this.clearColumn();
				}
				this.callParent(arguments);
			},

			/**
			 * Возвращает объект стилей.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект стилей.
			 */
			getStyleDefaultConfig: function() {
				return Terrasoft.DashboardEnums.WidgetColor;
			},

			/**
			 * Возвращает объект направления сортировки.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект направления сортировки.
			 */
			getOrderDirectionDefaultConfig: function() {
				return {
					"1": {
						value: Terrasoft.OrderDirection.ASC,
						displayValue: this.get("Resources.Strings.AscendingOrder")
					},
					"2": {
						value: Terrasoft.OrderDirection.DESC,
						displayValue: this.get("Resources.Strings.DescendingOrder")
					}
				};
			},

			/**
			 * Возвращает объект колонок для сортировки.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект колонок для сортировки.
			 */
			getOrderColumnConfig: function() {
				var gridConfig = this.get("gridConfig");
				var gridItems = gridConfig && gridConfig.items;
				if (!gridItems) {
					return null;
				}
				var orderColumnConfig = {};
				Terrasoft.each(gridItems, function(column) {
					var columnName = column.bindTo;
					var columnCaption = column.caption;
					orderColumnConfig[columnName] = {
						value: columnName,
						displayValue: columnCaption
					};
				}, this);
				return orderColumnConfig;
			},

			/**
			 * Наполняет коллекцию стилей.
			 * @protected
			 * @virtual
			 * @param {String} filter Строка фильтрации.
			 * @param {Terrasoft.Collection} list Список.
			 */
			prepareStyleList: function(filter, list) {
				if (list === null) {
					return;
				}
				list.clear();
				list.loadAll(this.getStyleDefaultConfig());
			},

			/**
			 * Наполняет коллекцию напрвлений сортировки.
			 * @protected
			 * @virtual
			 * @param {String} filter Строка фильтрации.
			 * @param {Terrasoft.Collection} list Список.
			 */
			prepareOrderDirectionList: function(filter, list) {
				if (list === null) {
					return;
				}
				list.clear();
				list.loadAll(this.getOrderDirectionDefaultConfig());
			},

			/**
			 * Наполняет коллекцию колонок для сортировки.
			 * @protected
			 * @virtual
			 * @param {String} filter Строка фильтрации.
			 * @param {Terrasoft.Collection} list Список.
			 */
			prepareOrderColumnList: function(filter, list) {
				if (list === null) {
					return;
				}
				list.clear();
				list.loadAll(this.getOrderColumnConfig());
			},

			/**
			 * Загружает страницу настройки списка .
			 * @protected
			 * @virtual
			 */
			openGridSettingsPage: function() {
				var entitySchemaName = this.get("entitySchemaName").Name;
				var gridConfig = Terrasoft.encode(this.get("gridConfig"));
				var sandboxId = this.sandbox.id;
				var gridSettingsId = sandboxId + "_GridSettingsV2";
				var profile = {
					isTiled: false,
					listedConfig: gridConfig,
					tiledConfig: "{\"grid\":{\"rows\":3,\"columns\":24},\"items\":[]}",
					type: this.Terrasoft.GridType.LISTED
				};
				this.sandbox.subscribe("GetGridSettingsInfo", function() {
					var gridSettingsInfo = {};
					gridSettingsInfo.isSingleTypeMode = true;
					gridSettingsInfo.entitySchemaName = entitySchemaName;
					gridSettingsInfo.baseGridType = this.Terrasoft.GridType.LISTED;
					gridSettingsInfo.profile = profile;
					gridSettingsInfo.hideButtons = false;
					gridSettingsInfo.hideGridType = true;
					gridSettingsInfo.isTiled = false;
					gridSettingsInfo.isNested = false;
					gridSettingsInfo.hideAllUsersSaveButton = true;
					gridSettingsInfo.useProfileField = true;
					return gridSettingsInfo;
				}, this, [gridSettingsId]);
				this.sandbox.subscribe("SaveGridSettings", function(profile) {
					var newGridConfig = Terrasoft.decode(profile.listedConfig);
					this.set("gridConfig", newGridConfig);
					this.sandbox.publish("GenerateDashboardGrid", null, [this.getWidgetPreviewModuleId()]);
					return {
						saveProfile: false
					};
				}, this, [gridSettingsId]);
				var params = this.sandbox.publish("GetHistoryState");
				this.sandbox.publish("PushHistoryState", {hash: params.hash.historyState});
				this.sandbox.loadModule("GridSettingsV2", {
					renderTo: this.renderTo,
					id: gridSettingsId,
					keepAlive: true
				});
			},

			/**
			 * Выполняет иницыализацию дизайнера.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			initWidgetDesigner: function(callback, scope) {
				this.callParent([function() {
					this.initOrderLookupValues();
					callback.call(scope);
				}, this]);
			},

			/**
			 * @inheritdoc Terrasoft.BaseWidgetDesigner#setAttributeDisplayValue
			 * Установливет значение для колонок стиля.
			 * @protected
			 * @overridden
			 */
			setAttributeDisplayValue: function(propertyName, propertyValue) {
				switch (propertyName) {
					case "style":
						propertyValue = this.getStyleLookupValue(propertyValue);
						break;
					default:
						this.callParent(arguments);
						return;
				}
				this.set(propertyName, propertyValue);
			},

			/**
			 * Устанавливает поля направления и колонки сортировки.
			 * @protected
			 * @virtual
			 */
			initOrderLookupValues: function() {
				var gridConfig = this.get("gridConfig");
				var gridItems = gridConfig && gridConfig.items;
				if (Ext.isEmpty(gridItems)) {
					return;
				}
				Terrasoft.each(gridItems, function(column) {
					if (!column.orderDirection || !column.orderPosition) {
						return;
					}
					var orderDirectionLookupValue =  this.getOrderDirectionLookupValue(column.orderDirection);
					this.set("orderDirection", orderDirectionLookupValue);
					var columnName = column.bindTo;
					var columnCaption = column.caption;
					var orderColumnLookupValue =  this.getLookupValue(columnName, columnCaption);
					this.set("orderColumn", orderColumnLookupValue);
				}, this);
			},

			/**
			 * Устанавливает колонку сортировки элементов списка.
			 * @protected
			 * @virtual
			 */
			setColumnGridConfig: function() {
				var gridConfig = this.get("gridConfig");
				var gridItems = gridConfig && gridConfig.items;
				if (!gridItems) {
					return;
				}
				var orderColumn = this.get("orderColumn");
				orderColumn = (orderColumn && orderColumn.value) || orderColumn;
				var orderDirection = this.get("orderDirection");
				orderDirection = (orderDirection && orderDirection.value) || orderDirection;
				Terrasoft.each(gridItems, function(column) {
					if (column.orderPosition) {
						delete (column.orderDirection);
						delete (column.orderPosition);
						return false;
					}
				}, this);
				Terrasoft.each(gridItems, function(column) {
					if (column.bindTo === orderColumn) {
						column.orderDirection = orderDirection;
						column.orderPosition = 1;
						return false;
					}
				}, this);
			},

			/**
			 * Очищает колонки.
			 * @protected
			 * @virtual
			 */
			clearColumn: function() {
				this.set("orderColumn", null);
				this.setDefaultGridConfig();
			},

			/**
			 * Устанавливает настройку списка по умолчанию.
			 * @protected
			 * @virtual
			 */
			setDefaultGridConfig: function() {
				var entitySchemaName = this.get("entitySchemaName");
				if (!entitySchemaName) {
					return;
				}
				var entitySchemaNameValue = this.get("entitySchemaName").Name;
				this.getEntitySchemaByName(entitySchemaNameValue, this.setDefaultGridConfigToProperty, this);
			},

			/**
			 * Устанавливает свойство настройка списка значением по умолчанию.
			 * @protected
			 * @virtual
			 * @param {Terrasoft.BaseEntitySchema} entitySchema Схема сущности.
			 */
			setDefaultGridConfigToProperty: function(entitySchema) {
				var primaryDisplayColumn = entitySchema.primaryDisplayColumn;
				var defaultGridConfig = {};
				if (!primaryDisplayColumn) {
					defaultGridConfig.items = [];
				} else {
					defaultGridConfig.items = [{
						"bindTo": primaryDisplayColumn.name,
						"caption": primaryDisplayColumn.caption,
						"type": "title",
						"position": {
							"column": 0,
							"colSpan": 12,
							"row": 1
						},
						"metaPath": primaryDisplayColumn.name,
						"orderDirection": 2,
						"orderPosition": 1
					}];
				}
				this.set("gridConfig", defaultGridConfig);
			},

			/**
			 * Возвращает объект значения стиля.
			 * @protected
			 * @virtual
			 * @param {String} styleValue Название стиля.
			 * @return {Object} Возвращает объект значения стиля.
			 */
			getStyleLookupValue: function(styleValue) {
				var styleDefaultConfig = this.getStyleDefaultConfig();
				return styleDefaultConfig[styleValue];
			},

			/**
			 * Возвращает объект значения направления сортировки.
			 * @protected
			 * @virtual
			 * @param {String} orderDirectionValue Направления сортировки.
			 * @return {Object} Возвращает объект значения направления сортировки.
			 */
			getOrderDirectionLookupValue: function(orderDirectionValue) {
				var orderDirectionDefaultConfig = this.getOrderDirectionDefaultConfig();
				return orderDirectionDefaultConfig[orderDirectionValue];
			},

			/**
			 * Возвращает стандартный объект выпадающего списка.
			 * @protected
			 * @virtual
			 * @param {String} value Значение.
			 * @param {String} displayValue Значение для отображение.
			 * @return {Object} Возвращает объект выпадающего списка.
			 */
			getLookupValue: function(value, displayValue) {
				return {
					value: value,
					displayValue: displayValue
				};
			}

		},
		diff: [
			{
				"operation": "insert",
				"name": "Style",
				"parentName": "FormatProperties",
				"propertyName": "items",
				"values": {
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"bindTo": "style",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.StyleLabel"
						}
					},
					"controlConfig": {
						"className": "Terrasoft.ComboBoxEdit",
						"prepareList": {
							"bindTo": "prepareStyleList"
						},
						"list": {
							"bindTo": "styleList"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "AddButton",
				"parentName": "QueryProperties",
				"propertyName": "items",
				"values": {
					"visible": true,
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"classes": {
						"textClass": "open-grid-settings-button"
					},
					"click": {
						bindTo: "openGridSettingsPage"
					},
					"caption": {
						bindTo: "Resources.Strings.SetupColumnsButtonLabel"
					}
				}
			},
			{
				"operation": "insert",
				"name": "OrderColumn",
				"parentName": "QueryProperties",
				"propertyName": "items",
				"values": {
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"bindTo": "orderColumn",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.ColumnToOrderLabel"
						}
					},
					"controlConfig": {
						"className": "Terrasoft.ComboBoxEdit",
						"prepareList": {
							"bindTo": "prepareOrderColumnList"
						},
						"list": {
							"bindTo": "orderColumnList"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "OrderDirection",
				"parentName": "QueryProperties",
				"propertyName": "items",
				"values": {
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"bindTo": "orderDirection",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.OrderDirectionLabel"
						}
					},
					"controlConfig": {
						"className": "Terrasoft.ComboBoxEdit",
						"prepareList": {
							"bindTo": "prepareOrderDirectionList"
						},
						"list": {
							"bindTo": "orderDirectionList"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "RowCount",
				"parentName": "QueryProperties",
				"propertyName": "items",
				"values": {
					"dataValueType": Terrasoft.DataValueType.INTEGER,
					"bindTo": "rowCount",
					"labelConfig": {
						"visible": true,
						"caption": {
							"bindTo": "Resources.Strings.RowsQuantityLabel"
						}
					}
				}
			}
		]
	};
});