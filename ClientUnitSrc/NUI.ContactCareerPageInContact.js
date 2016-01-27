define('ContactCareerPageInContact', ['ext-base', 'terrasoft', 'sandbox', 'ContactCareer',
	'ContactCareerPageInContactStructure', 'ContactCareerPageInContactResources'],
	function(Ext, Terrasoft, sandbox, ContactCareer, structure, resources) {

		structure.userCode = function() {
			var entityCollection;
			var currentOnInit;
			var primaryOnInit;
			this.entitySchema = ContactCareer;
			this.name = 'ContactCareerCardViewModel';
			this.schema.leftPanel = [
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Id',
					columnPath: 'Id',
					visible: false,
					viewVisible: false
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Account',
					columnPath: 'Account',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					visible: true
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Contact',
					columnPath: 'Contact',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					visible: true,
					customConfig: {
						enabled: false
					}
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Job',
					columnPath: 'Job',
					dataValueType: Terrasoft.DataValueType.ENUM,
					visible: true
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'JobTitle',
					columnPath: 'JobTitle',
					dataValueType: Terrasoft.DataValueType.TEXT,
					visible: true,
					dependencies: ['Job'],
					methodName: 'onJobChange'
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Department',
					columnPath: 'Department',
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					visible: true
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'StartDate',
					columnPath: 'StartDate',
					dataValueType: Terrasoft.DataValueType.DATE,
					visible: true
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'DueDate',
					columnPath: 'DueDate',
					dataValueType: Terrasoft.DataValueType.DATE,
					visible: true,
					dependencies: ['Current'],
					methodName: 'onCurrentChange'
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Primary',
					columnPath: 'Primary',
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					visible: true
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Current',
					columnPath: 'Current',
					dataValueType: Terrasoft.DataValueType.BOOLEAN,
					visible: true
				},
				{
					type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
					name: 'JobChangeReason',
					columnPath: 'JobChangeReason',
					dataValueType: Terrasoft.DataValueType.ENUM,
					visible: true
				},
				{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'Description',
					columnPath: 'Description',
					dataValueType: Terrasoft.DataValueType.TEXT,
					visible: true
				}
			];

			this.methods = {
				init: function() {
					currentOnInit = this.get('Current');
					primaryOnInit = this.get('Primary');
				},

				onJobChange: function() {
					var job = this.get('Job');
					if (!Ext.isEmpty(job)) {
						this.set('JobTitle', job.displayValue);
					}
				},

				onCurrentChange: function() {
					var current = this.get('Current');
					if (current) {
						this.set('DueDate', null);
					} else {
						this.set('DueDate', new Date());
					}
				},

				save: function() {
					var startDate = this.get('StartDate');
					var dueDate = this.get('DueDate');
					if (dueDate !== null) {
						if (startDate > dueDate) {
							this.showInformationDialog(resources.localizableStrings.WarningWrongDate);
							return;
						}
					}
					var current = this.get('Current');
					var primary = this.get('Primary');
					if (current && primary) {
						var contactId = this.get('Contact').value;
						this.getContactCareerCollection(contactId);
					} else {
						this.saveEntity(this.onSaved);
					}
				},

				getContactCareerCollection: function(contactId) {
					var select = Ext.create('Terrasoft.EntitySchemaQuery', {
							rootSchemaName: 'ContactCareer'
						}
					);
					select.addColumn('Id');
					select.addColumn('Contact');
					select.addColumn('Account');
					select.addColumn('Job');
					select.filters.add("CareerIdFilter",
						select.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.NOT_EQUAL, 'Id', this.get('Id')));
					select.filters.add("CurrentIdFilter",
						select.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, 'Contact', contactId));
					select.filters.add("CurrentFilter",
						select.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, 'Current', true));
					select.filters.add("PrimaryFilter",
						select.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, 'Primary', true));
					select.getEntityCollection(this.onGetSelectResult, this);
				},

				onGetSelectResult: function(response) {
					entityCollection = response.collection;
					var buttonsConfig = {
						buttons: [Terrasoft.MessageBoxButtons.YES.returnCode,
							Terrasoft.MessageBoxButtons.NO.returnCode],
						defaultButton: 0
					};
					if (entityCollection.getCount() > 0) {
						var message = resources.localizableStrings.ChangeContactJob;
						var oldContact = entityCollection.getItems()[0].get('Contact').displayValue;
						var oldAccount =  entityCollection.getItems()[0].get('Account').displayValue;
						var oldJob = entityCollection.getItems()[0].get('Job');
						var oldJobTitle = '';
						if (oldJob) {
							oldJobTitle = oldJob.displayValue;
						}
						this.showInformationDialog(Ext.String.format(message, oldContact, oldAccount, oldJobTitle),
							this.getSelectedButton, buttonsConfig);
					} else {
						this.saveEntity(this.onSaved);
					}
				},

				getSelectedButton: function(returnCode) {
					if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
						this.saveEntity(this.onAnswerYes, this);
					} else {
						this.saveEntity(this.onAnswerNo, this);
					}
				},

				onAnswerNo: function() {
					var oldContactCareer = entityCollection.getItems()[0].get('Id');
					var update = Ext.create("Terrasoft.UpdateQuery", {
						rootSchema: ContactCareer
					});
					update.filters.add('ContactIdFilter',
						update.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, 'Id', oldContactCareer));
					update.setParameterValue('Current', false);
					update.setParameterValue('DueDate', new Date());
					update.execute();
					this.onSaved();
				},

				onAnswerYes: function() {
					var oldContactCareer = entityCollection.getItems()[0].get('Id');
					var update = Ext.create("Terrasoft.UpdateQuery", {
						rootSchema: ContactCareer
					});
					update.filters.add('ContactIdFilter',
						update.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, 'Id', oldContactCareer));
					update.setParameterValue('Primary', false);
					update.execute();
					this.onSaved();
				}
			};
		};
		return structure;
	});