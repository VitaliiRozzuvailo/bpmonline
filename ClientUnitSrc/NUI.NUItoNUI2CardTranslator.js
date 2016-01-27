define("NUItoNUI2CardTranslator", ["ext-base", "terrasoft", "sandbox", "BusinessRuleModule"],
	function (Ext, Terrasoft, sandbox, BusinessRuleModule) {

		function translateSchema(schemaName) {
			sandbox.requireModuleDescriptors([schemaName], function (descriptors) {
				require([schemaName], function (schema) {
					if (schema == null) {
						console.error(schemaName + " is null");
					} else {
						if (schema.userCode === undefined) {
							console.error(schemaName + " userCode is null", schema);
						} else {
							if (schemaName === "LeadPage" || schemaName === "ActivityPage" ||
								schemaName === "KnowledgeBasePage") {
								require([schema.extend], function (schema) {
									schema.userCode();
									if (schema !== null && schema.schema !== null) {
										var newSchemaParams = createDiffAndRules(schema.schema, schemaName);
										if (schemaName.indexOf("LeadPage") !== -1) {
											newSchemaParams.name = "LeadPageV2";
										} else if (schemaName.indexOf("ActivityPage") !== -1) {
											newSchemaParams.name = "ActivityPageV2";
										} else if (schemaName.indexOf("KnowledgeBasePage") !== -1) {
											newSchemaParams.name = "KnowledgeBasePageV2";
										}
										newSchemaParams.entitySchemaName = schema.entitySchema.name;
										saveSchema(newSchemaParams);
									}
								});
							} else {
								schema.userCode();
								if (schema !== null && schema.schema !== null) {
									var newSchemaParams = createDiffAndRules(schema.schema, schemaName);
									newSchemaParams.name = schemaName + "V2";
									if (schemaName !== "LinkPage") {
										newSchemaParams.entitySchemaName = schema.entitySchema.name;
									} else {
										newSchemaParams.entitySchemaName = "File";
									}
									saveSchema(newSchemaParams);
								}
							}
						}
					}
				});
			}, this);
		}

		function translateAllSchemas() {
			getAllCardSchemaNames(function (response) {
				var cardNames = response.GetNUICardNamesResult.split(";");
				Terrasoft.each(cardNames, function (oldSchemaName) {
						if (oldSchemaName !== "") {
							translateSchema(oldSchemaName);
						}
					},
					this);
			});
		}

		function translateSectionSchema(schemaName) {
			sandbox.requireModuleDescriptors([schemaName], function (descriptors) {
				require([schemaName], function (schema) {
					if (schema == null) {
						console.error(schemaName + " is null");
					} else {
						if (schema.userCode === undefined) {
							console.error(schemaName + " userCode is null", schema);
						} else {
							schema.userCode();
							if (schema !== null && schema.schema !== null) {
								var newSchemaParams = {};
								if (schemaName === "LeadSection") {
									newSchemaParams.entitySchemaName = "Lead";
								} else if (schemaName === "ActivitySection") {
									newSchemaParams.entitySchemaName = "Activity";
								} else {
									newSchemaParams.entitySchemaName = schema.entitySchema.name;
								}


								newSchemaParams.entitySchemaDisplayName = schema.entitySchema.caption;
								newSchemaParams.name = schemaName + "V2";
								newSchemaParams.contextHelpId = schema.contextHelpId;
								saveSectionSchema(newSchemaParams);
							}
						}
					}
				});
			}, this);
		}

		function translateAllSectionSchemas() {
			getAllSectionSchemaNames(function (response) {
				var sectionNames = response.GetNUISectionNamesResult.split(";");
				Terrasoft.each(sectionNames, function (oldSchemaName) {
						if (oldSchemaName !== "" && oldSchemaName !== "ContactSection") {
							translateSectionSchema(oldSchemaName);
						}
					},
					this);
			});
		}

		function getAllCardSchemaNames(callback) {
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/NUItoNUI2CardTranslatorService/GetNUICardNames";
			Terrasoft.AjaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: {},
				callback: function (request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
					}
					callback.call(this, responseObject);
				},
				scope: this
			});
		}

		function getAllSectionSchemaNames(callback) {
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/NUItoNUI2CardTranslatorService/GetNUISectionNames";
			Terrasoft.AjaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: {},
				callback: function (request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
					}
					callback.call(this, responseObject);
				},
				scope: this
			});
		}

		function generateCode(data) {
			return "define('" + data.name + "', ['terrasoft', 'BusinessRuleModule', 'ext-base', 'sandbox'],\n" +
				"function(Terrasoft, BusinessRuleModule, Ext, sandbox) {\n" +
				"	return {\n" +
				"		entitySchemaName: '" + data.entitySchemaName + "',\n" +
				"		columns: {},\n" +
				"		details: {},\n" +
				"		methods: {},\n" +
				"		diff: " + JSON.stringify(data.diff).replace(/,/g, ",\n") + ",\n" +
				"		rules: " + JSON.stringify(data.rules).replace(/,/g, ",\n") + ",\n" +
				"		userCode: {}\n" +
				"	};\n" +
				"});";
		}

		function generateSectionCode(data) {
			var code = 'define("' + data.name + '", [],\n' +
				"function() {\n" +
				"	return {\n" +
				'		entitySchemaName: "' + data.entitySchemaName + '",\n' +
				"		columns: {},\n" +
				"		methods: {\n" +
				"			getAddRecordButtonCaption: function() {\n" +
				'				return "Добавить ' + data.entitySchemaDisplayName + '";\n' +
				"			},\n" +
				"			initContextHelp: function() {\n" +
				'				this.set("ContextHelpId", ' + data.contextHelpId + ');\n' +
				"				this.callParent(arguments);\n" +
				"			}\n" +
				"		},\n" +
				"		diff: [],\n" +
				"		userCode: {}\n" +
				"	};\n" +
				"});";
			return code;
		}

		function generateItem(item) {
			var template =
				'			{\n' +
					'				"operation": {0},\n' +
					'				"parentName": {1},\n' +
					'				"propertyName": {2},\n' +
					'				"name": {3},\n' +
					'				"values": {\n' +
					'					bindTo: {4},\n' +
					'{8}' +
					'					layout: {\n' +
					'						column: {5}, row: {6}, colSpan: {7}\n' +
					'					}\n' +
					'				}\n' +
					'			}';
			var contentTypeTemplate = '					contentType: ,\n';
			var contentType = item.values.contentType ?
				Ext.String.format(contentTypeTemplate, item.values.contentType) : "";
			return Ext.String.format(template, item.operation, item.parentName, item.propertyName, item.name,
				item.values.bindTo, item.values.layout.column, item.values.layout.row, item.values.layout.colSpan,
				contentType);
		}

		function saveSchema(dataSend) {
			var data = {
				code: generateCode(dataSend),
				cardName: dataSend.name,
				dependencyName: dataSend.entitySchemaName
			};

			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/NUItoNUI2CardTranslatorService/SaveNUI2Card";
			Terrasoft.AjaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data,
				callback: function (request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
					}
					//callback.call(this, responseObject);
				},
				scope: this
			});
		}

		function saveSectionSchema(dataSend) {
			var data = {
				code: generateSectionCode(dataSend),
				sectionName: dataSend.name,
				dependencyName: dataSend.entitySchemaName
			};

			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/NUItoNUI2CardTranslatorService/SaveNUI2Section";
			Terrasoft.AjaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data,
				callback: function (request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
					}
					//callback.call(this, responseObject);
				},
				scope: this
			});
		}

		function saveGridDetailSchema(dataSend) {
			var data = {
				code: generateGridDetailCode(dataSend),
				sectionName: dataSend.name,
				dependencyName: dataSend.entitySchemaName
			};
			console.log(data);
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/NUItoNUI2CardTranslatorService/SaveNUI2GridDetail";
			Terrasoft.AjaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data,
				callback: function (request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
						console.log(responseObject);
					}
				},
				scope: this
			});
		}

		function createDiffAndRules(schema, schemaName) {
			var tabName = schemaName + "GeneralTabContainer";
			var blockName = schemaName + "GeneralBlock";
			var rules = {};
			//default tab and block
			var diff = [
				{
					"operation": "insert",
					"name": tabName,
					"values": {
						itemType: Terrasoft.ViewItemType.CONTAINER,
						items: []
					}
				},
				{
					"operation": "insert",
					"parentName": tabName,
					"propertyName": "items",
					"name": blockName,
					"values": {
						itemType: Terrasoft.ViewItemType.GRID_LAYOUT,
						items: []
					}
				}
			];
			var rowIndex = 0;
			//all from custom panel
			if (schema.customPanel && schema.customPanel.length > 0) {
				rowIndex = fillItemsFromGroup(diff, schema.customPanel, blockName, rowIndex, 0, rules);
			}
			//all from left panel
			if (schema.leftPanel && schema.leftPanel.length > 0) {
				rowIndex = fillItemsFromGroup(diff, schema.leftPanel, blockName, rowIndex, 0, rules);
			}
			//all from right panel
			if (schema.rightPanel && schema.rightPanel.length > 0) {
				rowIndex = fillItemsFromGroup(diff, schema.rightPanel, blockName, rowIndex, 12, rules);
			}
			return {diff: diff, rules: rules};
		}

		function fillItemsFromGroup(itemsArray, groupItems, blockName, rowIndex, columnIndex, rules) {
			for (var i in groupItems) {
				var item = groupItems[i];
				if (item.visible) {
					if (item.type === Terrasoft.ViewModelSchemaItem.GROUP) {
						rowIndex = fillItemsFromGroup(itemsArray, item.items, blockName, rowIndex, columnIndex, rules);
					} else if (item.type === Terrasoft.ViewModelSchemaItem.ATTRIBUTE) {
						var newItem = {
							bindTo: item.columnPath,
							layout: {column: columnIndex, row: rowIndex++, colSpan: 12}
						};
						switch (item.dataValueType) {
							case Terrasoft.DataValueType.ENUM:
								newItem.contentType = "Terrasoft.ContentType.ENUM";
								break;
							case Terrasoft.DataValueType.TEXT:
								if (item.customConfig) {
									if (item.customConfig.className &&
										item.customConfig.className === "Terrasoft.MemoEdit") {
										newItem.contentType = "Terrasoft.ContentType.LONG_TEXT";
									}
								}
								break;
						}
						if (item.rules) {
							addRules(rules, item.rules, item.name);
						}
						itemsArray.push({
								"operation": "insert",
								"parentName": blockName,
								"propertyName": "items",
								"name": item.name,
								"values": newItem
							}
						);
					}
				}
			}
			return rowIndex;
		}

		function addRules(rules, oldRules, columnName) {
			rules[columnName] = {};
			for (var i in oldRules) {
				var rule = oldRules[i];
				var ruleName = "";
				switch (rule.ruleType) {
					case BusinessRuleModule.enums.RuleType.AUTOCOMPLETE:
						ruleName += "AutoComplete" + columnName + "By" + rule.baseAttributePatch;
						break;
					case BusinessRuleModule.enums.RuleType.BINDPARAMETER:
						ruleName = "BindParameter";
						switch (rule.property) {
							case BusinessRuleModule.enums.Property.ENABLED:
								ruleName += "Enabled";
								break;
							case BusinessRuleModule.enums.Property.READONLY:
								ruleName += "Readonly";
								break;
							case BusinessRuleModule.enums.Property.REQUIRED:
								ruleName += "Required";
								break;
							case BusinessRuleModule.enums.Property.VISIBLE:
								ruleName += "Visible";
								break;
						}
						ruleName += columnName + "To";
						for (var j in rule.conditions) {
							var condition = rule.conditions[j];
							ruleName += condition.leftExpression.attribute;
						}
						break;
					case BusinessRuleModule.enums.RuleType.FILTRATION:
						ruleName += "Filtration" + columnName + "By" + rule.baseAttributePatch;
						break;
				}
				rules[columnName][ruleName] = rule;
			}
		}

		function translateGridDetailSchema(schemaName) {
			sandbox.requireModuleDescriptors([schemaName], function (descriptors) {
				require([schemaName], function (schema) {
					if (schema == null) {
						console.error(schemaName + " is null");
					} else {
						if (schema.userCode === undefined) {
							console.error(schemaName + " userCode is null", schema);
						} else {
							schema.userCode();
							if (schema !== null && schema.schema !== null) {
								var newSchemaParams = createGridDetailDiff(schema);
								newSchemaParams.entitySchemaName = schema.entitySchema.name;
								newSchemaParams.name = schemaName + "V2";
								saveGridDetailSchema(newSchemaParams);
							}
						}
					}
				});
			}, this);
		}

		function translateAllGridDetailSchemas(name) {
			getAllGridDetailSchemaNames(function (response) {
				var cardNames = response.GetNUIGridDetailNamesResult.split(";");
				Terrasoft.each(cardNames, function (oldSchemaName) {
						if (oldSchemaName !== "" && ((name) ? oldSchemaName == name : true)) {
							//console.log(oldSchemaName);
							translateGridDetailSchema(oldSchemaName);
						}
					},
					this);
			});
		}

		function getAllGridDetailSchemaNames(callback) {
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/NUItoNUI2CardTranslatorService/GetNUIGridDetailNames";
			Terrasoft.AjaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: {},
				callback: function (request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
					}
					callback.call(this, responseObject);
				},
				scope: this
			});
		}

		function createGridDetailDiff(schema){
			var listedConfig = [];
			var tiledConfig = [];
			var colSpan = 1;
			var collection = [];
			if (schema.columnsConfig) {
				collection = (schema.columnsConfig.length > 0 && schema.columnsConfig[0].length > 0)?
								schema.columnsConfig[0] : schema.columnsConfig;
			}
			Terrasoft.each(collection, function(columnConfig){
				var cellName = columnConfig.key[0].name.bindTo;
				if(cellName){
					cellName = cellName.replace(/\./g, "");
					var cell = {
						name: cellName + "ListedGridColumn",
						bindTo: columnConfig.key[0].name.bindTo,
						position: {column: colSpan, colSpan: columnConfig.cols}
					};
					if (columnConfig.key[0].type) {
						cell.type = columnConfig.key[0].type;
					}
					var tiledCell =  {
						name: cellName + "TiledGridColumn",
						bindTo: columnConfig.key[0].name.bindTo,
						position: {row: 1,column: colSpan, colSpan: columnConfig.cols}
					};
					if (columnConfig.key[0].type) {
						tiledCell.type = cell.type;
					}
					listedConfig.push(cell);
					tiledConfig.push(tiledCell);
					colSpan += columnConfig.cols;
				}
			});
			var diff = [
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						type: "listed",
						listedConfig: {
							name: "DataGridListedConfig",
							items: listedConfig
						},
						tiledConfig: {
							name: "DataGridTiledConfig",
							grid: {columns: 24, rows: 3},
							items: tiledConfig
						}
					}
				}
			];
			return {diff: diff};
		}

		function generateGridDetailCode(data) {
			var code = 'define("' + data.name + '", ["terrasoft"],\n'+
				"	function(Terrasoft) {\n"+
				"		return {\n"+
				((data.entitySchemaName)?'			entitySchemaName: "' + data.entitySchemaName + '",\n' : "") +
				"			attributes: {},\n"+
				"			methods: {},\n"+
				"			diff: " + generateBeautyDiff(data.diff) + "\n" +
				"		};\n"+
				"	}\n"+
				");";
			return code;
		}

		function dumpObjectIndented(obj, indent) {
			var result = "";
			if (indent == null) indent = "";
			if(obj instanceof Array){
				result = "[\n";
				var counter = 0;
				Terrasoft.each(obj, function(item){
					if (counter > 0) {
						result += ",\n";
					}
					result += indent + "{\n" + dumpObjectIndented(item,indent+"\t") + "\n" +indent+ "}";
					counter++;
				});
				return result + "\n"+indent.substring(1)+"]";
			}
			for (var property in obj)
			{
				var value = obj[property];
				if (typeof value == 'string')
					value = '"' + value + '"';
				else if (typeof value == 'object')
				{
					var od = dumpObjectIndented(value, indent + "\t");
					if (value instanceof Array) {
						value = od;
					} else {
						value = "{\n" + od + "\n" + indent + "}";
					}
				}
				result +=  indent + '"' + property + '": ' + value + ',\n';
			}
			return result.replace(/,\n$/, "");
		}

		function generateBeautyDiff(inDiff) {
			var result =  dumpObjectIndented(inDiff,"\t\t\t\t");
			Terrasoft.each(Terrasoft.GridCellType,function(t) {
				var tmplate =  '"type": {0}';
				var regExp = new RegExp(Ext.String.format(tmplate,'"'+t+'"'),'g');
				result = result.replace(regExp,Ext.String.format(tmplate,"Terrasoft.GridCellType." + t.toUpperCase()));
			});
			return result;
		}

		return {
			translateSchema: translateSchema,
			translateAllSchemas: translateAllSchemas,
			translateSectionSchema: translateSectionSchema,
			translateAllSectionSchemas: translateAllSectionSchemas,
			translateAllGridDetailSchemas: translateAllGridDetailSchemas
		};
	});