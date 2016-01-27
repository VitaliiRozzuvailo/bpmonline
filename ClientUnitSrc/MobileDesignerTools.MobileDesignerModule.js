define("MobileDesignerModule", ["ext-base", "terrasoft", "MobileDesignerModuleResources",
			"SectionDesignerUtils", "LookupUtilities", "MobileDesignerUtils", "LocalizableHelper", "BaseViewModule"],
		function(Ext, Terrasoft, resources, SectionDesignerUtils, LookupUtilities, MobileDesignerUtils, LocalizableHelper) {

			/**
			 * @class Terrasoft.configuration.MobileDesignerModule
			 * Класс визуального модуля дизайнера мобильного приложения.
			 */
			Ext.define("Terrasoft.configuration.MobileDesignerModule", {
				extend: "Terrasoft.BaseViewModule",
				alternateClassName: "Terrasoft.MobileDesignerModule",
				isAsync: true,

				/**
				 * @inheritDoc Terrasoft.configuration.BaseViewModule
				 * @overridden
				 */
				defaultHomeModule: "MobileSectionDesignerSchemaModule",

				/**
				 * Разница схемы представления.
				 * @type {Object[]}
				 */
				diff: [
					{
						"operation": "insert",
						"name": "MobileDesignerLabel",
						"values": {
							"id": "mobileDesignerLabel",
							"itemType": Terrasoft.ViewItemType.LABEL,
							"caption": resources.localizableStrings.DesignerCaption
						}
					},
					{
						"operation": "insert",
						"name": "centerPanelContainer",
						"values": {
							"id": "centerPanelContainer",
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"wrapClass": ["center-panel"],
							"selectors": { "wrapEl": "#centerPanelContainer" },
							"items": []
						}
					},
					{
						"operation": "move",
						"name": "centerPanel",
						"parentName": "centerPanelContainer",
						"propertyName": "items",
						"index": 0
					}
				],

				/**
				 * Подписывается на сообщения.
				 * @protected
				 * @virtual
				 */
				subscribeMessages: function() {
					this.callParent(arguments);
					this.sandbox.subscribe("ChangeHeaderCaption", this.updateDesignerCaption, this);
				},

				/**
				 * Обновляет заголовок дизайнера
				 * @public
				 * @param {Object} config Конфигурационный объект с параметрами вызова метода:
				 * @param {String} config.caption Заголовок для страницы.
				 */
				updateDesignerCaption: function(config) {
					var label = Ext.getCmp("mobileDesignerLabel");
					label.caption = label.markerValue = config.caption;
					label.reRender();
				},

				/**
				 * @inheritDoc Terrasoft.configuration.BaseViewModule
				 * @overridden
				 */
				loadModuleFromHistoryState: function() {
					var currentState = this.sandbox.publish("GetHistoryState");
					var currentStateHash = currentState.hash;
					var workplace = currentStateHash.moduleName;
					this.sandbox.loadModule(this.defaultHomeModule, {
						renderTo: "centerPanel",
						instanceConfig: {
							workplace: workplace
						}
					});
				},

				/**
				 * @inheritDoc Terrasoft.configuration.BaseViewModule
				 * @overridden
				 */
				render: function(renderTo) {
					renderTo.addCls("section-designer-shown");
					this.callParent(arguments);
				}

			});

			return Terrasoft.MobileDesignerModule;
		});