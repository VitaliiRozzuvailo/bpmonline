define('DocumentSection', ['Document', 'DocumentSectionStructure',
	'DocumentSectionResources', 'BaseFiltersGenerateModule', 'VisaHelper', 'css!VisaHelper'],
	function(Document, structure, resources, BaseFiltersGenerateModule, VisaHelper) {
	structure.userCode = function() {
		this.entitySchema = Document;
		this.contextHelpId = '1005';
		this.name = 'DocumentSectionViewModel';
		this.columnsConfig = [
			[
				{
					cols: 24,
					key: [
						{
							name: {
								bindTo: 'Number'
							},
							type: 'title'
						}
					]
				}
			],
			[
				{
					cols: 6,
					key: [
						{
							name: {
								bindTo: 'Date'
							}
						}
					]
				},
				{
					cols: 3,
					key: [
						{
							name: {
								bindTo: 'Type'
							}
						}
					]
				},
				{
					cols: 3,
					key: [
						{
							name: {
								bindTo: 'Status'
							}
						}
					]
				},
				{
					cols: 3,
					key: [
						{
							name: {
								bindTo: 'Owner'
							}
						}
					]
				}
			]
		];
		this.loadedColumns = [{
			columnPath: 'Number'
		}, {
			columnPath: 'Date'
		}, {
			columnPath: 'Type'
		}, {
			columnPath: 'Status'
		}, {
			columnPath: 'Owner'
		}];
		this.actions = getActions();
		this.fixedFilterConfig = {
			entitySchema: Document,
			filters: [
				{
					name: 'PeriodFilter',
					caption: resources.localizableStrings.PeriodFilterCaption,
					dataValueType: Terrasoft.DataValueType.DATE,
					startDate: {
						columnName: 'Date',
						defValue: Terrasoft.startOfWeek(new Date())
					},
					dueDate: {
						columnName: 'Date',
						defValue: Terrasoft.endOfWeek(new Date())
					}
				},
				{
					name: 'Owner',
					caption: resources.localizableStrings.OwnerFilterCaption,
					columnName: 'Owner',
					defValue: Terrasoft.SysValue.CURRENT_USER_CONTACT,
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					filter: BaseFiltersGenerateModule.OwnerFilter
				}
			]
		};
		this.methods.esqConfig = {
			sort: {
				columns: [
					{
						name: 'Date',
						orderPosition: 0,
						orderDirection: Terrasoft.OrderDirection.ASC
					}
				]
			}
		};
		this.methods.sendToVisa = VisaHelper.SendToVisaMethod;
	};

	function getActions() {
		var actions = [];
		var visaElement = Terrasoft.deepClone(VisaHelper.SendToVisaMenuItem);
		visaElement.enabled = {
			bindTo: 'isSingleSelected'
		};
		actions.push({
			caption: '',
			className: 'Terrasoft.MenuSeparator'
		}, visaElement);
		return actions;
	}
	return structure;
});