define("ModuleConfigEdit", ["terrasoft", "LookupUtilities", "ModuleConfigEditResources"],
	function(Terrasoft, LookupUtilities, resources) {
		var localizableStrings = resources.localizableStrings;

		return {

			messages: {

				/**
				 * Сообщение изменения заголовка.
				 */
				"ChangeHeaderCaption": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Сообщение получения настроек лукапа.
				 */
				"LookupInfo": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Сообщение возврата данных от лукапа.
				 */
				"ResultSelectedRows": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				},

				/**
				 * Сообщение возврата настройки модуля
				 */
				"PostModuleConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Сообщение получения настроек модуля.
				 */
				"GetModuleConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Сообщение перехода к предыдущему состоянию.
				 */
				"BackHistoryState": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}

			},
			mixins: {},
			attributes: {
				/**
				 * Атрибут модуля для отображения.
				 */
				ModuleName: {
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					isLookup: true,
					isRequired: true,
					referenceSchemaName: "VwSysSchemaInfo",
					lookupListConfig: {
						columns: ["Name", "Caption"],
						filters: [
							/**
							 * Получает дополнительные фильтры для лукапа по идентификатору рабочего пространства и типу
							 * схемы.
							 * @returns {Terrasoft.FilterGroup} Фильтры запроса.
							 */
							function() {
								var filterGroup = Ext.create("Terrasoft.FilterGroup");
								filterGroup.add("ManagerNameFilter", Terrasoft.createColumnFilterWithParameter(
									Terrasoft.ComparisonType.EQUAL, "ManagerName", "ClientUnitSchemaManager"));
								filterGroup.add("SysWorkspaceIdFilter", Terrasoft.createColumnFilterWithParameter(
									Terrasoft.ComparisonType.EQUAL, "SysWorkspace",
									Terrasoft.SysValue.CURRENT_WORKSPACE.value));
								return filterGroup;
							}
						]
					}
				},
				/**
				 * Атрибут параметров модуля.
				 */
				ModuleParameters: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}
			},
			methods: {

				/**
				 * Возвращает идентификатора модуля.
				 * @protected
				 * @virtual
				 * @returns {string} Идентификатор модуля.
				 */
				getModuleId: function() {
					return this.sandbox.id;
				},

				/**
				 * Инициализирует поля в соответствии с конфигурацией модуля.
				 * @protected
				 * @virtual
				 */
				initializeValues: function(callback, scope) {
					var config = this.sandbox.publish("GetModuleConfig", null, [this.getModuleId()]);
					var encodeConfig = {
						parameters: "",
						configurationMessage: ""
					};
					if (config) {
						var esq = this.getModuleNameESQ();
						esq.filters.add("NameFilter", Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "Name", config.moduleName
						));
						esq.getEntityCollection(function(result) {
							if (result && result.success && !result.collection.isEmpty()) {
								var item = result.collection.getByIndex(0);
								if (item) {
									this.set("ModuleName", item.values);
								}
							}
							callback.call(scope);
						}, this);
						encodeConfig.parameters = config.parameters || "";
						encodeConfig.configurationMessage = config.configurationMessage || "";
					}
					var moduleParameters = JSON.stringify(encodeConfig, null, "\t");
					this.set("ModuleParameters", moduleParameters);
					if (!config) {
						callback.call(scope);
					}
				},

				/**
				 * Инициализирует начальные значения модели.
				 * @protected
				 * @virtual
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						this.initializeValues(callback, scope);
						this.sandbox.publish("ChangeHeaderCaption", {
							caption: localizableStrings.Header,
							dataViews: new Terrasoft.Collection(),
							moduleName: this.name
						});
					}, this]);
				},

				/**
				 * Устанавливает дополнительные валидаторы полей.
				 * @protected
				 * @virtual
				 */
				setValidationConfig: function() {
					this.callParent(arguments);
					this.addColumnValidator("ModuleParameters", this.validateModuleParameters);
				},

				/**
				 * Преобразовывает введенные параметры модуля в объект параметров модуля.
				 * @protected
				 * @virtual
				 * @param {String} strVal Строковое представление параметров модуля.
				 * @returns {Object} Объект параметров.
				 */
				decodeParameters: function(strVal) {
					return Terrasoft.deserialize(strVal);
				},

				/**
				 * Валидатор введенных параметров модуля.
				 * @protected
				 * @virtual
				 * @param {String} value Строковое представление параметров модуля.
				 * @returns {Object} Результат валидации.
				 */
				validateModuleParameters: function(value) {
					var result = {};
					try {
						this.decodeParameters(value);
					} catch (e) {
						result.invalidMessage = localizableStrings.ModuleParametersValidationMessage;
					}
					return result;
				},

				/**
				 * Формирует запрос для получения списка доступных имен модуля.
				 * @protected
				 * @virtual
				 * @returns {Terrasoft.EntitySchemaQuery} Запрос.
				 */
				getModuleNameESQ: function() {
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "VwSysSchemaInfo"
					});
					esq.addColumn("Name", "Name");
					esq.addColumn("Caption", "Caption");
					esq.addColumn("Id", "value");
					esq.addColumn("Caption", "displayValue");
					esq.filters.add(this.getLookupQueryFilters("ModuleName"));
					return esq;
				},

				/**
				 * Получает дополнительные фильтры, описанные конфигурации колонки.
				 * @protected
				 * @virtual
				 * @param {String} columnName Название колонки.
				 * @returns {Terrasoft.FilterGroup} Группа дополнительных фильтров.
				 */
				getLookupQueryFilters: function(columnName) {
					var filterGroup = Ext.create("Terrasoft.FilterGroup");
					var column = this.columns[columnName];
					var lookupListConfig = column.lookupListConfig;
					if (lookupListConfig) {
						var filterArray = lookupListConfig.filters;
						Terrasoft.each(filterArray, function(item) {
							var filter;
							if (Ext.isObject(item) && Ext.isFunction(item.method)) {
								filter = item.method.call(this, item.argument);
							}
							if (Ext.isFunction(item)) {
								filter = item.call(this);
							}
							if (Ext.isEmpty(filter)) {
								throw new Terrasoft.InvalidFormatException({
									message: Ext.String.format(
										this.get("Resources.Strings.ColumnFilterInvalidFormatException"),
										columnName)
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
				 * Наполняет список доступных к выбору модулей.
				 * @protected
				 * @virtual
				 * @param {String} filterValue Строковай фильтр.
				 * @param {Terrasoft.Collection} list Коллекция доступных значений.
				 */
				prepareModuleList: function(filterValue, list) {
					list.clear();
					var items = {};
					var esq = this.getModuleNameESQ();
					esq.filters.add("ManagerNameFilter", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.SysSettings.lookupFilterType, "Caption", filterValue));
					esq.getEntityCollection(function(response) {
						if (response && response.success) {
							var collection = response.collection.getItems();
							Terrasoft.each(collection, function(item) {
								var itemId = item.get("value");
								items[itemId] = item.values;
							}, this);
							list.loadAll(items);
						}
					}, this);
				},

				/**
				 * Открывает модальное окно выбора из справочника.
				 * @protected
				 * @virtual
				 * @param {Object} args Аргументы.
				 * @param {String} tag Тег элемента управления.
				 */
				loadVocabulary: function(args, tag) {
					var config = {
						entitySchemaName: args.schemaName ||
							this.columns[tag].referenceSchemaName,
						multiSelect: false,
						columnName: tag,
						columnValue: this.get(tag),
						searchValue: args.searchValue,
						filters: this.getLookupQueryFilters.call(this, tag)
					};
					var lookupListConfig = this.columns[tag].lookupListConfig;
					var excludedProperty = ["filters", "filter"];
					if (lookupListConfig) {
						for (var property in lookupListConfig) {
							if (excludedProperty.indexOf(property) === -1) {
								config[property] = lookupListConfig[property];
							}
						}
					}
					LookupUtilities.Open(this.sandbox, config, this.onLookupResult, this, null, false, false);
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
				 * Возвращает результирующий объект конфигурации модуля
				 * @protected
				 * @virtual
				 * @returns {Object} Объект конфигурации модуля
				 */
				getResult: function() {
					var moduleName = this.get("ModuleName");
					var strModuleParameters = this.get("ModuleParameters");
					var moduleParameters = this.decodeParameters(strModuleParameters);
					return this.Ext.apply({
						moduleName: moduleName.Name,
						caption: moduleName.Caption
					}, moduleParameters);
				},

				/**
				 * Выполняет возврат к предыдущей странице.
				 * @protected
				 * @virtual
				 */
				goBack: function() {
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * Сохраняет конфигурацию модуля
				 * @protected
				 * @virtual
				 */
				save: function() {
					if (this.validate()) {
						var result = this.getResult();
						this.sandbox.publish("PostModuleConfig", result, [this.getModuleId()]);
						this.goBack();
					}
				}

			},
			rules: {},
			diff: [
				{
					"operation": "insert",
					"name": "ModuleSelectingContainer",
					"values": {
						"id": "ModuleSelectingContainer",
						"selectors": {wrapEl: "#ModuleSelectingContainer"},
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": [
						]
					}
				},
				{
					"operation": "insert",
					"name": "HeaderContainer",
					"parentName": "ModuleSelectingContainer",
					"propertyName": "items",
					"values": {
						"id": "HeaderContainer",
						"selectors": {wrapEl: "#HeaderContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"layout": {column: 0, row: 0, colSpan: 24},
						"items": [
						]
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"name": "SaveButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": localizableStrings.SaveButtonCaption,
						"click": {bindTo: "save"},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"layout": {column: 0, row: 0, colSpan: 2},
						"classes": {textClass: "actions-button-margin-right"}
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"name": "CancelButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": localizableStrings.CancelButtonCaption,
						"click": { bindTo: "goBack" },
						"style": Terrasoft.controls.ButtonEnums.style.DEFAULT,
						"layout": { column: 4, row: 0, colSpan: 2 }
					}
				},
				{
					"operation": "insert",
					"name": "ModuleSettingsContainer",
					"parentName": "ModuleSelectingContainer",
					"propertyName": "items",
					"values": {
						"id": "ModuleSettingsContainer",
						"selectors": {wrapEl: "#ModuleSettingsContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"layout": {column: 0, row: 1, colSpan: 12},
						"items": [
						]
					}
				},
				{
					"operation": "insert",
					"name": "moduleName",
					"parentName": "ModuleSettingsContainer",
					"propertyName": "items",
					"values": {
						"bindTo": "ModuleName",
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 24
						},
						"contentType": Terrasoft.ContentType.LOOKUP,
						"labelConfig": {
							"visible": true,
							"caption": localizableStrings.ModuleNameEditCaption
						},
						"controlConfig": {
							"prepareList": {
								"bindTo": "prepareModuleList"
							}
						}
					}
				},
				{
					"operation": "insert",
					"name": "moduleParameters",
					"parentName": "ModuleSettingsContainer",
					"propertyName": "items",
					"values": {
						"bindTo": "ModuleParameters",
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 24
						},
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"labelConfig": {
							"visible": true,
							"caption": localizableStrings.ModuleParametersEditCaption
						}
					}
				}
			]
		};
	});

