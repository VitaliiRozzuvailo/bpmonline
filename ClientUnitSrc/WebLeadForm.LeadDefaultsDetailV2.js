define("LeadDefaultsDetailV2", function() {
		return {
			entitySchemaName: "LandingLeadDefaults",
			diff: /**SCHEMA_DIFF*/[
			]/**SCHEMA_DIFF*/,
			methods: {
				/**
				 * @inheritdoc Terrasoft.BasePageV2#getGridSettingsMenuItem
				 * @overridden
				 */
				getGridSettingsMenuItem: Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BasePageV2#addDetailWizardMenuItems
				 * @overridden
				 */
				addDetailWizardMenuItems: Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BasePageV2#getCopyRecordMenuItem
				 * @overridden
				 */
				getCopyRecordMenuItem: Terrasoft.emptyFn
			}
		}
	});