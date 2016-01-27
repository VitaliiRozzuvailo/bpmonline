define("SimpleIntro", ["SimpleIntroResources", "ConfigurationConstants"], function(resources, ConfigurationConstants) {
		return {
			attributes: {
				"SystemDesignerVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: true
				}
			},
			methods: {
				init: function() {
					this.callParent(arguments);
					this.isSystemDesignerVisible();
				},

				/**
				 * Устанавливает видимость для пункта "Дизайнер системы".
				 */
				isSystemDesignerVisible: function() {
					Terrasoft.SysSettings.querySysSettings(["BuildType"], function(sysSettings) {
						var buildType = sysSettings.BuildType;
						if (buildType && (buildType.value === ConfigurationConstants.BuildType.Public)) {
							this.set("SystemDesignerVisible", false);
						} else {
							this.set("SystemDesignerVisible", true);
						}
					}, this);
				}
			},
			diff: [
				{
					"operation": "merge",
					"name": "MainContainer",
					"values": {
						"markerValue": "main-menu"
					}
				},
				{
					"operation": "insert",
					"name": "BasicTile",
					"propertyName": "items",
					"parentName": "LeftContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"generator": "MainMenuTileGenerator.generateMainMenuTile",
						"caption": {"bindTo": "Resources.Strings.BasisCaption"},
						"cls": "basis",
						"icon": resources.localizableImages.BasisIcon,
						"items": []
					}
				},
				{
					"operation": "insert",
					"propertyName": "items",
					"parentName": "BasicTile",
					"name": "ESNFeedSectionV2",
					"values": {
						"itemType": Terrasoft.ViewItemType.LINK,
						"caption": {"bindTo": "Resources.Strings.FeedSectionCaption"},
						"tag": "SectionModuleV2/ESNFeedSectionV2/",
						"click": {"bindTo": "onNavigateTo"}
					}
				},
				{
					"operation": "insert",
					"propertyName": "items",
					"parentName": "BasicTile",
					"name": "AccountSectionV2",
					"values": {
						"itemType": Terrasoft.ViewItemType.LINK,
						"caption": {"bindTo": "Resources.Strings.AccountSectionCaption"},
						"tag": "SectionModuleV2/AccountSectionV2/",
						"click": {"bindTo": "onNavigateTo"}
					}
				},
				{
					"operation": "insert",
					"propertyName": "items",
					"parentName": "BasicTile",
					"name": "ContactSectionV2",
					"values": {
						"itemType": Terrasoft.ViewItemType.LINK,
						"caption": {"bindTo": "Resources.Strings.ContactSectionCaption"},
						"tag": "SectionModuleV2/ContactSectionV2/",
						"click": {"bindTo": "onNavigateTo"}
					}
				},
				{
					"operation": "insert",
					"propertyName": "items",
					"parentName": "BasicTile",
					"name": "ActivitySectionV2",
					"values": {
						"itemType": Terrasoft.ViewItemType.LINK,
						"caption": {"bindTo": "Resources.Strings.ActivitySectionCaption"},
						"tag": "SectionModuleV2/ActivitySectionV2/",
						"click": {"bindTo": "onNavigateTo"}
					}
				},
				{
					"operation": "insert",
					"propertyName": "items",
					"parentName": "BasicTile",
					"name": "KnowledgeBaseSectionV2",
					"values": {
						"itemType": Terrasoft.ViewItemType.LINK,
						"caption": {"bindTo": "Resources.Strings.KnowlegebaseSectionCaption"},
						"tag": "SectionModuleV2/KnowledgeBaseSectionV2/",
						"click": {"bindTo": "onNavigateTo"}
					}
				},
				{
					"operation": "insert",
					"name": "AnalyticsTile",
					"propertyName": "items",
					"parentName": "LeftContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"generator": "MainMenuTileGenerator.generateMainMenuTile",
						"caption": {"bindTo": "Resources.Strings.AnalyticsCaption"},
						"cls": "analytics",
						"icon": resources.localizableImages.AnalyticsIcon,
						"items": []
					}
				},
				{
					"operation": "insert",
					"propertyName": "items",
					"parentName": "AnalyticsTile",
					"name": "DashboardsModule",
					"values": {
						"itemType": Terrasoft.ViewItemType.LINK,
						"caption": {"bindTo": "Resources.Strings.DashboardsSectionCaption"},
						"tag": "DashboardsModule/",
						"click": {"bindTo": "onNavigateTo"}
					}
				},
				{
					"operation": "insert",
					"name": "SettingsTile",
					"propertyName": "items",
					"parentName": "LeftContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"generator": "MainMenuTileGenerator.generateMainMenuTile",
						"caption": {"bindTo": "Resources.Strings.SettingsCaption"},
						"cls": "settings",
						"icon": resources.localizableImages.SettingsIcon,
						"items": []
					}
				},
				{
					"operation": "insert",
					"propertyName": "items",
					"parentName": "SettingsTile",
					"name": "SystemDesigner",
					"values": {
						"itemType": Terrasoft.ViewItemType.LINK,
						"caption": {"bindTo": "Resources.Strings.SectionDesignerCaption"},
						"tag": "IntroPage/SystemDesigner",
						"click": {"bindTo": "onNavigateTo"},
						"visible": {"bindTo": "SystemDesignerVisible"}
					}
				},
				{
					"operation": "insert",
					"propertyName": "items",
					"parentName": "SettingsTile",
					"name": "ProfileModule",
					"values": {
						"itemType": Terrasoft.ViewItemType.LINK,
						"caption": {"bindTo": "Resources.Strings.ProfileCaption"},
						"tag": "ProfileModule",
						"click": {"bindTo": "onNavigateTo"}
					}
				}
			]
		};
	});
