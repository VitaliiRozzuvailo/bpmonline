define("TagFilterViewGeneratorV2", ["TagFilterViewGeneratorV2Resources", "ContainerList"],
	function(resources) {
		/**
		 * @class Terrasoft.configuration.TagFilterViewGenerator
		 * Класс TagFilterViewGenerator Формирует параметры представления фильтров по тегу.
		 */
		return Ext.define("Terrasoft.configuration.TagFilterViewGenerator", {
			alternateClassName: "Terrasoft.TagFilterViewGenerator",

			/**
			 * Формирует параметры представления фильтров по тегу.
			 * @param {Object} config Параметры для генерации.
			 * @return {Object|null} Параметры для представления фильтров по тегам.
			 */
			generate: function(config) {
				var isShortFilterVisible = config.isShortFilterVisible;
				if (isShortFilterVisible) {
					return null;
				}
				var viewConfig = {
					className: "Terrasoft.Container",
					classes: {
						wrapClassName: ["filter-inner-container", "tag-filters-container"]
					},
					items: [{
						className: "Terrasoft.Container",
						classes: {
							wrapClassName: ["tag-filters-add-button-container"]
						},
						items: [{
							className: "Terrasoft.Button",
							imageConfig: resources.localizableImages.TagFilterIcon,
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
							click: {"bindTo": "showTagFilterEdit"},
							classes: {
								wrapperClass: ["tag-filters-add-button"],
								imageClass: ["tag-filters-icon"]
							},
							markerValue: "TagFilterAddButton"
						},
						{
							className: "Terrasoft.Label",
							caption: {"bindTo": "TagButtonCaption"},
							click: {"bindTo": "showTagFilterEdit"},
							classes: {
								labelClass: ["tag-filters-add-button-text"]
							}
						}]
					}]
				};
				var containerListConfig = this.generateContainerList(config);
				viewConfig.items.push(containerListConfig);
				return viewConfig;
			},

			/**
			 * Формирует параметры представления элемента управления для отображения фильтров по тегу.
			 * @param {Object} config Параметры для генерации.
			 * @return {Object} Параметры представления элемента управления Terrasoft.ContainerList.
			 */
			generateContainerList: function(config) {
				var sandboxId = config.sandbox.id;
				var containerListId = sandboxId + "_tag_filters_container_list";
				var containerListConfig = {
					"className": "Terrasoft.ContainerList",
					"id": containerListId,
					idProperty: "Id",
					"selectors": {wrapEl: "#" + containerListId},
					"collection": {bindTo: "TagFilters"},
					"classes": {"wrapClassName": ["tags-container-list"]},
					"rowCssSelector": ".tag-filter-item",
					"onGetItemConfig": {bindTo: "onGetTagItemConfig"},
					"itemPrefix": sandboxId,
					"observableRowNumber": -1
				};
				return containerListConfig;
			}
		});
	});
