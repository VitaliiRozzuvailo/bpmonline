define('PrintableProcessModule', ['PrintableProcessModuleResources', 'ViewUtilities', 'BaseProcessViewModelClass',
	'ProcessHelper', 'ReportUtilities', 'LocalizationUtilities', 'SysModuleReport'],
	function(resources, ViewUtilities, BaseProcessViewModelClass, ProcessHelper, ReportUtilities,
		LocalizationUtilities, SysModuleReport) {

	function createConstructor(context) {

		var Ext = context.Ext;
		var sandbox = context.sandbox;
		var Terrasoft = context.Terrasoft;
		var viewModel;
		var viewConfig;
		var processData;

		function getViewModelConfig(config) {
			var viewModelConfig = {
				columns: {},
				values: {
					message: null,
					pageHeader: null
				},
				methods: {
					onPrintClick: function() {
						var sysModuleReportUId = this.get('PrintableId');
						var printablePackageId = this.get('PrintablePackageId');
						if (!Terrasoft.isGUID(sysModuleReportUId) && !Terrasoft.isGUID(printablePackageId)) {
							return;
						}

						var select = Ext.create('Terrasoft.EntitySchemaQuery', {rootSchema: SysModuleReport});
						select.addColumn('Id');
						select.addColumn('Caption', 'NonLocalizedCaption');
						LocalizationUtilities.addLocalizableColumn(select, 'Caption');
						select.addColumn('Type.Name', 'TypeName');
						select.addColumn('SysModule.SysModuleEntity.SysEntitySchemaUId', 'SchemaUId');
						select.addColumn('SysReportSchemaUId');

						if (Terrasoft.isGUID(printablePackageId)) {
							select.filters.add('packageFilter',
								Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"[SysModuleReportInPackage:SysModuleReport].SysModuleReportPackage",
									printablePackageId));
						} else {
							select.filters.add('primFilter',
								Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
									"Id", sysModuleReportUId));
						}

						select.getEntityCollection(function(response) {
							if (response && response.success) {
								var items = response.collection.getItems();
								Terrasoft.each(items, function(entity) {
									this.onSysReportLoad(entity);
								}, this);
								this.showConfirmationDialog(resources.localizableStrings.NextByProcessConfirm,
									this.onConfirmClick, ['yes', 'no']);
							}
						}, this);
					},

					onSysReportLoad: function(entity) {
						var schemaUId = entity.get('SchemaUId');
						var reportId = entity.get('SysReportSchemaUId');
						var recordId = Terrasoft.deepClone(this.get('PrintedRecordId') || '');
						var filterGroup = Terrasoft.createFilterGroup();
						filterGroup.name = 'primaryColumnFilter';
						filterGroup.logicalComparisonTypes = Terrasoft.LogicalOperatorType.AND;
						var filter = Terrasoft.createColumnInFilterWithParameters('Id', [recordId]);
						filterGroup.addItem(filter);
						var reportParameters = {
							Filters: filterGroup.serialize()
						};
						var reportCaption = entity.get('Caption') || entity.get('NonLocalizedCaption');
						var config = {
							caption: reportCaption,
							schemaUId: schemaUId,
							reportId: reportId,
							recordId: recordId,
							reportParameters: reportParameters,
							type: entity.get('TypeName')
						};
						ReportUtilities.generateReport('reportCaption', config);
					},

					onConfirmClick: function(result) {
						if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
							this.onNextClick();
						}
					},

					onNextClick: function() {
						this.acceptProcessElement();
					},

					onLoad: function() {
						var processData = this.processData;
						this.set('pageHeader', (processData && !Ext.isEmpty(processData.recommendation) ?
							processData.recommendation : resources.localizableStrings.DefHeaderCaption));
						if (processData) {
							Terrasoft.each(this.processData.parameters, function(param, name) {
								var value = param;
								if (ProcessHelper.getIsDateTimeDataValueType(param.dataValueType)) {
									value = Terrasoft.parseDate(param.value);
								}
								this.set(name, value);
							}, this);
						}
					}
				}
			};
			Ext.apply(viewModelConfig, config);
			return viewModelConfig;
		}

		function getViewConfig() {
			var headerMainContainer = ViewUtilities.getContainerConfig('header', 'header');
			var headerNameContainer = ViewUtilities.getContainerConfig('header-name-container',
				'header-name-container header-name-container-full');
			headerNameContainer.items = [{
				className: 'Terrasoft.Label',
				id: 'captionLabel',
				caption: {
					bindTo: 'pageHeader'
				}
			}];
			headerMainContainer.items = [
				headerNameContainer
			];

			var labelContainer = ViewUtilities.getContainerConfig('labelMessageContainer', 'labelMessageContainer');
			labelContainer.items = [{
				className: 'Terrasoft.Label',
				id: 'messageLabel',
				caption: {
					bindTo: 'PrintableDescription'
				}
			}];

			var buttonContainer = ViewUtilities.getContainerConfig('buttonContainer', 'buttonContainer');
			buttonContainer.items = [{
				className: 'Terrasoft.Button',
				caption:  resources.localizableStrings.PrintButtonCaption,
				style: Terrasoft.controls.ButtonEnums.style.GREEN,
				click: {
					bindTo: 'onPrintClick'
				}
			}, {
				className: 'Terrasoft.Button',
				caption: resources.localizableStrings.NextButtonCaption,
				style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
				click: {
					bindTo: 'onNextClick'
				}
			}];

			var pageConfig = ViewUtilities.getContainerConfig('CardMainContainer', 'CardMainContainer');
			pageConfig.items = [
				headerMainContainer,
				buttonContainer,
				labelContainer
			];
			return pageConfig;
		}

		function render(renderTo) {
			processData = ProcessHelper.getProcessElementData(sandbox);
			var viewModelConfig = getViewModelConfig({});
			viewModel = Ext.create('Terrasoft.BaseProcessViewModel', viewModelConfig);
			viewModel.sandbox = sandbox;
			viewModel.processData = processData;
			viewConfig = getViewConfig();

			var config = Terrasoft.deepClone(viewConfig);
			var view = Ext.create('Terrasoft.Container', config);
			view.bind(viewModel);
			view.render(renderTo);
			viewModel.onLoad();
		}

		return Ext.define('PrintableProcessModule', {
			render: function(renderTo) {
				render(renderTo, this);
			}
		});
	}
	return createConstructor;
});