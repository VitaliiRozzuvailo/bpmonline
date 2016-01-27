define("BaseIntroPageSchema", ["BaseIntroPageSchemaResources", "MainMenuTileGenerator"],
	function(resources, MainMenuTileGenerator) {
		return {
			attributes: {
				"LmsUrl": {dataValueType: Terrasoft.DataValueType.TEXT},

				"ProductEdition": {dataValueType: Terrasoft.DataValueType.TEXT},

				"ConfigurationVersion": {dataValueType: Terrasoft.DataValueType.TEXT},

				"AcademyUrl": {dataValueType: Terrasoft.DataValueType.TEXT},

				"VideoUrl": {dataValueType: Terrasoft.DataValueType.TEXT},

				"VideoCaption": {dataValueType: Terrasoft.DataValueType.TEXT},

				"IsAcademyBannerVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: true
				},

				"IsMobilePannerVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: true
				},

				"IsSdkPanelVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: false
				},

				"IsComunityPanelVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: true
				},

				"IsSocialAccountsPanelVisible": {
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					value: true
				}
			},
			messages: {
				/**
				 * @message SelectedSideBarItemChanged
				 * Изменяет выделение текущего раздела в меню раделов левой панели.
				 * @param {String} Структура раздела (Напр. "SectionModuleV2/AccountPageV2/" или "DashboardsModule/").
				*/
				"SelectedSideBarItemChanged": {
					mode: this.Terrasoft.MessageMode.PTP,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			methods: {
				onNavigateTo: function(event, tag) {
					this.showBodyMask();
					this.sandbox.publish("SelectedSideBarItemChanged", tag, ["sectionMenuModule"]);
					this.sandbox.publish("PushHistoryState", {
						hash: tag
					});
					return false;
				},

				navigateToAcademy: function() {
					var path = this.get("LmsUrl");
					var parameters = [];
					var productEdition = this.get("ProductEdition");
					if (productEdition) {
						parameters.push("product=" + encodeURIComponent(productEdition));
					}
					var configurationVersion = this.get("ConfigurationVersion");
					if (configurationVersion) {
						parameters.push("ver=" + encodeURIComponent(configurationVersion));
					}
					var academyUrl = this.get("AcademyUrl");
					if (academyUrl) {
						window.open(academyUrl);
					} else {
						window.open(path + "?" + parameters.join("&"));
					}
				},

				CommunityClick: function() {
					var communityLink = this.get("Resources.Strings.CommunityUrl");
					window.open(communityLink);
				},

				SdkClick: function() {
					var path = this.get("LmsUrl");
					var parameters = [];
					parameters.push("product=" + encodeURIComponent("SDK"));
					var configurationVersion = this.get("ConfigurationVersion");
					if (configurationVersion) {
						parameters.push("ver=" + encodeURIComponent(configurationVersion));
					}
					window.open(path + "?" + parameters.join("&"));
				},

				init: function(callback, scope) {
					this.callParent([function() {
						var sysSettingsNameArray = ["UseLMSDocumentation", "LMSUrl", "ProductEdition",
							"ConfigurationVersion"];
						this.Terrasoft.SysSettings.querySysSettings(sysSettingsNameArray, function(values) {
							this.sandbox.publish("SelectedSideBarItemChanged", "", ["sectionMenuModule"]);
							this.set("LmsUrl", values.LMSUrl);
							this.set("ProductEdition", values.ProductEdition);
							this.set("ConfigurationVersion", values.ConfigurationVersion);
							this.set("UseLMSDocumentation", values.UseLMSDocumentation);
							var currentCultureId = this.Terrasoft.Resources.CultureSettings.currentCultureId;
							var russianCultureId = "1a778e3f-0a8e-e111-84a3-00155d054c03";
							if (values.UseLMSDocumentation === false || (currentCultureId !== russianCultureId)) {
								this.set("IsAcademyBannerVisible", false);
							}
						}, this);

						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "IntroPageLookup",
							serverESQCacheParameters: {
								cacheLevel: Terrasoft.ESQServerCacheLevels.SESSION,
								cacheGroup: "ApplicationMainMenu",
								cacheItemName: scope.schemaName + "Lookup"
							}
						});
						select.addColumn("AcademyUrl");
						select.addColumn("VideoUrl");
						select.addColumn("VideoCaption");
						select.filters.addItem(
							this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "CodePage", scope.schemaName));
						select.execute(function(result) {
							this.preparePageLinks(result, callback, scope);
						}, this);
					}, this]);
				},

				onRender: function() {
					var sdkContainer = this.Ext.get("sdk-container-el");
					var communityContainer = this.Ext.get("community-container-el");
					if (!this.Ext.isEmpty(sdkContainer)) {
						sdkContainer.on("click", this.SdkClick, this);
					}
					if (!this.Ext.isEmpty(communityContainer)) {
						communityContainer.on("click", this.CommunityClick, this);
					}
				},

				/**
				 * Получает ссылки из справочника.
				 * @param {Object} response Ответ от сервера.
				 * @param {Object} callback функция обратного вызова.
				 * @param {Object} scope контекст выполнения.
				 */
				preparePageLinks: function(response, callback, scope) {
					var needRender = false;
					if (response.success && response.collection.getCount() > 0) {
						var row = response.collection.getItems()[0];
						this.set("AcademyUrl", row.get("AcademyUrl"));
						this.set("VideoUrl", row.get("VideoUrl"));
						this.set("VideoCaption", row.get("VideoUrl"));
						if (row.get("VideoUrl") && row.get("VideoUrl").length > 0) {
							var videoPanel = MainMenuTileGenerator.generateVideoPanel({
								"playBtnIcon": resources.localizableImages.playBtn,
								"activePlayBtnIcon": resources.localizableImages.playBtnActive,
								"playlist": [{
									"videoUrl": row.get("VideoUrl"),
									"caption":  row.get("VideoCaption")
								}]
							});
							var videoPanelEl = this.Ext.create("Terrasoft.Container", videoPanel);
							needRender = true;
						}
					}
					if (callback) {
						callback.call(scope);
						if (needRender) {
							this.Ext.get("VideoPanel").remove();
							videoPanelEl.render(this.Ext.get("right-container"), 0);
						}
					}
				}
			},
			diff: [
				{
					"operation": "insert",
					"name": "MainContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						id: "main-container",
						"classes": {
							"wrapClassName": ["main-container", "x-unselectable"]
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "LeftContainer",
					"propertyName": "items",
					"parentName": "MainContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						id: "left-container",
						"classes": {
							"wrapClassName": ["left-container", "main-container-panel"]
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "RightContainer",
					"propertyName": "items",
					"parentName": "MainContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"id": "right-container",
						"classes": {
							"wrapClassName": ["right-container", "main-container-panel"]
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "VideoPanel",
					"propertyName": "items",
					"parentName": "RightContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"generator": "MainMenuTileGenerator.generateVideoPanel",
						"playBtnIcon": resources.localizableImages.playBtn,
						"activePlayBtnIcon": resources.localizableImages.playBtnActive,
						"playlist": []
					}
				},
				{
					"operation": "insert",
					"name": "AcademyPanel",
					"propertyName": "items",
					"parentName": "RightContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"generator": "MainMenuTileGenerator.generateAcademyBaner",
						"bannerImage": resources.localizableImages.AcademyBanner,
						"bannerCaption": {"bindTo": "Resources.Strings.BannerCaption"},
						"bannerHint": {"bindTo": "Resources.Strings.BannerHint"},
						"visible": {bindTo: "IsAcademyBannerVisible"},
						"navigationConfig": {
							"caption": {"bindTo": "Resources.Strings.ButtonCaption"},
							"click": {"bindTo": "navigateToAcademy"},
							"rightIcon": resources.localizableImages.Arrow
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "MobileAppLinksPanel",
					"propertyName": "items",
					"parentName": "RightContainer",
					"values": {
						"visible": {"bindTo": "IsMobilePannerVisible"},
						"caption": {"bindTo": "Resources.Strings.MobileAppCaption"},
						"androidUrl": resources.localizableStrings.AndroidUrl,
						"iosUrl": resources.localizableStrings.IosUrl,
						"windowsUrl": resources.localizableStrings.WindowsUrl,
						"androidIcon": resources.localizableImages.AndroidIcon,
						"iosIcon": resources.localizableImages.IosIcon,
						"windowsIcon": resources.localizableImages.WindowsIcon,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"generator": "MainMenuTileGenerator.generateMobileAppBaner",
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "TerrasoftAccountsLinksPanel",
					"propertyName": "items",
					"parentName": "RightContainer",
					"values": {
						"IsComunityPanelVisible": {"bindTo": "IsComunityPanelVisible"},
						"IsSdkPanelVisible": {"bindTo": "IsSdkPanelVisible"},
						"IsSocialAccountsPanelVisible": {"bindTo": "IsSocialAccountsPanelVisible"},
						"sdkCaption": {"bindTo": "Resources.Strings.SdkCaption"},
						"communityCaption": {"bindTo": "Resources.Strings.CommunityCaption"},
						"communityIcon": resources.localizableImages.CommunityIcon,
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"generator": "MainMenuTileGenerator.generateTerrasoftAccountsLinks",
						"socialAccounts": []
					}
				},
				{
					"operation": "insert",
					"name": "LinkedIn",
					"propertyName": "socialAccounts",
					"parentName": "TerrasoftAccountsLinksPanel",
					"values": {
						"icon": resources.localizableImages.LinkedinIcon,
						"href": resources.localizableStrings.LinkedInUrl,
						"markerValue": "LinkedIn"
					}
				},
				{
					"operation": "insert",
					"name": "Google",
					"propertyName": "socialAccounts",
					"parentName": "TerrasoftAccountsLinksPanel",
					"values": {
						"icon": resources.localizableImages.GoogleIcon,
						"href": resources.localizableStrings.GoogleUrl,
						"markerValue": "Google"
					}
				},
				{
					"operation": "insert",
					"name": "Twitter",
					"propertyName": "socialAccounts",
					"parentName": "TerrasoftAccountsLinksPanel",
					"values": {
						"icon": resources.localizableImages.TwitterIcon,
						"href": resources.localizableStrings.TwitterUrl,
						"markerValue": "Twitter"
					}
				},
				{
					"operation": "insert",
					"name": "Facebook",
					"propertyName": "socialAccounts",
					"parentName": "TerrasoftAccountsLinksPanel",
					"values": {
						"icon": resources.localizableImages.FacebookIcon,
						"href": resources.localizableStrings.FacebookUrl,
						"markerValue": "Facebook"
					}
				},
				{
					"operation": "insert",
					"name": "Youtube",
					"propertyName": "socialAccounts",
					"parentName": "TerrasoftAccountsLinksPanel",
					"values": {
						"icon": resources.localizableImages.YoutubeIcon,
						"href": resources.localizableStrings.YoutubeUrl,
						"markerValue": "Youtube"
					}
				}
			]
		};
	});
