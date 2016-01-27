define("OrderSectionV2", ["BaseFiltersGenerateModule", "VisaHelper", "ReportUtilities",
	"css!VisaHelper"], function(BaseFiltersGenerateModule, VisaHelper) {
	return {
		entitySchemaName: "Order",
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
			 * Устанавливает идентификатор контекстной справки.
			 * @protected
			 */
			initContextHelp: function() {
				this.set("ContextHelpId", 1055);
				this.callParent(arguments);
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
			}
		},
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
	};
});