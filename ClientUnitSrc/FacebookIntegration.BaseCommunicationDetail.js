define("BaseCommunicationDetail", ["ConfigurationConstants", "FacebookClientUtilities",
		"FacebookCommunicationViewModel"], function(ConfigurationConstants) {
	return {
		attributes: {
			/**
			 * Признак того, что добавлен профиль Facebook.
			 */
			FacebookProfileExists: {
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				value: false
			},

			/**
			 * Название схемы страницы поиска в Facebook.
			 */
			FacebookSearchSchemaName: {
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				dataValueType: Terrasoft.DataValueType.TEXT,
				value: "FacebookSearchSchema"
			}
		},
		mixins: {
			FacebookClientUtilities: "Terrasoft.FacebookClientUtilities"
		},
		methods: {

			/**
			 * @inheritdoc Terrasoft.BaseCommunicationDetail#changeCardPageButtonsVisibility
			 * @overridden
			 */
			changeCardPageButtonsVisibility: function() {
				this.callParent(arguments);
				this.updateFacebookProfileInfo();
			},

			/**
			 * @inheritdoc Terrasoft.BaseCommunicationDetail#onContainerListDataLoaded
			 * @overridden
			 */
			onContainerListDataLoaded: function() {
				this.callParent(arguments);
				this.updateFacebookProfileInfo();
			},

			/**
			 * Обновляет признак наличия средства связи с типом Facebook.
			 * @protected
			 * @virtual
			 */
			updateFacebookProfileInfo: function() {
				var facebookCommunications =
					this.getCommunications(ConfigurationConstants.CommunicationTypes.Facebook);
				var facebookProfileExists = !facebookCommunications.isEmpty();
				this.set("FacebookProfileExists", facebookProfileExists);
			},

			/**
			 * @inheritdoc Terrasoft.BaseCommunicationDetail#addSocialNetworkMenuItem
			 * @overridden
			 */
			addSocialNetworkMenuItem: function(socialNetworksMenuItems, menuItem) {
				this.callParent(arguments);
				if (menuItem.get("Id") === ConfigurationConstants.CommunicationTypes.Facebook) {
					this.modifyFacebookMenuItem(menuItem);
				}
			},

			/**
			 * Изменяет свойства для элемента управления для пункта меню Facebook.
			 * @protected
			 * @param {Object} facebookMenuItem Элемент управления для пункта меню Facebook.
			 */
			modifyFacebookMenuItem: function(facebookMenuItem) {
				facebookMenuItem.set("Click", {
					bindTo: "onFacebookMenuItemClick"
				});
			},

			/**
			 * Обработчик нажатия пункта меню Facebook.
			 */
			onFacebookMenuItemClick: function() {
				var schemaName = this.get("FacebookSearchSchemaName");
				this.openSocialSearchPage(schemaName);
			},

			/**
			 * Обработчик нажатия кнопки Facebook.
			 */
			onFacebookButtonClick: function() {
				var facebookProfileExists = this.get("FacebookProfileExists");
				var schemaName = this.get("FacebookSearchSchemaName");
				if (!facebookProfileExists) {
					this.openSocialSearchPage(schemaName);
				} else {
					this.openProfilePage(ConfigurationConstants.CommunicationTypes.Facebook);
				}
			},

			/**
			 * Открывает страницы профиля пользователя в зависимости от типа средства связи.
			 * @protected
			 * @param {String} communicationType Тип средства связи.
			 */
			openProfilePage: function(communicationType) {
				var communications = this.getCommunications(communicationType);
				var firstCommunication = communications.getByIndex(0);
				var facebookLink = firstCommunication.getFacebookUrl();
				window.open(facebookLink);
			},

			/**
			 * Возвращает маркер для кнопки Facebook.
			 * @protected
			 * @return {String} Маркер для кнопки Facebook.
			 */
			getFacebookButtonMarkerValue: function() {
				var facebookProfileExists = this.get("FacebookProfileExists");
				return facebookProfileExists ? "FacebookProfile" : "FacebookProfileSearch";
			},

			/**
			 * Открывает модуль поиска в социальных сетях.
			 * @protected
			 * @param {String} schemaName Название схемы, которая будет использоваться модулем.
			 */
			openSocialSearchPage: function(schemaName) {
				this.getFacebookConnector(function(connector) {
					var config = {};
					connector.checkCanOperate(config, function(response) {
						var success = response.success;
						if (!success) {
							return this.handleConnectorError(response.errorInfo, function() {
								this.loadSocialSearchModule({
									schemaName: schemaName
								});
							}, this);
						}
						this.loadSocialSearchModule({
							schemaName: schemaName
						});
					}, this);
				}, this);
			},

			/**
			 * @inheritdoc Terrasoft.BaseCommunicationDetail#getCommunicationViewModelClassName
			 * @overridden
			 */
			getCommunicationViewModelClassName: function(communicationTypeId) {
				if (communicationTypeId === ConfigurationConstants.CommunicationTypes.Facebook) {
					return "Terrasoft.FacebookCommunicationViewModel";
				} else {
					return this.callParent(arguments);
				}
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "FacebookButton",
				"parentName": "SocialNetworksContainer",
				"propertyName": "items",
				"index": 0,
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"click": {"bindTo": "onFacebookButtonClick"},
					"classes": {
						"wrapperClass": ["t-btn-full-image", "t-btn-facebook"]
					},
					"imageConfig": {"bindTo": "Resources.Images.FacebookLinkImage"},
					"markerValue": {"bindTo": "getFacebookButtonMarkerValue"}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
