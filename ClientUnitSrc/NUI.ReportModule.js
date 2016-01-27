define("ReportModule", ["ReportModuleResources"],
	function(resources) {

		/**
		 * @class Terrasoft.configuration.ReportModuleViewModel
		 * Класс, который используется для создания модели представления модуля отчетов.
		 */
		Ext.define("Terrasoft.configuration.ReportModuleViewModel", {
			extend: "Terrasoft.BaseSchemaViewModel",
			alternateClassName: "Terrasoft.ReportModuleViewModel",

			Ext: null,

			sandbox: null,

			Terrasoft: null,

			/**
			 * Классы-миксины (примеси), расширяющие функциональность данного класса.
			 */
			mixins: {

				/**
				 * @class PrintReportUtilities реализующий базовые методы работы с отчетами и печатными формами.
				 */
				PrintReportUtilities: "Terrasoft.PrintReportUtilities"
			},

			/**
			 * Возвращает параметры фильтрации отчета.
			 * @protected
			 * @return {Object} Параметры фильтрации отчета.
			 */
			getReportFilters: function() {
				var reportParameters = this.sandbox.publish("GetReportFilterCollection");
				return reportParameters;
			},

			/**
			 * Возвращает значение UId сущности.
			 * @protected
			 * @return {String} UId сущности.
			 */
			getEntitySchemaUId: function() {
				return this.get("sectionUId");
			},


			/**
			 * Возвращает значение первичной колонки выбранной записи.
			 * @protected
			 */
			getPrimaryColumnValue: function() {
				return this.get("activeRow");
			},

			/**
			 * Возвращает выбранные записи.
			 * @protected
			 */
			getSelectedItems: function() {
				return this.get("activeRow") ? [this.get("activeRow")] : this.get("selectedRows");
			},

			/**
			 * Обрабатывает нажатие на кнопку создания отчета.
			 * @protected
			 */
			createReport: function() {
				var printFrom = this.Ext.create("Terrasoft.BasePrintFormViewModel", {
					values: {
						PrintFormType: this.get("ReportType"),
						Caption: this.get("caption"),
						SysReportSchemaUId: this.get("reportId")
					}
				});

				this.generatePrintForm(printFrom);
			},

			/**
			 * Обрабатывает нажатие на кнопку "Отменить".
			 * @protected
			 */
			cancel: function() {
				this.sandbox.publish("BackHistoryState");
			}
		});


		/**
		 * Функция, возвращающая конструктор модуля отчетов.
		 * @protected
		 */
		function createConstructor(context) {
			var Ext = context.Ext;
			var sandbox = context.sandbox;
			var Terrasoft = context.Terrasoft;
			var viewModel;

			/**
			 * Возвращает представление.
			 * @private
			 * @return {Terrasoft.Container} Представление.
			 */
			function getView() {
				return Ext.create("Terrasoft.Container", {
					id: "report_container",
					selectors: {
						wrapEl: "#report_container"
					},
					items: [{
						className: "Terrasoft.Label",
						caption: { bindTo: "caption"},
						visible: true,
						classes: {
							labelClass: ["report-caption"]
						}
					}, {
						className: "Terrasoft.Button",
						classes: {
							wrapperClass: ["report-btn-wrapper"]
						},
						click: {
							bindTo: "createReport"
						},
						style: Terrasoft.controls.ButtonEnums.style.BLUE,
						caption: resources.localizableStrings.CreateReportButton,
						markerValue: resources.localizableStrings.CreateReportButton
					}, {
						className: "Terrasoft.Button",
						classes: {
							wrapperClass: ["report-btn-wrapper"]
						},
						click: {
							bindTo: "cancel"
						},
						markerValue: "DiscardChangesButton",
						caption: resources.localizableStrings.CancelReportButton
					}, {
						className: "Terrasoft.Container",
						id: "report-filter-container",
						selectors: {
							wrapEl: "#report-filter-container"
						}
					}]
				});
			}

			/**
			 * Возвращает модель представления.
			 * @private
			 * @return {Terrasoft.BaseViewModel} Модель представления.
			 */
			function getViewModel() {
				var reportConfig = sandbox.publish("GetReportConfig", null, [sandbox.id]);
				return Ext.create("Terrasoft.ReportModuleViewModel", {
					values: reportConfig,
					Ext: Ext,
					sandbox: sandbox,
					Terrasoft: Terrasoft
				});
			}

			var constructor = Ext.define("ReportModule", {

				/**
				 * Параметры определяющий - востановлен ли модуль.
				 */
				restored: false,

				/**
				 * Инициализирует внутренние параметры модуля.
				 * @protected
				 * @virtual
				 */
				init: function() {
					if (!viewModel) {
						viewModel = getViewModel();
					} else {
						this.restored = true;
					}
				},

				/**
				 * Функция отрисовки модуля.
				 * @param {Ext.Element} renderTo контейнер для отрисовки модуля.
				 */
				render: function(renderTo) {
					var view = getView();
					view.bind(viewModel);
					view.render(renderTo);
					if (!this.restored) {
						var reportFilterContainer = Ext.get("report-filter-container");
						sandbox.loadModule("ReportFilterModule", {
							renderTo: reportFilterContainer
						});
						this.restored = false;
					}
				}
			});
			return constructor;
		}

		return createConstructor;

	});