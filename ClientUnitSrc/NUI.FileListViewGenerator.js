define('FileListViewGenerator', ['ext-base', 'terrasoft', 'FileListViewGeneratorResources', 'FileHelper'],
	function(Ext, Terrasoft, resources, FileHelper) {

		function getItemView(item) {
			var id = item.get('Id');
			var link = item.getLink();
			var size = item.get('Size');
			var typeImage = item.get('typeImage');
			var itemViewConfig = {
				className: 'Terrasoft.Container',
				id: 'ItemFileListContainer' + id,
				selectors: {
					wrapEl: '#' + 'ItemFileListContainer' + id
				},
				classes: {
					wrapClassName: ['file-list-item-container']
				},
				items: [{
					id: 'ItemImage' + id,
					className: 'Terrasoft.HtmlControl',
					html: '<img id="' +
						'ItemImage' + id +
						'" class="file-list-type-icon" src="' +
						typeImage + '"/>',
					selectors: {
						wrapEl: '#' + 'ItemImage' + id
					}
				}, {
					id: 'ItemLink' + id,
					className: 'Terrasoft.HtmlControl',
					html: '<a id ="' + 'ItemLink' + id +
						'" href="' + link.url +
						'" target="' + link.target +
						'" class="file-list-title-link">' +
						link.title + '</a>',
					selectors: {
						wrapEl: '#' + 'ItemLink' + id
					}
				}, {
					className: 'Terrasoft.Label',
					classes: {
						labelClass: ['file-list-size-value-label']
					},
					caption: size
				}, {
					className: 'Terrasoft.Button',
					imageConfig: resources.localizableImages.DeleteIcon,
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					tag: id,
					/*visible: {
						bindTo: 'canRemove'
					}*/
					click: {
						bindTo: 'deleteClick'
					},
					classes: {
						wrapperClass: ['file-list-remove-button']
					}
				}]
			};
			return itemViewConfig;
		}

		function getViewConfig(itemId, itemsCollection) {
			var elements = [];
			itemsCollection.each(function(item) {
				elements.push(getItemView(item));
			});
			var viewConfig = {
				className: 'Terrasoft.Container',
				id: 'FileListContainer' + itemId,
				items: elements,//[getCommentsGridConfig(itemId)],
				selectors: {
					wrapEl: '#' + 'FileListContainer' + itemId
				},
				classes: {
					wrapClassName: ['file-list-main-container']
				}
			};
			return viewConfig;
		}
		return {
			generate: getViewConfig
		};
	});