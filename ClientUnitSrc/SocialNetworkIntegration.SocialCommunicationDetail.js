define("SocialCommunicationDetail", ["ConfigurationConstants", "BaseCommunicationDetail",
			"SocialCommunicationViewModel"],
		function(ConfigurationConstants) {
			return {
				methods: {

					/**
					 * @inheritdoc Terrasoft.BaseCommunicationDetail#getCommunicationItemViewConfig
					 * @overridden
					 */
					getCommunicationItemViewConfig: function() {
						var itemViewConfig = this.callParent(arguments);
						var checkBoxEditConfig = this.getCheckBoxEditConfig();
						itemViewConfig.items.splice(0, 0, checkBoxEditConfig);
						return itemViewConfig;
					},

					/**
					 * @inheritdoc Terrasoft.BaseCommunicationDetail#getIconTypeButtonConfig
					 * @overridden
					 */
					getIconTypeButtonConfig: function() {
						var iconTypeButtonConfig = this.callParent(arguments);
						iconTypeButtonConfig.enabled = false;
						return iconTypeButtonConfig;
					},

					/**
					 * Возвращает конфигурацию галочки для средства связи.
					 * @protected
					 * @return {Object} Конфигурация галочки для средства связи.
					 */
					getCheckBoxEditConfig: function() {
						return {
							className: "Terrasoft.CheckBoxEdit",
							checkedchanged: {bindTo: "onSelectItem"},
							checked: true,
							markerValue: {
								bindTo: "getCheckBoxEditMarkerValue"
							}
						};
					},

					/**
					 * @inheritdoc Terrasoft.BaseCommunicationDetail#save
					 * @overridden
					 */
					save: function() {
						var collection = this.get("Collection");
						var deletedItems = this.get("DeletedItems");
						collection.each(function(item) {
							if (!item.isDeleted) {
								return;
							}
							collection.removeByKey(item.get(item.primaryColumnName));
							deletedItems.addItem(item);
						}, this);
						return this.callParent(arguments);
					},

					/**
					 * @inheritdoc Terrasoft.BaseCommunicationDetail#initQueryFilters
					 * @overridden
					 */
					initQueryFilters: function(esq) {
						this.callParent(arguments);
						var notSocialNetworkCommunicationFilter = this.Terrasoft.createColumnFilterWithParameter(
							this.Terrasoft.ComparisonType.NOT_EQUAL,
							"[ComTypebyCommunication:CommunicationType:CommunicationType].Communication",
							ConfigurationConstants.Communication.SocialNetwork);
						esq.filters.addItem(notSocialNetworkCommunicationFilter);
					},

					/**
					 * @inheritdoc Terrasoft.BaseCommunicationDetail#getCommunicationViewModelClassName
					 * @overridden
					 */
					getCommunicationViewModelClassName: function() {
						return "Terrasoft.SocialCommunicationViewModel";
					},

					/**
					 * @inheritdoc Terrasoft.BaseCommunicationDetail#addDeleteMenuItem
					 * @overridden
					 */
					addDeleteMenuItem: Terrasoft.emptyFn,

					/**
					 * @inheritdoc Terrasoft.BaseGridDetailV2#initDetailOptions
					 * @overridden
					 */
					initDetailOptions: function() {
						this.callParent(arguments);
						this.set("IsDetailCollapsed", false);
					},

					/**
					 * @inheritdoc Terrasoft.BaseCommunicationDetail#getTypeButtonConfig
					 * @overridden
					 */
					getTypeButtonConfig: function() {
						var typeButtonConfig = this.callParent(arguments);
						typeButtonConfig.style = {
							bindTo: "getTypeButtonStyle"
						};
						return typeButtonConfig;
					},

					/**
					 * @inheritdoc Terrasoft.BaseCommunicationDetail#getItemsToValidate
					 * @overridden
					 */
					getItemsToValidate: function() {
						var collection = this.get("Collection");
						return collection.filter(function(item) {
							return !item.isDeleted;
						});
					}
				},
				diff: /**SCHEMA_DIFF*/[
					{
						"operation": "remove",
						"name": "AddButton"
					},
					{
						"operation": "remove",
						"name": "SocialNetworksContainer"
					}
				]/**SCHEMA_DIFF*/
			};
		});
