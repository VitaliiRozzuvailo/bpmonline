define("SysAdminUnitFuncRolePageV2", ["SysAdminUnitFuncRolePageV2Resources"],
	function(resources) {
		return {
			details: /**SCHEMA_DETAILS*/{
				SysFuncRoleInOrgRoleDetailV2: {
					filter: {
						detailColumn: "FuncRole"
					},
					captionName: "SysFuncRoleInOrgRoleDetailCaption"
				}
			}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 0,
					"name": "OrgRolesTab",
					"values": {
						"caption": { "bindTo": "Resources.Strings.RolesTabCaption" },
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 1,
					"name": "UsersTab",
					"values": {
						"caption": { "bindTo": "Resources.Strings.UsersTabCaption" },
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "UsersTab",
					"propertyName": "items",
					"name": "UsersDetailV2",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 2,
					"name": "IPRangeTab",
					"values": {
						"caption": {"bindTo": "Resources.Strings.IPRangeTabCaption"},
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "OrgRolesTab",
					"propertyName": "items",
					"name": "SysFuncRoleInOrgRoleDetailV2",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"parentName": "IPRangeTab",
					"propertyName": "items",
					"name": "SysAdminUnitIPRangeDetailV2",
					"values": {
						"itemType": this.Terrasoft.ViewItemType.DETAIL
					}
				}
			]/**SCHEMA_DIFF*/,
			methods: {
				/**
				 * Возвращает заголовок страницы
				 * @protected
				 * @virtual
				 */
				getHeader: function() {
					return this.get("Resources.Strings.HeaderCaption");
				}
			}
		};
	});