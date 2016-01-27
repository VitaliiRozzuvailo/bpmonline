define("SocialMessageViewModel", ["SocialMessageViewModelResources", "StorageUtilities", "SocialFeedUtilities",
		"SocialMentionUtilities"],
	function(resources, StorageUtilities) {

	/**
	 * @class Terrasoft.configuration.SocialMessageViewModel
	 */
	Ext.define("Terrasoft.model.SocialMessageViewModel", {

		extend: "Terrasoft.BaseViewModel",
		alternateClassName: "Terrasoft.SocialMessageViewModel",

		Ext: null,
		Terrasoft: null,
		sandbox: null,

		mixins: {
			SocialFeedUtilities: "Terrasoft.SocialFeedUtilities",
			SocialMentionUtilities: "Terrasoft.SocialMentionUtilities"
		},

		/**
		 *
		 */
		constructor: function() {
			this.callParent(arguments);
			this.initResources(resources);
		},

		/**
		 * Инициализирует ресуры.
		 * @protected
		 * @param resources
		 */
		initResources: function(resources) {
			resources = resources || {};
			this.Terrasoft.each(resources.localizableStrings, function(value, key) {
				this.set("Resources.Strings." + key, value);
			}, this);
			this.Terrasoft.each(resources.localizableImages, function(value, key) {
				this.set("Resources.Images." + key, value);
			}, this);
		},

		/**
		 *
		 * @param config
		 */
		createViewModel: function(config) {
			var socialMessageConfig = {
				rowConfig: config.rowConfig,
				values: config.rawData,
				Ext: this.Ext,
				Terrasoft: this.Terrasoft,
				sandbox: this.sandbox
			};
			var viewModel = this.Ext.create("Terrasoft.SocialMessageViewModel", socialMessageConfig);
			viewModel.mixins.SocialMentionUtilities.init.call(viewModel);
			config.viewModel = viewModel;
		},

		/**
		 *
		 */
		init: function() {
			this.mixins.SocialFeedUtilities.init.call(this);
			this.mixins.SocialMentionUtilities.init.call(this);

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

			var schemasCollection = this.get("SchemasCollection");
			var entitySchemaUId = this.get("EntitySchemaUId") || Terrasoft.GUID_EMPTY;
			var entityId = this.get("EntityId") || Terrasoft.GUID_EMPTY;
			if (!Terrasoft.isEmptyGUID(entitySchemaUId) && !Terrasoft.isEmptyGUID(entityId)) {
				if (schemasCollection.contains(entitySchemaUId)) {
					var entitySchemaConfig = schemasCollection.get(entitySchemaUId);
					var entitySchemaName = entitySchemaConfig.entitySchemaName;
					var entitySchemaCaption = entitySchemaConfig.entitySchemaCaption;
					this.loadAnyEntity(entitySchemaName, entityId, function(entity) {
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
					esq.filters.add("UId", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "UId", entitySchemaUId));
					StorageUtilities.GetESQResultByKey({
						scope: this,
						key: entitySchemaUId + entityId,
						callback: function(response) {
							if (response.success && response.collection.getCount() === 1) {
								var entitySchema = response.collection.getByIndex(0);
								var entitySchemaName = entitySchema.get("Name");
								this.getEntitySchemaByName(entitySchemaName, function(entitySchemaCaption) {
									var entitySchemaConfig = {
										EntityId: entityId,
										UId: entitySchemaUId,
										Name: entitySchemaName,
										Caption: entitySchemaCaption
									};
									this.setEntity(schemasCollection, entitySchemaConfig);
								}, this);
							}
						},
						esq: esq
					});
				}
			} else {
				this.set("Entity", null);
			}
		},

		/**
		 * Получает схему объекта по ее названию и вызывает callback, передав ему заголовок схемы.
		 * @param  {String} entitySchemaName Название схемы объекта.
		 * @param  {Function} callback Функция обратного вызова.
		 * @param  {Object} scope Контекст выполнения функции обратного вызова.
		 */
		getEntitySchemaByName: function(entitySchemaName, callback, scope) {
			var schema = Terrasoft[entitySchemaName];
			if (schema) {
				callback.call(scope, schema.caption);
			} else {
				Terrasoft.require([entitySchemaName], function(schema) {
					if (schema) {
						callback.call(scope, schema.caption);
					}
				});
			}
		},

		/**
		 * Кеширует название схемы и ее заголовок и устанавливает значение Entity.
		 * @param {Terrasoft.Collection} schemasCollection Коллекция закешированных данных схем.
		 * @param {Object} schemaConfig Конфиг схемы, содержащий название, заголовок, уникальный
		 * идентификатор схемы и значение EntityId.
		 */
		setEntity: function(schemasCollection, schemaConfig) {
			if (!schemasCollection.contains(schemaConfig.UId)) {
				schemasCollection.add(schemaConfig.UId, {
					entitySchemaName: schemaConfig.Name,
					entitySchemaCaption: schemaConfig.Caption
				});
			}
			this.loadAnyEntity(schemaConfig.Name, schemaConfig.EntityId, function(entity) {
				entity.caption = schemaConfig.Caption;
				entity.name = schemaConfig.Name;
				this.set("Entity", entity);
			}, this);
		}

	});

});