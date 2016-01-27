define('LeadPage', ['ext-base', 'terrasoft', 'Lead', 'LeadPageStructure', 'LeadPageResources',
	'BusinessRuleModule', 'GeneralDetails', 'ConfigurationConstants', 'MaskHelper'],
	function(Ext, Terrasoft, Lead, structure, resources, BusinessRuleModule, GeneralDetails,
			ConfigurationConstants, MaskHelper) {
		var businessRuleModule = BusinessRuleModule;
		structure.userCode = function() {
			var sandbox = this.sandbox;
			this.entitySchema = Lead;
			this.contextHelpId = '1009';
			this.name = 'LeadCardViewModel';
			this.schema.rightPanel = [
				{
					name: 'leadActivity',
					schemaName: 'ActivityDetail',
					type: Terrasoft.ViewModelSchemaItem.DETAIL,
					filterPath: 'Lead',
					filterValuePath: 'Id',
					caption: resources.localizableStrings.ActivityDetailCaption,
					visible: true,
					collapsed: false,
					leftWidth: '60%',
					rightWidth: '40%',
					wrapContainerClass: 'control-group-container'
				},
				GeneralDetails.Notes('Notes',
					{
						collapsed: false
					},
					{
						enabled: {
							bindTo: 'isCheckedEnabled'
						}
					}),
					GeneralDetails.File('Lead')
				];
			this.schema.leftPanel = [
				{
					type: Terrasoft.ViewModelSchemaItem.GROUP,
					name: 'baseElementsControlGroup',
					visible: true,
					collapsed: false,
					wrapContainerClass: 'main-elements-control-group-container',
					items: [
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							columnType: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: 'isCheckedEnabled',
							dataValueType: Terrasoft.DataValueType.BOOLEAN,
							visible: false,
							viewVisible: false
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'LeadName',
							columnPath: 'LeadName',
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: false,
							viewVisible: false
						},
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
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Contact',
							columnPath: 'Contact',
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Title',
							columnPath: 'Title',
							dataValueType: Terrasoft.DataValueType.ENUM,
							visible: true,
							advancedVisible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'FullJobTitle',
							columnPath: 'FullJobTitle',
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Status',
							columnPath: 'Status',
							dataValueType: Terrasoft.DataValueType.LOOKUP,
							visible: true,
							advancedVisible: true,
							enabled: false,
							customConfig: {
								enabled: false
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Commentary',
							columnPath: 'Commentary',
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: true,
							advancedVisible: true,
							customConfig: {
								className: 'Terrasoft.controls.MemoEdit',
								height: '100px',
								classes: {
									wrapClass: 'notes-memo-user-class'
								},
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						}
					]
				},
				{
					type: Terrasoft.ViewModelSchemaItem.GROUP,
					name: 'categorisation',
					caption: resources.localizableStrings.CategorisationGroupCaption,
					visible: true,
					collapsed: false,
					wrapContainerClass: 'control-group-container',
					items: [
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'InformationSource',
							columnPath: 'InformationSource',
							dataValueType: Terrasoft.DataValueType.ENUM,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Industry',
							columnPath: 'Industry',
							dataValueType: Terrasoft.DataValueType.LOOKUP,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'AnnualRevenue',
							columnPath: 'AnnualRevenue',
							dataValueType: Terrasoft.DataValueType.ENUM,
							visible: true,
							advancedVisible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'EmployeesNumber',
							columnPath: 'EmployeesNumber',
							columns: ['Position'],
							dataValueType: Terrasoft.DataValueType.ENUM,
							visible: true,
							advancedVisible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						}
					]
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'QualifiedContact',
					columnPath: 'QualifiedContact',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					visible: false,
					customConfig: {
						enabled: {
							bindTo: 'isCheckedEnabled'
						}
					}
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'QualifiedAccount',
					columnPath: 'QualifiedAccount',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					visible: false,
					customConfig: {
						enabled: {
							bindTo: 'isCheckedEnabled'
						}
					}
				},
				{
					type: Terrasoft.ViewModelSchemaItem.GROUP,
					name: 'communications',
					caption: resources.localizableStrings.Communications,
					visible: true,
					collapsed: false,
					wrapContainerClass: 'control-group-container',
					items: [
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'BusinesPhone',
							columnPath: 'BusinesPhone',
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'MobilePhone',
							columnPath: 'MobilePhone',
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Email',
							columnPath: 'Email',
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Fax',
							columnPath: 'Fax',
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Website',
							columnPath: 'Website',
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						}
					]
				},
				{
					type: Terrasoft.ViewModelSchemaItem.GROUP,
					name: 'useCommunication',
					caption: resources.localizableStrings.UseCommunicationGroupCaption,
					visible: true,
					collapsed: true,
					wrapContainerClass: 'control-group-container',
					items: [
						{
							type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
							name: 'DoNotUseEmail',
							columnPath: 'DoNotUseEmail',
							dataValueType: Terrasoft.DataValueType.BOOLEAN,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'DoNotUsePhone',
							columnPath: 'DoNotUsePhone',
							dataValueType: Terrasoft.DataValueType.BOOLEAN,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'DoNotUseFax',
							columnPath: 'DoNotUseFax',
							dataValueType: Terrasoft.DataValueType.BOOLEAN,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'DoNotUseSMS',
							columnPath: 'DoNotUseSMS',
							dataValueType: Terrasoft.DataValueType.BOOLEAN,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'DoNotUseMail',
							columnPath: 'DoNotUseMail',
							dataValueType: Terrasoft.DataValueType.BOOLEAN,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						}
					]
				},
				{
					type: Terrasoft.ViewModelSchemaItem.GROUP,
					name: 'address',
					caption: resources.localizableStrings.AddressGroupCaption,
					visible: true,
					collapsed: false,
					wrapContainerClass: 'control-group-container',
					items: [
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'AddressType',
							columnPath: 'AddressType',
							dataValueType: Terrasoft.DataValueType.ENUM,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Country',
							columnPath: 'Country',
							dataValueType: Terrasoft.DataValueType.LOOKUP,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Region',
							columnPath: 'Region',
							dataValueType: Terrasoft.DataValueType.LOOKUP,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							},
							rules: [
								{
									ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
									autocomplete: true,
									baseAttributePatch: 'Country',
									comparisonType: Terrasoft.ComparisonType.EQUAL,
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: 'Country'
								}
							]
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'City',
							columnPath: 'City',
							dataValueType: Terrasoft.DataValueType.LOOKUP,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							},
							rules: [
								{
									ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
									autocomplete: true,
									baseAttributePatch: 'Country',
									comparisonType: Terrasoft.ComparisonType.EQUAL,
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: 'Country'
								},
								{
									ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
									autocomplete: true,
									baseAttributePatch: 'Region',
									comparisonType: Terrasoft.ComparisonType.EQUAL,
									type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									attribute: 'Region'
								}
							]
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Zip',
							columnPath: 'Zip',
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: true,
							customConfig: {
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						},
						{
							type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
							name: 'Address',
							columnPath: 'Address',
							dataValueType: Terrasoft.DataValueType.TEXT,
							visible: true,
							customConfig: {
								className: 'Terrasoft.controls.MemoEdit',
								height: '100px',
								enabled: {
									bindTo: 'isCheckedEnabled'
								}
							}
						}
					]
				}
			];

			Terrasoft.each(this.schema.leftPanel, function(item) {
				item.leftWidth = '39%';
				item.rightWidth = '54%';
			});

			this.methods.save = function() {
				var account = this.get('Account');
				var contact = this.get('Contact');
				if (!account && !contact) {
					this.showInformationDialog(resources.localizableStrings.requiredFieldsMessage);
					return false;
				}
				else {
					return true;
				}
			};
			this.methods.qualifyLead = function() {
				var recordId = this.get('Id');
				var token = 'QualifyLead/' + recordId;
				sandbox.publish('ReplaceHistoryState', { hash: token});
			};

			this.methods.saveLead = function() {
				MaskHelper.ShowBodyMask();
				var state = sandbox.publish('GetHistoryState');
				if (this.get('Account') || this.get('Contact')) {
					this.saveEntity(this.qualifyLead);
				}
				else {
					this.showInformationDialog(resources.localizableStrings.requiredFieldsMessage);
				}
			};

			function DisqualifyLead(statusId) {
				var account = this.get('Account');
				var contact = this.get('Contact');
				if (!account && !contact) {
					this.showInformationDialog(resources.localizableStrings.requiredFieldsMessage);
					return;
				}
				var scope = this;
				this.showConfirmationDialog(resources.localizableStrings.DisqualifyLeadActionMessage,
					function(returnCode) {
						if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
							scope.set('Status', {value: statusId});
							scope.save();
						}
					}, ['yes', 'no']);
			}

			this.methods.QualifyLost = function() {
				DisqualifyLead.call(this, ConfigurationConstants.Lead.Status.QualifiedAsLost);
			};

			this.methods.QualifyNoConnection = function() {
				DisqualifyLead.call(this, ConfigurationConstants.Lead.Status.QualifiedAsNoConnection);
			};

			this.methods.QualifyNotInterested = function() {
				DisqualifyLead.call(this, ConfigurationConstants.Lead.Status.QualifiedAsNotInterested);
			};
			this.methods.DisqualifyGroup = function() {

			};


			this.methods.loadLookupName = function(schemaName, id, attributeName) {
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchemaName: schemaName
				});
				select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_COLUMN, 'value');
				select.addMacrosColumn(Terrasoft.QueryMacrosType.PRIMARY_DISPLAY_COLUMN, 'displayValue');
				select.getEntity(id, function(result) {
					var entity = result.entity;
					if (entity) {
						this.set(attributeName, entity.get('displayValue'));
					}
				}, this);
			};

			this.methods.updateActivitiesContacts = function(contactId, lead) {
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchemaName: 'Activity'
				});
				select.addColumn('Id');
				select.addColumn('Contact');
				select.addColumn('Account');
				select.filters.add("LeadFilter",
					select.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, 'Lead', this.get('Id')));

				select.getEntityCollection(function(result) {
					var collection = result.collection;
					collection.each(function(item) {
						var activityId = item.get('Id');
						var update = Ext.create("Terrasoft.UpdateQuery", {
							rootSchemaName: 'Activity'
						});
						var filters = update.filters;
						var idFilter = update.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							'Id', activityId);
						filters.add('IdFilter', idFilter);
						update.setParameterValue('Contact', contactId, Terrasoft.DataValueType.GUID);
						update.execute();
					});
				}, this);
			};
			this.methods.updateActivitiesAccounts = function(accountId, lead) {
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchemaName: 'Activity'
				});
				select.addColumn('Id');
				select.addColumn('Contact');
				select.addColumn('Account');
				select.filters.add("LeadFilter",
					select.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, 'Lead', this.get('Id')));

				select.getEntityCollection(function(result) {
					var collection = result.collection;
					collection.each(function(item) {
						var activityId = item.get('Id');
						var update = Ext.create("Terrasoft.UpdateQuery", {
							rootSchemaName: 'Activity'
						});
						var filters = update.filters;
						var idFilter = update.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							'Id', activityId);
						filters.add('IdFilter', idFilter);
						update.setParameterValue('Account', accountId, Terrasoft.DataValueType.GUID);
						update.execute();
					});
				}, this);
			};

			this.methods.init = function() {
				var account = this.get('Account');
				if (Terrasoft.isGUID(account)) {
					this.set('Account', null);
					this.loadLookupName('Account', account, 'Account');
				}
				var contact = this.get('Contact');
				if (Terrasoft.isGUID(contact)) {
					this.set('Contact', null);
					this.loadLookupName('Contact', contact, 'Contact');
				}
				var queryParams = sandbox.publish('GetHistoryState');
				var createdmessage = '';
				if (queryParams.state.Qualified) {
					if (queryParams.state.contactName && queryParams.state.isContactQualifyAsNew) {
						createdmessage += Ext.String.format(resources.localizableStrings.createdContactMessage,
							queryParams.state.contactName);
						queryParams.state.contactName = null;
					}
					if (queryParams.state.accountName && queryParams.state.isAccountQualifyAsNew) {
						if (createdmessage) {
							createdmessage += ' ';
						}
						createdmessage += Ext.String.format(resources.localizableStrings.createdAccountMessage,
							queryParams.state.accountName);
						queryParams.state.accountName = null;
					}
					if (queryParams.state.createdOpportunityTitle) {
						if (createdmessage) {
							createdmessage += ' ';
						}
						createdmessage += Ext.String.format(resources.localizableStrings.createdOpportunityMessage,
							queryParams.state.createdOpportunityTitle);
						queryParams.state.createdOpportunityTitle = null;
					}
					if (createdmessage) {
						this.showInformationDialog(createdmessage);
					}
					if (queryParams.state.contactId) {
						this.updateActivitiesContacts(queryParams.state.contactId, this.get('Id'));
					}
					if (queryParams.state.accountId) {
						this.updateActivitiesAccounts(queryParams.state.accountId, this.get('Id'));
					}
					queryParams.state.Qualified = false;
					var currentHash = queryParams.hash;
					var currentState = queryParams.state;
					var newState = Terrasoft.deepClone(queryParams);
					sandbox.publish('ReplaceHistoryState', {
						stateObj: newState,
						pageTitle: null,
						hash: currentHash.historyState,
						silent: true
					});
				}
				Terrasoft.SysSettings.querySysSettingsItem('LeadStatusDef',
					function(value) {
						if (value && !this.get('Status')) {
							var esq = Ext.create('Terrasoft.EntitySchemaQuery', {
								rootSchemaName: 'LeadStatus'
							});
							esq.addColumn('Id');
							esq.addColumn('Name');
							esq.getEntity(value, function(result) {
								var entity = result.entity;
								if (entity) {
									var sysSetting = {
										displayValue: entity.get('Name'),
										value: entity.get('Id')
									};
									this.set('Status', sysSetting);
								}
							}, this);
						}
						var isCE = this.get('isCheckedEnabled');
						var status = this.get('Status');
						var vm = this;
						if (isCE === undefined) {
							Terrasoft.SysSettings.querySysSettingsItem('LeadStatusDef',
								function(value) {
									var viewModel = vm;
									if (status) {
										isCE = status.value === value;
										viewModel.set('isCheckedEnabled', isCE);
										viewModel.set('isQualifyVisible', isCE);
									}
								}, this);
						}
					}, this);
			};
			this.actions = [
				{
					caption: resources.localizableStrings.QualifyLeadActionCaption,
					schemaName: 'QualifyLead',
					methodName: 'saveLead',
					customConfig: {
						visible: {
							bindTo: 'isQualifyVisible'
						}
					}
				},
				{
					caption: resources.localizableStrings.disqualifyLeadActionCaption,
					methodName: 'DisqualifyGroup',
					isRootMenu: true,
					customConfig: {
						visible: {
							bindTo: 'isQualifyVisible'
						}
					},
					menu: {
						items: [
							{
								caption: resources.localizableStrings.disqualifyLeadLost,
								click: {
									bindTo: 'QualifyLost'
								}
							},
							{
								caption: resources.localizableStrings.disqualifyLeadNoConnection,
								click: {
									bindTo: 'QualifyNoConnection'
								}
							},
							{
								caption: resources.localizableStrings.disqualifyLeadNotInterested,
								click: {
									bindTo: 'QualifyNotInterested'
								}
							}
						]
					}
				}
			];
		};
		return structure;
	});