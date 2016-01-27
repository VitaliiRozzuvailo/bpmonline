define("AccountOrganizationChartPageV2", [],
function() {
	return {
		entitySchemaName: "AccountOrganizationChart",
		attributes: {
			"Manager": {
				lookupListConfig: {
					columns: ["Name", "Account"],
					filter: function() {
						return  Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL,
							"[ContactCareer:Contact].Account", this.get("Account").value);
					}
				}
			},
			"CustomDepartmentName": {
				dataValueType: Terrasoft.DataValueType.TEXT,
				dependencies: [
					{
						columns: ["Department"],
						methodName: "onDepartmentChange"
					}
				]
			}
		},
		details: /**SCHEMA_DETAILS*/{
		}/**SCHEMA_DETAILS*/,
		methods: {
			/** Определяет необходимость показывать родительский элемент оргструтуры
			 * @private
			 * @return {bool} Возращает true, если родительский элемент Parent определен
			 */
			isParentVisible: function() {
				return !this.Ext.isEmpty(this.get("Parent"));
			},

			/**
			 * Устанавливает имя подразделения значением департамента
			 * @private
			 */
			onDepartmentChange: function() {
				var department = this.get("Department");
				var departmentValue = this.Ext.isEmpty(department) ? null : department.displayValue;
				this.set("CustomDepartmentName", departmentValue);
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "Tabs",
				"values": {
					"visible": false
				}
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"name": "AccountOrganizationChartPageGeneralBlock",
					"itemType": 0,
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"name": "Account",
					"bindTo": "Account",
					"enabled": false,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"name": "Parent",
					"bindTo": "Parent",
					"enabled": false,
					"layout": {
						"column": 12,
						"row": 0,
						"colSpan": 12
					},
					"visible": { "bindTo": "isParentVisible"}
				}
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"name": "CustomDepartmentName",
					"bindTo": "CustomDepartmentName",
					"layout": {
						"column": 0,
						"row": 1,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"name": "Department",
					"bindTo": "Department",
					"layout": {
						"column": 0,
						"row": 2,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"name": "Manager",
					"bindTo": "Manager",
					"layout": {
						"column": 12,
						"row": 1,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"values": {
					"name": "Description",
					"bindTo": "Description",
					"layout": {
						"column": 0,
						"row": 4,
						"colSpan": 24,
						"rowSpan": 5
					},
					"contentType": Terrasoft.ContentType.LONG_TEXT
				}
			}
		]/**SCHEMA_DIFF*/
	};
});