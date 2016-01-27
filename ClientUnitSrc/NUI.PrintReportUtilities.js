define("PrintReportUtilities", ["LocalizationUtilities", "SysModuleReport", "SysModuleAnalyticsReport",
		"MenuUtilities"],
	function(LocalizationUtilities, SysModuleReport, SysModuleAnalyticsReport, MenuUtilities) {

	Terrasoft.ConfigurationEnums.ReportType = {
		"DevExpress": "DevExpress",
		"Word": "MS Word"
	};

	/**
	 * @class Terrasoft.configuration.BasePrintFormViewModel
	 * Класс печатной формы.
	 */
	Ext.define("Terrasoft.configuration.BasePrintFormViewModel", {
		extend: "Terrasoft.BaseViewModel",
		alternateClassName: "Terrasoft.BasePrintFormViewModel",

		/**
		 * Проверяет, является ли тип отчета DevExpress-м.
		 * @protected
		 * @return {Boolean} Возвращает true, если тип отчета  - DevExpress.
		 */
		isDevExpressReport: function() {
			return this.get("PrintFormType") === Terrasoft.ConfigurationEnums.ReportType.DevExpress;
		},

		/**
		 * Возвращает заголовок отчета в определенном формате.
		 * @protected
		 * @return {String} заголовок отчета.
		 */
		getCaption: function() {
			var baseCaption = this.get("Caption") || this.get("NonLocalizedCaption");
			return baseCaption + ((this.get("ConvertInPDF") || this.isDevExpressReport()) ? ".pdf" : ".docx");
		},

		/**
		 * Возвращает UId схемы отчета.
		 * @protected
		 * @return {String} UId схемы отчета.
		 */
		getReportSchemaUId: function() {
			return this.isDevExpressReport() ? this.get("SysReportSchemaUId") : "";
		},

		/**
		 * Возвращает идентификатор отчета.
		 * @protected
		 * @return {String} Идентификатор отчета.
		 */
		getTemplateId: function() {
			return this.isDevExpressReport() ? "" : this.get("Id");
		}
	});

	/**
	 * @class Terrasoft.configuration.mixins.PrintReportUtilities
	 * Класс - миксин, реализующий работу с отчетами и печатными формами.
	 */
	Ext.define("Terrasoft.configuration.mixins.PrintReportUtilities", {
		alternateClassName: "Terrasoft.PrintReportUtilities",

		/**
		 * Имя коллекции отчетов.
		 */
		moduleReportsCollectionName: "ReportGridData",

		/**
		 * Имя коллекции печатных форм карточки.
		 */
		moduleCardPrintFormsCollectionName: "CardPrintMenuItems",

		/**
		 * Имя коллекции печатных форм раздела.
		 */
		moduleSectionPrintFormsCollectionName: "SectionPrintMenuItems",

		/**
		 * Возвращает значение колонки типа отчета.
		 * @protected
		 * @param {String} reportId Идентификатор отчета.
		 * @return {String} Возвращает значение колонки типа отчета.
		 */
		getReportTypeColumnValue: function(reportId) {
			var reportCollection = this.get(this.moduleCardPrintFormsCollectionName);
			var reportTypeColumnValue;
			var currentMenuItem = reportCollection.find(reportId);
			if (currentMenuItem) {
				reportTypeColumnValue = currentMenuItem.get("TypeColumnValue");
			}
			return reportTypeColumnValue;
		},

		/**
		 * Возвращает идентификатор модуля отчета.
		 * @protected
		 * @return {String} Идентификатор модуля отчета.
		 */
		getReportModuleId: function() {
			return this.sandbox.id + "_ReportModule";
		},

		/**
		 * Возвращает идентификатор модуля отчета.
		 * @protected
		 * @return {String} Идентификатор модуля отчета.
		 */
		getEntitySchemaName: function() {
			var processData = this.get("ProcessData");
			return (this.entitySchema)
				? this.entitySchemaName
				: (processData && processData.entitySchemaName);
		},

		/**
		 * Инициализирует подписку на сообщения модуля отчетов.
		 * @protected
		 */
		initReportModuleMessageSubscription: function() {
			var reportModuleId = this.getReportModuleId();
			this.sandbox.subscribe("GetReportConfig", function() {
				var key = this.get("CurrentReportId");
				var grid = this.get(this.moduleReportsCollectionName);
				var activeReport = grid.get(key);
				return {
					id: activeReport.get("Id"),
					caption: activeReport.get("Caption"),
					reportId: activeReport.get("SysSchemaUId"),
					sysSchemaName: activeReport.get("OptionSchemaName"),
					sectionUId: this.entitySchema.uId,//todo
					activeRow: this.get("ActiveRow"),
					selectedRows: this.get("SelectedRows"),
					ReportType: Terrasoft.ConfigurationEnums.ReportType.DevExpress,
					parentModuleSandboxId: this.sandbox.id
				};
			}, this, [reportModuleId, "GetReportConfigKey"]);
		},

		/**
		 * Возвращает клиентский запрс для получения печатных форм.
		 * @protected
		 * @return {Terrasoft.EntitySchemaQuery} Возвращает клиентский запрос.
		 */
		getModulePrintFormsESQ: function() {
			var entitySchemaName = this.getEntitySchemaName();
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchema: SysModuleReport,
				isDistinct: true,
				rowViewModelClassName: "Terrasoft.BasePrintFormViewModel"
			});
			esq.addColumn(SysModuleReport.primaryColumnName);
			LocalizationUtilities.addLocalizableColumn(esq, "Caption");
			esq.addColumn("Caption", "NonLocalizedCaption");
			esq.addColumn("Type.Name", "PrintFormType");
			esq.addColumn("SysReportSchemaUId");
			esq.addColumn("ConvertInPDF");
			esq.addColumn("TypeColumnValue");
			esq.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"SysModule.SysModuleEntity.[SysSchema:UId:SysEntitySchemaUId].Name", entitySchemaName));
			// убрать когда будет разработана фильтрация пф "Планы на день"
			var activityFilter = Terrasoft.createColumnInFilterWithParameters("Id",
				["490AD08A-8C80-E011-AFBC-00155D04320C", "DCFD7211-240C-4E8D-9154-FF2BCE2FD20E"]);
			activityFilter.comparisonType = Terrasoft.ComparisonType.NOT_EQUAL;
			esq.filters.addItem(activityFilter);
			return esq;
		},

		/**
		 * Возвращает клиентский запрс для получения списка отчетов.
		 * @protected
		 * @return {Terrasoft.EntitySchemaQuery} Возвращает клиентский запрос.
		 */
		getModuleReportsESQ: function() {
			var entitySchemaName = this.getEntitySchemaName();
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchema: SysModuleAnalyticsReport
			});
			LocalizationUtilities.addLocalizableColumn(esq, "Caption");
			esq.addColumn("SysSchemaUId");
			esq.addColumn("[VwSysSchemaInWorkspace:UId:SysOptionsPageSchemaUId].Name", "OptionSchemaName");
			esq.filters.addItem(esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"ModuleSchemaName", entitySchemaName));
			var workspaceIdFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"[VwSysSchemaInWorkspace:UId:SysOptionsPageSchemaUId].SysWorkspace.Id",
				Terrasoft.SysValue.CURRENT_WORKSPACE.value);
			esq.filters.addItem(workspaceIdFilter);
			return esq;
		},

		/**
		 * Инициализирует коллекцию возможных отчетов для указанного объекта.
		 * @protected
		 */
		initCurrentModuleReports: function(callback, scope) {
			this.initReportModuleMessageSubscription();
			this.set(this.moduleReportsCollectionName, this.Ext.create("Terrasoft.Collection"));
			var esq = this.getModuleReportsESQ();
			esq.getEntityCollection(function(response) {
				var collection = this.get(this.moduleReportsCollectionName);
				var entities = response.collection;
				if (response.success && !entities.isEmpty()) {
					entities.each(function(entity) {
						entity.set("Click", {"bindTo": "loadReportModule"});
						entity.set("Tag", entity.get("Id"));
					}, this);
					collection.loadAll(entities);
				}
				if (callback) {
					callback.call(scope || this);
				}
			}, this);
		},

		/**
		 * Загружает модуль отчетов.
		 * @protected
		 * @param {String} key Идентификатор отчета.
		 */
		loadReportModule: function(key) {
			this.set("CurrentReportId", key); // todo
			var historyState = this.sandbox.publish("GetHistoryState");
			var moduleState = Ext.apply({hash: historyState.hash.historyState}, {});
			this.sandbox.publish("PushHistoryState", moduleState);
			var reportModuleId = this.getReportModuleId();
			this.sandbox.loadModule("ReportModule", {
				id: reportModuleId,
				renderTo: this.renderTo,
				keepAlive: true
			});
		},

		/**
		 * Формирует коллекцию элементов меню кнопки.
		 * @param {String} collectionName Название коллекции.
		 * @return {Terrasoft.BaseViewModelCollection} Коллекция, готовая к заполению.
		 */
		preparePrintButtonCollection: function(collectionName) {
			var printMenuItems = this.get(collectionName);
			if (this.Ext.isEmpty(printMenuItems)) {
				printMenuItems = this.Ext.create("Terrasoft.BaseViewModelCollection");
			}
			printMenuItems.clear();
			return printMenuItems;
		},

		/**
		 * Инициализирует коллекцию возможных печатных форм для карточки.
		 * @protected
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Terrasoft.BaseViewModel} scope Контекст вызова функции обратного вызова.
		 */
		initCardPrintForms: function(callback, scope) {
			var reportsEsq = this.getModulePrintFormsESQ();
			reportsEsq.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"ShowInCard", true));
			reportsEsq.getEntityCollection(function(result) {
				if (this.destroyed) {
					return;
				}
				if (result.success && !result.collection.isEmpty()) {
					var printFormsMenuCollection = result.collection;
					this.preparePrintFormsMenuCollection(printFormsMenuCollection);
					printFormsMenuCollection.each(function(item) {
						item.set("Click", {bindTo: "generateCardPrintForm"});
					}, this);
					var printMenuItems = this.preparePrintButtonCollection(this.moduleCardPrintFormsCollectionName);
					printMenuItems.loadAll(printFormsMenuCollection);
					this.set(this.moduleCardPrintFormsCollectionName, printMenuItems);
					this.getCardPrintButtonVisible();
				}
				if (callback) {
					callback.call(scope || this);
				}
			}, this);
		},

		/**
		 * Инициализирует коллекцию возможных печатных форм для раздела.
		 * @protected
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Terrasoft.BaseViewModel} scope Контекст вызова функции обратного вызова.
		 */
		initSectionPrintForms: function(callback, scope) {
			var reportsEsq = this.getModulePrintFormsESQ();
			reportsEsq.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"ShowInSection", true));
			reportsEsq.getEntityCollection(function(result) {
				if (result.success && !result.collection.isEmpty()) {
					var printFormsMenuCollection = result.collection;
					this.preparePrintFormsMenuCollection(printFormsMenuCollection);
					printFormsMenuCollection.each(function(item) {
						item.set("Enabled", {bindTo: "isAnySelected"});
						item.set("Click", {bindTo: "generateSectionPrintForm"});
					}, this);
					var printMenuItems = this.preparePrintButtonCollection(this.moduleSectionPrintFormsCollectionName);
					printMenuItems.loadAll(printFormsMenuCollection);
					this.set(this.moduleSectionPrintFormsCollectionName, printMenuItems);
					this.getSectionPrintButtonVisible();
				}
				if (callback) {
					callback.call(scope || this);
				}
			}, this);
		},

		/**
		 * Модифицирует коллекцию меню печатных форм.
		 * @protected
		 * @param {Terrasoft.Collection} printForms Коллекция печатных форм.
		 */
		preparePrintFormsMenuCollection: function(printForms) {
			printForms.eachKey(function(key, item) {
				if (!item.get("Caption")) {
					item.set("Caption", item.get("NonLocalizedCaption"));
				}
				item.set("Tag", key);
				if (item.get("TypeColumnValue")) {
					item.set("Visible", {bindTo: "getPrintMenuItemVisible"});
				}
			}, this);
		},

		/**
		 * Возвращает значение видимости для кнопки "Печать" в разделе.
		 * @protected
		 * @return {Boolean} Видимость нопки.
		 */
		getSectionPrintButtonVisible: function() {
			var sectionPrintFormsCollection = this.get(this.moduleSectionPrintFormsCollectionName);
			var result = MenuUtilities.getMenuVisible(sectionPrintFormsCollection, this);
			this.set("IsSectionPrintButtonVisible", result);
			return result;
		},

		/**
		 * Возвращает значение видимости для кнопки "Печать" в карточке.
		 * @protected
		 * @return {Boolean} Видимость нопки.
		 */
		getCardPrintButtonVisible: function() {
			var cardPrintFormsCollection = this.get(this.moduleCardPrintFormsCollectionName);
			var result = MenuUtilities.getMenuVisible(cardPrintFormsCollection, this);
			this.set("IsCardPrintButtonVisible", result);
			return result;
		},

		/**
		 * Возвращает значение видимости для кнопки "Отчеты" в аналитике.
		 * @protected
		 * @return {Boolean} Видимость нопки.
		 */
		getReportsButtonVisible: function() {
			var moduleReports = this.get(this.moduleReportsCollectionName);
			return (!this.Ext.isEmpty(moduleReports) && !moduleReports.isEmpty());
		},

		/**
		 * @obsolete
		 */
		getPrintButtonVisible: function(collection) {
			this.log(this.Ext.String.format(this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
					"getPrintButtonVisible", "MenuUtilities.getMenuVisible"));
			var printButtonVisible = MenuUtilities.getMenuVisible(collection, this);
			return printButtonVisible;
		},

		/**
		 * Получает отчет соответствующий выбранной записи согласно ее типу.
		 * @protected
		 */
		printRecord: function() {
			var printMenuItems = this.get(this.moduleCardPrintFormsCollectionName);
			if (printMenuItems.getCount()) {
				var reportInfo;
				var typeColumnName = this.get("TypeColumnName");
				if (typeColumnName) {
					var activeRow = this.getActiveRow();
					var typeColumnValue = activeRow.get(typeColumnName);
					printMenuItems.each(function(printMenuItem) {
						if (printMenuItem.get("TypeColumnValue") === typeColumnValue.value) {
							reportInfo = printMenuItem;
							return false;
						}
					}, this);
				} else {
					reportInfo = printMenuItems.getByIndex(0);
				}
				if (reportInfo) {
					this.generatePrintForm(reportInfo);
				}
			}
		},

		/**
		 * Генерирует печатную форму карточки.
		 * @param {String} tag Идентификатор печатной формы.
		 * @protected
		 */
		generateCardPrintForm: function(tag) {
			var cardPrintFormsCollection = this.get(this.moduleCardPrintFormsCollectionName);
			var printForm = cardPrintFormsCollection.get(tag);
			this.generatePrintForm(printForm);
		},

		/**
		 * Генерирует печатную форму раздела.
		 * @param {String} tag Идентификатор печатной формы.
		 * @protected
		 */
		generateSectionPrintForm: function(tag) {
			var cardPrintFormsCollection = this.get(this.moduleSectionPrintFormsCollectionName);
			var printForm = cardPrintFormsCollection.get(tag);
			this.generatePrintForm(printForm);
		},

		/**
		 * Возвращает набор фильтров для построения отчета.
		 * @protected
		 * @virtual
		 */
		getReportFilters: Terrasoft.emptyFn,

		/**
		 * Возвращает значение первичной колонки выбранной записи.
		 * @protected
		 * @virtual
		 */
		getPrimaryColumnValue: Terrasoft.emptyFn,

		/**
		 * Возвращает значение UId сущности.
		 * @protected
		 * @return {String} UId сущности.
		 */
		getEntitySchemaUId: function() {
			return this.entitySchema.uId;
		},

		/**
		 * Генерирует отчет.
		 * @protected
		 * @param {Terrasoft.BaseViewModel} printForm Конфигурационный объект.
		 */
		generatePrintForm: function(printForm) {
			this.showBodyMask();
			var filters = this.getReportFilters();
			var reportParameters;
			if (filters instanceof Terrasoft.FilterGroup) {
				reportParameters = {Filters: filters.serialize()};
			} else {
				reportParameters = filters;
			}
			var selectedRows = this.getPrimaryColumnValue() || this.getSelectedItems() || Terrasoft.GUID_EMPTY;
			var data = {
				reportParameters: Ext.JSON.encode(reportParameters),
				reportSchemaUId: printForm.getReportSchemaUId(),
				templateId: printForm.getTemplateId(),
				recordId: this.getPrimaryColumnValue() || Terrasoft.GUID_EMPTY,

				entitySchemaUId: this.getEntitySchemaUId(), //TODO !!!!!!!!!!

				caption: printForm.getCaption(),
				convertInPDF: printForm.get("ConvertInPDF")
			};
			var serviceConfig = {
				serviceName: "ReportService",
				methodName: "CreateReport",
				data: data,
				timeout: 20 * 60 * 1000
			};
			var callback = this.Terrasoft.emptyFn;
			if (Ext.isArray(selectedRows) && selectedRows.length > 1) {
				delete data.recordId;
				data.recordIds = selectedRows;
				serviceConfig.methodName = "CreateReportsList";
				callback = function(response) {
					var keys = response.CreateReportsListResult;
					for (var i = 0; i < keys.length; i++) {
						this.downloadReport(printForm.getCaption(), keys[i]);
					}
				};
			} else {
				callback = function(response) {
					var key = response.CreateReportResult;
					this.downloadReport(printForm.getCaption(), key);
				};
			}
			this.callService(serviceConfig, function(response) {
				this.hideBodyMask();
				callback.call(this, response);
			}, this);
		},
		/**
		 * Загружает отчет.
		 * @protected
		 * @param {String} caption Заголовок.
		 * @param {String} key Идентификатор отчета.
		 */
		downloadReport: function(caption, key) {
			var report = document.createElement("a");
			report.href = "../rest/ReportService/GetReportFile/" + key;
			report.download = caption;
			document.body.appendChild(report);
			report.click();
			document.body.removeChild(report);
		}

	});

	return Terrasoft.PrintReportUtilities;
});
