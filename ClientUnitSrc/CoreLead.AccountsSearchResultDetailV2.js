define("AccountsSearchResultDetailV2", ["AccountsSearchResultDetailV2Resources", "ConfigurationEnums",
	"LookupUtilities", "GridUtilitiesV2"],
		function() {
			return {
				entitySchemaName: "Account",
				messages: {
					"GetSearchButtonEnabled": {
						mode: Terrasoft.MessageMode.PTP,
						direction: Terrasoft.MessageDirectionType.PUBLISH
					}
				},
				methods: {

					/**
					 * Инициализирует начальные значения модели.
					 * @overridden
					 */
					init: function() {
						this.callParent(arguments);
						this.setSearchButtonEnabled();
					},

					/**
					 * Метод изменяет свойство активности кнопки.
					 */
					setSearchButtonEnabled: function() {
						var result = this.sandbox.publish("GetSearchButtonEnabled", null, [this.sandbox.id]);
						if (Ext.isEmpty(result.value)) {
							this.set("IsSearchButtonEnabled", false);
						}
					}

				}
			};
		}
);