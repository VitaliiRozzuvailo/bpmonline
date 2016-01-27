define("SectionDesignerUtils", [
		"ext-base", "terrasoft", "SectionDesignerUtilsResources", "SectionDesignerEnums",
		"BaseEntity", "BaseFolder", "File", "BaseItemInFolder", "BaseTag", "BaseEntityInTag", "ConfigurationEnums",
		"ModalBox", "BaseLookup", "css!SectionDesignerUtils"
	],
	function(Ext, Terrasoft, resources, SectionDesignerEnums, BaseEntity, BaseFolder, File, BaseItemInFolder, BaseTag,
			 BaseEntityInTag, ConfigurationEnums, ModalBox) {

		/**
		 * Локализированные строки ресурсов
		 * @private
		 * @type {Object}
		 */
		var localizableStrings = resources.localizableStrings;

		/**
		 * Объект SectionDesignDataModule
		 * @private
		 * @type {Object}
		 */
		var SectionDesignDataModule = null;

		/**
		 * Объект структуры раздела
		 * @type {Object}
		 */
		var modulesStructure = {};

		/**
		 * Префикс названия объекта
		 * @type {string}
		 */
		var schemaNamePrefix = "";

		/**
		 * Объект хранилища
		 * @type {Object}
		 */
		var storage = Terrasoft.DomainCache;

		/**
		 * Возвращает шаблон страницы редактирования раздела
		 * @private
		 * @param {String} clientUnitSchemaName Название клиентской схемы
		 * @param {String} entitySchemaName Название объекта раздела
		 * @return {String} шаблон страницы редактирования раздела
		 */
		function getPageSchemaBody(clientUnitSchemaName, entitySchemaName) {
			var bodyTemplate =
				"define('{0}', ['{0}Resources', 'GeneralDetails'],\n" +
				"function(resources, GeneralDetails) {\n" +
				"	return {\n" +
				"		entitySchemaName: '{1}',\n" +
				"		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,\n" +
				"		diff: /**SCHEMA_DIFF*/[\n" +
				"	{\n" +
				"		'operation': 'insert',\n" +
				"		'name': 'Name',\n" +
				"		'values': {\n" +
				"			'layout': {\n" +
				"				'column': 0,\n" +
				"				'row': 0,\n" +
				"				'colSpan': 12,\n" +
				"				'rowSpan': 1\n" +
				"			},\n" +
				"			'bindTo': 'Name',\n" +
				"			'caption':" + localizableStrings.PrimaryDisplayColumnCaption + "\n" +
				"		}," +
				"		'parentName': 'Header',\n" +
				"		'propertyName': 'items',\n" +
				"		'index': 0\n" +
				"	}\n" +
				"		]/**SCHEMA_DIFF*/,\n" +
				"		attributes: {},\n" +
				"		methods: {},\n" +
				"		rules: {},\n" +
				"		userCode: {}\n" +
				"	};\n" +
				"});\n";
			return Ext.String.format(bodyTemplate, clientUnitSchemaName, entitySchemaName);
		}

		/**
		 * Возвращает шаблон страницы раздела
		 * @private
		 * @param {String} clientUnitSchemaName Название клиентской схемы
		 * @param {String} entitySchemaName Название объекта раздела
		 * @return {String} шаблон страницы раздела
		 */
		function getSectionSchemaBody(clientUnitSchemaName, entitySchemaName) {
			var bodyTemplate =
				"define('{0}', ['GridUtilitiesV2'],\n" +
				"function() {\n" +
				"	return {\n" +
				"		entitySchemaName: '{1}',\n" +
				"		contextHelpId: '1001',\n" +
				"		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/,\n" +
				"		messages: {},\n" +
				"		methods: {}\n" +
				"	};\n" +
				"});\n";
			return Ext.String.format(bodyTemplate, clientUnitSchemaName, entitySchemaName);
		}

		/**
		 * Возвращает шаблон страницы детали раздела
		 * @private
		 * @param {String} clientUnitSchemaName Название клиентской схемы
		 * @param {String} entitySchemaName Название объекта раздела
		 * @return {String} шаблон страницы детали раздела
		 */
		function getSectionDetailSchemaBody(clientUnitSchemaName, entitySchemaName) {
			var bodyTemplate =
				"define('{0}', ['terrasoft'],\n" +
				"function(Terrasoft) {\n" +
				"	return {\n" +
				"		entitySchemaName: '{1}',\n" +
				"		attributes: {},\n" +
				"		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/,\n" +
				"		methods: {},\n" +
				"		messages: {}\n" +
				"	};\n" +
				"});\n";
			return Ext.String.format(bodyTemplate, clientUnitSchemaName, entitySchemaName);
		}

		function isExistColumn(config) {
			var callback = function(schema) {
				var result = Ext.isEmpty(schema.columns[config.name]);
				config.callback.call(this, result);
			};

			SectionDesignDataModule.getEntitySchemaByName({
				name: config.schemaName,
				isOriginal: config.isOriginal,
				callback: callback
			});
		}

		/**
		 * Возвращает текст тела схемы
		 * @private
		 * @param {String} schemaName Название Название схемы
		 * @param {Terrasoft.SchemaType} schemaType Тип схемы
		 * @param {String} entitySchemaName Название объекта раздела
		 * @param {Function} callback Функция обратного вызова
		 * @param {Object} scope Объект в контексте которого будет выполняться функция обратного вызова
		 * @return {String} шаблон страницы раздела
		 */
		function getSchemaBody(schemaName, schemaType, entitySchemaName, schemaPackageStatus, callback, scope) {
			Terrasoft.chain({}, [
				function(context) {
					if (schemaPackageStatus === SectionDesignerEnums.SchemaPackageStatus.EXISTS_IN_CURRENT_PACKAGE) {
						getClientUnitSchemaBody(schemaName, function(body) {
							context.body = body;
							context.next();
						});
					} else {
						context.next();
					}
				},
				function(context) {
					var body = context.body;
					if (!body) {
						switch (schemaType) {
							case Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA:
								body = getPageSchemaBody(schemaName, entitySchemaName);
								break;
							case Terrasoft.SchemaType.GRID_DETAIL_VIEW_MODEL_SCHEMA:
								body = getSectionDetailSchemaBody(schemaName, entitySchemaName);
								break;
							default:
								body = getSectionSchemaBody(schemaName, entitySchemaName);
								break;
						}
					}
					scope = scope || this;
					callback.call(scope, body);
				}
			]);
		}

		/**
		 * Возвращает текст тела для массива схем
		 * @private
		 * @param {Object[]} schemaConfig Объект конфигурации основных параметров схемы
		 * @param {String} schemaConfig.schemaName Название Название схемы
		 * @param {Terrasoft.SchemaType} schemaConfig.schemaType Тип схемы
		 * @param {String} entitySchemaName schemaConfig.Название объекта раздела
		 * @param {Function} callback Функция обратного вызова
		 * @param {Object} scope Объект в контексте которого будет выполняться функция обратного вызова
		 * @param {Number} index Индекс текущего элемента объекта конфигурации
		 * @param {Object} resultOut Объект промежуточного результата
		 */
		function getSchemeBody(schemaConfig, callback, scope, index, resultOut) {
			var result = resultOut || {};
			index = index || 0;
			if (index === schemaConfig.length) {
				scope = scope || this;
				callback.call(scope, result);
			} else {
				var schemaItem = schemaConfig[index];
				index = index + 1;
				var schemaName = schemaItem.schemaName;
				var schemaType = schemaItem.schemaType;
				var entitySchemaName = schemaItem.entitySchemaName;
				getSchemaBody(schemaName, schemaType, entitySchemaName, function(body) {
					result[schemaName] = body;
					getSchemeBody(schemaConfig, callback, scope, index, result);
				}, this);
			}
		}

		/**
		 * Создает контейнер
		 * @param {Object} renderTo объект для указания места отрисовки контрола
		 * @param {String} id идентификатор элемента управления
		 * @return {Terrasoft.Container} объект созданного контейнера
		 */
		function createControlContainer(renderTo, id) {
			var container = Ext.create("Terrasoft.Container", {
				renderTo: renderTo,
				id: id,
				styles: {
					wrapStyles: {
						width: "100%",
						minHeight: "100%",
						margin: "20px"
					}
				},
				selectors: {
					wrapEl: "#" + id
				}
			});
			return container;
		}

		/**
		 * Создает подпись элемента управления
		 * @param {Object} renderTo объект для указания места отрисовки контрола
		 * @param {String} caption текст подписи элемента управления
		 * @return {Terrasoft.Label} объект созданного элемента
		 */
		function createControlLabel(renderTo, caption) {
			var label = Ext.create("Terrasoft.Label", {
				caption: caption || "",
				renderTo: renderTo
			});
			return label;
		}

		/**
		 * Создает элемент управления
		 * @param {Object} renderTo объект для указания места отрисовки контрола
		 * @param {Terrasoft.DataValueType} dataValueType тип данных элемента управления
		 * @param {Object} value значение элемента управления
		 * @return {Object} объект созданного элемента управления
		 */
		function createControlInput(renderTo, dataValueType, value) {
			var inputConfig = Terrasoft.getControlConfigByDataValueType(dataValueType);
			if (dataValueType !== Terrasoft.DataValueType.BOOLEAN) {
				inputConfig.value = value;
			} else {
				inputConfig.checked = value;
			}
			inputConfig.renderTo = renderTo;
			var input = Ext.create(inputConfig.className, inputConfig);
			return input;
		}

		/**
		 * Вызов метода веб-сервиса
		 * @param {Object} config объект параметров:
		 * @param {String} methodName название метода
		 * @param {Object} parameters параметры метода
		 * @param {Function} callback функция обратного вызова
		 * @param {Number} timeout врема ожидания ответа сервера
		 * @param {Object} scope контекст выполнения функциии обратного вызова
		 */
		function postServiceRequest(config) {
			var methodName, parameters, scope, callback;
			methodName = config.methodName;
			parameters = config.parameters;
			scope = config.scope;
			callback = config.callback;
			var serviceUrl = Terrasoft.workspaceBaseUrl + "/rest/DesignService/";
			var requestOptions = {
				url: serviceUrl + methodName,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: parameters,
				scope: scope,
				callback: callback
			};
			if (config.timeout) {
				requestOptions.timeout = config.timeout;
			}
			Terrasoft.AjaxProvider.request(requestOptions);
		}

		/**
		 * Функция установки SectionDesignDataModule
		 * @param {Object} arg агрумент функции
		 */
		function setSectionDesignDataModule(arg) {
			SectionDesignDataModule = arg;
		}

		/**
		 * Функция инициализации schemaNamePrefix
		 * @param {String} value значение префикса
		 */
		function initSchemaNamePrefix(value) {
			schemaNamePrefix = value || "";
		}

		/**
		 * Функция создания элементов управления
		 * @param {Object} config объект с конфигурацией
		 * @return {Object} controls объект созданных элементов управления
		 */
		function createInputControls(config) {
			if (!config) {
				return null;
			}
			var controls = {};
			Terrasoft.each(config, function(controlConfigItem, key) {
				var controlContainer = createControlContainer(controlConfigItem.renderTo, key);
				var controlContainerRenderToEl = controlContainer.getRenderToEl();
				var controlLabel = createControlLabel(controlContainerRenderToEl, controlConfigItem.caption);
				var controlInput = createControlInput(controlContainerRenderToEl, controlConfigItem.dataValueType,
					controlConfigItem.value);
				var item = {
					name: key,
					container: controlContainer,
					label: controlLabel,
					control: controlInput
				};
				controls[key] = item;
			}, this);
			return controls;
		}

		/**
		 * Функция валидации системного имени
		 * @param {String} name строка для валидации
		 * @return {Object} объект валидации
		 */
		function validateSystemName(name, options, validatePrefix) {
			var result = {
				invalidMessage: "",
				isValid: true
			};
			var length = options.maxLength - 1;
			var regString = "^[a-zA-Z]{1}[a-zA-Z0-9]{0," + length + "}$";
			var reqExp = new RegExp(regString);
			if (!reqExp.test(name)) {
				if (name.length <= options.maxLength) {
					result.invalidMessage = localizableStrings.WrongSectionCodeMessage;
				} else {
					result.invalidMessage = Ext.String.format(localizableStrings.WrongSectionCodeLengthMessage,
						options.maxLength);
				}
				result.isValid = false;
			} else if (validatePrefix && !validateNamePrefix(name)) {
				var invalidMessage = Ext.String.format(localizableStrings.WrongPrefixMessage, getSchemaNamePrefix());
				result.invalidMessage = invalidMessage;
				result.isValid = false;
			}
			return result;
		}

		/**
		 * Функция валидации кода раздела, на наличие в нем префикса
		 * @param {String} code Код раздела
		 * @returns {Boolean} результат валидации
		 */
		function validateNamePrefix(code) {
			var prefixReqExp = new RegExp("^" + schemaNamePrefix + ".*$");
			var isCodeValid = prefixReqExp.test(code);
			return isCodeValid;
		}

		/**
		 * Функция валидации элемента управления
		 * @param {Terrasoft.TextEdit} textEdit элемента управления
		 * @param {Function} validationMethod функция валидации
		 */
		function validateTextEdit(textEdit, validationMethod) {
			var value = textEdit.getValue();
			var validationInfo = validationMethod(value);
			textEdit.setValidationInfo(validationInfo);
		}

		/**
		 * Функция создания кнопок
		 * @param {Object} config объект с конфигурацией
		 * @return {Object} controls объект созданных кнопок
		 */
		function createButtons(config) {
			if (!config) {
				return null;
			}
			var controls = {};
			Terrasoft.each(config, function(controlConfigItem, key) {
				var controlContainer = createControlContainer(controlConfigItem.renderTo, key);
				var controlContainerRenderToEl = controlContainer.getRenderToEl();
				controlConfigItem.renderTo = controlContainerRenderToEl;
				delete controlConfigItem.handler;
				var button = Ext.create("Terrasoft.Button", controlConfigItem);
				controls[key] = button;
			}, this);
			return controls;
		}

		/**
		 * Функция создания колонки entity схемы
		 * @param {Object} config объект с конфигурацией колонки
		 * @return {Object} колонка entity схемы
		 */
		function createEntitySchemaColumn(config) {
			var result = {
				uId: Terrasoft.generateGUID()
			};
			Ext.apply(result, config);
			return result;
		}

		/**
		 * Функция создания основной отображаемой колонки entity схемы
		 * @return {Object} колонка entity схемы
		 */
		function createEntitySchemaPrimaryDisplayColumn() {
			return createEntitySchemaColumn({
				caption: localizableStrings.PrimaryDisplayColumnCaption,
				dataValueType: Terrasoft.DataValueType.TEXT,
				isRequired: true,
				isValueCloneable: true,
				name: schemaNamePrefix + "Name",
				size: 250,
				usageType: 0
			});
		}

		/**
		 * Функция создания reference колонки entity схемы
		 * @param {Terrasoft.BaseEntitySchema} entity объект Terrasoft.BaseEntitySchema
		 * @param {Object} config дополнительная конфигурация колонки
		 * @return {Object} reference колонка
		 */
		function createEntitySchemaReferenceColumn(entity, config) {
			var columnConfig = {};
			Ext.apply(columnConfig, config, entity);
			return createEntitySchemaColumn({
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				referenceSchemaName: entity.name,
				referenceSchema: {
					caption: entity.caption,
					name: entity.name,
					primaryColumnName: entity.primaryColumnName,
					primaryDisplayColumnName: entity.primaryDisplayColumnName
				},
				isLookup: true,
				lookupType: "Exist",
				name: columnConfig.name,
				caption: columnConfig.caption,
				usageType: ConfigurationEnums.EntitySchemaColumnUsageType.General
			});
		}

		/**
		 * Функция создания entity схемы
		 * @param {Object} config объект с конфигурацией entity схемы
		 * @return {Terrasoft.BaseEntitySchema} entity объект Terrasoft.BaseEntitySchema
		 */
		function createEntitySchema(config) {
			var caption = config.caption;
			var name = config.name;
			var baseEntity = config.rootEntitySchema || BaseEntity;
			var administratedByRecords = !!config.administratedByRecords;
			Ext.define("Terrasoft.data.models." + name, {
				extend: "Terrasoft.BaseEntitySchema",
				alternateClassName: "Terrasoft." + name,
				caption: caption,
				name: name,
				singleton: true,
				uId: Terrasoft.generateGUID(),
				primaryColumnName: baseEntity.primaryColumnName,
				primaryColumn: baseEntity.primaryColumn,
				primaryDisplayColumnName: baseEntity.primaryDisplayColumnName,
				primaryDisplayColumn: baseEntity.primaryDisplayColumn,
				hierarchicalColumnName: baseEntity.hierarchicalColumnName,
				hierarchicalColumn: baseEntity.hierarchicalColumnName,
				administratedByRecords: administratedByRecords,
				columns: baseEntity.columns
			});
			Terrasoft[name].rootEntitySchema = baseEntity;
			return Terrasoft[name];
		}

		/**
		 * Функция создания данных дизайнера схемы
		 * @param {Terrasoft.BaseEntitySchema} entity экземпляр схемы
		 * @param {Object[]} columns массив объектов колонок
		 * @return {Object} объект данных дизайнера схемы
		 */
		function getEntitySchemaDesignData(entity, columns) {
			var entityRootSchema = entity.rootEntitySchema || BaseEntity;
			var result = {
				metaInfo: {
					modificationType: SectionDesignerEnums.ModificationType.NEW,
					modifiedData: {
						rootEntitySchemaId: entityRootSchema.uId,
						caption: entity.caption,
						name: entity.name,
						uId: entity.uId,
						primaryColumnName: entity.primaryColumnName,
						primaryColumn: entity.primaryColumn,
						primaryDisplayColumnName: entity.primaryDisplayColumnName,
						primaryDisplayColumn: entity.primaryDisplayColumn,
						hierarchicalColumnName: entity.hierarchicalColumnName,
						hierarchicalColumn: entity.hierarchicalColumnName,
						administratedByRecords: true,
						columns: {}
					}
				},
				schema: entity
			};
			var modifiedData = result.metaInfo.modifiedData;
			var designDataColumns = modifiedData.columns;
			for (var i = 0, columnsLength = columns.length; i < columnsLength; i++) {
				var columnItem = columns[i];
				var column = columnItem.column;
				designDataColumns[column.uId] = column;
				if (columnItem.isPrimaryDisplayColumn) {
					modifiedData.primaryDisplayColumn = column;
					modifiedData.primaryDisplayColumnName = column.name;
				}
			}
			return result;
		}

		/**
		 * Функция создания client unit схемы
		 * @param {Object} config объект с конфигурацией client unit схемы:
		 * @param {String} config.name имя схемы
		 * @param {String} config.caption название схемы
		 * @param {String} config.type тип схемы
		 * @param {String} config.parentSchemaUId идентификатор базовой схемы
		 * @param {String} config.code код раздела
		 * @return {Terrasoft.BaseViewModel} объект Terrasoft.BaseViewModel
		 */
		function createClientUnitSchema(config) {
			var result = {
				resources: {
					localizableImages: {},
					localizableStrings: {}
				},
				structure: {
					extendParent: false,
					parentSchemaUId: config.parentSchemaUId,
					schemaCaption: config.caption,
					schemaName: config.name,
					schemaUId: Terrasoft.generateGUID(),
					parentSchemaName: config.parentSchemaName,
					type: config.type
				},
				schema: {
					messages: {},
					mixins: {},
					attributes: {},
					methods: {},
					diff: []
				}
			};
			if (config.type === Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA) {
				Ext.apply(result.schema, {
					entitySchemaName: config.code,
					details: {},
					rules: {}
				});
			} else if (config.type === Terrasoft.SchemaType.GRID_DETAIL_VIEW_MODEL_SCHEMA) {
				Ext.apply(result.schema, {
					entitySchemaName: config.code
				});
			}
			return result;
		}

		/**
		 * Функция генерации схем нового раздела
		 * @param {Object} config конфигурация схемы:
		 * @param {String} config.code код раздела
		 * @param {String} config.caption заголовок раздела
		 * @param {GUID} config.sectionIconId уникальный идентификатор картинки раздела в меню
		 * @param {GUID} config.sectionLogoId уникальный идентификатор картинки раздела в ленте
		 * @param {GUID} config.workplaceId идентификатор рабочего места
		 */
		function createModuleScheme(config) {
			var code = config.code;
			var sectionIconId = config.sectionIconId;
			var sectionLogoId = config.sectionLogoId;
			var workplaceId = config.workplaceId;
			var caption = config.caption || code;
			var codeWithPrefix = code;
			if (!validateNamePrefix(codeWithPrefix)) {
				codeWithPrefix = schemaNamePrefix + code;
			}
			var moduleDesignData = {
				module: {},
				mainModuleName: code,
				schemaManager: {
					entity: {},
					clientUnit: {}
				},
				gridSettings: {},
				workplaceId: workplaceId
			};
			var defaultModuleConfig = {
				isNew: true,
				code: code,
				caption: caption,
				entityTagId: "",
				entityTagName: "",
				entityInTagId: "",
				entityInTagName: "",
				entityFolderId: "",
				entityFolderName: "",
				entityInFolderId: "",
				entityInFolderName: "",
				entityId: "",
				entityName: "",
				header: Ext.String.format(localizableStrings.ModuleHeaderTemplate, caption),
				id: Terrasoft.generateGUID(),
				pages: [],
				details: [],
				sectionIconId: sectionIconId,
				sectionLogoId: sectionLogoId,
				sectionSchemaId: "",
				sectionSchemaName: "",
				typeColumnId: null,
				sysModuleEntityId: Terrasoft.generateGUID()
			};
			var entities = moduleDesignData.schemaManager.entity;
			var clientUnits = moduleDesignData.schemaManager.clientUnit;
			var entity = createEntitySchema({
				name: code,
				caption: caption,
				administratedByRecords: true
			});
			var primaryDisplayColumn = createEntitySchemaPrimaryDisplayColumn();
			entities[entity.name] = getEntitySchemaDesignData(entity, [{
				column: primaryDisplayColumn,
				isPrimaryDisplayColumn: true
			}]);
			defaultModuleConfig.entityId = entity.uId;
			defaultModuleConfig.entityName = entity.name;
			var entityFolder = createEntitySchema({
				name: codeWithPrefix + "Folder",
				caption: Ext.String.format(localizableStrings.EntityFolder, caption),
				rootEntitySchema: BaseFolder
			});
			entities[entityFolder.name] = getEntitySchemaDesignData(entityFolder, [], Terrasoft.BaseFolder.uId);
			defaultModuleConfig.entityFolderId = entityFolder.uId;
			defaultModuleConfig.entityFolderName = entityFolder.name;
			var entityTag = createEntitySchema({
				name: codeWithPrefix + "Tag",
				caption: Ext.String.format(localizableStrings.EntityTagCaption, caption),
				rootEntitySchema: BaseTag,
				administratedByRecords: true
			});
			entities[entityTag.name] = getEntitySchemaDesignData(entityTag, [], Terrasoft.BaseTag.uId);
			defaultModuleConfig.entityTagId = entityTag.uId;
			defaultModuleConfig.entityTagName = entityTag.name;
			var entityInTag = createEntitySchema({
				name: codeWithPrefix + "InTag",
				caption: Ext.String.format(localizableStrings.EntityInTagCaption, caption),
				rootEntitySchema: BaseEntityInTag,
				administratedByRecords: false
			});
			var tagColumnConfig = Terrasoft.deepClone(BaseEntityInTag.columns.Tag);
			tagColumnConfig.referenceSchemaName = entityTag.name;
			var entityColumnConfig = Terrasoft.deepClone(BaseEntityInTag.columns.Entity);
			entityColumnConfig.referenceSchemaName = codeWithPrefix;
			entities[entityInTag.name] = getEntitySchemaDesignData(entityInTag, [
				{column: createEntitySchemaColumn(tagColumnConfig)},
				{column: createEntitySchemaColumn(entityColumnConfig)}
			]);
			defaultModuleConfig.entityInTagId = entityInTag.uId;
			defaultModuleConfig.entityInTagName = entityInTag.name;
			var entityInFolder = createEntitySchema({
				name: codeWithPrefix + "InFolder",
				caption: Ext.String.format(localizableStrings.EntityInFolderCaption, caption),
				rootEntitySchema: BaseItemInFolder
			});
			var folderColumnConfig = Terrasoft.deepClone(BaseItemInFolder.columns.Folder);
			folderColumnConfig.referenceSchemaName = entityFolder.name;
			entities[entityInFolder.name] = getEntitySchemaDesignData(entityInFolder, [
				{column: createEntitySchemaReferenceColumn(entity, {name: codeWithPrefix})},
				{column: createEntitySchemaColumn(folderColumnConfig)}
			]);
			defaultModuleConfig.entityInFolderId = entityInFolder.uId;
			defaultModuleConfig.entityInFolderName = entityInFolder.name;
			var entityFile = createEntitySchema({
				name: codeWithPrefix + "File",
				caption: Ext.String.format(localizableStrings.EntityFile, caption),
				rootEntitySchema: File
			});
			entities[entityFile.name] = getEntitySchemaDesignData(entityFile, [{
				column: createEntitySchemaReferenceColumn(entity, {name: codeWithPrefix})
			}]);
			defaultModuleConfig.details.push(entityFile.name);
			var sectionSchemaName = codeWithPrefix + "Section";
			var schemaConfig = {
				name: sectionSchemaName,
				caption: Ext.String.format(localizableStrings.SectionPage, caption),
				code: code,
				type: Terrasoft.SchemaType.MODULE_VIEW_MODEL_SCHEMA,
				parentSchemaUId: SectionDesignerEnums.BaseSchemeUIds.BASE_SECTION,
				parentSchemaName: SectionDesignerEnums.BaseClientUnitSchemeNames.BASE_SECTION_NAME
			};
			var entitySection = createClientUnitSchema(schemaConfig);
			var sectionSchemaUId = entitySection.structure.schemaUId;
			sectionSchemaName = entitySection.structure.schemaName;
			clientUnits[sectionSchemaName] = getNewClientUnitSchemaDesignData(entitySection);
			var sectionDetailName = codeWithPrefix + "Detail";
			var detailSchemaConfig = {
				name: sectionDetailName,
				caption: Ext.String.format(localizableStrings.SectionDetail, caption),
				code: code,
				type: Terrasoft.SchemaType.GRID_DETAIL_VIEW_MODEL_SCHEMA,
				parentSchemaUId: SectionDesignerEnums.BaseSchemeUIds.BASE_GRID_DETAIL,
				parentSchemaName: SectionDesignerEnums.BaseClientUnitSchemeNames.BASE_GRID_NAME
			};
			var entitySectionDetail = createClientUnitSchema(detailSchemaConfig);
			var detailDesignData = getNewClientUnitSchemaDesignData(entitySectionDetail);
			clientUnits[sectionDetailName] = detailDesignData;
			var detailResourcesMetaInfo = detailDesignData.resources.metaInfo;
			Ext.merge(detailResourcesMetaInfo.modifiedData, {
				localizableStrings: {
					Caption: caption
				}
			});
			var detailDiff = getDefaultDetailDiff(primaryDisplayColumn.name);
			var detailSchemasMetaInfo = detailDesignData.schema.metaInfo;
			Ext.merge(detailSchemasMetaInfo.modifiedData, {
				diff: [detailDiff]
			});
			var detailSchemaUId = entitySectionDetail.structure.schemaUId;
			sectionDetailName = entitySectionDetail.structure.schemaName;
			defaultModuleConfig.sectionSchemaId = sectionSchemaUId;
			defaultModuleConfig.sectionSchemaName = sectionSchemaName;
			defaultModuleConfig.sectionDetailId = detailSchemaUId;
			defaultModuleConfig.sectionDetailName = sectionDetailName;
			moduleDesignData.module[code] = defaultModuleConfig;
			SectionDesignDataModule.addEntity("SysModuleEntity", {
				Id: defaultModuleConfig.sysModuleEntityId,
				SysEntitySchemaUId: entity.uId
			});
			SectionDesignDataModule.addEntity("SysDetail", {
				Id: defaultModuleConfig.sectionDetailId,
				EntitySchemaUId: entity.uId,
				DetailSchemaUId: detailSchemaUId,
				Caption: caption
			});
			var editPageConfig = {
				pageName: codeWithPrefix + "Page",
				pageCaption: caption,
				pageSchemaCaption: Ext.String.format(localizableStrings.SectionEditPage, caption),
				sectionCode: code
			};
			var page = createEditPage(moduleDesignData, editPageConfig);
			defaultModuleConfig.pages.push(page);
			SectionDesignDataModule.addEntity("SysModule", {
				Id: defaultModuleConfig.id,
				Caption: caption,
				SysModuleEntity: defaultModuleConfig.sysModuleEntityId,
				FolderMode: SectionDesignerEnums.ModuleFolderType.MultiFolderEntry,
				GlobalSearchAvailable: true,
				HasAnalytics: true,
				HasActions: true,
				Code: code,
				ModuleHeader: defaultModuleConfig.header,
				CardSchemaUId: page.id,
				SectionModuleSchemaUId: SectionDesignerEnums.SectionSchemaIds.SectionModuleSchemaUId,
				SectionSchemaUId: sectionSchemaUId,
				CardModuleUId: SectionDesignerEnums.SectionSchemaIds.CardModuleUId,
				Image32: sectionIconId,
				Logo: sectionLogoId
			});
			SectionDesignDataModule.addEntity("SysModuleInSysModuleFolder", {
				SysModule: defaultModuleConfig.id,
				SysModuleFolder: SectionDesignerEnums.TempSysModuleFolderId,
				Position: 20
			});
			defaultModuleConfig.sysModuleCaptionLczId = addModuleLcz(caption,
				SectionDesignerEnums.SysModuleLczColumns.Caption, defaultModuleConfig.id);
			defaultModuleConfig.sysModuleHeaderLczId = addModuleLcz(defaultModuleConfig.header,
				SectionDesignerEnums.SysModuleLczColumns.Header, defaultModuleConfig.id);
			Ext.apply(moduleDesignData, getDefaultGridSettings(sectionSchemaName, false, moduleDesignData));
			return moduleDesignData;
		}

		/**
		 * Возвращает объект настройки реестра детали раздела
		 * @param {String} primaryDisplayColumnName Имя первичной для отображения колонки
		 * @param {String} typeColumnName имя колонки типа
		 * @return {Object} Возвращает объект настройки реестра детали раздела
		 * Пример:
		 *    {
		 *		{
		 *			operation: string,
		 *			name: string,
		 *			values: {
		 *				type: string,
		 *				listedConfig: {
		 *					name: string,
		 *					items: Array
		 *				},
		 *				tiledConfig: {
		 *					name: string,
		 *					grid: {
		 *						columns: number,
		 *						rows: number
		 *					},
		 *					items: Array
		 *				}
		 *			}
		 *		}
		 *	}
		 */
		function getDefaultDetailDiff(primaryDisplayColumnName, typeColumnName) {
			var isTyped = Boolean(typeColumnName);
			var tiledItems = [
				{
					name: primaryDisplayColumnName + "TiledGridColumn",
					bindTo: primaryDisplayColumnName,
					type: Terrasoft.GridCellType.TEXT,
					position: {
						row: 1,
						column: 0,
						colSpan: isTyped ? 16 : 24
					},
					captionConfig: {
						visible: false
					}
				}
			];
			var listedItems = [
				{
					name: primaryDisplayColumnName + "ListedGridColumn",
					bindTo: primaryDisplayColumnName,
					type: Terrasoft.GridCellType.TEXT,
					position: {
						column: 0,
						colSpan: isTyped ? 16 : 24
					}
				}
			];
			if (isTyped) {
				tiledItems.push({
					name: typeColumnName + "TiledGridColumn",
					bindTo: typeColumnName,
					type: Terrasoft.GridCellType.TEXT,
					position: {
						row: 1,
						column: 16,
						colSpan: 8
					},
					captionConfig: {
						visible: true
					}
				});
				listedItems.push({
					name: typeColumnName + "ListedGridColumn",
					bindTo: typeColumnName,
					type: Terrasoft.GridCellType.TEXT,
					position: {
						column: 16,
						colSpan: 8
					}
				});
			}
			return {
				"operation": "merge",
				"name": "DataGrid",
				"values": {
					type: "listed",
					listedConfig: {
						name: "DataGridListedConfig",
						items: listedItems
					},
					tiledConfig: {
						name: "DataGridTiledConfig",
						grid: {columns: 24, rows: 1},
						items: tiledItems
					}
				}
			};
		}

		/**
		 * Возвращает объект настройки грида раздела
		 * @param {String} sectionSchemaName название страницы раздела
		 * @param {Boolean} isTypedModule признак того, что раздел типизированный
		 * @param {Object} moduleDesignData объект данных дизайнера
		 * @return {Object} Возвращает объект настройки грида раздела
		 */
		function getDefaultGridSettings(sectionSchemaName, isTypedModule, moduleDesignData) {
			var moduleName = moduleDesignData.mainModuleName;
			var moduleData = moduleDesignData.module[moduleName];
			var entityName = moduleData.entityName;
			var typeColumnId = moduleData.typeColumnId;
			var entityDesignData = moduleDesignData.schemaManager.entity[entityName].metaInfo.modifiedData;
			var primaryDisplayColumnName = entityDesignData.primaryDisplayColumnName;
			var typeColumnName;
			if (!Ext.isEmpty(typeColumnId) && !Terrasoft.isEmptyGUID(typeColumnId)) {
				Terrasoft.each(entityDesignData.columns, function(column, key) {
					if (key === typeColumnId) {
						typeColumnName = column.name;
						return;
					}
				});
			}
			typeColumnName = typeColumnName || "";
			var gridSettingsKey = Ext.String.format("{0}GridSettingsGridDataView", sectionSchemaName);
			var simpleModuleGridSettingConfig = {
				"tiledConfig": "{\"grid\":{\"rows\":1,\"columns\":24},\"items\":[{\"bindTo\":\"" +
				primaryDisplayColumnName + "\",\"caption\":\"" + localizableStrings.PrimaryDisplayColumnCaption +
				"\",\"position\":{\"column\":0," +
				"\"colSpan\":24,\"row\":1},\"dataValueType\":1,\"captionConfig\":{\"visible\":false}}]}",
				"listedConfig": "{\"items\":[{\"bindTo\":\"" + primaryDisplayColumnName + "\",\"caption\":" +
				"\"" + localizableStrings.PrimaryDisplayColumnCaption +
				"\",\"position\":{\"column\":0,\"colSpan\":24,\"row\":1},\"dataValueType\":1}]}",
				"isTiled": true,
				"type": "tiled"
			};
			var typedModuleGridSettingsConfig = {
				"tiledConfig": "{\"grid\":{\"rows\":1,\"columns\":24},\"items\":[{\"bindTo\":\"" +
				primaryDisplayColumnName + "\",\"caption\":\"" + localizableStrings.PrimaryDisplayColumnCaption +
				"\",\"position\":{\"column\":0," +
				"\"colSpan\":16,\"row\":1},\"dataValueType\":1,\"captionConfig\":{\"visible\":false}}," +
				"{\"bindTo\":\"" + typeColumnName + "\",\"caption\":\"" + localizableStrings.TypeColumnCaption +
				"\",\"position\":{\"column\":16," +
				"\"colSpan\":8,\"row\":1},\"captionConfig\":{\"visible\":true}}]}",
				"listedConfig": "{\"items\":[{\"bindTo\":\"" + primaryDisplayColumnName + "\",\"caption\":\"" +
				localizableStrings.PrimaryDisplayColumnCaption + "\"" +
				",\"position\":{\"column\":0,\"colSpan\":16,\"row\":1},\"dataValueType\":1},{\"bindTo\":\"" +
				typeColumnName + "\",\"caption\":\"" + localizableStrings.TypeColumnCaption +
				"\",\"position\":{\"column\":16,\"colSpan\":8,\"row\":1}}]}",
				"isTiled": true,
				"type": "tiled"
			};
			var typedModuleVerticalGridSettingsConfig = {
				"tiledConfig": "{\"grid\":{\"rows\":2,\"columns\":24},\"items\":[{\"bindTo\":\"" +
				primaryDisplayColumnName + "\",\"caption\":\"" + localizableStrings.PrimaryDisplayColumnCaption +
				"\",\"position\":{\"column\":0," +
				"\"colSpan\":24,\"row\":1},\"dataValueType\":1,\"captionConfig\":{\"visible\":false}}," +
				"{\"bindTo\":\"" + typeColumnName + "\",\"caption\":\"" + localizableStrings.TypeColumnCaption +
				"\",\"position\":{\"column\":0," +
				"\"colSpan\":24,\"row\":2},\"captionConfig\":{\"visible\":true}}]}",
				"listedConfig": "{\"items\":[{\"bindTo\":\"" + primaryDisplayColumnName + "\",\"caption\":" +
				"\"" + localizableStrings.PrimaryDisplayColumnCaption +
				"\",\"position\":{\"column\":0,\"colSpan\":16,\"row\":1},\"dataValueType\":1}," +
				"{\"bindTo\":\"" + typeColumnName + "\",\"caption\":\"" + localizableStrings.TypeColumnCaption +
				"\",\"position\":{\"column\":16," +
				"\"colSpan\":8,\"row\":1}}]}",
				"isTiled": true,
				"type": "tiled"
			};
			var typedModuleMobileGridSettingsConfig = {
				"listedConfig": "{\"items\":[{\"bindTo\":\"" + primaryDisplayColumnName + "\",\"caption\":" +
				"\"" + localizableStrings.PrimaryDisplayColumnCaption +
				"\",\"position\":{\"column\":0,\"colSpan\":16,\"row\":1},\"dataValueType\":1}," +
				"{\"bindTo\":\"" + typeColumnName + "\",\"caption\":\"" + localizableStrings.TypeColumnCaption +
				"\",\"position\":{\"column\":16," +
				"\"colSpan\":8,\"row\":1}}]}",
				"isTiled": false,
				"type": "listed"
			};
			var gridSettingsConfig = (isTypedModule) ? typedModuleGridSettingsConfig : simpleModuleGridSettingConfig;
			var verticalGridSettingsConfig = (isTypedModule)
				? typedModuleVerticalGridSettingsConfig
				: simpleModuleGridSettingConfig;
			var defaultGridSettingsTemplate = {
				gridSettings: {
					"modifiedData": {
						"key": gridSettingsKey,
						"isTiled": true,
						"tiledColumnsConfig": "{}",
						"listedColumnsConfig": "{}",
						"DataGrid": gridSettingsConfig,
						"DataGridVerticalProfile": verticalGridSettingsConfig,
						"MobileDataGrid": typedModuleMobileGridSettingsConfig
					},
					"originalData": {
						"key": gridSettingsKey,
						"isTiled": true
					}
				}
			};
			return defaultGridSettingsTemplate;
		}

		/**
		 * Устанавливает первичную колонку для отображения странице редактирования нового раздела
		 * @param {Object} designData - данные дизайнера
		 * @param {String} sectionCode - код раздела
		 * @param {Object} entityPage - страница
		 */
		function setEntityPrimaryDisplayColumn(designData, sectionCode, entityPage) {
			var entitySchema = designData.schemaManager.entity[sectionCode];
			var primaryDisplayColumnName = entitySchema.metaInfo.modifiedData.primaryDisplayColumnName ||
				entitySchema.schema.primaryDisplayColumnName;
			var primaryDisplayColumnConfig = {
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"name": primaryDisplayColumnName,
				"values": {
					"layout": {"column": 0, "row": 0, "colSpan": 24}
				}
			};
			if (!Ext.isArray(entityPage.schema.diff)) {
				entityPage.schema.diff = [primaryDisplayColumnConfig];
			} else {
				entityPage.schema.diff.push(primaryDisplayColumnConfig);
			}
		}

		/**
		 * Устанавливает новому созданному разделу закладку "Основная информация"
		 * @param {Object} entityPage - страница
		 */
		function setDefaultEditPageTab(entityPage, newClientUnitSchema) {
			var defaultTabConfig = {
				"operation": "insert",
				"name": "GeneralInfoTab",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 0,
				"values": {
					"caption": {"bindTo": "Resources.Strings.GeneralInfoTabCaption"},
					"items": []
				}
			};
			if (!Ext.isArray(entityPage.schema.diff)) {
				entityPage.schema.diff = [defaultTabConfig];
			} else {
				entityPage.schema.diff.push(defaultTabConfig);
			}
			var modifiedResource = {
				localizableStrings: {
					GeneralInfoTabCaption: localizableStrings.GeneralInfoTabCaption
				}
			};
			Ext.merge(newClientUnitSchema.resources.metaInfo.modifiedData, modifiedResource);
		}

		/**
		 * Создает клиентскую схему для страницы редактирования и возвращает конфигурацию страницы редактирования
		 * @param {Object} designData данные дизайнера
		 * @param {object} config конфигурация для новой страницы
		 * @param {String} config.pageName имя страницы
		 * @param {String} config.pageSchemaCaption заголовок схемы страницы
		 * @param {String} config.sectionCode код раздела
		 * @param {String} config.typeColumnValue идентификатор колонки типа
		 * @param {String} config.pageCaption заголовок страницы
		 * @param {String} config.actionCaption заголовок действия для страницы
		 * @returns {Object} конфигурация страницы
		 * @returns {GUID} returns.id уникальный иденитификатор схемы страницы
		 * @returns {String} returns.name имя станицы
		 * @returns {GUID} returns.typeColumnValue идентификатор типа записи
		 * @returns {String} returns.moduleCode код раздела
		 * @returns {GUID} returns.recordId идентификатор записи в таблице SysModuleEdit
		 */
		function createEditPage(designData, config) {
			var position = config.position || 0;
			var sectionCode = config.sectionCode;
			var pageConfig = {
				name: config.pageName,
				caption: config.pageSchemaCaption,
				code: sectionCode,
				type: Terrasoft.SchemaType.EDIT_VIEW_MODEL_SCHEMA,
				parentSchemaUId: SectionDesignerEnums.BaseSchemeUIds.BASE_PAGE,
				parentSchemaName: SectionDesignerEnums.BaseClientUnitSchemeNames.BASE_PAGE_NAME
			};
			var entityPage = createClientUnitSchema(pageConfig);
			var pageSchemaUId = entityPage.structure.schemaUId;
			var pageSchemaName = entityPage.structure.schemaName;
			var newClientUnitSchema = designData.schemaManager.clientUnit[pageSchemaName] =
				getNewClientUnitSchemaDesignData(entityPage);
			setEntityPrimaryDisplayColumn(designData, sectionCode, entityPage);
			setDefaultEditPageTab(entityPage, newClientUnitSchema);
			var module = designData.module[designData.mainModuleName];
			var page = {
				id: pageSchemaUId,
				name: pageSchemaName,
				typeColumnValue: (isEmptyOrEmptyGUID(config.typeColumnValue)) ? null : config.typeColumnValue,
				moduleCode: config.sectionCode,
				recordId: Terrasoft.generateGUID(),
				position: position
			};
			var actionCaption;
			var pageCaption;
			if (page.typeColumnValue) {
				actionCaption = config.actionCaption;
				pageCaption = config.pageCaption;
			} else {
				actionCaption = localizableStrings.AddRecord;
				pageCaption = config.pageSchemaCaption;
			}
			page.pageCaption = pageCaption;
			SectionDesignDataModule.addEntity("SysModuleEdit", {
				Id: page.recordId,
				SysModuleEntity: module.sysModuleEntityId,
				TypeColumnValue: page.typeColumnValue,
				UseModuleDetails: true,
				CardSchemaUId: page.id,
				ActionKindCaption: config.actionCaption,
				PageCaption: config.pageCaption,
				ActionKindName: config.pageName,
				Position: position
			});
			var newActionKindId = addModuleEditLcz(actionCaption,
				SectionDesignerEnums.SysModuleEditLczColumns.ActionKindCaption, page.recordId);
			var newPageCaptionId = addModuleEditLcz(pageCaption,
				SectionDesignerEnums.SysModuleEditLczColumns.PageCaption, page.recordId);
			if (newActionKindId) {
				page.actionKindCaptionLczId = newActionKindId;
			}
			if (newPageCaptionId) {
				page.pageCaptionLczId = newPageCaptionId;
			}
			return page;
		}

		/**
		 * Добавляет запись в таблицу локализации для страниц редактирования
		 * @param {String} value локализованное значение
		 * @param {GUID} columnId идентификатор локализируемой колонки
		 * @param {GUID} pageId идентификатор страницы редактирования
		 * @returns {GUID} Идентификатор добавленной записи
		 */
		function addModuleEditLcz(value, columnId, pageId) {
			var newRecordId;
			newRecordId = Terrasoft.generateGUID();
			SectionDesignDataModule.addEntity("SysModuleEditLcz", {
				Id: newRecordId,
				ColumnUId: columnId,
				Record: pageId,
				SysCulture: Terrasoft.Resources.CultureSettings.currentCultureId,
				Value: value
			});
			return newRecordId;
		}

		/**
		 * Добавляет запись в таблицу локализации для раздела
		 * @param {String} value локализованное значение
		 * @param {GUID} columnId идентификатор локализируемой колонки
		 * @param {GUID} sectionId идентификатор страницы редактирования
		 * @returns {GUID} Идентификатор добавленной записи
		 */
		function addModuleLcz(value, columnId, sectionId) {
			var newRecordId;
			newRecordId = Terrasoft.generateGUID();
			SectionDesignDataModule.addEntity("SysModuleLcz", {
				Id: newRecordId,
				ColumnUId: columnId,
				Record: sectionId,
				SysCulture: Terrasoft.Resources.CultureSettings.currentCultureId,
				Value: value
			});
			return newRecordId;
		}

		/**
		 * Возвращает конфигурацию дизайн данных для клиентской схемы
		 * @param {Object} clientUnit клиентская схема
		 * @returns {Object} конфигурация клиентской схемы
		 * @returns {Object} returns.metaInfo мета информация схемы
		 * @returns {ModificationType} returns.metaInfo.modificationType тип модификации
		 * @returns {Object} returns.metaInfo.modifiedData модифицированные данные
		 * @returns {Object} returns.schema схема модуля
		 */
		function getNewClientUnitSchemaDesignData(clientUnit) {
			return {
				resources: getClientUnitSchemaDesignDataBlock(clientUnit.resources,
					SectionDesignerEnums.ModificationType.NEW),
				structure: getClientUnitSchemaDesignDataBlock(clientUnit.structure,
					SectionDesignerEnums.ModificationType.NEW),
				schema: getClientUnitSchemaDesignDataBlock(clientUnit.schema,
					SectionDesignerEnums.ModificationType.NEW)
			};
		}

		/**
		 * Возвращает блок данных дизайнера для клиентской схемы
		 * @param {Object} schemaBlock блок клиентской схемы
		 * @param {SectionDesignerEnums.ModificationType} modificationType тип модификации
		 * @returns {Object} блок данных дизайнера
		 */
		function getClientUnitSchemaDesignDataBlock(schemaBlock, modificationType) {
			return {
				metaInfo: {
					modificationType: modificationType,
					modifiedData: {}
				},
				originData: schemaBlock
			};
		}

		/**
		 * Возвращет информацию структуры раздела
		 * @param {Object} config объект параметров:
		 * @param {String} config.moduleCode код раздела
		 * @param {Function} config.callback функция обратного вызова
		 * @param {Object} config.scope контекст выполнения функциии обратного вызова
		 */
		function getModuleInfo(config) {
			var moduleCode, callback, scope;
			moduleCode = config.moduleCode;
			callback = config.callback;
			scope = config.scope || this;
			var moduleStructure = this.modulesStructure[moduleCode];
			if (moduleStructure) {
				callback.call(scope, moduleStructure);
			} else {
				postServiceRequest({
					methodName: "GetModuleStructureInfo",
					parameters: {
						ModuleCode: moduleCode
					},
					scope: this,
					callback: function(request, success, response) {
						var existingModuleConfig = null;
						if (success) {
							var responseObject = Terrasoft.decode(response.responseText);
							if (responseObject.GetModuleStructureInfoResult) {
								existingModuleConfig = Terrasoft.decode(responseObject.GetModuleStructureInfoResult);
								var clientUnitSchemaNames = getSectionSchemaNames(existingModuleConfig, {
									clientUnitSchemaNameOnly: true
								});
								validateClientUnitScheme(clientUnitSchemaNames, function() {
									var sectionSchemaNames = getSectionSchemaNames(existingModuleConfig);
									tryLockSectionScheme(sectionSchemaNames, function() {
										callback.call(scope, existingModuleConfig);
									}, this);
								}, this);
								return;
							}
						}
						callback.call(scope, existingModuleConfig);
					}
				});
			}
		}

		/**
		 * Возвращет информацию структуры раздела
		 * @param {String[]} sectionSchemaNames Массив имен схем раздела
		 * @param {Function} callback Функция обратного вызова
		 * @param {Object} scope Контекст выполнения функции обратного вызова
		 */
		function tryLockSectionScheme(sectionSchemaNames, callback, scope) {
			var maskId = Terrasoft.Mask.show();
			var packageUId = storage.getItem("SectionDesigner_CurrentPackageUId");
			postServiceRequest({
				methodName: "LockPackageElements",
				parameters: {
					schemaNames: sectionSchemaNames,
					packageUId: packageUId
				},
				scope: this,
				callback: function(request, success, response) {
					if (success) {
						var responseObject = Terrasoft.decode(response.responseText);
						var result = responseObject.LockPackageElementsResult;
						if (!result.Success) {
							var showMessage = result.ErrorMessage;
							var errorMessages = result.ErrorMessages;
							var userScheme = {};
							if (errorMessages && errorMessages.length > 0) {
								Terrasoft.each(errorMessages, function(item) {
									var userName = item.Value;
									userScheme[userName] = userScheme[userName] || [];
									userScheme[userName].push(item.Key);
								}, this);
								var userSchemaString = "\n";
								Terrasoft.each(userScheme, function(schemaNames, userName) {
									userSchemaString += Ext.String.format(" - {0}: {1};\n", userName,
										schemaNames.join(", "));
								}, this);
								showMessage = Ext.String.format(localizableStrings.LockSchemeError, userSchemaString);
							}
							Terrasoft.Mask.hide(maskId);
							Terrasoft.utils.showMessage({
								caption: showMessage,
								buttons: ["ok"],
								defaultButton: 0,
								style: Terrasoft.MessageBoxStyles.BLUE,
								handler: function() {
									Terrasoft.DomainCache.setItem("SectionDesigner_DetailsInfo", null);
									Terrasoft.DomainCache.setItem("DetailsInfo", null);
									window.close();
								}
							});
						} else {
							callback.call(scope);
						}
					}
				}
			});
		}

		/**
		 * Выполняет валидацию клиентских схем раздела.
		 * @param {String[]} clientUnitSchemaNames Массив имен клиентских схем раздела.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст выполнения функции обратного вызова.
		 */
		function validateClientUnitScheme(clientUnitSchemaNames, callback, scope) {
			var maskId = Terrasoft.Mask.show();
			postServiceRequest({
				methodName: "ValidateClientUnitSchemes",
				parameters: {
					schemaNames: clientUnitSchemaNames
				},
				scope: this,
				callback: function(request, success, response) {
					Terrasoft.Mask.hide(maskId);
					if (success) {
						var responseObject = Terrasoft.decode(response.responseText);
						var result = responseObject.ValidateClientUnitSchemesResult;
						if (result.Success) {
							callback.call(scope);
						} else {
							var errorMessage = result.ErrorMessages.map(function(item) {
								return item.Key + " - " + item.Value;
							});
							var errorText = localizableStrings.InvalidSchemasMessage + ":\n\n" +
								errorMessage.join(";\n");
							Terrasoft.utils.showMessage({
								caption: errorText,
								buttons: ["ok"],
								defaultButton: 0,
								style: Terrasoft.MessageBoxStyles.BLUE,
								handler: function() {
									Terrasoft.DomainCache.setItem("SectionDesigner_DetailsInfo", null);
									Terrasoft.DomainCache.setItem("DetailsInfo", null);
									window.close();
								}
							});
						}
					}
				}
			});
		}

		/**
		 * Возвращет массив имен схем раздела
		 * @private
		 * @param {Object} moduleConfig Объект конфига раздела
		 * @param {Object} config Объект дополнительных параметров метода
		 * @param {Boolean} config.clientUnitSchemaNameOnly Возвращать имена только клиентских схем
		 * @param {Boolean} config.entitySchemaNameOnly Возвращать имена только entity схем
		 * return {String[]} Возвращет массив имен схем раздела
		 */
		function getSectionSchemaNames(moduleConfig, config) {
			config = config || {};
			var schemaNameProperties = [];
			var clientUnitSchemaPropertyNames = ["sectionDetailName", "sectionSchemaName"];
			var entitySchemaPropertyNames = ["entityTagName", "entityInTagName", "entityFolderName",
				"entityInFolderName", "entityName"];
			if (config.clientUnitSchemaNameOnly) {
				schemaNameProperties = clientUnitSchemaPropertyNames;
			} else if (config.entitySchemaNameOnly) {
				schemaNameProperties = entitySchemaPropertyNames;
			} else {
				schemaNameProperties = Ext.Array.merge(entitySchemaPropertyNames, clientUnitSchemaPropertyNames);
			}
			var propertyValuesArray = Terrasoft.getPropertyValuesArray(schemaNameProperties, moduleConfig);
			var moduleScheme = Terrasoft.deleteEmptyItems(propertyValuesArray);
			var pages = moduleConfig.pages;
			Terrasoft.each(pages, function(pageConfig) {
				Ext.Array.include(moduleScheme, pageConfig.name);
			}, this);
			return moduleScheme;
		}

		/**
		 * Возвращает информацию о схеме
		 * @param {Object} config объект параметров:
		 * @param {String} config.schemaId идентификатор схемы
		 * @param {String} config.schemaName название схемы
		 * @param {Boolean} config.isClientUnit признак того, что схема является клиентским модулем
		 * @param {Function} config.callback функция обратного вызова
		 * @param {Object} config.scope контекст выполнения функциии обратного вызова
		 */
		function getSchemaInfo(config) {
			var serviceParameterValue, scope, callback, isClientUnit;
			scope = config.scope || this;
			callback = config.callback;
			isClientUnit = config.isClientUnit;
			var webServiceGetMethodPrefix = (!isClientUnit) ? "GetEntitySchemaInfoBy" : "GetClientUnitSchemaInfoBy";
			var serviceMethodName;
			if (config.schemaId) {
				serviceMethodName = webServiceGetMethodPrefix + "Id";
				serviceParameterValue = config.schemaId;
			} else if (config.schemaName) {
				serviceMethodName = webServiceGetMethodPrefix + "Name";
				serviceParameterValue = config.schemaName;
			}
			postServiceRequest({
				methodName: serviceMethodName,
				parameters: {
					schema: serviceParameterValue
				},
				scope: this,
				callback: function(request, success, response) {
					var schemaInfo = null;
					if (success) {
						var responseObject = Terrasoft.decode(response.responseText);
						if (responseObject[serviceMethodName + "Result"]) {
							schemaInfo = Terrasoft.decode(responseObject[serviceMethodName + "Result"]);
						}
					}
					callback.call(scope, schemaInfo);
				}
			});
		}

		/**
		 * Функция создания колонки типов страниц раздела в объект раздела
		 * @private
		 * @param {Function} callback функция обратного вызова
		 */
		function createEntityTypeColumn(callback) {
			var result = {
				module: {},
				schemaManager: {
					entity: {}
				},
				needCreateTypeColumn: false
			};
			var mainModuleName = result.mainModuleName = SectionDesignDataModule.getMainModuleName();
			var moduleStructure = SectionDesignDataModule.getModuleStructure(mainModuleName);
			var entityName = moduleStructure.entityName;
			var mainModule = result.module[mainModuleName] = {
				entityName: entityName
			};
			var entitySchemaManager = result.schemaManager.entity;
			var entity;
			var sectionSchemaName = moduleStructure.sectionSchemaName;
			SectionDesignDataModule.getEntitySchemaByName({
				name: entityName,
				callback: function(entitySchema) {
					entity = entitySchema;
					var entityType = createEntitySchema({
						name: entityName + "Type",
						caption: Ext.String.format(localizableStrings.EntityType, entity.caption),
						rootEntitySchema: Terrasoft.BaseLookup
					});
					var entityTypeReferenceColumn = createEntitySchemaReferenceColumn(entityType, {
						name: schemaNamePrefix + "Type",
						caption: localizableStrings.TypeColumnCaption
					});
					entitySchemaManager[entityType.name] = getEntitySchemaDesignData(entityType, []);
					mainModule.typeColumnId = entityTypeReferenceColumn.uId;
					mainModule.typeColumnName = entityTypeReferenceColumn.value;
					entitySchemaManager[entityName] = getEntitySchemaDesignData(entity, [{
						column: entityTypeReferenceColumn
					}]);
					Ext.apply(result, getDefaultGridSettings(sectionSchemaName, true, result));
					var detailDiff = getDefaultDetailDiff(entity.primaryDisplayColumnName,
						entityTypeReferenceColumn.name);
					SectionDesignDataModule.modifyClientUnitSchema(moduleStructure.sectionDetailName, {
						diff: [detailDiff]
					});
					SectionDesignDataModule.setDesignData(result);
					if (callback) {
						callback(entityTypeReferenceColumn);
					}
				}
			});
		}

		/**
		 * Устанавливает новый заголовок раздела. Производит все необходимые модификации в связанных объектах и
		 * клиентских схемах
		 * @param {String} caption заголовок
		 * @param {Function} callback функция обратного вызова
		 * @param {Object} scope контекст для функции обратного вызова
		 */
		function setSectionCaption(caption, callback, scope) {
			SectionDesignDataModule.getDesignData(function(data) {
				var sectionData = data.module[data.mainModuleName];
				var header = Ext.String.format(localizableStrings.ModuleHeaderTemplate, caption);
				var editPages = sectionData.pages;
				var modifiedSectionData = {
					caption: caption,
					header: header,
					pages: editPages
				};
				SectionDesignDataModule.modifyEntitySchemaDesignData(
					data.mainModuleName,
					null,
					{caption: caption}
				);
				SectionDesignDataModule.modifyEntitySchemaDesignData(
					data.mainModuleName + "File",
					null,
					{caption: Ext.String.format(localizableStrings.EntityFile, caption)}
				);
				SectionDesignDataModule.modifyEntitySchemaDesignData(
					data.mainModuleName + "Tag",
					null,
					{caption: Ext.String.format(localizableStrings.EntityTagCaption, caption)}
				);
				SectionDesignDataModule.modifyEntitySchemaDesignData(
					data.mainModuleName + "InTag",
					null,
					{caption: Ext.String.format(localizableStrings.EntityInTagCaption, caption)}
				);
				SectionDesignDataModule.modifyEntitySchemaDesignData(
					data.mainModuleName + "Folder",
					null,
					{caption: Ext.String.format(localizableStrings.EntityFolder, caption)}
				);
				SectionDesignDataModule.modifyEntitySchemaDesignData(
					data.mainModuleName + "InFolder",
					null,
					{caption: Ext.String.format(localizableStrings.EntityInFolderCaption, caption)}
				);
				SectionDesignDataModule.modifyClientUnitStructure(sectionData.sectionSchemaName,
					{schemaCaption: Ext.String.format(localizableStrings.SectionPage, caption)}
				);
				if (sectionData.sectionDetailName) {
					SectionDesignDataModule.modifyClientUnitStructure(sectionData.sectionDetailName,
						{schemaCaption: Ext.String.format(localizableStrings.SectionDetail, caption)}
					);
					SectionDesignDataModule.modifyClientUnitResources(sectionData.sectionDetailName,
						{localizableStrings: {Caption: caption}}
					);
				}
				SectionDesignDataModule.modifyEntity("SysModule", {
					Caption: caption,
					ModuleHeader: header
				}, sectionData.id);
				SectionDesignDataModule.modifyEntity("SysModuleLcz", {
					Value: caption
				}, sectionData.sysModuleCaptionLczId);
				SectionDesignDataModule.modifyEntity("SysModuleLcz", {
					Value: header
				}, sectionData.sysModuleHeaderLczId);
				SectionDesignDataModule.modifyEntity("SysDetail", {
					Caption: caption
				}, sectionData.sectionDetailId);
				if (!isEmptyOrEmptyGUID(sectionData.typeColumnId)) {
					SectionDesignDataModule.getEntitySchemaByName({
						name: data.mainModuleName,
						callback: function(entitySchema) {
							var typeColumn;
							var columns = entitySchema.columns;
							Terrasoft.each(columns, function(column) {
								if (column.uId === sectionData.typeColumnId) {
									typeColumn = column;
									return false;
								}
							});
							SectionDesignDataModule.modifyEntitySchemaDesignData(
								typeColumn.referenceSchemaName,
								null,
								{caption: Ext.String.format(localizableStrings.EntityType, caption)}
							);
							SectionDesignDataModule.getEntities(typeColumn.referenceSchemaName, ["Name"], false,
								function(entitySchemaData) {
									var currentEditPage;
									Terrasoft.each(entitySchemaData, function(item) {
										currentEditPage = null;
										for (var i = 0, length = editPages.length; i < length; i++) {
											var editPage = editPages[i];
											if (editPage.typeColumnValue === item.Id) {
												currentEditPage = editPage;
												break;
											}
										}
										if (currentEditPage) {
											modifyTypedEditPage(caption, currentEditPage, item.Name, item.Id,
												currentEditPage.position);
										}
									});
									setSectionDesignData(data.mainModuleName, modifiedSectionData);
									callback.call(scope || this);
								}
							);
						}
					});
				} else {
					modifyEditPage(editPages[0], caption);
					setSectionDesignData(data.mainModuleName, modifiedSectionData);
					callback.call(scope || this);
				}
			});
		}

		/**
		 * Устанавливает новое рабочее место раздела
		 * @param {String} workplaceId уникальный идентификатор рабочего места раздела
		 */
		function setSectionWorkplace(workplaceId) {
			SectionDesignDataModule.setDesignData({
				workplaceId: workplaceId
			});
		}

		/**
		 * Устанавливает новую иконку раздела
		 * @param {String} sectionIconId уникальный идентификатор иконки раздела
		 * @param {Function} callback функция обратного вызова
		 * @param {Object} scope контекст для функции обратного вызова
		 */
		function setSectionIcon(sectionIconId, callback, scope) {
			SectionDesignDataModule.getDesignData(function(data) {
				var sectionData = data.module[data.mainModuleName];
				setSectionDesignData(data.mainModuleName, {
					sectionIconId: sectionIconId
				});
				SectionDesignDataModule.modifyEntity("SysModule", {Image32: sectionIconId}, sectionData.id);
				callback.call(scope || this);
			});
		}

		/**
		 * Устанавливает новую иконку раздела
		 * @param {String} sectionLogoId уникальный идентификатор иконки раздела
		 * @param {Function} callback функция обратного вызова
		 * @param {Object} scope контекст для функции обратного вызова
		 */
		function setSectionLogo(sectionLogoId, callback, scope) {
			SectionDesignDataModule.getDesignData(function(data) {
				var sectionData = data.module[data.mainModuleName];
				setSectionDesignData(data.mainModuleName, {
					sectionLogoId: sectionLogoId
				});
				SectionDesignDataModule.modifyEntity("SysModule", {Logo: sectionLogoId}, sectionData.id);
				callback.call(scope || this);
			});
		}

		/**
		 * Устанавливает новые данные раздела
		 * @param {String} sectionCode код раздела
		 * @param {Object} modifiedSectionData данные
		 */
		function setSectionDesignData(sectionCode, modifiedSectionData) {
			var newData = {
				module: {}
			};
			newData.module[sectionCode] = modifiedSectionData;
			SectionDesignDataModule.setDesignData(newData);
		}

		/**
		 * Удаляет страницу редактирования, соответствующую ей клинтскую схему и запись в справочнике типов
		 * @param {Object} designData данные дизайнера
		 * @param {GUID} typeId идентификатор типа записи
		 */
		function removeEditPage(designData, typeId) {
			var sectionData = designData.module[designData.mainModuleName];
			var editPages = sectionData.pages;
			var currentEditPage;
			for (var i = 0, length = editPages.length; i < length; i++) {
				var editPage = editPages[i];
				if (editPage.typeColumnValue === typeId) {
					editPages.splice(i, 1);
					currentEditPage = editPage;
					break;
				}
			}
			if (currentEditPage.typeColumnSchemaName) {
				SectionDesignDataModule.revertEntityChanges(currentEditPage.typeColumnSchemaName, [typeId]);
				SectionDesignDataModule.deleteEntity("SysModuleEditLcz",
					currentEditPage.actionKindCaptionLczId);
				SectionDesignDataModule.deleteEntity("SysModuleEditLcz",
					currentEditPage.pageCaptionLczId);
			}
			SectionDesignDataModule.deleteEntity("SysModuleEdit", currentEditPage.recordId);
			SectionDesignDataModule.deleteClientUnitSchema(currentEditPage.name);
			delete designData.schemaManager.clientUnit[currentEditPage.name];
		}

		/**
		 * Очищает набор страниц редактирования раздела. Удаляет информацию о клиентских схемах дизайнера и отменяет
		 * изменения в справочнике типов запиисей
		 * @param {Object} designData данные дизайнера
		 */
		function clearEditPages(designData) {
			var sectionData = designData.module[designData.mainModuleName];
			var editPages = sectionData.pages;
			var typesForDelete = [];
			var sysModuleEditRecords = [];
			var sysModuleEditLczRecords = [];
			Terrasoft.each(editPages, function(page) {
				typesForDelete.push(page.typeColumnValue);
				sysModuleEditRecords.push(page.recordId);
				sysModuleEditLczRecords.push(page.actionKindCaptionLczId);
				sysModuleEditLczRecords.push(page.pageCaptionLczId);
			});
			Terrasoft.each(typesForDelete, function(typeId) {
				removeEditPage(designData, typeId);
			});
			Terrasoft.each(sysModuleEditRecords, function(sysModuleEditId) {
				SectionDesignDataModule.deleteEntity("SysModuleEdit", sysModuleEditId);
			}, this);
			Terrasoft.each(sysModuleEditLczRecords, function(sysModuleEditLczId) {
				SectionDesignDataModule.deleteEntity("SysModuleEditLcz", sysModuleEditLczId);
			}, this);
		}

		/**
		 * Преобразует раздел в одностраничный вид. Отмееняет изменения по существующим страницам редактирования для
		 * типов и создает новую схему для страницы редактирования
		 * @param {Object} designData
		 * @param {Function} callback
		 */
		function convertIntoSinglePageSection(designData, callback) {
			changeSectionTypeColumn(designData);
			var code = designData.mainModuleName;
			var codeWithPrefix = designData.mainModuleName;
			if (!validateNamePrefix(codeWithPrefix)) {
				codeWithPrefix = getSchemaNamePrefix() + codeWithPrefix;
			}
			var sectionData = designData.module[code];
			getSectionLikeSchemaNames(designData, function(names) {
				var pageNameTpl = codeWithPrefix + "{0}Page";
				var pageName = Ext.String.format(pageNameTpl, "");
				var i = 0;
				var schemaManager = designData.schemaManager;
				var clientUnitManager = schemaManager.clientUnit;
				var entityManager = schemaManager.entity;
				while (names.indexOf(pageName) !== -1 || clientUnitManager[pageName] || entityManager[pageName]) {
					pageName = Ext.String.format(pageNameTpl, ++i);
				}
				var page = createEditPage(designData, {
					pageName: pageName,
					pageCaption: sectionData.caption,
					pageSchemaCaption: Ext.String.format(localizableStrings.SectionEditPage,
						sectionData.caption),
					sectionCode: code
				});
				SectionDesignDataModule.modifyEntity("SysModule", {
					CardSchemaUId: page.id
				}, sectionData.id);
				sectionData.pages.push(page);
				if (callback) {
					callback(designData);
				}
			});
		}

		/**
		 * Изменяет колонку типа для раздела. При этом происходит очиста страниц редактирования для раздела
		 * @param {Object} designData данные дизайнера
		 * @param {Object} column новая колонка типа
		 */
		function changeSectionTypeColumn(designData, column) {
			clearEditPages(designData);
			var sectionData = designData.module[designData.mainModuleName];
			sectionData.typeColumnId = (column) ? column.uId : null;
			sectionData.typeColumnName = (column) ? column.value : null;
			SectionDesignDataModule.modifyEntity("SysModule", {
				Attribute: sectionData.typeColumnName
			}, sectionData.id);
			SectionDesignDataModule.modifyEntity("SysModuleEntity", {
				TypeColumnUId: sectionData.typeColumnId
			}, sectionData.sysModuleEntityId);
		}

		/**
		 * Возвращает префикс имени схемы
		 * @returns {String} префикс имен схем
		 */
		function getSchemaNamePrefix() {
			return schemaNamePrefix;
		}

		/**
		 * Осуществляет проверку наличия прав на запуск мастера создания разделов
		 * @param {Function} callback Функция обратного вызова
		 * @param {Object} scope Объект в контексте которого будет выполняться функция обратного вызова
		 * @return {Object} Результат проверки наличия прав на запуск мастера создания разделов
		 * @return {Boolean} return.canUseSectionDesigner Признак наличия прав на запуск мастера создания разделов
		 * @return {String} return.message Сообщение проверки
		 */
		function getCanUseSectionDesigner(callback, scope) {
			scope = scope || this;
			this.postServiceRequest({
				methodName: "GetCanUseSectionDesigner",
				parameters: null,
				callback: function(request, success, response) {
					var result = {
						canUseSectionDesigner: false,
						message: ""
					};
					if (success) {
						var responseObject = Terrasoft.decode(response.responseText);
						if (responseObject.GetCanUseSectionDesignerResult) {
							var responseResultObject = responseObject.GetCanUseSectionDesignerResult;
							result = {
								canUseSectionDesigner: responseResultObject.Success,
								message: responseResultObject.ErrorMessage
							};
						}
					}
					callback.call(scope, result);
				}
			});
		}

		/**
		 * Осуществляет проверку возможности изменения пакета
		 * @param {Function} callback Функция обратного вызова
		 * @param {Object} scope Объект в контексте которого будет выполняться функция обратного вызова
		 * @return {Object} Результат проверки возможности изменения пакета
		 * @return {Boolean} return.canEditPackage Признак возможности редактирования
		 * @return {String} return.message Сообщение проверки
		 */
		function getAvailablePackages(callback, scope) {
			scope = scope || this;
			postServiceRequest({
				methodName: "GetAvailablePackages",
				parameters: null,
				callback: function(request, success, response) {
					var result = {
						canEditPackage: false,
						currentPackageUId: Terrasoft.GUID_EMPTY,
						availablePackages: null,
						message: ""
					};
					if (success) {
						var responseObject = Terrasoft.decode(response.responseText);
						if (responseObject.GetAvailablePackagesResult) {
							var responseResultObject = responseObject.GetAvailablePackagesResult;
							result = {
								canEditPackage: responseResultObject.Success,
								message: responseResultObject.ErrorMessage,
								currentPackageUId: responseResultObject.CurrentPackageUId
							};
							if (responseResultObject.AvailablePackages) {
								var availablePackages = {};
								Terrasoft.each(responseResultObject.AvailablePackages, function(pack) {
									availablePackages[pack.Key] = {
										value: pack.Key,
										displayValue: pack.Value
									};
								});
								result.availablePackages = availablePackages;
							}
						}
					}
					callback.call(scope, result);
				}
			});
		}

		/**
		 * Осуществляет проверку возможности изменения пакета
		 * @param {Function} callback Функция обратного вызова
		 * @param {Object} scope Объект в контексте которого будет выполняться функция обратного вызова
		 * @return {Number} Максимальная длина названия схемы раздела
		 */
		function getMaxEntitySchemaNameLength(callback, scope) {
			scope = scope || this;
			postServiceRequest({
				methodName: "GetMaxEntitySchemaNameLength",
				parameters: null,
				callback: function(request, success, response) {
					if (success) {
						var responseObject = Terrasoft.decode(response.responseText);
						if (responseObject.GetMaxEntitySchemaNameLengthResult) {
							var result = responseObject.GetMaxEntitySchemaNameLengthResult;
							callback.call(scope, result);
						}
					}
				}
			});
		}

		/**
		 * Получает отображение для ModalBox'а выбора пакета
		 * @returns {Terrasoft.Container|*}
		 */
		function getSelectPackageModalBoxView() {
			return Ext.create("Terrasoft.Container", {
				id: "choose-current-package-container",
				selectors: {
					wrapEl: "#choose-current-package-container"
				},
				afterrender: {bindTo: "onAfterRender"},
				items: [{
					className: "Terrasoft.Label",
					caption: localizableStrings.PackageLabelCaption,
					classes: {
						labelClass: ["controlCaption", "t-label-is-required"]
					}
				}, {
					id: "currentPackage",
					className: "Terrasoft.ComboBoxEdit",
					value: {bindTo: "currentPackage"},
					list: {bindTo: "packagesList"},
					prepareList: {bindTo: "preparePackagesList"},
					markerValue: "currentPackage"
				}, {
					id: "okButton",
					className: "Terrasoft.Button",
					caption: Terrasoft.MessageBoxButtons.OK.caption,
					style: Terrasoft.controls.ButtonEnums.style.GREEN,
					tag: "okButton",
					selectors: {
						wrapEl: "#okButton"
					},
					markerValue: "okButton",
					click: {bindTo: "onOkButtonClick"}
				}, {
					className: "Terrasoft.Button",
					id: "cancelButton",
					selectors: {
						wrapEl: "#cancelButton"
					},
					caption: Terrasoft.MessageBoxButtons.CANCEL.caption,
					tag: "cancelButton",
					click: {bindTo: "onCancelButtonClick"}
				}]
			});
		}

		function getCurrentPackageUId(callback, scope) {
			getAvailablePackages(function(availablePackagesResult) {
				if (!availablePackagesResult.canEditPackage) {
					var message = availablePackagesResult.message ||
						localizableStrings.CanNotEditPackage;
					Terrasoft.utils.showMessage({
						caption: message,
						buttons: ["ok"],
						defaultButton: 0,
						style: Terrasoft.MessageBoxStyles.BLUE,
						handler: function() {
							callback.call(scope || this, false);
						}
					});
				} else {
					var currentPackageUId = availablePackagesResult.currentPackageUId;
					storage.setItem("SectionDesigner_CurrentPackageUId", currentPackageUId);
					if (isEmptyOrEmptyGUID(currentPackageUId)) {
						var viewModel = Ext.create("Terrasoft.BaseViewModel", {
							columns: {
								currentPackage: {
									dataValueType: Terrasoft.DataValueType.Enum,
									isRequired: true
								}
							},
							values: {
								currentPackage: null,
								packagesList: new Terrasoft.Collection()
							},
							methods: {
								onOkButtonClick: function() {
									if (this.validate()) {
										var pack = this.get("currentPackage");
										storage.setItem("SectionDesigner_CurrentPackageUId", pack.value);
										storage.setItem("SectionDesigner_CurrentPackageName", pack.displayValue);
										ModalBox.close();
										callback.call(scope || this, true);
									}
								},
								onCancelButtonClick: function() {
									ModalBox.close();
									callback.call(scope || this, false);
								},
								preparePackagesList: function(filter, list) {
									list.clear();
									list.loadAll(availablePackagesResult.availablePackages);
								},
								onAfterRender: function() {
									var viewWrapEl = view.getWrapEl();
									var parentWrapEl = viewWrapEl.parent(".ts-modalbox");
									var parentPadding = parentWrapEl.getBorderPadding();
									var height = viewWrapEl.getHeight() + parentPadding.beforeY + parentPadding.afterY;
									ModalBox.setSize(410, height);
								}
							}
						});
						var container = ModalBox.show({
							minHeight: 1,
							maxHeight: 100,
							minWidth: 1,
							maxWidth: 100
						});
						ModalBox.setSize(410, 100);
						var view = getSelectPackageModalBoxView();
						view.bind(viewModel);
						view.render(container);
					} else {
						var packages = availablePackagesResult.availablePackages;
						var currentPackage = packages[currentPackageUId];
						if (currentPackage) {
							storage.setItem("SectionDesigner_CurrentPackageName", currentPackage.displayValue);
						}
						callback.call(scope || this, true);
					}
				}
			});
		}

		function start(url, isNew) {
			Terrasoft.chain({}, [
				function(context) {
					getCurrentPackageUId(function(result) {
						if (result) {
							context.next();
						}
					});
				},
				function(context) {
					context.next();
					/*
					 TODO: #252193 UI: Механизм сохранения. Реализовать клиентскую часть функциональности
					 блокировки/разблокировки схем мастером
					 if (isNew) {
					 context.next();
					 } else {
					 ...
					 }
					 */
				},
				function() {
					window.open(url);
				}
			]);
		}

		/**
		 * Добавляет страницу редактирования для раздела.
		 * @param {Object} designData данные дизайнера
		 * @param {GUID} typeId идентификатор типа
		 * @param {String} typeCaption заголовок типа
		 * @param {String} typeColumnSchemaName имя схемы сипа
		 * @param {Function} callback функция обратного вызова
		 */
		function addTypedEditPage(designData, typeId, typeCaption, position, typeColumnSchemaName, callback) {
			var sectionConfig = designData.module[designData.mainModuleName];
			var pages = sectionConfig.pages;
			var pageSchemaCaption = Ext.String.format(localizableStrings.SectionTypeEditPage,
				sectionConfig.caption, typeCaption);
			var pageCaption = typeCaption;
			var actionCaption = Ext.String.format(localizableStrings.ActionCaption, typeCaption);
			getSectionLikeSchemaNames(designData, function(names) {
				var codeWithPrefix = designData.mainModuleName;
				if (!validateNamePrefix(codeWithPrefix)) {
					codeWithPrefix = getSchemaNamePrefix() + codeWithPrefix;
				}
				var pageNameTpl = codeWithPrefix + "Type{0}Page";
				var i = 1;
				var pageName = Ext.String.format(pageNameTpl, i);
				var schemaManager = designData.schemaManager;
				var clientUnitManager = schemaManager.clientUnit;
				var entityManager = schemaManager.entity;
				while (names.indexOf(pageName) !== -1 || clientUnitManager[pageName] || entityManager[pageName]) {
					pageName = Ext.String.format(pageNameTpl, ++i);
				}
				var currentPage = createEditPage(designData, {
					sectionCode: designData.mainModuleName,
					pageName: pageName,
					pageCaption: pageCaption,
					pageSchemaCaption: pageSchemaCaption,
					typeColumnValue: typeId,
					actionCaption: actionCaption,
					position: position
				});
				currentPage.typeColumnSchemaName = typeColumnSchemaName;
				pages.push(currentPage);
				if (callback) {
					callback(designData, currentPage);
				}
			});
		}

		/**
		 * Модифицирует страницу редактирования
		 * @param {Object} pageConfig Конфигурация страницы редактирования
		 * @param {String} sectionCaption Заголовок раздела
		 */
		function modifyEditPage(pageConfig, sectionCaption) {
			var pageSchemaCaption = Ext.String.format(localizableStrings.SectionEditPage, sectionCaption);
			pageConfig.caption = pageSchemaCaption;
			SectionDesignDataModule.modifyClientUnitStructure(pageConfig.name, {schemaCaption: pageSchemaCaption});
			SectionDesignDataModule.modifyEntity("SysModuleEdit", {PageCaption: sectionCaption}, pageConfig.recordId);
		}

		/**
		 * Модифицирует страницу редактирования
		 * @param {String} sectionCaption заголовок раздела0
		 * @param {Object} currentPage текущая страница
		 * @param {String} typeCaption заголовок типа
		 * @param {GUID} typeId идентификатор типа
		 * @param {Number} position позиция страницы
		 */
		function modifyTypedEditPage(sectionCaption, currentPage, typeCaption, typeId, position) {
			var pageSchemaCaption = Ext.String.format(localizableStrings.SectionTypeEditPage,
				sectionCaption, typeCaption);
			var pageCaption = typeCaption;
			var actionCaption = Ext.String.format(localizableStrings.ActionCaption, typeCaption);
			SectionDesignDataModule.modifyEntity("SysModuleEdit", {
				ActionKindCaption: actionCaption,
				PageCaption: pageCaption,
				TypeColumnValue: typeId,
				Position: position
			}, currentPage.recordId);
			SectionDesignDataModule.modifyClientUnitStructure(currentPage.name, {schemaCaption: pageSchemaCaption});
			currentPage.actionCaption = actionCaption;
			currentPage.pageCaption = pageCaption;
			currentPage.position = position;
			var newActionKindId = modifySysModuleEditLcz(currentPage.actionKindCaptionLczId, actionCaption,
				SectionDesignerEnums.SysModuleEditLczColumns.ActionKindCaption, currentPage.recordId);
			var newPageCaptionId = modifySysModuleEditLcz(currentPage.pageCaptionLczId, pageCaption,
				SectionDesignerEnums.SysModuleEditLczColumns.PageCaption, currentPage.recordId);
			if (newActionKindId) {
				currentPage.actionKindCaptionLczId = newActionKindId;
			}
			if (newPageCaptionId) {
				currentPage.pageCaptionLczId = newPageCaptionId;
			}
		}

		/**
		 * Модифицирует таблицу локализации для страниц редактирования раздела
		 * @param {GUID} recordId Идентификатор записи в таблице локализации
		 * @param {String} value Локализируемое значение
		 * @param {GUID} columnId Идентификатор колонки, которая локализируется
		 * @param {GUID} pageId Идентификатор страницы редактирования
		 * @returns {GUID} Идентификатор новой записи в таблице локализации
		 */
		function modifySysModuleEditLcz(recordId, value, columnId, pageId) {
			var newRecordId;
			if (!isEmptyOrEmptyGUID(recordId)) {
				SectionDesignDataModule.modifyEntity("SysModuleEditLcz", {
					Value: value
				}, recordId);
			} else {
				newRecordId = addModuleEditLcz(value, columnId, pageId);
			}
			return newRecordId;
		}

		/**
		 * Получает имена схем, содержащих в названии имя раздела
		 * @param {Object} designData данные дизайнера
		 * @param {Function} callback функция обратного вызова
		 */
		function getSectionLikeSchemaNames(designData, callback) {
			if (designData.likeSchemaNames) {
				callback(designData.likeSchemaNames);
			} else {
				SectionDesignDataModule.loadLikeSchemaNames(designData.mainModuleName, function(names) {
					designData.likeSchemaNames = names;
					callback(designData.likeSchemaNames);
				});
			}
		}

		/**
		 * Проверка на пустой GUID
		 * @param {GUID} uId идентификатор
		 * @returns {Boolean}
		 */
		function isEmptyOrEmptyGUID(uId) {
			return Ext.isEmpty(uId) || Terrasoft.isEmptyGUID(uId);
		}

		/**
		 * Возвращает текст тела схемы
		 * @param {String} schemaName название метода
		 * @param {Function} callback функция обратного вызова
		 * @param {Object} scope контекст выполнения функциии обратного вызова
		 */
		function getClientUnitSchemaBody(schemaName, callback, scope) {
			scope = scope || this;
			postServiceRequest({
				methodName: "GetClientUnitSchemaBody",
				parameters: {
					schemaName: schemaName
				},
				scope: this,
				callback: function(request, success, response) {
					if (success) {
						var responseObject = Terrasoft.decode(response.responseText);
						callback.call(scope, responseObject.GetClientUnitSchemaBodyResult);
					}
				}
			});
		}

		/**
		 * Возвращает текст тела схемы
		 * @param {String} schemaName название метода
		 * @param {Function} callback функция обратного вызова
		 * @param {Object} scope контекст выполнения функциии обратного вызова
		 */
		function getSchemaPackageStatus(schemaName, callback, scope) {
			scope = scope || this;
			var packageUId = storage.getItem("SectionDesigner_CurrentPackageUId");
			postServiceRequest({
				methodName: "GetSchemaPackageStatus",
				parameters: {
					schemaName: schemaName,
					packageUId: packageUId
				},
				scope: this,
				callback: function(request, success, response) {
					if (success) {
						var responseObject = Terrasoft.decode(response.responseText);
						callback.call(scope, responseObject.GetSchemaPackageStatusResult);
					}
				}
			});
		}

		return {
			getSchemaPackageStatus: getSchemaPackageStatus,
			isExistColumn: isExistColumn,
			createButtons: createButtons,
			createClientUnitSchema: createClientUnitSchema,
			createEntitySchemaColumn: createEntitySchemaColumn,
			createEntitySchemaPrimaryDisplayColumn: createEntitySchemaPrimaryDisplayColumn,
			createEntitySchemaReferenceColumn: createEntitySchemaReferenceColumn,
			createEntitySchema: createEntitySchema,
			createInputControls: createInputControls,
			createModuleScheme: createModuleScheme,
			setSectionDesignDataModule: setSectionDesignDataModule,
			initSchemaNamePrefix: initSchemaNamePrefix,
			validateSystemName: validateSystemName,
			validateNamePrefix: validateNamePrefix,
			validateTextEdit: validateTextEdit,
			getModuleInfo: getModuleInfo,
			getSchemaInfo: getSchemaInfo,
			getEntitySchemaDesignData: getEntitySchemaDesignData,
			postServiceRequest: postServiceRequest,
			modulesStructure: modulesStructure,
			createEditPage: createEditPage,
			convertIntoSinglePageSection: convertIntoSinglePageSection,
			addModuleEditLcz: addModuleEditLcz,
			addModuleLcz: addModuleLcz,
			createEntityTypeColumn: createEntityTypeColumn,
			setSectionCaption: setSectionCaption,
			setSectionIcon: setSectionIcon,
			setSectionLogo: setSectionLogo,
			getSchemeBody: getSchemeBody,
			getSchemaBody: getSchemaBody,
			removeEditPage: removeEditPage,
			clearEditPages: clearEditPages,
			changeSectionTypeColumn: changeSectionTypeColumn,
			getSchemaNamePrefix: getSchemaNamePrefix,
			getCanUseSectionDesigner: getCanUseSectionDesigner,
			getMaxEntitySchemaNameLength: getMaxEntitySchemaNameLength,
			start: start,
			modifyTypedEditPage: modifyTypedEditPage,
			addTypedEditPage: addTypedEditPage,
			isEmptyOrEmptyGUID: isEmptyOrEmptyGUID,
			getClientUnitSchemaDesignDataBlock: getClientUnitSchemaDesignDataBlock,
			setSectionWorkplace: setSectionWorkplace,
			tryLockSectionScheme: tryLockSectionScheme,
			getCurrentPackageUId: getCurrentPackageUId
		};
	}
);