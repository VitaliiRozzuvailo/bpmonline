/**
 * Parent: BaseUserTaskPropertiesPage
 */
define("QuestionUserTaskPropertiesPage", ["terrasoft"], function(Terrasoft) {
			return {
				messages: {},
				mixins: {},
				attributes: {
					/**
					 * Текст вопроса.
					 */
					"Question": {
						dataValueType: this.Terrasoft.DataValueType.TEXT,
						type: this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					}
				},
				methods: {},
				diff: [
					{
						"operation": "remove",
						"name": "Recommendation"
					},
					{
						"operation": "remove",
						"name": "InformationOnStep"
					},
					{
						"operation": "insert",
						"parentName": "HeaderUserTaskParametersGridContainer",
						"propertyName": "items",
						"name": "Question",
						"values": {
							"contentType": Terrasoft.ContentType.LONG_TEXT,
							"labelConfig": {
								"caption": {
									"bindTo": "Resources.Strings.QuestionCaption"
								}
							},
							"layout": {
								"column": 0,
								"row": 0,
								"colSpan": 24,
								"rowSpan": 2
							}
						}
					}
				]
			};
		}
);
