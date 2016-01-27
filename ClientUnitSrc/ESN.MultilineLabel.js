define("MultilineLabel", ["ext-base", "terrasoft", "MultilineLabelResources"],
	function(Ext, Terrasoft, resources) {
		/**
		 * @class Terrasoft.controls.MultilineLabel
		 * Класс многострочной текстовой надписи. По умолчанию выводит только 8 строк текста, а так же отображает кнопку
		 * "Читать дальше". Нажатие на кнопку отображает все сообщение. Настройка количества выводимых строк
		 * выполняется через стили элемента управления (lineHeight и maxHeight).
		 */
		return Ext.define("Terrasoft.controls.MultilineLabel", {
			extend: "Terrasoft.Label",
			alternateClassName: "Terrasoft.MultilineLabel",

			tpl: [
				/*jshint quotmark:true */
				'<div id="{id}" class="{multilineLabelClass}">',
				'<div id="{id}_content" class="{labelContentContainer}">',
				'<div id="{id}_label" class="{labelClass}">',
				'{%this.renderContent(out, values)%}',
				'</div>',
				'</div>',
				'<span id="{id}_readMore" class="{readMoreClass}">{readMoreCaption}</span>',
				'</div>'
				/*jshint quotmark:false */
			],

			/**
			 * Признак того, что текст элемента управления развернут.
			 * @type {Boolean}
			 * @private
			 */
			contentVisible: false,

			/**
			 * Признак того, что web и email адреса в тексте элемента управления будут отображаться в виде ссылок.
			 * @type {Boolean}
			 */
			showLinks: false,

			/**
			 * @inheritDoc Terrasoft.Component#getTplData
			 * @overridden
			 */
			getTplData: function() {
				var labelTplData = this.callParent(arguments);
				var id = "#" + this.id;
				Ext.apply(this.selectors, {
					wrapEl: id,
					contentEl: id + "_content",
					labelEl: id + "_label",
					readMoreButtonEl: id + "_readMore"
				});
				var readMoreButtonCaption = resources.localizableStrings.readMoreButtonCpation;
				Ext.apply(labelTplData, {
					readMoreCaption: Terrasoft.utils.common.encodeHtml(readMoreButtonCaption),
					multilineLabelClass: ["multiline-label-wrap"],
					lineElapsisClass: ["line-elapsis"],
					readMoreClass: ["read-more"],
					labelClass: ["multiline-label"],
					labelContentContainer: ["label-content-container"]
				});
				if (this.contentVisible) {
					labelTplData.multilineLabelClass.push("content-visble");
					labelTplData.labelContentContainer.push("content-visble");
				}
				labelTplData.renderContent = this.renderContent;
				return labelTplData;
			},

			/**
			 * Используется в шаблоне при генерации элементов.
			 * @param {Array} buffer Буфер для генерации HTML.
			 * @param {Object} renderData Параметры шаблона.
			 * @protected
			 * @virtual
			 */
			renderContent: function(buffer, renderData) {
				var self = renderData.self;
				var caption = self.caption;
				if (self.showLinks) {
					caption = self.addLinks(caption);
				}
				buffer.push(caption);
			},

			/**
			 * @inheritDoc Terrasoft.Component#onAfterRender
			 * @overridden
			 */
			onAfterRender: function() {
				this.callParent(arguments);
				if (this.contentVisible) {
					return;
				}
				var contentElHeight = this.contentEl.getHeight();
				var labelElHeight = this.labelEl.getHeight();
				if (contentElHeight < labelElHeight) {
					var wrapEl = this.getWrapEl();
					wrapEl.addCls("read-more-button-visible");
				}
			},

			/**
			 * @inheritDoc Terrasoft.Component#onAfterReRender
			 * @overridden
			 */
			onAfterReRender: function() {
				this.callParent(arguments);
				if (this.contentVisible) {
					return;
				}
				var contentElHeight = this.contentEl.getHeight();
				var labelElHeight = this.labelEl.getHeight();
				if (contentElHeight < labelElHeight) {
					var wrapEl = this.getWrapEl();
					wrapEl.addCls("read-more-button-visible");
				}
			},

			/**
			 * @inheritDoc Terrasoft.Component#initDomEvents
			 * @overridden
			 */
			initDomEvents: function() {
				this.callParent(arguments);
				this.readMoreButtonEl.on("click", this.onReadMoreClick, this);
			},

			/**
			 * @inheritDoc Terrasoft.Component#clearDomListeners
			 * @overridden
			 */
			clearDomListeners: function() {
				this.callParent(arguments);
				if (this.rendered) {
					this.readMoreButtonEl.un("click", this.onReadMoreClick, this);
				}
			},

			/**
			 * Обработчик нажатия кнопки "Читать дальше". Разворачивает текст, чтобы его полностью было видно.
			 * @private
			 */
			onReadMoreClick: function() {
				this.contentVisible = true;
				var wrapEl = this.getWrapEl();
				wrapEl.removeCls("read-more-button-visible");
				wrapEl.addCls("content-visble");
				this.contentEl.addCls("content-visble");
			},

			/**
			 * Добавляет ссылки в строке, представляющей html-разметку.
			 * @private
			 * @param {String} text Исходная строка.
			 * @return {String} Модифицированная строка.
			 */
			addLinks: function(text) {
				var htmlDocument = this.getHtmlDocumentFromString(text);
				this.processHtmlDocument(htmlDocument, this.processNode, this);
				return this.getStringFromHtmlDocument(htmlDocument);
			},

			/**
			 * Итеративно обходит html-документ, обрабатывая каждый элемент без дочерних.
			 * @private
			 * @param {Node} node Dom-элемент.
			 * @param {Function} task Функция обработки элемента.
			 * @param {Object} scope Контекст вызова функции.
			 */
			processHtmlDocument: function(node, task, scope) {
				var childNodes = node.childNodes;
				for (var i = 0; i < childNodes.length; i++) {
					var childNode = childNodes[i];
					if (childNode.childNodes.length) {
						this.processHtmlDocument(childNode, task, scope);
					} else {
						task.call(scope, childNode);
					}
				}
			},

			/**
			 * Обрабатывает dom-элемент. Если он текстовый, заменяет текст на ссылки.
			 * @private
			 * @param {Node} node Dom-элемент.
			 */
			processNode: function(node) {
				if (node.nodeType !== document.TEXT_NODE) {
					return;
				}
				var data = Terrasoft.utils.common.encodeHtml(node.data);
				var tempNode = document.createElement("div");
				tempNode.innerHTML = this.getStringWithLinks(data);
				while (tempNode.firstChild) {
					node.parentNode.insertBefore(tempNode.firstChild, node);
				}
				node.parentNode.removeChild(node);
			},

			/**
			 * Возвращает Html-документ полученный из строкового представления.
			 * @private
			 * @param {String} htmlString Строка.
			 * @return {HTMLDocument} Html-документ.
			 */
			getHtmlDocumentFromString: function(htmlString) {
				var domParser = new DOMParser();
				return domParser.parseFromString(htmlString, "text/html");
			},

			/**
			 * Возвращает строковое представление html-документа.
			 * @private
			 * @param {HTMLDocument} htmlDocument Html-документ.
			 * @return {String} Строка.
			 */
			getStringFromHtmlDocument: function(htmlDocument) {
				return htmlDocument.body.innerHTML;
			},

			/**
			 * Возвращает строку, в которой web и email адреса заменены на ссылки.
			 * @private
			 * @param {String} text Исходная строка.
			 * @return {String} Модифицировання строка.
			 */
			getStringWithLinks: function(text) {
				var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
				var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
				var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6})+/gim;
				text = text.replace(urlPattern, "<a target=\"_blank\" href=\"$&\">$&</a>");
				text = text.replace(pseudoUrlPattern, "$1<a target=\"_blank\" href=\"http://$2\">$2</a>");
				text = text.replace(emailAddressPattern, "<a href=\"mailto:$&\">$&</a>");
				return text;
			},

			/**
			 * @inheritdoc Terrasoft.Label#setCaption
			 * @overridden
			 */
			setCaption: function(caption) {
				if (this.caption === caption) {
					return;
				}
				this.caption = caption;
				var wrapEl = this.getWrapEl();
				if (!wrapEl) {
					return;
				}
				this.safeRerender();
			}
		});
	}
);
