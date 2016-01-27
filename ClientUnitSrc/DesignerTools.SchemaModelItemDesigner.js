define("SchemaModelItemDesigner", ["terrasoft"],
	function(Terrasoft) {
		return {
			attributes: {
				/**
				 * Признак спрятоной подписи.
				 */
				HideLabel: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Размер текста.
				 */
				TextSize: {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Признак доступности поля.
				 */
				EnabledPropety: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Признак, что тип колонки является многострочным текстом.
				 */
				IsMultilineText: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}
			},
			methods: {

				/**
				 * Устанавливает заголовок модуля дизайнера.
				 * @overridden
				 */
				changeDesignerCaption: Terrasoft.emptyFn,

				/**
				 * Инициализирует начальные значения модели.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.loadFromModelItem();
						callback.call(scope);
					}, this]);
				},

				/**
				 * Инициализирует модель параметрами элемента схемы.
				 * @protected
				 * @virtual
				 */
				loadFromModelItem: function() {
					var modelItem = this.get("ModelItem");
					var itemConfig = modelItem.itemConfig;
					this.set("EnabledPropety", itemConfig.enabled === false);
					var textSizeList = this.get("TextSizeList");
					var textSizeValue = itemConfig.textSize || null;
					var selectedTextSize = textSizeList.filterByFn(function(textSize) {
						return textSize.value === textSizeValue;
					}, this);
					this.set("TextSize", selectedTextSize.getByIndex(0));
					if (itemConfig.labelConfig && (itemConfig.labelConfig.visible === false)) {
						this.set("HideLabel", true);
					}
					this.set("IsMultilineText", itemConfig.contentType === Terrasoft.ContentType.LONG_TEXT);
				},

				/**
				 * Обновляет элемент схемы значенимя модели.
				 * @protected
				 * @virtual
				 */
				updateModelItem: function() {
					var dataValueType = this.get("DataValueType");
					var modelItem = this.get("ModelItem");
					var itemConfig = modelItem.itemConfig;
					var labelConfig = (itemConfig.labelConfig || (itemConfig.labelConfig = {}));
					if (this.get("HideLabel")) {
						labelConfig.visible = false;
					} else {
						delete labelConfig.visible;
					}
					itemConfig.enabled = !this.get("EnabledPropety");
					var textSize = this.get("TextSize");
					if (Ext.isEmpty(textSize) || Ext.isEmpty(textSize.value)) {
						delete itemConfig.textSize;
					} else {
						itemConfig.textSize = textSize.value;
					}
					if (this.isMultilineTextFieldVisible(dataValueType)) {
						if (this.get("IsMultilineText")) {
							itemConfig.contentType = Terrasoft.ContentType.LONG_TEXT;
						} else {
							delete itemConfig.contentType;
							modelItem.set("rowSpan", 1);
						}
					}
					var columnName = this.get("Name");
					if (itemConfig.bindTo) {
						itemConfig.bindTo = columnName;
					} else {
						itemConfig.name = columnName;
					}
				},

				/**
				 * @inheritodoc EntitySchemaColumnDesigner#updateColumn
				 * @overridden
				 */
				updateColumn: function() {
					this.updateModelItem();
					this.callParent(arguments);
				},

				/**
				 * @inheritodoc EntitySchemaColumnDesigner#onSaved
				 * @overridden
				 */
				onSaved: function() {
					var config = this.get("ModelItem");
					this.sandbox.publish("OnDesignerSaved", config, [this.sandbox.id]);
					this.destroyModule();
				},

				/**
				 * Возвращает конфигурацию элемента схемы.
				 * @overridden
				 * @virtual
				 * @return {Object} конфигурация колонки.
				 */
				getColumnConfig: function() {
					var modelItem = this.sandbox.publish("GetColumnConfig", null, [this.sandbox.id]);
					this.set("ModelItem", modelItem);
					return modelItem;
				},

				/**
				 * Определяет видимость поля MultilineText.
				 * @protected
				 * @virtual
				 * @param dataValueType {Object} Объект поля типа справочник.
				 * @return {Boolean} Признак видимости поля MultilineText.
				 */
				isMultilineTextFieldVisible: function(dataValueType) {
					dataValueType = dataValueType && dataValueType.value;
					return dataValueType === Terrasoft.DataValueType.TEXT;
				},

				/**
				 * Метод отмены изменений настройки колонки.
				 * @protected
				 * @virtual
				 */
				cancel: function() {
					this.sandbox.publish("OnDesignerCanceled", null, [this.sandbox.id]);
					this.destroyModule();
				}
			},
			diff: [
				{
					"operation": "insert",
					"name": "HeaderContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["card-content-container"],
						"items": []
					}
				},
				{
					"operation": "move",
					"name": "BaseDesignerHeaderContainer",
					"parentName": "HeaderContainer",
					"propertyName": "items"
				}, {
					"operation": "insert",
					"name": "Title",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"index": 0,
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": { bindTo: "getDesignerCaption" },
						"labelConfig": {
							"classes": ["modal-box-title"]
						}
					}
				},
				{
					"operation": "insert",
					"name": "HideLabel",
					"parentName": "AdditionalPropertiesControlGroup",
					"propertyName": "items",
					"index": 0,
					"values": {
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 12
						},
						"labelConfig": {
							"caption": { "bindTo": "Resources.Strings.HideLabelCaption" }
						}
					}
				},
				{
					"operation": "insert",
					"name": "EnabledPropety",
					"parentName": "AdditionalPropertiesControlGroup",
					"propertyName": "items",
					"index": 1,
					"values": {
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 12
						},
						"labelConfig": {
							"caption": { "bindTo": "Resources.Strings.EnabledPropetyCaption" }
						}
					}
				},
				{
					"operation": "insert",
					"name": "IsMultilineText",
					"parentName": "AdditionalPropertiesControlGroup",
					"propertyName": "items",
					"index": 2,
					"values": {
						"layout": {
							"column": 12,
							"row": 0,
							"colSpan": 12
						},
						"labelConfig": {
							"caption": { "bindTo": "Resources.Strings.isMultilineTextLabel" }
						},
						"visible": {
							"bindTo": "DataValueType",
							"bindConfig": {converter: "isMultilineTextFieldVisible"}
						}
					}
				},
				{
					"operation": "merge",
					"name": "DataValueType",
					"values": { "enabled": false }
				}
			]
		};
	});