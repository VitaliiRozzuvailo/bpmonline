define('QuickFilterView', ['ext-base', 'terrasoft', 'FixedFilterView', 'FolderFilterView', 'CustomFilterView',
	'QuickFilterViewResources'],
	function(Ext, Terrasoft, FixedFilterView, FolderFilterView, CustomFilterView, resources) {

		var info;
		function generate(config, currentInfo) {
			info = currentInfo;
			var viewConfig = {
				quickFilterViewConfig: {
					id: config.quickFilterViewContainerName,
					selectors: {
						el: "#" + config.quickFilterViewContainerName,
						wrapEl: "#" + config.quickFilterViewContainerName
					},
					items: [
					],
					classes: {
						wrapperClassName: 'filter-main-container'
					}
				}
			};
			if (config.fixedFilterConfig && config.hasBaseFixedFilters) {
				viewConfig.fixedFilterViewConfig = FixedFilterView.generate(config.fixedFilterConfig);
			}
			if (config.folderFilterConfig && (!info || !info.hideFolderFilter)) {
				viewConfig.folderFilterViewConfig = FolderFilterView.generate(config.folderFilterConfig);
			}
			if (config.customFilterConfig && (!info || !info.hideCustomFilter)) {
				viewConfig.customFilterViewConfig = CustomFilterView.generate(config.customFilterConfig);
			}
			return viewConfig;
		}

		function generateFilterViewConfig(filterName) {
			var viewConfig = {
				id: filterName + 'View',
				selectors: {
					el: '#' + filterName + 'View',
					wrapEl: '#' + filterName + 'View'
				},
				classes: {
					wrapClassName: 'filter-inner-container'
				},
				visible: {
					bindTo: 'viewVisible',
					bindConfig: {
						converter: function(x) {
							if (x === false) {
								return false;
							}
							return true;
						}
					}
				},
				items: [
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['filter-caption-label', 'filter-element-with-right-space']
						},
						caption: {
							bindTo: 'columnCaption',
							bindConfig: {
								converter: function(x) {
									if (x) {
										return x + ':';
									}
									return x;
								}
							}
						},
						visible: {
							bindTo: 'columnCaption',
							bindConfig: {
								converter: function(x) {
									if (x !== '' && !x) {
										return false;
									}
									return true;
								}
							}
						}
					},
					{
						className: 'Terrasoft.Label',
						classes: {
							labelClass: ['filter-value-label', 'filter-element-with-right-space']
						},
						caption: {
							bindTo: 'displayValue'
						},
						click: {
							bindTo: 'editFilter'
						},
						tag: filterName
					},
					{
						className: 'Terrasoft.Button',
						classes: {
							wrapperClass: 'filter-remove-button'
						},
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						imageConfig: resources.localizableImages.RemoveButtonImage,
						click: {
							bindTo: 'removeFilter'
						},
						tag: filterName
					}
				]
			};
			return viewConfig;
		}

		return {
			generate: generate,
			generateAddSimpleFilterConfig: CustomFilterView.generateAddSimpleFilterConfig,
			getSimpleFilterValueEditConfig: CustomFilterView.getSimpleFilterValueEditConfig,
			generateFilterViewConfig: generateFilterViewConfig,
			//TODO Удалить после тестирования
			generateAddSimpleFolderFilterConfig: FolderFilterView.generateAddSimpleFolderFilterConfig,
			generateSimpleEditFilterConfig: FixedFilterView.generateSimpleEditFilterConfig
		};

	});