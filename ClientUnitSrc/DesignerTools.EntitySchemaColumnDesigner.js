define("EntitySchemaColumnDesigner", ["terrasoft", "BusinessRuleModule", "DesignTimeEnums", "css!ModalBoxDesignerCSS"],
	function(Terrasoft, BusinessRuleModule) {
		return {
			messages: {

				/**
				 * Публикация сообщения изменения заголовка модуля дизайнера колонки объекта.
				 */
				"ChangeHeaderCaption": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для получения параметров инициализации дизайнера колонки.
				 */
				"GetColumnConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для получения параметров инициализации дизайнера колонки.
				 */
				"GetSchemaColumnsNames": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для получения параметров инициализации дизайнера колонки.
				 */
				"GetDesignerDisplayConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для получения идентификатора пакета для новой схемы справочника.
				 */
				"GetNewLookupPackageUId": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			rules: {
				"ReferenceSchemaUId": {
					"RequiredReferenceSchemaUId": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.REQUIRED,
						logical: Terrasoft.LogicalOperatorType.AND,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "DataValueType"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: Terrasoft.DataValueType.LOOKUP
							}
						}, {
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "UseNewLookup"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: false
							}
						}]
					}
				},
				"NewSchemaCaption": {
					"RequiredNewSchemaCaption": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.REQUIRED,
						logical: Terrasoft.LogicalOperatorType.AND,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "DataValueType"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: Terrasoft.DataValueType.LOOKUP
							}
						}, {
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "UseNewLookup"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"NewSchemaName": {
					"RequiredNewSchemaName": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.REQUIRED,
						logical: Terrasoft.LogicalOperatorType.AND,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "DataValueType"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: Terrasoft.DataValueType.LOOKUP
							}
						}, {
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "UseNewLookup"
							},
							comparisonType: Terrasoft.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: true
							}
						}]
					}
				},
				"IsRequired": {
					"RequiredNewSchemaName": {
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.VISIBLE,
						logical: Terrasoft.LogicalOperatorType.AND,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "DataValueType"
							},
							comparisonType: Terrasoft.ComparisonType.NOT_EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: Terrasoft.DataValueType.INTEGER
							}
						}, {
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "DataValueType"
							},
							comparisonType: Terrasoft.ComparisonType.NOT_EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: Terrasoft.DataValueType.FLOAT
							}
						}, {
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: "DataValueType"
							},
							comparisonType: Terrasoft.ComparisonType.NOT_EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: Terrasoft.DataValueType.BOOLEAN
							}
						}]
					}
				}
			},
			attributes: {

				/**
				 * Идентификатор колонки.
				 */
				UId: {
					dataValueType: Terrasoft.DataValueType.GUID,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Заголовок колонки.
				 */
				Caption: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true
				},

				/**
				 * Название колонки.
				 */
				Name: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true
				},

				/**
				 * Описание колонки.
				 */
				Description: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Тип данных колонки.
				 */
				DataValueType: {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true
				},

				/**
				 * Идентификатор схемы.
				 */
				ReferenceSchemaUId: {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true
				},

				/**
				 * Признак, что колонка обязательна для заполнения.
				 */
				IsRequired: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: false
				},

				/**
				 * Признак, что колонка является виртуальной.
				 */
				IsVirtual: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Признак, что значение колонки можно скопировать.
				 */
				IsValueCloneable: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Признак, что тип колонки является простым справочником.
				 */
				IsSimpleLookup: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Признак каскадной связи.
				 */
				IsCascade: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Конфигурационный массив типов данных.
				 */
				DataValueTypeConfig: {
					dataValueType: Terrasoft.DataValueType.ENUM,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Текущая колонка.
				 */
				Column: {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Признак, создания нового справочника для колонки.
				 */
				UseNewLookup: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Колонка заголовка новой схемы.
				 */
				NewSchemaCaption: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Колонка названия новой схемы.
				 */
				NewSchemaName: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}

			},
			methods: {

				/**
				 * @protected
				 * @inheritdoc BaseDesigner#initSectionCaption
				 * @overridden
				 */
				initSectionCaption: Terrasoft.emptyFn,

				/**
				 * @protected
				 * @inheritdoc BaseDesigner#changeDesignerCaption
				 * @overridden
				 */
				changeDesignerCaption: Terrasoft.emptyFn,

				/**
				 * Возвращает конфигурацию колонки.
				 * @protected
				 * @virtual
				 * @return {Object} конфигурация колонки.
				 */
				getColumnConfig: function() {
					return this.sandbox.publish("GetColumnConfig", null, [this.sandbox.id]);
				},

				/**
				 * Создает схему справочника.
				 * @protected
				 * @virtual
				 * @param {Object} config Конфигурация нового справочника.
				 * @param {String} config.name Название нового справочника.
				 * @param {String} config.caption Заголовок нового справочника.
				 * @param {String} config.packageUId Уникальный идентивикатор пакета для нового справочника.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				createReferenceEntitySchema: function(config, callback, scope) {
					var name = config.name;
					var caption = config.caption;
					var packageUId = config.packageUId;
					Terrasoft.EntitySchemaManager.initialize(function() {
						var newEntityUId = Terrasoft.generateGUID();
						var newSchema = Terrasoft.EntitySchemaManager.createSchema({
							uId: newEntityUId,
							name: name,
							packageUId: packageUId,
							caption: {}
						});
						newSchema.setLocalizableStringPropertyValue("caption", caption);
						var baseLookupUId = Terrasoft.DesignTimeEnums.BaseSchemaUId.BASE_LOOKUP;
						newSchema.setParent(baseLookupUId, function() {
							var item = Terrasoft.EntitySchemaManager.addSchema(newSchema);
							callback.call(scope, item);
						});
					});
				},

				/**
				 * Инициализирует значение префикса для названия схемы.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				initSchemaNamePrefix: function(callback, scope) {
					var schemaNamePrefix = Terrasoft.ClientUnitSchemaManager.schemaNamePrefix;
					this.set("SchemaNamePrefix", schemaNamePrefix);
					callback.call(scope);
				},

				/**
				 * Инициализирует массив названий колонок объекта.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				initSchemaColumnsNames: function(callback, scope) {
					var sandbox = this.sandbox;
					var schemaColumnsNames = sandbox.publish("GetSchemaColumnsNames", null, [sandbox.id]);
					var designerDisplayConfig = this.get("DesignerDisplayConfig");
					if (!designerDisplayConfig.isNewColumn) {
						var column = this.get("Column");
						var currentColumnName = column.getPropertyValue("name");
						var indexOfCurrentColumn = schemaColumnsNames.indexOf(currentColumnName);
						if (indexOfCurrentColumn !== -1) {
							schemaColumnsNames.splice(indexOfCurrentColumn, 1);
						}
					}
					this.set("SchemaColumnsNames", schemaColumnsNames);
					callback.call(scope);
				},

				/**
				 * Инициализирует параметры отображения дизайнера колонки.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				initDesignerDisplayConfig: function(callback, scope) {
					var sandbox = this.sandbox;
					var designerDisplayConfig = sandbox.publish("GetDesignerDisplayConfig", null, [sandbox.id]);
					this.set("DesignerDisplayConfig", designerDisplayConfig);
					callback.call(scope);
				},

				/**
				 * Генерирует заголовок для дизайнера колонки.
				 * @protected
				 * @virtual
				 * @return {String} Заголовок дизайнера колонки.
				 */
				getDesignerCaption: function() {
					var designerDisplayConfig = this.get("DesignerDisplayConfig");
					return (designerDisplayConfig && designerDisplayConfig.isNewColumn)
						? this.get("Resources.Strings.NewColumnCaption")
						: this.get("Resources.Strings.DesignerCaption");
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
						var columnConfig = this.getColumnConfig();
						var column = columnConfig.column;
						this.set("Column", column);
						this.set("UseNewLookup", false);
						Terrasoft.chain(
							this.initSchemaNamePrefix,
							this.initDesignerDisplayConfig,
							this.initSchemaColumnsNames,
							function(next) {
								Terrasoft.SchemaDesignerUtilities.getDataValueTypeInfo(function(result) {
									this.set("DataValueTypeConfig", result.dataValueTypeInfo);
									this.setAttributes(column);
									next();
								}, this);
							},
							function() {
								callback.call(scope);
							},
							this
						);
					}, this]);
				},

				/**
				 * Устанавливает свойства модели представления в соответствиии с экземпляром колонки.
				 * @protected
				 * @virtual
				 * @param entitySchemaColumn {Terrasoft.EntitySchemaColumn} Экземпляро колонки.
				 */
				setAttributes: function(entitySchemaColumn) {
					var attributeColumnPropertyNames = this.getPropertyTranslater();
					Terrasoft.each(attributeColumnPropertyNames, function(columnPropertyName, attributeName) {
						var columnPropertyValue = entitySchemaColumn.getPropertyValue(columnPropertyName);
						if (columnPropertyValue && columnPropertyValue instanceof Terrasoft.LocalizableString) {
							columnPropertyValue = columnPropertyValue.getValue() || "";
						}
						if (columnPropertyName === "dataValueType" && columnPropertyValue) {
							var dataValueTypeCaption = this.getDataValueTypeCaption(columnPropertyValue);
							columnPropertyValue = this.getLookupValue(columnPropertyValue, dataValueTypeCaption);
						}
						if (columnPropertyName === "referenceSchemaUId" && columnPropertyValue) {
							Terrasoft.EntitySchemaManager.getItemByUId(columnPropertyValue, function(item) {
								var schemaCaption = item.getCaption();
								columnPropertyValue = this.getLookupValue(columnPropertyValue, schemaCaption);
								this.setColumnValue(attributeName, columnPropertyValue, {preventValidation: true});
							}, this);
							return;
						}
						this.setColumnValue(attributeName, columnPropertyValue, {preventValidation: true});
					}, this);
				},

				/**
				 * Возвращает объект для типа поля справочник.
				 * @protected
				 * @virtual
				 * @param value {String} Значение.
				 * @param displayValue {String} Отображаемое значение.
				 * @return {Object} Объект для типа поля справочник.
				 */
				getLookupValue: function(value, displayValue) {
					return {
						value: value,
						displayValue: displayValue
					};
				},

				/**
				 * Возвращает заголовок типа данных.
				 * @protected
				 * @virtual
				 * @param value {String} Значение.
				 * @return {String} Заголовок типа данных.
				 */
				getDataValueTypeCaption: function(value) {
					var dataValueTypeCaption;
					var dataValueTypesConfig = this.get("DataValueTypeConfig");
					Terrasoft.each(dataValueTypesConfig, function(dataValueType) {
						if (dataValueType.DataValueType === value) {
							dataValueTypeCaption = dataValueType.Caption;
							return false;
						}
					}, this);
					return dataValueTypeCaption;
				},

				/**
				 * Возвращает словарь соответстий свойств модели представления и объекта колонки.
				 * @protected
				 * @virtual
				 * @return {Object} Cловарь соответстий свойств модели представления и объекта колонки.
				 */
				getPropertyTranslater: function() {
					return {
						"UId": "uId",
						"Caption": "caption",
						"Name": "name",
						"Description": "description",
						"DataValueType": "dataValueType",
						"ReferenceSchemaUId": "referenceSchemaUId",
						"IsRequired": "isRequired",
						"IsValueCloneable": "isValueCloneable",
						"IsSimpleLookup": "isSimpleLookup",
						"IsCascade": "isCascade",
						"IsInherited": "isInherited"
					};
				},

				/**
				 * Определяет видимость поля isSimpleLookup.
				 * @protected
				 * @virtual
				 * @return {Boolean} Признак видимости поля isSimpleLookup.
				 */
				isLookupDataValueType: function() {
					var dataValueType = this.get("DataValueType");
					dataValueType = dataValueType && dataValueType.value;
					return Terrasoft.isLookupDataValueType(dataValueType);
				},

				/**
				 * Возвращает массив полей для текущего типа колонки.
				 * @protected
				 * @virtual
				 * @param dataValueType {Terrasoft.DataValueType} Тип данных.
				 * @return {Array} Массив полей для текущего типа колонки.
				 */
				getActualFieldsConfig: function(dataValueType) {
					var commonConfig = ["UId", "DataValueType", "Caption", "Name", "Description", "IsRequired",
						"IsValueCloneable"];
					var typedConfig = {
						LOOKUP: ["ReferenceSchemaUId", "IsSimpleLookup", "IsCascade"]
					};
					var dataValueTypeName = this.getDataValueTypeName(dataValueType);
					var resultConfig = commonConfig.concat(typedConfig[dataValueTypeName] || []);
					return resultConfig;
				},

				/**
				 * Возвращает имя типа данных.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.DataValueType} dataValueType Тип данных.
				 * @return {String} Имя типа данных.
				 */
				getDataValueTypeName: function(dataValueType) {
					var DataValueTypeName;
					Terrasoft.each(Terrasoft.DataValueType, function(value, name) {
						if (value === dataValueType) {
							DataValueTypeName = name;
							return false;
						}
					}, this);
					return DataValueTypeName;
				},

				/**
				 * Заполняет выпадающий список типа данных.
				 * @protected
				 * @virtual
				 * @param {String} filter Строка фильтрации.
				 * @param {Terrasoft.Collection} list Список.
				 */
				prepareDataValueTypeList: function(filter, list) {
					if (list === null) {
						return;
					}
					list.clear();
					list.loadAll(this.getDataValueTypeList());
				},

				/**
				 * Возвращает список типов данных.
				 * @protected
				 * @virtual
				 * @return {Object}  Список типов данных.
				 */
				getDataValueTypeList: function() {
					var resultConfig = {};
					var dataValueTypeConfig = this.get("DataValueTypeConfig");
					Terrasoft.each(dataValueTypeConfig, function(dataValueType) {
						var dataValueTypeName = dataValueType.DataValueType;
						var dataValueTypeCaption = dataValueType.Caption;
						resultConfig[dataValueTypeName] = {
							value: dataValueTypeName,
							displayValue: dataValueTypeCaption
						};
					}, this);
					return resultConfig;
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
				 * Возвращает идентификатор текущего пакета.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 * @return {String} Идентификатор пакета.
				 */
				getCurrentPackageUId: function(callback, scope) {
					var sandbox = this.sandbox;
					var sysPackageUId = sandbox.publish("GetNewLookupPackageUId", null, [sandbox.id]);
					callback.call(scope, sysPackageUId);
				},

				/**
				 * Обновляет ссылку на справочник колонки перед сохранением.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				initReferenceSchemaBeforeSave: function(callback, scope) {
					var useNewLookup = this.get("UseNewLookup");
					var isInherited = this.get("IsInherited");
					var chain = [];
					if (this.isLookupDataValueType() && useNewLookup && !isInherited) {
						chain.push(
							this.getCurrentPackageUId,
							function(next, packageUId) {
								var createSchemaConfig = {
									name: this.get("NewSchemaName"),
									caption: this.get("NewSchemaCaption"),
									packageUId: packageUId
								};
								this.createReferenceEntitySchema(createSchemaConfig, next, this);
							},
							function(next, instance) {
								this.set("ReferenceSchemaUId", {
									value: instance.getUId(),
									displayValue: instance.getCaption()
								});
								next();
							}
						);
					}
					chain.push(function() {
						callback.call(scope);
					}, this);
					Terrasoft.chain.apply(this, chain);
				},

				/**
				 * @protected
				 * @inheritdoc BaseSchemaViewModel#setValidationConfig
				 * @overridden
				 */
				setValidationConfig: function() {
					this.callParent(arguments);
					this.addColumnValidator("Name", this.columnNameLengthValidator);
					this.addColumnValidator("Name", this.columnNameRegExpValidator);
					this.addColumnValidator("Name", this.columnPrefixValidator);
					this.addColumnValidator("Name", this.columnDuplicateNameValidator);
					this.addColumnValidator("NewSchemaName", this.schemaNameLengthValidator);
					this.addColumnValidator("NewSchemaName", this.schemaNameRegExpValidator);
					this.addColumnValidator("NewSchemaName", this.schemaNamePrefixValidator);
					this.addColumnValidator("NewSchemaName", this.schemaDuplicateNameValidator);
				},

				/**
				 * Валидирует название колонки на дублирование в объекте.
				 * @protected
				 * @virtual
				 * @param {String} value Значение для валидации.
				 * @return {Object} Результат валидации.
				 */
				columnDuplicateNameValidator: function(value) {
					var message = "";
					var schemaColumnsNames = this.get("SchemaColumnsNames");
					if (!Ext.isEmpty(schemaColumnsNames) && Ext.Array.contains(schemaColumnsNames, value)) {
						message = this.get("Resources.Strings.DuplicateColumnNameMessage");
					}
					return { invalidMessage: message };
				},

				/**
				 * Валидирует название колонки на наличие обязательно префикса.
				 * @protected
				 * @virtual
				 * @param {String} value Значение для валидации.
				 * @return {Object} Результат валидации.
				 */
				columnPrefixValidator: function(value) {
					var message = "";
					var schemaNamePrefix = this.get("SchemaNamePrefix");
					if (!Ext.isEmpty(schemaNamePrefix) && !this.get("IsInherited")) {
						var prefixReqExp = new RegExp("^" + schemaNamePrefix + ".*$");
						if (!prefixReqExp.test(value)) {
							message = Ext.String.format(this.get("Resources.Strings.WrongPrefixMessage"),
								schemaNamePrefix);
						}
					}
					return { invalidMessage: message };
				},

				/**
				 * Валидирует название колонки на наличие недопустимых символов.
				 * @protected
				 * @virtual
				 * @param {String} value Значение для валидации.
				 * @return {Object} Результат валидации.
				 */
				columnNameRegExpValidator: function(value) {
					var message = "";
					var reqExp = /^[a-zA-Z]{1}[a-zA-Z0-9]*$/;
					if (!reqExp.test(value)) {
						message = this.get("Resources.Strings.WrongColumnNameMessage");
					}
					return { invalidMessage: message };
				},

				/**
				 * Валидирует название колонки на длину.
				 * @protected
				 * @virtual
				 * @param {String} value Значение для валидации.
				 * @return {Object} Результат валидации.
				 */
				columnNameLengthValidator: function(value) {
					var message = "";
					var maxLength = 30;
					if (value.length >= maxLength) {
						message = Ext.String.format(this.get("Resources.Strings.WrongColumnNameLengthMessage"),
							maxLength);
					}
					return { invalidMessage: message };
				},

				/**
				 * Валидирует название нового справочника на дублирование в менеджере.
				 * @protected
				 * @virtual
				 * @param {String} value Значение для валидации.
				 * @return {Object} Результат валидации.
				 */
				schemaDuplicateNameValidator: function(value) {
					var message = "";
					if (this.get("UseNewLookup")) {
						var entitySchemaManagerItems = Terrasoft.EntitySchemaManager.getItems();
						var filteredEntitySchemaManagerItems = entitySchemaManagerItems.filterByFn(function(item) {
							return item.name.toLowerCase() === value.toLowerCase();
						}, this);
						if (!filteredEntitySchemaManagerItems.isEmpty()) {
							message = this.get("Resources.Strings.DuplicateSchemaNameMessage");
						}
					}
					return { invalidMessage: message };
				},

				/**
				 * Валидирует название нового справочника на наличие обязательно префикса.
				 * @protected
				 * @virtual
				 * @param {String} value Значение для валидации.
				 * @return {Object} Результат валидации.
				 */
				schemaNamePrefixValidator: function(value) {
					var message = "";
					var schemaNamePrefix = this.get("SchemaNamePrefix");
					if (!Ext.isEmpty(schemaNamePrefix) && this.get("UseNewLookup")) {
						var prefixReqExp = new RegExp("^" + schemaNamePrefix + ".*$");
						if (!prefixReqExp.test(value)) {
							message = Ext.String.format(this.get("Resources.Strings.WrongPrefixMessage"),
								schemaNamePrefix);
						}
					}
					return { invalidMessage: message };
				},

				/**
				 * Валидирует название нового справочника на наличие недопустимых символов.
				 * @protected
				 * @virtual
				 * @param {String} value Значение для валидации.
				 * @return {Object} Результат валидации.
				 */
				schemaNameRegExpValidator: function(value) {
					var message = "";
					if (this.get("UseNewLookup")) {
						var reqExp = /^[a-zA-Z]{1}[a-zA-Z0-9]*$/;
						if (!reqExp.test(value)) {
							message = this.get("Resources.Strings.WrongSchemaNameMessage");
						}
					}
					return { invalidMessage: message };
				},

				/**
				 * Валидирует название нового справочника на длину.
				 * @protected
				 * @virtual
				 * @param {String} value Значение для валидации.
				 * @return {Object} Результат валидации.
				 */
				schemaNameLengthValidator: function(value) {
					var message = "";
					if (this.get("UseNewLookup")) {
						var maxLength = Terrasoft.EntitySchemaManager.getMaxEntitySchemaNameLength();
						if (value.length >= maxLength) {
							message = Ext.String.format(this.get("Resources.Strings.WrongSchemaNameLengthMessage"),
								maxLength);
						}
					}
					return { invalidMessage: message };
				},

				/**
				 * Обновляет настраиваемую колонку новыми значениями из модели представления.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				updateColumn: function(callback, scope) {
					var dataValueTypeLookupValue = this.get("DataValueType");
					var dataValueType = dataValueTypeLookupValue.value;
					var actualFieldsConfig = this.getActualFieldsConfig(dataValueType);
					var column = this.get("Column");
					var attributeColumnPropertyNames = this.getPropertyTranslater();
					Terrasoft.each(actualFieldsConfig, function(fieldName) {
						var columnPropetyName = attributeColumnPropertyNames[fieldName];
						var attributeValue = this.get(fieldName);
						var columnValue = column.getPropertyValue(columnPropetyName);
						if (Terrasoft.instanceOfClass(columnValue, "Terrasoft.LocalizableString")) {
							columnValue.setValue(attributeValue);
							return;
						}
						attributeValue = (attributeValue && attributeValue.value) || attributeValue;
						column.setPropertyValue(columnPropetyName, attributeValue);
					}, this);
					callback.call(scope);
				},

				/**
				 * Валидирует модель представления в асинхронном режиме.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				asyncValidate: function(callback, scope) {
					var validationResult = this.validate();
					callback.call(scope, validationResult);
				},

				/**
				 * @inheritdoc BasePageV2#onRender
				 * @overridden
				 */
				onRender: function() {
					this.updateSize(550, 550);
					this.hideBodyMask();
				},
				/**
				 * Метод выполняет сохранение войств колонки.
				 * @protected
				 * @virtual
				 */
				save: function() {
					Terrasoft.chain(
						this.asyncValidate,
						function(next, validationResult) {
							if (validationResult) {
								next();
							}
						},
						this.initReferenceSchemaBeforeSave,
						this.updateColumn,
						function() {
							this.onSaved();
						}, this);
				},

				/**
				 * Обрабативает завершение сохранения колонки.
				 * @protected
				 * @virtual
				 */
				onSaved: function() {},

				/**
				 * Метод отмены изменений настройки колонки.
				 * @protected
				 * @virtual
				 */
				cancel: function() {}
			},
			diff: [
				{
					"operation": "insert",
					"name": "ColumnPropertiesControlGroup",
					"parentName": "BaseDesignerContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 24
						},
						"items": []
					}
				},
				{
					"operation": "move",
					"name": "BaseDesignerFooterContainer",
					"parentName": "ColumnPropertiesControlGroup",
					"propertyName": "items"
				},
				{
					"operation": "merge",
					"name": "BaseDesignerFooterContainer",
					"values": {
						"layout": { "row": 0 }
					}
				},
				{
					"operation": "insert",
					"name": "MainPropertiesContainer",
					"parentName": "BaseDesignerFooterContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 20
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "CaptionContainer",
					"parentName": "MainPropertiesContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["field-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Caption",
					"parentName": "CaptionContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"caption": { "bindTo": "Resources.Strings.ColumnCaption" }
						}
					}
				},
				{
					"operation": "insert",
					"name": "NameContainer",
					"parentName": "MainPropertiesContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["field-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Name",
					"parentName": "NameContainer",
					"propertyName": "items",
					"values": {
						"enabled": {
							"bindTo": "IsInherited",
							"bindConfig": { "converter": "invertBooleanValue" }
						},
						"labelConfig": {
							"caption": { "bindTo": "Resources.Strings.NameLabel" }
						}
					}
				},
				{
					"operation": "insert",
					"name": "IsRequiredContainer",
					"parentName": "MainPropertiesContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["field-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "IsRequired",
					"parentName": "IsRequiredContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"caption": { "bindTo": "Resources.Strings.isRequiredLabel" }
						}
					}
				},
				{
					"operation": "insert",
					"name": "DataValueType",
					"parentName": "MainPropertiesContainer",
					"propertyName": "items",
					"values": {
						"visible": false,
						"contentType": Terrasoft.ContentType.ENUM,
						"labelConfig": {
							"caption": { "bindTo": "Resources.Strings.DataValueTypeLabel" }
						},
						"enabled": {
							"bindTo": "IsInherited",
							"bindConfig": { "converter": "invertBooleanValue" }
						},
						"controlConfig": {
							"className": "Terrasoft.ComboBoxEdit",
							"prepareList": { "bindTo": "prepareDataValueTypeList" },
							"list": { "bindTo": "dataValueTypeList" }
						}
					}
				},
				{
					"operation": "insert",
					"name": "LookpPropertiesControlGroup",
					"parentName": "BaseDesignerFooterContainer",
					"propertyName": "items",
					"values": {
						"visible": { "bindTo": "isLookupDataValueType" },
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						caption: { bindTo: "Resources.Strings.LookupCaption" },
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 20
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "OrNewLookupContainer",
					"parentName": "LookpPropertiesControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["field-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "UseNewLookup",
					"parentName": "OrNewLookupContainer",
					"propertyName": "items",
					"values": {
						"value": { "bindTo": "UseNewLookup" },
						"itemType": Terrasoft.ViewItemType.RADIO_GROUP,
						"classes": {
							"wrapClassName": ["use-new-lookup"]
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "UseNewLookup",
					"propertyName": "items",
					"name": "UseNewLookupFalse",
					"values": {
						"caption": { "bindTo": "Resources.Strings.UseExistingLookupCaption" },
						"enabled": {
							"bindTo": "IsInherited",
							"bindConfig": { "converter": "invertBooleanValue" }
						},
						"value": false
					}
				},
				{
					"operation": "insert",
					"parentName": "UseNewLookup",
					"propertyName": "items",
					"name": "UseNewLookupTrue",
					"values": {
						"caption": { "bindTo": "Resources.Strings.CreateNewLookupCaption" },
						"visible": { "bindTo": "isLookupDataValueType" },
						"enabled": {
							"bindTo": "IsInherited",
							"bindConfig": { "converter": "invertBooleanValue" }
						},
						"value": true
					}
				},
				{
					"operation": "insert",
					"name": "ReferenceSchemaUIdContainer",
					"parentName": "LookpPropertiesControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["field-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ReferenceSchemaUId",
					"parentName": "ReferenceSchemaUIdContainer",
					"propertyName": "items",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"labelConfig": {
							"caption": { "bindTo": "Resources.Strings.referenceSchemaUIdLabel" }
						},
						"visible": {
							"bindTo": "UseNewLookup",
							"bindConfig": { "converter": "invertBooleanValue" }
						},
						"enabled": {
							"bindTo": "IsInherited",
							"bindConfig": { "converter": "invertBooleanValue" }
						},
						"controlConfig": {
							"prepareList": { "bindTo": "prepareReferenceSchemaList" },
							"list": { "bindTo": "ReferenceSchemaUIdList" }
						}
					}
				},
				{
					"operation": "insert",
					"name": "NewSchemaCaption",
					"parentName": "ReferenceSchemaUIdContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"caption": { "bindTo": "Resources.Strings.NewSchemaCaptionFieldCaption" }
						},
						"visible": { "bindTo": "UseNewLookup"},
						"enabled": {
							"bindTo": "IsInherited",
							"bindConfig": { "converter": "invertBooleanValue" }
						}
					}
				},
				{
					"operation": "insert",
					"name": "NewSchemaName",
					"parentName": "ReferenceSchemaUIdContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"caption": { "bindTo": "Resources.Strings.NewSchemaNameFieldCaption" }
						},
						"visible": { "bindTo": "UseNewLookup" },
						"enabled": {
							"bindTo": "IsInherited",
							"bindConfig": { "converter": "invertBooleanValue" }
						}
					}
				},
				{
					"operation": "insert",
					"name": "LookupPropertiesGridLayout",
					"parentName": "LookpPropertiesControlGroup",
					"propertyName": "items",
					"values": {
						"visible": { "bindTo": "isLookupDataValueType" },
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "IsSimpleLookupCaption",
					"parentName": "LookupPropertiesGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 10
						},
						"caption": { "bindTo": "Resources.Strings.LookupTypeCaption" },
						"itemType": Terrasoft.ViewItemType.LABEL
					}
				},
				{
					"operation": "insert",
					"name": "IsSimpleLookup",
					"parentName": "LookupPropertiesGridLayout",
					"propertyName": "items",
					"values": {
						"layout": {
							"column": 10,
							"row": 0,
							"colSpan": 10
						},
						"value": { "bindTo": "IsSimpleLookup" },
						"itemType": Terrasoft.ViewItemType.RADIO_GROUP,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "IsSimpleLookup",
					"propertyName": "items",
					"name": "IsSimpleLookupFalse",
					"values": {
						"caption": { "bindTo": "Resources.Strings.LookupTypeLabel" },
						"visible": { "bindTo": "isLookupDataValueType" },
						"value": false
					}
				},
				{
					"operation": "insert",
					"parentName": "IsSimpleLookup",
					"propertyName": "items",
					"name": "IsSimpleLookupTrue",
					"values": {
						"caption": { "bindTo": "Resources.Strings.DropDownTypeLabel" },
						"visible": { "bindTo": "isLookupDataValueType" },
						"value": true
					}
				},
				{
					"operation": "insert",
					"name": "AdditionalPropertiesControlGroup",
					"parentName": "BaseDesignerFooterContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						caption: { bindTo: "Resources.Strings.AdditionalPropertiesCaption" },
						"layout": {
							"column": 0,
							"row": 2,
							"colSpan": 20
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "IsCascade",
					"parentName": "AdditionalPropertiesControlGroup",
					"propertyName": "items",
					"values": {
						"visible": { "bindTo": "isLookupDataValueType" },
						"enabled": {
							"bindTo": "IsInherited",
							"bindConfig": { "converter": "invertBooleanValue" }
						},
						"labelConfig": {
							"caption": { "bindTo": "Resources.Strings.isCascadeLabel" }
						}
					}
				},
				{
					"operation": "insert",
					"name": "IsValueCloneable",
					"parentName": "AdditionalPropertiesControlGroup",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"caption": { "bindTo": "Resources.Strings.isValueCloneableLabel" }
						}
					}
				}
			]
		};
	});