define("SectionDesignerHeaderModule", [
	"ext-base", "terrasoft", "sandbox", "SectionDesignerHeaderModuleResources",
	"SectionDesignerUtils", "SectionDesignDataModule", "SectionDesignerEnums"
],
	function(Ext, Terrasoft, sandbox, resources, SectionDesignerUtils, SectionDesignDataModule, SectionDesignerEnums) {

		var localizableStrings = resources.localizableStrings;

		var localizableImages = resources.localizableImages;

		var stepsButtons = [];

		var viewModel;

		function goToStep(step) {
			sandbox.publish("GoToStep", {
				stepCompleteResult: step
			});
		}

		function getButtonConfig(tag) {
			var config = {
				className: "Terrasoft.Button",
				caption: localizableStrings[tag + "ButtonCaption"],
				imageConfig: localizableImages[tag + "ButtonImage"],
				classes: {
					textClass: ["utils-button"],
					wrapperClass: ["utils-button"]
				},
				click: {
					bindTo: "on" + tag + "ButtonClick"
				},
				tag: tag,
				enabled: {
					bindTo: "getButtonEnabled"
				},
				markerValue: tag
			};
			return config;
		}

		function getViewModel() {
			return Ext.create("Terrasoft.BaseViewModel", {
				values: {
					visible: true
				},
				methods: {
					onStepItemClick: function(a1, a2, a3, tag) {
						var menuItems = this.get(tag + "MenuItems");
						if (menuItems && menuItems.getCount()) {
							return false;
						}
						sandbox.publish("PostDesignerStructureSelectedItem", {itemKey: tag});
					},
					onStepSubItemClick: function(tag) {
						sandbox.publish("PostDesignerStructureSelectedItem", {itemKey: tag});
					},
					onApplyButtonClick: function() {
						goToStep(SectionDesignerEnums.StepType.FINISH);
					},
					onNextButtonClick: function() {
						goToStep(SectionDesignerEnums.StepType.NEXT);
					},
					onPreviousButtonClick: function() {
						goToStep(SectionDesignerEnums.StepType.PREV);
					},
					onCancelButtonClick: function() {
						goToStep(SectionDesignerEnums.StepType.EXIT);
					},
					onSaveButtonClick: function() {
						goToStep(SectionDesignerEnums.StepType.FINISH);
					},
					getStepButtonStyle: function(tag) {
						var defaultStyle = Terrasoft.controls.ButtonEnums.style.DEFAULT;
						var currentStep = this.get("currentStep");
						var style;
						if (currentStep === tag) {
							style = Terrasoft.controls.ButtonEnums.style.GREEN;
						}
						return style || defaultStyle;
					},
					getButtonEnabled: function(tag) {
						var customConfig = this.get("stepButtonsConfig");
						if (customConfig && customConfig[tag]) {
							return customConfig[tag].enabled;
						}
						return true;
					}
				}
			});
		}

		function onRefreshSteps(stepsConfig) {
			Terrasoft.each(stepsConfig, function(item) {
				var subItems = item.subItems;
				if (subItems) {
					var menuItemsCollectionName = item.tag + "MenuItems";
					var collection = this.get(menuItemsCollectionName);
					collection.clear();
					subItems.each(function(subItem) {
						collection.add(subItem.key, Ext.create("Terrasoft.BaseViewModel", {
							values: {
								Caption: subItem.caption,
								Tag: item.tag + "/" + subItem.key,
								MarkerValue: item.tag + "/" + subItem.caption,
								Click: {bindTo: "onStepSubItemClick"}
							}
						}));
					});
					var captionItemName = item.tag + "Caption";
					if (collection.getCount()) {
						viewModel.set(captionItemName, item.manyItemsCaption || item.caption);
					} else {
						viewModel.set(captionItemName, item.caption);
					}
				}
			}, this);
			var itemTag = sandbox.publish("GetSectionDesignerStructureItemKey");
			viewModel.set("currentStep", itemTag);
		}

		function getView() {
			var stepsConfig = sandbox.publish("GetDesignerStructureConfig");
			var stepNumber = 0;
			Terrasoft.each(stepsConfig, function(item) {
				var tag = item.tag;
				var button = getButtonConfig(tag);
				stepNumber++;
				var captionItemName = tag + "Caption";
				button.caption = {bindTo: captionItemName};
				stepsButtons.push(button);
				button.click = {bindTo: "onStepItemClick"};
				button.style = {bindTo: "getStepButtonStyle"};
				viewModel.set(captionItemName, item.caption);
				if (item.subItems) {
					var menuItemsCollectionName = tag + "MenuItems";
					button.menu = {
						items: {
							bindTo: menuItemsCollectionName
						}
					};
					viewModel.set(menuItemsCollectionName, new Terrasoft.Collection());
				}
			});
			onRefreshSteps.call(viewModel, stepsConfig);
			var saveButton = getButtonConfig("Save");
			saveButton.style = Terrasoft.controls.ButtonEnums.style.BLUE;
			var cancelButton = getButtonConfig("Cancel");
			var utilsLeftButtons = [saveButton, cancelButton];
			var nextButton = getButtonConfig("Next");
			nextButton.style = Terrasoft.controls.ButtonEnums.style.BLUE;
			var previousButton = getButtonConfig("Previous");
			previousButton.style = Terrasoft.controls.ButtonEnums.style.BLUE;
			var utilsRightButtons = Ext.Array.push(previousButton, stepsButtons, nextButton);
			var config = {
				id: "moduleHeaderContainer",
				selectors: {
					wrapEl: "#moduleHeaderContainer"
				},
				visible: {
					bindTo: "visible"
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: "headerCaptionContainer",
						selectors: {
							wrapEl: "#headerCaptionContainer"
						},
						classes: {
							wrapClassName: ["header"]
						},
						items: [{
							className: "Terrasoft.Label",
							classes: {
								labelClass: ["header-label", "header-section-caption-class"]
							},
							caption: {
								bindTo: "header"
							}
						}]
					},
					{
						className: "Terrasoft.Container",
						id: "utilsContainer",
						selectors: {
							wrapEl: "#utilsContainer"
						},
						classes: {
							wrapClassName: ["utils"]
						},
						items: [
							{
								className: "Terrasoft.Container",
								id: "utilsLeftContainer",
								selectors: {
									wrapEl: "#utilsLeftContainer"
								},
								classes: {
									wrapClassName: ["utils-left"]
								},
								items: utilsLeftButtons
							},
//							{
//								className: "Terrasoft.Container",
//								id: "utilsCenterContainer",
//								selectors: {
//									wrapEl: "#utilsCenterContainer"
//								},
//								classes: {
//									wrapClassName: ["utils-center"]
//								},
//								items: utilsCenterButtons
//							},
							{
								className: "Terrasoft.Container",
								id: "utilsRightContainer",
								selectors: {
									wrapEl: "#utilsRightContainer"
								},
								classes: {
									wrapClassName: ["utils-right"]
								},
								items: utilsRightButtons
							}
						]
					}
				]
			};
			return Ext.create("Terrasoft.Container", config);
		}

		/**
		 * Обновляет свойства верхней панели.
		 * @param {Object} config Конфигурационный объект верхней панелт.
		 * @param {String} config.header Заголовок.
		 * @param {Object} config.buttons Конфигурационный объект кнопок верхней панели.
		 */
		function updateHeader(config) {
			this.set("visible", true);
			this.set("header", config.header);
			this.set("stepButtonsConfig", config.buttons || null);
		}

		function render(renderTo) {
			if (!viewModel) {
				viewModel = getViewModel();
				var view = getView();
				view.bind(viewModel);
				view.render(renderTo);
				viewModel.set("visible", false);
				sandbox.subscribe("RefreshSteps", onRefreshSteps, viewModel);
				var config = sandbox.publish("GetHeaderConfig");
				if (config && config.header) {
					updateHeader.call(viewModel, config);
				}
				sandbox.subscribe("SetPageHeaderInfo", function(config) {
					updateHeader.call(this, config);
				}, viewModel);
			}
		}

		return {
			render: render
		};
	}
);
