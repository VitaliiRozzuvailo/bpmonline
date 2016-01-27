define("EmailPageV2", ["BusinessRuleModule", "ConfigurationConstants"],
	function(BusinessRuleModule, ConfigurationConstants) {
		return {
			entitySchemaName: "Activity",
			methods: {
				/**
				 * �������� �������� ������� �� ����� � ������� ������.
				 * @overridden
				 * @param {Object} entity ����� ����������.
				 * @param {Object} actionType ��������, ����������� � �������.
				 */
				copyEntityColumnValues: function(entity, actionType) {
					var order = entity.get("Lead");
					if (order) {
						this.set("Lead", order);
					}
					this.callParent(arguments);
				},

				/**
				 * ���������� ������ ����������� �������.
				 * @private
				 * @overridden
				 * @return {Array} ������ �������.
				 */
				getEmailSelectColumns: function() {
					var columnsArray = this.callParent(arguments);
					columnsArray.push("Lead");
					return columnsArray;
				}
			},
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
		};
	});