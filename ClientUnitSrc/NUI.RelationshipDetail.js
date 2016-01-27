define('RelationshipDetail', ['ext-base', 'terrasoft', 'sandbox', 'VwAccountRelationship', 'VwContactRelationship',
		'Contact', 'Account', 'ConfigurationConstants', 'ConfigurationEnums', 'RelationshipDetailStructure',
		'RelationshipDetailResources'], function(Ext, Terrasoft, sandbox, VwAccountRelationship, VwContactRelationship,
		Contact, Account, ConfigurationConstants, ConfigurationEnums, structure, resources) {
	structure.userCode = function() {
		switch (this.filterPath) {
			case 'Contact':
				this.entitySchema = VwContactRelationship;
				break;
			case 'Account':
				this.entitySchema = VwAccountRelationship;
				break;
		}
		this.name = 'RelationshipDetailViewModel';
		this.editPageName = 'RelationshipDetailPage';
		this.editPages = [{
			caption: resources.localizableStrings.AddContact,
			name: 'AddContact',
			bindTo: 'addAddContact'
		}, {
			caption: resources.localizableStrings.AddAccount,
			name: 'AddAccount',
			bindTo: 'addAddAccount'
		}];

		this.methods.addAddContact = function() {
			this.addContact();
		};

		this.methods.addAddAccount = function() {
			this.addAccount();
		};

		this.methods.addContact = function() {
			this.add(null, function() {
				this.openItem(ConfigurationEnums.CardState.Add, Contact.name);
			});
		};

		this.methods.addAccount = function() {
			this.add(null, function() {
				this.openItem(ConfigurationEnums.CardState.Add, Account.name);
			});
		};

		this.methods.openItem = function(action, relationTypeFilterValue) {
			var scope = this;
			var recordId;
			if (!relationTypeFilterValue) {
//				var selectedRows = this.GetSelectedItems();
				var elements;
				if (scope.get('multiSelect')) {
					elements = scope.get('selectedRows');
				} else {
					var activeRow = scope.get('activeRow');
					elements = activeRow ? [activeRow] : [];
				}
				recordId = elements.pop();
				var gridData = this.get('gridData');
				var row = gridData.get(recordId);
				relationTypeFilterValue = row.get('RelatedContact') ? 'Contact' : 'Account';
			}
			var cardModuleId = sandbox.id + '_CardModule_' + this.entitySchema.name;
			sandbox.subscribe('CardModuleEntityInfo', function() {
				var entityInfo = {};
				entityInfo.action = action;
				entityInfo.cardSchemaName = scope.editPageName;
				entityInfo.activeRow = recordId;
				entityInfo.valuePairs = [{
					name: scope.filterPath + 'A',
					value: scope.filterValue
				}, {
					name: 'RelationTypeFilter',
					value: relationTypeFilterValue
				}];
				return entityInfo;
			}, [cardModuleId]);
			sandbox.publish('OpenCardModule', cardModuleId, [this.getCardModuleSandboxId()]);
			sandbox.subscribe('UpdateDetail', function() {
				scope.isObsolete = true;
			}, [cardModuleId]);
		};

		this.methods.edit = function() {
			this.openItem(ConfigurationEnums.CardState.Edit);
		};

		this.methods.copy = function() {
			this.openItem(ConfigurationEnums.CardState.Copy);
		};

		this.columnsConfig = [[
			{
				cols: 8,
				key: [{name: {bindTo: this.filterPath}}]
			}, {
				cols: 8,
				key: [{name: {bindTo: 'RelatedAccount'}}]
			}, {
				cols: 8,
				key: [{name: {bindTo: 'RelatedContact'}}]
			}, {
				cols: 8,
				key: [{name: {bindTo: 'ReverseRelationType'}}]
			}
		]];

		this.loadedColumns = [{
			columnPath: this.filterPath
		}, {
			columnPath: 'RelatedAccount'
		}, {
			columnPath: 'RelatedContact'
		}, {
			columnPath: 'RelationType'
		}, {
			columnPath: 'ReverseRelationType'
		}, {
			columnPath: 'Active'
		}];

		var parentApplyFilter = this.methods.applyFilter;
		this.methods.applyFilter = function(select, args) {
			var filterPath = this.filterPath;
			var filterValue = this.filterValue;
			if (args) {
				filterPath = this.filterPath = args.filterPath;
				filterValue = this.filterValue = args.filterValue;
			}
			if (filterPath === 'Account') {
				var filterAccountA = Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, 'Account', filterValue);
				select.filters.add('filterAccountA', filterAccountA);
				return false;
			} else if (filterPath === 'Contact') {
				var filterContactA = Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, 'Contact', filterValue);
				select.filters.add('filterContactA', filterContactA);
				return false;
			} else {
				parentApplyFilter.apply(this, arguments);
				return true;
			}
		};
	};
	return structure;
});