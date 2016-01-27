define("ContentBlockPage", ["ContentBlockPageResources", "ContentBuilderItemGenerator", "ContentBuilderHelper",
	"css!ContentBlockCSS"],
function(resources) {
	return {
		entitySchemaName: "ContentBlock",
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "Name",
				"values": {
					"layout": {
						"column": 4,
						"row": 0,
						"colSpan": 20,
						"rowSpan": 1
					}
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "Description",
				"values": {
					"layout": {
						"column": 4,
						"row": 1,
						"colSpan": 20,
						"rowSpan": 1
					},
					"contentType": this.Terrasoft.ContentType.LONG_TEXT
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 1
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
				},
				"index": 2
			},
			{
				"operation": "insert",
				"parentName": "ImageContainer",
				"propertyName": "items",
				"name": "Image",
				"values": {
					"getSrcMethod": "getBlockImage",
					"onPhotoChange": "onImageChange",
					"beforeFileSelected": "beforeFileSelected",
					"readonly": false,
					"defaultImage": this.Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.DefaultPhoto),
					"generator": "ImageCustomGeneratorV2.generateCustomImageControl"
				}
			},
			{
				"operation": "insert",
				"name": "GeneralInfoTab",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.GeneralInfoTabCaption"
					},
					"items": []
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "ContentBlock",
				"values": {
					"generator": "ContentBuilderItemGenerator.generateContentBlock",
					"items": "Items",
					"dragActionsCode": 0

				},
				"parentName": "GeneralInfoTab",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "remove",
				"name": "ESNTab"
			},
			{
				"operation": "remove",
				"name": "ESNFeedContainer"
			},
			{
				"operation": "remove",
				"name": "ESNFeed"
			}
		]/**SCHEMA_DIFF*/,
		attributes: {
			/**
			 * Коллекция элементов блока.
			 */
			"Items": {
				"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				"dataValueType": this.Terrasoft.DataValueType.COLLECTION
			}
		},
		methods: {
			/**
			 * @inheritdoc Terrasoft.BasePageV2#init
			 * @overridden
			 */
			init: function() {
				var collection = this.Ext.create("Terrasoft.BaseViewModelCollection");
				collection.on("itemChanged", this.onItemFocused, this);
				this.set("Items", collection);
				this.callParent(arguments);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#onCloseClick
			 * @overridden
			 */
			onCloseClick: function() {
				this.sandbox.publish("BackHistoryState");
			},

			/**
			 * @inheritdoc Terrasoft.BaseViewModel#initEntity
			 * @overridden
			 */
			initEntity: function() {
				if (this.isAddMode()) {
					this.addHtmlElementToBlock();
				}
				this.callParent(arguments);
			},

			/**
			 * Создает наполнение для блока контента, состоящее из html контрола.
			 * @protected
			 */
			addHtmlElementToBlock: function() {
				var element = {
					ItemType: "block",
					Items: [{
						ItemType: "html",
						Column: 0,
						Row: 0,
						ColSpan: 24,
						RowSpan: 0
					}]
				};
				this.initBlock(element);
			},
			
			/**
			 * @inheritdoc Terrasoft.BaseViewModel#loadEntity
			 * @overridden
			 */
			loadEntity: function(primaryColumnValue, callback, scope) {
				this.callParent([primaryColumnValue, function() {
					var config = this.get("Config");
					this.initBlock(this.Terrasoft.decode(config));
					callback.call(scope || this, this);
				}, this]);
			},

			/**
			 * Выполняет инициализацию блока заданной конфигурацией.
			 * @param {Object} config Конфигурация для блока.
			 */
			initBlock: function(config) {
				var contentBuilderHelper = this.Ext.create("Terrasoft.ContentBuilderHelper");
				var blockConfig = contentBuilderHelper.toViewModel(config);
				this.Terrasoft.each(blockConfig.values, function(value, key) {
					if (this.Terrasoft.instanceOfClass(value, "Terrasoft.Collection")) {
						var collection = this.get(key);
						if (collection) {
							collection.clear();
							collection.loadAll(value);
						} else {
							this.set(key, value);
						}
					} else if (key !== "Id") {
						this.set(key, value);
					}
				}, this);
			},

			/**
			 * @inheritDoc Terrasoft.BaseViewModel#setCopyColumnValues
			 * @overridden
			 */
			setCopyColumnValues: function() {
				this.callParent(arguments);
				var config = this.get("Config");
				var blockConfig = this.Terrasoft.decode(config);
				this.initBlock(blockConfig);
			},

			/**
			 * @inheritDoc Terrasoft.BaseViewModel#saveEntity
			 * @overridden
			 */
			saveEntity: function() {
				var contentBuilderHelper = this.Ext.create("Terrasoft.ContentBuilderHelper");
				var config = contentBuilderHelper.toJSON(this);
				this.set("Config", this.Terrasoft.encode(config));
				this.callParent(arguments);
			},

			/**
			 * Возвращает web-адрес изображения блока.
			 * @private
			 * @return {String} Web-адрес Изображение блока.
			 */
			getBlockImage: function() {
				var primaryImageColumnValue = this.get(this.primaryImageColumnName);
				if (primaryImageColumnValue) {
					return this.getSchemaImageUrl(primaryImageColumnValue);
				}
				return this.Terrasoft.ImageUrlBuilder.getUrl(this.get("Resources.Images.DefaultPhoto"));
			},

			/**
			 * Обрабатывает изменение изображения блока.
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
		}
	};
});
