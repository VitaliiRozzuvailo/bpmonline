define("AccountPageV2", ["BaseFiltersGenerateModule", "ConfigurationEnums", "DuplicatesSearchUtilitiesV2"],
	function(BaseFiltersGenerateModule, Enums) {
		return {
			entitySchemaName: "Account",
			details: /**SCHEMA_DETAILS*/{
				Invoice: {
					schemaName: "InvoiceDetailV2",
					filter: {
						masterColumn: "Id",
						detailColumn: "Account"
					},
					useRelationship: true
				}
			}/**SCHEMA_DETAILS*/,
			methods: {
				/**
				 * Инициализирует начальные значения модели
				 * @protected
				 * @virtual
				 */
				init: function() {
					this.callParent(arguments);
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "HistoryTabContainer",
					"propertyName": "items",
					"name": "Invoice",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});