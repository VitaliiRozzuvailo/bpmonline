define("NavigateToLDAPServerConfigurationTile", ["NavigateToLDAPServerConfigurationTileResources"],
	function(resources) {
		/**
		 * @class Terrasoft.configuration.NavigateToLDAPServerConfigurationTileViewModel
		 * Класс модели представления модуля.
		 */
		Ext.define("Terrasoft.configuration.NavigateToLDAPServerConfigurationTileViewModel", {
			extend: "Terrasoft.SystemDesignerTileViewModel",
			alternateClassName: "Terrasoft.NavigateToLDAPServerConfigurationTileViewModel",
			Ext: null,
			sandbox: null,
			Terrasoft: null,

			constructor: function() {
				this.callParent(arguments);
				this.initResourcesValues(resources);
			},
			/**
			 * Переход на страницу настройки LDAP сервера
			 */
			onClick: function() {
				var LDAPHash = "ConfigurationModuleV2/LDAPServerSettings/";
				var currentModule = this.sandbox.publish("GetHistoryState").hash.historyState;
				if (currentModule !== LDAPHash) {
					this.sandbox.publish("PushHistoryState", {
						hash: LDAPHash
					});
				}
			}
		});
	});