define("SocialAccountPage", ["AccountCommunication"], function(AccountCommunication) {
	return {
		methods: {
			/**
			 * @inheritdoc Terrasoft.BaseSocialPage#getFacebookProfilesESQ
			 * @overridden
			 */
			getFacebookProfilesESQ: function() {
				return this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchema: AccountCommunication
				});
			}
		},
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
	};
});
