define("IndicatorDesigner", ["terrasoft", "IndicatorDesignerResources"],
	function(Terrasoft, resources) {
		var localizableStrings = resources.localizableStrings;
		return {
			messages: {

				/**
				 * Подписка на сообщения для получения параметров инициализации модуля показателя.
				 */
				"GetIndicatorConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Публикация сообщения для генерации показателя.
				 */
				"GenerateIndicator": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}

			},
			attributes: {
				/**
				 * Заголовок виджета.
				 */
				caption: {
					value: localizableStrings.NewWidget
				},

				/**
				 * Стиль показателя.
				 */
				style: {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: Terrasoft.DashboardEnums.WidgetColor["widget-blue"]
				},

				/**
				 * Стиль показателя.
				 */
				fontStyle: {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					value: {
						value: "default-indicator-font-size",
						displayValue: localizableStrings.FontStyleDefault
					}
				},

				/**
				 * Формат показателя.
				 */
				format: {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: false,
					value: {
						"textDecorator": "{0}",
						"thousandSeparator": " ",
						"type": Terrasoft.DataValueType.FLOAT,
						"dateFormat": "d-m-Y"
					}
				},

				/**
				 * Заголовок формата.
				 */
				formatCaption: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
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
					return "GetIndicatorConfig";
				},

				/**
				 * Возвращает название сообщение обновления виджета.
				 * @protected
				 * @virtual
				 * @return {String} Возвращает название сообщение обновления виджета.
				 */
				getWidgetRefreshMessage: function() {
					return "GenerateIndicator";
				},

				/**
				 * Возвращает объект соотношения свойств модуля виджета и модуля настройки виджета.
				 * @protected
				 * @virtual
				 * @return {Object} Возвращает объект соотношения свойств модуля виджета и модуля настройки виджета.
				 */
				getWidgetModulePropertiesTranslator: function() {
					var widgetModulePropertiesTranslator = {
						aggregationColumn: "columnName",
						style: "style",
						fontStyle: "fontStyle",
						format: "format"
					};
					return Ext.apply(this.callParent(arguments), widgetModulePropertiesTranslator);
				},

				/**
				 * Возвращает название модуля виджета.
				 * @protected
				 * @virtual
				 * @return {String} Возвращает название модуля виджета.
				 */
				getWidgetModuleName: function() {
					return "IndicatorModule";
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
						case "fontStyle":
							propertyValue = this.getFontStyleLookupValue(propertyValue);
							break;
						default:
							this.callParent(arguments);
							return;
					}
					this.set(propertyName, propertyValue);
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
				 * Возвращает объект значения стиля подписи.
				 * @protected
				 * @virtual
				 * @param {String} fontStyleValue Название стиля подписи.
				 * @return {Object} Возвращает объект значения стиля подписи.
				 */
				getFontStyleLookupValue: function(fontStyleValue) {
					var fontStyleDefaultConfig = this.getFontStyleDefaultConfig();
					return fontStyleDefaultConfig[fontStyleValue];
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
				 * Возвращает объект стилей подписей.
				 * @protected
				 * @virtual
				 * @return {Object} Возвращает объект стилей подписей.
				 */
				getFontStyleDefaultConfig: function() {
					var fontStyleDefaultConfig = {
						"default-indicator-font-size": {
							value: "default-indicator-font-size",
							displayValue: this.get("Resources.Strings.FontStyleDefault")
						},
						"big-indicator-font-size": {
							value: "big-indicator-font-size",
							displayValue: this.get("Resources.Strings.FontStyleBig")
						}
					};
					return fontStyleDefaultConfig;
				},

				/**
				 * Наполняет коллекцию стилей подписей.
				 * @protected
				 * @virtual
				 * @param {String} filter Строка фильтрации.
				 * @param {Terrasoft.Collection} list Список.
				 */
				prepareFontStyleList: function(filter, list) {
					if (list === null) {
						return;
					}
					list.clear();
					list.loadAll(this.getFontStyleDefaultConfig());
				},

				/**
				 * Возвращает тип данных значения показателя.
				 * @protected
				 * @virtual
				 * @return {Terrasoft.DataValueType} Возвращает тип данных значения показателя.
				 */
				getValueDataValueType: function() {
					var result = Terrasoft.DataValueType.TEXT;
					var aggregationType = this.get("aggregationType");
					var columnDataValueType = this.get("aggregationColumn");
					if (aggregationType && (aggregationType.value === Terrasoft.AggregationType.COUNT)) {
						result = Terrasoft.DataValueType.INTEGER;
					} else if (!this.Ext.isEmpty(columnDataValueType)) {
						result = columnDataValueType.dataValueType;
					}
					return result;
				},

				/**
				 * Возвращает шаблон значения для оторажения форматирования.
				 * @protected
				 * @virtual
				 * @return {String} Возвращает шаблон значения для оторажения форматирования.
				 */
				getFormatValueTemplate: function() {
					var result;
					var format = this.get("format");
					var dataValueType = this.getValueDataValueType();
					switch (dataValueType) {
						case Terrasoft.DataValueType.INTEGER:
						case Terrasoft.DataValueType.FLOAT:
						case Terrasoft.DataValueType.MONEY:
							var numberTemplate = 1000000.00;
							result = Terrasoft.getFormattedNumberValue(numberTemplate, format);
							break;
						case Terrasoft.DataValueType.TIME:
						case Terrasoft.DataValueType.DATE_TIME:
						case Terrasoft.DataValueType.DATE:
							var dateTemplate = new Date();
							var dateFormat = format.dateFormat || Terrasoft.Resources.CultureSettings.dateFormat;
							result = this.Ext.Date.format(dateTemplate, dateFormat);
							break;
					}
					return result;
				},

				/**
				 * Возвращает объект настройки диалогового окна настройки формата.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.DataValueType} dataValueType Тип данных показателя.
				 * @return {Object} Возвращает объект настройки диалогового окна настройки формата.
				 */
				getFormatSettingsConfig: function(dataValueType) {
					var format = this.get("format");
					var config = {
						textDecorator: {
							dataValueType: Terrasoft.DataValueType.TEXT,
							caption: this.get("Resources.Strings.FormatTextLabel"),
							value: format.textDecorator,
							description: this.get("Resources.Strings.FormatTextDescription")
						}
					};
					var decimalPrecision = (this.Ext.isDefined(format.decimalPrecision)) ? format.decimalPrecision :
						(format.type === Terrasoft.DataValueType.FLOAT && 2 || 0);
					switch (dataValueType) {
						case Terrasoft.DataValueType.INTEGER:
						case Terrasoft.DataValueType.FLOAT:
						case Terrasoft.DataValueType.MONEY:
							var numberFormatConfig = {
								decimalPrecision: {
									dataValueType: Terrasoft.DataValueType.INTEGER,
									caption: this.get("Resources.Strings.FormatDecimalPrecision"),
									value: decimalPrecision,
									description: this.get("Resources.Strings.FormatDecimalPrecisionDescription")
								}
							};
							this.Ext.apply(config, numberFormatConfig);
							break;
						case Terrasoft.DataValueType.TIME:
						case Terrasoft.DataValueType.DATE_TIME:
						case Terrasoft.DataValueType.DATE:
							var dateFormat = format.dateFormat;
							var dateFormatConfig = {
								dateFormatWithTime: {
									dataValueType: Terrasoft.DataValueType.BOOLEAN,
									caption: this.get("Resources.Strings.FormatDateTime"),
									value: dateFormat && (dateFormat !== Terrasoft.Resources.CultureSettings.dateFormat),
									description: this.get("Resources.Strings.FormatDateTimeDescription")

								}
							};
							this.Ext.apply(config, dateFormatConfig);
							break;
					}
					return config;
				},

				/**
				 * Метод обработки закрытия диалогового окна настройки формата.
				 * @protected
				 * @virtual
				 * @param {String} returnCode Код закрытия окна.
				 * @param {Object} controlData Объект настройки элементов управления.
				 */
				onFormatSettingsClose: function(returnCode, controlData) {
					if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
						var format = {};
						Terrasoft.each(controlData, function(property, propertyName) {
							var propertyValue = property.value;
							if (propertyName === "textDecorator") {
								format[propertyName] = propertyValue || "{0}";
							} else if (propertyName === "dateFormatWithTime") {
								var dateFormatPropertyName = "dateFormat";
								if (propertyValue) {
									var dateFormat = this.Ext.String.format(
										"{0} {1}",
										Terrasoft.Resources.CultureSettings.dateFormat,
										Terrasoft.Resources.CultureSettings.timeFormat
									);
									format[dateFormatPropertyName] = dateFormat;
								} else {
									format[dateFormatPropertyName] = Terrasoft.Resources.CultureSettings.dateFormat;
								}
							} else if (propertyName === "decimalPrecision") {
								var dataValueTypePropertyName = "type";
								format[dataValueTypePropertyName] = (propertyValue)
									? Terrasoft.DataValueType.FLOAT
									: Terrasoft.DataValueType.INTEGER;
								format[propertyName] = propertyValue;
							} else {
								format[propertyName] = propertyValue;
							}
						}, this);
						this.set("format", format);
					}
				},

				/**
				 * Метод открытия диалогового окна настройки формата.
				 * @protected
				 * @virtual
				 */
				openFormatSettings: function() {
					var dataValueType = this.getValueDataValueType();
					var formatSettingConfig = this.getFormatSettingsConfig(dataValueType);
					Terrasoft.utils.inputBox(
						this.get("Resources.Strings.FormatLabel"),
						this.onFormatSettingsClose,
						["yes", "cancel"],
						this,
						formatSettingConfig,
						{ defaultButton: 0 }
					);
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
					"name": "FontStyle",
					"parentName": "FormatProperties",
					"propertyName": "items",
					"values": {
						"dataValueType": Terrasoft.DataValueType.ENUM,
						"bindTo": "fontStyle",
						"labelConfig": {
							"visible": true,
							"caption": {
								"bindTo": "Resources.Strings.FontStyleLabel"
							}
						},
						"controlConfig": {
							"className": "Terrasoft.ComboBoxEdit",
							"prepareList": {
								"bindTo": "prepareFontStyleList"
							},
							"list": {
								"bindTo": "fontStyleList"
							}
						}
					}
				},
				{
					"operation": "insert",
					"name": "FormatValue",
					"parentName": "FormatProperties",
					"propertyName": "items",
					"values": {
						"dataValueType": Terrasoft.DataValueType.TEXT,
						"bindTo": "getFormatValueTemplate",
						"labelConfig": {
							"visible": true,
							"caption": {
								"bindTo": "Resources.Strings.FormatLabel"
							}
						},
						"classes": { "wrapClass": ["lookup-only-editable"] },
						"controlConfig": {
							"className": "Terrasoft.TextEdit",
							"readonly": true,
							"rightIconClick": {
								"bindTo": "openFormatSettings"
							},
							"rightIconClasses": ["lookup-edit-right-icon"]
						}
					}
				}
			]
		};
	});