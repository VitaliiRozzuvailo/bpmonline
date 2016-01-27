define("BaseSectionV2", ["terrasoft", "ServiceHelper"], function(Terrasoft, ServiceHelper) {
	return {
		messages: {
			/**
			 * Обновляет значение признака того, что пользователь подписан на канал.
			 * @message UpdateSubscribeAction
			 */
			"UpdateSubscribeAction": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		methods: {

			/**
			 * @inheritDoc Terrasoft.BaseSectionV2#subscribeSandboxEvents
			 * @overridden
			 */
			subscribeSandboxEvents: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("UpdateSubscribeAction", function(config) {
					this.updateIsSubscribed(config.isSubscribed);
				}, this, this.getCardModuleSandboxIdentifiers());
			},

			/**
			 * Возвращает значение свойства Видимость кнопки Подписаться.
			 * @private
			 * @param {Boolean} value Значение свойства IsSubscribed.
			 * @return {Boolean} Значение свойства Видимость кнопки Подписаться.
			 */
			getSubscribeButtonVisible: function(value) {
				return !value;
			},

			/**
			 * @obsolete
			 */
			onSubscribeButtonClick: function() {
				var entity = this.getActiveRow();
				if (!entity) {
					return;
				}
				var entityId = entity.get("Id");
				ServiceHelper.callService("SocialSubscriptionService", "SubscribeUser", function() {
					this.updateIsSubscribed(true);
				}, {
					entityId: entityId,
					entitySchemaUId: entity.entitySchema.uId
				}, this);
			},

			/**
			 * Обновляет значение признака того, что пользователь подписан на канал.
			 * @private
			 * @param {Boolean} isSubscribed Новое значение.
			 */
			updateIsSubscribed: function(isSubscribed) {
				this.set("IsSubscribed", isSubscribed);
				this.sandbox.publish("UpdateCardProperty", {
					key: "IsSubscribed",
					value: isSubscribed
				}, this.getCardModuleSandboxIdentifiers());
			},

			/**
			 * @obsolete
			 */
			onUnsubscribeButtonClick: function() {
				var entity = this.getActiveRow();
				if (!entity) {
					return;
				}
				var entityId = entity.get("Id");
				ServiceHelper.callService("SocialSubscriptionService", "UnsubscribeUser", function() {
					this.updateIsSubscribed(false);
				}, {entityId: entityId}, this);
			}
		},
		diff: /**SCHEMA_DIFF*/[{
			"operation": "merge",
			"name": "CombinedModeAddRecordButton",
			"parentName": "CombinedModeActionButtonsSectionContainer",
			"propertyName": "items",
			"values": {
				"itemType": Terrasoft.ViewItemType.BUTTON,
				"style": Terrasoft.controls.ButtonEnums.style.BLUE,
				"caption": { "bindTo": "AddRecordButtonCaption" },
				"click": { "bindTo": "addRecord" }
			}
		}]/**SCHEMA_DIFF*/
	};
});
