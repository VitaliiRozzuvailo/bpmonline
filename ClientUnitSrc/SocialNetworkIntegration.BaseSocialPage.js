define("BaseSocialPage", ["css!SocialSearch"], function() {
	return {
		messages: {

			/**
			 * Сообщение о необходимости получения данных из социальных сетей.
			 */
			"GetSocialNetworkData": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * Соообщение об окончании загрузки данных из социальных сетей.
			 */
			"SocialNetworkDataLoaded": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			}
		},
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		methods: {

			/**
			 * @inheritdoc Terrasoft.BasePageV2#subscribeSandboxEvents
			 * @overridden
			 */
			subscribeSandboxEvents: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("GetSocialNetworkData", this.getSocialNetworkData, this);
			},

			/**
			 * Обработчик события загрузки данных из социальных сетей.
			 * @protected
			 * @return {Object} Средства связи из социальных сетей.
			 */
			getSocialNetworkData: function() {
				return this.get("SocialCommunications");
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#init
			 * @overridden
			 */
			init: function(callback, scope) {
				this.callParent([function() {
					this.initSocialPage();
					callback.call(scope);
				}, this]);
			},

			/**
			 * Инициализирует начальное состояние страницы обогащение данных из соц. сетей.
			 * @private
			 */
			initSocialPage: function() {
				this.set("ContactImages", Ext.create("Terrasoft.Collection"));
				this.set("IsChanged", true);
				this.set("CaptionName", this.entitySchema.caption);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#onEntityInitialized
			 * @overridden
			 */
			onEntityInitialized: function() {
				this.callParent(arguments);
				this.loadSocialProfileInfo();
			},

			/**
			 * Загружает информацию из социальных сетей.
			 * @protected
			 * @virtual
			 */
			loadSocialProfileInfo: this.Terrasoft.emptyFn,

			/**
			 * Обрабатывает ответы загрузки информации из социальных сетей.
			 * @protected
			 * @virtual
			 */
			socialProfileInfoLoaded: this.Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BasePageV2#getHeader
			 * @overridden
			 */
			getHeader: function() {
				return this.get("Resources.Strings.HeaderCaption");
			},

			/**
			 * Устанавливает признаки отображения кнопок Сохранить, Отмена и Закрыть.
			 * @private
			 */
			updateButtonsVisibility: function() {
				this.set("ShowCloseButton", false);
				this.set("ShowSaveButton", true);
				this.set("ShowDiscardButton", true);
				this.set("ActionsButtonVisible", false);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#onDiscardChangesClick
			 * @overridden
			 */
			onDiscardChangesClick: function() {
				this.onCloseClick();
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#onSaved
			 * @overridden
			 */
			onSaved: function() {
				this.callParent(arguments);
				this.onCloseClick();
			}

		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "remove",
				"name": "RightContainer"
			},
			{
				"operation": "remove",
				"name": "TabsContainer"
			},
			{
				"operation": "insert",
				"parentName": "CardContentContainer",
				"propertyName": "items",
				"name": "HeaderMessage",
				"values": {
					"itemType": Terrasoft.ViewItemType.LABEL,
					"caption": {"bindTo": "Resources.Strings.SelectValuesFieldsOrFillFieldsByHand"},
					"labelConfig": {
						"classes": ["header-container-margin-bottom", "width-auto"]
					}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
