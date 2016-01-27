define("ContractSectionV2", ["GridUtilitiesV2", "VisaHelper"],
function(GridUtilitiesV2, VisaHelper) {
	return {
		entitySchemaName: "Contract",
		attributes: {
			/**
			 * Заголовок пункта меню "Отправить на визирование"
			 */
			SendToVisaMenuItemCaption: {
				dataValueType: Terrasoft.DataValueType.TEXT,
				value: VisaHelper.resources.localizableStrings.SendToVisaCaption
			}
		},
		contextHelpId: "1071",
		diff: /**SCHEMA_DIFF*/[
		]/**SCHEMA_DIFF*/,
		messages: {},
		methods: {
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
			 * @inheritdoc Terrasoft.BaseSectionV2#initContextHelp
			 * @overridden
			*/
			initContextHelp: function() {
				this.set("ContextHelpId", 1071);
				this.callParent(arguments);
			},
		}
	};
});
