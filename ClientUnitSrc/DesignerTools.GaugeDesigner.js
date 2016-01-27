define("GaugeDesigner", ["terrasoft", "GaugeDesignerResources", "css!DesignerToolsCSS"],
	function(Terrasoft, resources) {
		var localizableStrings = resources.localizableStrings;
		return {
			messages: {

				/**
				 * Подписка на сообщения получения параметров инициализации модуля индикатора оператора.
				 */
				"GetGaugeConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Публикация сообщения для генерации индикатора.
				 */
				"GenerateGauge": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}

			},
			attributes: {
				/**
				 * Заголовок индикатора.
				 * @private
				 * @type {String}
				 */
				caption: {
					value: localizableStrings.NewWidget
				},

				/**
				 * Стиль индикатора.
				 * @private
				 * @type {Object}
				 */
				style: {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: Terrasoft.DashboardEnums.WidgetColor["widget-blue"]
				},

				/**
				 * Порядок отображения индикатора.
				 * @private
				 * @type {Object}
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
				 * Минимальное значение шкалы индикатора.
				 * @private
				 * @type {Number}
				 */
				min: {
					dataValueType: Terrasoft.DataValueType.INTEGER,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Значение "Среднее от" шкалы индикатора.
				 * @private
				 * @type {Number}
				 */
				middleFrom: {
					dataValueType: Terrasoft.DataValueType.INTEGER,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Значение "Среднее до" до шкалы индикатора.
				 * @private
				 * @type {Number}
				 */
				middleTo: {
					dataValueType: Terrasoft.DataValueType.INTEGER,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Максимальное значение шкалы индикатора.
				 * @private
				 * @type {Number}
				 */
				max: {
					dataValueType: Terrasoft.DataValueType.INTEGER,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Перечисление порядка отображения индикатора.
				 * @private
				 * @type {Object}
				 */
				orderDirections: {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: {
						"1": {
							value: Terrasoft.OrderDirection.ASC,
							displayValue: localizableStrings.AscendingOrder
						},
						"2": {
							value: Terrasoft.OrderDirection.DESC,
							displayValue: localizableStrings.DescendingOrder
						}
					}
				},

				/**
				 * @inheritdoc Terrasoft.BaseAggregationWidgetDesigner#aggregationColumn
				 * @overridden
				 */
				aggregationColumn: {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isLookup: true,
					entityStructureConfig: {
						useBackwards: false,
						excludeDataValueTypes: [
							Terrasoft.DataValueType.DATE_TIME,
							Terrasoft.DataValueType.DATE,
							Terrasoft.DataValueType.TIME
						],
						schemaColumnName: "entitySchemaName",
						aggregationTypeParameterName: "aggregationType"
					},
					dependencies: [
						{
							columns: ["aggregationType"],
							methodName: "onAggregationTypeChange"
						}
					]
				}
			},
			methods: {

				/**
				 * Возвращает название сообщения получения настроек модуля индикатора.
				 * @protected
				 * @virtual
				 * @return {String} Название сообщение получения настроек модуля индикатора.
				 */
				getWidgetConfigMessage: function() {
					return "GetGaugeConfig";
				},

				/**
				 * Возвращает название сообщения обновления индикатора.
				 * @protected
				 * @virtual
				 * @return {String} Название сообщение обновления индикатора.
				 */
				getWidgetRefreshMessage: function() {
					return "GenerateGauge";
				},

				/**
				 * Возвращает объект соотношения свойств модуля индикатора и модуля настройки индикатора.
				 * @protected
				 * @virtual
				 * @return {Object} Объект соотношения свойств модуля индикатора и модуля настройки индикатора.
				 */
				getWidgetModulePropertiesTranslator: function() {
					var gaugeProperties = {
						"style": "style",
						"orderDirection": "orderDirection",
						"min": "min",
						"middleFrom": "middleFrom",
						"middleTo": "middleTo",
						"max": "max"
					};
					return Ext.apply(this.callParent(arguments), gaugeProperties);
				},

				/**
				 * Возвращает название модуля индикатора.
				 * @protected
				 * @virtual
				 * @return {String} Название модуля индикатора.
				 */
				getWidgetModuleName: function() {
					return "GaugeModule";
				},

				/**
				 * Возвращает объект стилей индикатора.
				 * @protected
				 * @virtual
				 * @return {Object} Объект стилей.
				 */
				getStyleDefaultConfig: function() {
					return Terrasoft.DashboardEnums.WidgetColor;
				},

				/**
				 * Наполняет коллекцию стилей индикатора.
				 * @protected
				 * @virtual
				 * @param {String} filter Строка фильтрации.
				 * @param {Terrasoft.Collection} list Список.
				 */
				prepareStyleList: function(filter, list) {
					if (!list) {
						return;
					}
					list.clear();
					list.loadAll(this.getStyleDefaultConfig());
				},

				/**
				 * Наполняет коллекцию порядка отображения индикатора.
				 * @protected
				 * @virtual
				 * @param {String} filter Строка фильтрации.
				 * @param {Terrasoft.Collection} list Список.
				 */
				prepareOrderDirectionList: function(filter, list) {
					if (!list) {
						return;
					}
					list.clear();
					list.loadAll(this.getOrderDirectionConfig());
				},

				/**
				 * Возвращает конфигурационный объект порядка отображения индикатора.
				 * @protected
				 * @virtual
				 * @return {Object} Объект порядка отображения индикатора.
				 */
				getOrderDirectionConfig: function() {
					return this.get("orderDirections");
				},

				/**
				 * @inheritdoc Terrasoft.BaseWidgetDesigner#setAttributeDisplayValue
				 * Установливет значение для колонок стиля.
				 * @overridden
				 */
				setAttributeDisplayValue: function(propertyName, propertyValue) {
					switch (propertyName) {
						case "style":
							propertyValue = this.getStyle(propertyValue);
							break;
						case "orderDirection":
							propertyValue = this.getOrderDirection(propertyValue);
							break;
						default:
							this.callParent(arguments);
							return;
					}
					this.set(propertyName, propertyValue);
				},

				/**
				 * Возвращает стиль индикатора.
				 * @private
				 * @param {String} styleName Название стиля.
				 * @return {Object} Стиль индикатора.
				 */
				getStyle: function(styleName) {
					var styleConfig = this.getStyleDefaultConfig();
					return styleConfig[styleName];
				},

				/**
				 * Возвращает направление отображения индикатора.
				 * @private
				 * @param {String} orderDirectionName Название направления.
				 * @return {Object} Направление отображения индикатора.
				 */
				getOrderDirection: function(orderDirectionName) {
					var orderDirectionConfig = this.get("orderDirections");
					return orderDirectionConfig[orderDirectionName];
				},

				/**
				 * Возвращает конфигурацию изображения для иконки порядка отображения индикатора.
				 * @protected
				 * @return {Object} Конфигурация изображения.
				 */
				getScaleOrderDirectionImageConfig: function() {
					var orderDirection = this.get("orderDirection");
					if (!orderDirection) {
						return null;
					}
					var iconName = (orderDirection.value === Terrasoft.OrderDirection.ASC)
						? "ScaleUpIcon"
						: "ScaleDownIcon";
					var icon = this.get("Resources.Images." + iconName);
					return icon;
				},

				/**
				 * Возвращает название markerValue иконки направления шкалы индикатора.
				 * @protected
				 * @return {Object} Название markerValue иконки направления шкалы индикатора.
				 */
				getScaleOrderDirectionIconMarkerValueName: function() {
					var orderDirection = this.get("orderDirection");
					if (!orderDirection) {
						return null;
					}
					var markerValueName = (orderDirection.value === Terrasoft.OrderDirection.ASC)
						? "ScaleOrderDirectionIconAsc"
						: "ScaleOrderDirectionIconDesc";
					return markerValueName;
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
							"caption": {
								"bindTo": "Resources.Strings.StyleCaption"
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
					"name": "OrderDirection",
					"parentName": "FormatProperties",
					"propertyName": "items",
					"values": {
						"dataValueType": Terrasoft.DataValueType.ENUM,
						"bindTo": "orderDirection",
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.OrderDirectionCaption"
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
					"name": "ScaleContainer",
					"parentName": "FormatProperties",
					"propertyName": "items",
					"values": {
						"id": "ScaleContainer",
						"selectors": {"wrapEl": "#ScaleContainer"},
						"itemType": this.Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["scale-container", "control-width-15"],
						"markerValue": "ScaleContainer",
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ScaleLabelContainer",
					"parentName": "ScaleContainer",
					"propertyName": "items",
					"values": {
						"id": "ScaleLabelContainer",
						"selectors": {"wrapEl": "#ScaleLabelContainer"},
						"itemType": this.Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["label-wrap"],
						"markerValue": "ScaleLabelContainer",
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ScaleControlContainer",
					"parentName": "ScaleContainer",
					"propertyName": "items",
					"values": {
						"id": "ScaleControlContainer",
						"selectors": {"wrapEl": "#ScaleControlContainer"},
						"itemType": this.Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["control-wrap"],
						"markerValue": "ScaleControlContainer",
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ScaleIndicatorContainer",
					"parentName": "ScaleControlContainer",
					"propertyName": "items",
					"values": {
						"id": "ScaleIndicatorContainer",
						"selectors": {"wrapEl": "#ScaleIndicatorContainer"},
						"itemType": this.Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["scale-indicator-container"],
						"markerValue": "ScaleIndicatorContainer",
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ScaleLabel",
					"parentName": "ScaleLabelContainer",
					"propertyName": "items",
					"values": {
						classes: {
							"labelClass": ["scale-caption", "t-label-is-required"]
						},
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {"bindTo": "Resources.Strings.ScaleCaption"}
					}
				},
				{
					"operation": "insert",
					"name": "Min",
					"parentName": "ScaleIndicatorContainer",
					"propertyName": "items",
					"values": {
						"dataValueType": Terrasoft.DataValueType.INTEGER,
						"bindTo": "min",
						"labelConfig": {
							"visible": false
						},
						"useThousandSeparator": false
					}
				},
				{
					"operation": "insert",
					"name": "MiddleFrom",
					"parentName": "ScaleIndicatorContainer",
					"propertyName": "items",
					"values": {
						"dataValueType": Terrasoft.DataValueType.INTEGER,
						"bindTo": "middleFrom",
						"labelConfig": {
							"visible": false
						},
						"useThousandSeparator": false
					}
				},
				{
					"operation": "insert",
					"name": "MiddleToLabel",
					"parentName": "ScaleIndicatorContainer",
					"propertyName": "items",
					"values": {
						"dataValueType": Terrasoft.DataValueType.INTEGER,
						"bindTo": "middleTo",
						"labelConfig": {
							"visible": false
						},
						"useThousandSeparator": false
					}
				},
				{
					"operation": "insert",
					"name": "Max",
					"parentName": "ScaleIndicatorContainer",
					"propertyName": "items",
					"values": {
						"dataValueType": Terrasoft.DataValueType.INTEGER,
						"bindTo": "max",
						"labelConfig": {
							"visible": false
						},
						"useThousandSeparator": false
					}
				},
				{
					"operation": "insert",
					"index": 1,
					"name": "ScaleOrderDirectionIcon",
					"parentName": "ScaleControlContainer",
					"propertyName": "items",
					"values": {
						"id": "ScaleOrderDirectionIcon",
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"imageConfig": {"bindTo": "getScaleOrderDirectionImageConfig"},
						"classes": {"wrapperClass": ["scale-order-direction-icon"]},
						"markerValue": {"bindTo": "getScaleOrderDirectionIconMarkerValueName"},
						"selectors": {"wrapEl": "#ScaleOrderDirectionIcon"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT
					}
				}
			]
		};
	}
);
