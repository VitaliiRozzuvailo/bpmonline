define("FolderFilterViewV2", ["ext-base", "terrasoft", "FolderFilterViewV2Resources"],
	function(Ext, Terrasoft, resources) {

		function generate(config) {
			/*jshint quotmark: false */
			var viewConfig = {
				id: config.folderFilterContainerName,
				selectors: {
					el: "#" + config.folderFilterContainerName,
					wrapEl: "#" + config.folderFilterContainerName
				},
				classes: {
					wrapClassName: "folder-filter-container"
				},
				tpl: [
					'<span id="{id}" style="{wrapStyles}" class="{wrapClassName}">',
					"{%this.renderItems(out, values)%}",
					"</span>"
				],
				items: [],
				afterrender: {
					bindTo: "initialize"
				},
				destroy: {
					bindTo: "clearFolderValue"
				}
			};
			/*jshint quotmark: true */
			return viewConfig;
		}

		//TODO Удалить после тестирования
		function generateAddSimpleFolderFilterConfig(simpleFilterEditContainer) {
			var viewConfig = {
				id: simpleFilterEditContainer,
				selectors: {
					el: "#" + simpleFilterEditContainer,
					wrapEl: "#" + simpleFilterEditContainer
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
							bindTo: "folderFilterColumn"
						},
						list: {
							bindTo: "folderFilterColumnList"
						},
						placeholder: resources.localizableStrings.FolderFilterEmptyFolderEditPlaceHolder
					},
					{
						className: "Terrasoft.Button",
						imageConfig: resources.localizableImages.ApplyButtonImage,
						style: Terrasoft.controls.ButtonEnums.style.BLUE,
						classes: {
							wrapperClass: ["filter-element-with-right-space"]
						},
						click: {
							bindTo: "applyFolderFilter"
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

		return {
			generate: generate,
			generateAddSimpleFolderFilterConfig: generateAddSimpleFolderFilterConfig
		};

	});