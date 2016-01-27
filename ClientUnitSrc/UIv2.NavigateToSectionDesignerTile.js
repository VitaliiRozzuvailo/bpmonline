define("NavigateToSectionDesignerTile", ["NavigateToSectionDesignerTileResources", "PackageHelper",
	"ConfigurationConstants"], function(resources, PackageHelper, ConfigurationConstants) {

	/**
	 * @class Terrasoft.configuration.NavigateToSectionDesignerTileViewModel
	 * Класс модели представления модуля.
	 */
	Ext.define("Terrasoft.configuration.NavigateToSectionDesignerTileViewModel", {
		extend: "Terrasoft.SystemDesignerTileViewModel",
		alternateClassName: "Terrasoft.NavigateToSectionDesignerTileViewModel",
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
			if (this.get("IsSectionDesignerAvailable") != null) {
				this.startSectionDesigner();
			} else {
				this.getIsSectionDesignerAvailable(function() {
					this.startSectionDesigner();
				}, this);
			}
		},

		/**
		 * Открывает мастер разделов или показывает сообщение о ошибке.
		 * @private
		 */
		startSectionDesigner: function() {
			if (this.get("IsSectionDesignerAvailable") === true) {
				var location = window.location;
				var origin = location.origin || location.protocol + "//" + location.host;
				var url = origin + location.pathname + "#SectionDesigner/";
				require(["SectionDesignerUtils"], function(module) {
					module.start(url, true);
				});
			} else {
				var message = this.get("Resources.Strings.RightsErrorMessage");
				this.Terrasoft.utils.showInformation(message);
			}
		},

		/**
		 * Проверяет наличие пакета Platform и наличие прав для доступа к нему.
		 * @private
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст.
		 */
		getIsSectionDesignerAvailable: function(callback, scope) {
			PackageHelper.getIsPackageInstalled(ConfigurationConstants.PackageUId.Platform,
				function(isPackageInstalled) {
					if (isPackageInstalled) {
						require(["SectionDesignerUtils"], function(module) {
							module.getCanUseSectionDesigner(function(result) {
								this.set("IsSectionDesignerAvailable", result.canUseSectionDesigner);
								callback.call(scope);
							}.bind(this));
						}.bind(this));
					} else {
						this.set("IsSectionDesignerAvailable", false);
						callback.call(scope);
					}
				}, this);
		}
	});
});