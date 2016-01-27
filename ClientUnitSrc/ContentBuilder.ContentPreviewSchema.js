define("ContentPreviewSchema", ["terrasoft"],
	function(Terrasoft) {
		return {
			messages: {

				/**
				 * Публикация сообщения изменения заголовка модуля дизайнера колонки объекта.
				 */
				"ChangeHeaderCaption": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для получения параметров инициализации дизайнера колонки.
				 */
				"GetColumnConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для получения параметров инициализации дизайнера колонки.
				 */
				"GetSchemaColumnsNames": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для получения параметров инициализации дизайнера колонки.
				 */
				"GetDesignerDisplayConfig": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},

				/**
				 * Публикация сообщения для получения идентификатора пакета для новой схемы справочника.
				 */
				"GetNewLookupPackageUId": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			attributes: {

			},
			methods: {

				/**
				 * Закрывает всплывающее окно.
				 * @protected
				 * @virtual
				 */
				close: function() {
					this.destroyModule();
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
				},

				/**
				 * @inheritdoc Terrasoft.BaseViewModel#onRender
				 * @overridden
				 */
				onRender: function() {
					this.updateSize(800, 550);
					var moduleInfo = this.get("moduleInfo");
					var displayHtml = moduleInfo.displayHtml;
					this.insertHtmlToIframe(displayHtml);
					this.hideBodyMask();
				}

			},
			diff: [
				{
					"operation": "insert",
					"name": "ContentContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"styles": {
							height: "98%",
							width: "98%"
						},
						"items": []
					}
				},
				{
					"operation": "insert",
					"name": "testLabel",
					"parentName": "ContentContainer",
					"propertyName": "items",
					"values": {
						"generator": function() {
							return {
								"selectors": {"wrapEl": "#preview-content-iframe"},
								"className": "Terrasoft.HtmlControl",
								"html": "<iframe id='preview-content-iframe' class='preview-content-iframe'" +
									"width='100%' height='100%'></iframe>"
							};
						}
					}
				},
				{
					"operation": "insert",
					"name": "HeaderContainer",
					"values": {
						"itemType": Terrasoft.ViewItemType.CONTAINER,
						"items": []
					}
				},
				{
					"operation": "insert",
					"parentName": "HeaderContainer",
					"propertyName": "items",
					"name": "CloseButton",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"caption": {"bindTo": "Resources.Strings.CloseButtonCaption"},
						"click": {"bindTo": "close"}
					}
				}
			]
		};
	});
