define("AccountCommunicationDetail", ["AccountCommunicationDetailResources", "terrasoft", "Contact",
		"ConfigurationEnums", "ConfigurationConstants"], function(resources, Terrasoft, Contact, ConfigurationEnums,
		ConfigurationConstants) {
	return {

		/**
		 * Имя сущности
		 */
		entitySchemaName: "AccountCommunication",

		methods: {
			/**
			 * Удаляет средство связи LinkedIn из пунктов меню
			 * @param {Object} esq запрос средств связи
			 */
			initCommunicationTypesFilters: function(esq) {
				this.callParent(arguments);
				if (Contact.columns.LinkedIn.usageType === ConfigurationEnums.EntitySchemaColumnUsageType.None) {
					var linkedInFilter = Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.NOT_EQUAL, "Id", ConfigurationConstants.CommunicationTypes.LinkedIn);
					esq.filters.addItem(linkedInFilter);
				}
			}
		}
	};
});
