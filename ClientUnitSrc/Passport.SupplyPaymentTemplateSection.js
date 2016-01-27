define("SupplyPaymentTemplateSection", ["GridUtilitiesV2"],
	function() {
		return {
			entitySchemaName: "SupplyPaymentTemplate",
			contextHelpId: "",
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "SeparateModeBackButton",
					"parentName": "SeparateModeActionButtonsLeftContainer",
					"propertyName": "items",
					"index": 2,
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.CloseButtonCaption"},
						"click": {"bindTo": "closeSection"},
						"classes": {
							"textClass": ["actions-button-margin-right"],
							"wrapperClass": ["actions-button-margin-right"]
						},
						"visible": {"bindTo": "SeparateModeActionsButtonVisible"}
					}
				}
			]/**SCHEMA_DIFF*/,
			attributes: {
				/**
				 * Признак видимости действия "добавить в группу".
				 * @overridden
				 */
				IsIncludeInFolderButtonVisible: {value: false},

				/**
				 * Признак видимости действия "Настроить итоги".
				 * @overridden
				 */
				IsSummarySettingsVisible: {value: false}
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
				addSectionHistoryState: Terrasoft.emptyFn,

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
				 * @inheritdoc Terrasoft.BaseSectionV2#getDefaultDataViews
				 * @overridden
				 */
				getDefaultDataViews: function() {
					var dataViews = this.callParent(arguments);
					delete dataViews.AnalyticsDataView;
					return dataViews;
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
				 * Откатывает цепочку до предыдущего состояния.
				 * @protected
				 * @virtual
				 */
				closeSection: function() {
					this.sandbox.publish("BackHistoryState");
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
				 * @inheritdoc Terrasoft.BaseSectionV2#getProfileKey
				 * @overridden
				 */
				getProfileKey: function() {
					var currentTabName = this.getActiveViewName();
					var schemaName = this.name;
					return schemaName + this.entitySchemaName + "GridSettings" + currentTabName;
				},

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
					var stateConfig = this.getCardHistoryStateConfig(cardOperationConfig);
					this.sandbox.publish("ReplaceHistoryState", stateConfig);
				}
			}
		};
	});
