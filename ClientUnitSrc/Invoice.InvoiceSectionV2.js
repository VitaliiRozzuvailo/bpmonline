define("InvoiceSectionV2", ["BaseFiltersGenerateModule", "VisaHelper", "RightUtilities", "ReportUtilities",
	"css!VisaHelper"], function(BaseFiltersGenerateModule, VisaHelper, RightUtilities) {
		return {
			entitySchemaName: "Invoice",
			attributes: {
				/**
				 * Заголовок пункта меню "Отправить на визирование"
				 */
				SendToVisaMenuItemCaption: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					value: VisaHelper.resources.localizableStrings.SendToVisaCaption
				}
			},
			methods: {
				/**
				 * Устанавливает значение идентификатора контекстной справки для раздела "Счета"
				 * @overridden
				 */
				initContextHelp: function() {
					this.set("ContextHelpId", 1004);
					this.callParent(arguments);
				},

				/**
				 * @overridden
				 * @inheritDoc
				 */
				initFixedFiltersConfig: function() {
					var fixedFilterConfig = {
						entitySchema: this.entitySchema,
						filters: [
							{
								name: "PeriodFilter",
								caption: this.get("Resources.Strings.PeriodFilterCaption"),
								dataValueType: Terrasoft.DataValueType.DATE,
								columnName: "StartDate",
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
				 * Действие "Отправить на визирование"
				 */
				sendToVisa: VisaHelper.SendToVisaMethod,

				/**
				 * Возвращает коллекцию действий раздела в режиме отображения реестра
				 * @protected
				 * @overridden
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий раздела в режиме
				 * отображения реестра
				 */
				getSectionActions: function() {
					var actionMenuItems = this.callParent(arguments);
					actionMenuItems.addItem(this.getActionsMenuItem({
						Type: "Terrasoft.MenuSeparator",
						Caption: ""
					}));
					actionMenuItems.addItem(this.getActionsMenuItem({
						"Caption": {bindTo: "SendToVisaMenuItemCaption"},
						"Click": {bindTo: "sendToVisa"},
						"Enabled": {bindTo: "isSingleSelected"}
					}));
					return actionMenuItems;
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
						"tag": "print"
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});