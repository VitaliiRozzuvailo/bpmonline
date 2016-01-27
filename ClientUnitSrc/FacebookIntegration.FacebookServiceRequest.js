define("FacebookServiceRequest", ["SocialNetworkServiceRequest"], function() {
	Ext.define("Terrasoft.configuration.social.FacebookServiceRequest", {
		extend: "Terrasoft.SocialNetworkServiceRequest",
		alternateClassName: "Terrasoft.FacebookServiceRequest",

		/**
		 * @inheritdoc Terrasoft.ConfigurationServiceRequest#serviceName
		 * @overridden
		 */
		serviceName: "FacebookService"
	});
});
