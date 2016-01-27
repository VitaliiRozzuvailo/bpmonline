define('BusinessRuleModule', ['ext-base', 'terrasoft', 'BusinessRuleModuleResources'],
	function(Ext, Terrasoft, resources) {
		var enums = {
			Property: {
				VISIBLE: 0,
				ENABLED: 1,
				REQUIRED: 2,
				READONLY: 3
			},
			RuleType: {
				DISABLED: -1,
				BINDPARAMETER: 0,
				FILTRATION: 1,
				AUTOCOMPLETE: 2
			},
			AutocompleteType: {
				ASIS: 0,
				VALUE: 1,
				DISPLAYVALUE: 2
			},
			ValueType: {
				CONSTANT: 0,
				ATTRIBUTE: 1,
				SYSSETTING: 2,
				SYSVALUE: 3,
				CARDSTATE: 4
			}
		};

		function getAttributeValueByPath(object, path) {
			var returnValue = object;
			Terrasoft.each(path.split('.'), function(valueName) {
				if (!Ext.isEmpty(returnValue)) {
					returnValue = returnValue[valueName];
				}
			}, this);
			return returnValue;
		}

		function getRuleValue(item, scope) {
			var returnValue;
			if (Ext.isEmpty(item)) {
				return null;
			}
			switch (item.type) {
				case enums.ValueType.CONSTANT:
					returnValue = item.value;
					break;
				case enums.ValueType.SYSSETTING:
					returnValue = Terrasoft.SysSettings.cachedSettings[item.value];
					break;
				case enums.ValueType.ATTRIBUTE:
					var itemAttribute = item.attribute;
					var itemAttributePath = item.attributePath;
					if (!Ext.isEmpty(itemAttribute)) {
						returnValue = scope.get(itemAttribute);
						var dataValueType = scope.getColumnDataType(itemAttribute);
						if (!Ext.isEmpty(returnValue) && dataValueType === Terrasoft.DataValueType.LOOKUP) {
							if (Ext.isEmpty(itemAttributePath)) {
								returnValue = returnValue.value;
							} else {
								returnValue = getAttributeValueByPath(returnValue, itemAttributePath);
							}
						}
					}
					break;
				case enums.ValueType.SYSVALUE:
					returnValue = scope.getSysDefaultValue(item.value);
					break;
				case enums.ValueType.CARDSTATE:
					returnValue = scope.action;
					break;
			}
			if (returnValue && returnValue.value) {
				return returnValue.value;
			}
			return returnValue;
		}

		function getModuleName(item) {
			var methodName;
			switch (item.type) {
				case enums.ValueType.CONSTANT:
					methodName = item.type;
					break;
				case enums.ValueType.SYSVALUE:
				case enums.ValueType.SYSSETTING:
					methodName = item.value;
					break;
				case enums.ValueType.ATTRIBUTE:
					methodName = item.attribute;
					var itemAttributePath = item.attributePath;
					if (!Ext.isEmpty(itemAttributePath)) {
						methodName += itemAttributePath;
					}
					break;
			}
			return methodName;
		}

		function comparisonRule(left, type, right) {
			var conditionResult = true;
			switch (type) {
				case Terrasoft.ComparisonType.IS_NULL:
					conditionResult = Ext.isEmpty(left);
					break;
				case Terrasoft.ComparisonType.IS_NOT_NULL:
					conditionResult = !Ext.isEmpty(left);
					break;
				case Terrasoft.ComparisonType.EQUAL:
					conditionResult = (left === right);
					break;
				case Terrasoft.ComparisonType.NOT_EQUAL:
					conditionResult = (left !== right);
					break;
				case Terrasoft.ComparisonType.GREATER:
					conditionResult = (left > right);
					break;
				case Terrasoft.ComparisonType.LESS:
					conditionResult = (left < right);
					break;
			}
			return conditionResult;
		}

		function prepareViewRule(view, rules) {
			Terrasoft.each(rules, function(rule) {
				var ruleAttribute = rule.baseAttribute;
				var ruleProperty = rule.property;
				var propertyMap = {};
				propertyMap[enums.Property.VISIBLE] = 'visible';
				propertyMap[enums.Property.ENABLED] = 'enabled';
				propertyMap[enums.Property.REQUIRED] = 'isRequired';
				propertyMap[enums.Property.READONLY] = 'readonly';
				if (!Ext.isEmpty(rule.conditions) && !Ext.isEmpty(ruleProperty)) {
					var methodName = ruleAttribute + 'GetIsPropertyEnum' + ruleProperty;
					var bindingConfig = view.bindings[ruleAttribute] || {};
					var attributeProperty = propertyMap[ruleProperty];
					bindingConfig[attributeProperty] = {bindTo: methodName};
					view.bindings[ruleAttribute] = bindingConfig;
				}
			}, this);
		}

		function prepareViewModelRule(viewModel) {
			Terrasoft.each(viewModel.entitySchemaInfo.rules, function(rule) {
				var ruleBaseAttribute = rule.baseAttribute;
				var ruleAttribute = rule.attribute;
				var ruleProperty = rule.property;
				if (rule.ruleType === enums.RuleType.BINDPARAMETER && !Ext.isEmpty(rule.conditions) &&
					!Ext.isEmpty(ruleProperty)) {
					var methodName = ruleBaseAttribute + 'GetIsPropertyEnum' + ruleProperty;
					viewModel.methods[methodName] = function(args) {
						var rule = this[arguments.callee.$name].rule;
						var bReturn = (rule.logical === Terrasoft.LogicalOperatorType.AND);
						Terrasoft.each(rule.conditions, function(condition) {
							var leftValue = getRuleValue(condition.leftExpression, this);
							var rightValue = getRuleValue(condition.rightExpression, this);
							var conditionResult = comparisonRule(leftValue, condition.comparisonType, rightValue);
							if (rule.logical === Terrasoft.LogicalOperatorType.AND) {
								bReturn = bReturn && conditionResult;
							} else {
								bReturn = bReturn || conditionResult;
							}
						}, this);
						var column = this.columns[rule.baseAttribute];
						if (column && ruleProperty === enums.Property.REQUIRED) {
							var labelControl = Ext.get(rule.baseAttribute + 'ControlLabel');
							if (labelControl) {
								if (bReturn) {
									labelControl.addCls('required-caption');
								} else {
									labelControl.removeCls('required-caption');
								}
							}
							column.isRequired = bReturn;
						}
						return bReturn;
					};
					viewModel.methods[methodName].rule = rule;
				}

				if (rule.ruleType === enums.RuleType.AUTOCOMPLETE || rule.ruleType === enums.RuleType.FILTRATION) {
					var info = viewModel.entitySchemaInfo;
					if (rule.ruleType === enums.RuleType.AUTOCOMPLETE || rule.autocomplete) {
						var autoCompleteMethodName = 'BusinessRuleAutoComplete' + ruleBaseAttribute + ruleAttribute;
						var autoCompleteDependencies = [];
						if (rule.ruleType === enums.RuleType.AUTOCOMPLETE) {
							autoCompleteDependencies.push(rule.attribute);
						} else {
							autoCompleteDependencies.push(ruleBaseAttribute);
						}
						info.dependencies.push({
							dependencies: autoCompleteDependencies,
							methodName: autoCompleteMethodName,
							argument: rule
						});
						var modifyRule = Terrasoft.deepClone(rule);
						if (rule.ruleType === enums.RuleType.AUTOCOMPLETE) {
							modifyRule.attribute = rule.baseAttribute;
							modifyRule.baseAttribute = rule.attribute;
						}
						viewModel.methods[autoCompleteMethodName] = function() {
							var currentRule = this[arguments.callee.$name].rule;
							var argAttribute = currentRule.attribute;
							var solo = this.get(currentRule.baseAttribute);
							var dependent = this.get(argAttribute);
							var setValue = function(argAttribute, value) {
								if (this.get(argAttribute) !== value) {
									this.set(argAttribute, value);
								}
							};
							if (!Ext.isEmpty(solo)) {
								var soloDependent = (!Ext.isEmpty(currentRule.baseAttributePatch)) ?
									solo[currentRule.baseAttributePatch] : solo;
								if (!Ext.isEmpty(soloDependent)) {
									switch (currentRule.autocompleteType) {
										case enums.AutocompleteType.DISPLAYVALUE:
											if (!Ext.isEmpty(soloDependent.displayValue)) {
												setValue.call(this, argAttribute, soloDependent.displayValue);
											}
											break;
										case enums.AutocompleteType.VALUE:
											if (!Ext.isEmpty(soloDependent.value)) {
												setValue.call(this, argAttribute, soloDependent.value);
											}
											break;
										default:
											setValue.call(this, argAttribute, soloDependent);
											break;

									}
								}
							}
						};
						viewModel.methods[autoCompleteMethodName].methodName = autoCompleteMethodName;
						viewModel.methods[autoCompleteMethodName].rule = modifyRule;
					}

					if (rule.autoClean) {
						var autoCleanMethodName = 'BusinessRuleAutoClean' + ruleAttribute + ruleBaseAttribute;
						info.dependencies.push({
							dependencies: [ruleAttribute],
							methodName: autoCleanMethodName,
							argument: rule
						});
						viewModel.methods[autoCleanMethodName] = function(arg) {
							var currentRule = this[arguments.callee.$name].rule;
							var argAttribute = currentRule.attribute;
							var argBaseAttribute = currentRule.baseAttribute;
							var solo = this.get(argAttribute);
							var dependent = this.get(argBaseAttribute);
							if (!Ext.isEmpty(solo) && !Ext.isEmpty(dependent)) {
								var dependentSolo = dependent[currentRule.baseAttributePatch];
								if ((!Ext.isEmpty(dependentSolo) && (solo.value !== dependentSolo.value)) ||
									Ext.isEmpty(dependentSolo)) {
									this.set(argBaseAttribute, null);
								}
							}
						};
						viewModel.methods[autoCleanMethodName].methodName = autoCleanMethodName;
						viewModel.methods[autoCleanMethodName].rule = rule;
					}
					if (rule.ruleType === enums.RuleType.FILTRATION && !Ext.isEmpty(rule.comparisonType)) {
						if (!info.filters[ruleBaseAttribute]) {
							info.filters[ruleBaseAttribute] = [];
						}
						info.filters[ruleBaseAttribute].push({
							argument: rule,
							method: function(arg) {
								var filter;
								var value = getRuleValue(arg, this);
								if (!Ext.isEmpty(value)) {
									filter = Terrasoft.createColumnFilterWithParameter(arg.comparisonType,
										arg.baseAttributePatch, value);
								}
								return filter;
							}
						});
					}
				}
			}, this);
		}

		return {
			enums: enums,
			getRuleValue: getRuleValue,
			prepareViewRule: prepareViewRule,
			prepareViewModelRule: prepareViewModelRule
		};
	});
