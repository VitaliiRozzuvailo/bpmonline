define("ESNFeedSectionV2", [], function() {
	return {
		entitySchemaName: "SocialChannel",
		attributes: {
			/**
			 * Название представления "Лента"
			 */
			"ESNFeedDataViewName": {
				dataValueType: Terrasoft.DataValueType.TEXT,
				value: "ESNFeedDataView"
			}
		},
		messages: {
			"CanSubscribe": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},
			/**
			 * @message RemoveChannel
			 * Публикует сообщение об удалении канала.
			 */
			"RemoveChannel": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			}
		},
		methods: {

			/**
			 * Инициализация подписки на сообщение CanSubscribe от карточки.
			 */
			initCanSubscribeChangedHandler: function() {
				this.sandbox.subscribe("CanSubscribe", function(config) {
					this.set(config.key, config.value);
				}, this);
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			onDeleted: function(result) {
				this.callParent(result);
				this.sandbox.publish("RemoveChannel", {
					deletedItems: result.DeletedItems
				});
			},

			/**
			 * Загружает модуль ленты в указанный контейнер.
			 * @protected
			 * @param {Boolean} loadData
			 */
			loadESNFeedDataView: function(loadData) {
				if (!loadData) {
					return;
				}
				var isSocialFeedDataView = this.getIsSocialFeedDataView();
				if (!isSocialFeedDataView) {
					return;
				}
				this.loadSocialFeedModule("ESNFeedSectionContainer");
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			onRender: function() {
				this.callParent(arguments);
				this.loadESNFeedDataView(true);
			},

			/**
			 * Возвращает признак того, что активное представление это Лента.
			 * @private
			 * @return {Boolean}
			 */
			getIsSocialFeedDataView: function() {
				return (this.getActiveViewName() === this.get("ESNFeedDataViewName"));
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			loadFiltersModule: function() {
				var isSocialFeedDataView = this.getIsSocialFeedDataView();
				if (isSocialFeedDataView) {
					return;
				}
				this.callParent(arguments);
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			loadSummary: function() {
				var isSocialFeedDataView = this.getIsSocialFeedDataView();
				if (isSocialFeedDataView) {
					return;
				}
				this.callParent(arguments);
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			initSeparateModeActionsButtonHeaderMenuItemCaption: function() {
				var caption = this.getSocialChannelGridDataViewCaption();
				this.set("SeparateModeActionsButtonHeaderMenuItemCaption", caption);
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			getDefaultDataViews: function() {
				var socialChannelDataView = {
					name: this.get("GridDataViewName"),
					active: false,
					caption: this.getSocialChannelGridDataViewCaption(),
					icon: this.getDefaultGridDataViewIcon()
				};
				var esnFeedDataView = {
					name: this.get("ESNFeedDataViewName"),
					active: true,
					caption: this.getDefaultGridDataViewCaption(),
					icon: this.getESNFeedGridDataViewIcon()
				};
				return {
					"ESNFeedDataView": esnFeedDataView,
					"GridDataView": socialChannelDataView
				};
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			changeDataView: function(viewConfig) {
				this.callParent(arguments);
				var viewName = (typeof viewConfig === "string") ? viewConfig : viewConfig.tag;
				var isSocialChannelDataView = (viewName === this.get("GridDataViewName"));
				this.sandbox.publish("ChangeHeaderCaption", {
					caption: isSocialChannelDataView ? this.getSocialChannelGridDataViewCaption() :
						this.getDefaultGridDataViewCaption(),
					dataViews: this.get("DataViews"),
					moduleName: this.name
				});
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			loadView: function(dataViewName, loadData) {
				var isViewChanged = this.get("IsViewChanged");
				if (!isViewChanged) {
					return;
				}
				var isGridDataView = (dataViewName === this.get("GridDataViewName"));
				if (isGridDataView && loadData) {
					this.callParent([dataViewName, false]);
					var filtersContainerId = "SectionFiltersContainer";
					if (this.checkElementExists(filtersContainerId)) {
						this.loadQuickFilterModule(filtersContainerId);
					}
					var summaryContainerId = "SectionSummaryContainer";
					if (this.checkElementExists(summaryContainerId)) {
						this.loadSummaryModule(summaryContainerId);
					}
				} else {
					this.unloadQuickFilterModule();
					this.unloadSummaryModule();
					this.callParent(arguments);
				}
			},

			/**
			 * Загружает модуль быстрой фильтрации.
			 * @private
			 * @param {String} renderTo
			 */
			loadQuickFilterModule: function(renderTo) {
				var quickFilterModuleId = this.getQuickFilterModuleSandboxId();
				this.sandbox.loadModule("QuickFilterModuleV2", {
					renderTo: renderTo,
					reload: false,
					id: quickFilterModuleId
				});
			},

			/**
			 * Выгружает модуль быстрой фильтрации.
			 * @private
			 */
			unloadQuickFilterModule: function() {
				var quickFilterModuleSandboxId = this.getQuickFilterModuleSandboxId();
				this.sandbox.unloadModule(quickFilterModuleSandboxId);
			},

			/**
			 * Загружает модуль итогов.
			 * @private
			 * @param {String} renderTo
			 */
			loadSummaryModule: function(renderTo) {
				var summaryModuleId = this.getSummaryModuleSandboxId();
				this.sandbox.loadModule("SummaryModuleV2", {
					renderTo: renderTo || "SectionSummaryContainer",
					reload: false,
					id: summaryModuleId
				});
			},

			/**
			 * Выгружает модуль итогов.
			 * @private
			 */
			unloadSummaryModule: function() {
				var summaryModuleSandboxId = this.getSummaryModuleSandboxId();
				this.sandbox.unloadModule(summaryModuleSandboxId);
			},

			/**
			 * Загружает модуль Ленты.
			 * @private
			 * @param {String} renderTo
			 */
			loadSocialFeedModule: function(renderTo) {
				var socialFeedModuleId = this.getSocialFeedModuleSandboxId();
				this.sandbox.loadModule("ESNFeedModule", {
					renderTo: renderTo,
					id: socialFeedModuleId,
					reload: false
				});
			},

			/**
			 * Выгружает модуль Ленты.
			 * @private
			 */
			unloadSocialFeedModule: function() {
				var socialFeedModuleId = this.getSocialFeedModuleSandboxId();
				this.sandbox.unloadModule(socialFeedModuleId);
			},

			/**
			 * Проверяет наличие элемента в разметке.
			 * @param {String} elementId Идентификатор элемента.
			 * @return {Boolean} Наличие элемента в разметке.
			 */
			checkElementExists: function(elementId) {
				var container = this.Ext.getCmp(elementId);
				return !!container;
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			setActiveView: function(activeViewName) {
				this.showBodyMask({timeout: 0});
				var isSocialFeedDataView = this.getIsSocialFeedDataView();
				if (isSocialFeedDataView && this.get("IsViewChanged")) {
					var isAnySelected = this.isAnySelected();
					if (isAnySelected) {
						this.deselectRows();
					}
				}
				var dataViewVisiblePropertyName = this.getDataViewVisiblePropertyName(activeViewName);
				var isViewChanged = !this.get(dataViewVisiblePropertyName);
				this.set("IsViewChanged", isViewChanged);
				this.callParent(arguments);
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			init: function() {
				this.callParent(arguments);
				this.initCanSubscribeChangedHandler();
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			initContextHelp: function() {
				this.set("ContextHelpId", 1036);
				this.callParent(arguments);
			},

			/**
			 * Возвращает заголовок представления "Лента".
			 * @private
			 * @return {String}
			 */
			getSocialChannelGridDataViewCaption: function() {
				return this.get("Resources.Strings.SocialChannelSectionCaption");
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			getDefaultGridDataViewCaption: function() {
				return this.get("Resources.Strings.GridDataViewCaption");
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			getDefaultGridDataViewIcon: function() {
				return this.get("Resources.Images.GridDataViewIcon");
			},

			/**
			 * Возвращает изображение представления Лента.
			 * @protected
			 */
			getESNFeedGridDataViewIcon: function() {
				return this.get("Resources.Images.ESNFeedDataViewIcon");
			},

			/**
			 * Возвращает видимость кнопок шапки представления.
			 * @private
			 * @return {boolean}
			 */
			getActionButtonsVisible: function() {
				return (this.get("ActiveViewName") !== this.get("ESNFeedDataViewName"));
			},

			/**
			 * Возвращает идентификатор модуля Ленты.
			 * @private
			 * @return {string} Идентификатор модуля Ленты.
			 */
			getSocialFeedModuleSandboxId: function() {
				return this.sandbox.id + "_ESNFeed";
			},

			/**
			 * Возвращает идентификатор модуля быстрой фильтрации.
			 * @private
			 * @return {string} Идентификатор модуля быстрой фильтрации.
			 */
			getQuickFilterModuleSandboxId: function() {
				return this.sandbox.id + "_QuickFilterModuleV2";
			},

			/**
			 * Возвращает идентификатор модуля итогов.
			 * @private
			 * @return {string} Идентификатор модуля итогов.
			 */
			getSummaryModuleSandboxId: function() {
				return this.sandbox.id + "_SummaryModuleV2";
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			updateSection: function() {
				var isSocialFeedDataView = this.getIsSocialFeedDataView();
				if (isSocialFeedDataView) {
					return;
				}
				this.callParent(arguments);
			}

		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"index": 3,
				"parentName": "CombinedModeActionButtonsCardLeftContainer",
				"propertyName": "items",
				"name": "SubscribeChannelButton",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.SubscribeButtonCaption"},
					"click": {"bindTo": "onCardAction"},
					"visible": {
						"bindTo": "IsSubscribed",
						"bindConfig": {"converter": "getSubscribeButtonVisible"}
					},
					"classes": {"textClass": ["actions-button-margin-right"]},
					"style": Terrasoft.controls.ButtonEnums.style.GREEN,
					"tag": "subscribeUser"
				}
			},
			{
				"operation": "insert",
				"index": 4,
				"parentName": "CombinedModeActionButtonsCardLeftContainer",
				"propertyName": "items",
				"name": "UnsubscribeChannelButton",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.UnsubscribeButtonCaption"},
					"click": {"bindTo": "onCardAction"},
					"visible": {"bindTo": "IsSubscribed"},
					"classes": {"textClass": ["actions-button-margin-right"]},
					"style": Terrasoft.controls.ButtonEnums.style.GREEN,
					"tag": "unsubscribeUser"
				}
			},
			{
				"operation": "remove",
				"parentName": "RightContainer",
				"propertyName": "items",
				"name": "ViewOptionsButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.ViewOptionsButtonCaption"}
				}
			},
			{
				"operation": "merge",
				"name": "GridUtilsContainer",
				"parentName": "DataViewsContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["utils-container-wrapClass"],
					"visible": {"bindTo": "getActionButtonsVisible"}
				}
			},
			{
				"operation": "merge",
				"name": "ActionButtonsContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"id": "ActionButtonsContainer",
					"selectors": {"wrapEl": "#ActionButtonsContainer"},
					"wrapClass": ["action-buttons-container-wrapClass"],
					"visible": {
						"bindTo": "getActionButtonsVisible"
					}
				}
			},
			{
				"operation": "insert",
				"name": "ESNFeedDataView",
				"parentName": "DataViewsContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.SECTION_VIEW,
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "ESNFeedSectionContainer",
				"parentName": "ESNFeedDataView",
				"propertyName": "items",
				"values": {
					"id": "ESNFeedSectionContainer",
					"selectors": {"wrapEl": "#ESNFeedSectionContainer"},
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["esnFeedSection-container-margin"],
					"items": []
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
