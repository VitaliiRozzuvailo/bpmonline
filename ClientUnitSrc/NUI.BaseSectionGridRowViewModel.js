define("BaseSectionGridRowViewModel", ["ext-base", "BaseSectionGridRowViewModelResources", "ProcessHelper",
		"BaseGridRowViewModel"], function(Ext, resources) {

	/**
	 * @class Terrasoft.configuration.BaseSectionGridRowViewModel
	 */
	Ext.define("Terrasoft.configuration.BaseSectionGridRowViewModel", {
		extend: "Terrasoft.BaseGridRowViewModel",
		alternateClassName: "Terrasoft.BaseSectionGridRowViewModel",

		/**
		 *
		 */
		processListenersColumnName: "ProcessListeners",

		/**
		 *
		 */
		constructor: function() {
			this.callParent(arguments);
			this.initResources();
		},

		/**
		 *
		 */
		getProcessEntryPointGridRowButtonVisible: function() {
			return (this.get("EntryPointsCount") > 0);
		},

		/**
		 * Возвращает признак видимости кнопки печати в строке реестра
		 * @returns {Boolean}
		 */
		getPrintButtonVisible: function() {
			return this.get("PrintButtonVisible") || false;
		},

		/**
		 *
		 */
		initResources: function() {
			var strings = resources.localizableStrings;
			this.set("Resources.Strings.OpenRecordGridRowButtonCaption", strings.OpenRecordGridRowButtonCaption);
			this.set("Resources.Strings.CopyRecordGridRowButtonCaption", strings.CopyRecordGridRowButtonCaption);
			this.set("Resources.Strings.DeleteRecordGridRowButtonCaption", strings.DeleteRecordGridRowButtonCaption);
			this.set("Resources.Strings.PrintRecordGridRowButtonCaption", strings.PrintRecordGridRowButtonCaption);
			this.set("Resources.Strings.ProcessEntryPointGridRowButtonCaption",
				strings.ProcessEntryPointGridRowButtonCaption);
		}
	});

	return Terrasoft.BaseSectionGridRowViewModel;
});