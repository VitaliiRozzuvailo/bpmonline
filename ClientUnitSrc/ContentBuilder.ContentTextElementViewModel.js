define("ContentTextElementViewModel", ["ContentTextElementViewModelResources", "ContentElementBaseViewModel",
		"ckeditor-base"],
	function(resources) {

	Ext.define("Terrasoft.ContentBuilder.ContentTextElementViewModel", {
		extend: "Terrasoft.ContentElementBaseViewModel",
		alternateClassName: "Terrasoft.ContentTextElementViewModel",

		/**
		 * Имя класса элемента отображения.
		 * @protected
		 * @type {String}
		 */
		className: "Terrasoft.BaseContentElement",

		/**
		 * @inheritdoc Terrasoft.BaseViewModel#constructor
		 * @overridden
		 */
		constructor: function() {
			this.callParent(arguments);
			this.initResourcesValues(resources);
			this.addEvents(
				"macrobuttonclicked",
				"selectedtextсhanged"
			);
			this.on("change:SelectedText", this.onSelectedTextChanged, this);
		},

		/**
		 * Обработчик клика кнопки дбавления макроса.
		 * @protected
		 * @virtual
		 */
		onMacroButtonClicked: function() {
			this.fireEvent("change", this, {
				event: "macrobuttonclicked",
				arguments: null
			});
		},

		/**
		 * Обработчик зменения выделенного текста.
		 * @protected
		 * @virtual
		 */
		onSelectedTextChanged: function() {
			this.fireEvent("change", this, {
				event: "selectedtextсhanged",
				arguments: arguments
			});
		},

		/**
		 * @inheritdoc Terrasoft.ContentElementBaseViewModel#getViewConfig
		 * @overridden
		 */
		getViewConfig: function() {
			return {
				"className": this.className,
				"selected": {bindTo: "Selected"},
				items: [{
					"className": "Terrasoft.InlineTextEdit",
					"value": {bindTo: "Content"},
					"placeholder": {bindTo: "Resources.Strings.Placeholder"},
					"macrobuttonclicked": {bindTo: "onMacroButtonClicked"},
					"selectedText": {bindTo: "SelectedText"}
				}]
			};
		},

		/**
		 * @inheritdoc Terrasoft.ContentElementBaseViewModel#getToolsViewConfig
		 * @overridden
		 */
		getToolsViewConfig: function() {}

	});
});
