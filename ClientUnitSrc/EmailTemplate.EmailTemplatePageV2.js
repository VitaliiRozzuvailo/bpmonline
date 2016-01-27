define("EmailTemplatePageV2", ["ContentBuilderEnums", "css!EmailTemplatePageV2V2Styles"],
	function(ContentBuilderEnums) {
		return {
			entitySchemaName: "EmailTemplate",
			methods: {
				/**
				 * @inheritDoc BasePageV2#initActionButtonMenu
				 * @overridden
				 */
				initActionButtonMenu: this.Terrasoft.emptyFn,

				/**
				 * @inheritdoc BasePageV2#init
				 * @overridden
				 */
				init: function() {
					this.callParent(arguments);
					this.on("change:Body", function(model, value) {
						this.insertHtmlToIframe(value);
					}, this);
					Terrasoft.ServerChannel.on(Terrasoft.EventName.ON_MESSAGE, this.onChannelMessage, this);
				},

				/**
				 * Открывает окно редактирования сообщения.
				 * @protected
				 */
				editTemplate: function() {
					var contentBuilderMode = ContentBuilderEnums.ContentBuilderMode.EMAILTEMPLATE;
					var recordId = this.getPrimaryColumnValue();
					var contentBuilderUrl = ContentBuilderEnums.GetContentBuilderUrl(contentBuilderMode, recordId);
					if (this.isNewMode()) {
						var config = {
							callback: function() {
								window.open(contentBuilderUrl);
							},
							isSilent: true
						};
						this.save(config);
					} else {
						window.open(contentBuilderUrl);
					}
				},

				/**
				 * Обрабатывает сообщение серверного канала сообщений.
				 * @protected
				 * @param {Terrasoft.ServerChannel} channel Канал обмена сообщениями с сервером BPMonline.
				 * @param {Object} message Объект сообщения.
				 */
				onChannelMessage: function(channel, message) {
					if (Ext.isEmpty(message)) {
						return;
					}
					var header = message.Header;
					if (header.Sender !== ContentBuilderEnums.ContentBuilderMode.EMAILTEMPLATE) {
						return;
					}
					var messageObject = Terrasoft.decode(message.Body || "{}");
					var primaryColumnValue = this.getPrimaryColumnValue();
					if (messageObject.recordId !== primaryColumnValue) {
						return;
					}
					var recordId = this.getPrimaryColumnValue();
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: this.entitySchemaName
					});
					esq.addColumn("Body");
					esq.getEntity(recordId, function(result) {
						var entity = result.entity;
						this.loadFromColumnValues(entity.values);
						var templateBody = this.get("Body");
						this.insertHtmlToIframe(templateBody);
					}, this);
				},

				/**
				 * Вставляет html в iframe предпросмотра.
				 * @protected
				 * @virtual
				 * @param {String} html Текст для вставки в iframe.
				 */
				insertHtmlToIframe: function(html) {
					var iframe = Ext.get("preview-content-iframe");
					if (!iframe) {
						return;
					}
					var headRegex = /(<head.*?>[\s\S]*<\/head>)/;
					var bodyRegex = /(<body.*?>[\s\S]*<\/body>)/;
					var headHtml = headRegex.test(html) ? headRegex.exec(html)[1] : "";
					var bodyHtml = bodyRegex.test(html) ? bodyRegex.exec(html)[1] : html;
					var iframeDocument = iframe.dom.contentWindow.document;
					iframeDocument.head.innerHTML = headHtml;
					iframeDocument.body.innerHTML = bodyHtml;
				}
			},
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"name": "Name",
					"values": {
						"layout": {
							"column": 1,
							"row": 0,
							"colSpan": 24,
							"rowSpan": 1
						}
					},
					"parentName": "Header",
					"propertyName": "items",
					"index": 0
				},
				{
					"operation": "insert",
					"name": "Subject",
					"values": {
						"layout": {
							"column": 1,
							"row": 1,
							"colSpan": 24,
							"rowSpan": 1
						}
					},
					"parentName": "Header",
					"propertyName": "items",
					"index": 0
				},
				{
					"operation": "insert",
					"name": "GeneralInfoTab",
					"values": {
						"caption": {
							"bindTo": "Resources.Strings.GeneralInfoTabCaption"
						},
						"items": []
					},
					"parentName": "Tabs",
					"propertyName": "tabs",
					"index": 0
				},
				{
					"operation": "insert",
					"parentName": "GeneralInfoTab",
					"name": "GeneralInfoControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
						"controlConfig": {
							"classes": ["detail"]
						},
						"tools": [],
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "EditTemplateItem",
					"parentName": "GeneralInfoControlGroup",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": { "bindTo": "Resources.Strings.EditTemplateButtonCaption"},
						"click": {"bindTo": "editTemplate"}
					}
				},
				{
					"operation": "insert",
					"name": "TemplateContaner",
					"parentName": "GeneralInfoControlGroup",
					"propertyName": "items",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "TemplateContaner",
					"propertyName": "items",
					"name": "Body",
					"values": {
						"generator": function() {
							return {
								"selectors": {"wrapEl": "#preview-content-iframe"},
								"className": "Terrasoft.HtmlControl",
								"html": "<iframe id='preview-content-iframe' width='100%' height='350px'></iframe>"
							};
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});