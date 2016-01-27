define(["SocialNetworkServiceRequest"], function() {
	Ext.define("Terrasoft.configuration.social.ExecuteBatchRequest", {
		extend: "Terrasoft.SocialNetworkServiceRequest",

		consumerVersion: null,
		commands: null,

		/**
		 * @inheritDoc Terrasoft.BaseRequest#contractName
		 * @overridden
		 */
		contractName: "ExecuteBatchCommand",

		/**
		 * @inheritDoc Terrasoft.BaseRequest#getSerializableObject
		 * @overridden
		 */
		getSerializableObject: function(serializableObject) {
			this.callParent(arguments);
			var request = serializableObject.request = serializableObject.request || {};
			if (this.consumerVersion) {
				request.consumerVersion = this.consumerVersion;
			}
			if (this.commands) {
				request.commands = this.commands;
			}
		}
	});
});
