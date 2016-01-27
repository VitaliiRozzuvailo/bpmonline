define("BaseLookupConfigurationSection", ["ConfigurationEnums", "ConfigurationGrid", "ConfigurationGridGenerator",
		"ConfigurationGridUtilities"],
	function(ConfigurationEnums) {

		return {
			contextHelpId: "",
			messages: {

				/**
				 * Публикация сообщения переотрисовки модуля итогов.
				 */
				"GetModuleSchema": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			attributes: {

				/**
				 * Указывает на редактируемость реестра.
				 */
				IsEditable: {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: true
				},

				/**
				 * Признак видимости действия "добавить в группу".
				 * @overridden
				 */
				IsIncludeInFolderButtonVisible: {value: false},

				/**
				 * Признак видимости действия "Настроить итоги".
				 * @overridden
				 */
				"IsSummarySettingsVisible": {value: false}
			},

			/**
			 * Классы-миксины (примеси), расширяющие функциональность данного класа
			 */
			mixins: {
				ConfigurationGridUtilities: "Terrasoft.ConfigurationGridUtilities"
			},

			methods: {

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#addSectionDesignerViewOptions
				 * @overridden
				 */
				addSectionDesignerViewOptions: Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#subscribeSandboxEvents
				 * @overridden
				 */
				subscribeSandboxEvents: function() {
					this.callParent(arguments);
					var quickFilterModuleId = this.sandbox.id + "_QuickFilterModuleV2";
					this.sandbox.subscribe("GetModuleSchema", this.getModuleSchema, this, [quickFilterModuleId]);
				},

				/**
				 * Возвращает схему текущего раздела.
				 * @protected
				 * @virtual
				 * @return {Terrasoft.BaseEntitySchema} Текущая схема раздела.
				 */
				getModuleSchema: function() {
					return this.entitySchema;
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#subscribeSandboxEvents
				 * @overridden
				 */
				addSectionHistoryState: Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#subscribeSandboxEvents
				 * @overridden
				 */
				addCardHistoryState: Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#subscribeSandboxEvents
				 * @overridden
				 */
				removeCardHistoryState: Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#subscribeSandboxEvents
				 * @overridden
				 */
				removeSectionHistoryState: Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.configuration.BaseSchemaViewModel#getEditPageSchemaName
				 * @overridden
				 */
				getEditPageSchemaName: function() {
					var editPage = this.callParent(arguments);
					return editPage || "BaseLookupEditPage";
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#getProfileKey
				 * @overridden
				 */
				getProfileKey: function() {
					var currentTabName = this.getActiveViewName();
					var schemaName = this.name;
					return schemaName + this.entitySchemaName + "GridSettings" + currentTabName;
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#editRecord
				 * @overridden
				 */
				editRecord: function(primaryColumnValue) {
					this.Terrasoft.chain(
						function(next) {
							var activeRow = this.findActiveRow();
							this.saveRowChanges(activeRow, next);
						},
						function() {
							var activeRow = this.getActiveRow();
							var typeColumnValue = this.getTypeColumnValue(activeRow);
							var schemaName = this.getEditPageSchemaName(typeColumnValue);
							this.openCardInChain({
								id: primaryColumnValue,
								schemaName: schemaName,
								operation: ConfigurationEnums.CardStateV2.EDIT,
								moduleId: this.getChainCardModuleSandboxId(typeColumnValue)
							});
						}, this);

				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#getCardModuleResponseTags
				 * @overridden
				 */
				getCardModuleResponseTags: function() {
					var editCardsSandboxIds = this.callParent(arguments);
					editCardsSandboxIds.push(this.getChainCardModuleSandboxId(Terrasoft.GUID_EMPTY));
					return editCardsSandboxIds;
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#addRecord
				 * @overridden
				 */
				addRecord: function(typeColumnValue) {
					if (!typeColumnValue) {
						if (this.get("EditPages").getCount() > 1) {
							return false;
						}
						var tag = this.get("AddRecordButtonTag");
						typeColumnValue = tag || this.Terrasoft.GUID_EMPTY;
					}
					this.addRow(typeColumnValue);
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#copyRecord
				 * @overridden
				 */
				copyRecord: function(primaryColumnValue) {
					this.copyRow(primaryColumnValue);
				},

				/**
				 * Возвращает название схемы для модели предсталения элемента редактируемго реестра.
				 * @protected
				 * @return {String} Название схемы модели представления.
				 */
				getDefaultConfigurationGridItemSchemaName: function() {
					return "BaseLookupEditPage";
				},

				/**
				 * @inheritdoc Terrasoft.GridUtilitiesV2#getGridRowViewModelConfig
				 * @overridden
				 */
				getGridRowViewModelConfig: function() {
					var gridRowViewModelConfig =
						this.mixins.GridUtilities.getGridRowViewModelConfig.apply(this, arguments);
					Ext.apply(gridRowViewModelConfig, {entitySchema: this.entitySchema});
					var editPages = this.get("EditPages");
					this.Ext.apply(gridRowViewModelConfig.values, {HasEditPages: editPages && !editPages.isEmpty()});
					return gridRowViewModelConfig;
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#getGridRowViewModelClassName
				 * @overridden
				 */
				getGridRowViewModelClassName: function() {
					return this.mixins.GridUtilities.getGridRowViewModelClassName.apply(this, arguments);
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#onActiveRowAction
				 * @overridden
				 */
				onActiveRowAction: function() {
					this.mixins.ConfigurationGridUtilities.onActiveRowAction.apply(this, arguments);
					this.callParent(arguments);
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#getModuleCaption
				 * @overridden
				 */
				getModuleCaption: function() {
					var historyState = this.sandbox.publish("GetHistoryState");
					var state = historyState.state;
					if (state && state.caption) {
						return state.caption;
					}
					if (this.entitySchema) {
						var headerTemplate = this.get("Resources.Strings.HeaderCaptionTemplate");
						return Ext.String.format(headerTemplate, this.entitySchema.caption);
					}
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#getDefaultDataViews
				 * @overridden
				 */
				getDefaultDataViews: function() {
					var dataViews = this.callParent(arguments);
					delete dataViews.AnalyticsDataView;
					return dataViews;
				},

				/**
				 * Откатывает цепочку до предыдущего состояния.
				 * @protected
				 * @virtual
				 */
				closeSection: function() {
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#isMultiSelectVisible
				 * @overridden
				 */
				isMultiSelectVisible: function() {
					return false;
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#isSingleSelectVisible
				 * @overridden
				 */
				isSingleSelectVisible: function() {
					return false;
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#isUnSelectVisible
				 * @overridden
				 */
				isUnSelectVisible: function() {
					return false;
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#onRender
				 * @overridden
				 * @protected
				 */
				onRender: function() {
					var updateGrid = this.get("GridSettingsChanged") && !this.get("Restored");
					this.callParent(arguments);
					if (updateGrid) {
						this.reloadGridColumnsConfig(true);
					}
				},

				/**
				 * @inheritdoc Terrasoft.BaseSchemaViewModel#requireProfile
				 * @overridden
				 * @protected
				 */
				requireProfile: function(callback, scope) {
					this.callParent([function(profile) {
						if (Ext.Object.isEmpty(profile)) {
							profile = this.generateEntityProfile();
							this.set("GridSettingsChanged", true);
							var profileKey = this.getProfileKey();
							this.Terrasoft.utils.saveUserProfile(profileKey, profile, true);
						}
						if (this.Ext.isFunction(callback)) {
							callback.call(scope, profile);
						}
					}, this]);
				},

				/**
				 * Генерирует список столбцов реестра из списка колонок сущности.
				 * @protected
				 * @virtual
				 * @param {Object[]} columns Массив колонок сущности.
				 * @return {Array[]} Список столбцов реестра.
				 */
				generateGridRow: function(columns) {
					var items = [];
					var columnsCount = columns.length;
					var colSpan = Math.floor(24 / columnsCount);
					var col = 0;
					Terrasoft.each(columns, function(column) {
						var columnConfig = {
							"bindTo": column.name,
							"caption": column.caption,
							"position": {
								"column": col,
								"colSpan": colSpan,
								"row": 1
							},
							"captionConfig": {"visible": true},
							"dataValueType": column.dataValueType,
							"metaPath": column.columnPath,
							"path": column.columnPath
						};
						col += colSpan;
						items.push(columnConfig);
					}, this);
					return items;
				},

				/**
				 * Генерирует конфигурацию плиточного представления для списка по указанным колонкам.
				 * @protected
				 * @virtual
				 * @param {Object[]} columns Массив колонок сущности.
				 * @return {Object} Конфигурация плиточного представления для списка.
				 */
				generateTiledConfig: function(columns) {
					return {
						"grid": {
							"rows": 1,
							"columns": 24
						},
						"items": this.generateGridRow(columns)
					};
				},

				/**
				 * Генерирует конфигурацию списочного представления для списка по указанным колонкам.
				 * @protected
				 * @virtual
				 * @param {Object[]} columns Массив колонок сущности.
				 * @return {Object} Конфигурация списочного представления для списка.
				 */
				generateListedConfig: function(columns) {
					return {
						"items": this.generateGridRow(columns)
					};
				},

				/**
				 * Формирует список колонок, которые должны участвовать в настройке реестра по умолчанию.
				 * @protected
				 * @virtual
				 * @returns {Object[]} columns Массив колонок сущности.
				 */
				getDefaultGridColumns: function() {
					var entitySchema = this.entitySchema;
					var entitySchemaColumns = Ext.Object.getValues(entitySchema.columns);
					var primaryDisplayColumnName = entitySchema.primaryDisplayColumnName;
					entitySchemaColumns.sort(function(a, b) {
						if (a.name === primaryDisplayColumnName) {
							return -1;
						}
						if (b.name === primaryDisplayColumnName) {
							return 1;
						}
						return 0;
					}, this);
					var usedColumn = [];
					Terrasoft.each(entitySchemaColumns, function(column) {
						if (Ext.Array.contains(this.systemColumns, column.name)) {
							return;
						}
						usedColumn.push(column);
						if (usedColumn.length >= 4) {
							return false;
						}
					}, this);
					return usedColumn;
				},

				/**
				 * Генерирует профиль схемы по умолчанию.
				 * @protected
				 * @virtual
				 * @return {Object} Профиль схемы.
				 */
				generateEntityProfile: function() {
					var profileKey = this.getProfileKey();
					var columns = this.getDefaultGridColumns();
					var listedConfig = this.generateListedConfig(columns);
					var tiledConfig = this.generateTiledConfig(columns);
					var profile = {
						"key": profileKey,
						"DataGrid": {
							"tiledConfig": Terrasoft.encode(tiledConfig),
							"listedConfig": Terrasoft.encode(listedConfig),
							"key": profileKey,
							"isTiled": false,
							"type": Terrasoft.GridType.LISTED
						}
					};
					return profile;
				}

			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "remove",
					"name": "DataGridActiveRowOpenAction"
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowCopyAction"
				},
				{
					"operation": "remove",
					"name": "DataGridActiveRowDeleteAction"
				},
				{
					"operation": "remove",
					"name": "ProcessEntryPointGridRowButton"
				},
				{
					"operation": "insert",
					"name": "activeRowActionSave",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "save",
						"markerValue": "save",
						"imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
					}
				},
				{
					"operation": "insert",
					"name": "activeRowActionCopy",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "copy",
						"markerValue": "copy",
						"imageConfig": {"bindTo": "Resources.Images.CopyIcon"}
					}
				},
				{
					"operation": "insert",
					"name": "activeRowActionCard",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "card",
						"markerValue": "card",
						"visible": {"bindTo": "HasEditPages"},
						"imageConfig": {"bindTo": "Resources.Images.CardIcon"}
					}
				},
				{
					"operation": "insert",
					"name": "activeRowActionCancel",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "cancel",
						"markerValue": "cancel",
						"imageConfig": {"bindTo": "Resources.Images.CancelIcon"}
					}
				},
				{
					"operation": "insert",
					"name": "activeRowActionRemove",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "remove",
						"markerValue": "remove",
						"imageConfig": {"bindTo": "Resources.Images.RemoveIcon"}
					}
				},
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"className": "Terrasoft.ConfigurationGrid",
						"generator": "ConfigurationGridGenerator.generatePartial",
						"type": "listed",
						"generateControlsConfig": {"bindTo": "generateActiveRowControlsConfig"},
						"changeRow": {"bindTo": "changeRow"},
						"unSelectRow": {"bindTo": "unSelectRow"},
						"onGridClick": {"bindTo": "onGridClick"},
						"listedZebra": true,
						"initActiveRowKeyMap": {"bindTo": "initActiveRowKeyMap"},
						"activeRowAction": {"bindTo": "onActiveRowAction"}
					}
				},
				{
					"operation": "insert",
					"name": "SeparateModeBackButton",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"index": 2,
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.BackButtonCaption"},
						"click": {"bindTo": "closeSection"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"visible": {"bindTo": "SeparateModeActionsButtonVisible"}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
