define("SysWorkplaceSectionGridRowViewModel", ["ext-base", "SysWorkplaceSectionGridRowViewModelResources",
		"BaseSectionGridRowViewModel"], function(Ext, resources) {
	/**
	 * @class Terrasoft.configuration.SysWorkplaceSectionGridRowViewModel
	 */
	Ext.define("Terrasoft.configuration.SysWorkplaceSectionGridRowViewModel", {
		extend: "Terrasoft.BaseSectionGridRowViewModel",
		alternateClassName: "Terrasoft.SysWorkplaceSectionGridRowViewModel",

		/**
		 * Инициализирует ресурсы.
		 * @inheritdoc Terrasoft.configuration.BaseGridRowViewModel#initResources
		 */
		initResources: function(strings) {
			strings = strings || {};
			this.callParent([Ext.apply(Terrasoft.deepClone(strings)), resources.localizableStrings]);
		}
	});
	return Terrasoft.SysWorkplaceSectionGridRowViewModel;
});