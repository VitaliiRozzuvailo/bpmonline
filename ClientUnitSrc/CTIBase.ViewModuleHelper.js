define("ViewModuleHelper", ["ext-base", "terrasoft", "ViewModuleHelperResources", "RightUtilities",
	"CtiBaseHelper", "CtiConstants", "CtiLinkColumnUtility"],
	function(Ext, Terrasoft, resources, RightUtilities, CtiBaseHelper, CtiConstants, CtiLinkColumnUtility) {

		/**
		 * Выводит сообщение в консоль.
		 * @private
		 * @param message Сообщение.
		 */
		function log(message) {
			var console = Ext.global.console;
			if (console && console.log) {
				console.log(message);
			}
		}

		/**
		 * Инициализирует утилиту работы с колонками типа "ссылка".
		 */
		function initLinkColumnUtilities() {
			var linkColumnUtilities = Terrasoft.LinkColumnUtilities || {};
			linkColumnUtilities.Telephony = Ext.create(CtiLinkColumnUtility);
			Terrasoft.LinkColumnUtilities = linkColumnUtilities;
		}

		/**
		 * Инициализирует глобальные настройки при загрузке модуля представления.
		 */
		function initSettings() {
			initLinkColumnUtilities();
		}

		/**
		 * Создает конфигурацию левой панели по умолчанию.
		 * @param {Function} callback Функция обратного вызова.
		 */
		function getSideBarDefaultConfig(callback) {
			var menuConfig = {
				items: [{
					name: "LeftPanelTopMenuModule",
					id: "leftPanelTopMenu",
					showInHeader: true
				}, {
					name: "LeftPanelClientWorkplaceMenu",
					id: "leftPanelClientWorkplaceMenu",
					showInHeader: true
				}, {
					name: "SectionMenuModule",
					id: "sectionMenuModule"
				}]
			};
			callback(menuConfig);
		}

		return {
			getSideBarDefaultConfig: getSideBarDefaultConfig,
			initSettings: initSettings
		};
	});