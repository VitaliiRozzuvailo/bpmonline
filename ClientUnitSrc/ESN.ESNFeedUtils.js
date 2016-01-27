define("ESNFeedUtils", ["ext-base", "terrasoft", "ESNFeedModuleResources", "NetworkUtilities", "ModalBox",
	"AutosizeModule", "ESNConstants", "FormatUtils", "ServiceHelper"],
		function(Ext, Terrasoft, resources, NetworkUtilities, ModalBox, AutosizeModule, ESNConstants, FormatUtils,
				ServiceHelper) {

	/**
	 * Количество комментариев, загружаемых сразу
	 * @private
	 */
	var initCommentCount = 3;
	var renderContainer;
	var likedUsersArray = [];
	var entityColorSchema = {
		"25d7c1ab-1de0-4501-b402-02e0e5a72d6e": "91C95E",
		"c449d832-a4cc-4b01-b9d5-8a12c42a9f89": "8E8EB7",
		"2f81fa05-11ae-400d-8e07-5ef6a620d1ad": "F49D56",
		"16be3651-8fe2-4159-8dd0-a803d4683dd3": "91C95E",
		"8b33b6b2-19f7-4222-9161-b4054b3fbb09": "EEAF4B",
		"bfb313dd-bb55-4e1b-8e42-3d346e0da7c5": "EEAF4B",
		"0326868c-ce5e-4934-8f1f-178801bfe6c3": "64B8DF",
		"41af89e9-750b-4ebb-8cac-ff39b64841ec": "91C95E",
		"ae46fb87-c02c-4ae8-ad31-a923cdd994cf": "8E8EB7",
		"80294582-06b5-4faa-a85f-3323e5536b71": "EEAF4B",
		"4c7a6ead-4eb8-4fc0-863e-98a664569fed": "8E8EB7",
		"ac2d8e0f-a926-4f76-a1fa-604d5eaaa1d2": "8E8EB7",
		"e6e68ac1-495d-4727-a7a7-9b531ab9f849": "5BC8C4"
	};
	var entityDefaultColorSchema = "64B8DF";

	var ESNSectionSandboxId = "SectionModuleV2_ESNFeedSectionV2_ESNFeed";
	var ESNSandboxId = "ViewModule_SectionModuleV2_ESNFeed";
	var ESNRightPanelSandboxId = "ViewModule_RightSideBarModule_ESNFeedModule";

	/**
	 * Колонки сообщения, которые загружаются
	 * @private
	 */
	var socialMessageColumnNames = [
		"Id",
		"CreatedBy",
		"CreatedOn",
		"Message",
		"EntitySchemaUId",
		"EntityId",
		"Parent",
		"LikeCount",
		"CommentCount"
	];

	/**
	 * Коллеция, в которой кэшируются имена схем по UId
	 * @private
	 */
	var schemasCollection = new Terrasoft.Collection();

	var currentEditingComment = null;

	/**
	 * Загружает сообщения/комментарии
	 */
	function loadSocialMessages(config, callback, scope) {
		var rowCount = config.esqConfig ? {rowCount: config.esqConfig.rowCount} : null;
		var options = Ext.apply({
			rootSchemaName: "SocialMessage",
			rowViewModelClassName: "Terrasoft.SocialMessageViewModel"
		}, rowCount);
		var esq = Ext.create("Terrasoft.EntitySchemaQuery",
			options
		);
		esq.on("createviewmodel", this.createViewModel, this);
		var sortColumnName = config.sortColumnName;
		var columnNames = Terrasoft.deepClone(socialMessageColumnNames);
		if (!Ext.isEmpty(sortColumnName) && columnNames.indexOf(sortColumnName) === -1) {
			columnNames.push(sortColumnName);
		}
		var sortDirection = config.sortDirection || Terrasoft.OrderDirection.DESC;
		Terrasoft.each(columnNames, function(columnName) {
			var column = esq.addColumn(columnName);
			if (columnName === sortColumnName) {
				column.orderPosition = 1;
				column.orderDirection = sortDirection;
			}
		});
		var id = config.id || Terrasoft.GUID_EMPTY;
		if (Terrasoft.isEmptyGUID(id)) {
			var parentId =  config.parentId;
			var filters = esq.filters;
			if (parentId) {
				filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Parent",
					parentId));
			} else {
				filters.addItem(Terrasoft.createIsNullFilter(Ext.create("Terrasoft.ColumnExpression", {
					columnPath: "Parent"
				})));
			}
			var sortColumnLastValue = this.get("sortColumnLastValue");
			if (sortColumnLastValue) {
				filters.addItem(Terrasoft.createColumnFilterWithParameter(
					sortDirection === Terrasoft.OrderDirection.DESC
						? Terrasoft.ComparisonType.LESS
						: Terrasoft.ComparisonType.GREATER,
					sortColumnName, sortColumnLastValue));
			}
			var esqConfig = config.esqConfig;
			if (esqConfig && esqConfig.filter) { // фильтр по текущему каналу (если лента загружается из страницы канала)
				this.set("channelFilter", esqConfig.filter);
				filters.add(esqConfig.filter);
			} else if (!config.parentId) { // проверка, загружаем сообщения или комментарии
				var filterGroup = Ext.create("Terrasoft.FilterGroup");
				filterGroup.logicalOperation = Terrasoft.LogicalOperatorType.OR;
				// фильтр сообщений, опубликованных в ленте контакта текущего пользователя
				filterGroup.addItem(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "EntityId", Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
				filterGroup.addItem(getCurrentUserPostsFilter());
				filters.addItem(filterGroup);
			}
			esq.getEntityCollection(function(result) {
				if (result.success) {
					var collection = result.collection;
					if (collection.getCount() > 0) {
						var lastItemIndex = collection.getCount() - 1;
						var lastItem = collection.getByIndex(lastItemIndex);
						this.set("sortColumnLastValue", lastItem.get(sortColumnName));

						var likesCollection = new Terrasoft.Collection();
						var socialLikeEsq = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "SocialLike"
						});
						socialLikeEsq.addColumn("SocialMessage");
						socialLikeEsq.filters.add("socialMessagesFilter",
							Terrasoft.createColumnInFilterWithParameters("SocialMessage", collection.getKeys()));
						socialLikeEsq.filters.add("currentUserFilter",
							Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "User",
								Terrasoft.SysValue.CURRENT_USER.value));
						socialLikeEsq.getEntityCollection(function(likes) {
							if (likes.collection.getCount() > 0) {
								likesCollection = likes.collection;

								collection.each(function(item) {
									var socialMessageId = item.get("Id");
									var existsItem = likesCollection.getItems().some(function(like) {
										return like.get("SocialMessage").value === socialMessageId;
									});
									item.set("IsLikedMe", existsItem);
								});
							}
						}, this);

						collection.each(function(item) {
							decorateItem.call(item, config.sandbox);
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
					decorateItem.call(result.entity, config.sandbox);
					result.entity.doRemoveFn = config.onDeleteRecordCallback;
					result.entity.set("canDeleteAllMessageComment", config.canDeleteAllMessageComment);
					callback.call(scope, result.entity);
				}
			}, this);
		}
	}

	/**
	 * Возвращает группу фильтров сообщений каналов, на которые подписан текущий пользователь или группы,
	 * в которые он входит с учетом отписок.
	 * @private
	 * @return {Terrasoft.FilterGroup} Группа фильтров сообщений каналов.
	 */
	function getCurrentUserPostsFilter() {
		var filterGroup = Ext.create("Terrasoft.FilterGroup");
		var currentUserId = Terrasoft.SysValue.CURRENT_USER.value;
		var socialSubscriptionPath = "[SocialSubscription:EntityId:EntityId]." +
			"[SysAdminUnitInRole:SysAdminUnitRoleId:SysAdminUnit].SysAdminUnit";
		var socialSubscription = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
			socialSubscriptionPath, currentUserId);
		filterGroup.addItem(socialSubscription);
		var subFilterGroup = Ext.create("Terrasoft.FilterGroup");
		var socialUnsubscriptionPath = "[SocialUnsubscription:EntityId:EntityId].SysAdminUnit";
		var subFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
			socialUnsubscriptionPath, currentUserId);
		subFilterGroup.addItem(subFilter);
		var existsFilter = Terrasoft.createNotExistsFilter(socialUnsubscriptionPath, subFilterGroup);
		filterGroup.addItem(existsFilter);
		return filterGroup;
	}

	/**
	 * Функция добавляет сообщение/комментарий
	 */
	function insertSocialMessage(data, callback, scope) {
		var insert = Ext.create("Terrasoft.InsertQuery", {
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
			if (result.success) {
				loadSocialMessages.call(this, {
					id: result.id,
					sandbox: data.sandbox,
					canDeleteAllMessageComment: scope.get("canDeleteAllMessageComment"),
					onDeleteRecordCallback: function() {
						var postToDeleteId = this.get("Id");
						if (Ext.isEmpty(this.get("Parent"))) {
							var posts = scope.get("posts");
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
					callback.call(scope, item);
				}, this);
			}
		}, scope);
	}

	/**
	 * Функция декорирует модель функциями.
	 */
	function decorateItem(sandbox) {
		this.getCreatedByText = getCreatedByText;
		this.getCreatedByImage = getCreatedByImage;
		this.getCreatedByImageVisible = getCreatedByImageVisible;
		this.onCreateByClick = onCreateByClick;
		this.getCreatedOnText = getCreatedOnText;

		this.getEntityText = getEntityText;
		this.getCreatedToLabel = getCreatedToLabel;
		this.getEntityImage = getEntityImage;
		this.getEntityContainerVisible = getEntityContainerVisible;
		this.getCreatedToLabelVisible = getCreatedToLabelVisible;
		this.getCreatedToLabelHidden = getCreatedToLabelHidden;
		this.getEntityImageVisible = getEntityImageVisible;
		this.getEntityTextVisible = getEntityTextVisible;
		this.getRightPanelPublishButtonVisible = getRightPanelPublishButtonVisible;
		this.onEntityClick = onEntityClick;

		this.getMessage = getMessage;
		this.getEntityColor = getEntityColor;

		this.getShowCommentsText = getShowCommentsText;
		this.getHideCommentsText = getHideCommentsText;
		this.getShowCommentsVisible = getShowCommentsVisible;
		this.getHideCommentsVisible = getHideCommentsVisible;
		this.onShowCommentsClick = onShowCommentsClick;
		this.onHideCommentsClick = onHideCommentsClick;

		this.getPostCommentEditVisible = getPostCommentEditVisible;
		this.getPostCommentDeleteVisible = getPostCommentDeleteVisible;
		this.onPostCommentEditClick = onPostCommentEditClick;
		this.onPostCommentDeleteClick = onPostCommentDeleteClick;
		this.onCommentPublishClick = onCommentPublishClick;
		this.onCancelClick = onCancelClick;
		this.onKeyUp = onKeyUp;
		this.onNewCommentContainerFocus = onNewCommentContainerFocus;
		this.onNewCommentContainerBlur = onNewCommentContainerBlur;
		this.onCommentToEditContainerFocus = onCommentToEditContainerFocus;
		this.onCommentToEditContainerBlur = onCommentToEditContainerBlur;
		this.onEditedCommentContainerFocus = onEditedCommentContainerFocus;
		this.onEditedCommentContainerBlur = onEditedCommentContainerBlur;

		this.getLikeText = getLikeText;
		this.getLikeImage = getLikeImage;
		this.getLikeCaption = getLikeCaption;
		this.onLikeClick = onLikeClick;
		this.onShowLikedUsers = onShowLikedUsers;
		this.getLikeTextVisible = getLikeTextVisible;

		this.sandbox = sandbox;

		this.set("isCommentInEditMode", false);
		this.set("Comments", Ext.create("Terrasoft.BaseViewModelCollection"));
		this.set("LoadedComments", Ext.create("Terrasoft.BaseViewModelCollection"));
		this.set("LoadedCommentCount", 0);
		this.set("Visible", false);
		this.set("CommentsExpanded", false);
		this.set("LikeTextVisible", true);
		this.set("LikeImageVisible", true);
		this.set("EditCommentVisible", false);
		this.set("CommentVisible", true);
		this.set("ActionsContainerVisible", true);
		this.set("PublishContainerVisible", false);
		this.set("CommentToEditContainerVisible", false);
		this.set("NewCommentButtonsVisible", false);
		this.set("CommentToEditButtonsVisible", false);
		this.set("EditedCommentContainerVisible", false);

		var entitySchemaUId = this.get("EntitySchemaUId") || Terrasoft.GUID_EMPTY;
		var entityId = this.get("EntityId") || Terrasoft.GUID_EMPTY;
		if (!Terrasoft.isEmptyGUID(entitySchemaUId) && !Terrasoft.isEmptyGUID(entityId)) {
			if (schemasCollection.contains(entitySchemaUId)) {
				var entitySchemaConfig = schemasCollection.get(entitySchemaUId);
				var entitySchemaName = entitySchemaConfig.entitySchemaName;
				var entitySchemaCaption = entitySchemaConfig.entitySchemaCaption;
				loadAnyEntity.call(this, entitySchemaName, entityId, function(entity) {
					entity.caption = entitySchemaCaption;
					entity.name = entitySchemaName;
					this.set("Entity", entity);
				}, this);
			} else {
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "SysSchema",
					rowCount: 1
				});
				esq.addColumn("Name");
				esq.addColumn("Caption");
				esq.filters.add("UId", Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "UId", entitySchemaUId));
				esq.getEntityCollection(function(response) {
					if (response.success && response.collection.getCount() === 1) {
						var entitySchema = response.collection.getByIndex(0);
						var entitySchemaName = entitySchema.get("Name");
						var entitySchemaCaption = entitySchema.get("Caption");
						if (!schemasCollection.contains(entitySchemaUId)) {
							schemasCollection.add(entitySchemaUId, {
								entitySchemaName: entitySchemaName,
								entitySchemaCaption: entitySchemaCaption
							});
						}
						loadAnyEntity.call(this, entitySchemaName, entityId, function(entity) {
							entity.caption = entitySchemaCaption;
							entity.name = entitySchemaName;
							this.set("Entity", entity);
						}, this);
					}
				}, this);
			}
		} else {
			this.set("Entity", null);
		}
	}

	function getPrimaryImageValue(entity, entitySchemaName, callback, scope) {
		var moduleStructure = Terrasoft.configuration.ModuleStructure[entitySchemaName];
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
	}

	/**
	 * Функция загружает произвольную запись
	 */
	function loadAnyEntity(entitySchemaName, entityId, callback, scope) {
		if (entitySchemaName) {
			var hasPrimaryImageColumn = true;
			var entitySchemaUId = this.get("EntitySchemaUId");
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: entitySchemaName
			});
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
						displayValue: entity.get("displayValue")
					};
					if (!hasPrimaryImageColumn) {
						getPrimaryImageValue.call(this, entity, entitySchemaName, callback, scope);
					} else {
						entity.primaryImageValue = result.entity.get("primaryImageValue");
						callback.call(scope, entity);
					}
				}
			}, this);
		}
	}

	/**
	 * Функция формирует ссылку на изображение
	 * @private
	 */
	function getImageSrc(imageId) {
		if (!imageId) {
			return null;
		}
		return Terrasoft.ImageUrlBuilder.getUrl({
			source: Terrasoft.ImageSources.ENTITY_COLUMN,
			params: {
				schemaName: "SysImage",
				columnName: "Data",
				primaryColumnValue: imageId
			}
		});
	}

	/**
	 * Функция возвращает значение отображаемой колонки сущности
	 * @private
	 */
	function getDisplayValue(entity) {
		return entity ? entity.displayValue : null;
	}
	/**
	 * Функция возвращает идентификатор изображения сущности
	 * @private
	 */
	function getImageValue(entity) {
		var imageValue = null;
		if (entity) {
			var image = entity.primaryImageValue || entity.Image;
			if (Ext.isObject(image) || Terrasoft.isGUID(image)) {
				imageValue = image.value || image;
			} else {
				return Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.DefaultCreatedBy);
			}
		}
		return getImageSrc(imageValue);
	}

	/**
	 * Функция возвращает имя автора
	 * @private
	 */
	function getCreatedByText() {
		return getDisplayValue(this.get("CreatedBy"));
	}

	/**
	 * Функция возвращает изображение автора
	 * @private
	 */
	function getCreatedByImage() {
		return getImageValue(this.get("CreatedBy"));
	}

	/**
	 * Функция возвращает видимость изображения автора
	 * @private
	 */
	function getCreatedByImageVisible() {
		return getCreatedByImage.call(this) !== null;
	}

	/**
	 * Обработчик клика на label-гиперссылку автора
	 */
	function onCreateByClick() {
		onUrlClick.call(this, "Contact", this.get("CreatedBy"));
	}

	/**
	 * Функция возвращает дату создания
	 * @private
	 */
	function getCreatedOnText() {
		return FormatUtils.smartFormatDate(this.get("CreatedOn"));
	}

	/**
	 * Функция возвращает название сущности, с которой связано сообщение (канал, договор, ...)
	 * @private
	 */
	function getEntityText() {
		return getDisplayValue(this.get("Entity"));
	}

	function getCreatedToLabel() {
		var resultTemplate = "{0} {1}";
		var createdByToEntity = resources.localizableStrings.CreatedByToEntity;
		var createdBy = resources.localizableStrings.CreatedBy;
		var entity = this.get("Entity");
		var entityCaption = entity ? entity.caption : "";
		return Ext.isEmpty(entityCaption)
			? createdBy
			: Ext.String.format(resultTemplate, createdByToEntity, entityCaption.toLowerCase());
	}

	/**
	 * Функция возвращает изображение сущности, с которой связано сообщение (канал, договор, ...)
	 * @private
	 */
	function getEntityImage() {
		var entity = this.get("Entity");
		var imageValue = null;
		var image = entity ? entity.primaryImageValue || entity.Image : null;
		if (Ext.isObject(image) || Terrasoft.isGUID(image)) {
			imageValue = image.value || image;
		}
		return imageValue ? getImageValue(entity) :
			Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.NoChannel);
	}

	/**
	 * Возвращает видимость сущности
	 */
	function getEntityContainerVisible() {
		if (this.sandbox.id === ESNSectionSandboxId || this.sandbox.id === ESNRightPanelSandboxId ||
			this.sandbox.id === ESNSandboxId) {
			return true;
		}
		return false;
	}

	function getCreatedToLabelVisible() {
		if (this.sandbox.id === ESNSectionSandboxId || this.sandbox.id === ESNSandboxId) {
			return true;
		}
		return false;
	}

	function getCreatedToLabelHidden() {
		return !this.getCreatedToLabelVisible();
	}

	/**
	 * Функция возвращает видимость изображение сущности
	 * @private
	 */
	function getEntityImageVisible() {
		return getEntityImage.call(this) !== null;
	}

	/**
	 * Возвращает видимость названия сущности
	 * @returns {boolean}
	 */
	function getEntityTextVisible() {
		if (this.sandbox.id !== ESNRightPanelSandboxId) {
			return true;
		}
		return false;
	}

	function getRightPanelPublishButtonVisible() {
		return !getEntityTextVisible();
	}

	/**
	 * Обработчик клика на label-гиперссылку сущности
	 */
	function onEntityClick() {
		var entityId = this.get("EntityId");
		var entitySchemaConfig = schemasCollection.get(this.get("EntitySchemaUId"));
		var entitySchemaName = entitySchemaConfig.entitySchemaName;
		var moduleStructure = Terrasoft.configuration.ModuleStructure[entitySchemaName];
		var attribute = moduleStructure && moduleStructure.attribute ? moduleStructure.attribute : null;
		var typeId = null;
		if (attribute) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: entitySchemaName
			});
			select.addColumn("Id");
			select.addColumn(attribute);
			select.getEntity(entityId, function(result) {
				if (result && result.success) {
					var entity = result.entity;
					typeId = entity.get(attribute).value;
					onUrlClick.call(this, entitySchemaName, this.get("Entity"), typeId);
				}
			}, this);
		} else {
			onUrlClick.call(this, entitySchemaName, this.get("Entity"));
		}
	}

	/**
	 * Сопоставляет идентификатор схемы с предустановленным цветом и возвращает по его значению сооютветствующий.
	 * Если цвет небыл найден или не передан идентификатор схемы - возвращается цвет по умолчанию.
	 * @param {String} entitySchemaUId идентификатор схемы
	 * @returns {String}
	 */
	function getEntityColor(entitySchemaUId) {
		var color = entityDefaultColorSchema;
		if (Ext.isEmpty(entitySchemaUId)) {
			return color;
		}
		if (entityColorSchema.hasOwnProperty(entitySchemaUId)) {
			return entityColorSchema[entitySchemaUId];
		} else {
			return color;
		}
	}

	function getMessage() {
		return this.get("Message") + "<br>asdasdasd";
	}

	function getHideCommentsText() {
		var isRightPanel = this.sandbox.id === ESNRightPanelSandboxId;
		return isRightPanel ?  resources.localizableStrings.HideCommentsShort :
			resources.localizableStrings.HideComments;
	}

	/**
	 * Функция возвращает текст кнопки загрузки комментариев
	 * @private
	 */
	function getShowCommentsText() {
		var isRightPanel = this.sandbox.id === ESNRightPanelSandboxId;
		var commentsExpanded = this.get("CommentsExpanded");
		var commentCount = this.get("CommentCount");
		var loadedCommentCount = this.get("LoadedCommentCount");
		var text = "";
		if (commentsExpanded === true) {
			text = isRightPanel ?  Ext.String.format(resources.localizableStrings.ShowCommentsShort,
				commentCount - loadedCommentCount) : Ext.String.format(resources.localizableStrings.ShowComments,
				commentCount - loadedCommentCount);
			return text;
		} else {
			if (commentCount > 0) {
				return Ext.String.format("{0} ({1})", resources.localizableStrings.Comments, commentCount);
			} else {
				return resources.localizableStrings.Comments;
			}
		}

	}

	/**
	 * Функция возвращает видимость кнопки загрузки комментариев
	 * @private
	 */
	function getShowCommentsVisible() {
		return this.get("CommentsExpanded") === false ||
			(this.get("LoadedCommentCount") < this.get("CommentCount"));
	}

	/**
	 * Функция возвращает видимость кнопки скрытия комментариев
	 * @private
	 */
	function getHideCommentsVisible() {
		return this.get("CommentsExpanded");
	}

	/**
	 * Обработчик нажатия кнопки показа комментариев
	 * @private
	 */
	function onShowCommentsClick() {
		var scope = this;
		var oldCommentsExpanded = this.get("CommentsExpanded");
		var loadedComments = this.get("LoadedComments");
		var comments = this.get("Comments");
		var commentCount = comments.getCount();

		var loadCallback = function() {
			loadedComments.clear();
			var startIndex = oldCommentsExpanded ? 0  : commentCount - initCommentCount;
			if (startIndex < 0) {
				startIndex = 0;
			}
			for (var i = startIndex; i < commentCount; i++) {
				var item = comments.getByIndex(i);
				loadedComments.add(item.get("Id"), item);
				item.set("viewModel", scope);
				if (i === commentCount - 1) {
					item.set("isLast", true);
				} else {
					item.set("isLast", false);
				}
			}
			this.set("LoadedCommentCount", loadedComments.getCount());
			this.set("CommentsExpanded", true);
			this.set("CommentPublishContainerVisible", true);
		};
		if (commentCount === 0) {
			var viewModel = this;
			loadSocialMessages.call(this, {
				sortColumnName: "CreatedOn",
				parentId: this.get("Id"),
				sortDirection: Terrasoft.OrderDirection.ASC,
				sandbox: this.sandbox,
				canDeleteAllMessageComment: scope.get("canDeleteAllMessageComment"),
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
			}, function(items) {
				comments.loadAll(items);
				commentCount = comments.getCount();
				this.set("CommentCount", commentCount);
				loadCallback.call(this);
			}, this);
		} else {
			loadCallback.call(this);
		}
	}

	/**
	 * Обработчик нажатия кнопки скртыия комментариев
	 * @private
	 */
	function onHideCommentsClick() {
		this.set("CommentsExpanded", false);
		this.get("LoadedComments").clear();
		this.set("LoadedCommentCount", 0);
		this.set("NewCommentButtonsVisible", false);
	}

	/**
	 * Возвращает видимость кнопки редактирования сообщения/комментария
	 * @private
	 */
	function getPostCommentEditVisible() {
		return getPostCommentEditDeleteVisible.call(this);
	}

	function getPostCommentEditDeleteVisible() {
		var visible = false;
		if (this.get("EditCommentVisible")) {
			return visible;
		}
		if (this.get("CreatedBy").value === Terrasoft.SysValue.CURRENT_USER_CONTACT.value) {
			visible = true;
		}
		return visible;
	}

	/**
	 * Функция возвращает видимость кнопки удаления сообщения/комментария
	 * @private
	 */
	function getPostCommentDeleteVisible() {
		var result = getPostCommentEditDeleteVisible.call(this);
		if (!result) {
			return this.get("canDeleteAllMessageComment");
		}
		return result;
	}

	/**
	 * Обработчик нажатия кнопки редактирования сообщения/комментария
	 * @private
	 */
	function onPostCommentEditClick() {
		var viewModel = this.get("viewModel") || this;
		if (currentEditingComment) {
			changeVisible.call(currentEditingComment);
		}
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
	}

	/**
	 * Обработчик нажатия кнопки удаления сообщения/комментария
	 * @private
	 */
	function onPostCommentDeleteClick() {
		ServiceHelper.callService("ESNFeedModuleService", "DeletePostComment", function() {
			this.doRemoveFn.call(this);
		}, {
			postCommentId: this.get("Id"),
			parentPostId: this.get("Parent").value
		}, this);
	}

	function changeVisible(post) {
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
			onHideCommentsClick.call(parentPost);
		}
		if (post) {
			post.set("CommentPublishContainerVisible", true);
		}
	}

	/**
	 * Обработчик нажатия кнопки отправки сообщения
	 * @private
	 */
	function onEditCommentPublishClick() {
		var post = this.get("viewModel");
		var editedMessage = this.get("commentMessage") || this.get("editedCommentMessage");
		if (editedMessage === this.get("Message")) {
			changeVisible.call(this, post);
			currentEditingComment = null;
			return;
		} else {
			ServiceHelper.callService("ESNFeedModuleService", "UpdatePostComment", function() {
				this.set("Message", editedMessage);
				changeVisible.call(this, post);
				currentEditingComment = null;
			}, {
				editedMessage: editedMessage,
				postMessageId: this.get("Id")
			}, this);
		}
	}

	/**
	 *
	 * @param {Object} e
	 */
	function onKeyUp(e) {
		if (e && (e.keyCode === 10 || e.keyCode === 13) && e.ctrlKey) {
			onCommentPublishClick.call(this);
		}
	}

	function onNewCommentContainerFocus() {
		this.set("NewCommentButtonsVisible", true);
	}

	function onNewCommentContainerBlur() {
		var me = this;
		setTimeout(function() {
			if (me.get("commentMessage") === "") {
				me.set("NewCommentButtonsVisible", false);
			}
		}, 100);
	}

	function onCommentToEditContainerFocus() {
		this.set("CommentToEditButtonsVisible", true);
	}

	function onCommentToEditContainerBlur() {
		var me = this;
		setTimeout(function() {
			if (me.get("commentMessage") === "") {
				me.set("CommentToEditButtonsVisible", false);
			}
		}, 100);
	}

	function onEditedCommentContainerFocus() {
		this.set("EditedCommentContainerVisible", true);
	}

	function onEditedCommentContainerBlur() {
		var me = this;
		setTimeout(function() {
			if (me.get("editedCommentMessage") === "") {
				me.set("EditedCommentContainerVisible", false);
			}
		}, 100);
	}

	/**
	 * Обработчик кнопки отмены редактирования поста
	 */
	function onCancelClick() {
		this.set("editedCommentMessage", "");
		this.set("commentMessage", "");
		var post = this.get("viewModel");
		changeVisible.call(this, post);
	}

	/**
	 * Обработчик нажатия на отправки сообщения
	 * @private
	 */
	function onCommentPublishClick() {
		if (this.get("isCommentInEditMode")) {
			onEditCommentPublishClick.call(this);
			return;
		}
		var message = this.get("commentMessage");
		if (Ext.isEmpty(message) || message.length === 0) {
			return;
		}
		var post = {
			parentId: this.get("Id"),
			message: message,
			sandbox: this.sandbox
		};
		insertSocialMessage(post, function(item) {
			var loadedComments = this.get("LoadedComments");
			Terrasoft.each(loadedComments.getItems(), function(comment) {
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
	}

	/**
	 * Обработчик клика на label-гиперссылку
	 */
	function onUrlClick(entitySchemaName, entity, entityTypeUId) {
		if (Ext.isEmpty(entity)) {
			return;
		}
		var hash = NetworkUtilities.getEntityUrl(entitySchemaName, entity.value, entityTypeUId);
		this.sandbox.publish("PushHistoryState", {hash: hash});
	}

	/**
	 * Функция возвращает текст кнопки лайка
	 * @private
	 */
	function getLikeText() {
		var likeCount = this.get("LikeCount");
		return (likeCount === 0) ? "" : Ext.String.format("{0}", likeCount);
	}

	/**
	 * Функция возвращает подпись для кнопки лайка
	 * @private
	 */
	function getLikeCaption() {
		var isLikedMe = this.get("IsLikedMe");
		var caption = resources.localizableStrings.LikeButtonCaption;
		if (isLikedMe) {
			caption = resources.localizableStrings.UnLikeButtonCaption;
		}
		return caption;
	}

	/**
	 * Функция возвращает видимость элемента с числом лайков
	 * @returns {boolean}
	 */
	function getLikeTextVisible() {
		if (this.get("EditCommentVisible")) {
			return false;
		}
		return this.get("LikeCount") > 0;
	}

	/**
	 * Функция возвращает изображение лайка
	 * @private
	 */
	function getLikeImage() {
		var isLikedMe = this.get("IsLikedMe");
		return {
			source: Terrasoft.ImageSources.URL,
			url: Terrasoft.ImageUrlBuilder.getUrl(isLikedMe
				? resources.localizableImages.Liked
				: resources.localizableImages.Like)
		};
	}

	/**
	 * Функция обновляет количество лайков
	 */
	function updateLikeCount() {
		var isLikedMe = this.get("IsLikedMe");
		var likeCount = this.get("LikeCount") + (!isLikedMe ? 1 : -1);
		this.set("IsLikedMe", !isLikedMe);
		this.set("LikeCount", likeCount);
	}

	/**
	 * Функция вставляет новую запись в таблицу лайков
	 */
	function insertLike(callback, scope) {
		var socialMessageId = scope.get("Id");
		var insert = Ext.create("Terrasoft.InsertQuery", {
			rootSchemaName: "SocialLike"
		});
		insert.setParameterValue("User", Terrasoft.SysValue.CURRENT_USER.value, Terrasoft.DataValueType.GUID);
		insert.setParameterValue("SocialMessage", socialMessageId, Terrasoft.DataValueType.GUID);
		insert.execute(function() {
			if (callback) {
				callback.call(scope);
			}
		}, scope);
	}

	/**
	 * Функция удаляет запись из таблицы лайков
	 */
	function deleteLike(callback, scope) {
		var deleteQuery = Ext.create("Terrasoft.DeleteQuery", {
			rootSchemaName: "SocialLike"
		});
		var userIdFilter = Terrasoft.createColumnFilterWithParameter(
			Terrasoft.ComparisonType.EQUAL, "User", Terrasoft.SysValue.CURRENT_USER.value);
		var entityIdFilter = Terrasoft.createColumnFilterWithParameter(
			Terrasoft.ComparisonType.EQUAL, "SocialMessage", scope.get("Id"));
		deleteQuery.filters.add("userIdFilter", userIdFilter);
		deleteQuery.filters.add("entityIdFilter", entityIdFilter);
		deleteQuery.execute(function(responce) {
			if (responce.success && callback) {
				callback.call(scope);
			}
		}, this);
	}

	/**
	 * Обработчик события нажатия на лайк
	 */
	function onLikeClick() {
		var isLikedMe = this.get("IsLikedMe");
		if (!isLikedMe || Ext.isEmpty(isLikedMe)) {
			insertLike(updateLikeCount, this);
		} else {
			deleteLike(updateLikeCount, this);
		}
	}

	/**
	 * Обработчик события нажатия на количество лайков
	 */
	function onShowLikedUsers() {
		var likes = this.get("LikeCount");
		if (!likes) {
			return;
		}
		var selectedMessage = this.get("Id");
		renderContainer = ModalBox.show(ESNConstants.LikedUsersModalBoxConfig);
		var likedUsersView = getLikedUsersView();
		var likedUsersViewModel = getLikedUsersViewModel();
		likedUsersViewModel.sandbox = this.sandbox;
		likedUsersViewModel.loadLikedUsers(selectedMessage);
		likedUsersView.bind(likedUsersViewModel);
		likedUsersView.render(renderContainer);

		var fixedView = getModalBoxTopView();
		fixedView.bind(likedUsersViewModel);
		fixedView.render(ModalBox.getFixedBox());

		ModalBox.setSize(400, 400);
	}

	/**
	 * Функция возвращает View модального окна
	 */
	function getLikedUsersView() {
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
		return Ext.create("Terrasoft.Container", viewConfig);
	}

	/**
	 * Функция возвращает ViewModel модального окна
	 */
	function getLikedUsersViewModel() {
		var config = {
			values: {
				getLikedUsersContainerVisible: true
			},
			methods: {
				onLikedUserClick: function(tag) {
					ModalBox.close();
					onUrlClick.call(this, "Contact", tag);
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
						var imageSrc = getImageValue(likedUser);
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
		return Ext.create("Terrasoft.BaseViewModel", config);
	}

	function getModalBoxTopView() {
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
		return Ext.create("Terrasoft.Container", viewConfig);
	}

	return {
		loadSocialMessages: loadSocialMessages,
		insertSocialMessage: insertSocialMessage,
		getDisplayValue: getDisplayValue,
		getImageValue: getImageValue,
		getEntityColor: getEntityColor
	};
});
