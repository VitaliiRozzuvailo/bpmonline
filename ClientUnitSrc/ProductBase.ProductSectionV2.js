define("ProductSectionV2", [],
	function() {
		return {
			entitySchemaName: "Product",
			methods: {
				/**
				 * Устанавливает идентификатор контекстной справки.
				 * @protected
				 */
				initContextHelp: function() {
					this.set("ContextHelpId", 1056);
					this.callParent(arguments);
				},
				/**
				 * Возвращает заголовок представления реестра по умолчанию
				 * @protected
				 * @overriden
				 */
				getDefaultGridDataViewCaption: function() {
					var moduleStructure = Terrasoft.configuration.ModuleStructure[this.entitySchemaName];
					return (moduleStructure && moduleStructure.moduleCaption) ?
						moduleStructure.moduleCaption :
						this.get("Resources.Strings.PageCaption");
				}
			},
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
		};
	});