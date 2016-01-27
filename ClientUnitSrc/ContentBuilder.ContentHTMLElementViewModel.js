define("ContentHTMLElementViewModel", ["ContentHTMLElementViewModelResources", "ContentElementBaseViewModel"],
function(resources) {

	/**
	 * @class Terrasoft.ContentBuilder.ContentHTMLElementViewModel
	 * Класс модели представления блока контента.
	 */
	Ext.define("Terrasoft.ContentBuilder.ContentHTMLElementViewModel", {
	extend: "Terrasoft.ContentElementBaseViewModel",
	alternateClassName: "Terrasoft.ContentHTMLElementViewModel",

	/**
	 * Имя класса элемента отображения.
	 * @protected
	 * @type {String}
	 */
	className: "Terrasoft.ContentHTMLElement",

	/**
	 * @inheritdoc Terrasoft.BaseViewModel#constructor
	 * @overridden
	 */
	constructor: function() {
		this.callParent(arguments);
		this.initResourcesValues(resources);
	},

	onFileSelected: function(photo) {
		if (!photo || !Ext.isArray(photo)) {
			this.set("ImageConfig", null);
			return;
		}
		FileAPI.readAsText(photo[0], null, function(e) {
			if (e.type === "load") {
				var bodyHtml = e.result;
				var bodyRegex = /<body.*?>([\s\S]*)<\/body>/;
				if (bodyRegex.test(e.result)) {
					bodyHtml = bodyRegex.exec(bodyHtml)[1];
				}
				this.set("Content", bodyHtml);
			}
		}.bind(this));
	},

	clearData: function() {
		this.set("Content", null);
	},

	editData: function() {
		var content = this.get("Content");
		var controls = {
			content: {
				customConfig: {
					className: "Terrasoft.MemoEdit",
					height: "200px",
					markerValue: "html-edit"
				},
				dataValueType: Terrasoft.DataValueType.TEXT,
				value: content
			}
		};
		Terrasoft.utils.inputBox(
			this.get("Resources.Strings.EditDataInputBoxCaption"),
			this.contentInputBoxHandler,
			["ok", "cancel"],
			this,
			controls
		);
	},

	contentInputBoxHandler: function(returnCode, controlData) {
		if (returnCode === "ok") {
			this.set("Content", controlData.content.value);
		}
	},

	/**
	 * @inheritdoc Terrasoft.ContentElementBaseViewModel#getViewConfig
	 * @overridden
	 */
	getViewConfig: function() {
		return {
			"className": this.className,
			"content": {bindTo: "Content"},
			"selected": {bindTo: "Selected"},
			"tools": this.getToolsViewConfig(),
			"placeholder": {bindTo: "Resources.Strings.Placeholder"}
		};
	},

	/**
	 * @inheritdoc Terrasoft.ContentElementBaseViewModel#getToolsViewConfig
	 * @overridden
	 */
	getToolsViewConfig: function() {
		return [{
			className: "Terrasoft.Button",
			style: Terrasoft.controls.ButtonEnums.style.GREEN,
			markerValue: "file-upload-button",
			fileUpload: true,
			fileTypeFilter: Ext.isGecko ? [".html", ".htm"] : ["text/html"],
			filesSelected: {bindTo: "onFileSelected"},
			imageConfig: {bindTo: "Resources.Images.UploadIcon"}
		}, {
			className: "Terrasoft.Button",
			markerValue: "edit-button",
			click: {bindTo: "editData"},
			imageConfig: {bindTo: "Resources.Images.EditIcon"}
		}, {
			className: "Terrasoft.Button",
			markerValue: "clear-button",
			click: {bindTo: "clearData"},
			imageConfig: {bindTo: "Resources.Images.ClearIcon"}
		}];
	}

});

});
