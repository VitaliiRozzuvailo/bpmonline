define("MainMenuTileGenerator", ["ext-base", "terrasoft", "ViewGeneratorV2"],
	function(Ext, Terrasoft) {
		Ext.define("Terrasoft.configuration.MainMenuTileGenerator", {
			extend: "Terrasoft.ViewGenerator",
			alternateClassName: "Terrasoft.MainMenuTileGenerator",

			/**
			 * Генерирует конфигурацию представления для {Terrasoft.ContainerList}.
			 * @protected
			 * @virtual
			 * @param {Object} config Описание элемента представления.
			 * @return {Object} Возвращает сгенерированное представление ContainerList.
			 */
			generateMainMenuTile: function(config) {
				var clonedConfig = Terrasoft.deepClone(config);
				var result = this.generateTileView(clonedConfig);
				return result;
			},

			generateTileView: function(tile) {
				var tileId = "tile-" + tile.name;
				var tileItemsContainerCfg = {
					className: "Terrasoft.Container",
					classes: {
						wrapClassName: ["items-container"]
					},
					items: []
				};
				var iconContainer = {
					className: "Terrasoft.Container",
					classes: {
						wrapClassName: ["image-panel"]
					}
				};
				if (tile.icon) {
					var iconUrl = Terrasoft.ImageUrlBuilder.getUrl(tile.icon);
					iconContainer.styles = {
						"wrapStyles": {"background-image": "url(" + iconUrl + ")"}
					};
				}
				var items = this.generateTileItems(tile.items);
				tileItemsContainerCfg.items = items;
				var wrapClasses = ["tile"];
				if (!Ext.isEmpty(tile.cls)) {
					var customClasses = Ext.isArray(tile.cls) ? tile.cls : [tile.cls];
					wrapClasses = wrapClasses.concat(customClasses);
				}
				var tileContainer = {
					className: "Terrasoft.Container",
					id: tileId,
					classes: {
						wrapClassName: wrapClasses
					},
					markerValue: tile.markerValue || tile.caption,
					items: [
						{
							className: "Terrasoft.Container",
							id: tileId + "-color-panel",
							classes: {
								wrapClassName: ["color-panel"]
							}
						},
						{
							className: "Terrasoft.Container",
							classes: {
								wrapClassName: ["view-panel"]
							},
							items: [
								{
									className: "Terrasoft.Label",
									id: tileId + "-caption",
									caption: tile.caption,
									classes: {
										labelClass: ["tile-caption"]
									}
								},
								{
									className: "Terrasoft.Container",
									classes: {
										wrapClassName: ["content-panel"]
									},
									items: [
										iconContainer,
										tileItemsContainerCfg
									]
								}
							]
						}
					]
				};
				return tileContainer;
			},

			generateTileItems: function(itemsCfg) {
				var result = [];
				Terrasoft.each(itemsCfg, function(item) {
					var tileItemContainer = {
						className: "Terrasoft.Container",
						classes: {
							wrapClassName: ["tile-item"]
						},
						visible: (item.visible === undefined) ? true : item.visible,
						items: []
					};
					var tileItemView =
					{
						className: "Terrasoft.Hyperlink",
						caption: item.caption,
						markerValue: item.markerValue || item.caption,
						tag: item.tag
					};
					if (item.click) {
						tileItemView.click = item.click;
					}
					tileItemContainer.items.push(tileItemView);
					result.push(tileItemContainer);
				}, this);
				return result;
			},

			generateVideoPanel: function(config) {
				var playBtnIcon = Terrasoft.ImageUrlBuilder.getUrl(config.playBtnIcon);
				var activePlayBtnIcon = Terrasoft.ImageUrlBuilder.getUrl(config.activePlayBtnIcon);
				var playlist = this.generatePlayList(config.playlist, playBtnIcon, activePlayBtnIcon);
				var defaultVideoUrl = playlist.length > 0 ? playlist[0].href : "";
				var result = {
					className: "Terrasoft.Container",
					classes: {
						wrapClassName: ["video-container", "right-item"]
					},
					"id": "VideoPanel",
					"selectors": {"wrapEl": "#VideoPanel"},
					markerValue: config.markerValue || "video-container",
					items: [
						{
							className: "Terrasoft.Container",
							html: '<iframe name="bpmonline-video" id="bpmonline-video" width="560" height="315" src="'+encodeURI(defaultVideoUrl)+'" frameborder="0" allowfullscreen></iframe>',
							selectors: {
								wrapEl: "#bpmonline-video"
							}
						}
					]
				};
				result.items = result.items.concat(playlist);
				result.visible = (playlist.length > 0);
				return result;
			},

			generatePlayList: function(itemsCfg, playBtnIcon, activePlayBtnIcon) {
				var playlist = [];
				//"active-video-link"
				Terrasoft.each(itemsCfg, function(item) {
					if (!Ext.isEmpty(item.videoUrl)) {
						var playlistItem = {
							className: "Terrasoft.Hyperlink",
							tpl: [
								'<a id="{id}" name="{name}" href="{href}" target="{target}" class="{hyperlinkClass}" style="{hyperlinkStyle}" title="{hint}" type="{type}">',
								'<div class="{videoLinkImageClass}" style="{playBtnStyle}"></div>{caption}',
								'</a>'
							],
							target: "bpmonline-video",
							href: item.videoUrl,
							caption: item.caption,
							classes: {
								hyperlinkClass: ["ts-box-sizing", "video-link"],
								videoLinkImageClass: ["play-video-image"]
							},
							tplData: {
								playBtnStyle: {
									"background-image": "url(" + playBtnIcon + ")"
								}
							}
						};
						playlist.push(playlistItem);
					}
				}, this);
				return playlist;
			},

			generateAcademyBaner: function(config) {
				var bannerUrl = Terrasoft.ImageUrlBuilder.getUrl(config.bannerImage);
				var navigationConfig = config.navigationConfig;
				var navigateBtnRightUrl = Terrasoft.ImageUrlBuilder.getUrl(navigationConfig.rightIcon);
				var wrapClassName = ["academy-container", "right-item"];
				if (!Ext.isEmpty(config.wrapClassName)) {
					var customClasses = Ext.isArray(config.wrapClassName)
						? config.wrapClassName
						: [config.wrapClassName];
					wrapClassName = wrapClassName.concat(customClasses);
				}
				var result = {
					className: "Terrasoft.Container",
					classes: {
						wrapClassName: wrapClassName
					},
					markerValue: config.markerValue || "academy-container",
					visible: config.visible,
					items: [
						{
							className: "Terrasoft.Component",
							tpl: '<img id="academy-img" class="academy-image" src="'+bannerUrl+'"/>',
							selectors: {
								wrapEl: "#academy-img"
							}
						},
						{
							className: "Terrasoft.Container",
							classes: {
								wrapClassName: ["academy-caption-container"]
							},
							items: [
								{
									className: "Terrasoft.Label",
									caption: config.bannerCaption,
									classes: {
										labelClass: ["academy-caption"]
									}
								},
								{
									className: "Terrasoft.Label",
									caption: config.bannerHint,
									classes: {
										labelClass: ["academy-hint"]
									}
								}
							]
						},
						{
							className: "Terrasoft.Button",
							caption: navigationConfig.caption,
							classes: {
								wrapperClass: ["goto-academy-button"]
							},
							click: navigationConfig.click,
							iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.RIGHT,
							imageConfig: {
								source: Terrasoft.ImageSources.URL,
								url: navigateBtnRightUrl
							},
							markerValue: "GoToAcademyButton"
						}
					]
				};
				return result;
			},

			generateMobileAppBaner: function(config) {
				var androidIcon =  Terrasoft.ImageUrlBuilder.getUrl(config.androidIcon);
				var iosIcon =  Terrasoft.ImageUrlBuilder.getUrl(config.iosIcon);
				var windowsIcon =  Terrasoft.ImageUrlBuilder.getUrl(config.windowsIcon);
				var result = {
					className: "Terrasoft.Container",
					classes: {
						wrapClassName: ["mobile-apps-container", "right-item"]
					},
					visible: config.visible,
					markerValue: config.markerValue || "mobile-apps-container",
					items: [
						{
							className: "Terrasoft.Label",
							caption: config.caption
						},
						{
							className: "Terrasoft.Container",
							classes: {
								wrapClassName: ["mobile-apps-links-container"]
							},
							items: [
								{
									className: "Terrasoft.Component",
									tpl: [
										'<a id="windows-store" class="{linkClass}" href="{storeLink}" target="_blank" rel="nofollow">',
										'<img src="{imageUrl}" class="{imageClass}" alt="Download on the App Store">',
										'</a>'
									],
									tplData: {
										storeLink: config.windowsUrl,
										imageUrl: windowsIcon
									},
									classes: {
										linkClass: ["mobile-app-link"],
										imageClass: ["mobile-app-image"]
									},
									selectors: {
										wrapEl: "#windows-store"
									},
									markerValue: "windows-store"
								},
								{
									className: "Terrasoft.Component",
									tpl: [
										'<a id="app-store" class="{linkClass}" href="{storeLink}" target="_blank" rel="nofollow">',
										'<img src="{imageUrl}" class="{imageClass}" alt="Download on the App Store">',
										'</a>'
									],
									tplData: {
										storeLink: config.iosUrl,
										imageUrl: iosIcon
									},
									classes: {
										linkClass: ["mobile-app-link"],
										imageClass: ["mobile-app-image"]
									},
									selectors: {
										wrapEl: "#app-store"
									},
									markerValue: "app-store"
								},
								{
									className: "Terrasoft.Component",
									tpl: [
										'<a id="play-market" class="{linkClass}" href="{storeLink}" target="_blank" rel="nofollow">',
										'<img src="{imageUrl}" class="{imageClass}" alt="Download on the App Store">',
										'</a>'
									],
									tplData: {
										storeLink: config.androidUrl,
										imageUrl: androidIcon
									},
									classes: {
										linkClass: ["mobile-app-link"],
										imageClass: ["mobile-app-image"]
									},
									selectors: {
										wrapEl: "#play-market"
									},
									markerValue: "play-market"
								}
							]
						}
					]
				};
				return result;
			},

			generateTerrasoftAccountsLinks: function(config) {
				var socialAccountItems = this.generateSocialAccountButtons(config.socialAccounts);
				var communityIcon =  Terrasoft.ImageUrlBuilder.getUrl(config.communityIcon);
				var wrapClassName = ["references-container", "right-item"];
				if (!Ext.isEmpty(config.wrapClassName)) {
					var customClasses = Ext.isArray(config.wrapClassName)
						? config.wrapClassName
						: [config.wrapClassName];
					wrapClassName = wrapClassName.concat(customClasses);
				}
				var result = {
					className: "Terrasoft.Container",
					classes: {
						wrapClassName: wrapClassName
					},
					markerValue: config.markerValue || "references-container",
					items: [
						{
							className: "Terrasoft.Container",
							classes: {
								wrapClassName: ["sdk-container"]
							},
							id: "sdk-container-el",
							visible: config.IsSdkPanelVisible,
							items: [
								{
									className: "Terrasoft.Container",
									classes: {
										wrapClassName: ["sdk-caption-container"]
									},
									items: [
										{
											className: "Terrasoft.Label",
											classes: {
												labelClass: ["sdk-caption"]
											},
											caption: "SDK"
										}
									]
								},
								{
									className: "Terrasoft.Label",
									classes: {
										labelClass: ["sdk-hint"]
									},
									caption: config.sdkCaption
								}
							]
						},
						{
							className: "Terrasoft.Container",
							classes: {
								wrapClassName: ["community-container"]
							},
							visible: config.IsComunityPanelVisible,
							id: "community-container-el",
							items: [
								{
									className: "Terrasoft.Component",
									tpl: '<img id="community-icon" class="community-icon" src="'+communityIcon+'"/>',
									selectors: {
										wrapEl: "#community-icon"
									}
								},
								{
									className: "Terrasoft.Label",
									classes: {
										labelClass: ["community-caption"]
									},
									caption: config.communityCaption
								}
							],
							markerValue: "CommunityContainer"
						},
						{
							className: "Terrasoft.Container",
							classes: {
								wrapClassName: ["social-networks-container"]
							},
							visible: config.IsSocialAccountsPanelVisible,
							items: socialAccountItems
						}
					]
				};
				return result;
			},

			generateSocialAccountButtons: function(itemsCfg) {
				var items = [];
				Terrasoft.each(itemsCfg, function(item) {
					var itemIcon = Terrasoft.ImageUrlBuilder.getUrl(item.icon);
					var itemCfg = {
						className: "Terrasoft.Hyperlink",
						tpl: [
								'<a id="{id}" name="{name}" href="{href}" target="_blank" class="{hyperlinkClass}" style="{hyperlinkStyle}" title="{hint}" type="{type}">',
								'<img src="{imageSrc}">',
								'</a>'
							],
						tplData: {
							imageSrc: itemIcon
						},
						href: item.href,
						classes: {
							hyperlinkClass: ["social-network"]
						},
						markerValue: item.markerValue
					};
					items.push(itemCfg);
				}, this);
				return items;
			}
		});

		return new Terrasoft.configuration.MainMenuTileGenerator();
	});
