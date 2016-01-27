define("SysWorkplacePageV2", [],
	function() {
		return {
			entitySchemaName: "SysWorkplace",
			attributes: {},
			details: /**SCHEMA_DETAILS*/{
				SysAdminUnit: {
					schemaName: "SysAdminUnitInWorkplaceDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "SysWorkplace"
					},
					defaultValues: {
						SysWorkplace: {
							masterColumn: "Id"
						}
					}
				},
				SysModule: {
					schemaName: "SysModuleInWorkplaceDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "SysWorkplace"
					},
					defaultValues: {
						SysWorkplace: {
							masterColumn: "Id"
						}
					}
				}
			}/**SCHEMA_DETAILS*/,
			methods: {
				/**
				 * Инициализирует подпись заголовка страницы
				 * @protected
				 */
				initHeaderCaption: function() {
					var caption = this.get("Resources.Strings.HeaderCaption");
					this.set("NewRecordPageCaption", caption);
				},

				/**
				 * Возвращает пустую коллекцию действий карточки
				 * @override
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий карточки
				 */
				getActions: function() {
					var actionMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
					return actionMenuItems;
				}

			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Name",
					"values": {
						"bindTo": "Name",
						"layout": {"column": 0, "row": 0, "colSpan": 23}
					}
				}, {
					"operation": "insert",
					"name": "SettingsTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": { bindTo: "Resources.Strings.SettingsTabCaption"},
						"items": []
					}
				}, {
					"operation": "insert",
					"parentName": "SettingsTab",
					"propertyName": "items",
					"name": "SysModule",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				}, {
					"operation": "insert",
					"parentName": "SettingsTab",
					"propertyName": "items",
					"name": "SysAdminUnit",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				}, {
					"operation": "remove",
					"name": "ViewOptionsButton"
				}
			]/**SCHEMA_DIFF*/
		};
	});