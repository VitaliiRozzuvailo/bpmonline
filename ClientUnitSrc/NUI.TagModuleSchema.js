define("TagModuleSchema", ["terrasoft", "TagModuleSchemaResources", "RightUtilities", "ModalBox", "MaskHelper",
		"TagConstantsV2", "ViewUtilities", "LookupQuickAddMixin", "TagItemViewModel", "TagModuleSchemaHelper",
		"css!TagModuleSchemaStyles"],
	function(Terrasoft, resources, RightUtilities, ModalBox, MaskHelper, TagConstants) {
		return {
			mixins: {
				LookupQuickAddMixin: "Terrasoft.LookupQuickAddMixin",
				TagModuleSchemaHelper: "Terrasoft.TagModuleSchemaHelper"
			},
			attributes: {
				/**
				 * Идентификатор записи раздела, которая тегируется
				 */
				"RecordId": {
					"dataValueType": this.Terrasoft.DataValueType.GUID,
					"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Название объекта тегов раздела
				 */
				"TagSchemaName": {
					"dataValueType": this.Terrasoft.DataValueType.TEXT,
					"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Значение выбранного тега в поле поиска тегов
				 */
				"EntityTagValue": {
					"dataValueType": this.Terrasoft.DataValueType.LOOKUP,
					"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isLookup: true
				},
				/**
				 * Заголовок объекта тегов в записи раздела
				 */
				"InTagSchemaName": {
					"dataValueType": this.Terrasoft.DataValueType.TEXT,
					"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Список тегов раздела
				 */
				"TagList": {
					"dataValueType": this.Terrasoft.DataValueType.COLLECTION,
					"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Список тегов записи раздела
				 */
				"InTagList": {
					"dataValueType": this.Terrasoft.DataValueType.COLLECTION,
					"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Право управлять корпоративными тегами
				 */
				"CanManageCorporateTags": {
					"dataValueType": this.Terrasoft.DataValueType.BOOLEAN,
					"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Право управлять публичными тегами
				 */
				"CanManagePublicTags": {
					"dataValueType": this.Terrasoft.DataValueType.BOOLEAN,
					"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}
			},
			messages: {
				"TagChanged": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			methods: {

				/**
				 * Инициализирует начальные значения модели.
				 * @protected
				 * @virtual
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.initCanManageCorporateAndPublicTags();
						this.initCollections();
						this.loadExistingTags();
						if (callback) {
							callback.call(scope || this);
						}
					}, this]);
				},

				/**
				 * Дополнительная обработка после рендеринга модуля.
				 * @protected
				 * @virtual
				 */
				onRender: function() {
					this.callParent(arguments);
					ModalBox.updateSizeByContent();
					this.set("IsTagInputVisible", true);
				},

				/**
				 * Загружает список существующих тегов по записи.
				 * @protected
				 */
				loadExistingTags: function() {
					var recordId = this.get("RecordId");
					var entityInTagSchemaName = this.get("InTagSchemaName");
					if (!this.Ext.isEmpty(recordId) && !this.Ext.isEmpty(entityInTagSchemaName)) {
						var entityInTagItemsCollection = this.get("InTagList");
						var esq = this.getEntityInTagQuery(entityInTagSchemaName);
						var tagTypesFilter = this.getTagTypesFilter("Tag.");
						this.addPublicTagFilter(tagTypesFilter, "Tag.");
						var filterGroup = this.Ext.create("Terrasoft.FilterGroup");
						filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
							"Entity", recordId));
						filterGroup.addItem(tagTypesFilter);
						esq.filters.add(filterGroup);
						esq.getEntityCollection(function(result) {
							if (!result.success) {
								return;
							}
							var viewModelCollection = result.collection;
							if (!viewModelCollection.isEmpty()) {
								viewModelCollection.each(function(item) {
									var itemId = item.get("Id");
									var newItem = this.getTagItem(item, this.get("RecordId"),
										this.get("InTagSchemaName"));
									this.subscribeModelEvents(newItem);
									entityInTagItemsCollection.add(itemId, newItem);
								}, this);
								ModalBox.updateSizeByContent();
							}
						}, this);
					}
				},

				/**
				 * Возвращает название схемы справочного поля.
				 * @protected
				 * @overridden
				 * @param {Object} args Параметры.
				 * @param {String} columnName Название колонки.
				 * @return {Object|null} Название схемы справочного поля.
				 */
				getLookupEntitySchemaName: function() {
					return this.get("TagSchemaName");
				},

				/**
				 * Устанавливает выбранное в справочнике значение в соответствующее поле модели.
				 * @protected
				 * @virtual
				 * @param {Object} args Аргументы.
				 */
				onLookupResult: function(args) {
					var columnName = args.columnName;
					var selectedRows = args.selectedRows;
					if (!selectedRows.isEmpty()) {
						this.set(columnName, selectedRows.getByIndex(0));
					}
				},

				/**
				 * Формирует фильтр для выбора тега.
				 * @protected
				 * @param {string} columnName название колонки
				 * @return {Terrasoft.FilterGroup}
				 */
				getLookupQueryFilters: function(columnName) {
					var filterGroup = this.Ext.create("Terrasoft.FilterGroup");
					var column = this.columns[columnName];
					var lookupListConfig = column.lookupListConfig;
					if (lookupListConfig) {
						var filterArray = lookupListConfig.filters;
						this.Terrasoft.each(filterArray, function(item) {
							var filter;
							if (this.Ext.isObject(item) && this.Ext.isFunction(item.method)) {
								filter = item.method.call(this, item.argument);
							}
							if (this.Ext.isFunction(item)) {
								filter = item.call(this);
							}
							if (this.Ext.isEmpty(filter)) {
								throw new this.Terrasoft.InvalidFormatException({
									message: this.Ext.String.format(
										this.get("Resources.Strings.ColumnFilterInvalidFormatException"), columnName)
								});
							}
							filterGroup.addItem(filter);
						}, this);
						if (lookupListConfig.filter) {
							var filterItem = lookupListConfig.filter.call(this);
							if (filterItem) {
								filterGroup.addItem(filterItem);
							}
						}
					}
					return filterGroup;
				},

				/**
				 * Выполняет инициализацию коллекций.
				 * @protected
				 */
				initCollections: function() {
					this.initCollection("InTagList");
					this.initCollection("TagList");
				},

				/**
				 * Формирует коллекцию тегов раздела для выбора
				 * @protected
				 * @param {string} filter введенное в лукапное поле значение для поиска
				 * @param {Terrasoft.Collection} list коллекция загружаемых в лукапное поле значений
				 * @param {string} columnName название колонки
				 */
				prepareTagList: function(filter, list, columnName) {
					if (this.Ext.isEmpty(list)) {
						return;
					}
					list.clear();
					var entityTagSchemaName = this.get("TagSchemaName");
					if (this.Ext.isEmpty(entityTagSchemaName)) {
						throw new this.Terrasoft.NullOrEmptyException({
							message: resources.localizableStrings.EntityTagSchemaIsEmptyMessage
						});
					} else {
						var esq = this.getEntityTagQuery(entityTagSchemaName);
						filter = filter.trim();
						var filterGroup = this.Terrasoft.createFilterGroup();
						var lookupFilter = esq.createPrimaryDisplayColumnFilterWithParameter(
							this.Terrasoft.SysSettings.lookupFilterType, filter, this.Terrasoft.DataValueType.TEXT);
						filterGroup.addItem(lookupFilter);
						var tagTypesFilterGroup = this.getTagTypesFilter();
						if (this.Terrasoft.CurrentUser.userType !== this.Terrasoft.UserType.SSP) {
							this.addPublicTagFilter(tagTypesFilterGroup);
						}
						filterGroup.addItem(tagTypesFilterGroup);
						esq.filters.add(filterGroup);
						esq.getEntityCollection(function(result) {
							if (!result.success) {
								return;
							}
							var viewModelCollection = result.collection;
							var objects = {};
							if (!viewModelCollection.isEmpty()) {
								viewModelCollection.each(function(item) {
									var itemId = item.get("value");
									var itemName = item.get("displayValue");
									var itemTypeId = item.get("Type").value;
									var imageConfig = this.getImageConfigForExistsRecord(itemTypeId);
									if (!list.contains(itemId)) {
										objects[itemId] = {
											value: itemId,
											displayValue: itemName,
											imageConfig: imageConfig,
											TagTypeId: itemTypeId
										};
									}
								}, this);
							}
							var config = {
								collection: viewModelCollection,
								filterValue: filter,
								objects: objects,
								columnName: columnName,
								isLookupEdit: true
							};
							this.onLookupDataLoaded(config);
							list.loadAll(objects);
						}, this);
					}
				},

				/**
				 * Инициализирует коллекцию с указанным именем.
				 * @private
				 * @param {string} collectionName имя коллекции
				 */
				initCollection: function(collectionName) {
					var collection = this.Ext.create("Terrasoft.Collection");
					this.set(collectionName, collection);
				},

				/**
				 * Добавляет запись в справочный объект(или открывает карточку для добавления)
				 * если есть права на добавление.
				 * @protected
				 * @overridden
				 * @param {String} searchValue Введенный текст.
				 * @param {String} columnName Имя поля.
				 * @param {Object} additionalColumns дополнительные колонки
				 */
				tryCreateEntityOrOpenCard: function(searchValue, columnName, additionalColumns) {
					MaskHelper.ShowBodyMask();
					var refSchemaName = this.getLookupEntitySchemaName({}, columnName);
					var canAdd = this.tryGetValueFromLookupInfoCache(refSchemaName + "Schema", "canAdd");
					var currentEntitySchema = this.tryGetValueFromLookupInfoCache(refSchemaName + "Schema", "entitySchema");
					var entitySchema = currentEntitySchema.success ? currentEntitySchema.value : {};
					if (!canAdd.success) {
						var checkCanAddCallback = function() {
							this.tryCreateEntityOrOpenCard(searchValue, columnName, additionalColumns);
						};
						this.checkCanAddToLookupSchema(refSchemaName, checkCanAddCallback);
					} else if (canAdd.success) {
						var createEntityConfig = {
							entitySchema: entitySchema,
							columnName: columnName,
							displayColumnValue: searchValue,
							valuePairsFromFilters: new this.Terrasoft.Collection(),
							additionalColumns: additionalColumns
						};
						this.createEntitySilently(createEntityConfig);
					}
				},

				/**
				 * Создает запись в объекте, заполняя колонку для отображения, без открытия карточки.
				 * @protected
				 * @overridden
				 * @param {Object} config Объект с параметрами
				 * @param {String} config.entitySchema Объект справочного поля.
				 * @param {String} config.columnName Название колонки в которую нужно установить добавленное значение.
				 * @param {String} config.displayColumnValue Значения колонки для отображения новой записи.
				 * @param {String} config.valuePairsFromFilters Значения на основании фильтров поля.
				 * @param {Object} config.additionalColumns дополнительные колонки для заполнения
				 */
				createEntitySilently: function(config) {
					var primaryColumnValue = Terrasoft.generateGUID();
					config.primaryColumnValue = primaryColumnValue;
					var insert = this.getInsertQueryForLookupEntity(config);
					insert.setParameterValue("Type", config.additionalColumns.TagTypeId, Terrasoft.DataValueType.GUID);
					insert.execute(function(result) {
						MaskHelper.HideBodyMask();
						if (result.success) {
							var resultCollection = new Terrasoft.Collection();
							var resObj = {
								value: primaryColumnValue,
								displayValue: config.displayColumnValue,
								TagTypeId: config.additionalColumns.TagTypeId,
								imageConfig: this.getImageConfigForExistsRecord(config.additionalColumns.TagTypeId)
							};
							resultCollection.add(resObj);
							this.onLookupResult({columnName: config.columnName, selectedRows: resultCollection});
						} else if (result.errorInfo) {
							this.set(config.columnName, null);
							this.showInformationDialog(result.errorInfo.message);
						}
					}, this);
				},

				/**
				 * Выполняет проверку наличия прав на операции управления корпоративными и публичными тегами.
				 * @private
				 */
				initCanManageCorporateAndPublicTags: function() {
					var operations = ["CanManageCorporateTags", "CanManagePublicTags"];
					RightUtilities.checkCanExecuteOperations(operations, function(result) {
						this.Terrasoft.each(result, function(operationRight, operationName) {
							this.set(operationName, operationRight);
						}, this);
					}, this);
				},

				/**
				 * Возвращает модифицированную конфигурацию записи.
				 * @protected
				 * @param {Object} itemConfig конфигурация элемента
				 * @param {Terrasoft.BaseViewModel} item запись элемент коллекции
				 */
				getItemViewConfig: function(itemConfig, item) {
					var tagItemConfig = {
						Id: item.get("Id"),
						Caption: item.get("Caption"),
						TagTypeId: item.get("TagTypeId"),
						ImageConfig: resources.localizableImages.RemoveTagFromEntityIcon
					};
					itemConfig.config = this.getTagItemViewConfig(tagItemConfig);
				},

				/**
				 * Добавляет в выпадающий список для lookup елемент "Создать %введенное_значение%".
				 * @overridden
				 * @param {Object} config
				 * @param {Terrasoft.Collection} collection Найденные значения для наполения справочника.
				 * @param {String} filterValue Фильтр для primaryDisplayColumn.
				 * @param {Object} objects Словарь который будет загружен в list.
				 * @param {String} columnName Имя колонки ViewModel.
				 * @param {Boolean} isLookupEdit lookup или combobox.
				 */
				onLookupDataLoaded: function(config) {
					if (config.isLookupEdit && !this.Ext.isEmpty(config.filterValue.trim())) {
						this.setValueToLookupInfoCache(config.columnName, "filterValue", config.filterValue);
						this.setValueToLookupInfoCache("TagType", "Private", TagConstants.TagType.Private);
						config.objects[TagConstants.TagType.Private] =
							this.getNewListItemConfig(config.filterValue, TagConstants.TagType.Private);
						if (this.get("CanManageCorporateTags")) {
							this.setValueToLookupInfoCache("TagType", "Corporate", TagConstants.TagType.Corporate);
							config.objects[TagConstants.TagType.Corporate] =
								this.getNewListItemConfig(config.filterValue, TagConstants.TagType.Corporate);
						}
						if (this.get("CanManagePublicTags")) {
							this.setValueToLookupInfoCache("TagType", "Public", TagConstants.TagType.Public);
							config.objects[TagConstants.TagType.Public] =
								this.getNewListItemConfig(config.filterValue, TagConstants.TagType.Public);
						}
					}
				},

				/**
				 * Формирует элемент для создания новой записи в выпадающем списке.
				 * @private
				 * @param {string} value искомое значение
				 * @param {string} typeId тип тега
				 * @return {object} конфиг нового элемента выпадаюшего списка
				 */
				getNewListItemConfig: function(value, typeId) {
					var newValText = null;
					switch (typeId) {
						case TagConstants.TagType.Private:
							newValText = this.Ext.String.format(resources.localizableStrings.AddNewPrivateTagCaption, value);
							return {
								value: TagConstants.TagType.Private,
								displayValue: newValText,
								imageConfig: resources.localizableImages.CreateNewPrivateTagIcon,
								TagTypeId: typeId,
								customHtml: "<div id=\"menu-separator-header\" class=\"menu-separator-create-new-tag\"></div>" +
								"<div data-value=\"" +
								TagConstants.TagType.Private + "\" class=\"listview-new-item\" data-item-marker=\"" +
								newValText + "\">" + newValText + "</div>"
							};
						case TagConstants.TagType.Corporate:
							newValText = this.Ext.String.format(resources.localizableStrings.AddNewCorporateTagCaption, value);
							return {
								value: TagConstants.TagType.Corporate,
								displayValue: newValText,
								imageConfig: resources.localizableImages.CreateNewCorporateTagIcon,
								TagTypeId: typeId,
								customHtml: "<div data-value=\"" +
								TagConstants.TagType.Corporate + "\" class=\"listview-new-item\" data-item-marker=\"" +
								newValText + "\">" + newValText + "</div>"
							};
						case TagConstants.TagType.Public:
							newValText = this.Ext.String.format(resources.localizableStrings.AddNewPublicTagCaption, value);
							return {
								value: TagConstants.TagType.Public,
								displayValue: newValText,
								imageConfig: resources.localizableImages.CreateNewPublicTagIcon,
								TagTypeId: typeId,
								customHtml: "<div data-value=\"" +
								TagConstants.TagType.Public + "\" class=\"listview-new-item\" data-item-marker=\"" +
								newValText + "\">" + newValText + "</div>"
							};
						default:
							newValText = this.Ext.String.format(resources.localizableStrings.TipMessageTemplate, value);
							return {
								value: this.Terrasoft.GUID_EMPTY,
								displayValue: newValText,
								TagTypeId: typeId,
								customHtml: "<div data-value=\"" +
								this.Terrasoft.GUID_EMPTY + "\" class=\"listview-new-item\">" + newValText + "</div>"
							};
					}
				},

				/**
				 * При выборе значения "Создать ..." в LookupEdit - пытается создать новую запись или
				 * открывает карточку редактирования.
				 * @overriden
				 */
				onLookupChange: function(newValue, columnName) {
					this.callParent(arguments);
					var filterValue = this.tryGetValueFromLookupInfoCache(columnName, "filterValue");
					if (newValue && newValue.value && ((newValue.value === TagConstants.TagType.Private) ||
						(newValue.value === TagConstants.TagType.Corporate) ||
						(newValue.value === TagConstants.TagType.Public)) && !this.get(columnName) &&
						filterValue.success && !this.Ext.isEmpty(filterValue.value) && newValue.TagTypeId) {
						this.tryCreateEntityOrOpenCard(filterValue.value.trim(), columnName,
							{TagTypeId: newValue.TagTypeId});
						this.setValueToLookupInfoCache(columnName, "filterValue", null);
					} else if (!this.Ext.isEmpty(newValue)) {
						this.addNewTagInEntity(newValue);
					}
				},

				/**
				 * Добавляет новый тег к записи.
				 * @protected
				 * @overridden
				 * @param {Object} args Параметры.
				 * @param {Object} columnName Имя поля.
				 */
				loadEntityTagVocabulary: function(args, columnName) {
					var selectedTag = this.get(columnName);
					if (!this.Ext.isEmpty(selectedTag)) {
						this.addNewTagInEntity(selectedTag);
					} else if (args && !this.Ext.isEmpty(args.searchValue.trim())) {
						this.tryFindOrCreateNewTag(args.searchValue, columnName);
					}
				},

				/**
				 * Выполняет поиск тегов по коллекции или создает новый тег.
				 * @private
				 * @param {string} searchValue название тега
				 * @param {string} columnName название колонки
				 */
				tryFindOrCreateNewTag: function(searchValue, columnName) {
					var entityTagList = this.get("TagList");
					var foundedItem = null;
					if (!this.Ext.isEmpty(entityTagList) && !this.Ext.isEmpty(searchValue)) {
						entityTagList.each(function(item) {
							if (item.displayValue && item.displayValue === searchValue &&
								item.displayValue !== item.value && foundedItem === null) {
								foundedItem = item;
								return false;
							}
						}, this);
						if (foundedItem !== null) {
							var isExisting = this.isExistSameTag(foundedItem.displayValue, foundedItem.TagTypeId);
							if (!isExisting.isExistsInEntityInTagList) {
								this.set("EntityTagValue", foundedItem);
							} else {
								this.set("EntityTagValue", null);
							}
						} else {
							this.tryCreateEntityOrOpenCard(searchValue.trim(), columnName,
								{TagTypeId: TagConstants.TagType.Private});
						}
					}
				},

				/**
				 * Проверяет существование тега в списке досупных тегов.
				 * @virtual
				 * @param {string} searchValue имя тега
				 * @param {string} typeTag тип тега
				 */
				isExistSameTag: function(searchValue, typeTag) {
					var result = {
						isExistsInEntityTagList: false,
						isExistsInEntityInTagList: false
					};
					if (!this.Ext.isEmpty(searchValue)) {
						var tagList = this.get("TagList");
						if (!this.Ext.isEmpty(tagList)) {
							tagList.each(function(item) {
								if (item.displayValue === searchValue && item.TagTypeId !== item.value &&
									item.TagTypeId === typeTag) {
									result.isExistsInEntityTagList = true;
									return false;
								}
							}, this);
						}
						var inTagList = this.get("InTagList");
						if (!this.Ext.isEmpty(inTagList)) {
							inTagList.each(function(item) {
								if (item.values.Caption === searchValue && item.values.TagTypeId === typeTag) {
									result.isExistsInEntityInTagList = true;
									return false;
								}
							}, this);
						}
					}
					return result;
				},
				/**
				 * Добавляет новый тег к записи.
				 * @protected
				 * @param {object} selectedTag выбранный тег
				 */
				addNewTagInEntity: function(selectedTag) {
					var isAlreadyExists = this.isExistSameTag(selectedTag.displayValue, selectedTag.TagTypeId);
					if (!isAlreadyExists.isExistsInEntityInTagList) {
						var insertQuery = this.Ext.create("Terrasoft.InsertQuery", {
							rootSchemaName: this.get("InTagSchemaName")
						});
						var newGuid = this.Terrasoft.generateGUID();
						insertQuery.setParameterValue("Id", newGuid, this.Terrasoft.DataValueType.GUID);
						insertQuery.setParameterValue("Tag", selectedTag.value, this.Terrasoft.DataValueType.GUID);
						insertQuery.setParameterValue("Entity", this.get("RecordId"), this.Terrasoft.DataValueType.GUID);
						insertQuery.execute(function() {
							var tagsCollection = this.get("InTagList");
							var newItem = this.getNewTagItem(newGuid, selectedTag, this.get("RecordId"),
								this.get("InTagSchemaName"));
							this.subscribeModelEvents(newItem);
							tagsCollection.add(newGuid, newItem);
							this.set("EntityTagValue", null);
							this.sandbox.publish("TagChanged", this.get("RecordId"), [this.sandbox.id]);
							ModalBox.updateSizeByContent();
						}, this);
					} else {
						this.set("EntityTagValue", null);
					}
				},

				/**
				 * Обработчик события удаления тега от записи.
				 * @protected
				 * @param {Terrasoft.TagItemViewModel} model viewModel тега
				 */
				onDeleteEntityInTag: function(model) {
					this.unSubscribeModelEvents(model);
					var tagsCollection = this.get("InTagList");
					tagsCollection.remove(model);
					this.sandbox.publish("TagChanged", this.get("RecordId"), [this.sandbox.id]);
					ModalBox.updateSizeByContent();
				},

				/**
				 * Подписка на события элемента тега.
				 * @protected
				 * @param {Terrasoft.TagItemViewModel} model viewModel тега
				 */
				subscribeModelEvents: function(model) {
					model.on("entityInTagDeleted", this.onDeleteEntityInTag, this);
				},

				/**
				 * Отписка от событий элемента тега.
				 * @protected
				 * @param {Terrasoft.TagItemViewModel} model viewModel тега
				 */
				unSubscribeModelEvents: function(model) {
					model.un("entityInTagDeleted", this.onDeleteEntityInTag, this);
				},

				/**
				 * Обработчик кнопки закрыть.
				 * @protected
				 */
				onCloseButtonClick: function() {
					ModalBox.close();
				}
			},
			diff: [
				{
					"operation": "insert",
					"name": "EntityTagsContainer",
					"propertyName": "items",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.CONTAINER,
						"classes": {
							"wrapClassName": ["general-tag-content-container"]
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "TagsHeaderContainer",
					"parentName": "EntityTagsContainer",
					"propertyName": "items",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.CONTAINER,
						"visible": true,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "TagsHeaderLabel",
					"parentName": "TagsHeaderContainer",
					"propertyName": "items",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.LABEL,
						"classes": {
							"labelClass": ["tags-header-label"]
						},
						"caption": {"bindTo": "Resources.Strings.TagsHeaderLabelCaption"},
						"visible": true
					}
				},
				{
					"operation": "insert",
					"name": "CloseTagModuleButton",
					"parentName": "TagsHeaderContainer",
					"propertyName": "items",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.BUTTON,
						"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"click": {"bindTo": "onCloseButtonClick"},
						"classes": {"wrapperClass": ["close-tag-button"]},
						"imageConfig": {"bindTo": "Resources.Images.CloseIcon"},
						"visible": true
					}
				},
				{
					"operation": "insert",
					"name": "TagSelectionContainer",
					"parentName": "EntityTagsContainer",
					"propertyName": "items",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.CONTAINER,
						"visible": true,
						"classes": {
							"wrapClassName": ["outer-tag-selection-container"]
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "TagSelectionEditContainer",
					"parentName": "TagSelectionContainer",
					"propertyName": "items",
					"values": {
						"generateId": false,
						"itemType": this.Terrasoft.ViewItemType.CONTAINER,
						"classes": {
							"wrapClassName": ["tag-selection-control"]
						},
						"visible": true,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "EntityTagValue",
					"parentName": "TagSelectionEditContainer",
					"propertyName": "items",
					"values": {
						"bindTo": "EntityTagValue",
						"contentType": this.Terrasoft.ContentType.LOOKUP,
						"labelConfig": {"visible": false},
						"hasClearIcon": false,
						"enableRightIcon": true,
						"rightIconConfig": resources.localizableImages.LookupRightIcon,
						"controlConfig": {
							"placeholder": {"bindTo": "Resources.Strings.PlaceholderText"},
							"classes": ["placeholderOpacity"],
							"list": {"bindTo": "TagList"},
							"prepareList": {"bindTo": "prepareTagList"},
							"loadVocabulary": {"bindTo": "loadEntityTagVocabulary"}
						},
						"minSearchCharsCount": 1,
						"searchDelay": 50,
						"focused": {
							"bindTo": "IsTagInputVisible"
						}
					}
				},
				{
					"operation": "insert",
					"name": "CurrentEntityTagsContainer",
					"parentName": "EntityTagsContainer",
					"propertyName": "items",
					"values": {
						"generator": "ConfigurationItemGenerator.generateContainerList",
						"idProperty": "Id",
						"collection": "InTagList",
						"dataItemIdPrefix": "entity-in-tag-item",
						"observableRowNumber": 1,
						"maskVisible": false,
						"onGetItemConfig": "getItemViewConfig",
						"classes": {
							"wrapClassName": ["entity-tags-container-list"]
						},
						"isAsync": false
					}
				}
			]
		};
	});