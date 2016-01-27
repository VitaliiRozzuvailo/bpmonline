define("FacebookCommunicationViewModel", ["FacebookCommunicationViewModelResources", "ConfigurationConstants",
		"BaseCommunicationViewModel"],
		function(resources, ConfigurationConstants) {
			Ext.define("Terrasoft.configuration.FacebookCommunicationViewModel", {
				alternateClassName: "Terrasoft.FacebookCommunicationViewModel",
				extend: "Terrasoft.BaseCommunicationViewModel",

				/**
				 * @inheritdoc Terrasoft.BaseCommunicationViewModel#getRightIconEnabled
				 * @overridden
				 */
				getRightIconEnabled: function() {
					return true;
				},

				/**
				 * @inheritdoc Terrasoft.BaseCommunicationViewModel#getLinkUrl
				 * @overridden
				 */
				getLinkUrl: function(value) {
					var facebookUrl = this.getFacebookUrl();
					return {
						url: facebookUrl,
						caption: value
					};
				},

				/**
				 * @inheritdoc Terrasoft.BaseCommunicationViewModel#getFacebookUrl
				 * @overridden
				 */
				getFacebookUrl: function() {
					var id = this.get("SocialMediaId");
					var facebookUrl = "https://www.facebook.com/" + id;
					return facebookUrl;
				},

				/**
				 * @inheritdoc Terrasoft.BaseCommunicationViewModel#onLinkClick
				 * @overridden
				 */
				onLinkClick: function(path) {
					window.open(path);
					return false;
				},

				/**
				 * @inheritdoc Terrasoft.BaseCommunicationViewModel#getTypeImageConfig
				 * @overridden
				 */
				getTypeImageConfig: function() {
					return resources.localizableImages.FacebookIcon;
				},

				/**
				 * @inheritdoc Terrasoft.BaseCommunicationViewModel#getTypeIconButtonVisibility
				 * @overridden
				 */
				getTypeIconButtonVisibility: function() {
					return true;
				},

				/**
				 * @inheritdoc Terrasoft.BaseCommunicationViewModel#getMenuItemVisibility
				 * @overridden
				 */
				getMenuItemVisibility: function() {
					var communicationType = this.get("CommunicationType");
					if (!communicationType) {
						return true;
					}
					return (communicationType.value !== ConfigurationConstants.CommunicationTypes.Facebook);
				}
			});
		});
