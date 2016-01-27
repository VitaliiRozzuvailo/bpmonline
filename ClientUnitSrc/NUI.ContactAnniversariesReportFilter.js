define('ContactAnniversariesReportFilter', ['ContactAnniversariesReportFilterResources'], function(resources) {

		var config = [
			{
				name: 'FormingMethod',
				dataValueType: 'FormingMethod'
			},
			{
				name: 'PeriodFilter',
				caption: resources.localizableStrings.PeriodFilterCaption,
				dataValueType: 'PeriodFilter',
				columnName: 'CreatedOn',
				startDate: {
					defValue: Terrasoft.startOfWeek(new Date())
				},
				dueDate: {
					defValue: Terrasoft.endOfWeek(new Date())
				}
			}
		];
		return config;
	});