define("ColumnEditGenerator", ["ext-base", "ViewGeneratorV2"],
	function(Ext) {

		Ext.define("Terrasoft.configuration.ColumnEditGenerator", {
			extend: "Terrasoft.ViewGenerator",
			alternateClassName: "Terrasoft.ColumnEditGenerator",

			/**
			 * Имя метода модели для вызова модуля выбора колонки.
			 * @private
			 * @type {String}
			 */
			loadColumnMethodName: "loadColumn",

			/**
			 * Имя метода модели для заполнения выпадающего списка.
			 * @private
			 * @type {String}
			 */
			prepareListMethodName: "loadColumnsData",

			/**
			 * @inheritDoc Terrasoft.configuration.ViewGenerator#generateLookupEdit
			 * @overridden
			 */
			generateLookupEdit: function() {
				var lookupEdit = this.callParent(arguments);
				Ext.apply(lookupEdit, {
					loadVocabulary: { bindTo: this.loadColumnMethodName },
					prepareList: { bindTo: this.prepareListMethodName }
				});
				return lookupEdit;
			}
		});

		return Ext.create("Terrasoft.ColumnEditGenerator");

	});