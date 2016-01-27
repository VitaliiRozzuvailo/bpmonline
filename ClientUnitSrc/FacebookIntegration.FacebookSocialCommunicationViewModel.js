define("FacebookSocialCommunicationViewModel", ["FacebookSocialCommunicationViewModelResources",
			"ConfigurationConstants", "SocialCommunicationViewModel"],
		function(resources, ConfigurationConstants) {
			Ext.define("Terrasoft.configuration.FacebookSocialCommunicationViewModel", {
				alternateClassName: "Terrasoft.FacebookSocialCommunicationViewModel",
				extend: "Terrasoft.SocialCommunicationViewModel",

				/**
				 * @inheritdoc Terrasoft.SocialCommunicationViewModel#getTypeImageConfig
				 * @overridden
				 */
				getTypeImageConfig: function() {
					var socialNetworkType = this.get("SocialNetworkType");
					if (socialNetworkType === ConfigurationConstants.CommunicationTypes.Facebook) {
						return resources.localizableImages.FacebookIcon;
					}
					return null;
				},

				/**
				 * @inheritdoc Terrasoft.BaseCommunicationViewModel#getTypeIconButtonVisibility
				 * @overridden
				 */
				getTypeIconButtonVisibility: function() {
					var socialNetworkType = this.get("SocialNetworkType");
					return (socialNetworkType === ConfigurationConstants.CommunicationTypes.Facebook);
				}
			});
		});
