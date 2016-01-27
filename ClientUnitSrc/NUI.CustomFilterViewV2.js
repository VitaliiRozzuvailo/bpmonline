define("CustomFilterViewV2", ["ext-base", "terrasoft", "CustomFilterViewV2Resources"],
	function(Ext, Terrasoft, resources) {

		function generateAddSimpleFilterConfig(valueEditConfig, simpleFilterEditContainerName, customFilterId) {
			var config = valueEditConfig ? valueEditConfig : "Terrasoft.TextEdit";
			var viewConfig = {
				id: simpleFilterEditContainerName,
				selectors: {
					el: "#" + simpleFilterEditContainerName,
					wrapEl: "#" + simpleFilterEditContainerName
				},
				classes: {
					wrapClassName: "filter-inner-container simple-filter-edit-container"
				},
				items: [
					{
						className: "Terrasoft.ComboBoxEdit",
						markerValue: "columnEdit",
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
					Ext.apply(getSimpleFilterValueEditConfig(config), {id: customFilterId}),
					{
						className: "Terrasoft.Button",
						markerValue: "applyButton",
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
						markerValue: "cancelButton",
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
			var shortFilterConfig = getShortFilterConfig(!config.isShortFilterVisible);
			/*jshint quotmark: false */
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
				classes: {
					wrapClassName: "custom-filter-container custom-filter-arrow"
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: config.customFilterButtonContainerName,
						selectors: {
							el: "#" + config.customFilterButtonContainerName,
							wrapEl: "#" + config.customFilterButtonContainerName
						},
						classes: {
							wrapClassName: "filter-inner-container custom-filter-button-container"
						},
						items: [shortFilterConfig]
					}
				],
				afterrender: {
					bindTo: "initialize"
				}
			};
			/*jshint quotmark: true */
			return viewConfig;
		}

		function getSimpleFilterValueEditConfig(config) {
			var controlConfig = {
				markerValue: "searchEdit",
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
			} else {
				controlConfig.className = config;
			}
			return controlConfig;
		}

		/**
		 * Возвращает параметры для посторения представления фильтра в зависимости от режима отображения.
		 * @protected
		 * @param {Boolean} isShowShortFilterMenu Признак отображения фильтра c выпадающим меню.
		 * @return {Object} shortFilterConfig Параметры для посторения представления фильров.
		 */
		function getShortFilterConfig(isShowShortFilterMenu) {
			var addConfigFilter = null;
			var shortFilterConfig = {
				className: "Terrasoft.Button",
				imageConfig: resources.localizableImages.ImageFilter,
				style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
				markerValue: "filterButton"
			};
			if (isShowShortFilterMenu) {
				addConfigFilter = {
					caption: {
						bindTo: "buttonCaption"
					},
					menu: {
						items: {
							bindTo: "ActionsMenu"
						}
					}
				};
			} else {
				addConfigFilter = {
					click: {
						bindTo: "showSimpleFilter"
					}
				};
			}
			Ext.apply(shortFilterConfig, addConfigFilter);
			return shortFilterConfig;
		}

		return {
			generate: generate,
			generateAddSimpleFilterConfig: generateAddSimpleFilterConfig,
			getSimpleFilterValueEditConfig: getSimpleFilterValueEditConfig
		};

	});
