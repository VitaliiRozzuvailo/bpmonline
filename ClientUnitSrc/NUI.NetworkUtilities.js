define("NetworkUtilities", ["ext-base", "terrasoft", "sandbox", "NetworkUtilitiesResources", "ConfigurationEnums",
		"MaskHelper"],
function(Ext, Terrasoft, sandbox, resources, ConfigurationEnums, MaskHelper) {

	/**
	 * Проверяет, является ли строка корректным URL'ом
	 * @param {String} value Строковое представление URL'а
	 * @return {Boolean} true - если строка корректного для URL формата
	 */
	var isUrl = function(value) {
		return Terrasoft.isUrl(value);
	};

	/**
	 * Открывает URL в новом окне
	 * @param {String} value Строковое представление URL'а
	 */
	var onUrlClick = function(value) {
		if (isUrl(value)) {
			window.open(value);
		}
	};

	/**
	 * Возвращает название схемы сущности по идентификатору схемы сущности.
	 * @param {String} entitySchemaUId Идентификатор схемы сущности.
	 * @return {String} Возвращает название схемы сущности.
	 */
	var getEntitySchemaName = function(entitySchemaUId) {
		if (Ext.isEmpty(entitySchemaUId)) {
			return;
		}
		var structure = Terrasoft.where(Terrasoft.configuration.ModuleStructure, {entitySchemaUId: entitySchemaUId})[0];
		if (!structure) {
			structure = Terrasoft.where(Terrasoft.configuration.EntityStructure, {entitySchemaUId: entitySchemaUId})[0];
		}
		return (structure && !Ext.isEmpty(structure.entitySchemaName)) ? structure.entitySchemaName : null;
	};

	/**
	 * Создает относительный URL для открытия карточки сущности.
	 * @throws {Terrasoft.ArgumentNullOrEmptyException} Бросает исключение если не указно название схемы или
	 * идентификатор сущности.
	 * @param {String} entitySchema Имя или идентификатор схемы сущности.
	 * @param {String} primaryColumnValue Идентификатор сущности.
	 * @param {String} [typeColumnValue] Значение колонки типа.
	 * @param {String} [operation] Операция.
	 * @return {String} Возвращает относительный URL для открытия карточки сущности.
	 */
	var getEntityUrl = function(entitySchema, primaryColumnValue, typeColumnValue, operation) {
		var config = getEntityConfigUrl(entitySchema, primaryColumnValue, typeColumnValue, operation);
		return Terrasoft.combinePath(config.cardModule, config.cardSchema, config.operation, config.primaryColumnValue);
	};

	/**
	 * Создает конфигурацию значений объекта для URL к карточке сущности.
	 * @throws {Terrasoft.ArgumentNullOrEmptyException} Бросает исключение если не указно название схемы или
	 * идентификатор сущности.
	 * @param {String} entitySchema Имя или идентификатор схемы сущности.
	 * @param {String} primaryColumnValue Идентификатор сущности.
	 * @param {String} [typeColumnValue] Значение колонки типа.
	 * @param {String} [operation] Операция.
	 * @return {Object} Возвращает конфигурацию значений объекта для URL к карточке сущности.
	 */
	var getEntityConfigUrl = function(entitySchema, primaryColumnValue, typeColumnValue, operation) {
		var entitySchemaName = entitySchema;
		if (!entitySchemaName) {
			throw Ext.create("Terrasoft.ArgumentNullOrEmptyException");
		}
		if (!primaryColumnValue) {
			throw Ext.create("Terrasoft.ArgumentNullOrEmptyException");
		}
		var configuration = Terrasoft.configuration;
		var moduleStructure = configuration.ModuleStructure[entitySchemaName];
		var entityStructure = configuration.EntityStructure[entitySchemaName];
		if (!moduleStructure && !entityStructure) {
			entitySchemaName = getEntitySchemaName(entitySchema);
			moduleStructure = configuration.ModuleStructure[entitySchemaName];
			entityStructure = configuration.EntityStructure[entitySchemaName];
		}
		var cardModule = moduleStructure && moduleStructure.cardModule ? moduleStructure.cardModule : "CardModuleV2";
		var pages = entityStructure.pages;
		var cardSchema = pages[0].cardSchema;
		if (typeColumnValue && moduleStructure.attribute && pages.length) {
			Terrasoft.each(pages, function(page) {
				if (page.UId === typeColumnValue) {
					cardSchema = page.cardSchema;
					return false;
				}
			}, this);
		}
		var configUrl = {
			cardModule: cardModule,
			cardSchema: cardSchema,
			entitySchemaName: entitySchemaName,
			operation: operation || ConfigurationEnums.CardStateV2.EDIT,
			primaryColumnValue: primaryColumnValue
		};
		return configUrl;
	};

	/**
	 * Открывает страницу карточки сущности.
	 * @param {Object} config
	 * @param {String} config.entityId Идентификатор сущности.
	 * @param {String} config.entitySchemaName Имя схемы сущности.
	 * Если отсутствует будет определено по идентификатор схемы сущности.
	 * @param {String} config.entitySchemaUId Идентификатор схемы сущности.
	 * Может отсутствовать если задано имя схемы сущности.
	 * @param {Object} config.sandbox Песочница модуля вызывающего открытие страницы карточки сущности.
	 * @param {Object} config.stateObj Объект состояния открываемой страницы карточки сущности.
	 */
	var openEntityPage = function(config) {
		if (!Ext.isObject(config)) {
			return;
		}
		var sandbox = config.sandbox;
		var entityId = config.entityId;
		var entitySchemaName = config.entitySchemaName;
		if (Ext.isEmpty(entitySchemaName)) {
			entitySchemaName = getEntitySchemaName(config.entitySchemaUId);
		}
		if (Ext.isEmpty(sandbox) || Ext.isEmpty(entityId) || Ext.isEmpty(entitySchemaName)) {
			return;
		}
		var moduleStructure = Terrasoft.configuration.ModuleStructure[entitySchemaName];
		var attribute = (moduleStructure && moduleStructure.attribute) ? moduleStructure.attribute : null;
		if (attribute) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: entitySchemaName
			});
			select.addColumn("Id");
			select.addColumn(attribute);
			select.getEntity(entityId, function(result) {
				if (result && result.success) {
					var entity = result.entity;
					var typeId = entity.get(attribute).value;
					var hash = getEntityUrl(entitySchemaName, entityId, typeId);
					sandbox.publish("PushHistoryState", {
						hash: hash,
						stateObj: config.stateObj
					});
				}
			}, this);
		} else {
			var hash = getEntityUrl(entitySchemaName, entityId);
			sandbox.publish("PushHistoryState", {
				hash: hash,
				stateObj: config.stateObj
			});
		}
	};

	/**
	 * Открывает карточку в цепочке.
	 * @param {Object} config Конфигурация настроек для открытия карточки.
	 * @param {String} config.entityId Идентификатор сущности.
	 * @param {String} config.entitySchemaName Имя схемы сущности.
	 * Если отсутствует будет определено по идентификатор схемы сущности.
	 * @param {String} config.entitySchemaUId Идентификатор схемы сущности.
	 * Может отсутствовать если задано имя схемы сущности.
	 * @param {Object} config.sandbox Песочница модуля вызывающего открытие страницы карточки сущности.
	 * @param {String} config.typeId Если отсутствует будет определено по идентификатору схемы сущности.
	 */
	var openCardInChain = function(config) {
		if (!Ext.isObject(config)) {
			return;
		}
		MaskHelper.ShowBodyMask();
		var sandbox = config.sandbox;
		var entityId = config.primaryColumnValue;
		var entitySchemaName = config.entitySchemaName;
		if (Ext.isEmpty(entitySchemaName)) {
			entitySchemaName = config.entitySchemaName = getEntitySchemaName(config.entitySchemaUId);
		}
		if (Ext.isEmpty(sandbox) || Ext.isEmpty(entityId) || Ext.isEmpty(entitySchemaName)) {
			return;
		}
		var moduleStructure = Terrasoft.configuration.ModuleStructure[entitySchemaName];
		config.moduleName = moduleStructure.cardModule || moduleStructure.sectionModule;
		var attribute = (moduleStructure && moduleStructure.attribute) ? moduleStructure.attribute : null;
		if (attribute && !config.typeId) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: entitySchemaName
			});
			select.addColumn("Id");
			select.addColumn(attribute);
			select.getEntity(entityId, function(result) {
				if (result && result.success) {
					var entity = result.entity;
					var typeId = entity.get(attribute).value;
					config.typeId = typeId;
					openCard(config);
				}
			}, this);
		} else {
			openCard(config);
		}
	};

	/**
	 * Открывает карточку
	 * @param {Object} config
	 * @param {Object} config Конфигурация настроек для открытия карточки.
	 * @param {String} config.entityId Идентификатор сущности.
	 * @param {String} config.entitySchemaName Имя схемы сущности.
	 * Если отсутствует будет определено по идентификатор схемы сущности.
	 * @param {String} config.entitySchemaUId Идентификатор схемы сущности.
	 * Может отсутствовать если задано имя схемы сущности.
	 * @param {Object} config.sandbox Песочница модуля вызывающего открытие страницы карточки сущности.
	 * @param {String} config.typeId Если отсутствует будет определено по идентификатору схемы сущности.
	 * @param {String} config.operation Операция, которая будет передана карточке.
	 * По умолчанию используется ConfigurationEnums.CardStateV2.EDIT.
	 */
	function openCard(config) {
		var entitySchemaConfig = getEntityConfigUrl(config.entitySchemaName, config.primaryColumnValue, config.typeId,
			config.operation);
		var historyState = config.historyState;
		var sandbox = config.sandbox;
		var entitySchemaName = entitySchemaConfig.entitySchemaName;
		var state = {
			isSeparateMode: true,
				schemaName: entitySchemaConfig.cardSchema,
				entitySchemaName: entitySchemaName,
				operation: entitySchemaConfig.operation,
				primaryColumnValue: entitySchemaConfig.primaryColumnValue,
				isInChain: true
		};
		var typeColumnName = getTypeColumn(entitySchemaName);
		if (!Ext.isEmpty(typeColumnName) && config.typeId) {
			state.typeColumnName = typeColumnName.path;
			state.typeUId = config.typeId;
		}
		sandbox.publish("PushHistoryState", {
			hash: historyState.hash.historyState,
			silent: true,
			stateObj: state
		});
		var moduleParams = {
			renderTo: "centerPanel",
			keepAlive: true
		};
		if (config.moduleId) {
			moduleParams.id = config.moduleId
		}
		sandbox.loadModule(config.moduleName, moduleParams);
	}

	/**
	 * Получает колонку Тип для текущей схемы
	 * @protected
	 * @return {Object}
	 */
	function getTypeColumn(schemaName) {
		var schemaConfig = Terrasoft.configuration.ModuleStructure[schemaName];
		var typeColumnName = schemaConfig && schemaConfig.attribute || null;
		return typeColumnName ? {path: typeColumnName} : null;
	}

	return {
		isUrl: isUrl,
		onUrlClick: onUrlClick,
		getEntityUrl: getEntityUrl,
		getEntityConfigUrl: getEntityConfigUrl,
		openEntityPage: openEntityPage,
		openCardInChain: openCardInChain,
		getTypeColumn: getTypeColumn
	};
});
