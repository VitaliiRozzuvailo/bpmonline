define("SocialChannelSectionV2", [],
		function() {
			return {
				entitySchemaName: "SocialChannel",
				columns: {},
				messages: {
					"CanSubscribe": {
						mode: this.Terrasoft.MessageMode.PTP,
						direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
					}
				},
				methods: {
					getAddRecordButtonCaption: function() {
						return this.get("Resources.Strings.AddChannel");
					},

					/**
					 * Инициализация подписки на сообщение CanSubscribe от карточки
					 */
					initCanSubscribeChangedHandler: function() {
						var me = this;
						this.sandbox.subscribe("CanSubscribe", function(config) {
							me.set(config.key, config.value);
						});
					},

					/**
					 * Инициализация
					 * @overridden
					 */
					init: function() {
						this.initCanSubscribeChangedHandler();
						this.callParent(arguments);
					},

					/**
					 * @overridden
					 */
					initContextHelp: function() {
						this.set("ContextHelpId", 1037);
						this.callParent(arguments);
					},

					/**
					 * Установка заголовка раздела
					 * @overridden
					 */
					getDefaultGridDataViewCaption: function() {
						return this.get("Resources.Strings.GridDataViewCaption");
					}
				},
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "insert",
						"parentName": "CombinedModeActionButtonsCardLeftContainer",
						"propertyName": "items",
						"name": "SubscribeChannelButton",
						"index": 0,
						"values": {
							itemType: this.Terrasoft.ViewItemType.BUTTON,
							caption: {
								bindTo: "Resources.Strings.SubscribeButtonCaption"
							},
							click: {bindTo: "onCardAction"},
							visible: {bindTo: "ToSubscribe"},
							classes: {textClass: ["actions-button-margin-right"]},
							tag: "onSubscribeChannelClick"
						}
					},
					{
						"operation": "insert",
						"parentName": "CombinedModeActionButtonsCardLeftContainer",
						"propertyName": "items",
						"name": "UnsubscribeChannelButton",
						"index": 0,
						"values": {
							itemType: this.Terrasoft.ViewItemType.BUTTON,
							caption: {
								bindTo: "Resources.Strings.UnsubscribeButtonCaption"
							},
							click: {bindTo: "onCardAction"},
							visible: {bindTo: "ToUnsubscribe"},
							classes: {textClass: ["actions-button-margin-right"]},
							tag: "onUnsubscribeChannelClick"
						}
					}
				]/**SCHEMA_DIFF*/,
				userCode: {}
			};
		});