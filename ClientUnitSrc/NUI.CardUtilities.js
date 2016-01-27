define("CardUtilities", ["BusinessRuleModule", "ConfigurationEnums"],
	function(BusinessRuleModule, ConfigurationEnums) {

		function generateItemInfo(schemaItem) {
			var itemType = schemaItem.type;
			var itemColumnPath = schemaItem.columnPath;
			switch (itemType) {
				case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
					Terrasoft.each(schemaItem.columns, function(column) {
						addColumnToCollection(itemColumnPath, column);
					}, this);
					Terrasoft.each(schemaItem.orders, function(order) {
						addOrderToCollection(schemaItem, order);
					}, this);
					if (schemaItem.filter) {
						var filters = this.info.filters;
						if (Ext.isEmpty(filters[itemColumnPath])) {
							filters[itemColumnPath] = [];
						}
						filters[itemColumnPath].push(schemaItem.filter);
					}
					if (schemaItem.rules !== undefined) {
						var rules = this.info.rules;
						Terrasoft.each(schemaItem.rules, function(itemRule) {
							if (Ext.isEmpty(itemRule.logical)) {
								itemRule.logical = Terrasoft.LogicalOperatorType.AND;
							}
							if (!Ext.isEmpty(itemRule.conditions) && !Ext.isEmpty(itemRule.property)) {
								Terrasoft.each(itemRule.conditions, function(condition) {
									prepareExpression(condition.leftExpression);
									prepareExpression(condition.rightExpression);
								}, this);
							}
							if (itemRule.ruleType === BusinessRuleModule.enums.RuleType.FILTRATION ||
								itemRule.ruleType === BusinessRuleModule.enums.RuleType.AUTOCOMPLETE) {
								if (Ext.isEmpty(itemRule.type)) {
									itemRule.type = Terrasoft.FilterType.COMPARE;
								}
								if (Ext.isEmpty(itemRule.autocomplete)) {
									itemRule.autocomplete = false;
								}
								if (Ext.isEmpty(itemRule.autocompleteType)) {
									itemRule.autocompleteType =  BusinessRuleModule.enums.AutocompleteType.ASIS;
								}
								if (Ext.isEmpty(itemRule.autoClean)) {
									itemRule.autoClean =
										(itemRule.ruleType === BusinessRuleModule.enums.RuleType.FILTRATION);
								}
								addColumnToCollection(schemaItem.name, itemRule.baseAttributePatch);
								prepareExpression(itemRule);
							}
							var rule = itemRule;
							rule.baseAttribute = schemaItem.name;
							rules.push(rule);
						}, this);
					}
					if (schemaItem.info !== undefined) {
						var info = this.info.info;
						schemaItem.info.baseAttribute = schemaItem.name;
						info.push(schemaItem.info);
					}
					if (schemaItem.lookupPageSettings !== undefined) {
						var lookupOptions = this.info.lookupOptions;
						if (Ext.isEmpty(lookupOptions[schemaItem.name])) {
							lookupOptions[schemaItem.name] = {};
						}
						lookupOptions[schemaItem.name] = schemaItem.lookupPageSettings;
					}
					if (!Ext.isEmpty(schemaItem.dependencies) && !Ext.isEmpty(schemaItem.methodName)) {
						var dependencies = this.info.dependencies;
						dependencies.push({
							dependencies: schemaItem.dependencies,
							methodName: schemaItem.methodName,
							argument: schemaItem.argument
						});
					}
					break;
				case Terrasoft.ViewModelSchemaItem.GROUP:
					addGroup(schemaItem);
					if (schemaItem.items !== undefined) {
						Terrasoft.each(schemaItem.items, generateItemInfo, this);
					}
					break;
				case ConfigurationEnums.CustomViewModelSchemaItem.ITEMS_GROUP:
					if (schemaItem.items !== undefined) {
						Terrasoft.each(schemaItem.items, generateItemInfo, this);
					}
					break;
				case ConfigurationEnums.CustomViewModelSchemaItem.RADIO_GROUP:
					Terrasoft.each(schemaItem.items, function(radioItem) {
						prepareRadioGroupItem.call(this, schemaItem, radioItem);
					}, this);
					break;
				case Terrasoft.ViewModelSchemaItem.DETAIL:
					addGroup(schemaItem);
					var detail = {
						name: schemaItem.name,
						schemaName: schemaItem.schemaName,
						entitySchemaName: schemaItem.entitySchemaName,
						filterPath: schemaItem.filterPath,
						filterValuePath: schemaItem.filterValuePath,
						filterLogicalOperationType: schemaItem.filterLogicalOperationType,
						collapsed: typeof(schemaItem.collapsed) === "undefined" ? true : schemaItem.collapsed,
						useProfile: schemaItem.useProfile
					};
					var details = this.info.details;
					details.push(detail);
					break;
				case Terrasoft.ViewModelSchemaItem.MODULE:
					addGroup(schemaItem);
					var module = {
						name: schemaItem.name,
						moduleName: schemaItem.moduleName
					};
					var modules = this.info.modules;
					modules.push(module);
					break;
				default:
					break;
			}
		}

		function prepareRadioGroupItem(radioGroup, radioItem) {
			if (Ext.isEmpty(radioItem)) {
				return;
			}
			var radios = this.info.radios;
			var group = radioGroup.group;
			var tag = radioItem.tag;
			if (!Ext.isEmpty(group) && !Ext.isEmpty(tag)) {
				var variants = radios[group] || [];
				if (variants.indexOf(tag) < 0) {
					variants.push(tag);
				}
				radios[group] = variants;
			}
			Terrasoft.each(radioItem.items, generateItemInfo, this);
		}

		function prepareExpression(item) {
			if (Ext.isEmpty(item)) {
				return;
			}
			addColumnToCollection(item.attribute, item.attributePath);
			var itemValue = item.value;
			if (item.type === BusinessRuleModule.enums.ValueType.SYSSETTING && !Ext.isEmpty(itemValue)) {
				addSysSettingToCollection(itemValue);
			}
		}

		function isDetail(schemaItem) {
			return schemaItem.type === Terrasoft.ViewModelSchemaItem.DETAIL;
		}

		function addGroup(schemaItem) {
			var groups = this.info.groups || [];
			if (Ext.isEmpty(schemaItem.id)) {
				schemaItem.id = Terrasoft.generateGUID() + "-group";
			}
			var caption = schemaItem.caption;
			var name = schemaItem.name;
			var id = schemaItem.id;
			var isDetailItem = isDetail(schemaItem);
			if (Ext.isEmpty(name) || Ext.isEmpty(caption)) {
				return;
			}
			var groupConfig = {
				id: id,
				containerId: id,
				name: name,
				isDetail: isDetailItem,
				caption: caption
			};
			if (schemaItem.visible !== null) {
				groupConfig.visible = schemaItem.visible;
			}
			groups.push(groupConfig);
		}

		function addOrderToCollection(schemaItem, order) {
			var orders = this.info.orders;
			var columnPath = schemaItem.columnPath;
			var orderColumnPath = order.columnPath;
			var orderDirection = order.direction || Terrasoft.OrderDirection.ASC;
			var orderPosition = order.position || 1;

			if (!Ext.isEmpty(orderColumnPath)) {
				var columnOrders = orders[columnPath] = orders[columnPath] || [];
				var isExist = false;
				Terrasoft.each(columnOrders, function(item) {
					if (item.columnPath === orderColumnPath) {
						isExist = true;
						item.direction = orderDirection;
						item.position = orderPosition;
					}
				}, this);
				if (!isExist) {
					columnOrders.push({
						columnPath: orderColumnPath,
						direction: orderDirection,
						position: orderPosition
					});
				}
			}
		}

		function addColumnToCollection(attribute, attributePath) {
			var columns = this.info.columns;
			if (!Ext.isEmpty(attribute) && !Ext.isEmpty(attributePath)) {
				var attributeColumns = columns[attribute] = columns[attribute] || [];
				var attributePathItems = attributePath.split(".");
				var i = 0;
				var currentPath = "";
				var refGroupRegExp = /\[([\w-]+):([\w\-]+):?([\w\-]*)\]/;
				while (i < attributePathItems.length) {
					var currentItem = attributePathItems[i];
					currentPath += (i !== 0 ? "." : "") + currentItem;
					if (attributeColumns.indexOf(currentPath) < 0 && !refGroupRegExp.test(currentItem)) {
						attributeColumns.push(currentPath);
					}
					i++;
				}
			}
		}

		function prepareSysSettingsDefaultValue(column, columnName) {
			var defaultValue = column.defaultValue;
			if (defaultValue && defaultValue.source === Terrasoft.EntitySchemaColumnDefSource.SETTINGS) {
				addSysSettingToCollection(defaultValue.value, columnName, column.isLookup);
			}
		}

		function addSysSettingToCollection(sysSettingName, columnName, isLookup) {
			var sysSettings = this.info.sysSettings || [];
			if (!Ext.isEmpty(sysSettingName)) {
				if (!sysSettings.some(function(element) {
					return (element.sysSettingName === sysSettingName);
				}, this)) {
					sysSettings.push({
						sysSettingName: sysSettingName,
						columnName: columnName,
						isLookup: isLookup
					});
				}
				this.info.sysSettings = sysSettings;
			}
		}

		function generateContainerInfo(container) {
			var info = this.info = {
				radios: [],
				orders: [],
				details: [],
				modules: [],
				rules: [],
				columns: [],
				dependencies: [],
				filters: [],
				sysSettings: [],
				groups: [],
				info: [],
				lookupOptions: []
			};
			Terrasoft.each(container, generateItemInfo, this);
			return info;
		}

		function getInfo(schema) {
			var info = this.info = {
				radios: [],
				orders: [],
				details: [],
				modules: [],
				rules: [],
				columns: [],
				dependencies: [],
				filters: [],
				sysSettings: [],
				groups: [],
				info: [],
				lookupOptions: []
			};
			if (schema.schema.customPanel) {
				Terrasoft.each(schema.schema.customPanel, generateItemInfo, this);
			}
			Terrasoft.each(schema.schema.leftPanel, generateItemInfo, this);
			Terrasoft.each(schema.schema.rightPanel, generateItemInfo, this);
			if (schema.schema.customBottomPanel) {
				Terrasoft.each(schema.schema.customBottomPanel, generateItemInfo, this);
			}
			Terrasoft.each(schema.entitySchema.columns, prepareSysSettingsDefaultValue, this);
			Terrasoft.each(schema.sysSettings, function(sysSettingName) {
				addSysSettingToCollection(sysSettingName);
			}, this);
			return info;
		}

		return {
			generateContainerInfo: function(container) {
				return generateContainerInfo(container);
			},
			getInfo: function(schema) {
				return getInfo(schema);
			}
		};
	});