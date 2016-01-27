define("BaseRelationshipDetailV2", ["BaseRelationshipDetailV2Resources", "ConfigurationEnums"],
	function(resources, enums) {
	return {
		attributes: {},
		messages: {
			"GetAddMode": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			},
			"GetMasterRecordId": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		methods: {
			/**
			 * Возвращает идентификатор страницы редактирования детали.
			 * @returns {String} Идентификатор страницы редактирования детали.
			 */
			getRelationshipEditPageModuleId: function() {
				var editPages = this.get("EditPages");
				var editPage = editPages.getByIndex(0);
				return this.getEditPageSandboxId(editPage);
			},
			/**
			 * Метод добавления записи
			 * @param mode
			 */
			addRelation: function(mode) {
				this.mode = mode;
				var schemaName = "BaseRelationshipDetailPageV2";
				var cardModuleId = this.getRelationshipEditPageModuleId();
				var defaultValueColumnName = this.get("CardPageName") === "ContactPageV2" ? "ContactA" : "AccountA";
				var openCardConfig = {
					moduleId: cardModuleId,
					schemaName: schemaName,
					defaultValues: [{
						name: defaultValueColumnName,
						value: this.get("MasterRecordId")
					}],
					operation: enums.CardStateV2.ADD
				};
				var editPages = this.get("EditPages");
				if (editPages.getCount() === 0) {
					return;
				}
				var editPage = editPages.getByIndex(0);
				var editPageUId = editPage.get("Tag");
				var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
				var isNew = (cardState.state === enums.CardStateV2.ADD ||
					cardState.state === enums.CardStateV2.COPY);
				if (isNew) {
					this.set("CardState", enums.CardStateV2.ADD);
					this.set("EditPageUId", editPageUId);
					var args = {
						isSilent: true,
						messageTags: [this.sandbox.id]
					};
					this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
				} else {
					this.sandbox.publish("OpenCard", openCardConfig, [this.sandbox.id]);
				}
			},
			/**
			 * открытие на изменение
			 * @overridden
			 */
			editRecord: function() {
				this.mode = null;
				var selectedItems = this.getSelectedItems();
				if (this.Ext.isEmpty(selectedItems)) {
					return;
				}
				var relationRecordId = selectedItems[0];
				var schemaName = "BaseRelationshipDetailPageV2";
				var cardModuleId = this.getRelationshipEditPageModuleId();
				var openCardConfig = {
					moduleId: cardModuleId,
					schemaName: schemaName,
					operation: enums.CardStateV2.EDIT,
					id: relationRecordId
				};
				this.sandbox.publish("OpenCard", openCardConfig, [this.sandbox.id]);
			},

			/**
			 * Метод добавления контакта
			 * @private
			 */
			addContactRelation: function() {
				this.addRelation("AddContact");
			},

			/**
			 * Метод добавления контрагента
			 * @private
			 */
			addAccountRelation: function() {
				this.addRelation("AddAccount");
			},

			/**
			 * @overridden
			 */
			init: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("GetAddMode", function() {
					return this.mode;
				}, this, [this.getRelationshipEditPageModuleId()]);
				this.sandbox.subscribe("GetMasterRecordId", function() {
					return this.get("MasterRecordId");
				}, this, [this.getRelationshipEditPageModuleId()]);
			},

			/**
			 * Обновляет деталь после загрузки данных.
			 * @overridden
			 */
			afterLoadGridDataUserFunction: function() {
				this.reloadGridData();
			},

			/**
			 * Возвращает имя колонки для фильтрации по умолчанию.
			 * @overridden
			 * @return {String} Имя колонки.
			 */
			getFilterDefaultColumnName: function() {
				return "RelatedObjectName";
			}

		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "AddRecordButton",
				"values": { visible: false }
			},
			{
				"operation": "insert",
				"name": "AddRelationRecordButton",
				"parentName": "Detail",
				"propertyName": "tools",
				"index": 1,
				"values": {
					visible: { bindTo: "getToolsVisible" },
					itemType: Terrasoft.ViewItemType.BUTTON,
					menu: [],
					"caption": {"bindTo": "Resources.Strings.AddButtonCaption"}
				}
			},
			{
				"operation": "insert",
				"name": "AddContactRelationMenu",
				"parentName": "AddRelationRecordButton",
				"propertyName": "menu",
				"values": {
					caption: { bindTo: "Resources.Strings.AddContactRelationMenuCaption" },
					click: { bindTo: "addContactRelation" }
				}
			},
			{
				"operation": "insert",
				"name": "AddAccountRelationMenu",
				"parentName": "AddRelationRecordButton",
				"propertyName": "menu",
				"values": {
					caption: { bindTo: "Resources.Strings.AddAccountRelationMenuCaption" },
					click: { bindTo: "addAccountRelation" }
				}
			},
			{
				"operation": "merge",
				"name": "DataGrid",
				"values": {
					"type": "listed",
					"listedConfig": {
						"name": "DataGridListedConfig",
						"items": [
							{
								"name": "RelatedObjectListedGridColumn",
								"bindTo": "RelatedObjectName",
								"position": { "column": 0, "colSpan": 12 },
								"type": Terrasoft.GridCellType.TITLE,
								"caption": resources.localizableStrings.RelatedObjectName
							},
							{
								"name": "RelationTypeListedGridColumn",
								"bindTo": "RelationType",
								"position": { "column": 13, "colSpan": 12 }
							}
						]
					},
					"tiledConfig": {
						"name": "DataGridTiledConfig",
						"grid": { "columns": 24, "rows": 3 },
						"items": [
							{
								"name": "RelatedObjectTiledGridColumn",
								"bindTo": "RelatedObjectName",
								"position": { "row": 1, "column": 0, "colSpan": 12 },
								"type": Terrasoft.GridCellType.TITLE,
								"caption": resources.localizableStrings.RelatedObjectNameCaption
							},
							{
								"name": "RelationTypeTiledGridColumn",
								"bindTo": "RelationType",
								"position": { "row": 1, "column": 13, "colSpan": 12 }
							}
						]
					}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});