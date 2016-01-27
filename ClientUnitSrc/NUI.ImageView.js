Ext.ns("Terrasoft");

/**
 * @class Terrasoft.controls.ImageView
 * Класс элемента управления для отображения картинок.
 */
Ext.define("Terrasoft.controls.ImageView", {
	extend: "Terrasoft.Component",
	alternateClassName: "Terrasoft.ImageView",

	/**
	 * Всплывающее название изображения.
	 * @type {String}
	 */
	imageTitle: "",

	/**
	 * Url изображения по умолчанию.
	 * @type {String}
	 */
	defaultImageSrc: "",

	/**
	 * Url изображения.
	 * @private
	 * @type {String}
	 */
	imageSrc: "",

	/**
	 * CSS class для элемента управления.
	 * @private
	 */
	wrapClasses: "",

	/**
	 * @inheritdoc Terrasoft.Component#tpl
	 * @protected
	 * @overridden
	 */
	tpl: [
		/*jshint white:false */
		'<img id="{id}-image-view" class="{wrapClass}" src="{imageSrc}" title="{imageTitle}" />'
		/*jshint white:true */
	],

	/**
	 * Инициализация компонента меню
	 * @protected
	 * @override
	 */
	init: function() {
		this.callParent(arguments);
		this.addEvents(
				/**
				 * @event
				 * Событие нажатия на элемент отображения картинок.
				 * @param {Terrasoft.ImageView} this
				 */
				'click'
		);
	},

	/**
	 * Инициализация событий DOM.
	 * @protected
	 * @override
	 */
	initDomEvents: function() {
		this.callParent(arguments);
		var wrapEl = this.getWrapEl();
		if (wrapEl) {
			wrapEl.on({
				click: {
					fn: this.onClick,
					scope: this
				}
			});
		}
	},

	/**
	 * Обрабтчик клика кнопки.
	 * @protected
	 */
	onClick: function(e) {
		e.stopEvent();
		this.fireEvent("click", this, null);
	},

	/**
	 * Рассчитывает данные для шаблона и обновляет селекторы.
	 * @protected
	 * @overridden
	 * @return {Object} tplData Обновленный набор данных для шаблона.
	 */
	getTplData: function() {
		var tplData = this.callParent(arguments);
		Ext.apply(tplData, this.combineClasses());
		tplData.imageSrc = this.imageSrc;
		tplData.imageTitle = this.imageTitle;
		this.updateSelectors(tplData);
		return tplData;
	},

	/**
	 * Обновляет селекторы исходя из данных сформированных для создания разметки.
	 * @protected
	 * @param  {Object} tplData объект данных для шаблона, по которому будет строиться разметка.
	 * @return {Object} selectors Обновленные селекторы.
	 */
	updateSelectors: function(tplData) {
		var id = tplData.id;
		var selectors = this.selectors = {};
		selectors.wrapEl = "#" + id + "-image-view";
		return selectors;
	},

	/**
	 * Вычисляет стили для элемента управления на основании конфигурации.
	 * @protected
	 * @return {Object} Строка содержащая список CSS - классов.
	 */
	combineClasses: function() {
		return {
			wrapClass: [this.wrapClasses]
		};
	},

	/**
	 * Изменяет основной url картинки.
	 * @param {String} src URL Адрес картинки.
	 * @param {String} title всплывающая подсказка картинки.
	 */
	setImageSrc: function(src, title) {
		this.imageSrc = src || this.defaultImageSrc;
		this.imageTitle = Ext.isEmpty(title, true) ? this.imageTitle : title;
		if (this.allowRerender()) {
			this.reRender();
		}
	},

	/**
	 * Изменяет всплывающее название изображения.
	 * @param {String} title Всплывающее название изображения.
	 */
	setImageTitle: function(title) {
		this.imageTitle = Ext.isEmpty(title, true) ? this.imageTitle : title;
		if (this.allowRerender()) {
			this.reRender();
		}
	},

	/**
	 * Возвращает конфигурацию привязки к модели. Реализует интерфейс миксина {@link Terrasoft.Bindable}.
	 * @overridden
	 */
	getBindConfig: function() {
		var parentBindConfig = this.callParent(arguments);
		var bindConfig = {
			imageSrc: {changeMethod: "setImageSrc"},
			imageTitle: {changeMethod: "setImageTitle"}
		};
		Ext.apply(bindConfig, parentBindConfig);
		return bindConfig;
	}
});