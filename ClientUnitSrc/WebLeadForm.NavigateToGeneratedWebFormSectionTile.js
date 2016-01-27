define("NavigateToGeneratedWebFormSectionTile", ["NavigateToGeneratedWebFormSectionTileResources", "MaskHelper",
	"RightUtilities"], function(resources, MaskHelper, RightUtilities) {

	/**
	 * @class Terrasoft.configuration.NavigateToGeneratedWebFormSectionTileViewModel
	 * Класс модели представления модуля.
	 */
	Ext.define("Terrasoft.configuration.NavigateToGeneratedWebFormSectionTileViewModel", {
		extend: "Terrasoft.SystemDesignerTileViewModel",
		alternateClassName: "Terrasoft.NavigateToGeneratedWebFormSectionTileViewModel",
		Ext: null,
		sandbox: null,
		Terrasoft: null,

		constructor: function() {
			this.callParent(arguments);
			this.initResourcesValues(resources);
		},

		/**
		 * @inheritDoc Terrasoft.configuration.SystemDesignerTileViewModel#onClick
		 * @overridden
		 */
		onClick: function() {
			if (this.get("CanManageWebForms") != null) {
				this.navigateToGeneratedWebFormSection();
			} else {
				RightUtilities.checkCanExecuteOperation({
					operation: "CanManageWebForms"
				}, function(result) {
					this.set("CanManageWebForms", result);
					this.navigateToGeneratedWebFormSection();
				}, this);
			}
		},

		/**
		 * Открывает раздел "Формы внешних ресурсов" или показывает сообщение о ошибке.
		 * @private
		 */
		navigateToGeneratedWebFormSection: function() {
			if (this.get("CanManageWebForms") === true) {
				MaskHelper.ShowBodyMask();
				this.sandbox.publish("PushHistoryState", {
					hash: "SectionModuleV2/GeneratedWebFormSectionV2/"
				});
			} else {
				var message = this.get("Resources.Strings.RightsErrorMessage");
				this.Terrasoft.utils.showInformation(message);
			}
		}
	});
});