define("MobileDesignerSchemaManager", [],
	function() {

		Ext.define("Terrasoft.MobileDesignerSchemaManager", {

			statics: {

				/**
				 * @private
				 */
				schemaNamePrefix: null,

				/**
				 * @private
				 */
				currentPackageUId: null,

				/**
				 * @private
				 */
				workplaceCode: null,

				/**
				 * @private
				 */
				schemaCache: null,

				/**
				 * @private
				 */
				getCultureValues: function(value) {
					return {
						"ru-RU": value,
						"en-GB": value,
						"en-US": value
					};
				},

				/**
				 * @private
				 */
				getSchemaName: function(name) {
					return "Mobile" + name + this.workplaceCode;
				},

				/**
				 * @private
				 */
				getSchemaNameWithPrefix: function(name) {
					return this.schemaNamePrefix + name;
				},

				/**
				 * @private
				 */
				getManifestSchemaName: function() {
					return this.getSchemaName("ApplicationManifest");
				},

				/**
				 * @private
				 */
				getSettingsSchemaName: function(modelName, settingsType) {
					var name = modelName;
					if (settingsType) {
						name += settingsType + "Settings";
					}
					return this.getSchemaName(name);
				},

				/**
				 * Выполняет инициализацию.
				 * @param {Object} config Конфигурационный объект с параметрами вызова метода:
				 * @param {String} config.packageUId UId пакета.
				 * @param {String} config.workplaceCode Код рабочего места.
				 * @param {Function} config.callback Функция обратного вызова.
				 * @param {Object} config.scope Контекст функции обратного вызова.
				 */
				initialize: function(config) {
					this.packageUId = config.packageUId;
					this.workplaceCode = config.workplaceCode;
					this.schemaCache = {};
					Terrasoft.ClientUnitSchemaManager.initialize(function() {
						var schemaNamePrefixSettingName = "SchemaNamePrefix";
						Terrasoft.SysSettings.querySysSetting(schemaNamePrefixSettingName, function(sysSettingObject) {
							this.schemaNamePrefix = sysSettingObject[schemaNamePrefixSettingName];
							Ext.callback(config.callback, config.scope);
						}, this);
					}, this);
				},

				/**
				 * Добавляет локализированную строку в схему.
				 * @param {Object} schemaInstance Экземпляр схемы.
				 * @param {String} name Имя локализированной строки.
				 * @param {String} value Значение локализированной строки.
				 */
				addLocalizableString: function(schemaInstance, name, value) {
					var localizableStringItem = schemaInstance.localizableStrings.find(name);
					if (localizableStringItem) {
						localizableStringItem.setValue(value);
					} else {
						var localizableString = Ext.create("Terrasoft.LocalizableString", {
							cultureValues: this.getCultureValues(value)
						});
						schemaInstance.localizableStrings.add(name, localizableString);
					}
				},

				/**
				 * Возвращает локализированные строки схемы.
				 * @param {Object} schemaInstance Экземпляр схемы.
				 * @returns {Object} Локализированные строки схемы.
				 */
				getSchemaLocalizableStrings: function(schemaInstance) {
					var result = {};
					var itemsCollection = schemaInstance.localizableStrings.collection;
					itemsCollection.eachKey(function(key, item) {
						result[key] = item.getValue();
					});
					return result;
				},

				/**
				 * Возвращает код тела схемы.
				 * @param {Object} schemaInstance Экземпляр схемы.
				 * @returns {Object} Код тела схемы.
				 */
				getManifestBody: function(schemaInstance) {
					var manifest;
					eval("manifest = " + schemaInstance.body + ";");
					return manifest || {};
				},

				/**
				 * Проверяет, что схема новосозданная.
				 * @param {Object} schemaInstance Экземпляр схемы.
				 * @returns {Boolean} true, если схема новосозданная.
				 */
				isNewSchemaInstance: function(schemaInstance) {
					var managerItem = Terrasoft.ClientUnitSchemaManager.getItem(schemaInstance.uId);
					return (managerItem.getStatus() === Terrasoft.ModificationStatus.NEW);
				}

			},

			//region Methods: Private

			/**
			 * @private
			 */
			createSchema: function(config) {
				var schemaName = config.name;
				var packageUId = this.self.packageUId;
				var schema = Terrasoft.ClientUnitSchemaManager.createSchema({
					uId: Terrasoft.generateGUID(),
					name: schemaName,
					packageUId: packageUId,
					parentSchemaUId: config.parentSchemaUId,
					extendParent: config.extendParent,
					caption: this.self.getCultureValues(schemaName)
				});
				Terrasoft.ClientUnitSchemaManager.addSchema(schema);
				return schema;
			},

			/**
			 * @private
			 */
			findClientUnitSchemaInstance: function(config) {
				var schemaName = config.schemaName;
				var packageUId = config.searchInAllPackages ? null : this.self.packageUId;
				var allSchemas = Terrasoft.ClientUnitSchemaManager.getItems();
				var parentSchema;
				var schemas = allSchemas.filterByFn(function(item) {
					var isNeededSchema = Ext.String.endsWith(item.name, schemaName);
					var itemPackageUId = item.packageUId;
					if (isNeededSchema && !item.extendParent && itemPackageUId !== packageUId) {
						parentSchema = item;
					}
					if (packageUId) {
						return isNeededSchema && itemPackageUId === packageUId;
					} else {
						return isNeededSchema;
					}
				});
				var schema = schemas.getByIndex(0);
				if (schema) {
					schema.getInstance(function(schemaInstance) {
						Ext.callback(config.callback, this, [schemaInstance, parentSchema]);
					}, this);
				} else {
					Ext.callback(config.callback, this, [null, parentSchema]);
				}
			},

			/**
			 * @private
			 */
			getSchemaFromCache: function(schemaName) {
				return this.self.schemaCache[schemaName];
			},

			/**
			 * @private
			 */
			addSchemaToCache: function(schemaName, schemaInstance) {
				this.self.schemaCache[schemaName] = schemaInstance;
			},

			/**
			 * @private
			 */
			callback: function() {
				var config = this.currentAsyncConfig;
				Ext.callback(config.callback, config.scope, arguments);
			},

			//endregion

			//region Methods: Public

			/**
			 * Создает объект, инициализирует его свойства.
			 */
			constructor: function(config) {
				this.initConfig(config);
			},

			/**
			 * Вычитывает схему.
			 * @param {Object} config Конфигурационный объект.
			 * @param {String} config.schemaName Название схемы.
			 * @param {Boolean} config.createIfNotExist Признак, указывающий содавать ли схему если она не существует.
			 * @param {Boolean} config.cacheSchemaInstance Признак, указывающий кешировать ли схему.
			 * @param {Boolean} config.searchInAllPackages Признак, указывающий искать ли схему во всех пакетах.
			 * @param {Function} config.callback Функция обратного вызова.
			 * @param {Object} config.scope Контекст функции обратного вызова.
			 *
			 */
			readSchema: function(config) {
				Ext.applyIf(config, {
					createIfNotExist: true,
					cacheSchemaInstance: true,
					searchInAllPackages: false
				});
				var schemaName = config.schemaName;
				this.findClientUnitSchemaInstance({
					schemaName: schemaName,
					searchInAllPackages: config.searchInAllPackages,
					callback: function(schemaInstance, parentSchema) {
						if (!schemaInstance) {
							var extendParent = !!parentSchema;
							var realSchemaName = extendParent
								? parentSchema.name
								: this.self.getSchemaNameWithPrefix(schemaName);
							if (config.createIfNotExist) {
								var parentSchemaUId = extendParent ? parentSchema.uId : null;
								schemaInstance = this.createSchema({
									name: realSchemaName,
									parentSchemaUId: parentSchemaUId,
									extendParent: extendParent
								});
							}
						}
						if (config.cacheSchemaInstance) {
							this.addSchemaToCache(schemaName, schemaInstance);
						}
						Ext.callback(config.callback, config.scope, [schemaInstance]);
					}
				});
			},

			/**
			 * Вычитывает схему настроек.
			 * @param {Object} config Конфигурационный объект.
			 * @param {String} config.entitySchemaName Имя сущности.
			 * @param {String} config.settingsType Тип настроек.
			 * @param {Boolean} config.createIfNotExist Признак, указывающий создавать ли схему, если она не существует.
			 * @param {Boolean} config.cacheSchemaInstance Признак, указывающий кешировать ли схему.
			 * @param {Boolean} config.searchInAllPackages Признак, указывающий искать ли схему во всех пакетах.
			 * @param {Function} config.callback Функция обратного вызова.
			 * @param {Object} config.scope Контекст функции обратного вызова.
			 */
			readSettingsSchema: function(config) {
				var entitySchemaName = config.entitySchemaName;
				var settingsType = config.settingsType;
				var schemaName = this.self.getSettingsSchemaName(entitySchemaName, settingsType);
				this.readSchema({
					schemaName: schemaName,
					searchInAllPackages: config.searchInAllPackages,
					createIfNotExist: config.createIfNotExist,
					cacheSchemaInstance: config.cacheSchemaInstance,
					callback: config.callback,
					scope: config.scope
				});
			},

			/**
			 * Вычитывает схему манифеста.
			 * @param {Object} config Конфигурационный объект.
			 * @param {Boolean} config.createIfNotExist Признак, указывающий создавать ли схему, если она не существует.
			 * @param {Boolean} config.cacheSchemaInstance Признак, указывающий кешировать ли схему.
			 * @param {Boolean} config.searchInAllPackages Признак, указывающий искать ли схему во всех пакетах.
			 * @param {Function} config.callback Функция обратного вызова.
			 * @param {Object} config.scope Контекст функции обратного вызова.
			 */
			readManifestSchema: function(config) {
				var schemaName = this.self.getManifestSchemaName();
				this.readSchema({
					schemaName: schemaName,
					searchInAllPackages: config.searchInAllPackages,
					createIfNotExist: config.createIfNotExist,
					cacheSchemaInstance: config.cacheSchemaInstance,
					callback: function(schemaInstance) {
						var isNewSchemaInstance = this.self.isNewSchemaInstance(schemaInstance);
						if (isNewSchemaInstance && !schemaInstance.parentSchemaUId) {
							this.readSchema({
								schemaName: "MobileApplicationManifestTemplate",
								searchInAllPackages: true,
								cacheSchemaInstance: false,
								callback: function(templateSchemaInstance) {
									schemaInstance.body = templateSchemaInstance.body;
									Ext.callback(config.callback, config.scope, [schemaInstance]);
								},
								scope: this
							});
						} else {
							Ext.callback(config.callback, config.scope, [schemaInstance]);
						}
					},
					scope: this
				});
			},

			/**
			 * Сохраняет схемы.
			 * @param {Object} config Конфигурационный объект.
			 * @param {Function} config.callback Функция обратного вызова.
			 * @param {Object} config.scope Контекст функции обратного вызова.
			 */
			saveSchemas: function(config) {
				Terrasoft.ClientUnitSchemaManager.save(config.callback, config.scope);
			},

			/**
			 * Записывает в манифест новые значения.
			 * @param {Object} schemaBody Код тела схемы
			 * @param {Object} localizableStrings Локализированные строки.
			 */
			updateCurrentPackageManifest: function(schemaBody, localizableStrings) {
				var schemaInstance = this.getManifestSchemaInstance();
				for (var localizableStringName in localizableStrings) {
					if (localizableStrings.hasOwnProperty(localizableStringName)) {
						var localizableStringValue = localizableStrings[localizableStringName];
						this.self.addLocalizableString(schemaInstance, localizableStringName, localizableStringValue);
					}
				}
				schemaInstance.setPropertyValue("body", schemaBody);
			},

			/**
			 * Возвращает экземпляр схемы настроек.
			 * @param {String} modelName Имя модели.
			 * @param {String} settingsType Тип настроек.
			 * @returns {Object} Экземпляр схемы настроек.
			 */
			getSettingsSchemaInstance: function(modelName, settingsType) {
				var schemaName = this.self.getSettingsSchemaName(modelName, settingsType);
				return this.getSchemaFromCache(schemaName);
			},

			/**
			 * Возвращает экземпляр схемы манифеста.
			 * @returns {Object} Экземпляр схемы манифеста.
			 */
			getManifestSchemaInstance: function() {
				var schemaName = this.self.getManifestSchemaName();
				return this.getSchemaFromCache(schemaName);
			}

			//endregion

		});

		return Terrasoft.MobileDesignerSchemaManager;
	}
);