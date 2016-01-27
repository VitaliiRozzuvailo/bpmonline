define("ESNNotificationSchema", ["ESNNotificationSchemaResources", "terrasoft", "NetworkUtilities", "FormatUtils"],
	function(resources, Terrasoft, NetworkUtilities, FormatUtils) {
		return {
			entitySchemaName: "ESNNotification",
			messages: {
				"PushHistoryState": {
					mode: Terrasoft.MessageMode.BROADCAST,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			methods: {
				/**
				 * Формирует ссылку на изображение по идентификатору изображения.
				 * @param {String} imageId Идентификатор изображения.
				 * @private
				 * @return {String} Ссылка на изображение.
				 */
				getImageSrc: function(imageId) {
					return this.Terrasoft.ImageUrlBuilder.getUrl({
						source: this.Terrasoft.ImageSources.ENTITY_COLUMN,
						params: {
							schemaName: "SysImage",
							columnName: "Data",
							primaryColumnValue: imageId
						}
					});
				},

				/**
				 * @obsolete
				 */
				getDateFormat: function() {
					var cultureSettings = this.Terrasoft.Resources.CultureSettings;
					var createdOnTemplate = this.get("Resources.Strings.CreatedOnDateFormat");
					return this.Ext.String.format(createdOnTemplate, cultureSettings.dateFormat,
						cultureSettings.timeFormat);
				},

				/**
				 * Формирует ссылку на аватар автора уведомления.
				 * @return {String} Ссылка на аватар автора уведомления.
				 */
				getAuthorImageSrc: function() {
					var author = this.get("CreatedBy");
					if (this.Ext.isEmpty(author) || this.Ext.isEmpty(author.primaryImageValue) ||
							this.Terrasoft.isEmptyGUID(author.primaryImageValue)) {
						return "";
					}
					return this.getImageSrc(author.primaryImageValue);
				},

				/**
				 * Формирует ссылку на иконку типа уведомления.
				 * @return {String} Ссылка на иконку типа уведомления.
				 */
				getTypeImageSrc: function() {
					var type = this.get("Type");
					if (this.Ext.isEmpty(type) || this.Ext.isEmpty(type.primaryImageValue) ||
							this.Terrasoft.isEmptyGUID(type.primaryImageValue)) {
						return "";
					}
					return this.getImageSrc(type.primaryImageValue);
				},

				/**
				 * Формирует текст действия уведомления.
				 * @return {String} Текст действия уведомления.
				 */
				getTypeText: function() {
					var type = this.get("Type");
					if (!this.Ext.isEmpty(type)) {
						return type.displayValue;
					}
					return "";
				},

				/**
				 * Формирует текст ссылки на автора уведомления.
				 * @return {String} Текст ссылки на автора уведомления.
				 */
				getCreatedBy: function() {
					var author = this.get("CreatedBy");
					return author ? author.displayValue : "";
				},

				/**
				 * Формирует дату создания уведомления.
				 * @return {String} Дата создания уведомления.
				 */
				getCreatedOn: function() {
					var createdOn = this.get("CreatedOn");
					return FormatUtils.smartFormatDate(createdOn);
				},

				/**
				 * Открывает страницу автора уведомления.
				 */
				openAuthorPage: function() {
					var author = this.get("CreatedBy");
					if (this.Ext.isEmpty(author)) {
						return;
					}
					var hash = NetworkUtilities.getEntityUrl("Contact", author.value);
					this.sandbox.publish("PushHistoryState", {hash: hash});
					return false;
				},

				/**
				 * Формирует текст сообщения ESN, по которому было сформировано уведомление.
				 * @return {string} Текст сообщения ESN.
				 */
				getSocialMessageText: function() {
					var wordsCount = 7;
					var resultTemplate = "\"{0}{1}\"";
					var message = this.get("SocialMessage").displayValue;
					var plainMessage = this.removeHtmlTags(message);
					var regexp = /\s/;
					var words = plainMessage.split(regexp);
					var textTokens = [];
					var ellipsis = "";
					this.Terrasoft.each(words, function(word) {
						if (!this.Ext.isEmpty(word)) {
							if (textTokens.length < wordsCount) {
								textTokens.push(word);
							} else {
								ellipsis = "...";
							}
						}
					}, this);
					var result = this.Ext.String.format(resultTemplate, textTokens.join(" "), ellipsis);
					return Terrasoft.utils.common.decodeHtml(result);
				},

				/**
				 * Формирует текст уведомления ESN.
				 * @return {string} Текст уведомления ESN.
				 */
				getNotificationMessageText: function() {
					var template = " {0}: {1}";
					var typeText = this.getTypeText();
					var socialMessageText = this.getSocialMessageText();
					return this.Ext.String.format(template, typeText, socialMessageText);
				},

				/**
				 * Удаляет html теги из строки.
				 * @private
				 * @param {String} value Строка с html тегами.
				 * @return {String} Строка без html тегов.
				 */
				removeHtmlTags: function(value) {
					value = value.replace(/\t/gi, "");
					value = value.replace(/>\s+</gi, "><");
					if (this.Ext.isWebKit) {
						value = value.replace(/<div>(<div>)+/gi, "<div>");
						value = value.replace(/<\/div>(<\/div>)+/gi, "<\/div>");
					}
					value = value.replace(/<div>\n <\/div>/gi, "\n");
					value = value.replace(/<p>\n/gi, "");
					value = value.replace(/<div>\n/gi, "");
					value = value.replace(/<div><br[\s\/]*>/gi, "");
					value = value.replace(/<br[\s\/]*>\n?|<\/p>|<\/div>/gi, "\n");
					value = value.replace(/<[^>]+>|<\/\w+>/gi, "");
					value = value.replace(/ /gi, " ");
					value = value.replace(/&/gi, "&");
					value = value.replace(/•/gi, " * ");
					value = value.replace(/–/gi, "-");
					value = value.replace(/"/gi, "\"");
					value = value.replace(/«/gi, "\"");
					value = value.replace(/»/gi, "\"");
					value = value.replace(/‹/gi, "<");
					value = value.replace(/›/gi, ">");
					value = value.replace(/™/gi, "(tm)");
					value = value.replace(/</gi, "<");
					value = value.replace(/>/gi, ">");
					value = value.replace(/©/gi, "(c)");
					value = value.replace(/®/gi, "(r)");
					value = value.replace(/\n*$/, "");
					value = value.replace(/&nbsp;/g, " ");
					value = value.replace(/(\n)( )+/, "\n");
					value = value.replace(/(\n)+$/, "");
					return value;
				}
			},
			diff: /**SCHEMA_DIFF*/
			[{
				"operation": "insert",
				"name": "ESNNotificationImage",
				"values": {
					"getSrcMethod": "getAuthorImageSrc",
					"onPhotoChange": Terrasoft.emptyFn,
					"readonly": true,
					"classes": {"wrapClass": ["author-image-container"]},
					"defaultImage": Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.DefaultPhoto),
					"generator": "ImageCustomGeneratorV2.generateSimpleCustomImage",
					"onImageClick": {bindTo: "openAuthorPage"}
				}
			}, {
				"operation": "insert",
				"name": "ESNNotificationMessage",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {"wrapClassName": ["message-container"]},
					"items": []
				}
			}, {
				"operation": "insert",
				"name": "ESNNotificationMessageText",
				"parentName": "ESNNotificationMessage",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {"wrapClassName": ["message-text-container"]},
					"items": []
				}
			}, {
				"operation": "insert",
				"parentName": "ESNNotificationMessageText",
				"propertyName": "items",
				"name": "CreatedByLabel",
				"values": {
					"itemType": Terrasoft.ViewItemType.LABEL,
					"caption": {bindTo: "getCreatedBy"},
					"click": {bindTo: "openAuthorPage"},
					"classes": {
						"labelClass": ["link", "message-created-by"]
					}
				}
			}, {
				"operation": "insert",
				"parentName": "ESNNotificationMessageText",
				"propertyName": "items",
				"name": "ActionTextLabel",
				"values": {
					"itemType": Terrasoft.ViewItemType.LABEL,
					"classes": {
						"labelClass": ["message-type-text"]
					},
					"caption": {bindTo: "getNotificationMessageText"}
				}
			}, {
				"operation": "insert",
				"name": "ESNNotificationMessageLabels",
				"parentName": "ESNNotificationMessage",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTAINER,
					"classes": {"wrapClassName": ["message-labels-container"]},
					"items": []
				}
			}, {
				"operation": "insert",
				"parentName": "ESNNotificationMessageLabels",
				"propertyName": "items",
				"name": "TypeIcon",
				"values": {
					"getSrcMethod": "getTypeImageSrc",
					"onPhotoChange": Terrasoft.emptyFn,
					"readonly": true,
					"classes": {"wrapClass": ["type-image-container"]},
					"generator": "ImageCustomGeneratorV2.generateSimpleCustomImage"
				}
			}, {
				"operation": "insert",
				"parentName": "ESNNotificationMessageLabels",
				"propertyName": "items",
				"name": "CreatedOnLabel",
				"values": {
					"itemType": Terrasoft.ViewItemType.LABEL,
					"classes": {
						"labelClass": ["message-created-on"]
					},
					"caption": {bindTo: "getCreatedOn"}
				}
			}]
			/**SCHEMA_DIFF*/
		};
	});
