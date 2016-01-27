define('AccountBillingInfoPage', ['ext-base', 'terrasoft', 'sandbox', 'AccountBillingInfo',
	'AccountBillingInfoPageStructure', 'AccountBillingInfoPageResources'],
	function(Ext, Terrasoft, sandbox, AccountBillingInfo, structure, resources) {
		structure.userCode = function() {
			this.entitySchema = AccountBillingInfo;
			this.name = 'AccountBillingInfoCardViewModel';
			var contactCareerFilter = function() {
				return Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					'[ContactCareer:Contact].Account',
					this.get('Account').value);
			};

			this.schema.leftPanel = [
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Id',
					columnPath: 'Id',
					visible: false,
					viewVisible: false
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Account',
					columnPath: 'Account',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					visible: true,
					customConfig: {
						enabled: false
					}
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Name',
					columnPath: 'Name',
					dataValueType: Terrasoft.DataValueType.TEXT,
					visible: true,
					viewVisible: true
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Country',
					columnPath: 'Country',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					columns: ['BillingInfo'],
					visible: true,
					viewVisible: true
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'BillingInfo',
					columnPath: 'BillingInfo',
					customConfig: {
						className: 'Terrasoft.controls.MemoEdit',
						height: '100px'
					},
					visible: true,
					viewVisible: true,
					dependencies: ['Country'],
					methodName: 'countryChanged'
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'AccountManager',
					columnPath: 'AccountManager',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					visible: true,
					viewVisible: true//,
					//filter: contactCareerFilter
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'ChiefAccountant',
					columnPath: 'ChiefAccountant',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					visible: true,
					viewVisible: true//,
					//filter: contactCareerFilter
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Description',
					columnPath: 'Description',
					visible: true,
					customConfig: {
						className: 'Terrasoft.controls.MemoEdit',
						height: '100px'
					}
				}
			];
			Terrasoft.applySchemaItemProperties(this.schema.leftPanel, 'AccountManager', {
				filter: contactCareerFilter
			});
			Terrasoft.applySchemaItemProperties(this.schema.leftPanel, 'ChiefAccountant', {
				filter: contactCareerFilter
			});

			this.getItemViewHeader = function() {
				return {
					columns: [
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Account',
							columnPath: 'Account',
							viewVisible: true,
							labelClass: 'account-accountname'
						}
					]
				};
			};
			this.methods.countryChanged = function() {
				var buttonsConfig = {
					buttons: [Terrasoft.MessageBoxButtons.YES.returnCode,
						Terrasoft.MessageBoxButtons.NO.returnCode],
					defaultButton: 0
				};
				var billingInfo = this.get('BillingInfo');
				var country = this.get('Country');
				if (!Ext.isEmpty(country)) {
					if (billingInfo) {
						this.showInformationDialog(resources.localizableStrings.CountryIsChange,
							this.getSelectedButton, buttonsConfig);
					}
					else {
						this.set('BillingInfo', country.BillingInfo);
					}
				}
			};
			this.methods.getSelectedButton = function(returnCode) {
				if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
					var country = this.get('Country');
					this.set('BillingInfo', country.BillingInfo);
				}
			};
		};

		return structure;
	});