/**
 * Parent: BaseUserTaskPropertiesPage
 */

define("EmailUserTaskPropertiesPage", ["terrasoft"], function(Terrasoft) {
		return {
			messages: {},
			mixins: {},
			attributes: {
				"Recepient": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"CopyRecepient": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"BlindCopyRecepient": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"Subject": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				},
				"Body": {
					dataValueType: this.Terrasoft.DataValueType.TEXT,
					type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
				}
			},
			methods: {},
			diff: [
				{
					"operation": "insert",
					"parentName": "HeaderUserTaskParametersGridContainer",
					"propertyName": "items",
					"name": "Recepient",
					"values": {
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.RecepientCaption"
							}
						},
						"layout": {
							"column": 0,
							"row": 0,
							"colSpan": 24
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderUserTaskParametersGridContainer",
					"propertyName": "items",
					"name": "CopyRecepient",
					"values": {
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.CopyRecepientCaption"
							}
						},
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 24
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderUserTaskParametersGridContainer",
					"propertyName": "items",
					"name": "BlindCopyRecepient",
					"values": {
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.BlindCopyRecepientCaption"
							}
						},
						"layout": {
							"column": 0,
							"row": 2,
							"colSpan": 24
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderUserTaskParametersGridContainer",
					"propertyName": "items",
					"name": "Subject",
					"values": {
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.ThemeCaption"
							}
						},
						"layout": {
							"column": 0,
							"row": 3,
							"colSpan": 24
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderUserTaskParametersGridContainer",
					"propertyName": "items",
					"name": "Body",
					"values": {
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"labelConfig": {
							"caption": {
								"bindTo": "Resources.Strings.BodyCaption"
							}
						},
						"layout": {
							"column": 0,
							"row": 4,
							"colSpan": 24,
							"rowSpan": 3
						}
					}
				}
			]
		}
	}
);