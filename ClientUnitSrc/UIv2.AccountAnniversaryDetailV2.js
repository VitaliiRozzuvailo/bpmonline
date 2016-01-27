define("AccountAnniversaryDetailV2", [], function() {
	return {
		entitySchemaName: "AccountAnniversary",
		methods: {

			/**
			 * Возвращает имя колонки для фильтрации по умолчанию.
			 * @overridden
			 * @return {String} Имя колонки.
			 */
			getFilterDefaultColumnName: function() {
				return "AnniversaryType";
			}
		},
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
	};
});