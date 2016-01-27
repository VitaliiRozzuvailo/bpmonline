define("KnowledgeBasePageV2", [],
		function() {
			return {
				entitySchemaName: "KnowledgeBase",
				messages: {},
				details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
				methods: {
					/**
					 * Инициализирует начальные значения модели для Tabs.
					 * @overridden
					 */
					initTabs: function() {
						this.setActiveTab("GeneralInfoTab");
						this.callParent(arguments);
						var tabsCollection = this.get("TabsCollection");
						if (tabsCollection.contains("ESNTab")) {
							tabsCollection.removeByKey("ESNTab");
						}
					},
					/**
					 * @overridden
					 * @inheritdoc BasePageV2#getDefaultTabName
					 */
					getDefaultTabName: function() {
						var defaultTabName = this.callParent(arguments);
						if (defaultTabName === "ESNTab") {
							defaultTabName = "GeneralInfoTab";
						}
						return defaultTabName;
					}
				},
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "move",
						"parentName": "GeneralInfoTab",
						"name": "ESNFeedContainer",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTAINER,
							"items": []
						}
					}, {
						"operation": "move",
						"parentName": "ESNFeedContainer",
						"propertyName": "items",
						"name": "ESNFeed",
						"values": {
							"itemType": Terrasoft.ViewItemType.MODULE,
							"afterrender": { "bindTo": "loadESNFeed" },
							"afterrerender": { "bindTo": "loadESNFeed" }
						}
					}
				]/**SCHEMA_DIFF*/
			};
		});