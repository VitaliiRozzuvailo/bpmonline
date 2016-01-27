define("SystemDesignerDashboardBuilder", ["ext-base", "SystemDesignerDashboardBuilderResources", "DashboardBuilder"],
	function(Ext) {
		/**
		 * @class Terrasoft.configuration.SystemDesignerDashboardViewsConfig
		 * Класс генерурующий конфигурацию представления модуля итогов для раздела дизайнера системы.
		 */
		Ext.define("Terrasoft.configuration.SystemDesignerDashboardsViewConfig", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.SystemDesignerDashboardsViewConfig",

			/**
			 * Генерирует конфигурацию представления модуля итогов для раздела дизайнера системы.
			 * @return {Object[]} Возвращает конфигурацию представления модуля итогов.
			 */
			generate: function() {
				return [{
					"name": "SettingsButton",
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"style": Terrasoft.controls.ButtonEnums.style.GREY,
					"caption": { "bindTo": "Resources.Strings.ActionsButtonCaption" },
					"markerValue": "SettingsButton",
					"visible": { "bindTo": "EditMode" },
					"menu": {
						items: [{
							"caption": { "bindTo": "Resources.Strings.EditButtonCaption" },
							"click": { "bindTo": "editCurrentDashboard" },
							"markerValue": "SettingsButtonEdit",
							"enabled": { "bindTo": "canEdit" }
						}, {
							"caption": { "bindTo": "Resources.Strings.RightsButtonCaption" },
							"click": { "bindTo": "manageCurrentDashboardRights" },
							"markerValue": "ManageRights",
							"enabled": { "bindTo": "canManageRights" }
						}]
					}
				}, {
					"name": "DashboardModule",
					"itemType": Terrasoft.ViewItemType.CONTAINER
				}];
			}
		});

		/**
		 * @class Terrasoft.configuration.SystemDesignerDashboardBuilder
		 * Класс модели представления модуля итогов для раздела дизайнера системы.
		 */
		return Ext.define("Terrasoft.configuration.SystemDesignerDashboardBuilder", {
			extend: "Terrasoft.DashboardBuilder",
			alternateClassName: "Terrasoft.SystemDesignerDashboardBuilder",

			Ext: null,
			sandbox: null,
			Terrasoft: null,

			/**
			 * Имя базовой модели представления для модуля итогов для раздела дизайнера системы.
			 * @type {String}
			 */
			viewModelClass: "Terrasoft.SystemDesignerDashboardsViewModel",

			/**
			 * Имя базового класа генератога конфигурации представления итогов для раздела дизайнера системы.
			 * @type {String}
			 */
			viewConfigClass: "Terrasoft.SystemDesignerDashboardsViewConfig"
		});
	});