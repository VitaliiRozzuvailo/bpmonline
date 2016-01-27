define("LookupPageViewGenerator", ["ext-base", "terrasoft", "LookupPageViewGeneratorResources", "GridUtilities",
	"ViewUtilities", "ModuleUtils"],
	function(Ext, Terrasoft, resources, gridUtils, viewUtilities, moduleUtils) {

		function getLookupConfig(args) {
			var isTiled = args.columnsSettingsProfile.isTiled;
			var schema = args.entitySchema;
			var hierarchicalColumnName = schema.hierarchicalColumnName;
			if (!Ext.isEmpty(args.hierarchicalColumnName)) {
				hierarchicalColumnName = args.hierarchicalColumnName;
			}
			if (Ext.isEmpty(hierarchicalColumnName)) {
				args.hierarchical = false;
			}
			return {
				className: "Terrasoft.Grid",
				id: "grid",
				markerValue: "LookupGrid",
				type: isTiled ? "tiled" : "listed",
				useListedLookupImages: args.useListedLookupImages || false,
				primaryColumnName: schema.primaryColumnName,
				multiSelect: {bindTo: "multiSelect"},
				isEmpty: {bindTo: "IsGridEmpty"},
				isLoading: {"bindTo": "IsGridLoading"},
				hierarchical: args.hierarchical,
				hierarchicalColumnName: "parentId",
				watchRowInViewport: 2,
				captionsConfig: [{
					cols: 10,
					name: args.captionConfig
				}],
				columnsConfig: [{
					key: [
						{
							name: {
								bindTo: schema.primaryDisplayColumnName
							}
						}
					]
				}],
				collection: {bindTo: "gridData"},
				watchedRowInViewport: {bindTo: "loadNext"},
				expandHierarchyLevels: {bindTo: "expandHierarchyLevels"},
				updateExpandHierarchyLevels: {bindTo: "onExpandHierarchyLevels"},
				selectedRows: {bindTo: "selectedRows"},
				activeRow: {bindTo: "activeRow"},
				openRecord: {bindTo: "dblClickGrid"},
				sortColumn: {bindTo: "sortColumn"},
				sortColumnDirection: {bindTo: "gridSortDirection"},
				sortColumnIndex: {bindTo: "sortColumnIndex"}
			};
		}

		function getFixedAreaConfig(args) {
			var fixedAreaContainer = viewUtilities.getContainerConfig("fixed-area-container",
				["containerLookupPage", "container-lookup-page-fixed"]);
			var headerContainer = getHeaderConfig(args);
			var selectionControlsConfig = getSelectionControlsConfig(args);
			var editionControlsConfig = getEditionControlsConfig(args);
			var filteringControlsConfig = getFilteringControlsConfig(args);
			var rightContainerConfig = getRightContainerConfig(args);
			fixedAreaContainer.items = [
				headerContainer,
				selectionControlsConfig,
				rightContainerConfig,
				editionControlsConfig,
				filteringControlsConfig
			];
			return fixedAreaContainer;
		}

		function getGridAreaConfig(args) {
			var gridContainer = viewUtilities.getContainerConfig("grid-area-container",
				["containerLookupPage", "container-lookup-page-grid"]);
			var lookupConfig = getLookupConfig(args);
			addColumnConfigToGrid(lookupConfig, args.columnsSettingsProfile);
			gridContainer.items = [lookupConfig];
			return {
				className: "Terrasoft.Container",
				markerValue: "LookupGridContainer",
				items: [gridContainer]
			};
		}

		function getHeaderConfig(args) {
			var commandLineEnabled = args.commandLineEnabled || false;
			var moduleHeaderCaption = ["header-name-container"];
			if (!commandLineEnabled) {
				moduleHeaderCaption.push("header-name-container-full");
			}
			var headerContainer = viewUtilities.getContainerConfig("headContainer", ["header"]);
			var headerNameContainer = viewUtilities.getContainerConfig("header-name-container", moduleHeaderCaption);
			var closeIconContainer = viewUtilities.getContainerConfig("close-icon-container", moduleHeaderCaption);
			closeIconContainer.items = [{
				className: "Terrasoft.Button",
				style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
				imageConfig: resources.localizableImages.CloseIcon,
				classes: {wrapperClass: ["close-btn-user-class"]},
				selectors: {wrapEl: "#headContainer"},
				click: {bindTo: "cancelButton"}
			}];
			headerNameContainer.items = [{
				className: "Terrasoft.Label",
				markerValue: args.entitySchemaName,
				caption: {bindTo: "captionLookup"}
			}];
			var commandLineContainer = viewUtilities.getContainerConfig("module-command-line", ["module-command-line"]);
			commandLineContainer.visible = commandLineEnabled;
			headerContainer.items = [headerNameContainer];
			if (args.mode !== "processMode") {
				headerContainer.items.push(closeIconContainer);
			} else {
				headerContainer.items.push(commandLineContainer);
			}
			return headerContainer;
		}

		function getRequiredPages(args) {
			var pages = [];
			var entityStructure = moduleUtils.getEntityStructureByName(args.entitySchemaName);
			if (entityStructure && entityStructure.pages) {
				var excludedTypes = args.excludedTypes;
				if (excludedTypes) {
					excludedTypes = excludedTypes.map(function(excludedType) {
						return excludedType.toUpperCase();
					});
					Terrasoft.each(entityStructure.pages, function(page) {
						if (excludedTypes.indexOf(page.UId.toUpperCase()) === -1) {
							pages.push(page);
						}
					}, this);
				} else {
					pages = Terrasoft.deepClone(entityStructure.pages);
				}
			}
			return pages;
		}

		function getSelectionControlsConfig(args) {
			var pages = getRequiredPages(args);
			var addButtonConfig = {
				className: "Terrasoft.Button",
				caption: resources.localizableStrings.AddButtonCaption,
				classes: {
					textClass: ["main-buttons"],
					wrapperClass: ["main-buttons"]
				},
				click: {bindTo: "actionButtonClick"},
				tag: "add",
				visible: {bindTo: "hasActions"}
			};
			if (pages.length === 0) {
				addButtonConfig.visible = false;
			} else if (pages.length > 1) {
				delete addButtonConfig.tag;
				delete addButtonConfig.click;
				var menu = addButtonConfig.menu = {};
				var items = menu.items = [];
				Terrasoft.each(pages, function(page) {
					var cardSchema = page.cardSchema;
					var caption = page.caption;
					var typeUId = page.UId;
					var typeColumnName = page.typeColumnName;
					var tag = ["add", cardSchema];
					if (typeUId) {
						tag.push(typeUId);
					}
					if (typeColumnName) {
						tag.push(typeColumnName);
					}
					items.push({
						caption: caption,
						tag: tag.join("/"),
						click: {bindTo: "actionButtonClick"}
					});
				}, this);
			} else if (pages.length === 1) {
				addButtonConfig.tag = "add/" + pages[0].cardSchema;
			}
			var selectionControlsContainer = viewUtilities.getContainerConfig("selectionControlsContainerLookupPage",
				["controlsContainerLookupPage"]);
			selectionControlsContainer.visible = !args.mode;
			selectionControlsContainer.items = [{
				className: "Terrasoft.Button",
				style: Terrasoft.controls.ButtonEnums.style.GREEN,
				caption: args.isRunProcessPage ? resources.localizableStrings.RunButtonCaption :
					resources.localizableStrings.SelectButtonCaption,
				tag: "SelectButton",
				classes: {textClass: ["main-buttons"]},
				click: {bindTo: "selectButton"}
			}, {
				className: "Terrasoft.Button",
				caption: resources.localizableStrings.CancelButtonCaption,
				tag: "CancelButton",
				classes: {textClass: ["main-buttons"]},
				click: {bindTo: "cancelButton"}
			}, addButtonConfig, {
				className: "Terrasoft.Button",
				caption: resources.localizableStrings.ActionButtonCaption,
				tag: "ActionButton",
				classes: {wrapperClass: ["action-buttons"]},
				menu: {items: args.actionsMenuConfig},
				visible: {bindTo: "hasActions"}
			}];
			return selectionControlsContainer;
		}

		function getRightContainerConfig(args) {
			var rightContainer = viewUtilities.getContainerConfig("rightContainerLookupPage",
				["right-container-lookup-page"]);
			rightContainer.items = [];
			if (args.multiSelect) {
				rightContainer.items.push(getOptionsControlsConfig(args));
			}
			var settingsButtonConfig = getSettingsButtonControlsConfig(args);
			settingsButtonConfig.classes.wrapperClass = "lookup-grid-settings-button-wrapperEl";
			rightContainer.items.push(settingsButtonConfig);
			return {
				className: "Terrasoft.Container",
				id: "rightContainer",
				selectors: {wrapEl: "#rightContainer"},
				classes: {wrapClassName: ["rightContainerLookupPage"]},
				items: rightContainer.items
			};
		}

		function getEditionControlsConfig() {
			return {
				className: "Terrasoft.Container",
				id: "editionControlsContainerLookupPage",
				selectors: {wrapEl: "#editionControlsContainerLookupPage"},
				classes: {wrapClassName: ["controlsContainerLookupPage"]},
				visible: {bindTo: "isEditMode"},
				items: [{
					className: "Terrasoft.Button",
					style: Terrasoft.controls.ButtonEnums.style.GREEN,
					caption: resources.localizableStrings.AddButtonCaption,
					tag: "add",
					classes: {
						textClass: ["main-buttons"],
						wrapperClass: ["main-buttons"]
					},
					click: {bindTo: "actionButtonClick"}
				}, {
					className: "Terrasoft.Button",
					caption: resources.localizableStrings.CopyButtonCaption,
					tag: "copy",
					classes: {textClass: ["main-buttons"]},
					click: {bindTo: "actionButtonClick"},
					enabled: {bindTo: "isSingleSelected"}
				}, {
					className: "Terrasoft.Button",
					caption: resources.localizableStrings.EditButtonCaption,
					tag: "edit",
					classes: {textClass: ["main-buttons"]},
					click: {bindTo: "actionButtonClick"},
					enabled: {bindTo: "isSingleSelected"}
				}, {
					className: "Terrasoft.Button",
					caption: resources.localizableStrings.DeleteButtonCaption,
					classes: {textClass: ["main-buttons"]},
					click: {bindTo: "onDelete"},
					enabled: {bindTo: "isAnySelected"}
				}]
			};
		}

		function getProcessControlsConfig(args) {
			return {
				className: "Terrasoft.Container",
				id: "processControlsContainerLookupPage",
				selectors: {
					wrapEl: "#processControlsContainerLookupPage"
				},
				classes: {
					wrapClassName: ["controlsContainerLookupPage"]
				},
				visible: args.mode === "processMode",
				items: [
					{
						className: "Terrasoft.Button",
						style: Terrasoft.controls.ButtonEnums.style.GREEN,
						caption: resources.localizableStrings.StartProcessButtonCaption,
						tag: "executeProcess",
						classes: {textClass: ["main-buttons"]},
						click: {bindTo: "actionButtonClick"}
					},
					{
						className: "Terrasoft.Button",
						caption: resources.localizableStrings.CancelButtonCaption,
						tag: "CancelButton",
						classes: {textClass: ["main-buttons"]},
						click: {bindTo: "cancelButton"}
					},
					{
						className: "Terrasoft.Button",
						id: "showProcessLogButton",
						caption: resources.localizableStrings.ShowProcessLogButtonCaption,
						tag: "ShowProcessLogButton",
						classes: {textClass: ["main-buttons"]},
						click: {bindTo: "showProcessLogButton"}
					}
				]
			};
		}

		function getOptionsControlsConfig(args) {
			return {
				className: "Terrasoft.Container",
				id: "optionsContainerLookupPage",
				selectors: {wrapEl: "#optionsContainerLookupPage"},
				classes: {wrapClassName: ["optionsContainerLookupPage"]},
				items: [{
					className: "Terrasoft.Label",
					classes: {labelClass: ["labelEdit"]},
					caption: resources.localizableStrings.CountSelectedRecord,
					visible: args.multiSelect
				}, {
					className: "Terrasoft.Label",
					classes: {labelClass: ["selectedRowsCountLabel"]},
					caption: {
						bindTo: "selectedRows",
						bindConfig: {
							converter: function(values) {
								return values ? values.length : 0;
							}
						}
					},
					visible: args.multiSelect
				}]
			};
		}

		function getFilteringControlsConfig() {
			return {
				className: "Terrasoft.Container",
				id: "filteringContainerLookupPage",
				selectors: {wrapEl: "#filteringContainerLookupPage"},
				classes: {wrapClassName: ["filteringContainerLookupPage"]},
				items: [{
					className: "Terrasoft.ComboBoxEdit",
					id: "columnEdit",
					markerValue: "columnEdit",
					classes: {wrapClass: ["columnEdit"]},
					value: {bindTo: "searchColumn"},
					list: {bindTo: "schemaColumns"},
					prepareList: {bindTo: "getSchemaColumns"}
				}, {
					className: "Terrasoft.TextEdit",
					id: "searchEdit",
					markerValue: "searchEdit",
					classes: {wrapClass: ["searchEdit"]},
					enterkeypressed: {bindTo: "onSearchButtonClick"},
					value: {bindTo: "searchData"},
					afterrender: {
						bindTo: "afterRender"
					}
				}, {
					className: "Terrasoft.Button",
					caption: resources.localizableStrings.SearchButtonCaption,
					tag: "SearchButton",
					markerValue: "applyButton",
					style: Terrasoft.controls.ButtonEnums.style.BLUE,
					classes: {textClass: ["vertical-align-top"]},
					click: {bindTo: "onSearchButtonClick"}
				}]
			};
		}

		function getSettingsButtonControlsConfig(args) {
			return gridUtils.getSettingsButtonConfig(args);
		}

		function addColumnConfigToGrid(gridConfig, columnsSettingsProfile) {
			if (columnsSettingsProfile) {
				var gridsColumnsConfig = columnsSettingsProfile.isTiled ?
					columnsSettingsProfile.tiledColumnsConfig : columnsSettingsProfile.listedColumnsConfig;
				if (gridsColumnsConfig) {
					var columnsConfig = Ext.decode(gridsColumnsConfig);
					if (columnsConfig.length > 0) {
						gridConfig.columnsConfig = columnsConfig;
						if (!columnsSettingsProfile.isTiled) {
							gridConfig.captionsConfig = Ext.decode(columnsSettingsProfile.captionsConfig);
						}
					}
				}
			}
		}

		function getItemsConfig(args) {
			var fixedAreaContainer = viewUtilities.getContainerConfig("fixed-area-container", []);
			var headerContainer = getHeaderConfig(args);
			var selectionControlsConfig = getSelectionControlsConfig(args);
			var editionControlsConfig = getEditionControlsConfig(args);
			var processControlsConfig = getProcessControlsConfig(args);
			var optionsControlsConfig = getOptionsControlsConfig(args);
			var filteringControlsConfig = getFilteringControlsConfig(args);
			var lookupConfig = getLookupConfig(args);
			addColumnConfigToGrid(lookupConfig, args.columnsSettingsProfile);

			if (args.mode !== "processMode") {
				fixedAreaContainer.items = [
					headerContainer,
					selectionControlsConfig,
					editionControlsConfig,
					processControlsConfig,
					optionsControlsConfig,
					filteringControlsConfig
				];
				return [
					fixedAreaContainer,
					lookupConfig
				];
			} else {
				return [
					headerContainer,
					selectionControlsConfig,
					editionControlsConfig,
					processControlsConfig,
					optionsControlsConfig,
					filteringControlsConfig,
					lookupConfig
				];
			}
		}

		function getLoadMoreButtonConfig() {
			var loadButton = gridUtils.getLoadButtonConfig();
			loadButton.classes = {wrapperClass: ["show-all-btn-user-class", "lookuppage-loadbutton-pos"]};
			loadButton.click = {bindTo: "loadNext"};
			loadButton.visible = {bindTo: "advancedVisible"};
			return loadButton;
		}

		function getAdvancedSpinnerConfig() {
			return {
				className: "Terrasoft.ProgressSpinner",
				classes: {extraComponentClasses: "lookuppage-loadspiner-pos"},
				visible: {bindTo: "advancedSpinnerVisible"}
			};
		}

		function getActionsMenuConfig() {
			var actionsMenuConfig = [];
			actionsMenuConfig.push({
				caption: resources.localizableStrings.UnSelectAllActionCaption,
				visible: {bindTo: "isUnSelectAllMenuVisible"},
				enabled: {bindTo: "isAnySelected"},
				click: {bindTo: "clearSelection"}
			});
			actionsMenuConfig.push({
				className: "Terrasoft.MenuSeparator",
				visible: {bindTo: "isUnSelectAllMenuVisible"}
			});
			actionsMenuConfig.push({
				caption: resources.localizableStrings.EditButtonCaption,
				tag: "edit",
				click: {bindTo: "actionButtonClick"},
				visible: {bindTo: "canEdit"},
				enabled: {bindTo: "isSingleSelected"}
			});
			actionsMenuConfig.push({
				caption: resources.localizableStrings.CopyButtonCaption,
				tag: "copy",
				click: {bindTo: "actionButtonClick"},
				visible: {bindTo: "canEdit"},
				enabled: {bindTo: "isSingleSelected"}
			});
			actionsMenuConfig.push({
				caption: resources.localizableStrings.DeleteButtonCaption,
				click: {bindTo: "onDelete"},
				visible: {bindTo: "canDelete"},
				enabled: {bindTo: "isAnySelected"}
			});
			return actionsMenuConfig;
		}

		function getViewConfig(config) {
			var itemsConfig = getItemsConfig(config);
			var loadButton = getLoadMoreButtonConfig();
			var advancedSpinner = getAdvancedSpinnerConfig();
			itemsConfig.push(loadButton);
			itemsConfig.push(advancedSpinner);
			var mainContainer = viewUtilities.getContainerConfig("containerLookupPage", ["containerLookupPage"]);
			mainContainer.items = itemsConfig;
			return mainContainer;
		}
		return {
			generate: getViewConfig,
			generateFixed: getFixedAreaConfig,
			getActionsMenuConfig: getActionsMenuConfig,
			generateGrid: getGridAreaConfig
		};
	});
