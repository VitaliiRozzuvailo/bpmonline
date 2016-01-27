define("RuleRelationLookupEditPageV2", ["RuleRelationLookupEditPageV2Resources", "EntityStructureHelper"],
	function (resources, EntityStructureHelper) {
		return {
			entitySchemaName: "RuleRelation",
			details: /**SCHEMA_DETAILS*/{
				ActionsInRule: {
					schemaName: "FieldForceActionsInRuleDetailV2",
					entitySchemaName: "FieldForceActionsInRule",
					filter: {
						masterColumn: "Id",
						detailColumn: "FieldForceRule"
					}
				}
			}/**SCHEMA_DETAILS*/,
			attributes: {
				"SchemaUIdFrom": {
					caption: {bindTo: "Resources.Strings.ObjectCaption"},
					referenceSchemaName: "SysModule",
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					isLookup: true,
					enabled: false

				},
				"ColumnUIdFrom": {
					caption: {bindTo: "Resources.Strings.ColumnCaption"},
					referenceSchemaName: "SysModule",
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					isLookup: true
				},
				"SchemaUIdTo": {
					caption: {bindTo: "Resources.Strings.ObjectCaption"},
					referenceSchemaName: "SysModule",
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					isLookup: true

				},
				"ColumnUIdTo": {
					caption: {bindTo: "Resources.Strings.ColumnCaption"},
					referenceSchemaName: "SysModule",
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					isLookup: true
				},
				"ColumnUIdFromControlEnabled": false,
				"ColumnUIdToControlEnabled": false
			},
			methods: {
				/**
				 * Скрывает пункты меню кнопки "Действия".
				 * @inheritdoc BasePageV2#initActionButtonMenu
				 * @overridden
				 */
				initActionButtonMenu: Terrasoft.emptyFn,
				/**
				 * Скрывает пункты меню кнопки "Вид".
				 * @inheritdoc BasePageV2#initActionButtonMenu
				 * @overridden
				 */
				initViewOptionsButtonMenu: Terrasoft.emptyFn,

				/**
				 * Инициализирует начальные значения модели.
				 * @overridden
				 */
				init: function () {
					this.callParent(arguments);
					this.set("SchemaList", this.Ext.create("Terrasoft.Collection"));
					this.set("SchemaColumnList", this.Ext.create("Terrasoft.Collection"));
					this.set("DependentSchemaList", this.Ext.create("Terrasoft.Collection"));
					this.set("DependentSchemaColumnList", this.Ext.create("Terrasoft.Collection"));
					this.initEntityStructureHelper();
				},

				/**
				 * Возвращает заголовок страницы.
				 * @protected
				 * @virtual
				 */
				getHeader: function () {
					return this.get("Resources.Strings.HeaderCaption");
				},

				/**
				 * Задает значения комбобоксов из атрибутов если карточка открыта на редактирование.
				 * @overridden
				 */
				onEntityInitialized: function () {
					this.callParent(arguments);
					this.setValues();
				},

				/**
				 * Инициализация EntityStructureHelper.
				 */
				initEntityStructureHelper: function () {
					var params = this.sandbox.publish("StructureExplorerInfo", null, [this.sandbox.id]);
					if (this.Ext.isEmpty(params)) {
						params = {
							summaryColumnsOnly: false,
							useBackwards: true,
							firstColumnsOnly: false
						};
					}
					params.sa = this.sandbox;
					EntityStructureHelper.init(params);
				},

				/**
				 * Сохраняет в атрибут значение колонки из схемы.
				 * @param {String} schemaNameAttribute имя схемы для поиска колонки
				 * @param {String} entitySchemaColumnUIdAttribute имя колонки
				 * @param {String} setAttributeName имя аттрибута в который сохраняться
				 */
				setColumnItem: function (schemaNameAttribute, entitySchemaColumnUIdAttribute, setAttributeName) {
					var schemaName = this.get(schemaNameAttribute);
					var entitySchemaColumnUId = this.get(entitySchemaColumnUIdAttribute);
					if (this.Ext.isEmpty(entitySchemaColumnUId) || this.Ext.isEmpty(schemaName)) {
						return;
					}
					EntityStructureHelper.getItems({referenceSchemaName: schemaName}, function (items) {
						var item = items[entitySchemaColumnUId];
						if (!item) {
							return;
						}
						this.set(setAttributeName, item);
					}, false, this);
				},

				/**
				 * Формирует и устанавливает список колонок.
				 * @param {String} attribute Имя аттрибута
				 * @param {Terrasoft.Collection} list Коллекция, в которую будут загружены данные
				 */
				setTextColumnItems: function (attribute, list) {
					if (this.Ext.isEmpty(attribute)) {
						return;
					}
					var fromSchemaName = this.get(attribute);
					if (this.Ext.isEmpty(fromSchemaName)) {
						return;
					}
					EntityStructureHelper.getItems({referenceSchemaName: fromSchemaName}, function (items) {
						var textItems = {};
						Terrasoft.each(items, function (item) {
							if (item.dataValueType === Terrasoft.DataValueType.TEXT) {
								textItems[item.value] = item;
							}
						});
						list.loadAll(textItems);
					}, false, this);
				},

				/**
				 * Устанавливает значение комбобокса с колонкой которую связываем связи.
				 */
				initColumnUIdFromValue: function () {
					this.setColumnItem("fromSchemaName", "EntitySchemaColumnUId", "ColumnUIdFromValue");
				},

				/**
				 * Устанавливает значение комбобокса с колонкой с которой связываем.
				 */
				initColumnUIdToValue: function () {
					this.setColumnItem("toSchemaName", "EntitySchemaSearchColumnUId", "ColumnUIdToValue");
				},

				/**
				 * Устанавливает значения комбобоксам.
				 */
				setValues: function () {
					this.setSchemaControlValue(
						"EntitySchemaUId",
						"SchemaUIdFromValue",
						"fromSchemaName",
						function () {
							this.set("ColumnUIdFromControlEnabled", true);
							this.initColumnUIdFromValue();
						});
					this.setSchemaControlValue(
						"EntitySchemaSearchUId",
						"SchemaUIdToValue",
						"toSchemaName",
						function () {
							this.set("ColumnUIdToControlEnabled", true);
							this.initColumnUIdToValue();
						});
				},

				/**
				 * Устанавливает значения для комбобокса.
				 * @param {String} column
				 * @param {String} itemProperty
				 * @param {String} schemaNameProperty
				 * @param {function} callback Функция обратного вызова. Параметром в функцию передается контекст
				 */
				setSchemaControlValue: function (column, itemProperty, schemaNameProperty, callback) {
					var columnValue = this.get(column);
					if (!columnValue) {
						return;
					}
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "SysSchema"
					});
					esq.isDistinct = true;
					esq.addColumn("Name");
					esq.addColumn("Caption");
					esq.filters.add("UId", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "UId", columnValue));
					esq.getEntityCollection(function (result) {
						if (!result.success) {
							return;
						}
						if (!result.collection.isEmpty()) {
							var firstItem = result.collection.getByIndex(0);
							var itemCaption = firstItem.get("Caption");
							var schemaName = firstItem.get("Name");
							this.set(itemProperty, {
								displayValue: itemCaption,
								value: columnValue
							});
							this.set(schemaNameProperty, schemaName);
							callback.call(this);
						}
					}, this);
				},

				/**
				 * Наполняет комбобокс разделами для связи. Вызывается по клику на комбобоксы "Объект".
				 * @param {String} filter текст по которому будет производиться поиск
				 * @param {Terrasoft.Collection} list Коллекция, в которую будут загружены данные
				 */
				setDestinationSchemaList: function (filter, list) {
					if (this.Ext.isEmpty(list)) {
						return;
					}
					list.clear();
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "RuleRelationSections",
						isDistinct: true
					});
					esq.addColumn("SectionSchemaUId", "UId");
					esq.addColumn("[SysSchema:UId:SectionSchemaUId].Name", "Name");
					esq.addColumn("[SysSchema:UId:SectionSchemaUId].Caption", "Caption");
					esq.getEntityCollection(function (result) {
						if (!result.success) {
							return;
						}
						var collection = result.collection;
						var columns = {};
						if (!collection.isEmpty()) {
							collection.each(function(item) {
								var itemUId = item.get("UId");
								var itemName = item.get("Caption");
								if (!list.contains(itemUId)) {
									columns[itemUId] = {
										displayValue: itemName,
										value: itemUId
									};
								}
							});
						}
						list.loadAll(columns);
					}, this);
				},

				/**
				 * Наполняет комбобокс разделами для связи. Вызывается по клику на комбобоксы "Объект который связывается".
				 * @param {String} filter текст по которому будет производиться поиск
				 * @param {Terrasoft.Collection} list Коллекция, в которую будут загружены данные
				 */
				setFromSchemaList: function (filter, list) {
					if (this.Ext.isEmpty(list)) {
						return;
					}
					list.clear();
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "RuleRelationSections",
						isDistinct: true
					});
					esq.addColumn("SectionSchemaUId", "UId");
					esq.addColumn("[SysSchema:UId:SectionSchemaUId].Name", "Name");
					esq.addColumn("[SysSchema:UId:SectionSchemaUId].Caption", "Caption");
					var filter = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
							"Name", "ACTIVITY");
					esq.filters.addItem(filter);
					esq.getEntityCollection(function (result) {
						if (!result.success) {
							return;
						}
						var collection = result.collection;
						var columns = {};
						if (!collection.isEmpty()) {
							collection.each(function(item) {
								var itemUId = item.get("UId");
								var itemName = item.get("Caption");
								if (!list.contains(itemUId)) {
									columns[itemUId] = {
										displayValue: itemName,
										value: itemUId
									};
								}
							});
						}
						list.loadAll(columns);
					}, this);
				},

				/**
				 * Обработчик нажатия на комбобокс с колонкой которую связываем.
				 * @param {String} filter текст по которому будет производиться поиск
				 * @param {Terrasoft.Collection} list Коллекция, в которую будут загружены данные
				 */
				setColumnList: function (filter, list) {
					if (this.Ext.isEmpty(list)) {
						return;
					}
					list.clear();
					this.setTextColumnItems("fromSchemaName", list);
				},

				/**
				 * Обработчик нажатия на комбобокс с колонкой для связи.
				 * @param {String} filter текст по которому будет производиться поиск
				 * @param {Terrasoft.Collection} list Коллекция, в которую будут загружены данные
				 */
				setDependentColumnList: function (filter, list) {
					if (this.Ext.isEmpty(list)) {
						return;
					}
					list.clear();
					this.setTextColumnItems("toSchemaName", list);
				},

				/**
				 * Обработчик выбора раздела из комбобокса объекта для связи.
				 * @param {Object} item Новый объект
				 */
				changeSchemaFrom: function (item) {
					if (this.Ext.isEmpty(item)) {
						return;
					}
					this.set("ColumnUIdFromValue", null);
					this.set("EntitySchemaUId", item.value);
					this.set("ColumnUIdFromControlEnabled", true);
					this.getSchemaNameByUId(item.value, function (schemaName) {
						this.set("fromSchemaName", schemaName);
					});
				},

				/**
				 * Обработчик выбора раздела из комбобокса объекта с которым связываемся.
				 * @param {Object} item Новый объект
				 */
				changeSchemaTo: function (item) {
					if (this.Ext.isEmpty(item)) {
						return;
					}
					this.set("ColumnUIdToValue", null);
					this.set("EntitySchemaSearchUId", item.value);
					this.set("ColumnUIdToControlEnabled", true);
					this.getSchemaNameByUId(item.value, function (schemaName) {
						this.set("toSchemaName", schemaName);
					}, this);
				},

				/**
				 * Обработчик выбора колонки из комбобокса колонки для связи.
				 * @param {Object} item Новый объект
				 */
				changeColumnFrom: function (item) {
					if (!this.Ext.isEmpty(item)) {
						this.set("EntitySchemaColumnUId", item.value);
					} else {
						this.set("EntitySchemaColumnUId", null);
					}
				},

				/**
				 * Обработчик выбора колонки из комбобокса колонки с которой связываемся.
				 * @param {Object} item Новый объект
				 */
				changeColumnTo: function (item) {
					if (!this.Ext.isEmpty(item)){
						this.set("EntitySchemaSearchColumnUId", item.value);
					} else {
						this.set("EntitySchemaSearchColumnUId", null);
					}
				},

				/**
				 * Выбирает название схемы по UId'у и возвращает параметром в callback
				 * @param {String} uid
				 * @param {function} callback Функция обратного вызова. Параметром в функцию передается название схемы
				 * @param {Object} scope
				 */
				getSchemaNameByUId: function (uid, callback, scope) {
					Terrasoft.EntitySchemaManager.initialize(function () {
						var items = Terrasoft.EntitySchemaManager.getItems();
						var itemObject = items
							.filterByFn(function (item) {
								return item.uId === uid;
							});
						if (this.Ext.isEmpty(itemObject)) {
							return;
						}
						var item = itemObject.getByIndex(0);
						if (this.Ext.isEmpty(item)) {
							return;
						}
						callback.call(scope || this, item.name);
					}, this);
				}
			},
			messages: {
				/**
				 * @message GetEntitySchema
				 * Публикация сообщения GetEntitySchema.
				 */
				"GetEntitySchema": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				/**
				 * @message StructureExplorerInfo
				 * Публикация сообщения StructureExplorerInfo.
				 */
				"StructureExplorerInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "remove",
					"name": "TabsContainer"
				},
				{
					"operation": "remove",
					"name": "ViewOptionsButton"
				},
				{
					"operation": "insert",
					"name": "Name",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"layout": {
							"colSpan": 24,
							"column": 0,
							"row": 0
						}
					}
				},
				{
					"operation": "insert",
					"name": "Description",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"layout": {
							"colSpan": 24,
							"column": 0,
							"row": 1
						}
					}
				},
				{
					"operation": "insert",
					"name": "Rule",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"layout": {
							"colSpan": 24,
							"column": 0,
							"row": 2
						}
					}
				},
				{
					"operation": "insert",
					"name": "ObjectFromControlGroup",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"caption": {bindTo: "Resources.Strings.ObjectFromCaption"},
						"layout": {
							"colSpan": 24,
							"column": 0,
							"row": 4
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ObjectFromControlGroup",
					"propertyName": "items",
					"name": "ObjectFromLayout",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ObjectToControlGroup",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"caption": {bindTo: "Resources.Strings.ObjectToCaption"},
						"layout": {
							"colSpan": 24,
							"column": 0,
							"row": 5
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ObjectToControlGroup",
					"propertyName": "items",
					"name": "ObjectToLayout",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "SchemaUIdFromControl",
					"parentName": "ObjectFromLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"bindTo": "SchemaUIdFrom",
						"enabled": true,
						"isRequired": true,
						"contentType": Terrasoft.ContentType.ENUM,
						"controlConfig": {
							"className": "Terrasoft.ComboBoxEdit",
							"prepareList": {"bindTo": "setFromSchemaList"},
							"value": {
								"bindTo": "SchemaUIdFromValue"
							},
							"change": {"bindTo": "changeSchemaFrom"},
							"list": {"bindTo": "SchemaList"}
						}
					}
				},
				{
					"operation": "insert",
					"name": "ColumnUIdFromControl",
					"parentName": "ObjectFromLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 0, "colSpan": 12},
						"bindTo": "ColumnUIdFrom",
						"enabled": {"bindTo": "ColumnUIdFromControlEnabled"},
						"isRequired": true,
						"contentType": Terrasoft.ContentType.ENUM,
						"controlConfig": {
							"className": "Terrasoft.ComboBoxEdit",
							"prepareList": {"bindTo": "setColumnList"},
							"list": {"bindTo": "SchemaColumnList"},
							"change": {"bindTo": "changeColumnFrom"},
							"value": {
								"bindTo": "ColumnUIdFromValue"
							}
						}
					}
				},
				{
					"operation": "insert",
					"name": "SchemaUIdToControl",
					"parentName": "ObjectToLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 0, "row": 0, "colSpan": 12},
						"bindTo": "SchemaUIdTo",
						"enabled": true,
						"isRequired": true,
						"contentType": Terrasoft.ContentType.ENUM,
						"controlConfig": {
							"className": "Terrasoft.ComboBoxEdit",
							"prepareList": {"bindTo": "setDestinationSchemaList"},
							"value": {
								"bindTo": "SchemaUIdToValue"
							},
							"change": {"bindTo": "changeSchemaTo"},
							"list": {"bindTo": "DependentSchemaList"}
						}
					}
				},
				{
					"operation": "insert",
					"name": "ColumnUIdToControl",
					"parentName": "ObjectToLayout",
					"propertyName": "items",
					"values": {
						"layout": {"column": 12, "row": 0, "colSpan": 12},
						"bindTo": "ColumnUIdTo",
						"enabled": {"bindTo": "ColumnUIdToControlEnabled"},
						"isRequired": true,
						"contentType": Terrasoft.ContentType.ENUM,
						"controlConfig": {
							"className": "Terrasoft.ComboBoxEdit",
							"prepareList": {"bindTo": "setDependentColumnList"},
							"list": {"bindTo": "DependentSchemaColumnList"},
							"change": {"bindTo": "changeColumnTo"},
							"value": {
								"bindTo": "ColumnUIdToValue"
							}
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
