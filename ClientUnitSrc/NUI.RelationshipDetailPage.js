define('RelationshipDetailPage', ['ext-base', 'terrasoft', 'sandbox', 'Relationship',
	'RelationshipDetailPageStructure', 'RelationshipDetailPageResources', 'BusinessRuleModule', 'GeneralDetails',
	'ConfigurationEnums', 'MaskHelper'],
	function(Ext, Terrasoft, sandbox, Relationship, structure, resources, BusinessRuleModule,
									GeneralDetails, ConfigurationEnums) {
	structure.userCode = function() {
		this.entitySchema = Relationship;
		this.name = 'RelationshipCardViewModel';
		this.schema.leftPanel = [
			{
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'Id',
				columnPath: 'Id',
				dataValueType: Terrasoft.DataValueType.TEXT,
				visible: false,
				viewVisible: false
			},
			{
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'RelationTypeFilter',
				dataValueType: Terrasoft.DataValueType.TEXT,
				visible: false,
				viewVisible: false
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'AccountA',
				columnPath: 'AccountA',
				caption: resources.localizableStrings.AccountCaption,
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: true,
				customConfig: {
					enabled: false
				},
				rules: [{
					ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					property: BusinessRuleModule.enums.Property.VISIBLE,
					conditions: [{
						leftExpression: {
							type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							attribute: 'AccountA'
						},
						comparisonType: Terrasoft.core.enums.ComparisonType.IS_NOT_NULL
					}]
				}]
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'ContactA',
				columnPath: 'ContactA',
				caption: resources.localizableStrings.ContactCaption,
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				visible: true,
				customConfig: {
					enabled: false
				},
				rules: [{
					ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					property: BusinessRuleModule.enums.Property.VISIBLE,
					conditions: [{
						leftExpression: {
							type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							attribute: 'ContactA'
						},
						comparisonType: Terrasoft.core.enums.ComparisonType.IS_NOT_NULL
					}]
				}]
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'RelationType',
				columnPath: 'RelationType',
				caption: resources.localizableStrings.IsAsCaption,
				dataValueType: Terrasoft.DataValueType.ENUM,
				visible: true,
				filter: function() {
					var RelationTypeFilter = this.getRelType(false);
					if (!Ext.isEmpty(RelationTypeFilter)) {
						var leftExpression = RelationTypeFilter;
						var filter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							leftExpression, true);
						return filter;
					}
					return null;
				},
				dependencies: ['ReverseRelationType'],
				methodName: 'setRelationTypeByReverseRelationType'
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'AccountB',
				columnPath: 'AccountB',
				caption: resources.localizableStrings.ForCaption,
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				rules: [{
					ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					property: BusinessRuleModule.enums.Property.VISIBLE,
					conditions: [{
						leftExpression: {
							type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							attribute: 'RelationTypeFilter'

						},
						comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
						rightExpression: {
							type: BusinessRuleModule.enums.ValueType.CONSTANT,
							value: 'Account'
						}
					}]
				}],
				filter: function() {
					var accountAId = this.get('AccountA');
					var filter;
					if (accountAId) {
						filter = Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.NOT_EQUAL,
							'Id', accountAId.value);
					}
					return filter;
				}
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'ContactB',
				columnPath: 'ContactB',
				caption: resources.localizableStrings.ForCaption,
				dataValueType: Terrasoft.DataValueType.LOOKUP,
				rules: [{
					ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
					property: BusinessRuleModule.enums.Property.VISIBLE,
					conditions: [{
						leftExpression: {
							type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
							attribute: 'RelationTypeFilter'

						},
						comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
						rightExpression: {
							type: BusinessRuleModule.enums.ValueType.CONSTANT,
							value: 'Contact'
						}
					}]
				}],
				filter: function() {
					var contactAId = this.get('ContactA');
					var filter;
					if (contactAId) {
						filter = Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.NOT_EQUAL,
							'Id', contactAId.value);
					}
					return filter;
				}
			}, {
				type: Terrasoft.ViewModelSchemaItem.GROUP,
				name: 'reverseRelation',
				caption: resources.localizableStrings.ReverseRelationContainerCaption,
				visible: true,
				collapsed: false,
				wrapContainerClass: 'control-group-container',
				items: [{
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'ReverseAccountA',
					caption: resources.localizableStrings.AccountCaption,
					columnType: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					customConfig: {
						enabled: false
					},
					rules: [{
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.VISIBLE,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: 'RelationTypeFilter'

							},
							comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: 'Account'
							}
						}]
					}],
					dependencies: ['AccountB'],
					methodName: 'setReverseAccountA'
				}, {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'ReverseContactA',
					caption: resources.localizableStrings.ContactCaption,
					columnType: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					customConfig: {
						enabled: false
					},
					rules: [{
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.VISIBLE,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: 'RelationTypeFilter'

							},
							comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
							rightExpression: {
								type: BusinessRuleModule.enums.ValueType.CONSTANT,
								value: 'Contact'
							}
						}]
					}],
					dependencies: ['ContactB'],
					methodName: 'setReverseContactA'
				}, {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'ReverseRelationType',
					columnPath: 'ReverseRelationType',
					caption: resources.localizableStrings.IsAsCaption,
					dataValueType: Terrasoft.DataValueType.ENUM,
					visible: true,
					customConfig: {
						enabled: true
					},
					filter: function(esq) {
						var RelationTypeFilter = this.getRelType(true);
						if (!Ext.isEmpty(RelationTypeFilter)) {
							var leftExpression = RelationTypeFilter;
							var filter =
								Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
									leftExpression, true);
							return filter;
						}
						return esq;
					},
					dependencies: ['RelationType'],
					methodName: 'setReverseRelationTypeByRelationType'
				}, {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'ReverseAccountB',
					caption: resources.localizableStrings.ForCaption,
					columnType: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					customConfig: {
						enabled: false
					},
					rules: [{
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.VISIBLE,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: 'AccountA'
							},
							comparisonType: Terrasoft.core.enums.ComparisonType.IS_NOT_NULL
						}]
					}]
				}, {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: 'ReverseContactB',
					caption: resources.localizableStrings.ForCaption,
					columnType: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					dataValueType: Terrasoft.DataValueType.LOOKUP,
					customConfig: {
						enabled: false
					},
					rules: [{
						ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						property: BusinessRuleModule.enums.Property.VISIBLE,
						conditions: [{
							leftExpression: {
								type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
								attribute: 'ContactA'
							},
							comparisonType: Terrasoft.core.enums.ComparisonType.IS_NOT_NULL
						}]
					}]
				}]
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'Active',
				columnPath: 'Active',
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				visible: true
			}, {
				type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
				name: 'Description',
				columnPath: 'Description',
				dataValueType: Terrasoft.DataValueType.TEXT,
				visible: true,
				customConfig: {
					className: 'Terrasoft.controls.MemoEdit',
					height: '200px'
				}
			}
		];
		var setRelationType = function(relationTypeId, columnName, scope) {
			var selectRelationType = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: 'RelationType'
			});
			selectRelationType.addColumn('Id');
			selectRelationType.addColumn('Name');
			selectRelationType.addColumn('ReverseRelationType.Id');
			selectRelationType.addColumn('ReverseRelationType.Name');
			selectRelationType.getEntity(relationTypeId, function(result) {
				var entity = result.entity;
				if (entity) {
					var t = {
						displayValue: entity.get('ReverseRelationType.Name'),
						value: entity.get('ReverseRelationType.Id')
					};
					var currentValue = scope.get(columnName);
					if (Ext.isEmpty(currentValue) || currentValue.displayValue !== t.displayValue) {
						scope.set(columnName, t);
					}
				}
			}, scope);
		};
		this.methods.setRelationTypeByReverseRelationType = function() {
			var reverseRelationType = this.get('ReverseRelationType');
			if (reverseRelationType) {
				setRelationType(reverseRelationType.value, 'RelationType', this);
			} else {
				this.set('RelationType', null);
			}
		};
		this.methods.setReverseRelationTypeByRelationType = function() {
			var relationType = this.get('RelationType');
			if (relationType) {
				setRelationType(relationType.value, 'ReverseRelationType', this);
			} else {
				this.set('ReverseRelationType', null);
			}
		};
		this.methods.getRelType = function(reverse) {
			var relType = this.get('RelationTypeFilter');
			var result = 'For';
			if (!reverse) {
				if (!Ext.isEmpty(relType)) {
					if (this.get('AccountA')) {
						result = result + 'Account' + relType;
					}
					if (this.get('ContactA')) {
						result = result + 'Contact' + relType;
					}
				}
			} else {
				if (!Ext.isEmpty(relType)) {
					if (this.get('AccountA')) {
						result = result + relType + 'Account';
					}
					if (this.get('ContactA')) {
						result = result + relType + 'Contact';
					}
				}
			}
			return result;
		};
		this.methods.getRelationType = function() {
			var relType = this.get('RelationTypeFilter');
			if (Ext.isEmpty(relType)) {
				if (this.get('AccountB')) {
					return 'Account';
				}
				if (this.get('ContactB')) {
					return 'Contact';
				}
			}
			return relType;
		};
		this.methods.edit = function() {
			var sandbox = this.getSandbox();
			var recordId = this.get(this.primaryColumnName);
			var relationTypeFilterValue = this.getRelationType();
			var cardSchemaName = 'RelationshipDetailPage';
			var token = ['CardModule', cardSchemaName, 'edit', recordId, 'RelationTypeFilter', relationTypeFilterValue];
			sandbox.publish('PushHistoryState', { hash: token.join('/') });
			return true;
		};
		this.methods.setRelationTypeFilterByColumn = function() {
			var relType = this.get('RelationTypeFilter');
			if (Ext.isEmpty(relType)) {
				if (this.get('AccountB')) {
					this.set('RelationTypeFilter', 'Account');
				}
				if (this.get('ContactB')) {
					this.set('RelationTypeFilter', 'Contact');
				}
			}
		};

		this.methods.setReverseContactA = function() {
			var contactB = this.get('ContactB');
			if (contactB) {
				this.set('ReverseContactA', contactB);
			} else {
				this.set('ReverseContactA', null);
			}
		};
		this.methods.setReverseAccountA = function() {
			var accountB = this.get('AccountB');
			if (accountB) {
				this.set('ReverseAccountA', accountB);
			} else {
				this.set('ReverseAccountA', null);
			}
		};
		this.methods.init = function() {
			if (this.action === ConfigurationEnums.CardState.Add) {
				this.set('Active', true);
			}
			if (this.get('AccountA')) {
				this.set('ReverseAccountB', this.get('AccountA'));
			}
			if (this.get('AccountB')) {
				this.set('ReverseAccountA', this.get('AccountB'));
			}
			if (this.get('ContactA')) {
				this.set('ReverseContactB', this.get('ContactA'));
			}
			if (this.get('ContactB')) {
				this.set('ReverseContactA', this.get('ContactB'));
			}
		};

		this.getItemViewHeader = function() {
			return {
				columns: [
					{
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						name: 'AccountB',
						columnPath: 'AccountB',
						viewVisible: true,
						labelClass: 'campaign-campaignname'
					}
				]
			};
		};

		this.methods.getHeader = function() {
			return resources.localizableStrings.RelationshipDetailPageHeader;
		};
	};
	return structure;
});