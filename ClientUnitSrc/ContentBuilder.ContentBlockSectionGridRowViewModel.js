define("ContentBlockSectionGridRowViewModel", ["ext-base", "ContentBlockSectionGridRowViewModelResources",
	"BaseSectionGridRowViewModel"], function(Ext) {

	/**
	 * @class Terrasoft.configuration.ContentBlockSectionGridRowViewModel
	 */
	Ext.define("Terrasoft.configuration.ContentBlockSectionGridRowViewModel", {
		extend: "Terrasoft.BaseSectionGridRowViewModel",
		alternateClassName: "Terrasoft.ContentBlockSectionGridRowViewModel",

		/**
		 * @inheritDoc Terrasoft.BaseViewModel#getLookupImageUrl
		 * @overridden
		 */
		getLookupImageUrl: function(lookupColumnName) {
			var lookupColumn = this.findEntityColumn(lookupColumnName) || this.getColumnByName(lookupColumnName);
			if (!lookupColumn || !lookupColumn.isLookup) {
				throw new Terrasoft.UnsupportedTypeException();
			}
			var lookupColumnValue = this.get(lookupColumnName);
			var value = lookupColumnValue.value;
			if (!value) {
				return null;
			}
			var imageConfig = {
				source: Terrasoft.ImageSources.SYS_IMAGE,
				params: {
					primaryColumnValue: value
				}
			};
			return Terrasoft.ImageUrlBuilder.getUrl(imageConfig);
		}
	});

	return Terrasoft.ContentBlockSectionGridRowViewModel;
});
