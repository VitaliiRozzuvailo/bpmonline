define("SocialContactPage", ["ContactCommunication", "FacebookClientUtilities", "FacebookSocialCommunicationViewModel",
		"css!SocialSearch"], function(ContactCommunication) {
	return {
		methods: {

			/**
			 * @inheritdoc Terrasoft.BaseSocialPage#socialProfileInfoLoaded
			 * @overridden
			 */
			socialProfileInfoLoaded: function(response) {
				this.callParent(arguments);
				var logoUrl = this.Terrasoft.ImageUrlBuilder.getUrl(this.get("Resources.Images.FacebookSmallIcon"));
				var entities = response.entities;
				this.Terrasoft.each(entities, function(entity) {
					var photoConfig = {
						markerValue: "FacebookEntityPhoto",
						logo: {
							url: logoUrl,
							source: this.Terrasoft.ImageSources.URL
						}
					};
					var imageUrl = entity.imageUrl;
					var isDefaultImage = entity.isDefaultImage;
					if (imageUrl && !isDefaultImage) {
						photoConfig.image = {
							url: imageUrl,
							source: this.Terrasoft.ImageSources.URL
						};
					}
					this.addContactImage(photoConfig);
				}, this);
			},

			/**
			 * @inheritdoc Terrasoft.BaseSocialPage#getFacebookProfilesESQ
			 * @overridden
			 */
			getFacebookProfilesESQ: function() {
				return this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchema: ContactCommunication
				});
			}
		},
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
	};
});
