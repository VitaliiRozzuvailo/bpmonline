define("OrderProductDetailV2", ["MoneyModule"], function(MoneyModule) {
	return {
		entitySchemaName: "OrderProduct",
		methods: {
			init: function() {
				this.callParent(arguments);
				this.set("MultiSelect", false);
				this.set("isCollapsed", false);
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilitiesV2#addGridDataColumns
			 * @overridden
			 * @param {Object} esq запрос.
			 */
			addGridDataColumns: function(esq) {
				this.callParent(arguments);
				esq.addColumn("Currency.Division");
			},

			/**
			 * @inheritdoc Terrasoft.GridUtilitiesV2#onGridDataLoaded
			 * @overridden
			 */
			onGridDataLoaded: function() {
				this.callParent(arguments);
				var gridData = this.getGridData();
				var columns = ["Price", "Amount", "DiscountAmount", "TaxAmount", "TotalAmount"];
				this.Terrasoft.each(gridData.getItems(), function(row) {
					this.Terrasoft.each(columns, function(column) {
						MoneyModule.RecalcBaseValue.call(row, "CurrencyRate", column, "Primary" + column,
							row.get("Currency.Division"));
					}, this);
				}, this);
			}
		},
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
	};
});
