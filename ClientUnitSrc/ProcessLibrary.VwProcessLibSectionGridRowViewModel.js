define("VwProcessLibSectionGridRowViewModel", ["ext-base", "VwProcessLibSectionGridRowViewModelResources",
	"ProcessLibraryConstants", "BaseSectionGridRowViewModel"], function(Ext, resources, ProcessLibraryConstants) {
	/**
	 * @class Terrasoft.configuration.SysWorkplaceSectionGridRowViewModel
	 */
	Ext.define("Terrasoft.configuration.VwProcessLibSectionGridRowViewModel", {
		extend: "Terrasoft.BaseSectionGridRowViewModel",
		alternateClassName: "Terrasoft.VwProcessLibSectionGridRowViewModel",

		/**
		 *
		 */
		constructor: function() {
			this.callParent(arguments);
			this.set("isNewProcessDesigner", false);
			Terrasoft.SysSettings.querySysSettingsItem("ShowNewProcessDesigner", function(value) {
				this.set("isNewProcessDesigner", value || false);
			}, this);
		},

		/**
		 * Инициализирует ресурсы.
		 * @overridden
		 * @param {Object} strings Значения локализованных строк в виде словаря (ключ-значение).
		 * @inheritdoc Terrasoft.configuration.BaseGridRowViewModel#initResources
		 */
		initResources: function(strings) {
			this.callParent(strings);
			if (!resources.localizableStrings) {
				return;
			}
			Terrasoft.each(resources.localizableStrings, function(value, key) {
				this.set("Resources.Strings." + key, value);
			}, this);
		},

		/*
		* Возвращает признак отображения кнопки запуска процесса
		* @private
		* @returns {Boolean}
		*/
		getIsVisibleRunProcessButton: function() {
			if (this.get("isMultiSelectVisible")) {
				return false;
			}
			return this.get("TagProperty") === ProcessLibraryConstants.VwProcessLib.BusinessProcessTag;
		},

		/*
		 * Определяет признак, того что схема не создана мастером
		 * @private
		 * @returns {Boolean}
		 */
		getIsBusinessProcessSchemaType: function() {
			var processSchemaType = this.get("ProcessSchemaType");
			return processSchemaType &&
				processSchemaType.value === ProcessLibraryConstants.VwProcessLib.Type.BusinessProcess;
		},

		/*
		 * Определяет заголовок действия "Открыть страницу"
		 * @private
		 * @returns {String}
		 */
		getCaptionDataGridActiveRowOpenAction: function() {
			return this.getIsBusinessProcessSchemaType() ?
				this.get("Resources.Strings.OpenInDesignerButtonCaption") :
				this.get("Resources.Strings.OpenQuickModelButtonCaption");
		},

		/*
		 * Определяет необходимость отображения кнопки "Открыть в дизайнере"
		 * @private
		 * @returns {Boolean}
		 */
		getIsVisibleOpenProcessPropertiesButton: function() {
			return this.getIsBusinessProcessSchemaType();
		},

		/*
		 * Определяет необходимость отображения кнопки "Открыть в дизайнере процессов"
		 * @private
		 * @returns {Boolean}
		 */
		getIsVisibleProcessDesignerButton: function() {
			return this.get("isNewProcessDesigner");
		}
	});
	return Terrasoft.VwProcessLibSectionGridRowViewModel;
});
