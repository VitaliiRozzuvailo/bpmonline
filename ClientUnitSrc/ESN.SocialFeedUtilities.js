define("SocialFeedUtilities", ["ESNFeedUtils", "ESNFeedModuleResources", "FormatUtils", "ESNConstants",
	"NetworkUtilities", "ModalBox", "ServiceHelper", "MaskHelper", "css!SocialFeedUtilities"],
	function(ESNFeedUtils, resources, FormatUtils, ESNConstants, NetworkUtilities, ModalBox, ServiceHelper, MaskHelper) {

		/**
		 * Количество комментариев, загружаемых сразу
		 * @private
		 */
		var initCommentCount = 3;
		var renderContainer;
		var likedUsersArray = [];
		var entityColorSchema = {
			"25d7c1ab-1de0-4501-b402-02e0e5a72d6e": "#91C95E", // Контрагент
			"c449d832-a4cc-4b01-b9d5-8a12c42a9f89": "#8E8EB7", // Активность
			"2f81fa05-11ae-400d-8e07-5ef6a620d1ad": "#F49D56", // История звонков
			"16be3651-8fe2-4159-8dd0-a803d4683dd3": "#91C95E", // Контакт
			"8b33b6b2-19f7-4222-9161-b4054b3fbb09": "#EEAF4B", // Документ
			"bfb313dd-bb55-4e1b-8e42-3d346e0da7c5": "#EEAF4B", // Счет
			"0326868c-ce5e-4934-8f1f-178801bfe6c3": "#64B8DF", // Статья базы знаний
			"41af89e9-750b-4ebb-8cac-ff39b64841ec": "#91C95E", // Лид
			"ae46fb87-c02c-4ae8-ad31-a923cdd994cf": "#8E8EB7", // Продажа
			"80294582-06b5-4faa-a85f-3323e5536b71": "#EEAF4B", // Заказ
			"4c7a6ead-4eb8-4fc0-863e-98a664569fed": "#8E8EB7", // Продукт
			"ac2d8e0f-a926-4f76-a1fa-604d5eaaa1d2": "#8E8EB7", // Журнал процессов
			"e6e68ac1-495d-4727-a7a7-9b531ab9f849": "#5BC8C4"  // Библиотека процессов (представление)
		};
		var entityDefaultColorSchema = "#64B8DF";

		var ESNSectionSandboxId = "SectionModuleV2_ESNFeedSectionV2_ESNFeed";
		var ESNSandboxId = "ViewModule_SectionModuleV2_ESNFeed";
		var ESNRightPanelSandboxId = "ViewModule_RightSideBarModule_ESNFeedModule";

		var currentEditingComment = null;

		/**
		 * @class Terrasoft.configuration.SocialFeedUtilities
		 */
		Ext.define("Terrasoft.configuration.mixins.SocialFeedUtilities", {
			alternateClassName: "Terrasoft.SocialFeedUtilities",

			/**
			 * Кэш для хранения уже вычитаных entities.
			 * @type {Array}
			 */
			EntitiesCache: [],

			/**
			 *
			 */
			init: function() {
				this.set("SchemasCollection", this.Ext.create("Terrasoft.Collection"));
				this.set("SocialMessageColumnNames", [
					"Id", "CreatedBy", "CreatedOn", "Message", "EntitySchemaUId",
					"EntityId", "Parent", "LikeCount", "CommentCount"
				]);
			},

			/**
			 *
			 * @param {Object} config
			 */
			createSocialMessage: function(config) {
				var socialMessageConfig = {
					rowConfig: config.rowConfig,
					values: config.rawData,
					Ext: this.Ext,
					Terrasoft: this.Terrasoft,
					sandbox: this.sandbox
				};
				config.viewModel = this.Ext.create("Terrasoft.SocialMessageViewModel", socialMessageConfig);
			},

			getPrimaryImageValue: function(entity, entitySchemaName, callback, scope) {
				var moduleStructure = this.Terrasoft.configuration.ModuleStructure[entitySchemaName];
				if (!moduleStructure || !moduleStructure.logoId) {
					return "";
				}
				var imageId = moduleStructure.logoId;
				entity.primaryImageValue = {
					value: imageId,
					displayValue: "",
					primaryImageValue: ""
				};
				callback.call(scope, entity);
			},

			/**
			 * Функция загружает произвольную запись.
			 */
			loadAnyEntity: function(entitySchemaName, entityId, callback, scope) {
				if (entitySchemaName) {
					if (this.EntitiesCache[entityId]) {
						callback.call(scope, this.EntitiesCache[entityId]);
						return;
					}
					var hasPrimaryImageColumn = true;
					var entitySchemaUId = this.get("EntitySchemaUId");
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: entitySchemaName
					});
					var moduleStructure = Terrasoft.configuration.ModuleStructure[entitySchemaName];
					var attribute = null;
					if (moduleStructure && moduleStructure.attribute) {
						attribute = moduleStructure.attribute;
					}
					if (attribute) {
						esq.addColumn(attribute, "type");
					}
					esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, "value");
					esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, "displayValue");
					if (!ESNConstants.ESN.SchemasWithPrimaryImageColumnCollection.hasOwnProperty(entitySchemaUId)) {
						hasPrimaryImageColumn = false;
					} else {
						esq.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_IMAGE_COLUMN, "primaryImageValue");
					}
					esq.getEntity(entityId, function(result) {
						if (result.success && result.entity) {
							var entity = result.entity;
							entity = {
								value: entity.get("value"),
								displayValue: entity.get("displayValue"),
								type: entity.get("type")
							};
							if (!hasPrimaryImageColumn) {
								this.getPrimaryImageValue(entity, entitySchemaName, callback, scope);
							} else {
								entity.primaryImageValue = result.entity.get("primaryImageValue");
								if (!this.EntitiesCache[entityId]) {
									this.EntitiesCache[entityId] = entity;
								}
								callback.call(scope, entity);
							}
						}
					}, this);
				}
			},

			/**
			 * Функция формирует ссылку на изображение.
			 * @private
			 */
			getImageSrc: function(imageId) {
				if (!imageId) {
					return null;
				}
				return this.Terrasoft.ImageUrlBuilder.getUrl({
					source: Terrasoft.ImageSources.ENTITY_COLUMN,
					params: {
						schemaName: "SysImage",
						columnName: "Data",
						primaryColumnValue: imageId
					}
				});
			},

			/**
			 * Функция возвращает значение отображаемой колонки сущности.
			 * @private
			 */
			getDisplayValue: function(entity) {
				return entity ? entity.displayValue : null;
			},

			/**
			 * Функция возвращает идентификатор изображения сущности.
			 * @private
			 */
			getImageValue: function(entity) {
				var imageValue = null;
				if (entity) {
					var image = entity.primaryImageValue || entity.Image;
					if (this.Ext.isObject(image) || this.Terrasoft.isGUID(image)) {
						imageValue = image.value || image;
					} else {
						return this.Terrasoft.ImageUrlBuilder.getUrl(this.get("Resources.Images.DefaultCreatedBy"));
					}
				}
				return this.getImageSrc(imageValue);
			},

			/**
			 * Функция возвращает имя автора.
			 * @private
			 */
			getCreatedByText: function() {
				return this.getDisplayValue(this.get("CreatedBy"));
			},

			/**
			 * Функция возвращает изображение автора.
			 * @private
			 */
			getCreatedByImage: function() {
				return this.getImageValue(this.get("CreatedBy"));
			},

			/**
			 * Функция возвращает видимость изображения автора.
			 * @private
			 */
			getCreatedByImageVisible: function() {
				return (this.getCreatedByImage() !== null);
			},

			/**
			 * Обработчик клика на label-гиперссылку автора.
			 */
			onCreateByClick: function(e) {
				var mouseButton = Terrasoft.getMouseButton(e);
				if (mouseButton === Terrasoft.MouseButton.LEFT) {
					MaskHelper.ShowBodyMask();
					this.onUrlClick("Contact", this.get("CreatedBy"));
					return false;
				}
			},

			/**
			 * Функция возвращает гиперссылку автора.
			 */
			getCreatedUrlContact: function() {
				var hash = NetworkUtilities.getEntityUrl("Contact", this.get("CreatedBy").value);
				return resources.localizableStrings.ViewModuleUrl + hash;
			},

			/**
			 * Функция возвращает ссылку сущности, с которой связано сообщение (канал, договор, ...).
			 * @private
			 */
			getCreatedPublishUrl: function() {
				var entity = this.get("Entity");
				if (entity) {
					var typeId = entity.type ? entity.type.value : null;
					var hash = NetworkUtilities.getEntityUrl(entity.name, entity.value, typeId);
					return resources.localizableStrings.ViewModuleUrl + hash;
				}
			},

			/**
			 * Функция возвращает дату создания
			 * @private
			 */
			getCreatedOnText: function() {
				return FormatUtils.smartFormatDate(this.get("CreatedOn"));
			},

			/**
			 * Функция возвращает название сущности, с которой связано сообщение (канал, договор, ...)
			 * @private
			 */
			getEntityText: function() {
				return this.getDisplayValue(this.get("Entity"));
			},

			getCreatedToLabel: function() {
				var resultTemplate = "{0} {1}";
				var createdByToEntity = resources.localizableStrings.CreatedByToEntity;
				var createdBy = resources.localizableStrings.CreatedBy;
				var entity = this.get("Entity");
				var entityCaption = entity ? entity.caption : "";
				return this.Ext.isEmpty(entityCaption)
						? createdBy
						: this.Ext.String.format(resultTemplate, createdByToEntity, entityCaption.toLowerCase());
			},

			/**
			 * Функция возвращает изображение сущности, с которой связано сообщение (канал, договор, ...)
			 * @private
			 */
			getEntityImage: function() {
				var entity = this.get("Entity");
				var imageValue = null;
				var image = entity ? entity.primaryImageValue || entity.Image : null;
				if (this.Ext.isObject(image) || Terrasoft.isGUID(image)) {
					imageValue = image.value || image;
				}
				return imageValue ? this.getImageValue(entity) :
						this.Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.NoChannel);
			},

			/**
			 * @obsolete
			 */
			getEntityContainerVisible: function() {
				if (this.sandbox.id === ESNSectionSandboxId || this.sandbox.id === ESNRightPanelSandboxId ||
						this.sandbox.id === ESNSandboxId) {
					return true;
				}
				return false;
			},

			/**
			 * @obsolete
			 */
			getCreatedToLabelVisible: function() {
				if (this.sandbox.id === ESNSectionSandboxId || this.sandbox.id === ESNSandboxId) {
					return true;
				}
				return false;
			},

			/**
			 * @obsolete
			 */
			getCreatedToLabelHidden: function() {
				return !this.getCreatedToLabelVisible();
			},

			/**
			 * @obsolete
			 */
			getEntityImageVisible: function() {
				return (this.getEntityImage() !== null);
			},

			/**
			 * @obsolete
			 */
			getEntityTextVisible: function() {
				return !this.getIsRightPanel();
			},

			getRightPanelPublishButtonVisible: function() {
				return this.getIsRightPanel();
			},

			/**
			 * Возвращает признак того, что модуль загружен в правую панель.
			 * @return {Boolean}
			 */
			getIsRightPanel: function() {
				return (this.sandbox.id === ESNRightPanelSandboxId);
			},

			/**
			 * Обработчик клика на label-гиперссылку сущности.
			 */
			onEntityClick: function(e) {
				var mouseButton = Terrasoft.getMouseButton(e);
				if (mouseButton === Terrasoft.MouseButton.LEFT) {
					MaskHelper.ShowBodyMask();
					var entity = this.get("Entity");
					if (entity) {
						var typeId = entity.type ? entity.type.value : null;
						this.onUrlClick(entity.name, this.get("Entity"), typeId);
					}
					return false;
				}

			},

			/**
			 * Сопоставляет идентификатор схемы с предустановленным цветом и возвращает по его значению сооютветствующий.
			 * Если цвет небыл найден или не передан идентификатор схемы - возвращается цвет указанный в customColor.
			 * Если customColor не передан, то возвращается цвет по умолчанию.
			 * @param {String} entitySchemaUId идентификатор схемы
			 * @param {String} customColor заданный цвет ленты
			 * @returns {String}
			 */
			getEntityColor: function(entitySchemaUId, customColor) {
				var color = customColor || entityDefaultColorSchema;
				if (this.Ext.isEmpty(entitySchemaUId)) {
					return color;
				}
				if (entityColorSchema.hasOwnProperty(entitySchemaUId)) {
					return entityColorSchema[entitySchemaUId];
				} else {
					return color;
				}
			},

			getMessage: function() {
				return this.get("Message");
			},

			/**
			 * Возвращает значение маркерного DOM-атрибута data-item-marker контейнера сообщения.
			 * @return {String}
			 */
			getMessageContainerMarkerValue: function() {
				var markerValue = [];
				var createdBy = this.get("CreatedBy");
				if (createdBy) {
					markerValue.push(createdBy.displayValue);
				}
				var entity = this.get("Entity");
				if (entity) {
					markerValue.push(entity.displayValue);
				}
				return markerValue.join(" ");
			},

			/**
			 * Возвращает количество комментариев, которые доступны для дозагрузки.
			 * @return {Number} Количество комментариев.
			 */
			getRemainsCommentCount: function() {
				var commentCount = this.get("CommentCount");
				var loadedCommentCount = this.get("LoadedCommentCount");
				return commentCount - loadedCommentCount;
			},

			/**
			 * Возвращает признак возможности дозагрузки комментариев.
			 * @return {Boolean} Возможность дозагрузки комментариев.
			 */
			hasRemainsComments: function() {
				return this.getRemainsCommentCount() > 0;
			},

			/**
			 * Функция возвращает текст кнопки скрытия комментариев.
			 * @private
			 */
			getHideCommentsText: function() {
				var isRightPanel = this.getIsRightPanel();
				return isRightPanel ? resources.localizableStrings.HideCommentsShort :
						resources.localizableStrings.HideComments;
			},

			/**
			 * Функция возвращает текст кнопки загрузки комментариев.
			 * @private
			 */
			getShowCommentsText: function() {
				var isRightPanel = this.getIsRightPanel();
				var commentsExpanded = this.get("CommentsExpanded");
				var commentCount = this.get("CommentCount");
				var text = "";
				if (commentsExpanded) {
					var format = isRightPanel ? resources.localizableStrings.ShowCommentsShort
						: resources.localizableStrings.ShowComments;
					text = Ext.String.format(format, this.getRemainsCommentCount());
				} else {
					if (commentCount > 0) {
						text = Ext.String.format("{0} ({1})", resources.localizableStrings.Comments, commentCount);
					} else {
						text = resources.localizableStrings.Comments;
					}
				}
				return text;
			},

			/**
			 * Возвращает текст кнопки показа/скрытия комментариев.
			 * @private
			 * @return {string}
			 */
			getToggleCommentsText: function() {
				var commentCount = this.get("CommentCount");
				return (commentCount === 0) ? "" : commentCount;
			},

			/**
			 * Возвращает текст кнопки дозагрузки комментариев.
			 * @private
			 * @return {String} Текст кнопки дозагрузки комментариев.
			 */
			getRemainsCommentsText: function() {
				return Ext.String.format(resources.localizableStrings.ShowComments, this.getRemainsCommentCount());
			},

			/**
			 * Функция возвращает видимость кнопки загрузки комментариев.
			 * @private
			 * @return {Boolean}
			 */
			getShowCommentsVisible: function() {
				return !this.getIsRightPanel() &&
					(!this.get("CommentsExpanded") || this.hasRemainsComments());
			},

			/**
			 * Функция возвращает видимость кнопки скрытия комментариев.
			 * @private
			 * @return {Boolean}
			 */
			getHideCommentsVisible: function() {
				return !this.getIsRightPanel() && this.get("CommentsExpanded");
			},

			/**
			 * Функция возвращает видимость кнопки показа/скрытия комментариев.
			 * @private
			 * @return {Boolean}
			 */
			getToggleCommentsVisible: function() {
				return this.getIsRightPanel();
			},

			/**
			 * Функция возвращает видимость кнопки дозагрузки комментариев.
			 * @private
			 * @return {Boolean} Видимость кнопки дозагрузки комментариев.
			 */
			getRemainsCommentsContainerVisible: function() {
				return this.getIsRightPanel() &&
					(!this.get("CommentsExpanded") || this.hasRemainsComments());
			},

			/**
			 * Обработчик показа комментариев.
			 * @private
			 */
			processCommentsClick: function(config) {
				var oldCommentsExpanded = this.get("CommentsExpanded");
				var loadedComments = this.get("LoadedComments");
				var comments = this.get("Comments");
				var commentCount = comments.getCount();
				var loadCallback = function() {
					loadedComments.clear();
					var startIndex = oldCommentsExpanded ? 0 : commentCount - initCommentCount;
					if (startIndex < 0) {
						startIndex = 0;
					}
					for (var i = startIndex; i < commentCount; i++) {
						var item = comments.getByIndex(i);
						loadedComments.add(item.get("Id"), item);
						item.set("viewModel", this);
						if (i === commentCount - 1) {
							item.set("isLast", true);
						} else {
							item.set("isLast", false);
						}
					}
					this.set("LoadedCommentCount", loadedComments.getCount());
					this.set("CommentsExpanded", true);
					this.set("CommentPublishContainerVisible", true);
					this.set("RemainsCommentsContainerVisible", this.getRemainsCommentsContainerVisible());
				};
				if (commentCount === 0) {
					this.loadSocialMessages(config, function(items) {
						comments.loadAll(items);
						commentCount = comments.getCount();
						this.set("CommentCount", commentCount);
						loadCallback.call(this);
					}, this);
				} else {
					loadCallback.call(this);
				}
			},

			/**
			 * Обработчик нажатия кнопки показа комментариев.
			 * @private
			 */
			onShowCommentsClick: function() {
				var config = this.getCommentConfig();
				this.processCommentsClick(config);
			},

			/**
			 * Обработчик нажатия кнопки показа комментариев на Портале.
			 * @private
			 */
			onShowPortalCommentsClick: function() {
				var config = this.getCommentConfig();
				config.extendedColumns = [
					{
						columnName: "[Case:Id:EntityId].Status.IsFinal",
						columnAlias: "IsCaseFinalStatus"
					},
					{
						columnName: "Parent.[Case:Id:EntityId].Status.IsFinal",
						columnAlias: "IsParentMessageCaseFinalStatus"
					},
					{
						columnName: "Parent.EntitySchemaUId",
						columnAlias: "ParentEntitySchemaUId"
					}
				];
				this.processCommentsClick(config);
			},

			/**
			 * Возвращает конфиг для обработки показа комментариев.
			 * @private
			 */
			getCommentConfig: function() {
				var viewModel = this;
				return {
					sortColumnName: "CreatedOn",
					parentId: this.get("Id"),
					sortDirection: Terrasoft.OrderDirection.ASC,
					sandbox: this.sandbox,
					canDeleteAllMessageComment: this.get("canDeleteAllMessageComment"),
					onDeleteRecordCallback: function() {
						var comments = viewModel.get("Comments");
						var loadedComments = viewModel.get("LoadedComments");
						var loadedCommentsCount = loadedComments.getCount();
						var commentToDeleteId = this.get("Id");
						loadedComments.removeByKey(commentToDeleteId);
						comments.removeByKey(commentToDeleteId);
						viewModel.set("CommentCount", --loadedCommentsCount);
						viewModel.set("LoadedCommentCount", loadedCommentsCount);
						if (loadedCommentsCount - 1 >= 0) {
							loadedComments.getItems()[--loadedCommentsCount].set("isLast", true);
						}
					}
				};
			},

			/**
			 * Обработчик нажатия кнопки скрытия комментариев.
			 * @private
			 */
			onHideCommentsClick: function() {
				this.set("CommentsExpanded", false);
				this.get("LoadedComments").clear();
				this.set("LoadedCommentCount", 0);
				this.set("NewCommentButtonsVisible", false);
			},

			/**
			 * Обработчик нажатия кнопки показа/скрытия комментариев.
			 * @private
			 */
			onToggleCommentsClick: function() {
				var commentsExpanded = this.get("CommentsExpanded");
				if (commentsExpanded) {
					this.onHideCommentsClick();
				} else {
					this.onShowCommentsClick();
				}
			},

			/**
			 * Обработчик нажатия кнопки показа/скрытия комментариев.
			 * @private
			 */
			onTogglePortalCommentsClick: function() {
				var commentsExpanded = this.get("CommentsExpanded");
				if (commentsExpanded) {
					this.onHideCommentsClick();
				} else {
					this.onShowPortalCommentsClick();
				}
			},

			/**
			 * Возвращает видимость кнопки редактирования сообщения/комментария.
			 * @private
			 */
			getPostCommentEditVisible: function() {
				return this.getPostCommentEditDeleteVisible();
			},

			/**
			 * Возвращает видимость кнопки редактирования сообщения/комментария на Портале.
			 * @private
			 */
			getPortalPostCommentEditVisible: function() {
				var result = true;
				var entitySchemaUId = this.values.EntitySchemaUId;
				var isCaseFinalStatus = this.values.IsCaseFinalStatus;
				if (this.Ext.isEmpty(entitySchemaUId)) {
					isCaseFinalStatus = this.values.IsParentMessageCaseFinalStatus;
					entitySchemaUId = this.values.ParentEntitySchemaUId;
				}
				if (entitySchemaUId === ESNConstants.SysSchema.CaseUId) {
					result = !isCaseFinalStatus && this.getPostCommentEditDeleteVisible() &&
						Terrasoft.CurrentUser.userType === Terrasoft.UserType.SSP;
				} else {
					result = this.getPostCommentEditDeleteVisible();
				}
				return result;
			},

			getPostCommentEditDeleteVisible: function() {
				var visible = false;
				if (this.get("EditCommentVisible")) {
					return visible;
				}
				if (this.get("CreatedBy").value === Terrasoft.SysValue.CURRENT_USER_CONTACT.value) {
					visible = true;
				}
				return visible;
			},
			/**
			 * Функция возвращает видимость кнопки удаления сообщения/комментария на Портале.
			 * @private
			 */
			getPortalPostCommentDeleteVisible: function() {
				var result = this.getPortalPostCommentEditVisible();
				if (!result) {
					result = this.get("canDeleteAllMessageComment");
				}
				return result;
			},
			/**
			 * Функция возвращает видимость кнопки удаления сообщения/комментария.
			 * @private
			 */
			getPostCommentDeleteVisible: function() {
				var result = this.getPostCommentEditDeleteVisible();
				if (!result) {
					return this.get("canDeleteAllMessageComment");
				}
				return result;
			},

			/**
			 * Обработчик нажатия кнопки редактирования сообщения/комментария.
			 * @private
			 */
			onPostCommentEditClick: function() {
				var viewModel = this.get("viewModel") || this;
				//if (currentEditingComment) {
				//	changeVisible.call(currentEditingComment);
				//}
				currentEditingComment = this;
				var message = this.get("Message") || "";
				this.set("CommentVisible", false);
				this.set("CommentsExpanded", false);
				this.set("ActionsContainerVisible", false);
				this.set("CommentToEditContainerVisible", true);
				if (this.get("Parent")) {
					this.set("commentMessage", message);
					this.set("isCommentInEditMode", true);
				} else {
					viewModel.set("isCommentInEditMode", true);
					viewModel.set("editedCommentMessage", message);
					viewModel.set("PublishContainerVisible", true);
				}
				viewModel.set("CommentPublishContainerVisible", false);
				viewModel.set("commentScope", this);
				//currentEditingComment = null;
			},

			/**
			 * Обработчик нажатия кнопки удаления сообщения/комментария.
			 * @private
			 */
			onPostCommentDeleteClick: function() {
				ServiceHelper.callService("ESNFeedModuleService", "DeletePostComment", function() {
					this.doRemoveFn.call(this);
				}, {
					postCommentId: this.get("Id"),
					parentPostId: this.get("Parent").value
				}, this);
			},

			changeVisible: function(post) {
				var parentPost = null;
				this.set("isCommentInEditMode", false);
				this.set("PublishContainerVisible", false);
				this.set("EditCommentVisible", false);
				this.set("CommentVisible", true);
				this.set("ActionsContainerVisible", true);
				this.set("CommentPublishContainerVisible", true);
				this.set("commentMessage", "");
				this.set("CommentToEditContainerVisible", false);
				if (currentEditingComment) {
					parentPost = currentEditingComment.get("viewModel");
				}
				if (parentPost) {
					this.onHideCommentsClick.call(parentPost);
				}
				if (post) {
					post.set("CommentPublishContainerVisible", true);
				}
			},

			/**
			 * Обработчик нажатия кнопки отправки сообщения.
			 * @private
			 */
			onEditCommentPublishClick: function() {
				var post = this.get("viewModel");
				var editedMessage = this.get("commentMessage") || this.get("editedCommentMessage");
				if (editedMessage === this.get("Message")) {
					this.changeVisible(post);
					currentEditingComment = null;
					return;
				} else {
					ServiceHelper.callService("ESNFeedModuleService", "UpdatePostComment", function() {
						this.set("Message", editedMessage);
						this.changeVisible(post);
						currentEditingComment = null;
					}, {
						editedMessage: editedMessage,
						postMessageId: this.get("Id")
					}, this);
				}
			},

			/**
			 *
			 * @param {Object} e
			 */
			onKeyDown: function(e) {
				if (e && (e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey) {
					this.onCommentPublishClick();
				}
			},

			onNewCommentContainerFocus: function() {
				this.set("NewCommentButtonsVisible", true);
			},

			onNewCommentContainerBlur: function() {
				var me = this;
				setTimeout(function() {
					if (me.get("commentMessage") === "") {
						me.set("NewCommentButtonsVisible", false);
					}
				}, 100);
			},
			/**
			 * Возвращает видимость кнопки Комментировать в комментариях ленты на Портале.
			 * @private
			 */
			getNewCommentButtonVisibility: function() {
				var result = true;
				var entitySchemaUId = this.values.EntitySchemaUId;
				var isCaseFinalStatus = this.values.IsCaseFinalStatus;
				if (this.Ext.isEmpty(entitySchemaUId)) {
					isCaseFinalStatus = this.values.IsParentMessageCaseFinalStatus;
					entitySchemaUId = this.values.ParentEntitySchemaUId;
				}
				if (entitySchemaUId === ESNConstants.SysSchema.CaseUId) {
					result = !isCaseFinalStatus && Terrasoft.CurrentUser.userType === Terrasoft.UserType.SSP;
				}
				return result && this.get("NewCommentButtonsVisible");
			},

			onCommentToEditContainerFocus: function() {
				this.set("CommentToEditButtonsVisible", true);
			},

			onCommentToEditContainerBlur: function() {
				var me = this;
				setTimeout(function() {
					if (me.get("commentMessage") === "") {
						me.set("CommentToEditButtonsVisible", false);
					}
				}, 100);
			},

			onEditedCommentContainerFocus: function() {
				this.set("EditedCommentContainerVisible", true);
			},

			onEditedCommentContainerBlur: function() {
				var me = this;
				setTimeout(function() {
					if (me.get("editedCommentMessage") === "") {
						me.set("EditedCommentContainerVisible", false);
					}
				}, 100);
			},

			/**
			 * Обработчик кнопки отмены редактирования поста.
			 */
			onCancelClick: function() {
				this.set("editedCommentMessage", "");
				this.set("commentMessage", "");
				var post = this.get("viewModel");
				this.changeVisible(post);
			},

			/**
			 * Обработчик нажатия на отправки сообщения.
			 * @private
			 */
			onCommentPublishClick: function() {
				if (this.get("isCommentInEditMode")) {
					this.onEditCommentPublishClick();
					return;
				}
				var message = this.get("commentMessage");
				if (this.Ext.isEmpty(message) || message.length === 0) {
					return;
				}
				var post = {
					parentId: this.get("Id"),
					message: message,
					sandbox: this.sandbox
				};
				this.insertSocialMessage(post, function(item) {
					var loadedComments = this.get("LoadedComments");
					this.Terrasoft.each(loadedComments.getItems(), function(comment) {
						comment.set("isLast", false);
					}, this);
					item.set("isLast", true);
					item.set("viewModel", this);
					loadedComments.add(item.get("Id"), item);
					this.set("LoadedCommentCount", loadedComments.getCount());

					var comments = this.get("Comments");
					comments.add(item.get("Id"), item);
					this.set("CommentCount", comments.getCount());
					this.set("PublishContainerVisible", false);
				}, this);
				this.set("commentMessage", "");
			},

			/**
			 * Обработчик клика на label-гиперссылку.
			 */
			onUrlClick: function(entitySchemaName, entity, entityTypeUId) {
				if (this.Ext.isEmpty(entity)) {
					return;
				}
				var hash = NetworkUtilities.getEntityUrl(entitySchemaName, entity.value, entityTypeUId);
				this.sandbox.publish("PushHistoryState", {hash: hash});
			},

			/**
			 * Функция возвращает текст кнопки лайка.
			 * @private
			 */
			getLikeText: function() {
				var likeCount = this.get("LikeCount");
				return (likeCount === 0) ? "" : likeCount;
			},

			/**
			 * Функция возвращает подпись для кнопки лайка.
			 * @private
			 */
			getLikeCaption: function() {
				var isLikedMe = this.get("IsLikedMe");
				var caption = resources.localizableStrings.LikeButtonCaption;
				if (isLikedMe) {
					caption = resources.localizableStrings.UnLikeButtonCaption;
				}
				return caption;
			},

			/**
			 * Функция возвращает видимость элемента с числом лайков.
			 * @return {boolean}
			 */
			getLikeTextVisible: function() {
				if (this.get("EditCommentVisible")) {
					return false;
				}
				return this.get("LikeCount") > 0;
			},

			/**
			 * Функция возвращает изображение лайка.
			 * @private
			 */
			getLikeImage: function() {
				var isLikedMe = this.get("IsLikedMe");
				return {
					source: this.Terrasoft.ImageSources.URL,
					url: this.Terrasoft.ImageUrlBuilder.getUrl(isLikedMe
							? resources.localizableImages.Liked
							: resources.localizableImages.Like)
				};
			},

			/**
			 * Функция обновляет количество лайков.
			 */
			updateLikeCount: function() {
				var isLikedMe = this.get("IsLikedMe");
				var likeCount = this.get("LikeCount") + (!isLikedMe ? 1 : -1);
				this.set("IsLikedMe", !isLikedMe);
				this.set("LikeCount", likeCount);
			},

			/**
			 * Функция вставляет новую запись в таблицу лайков.
			 */
			insertLike: function(callback, scope) {
				var socialMessageId = scope.get("Id");
				var insert = this.Ext.create("Terrasoft.InsertQuery", {
					rootSchemaName: "SocialLike"
				});
				insert.setParameterValue("User", Terrasoft.SysValue.CURRENT_USER.value, Terrasoft.DataValueType.GUID);
				insert.setParameterValue("SocialMessage", socialMessageId, Terrasoft.DataValueType.GUID);
				insert.execute(function() {
					if (callback) {
						callback.call(scope);
					}
				}, scope);
			},

			/**
			 * Функция удаляет запись из таблицы лайков.
			 */
			deleteLike: function(callback, scope) {
				var deleteQuery = this.Ext.create("Terrasoft.DeleteQuery", {
					rootSchemaName: "SocialLike"
				});
				var userIdFilter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "User", this.Terrasoft.SysValue.CURRENT_USER.value);
				var entityIdFilter = Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "SocialMessage", scope.get("Id"));
				deleteQuery.filters.add("userIdFilter", userIdFilter);
				deleteQuery.filters.add("entityIdFilter", entityIdFilter);
				deleteQuery.execute(function(response) {
					if (response.success && callback) {
						callback.call(scope);
					}
				}, this);
			},

			/**
			 * Обработчик события нажатия на лайк.
			 */
			onLikeClick: function() {
				var isLikedMe = this.get("IsLikedMe");
				if (!isLikedMe || Ext.isEmpty(isLikedMe)) {
					this.insertLike(this.updateLikeCount, this);
				} else {
					this.deleteLike(this.updateLikeCount, this);
				}
			},

			/**
			 * Обработчик события нажатия на количество лайков.
			 */
			onShowLikedUsers: function() {
				var likes = this.get("LikeCount");
				if (!likes) {
					return;
				}
				var selectedMessage = this.get("Id");
				renderContainer = ModalBox.show(ESNConstants.LikedUsersModalBoxConfig);
				var likedUsersView = this.getLikedUsersView();
				var likedUsersViewModel = this.getLikedUsersViewModel();
				likedUsersViewModel.sandbox = this.sandbox;
				likedUsersViewModel.loadLikedUsers(selectedMessage);
				likedUsersView.bind(likedUsersViewModel);
				likedUsersView.render(renderContainer);

				var fixedView = this.getModalBoxTopView();
				fixedView.bind(likedUsersViewModel);
				fixedView.render(ModalBox.getFixedBox());

				ModalBox.setSize(400, 400);
			},

			/**
			 * Функция возвращает View модального окна.
			 */
			getLikedUsersView: function() {
				var viewConfig = {
					className: "Terrasoft.Container",
					id: "likedUsersModalBoxContainer",
					selectors: {
						wrapEl: "#likedUsersModalBoxContainer"
					},
					classes: {
						wrapClassName: ["likedUsersModalBoxContainer"]
					},
					visible: {
						bindTo: "getLikedUsersContainerVisible"
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "likedUsersGridGroup",
							selectors: {
								wrapEl: "#likedUsersGridGroup"
							},
							classes: {
								wrapContainerClass: ["liked-users-wrap-container"]
							},
							items: []
						}
					]
				};
				return this.Ext.create("Terrasoft.Container", viewConfig);
			},

			/**
			 * Функция возвращает ViewModel модального окна.
			 */
			getLikedUsersViewModel: function() {
				var me = this;
				var config = {
					values: {
						getLikedUsersContainerVisible: true
					},
					methods: {
						onLikedUserClick: function(tag) {
							ModalBox.close();
							me.onUrlClick("Contact", tag);
						},
						getLikeUsersItems: function(likedUsersCollection) {
							likedUsersArray = [];
							var likedUsersGridGroup = Ext.getCmp("likedUsersGridGroup");
							if (!likedUsersGridGroup) {
								return;
							}
							likedUsersCollection.each(function(item) {
								var likedUser = item.get("CreatedBy");
								var likedUserName = likedUser.displayValue;
								var imageSrc = me.getImageValue(likedUser);
								var likedUserId = item.get("Id");
								var likedUserConfig = {
									id: "likedUserConfig" + likedUserId,
									selectors: {
										wrapEl: "#likedUserConfig" + likedUserId
									},
									classes: {
										wrapClassName: ["likedUserConfig"]
									},
									className: "Terrasoft.Container",
									items: [
										{
											className: "Terrasoft.ImageView",
											imageSrc: imageSrc,
											classes: {
												wrapClass: ["image32", "floatLeft"]
											}
										},
										{
											className: "Terrasoft.Label",
											caption: likedUserName,
											classes: {
												labelClass: ["likedUserNameLabel32"]
											},
											tag: likedUser,
											click: {
												bindTo: "onLikedUserClick"
											}
										}
									]
								};
								likedUsersArray.push(likedUserConfig);
							}, this);
							var likedUsersConfig = Ext.create("Terrasoft.Container", {
								id: "likedUsersContainer",
								selectors: {
									wrapEl: "#likedUsersContainer"
								},
								classes: {
									wrapClassName: ["likedUsersContainer"]
								},
								items: likedUsersArray
							});
							likedUsersConfig.bind(this);
							var likeUsersGridGroupWrapEl = likedUsersGridGroup.getWrapEl();
							if (likeUsersGridGroupWrapEl) {
								likedUsersConfig.render(Ext.get("likedUsersGridGroup"));
							}
						},
						loadLikedUsers: function(selectedMessage) {
							var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "SocialLike"
							});
							esq.addColumn("Id");
							esq.addColumn("CreatedBy");
							esq.filters.add("currentMessageFilter",
									Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "SocialMessage",
											selectedMessage));
							esq.getEntityCollection(function(result) {
								if (result.success) {
									this.getLikeUsersItems(result.collection);
								}
							}, this);
						},
						closeLikedUsersModalBox: function() {
							ModalBox.close();
						}
					}
				};
				return this.Ext.create("Terrasoft.BaseViewModel", config);
			},

			/**
			 * Функция возвращает изображение кнопки редактирования.
			 * @private
			 */
			getEditImage: function() {
				return {
					source: this.Terrasoft.ImageSources.URL,
					url: this.Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.Edit)
				};
			},

			/**
			 * Функция возвращает изображение кнопки удаления.
			 * @private
			 */
			getDeleteImage: function() {
				return {
					source: this.Terrasoft.ImageSources.URL,
					url: this.Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.Delete)
				};
			},

			getModalBoxTopView: function() {
				var viewConfig = {
					className: "Terrasoft.Container",
					id: "likedUsersModalBoxTopContainer",
					selectors: {
						wrapEl: "#likedUsersModalBoxTopContainer"
					},
					classes: {
						wrapClassName: ["likedUsersModalBoxTopContainer"]
					},
					items: [
						{
							className: "Terrasoft.Label",
							caption: resources.localizableStrings.LikedUsersContainerCaption,
							classes: {
								labelClass: ["likedUsersModalBoxTopContainerLabel"]
							}
						},
						{
							className: "Terrasoft.Container",
							id: "maskContainer",
							selectors: {
								wrapEl: "#maskContainer"
							},
							classes: {
								wrapClassName: ["maskContainer"]
							},
							items: [
								{
									className: "Terrasoft.Button",
									click: {
										bindTo: "closeLikedUsersModalBox"
									},
									classes: {
										textClass: "closeModalWindow"
									},
									caption: " ",
									style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT
								}
							]
						},
						{
							className: "Terrasoft.Button",
							imageConfig: resources.localizableImages.CloseIcon,
							classes: {wrapperClass: "closeModalWindowButton"},
							click: {
								bindTo: "closeLikedUsersModalBox"
							},
							style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT
						}
					]
				};
				return this.Ext.create("Terrasoft.Container", viewConfig);
			},

			/**
			 * Функция добавляет сообщение/комментарий.
			 */
			insertSocialMessage: function(data, callback, scope) {
				MaskHelper.ShowBodyMask();
				var insert = this.Ext.create("Terrasoft.InsertQuery", {
					rootSchemaName: "SocialMessage"
				});
				insert.setParameterValue("Message", data.message, Terrasoft.DataValueType.TEXT);
				if (data.entityId) {
					insert.setParameterValue("EntitySchemaUId", data.entitySchemaId, Terrasoft.DataValueType.GUID);
					insert.setParameterValue("EntityId", data.entityId, Terrasoft.DataValueType.GUID);
				}
				if (data.parentId) {
					insert.setParameterValue("Parent", data.parentId, Terrasoft.DataValueType.GUID);
				}
				insert.execute(function(result) {
					if (!result.success) {
						MaskHelper.HideBodyMask();
						return;
					}
					this.loadSocialMessages({
						id: result.id,
						sandbox: data.sandbox,
						canDeleteAllMessageComment: scope.get("canDeleteAllMessageComment"),
						onDeleteRecordCallback: function() {
							var postToDeleteId = this.get("Id");
							if (this.Ext.isEmpty(this.get("Parent"))) {
								var posts = scope.get("SocialMessages");
								posts.removeByKey(postToDeleteId);
							} else {
								var comments = scope.get("Comments");
								var loadedComments = scope.get("LoadedComments");
								var loadedCommentsCount = loadedComments.getCount();
								loadedComments.removeByKey(postToDeleteId);
								comments.removeByKey(postToDeleteId);
								scope.set("CommentCount", --loadedCommentsCount);
								scope.set("LoadedCommentCount", loadedCommentsCount);
								if (loadedCommentsCount - 1 >= 0) {
									loadedComments.getItems()[--loadedCommentsCount].set("isLast", true);
								}
							}
						}
					}, function(item) {
						MaskHelper.HideBodyMask();
						callback.call(scope, item);
					}, this);
					var config = {
						id: result.id,
						message: data.message
					};
					this.addSocialMention(config);
				}, scope);
			},

			/**
			 * Загружает сообщения/комментарии.
			 * @private
			 * @param {Object} config
			 * @param {Function} callback
			 * @param {Object} scope
			 */
			loadSocialMessages: function(config, callback, scope) {
				var esq = this.getSocialMessageEsq(config);
				var id = config.id;
				if (!id) {
					var parentId = config.parentId;
					var filters = esq.filters;
					if (parentId) {
						filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "Parent", parentId));
					} else {
						filters.addItem(this.Terrasoft.createIsNullFilter(
								this.Ext.create("Terrasoft.ColumnExpression", {columnPath: "Parent"})
						));
					}
					var sortDirection = config.sortDirection || Terrasoft.OrderDirection.DESC;
					var sortColumnLastValue = this.get("sortColumnLastValue");
					var sortColumnName = config.sortColumnName;
					if (sortColumnLastValue) {
						filters.addItem(this.Terrasoft.createColumnFilterWithParameter(
										sortDirection === this.Terrasoft.OrderDirection.DESC
										? this.Terrasoft.ComparisonType.LESS
										: this.Terrasoft.ComparisonType.GREATER,
								sortColumnName, sortColumnLastValue));
					}
					var esqConfig = config.esqConfig;
					if (esqConfig && esqConfig.filter) { // фильтр по текущему каналу (если лента загружается из страницы канала)
						this.set("channelFilter", esqConfig.filter);
						filters.add(esqConfig.filter);
					} else if (!config.parentId) { // проверка, загружаем сообщения или комментарии
						var filterGroup = this.Ext.create("Terrasoft.FilterGroup");
						filterGroup.logicalOperation = this.Terrasoft.LogicalOperatorType.OR;
						// фильтр сообщений, опубликованных в ленте контакта текущего пользователя
						filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
								this.Terrasoft.ComparisonType.EQUAL, "EntityId", this.Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
						filterGroup.addItem(this.getCurrentUserPostsFilter());
						filters.addItem(filterGroup);
					}
					esq.getEntityCollection(function(result) {
						if (result.success) {
							var collection = result.collection;
							if (collection.getCount() > 0) {
								var lastItemIndex = collection.getCount() - 1;
								var lastItem = collection.getByIndex(lastItemIndex);
								this.set("sortColumnLastValue", lastItem.get(sortColumnName));
								var likesCollection = new this.Terrasoft.Collection();
								var socialLikeEsq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
									rootSchemaName: "SocialLike"
								});
								socialLikeEsq.addColumn("SocialMessage");
								socialLikeEsq.filters.add("socialMessagesFilter",
										this.Terrasoft.createColumnInFilterWithParameters("SocialMessage", collection.getKeys()));
								socialLikeEsq.filters.add("currentUserFilter",
										this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL, "User",
												this.Terrasoft.SysValue.CURRENT_USER.value));
								socialLikeEsq.getEntityCollection(function(likes) {
									if (likes.collection.getCount() > 0) {
										likesCollection = likes.collection;

										collection.each(function(item) {
											var socialMessageId = item.get("Id");
											var existsItem = likesCollection.getItems().some(function(like) {
												return (like.get("SocialMessage").value === socialMessageId);
											});
											item.set("IsLikedMe", existsItem);
										});
									}
								}, this);
								collection.each(function(item) {
									item.init();
									item.set("canDeleteAllMessageComment", config.canDeleteAllMessageComment);
									item.doRemoveFn = config.onDeleteRecordCallback;
								}, this);
							}
							callback.call(scope, collection);
						}
					}, this);
				} else {
					esq.getEntity(id, function(result) {
						if (result.success) {
							var entity = result.entity;
							entity.init();
							entity.doRemoveFn = config.onDeleteRecordCallback;
							entity.set("canDeleteAllMessageComment", config.canDeleteAllMessageComment);
							callback.call(scope, entity);
						}
					}, this);
				}
			},

			/**
			 * Возвращает запрос на сообщение/комментарий по конфигурации.
			 * @param {Object} config Конфигурация запроса.
			 * @return {Terrasoft.EntitySchemaQuery}
			 */
			getSocialMessageEsq: function(config) {
				var rowCount = config.esqConfig ? {rowCount: config.esqConfig.rowCount} : null;
				var options = this.Ext.apply({
					rootSchemaName: "SocialMessage",
					rowViewModelClassName: "Terrasoft.SocialMessageViewModel"
				}, rowCount);
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", options);
				esq.on("createviewmodel", this.createSocialMessage, this);
				var sortColumnName = config.sortColumnName;
				var socialMessageColumnNames = this.get("SocialMessageColumnNames");
				var columnNames = this.Terrasoft.deepClone(socialMessageColumnNames);
				if (!this.Ext.isEmpty(sortColumnName) && columnNames.indexOf(sortColumnName) === -1) {
					columnNames.push(sortColumnName);
				}
				var sortDirection = config.sortDirection || Terrasoft.OrderDirection.DESC;
				this.Terrasoft.each(columnNames, function(columnName) {
					var column = esq.addColumn(columnName);
					if (columnName === sortColumnName) {
						column.orderPosition = 1;
						column.orderDirection = sortDirection;
					}
				});
				esq.addColumn("[SocialChannel:Id:EntityId].Color", "Color");
				if (config.extendedColumns) {
					this.Terrasoft.each(config.extendedColumns, function(item) {
						if (!Ext.isEmpty(item.columnName)) {
							var alias =  Ext.isEmpty(item.columnAlias) ? item.columnName : item.columnAlias;
							esq.addColumn(item.columnName, alias);
						}
					});
				}
				return esq;
			}
		});
	});

