define("AnalyticsGridRowViewModel", ["ext-base", "AnalyticsGridRowViewModelResources", "BaseGridRowViewModel"],
		function(Ext, resources) {
	/**
	 * @class Terrasoft.configuration.AnalyticsGridRowViewModel
	 */
	Ext.define("Terrasoft.configuration.AnalyticsGridRowViewModel", {
		extend: "Terrasoft.BaseGridRowViewModel",
		alternateClassName: "Terrasoft.AnalyticsGridRowViewModel",

		isChartActionsButtonVisible: function() {
			return this.get("chartActionsButtonVisible");
		},

		/**
		 * @inheritdoc Terrasoft.configuration.BaseGridRowViewModel#initResources
		 */
		initResources: function(strings) {
			strings = strings || {};
			this.callParent([Ext.apply(Terrasoft.deepClone(strings), resources.localizableStrings)]);
		}
	});

	return Terrasoft.AnalyticsGridRowViewModel;
});