define("AccountSocialAnniversaryDetail", [], function() {
	return {
		entitySchemaName: "AccountAnniversary",
		methods: {

			/**
			 * @inheritdoc Terrasoft.GridUtilitiesV2#getFilterDefaultColumnName
			 * @overridden
			 */
			getFilterDefaultColumnName: function() {
				return "AnniversaryType";
			}

		},
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
	};
});
