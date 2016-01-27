define("ESNHtmlEditModule", ["ext-base", "terrasoft", "HtmlEditModule"],
		function(Ext, Terrasoft) {

	/* global CKEDITOR */
	Ext.define("Terrasoft.controls.ESNHtmlEdit", {
		extend: "Terrasoft.HtmlEdit",
		alternateClassName: "Terrasoft.ESNHtmlEdit",

		mixins: {
			expandableList: "Terrasoft.ExpandableList"
		},

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#tpl
		 * @overridden
		 */
		tpl: [
			//jscs:disable
			/*jshint quotmark: false */
			'<div id="{id}-html-edit" class="{htmlEditClass}" style="{htmlEditStyle}">',
			'<div id="{id}-html-edit-htmltext" class="{htmlEditTextareaClass}">',
			'<textarea id="{id}-html-edit-textarea"></textarea>',
			'</div>',
			'<span id="{id}-validation" class="{validationClass}" style="{validationStyle}">{validationText}' +
			'</span>',
			'</div>'
			/*jshint quotmark: true */
			//jscs:enable
		],

		/**
		 * Минимальное количество символов, которое надо ввести чтобы началась работа с выпадающим списком.
		 * @type {Number}
		 */
		minSearchCharsCount: 1,

		/**
		 * Текст, который отображается при пустом значении поля ввода.
		 * @type {String}
		 * @private
		 */
		placeholder: "",

		/**
		 * @type {Boolean}
		 * @private
		 */
		tracking: false,

		/**
		 * @type {Array}
		 * @private
		 */
		trackingStartChars: ["@"],

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#subscribeForEvents
		 * @overridden
		 */
		trackingStartPosition: 0,

		/**
		 * @type {String} Свойство содержит символьное значение последней нажатой клавиши.
		 */
		lastKeySymbol: "",

		/**
		 * @inheritDoc Terrasoft.ExpandableList#maskDelay
		 * @overridden
		 */
		maskDelay: 500,

		/**
		 * True, если необходимо изменять высоту элемента управления в зависимости от набираемого текста.
		 * @type {Boolean}
		 */
		autoGrow: false,

		/**
		 * Минимальная высота для автоувеличения элемента.
		 * @type {Number}
		 */
		autoGrowMinHeight: 0,

		/**
		 * Максимальная высота автоувеличения элемента.
		 * @type {Number}
		 */
		autoGrowMaxHeight: 200,

		/**
		 * Возможность автоувеличения элемента во время создания.
		 * @type {Boolean}
		 */
		autoGrowOnStartup: true,

		/**
		 * Отступ текста в пикселях от нижней границы.
		 * @type {Number}
		 */
		autoGrowBottomSpace: 0,

		/**
		 * Текущая высота элемента.
		 * @type {Number}
		 */
		lastHeight: 0,

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#setValueDelay
		 * @overridden
		 */
		setValueDelay: 50,

		/**
		 * True, если необходимо вставлять данные как простой текст.
		 * @type {Boolean}
		 */
		forcePasteAsPlainText: true,

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#getBindConfig
		 * @overridden
		 */
		getBindConfig: function() {
			var bindConfig = this.callParent(arguments);
			var expandableBindConfig = this.mixins.expandableList.getBindConfig();
			Ext.apply(bindConfig, expandableBindConfig);
			var esnHtmlEditBindConfig = {
				placeholder: {
					changeMethod: "setPlaceholder"
				}
			};
			Ext.apply(bindConfig, esnHtmlEditBindConfig);
			return bindConfig;
		},

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#subscribeForEvents
		 * @overridden
		 */
		subscribeForEvents: function(binding, property, model) {
			this.callParent(arguments);
			this.mixins.expandableList.subscribeForEvents.call(this, binding, property, model);
		},

		/**
		 * Расширяет механизм привязки свойств миксина {@link Terrasoft.Bindable} работой с выпадающим списком.
		 * @protected
		 * @overridden
		 */
		initBinding: function(configItem, bindingRule, bindConfig) {
			var binding = this.callParent(arguments);
			var comboBoxBinding = this.mixins.expandableList.initBinding.call(this, configItem, bindingRule, bindConfig);
			return Ext.apply(binding, comboBoxBinding);
		},

		/**
		 * Возвращает метод модели по параметру привязки
		 * @protected
		 * @virtual
		 * @param {Object} binding Объект, описывающий параметры привязки свойства элемента управления к модели
		 * @param {Terrasoft.BaseViewModel} model Модель данных к которой привязывается элемент управления
		 * @return {Function} Возвращает метод модели
		 */
		getModelMethod: function(binding, model) {
			return this.mixins.expandableList.getModelMethod.call(this, binding, model);
		},

		/**
		 * @inheritDoc Terrasoft.AbstractContainer#onDestroy
		 * @overridden
		 */
		onDestroy: function() {
			this.mixins.expandableList.destroy.call(this);
			this.callParent(arguments);
		},

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#tplData
		 * @overridden
		 */
		tplData: {
			"classes": {
				"htmlEditClass": ["html-editor"],
				"htmlEditToolbarClass": ["html-edit-toolbar"],
				"htmlEditToolbarTopClass": ["html-edit-toolbar-top"],
				"htmlEditToolbarButtonGroupClass": ["html-edit-toolbar-buttongroup"],
				"htmlEditTextareaClass": ["html-edit-textarea", "onhtml-edit-textarea"]
			},
			"styles": {
				"htmlEditStyle": {
					"width": this.width,
					"height": this.height
				},
				"htmlEditFontFamilyStyle": {
					"vertical-align": "top",
					"width": "165px"
				},
				"htmlEditFontSizeStyle": {
					"vertical-align": "top",
					"width": "68px"
				}
			}
		},

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#margin
		 * @overridden
		 */
		margin: "",

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#destroy
		 * @overridden
		 */
		destroy: function() {
			var editor = this.editor;
			if (editor) {
				editor.removeListener("key", this.onKey, this);
				editor.removeListener("beforeCommandExec", this.onBeforeCommandExec, this);
				var editorDocumnet = this.editor.document;
				if (editorDocumnet) {
					var el = editorDocumnet.$;
					Ext.EventManager.removeListener(el, "keyup", this.onKeyUp, this);
					Ext.EventManager.removeListener(el, "keydown", this.onKeyDown, this);
					Ext.EventManager.removeListener(el, "keypress", this.onKeyPress, this);
				}
			}
			this.callParent(arguments);
		},

		/**
		 * @inheritDoc Terrasoft.Component#clearDomListeners
		 * @overridden
		 */
		clearDomListeners: function() {
			var doc = Ext.getDoc();
			doc.un("mousedown", this.onMouseDownCollapse, this);
			this.callParent(arguments);
		},

		/**
		 * Возвращает ссылку на основной DOM-элемент компонента.
		 * @return {Ext.Element}
		 */
		getEl: function() {
			return this.editor.document;
		},

		getSelectedRange: function() {
			var editor = this.editor;
			var selection = editor.getSelection();
			var ranges = selection.getRanges();
			return ranges[0];
		},

		/**
		 * @private
		 */
		getTrackingValue: function() {
			if (!this.tracking) {
				return "";
			}
			var range = this.getSelectedRange();
			var value = range.startContainer.getText();
			var start = this.trackingStartPosition;
			var stop = range.endOffset;
			return value.substring(start, stop);
		},

		/**
		 * Возвращает значение DOM поля ввода элемента управления.
		 * @return {String}
		 */
		getTypedValue: function() {
			if (this.rendered) {
				if (this.tracking) {
					var trackingValue = this.getTrackingValue().substring(1);
					return (!trackingValue.match(/^\s/)) ? trackingValue : "";
				} else {
					return this.editor.getData();
				}
			} else {
				return null;
			}
		},

		/**
		 * @private
		 */
		setTrackingValue: function(item) {
			var linkConfig = {
				href: item.link,
				title: item.displayValue,
				value: item.value
			};
			this.insertHyperLink(linkConfig);
		},

		/**
		 * @private
		 * @return {String}
		 */
		getValue: function() {
			return this.value;
		},

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#init
		 * @overridden
		 */
		init: function() {
			this.callParent(arguments);
			this.mixins.expandableList.init.call(this);
			this.addEvents(
				/**
				 * @event change
				 * Вызывается когда происходит изменение значения value элемента управления.
				 */
				"changeValue",
				/**
				 * @event keyup
				 * Срабатывает при отжатии клавиши.
				 */
				"keyup",
				/**
				 * @event keypress
				 * Срабатывает при нажатии символьной клавиши.
				 */
				"keypress",
				/**
				 * @event keydown
				 * Срабатывает при нажатии клавиши.
				 */
				"keydown",
				/**
				 * @event listViewItemRender
				 * Срабатывает когда происходит при отрисовке элемента listView.
				 */
				"listViewItemRender"
			);
		},

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#onFocus
		 * @overridden
		 */
		onFocus: function() {
			this.callParent(arguments);
			this.applyHighlight();
		},

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#onBlur
		 * @overridden
		 */
		onBlur: function() {
			this.callParent(arguments);
			this.removeHighlight();
		},

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#initDomEvents
		 * @overridden
		 */
		initDomEvents: function() {
			this.callParent(arguments);
			var doc = Ext.getDoc();
			doc.on("mousedown", this.onMouseDownCollapse, this);
		},

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#onContentDom
		 * @overridden
		 */
		onContentDom: function() {
			this.callParent(arguments);
			var editor  = this.editor;
			var el = editor.document;
			editor.on("key", this.onKey, this);
			editor.on("beforeCommandExec", this.onBeforeCommandExec, this);
			Ext.EventManager.on(el.$, "keyup", this.onKeyUp, this);
			Ext.EventManager.on(el.$, "keydown", this.onKeyDown, this);
			Ext.EventManager.on(el.$, "keypress", this.onKeyPress, this);
			this.initPlaceholder(editor);
			this.initAutogrow(editor);
			this.fixCkeditorStyles();
			this.initPasteAsPlainText();
		},

		/**
		 * Обработчик события keyup элемента ckeditor.
		 * Отображает выпадающий список.
		 * @private
		 * @param  {Ext.EventObjectImpl} e Объект события.
		 */
		onKeyUp: function(e) {
			if (!this.enabled) {
				this.lastKeySymbol = "";
				return;
			}
			var tracking = this.tracking;
			var typedValue = this.getTypedValue();
			var trackingValue = this.getTrackingValue();
			var key = e.getKey();
			if (key === e.DELETE || key === e.BACKSPACE) {
				if (typedValue === "") {
					this.collapseList();
				}
				if (trackingValue === "") {
					this.stopTracking();
				}
			}
			if (!e.isNavKeyPress()) {
				if (tracking) {
					if ((typedValue.length >= this.minSearchCharsCount) && typedValue !== "") {
						this.expandList(typedValue);
					}
				}
			}
			if (!this.isListElementSelected) {
				this.fireEvent("keyUp", e, this);
			}
			this.lastKeySymbol = "";
		},

		/**
		 * Обработчик события key элемента ckeditor.
		 * @private
		 * @param {Object} e Объект события.
		 */
		onKey: function(e) {
			var data = e.data;
			var keyCode = data.keyCode;
			var listView = this.listView;
			if (this.tracking && (listView !== null) && listView.visible) {
				if (keyCode === 13) {
					e.cancel();
					listView.fireEvent("listPressEnter");
				} else if (keyCode >= 37 && keyCode <= 40) {
					e.cancel();
					if (keyCode === 38) {
						listView.fireEvent("listPressUp");
					} else if (keyCode === 40) {
						listView.fireEvent("listPressDown");
					}
				}
			}
		},

		/**
		 * Обработчик события beforeCommandExec элемента ckeditor.
		 * @private
		 * @param  {Object} e Объект события.
		 */
		onBeforeCommandExec: Terrasoft.emptyFn,

		/**
		 * Обработчик события нажатия на клавишу. Навигация по выпадающему меню.
		 * @param  {Ext.EventObjectImpl} e объект события
		 * @protected
		 * @overridden
		 */
		onKeyDown: function(e) {
			if (!this.enabled || this.readonly) {
				return;
			}
			var isListElementSelected = false;
			var typedValue;
			if (!e.isNavKeyPress()) {
				typedValue = this.getTypedValue();
			}
			var key = e.getKey();
			var listView = this.listView;
			switch (key) {
				case e.DOWN:
					if (listView !== null && listView.visible) {
						this.listView.fireEvent("listPressDown");
					} else if (typedValue !== undefined) {
						this.setShowAllList();
						this.expandList(typedValue);
					}
					break;
				case e.UP:
					if (listView !== null && listView.visible) {
						listView.fireEvent("listPressUp");
					}
					break;
				case e.ENTER:
					this.onEnterKeyPressed();
					if (listView !== null && listView.visible) {
						isListElementSelected = listView.fireEvent("listPressEnter");
					}
					break;
				case e.ESC:
					if (listView !== null && listView.visible) {
						listView.hide();
					}
					break;
				default:
					break;
			}
			this.isListElementSelected = isListElementSelected;
			if (!isListElementSelected) {
				this.fireEvent("keyDown", e, this);
			}
		},

		/**
		 * Обработчик события нажатия клавиши "ENTER" в поле ввода элемента управления.
		 * @protected
		 */
		onEnterKeyPressed: function() {
			var typedValue = this.getTypedValue();
			var hasChanges = this.changeValue(typedValue);
			this.fireEvent("enterkeypressed", this);
			if (!hasChanges) {
				this.fireEvent("editenterkeypressed", this);
			}
		},

		/**
		 * Сравнивает значение параметра value и значение элемента управления,
		 * если они не равны вызывается событие "change" и устанавливается новое значение.
		 * @protected
		 * @param {String} value
		 * @return {Boolean} true - если значение изменилось, в противном случае - false
		 */
		changeValue: function(value) {
			var isChanged = (value !== this.getValue());
			if (isChanged) {
				this.setValue(value);
			}
			return isChanged;
		},

		/**
		 * Обработчик события нажатия символьной клавиши. Обработка символьного значения клавиши.
		 * @param  {Ext.EventObjectImpl} e объект события
		 * @protected
		 * @overridden
		 */
		onKeyPress: function(e) {
			if (!this.enabled || this.readonly) {
				return;
			}
			this.lastKeySymbol = String.fromCharCode(e.getCharCode());
			if (!e.isNavKeyPress()) {
				var tracking = this.tracking;
				if (!tracking && this.isTrackingStartChar(e)) {
					this.startTracking();
				}
			}
		},

		/**
		 * Обработчик события {@link Terrasoft.controls.ListView#listElementSelected listElementSelected}.
		 * Устанавливает значение элемента используя значение item.
		 * Прячет выпадающий список.
		 * @protected
		 * @param {Object} item Свойства выбранного эллемента.
		 */
		onListElementSelected: function(item) {
			if (!Ext.isEmpty(item)) {
				this.setTrackingValue(item);
				this.listView.hide();
			}
		},

		/**
		 * @private
		 * @param {Ext.EventObjectImpl} e.
		 * @return {Boolean}
		 */
		isTrackingStartChar: function(e) {
			var result = false;
			if (e.shiftKey) {
				Terrasoft.each(this.trackingStartChars, function(trackingStartCharCode) {
					result = result || (trackingStartCharCode === this.lastKeySymbol);
				}, this);
			}
			return result;
		},

		/**
		 * @private
		 * @param {Boolean} value
		 */
		setTracking: function(value) {
			if (this.tracking === value) {
				return;
			}
			this.tracking = value;
		},

		/**
		 * @private
		 */
		setTrackingStartPosition: function() {
			var range = this.getSelectedRange();
			this.trackingStartPosition = range.startOffset;
		},

		/**
		 * @private
		 */
		startTracking: function() {
			this.setTracking(true);
			this.setTrackingStartPosition();
			this.setListAlignOffset();
		},

		/**
		 * @private
		 */
		stopTracking: function() {
			this.setTracking(false);
			this.trackingStartPosition = 0;
		},

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#initToolbarItems
		 * @overridden
		 */
		initToolbarItems: Terrasoft.emptyFn,

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#initFonts
		 * @overridden
		 */
		initFonts: Terrasoft.emptyFn,

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#getEditorConfig
		 * @overridden
		 */
		getEditorConfig: function() {
			var editorConfig = this.callParent(arguments);
			return editorConfig;
		},

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#getKeyStrokes
		 * @overridden
		 */
		getKeyStrokes: function() {
			return [
				[0x110000 + 66, null], // CTRL + B
				[0x110000 + 73, null], // CTRL + I
				[0x110000 + 85, null] // CTRL + U
			];
		},

		/**
		 * @inheritDoc Terrasoft.HtmlEdit#onImagesLoaded
		 * @overridden
		 */
		onImagesLoaded: Terrasoft.emptyFn,

		/**
		 * Вставка гиперссылки
		 * @protected
		 */
		insertHyperLink: function(config) {
			var editor = this.editor;
			var selection = editor.getSelection();
			var ranges = selection.getRanges();
			var range = ranges[0];
			this.clearTrackingNode(range);
			var href = config.href;
			var title = config.title || href;
			var linkHtmlTemplate = "<a target=\"_self\" href=\"{0}\" title=\"{1}\">{2}</a>";
			var linkHtml = Ext.String.format(linkHtmlTemplate, href, title, title);
			var linkNode = CKEDITOR.dom.element.createFromHtml(linkHtml);
			var attributes = this.getHyperLinkAttributes(config);
			linkNode.setAttributes(attributes);
			range.insertNode(linkNode);
			this.fixCursorPosition(linkNode, selection, ranges, range);
			this.stopTracking();
		},

		/**
		 * Возвращает аттрибуты вставляемой ссылки.
		 * @private
		 * @param {Object} config Параметры ссылки.
		 * @return {Object} Аттрибуты вставляемой ссылки.
		 */
		getHyperLinkAttributes: function(config) {
			return {
				"data-value": config.value
			};
		},

		/**
		 * Очищает введенное искомое значение в элементе управления.
		 * @private
		 * @param {Object} range Выделенный диапазон.
		 */
		clearTrackingNode: function(range) {
			var trackingValue = this.getTrackingValue();
			var trackingNode = range.getPreviousNode();
			if (!trackingNode) {
				return;
			}
			trackingNode.split(this.trackingStartPosition);
			trackingNode = range.getNextNode();
			trackingNode.split(trackingValue.length);
			trackingNode = range.getNextNode();
			trackingNode.setText("");
		},

		/**
		 * Устанавливает положение курсора после вставки элемента в документ.
		 * @private
		 * @param {Object} node Элемент, после которого необходимо установить курсор.
		 * @param {Object} selection Выделение в элементе управления.
		 * @param {Object} ranges Диапазоны выделения.
		 * @param {Object} range Текущий диапазон.
		 */
		fixCursorPosition: function(node, selection, ranges, range) {
			if (Ext.isGecko) {
				var fakeNode = new CKEDITOR.dom.element("span", this.editor.document);
				fakeNode.setText(" ");
				fakeNode.insertAfter(node);
				range.selectNodeContents(fakeNode);
			}
			var cursorNode = range.getNextNode();
			range.selectNodeContents(cursorNode);
			selection.selectRanges(ranges);
		},

		/**
		 * Прячет меню если клик произошел за пределами элемента управления и выпадающего списка.
		 * @protected
		 * @param {Event} e Событие mousedown.
		 */
		onMouseDownCollapse: function(e) {
			var isInWrap = e.within(this.getWrapEl());
			var listView = this.listView;
			var isInListView = (listView === null) || e.within(listView.getWrapEl());
			if (!isInWrap && !isInListView) {
				listView.hide();
				this.stopTracking();
			}
		},

		/**
		 * Инициадизирует placeholder.
		 * @private
		 * @param {Object} editor
		 */
		initPlaceholder: function(editor) {
			editor.on("mode", function(ev) {
				ev.editor.focusManager.hasFocus = false;
			});
			var placeholder = this.placeholder;
			if (!placeholder) {
				return;
			}
			if (editor.addCss) {
				editor.addCss(this.getPlaceholderCss());
			}
			var node = this.editor.document.getHead().append("style");
			node.setAttribute("type", "text/css");
			var content = ".placeholder { color: #999999; margin-top: 13px }";
			if (CKEDITOR.env.ie && CKEDITOR.env.version < 11) {
				node.$.styleSheet.cssText = content;
			} else {
				node.$.innerHTML = content;
			}
			editor.on("getData", function(ev) {
				var editor = ev.editor;
				var root = this.getRoot(editor);
				if (!root) {
					return;
				}
				if (root && root.hasClass("placeholder")) {
					ev.data.dataValue = "";
				}
			}, this);
			editor.on("setData", function(ev) {
				if (CKEDITOR.dialog._.currentTop) {
					return;
				}
				var editor = ev.editor;
				var root = this.getRoot(editor);
				if (!root) {
					return;
				}
				if (!this.dataIsEmpty(ev.data.dataValue)) {
					if (root.hasClass("placeholder")) {
						root.removeClass("placeholder");
					}
				} else {
					this.addPlaceholder(ev);
				}
			}, this);
			editor.on("blur", this.addPlaceholder, this, placeholder);
			editor.on("mode", this.addPlaceholder, this, placeholder);
			editor.on("contentDom", this.addPlaceholder, this, placeholder);
			editor.on("focus", this.removePlaceholder, this);
			editor.on("beforeModeUnload", this.removePlaceholder, this);
		},

		/**
		 * Возвращает корневой элемент CKEDITOR.
		 * @private
		 * @return {Object}
		 */
		getRoot: function(editor) {
			var root;
			if (editor.editable) {
				root = editor.editable();
			} else {
				if (editor.mode === "wysiwyg") {
					if (editor.document) {
						root = editor.document.getBody();
					} else {
						root = editor.textarea;
					}
				}
			}
			return root;
		},

		/**
		 * Добавляет placeholder.
		 * @private
		 * @param {Object} ev
		 */
		addPlaceholder: function(ev) {
			var editor = ev.editor;
			var root = this.getRoot(editor);
			if (!root) {
				return;
			}
			if (editor.mode !== "wysiwyg") {
				return;
			}
			if (this.focused) {
				return;
			}
			if (CKEDITOR.dialog._.currentTop) {
				return;
			}
			if (!root) {
				return;
			}
			if (this.dataIsEmpty(this.getEditorValue())) {
				var placeholder = ev.listenerData;
				root.setHtml(placeholder);
				root.addClass("placeholder");
			}
		},

		/**
		 * Удаляет placeholder.
		 * @private
		 */
		removePlaceholder: function() {
			var editor = this.editor;
			var root = this.getRoot(editor);
			if (!root) {
				return;
			}
			if (!root.hasClass("placeholder")) {
				return;
			}
			root.removeClass("placeholder");
			if (CKEDITOR.dtd[root.getName()].p) {
				root.setHtml("<p><br/></p>");
				var range = new CKEDITOR.dom.range(editor.document);
				range.moveToElementEditablePosition(root.getFirst(), true);
				editor.getSelection().selectRanges([range]);
			} else {
				root.setHtml(" ");
			}
		},

		/**
		 * Проверяет, что данные пусты.
		 * @private
		 * @param {String} data
		 */
		dataIsEmpty: function(data) {
			if (!data) {
				return true;
			}
			var plainValue = this.removeHtmlTags(data);
			return (plainValue.length === 0);
		},

		/**
		 * Расчитывает высоту контента.
		 * @param {Object} scrollable.
		 * @return {Number} Высота контента.
		 */
		contentHeight: function(scrollable) {
			var overflowY = scrollable.getStyle("overflow-y");
			var doc = scrollable.getDocument();
			var html = "<span style=\"margin:0;padding:0;border:0;clear:both;width:1px;height:1px;display:block;\">" +
				(CKEDITOR.env.webkit ? "&nbsp;" : "") + "</span>";
			var marker = CKEDITOR.dom.element.createFromHtml(html, doc);
			doc[CKEDITOR.env.ie ? "getBody" : "getDocumentElement"]().append(marker);
			var height = marker.getDocumentPosition(doc).y + marker.$.offsetHeight;
			marker.remove();
			scrollable.setStyle("overflow-y", overflowY);
			return height;
		},

		/**
		 *
		 * @param {Object} editor Объект HtmlEdit.
		 * @return {CKEDITOR.dom.element|*}
		 */
		getScrollable: function(editor) {
			var doc = editor.document;
			var body = doc.getBody();
			var htmlElement = doc.getDocumentElement();
			return (doc.$.compatMode === "BackCompat") ? body : htmlElement;
		},

		/**
		 * Расчитывает новую высоту элемента.
		 * @param {Object} editor Объект HtmlEdit.
		 * @param {Number} lastHeight Текущая высота элемента.
		 * @return {Number} Новая высота элемента.
		 */
		resizeEditor: function(editor, lastHeight) {
			if (!editor.window) {
				return;
			}
			var maximize = editor.getCommand("maximize");
			if (maximize && maximize.state === CKEDITOR.TRISTATE_ON) {
				return;
			}
			var scrollable = this.getScrollable(editor);
			var currentHeight = editor.window.getViewPaneSize().height;
			var newHeight = this.contentHeight(scrollable);
			newHeight += (this.autoGrowBottomSpace || 0);
			var min = (this.autoGrowMinHeight !== undefined) ? this.autoGrowMinHeight : 200;
			var max = this.autoGrowMaxHeight || Infinity;
			newHeight = Math.max(newHeight, min);
			newHeight = Math.min(newHeight, max);
			if (newHeight !== currentHeight) {
				newHeight = editor.fire("autoGrow", {currentHeight: currentHeight, newHeight: newHeight}).newHeight;
				editor.resize(editor.container.getStyle("width"), newHeight, true);
				lastHeight = newHeight;
			}
			if (scrollable.$.scrollHeight > scrollable.$.clientHeight && newHeight < max) {
				scrollable.setStyle("overflow-y", "hidden");
			} else {
				scrollable.removeStyle("overflow-y");
			}
			return lastHeight;
		},

		/**
		 * Инициализирует возможность автоувеличения элемента.
		 * @param {Object} editor Объект HtmlEdit.
		 * @private
		 */
		initAutogrow: function(editor) {
			if (!this.autoGrow) {
				return;
			}
			editor.on("instanceReady", function() {
				var editable = editor.editable();
				if (editable.isInline()) {
					editor.ui.space("contents").setStyle("height", "auto");
				} else {
					editor.addCommand("autogrow", {
						exec: function(editor) {
							this.lastHeight = this.resizeEditor(editor, this.lastHeight);
						}.bind(this),
						modes: {wysiwyg: 1},
						readOnly: 1,
						canUndo: false,
						editorFocus: false
					});
					var eventsList = {contentDom: 1, key: 1, selectionChange: 1, insertElement: 1, mode: 1};
					for (var eventName in eventsList) {
						if (!eventsList.hasOwnProperty(eventName)) {
							continue;
						}
						editor.on(eventName, this.autoGrowEventHandler, this);
					}
					editor.on("afterCommandExec", function(evt) {
						if (evt.data.name === "maximize" && evt.editor.mode === "wysiwyg") {
							if (evt.data.command.state === CKEDITOR.TRISTATE_ON) {
								var scrollable = this.getScrollable(editor);
								scrollable.removeStyle("overflow");
							} else {
								this.lastHeight = this.resizeEditor(editor, this.lastHeight);
							}
						}
					}, this);
					if (this.autoGrowOnStartup) {
						editor.execCommand("autogrow");
					}
				}
			}, this);
		},

		/**
		 * Обработчик событий (contentDom, key, selectionChange, insertElement, mode), при которых необходим пересчет
		 * размеров элемента управления.
		 * @private
		 * @param {Object} evt
		 */
		autoGrowEventHandler: function(evt) {
			if (evt.editor.mode === "wysiwyg") {
				setTimeout(function() {
					this.lastHeight = this.resizeEditor(evt.editor, this.lastHeight);
					this.lastHeight = this.resizeEditor(evt.editor, this.lastHeight);
				}.bind(this), 100);
			}
		},

		/**
		 * Устанавливает смещение выпадающего списка в пикселях.
		 * @private
		 */
		setListAlignOffset: function() {
			var pos = {left: 0, top: 0};
			var editor = this.editor;
			var selection = editor.getSelection();
			var nativeSelection = selection.getNative();
			var range = nativeSelection.getRangeAt(0);
			var subRange = range.cloneRange();
			var subRangeContainer = subRange.startContainer;
			var offset = subRange.startOffset;
			var defaultOffsetTop = -9;
			if (!offset) {
				pos.left = subRangeContainer.offsetLeft;
				pos.top = defaultOffsetTop;
			} else {
				subRange.setStart(subRangeContainer, offset - 1);
				if (Ext.isEmpty(subRange)) {
					this.listOffset = [pos.left, pos.top];
					return;
				}
				if (subRange.endOffset !== 0) {
					var node = editor.element.$;
					var nodeLeft = (node) ? node.offsetLeft : 0;
					var nodeTop = (node) ? node.offsetTop : 0;
					var rect = subRange.getBoundingClientRect();
					pos.left = rect.left - nodeLeft + rect.width;
					pos.top = rect.top - nodeTop + rect.height;
				} else {
					pos.left = subRangeContainer.offsetLeft;
					pos.top = subRangeContainer.offsetTop;
				}
				var editorContainer = editor.container;
				if (editorContainer) {
					pos.top -= editorContainer.getClientRect().height;
				}
			}
			this.listOffset = [pos.left, pos.top];
		},

		/**
		 * Применяет CSS класс подсветки для элемента управления.
		 * @protected
		 */
		applyHighlight: function() {
			var wrapEl = this.getWrapEl();
			wrapEl.addCls("html-edit-focus");
		},

		/**
		 * Отменяет CSS класс подсветки для элемента управления.
		 * @protected
		 */
		removeHighlight: function() {
			var wrapEl = this.getWrapEl();
			wrapEl.removeCls("html-edit-focus");
		},

		/**
		 * Исправляет позиционирование элемента управления в Firefox. Связано с работой ckeditor текущей версии.
		 * Заведена и исправлена ошибка http://dev.ckeditor.com/ticket/6341. Необходимо удалить после обновления
		 * ckeditor.
		 * @private
		 */
		fixCkeditorStyles: function() {
			if (CKEDITOR.env.gecko) {
				var document = this.editor.document;
				document.$.body.style.height = "auto";
			}
		},

		/**
		 * Устанавливает значение placeholder для элемента управления.
		 * @param {String} value Текст, который отображается при пустом значении поля ввода.
		 */
		setPlaceholder: function(value) {
			if (this.placeholder === value) {
				return;
			}
			this.placeholder = value;
		},

		/**
		 * Инициализирует возможность вставлять данные только как простой текст.
		 * @private
		 */
		initPasteAsPlainText: function() {
			if (this.forcePasteAsPlainText) {
				var editor = this.editor;
				editor.on("beforePaste", function(evt) {
					evt.data.type = "text";
				});
				editor.on("afterPaste", function() {
					this.stopTracking();
				}, this);
			}
		}

	});
});
