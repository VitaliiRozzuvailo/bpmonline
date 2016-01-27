define("DocumentSectionV2", ["VisaHelper", "BaseFiltersGenerateModule",	"DocumentSectionGridRowViewModel"],
	function(VisaHelper, BaseFiltersGenerateModule) {
		return {
			entitySchemaName: "Document",
			methods: {
				/**
				 * Устанавливает значение идентификатора контекстной справки для раздела "Документы"
				 * @overridden
				 */
				initContextHelp: function() {
					this.set("ContextHelpId", 1005);
					this.callParent(arguments);
				},

				/**
				 * @overridden
				 * @inheritDoc BaseSectionV2#initFixedFiltersConfig
				 */
				initFixedFiltersConfig: function() {
					var fixedFilterConfig = {
						entitySchema: this.entitySchema,
						filters: [
							{
								name: "PeriodFilter",
								caption: this.get("Resources.Strings.PeriodFilterCaption"),
								dataValueType: Terrasoft.DataValueType.DATE,
								columnName: "Date",
								startDate: {},
								dueDate: {}
							},
							{
								name: "Owner",
								caption: this.get("Resources.Strings.OwnerFilterCaption"),
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								filter: BaseFiltersGenerateModule.OwnerFilter,
								columnName: "Owner"
							}
						]
					};
					this.set("FixedFilterConfig", fixedFilterConfig);
				},

				/**
				 * @overridden
				 */
				getGridRowViewModelClassName: function() {
					return "Terrasoft.DocumentSectionGridRowViewModel";
				},

				/**
				 * overridden
				 */
				getReportFilters: function() {
					var filters = this.getFilters();
					var recordId = this.get("ActiveRow");
					if (recordId) {
						filters.clear();
						filters.name = "primaryColumnFilter";
						filters.logicalComparisonTypes = Terrasoft.LogicalOperatorType.AND;
						var filter = this.Terrasoft.createColumnInFilterWithParameters(
							this.entitySchema.primaryColumnName, [recordId]);
						filters.addItem(filter);
					}
					return filters;
				},

				/**
				 * overridden
				 */
				prepareResponseCollection: function(collection) {
					this.callParent(arguments);
					var cardPrintMenuItems = this.get("CardPrintMenuItems");
					collection.each(function(item) {
						item.set("CardPrintMenuItems", cardPrintMenuItems);
					}, this);
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "DataGridActiveRowPrintAction",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"caption": {"bindTo": "Resources.Strings.PrintRecordGridRowButtonCaption"},
						"tag": "print",
						"visible": {
							bindTo: "getDataGridActiveRowPrintActionVisible"
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});
