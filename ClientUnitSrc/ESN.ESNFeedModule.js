define("ESNFeedModule", ["css!ESNFeedStyle"],
		function() {
	Ext.define("Terrasoft.configuration.SocialFeedModule", {

		extend: "Terrasoft.BaseSchemaModule",
		alternateClassName: "Terrasoft.SocialFeedModule",

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#generateViewContainerId
		 * @overridden
		 */
		generateViewContainerId: false,

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#initSchemaName
		 * @overridden
		 */
		initSchemaName: function() {
			this.schemaName = "SocialFeed";
		},

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#initHistoryState
		 * @overridden
		 */
		initHistoryState: Terrasoft.emptyFn,

		/**
		 * @inheritdoc
		 * @overridden
		 */
		init: function() {
			this.callParent(arguments);
			this.initMessages();
		},

		/**
		 * Инциализирует подписку на сообщения модуля.
		 * @private
		 */
		initMessages: function() {
			this.sandbox.subscribe("RerenderModule", function(config) {
				if (this.viewModel) {
					this.render(this.Ext.get(config.renderTo));
					return true;
				}
			}, this, [this.sandbox.id]);
		},

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#createViewModel
		 * @overridden
		 */
		createViewModel: function() {
			var viewModel = this.callParent(arguments);
			this.initParameters(viewModel);
			return viewModel;
		},

		/**
		 * Инциализирует модель представления параметрами модуля.
		 * @private
		 * @param {Terrasoft.BaseViewModel} viewModel Модель представления.
		 */
		initParameters: function(viewModel) {
			var parameters = this.parameters;
			var activeSocialMessageId;
			if (parameters) {
				activeSocialMessageId = parameters.activeSocialMessageId;
			}
			viewModel.activeSocialMessageId = activeSocialMessageId;
		}

	});
	return Terrasoft.SocialFeedModule;
});