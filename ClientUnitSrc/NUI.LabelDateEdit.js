define('LabelDateEdit', ['ext-base', 'terrasoft', 'sandbox',
			'LabelDateEditResources'],
		function(Ext, Terrasoft, sandbox, resources) {
			/**
			 * @class Terrasoft.controls.LabelDateEdit
			 * Класс элемента управления вводом даты
			 */
			var LabelDateEdit = Ext.define('Terrasoft.controls.LabelDateEdit', {
				extend: 'Terrasoft.DateEdit',
				alternateClassName: 'Terrasoft.LabelDateEdit',

				/**
				 * Шаблон элемента управления
				 * @private
				 * @overridden
				 * @type {Array}
				 */
				tpl: [
					'<label {inputId} id="{id}-wrap" class = "{labelClass}" style = "{labelStyle}">{caption}',
					'</label>'
				],

				/**
				 * Css-класс, запрещает перенос строк
				 * @private
				 * @type {String}
				 */
				noWordWrapClass: 't-label-nowordwrap',

				/**
				 * Базовый css-класс для элемента управления
				 * @protected
				 * @virtual
				 * @type {String}
				 */
				labelClass: 't-label',

				/**
				 * Текстовая надпись внутри элемента
				 * @type {String}
				 */
				caption: '',

				/**
				 * Ширина элемента, если установлено число тогда ширина будет вычисляться в пикселях,
				 * если установлена строка - то согласно указанным единицам измерения
				 * @type {String/Number}
				 */
				width: '',

				/**
				 * Шрифт элемента
				 * @type {String}
				 */
				font: '',

				/**
				 * Разрыв строки, по умолчанию true (включен)
				 * @type {Boolean}
				 */
				wordWrap: true,

				/**
				 * Id элемента к которому привязан label
				 * @type {String}
				 */
				inputId: '',

				buttonEl: {},

				/**
				 * Инициализация элемента управления
				 * @protected
				 * @overridden
				 */
				init: function() {
					this.callParent(arguments);
					this.addEvents(
							/**
							 * @event keypress
							 * Срабатывает когда происходит нажатие клавиши.
							 */
							'click'
					);
				},

				/**
				 * Инициализирует данные для шаблона и обновляет селекторы
				 * @protected
				 * @overridden
				 * @return {Object}
				 */
				getTplData: function() {
					var tplData = {
						id: this.id,
						self: this,
						tabIndex: this.tabIndex
					};
					Ext.apply(tplData, this.tplData || {});
					var labelTplData = {
						labelClass: this.getLabelClass(),
						caption: Terrasoft.utils.common.encodeHtml(this.caption)
					};
					var inputId = this.inputId;
					labelTplData.inputId = (inputId) ? 'for = "' + Terrasoft.utils.common.encodeHtml(inputId) + '"' : '';
					Ext.apply(labelTplData, tplData, {});
					this.styles = this.getStyles();
					this.selectors = this.getSelectors();
					return labelTplData;
				},

				/**
				 * Возвращает строку из css-классов на основании конфигурации элемента управления
				 * @protected
				 * @return {String} Возвращает строку которая содержит перечень css-классов
				 */
				getLabelClass: function() {
					var labelClass = [];
					labelClass.push(this.labelClass);
					if (this.wordWrap === false) {
						labelClass.push(this.noWordWrapClass);
					}
					return labelClass.join(' ');
				},

				/**
				 * Возвращает объект inline стилей на основании конфигурации элемента управления
				 * @protected
				 * @overridden
				 * @return {Object}
				 */
				getStyles: function() {
					var styles = {};
					styles.labelStyle = {};
					var labelStyle = styles.labelStyle;
					var font = this.font;
					var width = this.width;
					if (font) {
						labelStyle.font = font;
					}
					if (width) {
						labelStyle.width = width;
					}
					return styles;
				},

				/**
				 * Метод возвращает селекторы элемента управвления
				 * @protected
				 * @overridden
				 * @return {Object} Объект селекторов
				 */
				getSelectors: function() {
					return {
						wrapEl: '#' + this.id + '-wrap',
						el: '#' + this.id + '-wrap'
					};
				},

				/**
				 * Устанавливает или убирает перенос строк
				 * @param {Boolean} wordWrap Если true - устанавливаеться перенос строк, если false - перенос строк
				 * отключаеться
				 */
				setWordWrap: function(wordWrap) {
					if (this.wordWrap === wordWrap) {
						return;
					}
					this.wordWrap = wordWrap;
					if (this.allowRerender()) {
						this.reRender();
					}
				},

				/**
				 * Инициализирует подписку на DOM-события элемента управления
				 * @overridden
				 * @protected
				 */
				initDomEvents: function() {
					//this.callParent(arguments);
					var document = Ext.getDoc();
					/**
					 * @event mousedown
					 * Событие клика мыши в области документа.
					 */
					document.on('mousedown', this.onMouseDownCollapse, this);
					var el = this.getWrapEl();
					el.on('click', this.onButtonClick, this);
				},

				onButtonClick: function() {
					var datePicker = this.datePicker;
					if (datePicker) {
						datePicker.parentEl = this.wrapEl;
					} else {
						this.innerWrapEl = this.wrapEl;
					}
					this.callParent(arguments);
				},

				/**
				 * Устанавливает ширину елемента.
				 * @param {String} width Новая ширина элемента управления, строка содержащая css значение для ширины
				 */
				setWidth: function(width) {
					if (this.width === width) {
						return;
					}
					this.width = width;
					if (this.allowRerender()) {
						this.reRender();
					}
				},

				/**
				 * Возвращает форматированную надпись для текстовой надписи в элементе.
				 * @protected
				 * @param {String} caption Текстовая надпись.
				 * @return {String} Форматированная текстовая надпись для элемента.
				 */
				getFormattedCaption: function(caption) {
					return caption || this.placeholder || resources.localizableStrings.EmptyDateDisplayValue;
				},

				/**
				 * Устанавливает текстовую надпись в элементе
				 * @param {String} caption Текстовая надпись
				 */
				setCaption: function(caption) {
					caption = this.getFormattedCaption(caption);
					if (this.caption === caption) {
						return;
					}
					this.caption = caption;
					if (this.allowRerender()) {
						this.reRender();
					}
				},

				/**
				 * Устанавливает шрифт элемента
				 * @param {String} font Строка параметров шрифта
				 */
				setFont: function(font) {
					if (this.font === font) {
						return;
					}
					this.font = font;
					if (this.allowRerender()) {
						this.reRender();
					}
				},

				/**
				 * Метод создает label для элемента id которого равен inputId
				 * @param {String} inputId Строка содержащая id элемента
				 */
				setInputId: function(inputId) {
					if (this.inputId === inputId) {
						return;
					}
					this.inputId = inputId;
					if (this.allowRerender()) {
						this.reRender();
					}
				},

				/**
				 * Устанавливает значение элемента управления, проверяет его значение на правильность.
				 * Если элемент отображается устанавливает значение dom элементу.
				 * @param {String/Date} date Если передана строка преобразует ее в объект Date.
				 */
				setValue: function(date) {
					var isChanged = this.changeValue(date);
					this.setCaption(this.getFormattedValue());
				},

				/**
				 * Удаляет подписку на события нажатия клавиш в поле ввода элемента управления
				 * @protected
				 */
				onDestroy: function() {
					if (this.rendered) {
						var document = Ext.getDoc();
						document.un('mousedown', this.onMouseDownCollapse, this);
						var el = this.getEl();
						el.un('click', this.onButtonClick, this);
					}
					this.callParent(arguments);
				}

			});
			return LabelDateEdit;
		});