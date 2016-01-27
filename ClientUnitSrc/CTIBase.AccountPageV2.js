define("AccountPageV2", [],
function() {
	return {
		entitySchemaName: "Account",
		messages: {
			/**
			 * @message HistoryTabDeactivated
			 * Сообщает о деактивации вкладки "История".
			 * @param {String} tabName Название вкладки.
			 */
			"HistoryTabDeactivated": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.PUBLISH
			}
		},
		methods: {
			/**
			 * @inheritdoc Terrasoft.BasePageV2#activeTabChange
			 * @overridden
			 */
			activeTabChange: function() {
				var tabName = this.get("ActiveTabName");
				if (tabName === "HistoryTabContainer") {
					var detailId = this.getDetailId("Calls");
					this.sandbox.publish("HistoryTabDeactivated", null, [detailId]);
				}
				this.callParent(arguments);
			}
		},
		details: /**SCHEMA_DETAILS*/{
			Calls: {
				schemaName: "CallDetail",
				filter: {
					masterColumn: "Id",
					detailColumn: "Account"
				}
			}
		}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"parentName": "HistoryTabContainer",
				"index": 0,
				"propertyName": "items",
				"name": "Calls",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.DETAIL
				}
			}
		]/**SCHEMA_DIFF*/
	};
});