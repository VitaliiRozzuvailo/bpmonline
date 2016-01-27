define("SystemDesignerTileConfigEdit", ["terrasoft", "LookupUtilities", "SystemDesignerTileConfigEditResources"],
	function(Terrasoft, LookupUtilities, resources) {
		var localizableStrings = resources.localizableStrings;
		return {

			messages: {
				/**
				 * Сообщение изменения заголовка.
				 */
				"ChangeHeaderCaption": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Сообщение возврата настройки модуля
				 */
				"PostModuleConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Сообщение получения настроек модуля.
				 */
				"GetSystemDesignerTileConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Сообщение перехода к предыдущему состоянию.
				 */
				"BackHistoryState": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			mixins: {},
			attributes: {
				ModuleName: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},

				ModuleParameters: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}
			},
			methods: {
				/**
				 * Инициализирует начальные значения модели.
				 * @protected
				 * @virtual
				 */
				init: function(callback, scope) {
					this.callParent([function() {
						var config = this.sandbox.publish("GetSystemDesignerTileConfig", null, [this.getModuleId()]);
						this.initParams(config);
						this.sandbox.publish("ChangeHeaderCaption", {
							caption: localizableStrings.Header,
							dataViews: new Terrasoft.Collection(),
							moduleName: this.name
						});
						callback.call(scope);
					}, this]);
				},

				initParams: function(config) {
					if (config.requiredModule) {
						this.set("ModuleName", config.requiredModule);
						delete config.requiredModule;
						var moduleParameters = JSON.stringify(config, null, "\t");
						this.set("ModuleParameters", moduleParameters);
					} else {
						var sectionId = config.sectionId.value;
						var params = {"sectionId": sectionId};
						var moduleParameters = JSON.stringify(params, null, "\t");
						this.set("ModuleParameters", moduleParameters);
					}
				},

				/**
				 * Выполняет возврат к предыдущей странице.
				 * @protected
				 * @virtual
				 */
				goBack: function() {
					this.sandbox.publish("BackHistoryState");
				},

				/**
				 * Сохраняет конфигурацию модуля
				 * @protected
				 * @virtual
				 */
				save: function() {
					var moduleName = this.get("ModuleName");
					var strModuleParameters = this.get("ModuleParameters");
					var result = Terrasoft.deserialize(strModuleParameters);
					result.requiredModule = moduleName;
					this.sandbox.publish("PostModuleConfig", result, [this.getModuleId()]);
					this.goBack();
				},

				/**
				 * Возвращает идентификатора модуля.
				 * @protected
				 * @virtual
				 * @returns {string} Идентификатор модуля.
				 */
				getModuleId: function() {
					return this.sandbox.id;
				}
			},
			rules: {},
			diff: [
				{
					"operation": "insert",
					"name": "ModuleSelectingContainer",
					"values": {
						"id": "ModuleSelectingContainer",
						"selectors": {wrapEl: "#ModuleSelectingContainer"},
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": [
						]
					}
				},
				{
					"operation": "insert",
					"name": "HeaderContainer",
					"parentName": "ModuleSelectingContainer",
					"propertyName": "items",
					"values": {
						"id": "HeaderContainer",
						"selectors": {wrapEl: "#HeaderContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"layout": {column: 0, row: 0, colSpan: 24},
						"items": [
						]
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"name": "SaveButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": localizableStrings.SaveButtonCaption,
						"click": {bindTo: "save"},
						"style": Terrasoft.controls.ButtonEnums.style.GREEN,
						"layout": {column: 0, row: 0, colSpan: 2},
						"classes": {textClass: "actions-button-margin-right"}
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"name": "CancelButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": localizableStrings.CancelButtonCaption,
						"click": { bindTo: "goBack" },
						"style": Terrasoft.controls.ButtonEnums.style.DEFAULT,
						"layout": { column: 4, row: 0, colSpan: 2 }
					}
				},
				{
					"operation": "insert",
					"name": "ModuleSettingsContainer",
					"parentName": "ModuleSelectingContainer",
					"propertyName": "items",
					"values": {
						"id": "ModuleSettingsContainer",
						"selectors": {wrapEl: "#ModuleSettingsContainer"},
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"layout": {column: 0, row: 1, colSpan: 12},
						"items": [
						]
					}
				},
				{
					"operation": "insert",
					"name": "moduleName",
					"parentName": "ModuleSettingsContainer",
					"propertyName": "items",
					"values": {
						"bindTo": "ModuleName",
						"contentType": Terrasoft.ContentType.TEXT,
						"labelConfig": {
							"visible": true,
							"caption": localizableStrings.ModuleNameEditCaption
						}
					}
				},
				{
					"operation": "insert",
					"name": "moduleParameters",
					"parentName": "ModuleSettingsContainer",
					"propertyName": "items",
					"values": {
						"bindTo": "ModuleParameters",
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 24
						},
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"labelConfig": {
							"visible": true,
							"caption": localizableStrings.ModuleParametersEditCaption
						}
					}
				}
			]
		};
	});
