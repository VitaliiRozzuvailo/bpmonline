define("ProductSectionV2", ["ProductManagementDistributionConstants"],
    function(DistributionConsts) {
        return {
            entitySchemaName: "Product",
            messages: {
            },
            methods: {

                /**
                 * Возвращает коллекцию действий раздела.
                 * Добавляет действие "Настройка каталога продуктов".
                 * @protected
                 * @overridden
                 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий.
                 */
                getSectionActions: function() {
                    var actionMenuItems = this.callParent(arguments);
                    actionMenuItems.addItem(this.getActionsMenuItem({
                        "Type": "Terrasoft.MenuSeparator",
                        "Caption": ""
                    }));
                    actionMenuItems.addItem(this.getActionsMenuItem({
                        "Caption": {"bindTo": "Resources.Strings.ExportWebSite"},
                        "Enabled": true,
                        "Click": {"bindTo": "ExportWebSite"}
                    }));
                    return actionMenuItems;
                },
                ExportWebSite:function(){

                }
            },
            details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
            diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
        };
    });
