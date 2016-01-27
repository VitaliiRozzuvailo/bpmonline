define('BaseReportParameterInModulePageFilter', ['BaseReportParameterInModulePageFilterResources'],
	function (resources) {

		var config = [
			{
				name: 'FormingMethod',
				dataValueType: 'FormingMethod'
			}
//				,
//				{
//					name: 'PeriodFilter',
//					caption: resources.localizableStrings.PeriodFilterCaption,
//					dataValueType: 'PeriodFilter',
//					startDate: {
//						columnName: 'StartDate',
//						defValue: Terrasoft.startOfWeek(new Date())
//					},
//					dueDate: {
//						columnName: 'DueDate',
//						defValue: Terrasoft.endOfWeek(new Date())
//					}
//				},

//				{
//					name: 'Owner',
//					caption: resources.localizableStrings.OwnerFilterCaption,
//					columnName: 'Owner',
//					defValue: Terrasoft.SysValue.CURRENT_USER_CONTACT,
//					dataValueType: 'LOOKUP',
//					appendFilter: function (filterInfo) {
//						var filter;
//						if (filterInfo.value && filterInfo.value.length > 0) {
//							filter = Terrasoft.createColumnInFilterWithParameters(
//								'[ActivityParticipant:Activity].Participant',
//								filterInfo.value);
//						}
//						return filter;
//					}
//				}
		]
		return config;
	});