define("KnowledgeBasePage", ["ext-base", "terrasoft", "sandbox", "KnowledgeBase", "KnowledgeBasePageStructure",
	"KnowledgeBasePageResources", "ConfigurationEnums", "KnowledgeBaseHtmlEditModule"],
	function(Ext, Terrasoft, sandbox, KnowledgeBase, structure, resources, ConfigurationEnums) {

		structure.userCode = function() {
			var action = sandbox.publish("GetHistoryState").hash.operationType;
			if (action !== ConfigurationEnums.CardState.View) {
				var notesCustomConfig = this.find("Notes").customConfig;
				notesCustomConfig.className = "Terrasoft.KnowledgeBaseHtmlEdit";
				notesCustomConfig.knowledgeBaseLinkButtonClick = {
					bindTo: "knowledgeBaseLinkButtonClick"
				};
			}

			this.methods.insertKnowledgeBaseLinkIntoHtmlEditor = function(editorConfig, selectedKnowledgeBase) {
				if (Ext.isEmpty(editorConfig) || Ext.isEmpty(selectedKnowledgeBase)) {
					return;
				}
				var editor = editorConfig.editor;
				var editorSelection = editorConfig.editorSelection;
				var editorSelectedText = editorConfig.editorSelectedText;
				var knowledgeBaseId = selectedKnowledgeBase.value;
				var knowledgeBaseTitle = selectedKnowledgeBase.displayValue;
				var link = "ViewModule.aspx#CardModule/KnowledgeBasePage/view/" +  knowledgeBaseId;
				var linkText = Ext.isEmpty(editorSelectedText) ? knowledgeBaseTitle : editorSelectedText;
				var attributes = {
					href: link,
					title: link,
					target: ""
				};
				attributes["data-cke-saved-href"] = linkText ? linkText : link;
				var element = editorSelection.getStartElement();
				if (element.$.tagName === "A") {
					element.setAttributes(attributes);
				} else {
					var ranges = editorSelection.getRanges(true);
					if (ranges.length === 1) {
						var url = Ext.String.format('<a target="" href="{0}" title="{1}">{2}</a>', link,
							link, linkText);
						var text = CKEDITOR.dom.element.createFromHtml(url);
						var range = ranges[0];
						if (!range.collapsed) {
							range.deleteContents();
						}
						range.insertNode(text);
						range.selectNodeContents(text);
						editorSelection.selectRanges(ranges);
					}
				}
				editor.updateElement();
				editor.focus();
			};

			this.methods.knowledgeBaseLinkButtonClick = function(args) {
				var editorTextConfig = args.editorTextConfig;
				var config = {
					entitySchemaName: "KnowledgeBase",
					multiSelect: false,
					columnName: "Notes"
				};
				var handler = function(args) {
					this.defineKnowledgeBaseCss(true);
					var collection = args.selectedRows.collection;
					if (collection.length) {
						this.insertKnowledgeBaseLinkIntoHtmlEditor(editorTextConfig, collection.items[0]);
					}
				};
				this.scrollTo = document.body.scrollTop;
				this.openLookup(config, handler);
			};
		};
		return structure;
	});
