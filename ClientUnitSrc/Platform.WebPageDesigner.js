define("WebPageDesigner", ["terrasoft"],
	function(Terrasoft) {
		return {
			messages: {
				/**
				 * Подписка на сообщения для получения параметров инициализации модуля web-страницы.
				 */
				"GetWebPageConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Публикация сообщения для генерации web-страницы.
				 */
				"GenerateWebPage": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			attributes: {
				/**
				 * Атрибут ссылки модуля.
				 */
				url: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true
				},
				/**
				 * Атрибут стиля модуля.
				 */
				style: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Переопределенный атрибут названия схемы (снята обязательность).
				 */
				entitySchemaName: {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: false
				}
			},
			methods: {
				/**
				 * Возвращает название сообщения получения настроек модуля виджета.
				 * @protected
				 * @overridden
				 * @return {String} Возвращает название сообщение получения настроек модуля виджета.
				 */
				getWidgetConfigMessage: function() {
					return "GetWebPageConfig";
				},

				/**
				 * Возвращает название сообщение обновления виджета.
				 * @protected
				 * @overridden
				 * @return {String} Возвращает название сообщение обновления виджета.
				 */
				getWidgetRefreshMessage: function() {
					return "GenerateWebPage";
				},

				/**
				 * Возвращает идентификатора модуля.
				 * @protected
				 * @overridden
				 * @returns {string} Идентификатор модуля.
				 */
				getModuleId: function() {
					return this.sandbox.id;
				},

				/**
				 * Возвращает название модуля виджета.
				 * @protected
				 * @overridden
				 * @return {String} Возвращает название модуля виджета.
				 */
				getWidgetModuleName: function() {
					return "WebPageModule";
				},

				/**
				 * Инициализирует поля в соответствии с конфигурацией модуля.
				 * @protected
				 * @overridden
				 */
				initializeValues: function(callback, scope) {
					var config = this.sandbox.publish("GetModuleConfig", null, [this.getModuleId()]);
					this.loadFromColumnValues(config);
					callback.call(scope);
				},

				/**
				 * Возвращает объект соотношения свойств модуля виджета и модуля настройки виджета.
				 * @protected
				 * @overridden
				 * @return {Object} Возвращает объект соотношения свойств модуля виджета и модуля настройки виджета.
				 */
				getWidgetModulePropertiesTranslator: function() {
					var widgetModulePropertiesTranslator = {
						moduleName: "webPageName",
						caption: "caption",
						url: "url",
						style: "style"
					};
					return Ext.apply(this.callParent(arguments), widgetModulePropertiesTranslator);
				}
			},
			rules: {},
			diff: [
				{
					"operation": "remove",
					"name": "QueryProperties"
				},
				{
					"operation": "remove",
					"name": "EntitySchemaName"
				},
				{
					"operation": "remove",
					"name": "FilterPropertiesGroup"
				},
				{
					"operation": "remove",
					"name": "FilterProperties"
				},
				{
					"operation": "remove",
					"name": "SectionBindingGroup"
				},
				{
					"operation": "remove",
					"name": "sectionBindingColumn"
				},
				{
					"operation": "remove",
					"name": "FormatProperties"
				},
				{
					"operation": "insert",
					"name": "Url",
					"parentName": "WidgetProperties",
					"propertyName": "items",
					"values": {
						"bindTo": "url",
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 12
						},
						"contentType": Terrasoft.ContentType.TEXT,
						"labelConfig": {
							"visible": true,
							"caption": {
								"bindTo": "Resources.Strings.UrlEditCaption"
							}
						}
					}
				},
				{
					"operation": "insert",
					"name": "Style",
					"parentName": "WidgetProperties",
					"propertyName": "items",
					"values": {
						"bindTo": "style",
						"layout": {
							"column": 0,
							"row": 2,
							"colSpan": 12
						},
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"labelConfig": {
							"visible": true,
							"caption": {
								"bindTo": "Resources.Strings.StyleEditCaption"
							}
						}
					}
				}
			]
		};
	});
