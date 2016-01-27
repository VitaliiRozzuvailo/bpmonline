define("BaseLookupPageV2", ["terrasoft", "ConfigurationEnums"], function(Terrasoft, ConfigurationEnums) {
	//todo нужно что-то придумать с ссылками
	return {
		/**
		 * Сообщения, добавленные или измененные относительно родительской схемы
		 * @type {Object}
		 */
		messages: {
			/**
			 * @message OpenCard
			 * Открывает карточку
			 * @param {Object} Конфигурация открываемой карточки
			 */
			"OpenCard": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},
			/**
			 *
			 */
			"CardModuleResponse": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},
			"GetGridSettingsInfo": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},
			"GridSettingsChanged": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}

		},

		/**
		 * Классы-миксины (примеси), расширяющие функциональность данного класа
		 */
		mixins: {
			/**
			 * @class GridUtilities реализующий базовые методы работы с реестром
			 */
			GridUtilities: "Terrasoft.GridUtilities"
		},

		/**
		 * Атрибуты модели представления раздела
		 * @type {Object}
		 */
		attributes: {
			/**
			 * Коллекция данных для представления списка
			 */
			GridData: {dataValueType: Terrasoft.DataValueType.COLLECTION},

			/**
			 * Значение первичной колонки активной записи реестра
			 */
			ActiveRow: {dataValueType: Terrasoft.DataValueType.GUID},

			/**
			 * Флаг, указывает пустой ли реестр
			 */
			IsGridEmpty: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			/**
			 * Флаг, показывать ли маску загрузки
			 */
			ShowGridMask: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			/**
			 * Флаг, загрузился ли реестр
			 */
			IsGridLoading: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			/**
			 * Флаг, возможность множественного выбора в реестре
			 */
			MultiSelect: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			/**
			 * Коллекция выбранных записей в реестре
			 */
			SelectedRows: {dataValueType: Terrasoft.DataValueType.COLLECTION},

			/**
			 * Колличество записей выбираемые в запросе
			 */
			RowCount: {dataValueType: Terrasoft.DataValueType.INTEGER},

			/**
			 * Флаг, постраничная загрузка в запросе
			 */
			IsPageable: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			/**
			 * Флаг, очищать реестр
			 */
			IsClearGridData: {dataValueType: Terrasoft.DataValueType.BOOLEAN},

			/**
			 * Коллекция колонок меню сортировки
			 */
			SortColumns: {dataValueType: Terrasoft.DataValueType.COLLECTION},

			searchColumn: {dataValueType: Terrasoft.DataValueType.LOOKUP},
			//LookupCaption


			LookupInfo: {dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT}
		},

		/**
		 * Методы модели представления раздела
		 * @type {Object}
		 */
		methods: {


			/**
			 * Инициализирует начальное состояние модели представления
			 * @protected
			 * @overridden
			 */
			init: function(callback, scope) {
				this.callParent([function() {
					this.initEditPages();
					this.subscribeSandboxEvents();
					this.initLookupCaption();
					this.initModelValues();
					this.initGridData();
					this.mixins.GridUtilities.init.call(this);
					this.loadGridData();
					callback.call(scope);
				}, this]);
			},

			initModelValues: function() {
				this.set("schemaColumns", this.Ext.create("Terrasoft.Collection"));
				this.set("searchColumn", {
					value: this.entitySchema.primaryDisplayColumn.name,
					displayValue: this.entitySchema.primaryDisplayColumn.caption
				});
				this.set("RowCount", 15);
				this.set("IsPageable", true);
			},

			/**
			 *
			 * @protected
			 */
			subscribeSandboxEvents: function() {
				this.subscribeCardModuleResponse();
			},

			subscribeCardModuleResponse: function() {
				var editCardsSandboxIds = [];
				var editPages = this.get("EditPages");
				editPages.each(function(editPage) {
					var editCardsSandboxId = this.getChainCardModuleSandboxId(editPage.get("Tag"));
					editCardsSandboxIds.push(editCardsSandboxId);
				}, this);
				this.sandbox.subscribe("CardModuleResponse", this.onCardModuleResponse, this, editCardsSandboxIds);
			},

			onCardModuleResponse: function(cardModuleResponse) {
				if (!cardModuleResponse.success) {
					return;
				}
				var select = this.getGridDataESQ();
				this.initQueryColumns(select);
				this.initQueryFilters(select);
				select.enablePrimaryColumnFilter(cardModuleResponse.primaryColumnValue);
				select.getEntityCollection(function(response) {
					var result = new Terrasoft.Collection();
					response.collection.each(function(item) {
						result.add(item.get(item.primaryColumnName), this.getResultItem(item));
					}, this);
					this.selectResult(result);
				}, this);
			},

			getResultItem: function(item) {
				var primaryColumnName = item.primaryColumnName;
				var primaryDisplayColumnName = item.primaryDisplayColumnName;
				item.values.value = item.values[primaryColumnName];
				item.values.displayValue = item.values[primaryDisplayColumnName];
				return item.values;
			},

			/**
			 * Герерирует идентификатор модуля страницы для загрузки в цепочке
			 * @protected
			 * @param {String} typeColumnValue Уникальный идентификатор типа для страницы редактирования
			 * @return {string} Возвращает идентификатор модуля страницы для загрузки в цепочке
			 */
			getChainCardModuleSandboxId: function(typeColumnValue) {
				return this.sandbox.id + "_chain" + typeColumnValue;
			},

			onRender: function() {
				this.hideBodyMask();
//				var searchEdit = this.Ext.getCmp("searchEdit");
//				searchEdit.getEl().focus();
			},

			/**
			 * Получает коллекцию строк реестра
			 * @protected
			 * @returns {Terrasoft.Collection}
			 */
			getGridData: function() {
				return this.get("GridData");
			},

			select: function() {
				var collection = this.getGridData();
				var result = new Terrasoft.Collection();
				var notLoadedItems = [];
				var records = this.getSelectedItems();
				if (!Ext.isEmpty(records)) {
					records.forEach(function(recordId) {
						if (collection.contains(recordId)) {
							var item = collection.get(recordId);
							result.add(recordId, this.getResultItem(item));
						} else {
							notLoadedItems.push(recordId);
						}
					}, this);
				}
				if (Ext.isEmpty(notLoadedItems)) {
					this.selectResult(result);
				} else {

					var select = this.getGridDataESQ();
					this.initQueryColumns(select);
					this.initQueryFilters(select);
					select.filters.add("IdFilter", Terrasoft.createColumnInFilterWithParameters("Id", notLoadedItems));
					select.getEntityCollection(function(response) {
						response.collection.each(function(item) {
							result.add(item.get("Id"), this.getResultItem(item));
						}, this);
						this.selectResult(result);
					}, this);
				}
			},

			initLookupCaption: function() {
				var lookupInfo = this.get("LookupInfo");
				if (lookupInfo.caption) {
					this.set("LookupCaption", lookupInfo.caption);
					return;
				}
				var select = Ext.create("Terrasoft.EntitySchemaQuery", { rootSchemaName: "SysLookup" });
				select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "displayValue");
				select.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
					"SysEntitySchemaUId", this.entitySchema.uId
				));
				select.getEntityCollection(function(response) {
					var prefix = this.get("Resources.Strings.CaptionLookupPage");
					var resultCollection = response.collection;
					var displayValue = resultCollection.isEmpty()
						? this.entitySchema.caption
						: resultCollection.getByIndex(0).get("displayValue");
					this.set("LookupCaption", prefix + displayValue);
				}, this);
			},

			getSchemaColumns: function() {
				var entitySchema = this.entitySchema;
				var schemaColumns = this.get("searchColumnList");
				schemaColumns.clear();
				var columns = Ext.create("Terrasoft.Collection");
				Terrasoft.each(entitySchema.columns, function(entitySchemaColumn) {
					if (this.isValidColumnDataValueType(entitySchemaColumn) &&
						entitySchemaColumn.name !== entitySchema.primaryDisplayColumnName &&
						entitySchemaColumn.usageType !== ConfigurationEnums.EntitySchemaColumnUsageType.None) {
						var columnPath = entitySchemaColumn.name;
						if (entitySchemaColumn.isLookup) {
							columnPath += "." + entitySchemaColumn.referenceSchema.primaryDisplayColumnName;
						}
						var column = {
							value: columnPath,
							displayValue: entitySchemaColumn.caption
						};
						columns.add(column.name, column);
					}
				}, this);
				columns.sort(0, Terrasoft.OrderDirection.ASC);
				columns.add(entitySchema.primaryDisplayColumn.name, {
					value: entitySchema.primaryDisplayColumn.name,
					displayValue: entitySchema.primaryDisplayColumn.caption
				}, 0);
				schemaColumns.loadAll(columns);
			},

			/**
			 * Инициализирует начальное значение свойства необходимости использования постраничной загрузки
			 * @protected
			 */
			needLoadData: function() {
				if (!this.get("CanLoadMoreData")) {
					return;
				}
				this.loadGridData();
			},

			isValidColumnDataValueType: function(column) {
				return (column.dataValueType === Terrasoft.DataValueType.TEXT ||
					column.dataValueType === Terrasoft.DataValueType.LOOKUP);
			},

			selectResult: function(result) {
				var lookupInfo = this.get("LookupInfo");
				this.sandbox.publish("ResultSelectedRows", {
					selectedRows: result,
					columnName: lookupInfo.columnName
				}, [this.sandbox.id]);
			},

			/**
			 * Инициализирует коллекцию данных представления рееестра
			 * @protected
			 */
			initGridData: function() {
				this.set("GridData", this.Ext.create("Terrasoft.BaseViewModelCollection"));
				this.initSortActionItems();
			},

			cancel: function() {
				this.close();
			},

			close: function() {
				Terrasoft.LookupUtilities.CloseModalBox();
			},

			/**
			 * Открывает страницу добавления записи
			 * @protected
			 */
			addRecord: function(typeColumnValue) {
				if (!typeColumnValue) {
					if (this.get("EditPages").getCount() > 1) {
						return false;
					}
					var tag = this.get("AddRecordButtonTag");
					typeColumnValue = tag || this.Terrasoft.GUID_EMPTY;
				}
				this.openCard(ConfigurationEnums.CardStateV2.ADD, typeColumnValue, null);
			},

			/**
			 * Обработчик нажатия кнопки изменить
			 */
			editRecord: function(typeColumnValue) {
				var selectedItems = this.getSelectedItems();
				var activeRow = selectedItems[0];
				if (!typeColumnValue) {
					typeColumnValue = this.getTypeColumnValue(activeRow);
				}
				this.openCard(ConfigurationEnums.CardStateV2.EDIT, typeColumnValue, activeRow);
			},

			/**
			 * Открывает страницу добавления детали
			 * @param typeColumnValue {String} Значение колонки типа
			 */
			copyRecord: function(typeColumnValue) {
				var selectedItems = this.getSelectedItems();
				var activeRow = selectedItems[0];
				if (!typeColumnValue) {
					typeColumnValue = this.getTypeColumnValue(activeRow);
				}
				this.openCard(ConfigurationEnums.CardStateV2.COPY, typeColumnValue, activeRow);
			},

			/**
			 * Открывает карточку
			 * @param operation Действие
			 * @param typeColumnValue Значение колонки типа
			 * @param recordId Идентификатор записи
			 */
			openCard: function(operation, typeColumnValue, recordId) {
				var editPages = this.get("EditPages");
				var editPage = editPages.get(typeColumnValue);
				var schemaName = editPage.get("SchemaName");
				var cardModuleId = this.getChainCardModuleSandboxId(typeColumnValue);
				var openCardConfig = {
					moduleId: cardModuleId,
					schemaName: schemaName,
					operation: operation,
					id: recordId
				};
				this.sandbox.publish("OpenCard", openCardConfig, [this.sandbox.id]);
				this.close();
			},
			onSearchButtonClick: function() {
				this.set("IsClearGridData", true);
				this.set("ActiveRow", null);
				this.set("SelectedRows", []);
				this.loadGridData();
			},

			openGridSettings: function() {
				this.mixins.GridUtilities.openGridSettings.apply(this, arguments);
				this.close();
			},

			getHistoryStateInfo: function() {
				return {
					workAreaMode: ConfigurationEnums.WorkAreaMode.SECTION
				};
			},
			/**
			 * Возвращает ключ профиля
			 * @returns {String} Ключ
			 */
			getProfileKey: function() {
				return this.entitySchema.name + "_GridSettings";
			},

			/**
			 * Обновляет фильтры в зависимости от того, загружается ли записи в корень или в новый уровень
			 * @protected
			 * @overridden
			 * @return {Terrasoft.FilterGroup} Примененные в данной схеме фильтры
			 */
			getFilters: function() {
				var filters = this.mixins.GridUtilities.getFilters.apply(this, arguments);
				var searchColumn = this.get("searchColumn");
				var searchData = this.get("searchData");
				if (searchColumn && searchData) {
					var columnPath = searchColumn.value;
					var filter = Terrasoft.createColumnFilterWithParameter(Terrasoft.SysSettings.lookupFilterType,
						columnPath, searchData);
					filters.add("searchDataFilter", filter);
				}
				return filters;
			}

		},

		/**
		 * Представление раздела
		 * @type {Object[]}
		 */
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "fixed-area-container",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["containerLookupPage", "container-lookup-page-fixed"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "fixed-area-container",
				"propertyName": "items",
				"name": "headContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["header"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "headContainer",
				"propertyName": "items",
				"name": "header-name-container",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["header-name-container", "header-name-container-full"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "header-name-container",
				"propertyName": "items",
				"name": "HeaderLabel",
				"values": {
					"itemType": Terrasoft.ViewItemType.LABEL,
					"caption": { "bindTo": "LookupCaption" }
				}
			},
			{
				"operation": "insert",
				"parentName": "headContainer",
				"propertyName": "items",
				"name": "close-icon-container",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["header-name-container", "header-name-container-full"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "close-icon-container",
				"propertyName": "items",
				"name": "close-icon",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					"imageConfig": { "bindTo": "Resources.Images.CloseIcon" },
					"classes": { "wrapperClass": ["close-btn-user-class"] },
					//selectors: { wrapEl: "#headContainer" },
					"click": { "bindTo": "close" }
				}
			},
			{
				"operation": "insert",
				"parentName": "fixed-area-container",
				"propertyName": "items",
				"name": "selectionControlsContainerLookupPage",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["controlsContainerLookupPage"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "selectionControlsContainerLookupPage",
				"propertyName": "items",
				"name": "SelectButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"style": Terrasoft.controls.ButtonEnums.style.GREEN,
					"caption": { "bindTo": "Resources.Strings.SelectButtonCaption" },
					"classes": { "textClass": ["main-buttons"] },
					"click": { "bindTo": "select" }
				}
			},
			{
				"operation": "insert",
				"parentName": "selectionControlsContainerLookupPage",
				"propertyName": "items",
				"name": "CancelButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": { "bindTo": "Resources.Strings.CancelButtonCaption" },
					"classes": { "textClass": ["main-buttons"] },
					"click": { "bindTo": "cancel" }
				}
			},
			{
				"operation": "insert",
				"name": "SeparateModeAddRecordButton",
				"parentName": "selectionControlsContainerLookupPage",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": { "bindTo": "Resources.Strings.AddButtonCaption" },
					"click": { "bindTo": "addRecord" },
					"classes": {
						"textClass": ["main-buttons"],
						"wrapperClass": ["main-buttons"]
					},
					"controlConfig": {
						"menu": {
							"items": {
								"bindTo": "EditPages",
								"bindConfig": {
									"converter": function(editPages) {
										return editPages.getCount() > 1 ? editPages : null;
									}
								}
							}
						}
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "selectionControlsContainerLookupPage",
				"propertyName": "items",
				"name": "ActionsButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": { "bindTo": "Resources.Strings.ActionButtonCaption" },
					"classes": { "textClass": ["action-buttons"] },
					"menu": []
					//"click": { "bindTo": "CancelButton" }
				}
			},
			{
				"operation": "insert",
				"name": "CopyRecordMenu",
				"parentName": "ActionsButton",
				"propertyName": "menu",
				"values": {
					"caption": {"bindTo": "Resources.Strings.CopyButtonCaption"},
					"click": {"bindTo": "copyRecord"},
					"enabled": {"bindTo": "isSingleSelected"}
				}
			},
			{
				"operation": "insert",
				"name": "EditRecordMenu",
				"parentName": "ActionsButton",
				"propertyName": "menu",
				"values": {
					"caption": { "bindTo": "Resources.Strings.EditButtonCaption" },
					"click": { "bindTo": "editRecord" },
					"enabled": {"bindTo": "isSingleSelected"}

				}
			},
			{
				"operation": "insert",
				"name": "DeleteRecordMenu",
				"parentName": "ActionsButton",
				"propertyName": "menu",
				"values": {
					"caption": { "bindTo": "Resources.Strings.DeleteButtonCaption" },
					"click": { "bindTo": "deleteRecords" },
					"enabled": {"bindTo": "isAnySelected"}
				}
			},


			// Вид

			{
				"operation": "insert",
				"parentName": "fixed-area-container",
				"propertyName": "items",
				"name": "rightContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["rightContainerLookupPage"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "rightContainer",
				"propertyName": "items",
				"name": "optionsContainerLookupPage",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["optionsContainerLookupPage"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "optionsContainerLookupPage",
				"propertyName": "items",
				"name": "SelectedRecordsCaption",
				"values": {
					"itemType": Terrasoft.ViewItemType.LABEL,
					"classes": { "labelClass": ["labelEdit"] },
					"caption": { "bindTo": "Resources.Strings.CountSelectedRecord" },
					"visible": { "bindTo": "MultiSelect" }
				}
			},
			{
				"operation": "insert",
				"parentName": "optionsContainerLookupPage",
				"propertyName": "items",
				"name": "SelectedRecordsCountLabel",
				"values": {
					"itemType": Terrasoft.ViewItemType.LABEL,
					"classes": { "labelClass": ["selectedRowsCountLabel"] },
					"caption": {
						"bindTo": "SelectedRows",
						"bindConfig": {
							"converter": function(value) {
								return (value && value.length) || 0;
							}
						}
					},
					"visible": { "bindTo": "MultiSelect" }
				}
			},
			{
				"operation": "insert",
				"name": "ViewButton",
				"parentName": "rightContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": { "bindTo": "Resources.Strings.ViewButtonCaption"},
					"classes": { "wrapperClass": ["lookup-grid-settings-button-wrapperEl"] },
					"menu": []
				}
			},
			{
				"operation": "insert",
				"name": "ViewSortMenu",
				"parentName": "ViewButton",
				"propertyName": "menu",
				"values": {
					"caption": { "bindTo": "Resources.Strings.SortMenuCaption" },
					"controlConfig": {
						"menu": {
							"items": { "bindTo": "SortColumns" }
						}
					}
				}
			},
			{
				"operation": "insert",
				"name": "ViewSeparatorMenu",
				"parentName": "ViewButton",
				"propertyName": "menu",
				"values": {
					className: "Terrasoft.MenuSeparator"
				}
			},
			{
				"operation": "insert",
				"name": "ViewSetupGridMenu",
				"parentName": "ViewButton",
				"propertyName": "menu",
				"values": {
					"caption": { "bindTo": "Resources.Strings.SetupGridMenuCaption" },
					"click": { "bindTo": "openGridSettings" }
				}
			},
			{
				"operation": "insert",
				"parentName": "fixed-area-container",
				"propertyName": "items",
				"name": "filteringContainerLookupPage",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["filteringContainerLookupPage"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "filteringContainerLookupPage",
				"propertyName": "items",
				"name": "searchColumn",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON, //todo
					"controlConfig": {
						"className": "Terrasoft.ComboBoxEdit",
						"classes": ["columnEdit"],
						"prepareList": { "bindTo": "getSchemaColumns" },
						"list": { bindTo: "searchColumnList" },
						"value": { "bindTo": "searchColumn" },
						"markerValue": "searchColumn"
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "filteringContainerLookupPage",
				"propertyName": "items",
				"name": "searchData",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON, //todo
					"enterkeypressed": {bindTo: "onSearchButtonClick"},
					"controlConfig": {
						"className": "Terrasoft.TextEdit",
						"classes": ["searchEdit"],
						"value": { "bindTo": "searchData" },
						"markerValue": "searchData"
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "filteringContainerLookupPage",
				"propertyName": "items",
				"name": "SearchButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"style": Terrasoft.controls.ButtonEnums.style.BLUE,
					"caption": { "bindTo": "Resources.Strings.SearchButtonCaption" },
					"classes": { "textClass": ["vertical-align-top"] },
					"click": { "bindTo": "onSearchButtonClick" }
				}
			},
			{
				"operation": "insert",
				"name": "grid-area-container",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["containerLookupPage", "container-lookup-page-grid"],
					"items": []
				}
			},
//				ActionButtonsContainer
			{
				"operation": "insert",
				"parentName": "grid-area-container",
				"propertyName": "items",
				"name": "DataGrid",
				"values": {
					"itemType": Terrasoft.ViewItemType.GRID,
					"primaryColumnName": "Id",
					"type": "listed",
					"activeRow": { "bindTo": "ActiveRow" },
					"collection": { "bindTo": "GridData" },
					"isEmpty": { "bindTo": "IsGridEmpty" },
					"isLoading": { "bindTo": "IsGridLoading" },
					"multiSelect": { "bindTo": "MultiSelect" },
					"selectedRows": { "bindTo": "SelectedRows" },
					//"selectRow": { "bindTo": "rowSelected" },
					"sortColumn": { "bindTo": "sortColumn" },
					"sortColumnDirection": { "bindTo": "GridSortDirection" },
					"sortColumnIndex": { "bindTo": "SortColumnIndex" },
					"linkClick": { "bindTo": "linkClicked" },
					"needLoadData": {"bindTo": "needLoadData"},
//					"activeRowAction": {"bindTo": "onActiveRowAction"},
//					"activeRowActions": []
					"listedConfig": {
						"name": "DataGridListedConfig",
						"items": [
							{
								"name": "NameListedGridColumn",
								"bindTo": "Name",
								"position": {
									"column": 1,
									"colSpan": 24
								}
							}
						]
					},
					"tiledConfig": {
						"name": "DataGridTiledConfig",
						"grid": {
							"columns": 24,
							"rows": 1
						},
						"items": [
							{
								"name": "NameTiledGridColumn",
								"bindTo": "Name",
								"position": {
									"row": 1,
									"column": 1,
									"colSpan": 24
								}
							}
						]
					}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});