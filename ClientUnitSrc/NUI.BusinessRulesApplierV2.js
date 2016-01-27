define("BusinessRulesApplierV2", ["ext-base", "terrasoft", "BusinessRuleModule", "BusinessRulesApplierV2Resources"],
	function(Ext, Terrasoft, BusinessRuleModule, resources) {
		/**
		 * @class Terrasoft.configuration.BusinessRulesApplier
		 * Класс, который применяет бизнес-правила к представлению и модели представления схемы
		 */
		var businessRulesApplier = Ext.define("Terrasoft.configuration.BusinessRulesApplier", {
			alternateClassName: "Terrasoft.BusinessRulesApplier",
			extend: "Terrasoft.BaseObject",

			/**
			 * Класс модели представления схемы
			 * @private
			 * @type {Object}
			 */
			viewModelClass: null,

			/**
			 * Конфигурационный массив представления схемы
			 * @private
			 * @type {Object[]}
			 */
			viewConfig: null,

			/**
			 * Название свойства видимости
			 * @private
			 * @type {String}
			 */
			visiblePropertyName: "visible",

			/**
			 * Название свойства доступности
			 * @private
			 * @type {String}
			 */
			enabledPropertyName: "enabled",

			/**
			 * Название свойства обязательности заполнения
			 * @private
			 * @type {String}
			 */
			isRequiredPropertyName: "isRequired",

			/**
			 * Название свойства доступности в режиме чтения
			 * @private
			 * @type {String}
			 */
			readonlyPropertyName: "readonly",

			/**
			 * Суффикс подписи элемента управления
			 * @private
			 * @type {String}
			 */
			labelSuffix: "Label",

			/**
			 * Названия стиля подписи обязательного для заполнения элемента управления
			 * @private
			 * @type {String}
			 */
			requiredStyleName: "required-caption",

			/**
			 * Префикс метода представления модели
			 * @private
			 * @type {String}
			 */
			viewModelMethodPrefix: "Is",

			/**
			 * Префикс метода автоматической подстановки значения в поле
			 * @private
			 * @type {String}
			 */
			autoCompleteMethodPrefix: "AutoComplete",

			/**
			 * Префикс метода автоматичской очистки поля
			 * @private
			 * @type {String}
			 */
			autoCleanMethodPrefix: "AutoClean",

			/**
			 * Разделитель полного пути колонки
			 * @private
			 * @type {String}
			 */
			metaPathSeparator: ".",

			/**
			 * Суффикс названия фильтра
			 * @private
			 * @type {String}
			 */
			filterSuffix: "Filter",

			/**
			 * Применяет бизнес-правила к схеме.
			 * @param {Object} viewModelClass Класс модели представления схемы.
			 * @param {Object[]} viewConfig Конфигурационный массив представления схемы.
			 */
			applyRules: function(viewModelClass, viewConfig) {
				this.viewModelClass = viewModelClass;
				this.viewConfig = viewConfig;
				Terrasoft.each(viewModelClass.prototype.rules, function(columnRules, columnName) {
					this.applyColumnRules(columnRules, columnName);
				}, this);
			},

			/**
			 * Применяет бизнес-правила к колонке схемы.
			 * @protected
			 * @param {Object} columnRules Бизнес-правила колонки.
			 * @param {String} columnName Название колонки.
			 */
			applyColumnRules: function(columnRules, columnName) {
				Terrasoft.each(columnRules, function(rule, ruleName) {
					rule.columnName = columnName;
					this.applyRule(rule, ruleName);
				}, this);
			},

			/**
			 * Применяет бизнес-правило к колонке схемы.
			 * @protected
			 * @param {Object} rule Бизнес-правило.
			 * @param {String} ruleName Название бизнес-правила.
			 */
			applyRule: function(rule, ruleName) {
				var ruleType = rule.ruleType;
				if (Ext.isEmpty(ruleType) || Ext.isEmpty(ruleName)) {
					throw new Terrasoft.InvalidFormatException({
						message: Ext.String.format(resources.localizableStrings.InvalidRuleFormatExceptionException,
							ruleName)
					});
				}
				switch (ruleType) {
					case BusinessRuleModule.enums.RuleType.BINDPARAMETER:
						this.applyBindParameterRule(rule, ruleName);
						break;
					case BusinessRuleModule.enums.RuleType.FILTRATION:
						this.applyFiltrationRule(rule, ruleName);
						break;
					case BusinessRuleModule.enums.RuleType.AUTOCOMPLETE:
						this.applyAutoCompleteRule(rule, ruleName);
						break;
					case BusinessRuleModule.enums.RuleType.DISABLED:
						break;
					default:
						break;
				}
			},

			/**
			 * Применяет бизнес-правило по фильтрации значений в справочнике.
			 * @protected
			 * @param {Object} rule Бизнес-правило.
			 * @param {String} ruleName Название бизнес-правила.
			 */
			applyFiltrationRule: function(rule, ruleName) {
				if (Ext.isEmpty(rule.comparisonType)) {
					throw new Terrasoft.InvalidFormatException({
						message: Ext.String.format(resources.localizableStrings.InvalidRuleFormatExceptionException,
							ruleName)
					});
				}
				if (rule.autocomplete) {
					this.applyAutoCompleteRule(rule, ruleName);
				}
				var columnName = rule.columnName;
				var viewModel = this.viewModelClass.prototype;
				var columns = viewModel.columns;
				var column = columns[columnName];
				if (!column.lookupListConfig) {
					column.lookupListConfig = {};
				}
				var lookupListConfig = column.lookupListConfig;
				if (!lookupListConfig.filters) {
					lookupListConfig.filters = [];
				}
				var filters = lookupListConfig.filters;
				var scope = this;
				filters.push({
					argument: rule,
					method: function(arg) {
						var filtersCollection = Terrasoft.createFilterGroup();
						var value = scope.getRuleValue(arg, this);
						if (!Ext.isEmpty(value)) {
							filtersCollection.add(arg.baseAttributePatch + scope.filterSuffix,
								Terrasoft.createColumnFilterWithParameter(arg.comparisonType, arg.baseAttributePatch,
									value));
						}
						return filtersCollection;
					}
				});
			},

			/**
			 * Применяет бизнес-правило по автоподстановке значений в поле.
			 * @protected
			 * @param {Object} rule Бизнес-правило.
			 * @param {String} ruleName Название бизнес-правила.
			 */
			applyAutoCompleteRule: function(rule, ruleName) {
				if (!ruleName) {
					return;
				}
				var viewModel = this.viewModelClass.prototype;
				var columnName = rule.columnName;
				var ruleAttribute = rule.attribute;
				var baseAttributePatch = rule.baseAttributePatch;
				var autoCompleteMethodName = this.autoCompleteMethodPrefix + columnName + ruleAttribute;
				var autoCompleteDependencies = [];
				if (rule.ruleType === BusinessRuleModule.enums.RuleType.AUTOCOMPLETE) {
					autoCompleteDependencies.push(rule.attribute);
				} else {
					autoCompleteDependencies.push(columnName);
				}
				var columns = viewModel.columns;
				var column = columns[columnName];
				if (!column.lookupListConfig) {
					column.lookupListConfig = {};
				}
				var lookupListConfig = column.lookupListConfig;
				if (!lookupListConfig.columns) {
					lookupListConfig.columns = [];
				}
				var lookupColumns = lookupListConfig.columns;
				if (lookupColumns.indexOf(baseAttributePatch) < 0) {
					lookupColumns.push(baseAttributePatch);
				}
				var modifyRule = Terrasoft.deepClone(rule);
				if (rule.ruleType === BusinessRuleModule.enums.RuleType.AUTOCOMPLETE) {
					modifyRule.attribute = rule.columnName;
					modifyRule.columnName = rule.attribute;
					rule = modifyRule;
				}
				if (!column.dependencies) {
					column.dependencies = [];
				}
				var dependencies = column.dependencies;
				var dependency = {
					columns: [columnName],
					methodName: autoCompleteMethodName,
					argument: rule
				};
				if (dependencies.indexOf(dependency) < 0) {
					dependencies.push(dependency);
				}
				viewModel[autoCompleteMethodName] = function(currentRule) {
					var argAttribute = currentRule.attribute;
					var lookupValue = this.get(currentRule.columnName);
					var setValue = function(argAttribute, value) {
						if (this.get(argAttribute) !== value) {
							this.set(argAttribute, value);
						}
					};
					if (!Ext.isEmpty(lookupValue)) {
						var dependentValue = (!Ext.isEmpty(currentRule.baseAttributePatch)) ?
							lookupValue[currentRule.baseAttributePatch] : lookupValue;
						if (!Ext.isEmpty(dependentValue)) {
							switch (currentRule.autocompleteType) {
								case BusinessRuleModule.enums.AutocompleteType.DISPLAYVALUE:
									if (!Ext.isEmpty(dependentValue.displayValue)) {
										setValue.call(this, argAttribute, dependentValue.displayValue);
									}
									break;
								case BusinessRuleModule.enums.AutocompleteType.VALUE:
									if (!Ext.isEmpty(dependentValue.value)) {
										setValue.call(this, argAttribute, dependentValue.value);
									}
									break;
								default:
									setValue.call(this, argAttribute, dependentValue);
									break;
							}
						}
					}
				};
				if (rule.autoClean) {
					this.applyAutoCleanRule(rule);
				}
			},

			/**
			 * Применяет бизнес-правило по автоматической очистке значений в поле.
			 * @protected
			 * @param {Object} rule Бизнес-правило.
			 */
			applyAutoCleanRule: function(rule) {
				var columnName = rule.columnName;
				var ruleAttribute = rule.attribute;
				var autoCleanMethodName = this.autoCleanMethodPrefix + columnName + ruleAttribute;
				var viewModel = this.viewModelClass.prototype;
				var columns = viewModel.columns;
				var column = columns[columnName];
				var dependencies = column.dependencies = column.dependencies || [];
				var dependency = {
					columns: [ruleAttribute],
					methodName: autoCleanMethodName,
					argument: rule
				};
				if (dependencies.indexOf(dependency) === -1) {
					dependencies.push(dependency);
				}
				viewModel[autoCleanMethodName] = function() {
					var base = this.get(ruleAttribute);
					var dependent = this.get(columnName);
					if (!Ext.isEmpty(base) && !Ext.isEmpty(dependent)) {
						var dependentValue = dependent[rule.baseAttributePatch];
						var dependentValueIsEmpty = Ext.isEmpty(dependentValue);
						if ((!dependentValueIsEmpty && (base.value !== dependentValue.value)) ||
								(dependentValueIsEmpty && !this.isCopyMode())) {
							this.set(columnName, null);
						}
					}
				};
			},

			/**
			 * Применяет зависимости к модели представления.
			 * @param {Object} viewModel Модель представления.
			 */
			applyDependencies: function(viewModel) {
				var columns = viewModel.columns;
				Terrasoft.each(columns, function(column, columnName) {
					if (!Ext.isEmpty(column.multiLookupColumns)) {
						column.dependencies = column.dependencies || [];
						column.dependencies.push({
							columns: [columnName],
							methodName: "onSetMultiLookup"
						});
					}
					if (column.dependencies) {
						var dependencies = column.dependencies;
						Terrasoft.each(dependencies, function(dependency) {
							var dependentColumns = dependency.columns;
							Terrasoft.each(dependentColumns, function(dependentColumn) {
								viewModel.on("change:" + dependentColumn, function() {
									if (this.get("IsEntityInitialized") === false) {
										return;
									}
									this[dependency.methodName](dependency.argument, dependentColumn);
								}, viewModel);
							}, this);
						}, this);
					}
				}, this);
			},

			/**
			 * Применяет бизнес-правило по привязке свойств представления.
			 * @protected
			 * @param {Object} rule Бизнес-правило.
			 * @param {String} ruleName Название бизнес-правила.
			 */
			applyBindParameterRule: function(rule, ruleName) {
				if (Ext.isEmpty(rule.conditions) || Ext.isEmpty(rule.property)) {
					throw new Terrasoft.InvalidFormatException({
						message: Ext.String.format(resources.localizableStrings.InvalidRuleFormatExceptionException,
							ruleName)
					});
				}
				this.applyViewBindParameter(rule, this.viewConfig);
				this.applyViewModelBindParameter(rule);
			},

			/**
			 * Привязывает свойства представления к методам модели представления.
			 * @protected
			 * @param {Object} rule Бизнес-правило.
			 * @param {Array} viewConfig Конфигурационный массив представления схемы.
			 */
			applyViewBindParameter: function(rule, viewConfig) {
				Terrasoft.each(viewConfig, function(viewItem) {
					var viewItems = viewItem.items ? viewItem.items : viewItem.tabs;
					if (viewItems && Ext.isArray(viewItems)) {
						this.applyViewBindParameter(rule, viewItems);
					} else {
						var ruleColumnName = rule.columnName;
						var viewItemColumnName = viewItem.bindTo ? viewItem.bindTo : viewItem.name;
						var viewRuleConfig = viewItem.ruleConfig;
						var ruleConfig = viewRuleConfig ? viewRuleConfig[rule.columnName] : null;
						if ((ruleColumnName !== viewItemColumnName) && (!ruleConfig)) {
							return;
						}
						var propertyName;
						var methodName;
						if (ruleColumnName === viewItemColumnName) {
							propertyName = this.getBindPropertyName(rule.property);
						} else {
							propertyName = ruleConfig.propertyName;
						}
						methodName = this.getMethodName(rule.property, ruleColumnName);
						var controlConfig = viewItem.controlConfig;
						if (!controlConfig) {
							controlConfig = {};
							viewItem.controlConfig = controlConfig;
						}
						controlConfig[propertyName] = {
							bindTo: methodName
						};
						if (rule.property === BusinessRuleModule.enums.Property.VISIBLE ||
							rule.property === BusinessRuleModule.enums.Property.REQUIRED) {
							var labelConfig = viewItem.labelConfig;
							if (!labelConfig) {
								labelConfig = {};
								viewItem.labelConfig = controlConfig;
							}
							labelConfig[propertyName] = {
								bindTo: methodName
							};
						}
					}
				}, this);
			},

			/**
			 * Определяет результат сравнения бизнес-правила.
			 * @protected
			 * @param {Number} property Код свойства бизнес-правила.
			 * @return {String} Возвращает название свойства бизнес-правила.
			 */
			getBindPropertyName: function(property) {
				var propertyName = this.visiblePropertyName;
				switch (property) {
					case BusinessRuleModule.enums.Property.VISIBLE:
						propertyName = this.visiblePropertyName;
						break;
					case BusinessRuleModule.enums.Property.ENABLED:
						propertyName = this.enabledPropertyName;
						break;
					case BusinessRuleModule.enums.Property.REQUIRED:
						propertyName = this.isRequiredPropertyName;
						break;
					case BusinessRuleModule.enums.Property.READONLY:
						propertyName = this.readonlyPropertyName;
						break;
					default:
						break;
				}
				return propertyName;
			},

			/**
			 * Определяет название метода по применению бизнес-правила.
			 * @protected
			 * @param {Number} property Код свойства бизнес-правила.
			 * @param {Object} columnName Название колонки.
			 * @return {String} Возвращает название метода.
			 */
			getMethodName: function(property, columnName) {
				var rulePropertyName = this.getBindPropertyName(property);
				return this.viewModelMethodPrefix + columnName + rulePropertyName;
			},

			/**
			 * Создает методы модели представления, к которым будут привязываться свойства представления.
			 * @protected
			 * @param {Object} rule Бизнес-правило.
			 */
			applyViewModelBindParameter: function(rule) {
				var viewModel = this.viewModelClass.prototype;
				var scope = this;
				var columnName = rule.columnName;
				var columns = viewModel.columns;
				Terrasoft.each(rule.conditions, function(condition) {
					var leftExpression = condition.leftExpression;
					if (leftExpression && leftExpression.attribute && leftExpression.attributePath) {
						var conditionColumn = columns[leftExpression.attribute];
						if (!conditionColumn.lookupListConfig) {
							conditionColumn.lookupListConfig = {};
						}
						var lookupListConfig = conditionColumn.lookupListConfig;
						if (!lookupListConfig.columns) {
							lookupListConfig.columns = [];
						}
						var lookupColumns = lookupListConfig.columns;
						if (lookupColumns.indexOf(leftExpression.attributePath) < 0) {
							lookupColumns.push(leftExpression.attributePath);
						}
					}
				}, this);
				var methodName = this.getMethodName(rule.property, columnName);
				viewModel[methodName] = function() {
					var result = (rule.logical === Terrasoft.LogicalOperatorType.AND);
					Terrasoft.each(rule.conditions, function(condition) {
						var leftValue = scope.getRuleValue(condition.leftExpression, this);
						var rightValue = scope.getRuleValue(condition.rightExpression, this);
						var conditionResult = scope.getConditionResult(leftValue, condition.comparisonType, rightValue);
						if (rule.logical === Terrasoft.LogicalOperatorType.AND) {
							result = result && conditionResult;
						} else {
							result = result || conditionResult;
						}
						var column = this.columns[rule.columnName];
						if (column && rule.property === BusinessRuleModule.enums.Property.REQUIRED) {
							column.isRequired = result;
						}
					}, this);
					return result;
				};
			},

			/**
			 * Определяет вычисленное заначение бизнес-правила.
			 * @protected
			 * @param {Object} item Выражение бизнес-правила.
			 * @param {Object} scope Контекст выполнения функции получения значения.
			 * @return {Object} Вычисленное заначение бизнес-правила.
			 */
			getRuleValue: function(item, scope) {
				var returnValue;
				if (Ext.isEmpty(item)) {
					return null;
				}
				switch (item.type) {
					case BusinessRuleModule.enums.ValueType.CONSTANT:
						returnValue = item.value;
						break;
					case BusinessRuleModule.enums.ValueType.SYSSETTING:
						returnValue = Terrasoft.SysSettings.cachedSettings[item.value];
						break;
					case BusinessRuleModule.enums.ValueType.ATTRIBUTE:
						var itemAttribute = item.attribute;
						var itemAttributePath = item.attributePath;
						if (!Ext.isEmpty(itemAttribute)) {
							returnValue = scope.get(itemAttribute);
							var dataValueType = scope.getColumnDataType(itemAttribute);
							if (!Ext.isEmpty(returnValue) && dataValueType === Terrasoft.DataValueType.LOOKUP) {
								if (Ext.isEmpty(itemAttributePath)) {
									returnValue = returnValue.value;
								} else {
									returnValue = this.getAttributeValueByPath(returnValue, itemAttributePath);
								}
							}
						}
						break;
					case BusinessRuleModule.enums.ValueType.SYSVALUE:
						returnValue = scope.getSysDefaultValue(item.value);
						break;
					case BusinessRuleModule.enums.ValueType.CARDSTATE:
						returnValue = scope.action;
						break;
					default:
						break;
				}
				if (returnValue && returnValue.value) {
					return returnValue.value;
				}
				return returnValue;
			},

			/**
			 * Определяет результат сравнения бизнес-правила.
			 * @protected
			 * @param {Object} left Путь колонок правой части.
			 * @param {Object} type Тип сравнения.
			 * @param {Object} right Сравниваемое значение правой части.
			 * @return {Boolean} Возвращает результат сравнения бизнес-правила.
			 */
			getConditionResult: function(left, type, right) {
				var conditionResult = true;
				switch (type) {
					case Terrasoft.ComparisonType.IS_NULL:
						conditionResult = Ext.isEmpty(left);
						break;
					case Terrasoft.ComparisonType.IS_NOT_NULL:
						conditionResult = !Ext.isEmpty(left);
						break;
					case Terrasoft.ComparisonType.EQUAL:
						conditionResult = (left === right || (Ext.isEmpty(left) && Ext.isEmpty(right)));
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
					default:
						break;
				}
				return conditionResult;
			},

			/**
			 * Определяет результат сравнения бизнес-правила.
			 * @protected
			 * @param {Object} left Путь колонок правой части.
			 * @param {Object} type Тип сравнения.
			 * @param {Object} right Сравниваемое значение правой части.
			 * @return {Boolean} Возвращает результат сравнения бизнес-правила.
			 */
			getRuleComparingResult: function(left, type, right) {
				var rulePropertyCode = true;
				switch (type) {
					case Terrasoft.ComparisonType.IS_NULL:
						rulePropertyCode = Ext.isEmpty(left);
						break;
					case Terrasoft.ComparisonType.IS_NOT_NULL:
						rulePropertyCode = !Ext.isEmpty(left);
						break;
					case Terrasoft.ComparisonType.EQUAL:
						rulePropertyCode = (left === right);
						break;
					case Terrasoft.ComparisonType.NOT_EQUAL:
						rulePropertyCode = (left !== right);
						break;
					default:
						break;
				}
				return rulePropertyCode;
			},

			/**
			 * Определяет значение атрибута по пути колонок.
			 * @protected
			 * @param {Object} object Путь колонок правой части.
			 * @param {String} path Тип сравнения.
			 * @return {String} Возвращает значение атрибута по пути колонок.
			 */
			getAttributeValueByPath: function(object, path) {
				var returnValue = object;
				Terrasoft.each(path.split(this.metaPathSeparator), function(valueName) {
					if (!Ext.isEmpty(returnValue)) {
						returnValue = returnValue[valueName];
					}
				}, this);
				return returnValue;
			},

			/**
			 * Генерирует конфигурацию представления, на основе которой будут создаваться элементы управления.
			 * @protected
			 * @param {Object[]} viewConfig Конфигурация представления, объединенная по всей иерархии наследования
			 * схемы.
			 * @return {Object[]} Возвращает сгенерированное представление схемы.
			 */
			generateView: function(viewConfig) {
				var resultView = [];
				Terrasoft.each(viewConfig, function(item) {
					var itemView = this.generateItemView(item);
					resultView.push(itemView);
				}, this);
				return resultView;
			}
		});

		return Ext.create(businessRulesApplier);
	});