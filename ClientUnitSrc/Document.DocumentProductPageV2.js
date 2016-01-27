define("DocumentProductPageV2", [],
function() {
	return {
		entitySchemaName: "DocumentProduct",
		attributes: {
			"Document": {
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
				this.set("ProductEntryMasterRecord", this.get("Document"));
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "Document",
				"parentName": "BaseGeneralInfoBlock",
				"propertyName": "items",
				"values": {
					"bindTo": "Document",
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