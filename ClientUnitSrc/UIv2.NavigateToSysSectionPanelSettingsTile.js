define("NavigateToSysSectionPanelSettingsTile", ["NavigateToSysSectionPanelSettingsTileResources", "MaskHelper",
		"RightUtilities"],
	function(resources, MaskHelper, RightUtilities) {
		/**
		 * @class Terrasoft.configuration.NavigateToSysSectionPanelSettingsTileViewModel
		 * Класс модели представления модуля.
		 */
		Ext.define("Terrasoft.configuration.NavigateToSysSectionPanelSettingsTileViewModel", {
			extend: "Terrasoft.SystemDesignerTileViewModel",
			alternateClassName: "Terrasoft.NavigateToSysSectionPanelSettingsTileViewModel",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * @inheritDoc Terrasoft.configuration.SystemDesignerTileViewModel@constructor
			 * @overridden
			 */
			constructor: function() {
				this.callParent(arguments);
				this.initResourcesValues(resources);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.SystemDesignerTileViewModel#onClick
			 * @overridden
			 */
			onClick: function() {
				MaskHelper.ShowBodyMask();
				this.checkRights({
					operationName: "CanManageSectionPanelColorSettings",
					callback: this.navigateToSectionPanelSettingsSection
				});
			},

			/**
			 * Проверяет наличие прав на операцию изменения настроек.
			 * @private
			 * @param {Object} options Параметры проверки права.
			 * @param {String} options.operationName Код операции чьи права мы проверяем.
			 * @param {Function} options.callback Функция обратного вызова после получения значения права.
			 */
			checkRights: function(options) {
				var operationName = options.operationName;
				var callback = options.callback;
				var currentRights = this.get(operationName);
				if (currentRights != null) {
					callback.call(this, currentRights);
				}
				RightUtilities.checkCanExecuteOperation({
					operation: operationName
				}, function(result) {
					this.set(operationName, result);
					callback.call(this, result);
				}, this);
			},

			/**
			 * Открывает раздел настройки.
			 * @private
			 * @param {Boolean} rights Значение права перехода.
			 */
			navigateToSectionPanelSettingsSection: function(rights) {
				if (rights === true) {
					this.sandbox.requireModuleDescriptors(["SysSectionPanelSettingsModule"], function() {
						this.sandbox.publish("PushHistoryState", {
							hash: "SysSectionPanelSettingsModule"
						});
					}, this);
				} else {
					var message = this.get("Resources.Strings.RightsErrorMessage");
					this.Terrasoft.utils.showInformation(message);
				}
			}
		});
	});