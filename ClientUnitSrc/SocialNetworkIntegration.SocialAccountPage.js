define("SocialAccountPage", [], function() {
	return {
		entitySchemaName: "Account",
		attributes: {
			Name: {
				isRequired: false
			}
		},
		details: /**SCHEMA_DETAILS*/{
			AccountSocialCommunication: {
				schemaName: "AccountSocialCommunicationDetail",
				filter: {
					masterColumn: "Id",
					detailColumn: "Account"
				}
			},
			AccountSocialAddress: {
				schemaName: "AccountSocialAddressDetail",
				filter: {
					masterColumn: "Id",
					detailColumn: "Account"
				}
			},
			AccountSocialAnniversary: {
				schemaName: "AccountSocialAnniversaryDetail",
				filter: {
					masterColumn: "Id",
					detailColumn: "Account"
				}
			}
		},/**SCHEMA_DETAILS*/
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"parentName": "Header",
				"propertyName": "items",
				"name": "Name",
				"values": {
					"bindTo": "Name",
					"caption": {"bindTo": "CaptionName"},
					"enabled": false,
					"layout": {"column": 0, "row": 0, "colSpan": 10}
				}
			},
			{
				"operation": "insert",
				"parentName": "CardContentContainer",
				"propertyName": "items",
				"name": "AccountSocialCommunication",
				"values": {
					"itemType": Terrasoft.ViewItemType.DETAIL,
					"classes": {
						wrapClassName: ["social-communication-detail-container"]
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "CardContentContainer",
				"propertyName": "items",
				"name": "AccountSocialAddress",
				"values": {
					"itemType": Terrasoft.ViewItemType.DETAIL,
					"classes": {
						wrapClassName: ["social-address-detail-container"]
					}
				}
			},
			{
				"operation": "insert",
				"parentName": "CardContentContainer",
				"propertyName": "items",
				"name": "AccountSocialAnniversary",
				"values": {
					"itemType": Terrasoft.ViewItemType.DETAIL,
					"classes": {
						wrapClassName: ["social-Anniversary-detail-container"]
					}
				}
			},
			{
				"operation": "insert",
				"name": "NotesControlGroup",
				"parentName": "CardContentContainer",
				"propertyName": "items",
				"values": {
					"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
					"items": [],
					"caption": {"bindTo": "Resources.Strings.NotesControlGroupCaption"}
				}
			},
			{
				"operation": "insert",
				"name": "Notes",
				"parentName": "NotesControlGroup",
				"propertyName": "items",
				"values": {
					"contentType": Terrasoft.ContentType.RICH_TEXT,
					"layout": {"column": 0, "row": 0, "colSpan": 24},
					"labelConfig": {
						"visible": false
					},
					markerValue: "Notes"
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
