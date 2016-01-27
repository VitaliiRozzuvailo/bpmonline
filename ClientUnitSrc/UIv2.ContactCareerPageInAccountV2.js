define("ContactCareerPageInAccountV2", ["terrasoft", "BusinessRuleModule", "ext-base", "sandbox"],
function(Terrasoft, BusinessRuleModule, Ext, sandbox) {
	return {
		entitySchemaName: "ContactCareer",
		columns: {},
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		methods: {},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"values": {
					"itemType": 7,
					"name": "ContactCareerPageInAccountGeneralTabContainer",
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "ContactCareerPageInAccountGeneralTabContainer",
				"propertyName": "items",
				"values": {
					"name": "ContactCareerPageInAccountGeneralBlock",
					"itemType": 0,
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "ContactCareerPageInAccountGeneralBlock",
				"propertyName": "items",
				"values": {
					"name": "Account",
					"bindTo": "Account",
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "ContactCareerPageInAccountGeneralBlock",
				"propertyName": "items",
				"values": {
					"name": "Contact",
					"bindTo": "Contact",
					"layout": {
						"column": 0,
						"row": 1,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "ContactCareerPageInAccountGeneralBlock",
				"propertyName": "items",
				"values": {
					"name": "Job",
					"bindTo": "Job",
					"layout": {
						"column": 0,
						"row": 2,
						"colSpan": 12
					},
					"contentType": "Terrasoft.ContentType.ENUM"
				}
			},
			{
				"operation": "insert",
				"parentName": "ContactCareerPageInAccountGeneralBlock",
				"propertyName": "items",
				"values": {
					"name": "JobTitle",
					"bindTo": "JobTitle",
					"layout": {
						"column": 0,
						"row": 3,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "ContactCareerPageInAccountGeneralBlock",
				"propertyName": "items",
				"values": {
					"name": "Department",
					"bindTo": "Department",
					"layout": {
						"column": 0,
						"row": 4,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "ContactCareerPageInAccountGeneralBlock",
				"propertyName": "items",
				"values": {
					"name": "StartDate",
					"bindTo": "StartDate",
					"layout": {
						"column": 0,
						"row": 5,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "ContactCareerPageInAccountGeneralBlock",
				"propertyName": "items",
				"values": {
					"name": "DueDate",
					"bindTo": "DueDate",
					"layout": {
						"column": 0,
						"row": 6,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "ContactCareerPageInAccountGeneralBlock",
				"propertyName": "items",
				"values": {
					"name": "Primary",
					"bindTo": "Primary",
					"layout": {
						"column": 0,
						"row": 7,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "ContactCareerPageInAccountGeneralBlock",
				"propertyName": "items",
				"values": {
					"name": "Current",
					"bindTo": "Current",
					"layout": {
						"column": 0,
						"row": 8,
						"colSpan": 12
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "ContactCareerPageInAccountGeneralBlock",
				"propertyName": "items",
				"values": {
					"name": "JobChangeReason",
					"bindTo": "JobChangeReason",
					"layout": {
						"column": 0,
						"row": 9,
						"colSpan": 12
					},
					"contentType": "Terrasoft.ContentType.ENUM"
				}
			},
			{
				"operation": "insert",
				"parentName": "ContactCareerPageInAccountGeneralBlock",
				"propertyName": "items",
				"values": {
					"name": "Description",
					"bindTo": "Description",
					"layout": {
						"column": 0,
						"row": 10,
						"colSpan": 12
					}
				}
			}
		]/**SCHEMA_DIFF*/,
		rules: {},
		userCode: {}
	};
});