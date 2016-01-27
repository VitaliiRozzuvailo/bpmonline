define("SysAdminOperationGranteePageV2",
	["BusinessRuleModule", "SysAdminOperationGranteePageV2Resources"],
	function(BusinessRuleModule) {
		return {
			entitySchemaName: "SysAdminOperationGrantee",
			rules: {
				"Position": {
					"DisablePositionRule": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "Id"
								},
								"comparisonType": this.Terrasoft.ComparisonType.IS_NULL
							}
						]
					}
				},
				"SysAdminUnit": {
					"DisableAbminUnitRule": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "Id"
								},
								"comparisonType": this.Terrasoft.ComparisonType.IS_NULL
							}
						]
					}
				}
			},
			methods: {
				/**
				 * Сохраняет изменения в редактируемой строке в БД.
				 * @inheritdoc BasePageV2#save
				 * @overridden
				 */
				save: function(args) {
					var config = {
						"serviceName": "RightsService",
						"methodName": "SetAdminOperationGrantee",
						"data": {
							"canExecute": this.get("CanExecute"),
							"adminUnitIds": [this.get("SysAdminUnit").value],
							"adminOperationId": this.get("SysAdminOperation").value
						}
					};
					this.callService(config, function(response) {
						if (response && response.SetAdminOperationGranteeResult) {
							var result = this.Ext.decode(response.SetAdminOperationGranteeResult);
							if (result && !this.Ext.isEmpty(result)) {
								this.changedValues = null;
								if (result.Success) {
									if (this.Ext.isFunction(args.callback)) {
										args.callback.call(args.scope);
									}
								} else {
									this.showInformationDialog(result.ExMessage, function() {
										this.onDiscardChangesClick();
										if (this.Ext.isFunction(args.callback)) {
											args.callback.call(args.scope);
										}
									});
								}
							}
						}
					}, this);
				}
			}
		};
	});