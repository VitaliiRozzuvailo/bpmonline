define("InvoiceProductPageV2", [],
function() {
	return {
		entitySchemaName: "InvoiceProduct",
		attributes: {
			"Invoice": {
				lookupListConfig: {
					columns: ["CurrencyRate", "Currency", "Currency.Division"]
				}
			}
		},
		details: /**SCHEMA_DETAILS*/{
		}/**SCHEMA_DETAILS*/,
		methods: {
			/**
			 * Инициализация значений для финансовых расчетов
			 * @protected
			 */
			onEntityInitialized: function() {
				this.callParent(arguments);
				this.set("ProductEntryMasterRecord", this.get("Invoice"));
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "Invoice",
				"parentName": "BaseGeneralInfoBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Invoice",
					"enabled": false,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 12
					}
				}
			}
		]/**SCHEMA_DIFF*/
	};
});