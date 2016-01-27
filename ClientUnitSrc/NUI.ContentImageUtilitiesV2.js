define("ContentImageUtilitiesV2", ["terrasoft", "ContentImageUtilitiesV2Resources"],
	function(Terrasoft) {
		var contentImageUtilitiesV2Class = this.Ext.define("Terrasoft.configuration.mixins.ContantImageUtilitiesV2", {

			alternateClassName: "Terrasoft.ContentImageUtilities",

			/**
			 * Идентификатор изображения.
			 * @type {GUID}
			 */
			imageId: null,

			/**
			 * Возвращает web-адрес изображения по умолчанию.
			 * @private
			 * @return {String} Web-адрес изображения по умолчанию.
			 */
			getDefaultImageConfig: function() {
				return {
					source: this.Terrasoft.ImageSources.SOURCE_CODE_SCHEMA,
					params: {
						schemaName: "ContentImageUtilitiesV2",
						resourceItemName: "DefaultImage"
					}
				};
			},

			/**
			 * Возвращает config изображения.
			 * @private
			 * @return {String} config изображения.
			 */
			getImage: function() {
				if (this.imageId) {
					return this.getImageConfig(this.imageId);
				}
				return this.getDefaultImageConfig();
			},

			/**
			 * Добавляет изображение для контрола.
			 * @private
			 */
			addImage: function() {
				this.set("ImageConfig", this.getImage());
			},

			/**
			 * Обрабатывает изменение изображения.
			 * @private
			 * @param {File} photo изображения.
			 */
			onImageChange: function(photo) {
				if (!photo || !this.Ext.isArray(photo)) {
					this.set("ImageConfig", null);
					return;
				}
				this.Terrasoft.ImageApi.upload({
					file: photo[0],
					onComplete: this.onImageUploaded,
					onError: this.Terrasoft.emptyFn,
					scope: this
				});
			},

			/**
			 * Обрабочик события загрузки изображения.
			 * @virtual
			 */
			onImageUploaded: function(imageId) {
				this.imageId = imageId;
				this.addImage();
			},

			/**
			 * Получает url для изображения.
			 * @virtual
			 * @return {String} url запрашиваемого изображения.
			 */
			getImageConfig: function(imageId) {
				var imageConfig = {
					source: this.Terrasoft.ImageSources.SYS_IMAGE,
					params: {
						primaryColumnValue: imageId
					}
				};
				return imageConfig;
			}
		});

		return this.Ext.create(contentImageUtilitiesV2Class);
	});