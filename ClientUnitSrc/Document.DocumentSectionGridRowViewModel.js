define("DocumentSectionGridRowViewModel", ["ext-base", "DocumentSectionGridRowViewModelResources",
		"BaseSectionGridRowViewModel"], function(Ext) {

	/**
	 * @class Terrasoft.configuration.DocumentSectionGridRowViewModel
	 */
	Ext.define("Terrasoft.configuration.DocumentSectionGridRowViewModel", {
		extend: "Terrasoft.BaseSectionGridRowViewModel",
		alternateClassName: "Terrasoft.DocumentSectionGridRowViewModel",

		/**
		 * Получает значение свойства "Видимость" для кнопки Печать в активной записи реестра
		 * @return {boolean} Возвращает значение свойства "Видимость" для кнопки Печать в активной записи реестра
		 */
		getDataGridActiveRowPrintActionVisible: function() {
			var printMenuItems = this.get("CardPrintMenuItems");
			if (printMenuItems && printMenuItems.getCount()) {
				var printButtonVisible = false;
				printMenuItems.each(function (printMenuItem) {
					if (!printButtonVisible) {
						var reportInfo = printMenuItem.get("Tag");
						printButtonVisible = (this.get("Type").value === reportInfo.typeColumnValue);
					}
				}, this);
				return printButtonVisible;
			}
			return false;
		}
	});

	return Terrasoft.DocumentSectionGridRowViewModel;
});