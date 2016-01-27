define("MobilePageDesignerModule", ["ext-base", "MobilePageDesignerModuleResources", "PageDesignerUtilities",
	"MobileBaseDesignerModule", "PageDesignerUtilities", "MobileRecordDesignerSettings"],
	function(Ext, resources, PageDesignerUtilities) {

		/**
		 * @class Terrasoft.configuration.MobilePageDesignerViewConfig
		 * Класс, генерурующий конфигурацию представления для модуля дизайнера страницы.
		 */
		Ext.define("Terrasoft.configuration.MobilePageDesignerViewConfig", {
			extend: "Terrasoft.MobileBaseDesignerViewConfig",
			alternateClassName: "Terrasoft.MobilePageDesignerViewConfig",

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewConfig#generate
			 * @overridden
			 */
			generate: function() {
				var viewConfig = this.callParent(arguments);
				viewConfig.push({
					name: "AddButton",
					itemType: Terrasoft.ViewItemType.BUTTON,
					caption: { "bindTo": "Resources.Strings.AddButtonCaption" },
					style: Terrasoft.controls.ButtonEnums.style.BLUE,
					menu: [
						{
							caption: { "bindTo": "Resources.Strings.AddColumnSetButtonCaption" },
							click: { "bindTo": "onAddColumnSetButtonClick" }
						},
						{
							caption: { "bindTo": "Resources.Strings.AddEmbeddedDetailButtonCaption" },
							click: { "bindTo": "onAddEmbeddedDetailButtonClick" }
						}
					]
				});
				return viewConfig;
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewConfig#getDesignerItemsView
			 * @overridden
			 */
			getDesignerItemsView: function() {
				var designerSettings = this.designerSettings;
				var columnSets = designerSettings.columnSets;
				var result = [];
				for (var i = 0, ln = columnSets.length; i < ln; i++) {
					var columnSet = columnSets[i];
					var columnSetViewConfig = this.getColumnSetViewConfig(columnSet);
					result.push(columnSetViewConfig);
				}
				return result;
			},

			/**
			 * Возвращает конфигурацию представления элемента группы колонок.
			 * @protected
			 * @virtual
			 * @param {Object} config Конфигурационный объект группы колонок.
			 * @returns {Object} Конфигурация представления группы колонок.
			 */
			getColumnSetViewConfig: function(config) {
				var viewConfig = {
					name: config.name,
					itemType: Terrasoft.ViewItemType.CONTROL_GROUP,
					items: this.getGridLayoutEditItemsViewConfig(config),
					useOrderTools: true
				};
				var caption = this.getCaptionByName(config.caption);
				if (config.name === "primaryColumnSet") {
					viewConfig.disableTools = true;
				} else {
					var prefix = config.isDetail
						? resources.localizableStrings.DetailPrefixControlGroupCaption
						: resources.localizableStrings.GroupPrefixControlGroupCaption;
					caption = prefix + " " + caption;
				}
				viewConfig.caption = caption;
				return viewConfig;
			}

		});

		/**
		 * @class Terrasoft.configuration.MobilePageDesignerViewModel
		 * Класс модели представления модуля дизайнера страницы.
		 */
		Ext.define("Terrasoft.configuration.MobilePageDesignerViewModel", {
			extend: "Terrasoft.MobileBaseDesignerViewModel",
			alternateClassName: "Terrasoft.MobilePageDesignerViewModel",

			/**
			 * @private
			 */
			isColumnSetExist: function(name) {
				var foundColumnSetItem = this.designerSettings.findColumnSetItemByName(name);
				if (foundColumnSetItem) {
					var message = this.get("Resources.Strings.ColumnSetIsAlreadyExistMessage");
					this.showInformation(message);
					return true;
				}
				return false;
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#constructor
			 * @overridden
			 */
			constructor: function() {
				this.callParent(arguments);
				this.initResourcesValues(resources);
			},

			/**
			 * Обрабатывает нажатие кнопки добавления группы колонок
			 * @protected
			 * @virtual
			 */
			onAddColumnSetButtonClick: function() {
				this.showColumnSetInputBox({
					callback: this.addColumnSetInputBoxCallback
				});
			},

			/**
			 * Обрабатывает нажатие кнопки настройки группы колонок
			 * @protected
			 * @virtual
			 * @param {Object} columnSetItem Конфигурационный объект группы колонок.
			 */
			onConfigureColumnSetButtonClick: function(columnSetItem) {
				this.showColumnSetInputBox({
					callback: Ext.bind(this.configureColumnSetInputBoxCallback, this, [columnSetItem], true),
					caption: this.designerSettings.getLocalizableStringByKey(columnSetItem.caption),
					name: columnSetItem.name
				});
			},

			/**
			 * Обрабатывает нажатие кнопки добавления встроенной детали
			 * @protected
			 * @virtual
			 */
			onAddEmbeddedDetailButtonClick: function() {
				PageDesignerUtilities.showEditDetailWindow(this, this.addEmbeddedDetailWindowCallback, null,
					{isCaptionEditable: true});
			},

			/**
			 * Обрабатывает нажатие кнопки настройки встроенной детали.
			 * @protected
			 * @virtual
			 * @param {Object} columnSetItem Конфигурационный объект встроенной детали.
			 */
			onConfigureEmbeddedDetailButtonClick: function(columnSetItem) {
				var detailCaption = this.designerSettings.getLocalizableStringByKey(columnSetItem.caption);
				var editDetailConfig = {
					detailSchemaName: columnSetItem.detailSchemaName,
					entitySchemaName: columnSetItem.entitySchemaName,
					detailColumn: columnSetItem.filter.detailColumn,
					masterColumn: columnSetItem.filter.masterColumn,
					detailCaption: detailCaption
				};
				var me = this;
				PageDesignerUtilities.showEditDetailWindow(this, function(windowDetailConfig) {
					me.editEmbeddedDetailWindowCallback(windowDetailConfig, columnSetItem);
				}, editDetailConfig, {isCaptionEditable: true});
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#onAddGridLayoutItemButtonClick
			 * @overridden
			 */
			onAddGridLayoutItemButtonClick: function() {
				var tag = arguments[3];
				var columnSetItem = this.designerSettings.findColumnSetItemByName(tag);
				this.openStructureExplorer({
					entitySchemaName: columnSetItem.entitySchemaName,
					callback: Ext.bind(this.gridLayoutItemAddedCallback, this, [columnSetItem], true)
				});
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#onRemoveGridLayoutItemButtonClick
			 * @overridden
			 */
			onRemoveGridLayoutItemButtonClick: function() {
				var tag = arguments[3];
				var columnSetItem = this.designerSettings.findColumnSetItemByName(tag);
				this.removeSelectedItemsFromCollection(columnSetItem.name);
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#onConfigureControlGroupButtonClick
			 * @overridden
			 */
			onConfigureControlGroupButtonClick: function() {
				var columnSetName = arguments[3];
				var columnSetItem = this.designerSettings.findColumnSetItemByName(columnSetName);
				if (columnSetItem.isDetail) {
					this.onConfigureEmbeddedDetailButtonClick(columnSetItem);
				} else {
					this.onConfigureColumnSetButtonClick(columnSetItem);
				}
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#onRemoveControlGroupButtonClick
			 * @overridden
			 */
			onRemoveControlGroupButtonClick: function() {
				var columnSetName = arguments[3];
				var columnSetItem = this.designerSettings.findColumnSetItemByName(columnSetName);
				this.removeColumnSetItem(columnSetItem);
				this.reRender();
			},

			/**
			 * Обрабатывает действие перемещения группы колонок вверх.
			 * @protected
			 * @virtual
			 */
			onMoveUpControlGroupButtonClick: function() {
				var columnSetName = arguments[3];
				this.moveColumnSetItem(columnSetName, -1);
			},

			/**
			 * Обрабатывает действие перемещения группы колонок вниз.
			 * @protected
			 * @virtual
			 */
			onMoveDownControlGroupButtonClick: function() {
				var columnSetName = arguments[3];
				this.moveColumnSetItem(columnSetName, 1);
			},

			/**
			 * Перемещает группу колонок на одну позицию.
			 * @param {Object} columnSetName Имя группы колонок.
			 * @param {Number} offset Смещение элемента.
			 * @protected
			 * @virtual
			 */
			moveColumnSetItem: function(columnSetName, offset) {
				var designerSettings = this.designerSettings;
				var columnSetItem = designerSettings.findColumnSetItemByName(columnSetName);
				var isMoved = designerSettings.moveColumnSetItem(columnSetItem, offset);
				if (isMoved) {
					this.reRender();
				}
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#init
			 * @protected
			 * @overridden
			 */
			init: function(callback, scope) {
				this.generateItemsCollections();
				this.callParent(arguments);
			},

			/**
			 * Генерирует коллекции элементов.
			 * @protected
			 * @virtual
			 */
			generateItemsCollections: function() {
				var columnSets = this.designerSettings.columnSets;
				for (var i = 0, ln = columnSets.length; i < ln; i++) {
					var columnSet = columnSets[i];
					this.generateItemsCollectionBindingData(columnSet.name, columnSet.items);
				}
			},

			/**
			 * Генерирует свойства и методы модели для представления группы колонок.
			 * @protected
			 * @virtual
			 * @param {String} name Имя коллекции.
			 * @param {Object[]} items Элементы коллекции.
			 */
			generateItemsCollectionBindingData: function(name, items) {
				this.generateGridLayoutEditViewBindingData(name, items);
				this.generateControlGroupBindingData(name);
			},

			/**
			 * Обрабатывает результат выбора из окна настройки колонки.
			 * @protected
			 * @virtual
			 * @param {Object} explorerColumnConfig Конфигурация колонки.
			 * @param {Object} columnSetItem Конфигурация группы колонок.
			 */
			gridLayoutItemAddedCallback: function(explorerColumnConfig, columnSetItem) {
				var columnSetName = columnSetItem.name;
				var columnConfig = this.getColumnConfigFromStructureExplorer(explorerColumnConfig);
				var columnItem = this.designerSettings.createColumnItem(columnConfig);
				this.addColumnItemToGridLayoutCollection(columnSetName, columnItem);
			},

			/**
			 * Обрабатывает добавление встроенной детали.
			 * @protected
			 * @virtual
			 * @param {Object} windowDetailConfig Конфигурационный объект детали из окна редактирования детали.
			 */
			addEmbeddedDetailWindowCallback: function(windowDetailConfig) {
				var newEmbeddedDetailItem = this.createEmbeddedDetailItemFromWindowConfig(windowDetailConfig);
				var entitySchemaName = newEmbeddedDetailItem.entitySchemaName;
				var designerSettings = this.designerSettings;
				var foundEmbeddedDetailItem = designerSettings.findColumnSetItemByPropertyName("entitySchemaName",
					entitySchemaName);
				if (foundEmbeddedDetailItem) {
					var message = this.get("Resources.Strings.EmbeddedDetailIsAlreadyExistMessage");
					this.showInformation(message);
					return;
				}
				designerSettings.getEntitySchemaByName(entitySchemaName, function(entitySchema) {
					var items = designerSettings.createDefaultColumnItemsByEntitySchema(entitySchema);
					this.addColumnSetItem(newEmbeddedDetailItem, items);
					this.reRender();
				}, this);
			},

			/**
			 * Обрабатывает редактирование встроенной детали.
			 * @protected
			 * @virtual
			 * @param {Object} windowDetailConfig Конфигурационный объект детали из окна редактирования детали.
			 * @param {Object} embeddedDetailItem Конфигурационный объект детали.
			 */
			editEmbeddedDetailWindowCallback: function(windowDetailConfig, embeddedDetailItem) {
				if (windowDetailConfig.entitySchema !== embeddedDetailItem.entitySchemaName) {
					var message = this.get("Resources.Strings.EmbeddedDetailSchemaNameCanNotBeChanged");
					this.showInformation(message);
					return;
				}
				var newEmbeddedDetailItem = this.createEmbeddedDetailItemFromWindowConfig(windowDetailConfig);
				this.applyColumnSetItem(embeddedDetailItem, newEmbeddedDetailItem);
				this.reRender();
			},

			/**
			 * Обрабатывает добавление из окна группы колонок.
			 * @param {String} name Имя группы колонок.
			 * @param {String} caption Заголовок группы колонок.
			 */
			addColumnSetInputBoxCallback: function(name, caption) {
				var columnSetItem = this.designerSettings.createColumnSetItem({
					name: name,
					caption: caption
				});
				var isColumnSetExist = this.isColumnSetExist(columnSetItem.name);
				if (isColumnSetExist) {
					return;
				}
				this.addColumnSetItem(columnSetItem);
				this.reRender();
			},

			/**
			 * Обрабатывает редактирование из окна группы колонок.
			 * @param {String} name Имя группы колонок.
			 * @param {String} caption Заголовок группы колонок.
			 */
			configureColumnSetInputBoxCallback: function(name, caption, columnSetItem) {
				var newColumnSetItem = this.designerSettings.createColumnSetItem({
					name: name,
					caption: caption
				});
				var newName = newColumnSetItem.name;
				if (newName !== columnSetItem.name && this.isColumnSetExist(newName)) {
					return;
				}
				this.applyColumnSetItem(columnSetItem, newColumnSetItem);
				this.reRender();
			},

			/**
			 * Добавляет группу колонок.
			 * @protected
			 * @virtual
			 * @param columnSetItem Конфигурационный объект группы колонок.
			 */
			addColumnSetItem: function(columnSetItem, items) {
				this.designerSettings.addColumnSetItem(columnSetItem);
				this.generateItemsCollectionBindingData(columnSetItem.name, items);
			},

			/**
			 * Удаляет группу колонок.
			 * @protected
			 * @virtual
			 * @param columnSetItem Конфигурационный объект группы колонок.
			 */
			removeColumnSetItem: function(columnSetItem) {
				this.designerSettings.removeColumnSetItem(columnSetItem);
			},

			/**
			 * Применяет новые значения группе колонок.
			 * @protected
			 * @virtual
			 * @param {Object} columnSetItem Конфигурационный объект группу колонок.
			 * @param {Object} newColumnSetItem Конфигурационный объект новой группы колонок.
			 */
			applyColumnSetItem: function(columnSetItem, newColumnSetItem) {
				if (columnSetItem.name !== newColumnSetItem.name) {
					this.generateItemsCollectionBindingData(newColumnSetItem.name);
					var newCollection = this.getItemsCollectionByName(newColumnSetItem.name);
					var oldCollection = this.getItemsCollectionByName(columnSetItem.name);
					newCollection.loadAll(oldCollection);
				}
				this.designerSettings.applyColumnSetItem(columnSetItem, newColumnSetItem);
			},

			/**
			 * Возвращает конфигурационный объект детали на основании конфига из окна редактирования детали.
			 * @protected
			 * @virtual
			 * @param {Object} windowDetailConfig Конфигурационный объект детали из окна редактирования детали.
			 * @returns {Object} Конфигурационный объект детали.
			 */
			createEmbeddedDetailItemFromWindowConfig: function(windowDetailConfig) {
				return this.designerSettings.createColumnSetItem({
					caption: windowDetailConfig.caption,
					name: windowDetailConfig.name,
					entitySchemaName: windowDetailConfig.entitySchema,
					filter: windowDetailConfig.filter,
					isDetail: true
				});
			},

			/**
			 * Открывает окно настройки группы колонок.
			 * @protected
			 * @virtual
			 * @param {Object} сonfig Конфигурационный объект.
			 */
			showColumnSetInputBox: function(config) {
				var controlConfig = this.getColumnSetInputBoxControlConfig(config.caption, config.name);
				var caption = this.get("Resources.Strings.ColumnSetInputBoxHeader");
				var callback = Ext.bind(this.showColumnSetInputBoxCallback, this, [config.callback], true);
				Terrasoft.showInputBox(caption, callback, ["ok", "cancel"], this, controlConfig, {defaultButton: 0});
			},

			/**
			 * Обрабатывает выбор из окна настройки группы колонок.
			 * @protected
			 * @virtual
			 * @param {Number} buttonCode Код кнопки.
			 * @param {Object} controlData Конфигурационный объект элементов управления.
			 * @param {Function} callback Функция обратного вызова.
			 */
			showColumnSetInputBoxCallback: function(buttonCode, controlData, callback) {
				if (buttonCode === "ok") {
					var caption = controlData.caption.value;
					var name = controlData.name.value;
					var nameRegExp = new RegExp("^[a-zA-Z0-9_]+$");
					var informationCaption;
					if (Ext.isEmpty(name) || Ext.isEmpty(caption)) {
						informationCaption = this.get("Resources.Strings.ColumnSetInputBoxRequiredFieldsWarning");
					} else if (!nameRegExp.test(name)) {
						informationCaption = this.get("Resources.Strings.ColumnSetInputBoxInvalidNameMessage");
					}
					if (informationCaption) {
						var informationCallback = function() {
							this.showColumnSetInputBox({
								caption: caption,
								name: name,
								callback: callback
							});
						};
						this.showInformation(informationCaption, informationCallback, this);
						return;
					}
					Ext.callback(callback, this, [name, caption]);
				}
			},

			/**
			 * Показывает сообщение.
			 * @private
			 * @param {String} message Текст сообщения.
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			showInformation: function(message, callback, scope) {
				var msgBoxConfig = {
					style: Terrasoft.MessageBoxStyles.BLUE
				};
				Terrasoft.showInformation(message, callback, scope, msgBoxConfig);
			},

			/**
			 * Возвращает конфигурацию элементов окна настройки группы колонок.
			 * @protected
			 * @virtual
			 * @param {String} caption Заголовок группы колонок.
			 * @param {String} name Имя группы колонок.
			 * @param {Boolean} isEdit Признак того, что окно открывается на редактирование.
			 */
			getColumnSetInputBoxControlConfig: function(caption, name, isEdit) {
				var captionConfig = {
					dataValueType: Terrasoft.DataValueType.TEXT,
					caption: this.get("Resources.Strings.ColumnSetInputBoxControlCaption"),
					value: caption || "",
					isRequired: true
				};
				var nameConfig = {
					dataValueType: Terrasoft.DataValueType.TEXT,
					caption: this.get("Resources.Strings.ColumnSetInputBoxControlName"),
					value: name || "",
					isRequired: true
				};
				return {
					caption: captionConfig,
					name: nameConfig
				};
			},

			/**
			 * @inheritDoc Terrasoft.MobileBaseDesignerViewModel#generateDesignerSettingsConfig
			 * @overridden
			 */
			generateDesignerSettingsConfig: function() {
				var designerSettingsConfig = this.callParent(arguments);
				var columnSets = designerSettingsConfig.columnSets;
				for (var i = 0, ln = columnSets.length; i < ln; i++) {
					var columnSet = columnSets[i];
					var collection = this.getItemsCollectionByName(columnSet.name);
					columnSet.items = this.generateSettingsConfigCollectionItems(collection);
				}
				return designerSettingsConfig;
			}

		});

		/**
		 * @class Terrasoft.configuration.MobilePageDesignerModule
		 * Класс модуля дизайнера страницы мобильного приложения.
		 */
		var designerModule = Ext.define("Terrasoft.configuration.MobilePageDesignerModule", {
			extend: "Terrasoft.MobileBaseDesignerModule",
			alternateClassName: "Terrasoft.MobilePageDesignerModule",

			viewModelClassName: "Terrasoft.MobilePageDesignerViewModel",

			viewModelConfigClassName: "Terrasoft.MobilePageDesignerViewConfig",

			designerSettingsClassName: "Terrasoft.MobileRecordDesignerSettings"

		});
		return designerModule;
	});