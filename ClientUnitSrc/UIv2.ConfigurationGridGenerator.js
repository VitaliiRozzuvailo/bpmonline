define("ConfigurationGridGenerator", ["ext-base", "ViewGeneratorV2"],
	function(Ext) {

		Ext.define("Terrasoft.configuration.ConfigurationGridGenerator", {
			extend: "Terrasoft.ViewGenerator",
			alternateClassName: "Terrasoft.ConfigurationGridGenerator",

			/**
			 * @inheritdoc Terrasoft.ViewGeneratorV2#addLinks
			 * @overridden
			 */
			addLinks: Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.ViewGeneratorV2#generateGridCellValue
			 * @overridden
			 */
			generateGridCellValue: function(config) {
				var cellValue = {};
				var type = config.type;
				cellValue.name = config.value || {bindTo: config.bindTo};
				switch (type) {
					case Terrasoft.GridCellType.TITLE:
						cellValue.type = Terrasoft.GridKeyType.TITLE;
						break;
					default:
						cellValue.type = Terrasoft.GridKeyType.TEXT;
						break;
				}
				return cellValue;
			}
		});
		return Ext.create("Terrasoft.ConfigurationGridGenerator");

	});
