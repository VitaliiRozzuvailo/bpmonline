Ext.define("FileAndLinksPreviewPage.Controller", {
	extend: "Terrasoft.controller.BasePreviewPage",

	fileModel: null,

	/**
	 * @protected
	 * @virtual
	 */
	initializeView: function(view) {
		this.callParent(arguments);
		var panel = view.getPanel();
		panel.on({
			scope: this,
			embeddeddetailitemapplied: this.onFileAndLinksEmbeddedDetailItemApplied
		});
	},

	/**
	 * @protected
	 * @virtual
	 */
	onFileAndLinksEmbeddedDetailItemApplied: function(record, detailItem) {
		if (record.modelName !== this.fileModel) {
			return;
		}
		var typeId = record.get("Type").getId();
		var isKnowledgeBaseLink = (typeId === Terrasoft.Configuration.FileTypeGUID.KnowledgeBaseLink);
		var isFile = ((typeId === Terrasoft.Configuration.FileTypeGUID.File) || isKnowledgeBaseLink);
		var showColumn = isFile ? "Data" : "Name";
		var hideColumn = isFile ? "Name" : "Data";
		detailItem.getItems().each(function(item) {
			var columnName = item.getName();
			if (showColumn === columnName) {
				if (isKnowledgeBaseLink) {
					item.setLabel(LocalizableStrings["PreviewPageKnowledgeBaseLinkCaption"]);
				}
				item.show();
			} else if (hideColumn === columnName) {
				item.hide();
			}
		});
	},

	/**
	 * @protected
	 * @virtual
	 */
	onFilePreview: function(field) {
		var record = field.getRecord();
		var typeId = record.get("Type").getId();
		if (typeId === Terrasoft.Configuration.FileTypeGUID.KnowledgeBaseLink) {
			if (Terrasoft.ApplicationUtils.isOnlineMode()) {
				var message = LocalizableStrings["OnlineUnsupportedFunctionalityMessage"];
				Terrasoft.MessageBox.showMessage(message);
				return;
			}
			Terrasoft.Configuration.openFileByEntityLink({
				fileUrl: record.get("Data"),
				modelName: "KnowledgeBase",
				fileDetailModelName: "KnowledgeBaseFile",
				failure: function(config) {
					if (config && config.fileNotFound) {
						Terrasoft.MessageBox.showMessage(LocalizableStrings["FileByEntityLinkNotFound"]);
					}
				},
				scope: this
			});
			return;
		}
		this.callParent(arguments);
	}

});