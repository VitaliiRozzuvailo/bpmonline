define('KnowledgeBaseHtmlEditModule', ['ext-base', 'terrasoft', 'KnowledgeBaseHtmlEditModuleResources',
	'HtmlEditModule'],
	function(Ext, Terrasoft, resources) {
		Ext.ns('Terrasoft.controls.HtmlEdit');

		Ext.define('Terrasoft.controls.KnowledgeBaseHtmlEdit', {
			extend: 'Terrasoft.HtmlEdit',
			alternateClassName: 'Terrasoft.KnowledgeBaseHtmlEdit',
			tpl: [
				'<div id="{id}-html-edit" class="{htmlEditClass}" style="{htmlEditStyle}">',
				'<div style="display: table-row;">',
				'<div id="{id}-html-edit-toolbar" class="{htmlEditToolbarClass}">',
				'<div id="html-edit-toolbar-font-family" class="{htmlEditToolbarButtonGroupClass}"' +
					' style="{htmlEditFontFamilyStyle}">',
				'<tpl for="items">',
				'<tpl if="tag == \'fontFamily\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-font-size" class="{htmlEditToolbarButtonGroupClass}"' +
					' style="{htmlEditFontSizeStyle}">',
				'<tpl for="items">',
				'<tpl if="tag == \'fontSize\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-font-style" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'fontStyleBold\' || tag == \'fontStyleItalic\' || tag == \'fontStyleUnderline\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-font-color" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'fontColor\'">',
				'	<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-highlight" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'hightlightColor\'">',
				'	<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-list" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'numberedList\' || tag == \'bulletedList\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-justify" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'justifyLeft\' || tag == \'justifyCenter\' || tag == \'justifyRight\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-image" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'image\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'<div id="html-edit-toolbar-link" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'link\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',

				'<div id="html-edit-toolbar-link" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'knowledgeBaseLink\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',

				'<div id="html-edit-toolbar-justify" class="{htmlEditToolbarButtonGroupClass}">',
				'<tpl for="items">',
				'<tpl if="tag == \'htmlMode\' || tag == \'plainMode\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'</div>',
				'</div>',
				'<div style="display: table-row;">',
				'<div id="{id}-html-edit-htmltext" class="{htmlEditTextareaClass}">',
				'<textarea id="{id}-html-edit-textarea"></textarea>',
				'</div>',
				'<div id="{id}-html-edit-plaintext" class="{htmlEditTextareaClass}" style="border: none; margin-bottom: 24px;">',
				'<tpl for="items">',
				'<tpl if="tag == \'plainText\'">',
				'<@item>',
				'</tpl>',
				'</tpl>',
				'</div>',
				'</div>',
				'<span id="{id}-validation" class="{validationClass}" style="{validationStyle}">' +
					'{validationText}</span>',
				'</div>'
			],

			constructor: function(){
				var addKnowledgeBaseButton = true;
				Terrasoft.each(this.itemsConfig, function(itemConfig) {
					if (itemConfig.tag === 'knowledgeBaseLink') {
						addKnowledgeBaseButton = false;
					}
				});

				if (addKnowledgeBaseButton) {
					this.itemsConfig.push({
						className: 'Terrasoft.Button',
						iconAlign: Terrasoft.controls.ButtonEnums.iconAlign.TOP,
						imageConfig: {
							source: Terrasoft.ImageSources.URL,
							url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDFEOTc4NTc5MDlDMTFFMkI3MDJCNDA4RTBFN0M3MkIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDFEOTc4NTg5MDlDMTFFMkI3MDJCNDA4RTBFN0M3MkIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEMUQ5Nzg1NTkwOUMxMUUyQjcwMkI0MDhFMEU3QzcyQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEMUQ5Nzg1NjkwOUMxMUUyQjcwMkI0MDhFMEU3QzcyQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Po4DONkAAAFaSURBVHjahFO9boMwEL4ixIZUiQW2dICJId2YUCrxArxB+gTpq3RmaPIEoTNLxcREM8ACS5iYQB1YYKoP2chYTvJJJ7B9P9+dPz9FUQQC9sQOxLbC/g+xE7Ejv6lw/xjwS+xLEozY0TP02bBNlQs+h2G40TQNhmFYRWZZBl3XiYVeiV0ZgzMuyrKEvu/BsqzF6rqeg3Vd53M+05i5hQ9KaVdVFSRJAtM0LZ6e54HjOEDYiUmQyV6hA1uBowvYku/789e2bdH1oPADYWjbdrVGRsgsz3PRdatKpg1FUYDrujCOIzRNMyfErwzSBKwi9oxzuQf11gFWZa3gIA3DEK9zEdIFHgDbwSsNgkA8ijHB56MEjAm2hLfB4Vuh2r7LAsXEFMlpBN/GkSnxndjfrQSmac7DxNuhQN+Qf0wXqm0pE5R4mqZ85RdWkH+NV5oE2cQSZcb07I1n+y/AAMBAh+gKYFCSAAAAAElFTkSuQmCC"
						},
						handler: function() {
							var container = this.ownerCt;
							if (container) {
								container.onKnowledgeBaseButtonClick(container);
							}
						},
						tag: 'knowledgeBaseLink'
					});
				}
				this.callParent(arguments);
			},

			onKnowledgeBaseButtonClick: function(container) {
				var editor = this.editor;
				var editorSelection = editor.getSelection();
				var editorSelectedText = editorSelection.getSelectedText();
				var args = {
					editorTextConfig: {
						editor: editor,
						editorSelection: editorSelection,
						editorSelectedText: editorSelectedText
					}
				};
				this.fireEvent('knowledgeBaseLinkButtonClick', this, args);
			},

			initCKEDITOR: function() {
				this.callParent(arguments);
				this.editor.on('dataReady', function(args) {
					this.fireEvent('afterDataReady', args);
				}, this);
			},

			init: function() {
				this.callParent(arguments);
				this.addEvents(
					'knowledgeBaseLinkButtonClick',
					'afterDataReady'
				);
			}
		});
	});