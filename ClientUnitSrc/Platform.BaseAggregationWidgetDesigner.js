define("BaseAggregationWidgetDesigner", ["terrasoft"],
function(Terrasoft) {
	return {
		messages: {
			/**
			 * Подписка на сообщение StructureExplorer.
			 */
			"StructureExplorerInfo": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},
			/**
			 * Подписка на сообщение выбора колонки в StructureExplorer.
			 */
			"ColumnSelected": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		attributes: {

			/**
			 * Колонка типа агрегации.
			 */
			aggregationType: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isRequired: true,
				value: {
					value: Terrasoft.AggregationType.COUNT,
					displayValue: Terrasoft.Resources.AggregationType.COUNT
				}
			},

			/**
			 * Колонка с колонкой агрегации.
			 */
			aggregationColumn: {
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				isLookup: true,
				entityStructureConfig: {
					useBackwards: false,
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
			 * Возвращает объект соотношения свойств модуля виджета и модуля настройки виджета.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект соотношения свойств модуля виджета и модуля настройки виджета.
			 */
			getWidgetModulePropertiesTranslator: function() {
				var aggregationProperties = {
					aggregationType: "aggregationType",
					aggregationColumn: "aggregationColumn"
				};
				return Ext.apply(this.callParent(arguments), aggregationProperties);
			},

			/**
			 * Метод очистки атрибутов агрегирующей колонки.
			 * @protected
			 * @virtual
			 */
			clearColumn: function() {
				this.set("aggregationColumn", null);
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
			 * Метод обработки события изменения функции агрегации.
			 * @protected
			 * @virtual
			 */
			onAggregationTypeChange: function() {
				if (this.get("moduleLoaded")) {
					this.clearColumn();
				}
			},

			/**
			 * Метод опредиления видимости агрегирующей колонки.
			 * @private
			 * @param {Object} value Значение.
			 * @return {Boolean} Признак видимости агрегирующей колонки.
			 */
			aggregationColumnVisibilityConverter: function(value) {
				var entitySchema = this.get("entitySchemaName");
				var allowedAggregationTypes = [
					Terrasoft.AggregationType.SUM,
					Terrasoft.AggregationType.MAX,
					Terrasoft.AggregationType.MIN,
					Terrasoft.AggregationType.AVG
				];
				return entitySchema && value && value.value &&
					Terrasoft.contains(allowedAggregationTypes, value.value);
			},

			/**
			 * Метод установки настроек валидации.
			 * @protected
			 * @virtual
			 */
			setValidationConfig: function() {
				this.callParent(arguments);
				this.addColumnValidator("aggregationColumn", function(value) {
					var invalidMessage = "";
					var isVisible = this.aggregationColumnVisibilityConverter(this.get("aggregationType"));
					if (isVisible && !value) {
						invalidMessage = Terrasoft.Resources.BaseViewModel.columnRequiredValidationMessage;
					}
					return {
						fullInvalidMessage: invalidMessage,
						invalidMessage: invalidMessage
					};
				});
			},

			/**
			 * Возвращает объект типов агрегации.
			 * @protected
			 * @virtual
			 * @return {Object} Возвращает объект типов агрегации.
			 */
			getAggregationTypeDefaultConfig: function() {
				var aggregationTypeDefaultConfig = {};
				Terrasoft.each(Terrasoft.AggregationType, function(typeValue, typeName) {
					if (typeValue === Terrasoft.AggregationType.NONE) {
						return;
					}
					aggregationTypeDefaultConfig[typeValue] = {
						value: typeValue,
						displayValue: Terrasoft.Resources.AggregationType[typeName]
					};
				}, this);
				return aggregationTypeDefaultConfig;
			},

			/**
			 * Наполняет коллекцию типов функций агрегации.
			 * @protected
			 * @virtual
			 * @param {String} filter Строка фильтрации.
			 * @param {Terrasoft.Collection} list Список.
			 */
			prepareAggregationTypesList: function(filter, list) {
				if (list === null) {
					return;
				}
				list.clear();
				list.loadAll(this.getAggregationTypeDefaultConfig());
			},

			/**
			 * Возвращает объект значения функции агрегации.
			 * @protected
			 * @virtual
			 * @param {Number} aggregationTypeValue Тип агрегации.
			 * @return {Object} Возвращает объект значения функции агрегации.
			 */
			getAggregationTypeLookupValue: function(aggregationTypeValue) {
				var aggregationTypeDefaultConfig = this.getAggregationTypeDefaultConfig();
				aggregationTypeValue = (Ext.isNumber(aggregationTypeValue) || aggregationTypeValue.match(/\d+/g))
					? aggregationTypeValue
					: Terrasoft.AggregationType[aggregationTypeValue.toUpperCase()];
				return aggregationTypeDefaultConfig[aggregationTypeValue];
			},

			/**
			 * @inheritdoc Terrasoft.BaseWidgetDesigner#setAttributeDisplayValue
			 * Установливет значение для колонки типа агрегации.
			 * @protected
			 * @overridden
			 */
			setAttributeDisplayValue: function(propertyName, propertyValue) {
				if (propertyName === "aggregationType") {
					var aggregationTypeLookupValue =
						this.getAggregationTypeLookupValue(propertyValue);
					this.set(propertyName, aggregationTypeLookupValue);
				} else {
					this.callParent(arguments);
				}
			}
		},
		diff: [
			{
				"operation": "insert",
				"name": "AggregationType",
				"parentName": "QueryProperties",
				"propertyName": "items",
				"values": {
					"dataValueType": Terrasoft.DataValueType.ENUM,
					"bindTo": "aggregationType",
					"labelConfig": {
						"caption": { "bindTo": "Resources.Strings.AggregationTypeLabel" }
					},
					"controlConfig": {
						"className": "Terrasoft.ComboBoxEdit",
						"prepareList": { "bindTo": "prepareAggregationTypesList" },
						"list": { "bindTo": "aggregationTypeList" }
					}
				}
			},
			{
				"operation": "insert",
				"name": "aggregationColumn",
				"parentName": "QueryProperties",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.MODEL_ITEM,
					"generator": "ColumnEditGenerator.generatePartial",
					"labelConfig": {
						"caption": { "bindTo": "Resources.Strings.AggregationColumnLabel" },
						"isRequired": true
					},
					"visible": {
						"bindTo": "aggregationType",
						"bindConfig": { "converter": "aggregationColumnVisibilityConverter"}
					}
				}
			}
		]
	};
});