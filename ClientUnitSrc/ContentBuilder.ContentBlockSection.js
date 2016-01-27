define("ContentBlockSection", ["ConfigurationEnums", "GridUtilitiesV2", "ContentBlockSectionGridRowViewModel",
		"css!ContentBlockCSS"],
function(ConfigurationEnums) {
	return {
		entitySchemaName: "ContentBlock",
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "SeparateModeAddRecordButton",
				"values": {
					"caption": {"bindTo": "Resources.Strings.AddBlockButtonCaption"}
				}
			},
			{
				"operation": "merge",
				"name": "CombinedModeAddRecordButton",
				"values": {
					"caption": {"bindTo": "Resources.Strings.AddBlockButtonCaption"}
				}
			},
			{
				"operation": "insert",
				"name": "SeparateModeBackButton",
				"parentName": "SeparateModeActionButtonsLeftContainer",
				"propertyName": "items",
				"index": 2,
				"values": {
					"itemType": this.Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.BackButtonCaption"},
					"click": {"bindTo": "closeSection"},
					"classes": {
						"textClass": ["actions-button-margin-right"],
						"wrapperClass": ["actions-button-margin-right"]
					},
					"visible": {"bindTo": "SeparateModeActionsButtonVisible"}
				}
			}
		]/**SCHEMA_DIFF*/,
		methods: {

			/**
			 * @inheritdoc Terrasoft.BaseSectionV2#addSectionDesignerViewOptions
			 * @overridden
			 */
			addSectionDesignerViewOptions: this.Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BaseSectionV2#addSectionHistoryState
			 * @overridden
			 */
			addSectionHistoryState: this.Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BaseSectionV2#removeSectionHistoryState
			 * @overridden
			 */
			removeSectionHistoryState: this.Terrasoft.emptyFn,

			/**
			 * Скрывает пункты меню кнопки "Запустить процесс".
			 * @inheritdoc ProcessEntryPointUtilities#initRunProcessButtonMenu
			 * @overridden
			 */
			initRunProcessButtonMenu: this.Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BaseSectionV2#addCardHistoryState
			 * @overridden
			 */
			addCardHistoryState: function(schemaName, operation, primaryColumnValue) {
				if (!schemaName) {
					return;
				}
				var cardOperationConfig = {
					schemaName: schemaName,
					operation: operation,
					primaryColumnValue: primaryColumnValue
				};
				var historyState = this.getHistoryStateInfo();
				var stateConfig = this.getCardHistoryStateConfig(cardOperationConfig);
				var eventName = (historyState.workAreaMode === ConfigurationEnums.WorkAreaMode.COMBINED)
					? "ReplaceHistoryState"
					: "PushHistoryState";
				this.sandbox.publish(eventName, stateConfig);
			},

			/**
			 * @inheritdoc Terrasoft.BaseSectionV2#removeCardHistoryState
			 * @overridden
			 */
			removeCardHistoryState: function () {
				var module = "LookupSectionModule";
				var schema = this.name;
				var historyState = this.sandbox.publish("GetHistoryState");
				var currentState = historyState.state;
				var newState = {
					moduleId: currentState.moduleId
				};
				var hash = [module, schema].join("/");
				this.sandbox.publish("PushHistoryState", {
					hash: hash,
					stateObj: newState,
					silent: true
				});
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
			 * @inheritDoc Terrasoft.BaseSectionV2#getGridRowViewModelClassName
			 * @overridden
			 */
			getGridRowViewModelClassName: function() {
				return "Terrasoft.ContentBlockSectionGridRowViewModel";
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
				var module = "LookupSection";
				this.sandbox.publish("PushHistoryState", {
					hash: this.Terrasoft.combinePath("SectionModuleV2", module)
				});
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
					return this.Ext.String.format(headerTemplate, this.entitySchema.caption);
				}
			},

			/**
			 * @inheritDoc Terrasoft.GridUtilities#actualizeTiledGridConfig
			 * @overridden
			 */
			actualizeTiledGridConfig: function (viewGenerator, gridConfig) {
				this.callParent([viewGenerator, gridConfig]);
				this.modifyConfig(gridConfig);
			},

			/**
			 * @inheritDoc Terrasoft.GridUtilities#onGridLoaded
			 * @overridden
			 */
			onGridLoaded: function() {
				this.reloadGridColumnsConfig(false);
			},

			/**
			 * Добавляет в конфиг плиточного реестра строку с изображением.
			 * @protected
			 * @param {Object} gridConfig Конфиг плиточного реестра.
			 */
			modifyConfig: function(gridConfig) {
				var item = gridConfig.isVertical
					? this.getImageConfigForTiledVerticalGrid()
					: this.getImageConfigForTiledGrid();
				var columnsConfig = gridConfig.tiledConfig.columnsConfig;
				this.Ext.Array.insert(columnsConfig, 0, [item]);
			},

			/**
			 * Возвращает config изображения для вертикального реестра.
			 * @protected
			 * @return {*[]} config.
			 */
			getImageConfigForTiledVerticalGrid: function() {
				return [
					[
						{
							"cols": 24,
							"key": [
								{
									"name": {
										"bindTo": "Image"
									},
									"type": "grid-icon-128x64"
								}
							]
						}
					]
				];
			},

			/**
			 * Возвращает config изображения для плиточного реестра.
			 * @protected
			 * @return {Object} config.
			 */
			getImageConfigForTiledGrid: function() {
				return {
					"cols": 24,
					"key": [
						{
							"name": {
								"bindTo": "Image"
							},
							"type": "grid-icon-128x128"
						}
					]
				};
			}
		}
	};
});
