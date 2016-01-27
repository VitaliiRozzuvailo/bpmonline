define('ActivityPage', ['ext-base', 'terrasoft', 'sandbox', 'Activity', 'ActivityPageStructure',
		'ActivityPageResources', 'BusinessRuleModule', 'ConfigurationConstants', 'ConfigurationEnums',
		'BaseFiltersGenerateModule', 'GeneralDetails', 'ActivityUtilities'],
		function(Ext, Terrasoft, sandbox, Activity, structure, resources,
			BusinessRuleModule, ConfigurationConstants, ConfigurationEnums, BaseFiltersGenerateModule, GeneralDetails,
			ActivityUtilities) {

			var remindingGroup = {
				type: Terrasoft.ViewModelSchemaItem.GROUP,
				name: 'reminding',
				caption: resources.localizableStrings.RemindingGroupCaption,
				visible: true,
				collapsed: false,
				wrapContainerClass: 'control-group-container',
				items: [
					{
						type: ConfigurationEnums.CustomViewModelSchemaItem.ITEMS_GROUP,
						name: 'reminding-container',
						caption: resources.localizableStrings.RemindToOwnerCaption,
						id: 'reminding-container',
						wrapContainerClass: 'controlCaption',
						visible: true,
						items: [
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								caption: resources.localizableStrings.RemindToOwnerCaption,
								name: 'RemindToOwner',
								columnPath: 'RemindToOwner',
								dataValueType: Terrasoft.DataValueType.BOOLEAN,
								visible: true,
								wrapClass: 'RemindToOwner',
								id: 'RemindToOwner'
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								caption: ' ',
								name: 'RemindToOwnerDate',
								columnPath: 'RemindToOwnerDate',
								dataValueType: Terrasoft.DataValueType.DATE_TIME,
								visible: true,
								wrapContainerClass: 'RemindToOwnerDate',
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
										property: BusinessRuleModule.enums.Property.ENABLED,
										conditions: [
											{
												leftExpression: {
													type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
													attribute: 'RemindToOwner'
												},
												comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
												rightExpression: {
													type: BusinessRuleModule.enums.ValueType.CONSTANT,
													value: true
												}
											}
										]
									}
								],
								dependencies: ['RemindToOwner'],
								methodName: 'setDefaultRemindToOwner'
							}
						]
					},
					{
						type: ConfigurationEnums.CustomViewModelSchemaItem.ITEMS_GROUP,
						name: 'reminding-to-autor-container',
						caption: resources.localizableStrings.RemindToAuthorCaption,
						id: 'reminding-to-autor-container',
						wrapContainerClass: 'controlCaption',

						visible: true,
						items: [
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								caption: ' ',
								name: 'RemindToAuthor',
								columnPath: 'RemindToAuthor',
								dataValueType: Terrasoft.DataValueType.BOOLEAN,
								visible: true,
								wrapClass: 'RemindToOwner'
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								caption: ' ',
								name: 'RemindToAuthorDate',
								columnPath: 'RemindToAuthorDate',
								dataValueType: Terrasoft.DataValueType.DATE_TIME,
								visible: true,
								wrapContainerClass: 'RemindToOwnerDate',
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
										property: BusinessRuleModule.enums.Property.ENABLED,
										conditions: [
											{
												leftExpression: {
													type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
													attribute: 'RemindToAuthor'
												},
												comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
												rightExpression: {
													type: BusinessRuleModule.enums.ValueType.CONSTANT,
													value: true
												}
											}
										]
									}
								],
								dependencies: ['RemindToAuthor'],
								methodName: 'setDefaultRemindToAuthor'
							}
						]
					}
				]
			};

			structure.userCode = function() {
				this.entitySchema = Activity;
				this.contextHelpId = '1010';
				this.name = 'ActivityCardViewModel';
				this.schema.rightPanel = [
					{
						name: 'activity',
						schemaName: 'ActivityParticipantDetail',
						type: Terrasoft.ViewModelSchemaItem.DETAIL,
						filterPath: 'Activity',
						filterValuePath: 'Id',
						caption: resources.localizableStrings.ActivityParticipantDetailCaption,
						visible: true,
						leftWidth: '60%',
						rightWidth: '40%',
						wrapContainerClass: 'control-group-container'
					},
					GeneralDetails.Notes('Notes'),
					Ext.apply(GeneralDetails.File('Activity'), {collapsed: false})
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
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Id',
								columnPath: 'Id',
								visible: false,
								viewVisible: false
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Type',
								columnPath: 'Type',
								dataValueType: Terrasoft.DataValueType.ENUM,
								visible: false,
								viewVisible: false
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'ProcessElementId',
								columnPath: 'ProcessElementId',
								visible: false,
								viewVisible: false
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'AllowedResult',
								columnPath: 'AllowedResult',
								visible: false,
								viewVisible: false
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Title',
								columnPath: 'Title',
								dataValueType: Terrasoft.DataValueType.TEXT,
								visible: true,
								customConfig: {
									className: 'Terrasoft.controls.MemoEdit',
									height: '100px'
								}
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Owner',
								columnPath: 'Owner',
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								visible: true,
								filter: BaseFiltersGenerateModule.OwnerFilter
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'ActivityCategory',
								columnPath: 'ActivityCategory',
								dataValueType: Terrasoft.DataValueType.ENUM,
								visible: true,
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
										property: BusinessRuleModule.enums.Property.VISIBLE,
										conditions: [
											{
												leftExpression: {
													type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
													attribute: 'Type'
												},
												comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
												rightExpression: {
													type: BusinessRuleModule.enums.ValueType.CONSTANT,
													value: ConfigurationConstants.Activity.Type.Task
												}
											}
										]
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										baseAttributePatch: 'ActivityType',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Type'
									}
								],
								dependencies: ['Type'],
								methodName: 'setDefaultActivityValues'
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'StartDate',
								columnPath: 'StartDate',
								dataValueType: Terrasoft.DataValueType.DATE_TIME,
								visible: true
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'DueDate',
								columnPath: 'DueDate',
								dataValueType: Terrasoft.DataValueType.DATE_TIME,
								visible: true,
								dependencies: ['StartDate'],
								methodName: 'setDueDate'
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Priority',
								columnPath: 'Priority',
								dataValueType: Terrasoft.DataValueType.ENUM,
								visible: true,
								advancedVisible: true,
								isRequired: true
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Author',
								columnPath: 'Author',
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								visible: true,
								advancedVisible: true,
								isRequired: true,
								filter: BaseFiltersGenerateModule.OwnerFilter
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'ShowInScheduler',
								columnPath: 'ShowInScheduler',
								dataValueType: Terrasoft.DataValueType.BOOLEAN,
								visible: true,
								advancedVisible: true,
								dependencies: ['ActivityCategory'],
								methodName: 'setDefaultShowInScheduler'
							}
						]
					},
					{
						type: Terrasoft.ViewModelSchemaItem.GROUP,
						name: 'status',
						caption: resources.localizableStrings.StatusGroupCaption,
						visible: true,
						collapsed: false,
						wrapContainerClass: 'control-group-container',
						items: [
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Status',
								columnPath: 'Status',
								dataValueType: Terrasoft.DataValueType.ENUM,
								visible: true,
								isRequired: true
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Result',
								columnPath: 'Result',
								dataValueType: Terrasoft.DataValueType.ENUM,
								visible: true,
								filter: function() {
									var filter;
									var type = this.get('ActivityCategory');
									if (!Ext.isEmpty(type)) {
										filter = Terrasoft.createColumnFilterWithParameter(
											Terrasoft.ComparisonType.EQUAL,
											'[ActivityCategoryResultEntry:ActivityResult].ActivityCategory',
											type.value);
									}
									return filter;
								},
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
										property: BusinessRuleModule.enums.Property.ENABLED,
										conditions: [
											{
												leftExpression: {
													type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
													attribute: 'Status',
													attributePath: 'Finish'
												},
												comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
												rightExpression: {
													type: BusinessRuleModule.enums.ValueType.CONSTANT,
													value: true
												}
											}
										]
									}
								],
								dependencies: ['Status'],
								methodName: 'clearIfNotFinish'
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'DetailedResult',
								columnPath: 'DetailedResult',
								dataValueType: Terrasoft.DataValueType.TEXT,
								visible: true,
								advancedVisible: true,
								customConfig: {
									className: 'Terrasoft.controls.MemoEdit',
									height: '100px'
								},
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
										property: BusinessRuleModule.enums.Property.ENABLED,
										conditions: [
											{
												leftExpression: {
													type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
													attribute: 'Status',
													attributePath: 'Finish'
												},
												comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
												rightExpression: {
													type: BusinessRuleModule.enums.ValueType.CONSTANT,
													value: true
												}
											}
										]
									}
								]
							}
						]
					},
					remindingGroup,
					{
						type: Terrasoft.ViewModelSchemaItem.GROUP,
						name: 'bounds',
						caption: resources.localizableStrings.BoundGroupCaption,
						visible: true,
						collapsed: false,
						wrapContainerClass: 'control-group-container',
						items: [
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
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Account',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Account'
									}
								]
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Opportunity',
								columnPath: 'Opportunity',
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								visible: true,
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Contact',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Contact'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Account',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Account'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Campaign',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Campaign'
									}
								]
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Document',
								columnPath: 'Document',
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								visible: true,
								advancedVisible: true,
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Account',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Account'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Contact',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Contact'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Campaign',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Campaign'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Opportunity',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Opportunity'
									}
								]
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Campaign',
								columnPath: 'Campaign',
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								visible: true,
								advancedVisible: true
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Lead',
								columnPath: 'Lead',
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								visible: true,
								advancedVisible: true,
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'QualifiedAccount',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Account'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'QualifiedContact',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Contact'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Campaign',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Campaign'
									}
								]
							}
						]
					}
				];
				this.defineMethods();
			};

			structure.userCodeInProcessMode = function() {
				this.entitySchema = Activity;
				this.name = 'ActivityCardViewModel';
				this.schema.rightPanel = [
					{
						name: 'activity',
						schemaName: 'ActivityParticipantDetail',
						type: Terrasoft.ViewModelSchemaItem.DETAIL,
						filterPath: 'Activity',
						filterValuePath: 'Id',
						caption: resources.localizableStrings.ActivityParticipantDetailCaption,
						visible: true,
						leftWidth: '60%',
						rightWidth: '40%',
						wrapContainerClass: 'control-group-container'
					},
					GeneralDetails.Notes('Notes'),
					GeneralDetails.File('Activity'),
					GeneralDetails.InFolder('Activity')
				];
				this.schema.leftPanel = [
					{
						type: Terrasoft.ViewModelSchemaItem.GROUP,
						name: 'general',
						caption: '',
						visible: true,
						collapsed: false,
						wrapContainerClass: 'control-group-container',
						items: [
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Id',
								columnPath: 'Id',
								visible: false,
								viewVisible: false
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Type',
								columnPath: 'Type',
								dataValueType: Terrasoft.DataValueType.ENUM,
								visible: false,
								viewVisible: false
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'ProcessElementId',
								columnPath: 'ProcessElementId',
								visible: false,
								viewVisible: false
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'AllowedResult',
								columnPath: 'AllowedResult',
								visible: false,
								viewVisible: false
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Title',
								columnPath: 'Title',
								dataValueType: Terrasoft.DataValueType.TEXT,
								visible: true,
								customConfig: {
									className: 'Terrasoft.controls.MemoEdit',
									height: '100px'
								}
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'ActivityCategory',
								columnPath: 'ActivityCategory',
								dataValueType: Terrasoft.DataValueType.ENUM,
								visible: false,
								advancedVisible: true,
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
										property: BusinessRuleModule.enums.Property.VISIBLE,
										conditions: [
											{
												leftExpression: {
													type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
													attribute: 'Type'
												},
												comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
												rightExpression: {
													type: BusinessRuleModule.enums.ValueType.CONSTANT,
													value: ConfigurationConstants.Activity.Type.Task
												}
											}
										]
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										baseAttributePatch: 'ActivityType',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Type'
									}
								],
								dependencies: ['Type'],
								methodName: 'setDefaultActivityValues'
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'StartDate',
								columnPath: 'StartDate',
								dataValueType: Terrasoft.DataValueType.DATE_TIME,
								visible: true
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'DueDate',
								columnPath: 'DueDate',
								dataValueType: Terrasoft.DataValueType.DATE_TIME,
								visible: true,
								dependencies: ['StartDate'],
								methodName: 'setDueDate'
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Owner',
								columnPath: 'Owner',
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								visible: true,
								filter: BaseFiltersGenerateModule.OwnerFilter
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Priority',
								columnPath: 'Priority',
								dataValueType: Terrasoft.DataValueType.ENUM,
								visible: false,
								advancedVisible: true,
								isRequired: true
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Author',
								columnPath: 'Author',
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								visible: false,
								advancedVisible: true,
								isRequired: true,
								filter: BaseFiltersGenerateModule.OwnerFilter
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'ShowInScheduler',
								columnPath: 'ShowInScheduler',
								dataValueType: Terrasoft.DataValueType.BOOLEAN,
								visible: false,
								advancedVisible: true,
								dependencies: ['ActivityCategory'],
								methodName: 'setDefaultShowInScheduler'
							}
						]
					},
					{
						type: Terrasoft.ViewModelSchemaItem.GROUP,
						name: 'status',
						caption: resources.localizableStrings.StatusGroupCaption,
						collapsed: false,
						wrapContainerClass: 'control-group-container',
						items: [
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Status',
								columnPath: 'Status',
								dataValueType: Terrasoft.DataValueType.ENUM,
								visible: true,
								isRequired: true
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Result',
								columnPath: 'Result',
								dataValueType: Terrasoft.DataValueType.ENUM,
								visible: true,
								filter: function() {
									var filter;
									var type = this.get('ActivityCategory');
									if (!Ext.isEmpty(type)) {
										filter = Terrasoft.createColumnFilterWithParameter(
											Terrasoft.ComparisonType.EQUAL,
											'[ActivityCategoryResultEntry:ActivityResult].ActivityCategory',
											type.value);
									}
									return filter;
								},
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
										property: BusinessRuleModule.enums.Property.REQUIRED,
										logicalOperation: Terrasoft.LogicalOperatorType.AND,
										conditions: [
											{
												leftExpression: {
													type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
													attribute: 'ProcessElementId'
												},
												comparisonType: Terrasoft.core.enums.ComparisonType.IS_NOT_NULL
											},
											{
												leftExpression: {
													type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
													attribute: 'Status',
													attributePath: 'Finish'
												},
												comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
												rightExpression: {
													type: BusinessRuleModule.enums.ValueType.CONSTANT,
													value: true
												}
											}
										]
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
										property: BusinessRuleModule.enums.Property.ENABLED,
										conditions: [
											{
												leftExpression: {
													type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
													attribute: 'Status',
													attributePath: 'Finish'
												},
												comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
												rightExpression: {
													type: BusinessRuleModule.enums.ValueType.CONSTANT,
													value: true
												}
											}
										]
									}
								],
								dependencies: ['Status'],
								methodName: 'clearIfNotFinish'
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'DetailedResult',
								columnPath: 'DetailedResult',
								dataValueType: Terrasoft.DataValueType.TEXT,
								visible: true,
								advancedVisible: true,
								customConfig: {
									className: 'Terrasoft.controls.MemoEdit',
									height: '100px'
								},
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.BINDPARAMETER,
										property: BusinessRuleModule.enums.Property.ENABLED,
										conditions: [
											{
												leftExpression: {
													type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
													attribute: 'Status',
													attributePath: 'Finish'
												},
												comparisonType: Terrasoft.core.enums.ComparisonType.EQUAL,
												rightExpression: {
													type: BusinessRuleModule.enums.ValueType.CONSTANT,
													value: true
												}
											}
										]
									}
								]
							}
						],
						customConfig: {
							visible: {
								bindTo: 'isStatusGroupVisible'
							}
						}
					},
					{
						type: Terrasoft.ViewModelSchemaItem.GROUP,
						name: 'result',
						caption: resources.localizableStrings.ResultGroupCaption,
						collapsed: false,
						wrapContainerClass: 'control-group-container',
						items: [
							{
								type: ConfigurationEnums.CustomViewModelSchemaItem.ITEMS_GROUP,
								name: 'results-container',
								id: 'results-container',
								wrapContainerClass: 'results-container',
								visible: true
							}
						],
						customConfig: {
							visible: {
								bindTo: 'isResultGroupVisible'
							}
						}
					},
					remindingGroup,
					{
						type: Terrasoft.ViewModelSchemaItem.GROUP,
						name: 'bounds',
						caption: resources.localizableStrings.BoundGroupCaption,
						visible: true,
						collapsed: true,
						wrapContainerClass: 'control-group-container',
						items: [
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
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Account',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Account'
									}
								]
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Opportunity',
								columnPath: 'Opportunity',
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								visible: true,
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Contact',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Contact'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Account',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Account'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Campaign',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Campaign'
									}
								]
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Document',
								columnPath: 'Document',
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								visible: true,
								advancedVisible: true,
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Account',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Account'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Contact',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Contact'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Campaign',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Campaign'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Opportunity',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Opportunity'
									}
								]
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Campaign',
								columnPath: 'Campaign',
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								visible: true,
								advancedVisible: true
							},
							{
								type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
								name: 'Lead',
								columnPath: 'Lead',
								dataValueType: Terrasoft.DataValueType.LOOKUP,
								visible: true,
								advancedVisible: true,
								rules: [
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'QualifiedAccount',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Account'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'QualifiedContact',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Contact'
									},
									{
										ruleType: BusinessRuleModule.enums.RuleType.FILTRATION,
										autocomplete: true,
										autoClean: false,
										baseAttributePatch: 'Campaign',
										comparisonType: Terrasoft.ComparisonType.EQUAL,
										type: BusinessRuleModule.enums.ValueType.ATTRIBUTE,
										attribute: 'Campaign'
									}
								]
							}
						]
					}
				];
				this.defineMethods();
			};

			structure.customizeView = function customizeView(scope, viewModel, loadCardViewCallback) {
				ActivityUtilities.customizeView(scope, viewModel, loadCardViewCallback, resources);
			};

			structure.defineMethods = function() {
				this.methods.resultButtonClick = function(event, dom, options, buttonTag) {
					var tag = Ext.decode(buttonTag);
					this.set('Status', tag.status);
					this.set('Result', tag.result);
					this.set('resultSelected', true);
				};
				this.methods.cancelResultSelected = function() {
					this.set('Status', ConfigurationConstants.Activity.Status.NotStarted);
					this.set('Result', null);
					this.set('resultSelected', false);
				};
				this.methods.save = function() {
					var startDate = this.get('StartDate');
					var dueDate = this.get('DueDate');
					if (!Ext.isDate(startDate) || !Ext.isDate(dueDate)) {
						return false;
					}
					startDate = new Date(startDate.setMilliseconds(0));
					startDate = new Date(startDate.setSeconds(0));
					dueDate = new Date(dueDate.setMilliseconds(0));
					dueDate = new Date(dueDate.setSeconds(0));
					this.set('StartDate', startDate);
					this.set('DueDate', dueDate);
					if (startDate > dueDate) {
						this.showInformationDialog(resources.localizableStrings.StartDateGreaterDueDate);
						return false;
					} else {
						return true;
					}
				};
				this.methods.init = function() {
					var startDate = this.get('StartDate');
					if (!Ext.isDate(startDate)) {
						return;
					}
					if (this.action !== 'copy') {
						var dueDate = new Date(startDate.getTime() + 30 * 60000);
						if (this.isNew) {
							this.set('DueDate', dueDate);
						}
					}
				};
				var parentMethodEdit = function() {
					return false;
				};
				this.methods.edit = function() {
					var procElId = this.get('ProcessElementId');
					var recordId = this.get('Id');
					if (procElId && !Terrasoft.isEmptyGUID(procElId)) {
						sandbox.publish('ProcessExecDataChanged',
							{
								procElUId: procElId,
								recordId: recordId,
								scope: this,
								parentMethodArguments: null,
								parentMethod: parentMethodEdit
							});
						return true;
					}
					return false;
				};
				this.methods.setDueDate = function() {
					var startDate = this.get('StartDate');
					var dueDate = this.get('DueDate');
					if (!Ext.isDate(startDate)) {
						return;
					}
					startDate = new Date(startDate.setMilliseconds(0));
					startDate = new Date(startDate.setSeconds(0));
					if (startDate > dueDate) {
						this.set('DueDate', startDate);
					}
				};
				this.methods.setDefaultRemindToOwner = function() {
					var remindToOwner = this.get('RemindToOwner');
					if (remindToOwner) {
						var startDate = this.get('StartDate');
						if (!Ext.isDate(startDate)) {
							return;
						}
						startDate = new Date(startDate.setMilliseconds(0));
						startDate = new Date(startDate.setSeconds(0));
						this.set('RemindToOwnerDate', startDate);
					} else {
						this.set('RemindToOwnerDate', null);
					}
				};
				this.methods.setDefaultRemindToAuthor = function() {
					var remindToOwner = this.get('RemindToAuthor');
					if (remindToOwner) {
						var dueDate = this.get('DueDate');
						if (!Ext.isDate(dueDate)) {
							return;
						}
						dueDate = new Date(dueDate.setMilliseconds(0));
						dueDate = new Date(dueDate.setSeconds(0));
						this.set('RemindToAuthorDate', dueDate);
					} else {
						this.set('RemindToAuthorDate', null);
					}
				};
				this.methods.setDefaultShowInScheduler = function() {
					var activityCategory = this.get('ActivityCategory');
					if (activityCategory &&
						activityCategory.value === ConfigurationConstants.Activity.ActivityCategory.Meeting) {
						this.set('ShowInScheduler', true);
					}
				};
				this.methods.setDefaultActivityValues = function() {
					var type = this.get('Type');
					var category;
					switch (type.value) {
						case ConfigurationConstants.Activity.Type.Call:
							category = ConfigurationConstants.Activity.ActivityCategory.Call;
							break;
						case ConfigurationConstants.Activity.Type.Email:
							category = ConfigurationConstants.Activity.ActivityCategory.Email;
							break;
						default:
							category = ConfigurationConstants.Activity.ActivityCategory.DoIt;
							break;
					}
					var select = Ext.create('Terrasoft.EntitySchemaQuery', {
						rootSchemaName: 'ActivityCategory'
					});
					select.addColumn('Id');
					select.addColumn('Name');
					select.getEntity(category, function(result) {
						var entity = result.entity;
						if (entity) {
							var t = {
								displayValue: entity.get('Name'),
								value: entity.get('Id')
							};
							this.set('ActivityCategory', t);
						}
					}, this);
				};
				this.methods.clearIfNotFinish = function() {
					var status = this.get('Status');
					if (status && status.Finish === false) {
						this.set('Result', null);
						this.set('DetailedResult', null);
					}
				};
			};
			return structure;
		}
);
