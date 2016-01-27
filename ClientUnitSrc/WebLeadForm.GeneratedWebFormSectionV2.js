define("GeneratedWebFormSectionV2", ["terrasoft"],
	function(Terrasoft) {
		return {
			entitySchemaName: "GeneratedWebForm",
			methods: {
				/**
				 * Скрывает пункт меню "Открыть мастер раздела".
				 * @inheritdoc BaseSectionV2#addSectionDesignerViewOptions
				 * @overridden
				 */
				addSectionDesignerViewOptions: Terrasoft.emptyFn
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "CombinedModeViewOptionsButton",
					"values": {
						"visible": {"bindTo": "IsSectionVisible"}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});