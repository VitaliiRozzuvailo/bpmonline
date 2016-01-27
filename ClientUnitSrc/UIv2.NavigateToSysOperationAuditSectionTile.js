define("NavigateToSysOperationAuditSectionTile", ["NavigateToSysOperationAuditSectionTileResources", "MaskHelper",
		"RightUtilities"], function(resources, MaskHelper, RightUtilities) {

		/**
		 * @class Terrasoft.configuration.NavigateToSysOperationAuditSectionTileViewModel
		 * Класс модели представления модуля.
		 */
		Ext.define("Terrasoft.configuration.NavigateToSysOperationAuditSectionTileViewModel", {
			extend: "Terrasoft.SystemDesignerTileViewModel",
			alternateClassName: "Terrasoft.NavigateToSysOperationAuditSectionTileViewModel",
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
				if (this.get("CanViewSysOperationAudit") != null) {
					this.navigateToSysOperationAuditSection();
				} else {
					RightUtilities.checkCanExecuteOperation({
						operation: "CanViewSysOperationAudit"
					}, function(result) {
						this.set("CanViewSysOperationAudit", result);
						this.navigateToSysOperationAuditSection();
					}, this);
				}
			},

			/**
			 * Открывает раздел "Журнал аудита" или показывает сообщение о ошибке.
			 * @private
			 */
			navigateToSysOperationAuditSection: function() {
				if (this.get("CanViewSysOperationAudit") === true) {
					MaskHelper.ShowBodyMask();
					this.sandbox.publish("PushHistoryState", {
						hash: "SectionModuleV2/SysOperationAuditSectionV2/"
					});
				} else {
					var message = this.get("Resources.Strings.RightsErrorMessage");
					this.Terrasoft.utils.showInformation(message);
				}
			}
		});
	});