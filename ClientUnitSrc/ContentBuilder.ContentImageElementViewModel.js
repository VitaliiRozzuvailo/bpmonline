define("ContentImageElementViewModel", ["ContentImageElementViewModelResources", "ContentElementBaseViewModel"],
	function(resources) {

	Ext.define("Terrasoft.ContentBuilder.ContentImageElementViewModel", {
		extend: "Terrasoft.ContentElementBaseViewModel",
		alternateClassName: "Terrasoft.ContentImageElementViewModel",

		/**
		 * Имя класса элемента отображения.
		 * @protected
		 * @type {String}
		 */
		className: "Terrasoft.ContentImageElement",

		/**
		 * @inheritdoc Terrasoft.BaseViewModel#constructor
		 * @overridden
		 */
		constructor: function() {
			this.callParent(arguments);
			this.initResourcesValues(resources);
		},

		/**
		 * Показывает диалоговое окно для добавления ссылки к изображению.
		 */
		setLink: function() {
			var controls = {
				link: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					value: this.get("Link"),
					customConfig: {
						markerValue: "image-edit"
					}
				}
			};
			Terrasoft.utils.inputBox(
				this.get("Resources.Strings.SetLinkInputBoxCaption"),
				this.linkInputBoxHandler,
				["ok", "cancel"],
				this,
				controls
			);
		},

		/**
		 * Обрабатывает результат ввода ссылки пользователем.
		 * @param {String} returnCode Код кнопки, которая была нажата в диалоговом окне.
		 * @param {Object} controlData Содержит данные, введенные пользователем.
		 */
		linkInputBoxHandler: function(returnCode, controlData) {
			if (returnCode === "ok") {
				this.set("Link", controlData.link.value);
			}
		},

		/**
		 * Обрабатывает изменение изображения.
		 * @param {File} photo Изображение.
		 */
		onImageChange: function(photo) {
			if (!photo || !Ext.isArray(photo)) {
				this.set("ImageConfig", null);
				return;
			}
			FileAPI.readAsDataURL(photo[0], function(e) {
				this.onImageUploaded(e.result);
			}.bind(this));
		},

		/**
		 * Обрабочик события загрузки изображения.
		 * @protected
		 */
		onImageUploaded: function(imageSrc) {
			this.set("ImageConfig", {
				source: Terrasoft.ImageSources.URL,
				url: imageSrc
			});
		},

		/**
		 * @inheritdoc Terrasoft.ContentElementBaseViewModel#getViewConfig
		 * @overridden
		 */
		getViewConfig: function() {
			var className = this.get("ClassName");
			return {
				"className": className,
				"selected": {bindTo: "Selected"},
				"imageConfig": {bindTo: "ImageConfig"},
				"placeholder": {bindTo: "Resources.Strings.Placeholder"},
				"tools": this.getToolsViewConfig()
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
				fileTypeFilter: ["image/*"],
				filesSelected: {bindTo: "onImageChange"},
				classes: {
					imageClass: ["tools-image"]
				},
				imageConfig: {bindTo: "Resources.Images.UploadIcon"}
			}, {
				className: "Terrasoft.Button",
				markerValue: "set-link-button",
				click: {bindTo: "setLink"},
				classes: {
					imageClass: ["tools-image"]
				},
				imageConfig: {bindTo: "Resources.Images.LinkIcon"}
			}];
		}

	});

});
