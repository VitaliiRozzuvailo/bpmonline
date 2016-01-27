define("CustomFilterView", ["ext-base", "terrasoft", "CustomFilterViewResources"],
	function(Ext, Terrasoft, resources) {

		function generateAddSimpleFilterConfig(valueEditConfig, simpleFilterEditContainerName) {
			var config = valueEditConfig ? valueEditConfig : "Terrasoft.TextEdit";
			var viewConfig = {
				id: simpleFilterEditContainerName,
				selectors: {
					el: "#" + simpleFilterEditContainerName,
					wrapEl: "#" + simpleFilterEditContainerName
				},
				classes: {
					wrapClassName: "filter-inner-container"
				},
				items: [
					{
						className: "Terrasoft.ComboBoxEdit",
						classes: {
							wrapClass: "filter-simple-filter-edit"
						},
						value: {
							bindTo: "simpleFilterColumn"
						},
						list: {
							bindTo: "simpleFilterColumnList"
						},
						prepareList: {
							bindTo: "getSimpleFilterColumnList"
						},
						change: {
							bindTo: "simpleFilterColumnChange"
						},
						placeholder: resources.localizableStrings.SimpleFilterEmptyColumnEditPlaceHolder
					},
					Ext.apply(getSimpleFilterValueEditConfig(config), {id: "simpleFilterValueColumn"}),
					{
						className: "Terrasoft.Button",
						imageConfig: resources.localizableImages.ApplyButtonImage,
						style: Terrasoft.controls.ButtonEnums.style.BLUE,
						classes: {
							wrapperClass: ["filter-element-with-right-space"]
						},
						click: {
							bindTo: "applySimpleFilter"
						}
					},
					{
						className: "Terrasoft.Button",
						imageConfig: resources.localizableImages.CancelButtonImage,
						click: {
							bindTo: "destroySimpleFilterAddingContainer"
						}
					}
				],
				destroy: {
					bindTo: "clearSimpleFilterProperties"
				}
			};
			return viewConfig;
		}

		function generate(config) {
			var viewConfig = {
				id: config.customFilterContainerName,
				selectors: {
					el: "#" + config.customFilterContainerName,
					wrapEl: "#" + config.customFilterContainerName
				},
				tpl: [
					'<span id="{id}" style="{wrapStyles}" class="{wrapClassName}">',
					"{%this.renderItems(out, values)%}",
					"</span>"
				],
				items: [
					{
						className: "Terrasoft.Container",
						id: config.customFilterButtonContainerName,
						selectors: {
							el: "#" + config.customFilterButtonContainerName,
							wrapEl: "#" + config.customFilterButtonContainerName
						},
						classes: {
							wrapClassName: "filter-inner-container"
						},
						items: [
							{
								className: "Terrasoft.Button",
								caption: {
									bindTo: "buttonCaption"
								},
								imageConfig: resources.localizableImages.ImageFilter,
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								menu: {
									items: [
										{
											className: "Terrasoft.MenuItem",
											caption: resources.localizableStrings.AddConditionMenuItemCaption,
											click: {
												bindTo: "addSimpleFilter"
											}
										},
										{
											className: "Terrasoft.MenuItem",
											caption: resources.localizableStrings.ShowFoldersMenuItemCaption,
											click: {
												bindTo: "showFolders"
											}
										},
										{
											className: "Terrasoft.MenuItem",
											caption: resources.localizableStrings.ExtendedModeMenuItemCaption,
											click: {
												bindTo: "goToExtendedMode"
											}
										},
										{
											className: "Terrasoft.MenuItem",
											caption: resources.localizableStrings.ClearFilterMenuItemCaption,
											click: {
												bindTo: "clearConditions"
											}
										}
//TODO Раскомментировать когда будет реализовано сохранение в качестве динамической группы
//										,
//										{
//											className: "Terrasoft.MenuSeparator"
//										},
//										{
//											className: "Terrasoft.MenuItem",
//											caption: resources.localizableStrings.SaveAsDynamicFolderMenuItemCaption,
//											click: {
//												bindTo: "saveAsDynamicFolder"
//											}
//										}
									]
								}
							}
						]
					}
				],
				afterrender: {
					bindTo: "initialize"
				}
			};
			return viewConfig;
		}

		function getSimpleFilterValueEditConfig(config) {
			var controlConfig = {
				classes: {
					wrapClass: "filter-simple-filter-edit"
				},
				value: {
					bindTo: "simpleFilterValueColumn"
				},
				enterkeypressed: {
					bindTo: "applySimpleFilter"
				},
				placeholder: resources.localizableStrings.SimpleFilterEmptyValueEditPlaceHolder
			};
			if (config.className) {
				Ext.apply(controlConfig, config);
			}
			else {
				controlConfig.className = config;
			}
			return controlConfig;
		}

		return {
			generate: generate,
			generateAddSimpleFilterConfig: generateAddSimpleFilterConfig,
			getSimpleFilterValueEditConfig: getSimpleFilterValueEditConfig
		};

	});