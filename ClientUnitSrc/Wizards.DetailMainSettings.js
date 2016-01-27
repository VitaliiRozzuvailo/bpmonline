define("DetailMainSettings", ["terrasoft", "DetailMainSettingsResources", "DetailManager", "DesignTimeEnums",
		"ConfigurationEnums", "ConfigurationEnumsV2"],
	function(Terrasoft) {
		return {
			messages: {

				/**
				 * Публикация сообщения для запроса параметров модуля.
				 */
				"GetModuleConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Подписка на сообщение для получения параметров подуля.
				 */
				"GetModuleConfigResult": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Подписка на сообщение валидации модуля.
				 */
				"Validate": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Публикация сообщения для отправки результатов валидации модуля.
				 */
				"ValidationResult": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Подписка на сообщение сохранения модуля.
				 */
				"Save": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Публикация сообщения для отправки результатов сохранения модуля.
				 */
				"SavingResult": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для обновления конфигурации шагом визарда.
				 */
				"UpdateWizardConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для получения идентификатора пакета.
				 */
				"GetPackageUId": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}

			},
			attributes: {

				/**
				 * Заголовок колонки.
				 */
				Caption: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					size: 250,
					isRequired: true
				},

				/**
				 * Название объекта.
				 */
				EntitySchemaUId: {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isRequired: true
				},

				/**
				 * Экземпляр DetailManagerItem.
				 */
				DetailManagerItem: {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				/**
				 * Идентификатор пакета.
				 */
				PackageUId: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}

			},
			methods: {

				/**
				 * Инициализирует начальные значения модели.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст функции обратного вызова.
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.subscribeMessages();
						this.showBodyMask();
						this.sandbox.publish("GetModuleConfig", null, [this.sandbox.id]);
						callback.call(scope);
					}, this]);
				},

				/**
				 * Подписывается на сообщения.
				 * @protected
				 * @virtual
				 */
				subscribeMessages: function() {
					this.sandbox.subscribe("Validate", this.onValidate, this, [this.sandbox.id]);
					this.sandbox.subscribe("Save", this.onSave, this, [this.sandbox.id]);
					this.sandbox.subscribe("GetModuleConfigResult", this.onGetModuleConfigResult, this,
						[this.sandbox.id]);
				},

				/**
				 * Устанавливает значение модели представления.
				 * @private
				 */
				setPropertyValue: function(detailConfig) {
					var detailManagerItem = detailConfig.detailManagerItem;
					Terrasoft.chain(
						function(next) {
							var detailCaption = detailManagerItem.getCaption() || null;
							this.set("DetailManagerItem", detailManagerItem);
							var caption = this.get("Caption");
							if (detailCaption && detailCaption !== caption) {
								this.set("Caption", detailCaption);
							}
							Terrasoft.EntitySchemaManager.initialize(next, this);
						},
						function() {
							var entitySchemaUId = detailManagerItem.getEntitySchemaUId();
							var entitySchemaItems = Terrasoft.EntitySchemaManager.getItems();
							var foundEntitySchemaItems = entitySchemaItems.filterByFn(function(item) {
								return item.uId === entitySchemaUId && !item.extendParent;
							});
							var entitySchemaLookupValue;
							var foundEntitySchemaItem = foundEntitySchemaItems.getByIndex(0);
							if (foundEntitySchemaItem) {
								var entitySchemaCaption = foundEntitySchemaItem.caption;
								entitySchemaLookupValue = this.getLookupValue(entitySchemaUId, entitySchemaCaption);
							} else {
								entitySchemaLookupValue = null;
							}
							this.set("EntitySchemaUId", entitySchemaLookupValue);
						}, this
					);
				},

				/**
				 * Возвращает признак - включено ли поле имени объекта.
				 * @protected
				 * @virtual
				 * @return {Boolean} Признак - включено ли поле имени объекта.
				 */
				getIsEntitySchemaFieldEnabled: function() {
					var detailManagerItem = this.get("DetailManagerItem");
					return detailManagerItem && detailManagerItem.getIsNew();
				},

				/**
				 * Возвращает объект для типа поля справочник.
				 * @protected
				 * @virtual
				 * @param  {String} value Значение.
				 * @param {String} displayValue Отображаемое значение.
				 * @return {Object} Объект для типа поля справочник.
				 */
				getLookupValue: function(value, displayValue) {
					return {
						value: value,
						displayValue: displayValue
					};
				},

				/**
				 * Заполняет выпадающий список схем.
				 * @protected
				 * @virtual
				 * @param {String} filter Строка фильтрации.
				 * @param {Terrasoft.Collection} list Список.
				 */
				prepareEntitySchemaUIdList: function(filter, list) {
					if (list === null) {
						return;
					}
					list.clear();
					list.loadAll(this.getEntitySchemaUIdList());
				},

				/**
				 * Возвращает список схем.
				 * @protected
				 * @virtual
				 * @return {Object}  Список схем.
				 */
				getEntitySchemaUIdList: function() {
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
				 * Обрабатывает событие получения данных для инициалитзации.
				 * @protected
				 * @virtual
				 */
				onGetModuleConfigResult: function(detailConfig) {
					this.setPropertyValue(detailConfig);
					this.on("change:EntitySchemaUId", this.onEntitySchemaChange, this);
					this.on("change:Caption", this.onCaptionChange, this);
					this.hideBodyMask();
				},

				/**
				 * Обрабатывает событие изменение идентификатора схемы.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.BaseViewModel} model Модель представления.
				 * @param {String} changedValue Измененное значение.
				 */
				onEntitySchemaChange: function(model, changedValue) {
					var entitySchemaUId = changedValue && changedValue.value;
					var detailManagerItem = this.get("DetailManagerItem");
					detailManagerItem.setEntitySchemaUId(entitySchemaUId);
					this.sandbox.publish("UpdateWizardConfig", detailManagerItem, [this.sandbox.id]);
				},

				/**
				 * Обрабатывает событие изменение заголовка.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.BaseViewModel} model Модель представления.
				 * @param {String} changedValue Измененное значение.
				 */
				onCaptionChange: function(model, changedValue) {
					var detailManagerItem = this.get("DetailManagerItem");
					detailManagerItem.setCaption(changedValue);
				},

				/**
				 * Обрабатывает событие валидации.
				 * @protected
				 * @virtual
				 */
				onValidate: function() {
					this.sandbox.publish("ValidationResult", this.validate(), [this.sandbox.id]);
				},

				/**
				 * Обрабатывает событие сохранения.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст вызова callback-функции.
				 */
				onSave: function(callback, scope) {
					if (this.validate()) {
						this.showBodyMask();
						Terrasoft.chain(
							function(next) {
								this.detailSaveProcess(next, this);
							},
							function() {
								this.hideBodyMask();
								this.sandbox.publish("SavingResult", this.get("DetailManagerItem"),
									[this.sandbox.id]);
								if (callback) {
									callback.call(scope);
								}
							},
							this
						);
					}
				},

				/**
				 * Метод обработки сохранения детали.
				 * @protected
				 * @virtual
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст вызова callback-функции.
				 */
				detailSaveProcess: function(callback, scope) {
					var detailManagerItem = this.get("DetailManagerItem");
					var entitySchemaUIdLookupValue = this.get("EntitySchemaUId");
					var entitySchemaUId = entitySchemaUIdLookupValue && entitySchemaUIdLookupValue.value;
					var entitySchema;
					Terrasoft.chain(
						function(next) {
							var entitySchemaUIdLookupValue = this.get("EntitySchemaUId");
							var entitySchemaUId = entitySchemaUIdLookupValue && entitySchemaUIdLookupValue.value;
							Terrasoft.EntitySchemaManager.getInstanceByUId(entitySchemaUId, function(schema) {
								entitySchema = schema;
								next();
							}, this);
						},
						function(next) {
							if (detailManagerItem.getDetailSchemaUId()) {
								if (!detailManagerItem.getIsNew()) {
									var schemaConfig = {
										schemaUId: detailManagerItem.getDetailSchemaUId(),
										entitySchema: entitySchema
									};
									this.updateDetailSchema(schemaConfig, next, this);
								} else {
									next();
								}
							} else {
								var createDetailSchemaConfig = {
									entitySchema: entitySchema
								};
								this.createDetailSchema(createDetailSchemaConfig, function(detailSchema) {
									detailManagerItem.setDetailSchemaUId(detailSchema.getPropertyValue("uId"));
									next();
								}, this);
							}
						},
						function(next) {
							detailManagerItem.getSysModuleEntityManagerItem(function(sysModuleEntityManagerItem) {
								if (sysModuleEntityManagerItem) {
									next(sysModuleEntityManagerItem);
								} else {
									var registerSysModuleEntityConfig = {
										entitySchemaUId: entitySchemaUId
									};
									this.registerSysModuleEntity(registerSysModuleEntityConfig,
											function(registeredSysModuleEntityManagerItem) {
										next(registeredSysModuleEntityManagerItem);
									}, this);
								}
							}, this);
						},
						function(next, sysModuleEntityManagerItem) {
							sysModuleEntityManagerItem.getSysModuleEditManagerItems(
									function(sysModuleEditManagerItems) {
								if (sysModuleEditManagerItems.getCount() > 0) {
									callback.call(scope);
								} else {
									var registerSysModuleEditConfig = {
										sysModuleEntityId: sysModuleEntityManagerItem.getId(),
										entitySchema: entitySchema
									};
									this.registerSysModuleEdit(registerSysModuleEditConfig, callback, scope);
								}
							}, this);
						},
						this
					);
				},

				/**
				 * Изменяет схему детали.
				 * @protected
				 * @virtual
				 * @param {Object} config Объект настройки метода создания схемы детали.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст вызова callback-функции.
				 */
				updateDetailSchema: function(config, callback, scope) {
					var getPackageSchemaConfig = {
						packageUId: this.getPackageUId(),
						schemaUId: config.schemaUId
					};
					var caption =  this.get("Caption");
					Terrasoft.ClientUnitSchemaManager.forceGetPackageSchema(getPackageSchemaConfig, function(schema) {
						schema.localizableStrings.removeByKey("Caption");
						schema.localizableStrings.add("Caption", this.getLocalizableString(caption));
						var schemaCaption =  this.getDetailSchemaCaption(caption);
						schema.setLocalizableStringPropertyValue("caption", schemaCaption);
						var schemaBody = schema.getPropertyValue("body");
						if (!schemaBody) {
							var schemaName = schema.getPropertyValue("name");
							var entitySchema = config.entitySchema;
							var entitySchemaName = entitySchema.getPropertyValue("name");
							var schemaType = Terrasoft.SchemaType.GRID_DETAIL_VIEW_MODEL_SCHEMA;
							var bodyTemplate = Terrasoft.ClientUnitSchemaBodyTemplate[schemaType];
							var body = Ext.String.format(bodyTemplate, schemaName, entitySchemaName);
							schema.setPropertyValue("body", body);
						}
						var schemaUId =  schema.getPropertyValue("uId");
						if (!Terrasoft.ClientUnitSchemaManager.findItem(schemaUId)) {
							Terrasoft.ClientUnitSchemaManager.addSchema(schema);
						}
						schema.define(function() {
							callback.call(scope);
						}, this);
					}, this);
				},

				/**
				 * Создает схему детали.
				 * @protected
				 * @virtual
				 * @param {Object} config Объект настройки метода создания схемы детали.
				 * @param {Terrasoft.EntitySchema} config.entitySchema Entity-схема.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст вызова callback-функции.
				 * @return {Terrasoft.ClientUnitSchema} Cхема детали.
				 */
				createDetailSchema: function(config, callback, scope) {
					var bodyTemplate =
						Terrasoft.ClientUnitSchemaBodyTemplate[Terrasoft.SchemaType.GRID_DETAIL_VIEW_MODEL_SCHEMA];
					var entitySchema = config.entitySchema;
					var entitySchemaName = entitySchema.getPropertyValue("name");
					var entitySchemaUId = entitySchema.getPropertyValue("uId");
					var packageUId = this.getPackageUId();
					Terrasoft.ClientUnitSchemaManager.initialize(function() {
						var detailSchemaNameTemplate = "Schema{0}Detail";
						var detailSchemaName = this.getClientUnitSchemaName(detailSchemaNameTemplate);
						var detailCaption =  this.get("Caption");
						var detailSchemaCaption =  this.getDetailSchemaCaption(detailCaption);
						var schema = Terrasoft.ClientUnitSchemaManager.createSchema({
							uId: Terrasoft.generateGUID(),
							name: detailSchemaName,
							packageUId: packageUId,
							caption: {
								"ru-RU": detailSchemaCaption
							},
							extendParent: false,
							body: Ext.String.format(bodyTemplate, detailSchemaName, entitySchemaName),
							schemaType: Terrasoft.SchemaType.GRID_DETAIL_VIEW_MODEL_SCHEMA,
							parentSchemaUId: Terrasoft.DesignTimeEnums.BaseSchemaUId.BASE_GRID_DETAIL
						});
						schema.dependencies.add(entitySchemaName, entitySchemaUId);
						schema.localizableStrings.add("Caption", this.getLocalizableString(detailCaption));
						Terrasoft.ClientUnitSchemaManager.addSchema(schema);
						schema.define(function() {
							callback.call(scope, schema);
						}, this);
					}, this);
				},

				/**
				 * Возвращает заголовок схемы детали на основании шаблона.
				 * @protected
				 * @virtual
				 * @param {String} detailCaption Заголовок детали.
				 * @return {String} Заголовок схемы детали.
				 */
				getDetailSchemaCaption: function(detailCaption) {
					var detailSchemaCaptionTemplate =
						this.get("Resources.Strings.DetailSchemaCaptionTemplate");
					return Ext.String.format(detailSchemaCaptionTemplate, detailCaption);
				},

				/**
				 * Возвращает локализированную строку.
				 * @protected
				 * @virtual
				 * @param {String} value Значение.
				 * @return {Terrasoft.LocalizableString} окализированная строка.
				 */
				getLocalizableString: function(value) {
					var localizableString = Ext.create("Terrasoft.LocalizableString");
					localizableString.setValue(value);
					return localizableString;
				},

				/**
				 * Возвращает имя схемы на основании шаблона.
				 * @protected
				 * @virtual
				 * @param {String} schemaNameTemplate Шаблон имени схемы.
				 * @return {String} Имя схемы.
				 */
				getClientUnitSchemaName: function(schemaNameTemplate) {
					var schemaNamePrefix = Terrasoft.ClientUnitSchemaManager.schemaNamePrefix || "";
					var clientUnitSchemaManagerItems = Terrasoft.ClientUnitSchemaManager.getItems();
					var schemaName;
					for (var i = 1, iterations = clientUnitSchemaManagerItems.getCount(); i < iterations; i++) {
						schemaName = schemaNamePrefix + Ext.String.format(schemaNameTemplate, i);
						var foundItems = clientUnitSchemaManagerItems.filterByFn(function(item) {
							return item.getName() === schemaName;
						}, this);
						if (foundItems.isEmpty()) {
							break;
						}
					}
					return schemaName;
				},

				/**
				 * Возвращает идентификатор пакета.
				 * @protected
				 * @virtual
				 * @return {String} Идентификатор пакета.
				 */
				getPackageUId: function() {
					var packageUId = this.get("PackageUId");
					if (!packageUId) {
						packageUId = this.sandbox.publish("GetPackageUId", null, [this.sandbox.id]);
						this.set("PackageUId", packageUId);
					}
					return packageUId;
				},

				/**
				 * Регистрирует схему раздела.
				 * @protected
				 * @virtual
				 * @param {Object} config Объект настройки метода регистрации схемы раздела.
				 * @param {String} config.entitySchemaUId Идентифифкатор entity-схемы.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст вызова callback-функции.
				 * @return {Terrasoft.SysModuleEntityManagerItem} Элемент менеджера схем раздела.
				 */
				registerSysModuleEntity: function(config, callback, scope) {
					var entitySchemaUId = config.entitySchemaUId;
					Terrasoft.SysModuleEntityManager.createItem(null, function(item) {
						item.setEntitySchemaUId(entitySchemaUId);
						Terrasoft.SysModuleEntityManager.addItem(item);
						callback.call(scope, item);
					}, this);
				},

				/**
				 * Регистрирует страницу схемы раздела.
				 * @protected
				 * @virtual
				 * @param {Object} config Объект настройки метода регистрации страницы схем раздела.
				 * @param {String} config.sysModuleEntityId Идентифифкатор элемента менеджера схем раздела.
				 * @param {Terrasoft.EntitySchema} config.entitySchema Entity-схема.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст вызова callback-функции.
				 * @return {Terrasoft.SysModuleEntityManagerItem} Элемент менеджера схем раздела.
				 */
				registerSysModuleEdit: function(config, callback, scope) {
					var sysModuleEntityId = config.sysModuleEntityId;
					var entitySchema = config.entitySchema;
					Terrasoft.chain(
						function(next) {
							var createPageSchemaConfig = {
								entitySchema: entitySchema
							};
							this.createPageSchema(createPageSchemaConfig, next, this);
						},
						function(next, pageSchema) {
							Terrasoft.SysModuleEditManager.createItem(null, function(item) {
								item.setSysModuleEntityId(sysModuleEntityId);
								item.setCardSchemaUId(pageSchema.getPropertyValue("uId"));
								var pageCaptionLcz = pageSchema.getPropertyValue("caption");
								item.setPageCaption(pageCaptionLcz.getValue());
								Terrasoft.SysModuleEditManager.addItem(item);
								callback.call(scope, item);
							}, this);
						},
						this
					);
				},

				/**
				 * Создает схему карточки.
				 * @protected
				 * @virtual
				 * @param {Object} config Объект настройки метода создания схемы карточки.
				 * @param {Terrasoft.EntitySchema} config.entitySchema Entity-схема.
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст вызова callback-функции.
				 * @return {Terrasoft.ClientUnitSchema} Cхема карточки.
				 */
				createPageSchema: function(config, callback, scope) {
					var bodyTemplate =
						Terrasoft.ClientUnitSchemaBodyTemplate[Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA];
					var entitySchema = config.entitySchema;
					var entitySchemaName = entitySchema.getPropertyValue("name");
					var entitySchemaUId = entitySchema.getPropertyValue("uId");
					var packageUId = this.getPackageUId();
					Terrasoft.ClientUnitSchemaManager.initialize(function() {
						var pageSchemaNameTemplate = entitySchemaName + "{0}Page";
						var pageSchemaName = this.getClientUnitSchemaName(pageSchemaNameTemplate);
						var entitySchemaCaptionLcz = entitySchema.getPropertyValue("caption");
						var entitySchemaCaption = entitySchemaCaptionLcz.getValue();
						var detailPageCaptionTemplate =
							this.get("Resources.Strings.DetailPageCaptionTemplate");
						var detailPageCaption =  Ext.String.format(detailPageCaptionTemplate, entitySchemaCaption);
						var schema = Terrasoft.ClientUnitSchemaManager.createSchema({
							uId: Terrasoft.generateGUID(),
							name: pageSchemaName,
							packageUId: packageUId,
							caption: {
								"ru-RU": detailPageCaption
							},
							body: Ext.String.format(bodyTemplate, pageSchemaName, entitySchemaName),
							schemaType: Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA,
							parentSchemaUId: Terrasoft.DesignTimeEnums.BaseSchemaUId.BASE_PAGE
						});
						schema.dependencies.add(entitySchemaName, entitySchemaUId);
						Terrasoft.ClientUnitSchemaManager.addSchema(schema);
						schema.define(function() {
							callback.call(scope, schema);
						}, this);
					}, this);
				},

				/**
				 * @inheritDoc BaseSchemaViewModel#setValidationConfig
				 * @protected
				 * @overridden
				 */
				setValidationConfig: function() {
					this.callParent(arguments);
					this.addColumnValidator("Caption", this.captionLengthValidator);
				},

				/**
				 * Валидация по диапазону значений заголовка детали.
				 * @protected
				 * @param {String} value Значение заголовка.
				 * @param {Object} column Колонка модели.
				 * @return {Object} Объект, содержащий текст ошибки при вализации.
				 */
				captionLengthValidator: function(value, column) {
					var result = {
						invalidMessage: ""
					};
					if (Ext.isEmpty(value)) {
						return result;
					}
					var size = column.size;
					var valueSize = value.length;
					if (valueSize > size) {
						var message = Terrasoft.Resources.BaseViewModel.columnIncorrectTextRangeValidationMessage;
						message += " (" + valueSize + "/" + size + ")";
						result.invalidMessage = message;
					}
					return result;
				}

			},

			diff: [
				{
					"operation": "insert",
					"name": "DetailPropertiesControlGroup",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Caption",
					"parentName": "DetailPropertiesControlGroup",
					"propertyName": "items",
					"values": {
						"bindTo": "Caption",
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
					"name": "EntitySchemaUId",
					"parentName": "DetailPropertiesControlGroup",
					"propertyName": "items",
					"values": {
						"dataValueType": Terrasoft.DataValueType.ENUM,
						"enabled": {
							"bindTo": "IsEntitySchemaFieldEnabled",
							"bindConfig": {"converter": "getIsEntitySchemaFieldEnabled"}
						},
						"labelConfig": {
							"caption": {"bindTo": "Resources.Strings.entitySchemaLabel"}
						},
						"controlConfig": {
							"prepareList": {"bindTo": "prepareEntitySchemaUIdList"}
						}
					}
				}
			]
		};
	});
