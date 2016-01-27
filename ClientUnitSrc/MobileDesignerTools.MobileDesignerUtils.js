define("MobileDesignerUtils", ["sandbox", "MobileDesignerUtilsResources",
		"MobileDesignerEnums", "MobileDesignerApplicationManifest", "MobileDesignerConfigManager",
		"MobileDesignerMetadataToManifestConverter", "MobileDesignerSchemaManager", "MobileDesignerApplicationManifest",
		"EntityStructureHelperMixin"],
	function(sandbox) {

		/**
		 * @class Terrasoft.MobileDesignerUtils
		 * @public
		 * Класс утилит дизайнеров мобильного приложения.
		 */
		Ext.define("Terrasoft.MobileDesignerUtils", {

			mixins: {
				EntityStructureHelper: "Terrasoft.EntityStructureHelperMixin"
			},

			singleton: true,

			//region Properties: Private

			sandbox: Ext.create(sandbox),

			initialConfig: null,

			schemaManager: null,

			manifest: null,

			defaultWorkplaceCode: "DefaultWorkplace",

			//endregion

			//region Methods: Private

			/**
			 * @private
			 */
			initializeSchemaManager: function() {
				var config = this.initialConfig;
				var schemaManager = this.schemaManager = Ext.create("Terrasoft.MobileDesignerSchemaManager");
				schemaManager.self.initialize({
					packageUId: config.packageUId,
					workplaceCode: config.workplaceCode,
					callback: this.initializeManifest,
					scope: this
				});
			},

			/**
			 * @private
			 */
			initializeManifest: function() {
				var schemaManager = this.schemaManager;
				schemaManager.readManifestSchema({
					callback: function(schemaInstance) {
						Terrasoft.SchemaDesignerUtilities.getSchemaHierarchy(schemaInstance, function(manifestSchemas) {
							var localizableStringsList = [];
							var manifests = [];
							for (var i = 0, ln = manifestSchemas.length; i < ln; i++) {
								var manifestSchema = manifestSchemas[i];
								var manifestBody = schemaManager.self.getManifestBody(manifestSchema);
								manifests.push(manifestBody);
								var localizableStrings = schemaManager.self.getSchemaLocalizableStrings(manifestSchema);
								localizableStringsList.push(localizableStrings);
							}
							this.manifest = Ext.create("Terrasoft.MobileDesignerApplicationManifest", {
								manifests: manifests,
								localizableStrings: localizableStringsList
							});
							var config = this.initialConfig;
							Ext.callback(config.callback, config.scope);
						}, this);
					},
					scope: this
				});
			},

			/**
			 * @private
			 */
			resolveColumnCaption: function(config) {
				var currentColumnIndex = config.currentColumnIndex;
				var columnNames = config.columnNames;
				var numberOfColumns = config.numberOfColumns;
				if (!Ext.isNumber(currentColumnIndex)) {
					columnNames = config.columnNames = config.columnName.split(".");
					currentColumnIndex = config.currentColumnIndex = 0;
					numberOfColumns = config.numberOfColumns = columnNames.length;
				}
				var currentModelName = config.modelName;
				var columnName = columnNames[currentColumnIndex];
				this.getEntitySchema(currentModelName, function(schema) {
					var columnMetadata = schema.getColumnByName(columnName);
					config.currentColumnIndex++;
					var newCaption = columnMetadata.caption;
					var oldCaption = config.caption;
					if (oldCaption) {
						newCaption = oldCaption + "." + newCaption;
					}
					config.caption = newCaption;
					var referenceSchemaName = columnMetadata.referenceSchemaName;
					if (config.currentColumnIndex === numberOfColumns || !referenceSchemaName) {
						Ext.callback(config.callback, this, [config.caption]);
					} else {
						config.modelName = referenceSchemaName;
						this.resolveColumnCaption(config);
					}
				}, this);
			},

			// endregion

			/**
			 * Выполняет инициализацию.
			 * @param {Object} config Конфигурационный объект с параметрами вызова метода:
			 * @param {String} config.packageUId UId пакета.
			 * @param {String} config.workplaceCode Код рабочего места.
			 * @param {Function} config.callback Функция обратного вызова.
			 * @param {Object} config.scope Контекст функции обратного вызова.
			 */
			initialize: function(config) {
				this.initialConfig = config;
				this.initializeSchemaManager();
			},

			/**
			 * Получает имя схемы и загружает настройки.
			 * @param {Object} config Конфигурационный объект с параметрами вызова метода:
			 * @param {String} config.entitySchemaName Имя объекта.
			 * @param {String} config.settingsType Тип настройки.
			 * @param {Function} config.callback Функция обратного вызова.
			 * @param {Object} config.scope Контекст функции обратного вызова.
			 */
			loadSettings: function(config) {
				this.schemaManager.readSettingsSchema({
					entitySchemaName: config.entitySchemaName,
					settingsType: config.settingsType,
					callback: function(schemaInstance) {
						var designConfigManager = Ext.create("Terrasoft.MobileDesignerConfigManager", {
							schemaInstance: schemaInstance
						});
						designConfigManager.buildDesignerConfig({
							callback: config.callback,
							scope: config.scope
						});
					},
					scope: this
				});
			},

			/**
			 * Вычисляет имена колонок.
			 * @param {Object} config Конфигурационный объект с параметрами вызова метода:
			 * @param {String} config.modelName Имя родительского объекта.
			 * @param {Array} config.items Массив колонок.
			 * @param {Function} config.callback Функция обратного вызова.
			 * @param {Object} config.scope Контекст функции обратного вызова.
			 */
			setColumnsContentByPath: function(config) {
				this.loadedEntitySchemas = {};
				var chainArguments = [];
				var getColumnCaptionFn = function(item) {
					return function(next) {
						this.resolveColumnCaption({
							modelName: config.modelName,
							columnName: item.columnName,
							callback: function(content) {
								item.content = content;
								next();
							}
						});
					};
				};
				var items = config.items;
				for (var i = 0, ln = items.length; i < ln; i++) {
					chainArguments.push(getColumnCaptionFn(items[i]));
				}
				chainArguments.push(function(next) {
					Ext.callback(config.callback, config.scope);
					next();
				});
				chainArguments.push(this);
				Ext.callback(Terrasoft.chain, this, chainArguments);
			},

			/**
			 * Получает имя схемы и сохраняет настройки.
			 * @param {Object} config Конфигурационный объект с параметрами вызова метода:
			 * @param {String} config.entitySchemaName Имя объекта.
			 * @param {String} config.settingsType Тип настройки.
			 * @param {Object} config.settings Настройки, которые нужно сохранить.
			 * @param {Function} config.callback Функция обратного вызова.
			 * @param {Object} config.scope Контекст функции обратного вызова.
			 */
			saveSettings: function(config) {
				var schemaManager = this.schemaManager;
				var entitySchemaName = config.entitySchemaName;
				var schemaInstance = schemaManager.getSettingsSchemaInstance(entitySchemaName, config.settingsType);
				var designConfigManager = Ext.create("Terrasoft.MobileDesignerConfigManager", {
					schemaInstance: schemaInstance
				});
				designConfigManager.applyDesignerConfig({
					designConfig: config.settings,
					callback: function(diff) {
						var converter = Ext.create("Terrasoft.MobileDesignerMetadataToManifestConverter");
						converter.applyMetadataToManifest({
							manifest: this.manifest,
							entitySchemaName: entitySchemaName,
							settingsSchemaName: schemaInstance.name,
							settingsType: config.settingsType,
							metadata: diff,
							designerConfig: config.settings
						});
						Ext.callback(config.callback, config.scope);
					},
					scope: this
				});
			},

			/**
			 * Получает имя схемы по названию рабочего места.
			 * @param {String} schemaName Имя схемы.
			 * @param {String} workplaceName Имя рабочего места.
			 */
			getSchemaNameByWorkplace: function(schemaName, workplaceName) {
				return schemaName + workplaceName;
			},

			/**
			 * Получает имя схемы по названию рабочего места.
			 * @param {String} schemaName Имя схемы.
			 * @param {String} workplaceName Имя рабочего места.
			 */
			isSchemaFromWorkplace: function(schemaName, workplaceName) {
				return schemaName.endsWith(workplaceName);
			},

			/**
			 * Получает манифеста по имени пакета.
			 * @param {String} packageName Имя пакета.
			 */
			getManifestNameByPackage: function(packageName) {
				return "MobileApplicationManifest" + packageName;
			}

		});
		return Terrasoft.MobileDesignerUtils;

	});