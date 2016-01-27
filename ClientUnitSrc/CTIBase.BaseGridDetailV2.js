define("BaseGridDetailV2", ["ContextCallUtilities"], function() {
	return {
		messages: {
			"CallCustomer": {
				"mode": Terrasoft.MessageMode.PTP,
				"direction": Terrasoft.MessageDirectionType.PUBLISH
			}
		},
		mixins: {
			/**
			 * Миксин контекстного звонка.
			 */
			"ContextCallUtilities": "Terrasoft.ContextCallUtilities"
		},
		methods: {

			//region Methods: Protected

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#linkClicked
			 * @overridden
			 */
			linkClicked: function(rowId, columnName) {
				var handled = this.phoneLinkClicked(rowId, columnName);
				return !(handled || !this.callParent(arguments));
			}

			//endregion

		}
	};
});
