define(["SocialNetworkServiceRequest"], function() {
	Ext.define("Terrasoft.configuration.social.ExecuteCommandRequest", {
		extend: "Terrasoft.SocialNetworkServiceRequest",

		/**
		 * @inheritdoc Terrasoft.BaseRequest#contractName
		 * @overridden
		 */
		contractName: "ExecuteCommand",

		command: null,

		/**
		 * @inheritdoc Terrasoft.BaseRequest#getSerializableObject
		 * @overridden
		 */
		getSerializableObject: function(serializableObject) {
			this.callParent(arguments);
			var request = serializableObject.request = serializableObject.request || {};
			if (this.command) {
				request.command = this.command;
			}
		}
	});
});
