define("SectionMenuModule", ["SectionMenuModuleResources", "ModuleUtils", "MaskHelper"],
	function(resources, ModuleUtils, MaskHelper) {
		function createConstructor(context) {
			var sideBar;
			var Ext = context.Ext;
			var sandbox = context.sandbox;
			var Terrasoft = context.Terrasoft;
			var info;
			var pages;
			var currentSelection = null;

			var getSideBarItems = function() {
				var config = [];
				var moduleStructure = Terrasoft.configuration.ModuleStructure;
				var modules = info && info.modules ? info.modules : Object.keys(moduleStructure);
				var availableSections = info.AvailableSections;
				var defaultIconUrl = Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.DefaultIcon);
				if (modules) {
					modules.forEach(function(module) {
						if (module.moduleId !== Terrasoft.data.constants.GUID_EMPTY) {
							var moduleName = module.moduleName ? module.moduleName : module;
							var moduleConfig = moduleStructure[moduleName];
							var imageId = moduleStructure[moduleName].imageId;
							var imageUrl = imageId ? getImageUrl(imageId) : defaultIconUrl;
							var tag = ModuleUtils.getModuleTag(moduleName);
							if (moduleConfig.hide !== "true") {
								if (!Ext.isArray(availableSections) ||
									(Ext.isArray(availableSections) && availableSections.indexOf(moduleName) >= 0)) {
									config.push({
										caption: moduleStructure[moduleName].moduleCaption,
										tag: tag,
										imageUrl: imageUrl
									});
								}
							}
						}
					});
				}
				return config;
			};

			var getImageUrl = function(imageId) {
				var imageConfig = {
					source: Terrasoft.ImageSources.SYS_IMAGE,
					params: {
						primaryColumnValue: imageId
					}
				};
				var imageUrl = Terrasoft.ImageUrlBuilder.getUrl(imageConfig);
				return imageUrl;
			};

			var render = function(renderTo) {
				MaskHelper.HideBodyMask();
				sandbox.subscribe("PostSectionMenuConfig", function(args) {
					info = args;
					var items = getSideBarItems();
					var index = 0;
					var selectedItemIndex = -1;
					Terrasoft.each(items, function(item) {
						if (item.tag === currentSelection) {
							selectedItemIndex = index;
							return;
						}
						index++;
					});
					if (sideBar) {
						sideBar.destroy();
					}
					sideBar = Ext.create("Terrasoft.SideBar", {
						renderTo: renderTo,
						items: items,
						selectedItemIndex: selectedItemIndex
					});
					sideBar.on("itemSelected", onSidebarItemSelected);
				}, [sandbox.id, "SectionMenuModuleId"]);
				sandbox.publish("GetSectionMenuInfo", sandbox.id);
				var token = sandbox.publish("GetHistoryState");
				if (token) {
					onHistoryStateChanged(token, true);
				}
			};

			function onHistoryStateChanged(token, silent) {
				if (!sideBar) {
					return;
				}
				var currentState = sandbox.publish("GetHistoryState");
				var moduleName = token.hash ? token.hash.moduleName : null;
				var entityName = token.hash ? token.hash.entityName : null;
				var oldOperationType = currentState.hash.operationType;
				if (entityName) {
					entityName = moduleName + "/" + findCurrentSection(entityName, oldOperationType) + "/";
				} else {
					entityName = moduleName + "/";
				}
				onSelectedSideBarItemChanged(entityName, silent);
			}

			function findCurrentSection(entityName, oldOperationType) {
				for (var i = 0; i < pages.length; i += 1) {
					for (var j = 0; j < pages[i].length; j += 1) {
						if (entityName === pages[i][j]) {
							entityName = pages[i][0];
							return entityName;
						}
					}
				}
				if (entityName.search("Page") !== -1) {
					entityName = entityName.replace("Page", "Section");
				} else {
					if (oldOperationType) {
						entityName = oldOperationType + "Section";
					}
				}
				return entityName;
			}

			function findAllSections() {
				var arr = [];
				var isCreated = false;
				var sections = Terrasoft.configuration.ModuleStructure;
				var entityStructure = null;
				for (var i in sections) {
					isCreated = false;
					entityStructure = Terrasoft.configuration.EntityStructure[i] || sections[i].pages;
					var pages = entityStructure ? entityStructure.pages : null;
					if (pages) {
						for (var j = 0; j < pages.length; j += 1) {
							if (pages[j].cardSchema) {
								if (!isCreated) {
									arr[arr.length] = [];
									arr[arr.length - 1][0] = sections[i].sectionSchema;
									isCreated = true;
								}
								arr[arr.length - 1][arr[arr.length - 1].length] = pages[j].cardSchema;
							}
						}
					}
				}
				return arr;
			}

			function onSidebarItemSelected(item, tag) {
				var currentModule = sandbox.publish("GetHistoryState").hash.historyState;
				if (currentModule !== tag) {
					MaskHelper.ShowBodyMask();
					sandbox.publish("PushHistoryState", {hash: tag});
				}
			}

			function init() {
				MaskHelper.ShowBodyMask();
				sandbox.subscribe("FocusCorrectSideBar", function() {
					correctFocusSideBar();
				});
				sandbox.subscribe("SelectedSideBarItemChanged", onSelectedSideBarItemChanged, [sandbox.id]);
				pages = findAllSections();
			}

			function correctFocusSideBar() {
				var currentState = sandbox.publish("GetHistoryState");
				var sectionName = currentState.hash.moduleName + "/" +
					currentState.hash.entityName.replace("Page", "Section") + "/";
				onSelectedSideBarItemChanged(sectionName);
			}

			function onSelectedSideBarItemChanged(item, silent) {
				currentSelection = item;
				if (sideBar) {
					var index = 0;
					sideBar.setSelectedItem();
					Terrasoft.each(sideBar.items, function(sideBarItem) {
						if (compareSideBarItemTag(sideBarItem.tag, item)) {
							sideBar.setSelectedItem(index);
							var config = {
								caption: sideBarItem.caption
							};
							if (silent !== true) {
								sandbox.publish("SectionChanged", config);
							}
							return true;
						}
						index++;
					});
				}
			}

			/**
			 * Сравнивает значения тегов элемента левого меню и тега из хеша.
			 * @param {String} itemTag Тег элетента левого меню.
			 * @param {String} tag Тег из хеша.
			 * @returns {boolean} Совпадение хешей в названии раздела.
			 */
			function compareSideBarItemTag(itemTag, tag) {
				if (itemTag === tag) {
					return true;
				}
				var tagItems = tag.split("/");
				if (tagItems.length > 2 && tagItems[1].indexOf("Section") > 0) {
					var sidebarTagItems = itemTag.split("/");
					if (sidebarTagItems.length > 2 && sidebarTagItems[1] === tagItems[1]) {
						return true;
					}
				}
				return false;
			}

			return Ext.define("SectionMenuModule", {
				init: init,
				render: render
			});
		}
		return createConstructor;
	});