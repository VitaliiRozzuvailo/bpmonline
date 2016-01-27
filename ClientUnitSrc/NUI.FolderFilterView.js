define('FolderFilterView', ['ext-base', 'terrasoft', 'FolderFilterViewResources'],
	function(Ext, Terrasoft, resources) {

		function getMainButtonMenuConfig(favorites) {
			var menuConfig = {
				items: [
					{
						className: 'Terrasoft.MenuItem',
						caption: resources.localizableStrings.AddConditionMenuItemCaption,
						click: {
							bindTo: 'selectFolder'
						}
					},
					{
						className: 'Terrasoft.MenuSeparator'
					}
				]
			};
			Terrasoft.each(favorites, function(favorite) {
				var favoriteMenuItemConfig = {
					className: 'Terrasoft.MenuItem',
					caption: favorite.displayValue,
					tag: favorite.value,
					click: {
						bindTo: 'addFavoriteFolderFilter'
					}
				};
				menuConfig.items.push(favoriteMenuItemConfig);
			}, this);
			return menuConfig;
		}

		function getMainButtonConfig(config) {
			var buttonConfig = {
				className: 'Terrasoft.Button',
				caption: {
					bindTo: 'buttonCaption'
				},
				imageConfig: resources.localizableImages.FolderImage,
				style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT
			};
			if (config.favorites) {
				buttonConfig.menu = getMainButtonMenuConfig(config.favorites);
			}
			else {
				buttonConfig.click = {
					bindTo: 'selectFolder'
				};
			}
			return buttonConfig;
		}

		function generate(config) {
			var viewConfig = {
				id: config.folderFilterContainerName,
				selectors: {
					el: "#" + config.folderFilterContainerName,
					wrapEl: "#" + config.folderFilterContainerName
				},
				tpl: [
					'<span id="{id}" style="{wrapStyles}" class="{wrapClassName}">',
					'{%this.renderItems(out, values)%}',
					'</span>'
				],
				items: [
					{
						className: 'Terrasoft.Container',
						id: config.folderFilterButtonContainerName,
						selectors: {
							el: "#" + config.folderFilterButtonContainerName,
							wrapEl: "#" + config.folderFilterButtonContainerName
						},
						classes: {
							wrapClassName: 'filter-inner-container'
						},
						items: [
							getMainButtonConfig(config)
						]
					}
				],
				afterrender: {
					bindTo: 'initialize'
				}
			};
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
					wrapClassName: 'filter-inner-container'
				},
				items: [
					{
						className: 'Terrasoft.ComboBoxEdit',
						classes: {
							wrapClass: 'filter-simple-filter-edit'
						},
						value: {
							bindTo: 'folderFilterColumn'
						},
						list: {
							bindTo: 'folderFilterColumnList'
						},
						placeholder: resources.localizableStrings.FolderFilterEmptyFolderEditPlaceHolder
					},
					{
						className: 'Terrasoft.Button',
						imageConfig: resources.localizableImages.ApplyButtonImage,
						style: Terrasoft.controls.ButtonEnums.style.BLUE,
						classes: {
							wrapperClass: ['filter-element-with-right-space']
						},
						click: {
							bindTo: 'applyFolderFilter'
						}
					},
					{
						className: 'Terrasoft.Button',
						imageConfig: resources.localizableImages.CancelButtonImage,
						click: {
							bindTo: 'destroySimpleFilterAddingContainer'
						}
					}
				],
				destroy: {
					bindTo: 'clearSimpleFilterProperties'
				}
			};
			return viewConfig;
		}

		return {
			generate: generate,
			generateAddSimpleFolderFilterConfig: generateAddSimpleFolderFilterConfig
		};

	});