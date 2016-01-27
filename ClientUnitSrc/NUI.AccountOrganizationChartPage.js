define('AccountOrganizationChartPage', ['ext-base', 'terrasoft', 'sandbox', 'AccountOrganizationChart',
'AccountOrganizationChartPageStructure', 'AccountOrganizationChartPageResources', 'BusinessRuleModule'],
	function(Ext, Terrasoft, sandbox, AccountOrganizationChart, structure, resources, BusinessRuleModule) {
		structure.userCode = function() {
			this.entitySchema = AccountOrganizationChart;
			this.name = 'AccountOrganizationChartPageViewModel';
			this.getItemViewHeader = function() {
				return {
					columns: [
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Account',
							columnPath: 'Account',
							viewVisible: true,
							labelClass: 'campaign-campaignname'
						}
					]
				};
			};
			this.methods.onDepartmentChange = function() {
				var department = this.get('Department');
				if (!Ext.isEmpty(department)) {
					this.set('CustomDepartmentName', department.displayValue);
				} else {
					this.set('CustomDepartmentName', null);
				}
			};
			this.schema.leftPanel = [
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Account',
					columnPath: 'Account',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					visible: true,
					viewVisible: true,
					customConfig: {
						readonly: true
					}
				}, {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'CustomDepartmentName',
					columnPath: 'CustomDepartmentName',
					dataValueType: Terrasoft.DataValueType.TEXT,
					visible: true,
					viewVisible: true,
					dependencies: ['Department'],
					methodName: 'onDepartmentChange'
				}, {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Department',
					columnPath: 'Department',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					visible: true
				}, {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Manager',
					columnPath: 'Manager',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					visible: true,
					filter: function() {
						return Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL,
							'[ContactCareer:Contact].Account', this.get('Account').value);
					}
				}, {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Description',
					columnPath: 'Description',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					visible: true,
					customConfig: {
						className: 'Terrasoft.controls.MemoEdit',
						height: '100px'
					}
				}, {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Id',
					columnPath: 'Id',
					visible: false,
					viewVisible: false
				}, {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Parent',
					columnPath: 'Parent',
					visible: false,
					viewVisible: false
				}
			];
		};
		return structure;
	});