define("ContactSocialAnniversaryDetail", [], function() {
	return {
		entitySchemaName: "ContactAnniversary",
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
