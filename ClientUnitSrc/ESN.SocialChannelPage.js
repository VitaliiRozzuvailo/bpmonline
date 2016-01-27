define("SocialChannelPage", ["ext-base", "terrasoft", "SocialChannel", "SocialChannelPageStructure",
	"SocialChannelPageResources", "ServiceHelper", "ConfigurationEnums"],
	function(Ext, Terrasoft, entitySchema, structure, resources,
	ServiceHelper, ConfigurationEnums) {
		structure.userCode = function() {
			this.entitySchema = entitySchema;
			this.name = "SocialChannelPageViewModel";

			this.methods.modifyLeftUtilsConfig = function(config) {
				var subscribeButtonConfig = {
					className: "Terrasoft.Button",
					caption: resources.localizableStrings.SubscribeButtonCaption,
					visible: {
						bindTo: "getSubscribeButtonVisible"
					},
					click: {
						bindTo: "onSubscribeChannelClick"
					}
				};
				var unsubscribeButtonConfig = {
					className: "Terrasoft.Button",
					caption: resources.localizableStrings.UnsubscribeButtonCaption,
					visible: {
						bindTo: "getUnsubscribeButtonVisible"
					},
					click: {
						bindTo: "onUnsubscribeChannelClick"
					}
				};
				config.items.unshift(subscribeButtonConfig, unsubscribeButtonConfig);
				return config;
			};

			this.methods.getUnsubscribeButtonVisible = function() {
				if (this.action !== ConfigurationEnums.CardState.View) {
					return false;
				} else if (this.get("canSubscribe") === false) {
					return true;
				}
				return false;
			};

			this.methods.getSubscribeButtonVisible = function() {
				if (this.action !== ConfigurationEnums.CardState.View) {
					return false;
				} else if (this.get("canSubscribe")) {
					return true;
				}
				return false;
			};

			this.methods.getIsSubscribed = function(callback) {
				ServiceHelper.callService("SocialSubscriptionService", "GetIsUserSubscribed", function(response) {
					var result = response.GetIsUserSubscribedResult;
					this.set("canSubscribe", !result);
					if (callback) {
						callback.call(this);
					}
				}, {entityId: this.get("Id")}, this);
			};

			this.methods.onSubscribeChannelClick = function() {
				if (this.get("canSubscribe")) {
					ServiceHelper.callService("SocialSubscriptionService", "SubscribeUser", function() {
						this.set("canSubscribe", false);
					}, {
						entityId: this.get("Id"),
						entitySchemaUId: this.entitySchema.uId
					}, this);
				}
			};

			this.methods.onUnsubscribeChannelClick = function() {
				ServiceHelper.callService("SocialSubscriptionService", "UnsubscribeUser", function() {
					this.set("canSubscribe", true);
				}, {
					entityId: this.get("Id")
				}, this);
			};

			this.methods.onImageChange = function(image) {
				if (image) {
					var callbackSuccess = function(imageId) {
						var imageData = {
							value: imageId,
							displayValue: "Image"
						};
						this.set(this.primaryImageColumnName, imageData);
					};
					var callbackError = Ext.emptyFn;
					var data = {
						onComplete: callbackSuccess,
						onError: callbackError,
						scope: this,
						file: image
					};
					Terrasoft.ImageApi.upload(data);
				}
			};

			this.methods.updatePublisherRightKind = function() {
				var publisherRightKind = this.get("PublisherRightKindGroup");
				this.set("PublisherRightKind", publisherRightKind);
			};

			var socialChannelImageConfig = resources.localizableImages.SocialChannelImage;
			var socialChannelImageUrl = Terrasoft.ImageUrlBuilder.getUrl(socialChannelImageConfig);

			this.methods.getSrcMethod = function() {
				var result = "";
				var primaryImageColumnValue = this.get(this.primaryImageColumnName);
				if (primaryImageColumnValue) {
					result = this.getSchemaImageUrl();
				} else {
					result = socialChannelImageUrl;
				}
				return result;
			};

			this.methods.beforeFileSelected = function() {
				return true;
			};

			this.methods.setCurrentDate = function() {
				var creationDate = new Date();
				this.set("Date", creationDate);
			};

			this.methods.init = function() {
				this.getIsSubscribed();
				this.setCurrentDate();
			};

			Terrasoft.applySchemaItemProperties(this.schema.leftPanel, "Image", {
				defaultImage: Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.SocialChannelImage)
			});

			this.getItemViewHeader = function() {
				var headerConfig = {
					columns: [{
						dataValueType: Terrasoft.DataValueType.IMAGE,
						name: "Image",
						columnPath: "Image",
						getSrcMethod: "getSrcMethod",
						onPhotoChange: "onImageChange",
						defaultImage: Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.SocialChannelImage),
						beforefileselected: "beforeFileSelected",
						visible: true
					}]
				};
				return headerConfig;
			};

			this.schema.leftPanel = [{
				type: Terrasoft.ViewModelSchemaItem.GROUP,
				name: "baseElementsControlGroup",
				visible: true,
				collapsed: false,
				wrapContainerClass: "main-elements-control-group-container",
				items: [{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: "Title",
					columnPath: "Title",
					dataValueType: Terrasoft.DataValueType.TEXT
				}, {
					dataValueType: Terrasoft.DataValueType.IMAGE,
					name: "Image",
					columnPath: "Image",
					getSrcMethod: "getSrcMethod",
					onPhotoChange: "onImageChange",
					defaultImage: Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.SocialChannelImage),
					beforefileselected: "beforeFileSelected"
				}, {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: "Description",
					columnPath: "Description",
					dataValueType: Terrasoft.DataValueType.TEXT,
					customConfig: {
						className: "Terrasoft.controls.MemoEdit",
						height: "100px"
					}
				}, {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					columnType: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.DATE,
					name: "Date",
					columnPath: "CreatedOn",
					customConfig: {
						enabled: false
					}
				}, {
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					name: "PublisherRightKind",
					columnPath: "PublisherRightKind",
					visible: false,
					dependencies: ["PublisherRightKindGroup"],
					methodName: "updatePublisherRightKind"
				}, {
					type: ConfigurationEnums.CustomViewModelSchemaItem.RADIO_GROUP,
					name: "PublisherRightKind",
					caption: resources.localizableStrings.PublisherRightKind,
					items: [{
						caption: resources.localizableStrings.AllUsersPublisherRights,
						tag: true
					}, {
						caption: resources.localizableStrings.EditorsPublisherRights,
						tag: false
					}]
				}]
			}];
		};
		return structure;
	});