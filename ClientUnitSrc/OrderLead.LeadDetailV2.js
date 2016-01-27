define("LeadDetailV2", ["LeadDetailV2Resources", "LeadConfigurationConst"],
	function(resources, LeadConfigurationConst) {
		return {
			entitySchemaName: "Lead",
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/,
			attributes: {},
			methods: {
				/**
				 * Добавление статуса квалификации по умолчанию
				 * @override
				 */
				addRecord: function() {
					var defValues = this.get("DefaultValues") || [];
					defValues.push({
						name: "QualifyStatus",
						value: LeadConfigurationConst.LeadConst.QualifyStatus.WaitingForSale
					});
					defValues.push({
						name: "LeadTypeStatus",
						value: LeadConfigurationConst.LeadConst.LeadTypeStatus.ReadyToSale
					});
					this.set("DefaultValues", defValues);
					this.callParent(arguments);
				}
			},
			rules: {},
			userCode: {}
		};
	});