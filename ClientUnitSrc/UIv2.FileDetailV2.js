define("FileDetailV2", ["ViewUtilities", "ConfigurationConstants", "ConfigurationEnums", "ImageListViewModel",
		"css!FileDetailCssModule"], function(ViewUtilities, ConfigurationConstants, ConfigurationEnums) {
	return {
		attributes: {
			/**
			 * Хранит имя карточки редактирования
			 */
			"SchemaCardName": {
				dataValueType: Terrasoft.DataValueType.TEXT,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},

			/**
			 * Ошибки при загрузке файлов.
			 * @protected
			 */
			"FilesUploadErrorLog": {
				dataValueType: Terrasoft.DataValueType.COLLECTION,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
			},

			/**
			 * Коллекция расширений файлов.
			 * @protected
			 */
			Extensions: {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			},

			/**
			 * @type {Boolean}
			 */
			isImageManagerDetailView: {
				dataValueType: Terrasoft.DataValueType.BOOLEAN
			},

			/**
			 * @type {Boolean}
			 */
			isAnyItemSelected: {
				dataValueType: Terrasoft.DataValueType.BOOLEAN
			},

			/**
			 * Конфигурация представления элемента изображения.
			 * @type {Object}
			 */
			ItemViewConfig: {
				dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
			},

			/**
			 * Родительский объект.
			 */
			parentEntity: {
				dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
			},

			/**
			 * Кэш ссылок на объект.
			 */
			cacheEntityLink: {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			},

			/**
			 * Конфигурация типа сущности.
			 */
			entityTypeConfig: {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			},

			/**
			 * Признак, который указывает на то, что сущность - ссылка.
			 * @readonly
			 */
			isLink: {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				value: false
			},

			/**
			 * Признак, который указывает на то, что сущность - файл.
			 * @readonly
			 */
			isFile: {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				value: false
			},

			/**
			 * Признак, который указывает на то, что сущность - ссылка на объект.
			 * @readonly
			 */
			isEntityLink: {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				value: false
			}
		},

		messages: {
			"ItemSelected": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},

		methods: {

			/**
			 * @inheritdoc Terrasoft.BaseDetailV2#init
			 * @overridden
			 */
			init: function() {
				this.set("SchemaCardName", "LinkPageV2");
				this.initParentEntity();
				this.callParent(arguments);
				var cardModuleId = this.sandbox.id + "LinkPageV2";
				this.sandbox.subscribe("getCardInfo", this.getCardInfoConfig.bind(this), [cardModuleId]);
				this.set("isAnyItemSelected", false);
				this.set("FilesUploadErrorLog", this.Ext.create("Terrasoft.Collection"));
				this.set("Extensions", this.Ext.create("Terrasoft.Collection"));
				this.on("change:SelectedRows", function(model, value) {
					this.set("isAnyItemSelected", !this.Ext.isEmpty(value));
				}, this);
				this.on("change:ActiveRow", function(model, value) {
					this.set("isAnyItemSelected", !this.Ext.isEmpty(value));
				}, this);
				this.on("change:MasterRecordId", this.onMasterRecordIdChanged, this);
			},

			/**
			 * Очищает подписки на события.
			 */
			destroy: function() {
				this.un("change:MasterRecordId", this.onMasterRecordIdChanged, this);
				this.callParent(arguments);
			},

			/**
			 * Обрабатывает событие изменение уникального идентификатора записи.
			 * @param {Object} model Backbone модель.
			 * @param {Guid} value Уникальный идентификатор записи.
			 */
			onMasterRecordIdChanged: function(model, value) {
				var parentEntity = this.parentEntity;
				if (parentEntity && parentEntity.RecordId) {
					parentEntity.RecordId = value;
				}
			},

			/**
			 * Инициализирует коллекцию данных представления рееестра.
			 * @protected
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст выполнения.
			 */
			initData: function(callback, scope) {
				this.callParent([this.initEntityType.bind(this, callback, scope), this]);
			},

			/**
			 * Обновлет данные кэша ссылки на сущность.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст выполнения.
			 */
			updateEntityLinkCache: function(callback, scope) {
				var esq = this.getEntityLink();
				esq.getEntityCollection(function(response) {
					if (response && response.success && response.collection) {
						var collectionItems = response.collection.getItems();
						var collection = collectionItems.map(function(item) {
							var model = item.model;
							if (model) {
								return model.toJSON();
							}
						});
						this.prepareCacheEntityLink(collection);
						if (callback) {
							callback.call(scope || this);
						}
					} else if (!response.success && response.errorInfo) {
						throw new Terrasoft.UnknownException({
							message: response.errorInfo.message
						});
					}
				}, this);
			},

			/**
			 * Инициализирует данные типов сущностей.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст выполнения.
			 */
			initEntityType: function(callback, scope) {
				var esq = this.getEntityType();
				esq.getEntityCollection(function(response) {
					if (response && response.success && response.collection) {
						var collection = response.collection.getItems();
						this.prepareEntityTypeConfig(collection);
						var toolsButtonMenu = this.get("ToolsButtonMenu");
						this.addEntityOperationsMenuItems(toolsButtonMenu);
						if (callback) {
							callback.call(scope || this);
						}
					} else if (!response.success && response.errorInfo) {
						throw new Terrasoft.UnknownException({
							message: response.errorInfo.message
						});
					}
				}, this);
			},

			/**
			 * Возвращает запрос на выборку данных типов сущностей.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.EntitySchemaQuery}
			 */
			getEntityType: function() {
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "EntityTypeLookup"
				});
				esq.addColumn("EntityName");
				esq.addColumn("MenuItemCaption");
				esq.addColumn("SysSettingImage");
				esq.addColumn("Position");
				return esq;
			},

			/**
			 * Возвращает запрос на выборку данных ссылки на сущность.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.EntitySchemaQuery}
			 */
			getEntityLink: function() {
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: this.entitySchemaName
				});
				esq.addColumn("Id");
				esq.addColumn("Name");
				esq.addColumn("Data");
				esq.filters.addItem(esq.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, this.parentEntity.EntityName, this.parentEntity.RecordId));
				esq.filters.addItem(esq.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Type", ConfigurationConstants.FileType.EntityLink));
				return esq;
			},

			/**
			 * Устанавливает конфигурацию типов сущностей.
			 * @param {Array} collection Данные запроса.
			 */
			prepareEntityTypeConfig: function(collection) {
				this.entityTypeConfig = this.Ext.create("Terrasoft.Collection");
				this.Terrasoft.each(collection, this.addEntityType, this);
			},

			/**
			 * Добавляет конфигурацию типа сущности.
			 * @private
			 * @param {Object} item Информация о типе.
			 * @param {String} item.EntityName Название сущности.
			 * @param {String} item.MenuItemCaption Подпись в меню функциональной кнопки.
			 * @param {String} item.SysSettingImage Системная настройка с изображением сущности.
			 * @param {String} item.Position Позиция отображения в меню функциональной кнопки.
			 */
			addEntityType: function(item) {
				this.entityTypeConfig.add(item.get("EntityName"), {
					menuItemCaption: item.get("MenuItemCaption"),
					sysSettingImage: item.get("SysSettingImage"),
					position: item.get("Position")
				}, this);
			},

			/**
			 * Подготавливает данные кэша.
			 * @param {Array} collection Данные запроса.
			 */
			prepareCacheEntityLink: function(collection) {
				this.cacheEntityLink = this.Ext.create("Terrasoft.Collection");
				this.Terrasoft.each(collection, function(item) {
					var data = Ext.JSON.decode(item.Data);
					if (data) {
						this.cacheEntityLink.add(item.Id, {
							"name": item.Name,
							"entityName": data.entitySchemaName,
							"recordId": data.recordId
						}, this);
					}
				}, this);
			},

			/**
			 * Установка типов свойств по-умолчанию.
			 */
			setDefaultEntityType: function() {
				this.isFile = false;
				this.isLink = false;
				this.isEntityLink = false;
			},

			/**
			 * Определяет тип сущности.
			 * @param {Object} item
			 */
			defineEntityType: function(item) {
				this.setDefaultEntityType();
				var entityType = item.get("Type");
				var entityTypeId = entityType.value;
				if (entityTypeId === ConfigurationConstants.FileType.File) {
					this.isFile = true;
				}
				if (entityTypeId === ConfigurationConstants.FileType.Link) {
					this.isLink = true;
				}
				if (entityTypeId === ConfigurationConstants.FileType.EntityLink) {
					this.isEntityLink = true;
				}
			},

			/**
			 * Возвращает конфигурацию для передачи в карточку параметров.
			 * @overridden
			 */
			getCardInfoConfig: function() {
				var detailInfo = {
					valuePairs: this.get("DefaultValues") || []
				};
				detailInfo.typeColumnName = this.parentEntity.EntityName;
				detailInfo.typeUId = this.parentEntity.RecordId;
				return detailInfo;
			},

			/**
			 * Инициализирует значения родительского объектта.
			 */
			initParentEntity: function() {
				this.parentEntity = {};
				var entitySchemaName = this.entitySchema.name;
				var parentSchemaName = entitySchemaName.replace("File", "");
				var masterRecordId = this.get("MasterRecordId");
				this.parentEntity.EntityName = parentSchemaName;
				this.parentEntity.RecordId = masterRecordId;
			},

			/**
			 * @inheritdoc Terrasoft.BaseDetailV2#getEditPagesSandboxIds
			 * @overridden
			 */
			getEditPagesSandboxIds: function() {
				return [this.sandbox.id + this.get("SchemaCardName")];
			},

			/**
			 * @inheritdoc Terrasoft.BaseDetailV2#getEditRecordButtonEnabled
			 * @overridden
			 */
			getEditRecordButtonEnabled: function() {
				if (this.isSingleSelected()) {
					var activeRow = this.getActiveRow();
					return (activeRow.get("Type").value === ConfigurationConstants.FileType.Link);
				}
				return false;
			},

			/**
			 * Добавление ссылки.
			 */
			addLinkRecord: function() {
				var editPageUId = this.Terrasoft.GUID_EMPTY;
				var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
				var isNewRecord = (cardState.state === ConfigurationEnums.CardStateV2.ADD ||
				cardState.state === ConfigurationEnums.CardStateV2.COPY);
				if (isNewRecord) {
					this.sandbox.subscribe("CardSaved", function() {
						this.openCard(ConfigurationEnums.CardStateV2.ADD, editPageUId, null);
					}, this, [this.sandbox.id]);
					var config = {
						isSilent: true,
						messageTags: [this.sandbox.id]
					};
					this.sandbox.publish("SaveRecord", config, [this.sandbox.id]);
				} else {
					this.openCard(ConfigurationEnums.CardStateV2.ADD, editPageUId, null);
				}
			},

			/**
			 * Добавление ссылки на сущность.
			 * @param {String} entityName Знавание сущности.
			 */
			addEntityLinkRecord: function(entityName) {
				var filters = this.getEntityFilter(entityName);
				var configLookup = {
					entitySchemaName: entityName,
					multiSelect: true,
					filters: filters
				};
				var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
				var isNewRecord = (cardState.state === ConfigurationEnums.CardStateV2.ADD ||
				cardState.state === ConfigurationEnums.CardStateV2.COPY);
				if (isNewRecord) {
					this.sandbox.subscribe("CardSaved", function() {
						this.openLookup(configLookup, this.saveSelectedRecords.bind(this, entityName), this);
					}, this, [this.sandbox.id]);
					var config = {
						isSilent: true,
						messageTags: [this.sandbox.id]
					};
					this.sandbox.publish("SaveRecord", config, [this.sandbox.id]);
				} else {
					this.openLookup(configLookup, this.saveSelectedRecords.bind(this, entityName), this);
				}
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#onDeleted
			 * @overridden
			 */
			onDeleted: function(record) {
				this.set("SelectedRows", []);
				this.reloadCollectionData();
				if (record && record.Success) {
					var deletedItems = record.DeletedItems;
					this.Terrasoft.each(deletedItems, function(item) {
						this.cacheEntityLink.removeByKey(item);
					}, this);
				}
				this.callParent(arguments);
			},

			/**
			 * Формирует фильтры, для отображения сущностей.
			 * @param {String} entityName Название сущности.
			 * @return {Terrasoft.data.filters.FilterGroup} Возвращает группу фильтров.
			 */
			getEntityFilter: function(entityName) {
				var filterGroup = this.Terrasoft.createFilterGroup();
				if (!this.Ext.isEmpty(this.cacheEntityLink)) {
					this.cacheEntityLink.each(function(item) {
						if (item.entityName === entityName) {
							var idFilter = this.Terrasoft.createColumnFilterWithParameter(
									this.Terrasoft.ComparisonType.NOT_EQUAL, "Id", item.recordId);
							filterGroup.addItem(idFilter);
						}
					}, this);
				}
				return filterGroup;
			},

			/**
			 * Генерирует элементы выпадающего списка функциональной кнопки.
			 * @return {Array} Элементы выпадающего списка функциональной кнопки.
			 */
			generateButtonMenuItems: function() {
				var itemsConfig = [];
				if (!this.Ext.isEmpty(this.entityTypeConfig)) {
					this.entityTypeConfig.eachKey(function(entityName, item) {
						var addMethodName = "add" + entityName + "Record";
						this[addMethodName] = this.addEntityLinkRecord.bind(this, entityName);
						itemsConfig.push({
							"viewModelItem": this.getButtonMenuItem({
								Caption: item.menuItemCaption,
								Click: {"bindTo": addMethodName}
							}),
							"position": item.position,
							"key": entityName + "Item"
						});
					}, this);
				}
				return itemsConfig;
			},

			/**
			 * Сохраняет в цепочке ссылки на сущность.
			 * @param {String} entityName Название сущность.
			 * @param {Object} config Объект вида {columnName: string, selectedRows: []}.
			 **/
			saveSelectedRecords: function(entityName, config) {
				var selectedRows = config.selectedRows.getItems();
				if (selectedRows && selectedRows.length) {
					var batchQuery = this.Ext.create("Terrasoft.BatchQuery");
					this.Terrasoft.each(selectedRows, function(item) {
						batchQuery.add(this.getInsertEntityLink(item, entityName));
					}, this);
					batchQuery.add(this.getEntityLink());
					batchQuery.execute(function(response) {
						if (response && response.success && response.queryResults) {
							var entityLinkCacheResult = response.queryResults[selectedRows.length];
							if (entityLinkCacheResult && entityLinkCacheResult.rows) {
								this.prepareCacheEntityLink(entityLinkCacheResult.rows);
							}
							this.loadGridData();
						}
					}, this);
				}
			},

			/**
			 * Сохраняет ссылки на сущность.
			 * @param {Object} item Объект сущность.
			 * @param {Object} entityName Название сущность.
			 * @return {Terrasoft.InsertQuery}
			 */
			getInsertEntityLink: function(item, entityName) {
				var data = {
					entitySchemaName: entityName,
					recordId: item.value
				};
				var insert = this.Ext.create("Terrasoft.InsertQuery", {
					rootSchemaName: this.entitySchemaName
				});
				insert.setParameterValue("Name", item.Name, Terrasoft.DataValueType.TEXT);
				insert.setParameterValue("Data", Ext.JSON.encode(data), Terrasoft.DataValueType.BLOB);
				insert.setParameterValue(this.parentEntity.EntityName, this.parentEntity.RecordId,
						Terrasoft.DataValueType.GUID);
				insert.setParameterValue("Type", ConfigurationConstants.FileType.EntityLink,
						Terrasoft.DataValueType.GUID);
				return insert;
			},

			/**
			 * Возвращает из кеэша сущностей элемент по id.
			 * @param {String} id Идентификатор элемента.
			 * @return {Object} Объект сущности.
			 */
			getEntityLinkCacheById: function(id) {
				if (!this.Ext.isEmpty(this.cacheEntityLink)) {
					return this.cacheEntityLink.get(id);
				}
				return null;
			},

			/**
			 * Возвращает колонки, которые всегда выбираются запросом.
			 * @protected
			 * @overridden
			 * @return {Object} Возвращает массив объектов-конфигураций колонок
			 */
			getGridDataColumns: function() {
				var baseGridDataColumns = this.callParent(arguments);
				var gridDataColumns = {
					"Type": {
						path: "Type"
					},
					"Version": {
						path: "Version"
					}
				};
				return this.Ext.apply(baseGridDataColumns, gridDataColumns);
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			getOpenCardConfig: function() {
				var config = this.callParent(arguments);
				return this.Ext.apply(config, {
					moduleId: this.sandbox.id + this.get("SchemaCardName"),
					entitySchemaName: this.entitySchemaName
				});
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			initEditPages: function() {
				var collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
				var typeUId = this.Terrasoft.GUID_EMPTY;
				collection.add(typeUId, this.Ext.create("Terrasoft.BaseViewModel", {
					values: {
						Tag: typeUId,
						SchemaName: this.get("SchemaCardName")
					}
				}));
				this.set("EditPages", collection);
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#linkClicked
			 * @overridden
			 */
			linkClicked: function(rowId) {
				var collection = this.getGridData();
				var record = collection.get(rowId);
				if (this.isEntityLink) {
					var recordId = record.get("Id");
					this.openCardEntity(recordId);
					return false;
				}
			},

			/**
			 * Открытает карточку объекта.
			 * @param {String} id Идентификатор записи.
			 */
			openCardEntity: function(id) {
				var entityLink = this.getEntityLinkCacheById(id);
				if (!this.Ext.isEmpty(entityLink)) {
					var entityId = entityLink.recordId;
					var entityStructure = this.getEntityStructure(entityLink.entityName);
					var pages = entityStructure.pages;
					if (!this.Ext.isEmpty(pages)) {
						var cardModuleId = this.sandbox.id + "_" + pages[0].cardSchema;
						var operation = ConfigurationEnums.CardStateV2.EDIT;
						var openCardConfig = {
							moduleId: cardModuleId,
							schemaName: pages[0].cardSchema,
							operation: operation,
							id: entityId
						};
						this.sandbox.publish("OpenCard", openCardConfig, [this.sandbox.id]);
					}
				}
			},

			/**
			 * Возвращает конфигурацию ссылки в ячейке реестра.
			 * @private
			 * @param {Terrasoft.BaseViewModel} item Запись, клик на которой обрабатывается.
			 */
			getColumnLinkConfig: function(item) {
				this.defineEntityType(item);
				var id = item.get("Id");
				var name = item.get("Name");
				var target = "_self";
				var click = null;
				var link;
				if (this.isFile) {
					link = "../rest/FileService/GetFile/" + this.entitySchema.uId + "/" + id;
				}
				if (this.isLink) {
					var rg = new RegExp("((ftp|http|https):\/\/)+", "i");
					link = rg.test(name) ? name : "http://" + name;
					target = "_blank";
				}
				if (this.isEntityLink) {
					var config = this.getEntityLinkConfigById(id);
					link = config.url;
				}
				return {
					target: target,
					link: link,
					click: click
				};
			},

			/**
			 * Возвращает конфигурацию для формирования ссылки на сущность.
			 * @param {String} id Идентификатор объекта.
			 * @return {Object} URL ссылку.
			 */
			getEntityLinkConfigById: function(id) {
				var entityLink = this.getEntityLinkCacheById(id);
				if (!this.Ext.isEmpty(entityLink)) {
					var entityLinkId = entityLink.recordId;
					var entitySchemaName = entityLink.entityName;
					return this.createLink(entitySchemaName, "Id", "Name", entityLinkId);
				}
			},

			/**
			 * Возвращает название системной настройки в которой хранится изображение сущности.
			 * @param {String} entityName Название сущности.
			 * @return {String} Название системной настройки.
			 */
			getSysSettingImageByEntityName: function(entityName) {
				if (!this.Ext.isEmpty(this.entityTypeConfig) && this.entityTypeConfig.contains(entityName)) {
					var entityConfig = this.entityTypeConfig.get(entityName);
					return entityConfig.sysSettingImage;
				}
			},

			/**
			 * @inheritdoc GridUtilitiesV2#createViewModel
			 * @overridden
			 */
			createViewModel: function(config) {
				this.callParent(arguments);
				config.viewModel.getEntityLinkConfigById = this.getEntityLinkConfigById.bind(this);
				config.viewModel.openCardEntity = this.openCardEntity.bind(this);
				config.viewModel.setDefaultEntityType = this.setDefaultEntityType;
				config.viewModel.defineEntityType = this.defineEntityType;
				config.viewModel.getEntityLinkCacheById = this.getEntityLinkCacheById.bind(this);
				config.viewModel.getSysSettingImageByEntityName = this.getSysSettingImageByEntityName.bind(this);
			},

			/**
			 * Добавляет метод, возвращающий конфигурацию ссылки в ячейке реестра
			 * @overridden
			 */
			addColumnLink: function(item, column) {
				var columnPath = column.columnPath;
				if (columnPath === item.primaryDisplayColumnName) {
					var linkConfig = this.getColumnLinkConfig(item);
					item["on" + columnPath + "LinkClick"] = function() {
						var value = this.get(columnPath);
						return {
							caption: value,
							target: linkConfig.target,
							title: value,
							url: linkConfig.link
						};
					};
				} else {
					this.callParent(arguments);
				}
			},

			/**
			 * Обработчик события выбора файла.
			 * @private
			 * @param {Object} files Файлы, генерируемые FileAPI
			 */
			onFileSelect: function(files) {
				if (files.length <= 0) {
					return;
				}
				var config = this.getUploadConfig(files);
				var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
				var isNewRecord = (cardState.state === ConfigurationEnums.CardStateV2.ADD ||
				cardState.state === ConfigurationEnums.CardStateV2.COPY);
				this.set("FileUploadConfig", config);
				if (isNewRecord) {
					var args = {
						isSilent: true,
						messageTags: [this.sandbox.id]
					};
					this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
				} else {
					this.Terrasoft.ConfigurationFileApi.upload(config);
				}
			},

			/**
			 * Возвращает настройки загрузки файла.
			 * @protected
			 * @return {Object} Настройки загрузки файла.
			 */
			getUploadConfig: function(files) {
				return {
					scope: this,
					onUpload: this.onUpload,
					onComplete: this.onComplete,
					onFileComplete: this.onFileComplete,
					entitySchemaName: this.entitySchema.name,
					columnName: "Data",
					parentColumnName: this.get("DetailColumnName"),
					parentColumnValue: this.get("MasterRecordId"),
					files: files,
					isChunkedUpload: true
				};
			},

			/**
			 * Обработчик события старта загрузки файлов. Отображает маску загрузки.
			 * @private
			 */
			onUpload: function() {
				this.showBodyMask();
			},

			/**
			 * Обработчик события завершения загрузки файлов. Скрывает маску загрузки. Если при загрузке возникли
			 * ошибки, отображает сообщение.
			 * @protected
			 */
			onComplete: function() {
				this.hideBodyMask();
				var errorLog = this.get("FilesUploadErrorLog");
				if (errorLog.getCount()) {
					this.onCompleteError(errorLog);
					errorLog.clear();
				}
			},

			/**
			 * Отображает сообщение, если при загрузке возникли ошибки.
			 * @private
			 */
			onCompleteError: function() {
				var message = this.get("Resources.Strings.UploadFileError");
				this.showInformationDialog(message);
			},

			/**
			 * Обработчик события завершения загрузки файла. Отображает запись в реестре. Если при загрузке возникла
			 * ошибка, добавляет её в лог.
			 * @protected
			 */
			onFileComplete: function(error, xhr, file, options) {
				if (!error) {
					this.loadGridDataRecord(options.data.fileId);
				} else {
					this.onFileCompleteError(error, file);
				}
			},

			/**
			 * Добавляет запись с информацией о названии файла и ошибке в лог.
			 * @private
			 * @param {String} error Текст ошибки.
			 * @param {Object} file Файл.
			 */
			onFileCompleteError: function(error, file) {
				var errorLog = this.get("FilesUploadErrorLog");
				var errorInfo = this.Ext.String.format("{0} {1}", file.name, error);
				var key = this.Terrasoft.generateGUID();
				errorLog.add(key, errorInfo);
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#onCardSaved
			 * overridden
			 */
			onCardSaved: function() {
				var config = this.get("FileUploadConfig");
				if (!this.Ext.isEmpty(config)) {
					this.Terrasoft.ConfigurationFileApi.upload(config, function() {
						this.set("FileUploadConfig", null);
					});
				}
			},

			/**
			 * Обработчик события нажатия кнопки "Добавить файл".
			 * @private
			 */
			onAddFileClick: Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#onRender
			 * overridden
			 */
			onRender: function() {
				this.callParent(arguments);
				this.initDropzoneEvents();
				var mode = this.get("Mode");
				if (!mode) {
					this.setDefaultMode();
				}
			},

			/**
			 * Инициализирует события "drag" и "drop" контейнера.
			 * @private
			 */
			initDropzoneEvents: function() {
				var dropzone = document.getElementById("DragAndDropContainer");
				if (!dropzone) {
					return;
				}
				this.Terrasoft.ConfigurationFileApi.initDropzoneEvents(dropzone, function(over) {
					if (over) {
						dropzone.classList.add("dropzone-hover");
					} else {
						dropzone.classList.remove("dropzone-hover");
					}
				}, function(files) {
					this.onFileSelect(files);
				}.bind(this));
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#addDetailWizardMenuItems
			 * @overridden
			 */
			addDetailWizardMenuItems: this.Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#addRecordOperationsMenuItems
			 * @overridden
			 */
			addRecordOperationsMenuItems: function(toolsButtonMenu) {
				var linkMenuItem = this.getAddLinkMenuItem();
				if (!this.Ext.isEmpty(linkMenuItem)) {
					toolsButtonMenu.addItem(linkMenuItem);
					toolsButtonMenu.addItem(this.getButtonMenuSeparator());
				}
				this.callParent(arguments);
			},

			/**
			 * Добавляет элементы в коллекцию выпадающего списка функциональной кнопки.
			 * @param {Terrasoft.core.collections.Collection} toolsButtonMenu Коллекция выпадающего списка.
			 */
			addEntityOperationsMenuItems: function(toolsButtonMenu) {
				var entityLink = this.generateButtonMenuItems();
				if (!this.Ext.isEmpty(entityLink)) {
					this.Terrasoft.each(entityLink, function(item) {
						toolsButtonMenu.insert(item.position, item.key, item.viewModelItem);
					}, this);
				}
			},

			/**
			 * Возвращает элемент выпадающего списка функциональной кнопки, отвечающий за добавление ссылки.
			 * @protected
			 * @virtual
			 * @return {Terrasoft.BaseViewModel} Элемент выпадающего списка функциональной кнопки, отвечающий за добавление
			 * ссылки.
			 */
			getAddLinkMenuItem: function() {
				return this.getButtonMenuItem({
					Caption: {"bindTo": "Resources.Strings.AddLinkCaption"},
					Click: {"bindTo": "addLinkRecord"}
				});
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#getEditRecordMenuItem
			 * @overridden
			 */
			getEditRecordMenuItem: function() {
				var menuItem = this.callParent(arguments);
				menuItem.set("Caption", {"bindTo": "Resources.Strings.ActionChangeSettingsCation"});
				menuItem.set("MarkerValue", {"bindTo": "Resources.Strings.ActionChangeSettingsCation"});
				return menuItem;
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#getGridSettingsMenuItem
			 * @overridden
			 */
			getGridSettingsMenuItem: Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#getGridSortMenuItem
			 * @overridden
			 */
			getGridSortMenuItem: Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.GridUtilities#beforeLoadGridData
			 * @overridden
			 */
			beforeLoadGridData: function() {
				this.set("IsGridDataLoaded", false);
				if (!this.get("isImageManagerDetailView")) {
					this.set("IsGridLoading", true);
				}
				this.set("IsGridEmpty", false);
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#loadGridData
			 * @overridden
			 */
			loadGridData: function() {
				this.Terrasoft.chain(
						function(next) {
							this.updateEntityLinkCache(next, this);
						},
						function(next) {
							this.beforeLoadGridData();
							next();
						},
						function(next) {
							var extensions = this.get("Extensions");
							if (extensions.getCount() > 0) {
								next();
							} else {
								this.loadExtensions(next);
							}
						},
						function() {
							this.loadContainerListData();
						},
						this);
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetail#hideQuickFilterButton
			 * @overridden
			 */
			getHideQuickFilterButton: function() {
				return false;
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetail#getQuickFilterButton
			 * @overridden
			 */
			getShowQuickFilterButton: Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.GridUtilities#getIsCurrentGridRendered
			 * @overridden
			 */
			getIsCurrentGridRendered: function() {
				var currentGrid = this.getCurrentGrid();
				if (!this.get("isImageManagerDetailView")) {
					return this.callParent(arguments);
				} else {
					if (currentGrid) {
						currentGrid.rendered = false;
					}
					return false;
				}
			},

			/**
			 * Возвращает Url изображения расширения файла.
			 * @private
			 * @param {String} id Идентификатор файла.
			 * @return {String} Ссылка на изображение.
			 */
			getExtensionImageUrl: function(id) {
				return this.Terrasoft.ImageUrlBuilder.getUrl({
					source: this.Terrasoft.ImageSources.ENTITY_COLUMN,
					params: {
						schemaName: "FileExtension",
						columnName: "Data",
						primaryColumnValue: id
					}
				});
			},

			/**
			 * Наполняет коллекцию иконок значениями.
			 * @private
			 * @param {Terrasoft.core.collections.Collection} collection Результат выборки из таблицы расширений.
			 * @param {Function} callback Функция обратного вызова.
			 */
			fillExtensionsIcons: function(collection, callback) {
				var extensions = this.get("Extensions");
				this.Terrasoft.SysSettings.querySysSettingsItem("FileDetailDefaultIcon", function(response) {
					var defaultIconUrl = response
							? this.getExtensionImageUrl(response.value)
							: this.Terrasoft.ImageUrlBuilder.getUrl(this.get("Resources.Images.DefaultIcon"));
					var defIconId = this.Terrasoft.generateGUID();
					extensions.add(defIconId, {
						"Extension": "default",
						"Url": defaultIconUrl
					});
					collection.each(function(item) {
						var extensionId = item.get("Id");
						var extensionName = item.get("Name").toLowerCase();
						var extensionUrl = this.getExtensionImageUrl(extensionId);
						if (extensionName !== "default") {
							extensions.add(extensionId, {
								"Extension": extensionName,
								"Url": extensionUrl
							});
						}
					}, this);
					if (callback) {
						callback.call(this);
					}
				}, this);
			},

			/**
			 * Загружает Url иконок расширений файлов.
			 * @private
			 * @param {Function} callback
			 */
			loadExtensions: function(callback) {
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "FileExtension"
				});
				esq.addColumn("Id");
				esq.addColumn("Name");
				esq.getEntityCollection(function(result) {
					if (result.success && result.collection) {
						this.fillExtensionsIcons(result.collection, callback);
					} else {
						if (callback) {
							callback.call(this);
						}
					}
				}, this);
			},

			/**
			 * Возвращает расширение файла.
			 * @private
			 * @param {String} imageName Название изображения.
			 * @return {String} Расширение.
			 */
			getExtensionFromName: function(imageName) {
				return imageName ? imageName.substring(imageName.lastIndexOf(".") + 1, imageName.length) : "";
			},

			/**
			 * Проверяет расширение файла на тип изображения.
			 * @private
			 * @param {String} extension Расширение.
			 * @return {Boolean} Результат (true - не изображение, false - изображение).
			 */
			isFileNotImage: function(extension) {
				return (extension.match(/(jpg|jpeg|png|gif)$/i) === null);
			},

			/**
			 * Инициализирует колонки экземпляра запроса.
			 * @private
			 * @param {Terrasoft.data.queries.EntitySchemaQuery} esq Запрос, в котором будут проинициализированы
			 * колонки.
			 */
			initLoadFilesQueryColumns: function(esq) {
				if (!esq.columns.contains(this.primaryDisplayColumnName)) {
					esq.addColumn(this.primaryDisplayColumnName);
				}
				if (!esq.columns.contains("Type")) {
					esq.addColumn("Type");
				}
			},

			/**
			 * Декорирует элемент свойствами.
			 * @private
			 * @param {Terrasoft.model.BaseViewModel} item Элемент контейнер листа.
			 */
			decorateItem: function(item) {
				var itemName = item.get("Name");
				var itemType = item.get("Type");
				if (!this.get("SelectedRows")) {
					this.set("SelectedRows", []);
				}
				item.columns = this.columns;
				item.detail = this;
				item.isMultiSelect = this.get("MultiSelect");
				item.mode = this.get("Mode");
				if (itemType.value === ConfigurationConstants.FileType.EntityLink) {
					item.set("imageUrl", null);
					return;
				}
				var itemExtension = (itemType.value !== ConfigurationConstants.FileType.Link)
						? this.getExtensionFromName(itemName)
						: "url";
				if (this.isFileNotImage(itemExtension)) {
					var extensionsCollection = this.get("Extensions");
					var extensions = extensionsCollection.getItems();
					var existedExtensions = extensions.filter(function(item) {
						return item.Extension === itemExtension;
					});
					if (existedExtensions.length > 0) {
						item.set("imageUrl", existedExtensions[0].Url);
					} else {
						var defaultExtensions = extensions.filter(function(item) {
							return item.Extension === "default";
						});
						var defaultIconUrl = defaultExtensions[0] ? defaultExtensions[0].Url : null;
						item.set("imageUrl", defaultIconUrl);
					}
				}
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#initQueryColumns
			 * @overridden
			 */
			initQueryColumns: function(esq) {
				this.callParent(arguments);
				this.initLoadFilesQueryColumns(esq);
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#initQueryColumns
			 * @overridden
			 */
			initQuerySorting: function(esq) {
				var createdOnColumn = esq.addColumn("CreatedOn");
				createdOnColumn.orderDirection = this.Terrasoft.OrderDirection.ASC;
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#initQueryFilters
			 * @overridden
			 */
			initQueryFilters: function(esq) {
				var detailColumnName = this.get("DetailColumnName");
				var masterRecordId = this.get("MasterRecordId");
				if (masterRecordId == null) {
					masterRecordId = this.Terrasoft.GUID_EMPTY;
				}
				var filterGroup = this.Ext.create("Terrasoft.FilterGroup");
				filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, detailColumnName, masterRecordId));
				esq.filters.add("entityFilterGroup", filterGroup);
			},

			/**
			 * Загружает коллекцию данных для плиточного представления.
			 * @private
			 */
			loadContainerListData: function() {
				var esq = this.getGridDataESQ();
				this.initQueryColumns(esq);
				this.initQuerySorting(esq);
				this.initQueryFilters(esq);
				this.initQueryOptions(esq);
				this.initQueryEvents(esq);
				var gridData = this.getGridData();
				var recordsCount = gridData.getCount();
				if (recordsCount > this.getRowCount()) {
					esq.rowCount = recordsCount;
				}
				esq.getEntityCollection(function(response) {
					this.destroyQueryEvents(esq);
					this.onGridDataLoaded(response);
				}, this);
			},

			/**
			 * Формирует конфигурацию представления элемента изображения.
			 * @private
			 * @param {Object} itemConfig Ссылка на конфигурацию элемента в ContainerList.
			 */
			getItemViewConfig: function(itemConfig) {
				var itemViewConfig = this.get("ItemViewConfig");
				if (itemViewConfig) {
					itemConfig.config = itemViewConfig;
					return;
				}
				var imagesListItemContainer = this.getImagesListItemContainerConfig();
				itemConfig.config = imagesListItemContainer;
				this.set("ItemViewConfig", imagesListItemContainer);
			},

			/**
			 * Возвращает конфигурацию контейнера элементов.
			 * @private
			 * @return {Object} Конфигурация контейнера элементов.
			 */
			getImagesListItemContainerConfig: function() {
				var imagesListItemContainer =
						ViewUtilities.getContainerConfig("images-list-item-container", ["image-view-class"]);
				var entityImageWrapContainer =
						ViewUtilities.getContainerConfig("entity-image", ["entity-image-class"]);
				var selectEntityContainer =
						ViewUtilities.getContainerConfig("select-entity-container", ["select-entity-container-class"]);
				var checkBoxConfig = {
					className: "Terrasoft.CheckBoxEdit",
					classes: {wrapClass: ["entity-checked-class"]},
					visible: {"bindTo": "getIsMultiSelect"},
					checkedchanged: {"bindTo": "onSelectItem"},
					checked: {"bindTo": "getCheckItems"}
				};
				selectEntityContainer.items.push(checkBoxConfig);
				var imageContainer = ViewUtilities.getContainerConfig("entity-image-container",
						["entity-image-container-class"]);
				var imageViewConfig = {
					className: "Terrasoft.ImageView",
					imageSrc: {"bindTo": "getEntityImage"},
					classes: {wrapClass: ["entity-image-view-class"]},
					click: {"bindTo": "onEntityImageClick"}
				};
				imageContainer.items.push(imageViewConfig);
				var linkContainer = ViewUtilities.getContainerConfig("entity-link-container",
						["entity-link-container-class"]);
				linkContainer.afterrender = {"bindTo": "insertEntityLink"};
				linkContainer.afterrerender = {"bindTo": "insertEntityLink"};
				entityImageWrapContainer.items.push(selectEntityContainer, imageContainer, linkContainer);
				imagesListItemContainer.items.push(entityImageWrapContainer);
				imagesListItemContainer.markerValue = {bindTo: "getEntityText"};
				return imagesListItemContainer;
			},

			/**
			 * Возвращает видимость реестра детали.
			 * @param {Boolean} value видимость представления Image Manager.
			 * @return {Boolean} Видимость реестра детали.
			 */
			getDataGridVisible: function(value) {
				return !value;
			},

			/**
			 * Изменяет режим детали.
			 * @private
			 * @param {String} value Новое значение.
			 */
			changeDetailMode: function(value) {
				var mode = this.get("Mode");
				if (value === mode) {
					return;
				}
				this.set("Mode", value);
				this.deselectRows();
				this.set("isImageManagerDetailView", !this.get("isImageManagerDetailView"));
				this.reloadCollectionData();
			},

			/**
			 * Устанавливает плиточный режим.
			 * @private
			 */
			setTiledMode: function() {
				this.changeDetailMode("tiled");
			},

			/**
			 * Устанавливает списочный режим.
			 * @private
			 */
			setListedMode: function() {
				this.changeDetailMode("listed");
			},

			/**
			 * Устанавливает режим по умолчанию.
			 * @private
			 */
			setDefaultMode: function() {
				this.setTiledMode();
			},

			/**
			 * Обновляет коллекцию данных.
			 * @private
			 * @param {Terrasoft.BaseViewModelCollection} [currentCollection]
			 */
			reloadCollectionData: function(currentCollection) {
				var collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
				var gridDataCollection = this.getGridData();
				collection.loadAll(gridDataCollection);
				if (currentCollection) {
					collection.loadAll(currentCollection);
				}
				gridDataCollection.clear();
				collection.each(this.decorateItem, this);
				gridDataCollection.loadAll(collection);
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#switchGridMode
			 * @overridden
			 */
			switchGridMode: function() {
				this.deselectRows();
				var multiSelect = this.get("MultiSelect");
				this.set("MultiSelect", !multiSelect);
				this.reloadCollectionData();
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#getGridRowViewModelClassName
			 * @overridden
			 */
			getGridRowViewModelClassName: function() {
				return "Terrasoft.ImageListViewModel";
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#getGridRowViewModelConfig
			 * @overridden
			 */
			getGridRowViewModelConfig: function() {
				var config = this.callParent(arguments);
				this.Ext.apply(config, {
					Ext: this.Ext,
					Terrasoft: this.Terrasoft,
					sandbox: this.sandbox
				});
				return config;
			},

			/**
			 * Модификация коллекции данных перед загрузкой в реестр.
			 * @overriden
			 * @param {Terrasoft.core.collections.Collection} collection Коллекция элементов реестра.
			 */
			prepareResponseCollection: function(collection) {
				this.callParent(arguments);
				collection.each(function(item) {
					this.decorateItem(item);
				}, this);
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilities#sortColumn
			 * @overridden
			 */
			sortColumn: Terrasoft.emptyFn,

			/**
			 * Возвращает значение маркера.
			 * @private
			 * @param {String} mode Режим.
			 * @return {String} Значение маркера.
			 */
			getDetailMarkerValue: function(mode) {
				var caption = this.get("Resources.Strings.Caption");
				return this.Ext.String.format("{0} {1}", caption, mode);
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#getEditRecordMenuItem
			 * @overridden
			 */
			getCopyRecordMenuItem: Terrasoft.emptyFn

		},

		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "Detail",
				"values": {
					"markerValue": {
						bindTo: "Mode",
						bindConfig: {
							converter: "getDetailMarkerValue"
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "DragAndDrop Container",
				"parentName": "Detail",
				"propertyName": "items",
				"values": {
					"id": "DragAndDropContainer",
					"selectors": {"wrapEl": "#DragAndDropContainer"},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["dropzone"],
					"items": [
						{
							"labelClass": ["DragAndDropLabel"],
							"itemType": Terrasoft.ViewItemType.LABEL,
							"caption": {"bindTo": "Resources.Strings.DragAndDropCaption"}
						}
					]
				}
			},
			{
				"operation": "merge",
				"name": "DataGrid",
				"values": {
					"type": "listed",
					"visible": {
						"bindTo": "isImageManagerDetailView",
						"bindConfig": {"converter": "getDataGridVisible"}
					},
					"listedConfig": {
						"name": "DataGridListedConfig",
						"items": [
							{
								"name": "NameListedGridColumn",
								"bindTo": "Name",
								"position": {
									"column": 1,
									"colSpan": 18
								},
								"type": Terrasoft.GridCellType.LINK
							},
							{
								"name": "VersionListedGridColumn",
								"bindTo": "Version",
								"position": {
									"column": 19,
									"colSpan": 6
								}
							}
						]
					},
					"tiledConfig": {
						"name": "DataGridTiledConfig",
						"grid": {
							"columns": 24,
							"rows": 3
						},
						"items": [
							{
								"name": "NameTiledGridColumn",
								"bindTo": "Name",
								"position": {
									"row": 1,
									"column": 1,
									"colSpan": 24
								},
								"type": Terrasoft.GridCellType.LINK
							},
							{
								"name": "ModifiedByTiledGridColumn",
								"bindTo": "ModifiedBy",
								"position": {
									"row": 1,
									"column": 25,
									"colSpan": 12
								}
							},
							{
								"name": "VersionTiledGridColumn",
								"bindTo": "Version",
								"position": {
									"row": 1,
									"column": 27,
									"colSpan": 12
								}
							},
							{
								"name": "ModifiedOnTiledGridColumn",
								"bindTo": "ModifiedOn",
								"position": {
									"row": 1,
									"column": 39,
									"colSpan": 12
								}
							},
							{
								"name": "SizeTiledGridColumn",
								"bindTo": "Size",
								"position": {
									"row": 1,
									"column": 51,
									"colSpan": 12
								}
							}
						]
					},
					"linkClick": {"bindTo": "linkClicked"}
				}
			},
			{
				"operation": "merge",
				"name": "AddRecordButton",
				"parentName": "Detail",
				"propertyName": "tools",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.AddFileCaption"},
					"tag": "addFileButton",
					"fileUpload": true,
					"filesSelected": {"bindTo": "onFileSelect"},
					"click": {"bindTo": "onAddFileClick"},
					"visible": {"bindTo": "getToolsVisible"}
				}
			},
			{
				"operation": "insert",
				"parentName": "Detail",
				"name": "ImageManagerContainer",
				"propertyName": "items",
				"index": 1,
				"values": {
					"generator": "ImageListConfigurationGenerator.generateContainerList",
					"idProperty": "Id",
					"collection": "Collection",
					"observableRowNumber": 100,
					"wrapClassName": ["images-list-class"],
					"onGetItemConfig": "getItemViewConfig",
					"visible": "isImageManagerDetailView"
				}
			},
			{
				"operation": "insert",
				"name": "SetListedModeButton",
				"parentName": "Detail",
				"propertyName": "tools",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.BUTTON,
					"click": {"bindTo": "setListedMode"},
					"visible": {"bindTo": "getToolsVisible"},
					"controlConfig": {
						"imageConfig": {"bindTo": "Resources.Images.ListedViewIcon"}
					},
					"classes": {"wrapperClass": ["listed-mode-button"]},
					"markerValue": "listed"
				}
			},
			{
				"operation": "insert",
				"name": "SetTiledModeButton",
				"parentName": "Detail",
				"propertyName": "tools",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.BUTTON,
					"click": {"bindTo": "setTiledMode"},
					"visible": {"bindTo": "getToolsVisible"},
					"controlConfig": {
						"imageConfig": {"bindTo": "Resources.Images.TiledViewIcon"}
					},
					"classes": {"wrapperClass": ["tiled-mode-button", "disable-left-margin"]},
					"markerValue": "tiled"
				}
			},
			{
				"operation": "remove",
				"name": "FiltersContainer"
			}
		]
		/**SCHEMA_DIFF*/
	};
});
