define("BaseProcessSchemaElementPropertiesPage", ["terrasoft", "BaseProcessSchemaElementPropertiesPageResources"],
	function(Terrasoft, resources) {
		return {
			messages: {},
			mixins: {
				editable: "Terrasoft.ProcessSchemaElementEditable"
			},
			attributes: {
				/**
				 * Элемент процесса
				 */
				"ProcessElement": {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Признак развернутого информационного блока
				 */
				"IsInfoButtonPressed": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: true
				},
				/**
				 * Профиль процесса
				 */
				"TabsCollection": {
					dataValueType: Terrasoft.DataValueType.COLLECTION,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Хранит имя активной вкладки
				 */
				"ActiveTabName": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				/**
				 * Текст информационного блока
				 */
				"ProcessInformationText": {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: resources.localizableStrings.ProcessInformationText
				},
				/**
				 * Подпись на диаграмме
				 */
				"caption": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isProcessSchemaParameter: true
				}
			},
			methods: {
				/**
				 * Инициализирует начальные значения страницы
				 * @protected
				 * @virtual
				 */
				init: function(callback, scope) {
					this.mixins.editable.init.call(this);
					this.callParent([function() {
						this.loadProfile();
						this.initTabs();
						this.onPageInitialized(callback, scope);
					}.bind(this), scope || this]);
				},
				/**
				 * Вызывается после завершения инициализации схемы.
				 * @protected
				 * @param {Function} callback Функция обратного вызова.
				 * @param {Object} scope Контекст выполнения.
				 */
				onPageInitialized: function(callback, scope) {
					callback.call(scope || this);
				},
				/**
				 * @inheritDoc ProcessSchemaElementEditable#onElementDataLoad
				 * @protected
				 * @overridden
				 */
				onElementDataLoad: function(processElement) {
					this.set("ProcessElement", processElement);
					Terrasoft.each(this.columns, function(column) {
						if (column.isProcessSchemaParameter) {
							var columnName = column.name;
							var value = processElement[columnName];
							if (Terrasoft.instanceOfClass(value, "Terrasoft.LocalizableString")) {
								this.set(columnName, value.getValue());
							} else {
								this.set(columnName, value);
							}
						}
					}, this);
					this.loadTabs();
				},
				/**
				 * Возвращает свойства для сохранения
				 * @protected
				 * @virtual
				 * @returns {Object} propertiesValues
				 */
				getPropertiesValues: function() {
					var propertiesValues = {};
					Terrasoft.each(this.columns, function(column) {
						if (column.isProcessSchemaParameter) {
							var columnName = column.name;
							propertiesValues[columnName] = this.get(columnName);
						}
					}, this);
					return propertiesValues;
				},
				/**
				 * @inheritdoc Terrasoft.ProcessSchemaElementEditable#onSaveElementProperties.
				 * @overriden
				 * @protected
				 */
				onSaveElementProperties: function() {
					this.saveValues();
				},
				/**
				 * Сохранение свойств
				 * @protected
				 * @virtual
				 * @throws {Terrasoft.ItemNotFoundException} Бросает исключение, если в элементе не найдено свойство
				 */
				saveValues: function() {
					var processElement = this.get("ProcessElement");
					var propertiesValues = this.getPropertiesValues();
					Terrasoft.each(propertiesValues, function(propertyValue, propertyName) {
						if (Ext.isEmpty(processElement[propertyName], true)) {
							var message = this.get("Resources.Strings.ElementPropertyNotFoundExceptionMessage");
							var errorMessage = Ext.String.format(message, propertyName, this.tag);
							throw new Terrasoft.ItemNotFoundException({message: errorMessage});
						}
						if (Terrasoft.instanceOfClass(processElement[propertyName], "Terrasoft.LocalizableString")) {
							processElement.setLocalizableStringPropertyValue(propertyName, propertyValue);
						} else {
							processElement.setPropertyValue(propertyName, propertyValue);
						}
					}, this);
				},
				/**
				 * Обработчик события нажатия на кнопку "Сохранить".
				 * @private
				 */
				onSaveClick: function() {
					this.saveValues();
					this.save({
						tag: this.tag
					});
				},
				/**
				 * @overridden
				 * @inheritdoc Terrasoft.BaseObject#onDestroy
				 */
				onDestroy: function() {
					this.mixins.editable.onDestroy.call(this);
					this.callParent(arguments);
				},
				/**
				 * Открывает страницу выбора из справочника.
				 * @protected
				 * @param {Object} args Параметры.
				 * @param {Object} tag Тег.
				 */
				loadVocabulary: function(args, tag) {
					var config = this.getLookupPageConfig(args, tag);
					this.openLookup(config, this.onLookupResult, this);
				},
				/**
				 * Возвращает настройки страницы выбора из справочника.
				 * @protected
				 * @param {Object} args Параметры.
				 * @param {String} columnName Название колонки.
				 * @return {Object} Настройки страницы выбора из справочника.
				 */
				getLookupPageConfig: function(args, columnName) {
					return {
						entitySchemaName: this.getLookupEntitySchemaName(columnName),
						multiSelect: false,
						columnName: columnName,
						columnValue: this.get(columnName),
						searchValue: args.searchValue,
						filters: this.getLookupQueryFilters(columnName)
					};
				},
				/**
				 * Возвращает название схемы объекта справочного поля.
				 * @protected
				 * @param {String} columnName Название колонки.
				 * @return {String} Название схемы справочного поля.
				 */
				getLookupEntitySchemaName: function(columnName) {
					var column = this.getColumnByName(columnName);
					return column.referenceSchemaName;
				},
				/**
				 * Формирует фильтры, которые накладываются на справочные поля.
				 * @private
				 * @param {String} columnName Название колонки.
				 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
				 */
				getLookupQueryFilters: function(columnName) {
					return this.Ext.create("Terrasoft.FilterGroup");
				},
				/**
				 * Событие выбора значений справочника
				 * @protected
				 * @param {Object} args Результат работы модуля выбора из справочника
				 * @param {Terrasoft.Collection} args.selectedRows Коллекция выбранных записе
				 * @param {String} args.columnName Имя колонки, для которой осеществлялся выбор
				 */
				onLookupResult: function(args) {
					var columnName = args.columnName;
					var selectedRows = args.selectedRows;
					if (!selectedRows.isEmpty()) {
						this.set(columnName, selectedRows.getByIndex(0));
					}
				},
				/**
				 * Обработчик события нажатия на кнопку "I".
				 * @private
				 */
				onInfoClick: function() {
					var isInfoButtonPressed = !this.get("IsInfoButtonPressed");
					this.set("IsInfoButtonPressed", isInfoButtonPressed);
					var profile = this.getProfile();
					var key = this.getProfileKey();
					if (profile && key) {
						profile.isInfoButtonPressed = isInfoButtonPressed;
						this.set(this.getProfileColumnName(), profile);
						Terrasoft.utils.saveUserProfile(key, profile, false);
					}
				},
				/**
				 * Устанавливает значения из профиля.
				 * protected
				 */
				loadProfile: function() {
					var profile = this.getProfile();
					var isInfoButtonPressed = !Ext.isEmpty(profile.isInfoButtonPressed) ?
						profile.isInfoButtonPressed : true;
					this.set("IsInfoButtonPressed", isInfoButtonPressed);
				},
				/**
				 * Возвращает ключ профиля.
				 * @protected
				 * @return {String} Ключ.
				 */
				getProfileKey: function() {
					return "ProcessElementProperties";
				},
				/**
				 * Возвращает массив вкладок, со структурой описанной в методе getTabsColumns
				 * @virtual
				 */
				getTabs: function() {
					return [];
				},
				/**
				 * Возвращает массив описания колонок получения данных вкладок, для загрузки коллекции
				 * @protected
				 */
				getTabsColumns: function() {
					return [
						{
							dataValueType: Terrasoft.DataValueType.TEXT,
							name: "Name",
							columnPath: "Name"
						}, {
							dataValueType: Terrasoft.DataValueType.IMAGE,
							name: "DefaultTabImage",
							columnPath: "DefaultTabImage"
						}, {
							dataValueType: Terrasoft.DataValueType.IMAGE,
							name: "ActiveTabImage",
							columnPath: "ActiveTabImage"
						}, {
							dataValueType: Terrasoft.DataValueType.BOOLEAN,
							name: "IsRequired",
							columnPath: "IsRequired"
						}
					];
				},
				/**
				 * Возвращает активную вкладку
				 * @protected
				 * @return {Object} Вкладка по умолчанию.
				 */
				getActiveTab: function() {
					var tabsCollection = this.get("TabsCollection");
					var activeTabName = this.get("ActiveTabName");
					return tabsCollection.get(activeTabName);
				},
				/**
				 * Построение вкладок
				 * @protected
				 */
				loadTabs: function() {
					var tabs = this.getTabs();
					if (!tabs || tabs.length <= 0) {
						return;
					}
					var columns = this.getTabsColumns();
					var сollection = new Terrasoft.BaseViewModelCollection({
						entitySchema: new Terrasoft.BaseEntitySchema({
							columns: columns,
							primaryColumnName: "Name"
						})
					});
					сollection.loadFromColumnValues(tabs);
					var tabsCollection = this.get("TabsCollection");
					tabsCollection.loadAll(сollection);
				},
				/**
				 * Возвращает название вкладки по умолчанию.
				 * @protected
				 * @return {String} Название вкладки по умолчанию.
				 */
				getDefaultTabName: function() {
					var tabsCollection = this.get("TabsCollection");
					if (!tabsCollection.getCount()) {
						return "";
					}
					var defaultTabName = this.get("DefaultTabName");
					if (!defaultTabName) {
						var firstTab = tabsCollection.getByIndex(0);
						defaultTabName = firstTab.get("Name");
						if (!Ext.isEmpty(defaultTabName)) {
							this.set("DefaultTabName", defaultTabName);
						}
					}
					return defaultTabName;
				},
				/**
				 * Инициализирует начальные значения модели для Tabs
				 * @protected
				 * @virtual
				 */
				initTabs: function() {
					var defaultTabName = this.getDefaultTabName();
					if (!defaultTabName) {
						return;
					}
					this.setActiveTab(defaultTabName);
					this.set(defaultTabName, true);
				},
				/**
				 * Устанавливает активную вкладку
				 * @protected
				 * @virtual
				 * @param {String} tabName Имя вкладки
				 */
				setActiveTab: function(tabName) {
					this.set("ActiveTabName", tabName);
				},
				/**
				 * Обрабатывает событие изменение вкладки Tabs
				 * @protected
				 * @param {Terrasoft.BaseViewModel} activeTab Выбранная вкладка
				 */
				onActiveTabChange: function(activeTab) {
					var activeTabName = activeTab.get("Name");
					var tabsCollection = this.get("TabsCollection");
					tabsCollection.eachKey(function(tabName, tab) {
						var tabContainerVisibleBinding = tab.get("Name");
						this.set(tabContainerVisibleBinding, false);
					}, this);
					this.set(activeTabName, true);
					var processInformationText = activeTab.get("ProcessInformationText");
					this.set("ProcessInformationText", processInformationText);
				},
				/**
				 * Обработчик события нажатия на кнопку закрытия.
				 */
				onHidePropertyPage: function() {
					this.sandbox.publish("HidePropertyPage");
				},
				/**
				 * Обработчик события нажатия на кнопку "Далее" для перехода на следующую вкладку свойств
				 */
				onNextClick: function() {
					var tabs = this.get("TabsCollection");
					var nextTab = tabs.getByIndex(tabs.indexOf(this.getActiveTab()) + 1);
					this.setActiveTab(nextTab.get("Name"));
				},

				getTabsVisible: function() {
					var tabs = this.getTabs();
					return (tabs && tabs.length > 0);
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "PropertiesContainer",
					"values": {
						"id": "PropertiesContainer",
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "CloseButtonContainer",
					"parentName": "PropertiesContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["close-button-container-wrapClass"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ClosePropertyButton",
					"parentName": "CloseButtonContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"classes": {"imageClass": ["close-button-background-no-repeat"]},
						"click": {"bindTo": "onHidePropertyPage"},
						"imageConfig": {"bindTo": "getCloseButtonImageConfig"},
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT
					}
				},
				{
					"operation": "insert",
					"name": "HeaderContainer",
					"parentName": "PropertiesContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "TitleContainer",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"wrapClass": ["title-container"],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "TitleButton",
					"parentName": "TitleContainer",
					"propertyName": "items",
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.TitleButton"},
						"classes": {
							"wrapperClass": ["title-button"],
							"imageClass": ["title-button-image"]
						},
						"enabled": false
					}
				},
				{
					"operation": "insert",
					"name": "caption",
					"parentName": "TitleContainer",
					"propertyName": "items",
					"values": {
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.TitleCaption"
							}
						},
						"classes": {
							"labelClass": ["t-label-proc"]
						}
					}
				},
				{
					"operation": "insert",
					"name": "TabsContainer",
					"parentName": "PropertiesContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {
							"wrapClassName": ["tabs-container"]
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "Tabs",
					"parentName": "TabsContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.IMAGE_TAB_PANEL,
						"collection": {"bindTo": "TabsCollection"},
						"activeTabChange": {"bindTo": "onActiveTabChange"},
						"activeTabName": {"bindTo": "ActiveTabName"},
						"isScrollVisible": false,
						"backgroundImage": {"bindTo": "Resources.Images.BackgroundImage"},
						"tabs": [],
						"visible": {"bindTo": "getTabsVisible"}
					}
				},
				{
					"operation": "insert",
					"name": "InformationContainer",
					"propertyName": "items",
					"parentName": "TabsContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"classes": {
							"wrapClassName": ["info-container"]
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "InformationContainer",
					"propertyName": "items",
					"name": "InfoButton",
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"imageConfig": {"bindTo": "Resources.Images.ProcessInfoButton"},
						"classes": {
							"wrapperClass": ["info-process-button"],
							"imageClass": ["info-process-button-image"]
						},
						"pressed": {
							"bindTo": "IsInfoButtonPressed"
						},
						"click": {
							"bindTo": "onInfoClick"
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "InformationContainer",
					"propertyName": "items",
					"name": "InfoText",
					"values": {
						"itemType": Terrasoft.ViewItemType.LABEL,
						"caption": {"bindTo": "ProcessInformationText"},
						"classes": {
							"labelClass": ["info-text"]
						}
					}
				},
				{
					"operation": "insert",
					"name": "EditorsContainer",
					"parentName": "PropertiesContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "ActionButtonsContainer",
					"parentName": "PropertiesContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": [],
						"classes": {
							"wrapClassName": ["tabs"]
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
