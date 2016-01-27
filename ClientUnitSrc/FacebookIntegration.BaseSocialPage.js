define("BaseSocialPage", ["ConfigurationConstants", "FacebookClientUtilities"], function(ConfigurationConstants) {
	return {
		mixins: {
			/**
			 * @class FacebookClientUtilities реализует базовые методы работы с соц. сетью facebook.
			 */
			FacebookClientUtilities: "Terrasoft.FacebookClientUtilities"
		},
		methods: {

			/**
			 * @inheritdoc Terrasoft.BaseSocialPage#loadSocialProfileInfo
			 * @overridden
			 */
			loadSocialProfileInfo: function() {
				this.getFacebookConnector(function(connector) {
					this.getFacebookProfiles(function(facebookIds) {
						var nodesConfig = this.getFacebookProfileInfoConfig(facebookIds);
						connector.getNodesData(nodesConfig, this.socialProfileInfoLoaded, this);
					}, this);
				}, this);
			},

			/**
			 * @inheritdoc Terrasoft.BaseSocialPage#socialProfileInfoLoaded
			 * @overridden
			 */
			socialProfileInfoLoaded: function(response) {
				this.callParent(arguments);
				if (response.success) {
					var entities = response.entities;
					this.set("SocialCommunications", entities);
					this.sandbox.publish("SocialNetworkDataLoaded", entities);
					this.updateNotes(entities);
				}
			},

			/**
			 * Получает массив Facebook-идентификаторов, привязанных к редактируемому объекту.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст функции обратного вызова.
			 */
			getFacebookProfiles: function(callback, scope) {
				var esq = this.getFacebookProfilesESQ();
				esq.addColumn("SocialMediaId");
				var entityFilter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, this.entitySchema.name, this.get(this.primaryColumnName));
				esq.filters.addItem(entityFilter);
				var typeFilter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL,
						"CommunicationType",
						ConfigurationConstants.CommunicationTypes.Facebook);
				esq.filters.addItem(typeFilter);
				esq.getEntityCollection(function(response) {
					if (!response.success) {
						var errorInfo = response.errorInfo;
						throw new Terrasoft.UnknownException({
							message: errorInfo.message
						});
					}
					var collection = response.collection;
					var socialMediaIds = [];
					collection.each(function(item) {
						var socialMediaId = item.get("SocialMediaId");
						socialMediaIds.push(socialMediaId);
					}, this);
					callback.call(scope, socialMediaIds);
				}, this);
			},

			/**
			 * Возвращает конфигурацию для получения данных о профиле.
			 * @protected
			 * @param {Array} facebookIds Массив Facebook-идентификаторов для формирования конфигурации запросов.
			 * @return {Object} Конфигурация для получения данных о профиле.
			 */
			getFacebookProfileInfoConfig: function(facebookIds) {
				if (!facebookIds || facebookIds.length === 0) {
					throw new Terrasoft.ArgumentNullOrEmptyException({
						argumentName: "FacebookId"
					});
				}
				return {
					nodes: facebookIds,
					fields: [
						{
							name: "about"
						},
						{
							name: "emails"
						},
						{
							name: "email"
						},
						{
							name: "phone"
						},
						{
							name: "website"
						},
						{
							name: "location",
							options: [
								{
									name: "country"
								},
								{
									name: "state"
								},
								{
									name: "region"
								},
								{
									name: "city"
								},
								{
									name: "street"
								},
								{
									name: "zip"
								},
								{
									name: "located_in"
								},
								{
									name: "latitude"
								},
								{
									name: "longitude"
								},
								{
									name: "name"
								}
							]
						},
						{
							name: "birthday"
						},
						{
							name: "founded"
						},
						{
							name: "picture",
							options: [
								{
									name: "type",
									value: "large"
								},
								{
									name: "width",
									value: "100"
								},
								{
									name: "height",
									value: "100"
								}
							]
						}
					]
				};
			},

			/**
			 * Обновляет примечания.
			 * @protected
			 * @param {Array} facebookEntities Информация об учетных записях Facebook.
			 */
			updateNotes: function(facebookEntities) {
				var facebookNotesTemplate = this.get("Resources.Strings.FacebookNotesTemplate");
				var currentNotes = this.get("Notes") || "";
				this.Terrasoft.each(facebookEntities, function(facebookEntity) {
					var about = facebookEntity.about;
					if (!about) {
						return;
					}
					currentNotes = this.Ext.String.format(facebookNotesTemplate, about) + currentNotes;
				}, this);
				this.set("Notes", currentNotes);
			},

			getFacebookProfilesESQ: Terrasoft.abstractFn
		}
	};
});
