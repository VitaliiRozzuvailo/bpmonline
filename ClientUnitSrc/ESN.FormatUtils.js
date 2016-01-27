define("FormatUtils", ["ext-base", "terrasoft", "FormatUtilsResources"],
	function(Ext, Terrasoft, resources) {
		/**
		 * Функция возвращает разницу между датами в днях
		 */
		function dateDiffDays(startDate, endDate) {
			var oneDay = Terrasoft.DateRate.MILLISECONDS_IN_DAY;
			var diffDate = Math.ceil(endDate.getTime() / (oneDay)) - Math.ceil(startDate.getTime() / (oneDay));
			return diffDate;
		}

		/**
		 * Функция форматирует запись со словесным представлением даты
		 */
		function smartFormatDate(value) {
			var cultureSetting = Terrasoft.Resources.CultureSettings;
			if (value) {
				var datePart = "";
				switch (dateDiffDays(value, new Date())) {
					case 0:
						datePart = resources.localizableStrings.Today;
						break;
					case 1:
						datePart = resources.localizableStrings.Yesterday;
						break;
					case 2:
						datePart = resources.localizableStrings.BeforeYesterday;
						break;
					default:
						datePart = Ext.Date.dateFormat(value, cultureSetting.dateFormat);
						break;
				}
				var timePart = Ext.Date.dateFormat(value, cultureSetting.timeFormat);
				return Ext.String.format("{0} {2} {1}", datePart, timePart, resources.localizableStrings.In);
			}
			return null;
		}

		return {
			dateDiffDays: dateDiffDays,
			smartFormatDate: smartFormatDate
		};
	});
