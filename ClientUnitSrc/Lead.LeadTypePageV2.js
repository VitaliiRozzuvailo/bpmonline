define("LeadTypePageV2", ["LeadTypePageV2Resources", "css!LeadTypePageV2CSS"], function(resources) {
	return {
		entitySchemaName: "LeadType",
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "Name",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 3,
						"row": 5,
						"colSpan": 12,
						"rowSpan": 1,
						"layoutName": "Header"
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"name": "ImageContainer",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["image-edit-container"],
					"layout": {
						"column": 0,
						"row": 0,
						"rowSpan": 5,
						"colSpan": 4
					},
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "Description",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"layout": {
						"column": 3,
						"row": 6,
						"colSpan": 12,
						"rowSpan": 1,
						"layoutName": "Header"
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "ImageContainer",
				"propertyName": "items",
				"name": "Image",
				"values": {
					"getSrcMethod": "getSrcMethod",
					"onPhotoChange": "onImageChange",
					"beforeFileSelected": "beforeFileSelected",
					"readonly": false,
					"defaultImage": this.Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.DefaultPhoto),
					"generator": "ImageCustomGeneratorV2.generateCustomImageControl"
				}
			}
		]/**SCHEMA_DIFF*/,
		methods: {
			/**
			 * Возвращает web-адрес изображения.
			 * @private
			 * @return {String} Web-адрес Изображения.
			 */
			getSrcMethod: function() {
				var primaryImageColumnValue = this.get(this.primaryImageColumnName);
				if (primaryImageColumnValue) {
					return this.getSchemaImageUrl(primaryImageColumnValue);
				}
				return this.Terrasoft.ImageUrlBuilder.getUrl(this.get("Resources.Images.DefaultPhoto"));
			},

			/**
			 * Обрабатывает изменение изображения.
			 * @private
			 * @param {File} image Изображение.
			 */
			onImageChange: function(image) {
				if (!image) {
					this.set(this.primaryImageColumnName, null);
					return;
				}
				this.Terrasoft.ImageApi.upload({
					file: image,
					onComplete: this.onImageUploaded,
					onError: this.Terrasoft.emptyFn,
					scope: this
				});
			},

			/**
			 * Выполняет вывод изображения после его сохранения в базе данных.
			 * @private
			 * @param {String} imageId Идентификатор изображения.
			 */
			onImageUploaded: function(imageId) {
				var imageData = {
					value: imageId,
					displayValue: this.primaryImageColumnName
				};
				this.set("Image", imageData);
			}
		},
		rules: {}
	};
});
