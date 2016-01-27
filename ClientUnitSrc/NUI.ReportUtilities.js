define("ReportUtilities", ["ext-base", "terrasoft", "LocalizationUtilities", "SysModuleReport", "MaskHelper", "ServiceHelper"],
		function(Ext, Terrasoft, LocalizationUtilities, SysModuleReport, MaskHelper, ServiceHelper) {

	/**
	 * Возвращает клиентский запрс для получения отчетов.
	 * @public
	 * @param config Конфигурационный объект.
	 * @return {Terrasoft.EntitySchemaQuery} Возвращает клиентский запрос.
	 */
	function getReports(config) {
		if (!Ext.isObject(config)) {
			config = {
				sysEntitySchemaUId: arguments[0],
				location: arguments[1]
			};
		}
		var esq = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchema: SysModuleReport});
		LocalizationUtilities.addLocalizableColumn(esq, "Caption");
		esq.addColumn("Caption", "NonLocalizedCaption");
		esq.addColumn("Type.Name");
		esq.addColumn("SysReportSchemaUId");
		esq.addColumn("ConvertInPDF");
		esq.addColumn("TypeColumnValue");
		esq.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
			"SysModule.SysModuleEntity.SysEntitySchemaUId", config.sysEntitySchemaUId));
		esq.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
			"ShowIn" + config.location, true));
		// убрать когда будет разработана фильтрация пф "Планы на день"
		var activityFilter = Terrasoft.createColumnInFilterWithParameters("Id",
			["490AD08A-8C80-E011-AFBC-00155D04320C", "DCFD7211-240C-4E8D-9154-FF2BCE2FD20E"]);
		activityFilter.comparisonType = Terrasoft.ComparisonType.NOT_EQUAL;
		esq.filters.add("ActivityFilter", activityFilter);
		return esq;
	}

	/**
	 * Генерирует отчет.
	 * @public
	 * @param {String} entitySchemaUId UId схемы.
	 * @param {Object} config Конфигурационный объект.
	 */
	function generateReport(entitySchemaUId, config) {
		var reportId = config.reportId;
		var recordId = config.recordId || Terrasoft.GUID_EMPTY;
		var caption = config.caption;
		var reportParameters = config.reportParameters;
		var isReportDevExpress = (config.type === "DevExpress");
		var convertInPDF =  config.convertInPDF;
		var isPDF = convertInPDF || isReportDevExpress;
		caption += (isPDF) ? ".pdf" : ".docx";
		MaskHelper.ShowBodyMask();
		var templateId = "";
		var reportSchemaUId = "";
		if (isReportDevExpress  === false) {
			templateId = reportId;
		} else {
			reportSchemaUId = reportId;
		}

		var data = {
			reportParameters: Ext.JSON.encode(reportParameters),
			reportSchemaUId: reportSchemaUId,
			templateId: templateId,
			recordId: recordId,
			entitySchemaUId: entitySchemaUId,
			caption: caption,
			convertInPDF: convertInPDF
		};
		var serviceConfig = {
			serviceName: "ReportService",
			methodName: "CreateReport",
			callback: function(response) {
				MaskHelper.HideBodyMask();
				var key = response.CreateReportResult;
				downloadReport(caption, key);
			},
			data: data,
			timeout: 20 * 60 * 1000

		};
		ServiceHelper.callService(serviceConfig);
	}

	/**
	 * Загружает отчет.
	 * @private
	 * @param {String} caption Заголовок.
	 * @param {String} key Идентификатор отчета.
	 */
	function downloadReport(caption, key) {
		var report = document.createElement("a");
		report.href = "../rest/ReportService/GetReportFile/" + key;
		report.download = caption;
		document.body.appendChild(report);
		report.click();
		document.body.removeChild(report);
	}

	/**
	 * Возвращает конфигурационный объект меню отчетов.
	 * @public
	 * @param {Array} reports Массив отчетов.
	 */
	function getReportsMenuConfig(reports) {
		var result = [];
		for (var i = 0; i < reports.length; i++) {
			var report = reports[i];
			var caption = report.get("Caption") || report.get("NonLocalizedCaption");
			var isReportDevExpress = report.get("Type.Name") === "DevExpress";
			var reportId = isReportDevExpress ? report.get("SysReportSchemaUId") : report.get("Id");
			var tag = {
				caption: caption,
				reportId: reportId,
				convertInPDF: report.get("ConvertInPDF"),
				type: report.get("Type.Name"),
				typeColumnValue: report.get("TypeColumnValue")
			};
			result.push({
				tag: tag,
				caption: caption,
				methodName: "generateReport"
			});
		}
		return result;
	}

	return {
		generateReport: generateReport,
		getReports: getReports,
		getReportsMenuConfig: getReportsMenuConfig
	};
});