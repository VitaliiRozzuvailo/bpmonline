define('AddTagView', ['ext-base', 'terrasoft', 'AddTagViewResources'],
	function(Ext, Terrasoft, resources) {

		function generateAddTagConfig() {
			var config = 'Terrasoft.TextEdit';
			var viewConfig = {
				id: 'simpleTagFilterEditContainer',
				selectors: {
					el: "#simpleTagFilterEditContainer",
					wrapEl: "#simpleTagFilterEditContainer"
				},
				classes: {
					wrapClassName: 'tag-inner-container'
				},
				items: [
					getTagValueEditConfig(config),
					{
						className: 'Terrasoft.Button',
						imageConfig: resources.localizableImages.ApplyButtonImage,
						style: Terrasoft.controls.ButtonEnums.style.BLUE,
						classes: {
							wrapperClass: ['tag-element-with-right-space']
						},
						click: {
							bindTo: 'applyTag'
						}
					},
					{
						className: 'Terrasoft.Button',
						imageConfig: resources.localizableImages.CancelButtonImage,
						click: {
							bindTo: 'destroyTagAddingContainer'
						}
					}
				],
				destroy: {
					bindTo: 'clearTagProperties'
				}
			};
			return viewConfig;
		}

		function generate() {
			var viewConfig = {
				id: 'tagContainer',
				selectors: {
					el: "#tagContainer",
					wrapEl: "#tagContainer"
				},
				tpl: [
					'<span id="{id}" style="{wrapStyles}" class="{wrapClassName}">',
					'{%this.renderItems(out, values)%}',
					'</span>'
				],
				items: [
					{
						className: 'Terrasoft.Container',
						id: 'tagFilterButtonContainer',
						selectors: {
							el: "#tagFilterButtonContainer",
							wrapEl: "#tagFilterButtonContainer"
						},
						classes: {
							wrapClassName: 'tag-inner-container'
						},
						items: [
							{
								className: 'Terrasoft.Button',
								imageConfig: resources.localizableImages.ImageFilter,
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								classes: {
									wrapperClass: 'image-container'
								}
							}
						]
					}, {
						className: "Terrasoft.Container",
						id: "tagCommonContainer",
						selectors: {
							el: "#tagCommonContainer",
							wrapEl: "#tagCommonContainer"
						},
						items: []
					}, {
						className: 'Terrasoft.Container',
						id: 'addTagButtonContainer',
						selectors: {
							el: "#addTagButtonContainer",
							wrapEl: "#addTagButtonContainer"
						},
						classes: {
							wrapClassName: 'tag-inner-container'
						},
						items: [
							{
								className: 'Terrasoft.Button',
								caption: {
									bindTo: 'getAddButtonCaption'
								},
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								click: {
									bindTo: 'addTag'
								},
								visible: {
									bindTo: 'editVisible'
								}
							}
						]
					}
				]
			};
			return viewConfig;
		}

		function getTagValueEditConfig(config) {
			var controlConfig = {
				classes: {
					wrapClass: 'tag-simple-tag-edit'
				},
				value: {
					bindTo: 'tagValueColumn'
				},
				enterkeypressed: {
					bindTo: 'applyTag'
				},
				placeholder: resources.localizableStrings.TagEmptyValueEditPlaceHolder
			};
			if (config.className) {
				Ext.apply(controlConfig, config);
			}
			else {
				controlConfig.className = config;
			}
			return controlConfig;
		}

		function generateTagViewConfig(tagName, action) {
			var viewConfig = {
				classes: {
					wrapClassName: ['tag-inner-container', 'tag-' + action]
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
							labelClass: ['tag-value-label', 'tag-element-with-right-space']
						},
						caption: {
							bindTo: 'displayValue'
						},
						click: {
							bindTo: 'editTag'
						},
						tag: tagName
					},
					{
						className: 'Terrasoft.Button',
						classes: {
							wrapperClass: 'tag-remove-button'
						},
						style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						imageConfig: resources.localizableImages.RemoveButtonImage,
						visible: {
							bindTo: 'readOnlyMode',
							bindConfig: {
								converter: function(x) {
									return !x;
								}
							}
						},
						click: {
							bindTo: 'removeTag'
						},
						tag: tagName
					}
				]
			};
			return viewConfig;
		}

		return {
			generate: generate,
			generateAddTagConfig: generateAddTagConfig,
			getTagValueEditConfig: getTagValueEditConfig,
			generateTagViewConfig: generateTagViewConfig
		};

	});