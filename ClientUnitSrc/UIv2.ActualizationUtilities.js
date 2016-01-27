define("ActualizationUtilities", ["terrasoft", "ActualizationUtilitiesResources"],
	function(Terrasoft, resources) {
		var actualizationUtilitiesClass = Ext.define("Terrasoft.configuration.mixins.ActualizationUtilities", {

				alternateClassName: "Terrasoft.ActualizationUtilities",

				/**
				 * Вызывает сервис, выполняющий актуализацию организационных ролей.
				 * @private
				 */
				onActualizeAdminUnitInRole: function() {
					this.showBodyMask();
					var config = {
						serviceName: "AdministrationService",
						methodName: "ActualizeAdminUnitInRole"
					};
					this.callService(config, function(response) {
						this.hideBodyMask();
						this.saveShowActualizeMessageInProfile(false);
						if (response && response.ActualizeAdminUnitInRoleResult) {
							this.showInformationDialog(resources.localizableStrings.ActualizeSuccessMessage);
						} else {
							this.showInformationDialog(resources.localizableStrings.ActualizeFailedMessage);
						}
					}, this);
				},

				/**
				 * Сохраняет признак отображения сообщения для актуализации орг. структуры.
				 * Если значение в профиле будет изменено, пользователю будет выведено
				 * сообщение о необходимости выполнить актуализацию.
				 * @protected
				 * @param {Boolean} value значение для признака ShowActualizeMessage.
				 * @param {Object} callback функция обратного вызова.
				 * @param {Object} scope контекст выполнения.
				 */
				saveShowActualizeMessageInProfile: function(value, callback, scope) {
					if (!this.Ext.isEmpty(value)) {
						this.set("ShowActualizeMessage", value);
					}
					var profileKey = this.getCustomProfileKey();
					var currentProfile = this.get("UserCustomProfile") || {};
					var currentValue = this.get("ShowActualizeMessage");
					if (currentProfile.ShowActualizeMessage !== currentValue) {
						this.showInformationDialog(resources.localizableStrings.NeedActualizeRolesMessage);
						var newProfileValue = {
							"ShowActualizeMessage": currentValue
						};
						this.Ext.apply(currentProfile, newProfileValue);
						this.Terrasoft.utils.saveUserProfile(profileKey, currentProfile, false, callback, scope);
					}
				},

				/**
				 * Устанавливает значение свойства ShowActualizeMessage, используя профиль.
				 * @protected
				 */
				setShowActualizeMessageFromProfile: function() {
					var currentProfile = this.get("UserCustomProfile") || {};
					this.set("ShowActualizeMessage", currentProfile.ShowActualizeMessage);
				},

				/**
				 * Возвращает кнопку "Актуализировать роли".
				 * @protected
				 * @return {Terrasoft.BaseViewModel} Возвращает кнопку.
				 */
				getActualizeAdminUnitInRoleButton: function() {
					return this.getButtonMenuItem({
						"Caption": {"bindTo": "Resources.Strings.ActualizeOrgStructureButtonCaption"},
						"Click": {"bindTo": "onActualizeAdminUnitInRole"}
					});
				},

				/**
				 * Получает данные из профиля.
				 * @protected
				 * @param {Object} callback функция обратного вызова.
				 * @param {Object} scope контекст выполнения.
				 */
				initCustomUserProfileData: function(callback, scope) {
					var profileKey = this.getCustomProfileKey();
					this.Terrasoft.require(["profile!" + profileKey], function(profile) {
						this.set("UserCustomProfile", profile);
						if (this.Ext.isFunction(callback)) {
							callback.call(scope, arguments);
						}
					}, this);
				},

				/**
				 * Получает ключ профиля.
				 * @protected
				 * @return {String} Возвращает ключ профиля.
				 */
				getCustomProfileKey: function() {
					return "SysAdminUnitSectionCustomData";
				}
			});
		return Ext.create(actualizationUtilitiesClass);
	});