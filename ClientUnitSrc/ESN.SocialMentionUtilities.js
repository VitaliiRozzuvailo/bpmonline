define("SocialMentionUtilities", ["Contact", "NetworkUtilities"], function(Contact, NetworkUtilities) {

	/**
	 * @class Terrasoft.configuration.SocialMentionUtilities
	 */
	Ext.define("Terrasoft.configuration.mixins.SocialMentionUtilities", {
		alternateClassName: "Terrasoft.SocialMentionUtilities",

		/**
		 *
		 */
		init: function() {
			var entitiesList = this.Ext.create("Terrasoft.Collection");
			this.set("entitiesList", entitiesList);
		},

		/**
		 * Наполняет выподающий список сущностей при написании сообщения.
		 * @param {String} filterValue
		 * @param {Terrasoft.Collection} list
		 */
		prepareEntitiesExpandableList: function(filterValue, list) {
			this.getEntities(filterValue, function(entities) {
				var result = this.prepareEntities(entities);
				list.clear();
				list.loadAll(result);
			}, this);
		},

		/**
		 * Подгатавливает сущности для загрузки в выпадаюший список.
		 * @private
		 * @param {Terrasoft.Collection} entities
		 * @return {Object} Сущности для загрузки в выпадаюший список.
		 */
		prepareEntities: function(entities) {
			var result = {};
			entities.each(function(entity) {
				var primaryColumnValue = entity.get("value");
				result[primaryColumnValue] = this.prepareEntity(entity);
			}, this);
			return result;
		},

		/**
		 * Подгатавливает сущность для загрузки в выпадаюший список.
		 * @private
		 * @param {Terrasoft.BaseViewModel} entity
		 * @return {Object} Сущность для загрузки в выпадаюший список.
		 */
		prepareEntity: function(entity) {
			var value = entity.get("value");
			var displayValue = entity.get("displayValue");
			var primaryImageColumn = entity.get("primaryImageColumn");
			var primaryImageColumnValue = primaryImageColumn.value;
			var secondaryInfo = entity.get("secondaryInfo");
			var link = this.getEntityLink(entity);
			var imageSrc;
			var imageUrlBuilder = this.Terrasoft.ImageUrlBuilder;
			var imageConfig;
			if (primaryImageColumnValue) {
				imageConfig = {
					source: this.Terrasoft.ImageSources.SYS_IMAGE,
					params: {
						primaryColumnValue: primaryImageColumnValue
					}
				};
			} else {
				imageConfig = this.get("Resources.Images.DefaultCreatedBy");
			}
			imageSrc = imageUrlBuilder.getUrl(imageConfig);
			return {
				value: value,
				displayValue: displayValue,
				primaryInfo: displayValue,
				secondaryInfo: secondaryInfo,
				imageSrc: imageSrc,
				link: link
			};
		},

		/**
		 * Обрабатывает событие отрисовки элемента выпадающего списка сущностей.
		 * @param {Object} item
		 */
		onEntitiesListViewItemRender: function(item) {
			/*jshint quotmark: false */
			var itemValue = item.value;
			var primaryInfoHtml = [
				'<label class="listview-item-primaryInfo" data-value="' + itemValue + '">',
				'' + item.primaryInfo + '',
				'</label>'
			].join("");
			var secondaryInfoHtml = "";
			var secondaryInfo = item.secondaryInfo;
			if (secondaryInfo) {
				secondaryInfoHtml = [
					'<label class="listview-item-secondaryInfo" data-value="' + itemValue + '">',
					'' + secondaryInfo + '',
					'</label>'
				].join("");
			}
			var tpl = [
				'<div class="listview-item" data-value="' + itemValue + '">',
				'<div class="listview-item-image" data-value="' + itemValue + '">',
				'<img src="' + item.imageSrc + '" data-value="' + itemValue + '">',
				'</div>',
				'<div class="listview-item-info" data-value="' + itemValue + '">',
				primaryInfoHtml,
				secondaryInfoHtml,
				'</div>',
				'</div>'
			];
			item.customHtml = tpl.join("");
			/*jshint quotmark: true */
		},

		/**
		 * Возвращает сущности удовлетворяющие условиям поиска.
		 * @private
		 * @throws {Terrasoft.ArgumentNullOrEmptyException}
		 * @param {String} filterValue
		 * @param {Function} callback
		 * @param {Object} scope
		 */
		getEntities: function(filterValue, callback, scope) {
			if (this.Ext.isEmpty(filterValue)) {
				throw this.Ext.create("Terrasoft.ArgumentNullOrEmptyException");
			}
			var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchema: Contact,
				rowCount: 5
			});
			var queryMacrosType = this.Terrasoft.QueryMacrosType;
			esq.addMacrosColumn(queryMacrosType.PRIMARY_COLUMN, "value");
			esq.addMacrosColumn(queryMacrosType.PRIMARY_IMAGE_COLUMN, "primaryImageColumn");
			var displayColumn = esq.addMacrosColumn(queryMacrosType.PRIMARY_DISPLAY_COLUMN, "displayValue");
			displayColumn.orderPosition = 1;
			displayColumn.orderDirection = this.Terrasoft.OrderDirection.ASC;
			esq.addColumn("Email", "secondaryInfo");
			var comparisonType = this.Terrasoft.SysSettings.lookupFilterType;
			var paramDataType = this.Terrasoft.DataValueType.TEXT;
			var lookupFilter = esq.createPrimaryDisplayColumnFilterWithParameter(comparisonType, filterValue, paramDataType);
			var ownerFilter = esq.createColumnIsNotNullFilter("[SysAdminUnit:Contact].Id");
			esq.filters.addItem(lookupFilter);
			esq.filters.addItem(ownerFilter);
			esq.getEntityCollection(function(response) {
				if (response && response.success) {
					callback.call(scope, response.collection);
				}
			}, this);
		},

		/**
		 * Возвращает абсолютный путь к карточке сущности.
		 * @private
		 * @param {Terrasoft.BaseViewModel} entity Сущность.
		 * @return {String} Абсолютный путь к карточке сущности.
		 */
		getEntityLink: function(entity) {
			var entitySchemaName = entity.entitySchema.name;
			var primaryColumnValue = entity.get("value");
			var relativeUrl = NetworkUtilities.getEntityUrl(entitySchemaName, primaryColumnValue);
			return this.Terrasoft.combinePath(
				this.Terrasoft.workspaceBaseUrl, "Nui", "ViewModule.aspx#" + relativeUrl);
		},

		/**
		 * Добавляет упоминания пользователей в сообщении/комментарии.
		 * @param {Object} socialMessage Сообщение/комментарий, в котором ищутся упоминания пользователей.
		 */
		addSocialMention: function(socialMessage) {
			var socialMentionCollection = this.getSocialMentionsFromMessage(socialMessage);
			var batchQuery = this.Ext.create("Terrasoft.BatchQuery");
			socialMentionCollection.each(function(mention) {
				var insert = this.getSocialMentionInsertQuery(mention);
				batchQuery.add(insert);
			}, this);
			if (batchQuery.queries.length) {
				batchQuery.execute();
			}
		},

		/**
		 * Возвращает коллекцию упоминаний пользователей в сообщении.
		 * @param {Object} socialMessage Сообщение/комментарий.
		 * @return {Terrasoft.Collection} Коллекция упоминаний пользователей в сообщении.
		 */
		getSocialMentionsFromMessage: function(socialMessage) {
			var messageText = socialMessage.message;
			var messageId = socialMessage.id;
			var guidRegExp = "([0-9a-fA-F]{8}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{4}\\-[0-9a-fA-F]{12})";
			var hrefRegExp = this.Ext.String.format("<a\\s.*?data-value=\"{0}\"\\s.*?>", guidRegExp);
			var regExp = new RegExp(hrefRegExp, "g");
			var socialMentionCollection = this.Ext.create("Terrasoft.Collection");
			var match = regExp.exec(messageText);
			while (match) {
				var contactId = match[1];
				var mention = {
					contactId: contactId,
					messageId: messageId
				};
				socialMentionCollection.add(mention);
				match = regExp.exec(messageText);
			}
			return socialMentionCollection;
		},

		/**
		 * Создает запрос на добавление упоминания пользователя в сообщении/комментарии.
		 * @private
		 * @param {Object} mention Объект, содержащий идентификаторы контакта и сообщения.
		 * @return {Terrasoft.InsertQuery} Запрос на добавление упоминания контакта.
		 */
		getSocialMentionInsertQuery: function(mention) {
			var insert = this.Ext.create("Terrasoft.InsertQuery", {
				rootSchemaName: "SocialMention"
			});
			insert.setParameterValue("Contact", mention.contactId, this.Terrasoft.DataValueType.GUID);
			insert.setParameterValue("SocialMessage", mention.messageId, this.Terrasoft.DataValueType.GUID);
			return insert;
		}
	});

});