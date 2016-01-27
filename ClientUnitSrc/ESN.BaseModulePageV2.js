define("BaseModulePageV2", ["ServiceHelper"], function(ServiceHelper) {
	return {
		messages: {
			/**
			 *
			 */
			"RerenderModule": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},
			/**
			 *
			 */
			"InitModuleViewModel": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			},
			/**
			 * Обновляет значение признака того, что пользователь подписан на канал.
			 * @message UpdateSubscribeAction
			 */
			"UpdateSubscribeAction": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			}
		},
		methods: {

			/**
			 * Проверяет, подписан ли текущий пользователь на объект.
			 * @private
			 */
			getIsSubscribed: function() {
				var entityId = this.get("Id");
				if (!entityId) {
					this.set("IsSubscribed", false);
					return;
				}
				ServiceHelper.callService("SocialSubscriptionService", "GetIsUserSubscribed", function(response) {
					var result = response.GetIsUserSubscribedResult;
					this.set("IsSubscribed", result);
					this.sandbox.publish("UpdateSubscribeAction", {
						isSubscribed: result
					}, [this.sandbox.id]);
				}, {entityId: entityId}, this);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#onSaved
			 * @overridden
			 */
			onSaved: function(cardSaveResponse, config) {
				this.callParent(arguments);
				this.subscribeOwner(config);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#save
			 * @overridden
			 */
			save: function() {
				this.callParent(arguments);
				this.scheduleOwnerSubscription();
			},

			/**
			 * Подписывает ответственного данного канала на его изменения.
			 * @protected
			 * @virtual
			 * @param {Object} config Параметры сохранения записи.
			 * @param {Object} config.subscribeOwner Указывает на необходимость выполнить подписку ответственного на
			 * текущий канал.
			 */
			subscribeOwner: function(config) {
				if (!this.get("OwnerSubscriptionScheduled")) {
					return;
				}
				if (config && (config.subscribeOwner === false)) {
					return;
				}
				this.set("OwnerSubscriptionScheduled", false);
				var entityId = this.get("Id");
				var serviceConfig = {
					serviceName: "SocialSubscriptionService",
					methodName: "SubscribeContact",
					data: {
						contactId: this.getOwnerColumnValue(),
						entityId: entityId,
						entitySchemaUId: this.entitySchema.uId
					}
				};
				this.callService(serviceConfig, this.onOwnerSubscribed, this);
			},

			/**
			 * Обрабатывает событие подписки ответственного.
			 * @protected
			 */
			onOwnerSubscribed: Terrasoft.emptyFn,

			/**
			 * Запланирует подписку ответственного данной сущности на сообщения, если он изменился.
			 * @protected
			 * @virtual
			 */
			scheduleOwnerSubscription: function() {
				if (this.changedValues && this.changedValues[this.getOwnerColumnName()]) {
					this.set("OwnerSubscriptionScheduled", true);
				}
			},

			/**
			 * Возвращает название колонки "Ответственный".
			 * @private
			 * @return {string} Название колонки "Ответственный".
			 */
			getOwnerColumnName: function() {
				var ownerColumn = this.entitySchema.columns.Owner;
				var ownerColumnName;
				if (ownerColumn) {
					ownerColumnName = ownerColumn.name;
				}
				return ownerColumnName;
			},

			/**
			 * Возвращает значение колонки "Ответственный".
			 * @private
			 * @return {string} Значение колонки "Ответственный".
			 */
			getOwnerColumnValue: function() {
				var ownerColumnName = this.getOwnerColumnName();
				var ownerColumnValue;
				if (ownerColumnName) {
					ownerColumnValue = this.get(ownerColumnName);
				}
				return ownerColumnValue && ownerColumnValue.value;
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#updateDetails
			 * @overridden
			 */
			updateDetails: function() {
				this.callParent(arguments);
				var config = {
					activeSocialMessageId: this.get("ActiveSocialMessageId")
				};
				this.sandbox.publish("InitModuleViewModel", config, [this.getSocialFeedSandboxId()]);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#subscribeSandboxEvents
			 * @overridden
			 */
			subscribeSandboxEvents: function() {
				var id = this.get("PrimaryColumnValue");
				var tags = id ? [id] : null;
				this.sandbox.subscribe("ReloadCard", this.onReloadCard, this, tags);
				this.sandbox.subscribe("GetRecordInfo", this.onGetRecordInfo, this, [this.getSocialFeedSandboxId()]);
				this.callParent(arguments);
			},

			/**
			 *
			 */
			getSaveRecordMessagePublishers: function() {
				var publishers = this.callParent(arguments);
				publishers.push(this.getSocialFeedSandboxId());
				return publishers;
			},

			/**
			 *
			 */
			loadESNFeed: function() {
				var moduleId = this.getSocialFeedSandboxId();
				var rendered = this.sandbox.publish("RerenderModule", {
					renderTo: "ESNFeed"
				}, [moduleId]);
				if (!rendered) {
					var esnFeedModuleConfig = {
						renderTo: "ESNFeed",
						id: moduleId
					};
					var activeSocialMessageId = this.get("ActiveSocialMessageId") ||
						this.getDefaultValueByName("ActiveSocialMessageId");
					if (!Ext.isEmpty(activeSocialMessageId)) {
						esnFeedModuleConfig.parameters = {activeSocialMessageId: activeSocialMessageId};
					}
					this.sandbox.loadModule("ESNFeedModule", esnFeedModuleConfig);
				}
			},

			/**
			 * Возвращает информацию о записи.
			 * @protected
			 * @return {Object} Информация о записи.
			 */
			onGetRecordInfo: function() {
				var entitySchema = this.entitySchema;
				var primaryColumnValue = this.get("PrimaryColumnValue") || this.get(entitySchema.primaryColumnName);
				var channelName = this.get(entitySchema.primaryDisplayColumnName);
				var publisherRightKind = this.get("PublisherRightKind");
				return {
					channelId: primaryColumnValue,
					channelName: channelName,
					entitySchemaUId: entitySchema.uId,
					entitySchemaName: entitySchema.name,
					publisherRightKind: publisherRightKind
				};
			},

			/**
			 * Метод, срабатывающий после инициализации объекта
			 * @override
			 */
			onEntityInitialized: function() {
				this.getIsSubscribed();
				this.callParent(arguments);
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			getEntityInitializedSubscribers: function() {
				var subcribers = this.callParent(arguments);
				subcribers.push(this.getSocialFeedSandboxId());
				return subcribers;
			},

			/**
			 * Возвращает индетификатор модуля Ленты.
			 * @private
			 * @return {String} Индетификатор sandbox для ленты.
			 */
			getSocialFeedSandboxId: function() {
				return this.sandbox.id + "_ESNFeed";
			},

			/**
			 * @inheritdoc
			 * @overridden
			 */
			initTabs: function() {
				if (this.entitySchemaName !== "SocialChannel") {
					var tabsCollection = this.get("TabsCollection");
					var tabsCount = tabsCollection.getCount();
					if (tabsCollection.contains("ESNTab")) {
						var esnTab = tabsCollection.get("ESNTab");
						tabsCollection.removeByKey("ESNTab");
						tabsCollection.insert(tabsCount, "ESNTab", esnTab);
					}
				}
				this.callParent(arguments);
			},

			/**
			 * Возвращает видимость кнопки "Подписаться".
			 * @protected
			 * @param {Boolean} value Признак подписки текущего пользователя на ленту объекта.
			 * @return {Boolean} Видимость кнопки "Подписаться".
			 */
			getSubscribeButtonVisible: function(value) {
				return !value;
			},

			/**
			 * Подписывает пользователя и обновляет деталь "Подписчики".
			 * @protected
			 * @virtual
			 */
			subscribeUser: function() {
				var entitySchema = this.entitySchema;
				var serviceMethodName = "SubscribeUser";
				var config = {
					serviceName: "SocialSubscriptionService",
					methodName: serviceMethodName,
					data: {
						entityId: this.get("Id"),
						entitySchemaUId: entitySchema.uId
					}
				};
				this.callService(config, function(response) {
					var result = response[serviceMethodName + "Result"];
					if (!result) {
						return;
					}
					var message = "";
					if (result.success) {
						this.set("IsSubscribed", true);
						this.sandbox.publish("UpdateSubscribeAction", {isSubscribed: true}, [this.sandbox.id]);
						this.updateSubscribersDetail();
						message = this.Ext.String.format(this.get("Resources.Strings.SubscribedInformationDialog"),
							this.get(entitySchema.primaryDisplayColumnName));
					} else {
						var responseStatus = result.responseStatus;
						message = this.Ext.String.format("{0}: {1}", responseStatus.ErrorCode, responseStatus.Message);
					}
					this.showInformationDialog(message);
				}, this);
			},

			/**
			 * Отписывает пользователя и обновляет деталь "Подписчики"
			 */
			unsubscribeUser: function() {
				var entityId = this.get("Id");
				ServiceHelper.callService("SocialSubscriptionService", "UnsubscribeUser", function(response) {
					var result = response.UnsubscribeUserResult;
					if (result) {
						this.showInformationDialog(result);
						return;
					}
					this.set("IsSubscribed", false);
					this.sandbox.publish("UpdateSubscribeAction", {
						isSubscribed: false
					}, [this.sandbox.id]);
					this.updateSubscribersDetail();
					var channelTitle = Ext.String.format(this.get("Resources.Strings.UnsubscribedInformationDialog"),
						this.get(this.entitySchema.primaryDisplayColumnName));
					this.showInformationDialog(channelTitle);
				}, {entityId: entityId}, this);
			},

			updateSubscribersDetail: function() {
				return;
			},

			/**
			 * Возвращает коллекцию действий раздела в режиме отображения вертикального реестра и карточки
			 * @protected
			 * @overridden
			 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий раздела в режиме
			 * отображения вертикального реестра и карточки
			 */
			getActions: function() {
				var actionMenuItems = this.callParent(arguments);
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Visible": {
						"bindTo": "IsSubscribed",
						"bindConfig": {"converter": "getSubscribeButtonVisible"}
					},
					"Caption": {"bindTo": "Resources.Strings.SubscribeCaption"},
					"Enabled": {"bindTo": "canEntityBeOperated"},
					"Tag": "subscribeUser"
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Visible": {"bindTo": "IsSubscribed"},
					"Caption": {"bindTo": "Resources.Strings.UnsubscribeCaption"},
					"Enabled": {"bindTo": "canEntityBeOperated"},
					"Tag": "unsubscribeUser"
				}));
				return actionMenuItems;
			}

		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "ESNTab",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"values": {
					caption: {bindTo: "Resources.Strings.ESNTabCaption"},
					items: []
				}
			},
			{
				"operation": "insert",
				"parentName": "ESNTab",
				"name": "ESNFeedContainer",
				"propertyName": "items",
				"values": {
					itemType: Terrasoft.ViewItemType.CONTAINER,
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "ESNFeedContainer",
				"propertyName": "items",
				"name": "ESNFeed",
				"values": {
					"itemType": Terrasoft.ViewItemType.MODULE,
					"moduleName": "ESNFeedModule",
					afterrender: {bindTo: "loadESNFeed"},
					afterrerender: {bindTo: "loadESNFeed"}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
