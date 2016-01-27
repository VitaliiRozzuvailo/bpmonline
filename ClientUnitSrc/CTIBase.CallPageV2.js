define("CallPageV2", [],
	function() {
		return {
			entitySchemaName: "Call",
			details: /**SCHEMA_DETAILS*/{
				Files: {
					schemaName: "FileDetailV2",
					entitySchemaName: "CallFile",
					filter: {
						detailColumn: "Call"
					}
				}
			}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "CallerId",
					"values": {
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
					"name": "CalledId",
					"values": {
						"enabled": false,
						"layout": {
							"column": 12,
							"row": 0,
							"colSpan": 12
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Direction",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"enabled": false,
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
					"name": "CreatedBy",
					"values": {
						"enabled": false,
						"layout": {
							"column": 12,
							"row": 1,
							"colSpan": 12
						}
					}
				},
				{
					"operation": "insert",
					"name": "GeneralInfoTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": { "bindTo": "Resources.Strings.GeneralInfoTabCaption" },
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "CallDurationTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": { "bindTo": "Resources.Strings.CallDurationTabCaption" },
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "NotesAndFilesTab",
					"parentName": "Tabs",
					"propertyName": "tabs",
					"values": {
						"caption": { "bindTo": "Resources.Strings.NotesAndFilesTabCaption" },
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "NotesAndFilesTab",
					"name": "NotesAndFilesTabContainer",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"controlConfig": {
							"collapsed": false
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "NotesAndFilesTab",
					"propertyName": "items",
					"name": "Files",
					"values": {
						"itemType": Terrasoft.ViewItemType.DETAIL
					}
				},
				{
					"operation": "insert",
					"name": "NotesControlGroup",
					"parentName": "NotesAndFilesTab",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"caption": { "bindTo": "Resources.Strings.NotesGroupCaption" },
						"controlConfig": {
							"collapsed": false
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "NotesControlGroup",
					"propertyName": "items",
					"name": "Notes",
					"values": {
						"contentType": Terrasoft.ContentType.RICH_TEXT,
						"layout": {"column": 0, "row": 0, "colSpan": 24},
						"labelConfig": {
							"visible": false
						},
						"controlConfig": {
							"imageLoaded": {
								"bindTo": "insertImagesToNotes"
							},
							"images": {
								"bindTo": "NotesImagesCollection"
							}
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "NotesAndFilesTabContainer",
					"propertyName": "items",
					"name": "NotesAndFilesInformationBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoTab",
					"propertyName": "items",
					"name": "CallPageGeneralBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "CallPageGeneralBlock",
					"propertyName": "items",
					"name": "StartDate",
					"values": {
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
					"parentName": "CallPageGeneralBlock",
					"propertyName": "items",
					"name": "EndDate",
					"values": {
						"enabled": false,
						"layout": {
							"column": 12,
							"row": 0,
							"colSpan": 12
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CallPageGeneralBlock",
					"propertyName": "items",
					"name": "Contact",
					"values": {
						"contentType": Terrasoft.ContentType.LOOKUP,
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 12
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CallPageGeneralBlock",
					"propertyName": "items",
					"name": "Account",
					"values": {
						"contentType": Terrasoft.ContentType.LOOKUP,
						"layout": {
							"column": 12,
							"row": 1,
							"colSpan": 12
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoTab",
					"propertyName": "items",
					"name": "CallPageResultContainer",
					"values": {
						"caption": { "bindTo": "Resources.Strings.CallResultContainerCaption" },
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"items": [],
						"controlConfig": { "collapsed": false }
					}
				},
				{
					"operation": "insert",
					"parentName": "CallPageResultContainer",
					"propertyName": "items",
					"name": "Result",
					"values": {
						"contentType": Terrasoft.ContentType.ENUM,
						"layout": {
							"column": 0,
							"row": 3,
							"colSpan": 24
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CallPageResultContainer",
					"propertyName": "items",
					"name": "Comment",
					"values": {
						"contentType": Terrasoft.ContentType.LONG_TEXT,
						"layout": {
							"column": 0,
							"row": 4,
							"colSpan": 24,
							"rowSpan": 2
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CallDurationTab",
					"propertyName": "items",
					"name": "CallDurationBlock",
					"values": {
						"itemType": Terrasoft.ViewItemType.GRID_LAYOUT,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "CallDurationBlock",
					"propertyName": "items",
					"name": "Duration",
					"values": {
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
					"parentName": "CallDurationBlock",
					"propertyName": "items",
					"name": "BeforeConnectionTime",
					"values": {
						"enabled": false,
						"layout": {
							"column": 12,
							"row": 0,
							"colSpan": 12
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CallDurationBlock",
					"propertyName": "items",
					"name": "TalkTime",
					"values": {
						"enabled": false,
						"layout": {
							"column": 0,
							"row": 1,
							"colSpan": 12
						}
					}
				},
				{
					"operation": "insert",
					"parentName": "CallDurationBlock",
					"propertyName": "items",
					"name": "HoldTime",
					"values": {
						"enabled": false,
						"layout": {
							"column": 12,
							"row": 1,
							"colSpan": 12
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);