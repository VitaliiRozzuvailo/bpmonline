define("SysFuncRoleInOrgRolePageV2", ["ConfigurationConstants", "SysFuncRoleInOrgRole", "BusinessRuleModule"],
	function(ConfigurationConstants, SysFuncRoleInOrgRole, BusinessRuleModule) {
		return {
			entitySchemaName: "SysFuncRoleInOrgRole",
			messages: {
				/**
				 * Сообщает разделу о необходимости вывода сообщения об актуализации ролей.
				 */
				"NeedActualizeRoles": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			methods: {

				/**
				 * Публикует сообщение о необходимости выполнить актуализацию ролей.
				 */
				publishNeedActualizeRolesMessage: function() {
					this.sandbox.publish("NeedActualizeRoles");
				},

				/**
				 * @inheritDoc Terrasoft.BasePageV2#onSaved
				 * @overridden
				 */
				onSaved: function() {
					this.callParent(arguments);
					this.publishNeedActualizeRolesMessage();
				},

				/**
				 * Формирует фильтры, котрые исключают повторение существующих записей в детали,
				 * и отображают только роли необходимого типа (функциональные или организационные)
				 * @private
				 * @param {String} columnName Название колонки, которая будет заполнятся.
				 * @return {Terrasoft.FilterGroup} Возвращает группу фильтров.
				 */
				getRoleLookupFilter: function(columnName) {
					var filters = this.Terrasoft.createFilterGroup();
					if (!(columnName === "FuncRole" || columnName === "OrgRole"))
					{
						return filters;
					}
					var fixedColumnName = "";
					switch (columnName) {
						case "FuncRole":
							fixedColumnName = "OrgRole";
							break;
						case "OrgRole":
							fixedColumnName = "FuncRole";
							break;
						default:
							break;
					}
					var role = this.get(fixedColumnName);
					if (this.Ext.isEmpty(role)) {
						return filters;
					}
					var roleFilter =  this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL,
						fixedColumnName,
						role.value);

					var sysAdminUnitTypes = [];
					switch (columnName) {
						case "FuncRole":
							sysAdminUnitTypes = [ConfigurationConstants.SysAdminUnit.Type.FuncRole];
							break;
						case "OrgRole":
							sysAdminUnitTypes = [
								ConfigurationConstants.SysAdminUnit.Type.Organisation,
								ConfigurationConstants.SysAdminUnit.Type.Department,
								ConfigurationConstants.SysAdminUnit.Type.Team
							];
							break;
						default:
							break;
					}
					var typeFilter = this.Terrasoft.createColumnInFilterWithParameters("SysAdminUnitTypeValue",
						sysAdminUnitTypes);
					var notExistsFilter = this.Terrasoft.createNotExistsFilter(
						"[SysFuncRoleInOrgRole:" + columnName + ":Id].Id");
					notExistsFilter.subFilters.addItem(roleFilter);
					filters.addItem(notExistsFilter);
					filters.addItem(typeFilter);
					return filters;
				},

				/**
				 * Добавляет фильтр для колонки FuncRole.
				 * @inheritDoc Terrasoft.BasePageV2#getLookupPageConfig
				 * @overridden
				 */
				getLookupPageConfig: function(args, columnName) {
					var entityColumn = this.entitySchema.getColumnByName(columnName);
					var filters = this.Terrasoft.createFilterGroup();
					filters.addItem(this.getLookupQueryFilters(columnName));
					filters.addItem(this.getRoleLookupFilter(columnName));
					var config = {
						entitySchemaName: args.schemaName || entityColumn.referenceSchemaName,
						multiSelect: false,
						columnName: columnName,
						columnValue: this.get(columnName),
						searchValue: args.searchValue,
						filters: filters,
						hideActions: true
					};
					this.Ext.apply(config, this.getLookupListConfig(columnName));
					return config;
				},

				/**
				 * @inheritDoc Terrasoft.BasePageV2#getLookupQuery
				 * @overridden
				 */
				getLookupQuery: function(filterValue, columnName) {
					var esq = this.callParent(arguments);
					esq.filters.addItem(this.getRoleLookupFilter(columnName));
					return esq;
				}
			},
			rules: {
				"OrgRole": {
					"BindParameterEnabledOrgRole": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "FixedColumnName"
								},
								"comparisonType":  this.Terrasoft.core.enums.ComparisonType.EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": "FuncRole"
								}
							}
						]
					}
				},
				"FuncRole": {
					"BindParameterEnabledFuncRole": {
						"ruleType": BusinessRuleModule.enums.RuleType.BINDPARAMETER,
						"property": BusinessRuleModule.enums.Property.ENABLED,
						"conditions": [
							{
								"leftExpression": {
									"type": BusinessRuleModule.enums.ValueType.ATTRIBUTE,
									"attribute": "FixedColumnName"
								},
								"comparisonType":  this.Terrasoft.core.enums.ComparisonType.EQUAL,
								"rightExpression": {
									"type": BusinessRuleModule.enums.ValueType.CONSTANT,
									"value": "OrgRole"
								}
							}
						]
					}
				}
			}
		};
	});