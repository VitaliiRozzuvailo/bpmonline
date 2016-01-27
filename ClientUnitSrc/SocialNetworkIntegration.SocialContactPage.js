define("SocialContactPage", ["ViewUtilities", "ConfigurationFileApi"], function(ViewUtilities) {
	return {
		entitySchemaName: "Contact",
		attributes: {
			/*
			 * Коллекция фотографий контакта из карточки контакта и соц. сетей.
			 */
			ContactImages: {
				dataValueType: Terrasoft.DataValueType.COLLECTION
			},

			Name: {
				/*
				 * Признак указывающий на обязательность элемента.
				 */
				isRequired: false
			}
		},
		details: /**SCHEMA_DETAILS*/{
			ContactSocialCommunication: {
				schemaName: "ContactSocialCommunicationDetail",
				filter: {
					masterColumn: "Id",
					detailColumn: "Contact"
				}
			},
			ContactSocialAddress: {
				schemaName: "ContactSocialAddressDetail",
				filter: {
					masterColumn: "Id",
					detailColumn: "Contact"
				}
			},
			ContactSocialAnniversary: {
				schemaName: "ContactSocialAnniversaryDetail",
				filter: {
					masterColumn: "Id",
					detailColumn: "Contact"
				}
			}
		}/**SCHEMA_DETAILS*/,
		methods: {

			/**
			 * @inheritdoc Terrasoft.BasePageV2#onEntityInitialized
			 * @overridden
			 */
			onEntityInitialized: function() {
				this.callParent(arguments);
				this.addCurrentContactImage();
			},

			/**
			 * Добавляет текущую фотографию контакта в коллекцию фотографий контакта.
			 * @private
			 */
			addCurrentContactImage: function() {
				var primaryImageColumnValue = this.get(this.primaryImageColumnName);
				var contactImageConfig = {
					index: 0,
					defaultImage: true,
					markerValue: "DefaultContactPhoto",
					image: {
						value: primaryImageColumnValue.value,
						url: this.getContactImageUrl(primaryImageColumnValue),
						source: this.Terrasoft.ImageSources.URL
					}
				};
				this.addContactImage(contactImageConfig);
			},

			/**
			 * Возвращает web-адрес фотографии контакта.
			 * @param {String} primaryImageColumnValue Значение колонки Изображение объекта.
			 * @private
			 * @return {String} Web-адрес фотографии контакта.
			 */
			getContactImageUrl: function(primaryImageColumnValue) {
				if (primaryImageColumnValue) {
					return this.getSchemaImageUrl(primaryImageColumnValue);
				}
				return this.getContactDefaultImageUrl();
			},

			/**
			 * Возвращает web-адрес фотографии контакта по умолчанию.
			 * @private
			 * @return {String} Web-адрес фотографии контакта по умолчанию.
			 */
			getContactDefaultImageUrl: function() {
				return this.Terrasoft.ImageUrlBuilder.getUrl(this.get("Resources.Images.DefaultPhoto"));
			},

			/**
			 * Добавляет фото в коллекцию фотографий контакта.
			 * @protected
			 * @param {Object} config Конфигурациия добавляеммой фотографии.
			 * @param {String} config.id Идентификатор добавляеммой фотографии в коллекции.
			 * @param {Object} config.image.source Тип источника фотографии.
			 * @param {Object} config.image.url Адрес источника фотографии.
			 * @param {Object} config.logo.source Тип источника логотипа фотографии.
			 * @param {Object} config.logo.url Адрес источника логотипа фотографии.
			 * @param {Number} config.index Позиция в коллекции.
			 * @param {String} config.defaultImage Признак использования фотографии по умолчанию.
			 * @param {Number} config.markerValue Значение маркерного DOM-атрибута data-item-marker.
			 */
			addContactImage: function(config) {
				var defaultImage = config.defaultImage;
				var image = config.image;
				var id = config.id || this.Terrasoft.generateGUID();
				var vm = this.Ext.create("Terrasoft.BaseViewModel");
				vm.sandbox = this.sandbox;
				vm.set("Id", id);
				vm.set("IsDefaultImage", (defaultImage === true));
				vm.set("IsEmptyImage", this.Ext.isEmpty(image));
				vm.set("Image", image);
				vm.set("Logo", config.logo);
				vm.set("MarkerValue", config.markerValue);
				vm.on("change:ImageChecked", this.onItemImageChecked, this);
				vm.getEnabled = function() {
					return !this.get("IsEmptyImage") || this.get("IsDefaultImage");
				};
				vm.onSelectImage = function() {
					this.set("ImageChecked", true);
				};
				vm.onUnselectImage = function() {
					this.set("ImageChecked", false);
				};
				if (defaultImage) {
					vm.set("ImageChecked", "SelectedImage");
				}
				var index = config.index;
				var photos = this.get("ContactImages");
				if (index) {
					photos.add(id, vm, index);
				} else {
					photos.add(id, vm);
				}
				photos.loadAll();
			},

			/**
			 * Обработчик изменения выбранного элемента в колекции фотографий контакта.
			 * @private
			 * @param {Object} model Модель выбранного элемента.
			 * @param {String} checkedValue Значение выбранного элемента.
			 */
			onItemImageChecked: function(model, checkedValue) {
				if (checkedValue !== "SelectedImage") {
					return;
				}
				var contactImages = this.get("ContactImages");
				var selectItemId = model.get("Id");
				contactImages.each(function(item) {
					var id = item.get("Id");
					if (id !== selectItemId) {
						item.onUnselectImage();
					}
				});
				var image = model.get("IsEmptyImage") ? null : model.get("Image");
				if (image || model.get("IsDefaultImage")) {
					this.changeContactImage(image);
				}
			},

			/*
			 * Загружает и устанавливает фотографию контакта.
			 * @private
			 * @param {Object} image Конфигурация добавленной фотографии.
			 * @param {Object} image.value Идентификатор уже загруженной фотографии.
			 * @param {Object} image.url Адрес источника фотографии.
			 */
			changeContactImage: function(image) {
				if (Ext.isEmpty(image) || image.hasOwnProperty("value")) {
					this.setContactImage(image ? image.value : null);
				} else {
					var uploadComplete = function(imageId) {
						image.value = imageId;
						this.setContactImage(imageId);
					};
					this.Terrasoft.ConfigurationFileApi.getImageFile(image.url, function(file) {
						this.Terrasoft.ImageApi.upload({
							file: file,
							onComplete: uploadComplete,
							onError: this.Terrasoft.emptyFn,
							scope: this
						});
					}, this);
				}
			},

			/*
			 * Устанавливает фотографию контакта.
			 * @private
			 * @param {String} imageId Идентификатор фотографии.
			 */
			setContactImage: function(imageId) {
				var imageData = null;
				if (imageId) {
					imageData = {
						value: imageId,
						displayValue: "Photo"
					};
				}
				this.set(this.primaryImageColumnName, imageData);
			},

			/**
			 * Возвращает конфигурацию для генерации DOM элемента отображающего фото из списка фотографий контакта.
			 * @private
			 */
			createPreviewImageButtonConfig: function() {
				return {
					className: "Terrasoft.Button",
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					tag: "previewImage",
					imageConfig: {bindTo: "Image"},
					classes: {
						wrapperClass: ["image-preview"]
					}
				};
			},

			/**
			 * Возвращает конфигурацию для генерации DOM элемента отображающего логотипа соц. сети возле фото.
			 * @private
			 */
			createLogoButtonConfig: function() {
				return {
					className: "Terrasoft.Button",
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					tag: "logoUrl",
					imageConfig: {bindTo: "Logo"},
					classes: {
						wrapperClass: ["logo-image"]
					}
				};
			},

			/**
			 * Возвращает конфигурацию для генерации DOM элемента выбора фото из списка фотографий контакта.
			 * @private
			 */
			createRadioButtonConfig: function() {
				return {
					className: "Terrasoft.RadioButton",
					markerValue: {bindTo: "MarkerValue"},
					tag: "SelectedImage",
					enabled: {bindTo: "getEnabled"},
					checked: {bindTo: "ImageChecked"}
				};
			},

			/**
			 * Возвращает модифицированную конфигурацию элемента DOM элементов для списка фотографий контакта.
			 * @protected
			 * @param {Object} containerListItemConfig Конфигурация элемента.
			 * @param {Terrasoft.BaseViewModel} item Элемент коллекции.
			 */
			getItemImageListViewConfig: function(containerListItemConfig, item) {
				var itemContainer =
					ViewUtilities.getContainerConfig("images-list-item-container", ["images-list-item-container"]);
				var containerItems = itemContainer.items;
				var previewImageButton = this.createPreviewImageButtonConfig(item);
				containerItems.push(previewImageButton);
				if (item.get("Logo")) {
					var logoButton = this.createLogoButtonConfig(item);
					containerItems.push(logoButton);
				}
				var radioButton = this.createRadioButtonConfig(item);
				containerItems.push(radioButton);
				containerListItemConfig.config = itemContainer;
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"name": "Name",
				"values": {
					"caption": {"bindTo": "CaptionName"},
					"enabled": false,
					"layout": {"column": 0, "row": 0, "colSpan": 12}
				}
			},
			{
				"operation": "insert",
				"parentName": "CardContentContainer",
				"propertyName": "items",
				"name": "ImageListContainer",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"wrapClass": ["header-container-margin-bottom", "width-auto"],
					"items": []
				}
			},
			{
				"operation": "insert",
				"name": "ContactImageList",
				"parentName": "ImageListContainer",
				"propertyName": "items",
				"values": {
					"generateId": true,
					"generator": "ConfigurationItemGenerator.generateContainerList",
					"idProperty": "Id",
					"collection": "ContactImages",
					"onGetItemConfig": "getItemImageListViewConfig",
					"dataItemIdPrefix": "image-item",
					"classes": {
						wrapClassName: ["contact-image-list"]
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "CardContentContainer",
				"propertyName": "items",
				"name": "ContactSocialCommunication",
				"values": {
					"itemType": Terrasoft.ViewItemType.DETAIL,
					"classes": {
						wrapClassName: ["social-communication-detail-container"]
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "CardContentContainer",
				"propertyName": "items",
				"name": "ContactSocialAddress",
				"values": {
					"itemType": Terrasoft.ViewItemType.DETAIL,
					"classes": {
						wrapClassName: ["social-address-detail-container"]
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "CardContentContainer",
				"propertyName": "items",
				"name": "ContactSocialAnniversary",
				"values": {
					"itemType": Terrasoft.ViewItemType.DETAIL,
					"classes": {
						wrapClassName: ["social-Anniversary-detail-container"]
					}
				}
			},
			{
				"operation": "insert",
				"name": "NotesControlGroup",
				"parentName": "CardContentContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"items": [],
					"caption": {"bindTo": "Resources.Strings.NotesControlGroupCaption"}
				}
			},
			{
				"operation": "insert",
				"name": "Notes",
				"parentName": "NotesControlGroup",
				"propertyName": "items",
				"values": {
					"contentType": Terrasoft.ContentType.RICH_TEXT,
					"layout": {"column": 0, "row": 0, "colSpan": 24},
					"labelConfig": {
						"visible": false
					},
					markerValue: "Notes"
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
