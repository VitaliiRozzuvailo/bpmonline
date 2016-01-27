define("SysSettingPage", ["BusinessRuleModule", "SysSettingPageResources"],
	function(BusinessRuleModule, resources) {
		var localizableStrings = resources.localizableStrings;
		return {
			entitySchemaName: "VwSysSetting",
			messages: {
				/**
				 * @message ResultSelectedRows
				 * Возвращает выбранные строки в справочнике
				 */
				"ResultSelectedRows": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			attributes: {
				"IsEditMode": {
					name: "IsEditMode",
					value: false,
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"ReferenceSchema": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					caption: localizableStrings.ReferenceSchemaCaption
				},
				"Type": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true,
					caption: localizableStrings.TypeCaption
				},
				"TextValue": {
					name: "TextValue",
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"SecureValue": {
					name: "SecureValue",
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"IntegerValue": {
					name: "IntegerValue",
					dataValueType: Terrasoft.DataValueType.INTEGER,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"FloatValue": {
					name: "FloatValue",
					dataValueType: Terrasoft.DataValueType.FLOAT,
					precision: 2,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"BooleanValue": {
					name: "BooleanValue",
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"DateValue": {
					name: "DateValue",
					dataValueType: Terrasoft.DataValueType.DATE,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"DateTimeValue": {
					name: "DateTimeValue",
					dataValueType: Terrasoft.DataValueType.DATE_TIME,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"LookupValue": {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"BinaryValue": {
					dataValueType: Terrasoft.DataValueType.BLOB,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}
			},
			rules: {},
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			methods: {

				/**
				 * Возвращает префикс собития изменения аттрибута модели представления.
				 * @protected
				 * @return {String} Префикс собития изменения аттрибута модели представления.
				 */
				getAttributeChangeEventPrefix: function() {
					return "change:";
				},

				/**
				 * Выполняет подписку на изменения аттрибута модели представления.
				 * @protected
				 * @param {String} attributeName Название аттрибута модели представления.
				 * @param {Function} handler Обработчик события изменения аттрибута модели представления.
				 */
				subscribeOnViewModelAttributeChange: function(attributeName, handler) {
					var changeAttributeEventPrefix = this.getAttributeChangeEventPrefix();
					this.on(changeAttributeEventPrefix + attributeName, handler, this);
				},

				/**
				 * @inheritDoc BasePageV2#init
				 * @protected
				 * @overridden
				 */
				init: function(callback, scope) {
					if (this.get("Initialized")) {
						this.callParent([function() {
							this.subscribeOnViewModelAttributeChange("ReferenceSchema", this.onReferenceSchemaChange);
							this.subscribeOnViewModelAttributeChange("Type", this.onTypeChange);
							this.set("IsEditMode", this.isEditMode());
							callback.call(scope);
						}, this]);
					} else {
						Terrasoft.EntitySchemaManager.initialize(function() {
							this.set("Initialized", true);
							this.init(callback, scope);
						}, this);
					}
				},

				/**
				 * @inheritDoc BasePageV2#initEntity
				 * @protected
				 * @overridden
				 */
				initEntity: function(callback, scope) {
					var maskId = Terrasoft.Mask.show();
					this.set("MaskId", maskId);
					this.callParent([function() {
						callback.call(scope);
					}, this]);
				},

				/**
				 * @inheritDoc BasePageV2#onEntityInitialized
				 * @protected
				 * @overridden
				 */
				onEntityInitialized: function() {
					var primaryColumnValue = this.get(this.primaryColumnName);
					if (this.Ext.isEmpty(primaryColumnValue) || this.isNew) {
						this.set(this.primaryColumnName, this.Terrasoft.generateGUID());
					}
					this.callParent(arguments);
					var typeDefaultConfig = this.Terrasoft.SysSettings.getTypes();
					var currentType = typeDefaultConfig[this.get("ValueTypeName")];
					this.set("Type", currentType);
					if (this.isLookup()) {
						var referenceSchemaUId = this.get("ReferenceSchemaUId");
						var referenceSchemaList = this.getReferenceSchemaList();
						var referenceSchema = referenceSchemaList[referenceSchemaUId];
						this.set("ReferenceSchema", referenceSchema);
					}
					this.loadValue();
				},

				/**
				 * Метод загрузки значения системной настройки.
				 * @protected
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст вызова callback-функции.
				 */
				loadValue: function(callback, scope) {
					var code = this.get("Code");
					var maskId = this.get("MaskId");
					if (!Ext.isEmpty(code)) {
						Terrasoft.SysSettings.querySysSetting(code, function(sysSettingObject) {
							var value = sysSettingObject[code];
							this.initTypeValue(value);
							Terrasoft.Mask.hide(maskId);
							if (callback) {
								callback.call(scope);
							}
						}, this);
					} else {
						Terrasoft.Mask.hide(maskId);
					}
				},

				/**
				 * Возвращает имена аттрибутов значений системной настройки.
				 * @protected
				 * @return {Array} Массив названий аттрибутов значений.
				 */
				getValueAttributeNames: function() {
					return ["BooleanValue", "DateTimeValue", "IntegerValue", "FloatValue", "TextValue", "SecureValue",
						"LookupValue", "BinaryValue", "DateValue"];
				},

				/**
				 * Очищает значения аттрибутов значений.
				 * @protected
				 */
				clearValues: function() {
					var valueAttributeNames = this.getValueAttributeNames();
					Terrasoft.each(valueAttributeNames, function(valueAttributeName) {
						this.set(valueAttributeName, null);
					}, this);
				},

				/**
				 * Обновляет видимость аттрибутов значений.
				 * @protected
				 * @param {String} valueTypeName Название типа данных системной настройки.
				 */
				updateValueVisibility: function(valueTypeName) {
					var typeValueAttributeName = this.getTypeValueAttributeName(valueTypeName);
					var typeValueVisibleAttributeName = typeValueAttributeName + "Visible";
					var valueAttributeNames = this.getValueAttributeNames();
					Terrasoft.each(valueAttributeNames, function(valueAttributeName) {
						var valueVisibleAttributeName = valueAttributeName + "Visible";
						this.set(valueVisibleAttributeName,
							valueVisibleAttributeName === typeValueVisibleAttributeName);
					}, this);
				},

				/**
				 * Возвращает название аттрибута значения.
				 * @protected
				 * @param {String} valueTypeName Название типа данных системной настройки.
				 * @return {String} Название аттрибута значения.
				 */
				getTypeValueAttributeName: function(valueTypeName) {
					var result = "";
					switch (valueTypeName) {
						case "Boolean":
							result = "BooleanValue";
							break;
						case "Date":
							result = "DateValue";
							break;
						case "DateTime":
							result = "DateTimeValue";
							break;
						case "Integer":
							result = "IntegerValue";
							break;
						case "Money":
						case "Float":
							result = "FloatValue";
							break;
						case "Text":
						case "ShortText":
						case "MediumText":
						case "LongText":
							result = "TextValue";
							break;
						case "SecureText":
							result = "SecureValue";
							break;
						case "Lookup":
							result = "LookupValue";
							break;
						case "Binary":
							result = "BinaryValue";
							break;
					}
					return result;
				},

				/**
				 * Инициализирует значение системной настройки.
				 * @protected
				 * @param {Mixed} value Значение.
				 */
				initTypeValue: function(value) {
					this.clearValues();
					var valueTypeName = this.get("ValueTypeName");
					var typeValueAttributeName = this.getTypeValueAttributeName(valueTypeName);
					if (!Ext.isEmpty(typeValueAttributeName)) {
						this.set(typeValueAttributeName, value);
					}
				},

				/**
				 * Сохраняет значение системной настройки.
				 * @protected
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст вызова callback-функции.
				 */
				saveValue: function(callback, scope) {
					var valueTypeName = this.get("ValueTypeName");
					var typeValueAttributeName = this.getTypeValueAttributeName(valueTypeName);
					var value = this.get(typeValueAttributeName);
					var code = this.get("Code");
					var config = {
						sysSettingsValues: {},
						isPersonal: this.get("IsPersonal")
					};
					config.sysSettingsValues[code] = value;
					Terrasoft.SysSettings.postSysSettingsValues(config, callback, scope);
				},

				/**
				 * Выполняет загрузки списка значений справочника системной настройки.
				 * @protected
				 * @param {String} filter Строка фильтрации.
				 * @param {Terrasoft.Collection} list Список.
				 */
				prepareLookupValueList: function(filter, list) {
					if (list === null) {
						return;
					}
					list.clear();
					var referenceSchemaUId = this.get("ReferenceSchemaUId");
					if (referenceSchemaUId) {
						var listConfig = {};
						Terrasoft.EntitySchemaManager.getItemByUId(referenceSchemaUId, function(item) {
							var schemaName = item.name;
							require([schemaName], function(schema) {
								var primaryColumnName = schema.primaryColumnName;
								var primaryDisplayColumnName = schema.primaryDisplayColumnName;
								var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
									rootSchema: schema,
									rowCount: this.Terrasoft.SysSettings.lookupRowCount
								});
								esq.addColumn(primaryColumnName);
								var primaryDisplayColumn = esq.addColumn(primaryDisplayColumnName);
								primaryDisplayColumn.orderDirection = Terrasoft.OrderDirection.ASC;
								var lookupFilter = esq.createPrimaryDisplayColumnFilterWithParameter(
									this.Terrasoft.SysSettings.lookupFilterType, filter,
									this.Terrasoft.DataValueType.TEXT);
								esq.filters.add("filter", lookupFilter);
								lookupFilter.isEnabled = Boolean(filter);
								esq.getEntityCollection(function(response) {
									if (response.success) {
										response.collection.each(function(item) {
											var itemPrimaryColumnValue = item.get(primaryColumnName);
											listConfig[itemPrimaryColumnValue] = {
												value: itemPrimaryColumnValue,
												displayValue: item.get(primaryDisplayColumnName)
											};
										}, this);
										list.loadAll(listConfig);
									}
								}, this);
							}, this);
						}, this);
					}
				},

				/**
				 * Метод обработки события изменения схемы.
				 * @protected
				 * @virtual
				 */
				onReferenceSchemaChange: function() {
					var referenceSchema = this.get("ReferenceSchema");
					var oldReferenceSchemaUId = this.get("ReferenceSchemaUId");
					var newReferenceSchemaUId = referenceSchema && referenceSchema.value;
					if (oldReferenceSchemaUId !== newReferenceSchemaUId &&
						(!this.Ext.isEmpty(oldReferenceSchemaUId) || !this.Ext.isEmpty(newReferenceSchemaUId))) {
						this.set("ReferenceSchemaUId", newReferenceSchemaUId);
						this.set("LookupValue", null);
					}
				},

				/**
				 * Метод обработки события изменения типа.
				 * @protected
				 * @virtual
				 */
				onTypeChange: function() {
					var type = this.get("Type");
					if (!this.isLookup(type)) {
						this.set("ReferenceSchema", null);
					}
					var valueTypeName = type && type.value;
					this.set("ValueTypeName", type && type.value);
					this.clearValues();
					this.updateValueVisibility(valueTypeName);
				},

				/**
				 * Наполняет коллекцию типов системных настроек.
				 * @protected
				 * @param {String} filter Строка фильтрации.
				 * @param {Terrasoft.Collection} list Список.
				 */
				prepareTypeList: function(filter, list) {
					if (list === null) {
						return;
					}
					list.clear();
					list.loadAll(this.Terrasoft.SysSettings.getTypes());
				},

				/**
				 * Проверяет является тип системной настройки справочником.
				 * @return {boolean} Результат.
				 */
				isLookup: function() {
					var type = this.get("Type");
					return type && type.value === "Lookup";
				},

				/**
				 * Заполняет выпадающий список схем.
				 * @protected
				 * @virtual
				 * @param {String} filter Строка фильтрации.
				 * @param {Terrasoft.Collection} list Список.
				 */
				prepareReferenceSchemaList: function(filter, list) {
					if (list === null) {
						return;
					}
					list.clear();
					list.loadAll(this.getReferenceSchemaList());
				},

				/**
				 * Возвращает список схем.
				 * @protected
				 * @virtual
				 * @return {Object}  Список схем.
				 */
				getReferenceSchemaList: function() {
					var schemaItems = Terrasoft.EntitySchemaManager.getItems();
					schemaItems.sort("caption", Terrasoft.OrderDirection.ASC);
					var resultConfig = {};
					schemaItems.each(function(schemaItem) {
						if (schemaItem.getExtendParent()) {
							return;
						}
						var schemaUId = schemaItem.getUId();
						resultConfig[schemaUId] = {
							value: schemaUId,
							displayValue: schemaItem.getCaption()
						};
					}, this);
					return resultConfig;
				},

				/**
				 * @inheritDoc Terrasoft.BasePageV2#asyncValidate.
				 * @overridden
				 */
				asyncValidate: function(callback, scope) {
					this.callParent([function(result) {
						if (!result.success) {
							callback.call(scope, result);
						} else {
							this.validateCodeDublicate(callback, scope);
						}
					}, this]);
				},

				/**
				 * Производит валидацию на дублирование значения поля Код.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения функции обратного вызова
				 */
				validateCodeDublicate: function(callback, scope) {
					if (!this.changedValues || this.Ext.isEmpty(this.changedValues.Code)) {
						callback.call(scope, {success: true});
					} else {
						var code = this.get("Code");
						var id = this.get("Id");
						var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: this.entitySchemaName
						});
						select.addColumn("Code");
						var idFilter = select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.NOT_EQUAL,
							"Id", id);
						select.filters.addItem(idFilter);
						var codeFilter = select.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
							"Code", code);
						select.filters.addItem(codeFilter);
						select.execute(function(response) {
							if (response.success) {
								var responceCollection = response.collection;
								var result = {success: true};
								if (responceCollection.getCount() > 0) {
									result = {
										message: this.get("Resources.Strings.DuplicateCodeMessage"),
										success: false
									};
								}
								callback.call(scope, result);
							}
						}, this);
					}
				},

				/**
				 * @inheritDoc Terrasoft.BaseViewModel#saveEntity.
				 * @overridden
				 */
				saveEntity: function(callback, scope) {
					if (!this.validate()) {
						return;
					}
					var modificationRequestClassName = this.isNew
						? "Terrasoft.InsertSysSettingRequest"
						: "Terrasoft.UpdateSysSettingRequest";
					var	modificationRequest = Ext.create(modificationRequestClassName, {
						id: this.get(this.primaryColumnName)
					});
					Terrasoft.each(modificationRequest.propertyColumnName, function(columnName, propertyName) {
						modificationRequest[propertyName] = this.get(columnName);
					}, this);
					modificationRequest.execute(function() {
						this.saveValue(callback, scope);
					}, this);
				},

				/**
				 * Обработчик события выбора файла.
				 * @protected
				 * @param {Object} files Файлы, генерируемые FileAPI
				 */
				onFileSelect: function(files) {
					if (Ext.isEmpty(files)) {
						return;
					}
					var self = this;
					var file = files[0];
					FileAPI.readAsBinaryString(file, function(e) {
						var eventType = e.type;
						if (eventType === "load") {
							var binaryString = e.result;
							self.set("BinaryValue", btoa(binaryString));
						} else if (eventType === "error") {
							throw new Terrasoft.UnknownException({
								message: e.error
							});
						}
					});
				},

				/**
				 * Обработчик события нажатия кнопки очистки бинарного значения.
				 * @protected
				 */
				onClearBinaryValueClick: function() {
					this.set("BinaryValue", null);
				},

				/**
				 * Возвращает признак не является ли бинарное значение пустым
				 * @protected
				 * @return {Boolean} Признак является ли бинарное значение пустым
				 */
				isNotEmptyBinaryValue: function() {
					return !Ext.isEmpty(this.get("BinaryValue"));
				},

				/**
				 * Возвращает признак является ли бинарное значение пустым
				 * @protected
				 * @return {Boolean} Признак является ли бинарное значение пустым
				 */
				isEmptyBinaryValue: function() {
					return Ext.isEmpty(this.get("BinaryValue"));
				}
			},

			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "actions",
					"values": {
						"visible": false
					}
				},
				{
					"operation": "insert",
					"name": "AttributesLeftContainer",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 12
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "AttributesRightContainer",
					"parentName": "Header",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"layout": {
							"column": 12,
							"row": 0,
							"colSpan": 12
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "AttributesLeftContainer",
					"propertyName": "items",
					"name": "Name",
					"values": {}
				},
				{
					"operation": "insert",
					"parentName": "AttributesRightContainer",
					"propertyName": "items",
					"name": "Code",
					"values": {}
				},
				{
					"operation": "insert",
					"name": "Type",
					"parentName": "AttributesLeftContainer",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"bindTo": "Type",
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.TypeCaption"
							}
						},
						"controlConfig": {
							"enabled": {
								"bindTo": "IsEditMode",
								"bindConfig": {"converter": "invertBooleanValue"}
							},
							"className": "Terrasoft.ComboBoxEdit",
							"prepareList": {
								"bindTo": "prepareTypeList"
							},
							"list": {
								"bindTo": "TypeList"
							}
						}
					}
				},
				{
					"operation": "insert",
					"name": "IsCacheableContainer",
					"parentName": "AttributesRightContainer",
					"propertyName": "items",
					"values": {
						"styles": {
							"display": "inline-flex",
							"width": "100%"
						},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "IsCacheableContainer",
					"propertyName": "items",
					"name": "IsCacheable",
					"values": {}
				},
				{
					"operation": "insert",
					"parentName": "IsCacheableContainer",
					"propertyName": "items",
					"name": "IsCacheableTooltipButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {
							"bindTo": "Resources.Images.InfoSpriteImage"
						},
						"classes": {
							"wrapperClass": "info-button",
							"imageClass": "info-button-image"
						},
						"showTooltip": true,
						"tooltipText": {
							"bindTo": "Resources.Strings.IsCacheableInfoTip"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "AttributesLeftContainer",
					"propertyName": "items",
					"name": "ReferenceSchema",
					"values": {
						"caption": {
							"bindTo": "Resources.Strings.ReferenceSchemaCaption"
						},
						"visible": {
							"bindTo": "Type",
							"bindConfig": {
								"converter": "isLookup"
							}
						},
						"isRequired": {
							"bindTo": "Type",
							"bindConfig": {
								"converter": "isLookup"
							}
						},
						"contentType": Terrasoft.ContentType.ENUM,
						"controlConfig": {
							"prepareList": {
								"bindTo": "prepareReferenceSchemaList"
							}
						}
					}
				},
				{
					"operation": "insert",
					"name": "IsPersonalContainer",
					"parentName": "AttributesRightContainer",
					"propertyName": "items",
					"values": {
						"styles": {
							"display": "inline-flex",
							"width": "100%"
						},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "IsPersonalContainer",
					"propertyName": "items",
					"name": "IsPersonal",
					"values": {}
				},
				{
					"operation": "insert",
					"parentName": "IsPersonalContainer",
					"propertyName": "items",
					"name": "IsPersonalTooltipButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {
							"bindTo": "Resources.Images.InfoSpriteImage"
						},
						"classes": {
							"wrapperClass": "info-button",
							"imageClass": "info-button-image"
						},
						"showTooltip": true,
						"tooltipText": {
							"bindTo": "Resources.Strings.IsPersonalInfoTip"
						}
					}
				},
				{
					"operation": "insert",
					"name": "ValueContainer",
					"parentName": "AttributesLeftContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"layout": {
							"column": 0,
							"row": 3,
							"colSpan": 12
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "ValueContainer",
					"propertyName": "items",
					"name": "TextValue",
					"values": {
						"bindTo": "TextValue",
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.DefaultValueCaption"
							}
						},
						"visible": {
							"bindTo": "TextValueVisible"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ValueContainer",
					"propertyName": "items",
					"name": "SecureValue",
					"values": {
						"bindTo": "SecureValue",
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.DefaultValueCaption"
							}
						},
						"visible": {
							"bindTo": "SecureValueVisible"
						},
						"controlConfig": {
							protect: true
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ValueContainer",
					"propertyName": "items",
					"name": "IntegerValue",
					"values": {
						"bindTo": "IntegerValue",
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.DefaultValueCaption"
							}
						},
						"visible": {
							bindTo: "IntegerValueVisible"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ValueContainer",
					"propertyName": "items",
					"name": "FloatValue",
					"values": {
						"bindTo": "FloatValue",
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.DefaultValueCaption"
							}
						},
						"visible": {
							bindTo: "FloatValueVisible"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ValueContainer",
					"propertyName": "items",
					"name": "BooleanValue",
					"values": {
						"bindTo": "BooleanValue",
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.DefaultValueCaption"
							}
						},
						"visible": {
							bindTo: "BooleanValueVisible"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ValueContainer",
					"propertyName": "items",
					"name": "DateTimeValue",
					"values": {
						"bindTo": "DateTimeValue",
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.DefaultValueCaption"
							}
						},
						"visible": {
							bindTo: "DateTimeValueVisible"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ValueContainer",
					"propertyName": "items",
					"name": "DateValue",
					"values": {
						"bindTo": "DateValue",
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.DefaultValueCaption"
							}
						},
						"visible": {
							bindTo: "DateValueVisible"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "ValueContainer",
					"propertyName": "items",
					"name": "LookupValue",
					"values": {
						"bindTo": "LookupValue",
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.DefaultValueCaption"
							}
						},
						"visible": {
							bindTo: "LookupValueVisible"
						},
						"dataValueType": Terrasoft.DataValueType.ENUM,
						"controlConfig": {
							"prepareList": {
								"bindTo": "prepareLookupValueList"
							}
						}
					}
				},
				{
					"operation": "insert",
					"name": "BinaryValueContainer",
					"parentName": "ValueContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"visible": {
							bindTo: "BinaryValueVisible"
						},
						"styles": {
							"float": "right"
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"propertyName": "items",
					"parentName": "BinaryValueContainer",
					"name": "FileSelect",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": {
							"bindTo": "Resources.Strings.FileSelectCaption"
						},
						"visible": {
							"bindTo": "BinaryValue",
							"bindConfig": {
								"converter": "isEmptyBinaryValue"
							}
						},
						"controlConfig": {
							"fileUpload": true,
							"fileUploadMultiSelect": false,
							"filesSelected": {
								"bindTo": "onFileSelect"
							}
						}
					}
				},
				{
					"operation": "insert",
					"propertyName": "items",
					"parentName": "BinaryValueContainer",
					"name": "ClearBinaryValue",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {
							"bindTo": "Resources.Strings.ClearBinaryValueCaption"
						},
						"controlConfig": {
							"click": {
								bindTo: "onClearBinaryValueClick"
							}
						},
						"visible": {
							"bindTo": "BinaryValue",
							"bindConfig": {
								"converter": "isNotEmptyBinaryValue"
							}
						},
						"style": Terrasoft.controls.ButtonEnums.style.GREY
					}
				},
				{
					"operation": "insert",
					"parentName": "AttributesRightContainer",
					"propertyName": "items",
					"name": "IsSSPAvailable",
					"values": {}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Description",
					"values": {
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 24,
							"rowSpan": 3
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
