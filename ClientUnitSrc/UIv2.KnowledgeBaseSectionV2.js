define("KnowledgeBaseSectionV2", [],
function() {
	return {
		entitySchemaName: "KnowledgeBase",
		methods: {
			initContextHelp: function() {
				this.set("ContextHelpId", 1006);
				this.callParent(arguments);
			},

			/**
			 * Иницииализирует теги с указанием других схем тегов отличных от базовых.
			 * @protected
			 * @overridden
			 */
			initTags: function() {
				this.tagSchemaName = this.entitySchemaName + "TagV2";
				this.inTagSchemaName = this.entitySchemaName + "InTagV2";
				this.callParent(arguments);
			}
		},
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
	};
});